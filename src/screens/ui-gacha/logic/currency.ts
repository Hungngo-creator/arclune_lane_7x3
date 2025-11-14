import {
  type AutoConvertDetail,
  type ConversionResult,
  type CurrencyCode,
  CURRENCY_ORDER,
  type CurrencyConversionStep,
  type PaymentResult,
  type Wallet,
} from './types.ts';
import {
  convertCurrencyAmount,
  type CurrencyId,
} from '../../../utils/currency.ts';

const BASE_TAX: Partial<Record<CurrencyConversionStep, number>> = {
  'VNT->HNT': 0.005,
  'HNT->TNT': 0.01,
  'TNT->ThNT': 0.015,
};

const TAX_CAP = 0.1;
const WEALTH_PIVOT_TT = 100;
const ALPHA = 2;

function cloneWallet(wallet: Wallet): Wallet {
  const normalized: Partial<Wallet> = {};
  for (const code of CURRENCY_ORDER){
    normalized[code] = Math.max(0, Math.trunc(wallet[code] ?? 0));
  }
  return normalized as Wallet;
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
  const highestCurrency = (CURRENCY_ORDER[CURRENCY_ORDER.length - 1] ?? 'TT') as CurrencyId;
  let total = 0;
  for (const code of CURRENCY_ORDER){
    const amount = normalized[code] ?? 0;
    total += convertCurrencyAmount(amount, code as CurrencyId, highestCurrency);
  }
  return total;
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
  const unitCost = convertCurrencyAmount(1, to as CurrencyId, from as CurrencyId);
  if (!Number.isFinite(unitCost) || unitCost <= 0) {
    return { wallet: normalized, units: 0, tax: 0, spent: 0 };
  }
  if (available < unitCost) {
    return { wallet: normalized, units: 0, tax: 0, spent: available };
  }
  const rate = dynamicTaxRate(step, normalized);
  const tax = Math.ceil(available * rate);
  const usable = available - tax;
  if (usable < unitCost) {
    return { wallet: normalized, units: 0, tax, spent: Math.min(available, tax) };
  }
  const units = Math.floor(usable / unitCost);
  if (!units) {
    return { wallet: normalized, units: 0, tax, spent: Math.min(available, tax) };
  }
  const spentWithoutTax = convertCurrencyAmount(units, to as CurrencyId, from as CurrencyId);
  const spent = Math.min(available, Math.trunc(spentWithoutTax + tax));

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
  const amount = convertCurrencyAmount(units, from as CurrencyId, to as CurrencyId);
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
    const availableUnits = Math.min(Math.trunc(amount), normalized[from]);
    if (availableUnits <= 0) {
      return {
        ok: false,
        wallet: normalized,
        tax: 0,
        received: 0,
        spent: 0,
        step: `${from}->${to}` as CurrencyConversionStep,
      };
    }
    const produced = convertCurrencyAmount(availableUnits, from as CurrencyId, to as CurrencyId);
    normalized[from] = Math.max(0, normalized[from] - availableUnits);
    normalized[to] = Math.max(0, normalized[to] + produced);
    return {
      ok: availableUnits >= Math.trunc(amount),
      wallet: normalized,
      tax: 0,
      received: produced,
      spent: availableUnits,
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
    const producedPerUnit = convertCurrencyAmount(1, code as CurrencyId, currency as CurrencyId);
    const shortfall = Math.max(0, cost - available);
    if (producedPerUnit <= 0) {
      continue;
    }
    const neededUnits = Math.ceil(shortfall / producedPerUnit);
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