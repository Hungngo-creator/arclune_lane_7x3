import type { SessionState } from '@shared-types/combat';
import type { DeathRecord } from './life-cycle.ts';
import { nextEventSerial } from './sequence.ts';
import { ensureTrueSelfCombatRecord, lifeIdentityKey } from './true-self.ts';

export type ReincarnationState = 'waiting' | 'entered' | 'escaped-by-revive' | 'reborn';
export interface ReincarnationRecord {
  reincarnationId: string; deathId: string; targetIid: string | number; trueSelfId: string; incarnationSerial: number; deadLifeSerial: number;
  deathOrdinal: number; thresholdOrdinal: number; enteredAtDeathOrdinal: number | null; enteredAtEventSerial: number | null;
  sourceActionId: string | number; sourceChainId: string | number; entityKind: DeathRecord['entityKind']; state: ReincarnationState;
  authority: { kind: 'reincarnation'; thresholdSubsequentDeaths: number };
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
    const key = reincarnationLifeKey(record.trueSelfId, record.incarnationSerial, record.deadLifeSerial); const entered = rt.enteredReincarnationLifeKeys ??= []; if (!entered.includes(key)) entered.push(key);
    for (const entry of rt.delayedRevives ?? []) if (entry.deathId === record.deathId && (entry.state === 'queued' || entry.state === 'due')) {
      entry.state = 'blocked'; entry.resultReason = 'entered-reincarnation'; emit(game, record, 'DELAYED_REVIVE_BLOCKED_BY_REINCARNATION', ordinal);
    }
  }
}

export function hasEnteredReincarnation(game: SessionState, deathId: string): boolean { return runtime(game).reincarnationByDeathId?.[deathId]?.state === 'entered'; }
export function markReincarnationEscapedByRevive(game: SessionState, deathId: string): void {
  const record = runtime(game).reincarnationByDeathId?.[deathId]; if (!record || record.state !== 'waiting') return;
  record.state = 'escaped-by-revive'; emit(game, record, 'REINCARNATION_ESCAPED_BY_REVIVE', runtime(game).qualifyingDeathOrdinal ?? record.deathOrdinal);
}
