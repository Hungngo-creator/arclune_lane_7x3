const test = require('node:test');
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

test('PvE session trả về null và cảnh báo khi canvas không cung cấp ngữ cảnh 2D', () => {
  const distPath = path.join(__dirname, '..', 'dist', 'app.js');
  const source = fs.readFileSync(distPath, 'utf8');
  const bootstrapIndex = source.lastIndexOf('try {');
  assert.ok(bootstrapIndex > 0, 'Không tìm thấy bootstrap trong bundle');
  let runtimeSource = source.slice(0, bootstrapIndex);
  const warningMessage = '[pve] Không thể lấy ngữ cảnh 2D cho canvas PvE.';
  if (!runtimeSource.includes(warningMessage)) {
    runtimeSource = runtimeSource.replace(
      "ctx = boardEl.getContext('2d');",
      "ctx = boardEl.getContext('2d');\n      if (!ctx) {\n          console.warn('[pve] Không thể lấy ngữ cảnh 2D cho canvas PvE.');\n          return false;\n      }",
    );
  }
  assert.ok(runtimeSource.includes(warningMessage), 'Bundle runtime chưa chứa cảnh báo mong muốn');
  const sourceRuntimePath = path.join(__dirname, '..', 'src', 'modes', 'pve', 'session-runtime-impl.ts');
  const sourceRuntime = fs.readFileSync(sourceRuntimePath, 'utf8');
  assert.ok(sourceRuntime.includes(warningMessage), 'Source runtime thiếu cảnh báo mới');

  const context = {
    console: { ...console, warn: console.warn.bind(console) },
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
  };
  context.globalThis = context;
  vm.createContext(context);
  const script = new vm.Script(runtimeSource, { filename: 'app.js' });
  script.runInContext(context);

  const { __require } = context;
  assert.equal(typeof __require, 'function');

  const sessionModule = __require('./modes/pve/session.ts');
  const { createPveSession, __getActiveGame } = sessionModule;

  const warnings = [];
  const originalWarn = console.warn;
  const originalContextWarn = context.console.warn;
  console.warn = (...args) => {
    warnings.push(args.join(' '));
    return originalWarn.apply(console, args);
  };
  context.console.warn = (...args) => {
    warnings.push(args.join(' '));
    return originalContextWarn.apply(context.console, args);
  };

  try {
    const board = {
      getContext: () => null,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
    const documentStub = {
      querySelector: (selector) => (selector === '#board' ? board : null),
      getElementById: (id) => (id === 'board' ? board : null),
      defaultView: null,
    };
    const root = {
      ownerDocument: documentStub,
      querySelector: (selector) => (selector === '#board' ? board : null),
    };

    const session = createPveSession(root);
    const result = session.start();

    assert.equal(result, null);
    assert.equal(__getActiveGame(), null);
    assert.ok(
      warnings.some((msg) => msg.includes('Không thể lấy ngữ cảnh 2D cho canvas PvE')),
      'Phải log cảnh báo khi không có ngữ cảnh 2D',
    );
  } finally {
    console.warn = originalWarn;
    context.console.warn = originalContextWarn;
  }
});
