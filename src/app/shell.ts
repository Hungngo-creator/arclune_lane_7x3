export type ScreenParams = Record<string, unknown>;

export interface AppShellState {
  screen: string;
  activeSession: unknown | null;
  screenParams: ScreenParams | null;
}

export type AppShellListener = (state: Readonly<AppShellState>) => void;

export type AppShellErrorHandler = (
  error: unknown,
  context: Record<string, unknown> | null
) => void;

export interface AppShell {
  enterScreen: (key: string, params?: ScreenParams | null) => void;
  setActiveSession: (session: unknown | null) => void;
  clearActiveSession: () => void;
  getState: () => Readonly<AppShellState>;
  onChange: (listener: AppShellListener) => () => void;
  setErrorHandler: (handler: AppShellErrorHandler | null) => void;
}

export interface CreateAppShellOptions {
  screen?: string | null;
  activeSession?: unknown | null;
  screenParams?: ScreenParams | null;
  onError?: AppShellErrorHandler | null;
}

const DEFAULT_SCREEN = 'main-menu';

function cloneState(state: AppShellState): Readonly<AppShellState> {
  return {
    screen: state.screen,
    activeSession: state.activeSession,
    screenParams: state.screenParams,
  };
}

function normalizeScreen(screen: string | null | undefined): string {
  if (screen === null || screen === undefined || screen === '') {
    return DEFAULT_SCREEN;
  }
  return screen;
}

function normalizeParams(params: ScreenParams | null | undefined): ScreenParams | null {
  if (params === null || params === undefined) {
    return null;
  }
  return params;
}

function normalizeSession(session: unknown | null | undefined): unknown | null {
  if (session === null || session === undefined) {
    return null;
  }
  return session;
}

export function createAppShell(options: CreateAppShellOptions = {}): AppShell {
  const initialScreen = normalizeScreen(options.screen);
  const initialSession = normalizeSession(options.activeSession ?? null);
  const initialParams = normalizeParams(options.screenParams);

  const state: AppShellState = {
    screen: initialScreen,
    activeSession: initialSession,
    screenParams: initialParams,
  };

  const listeners = new Set<AppShellListener>();

  let errorHandler: AppShellErrorHandler | null =
    typeof options.onError === 'function' ? options.onError : null;

  function dispatchError(
    error: unknown,
    context: Record<string, unknown> | null | undefined
  ): void {
    console.error('[shell] listener error', error);
    if (!errorHandler) {
      return;
    }

    const normalizedContext = context ?? null;

    try {
      errorHandler(error, normalizedContext);
    } catch (handlerError) {
      console.error('[shell] error handler failure', handlerError);
    }
  }

  function notify(): void {
    const snapshot = cloneState(state);
    for (const fn of listeners) {
      try {
        fn(snapshot);
      } catch (err) {
        dispatchError(err, { phase: 'notify', listener: fn });
      }
    }
  }

  function setScreen(nextScreen?: string | null, params?: ScreenParams | null): void {
    const target = normalizeScreen(nextScreen);
    let changed = false;

    if (state.screen !== target) {
      state.screen = target;
      changed = true;
    }

    const normalizedParams = normalizeParams(params);

    if (state.screenParams !== normalizedParams) {
      state.screenParams = normalizedParams;
      changed = true;
    }

    if (changed) {
      notify();
    }
  }

  function setSession(nextSession: unknown | null | undefined): void {
    const normalizedSession = normalizeSession(nextSession);

    if (state.activeSession === normalizedSession) {
      return;
    }

    state.activeSession = normalizedSession;
    notify();
  }

  function subscribe(handler: AppShellListener): () => void {
    if (typeof handler !== 'function') {
      return () => undefined;
    }

    listeners.add(handler);

    try {
      handler(cloneState(state));
    } catch (err) {
      dispatchError(err, { phase: 'subscribe', listener: handler });
    }

    return () => {
      listeners.delete(handler);
    };
  }

  const api: AppShell = {
    enterScreen(key, params) {
      setScreen(key, params);
    },
    setActiveSession(session) {
      setSession(session);
    },
    clearActiveSession() {
      if (state.activeSession === null) {
        return;
      }

      state.activeSession = null;
      notify();
    },
    getState() {
      return cloneState(state);
    },
    onChange: subscribe,
    setErrorHandler(handler) {
      if (typeof handler === 'function') {
        errorHandler = handler;
      } else {
        errorHandler = null;
      }
    },
  };

  return api;
    }
