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
  if (!Number.isFinite(target.hpMax)) return;

  const currentHp = target.hp ?? 0;
  const maxHp = target.hpMax ?? 0;
  const newHp = Math.max(0, Math.min(maxHp, Math.floor(currentHp) - Math.floor(amount)));
  target.hp = newHp;

  if (target.hp <= 0) {
    if (target.alive !== false && !target.deadAt) {
      target.deadAt = sessionNow();
    }
    target.alive = false;
  }
}

export function grantShield(target: UnitToken | null | undefined, amount: number): number {
  if (!target) return 0;

  const amt = Math.max(0, Math.floor(amount ?? 0));
  if (amt <= 0) return 0;

  const list = ensureStatusList(target);
  const shield = list.find(status => status.id === 'shield');

  if (shield) {
    shield.amount = (shield.amount ?? 0) + amt;
  } else {
    list.push({ id: 'shield', kind: 'buff', tag: 'shield', amount: amt });
  }

  return amt;
}
