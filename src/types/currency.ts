//home (termux)/arclune_lane_7x3/src/types/currency.ts
import type { Maybe, NumericLike, UnknownRecord } from './common.ts';y

export interface LineupCurrencyEntry extends UnknownRecord {
  id?: string;
  currencyId?: string;
  key?: string;
  type?: string;
  balance?: Maybe<NumericLike>;
  amount?: Maybe<NumericLike>;
  value?: Maybe<NumericLike>;
  total?: Maybe<NumericLike>;
}

export type LineupCurrencyValue = Maybe<NumericLike> | LineupCurrencyEntry;

export interface LineupCurrencyConfig extends UnknownRecord {
  [key: string]:
    | LineupCurrencyValue
    | ReadonlyArray<LineupCurrencyValue>
    | Readonly<Record<string, LineupCurrencyValue>>
    | null
    | undefined;
}

export type LineupCurrencies = ReadonlyArray<LineupCurrencyValue> | LineupCurrencyConfig;

const isPlainRecord = (value: unknown): value is UnknownRecord => (
  value != null
  && typeof value === 'object'
  && !Array.isArray(value)
);

export const isCurrencyEntry = (value: unknown): value is LineupCurrencyEntry => (
  isPlainRecord(value)
);

const isLineupCurrencyValue = (value: unknown): value is LineupCurrencyValue => (
  value == null
  || typeof value === 'number'
  || typeof value === 'string'
  || isCurrencyEntry(value)
);

export const isLineupCurrencyConfig = (value: unknown): value is LineupCurrencyConfig => (
  isPlainRecord(value)
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
  if (!isPlainRecord(playerState)){
    return null;
  }
  if (!('currencies' in playerState)){
    return null;
  }
  const { currencies } = playerState as { currencies?: unknown };
  return isLineupCurrencies(currencies) ? (currencies ?? null) : null;
};