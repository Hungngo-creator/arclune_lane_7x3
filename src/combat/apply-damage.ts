//home (termux)/arclune_lane_7x3/src/combat/apply-damage.ts
import { sessionNow } from '../utils/time.ts';

import type { StatusEffect } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

const ensureStatusList = (unit?: UnitToken | null): StatusEffect[] => {
  if (!unit) return [];
  if (!Array.isArray(unit.statuses)) {
    unit.statuses = [];
  }
  return unit.statuses;
};

export function applyDamage(target: UnitToken, amount: number): void {
  const maxHp = Number.isFinite(target.hpMax) ? Math.floor(target.hpMax ?? 0) : 0;
  if (maxHp <= 0) return;
  const damage = Math.max(0, Math.floor(amount));
  if (damage <= 0) return;

  const currentHp = Math.max(0, Math.min(maxHp, Math.floor(target.hp ?? 0)));
  const newHp = Math.max(0, currentHp - damage);
  target.hp = newHp;

  if (target.hp <= 0) {
    if (target.alive !== false && !target.deadAt) {
      target.deadAt = sessionNow();
    }
    target.alive = false;
  }
}

export interface GrantShieldOptions {
  durationTurns?: number;
}

export function grantShield(target: UnitToken | null | undefined, amount: number, options: GrantShieldOptions = {}): number {
  if (!target) return 0;

  const amt = Math.max(0, Math.floor(amount ?? 0));
  if (amt <= 0) return 0;

  const list = ensureStatusList(target);
  const shield = list.find(status => status.id === 'shield');

  const durationTurns = Number.isFinite(options.durationTurns)
    ? Math.max(1, Math.floor(options.durationTurns as number))
    : null;

  if (shield) {
    shield.amount = (shield.amount ?? 0) + amt;
    if (durationTurns != null) {
      shield.dur = durationTurns;
      shield.tick = 'turn';
    }
  } else {
    list.push({
      id: 'shield',
      kind: 'buff',
      tag: 'shield',
      amount: amt,
      ...(durationTurns != null ? { dur: durationTurns, tick: 'turn' as const } : {}),
    });
  }

  return amt;
}