import { resolveDefenseMultiplier, resolveEffectiveDefense } from './defense.ts';
import type { DamageContext, DamagePacket, DamageResolution } from './types.ts';

const nonNegativeFinite = (value: number): number => Number.isFinite(value) ? Math.max(0, value) : 0;
const multiply = (value: number, modifiers: readonly number[]): number => modifiers.reduce(
  (total, modifier) => total * nonNegativeFinite(modifier), value,
);

/** Pure packet calculation. It deliberately performs exactly one floor. */
export function resolveDamagePacket(packet: DamagePacket, context: DamageContext): DamageResolution {
  const declaredDamage = nonNegativeFinite(packet.declaredDamage);
  const incomingDamage = multiply(declaredDamage, context.outgoingModifiers);
  const defenseRating = packet.damageType === 'physical' ? context.defender.arm
    : packet.damageType === 'will' ? context.defender.res : 0;
  const effectiveDefense = packet.damageType === 'physical' || packet.damageType === 'will'
    ? resolveEffectiveDefense(defenseRating, context.defenseModifiers, context.defensePenetration) : 0;
  const defenseMultiplier = packet.damageType === 'physical' || packet.damageType === 'will'
    ? resolveDefenseMultiplier(effectiveDefense) : 1;
  let preciseDamage = incomingDamage * defenseMultiplier;
  if (packet.damageType === 'reflected') {
    preciseDamage *= Math.max(0, 1 - nonNegativeFinite(context.reflectDamageReduction));
  } else if (packet.damageType !== 'true') {
    preciseDamage *= Math.max(0, 1 - nonNegativeFinite(context.genericDamageReduction));
    preciseDamage = multiply(preciseDamage, context.incomingModifiers);
  }
  const finalRoundedDamage = Math.floor(nonNegativeFinite(preciseDamage));
  const shieldBefore = nonNegativeFinite(context.shield.shieldBefore);
  const shieldDamage = packet.pierceShield ? 0 : Math.min(shieldBefore, finalRoundedDamage);
  const shieldAfter = shieldBefore - shieldDamage;
  const afterShield = finalRoundedDamage - shieldDamage;
  const availableHp = nonNegativeFinite(context.defender.currentHp);
  const hpDamage = Math.min(afterShield, availableHp);
  const overkillDamage = Math.max(0, afterShield - hpDamage);
  return {
    declaredDamage, incomingDamage, effectiveDefense, defenseMultiplier,
    postMitigationDamage: preciseDamage, shieldBefore, shieldDamage, shieldAfter,
    hpDamage, overkillDamage,
    preventedDamage: Math.max(0, incomingDamage - finalRoundedDamage), finalRoundedDamage,
  };
}

