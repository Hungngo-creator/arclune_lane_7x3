import { dealAbilityDamage, healUnit } from '../../combat.ts';
import { isLeaderToken } from '../../combat/board-position-utils.ts';
import { readAtkWilPower, toFiniteNumber } from '../../combat/number-utils.ts';
import type { PveUltHookContext } from './unit-runtime-hooks.ts';

export function performLyThanhThuUltRuntime(ctx: PveUltHookContext): boolean {
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

  const base = Math.max(1, Math.floor(readAtkWilPower(unit) * 2));
  const dealtResult = dealAbilityDamage(game, unit, enemyLeader, {
    base,
    dtype: 'mixed',
    attackType: 'skill',
  });

  const overThreshold = dealtResult.dealt > Math.max(0, Math.floor(toFiniteNumber(enemyLeader.hpMax, 0) * 0.2));
  if (overThreshold) {
    const heal = Math.max(1, Math.floor(toFiniteNumber(unit.hpMax, 0) * 0.1));
    healUnit(unit, heal);
  }

  extendBusy(900);
  return true;
}
