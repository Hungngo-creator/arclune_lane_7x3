const test = require('node:test');
const assert = require('assert/strict');

const { loadSessionModule, clearModuleCache } = require('./helpers/pve-session-loader.js');

function createElementStub() {
  return {
    textContent: '',
    classList: {
      add() {},
      remove() {},
      toggle() {},
      contains() { return false; }
    },
    style: {},
    setAttribute() {},
    removeAttribute() {},
    appendChild() {},
    remove() {},
    querySelector() { return null; },
    innerHTML: ''
  };
}

function createRootStub() {
  const rafHandles = new Set();
  const ctxProxy = new Proxy({}, {
    get(target, prop) {
      if (!(prop in target)) {
        target[prop] = () => {};
      }
      return target[prop];
    },
    set() {
      return true;
    }
  });
  const canvas = {
    width: 640,
    height: 360,
    style: {},
    getContext() { return ctxProxy; },
    getBoundingClientRect() {
      return { width: this.width, height: this.height };
    },
    addEventListener() {},
    removeEventListener() {}
  };
  const elements = new Map([
    ['#board', canvas]
  ]);

  const doc = {
    hidden: false,
    defaultView: {
      devicePixelRatio: 1,
      requestAnimationFrame(callback) {
        const handle = setTimeout(() => {
          rafHandles.delete(handle);
          callback(0);
        }, 0);
        rafHandles.add(handle);
        return handle;
      },
      cancelAnimationFrame(handle) {
        clearTimeout(handle);
        rafHandles.delete(handle);
      },
      addEventListener() {},
      removeEventListener() {}
    },
    addEventListener() {},
    removeEventListener() {},
    querySelector(selector) {
      if (elements.has(selector)) return elements.get(selector);
      const el = createElementStub();
      elements.set(selector, el);
      return el;
    },
    getElementById(id) {
      return this.querySelector(`#${id}`);
    },
    createElement(tag) {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          style: {},
          getContext() { return ctxProxy; }
        };
      }
      return createElementStub();
    }
  };

  const root = {
    ownerDocument: doc,
    querySelector(selector) {
      return doc.querySelector(selector);
    }
  };

  return { root };
}

test('distinct PvE setups propagate mode, deck, and AI presets', () => {
  clearModuleCache();
  const sessionModule = loadSessionModule();
  const { createPveSession, __getActiveGame, __getStoredConfig } = sessionModule;
  const { root } = createRootStub();

  const campaignDeck = [{ id: 'alpha' }];
  const campaignAiDeck = [{ id: 'omega' }];
  const campaignSession = createPveSession(root, {
    modeKey: 'campaign',
    deck: campaignDeck,
    aiPreset: { deck: campaignAiDeck }
  });
  const campaignStored = __getStoredConfig();
  assert.equal(campaignStored.modeKey, 'campaign');
  assert.deepEqual(campaignStored.deck, campaignDeck);
  assert.deepEqual(campaignStored.aiPreset.deck, campaignAiDeck);
  const campaignGame = campaignSession.start();
  assert.ok(campaignGame, 'expected campaign session to start');
  const activeCampaign = __getActiveGame();
  assert.equal(activeCampaign.modeKey, 'campaign');
  assert.deepEqual(activeCampaign.unitsAll, campaignDeck);
  assert.deepEqual(activeCampaign.ai.unitsAll, campaignAiDeck);
  campaignSession.stop();

  const challengeDeck = [{ id: 'beta' }];
  const challengeAiDeck = [{ id: 'delta' }];
  const challengeSession = createPveSession(root, {
    modeKey: 'challenge',
    deck: challengeDeck,
    aiPreset: { deck: challengeAiDeck }
  });
  const challengeStored = __getStoredConfig();
  assert.equal(challengeStored.modeKey, 'challenge');
  assert.deepEqual(challengeStored.deck, challengeDeck);
  assert.deepEqual(challengeStored.aiPreset.deck, challengeAiDeck);
  const challengeGame = challengeSession.start();
  assert.ok(challengeGame, 'expected challenge session to start');
  const activeChallenge = __getActiveGame();
  assert.equal(activeChallenge.modeKey, 'challenge');
  assert.deepEqual(activeChallenge.unitsAll, challengeDeck);
  assert.deepEqual(activeChallenge.ai.unitsAll, challengeAiDeck);
  challengeSession.stop();

  const arenaDeck = [{ id: 'gamma' }];
  const arenaAiUnits = [{ id: 'sigma' }];
  const arenaSession = createPveSession(root, {
    modeKey: 'arena',
    deck: arenaDeck,
    aiPreset: { unitsAll: arenaAiUnits }
  });
  const arenaStored = __getStoredConfig();
  assert.equal(arenaStored.modeKey, 'arena');
  assert.deepEqual(arenaStored.deck, arenaDeck);
  assert.deepEqual(arenaStored.aiPreset.unitsAll, arenaAiUnits);
  const arenaGame = arenaSession.start();
  assert.ok(arenaGame, 'expected arena session to start');
  const activeArena = __getActiveGame();
  assert.equal(activeArena.modeKey, 'arena');
  assert.deepEqual(activeArena.unitsAll, arenaDeck);
  assert.deepEqual(activeArena.ai.unitsAll, arenaAiUnits);
  arenaSession.stop();

  assert.notEqual(campaignStored.modeKey, challengeStored.modeKey);
  assert.notEqual(challengeStored.modeKey, arenaStored.modeKey);
});
