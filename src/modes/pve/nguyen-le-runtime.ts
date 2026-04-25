import { dealAbilityDamage } from '../../combat.ts';
import { findAliveUnitAtSlot } from '../../combat/board-position-utils.ts';
import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

export interface NguyenLeUltRuntimeContext {
  game: SessionState;
  unit: UnitToken;
  ultSkill: unknown;
  extendBusy: (ms: number) => void;
}

const TARGET_PATTERN = [1, 2, 3, 5, 8] as const;

const toFiniteOrZero = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function performNguyenLeUltRuntime(ctx: NguyenLeUltRuntimeContext): boolean {
  const { game, unit, ultSkill, extendBusy } = ctx;
  if (!game || !unit || unit.id !== 'nguyen_le') return false;

  const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
  const base = Math.max(1, Math.floor((toFiniteOrZero(unit.atk) + toFiniteOrZero(unit.wil)) * 2));
  let hits = 0;
  for (const slot of TARGET_PATTERN) {
    const target = findAliveUnitAtSlot(game, foeSide, slot);
    if (!target) continue;
    dealAbilityDamage(game, unit, target, {
      base,
      dtype: 'mixed',
      attackType: 'skill',
      skill: ultSkill,
      isAoE: true,
    });
    hits += 1;
  }
  if (hits <= 0) return false;

  extendBusy(1100);
  return true;
}
