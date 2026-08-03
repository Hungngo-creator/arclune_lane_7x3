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

test('fallback transform applies define tokens to TypeScript and JavaScript without changing text', async () => {
  const define = {
    'process.env.NODE_ENV': '"production"',
    'import.meta.env.MODE': '"production"',
    __DEV__: 'false',
  };
  for (const loader of ['ts', 'js']) {
    const source = `const mode${loader === 'ts' ? ': string' : ''} = process.env.NODE_ENV;
      const meta = import.meta.env.MODE; const enabled = __DEV__;
      const text = "process.env.NODE_ENV import.meta.env.MODE __DEV__";
      // process.env.NODE_ENV import.meta.env.MODE __DEV__`;
    const { code } = await esbuild.transform(source, { loader, define });
    assert.match(code, /mode\s*=\s*"production"/);
    assert.match(code, /meta\s*=\s*"production"/);
    assert.match(code, /enabled\s*=\s*false/);
    assert.match(code, /"process\.env\.NODE_ENV import\.meta\.env\.MODE __DEV__"/);
    assert.match(code, /\/\/ process\.env\.NODE_ENV import\.meta\.env\.MODE __DEV__/);
  }
});

test('fallback build forwards define options through its transform path', async () => {
  const result = await esbuild.build({
    stdin: { contents: 'globalThis.mode = process.env.NODE_ENV; globalThis.dev = __DEV__;', loader: 'js', sourcefile: 'entry.js' },
    write: false,
    define: { 'process.env.NODE_ENV': '"development"', __DEV__: 'true' },
  });
  assert.match(result.outputFiles[0].text, /globalThis\.mode = "development"/);
  assert.match(result.outputFiles[0].text, /globalThis\.dev = true/);
  assert.doesNotMatch(result.outputFiles[0].text, /process\.env\.NODE_ENV/);
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

test('offline runtime uses Node type stripping for the complete ai module', () => {
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
  assert.equal(result.stdout, 'node-strip');
});