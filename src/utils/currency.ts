import type { CurrencyDefinition } from '@shared-types/config';

import {
  CURRENCY_ORDER,
  convertCurrency as convertCurrencyInternal,
  formatBalance,
  getCurrency,
  listCurrencies,
  type CurrencyId,
  type FormatBalanceOptions,
} from '../data/economy.ts';

export type { CurrencyId, FormatBalanceOptions };

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
