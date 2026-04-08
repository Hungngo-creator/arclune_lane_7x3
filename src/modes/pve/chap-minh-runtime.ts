import { dealAbilityDamage, healUnit } from '../../combat.ts';
import { Statuses } from '../../statuses.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

export interface ChapMinhUltRuntimeContext {
  game: SessionState;
  unit: UnitToken;
  ultSkill: unknown;
  extendBusy: (ms: number) => void;
}

const CHAP_MINH_ARM_RES_BUFF = 0.5;
const CHAP_MINH_ARM_RES_BUFF_TURNS = 2;
const CHAP_MINH_ULT_HEAL_PERCENT = 0.35;
const CHAP_MINH_ULT_SHIELD_DAMAGE_RATIO = 0.5;

const toFiniteOrZero = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function performChapMinhUltRuntime(ctx: ChapMinhUltRuntimeContext): boolean {
  const { game, unit, ultSkill, extendBusy } = ctx;
  if (!game || !unit || unit.id !== 'huyen_vu_chap_minh') return false;

  const healAmount = Math.max(0, Math.round((toFiniteOrZero(unit.hpMax) || 0) * CHAP_MINH_ULT_HEAL_PERCENT));
  if (healAmount > 0) {
    healUnit(unit, healAmount);
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
  const currentShield = Math.max(0, toFiniteOrZero(shieldStatus?.amount));
  const base = Math.max(
    1,
    Math.round(toFiniteOrZero(unit.atk) + toFiniteOrZero(unit.wil) + currentShield * CHAP_MINH_ULT_SHIELD_DAMAGE_RATIO),
  );

  const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
  const foes = (game.tokens || []).filter((token) => token.alive && token.side === foeSide);
  for (const target of foes) {
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
