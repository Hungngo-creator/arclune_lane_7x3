import type { SessionState } from '@shared-types/combat';
import { createTriggerLedger, type TriggerLedger } from './trigger-ledger.ts';
import type { CombatId } from './ids.ts';
import type { ActionIdentity } from './types.ts';

export interface ActionExecutionContext {
  readonly identity: ActionIdentity;
  nextPacketSerial: number;
  readonly triggerLedger: TriggerLedger;
  readonly originActionId: CombatId | null;
  readonly snapshot: Readonly<Record<string, unknown>>;
}
type ActionRuntime = { actionExecutionStack?: ActionExecutionContext[] };
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
  try { return execute(context); } finally { endActionExecution(game, context); }
}

export function nextActionPacket(context: ActionExecutionContext): { packetSerial: number; packetId: string } {
  const packetSerial = context.nextPacketSerial++;
  return { packetSerial, packetId: `${String(context.identity.actionId)}:packet-${packetSerial}` };
}
