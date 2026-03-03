//home (termux)/arclune_lane_7x3/src/utils/currency.ts
import type { CurrencyDefinition } from '@shared-types/config';

import {
  CURRENCY_ORDER,
  convertCurrency as convertCurrencyInternal,
  formatBalance,
  getCurrency,
  listCurrencies,
  type CurrencyId,
  type FormatBalanceOptions,
  getInitialWallet,
} from '../data/economy.ts';

export type { CurrencyId, FormatBalanceOptions };

export interface CurrencyWallet {
  [currencyId: string]: number | undefined;
}

type CurrencyWalletListener = (wallet: CurrencyWallet) => void;

export interface SpendAetherResult {
  ok: boolean;
  wallet: CurrencyWallet;
  deducted: Partial<Record<CurrencyId, number>>;
  spentAether: number;
  missingAether: number;
}

const CULTIVATION_SPEND_ORDER: ReadonlyArray<CurrencyId> = ['VNT', 'HNT', 'TNT', 'ThNT'];
let sharedCurrencyWallet: CurrencyWallet | null = null;
const sharedWalletListeners = new Set<CurrencyWalletListener>();

const getCurrencyRatio = (currencyId: CurrencyId): number => {
  const currency = getCurrency(currencyId);
  if (!currency) return 0;
  return Math.max(0, Math.floor(currency.ratioToBase));
};

const distributeAetherToLower = (
  wallet: CurrencyWallet,
  amountAether: number,
  maxIndex: number,
  order: ReadonlyArray<CurrencyId>,
): void => {
  let remaining = amountAether;
  for (let idx = maxIndex; idx >= 0; idx -= 1){
    const currencyId = order[idx];
    if (!currencyId) continue;
    const ratio = getCurrencyRatio(currencyId);
    if (ratio <= 0) continue;
    const units = Math.floor(remaining / ratio);
    if (units <= 0) continue;
    wallet[currencyId] = normalizeWalletValue(wallet[currencyId]) + units;
    remaining -= units * ratio;
  }
};

export function spendAetherWithPriority(
  walletInput: CurrencyWallet,
  costAether: number,
  order: ReadonlyArray<CurrencyId> = CULTIVATION_SPEND_ORDER,
): SpendAetherResult {
  const required = Math.max(0, Math.floor(costAether));
  const wallet: CurrencyWallet = { ...walletInput };
  const deducted: Partial<Record<CurrencyId, number>> = {};

  let totalAether = 0;
  for (const currencyId of order){
    const ratio = getCurrencyRatio(currencyId);
    if (ratio <= 0) continue;
    totalAether += normalizeWalletValue(wallet[currencyId]) * ratio;
    deducted[currencyId] = 0;
  }

  if (totalAether < required){
    return {
      ok: false,
      wallet,
      deducted,
      spentAether: 0,
      missingAether: required - totalAether,
    };
  }

  let remaining = required;
  for (let idx = 0; idx < order.length && remaining > 0; idx += 1){
    const currencyId = order[idx];
    if (!currencyId) continue;
    const ratio = getCurrencyRatio(currencyId);
    if (ratio <= 0) continue;

    let available = normalizeWalletValue(wallet[currencyId]);
    if (available <= 0) continue;

    const directUnits = Math.min(Math.floor(remaining / ratio), available);
    if (directUnits > 0){
      wallet[currencyId] = available - directUnits;
      deducted[currencyId] = (deducted[currencyId] ?? 0) + directUnits;
      remaining -= directUnits * ratio;
      available = normalizeWalletValue(wallet[currencyId]);
    }

    if (remaining > 0 && available > 0){
      wallet[currencyId] = available - 1;
      deducted[currencyId] = (deducted[currencyId] ?? 0) + 1;
      const overpay = ratio - remaining;
      remaining = 0;
      if (overpay > 0 && idx > 0){
        distributeAetherToLower(wallet, overpay, idx - 1, order);
      }
    }
  }

  const spentAether = required - remaining;
  return {
    ok: remaining === 0,
    wallet,
    deducted,
    spentAether,
    missingAether: remaining,
  };
}

export function getCurrencyDefinitions(): ReadonlyArray<CurrencyDefinition> {
  return listCurrencies();
}

export function findCurrencyDefinition(currencyId: string): CurrencyDefinition | null {
  return getCurrency(currencyId);
}

export function getCurrencyOrder(): readonly CurrencyId[] {
  return CURRENCY_ORDER;
}

export function convertCurrencyAmount(value: number, from: CurrencyId, to: CurrencyId): number {
  return convertCurrencyInternal(value, from, to);
}

export function formatCurrencyAmount(
  value: number,
  currencyId: CurrencyId,
  options: FormatBalanceOptions = {},
): string {
  return formatBalance(value, currencyId, options);
}

function normalizeWalletValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function cloneWalletByOrder(source: CurrencyWallet | null | undefined): CurrencyWallet {
  const next: CurrencyWallet = {};
  for (const id of CURRENCY_ORDER){
    next[id] = normalizeWalletValue(source?.[id]);
  }
  return next;
}

function createMergeWallet(source: CurrencyWallet | null | undefined): CurrencyWallet {
  const next: CurrencyWallet = {};
  for (const id of CURRENCY_ORDER){
    const normalized = normalizeWalletValue(source?.[id]);
    if (normalized > 0){
      next[id] = normalized;
    }
  }
  return next;
}

function emitSharedWallet(): void {
  const snapshot = cloneWalletByOrder(sharedCurrencyWallet);
  for (const listener of sharedWalletListeners){
    listener(snapshot);
  }
}

export function createNormalizedWallet(
  ...sources: Array<CurrencyWallet | null | undefined>
): CurrencyWallet {
  const merged: CurrencyWallet = {};
  for (const source of sources){
    for (const id of CURRENCY_ORDER){
      if (!source || source[id] == null) continue;
      merged[id] = normalizeWalletValue(source[id]);
    }
  }
  return cloneWalletByOrder(merged);
}

export function getSharedCurrencyWallet(): CurrencyWallet {
  if (!sharedCurrencyWallet){
    sharedCurrencyWallet = createNormalizedWallet(getInitialWallet());
  }
  return cloneWalletByOrder(sharedCurrencyWallet);
}

export function syncSharedCurrencyWallet(
  wallet: CurrencyWallet,
  options: { merge?: boolean } = {},
): CurrencyWallet {
  const current = getSharedCurrencyWallet();
  sharedCurrencyWallet = options.merge
    ? createNormalizedWallet(current, createMergeWallet(wallet))
    : createNormalizedWallet(wallet);
  emitSharedWallet();
  return cloneWalletByOrder(sharedCurrencyWallet);
}

export function subscribeSharedCurrencyWallet(listener: CurrencyWalletListener): () => void {
  sharedWalletListeners.add(listener);
  listener(getSharedCurrencyWallet());
  return () => {
    sharedWalletListeners.delete(listener);
  };
}