import { dealAbilityDamage } from '../src/combat.ts';
import { mongYemRuntimeHook } from '../src/combat/runtime-hooks/mong-yem.ts';
import { assertCharacterCommandPhase, defineCharacterRuntime } from '../src/combat/character-runtime.ts';
import type { SessionState } from '../src/types/combat.ts';

const identity = { actionId: 'a1', chainId: 'a1', parentActionId: null, actionKind: 'test', actionSerial: 1 } as const;
const source = { immediateSourceIid: 1, controllerIid: 1, creditTrueSelfId: 'source', ownerIid: 1, environmentSourceId: null } as const;
const unit = (id: string, iid: number, side: 'ally' | 'enemy', hp = 100) => ({ id, iid, side, hp, hpMax: 100, atk: 100, wil: 0, arm: 0, res: 0, alive: true, lifeState: 'alive', lifeSerial: 1, statuses: [], cx: 0, cy: iid } as any);

test('Mộng Yểm sleep mitigation is resolved without changing the HP snapshot before commit', () => {
  const attacker = unit('attacker', 1, 'ally');
  const target = unit('mong_yem', 2, 'enemy');
  target.statuses.push({ id: 'mong_yem_self_sleep', kind: 'buff', tag: 'defense', amount: 0.5 });
  target._mongYemSelfSleepActive = true;
  const game = { tokens: [attacker, target], runtime: {}, battle: { over: false }, events: {} } as unknown as SessionState;
  const before = target.hp;
  const result = dealAbilityDamage(game, attacker, target, { base: 40, dtype: 'physical', actionIdentity: identity });
  expect(before).toBe(100);
  expect(result.dealt).toBe(20);
  expect(target.hp).toBe(80);
});

test.each([[36, true], [35, false]])('Mộng Yểm wakes only at or below 35%% committed HP', (hp, remainsSleeping) => {
  const target = unit('mong_yem', 2, 'enemy', hp);
  target._mongYemSelfSleepActive = true;
  target.statuses.push({ id: 'sleep' }, { id: 'mong_yem_self_sleep' });
  mongYemRuntimeHook.onDamageResolved?.({ target });
  expect(target._mongYemSelfSleepActive).toBe(remainsSleeping);
  expect(target.hp).toBe(hp);
});

test('character commands reject authoritative mutation before primary commit', () => {
  expect(() => assertCharacterCommandPhase({ type: 'Heal', targetIid: 2, amount: 5, source, targetPolicy: 'explicit', identity, phase: 'resolve', authority: 'test', relation: 'linked', consumesNaturalAction: false, mayGenerateAether: false, mayGenerateFury: false, order: { priority: 0, registrationSerial: 0, commandSerial: 0 } })).toThrow('cannot execute during resolve');
});

test('new character authoring requires deterministic coverage and adapter agreement', () => {
  const capabilities = { basic: 'supported', skill1: 'not-declared', skill2: 'not-declared', skill3: 'not-declared', ultimate: 'not-declared', passives: 'not-declared', summon: 'not-declared', healing: 'not-declared', deathPrevention: 'not-declared', revive: 'not-declared', delayedRevive: 'not-declared', reincarnation: 'not-declared', rebirth: 'not-declared', customAdapter: null } as const;
  expect(() => defineCharacterRuntime({ characterId: 'new_unit', capabilities, behavioralCertifications: [] })).toThrow('deterministic behavioral coverage missing for basic');
});
