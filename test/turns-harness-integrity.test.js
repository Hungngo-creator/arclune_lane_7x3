const { spawnSync } = require('node:child_process');

test('turns VM harness rejects undeclared module syntax and uses canonical presence', () => {
  const script = `
    import { assertVmModuleIntegrity, loadTurnsHarness } from './test/helpers/turns-harness.mjs';
    for (const source of ["import { x } from './x.js';", "require('./x.js');"]) {
      let rejected = false;
      try { assertVmModuleIntegrity(source, 'fixture.ts'); } catch { rejected = true; }
      if (!rejected) throw new Error('unsafe module syntax was accepted');
    }
    const harness = await loadTurnsHarness();
    const alive = harness.deps['./combat/kernel/life-cycle.ts'].isCombatAlive;
    if (!alive({ alive: true, hp: 1, lifeState: 'alive' })) throw new Error('live presence rejected');
    if (alive({ alive: false, hp: 0, lifeState: 'hp-zero' })) throw new Error('hp-zero presence accepted');
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', script], {
    cwd: process.cwd(), encoding: 'utf8'
  });
  expect(result.stderr).toBe('');
  expect(result.status).toBe(0);
});
