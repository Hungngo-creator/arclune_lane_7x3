import type { SessionState } from '@shared-types/combat';
import type { DeathRecord } from './life-cycle.ts';
import { nextEventSerial } from './sequence.ts';
import { ensureTrueSelfCombatRecord, lifeIdentityKey } from './true-self.ts';
import { commitNonDeathRemoval } from './non-death-removal.ts';
import type { MechanicClaim } from '../canonical-model.ts';
import { resolveDirectConflictV1 } from '../canonical-model.ts';

export type ReincarnationState = 'waiting' | 'entered' | 'rebirth-claim-open' | 'rebirth-reserved' | 'escaped-by-revive' | 'reborn' | 'departed-from-battle';
export interface RebirthClaim { readonly effectId: string; readonly trueSelfId: string; readonly incarnationSerial: number; readonly deadLifeSerial: number; readonly deathId: string; readonly authorityClaim: MechanicClaim; readonly policy: 'immediate' | 'reserved'; readonly destination: Readonly<{ side: 'ally' | 'enemy'; cx: number; cy: number }>; readonly hpPolicy: number | 'full'; readonly ragePolicy: number; readonly statusPolicy?: readonly string[]; readonly duePolicy?: string }
export interface RebirthReservation { readonly reservationId: string; readonly effectId: string; readonly deathId: string; readonly trueSelfId: string; readonly incarnationSerial: number; readonly deadLifeSerial: number; readonly duePolicy: string; readonly destination: RebirthClaim['destination']; consumed: boolean; canceledReason: string | null }
export interface ReincarnationRecord {
  reincarnationId: string; deathId: string; targetIid: string | number; trueSelfId: string; incarnationSerial: number; deadLifeSerial: number;
  deathOrdinal: number; thresholdOrdinal: number; enteredAtDeathOrdinal: number | null; enteredAtEventSerial: number | null;
  sourceActionId: string | number; sourceChainId: string | number; entityKind: DeathRecord['entityKind']; state: ReincarnationState;
  authority: { kind: 'reincarnation'; thresholdSubsequentDeaths: number };
  claims?: RebirthClaim[]; winningClaim?: RebirthClaim; reservation?: RebirthReservation;
}
type Runtime = { combatEvents?: Record<string, unknown>[]; qualifyingDeathOrdinal?: number; qualifyingDeathHistory?: Array<{ deathId: string; ordinal: number; trueSelfId: string; incarnationSerial: number; lifeSerial: number }>; reincarnationByDeathId?: Record<string, ReincarnationRecord>; reincarnationByLifeKey?: Record<string, ReincarnationRecord>; enteredReincarnationLifeKeys?: string[]; reincarnationThresholdSubsequentDeaths?: number; delayedRevives?: Array<{ deathId: string; state: string; resultReason?: string }> };
const runtime = (game: SessionState): Runtime => (game.runtime ??= {}) as Runtime;
export const reincarnationLifeKey = lifeIdentityKey;
const emit = (game: SessionState, record: ReincarnationRecord, type: string, ordinal: number): number => {
  const eventSerial = nextEventSerial(game); (runtime(game).combatEvents ??= []).push({ type, eventSerial, deathId: record.deathId, trueSelfId: record.trueSelfId, incarnationSerial: record.incarnationSerial, lifeSerial: record.deadLifeSerial, ordinal, actionId: record.sourceActionId, chainId: record.sourceChainId }); return eventSerial;
};

/** Sole observer allowed to advance death-order reincarnation state. */
export function observeReincarnationDeathWave(game: SessionState, records: readonly DeathRecord[]): void {
  const rt = runtime(game); const threshold = Math.max(0, Math.floor(rt.reincarnationThresholdSubsequentDeaths ?? 4));
  const byDeath = rt.reincarnationByDeathId ??= {}; const byLife = rt.reincarnationByLifeKey ??= {}; const history = rt.qualifyingDeathHistory ??= [];
  for (const death of records) {
    if (!death.countsForReincarnation || !death.trueSelfId) continue;
    if (byDeath[death.deathId] || history.some(item => item.deathId === death.deathId)) continue;
    const ordinal = rt.qualifyingDeathOrdinal = (rt.qualifyingDeathOrdinal ?? 0) + 1;
    history.push({ deathId: death.deathId, ordinal, trueSelfId: death.trueSelfId, incarnationSerial: death.incarnationSerial, lifeSerial: death.lifeSerial });
    const record: ReincarnationRecord = { reincarnationId: `reincarnation-${death.deathId}`, deathId: death.deathId, targetIid: death.targetIid, trueSelfId: death.trueSelfId, incarnationSerial: death.incarnationSerial, deadLifeSerial: death.lifeSerial, deathOrdinal: ordinal, thresholdOrdinal: ordinal + threshold, enteredAtDeathOrdinal: null, enteredAtEventSerial: null, sourceActionId: death.actionId, sourceChainId: death.chainId, entityKind: death.entityKind, state: 'waiting', authority: { kind: 'reincarnation', thresholdSubsequentDeaths: threshold } };
    byDeath[death.deathId] = record; byLife[reincarnationLifeKey(death.trueSelfId, death.incarnationSerial, death.lifeSerial)] = record;
    ensureTrueSelfCombatRecord(game, death.trueSelfId).reincarnationHistory.push({ deathId: death.deathId, incarnationSerial: death.incarnationSerial, lifeSerial: death.lifeSerial, ordinal });
    emit(game, record, 'QUALIFYING_DEATH_RECORDED', ordinal); emit(game, record, 'REINCARNATION_WAITING', ordinal);
  }
  const ordinal = rt.qualifyingDeathOrdinal ?? 0;
  for (const record of Object.values(byDeath).sort((a, b) => a.deathOrdinal - b.deathOrdinal || a.deathId.localeCompare(b.deathId))) {
    if (record.state !== 'waiting' || ordinal < record.thresholdOrdinal) continue;
    record.state = 'entered'; record.enteredAtDeathOrdinal = ordinal; record.enteredAtEventSerial = emit(game, record, 'REINCARNATION_ENTERED', ordinal);
    record.state = 'rebirth-claim-open'; emit(game, record, 'REBIRTH_CLAIM_WINDOW_OPENED', ordinal);
    const key = reincarnationLifeKey(record.trueSelfId, record.incarnationSerial, record.deadLifeSerial); const entered = rt.enteredReincarnationLifeKeys ??= []; if (!entered.includes(key)) entered.push(key);
    for (const entry of rt.delayedRevives ?? []) if (entry.deathId === record.deathId && (entry.state === 'queued' || entry.state === 'due')) {
      entry.state = 'blocked'; entry.resultReason = 'entered-reincarnation'; emit(game, record, 'DELAYED_REVIVE_BLOCKED_BY_REINCARNATION', ordinal);
    }
  }
}

export function hasEnteredReincarnation(game: SessionState, deathId: string): boolean {
  const state = runtime(game).reincarnationByDeathId?.[deathId]?.state;
  return state === 'entered' || state === 'rebirth-claim-open' || state === 'rebirth-reserved' || state === 'reborn' || state === 'departed-from-battle';
}
export function markReincarnationEscapedByRevive(game: SessionState, deathId: string): void {
  const record = runtime(game).reincarnationByDeathId?.[deathId]; if (!record || record.state !== 'waiting') return;
  record.state = 'escaped-by-revive'; emit(game, record, 'REINCARNATION_ESCAPED_BY_REVIVE', runtime(game).qualifyingDeathOrdinal ?? record.deathOrdinal);
}

export function submitRebirthClaim(game: SessionState, claim: RebirthClaim): void {
  const record = runtime(game).reincarnationByDeathId?.[claim.deathId];
  if (!record || record.state === 'departed-from-battle') throw new Error('[rebirth] departed-from-battle');
  if (record.state !== 'rebirth-claim-open') throw new Error('[rebirth] claim-window-closed');
  if (claim.trueSelfId !== record.trueSelfId || claim.incarnationSerial !== record.incarnationSerial || claim.deadLifeSerial !== record.deadLifeSerial) throw new Error('[rebirth] identity-mismatch');
  if (claim.policy === 'reserved' && !claim.duePolicy) throw new Error('[rebirth] reserved claim requires an explicit duePolicy');
  (record.claims ??= []).push(claim);
}

export function finalizeRebirthClaimWindows(game: SessionState): void {
  const state = runtime(game);
  for (const record of Object.values(state.reincarnationByDeathId ?? {})) {
    if (record.state !== 'rebirth-claim-open') continue;
    let winner = record.claims?.[0];
    for (const candidate of record.claims?.slice(1) ?? []) {
      if (!winner) winner = candidate;
      else winner = resolveDirectConflictV1(winner.authorityClaim, candidate.authorityClaim) === candidate.authorityClaim ? candidate : winner;
    }
    if (winner) {
      record.winningClaim = winner;
      if (winner.policy === 'reserved') {
        record.reservation = { reservationId: `rebirth-reservation-${record.deathId}-${winner.effectId}`, effectId: winner.effectId, deathId: record.deathId, trueSelfId: record.trueSelfId, incarnationSerial: record.incarnationSerial, deadLifeSerial: record.deadLifeSerial, duePolicy: winner.duePolicy!, destination: winner.destination, consumed: false, canceledReason: null };
        record.state = 'rebirth-reserved'; emit(game, record, 'REBIRTH_RESERVED', state.qualifyingDeathOrdinal ?? record.deathOrdinal);
      } else record.state = 'entered';
      continue;
    }
    record.state = 'departed-from-battle';
    const token = game.tokens.find(unit => (unit.iid ?? unit.id) === record.targetIid);
    if (token) { commitNonDeathRemoval(game, token, 'REMOVED', 'reincarnation-departed-from-battle'); game.tokens = game.tokens.filter(unit => unit !== token); }
    emit(game, record, 'REINCARNATION_DEPARTED_FROM_BATTLE', state.qualifyingDeathOrdinal ?? record.deathOrdinal);
  }
}