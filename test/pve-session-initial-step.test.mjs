// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import loaderModule from './helpers/pve-session-loader.js';

const TIME_MODULE_KEY = './utils/time.js';
const TURNS_MODULE_KEY = './turns.ts';

test('PvE session tick đầu tiên tự động stepTurn và vẫn tiếp tục ở các tick kế tiếp', async () => {
  const { stubModules, loadSessionModule, clearModuleCache } = loaderModule;
  clearModuleCache();

  const originalTimeModule = stubModules.get(TIME_MODULE_KEY);
  const originalTurnsModule = stubModules.get(TURNS_MODULE_KEY);

  const timeState = { now: 0 };
  const advanceNow = (delta) => {
    if (Number.isFinite(delta) && delta > 0){
      timeState.now += delta;
    }
  };

  const timeStub = {
    sessionNow(){
      return timeState.now;
    },
    resetSessionTimeBase(){
      timeState.now = 0;
    },
    normalizeAnimationFrameTimestamp(timestamp){
      if (typeof timestamp === 'number' && Number.isFinite(timestamp)) return timestamp;
      return timeState.now;
    },
    mergeBusyUntil(previous, startedAt, duration){
      const start = Number.isFinite(startedAt) ? startedAt : timeState.now;
      const dur = Number.isFinite(duration) ? Math.max(0, Number(duration)) : 0;
      const prev = Number.isFinite(previous) ? Number(previous) : start;
      return Math.max(prev, start + dur);
    },
    safeNow(){
      return timeState.now;
    },
  };

  stubModules.set(TIME_MODULE_KEY, timeStub);

  let stepCount = 0;
  const turnsStub = {
    stepTurn(game, hooks){
      stepCount += 1;
      if (originalTurnsModule && typeof originalTurnsModule.stepTurn === 'function'){
        return originalTurnsModule.stepTurn(game, hooks);
      }
      return undefined;
    },
    doActionOrSkip: originalTurnsModule?.doActionOrSkip ?? (() => undefined),
    predictSpawnCycle: originalTurnsModule?.predictSpawnCycle ?? (() => null),
  };

  stubModules.set(TURNS_MODULE_KEY, turnsStub);

  const noop = () => {};
  const gradientStub = { addColorStop: noop };
  const boardContext = {
    canvas: null,
    setTransform: noop,
    resetTransform: noop,
    scale: noop,
    clearRect: noop,
    drawImage: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    stroke: noop,
    fill: noop,
    save: noop,
    restore: noop,
    fillRect: noop,
    strokeRect: noop,
    createLinearGradient: () => gradientStub,
    createRadialGradient: () => gradientStub,
    measureText: () => ({ width: 0 }),
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    globalAlpha: 1,
  };

  const board = {
    width: 700,
    height: 600,
    ownerDocument: null,
    addEventListener: noop,
    removeEventListener: noop,
    getContext: (type) => (type === '2d' ? boardContext : null),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 700, height: 600 }),
  };
  boardContext.canvas = board;

  const viewportStub = {
    addEventListener: noop,
    removeEventListener: noop,
  };

  const rafQueue = [];
  const view = {
    devicePixelRatio: 1,
    requestAnimationFrame: (cb) => {
      rafQueue.push(cb);
      return rafQueue.length;
    },
    cancelAnimationFrame: noop,
    addEventListener: noop,
    removeEventListener: noop,
    visualViewport: viewportStub,
  };

  const documentStub = {
    querySelector: (selector) => (selector === '#board' ? board : null),
    getElementById: (id) => (id === 'board' ? board : null),
    addEventListener: noop,
    removeEventListener: noop,
    defaultView: view,
    hidden: false,
    documentElement: { clientWidth: 700 },
  };
  board.ownerDocument = documentStub;

  const root = {
    ownerDocument: documentStub,
    querySelector: (selector) => documentStub.querySelector(selector),
  };

  const sessionModule = loadSessionModule();
  const { createPveSession } = sessionModule;
  const session = createPveSession(root);

  const runTick = (advanceMs = 0) => {
    advanceNow(advanceMs);
    const cb = rafQueue.shift();
    if (cb){
      cb(timeState.now);
    }
  };

  try {
    const game = session.start();
    assert.ok(game, 'Phải khởi tạo được session PvE');

    runTick();
    runTick(600);
    runTick(600);

    assert.ok(stepCount >= 1, 'stepTurn phải được gọi ít nhất một lần');
  } finally {
    session.stop();
    stubModules.set(TIME_MODULE_KEY, originalTimeModule);
    stubModules.set(TURNS_MODULE_KEY, originalTurnsModule);
    clearModuleCache();
  }
});
