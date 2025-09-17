// events.js
const HAS_EVENT_TARGET = typeof EventTarget === 'function';

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
  return HAS_EVENT_TARGET ? new EventTarget() : new SimpleEventTarget();
}

function makeEvent(type, detail){
  if (typeof CustomEvent === 'function'){
    return new CustomEvent(type, { detail });
  }
  if (typeof Event === 'function'){
    const ev = new Event(type);
    ev.detail = detail;
    return ev;
  }
  return { type, detail };
}

export const TURN_START = 'turn:start';
export const TURN_END = 'turn:end';
export const ACTION_START = 'action:start';
export const ACTION_END = 'action:end';

export const gameEvents = makeEventTarget();

export function emitGameEvent(type, detail){
  if (!type || !gameEvents) return false;
  const event = makeEvent(type, detail);
  try {
    if (typeof gameEvents.dispatchEvent === 'function'){
      return gameEvents.dispatchEvent(event);
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
