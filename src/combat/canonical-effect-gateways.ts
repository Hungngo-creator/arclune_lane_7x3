import { getSessionAether } from '../aether.ts';
import { cellReserved, slotToCell } from '../engine.ts';
import { furyValue } from '../utils/fury.ts';
import { createEffectExecutionServices, isImplementedEffectType, type EffectExecutionServices, type EffectSpec } from './canonical-model.ts';
import { commitProductionEffect } from './production-effect-owners.ts';
import { toRoundedInt } from './number-utils.ts';
import type { ActionCostReservation } from './kernel/action-transaction.ts';
import type { ExecutableActionDefinition } from './executable-character-definition.ts';
import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

export { registerCanonicalDamageOwner } from './damage-owner-registry.ts';

function firstOpenSlot(game: SessionState, side: UnitToken['side']): number | null {
  const alive = game.tokens.filter(token => token.alive);
  for (let slot = 1; slot <= 9; slot += 1) { const { cx, cy } = slotToCell(side, slot); if (!cellReserved(alive, game.queued, cx, cy)) return slot; }
  return null;
}

export function validateCanonicalEffectPreparation(game: SessionState, actor: UnitToken, effect: EffectSpec, targets: readonly UnitToken[]): boolean {
  if (!isImplementedEffectType(effect.type) || !targets.length || targets.some(target => !target.alive)) return false;
  if (effect.type === 'spend-resource') return effect.payload.resource === 'aether'
    ? getSessionAether(game).current(actor.side) >= Math.max(0, toRoundedInt(effect.payload.amount, 0))
    : furyValue(actor) >= Math.max(0, toRoundedInt(effect.payload.amount, 0));
  if (effect.type === 'pay-hp-cost') return targets.every(target => Number(target.hp ?? 0) > Math.max(1, Math.floor((target.hpMax ?? 1) * effect.payload.amount)));
  if (effect.type === 'summon') return firstOpenSlot(game, actor.side) !== null;
  return true;
}

export function reserveCanonicalActionCosts(game: SessionState, actor: UnitToken, action: ExecutableActionDefinition): readonly ActionCostReservation[] {
  return [{
    id: `${action.actionId}:costs`,
    validate: () => getSessionAether(game).current(actor.side) >= (action.cost.aether ?? 0)
      && furyValue(actor) >= (action.cost.fury ?? 0)
      && Number(actor.hp ?? 0) > Math.floor((actor.hpMax ?? 1) * (action.cost.hp ?? 0)),
    commit: () => commitProductionEffect.commitActionCosts(game, actor, action),
    rollback: () => {},
    release: () => {},
  }];
}

export function createCanonicalEffectServices(game: SessionState, actor: UnitToken, targets: readonly UnitToken[]): EffectExecutionServices {
  const commit = (effect: EffectSpec) => commitProductionEffect.effect(game, actor, targets, effect);
  return createEffectExecutionServices({
    damageGateway: commit, healingGateway: commit, shieldGateway: commit, hpMutationGateway: commit,
    lifecycleGateway: commit, statusGateway: commit, resourceGateway: commit, summonGateway: commit,
    fieldGateway: commit, movementGateway: commit, reactionGateway: commit, characterStateGateway: commit,
  });
}
