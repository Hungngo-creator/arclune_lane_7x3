import { dealAbilityDamage, healUnit } from '../../combat.ts';
import { isLeaderToken } from '../../combat/board-position-utils.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

export interface LyThanhThuUltRuntimeContext {
  game: SessionState;
  unit: UnitToken;
  ultSkill: unknown;
  extendBusy: (ms: number) => void;
}

const toFiniteOrZero = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function performLyThanhThuUltRuntime(ctx: LyThanhThuUltRuntimeContext): boolean {
  const { game, unit, extendBusy } = ctx;
  if (!game || !unit || unit.id !== 'ly_thanh_thu') return false;

  const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
  const enemyLeader = (game.tokens || []).find((token) => (
    token.alive
    && token.side === foeSide
    && isLeaderToken(token)
  )) ?? null;
  if (!enemyLeader) {
    return false;
  }

  const basePower = Math.max(0, Math.floor((toFiniteOrZero(unit.atk) || 0) + (toFiniteOrZero(unit.wil) || 0)));
  const base = Math.max(1, Math.floor(basePower * 2));
  const dealtResult = dealAbilityDamage(game, unit, enemyLeader, {
    base,
    dtype: 'mixed',
    attackType: 'skill',
  });

  const overThreshold = dealtResult.dealt > Math.max(0, Math.floor((toFiniteOrZero(enemyLeader.hpMax) ?? 0) * 0.2));
  if (overThreshold) {
    const heal = Math.max(1, Math.floor((toFiniteOrZero(unit.hpMax) ?? 0) * 0.1));
    healUnit(unit, heal);
  }

  extendBusy(900);
  return true;
}
