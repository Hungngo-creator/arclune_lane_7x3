import type { ActionChainProcessedResult, SessionState } from './combat';
import type { Side, UnitId, UnitToken } from './units';

export type TurnSideKey = 'ALLY' | 'ENEMY';

export interface InterleavedTurnState {
  mode: 'interleaved_by_position';
  nextSide: TurnSideKey;
  lastPos: Record<TurnSideKey, number>;
  wrapCount: Record<TurnSideKey, number>;
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
  mode?: string;
  order: SequentialTurnStateEntry[];
  orderIndex: Map<string, number>;
  cursor: number;
  cycle: number;
  busyUntil: number;
  completed?: boolean;
}

export interface TurnContext {
  side: Side;
  slot: number;
  orderIndex: number;
  orderLength: number | null;
  cycle: number;
}

export interface QueuedSummonEntry {
  side: Side;
  slot: number;
}

export interface InterleavedState {
  side: Side;
  pos: number;
  unit: UnitToken | null;
  unitId: UnitId | null;
  queued: boolean;
  wrapped: boolean;
  sideKey: TurnSideKey;
  spawnOnly: boolean;
}

export type GetTurnOrderIndexHook = (
  game: SessionState,
  side: Side | TurnSideKey,
  slot: number
) => number;

export interface TurnHooks {
  performUlt?: (unit: UnitToken) => void;
  allocIid?: () => number;
  processActionChain?: (
    game: SessionState,
    side: Side,
    slot: number,
    hooks: TurnHooks & { getTurnOrderIndex: GetTurnOrderIndexHook }
  ) => ActionChainProcessedResult | undefined;
  checkBattleEnd?: (game: SessionState, info: Record<string, unknown>) => boolean | void;
  doActionOrSkip?: (
    game: SessionState,
    unit: UnitToken | null,
    options?: { performUlt?: TurnHooks['performUlt']; turnContext?: TurnContext }
  ) => void;
  getTurnOrderIndex?: GetTurnOrderIndexHook;
}

export type TurnSnapshot = InterleavedTurnState | SequentialTurnState;