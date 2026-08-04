import { ROSTER, type RosterEntry } from '../catalog.ts';
import type { AuthorityTier, CanonicalMetadataTag, EffectSpec, TargetSpec } from './canonical-model.ts';

export interface ExecutableActionDefinition {
  readonly actionId: string;
  readonly target: TargetSpec;
  readonly effects: readonly EffectSpec[];
  readonly cost: Readonly<{ aether?: number; fury?: number; hp?: number }>;
  readonly conditions: readonly string[];
  readonly authority: AuthorityTier;
  readonly ordering: number;
  readonly modeScope: readonly ['pve'];
}

export interface ExecutableCharacterDefinition {
  readonly characterId: string;
  readonly basic: ExecutableActionDefinition | null;
  readonly skills: readonly ExecutableActionDefinition[];
  readonly ultimate: ExecutableActionDefinition | null;
  readonly passiveSubscriptions: readonly string[];
  readonly summonDefinitions: readonly string[];
  readonly metadataTags: readonly CanonicalMetadataTag[];
  readonly requiredAxioms: readonly string[];
}

const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {};
const finite = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;

function targetFor(action: Record<string, unknown>): TargetSpec {
  const raw = action.targets ?? action.aoe;
  if (raw === 'allEnemies') return { kind: 'all', side: 'enemy' };
  if (raw === 'randomEnemies') return { kind: 'random', side: 'enemy', count: Math.max(1, Number(action.hits) || 1) };
  return { kind: 'selected-enemy' };
}

function effectsFor(action: Record<string, unknown>, target: TargetSpec): EffectSpec[] {
  const effects: EffectSpec[] = [];
  const multiplier = finite(action.damageMultiplier);
  if (multiplier !== null) effects.push({ type: 'deal-damage', target, payload: { amount: multiplier, damageType: 'physical' } });
  const healing = finite(action.healPercent ?? action.healAmount);
  if (healing !== null) effects.push({ type: 'heal', target: { kind: 'self' }, payload: { amount: healing } });
  const summon = record(action.summon);
  const summonId = typeof summon.id === 'string' ? summon.id : typeof action.summonId === 'string' ? action.summonId : null;
  if (summonId) effects.push({ type: 'summon', target: { kind: 'self' }, payload: { definitionId: summonId } });
  return effects;
}

function compileAction(characterId: string, key: string, value: unknown, ordering: number): ExecutableActionDefinition | null {
  if (!value || typeof value !== 'object') return null;
  const action = record(value);
  const target = targetFor(action);
  const cost = record(action.cost);
  return Object.freeze({
    actionId: `${characterId}:${key}`,
    target,
    effects: Object.freeze(effectsFor(action, target)),
    cost: Object.freeze({ ...(finite(cost.aether) !== null ? { aether: finite(cost.aether)! } : {}), ...(finite(cost.fury) !== null ? { fury: finite(cost.fury)! } : {}) }),
    conditions: Object.freeze([]), authority: 'none', ordering, modeScope: Object.freeze(['pve'] as const),
  });
}

function compile(entry: RosterEntry): ExecutableCharacterDefinition {
  const characterId = String(entry.id);
  const kit = record(entry.kit);
  const skills = Array.isArray(kit.skills) ? kit.skills : [];
  return Object.freeze({
    characterId,
    basic: compileAction(characterId, 'basic', kit.basic, 0),
    skills: Object.freeze(skills.map((skill, index) => compileAction(characterId, String(record(skill).key ?? `skill${index + 1}`), skill, index + 1)).filter((value): value is ExecutableActionDefinition => value !== null)),
    ultimate: compileAction(characterId, 'ultimate', kit.ult, 100),
    passiveSubscriptions: Object.freeze((Array.isArray(kit.passives) ? kit.passives : []).map(value => String(record(value).when ?? '')).filter(Boolean)),
    summonDefinitions: Object.freeze([]), metadataTags: Object.freeze([]), requiredAxioms: Object.freeze([]),
  });
}

/** Immutable, once-per-process production compilation; actions never parse prose. */
export const EXECUTABLE_CHARACTER_DEFINITIONS: ReadonlyMap<string, ExecutableCharacterDefinition> = new Map(ROSTER.map(entry => [entry.id, compile(entry)]));

export function requireExecutableCharacterDefinition(characterId: string): ExecutableCharacterDefinition {
  const definition = EXECUTABLE_CHARACTER_DEFINITIONS.get(characterId);
  if (!definition) throw new Error(`[catalog] missing executable character definition: ${characterId}`);
  return definition;
}
