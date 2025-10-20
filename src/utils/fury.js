import { CFG } from '../config.js';
import { safeNow } from './time.js';

const DEFAULT_TURN_CAP = 40;
const DEFAULT_SKILL_CAP = 30;
const DEFAULT_HIT_CAP = 20;
const TURN_GRANT_KEY = Symbol('turn');

function toNumber(value){
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function ensureAlias(unit){
  if (!unit) return;
  if (typeof unit.fury !== 'number' && typeof unit.rage === 'number'){
    unit.fury = unit.rage;
  }
  if (typeof unit.fury !== 'number') unit.fury = 0;
  try {
    const desc = Object.getOwnPropertyDescriptor(unit, 'rage');
    if (!desc || (!desc.get && !desc.set)){
      Object.defineProperty(unit, 'rage', {
        configurable: true,
        enumerable: true,
        get(){ return this.fury ?? 0; },
        set(v){ this.fury = toNumber(v); }
      });
    } else {
      unit.rage = unit.fury;
    }
  } catch (_) {
    unit.rage = unit.fury;
  }
}

function ensureState(unit){
  if (!unit) return null;
  ensureAlias(unit);
  if (!unit._furyState){
    unit._furyState = {
      turnGain: 0,
      skillGain: 0,
      hitGain: 0,
      skillPerTargetGain: 0,
      skillDrain: 0,
      turnStamp: null,
      skillTag: null,
      freshSummon: false,
      lastStart: safeNow()
    };
  }
  return unit._furyState;
}

export function resolveMaxFury(unitId, cfg = CFG){
  const furyCfg = cfg?.fury || {};
  const special = furyCfg.specialMax || {};
  const entry = unitId ? special[unitId] : null;
  if (entry != null){
    if (typeof entry === 'number') return entry;
    if (typeof entry === 'object'){
      if (Number.isFinite(entry.max)) return entry.max;
      if (Number.isFinite(entry.value)) return entry.value;
    }
  }
  if (Number.isFinite(furyCfg.max)) return furyCfg.max;
  if (Number.isFinite(furyCfg.baseMax)) return furyCfg.baseMax;
  return 100;
}

export function resolveUltCost(unit, cfg = CFG){
  if (!unit) return resolveMaxFury(null, cfg);
  const furyCfg = cfg?.fury || {};
  const special = furyCfg.specialMax || {};
  const entry = special[unit.id];
  if (entry && typeof entry === 'object' && Number.isFinite(entry.ultCost)){
    return entry.ultCost;
  }
  if (Number.isFinite(furyCfg.ultCost)) return furyCfg.ultCost;
  return unit.furyMax ?? resolveMaxFury(unit.id, cfg);
}

export function initializeFury(unit, unitId, initial = 0, cfg = CFG){
  if (!unit) return;
  const max = resolveMaxFury(unitId, cfg);
  unit.furyMax = Number.isFinite(max) && max > 0 ? Math.max(1, Math.floor(max)) : 100;
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

export function markFreshSummon(unit, flag = true){
  const state = ensureState(unit);
  if (state){
    state.freshSummon = !!flag;
    state.lastStart = safeNow();
  }
}

export function clearFreshSummon(unit){
  const state = ensureState(unit);
  if (state){
    state.freshSummon = false;
  }
}

export function setFury(unit, value){
  if (!unit) return 0;
  ensureAlias(unit);
  const max = Number.isFinite(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, CFG);
  const amount = Math.max(0, Math.min(max, Math.floor(toNumber(value))));
  unit.fury = amount;
  unit.rage = amount;
  return amount;
}

function resolveTurnCap(cfg){
  const furyCfg = cfg?.fury || {};
  if (Number.isFinite(furyCfg.turnCap)) return furyCfg.turnCap;
  if (Number.isFinite(furyCfg?.caps?.perTurn)) return furyCfg.caps.perTurn;
  if (Number.isFinite(furyCfg?.turn?.cap)) return furyCfg.turn.cap;
  return DEFAULT_TURN_CAP;
}

function resolveSkillCap(cfg){
  const furyCfg = cfg?.fury || {};
  if (Number.isFinite(furyCfg.skillCap)) return furyCfg.skillCap;
  if (Number.isFinite(furyCfg?.caps?.perSkill)) return furyCfg.caps.perSkill;
  if (Number.isFinite(furyCfg?.skill?.cap)) return furyCfg.skill.cap;
  return DEFAULT_SKILL_CAP;
}

function resolveHitCap(cfg){
  const furyCfg = cfg?.fury || {};
  if (Number.isFinite(furyCfg.hitCap)) return furyCfg.hitCap;
  if (Number.isFinite(furyCfg?.caps?.perHit)) return furyCfg.caps.perHit;
  if (Number.isFinite(furyCfg?.hit?.cap)) return furyCfg.hit.cap;
  return DEFAULT_HIT_CAP;
}

function resolveGainAmount(spec = {}, cfg = CFG, state = null){
  if (Number.isFinite(spec.amount)){
    return { amount: Math.floor(spec.amount), perTarget: 0 };
  }
  const furyCfg = cfg?.fury || {};
  const table = furyCfg.gain || {};
  const type = spec.type || 'generic';

  if (type === 'turnStart'){
    const amount = Number.isFinite(table?.turnStart?.amount)
      ? table.turnStart.amount
      : (Number.isFinite(furyCfg?.turn?.startGain) ? furyCfg.turn.startGain : (furyCfg.startGain ?? 0));
    return { amount: Math.floor(Math.max(0, amount)), perTarget: 0 };
  }

  if (type === 'damageTaken'){
    const mode = table.damageTaken || {};
    let total = Number.isFinite(spec.base) ? spec.base : (Number.isFinite(mode.base) ? mode.base : 0);
    const ratio = Number.isFinite(mode.selfRatio) ? mode.selfRatio : 0;
    const taken = Number.isFinite(spec.damageTaken) ? spec.damageTaken : spec.dealt;
    if (ratio && Number.isFinite(taken) && Number.isFinite(spec.selfMaxHp) && spec.selfMaxHp > 0){
      total += Math.round((ratio * Math.max(0, taken)) / spec.selfMaxHp);
    }
    if (Number.isFinite(mode.min)) total = Math.max(mode.min, total);
    if (Number.isFinite(mode.max)) total = Math.min(mode.max, total);
    if (Number.isFinite(spec.bonus)) total += spec.bonus;
    if (Number.isFinite(spec.multiplier)) total *= spec.multiplier;
    return { amount: Math.floor(Math.max(0, total)), perTarget: 0 };
  }

  const isAoE = !!spec.isAoE || (Number.isFinite(spec.targetsHit) && spec.targetsHit > 1);
  const mode = isAoE ? (table.dealAoePerTarget || {}) : (table.dealSingle || {});
  let total = Number.isFinite(spec.base) ? spec.base : (Number.isFinite(mode.base) ? mode.base : 0);
  if (spec.isCrit && Number.isFinite(mode.crit)) total += mode.crit;
  if (spec.isKill && Number.isFinite(mode.kill)) total += mode.kill;

  let perTargetApplied = 0;
  if (Number.isFinite(spec.targetsHit) && spec.targetsHit > 0 && Number.isFinite(mode.perTarget)){
    const desired = mode.perTarget * spec.targetsHit;
    const used = state?.skillPerTargetGain ?? 0;
    const room = Math.max(0, 12 - used);
    const granted = Math.max(0, Math.min(desired, room));
    total += granted;
    perTargetApplied = granted;
  }

  const ratio = Number.isFinite(mode.targetRatio) ? mode.targetRatio : 0;
  if (ratio && Number.isFinite(spec.dealt) && Number.isFinite(spec.targetMaxHp) && spec.targetMaxHp > 0){
    total += Math.round((ratio * Math.max(0, spec.dealt)) / spec.targetMaxHp);
  }

   if (Number.isFinite(mode.min)) total = Math.max(mode.min, total);
  if (Number.isFinite(mode.max)) total = Math.min(mode.max, total);
  if (Number.isFinite(spec.bonus)) total += spec.bonus;
  if (Number.isFinite(spec.multiplier)) total *= spec.multiplier;

  return { amount: Math.floor(Math.max(0, total)), perTarget: perTargetApplied };
  }

function applyBonuses(unit, amount){
  if (!unit) return amount;
  const bonus = toNumber(unit.furyGainBonus ?? unit.rageGainBonus);
  if (bonus !== 0) return Math.floor(Math.max(0, amount * (1 + bonus)));
  return amount;
}

export function startFuryTurn(unit, opts = {}){
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
    const furyCfg = CFG?.fury || {};
    const baseStart = Number.isFinite(furyCfg?.gain?.turnStart?.amount)
      ? furyCfg.gain.turnStart.amount
      : (Number.isFinite(furyCfg?.turn?.startGain) ? furyCfg.turn.startGain : (furyCfg.startGain ?? 3));
    const startAmount = Number.isFinite(opts.startAmount) ? opts.startAmount : baseStart;
    if (startAmount > 0){
      gainFury(unit, { amount: startAmount, type: 'turnStart' });
    }
  }
}

export function startFurySkill(unit, { tag = null, forceReset = false } = {}){
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

export function finishFuryHit(unit){
  const state = ensureState(unit);
  if (state){
    state.hitGain = 0;
  }
}

export function gainFury(unit, spec = {}, cfg = CFG){
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

  const max = Number.isFinite(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, cfg);
  const next = Math.max(0, Math.min(max, Math.floor(unit.fury ?? 0) + amount));
  const gained = next - Math.floor(unit.fury ?? 0);
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

export function spendFury(unit, amount, cfg = CFG){
  if (!unit) return 0;
  ensureAlias(unit);
  const amt = Math.max(0, Math.floor(toNumber(amount)));
  const before = Math.floor(unit.fury ?? 0);
  const next = Math.max(0, before - amt);
  unit.fury = next;
  unit.rage = next;
  return before - next;
}

export function drainFury(source, target, opts = {}, cfg = CFG){
  if (!target) return 0;
  ensureAlias(target);
  const targetState = ensureState(target);
  if (targetState?.freshSummon) return 0;
  const furyCfg = cfg?.fury || {};
  const drainCfg = furyCfg.drain || {};
  const base = Number.isFinite(opts.base)
    ? opts.base
    : (Number.isFinite(drainCfg.perTargetBase) ? drainCfg.perTargetBase : 0);
  const percent = Number.isFinite(opts.percent)
    ? opts.percent
    : (Number.isFinite(drainCfg.perTargetPct) ? drainCfg.perTargetPct : 0);
  const skillCap = Number.isFinite(opts.skillTotalCap)
    ? opts.skillTotalCap
    : (Number.isFinite(drainCfg.skillTotalCap) ? drainCfg.skillTotalCap : null);

  const current = Math.max(0, Math.floor(target.fury ?? 0));
  if (current <= 0) return 0;

  let desired = Math.max(0, Math.floor(base));
  if (percent) desired += Math.round(current * percent);
  if (desired <= 0) return 0;
  
  let capRoom = desired;
  let sourceState = null;
  if (Number.isFinite(skillCap)){
    sourceState = ensureState(source);
    const used = sourceState ? (sourceState.skillDrain ?? 0) : 0;
    capRoom = Math.max(0, Math.min(desired, skillCap - used));
  }

  const drained = Math.max(0, Math.min(current, capRoom));
  if (drained <= 0) return 0;

  target.fury = current - drained;
  target.rage = target.fury;
  
  if (sourceState && Number.isFinite(skillCap)){
    sourceState.skillDrain = (sourceState.skillDrain ?? 0) + drained;
  }

  return drained;
}

export function furyValue(unit){
  if (!unit) return 0;
  ensureAlias(unit);
  return Math.floor(unit.fury ?? 0);
}

export function furyRoom(unit){
  if (!unit) return 0;
  ensureAlias(unit);
  const max = Number.isFinite(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, CFG);
  return Math.max(0, max - Math.floor(unit.fury ?? 0));
}

export function furyState(unit){
  return ensureState(unit);
}
