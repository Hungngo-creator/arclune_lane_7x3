import type { SessionState } from '@shared-types/combat';
import type { Side, UnitToken } from '../../types/units.ts';
import { commitImmediateRevive, getLifeState, type ReviveRequest } from './life-cycle.ts';
import { nextEventSerial } from './sequence.ts';

export type DelayedReviveClockPolicy = 'global-natural-actions' | 'ally-natural-actions' | 'enemy-natural-actions' | 'side-pass' | 'global-ssi-cycle' | 'target-side-opportunities';
export type DelayedReviveEligibilityReason = 'allowed' | 'entered-reincarnation' | 'erased' | 'fused' | 'battle-ended' | 'stale-life' | 'already-revived' | 'non-revivable';
export interface DelayedReviveEntry {
  queueId: string; deathId: string; targetIid: string | number; trueSelfId: string; deadLifeSerial: number;
  requestSource: ReviveRequest['source']; scheduledAtEventSerial: number; clockPolicy: DelayedReviveClockPolicy;
  delayAmount: number; dueValue: number; insertionSerial: number; eligibilityPolicy: string; revivePolicies: Omit<ReviveRequest, 'death' | 'source'>;
  state: 'queued' | 'due' | 'committed' | 'blocked' | 'cancelled'; resultReason?: DelayedReviveEligibilityReason;
}
type Scheduler = { delayedRevives?: DelayedReviveEntry[]; delayedReviveClocks?: Partial<Record<DelayedReviveClockPolicy, number>>; delayedReviveSerial?: number; battleEnd?: { ended?: boolean } };
const state = (game: SessionState): Scheduler => (game.runtime ??= {}) as Scheduler;
export function scheduleDelayedRevive(game: SessionState, input: Omit<DelayedReviveEntry, 'queueId' | 'scheduledAtEventSerial' | 'dueValue' | 'insertionSerial' | 'state'>): DelayedReviveEntry {
  const rt = state(game); const insertionSerial = (rt.delayedReviveSerial = (rt.delayedReviveSerial ?? 0) + 1);
  const current = rt.delayedReviveClocks?.[input.clockPolicy] ?? 0;
  const entry: DelayedReviveEntry = { ...input, queueId: `delayed-revive-${insertionSerial}`, scheduledAtEventSerial: nextEventSerial(game), dueValue: current + Math.max(0, Math.floor(input.delayAmount)), insertionSerial, state: 'queued' };
  (rt.delayedRevives ??= []).push(entry); return entry;
}
export function canCommitDelayedRevive(entry: DelayedReviveEntry, game: SessionState): DelayedReviveEligibilityReason {
  const rt = state(game); if (rt.battleEnd?.ended) return 'battle-ended';
  const death = ((game.runtime as { deathRecords?: Array<{ deathId: string; revivable: boolean }> }).deathRecords ?? []).find(item => item.deathId === entry.deathId);
  if (!death?.revivable) return 'non-revivable';
  const target = game.tokens.find(unit => (unit.iid ?? unit.id) === entry.targetIid);
  if (!target || target.trueSelfId !== entry.trueSelfId || (target.lifeSerial ?? 1) !== entry.deadLifeSerial) return 'stale-life';
  if (getLifeState(target) === 'erased') return 'erased'; if (getLifeState(target) !== 'dead-confirmed') return 'already-revived'; return 'allowed';
}
export function advanceDelayedReviveClock(game: SessionState, policy: DelayedReviveClockPolicy, amount = 1, _side?: Side): DelayedReviveEntry[] {
  const rt = state(game); const clocks = rt.delayedReviveClocks ??= {}; clocks[policy] = (clocks[policy] ?? 0) + Math.max(0, Math.floor(amount));
  const due = (rt.delayedRevives ?? []).filter(entry => entry.state === 'queued' && entry.clockPolicy === policy && entry.dueValue <= clocks[policy]!).sort((a, b) => a.dueValue - b.dueValue || a.insertionSerial - b.insertionSerial);
  for (const entry of due) {
    entry.state = 'due'; const reason = canCommitDelayedRevive(entry, game); entry.resultReason = reason;
    if (reason !== 'allowed') { entry.state = reason === 'battle-ended' ? 'cancelled' : 'blocked'; continue; }
    const death = ((game.runtime as { deathRecords: ReviveRequest['death'][] }).deathRecords).find(item => item.deathId === entry.deathId)!;
    const target = game.tokens.find(unit => (unit.iid ?? unit.id) === entry.targetIid) as UnitToken;
    const result = commitImmediateRevive(game, target, { death, source: entry.requestSource, ...entry.revivePolicies }); entry.state = result.committed ? 'committed' : 'blocked';
  }
  return due;
}
