// @ts-nocheck
const test = require('node:test');
const assert = require('assert/strict');

const {
  loadSessionModule,
  backgroundModule,
  clearModuleCache
} = require('./helpers/pve-session-loader.js');

clearModuleCache();
const sessionModule = loadSessionModule();
const {
  computeBackgroundSignature,
  clearBackgroundSignatureCache,
  __backgroundSignatureCache
} = sessionModule;

function cacheEntryFor(key) {
  return __backgroundSignatureCache.get(`key:${key ?? '__no-key__'}`);
}

test('successful background serialization populates cache for reuse', () => {
  backgroundModule.__clearBackgroundConfigs();
  clearBackgroundSignatureCache();
  const config = { key: 'alpha', theme: 'dawn', props: [{ id: 1 }, { id: 2 }] };
  backgroundModule.__setBackgroundConfig('alpha', config);

  const first = computeBackgroundSignature('alpha');
  const cached = cacheEntryFor('alpha');
  assert.equal(cached.signature, first);
  assert.strictEqual(cached.config, config);

  const second = computeBackgroundSignature('alpha');
  assert.strictEqual(second, first);
  assert.strictEqual(cacheEntryFor('alpha'), cached);
});

test('non-serializable backgrounds fall back to primitive signature without throwing', () => {
  backgroundModule.__clearBackgroundConfigs();
  clearBackgroundSignatureCache();
  const config = { key: 'beta', theme: 'storm', props: [1, 2, 3] };
  Object.defineProperty(config, 'unstable', {
    enumerable: true,
    get() {
      throw new Error('boom');
    }
  });
  backgroundModule.__setBackgroundConfig('beta', config);

  let signature;
  assert.doesNotThrow(() => {
    signature = computeBackgroundSignature('beta');
  });
  assert.equal(signature, 'beta:fallback:beta:storm:3');
  const cached = cacheEntryFor('beta');
  assert.equal(cached.signature, signature);
  assert.strictEqual(cached.config, config);

  const again = computeBackgroundSignature('beta');
  assert.strictEqual(again, signature);
});