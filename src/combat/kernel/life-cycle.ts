import type { SessionState } from '@shared-types/combat';
import type { LifeState, Side, UnitToken } from '../../types/units.ts';
import { beginRevivedLife } from './combat-identity.ts';
import { assertCombatIdentity, type CombatIdentityKind } from './combat-identity.ts';
import { slotIndex } from '../../engine.ts';
import { compareRuleTagPriority, type RuleTag } from '../tag-aliases.ts';
import { nextDeathSerial, nextEventSerial } from './sequence.ts';
import type { ActionIdentity, SourceAttribution } from './types.ts';
import { finalizeRebirthClaimWindows, hasEnteredReincarnation, markReincarnationEscapedByRevive, observeReincarnationDeathWave } from './reincarnation.ts';
import { ensureTrueSelfCombatRecord, lifeIdentityKey } from './true-self.ts';
import { normalizeCombatHpState, normalizeCombatHpValue } from '../number-utils.ts';
export { isCombatAlive } from '../presence.ts';

export type DeathCauseKind = 'damage' | 'dot' | 'reflected' | 'environment' | 'self-damage' | 'sacrifice' | 'non-damage-hp-loss' | 'execute';
export interface HPZeroCandidate {
  targetIid: string | number; trueSelfId: string | null; incarnationSerial: number; lifeSerial: number; actionId: string | number; chainId: string | number;
  parentActionId: string | number | null; source: SourceAttribution; causeKind: DeathCauseKind; committedHpDamage: number; overkill: number;
  slot: number; position: { cx: number; cy: number }; isLeader: boolean; isSummon: boolean; countsForReincarnation: boolean; eventSerial: number;
  entityKind: 'collection-unit' | 'leader' | 'npc' | 'boss' | 'summon' | 'summoned-creep' | 'clone' | 'combat-object'; countsForKill: boolean; countsForKillReward: boolean; canRevive: boolean; removalPolicy: string;
}
export interface DeathRecord extends HPZeroCandidate {
  deathId: string; deathSerial: number; countsForKill: boolean; revivable: boolean; confirmedEventSerial: number;
}
export type DeathAuthority = 'normal' | RuleTag;
export interface DeathPreventionDecision { prevent: boolean; hp: number; effectId: string; authority?: DeathAuthority; priority?: number; explicitPriority?: number; registrationSerial?: number; charge?: Readonly<Record<string, unknown>>; source?: SourceAttribution }
export interface DeathPreventionRequest { candidate: HPZeroCandidate; decisions: readonly DeathPreventionDecision[] }
export interface ReviveRequest { death: DeathRecord; hpPolicy: { kind: 'flat' | 'ratio'; value: number }; ragePolicy: 'preserve' | 'reset'; buffPolicy: 'preserve' | 'purge' | 'preserve-all' | 'purge-purgeable-debuffs' | 'clear-temporary' | 'explicit-list'; statusIds?: readonly string[]; positionPolicy: 'preserve'; source: SourceAttribution; authority?: string; allowSummon?: boolean }
export interface ReviveResult { committed: boolean; reason: string | null; targetIid: string | number; lifeSerial: number }
export type ReviveEligibilityReason = 'allowed' | 'battle-ended' | 'invalid-death' | 'non-revivable' | 'stale-life' | 'already-revived' | 'summon-not-revivable' | 'removed' | 'erased' | 'fused' | 'entered-reincarnation' | 'identity-mismatch';

type PreventionCollector = (candidate: HPZeroCandidate) => DeathPreventionDecision | readonly DeathPreventionDecision[] | null;
type ChainActivity = { pendingDeathReactions: number; pendingKillReactions: number; pendingImmediateRevives: number; pendingHpZeroCandidates: number };
type ReactionRegistration = { serial: number; priority: number; react: (record: DeathRecord) => void };
type LifecycleRuntime = { combatEvents?: Record<string, unknown>[]; hpZeroCandidates?: HPZeroCandidate[]; deathRecords?: DeathRecord[]; deathRecordById?: Record<string, DeathRecord>; openHpZeroKeys?: string[]; confirmedLifeKeys?: string[]; revivedDeathIds?: string[]; deathPreventionRegistrations?: Array<{ serial: number; collect: PreventionCollector }>; deathPreventionSerial?: number; trueSelfRecords?: Record<string, { confirmedKills: number }>; deathReactionRegistrations?: ReactionRegistration[]; killReactionRegistrations?: ReactionRegistration[]; reactionRegistrationSerial?: number; immediateReviveRegistrations?: Array<(record: DeathRecord) => { target: UnitToken; request: ReviveRequest } | null>; actionChains?: Record<string, ChainActivity>; battleEnd?: { ended: boolean; winner: Side | 'draw' | null; reason: string | null } };
const runtime = (game: SessionState): LifecycleRuntime => (game.runtime ??= {}) as LifecycleRuntime;
const emit = (game: SessionState, event: Record<string, unknown>): void => { (runtime(game).combatEvents ??= []).push(event); };
export const getLifeState = (unit: UnitToken): LifeState => unit.lifeState ?? (unit.alive && (unit.hp == null || unit.hp > 0) ? 'alive' : 'dead-confirmed');
export function markHpZero(unit: UnitToken): void { unit.hp = 0; unit.lifeState = 'hp-zero'; unit.alive = false; }
export function markDeathPrevention(unit: UnitToken): void { unit.lifeState = 'death-prevention'; unit.alive = false; }
export function markDeathPrevented(unit: UnitToken, hp = 1): void { const state=normalizeCombatHpState(unit); unit.hp = Math.max(1, Math.min(state.hpMax, normalizeCombatHpValue(hp))); unit.lifeState = 'alive'; unit.alive = true; delete unit.deadAt; }
export function markDeathConfirmed(unit: UnitToken): void { unit.hp = 0; unit.lifeState = 'dead-confirmed'; unit.alive = false; }
export function markRemoved(unit: UnitToken): void { unit.lifeState = 'removed'; unit.alive = false; }
export function markErased(unit: UnitToken): void { unit.lifeState = 'erased'; unit.alive = false; }
const lifeKey = (candidate: Pick<HPZeroCandidate, 'trueSelfId' | 'incarnationSerial' | 'lifeSerial' | 'targetIid'>): string => candidate.trueSelfId ? lifeIdentityKey(candidate.trueSelfId, candidate.incarnationSerial, candidate.lifeSerial) : `${String(candidate.targetIid)}:${candidate.incarnationSerial}:${candidate.lifeSerial}`;
const authorityTag = (authority: DeathAuthority | undefined): RuleTag | null => authority === 'normal' || !authority ? null : authority;
export const compareDeathAuthority = (left: DeathAuthority | undefined, right: DeathAuthority | undefined): number => compareRuleTagPriority(authorityTag(left), authorityTag(right));
export function registerDeathPrevention(game: SessionState, collect: PreventionCollector): () => void {
  const state = runtime(game); const item = { serial: (state.deathPreventionSerial = (state.deathPreventionSerial ?? 0) + 1), collect }; (state.deathPreventionRegistrations ??= []).push(item);
  return () => { state.deathPreventionRegistrations = state.deathPreventionRegistrations?.filter(entry => entry !== item); };
}
export function collectDeathPreventionDecisions(game: SessionState, candidate: HPZeroCandidate): DeathPreventionDecision[] {
  const decisions: DeathPreventionDecision[] = [];
  for (const registration of runtime(game).deathPreventionRegistrations ?? []) { const found = registration.collect(candidate); for (const decision of found ? (Array.isArray(found) ? found : [found]) : []) decisions.push({ ...decision, registrationSerial: decision.registrationSerial ?? registration.serial }); }
  return decisions.sort((a, b) => compareDeathAuthority(b.authority, a.authority) || ((b.explicitPriority ?? b.priority ?? 0) - (a.explicitPriority ?? a.priority ?? 0)) || ((a.registrationSerial ?? 0) - (b.registrationSerial ?? 0)) || a.effectId.localeCompare(b.effectId));
}

export function registerImmediateRevive(game: SessionState, create: (record: DeathRecord) => { target: UnitToken; request: ReviveRequest } | null): () => void {
  const state = runtime(game); (state.immediateReviveRegistrations ??= []).push(create);
  return () => { state.immediateReviveRegistrations = state.immediateReviveRegistrations?.filter(item => item !== create); };
}

export function registerDeathReactions(game: SessionState, onDeath: (record: DeathRecord) => void, onKill: (record: DeathRecord) => void, priority=0): () => void {
  const state = runtime(game); const serial=state.reactionRegistrationSerial=(state.reactionRegistrationSerial??0)+1; const death={serial,priority,react:onDeath}, kill={serial,priority,react:onKill}; (state.deathReactionRegistrations ??= []).push(death); (state.killReactionRegistrations ??= []).push(kill);
  return () => { state.deathReactionRegistrations = state.deathReactionRegistrations?.filter(item => item !== death); state.killReactionRegistrations = state.killReactionRegistrations?.filter(item => item !== kill); };
}

const policyFor = (kind: CombatIdentityKind, target: UnitToken) => {
  const summon = kind === 'summon' || kind === 'summoned-creep' || kind === 'clone' || kind === 'combat-object';
  return { countsForKill: target.countsForKill !== false, countsForKillReward: !summon && target.countsForKill !== false, countsForReincarnation: !summon, canRevive: !summon && target.revivable !== false, removalPolicy: kind === 'combat-object' ? 'remove' : 'remain' };
};

export function createHpZeroCandidate(game: SessionState, target: UnitToken, identity: ActionIdentity, source: SourceAttribution, causeKind: DeathCauseKind, hpDamage: number, overkill = 0): HPZeroCandidate {
  const entityKind = assertCombatIdentity(target);
  markHpZero(target);
  const policy = policyFor(entityKind, target);
  const candidate: HPZeroCandidate = { targetIid: target.iid ?? target.id, trueSelfId: target.trueSelfId ?? null, incarnationSerial: target.incarnationSerial ?? 1, lifeSerial: target.lifeSerial ?? 1,
    actionId: identity.actionId, chainId: identity.chainId, parentActionId: identity.parentActionId, source, causeKind, committedHpDamage: hpDamage, overkill,
    slot: slotIndex(target.side, target.cx, target.cy), position: { cx: target.cx, cy: target.cy }, isLeader: entityKind === 'leader', isSummon: entityKind === 'summon' || entityKind === 'summoned-creep',
    ...policy, eventSerial: nextEventSerial(game), entityKind };
  const queue = runtime(game).hpZeroCandidates ??= [];
  const key = lifeKey(candidate); const opened = runtime(game).openHpZeroKeys ??= [];
  if (!opened.includes(key)) { opened.push(key); queue.push(candidate); emit(game, { type: 'HP_ZERO', ...candidate }); const chain=runtime(game).actionChains?.[String(identity.chainId)]; if(chain)chain.pendingHpZeroCandidates+=1; }
  return candidate;
}

export function resolveDeathWave(game: SessionState, prevention: (request: DeathPreventionRequest) => DeathPreventionDecision | null = () => null, actionId?: string | number): DeathRecord[] {
  const state = runtime(game); const allQueued = state.hpZeroCandidates ?? [];
  const queued = actionId == null ? allQueued : allQueued.filter(candidate => candidate.actionId === actionId);
  state.hpZeroCandidates = actionId == null ? [] : allQueued.filter(candidate => candidate.actionId !== actionId);
  for(const candidate of queued){const chain=state.actionChains?.[String(candidate.chainId)];if(chain)chain.pendingHpZeroCandidates=Math.max(0,chain.pendingHpZeroCandidates-1);}
  const confirmedKeys = state.confirmedLifeKeys ??= []; const opened = state.openHpZeroKeys ??= [];
  const close = (candidate: HPZeroCandidate) => { const key = lifeKey(candidate); state.openHpZeroKeys = opened.filter(item => item !== key); opened.splice(0, opened.length, ...(state.openHpZeroKeys ?? [])); };
  const tokens = new Map(game.tokens.map(unit => [unit.iid ?? unit.id, unit]));
  const candidates = [...new Map(queued.map(item => [lifeKey(item), item])).values()].filter(item => {
    const target = tokens.get(item.targetIid); const valid = !confirmedKeys.includes(lifeKey(item)) && !!target && (target.incarnationSerial ?? 1) === item.incarnationSerial && (target.lifeSerial ?? 1) === item.lifeSerial && Number(target.hp ?? 0) === 0 && (getLifeState(target) === 'hp-zero' || getLifeState(target) === 'death-prevention');
    if (!valid) close(item); return valid;
  }).sort((a, b) => a.slot - b.slot || String(a.targetIid).localeCompare(String(b.targetIid)) || a.eventSerial - b.eventSerial);
  for (const candidate of candidates) { const target = tokens.get(candidate.targetIid); if (target) markDeathPrevention(target); emit(game, { type: 'DEATH_PREVENTION_OPENED', ...candidate, eventSerial: nextEventSerial(game) }); }
  const confirmed: Array<{ candidate: HPZeroCandidate; target: UnitToken }> = [];
  for (const candidate of candidates) {
    const target = tokens.get(candidate.targetIid); if (!target || (target.lifeSerial ?? 1) !== candidate.lifeSerial) continue;
    if (Number(target.hp ?? 0) !== 0 || getLifeState(target) !== 'death-prevention') continue;
    const collected = collectDeathPreventionDecisions(game, candidate); const decision = collected[0] ?? prevention({ candidate, decisions: collected });
    if (decision?.prevent) {
      markDeathPrevented(target, Math.min(Number(target.hpMax ?? 1), decision.hp));
      const consumedStatus = decision.charge?.consumeStatusId;
      if (typeof consumedStatus === 'string') target.statuses = target.statuses?.filter(status => status.id !== consumedStatus);
      const resetMaxHpTo = decision.charge?.resetMaxHpTo;
      if (typeof resetMaxHpTo === 'number' && Number.isFinite(resetMaxHpTo)) target.hpMax = Math.max(1, Math.floor(resetMaxHpTo));
      const consumeUnitFlag = decision.charge?.consumeUnitFlag;
      if (typeof consumeUnitFlag === 'string') (target as unknown as Record<string, unknown>)[consumeUnitFlag] = true;
      const resetBonusFlag = decision.charge?.resetBonusFlag;
      if (typeof resetBonusFlag === 'string') (target as unknown as Record<string, unknown>)[resetBonusFlag] = 0;
      const setFields = decision.charge?.setFields;
      if (setFields && typeof setFields === 'object') Object.assign(target, setFields);
      if (target.hp != null && target.hpMax != null) target.hp = Math.min(target.hp, target.hpMax);
      close(candidate); emit(game, { type: 'DEATH_PREVENTED', eventSerial: nextEventSerial(game), actionId: candidate.actionId, chainId: candidate.chainId, targetIid: candidate.targetIid, trueSelfId: candidate.trueSelfId, lifeSerial: candidate.lifeSerial, decision });
    }
    else confirmed.push({ candidate, target });
  }
  for (const item of confirmed) markDeathConfirmed(item.target);
  const records = confirmed.map(({ candidate }) => {
    const deathSerial = nextDeathSerial(game); const record: DeathRecord = { ...candidate, deathId: `death-${deathSerial}`, deathSerial, countsForKill: candidate.countsForKill, revivable: candidate.canRevive, confirmedEventSerial: nextEventSerial(game) };
  confirmedKeys.push(lifeKey(candidate)); close(candidate); return record;
  });
  (state.deathRecords ??= []).push(...records); const registry = state.deathRecordById ??= {}; records.forEach(record => { registry[record.deathId] = record; });
  for (const record of records) emit(game, { type: 'DEATH_CONFIRMED', ...record, eventSerial: record.confirmedEventSerial });
  observeReincarnationDeathWave(game, records);
  for (const record of records) {
    if (record.countsForKill && record.source.creditTrueSelfId && record.source.creditTrueSelfId !== record.trueSelfId) { ensureTrueSelfCombatRecord(game, String(record.source.creditTrueSelfId)).confirmedKills += 1; emit(game, { type: 'KILL_CREDIT_GRANTED', eventSerial: nextEventSerial(game), deathId: record.deathId, actionId: record.actionId, chainId: record.chainId, targetIid: record.targetIid, trueSelfId: record.trueSelfId, incarnationSerial: record.incarnationSerial, lifeSerial: record.lifeSerial, creditTrueSelfId: record.source.creditTrueSelfId }); }
  }
  const deathReactionQueue=records.flatMap(record=>(state.deathReactionRegistrations??[]).map(registration=>({record,registration}))).sort((a,b)=>b.registration.priority-a.registration.priority||a.registration.serial-b.registration.serial||a.record.deathSerial-b.record.deathSerial);
  const killReactionQueue=records.filter(record=>record.source.creditTrueSelfId&&record.source.creditTrueSelfId!==record.trueSelfId).flatMap(record=>(state.killReactionRegistrations??[]).map(registration=>({record,registration}))).sort((a,b)=>b.registration.priority-a.registration.priority||a.registration.serial-b.registration.serial||a.record.deathSerial-b.record.deathSerial);
  for(const entry of deathReactionQueue){const chain=state.actionChains?.[String(entry.record.chainId)];if(chain)chain.pendingDeathReactions+=1;try{entry.registration.react(entry.record);}finally{if(chain)chain.pendingDeathReactions-=1;}}
  for(const entry of killReactionQueue){const chain=state.actionChains?.[String(entry.record.chainId)];if(chain)chain.pendingKillReactions+=1;try{entry.registration.react(entry.record);}finally{if(chain)chain.pendingKillReactions-=1;}}
  const immediateReviveQueue: Array<{ target: UnitToken; request: ReviveRequest }> = [];
  for (const record of records) for (const create of state.immediateReviveRegistrations ?? []) { const request = create(record); if (request) immediateReviveQueue.push(request); }
  for (const entry of immediateReviveQueue) {const chain=state.actionChains?.[String(entry.request.death.chainId)];if(chain)chain.pendingImmediateRevives+=1;try{commitImmediateRevive(game, entry.target, entry.request);}finally{if(chain)chain.pendingImmediateRevives-=1;}}
  finalizeRebirthClaimWindows(game);
  return records;
}

export function commitImmediateRevive(game: SessionState, target: UnitToken, request: ReviveRequest): ReviveResult {
  const death = request.death;
  const state = runtime(game); const reason = evaluateReviveEligibility(game, death, target, request);
  if (reason !== 'allowed') return { committed: false, reason, targetIid: death.targetIid, lifeSerial: target.lifeSerial ?? death.lifeSerial };
  const consumed = state.revivedDeathIds ??= [];
  const hpMax = Math.max(1, normalizeCombatHpState(target).hpMax); const hp = request.hpPolicy.kind === 'ratio' ? normalizeCombatHpValue(hpMax * request.hpPolicy.value) : normalizeCombatHpValue(request.hpPolicy.value);
  target.hp = Math.max(1, Math.min(hpMax, hp)); const lifeSerial = beginRevivedLife(target); target.lifeState = 'alive'; target.alive = true;
  if (request.ragePolicy === 'reset') target.rage = 0;
  if (request.buffPolicy === 'purge' || request.buffPolicy === 'purge-purgeable-debuffs') target.statuses = target.statuses?.filter(status => status.kind !== 'debuff' || status.unpurgeable === true);
  else if (request.buffPolicy === 'clear-temporary') target.statuses = target.statuses?.filter(status => status.unpurgeable === true || status.permanent === true);
  else if (request.buffPolicy === 'explicit-list') { const ids = new Set(request.statusIds ?? []); target.statuses = target.statuses?.filter(status => !ids.has(String(status.id))); }
  consumed.push(death.deathId);
  markReincarnationEscapedByRevive(game, death.deathId);
  const eventSerial=nextEventSerial(game);
  if(death.trueSelfId)ensureTrueSelfCombatRecord(game,death.trueSelfId).reviveHistory.push({deathId:death.deathId,incarnationSerial:death.incarnationSerial,fromLifeSerial:death.lifeSerial,toLifeSerial:lifeSerial,eventSerial});
  emit(game, { type: 'REVIVE_COMMITTED', eventSerial, deathId: death.deathId, actionId: death.actionId, chainId: death.chainId, targetIid: death.targetIid, trueSelfId: death.trueSelfId, incarnationSerial: death.incarnationSerial, lifeSerial, hp: target.hp, source: request.source, authority: request.authority ?? null });
  return { committed: true, reason: null, targetIid: death.targetIid, lifeSerial };
}

/** Canonical gate used by every immediate and scheduled revive path. */
export function evaluateReviveEligibility(game: SessionState, death: DeathRecord, target: UnitToken, request?: Pick<ReviveRequest, 'allowSummon'>): ReviveEligibilityReason {
  const state = runtime(game);
  const canonical = state.deathRecordById?.[death.deathId];
  if (!canonical || canonical.targetIid !== death.targetIid || canonical.trueSelfId !== death.trueSelfId || canonical.incarnationSerial !== death.incarnationSerial || canonical.lifeSerial !== death.lifeSerial || canonical.confirmedEventSerial !== death.confirmedEventSerial) return 'invalid-death';
  if (state.battleEnd?.ended) return 'battle-ended';
  if (hasEnteredReincarnation(game, death.deathId)) return 'entered-reincarnation';
  if ((target as UnitToken & { removalKind?: string }).removalKind === 'FUSION_CONSUMED') return 'fused';
  const lifeState = getLifeState(target); if (lifeState === 'erased') return 'erased'; if (lifeState === 'removed') return 'removed';
  if (target.trueSelfId !== death.trueSelfId) return 'identity-mismatch';
  if ((target.iid ?? target.id) !== death.targetIid || (target.incarnationSerial ?? 1) !== death.incarnationSerial || (target.lifeSerial ?? 1) !== death.lifeSerial) return 'stale-life';
  if ((state.revivedDeathIds ?? []).includes(death.deathId)) return 'already-revived';
  if (lifeState !== 'dead-confirmed') return 'already-revived';
  if (!canonical.revivable || !death.canRevive) return 'non-revivable';
  if (death.isSummon && !request?.allowSummon) return 'summon-not-revivable';
  return 'allowed';
}
