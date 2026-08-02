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
  if (!turn.actedNatural || typeof turn.actedNatural !== 'object') {
    turn.actedNatural = { ALLY: [], ENEMY: [] };
  }
  turn.actedNatural.ALLY = Array.isArray(turn.actedNatural.ALLY) ? turn.actedNatural.ALLY : [];
  turn.actedNatural.ENEMY = Array.isArray(turn.actedNatural.ENEMY) ? turn.actedNatural.ENEMY : [];
}

const anonymousCombatInstances = new WeakMap<UnitToken, string>();
let anonymousCombatInstanceSerial = 0;

/**
 * Runtime tokens are required to carry an iid.  The object-local fallback is
 * deliberately not based on the unit definition id: it only protects old
 * saves/test fixtures while they are being normalized by the runtime.
 */
function naturalIdentity(unit: UnitToken): string {
  if (Number.isFinite(unit.iid)) return `iid:${unit.iid}`;
  let identity = anonymousCombatInstances.get(unit);
  if (!identity) {
    anonymousCombatInstanceSerial += 1;
    identity = `legacy-instance:${anonymousCombatInstanceSerial}`;
    anonymousCombatInstances.set(unit, identity);
  }
  return identity;
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
  const slotMaps = buildSlotMaps(state.tokens);
  const acted = new Set(turn.actedNatural?.[sideKey] ?? []);
  let picked: InterleavedState | null = null;

  // Finish the unvisited tail first. This is what makes a summon behind the
  // cursor wait, while a summon ahead of it can still join this side pass.
  for (let pos = startPos + 1; pos <= slotCount; pos += 1) {
    const unit = slotMaps[sideKey].get(pos) ?? null;
    if (unit?.alive && !acted.has(naturalIdentity(unit))) {
      picked = { mode: 'interleaved_by_position', side: sideLower, pos, unit,
        unitId: unit.id ?? null, queued: false, wrapped: false, sideKey, spawnOnly: false };
      break;
    }
    if (!unit && isQueueDue(state, sideLower, pos, turn.cycle)) {
      picked = { mode: 'interleaved_by_position', side: sideLower, pos, unit: null,
        unitId: null, queued: true, wrapped: false, sideKey, spawnOnly: true };
      break;
    }
  }

  if (!picked) {
    // A side pass ends only after its tail is exhausted. Moving an actor to a
    // later slot cannot grant it another natural action in that pass.
    turn.actedNatural![sideKey] = [];
    for (let pos = 1; pos <= slotCount; pos += 1) {
      const unit = slotMaps[sideKey].get(pos) ?? null;
      if (unit?.alive) {
        picked = { mode: 'interleaved_by_position', side: sideLower, pos, unit,
          unitId: unit.id ?? null, queued: false, wrapped: startPos > 0, sideKey, spawnOnly: false };
        break;
      }
      if (isQueueDue(state, sideLower, pos, turn.cycle + 1)) {
        picked = { mode: 'interleaved_by_position', side: sideLower, pos, unit: null,
          unitId: null, queued: true, wrapped: startPos > 0, sideKey, spawnOnly: true };
        break;
      }
    }
  }
  if (!picked) {
    // An empty side must not stall a surviving army. Only retry when the
    // opposite side actually has a live token or due queue, avoiding recursion
    // when the battlefield is empty.
    const otherSide = flipSide(sideKey);
    const otherLower = SIDE_TO_LOWER[otherSide];
    const otherHasCandidate = slotMaps[otherSide].size > 0
      || Array.from({ length: slotCount }, (_, index) => index + 1)
        .some(pos => isQueueDue(state, otherLower, pos, turn.cycle));
    if (!otherHasCandidate) return null;
    turn.nextSide = otherSide;
    return nextTurnInterleaved(state, turn);
  }

  turn.lastPos[sideKey] = picked.pos;
  if (picked.unit) turn.actedNatural![sideKey].push(naturalIdentity(picked.unit));
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

/** Read-only forecast used by the SSI HUD and summon placement preview. */
export function predictNaturalActors(state: SessionState, count = 6): InterleavedState[] {
  const source = state.turn as InterleavedTurnState | null;
  if (!source || source.mode !== 'interleaved_by_position') return [];
  const turn: InterleavedTurnState = {
    ...source,
    lastPos: { ...source.lastPos },
    wrapCount: { ...source.wrapCount },
    actedNatural: {
      ALLY: [...(source.actedNatural?.ALLY ?? [])],
      ENEMY: [...(source.actedNatural?.ENEMY ?? [])],
    },
  };
  const forecastState = { ...state, turn } as SessionState;
  const result: InterleavedState[] = [];
  for (let index = 0; index < Math.max(0, Math.floor(count)); index += 1) {
    const selection = nextTurnInterleaved(forecastState, turn);
    if (!selection) break;
    result.push(selection);
  }
  return result;
}