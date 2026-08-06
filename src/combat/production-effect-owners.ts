import { getSessionAether } from '../aether.ts';
import { cellReserved, slotToCell } from '../engine.ts';
import { Statuses } from '../statuses.ts';
import { enqueueImmediate } from '../summon.ts';
import { furyValue, setFury, spendFury } from '../utils/fury.ts';
import { consumeShieldByCurrentRatio, grantShield, readShieldAmount } from './apply-damage.ts';
import { isImplementedEffectType, type EffectSpec } from './canonical-model.ts';
import type { ExecutableActionDefinition } from './executable-character-definition.ts';
import { currentActionExecution, commitAuthoritativeEffect, resolveHealing, resolveHpLoss, resolveSourceAttribution, type ActionExecutionContext } from './kernel/public.ts';
import { commitHealing, commitHpMutation } from './kernel/hp-mutation.ts';
import { readAtkWilPower, toRoundedInt } from './number-utils.ts';
import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import { requireCanonicalDamageOwner } from './damage-owner-registry.ts';

const identity = (game: SessionState): ActionExecutionContext['identity'] | undefined => currentActionExecution(game)?.identity;
const sourceFor = (actor: UnitToken) => resolveSourceAttribution({ immediateSource: actor, controller: actor, trueSelf: actor.trueSelfId ?? null, owner: actor });

function openSlot(game: SessionState, side: UnitToken['side']): number | null {
  const alive = game.tokens.filter(token => token.alive);
  for (let slot = 1; slot <= 9; slot += 1) { const cell = slotToCell(side, slot); if (!cellReserved(alive, game.queued, cell.cx, cell.cy)) return slot; }
  return null;
}

function removeStatuses(target: UnitToken, effect: Extract<EffectSpec, { type: 'remove-status' | 'dispel' }>): void {
  if (effect.type === 'remove-status') { Statuses.remove(target, effect.payload.statusId); return; }
  let remaining = effect.payload.count ?? Number.POSITIVE_INFINITY;
  for (const status of [...(target.statuses ?? [])]) {
    if (remaining <= 0) break;
    if (effect.payload.polarity !== 'all' && status.kind !== effect.payload.polarity) continue;
    Statuses.remove(target, status.id); remaining -= 1;
  }
}

function mutate(game: SessionState, actor: UnitToken, targets: readonly UnitToken[], effect: EffectSpec): void {
  const actionIdentity = identity(game);
  if (!actionIdentity) throw new Error('[canonical-effect] effect requires an active action identity');
  switch (effect.type) {
    case 'deal-damage': case 'reflect-damage':
      for (const target of targets) requireCanonicalDamageOwner()(game, actor, target, { base: Math.max(1, Math.floor(readAtkWilPower(actor) * effect.payload.amount + readShieldAmount(actor) * Number(effect.payload.shieldRatio ?? 0))), dtype: effect.payload.damageType === 'will' ? 'arcane' : effect.payload.damageType, attackType: effect.type === 'reflect-damage' ? 'reflect' : 'skill', actionIdentity });
      return;
    case 'heal': for (const target of targets) commitHealing(game, target, resolveHealing(target, Math.max(1, Math.floor((target.hpMax ?? 1) * effect.payload.amount)), sourceFor(actor)), actionIdentity); return;
    case 'grant-shield': for (const target of targets) grantShield(target, Math.max(1, Math.floor((target.hpMax ?? 1) * effect.payload.amount))); return;
    case 'pay-hp-cost': for (const target of targets) { const result = resolveHpLoss(target, Math.max(1, Math.floor((target.hpMax ?? 1) * effect.payload.amount)), 'hp-cost', sourceFor(actor), false); if (!result.succeeded) throw new Error('[canonical-action] HP cost rejected'); commitHpMutation(game, target, result, actionIdentity); } return;
    case 'apply-status': case 'grant-immunity': for (const target of targets) { if (effect.payload.statusType === 'shield:consume-current-ratio') consumeShieldByCurrentRatio(target, Number(effect.payload.value ?? 0)); else { const buff = effect.type === 'grant-immunity' || effect.payload.statusType.startsWith('buff:'); Statuses.add(target, { id: buff && effect.payload.statusType.startsWith('buff:') ? `chap_minh_ult_${effect.payload.statusType.slice(5)}_up` : effect.payload.statusType, kind: buff ? 'buff' : 'debuff', tag: effect.payload.statusType, dur: effect.payload.duration ?? 1, tick: 'turn', amount: effect.payload.value, sourceUnitId: actor.id }); } } return;
    case 'remove-status': case 'dispel': for (const target of targets) removeStatuses(target, effect); return;
    case 'spend-resource': case 'gain-resource': { const amount = Math.max(0, toRoundedInt(effect.payload.amount, 0)); if (effect.payload.resource === 'aether') { const ledger = getSessionAether(game); if (effect.type === 'spend-resource' ? !ledger.consume(actor.side, amount) : (ledger.gain(actor.side, amount), false)) throw new Error('[canonical-action] insufficient aether'); } else if (effect.type === 'spend-resource') { if (spendFury(actor, amount) !== amount) throw new Error('[canonical-action] insufficient fury'); } else setFury(actor, furyValue(actor) + amount); return; }
    case 'summon': { const slot = openSlot(game, actor.side); if (!slot) throw new Error('[canonical-effect] no summon slot available'); enqueueImmediate(game, { side: actor.side, slot, unit: { id: effect.payload.definitionId, name: effect.payload.definitionId, ownerIid: actor.iid, isMinion: true, hpMax: Math.max(1, Math.floor((actor.hpMax ?? 100) * 0.5)), hp: Math.max(1, Math.floor((actor.hpMax ?? 100) * 0.5)), ttlTurns: 3 } }); return; }
    case 'create-field': { const runtime = (game.runtime ??= {}) as { fields?: unknown[] }; (runtime.fields ??= []).push({ fieldId: effect.payload.fieldId, sourceIid: actor.iid ?? actor.id, duration: effect.payload.duration ?? 2 }); return; }
    case 'move': for (const target of targets) { target.cx = effect.payload.cx; target.cy = effect.payload.cy; } return;
    case 'set-stance': actor.stance = effect.payload.value; return;
    case 'set-form': actor.form = effect.payload.value; return;
    default: throw new Error(`[canonical-effect] reserved effect ${effect.type} has no production owner`);
  }
}

export const commitProductionEffect = Object.freeze({
  effect(game: SessionState, actor: UnitToken, targets: readonly UnitToken[], effect: EffectSpec) {
    if (!isImplementedEffectType(effect.type)) throw new Error(`[canonical-effect] reserved effect ${effect.type} has no production owner`);
    const actionIdentity = identity(game); if (!actionIdentity) throw new Error('[canonical-effect] effect requires an active action identity');
    return commitAuthoritativeEffect(game, actionIdentity, effect.type, targets, () => mutate(game, actor, targets, effect));
  },
  commitActionCosts(game: SessionState, actor: UnitToken, action: ExecutableActionDefinition): void {
    const ae = action.cost.aether ?? 0, fury = action.cost.fury ?? 0, hp = action.cost.hp ?? 0;
    if (ae && !getSessionAether(game).consume(actor.side, ae)) throw new Error('[canonical-action] insufficient aether');
    if (fury && spendFury(actor, fury) !== fury) throw new Error('[canonical-action] insufficient fury');
    if (hp) { const result = resolveHpLoss(actor, Math.floor((actor.hpMax ?? 1) * hp), 'hp-cost', sourceFor(actor), false); if (!result.succeeded) throw new Error('[canonical-action] HP cost rejected'); commitHpMutation(game, actor, result, identity(game)); }
  },
});
