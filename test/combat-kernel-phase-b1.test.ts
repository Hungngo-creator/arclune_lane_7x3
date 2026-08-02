import { createLinkedAction, createNaturalAction, normalizeDamageType, resolveDamageBatch, resolveEffectiveDefense } from '../src/combat/kernel/index.ts';
import type { SessionState } from '../src/types/combat.ts';

const game = (): SessionState => ({ runtime: {}, tokens: [] } as unknown as SessionState);

test('battle-owned natural and linked identities are deterministic', () => {
  const firstBattle = game(); const secondBattle = game();
  const natural = createNaturalAction(firstBattle, 'basic');
  expect(natural).toMatchObject({ actionId: 'action-1', chainId: 'chain-1', parentActionId: null });
  expect(createNaturalAction(secondBattle, 'basic')).toEqual(natural);
  expect(createLinkedAction(firstBattle, natural, 'counter')).toMatchObject({ actionId: 'action-2', chainId: 'chain-1', parentActionId: 'action-1' });
});

test('strict damage aliases and defense percentage bounds', () => {
  expect(normalizeDamageType('arcane')).toBe('will');
  expect(() => normalizeDamageType('phyiscal')).toThrow('unknown damage type');
  expect(resolveEffectiveDefense(100, { flat: 0, percent: -5 }, { flat: 20, percent: 5 })).toBe(-20);
  expect(() => resolveEffectiveDefense(Number.NaN)).toThrow('finite');
});

test('mixed batch shares identity, orders packets, shields once and serializes', () => {
  const identity = { actionId: 'a1', chainId: 'c1', parentActionId: null, actionKind: 'skill', actionSerial: 1 };
  const source = { immediateSourceIid: 1, controllerIid: 1, creditTrueSelfId: 'self-1', ownerIid: 1, environmentSourceId: null };
  const packet = (type: 'physical' | 'will', serial: number) => ({ packetId: `a1:p${serial}`, packetSerial: serial, actionId: 'a1', chainId: 'c1', source, targetIid: 2, damageType: type, declaredDamage: 10, tags: [], isDot: false, isReflect: false, isFollowup: false, isCounter: false, reactionDepth: 0, pierceShield: false });
  const context = { attacker: { iid: 1, currentHp: 10, maxHp: 10, arm: 0, res: 0 }, defender: { iid: 2, currentHp: 20, maxHp: 20, arm: 0, res: 0 }, defensePenetration: { flat: 0, percent: 0 }, defenseModifiers: { flat: 0, percent: 0 }, outgoingModifiers: [1], incomingModifiers: [1], genericDamageReduction: 0, reflectDamageReduction: 0, shield: { shieldBefore: 0 } };
  const result = resolveDamageBatch({ identity, source, packets: [packet('physical', 1), packet('will', 2)], contexts: [context, context], targets: [{ ...context.defender, trueSelfId: 'self-2', lifeSerial: 1, slot: 1, weight: 1, capRatio: null }], shieldSnapshot: 5, specialMitigation: null, batchPolicy: 'single', sharedHpPolicy: null });
  expect(result.shieldDamage).toBe(5); expect(result.hpAllocations[0]?.hpDamage).toBe(15);
  expect(result.packetResolutions.map(item => item.packet.packetSerial)).toEqual([1, 2]);
  expect(() => JSON.stringify(result)).not.toThrow();
});

