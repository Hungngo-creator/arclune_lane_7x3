import { ROSTER, type RosterEntry } from '../catalog.ts';
import { compileLegacyAuthoringTag, type AuthorityTier, type CanonicalMetadataTag, type EffectSpec, type TargetSpec } from './canonical-model.ts';

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
  readonly actions: Readonly<Partial<Record<'basic' | 'skill1' | 'skill2' | 'skill3' | 'ultimate', ExecutableActionDefinition>>>;
  readonly passiveSubscriptions: readonly string[];
  readonly summonDefinitions: readonly string[];
  readonly metadataTags: readonly CanonicalMetadataTag[];
  readonly requiredAxioms: readonly string[];
  readonly nonExecutableActions: readonly Readonly<{ actionKey: string; catalogPath: string; reason: string }>[];
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
  else if (finite(action.hits) !== null || finite(action.bonusDamageFromShieldRatio) !== null) {
    const hitCount = Math.max(1, Math.floor(finite(action.hits) ?? 1));
    for (let hit = 0; hit < hitCount; hit += 1) effects.push({ type: 'deal-damage', target: action.bonusDamageFromShieldRatio !== undefined ? { kind: 'all', side: 'enemy' } : target, payload: { amount: 1, damageType: 'physical', shieldRatio: finite(action.bonusDamageFromShieldRatio) ?? undefined } });
  }
  const healing = finite(action.healPercent ?? action.healPercentMaxHP ?? action.healAmount);
  if (healing !== null) effects.push({ type: 'heal', target: { kind: 'self' }, payload: { amount: healing } });
  const shield = finite(action.shieldPercentMaxHP ?? action.shieldAmount);
  if (shield !== null) effects.push({ type: 'grant-shield', target: { kind: 'self' }, payload: { amount: shield } });
  const hpCost = finite(action.hpTradePercent ?? action.hpTradePercentMaxHP ?? action.hpSacrificePercentMax ?? action.sacrificeMaxHPPercent);
  if (hpCost !== null) effects.push({ type: 'pay-hp-cost', target: { kind: 'self' }, payload: { amount: hpCost } });
  const costRecord = record(action.cost);
  const shieldCostRatio = finite(action.shieldCostRatioCurrent);
  if (shieldCostRatio !== null) effects.push({ type: 'apply-status', target: { kind: 'self' }, payload: { statusType: 'shield:consume-current-ratio', value: shieldCostRatio } });
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
  if (action.buffStats && typeof action.buffStats === 'object') {
    const stats = record(action.buffStats);
    for (const [stat, raw] of Object.entries(stats)) effects.push({ type: 'apply-status', target: { kind: 'self' }, payload: { statusType: `buff:${stat.toLowerCase()}`, duration: finite(action.duration) ?? undefined, value: finite(raw) ?? undefined } });
  }
  if (action.weatherShift || action.field || action.fieldId) effects.push({ type: 'create-field', target: { kind: 'self' }, payload: { fieldId: String(action.weatherShift ?? action.fieldId ?? 'field'), duration: finite(action.duration) ?? undefined } });
  if (action.flying || action.stance || action.form) effects.push({ type: 'set-stance', target: { kind: 'self' }, payload: { value: String(action.stance ?? action.form ?? 'flying') } });
  const grantAlly = record(action.grantAlly);
  const allyShield = finite(grantAlly.shieldPercentMaxHP);
  if (allyShield !== null) effects.push({ type: 'grant-shield', target: { kind: 'selected-ally' }, payload: { amount: allyShield } });
  if (effects.length === 0) {
    const ignored = new Set(['characterId','key','name','notes','description','tags','type','cost']);
    const gameplayKey = Object.keys(action).find(k => !ignored.has(k));
    if (!gameplayKey) throw new Error(`[catalog] ${String(action.characterId ?? 'unknown')} at ${String(action.key ?? 'action')}: unsupported field metadata-only action has no executable EffectSpec`);
    throw new Error(`[catalog] ${String(action.characterId ?? 'unknown')} at ${String(action.key ?? 'action')}.${gameplayKey}: unsupported gameplay field has no executable EffectSpec`);
  }
  return effects;
}

function metadataFor(characterId: string, key: string, action: Record<string, unknown>, target: TargetSpec, effects: readonly EffectSpec[], cost: ExecutableActionDefinition['cost'], authority: AuthorityTier): readonly CanonicalMetadataTag[] {
  const tags = new Set<CanonicalMetadataTag>();
  const add = (tag: CanonicalMetadataTag) => tags.add(tag);
  if (target.kind === 'self') add('target:self'); else if (target.kind === 'selected-ally') { add('target:ally'); add('target:single'); } else if (target.kind === 'selected-enemy') { add('target:enemy'); add('target:single'); } else if ('side' in target) { add(target.side === 'ally' ? 'target:ally' : 'target:enemy'); add(target.kind === 'all' ? 'target:all' : target.kind === 'random' ? 'target:random' : target.kind === 'multiple' ? 'target:multiple' : 'target:single'); }
  for (const effect of effects) {
    if (effect.type === 'deal-damage' || effect.type === 'reflect-damage') add(`damage:${effect.payload.damageType}` as CanonicalMetadataTag);
    if (effect.type === 'heal') add('recovery:heal'); if (effect.type === 'grant-shield') add('protection:shield');
    if (effect.type === 'apply-status') add(effect.payload.statusType.startsWith('buff:') ? 'status:buff' : effect.payload.statusType.includes('mark') ? 'status:mark' : 'status:debuff'); if (effect.type === 'grant-immunity') add('status:immunity'); if (effect.type === 'summon') add('entity:summon'); if (effect.type === 'create-field') add('entity:field');
  }
  if (cost.aether) add('cost:aether'); if (cost.fury) add('cost:fury'); if (cost.hp) add('cost:hp');
  const rawTags = Array.isArray(action.tags) ? action.tags : [];
  rawTags.forEach((raw, index) => { const tag = compileLegacyAuthoringTag(raw, characterId, `kit.${key}.tags[${index}]`); if (tag) add(tag); });
  if (authority !== 'none' && rawTags.includes('global-rule')) { /* authority is represented structurally, not by a second tag registry */ }
  return Object.freeze([...tags]);
}

export function compileCatalogAction(characterId: string, key: string, value: unknown, ordering = 0): ExecutableActionDefinition | null {
  if (!value || typeof value !== 'object') return null;
  const action: Record<string, unknown> = { ...record(value), characterId, key };
  const metadataOnlyKeys = new Set(['characterId','key','name','notes','description','tags','type','cost']);
  if (!Object.keys(action).some(k => !metadataOnlyKeys.has(k))) return null;
  const target = targetFor(action);
  const cost = record(action.cost);
  const actionCost = Object.freeze({ ...(finite(cost.aether) !== null ? { aether: finite(cost.aether)! } : {}), ...(finite(cost.fury) !== null ? { fury: finite(cost.fury)! } : {}), ...(finite(cost.hp) !== null ? { hp: finite(cost.hp)! } : {}) });
  const effects = Object.freeze(effectsFor(action, target));
  const authority: AuthorityTier = Array.isArray(action.tags) && action.tags.some(tag => typeof tag === 'string' && tag.trim().toLowerCase() === 'global-rule') ? 'rule' : 'none';
  return Object.freeze({
    actionId: `${characterId}:${key}`,
    target,
    effects,
    cost: actionCost,
    conditions: Object.freeze([
      ...(finite(action.minHpPercentToCast) !== null ? [{ type: 'minimum-current-hp-ratio', ratio: finite(action.minHpPercentToCast)! } as const] : []),
      ...(finite(action.limitUses ?? action.maxUsesPerBattle) !== null ? [{ type: 'maximum-uses-per-battle', uses: finite(action.limitUses ?? action.maxUsesPerBattle)! } as const] : []),
      ]), metadataTags: metadataFor(characterId, key, action, target, effects, actionCost, authority), authority, ordering, modeScope: Object.freeze(['pve'] as const),
  });
}

function compile(entry: RosterEntry): ExecutableCharacterDefinition {
  const characterId = String(entry.id);
  const kit = record(entry.kit);
  const skills = Array.isArray(kit.skills) ? kit.skills : [];
  const nonExecutableActions: { actionKey: string; catalogPath: string; reason: string }[] = [];
  const attempt = (key: string, value: unknown, ordering: number, catalogPath: string): ExecutableActionDefinition | null => {
    try { return compileCatalogAction(characterId, key, value, ordering); }
    catch (error) { nonExecutableActions.push({ actionKey: key, catalogPath, reason: error instanceof Error ? error.message : String(error) }); return null; }
  };
  const basic = attempt('basic', kit.basic, 0, 'kit.basic');
  const compiledSkills = skills.map((skill, index) => {
    const key = String(record(skill).key ?? `skill${index + 1}`);
    if (!['skill1', 'skill2', 'skill3'].includes(key)) throw new Error(`[catalog] ${characterId} at kit.skills[${index}].key: expected skill1, skill2, or skill3`);
    return [key, attempt(key, skill, index + 1, `kit.skills[${index}]`)] as const;
  });
  if (new Set(compiledSkills.map(([key]) => key)).size !== compiledSkills.length) throw new Error(`[catalog] ${characterId} at kit.skills: duplicate action key`);
  const ultimate = attempt('ultimate', kit.ult, 100, 'kit.ult');
  const actions = Object.fromEntries([...(basic ? [['basic', basic]] : []), ...compiledSkills.filter((pair): pair is readonly [string, ExecutableActionDefinition] => pair[1] !== null), ...(ultimate ? [['ultimate', ultimate]] : [])]);
  return Object.freeze({
    characterId,
    basic,
    skills: Object.freeze(compiledSkills.map(([, action]) => action).filter((value): value is ExecutableActionDefinition => value !== null)),
    ultimate,
    actions: Object.freeze(actions),
    passiveSubscriptions: Object.freeze((Array.isArray(kit.passives) ? kit.passives : []).map(value => String(record(value).when ?? '')).filter(Boolean)),
    summonDefinitions: Object.freeze([]), metadataTags: Object.freeze([]), requiredAxioms: Object.freeze([]),
    nonExecutableActions: Object.freeze(nonExecutableActions.map(value => Object.freeze(value))),
  });
}

/** Immutable, once-per-process production compilation; actions never parse prose. */
export const EXECUTABLE_CHARACTER_DEFINITIONS: ReadonlyMap<string, ExecutableCharacterDefinition> = new Map(ROSTER.map(entry => [entry.id, compile(entry)]));

export function requireExecutableCharacterDefinition(characterId: string): ExecutableCharacterDefinition {
  const definition = EXECUTABLE_CHARACTER_DEFINITIONS.get(characterId);
  if (!definition) throw new Error(`[catalog] missing executable character definition: ${characterId}`);
  return definition;
}
