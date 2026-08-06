import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import type { EffectType } from '../canonical-model.ts';
import type { ActionIdentity } from './types.ts';
import { nextEventSerial, nextStateRevision } from './sequence.ts';

export interface AuthoritativeEffectMutation {
  readonly eventSerial: number;
  readonly stateRevision: number;
  readonly actionId: ActionIdentity['actionId'];
  readonly chainId: ActionIdentity['chainId'];
  readonly targetLifeIds: readonly string[];
}

const lifeId = (target: UnitToken): string => `${String(target.trueSelfId ?? target.iid ?? target.id)}:${String(target.incarnationSerial ?? 0)}:${String(target.lifeSerial ?? 0)}`;

/** Single owner for effect-level evidence around an already-preflighted subsystem commit. */
export function commitAuthoritativeEffect(game: SessionState, identity: ActionIdentity, effectType: EffectType, targets: readonly UnitToken[], commit: () => void): AuthoritativeEffectMutation {
  commit();
  const eventSerial = nextEventSerial(game);
  const stateRevision = nextStateRevision(game);
  const targetLifeIds = Object.freeze(targets.map(lifeId));
  (((game.runtime ??= {}) as { combatEvents?: Record<string, unknown>[] }).combatEvents ??= []).push(Object.freeze({ type: 'EFFECT_COMMITTED', eventSerial, stateRevision, actionId: identity.actionId, chainId: identity.chainId, effectType, targetLifeIds }));
  return Object.freeze({ eventSerial, stateRevision, actionId: identity.actionId, chainId: identity.chainId, targetLifeIds });
}
