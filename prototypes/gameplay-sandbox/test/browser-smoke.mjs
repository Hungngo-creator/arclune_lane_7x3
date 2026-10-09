import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdtemp, readFile, writeFile, mkdir, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = fileURLToPath(new URL('..', import.meta.url));
const artifacts = join(root, 'artifacts'); await mkdir(artifacts, { recursive: true });
const chromium = process.env.CHROMIUM_BIN ?? '/usr/bin/chromium';
if (typeof WebSocket !== 'function') throw new Error('Browser smoke requires Node22+ (native WebSocket).');
await access(chromium).catch(() => { throw new Error('Chromium unavailable; set CHROMIUM_BIN to its executable.'); });
await new Promise((resolve, reject) => {
  const build = spawn(process.execPath, [join(root, 'make-standalone.mjs')], { stdio: 'inherit' });
  build.once('exit', code => code === 0 ? resolve() : reject(new Error('Standalone build failed'))); build.once('error', reject);
});
const temporary = await mkdtemp(join(tmpdir(), 'arclune-browser-'));
const reserve = createServer(); await new Promise(r => reserve.listen(0, '127.0.0.1', r));
const port = reserve.address().port; await new Promise(r => reserve.close(r));
const serverReserve = createServer(); await new Promise(r => serverReserve.listen(0, '127.0.0.1', r));
const serverPort = serverReserve.address().port; await new Promise(r => serverReserve.close(r));
const server = spawn(process.execPath, [join(root, 'serve.mjs')], { env: { ...process.env, SANDBOX_PORT: String(serverPort) }, stdio: ['ignore', 'pipe', 'ignore'] });
await new Promise((resolve, reject) => { server.stdout.once('data', resolve); server.once('error', reject); });
const chrome = spawn(chromium, ['--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--disable-background-networking', '--remote-debugging-address=127.0.0.1', `--remote-debugging-port=${port}`, `--user-data-dir=${join(temporary, 'profile')}`, 'about:blank'], { stdio: 'ignore' });
let socket;
try {
  let pages;
  for (let i = 0; i < 100; i++) {
    try { pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await delay(100); }
  }
  if (!pages) throw new Error('Chromium debugging endpoint unavailable');
  const page = pages.find(p => p.type === 'page');
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let serial = 0; const pending = new Map(), errors = [];
  socket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails);
    if (data.id) {
      const entry = pending.get(data.id); if (!entry) return;
      pending.delete(data.id); clearTimeout(entry.timeout);
      data.error ? entry.reject(new Error(JSON.stringify(data.error))) : entry.resolve(data.result);
    }
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++serial, timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timeout }); socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const r = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  const waitFor = async expression => {
    for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await delay(50); }
    const documentInfo = await evaluate(`({url:location.href,title:document.title,body:document.body?.innerText.slice(0,200)})`);
    throw new Error(`Browser condition timed out: ${expression}; errors=${JSON.stringify(errors)}; document=${JSON.stringify(documentInfo)}`);
  };
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  await call('Runtime.enable'); await call('Page.enable'); await call('Network.enable');
  await call('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: temporary });
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  // This executor's managed Chromium disallows file://. Serve the exact single
  // file over loopback, then disconnect networking for every gameplay check.
  await call('Page.navigate', { url: `http://127.0.0.1:${serverPort}/artifacts/arclune-sandbox.html` });
  await waitFor(`document.querySelectorAll('.unit').length === 6`);
  await call('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  assert.equal(await evaluate(`document.querySelectorAll('.slot').length`), 18);
  assert.match(await evaluate(`document.querySelector('#active-name').textContent`), /Gideon Vale · Đội A/);
  let screen = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  await writeFile(join(artifacts, 'desktop.png'), Buffer.from(screen.data, 'base64'));
  await click('[data-ability="skill2"]'); await click('[data-unit="b-guard"]'); await click('#execute');
  assert.match(await evaluate(`document.querySelector('#ae-a').textContent`), /^0 \/ 100 AE/);
  assert.match(await evaluate(`document.querySelector('#active-name').textContent`), /Đội B/);
  assert.ok(await evaluate(`document.querySelector('[data-unit="a-guard"]').textContent.includes('Taunt')`));
  assert.equal(await evaluate(`document.querySelector('#error').textContent`), '');
  await click('#export');
  const replayFile = join(temporary, 'arclune-replay-79.json');
  for (let i = 0; i < 100; i++) { try { await access(replayFile); break; } catch { await delay(50); } }
  const saved = JSON.parse(await readFile(replayFile, 'utf8')); assert.equal(saved.commands.length, 1);
  await click('#reset'); assert.match(await evaluate(`document.querySelector('#active-name').textContent`), /Đội A/);
  const doc = await call('DOM.getDocument');
  const input = await call('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#import' });
  await call('DOM.setFileInputFiles', { nodeId: input.nodeId, files: [replayFile] });
  await waitFor(`document.querySelector('#active-name').textContent.includes('Đội B')`);
  assert.match(await evaluate(`document.querySelector('#ae-a').textContent`), /^0 \/ 100 AE/);
  await click('#trace-filter'); // A normal focus/click must not mutate gameplay.
  await evaluate(`document.querySelector('#trace-filter').value='RESOURCE';document.querySelector('#trace-filter').dispatchEvent(new Event('change'))`);
  assert.ok(await evaluate(`document.querySelector('#trace').textContent.includes('class gain sau Action')`));
  await evaluate(`document.querySelector('#trace-filter').value='ALL';document.querySelector('#trace-filter').dispatchEvent(new Event('change'))`);
  await evaluate(`for(let i=0;i<80 && !document.querySelector('#ai-step').disabled;i++) document.querySelector('#ai-step').click()`);
  assert.match(await evaluate(`document.querySelector('#result').textContent`), /thắng|hòa/);
  assert.equal(await evaluate(`document.querySelector('#execute').disabled`), true);
  await click('#reset'); await click('[data-ability="skill1"]'); await click('#execute');
  for (let batch = 0; batch < 4; batch++) await evaluate(`for(let i=0;i<100 && !document.querySelector('#ai-step').disabled;i++) document.querySelector('#ai-step').click()`);
  assert.match(await evaluate(`document.querySelector('#result').textContent`), /giới hạn thử nghiệm 400/);
  assert.match(await evaluate(`document.querySelector('#opportunity').textContent`), /400 \/ 400/);
  assert.equal(await evaluate(`document.querySelector('#auto').disabled`), true);
  assert.equal(await evaluate(`document.querySelector('#trace-detail').value`), 'summary');
  await click('#trace-export');
  const summaryFile = join(temporary, 'arclune-summary-79.json');
  for (let i = 0; i < 100; i++) { try { await access(summaryFile); break; } catch { await delay(50); } }
  const compact = await readFile(summaryFile, 'utf8'), summary = JSON.parse(compact);
  assert.equal(summary.progress.ending, 'SANDBOX_LIMIT'); assert.ok(Buffer.byteLength(compact) < 15000);
  await evaluate(`document.querySelector('#trace-detail').value='full'`); await click('#trace-export');
  const fullFile = join(temporary, 'arclune-trace-79.json');
  for (let i = 0; i < 100; i++) { try { await access(fullFile); break; } catch { await delay(50); } }
  const full = JSON.parse(await readFile(fullFile, 'utf8'));
  assert.equal(full.trace.length, summary.eventCount); assert.equal(full.trace.at(-1).type, 'SANDBOX_LIMIT');
  await evaluate(`document.querySelector('[name=seed]').value='201';document.querySelector('[name=trainingClass]').value='Assassin';document.querySelector('[name=trainingRank]').value='UR';document.querySelector('[name=alliedElement]').value='Fire';document.querySelector('[name=enemyElement]').value='Metal';document.querySelector('[name=alwaysHit]').checked=true;document.querySelector('#setup').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))`);
  assert.match(await evaluate(`document.querySelector('[data-unit="b-striker"]').textContent`), /UR · Assassin · Metal/);
  assert.equal(await evaluate(`document.querySelector('#result').textContent`), '');
  // Full-Rage form priority is visible and playable in the actual UI.
  await evaluate(`document.querySelector('[name=startingRage]').value='100';document.querySelector('#setup').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))`);
  assert.equal(await evaluate(`document.querySelector('[data-ability="basic"]').disabled`), true);
  assert.equal(await evaluate(`document.querySelector('[data-ability="ultimate"]').disabled`), false);
  await click('#execute'); assert.equal(await evaluate(`document.querySelector('#error').textContent`), '');
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await delay(100);
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= 390`), 'Mobile layout overflows');
  screen = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  await writeFile(join(artifacts, 'mobile.png'), Buffer.from(screen.data, 'base64'));
  await call('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await call('Page.navigate', { url: `http://127.0.0.1:${serverPort}/` });
  await waitFor(`document.querySelectorAll('.unit').length === 6`);
  await click('[data-ability="skill2"]'); await click('#execute');
  assert.match(await evaluate(`document.querySelector('#ae-a').textContent`), /^0 \/ 100 AE/);
  assert.deepEqual(errors, []);
  console.log('PASS browser: offline gameplay; manual/AI; replay; reproduced400 cap and visible reason; compact/full report downloads; profile changes; mobile; module entry; zero uncaught errors.');
} finally {
  socket?.close(); chrome.kill(); server.kill();
  await new Promise(resolve => { if (chrome.exitCode !== null) resolve(); else { chrome.once('exit', resolve); setTimeout(resolve, 3000); } });
  await rm(temporary, { recursive: true, force: true });
}
