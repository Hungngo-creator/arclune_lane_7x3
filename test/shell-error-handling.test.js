const test = require('node:test');
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadShell(){
  const filePath = path.resolve(__dirname, '../src/app/shell.js');
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace('export function createAppShell', 'function createAppShell');
  code = code.replace(/\nexport default createAppShell;\s*$/, '\n');
  code += '\nmodule.exports = { createAppShell };\n';
  const context = {
    module: { exports: {} },
    exports: {},
    console
  };
  vm.createContext(context);
  const script = new vm.Script(code, { filename: 'shell.js' });
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
