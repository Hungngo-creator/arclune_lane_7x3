import {
  beginActionExecution, beginRevivedLife, commitDamageBatch, commitHealing, createLinkedAction, createNaturalAction,
  currentActionExecution, endActionExecution, ensureCombatIdentity, nextActionPacket, resolveDamageBatch,
  resolveDamagePacket, resolveHealing, resolveHpLoss, resolveMaxHpMutation, resolveReactionPolicy, resolveSourceAttribution,
} from '../src/combat/kernel/index.ts';
import type { SessionState } from '../src/types/combat.ts';

const game = (): SessionState => ({ runtime: {}, tokens: [] } as unknown as SessionState);
const source = resolveSourceAttribution({ immediateSource: 's', trueSelf: 'ts' });
const identity = { actionId: 'a', chainId: 'c', parentActionId: null, actionKind: 'skill', actionSerial: 1 };
const packet = (serial: number, pierceShield = false, damage = 80) => ({ packetId: `a:packet-${serial}`, packetSerial: serial, actionId: 'a', chainId: 'c', source, targetIid: 2, damageType: 'physical' as const, declaredDamage: damage, tags: [], isDot: false, isReflect: false, isFollowup: false, isCounter: false, reactionDepth: 0, pierceShield });
const context = { attacker: { iid: 1, currentHp: 100, maxHp: 100, arm: 0, res: 0 }, defender: { iid: 2, currentHp: 100, maxHp: 100, arm: 0, res: 0 }, defensePenetration: { flat: 0, percent: 0 }, defenseModifiers: { flat: 0, percent: 0 }, outgoingModifiers: [1], incomingModifiers: [1], genericDamageReduction: 0, reflectDamageReduction: 0, shield: { shieldBefore: 0 } };
const command = (packets = [packet(1)], shieldSnapshot = 0) => ({ identity, source, packets, contexts: packets.map(() => context), targets: [{ ...context.defender, trueSelfId: 'target-self', lifeSerial: 1, slot: 0, weight: 1, capRatio: null }], shieldSnapshot, specialMitigation: null, batchPolicy: 'single' as const, sharedHpPolicy: null });

test.each([Number.NaN, Number.POSITIVE_INFINITY, -1])('pure damage rejects malformed declared damage %p', value => {
  expect(() => resolveDamagePacket({ ...packet(1), declaredDamage: value }, context)).toThrow('declaredDamage');
});
test('pure damage rejects malformed modifiers and integer fields', () => {
  expect(() => resolveDamagePacket(packet(1), { ...context, outgoingModifiers: [Number.NaN] })).toThrow('outgoingModifiers');
  expect(() => resolveDamagePacket({ ...packet(1), reactionDepth: 0.5 }, context)).toThrow('reactionDepth');
});
test('mixed pierce policies consume shield once in packet serial order', () => {
  const result = resolveDamageBatch(command([packet(1, false, 10), packet(2, true, 10)], 8));
  expect(result.appliedPackets.map(item => [item.shieldDamage, item.postShieldDamage])).toEqual([[8, 2], [0, 10]]);
  expect(result.shieldDamage).toBe(8); expect(result.hpAllocations[0]?.hpDamage).toBe(12);
});
test('two packets commit only target HP and reconcile packet totals', () => {
  const result = resolveDamageBatch(command([packet(1), packet(2)]));
  expect(result.hpAllocations[0]?.hpDamage).toBe(100);
  expect(result.appliedPackets.reduce((sum, item) => sum + item.effectiveHpDamage, 0)).toBe(100);
  expect(result.appliedPackets.reduce((sum, item) => sum + item.overkillDamage, 0)).toBe(60);
});
test('batch validation is atomic for stale or missing targets', () => {
  const result = resolveDamageBatch(command()); const target = { id: 'definition', iid: 2, side: 'enemy', cx: 0, cy: 0, alive: true, hp: 99, hpMax: 100, lifeSerial: 1, statuses: [] } as any;
  expect(() => commitDamageBatch(null, result, [target])).toThrow('stale hp'); expect(target.hp).toBe(99);
  expect(() => commitDamageBatch(null, result, [])).toThrow('missing');
});
test('action contexts nest, restore, and allocate unique packet ids', () => {
  const session = game(); const natural = createNaturalAction(session); const outer = beginActionExecution(session, natural);
  expect(nextActionPacket(outer).packetId).toBe('action-1:packet-1'); expect(nextActionPacket(outer).packetSerial).toBe(2);
  const inner = beginActionExecution(session, createLinkedAction(session, natural, 'counter'));
  expect(currentActionExecution(session)).toBe(inner); endActionExecution(session, inner); expect(currentActionExecution(session)).toBe(outer); endActionExecution(session, outer);
  expect(currentActionExecution(session)).toBeNull(); expect(currentActionExecution(game())).toBeNull();
});
test('true-self identity is instance based and revived life is explicit', () => {
  const first = ensureCombatIdentity({ id: 'same', iid: 1 } as any, 'collection-unit'); const second = ensureCombatIdentity({ id: 'same', iid: 2 } as any, 'boss');
  expect(first.trueSelfId).not.toBe(second.trueSelfId); expect(beginRevivedLife(first)).toBe(2);
  const summon = ensureCombatIdentity({ id: 'same', iid: 3, trueSelfId: 'bad' } as any, 'summon'); expect(summon.trueSelfId).toBeUndefined();
});
test('healing dead targets cannot revive and reports overheal', () => {
  const dead = { id: 'd', iid: 4, hp: 0, hpMax: 100, alive: false } as any; const result = resolveHealing(dead, 20, source);
  commitHealing(null, dead, result); expect(result).toMatchObject({ effectiveHeal: 0, overheal: 20, blocked: true }); expect(dead.alive).toBe(false);
});
test('typed costs and max HP policies remain non-damage transactions', () => {
  const target = { id: 'u', iid: 1, hp: 10, hpMax: 20, alive: true } as any;
  expect(resolveHpLoss(target, 10, 'hp-cost', source)).toMatchObject({ succeeded: false, hpAfter: 10 });
  expect(resolveHpLoss(target, 9, 'hp-cost', source)).toMatchObject({ succeeded: true, hpAfter: 1 });
  expect(resolveMaxHpMutation(target, 40, 'set-value', 'preserve-ratio', source)).toMatchObject({ maxHpAfter: 40, hpAfter: 20 });
  expect(resolveReactionPolicy('reflected')).toMatchObject({ canReflect: false, canLifesteal: false, aggregation: 'action' });
});
