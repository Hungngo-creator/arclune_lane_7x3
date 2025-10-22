import type {
  ActionChainProcessedResult,
  BattleDetail,
  BattleResult,
  SessionState,
} from '@types/combat';
import type { Side, UnitToken } from '@types/units';

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
      target?: EventTarget | SimpleEventTarget | null;
      currentTarget?: EventTarget | SimpleEventTarget | null;
    };

export type GameEventHandler<T extends GameEventType = GameEventType> = (
  event: GameEventDetail<T>,
) => void;

const HAS_EVENT_TARGET = typeof EventTarget === 'function';

type LegacyEvent = Event & {
  initEvent?: (type: string, bubbles?: boolean, cancelable?: boolean) => void;
  detail?: unknown;
};

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
      try {
        ev.detail = detail;
      } catch (_assignErr) {
        // ignore assignment failures (readonly in some browsers)
      }
      return ev as GameEventDetail<T>;
    } catch (_err) {
      // ignore and fall through
    }
  }
  if (typeof document === 'object' && document && typeof document.createEvent === 'function'){
    try {
      const ev = document.createEvent('Event') as LegacyEvent;
      if (typeof ev.initEvent === 'function'){
        ev.initEvent(type, false, false);
      }
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
    const set = this.listeners.get(event.type);
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

function makeEventTarget(): EventTarget | SimpleEventTarget {
  if (!HAS_EVENT_TARGET) return new SimpleEventTarget();
  const probeType = '__probe__';
  const probeEvent = createNativeEvent(probeType as GameEventType);
  const hasEventConstructor = typeof Event === 'function';
  const isRealEvent = !!probeEvent && (!hasEventConstructor || probeEvent instanceof Event);
  if (!isRealEvent) return new SimpleEventTarget();
  try {
    const target = new EventTarget();
    let handled = false;
    const handler = (): void => {
      handled = true;
    };
    if (typeof target.addEventListener === 'function'){
      target.addEventListener(probeType, handler as EventListener);
      try {
        if (typeof target.dispatchEvent === 'function' && isRealEvent){
          target.dispatchEvent(probeEvent as Event);
        }
      } finally {
        if (typeof target.removeEventListener === 'function'){
          target.removeEventListener(probeType, handler as EventListener);
        }
      }
    }
    if (handled) return target;
  } catch (err) {
    console.warn('[events] Falling back to SimpleEventTarget:', err);
  }
  return new SimpleEventTarget();
}

export const gameEvents = makeEventTarget();

export function emitGameEvent<T extends GameEventType>(
  type: T,
  detail?: GameEventDetailMap[T],
): boolean {
  if (!type || !gameEvents) return false;
  try {
    if (typeof (gameEvents as EventTarget).dispatchEvent === 'function'){
      const nativeEvent = createNativeEvent(type, detail);
      if (nativeEvent){
        return (gameEvents as EventTarget).dispatchEvent(nativeEvent as Event);
      }
      if (gameEvents instanceof SimpleEventTarget){
        const syntheticEvent: GameEventDetail<T> = {
          type,
          detail: detail as GameEventDetailMap[T],
        };
        return gameEvents.dispatchEvent(syntheticEvent);
      }
      return false;
    }
    const emitter = gameEvents as unknown as {
      emit?: (eventType: T, eventDetail?: GameEventDetailMap[T]) => void;
    };
    if (typeof emitter.emit === 'function'){
      emitter.emit(type, detail);
      return true;
    }
  } catch (err) {
    console.error('[events]', err);
  }
  return false;
}

export const dispatchGameEvent = <T extends GameEventType>(
  type: T,
  detail?: GameEventDetailMap[T],
): boolean => emitGameEvent(type, detail);

export function addGameEventListener<T extends GameEventType>(
  type: T,
  handler: GameEventHandler<T>,
): () => void {
  if (!type || typeof handler !== 'function' || !gameEvents){
    return () => {};
  }
  if (typeof (gameEvents as EventTarget).addEventListener === 'function'){
    (gameEvents as EventTarget).addEventListener(type, handler as EventListener);
    let disposed = false;
    return () => {
      if (disposed) return;
      disposed = true;
      if (typeof (gameEvents as EventTarget).removeEventListener === 'function'){
        (gameEvents as EventTarget).removeEventListener(type, handler as EventListener);
      }
    };
  }
  const eventEmitter = gameEvents as unknown as {
    on?: (eventType: T, listener: GameEventHandler<T>) => void;
    off?: (eventType: T, listener: GameEventHandler<T>) => void;
  };
  if (typeof eventEmitter.on === 'function'){
    eventEmitter.on(type, handler);
    let disposed = false;
    return () => {
      if (disposed) return;
      disposed = true;
      if (typeof eventEmitter.off === 'function'){
        eventEmitter.off(type, handler);
      }
    };
  }
  return () => {};
}