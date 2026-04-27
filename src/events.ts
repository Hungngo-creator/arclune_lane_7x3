//home (termux)/arclune_lane_7x3/src/events.ts

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

const isGameEventRecord = <T extends GameEventType>(
  payload: unknown,
): payload is GameEventDetail<T> => {
  if (!payload || typeof payload !== 'object') return false;
  const record = payload as Record<string, unknown>;
  return typeof record.detail !== 'undefined' && typeof record.type === 'string';
};

const isCompatibleHandler = <T extends GameEventType>(
  handler: unknown,
): handler is CompatibleGameEventHandler<T> => typeof handler === 'function';

const HAS_EVENT_TARGET = typeof EventTarget === 'function';

type LegacyEvent = Event & { detail?: unknown };

function createNativeEvent<T extends GameEventType>(
  type: T,
  detail?: GameEventDetailMap[T],
): GameEventDetail<T> | null {
  if (!type) return null;
  if (typeof CustomEvent === 'function'){
    try {
      return new CustomEvent(type, { detail }) as GameEventDetail<T>;
    } catch (_err) {
      // ignore and fall through
    }
  }
  if (typeof Event === 'function'){
    try {
      const ev = new Event(type) as LegacyEvent;
      ev.detail = detail;
      return ev as GameEventDetail<T>;
    } catch (_err) {
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
    if (!set || set.size === 0) return;
    set.delete(handler as GameEventHandler);
    if (set.size === 0){
      this.listeners.delete(type);
    }
  }

  dispatchEvent<T extends GameEventType>(event: GameEventDetail<T>): boolean {
    if (!event || !event.type) return false;
    const type = event.type as GameEventType;
    const set = this.listeners.get(type);
    if (!set || set.size === 0) return true;
    const snapshot = Array.from(set);
    const eventRecord = event as Record<string, unknown>;
    try {
      if (typeof eventRecord.target === 'undefined'){
        eventRecord.target = this;
      }
      eventRecord.currentTarget = this;
    } catch (_err) {
      // ignore assignment failures
    }
    for (const handler of snapshot){
      try {
        handler.call(this, event);
      } catch (err) {
        console.error('[events]', err);
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
    typeof candidate.on === 'function' &&
    typeof candidate.emit === 'function'
  );
}

type EventBackend =
  | { kind: 'target'; target: EventTarget }
  | { kind: 'simple'; target: SimpleEventTarget }
  | { kind: 'emitter'; target: EventEmitterLike };

const makeEventTarget = (): GameEventTargetLike => {
  if (HAS_EVENT_TARGET){
    try {
      return new EventTarget();
    } catch (_err) {
      // ignore and fall through
    }
  }
  return new SimpleEventTarget();
};

const resolveEventBackend = (target: GameEventTargetLike): EventBackend | null => {
  if (HAS_EVENT_TARGET && target instanceof EventTarget){
    return { kind: 'target', target };
  }
  if (target instanceof SimpleEventTarget){
    return { kind: 'simple', target };
  }
  if (isEventEmitterLike(target)){
    return { kind: 'emitter', target };
  }
  return null;
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
  } catch (_err) {
    // ignore assignment failures
  }
  return event;
};

export const gameEvents: GameEventTargetLike = makeEventTarget();
const gameEventBackend = resolveEventBackend(gameEvents);

export function emitGameEvent<T extends GameEventType>(
  type: T,
  detail?: GameEventDetailMap[T],
): boolean {
  if (!type || !gameEventBackend) return false;
  try {
    if (gameEventBackend.kind === 'target'){
      const nativeEvent = createNativeEvent(type, detail);
    if (!nativeEvent) return false;
      return gameEventBackend.target.dispatchEvent(nativeEvent as Event);
    }
    if (gameEventBackend.kind === 'simple'){
      return gameEventBackend.target.dispatchEvent(toSyntheticEventRecord(type, detail));
    }
    gameEventBackend.target.emit(type, detail);
    return true;
  } catch (err) {
    console.error('[events]', err);
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
  if (!type || !isCompatibleHandler<T>(handler) || !gameEventBackend){
    return () => {};
  }

  if (gameEventBackend.kind === 'target'){
    const eventListener = ((event: Event) => {
      handler(event as GameEventDetail<T>);
    }) as EventListener;
    gameEventBackend.target.addEventListener(type, eventListener);
    let disposed = false;
    return () => {
      if (disposed) return;
      disposed = true;
      gameEventBackend.target.removeEventListener(type, eventListener);
    };
  }

  if (gameEventBackend.kind === 'simple'){
    const simpleHandler: GameEventHandler<T> = (event): void => {
      handler(event);
    };
    gameEventBackend.target.addEventListener(type, simpleHandler);
    let disposed = false;
    return () => {
      if (disposed) return;
      disposed = true;
      gameEventBackend.target.removeEventListener(type, simpleHandler);
    };
  }

const emitterHandler = function (
    this: unknown,
    payload?: EventEmitterPayload<T>,
  ): void {
    const eventRecord = isGameEventRecord<T>(payload)
      ? payload
      : toSyntheticEventRecord(type, payload as GameEventDetailMap[T]);
    handler.call(this, withEventTargetRefs(eventRecord, gameEvents));
  };

  gameEventBackend.target.on(type, emitterHandler);
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    if (typeof gameEventBackend.target.off === 'function'){
      gameEventBackend.target.off(type, emitterHandler);
    }
  };
}