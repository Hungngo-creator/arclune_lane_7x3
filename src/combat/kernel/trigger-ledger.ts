import type { CombatId } from './ids.ts';

export interface TriggerLedgerEntry { actionId: CombatId; procKey: string; sourceIid: CombatId; targetIid: CombatId }
export interface TriggerLedger { entries: TriggerLedgerEntry[]; reactionDepth: number; maxReactionDepth: number }
export interface TriggerDecision { allowed: boolean; reason: 'allowed' | 'already-triggered' | 'max-reaction-depth-exceeded' }

export function createTriggerLedger(reactionDepth = 0, maxReactionDepth = 12): TriggerLedger {
  return { entries: [], reactionDepth, maxReactionDepth };
}
export function canTrigger(ledger: TriggerLedger, entry: TriggerLedgerEntry, reactionDepth = ledger.reactionDepth): TriggerDecision {
  if (reactionDepth > ledger.maxReactionDepth) return { allowed: false, reason: 'max-reaction-depth-exceeded' };
  const duplicate = ledger.entries.some((item) => item.actionId === entry.actionId && item.procKey === entry.procKey
    && item.sourceIid === entry.sourceIid && item.targetIid === entry.targetIid);
  return duplicate ? { allowed: false, reason: 'already-triggered' } : { allowed: true, reason: 'allowed' };
}
export function markTriggered(ledger: TriggerLedger, entry: TriggerLedgerEntry): TriggerDecision {
  const decision = canTrigger(ledger, entry);
  if (decision.allowed) ledger.entries.push({ ...entry });
  return decision;
}

