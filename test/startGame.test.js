const test = require('node:test');
const assert = require('assert/strict');
const path = require('path');
const fs = require('fs/promises');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

const stubModules = new Map([
  ['./turns.js', `
    export function stepTurn() {}
    export function doActionOrSkip() {}
  `],
  ['./summon.js', `
    export function enqueueImmediate() {}
    export function processActionChain() {}
  `],
  ['./ai.js', `
    export function refillDeckEnemy() {}
    export function aiMaybeAct() {}
  `],
  ['./statuses.js', `
    export const Statuses = {};
  `],
  ['./config.js', `
    export const CAM = { landscape_oblique: {} };
    export const CFG = {
      CAMERA: 'landscape_oblique',
      HAND_SIZE: 3,
      COST_CAP: 30,
      SUMMON_LIMIT: 3,
      SCENE: {},
      CURRENT_BACKGROUND: null,
      ALLY_COLS: 3,
      GRID_COLS: 7,
      GRID_ROWS: 6,
      UI: {},
      DEBUG: null
    };
  `],
  ['./units.js', `
    export const UNITS = [];
  `],
  ['./meta.js', `
    export const Meta = {};
    export function makeInstanceStats() { return {}; }
    export function initialRageFor() { return 0; }
  `],
  ['./combat.js', `
    export function basicAttack() {}
    export function pickTarget() { return null; }
    export function dealAbilityDamage() {}
    export function healUnit() {}
    export function grantShield() {}
    export function applyDamage() {}
  `],
  ['./catalog.js', `
    export const ROSTER = [];
    export const ROSTER_MAP = new Map();
    export const CLASS_BASE = {};
    export const RANK_MULT = {};
    export function getMetaById() { return null; }
    export function isSummoner() { return false; }
    export function applyRankAndMods(meta) { return meta; }
  `],
  ['./engine.js', `
    export function makeGrid(canvas, cols, rows) {
      return { tile: 1, cols, rows, ox: 0, oy: 0 };
    }
    export function drawGridOblique() {}
    export function drawTokensOblique() {}
    export function drawQueuedOblique() {}
    export function hitToCellOblique() { return { cx: 0, cy: 0 }; }
    export function projectCellOblique() { return { x: 0, y: 0 }; }
    export function cellOccupied() { return false; }
    export function spawnLeaders(tokens) {
      tokens.push(
        { id: 'leaderA', side: 'ally', alive: true, cx: 0, cy: 0 },
        { id: 'leaderB', side: 'enemy', alive: true, cx: 1, cy: 1 }
      );
    }
    export function pickRandom() { return []; }
    export function slotIndex() { return 0; }
    export function slotToCell() { return { cx: 0, cy: 0 }; }
    export function cellReserved() { return false; }
    export const ORDER_ENEMY = [];
    export const ART_SPRITE_EVENT = 'art:sprite';
  `],
  ['./background.js', `
    export function drawEnvironmentProps() {}
  `],
  ['./art.js', `
    export function getUnitArt() { return {}; }
    export function setUnitSkin() { return true; }
  `],
  ['./ui.js', `
    let initHudCalls = 0;
    export function initHUD(doc, root) {
      initHudCalls += 1;
      return { update() {} };
    }
    export function startSummonBar(doc, options, root) {
      return { render() {} };
    }
    export function __getInitHudCalls() {
      return initHudCalls;
    }
  `],
  ['./vfx.js', `
    export function vfxAddSpawn() {}
    export function vfxAddHit() {}
    export function vfxAddMelee() {}
    export function vfxDraw() {}
  `],
  ['./scene.js', `
    export function drawBattlefieldScene() {}
  `],
  ['./events.js', `
    const listeners = new Map();
    export const gameEvents = {
      addEventListener(type, handler) {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type).add(handler);
      },
      removeEventListener(type, handler) {
        const set = listeners.get(type);
        if (!set) return;
        set.delete(handler);
      },
      dispatchEvent(event) {
        const set = listeners.get(event?.type);
        if (!set) return;
        for (const handler of set) {
          handler.call(null, event);
        }
      }
    };
    export const TURN_START = 'TURN_START';
    export const TURN_END = 'TURN_END';
    export const ACTION_START = 'ACTION_START';
    export const ACTION_END = 'ACTION_END';
    export function emitGameEvent() {}
  `]
]);

function createImportReplacement(specifiers, moduleVar) {
  const lines = [];
  const cleaned = specifiers.trim();
  if (!cleaned.startsWith('{') || !cleaned.endsWith('}')) {
    throw new Error(`Unsupported import clause: ${specifiers}`);
  }
  const inside = cleaned.slice(1, -1);
  const parts = inside.split(',').map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    if (!part) continue;
    const [importedRaw, localRaw] = part.split(/\s+as\s+/);
    const imported = importedRaw.trim();
    const local = (localRaw || importedRaw).trim();
    lines.push(`const ${local} = ${moduleVar}.${imported};`);
  }
  return lines;
}

function resolveImport(fromId, specifier) {
  if (!specifier.startsWith('.')) {
    throw new Error(`Unsupported import: ${specifier}`);
  }
  const fromPath = path.join(SRC_DIR, fromId.slice(2));
  const resolvedPath = path.resolve(path.dirname(fromPath), specifier);
  const relative = path.relative(SRC_DIR, resolvedPath).split(path.sep).join('/');
  return `./${relative}`;
}

function transformModule(code, id) {
  const exportsAssignments = [];
  const usedAliases = new Set();
  let depIndex = 0;
  const reExportRegex = /export\s*{([\s\S]*?)}\s*from\s*['\"](.+?)['\"];?/g;
  code = code.replace(reExportRegex, (match, spec, source) => {
    const depId = resolveImport(id, source.trim());
    const moduleVar = `__reexport${depIndex++}`;
    const lines = [`const ${moduleVar} = __require('${depId}');`];
    const parts = spec.split(',').map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      if (!part) continue;
      const [importedRaw, localRaw] = part.split(/\s+as\s+/);
      const imported = importedRaw.trim();
      const local = (localRaw || importedRaw).trim();
      if (!usedAliases.has(local)) {
        usedAliases.add(local);
        exportsAssignments.push({ alias: local, expr: `${moduleVar}.${imported}` });
      }
    }
    return lines.join('\n');
  });

  const importRegex = /import\s*([\s\S]*?)\s*from\s*['\"](.+?)['\"];?/g;
  code = code.replace(importRegex, (match, clause, source) => {
    const depId = resolveImport(id, source.trim());
    const moduleVar = `__dep${depIndex++}`;
    const lines = [`const ${moduleVar} = __require('${depId}');`];
    const importLines = createImportReplacement(clause, moduleVar);
    lines.push(...importLines);
    return lines.join('\n');
  });

  const exportNamedRegex = /export\s*{([\s\S]*?)}\s*;/g;
  code = code.replace(exportNamedRegex, (match, spec) => {
    const parts = spec.split(',').map((p) => p.trim()).filter(Boolean);
    const lines = [];
    for (const part of parts) {
      if (!part) continue;
      const [localRaw, aliasRaw] = part.split(/\s+as\s+/);
      const local = localRaw.trim();
      const alias = (aliasRaw || localRaw).trim();
      if (!usedAliases.has(alias)) {
        usedAliases.add(alias);
        lines.push(`exports.${alias} = ${local};`);
      }
    }
    return lines.join('\n');
  });

  const exportConstRegex = /export\s+(const|let|var)\s+([A-Za-z0-9_$]+)/g;
  code = code.replace(exportConstRegex, (match, kind, name) => {
    if (!usedAliases.has(name)) {
      usedAliases.add(name);
      exportsAssignments.push({ alias: name, expr: name });
    }
    return `${kind} ${name}`;
  });

  const exportFunctionRegex = /export\s+function\s+([A-Za-z0-9_$]+)/g;
  code = code.replace(exportFunctionRegex, (match, name) => {
    if (!usedAliases.has(name)) {
      usedAliases.add(name);
      exportsAssignments.push({ alias: name, expr: name });
    }
    return `function ${name}`;
  });

  const footerLines = exportsAssignments
    .filter((item, index, arr) => index === arr.findIndex((it) => it.alias === item.alias))
    .map(({ alias, expr }) => `exports.${alias} = ${expr};`);

  const transformed = footerLines.length
    ? `${code}\n${footerLines.join('\n')}`
    : code;

  return transformed;
}

function createCanvasContext() {
  return {
    canvas: null,
    save() {},
    restore() {},
    clearRect() {},
    setTransform() {},
    resetTransform() {},
    scale() {},
    createLinearGradient() {
      return { addColorStop() {} };
    },
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    fill() {},
    stroke() {},
    arc() {},
    rect() {},
    createPattern() { return null; },
    createRadialGradient() {
      return { addColorStop() {} };
    },
    measureText() {
      return { width: 0 };
    },
    set fillStyle(_) {},
    set strokeStyle(_) {},
    set lineWidth(_) {}
  };
}

function createCanvasElement() {
  const listeners = {};
  const ctx = createCanvasContext();
  const canvas = {
    width: 640,
    height: 360,
    style: {},
    addEventListener(type, handler) {
      (listeners[type] ??= []).push(handler);
    },
    removeEventListener(type, handler) {
      const arr = listeners[type];
      if (!arr) return;
      const idx = arr.indexOf(handler);
      if (idx >= 0) arr.splice(idx, 1);
    },
    getContext() {
      return ctx;
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, width: canvas.width, height: canvas.height };
    }
  };
  Object.defineProperty(canvas, 'clientWidth', {
    get() {
      return canvas.width;
    }
  });
  Object.defineProperty(canvas, 'clientHeight', {
    get() {
      return canvas.height;
    }
  });
  return canvas;
}

function createDocument(boardFlag) {
  const listeners = {};
  const board = createCanvasElement();
  const timerEl = { textContent: '' };
  const costNow = { textContent: '' };
  const costRing = { style: { setProperty() {} } };
  const costChip = { classList: { toggle() {} } };
  const cardsHost = {
    innerHTML: '',
    children: [],
    style: { setProperty() {} },
    classList: { toggle() {} },
    addEventListener() {},
    appendChild(node) {
      this.children.push(node);
    },
    querySelector() {
      return null;
    },
    contains() {
      return true;
    }
  };
  return {
    hidden: false,
    _listeners: listeners,
    addEventListener(type, handler) {
      (listeners[type] ??= []).push(handler);
    },
    removeEventListener(type, handler) {
      const arr = listeners[type];
      if (!arr) return;
      const idx = arr.indexOf(handler);
      if (idx >= 0) arr.splice(idx, 1);
    },
    dispatchEvent(event) {
      const arr = listeners[event?.type] || [];
      for (const handler of arr.slice()) {
        handler.call(this, event);
      }
    },
    getElementById(id) {
      switch (id) {
        case 'board':
          return boardFlag.value ? board : null;
        case 'timer':
          return timerEl;
        case 'costNow':
          return costNow;
        case 'costRing':
          return costRing;
        case 'costChip':
          return costChip;
        case 'cards':
          return cardsHost;
        default:
          return null;
      }
    },
    createElement(tag) {
      return {
        tagName: tag,
        className: '',
        dataset: {},
        innerHTML: '',
        style: { setProperty() {} },
        classList: {
          toggle() {},
          add() {},
          remove() {},
          contains() {
            return false;
          }
        },
        addEventListener() {},
        appendChild() {},
        remove() {},
        querySelector() {
          return null;
        },
        setAttribute() {},
        hidden: false
      };
    },
    body: {
      innerHTML: '',
      appendChild() {},
      contains() {
        return true;
      }
    },
    documentElement: {}
  };
}

function createWindow() {
  const listeners = {};
  return {
    addEventListener(type, handler) {
      (listeners[type] ??= []).push(handler);
    },
    removeEventListener(type, handler) {
      const arr = listeners[type];
      if (!arr) return;
      const idx = arr.indexOf(handler);
      if (idx >= 0) arr.splice(idx, 1);
    },
    dispatchEvent(event) {
      const arr = listeners[event?.type] || [];
      for (const handler of arr.slice()) {
        handler.call(this, event);
      }
    },
    location: { protocol: 'http:' },
    devicePixelRatio: 1
  };
}

function createSandbox(boardFlag) {
  const windowStub = createWindow();
  const documentStub = createDocument(boardFlag);
  let nextIntervalId = 1;
  const performanceStub = {
    now() {
      return 0;
    }
  };
  const sandbox = {
    console,
    window: windowStub,
    document: documentStub,
    performance: performanceStub,
    requestAnimationFrame(callback) {
      this.__lastAnimationFrame = callback;
      return 1;
    },
    cancelAnimationFrame() {},
    setInterval() {
      return nextIntervalId++;
    },
    clearInterval() {},
    setTimeout() {
      return 0;
    },
    clearTimeout() {},
    Map,
    WeakMap,
    Set,
    WeakSet,
    Array,
    Object,
    Number,
    BigInt,
    Boolean,
    String,
    Math,
    Date,
    JSON,
    Reflect,
    Symbol,
    parseInt,
    parseFloat,
    isFinite,
    isNaN,
    Promise,
    queueMicrotask,
    Uint8Array,
    Int8Array,
    Uint16Array,
    Int16Array,
    Uint32Array,
    Int32Array,
    Float32Array,
    Float64Array,
    BigInt64Array,
    BigUint64Array
  };
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  return { sandbox, documentStub };
}

async function compileModuleScripts() {
  const scripts = new Map();
  const addModule = async (id, source) => {
    const transformed = transformModule(source, id);
    const wrapped = `(function(exports, module, __require){\n${transformed}\n})`;
    scripts.set(id, new vm.Script(wrapped, { filename: id }));
  };

  for (const [id, source] of stubModules.entries()) {
    await addModule(id, source);
  }

  const mainSource = await fs.readFile(path.join(SRC_DIR, 'main.js'), 'utf8');
  await addModule('./main.js', mainSource);
  const sessionSource = await fs.readFile(path.join(SRC_DIR, 'modes', 'pve', 'session.js'), 'utf8');
  await addModule('./modes/pve/session.js', sessionSource);
  const dummySource = await fs.readFile(path.join(SRC_DIR, 'utils', 'dummy.js'), 'utf8');
  await addModule('./utils/dummy.js', dummySource);
  return scripts;
}

function createRequire(moduleScripts, sandbox) {
  const cache = new Map();
  function __require(id) {
    if (!moduleScripts.has(id)) {
      throw new Error(`Module not found: ${id}`);
    }
    let record = cache.get(id);
    if (!record) {
      record = {
        exports: {},
        initialized: false,
        script: moduleScripts.get(id)
      };
      cache.set(id, record);
    }
    if (!record.initialized) {
      const previousExports = sandbox.exports;
      const previousModule = sandbox.module;
      const previousRequire = sandbox.__require;
      const module = { exports: record.exports };
      sandbox.exports = module.exports;
      sandbox.module = module;
      sandbox.__require = __require;
      const factory = record.script.runInContext(sandbox);
      factory.call(sandbox, module.exports, module, __require);
      record.exports = module.exports;
      record.initialized = true;
      sandbox.exports = previousExports;
      sandbox.module = previousModule;
      sandbox.__require = previousRequire;
    }
    return record.exports;
  }
  return { require: __require, cache };
}

async function loadMainModule(boardFlag) {
  const moduleScripts = await compileModuleScripts();
  const { sandbox, documentStub } = createSandbox(boardFlag);
  const { require: localRequire, cache } = createRequire(moduleScripts, sandbox);
  const mainExports = localRequire('./main.js');
  return { startGame: mainExports.startGame, documentStub, require: localRequire, moduleCache: cache };
}

test('startGame retries initialization after DOM becomes ready', async () => {
  const boardFlag = { value: false };
  const { startGame, documentStub, require: localRequire } = await loadMainModule(boardFlag);
  const uiModule = localRequire('./ui.js');
  const getInitHudCalls = uiModule.__getInitHudCalls;

  assert.equal(getInitHudCalls(), 0);
  assert.strictEqual((documentStub._listeners.visibilitychange || []).length, 0);

  startGame();
  assert.equal(getInitHudCalls(), 0);
  assert.strictEqual((documentStub._listeners.visibilitychange || []).length, 0);

  boardFlag.value = true;
  startGame();
  assert.equal(getInitHudCalls(), 1);
  assert.strictEqual((documentStub._listeners.visibilitychange || []).length, 1);

  startGame();
  assert.equal(getInitHudCalls(), 1);
});