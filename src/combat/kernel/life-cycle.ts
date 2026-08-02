import type { SessionState } from '@shared-types/combat';
import type { LifeState, Side, UnitToken } from '../../types/units.ts';
import { beginRevivedLife } from './combat-identity.ts';
import { nextDeathSerial, nextEventSerial } from './sequence.ts';
import type { ActionIdentity, SourceAttribution } from './types.ts';

export type DeathCauseKind = 'damage' | 'dot' | 'reflected' | 'environment' | 'self-damage' | 'sacrifice' | 'non-damage-hp-loss';
export interface HPZeroCandidate {
  targetIid: string | number; trueSelfId: string | null; lifeSerial: number; actionId: string | number; chainId: string | number;
  parentActionId: string | number | null; source: SourceAttribution; causeKind: DeathCauseKind; committedHpDamage: number; overkill: number;
  slot: number; position: { cx: number; cy: number }; isLeader: boolean; isSummon: boolean; countsForReincarnation: boolean; eventSerial: number;
}
export interface DeathRecord extends HPZeroCandidate {
  deathId: string; deathSerial: number; countsForKill: boolean; revivable: boolean; confirmedEventSerial: number;
}
export interface DeathPreventionDecision { prevent: boolean; hp: number; effectId: string; authority?: string; priority?: number }
export interface DeathPreventionRequest { candidate: HPZeroCandidate; decisions: readonly DeathPreventionDecision[] }
export interface ReviveRequest { death: DeathRecord; hpPolicy: { kind: 'flat' | 'ratio'; value: number }; ragePolicy: 'preserve' | 'reset'; aePolicy: 'preserve' | 'reset'; buffPolicy: 'preserve' | 'purge'; positionPolicy: 'preserve'; source: SourceAttribution; authority?: string; allowSummon?: boolean }
export interface ReviveResult { committed: boolean; reason: string | null; targetIid: string | number; lifeSerial: number }

type LifecycleRuntime = { combatEvents?: Record<string, unknown>[]; hpZeroCandidates?: HPZeroCandidate[]; deathRecords?: DeathRecord[]; trueSelfRecords?: Record<string, { confirmedKills: number }>; battleEnd?: { over: boolean; winner: Side | 'draw' | null } };
const runtime = (game: SessionState): LifecycleRuntime => (game.runtime ??= {}) as LifecycleRuntime;
const emit = (game: SessionState, event: Record<string, unknown>): void => { (runtime(game).combatEvents ??= []).push(event); };
export const getLifeState = (unit: UnitToken): LifeState => unit.lifeState ?? (unit.alive && (unit.hp ?? 0) > 0 ? 'alive' : 'dead-confirmed');
export const isCombatAlive = (unit: UnitToken): boolean => getLifeState(unit) === 'alive' && unit.alive !== false && (unit.hp ?? 0) > 0;
export function markHpZero(unit: UnitToken): void { unit.lifeState = 'hp-zero'; unit.alive = false; }
export function markDeathPrevention(unit: UnitToken): void { unit.lifeState = 'death-prevention'; unit.alive = false; }
export function markDeathPrevented(unit: UnitToken, hp = 1): void { unit.hp = Math.max(1, hp); unit.lifeState = 'alive'; unit.alive = true; }
export function markDeathConfirmed(unit: UnitToken): void { unit.lifeState = 'dead-confirmed'; unit.alive = false; }
export function markRemoved(unit: UnitToken): void { unit.lifeState = 'removed'; unit.alive = false; }
export function markErased(unit: UnitToken): void { unit.lifeState = 'erased'; unit.alive = false; }

export function createHpZeroCandidate(game: SessionState, target: UnitToken, identity: ActionIdentity, source: SourceAttribution, causeKind: DeathCauseKind, hpDamage: number, overkill = 0): HPZeroCandidate {
  if (!target.trueSelfId && !target.isMinion && (target.hpMax ?? 0) > 0) throw new Error('[combat-lifecycle] HP-bearing non-summon is missing trueSelfId');
  markHpZero(target);
  const candidate: HPZeroCandidate = { targetIid: target.iid ?? target.id, trueSelfId: target.trueSelfId ?? null, lifeSerial: target.lifeSerial ?? 1,
    actionId: identity.actionId, chainId: identity.chainId, parentActionId: identity.parentActionId, source, causeKind, committedHpDamage: hpDamage, overkill,
    slot: target.cy * 3 + target.cx, position: { cx: target.cx, cy: target.cy }, isLeader: target.isLeader === true, isSummon: target.isMinion === true,
    countsForReincarnation: target.isMinion !== true, eventSerial: nextEventSerial(game) };
  const queue = runtime(game).hpZeroCandidates ??= [];
  if (!queue.some(item => item.targetIid === candidate.targetIid && item.lifeSerial === candidate.lifeSerial)) queue.push(candidate);
  emit(game, { type: 'HP_ZERO', ...candidate });
  return candidate;
}

export function resolveDeathWave(game: SessionState, prevention: (request: DeathPreventionRequest) => DeathPreventionDecision | null = () => null): DeathRecord[] {
  const state = runtime(game); const queued = state.hpZeroCandidates ?? []; state.hpZeroCandidates = [];
  const candidates = [...new Map(queued.map(item => [`${item.targetIid}:${item.lifeSerial}`, item])).values()].sort((a, b) => a.slot - b.slot || String(a.targetIid).localeCompare(String(b.targetIid)) || a.eventSerial - b.eventSerial);
  const tokens = new Map(game.tokens.map(unit => [unit.iid ?? unit.id, unit]));
  for (const candidate of candidates) { const target = tokens.get(candidate.targetIid); if (target) markDeathPrevention(target); emit(game, { type: 'DEATH_PREVENTION_OPENED', ...candidate, eventSerial: nextEventSerial(game) }); }
  const confirmed: Array<{ candidate: HPZeroCandidate; target: UnitToken }> = [];
  for (const candidate of candidates) {
    const target = tokens.get(candidate.targetIid); if (!target || (target.lifeSerial ?? 1) !== candidate.lifeSerial) continue;
    const decision = prevention({ candidate, decisions: [] });
    if (decision?.prevent) { markDeathPrevented(target, decision.hp); emit(game, { type: 'DEATH_PREVENTED', eventSerial: nextEventSerial(game), actionId: candidate.actionId, chainId: candidate.chainId, targetIid: candidate.targetIid, trueSelfId: candidate.trueSelfId, lifeSerial: candidate.lifeSerial, decision }); }
    else confirmed.push({ candidate, target });
  }
  for (const item of confirmed) markDeathConfirmed(item.target);
  const records = confirmed.map(({ candidate, target }) => {
    const deathSerial = nextDeathSerial(game); const record: DeathRecord = { ...candidate, deathId: `death-${deathSerial}`, deathSerial, countsForKill: target.countsForKill !== false, revivable: target.revivable !== false, confirmedEventSerial: nextEventSerial(game) };
    emit(game, { type: 'DEATH_CONFIRMED', ...record, eventSerial: record.confirmedEventSerial });
    if (record.countsForKill && record.source.creditTrueSelfId && record.source.creditTrueSelfId !== record.trueSelfId) { const owner = state.trueSelfRecords ??= {}; (owner[String(record.source.creditTrueSelfId)] ??= { confirmedKills: 0 }).confirmedKills += 1; emit(game, { type: 'KILL_CREDIT_GRANTED', eventSerial: nextEventSerial(game), deathId: record.deathId, actionId: record.actionId, chainId: record.chainId, targetIid: record.targetIid, trueSelfId: record.trueSelfId, lifeSerial: record.lifeSerial, creditTrueSelfId: record.source.creditTrueSelfId }); }
    return record;
  });
  (state.deathRecords ??= []).push(...records); return records;
}

export function commitImmediateRevive(game: SessionState, target: UnitToken, request: ReviveRequest): ReviveResult {
  const death = request.death;
  if ((target.iid ?? target.id) !== death.targetIid || getLifeState(target) !== 'dead-confirmed' || (target.lifeSerial ?? 1) !== death.lifeSerial) return { committed: false, reason: 'stale-or-not-dead', targetIid: death.targetIid, lifeSerial: target.lifeSerial ?? 1 };
  if (death.isSummon && !request.allowSummon) return { committed: false, reason: 'summon-not-revivable', targetIid: death.targetIid, lifeSerial: death.lifeSerial };
  if ((runtime(game).combatEvents ?? []).some(event => event.type === 'REVIVE_COMMITTED' && event.deathId === death.deathId)) return { committed: false, reason: 'already-revived', targetIid: death.targetIid, lifeSerial: death.lifeSerial };
  const hpMax = Math.max(1, Number(target.hpMax ?? 1)); const hp = request.hpPolicy.kind === 'ratio' ? Math.floor(hpMax * request.hpPolicy.value) : Math.floor(request.hpPolicy.value);
  target.hp = Math.max(1, Math.min(hpMax, hp)); const lifeSerial = beginRevivedLife(target); target.lifeState = 'alive'; target.alive = true;
  if (request.ragePolicy === 'reset') target.rage = 0; if (request.aePolicy === 'reset') target.ae = 0; if (request.buffPolicy === 'purge') target.statuses = [];
  emit(game, { type: 'REVIVE_COMMITTED', eventSerial: nextEventSerial(game), deathId: death.deathId, actionId: death.actionId, chainId: death.chainId, targetIid: death.targetIid, trueSelfId: death.trueSelfId, lifeSerial, hp: target.hp, source: request.source, authority: request.authority ?? null });
  return { committed: true, reason: null, targetIid: death.targetIid, lifeSerial };
}
