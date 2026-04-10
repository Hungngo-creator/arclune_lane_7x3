import { sessionNow } from '../utils/time.ts';
import { toFiniteNumber, toFloorInt, toNonNegativeFloorInt, toPositiveTurns } from './number-utils.ts';
import { ensureStatusList, getStatusEntryById } from './status-utils.ts';

import type { UnitToken } from '@shared-types/units';

const SHIELD_STATUS_ID = 'shield';

function getShieldEntry(target: UnitToken | null | undefined) {
  return getStatusEntryById(target, SHIELD_STATUS_ID);
}

function consumeShieldEntryAmount(entry: ReturnType<typeof getShieldEntry>, amount: number): number {
  if (!entry) return 0;

  const current = toNonNegativeFloorInt(entry.status.amount, 0);
  if (current <= 0) return 0;

  const requested = toNonNegativeFloorInt(amount, 0);
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

export function applyDamage(target: UnitToken, amount: number): void {
  const maxHp = toNonNegativeFloorInt(target.hpMax, 0);
  if (maxHp <= 0) return;
  const damage = toNonNegativeFloorInt(amount, 0);
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

  const amt = toNonNegativeFloorInt(amount, 0);
  if (amt <= 0) return 0;

  const list = ensureStatusList(target);
  const entry = getStatusEntryById(target, SHIELD_STATUS_ID, list);

  const durationTurns = options.durationTurns == null ? null : toPositiveTurns(options.durationTurns, 1);

  if (entry) {
    entry.status.amount = (entry.status.amount ?? 0) + amt;
    if (durationTurns != null) {
      entry.status.dur = durationTurns;
      entry.status.tick = 'turn';
    }
  } else {
    list.push({
      id: SHIELD_STATUS_ID,
      kind: 'buff',
      tag: 'shield',
      amount: amt,
      ...(durationTurns != null ? { dur: durationTurns, tick: 'turn' as const } : {}),
    });
  }

  return amt;
}

export function consumeShield(target: UnitToken | null | undefined, amount: number): number {
  return consumeShieldEntryAmount(getShieldEntry(target), amount);
}

export function readShieldAmount(target: UnitToken | null | undefined): number {
  const entry = getShieldEntry(target);
  if (!entry) return 0;
  return toNonNegativeFloorInt(entry.status.amount, 0);
}

export function consumeShieldByCurrentRatio(target: UnitToken | null | undefined, ratio: number): number {
  if (!target || !Number.isFinite(ratio) || ratio <= 0) return 0;
  const entry = getShieldEntry(target);
  const current = toNonNegativeFloorInt(entry?.status.amount, 0);
  if (current <= 0) return 0;
  const requested = toNonNegativeFloorInt(current * toFiniteNumber(ratio, 0), 0);
  return consumeShieldEntryAmount(entry, requested);
}