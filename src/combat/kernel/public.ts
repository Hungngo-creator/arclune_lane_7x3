/**
 * Deliberately small Kernel surface for production character code.
 * Mutation primitives stay private to the combat/session orchestrators.
 */
export { currentActionExecution } from './action-context.ts';
export type { ActionExecutionContext } from './action-context.ts';
export { createNaturalAction } from './sequence.ts';
export { executeActionTransaction } from './action-transaction.ts';
export { commitAuthoritativeEffect } from './effect-commit.ts';
export { isCombatAlive } from './life-cycle.ts';
export { resolveDamagePacket } from './damage-resolver.ts';
export { resolveHealing, resolveHpLoss } from './hp-mutation.ts';
export { resolveSourceAttribution } from './source-attribution.ts';
export type { ActionIdentity, DamagePacket, SourceAttribution } from './types.ts';
