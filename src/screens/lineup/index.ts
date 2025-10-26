import { renderLineupView } from './view/index.ts';
import type { LineupViewHandle } from './view/index.ts';
import type { UnknownRecord } from '../../types/common.ts';
import type {
  LineupCurrencies,
  LineupCurrencyMap,
  LineupCurrencyValue,
} from '../../types/currency.ts';

export type { LineupCurrencies } from '../../types/currency.ts';

type Mergeable = UnknownRecord | ReadonlyArray<unknown>;

const isUnknownRecord = (value: unknown): value is UnknownRecord => (
  typeof value === 'object'
  && value !== null
  && !Array.isArray(value)
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

const isLineupCurrencyValue = (value: unknown): value is LineupCurrencyValue => {
  if (value == null) return true;
  return typeof value === 'number'
    || typeof value === 'string'
    || isUnknownRecord(value);
};

const isLineupCurrencyMap = (value: unknown): value is LineupCurrencyMap => isUnknownRecord(value);

const isLineupCurrencies = (value: unknown): value is LineupCurrencies => {
  if (Array.isArray(value)){
    return value.every(isLineupCurrencyValue);
  }
  return isLineupCurrencyMap(value);
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
  const mapSource = source as LineupCurrencyMap;
  const clone: LineupCurrencyMap = {};
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

interface LineupDefinitionParams extends UnknownRecord {
  lineups?: unknown;
  roster?: unknown;
  currencies?: LineupCurrencies | null;
  shortDescription?: string;
  playerState?: UnknownRecord | null;
}

interface LineupDefinition {
  label?: string;
  title?: string;
  description?: string;
  params?: LineupDefinitionParams | null;
}

export interface RenderLineupScreenOptions {
  root: HTMLElement;
  shell?: { enterScreen?: (screenId: string, params?: unknown) => void } | null;
  definition?: LineupDefinition | null;
  params?: LineupDefinitionParams | null;
}

function resolveLineups(
  definitionParams: LineupDefinitionParams | null | undefined,
  params: LineupDefinitionParams | null | undefined,
): unknown {
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

  const defParams = definition?.params ?? null;
  const mergedPlayerState = mergeParams<UnknownRecord>(
    defParams?.playerState ?? null,
    params?.playerState ?? null,
  ) || {};
  const lineups = resolveLineups(defParams, params);
  const roster = mergeParams<Mergeable>(
    toMergeable(defParams?.roster),
    toMergeable(params?.roster),
  );
  const baseCurrencies = isLineupCurrencies(defParams?.currencies) ? defParams?.currencies ?? null : null;
  const overrideCurrencies = isLineupCurrencies(params?.currencies) ? params?.currencies ?? null : null;
  const mergedCurrencySource = mergeParams<LineupCurrencies>(baseCurrencies, overrideCurrencies);
  const playerCurrencySource = isLineupCurrencies((mergedPlayerState as { currencies?: unknown } | null)?.currencies)
    ? (mergedPlayerState as { currencies?: LineupCurrencies }).currencies ?? null
    : null;
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