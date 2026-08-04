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

export type ImplementedEffectType = 'deal-damage' | 'heal' | 'grant-shield' | 'pay-hp-cost' | 'sacrifice' | 'apply-status' | 'remove-status' | 'dispel' | 'grant-immunity' | 'spend-resource' | 'gain-resource' | 'summon' | 'create-field' | 'move' | 'trigger-follow-up' | 'trigger-counter' | 'reflect-damage' | 'request-death-prevention' | 'request-revive' | 'queue-delayed-revive' | 'enter-reincarnation' | 'request-rebirth' | 'set-stance' | 'set-form';
export type ReservedFutureEffectType = never;
export type EffectType = ImplementedEffectType;
export const EFFECT_TYPES: readonly EffectType[] = Object.freeze(['deal-damage','heal','grant-shield','pay-hp-cost','sacrifice','apply-status','remove-status','dispel','grant-immunity','spend-resource','gain-resource','summon','create-field','move','trigger-follow-up','trigger-counter','reflect-damage','request-death-prevention','request-revive','queue-delayed-revive','enter-reincarnation','request-rebirth','set-stance','set-form']);
export type TargetSpec =
  | { readonly kind: 'self' | 'selected-ally' | 'selected-enemy' | 'leader' }
  | { readonly kind: 'single' | 'multiple' | 'all' | 'random'; readonly side: 'ally' | 'enemy'; readonly count?: number }
  | { readonly kind: 'line' | 'column' | 'cross'; readonly side: 'ally' | 'enemy'; readonly anchorIid: string | number }
  | { readonly kind: 'explicit-iids'; readonly iids: readonly (string | number)[] };
type AmountPayload = { readonly amount: number };
type StatusPayload = { readonly statusType: string; readonly duration?: number; readonly value?: number };
type ResourcePayload = { readonly resource: 'aether' | 'fury'; readonly amount: number };
export type EffectSpec =
  | { readonly type: 'deal-damage' | 'reflect-damage'; readonly target: TargetSpec; readonly payload: AmountPayload & { readonly damageType: 'physical' | 'will' | 'true' } }
  | { readonly type: 'heal' | 'grant-shield' | 'pay-hp-cost' | 'sacrifice'; readonly target: TargetSpec; readonly payload: AmountPayload }
  | { readonly type: 'apply-status' | 'grant-immunity'; readonly target: TargetSpec; readonly payload: StatusPayload }
  | { readonly type: 'remove-status'; readonly target: TargetSpec; readonly payload: { readonly statusId: string } }
  | { readonly type: 'dispel'; readonly target: TargetSpec; readonly payload: { readonly polarity: 'buff' | 'debuff' | 'all'; readonly count?: number } }
  | { readonly type: 'spend-resource' | 'gain-resource'; readonly target: TargetSpec; readonly payload: ResourcePayload }
  | { readonly type: 'summon'; readonly target: TargetSpec; readonly payload: { readonly definitionId: string; readonly subtype?: 'clone' | 'unit' } }
  | { readonly type: 'create-field'; readonly target: TargetSpec; readonly payload: { readonly fieldId: string; readonly duration?: number } }
  | { readonly type: 'move'; readonly target: TargetSpec; readonly payload: { readonly cx: number; readonly cy: number } }
  | { readonly type: 'trigger-follow-up' | 'trigger-counter'; readonly target: TargetSpec; readonly payload: { readonly actionKey: string } }
  | { readonly type: 'request-death-prevention' | 'request-revive' | 'enter-reincarnation' | 'request-rebirth'; readonly target: TargetSpec; readonly payload: { readonly effectId: string } }
  | { readonly type: 'queue-delayed-revive'; readonly target: TargetSpec; readonly payload: { readonly effectId: string; readonly duePolicy: string } }
  | { readonly type: 'set-stance' | 'set-form'; readonly target: TargetSpec; readonly payload: { readonly value: string } };
/** @deprecated Use EffectSpec. */
export type EffectDefinition = EffectSpec;
export interface EffectCommitReceipt { readonly effectType: EffectType; readonly committed: true; readonly eventSerial: number; readonly stateRevision: number }
export interface EffectExecutionContext {
  readonly session: unknown; readonly action: unknown; readonly sourceTrueSelfId: string; readonly sourceLifeId: string;
  readonly resolvedTargetIds: readonly (string | number)[]; readonly kitKey: string; readonly authority: AuthorityTier;
  readonly mode: string; readonly random: () => number;
  readonly commit: (effect: EffectSpec, context: EffectExecutionContext) => EffectCommitReceipt;
}
export interface EffectHandler<T extends EffectType = EffectType> { readonly type: T; execute(effect: Extract<EffectSpec, { type: T }>, context: EffectExecutionContext): EffectCommitReceipt }
const handlers = new Map<EffectType, EffectHandler>();
export function registerEffectHandler(handler: EffectHandler): void { if (handlers.has(handler.type)) throw new Error(`[effect-registry] duplicate handler: ${handler.type}`); handlers.set(handler.type, handler); }
export function dispatchEffect(effect: EffectSpec, context: EffectExecutionContext, characterId: string, catalogPath: string): EffectCommitReceipt {
  validateEffectSpec(effect, characterId, catalogPath);
  const handler = handlers.get(effect.type);
  if (!handler) throw new Error(`[effect-registry] ${characterId} at ${catalogPath}: no production handler for ${effect.type}`);
  return handler.execute(effect as never, context);
}
export function validateEffectSpec(effect: EffectSpec, characterId: string, catalogPath: string): void {
  if (!effect || typeof effect !== 'object' || !EFFECT_TYPES.includes(effect.type)) throw new Error(`[catalog] ${characterId} at ${catalogPath}: unknown effect type`);
  if (!effect.target || typeof effect.target !== 'object' || typeof effect.target.kind !== 'string') throw new Error(`[catalog] ${characterId} at ${catalogPath}: malformed effect target`);
  if (!effect.payload || typeof effect.payload !== 'object') throw new Error(`[catalog] ${characterId} at ${catalogPath}: malformed effect payload`);
}
export function registeredEffectHandlerCount(): number { return handlers.size; }
export function assertAllEffectHandlersRegistered(): void {
  const missing = EFFECT_TYPES.filter(type => !handlers.has(type));
  if (missing.length) throw new Error(`[effect-registry] missing production handlers: ${missing.join(', ')}`);
}

const gatewayHandler = <T extends EffectType>(type: T): EffectHandler<T> => ({ type, execute: (effect, context) => {
  const receipt = context.commit(effect, context);
  if (!receipt || receipt.committed !== true || receipt.effectType !== type || !Number.isSafeInteger(receipt.eventSerial) || receipt.eventSerial <= 0) throw new Error(`[effect-registry] ${type}: gateway did not return an authoritative receipt`);
  return receipt;
} });
for (const type of EFFECT_TYPES) registerEffectHandler(gatewayHandler(type));

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
