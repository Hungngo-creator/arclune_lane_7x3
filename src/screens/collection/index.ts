import { renderCollectionView } from './view.ts';
import type { CollectionViewHandle } from './view.ts';
import type {
  CollectionDefinition,
  CollectionDefinitionParams,
  CollectionScreenParams,
  UnknownRecord,
} from './types.ts';
import type { RosterEntryLite } from '../../types/lineup.ts';
import type { LineupCurrencies } from '../../types/currency.ts';
import { isLineupCurrencies, normalizeCurrencyBalances } from '../../types/currency.ts';

type Mergeable<TValue> = TValue | null | undefined;

type MaybeRecord = Record<string, unknown>;

function mergeParams<TValue>(base: Mergeable<TValue>, override: Mergeable<TValue>): TValue | null{
  if (!base && !override) return null;
  if (!base) return typeof override === 'object' ? { ...(override as MaybeRecord) } as TValue : override ?? null;
  if (!override) return typeof base === 'object' ? { ...(base as MaybeRecord) } as TValue : base ?? null;
  if (
    typeof base === 'object'
    && typeof override === 'object'
    && !Array.isArray(base)
    && !Array.isArray(override)
  ){
    return { ...(base as MaybeRecord), ...(override as MaybeRecord) } as TValue;
  }
  return override ?? null;
}

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

  const definitionParams: CollectionDefinition['params'] = definition?.params ?? null;
  const playerState = mergePlayerState(definitionParams, params);
  const roster = resolveRoster(definitionParams, params);
  const currencies = resolveCurrencies(definitionParams, params, playerState);

  return renderCollectionView({
    root,
    shell,
    definition,
    playerState,
    roster,
    currencies,
  });
}

export { renderCollectionView };
export { renderCollectionScreen };