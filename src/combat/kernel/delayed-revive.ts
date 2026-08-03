import type { SessionState } from '@shared-types/combat';
import type { Side, UnitToken } from '../../types/units.ts';
import { commitImmediateRevive, evaluateReviveEligibility, type ReviveRequest } from './life-cycle.ts';
import { nextEventSerial } from './sequence.ts';

export type DelayedReviveClockPolicy = 'global-natural-actions' | 'ally-natural-actions' | 'enemy-natural-actions' | 'side-pass' | 'global-ssi-cycle' | 'target-side-opportunities';
export type DelayedReviveEligibilityReason = 'allowed' | 'entered-reincarnation' | 'erased' | 'fused' | 'battle-ended' | 'stale-life' | 'already-revived' | 'non-revivable';
export type SsiTemporalEventType = 'NATURAL_ACTION_STARTED' | 'NATURAL_ACTION_COMPLETED' | 'NATURAL_ACTION_CONSUMED_BY_CC' | 'SIDE_PASS_COMPLETED' | 'SSI_CYCLE_COMPLETED' | 'TARGET_SIDE_OPPORTUNITY';
export interface SsiTemporalEvent { type: SsiTemporalEventType; eventSerial: number; actorSide: Side | null; actorIid: string | number | null; slot: number | null; cursorSnapshot: { ally: number; enemy: number }; sidePassSerial: number; globalCycleSerial: number; actionId: string | number | null; targetSide?: Side }
export interface DelayedReviveEntry {
  queueId: string; deathId: string; targetIid: string | number; trueSelfId: string; deadLifeSerial: number; targetSide: Side;
  watchedSide?: Side; requestSource: ReviveRequest['source']; scheduledAtEventSerial: number; clockPolicy: DelayedReviveClockPolicy; clockStartValue: number;
  delayAmount: number; dueValue: number; insertionSerial: number; eligibilityPolicy: string; revivePolicies: Omit<ReviveRequest, 'death' | 'source'>;
  state: 'queued' | 'due' | 'committed' | 'blocked' | 'cancelled'; resultReason?: DelayedReviveEligibilityReason;
}
type Scheduler = { delayedRevives?: DelayedReviveEntry[]; delayedReviveClocks?: Partial<Record<DelayedReviveClockPolicy, number>>; delayedReviveSerial?: number; battleEnd?: { ended?: boolean }; combatEvents?: Record<string, unknown>[]; ssiSidePassSerial?: number; ssiCycleSerial?: number };
const state = (game: SessionState): Scheduler => (game.runtime ??= {}) as Scheduler;
export function scheduleDelayedRevive(game: SessionState, input: Omit<DelayedReviveEntry, 'queueId' | 'scheduledAtEventSerial' | 'clockStartValue' | 'dueValue' | 'insertionSerial' | 'state'>): DelayedReviveEntry {
  const rt = state(game); const insertionSerial = rt.delayedReviveSerial = (rt.delayedReviveSerial ?? 0) + 1; const current = rt.delayedReviveClocks?.[input.clockPolicy] ?? 0;
  const targetSide = input.targetSide ?? game.tokens.find(unit => (unit.iid ?? unit.id) === input.targetIid)?.side;
  if (targetSide !== 'ally' && targetSide !== 'enemy') throw new Error('[delayed-revive] targetSide is required');
  const entry: DelayedReviveEntry = { ...input, targetSide, queueId: `delayed-revive-${insertionSerial}`, scheduledAtEventSerial: nextEventSerial(game), clockStartValue: current, dueValue: current + Math.max(0, Math.floor(input.delayAmount)), insertionSerial, state: 'queued' };
  (rt.delayedRevives ??= []).push(entry); return entry;
}
export function canCommitDelayedRevive(entry: DelayedReviveEntry, game: SessionState): DelayedReviveEligibilityReason {
  const death = ((game.runtime as { deathRecords?: ReviveRequest['death'][] }).deathRecords ?? []).find(item => item.deathId === entry.deathId);
  const target = game.tokens.find(unit => (unit.iid ?? unit.id) === entry.targetIid); if (!death || !target) return 'stale-life';
  const reason = evaluateReviveEligibility(game, death, target, entry.revivePolicies);
  if (reason === 'invalid-death' || reason === 'identity-mismatch' || reason === 'removed') return 'stale-life';
  if (reason === 'summon-not-revivable') return 'non-revivable'; return reason;
}
function drainDue(game: SessionState): DelayedReviveEntry[] {
  const rt = state(game); const due = (rt.delayedRevives ?? []).filter(entry => entry.state === 'queued' && entry.dueValue <= (rt.delayedReviveClocks?.[entry.clockPolicy] ?? 0)).sort((a,b)=>a.dueValue-b.dueValue || a.insertionSerial-b.insertionSerial || a.queueId.localeCompare(b.queueId));
  for (const entry of due) { entry.state = 'due'; const reason = canCommitDelayedRevive(entry, game); entry.resultReason = reason; if (reason !== 'allowed') { entry.state = reason === 'battle-ended' ? 'cancelled' : 'blocked'; continue; }
    const death = ((game.runtime as { deathRecords: ReviveRequest['death'][] }).deathRecords).find(item=>item.deathId===entry.deathId)!; const target=game.tokens.find(unit=>(unit.iid??unit.id)===entry.targetIid) as UnitToken;
    const result=commitImmediateRevive(game,target,{death,source:entry.requestSource,...entry.revivePolicies}); entry.state=result.committed?'committed':'blocked'; entry.resultReason=result.committed?'allowed':canCommitDelayedRevive(entry,game);
  } return due;
}
/** Compatibility adapter; production advances clocks through consumeSsiTemporalEvent. */
export function advanceDelayedReviveClock(game: SessionState, policy: DelayedReviveClockPolicy, amount=1): DelayedReviveEntry[] { const clocks=state(game).delayedReviveClocks??={}; clocks[policy]=(clocks[policy]??0)+Math.max(0,Math.floor(amount)); return drainDue(game); }
export function emitSsiTemporalEvent(game: SessionState, input: Omit<SsiTemporalEvent,'eventSerial'>): SsiTemporalEvent { const event={...input,eventSerial:nextEventSerial(game)}; (state(game).combatEvents??=[]).push(event); consumeSsiTemporalEvent(game,event); return event; }
export function consumeSsiTemporalEvent(game: SessionState,event:SsiTemporalEvent):DelayedReviveEntry[]{ const rt=state(game); const clocks=rt.delayedReviveClocks??={}; const inc=(policy:DelayedReviveClockPolicy)=>{clocks[policy]=(clocks[policy]??0)+1;};
  if(event.type==='NATURAL_ACTION_COMPLETED'||event.type==='NATURAL_ACTION_CONSUMED_BY_CC'){inc('global-natural-actions'); if(event.actorSide==='ally')inc('ally-natural-actions'); if(event.actorSide==='enemy')inc('enemy-natural-actions');}
  for(const entry of rt.delayedRevives??[]){if(entry.state!=='queued')continue; if(event.type==='SIDE_PASS_COMPLETED'&&entry.clockPolicy==='side-pass'&&event.actorSide===(entry.watchedSide??entry.targetSide)) entry.dueValue-=1; if(event.type==='TARGET_SIDE_OPPORTUNITY'&&entry.clockPolicy==='target-side-opportunities'&&event.targetSide===entry.targetSide) entry.dueValue-=1;}
if(event.type==='SSI_CYCLE_COMPLETED')inc('global-ssi-cycle'); return drainDue(game);
  }
