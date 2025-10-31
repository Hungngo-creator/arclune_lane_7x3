// @ts-nocheck
const test = require('node:test');
const assert = require('assert/strict');
const path = require('path');
const fs = require('fs/promises');
const { spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DIST_FILE = path.join(DIST_DIR, 'app.js');

async function runBuild(){
  await fs.rm(DIST_FILE, { force: true });
  await fs.mkdir(DIST_DIR, { recursive: true });
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT_DIR, 'build.mjs')], {
      cwd: ROOT_DIR,
      stdio: 'pipe'
    });
    let stderr = '';
    let stdout = '';
    child.stdout?.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0){
        resolve({ stdout, stderr });
      } else {
        const error = new Error(`build exited with code ${code}: ${stderr || stdout}`);
        reject(error);
      }
    });
  });
}

test('build includes nested source modules', async () => {
  await runBuild();
  const bundled = await fs.readFile(DIST_FILE, 'utf8');
  assert.match(bundled, /__define\(["']\.\/utils\/dummy\.js["'],/);
});