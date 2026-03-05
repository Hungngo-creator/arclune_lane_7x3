//home (termux)/arclune_lane_7x3/src/turn.ts

import { globalAetherPool, resolveActionAetherRegen } from './aether.ts';
import { slotToCell, slotIndex } from './engine.ts';
import { Statuses } from './statuses.ts';

import { doBasicWithFollowups } from './combat.ts';
import { performActiveSkill } from './combat/perform-active-skill.ts';
import { CFG } from './config.ts';
import { initialRageFor } from './meta.ts';
import { vfxAddSpawn, vfxAddBloodPulse, asSessionWithVfx } from './vfx.ts';
import { getUnitArt } from './art.ts';
import { emitPassiveEvent, applyOnSpawnEffects, getPassiveLog, prepareUnitForPassives } from './passives.ts';
import { emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END, TURN_REGEN } from './events.ts';
import { safeNow, sessionNow } from './utils/time.ts';
import { initializeFury, startFuryTurn, spendFury, resolveUltCost, setFury, clearFreshSummon } from './utils/fury.ts';
import { nextTurnInterleaved } from './turns/interleaved.ts';
import { resolveRuntimeUnitStats } from './modes/pve/collection-mapper.ts';
import { applyCultivationBonus } from './cultivation.ts';
import { evaluateGambitLogic } from './ai.ts';
import { nextRngValue } from './utils/rng.ts';
import {
  clearQueuedUyenUlt,
  hasQueuedUyenUlt,
  isLeaderUltReady,
  isUyenLeader,
  grantUyenSummonRage,
} from './leader-uyen.ts';

import type { SessionState } from '@shared-types/combat';
import type { GambitActionType, RuntimeUnitProgress } from '@shared-types/pve';
import type { ActionChainProcessedResult, Side, UnitToken } from '@shared-types/units';
import type { ActionResolution, InterleavedState, InterleavedTurnState, QueuedSummonEntry, SequentialTurnState, TurnContext, TurnHooks } from '@shared-types/turn-order';

interface SpawnResult {
  actor: UnitToken | null;
  spawned: boolean;
}

type TurnOrderSide = Side | 'ALLY' | 'ENEMY';

const toLowerSide = (side: TurnOrderSide): Side => {
  if (side === 'ALLY') return 'ally';
  if (side === 'ENEMY') return 'enemy';
  return side;
};

const asSequentialTurn = (
  turn: SequentialTurnState | InterleavedTurnState | null | undefined
): SequentialTurnState | null => {
  if (!turn) return null;
  const candidate = turn as SequentialTurnState;
  return Array.isArray(candidate.order) ? candidate : null;
};

const asInterleavedTurn = (
  turn: SequentialTurnState | InterleavedTurnState | null | undefined
): InterleavedTurnState | null => {
  if (!turn) return null;
  const candidate = turn as InterleavedTurnState;
  return candidate.mode === 'interleaved_by_position' ? candidate : null;
};

const tokensAlive = (Game: SessionState): UnitToken[] =>
  Game.tokens.filter((t): t is UnitToken => t.alive);

const GAMBIT_SKILL_ACTIONS: GambitActionType[] = ['skill1', 'skill2', 'skill3'];
const DEFAULT_MUTATION_DEBUFF_POOL: Array<'bleed' | 'stun' | 'poison'> = ['bleed', 'stun', 'poison'];

const isPveCreepId = (unitId: unknown): boolean => (
  typeof unitId === 'string' && /^creep_\d+$/i.test(unitId)
);

const sanitizeMutationDebuffPool = (pool: unknown): Array<'bleed' | 'stun' | 'poison'> => {
  if (!Array.isArray(pool)) return [...DEFAULT_MUTATION_DEBUFF_POOL];
  const filtered = pool.filter((id): id is 'bleed' | 'stun' | 'poison' => id === 'bleed' || id === 'stun' || id === 'poison');
  return filtered.length > 0 ? filtered : [...DEFAULT_MUTATION_DEBUFF_POOL];
};

const applyMutationStatBonus = (unit: UnitToken, bonusPctRaw: unknown): void => {
  const bonusPct = Number.isFinite(bonusPctRaw) ? Number(bonusPctRaw) : 0.1;
  const keys: Array<'hpMax' | 'atk' | 'wil' | 'res' | 'arm'> = ['hpMax', 'atk', 'wil', 'res', 'arm'];
  for (const key of keys) {
    const base = unit[key];
    if (!Number.isFinite(base)) continue;
    const scaled = Number(base) * (1 + bonusPct);
    unit[key] = key === 'arm'
      ? Math.max(0, Math.min(1, Math.round(scaled * 1000) / 1000))
      : Math.max(1, Math.round(scaled));
  }
  if (Number.isFinite(unit.hp) && Number.isFinite(unit.hpMax)) {
    unit.hp = Math.max(1, Math.min(Number(unit.hpMax), Math.round(Number(unit.hp) * (1 + bonusPct))));
  }
};

function grantActionAether(Game: SessionState, unit: UnitToken | null | undefined, acted: boolean): number {
  if (!unit || !unit.alive || !acted) return 0;
  const className = Game.meta?.get(unit.id)?.class ?? null;
  const amount = resolveActionAetherRegen(className);
  if (amount > 0){
    globalAetherPool.gain(unit.side, amount);
  }
  return amount;
}

function applyTurnRegen(
  Game: SessionState,
  unit: UnitToken | null | undefined
): { hpDelta: number; aeDelta: number } {
  if (!unit || !unit.alive) return { hpDelta: 0, aeDelta: 0 };

  const clampStat = (value: number, max: number | undefined): number => {
    if (typeof max !== 'number' || !Number.isFinite(max)){
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
      const sessionVfx = asSessionWithVfx(Game, { requireGrid: true });
      if (sessionVfx){
        try {
          vfxAddBloodPulse(sessionVfx, unit, { color: '#7ef7c1', alpha: 0.65, maxScale: 2.4 });
        } catch (_) {}
      }
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
  const sequential = asSequentialTurn(turn);
  if (!sequential){
    const cycle = Math.max(0, Number.isFinite(turn.cycle) ? turn.cycle : 0);
    return turn.mode === 'interleaved_by_position' ? cycle : cycle + 1;
  }
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
  hooks?: Pick<TurnHooks, 'allocIid' | 'performUlt'>
): SpawnResult {
  const { allocIid, performUlt } = hooks ?? {};
  if (!entry) return { actor: null, spawned: false };
  const slot = entry.slot;
  const sideLower = toLowerSide(entry.side);
  const active = getActiveAt(Game, sideLower, slot);
  const queueMap = sideLower === 'ally' ? Game.queued?.ally : Game.queued?.enemy;
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
  const unitProgressMap = Game.runtime?.unitProgressById as ReadonlyMap<string, RuntimeUnitProgress> | undefined;
  const progress = unitProgressMap?.get(p.unitId);
  const baseStatsResolved = resolveRuntimeUnitStats(p.unitId, unitProgressMap);
  const stats = applyCultivationBonus({
    ...baseStatsResolved,
    id: p.unitId,
    hasCultivationData: unitProgressMap?.has(p.unitId) ?? false,
    realm: progress?.realm,
    subRealm: progress?.subRealm,
  });
  const { id: _statsId, ...resolvedStats } = stats;
  const baseStats = {
    atk: stats.atk ?? 0,
    res: stats.res ?? 0,
    wil: stats.wil ?? 0,
  };
  const obj: UnitToken = {
    id: p.unitId,
    name: p.name ?? undefined,
    color: p.color || '#a9f58c',
    cx: p.cx,
    cy: p.cy,
    side: p.side,
    alive: true,
    ...resolvedStats,
    statuses: [],
    baseStats,
  };

  if (sideLower === 'enemy' && fromDeck && isPveCreepId(p.unitId)) {
    const mutationRoll = nextRngValue(Game.rng);
    const mutated = mutationRoll < 0.3;
    const mutationBonusPct = Number.isFinite(p.mutationBonusPct) ? Number(p.mutationBonusPct) : 0.1;
    const mutationDebuffPool = sanitizeMutationDebuffPool(p.mutationDebuffPool);
    obj.mutated = mutated;
    obj.mutationBonusPct = mutationBonusPct;
    obj.mutationDebuffPool = mutationDebuffPool;
    if (mutated) {
      applyMutationStatBonus(obj, mutationBonusPct);
    }
  }

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
  applyOnSpawnEffects(Game, obj, kit?.onSpawn ?? undefined);
  const allyLeader = Game.tokens.find((token) => token.alive && token.side === obj.side && isUyenLeader(token));
  grantUyenSummonRage(allyLeader, { revived: !!p.revive, isMinion: !!obj.isMinion });
  {
    const sessionVfx = asSessionWithVfx(Game, { requireGrid: true });
    if (sessionVfx){
      try {
        vfxAddSpawn(sessionVfx, p.cx, p.cy, p.side);
      } catch (_) {}
    }
  }
  const actor = getActiveAt(Game, sideLower, slot);
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

interface TickMinionTtlOptions {
  consumed?: boolean;
  skipped?: boolean;
  reason?: string | null;
}

// giảm TTL minion sau khi phe đó hoàn tất lượt của mình
/**
 * @param {SessionState} Game
 * @param {string} side
 * @param {TickMinionTtlOptions} options
 * @returns {void}
 */
export function tickMinionTTL(Game: SessionState, side: Side, options: TickMinionTtlOptions = {}): void {
  const consumed = options?.consumed ?? true;
  if (!consumed) return;
  const reason = typeof options?.reason === 'string' ? options.reason : null;
  const skipped = options?.skipped ?? false;
  if (skipped && reason === 'systemError') return;
  const toRemove: UnitToken[] = [];
  for (const t of Game.tokens){
    if (!t.alive) continue;
    if (t.side !== side) continue;
    if (!t.isMinion) continue;
    const ttl = t.ttlTurns;
    if (typeof ttl !== 'number' || !Number.isFinite(ttl)) continue;
    const nextTtl = ttl - 1;
    t.ttlTurns = nextTtl;
    if (nextTtl <= 0) toRemove.push(t);
  }
  for (const t of toRemove){
    t.alive = false;
    const idx = Game.tokens.indexOf(t);
    if (idx >= 0) Game.tokens.splice(idx, 1);
  }
}

interface StrictActionResolution {
  consumedTurn: boolean;
  acted: boolean;
  skipped: boolean;
  reason: string | null;
}

const normalizeActionResolution = (outcome: unknown): StrictActionResolution | null => {
  if (outcome == null) return null;
  if (typeof outcome === 'boolean'){
    const consumed = outcome;
    return {
      consumedTurn: consumed,
      acted: consumed,
      skipped: !consumed,
      reason: null
    };
  }
  if (typeof outcome !== 'object') return null;
  const raw = outcome as ActionResolution & { action?: string | null };
  const consumed = typeof raw.consumedTurn === 'boolean' ? raw.consumedTurn : true;
  const acted = typeof raw.acted === 'boolean'
    ? raw.acted
    : (raw.action === 'basic' || raw.action === 'ult');
  const skipped = typeof raw.skipped === 'boolean' ? raw.skipped : !acted;
  const reason = typeof raw.reason === 'string' ? raw.reason : null;
  return {
    consumedTurn: consumed,
    acted,
    skipped,
    reason
  };
};

const consumedTurnFromOutcome = (outcome: StrictActionResolution | null, hadHook: boolean): TickMinionTtlOptions => {
  if (!hadHook){
    return { consumed: false, skipped: false, reason: null };
  }
  if (!outcome){
    return { consumed: true, skipped: false, reason: null };
  }
  const { consumedTurn, skipped, reason } = outcome;
  if (!consumedTurn){
    return { consumed: false, skipped, reason };
  }
  if (skipped && reason === 'systemError'){
    return { consumed: false, skipped, reason };
  }
  return { consumed: true, skipped, reason };
};

// hành động 1 unit (ưu tiên ult nếu đủ nộ & không bị chặn)
export function doActionOrSkip(
  Game: SessionState,
  unit: UnitToken | null | undefined,
  { performUlt, turnContext }: { performUlt?: TurnHooks['performUlt']; turnContext?: TurnContext } = {}
): ActionResolution {
  const ensureBusyReset = (): void => {
    if (!Game.turn) return;
    const now = sessionNow();
    if (!Number.isFinite(Game.turn.busyUntil) || Game.turn.busyUntil < now) {
      Game.turn.busyUntil = now;
    }
  };

  const slot = turnContext?.slot ?? (unit ? slotIndex(unit.side, unit.cx, unit.cy) : null);
  const side: Side | null = turnContext?.side ?? unit?.side ?? null;
  const orderIndex = typeof turnContext?.orderIndex === 'number' ? turnContext.orderIndex : null;
  const cycle = typeof turnContext?.cycle === 'number' ? turnContext.cycle : Game.turn?.cycle ?? null;
  const sequentialSnapshot = asSequentialTurn(Game.turn);
  const orderLength = typeof turnContext?.orderLength === 'number'
    ? turnContext.orderLength
    : (sequentialSnapshot ? sequentialSnapshot.order.length : null);
  
  const resolution: ActionResolution = {
    consumedTurn: true,
    acted: false,
    skipped: false,
    reason: null
  };

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
    resolution.consumedTurn = false;
    resolution.acted = false;
    resolution.skipped = true;
    resolution.reason = 'missingUnit';
    finishAction({ skipped: true, reason: 'missingUnit' });
    return resolution;
  }

  const meta = Game.meta.get(unit.id);
  emitPassiveEvent(Game, unit, 'onTurnStart', { log: getPassiveLog(Game) });

  const turnStamp = `${side ?? ''}:${slot ?? ''}:${cycle ?? 0}`;
  startFuryTurn(unit, { turnStamp, startAmount: CFG?.fury?.turn?.startGain, grantStart: true });
  applyTurnRegen(Game, unit);
  Statuses.onTurnStart(unit, {});
  emitGameEvent(ACTION_START, baseDetail);

  if (!Statuses.canAct(unit)) {
    Statuses.onTurnEnd(unit, {});
    ensureBusyReset();
    resolution.consumedTurn = false;
    resolution.acted = false;
    resolution.skipped = true;
    resolution.reason = 'status';
    finishAction({ skipped: true, reason: 'status' });
    return resolution;
  }

  const ultCost = resolveUltCost(unit, CFG);
  const runUlt = (): boolean => {
    const ready = isUyenLeader(unit)
      ? isLeaderUltReady(unit)
      : (unit.fury ?? 0) >= ultCost;
    if (!ready || Statuses.blocks(unit, 'ult')) return false;
    let ultOk = false;
    try {
      performUlt!(unit);
      ultOk = true;
    } catch (e){
      console.error('[performUlt]', e);
    }
    if (ultOk && !isUyenLeader(unit)) {
      spendFury(unit, ultCost, CFG);
      emitPassiveEvent(Game, unit, 'onUltCast', { log: getPassiveLog(Game) });
    }
    if (ultOk && isUyenLeader(unit)) {
      emitPassiveEvent(Game, unit, 'onUltCast', { log: getPassiveLog(Game) });
    }
    Statuses.onTurnEnd(unit, {});
    ensureBusyReset();
    const actionDetail: Record<string, unknown> = { action: 'ult', ultOk };
    if (ultOk){
      resolution.acted = true;
      resolution.skipped = false;
      resolution.reason = null;
    } else {
      resolution.acted = false;
      resolution.skipped = true;
      resolution.reason = 'ultFailed';
      resolution.consumedTurn = false;
      actionDetail.skipped = true;
      actionDetail.reason = 'ultFailed';
    }
    finishAction(actionDetail);
    return true;
  };

  let gambitIndex = 0;
  while (gambitIndex < 5) {
    const decision = evaluateGambitLogic(Game, unit, { startIndex: gambitIndex });
    if (decision.slotIndex < 0 || !decision.action) break;
    gambitIndex = decision.slotIndex + 1;

    if (decision.action === 'ult') {
      if (runUlt()) {
        return resolution;
      }
      continue;
    }

    if (decision.action === 'basic') {
      break;
    }

    if (!GAMBIT_SKILL_ACTIONS.includes(decision.action)) {
      continue;
    }

    try {
      const cast = performActiveSkill(Game, unit, decision.action);
      if (!cast.ok) {
        continue;
      }
      emitPassiveEvent(Game, unit, 'onActionEnd', { log: getPassiveLog(Game) });
      Statuses.onTurnEnd(unit, {});
      ensureBusyReset();
      resolution.acted = true;
      resolution.skipped = false;
      resolution.reason = null;
      finishAction({ action: decision.action, skillOk: cast.ok, skillTargets: cast.targetCount, skillTags: cast.appliedTags });
      return resolution;
    } catch (err) {
      console.error('[doActionOrSkip.skill]', err);
      continue;
    }
  }

  const queuedLeaderUlt = isUyenLeader(unit) && hasQueuedUyenUlt(unit);
  const autoUltReady = isUyenLeader(unit)
    ? queuedLeaderUlt
    : (unit.fury ?? 0) >= ultCost;
  if (autoUltReady && !Statuses.blocks(unit, 'ult')){
    runUlt();
    if (queuedLeaderUlt) clearQueuedUyenUlt(unit);
    return resolution;
  }

  const cap = typeof meta?.followupCap === 'number' ? (meta.followupCap | 0) : (CFG.FOLLOWUP_CAP_DEFAULT | 0);
  try {
    doBasicWithFollowups(Game, unit, cap);
  } catch (err) {
    console.error('[doActionOrSkip.basic]', err);
    Statuses.onTurnEnd(unit, {});
    ensureBusyReset();
    resolution.consumedTurn = false;
    resolution.acted = false;
    resolution.skipped = true;
    resolution.reason = 'systemError';
    finishAction({ skipped: true, reason: 'systemError' });
    return resolution;
  }
  emitPassiveEvent(Game, unit, 'onActionEnd', { log: getPassiveLog(Game) });
  Statuses.onTurnEnd(unit, {});
  ensureBusyReset();
  resolution.acted = true;
  resolution.skipped = false;
  resolution.reason = null;
  finishAction({ action: 'basic' });
  return resolution;
}

// Bước con trỏ lượt (sparse-cursor) đúng đặc tả
// hooks = { performUlt, processActionChain, allocIid, doActionOrSkip }
export function stepTurn(Game: SessionState, hooks: TurnHooks): void {
  const turn = Game.turn;
  if (!turn) return;
  if (Game.battle?.over) return;

  const interleavedTurn = asInterleavedTurn(turn);
  if (interleavedTurn){
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

  const actionHook = hooks.doActionOrSkip;
    let actionOutcome: StrictActionResolution | null = null;
    try {
      if (typeof actionHook === 'function'){
        const rawOutcome = actionHook(Game, active, { performUlt: hooks.performUlt, turnContext });
        actionOutcome = normalizeActionResolution(rawOutcome);
      }
      const chainHooks = { ...hooks, getTurnOrderIndex };
      const processed = hooks.processActionChain?.(Game, entry.side, entry.slot, chainHooks);
      turnDetail.processedChain = processed ?? null;
    } finally {
      emitGameEvent(TURN_END, turnDetail);
    }

    const consumption = consumedTurnFromOutcome(actionOutcome, typeof actionHook === 'function');
    grantActionAether(Game, active, !!actionOutcome?.acted);
    tickMinionTTL(Game, entry.side, consumption);
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

  const sequentialTurn = asSequentialTurn(turn);
  if (!sequentialTurn) return;
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

  const actionHook = hooks.doActionOrSkip;
    let actionOutcome: StrictActionResolution | null = null;
    try {
      if (typeof actionHook === 'function'){
        const rawOutcome = actionHook(Game, active, { performUlt: hooks.performUlt, turnContext });
        actionOutcome = normalizeActionResolution(rawOutcome);
      }
      const chainHooks = { ...hooks, getTurnOrderIndex };
      const processed = hooks.processActionChain?.(Game, entry.side, entry.slot, chainHooks);
      turnDetail.processedChain = processed ?? null;
    } finally {
      emitGameEvent(TURN_END, turnDetail);
    }

    const consumption = consumedTurnFromOutcome(actionOutcome, typeof actionHook === 'function');
    grantActionAether(Game, active, !!actionOutcome?.acted);
    tickMinionTTL(Game, entry.side, consumption);

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