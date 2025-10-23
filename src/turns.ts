// v0.7.4
import { slotToCell, slotIndex } from './engine.ts';
import { Statuses } from './statuses.ts';

import { doBasicWithFollowups } from './combat.ts';
import { CFG } from './config.ts';
import { makeInstanceStats, initialRageFor } from './meta.ts';
import { vfxAddSpawn, vfxAddBloodPulse } from './vfx.js';
import { getUnitArt } from './art.js';
import { emitPassiveEvent, applyOnSpawnEffects, prepareUnitForPassives } from './passives.ts';
import { emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END, TURN_REGEN } from './events.ts';
import { safeNow } from './utils/time.js';
import { initializeFury, startFuryTurn, spendFury, resolveUltCost, setFury, clearFreshSummon } from './utils/fury.js';
import { nextTurnInterleaved } from './turns/interleaved.ts';

import type { ActionChainProcessedResult, SessionState } from '@types/combat';
import type { QueuedSummonRequest, Side, UnitToken } from '@types/units';
import type { InterleavedState, InterleavedTurnState, QueuedSummonEntry, SequentialTurnState, TurnContext, TurnHooks } from '@types/turn-order';

interface SpawnResult {
  actor: UnitToken | null;
  spawned: boolean;
}

type TurnOrderSide = Side | 'ALLY' | 'ENEMY';

const tokensAlive = (Game: SessionState): UnitToken[] =>
  Game.tokens.filter((t): t is UnitToken => t.alive);

function applyTurnRegen(
  Game: SessionState,
  unit: UnitToken | null | undefined
): { hpDelta: number; aeDelta: number } {
  if (!unit || !unit.alive) return { hpDelta: 0, aeDelta: 0 };

  const clampStat = (value: number, max: number | undefined): number => {
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
const keyOf = (side: string, slot: number): string => `${side}:${slot}`;

export function getActiveAt(
  Game: SessionState,
  side: TurnOrderSide,
  slot: number
): UnitToken | undefined {
  const { cx, cy } = slotToCell(side, slot);
  return Game.tokens.find(t => t.side === side && t.cx === cx && t.cy === cy && t.alive);
}

/**
 * @param {SessionState} Game
 * @param {string} side
 * @param {number} slot
 * @returns {number}
 */
export function getTurnOrderIndex(Game: SessionState, side: TurnOrderSide, slot: number): number {
  const turn = Game.turn;
  if (!turn) return -1;
  if (!('order' in turn)) return -1; // behavior-preserving
  const sequential = turn as SequentialTurnState;
  const key = keyOf(side, slot);
  if (sequential.orderIndex instanceof Map && sequential.orderIndex.has(key)){
    const v = sequential.orderIndex.get(key);
    return typeof v === 'number' ? v : -1;
  }
  const order = Array.isArray(sequential.order) ? sequential.order : [];
  const idx = order.findIndex(entry => entry && entry.side === side && entry.slot === slot);
  if (sequential.orderIndex instanceof Map && !sequential.orderIndex.has(key) && idx >= 0){
    sequential.orderIndex.set(key, idx);
  }
  return idx;
}

export function predictSpawnCycle(Game: SessionState, side: TurnOrderSide, slot: number): number {
  const turn = Game.turn;
  if (!turn) return 0;
  if (!('order' in turn)){
    const cycle = Math.max(0, Number.isFinite(turn.cycle) ? turn.cycle : 0);
    return turn.mode === 'interleaved_by_position' ? cycle : cycle + 1;
  }
  const sequential = turn as SequentialTurnState;
  const order = Array.isArray(sequential.order) ? sequential.order : [];
  const orderLen = order.length;
   const currentCycle = Math.max(0, Number.isFinite(sequential.cycle) ? sequential.cycle : 0);
  if (!orderLen){
    return currentCycle + 1;
  }
  const idx = getTurnOrderIndex(Game, side, slot);
  if (idx < 0) return currentCycle + 1;
  const cursorRaw = Number.isFinite(sequential.cursor) ? sequential.cursor : 0;
  const cursor = Math.max(0, Math.min(orderLen - 1, cursorRaw));
  return idx >= cursor ? currentCycle : currentCycle + 1;
}

export function spawnQueuedIfDue(
  Game: SessionState,
  entry: QueuedSummonEntry | { side: TurnOrderSide; slot: number } | null | undefined,
  { allocIid, performUlt }: Pick<TurnHooks, 'allocIid' | 'performUlt'> = {}
): SpawnResult {
  if (!entry) return { actor: null, spawned: false };
  const side = entry.side;
  const slot = entry.slot;
  const active = getActiveAt(Game, side, slot);
  const queueMap = Game.queued?.[side as Side] as Map<number, QueuedSummonRequest> | undefined;
  const p = queueMap?.get(slot);
  if (!p){
    return { actor: active || null, spawned: false };
  }
  if ((p.spawnCycle ?? 0) > (Game?.turn?.cycle ?? 0)){
    return { actor: active || null, spawned: false };
  }

  queueMap?.delete(slot);

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
  try {
    vfxAddSpawn(Game, p.cx, p.cy, p.side);
  } catch (_) {}
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
/**
 * @param {SessionState} Game
 * @param {string} side
 * @returns {void}
 */
export function tickMinionTTL(Game: SessionState, side: Side): void {
  const toRemove: UnitToken[] = [];
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
export function doActionOrSkip(
  Game: SessionState,
  unit: UnitToken | null | undefined,
  { performUlt, turnContext }: { performUlt?: TurnHooks['performUlt']; turnContext?: TurnContext } = {}
): void {
  const ensureBusyReset = (): void => {
    if (!Game.turn) return;
    const now = safeNow();
    if (!Number.isFinite(Game.turn.busyUntil) || Game.turn.busyUntil < now) {
      Game.turn.busyUntil = now;
    }
  };

  const slot = turnContext?.slot ?? (unit ? slotIndex(unit.side, unit.cx, unit.cy) : null);
  const side: Side | null = turnContext?.side ?? unit?.side ?? null;
  const orderIndex = typeof turnContext?.orderIndex === 'number' ? turnContext.orderIndex : null;
  const cycle = typeof turnContext?.cycle === 'number' ? turnContext.cycle : Game.turn?.cycle ?? null;
  const orderLength = typeof turnContext?.orderLength === 'number'
    ? turnContext.orderLength
    : (Array.isArray(Game.turn?.order) ? Game.turn!.order.length : null);

  const baseDetail = {
    game: Game,
    unit: unit ?? null,
    side,
    slot,
    phase: side,
    cycle,
    orderIndex,
    orderLength,
    action: null as string | null,
    skipped: false,
    reason: null as string | null
  };

  const finishAction = (extra: Record<string, unknown>): void => {
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
  if (meta && (unit.fury ?? 0) >= ultCost && !Statuses.blocks(unit, 'ult')){
    let ultOk = false;
    try {
      performUlt!(unit);
      ultOk = true;
    } catch (e){
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

  const cap = typeof meta?.followupCap === 'number' ? (meta.followupCap | 0) : (CFG.FOLLOWUP_CAP_DEFAULT | 0);
  doBasicWithFollowups(Game, unit, cap);
  emitPassiveEvent(Game, unit, 'onActionEnd', {});
  Statuses.onTurnEnd(unit, {});
  ensureBusyReset();
  finishAction({ action: 'basic' });
}

// Bước con trỏ lượt (sparse-cursor) đúng đặc tả
// hooks = { performUlt, processActionChain, allocIid, doActionOrSkip }
export function stepTurn(Game: SessionState, hooks: TurnHooks): void {
  const turn = Game.turn;
  if (!turn) return;
  if (Game.battle?.over) return;

  if ((turn as InterleavedState | InterleavedTurnState).mode === 'interleaved_by_position'){
    const interleavedTurn = turn as InterleavedTurnState;
    let selection: InterleavedState | null = nextTurnInterleaved(Game, interleavedTurn);
    if (!selection) return;

    let spawnLoopGuard = 0;
    while (selection && selection.spawnOnly){
      spawnLoopGuard += 1;
      if (spawnLoopGuard > 12){
        return;
      }
      const spawnEntry: QueuedSummonEntry = { side: selection.side, slot: selection.pos };
      const spawnResult = spawnQueuedIfDue(Game, spawnEntry, hooks);
      if (!spawnResult.spawned){
        return;
      }
      selection = nextTurnInterleaved(Game, interleavedTurn);
      if (!selection) return;
    }
    if (!selection) return;

    const entry: QueuedSummonEntry = { side: selection.side, slot: selection.pos };
    const { actor, spawned } = spawnQueuedIfDue(Game, entry, hooks);
    let active: UnitToken | null = null;
    if (actor && actor.alive){
      active = actor;
    } else if (selection.unit && selection.unit.alive){
      active = selection.unit;
    } else {
      active = getActiveAt(Game, entry.side, entry.slot) ?? null; // behavior-preserving
    }

    if (spawned && actor && actor.alive){
      return;
    }

    if (!active || !active.alive){
      return;
    }

    const cycle = Number.isFinite(interleavedTurn.cycle) ? interleavedTurn.cycle : 0;
    const turnContext: TurnContext = {
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
      processedChain: null as ActionChainProcessedResult | null
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
    const ended = hooks.checkBattleEnd?.(Game, {
      trigger: 'interleaved',
      side: entry.side,
      slot: entry.slot,
      unit: active,
      cycle,
      timestamp: safeNow()
    });
    if (ended) return;
    return;
  }

  const sequentialTurn = turn as SequentialTurnState;
  const order = Array.isArray(sequentialTurn?.order) ? sequentialTurn.order : [];
  if (!order.length) return;

  const orderLength = order.length;
  let cursor = Math.max(0, Math.min(orderLength - 1, Number.isFinite(sequentialTurn.cursor) ? sequentialTurn.cursor : 0));
  let cycle = Number.isFinite(sequentialTurn.cycle) ? sequentialTurn.cycle : 0;

  const advanceCursor = (): void => {
    const nextCursor = (cursor + 1) % orderLength;
    sequentialTurn.cursor = nextCursor;
    if (nextCursor === 0){
      cycle += 1;
    }
    sequentialTurn.cycle = cycle;
    cursor = nextCursor;
  };

  for (let stepCount = 0; stepCount < orderLength; stepCount += 1){
    const entry = order[cursor];
    if (!entry){
      advanceCursor();
      continue;
    }

    const turnContext: TurnContext = {
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
      processedChain: null as ActionChainProcessedResult | null
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

    const ended = hooks.checkBattleEnd?.(Game, {
      trigger: 'sequential',
      side: entry.side,
      slot: entry.slot,
      unit: active,
      cycle,
      timestamp: safeNow()
    });
    if (ended) return;

    advanceCursor();
    return;
  }
}