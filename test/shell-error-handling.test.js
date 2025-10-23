const test = require('node:test');
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

function loadShell(){
  const filePath = path.resolve(__dirname, '../src/app/shell.ts');
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true
    }
  });
  const context = {
    module: { exports: {} },
    exports: {},
    require,
    console
  };
  vm.createContext(context);
  const script = new vm.Script(transpiled.outputText, { filename: 'shell.ts' });
  script.runInContext(context);
  return context.module.exports;
}

const { createAppShell } = loadShell();

test('listeners that throw trigger the configured error handler', () => {
  const captured = [];
  const shell = createAppShell();
  shell.setErrorHandler((error, context) => {
    captured.push({ error, context });
  });

  const subscribeError = new Error('subscribe failure');
  const unsubscribe = shell.onChange(() => {
    throw subscribeError;
  });

  assert.equal(captured.length, 1);
  assert.strictEqual(captured[0].error, subscribeError);
  assert.equal(captured[0].context?.phase, 'subscribe');

  unsubscribe();

  const notifyError = new Error('notify failure');
  let callCount = 0;
  shell.onChange(() => {
    callCount += 1;
    if (callCount > 1){
      throw notifyError;
    }
  });

  shell.enterScreen('collection');

  assert.equal(captured.length, 2);
  assert.strictEqual(captured[1].error, notifyError);
  assert.equal(captured[1].context?.phase, 'notify');
});

test('onError option is used when provided', () => {
  const captured = [];
  const shell = createAppShell({
    onError(error, context){
      captured.push({ error, context });
    }
  });

  const boom = new Error('option handler failure');
  shell.onChange(() => {
    throw boom;
  });

  assert.equal(captured.length, 1);
  assert.strictEqual(captured[0].error, boom);
});
