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
  const filePath = path.resolve(__dirname, '../src/ui.js');
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(
    "import { CFG } from './config.ts';",
    "const { CFG } = __deps['./config.ts'];"
  );
  code = code.replace(
    "import { gameEvents, TURN_START, TURN_END, ACTION_END } from './events.ts';",
    "const { gameEvents, TURN_START, TURN_END, ACTION_END } = __deps['./events.ts'];"
  );
  code = code.replace(/export function/g, 'function');
  code += '\nmodule.exports = { initHUD, startSummonBar };';

  const context = {
    module: { exports: {} },
    exports: {},
    __deps: deps
  };
  vm.createContext(context);
  const script = new vm.Script(code, { filename: 'ui.js' });
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

const TURN_START = 'TURN_START';
const TURN_END = 'TURN_END';
const ACTION_END = 'ACTION_END';
const events = createGameEvents();

const { initHUD } = loadUiModule({
  './config.ts': { CFG: { COST_CAP: 30, UI: {} } },
  './events.ts': {
    gameEvents: events.target,
    TURN_START,
    TURN_END,
    ACTION_END
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