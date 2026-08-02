const assert = require('node:assert/strict');
const test = require('node:test');
const { spawnSync } = require('node:child_process');
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

test('offline fallback removes an untyped optional parameter across multiple lines', () => {
  const source = `function queueEnemyAt(
    game,
    aliveTokens?,
  ) { return aliveTokens?.length ?? game.tokens.length; }`;
  const code = fallbackTypeScript.transpile(source);

  assert.match(code, /aliveTokens,\s*\)/);
  assert.doesNotThrow(() => new Function(code));
  assert.match(code, /aliveTokens\?\.length/);
});

test('offline fallback preserves object values containing strict equality', () => {
  const source = `const cards = input.map((card: Card) => ({
    name: typeof card.name === 'string' ? card.name : undefined,
  }));`;
  const code = fallbackTypeScript.transpile(source);

  assert.match(code, /name:\s*typeof card\.name === 'string'/);
  assert.doesNotThrow(() => new Function('input', code));
});

test('offline fallback preserves a ternary object property containing a call', () => {
  const source = `const request = {
    mutationBonusPct: Number.isFinite(card.mutationBonusPct) ? Number(card.mutationBonusPct) : undefined,
  };`;
  const code = fallbackTypeScript.transpile(source);

  assert.match(code, /mutationBonusPct:\s*Number\.isFinite\(card\.mutationBonusPct\)\s*\?\s*Number\(card\.mutationBonusPct\)\s*:\s*undefined/);
  assert.doesNotThrow(() => new Function('card', `${code}; return request;`));
});

test('installed esbuild stub uses the current repository transpiler', async () => {
  const installedEsbuild = require('../node_modules/esbuild');
  const source = `const cards = input.map((card: Card) => ({
    name: typeof card.name === 'string' ? card.name : undefined,
  }));`;
  const { code } = await installedEsbuild.transform(source, { loader: 'ts' });

  assert.match(code, /name:\s*typeof card\.name === 'string'/);
  assert.doesNotThrow(() => new Function('input', code));
});

test('offline runtime uses a parser-backed transform for the complete ai module', () => {
  const script = `
    const fs = require('node:fs');
    const vm = require('node:vm');
    const ts = require('./tools/typescript-transpiler');
    const source = fs.readFileSync('./src/ai.ts', 'utf8');
    const result = ts.transpileModule(source, { fileName: './ai.ts', compilerOptions: {} });
    new vm.SourceTextModule(result.outputText);
    process.stdout.write(ts.__arcTransformerKind || 'unknown');
  `;
  const result = spawnSync(process.execPath, ['--experimental-vm-modules', '-e', script], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, ARCLUNE_DISABLE_TYPESCRIPT_RUNTIME: '1' },
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'node-parser');
});