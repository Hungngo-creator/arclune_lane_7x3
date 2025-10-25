import { renderLineupView, type LineupViewHandle } from './view/index.ts';

type UnknownRecord = Record<string, unknown>;

interface LineupDefinitionParams extends UnknownRecord {
  lineups?: unknown;
  roster?: unknown;
  currencies?: unknown;
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

function mergeParams<TValue>(base: TValue | null | undefined, override: TValue | null | undefined): TValue | null {
  if (!base && !override) return null;
  if (!base) return typeof override === 'object' ? { ...(override as UnknownRecord) } as TValue : override ?? null;
  if (!override) return typeof base === 'object' ? { ...(base as UnknownRecord) } as TValue : base ?? null;
  if (
    typeof base === 'object'
    && typeof override === 'object'
    && !Array.isArray(base)
    && !Array.isArray(override)
  ){
    return { ...(base as UnknownRecord), ...(override as UnknownRecord) } as TValue;
  }
  return override ?? null;
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
  const mergedPlayerState = (mergeParams(defParams?.playerState ?? null, params?.playerState ?? null) as UnknownRecord | null) || {};
  const lineups = resolveLineups(defParams, params);
  const roster = mergeParams(defParams?.roster ?? null, params?.roster ?? null);
  const currencies = mergeParams(defParams?.currencies ?? null, params?.currencies ?? null)
    ?? (mergedPlayerState?.currencies as unknown)
    ?? null;
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
