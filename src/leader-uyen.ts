import type { UnitToken } from '@shared-types/units';

export type UyenUltChoice = 'A' | 'B' | 'C';
export type LeaderUltChoice = UyenUltChoice;

function isSystemLeader(unit: UnitToken | null | undefined): boolean {
  return !!unit && typeof unit.id === 'string' && unit.id.startsWith('leader');
}

type UyenControlState = UnitToken & {
  leaderUltChoice?: UyenUltChoice;
  leaderUltQueued?: boolean;
};

interface UyenState {
  reviveRageCount: number;
  a1Stacks: number;
  a3Stacks: number;
  bUses: number;
  basicTurnStamp: string | null;
}

const stateMap = new WeakMap<UnitToken, UyenState>();
const getFury = (unit: UnitToken | null | undefined): number => (
  Number.isFinite(unit?.fury) ? Number(unit?.fury) : 0
);
const getFuryCap = (unit: UnitToken | null | undefined): number => (
  Math.max(1, Number.isFinite(unit?.furyMax) ? Number(unit?.furyMax) : 100)
);
const addFury = (unit: UnitToken, amount: number): void => {
  unit.fury = Math.min(getFuryCap(unit), getFury(unit) + amount);
  unit.rage = unit.fury;
};

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
  const fury = getFury(unit);
  const furyMax = getFuryCap(unit);
  return fury >= furyMax || fury >= 100;
}

export function canCastLeaderUltChoice(
  unit: UnitToken | null | undefined,
  choice: LeaderUltChoice,
): boolean {
  if (!isSystemLeader(unit)) return false;
  const fury = Math.max(0, Math.floor(Number.isFinite(unit?.fury) ? Number(unit?.fury) : 0));

  if (unit?.id === 'leaderA' || unit?.id === 'leaderB') {
    if (choice === 'B') {
      const state = ensureUyenState(unit);
      return fury > 0 && Boolean(state) && (state?.bUses ?? 0) < 10;
    }
    return fury >= 100;
  }

  return fury >= 100;
}

export function isAnyLeaderUltReady(unit: UnitToken | null | undefined): boolean {
  return canCastLeaderUltChoice(unit, 'A')
    || canCastLeaderUltChoice(unit, 'B')
    || canCastLeaderUltChoice(unit, 'C');
}

export function canCastUyenUltChoice(
  unit: UnitToken | null | undefined,
  choice: UyenUltChoice,
): boolean {
  if (!isUyenLeader(unit)) return false;
  return canCastLeaderUltChoice(unit, choice);
}

export function isAnyUyenUltReady(unit: UnitToken | null | undefined): boolean {
  if (!isUyenLeader(unit)) return false;
  return isAnyLeaderUltReady(unit);
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
  addFury(unit, 5);
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
    addFury(attacker, 3);
  }

  const turnStamp = options.turnStamp ?? null;
  const targetHp = Number.isFinite(target.hp) ? Number(target.hp) : 0;
  const targetHpMax = Math.max(1, Number.isFinite(target.hpMax) ? Number(target.hpMax) : 1);
  if (targetHp / targetHpMax < 0.3 && state.basicTurnStamp !== turnStamp) {
    addFury(attacker, 5);
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
  const choice = (unit as UyenControlState | null)?.leaderUltChoice;
  if (choice === 'A' || choice === 'B' || choice === 'C') return choice;
  return 'C';
}

export function setUyenUltChoice(unit: UnitToken | null | undefined, choice: UyenUltChoice): void {
  if (!isUyenLeader(unit)) return;
  (unit as UyenControlState).leaderUltChoice = choice;
}

export function queueUyenUltCast(unit: UnitToken | null | undefined, choice?: UyenUltChoice): void {
  if (!isUyenLeader(unit)) return;
  if (choice) {
    setUyenUltChoice(unit, choice);
  }
  (unit as UyenControlState).leaderUltQueued = true;
}

export function hasQueuedUyenUlt(unit: UnitToken | null | undefined): boolean {
  return Boolean((unit as UyenControlState | null)?.leaderUltQueued);
}

export function clearQueuedUyenUlt(unit: UnitToken | null | undefined): void {
  if (!unit) return;
  (unit as UyenControlState).leaderUltQueued = false;
}