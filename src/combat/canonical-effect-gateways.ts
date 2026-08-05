import { globalAetherPool } from '../aether.ts';
import { dealAbilityDamage } from '../combat.ts';
import { cellReserved, slotToCell } from '../engine.ts';
import { Statuses } from '../statuses.ts';
import { enqueueImmediate } from '../summon.ts';
import { consumeShieldByCurrentRatio, grantShield, readShieldAmount } from './apply-damage.ts';
import { createEffectExecutionServices, type EffectExecutionServices, type EffectSpec } from './canonical-model.ts';
import { currentActionExecution, resolveHealing, resolveHpLoss, resolveSourceAttribution, type ActionExecutionContext } from './kernel/public.ts';
import { commitHealing, commitHpMutation } from './kernel/hp-mutation.ts';
import { readAtkWilPower, toRoundedInt } from './number-utils.ts';
import type { ActionCostReservation } from './kernel/action-transaction.ts';
import type { ExecutableActionDefinition } from './executable-character-definition.ts';
import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

const eventState = (game: SessionState): { eventSerial: number; stateRevision: number } => {
  const eventSerial = Number((((game.runtime ?? {}) as { combatSequence?: { eventSerial?: number } }).combatSequence ?? {}).eventSerial ?? 0);
  if (!Number.isSafeInteger(eventSerial) || eventSerial <= 0) throw new Error('[canonical-effect] mutation did not emit an authoritative event');
  return { eventSerial, stateRevision: eventSerial };
};

const identity = (game: SessionState): ActionExecutionContext['identity'] | undefined => currentActionExecution(game)?.identity;
const sourceFor = (actor: UnitToken) => resolveSourceAttribution({ immediateSource: actor, controller: actor, trueSelf: actor.trueSelfId ?? null, owner: actor });

function firstOpenSlot(game: SessionState, side: UnitToken['side']): number | null {
  const alive = game.tokens.filter(t => t.alive);
  for (let slot = 1; slot <= 9; slot++) { const { cx, cy } = slotToCell(side, slot); if (!cellReserved(alive, game.queued, cx, cy)) return slot; }
  return null;
}

export function validateCanonicalEffectPreparation(game: SessionState, actor: UnitToken, effect: EffectSpec, targets: readonly UnitToken[]): boolean {
  if (!targets.length || targets.some(target => !target.alive)) return false;
  if (effect.type === 'spend-resource') return effect.payload.resource !== 'aether' || globalAetherPool.current(actor.side) >= Math.max(0, toRoundedInt(effect.payload.amount, 0));
  if (effect.type === 'pay-hp-cost') return targets.every(target => Number(target.hp ?? 0) > Math.max(1, Math.floor((target.hpMax ?? 1) * effect.payload.amount)));
  if (effect.type === 'summon') return firstOpenSlot(game, actor.side) !== null;
  return true;
}

export function reserveCanonicalActionCosts(game: SessionState, actor: UnitToken, action: ExecutableActionDefinition): readonly ActionCostReservation[] {
  const reservations: ActionCostReservation[] = [];
  if (action.cost.aether) reservations.push({ id: `${action.actionId}:aether`, validate: () => globalAetherPool.current(actor.side) >= (action.cost.aether ?? 0), commit: () => { if (!globalAetherPool.consume(actor.side, action.cost.aether ?? 0)) throw new Error('[canonical-action] insufficient aether'); }, release: () => {} });
  if (action.cost.hp) reservations.push({ id: `${action.actionId}:hp`, validate: () => Number(actor.hp ?? 0) > Math.floor((actor.hpMax ?? 1) * (action.cost.hp ?? 0)), commit: () => { const mutation = resolveHpLoss(actor, Math.floor((actor.hpMax ?? 1) * (action.cost.hp ?? 0)), 'hp-cost', sourceFor(actor), false); if (!mutation.succeeded) throw new Error('[canonical-action] HP cost rejected'); commitHpMutation(game, actor, mutation, identity(game)); }, release: () => {} });
  return reservations;
}

export function createCanonicalEffectServices(game: SessionState, actor: UnitToken, targets: readonly UnitToken[]): EffectExecutionServices {
  return createEffectExecutionServices({
    damageGateway(effect: any) { for (const target of targets) dealAbilityDamage(game, actor, target, { base: Math.max(1, Math.floor(readAtkWilPower(actor) * effect.payload.amount + readShieldAmount(actor) * Number(effect.payload.shieldRatio ?? 0))), dtype: effect.payload.damageType === 'will' ? 'magic' : effect.payload.damageType, attackType: 'skill' }); return eventState(game); },
    healingGateway(effect: any) { for (const target of targets) commitHealing(game, target, resolveHealing(target, Math.max(1, Math.floor((target.hpMax ?? 1) * effect.payload.amount)), sourceFor(actor)), identity(game)); return eventState(game); },
    shieldGateway(effect: any) { for (const target of targets) grantShield(target, Math.max(1, Math.floor((target.hpMax ?? 1) * effect.payload.amount))); return eventState(game); },
    hpMutationGateway(effect: any) { for (const target of targets) { const mutation = resolveHpLoss(target, Math.max(1, Math.floor((target.hpMax ?? 1) * effect.payload.amount)), 'hp-cost', sourceFor(actor), false); if (!mutation.succeeded) throw new Error('[canonical-action] HP cost rejected'); commitHpMutation(game, target, mutation, identity(game)); } return eventState(game); },
    lifecycleGateway() { throw new Error('[canonical-effect] lifecycle effect requires a production lifecycle coordinator route'); },
    statusGateway(effect: any) { if (effect.type === 'apply-status' || effect.type === 'grant-immunity') for (const target of targets) { if (effect.payload.statusType === 'shield:consume-current-ratio') { consumeShieldByCurrentRatio(target, Number(effect.payload.value ?? 0)); continue; } const statusId = effect.payload.statusType.startsWith('buff:') ? `chap_minh_ult_${effect.payload.statusType.slice(5)}_up` : effect.payload.statusType; Statuses.add(target, { id: statusId, kind: effect.type === 'grant-immunity' || effect.payload.statusType.startsWith('buff:') ? 'buff' : 'debuff', tag: effect.payload.statusType, dur: effect.payload.duration ?? 1, tick: 'turn', amount: effect.payload.value, sourceUnitId: actor.id }); } else throw new Error(`[canonical-effect] ${effect.type} requires a production status removal/dispel route`); return eventState(game); },
    resourceGateway(effect: any) { const amount = Math.max(0, toRoundedInt(effect.payload.amount, 0)); if (effect.payload.resource !== 'aether') throw new Error('[canonical-effect] fury route requires personal resource gateway'); if (effect.type === 'spend-resource') { if (!globalAetherPool.consume(actor.side, amount)) throw new Error('[canonical-action] insufficient aether'); } else globalAetherPool.gain(actor.side, amount); return eventState(game); },
    summonGateway(effect: any) { const slot = firstOpenSlot(game, actor.side); if (!slot) throw new Error('[canonical-effect] no summon slot available'); enqueueImmediate(game, { side: actor.side, slot, unit: { id: effect.payload.definitionId, name: effect.payload.definitionId, ownerIid: actor.iid, isMinion: true, hpMax: Math.max(1, Math.floor((actor.hpMax ?? 100) * 0.5)), hp: Math.max(1, Math.floor((actor.hpMax ?? 100) * 0.5)), ttlTurns: 3 } }); return eventState(game); },
    fieldGateway(effect: any) { ((game.runtime ??= {}) as { fields?: unknown[] }).fields ??= []; ((game.runtime as { fields: unknown[] }).fields).push({ fieldId: effect.payload.fieldId, sourceIid: actor.iid ?? actor.id, duration: effect.payload.duration ?? 2 }); return eventState(game); },
    movementGateway(effect: any) { for (const target of targets) { target.cx = effect.payload.cx; target.cy = effect.payload.cy; } return eventState(game); },
    reactionGateway() { throw new Error('[canonical-effect] reaction effect requires action-chain coordinator route'); },
    characterStateGateway(effect: any) { (actor as Record<string, unknown>)[effect.type === 'set-form' ? 'form' : 'stance'] = effect.payload.value; return eventState(game); },
  });
}
