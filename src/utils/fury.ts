import { CFG } from '../config.ts';
import { safeNow } from './time.ts';

import type { FuryState, UnitId, UnitToken } from '@shared-types/units-export';

const DEFAULT_TURN_CAP = 40;
const DEFAULT_SKILL_CAP = 30;
const DEFAULT_HIT_CAP = 20;
const TURN_GRANT_KEY = Symbol('turn');

type FuryGainSpec = {
  amount?: number;
  type?: string;
  base?: number;
  bonus?: number;
  multiplier?: number;
  damageTaken?: number;
  dealt?: number;
  selfMaxHp?: number;
  targetMaxHp?: number;
  isAoE?: boolean;
  isCrit?: boolean;
  isKill?: boolean;
  targetsHit?: number;
};

type FuryGainResult = {
  amount: number;
  perTarget: number;
};

type FuryTurnOptions = {
  clearFresh?: boolean;
  turnStamp?: unknown;
  turnKey?: unknown;
  grantStart?: boolean;
  startAmount?: number;
};

type FuryDrainOptions = {
  base?: number;
  percent?: number;
  skillTotalCap?: number;
};

type FuryConfigLike = Partial<(typeof CFG)['fury']> & Record<string, unknown>;
type UnitTokenInternal = UnitToken & Record<string, unknown>;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function ensureAlias(unit: UnitToken | null | undefined): void {
  if (!unit) return;
  const internal = unit as UnitTokenInternal;
  const rageValue = toNumber(internal.rage);
  if (!isFiniteNumber(internal.fury) && Number.isFinite(rageValue)){
    internal.fury = rageValue;
  }
  if (!isFiniteNumber(internal.fury)) internal.fury = 0;
  try {
    const desc = Object.getOwnPropertyDescriptor(internal, 'rage');
    if (!desc || (!desc.get && !desc.set)){
      Object.defineProperty(internal, 'rage', {
        configurable: true,
        enumerable: true,
        get(){ return toNumber((internal as UnitTokenInternal).fury); },
        set(v){ internal.fury = toNumber(v); }
      });
    } else {
      internal.rage = toNumber(internal.fury);
    }
  } catch (_) {
    internal.rage = toNumber(internal.fury);
  }
}

function ensureState(unit: UnitToken | null | undefined): FuryState | null {
  if (!unit) return null;
  ensureAlias(unit);
  const internal = unit as UnitTokenInternal;
  if (!internal._furyState){
    internal._furyState = {
      turnGain: 0,
      skillGain: 0,
      hitGain: 0,
      skillPerTargetGain: 0,
      skillDrain: 0,
      turnStamp: null,
      skillTag: null,
      freshSummon: false,
      lastStart: safeNow()
    } satisfies FuryState;
  }
  return internal._furyState ?? null;
}

export function resolveMaxFury(unitId: UnitId | null | undefined, cfg: typeof CFG = CFG): number {
  const furyCfg = ((cfg?.fury ?? {}) as FuryConfigLike);
  const special = (furyCfg.specialMax as Record<string, unknown> | undefined) ?? {};
  const entry = unitId ? special[unitId] : null;
  if (isFiniteNumber(entry)) return entry;
  if (entry && typeof entry === 'object'){
    const entryObj = entry as Record<string, unknown>;
    if (isFiniteNumber(entryObj.max)) return Math.floor(entryObj.max);
    if (isFiniteNumber(entryObj.value)) return Math.floor(entryObj.value);
  }
  if (isFiniteNumber(furyCfg.max)) return Math.floor(furyCfg.max);
  const baseMaxValue = (furyCfg as Record<string, unknown>).baseMax;
  if (isFiniteNumber(baseMaxValue)){
    return Math.floor(Number(baseMaxValue));
  }
  return 100;
}

export function resolveUltCost(unit: UnitToken | null | undefined, cfg: typeof CFG = CFG): number {
  if (!unit) return resolveMaxFury(null, cfg);
  const furyCfg = ((cfg?.fury ?? {}) as FuryConfigLike);
  const special = (furyCfg.specialMax as Record<string, unknown> | undefined) ?? {};
  const entry = special[unit.id];
  if (entry && typeof entry === 'object'){
    const entryObj = entry as Record<string, unknown>;
    if (isFiniteNumber(entryObj.ultCost)) return Math.floor(entryObj.ultCost);
  }
  if (isFiniteNumber(furyCfg.ultCost)) return Math.floor(furyCfg.ultCost);
  return isFiniteNumber(unit.furyMax) ? Math.floor(unit.furyMax) : resolveMaxFury(unit.id, cfg);
}

export function initializeFury(
  unit: UnitToken | null | undefined,
  unitId: UnitId | null | undefined,
  initial = 0,
  cfg: typeof CFG = CFG
): void {
  if (!unit) return;
  const max = resolveMaxFury(unitId, cfg);
  unit.furyMax = isFiniteNumber(max) && max > 0 ? Math.max(1, Math.floor(max)) : 100;
  ensureAlias(unit);
  setFury(unit, initial);
  const state = ensureState(unit);
  if (state){
    state.turnGain = 0;
    state.skillGain = 0;
    state.hitGain = 0;
    state.skillPerTargetGain = 0;
    state.skillDrain = 0;
    state.turnStamp = null;
    state.skillTag = null;
    state.freshSummon = true;
    state.lastStart = safeNow();
  }
}

export function markFreshSummon(unit: UnitToken | null | undefined, flag = true): void {
  const state = ensureState(unit);
  if (state){
    state.freshSummon = !!flag;
    state.lastStart = safeNow();
  }
}

export function clearFreshSummon(unit: UnitToken | null | undefined): void {
  const state = ensureState(unit);
  if (state){
    state.freshSummon = false;
  }
}

export function setFury(unit: UnitToken | null | undefined, value: unknown): number {
  if (!unit) return 0;
  ensureAlias(unit);
  const max = isFiniteNumber(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, CFG);
  const amount = Math.max(0, Math.min(max, Math.floor(toNumber(value))));
  unit.fury = amount;
  unit.rage = amount;
  return amount;
}

function resolveTurnCap(cfg: typeof CFG): number {
  const furyCfg = ((cfg?.fury ?? {}) as FuryConfigLike);
  if (isFiniteNumber(furyCfg.turnCap)) return Math.floor(furyCfg.turnCap);
  const caps = furyCfg.caps as Record<string, unknown> | undefined;
  if (caps && isFiniteNumber(caps.perTurn)) return Math.floor(caps.perTurn);
  const turn = furyCfg.turn as Record<string, unknown> | undefined;
  if (turn && isFiniteNumber(turn.cap)) return Math.floor(turn.cap);
  return DEFAULT_TURN_CAP;
}

function resolveSkillCap(cfg: typeof CFG): number {
  const furyCfg = ((cfg?.fury ?? {}) as FuryConfigLike);
  if (isFiniteNumber(furyCfg.skillCap)) return Math.floor(furyCfg.skillCap);
  const caps = furyCfg.caps as Record<string, unknown> | undefined;
  if (caps && isFiniteNumber(caps.perSkill)) return Math.floor(caps.perSkill);
  const skill = furyCfg.skill as Record<string, unknown> | undefined;
  if (skill && isFiniteNumber(skill.cap)) return Math.floor(skill.cap);
  return DEFAULT_SKILL_CAP;
}

function resolveHitCap(cfg: typeof CFG): number {
  const furyCfg = ((cfg?.fury ?? {}) as FuryConfigLike);
  if (isFiniteNumber(furyCfg.hitCap)) return Math.floor(furyCfg.hitCap);
  const caps = furyCfg.caps as Record<string, unknown> | undefined;
  if (caps && isFiniteNumber(caps.perHit)) return Math.floor(caps.perHit);
  const hit = furyCfg.hit as Record<string, unknown> | undefined;
  if (hit && isFiniteNumber(hit.cap)) return Math.floor(hit.cap);
  return DEFAULT_HIT_CAP;
}

function resolveGainAmount(
  spec: FuryGainSpec = {},
  cfg: typeof CFG = CFG,
  state: FuryState | null = null
): FuryGainResult {
  if (isFiniteNumber(spec.amount)){
    return { amount: Math.floor(spec.amount), perTarget: 0 };
  }
  const furyCfg = ((cfg?.fury ?? {}) as FuryConfigLike);
  const table = (furyCfg.gain as Record<string, unknown> | undefined) ?? {};
  const type = spec.type ?? 'generic';

  if (type === 'turnStart'){
    const turnStart = table.turnStart as { amount?: unknown } | undefined;
    const amount = isFiniteNumber(turnStart?.amount)
      ? turnStart!.amount
      : ((): number => {
          const turn = furyCfg.turn as Record<string, unknown> | undefined;
          if (turn && isFiniteNumber(turn.startGain)) return turn.startGain;
          const fallback = (furyCfg as Record<string, unknown>).startGain;
          if (isFiniteNumber(fallback)) return Number(fallback);
          return 0;
        })();
    return { amount: Math.floor(Math.max(0, amount ?? 0)), perTarget: 0 };
  }

  if (type === 'damageTaken'){
    const mode = (table.damageTaken as Record<string, unknown> | undefined) ?? {};
    let total = isFiniteNumber(spec.base)
      ? spec.base
      : isFiniteNumber(mode.base)
        ? Number(mode.base)
        : 0;
    const ratio = isFiniteNumber(mode.selfRatio) ? Number(mode.selfRatio) : 0;
    const taken = isFiniteNumber(spec.damageTaken)
      ? spec.damageTaken
      : isFiniteNumber(spec.dealt)
        ? spec.dealt
        : undefined;
    if (ratio && isFiniteNumber(taken) && isFiniteNumber(spec.selfMaxHp) && spec.selfMaxHp > 0){
      total += Math.round((ratio * Math.max(0, taken ?? 0)) / spec.selfMaxHp);
    }
    if (isFiniteNumber(mode.min)) total = Math.max(Number(mode.min), total);
    if (isFiniteNumber(mode.max)) total = Math.min(Number(mode.max), total);
    if (isFiniteNumber(spec.bonus)) total += spec.bonus;
    if (isFiniteNumber(spec.multiplier)) total *= spec.multiplier;
    return { amount: Math.floor(Math.max(0, total)), perTarget: 0 };
  }

  const isAoE = !!spec.isAoE || (isFiniteNumber(spec.targetsHit) && (spec.targetsHit ?? 0) > 1);
  const mode = (isAoE
    ? (table.dealAoePerTarget as Record<string, unknown> | undefined)
    : (table.dealSingle as Record<string, unknown> | undefined)) ?? {};
  let total = isFiniteNumber(spec.base)
    ? spec.base
    : isFiniteNumber(mode.base)
      ? Number(mode.base)
      : 0;
  if (spec.isCrit && isFiniteNumber(mode.crit)) total += Number(mode.crit);
  if (spec.isKill && isFiniteNumber(mode.kill)) total += Number(mode.kill);

  let perTargetApplied = 0;
  if (isFiniteNumber(spec.targetsHit) && spec.targetsHit > 0 && isFiniteNumber(mode.perTarget)){
    const desired = Number(mode.perTarget) * spec.targetsHit;
    const used = state?.skillPerTargetGain ?? 0;
    const room = Math.max(0, 12 - used);
    const granted = Math.max(0, Math.min(desired, room));
    total += granted;
    perTargetApplied = granted;
  }

  const ratio = isFiniteNumber(mode.targetRatio) ? Number(mode.targetRatio) : 0;
  if (
    ratio &&
    isFiniteNumber(spec.dealt) &&
    isFiniteNumber(spec.targetMaxHp) &&
    (spec.targetMaxHp ?? 0) > 0
  ){
    total += Math.round((ratio * Math.max(0, spec.dealt ?? 0)) / spec.targetMaxHp);
  }

  if (isFiniteNumber(mode.min)) total = Math.max(Number(mode.min), total);
  if (isFiniteNumber(mode.max)) total = Math.min(Number(mode.max), total);
  if (isFiniteNumber(spec.bonus)) total += spec.bonus;
  if (isFiniteNumber(spec.multiplier)) total *= spec.multiplier;

  return { amount: Math.floor(Math.max(0, total)), perTarget: perTargetApplied };
}

function applyBonuses(unit: UnitToken | null | undefined, amount: number): number {
  if (!unit) return amount;
  const internal = unit as UnitTokenInternal;
  const bonus = toNumber(internal.furyGainBonus ?? internal.rageGainBonus);
  if (bonus !== 0) return Math.floor(Math.max(0, amount * (1 + bonus)));
  return amount;
}

export function startFuryTurn(unit: UnitToken | null | undefined, opts: FuryTurnOptions = {}): void {
  const state = ensureState(unit);
  if (!state) return;
  if (opts.clearFresh !== false) state.freshSummon = false;
  const stamp = opts.turnStamp ?? opts.turnKey ?? TURN_GRANT_KEY;
  if (state.turnStamp !== stamp){
    state.turnStamp = stamp;
    state.turnGain = 0;
  }
  state.skillGain = 0;
  state.hitGain = 0;
  state.skillTag = null;
  state.skillPerTargetGain = 0;
  state.skillDrain = 0;
  if (opts.grantStart !== false){
    const furyCfg = ((CFG?.fury ?? {}) as FuryConfigLike);
    const gainCfg = (furyCfg.gain as Record<string, unknown> | undefined)?.turnStart as
      | { amount?: unknown }
      | undefined;
    const baseStart = isFiniteNumber(gainCfg?.amount)
      ? gainCfg!.amount
      : ((): number => {
          const turn = furyCfg.turn as Record<string, unknown> | undefined;
          if (turn && isFiniteNumber(turn.startGain)) return turn.startGain;
          return isFiniteNumber((furyCfg as Record<string, unknown>).startGain)
            ? Number((furyCfg as Record<string, unknown>).startGain)
            : 3;
        })();
    const startAmount = isFiniteNumber(opts.startAmount) ? opts.startAmount : baseStart;
    if ((startAmount ?? 0) > 0){
      gainFury(unit, { amount: startAmount, type: 'turnStart' });
    }
  }
}

export function startFurySkill(
  unit: UnitToken | null | undefined,
  { tag = null, forceReset = false }: { tag?: string | null; forceReset?: boolean } = {}
): void {
  const state = ensureState(unit);
  if (!state) return;
  const skillTag = tag || '__skill__';
  if (forceReset || state.skillTag !== skillTag){
    state.skillTag = skillTag;
    state.skillGain = 0;
    state.hitGain = 0;
    state.skillPerTargetGain = 0;
    state.skillDrain = 0;
  }
}

export function finishFuryHit(unit: UnitToken | null | undefined): void {
  const state = ensureState(unit);
  if (state){
    state.hitGain = 0;
  }
}

export function gainFury(
  unit: UnitToken | null | undefined,
  spec: FuryGainSpec = {},
  cfg: typeof CFG = CFG
): number {
  if (!unit) return 0;
  ensureAlias(unit);
  const state = ensureState(unit);
  if (!state) return 0;
  const { amount: desiredRaw, perTarget = 0 } = resolveGainAmount(spec, cfg, state);
  if (desiredRaw <= 0) return 0;
  const turnCap = resolveTurnCap(cfg);
  const skillCap = resolveSkillCap(cfg);
  const hitCap = resolveHitCap(cfg);

  const perTurnLeft = turnCap - state.turnGain;
  const perSkillLeft = skillCap - state.skillGain;
  const perHitLeft = hitCap - state.hitGain;
  const room = Math.min(perTurnLeft, perSkillLeft, perHitLeft);
  if (room <= 0) return 0;

  const rawBeforeBonus = Math.min(desiredRaw, room);
  let amount = applyBonuses(unit, rawBeforeBonus);
  if (amount <= 0) return 0;

  const max = isFiniteNumber(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, cfg);
  const currentFury = Math.floor(unit.fury ?? 0);
  const next = Math.max(0, Math.min(max, currentFury + amount));
  const gained = next - currentFury;
  if (gained <= 0) return 0;
  unit.fury = next;
  unit.rage = next;
  state.turnGain += gained;
  state.skillGain += gained;
  state.hitGain += gained;
  if (perTarget > 0 && rawBeforeBonus > 0){
    const ratio = amount > 0 ? Math.min(1, gained / amount) : 0;
    if (ratio > 0){
      const applied = Math.min(perTarget, Math.round(perTarget * ratio));
      state.skillPerTargetGain = Math.min(12, (state.skillPerTargetGain ?? 0) + applied);
    }
  }
  return gained;
}

export function spendFury(unit: UnitToken | null | undefined, amount: unknown, cfg: typeof CFG = CFG): number {
  if (!unit) return 0;
  ensureAlias(unit);
  const amt = Math.max(0, Math.floor(toNumber(amount)));
  const before = Math.floor(unit.fury ?? 0);
  const next = Math.max(0, before - amt);
  unit.fury = next;
  unit.rage = next;
  return before - next;
}

export function drainFury(
  source: UnitToken | null | undefined,
  target: UnitToken | null | undefined,
  opts: FuryDrainOptions = {},
  cfg: typeof CFG = CFG
): number {
  if (!target) return 0;
  ensureAlias(target);
  const targetState = ensureState(target);
  if (targetState?.freshSummon) return 0;
  const furyCfg = ((cfg?.fury ?? {}) as FuryConfigLike);
  const drainCfg = (furyCfg.drain as Record<string, unknown> | undefined) ?? {};
  const base = isFiniteNumber(opts.base)
    ? opts.base
    : isFiniteNumber(drainCfg.perTargetBase)
      ? Number(drainCfg.perTargetBase)
      : 0;
  const percent = isFiniteNumber(opts.percent)
    ? opts.percent
    : isFiniteNumber(drainCfg.perTargetPct)
      ? Number(drainCfg.perTargetPct)
      : 0;
  const skillCap = isFiniteNumber(opts.skillTotalCap)
    ? opts.skillTotalCap
    : isFiniteNumber(drainCfg.skillTotalCap)
      ? Number(drainCfg.skillTotalCap)
      : null;

  const current = Math.max(0, Math.floor(target.fury ?? 0));
  if (current <= 0) return 0;

  let desired = Math.max(0, Math.floor(base ?? 0));
  if (percent) desired += Math.round(current * percent);
  if (desired <= 0) return 0;

  let capRoom = desired;
  let sourceState: FuryState | null = null;
  if (isFiniteNumber(skillCap)){
    sourceState = ensureState(source);
    const used = sourceState ? sourceState.skillDrain ?? 0 : 0;
    capRoom = Math.max(0, Math.min(desired, skillCap - used));
  }

  const drained = Math.max(0, Math.min(current, capRoom));
  if (drained <= 0) return 0;

  target.fury = current - drained;
  target.rage = target.fury;

  if (sourceState && isFiniteNumber(skillCap)){
    sourceState.skillDrain = (sourceState.skillDrain ?? 0) + drained;
  }

  return drained;
}

export function furyValue(unit: UnitToken | null | undefined): number {
  if (!unit) return 0;
  ensureAlias(unit);
  return Math.floor(unit.fury ?? 0);
}

export function furyRoom(unit: UnitToken | null | undefined): number {
  if (!unit) return 0;
  ensureAlias(unit);
  const max = isFiniteNumber(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, CFG);
  return Math.max(0, max - Math.floor(unit.fury ?? 0));
}

export function furyState(unit: UnitToken | null | undefined): FuryState | null {
  return ensureState(unit);
}
