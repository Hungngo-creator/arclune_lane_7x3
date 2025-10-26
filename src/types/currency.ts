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

export interface LineupCurrencyMap {
  balances?: Readonly<Record<string, LineupCurrencyValue>> | null;
  [key: string]:
    | LineupCurrencyValue
    | ReadonlyArray<LineupCurrencyValue>
    | Readonly<Record<string, LineupCurrencyValue>>
    | null
    | undefined;
}

export type LineupCurrencies = ReadonlyArray<LineupCurrencyValue> | LineupCurrencyMap;
