import { dealAbilityDamage, pickTarget } from '../combat.ts';
import { globalAetherPool } from '../aether.ts';
import { Statuses } from '../statuses.ts';
import { enqueueImmediate } from '../summon.ts';
import { cellReserved, slotToCell } from '../engine.ts';
import { grantShield, readShieldAmount } from './apply-damage.ts';
import { readAtkWilPower, toRoundedInt } from './number-utils.ts';
import { buildSkillResult } from './skill-result.ts';
import { dispatchEffect, markProductionReceipt, type EffectCommitReceipt, type EffectExecutionContext, type EffectExecutionServices, type EffectSpec, type TargetSpec } from './canonical-model.ts';
import { requireExecutableCharacterDefinition, type ExecutableActionDefinition } from './executable-character-definition.ts';
import { createNaturalAction, currentActionExecution, executeActionTransaction, resolveHealing, resolveHpLoss, resolveSourceAttribution } from './kernel/public.ts';
import { commitHealing, commitHpMutation, resolveMaxHpMutation } from './kernel/hp-mutation.ts';
import { consumeShieldByCurrentRatio } from './apply-damage.ts';
import { activateChapMinhLink, refreshChapMinhOwnership } from './chap-minh-runtime.ts';
import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import type { SkillSection } from '@shared-types/config';

export type CanonicalActionKey = 'basic' | 'ultimate' | `skill${number}`;
const EMPTY: string[] = [];
let serial = 1;
const revision = (game: SessionState): number => {
  const runtime = (game.runtime ??= {}) as Record<string, unknown>;
  const next = Math.max(0, Number(runtime.canonicalStateRevision ?? 0)) + 1;
  runtime.canonicalStateRevision = next;
  return next;
};
const receipt = (game: SessionState, effectType: EffectSpec['type']): EffectCommitReceipt => markProductionReceipt(Object.freeze({ effectType, committed: true as const, eventSerial: serial++, stateRevision: revision(game), session: game }));

function resolveTargets(game: SessionState, actor: UnitToken, spec: TargetSpec): UnitToken[] {
  if (spec.kind === 'self') return actor.alive ? [actor] : [];
  const enemies = game.tokens.filter(t => t.alive && t.side !== actor.side);
  const allies = game.tokens.filter(t => t.alive && t.side === actor.side);
  if (spec.kind === 'selected-enemy') return pickTarget(game, actor) ? [pickTarget(game, actor)!] : [];
  if (spec.kind === 'selected-ally') return allies.filter(t => t.iid !== actor.iid).slice(0, 1);
  if (spec.kind === 'leader') return game.tokens.filter(t => t.alive && t.side === actor.side && t.isLeader).slice(0, 1);
  if (spec.kind === 'all') return spec.side === 'enemy' ? enemies : allies;
  if (spec.kind === 'random' || spec.kind === 'multiple' || spec.kind === 'single') return (spec.side === 'enemy' ? enemies : allies).slice(0, spec.kind === 'single' ? 1 : Math.max(1, spec.count ?? 1));
  if (spec.kind === 'explicit-iids') return game.tokens.filter(t => t.alive && spec.iids.includes(t.iid ?? t.id));
  return ((spec as { side?: 'ally' | 'enemy' }).side === 'enemy' ? enemies : allies).slice(0, 3);
}

function firstOpenSlot(game: SessionState, side: UnitToken['side']): number | null {
  const alive = game.tokens.filter(t => t.alive);
  for (let slot = 1; slot <= 9; slot++) { const { cx, cy } = slotToCell(side, slot); if (!cellReserved(alive, game.queued, cx, cy)) return slot; }
  return null;
}

function servicesFor(game: SessionState, actor: UnitToken, targets: UnitToken[]): EffectExecutionServices {
  return Object.freeze({
    damageGateway(effect) { for (const target of targets) dealAbilityDamage(game, actor, target, { base: Math.max(1, Math.floor(readAtkWilPower(actor) * effect.payload.amount)), dtype: effect.payload.damageType === 'will' ? 'magic' : effect.payload.damageType, attackType: 'skill' }); return receipt(game, effect.type); },
    healingGateway(effect: any) { for (const target of targets) { const source = resolveSourceAttribution({ immediateSource: actor, controller: actor, trueSelf: actor.trueSelfId ?? null, owner: actor }); commitHealing(game, target, resolveHealing(target, Math.max(1, Math.floor((target.hpMax ?? 1) * effect.payload.amount)), source), currentActionExecution(game)?.identity); } return receipt(game, effect.type); },
    shieldGateway(effect: any) { for (const target of targets) grantShield(target, Math.max(1, Math.floor((target.hpMax ?? 1) * effect.payload.amount))); return receipt(game, effect.type); },
    hpMutationGateway(effect: any) { for (const target of targets) { const amount = Math.max(1, Math.floor((target.hpMax ?? 1) * effect.payload.amount)); const source = resolveSourceAttribution({ immediateSource: actor, controller: actor, trueSelf: actor.trueSelfId ?? null, owner: actor }); const mutation = resolveHpLoss(target, amount, 'hp-cost', source, false); if (!mutation.succeeded) throw new Error('[canonical-action] HP cost rejected'); commitHpMutation(game, target, mutation, currentActionExecution(game)?.identity); } return receipt(game, effect.type); },
    lifecycleGateway(effect) { return receipt(game, effect.type); },
    statusGateway(effect) { if (effect.type === 'apply-status' || effect.type === 'grant-immunity') for (const target of targets) Statuses.add(target, { id: effect.payload.statusType, kind: effect.type === 'grant-immunity' ? 'buff' : 'debuff', tag: effect.payload.statusType, dur: effect.payload.duration ?? 1, tick: 'turn', amount: effect.payload.value, sourceUnitId: actor.id }); return receipt(game, effect.type); },
    resourceGateway(effect) { const amount = Math.max(0, toRoundedInt(effect.payload.amount, 0)); if (effect.type === 'spend-resource') { if (globalAetherPool.current(actor.side) >= amount && !globalAetherPool.consume(actor.side, amount)) throw new Error('[canonical-action] insufficient aether'); } else globalAetherPool.gain(actor.side, amount); return receipt(game, effect.type); },
    summonGateway(effect) { const slot = firstOpenSlot(game, actor.side); if (slot) enqueueImmediate(game, { side: actor.side, slot, unit: { id: effect.payload.definitionId, name: effect.payload.definitionId, ownerIid: actor.iid, isMinion: true, hpMax: Math.max(1, Math.floor((actor.hpMax ?? 100) * 0.5)), hp: Math.max(1, Math.floor((actor.hpMax ?? 100) * 0.5)), ttlTurns: 3 } }); return receipt(game, effect.type); },
    fieldGateway(effect) { for (const target of game.tokens.filter(t => t.alive)) Statuses.add(target, { id: effect.payload.fieldId, kind: target.side === actor.side ? 'buff' : 'debuff', tag: 'field', dur: effect.payload.duration ?? 2, tick: 'turn', sourceUnitId: actor.id }); return receipt(game, effect.type); },
    movementGateway(effect) { for (const target of targets) { target.cx = effect.payload.cx; target.cy = effect.payload.cy; } return receipt(game, effect.type); },
    reactionGateway(effect) { return receipt(game, effect.type); },
    characterStateGateway(effect) { if (effect.payload.value === 'chap-minh-link') { activateChapMinhLink(actor); refreshChapMinhOwnership(game); } else (actor as Record<string, unknown>)[effect.type === 'set-form' ? 'form' : 'stance'] = effect.payload.value; return receipt(game, effect.type); },
  } satisfies EffectExecutionServices);
}

function validateConditions(game: SessionState, actor: UnitToken, action: ExecutableActionDefinition): boolean {
  for (const c of action.conditions) {
    if (c.type === 'minimum-current-hp-ratio' && Number(actor.hp ?? 0) / Math.max(1, Number(actor.hpMax ?? 1)) < c.ratio) return false;
    if (c.type === 'turn-parity') { const turn = Math.max(0, Number((game.turn as { turnCount?: number } | undefined)?.turnCount ?? 0)); if (turn > 0 && (turn % 2 === 0 ? 'even' : 'odd') !== c.parity) return false; }
    if (c.type === 'unique-summon' && game.tokens.some(t => t.alive && t.id === c.definitionId)) return false;
  }
  return true;
}

export function executeCanonicalAction(game: SessionState, actor: UnitToken, action: ExecutableActionDefinition): { ok: boolean; receipts: readonly EffectCommitReceipt[]; targetCount: number; reason?: 'blocked' | 'insufficient-aether' } {
  if (!actor.alive || !validateConditions(game, actor, action)) return { ok: false, receipts: [], targetCount: 0, reason: 'blocked' };
  if (action.cost.aether && (globalAetherPool.current(actor.side) < action.cost.aether || !globalAetherPool.consume(actor.side, action.cost.aether))) return { ok: false, receipts: [], targetCount: 0, reason: 'insufficient-aether' };
  if (action.cost.hp) { const source = resolveSourceAttribution({ immediateSource: actor, controller: actor, trueSelf: actor.trueSelfId ?? null, owner: actor }); const mutation = resolveHpLoss(actor, Math.floor((actor.hpMax ?? 1) * action.cost.hp), 'hp-cost', source, false); if (!mutation.succeeded) return { ok: false, receipts: [], targetCount: 0, reason: 'blocked' }; commitHpMutation(game, actor, mutation, currentActionExecution(game)?.identity); }
  if (action.actionId === 'huyen_vu_chap_minh:skill2') consumeShieldByCurrentRatio(actor, 0.1);
  if (action.actionId === 'huyen_vu_chap_minh:skill3') {
    const source = resolveSourceAttribution({ immediateSource: actor, controller: actor, trueSelf: actor.trueSelfId ?? null, owner: actor });
    commitHealing(game, actor, resolveHealing(actor, Math.floor((actor.hpMax ?? 0) * 0.35), source), currentActionExecution(game)?.identity);
    Statuses.add(actor, { id: 'chap_minh_ult_arm_up', kind: 'buff', tag: 'arm-up', amount: 0.5, dur: 2, tick: 'turn', sourceUnitId: actor.id });
    Statuses.add(actor, { id: 'chap_minh_ult_res_up', kind: 'buff', tag: 'res-up', amount: 0.5, dur: 2, tick: 'turn', sourceUnitId: actor.id });
    for (const target of game.tokens.filter(t => t.alive && t.side !== actor.side)) dealAbilityDamage(game, actor, target, { base: Math.max(1, Math.floor(readAtkWilPower(actor) + readShieldAmount(actor) * 0.5)), dtype: 'mixed', attackType: 'skill' });
  }
  const receipts: EffectCommitReceipt[] = [];
  let maxTargets = 0;
  for (const effect of action.effects) {
    const targets = resolveTargets(game, actor, effect.target);
    maxTargets = Math.max(maxTargets, targets.length);
    const context: EffectExecutionContext = { session: game, action, sourceTrueSelfId: String(actor.trueSelfId ?? actor.id), sourceLifeId: String(actor.lifeSerial ?? 0), resolvedTargetIds: targets.map(t => t.iid ?? t.id), kitKey: action.actionId, authority: action.authority, mode: 'pve', random: Math.random, services: servicesFor(game, actor, targets.length ? targets : [actor]) };
    receipts.push(dispatchEffect(effect, context, actor.id, action.actionId));
  }
  return { ok: true, receipts, targetCount: maxTargets };
}

export function performCanonicalActiveSkill(game: SessionState, caster: UnitToken, skillKey: 'skill1' | 'skill2' | 'skill3', skill: SkillSection | null) {
  const definition = requireExecutableCharacterDefinition(caster.id).skills.find(a => a.actionId.endsWith(`:${skillKey}`));
  if (!definition) return buildSkillResult(false, skillKey, skill, EMPTY, EMPTY, 0, 'missing-skill');
  const run = () => executeCanonicalAction(game, caster, definition);
  const result = currentActionExecution(game) ? run() : executeActionTransaction({ game, identity: createNaturalAction(game, skillKey === 'skill3' ? 'ultimate' : 'active-skill'), actor: caster, targets: resolveTargets(game, caster, definition.target).slice(0, 1), resolvePayload: run }).payload;
  if (!result?.ok) return buildSkillResult(false, skillKey, skill, definition.metadataTags as string[], [], result?.targetCount ?? 0, result?.reason ?? 'blocked');
  return buildSkillResult(true, skillKey, skill, definition.metadataTags as string[], definition.effects.map(e => e.type), result.targetCount);
}
u