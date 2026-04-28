import { slotIndex } from '../engine.ts';
import type { SessionState } from '@shared-types/combat';
import type { Side, UnitToken } from '@shared-types/units';
import type { InterleavedState, InterleavedTurnState, TurnSideKey } from '@shared-types/turn-order';

const SIDE_TO_LOWER: Record<TurnSideKey, Side> = { ALLY: 'ally', ENEMY: 'enemy' };
const LOWER_TO_UPPER: Record<Side, TurnSideKey> = { ally: 'ALLY', enemy: 'ENEMY' };
const TURN_SIDES: ReadonlyArray<TurnSideKey> = ['ALLY', 'ENEMY'];
const createZeroBySide = (): Record<TurnSideKey, number> => ({ ALLY: 0, ENEMY: 0 });
const flipSide = (side: TurnSideKey): TurnSideKey => (side === 'ALLY' ? 'ENEMY' : 'ALLY');
const DEFAULT_LAST_POS: Readonly<Record<TurnSideKey, number>> = createZeroBySide();
const DEFAULT_WRAP_COUNT: Readonly<Record<TurnSideKey, number>> = createZeroBySide();
const SLOT_CAP = 9;
const clampInt = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, Math.floor(value)));
type SlotMapBySide = Record<TurnSideKey, Map<number, UnitToken>>;
const createEmptySlotMaps = (): SlotMapBySide => ({ ALLY: new Map<number, UnitToken>(), ENEMY: new Map<number, UnitToken>() });
const makeOrderKey = (side: Side, slot: number): string => `${side}:${slot}`;
type SequentialOrderIndexCache = {
  orderRef: Array<{ side?: string; slot?: number }>;
  size: number;
  indexByEntry: Map<string, number>;
};

type SequentialTurnWithCache = {
  order?: Array<{ side?: string; slot?: number }>;
  orderIndexCache?: SequentialOrderIndexCache;
};

function normalizeSide(side: Side | TurnSideKey | string): TurnSideKey {
  if (side === 'ENEMY') return 'ENEMY';
  if (side === 'ALLY') return 'ALLY';
  return LOWER_TO_UPPER[side as Side] || 'ALLY';
}

function resolveSlotCount(turn: InterleavedTurnState | null | undefined): number {
  const raw = Number.isFinite(turn?.slotCount) ? turn?.slotCount ?? null : null;
  if (Number.isFinite(raw) && (raw ?? 0) > 0){
    return clampInt(raw ?? SLOT_CAP, 1, SLOT_CAP);
  }
  return SLOT_CAP;
}

function sanitizeSideCounter(
  current: Record<TurnSideKey, number> | null | undefined,
  fallback: Readonly<Record<TurnSideKey, number>>,
): Record<TurnSideKey, number> {
  const normalized = { ...fallback };
  if (!current || typeof current !== 'object'){
    return normalized;
  }
  for (const sideKey of TURN_SIDES){
    const value = current[sideKey];
    normalized[sideKey] = Number.isFinite(value) ? value : 0;
  }
  return normalized;
}

function ensureTurnState(turn: InterleavedTurnState): void {
  turn.lastPos = sanitizeSideCounter(turn.lastPos, DEFAULT_LAST_POS);
  turn.wrapCount = sanitizeSideCounter(turn.wrapCount, DEFAULT_WRAP_COUNT);
  if (!Number.isFinite(turn.turnCount)){
    turn.turnCount = 0;
  }
}

function buildSlotMaps(tokens: ReadonlyArray<UnitToken> | null | undefined): SlotMapBySide {
  if (!Array.isArray(tokens)) {
    return createEmptySlotMaps();
  }
  const slotMaps = createEmptySlotMaps();
  const ally = slotMaps.ALLY;
  const enemy = slotMaps.ENEMY;
  for (const unit of tokens){
    if (!unit || !unit.alive) continue;
    if (unit.side !== 'ally' && unit.side !== 'enemy') continue;
    const sideKey = LOWER_TO_UPPER[unit.side];
    const map = sideKey === 'ALLY' ? ally : enemy;
    const slot = slotIndex(unit.side, unit.cx, unit.cy);
    if (!Number.isFinite(slot)) continue;
    if (!map.has(slot)) {
      map.set(slot, unit);
    }
  }
  return slotMaps;
}

function isQueueDue(state: SessionState, sideLower: Side, slot: number, cycle: number): boolean {
  const queued = sideLower === 'ally' ? state.queued?.ally : state.queued?.enemy;
  if (!queued) return false;
  const entry = queued.get(slot);
  if (!entry) return false;
  return (entry.spawnCycle ?? 0) <= cycle;
}

function makeWrappedFlag(start: number, pos: number): boolean {
  if (!Number.isFinite(start) || start <= 0) return false;
  return pos <= start;
}

export type SpawnCycleSide = Side | TurnSideKey;

const toLowerSpawnSide = (side: SpawnCycleSide): Side => (
  side === 'ALLY' ? 'ally' : side === 'ENEMY' ? 'enemy' : side
);

export function getSequentialOrderIndex(
  state: SessionState,
  side: SpawnCycleSide,
  slot: number,
): number {
  const turn = state.turn as SequentialTurnWithCache | null | undefined;
  if (!turn) return -1;
  const order = Array.isArray(turn?.order) ? turn.order : null;
  if (!order) return -1;

  const normalizedSide = toLowerSpawnSide(side);
  const normalizedSlot = clampInt(Number.isFinite(slot) ? slot : 0, 0, SLOT_CAP);
  const key = makeOrderKey(normalizedSide, normalizedSlot);

  const cache = turn.orderIndexCache;
  const needsRebuild = !cache
    || cache.orderRef !== order
    || cache.size !== order.length;

  if (needsRebuild) {
    const indexByEntry = new Map<string, number>();
    for (let index = 0; index < order.length; index += 1) {
      const entry = order[index];
      const entrySide = entry?.side;
      const entrySlot = entry?.slot;
      if ((entrySide !== 'ally' && entrySide !== 'enemy') || !Number.isFinite(entrySlot)) continue;
      indexByEntry.set(makeOrderKey(entrySide, Number(entrySlot)), index);
    }
    turn.orderIndexCache = { orderRef: order, size: order.length, indexByEntry };
  }

  const indexByEntry = turn.orderIndexCache?.indexByEntry;
  if (indexByEntry?.has(key)) {
    const value = indexByEntry.get(key);
    return typeof value === 'number' ? value : -1;
  }
  return -1;
}

export function predictSpawnCycleByTurnOrder(
  state: SessionState,
  side: SpawnCycleSide,
  slot: number,
): number {
  const turn = state.turn;
  if (!turn) return 0;
  const cycle = Math.max(0, Number.isFinite(turn.cycle) ? turn.cycle : 0);
  const maybeSequential = turn as { order?: Array<{ side?: string; slot?: number }>; cursor?: number };
  const order = Array.isArray(maybeSequential.order) ? maybeSequential.order : null;
  if (!order) {
    return turn.mode === 'interleaved_by_position' ? cycle : cycle + 1;
  }
  if (!order.length) return cycle + 1;

  const idx = getSequentialOrderIndex(state, side, slot);
  if (idx < 0) return cycle + 1;

  const cursorRaw = Number.isFinite(maybeSequential.cursor) ? Number(maybeSequential.cursor) : 0;
  const cursor = clampInt(cursorRaw, 0, order.length - 1);
  return idx >= cursor ? cycle : cycle + 1;
}

export function findNextOccupiedPos(
  state: SessionState,
  side: Side | TurnSideKey,
  startPos = 0,
  slotMaps?: SlotMapBySide,
): InterleavedState | null {
  const turn = (state.turn as InterleavedTurnState | null) ?? null;
  const sideKey = normalizeSide(side);
  const sideLower = SIDE_TO_LOWER[sideKey];

  const slotCount = resolveSlotCount(turn);
  const start = Number.isFinite(startPos) ? clampInt(startPos, 0, slotCount) : 0;
  const unitsBySlot = slotMaps?.[sideKey] ?? buildSlotMaps(state.tokens)[sideKey];
  const cycle = Number.isFinite(turn?.cycle) ? turn!.cycle : 0;

  for (let offset = 1; offset <= slotCount; offset += 1){
    const pos = ((start + offset - 1) % slotCount) + 1;
    const wrapped = makeWrappedFlag(start, pos);
    const unit = unitsBySlot.get(pos) ?? null;
    const queued = isQueueDue(state, sideLower, pos, cycle);
    if (unit && unit.alive){
      return {
        mode: 'interleaved_by_position',
        side: sideLower,
        pos,
        unit,
        unitId: unit.id ?? null,
        queued,
        wrapped,
        sideKey,
        spawnOnly: false
      };
    }
    if (queued){
      return {
        mode: 'interleaved_by_position',
        side: sideLower,
        pos,
        unit: null,
        unitId: null,
        queued: true,
        wrapped,
        sideKey,
        spawnOnly: true
      };
    }
  }

  return null;
}

export function nextTurnInterleaved(
  state: SessionState,
  turn: InterleavedTurnState | null = (state.turn as InterleavedTurnState | null)
): InterleavedState | null {
  if (!state || !turn) return null;

  ensureTurnState(turn);
  const slotCount = resolveSlotCount(turn);
  if (slotCount <= 0) return null;
  const sideKey = normalizeSide(turn.nextSide);
  const sideLower = SIDE_TO_LOWER[sideKey];
  const startPosRaw = Number.isFinite(turn.lastPos?.[sideKey]) ? turn.lastPos[sideKey] : 0;
  const startPos = clampInt(startPosRaw, 0, slotCount);
  const picked = findNextOccupiedPos(state, sideKey, startPos, buildSlotMaps(state.tokens));
  if (!picked) return null;

  turn.lastPos[sideKey] = picked.pos;
  turn.nextSide = flipSide(sideKey);

  if (picked.wrapped){
    turn.wrapCount[sideKey] = (turn.wrapCount[sideKey] ?? 0) + 1;
  }

  turn.turnCount += 1;
  const allyWrap = turn.wrapCount.ALLY ?? 0;
  const enemyWrap = turn.wrapCount.ENEMY ?? 0;
  const maxWrap = Math.max(allyWrap, enemyWrap);
  if (!Number.isFinite(turn.cycle) || turn.cycle < maxWrap){
    turn.cycle = maxWrap;
  }
  return picked;
}