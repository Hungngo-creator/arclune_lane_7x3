import { createPveSession } from './modes/pve/session.js';
import { ensureNestedModuleSupport } from './utils/dummy.js';
export { gameEvents, emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END } from './events.js';

let currentSession = null;

function resolveRoot(config){
  if (!config) return (typeof document !== 'undefined') ? document : null;
  if (config.root) return config.root;
  if (config.rootEl) return config.rootEl;
  if (config.element) return config.element;
  return (typeof document !== 'undefined') ? document : null;
}

export function startGame(options = {}){
  ensureNestedModuleSupport();
  const { root, rootEl, element, ...rest } = options || {};
  const rootTarget = resolveRoot({ root, rootEl, element });
  const initialConfig = { ...rest };
  if (!currentSession){
    currentSession = createPveSession(rootTarget, initialConfig);
}
const startConfig = { ...initialConfig, root: rootTarget };
  return currentSession.start(startConfig);
}

export function stopGame(){
  if (!currentSession) return;
  currentSession.stop();
}

export function updateGameConfig(config = {}){
  if (!currentSession) return;
  currentSession.updateConfig(config);
}

export function getCurrentSession(){
  return currentSession;
}

export function setUnitSkin(unitId, skinKey){
  if (!currentSession) return false;
  return currentSession.setUnitSkin(unitId, skinKey);
}

export function onGameEvent(type, handler){
  if (!currentSession) return ()=>{};
  return currentSession.onEvent(type, handler);
}
