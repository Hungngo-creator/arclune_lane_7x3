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

interface ShieldEntry {
  statuses: StatusEffect[];
  index: number;
  status: StatusEffect;
}

function getShieldEntry(target: UnitToken | null | undefined, statuses?: StatusEffect[]): ShieldEntry | null {
  const list = statuses ?? (Array.isArray(target?.statuses) ? target.statuses : null);
  if (!target || !list || list.length === 0) return null;
  for (let i = 0; i < list.length; i += 1) {
    const status = list[i];
    if (status?.id !== 'shield') continue;
    return {
      statuses: list,
      index: i,
      status,
    };
  }
  return null;
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
  const entry = getShieldEntry(target, list);

  const durationTurns = Number.isFinite(options.durationTurns)
    ? Math.max(1, toFloorInt(options.durationTurns as number, 1))
    : null;

  if (entry) {
    entry.status.amount = (entry.status.amount ?? 0) + amt;
    if (durationTurns != null) {
      entry.status.dur = durationTurns;
      entry.status.tick = 'turn';
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
  const entry = getShieldEntry(target);
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
  const entry = getShieldEntry(target);
  if (!entry) return 0;
  const current = Math.max(0, toFloorInt(entry.status.amount, 0));
  if (current <= 0) return 0;
  const requested = Math.max(0, toFloorInt(current * toFiniteNumber(ratio, 0), 0));
  if (requested <= 0) return 0;
  const consumed = Math.min(current, requested);
  const remain = current - consumed;
  if (remain > 0) {
    entry.status.amount = remain;
    return consumed;
  }

  entry.statuses.splice(entry.index, 1);
  return consumed;
}