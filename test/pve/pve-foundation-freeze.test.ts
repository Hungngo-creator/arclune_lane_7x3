import { ROSTER } from '../../src/catalog.ts';
import { COMBAT_FOUNDATION_CONTRACT_VERSION } from '../../src/combat/foundation-contract.ts';
import { EXECUTABLE_CHARACTER_DEFINITIONS } from '../../src/combat/executable-character-definition.ts';

test('the required foundation gate discovers and compiles every real roster entry', () => {
  expect(COMBAT_FOUNDATION_CONTRACT_VERSION).toBe(1);
  expect(EXECUTABLE_CHARACTER_DEFINITIONS.size).toBe(ROSTER.length);
  let declaredActions = 0;
  for (const entry of ROSTER) {
    const runtime = EXECUTABLE_CHARACTER_DEFINITIONS.get(entry.id);
    expect(runtime?.characterId).toBe(entry.id);
    declaredActions += [runtime?.basic, ...(runtime?.skills ?? []), runtime?.ultimate].filter(Boolean).length;
  }
  expect(declaredActions).toBeGreaterThan(0);
});
