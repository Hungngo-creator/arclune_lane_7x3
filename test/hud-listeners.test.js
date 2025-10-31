// @ts-nocheck
const test = require('node:test');
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createGameEvents(){
  const listeners = new Map();
  const target = {
    addEventListener(type, handler){
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(handler);
    },
    removeEventListener(type, handler){
      const set = listeners.get(type);
      if (!set) return;
      set.delete(handler);
      if (!set.size) listeners.delete(type);
    }
  };
  return {
    target,
    dispatch(type, detail){
      const set = listeners.get(type);
      if (!set) return;
      for (const handler of [...set]){
        handler({ type, detail });
      }
    },
    count(type){
      return listeners.get(type)?.size ?? 0;
    }
  };
}

function loadUiModule(deps){
  const filePath = path.resolve(__dirname, '../src/ui.ts');
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(
    "import { CFG } from './config.ts';",
    "const { CFG } = __deps['./config.ts'];"
  );
  code = code.replace(
    "import {\n  ACTION_END,\n  TURN_END,\n  TURN_START,\n  addGameEventListener,\n  gameEvents,\n} from './events.ts';",
    "const {\n  ACTION_END,\n  TURN_END,\n  TURN_START,\n  addGameEventListener,\n  gameEvents,\n} = __deps['./events.ts'];"
  );
  code = code.replace(
    "import { assertElement } from './ui/dom.ts';",
    "const { assertElement } = __deps['./ui/dom.ts'];"
  );
  code = code.replace(
    "import type { HudHandles, SummonBarCard, SummonBarHandles, SummonBarOptions } from '@shared-types/ui';\n\n",
    ''
  );
  code = code.replace(/import type [^;]+;\n*/g, '');
  code = code.replace(/export function/g, 'function');
  code = code.replace(/type\s+[A-Za-z0-9_]+(?:<[^>]+>)?\s*=\s*[\s\S]*?};\r?\n/g, '');
  code = code.replace(/type\s+[A-Za-z0-9_]+(?:<[^>]+>)?\s*=\s*[^;]+;\r?\n/g, '');
  code = code.replace(/function\s+([A-Za-z0-9_$]+)<[^>]+>\(/g, 'function $1(');
  code = code.replace(/=\s*<[^>]+>\(/g, '= (');
  code = code.replace(/:\s*\([^)]*\)\s*=>\s*[^,\)\s]+/g, '');
  code = code.replace(/([,(])\s*([A-Za-z0-9_$]+)\??\s*:\s*[^),]+/g, '$1 $2');
  code = code.replace(/\.\.\.([A-Za-z0-9_$]+)\s*:\s*[^),]+/g, '...$1');
  code = code.replace(/:\s*Array<\(\)\s*=>\s*void>/g, '');
  code = code.replace(/:\s*\(\)\s*=>\s*void/g, '');
  code = code.replace(/:\s*MutationObserver\s*\|\s*null/g, '');
  code = code.replace(/:\s*ReturnType<[^>]+>\s*\|\s*null/g, '');
  code = code.replace(/:\s*HTMLButtonElement\[\]/g, '');
  code = code.replace(/:\s*HTMLButtonElement/g, '');
  code = code.replace(/:\s*SummonBarHandles/g, '');
  code = code.replace(/:\s*HudHandles/g, '');
  code = code.replace(/:\s*ReadonlyArray<TCard>/g, '');
  code = code.replace(/\)\s*:\s*[^=\{]+=>/g, ') =>');
  code = code.replace(/\)\s*:\s*[^\{]+\{/g, ') {');
  code = code.replace(/\s+as\s+[A-Za-z0-9_<>{}\[\]\s|&?,.:]+/g, '');
  code = code.replace(/\.querySelector<[^>]+>/g, '.querySelector');
  code = code.replace(/closest<[^>]+>/g, 'closest');
  code = code.replace(/assertElement<[^>]+>/g, 'assertElement');
  code = code.replace(/satisfies\s+[A-Za-z0-9_<>{}\[\]\s|&?,.]+;/g, ';');
  code += '\nmodule.exports = { initHUD, startSummonBar };';

  const context = {
    module: { exports: {} },
    exports: {},
    __deps: deps
  };
  vm.createContext(context);
  const script = new vm.Script(code, { filename: 'ui.ts' });
  script.runInContext(context);
  return context.module.exports;
}

function createDocument(){
  let costNowValue = '';
  const counters = {
    costNowUpdates: 0,
    costRingUpdates: [],
    costChipFullStates: []
  };
  const costNow = {};
  Object.defineProperty(costNow, 'textContent', {
    get(){
      return costNowValue;
    },
    set(value){
      costNowValue = value;
      counters.costNowUpdates += 1;
    }
  });
  const costRing = {
    style: {
      setProperty(key, value){
        counters.costRingUpdates.push([key, value]);
      }
    }
  };
  const costChip = {
    classList: {
      toggle(name, state){
        counters.costChipFullStates.push([name, !!state]);
      }
    }
  };
  return {
    counters,
    doc: {
      getElementById(id){
        switch (id){
          case 'costNow':
            return costNow;
          case 'costRing':
            return costRing;
          case 'costChip':
            return costChip;
          default:
            return null;
        }
      }
    }
  };
}

class FakeElement {
  constructor(tagName = 'div'){
    this.tagName = String(tagName).toUpperCase();
    this.dataset = {};
    this.style = { setProperty: () => {} };
    this._classSet = new Set();
    this.classList = {
      add: (cls) => { this._classSet.add(cls); },
      remove: (cls) => { this._classSet.delete(cls); },
      contains: (cls) => this._classSet.has(cls),
      toggle: (cls, force) => {
        if (typeof force === 'boolean'){
          if (force){
            this._classSet.add(cls);
            return true;
          }
          this._classSet.delete(cls);
          return false;
        }
        if (this._classSet.has(cls)){
          this._classSet.delete(cls);
          return false;
        }
        this._classSet.add(cls);
        return true;
      }
    };
    this.children = [];
    this.parentNode = null;
    this.isConnected = true;
    this.disabled = false;
    this.hidden = false;
    this.textContent = '';
    this._listeners = new Map();
    this._innerHTML = '';
  }

  set className(value){
    this._classSet.clear();
    if (typeof value !== 'string') return;
    for (const cls of value.split(/\s+/).filter(Boolean)){
      this._classSet.add(cls);
    }
  }

  get className(){
    return Array.from(this._classSet).join(' ');
  }

  appendChild(node){
    this.children.push(node);
    node.parentNode = this;
    node.isConnected = this.isConnected;
    return node;
  }

  removeChild(node){
    const idx = this.children.indexOf(node);
    if (idx >= 0){
      this.children.splice(idx, 1);
      node.parentNode = null;
      node.isConnected = false;
    }
    return node;
  }

  addEventListener(type, handler){
    if (!this._listeners.has(type)) this._listeners.set(type, new Set());
    this._listeners.get(type).add(handler);
  }

  removeEventListener(type, handler){
    const set = this._listeners.get(type);
    if (!set) return;
    set.delete(handler);
    if (!set.size) this._listeners.delete(type);
  }

  dispatchEvent(event){
    const set = this._listeners.get(event?.type);
    if (!set) return;
    for (const handler of [...set]){
      handler.call(this, event);
    }
  }

  contains(node){
    if (node === this) return true;
    for (const child of this.children){
      if (child === node) return true;
      if (typeof child.contains === 'function' && child.contains(node)){
        return true;
      }
    }
    return false;
  }

  closest(selector){
    if (selector === 'button.card' && this.tagName === 'BUTTON' && this.classList.contains('card')){
      return this;
    }
    if (this.parentNode && typeof this.parentNode.closest === 'function'){
      return this.parentNode.closest(selector);
    }
    return null;
  }

  querySelector(selector){
    if (selector === '.cost'){
      return this.children.find((child) => child.classList?.contains?.('cost')) ?? null;
    }
    if (selector?.startsWith?.('#')){
      const id = selector.slice(1);
      return this.children.find((child) => child.id === id) ?? null;
    }
    return null;
  }

  getBoundingClientRect(){
    return { width: this.clientWidth ?? 0, height: this.clientHeight ?? 0 };
  }

  set innerHTML(value){
    this._innerHTML = value ?? '';
    this.children.length = 0;
    if (typeof value === 'string'){
      const match = value.match(/<span[^>]*class="cost"[^>]*>(.*?)<\/span>/);
      if (match){
        const span = new FakeElement('span');
        span.classList.add('cost');
        span.textContent = match[1];
        this.appendChild(span);
      }
    }
  }

  get innerHTML(){
    return this._innerHTML;
  }
}

class FakeDocument {
  constructor(){
    this._elements = new Map();
    this.body = new FakeElement('body');
    this.documentElement = this.body;
  }

  register(id, element){
    element.id = id;
    this._elements.set(id, element);
    return element;
  }

  getElementById(id){
    return this._elements.get(id) ?? null;
  }

  createElement(tag){
    return new FakeElement(tag);
  }

  appendChild(node){
    return node;
  }
}

function createSummonBarEnvironment(){
  const doc = new FakeDocument();
  const host = doc.register('cards', new FakeElement('div'));
  const board = doc.register('board', new FakeElement('div'));
  Object.defineProperty(board, 'clientWidth', { configurable: true, enumerable: true, writable: true, value: 700 });
  board.getBoundingClientRect = () => ({ width: board.clientWidth ?? 0, height: 120 });
  doc.body.appendChild(host);
  doc.body.appendChild(board);
  return { doc, host, board };
}

global.Element = FakeElement;
global.HTMLElement = FakeElement;
global.HTMLButtonElement = FakeElement;
global.HTMLSpanElement = FakeElement;

const TURN_START = 'TURN_START';
const TURN_END = 'TURN_END';
const ACTION_END = 'ACTION_END';
const events = createGameEvents();

const { initHUD, startSummonBar } = loadUiModule({
  './config.ts': { CFG: { COST_CAP: 30, UI: {} } },
  './events.ts': {
    gameEvents: events.target,
    TURN_START,
    TURN_END,
    ACTION_END,
    addGameEventListener(type, handler){
      events.target.addEventListener(type, handler);
      return () => events.target.removeEventListener(type, handler);
    }
  },
  './ui/dom.ts': {
    assertElement(value){
      if (!(value instanceof FakeElement)){
        throw new Error('Expected element');
      }
      return value;
    }
  }
});

test('initHUD cleanup removes listeners between sessions', () => {
  const { doc, counters } = createDocument();

  const hudFirst = initHUD(doc, null);
  assert.equal(typeof hudFirst.cleanup, 'function', 'cleanup should be a function');
  hudFirst.cleanup();
  assert.equal(events.count(TURN_START), 0, 'cleanup should remove registered listeners');

  const hudSecond = initHUD(doc, null);
  assert.equal(events.count(TURN_START), 1, 'exactly one listener should be registered after init');
  hudSecond.update({ cost: 5, costCap: 10 });
  const beforeEventUpdates = counters.costNowUpdates;

  events.dispatch(TURN_START, { game: { cost: 7, costCap: 10 } });
  assert.equal(
    counters.costNowUpdates,
    beforeEventUpdates + 1,
    'exactly one HUD should respond to the event after cleanup'
  );

  const afterEventUpdates = counters.costNowUpdates;
  hudSecond.cleanup();
  assert.equal(events.count(TURN_START), 0, 'cleanup should remove listener registered by second HUD');
  events.dispatch(TURN_START, { game: { cost: 9, costCap: 10 } });
  assert.equal(
    counters.costNowUpdates,
    afterEventUpdates,
    'cleanup should remove listeners for subsequent events'
  );

  hudFirst.cleanup();
  assert.equal(events.count(TURN_START), 0, 'no listeners should remain after repeated cleanup calls');
});

test('startSummonBar cleanup prevents listener leaks across sessions', () => {
  const prevResizeObserver = global.ResizeObserver;
  const prevMutationObserver = global.MutationObserver;
  const mutationObservers = [];

  class FakeResizeObserver {
    static instances = [];

    constructor(callback){
      this._callback = callback;
      this.disconnected = false;
      FakeResizeObserver.instances.push(this);
    }

    observe(){
      // no-op for tests
    }

    disconnect(){
      this.disconnected = true;
    }
  }

  class FakeMutationObserver {
    constructor(callback){
      this._callback = callback;
      this.disconnected = false;
      mutationObservers.push(this);
    }

    observe(target){
      this._target = target;
    }

    disconnect(){
      this.disconnected = true;
    }

    trigger(){
      this._callback([], this);
    }
  }

  global.ResizeObserver = FakeResizeObserver;
  global.MutationObserver = FakeMutationObserver;

  const { doc, host } = createSummonBarEnvironment();
  const deck = [
    { id: 'alpha', cost: 1 },
    { id: 'beta', cost: 2 }
  ];
  const options = {
    onPick: () => {},
    canAfford: () => true,
    getDeck: () => deck,
    getSelectedId: () => deck[0].id,
  };

  try {
    const barFirst = startSummonBar(doc, options);
    assert.equal(typeof barFirst.cleanup, 'function', 'cleanup should be exposed for summon bar');
    for (const type of [TURN_START, TURN_END, ACTION_END]){
      assert.equal(events.count(type), 1, `listener should be registered for ${type}`);
    }

    barFirst.cleanup();
    for (const type of [TURN_START, TURN_END, ACTION_END]){
      assert.equal(events.count(type), 0, `listeners should be removed after cleanup for ${type}`);
    }

    const barSecond = startSummonBar(doc, options);
    for (const type of [TURN_START, TURN_END, ACTION_END]){
      assert.equal(events.count(type), 1, `a single listener should exist for ${type} after restart`);
    }

    const observer = mutationObservers[mutationObservers.length - 1];
    assert.ok(observer, 'a mutation observer should be registered for host tracking');

    host.isConnected = false;
    observer.trigger();

    for (const type of [TURN_START, TURN_END, ACTION_END]){
      assert.equal(events.count(type), 0, `listeners should be cleared after host disconnect for ${type}`);
    }

    barSecond.cleanup();
    for (const type of [TURN_START, TURN_END, ACTION_END]){
      assert.equal(events.count(type), 0, `cleanup should remain idempotent for ${type}`);
    }

    FakeResizeObserver.instances.forEach((instance) => {
      assert.equal(instance.disconnected, true, 'resize observers should be disconnected on cleanup');
    });
  } finally {
    global.ResizeObserver = prevResizeObserver;
    global.MutationObserver = prevMutationObserver;
  }
});