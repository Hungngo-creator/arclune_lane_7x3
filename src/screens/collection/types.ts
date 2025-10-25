import type { CurrencyDefinition, RosterUnitDefinition } from '../../types/config.ts';

export type UnknownRecord = Record<string, unknown>;

export type CollectionTabKey = 'awakening' | 'skills' | 'arts' | 'skins' | 'voice';

export interface FilterState {
  activeTab: CollectionTabKey;
  selectedUnitId: string | null;
}

export interface CollectionEntry extends RosterUnitDefinition {
  cost?: number | null;
}

export interface CollectionDefinitionParams extends UnknownRecord {
  roster?: unknown;
  currencies?: unknown;
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
  roster?: unknown;
  currencies?: unknown;
}

export interface CollectionViewHandle {
  destroy(): void;
}

export interface CurrencyBalanceProvider {
  (currencyId: string, providedCurrencies: unknown, playerState: UnknownRecord | null | undefined): number;
}

export type CurrencyCatalog = ReadonlyArray<CurrencyDefinition>;
