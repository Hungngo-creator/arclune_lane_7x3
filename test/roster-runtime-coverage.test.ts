import { ROSTER } from '../src/catalog';
import { formatRuntimeCoverageFailures, inventoryRosterRuntimeCoverage } from '../src/combat/runtime-coverage';
import { CHARACTER_RUNTIME_DEFINITIONS } from '../src/combat/roster-runtime-definitions';

test('every declared roster Ultimate and passive effect has a registered runtime path', () => {
  const coverage = inventoryRosterRuntimeCoverage(ROSTER);
  expect(formatRuntimeCoverageFailures(coverage)).toBe('Unsupported Ultimate types:\n  (none)\n\nUnsupported passive effects:\n  (none)');
});

test('every current roster entry has one complete runtime capability manifest', () => {
  expect(CHARACTER_RUNTIME_DEFINITIONS.size).toBe(ROSTER.length);
  expect([...CHARACTER_RUNTIME_DEFINITIONS.keys()]).toEqual(ROSTER.map(entry => entry.id));
  for (const entry of ROSTER) {
    const definition = CHARACTER_RUNTIME_DEFINITIONS.get(entry.id)!;
    expect(definition.characterId).toBe(entry.id);
    expect(Object.keys(definition.capabilities).sort()).toEqual([
      'basic', 'customAdapter', 'deathPrevention', 'directMutationViolations', 'healing', 'passives', 'rebirth', 'revive', 'skill1', 'skill2', 'skill3', 'summon', 'ultimate',
    ]);
  }
});