const test = require('node:test');
const assert = require('assert/strict');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

class ElementStub {
  constructor(tag){
    this.tagName = tag;
    this.children = [];
    this.attributes = new Map();
    this.style = {};
    this.innerHTML = '';
    this.className = '';
    this.classList = {
      add() {},
      remove() {},
      contains() { return false; }
    };
  }

  setAttribute(name, value){
    this.attributes.set(name, value);
  }

  appendChild(child){
    this.children.push(child);
    return child;
  }

  remove(){
    this.removed = true;
  }

  querySelector(selector){
    if (selector === '#board'){
      if (!this._board){
        this._board = new ElementStub('canvas');
        this._board.id = 'board';
      }
      return this._board;
    }
    if (selector === '[data-action="exit"]'){
      if (!this._exit){
        this._exit = { addEventListener() {} };
      }
      return this._exit;
    }
    return null;
  }
}

function createDocumentStub(){
  const body = new ElementStub('body');
  return {
    body,
    createElement(tag){
      return new ElementStub(tag);
    },
    getElementById(){
      return null;
    }
  };
}

function createWindowStub(){
  return {
    location: { protocol: 'https:' },
    requestAnimationFrame(cb){ cb(); },
    alert() {},
    dispatchEvent() {},
    addEventListener() {},
    removeEventListener() {}
  };
}

class FakeEvent {
  constructor(type){
    this.type = type;
  }
}

const MODE_STATUS = {
  AVAILABLE: 'available',
  COMING_SOON: 'coming-soon',
  PLANNED: 'planned'
};

const stubSessionCalls = {
  create: null,
  start: null
};

const stubModules = new Map([
  ['./app/shell.js', {
    createAppShell(){
      return {
        onChange() {},
        setActiveSession() {},
        getState(){
          return { activeSession: null };
        },
        enterScreen() {}
      };
    }
  }],
  ['./screens/main-menu/view.js', {
    renderMainMenuView(){
      return {
        destroy() {}
      };
    }
  }],
  ['./data/modes.js', {
    MODES: [
      {
        id: 'campaign',
        title: 'Campaign',
        type: 'pve',
        shortDescription: 'desc',
        icon: 'icon',
        status: MODE_STATUS.AVAILABLE,
        shell: {
          screenId: 'pve-session',
          moduleId: './modes/pve/session.test.stub.js',
          defaultParams: {
            modeKey: 'campaign',
            modeFlavor: 'story',
            extraDefault: 'fromDefault',
            sessionConfig: {
              difficulty: 'normal',
              backgroundKey: 'forest'
            }
          }
        }
      }
    ],
    MODE_GROUPS: [],
    MODE_STATUS,
    getMenuSections(){
      return [];
    }
  }],
  ['./modes/pve/session.test.stub.js', {
    createPveSession(container, options){
      stubSessionCalls.create = { container, options };
      return {
        start(startConfig){
          stubSessionCalls.start = startConfig;
          return { ok: true };
        },
        stop() {},
        updateConfig() {},
        setUnitSkin(){ return true; }
      };
    }
  }],
  ['./modes/coming-soon.stub.js', { comingSoon: true }]
]);

const moduleCache = new Map();
let sharedWindow = createWindowStub();
let sharedDocument = createDocumentStub();

function resolveImport(fromId, specifier){
  const fromPath = path.join(SRC_DIR, fromId.slice(2));
  const resolvedPath = path.resolve(path.dirname(fromPath), specifier);
  const relative = path.relative(SRC_DIR, resolvedPath).split(path.sep).join('/');
  return `./${relative}`;
}

function transformModule(code, id){
  const exportsAssignments = [];
  const usedAliases = new Set();
  let depIndex = 0;
  const reExportRegex = /export\s*{([\s\S]*?)}\s*from\s*['\"](.+?)['\"];?/g;
  code = code.replace(reExportRegex, (match, spec, source) => {
    const depId = resolveImport(id, source.trim());
    const moduleVar = `__reexport${depIndex++}`;
    const lines = [`const ${moduleVar} = __require('${depId}');`];
    const parts = spec.split(',').map((p) => p.trim()).filter(Boolean);
    for (const part of parts){
      if (!part) continue;
      const [importedRaw, localRaw] = part.split(/\s+as\s+/);
      const imported = importedRaw.trim();
      const local = (localRaw || importedRaw).trim();
      if (!usedAliases.has(local)){
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
    const cleaned = clause.trim();
    if (cleaned.startsWith('{') && cleaned.endsWith('}')){
      const inside = cleaned.slice(1, -1);
      const parts = inside.split(',').map((p) => p.trim()).filter(Boolean);
      for (const part of parts){
        if (!part) continue;
        const [importedRaw, localRaw] = part.split(/\s+as\s+/);
        const imported = importedRaw.trim();
        const local = (localRaw || importedRaw).trim();
        lines.push(`const ${local} = ${moduleVar}.${imported};`);
      }
    } else if (cleaned){
      lines.push(`const ${cleaned} = ${moduleVar}.default || ${moduleVar};`);
    }
    return lines.join('\n');
  });

  const exportNamedRegex = /export\s*{([\s\S]*?)}\s*;/g;
  code = code.replace(exportNamedRegex, (match, spec) => {
    const parts = spec.split(',').map((p) => p.trim()).filter(Boolean);
    const lines = [];
    for (const part of parts){
      if (!part) continue;
      const [localRaw, aliasRaw] = part.split(/\s+as\s+/);
      const local = localRaw.trim();
      const alias = (aliasRaw || localRaw).trim();
      if (!usedAliases.has(alias)){
        usedAliases.add(alias);
        lines.push(`exports.${alias} = ${local};`);
      }
    }
    return lines.join('\n');
  });

  const exportConstRegex = /export\s+(const|let|var)\s+([A-Za-z0-9_$]+)/g;
  code = code.replace(exportConstRegex, (match, kind, name) => {
    if (!usedAliases.has(name)){
      usedAliases.add(name);
      exportsAssignments.push({ alias: name, expr: name });
    }
    return `${kind} ${name}`;
  });

  const exportFunctionRegex = /export\s+function\s+([A-Za-z0-9_$]+)/g;
  code = code.replace(exportFunctionRegex, (match, name) => {
    if (!usedAliases.has(name)){
      usedAliases.add(name);
      exportsAssignments.push({ alias: name, expr: name });
    }
    return `function ${name}`;
  });

  const footerLines = exportsAssignments
    .filter((item, index, arr) => index === arr.findIndex((it) => it.alias === item.alias))
    .map(({ alias, expr }) => `exports.${alias} = ${expr};`);

  let transformed = footerLines.length
    ? `${code}\n${footerLines.join('\n')}`
    : code;

  if (id === './entry.js'){
    transformed = transformed
      .replace(/\(function bootstrap\(\)\s*\{/, 'function bootstrap(){')
      .replace(/\}\)\(\);\s*$/, '}\nexports.__bootstrap = bootstrap;');
    transformed += `\nexports.__mountPveScreen = mountPveScreen;`;
    transformed += `\nexports.__setShellInstance = (inst) => { shellInstance = inst; };`;
    transformed += `\nexports.__setRootElement = (el) => { rootElement = el; };`;
  }

  return transformed;
}

function loadModule(id){
  if (stubModules.has(id)){
    return stubModules.get(id);
  }
  if (moduleCache.has(id)){
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
    __require(specifier){
      if (stubModules.has(specifier)){
        return stubModules.get(specifier);
      }
      if (!specifier.startsWith('.')){
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
    WeakMap,
    WeakSet,
    Array,
    Object,
    Number,
    String,
    Boolean,
    Math,
    Date,
    RegExp,
    JSON,
    Event: FakeEvent
  });
  context.globalThis = context;
  context.self = context;
  context.window = sharedWindow;
  context.document = sharedDocument;
  const script = new vm.Script(transformed, { filename });
  script.runInContext(context);
  return module.exports;
}

test('mountPveScreen merges PvE session config for create and start', async () => {
  stubSessionCalls.create = null;
  stubSessionCalls.start = null;
  sharedWindow = createWindowStub();
  sharedDocument = createDocumentStub();
  const entry = loadModule('./entry.js');
  const rootElement = new ElementStub('div');
  rootElement.classList = {
    add() {},
    remove() {},
    contains() { return false; }
  };
  rootElement.appendChild = function(child){
    this.children.push(child);
    return child;
  };
  entry.__setRootElement(rootElement);
  const shellStub = {
    _state: { activeSession: null },
    getState(){
      return this._state;
    },
    setActiveSession(session){
      this._state.activeSession = session;
    },
    enterScreenCalls: [],
    enterScreen(screen){
      this.enterScreenCalls.push(screen);
    }
  };
  entry.__setShellInstance(shellStub);
  const params = {
    modeKey: 'campaign',
    extraDefault: 'fromOverride',
    customTop: 'value',
    sessionConfig: {
      backgroundKey: 'desert',
      extra: true
    }
  };

  await entry.__mountPveScreen(params);

  assert.ok(stubSessionCalls.create, 'createPveSession was not invoked');
  assert.ok(stubSessionCalls.start, 'session.start was not invoked');

  const createOptions = stubSessionCalls.create.options;
  assert.equal(createOptions.modeKey, 'campaign');
  assert.equal(createOptions.modeFlavor, 'story');
  assert.equal(createOptions.extraDefault, 'fromOverride');
  assert.equal(createOptions.customTop, 'value');
  const normalizedSessionConfig = { ...createOptions.sessionConfig };
  assert.deepStrictEqual(normalizedSessionConfig, {
    difficulty: 'normal',
    backgroundKey: 'desert',
    extra: true
  });

  const startOptions = stubSessionCalls.start;
  assert.equal(startOptions.modeKey, 'campaign');
  assert.equal(startOptions.modeFlavor, 'story');
  assert.equal(startOptions.extraDefault, 'fromOverride');
  assert.equal(startOptions.customTop, 'value');
  assert.equal(startOptions.backgroundKey, 'desert');
  assert.equal(startOptions.difficulty, 'normal');
  assert.equal(startOptions.extra, true);
  assert.ok(startOptions.root, 'start config missing root element');
  assert.equal(startOptions.root.tagName, 'div');
});
