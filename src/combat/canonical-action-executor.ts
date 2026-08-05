import { pickTarget } from '../combat.ts';
import { buildSkillResult } from './skill-result.ts';
import { dispatchEffect, validateEffectSpec, type EffectCommitReceipt, type EffectExecutionContext, type EffectSpec, type TargetSpec } from './canonical-model.ts';
import { requireExecutableCharacterDefinition, type ExecutableActionDefinition } from './executable-character-definition.ts';
import { createCanonicalEffectServices, validateCanonicalEffectPreparation, reserveCanonicalActionCosts } from './canonical-effect-gateways.ts';
import { createNaturalAction, currentActionExecution, executeActionTransaction } from './kernel/public.ts';
import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import type { SkillSection } from '@shared-types/config';

export type CanonicalActionKey = 'basic' | 'ultimate' | `skill${number}`;
const EMPTY: string[] = [];

function resolveTargets(game: SessionState, actor: UnitToken, spec: TargetSpec): UnitToken[] {
  if (spec.kind === 'self') return actor.alive ? [actor] : [];
  const enemies = game.tokens.filter(t => t.alive && t.side !== actor.side);
  const allies = game.tokens.filter(t => t.alive && t.side === actor.side);
  if (spec.kind === 'selected-enemy') { const target = pickTarget(game, actor); return target ? [target] : []; }
  if (spec.kind === 'selected-ally') return allies.filter(t => t.iid !== actor.iid).slice(0, 1);
  if (spec.kind === 'leader') return game.tokens.filter(t => t.alive && t.side === actor.side && t.isLeader).slice(0, 1);
  if (spec.kind === 'all') return spec.side === 'enemy' ? enemies : allies;
  if (spec.kind === 'random' || spec.kind === 'multiple' || spec.kind === 'single') return (spec.side === 'enemy' ? enemies : allies).slice(0, spec.kind === 'single' ? 1 : Math.max(1, spec.count ?? 1));
  if (spec.kind === 'explicit-iids') return game.tokens.filter(t => t.alive && spec.iids.includes(t.iid ?? t.id));
  return ((spec as { side?: 'ally' | 'enemy' }).side === 'enemy' ? enemies : allies).slice(0, 3);
}

function validateConditions(game: SessionState, actor: UnitToken, action: ExecutableActionDefinition): boolean {
  for (const c of action.conditions) {
    if (c.type === 'minimum-current-hp-ratio' && Number(actor.hp ?? 0) / Math.max(1, Number(actor.hpMax ?? 1)) < c.ratio) return false;
    if (c.type === 'turn-parity') { const turn = Math.max(0, Number((game.turn as { turnCount?: number } | undefined)?.turnCount ?? 0)); if (turn > 0 && (turn % 2 === 0 ? 'even' : 'odd') !== c.parity) return false; }
    if (c.type === 'unique-summon' && game.tokens.some(t => t.alive && t.id === c.definitionId)) return false;
  }
  return true;
}

function prepareEffects(game: SessionState, actor: UnitToken, action: ExecutableActionDefinition): { readonly effect: EffectSpec; readonly targets: readonly UnitToken[] }[] | null {
  const prepared = action.effects.map(effect => {
    validateEffectSpec(effect, actor.id, action.actionId);
    const targets = resolveTargets(game, actor, effect.target);
    return { effect, targets: targets.length ? targets : [actor] };
  });
  return prepared.every(item => validateCanonicalEffectPreparation(game, actor, item.effect, item.targets)) ? prepared : null;
}

export function executeCanonicalAction(game: SessionState, actor: UnitToken, action: ExecutableActionDefinition): { ok: boolean; receipts: readonly EffectCommitReceipt[]; targetCount: number; reason?: 'blocked' | 'insufficient-aether' } {
  if (!actor.alive || !validateConditions(game, actor, action)) return { ok: false, receipts: [], targetCount: 0, reason: 'blocked' };
const prepared = prepareEffects(game, actor, action);
  if (!prepared) return { ok: false, receipts: [], targetCount: 0, reason: 'blocked' };
  const costReservations = reserveCanonicalActionCosts(game, actor, action);
  if (!costReservations.every(item => item.validate())) { costReservations.forEach(item => item.release()); return { ok: false, receipts: [], targetCount: 0, reason: 'insufficient-aether' }; }
  const receipts: EffectCommitReceipt[] = [];
  let maxTargets = 0;
  const run = () => {
    for (const item of prepared) {
      maxTargets = Math.max(maxTargets, item.targets.length);
      const context: EffectExecutionContext = { session: game, action, sourceTrueSelfId: String(actor.trueSelfId ?? actor.id), sourceLifeId: String(actor.lifeSerial ?? 0), resolvedTargetIds: item.targets.map(t => t.iid ?? t.id), kitKey: action.actionId, authority: action.authority, mode: 'pve', random: Math.random, services: createCanonicalEffectServices(game, actor, item.targets) };
      receipts.push(dispatchEffect(item.effect, context, actor.id, action.actionId));
    }
    return { ok: true, receipts, targetCount: maxTargets };
  };
  if (currentActionExecution(game)) { costReservations.forEach(item => item.commit()); return run(); }
  return executeActionTransaction({ game, identity: createNaturalAction(game, action.actionId.includes(':skill3') ? 'ultimate' : 'active-skill'), actor, targets: resolveTargets(game, actor, action.target).slice(0, 1), validateActor: () => actor.alive && validateConditions(game, actor, action), validateTargets: () => prepared.length > 0, reserveCosts: () => costReservations, resolvePayload: run }).payload ?? { ok: false, receipts: [], targetCount: 0, reason: 'blocked' };
}

export function performCanonicalActiveSkill(game: SessionState, caster: UnitToken, skillKey: 'skill1' | 'skill2' | 'skill3', skill: SkillSection | null) {
  const compiled = requireExecutableCharacterDefinition(caster.id);
  const definition = skillKey === 'skill3' ? compiled.ultimate : compiled.skills.find(a => a.actionId.endsWith(`:${skillKey}`));
  if (!definition) return buildSkillResult(false, skillKey, skill, EMPTY, EMPTY, 0, 'missing-skill');
  const result = executeCanonicalAction(game, caster, definition);
  if (!result?.ok) return buildSkillResult(false, skillKey, skill, definition.metadataTags as string[], [], result?.targetCount ?? 0, result?.reason ?? 'blocked');
  return buildSkillResult(true, skillKey, skill, definition.metadataTags as string[], definition.effects.map(e => e.type), result.targetCount);
}
