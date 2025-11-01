import { describe, it, beforeEach, afterEach, expect, jest } from '@jest/globals';
import loaderModule from './helpers/pve-session-loader.js';
import { loadTurnsHarness } from './helpers/turns-harness.mjs';

const { loadSessionModule, clearModuleCache, stubModules } = loaderModule;

const TIME_MODULE_KEY = './utils/time.js';

describe('PvE session thủ công stepTurn với harness Node', () => {
  const originalTimeModule = stubModules.get(TIME_MODULE_KEY);
  const originalTurnsModule = stubModules.get('./turns.ts');

  beforeEach(() => {
    clearModuleCache();
  });

  afterEach(() => {
    stubModules.set(TIME_MODULE_KEY, originalTimeModule);
    stubModules.set('./turns.ts', originalTurnsModule);
    clearModuleCache();
  });

  it('leader địch mất HP sau vài tick stepTurn mô phỏng', async () => {
    const timeState = { now: 0 };
    const advanceNow = (delta = 0) => {
      if (Number.isFinite(delta) && delta > 0){
        timeState.now += delta;
      }
      return timeState.now;
    };

    const sessionNowStub = jest.fn(() => timeState.now);
    const safeNowStub = jest.fn(() => timeState.now);
    const normalizeTimestampStub = jest.fn((timestamp) => {
      if (typeof timestamp === 'number' && Number.isFinite(timestamp)) return timestamp;
      return timeState.now;
    });
    const mergeBusyUntilStub = jest.fn((previous, startedAt, duration) => {
      const start = Number.isFinite(startedAt) ? Number(startedAt) : timeState.now;
      const dur = Number.isFinite(duration) ? Math.max(0, Number(duration)) : 0;
      const prev = Number.isFinite(previous) ? Number(previous) : start;
      return Math.max(prev, start + dur);
    });

    stubModules.set(TIME_MODULE_KEY, {
      sessionNow: sessionNowStub,
      safeNow: safeNowStub,
      normalizeAnimationFrameTimestamp: normalizeTimestampStub,
      mergeBusyUntil: mergeBusyUntilStub,
      resetSessionTimeBase(){
        timeState.now = 0;
      },
    });

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

    const harness = await loadTurnsHarness({
      './combat.js': {
        doBasicWithFollowups(Game, unit){
          const opponent = Game.tokens.find((token) => token?.alive && token.side !== unit.side);
          if (!opponent) return;
          const current = Number.isFinite(opponent.hp) ? opponent.hp : (Number.isFinite(opponent.hpMax) ? opponent.hpMax : 0);
          const next = current - 18;
          opponent.hp = next;
          if (next <= 0){
            opponent.hp = 0;
            opponent.alive = false;
            if (Game.battle){
              Game.battle.over = true;
              Game.battle.winner = unit.side;
            }
          }
        },
      },
    });

    const { stepTurn, doActionOrSkip, deps, eventLog } = harness;
    eventLog.length = 0;

    let game = null;
    try {
      game = session.start();
      expect(game).toBeTruthy();

      const ally = game.tokens.find((token) => token?.id === 'leaderA');
      const enemy = game.tokens.find((token) => token?.id === 'leaderB');
      expect(ally).toBeTruthy();
      expect(enemy).toBeTruthy();

      const slotToCell = deps['./engine.js'].slotToCell;
      const allySlot = 5;
      const enemySlot = 5;
      Object.assign(ally, slotToCell('ally', allySlot), {
        side: 'ally',
        alive: true,
        hpMax: 120,
        hp: 120,
      });
      Object.assign(enemy, slotToCell('enemy', enemySlot), {
        side: 'enemy',
        alive: true,
        hpMax: 120,
        hp: 120,
      });

      game.meta = new Map([
        [ally.id, { followupCap: 0 }],
        [enemy.id, { followupCap: 0 }],
      ]);
      game.queued = { ally: new Map(), enemy: new Map() };
      game.actionChain = [];
      game.turn = {
        mode: 'sequential',
        order: [
          { side: 'ally', slot: allySlot },
          { side: 'enemy', slot: enemySlot },
        ],
        cursor: 0,
        cycle: 0,
        orderIndex: new Map([
          [`ally:${allySlot}`, 0],
          [`enemy:${enemySlot}`, 1],
        ]),
        busyUntil: 0,
      };
      game.battle = game.battle || { over: false, winner: null };

      const hooks = {
        doActionOrSkip(gameArg, unit, ctx){
          return doActionOrSkip(gameArg, unit, ctx);
        },
        processActionChain(){
          return null;
        },
      };

      const startingHp = enemy.hp;

      for (let i = 0; i < 4; i += 1){
        stepTurn(game, hooks);
        advanceNow(600);
        game.turn.busyUntil = mergeBusyUntilStub(game.turn.busyUntil, timeState.now, 0);
        if (!enemy.alive) break;
      }

      expect(typeof enemy.hp).toBe('number');
      expect(enemy.hp).toBeLessThan(startingHp);
      expect(eventLog.some((entry) => entry.type === 'ACTION_END' && entry.detail?.action === 'basic')).toBe(true);
    } finally {
      session.stop();
    }
  });
  
  it('stepTurn tự chạy nhiều lần qua updateTimerAndCost và làm địch mất HP', async () => {
    const timeState = { now: 0 };
    const advanceNow = (delta = 0) => {
      if (Number.isFinite(delta) && delta > 0){
        timeState.now += delta;
      }
      return timeState.now;
    };

    const sessionNowStub = jest.fn(() => timeState.now);
    const safeNowStub = jest.fn(() => timeState.now);
    const normalizeTimestampStub = jest.fn((timestamp) => {
      if (typeof timestamp === 'number' && Number.isFinite(timestamp)) return timestamp;
      return timeState.now;
    });
    const mergeBusyUntilStub = jest.fn((previous, startedAt, duration) => {
      const start = Number.isFinite(startedAt) ? Number(startedAt) : timeState.now;
      const dur = Number.isFinite(duration) ? Math.max(0, Number(duration)) : 0;
      const prev = Number.isFinite(previous) ? Number(previous) : start;
      return Math.max(prev, start + dur);
    });

    stubModules.set(TIME_MODULE_KEY, {
      sessionNow: sessionNowStub,
      safeNow: safeNowStub,
      normalizeAnimationFrameTimestamp: normalizeTimestampStub,
      mergeBusyUntil: mergeBusyUntilStub,
      resetSessionTimeBase(){
        timeState.now = 0;
      },
    });

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

    const harness = await loadTurnsHarness({
      './combat.js': {
        doBasicWithFollowups(Game, unit){
          const opponent = Game.tokens.find((token) => token?.alive && token.side !== unit.side);
          if (!opponent) return;
          const current = Number.isFinite(opponent.hp) ? opponent.hp : (Number.isFinite(opponent.hpMax) ? opponent.hpMax : 0);
          const next = current - 18;
          opponent.hp = next;
          if (next <= 0){
            opponent.hp = 0;
            opponent.alive = false;
            if (Game.battle){
              Game.battle.over = true;
              Game.battle.winner = unit.side;
            }
          }
        },
      },
      './utils/time.js': {
        safeNow: safeNowStub,
        sessionNow: sessionNowStub,
      },
    });

    const stepTurnSpy = jest.fn((...args) => harness.stepTurn(...args));
    const turnsModule = {
      ...harness,
      stepTurn: stepTurnSpy,
      doActionOrSkip: harness.doActionOrSkip,
    };
    stubModules.set('./turns.ts', turnsModule);

    const sessionModule = loadSessionModule();
    const { createPveSession } = sessionModule;
    const session = createPveSession(root);

    const { deps, eventLog } = harness;
    eventLog.length = 0;

    let game = null;
    try {
      game = session.start();
      expect(game).toBeTruthy();

      const ally = game.tokens.find((token) => token?.id === 'leaderA');
      const enemy = game.tokens.find((token) => token?.id === 'leaderB');
      expect(ally).toBeTruthy();
      expect(enemy).toBeTruthy();

      const slotToCell = deps['./engine.js'].slotToCell;
      const allySlot = 5;
      const enemySlot = 5;
      Object.assign(ally, slotToCell('ally', allySlot), {
        side: 'ally',
        alive: true,
        hpMax: 120,
        hp: 120,
      });
      Object.assign(enemy, slotToCell('enemy', enemySlot), {
        side: 'enemy',
        alive: true,
        hpMax: 120,
        hp: 120,
      });

      game.meta = new Map([
        [ally.id, { followupCap: 0 }],
        [enemy.id, { followupCap: 0 }],
      ]);
      game.queued = { ally: new Map(), enemy: new Map() };
      game.actionChain = [];
      game.turn = {
        mode: 'sequential',
        order: [
          { side: 'ally', slot: allySlot },
          { side: 'enemy', slot: enemySlot },
        ],
        cursor: 0,
        cycle: 0,
        orderIndex: new Map([
          [`ally:${allySlot}`, 0],
          [`enemy:${enemySlot}`, 1],
        ]),
        busyUntil: 0,
      };
      game.battle = game.battle || { over: false, winner: null };

      const runFrame = (delta = 0) => {
        advanceNow(delta);
        const callbacks = rafQueue.splice(0, rafQueue.length);
        for (const cb of callbacks){
          cb(timeState.now);
        }
      };

      const startingHp = enemy.hp;

      runFrame(0);
      for (let i = 0; i < 4; i += 1){
        if (!enemy.alive) break;
        runFrame(600);
      }

      expect(stepTurnSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
      expect(typeof enemy.hp).toBe('number');
      expect(enemy.hp).toBeLessThan(startingHp);
      expect(eventLog.some((entry) => entry.type === 'ACTION_END' && entry.detail?.action === 'basic')).toBe(true);
    } finally {
      session.stop();
    }
  });
});