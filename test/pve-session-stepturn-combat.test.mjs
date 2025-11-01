// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import loaderModule from './helpers/pve-session-loader.js';
import { loadTurnsHarness } from './helpers/turns-harness.mjs';

const TIME_MODULE_KEY = './utils/time.js';
const TURNS_MODULE_KEY = './turns.ts';

const { loadSessionModule, clearModuleCache, stubModules, getModuleContext } = loaderModule;

  function createDomStubs(){
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
    quadraticCurveTo: noop,
    translate: noop,
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
    requestAnimationFrame(cb){
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

  return { root, board, boardContext, view, documentStub, rafQueue };
}

function createTimeHelpers(){
  const timeState = { session: 0, safe: 0 };
  const advanceNow = (delta = 0, options = undefined) => {
    const opts = options ?? {};
    const { advanceSession = true, advanceSafe = true } = opts;
    if (Number.isFinite(delta) && delta > 0){
      if (advanceSession) timeState.session += delta;
      if (advanceSafe) timeState.safe += delta;
    }
    return timeState.session;
  };

  const setSafeNow = (value) => {
    if (Number.isFinite(value)){
      timeState.safe = Number(value);
    }
    return timeState.safe;
  };

  const timeStub = {
    sessionNow(){
      return timeState.session;
    },
    safeNow(){
      return timeState.safe;
    },
    normalizeAnimationFrameTimestamp(timestamp){
      if (typeof timestamp === 'number' && Number.isFinite(timestamp)) return timestamp;
      return timeState.session;
    },
    mergeBusyUntil(previous, startedAt, duration){
      const start = Number.isFinite(startedAt) ? Number(startedAt) : timeState.session;
      const dur = Number.isFinite(duration) ? Math.max(0, Number(duration)) : 0;
      const prev = Number.isFinite(previous) ? Number(previous) : start;
      return Math.max(prev, start + dur);
    },
    resetSessionTimeBase(){
      timeState.session = 0;
      timeState.safe = 0;
    },
  };

    return { timeState, advanceNow, setSafeNow, timeStub };
}

    test('PvE session thủ công stepTurn khiến leader địch mất HP sau vài tick', async (t) => {
  clearModuleCache();
  const originalTimeModule = stubModules.get(TIME_MODULE_KEY);
  const originalTurnsModule = stubModules.get(TURNS_MODULE_KEY);

    t.after(() => {
    stubModules.set(TIME_MODULE_KEY, originalTimeModule);
    stubModules.set(TURNS_MODULE_KEY, originalTurnsModule);
    clearModuleCache();
  });

    const { timeState, advanceNow, timeStub } = createTimeHelpers();
  stubModules.set(TIME_MODULE_KEY, timeStub);

  const { root } = createDomStubs();

    const combatStub = {
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
      performUlt(){ return null; },
    };

    const harness = await loadTurnsHarness({ './combat.js': combatStub });
  const { stepTurn, doActionOrSkip, deps, eventLog } = harness;
  eventLog.length = 0;

  const sessionModule = loadSessionModule();
  const { createPveSession } = sessionModule;
  const session = createPveSession(root);

  let game = null;
  try {
    game = session.start();
    assert.ok(game, 'session.start trả về game hợp lệ');

    const ally = game.tokens.find((token) => token?.id === 'leaderA');
    const enemy = game.tokens.find((token) => token?.id === 'leaderB');
    assert.ok(ally, 'ally leader tồn tại');
    assert.ok(enemy, 'enemy leader tồn tại');

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
      game.turn.busyUntil = timeStub.mergeBusyUntil(game.turn.busyUntil, timeState.session, 0);
      if (!enemy.alive) break;
     }

    assert.strictEqual(typeof enemy.hp, 'number', 'enemy.hp phải là số');
    assert(enemy.hp < startingHp, 'HP của địch phải giảm sau stepTurn');
    assert(eventLog.some((entry) => entry.type === 'ACTION_END' && entry.detail?.action === 'basic'), 'Phải có ACTION_END cho basic attack');
  } finally {
    session.stop();
  }
});


test('stepTurn tự động chạy qua updateTimerAndCost và làm địch mất HP', async (t) => {
  clearModuleCache();
  const originalTimeModule = stubModules.get(TIME_MODULE_KEY);
  const originalTurnsModule = stubModules.get(TURNS_MODULE_KEY);

      t.after(() => {
    stubModules.set(TIME_MODULE_KEY, originalTimeModule);
    stubModules.set(TURNS_MODULE_KEY, originalTurnsModule);
    clearModuleCache();
  });

    const { timeState, advanceNow, timeStub } = createTimeHelpers();
  stubModules.set(TIME_MODULE_KEY, timeStub);

  const { root, rafQueue } = createDomStubs();

  const safeTimeStub = {
    safeNow: timeStub.safeNow,
    sessionNow: timeStub.sessionNow,
  };

  const combatStub = {
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
    performUlt(){ return null; },
  };

    const harness = await loadTurnsHarness({
    './combat.js': combatStub,
    './utils/time.js': safeTimeStub,
  });

    const { deps, eventLog, stepTurn: originalStepTurn, doActionOrSkip } = harness;
  eventLog.length = 0;

  let stepTurnCount = 0;
  const wrappedTurnsModule = {
    ...harness,
    stepTurn(game, hooks){
      stepTurnCount += 1;
      return originalStepTurn(game, hooks);
    },
    doActionOrSkip,
  };
  stubModules.set(TURNS_MODULE_KEY, wrappedTurnsModule);

  const sessionModule = loadSessionModule();
  const { createPveSession } = sessionModule;
  const session = createPveSession(root);

  const runFrame = (delta = 0) => {
    advanceNow(delta);
    const callbacks = rafQueue.splice(0, rafQueue.length);
    for (const cb of callbacks){
      cb(timeState.session);
    }
  };

  let game = null;
  try {
    game = session.start();
    assert.ok(game, 'session.start trả về game hợp lệ');

    const ally = game.tokens.find((token) => token?.id === 'leaderA');
    const enemy = game.tokens.find((token) => token?.id === 'leaderB');
    assert.ok(ally, 'ally leader tồn tại');
    assert.ok(enemy, 'enemy leader tồn tại');

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
    
    const startingHp = enemy.hp;

    runFrame(0);
    for (let i = 0; i < 4; i += 1){
      if (!enemy.alive) break;
      runFrame(600);
    }

assert(stepTurnCount >= 2, 'stepTurn phải được gọi nhiều lần');
    assert.strictEqual(typeof enemy.hp, 'number', 'enemy.hp phải là số');
    assert(enemy.hp < startingHp, 'HP của địch phải giảm sau auto stepTurn');
    assert(eventLog.some((entry) => entry.type === 'ACTION_END' && entry.detail?.action === 'basic'), 'Phải có ACTION_END cho basic attack');
  } finally {
    session.stop();
  }
});

test('stepTurn vẫn chạy sau khi safeNow bị tua lùi mạnh', async (t) => {
  clearModuleCache();
  const originalTimeModule = stubModules.get(TIME_MODULE_KEY);
  const originalTurnsModule = stubModules.get(TURNS_MODULE_KEY);

  t.after(() => {
    stubModules.set(TIME_MODULE_KEY, originalTimeModule);
    stubModules.set(TURNS_MODULE_KEY, originalTurnsModule);
    clearModuleCache();
  });

  const { timeState, advanceNow, setSafeNow, timeStub } = createTimeHelpers();
  stubModules.set(TIME_MODULE_KEY, timeStub);

  const { root, rafQueue } = createDomStubs();

  const safeTimeStub = {
    safeNow: timeStub.safeNow,
    sessionNow: timeStub.sessionNow,
  };

  const combatStub = {
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
    performUlt(){ return null; },
  };

  const harness = await loadTurnsHarness({
    './combat.js': combatStub,
    './utils/time.js': safeTimeStub,
  });

  const { deps, eventLog, stepTurn: originalStepTurn, doActionOrSkip } = harness;
  eventLog.length = 0;

  let stepTurnCount = 0;
  const wrappedTurnsModule = {
    ...harness,
    stepTurn(game, hooks){
      stepTurnCount += 1;
      return originalStepTurn(game, hooks);
    },
    doActionOrSkip,
  };
  stubModules.set(TURNS_MODULE_KEY, wrappedTurnsModule);

  const sessionModule = loadSessionModule();
  const { createPveSession } = sessionModule;
  const session = createPveSession(root);

  const runFrame = (delta = 0) => {
    advanceNow(delta);
    const callbacks = rafQueue.splice(0, rafQueue.length);
    for (const cb of callbacks){
      cb(timeState.session);
    }
  };

  let game = null;
  try {
    game = session.start();
    assert.ok(game, 'session.start trả về game hợp lệ');

    const ally = game.tokens.find((token) => token?.id === 'leaderA');
    const enemy = game.tokens.find((token) => token?.id === 'leaderB');
    assert.ok(ally, 'ally leader tồn tại');
    assert.ok(enemy, 'enemy leader tồn tại');

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

    const startingHp = enemy.hp;

    runFrame(0);
    for (let i = 0; i < 4; i += 1){
      if (!enemy.alive) break;
      runFrame(600);
    }

    const hpAfterInitial = enemy.hp;
    const costAfterInitial = game.cost;
    const aiCostAfterInitial = game.ai.cost;
    const actionCountBeforeRewind = eventLog.filter((entry) => entry.type === 'ACTION_END' && entry.detail?.action === 'basic').length;
    const stepTurnBeforeRewind = stepTurnCount;

    assert(hpAfterInitial < startingHp, 'enemy.hp phải giảm sau giai đoạn đầu');
    assert(stepTurnBeforeRewind >= 1, 'stepTurn phải được gọi ít nhất một lần trước khi tua');

    const runtimeContext = getModuleContext('./modes/pve/session-runtime-impl.ts');
    assert.ok(runtimeContext, 'phải lấy được context của session-runtime');
    const clockBeforeRewind = runtimeContext?.CLOCK ?? null;
    const lastTurnBeforeRewind = Number.isFinite(clockBeforeRewind?.lastTurnStepMs)
      ? clockBeforeRewind.lastTurnStepMs
      : null;

    const safeBeforeRewind = timeState.safe;
    setSafeNow(safeBeforeRewind - 180_000);

    runFrame(0);

    const costBeforeContinue = game.cost;
    const aiCostBeforeContinue = game.ai.cost;

    for (let i = 0; i < 6; i += 1){
      if (!enemy.alive) break;
      runFrame(600);
    }

    const stepTurnAfterRewind = stepTurnCount;
    const hpAfterRewind = enemy.hp;
    const costAfterRewind = game.cost;
    const aiCostAfterRewind = game.ai.cost;
    const actionCountAfterRewind = eventLog.filter((entry) => entry.type === 'ACTION_END' && entry.detail?.action === 'basic').length;

    const clockAfterRewind = runtimeContext?.CLOCK ?? null;
    const lastTurnAfterRewind = Number.isFinite(clockAfterRewind?.lastTurnStepMs)
      ? clockAfterRewind.lastTurnStepMs
      : null;

    assert(costAfterRewind > costBeforeContinue || costAfterRewind > costAfterInitial, 'cost phải tiếp tục tăng sau khi tua');
    assert(aiCostAfterRewind >= aiCostBeforeContinue && aiCostAfterRewind >= aiCostAfterInitial, 'cost của AI không được giảm');
    assert(stepTurnAfterRewind > stepTurnBeforeRewind, 'stepTurn phải tiếp tục chạy sau khi tua');
    assert(hpAfterRewind < hpAfterInitial, 'HP địch phải giảm thêm sau khi tua');
    assert(actionCountAfterRewind > actionCountBeforeRewind, 'Phải có thêm ACTION_END sau khi tua');

    if (lastTurnBeforeRewind !== null && lastTurnAfterRewind !== null){
      assert(lastTurnAfterRewind >= lastTurnBeforeRewind, 'lastTurnStepMs không được tụt lùi sau khi tua');
      const sessionNowMs = timeState.session;
      assert(lastTurnAfterRewind <= sessionNowMs, 'lastTurnStepMs không được vượt quá sessionNow');
      assert(lastTurnAfterRewind >= sessionNowMs - 600, 'lastTurnStepMs phải bám sát sessionNow sau khi tua');
    } else {
      assert(Number.isFinite(lastTurnAfterRewind), 'CLOCK.lastTurnStepMs phải hữu hạn sau khi tua');
    }

    assert.strictEqual(typeof enemy.hp, 'number', 'enemy.hp phải là số');
    assert(enemy.hp < startingHp, 'HP của địch phải thấp hơn ban đầu sau toàn bộ quá trình');
  } finally {
    session.stop();
  }
});