import { renderLineupView } from './view.js';

function mergeParams(base, override){
  if (!base && !override) return null;
  if (!base) return typeof override === 'object' ? { ...override } : override;
  if (!override) return typeof base === 'object' ? { ...base } : base;
  if (
    typeof base === 'object'
    && typeof override === 'object'
    && !Array.isArray(base)
    && !Array.isArray(override)
  ){
    return { ...base, ...override };
  }
  return override;
}

  function resolveLineups(definitionParams, params){
  const base = Array.isArray(definitionParams?.lineups) ? definitionParams.lineups : null;
  const override = Array.isArray(params?.lineups) ? params.lineups : null;
  if (override) return override;
  if (base) return base;
  return [];
}

export function renderLineupScreen(options = {}){
  const { root, shell, definition, params } = options;
  if (!root){
    throw new Error('renderLineupScreen cần một phần tử root hợp lệ.');
  }

  const defParams = definition?.params || null;
  const mergedPlayerState = mergeParams(defParams?.playerState || null, params?.playerState || null) || {};
  const lineups = resolveLineups(defParams, params);
  const roster = mergeParams(defParams?.roster || null, params?.roster || null) || null;
  const currencies = mergeParams(defParams?.currencies || null, params?.currencies || null)
    || mergedPlayerState?.currencies
    || null;
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
    currencies
  });
}

export { renderLineupView };

export default { renderLineupScreen };