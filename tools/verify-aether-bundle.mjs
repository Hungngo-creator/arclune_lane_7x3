import fs from 'node:fs';
import path from 'node:path';

const appJsPath = path.resolve('dist', 'app.js');
if (!fs.existsSync(appJsPath)) {
  console.error('[verify-aether-bundle] Không tìm thấy dist/app.js. Hãy chạy build trước.');
  process.exit(1);
}

const code = fs.readFileSync(appJsPath, 'utf8');

const mustContain = [
  'projectLeaderGroundPos',
  'backOffsetX',
  'syncAllVisuals({ x: allyPos.x, y: allyPos.y, s: allyPos.s }, { x: enemyPos.x, y: enemyPos.y, s: enemyPos.s }, tokens, {'
];

const mustNotContain = [
  'const allyPos = getScreenPos(0, 1);',
  'const enemyPos = getScreenPos(6, 1);\n          globalAetherPool.syncAllVisuals({ x: allyPos.x, y: allyPos.y, s: allyPos.s }, { x: enemyPos.x, y: enemyPos.y, s: enemyPos.s });'
];

const missing = mustContain.filter((token) => !code.includes(token));
const stale = mustNotContain.filter((token) => code.includes(token));

if (missing.length || stale.length) {
  console.error('[verify-aether-bundle] Phát hiện bundle chưa chứa bản vá trụ Aether mới.');
  if (missing.length) {
    console.error(`- Thiếu marker: ${missing.join(', ')}`);
  }
  if (stale.length) {
    console.error(`- Còn marker cũ: ${stale.join(', ')}`);
  }
  process.exit(1);
}

console.log('[verify-aether-bundle] OK: dist/app.js đã chứa bản vá trụ Aether mới.');
