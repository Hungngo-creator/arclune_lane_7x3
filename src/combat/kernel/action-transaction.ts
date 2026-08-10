import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import type { ActionIdentity } from './types.ts';
import { getSessionAether } from '../../aether.ts';
import { nextEventSerial } from './sequence.ts';
import { beginActionExecution, endActionExecution, finalizeCombatAction, type ActionFinalizationResult } from './action-context.ts';
import { isCombatAlive } from './life-cycle.ts';

export type ActionTransactionStage = 'ACTION_DECLARE' | 'ACTOR_VALIDATE' | 'TARGET_VALIDATE' | 'COST_VALIDATE' | 'COST_RESERVE' | 'ACTION_START' | 'COST_COMMIT' | 'PAYLOAD_RESOLVE' | 'ACTION_COMMIT' | 'ACTION_END';
export interface ActionCostReservation { readonly id: string; validate(): boolean; commit(): void; rollback(): void; release(): void }
export interface ActionTransactionCommand<T> {
  game: SessionState; identity: ActionIdentity; actor: UnitToken; targets: readonly UnitToken[];
  validateActor?: () => boolean; validateTargets?: () => boolean;
  reserveCosts?: () => readonly ActionCostReservation[]; resolvePayload: () => T; commitAction?: (payload: T) => void;
}
export interface ActionTransactionResult<T> { ok: boolean; stage: ActionTransactionStage; payload?: T; finalization?: ActionFinalizationResult; reason?: 'actor-blocked' | 'invalid-target' | 'insufficient-cost' }

function cloneData<T>(value: T): T {
  return value == null ? value : JSON.parse(JSON.stringify(value)) as T;
}

interface KernelRollbackSnapshot {
  readonly tokens: readonly { readonly token: UnitToken; readonly snapshot: Record<string, unknown> }[];
  readonly queued: SessionState['queued'];
  readonly runtime: SessionState['runtime'];
  readonly aether: ReturnType<ReturnType<typeof getSessionAether>['snapshot']>;
}

function takeRollbackSnapshot(game: SessionState): KernelRollbackSnapshot {
  return Object.freeze({
    tokens: game.tokens.map(token => Object.freeze({ token, snapshot: cloneData(token as unknown as Record<string, unknown>) })),
    queued: cloneData(game.queued),
    runtime: cloneData(game.runtime),
    aether: getSessionAether(game).snapshot(),
  });
}

function restoreRollbackSnapshot(game: SessionState, snapshot: KernelRollbackSnapshot): void {
  for (const { token, snapshot: tokenSnapshot } of snapshot.tokens) {
    for (const key of Object.keys(token)) delete (token as unknown as Record<string, unknown>)[key];
    Object.assign(token, cloneData(tokenSnapshot));
  }
  game.tokens.splice(0, game.tokens.length, ...snapshot.tokens.map(item => item.token));
  game.queued = cloneData(snapshot.queued);
  game.runtime = cloneData(snapshot.runtime);
  getSessionAether(game).restore(snapshot.aether);
}

/** The sole orchestration boundary for validation, reservation and one-time cost commit. */
export function executeActionTransaction<T>(command: ActionTransactionCommand<T>): ActionTransactionResult<T> {
  let stage: ActionTransactionStage = 'ACTION_DECLARE';
  const rollbackSnapshot = takeRollbackSnapshot(command.game);
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
    stage = 'COST_COMMIT';
    for (const reservation of reservations) reservation.commit();
    stage = 'PAYLOAD_RESOLVE'; const payload = command.resolvePayload();
    stage = 'ACTION_COMMIT'; command.commitAction?.(payload); publish();
    const finalization = finalizeCombatAction(command.game, context); endActionExecution(command.game, context); context = null;
    stage = 'ACTION_END';
    return { ok: true, stage, payload, finalization };
  } catch (error) {
    if (context) endActionExecution(command.game, context);
    restoreRollbackSnapshot(command.game, rollbackSnapshot);
    reservations.forEach(item => { item.rollback(); item.release(); });
    throw error;
  }
}
