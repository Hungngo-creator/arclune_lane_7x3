export type FrameHandle = number | ReturnType<typeof setTimeout>;

type RequestAnimationFrameFn = ((callback: FrameRequestCallback) => number) | null;
type CancelAnimationFrameFn = ((handle: number) => void) | null;

type ViewportResizeDebugState = {
  width: number;
  height: number;
  scale: number;
  offsetTop: number;
  offsetLeft: number;
};

type SessionRenderControllerDeps = {
  getCanvas: () => HTMLCanvasElement | null;
  getContext: () => CanvasRenderingContext2D | null;
  drawNow: () => void;
  onDrawError: (error: unknown) => void;
  shouldKeepDrawing: () => boolean;
  onResize: () => void;
  onResizeError: (error: unknown) => void;
  getRequestAnimationFrame: () => RequestAnimationFrameFn;
  getCancelAnimationFrame: () => CancelAnimationFrameFn;
  getWindowRef: () => (Window & typeof globalThis) | null;
  getViewportResizeDebugState: () => ViewportResizeDebugState | null;
  setViewportResizeDebugState: (state: ViewportResizeDebugState | null) => void;
  isAetherDebugEnabled: () => boolean;
};

type SessionRenderController = {
  cancelScheduledDraw: () => void;
  scheduleDraw: () => void;
  cancelScheduledResize: () => void;
  scheduleResize: () => void;
  scheduleViewportResizeIfChanged: (reason: 'resize' | 'scroll') => void;
  setDrawPaused: (paused: boolean) => void;
};

const toAnimationFrameHandle = (handle: FrameHandle): number | null => (
  typeof handle === 'number' ? handle : null
);

export const createSessionRenderController = (
  deps: SessionRenderControllerDeps,
): SessionRenderController => {
  let drawFrameHandle: FrameHandle | null = null;
  let drawFrameUsesTimeout = false;
  let drawPending = false;
  let drawPaused = false;

  let resizeSchedulerHandle: FrameHandle | null = null;
  let resizeSchedulerUsesTimeout = false;
  let pendingResize = false;

  const cancelScheduledDraw = (): void => {
    if (drawFrameHandle !== null){
      if (drawFrameUsesTimeout){
        clearTimeout(drawFrameHandle);
      } else {
        const cancel = deps.getCancelAnimationFrame();
        const frameHandle = toAnimationFrameHandle(drawFrameHandle);
        if (typeof cancel === 'function' && frameHandle !== null){
          cancel(frameHandle);
        }
      }
      drawFrameHandle = null;
      drawFrameUsesTimeout = false;
    }
    drawPending = false;
  };

  const scheduleDraw = (): void => {
    if (drawPaused) return;
    if (drawPending) return;
    if (!deps.getCanvas() || !deps.getContext()) return;
    drawPending = true;
    const raf = deps.getRequestAnimationFrame();
    const runDrawFrame = (): void => {
      drawFrameHandle = null;
      drawFrameUsesTimeout = false;
      drawPending = false;
      if (drawPaused) return;
      try {
        deps.drawNow();
      } catch (err) {
        deps.onDrawError(err);
      }
      if (deps.shouldKeepDrawing()) scheduleDraw();
    };
    if (raf){
      drawFrameUsesTimeout = false;
      drawFrameHandle = raf(runDrawFrame);
    } else {
      drawFrameUsesTimeout = true;
      drawFrameHandle = setTimeout(runDrawFrame, 16);
    }
  };

  const cancelScheduledResize = (): void => {
    if (resizeSchedulerHandle !== null){
      if (resizeSchedulerUsesTimeout){
        clearTimeout(resizeSchedulerHandle);
      } else {
        const cancel = deps.getCancelAnimationFrame();
        const frameHandle = toAnimationFrameHandle(resizeSchedulerHandle);
        if (typeof cancel === 'function' && frameHandle !== null){
          cancel(frameHandle);
        }
      }
      resizeSchedulerHandle = null;
      resizeSchedulerUsesTimeout = false;
    }
    pendingResize = false;
  };

  const flushScheduledResize = (): void => {
    resizeSchedulerHandle = null;
    resizeSchedulerUsesTimeout = false;
    pendingResize = false;
    try {
      deps.onResize();
      scheduleDraw();
    } catch (err) {
      deps.onResizeError(err);
    }
  };

  const scheduleResize = (): void => {
    if (pendingResize) return;
    pendingResize = true;
    const raf = deps.getRequestAnimationFrame();
    if (raf){
      resizeSchedulerUsesTimeout = false;
      resizeSchedulerHandle = raf(flushScheduledResize);
    } else {
      resizeSchedulerUsesTimeout = true;
      resizeSchedulerHandle = setTimeout(flushScheduledResize, 32);
    }
  };

  const scheduleViewportResizeIfChanged = (reason: 'resize' | 'scroll'): void => {
    const viewport = deps.getWindowRef()?.visualViewport;
    if (!viewport) {
      scheduleResize();
      return;
    }
    const nextState = {
      width: Number.isFinite(viewport.width) ? viewport.width : 0,
      height: Number.isFinite(viewport.height) ? viewport.height : 0,
      scale: Number.isFinite(viewport.scale) ? viewport.scale : 1,
      offsetTop: Number.isFinite(viewport.offsetTop) ? viewport.offsetTop : 0,
      offsetLeft: Number.isFinite(viewport.offsetLeft) ? viewport.offsetLeft : 0,
    };

    const prev = deps.getViewportResizeDebugState();
    deps.setViewportResizeDebugState(nextState);
    if (!prev) {
      scheduleResize();
      return;
    }

    const widthChanged = Math.abs(nextState.width - prev.width) >= 1;
    const heightChanged = Math.abs(nextState.height - prev.height) >= 1;
    const scaleChanged = Math.abs(nextState.scale - prev.scale) >= 0.01;
    const offsetChanged = Math.abs(nextState.offsetTop - prev.offsetTop) >= 1
      || Math.abs(nextState.offsetLeft - prev.offsetLeft) >= 1;

    if (deps.isAetherDebugEnabled() && reason === 'scroll' && (heightChanged || scaleChanged || offsetChanged)) {
      console.debug('[aether-debug][viewport-scroll]', {
        widthChanged,
        heightChanged,
        scaleChanged,
        offsetChanged,
        prev,
        next: nextState,
      });
    }

    if (widthChanged || heightChanged || scaleChanged || reason === 'resize') {
      scheduleResize();
      return;
    }

    const winRef = deps.getWindowRef();
    const debugEnabled = !!(winRef && (winRef as unknown as { __ARC_DEBUG_VIEWPORT__?: boolean }).__ARC_DEBUG_VIEWPORT__);
    if (debugEnabled && reason === 'scroll' && typeof console !== 'undefined' && typeof console.debug === 'function'){
      console.debug('[pve][viewport-scroll] skip resize: size unchanged', {
        width: nextState.width,
        height: nextState.height,
        scale: nextState.scale,
        offsetTop: nextState.offsetTop,
        offsetLeft: nextState.offsetLeft,
      });
    }
  };

  const setDrawPaused = (paused: boolean): void => {
    drawPaused = !!paused;
    if (drawPaused){
      cancelScheduledDraw();
    } else {
      scheduleDraw();
    }
  };

  return {
    cancelScheduledDraw,
    scheduleDraw,
    cancelScheduledResize,
    scheduleResize,
    scheduleViewportResizeIfChanged,
    setDrawPaused,
  };
};
