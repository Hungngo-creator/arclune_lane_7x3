import { dealAbilityDamage, healUnit } from '../../combat.ts';
import { toFiniteNumber } from '../../combat/number-utils.ts';
import { Statuses } from '../../statuses.ts';
import type { PveUltHookContext } from './unit-runtime-hooks.ts';

const CHAP_MINH_ARM_RES_BUFF = 0.5;
const CHAP_MINH_ARM_RES_BUFF_TURNS = 2;
const CHAP_MINH_ULT_HEAL_PERCENT = 0.35;
const CHAP_MINH_ULT_SHIELD_DAMAGE_RATIO = 0.5;

export function performChapMinhUltRuntime(ctx: PveUltHookContext): boolean {
  const { game, unit, ultSkill, extendBusy } = ctx;
  if (!game || !unit || unit.id !== 'huyen_vu_chap_minh') return false;

  const healAmount = Math.max(0, Math.round(Math.max(0, toFiniteNumber(unit.hpMax, 0)) * CHAP_MINH_ULT_HEAL_PERCENT));
  if (healAmount > 0) {
    healUnit(game, unit, unit, healAmount);
  }

  Statuses.add(unit, {
    id: 'chap_minh_ult_arm_up',
    kind: 'buff',
    tag: 'stat',
    attr: 'arm',
    mode: 'percent',
    amount: CHAP_MINH_ARM_RES_BUFF,
    dur: CHAP_MINH_ARM_RES_BUFF_TURNS,
    tick: 'turn',
    sourceUnitId: unit.id,
  });
  Statuses.add(unit, {
    id: 'chap_minh_ult_res_up',
    kind: 'buff',
    tag: 'stat',
    attr: 'res',
    mode: 'percent',
    amount: CHAP_MINH_ARM_RES_BUFF,
    dur: CHAP_MINH_ARM_RES_BUFF_TURNS,
    tick: 'turn',
    sourceUnitId: unit.id,
  });

  if (typeof unit._recalcStats === 'function') {
    unit._recalcStats();
  }

  const shieldStatus = Statuses.get(unit, 'shield') as { amount?: unknown } | null;
  const currentShield = Math.max(0, toFiniteNumber(shieldStatus?.amount, 0));
  const base = Math.max(
    1,
    Math.round(
      Math.max(0, toFiniteNumber(unit.atk, 0))
      + Math.max(0, toFiniteNumber(unit.wil, 0))
      + currentShield * CHAP_MINH_ULT_SHIELD_DAMAGE_RATIO,
    ),
  );

  const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
  const tokens = Array.isArray(game.tokens) ? game.tokens : [];
  for (let index = 0; index < tokens.length; index += 1) {
    const target = tokens[index];
    if (!target?.alive || target.side !== foeSide) continue;
    dealAbilityDamage(game, unit, target, {
      base,
      dtype: 'mixed',
      attackType: 'skill',
      isAoE: true,
      skill: ultSkill,
    });
  }

  extendBusy(1100);
  return true;
}
