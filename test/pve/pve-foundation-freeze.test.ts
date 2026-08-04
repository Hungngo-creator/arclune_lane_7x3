import { ROSTER } from '../src/catalog.ts';
import { COMBAT_FOUNDATION_CONTRACT_VERSION } from '../src/combat/foundation-contract.ts';
import { CHARACTER_RUNTIME_DEFINITIONS } from '../src/combat/roster-runtime-definitions.ts';

const CAPABILITIES = [
  'basic', 'skill1', 'skill2', 'skill3', 'ultimate', 'passives', 'summon',
  'healing', 'deathPrevention', 'revive', 'delayedRevive', 'reincarnation',
  'rebirth',
] as const;

test('the certified foundation covers every real roster entry through one contract', () => {
  expect(COMBAT_FOUNDATION_CONTRACT_VERSION).toBe(1);
  expect(CHARACTER_RUNTIME_DEFINITIONS.size).toBe(ROSTER.length);
  for (const entry of ROSTER) {
    const runtime = CHARACTER_RUNTIME_DEFINITIONS.get(entry.id);
    expect(runtime?.characterId).toBe(entry.id);
    for (const capability of CAPABILITIES) {
      expect(['supported', 'not-declared']).toContain(runtime?.capabilities[capability]);
    }
  }
});
