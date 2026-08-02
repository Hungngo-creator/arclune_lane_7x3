import assert from 'node:assert/strict';
import { writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { verifyAetherBundle } from '../tools/verify-aether-bundle.mjs';

const bundlePath = path.join(tmpdir(), `arclune-aether-bundle-${process.pid}.js`);

test.after(async () => {
  await rm(bundlePath, { force: true });
});

test('accepts transformed bundles without depending on call formatting', async () => {
  await writeFile(bundlePath, 'projectLeaderGroundPos;backOffsetX;globalAetherPool.syncAllVisuals(a,b,c,{enemy:e,ally:a});');

  assert.equal(verifyAetherBundle(bundlePath).ok, true);
});

test('still rejects bundles without the Aether visual sync API', async () => {
  await writeFile(bundlePath, 'projectLeaderGroundPos;backOffsetX;');

  const result = verifyAetherBundle(bundlePath);
  assert.equal(result.ok, false);
  assert.deepEqual(result.missing, ['/syncAllVisuals/']);
});

