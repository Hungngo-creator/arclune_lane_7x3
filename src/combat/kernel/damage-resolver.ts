import { resolveDefenseMultiplier, resolveEffectiveDefense } from './defense.ts';
import type { DamageContext, DamagePacket, DamageResolution } from './types.ts';

const nonNegativeFinite = (value: number, field: string): number => {
  if (!Number.isFinite(value) || value < 0) throw new Error(`[combat-kernel] ${field} must be finite and non-negative; received ${String(value)}`);
  return value;
};
const multiply = (value: number, modifiers: readonly number[], field: string): number => modifiers.reduce(
  (total, modifier, index) => total * nonNegativeFinite(modifier, `${field}[${index}]`), value,
);

/** Pure packet calculation. It deliberately performs exactly one floor. */
export function resolveDamagePacket(packet: DamagePacket, context: DamageContext): DamageResolution {
  const declaredDamage = nonNegativeFinite(packet.declaredDamage, 'declaredDamage');
  if (!Number.isInteger(packet.reactionDepth) || packet.reactionDepth < 0) throw new Error('[combat-kernel] reactionDepth must be a non-negative integer');
  if (packet.packetSerial != null && (!Number.isInteger(packet.packetSerial) || packet.packetSerial < 1)) throw new Error('[combat-kernel] packetSerial must be a positive integer');
  nonNegativeFinite(context.attacker.currentHp, 'attacker.currentHp'); nonNegativeFinite(context.attacker.maxHp, 'attacker.maxHp');
  nonNegativeFinite(context.defender.currentHp, 'defender.currentHp'); nonNegativeFinite(context.defender.maxHp, 'defender.maxHp');
  const incomingDamage = multiply(declaredDamage, context.outgoingModifiers, 'outgoingModifiers');
  const defenseRating = packet.damageType === 'physical' ? context.defender.arm
    : packet.damageType === 'will' ? context.defender.res : 0;
  const effectiveDefense = packet.damageType === 'physical' || packet.damageType === 'will'
    ? resolveEffectiveDefense(defenseRating, context.defenseModifiers, context.defensePenetration) : 0;
  const defenseMultiplier = packet.damageType === 'physical' || packet.damageType === 'will'
    ? resolveDefenseMultiplier(effectiveDefense) : 1;
  let preciseDamage = incomingDamage * defenseMultiplier;
  if (packet.damageType === 'reflected') {
    preciseDamage *= 1 - Math.min(1, nonNegativeFinite(context.reflectDamageReduction, 'reflectDamageReduction'));
  } else if (packet.damageType !== 'true') {
    preciseDamage *= 1 - Math.min(1, nonNegativeFinite(context.genericDamageReduction, 'genericDamageReduction'));
    preciseDamage = multiply(preciseDamage, context.incomingModifiers, 'incomingModifiers');
  }
  const finalRoundedDamage = Math.floor(nonNegativeFinite(preciseDamage, 'postMitigationDamage'));
  const shieldBefore = nonNegativeFinite(context.shield.shieldBefore, 'shieldBefore');
  const shieldDamage = packet.pierceShield ? 0 : Math.min(shieldBefore, finalRoundedDamage);
  const shieldAfter = shieldBefore - shieldDamage;
  const afterShield = finalRoundedDamage - shieldDamage;
  const availableHp = nonNegativeFinite(context.defender.currentHp, 'defender.currentHp');
  const hpDamage = Math.min(afterShield, availableHp);
  const overkillDamage = Math.max(0, afterShield - hpDamage);
  return {
    declaredDamage, incomingDamage, effectiveDefense, defenseMultiplier,
    postMitigationDamage: preciseDamage, shieldBefore, shieldDamage, shieldAfter,
    hpDamage, overkillDamage,
    preventedDamage: Math.max(0, incomingDamage - finalRoundedDamage), finalRoundedDamage,
  };
}
