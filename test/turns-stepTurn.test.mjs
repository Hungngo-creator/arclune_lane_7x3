// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import loaderModule from './helpers/pve-session-loader.js';
import { loadTurnsHarness, loadSummonHarness } from './helpers/turns-harness.mjs';

test('slot 8 leader takes consecutive turns when order is mostly empty', async () => {
  const harness = await loadTurnsHarness();
  const { stepTurn, deps, eventLog } = harness;
  const order = [];
  for (let slot = 1; slot <= 9; slot += 1){
    order.push({ side: 'ally', slot });
    order.push({ side: 'enemy', slot });
  }
  const pos = deps['./engine.js'].slotToCell('enemy', 8);
  const leader = { id: 'enemyLeader', side: 'enemy', alive: true, ...pos };
  const Game = {
    tokens: [leader],
    meta: new Map(),
    queued: { ally: new Map(), enemy: new Map() },
    turn: {
      order,
      cursor: 0,
      cycle: 0,
      orderIndex: new Map()
    }
  };

  const actionUnits = [];
  const hooks = {
    doActionOrSkip(_, unit){
      actionUnits.push(unit?.id ?? null);
    },
    processActionChain(){
      return null;
    }
  };

  stepTurn(Game, hooks);
  stepTurn(Game, hooks);

  const turnStarts = eventLog.filter(ev => ev.type === 'TURN_START').map(ev => ev.detail);
  assert.deepStrictEqual(actionUnits, ['enemyLeader', 'enemyLeader']);
  assert.strictEqual(turnStarts.length, 2);
  assert(turnStarts.every(detail => detail?.slot === 8 && detail?.side === 'enemy'));
  assert.deepStrictEqual(turnStarts.map(detail => detail?.cycle), [0, 1]);
});

test('PvE session spawn leader và stepTurn chọn được actor ngay sau khi khởi tạo', async () => {
  const { loadSessionModule, clearModuleCache } = loaderModule;
  clearModuleCache();

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
  const { createPveSession, __getActiveGame } = sessionModule;

  const session = createPveSession(root);
  let game = null;

  try {
    game = session.start();
    assert.ok(game, 'Session phải khởi tạo thành công');
    assert.equal(__getActiveGame(), game);

    const tokens = Array.isArray(game?.tokens) ? game.tokens : [];
    const tokenIds = tokens.map((token) => token?.id);
    assert.ok(tokenIds.includes('leaderA'), 'leaderA phải có trong Game.tokens sau khi start');
    assert.ok(tokenIds.includes('leaderB'), 'leaderB phải có trong Game.tokens sau khi start');

    if (game?.turn){
      game.turn.busyUntil = 0;
    }

    const { stepTurn } = await loadTurnsHarness();
    let actedUnit = null;
    stepTurn(game, {
      doActionOrSkip(_game, unit){
        actedUnit = unit;
      },
      processActionChain(){
        return null;
      },
    });

    assert.ok(actedUnit, 'stepTurn phải chọn được 1 actor hợp lệ');
    assert.equal(typeof actedUnit.id, 'string');
    assert.notEqual(actedUnit.id.length, 0);
  } finally {
    session.stop();
    clearModuleCache();
  }
});

test('leader trao đổi đòn đánh thường khi stepTurn chạy nhiều lượt', async () => {
  const damageLog = [];
  const harness = await loadTurnsHarness({
    './combat.js': {
      doBasicWithFollowups(Game, unit){
        const opponent = Game.tokens.find((t) => t.alive && t.side !== unit.side);
        if (!opponent) return;
        opponent.hp = (opponent.hp ?? 0) - 10;
        damageLog.push({ attacker: unit.id, target: opponent.id, hp: opponent.hp });
      }
    }
  });

  const { stepTurn, doActionOrSkip, deps, eventLog } = harness;
  const allyPos = deps['./engine.js'].slotToCell('ally', 5);
  const enemyPos = deps['./engine.js'].slotToCell('enemy', 5);
  const leaderA = { id: 'leaderA', side: 'ally', alive: true, hp: 100, hpMax: 100, ...allyPos };
  const leaderB = { id: 'leaderB', side: 'enemy', alive: true, hp: 100, hpMax: 100, ...enemyPos };

  const Game = {
    tokens: [leaderA, leaderB],
    meta: new Map(),
    queued: { ally: new Map(), enemy: new Map() },
    actionChain: [],
    turn: {
      order: [
        { side: 'ally', slot: 5 },
        { side: 'enemy', slot: 5 }
      ],
      cursor: 0,
      cycle: 0,
      orderIndex: new Map()
    }
  };

  const actionHook = (game, unit, ctx) => doActionOrSkip(game, unit, ctx);

  stepTurn(Game, {
    doActionOrSkip: actionHook,
    processActionChain(){
      return null;
    }
  });

  stepTurn(Game, {
    doActionOrSkip: actionHook,
    processActionChain(){
      return null;
    }
  });

  const allyEnd = eventLog.filter((ev) => ev.type === 'ACTION_END' && ev.detail?.unit?.id === 'leaderA');
  const enemyEnd = eventLog.filter((ev) => ev.type === 'ACTION_END' && ev.detail?.unit?.id === 'leaderB');

  assert.ok(damageLog.length >= 1, 'Phải có ít nhất một hành động BASIC gây sát thương');
  assert.ok(leaderA.hp < 100 || leaderB.hp < 100, 'HP của một leader phải giảm sau đòn đánh');
  assert.ok(
    allyEnd.some((ev) => ev.detail?.action === 'basic')
      || enemyEnd.some((ev) => ev.detail?.action === 'basic'),
    'eventLog phải ghi nhận ACTION_END với action="basic" cho leader'
  );
});

test('creep triệu hồi hành động trước khi TTL bị trừ', async () => {
  const turnsHarness = await loadTurnsHarness();
  const { stepTurn, doActionOrSkip, deps } = turnsHarness;
  const summonHarness = await loadSummonHarness({
    './engine.js': deps['./engine.js'],
    './art.ts': deps['./art.ts'],
    './passives.ts': deps['./passives.ts']
  });

  const { enqueueImmediate, processActionChain } = summonHarness;
  const slotToCell = deps['./engine.js'].slotToCell;

  const allyLeader = { id: 'leaderA', side: 'ally', alive: true, ...slotToCell('ally', 1) };
  const enemyLeader = { id: 'leaderB', side: 'enemy', alive: true, ...slotToCell('enemy', 1) };

  const Game = {
    tokens: [allyLeader, enemyLeader],
    meta: new Map(),
    queued: { ally: new Map(), enemy: new Map() },
    actionChain: [],
    turn: {
      order: [
        { side: 'ally', slot: 1 },
        { side: 'enemy', slot: 1 }
      ],
      cursor: 0,
      cycle: 0,
      orderIndex: new Map()
    }
  };

  const initialTtl = 2;
  const enqueueOk = enqueueImmediate(Game, {
    side: 'ally',
    slot: 2,
    unit: {
      id: 'creepAlpha',
      name: 'Creep',
      isMinion: true,
      ttlTurns: initialTtl,
      hp: 5,
      hpMax: 5
    }
  });
  assert.ok(enqueueOk, 'enqueueImmediate phải trả về true khi slot còn trống');
  assert.strictEqual(Game.actionChain.length, 1, 'actionChain phải chứa yêu cầu summon vừa thêm');

  let ttlDuringAction = null;
  const actionHook = (game, unit, ctx) => {
    if (unit?.id === 'creepAlpha'){
      ttlDuringAction = unit.ttlTurns;
    }
    return doActionOrSkip(game, unit, ctx);
  };

  stepTurn(Game, {
    doActionOrSkip: actionHook,
    processActionChain(Game, side, slot, chainHooks){
      return processActionChain(Game, side, slot, chainHooks);
    }
  });

  const creepToken = Game.tokens.find((t) => t.id === 'creepAlpha');
  assert.ok(creepToken, 'Creep phải tồn tại trong Game.tokens sau processActionChain');
  assert.strictEqual(ttlDuringAction, initialTtl, 'TTL phải được kiểm tra trước khi bị trừ');
  assert.strictEqual(creepToken.ttlTurns, initialTtl - 1, 'TTL phải giảm sau khi phe hoàn tất lượt');
  assert.strictEqual(Game.actionChain.length, 0, 'actionChain phải được dọn sạch sau khi xử lý');
});

test('sparse turn order keeps alternating across cycles', async () => {
  const harness = await loadTurnsHarness();
  const { stepTurn, deps, eventLog } = harness;
  const order = [];
  for (let slot = 1; slot <= 9; slot += 1){
    order.push({ side: 'ally', slot });
    order.push({ side: 'enemy', slot });
  }
  const allyPos = deps['./engine.js'].slotToCell('ally', 2);
  const enemyPos = deps['./engine.js'].slotToCell('enemy', 7);
  const allyUnit = { id: 'allyUnit', side: 'ally', alive: true, ...allyPos };
  const enemyUnit = { id: 'enemyUnit', side: 'enemy', alive: true, ...enemyPos };
  const Game = {
    tokens: [allyUnit, enemyUnit],
    meta: new Map(),
    queued: { ally: new Map(), enemy: new Map() },
    turn: {
      order,
      cursor: 0,
      cycle: 0,
      orderIndex: new Map()
    }
  };

  const calls = [];
  const chains = [];
  const hooks = {
    doActionOrSkip(_, unit){
      calls.push(unit?.id ?? null);
    },
    processActionChain(_, side, slot){
      chains.push(`${side}:${slot}`);
      return null;
    }
  };

  for (let i = 0; i < 4; i += 1){
    stepTurn(Game, hooks);
  }

  const turnStarts = eventLog.filter(ev => ev.type === 'TURN_START').map(ev => ev.detail);
  assert.deepStrictEqual(calls, ['allyUnit', 'enemyUnit', 'allyUnit', 'enemyUnit']);
  assert.deepStrictEqual(chains, ['ally:2', 'enemy:7', 'ally:2', 'enemy:7']);
  assert.strictEqual(Game.turn.cycle, 1);
  assert.deepStrictEqual(turnStarts.map(detail => detail?.slot), [2, 7, 2, 7]);
  assert.deepStrictEqual(turnStarts.map(detail => detail?.cycle), [0, 0, 1, 1]);
});

test('deck spawn auto-casts ultimate and drains fury', async () => {
  const setCalls = [];
  const furyModule = {
    initializeFury(unit, _unitId, initial = 0){
      unit.furyMax = 40;
      furyModule.setFury(unit, initial);
      unit._furyState = { freshSummon: true };
    },
    startFuryTurn(){},
    spendFury(unit, amount){
      unit.fury = Math.max(0, (unit.fury ?? 0) - amount);
    },
    resolveUltCost(unit){
      return unit?.furyMax ?? 0;
    },
    setFury(unit, value){
      setCalls.push(value);
      unit.fury = value;
      return value;
    },
    clearFreshSummon(unit){
      if (unit && unit._furyState){
        unit._furyState.freshSummon = false;
      }
    }
  };
  const harness = await loadTurnsHarness({
    './utils/fury.js': furyModule,
    './statuses.ts': {
      Statuses: {
        onTurnStart(){},
        canAct(){ return true; },
        onTurnEnd(){},
        blocks(){ return false; }
      }
    }
  });
  const { spawnQueuedIfDue } = harness;
  const Game = {
    tokens: [],
    meta: new Map([[ 'deckUnit', { kit: {} } ]]),
    queued: { ally: new Map(), enemy: new Map() },
    turn: { cycle: 0 }
  };
  Game.queued.ally.set(1, {
    unitId: 'deckUnit',
    name: 'Deck Unit',
    side: 'ally',
    cx: 0,
    cy: 0,
    slot: 1,
    spawnCycle: 0,
    source: 'deck'
  });
  const ultCalls = [];
  const hooks = {
    performUlt(unit){
      ultCalls.push(unit);
      furyModule.setFury(unit, 0);
    }
  };

  const result = spawnQueuedIfDue(Game, { side: 'ally', slot: 1 }, hooks);
  assert.strictEqual(result.spawned, true);
  assert.strictEqual(Game.tokens.length, 1);
  const actor = result.actor;
  assert(actor);
  assert.strictEqual(actor, Game.tokens[0]);
  assert.strictEqual(actor.furyMax, 40);
  assert.strictEqual(ultCalls.length, 1);
  assert.strictEqual(ultCalls[0], actor);
  assert.strictEqual(actor.fury, 0);
  assert(setCalls.includes(actor.furyMax));
  assert.strictEqual(actor._furyState?.freshSummon, false);
});

test('revived spawn keeps provided resources without forced ultimate', async () => {
  const setCalls = [];
  const furyModule = {
    initializeFury(unit, _unitId, initial = 0){
      unit.furyMax = 50;
      furyModule.setFury(unit, initial);
      unit._furyState = { freshSummon: true };
    },
    startFuryTurn(){},
    spendFury(unit, amount){
      unit.fury = Math.max(0, (unit.fury ?? 0) - amount);
    },
    resolveUltCost(unit){
      return unit?.furyMax ?? 0;
    },
    setFury(unit, value){
      setCalls.push(value);
      unit.fury = value;
      return value;
    },
    clearFreshSummon(unit){
      if (unit && unit._furyState){
        unit._furyState.freshSummon = false;
      }
    }
  };
  const harness = await loadTurnsHarness({
    './utils/fury.js': furyModule,
    './meta.ts': {
      makeInstanceStats(){
        return { hpMax: 120, hp: 90 };
      },
      initialRageFor(_unitId, opts = {}){
        if (opts.revive){
          return opts.reviveSpec?.rage ?? 0;
        }
        return 0;
      }
    },
    './statuses.ts': {
      Statuses: {
        onTurnStart(){},
        canAct(){ return true; },
        onTurnEnd(){},
        blocks(){ return false; }
      }
    }
  });
  const { spawnQueuedIfDue } = harness;
  const Game = {
    tokens: [],
    meta: new Map([[ 'revivedUnit', { kit: {} } ]]),
    queued: { ally: new Map(), enemy: new Map() },
    turn: { cycle: 0 }
  };
  Game.queued.ally.set(4, {
    unitId: 'revivedUnit',
    name: 'Revived Unit',
    side: 'ally',
    cx: 1,
    cy: 0,
    slot: 4,
    spawnCycle: 0,
    source: 'revive',
    revive: true,
    revived: { rage: 25 }
  });
  const ultCalls = [];
  const hooks = {
    performUlt(unit){
      ultCalls.push(unit);
    }
  };

  const result = spawnQueuedIfDue(Game, { side: 'ally', slot: 4 }, hooks);
  assert.strictEqual(result.spawned, true);
  assert.strictEqual(Game.tokens.length, 1);
  const actor = result.actor;
  assert(actor);
  assert.strictEqual(actor.furyMax, 50);
  assert.strictEqual(actor.fury, 25);
  assert(!setCalls.includes(actor.furyMax));
  assert.strictEqual(ultCalls.length, 0);
  assert.strictEqual(actor._furyState?.freshSummon, true);
});

test('turn regen restores hp and ae each turn without exceeding max', async () => {
  const harness = await loadTurnsHarness({
    './statuses.ts': {
      Statuses: {
        onTurnStart(){},
        canAct(){ return false; },
        onTurnEnd(){},
        blocks(){ return false; }
      }
    },
    './utils/fury.js': {
      initializeFury(){},
      startFuryTurn(){},
      spendFury(){},
      resolveUltCost(){ return 999; },
      setFury(){},
      clearFreshSummon(){ }
    }
  });

  const { doActionOrSkip, deps, eventLog } = harness;
  const statuses = deps['./statuses.ts'].Statuses;
  const startSnapshots = [];
  statuses.onTurnStart = (unit) => {
    startSnapshots.push({ hp: unit.hp, ae: unit.ae });
  };

  const unit = {
    id: 'regenUnit',
    name: 'Regen Unit',
    side: 'ally',
    alive: true,
    cx: 0,
    cy: 0,
    hpMax: 100,
    hp: 50,
    hpRegen: 20,
    aeMax: 40,
    ae: 10,
    aeRegen: 15
  };

  const Game = {
    tokens: [unit],
    meta: new Map([[unit.id, {}]]),
    queued: { ally: new Map(), enemy: new Map() },
    turn: {
      order: [{ side: 'ally', slot: 1 }],
      cursor: 0,
      cycle: 0,
      orderIndex: new Map(),
      busyUntil: 0
    }
  };

  const turnContext = { side: 'ally', slot: 1, orderIndex: 0, orderLength: 1, cycle: 0 };

  for (let i = 0; i < 3; i += 1){
    doActionOrSkip(Game, unit, { performUlt: () => {}, turnContext });
  }

  assert.equal(unit.hp, 100);
  assert.equal(unit.ae, 40);

  const regenEvents = eventLog.filter(ev => ev.type === deps['./events.ts'].TURN_REGEN);
  assert.equal(regenEvents.length, 3);
  assert.deepStrictEqual(
    regenEvents.map(ev => ({ hpDelta: ev.detail.hpDelta, aeDelta: ev.detail.aeDelta })),
    [
      { hpDelta: 20, aeDelta: 15 },
      { hpDelta: 20, aeDelta: 15 },
      { hpDelta: 10, aeDelta: 0 }
    ]
  );

  assert.deepStrictEqual(
    startSnapshots,
    [
      { hp: 70, ae: 25 },
      { hp: 90, ae: 40 },
      { hp: 100, ae: 40 }
    ]
  );
});

test('interleaved mode alternates positions across sides', async () => {
  const harness = await loadTurnsHarness();
  const { stepTurn, deps } = harness;
  const slotToCell = deps['./engine.js'].slotToCell;

  const allyFront = { id: 'allyFront', side: 'ally', alive: true, ...slotToCell('ally', 1) };
  const allyBack = { id: 'allyBack', side: 'ally', alive: true, ...slotToCell('ally', 3) };
  const enemyFront = { id: 'enemyFront', side: 'enemy', alive: true, ...slotToCell('enemy', 1) };
  const enemyBack = { id: 'enemyBack', side: 'enemy', alive: true, ...slotToCell('enemy', 2) };

  const Game = {
    tokens: [allyFront, allyBack, enemyFront, enemyBack],
    meta: new Map(),
    queued: { ally: new Map(), enemy: new Map() },
    turn: {
      mode: 'interleaved_by_position',
      nextSide: 'ALLY',
      lastPos: { ALLY: 0, ENEMY: 0 },
      wrapCount: { ALLY: 0, ENEMY: 0 },
      turnCount: 0,
      slotCount: 9,
      cycle: 0,
      busyUntil: 0
    }
  };

  const actions = [];
  const hooks = {
    doActionOrSkip(_, unit){ actions.push(unit?.id ?? null); },
    processActionChain(){ return null; }
  };

  for (let i = 0; i < 4; i += 1){
    stepTurn(Game, hooks);
  }

  assert.deepStrictEqual(actions, ['allyFront', 'enemyFront', 'allyBack', 'enemyBack']);
  assert.strictEqual(Game.turn.turnCount, 4);
  assert.strictEqual(Game.turn.lastPos.ALLY, 3);
  assert.strictEqual(Game.turn.lastPos.ENEMY, 2);
});

test('interleaved mode skips empty enemy side without stalling', async () => {
  const harness = await loadTurnsHarness();
  const { stepTurn, deps } = harness;
  const slotToCell = deps['./engine.js'].slotToCell;

  const allySolo = { id: 'allySolo', side: 'ally', alive: true, ...slotToCell('ally', 2) };

  const Game = {
    tokens: [allySolo],
    meta: new Map(),
    queued: { ally: new Map(), enemy: new Map() },
    turn: {
      mode: 'interleaved_by_position',
      nextSide: 'ALLY',
      lastPos: { ALLY: 0, ENEMY: 0 },
      wrapCount: { ALLY: 0, ENEMY: 0 },
      turnCount: 0,
      slotCount: 9,
      cycle: 0,
      busyUntil: 0
    }
  };

  const actions = [];
  const hooks = {
    doActionOrSkip(_, unit){ actions.push(unit?.id ?? null); },
    processActionChain(){ return null; }
  };

  for (let i = 0; i < 3; i += 1){
    stepTurn(Game, hooks);
  }

  assert.deepStrictEqual(actions, ['allySolo', 'allySolo', 'allySolo']);
  assert(Game.turn.cycle >= 1);
  assert.strictEqual(Game.turn.wrapCount.ALLY > 0, true);
});

test('summoned unit acts immediately when spawned into empty side', async () => {
  const harness = await loadTurnsHarness();
  const { stepTurn, deps } = harness;
  const slotToCell = deps['./engine.js'].slotToCell;

  const enemySlot = 2;
  const enemyCell = slotToCell('enemy', enemySlot);

  const Game = {
    tokens: [],
    meta: new Map([[ 'enemySummon', { kit: {} } ]]),
    queued: { ally: new Map(), enemy: new Map() },
    turn: {
      mode: 'interleaved_by_position',
      nextSide: 'ENEMY',
      lastPos: { ALLY: 0, ENEMY: 0 },
      wrapCount: { ALLY: 0, ENEMY: 0 },
      turnCount: 0,
      slotCount: 9,
      cycle: 0,
      busyUntil: 0
    }
  };

  Game.queued.enemy.set(enemySlot, {
    unitId: 'enemySummon',
    name: 'Summoned',
    side: 'enemy',
    cx: enemyCell.cx,
    cy: enemyCell.cy,
    slot: enemySlot,
    spawnCycle: 0,
    source: 'deck'
  });

  const actions = [];
  const ultCalls = [];
  const hooks = {
    doActionOrSkip(_, unit){ actions.push(unit?.id ?? null); },
    processActionChain(){ return null; },
    performUlt(unit){ ultCalls.push(unit?.id ?? null); }
  };

  stepTurn(Game, hooks);
  assert.deepStrictEqual(actions, ['enemySummon']);
  assert.strictEqual(Game.tokens.length, 1);
  assert.strictEqual(Game.queued.enemy.has(enemySlot), false);
  assert.deepStrictEqual(ultCalls, ['enemySummon']);
  assert.strictEqual(Game.turn.lastPos.ENEMY, enemySlot);

  stepTurn(Game, hooks);
  assert.deepStrictEqual(actions, ['enemySummon', 'enemySummon']);
});

test('queued ally spawn keeps scan order after enemy turn', async () => {
  const harness = await loadTurnsHarness();
  const { stepTurn, deps, predictSpawnCycle } = harness;
  const slotToCell = deps['./engine.js'].slotToCell;

  const makeUnit = (id, side, slot) => ({ id, side, alive: true, ...slotToCell(side, slot) });

  const allyUnits = [
    makeUnit('allySlot3', 'ally', 3),
    makeUnit('allySlot5', 'ally', 5),
    makeUnit('allySlot8', 'ally', 8)
  ];
  const enemyUnits = [
    makeUnit('enemySlot2', 'enemy', 2),
    makeUnit('enemySlot4', 'enemy', 4),
    makeUnit('enemySlot7', 'enemy', 7),
    makeUnit('enemySlot8', 'enemy', 8)
  ];

  const spawnCell = slotToCell('ally', 2);

  const Game = {
    tokens: [...allyUnits, ...enemyUnits],
    meta: new Map([[ 'allySpawn', { kit: {} } ]]),
    queued: { ally: new Map(), enemy: new Map() },
    turn: {
      mode: 'interleaved_by_position',
      nextSide: 'ALLY',
      lastPos: { ALLY: 5, ENEMY: 4 },
      wrapCount: { ALLY: 0, ENEMY: 0 },
      turnCount: 6,
      slotCount: 9,
      cycle: 0,
      busyUntil: 0
    }
  };

  Game.queued.ally.set(2, {
    unitId: 'allySpawn',
    name: 'Queued Ally',
    side: 'ally',
    cx: spawnCell.cx,
    cy: spawnCell.cy,
    slot: 2,
    spawnCycle: predictSpawnCycle(Game, 'ally', 2),
    source: 'deck'
  });

  const actions = [];
  const hooks = {
    doActionOrSkip(_, unit, opts = {}){
      const ctx = opts.turnContext || {};
      actions.push({ id: unit?.id ?? null, side: ctx.side ?? null, slot: ctx.slot ?? null });
    },
    processActionChain(){ return null; }
  };

  stepTurn(Game, hooks);
  stepTurn(Game, hooks);
  stepTurn(Game, hooks);

  const sequence = actions.map(({ side, slot }) => [side, slot]);
  assert.deepStrictEqual(sequence, [
    ['ally', 8],
    ['enemy', 7],
    ['ally', 2]
  ]);

  assert.strictEqual(actions[2]?.id, 'allySpawn');
  assert.strictEqual(Game.turn.lastPos.ALLY, 2);
  assert.strictEqual(Game.queued.ally.size, 0);
});

test('stunned units are skipped by interleaved scan', async () => {
  const harness = await loadTurnsHarness();
  const { stepTurn, deps } = harness;
  const slotToCell = deps['./engine.js'].slotToCell;

  const stunnedIds = new Set(['enemyStun']);
  deps['./statuses.ts'].Statuses.canAct = (unit) => !stunnedIds.has(unit?.id);
  deps['../statuses.ts'].Statuses = deps['./statuses.ts'].Statuses;atuses = deps['./statuses.js'].Statuses;

  const allyUnit = { id: 'allyUnit', side: 'ally', alive: true, ...slotToCell('ally', 1) };
  const enemyStun = { id: 'enemyStun', side: 'enemy', alive: true, ...slotToCell('enemy', 1) };
  const enemyReady = { id: 'enemyReady', side: 'enemy', alive: true, ...slotToCell('enemy', 2) };

  const Game = {
    tokens: [allyUnit, enemyStun, enemyReady],
    meta: new Map(),
    queued: { ally: new Map(), enemy: new Map() },
    turn: {
      mode: 'interleaved_by_position',
      nextSide: 'ALLY',
      lastPos: { ALLY: 0, ENEMY: 0 },
      wrapCount: { ALLY: 0, ENEMY: 0 },
      turnCount: 0,
      slotCount: 9,
      cycle: 0,
      busyUntil: 0
    }
  };

  const actions = [];
  const hooks = {
    doActionOrSkip(_, unit){ actions.push(unit?.id ?? null); },
    processActionChain(){ return null; }
  };

  for (let i = 0; i < 4; i += 1){
    stepTurn(Game, hooks);
  }

  assert(actions.includes('enemyReady'));
  assert.strictEqual(actions.includes('enemyStun'), false);
});

test('queued spawn is processed even when existing units cannot act', async () => {
  const harness = await loadTurnsHarness();
  const { stepTurn, deps } = harness;
  const slotToCell = deps['./engine.js'].slotToCell;

  const stunnedIds = new Set(['enemySleep']);
  deps['./statuses.ts'].Statuses.canAct = (unit) => !stunnedIds.has(unit?.id);
  deps['../statuses.ts'].Statuses = deps['./statuses.ts'].Statuses;

  const enemySleep = { id: 'enemySleep', side: 'enemy', alive: true, ...slotToCell('enemy', 1) };
  const enemySlot = 3;
  const enemyCell = slotToCell('enemy', enemySlot);

  const Game = {
    tokens: [enemySleep],
    meta: new Map([[ 'enemyFresh', { kit: {} } ]]),
    queued: { ally: new Map(), enemy: new Map() },
    turn: {
      mode: 'interleaved_by_position',
      nextSide: 'ENEMY',
      lastPos: { ALLY: 0, ENEMY: 0 },
      wrapCount: { ALLY: 0, ENEMY: 0 },
      turnCount: 0,
      slotCount: 9,
      cycle: 0,
      busyUntil: 0
    }
  };

  Game.queued.enemy.set(enemySlot, {
    unitId: 'enemyFresh',
    name: 'Fresh',
    side: 'enemy',
    cx: enemyCell.cx,
    cy: enemyCell.cy,
    slot: enemySlot,
    spawnCycle: 0
  });

  const actions = [];
  const hooks = {
    doActionOrSkip(_, unit){ actions.push(unit?.id ?? null); },
    processActionChain(){ return null; }
  };

  stepTurn(Game, hooks);
  assert.deepStrictEqual(actions, ['enemyFresh']);
  assert.strictEqual(Game.tokens.length, 2);
  assert.strictEqual(Game.turn.lastPos.ENEMY, enemySlot);
});