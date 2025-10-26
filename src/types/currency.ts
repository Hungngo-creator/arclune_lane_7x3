import type { UnknownRecord } from './common.ts';

export interface LineupCurrencyEntry extends UnknownRecord {
  id?: string;
  currencyId?: string;
  key?: string;
  type?: string;
  balance?: number | string | null;
  amount?: number | string | null;
  value?: number | string | null;
  total?: number | string | null;
}

export type LineupCurrencyValue = number | string | null | undefined | LineupCurrencyEntry;

export interface LineupCurrencyConfig extends UnknownRecord {
  [key: string]:
    | LineupCurrencyValue
    | ReadonlyArray<LineupCurrencyValue>
    | Readonly<Record<string, LineupCurrencyValue>>
    | null
    | undefined;
}

export type LineupCurrencies = ReadonlyArray<LineupCurrencyValue> | LineupCurrencyConfig;

const isLineupCurrencyEntry = (value: unknown): value is LineupCurrencyEntry => (
  value != null
  && typeof value === 'object'
  && !Array.isArray(value)
);

const isLineupCurrencyValue = (value: unknown): value is LineupCurrencyValue => (
  value == null
  || typeof value === 'number'
  || typeof value === 'string'
  || isLineupCurrencyEntry(value)
);

export const isLineupCurrencyConfig = (value: unknown): value is LineupCurrencyConfig => (
  value != null
  && typeof value === 'object'
  && !Array.isArray(value)
);

export const isLineupCurrencies = (value: unknown): value is LineupCurrencies => {
  if (Array.isArray(value)){
    return value.every(isLineupCurrencyValue);
  }
  return isLineupCurrencyConfig(value);
};

export const normalizeCurrencyBalances = (
  playerState: UnknownRecord | null | undefined,
): LineupCurrencies | null => {
  if (!playerState || typeof playerState !== 'object'){
    return null;
  }
  if (!('currencies' in playerState)){
    return null;
  }
  const { currencies } = playerState as { currencies?: unknown };
  return isLineupCurrencies(currencies) ? (currencies ?? null) : null;
};