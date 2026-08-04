import { ROSTER, type RosterEntry } from '../catalog.ts';
import { defineCharacterRuntime, type CharacterCapabilityManifest, type CharacterRuntimeDefinition } from './character-runtime.ts';
import { UNIT_RUNTIME_HOOKS } from './runtime-hooks/registry.ts';

const declared = (value: unknown): 'supported' | 'not-declared' => value == null ? 'not-declared' : 'supported';
const contains = (entry: RosterEntry, pattern: RegExp): 'supported' | 'not-declared' => pattern.test(JSON.stringify(entry.kit ?? {})) ? 'supported' : 'not-declared';

function manifest(entry: RosterEntry): CharacterCapabilityManifest {
  const kit = entry.kit ?? {};
  const characterId = String(entry.id);
  return {
    basic: declared(kit.basic), skill1: declared(kit.skill1), skill2: declared(kit.skill2), skill3: declared(kit.skill3),
    ultimate: declared(kit.ult), passives: Array.isArray(kit.passives) && kit.passives.length > 0 ? 'supported' : 'not-declared',
    summon: contains(entry, /summon/i), healing: contains(entry, /heal|regen|restoreHp/i),
    deathPrevention: contains(entry, /surviveAtOneHP|phaseShiftWhenCriticalHP|undying/i),
    revive: contains(entry, /revive/i), rebirth: contains(entry, /rebirth|reincarn/i),
    customAdapter: UNIT_RUNTIME_HOOKS[characterId] ? characterId : null, directMutationViolations: 0,
  };
}

export const CHARACTER_RUNTIME_DEFINITIONS: ReadonlyMap<string, Readonly<CharacterRuntimeDefinition>> = new Map(
  ROSTER.map(entry => [entry.id, defineCharacterRuntime({
    characterId: entry.id,
    capabilities: manifest(entry),
    deterministicTests: ['pve-death-foundation', 'roster-runtime-contract'],
  })]),
);

export function requireCharacterRuntimeDefinition(characterId: string): Readonly<CharacterRuntimeDefinition> {
  const definition = CHARACTER_RUNTIME_DEFINITIONS.get(characterId);
  if (!definition) throw new Error(`[character-runtime] ${characterId}: missing CharacterRuntimeDefinition`);
  return definition;
}
