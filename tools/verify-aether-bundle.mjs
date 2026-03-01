import fs from 'node:fs';
import path from 'node:path';

export function verifyAetherBundle(bundlePath = path.resolve('dist', 'app.js')) {
  if (!fs.existsSync(bundlePath)) {
    return {
      ok: false,
      message: 'Không tìm thấy dist/app.js. Hãy chạy build trước.',
      missing: [],
      stale: [],
    };
  }

  const code = fs.readFileSync(bundlePath, 'utf8');

  const requiredMarkers = [
    /projectLeaderGroundPos/,
    /backOffsetX/,
    /syncAllVisuals\([\s\S]*tokens[\s\S]*ally:[\s\S]*enemy:/,
  ];

  const staleMarkers = [
    /const allyPos = getScreenPos\(0, 1\);/,
    /const enemyPos = getScreenPos\(6, 1\);\s*\n\s*globalAetherPool\.syncAllVisuals\(\{ x: allyPos\.x, y: allyPos\.y, s: allyPos\.s \}, \{ x: enemyPos\.x, y: enemyPos\.y, s: enemyPos\.s \}\);/,
  ];

  const missing = requiredMarkers
    .filter((pattern) => !pattern.test(code))
    .map((pattern) => pattern.toString());
  const stale = staleMarkers
    .filter((pattern) => pattern.test(code))
    .map((pattern) => pattern.toString());

  if (missing.length || stale.length) {
    return {
      ok: false,
      message: 'Phát hiện bundle chưa chứa bản vá trụ Aether mới.',
      missing,
      stale,
    };
  }

  return {
    ok: true,
    message: 'OK: dist/app.js đã chứa bản vá trụ Aether mới.',
    missing: [],
    stale: [],
  };
}

function runCli() {
  const result = verifyAetherBundle();
  if (!result.ok) {
    console.error(`[verify-aether-bundle] ${result.message}`);
    if (result.missing.length) {
      console.error(`- Thiếu marker: ${result.missing.join(', ')}`);
    }
    if (result.stale.length) {
      console.error(`- Còn marker cũ: ${result.stale.join(', ')}`);
    }
    process.exit(1);
  }
  console.log(`[verify-aether-bundle] ${result.message}`);
}

import { fileURLToPath } from 'node:url';

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runCli();
}
