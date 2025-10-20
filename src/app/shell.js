/**
 * @typedef {Record<string, unknown>} ScreenParams
 * @typedef {{ screen: string; activeSession: unknown; screenParams: ScreenParams | null }} AppShellState
 * @typedef {(state: AppShellState) => void} AppShellListener
 * @typedef {{
 *   enterScreen: (key: string, params?: ScreenParams | null) => void;
 *   setActiveSession: (session: unknown) => void;
 *   clearActiveSession: () => void;
 *   getState: () => AppShellState;
 *   onChange: (listener: AppShellListener) => () => void;
 *   setErrorHandler: (handler: ((error: unknown, context: Record<string, unknown> | null) => void) | null) => void;
 * }} AppShell
 */

const DEFAULT_SCREEN = 'main-menu';

/**
 * @param {AppShellState} state
 * @returns {AppShellState}
 */
function cloneState(state){
  return {
    screen: state.screen,
    activeSession: state.activeSession,
    screenParams: state.screenParams
  };
}

/**
 * @param {{ screen?: string; activeSession?: unknown; screenParams?: ScreenParams | null; onError?: (error: unknown, context: Record<string, unknown> | null) => void }} [options]
 * @returns {AppShell}
 */
export function createAppShell(options = {}){
 /** @type {AppShellState} */
  const state = {
    screen: options.screen || DEFAULT_SCREEN,
    activeSession: options.activeSession || null,
    screenParams: options.screenParams || null
  };
  /** @type {Set<AppShellListener>} */
  const listeners = new Set();
  /** @type {((error: unknown, context: Record<string, unknown> | null) => void) | null} */
  let errorHandler = typeof options.onError === 'function' ? options.onError : null;

/**
   * @param {unknown} error
   * @param {Record<string, unknown> | null | undefined} context
   * @returns {void}
   */
function dispatchError(error, context){
    console.error('[shell] listener error', error);
    if (!errorHandler) return;
    try {
      errorHandler(error, context || null);
    } catch (handlerError) {
      console.error('[shell] error handler failure', handlerError);
    }
  }

function notify(){
    const snapshot = cloneState(state);
    for (const fn of listeners){
      try {
        fn(snapshot);
      } catch (err) {
        dispatchError(err, { phase: 'notify', listener: fn });
      }
    }
  }

/**
   * @param {string} [nextScreen]
   * @param {ScreenParams | null | undefined} [params]
   * @returns {void}
   */
function setScreen(nextScreen, params){
    const target = nextScreen || DEFAULT_SCREEN;
    let changed = false;
    if (state.screen !== target){
      state.screen = target;
      changed = true;
    }
    const normalizedParams = params || null;
    if (state.screenParams !== normalizedParams){
      state.screenParams = normalizedParams;
      changed = true;
    }
    if (changed) notify();
  }

/**
   * @param {unknown} nextSession
   * @returns {void}
   */
  function setSession(nextSession){
    if (state.activeSession === nextSession) return;
    state.activeSession = nextSession || null;
    notify();
  }

/**
   * @param {AppShellListener} handler
   * @returns {() => void}
   */
  function subscribe(handler){
    if (typeof handler !== 'function') return ()=>{};
    listeners.add(handler);
    try {
      handler(cloneState(state));
    } catch (err) {
      dispatchError(err, { phase: 'subscribe', listener: handler });
    }
    return ()=>{
      listeners.delete(handler);
    };
  }

  /** @type {AppShell} */
  const api = {
    enterScreen(key, params){
      setScreen(key, params);
    },
    setActiveSession(session){
      setSession(session);
    },
    clearActiveSession(){
      if (!state.activeSession) return;
      state.activeSession = null;
      notify();
    },
    getState(){
      return cloneState(state);
    },
    onChange: subscribe,
    setErrorHandler(handler){
      if (typeof handler === 'function'){
        errorHandler = handler;
      } else {
        errorHandler = null;
      }
    }
  };
  return api;
}

export default createAppShell;