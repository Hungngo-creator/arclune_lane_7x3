import { getUnitRuntimeHook, UNIT_RUNTIME_HOOKS } from './runtime-hooks/registry.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import type {
  RuntimeOnUnitDeathContext,
  RuntimeOnBasicAttackContext,
  RuntimeOnUnitReviveContext,
  RuntimeSkillContext,
  RuntimeUltContext,
  UnitRuntimeHook,
} from './runtime-hooks/types.ts';

export type {
  RuntimeSkillContext,
  UnitRuntimeHook,
};

function forEachRuntimeHook(game: SessionState, callback: (unit: UnitToken, hook: UnitRuntimeHook) => void): void {
  for (const token of game.tokens) {
    if (!token) continue;
    const hook = getUnitRuntimeHook(token.id);
    if (!hook) continue;
    callback(token, hook);
  }
}

export { getUnitRuntimeHook };

export function runRuntimeTurnStart(game: SessionState, unit: UnitToken | null | undefined): void {
  if (!unit) return;
  getUnitRuntimeHook(unit.id)?.onTurnStart?.({ game, unit });
}

export function runRuntimeActionEnd(game: SessionState, unit: UnitToken | null | undefined): void {
  if (!unit) return;
  getUnitRuntimeHook(unit.id)?.onActionEnd?.({ game, unit });
}

export function runRuntimeTurnEnd(game: SessionState, unit: UnitToken | null | undefined): void {
  if (!unit) return;
  getUnitRuntimeHook(unit.id)?.onTurnEnd?.({ game, unit });
}

export function runRuntimeDamageResolved(target: UnitToken | null | undefined): void {
  if (!target) return;
  getUnitRuntimeHook(target.id)?.onDamageResolved?.({ target });
}

export function runRuntimeActiveSkill(ctx: RuntimeSkillContext): void {
  getUnitRuntimeHook(ctx.caster.id)?.onActiveSkill?.(ctx);
}

export function runRuntimeUlt(ctx: RuntimeUltContext): void {
  getUnitRuntimeHook(ctx.caster.id)?.onUlt?.(ctx);
}

export function runRuntimeUnitDeath(ctx: RuntimeOnUnitDeathContext): void {
  const handledUnitIds = new Set<string>();
  forEachRuntimeHook(ctx.game, (unit, hook) => {
    if (!hook.onUnitDeath) return;
    if (handledUnitIds.has(unit.id)) return;
    handledUnitIds.add(unit.id);
    hook.onUnitDeath(ctx);
  });
}

export function runRuntimeUnitRevive(ctx: RuntimeOnUnitReviveContext): void {
  const hook = getUnitRuntimeHook(ctx.unit.id);
  hook?.onUnitRevive?.(ctx);
}

export function listRuntimeHookUnitIds(): string[] {
  return Object.keys(UNIT_RUNTIME_HOOKS);
}

export function runRuntimeBasicAttackResolved(ctx: RuntimeOnBasicAttackContext): void {
  if (!ctx.attacker?.alive || !ctx.target) return;
  getUnitRuntimeHook(ctx.attacker.id)?.onBasicAttackResolved?.(ctx);
}