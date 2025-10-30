import { renderCollectionView } from './view.ts';
import type { CollectionViewHandle } from './view.ts';
import type {
  CollectionDefinition,
  CollectionDefinitionParams,
  CollectionScreenParams,
  UnknownRecord,
} from './types.ts';
import type { RosterEntryLite } from '@shared-types/lineup';
import type { LineupCurrencies } from '@shared-types/currency';
import { isLineupCurrencies, normalizeCurrencyBalances } from '@shared-types/currency';

type Mergeable<TValue> = TValue | null | undefined;

const isUnknownRecord = (value: unknown): value is UnknownRecord => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const toClonedRecord = (value: UnknownRecord): UnknownRecord => ({ ...value });

function mergeParams<TValue>(base: Mergeable<TValue>, override: Mergeable<TValue>): TValue | null{
  if (!base && !override) return null;
  if (!base){
    if (isUnknownRecord(override)){
      return toClonedRecord(override) as TValue;
    }
    return override ?? null;
  }
  if (!override){
    if (isUnknownRecord(base)){
      return toClonedRecord(base as unknown as UnknownRecord) as TValue;
    }
    return base ?? null;
  }
  if (isUnknownRecord(base) && isUnknownRecord(override)){
    return { ...base, ...override } as TValue;
  }
  return override ?? null;
}

const toCollectionParams = (value: unknown): CollectionDefinitionParams | null => (
  isUnknownRecord(value) ? value as CollectionDefinitionParams : null
);

function mergePlayerState(
  definitionParams: CollectionDefinitionParams | null | undefined,
  params: CollectionDefinitionParams | null | undefined,
): UnknownRecord{
  const merged = mergeParams<UnknownRecord>(definitionParams?.playerState ?? null, params?.playerState ?? null);
  return merged ?? {};
}

function resolveRoster(
  definitionParams: CollectionDefinitionParams | null | undefined,
  params: CollectionDefinitionParams | null | undefined,
): ReadonlyArray<RosterEntryLite> {
  const override = Array.isArray(params?.roster) ? params.roster : null;
  const base = Array.isArray(definitionParams?.roster) ? definitionParams.roster : null;
  return override ?? base ?? [];
}

function resolveCurrencies(
  definitionParams: CollectionDefinitionParams | null | undefined,
  params: CollectionDefinitionParams | null | undefined,
  playerState: UnknownRecord,
): LineupCurrencies | null {
  const override = params?.currencies;
  if (isLineupCurrencies(override)){
    return override ?? null;
  }
  const base = definitionParams?.currencies;
  if (isLineupCurrencies(base)){
    return base ?? null;
  }
  return normalizeCurrencyBalances(playerState);
}

export function renderCollectionScreen(options: CollectionScreenParams): CollectionViewHandle{
  const {
    root,
    shell = null,
    definition = null,
    params = null,
  } = options;
  if (!root){
    throw new Error('renderCollectionScreen cần một phần tử root hợp lệ.');
  }

  const definitionParams = toCollectionParams(definition?.params ?? null);
  const normalizedParams = toCollectionParams(params);
  const playerState = mergePlayerState(definitionParams, normalizedParams);
  const roster = resolveRoster(definitionParams, normalizedParams);
  const currencies = resolveCurrencies(definitionParams, normalizedParams, playerState);

  return renderCollectionView({
    root,
    shell,
    definition,
    playerState,
    roster,
    currencies,
  });
}

export { renderCollectionView } from './view.ts';