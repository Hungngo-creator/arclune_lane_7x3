import { describe, it, beforeEach, afterEach, expect, jest } from '@jest/globals';
import loaderModule from './helpers/pve-session-loader.js';

const { loadSessionModule, clearModuleCache, stubModules } = loaderModule;

const TIME_MODULE_KEY = './utils/time.js';
const TURNS_MODULE_KEY = './turns.ts';

describe('PvE RAF fallback khi thiếu performance.now()', () => {
  const originalPerformance = global.performance;
  const originalDateNow = Date.now;
  const originalRequestAnimationFrame = global.requestAnimationFrame;
  const originalCancelAnimationFrame = global.cancelAnimationFrame;
  const originalTimeModule = stubModules.get(TIME_MODULE_KEY);
  const originalTurnsModule = stubModules.get(TURNS_MODULE_KEY);
  const configModule = stubModules.get('./config.js');

  let currentTime;
  let usePerfNow;
  let perfNowValue;
  let perfNowMock;
  let safeNowStub;
  let sessionNowStub;
  let stepTurnSpy;
  let rafCallbacks;
  let view;
  let freezeRafTimestamp;
  let frozenRafValue;
  let setSessionOffset;

  beforeEach(() => {
    clearModuleCache();
    currentTime = 0;
    Date.now = jest.fn(() => currentTime);
   
    usePerfNow = false;
    perfNowValue = 0;
    perfNowMock = jest.fn(() => perfNowValue);

    let lastFallbackNow = 0;
    let sessionOffset = 0;
    setSessionOffset = (value) => {
      sessionOffset = value;
    };
    let sessionReady = false;
    let rafOffset = null;
    freezeRafTimestamp = false;
    frozenRafValue = null;

    const safeNowImpl = (): number => {
      if (usePerfNow) {
        return perfNowMock();
      }
      const current = Date.now();
      if (current <= lastFallbackNow) {
        lastFallbackNow += 1;
        return lastFallbackNow;
      }
      lastFallbackNow = current;
      return lastFallbackNow;
    };

    safeNowStub = jest.fn(() => safeNowImpl());

    const resetSessionTimeBaseImpl = (): void => {
      const now = safeNowStub();
      let offset = 0;
      if (usePerfNow && global.performance && typeof global.performance.now === 'function'){
        const originRaw = global.performance.timeOrigin;
        if (typeof originRaw === 'number' && Number.isFinite(originRaw)){
          offset = originRaw;
        } else {
          offset = Date.now() - now;
        }
      }
      sessionOffset = offset;
      sessionReady = true;
      rafOffset = null;
    };

    const resetSessionTimeBaseStub = jest.fn(() => { resetSessionTimeBaseImpl(); });

    const ensureSessionBase = (): void => {
      if (!sessionReady) resetSessionTimeBaseStub();
    };

    sessionNowStub = jest.fn(() => {
      ensureSessionBase();
      return safeNowStub() + sessionOffset;
    });

    const toSessionTimeStub = jest.fn((value) => {
      ensureSessionBase();
      if (!Number.isFinite(value)) return sessionNowStub();
      return Number(value) + sessionOffset;
    });

    const normalizeAnimationFrameTimestampStub = jest.fn((timestamp) => {
      ensureSessionBase();
      const fallback = sessionNowStub();
      if (!Number.isFinite(timestamp)) return fallback;
      const numeric = Number(timestamp);
      if (freezeRafTimestamp){
        if (!Number.isFinite(frozenRafValue)){
          frozenRafValue = fallback;
        }
        return frozenRafValue;
      }
      if (rafOffset === null){
        rafOffset = fallback - numeric;
        return fallback;
      }
      return numeric + rafOffset;
    });

    const mergeBusyUntilStub = jest.fn((previous, startedAt, duration) => {
      ensureSessionBase();
      const start = Number.isFinite(startedAt) ? startedAt : sessionNowStub();
      const dur = Number.isFinite(duration) ? Math.max(0, Number(duration)) : 0;
      const prev = Number.isFinite(previous) ? Number(previous) : start;
      return Math.max(prev, start + dur);
    });

    stubModules.set(TIME_MODULE_KEY, {
      safeNow: safeNowStub,
      sessionNow: sessionNowStub,
      toSessionTime: toSessionTimeStub,
      normalizeAnimationFrameTimestamp: normalizeAnimationFrameTimestampStub,
      mergeBusyUntil: mergeBusyUntilStub,
      resetSessionTimeBase: resetSessionTimeBaseStub,
    });

    const turnsModule = { ...originalTurnsModule };
    stepTurnSpy = jest.fn(() => {});
    turnsModule.stepTurn = stepTurnSpy;
    turnsModule.doActionOrSkip = jest.fn();
    stubModules.set(TURNS_MODULE_KEY, turnsModule);

    global.performance = undefined;
    global.requestAnimationFrame = undefined;
    global.cancelAnimationFrame = undefined;

    rafCallbacks = [];
    if (configModule?.CFG){
      if (!configModule.CFG.ANIMATION){
        configModule.CFG.ANIMATION = {};
      }
      configModule.CFG.ANIMATION.turnIntervalMs = 600;
    }
    view = {
      requestAnimationFrame: jest.fn((cb) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      }),
      cancelAnimationFrame: jest.fn(),
      devicePixelRatio: 1,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      visualViewport: null,
    };
  });

  afterEach(() => {
    Date.now = originalDateNow;
    global.performance = originalPerformance;
    global.requestAnimationFrame = originalRequestAnimationFrame;
    global.cancelAnimationFrame = originalCancelAnimationFrame;
    stubModules.set(TIME_MODULE_KEY, originalTimeModule);
    stubModules.set(TURNS_MODULE_KEY, originalTurnsModule);
    clearModuleCache();
    setSessionOffset = null;
  });

  it('tiếp tục kích hoạt lượt đánh với requestAnimationFrame', () => {
    const boardContext = {
      canvas: null,
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      scale: jest.fn(),
      clearRect: jest.fn(),
      drawImage: jest.fn(),
    };
    const board = {
      width: 700,
      height: 600,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getContext: jest.fn(() => boardContext),
      getBoundingClientRect: jest.fn(() => ({ left: 0, top: 0 })),
    };
    boardContext.canvas = board;

    const timerEl = { textContent: '' };

    const documentStub = {
      querySelector: jest.fn((selector) => {
        if (selector === '#board') return board;
        if (selector === '#timer') return timerEl;
        return null;
      }),
      getElementById: jest.fn((id) => {
        if (id === 'board') return board;
        if (id === 'timer') return timerEl;
        return null;
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      defaultView: view,
      hidden: false,
    };
    const root = {
      ownerDocument: documentStub,
      querySelector: (selector) => documentStub.querySelector(selector),
    };
    board.ownerDocument = documentStub;

    const sessionModule = loadSessionModule();
    const { createPveSession, __getActiveGame } = sessionModule;

    const session = createPveSession(root);
    const game = session.start();

    expect(game).not.toBeNull();
    expect(__getActiveGame()).toBe(game);
    expect(safeNowStub).toHaveBeenCalled();
    expect(view.requestAnimationFrame).toHaveBeenCalled();
    expect(rafCallbacks.length).toBeGreaterThan(0);

    const firstNow = safeNowStub.mock.results[0]?.value ?? 0;
    currentTime = firstNow + 800;

    if (game?.turn) {
      game.turn.busyUntil = 0;
    }

    const tick = rafCallbacks.shift();
    expect(typeof tick).toBe('function');

    tick?.(5);

    expect(stepTurnSpy).toHaveBeenCalled();

    session.stop();
  });
  it('updateTimerAndCost chạy nhiều vòng vẫn kích hoạt stepTurn', () => {
    const boardContext = {
      canvas: null,
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      scale: jest.fn(),
      clearRect: jest.fn(),
      drawImage: jest.fn(),
    };
    const board = {
      width: 700,
      height: 600,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getContext: jest.fn(() => boardContext),
      getBoundingClientRect: jest.fn(() => ({ left: 0, top: 0 })),
    };
    boardContext.canvas = board;

    const timerEl = { textContent: '' };

    const documentStub = {
      querySelector: jest.fn((selector) => {
        if (selector === '#board') return board;
        if (selector === '#timer') return timerEl;
        return null;
      }),
      getElementById: jest.fn((id) => {
        if (id === 'board') return board;
        if (id === 'timer') return timerEl;
        return null;
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      defaultView: view,
      hidden: false,
    };
    const root = {
      ownerDocument: documentStub,
      querySelector: (selector) => documentStub.querySelector(selector),
    };
    board.ownerDocument = documentStub;

    const sessionModule = loadSessionModule();
    const { createPveSession, __getActiveGame } = sessionModule;

    const session = createPveSession(root);
    const game = session.start();

    expect(game).not.toBeNull();
    expect(__getActiveGame()).toBe(game);
    expect(view.requestAnimationFrame).toHaveBeenCalled();
    expect(rafCallbacks.length).toBeGreaterThan(0);

    let current = Number(safeNowStub.mock.results[0]?.value ?? 0);

    for (let round = 1; round <= 3; round += 1){
      const tick = rafCallbacks.shift();
      expect(typeof tick).toBe('function');
      if (game?.turn){
        game.turn.busyUntil = 0;
      }
      current += 800;
      tick?.(current);
      expect(stepTurnSpy).toHaveBeenCalledTimes(round);
      expect(view.requestAnimationFrame).toHaveBeenCalledTimes(round + 1);
      expect(rafCallbacks.length).toBeGreaterThan(0);
    }

    session.stop();
  });

 it('không tăng timer khi safeNow tụt mạnh và cost vẫn tăng tiếp', () => {
    usePerfNow = true;
    perfNowValue = 10000;

    const boardContext = {
      canvas: null,
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      scale: jest.fn(),
      clearRect: jest.fn(),
      drawImage: jest.fn(),
    };
    const board = {
      width: 700,
      height: 600,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getContext: jest.fn(() => boardContext),
      getBoundingClientRect: jest.fn(() => ({ left: 0, top: 0 })),
    };
    boardContext.canvas = board;

    const timerEl = { textContent: '' };

    const documentStub = {
      querySelector: jest.fn((selector) => {
        if (selector === '#board') return board;
        if (selector === '#timer') return timerEl;
        return null;
      }),
      getElementById: jest.fn((id) => {
        if (id === 'board') return board;
        if (id === 'timer') return timerEl;
        return null;
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      defaultView: view,
      hidden: false,
    };
    const root = {
      ownerDocument: documentStub,
      querySelector: (selector) => documentStub.querySelector(selector),
    };
    board.ownerDocument = documentStub;

    const sessionModule = loadSessionModule();
    const { createPveSession } = sessionModule;

    const session = createPveSession(root);
    const game = session.start();

    expect(game).not.toBeNull();
    expect(view.requestAnimationFrame).toHaveBeenCalled();
    expect(rafCallbacks.length).toBeGreaterThan(0);

    const parseTimerRemain = () => {
      const text = timerEl.textContent ?? '';
      const parts = text.split(':');
      if (parts.length !== 2) return Infinity;
      const mm = Number(parts[0]);
      const ss = Number(parts[1]);
      if (!Number.isFinite(mm) || !Number.isFinite(ss)) return Infinity;
      return Math.max(0, mm * 60 + ss);
    };

    const runTick = (value) => {
      const tick = rafCallbacks.shift();
      expect(typeof tick).toBe('function');
      if (game?.turn){
        game.turn.busyUntil = 0;
      }
      perfNowValue = value;
      tick?.(value);
      expect(view.requestAnimationFrame).toHaveBeenCalled();
    };

    runTick(15000);

    const remainAfterForward = parseTimerRemain();
    expect(remainAfterForward).toBeLessThan(240);
    const costAfterForward = Number(game?.cost ?? 0);

    runTick(9000);

    const remainAfterDrift = parseTimerRemain();
    expect(remainAfterDrift).toBeLessThanOrEqual(remainAfterForward);
    const costAfterDrift = Number(game?.cost ?? 0);
    expect(costAfterDrift).toBeGreaterThanOrEqual(costAfterForward);

    runTick(21000);

    const remainAfterRecover = parseTimerRemain();
    expect(remainAfterRecover).toBeLessThanOrEqual(remainAfterDrift);
    const costAfterRecover = Number(game?.cost ?? 0);
    expect(costAfterRecover).toBeGreaterThan(costAfterDrift);

    session.stop();
  });
  
  it('khôi phục timer sau khi safeNow tụt hàng triệu ms và vẫn tick cost/lượt', () => {
    usePerfNow = true;
    perfNowValue = 0;

    const boardContext = {
      canvas: null,
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      scale: jest.fn(),
      clearRect: jest.fn(),
      drawImage: jest.fn(),
    };
    const board = {
      width: 700,
      height: 600,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getContext: jest.fn(() => boardContext),
      getBoundingClientRect: jest.fn(() => ({ left: 0, top: 0 })),
    };
    boardContext.canvas = board;

    const timerEl = { textContent: '' };

    const documentStub = {
      querySelector: jest.fn((selector) => {
        if (selector === '#board') return board;
        if (selector === '#timer') return timerEl;
        return null;
      }),
      getElementById: jest.fn((id) => {
        if (id === 'board') return board;
        if (id === 'timer') return timerEl;
        return null;
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      defaultView: view,
      hidden: false,
    };
    const root = {
      ownerDocument: documentStub,
      querySelector: (selector) => documentStub.querySelector(selector),
    };
    board.ownerDocument = documentStub;

    const sessionModule = loadSessionModule();
    const { createPveSession } = sessionModule;

    const session = createPveSession(root);
    const game = session.start();

    expect(game).not.toBeNull();
    expect(view.requestAnimationFrame).toHaveBeenCalled();
    expect(rafCallbacks.length).toBeGreaterThan(0);

    const parseTimerRemain = () => {
      const text = timerEl.textContent ?? '';
      const parts = text.split(':');
      if (parts.length !== 2) return Infinity;
      const mm = Number(parts[0]);
      const ss = Number(parts[1]);
      if (!Number.isFinite(mm) || !Number.isFinite(ss)) return Infinity;
      return Math.max(0, mm * 60 + ss);
    };

    const runTick = (value) => {
      const tick = rafCallbacks.shift();
      expect(typeof tick).toBe('function');
      if (game?.turn){
        game.turn.busyUntil = 0;
      }
      perfNowValue = value;
      tick?.(value);
      expect(view.requestAnimationFrame).toHaveBeenCalled();
    };

    runTick(5000);

    const remainAfterForward = parseTimerRemain();
    expect(remainAfterForward).toBeLessThan(240);
    const costAfterForward = Number(game?.cost ?? 0);

    const rewindValue = -1_995_000;
    runTick(rewindValue);

    const remainAfterRewind = parseTimerRemain();
    expect(remainAfterRewind).toBeGreaterThanOrEqual(220);
    expect(remainAfterRewind).toBeLessThanOrEqual(240);
    const costAfterRewind = Number(game?.cost ?? 0);
    expect(costAfterRewind).toBeGreaterThanOrEqual(costAfterForward);

    const stepTurnBefore = stepTurnSpy.mock.calls.length;
    let latestValue = rewindValue;
    const expectedCostGain = 3;
    for (let i = 0; i < expectedCostGain; i += 1){
      latestValue += 1000;
      runTick(latestValue);
    }

    const costAfterRecovery = Number(game?.cost ?? 0);
    expect(costAfterRecovery).toBeGreaterThanOrEqual(costAfterRewind + expectedCostGain);
    expect(stepTurnSpy.mock.calls.length).toBeGreaterThan(stepTurnBefore);

    session.stop();
  });

  it('khôi phục turn interval mặc định khi cấu hình lỗi', () => {
    if (configModule?.CFG?.ANIMATION){
      configModule.CFG.ANIMATION.turnIntervalMs = 0;
    }

    const boardContext = {
      canvas: null,
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      scale: jest.fn(),
      clearRect: jest.fn(),
      drawImage: jest.fn(),
    };
    const board = {
      width: 700,
      height: 600,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getContext: jest.fn(() => boardContext),
      getBoundingClientRect: jest.fn(() => ({ left: 0, top: 0 })),
    };
    boardContext.canvas = board;

    const timerEl = { textContent: '' };

    const documentStub = {
      querySelector: jest.fn((selector) => {
        if (selector === '#board') return board;
        if (selector === '#timer') return timerEl;
        return null;
      }),
      getElementById: jest.fn((id) => {
        if (id === 'board') return board;
        if (id === 'timer') return timerEl;
        return null;
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      defaultView: view,
      hidden: false,
    };
    const root = {
      ownerDocument: documentStub,
      querySelector: (selector) => documentStub.querySelector(selector),
    };
    board.ownerDocument = documentStub;

    const sessionModule = loadSessionModule();
    const { createPveSession, __getActiveGame } = sessionModule;

    const session = createPveSession(root);
    const game = session.start();

    expect(game).not.toBeNull();
    expect(__getActiveGame()).toBe(game);
    expect(view.requestAnimationFrame).toHaveBeenCalled();
    expect(rafCallbacks.length).toBeGreaterThan(0);

    if (game?.turn){
      game.turn.busyUntil = 0;
    }

    const tick = rafCallbacks.shift();
    expect(typeof tick).toBe('function');

    let current = Number(safeNowStub.mock.results[0]?.value ?? 0);
    current += 800;
    currentTime = current;
    tick?.(current);

    expect(stepTurnSpy).toHaveBeenCalledTimes(1);

    session.stop();
  });

  it('reset nhịp khi timestamp requestAnimationFrame đứng yên', () => {
    const boardContext = {
      canvas: null,
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      scale: jest.fn(),
      clearRect: jest.fn(),
      drawImage: jest.fn(),
    };
    const board = {
      width: 700,
      height: 600,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getContext: jest.fn(() => boardContext),
      getBoundingClientRect: jest.fn(() => ({ left: 0, top: 0 })),
    };
    boardContext.canvas = board;

    const timerEl = { textContent: '' };

    const documentStub = {
      querySelector: jest.fn((selector) => {
        if (selector === '#board') return board;
        if (selector === '#timer') return timerEl;
        return null;
      }),
      getElementById: jest.fn((id) => {
        if (id === 'board') return board;
        if (id === 'timer') return timerEl;
        return null;
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      defaultView: view,
      hidden: false,
    };
    const root = {
      ownerDocument: documentStub,
      querySelector: (selector) => documentStub.querySelector(selector),
    };
    board.ownerDocument = documentStub;

    freezeRafTimestamp = true;

    const sessionModule = loadSessionModule();
    const { createPveSession, __getActiveGame } = sessionModule;

    const session = createPveSession(root);
    const game = session.start();

    expect(game).not.toBeNull();
    expect(__getActiveGame()).toBe(game);
    expect(view.requestAnimationFrame).toHaveBeenCalled();
    expect(rafCallbacks.length).toBeGreaterThan(0);

    let current = Number(safeNowStub.mock.results[0]?.value ?? 0);

    for (let round = 1; round <= 2; round += 1){
      const tick = rafCallbacks.shift();
      expect(typeof tick).toBe('function');
      if (game?.turn){
        game.turn.busyUntil = 0;
      }
      current += 650;
      currentTime = current;
      tick?.(current);
      expect(stepTurnSpy).toHaveBeenCalledTimes(round);
      expect(view.requestAnimationFrame).toHaveBeenCalledTimes(round + 1);
      expect(rafCallbacks.length).toBeGreaterThan(0);
    }

    session.stop();
  });

  it('chuẩn hóa timestamp requestAnimationFrame khác gốc', () => {
    const boardContext = {
      canvas: null,
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      scale: jest.fn(),
      clearRect: jest.fn(),
      drawImage: jest.fn(),
    };
    const board = {
      width: 700,
      height: 600,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getContext: jest.fn(() => boardContext),
      getBoundingClientRect: jest.fn(() => ({ left: 0, top: 0 })),
    };
    boardContext.canvas = board;

    const timerEl = { textContent: '' };

    const documentStub = {
      querySelector: jest.fn((selector) => {
        if (selector === '#board') return board;
        if (selector === '#timer') return timerEl;
        return null;
      }),
      getElementById: jest.fn((id) => {
        if (id === 'board') return board;
        if (id === 'timer') return timerEl;
        return null;
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      defaultView: view,
      hidden: false,
    };
    const root = {
      ownerDocument: documentStub,
      querySelector: (selector) => documentStub.querySelector(selector),
    };
    board.ownerDocument = documentStub;

    const navOrigin = 5_000_000;
    usePerfNow = true;
    perfNowValue = 0;
    currentTime = navOrigin;
    perfNowMock.mockImplementation(() => perfNowValue);
    global.performance = {
      now: perfNowMock,
      timeOrigin: navOrigin,
    };

    const sessionModule = loadSessionModule();
    const { createPveSession, __getActiveGame } = sessionModule;

    const session = createPveSession(root);
    const game = session.start();

    expect(game).not.toBeNull();
    expect(__getActiveGame()).toBe(game);
    expect(sessionNowStub).toHaveBeenCalled();
    expect(view.requestAnimationFrame).toHaveBeenCalled();
    expect(rafCallbacks.length).toBeGreaterThan(0);

    perfNowValue = 900;
    currentTime = navOrigin + 900;

    if (game?.turn) {
      game.turn.busyUntil = 0;
    }

    const tick = rafCallbacks.shift();
    expect(typeof tick).toBe('function');

    tick?.(currentTime);

    expect(stepTurnSpy).toHaveBeenCalled();

    session.stop();
  });

it('giữ đồng hồ & cost ổn định khi session offset giảm mạnh', () => {
    const boardContext = {
      canvas: null,
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      scale: jest.fn(),
      clearRect: jest.fn(),
      drawImage: jest.fn(),
    };
    const board = {
      width: 700,
      height: 600,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getContext: jest.fn(() => boardContext),
      getBoundingClientRect: jest.fn(() => ({ left: 0, top: 0 })),
    };
    boardContext.canvas = board;

    const timerEl = { textContent: '04:00' };

    const documentStub = {
      querySelector: jest.fn((selector) => {
        if (selector === '#board') return board;
        if (selector === '#timer') return timerEl;
        return null;
      }),
      getElementById: jest.fn((id) => {
        if (id === 'board') return board;
        if (id === 'timer') return timerEl;
        return null;
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      defaultView: view,
      hidden: false,
    };
    const root = {
      ownerDocument: documentStub,
      querySelector: (selector) => documentStub.querySelector(selector),
    };
    board.ownerDocument = documentStub;

    usePerfNow = true;
    const origin = 1_000_000_000_000;
    perfNowValue = 0;
    perfNowMock.mockImplementation(() => perfNowValue);
    global.performance = {
      now: perfNowMock,
      timeOrigin: origin,
    };

    const sessionModule = loadSessionModule();
    const { createPveSession, __getActiveGame } = sessionModule;

    const session = createPveSession(root);
    const game = session.start();

    expect(game).not.toBeNull();
    expect(__getActiveGame()).toBe(game);
    expect(view.requestAnimationFrame).toHaveBeenCalled();
    expect(rafCallbacks.length).toBeGreaterThan(0);

    setSessionOffset?.(0);
    perfNowValue = 1_500;

    if (game?.turn){
      game.turn.busyUntil = 0;
    }

    const tick = rafCallbacks.shift();
    expect(typeof tick).toBe('function');

    tick?.(perfNowValue);

    expect(timerEl.textContent).toBe('03:59');
    expect(game?.cost ?? 0).toBeGreaterThan(0);

    session.stop();
  });
});