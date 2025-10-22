import { createPveSession } from './modes/pve/session.ts';
import { ensureNestedModuleSupport } from './utils/dummy.js';
export { gameEvents, emitGameEvent, dispatchGameEvent, addGameEventListener, TURN_START, TURN_END, ACTION_START, ACTION_END, TURN_REGEN, BATTLE_END } from './events.ts';

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
  const session = currentSession.start(startConfig);
  if (!session){
    throw new Error('PvE board markup not found; render the layout before calling startGame');
  }
  return session;
}

export function stopGame(){
  if (!currentSession) return;
  currentSession.stop();
  currentSession = null;
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
