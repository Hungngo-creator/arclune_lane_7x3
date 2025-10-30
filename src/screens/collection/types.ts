import type { CurrencyDefinition } from '@shared-types/config';
import type { UnknownRecord } from '@shared-types/common';
import type { LineupCurrencies } from '@shared-types/currency';
import type { RosterEntryLite } from '@shared-types/lineup';

export type { UnknownRecord } from '@shared-types/common';

export type CollectionTabKey = 'awakening' | 'skills' | 'arts' | 'skins' | 'voice';

export interface FilterState {
  activeTab: CollectionTabKey;
  selectedUnitId: string | null;
}

export interface CollectionEntry extends RosterEntryLite {
  cost?: number | null;
}

export interface CollectionDefinitionParams extends UnknownRecord {
  readonly roster?: ReadonlyArray<RosterEntryLite> | null;
  readonly currencies?: LineupCurrencies | null;
  readonly playerState?: UnknownRecord | null;
}

export interface CollectionDefinition {
  readonly label?: string;
  readonly title?: string;
  readonly description?: string;
  readonly params?: CollectionDefinitionParams | null;
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