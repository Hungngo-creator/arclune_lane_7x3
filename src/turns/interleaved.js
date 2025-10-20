// @ts-check
// v0.7.7 interleaved helpers
import { slotIndex } from '../engine.js';
import { Statuses } from '../statuses.js';

/**
 * @typedef {import('../../types/game-entities').SessionState} SessionState
 * @typedef {import('../../types/game-entities').UnitToken} UnitToken
 * @typedef {import('../../types/game-entities').QueuedSummonRequest} QueuedSummonRequest
 * @typedef {import('../../types/game-entities').InterleavedTurnState} InterleavedTurnState
 */

/** @type {{ ALLY: 'ally'; ENEMY: 'enemy' }} */
const SIDE_TO_LOWER = { ALLY: 'ally', ENEMY: 'enemy' };
/** @type {{ ally: 'ALLY'; enemy: 'ENEMY' }} */
const LOWER_TO_UPPER = { ally: 'ALLY', enemy: 'ENEMY' };
/** @type {{ ALLY: number; ENEMY: number }} */
const DEFAULT_LAST_POS = { ALLY: 0, ENEMY: 0 };
/** @type {{ ALLY: number; ENEMY: number }} */
const DEFAULT_WRAP_COUNT = { ALLY: 0, ENEMY: 0 };
const SLOT_CAP = 9;

/**
 * @param {string} side
 * @returns {'ALLY' | 'ENEMY'}
 */
function normalizeSide(side){
  if (side === 'ENEMY') return 'ENEMY';
  if (side === 'ALLY') return 'ALLY';
  return LOWER_TO_UPPER[side] || 'ALLY';
}

/**
 * @param {InterleavedTurnState | null | undefined} turn
 * @returns {number}
 */
function resolveSlotCount(turn){
  const raw = Number.isFinite(turn?.slotCount) ? turn.slotCount : null;
  if (Number.isFinite(raw) && raw > 0){
    return Math.max(1, Math.min(SLOT_CAP, Math.floor(raw)));
  }
  return SLOT_CAP;
}

/**
 * @param {InterleavedTurnState} turn
 * @returns {void}
 */
function ensureTurnState(turn){
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

/**
 * @param {UnitToken[] | null | undefined} tokens
 * @param {'ally' | 'enemy'} sideLower
 * @returns {Map<number, UnitToken>}
 */
function buildSlotMap(tokens, sideLower){
  /** @type {Map<number, UnitToken>} */
  const map = new Map();
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

/**
 * @param {SessionState | null | undefined} state
 * @param {'ally' | 'enemy'} sideLower
 * @param {number} slot
 * @returns {boolean}
 */
function isQueueDue(state, sideLower, slot){
  const queued = /** @type {Map<number, QueuedSummonRequest> | undefined} */ (state?.queued?.[sideLower]);
  if (!queued || typeof queued.get !== 'function') return false;
  const entry = queued.get(slot);
  if (!entry) return false;
  const cycle = Number.isFinite(state?.turn?.cycle) ? state.turn.cycle : 0;
  return (entry.spawnCycle ?? 0) <= cycle;
}

/**
 * @param {number} start
 * @param {number} pos
 * @returns {boolean}
 */
function makeWrappedFlag(start, pos){
  if (!Number.isFinite(start) || start <= 0) return false;
  return pos <= start;
}

/**
 * @param {SessionState} state
 * @param {string} side
 * @param {number} [startPos=0]
 * @returns {{ pos: number; unit: UnitToken | null; wrapped: boolean; queued: boolean } | null}
 */
export function findNextOccupiedPos(state, side, startPos = 0){
  const turn = state?.turn || {};
  const sideKey = normalizeSide(side);
  const sideLower = SIDE_TO_LOWER[sideKey];
  if (!sideLower) return null;

  const slotCount = resolveSlotCount(turn);
  const start = Number.isFinite(startPos) ? Math.max(0, Math.min(slotCount, Math.floor(startPos))) : 0;
  const unitsBySlot = buildSlotMap(state?.tokens, sideLower);

  for (let offset = 1; offset <= slotCount; offset += 1){
    const pos = ((start + offset - 1) % slotCount) + 1;
    const wrapped = makeWrappedFlag(start, pos);
    const unit = unitsBySlot.get(pos) || null;
    if (unit && unit.alive && Statuses.canAct(unit)){
      return { pos, unit, wrapped, queued: isQueueDue(state, sideLower, pos) };
    }
    if (isQueueDue(state, sideLower, pos)){
      return { pos, unit: null, wrapped, queued: true };
    }
  }

  return null;
}

/**
 * @param {SessionState} state
 * @returns {{ side: 'ally' | 'enemy'; pos: number; unit: UnitToken | null; unitId: string | null; queued: boolean; wrapped: boolean; sideKey: 'ALLY' | 'ENEMY'; spawnOnly: boolean } | null}
 */
export function nextTurnInterleaved(state){
  const turn = /** @type {InterleavedTurnState | null} */ (state?.turn ?? null);
  if (!state || !turn) return null;

  ensureTurnState(turn);
  const slotCount = resolveSlotCount(turn);
  if (slotCount <= 0) return null;

  const pickSide = (sideKey) => {
    const last = Number.isFinite(turn.lastPos?.[sideKey]) ? turn.lastPos[sideKey] : 0;
    const found = findNextOccupiedPos(state, sideKey, last);
    if (!found) return null;
    const sideLower = SIDE_TO_LOWER[sideKey];
    const isSpawnOnly = !found.unit && found.queued;
    if (isSpawnOnly){
      return {
        side: sideLower,
        pos: found.pos,
        unit: null,
        unitId: null,
        queued: true,
        wrapped: !!found.wrapped,
        sideKey,
        spawnOnly: true
      };
    }
    turn.lastPos[sideKey] = found.pos;
    if (found.wrapped){
      turn.wrapCount[sideKey] = (turn.wrapCount[sideKey] ?? 0) + 1;
    }
    return {
      side: sideLower,
      pos: found.pos,
      unit: found.unit || null,
      unitId: found.unit?.id ?? null,
      queued: !!found.queued,
      wrapped: !!found.wrapped,
      sideKey,
      spawnOnly: false
    };
  };

  const primarySide = normalizeSide(turn.nextSide);
  const fallbackSide = primarySide === 'ALLY' ? 'ENEMY' : 'ALLY';

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