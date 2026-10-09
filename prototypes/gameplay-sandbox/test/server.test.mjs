import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';

test('standalone server serves sandbox only with correct MIME and no traversal/mutations', async () => {
  const reserve = createServer(); await new Promise(r => reserve.listen(0, '127.0.0.1', r));
  const port = reserve.address().port; await new Promise(r => reserve.close(r));
  const process = spawn(globalThis.process.execPath, [fileURLToPath(new URL('../serve.mjs', import.meta.url))], { env: { ...globalThis.process.env, SANDBOX_PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Server did not start')), 10000);
      process.stdout.once('data', () => { clearTimeout(timeout); resolve(); });
      process.once('error', reject);
      process.once('exit', code => { if (code) reject(new Error(`Server exited ${code}`)); });
    });
    const root = `http://127.0.0.1:${port}`;
    const index = await fetch(root); assert.equal(index.status, 200); assert.match(await index.text(), /Phòng đấu thử/);
    const js = await fetch(root + '/engine.mjs'); assert.match(js.headers.get('content-type'), /text\/javascript/);
    const head = await fetch(root + '/style.css', { method: 'HEAD' }); assert.equal(head.status, 200); assert.equal(await head.text(), '');
    for (const path of ['/missing.mjs', '/%2e%2e%2f%2e%2e%2fAGENTS.md', '/%ZZ', '/../../package.json']) assert.ok((await fetch(root + path)).status >= 400);
    assert.equal((await fetch(root, { method: 'POST', body: 'change' })).status, 405);
  } finally { process.kill(); }
});
