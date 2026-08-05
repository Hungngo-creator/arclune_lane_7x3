import type { RankName } from '../catalog.ts';

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
export interface EffectCommitReceipt { readonly effectType: EffectType; readonly committed: true; readonly eventSerial: number; readonly stateRevision: number; readonly session?: unknown }
type GatewayOperation<T extends EffectType> = (effect: Extract<EffectSpec, { type: T }>, context: EffectExecutionContext) => EffectCommitReceipt;
export interface EffectExecutionServices {
  readonly damageGateway: GatewayOperation<'deal-damage' | 'reflect-damage'>;
  readonly healingGateway: GatewayOperation<'heal'>;
  readonly shieldGateway: GatewayOperation<'grant-shield'>;
  readonly hpMutationGateway: GatewayOperation<'pay-hp-cost'>;
  readonly lifecycleGateway: GatewayOperation<'sacrifice' | 'request-death-prevention' | 'request-revive' | 'queue-delayed-revive' | 'enter-reincarnation' | 'request-rebirth'>;
  readonly statusGateway: GatewayOperation<'apply-status' | 'remove-status' | 'dispel' | 'grant-immunity'>;
  readonly resourceGateway: GatewayOperation<'spend-resource' | 'gain-resource'>;
  readonly summonGateway: GatewayOperation<'summon'>;
  readonly fieldGateway: GatewayOperation<'create-field'>;
  readonly movementGateway: GatewayOperation<'move'>;
  readonly reactionGateway: GatewayOperation<'trigger-follow-up' | 'trigger-counter'>;
  readonly characterStateGateway: GatewayOperation<'set-stance' | 'set-form'>;
}
export type EffectGatewayCommit = (effect: EffectSpec, context: EffectExecutionContext) => Readonly<{ eventSerial: number; stateRevision: number }>;
export type EffectGatewayCommits = Readonly<Record<keyof EffectExecutionServices, EffectGatewayCommit>>;
const authoritativeReceipts = new WeakSet<object>();
function recordKernelEffectReceipt<T extends EffectCommitReceipt>(receipt: T): T { authoritativeReceipts.add(receipt); return receipt; }
export function createEffectExecutionServices(commits: EffectGatewayCommits): EffectExecutionServices {
  const services = {} as Record<keyof EffectExecutionServices, GatewayOperation<EffectType>>;
  for (const gateway of Object.keys(commits) as (keyof EffectExecutionServices)[]) services[gateway] = ((effect: EffectSpec, context: EffectExecutionContext) => {
    const mutation = commits[gateway](effect, context);
    if (!Number.isSafeInteger(mutation.eventSerial) || mutation.eventSerial <= 0 || !Number.isSafeInteger(mutation.stateRevision) || mutation.stateRevision <= 0) throw new Error(`[effect-gateway] ${gateway} did not commit authoritative state`);
    const receipt = { effectType: effect.type, committed: true as const, eventSerial: mutation.eventSerial, stateRevision: mutation.stateRevision };
    Object.defineProperty(receipt, 'session', { value: context.session, enumerable: false });
    return recordKernelEffectReceipt(Object.freeze(receipt) as EffectCommitReceipt);
  }) as GatewayOperation<EffectType>;
  return Object.freeze(services) as unknown as EffectExecutionServices;
}
export interface EffectExecutionContext {
  readonly session: unknown; readonly action: unknown; readonly sourceTrueSelfId: string; readonly sourceLifeId: string;
  readonly resolvedTargetIds: readonly (string | number)[]; readonly kitKey: string; readonly authority: AuthorityTier;
  readonly mode: string; readonly random: () => number; readonly services: EffectExecutionServices;
}
export interface EffectHandler<T extends EffectType = EffectType> { readonly type: T; execute(effect: Extract<EffectSpec, { type: T }>, context: EffectExecutionContext): EffectCommitReceipt }
const handlers = new Map<EffectType, EffectHandler>();
export function registerEffectHandler(handler: EffectHandler): void { if (handlers.has(handler.type)) throw new Error(`[effect-registry] duplicate handler: ${handler.type}`); handlers.set(handler.type, handler); }
export function dispatchEffect(effect: EffectSpec, context: EffectExecutionContext, characterId: string, catalogPath: string): EffectCommitReceipt {
  validateEffectSpec(effect, characterId, catalogPath);
  const handler = handlers.get(effect.type);
  if (!handler) throw new Error(`[effect-registry] ${characterId} at ${catalogPath}: no production handler for ${effect.type}`);
  const receipt = handler.execute(effect as never, context);
  if (!receipt || !authoritativeReceipts.has(receipt) || receipt.committed !== true || receipt.effectType !== effect.type || !Number.isSafeInteger(receipt.eventSerial) || receipt.eventSerial <= 0 || !Number.isSafeInteger(receipt.stateRevision) || receipt.stateRevision <= 0) throw new Error(`[effect-registry] ${effect.type}: gateway did not return an authoritative receipt`);
  return receipt;
}
const targetKinds = new Set(['self','selected-ally','selected-enemy','leader','single','multiple','all','random','line','column','cross','explicit-iids']);
const targetedSides = new Set(['single','multiple','all','random','line','column','cross']);
const amountTypes = new Set(['deal-damage','reflect-damage','heal','grant-shield','pay-hp-cost','sacrifice']);
export function validateEffectSpec(effect: EffectSpec, characterId: string, catalogPath: string): void {
  const fail = (message: string): never => { throw new Error(`[catalog] ${characterId} at ${catalogPath}: ${message}`); };
  if (!effect || typeof effect !== 'object' || !EFFECT_TYPES.includes(effect.type)) fail('unknown effect type');
  const target = effect.target as TargetSpec;
  if (!target || typeof target !== 'object' || !targetKinds.has(target.kind)) fail('malformed effect target');
  if (targetedSides.has(target.kind) && !['ally','enemy'].includes((target as { side?: string }).side ?? '')) fail('target side must be ally or enemy');
  if ((target.kind === 'multiple' || target.kind === 'random') && (!Number.isSafeInteger(target.count) || (target.count ?? 0) <= 0)) fail(`${target.kind} target requires a positive count`);
  if ((target.kind === 'line' || target.kind === 'column' || target.kind === 'cross') && !['string','number'].includes(typeof target.anchorIid)) fail(`${target.kind} target requires anchorIid`);
  if (target.kind === 'explicit-iids' && (!Array.isArray(target.iids) || target.iids.length === 0)) fail('explicit-iids target requires at least one iid');
  const payload = effect.payload as Record<string, unknown>;
  if (!payload || typeof payload !== 'object') fail('malformed effect payload');
  if (amountTypes.has(effect.type) && (typeof payload.amount !== 'number' || !Number.isFinite(payload.amount) || payload.amount < 0)) fail('amount must be finite and non-negative');
  if ((effect.type === 'deal-damage' || effect.type === 'reflect-damage') && !['physical','will','true'].includes(String(payload.damageType))) fail('invalid damage type');
  if (['spend-resource','gain-resource'].includes(effect.type) && (!['aether','fury'].includes(String(payload.resource)) || typeof payload.amount !== 'number' || !Number.isFinite(payload.amount) || payload.amount < 0)) fail('invalid resource payload');
  if (effect.type === 'move' && (![payload.cx,payload.cy].every(Number.isSafeInteger) || Number(payload.cx) < 0 || Number(payload.cy) < 0)) fail('invalid board coordinates');
  if (effect.type === 'dispel' && (!['buff','debuff','all'].includes(String(payload.polarity)) || (payload.count !== undefined && (!Number.isSafeInteger(payload.count) || Number(payload.count) <= 0)))) fail('invalid dispel policy');
  for (const key of effect.type === 'summon' ? ['definitionId'] : effect.type === 'create-field' ? ['fieldId'] : ['apply-status','grant-immunity'].includes(effect.type) ? ['statusType'] : effect.type === 'remove-status' ? ['statusId'] : ['trigger-follow-up','trigger-counter'].includes(effect.type) ? ['actionKey'] : ['request-death-prevention','request-revive','enter-reincarnation','request-rebirth'].includes(effect.type) ? ['effectId'] : ['set-stance','set-form'].includes(effect.type) ? ['value'] : []) if (typeof payload[key] !== 'string' || !(payload[key] as string).trim()) fail(`${key} must be a non-empty canonical identifier`);
  if (effect.type === 'queue-delayed-revive' && (typeof payload.effectId !== 'string' || !['next-natural-turn','next-global-cycle','after-actions'].includes(String(payload.duePolicy)))) fail('invalid delayed-revive policy');
}
export function registeredEffectHandlerCount(): number { return handlers.size; }
export function assertAllEffectHandlersRegistered(): void { const missing = EFFECT_TYPES.filter(type => !handlers.has(type)); if (missing.length) throw new Error(`[effect-registry] missing production handlers: ${missing.join(', ')}`); }
const routes: Record<EffectType, keyof EffectExecutionServices> = {
  'deal-damage':'damageGateway','reflect-damage':'damageGateway','heal':'healingGateway','grant-shield':'shieldGateway','pay-hp-cost':'hpMutationGateway','sacrifice':'lifecycleGateway','apply-status':'statusGateway','remove-status':'statusGateway','dispel':'statusGateway','grant-immunity':'statusGateway','spend-resource':'resourceGateway','gain-resource':'resourceGateway','summon':'summonGateway','create-field':'fieldGateway','move':'movementGateway','trigger-follow-up':'reactionGateway','trigger-counter':'reactionGateway','request-death-prevention':'lifecycleGateway','request-revive':'lifecycleGateway','queue-delayed-revive':'lifecycleGateway','enter-reincarnation':'lifecycleGateway','request-rebirth':'lifecycleGateway','set-stance':'characterStateGateway','set-form':'characterStateGateway'
};
for (const type of EFFECT_TYPES) registerEffectHandler({ type, execute: (effect, context) => (context.services[routes[type]] as GatewayOperation<typeof type>)(effect, context) });

export interface AuthoritySnapshot { readonly rank: RankName; readonly cultivation: number; readonly combatPower: number; readonly stars?: number; readonly awaken?: number }
export interface MechanicClaim { readonly claimId: string; readonly effectInstanceId: string; readonly sourceTrueSelfId: string; readonly sourceIid: string | number; readonly targetLifeKey: string; readonly kitKey: string; readonly effectType: EffectType; readonly conflictDomain: string; readonly operation: string; readonly authority: AuthorityTier; readonly authoritySnapshot: AuthoritySnapshot; readonly createdEventSerial: number }
export function directlyConflicts(left: MechanicClaim, right: MechanicClaim): boolean { return left.targetLifeKey === right.targetLifeKey && left.conflictDomain === right.conflictDomain && left.operation !== right.operation; }
const compareText = (left: string, right: string): number => left < right ? 1 : left > right ? -1 : 0;
export const RANK_PRIORITY: Readonly<Record<RankName, number>> = Object.freeze({ N: 0, R: 1, SR: 2, SSR: 3, UR: 4, Prime: 5 });
export function compareAuthorityV1(left: MechanicClaim, right: MechanicClaim): number {
  for (const difference of [AUTHORITY_RANK[left.authority] - AUTHORITY_RANK[right.authority], RANK_PRIORITY[left.authoritySnapshot.rank] - RANK_PRIORITY[right.authoritySnapshot.rank], left.authoritySnapshot.cultivation - right.authoritySnapshot.cultivation, left.authoritySnapshot.combatPower - right.authoritySnapshot.combatPower, right.createdEventSerial - left.createdEventSerial]) if (difference) return Math.sign(difference);
  return compareText(left.sourceTrueSelfId, right.sourceTrueSelfId) || compareText(left.effectInstanceId, right.effectInstanceId);
}
export function resolveDirectConflictV1(left: MechanicClaim, right: MechanicClaim): MechanicClaim | null { if (!directlyConflicts(left, right)) return null; return compareAuthorityV1(left, right) >= 0 ? left : right; }

export interface DivineNatureProtectedClaim { readonly conflictDomain: string; readonly operation: string; readonly sourcePolicy: 'self-only' | 'any'; readonly authority: 'axiom' }
export interface DivineNatureTrait { readonly traitId: 'trait:divine-nature'; readonly protectedClaims: readonly DivineNatureProtectedClaim[] }
