import type { SessionState } from '@shared-types/combat';
import { createTriggerLedger, type TriggerLedger } from './trigger-ledger.ts';
import type { CombatId } from './ids.ts';
import type { ActionIdentity } from './types.ts';
import { resolveDeathWave } from './life-cycle.ts';
import { evaluateBattleEnd } from './battle-end.ts';
import { getCombatSequence, nextEventSerial } from './sequence.ts';
import type { DeathRecord } from './life-cycle.ts';
import type { BattleEndResult } from './battle-end.ts';

export interface ActionExecutionContext {
  readonly identity: ActionIdentity;
  nextPacketSerial: number;
  readonly triggerLedger: TriggerLedger;
  readonly originActionId: CombatId | null;
  readonly snapshot: Readonly<Record<string, unknown>>;
}
type ActionRuntime = { actionExecutionStack?: ActionExecutionContext[] };
export interface ActionFinalizationResult {
  actionId: CombatId; chainId: CombatId; committedTargetAggregates: readonly Record<string, unknown>[];
  deathRecords: readonly DeathRecord[]; preventedDeaths: readonly Record<string, unknown>[];
  immediateRevives: readonly Record<string, unknown>[]; battleEnd: BattleEndResult;
  emittedEventSerialRange: { first: number; last: number };
}
type FinalizationRuntime = ActionRuntime & { finalizedActions?: Record<string, ActionFinalizationResult>; combatEvents?: Record<string, unknown>[] };
const stack = (game: SessionState): ActionExecutionContext[] => (((game.runtime ??= {}) as ActionRuntime).actionExecutionStack ??= []);

export function beginActionExecution(game: SessionState, identity: ActionIdentity, options: {
  triggerLedger?: TriggerLedger; originActionId?: CombatId | null; snapshot?: Readonly<Record<string, unknown>>;
} = {}): ActionExecutionContext {
  const context: ActionExecutionContext = { identity, nextPacketSerial: 1, triggerLedger: options.triggerLedger ?? createTriggerLedger(), originActionId: options.originActionId ?? null, snapshot: { ...(options.snapshot ?? {}) } };
  stack(game).push(context); return context;
}

export function currentActionExecution(game: SessionState): ActionExecutionContext | null {
  const contexts = stack(game); return contexts[contexts.length - 1] ?? null;
}

export function endActionExecution(game: SessionState, expected?: ActionExecutionContext): void {
  const contexts = stack(game); const current = contexts[contexts.length - 1];
  if (!current || (expected && current !== expected)) throw new Error('[combat-kernel] action execution stack mismatch');
  contexts.pop();
}

export function withActionExecution<T>(game: SessionState, identity: ActionIdentity, execute: (context: ActionExecutionContext) => T, options: Parameters<typeof beginActionExecution>[2] = {}): T {
  const context = beginActionExecution(game, identity, options);
  let completed = false;
  try { const result = execute(context); completed = true; return result; }
  finally {
    endActionExecution(game, context);
    if (completed) finalizeCombatAction(game, context);
  }
}

/** The sole production action boundary. It is idempotent for an action identity. */
export function finalizeCombatAction(game: SessionState, context: ActionExecutionContext): ActionFinalizationResult {
  const state = (game.runtime ??= {}) as FinalizationRuntime;
  const key = String(context.identity.actionId);
  const existing = state.finalizedActions?.[key];
  if (existing) return existing;
  const first = getCombatSequence(game).eventSerial + 1;
  const before = state.combatEvents?.length ?? 0;
  const deathRecords = resolveDeathWave(game, undefined, context.identity.actionId);
  const actionEvents = (state.combatEvents ?? []).slice(before);
  const battleEnd = evaluateBattleEnd(game, deathRecords);
  const actionEndSerial = nextEventSerial(game);
  (state.combatEvents ??= []).push({ type: 'ACTION_END', eventSerial: actionEndSerial, actionId: context.identity.actionId, chainId: context.identity.chainId });
  const result: ActionFinalizationResult = {
    actionId: context.identity.actionId, chainId: context.identity.chainId,
    committedTargetAggregates: actionEvents.filter(event => event.type === 'DAMAGE_BATCH_RESOLVED').flatMap(event => Array.isArray(event.hpAllocation) ? event.hpAllocation as Record<string, unknown>[] : []),
    deathRecords,
    preventedDeaths: actionEvents.filter(event => event.type === 'DEATH_PREVENTED'),
    immediateRevives: actionEvents.filter(event => event.type === 'REVIVE_COMMITTED'), battleEnd,
    emittedEventSerialRange: { first, last: actionEndSerial },
  };
  (state.finalizedActions ??= {})[key] = result;
  return result;
}

export function nextActionPacket(context: ActionExecutionContext): { packetSerial: number; packetId: string } {
  const packetSerial = context.nextPacketSerial++;
  return { packetSerial, packetId: `${String(context.identity.actionId)}:packet-${packetSerial}` };
}
