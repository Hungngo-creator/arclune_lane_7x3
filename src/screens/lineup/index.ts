import { renderLineupView } from './view/index.ts';
import type { LineupViewHandle } from './view/index.ts';
import type { UnknownRecord } from '@shared-types/common';
import type {
  LineupCurrencies,
  LineupCurrencyConfig,
  LineupCurrencyValue,
} from '@shared-types/currency';
import type { LineupDefinition as LineupDefinitionInput } from '@shared-types/lineup';
import { isLineupCurrencies, normalizeCurrencyBalances } from '@shared-types/currency';

export type { LineupCurrencies } from '@shared-types/currency';

type Mergeable = UnknownRecord | ReadonlyArray<unknown>;

const isUnknownRecord = (value: unknown): value is UnknownRecord => (
  typeof value === 'object'
  && value !== null
  && !Array.isArray(value)
);

const toLineupParams = (value: unknown): LineupScreenDefinitionParams | null => (
  isUnknownRecord(value) ? value as LineupScreenDefinitionParams : null
);

const cloneMergeable = <T extends Mergeable>(value: T): T => {
  if (Array.isArray(value)){
    return value.slice() as T;
  }
  return { ...value } as T;
};

const mergeParams = <T extends Mergeable>(
  base: T | null | undefined,
  override: T | null | undefined,
): T | null => {
  if (!base && !override) return null;
  if (!base) return override ? cloneMergeable(override) : null;
  if (!override) return cloneMergeable(base);
  if (Array.isArray(base) && Array.isArray(override)){
    return cloneMergeable(override);
  }
  if (!Array.isArray(base) && !Array.isArray(override)){
    return { ...base, ...override } as T;
  }
  return cloneMergeable(override);
};

const cloneCurrencyValue = (value: LineupCurrencyValue): LineupCurrencyValue => {
  if (value && typeof value === 'object'){
    return { ...(value as UnknownRecord) };
  }
  return value;
};

const cloneLineupCurrencies = (source: LineupCurrencies): LineupCurrencies => {
  if (Array.isArray(source)){
    return source.map(item => cloneCurrencyValue(item)) as ReadonlyArray<LineupCurrencyValue>;
  }
  const mapSource = source as LineupCurrencyConfig;
  const clone: LineupCurrencyConfig = {};
  Object.entries(mapSource).forEach(([key, value]) => {
    if (key === 'balances'){
      if (value && typeof value === 'object' && !Array.isArray(value)){
        clone.balances = Object.fromEntries(
          Object.entries(value as Record<string, LineupCurrencyValue>).map(([id, entry]) => [
            id,
            cloneCurrencyValue(entry),
          ]),
        );
      } else if (value == null){
        clone.balances = null;
      }
      return;
    }
    if (Array.isArray(value)){
      clone[key] = value.map(item => cloneCurrencyValue(item));
      return;
    }
    if (value && typeof value === 'object'){
      clone[key] = { ...(value as UnknownRecord) };
      return;
    }
    clone[key] = value as LineupCurrencyValue;
  });
  if (!('balances' in clone) && 'balances' in mapSource){
    clone.balances = mapSource.balances ?? null;
  }
  return clone;
};

const toMergeable = (value: unknown): Mergeable | null => {
  if (Array.isArray(value)) return value as ReadonlyArray<unknown>;
  if (isUnknownRecord(value)) return value;
  return null;
};

interface LineupScreenDefinitionParams extends UnknownRecord {
  readonly lineups?: unknown;
  readonly roster?: unknown;
  readonly currencies?: LineupCurrencies | null;
  readonly shortDescription?: string;
  readonly playerState?: UnknownRecord | null;
}

interface LineupScreenDefinition {
  readonly label?: string;
  readonly title?: string;
  readonly description?: string;
  readonly params?: LineupScreenDefinitionParams | null;
}

export interface RenderLineupScreenOptions {
  root: HTMLElement;
  shell?: { enterScreen?: (screenId: string, params?: unknown) => void } | null;
  definition?: LineupScreenDefinition | null;
  params?: LineupScreenDefinitionParams | null;
}

function resolveLineups(
 definitionParams: LineupScreenDefinitionParams | null | undefined,
  params: LineupScreenDefinitionParams | null | undefined,
): ReadonlyArray<LineupDefinitionInput | null | undefined> { 
  const base = Array.isArray(definitionParams?.lineups) ? definitionParams?.lineups : null;
  const override = Array.isArray(params?.lineups) ? params?.lineups : null;
  if (override) return override;
  if (base) return base;
  return [];
}

export function renderLineupScreen(options: RenderLineupScreenOptions): LineupViewHandle {
  const { root, shell = null, definition = null, params = null } = options;
  if (!root){
    throw new Error('renderLineupScreen cần một phần tử root hợp lệ.');
  }

  const defParams = toLineupParams(definition?.params ?? null);
  const normalizedParams = toLineupParams(params);
  const mergedPlayerState = mergeParams<UnknownRecord>(
    defParams?.playerState ?? null,
    normalizedParams?.playerState ?? null,
  ) || {};
  const lineups = resolveLineups(defParams, normalizedParams);
  const roster = mergeParams<Mergeable>(
    toMergeable(defParams?.roster),
    toMergeable(normalizedParams?.roster),
  );
  const baseCurrencies = isLineupCurrencies(defParams?.currencies) ? defParams?.currencies ?? null : null;
  const overrideCurrencies = isLineupCurrencies(normalizedParams?.currencies) ? normalizedParams?.currencies ?? null : null;
  const mergedCurrencySource = mergeParams<LineupCurrencies>(baseCurrencies, overrideCurrencies);
  const playerCurrencySource = normalizeCurrencyBalances(mergedPlayerState);
  const currencies = mergedCurrencySource
    ? cloneLineupCurrencies(mergedCurrencySource)
    : playerCurrencySource
      ? cloneLineupCurrencies(playerCurrencySource)
      : null;
  const description = params?.shortDescription
    ?? defParams?.shortDescription
    ?? definition?.description
    ?? '';

  return renderLineupView({
    root,
    shell,
    definition,
    description,
    lineups,
    roster,
    playerState: mergedPlayerState,
    currencies,
  });
}

export { renderLineupView } from './view/index.ts';