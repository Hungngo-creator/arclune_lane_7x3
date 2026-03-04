// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';

import { loadTurnsHarness } from './helpers/turns-harness.mjs';

function createGameWithUnit(){
  const unit = {
    id: 'mong_yem',
    iid: 'u1',
    side: 'ally',
    cx: 0,
    cy: 0,
    alive: true,
    fury: 0,
    statuses: [],
  };
  return {
    game: {
      tokens: [unit],
      meta: new Map([[unit.id, { followupCap: 0, skills: [{ key: 'skill1', cost: { aether: 20 } }] }]]),
      turn: { cycle: 0, busyUntil: 0 },
      queued: { ally: new Map(), enemy: new Map() },
      battle: { over: false, winner: null },
    },
    unit,
  };
}

test('auto-cast skill khi đủ Aether', async () => {
  let basicCalls = 0;
  const harness = await loadTurnsHarness({
    './ai.ts': {
      evaluateGambitLogic(_game, _unit, ctx){
        if ((ctx?.startIndex ?? 0) === 0) return { action: 'skill1', slotIndex: 0 };
        return { action: null, slotIndex: -1 };
      },
    },
    './combat.js': {
      doBasicWithFollowups(){ basicCalls += 1; },
    },
    './combat/perform-active-skill.ts': {
      performActiveSkill(){
        return { ok: true, appliedTags: ['single-target', 'aether-cost'], targetCount: 1 };
      },
    },
    './utils/fury.js': {
      initializeFury(){},
      startFuryTurn(){},
      spendFury(){},
      resolveUltCost(){ return 100; },
      setFury(){},
      clearFreshSummon(){},
    },
  });

  const { game, unit } = createGameWithUnit();
  const result = harness.doActionOrSkip(game, unit, { performUlt(){} });

  assert.equal(result.acted, true);
  assert.equal(result.reason, null);
  assert.equal(basicCalls, 0);
  assert(harness.eventLog.some((entry) => entry.type === 'ACTION_END' && entry.detail?.action === 'skill1'));
});

test('thiếu Aether thì fallback basic', async () => {
  let basicCalls = 0;
  const harness = await loadTurnsHarness({
    './ai.ts': {
      evaluateGambitLogic(_game, _unit, ctx){
        if ((ctx?.startIndex ?? 0) === 0) return { action: 'skill1', slotIndex: 0 };
        return { action: null, slotIndex: -1 };
      },
    },
    './combat.js': {
      doBasicWithFollowups(){ basicCalls += 1; },
    },
    './combat/perform-active-skill.ts': {
      performActiveSkill(){
        return { ok: false, reason: 'insufficient-aether', appliedTags: ['aether-cost'], targetCount: 0 };
      },
    },
    './utils/fury.js': {
      initializeFury(){},
      startFuryTurn(){},
      spendFury(){},
      resolveUltCost(){ return 100; },
      setFury(){},
      clearFreshSummon(){},
    },
  });

  const { game, unit } = createGameWithUnit();
  const result = harness.doActionOrSkip(game, unit, { performUlt(){} });

  assert.equal(result.acted, true);
  assert.equal(basicCalls, 1);
  assert(harness.eventLog.some((entry) => entry.type === 'ACTION_END' && entry.detail?.action === 'basic'));
});

test('ult vẫn chạy theo Fury, không phụ thuộc Aether', async () => {
  let ultCalls = 0;
  let basicCalls = 0;
  const harness = await loadTurnsHarness({
    './ai.ts': {
      evaluateGambitLogic(){
        return { action: 'ult', slotIndex: 0 };
      },
    },
    './combat.js': {
      doBasicWithFollowups(){ basicCalls += 1; },
    },
    './aether.ts': {
      globalAetherPool: {
        gain(){},
        consume(){ return false; },
        current(){ return 0; },
      },
      resolveActionAetherRegen(){ return 0; },
    },
    './utils/fury.js': {
      initializeFury(){},
      startFuryTurn(){},
      spendFury(){},
      resolveUltCost(){ return 50; },
      setFury(){},
      clearFreshSummon(){},
    },
  });

  const { game, unit } = createGameWithUnit();
  unit.fury = 100;
  const result = harness.doActionOrSkip(game, unit, { performUlt(){ ultCalls += 1; } });

  assert.equal(result.acted, true);
  assert.equal(ultCalls, 1);
  assert.equal(basicCalls, 0);
  assert(harness.eventLog.some((entry) => entry.type === 'ACTION_END' && entry.detail?.action === 'ult'));
});
