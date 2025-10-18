const DEFAULT_SCREEN = 'main-menu';

function cloneState(state){
  return {
    screen: state.screen,
    activeSession: state.activeSession,
    screenParams: state.screenParams
  };
}

export function createAppShell(options = {}){
  const state = {
    screen: options.screen || DEFAULT_SCREEN,
    activeSession: options.activeSession || null,
    screenParams: options.screenParams || null
  };
  const listeners = new Set();
  let errorHandler = typeof options.onError === 'function' ? options.onError : null;

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

  function setSession(nextSession){
    if (state.activeSession === nextSession) return;
    state.activeSession = nextSession || null;
    notify();
  }

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

  return {
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
}

export default createAppShell;