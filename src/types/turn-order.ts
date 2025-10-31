import type { SessionState } from './combat';
import type { ActionChainProcessedResult, Side, UnitId, UnitToken } from './units';

export interface ActionResolution {
  /**
   * Đánh dấu lượt đã được tiêu thụ hay chưa. Nếu false, caller có thể bỏ qua các hậu quả như trừ TTL.
   */
  consumedTurn?: boolean;
  /**
   * Đã có hành động tấn công/ulti thực sự xảy ra.
   */
  acted?: boolean;
  /**
   * Cho biết lượt bị bỏ qua (do trạng thái, thiếu unit, ...).
   */
  skipped?: boolean;
  /**
   * Lý do bỏ qua (nếu có). Dùng để phân biệt lỗi hệ thống với skip hợp lệ.
   */
  reason?: string | null;
}

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
  order?: undefined;
}

export interface SequentialTurnStateEntry {
  side: Side;
  slot: number;
}

export interface SequentialTurnState {
  mode?: string | null;
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
  mode?: 'interleaved_by_position';
  order?: undefined;
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
  ) => ActionResolution | void;
  getTurnOrderIndex?: GetTurnOrderIndexHook;
}

export type TurnSnapshot = InterleavedTurnState | SequentialTurnState;