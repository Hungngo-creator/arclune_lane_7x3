import test from 'node:test';
import assert from 'node:assert/strict';
import { Battle, matchup, replay, validateKits } from '../engine.mjs';
import { KITS, AE_BY_CLASS, RANK_MULT, ELEMENT_COUNTER, DEFAULT_OPTIONS } from '../profiles.mjs';

const clone = structuredClone;
const EPS = 1e-7;
const base = { maxHp: 10000, atk: 100, wil: 100, arm: 0, res: 0 };
const specs = () => [
  { id: 'guard', kit: 'gideon', side: 'A', slot: 1, element: 'Neutral', baseStats: base, hp: 8000 },
  { id: 'leader-a', kit: 'trainingSupport', side: 'A', slot: 8, leader: true, element: 'Neutral', baseStats: base, hp: 7000 },
  { id: 'enemy', kit: 'trainingWarrior', side: 'B', slot: 1, element: 'Neutral', baseStats: base },
  { id: 'leader-b', kit: 'trainingSupport', side: 'B', slot: 8, leader: true, element: 'Neutral', baseStats: base },
];
const battle = (options = {}, units = specs(), kits = KITS) => new Battle({ rankEnabled: false, classBonusEnabled: false, elementBonusEnabled: false, hitChance: 1, ...options }, units, kits);
const events = (b, type) => b.trace.filter(e => e.type === type);
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`);
const constant = (amount, type = 'PHYSICAL') => ({ type, amount: { constant: amount } });
const hostileKit = (effects) => { const k = clone(KITS); k.trainingWarrior.abilities.basic.effects = effects; return k; };
const damage = (...amounts) => ({ op: 'DAMAGE', binding: 'POSITION', recipientCheckpoint: 'PRE_DAMAGE', emptyPolicy: 'MISS', invalidPolicy: 'SKIP', components: amounts.map(n => constant(n)) });
function basicStep(b) {
  if (b.active.blocked) return b.step();
  const u = b.unit(b.active.actorId), id = b.ultimateReady(u) ? 'ultimate' : 'basic';
  const choices = b.targetChoices(u, id);
  return b.step(id, choices[0]?.id);
}
function nextGuard(b) {
  for (let i = 0; i < 10 && b.active?.actorId !== 'guard'; i++) basicStep(b);
  assert.equal(b.active?.actorId, 'guard');
}

test('canonical AE class table and additive class/element bonuses', () => {
  assert.deepEqual(AE_BY_CLASS, { Support: 10, Mage: 7, Summoner: 7, Warrior: 5, Tanker: 5, Ranger: 5, Assassin: 3 });
  const result = matchup({ class: 'Mage', element: 'Fire' }, { class: 'Warrior', element: 'Metal' }, DEFAULT_OPTIONS);
  assert.equal(result.classBonus, .1); assert.equal(result.elementBonus, .1); close(result.multiplier, 1.2);
  for (const element of ['Neutral', 'Wind']) assert.equal(matchup({ class: 'Mage', element }, { class: 'Mage', element: 'Fire' }, DEFAULT_OPTIONS).elementBonus, 0);
  for (const [source, targets] of Object.entries(ELEMENT_COUNTER)) for (const target of targets) assert.equal(matchup({ class: 'Mage', element: source }, { class: 'Mage', element: target }, DEFAULT_OPTIONS).elementBonus, .1);
});

test('experimental rank scales each stat once, never AE or direct Damage again', () => {
  const b = battle({ rankEnabled: true, startingAE: 10 });
  const g = b.unit('guard'); close(g.stats.atk, base.atk * RANK_MULT.SSR); close(g.stats.maxHp, base.maxHp * RANK_MULT.SSR);
  close(b.ae.A, 10);
  b.runAction(g, 'basic', [b.unit('enemy')]);
  close(events(b, 'DAMAGE_RECEIPT').at(-1).actualHpDamage, 220);
});

test('actual completed Basic/Ultimate use runtime Effective Class across all seven classes', () => {
  for (const [cls, amount] of Object.entries(AE_BY_CLASS)) for (const form of ['basic', 'ultimate']) {
    const units = specs(); units[0].kit = 'trainingWarrior'; units[0].class = cls;
    const b = battle({ startingAE: 0, startingRage: form === 'ultimate' ? 100 : 0 }, units);
    b.step(form, 'enemy'); close(b.ae.A, amount);
    assert.equal(events(b, 'AE_GRANTED').filter(e => e.side === 'A').length, 1);
  }
});

test('mixed components mitigate independently and preserve proportional receipts', () => {
  const units = specs(); units[0].baseStats = { ...base, arm: 100, res: 300 };
  const b = battle({}, units, hostileKit([{ ...damage(), components: [constant(1000), constant(1000, 'WILL')] }]));
  b.runAction(b.unit('enemy'), 'basic', [b.unit('guard')]);
  const r = events(b, 'DAMAGE_RECEIPT').at(-1);
  close(r.actualHpDamage, 750); close(r.components[0].actualHpDamage, 500); close(r.components[1].actualHpDamage, 250);
});

test('Q1 strict threshold aggregates all packets of one exact Action', () => {
  const units = specs(); units[0].hp = 5000;
  const b = battle({}, units, hostileKit([damage(1600), damage(1500)]));
  b.runAction(b.unit('enemy'), 'basic', [b.unit('guard')]);
  close(b.maxHp(b.unit('guard')), 11300); close(b.unit('guard').hp, 1900);
  assert.equal(events(b, 'PASSIVE_THRESHOLD').filter(e => e.qualified).length, 1);
  const exact = battle({}, units, hostileKit([damage(3000)]));
  exact.runAction(exact.unit('enemy'), 'basic', [exact.unit('guard')]);
  close(exact.maxHp(exact.unit('guard')), 10000);
});

test('Q1 action-start threshold differs from live gain basis after mid-action MaxHP mutation', () => {
  const units = specs(); units[0].hp = 5000;
  const b = battle({}, units, hostileKit([damage(3100), { op: 'MAX_HP', recipient: 'TARGET', source: 'foreign', amount: { constant: 10000 } }]));
  b.runAction(b.unit('enemy'), 'basic', [b.unit('guard')]);
  close(b.maxHp(b.unit('guard')), 22600); close(b.unit('guard').hp, 1900);
  assert.equal(events(b, 'PASSIVE_THRESHOLD').at(-1).actionStartMaxHp, 10000);
  close(b.unit('guard').maxHpContributions.passive, 2600);
});

test('Q1 distinct Actions, including same-root children, do not combine receipts', () => {
  const b = battle({}, specs(), hostileKit([damage(1600)]));
  b.runAction(b.unit('enemy'), 'basic', [b.unit('guard')], { rootId: 'shared-root', parentId: 'parent' });
  b.runAction(b.unit('enemy'), 'basic', [b.unit('guard')], { rootId: 'shared-root', parentId: 'parent' });
  close(b.maxHp(b.unit('guard')), 10000);
  assert.equal(events(b, 'PASSIVE_THRESHOLD').filter(e => e.qualified).length, 0);
});

test('Q1 excludes Shield absorption and overkill; HP_ZERO reset precedes qualification', () => {
  const units = specs(); units[0].shield = 4000; units[0].hp = 2000;
  const shield = battle({}, units, hostileKit([damage(3100)]));
  shield.runAction(shield.unit('enemy'), 'basic', [shield.unit('guard')]);
  close(events(shield, 'DAMAGE_RECEIPT').at(-1).actualHpDamage, 0);
  close(shield.maxHp(shield.unit('guard')), 10000);
  const killed = battle({}, units, hostileKit([damage(20000)]));
  killed.changeMaxHp(killed.unit('guard'), 'passive', 1300, 'fixture');
  killed.runAction(killed.unit('enemy'), 'basic', [killed.unit('guard')]);
  close(events(killed, 'DAMAGE_RECEIPT').at(-1).actualHpDamage, 2000);
  close(killed.maxHp(killed.unit('guard')), 10000);
  assert.equal(killed.unit('guard').alive, false);
});

test('Q2 source-only removal preserves/clamps absolute HP without synthetic Heal/Damage', () => {
  const b = battle(), g = b.unit('guard');
  b.changeMaxHp(g, 'foreign', 1000, 'fixture'); b.changeMaxHp(g, 'passive', 1430, 'fixture');
  close(g.hp, 8000); close(b.maxHp(g), 12430);
  b.heal(g, 4000, 'fixture'); close(g.hp, 12000);
  const before = b.trace.length;
  b.changeMaxHp(g, 'passive', 0, 'RESET', true);
  close(g.hp, 11000); close(b.maxHp(g), 11000); close(g.maxHpContributions.foreign, 1000);
  assert.deepEqual(b.trace.slice(before).map(e => e.type), ['MAX_HP_RECONCILED']);
});

test('Q3 activation does not heal; first later opportunity heals live MaxHP; second expires first', () => {
  const b = battle({ startingAE: 10 }), g = b.unit('guard');
  b.step('basic', 'enemy');
  assert.ok(g.states.guard); assert.equal(events(b, 'HEAL_RECEIPT').length, 0);
  b.changeMaxHp(g, 'foreign', 1000, 'fixture');
  nextGuard(b);
  const tick = events(b, 'PERIODIC_HEAL_CHECKPOINT').at(-1); close(tick.amount, 440);
  assert.equal(events(b, 'HEAL_RECEIPT').filter(e => e.cause.startsWith('state:')).length, 2);
  // Keep HP below auto gate so the next performed Action cannot refresh.
  g.hp = 6000;
  b.step('basic', 'enemy'); nextGuard(b);
  assert.equal(g.states.guard, undefined);
  assert.equal(events(b, 'PERIODIC_HEAL_CHECKPOINT').length, 1);
});

test('Q4 Skill1 covers both later opportunities and expires only after second consumption', () => {
  const b = battle({ startingAE: 60 }), g = b.unit('guard');
  b.step('skill1', null); close(b.stats(g).arm, base.arm); assert.ok(g.states.defense);
  nextGuard(b); assert.ok(g.states.defense); b.step('basic', 'enemy');
  nextGuard(b); assert.ok(g.states.defense); b.step('basic', 'enemy');
  assert.equal(g.states.defense, undefined);
  assert.equal(events(b, 'STATE_EXPIRED').find(e => e.family === 'defense').phase, 'OPPORTUNITY_END');
});

test('Q4 CC loss preserves eligible start heal, advances CD/duration, gives no class AE or new waiting', () => {
  const b = battle({ startingAE: 60 }), g = b.unit('guard');
  b.step('skill1', null); assert.ok(g.states.guard); g.stunned = true;
  nextGuard(b);
  assert.equal(b.active.blocked, true); assert.equal(g.opportunity, 2); assert.equal(Math.max(0, g.cdReadyAt - g.opportunity), 0);
  assert.equal(events(b, 'PERIODIC_HEAL_CHECKPOINT').length, 1);
  const before = b.trace.length, ae = b.ae.A;
  b.step(); assert.equal(g.waiting, false); close(b.ae.A, ae);
  assert.equal(b.trace.slice(before).filter(e => e.type === 'ACTION_BEGIN' || e.type === 'AE_GRANTED').length, 0);
  assert.ok(g.states.defense); g.stunned = true; nextGuard(b); assert.equal(g.states.guard, undefined); b.step();
  assert.equal(g.states.defense, undefined);
});

test('Q4 Skill1 refresh excludes creating opportunity and never compounds its own modifier', () => {
  const units = specs(); units[0].baseStats = { ...base, arm: 200, res: 300 };
  const b = battle({ startingAE: 100 }, units), g = b.unit('guard');
  b.step('skill1'); close(b.stats(g).arm, 220); close(b.stats(g).res, 330);
  nextGuard(b); const old = g.states.defense.revision; b.step('skill1');
  assert.notEqual(g.states.defense.revision, old); close(b.stats(g).arm, 220);
  nextGuard(b); b.step('basic', 'enemy'); assert.ok(g.states.defense);
  nextGuard(b); assert.ok(g.states.defense);
});

test('Q5 no entry activation; failed initial check can activate on later independent exact-side AE', () => {
  const b = battle({ startingAE: 0 }), g = b.unit('guard');
  assert.equal(events(b, 'STATE_APPLIED').length, 0);
  b.step('basic', 'enemy'); assert.equal(g.states.guard, undefined); assert.equal(g.waiting, true);
  b.grantAE('B', 100, 'foreign', 'FIXTURE'); assert.equal(g.states.guard, undefined);
  b.grantAE('A', 10, 'foreign', 'FIXTURE'); assert.ok(g.states.guard); close(b.ae.A, 0);
  const paid = events(b, 'COST_COMMITTED').filter(e => e.ae === 15).length;
  b.grantAE('A', 0, 'no-op', 'FIXTURE'); assert.equal(events(b, 'COST_COMMITTED').filter(e => e.ae === 15).length, paid);
});

test('Q5 waiting HP/MaxHP commits are observed; the next opportunity closes observation first', () => {
  const units = specs(); units[0].hp = 6000;
  const b = battle({ startingAE: 35 }, units), g = b.unit('guard');
  b.step('basic', 'enemy'); assert.equal(g.states.guard, undefined);
  b.heal(g, 1200, 'independent'); assert.ok(g.states.guard);
  nextGuard(b); const revision = g.states.guard.revision;
  b.grantAE('A', 20, 'independent', 'FIXTURE');
  assert.equal(g.states.guard.revision, revision); assert.equal(g.waiting, false);
  const low = battle({ startingAE: 35 }, units), q = low.unit('guard');
  low.changeMaxHp(q, 'foreign', 2000, 'fixture'); low.step('basic', 'enemy');
  low.changeMaxHp(q, 'foreign', 0, 'independent', true);
  assert.equal(q.states.guard, undefined); // 6000/10000 still below70.
  low.heal(q, 1000, 'independent'); assert.ok(q.states.guard);
});

test('Q5 repeated successful activation refreshes one family and creates a fresh tick window', () => {
  const b = battle({ startingAE: 60 }), g = b.unit('guard');
  b.step('basic', 'enemy'); const first = g.states.guard.revision;
  nextGuard(b); b.step('basic', 'enemy');
  assert.ok(g.states.guard.revision > first);
  assert.equal(Object.keys(g.states).filter(f => f === 'guard').length, 1);
  nextGuard(b); assert.equal(events(b, 'PERIODIC_HEAL_CHECKPOINT').length, 2);
});

test('Ultimate uses sequential real children, waived AE and same family, bypassing HP/CD', () => {
  const b = battle({ startingAE: 0, startingRage: 100 }), g = b.unit('guard'); g.hp = 2000;
  b.runAction(g, 'skill3', [g], { waiveAE: true });
  const revision = g.states.guard.revision, before = b.trace.length;
  b.step('ultimate', 'enemy');
  assert.ok(g.states.guard.revision > revision); close(b.ae.A, 5); close(g.rage, 20);
  assert.equal(events(b, 'HEAL_RECEIPT').length, 0);
  const graph = b.trace.slice(before), begin = graph.filter(e => e.type === 'ACTION_BEGIN');
  assert.deepEqual(begin.map(e => e.abilityId), ['ultimate', 'skill2', 'skill3']);
  assert.equal(begin[1].parentId, begin[0].actionId); assert.equal(begin[2].parentId, begin[0].actionId);
  assert.ok(graph.findIndex(e => e.type === 'ACTION_COMPLETED' && e.actionId === begin[1].actionId) < graph.findIndex(e => e.type === 'ACTION_BEGIN' && e.actionId === begin[2].actionId));
  assert.equal(graph.filter(e => e.type === 'AE_GRANTED').length, 1);
  assert.equal(graph.filter(e => e.type === 'COST_COMMITTED' && e.ae > 0).length, 0);
});

test('Ultimate fresh CD prevents a second automatic AE15 debit after root completion', () => {
  const b = battle({ startingAE: 50, startingRage: 100 }), g = b.unit('guard');
  b.step('ultimate', 'enemy'); close(b.ae.A, 55);
  assert.equal(events(b, 'COST_COMMITTED').filter(e => e.ae === 15).length, 0);
  assert.equal(g.cdReadyAt, g.opportunity + 1);
});

test('Q6 Taunt narrows legal single-recipient Damage, not Heal/AoE/fixed Slot', () => {
  const b = battle({ startingAE: 100 }), g = b.unit('guard'), enemy = b.unit('enemy');
  b.runAction(g, 'skill3', [g], { waiveAE: true });
  assert.deepEqual(b.targetChoices(enemy, 'basic').map(u => u.id), ['guard']);
  assert.deepEqual(b.targetChoices(enemy, 'skill1').map(u => u.id), ['guard']);
  assert.deepEqual(b.targetChoices(enemy, 'skill2').map(u => u.id), ['leader-a']);
  assert.deepEqual(b.targetChoices(enemy, 'ultimate').map(u => u.id), ['guard', 'leader-a']);
  assert.deepEqual(b.targetChoices(b.unit('leader-b'), 'skill1').map(u => u.id), ['enemy', 'leader-b']);
  g.present = false;
  assert.deepEqual(b.targetChoices(enemy, 'basic').map(u => u.id), ['leader-a']);
});

test('Q6 recipient compulsion preserves ordinary miss; Stun has no positive-Damage prerequisite', () => {
  const kits = clone(KITS); kits.gideon.abilities.skill2.effects[1].chance = 1;
  const b = battle({ hitChance: 0, startingAE: 50 }, specs(), kits);
  b.step('skill2', 'enemy');
  assert.equal(events(b, 'HIT_MISSED').length, 1); assert.equal(events(b, 'DAMAGE_RECEIPT').length, 0);
  assert.equal(b.unit('enemy').stunned, true);
});

test('invalid locked Stun recipient skips without consuming a fresh status draw', () => {
  const units = specs(); units[2].hp = 10;
  const b = battle({ startingAE: 50 }, units); b.step('skill2', 'enemy');
  assert.equal(events(b, 'STUN_TARGET_INVALID').length, 1);
  assert.equal(events(b, 'STUN_RESULT').length, 0); assert.equal(events(b, 'RNG').length, 0);
});

test('Q7 same completed Tanker Action grants +5 before pay15, AE10 becomes0', () => {
  const b = battle({ startingAE: 10 }); b.step('basic', 'enemy'); close(b.ae.A, 0);
  const complete = b.trace.findIndex(e => e.type === 'ACTION_COMPLETED' && e.natural);
  const grant = b.trace.findIndex(e => e.type === 'AE_GRANTED' && e.side === 'A');
  const pay = b.trace.findIndex(e => e.type === 'COST_COMMITTED' && e.ae === 15);
  assert.ok(complete < grant && grant < pay); assert.ok(b.unit('guard').states.guard);
});

test('Phần Tinh atomic HP+AE Cost; failed admission commits neither', () => {
  const units = specs(); units[0].kit = 'phanTinh';
  const b = battle({ startingAE: 24 }, units), source = b.unit('guard'), before = b.snapshot();
  assert.throws(() => b.step('skill1', 'enemy'), /Thiếu AE/);
  assert.deepEqual(b.snapshot(), before);
  const legal = battle({ startingAE: 25 }, units);
  legal.step('skill1', 'enemy'); close(legal.unit('guard').hp, 6800);
  assert.equal(events(legal, 'COST_COMMITTED')[0].hp, 1200);
  close(events(legal, 'DAMAGE_RECEIPT')[0].actualHpDamage, 280);
  assert.equal(events(legal, 'DAMAGE_RECEIPT')[0].components[0].finalMultiplier, 1.4);
});

test('Phần Tinh Ultimate common target snapshots: <30% True, exact30% ordinary; Shield remains', () => {
  const units = specs(); units[0].kit = 'phanTinh'; units[2].hp = 2900; units[2].shield = 100;
  units[2].baseStats = { ...base, arm: 100, res: 100 }; units[3].hp = 3000; units[3].baseStats = { ...base, arm: 100, res: 100 };
  const b = battle({ startingRage: 100 }, units); b.step('ultimate', null);
  const receipts = events(b, 'DAMAGE_RECEIPT');
  assert.equal(receipts[0].convertedToTrue, true); assert.deepEqual(receipts[0].components.map(c => c.type), ['TRUE', 'TRUE']);
  close(receipts[0].actualHpDamage, 740); close(receipts[0].shieldAbsorbed, 100);
  assert.equal(receipts[1].convertedToTrue, false); close(receipts[1].actualHpDamage, 420);
});

test('mode full Rage selects legal Ultimate on existing Natural, no entry/out-of-turn cast', () => {
  const b = battle({ startingRage: 100 });
  assert.equal(events(b, 'ACTION_BEGIN').length, 0);
  assert.equal(b.canUse(b.unit('guard'), 'basic').ok, false);
  assert.equal(b.chooseAI().abilityId, 'ultimate');
  b.step('ultimate', 'enemy'); assert.equal(events(b, 'OPPORTUNITY_END').length, 1);
});

test('SSI walks actual side-relative Slots, alternates Sides and skips empty/dead Slots', () => {
  const b = battle({ startingAE: 0 });
  const actors = [];
  for (let i = 0; i < 6; i++) { actors.push(b.active.actorId); basicStep(b); }
  assert.deepEqual(actors, ['guard', 'enemy', 'leader-a', 'leader-b', 'guard', 'enemy']);
  assert.equal(events(b, 'TURN_BOUNDARY').length, 6);
});

test('terminal confirmed Leader death ends battle, no post-terminal child/grant/handoff', () => {
  const units = specs(); units[2].hp = 10; units[2].leader = true; units[2].slot = 8; units[3].leader = false; units[3].slot = 7;
  const b = battle({ startingRage: 100 }, units);
  b.step('ultimate', 'enemy'); assert.equal(b.outcome, 'A'); assert.equal(b.active, null);
  assert.equal(events(b, 'ACTION_BEGIN').filter(e => e.abilityId === 'skill3').length, 0);
  assert.equal(events(b, 'AE_GRANTED').length, 0); assert.equal(events(b, 'TURN_BOUNDARY').length, 0);
  assert.ok(events(b, 'DEATH_CONFIRMED').length); assert.throws(() => b.step('basic', 'enemy'), /ended/);
});

test('same accepted command redelivery is idempotent; changed payload fails', () => {
  const b = battle(); b.step('basic', 'enemy', 'r1'); const snapshot = b.snapshot();
  b.step('basic', 'enemy', 'r1'); assert.deepEqual(b.snapshot(), snapshot);
  assert.throws(() => b.step('skill2', 'enemy', 'r1'), /identity reused/);
});

test('AI planning and read-only ability/target probes do not consume RNG or resources', () => {
  const b = battle(), before = b.snapshot();
  for (let i = 0; i < 5; i++) { b.chooseAI(); b.canUse(b.unit('guard'), 'skill2'); b.targetChoices(b.unit('guard'), 'basic'); }
  assert.deepEqual(b.snapshot(), before);
});

test('same seed/actions replay exact HP/AE/state/cursor/RNG/trace, including misses and CC', () => {
  const b = new Battle({ seed: 100 });
  for (let i = 0; i < 25 && !b.outcome; i++) { const a = b.chooseAI(); b.step(a.abilityId, a.targetId); }
  assert.deepEqual(replay(b.exportReplay()).snapshot(), b.snapshot());
});

test('100 seeded automatic battles terminate boundedly and maintain HP/AE invariants', () => {
  for (let seed = 1; seed <= 100; seed++) {
    const b = new Battle({ seed });
    while (!b.outcome) {
      const a = b.chooseAI(); b.step(a.abilityId, a.targetId);
      for (const u of b.units) assert.ok(u.hp >= 0 && u.hp <= b.maxHp(u) + EPS && Number.isFinite(u.hp));
      for (const ae of Object.values(b.ae)) assert.ok(ae >= 0 && ae <= 100);
    }
    assert.ok(b.opportunities <= 400);
  }
});

test('unsupported hooks, primitives, clocks, bindings and child cycles fail closed', () => {
  for (const mutate of [
    k => { k.gideon.automatic.afterModeHook = 'ARBITRARY_PRIORITY'; },
    k => { k.gideon.abilities.skill1.effects[0].op = 'EXECUTE_SCRIPT'; },
    k => { k.gideon.states.guard.clock = 'GLOBAL_TURN'; },
    k => { k.gideon.states.guard.tickAt = 2; },
    k => { k.gideon.abilities.skill1.target.binding = 'POSITION'; },
    k => { k.gideon.abilities.skill2.effects = [{ op: 'CHILD', ability: 'skill2', waiveAE: true }]; },
    k => { k.gideon.abilities.basic.extraFeature = 'unsupported'; },
    k => { k.gideon.abilities.basic.effects[0].components[0].amount.terms[0].rate = NaN; },
  ]) { const kits = clone(KITS); mutate(kits); assert.throws(() => validateKits(kits)); }
});

test('unsupported shared-AE automatic contention is rejected, not list-prioritized', () => {
  const units = specs(); units[1].kit = 'gideon';
  assert.throws(() => battle({}, units), /competing automatic/);
});

test('unrecognized options, incompatible replay version and foreign fields reject', () => {
  assert.throws(() => new Battle({ AG: 100 }), /unsupported/);
  assert.throws(() => replay({ ...battle().exportReplay(), format: 'future-version' }), /Unsupported/);
  assert.throws(() => new Battle({ hitChance: 1.5 }), /invalid/);
  assert.throws(() => new Battle({ trainingRank: 'constructor' }), /Unsupported/);
  const altered = battle().exportReplay(); altered.kits.gideon.abilities.skill2.ae = 0;
  assert.throws(() => replay(altered), /modified kit definitions/);
});
