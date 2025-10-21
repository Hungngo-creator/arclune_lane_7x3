import type { Side } from './units';

export interface InterleavedTurnState {
  mode: 'interleaved_by_position';
  nextSide: 'ALLY' | 'ENEMY';
  lastPos: Record<'ALLY' | 'ENEMY', number>;
  wrapCount: Record<'ALLY' | 'ENEMY', number>;
  turnCount: number;
  slotCount: number;
  cycle: number;
  busyUntil: number;
  completed?: boolean;
}

export interface SequentialTurnStateEntry {
  side: Side;
  slot: number;
}

export interface SequentialTurnState {
  order: SequentialTurnStateEntry[];
  orderIndex: Map<string, number>;
  cursor: number;
  cycle: number;
  busyUntil: number;
  completed?: boolean;
}

export type TurnSnapshot = InterleavedTurnState | SequentialTurnState;