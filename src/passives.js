// passives.js — passive event dispatch & helpers v0.7
import { Statuses, hookOnLethalDamage } from './statuses.js';
import { safeNow } from './utils/time.js';

const clamp01 = (x) => Math.max(0, Math.min(1, x));

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
  let st = Statuses.get(unit, id);
  if (!st){
    st = Statuses.add(unit, {
      id,
      kind: 'buff',
      tag: 'stat',
      attr,
      mode,
      amount,
      purgeable,
      stacks: 0
    });
  }
  st.attr = attr;
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

function recomputeFromStatuses(unit){
  if (!unit || !unit.baseStats) return;
  ensureStatusContainer(unit);
  const base = unit.baseStats;
  const percent = { atk:0, res:0, wil:0, arm:0 };
  const flat    = { atk:0, res:0, wil:0, arm:0 };
  for (const st of unit.statuses){
    if (!st || !st.attr || !st.mode) continue;
const stacks = st.stacks == null ? 1 : st.stacks;
    const amount = (st.amount ?? st.power ?? 0) * stacks;
    if (!Number.isFinite(amount)) continue;
    if (st.mode === 'percent'){
      percent[st.attr] = (percent[st.attr] || 0) + amount;
    } else if (st.mode === 'flat'){
      flat[st.attr] = (flat[st.attr] || 0) + amount;
    }
  }

  if (base.atk != null){
    const pct = 1 + (percent.atk || 0);
    const flatAdd = flat.atk || 0;
    unit.atk = Math.max(0, Math.round(base.atk * pct + flatAdd));
  }
 if (base.wil != null){
    const pct = 1 + (percent.wil || 0);
    const flatAdd = flat.wil || 0;
    unit.wil = Math.max(0, Math.round(base.wil * pct + flatAdd));
  }
  if (base.arm != null){
    const pct = 1 + (percent.arm || 0);
    const flatAdd = flat.arm || 0;
    const raw = base.arm * pct + flatAdd;
    unit.arm = clamp01(raw);
  }
  if (base.res != null){
    const pct = 1 + (percent.res || 0);
    const flatAdd = flat.res || 0;
    const raw = base.res * pct + flatAdd;
    unit.res = clamp01(raw);
  }
}

function healTeam(Game, unit, pct){
  if (!Game || !unit) return;
  if (!Number.isFinite(pct) || pct <= 0) return;
  const allies = (Game.tokens || []).filter(t => t.side === unit.side && t.alive);
  for (const ally of allies){
    if (!Number.isFinite(ally.hpMax)) continue;
    const heal = Math.max(0, Math.round((ally.hpMax || 0) * pct));
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
    const stackable = params.stack !== false;
    const st = ensureStatBuff(unit, passive.id, { attr:'atk', mode:'percent', amount, purgeable: params.purgeable !== false });
    const nextStacks = stackable ? (st.stacks || 0) + 1 : 1;
    applyStatStacks(st, nextStacks, { maxStacks: params.maxStacks });
    recomputeFromStatuses(unit);
  },

gainWILPercent({ unit, passive }){
    if (!unit) return;
    const params = passive?.params || {};
    const amount = params.amount ?? 0;
    const stackable = params.stack !== false;
    const st = ensureStatBuff(unit, passive.id, { attr:'wil', mode:'percent', amount, purgeable: params.purgeable !== false });
    const nextStacks = stackable ? (st.stacks || 0) + 1 : 1;
    applyStatStacks(st, nextStacks, { maxStacks: params.maxStacks });
    recomputeFromStatuses(unit);
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
    const st = ensureStatBuff(unit, passive.id, { attr:'res', mode:'percent', amount: params.amount ?? 0, purgeable: params.purgeable !== false });
    const stackable = params.stack !== false;
    const count = stackable ? (st.stacks || 0) + 1 : 1;
    applyStatStacks(st, count, { maxStacks: params.maxStacks });
    recomputeFromStatuses(unit);
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
  gainBonus: EFFECTS.gainBonus
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
    let handler = EFFECT_MAP[passive.effect];
    if (passive.effect === 'gainRES%' && passive?.params?.perTarget != null){
      handler = EFFECTS.resPerSleeping;
    }
    if (typeof handler !== 'function') continue;
    handler({ Game, unit, passive, ctx });
  }
}

export function applyOnSpawnEffects(Game, unit, onSpawn = {}){
  if (!Game || !unit || !onSpawn) return;
  ensureStatusContainer(unit);
  if (onSpawn.teamHealOnEntry){
    healTeam(Game, unit, onSpawn.teamHealOnEntry);
  }
  if (Array.isArray(onSpawn.statuses)){
    for (const st of onSpawn.statuses){
      if (!st || typeof st !== 'object') continue;
      Statuses.add(unit, st);
    }
  }
  if (typeof unit._recalcStats === 'function'){
    unit._recalcStats();
  } else {
    recomputeFromStatuses(unit);
  }
}

export function prepareUnitForPassives(unit){
  if (!unit) return;
  ensureStatusContainer(unit);
  unit._recalcStats = () => recomputeFromStatuses(unit);
}

export { recomputeFromStatuses as recomputeUnitStats, stacksOf };
