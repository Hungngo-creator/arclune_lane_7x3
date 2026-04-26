import { ART_SPRITE_EVENT } from '../../engine';
import type { SessionState } from '@shared-types/pve';

type CanvasClickHandler = (event: MouseEvent) => void;

type StartConfigInput = Record<string, unknown>;

type SessionEventBindingsDeps = {
  getDocRef: () => Document | null;
  getWinRef: () => (Window & typeof globalThis) | null;
  getCanvas: () => HTMLCanvasElement | null;
  getCanvasClickHandler: () => CanvasClickHandler | null;
  setCanvasClickHandler: (handler: CanvasClickHandler | null) => void;
  getCanvasMouseMoveHandler: () => ((event: MouseEvent) => void) | null;
  setCanvasMouseMoveHandler: (handler: ((event: MouseEvent) => void) | null) => void;
  getHudCleanup: () => (() => void) | null;
  setHudCleanup: (cleanup: (() => void) | null) => void;
  getResizeHandler: () => (() => void) | null;
  setResizeHandler: (handler: (() => void) | null) => void;
  getVisualViewportResizeHandler: () => (() => void) | null;
  setVisualViewportResizeHandler: (handler: (() => void) | null) => void;
  getVisualViewportScrollHandler: () => (() => void) | null;
  setVisualViewportScrollHandler: (handler: (() => void) | null) => void;
  setViewportResizeDebugState: (state: {
    width: number;
    height: number;
    scale: number;
    offsetTop: number;
    offsetLeft: number;
  } | null) => void;
  cancelScheduledResize: () => void;
  stopSessionLoop: () => void;
  cancelScheduledDraw: () => void;
  setDrawPaused: (paused: boolean) => void;
  scheduleDraw: () => void;
  invalidateSceneCache: () => void;
  onCanvasClick: (event: MouseEvent) => void;
  onCanvasMouseMove: (event: MouseEvent) => void;
  onWindowResize: () => void;
  onViewportResize: () => void;
  onViewportScroll: () => void;
  setCanvas: (next: HTMLCanvasElement | null) => void;
  setContext: (next: CanvasRenderingContext2D | null) => void;
  setHud: (next: unknown | null) => void;
  setLeaderUltControlsHidden: (hidden: boolean) => void;
  clearLeaderUltButtons: () => void;
  setLeaderUltControlsEl: (next: HTMLElement | null) => void;
  setLeaderUltControlsFingerprint: (next: string | null) => void;
  setTimerElement: (next: HTMLElement | null) => void;
  setStatusIconHoverTooltip: (next: string) => void;
  clearStatusIconHitboxes: () => void;
  clearHpBarGradientCache: () => void;
  cleanupSummonBar: () => void;
  destroyAetherPool: () => void;
  cleanupGameState: () => void;
  clearAfterStop: () => void;
  configureRoot: () => void;
  resolveTimerElement: () => void;
  normalizeStartConfig: (config: StartConfigInput) => unknown;
  isRunning: () => boolean;
  resetSessionState: (config: unknown) => void;
  setRunning: (running: boolean) => void;
  initSession: () => boolean;
  isSessionInitialized: () => boolean;
  getSession: () => SessionState | null;
};

type SessionEventBindingsController = {
  bindArtSpriteListener: () => void;
  unbindArtSpriteListener: () => void;
  bindVisibility: () => void;
  unbindVisibility: () => void;
  clearSessionListeners: () => void;
  clearSessionTimers: () => void;
  bindSession: () => void;
  bindRuntimeListeners: () => void;
  resetDomRefs: () => void;
  stopSession: () => void;
  startSession: (config?: StartConfigInput) => SessionState | null;
};

export const createSessionEventBindings = (
  deps: SessionEventBindingsDeps,
): SessionEventBindingsController => {
  let artSpriteHandler: (() => void) | null = null;
  let visibilityHandlerBound = false;

  const handleVisibilityChange = (): void => {
    const doc = deps.getDocRef();
    if (!doc) return;
    deps.setDrawPaused(!!doc.hidden);
  };

  const bindVisibility = (): void => {
    if (visibilityHandlerBound) return;
    const doc = deps.getDocRef();
    if (!doc || typeof doc.addEventListener !== 'function') return;
    doc.addEventListener('visibilitychange', handleVisibilityChange);
    visibilityHandlerBound = true;
  };

  const unbindVisibility = (): void => {
    if (!visibilityHandlerBound) return;
    const doc = deps.getDocRef();
    if (doc && typeof doc.removeEventListener === 'function') {
      doc.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    visibilityHandlerBound = false;
  };

  const bindArtSpriteListener = (): void => {
    const winRef = deps.getWinRef();
    if (!winRef || typeof winRef.addEventListener !== 'function') return;
    if (artSpriteHandler) return;
    artSpriteHandler = () => {
      deps.invalidateSceneCache();
      deps.scheduleDraw();
    };
    winRef.addEventListener(ART_SPRITE_EVENT, artSpriteHandler);
  };

  const unbindArtSpriteListener = (): void => {
    const winRef = deps.getWinRef();
    if (!winRef || !artSpriteHandler || typeof winRef.removeEventListener !== 'function') return;
    winRef.removeEventListener(ART_SPRITE_EVENT, artSpriteHandler);
    artSpriteHandler = null;
  };

  const clearSessionListeners = (): void => {
    const canvas = deps.getCanvas();
    const canvasClickHandler = deps.getCanvasClickHandler();
    if (canvas && canvasClickHandler && typeof canvas.removeEventListener === 'function') {
      canvas.removeEventListener('click', canvasClickHandler);
    }
    const canvasMouseMoveHandler = deps.getCanvasMouseMoveHandler();
    if (canvas && canvasMouseMoveHandler && typeof canvas.removeEventListener === 'function') {
      canvas.removeEventListener('mousemove', canvasMouseMoveHandler);
    }
    deps.setCanvasClickHandler(null);
    deps.setCanvasMouseMoveHandler(null);
    const hudCleanup = deps.getHudCleanup();
    if (typeof hudCleanup === 'function') {
      hudCleanup();
    }
    deps.setHudCleanup(null);
    const winRef = deps.getWinRef();
    const resizeHandler = deps.getResizeHandler();
    if (resizeHandler && winRef && typeof winRef.removeEventListener === 'function') {
      winRef.removeEventListener('resize', resizeHandler);
    }
    deps.setResizeHandler(null);
    const viewport = winRef?.visualViewport;
    if (viewport && typeof viewport.removeEventListener === 'function') {
      const visualViewportResizeHandler = deps.getVisualViewportResizeHandler();
      const visualViewportScrollHandler = deps.getVisualViewportScrollHandler();
      if (visualViewportResizeHandler) {
        viewport.removeEventListener('resize', visualViewportResizeHandler);
      }
      if (visualViewportScrollHandler) {
        viewport.removeEventListener('scroll', visualViewportScrollHandler);
      }
    }
    deps.setVisualViewportResizeHandler(null);
    deps.setVisualViewportScrollHandler(null);
    deps.setViewportResizeDebugState(null);
    deps.cancelScheduledResize();
    unbindArtSpriteListener();
    unbindVisibility();
  };

  const clearSessionTimers = (): void => {
    deps.stopSessionLoop();
    deps.cancelScheduledDraw();
    deps.cancelScheduledResize();
  };

  const bindRuntimeListeners = (): void => {
    const canvas = deps.getCanvas();
    const existingCanvasClickHandler = deps.getCanvasClickHandler();
    if (existingCanvasClickHandler && canvas && typeof canvas.removeEventListener === 'function') {
      canvas.removeEventListener('click', existingCanvasClickHandler);
    }
    const existingCanvasMouseMoveHandler = deps.getCanvasMouseMoveHandler();
    if (existingCanvasMouseMoveHandler && canvas && typeof canvas.removeEventListener === 'function') {
      canvas.removeEventListener('mousemove', existingCanvasMouseMoveHandler);
    }
    const canvasClickHandler: CanvasClickHandler = (event): void => {
      deps.onCanvasClick(event);
    };
    const canvasMouseMoveHandler = (event: MouseEvent): void => {
      deps.onCanvasMouseMove(event);
    };
    deps.setCanvasClickHandler(canvasClickHandler);
    deps.setCanvasMouseMoveHandler(canvasMouseMoveHandler);
    if (canvas && typeof canvas.addEventListener === 'function') {
      canvas.addEventListener('click', canvasClickHandler);
      canvas.addEventListener('mousemove', canvasMouseMoveHandler);
    }

    const winRef = deps.getWinRef();
    const existingResizeHandler = deps.getResizeHandler();
    if (existingResizeHandler && winRef && typeof winRef.removeEventListener === 'function') {
      winRef.removeEventListener('resize', existingResizeHandler);
    }
    const resizeHandler = (): void => {
      deps.onWindowResize();
    };
    deps.setResizeHandler(resizeHandler);
    if (winRef && typeof winRef.addEventListener === 'function') {
      winRef.addEventListener('resize', resizeHandler);
    }

    const viewport = winRef?.visualViewport ?? null;
    const existingViewportResizeHandler = deps.getVisualViewportResizeHandler();
    const existingViewportScrollHandler = deps.getVisualViewportScrollHandler();
    if (viewport && typeof viewport.addEventListener === 'function') {
      if (existingViewportResizeHandler && typeof viewport.removeEventListener === 'function') {
        viewport.removeEventListener('resize', existingViewportResizeHandler);
      }
      if (existingViewportScrollHandler && typeof viewport.removeEventListener === 'function') {
        viewport.removeEventListener('scroll', existingViewportScrollHandler);
      }
      const visualViewportResizeHandler = (): void => {
        deps.onViewportResize();
      };
      const visualViewportScrollHandler = (): void => {
        deps.onViewportScroll();
      };
      deps.setVisualViewportResizeHandler(visualViewportResizeHandler);
      deps.setVisualViewportScrollHandler(visualViewportScrollHandler);
      viewport.addEventListener('resize', visualViewportResizeHandler);
      viewport.addEventListener('scroll', visualViewportScrollHandler);
    }
  };

  const bindSession = (): void => {
    bindArtSpriteListener();
    bindVisibility();
    const doc = deps.getDocRef();
    deps.setDrawPaused(doc ? !!doc.hidden : false);
  };

  const resetDomRefs = (): void => {
    deps.setCanvas(null);
    deps.setContext(null);
    deps.setHud(null);
    deps.setHudCleanup(null);
    deps.setLeaderUltControlsHidden(true);
    deps.clearLeaderUltButtons();
    deps.setLeaderUltControlsEl(null);
    deps.setLeaderUltControlsFingerprint(null);
    deps.setTimerElement(null);
    deps.setStatusIconHoverTooltip('');
    deps.clearStatusIconHitboxes();
    deps.clearHpBarGradientCache();
    deps.invalidateSceneCache();
  };

  const stopSession = (): void => {
    clearSessionTimers();
    clearSessionListeners();
    deps.cleanupSummonBar();
    deps.destroyAetherPool();
    deps.cleanupGameState();
    resetDomRefs();
    deps.clearAfterStop();
  };

  const startSession = (config?: StartConfigInput): SessionState | null => {
    const nextConfig = (typeof config === 'undefined' ? {} : config);
    deps.configureRoot();
    deps.resolveTimerElement();
    const normalizedConfig = deps.normalizeStartConfig(nextConfig);
    if (deps.isRunning()) stopSession();
    deps.resetSessionState(normalizedConfig);
    deps.setRunning(true);
    try {
      const initialized = deps.initSession();
      if (!initialized) {
        stopSession();
        return null;
      }
      if (!deps.isSessionInitialized()) {
        throw new Error('Unable to initialise PvE session');
      }
      bindSession();
      bindRuntimeListeners();
      return deps.getSession();
    } catch (err) {
      deps.setRunning(false);
      stopSession();
      throw err;
    }
  };

  return {
    bindArtSpriteListener,
    unbindArtSpriteListener,
    bindVisibility,
    unbindVisibility,
    clearSessionListeners,
    clearSessionTimers,
    bindSession,
    bindRuntimeListeners,
    resetDomRefs,
    stopSession,
    startSession,
  };
};
