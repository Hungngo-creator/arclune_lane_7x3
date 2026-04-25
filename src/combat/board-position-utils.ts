import { slotIndex } from '../engine.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

export type BoardPosition = {
  slot: number;
  row: number;
  col: number;
};

export function readBoardPosition(token: UnitToken | null | undefined): BoardPosition | null {
  if (!token || !Number.isFinite(token.cx) || !Number.isFinite(token.cy) || !token.side) return null;
  const slot = slotIndex(token.side, token.cx, token.cy);
  if (!Number.isFinite(slot) || slot < 1) return null;
  const normalizedSlot = Math.floor(slot);
  return {
    slot: normalizedSlot,
    row: Math.floor((normalizedSlot - 1) / 3),
    col: (normalizedSlot - 1) % 3,
  };
}

export function isLeaderToken(token: UnitToken): boolean {
  const position = readBoardPosition(token);
  return !!position && position.slot === 8;
}

export function readTokenSlotAndColumn(token: Pick<UnitToken, 'side' | 'cx' | 'cy'>): { slot: number; column: number } {
  const slot = slotIndex(token.side, token.cx, token.cy);
  return {
    slot,
    column: ((slot - 1) % 3) + 1,
  };
}

export function selectTargetsByBoardPredicate(
  pool: ReadonlyArray<UnitToken>,
  predicate: (position: BoardPosition) => boolean,
): UnitToken[] {
  const selected: UnitToken[] = [];
  for (const token of pool) {
    const pos = readBoardPosition(token);
    if (!pos || !predicate(pos)) continue;
    selected.push(token);
  }
  return selected;
}

export function createCrossSlotLookup(centerSlot: number): Set<number> {
  const row = Math.floor((centerSlot - 1) / 3);
  const col = (centerSlot - 1) % 3;
  const slots = new Set<number>([centerSlot]);
  const candidates = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ] as const;
  for (const [r, c] of candidates) {
    if (r < 0 || r > 2 || c < 0 || c > 2) continue;
    slots.add(r * 3 + c + 1);
  }
  return slots;
}

export function findAliveUnitAtSlot(
  game: Pick<SessionState, 'tokens'>,
  side: UnitToken['side'],
  slot: number,
): UnitToken | null {
  if (!game || !Number.isFinite(slot) || slot < 1) return null;
  const normalizedSlot = Math.floor(slot);
  for (const token of game.tokens) {
    if (!token?.alive || token.side !== side) continue;
    const position = readBoardPosition(token);
    if (!position || position.slot !== normalizedSlot) continue;
    return token;
  }
  return null;
}