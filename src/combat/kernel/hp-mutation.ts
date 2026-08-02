import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import { markHpZero } from './life-cycle.ts';
import { nextEventSerial } from './sequence.ts';
import type { ActionIdentity, CurrentHpPolicy, MaxHpPolicy, MutationResetPolicy, SourceAttribution } from './types.ts';

export interface HealResult { requestedHeal: number; modifiedHeal: number; effectiveHeal: number; overheal: number; hpBefore: number; hpAfter: number; targetIid: string | number; source: SourceAttribution; blocked: boolean }
export interface HpMutationResult { kind: 'hp-cost' | 'sacrifice' | 'non-damage-hp-loss' | 'max-hp-mutation'; requestedAmount: number; effectiveAmount: number; hpBefore: number; hpAfter: number; maxHpBefore: number; maxHpAfter: number; targetIid: string | number; source: SourceAttribution; canKill: boolean; succeeded: boolean; currentHpPolicy: CurrentHpPolicy; maxHpPolicy: MaxHpPolicy; resetPolicy: MutationResetPolicy }
const amount = (value: number, field: string): number => { if (!Number.isFinite(value) || value < 0) throw new Error(`[combat-kernel] ${field} must be finite and non-negative`); return value; };
const iid = (target: UnitToken): string | number => target.iid ?? target.id;

export function resolveHealing(target: UnitToken, requestedHeal: number, source: SourceAttribution, modifiers: readonly number[] = []): HealResult {
  const requested = amount(requestedHeal, 'requestedHeal');
  const modified = modifiers.reduce((value, modifier, index) => value * amount(modifier, `healModifiers[${index}]`), requested);
  const hpBefore = amount(Number(target.hp ?? 0), 'target.hp'); const maxHp = amount(Number(target.hpMax ?? 0), 'target.hpMax');
  const blocked = target.alive === false || hpBefore <= 0; const effectiveHeal = blocked ? 0 : Math.min(Math.max(0, maxHp - hpBefore), Math.floor(modified));
  return { requestedHeal: requested, modifiedHeal: modified, effectiveHeal, overheal: Math.max(0, Math.floor(modified) - effectiveHeal), hpBefore, hpAfter: hpBefore + effectiveHeal, targetIid: iid(target), source, blocked };
}
export function commitHealing(game: SessionState | null, target: UnitToken, result: HealResult, identity?: ActionIdentity): Record<string, unknown> {
  if (iid(target) !== result.targetIid || Number(target.hp ?? 0) !== result.hpBefore) throw new Error('[combat-kernel] stale healing snapshot');
  if (!result.blocked) target.hp = result.hpAfter;
  const event = { type: 'HEAL_RESOLVED', state: result.blocked ? 'blocked' : 'committed', eventSerial: game ? nextEventSerial(game) : 0, actionId: identity?.actionId ?? null, chainId: identity?.chainId ?? null, parentActionId: identity?.parentActionId ?? null, ...result };
  if (game) (((game.runtime ??= {}) as { combatEvents?: Record<string, unknown>[] }).combatEvents ??= []).push(event); return event;
}

export function resolveHpLoss(target: UnitToken, requestedAmount: number, kind: 'hp-cost' | 'sacrifice' | 'non-damage-hp-loss', source: SourceAttribution, canKill = false): HpMutationResult {
  const requested = amount(requestedAmount, 'hpMutation.amount'); const hpBefore = amount(Number(target.hp ?? 0), 'target.hp'); const maxHp = amount(Number(target.hpMax ?? 0), 'target.hpMax');
  const available = canKill ? hpBefore : Math.max(0, hpBefore - 1); const succeeded = kind !== 'hp-cost' || requested <= available;
  const effective = succeeded ? Math.min(requested, available) : 0;
  return { kind, requestedAmount: requested, effectiveAmount: effective, hpBefore, hpAfter: hpBefore - effective, maxHpBefore: maxHp, maxHpAfter: maxHp, targetIid: iid(target), source, canKill, succeeded, currentHpPolicy: 'preserve-absolute', maxHpPolicy: 'unchanged', resetPolicy: 'never-within-battle' };
}

export function resolveMaxHpMutation(target: UnitToken, value: number, maxHpPolicy: MaxHpPolicy, currentHpPolicy: CurrentHpPolicy, source: SourceAttribution, options: { setCurrentHp?: number; resetPolicy?: MutationResetPolicy } = {}): HpMutationResult {
  const input = amount(value, 'maxHpMutation.value'); const hpBefore = amount(Number(target.hp ?? 0), 'target.hp'); const maxHpBefore = amount(Number(target.hpMax ?? 0), 'target.hpMax');
  const maxHpAfter = maxHpPolicy === 'unchanged' ? maxHpBefore : maxHpPolicy === 'add-flat' ? maxHpBefore + input : maxHpPolicy === 'add-percent' ? maxHpBefore * (1 + input) : input;
  let hpAfter = hpBefore;
  if (currentHpPolicy === 'preserve-ratio') hpAfter = maxHpBefore === 0 ? 0 : maxHpAfter * hpBefore / maxHpBefore;
  else if (currentHpPolicy === 'clamp' || currentHpPolicy === 'preserve-absolute') hpAfter = Math.min(hpBefore, maxHpAfter);
  else if (currentHpPolicy === 'set-full') hpAfter = maxHpAfter;
  else hpAfter = Math.min(maxHpAfter, amount(options.setCurrentHp ?? 0, 'setCurrentHp'));
  hpAfter = Math.floor(hpAfter);
  return { kind: 'max-hp-mutation', requestedAmount: input, effectiveAmount: maxHpAfter - maxHpBefore, hpBefore, hpAfter, maxHpBefore, maxHpAfter, targetIid: iid(target), source, canKill: false, succeeded: true, currentHpPolicy, maxHpPolicy, resetPolicy: options.resetPolicy ?? 'never-within-battle' };
}

export function commitHpMutation(game: SessionState | null, target: UnitToken, result: HpMutationResult, identity?: ActionIdentity): Record<string, unknown> {
  if (iid(target) !== result.targetIid || Number(target.hp ?? 0) !== result.hpBefore || Number(target.hpMax ?? 0) !== result.maxHpBefore) throw new Error('[combat-kernel] stale HP mutation snapshot');
  if (result.succeeded) {
    target.hpMax = result.maxHpAfter;
    target.hp = result.hpAfter;
    if (result.hpBefore > 0 && result.hpAfter === 0) markHpZero(target);
  }
  const event = { type: 'HP_MUTATION_RESOLVED', state: result.succeeded ? 'committed' : 'blocked', eventSerial: game ? nextEventSerial(game) : 0, actionId: identity?.actionId ?? null, chainId: identity?.chainId ?? null, parentActionId: identity?.parentActionId ?? null, ...result };
  if (game) (((game.runtime ??= {}) as { combatEvents?: Record<string, unknown>[] }).combatEvents ??= []).push(event); return event;
}
