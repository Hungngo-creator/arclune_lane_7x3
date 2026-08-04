import { ROSTER } from '../src/catalog.ts';
import { EXECUTABLE_CHARACTER_DEFINITIONS } from '../src/combat/executable-character-definition.ts';

test('the production catalog compiles once into closed executable definitions', () => {
  expect(EXECUTABLE_CHARACTER_DEFINITIONS.size).toBe(ROSTER.length);
  for (const entry of ROSTER) {
    const compiled = EXECUTABLE_CHARACTER_DEFINITIONS.get(entry.id)!;
    expect(compiled.characterId).toBe(entry.id);
    expect(Object.isFrozen(compiled)).toBe(true);
    for (const action of [compiled.basic, ...compiled.skills, compiled.ultimate].filter(Boolean)) {
      expect(action!.actionId).toMatch(new RegExp(`^${entry.id}:`));
      expect(action!.modeScope).toEqual(['pve']);
      expect(Object.isFrozen(action!.effects)).toBe(true);
    }
  }
});
