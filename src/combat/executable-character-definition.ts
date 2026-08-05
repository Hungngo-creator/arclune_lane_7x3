import { ROSTER, type RosterEntry } from '../catalog.ts';
import type { AuthorityTier, CanonicalMetadataTag, EffectSpec, TargetSpec } from './canonical-model.ts';

export type ExecutableCondition =
  | Readonly<{ type: 'minimum-current-hp-ratio'; ratio: number }>
  | Readonly<{ type: 'turn-parity'; parity: 'odd' | 'even' }>
  | Readonly<{ type: 'maximum-uses-per-battle'; uses: number }>
  | Readonly<{ type: 'unique-summon'; definitionId: string }>;

export interface ExecutableActionDefinition {
  readonly actionId: string;
  readonly target: TargetSpec;
  readonly effects: readonly EffectSpec[];
  readonly cost: Readonly<{ aether?: number; fury?: number; hp?: number }>;
  readonly conditions: readonly ExecutableCondition[];
  readonly metadataTags: readonly CanonicalMetadataTag[];
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
  if (raw === 'randomEnemies' || typeof action.randomTargets === 'number') return { kind: 'random', side: 'enemy', count: Math.max(1, Number(action.randomTargets ?? action.hits) || 1) };
  if (raw === 'allAllies' || raw === 'allies') return { kind: 'all', side: 'ally' };
  if (action.target === 'self') return { kind: 'self' };
  return { kind: 'selected-enemy' };
}

function effectsFor(action: Record<string, unknown>, target: TargetSpec): EffectSpec[] {
  const effects: EffectSpec[] = [];
  const multiplier = finite(action.damageMultiplier);
  if (multiplier !== null) effects.push({ type: 'deal-damage', target, payload: { amount: multiplier, damageType: 'physical' } });
  else if (finite(action.hits) !== null || finite(action.bonusDamageFromShieldRatio) !== null) effects.push({ type: 'deal-damage', target, payload: { amount: 1, damageType: 'physical' } });
  const healing = finite(action.healPercent ?? action.healAmount);
  if (healing !== null) effects.push({ type: 'heal', target: { kind: 'self' }, payload: { amount: healing } });
  const shield = finite(action.shieldPercentMaxHP ?? action.shieldAmount);
  if (shield !== null) effects.push({ type: 'grant-shield', target: { kind: 'self' }, payload: { amount: shield } });
  const hpCost = finite(action.hpTradePercent ?? action.hpTradePercentMaxHP ?? action.hpSacrificePercentMax ?? action.sacrificeMaxHPPercent);
  if (hpCost !== null) effects.push({ type: 'pay-hp-cost', target: { kind: 'self' }, payload: { amount: hpCost } });
  const costRecord = record(action.cost);
  const aetherCost = finite(costRecord.aether);
  if (aetherCost !== null) effects.push({ type: 'spend-resource', target: { kind: 'self' }, payload: { resource: 'aether', amount: aetherCost } });
  const summon = record(action.summon);
  const summonId = typeof summon.id === 'string' ? summon.id : typeof action.summonId === 'string' ? action.summonId : null;
  if (summonId) effects.push({ type: 'summon', target: { kind: 'self' }, payload: { definitionId: summonId } });
  const debuff = record(action.debuff);
  const statusType = typeof debuff.id === 'string' ? debuff.id : typeof debuff.type === 'string' ? debuff.type : null;
  if (statusType) effects.push({ type: 'apply-status', target, payload: { statusType, duration: finite(debuff.duration) ?? undefined } });
  const buffs = Array.isArray(action.buffs) ? action.buffs : [];
  for (const buff of buffs) { const b = record(buff); const id = typeof b.id === 'string' ? b.id : null; if (id) effects.push({ type: 'apply-status', target: { kind: 'self' }, payload: { statusType: id, duration: finite(b.turns ?? b.duration) ?? undefined } }); }
  const debuffs = Array.isArray(action.debuffs) ? action.debuffs : [];
  for (const item of debuffs) { const d = record(item); const id = typeof d.id === 'string' ? d.id : null; if (id) effects.push({ type: 'apply-status', target, payload: { statusType: id, duration: finite(d.turns ?? d.duration) ?? undefined, value: finite(d.amount) ?? undefined } }); }
  if (action.buffStats && typeof action.buffStats === 'object') effects.push({ type: 'apply-status', target: { kind: 'self' }, payload: { statusType: 'stat-buff', duration: finite(action.duration) ?? undefined } });
  if (action.weatherShift || action.field || action.fieldId) effects.push({ type: 'create-field', target: { kind: 'self' }, payload: { fieldId: String(action.weatherShift ?? action.fieldId ?? 'field'), duration: finite(action.duration) ?? undefined } });
  if (action.flying || action.stance || action.form) effects.push({ type: 'set-stance', target: { kind: 'self' }, payload: { value: String(action.stance ?? action.form ?? 'flying') } });
  const grantAlly = record(action.grantAlly);
  const allyShield = finite(grantAlly.shieldPercentMaxHP);
  if (allyShield !== null) effects.push({ type: 'grant-shield', target: { kind: 'selected-ally' }, payload: { amount: allyShield } });
  if (effects.length === 0) {
    const ignored = new Set(['characterId','key','name','notes','description','tags','type','cost']);
    const gameplayKey = Object.keys(action).find(k => !ignored.has(k));
    if (!gameplayKey) throw new Error(`[catalog] ${String(action.characterId ?? 'unknown')} at ${String(action.key ?? 'action')}: unsupported field metadata-only action has no executable EffectSpec`);
    effects.push({ type: 'apply-status', target: { kind: 'self' }, payload: { statusType: `mechanic:${gameplayKey}`, duration: finite(action.duration) ?? finite(action.turns) ?? 1 } });
  }
  return effects;
}

function compileAction(characterId: string, key: string, value: unknown, ordering: number): ExecutableActionDefinition | null {
  if (!value || typeof value !== 'object') return null;
  const action: Record<string, unknown> = { ...record(value), characterId, key };
  const metadataOnlyKeys = new Set(['characterId','key','name','notes','description','tags','type','cost']);
  if (!Object.keys(action).some(k => !metadataOnlyKeys.has(k))) return null;
  const target = targetFor(action);
  const cost = record(action.cost);
  return Object.freeze({
    actionId: `${characterId}:${key}`,
    target,
    effects: Object.freeze(effectsFor(action, target)),
    cost: Object.freeze({ ...(finite(cost.fury) !== null ? { fury: finite(cost.fury)! } : {}), ...(finite(cost.hp) !== null ? { hp: finite(cost.hp)! } : {}) }),
    conditions: Object.freeze([
      ...(finite(action.minHpPercentToCast) !== null ? [{ type: 'minimum-current-hp-ratio', ratio: finite(action.minHpPercentToCast)! } as const] : []),
      ...(finite(action.limitUses ?? action.maxUsesPerBattle) !== null ? [{ type: 'maximum-uses-per-battle', uses: finite(action.limitUses ?? action.maxUsesPerBattle)! } as const] : []),
    ]), metadataTags: Object.freeze([]), authority: 'none', ordering, modeScope: Object.freeze(['pve'] as const),
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
