// v0.7.7 interleaved helpers
import { slotIndex } from '../engine.ts';
import { Statuses } from '../statuses.ts';

import type { SessionState } from '@shared-types/combat';
import type { QueuedSummonRequest, Side, UnitToken } from '@shared-types/units';
import type { InterleavedState, InterleavedTurnState, TurnSideKey } from '@shared-types/turn-order';

const SIDE_TO_LOWER: Record<TurnSideKey, Side> = { ALLY: 'ally', ENEMY: 'enemy' };
const LOWER_TO_UPPER: Record<Side, TurnSideKey> = { ally: 'ALLY', enemy: 'ENEMY' };
const DEFAULT_LAST_POS: Record<TurnSideKey, number> = { ALLY: 0, ENEMY: 0 };
const DEFAULT_WRAP_COUNT: Record<TurnSideKey, number> = { ALLY: 0, ENEMY: 0 };
const SLOT_CAP = 9;

function normalizeSide(side: Side | TurnSideKey | string): TurnSideKey {
  if (side === 'ENEMY') return 'ENEMY';
  if (side === 'ALLY') return 'ALLY';
  return LOWER_TO_UPPER[side as Side] || 'ALLY';
}

function resolveSlotCount(turn: InterleavedTurnState | null | undefined): number {
  const raw = Number.isFinite(turn?.slotCount) ? turn?.slotCount ?? null : null;
  if (Number.isFinite(raw) && (raw ?? 0) > 0){
    return Math.max(1, Math.min(SLOT_CAP, Math.floor(raw ?? SLOT_CAP)));
  }
  return SLOT_CAP;
}

function ensureTurnState(turn: InterleavedTurnState): void {
  if (!turn.lastPos || typeof turn.lastPos !== 'object'){
    turn.lastPos = { ...DEFAULT_LAST_POS };
  } else {
    turn.lastPos.ALLY = Number.isFinite(turn.lastPos.ALLY) ? turn.lastPos.ALLY : 0;
    turn.lastPos.ENEMY = Number.isFinite(turn.lastPos.ENEMY) ? turn.lastPos.ENEMY : 0;
  }
  if (!turn.wrapCount || typeof turn.wrapCount !== 'object'){
    turn.wrapCount = { ...DEFAULT_WRAP_COUNT };
  } else {
    turn.wrapCount.ALLY = Number.isFinite(turn.wrapCount.ALLY) ? turn.wrapCount.ALLY : 0;
    turn.wrapCount.ENEMY = Number.isFinite(turn.wrapCount.ENEMY) ? turn.wrapCount.ENEMY : 0;
  }
  if (!Number.isFinite(turn.turnCount)){
    turn.turnCount = 0;
  }
}

function buildSlotMap(tokens: ReadonlyArray<UnitToken> | null | undefined, sideLower: Side): Map<number, UnitToken> {
  const map = new Map<number, UnitToken>();
  if (!Array.isArray(tokens)) return map;
  for (const unit of tokens){
    if (!unit || !unit.alive) continue;
    if (unit.side !== sideLower) continue;
    const slot = slotIndex(sideLower, unit.cx, unit.cy);
    if (!Number.isFinite(slot)) continue;
    if (!map.has(slot)){
      map.set(slot, unit);
    }
  }
  return map;
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

export function findNextOccupiedPos(
  state: SessionState,
  side: Side | TurnSideKey,
  startPos = 0
): InterleavedState | null {
  const turn = (state.turn as InterleavedTurnState | null) ?? null;
  const sideKey = normalizeSide(side);
  const sideLower = SIDE_TO_LOWER[sideKey];
  if (!sideLower) return null;

  const slotCount = resolveSlotCount(turn);
  const start = Number.isFinite(startPos) ? Math.max(0, Math.min(slotCount, Math.floor(startPos))) : 0;
  const unitsBySlot = buildSlotMap(state.tokens, sideLower);
  const cycle = Number.isFinite(turn?.cycle) ? turn!.cycle : 0;

  for (let offset = 1; offset <= slotCount; offset += 1){
    const pos = ((start + offset - 1) % slotCount) + 1;
    const wrapped = makeWrappedFlag(start, pos);
    const unit = unitsBySlot.get(pos) ?? null;
    const queued = isQueueDue(state, sideLower, pos, cycle);
    if (unit && unit.alive && Statuses.canAct(unit)){
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

  const pickSide = (sideKey: TurnSideKey): InterleavedState | null => {
    const last = Number.isFinite(turn.lastPos?.[sideKey]) ? turn.lastPos[sideKey] : 0;
    const found = findNextOccupiedPos(state, sideKey, last);
    if (!found) return null;
    if (!found.spawnOnly){
      turn.lastPos[sideKey] = found.pos;
      if (found.wrapped){
        turn.wrapCount[sideKey] = (turn.wrapCount[sideKey] ?? 0) + 1;
      }
    }
    return found;
  };

  const primarySide = normalizeSide(turn.nextSide);
  const fallbackSide: TurnSideKey = primarySide === 'ALLY' ? 'ENEMY' : 'ALLY';

  let selection = pickSide(primarySide);
  if (!selection){
    selection = pickSide(fallbackSide);
    if (!selection){
      turn.nextSide = fallbackSide;
      return null;
    }
  }

  if (selection.spawnOnly){
    return selection;
  }

  turn.nextSide = selection.sideKey === 'ALLY' ? 'ENEMY' : 'ALLY';
  turn.turnCount += 1;
  const allyWrap = turn.wrapCount.ALLY ?? 0;
  const enemyWrap = turn.wrapCount.ENEMY ?? 0;
  const maxWrap = Math.max(allyWrap, enemyWrap);
  if (!Number.isFinite(turn.cycle) || turn.cycle < maxWrap){
    turn.cycle = maxWrap;
  }

  return selection;
}