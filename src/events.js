// events.js

/**
 * @typedef {import('../types/game-entities').SessionState} SessionState
 * @typedef {import('../types/game-entities').UnitToken} UnitToken
 * @typedef {import('../types/game-entities').BattleResult} BattleResult
 * @typedef {import('../types/game-entities').Side} Side
 */

/**
 * Thông tin chi tiết cho một lượt bắt đầu/kết thúc.
 * @typedef {Object} TurnEventDetail
 * @property {SessionState} game Trạng thái phiên đấu tại thời điểm phát sự kiện.
 * @property {UnitToken | null} unit Đơn vị đang tới lượt (nếu có).
 * @property {Side | null} side Phe đang thực thi hành động.
 * @property {number | null} slot Ô trên bàn tương ứng với đơn vị.
 * @property {string | null} phase Pha hiện tại (thường trùng với side).
 * @property {number | null} cycle Chu kỳ lượt.
 * @property {number | null} orderIndex Chỉ số trong thứ tự lượt.
 * @property {number | null} orderLength Tổng số phần tử trong thứ tự lượt.
 * @property {boolean} spawned Đơn vị có vừa được triệu hồi trong lượt không.
 * @property {unknown} processedChain Thông tin chuỗi hành động đã xử lý (nếu có).
 */

/**
 * Thông tin chi tiết cho sự kiện bắt đầu/kết thúc hành động.
 * @typedef {Object} ActionEventDetail
 * @property {SessionState} game Trạng thái phiên đấu tại thời điểm phát sự kiện.
 * @property {UnitToken | null} unit Đơn vị đang hành động (nếu có).
 * @property {Side | null} side Phe của đơn vị hành động.
 * @property {number | null} slot Ô trên bàn tương ứng với đơn vị.
 * @property {string | null} phase Pha hiện tại.
 * @property {number | null} cycle Chu kỳ lượt.
 * @property {number | null} orderIndex Chỉ số trong thứ tự lượt.
 * @property {number | null} orderLength Tổng số phần tử trong thứ tự lượt.
 * @property {string | null} action Hành động được thực thi ("basic", "ult" hoặc null).
 * @property {boolean} skipped Đơn vị có bị bỏ lượt hay không.
 * @property {string | null} reason Lý do bỏ lượt (nếu có).
 * @property {boolean | null | undefined} [ultOk] Đòn Ult có được thi triển thành công hay không.
 */

/**
 * Thông tin chi tiết cho sự kiện hồi phục theo lượt.
 * @typedef {Object} TurnRegenDetail
 * @property {SessionState} game Trạng thái phiên đấu tại thời điểm phát sự kiện.
 * @property {UnitToken | null} unit Đơn vị nhận hồi phục.
 * @property {number} hpDelta Lượng HP thay đổi.
 * @property {number} aeDelta Lượng Aether thay đổi.
 */

/**
 * Thông tin chi tiết cho sự kiện kết thúc trận đấu.
 * @typedef {Object} BattleEndDetail
 * @property {SessionState} game Trạng thái phiên đấu đã kết thúc.
 * @property {BattleResult | null} result Kết quả trận đấu.
 * @property {Record<string, unknown> | null | undefined} context Ngữ cảnh kích hoạt kết thúc trận.
 */

/**
 * Bảng ánh xạ loại sự kiện -> payload tương ứng.
 * @typedef {Object} EventPayloadMap
 * @property {TurnEventDetail} 'turn:start'
 * @property {TurnEventDetail} 'turn:end'
 * @property {ActionEventDetail} 'action:start'
 * @property {ActionEventDetail} 'action:end'
 * @property {TurnRegenDetail} 'turn:regen'
 * @property {BattleEndDetail} 'battle:end'
 */

/**
 * Các loại sự kiện gameplay hỗ trợ.
 * @typedef {'turn:start' | 'turn:end' | 'action:start' | 'action:end' | 'turn:regen' | 'battle:end'} GameEvent
 */

/**
 * @template {GameEvent} T
 * @typedef {(CustomEvent<EventPayloadMap[T]> & { detail: EventPayloadMap[T] }) | ({ type: T; detail: EventPayloadMap[T]; target?: unknown; currentTarget?: unknown })} GameEventDetail
 */
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
export const TURN_REGEN = 'turn:regen';
export const BATTLE_END = 'battle:end';

export const gameEvents = makeEventTarget();

/**
 * Phát sự kiện gameplay với payload tương ứng.
 * @template {GameEvent} T
 * @param {T} type Loại sự kiện cần phát.
 * @param {EventPayloadMap[T]} [detail] Payload kèm theo.
 * @returns {boolean}
 */
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
/**
 * Alias thuận tiện cho emitGameEvent với chú thích kiểu rõ ràng.
 * @template {GameEvent} T
 * @param {T} type Loại sự kiện cần phát.
 * @param {EventPayloadMap[T]} [detail] Payload kèm theo.
 * @returns {boolean}
 */
export const dispatchGameEvent = (type, detail) => emitGameEvent(type, detail);

/**
 * Đăng ký lắng nghe sự kiện gameplay với cleanup tiện lợi.
 * @template {GameEvent} T
 * @param {T} type Loại sự kiện muốn theo dõi.
 * @param {(event: GameEventDetail<T>) => void} handler Hàm xử lý khi sự kiện kích hoạt.
 * @returns {() => void} Hàm huỷ đăng ký.
 */
export function addGameEventListener(type, handler){
  if (!type || typeof handler !== 'function' || !gameEvents){
    return () => {};
  }
  if (typeof gameEvents.addEventListener === 'function'){
    gameEvents.addEventListener(type, handler);
    return () => {
      if (typeof gameEvents.removeEventListener === 'function'){
        gameEvents.removeEventListener(type, handler);
      }
    };
  }
  if (typeof gameEvents.on === 'function'){
    gameEvents.on(type, handler);
    return () => {
      if (typeof gameEvents.off === 'function'){
        gameEvents.off(type, handler);
      }
    };
  }
  return () => {};
}