import { ROSTER, type RosterEntry } from '../catalog.ts';
import { defineCharacterRuntime, type CharacterCapabilityManifest, type CharacterRuntimeDefinition } from './character-runtime.ts';
import { UNIT_RUNTIME_HOOKS } from './runtime-hooks/registry.ts';

const declared = (value: unknown): 'supported' | 'not-declared' => value == null ? 'not-declared' : 'supported';
const structuredKinds = (value: unknown, found = new Set<string>()): Set<string> => {
  if (Array.isArray(value)) { for (const child of value) structuredKinds(child, found); return found; }
  if (!value || typeof value !== 'object') return found;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (['type', 'kind', 'effect', 'lifecycle', 'operation'].includes(key) && typeof child === 'string') found.add(child);
    structuredKinds(child, found);
  }
  return found;
};
const hasKind = (kinds: ReadonlySet<string>, values: readonly string[]) => values.some(value => kinds.has(value));

function manifest(entry: RosterEntry): CharacterCapabilityManifest {
  const kit = entry.kit ?? {};
  const characterId = String(entry.id);
  const kinds = structuredKinds(kit);
  const skills = Array.isArray(kit.skills) ? kit.skills : [];
  return {
    basic: declared(kit.basic), skill1: declared(kit.skill1 ?? skills.find(skill => skill?.key === 'skill1')), skill2: declared(kit.skill2 ?? skills.find(skill => skill?.key === 'skill2')), skill3: declared(kit.skill3 ?? skills.find(skill => skill?.key === 'skill3')),
    ultimate: declared(kit.ult), passives: Array.isArray(kit.passives) && kit.passives.length > 0 ? 'supported' : 'not-declared',
    summon: hasKind(kinds, ['summon', 'summonClone', 'clone-summon', 'summon-random']) ? 'supported' : 'not-declared', healing: hasKind(kinds, ['heal', 'teamHeal', 'applyFormRegen']) ? 'supported' : 'not-declared',
    deathPrevention: hasKind(kinds, ['surviveAtOneHP', 'phaseShiftWhenCriticalHP', 'undying']) ? 'supported' : 'not-declared',
    revive: hasKind(kinds, ['revive', 'immediate-revive']) ? 'supported' : 'not-declared', delayedRevive: hasKind(kinds, ['delayed-revive']) ? 'supported' : 'not-declared',
    reincarnation: hasKind(kinds, ['reincarnation', 'luan-hoi']) ? 'supported' : 'not-declared', rebirth: hasKind(kinds, ['rebirth']) ? 'supported' : 'not-declared',
    customAdapter: UNIT_RUNTIME_HOOKS[characterId] ? characterId : null,
  };
}

const scenarioId = (characterId: string, capability: string): string => `pve/${characterId}/${capability}`;

export const CHARACTER_RUNTIME_DEFINITIONS: ReadonlyMap<string, Readonly<CharacterRuntimeDefinition>> = new Map(
  ROSTER.map(entry => [entry.id, defineCharacterRuntime({
    characterId: entry.id,
    capabilities: manifest(entry),
    behavioralCertifications: Object.entries(manifest(entry)).filter(([key, value]) => key !== 'customAdapter' && value === 'supported').map(([capability]) => ({ capability: capability as Exclude<keyof CharacterCapabilityManifest, 'customAdapter'>, scenarioId: scenarioId(entry.id, capability) })),
  })]),
);

export function requireCharacterRuntimeDefinition(characterId: string): Readonly<CharacterRuntimeDefinition> {
  const definition = CHARACTER_RUNTIME_DEFINITIONS.get(characterId);
  if (!definition) throw new Error(`[character-runtime] ${characterId}: missing CharacterRuntimeDefinition`);
  return definition;
}
