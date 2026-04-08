//home (termux)/arclune_lane_7x3/src/combat/apply-damage.ts
import { sessionNow } from '../utils/time.ts';
import { toFiniteNumber, toFloorInt } from './number-utils.ts';

import type { StatusEffect } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

const ensureStatusList = (unit?: UnitToken | null): StatusEffect[] => {
  if (!unit) return [];
  if (!Array.isArray(unit.statuses)) {
    unit.statuses = [];
  }
  return unit.statuses;
};

function findShieldStatusIndex(statuses: ReadonlyArray<StatusEffect>): number {
  for (let i = 0; i < statuses.length; i += 1) {
    if (statuses[i]?.id === 'shield') return i;
  }
  return -1;
}

function findShieldEntry(target: UnitToken | null | undefined): { statuses: StatusEffect[]; index: number; status: StatusEffect } | null {
  if (!target || !Array.isArray(target.statuses) || target.statuses.length === 0) return null;
  const index = findShieldStatusIndex(target.statuses);
  if (index < 0) return null;
  const status = target.statuses[index];
  if (!status) return null;
  return { statuses: target.statuses, index, status };
}

export function applyDamage(target: UnitToken, amount: number): void {
  const maxHp = Math.max(0, toFloorInt(target.hpMax, 0));
  if (maxHp <= 0) return;
  const damage = Math.max(0, toFloorInt(amount, 0));
  if (damage <= 0) return;

  const currentHp = Math.max(0, Math.min(maxHp, toFloorInt(target.hp, 0)));
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

  const amt = Math.max(0, toFloorInt(amount, 0));
  if (amt <= 0) return 0;

  const list = ensureStatusList(target);
  const shield = list.find(status => status.id === 'shield');

  const durationTurns = Number.isFinite(options.durationTurns)
    ? Math.max(1, toFloorInt(options.durationTurns as number, 1))
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
  const entry = findShieldEntry(target);
  if (!entry) return 0;

  const currentShield = Math.max(0, toFloorInt(entry.status.amount, 0));
  if (currentShield <= 0) return 0;
  const requested = Math.max(0, toFloorInt(amount, 0));
  if (requested <= 0) return 0;

  const consumed = Math.min(currentShield, requested);
  const remain = currentShield - consumed;
  if (remain > 0) {
    entry.status.amount = remain;
    return consumed;
  }

  entry.statuses.splice(entry.index, 1);
  return consumed;
}

export function consumeShieldByCurrentRatio(target: UnitToken | null | undefined, ratio: number): number {
  if (!target || !Number.isFinite(ratio) || ratio <= 0) return 0;
  const entry = findShieldEntry(target);
  if (!entry) return 0;
  const current = Math.max(0, toFloorInt(entry.status.amount, 0));
  if (current <= 0) return 0;
  return consumeShield(target, toFloorInt(current * toFiniteNumber(ratio, 0), 0));
}