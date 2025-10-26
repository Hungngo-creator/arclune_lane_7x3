import type { CurrencyDefinition } from '../../types/config.ts';
import type { UnknownRecord } from '../../types/common.ts';
import type { LineupCurrencies, LineupCurrencyValue } from '../../types/currency.ts';
import type { RosterEntry } from '../../catalog.ts';

export type { UnknownRecord } from '../../types/common.ts';

export type CollectionTabKey = 'awakening' | 'skills' | 'arts' | 'skins' | 'voice';

export interface FilterState {
  activeTab: CollectionTabKey;
  selectedUnitId: string | null;
}

export interface CollectionEntry extends RosterEntry {
  cost?: number | null;
}

export interface CollectionDefinitionParams extends UnknownRecord {
  roster?: ReadonlyArray<RosterEntry | CollectionEntry> | null;
  currencies?: LineupCurrencies | ReadonlyArray<LineupCurrencyValue> | null;
  playerState?: UnknownRecord | null;
}

export interface CollectionDefinition {
  label?: string;
  title?: string;
  description?: string;
  params?: CollectionDefinitionParams | null;
}

export interface CollectionScreenParams {
  root: HTMLElement;
  shell?: {
    enterScreen?: (screenId: string, params?: unknown) => void;
  } | null;
  definition?: CollectionDefinition | null;
  params?: CollectionDefinitionParams | null;
}

export interface CollectionViewOptions {
  root: HTMLElement;
  shell?: CollectionScreenParams['shell'];
  definition?: CollectionDefinition | null;
  playerState?: UnknownRecord;
  roster?: ReadonlyArray<RosterEntry | CollectionEntry> | null;
  currencies?: LineupCurrencies | ReadonlyArray<LineupCurrencyValue> | null;
}

export interface CollectionViewHandle {
  destroy(): void;
}

export interface CurrencyBalanceProvider {
  (currencyId: string, providedCurrencies: unknown, playerState: UnknownRecord | null | undefined): number;
}

export type CurrencyCatalog = ReadonlyArray<CurrencyDefinition>;