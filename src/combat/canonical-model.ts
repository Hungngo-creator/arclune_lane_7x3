import { RANK_MULT, type RankName } from '../catalog.ts';

export type AuthorityTier = 'none' | 'doctrine' | 'rule' | 'axiom';
export const AUTHORITY_RANK: Readonly<Record<AuthorityTier, number>> = Object.freeze({ none: 0, doctrine: 1, rule: 2, axiom: 3 });

export const CANONICAL_METADATA_TAGS = Object.freeze([
  'damage:physical', 'damage:will', 'damage:true', 'damage:mixed', 'damage:dot', 'damage:self',
  'recovery:heal', 'protection:shield', 'cost:aether', 'cost:fury', 'cost:hp', 'cost:sacrifice',
  'status:buff', 'status:debuff', 'status:cc', 'status:immunity', 'status:dispel', 'status:mark',
  'cc:stun', 'cc:sleep', 'cc:silence', 'cc:taunt', 'cc:fear',
  'target:self', 'target:ally', 'target:enemy', 'target:leader', 'target:single', 'target:multiple', 'target:all', 'target:random',
  'shape:line', 'shape:column', 'shape:cross', 'reaction:follow-up', 'reaction:counter', 'reaction:reflect',
  'entity:summon', 'entity:field', 'life:death-prevention', 'life:revive', 'life:delayed-revive', 'life:reincarnation', 'life:rebirth',
  'trait:divine-nature',
] as const);
export type CanonicalMetadataTag = typeof CANONICAL_METADATA_TAGS[number];
const CANONICAL_TAG_SET: ReadonlySet<string> = new Set(CANONICAL_METADATA_TAGS);
export function requireCanonicalMetadataTag(raw: string, characterId: string, catalogPath: string): CanonicalMetadataTag {
  if (!CANONICAL_TAG_SET.has(raw)) throw new Error(`[catalog] ${characterId} at ${catalogPath}: unknown metadata tag ${JSON.stringify(raw)}; expected a namespaced canonical metadata tag`);
  return raw as CanonicalMetadataTag;
}

export type EffectType = 'deal-damage' | 'heal' | 'grant-shield' | 'pay-hp-cost' | 'sacrifice' | 'apply-status' | 'remove-status' | 'dispel' | 'grant-immunity' | 'spend-resource' | 'gain-resource' | 'summon' | 'create-field' | 'move' | 'trigger-follow-up' | 'trigger-counter' | 'reflect-damage' | 'request-death-prevention' | 'request-revive' | 'queue-delayed-revive' | 'enter-reincarnation' | 'request-rebirth' | 'set-stance' | 'set-form';
export const EFFECT_TYPES: readonly EffectType[] = Object.freeze(['deal-damage','heal','grant-shield','pay-hp-cost','sacrifice','apply-status','remove-status','dispel','grant-immunity','spend-resource','gain-resource','summon','create-field','move','trigger-follow-up','trigger-counter','reflect-damage','request-death-prevention','request-revive','queue-delayed-revive','enter-reincarnation','request-rebirth','set-stance','set-form']);
export interface EffectDefinition { readonly type: EffectType; readonly payload: Readonly<Record<string, unknown>>; readonly target: CanonicalMetadataTag }
export interface EffectHandler { readonly type: EffectType; execute(effect: EffectDefinition): unknown }
const handlers = new Map<EffectType, EffectHandler>();
export function registerEffectHandler(handler: EffectHandler): void { if (handlers.has(handler.type)) throw new Error(`[effect-registry] duplicate handler: ${handler.type}`); handlers.set(handler.type, handler); }
export function dispatchEffect(effect: EffectDefinition, characterId: string, catalogPath: string): unknown {
  const handler = handlers.get(effect.type);
  if (!handler) throw new Error(`[effect-registry] ${characterId} at ${catalogPath}: no production handler for ${effect.type}`);
  return handler.execute(effect);
}
export function registeredEffectHandlerCount(): number { return handlers.size; }

export interface AuthoritySnapshot { readonly rank: RankName; readonly cultivation: number; readonly combatPower: number; readonly stars?: number; readonly awaken?: number }
export interface MechanicClaim { readonly claimId: string; readonly effectInstanceId: string; readonly sourceTrueSelfId: string; readonly sourceIid: string | number; readonly targetLifeKey: string; readonly kitKey: string; readonly effectType: EffectType; readonly conflictDomain: string; readonly operation: string; readonly authority: AuthorityTier; readonly authoritySnapshot: AuthoritySnapshot; readonly createdEventSerial: number }
export function directlyConflicts(left: MechanicClaim, right: MechanicClaim): boolean { return left.targetLifeKey === right.targetLifeKey && left.conflictDomain === right.conflictDomain && left.operation !== right.operation; }
const compareText = (left: string, right: string): number => left < right ? 1 : left > right ? -1 : 0;
export function compareAuthorityV1(left: MechanicClaim, right: MechanicClaim): number {
  for (const difference of [AUTHORITY_RANK[left.authority] - AUTHORITY_RANK[right.authority], Object.keys(RANK_MULT).indexOf(left.authoritySnapshot.rank) - Object.keys(RANK_MULT).indexOf(right.authoritySnapshot.rank), left.authoritySnapshot.cultivation - right.authoritySnapshot.cultivation, left.authoritySnapshot.combatPower - right.authoritySnapshot.combatPower, right.createdEventSerial - left.createdEventSerial]) if (difference) return Math.sign(difference);
  return compareText(left.sourceTrueSelfId, right.sourceTrueSelfId) || compareText(left.effectInstanceId, right.effectInstanceId);
}
export function resolveDirectConflictV1(left: MechanicClaim, right: MechanicClaim): MechanicClaim | null { if (!directlyConflicts(left, right)) return null; return compareAuthorityV1(left, right) >= 0 ? left : right; }

export interface DivineNatureProtectedClaim { readonly conflictDomain: string; readonly operation: string; readonly sourcePolicy: 'self-only' | 'any'; readonly authority: 'axiom' }
export interface DivineNatureTrait { readonly traitId: 'trait:divine-nature'; readonly protectedClaims: readonly DivineNatureProtectedClaim[] }
