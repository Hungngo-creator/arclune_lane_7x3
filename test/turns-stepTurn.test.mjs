import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

async function loadTurnsHarness(overrides = {}){
  const here = path.dirname(fileURLToPath(import.meta.url));
  const filePath = path.resolve(here, '../src/turns.js');
  let code = await fs.readFile(filePath, 'utf8');

  const replacements = new Map([
    ["import { slotToCell, slotIndex } from './engine.js';", "const { slotToCell, slotIndex } = __deps['./engine.js'];"],
    ["import { Statuses } from './statuses.js';", "const { Statuses } = __deps['./statuses.js'];"],
    ["import { doBasicWithFollowups } from './combat.js';", "const { doBasicWithFollowups } = __deps['./combat.js'];"],
    ["import { CFG } from './config.js';", "const { CFG } = __deps['./config.js'];"],
    ["import { makeInstanceStats, initialRageFor } from './meta.js';", "const { makeInstanceStats, initialRageFor } = __deps['./meta.js'];"],
    ["import { vfxAddSpawn, vfxAddBloodPulse } from './vfx.js';", "const { vfxAddSpawn, vfxAddBloodPulse } = __deps['./vfx.js'];"],
    ["import { getUnitArt } from './art.js';", "const { getUnitArt } = __deps['./art.js'];"],
    ["import { emitPassiveEvent, applyOnSpawnEffects, prepareUnitForPassives } from './passives.js';", "const { emitPassiveEvent, applyOnSpawnEffects, prepareUnitForPassives } = __deps['./passives.js'];"],
    ["import { emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END, TURN_REGEN } from './events.js';", "const { emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END, TURN_REGEN } = __deps['./events.js'];"],
    ["import { safeNow } from './utils/time.js';", "const { safeNow } = __deps['./utils/time.js'];"],
    ["import { initializeFury, startFuryTurn, spendFury, resolveUltCost, setFury, clearFreshSummon } from './utils/fury.js';", "const { initializeFury, startFuryTurn, spendFury, resolveUltCost, setFury, clearFreshSummon } = __deps['./utils/fury.js'];"],
    ["import { nextTurnInterleaved } from './turns/interleaved.js';", "const { nextTurnInterleaved } = __deps['./turns/interleaved.js'];"],
    ['import { nextTurnInterleaved } from "./turns/interleaved.js";', "const { nextTurnInterleaved } = __deps['./turns/interleaved.js'];"]
  ]);

  for (const [needle, replacement] of replacements.entries()){
    code = code.replace(needle, replacement);
  }

  code = code.replace(/export function /g, 'function ');
  code = code.replace(/export const /g, 'const ');
  code += '\nmodule.exports = { stepTurn, spawnQueuedIfDue, tickMinionTTL, getActiveAt, predictSpawnCycle, doActionOrSkip };\n';

  const eventLog = [];
  const defaultDeps = {
    './engine.js': {
      slotToCell(side, slot){
        const index = Math.max(0, (slot|0) - 1);
        const baseCol = Math.floor(index / 3);
        const cy = index % 3;
        const cx = side === 'enemy' ? baseCol + 3 : baseCol;
        return { cx, cy };
      },
      slotIndex(side, cx, cy){
        const baseCol = side === 'enemy' ? cx - 3 : cx;
        return baseCol * 3 + cy + 1;
      }
    },
    './statuses.js': {
      Statuses: {
        onTurnStart(){},
        canAct(){ return true; },
        onTurnEnd(){},
        blocks(){ return false; }
      }
    },
    './combat.js': {
      doBasicWithFollowups(){ }
    },
    './config.js': {
      CFG: {
        fury: { turn: { startGain: 0 } },
        FOLLOWUP_CAP_DEFAULT: 0
      }
    },
    './meta.js': {
      makeInstanceStats(){ return {}; },
      initialRageFor(){ return 0; }
    },
    './vfx.js': {
      vfxAddSpawn(){ },
      vfxAddBloodPulse(){ }
    },
    './art.js': {
      getUnitArt(){ return {}; }
    },
    './passives.js': {
      emitPassiveEvent(){ },
      applyOnSpawnEffects(){ },
      prepareUnitForPassives(){ }
    },
    './events.js': {
      emitGameEvent(type, detail){
        eventLog.push({ type, detail });
      },
      TURN_START: 'TURN_START',
      TURN_END: 'TURN_END',
      ACTION_START: 'ACTION_START',
      ACTION_END: 'ACTION_END',
      TURN_REGEN: 'turn:regen'
    },
    './utils/time.js': {
      safeNow(){ return 0; }
    },
    './utils/fury.js': {
      initializeFury(){ },
      startFuryTurn(){ },
      spendFury(){ },
      resolveUltCost(){ return 0; },
      setFury(){ },
      clearFreshSummon(){ }
},
    './turns/interleaved.js': null
  };

  const deps = { ...defaultDeps, ...overrides };
  deps['../engine.js'] = deps['../engine.js'] || deps['./engine.js'];
  deps['../statuses.js'] = deps['../statuses.js'] || deps['./statuses.js'];

  const interleavedKey = './turns/interleaved.js';
  const interleavedAltKey = '../turns/interleaved.js';
  let interleavedModule = deps[interleavedKey] || deps[interleavedAltKey];
  if (!interleavedModule){
    const interleavedPath = path.resolve(here, '../src/turns/interleaved.js');
    let interleavedCode = await fs.readFile(interleavedPath, 'utf8');
    const interleavedReplacements = new Map([
      ["import { slotIndex } from '../engine.js';", "const { slotIndex } = __deps['../engine.js'];"],
      ["import { Statuses } from '../statuses.js';", "const { Statuses } = __deps['../statuses.js'];"]
    ]);
    for (const [needle, replacement] of interleavedReplacements.entries()){
      interleavedCode = interleavedCode.replace(needle, replacement);
    }
    interleavedCode = interleavedCode.replace(/export function /g, 'function ');
    interleavedCode += '\nmodule.exports = { findNextOccupiedPos, nextTurnInterleaved };\n';
    const interleavedContext = {
      module: { exports: {} },
      exports: {},
      __deps: deps
    };
    vm.createContext(interleavedContext);
    const interleavedScript = new vm.Script(interleavedCode, { filename: 'turns/interleaved.js' });
    interleavedScript.runInContext(interleavedContext);
    interleavedModule = interleavedContext.module.exports;
  }
  if (!interleavedModule){
    throw new Error('loadTurnsHarness: missing ./turns/interleaved.js dependency');
  }
  if (typeof interleavedModule.nextTurnInterleaved !== 'function'){
    throw new Error('loadTurnsHarness: nextTurnInterleaved helper is unavailable');
  }
  deps[interleavedKey] = interleavedModule;
  deps[interleavedAltKey] = interleavedModule;
  const context = {
    module: { exports: {} },
    exports: {},
    __deps: deps,
    nextTurnInterleaved: interleavedModule.nextTurnInterleaved
  };
  vm.createContext(context);
  const script = new vm.Script(code, { filename: 'turns.js' });
  script.runInContext(context);
  return { ...context.module.exports, deps, eventLog };
}

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
    './statuses.js': {
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
    './meta.js': {
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
    './statuses.js': {
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
    './statuses.js': {
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
  const statuses = deps['./statuses.js'].Statuses;
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

  const regenEvents = eventLog.filter(ev => ev.type === deps['./events.js'].TURN_REGEN);
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
  deps['./statuses.js'].Statuses.canAct = (unit) => !stunnedIds.has(unit?.id);
  deps['../statuses.js'].Statuses = deps['./statuses.js'].Statuses;

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
  deps['./statuses.js'].Statuses.canAct = (unit) => !stunnedIds.has(unit?.id);
  deps['../statuses.js'].Statuses = deps['./statuses.js'].Statuses;

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