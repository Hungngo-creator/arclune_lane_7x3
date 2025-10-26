import { jest } from '@jest/globals';

describe('game event system', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('dispatches via DOM EventTarget when available', async () => {
    const events = await import('../src/events');
    expect(events.gameEvents instanceof EventTarget).toBe(true);
    const handler = jest.fn();
    const dispose = events.addGameEventListener(events.TURN_START, handler);
    events.emitGameEvent(events.TURN_START);
    expect(handler).toHaveBeenCalledTimes(1);
    dispose();
    events.emitGameEvent(events.TURN_START);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('dispatches via fallback SimpleEventTarget when DOM API missing', async () => {
    const originalEventTarget = globalThis.EventTarget;
    const originalEvent = globalThis.Event;
    const originalCustomEvent = globalThis.CustomEvent;

    try {
      // @ts-expect-error override for testing fallback
      globalThis.EventTarget = undefined;
      // @ts-expect-error override for testing fallback
      globalThis.Event = undefined;
      // @ts-expect-error override for testing fallback
      globalThis.CustomEvent = undefined;

      jest.resetModules();
      const events = await import('../src/events');
      expect(globalThis.EventTarget).toBeUndefined();
      const handler = jest.fn();
      const dispose = events.addGameEventListener(events.TURN_END, handler);
      expect(events.emitGameEvent(events.TURN_END)).toBe(true);
      expect(handler).toHaveBeenCalledTimes(1);
      dispose();
      expect(events.emitGameEvent(events.TURN_END)).toBe(true);
      expect(handler).toHaveBeenCalledTimes(1);
    } finally {
      jest.resetModules();
      globalThis.EventTarget = originalEventTarget;
      globalThis.Event = originalEvent;
      globalThis.CustomEvent = originalCustomEvent;
    }
  });
});
