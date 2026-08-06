import { buildSkillResult } from './skill-result.ts';
import { dispatchEffect, validateEffectSpec, type EffectCommitReceipt, type EffectExecutionContext, type EffectSpec, type TargetSpec } from './canonical-model.ts';
import { requireExecutableCharacterDefinition, type ExecutableActionDefinition } from './executable-character-definition.ts';
import { getSessionRandom } from './session-rng.ts';
import { createCanonicalEffectServices, validateCanonicalEffectPreparation, reserveCanonicalActionCosts } from './canonical-effect-gateways.ts';
import { createNaturalAction, currentActionExecution, executeActionTransaction } from './kernel/public.ts';
import { pickCombatTarget } from './target-resolver.ts';
import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import type { SkillSection } from '@shared-types/config';

export type CanonicalActionKey = 'basic' | 'skill1' | 'skill2' | 'skill3' | 'ultimate';
const EMPTY: string[] = [];

function resolveTargets(game: SessionState, actor: UnitToken, spec: TargetSpec): UnitToken[] {
  if (spec.kind === 'self') return actor.alive ? [actor] : [];
  const enemies = game.tokens.filter(t => t.alive && t.side !== actor.side);
  const allies = game.tokens.filter(t => t.alive && t.side === actor.side);
  if (spec.kind === 'selected-enemy') { const selected = pickCombatTarget(game, actor); return selected ? [selected] : []; }
  if (spec.kind === 'selected-ally') return allies.filter(t => t.iid !== actor.iid).slice(0, 1);
  if (spec.kind === 'leader') return game.tokens.filter(t => t.alive && t.side === actor.side && t.isLeader).slice(0, 1);
  if (spec.kind === 'all') return spec.side === 'enemy' ? enemies : allies;
  if (spec.kind === 'random' || spec.kind === 'multiple' || spec.kind === 'single') return (spec.side === 'enemy' ? enemies : allies).slice(0, spec.kind === 'single' ? 1 : Math.max(1, spec.count ?? 1));
  if (spec.kind === 'explicit-iids') return game.tokens.filter(t => t.alive && spec.iids.includes(t.iid ?? t.id));
  return ((spec as { side?: 'ally' | 'enemy' }).side === 'enemy' ? enemies : allies).slice(0, 3);
}

function actionUsageKey(actor: UnitToken, action: ExecutableActionDefinition): string {
  return `${actor.iid ?? actor.id}:${action.actionId}`;
}

function actionUsageMap(game: SessionState): Map<string, number> {
  const runtime = (game.runtime ??= {}) as { canonicalActionUses?: Map<string, number> };
  if (!(runtime.canonicalActionUses instanceof Map)) runtime.canonicalActionUses = new Map();
  return runtime.canonicalActionUses;
}

function validateActionUsageLimit(game: SessionState, actor: UnitToken, action: ExecutableActionDefinition): boolean {
  const limit = action.conditions.find(condition => condition.type === 'maximum-uses-per-battle');
  return !limit || (actionUsageMap(game).get(actionUsageKey(actor, action)) ?? 0) < limit.uses;
}

function recordActionUse(game: SessionState, actor: UnitToken, action: ExecutableActionDefinition): void {
  const key = actionUsageKey(actor, action);
  const uses = actionUsageMap(game);
  uses.set(key, (uses.get(key) ?? 0) + 1);
}

function actionByKey(compiled: ReturnType<typeof requireExecutableCharacterDefinition>, actionKey: CanonicalActionKey): ExecutableActionDefinition | null {
  return compiled.actions[actionKey] ?? (actionKey === 'skill3' ? compiled.actions.ultimate ?? null : null);
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
    return { effect, targets };
  });
  return prepared.every(item => validateCanonicalEffectPreparation(game, actor, item.effect, item.targets)) ? prepared : null;
}

export function executeCanonicalAction(game: SessionState, actor: UnitToken, action: ExecutableActionDefinition): { ok: boolean; receipts: readonly EffectCommitReceipt[]; targetCount: number; actionId?: string | number; reason?: 'blocked' | 'insufficient-cost' } {
  if (!actor.alive || !validateConditions(game, actor, action) || !validateActionUsageLimit(game, actor, action)) return { ok: false, receipts: [], targetCount: 0, reason: 'blocked' };
const prepared = prepareEffects(game, actor, action);
  if (!prepared) return { ok: false, receipts: [], targetCount: 0, reason: 'blocked' };
  const costReservations = reserveCanonicalActionCosts(game, actor, action);
  if (!costReservations.every(item => item.validate())) { costReservations.forEach(item => item.release()); return { ok: false, receipts: [], targetCount: 0, reason: 'insufficient-cost' }; }
  const receipts: EffectCommitReceipt[] = [];
  let maxTargets = 0;
  const run = () => {
    for (const item of prepared) {
      maxTargets = Math.max(maxTargets, item.targets.length);
      const context: EffectExecutionContext = { session: game, action, sourceTrueSelfId: String(actor.trueSelfId ?? actor.id), sourceLifeId: String(actor.lifeSerial ?? 0), resolvedTargetIds: item.targets.map(t => t.iid ?? t.id), kitKey: action.actionId, authority: action.authority, mode: 'pve', random: getSessionRandom(game), services: createCanonicalEffectServices(game, actor, item.targets) };
      receipts.push(dispatchEffect(item.effect, context, actor.id, action.actionId));
    }
    recordActionUse(game, actor, action);
    return { ok: true, receipts, targetCount: maxTargets };
  };
  if (currentActionExecution(game)) { costReservations.forEach(item => item.commit()); return { ...run(), actionId: currentActionExecution(game)!.identity.actionId }; }
  const identity = createNaturalAction(game, action.actionId === `${actor.id}:ultimate` ? 'ultimate' : action.actionId === `${actor.id}:basic` ? 'basic' : 'active-skill');
  const transaction = executeActionTransaction({ game, identity, actor, targets: resolveTargets(game, actor, action.target).slice(0, 1), validateActor: () => actor.alive && validateConditions(game, actor, action), validateTargets: () => prepared.length > 0, reserveCosts: () => costReservations, resolvePayload: run });
  return transaction.payload ? { ...transaction.payload, actionId: identity.actionId } : { ok: false, receipts: [], targetCount: 0, reason: transaction.reason === 'insufficient-cost' ? 'insufficient-cost' : 'blocked' };
}

export function performCanonicalActiveSkill(game: SessionState, caster: UnitToken, skillKey: 'skill1' | 'skill2' | 'skill3', skill: SkillSection | null) {
  const compiled = requireExecutableCharacterDefinition(caster.id);
  const definition = actionByKey(compiled, skillKey);
  if (!definition) return buildSkillResult(false, skillKey, skill, EMPTY, EMPTY, 0, 'missing-skill');
  const result = executeCanonicalAction(game, caster, definition);
  if (!result?.ok) return buildSkillResult(false, skillKey, skill, definition.metadataTags as string[], [], result?.targetCount ?? 0, result?.reason ?? 'blocked');
  return buildSkillResult(true, skillKey, skill, definition.metadataTags as string[], definition.effects.map(e => e.type), result.targetCount);
}
