import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import { normalizeCombatHpValue, readCombatHpState } from '../number-utils.ts';
import { getLifeState, isCombatAlive, markHpZero } from './life-cycle.ts';
import { nextEventSerial } from './sequence.ts';
import type { ActionIdentity, CurrentHpPolicy, MaxHpPolicy, MutationResetPolicy, SourceAttribution } from './types.ts';

interface HpSnapshot { rawHpBefore: number; rawMaxHpBefore: number; hpBefore: number; maxHpBefore: number; targetIid: string | number; incarnationSerial: number; lifeSerial: number }
export interface HealResult extends HpSnapshot { requestedHeal: number; modifiedHeal: number; effectiveHeal: number; overheal: number; hpAfter: number; source: SourceAttribution; blocked: boolean }
export interface HpMutationResult extends HpSnapshot { kind: 'hp-cost' | 'self-damage' | 'sacrifice' | 'non-damage-hp-loss' | 'execute' | 'max-hp-mutation'; requestedAmount: number; effectiveAmount: number; hpAfter: number; maxHpAfter: number; source: SourceAttribution; canKill: boolean; succeeded: boolean; currentHpPolicy: CurrentHpPolicy; maxHpPolicy: MaxHpPolicy; resetPolicy: MutationResetPolicy }
const amount = (value: number, field: string): number => { if (!Number.isFinite(value) || value < 0) throw new Error(`[combat-kernel] ${field} must be finite and non-negative`); return value; };
const iid = (target: UnitToken): string | number => target.iid ?? target.id;
const snapshot = (target: UnitToken): HpSnapshot => {
  const rawHpBefore = Number(target.hp ?? 0); const rawMaxHpBefore = Number(target.hpMax ?? 0);
  if (!Number.isFinite(rawHpBefore) || !Number.isFinite(rawMaxHpBefore)) throw new Error('[combat-kernel] HP snapshot must be finite');
  const { hp: hpBefore, hpMax: maxHpBefore } = readCombatHpState(target);
  return { rawHpBefore, rawMaxHpBefore, hpBefore, maxHpBefore, targetIid: iid(target), incarnationSerial: target.incarnationSerial ?? 1, lifeSerial: target.lifeSerial ?? 1 };
};
const validateSnapshot = (target: UnitToken, result: HpSnapshot, label: string): void => {
  const current = snapshot(target);
  if (current.targetIid !== result.targetIid || current.incarnationSerial !== result.incarnationSerial || current.lifeSerial !== result.lifeSerial
    || current.rawHpBefore !== result.rawHpBefore || current.rawMaxHpBefore !== result.rawMaxHpBefore
    || current.hpBefore !== result.hpBefore || current.maxHpBefore !== result.maxHpBefore) throw new Error(`[combat-kernel] stale ${label} snapshot`);
};

export function resolveHealing(target: UnitToken, requestedHeal: number, source: SourceAttribution, modifiers: readonly number[] = []): HealResult {
  const requested = amount(requestedHeal, 'requestedHeal');
  const modified = modifiers.reduce((value, modifier, index) => value * amount(modifier, `healModifiers[${index}]`), requested);
  const state = snapshot(target); const { hpBefore, maxHpBefore } = state;
  const blocked = !isCombatAlive(target) || hpBefore <= 0; const effectiveHeal = blocked ? 0 : Math.min(Math.max(0, maxHpBefore - hpBefore), Math.floor(modified));
  return { ...state, requestedHeal: requested, modifiedHeal: modified, effectiveHeal, overheal: Math.max(0, Math.floor(modified) - effectiveHeal), hpAfter: hpBefore + effectiveHeal, source, blocked };
}
export function commitHealing(game: SessionState | null, target: UnitToken, result: HealResult, identity?: ActionIdentity): Record<string, unknown> {
  validateSnapshot(target, result, 'healing');
  if (!result.blocked && !isCombatAlive(target)) throw new Error('[combat-kernel] stale healing eligibility snapshot');
  if (!result.blocked) { target.hpMax = result.maxHpBefore; target.hp = Math.min(result.maxHpBefore, normalizeCombatHpValue(result.hpAfter)); }
  const event = { type: 'HEAL_RESOLVED', state: result.blocked ? 'blocked' : 'committed', eventSerial: game ? nextEventSerial(game) : 0, actionId: identity?.actionId ?? null, chainId: identity?.chainId ?? null, parentActionId: identity?.parentActionId ?? null, ...result };
  if (game) (((game.runtime ??= {}) as { combatEvents?: Record<string, unknown>[] }).combatEvents ??= []).push(event); return event;
}

export function resolveHpLoss(target: UnitToken, requestedAmount: number, kind: 'hp-cost' | 'self-damage' | 'sacrifice' | 'non-damage-hp-loss' | 'execute', source: SourceAttribution, canKill = false): HpMutationResult {
  const requested = normalizeCombatHpValue(amount(requestedAmount, 'hpMutation.amount'), 'hpMutation.amount'); const state = snapshot(target); const { hpBefore, maxHpBefore } = state;
  const available = canKill ? hpBefore : Math.max(0, hpBefore - 1); const succeeded = kind !== 'hp-cost' || requested <= available;
  const effective = succeeded ? Math.min(requested, available) : 0;
  return { ...state, kind, requestedAmount: requested, effectiveAmount: effective, hpAfter: hpBefore - effective, maxHpAfter: maxHpBefore, source, canKill, succeeded, currentHpPolicy: 'preserve-absolute', maxHpPolicy: 'unchanged', resetPolicy: 'never-within-battle' };
}

export function resolveMaxHpMutation(target: UnitToken, value: number, maxHpPolicy: MaxHpPolicy, currentHpPolicy: CurrentHpPolicy, source: SourceAttribution, options: { setCurrentHp?: number; resetPolicy?: MutationResetPolicy } = {}): HpMutationResult {
  const input = amount(value, 'maxHpMutation.value'); const state = snapshot(target); const { hpBefore, maxHpBefore } = state;
  const maxHpAfter = normalizeCombatHpValue(maxHpPolicy === 'unchanged' ? maxHpBefore : maxHpPolicy === 'add-flat' ? maxHpBefore + input : maxHpPolicy === 'add-percent' ? maxHpBefore * (1 + input) : input, 'maxHpAfter');
  let hpAfter = hpBefore;
  if (currentHpPolicy === 'preserve-ratio') hpAfter = maxHpBefore === 0 ? 0 : maxHpAfter * hpBefore / maxHpBefore;
  else if (currentHpPolicy === 'clamp' || currentHpPolicy === 'preserve-absolute') hpAfter = Math.min(hpBefore, maxHpAfter);
  else if (currentHpPolicy === 'set-full') hpAfter = maxHpAfter;
  else hpAfter = Math.min(maxHpAfter, amount(options.setCurrentHp ?? 0, 'setCurrentHp'));
  hpAfter = Math.floor(hpAfter);
  return { ...state, kind: 'max-hp-mutation', requestedAmount: input, effectiveAmount: maxHpAfter - maxHpBefore, hpAfter, maxHpAfter, source, canKill: false, succeeded: true, currentHpPolicy, maxHpPolicy, resetPolicy: options.resetPolicy ?? 'never-within-battle' };
}

export function commitHpMutation(game: SessionState | null, target: UnitToken, result: HpMutationResult, identity?: ActionIdentity): Record<string, unknown> {
  validateSnapshot(target, result, 'HP mutation');
  if (result.succeeded) {
    target.hpMax = result.maxHpAfter;
    target.hp = result.hpAfter;
    if (result.hpBefore > 0 && result.hpAfter === 0) markHpZero(target);
  }
  const event = { type: 'HP_MUTATION_RESOLVED', state: result.succeeded ? 'committed' : 'blocked', eventSerial: game ? nextEventSerial(game) : 0, actionId: identity?.actionId ?? null, chainId: identity?.chainId ?? null, parentActionId: identity?.parentActionId ?? null, ...result };
  if (game) (((game.runtime ??= {}) as { combatEvents?: Record<string, unknown>[] }).combatEvents ??= []).push(event); return event;
}
