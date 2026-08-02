import * as fs from 'node:fs';
import * as path from 'node:path';

test('low-level applyDamage call sites match the exact gateway/bypass inventory', () => {
  const allowed = new Map<string, number>([
    ['src/combat/apply-damage.ts', 1],
    ['src/combat/kernel/damage-batch.ts', 1],
  ]);
  for (const [file, count] of allowed) {
    const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
    expect(source.match(/\bapplyDamage\s*\(/g)?.length ?? 0).toBe(count);
  }
  const walk = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.name.endsWith('.ts') ? [full] : [];
  });
  const actual = walk(path.join(process.cwd(), 'src')).filter(file => /\bapplyDamage\s*\(/.test(fs.readFileSync(file, 'utf8')))
    .map(file => path.relative(process.cwd(), file).replaceAll(path.sep, '/')).sort();
  expect(actual).toEqual([...allowed.keys()].sort());
});
