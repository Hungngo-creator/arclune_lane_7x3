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
  if (Number.isFinite(furyCfg?.turn?.cap)) return furyCfg.turn.cap;
  return DEFAULT_TURN_CAP;
}

function resolveSkillCap(cfg){
  const furyCfg = cfg?.fury || {};
  if (Number.isFinite(furyCfg.skillCap)) return furyCfg.skillCap;
  if (Number.isFinite(furyCfg?.skill?.cap)) return furyCfg.skill.cap;
  return DEFAULT_SKILL_CAP;
}

function resolveHitCap(cfg){
  const furyCfg = cfg?.fury || {};
  if (Number.isFinite(furyCfg.hitCap)) return furyCfg.hitCap;
  if (Number.isFinite(furyCfg?.hit?.cap)) return furyCfg.hit.cap;
  return DEFAULT_HIT_CAP;
}

function resolveGainAmount(spec = {}, cfg = CFG){
  if (Number.isFinite(spec.amount)) return Math.floor(spec.amount);
  const furyCfg = cfg?.fury || {};
  const table = furyCfg.gain || {};
  const key = spec.type || 'generic';
  const mode = table[key] || {};
  const single = Number.isFinite(mode.single) ? mode.single : (Number.isFinite(mode.base) ? mode.base : 0);
  const aoeVal = Number.isFinite(mode.aoe) ? mode.aoe : single;
  let base = spec.isAoE ? aoeVal : single;
  if (spec.isCrit && Number.isFinite(mode.crit)) base += mode.crit;
  if (spec.isKill && Number.isFinite(mode.kill)) base += mode.kill;
  if (spec.targetsHit && Number.isFinite(mode.perTarget)) base += mode.perTarget * spec.targetsHit;
  if (Number.isFinite(spec.dealt) && Number.isFinite(mode.scaled)){
    base += Math.floor(Math.max(0, spec.dealt) * mode.scaled);
  }
  if (Number.isFinite(mode.min)) base = Math.max(mode.min, base);
  if (Number.isFinite(mode.max)) base = Math.min(mode.max, base);
  if (Number.isFinite(spec.bonus)) base += spec.bonus;
  if (Number.isFinite(spec.multiplier)) base *= spec.multiplier;
  return Math.floor(Math.max(0, base));
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
  if (opts.grantStart !== false){
    const furyCfg = CFG?.fury || {};
    const startAmount = Number.isFinite(opts.startAmount)
      ? opts.startAmount
      : (Number.isFinite(furyCfg?.turn?.startGain) ? furyCfg.turn.startGain : (furyCfg.startGain ?? 3));
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
  const amountRaw = resolveGainAmount(spec, cfg);
  if (amountRaw <= 0) return 0;
  const state = ensureState(unit);
  if (!state) return 0;
  const turnCap = resolveTurnCap(cfg);
  const skillCap = resolveSkillCap(cfg);
  const hitCap = resolveHitCap(cfg);

  const perTurnLeft = turnCap - state.turnGain;
  const perSkillLeft = skillCap - state.skillGain;
  const perHitLeft = hitCap - state.hitGain;
  const room = Math.min(perTurnLeft, perSkillLeft, perHitLeft);
  if (room <= 0) return 0;

  let amount = Math.min(amountRaw, room);
  amount = applyBonuses(unit, amount);
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
  const state = ensureState(target);
  if (state?.freshSummon){
    state.freshSummon = false;
    return 0;
  }
  const furyCfg = cfg?.fury || {};
  const drainCfg = furyCfg.drain || {};
  const min = Number.isFinite(opts.min) ? opts.min : (Number.isFinite(drainCfg.min) ? drainCfg.min : 0);
  const max = Number.isFinite(opts.max) ? opts.max : (Number.isFinite(drainCfg.max) ? drainCfg.max : null);
  const base = Number.isFinite(opts.amount) ? opts.amount : (Number.isFinite(drainCfg.amount) ? drainCfg.amount : min);
  let desired = Math.max(min, Math.floor(base));
  if (Number.isFinite(max)) desired = Math.min(desired, max);
  if (desired <= 0) return 0;
  const before = Math.floor(target.fury ?? 0);
  const drained = Math.min(before, desired);
  if (drained <= 0) return 0;
  target.fury = before - drained;
  target.rage = target.fury;
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
