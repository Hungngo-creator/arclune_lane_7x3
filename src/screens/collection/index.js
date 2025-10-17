import { renderCollectionView } from './view.js';

function mergeParams(base, override){
  if (!base && !override) return null;
  if (!base) return typeof override === 'object' ? { ...override } : override;
  if (!override) return typeof base === 'object' ? { ...base } : base;
  if (typeof base === 'object' && typeof override === 'object' && !Array.isArray(base) && !Array.isArray(override)){
    return { ...base, ...override };
  }
return override;
}

export function renderCollectionScreen(options = {}){
  const { root, shell, definition, params } = options;
  if (!root){
    throw new Error('renderCollectionScreen cần một phần tử root hợp lệ.');
  }

const defParams = definition?.params || null;
  const mergedPlayerState = mergeParams(defParams?.playerState || null, params?.playerState || null) || {};
  const rosterSource = mergeParams(defParams?.roster || null, params?.roster || null) || null;
  const currencies = mergeParams(defParams?.currencies || null, params?.currencies || null)
    || mergedPlayerState?.currencies
    || null;

  return renderCollectionView({
    root,
    shell,
    playerState: mergedPlayerState,
    roster: rosterSource,
    currencies
  });
}

export { renderCollectionView } from './view.js';

export default { renderCollectionScreen };