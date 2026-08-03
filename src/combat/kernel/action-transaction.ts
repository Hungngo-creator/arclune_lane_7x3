import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import type { ActionIdentity } from './types.ts';
import { nextEventSerial } from './sequence.ts';
import { beginActionExecution, endActionExecution, finalizeCombatAction } from './action-context.ts';
import { isCombatAlive } from './life-cycle.ts';

export type ActionTransactionStage = 'ACTION_DECLARE' | 'ACTOR_VALIDATE' | 'TARGET_VALIDATE' | 'COST_VALIDATE' | 'COST_RESERVE' | 'ACTION_START' | 'COST_COMMIT' | 'PAYLOAD_RESOLVE' | 'ACTION_COMMIT' | 'ACTION_END';
export interface ActionCostReservation { readonly id: string; validate(): boolean; commit(): void; release(): void }
export interface ActionTransactionCommand<T> {
  game: SessionState; identity: ActionIdentity; actor: UnitToken; targets: readonly UnitToken[];
  validateActor?: () => boolean; validateTargets?: () => boolean;
  reserveCosts?: () => readonly ActionCostReservation[]; resolvePayload: () => T; commitAction?: (payload: T) => void;
}
export interface ActionTransactionResult<T> { ok: boolean; stage: ActionTransactionStage; payload?: T; reason?: 'actor-blocked' | 'invalid-target' | 'insufficient-cost' }

/** The sole orchestration boundary for validation, reservation and one-time cost commit. */
export function executeActionTransaction<T>(command: ActionTransactionCommand<T>): ActionTransactionResult<T> {
  let stage: ActionTransactionStage = 'ACTION_DECLARE';
  const events = (((command.game.runtime ??= {}) as { combatEvents?: Record<string, unknown>[] }).combatEvents ??= []);
  const publish = (): void => { events.push({ type: stage, eventSerial: nextEventSerial(command.game), actionId: command.identity.actionId, chainId: command.identity.chainId }); };
  publish();
  stage = 'ACTOR_VALIDATE';
  if (!isCombatAlive(command.actor) || (command.validateActor && !command.validateActor())) return { ok: false, stage, reason: 'actor-blocked' };
  stage = 'TARGET_VALIDATE';
  if ((command.validateTargets ? !command.validateTargets() : command.targets.length === 0)) return { ok: false, stage, reason: 'invalid-target' };
  stage = 'COST_VALIDATE';
  const reservations = command.reserveCosts?.() ?? [];
  if (!reservations.every(item => item.validate())) { reservations.forEach(item => item.release()); return { ok: false, stage, reason: 'insufficient-cost' }; }
  stage = 'COST_RESERVE';
  let context: ReturnType<typeof beginActionExecution> | null = null;
  try {
    stage = 'ACTION_START'; context = beginActionExecution(command.game, command.identity);
    stage = 'COST_COMMIT'; reservations.forEach(item => item.commit());
    stage = 'PAYLOAD_RESOLVE'; const payload = command.resolvePayload();
    stage = 'ACTION_COMMIT'; command.commitAction?.(payload); publish();
    finalizeCombatAction(command.game, context); endActionExecution(command.game, context); context = null;
    stage = 'ACTION_END';
    return { ok: true, stage, payload };
  } catch (error) {
    if (context) endActionExecution(command.game, context);
    throw error;
  }
}
