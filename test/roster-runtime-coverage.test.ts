import { ROSTER } from '../src/catalog';
import { formatRuntimeCoverageFailures, inventoryRosterRuntimeCoverage } from '../src/combat/runtime-coverage';

test('every declared roster Ultimate and passive effect has a registered runtime path', () => {
  const coverage = inventoryRosterRuntimeCoverage(ROSTER);
  expect(formatRuntimeCoverageFailures(coverage)).toBe('Unsupported Ultimate types:\n  (none)\n\nUnsupported passive effects:\n  (none)');
});
