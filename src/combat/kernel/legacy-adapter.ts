import type { UnitToken } from '@shared-types/units';
import type { SessionState } from '@shared-types/combat';
import { nextCompatibilityId } from './ids.ts';
import { assertDamageInvariant } from './invariants.ts';
import { resolveDamagePacket } from './damage-resolver.ts';
import { resolveSourceAttribution } from './source-attribution.ts';
import { normalizeDamageType, type DamageContext, type DamagePacket, type DamageResolution } from './types.ts';
import { createNaturalAction } from './sequence.ts';
import type { ActionIdentity } from './types.ts';

/** Compatibility boundary for callers not yet hosted by an action executor. */
export function createLegacyDetachedAction(game: SessionState, kind: string): ActionIdentity {
  return createNaturalAction(game, `legacy-detached:${kind}`);
}

export interface LegacyDamageAdapterInput {
  attacker: UnitToken;
  defender: UnitToken;
  damageType: string;
  declaredDamage: number;
  defensePercentPenetration?: number;
  outgoingModifiers?: readonly number[];
  incomingModifiers?: readonly number[];
  genericDamageReduction?: number;
  reflectDamageReduction?: number;
  shieldBefore?: number;
  pierceShield?: boolean;
  tags?: readonly string[];
}

const snapshot = (unit: UnitToken) => ({
  iid: unit.iid ?? unit.id,
  currentHp: Number(unit.hp ?? 0), maxHp: Number(unit.hpMax ?? 0),
  arm: Number(unit.arm ?? 0), res: Number(unit.res ?? 0),
});

/** Builds JSON contracts around the old UnitToken API; calculation stays pure. */
export function resolveLegacyDamage(input: LegacyDamageAdapterInput): DamageResolution {
  const actionId = nextCompatibilityId('action');
  const packet: DamagePacket = {
    packetId: nextCompatibilityId('packet'), actionId, chainId: actionId,
    source: resolveSourceAttribution({ immediateSource: input.attacker, trueSelf: input.attacker }),
    targetIid: input.defender.iid ?? input.defender.id,
    damageType: normalizeDamageType(input.damageType), declaredDamage: input.declaredDamage,
    tags: [...(input.tags ?? [])], isDot: false, isReflect: input.damageType === 'reflected',
    isFollowup: false, isCounter: false, reactionDepth: 0, pierceShield: !!input.pierceShield,
  };
  const context: DamageContext = {
    attacker: snapshot(input.attacker), defender: snapshot(input.defender),
    defensePenetration: { flat: 0, percent: input.defensePercentPenetration ?? 0 },
    defenseModifiers: { flat: 0, percent: 0 },
    outgoingModifiers: [...(input.outgoingModifiers ?? [])], incomingModifiers: [...(input.incomingModifiers ?? [])],
    genericDamageReduction: input.genericDamageReduction ?? 0,
    reflectDamageReduction: input.reflectDamageReduction ?? 0,
    shield: { shieldBefore: input.shieldBefore ?? 0 },
  };
  const result = resolveDamagePacket(packet, context);
  assertDamageInvariant(packet, result);
  return result;
}
