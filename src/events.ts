import type { BattleDetail, BattleResult, SessionState } from '@shared-types/combat';
import type { ActionChainProcessedResult, Side, UnitToken } from '@shared-types/units';

export interface TurnEventDetail {
  game: SessionState;
  unit: UnitToken | null;
  side: Side | null;
  slot: number | null;
  phase: string | null;
  cycle: number | null;
  orderIndex: number | null;
  orderLength: number | null;
  spawned: boolean;
  processedChain: ActionChainProcessedResult | null;
}

export interface ActionEventDetail {
  game: SessionState;
  unit: UnitToken | null;
  side: Side | null;
  slot: number | null;
  phase: string | null;
  cycle: number | null;
  orderIndex: number | null;
  orderLength: number | null;
  action: 'basic' | 'ult' | string | null;
  skipped: boolean;
  reason: string | null;
  ultOk?: boolean | null;
  damageContext?: DamageEventContext | null;
  counterBreakdown?: DamageCounterBreakdown | null;
  damageSummary?: string | null;
}

export interface DamageCounterBreakdown {
  classBonus: number;
  elementBonus: number;
  synergyBonus: number;
}

export interface DamageEventContext {
  attackerKey: string | null;
  defenderKey: string | null;
  actionType: string | null;
  damageType: string | null;
  rawDamage: number;
  finalDamage: number;
  dealtDamage: number;
  absorbedDamage: number;
  classBonus: number;
  elementBonus: number;
  synergyBonus: number;
  summary: string;
}

export interface TurnRegenDetail {
  game: SessionState;
  unit: UnitToken | null;
  hpDelta: number;
  aeDelta: number;
}

export interface BattleEndDetail {
  game: SessionState;
  result: BattleResult | null;
  context: BattleDetail['context'] | null | undefined;
}

export const TURN_START = 'turn:start' as const;
export const TURN_END = 'turn:end' as const;
export const ACTION_START = 'action:start' as const;
export const ACTION_END = 'action:end' as const;
export const TURN_REGEN = 'turn:regen' as const;
export const BATTLE_END = 'battle:end' as const;

export type GameEventType =
  | typeof TURN_START
  | typeof TURN_END
  | typeof ACTION_START
  | typeof ACTION_END
  | typeof TURN_REGEN
  | typeof BATTLE_END;

export interface GameEventDetailMap {
  [TURN_START]: TurnEventDetail;
  [TURN_END]: TurnEventDetail;
  [ACTION_START]: ActionEventDetail;
  [ACTION_END]: ActionEventDetail;
  [TURN_REGEN]: TurnRegenDetail;
  [BATTLE_END]: BattleEndDetail;
}

export type GameEventDetail<T extends GameEventType> =
  | (CustomEvent<GameEventDetailMap[T]> & { detail: GameEventDetailMap[T] })
  | {
      type: T;
      detail: GameEventDetailMap[T];
      target?: EventTarget | SimpleEventTarget | EventEmitterLike | null;
      currentTarget?: EventTarget | SimpleEventTarget | EventEmitterLike | null;
    };

type EventEmitterPayload<T extends GameEventType> =
  | GameEventDetail<T>
  | GameEventDetailMap[T]
  | undefined;

export interface EventEmitterLike {
  on: <T extends GameEventType>(
    type: T,
    listener: (payload?: EventEmitterPayload<T>) => unknown,
  ) => unknown;
  off?: <T extends GameEventType>(
    type: T,
    listener: (payload?: EventEmitterPayload<T>) => unknown,
  ) => unknown;
  emit: <T extends GameEventType>(type: T, payload?: EventEmitterPayload<T>) => unknown;
}

export type GameEventHandler<T extends GameEventType = GameEventType> = (
  event: GameEventDetail<T>,
) => void;

type CompatibleGameEventHandler<T extends GameEventType> = (
  event: GameEventDetail<T>,
) => unknown;

const HAS_EVENT_TARGET = typeof EventTarget === 'function';

type LegacyEvent = Event & { detail?: unknown };

const NOOP_DISPOSE = (): void => {};

const reportEventError = (error: unknown): void => {
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error('[events]', error);
  }
};

const isGameEventRecord = <T extends GameEventType>(
  payload: unknown,
): payload is GameEventDetail<T> => {
  if (!payload || typeof payload !== 'object') return false;
  const record = payload as Record<string, unknown>;
  return typeof record.type === 'string' && typeof record.detail !== 'undefined';
};

const isCompatibleHandler = <T extends GameEventType>(
  handler: unknown,
): handler is CompatibleGameEventHandler<T> => typeof handler === 'function';

const createIdempotentDispose = (dispose: () => void): (() => void) => {
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    dispose();
  };
};

function createNativeEvent<T extends GameEventType>(
  type: T,
  detail?: GameEventDetailMap[T],
): GameEventDetail<T> | null {
  if (!type) return null;
  if (typeof CustomEvent === 'function'){
    try {
      return new CustomEvent(type, { detail }) as GameEventDetail<T>;
    } catch {
      // ignore and fall through
    }
  }
  if (typeof Event === 'function'){
    try {
      const event = new Event(type) as LegacyEvent;
      event.detail = detail;
      return event as GameEventDetail<T>;
    } catch {
      // ignore and fall through
    }
  }
  return null;
}

class SimpleEventTarget {
  private readonly listeners: Map<GameEventType, Set<GameEventHandler>> = new Map();

  addEventListener<T extends GameEventType>(type: T, handler: GameEventHandler<T>): void {
    if (!type || typeof handler !== 'function') return;
    const set = this.listeners.get(type) ?? new Set<GameEventHandler>();
    set.add(handler as GameEventHandler);
    this.listeners.set(type, set);
  }

  removeEventListener<T extends GameEventType>(type: T, handler: GameEventHandler<T>): void {
    if (!type || typeof handler !== 'function') return;
    const set = this.listeners.get(type);
    if (!set?.size) return;
    set.delete(handler as GameEventHandler);
    if (!set.size) {
      this.listeners.delete(type);
    }
  }

  dispatchEvent<T extends GameEventType>(event: GameEventDetail<T>): boolean {
    if (!event?.type) return false;
    const set = this.listeners.get(event.type as GameEventType);
    if (!set?.size) return true;
    const snapshot = Array.from(set);
    const eventRecord = event as Record<string, unknown>;
    try {
      if (typeof eventRecord.target === 'undefined') {
        eventRecord.target = this;
      }
      eventRecord.currentTarget = this;
    } catch {
      // ignore assignment failures
    }
    for (const handler of snapshot) {
      try {
        handler.call(this, event);
      } catch (error) {
        reportEventError(error);
      }
    }
    return true;
  }
}

export type GameEventTargetLike = EventTarget | SimpleEventTarget | EventEmitterLike;

export function isEventEmitterLike(value: unknown): value is EventEmitterLike {
  if (!value || typeof value !== 'object'){
    return false;
  }
  const candidate = value as Partial<EventEmitterLike>;
  return (
    typeof candidate.on === 'function'
    && typeof candidate.emit === 'function'
  );
}

const makeEventTarget = (): GameEventTargetLike => {
  if (HAS_EVENT_TARGET){
    try {
      return new EventTarget();
    } catch {
      // ignore and fall through
    }
  }
  return new SimpleEventTarget();
};

const toSyntheticEventRecord = <T extends GameEventType>(
  type: T,
  detail?: GameEventDetailMap[T],
): GameEventDetail<T> => ({
  type,
  detail: detail as GameEventDetailMap[T],
});

const withEventTargetRefs = <T extends GameEventType>(
  event: GameEventDetail<T>,
  target: GameEventTargetLike,
): GameEventDetail<T> => {
  const record = event as Record<string, unknown>;
  try {
    if (typeof record.target === 'undefined'){
      record.target = target;
    }
    record.currentTarget = target;
  } catch {
    // ignore assignment failures
  }
  return event;
};

const toEventRecord = <T extends GameEventType>(
  type: T,
  payload: EventEmitterPayload<T>,
): GameEventDetail<T> => (
  isGameEventRecord<T>(payload)
    ? payload
    : toSyntheticEventRecord(type, payload as GameEventDetailMap[T])
);

const toEmitterEventRecord = <T extends GameEventType>(
  type: T,
  payload: EventEmitterPayload<T>,
  eventTarget: GameEventTargetLike,
): GameEventDetail<T> => withEventTargetRefs(toEventRecord(type, payload), eventTarget);

  export const gameEvents: GameEventTargetLike = makeEventTarget();
const emitViaTarget = <T extends GameEventType>(target: EventTarget, type: T, detail?: GameEventDetailMap[T]): boolean => {
  const nativeEvent = createNativeEvent(type, detail);
  if (!nativeEvent) return false;
  return target.dispatchEvent(nativeEvent as Event);
};
const emitViaSimpleTarget = <T extends GameEventType>(target: SimpleEventTarget, type: T, detail?: GameEventDetailMap[T]): boolean => (
  target.dispatchEvent(toSyntheticEventRecord(type, detail))
);
const emitViaEmitter = <T extends GameEventType>(target: EventEmitterLike, type: T, detail?: GameEventDetailMap[T]): boolean => {
  target.emit(type, detail);
  return true;
};

const addListenerViaTarget = <T extends GameEventType>(
  target: EventTarget,
  type: T,
  handler: CompatibleGameEventHandler<T>,
): (() => void) => {
  const eventListener = handler as unknown as EventListener;
  target.addEventListener(type, eventListener);
  return createIdempotentDispose(() => {
    target.removeEventListener(type, eventListener);
  });
};
const addListenerViaSimpleTarget = <T extends GameEventType>(
  target: SimpleEventTarget,
  type: T,
  handler: CompatibleGameEventHandler<T>,
): (() => void) => {
  const simpleHandler = handler as unknown as GameEventHandler<T>;
  target.addEventListener(type, simpleHandler);
  return createIdempotentDispose(() => {
    target.removeEventListener(type, simpleHandler);
  });
};
const addListenerViaEmitter = <T extends GameEventType>(
  target: EventEmitterLike,
  eventTarget: GameEventTargetLike,
type: T,
  handler: CompatibleGameEventHandler<T>,
): (() => void) => {
  const emitterHandler = function (
    this: unknown,
    payload?: EventEmitterPayload<T>,
  ): void {
    handler.call(this, toEmitterEventRecord(type, payload, eventTarget));
  };
  target.on(type, emitterHandler);
  return createIdempotentDispose(() => {
    if (typeof target.off === 'function'){
      target.off(type, emitterHandler);
    }
  });
};

const emitGameEventInternal = <T extends GameEventType>(type: T, detail?: GameEventDetailMap[T]): boolean => {
  if (!type) return false;
  if (HAS_EVENT_TARGET && gameEvents instanceof EventTarget){
    return emitViaTarget(gameEvents, type, detail);
  }
  if (gameEvents instanceof SimpleEventTarget){
    return emitViaSimpleTarget(gameEvents, type, detail);
  }
  if (isEventEmitterLike(gameEvents)){
    return emitViaEmitter(gameEvents, type, detail);
  }
  return false;
};

const addGameEventListenerInternal = <T extends GameEventType, H extends CompatibleGameEventHandler<T>>(
  type: T,
  handler: H,
): (() => void) => {
  if (!type || !isCompatibleHandler<T>(handler)){
    return NOOP_DISPOSE;
  }
  if (HAS_EVENT_TARGET && gameEvents instanceof EventTarget){
    return addListenerViaTarget(gameEvents, type, handler);
  }
  if (gameEvents instanceof SimpleEventTarget){
    return addListenerViaSimpleTarget(gameEvents, type, handler);
  }
  if (isEventEmitterLike(gameEvents)){
    return addListenerViaEmitter(gameEvents, gameEvents, type, handler);
  }
  return NOOP_DISPOSE;
};

export function emitGameEvent<T extends GameEventType>(
  type: T,
  detail?: GameEventDetailMap[T],
): boolean {
  try {
    return emitGameEventInternal.emit(type, detail);
  } catch (error) {
    reportEventError(error);
    return false;
  }
}

export const dispatchGameEvent = <T extends GameEventType>(
  type: T,
  detail?: GameEventDetailMap[T],
): boolean => emitGameEvent(type, detail);

export function addGameEventListener<T extends GameEventType, H extends CompatibleGameEventHandler<T>>(
  type: T,
  handler: H,
): () => void {

  try {
    return addGameEventListenerInternal(type, handler);
  } catch (error) {
    reportEventError(error);
    return NOOP_DISPOSE;
  }
}