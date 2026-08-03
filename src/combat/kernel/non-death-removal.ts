import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import { nextEventSerial } from './sequence.ts';

export type NonDeathRemovalKind = 'DESPAWNED' | 'FUSION_CONSUMED' | 'REMOVED' | 'ERASED' | 'REBIRTH_RETIRED';
export function commitNonDeathRemoval(game: SessionState, target: UnitToken, kind: NonDeathRemovalKind, reason: string): Record<string, unknown> {
  target.lifeState = kind === 'ERASED' ? 'erased' : 'removed'; target.alive = false;
  (target as UnitToken & { removalKind?: NonDeathRemovalKind }).removalKind = kind;
  const event = { type: kind, eventSerial: nextEventSerial(game), targetIid: target.iid ?? target.id, trueSelfId: target.trueSelfId ?? null, incarnationSerial: target.incarnationSerial ?? null, lifeSerial: target.lifeSerial ?? null, reason };
  (((game.runtime ??= {}) as { combatEvents?: Record<string, unknown>[] }).combatEvents ??= []).push(event); return event;
}
