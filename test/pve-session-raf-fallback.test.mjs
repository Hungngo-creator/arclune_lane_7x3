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

  let currentTime;
  let safeNowStub;
  let stepTurnSpy;
  let rafCallbacks;
  let view;

  beforeEach(() => {
    clearModuleCache();
    currentTime = 0;
    Date.now = jest.fn(() => currentTime);

    let lastFallbackNow = 0;
    safeNowStub = jest.fn(() => {
      const current = Date.now();
      if (current <= lastFallbackNow) {
        lastFallbackNow += 1;
        return lastFallbackNow;
      }
      lastFallbackNow = current;
      return lastFallbackNow;
    });
    stubModules.set(TIME_MODULE_KEY, { safeNow: safeNowStub });

    const turnsModule = { ...originalTurnsModule };
    stepTurnSpy = jest.fn(() => {});
    turnsModule.stepTurn = stepTurnSpy;
    turnsModule.doActionOrSkip = jest.fn();
    stubModules.set(TURNS_MODULE_KEY, turnsModule);

    global.performance = undefined;
    global.requestAnimationFrame = undefined;
    global.cancelAnimationFrame = undefined;

    rafCallbacks = [];
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
});
