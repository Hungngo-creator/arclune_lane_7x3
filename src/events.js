// events.js
const HAS_EVENT_TARGET = typeof EventTarget === 'function';

function createNativeEvent(type, detail){
  if (!type) return null;
  if (typeof CustomEvent === 'function'){
    try {
      return new CustomEvent(type, { detail });
    } catch (_) {
      // ignore and fall through
    }
  }
  if (typeof Event === 'function'){
    try {
      const ev = new Event(type);
      try {
        ev.detail = detail;
      } catch (_) {
        // ignore assignment failures (readonly in some browsers)
      }
      return ev;
    } catch (_) {
      // ignore and fall through
    }
  }
  if (typeof document === 'object' && document && typeof document.createEvent === 'function'){
    try {
      const ev = document.createEvent('Event');
      if (typeof ev.initEvent === 'function'){
        ev.initEvent(type, false, false);
      }
      ev.detail = detail;
      return ev;
    } catch (_) {
      // ignore and fall through
    }
  }
  return null;
}
class SimpleEventTarget {
  constructor(){
    this._map = new Map();
  }
  addEventListener(type, handler){
    if (!type || typeof handler !== 'function') return;
    const list = this._map.get(type) || [];
    list.push(handler);
    this._map.set(type, list);
  }
  removeEventListener(type, handler){
    if (!type || typeof handler !== 'function') return;
    const list = this._map.get(type);
    if (!list || !list.length) return;
    const idx = list.indexOf(handler);
    if (idx >= 0){
      list.splice(idx, 1);
      if (!list.length) this._map.delete(type);
      else this._map.set(type, list);
    }
  }
  dispatchEvent(event){
    if (!event || !event.type) return false;
    const list = this._map.get(event.type);
    if (!list || !list.length) return true;
    for (const handler of [...list]){
      try {
        handler.call(this, event);
      } catch (err) {
        console.error('[events]', err);
      }
    }
    return true;
  }
}

function makeEventTarget(){
  if (!HAS_EVENT_TARGET) return new SimpleEventTarget();
  const probeType = '__probe__';
  const probeEvent = createNativeEvent(probeType);
  const hasEventConstructor = typeof Event === 'function';
  const isRealEvent = !!probeEvent && (!hasEventConstructor || probeEvent instanceof Event);
  if (!isRealEvent) return new SimpleEventTarget();
  try {
    const target = new EventTarget();
    let handled = false;
    const handler = () => { handled = true; };
    if (typeof target.addEventListener === 'function'){
      target.addEventListener(probeType, handler);
      try {
        if (typeof target.dispatchEvent === 'function' && isRealEvent){
         target.dispatchEvent(probeEvent);
        }
      } finally {
        if (typeof target.removeEventListener === 'function'){
          target.removeEventListener(probeType, handler);
        }
      }
    }
    if (handled) return target;
  } catch (err) {
    console.warn('[events] Falling back to SimpleEventTarget:', err);
  }
  return new SimpleEventTarget();
}

export const TURN_START = 'turn:start';
export const TURN_END = 'turn:end';
export const ACTION_START = 'action:start';
export const ACTION_END = 'action:end';

export const gameEvents = makeEventTarget();

export function emitGameEvent(type, detail){
  if (!type || !gameEvents) return false;
  try {
    if (typeof gameEvents.dispatchEvent === 'function'){
      const nativeEvent = createNativeEvent(type, detail);
      if (nativeEvent){
        return gameEvents.dispatchEvent(nativeEvent);
      }
      if (gameEvents instanceof SimpleEventTarget){
        return gameEvents.dispatchEvent({ type, detail });
      }
      return false;
    }
    if (typeof gameEvents.emit === 'function'){
      gameEvents.emit(type, detail);
      return true;
    }
  } catch (err) {
    console.error('[events]', err);
  }
  return false;
}
