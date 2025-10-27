import type { CurrencyDefinition } from '@types/config';
import type { UnknownRecord } from '@types/common';
import type { LineupCurrencies } from '@types/currency';
import type { RosterEntryLite } from '@types/lineup';

export type { UnknownRecord } from '@types/common';

export type CollectionTabKey = 'awakening' | 'skills' | 'arts' | 'skins' | 'voice';

export interface FilterState {
  activeTab: CollectionTabKey;
  selectedUnitId: string | null;
}

export interface CollectionEntry extends RosterEntryLite {
  cost?: number | null;
}

export interface CollectionDefinitionParams extends UnknownRecord {
  roster?: ReadonlyArray<RosterEntryLite> | null;
  currencies?: LineupCurrencies | null;
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
  roster?: ReadonlyArray<RosterEntryLite> | null;
  currencies?: LineupCurrencies | null;
}

export interface CollectionViewHandle {
  destroy(): void;
}

export interface CurrencyBalanceProvider {
  (
    currencyId: string,
    providedCurrencies: LineupCurrencies | null | undefined,
    playerState: UnknownRecord | null | undefined,
  ): number;
}

export type CurrencyCatalog = ReadonlyArray<CurrencyDefinition>;