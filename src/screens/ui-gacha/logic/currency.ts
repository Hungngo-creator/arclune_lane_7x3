import {
  type AutoConvertDetail,
  type ConversionResult,
  type CurrencyCode,
  CURRENCY_ORDER,
  type CurrencyConversionStep,
  type PaymentResult,
  type Wallet,
} from './types.ts';

const BASE_TAX: Partial<Record<CurrencyConversionStep, number>> = {
  'VNT->HNT': 0.005,
  'HNT->TNT': 0.01,
  'TNT->ThNT': 0.015,
};

const TAX_CAP = 0.1;
const WEALTH_PIVOT_TT = 100;
const ALPHA = 2;

function cloneWallet(wallet: Wallet): Wallet {
  return {
    VNT: Math.max(0, Math.trunc(wallet.VNT ?? 0)),
    HNT: Math.max(0, Math.trunc(wallet.HNT ?? 0)),
    TNT: Math.max(0, Math.trunc(wallet.TNT ?? 0)),
    ThNT: Math.max(0, Math.trunc(wallet.ThNT ?? 0)),
    TT: Math.max(0, Math.trunc(wallet.TT ?? 0)),
  };
}

function getIndex(code: CurrencyCode): number {
  const idx = CURRENCY_ORDER.indexOf(code);
  return idx === -1 ? 0 : idx;
}

function isHigherTier(from: CurrencyCode, to: CurrencyCode): boolean {
  return getIndex(from) > getIndex(to);
}

function isLowerTier(from: CurrencyCode, to: CurrencyCode): boolean {
  return getIndex(from) < getIndex(to);
}

export function totalTTEquivalent(wallet: Wallet): number {
  const normalized = cloneWallet(wallet);
  const hnt = normalized.VNT / 100;
  const tnt = (normalized.HNT + hnt) / 100;
  const thnt = (normalized.TNT + tnt) / 100;
  return normalized.TT + (normalized.ThNT + thnt) / 100;
}

function dynamicTaxRate(stepKey: CurrencyConversionStep, wallet: Wallet): number {
  const base = BASE_TAX[stepKey] ?? 0.01;
  const wealthIdx = Math.min(1, totalTTEquivalent(wallet) / WEALTH_PIVOT_TT);
  const candidate = base * (1 + ALPHA * wealthIdx);
  return Math.min(TAX_CAP, candidate);
}

function findStepKey(from: CurrencyCode, to: CurrencyCode): CurrencyConversionStep | null {
  if (isLowerTier(from, to)) {
    const higher = `${from}->${to}` as CurrencyConversionStep;
    return higher;
  }
  if (isHigherTier(from, to)) {
    const lower = `${to}->${from}` as CurrencyConversionStep;
    return lower;
  }
  return null;
}

function convertUp(
  wallet: Wallet,
  from: CurrencyCode,
  to: CurrencyCode,
  amount: number,
): { wallet: Wallet; units: number; tax: number; spent: number } {
  const step: CurrencyConversionStep | null = findStepKey(from, to);
  if (!step) {
    return { wallet: cloneWallet(wallet), units: 0, tax: 0, spent: 0 };
  }
  if (to === 'TT') {
    return { wallet: cloneWallet(wallet), units: 0, tax: 0, spent: 0 };
  }

  const normalized = cloneWallet(wallet);
  const available = Math.max(0, Math.trunc(amount));
  if (available < 100) {
    return { wallet: normalized, units: 0, tax: 0, spent: available };
  }
  const rate = dynamicTaxRate(step, normalized);
  const tax = Math.ceil(available * rate);
  const usable = available - tax;
  const units = Math.floor(usable / 100);
  const spent = units * 100 + tax;
  if (!units) {
    return { wallet: normalized, units: 0, tax, spent: tax };
  }

  normalized[from] = Math.max(0, normalized[from] - spent);
  normalized[to] = Math.max(0, normalized[to] + units);
  return { wallet: normalized, units, tax, spent };
}

function convertDown(
  wallet: Wallet,
  from: CurrencyCode,
  to: CurrencyCode,
  units: number,
): { wallet: Wallet; amount: number } {
  const normalized = cloneWallet(wallet);
  if (units <= 0) {
    return { wallet: normalized, amount: 0 };
  }
  const amount = units * 100;
  normalized[from] = Math.max(0, normalized[from] - units);
  normalized[to] = Math.max(0, normalized[to] + amount);
  return { wallet: normalized, amount };
}

export interface ConvertCurrencyOptions {
  readonly allowTax?: boolean;
}

export function convertCurrency(
  wallet: Wallet,
  from: CurrencyCode,
  to: CurrencyCode,
  amount: number,
  options: ConvertCurrencyOptions = {},
): ConversionResult {
  const normalized = cloneWallet(wallet);
  if (amount <= 0) {
    return {
      ok: false,
      wallet: normalized,
      tax: 0,
      received: 0,
      spent: 0,
      step: `${from}->${to}` as CurrencyConversionStep,
    };
  }
  if (from === to) {
    return {
      ok: true,
      wallet: normalized,
      tax: 0,
      received: amount,
      spent: amount,
      step: `${from}->${to}` as CurrencyConversionStep,
    };
  }
  if (isLowerTier(from, to)) {
    if (to === 'TT') {
      return {
        ok: false,
        wallet: normalized,
        tax: 0,
        received: 0,
        spent: 0,
        step: `${from}->${to}` as CurrencyConversionStep,
      };
    }
    if (!options.allowTax && amount % 100 !== 0) {
      return {
        ok: false,
        wallet: normalized,
        tax: 0,
        received: 0,
        spent: 0,
        step: `${from}->${to}` as CurrencyConversionStep,
      };
    }
    const { wallet: nextWallet, units, tax, spent } = convertUp(normalized, from, to, amount);
    return {
      ok: units > 0,
      wallet: nextWallet,
      tax,
      received: units,
      spent,
      step: `${from}->${to}` as CurrencyConversionStep,
    };
  }
  if (isHigherTier(from, to)) {
    let state = cloneWallet(normalized);
    let currentFrom: CurrencyCode = from;
    let currentIndex = getIndex(from);
    const targetIndex = getIndex(to);
    let unitsRemaining = Math.min(Math.trunc(amount), state[currentFrom]);
    let totalAmount = 0;
    while (unitsRemaining > 0 && currentIndex > targetIndex) {
      const nextCode = CURRENCY_ORDER[currentIndex - 1] ?? to;
      const { wallet: nextWallet, amount: produced } = convertDown(state, currentFrom, nextCode, unitsRemaining);
      state = nextWallet;
      totalAmount = produced;
      currentFrom = nextCode;
      currentIndex -= 1;
      unitsRemaining = Math.floor(totalAmount / 100);
    }
    return {
      ok: currentFrom === to,
      wallet: state,
      tax: 0,
      received: totalAmount,
      spent: amount,
      step: `${from}->${to}` as CurrencyConversionStep,
    };
  }
  return {
    ok: false,
    wallet: normalized,
    tax: 0,
    received: 0,
    spent: 0,
    step: `${from}->${to}` as CurrencyConversionStep,
  };
}

export interface PayForRollOptions {
  readonly allowTT?: boolean;
  readonly allowDownFromHigher?: boolean;
}

function convertStepDown(
  wallet: Wallet,
  fromIndex: number,
  toIndex: number,
  units: number,
  detail: AutoConvertDetail[],
): Wallet {
  const initialCode = (CURRENCY_ORDER[fromIndex] ?? CURRENCY_ORDER[CURRENCY_ORDER.length - 1] ?? CURRENCY_ORDER[0]) as CurrencyCode;
  let state = cloneWallet(wallet);
  let currentIndex = fromIndex;
  let carry = Math.min(units, state[initialCode]);
  while (carry > 0 && currentIndex > toIndex) {
    const from: CurrencyCode = CURRENCY_ORDER[currentIndex] ?? initialCode;
    const to = (CURRENCY_ORDER[currentIndex - 1] ?? CURRENCY_ORDER[Math.max(currentIndex - 1, 0)] ?? CURRENCY_ORDER[0]) as CurrencyCode;
    const usable = Math.min(carry, state[from]);
    if (usable <= 0) {
      break;
    }
    const { wallet: next, amount: produced } = convertDown(state, from, to, usable);
    detail.push({ from, to, units: usable, amount: produced });
    state = next;
    carry = produced;
    currentIndex -= 1;
  }
  return state;
}

function ensureFunds(
  wallet: Wallet,
  currency: CurrencyCode,
  cost: number,
  allowTT: boolean,
  detail: AutoConvertDetail[],
): Wallet | null {
  let state = cloneWallet(wallet);
  let available = state[currency];
  if (available >= cost) {
    return state;
  }
  const targetIndex = getIndex(currency);
  for (let idx = targetIndex + 1; idx < CURRENCY_ORDER.length; idx += 1) {
    const code = CURRENCY_ORDER[idx];
    if (!code) {
      continue;
    }
    if (!allowTT && code === 'TT') {
      continue;
    }
    const higherAvailable = state[code];
    if (higherAvailable <= 0) {
      continue;
    }
    const multiplier = 100 ** (idx - targetIndex);
    const shortfall = Math.max(0, cost - available);
    const neededUnits = Math.ceil(shortfall / multiplier);
    if (neededUnits <= 0) {
      continue;
    }
    const unitsToUse = Math.min(higherAvailable, neededUnits);
    state = convertStepDown(state, idx, targetIndex, unitsToUse, detail);
    available = state[currency];
    if (available >= cost) {
      return state;
    }
  }
  return state[currency] >= cost ? state : null;
}

export function payForRoll(
  wallet: Wallet,
  bannerUnit: CurrencyCode,
  cost: number,
  options: PayForRollOptions = {},
): PaymentResult {
  const allowTT = options.allowTT !== false;
  const allowDown = options.allowDownFromHigher !== false;
  const detail: AutoConvertDetail[] = [];
  const normalized = cloneWallet(wallet);
  if (cost <= 0) {
    return {
      ok: true,
      wallet: normalized,
      detail: {
        currency: bannerUnit,
        cost,
        usedDirect: 0,
        conversions: detail,
        usedFromHigher: 0,
        remaining: normalized[bannerUnit],
      },
    };
  }
  let working = cloneWallet(normalized);
  if (allowDown) {
    const ensured = ensureFunds(working, bannerUnit, cost, allowTT, detail);
    if (!ensured) {
      return { ok: false, wallet: normalized, detail: null };
    }
    working = ensured;
  }
  if (working[bannerUnit] < cost) {
    return { ok: false, wallet: normalized, detail: null };
  }
  const usedDirect = Math.min(cost, normalized[bannerUnit]);
  const usedFromHigher = cost - usedDirect;
  working[bannerUnit] -= cost;
  return {
    ok: true,
    wallet: working,
    detail: {
      currency: bannerUnit,
      cost,
      usedDirect,
      conversions: detail,
      usedFromHigher,
      remaining: working[bannerUnit],
    },
  };
}

export { cloneWallet };