const assert = require('node:assert/strict');
const test = require('node:test');
const esbuild = require('../tools/esbuild-stub');
const fallbackTypeScript = require('../tools/typescript-transpiler/strip-typescript');

test('fallback transpiler strips TypeScript while preserving the ES2023 target', async () => {
  const source = 'const result: number = input?.value ?? fallback;';
  const { code } = await esbuild.transform(source, { loader: 'ts' });

  assert.doesNotMatch(code, /:\s*number/);
  assert.match(code, /\?\./);
  assert.match(code, /\?\?/);
});

test('offline fallback removes optional parameter markers from emitted JavaScript', () => {
  const source = 'function lengthOf(value?: readonly string[] | null) { return value?.length ?? 0; }';
  const code = fallbackTypeScript.transpile(source);

  assert.match(code, /function lengthOf\(value\)/);
  assert.doesNotThrow(() => new Function(code));
  assert.match(code, /value\?\.length/);
});