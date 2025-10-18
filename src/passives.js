// passives.js — passive event dispatch & helpers v0.7
import { Statuses, hookOnLethalDamage } from './statuses.js';
import { safeNow } from './utils/time.js';

const clamp01 = (x) => Math.max(0, Math.min(1, x));

const STAT_ALIAS = new Map([
  ['atk', 'atk'],
  ['attack', 'atk'],
  ['wil', 'wil'],
  ['will', 'wil'],
  ['res', 'res'],
  ['arm', 'arm'],
  ['agi', 'agi'],
  ['agility', 'agi'],
  ['per', 'per'],
  ['perception', 'per'],
  ['hp', 'hp'],
  ['hpmax', 'hpMax'],
  ['maxhp', 'hpMax'],
  ['hp_max', 'hpMax'],
  ['hpmax%', 'hpMax'],
  ['spd', 'spd'],
  ['speed', 'spd'],
  ['aemax', 'aeMax'],
  ['ae_max', 'aeMax'],
  ['aeregen', 'aeRegen'],
  ['ae_regen', 'aeRegen'],
  ['hpregen', 'hpRegen'],
  ['hp_regen', 'hpRegen']
]);

const BASE_STAT_KEYS = ['atk','wil','res','arm','agi','per','hpMax','spd','aeMax','aeRegen','hpRegen'];

function normalizeStatKey(stat){
  if (typeof stat === 'string'){
    const trimmed = stat.trim();
    if (!trimmed) return null;
    const canonical = trimmed.replace(/[%_\s]/g, '').toLowerCase();
    return STAT_ALIAS.get(canonical) || trimmed;
  }
  return null;
}

const normalizeKey = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

function ensureStatusContainer(unit){
  if (!unit) return;
  if (!Array.isArray(unit.statuses)) unit.statuses = [];
}

function stacksOf(unit, id){
  const s = Statuses.get(unit, id);
  return s ? (s.stacks || 0) : 0;
}

function ensureStatBuff(unit, id, { attr, mode='percent', amount=0, purgeable=true }){
  ensureStatusContainer(unit);
  const statKey = normalizeStatKey(attr) || attr;
  let st = Statuses.get(unit, id);
  if (!st){
    st = Statuses.add(unit, {
      id,
      kind: 'buff',
      tag: 'stat',
      attr: statKey,
      mode,
      amount,
      purgeable,
      stacks: 0
    });
  }
  st.attr = statKey;
  st.mode = mode;
  st.amount = amount;
  st.purgeable = purgeable;
  return st;
}

function applyStatStacks(st, stacks, { maxStacks = null } = {}){
  if (!st) return;
  let next = Math.max(0, stacks|0);
  if (typeof maxStacks === 'number'){ next = Math.min(next, maxStacks); }
  st.stacks = next;
}

function applyStatMap(unit, passive, stats, options = {}){
  if (!unit || !stats) return false;
  const mode = options.mode === 'flat' ? 'flat' : 'percent';
  const purgeable = options.purgeable !== false;
  const stackable = options.stack !== false;
  const stacks = Number.isFinite(options.stacks) ? options.stacks : 1;
  const maxStacks = options.maxStacks;
  const idPrefix = options.idPrefix || (passive?.id || 'stat');
  let applied = false;
  for (const [stat, value] of Object.entries(stats)){
    if (!Number.isFinite(value)) continue;
    const attr = normalizeStatKey(stat);
    if (!attr) continue;
    const st = ensureStatBuff(unit, `${idPrefix}_${attr}`, { attr, mode, amount: value, purgeable });
    const nextStacks = stackable ? (st.stacks || 0) + stacks : stacks;
    applyStatStacks(st, nextStacks, { maxStacks });
    applied = true;
  }
  if (applied) recomputeFromStatuses(unit);
  return applied;
}

function captureBaseStats(unit){
  const out = {};
  for (const key of BASE_STAT_KEYS){
    const value = unit[key];
    if (typeof value === 'number' && Number.isFinite(value)){
      out[key] = value;
    }
  }
  return out;
}

function hasLivingMinion(unit, Game){
  if (!unit || !Game) return false;
  return (Game.tokens || []).some(t => t && t.alive && t.isMinion && t.ownerIid === unit.iid);
}

function evaluateConditionObject(condition, { Game, unit, ctx, passive }){
  if (!condition || typeof condition !== 'object') return true;
  const hpMax = Number.isFinite(unit?.hpMax) ? unit.hpMax : Number.isFinite(unit?.baseStats?.hpMax) ? unit.baseStats.hpMax : 0;
  const hpPct = hpMax > 0 ? ((unit?.hp ?? hpMax) / hpMax) : 0;
  if (condition.selfHPAbove != null && hpPct <= condition.selfHPAbove) return false;
  if (condition.selfHPBelow != null && hpPct >= condition.selfHPBelow) return false;
  if (condition.hpAbove != null && hpPct <= condition.hpAbove) return false;
  if (condition.hpBelow != null && hpPct >= condition.hpBelow) return false;

  if (condition.requiresStatus){
    const list = Array.isArray(condition.requiresStatus) ? condition.requiresStatus : [condition.requiresStatus];
    for (const id of list){
      if (!Statuses.has(unit, id)) return false;
    }
  }

  if (condition.targetHasStatus){
    const target = ctx?.target;
    if (!target) return false;
    const list = Array.isArray(condition.targetHasStatus) ? condition.targetHasStatus : [condition.targetHasStatus];
    for (const id of list){
      if (!Statuses.has(target, id)) return false;
    }
  }

  if (condition.minMinions != null){
    const tokens = Game?.tokens || [];
    const count = tokens.filter(t => t && t.alive && t.isMinion && t.ownerIid === unit.iid).length;
    if (count < condition.minMinions) return false;
  }

  if (condition.maxStacks != null){
    const stackId = condition.stackId || passive?.id;
    if (stackId){
      const st = Statuses.get(unit, stackId);
      const stacks = st ? (st.stacks || 0) : 0;
      if (stacks >= condition.maxStacks) return false;
    }
  }

  return true;
}

function passiveConditionsOk({ Game, unit, passive, ctx }){
  const conditions = passive?.conditions;
  if (!conditions) return true;
  const list = Array.isArray(conditions) ? conditions : [conditions];
  for (const cond of list){
    if (!cond) continue;
    if (typeof cond === 'function'){
      try {
        if (!cond({ Game, unit, ctx, passive })) return false;
      } catch (_) {
        return false;
      }
      continue;
    }
    if (typeof cond === 'string'){
      const key = cond.trim().toLowerCase();
      if (key === 'hasminion' || key === 'requiresminion'){
        if (!hasLivingMinion(unit, Game)) return false;
      }
      continue;
    }
    if (typeof cond === 'object'){
      if (!evaluateConditionObject(cond, { Game, unit, ctx, passive })) return false;
    }
  }
  return true;
}

function recomputeFromStatuses(unit){
  if (!unit || !unit.baseStats) return;
  ensureStatusContainer(unit);

  const percent = new Map();
  const flat = new Map();
  for (const st of unit.statuses){
    if (!st || !st.attr || !st.mode) continue;
  const attr = normalizeStatKey(st.attr);
    if (!attr) continue;
    const stacks = st.stacks == null ? 1 : st.stacks;
    const amount = (st.amount ?? st.power ?? 0) * stacks;
    if (!Number.isFinite(amount)) continue;
    const mode = st.mode === 'flat' ? 'flat' : 'percent';
    const store = mode === 'flat' ? flat : percent;
    const prev = store.get(attr) || 0;
    store.set(attr, prev + amount);
  }

for (const [key, baseValue] of Object.entries(unit.baseStats)){
    if (!Number.isFinite(baseValue)) continue;
    const attr = normalizeStatKey(key) || key;
    const pct = percent.get(attr) ?? percent.get(key) ?? 0;
    const add = flat.get(attr) ?? flat.get(key) ?? 0;
    let next = baseValue * (1 + pct) + add;

    if (attr === 'arm' || attr === 'res'){
      unit[attr] = clamp01(next);
      continue;
    }
    if (attr === 'spd'){
      unit[attr] = Math.max(0, Math.round(next * 100) / 100);
      continue;
    }
    if (attr === 'hpMax' || attr === 'hp' || attr === 'aeMax'){
      unit[attr] = Math.max(0, Math.round(next));
      continue;
    }
    if (attr === 'aeRegen' || attr === 'hpRegen'){
      unit[attr] = Math.max(0, Math.round(next * 100) / 100);
      continue;
    }
    unit[attr] = Math.max(0, Math.round(next));
  }
}

function healTeam(Game, unit, pct, opts = {}){
  if (!Game || !unit) return;
  if (!Number.isFinite(pct) || pct <= 0) return;
  const mode = opts.mode || 'targetMax';
  const casterHpMax = Number.isFinite(unit.hpMax) ? unit.hpMax : 0;
  const allies = (Game.tokens || []).filter(t => t.side === unit.side && t.alive);
  for (const ally of allies){
    if (!Number.isFinite(ally.hpMax)) continue;
    const base = mode === 'casterMax' ? casterHpMax : (ally.hpMax || 0);
    if (!Number.isFinite(base) || base <= 0) continue;
    const heal = Math.max(0, Math.round(base * pct));
    if (heal <= 0) continue;
    ally.hp = Math.min(ally.hpMax, (ally.hp ?? ally.hpMax) + heal);
  }
}

const EFFECTS = {
  placeMark({ Game, unit, passive, ctx }){
    if (!ctx || !ctx.target) return;
    const params = passive?.params || {};
    const ttl = Number.isFinite(params.ttlTurns) ? params.ttlTurns : 3;
    const stacksToExplode = Math.max(1, params.stacksToExplode || 3);
    const dmgMul = params.dmgFromWIL ?? 0.5;
    const purgeable = params.purgeable !== false;
    if (!Array.isArray(ctx.afterHit)) ctx.afterHit = [];
    ctx.afterHit.push((afterCtx = {}) => {
      const target = afterCtx.target || ctx.target;
      if (!target || !target.alive) return;
      ensureStatusContainer(target);
      let st = Statuses.get(target, passive.id);
      if (!st){
        st = Statuses.add(target, {
          id: passive.id,
          kind: 'debuff',
          tag: 'mark',
          stacks: 0,
          dur: ttl,
          tick: 'turn',
          purgeable
        });
      }
      st.dur = ttl;
      st.stacks = (st.stacks || 0) + 1;
      if (st.stacks < stacksToExplode) return;

      Statuses.remove(target, passive.id);
      const amount = Math.max(1, Math.round((unit?.wil || 0) * dmgMul));
      target.hp = Math.max(0, (target.hp || 0) - amount);
      if (target.hp <= 0){
        if (!hookOnLethalDamage(target)){
          target.alive = false;
          if (!target.deadAt) target.deadAt = safeNow();
        }
      }
      if (ctx && Array.isArray(ctx.log)){
        ctx.log.push({ t: passive.id, source: unit?.name, target: target?.name, dmg: amount });
      }
    });
  },

  gainATKPercent({ unit, passive }){
    if (!unit) return;
    const params = passive?.params || {};
    const amount = params.amount ?? 0;
    applyStatMap(unit, passive, { atk: amount }, {
      mode: 'percent',
      stack: params.stack !== false,
      purgeable: params.purgeable !== false,
      maxStacks: params.maxStacks
    });
  },

  gainWILPercent({ unit, passive }){
    if (!unit) return;
    const params = passive?.params || {};
    const amount = params.amount ?? 0;
    applyStatMap(unit, passive, { wil: amount }, {
      mode: 'percent',
      stack: params.stack !== false,
      purgeable: params.purgeable !== false,
      maxStacks: params.maxStacks
    });
  },

  conditionalBuff({ unit, passive, ctx }){
    if (!unit) return;
    const params = passive?.params || {};
    const hpMax = unit.hpMax || 0;
    const hpPct = hpMax > 0 ? (unit.hp || 0) / hpMax : 0;
    const threshold = params.ifHPgt ?? 0.5;
    const trueStats = {};
    const falseStats = {};
    if (params.RES != null) trueStats.res = params.RES;
    if (params.ARM != null) trueStats.arm = params.ARM;
    if (params.ATK != null) trueStats.atk = params.ATK;
    if (params.WIL != null) trueStats.wil = params.WIL;
    if (params.elseRES != null) falseStats.res = params.elseRES;
    if (params.elseARM != null) falseStats.arm = params.elseARM;
    if (params.elseATK != null) falseStats.atk = params.elseATK;
    if (params.elseWIL != null) falseStats.wil = params.elseWIL;

    const purgeable = params.purgeable !== false;
    const applyStats = (stats, suffix) => {
      for (const [stat, amount] of Object.entries(stats)){
        const attr = stat.toLowerCase();
        const st = ensureStatBuff(unit, `${passive.id}_${attr}`, { attr, mode:'percent', amount, purgeable });
        applyStatStacks(st, 1);
      }
    };
    const removeStats = (stats) => {
      for (const stat of Object.keys(stats)){
        Statuses.remove(unit, `${passive.id}_${stat.toLowerCase()}`);
      }
    };

    if (hpPct > threshold){
      applyStats(trueStats);
      removeStats(falseStats);
    } else {
      applyStats(falseStats);
      removeStats(trueStats);
    }
    recomputeFromStatuses(unit);
  },

  gainRESPct({ Game, unit, passive }){
    if (!unit) return;
    const params = passive?.params || {};
    const amount = params.amount ?? 0;
    applyStatMap(unit, passive, { res: amount }, {
      mode: 'percent',
      stack: params.stack !== false,
      purgeable: params.purgeable !== false,
      maxStacks: params.maxStacks
    });
  },

  gainStats({ unit, passive }){
    if (!unit) return;
    const params = passive?.params || {};
    const modeRaw = params.mode || params.statMode || params.kind;
    const mode = modeRaw === 'flat' ? 'flat' : 'percent';
    let applied = false;
    if (params.stats && typeof params.stats === 'object'){
      applied = applyStatMap(unit, passive, params.stats, {
        mode,
        stack: params.stack !== false,
        stacks: params.stacks,
        purgeable: params.purgeable !== false,
        maxStacks: params.maxStacks,
        idPrefix: params.idPrefix || passive?.id
      }) || applied;
    }
    if (params.flatStats && typeof params.flatStats === 'object'){
      applied = applyStatMap(unit, passive, params.flatStats, {
        mode: 'flat',
        stack: params.stackFlat !== false,
        stacks: params.stacksFlat ?? params.stacks,
        purgeable: params.purgeable !== false,
        maxStacks: params.maxStacksFlat ?? params.maxStacks,
        idPrefix: `${passive?.id || 'stat'}_flat`
      }) || applied;
    }
    if (!applied && params.attr != null && Number.isFinite(params.amount)){
      const attr = normalizeStatKey(params.attr);
      if (attr){
        applyStatMap(unit, passive, { [attr]: params.amount }, {
          mode,
          stack: params.stack !== false,
          stacks: params.stacks,
          purgeable: params.purgeable !== false,
          maxStacks: params.maxStacks
        });
      }
    }
  },

  gainBonus({ Game, unit, passive, ctx }){
    if (!unit || !ctx) return;
    const params = passive?.params || {};
    const perMinion = params.perMinion ?? 0;
    const ownerIid = unit.iid;
    const minions = (Game.tokens || []).filter(t => t && t.alive && t.isMinion && t.ownerIid === ownerIid).length;
    const st = ensureStatBuff(unit, passive.id, { attr:'atk', mode:'percent', amount: 0, purgeable: params.purgeable !== false });
    st.attr = 'atk';
    st.mode = 'percent';
    st.amount = perMinion;
    applyStatStacks(st, minions);
    recomputeFromStatuses(unit);
    if (ctx.damage){
      const bonusPct = perMinion * minions;
      ctx.damage.baseMul = (ctx.damage.baseMul ?? 1) * (1 + bonusPct);
    }
  },

  resPerSleeping({ Game, unit, passive }){
    if (!Game || !unit) return;
    const params = passive?.params || {};
    const foes = (Game.tokens || []).filter(t => t && t.alive && t.side !== unit.side && Statuses.has(t, 'sleep'));
    const st = ensureStatBuff(unit, passive.id, { attr:'res', mode:'percent', amount: params.perTarget ?? 0, purgeable: params.purgeable !== false });
    applyStatStacks(st, foes.length, { maxStacks: params.maxStacks });
    recomputeFromStatuses(unit);
  }
};

const EFFECT_MAP = {
  placeMark: EFFECTS.placeMark,
  'gainATK%': EFFECTS.gainATKPercent,
  'gainWIL%': EFFECTS.gainWILPercent,
  conditionalBuff: EFFECTS.conditionalBuff,
  'gainRES%': EFFECTS.gainRESPct,
  gainBonus: EFFECTS.gainBonus,
  gainStats: EFFECTS.gainStats,
  'gainStats%': EFFECTS.gainStats,
  statBuff: EFFECTS.gainStats,
  statGain: EFFECTS.gainStats
};

export function emitPassiveEvent(Game, unit, when, ctx = {}){
  if (!Game || !unit) return;
  const meta = Game.meta && typeof Game.meta.get === 'function' ? Game.meta.get(unit.id) : null;
  const kit = meta?.kit;
  if (!kit || !Array.isArray(kit.passives)) return;
  ctx.meta = meta;
  ctx.kit = kit;
  for (const passive of kit.passives){
    if (!passive || passive.when !== when) continue;
    const effectKey = typeof passive.effect === 'string'
      ? passive.effect
      : (passive.effect?.type || passive.effect?.kind || null);
    let handler = effectKey ? EFFECT_MAP[effectKey] : EFFECT_MAP[passive.effect];
    let effectivePassive = passive;

    if (passive && typeof passive.effect === 'object' && passive.effect !== null){
      const spec = passive.effect;
      const type = spec.type || spec.kind;
      if (type && EFFECT_MAP[type]) handler = EFFECT_MAP[type];
      const mergedParams = {
        ...(spec.params || {}),
        ...(passive.params || {}),
        ...(spec.stats ? { stats: spec.stats } : {}),
        ...(spec.flatStats ? { flatStats: spec.flatStats } : {})
      };
      effectivePassive = { ...passive, params: mergedParams };
      if (!handler && (mergedParams.stats || mergedParams.flatStats)){
        handler = EFFECTS.gainStats;
      }
    } else if (!handler && passive?.params && (passive.params.stats || passive.params.flatStats)){
      handler = EFFECTS.gainStats;
    }

    if (effectKey === 'gainRES%' && effectivePassive?.params?.perTarget != null){
      handler = EFFECTS.resPerSleeping;
    }
    if (typeof handler !== 'function') continue;
    if (!passiveConditionsOk({ Game, unit, passive: effectivePassive, ctx })) continue;
    handler({ Game, unit, passive: effectivePassive, ctx });
  }
}

export function applyOnSpawnEffects(Game, unit, onSpawn = {}){
  if (!Game || !unit || !onSpawn) return;
  ensureStatusContainer(unit);

  const effects = [];
  if (Array.isArray(onSpawn.effects)) effects.push(...onSpawn.effects);

  if (Number.isFinite(onSpawn.teamHealOnEntry) && onSpawn.teamHealOnEntry > 0){
    effects.push({ type: 'teamHeal', amount: onSpawn.teamHealOnEntry, mode: 'targetMax' });
  }
  const casterHeal = onSpawn.teamHealPercentMaxHPOfCaster ?? onSpawn.teamHealPercentCasterMaxHP;
  if (Number.isFinite(casterHeal) && casterHeal > 0){
    effects.push({ type: 'teamHeal', amount: casterHeal, mode: 'casterMax' });
  }

  if (Array.isArray(onSpawn.statuses)){
    for (const st of onSpawn.statuses){
      if (!st || typeof st !== 'object') continue;
      effects.push({ type: 'status', status: st });
    }
  }
  if (Array.isArray(onSpawn.addStatuses)){
    for (const st of onSpawn.addStatuses){
      if (!st || typeof st !== 'object') continue;
      effects.push({ type: 'status', status: st });
    }
  }
  if (onSpawn.status && typeof onSpawn.status === 'object'){
    effects.push({ type: 'status', status: onSpawn.status });
  }

  if (onSpawn.stats && typeof onSpawn.stats === 'object'){
    effects.push({ type: 'stats', stats: onSpawn.stats, mode: onSpawn.statsMode || onSpawn.mode, purgeable: onSpawn.purgeable });
  }
  if (onSpawn.flatStats && typeof onSpawn.flatStats === 'object'){
    effects.push({ type: 'stats', stats: onSpawn.flatStats, mode: 'flat', purgeable: onSpawn.purgeable, id: 'onSpawn_flat' });
  }

  let statsChanged = false;
  for (const effect of effects){
    if (!effect) continue;
    const type = normalizeKey(effect.type || effect.kind || effect.effect);
    if (type === 'teamheal'){
      const amount = effect.amount ?? effect.value ?? effect.percent ?? 0;
      if (!Number.isFinite(amount) || amount <= 0) continue;
      const mode = effect.mode === 'casterMax' ? 'casterMax' : 'targetMax';
      healTeam(Game, unit, amount, { mode });
      continue;
    }
    if (type === 'status' || type === 'addstatus'){
      if (effect.status && typeof effect.status === 'object'){
        Statuses.add(unit, effect.status);
      }
      continue;
    }
    if (type === 'stats' || type === 'stat' || type === 'buff'){
      const stats = effect.stats || effect.values;
      if (!stats || typeof stats !== 'object') continue;
      const applied = applyStatMap(unit, { id: effect.id || 'onSpawn' }, stats, {
        mode: effect.mode === 'flat' ? 'flat' : (effect.statMode === 'flat' ? 'flat' : 'percent'),
        stack: effect.stack !== false,
        stacks: effect.stacks,
        purgeable: effect.purgeable !== false,
        maxStacks: effect.maxStacks,
        idPrefix: effect.id || 'onSpawn'
      });
      statsChanged = applied || statsChanged;
      continue;
    }
  }

  if (statsChanged){
    if (typeof unit._recalcStats === 'function'){
      unit._recalcStats();
    } else {
      recomputeFromStatuses(unit);
    }
  } else if (typeof unit._recalcStats === 'function'){
    unit._recalcStats();
  } else {
    recomputeFromStatuses(unit);
  }
}

export function prepareUnitForPassives(unit){
  if (!unit) return;
  ensureStatusContainer(unit);
  const captured = captureBaseStats(unit);
  if (!unit.baseStats || typeof unit.baseStats !== 'object'){
    unit.baseStats = { ...captured };
  } else {
    for (const [key, value] of Object.entries(captured)){
      if (!Number.isFinite(unit.baseStats[key])){
        unit.baseStats[key] = value;
      }
    }
  }
  unit._recalcStats = () => recomputeFromStatuses(unit);
}

export { recomputeFromStatuses as recomputeUnitStats, stacksOf };
