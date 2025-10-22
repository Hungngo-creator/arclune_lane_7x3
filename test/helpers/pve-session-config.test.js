const path = require('path');
const fs = require('fs');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

const backgroundConfigs = new Map();
const backgroundModule = {
  drawEnvironmentProps() {},
  getEnvironmentBackground(key) {
    return backgroundConfigs.get(key);
  },
  __setBackgroundConfig(key, config) {
    backgroundConfigs.set(key, config);
  },
  __clearBackgroundConfigs() {
    backgroundConfigs.clear();
  }
};

const stubModules = new Map([
  ['./turns.ts', {
    stepTurn() {},
    doActionOrSkip() {}
  }],
  ['./summon.ts', {
    enqueueImmediate() {},
    processActionChain() {}
  }],
  ['./ai.ts', {
    refillDeckEnemy() {},
    aiMaybeAct() {}
  }],
  ['./statuses.ts', {
    Statuses: {}
  }],
  ['./config.js', {
    CAM: { landscape_oblique: {} },
    CFG: {
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
    }
  }],
  ['./units.ts', {
    UNITS: []
  }],
  ['./meta.js', {
    Meta: {},
    makeInstanceStats() { return {}; },
    initialRageFor() { return 0; }
  }],
  ['./combat.js', {
    basicAttack() {},
    pickTarget() { return null; },
    dealAbilityDamage() {},
    healUnit() {},
    grantShield() {},
    applyDamage() {}
  }],
  ['./catalog.js', {
    ROSTER: [],
    ROSTER_MAP: new Map(),
    CLASS_BASE: {},
    RANK_MULT: {},
    getMetaById() { return null; },
    isSummoner() { return false; },
    applyRankAndMods(meta) { return meta; }
  }],
  ['./engine.js', {
    makeGrid() {
      return { tile: 1, cols: 7, rows: 6, ox: 0, oy: 0, dpr: 1, w: 700, h: 600 };
    },
    drawGridOblique() {},
    drawTokensOblique() {},
    drawQueuedOblique() {},
    hitToCellOblique() { return { cx: 0, cy: 0 }; },
    projectCellOblique() { return { x: 0, y: 0 }; },
    cellOccupied() { return false; },
    spawnLeaders(tokens) {
      tokens.push(
        { id: 'leaderA', side: 'ally', alive: true, cx: 0, cy: 0 },
        { id: 'leaderB', side: 'enemy', alive: true, cx: 1, cy: 1 }
      );
    },
    pickRandom() { return []; },
    slotIndex() { return 0; },
    slotToCell() { return { cx: 0, cy: 0 }; },
    cellReserved() { return false; },
    ORDER_ENEMY: [],
    ART_SPRITE_EVENT: 'art:sprite'
  }],
  ['./background.js', backgroundModule],
  ['./art.js', {
    getUnitArt() { return {}; },
    setUnitSkin() { return true; }
  }],
  ['./ui.js', {
    initHUD() {
      return { update() {}, cleanup() {} };
    },
    startSummonBar() {
      return { render() {} };
    }
  }],
  ['./vfx.js', {
    vfxDraw() {},
    vfxAddSpawn() {},
    vfxAddHit() {},
    vfxAddMelee() {}
  }],
  ['./scene.js', {
    drawBattlefieldScene() {},
    getCachedBattlefieldScene() { return null; }
  }],
  ['./events.js', {
    gameEvents: {
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {}
    },
    TURN_START: 'TURN_START',
    TURN_END: 'TURN_END',
    ACTION_START: 'ACTION_START',
    ACTION_END: 'ACTION_END',
    emitGameEvent() {}
  }],
  ['./utils/dummy.js', {
    ensureNestedModuleSupport() {}
  }],
  ['./utils/time.js', {
    safeNow() { return 0; }
  }]
]);

const moduleCache = new Map();

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

function loadModule(id) {
  if (stubModules.has(id)) {
    return stubModules.get(id);
  }
  if (moduleCache.has(id)) {
    return moduleCache.get(id).exports;
  }
  const filename = path.join(SRC_DIR, id.slice(2));
  const source = fs.readFileSync(filename, 'utf8');
  const transformed = transformModule(source, id);
  const module = { exports: {} };
  moduleCache.set(id, module);

  const context = vm.createContext({
    module,
    exports: module.exports,
    __require(specifier) {
      if (stubModules.has(specifier)) {
        return stubModules.get(specifier);
      }
      if (!specifier.startsWith('.')) {
        throw new Error(`Unsupported import: ${specifier}`);
      }
      const depId = resolveImport(id, specifier);
      return loadModule(depId);
    },
    console,
    setTimeout,
    clearTimeout,
    Map,
    Set,
    WeakSet,
    WeakMap,
    Array,
    Object,
    Number,
    String,
    Boolean,
    Math,
    Date,
    RegExp,
    JSON
  });
  context.globalThis = context;
  context.self = context;
  context.window = null;
  context.document = null;

  const script = new vm.Script(transformed, { filename });
  script.runInContext(context);
  return module.exports;
}

function clearModuleCache() {
  moduleCache.clear();
}

function loadSessionModule() {
  return loadModule('./modes/pve/session.js');
}

module.exports = {
  loadSessionModule,
  clearModuleCache,
  backgroundModule,
  stubModules
};
