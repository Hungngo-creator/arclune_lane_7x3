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
    ["import { vfxAddSpawn } from './vfx.js';", "const { vfxAddSpawn } = __deps['./vfx.js'];"],
    ["import { getUnitArt } from './art.js';", "const { getUnitArt } = __deps['./art.js'];"],
    ["import { emitPassiveEvent, applyOnSpawnEffects, prepareUnitForPassives } from './passives.js';", "const { emitPassiveEvent, applyOnSpawnEffects, prepareUnitForPassives } = __deps['./passives.js'];"],
    ["import { emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END } from './events.js';", "const { emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END } = __deps['./events.js'];"],
    ["import { safeNow } from './utils/time.js';", "const { safeNow } = __deps['./utils/time.js'];"],
    ["import { initializeFury, startFuryTurn, spendFury, resolveUltCost, setFury } from './utils/fury.js';", "const { initializeFury, startFuryTurn, spendFury, resolveUltCost, setFury } = __deps['./utils/fury.js'];"]
  ]);

  for (const [needle, replacement] of replacements.entries()){
    code = code.replace(needle, replacement);
  }

  code = code.replace(/export function /g, 'function ');
  code = code.replace(/export const /g, 'const ');
  code += '\nmodule.exports = { stepTurn, spawnQueuedIfDue, tickMinionTTL, getActiveAt, predictSpawnCycle };\n';

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
      vfxAddSpawn(){ }
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
      ACTION_END: 'ACTION_END'
    },
    './utils/time.js': {
      safeNow(){ return 0; }
    },
    './utils/fury.js': {
      initializeFury(){ },
      startFuryTurn(){ },
      spendFury(){ },
      resolveUltCost(){ return 0; },
      setFury(){ }
    }
  };

  const deps = { ...defaultDeps, ...overrides };
  const context = {
    module: { exports: {} },
    exports: {},
    __deps: deps
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
