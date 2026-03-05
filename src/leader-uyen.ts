import type { UnitToken } from '@shared-types/units';

export type UyenUltChoice = 'A' | 'B' | 'C';

interface UyenState {
  reviveRageCount: number;
  a1Stacks: number;
  a3Stacks: number;
  bUses: number;
  basicTurnStamp: string | null;
}

const stateMap = new WeakMap<UnitToken, UyenState>();

export function isUyenLeader(unit: UnitToken | null | undefined): boolean {
  return !!unit && (unit.id === 'leaderA' || unit.id === 'leaderB');
}

export function ensureUyenState(unit: UnitToken | null | undefined): UyenState | null {
  if (!isUyenLeader(unit)) return null;
  const existing = stateMap.get(unit);
  if (existing) return existing;
  const created: UyenState = {
    reviveRageCount: 0,
    a1Stacks: 0,
    a3Stacks: 0,
    bUses: 0,
    basicTurnStamp: null,
  };
  stateMap.set(unit, created);
  return created;
}

export function isLeaderUltReady(unit: UnitToken | null | undefined): boolean {
  if (!unit) return false;
  const fury = Number.isFinite(unit.fury) ? Number(unit.fury) : 0;
  const furyMax = Math.max(1, Number.isFinite(unit.furyMax) ? Number(unit.furyMax) : 100);
  return fury >= furyMax || fury >= 100;
}

export function grantUyenSummonRage(unit: UnitToken | null | undefined, options: { revived?: boolean; isMinion?: boolean } = {}): void {
  if (!isUyenLeader(unit)) return;
  if (options.isMinion) return;
  const state = ensureUyenState(unit);
  if (!state) return;
  if (options.revived) {
    if (state.reviveRageCount >= 5) return;
    state.reviveRageCount += 1;
  }
  const current = Number.isFinite(unit.fury) ? Number(unit.fury) : 0;
  const cap = Math.max(1, Number.isFinite(unit.furyMax) ? Number(unit.furyMax) : 100);
  unit.fury = Math.min(cap, current + 5);
  unit.rage = unit.fury;
}

export function applyUyenBasicExtras(
  attacker: UnitToken | null | undefined,
  target: UnitToken | null | undefined,
  options: { wasKill?: boolean; turnStamp?: string | null } = {},
): void {
  if (!isUyenLeader(attacker) || !target) return;
  const state = ensureUyenState(attacker);
  if (!state) return;

  if (state.a1Stacks > 0) {
    const fury = Number.isFinite(attacker.fury) ? Number(attacker.fury) : 0;
    const cap = Math.max(1, Number.isFinite(attacker.furyMax) ? Number(attacker.furyMax) : 100);
    attacker.fury = Math.min(cap, fury + 3);
    attacker.rage = attacker.fury;
  }

  const turnStamp = options.turnStamp ?? null;
  const targetHp = Number.isFinite(target.hp) ? Number(target.hp) : 0;
  const targetHpMax = Math.max(1, Number.isFinite(target.hpMax) ? Number(target.hpMax) : 1);
  if (targetHp / targetHpMax < 0.3 && state.basicTurnStamp !== turnStamp) {
    const fury = Number.isFinite(attacker.fury) ? Number(attacker.fury) : 0;
    const cap = Math.max(1, Number.isFinite(attacker.furyMax) ? Number(attacker.furyMax) : 100);
    attacker.fury = Math.min(cap, fury + 5);
    attacker.rage = attacker.fury;
    state.basicTurnStamp = turnStamp;
  }

  if (options.wasKill) {
    const hp = Number.isFinite(attacker.hp) ? Number(attacker.hp) : 0;
    const hpMax = Math.max(1, Number.isFinite(attacker.hpMax) ? Number(attacker.hpMax) : 1);
    attacker.hp = Math.min(hpMax, hp + Math.round(hpMax * 0.05));
  }
}

export function getUyenUltState(unit: UnitToken | null | undefined): UyenState | null {
  return ensureUyenState(unit);
}

export function getUyenUltChoice(unit: UnitToken | null | undefined): UyenUltChoice {
  const choice = (unit as (UnitToken & { leaderUltChoice?: unknown }) | null)?.leaderUltChoice;
  if (choice === 'A' || choice === 'B' || choice === 'C') return choice;
  return 'C';
}
