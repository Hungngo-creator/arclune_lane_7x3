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
import type { DamageCounterBreakdown, DamageEventContext } from './events.ts';
import { mergeBusyUntil, safeNow, sessionNow } from './utils/time.ts';
import { initializeFury, startFuryTurn, spendFury, resolveUltCost, setFury, clearFreshSummon } from './utils/fury.ts';
import { nextTurnInterleaved, getSequentialOrderIndex, predictSpawnCycleByTurnOrder } from './turns/interleaved.ts';
import { resolveRuntimeUnitStats } from './modes/pve/collection-mapper.ts';
import { applyCultivationBonus } from './cultivation.ts';
import { evaluateGambitLogic } from './ai.ts';
import { nextRngValue } from './utils/rng.ts';
import { normalizeClassName, normalizeElementKey } from './utils/domain-normalization.ts';
import { isUniqueGlobalSummonBlocked } from './utils/unique-global.ts';
import {
  clearQueuedUyenUlt,
  hasQueuedUyenUlt,
  isAnyLeaderUltReady,
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
type ActiveUnitIndex = Map<string, UnitToken>;

const toActiveUnitKey = (side: Side, slot: number): string => `${side}:${slot}`;

const createActiveUnitIndex = (Game: SessionState): ActiveUnitIndex => {
  const index: ActiveUnitIndex = new Map();
  const tokens = Array.isArray(Game.tokens) ? Game.tokens : [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (!token || !token.alive) continue;
    if (token.side !== 'ally' && token.side !== 'enemy') continue;
    const slot = slotIndex(token.side, token.cx, token.cy);
    if (!Number.isFinite(slot)) continue;
    const key = toActiveUnitKey(token.side, slot);
    if (!index.has(key)) {
      index.set(key, token);
    }
  }
  return index;
};

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

const GAMBIT_SKILL_ACTIONS: GambitActionType[] = ['skill1', 'skill2', 'skill3'];
const GAMBIT_SKILL_ACTION_SET = new Set<GambitActionType>(GAMBIT_SKILL_ACTIONS);
const INTERLEAVED_ACTION_DELAY_MS = 2200;

const DEFAULT_MUTATION_DEBUFF_POOL: Array<'bleed' | 'stun' | 'poison'> = ['bleed', 'stun', 'poison'];
const PVE_CREEP_ID_PATTERN = /^creep_\d+$/i;
const MUTATION_DEBUFF_SET = new Set<'bleed' | 'stun' | 'poison'>(DEFAULT_MUTATION_DEBUFF_POOL);

const isPveCreepId = (unitId: unknown): boolean => (
  typeof unitId === 'string' && PVE_CREEP_ID_PATTERN.test(unitId)
);

const sanitizeMutationDebuffPool = (pool: unknown): Array<'bleed' | 'stun' | 'poison'> => {
  if (!Array.isArray(pool)) return [...DEFAULT_MUTATION_DEBUFF_POOL];
  const filtered: Array<'bleed' | 'stun' | 'poison'> = [];
  for (let i = 0; i < pool.length; i += 1) {
    const id = pool[i];
    if (id === 'bleed' || id === 'stun' || id === 'poison') {
      if (!filtered.includes(id)) {
        filtered.push(id);
      }
      continue;
    }
    if (typeof id === 'string' && MUTATION_DEBUFF_SET.has(id as 'bleed' | 'stun' | 'poison')) {
      if (!filtered.includes(id as 'bleed' | 'stun' | 'poison')) {
        filtered.push(id as 'bleed' | 'stun' | 'poison');
      }
    }
  }
  return filtered.length > 0 ? filtered : [...DEFAULT_MUTATION_DEBUFF_POOL];
};

const clampResourceAfterRegen = (value: number, max: number | undefined): number => {
  if (typeof max !== 'number' || !Number.isFinite(max)){
    return Math.max(0, value);
  }
  const upper = Math.max(0, max);
  return Math.max(0, Math.min(upper, value));
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

const readFirstNormalizedElement = (
  ...values: Array<unknown>
): string | null => {
  for (const value of values) {
    const normalized = normalizeElementKey(value);
    if (normalized) return normalized;
  }
  return null;
};

const resolveSpawnElement = (
  spawnEntry: Record<string, unknown>,
  meta: Record<string, unknown> | null,
): string => (
  readFirstNormalizedElement(
    spawnEntry.element,
    spawnEntry.base_element,
    meta?.base_element,
    meta?.element,
  ) ?? 'neutral'
);

function grantActionAether(Game: SessionState, unit: UnitToken | null | undefined, acted: boolean): number {
  if (!unit || !unit.alive || !acted) return 0;
  const className = normalizeClassName(Game.meta?.get(unit.id)?.class) ?? null;
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

  let hpDelta = 0;
  if (Number.isFinite(unit.hp) || Number.isFinite(unit.hpMax) || Number.isFinite(unit.hpRegen)){
    const currentHp = Number.isFinite(unit.hp) ? unit.hp : 0;
    let regenHp = Number.isFinite(unit.hpRegen) ? unit.hpRegen : 0;
    if (Array.isArray(unit.statuses)) {
      for (const status of unit.statuses) {
        if (!status || status.id !== 'field_hp_regen_up') continue;
        const amount = Number((status as Record<string, unknown>).amount ?? (status as Record<string, unknown>).power ?? 0);
        if (Number.isFinite(amount) && amount > 0) {
          regenHp += Math.max(0, regenHp * amount);
        }
      }
    }
    const afterHp = clampResourceAfterRegen(currentHp + regenHp, unit.hpMax);
    hpDelta = afterHp - currentHp;
    unit.hp = afterHp;
  }

  let aeDelta = 0;
  if (Number.isFinite(unit.ae) || Number.isFinite(unit.aeMax) || Number.isFinite(unit.aeRegen)){
    const currentAe = Number.isFinite(unit.ae) ? unit.ae : 0;
    const regenAe = Number.isFinite(unit.aeRegen) ? unit.aeRegen : 0;
    const afterAe = clampResourceAfterRegen(currentAe + regenAe, unit.aeMax);
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
export function getActiveAt(
  Game: SessionState,
  side: TurnOrderSide,
  slot: number,
  activeUnitIndex?: ActiveUnitIndex
): UnitToken | undefined {
  const normalizedSide = toLowerSide(side);
  if (activeUnitIndex) {
    return activeUnitIndex.get(toActiveUnitKey(normalizedSide, slot));
  }
  const { cx, cy } = slotToCell(normalizedSide, slot);
  const tokens = Array.isArray(Game.tokens) ? Game.tokens : [];
  for (let i = 0; i < tokens.length; i += 1){
    const token = tokens[i];
    if (!token || !token.alive) continue;
    if (token.side === normalizedSide && token.cx === cx && token.cy === cy){
      return token;
    }
  }
  return undefined;
}

/**
 * @param {SessionState} Game
 * @param {string} side
 * @param {number} slot
 * @returns {number}
 */
export function getTurnOrderIndex(Game: SessionState, side: TurnOrderSide, slot: number): number {
  const turn = Game.turn;
  if (!turn || !('order' in turn)) return -1;
  return getSequentialOrderIndex(Game, toLowerSide(side), slot);
}

export function predictSpawnCycle(Game: SessionState, side: TurnOrderSide, slot: number): number {
  return predictSpawnCycleByTurnOrder(Game, toLowerSide(side), slot);
}

export function spawnQueuedIfDue(
  Game: SessionState,
  entry: QueuedSummonEntry | { side: TurnOrderSide; slot: number } | null | undefined,
  hooks?: Pick<TurnHooks, 'allocIid' | 'performUlt'>,
  activeUnitIndex?: ActiveUnitIndex
): SpawnResult {
  const { allocIid, performUlt } = hooks ?? {};
  if (!entry) return { actor: null, spawned: false };
  const slot = entry.slot;
  const sideLower = toLowerSide(entry.side);
  const queueMap = sideLower === 'ally' ? Game.queued?.ally : Game.queued?.enemy;
  const resolveCurrentActor = (): SpawnResult => {
    const active = getActiveAt(Game, sideLower, slot, activeUnitIndex);
    return { actor: active || null, spawned: false };
  };
  const p = queueMap?.get(slot);
  if (!p) return resolveCurrentActor();
  if ((p.spawnCycle ?? 0) > (Game?.turn?.cycle ?? 0)){
    return resolveCurrentActor();
  }

  queueMap?.delete(slot);

  const queuedTagsRaw = (p as unknown as { tags?: unknown }).tags;
  const queuedTags = Array.isArray(queuedTagsRaw)
    ? queuedTagsRaw.filter((tag: unknown): tag is string => typeof tag === 'string')
    : null;
  if (isUniqueGlobalSummonBlocked(Game, { unitId: p.unitId, tags: queuedTags })) {
    return resolveCurrentActor();
  }

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
  const normalizedClass = normalizeClassName(p.class)
    ?? normalizeClassName(meta?.class)
    ?? undefined;
  const pRecord = p as unknown as Record<string, unknown>;
  const metaRecord = meta as Record<string, unknown> | null;
  const normalizedElement = resolveSpawnElement(pRecord, metaRecord);
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
    class: normalizedClass,
    element: normalizedElement,
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
  let allyLeader: UnitToken | undefined;
  for (let idx = 0; idx < Game.tokens.length; idx += 1) {
    const token = Game.tokens[idx];
    if (token?.alive && token.side === obj.side && isUyenLeader(token)) {
      allyLeader = token;
      break;
    }
  }
  grantUyenSummonRage(allyLeader, { revived: !!p.revive, isMinion: !!obj.isMinion });
  {
    const sessionVfx = asSessionWithVfx(Game, { requireGrid: true });
    if (sessionVfx){
      try {
        vfxAddSpawn(sessionVfx, p.cx, p.cy, p.side);
      } catch (_) {}
    }
  }
  const actor = getActiveAt(Game, sideLower, slot, activeUnitIndex);
  if (actor && activeUnitIndex) {
    activeUnitIndex.set(toActiveUnitKey(sideLower, slot), actor);
  }
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
  for (let idx = Game.tokens.length - 1; idx >= 0; idx -= 1){
    const token = Game.tokens[idx];
    if (!token?.alive || token.side !== side || !token.isMinion) continue;
    const ttl = token.ttlTurns;
    if (typeof ttl === 'number' && Number.isFinite(ttl)){
      token.ttlTurns = ttl - 1;
    }
    if ((token.ttlTurns ?? 0) > 0) continue;
    token.alive = false;
    Game.tokens.splice(idx, 1);
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

interface DamageContextCarrier extends UnitToken {
  _lastDamageContext?: DamageEventContext | null;
  _lastCounterBreakdown?: DamageCounterBreakdown | null;
  _lastDamageSummary?: string | null;
}

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

const resolveTurnAction = (
  Game: SessionState,
  hooks: TurnHooks,
  entry: { side: Side; slot: number },
  active: UnitToken,
  turnContext: TurnContext,
  turnDetail: {
    game: SessionState;
    side: Side;
    slot: number;
    unit: UnitToken;
    cycle: number;
    phase: Side;
    orderIndex: number;
    orderLength: number | null;
    spawned: boolean;
    processedChain: ActionChainProcessedResult | null;
  }
): TickMinionTtlOptions => {
  const actionHook = hooks.doActionOrSkip;
  let actionOutcome: StrictActionResolution | null = null;
  const hasActionHook = typeof actionHook === 'function';
  try {
    if (hasActionHook){
      const rawOutcome = actionHook(Game, active, { performUlt: hooks.performUlt, turnContext });
      actionOutcome = normalizeActionResolution(rawOutcome);
    }
    const chainHooks: TurnHooks & { getTurnOrderIndex: typeof getTurnOrderIndex } = {
      ...hooks,
      getTurnOrderIndex: hooks.getTurnOrderIndex ?? getTurnOrderIndex,
    };
    const processed = hooks.processActionChain?.(Game, entry.side, entry.slot, chainHooks);
    turnDetail.processedChain = processed ?? null;
  } finally {
    emitGameEvent(TURN_END, turnDetail);
  }

  grantActionAether(Game, active, !!actionOutcome?.acted);
  return consumedTurnFromOutcome(actionOutcome, hasActionHook);
};

const resolveTurnActor = (
  Game: SessionState,
  side: Side,
  slot: number,
  actor: UnitToken | null | undefined,
  fallback?: UnitToken | null | undefined,
  activeUnitIndex?: ActiveUnitIndex
): UnitToken | null => {
  if (actor?.alive) return actor;
  if (fallback?.alive) return fallback;
  return getActiveAt(Game, side, slot, activeUnitIndex) ?? null;
};

const runTurnAndCheckEnd = (
  Game: SessionState,
  hooks: TurnHooks,
  entry: { side: Side; slot: number },
  active: UnitToken,
  turnContext: TurnContext,
  turnDetail: {
    game: SessionState;
    side: Side;
    slot: number;
    unit: UnitToken;
    cycle: number;
    phase: Side;
    orderIndex: number;
    orderLength: number | null;
    spawned: boolean;
    processedChain: ActionChainProcessedResult | null;
  },
  trigger: 'interleaved' | 'sequential'
): boolean => {
  emitGameEvent(TURN_START, turnDetail);
  const consumption = resolveTurnAction(Game, hooks, entry, active, turnContext, turnDetail);
  tickMinionTTL(Game, entry.side, consumption);

  return hooks.checkBattleEnd?.(Game, {
    trigger,
    side: entry.side,
    slot: entry.slot,
    unit: active,
    cycle: turnContext.cycle,
    timestamp: safeNow()
  }) ?? false;
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

  const damageCarrier = unit as DamageContextCarrier | null | undefined;
  if (damageCarrier) {
    damageCarrier._lastDamageContext = null;
    damageCarrier._lastCounterBreakdown = null;
    damageCarrier._lastDamageSummary = null;
  }

  const finishAction = (extra: Record<string, unknown>): void => {
    const damageContext = damageCarrier?._lastDamageContext ?? null;
    const counterBreakdown = damageCarrier?._lastCounterBreakdown ?? null;
    const damageSummary = damageCarrier?._lastDamageSummary ?? null;
    emitGameEvent(ACTION_END, {
      ...baseDetail,
      ...extra,
      damageContext,
      counterBreakdown,
      damageSummary,
    });
    if (damageCarrier) {
      damageCarrier._lastDamageContext = null;
      damageCarrier._lastCounterBreakdown = null;
      damageCarrier._lastDamageSummary = null;
    }
  };

const completeTurn = ({
    consumedTurn,
    acted,
    reason,
    actionDetail,
    emitOnActionEnd = false,
  }: {
    consumedTurn: boolean;
    acted: boolean;
    reason: string | null;
    actionDetail: Record<string, unknown>;
    emitOnActionEnd?: boolean;
  }): ActionResolution => {
    if (emitOnActionEnd) {
      emitPassiveEvent(Game, unit, 'onActionEnd', { log: passiveLog });
    }
    Statuses.onTurnEnd(unit, {});
    ensureBusyReset();
    resolution.consumedTurn = consumedTurn;
    resolution.acted = acted;
    resolution.skipped = !acted;
    resolution.reason = acted ? null : reason;
    finishAction(actionDetail);
    return resolution;
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
  const passiveLog = getPassiveLog(Game);
  emitPassiveEvent(Game, unit, 'onTurnStart', { log: passiveLog });

  const turnStamp = `${side ?? ''}:${slot ?? ''}:${cycle ?? 0}`;
  startFuryTurn(unit, { turnStamp, startAmount: CFG?.fury?.turn?.startGain, grantStart: true });
  applyTurnRegen(Game, unit);
  Statuses.onTurnStart(unit, {});
  const bloodAvatarFieldOwners = Game.tokens.filter((token) =>
    token.alive
    && token.id === 'blood_avatar'
    && token.side !== unit.side
    && Statuses.has(token, 'blood_field_active')
  );
  if (bloodAvatarFieldOwners.length > 0) {
    const markStacks = Statuses.stacks(unit, 'huyet_an');
    const alreadyPunished = Statuses.has(unit, 'blood_field_silence_once');
    if (markStacks >= 3 && !alreadyPunished) {
      const owner = bloodAvatarFieldOwners[0];
      Statuses.add(unit, { id: 'silence', kind: 'debuff', tag: 'silence', dur: 1, tick: 'turn', sourceUnitId: owner.id });
      Statuses.add(unit, { id: 'blood_field_silence_once', kind: 'mark', tag: 'field', dur: 3, tick: 'turn', sourceUnitId: owner.id });
    }
  }
  emitGameEvent(ACTION_START, baseDetail);

  if (!Statuses.canAct(unit)) {
    return completeTurn({
      consumedTurn: false,
      acted: false,
      reason: 'status',
      actionDetail: { skipped: true, reason: 'status' }
    });
  }

  const ultCost = resolveUltCost(unit, CFG);
  const runUlt = (): boolean => {
    const ready = isUyenLeader(unit)
      ? isAnyLeaderUltReady(unit)
      : (unit.fury ?? 0) >= ultCost;
    if (!ready || Statuses.blocks(unit, 'ult')) return false;
    let ultOk = false;
    try {
      performUlt!(unit);
      ultOk = true;
    } catch (e){
      console.error('[performUlt]', e);
    }
    if (ultOk) {
      if (!isUyenLeader(unit)) {
        spendFury(unit, ultCost, CFG);
      }
      emitPassiveEvent(Game, unit, 'onUltCast', { log: passiveLog });
    }
    const actionDetail: Record<string, unknown> = { action: 'ult', ultOk };
    if (ultOk){
      completeTurn({
        consumedTurn: true,
        acted: true,
        reason: null,
        actionDetail
      });
    } else {
      actionDetail.skipped = true;
      actionDetail.reason = 'ultFailed';
      completeTurn({
        consumedTurn: false,
        acted: false,
        reason: 'ultFailed',
        actionDetail
      });
    }
    return true;
  };

  let gambitIndex = 0;
  while (gambitIndex < 5) {
    const decision = evaluateGambitLogic(Game, unit, { startIndex: gambitIndex });
    if (decision.slotIndex < 0 || !decision.action) break;
    const nextGambitIndex = decision.slotIndex + 1;
    if (nextGambitIndex <= gambitIndex) {
      break;
    }
    gambitIndex = nextGambitIndex;

    if (decision.action === 'basic') {
      break;
    }

    if (!GAMBIT_SKILL_ACTION_SET.has(decision.action)) {
      continue;
    }

    try {
      const cast = performActiveSkill(Game, unit, decision.action);
      if (!cast.ok) {
        continue;
      }
      return completeTurn({
        consumedTurn: true,
        acted: true,
        reason: null,
        emitOnActionEnd: true,
        actionDetail: { action: decision.action, skillOk: cast.ok, skillTargets: cast.targetCount, skillTags: cast.appliedTags }
      });
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
    return completeTurn({
      consumedTurn: false,
      acted: false,
      reason: 'systemError',
      actionDetail: { skipped: true, reason: 'systemError' }
    });
  }
  return completeTurn({
    consumedTurn: true,
    acted: true,
    reason: null,
    emitOnActionEnd: true,
    actionDetail: { action: 'basic' }
  });
}

// Bước con trỏ lượt (sparse-cursor) đúng đặc tả
// hooks = { performUlt, processActionChain, allocIid, doActionOrSkip }
export function stepTurn(Game: SessionState, hooks: TurnHooks): void {
  const turn = Game.turn;
  if (!turn) return;
  if (Game.battle?.over) return;

  const interleavedTurn = asInterleavedTurn(turn);
  const activeUnitIndex = createActiveUnitIndex(Game);
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
      const spawnResult = spawnQueuedIfDue(Game, spawnEntry, hooks, activeUnitIndex);
      if (!spawnResult.spawned){
        return;
      }
      selection = nextTurnInterleaved(Game, interleavedTurn);
      if (!selection) return;
    }
    if (!selection) return;

    const entry: QueuedSummonEntry = { side: selection.side, slot: selection.pos };
    const { actor, spawned } = spawnQueuedIfDue(Game, entry, hooks, activeUnitIndex);
    const active = resolveTurnActor(Game, entry.side, entry.slot, actor, selection.unit, activeUnitIndex);

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

  const ended = runTurnAndCheckEnd(
      Game,
      hooks,
      entry,
      active,
      turnContext,
      turnDetail,
      'interleaved'
    );
    if (!ended && Game.turn){
      const actionDelayRaw = Number(CFG?.ANIMATION?.interleavedActionDelayMs);
      const actionDelayMs = Number.isFinite(actionDelayRaw) && actionDelayRaw > 0
        ? actionDelayRaw
        : INTERLEAVED_ACTION_DELAY_MS;
      const now = sessionNow();
      Game.turn.busyUntil = mergeBusyUntil(Game.turn.busyUntil, now, actionDelayMs);
    }
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

    const { actor, spawned } = spawnQueuedIfDue(Game, entry, hooks, activeUnitIndex);

    const active = resolveTurnActor(Game, entry.side, entry.slot, actor, undefined, activeUnitIndex);
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
    const ended = runTurnAndCheckEnd(
      Game,
      hooks,
      entry,
      active,
      turnContext,
      turnDetail,
      'sequential'
    );
    if (ended) return;

    advanceCursor();
    return;
  }
}