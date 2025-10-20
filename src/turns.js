// v0.7.4
import { slotToCell, slotIndex } from './engine.js';
import { Statuses } from './statuses.js';
import { doBasicWithFollowups } from './combat.js';
import { CFG } from './config.js';
import { makeInstanceStats, initialRageFor } from './meta.js';
import { vfxAddSpawn, vfxAddBloodPulse } from './vfx.js';
import { getUnitArt } from './art.js';
import { emitPassiveEvent, applyOnSpawnEffects, prepareUnitForPassives } from './passives.js';
import { emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END, TURN_REGEN } from './events.js';
import { safeNow } from './utils/time.js';
import { initializeFury, startFuryTurn, spendFury, resolveUltCost, setFury, clearFreshSummon } from './utils/fury.js';
import { nextTurnInterleaved } from './turns/interleaved.js';

// local helper
const tokensAlive = (Game) => Game.tokens.filter(t => t.alive);

function applyTurnRegen(Game, unit){
  if (!unit || !unit.alive) return { hpDelta: 0, aeDelta: 0 };

  const clampStat = (value, max) => {
    if (!Number.isFinite(max)){
      return Math.max(0, value);
    }
    const upper = Math.max(0, max);
    return Math.max(0, Math.min(upper, value));
  };

  let hpDelta = 0;
  if (Number.isFinite(unit.hp) || Number.isFinite(unit.hpMax) || Number.isFinite(unit.hpRegen)){
    const currentHp = Number.isFinite(unit.hp) ? unit.hp : 0;
    const regenHp = Number.isFinite(unit.hpRegen) ? unit.hpRegen : 0;
    const afterHp = clampStat(currentHp + regenHp, unit.hpMax);
    hpDelta = afterHp - currentHp;
    unit.hp = afterHp;
  }

  let aeDelta = 0;
  if (Number.isFinite(unit.ae) || Number.isFinite(unit.aeMax) || Number.isFinite(unit.aeRegen)){
    const currentAe = Number.isFinite(unit.ae) ? unit.ae : 0;
    const regenAe = Number.isFinite(unit.aeRegen) ? unit.aeRegen : 0;
    const afterAe = clampStat(currentAe + regenAe, unit.aeMax);
    aeDelta = afterAe - currentAe;
    unit.ae = afterAe;
  }

  if (hpDelta !== 0 || aeDelta !== 0){
    emitGameEvent(TURN_REGEN, { game: Game, unit, hpDelta, aeDelta });
    if (hpDelta > 0){
      try {
        vfxAddBloodPulse(Game, unit, { color: '#7ef7c1', alpha: 0.65, maxScale: 2.4 });
      } catch (_) {}
    }
  }

  return { hpDelta, aeDelta };
}

// --- Active/Spawn helpers (từ main.js) ---
const keyOf = (side, slot) => `${side}:${slot}`;

export function getActiveAt(Game, side, slot){
  const { cx, cy } = slotToCell(side, slot);
  return Game.tokens.find(t => t.side===side && t.cx===cx && t.cy===cy && t.alive);
}

export function getTurnOrderIndex(Game, side, slot){
  const turn = Game?.turn;
  if (!turn) return -1;
  const key = keyOf(side, slot);
  if (turn.orderIndex instanceof Map && turn.orderIndex.has(key)){
    const v = turn.orderIndex.get(key);
    return typeof v === 'number' ? v : -1;
  }
  const order = Array.isArray(turn.order) ? turn.order : [];
  const idx = order.findIndex(entry => entry && entry.side === side && entry.slot === slot);
  if (turn.orderIndex instanceof Map && !turn.orderIndex.has(key) && idx >= 0){
    turn.orderIndex.set(key, idx);
  }
  return idx;
}

export function predictSpawnCycle(Game, side, slot){
  const turn = Game?.turn;
  if (!turn) return 0;
  const order = Array.isArray(turn.order) ? turn.order : [];
  const orderLen = order.length;
  const currentCycle = turn.cycle ?? 0;
  if (!orderLen) return currentCycle + 1;
  const idx = getTurnOrderIndex(Game, side, slot);
  if (idx < 0) return currentCycle + 1;
  const cursorRaw = Number.isFinite(turn.cursor) ? turn.cursor : 0;
  const cursor = Math.max(0, Math.min(orderLen - 1, cursorRaw));
  return idx >= cursor ? currentCycle : currentCycle + 1;
}

export function spawnQueuedIfDue(Game, entry, { allocIid, performUlt } = {}){
  if (!entry) return { actor: null, spawned: false };
  const side = entry.side;
  const slot = entry.slot;
  const active = getActiveAt(Game, side, slot);
  const m = Game.queued?.[side];
  const p = m && m.get(slot);
  if (!p){
    return { actor: active || null, spawned: false };
  }
  if ((p.spawnCycle ?? 0) > (Game?.turn?.cycle ?? 0)){
    return { actor: active || null, spawned: false };
  }

  m.delete(slot);

  const meta = Game.meta && typeof Game.meta.get === 'function' ? Game.meta.get(p.unitId) : null;
  const source = p.source || null;
  const fromDeck = source === 'deck';
  const kit = meta?.kit;
  const initialFury = initialRageFor(p.unitId, { isLeader:false, revive: !!p.revive, reviveSpec: p.revived });
  const obj = {
    id: p.unitId, name: p.name, color: p.color || '#a9f58c',
    cx: p.cx, cy: p.cy, side: p.side, alive: true
  };
  Object.assign(obj, makeInstanceStats(p.unitId));
  obj.statuses = [];
  obj.baseStats = {
    atk: obj.atk,
    res: obj.res,
    wil: obj.wil
  };
  obj.iid = typeof allocIid === 'function' ? allocIid() : obj.iid;
  obj.art = getUnitArt(p.unitId);
  obj.skinKey = obj.art?.skinKey;
  obj.color = obj.color || obj.art?.palette?.primary || '#a9f58c';
  initializeFury(obj, p.unitId, initialFury, CFG);
  if (fromDeck){
    setFury(obj, obj.furyMax);
  }
  prepareUnitForPassives(obj);
  Game.tokens.push(obj);
  applyOnSpawnEffects(Game, obj, kit?.onSpawn);
  try { vfxAddSpawn(Game, p.cx, p.cy, p.side); } catch(_){}
   const actor = getActiveAt(Game, side, slot);
  const isLeader = actor?.id === 'leaderA' || actor?.id === 'leaderB';
  const canAutoUlt = fromDeck && !isLeader && actor && actor.alive && typeof performUlt === 'function';
  if (canAutoUlt && !Statuses.blocks(actor, 'ult')){
    let ultOk = false;
    try {
      performUlt(actor);
      ultOk = true;
    } catch (err){
      console.error('[spawnQueuedIfDue.performUlt]', err);
    }
    if (ultOk){
      clearFreshSummon(actor);
    }
  }
  return { actor: actor || null, spawned: true };
}

// giảm TTL minion sau khi phe đó hoàn tất lượt của mình
export function tickMinionTTL(Game, side){
  const toRemove = [];
  for (const t of Game.tokens){
    if (!t.alive) continue;
    if (t.side !== side) continue;
    if (!t.isMinion) continue;
    if (!Number.isFinite(t.ttlTurns)) continue;
    t.ttlTurns -= 1;
    if (t.ttlTurns <= 0) toRemove.push(t);
  }
  for (const t of toRemove){
    t.alive = false;
    const idx = Game.tokens.indexOf(t);
    if (idx >= 0) Game.tokens.splice(idx, 1);
  }
}

// hành động 1 unit (ưu tiên ult nếu đủ nộ & không bị chặn)
export function doActionOrSkip(Game, unit, { performUlt, turnContext } = {}){
  const ensureBusyReset = () => {
    if (!Game || !Game.turn) return;
    const now = safeNow();
    if (!Number.isFinite(Game.turn.busyUntil) || Game.turn.busyUntil < now) {
      Game.turn.busyUntil = now;
    }
  };
  const slot = turnContext?.slot ?? (unit ? slotIndex(unit.side, unit.cx, unit.cy) : null);
  const side = turnContext?.side ?? unit?.side ?? null;
  const orderIndex = typeof turnContext?.orderIndex === 'number' ? turnContext.orderIndex : null;
  const cycle = typeof turnContext?.cycle === 'number' ? turnContext.cycle : (Game?.turn?.cycle ?? null);
  const orderLength = typeof turnContext?.orderLength === 'number'
    ? turnContext.orderLength
    : (Array.isArray(Game?.turn?.order) ? Game.turn.order.length : null);
  const baseDetail = {
    game: Game,
    unit: unit || null,
    side,
    slot,
    phase: side,
    cycle,
    orderIndex,
    orderLength,
    action: null,
    skipped: false,
    reason: null
  };
  const finishAction = (extra)=>{
    emitGameEvent(ACTION_END, { ...baseDetail, ...extra });
  };
  if (!unit || !unit.alive) {
    emitGameEvent(ACTION_START, baseDetail);
    ensureBusyReset();
    finishAction({ skipped: true, reason: 'missingUnit' });
    return;
  }
  const meta = Game.meta.get(unit.id);
  emitPassiveEvent(Game, unit, 'onTurnStart', {});

 const turnStamp = `${side ?? ''}:${slot ?? ''}:${cycle ?? 0}`;
  startFuryTurn(unit, { turnStamp, startAmount: CFG?.fury?.turn?.startGain, grantStart: true });
  applyTurnRegen(Game, unit);
  Statuses.onTurnStart(unit, {});
  emitGameEvent(ACTION_START, baseDetail);

  if (!Statuses.canAct(unit)) {
    Statuses.onTurnEnd(unit, {});
    ensureBusyReset();
    finishAction({ skipped: true, reason: 'status' });
    return;
  }

  const ultCost = resolveUltCost(unit, CFG);
  if (meta && (unit.fury|0) >= ultCost && !Statuses.blocks(unit,'ult')){
    try {
      performUlt(unit);
      ultOk = true;
    } catch(e){
      console.error('[performUlt]', e);
      setFury(unit, 0);
    }
    if (ultOk) {
      spendFury(unit, ultCost, CFG);
      emitPassiveEvent(Game, unit, 'onUltCast', {});
    }
    Statuses.onTurnEnd(unit, {});
    ensureBusyReset();
    finishAction({ action: 'ult', ultOk });
    return;
  }

  const cap = (meta && typeof meta.followupCap === 'number') ? (meta.followupCap|0) : (CFG.FOLLOWUP_CAP_DEFAULT|0);
  doBasicWithFollowups(Game, unit, cap);
  emitPassiveEvent(Game, unit, 'onActionEnd', {});
  Statuses.onTurnEnd(unit, {});
  ensureBusyReset();
  finishAction({ action: 'basic' });
}

// Bước con trỏ lượt (sparse-cursor) đúng đặc tả
// hooks = { performUlt, processActionChain, allocIid, doActionOrSkip }
export function stepTurn(Game, hooks){
  const turn = Game?.turn;
  if (!turn) return;

  if (turn.mode === 'interleaved_by_position'){
    const selection = nextTurnInterleaved(Game);
    if (!selection) return;

    const entry = { side: selection.side, slot: selection.pos };
    const { actor, spawned } = spawnQueuedIfDue(Game, entry, hooks);
    let active = null;
    if (actor && actor.alive){
      active = actor;
    } else if (selection.unit && selection.unit.alive){
      active = selection.unit;
    } else {
      active = getActiveAt(Game, entry.side, entry.slot);
    }

    if (spawned && actor && actor.alive){
      return;
    }

    if (!active || !active.alive){
      return;
    }

    const cycle = Number.isFinite(Game?.turn?.cycle) ? Game.turn.cycle : 0;
    const turnContext = {
      side: entry.side,
      slot: entry.slot,
      orderIndex: -1,
      orderLength: null,
      cycle
    };

    const turnDetail = {
      game: Game,
      side: entry.side,
      slot: entry.slot,
      unit: active,
      cycle,
      phase: entry.side,
      orderIndex: -1,
      orderLength: null,
      spawned: !!spawned,
      processedChain: null
    };

    emitGameEvent(TURN_START, turnDetail);

    try {
      hooks.doActionOrSkip?.(Game, active, { performUlt: hooks.performUlt, turnContext });
      const chainHooks = { ...hooks, getTurnOrderIndex };
      const processed = hooks.processActionChain?.(Game, entry.side, entry.slot, chainHooks);
      turnDetail.processedChain = processed ?? null;
    } finally {
      emitGameEvent(TURN_END, turnDetail);
    }

    tickMinionTTL(Game, entry.side);
    return;
  }

  const order = Array.isArray(turn?.order) ? turn.order : [];
  if (!order.length) return;

  const orderLength = order.length;
  let cursor = Math.max(0, Math.min(orderLength - 1, Number.isFinite(turn?.cursor) ? turn.cursor : 0));
  let cycle = Number.isFinite(turn?.cycle) ? turn.cycle : 0;

  const advanceCursor = () => {
    const nextCursor = (cursor + 1) % orderLength;
    Game.turn.cursor = nextCursor;
    if (nextCursor === 0){
      cycle += 1;
    }
    Game.turn.cycle = cycle;
    cursor = nextCursor;
  };

  for (let stepCount = 0; stepCount < orderLength; stepCount += 1){
    const entry = order[cursor];
    if (!entry){
      advanceCursor();
      continue;
    }

  const turnContext = {
      side: entry.side,
      slot: entry.slot,
      orderIndex: cursor,
      orderLength,
      cycle
    };

  const { actor, spawned } = spawnQueuedIfDue(Game, entry, hooks);
    if (spawned && actor && actor.alive){
      advanceCursor();
      return;
    }

    const active = actor && actor.alive ? actor : getActiveAt(Game, entry.side, entry.slot);
    const hasActive = !!(active && active.alive);

    if (!hasActive){
      advanceCursor();
      continue;
    }

    const turnDetail = {
      game: Game,
      side: entry.side,
      slot: entry.slot,
      unit: active,
      cycle,
      phase: entry.side,
      orderIndex: cursor,
      orderLength,
      spawned: !!spawned,
      processedChain: null
    };
    emitGameEvent(TURN_START, turnDetail);

    try {
      hooks.doActionOrSkip?.(Game, active, { performUlt: hooks.performUlt, turnContext });
      const chainHooks = { ...hooks, getTurnOrderIndex };
      const processed = hooks.processActionChain?.(Game, entry.side, entry.slot, chainHooks);
      turnDetail.processedChain = processed ?? null;
    } finally {
      emitGameEvent(TURN_END, turnDetail);
    }

    tickMinionTTL(Game, entry.side);

    advanceCursor();
    return;
  }
}