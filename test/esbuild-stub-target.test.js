const assert = require('node:assert/strict');
const test = require('node:test');
const esbuild = require('../tools/esbuild-stub');

test('fallback transpiler strips TypeScript while preserving the ES2023 target', async () => {
  const source = 'const result: number = input?.value ?? fallback;';
  const { code } = await esbuild.transform(source, { loader: 'ts' });

  assert.doesNotMatch(code, /:\s*number/);
  assert.match(code, /\?\./);
  assert.match(code, /\?\?/);
});

