const test = require('node:test');
const assert = require('node:assert/strict');
const probes = require('../tools/es-compatibility-probes');

test('extracts the Chromium engine version actually loading the page', () => {
  assert.equal(probes.chromiumMajor('Mozilla/5.0 Chrome/132.0.6834.163 Mobile Safari/537.36'), 132);
  assert.equal(probes.chromiumMajor('unidentified-webview'), null);
});

test('reports only the highest continuously supported edition', () => {
  assert.equal(probes.continuousEdition([
    { name: 'ES2020', supported: true },
    { name: 'ES2021', supported: false },
    { name: 'ES2022', supported: true }
  ]), 'ES2020');
});

test('runs syntax and API checks without putting modern syntax in the probe script parser path', () => {
  const report = probes.run({
    navigator: { userAgent: 'Android WebView Chrome/132.0.0.0' },
    Promise,
    Map,
    Object
  });

  assert.equal(report.chromiumMajor, 132);
  assert.match(report.syntaxEdition, /^ES/);
  assert.equal(report.syntax.find((result) => result.name === 'ES2020').supported, true);
  assert.equal(typeof report.apiEdition, 'string');
});

