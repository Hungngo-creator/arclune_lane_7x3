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

function findShieldStatus(target: UnitToken | null | undefined): StatusEffect | null {
  if (!target || !Array.isArray(target.statuses) || target.statuses.length === 0) return null;
  for (const status of target.statuses) {
    if (status?.id === 'shield') return status;
  }
  return null;
}

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

export function consumeShield(target: UnitToken | null | undefined, amount: number): number {
  if (!target || !Array.isArray(target.statuses) || target.statuses.length === 0) return 0;
  const shield = findShieldStatus(target);
  if (!shield) return 0;

  const currentShield = Math.max(0, Math.floor(Number(shield.amount ?? 0)));
  if (currentShield <= 0) return 0;
  const requested = Math.max(0, Math.floor(Number(amount ?? 0)));
  if (requested <= 0) return 0;

  const consumed = Math.min(currentShield, requested);
  const remain = currentShield - consumed;
  if (remain > 0) {
    shield.amount = remain;
    return consumed;
  }

  target.statuses = target.statuses.filter((status: StatusEffect) => status !== shield);
  return consumed;
}

export function consumeShieldByCurrentRatio(target: UnitToken | null | undefined, ratio: number): number {
  if (!target || !Number.isFinite(ratio) || ratio <= 0) return 0;
  const shield = findShieldStatus(target);
  if (!shield) return 0;
  const current = Math.max(0, Math.floor(Number(shield.amount ?? 0)));
  if (current <= 0) return 0;
  return consumeShield(target, Math.floor(current * ratio));
}