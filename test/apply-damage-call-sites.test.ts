import * as fs from 'node:fs';
import * as path from 'node:path';

test('low-level applyDamage call sites cannot grow outside the legacy commit/bypass inventory', () => {
  const roots = ['src/combat.ts', 'src/statuses.ts', 'src/combat/tag-dispatch.ts', 'src/combat/chap-minh-runtime.ts', 'src/modes/pve/session-runtime-impl.ts'];
  const callers = roots.filter((file) => /\bapplyDamage\s*\(/.test(fs.readFileSync(path.join(process.cwd(), file), 'utf8')));
  expect(callers).toEqual(roots);
});

