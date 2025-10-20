// v0.7.4
import { slotToCell, slotIndex } from './engine.js';
import { Statuses } from './statuses.js';
import { doBasicWithFollowups } from './combat.js';
import { CFG } from './config.js';
import { makeInstanceStats, initialRageFor } from './meta.js';
import { vfxAddSpawn } from './vfx.js';
import { getUnitArt } from './art.js';
import { emitPassiveEvent, applyOnSpawnEffects, prepareUnitForPassives } from './passives.js';
import { emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END } from './events.js';
import { safeNow } from './utils/time.js';

// local helper
const tokensAlive = (Game) => Game.tokens.filter(t => t.alive);

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

export function spawnQueuedIfDue(Game, entry, { allocIid } = {}){
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
  const kit = meta?.kit;
  const obj = {
    id: p.unitId, name: p.name, color: p.color || '#a9f58c',
    cx: p.cx, cy: p.cy, side: p.side, alive: true,
    rage: initialRageFor(p.unitId, { isLeader:false, revive: !!p.revive, reviveSpec: p.revived })
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
  prepareUnitForPassives(obj);
  Game.tokens.push(obj);
  applyOnSpawnEffects(Game, obj, kit?.onSpawn);
  try { vfxAddSpawn(Game, p.cx, p.cy, p.side); } catch(_){}
   const actor = getActiveAt(Game, side, slot);
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

  Statuses.onTurnStart(unit, {});
  emitGameEvent(ACTION_START, baseDetail);

  if (!Statuses.canAct(unit)) {
    Statuses.onTurnEnd(unit, {});
    ensureBusyReset();
    finishAction({ skipped: true, reason: 'status' });
    return;
  }

  if (meta && (unit.rage|0) >= 100 && !Statuses.blocks(unit,'ult')){
    let ultOk = false;
    try {
      performUlt(unit);
      ultOk = true;
    } catch(e){
      console.error('[performUlt]', e);
      unit.rage = 0;
    }
    if (ultOk) emitPassiveEvent(Game, unit, 'onUltCast', {});
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
  const order = Array.isArray(turn?.order) ? turn.order : [];
  if (!order.length) return;

  const cursor = Math.max(0, Math.min(order.length - 1, turn.cursor ?? 0));
  const entry = order[cursor];
  if (!entry){
    Game.turn.cursor = (cursor + 1) % order.length;
    if (Game.turn.cursor === 0) Game.turn.cycle = (Game.turn.cycle ?? 0) + 1;
    return;
  }

  const cycle = Game.turn.cycle ?? 0;
  const turnContext = {
    side: entry.side,
    slot: entry.slot,
    orderIndex: cursor,
    orderLength: order.length,
    cycle
  };

  const { actor, spawned } = spawnQueuedIfDue(Game, entry, hooks);
  const active = actor && actor.alive ? actor : getActiveAt(Game, entry.side, entry.slot);

  const turnDetail = {
    game: Game,
    side: entry.side,
    slot: entry.slot,
    unit: active || null,
    cycle,
    phase: entry.side,
    orderIndex: cursor,
    orderLength: order.length,
    spawned: !!spawned,
    processedChain: null
  };
  emitGameEvent(TURN_START, turnDetail);

  try {
    hooks.doActionOrSkip?.(Game, active || null, { performUlt: hooks.performUlt, turnContext });

    const chainHooks = { ...hooks, getTurnOrderIndex };
    const processed = hooks.processActionChain?.(Game, entry.side, entry.slot, chainHooks);
    turnDetail.processedChain = processed ?? null;
  } finally {
    emitGameEvent(TURN_END, turnDetail);
  }

  tickMinionTTL(Game, entry.side);

  const nextCursor = (cursor + 1) % order.length;
  Game.turn.cursor = nextCursor;
  if (nextCursor === 0){
    Game.turn.cycle = cycle + 1;
   }
}