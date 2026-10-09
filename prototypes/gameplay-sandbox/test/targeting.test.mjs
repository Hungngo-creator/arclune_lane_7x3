import test from 'node:test';
import assert from 'node:assert/strict';
import { Battle, normalizeKits, replay, validateKits } from '../engine.mjs';
import { KITS, PROFILE_VERSION } from '../profiles.mjs';

const stats = { maxHp: 10000, atk: 100, wil: 100, arm: 0, res: 0 };
const specs = () => [
  { id: 'attacker', kit: 'trainingWarrior', side: 'A', slot: 1, element: 'Neutral', baseStats: stats },
  { id: 'leader-a', kit: 'trainingSupport', side: 'A', slot: 8, leader: true, element: 'Neutral', baseStats: stats },
  { id: 'x', kit: 'trainingWarrior', side: 'B', slot: 5, element: 'Neutral', baseStats: stats },
  { id: 'y', kit: 'trainingWarrior', side: 'B', slot: 6, element: 'Neutral', baseStats: stats },
  { id: 'leader-b', kit: 'trainingSupport', side: 'B', slot: 8, leader: true, element: 'Neutral', baseStats: stats },
];
const battle = (kits = KITS, units = specs(), options = {}) => new Battle({ rankEnabled: false, classBonusEnabled: false, elementBonusEnabled: false, startingAE: 100, hitChance: 1, ...options }, units, kits);
const events = (b, type) => b.trace.filter(e => e.type === type);
const selectedInput = b => b.lockTargets(b.selectTargets(b.unit('attacker'), 'basic', 'x'));
// Fixture commits before impact, not a gameplay movement operation/callback.
// Full movement/interposition/SSI/lifecycle integration remains unsupported.
const relocate = (b, replacement = true) => { b.unit('x').slot = 7; if (replacement) b.unit('y').slot = 5; };

test('selectable Slot attack hits replacement occupant, or misses an empty Slot without chasing', () => {
  for (const replacement of [true, false]) for (const reverse of [true, false]) {
    const b = battle(), input = selectedInput(b), beforeRng = b.rngState;
    relocate(b, replacement); if (reverse) b.units.reverse();
    b.runAction(b.unit('attacker'), 'basic', input);
    assert.equal(b.unit('x').hp, 10000);
    assert.equal(b.unit('y').hp, replacement ? 9800 : 10000);
    assert.equal(b.rngState, beforeRng);
    assert.deepEqual(events(b, 'ACTION_BEGIN')[0].targetLock.positions, [{ side: 'B', slot: 5 }]);
    assert.deepEqual(events(b, 'DAMAGE_RECEIPT').map(e => e.targetId), replacement ? ['y'] : []);
    assert.equal(events(b, 'TARGET_MISSED').length, replacement ? 0 : 1);
  }
});

test('approved Phần Tinh Entity attacks follow the original; invalid identity has no replacement', () => {
  for (const abilityId of ['basic', 'skill1', 'ultimate']) {
    const units = specs(); units[0].kit = 'phanTinh';
    const b = battle(KITS, units, { startingRage: abilityId === 'ultimate' ? 100 : 0 });
    const attacker = b.unit('attacker'), chosen = b.selectTargets(attacker, abilityId, 'x');
    const input = b.lockTargets(chosen);
    relocate(b);
    b.runAction(attacker, abilityId, input);
    const receipts = events(b, 'DAMAGE_RECEIPT');
    assert.ok(receipts.some(e => e.targetId === 'x'));
    assert.equal(b.kit(attacker).abilities[abilityId].target.binding, 'ENTITY');
    assert.equal(events(b, 'DAMAGE_TARGETS_RESOLVED')[0].binding, 'ENTITY');
  }
  const units = specs(); units[0].kit = 'phanTinh';
  const b = battle(KITS, units), input = selectedInput(b);
  relocate(b); b.unit('x').present = false;
  b.runAction(b.unit('attacker'), 'basic', input);
  assert.equal(b.unit('y').hp, 10000);
  assert.equal(events(b, 'DAMAGE_RECEIPT').length, 0);
  assert.equal(events(b, 'TARGET_MISSED')[0].reason, 'LOCKED_ENTITY_INVALID');
});

test('root Entity exception cannot propagate to unbound Damage or child attack owners', () => {
  const kits = structuredClone(KITS), ability = kits.trainingWarrior.abilities.basic;
  ability.target.binding = 'ENTITY';
  delete ability.effects[0].binding;
  ability.effects.push({ ...structuredClone(ability.effects[0]), binding: 'ENTITY' });
  const child = kits.trainingWarrior.abilities.skill1;
  delete child.target.binding; delete child.effects[0].binding;
  ability.effects.push({ op: 'CHILD', ability: 'skill1', waiveAE: true });
  const before = structuredClone(kits), normalized = normalizeKits(kits);
  assert.deepEqual(kits, before);
  const b = battle(kits), input = selectedInput(b); relocate(b);
  b.runAction(b.unit('attacker'), 'basic', input);
  assert.deepEqual(events(b, 'DAMAGE_RECEIPT').map(e => e.targetId), ['y', 'x', 'y']);
  assert.deepEqual(events(b, 'DAMAGE_TARGETS_RESOLVED').map(e => e.binding), ['POSITION', 'ENTITY', 'POSITION']);
  assert.deepEqual(events(b, 'ACTION_BEGIN').map(e => e.targetLock.binding), ['ENTITY', 'POSITION']);
  assert.equal(normalized.trainingWarrior.abilities.skill1.target.binding, 'POSITION');
  assert.equal(normalized.trainingWarrior.abilities.skill1.effects[0].binding, 'POSITION');
});

test('Taunt constrains selection then retains the selected Slot; late Taunt cannot retarget', () => {
  const units = specs(); units[2].kit = 'gideon';
  const b = battle(KITS, units), attacker = b.unit('attacker'), x = b.unit('x');
  const ordinary = b.lockTargets(b.selectTargets(attacker, 'basic', 'y'));
  b.runAction(x, 'skill3', [x], { waiveAE: true });
  assert.deepEqual(b.targetChoices(attacker, 'basic').map(u => u.id), ['x']);
  const forced = b.lockTargets(b.selectTargets(attacker, 'basic', 'y'));
  assert.deepEqual(forced.positions, [{ side: 'B', slot: 5 }]);
  relocate(b);
  b.runAction(attacker, 'basic', forced);
  assert.deepEqual(events(b, 'DAMAGE_RECEIPT').map(e => e.targetId), ['y']);
  assert.equal(x.hp, 10000);
  const late = battle(KITS, units), a = late.unit('attacker');
  late.runAction(late.unit('x'), 'skill3', [late.unit('x')], { waiveAE: true });
  late.runAction(a, 'basic', ordinary);
  assert.deepEqual(events(late, 'DAMAGE_RECEIPT').map(e => e.targetId), ['y']);
  assert.equal(late.unit('x').hp, 10000);
});

test('fixed Slot and selected AoE keep coordinates; neither becomes a selectable single', () => {
  const b = battle(), actor = b.unit('attacker');
  const fixed = b.lockTargets(b.selectTargets(actor, 'skill2'));
  b.unit('leader-b').slot = 9; b.unit('y').slot = 8;
  b.runAction(actor, 'skill2', fixed);
  assert.deepEqual(events(b, 'DAMAGE_RECEIPT').map(e => e.targetId), ['y']);
  const area = battle(KITS, specs(), { startingRage: 100 }), a = area.unit('attacker');
  const input = area.lockTargets(area.selectTargets(a, 'ultimate'));
  area.unit('x').slot = 7; // Original selected Slot5 now empty; do not add7.
  area.unit('y').slot = 5; // Replacement at selected5, selected6 now empty.
  area.runAction(a, 'ultimate', input, { waiveAE: true });
  assert.deepEqual(events(area, 'DAMAGE_RECEIPT').map(e => e.targetId), ['y', 'leader-b']);
  assert.equal(area.unit('x').hp, 10000);
});

test('Slot miss is not Guaranteed Hit, and Skill2 status uses the resolved recipient', () => {
  const units = specs(); units[0].kit = 'gideon';
  const kits = structuredClone(KITS); kits.gideon.abilities.skill2.effects[1].chance = 1;
  const b = battle(kits, units, { hitChance: 0 });
  const input = b.lockTargets(b.selectTargets(b.unit('attacker'), 'skill2', 'x'));
  relocate(b); b.runAction(b.unit('attacker'), 'skill2', input);
  assert.equal(events(b, 'HIT_MISSED').length, 1);
  assert.equal(events(b, 'DAMAGE_RECEIPT').length, 0);
  assert.equal(b.unit('y').stunned, true); assert.equal(b.unit('x').stunned, false);
  const empty = battle(kits, units), selection = selectedInput(empty); relocate(empty, false);
  empty.runAction(empty.unit('attacker'), 'skill2', selection);
  assert.equal(events(empty, 'STUN_RESULT').length, 0);
  assert.equal(events(empty, 'RNG').length, 0);
});

test('non-attack Heal retains explicitly authored Entity reference after movement', () => {
  const b = battle(), leader = b.unit('leader-b');
  b.unit('x').hp = 9000;
  const input = b.lockTargets(b.selectTargets(leader, 'skill1', 'x'));
  relocate(b); b.runAction(leader, 'skill1', input);
  assert.equal(b.unit('x').hp, 9250); assert.equal(b.unit('y').hp, 10000);
});

test('unsupported binding/checkpoint/invalidation and malformed executable plans fail closed', () => {
  for (const mutation of [
    k => { k.trainingWarrior.abilities.basic.target.binding = 'BOTH'; },
    k => { k.trainingWarrior.abilities.basic.effects[0].binding = 'INHERIT_PARENT'; },
    k => { delete k.trainingWarrior.abilities.basic.effects[0].recipientCheckpoint; },
    k => { k.trainingWarrior.abilities.basic.effects[0].emptyPolicy = 'CHASE_ENTITY'; },
    k => { k.trainingWarrior.abilities.basic.effects[0].invalidPolicy = 'REROLL'; },
  ]) { const kits = structuredClone(KITS); mutation(kits); assert.throws(() => validateKits(kits)); }
  const b = battle(); delete b.kits.trainingWarrior.abilities.basic.target.binding;
  const before = b.snapshot();
  assert.throws(() => b.runAction(b.unit('attacker'), 'basic', [b.unit('x')]), /Unresolved/);
  assert.deepEqual(b.snapshot(), before);
  const malformed = battle(); delete malformed.kits.trainingWarrior.abilities.basic.effects[0].binding;
  assert.throws(() => malformed.runAction(malformed.unit('attacker'), 'basic', [malformed.unit('x')]), /Unresolved/);
  assert.equal(events(malformed, 'DAMAGE_RECEIPT').length, 0);
});

test('v1 replay rejects instead of reinterpreting old Entity-default commands', () => {
  const b = new Battle(); b.step('basic', 'b-guard');
  const data = b.exportReplay(); assert.equal(data.format, PROFILE_VERSION);
  assert.deepEqual(replay(data).snapshot(), b.snapshot());
  const old = structuredClone(data); old.format = 'sandbox-v1';
  old.sourceRef = '064f71758fd20b46472e0a834f70bc7106975e9c';
  assert.throws(() => replay(old), /Unsupported replay/);
});
