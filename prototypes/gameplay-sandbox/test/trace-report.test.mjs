import test from 'node:test';
import assert from 'node:assert/strict';
import { Battle } from '../engine.mjs';
import { summarizeTrace, traceReport } from '../trace-report.mjs';

test('summary counts exact ActualHP receipts once, includes HP Cost separately and distinguishes CC', () => {
  const source = { options: {}, outcome: 'DRAW', trace: [
    { type: 'OPPORTUNITY_BEGIN', actorId: 'a' },
    { type: 'COST_COMMITTED', actorId: 'a', ae: 25, hp: 15 },
    { type: 'ACTION_BEGIN', seq: 3, actionId: 'x', actorId: 'a', abilityId: 'skill1', natural: true, targets: ['b'] },
    { type: 'DAMAGE_RECEIPT', actionId: 'x', actorId: 'a', targetId: 'b', actualHpDamage: 900, shieldAbsorbed: 100, overkill: 200, components: [{ actualHpDamage: 450 }, { actualHpDamage: 450 }] },
    { type: 'HEAL_RECEIPT', cause: 'x', actorId: 'a', requested: 70, actual: 35 },
    { type: 'OPPORTUNITY_END', actorId: 'a' },
    { type: 'OPPORTUNITY_BEGIN', actorId: 'b' },
    { type: 'CC_OPPORTUNITY_LOST', actorId: 'b' },
    { type: 'OPPORTUNITY_END', actorId: 'b' },
    { type: 'SANDBOX_LIMIT' },
  ] };
  const before = structuredClone(source), s = summarizeTrace(source);
  assert.deepEqual(source, before);
  assert.equal(s.progress.ending, 'SANDBOX_LIMIT'); assert.equal(s.progress.consumedOpportunities, 2);
  const a = s.actors.find(a => a.actorId === 'a'), b = s.actors.find(a => a.actorId === 'b');
  assert.equal(a.damageDealt, 900); assert.equal(a.hpCostPaid, 15); assert.equal(a.healingReceived, 35);
  assert.equal(b.damageReceived, 900); assert.equal(b.naturalActions, 0); assert.equal(b.ccLostOpportunities, 1);
});

test('long seed79 case stops at existing cap; bounded report stays small and full trace lossless', () => {
  const b = new Battle(); b.step('skill1');
  while (!b.outcome) { const a = b.chooseAI(); b.step(a.abilityId, a.targetId); }
  assert.equal(b.outcome, 'DRAW'); assert.equal(b.opportunities, 400);
  assert.equal(b.trace.at(-1).type, 'SANDBOX_LIMIT'); assert.equal(b.active, null);
  assert.throws(() => b.step(), /ended/);
  const before = b.snapshot(), s = traceReport(b);
  assert.equal(s.progress.ending, 'SANDBOX_LIMIT');
  assert.equal(s.firstActions.length, 6); assert.equal(s.recentActions.length, 12);
  assert.ok(Buffer.byteLength(JSON.stringify(s)) < 15000);
  assert.deepEqual(traceReport(b, 'full').trace, b.trace);
  assert.deepEqual(b.snapshot(), before);
});

test('alternate first decision reproduces quick ending and reports its terminal reason', () => {
  const b = new Battle(); b.step('skill2', 'b-guard');
  while (!b.outcome) { const a = b.chooseAI(); b.step(a.abilityId, a.targetId); }
  const s = traceReport(b);
  assert.equal(b.opportunities, 34); assert.equal(s.outcome, 'B');
  assert.equal(s.progress.ending, 'TERMINAL_LEADER_DEATH_OR_EXTINCTION');
  assert.throws(() => traceReport(b, 'unknown'), /Unsupported/);
});
