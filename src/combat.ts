import { Statuses, hookOnLethalDamage } from './statuses.ts';
import { applyDamage, grantShield } from './combat/apply-damage.ts';
import { asSessionWithVfx, vfxAddHit, vfxAddMelee, vfxAddLightningArc } from './vfx.ts';
import { slotToCell } from './engine.ts';
import { emitPassiveEvent, getPassiveLog, type AfterHitHandler } from './passives.ts';
import { CFG } from './config.ts';
import { gainFury, startFurySkill, finishFuryHit } from './utils/fury.ts';
import { mergeBusyUntil, sessionNow } from './utils/time.ts';

export { applyDamage, grantShield };

import type { DamageResult } from './statuses.ts';
import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import type { GameConfig } from '@shared-types/config';

type TargetableGameState = SessionState | { tokens: ReadonlyArray<UnitToken> };

export interface AbilityDamageOptions {
  base?: number;
  defPen?: number;
  attackType?: string;
  dtype?: string;
  furyTag?: string;
  isAoE?: boolean;
  isCrit?: boolean;
  targetsHit?: number;
  [extra: string]: unknown;
}

export interface AbilityDamageResult {
  dealt: number;
  absorbed: number;
  total: number;
}

export interface BasicAttackAfterHitResult extends Record<string, unknown> {
  dealt: number;
  absorbed: number;
}

export interface BasicAttackAfterHitArgs extends Record<string, unknown> {
  target: UnitToken;
  owner: UnitToken;
  result: BasicAttackAfterHitResult;
}

export type BasicAttackAfterHitHandler = (ctx: BasicAttackAfterHitArgs) => void;

export interface BasicAttackContext extends Record<string, unknown> {
  target: UnitToken;
  damage: Record<string, unknown> & {
    baseMul: number;
    flatAdd: number;
  };
  afterHit: Array<AfterHitHandler<Record<string, unknown>>>;
  log?: Array<Record<string, unknown>>;
}

export const isBasicAttackAfterHitHandler = (
  handler: AfterHitHandler | BasicAttackAfterHitHandler | null | undefined,
): handler is BasicAttackAfterHitHandler => typeof handler === 'function';

interface ShieldAbsorptionResult {
  remain: number;
  absorbed: number;
  broke?: boolean;
}

const GAME_CONFIG = CFG as Readonly<GameConfig>;

export function pickTarget(Game: TargetableGameState, attacker: UnitToken): UnitToken | null {
  const foeSide = attacker.side === 'ally' ? 'enemy' : 'ally';
  const pool = Game.tokens.filter((t): t is UnitToken => t.side === foeSide && t.alive);
  if (pool.length === 0) return null;

  const attackerRow = attacker.cy;
  const targetSide = foeSide;
  const primarySlot = Math.max(1, Math.min(3, (attackerRow | 0) + 1));
  const slotPriority: ReadonlyArray<number> = [primarySlot, primarySlot + 3, primarySlot + 6];

  for (const slot of slotPriority) {
    const cell = slotToCell(targetSide, slot);
    const { cx, cy } = cell;
    const found = pool.find(t => t.cx === cx && t.cy === cy);
    if (found) return found;
  }

  const sorted = [...pool].sort((a, b) => {
    const distanceA = Math.abs(a.cx - attacker.cx) + Math.abs(a.cy - attacker.cy);
    const distanceB = Math.abs(b.cx - attacker.cx) + Math.abs(b.cy - attacker.cy);
    return distanceA - distanceB;
  });

  return sorted[0] ?? null;
}

export function dealAbilityDamage(
  Game: SessionState | null,
  attacker: UnitToken | null | undefined,
  target: UnitToken | null | undefined,
  opts: AbilityDamageOptions = {}
): AbilityDamageResult {
  if (!attacker || !target || !target.alive) {
    return { dealt: 0, absorbed: 0, total: 0 };
  }

  startFurySkill(attacker, { tag: String(opts.furyTag || opts.attackType || 'ability') });

  const dtype = typeof opts.dtype === 'string' ? opts.dtype : 'physical';
  const attackType = typeof opts.attackType === 'string' ? opts.attackType : 'skill';
  const baseDefault = dtype === 'arcane'
    ? Math.max(0, Math.floor(attacker.wil ?? 0))
    : Math.max(0, Math.floor(attacker.atk ?? 0));
  const base = Math.max(0, opts.base != null ? Math.floor(Number(opts.base)) : baseDefault);

  const pre = Statuses.beforeDamage(attacker, target, { dtype, base, attackType });

  const combinedPen = Math.max(0, Math.min(1, Math.max(pre.defPen ?? 0, opts.defPen ?? 0)));
  const defenseStat = dtype === 'arcane' ? target.res ?? 0 : target.arm ?? 0;

  let dmg = Math.max(0, Math.floor(pre.base * pre.outMul));
  if (pre.ignoreAll) {
    dmg = 0;
  } else {
    const effectiveDef = Math.max(0, defenseStat * (1 - combinedPen));
    dmg = Math.max(0, Math.floor(dmg * (1 - effectiveDef)));
    dmg = Math.max(0, Math.floor(dmg * pre.inMul));
  }

  const abs = Statuses.absorbShield(target, dmg, { dtype }) as ShieldAbsorptionResult;
  const remain = Math.max(0, Math.floor(abs.remain));

  if (remain > 0) {
    applyDamage(target, remain);
  }
  if (target.hp <= 0) {
    hookOnLethalDamage(target);
  }

  const damageResult: DamageResult = { dealt: remain, absorbed: abs.absorbed, dtype };
  Statuses.afterDamage(attacker, target, damageResult);

  const sessionVfx = asSessionWithVfx(Game);

  if (sessionVfx) {
    try {
      vfxAddHit(sessionVfx, target);
    } catch {
      // bỏ qua lỗi VFX runtime
    }
  }

  const dealt = Math.max(0, remain);
  const isKill = target.hp <= 0;

  gainFury(attacker, {
    type: attackType === 'basic' ? 'basic' : 'ability',
    dealt,
    isAoE: !!opts.isAoE,
    isKill,
    isCrit: !!opts.isCrit,
    targetsHit: Number.isFinite(opts.targetsHit) ? Number(opts.targetsHit) : 1,
    targetMaxHp: Number.isFinite(target.hpMax) ? target.hpMax : undefined,
  });

  gainFury(target, {
    type: 'damageTaken',
    dealt,
    isAoE: !!opts.isAoE,
    selfMaxHp: Number.isFinite(target.hpMax) ? target.hpMax : undefined,
    damageTaken: dealt,
  });

  finishFuryHit(target);
  finishFuryHit(attacker);

  return { dealt: remain, absorbed: abs.absorbed, total: dmg };
}

export interface HealResult {
  healed: number;
  overheal: number;
}

export function healUnit(target: UnitToken | null | undefined, amount: number): HealResult {
  if (!target || !Number.isFinite(target.hpMax)) {
    return { healed: 0, overheal: 0 };
  }

  const amt = Math.max(0, Math.floor(amount ?? 0));
  if (amt <= 0) {
    return { healed: 0, overheal: 0 };
  }

  const before = Math.max(0, Math.floor(target.hp ?? 0));
  const healCap = Math.max(0, (target.hpMax ?? 0) - before);
  const healed = Math.min(amt, healCap);
  target.hp = before + healed;

  return { healed, overheal: Math.max(0, amt - healed) };
}

export function basicAttack(Game: SessionState, unit: UnitToken): void {
  const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
  const pool = Game.tokens.filter((t): t is UnitToken => t.side === foeSide && t.alive);
  if (pool.length === 0) return;

  startFurySkill(unit, { tag: 'basic' });

  const fallback = pickTarget(Game, unit);
  const resolved = Statuses.resolveTarget(unit, pool, { attackType: 'basic' }) ?? fallback;
  if (!resolved) return;

  const isLoithienanh = unit.id === 'loithienanh';
  const sessionVfx = asSessionWithVfx(Game);

  const updateTurnBusy = (startedAt: number, busyMs: number): void => {
    if (!Game.turn) return;
    if (!Number.isFinite(startedAt) || !Number.isFinite(busyMs)) return;
    Game.turn.busyUntil = mergeBusyUntil(Game.turn.busyUntil, startedAt, busyMs);
  };

  const triggerLightningArc = (timing: string): void => {
    if (!isLoithienanh || !sessionVfx) return;
    const arcStart = sessionNow();
    try {
      const busyMs = vfxAddLightningArc(sessionVfx, unit, resolved, {
        bindingKey: 'basic_combo',
        timing,
      });
      updateTurnBusy(arcStart, busyMs);
    } catch {
      // bỏ qua lỗi VFX runtime
    }
  };

  const passiveCtx: BasicAttackContext = {
    target: resolved,
    damage: { baseMul: 1, flatAdd: 0 },
    afterHit: [],
    log: getPassiveLog(Game),
  };
  emitPassiveEvent(Game, unit, 'onBasicHit', passiveCtx);

  const meleeDur = GAME_CONFIG.ANIMATION?.meleeDurationMs ?? 1100;
  const meleeStartMs = sessionNow();
  let meleeTriggered = false;
  if (sessionVfx) {
    try {
      vfxAddMelee(sessionVfx, unit, resolved, { dur: meleeDur });
      meleeTriggered = true;
    } catch {
      // bỏ qua lỗi VFX runtime
    }
  }
  if (meleeTriggered && Game.turn) {
    Game.turn.busyUntil = mergeBusyUntil(Game.turn.busyUntil, meleeStartMs, meleeDur);
  }

  const dtype = 'physical' as const;
  const rawBase = Math.max(1, Math.floor((unit.atk ?? 0) + (unit.wil ?? 0)));
  const modBase = Math.max(
    1,
    Math.floor(rawBase * (passiveCtx.damage?.baseMul ?? 1) + (passiveCtx.damage?.flatAdd ?? 0))
  );
  const pre = Statuses.beforeDamage(unit, resolved, { dtype, base: modBase, attackType: 'basic' });
  let dmg = Math.max(1, Math.floor(pre.base * pre.outMul));

  const def = Math.max(0, (resolved.arm ?? 0) * (1 - (pre.defPen ?? 0)));
  dmg = Math.max(0, Math.floor(dmg * (1 - def)));
  dmg = Math.max(0, Math.floor(dmg * pre.inMul));

  triggerLightningArc('hit1');
  const abs = Statuses.absorbShield(resolved, dmg, { dtype }) as ShieldAbsorptionResult;

  triggerLightningArc('hit2');
  applyDamage(resolved, abs.remain);

  if (sessionVfx) {
    try {
      vfxAddHit(sessionVfx, resolved);
    } catch {
      // bỏ qua lỗi VFX runtime
    }
  }
  if (resolved.hp <= 0) {
    hookOnLethalDamage(resolved);
  }

  const dealt = Math.max(0, Math.min(dmg, abs.remain ?? 0));
  const damageResult: DamageResult = { dealt, absorbed: abs.absorbed, dtype };
  Statuses.afterDamage(unit, resolved, damageResult);

  const isKill = resolved.hp <= 0;
  gainFury(unit, {
    type: 'basic',
    dealt,
    isKill,
    targetsHit: 1,
    targetMaxHp: Number.isFinite(resolved.hpMax) ? resolved.hpMax : undefined,
  });
  gainFury(resolved, {
    type: 'damageTaken',
    dealt,
    selfMaxHp: Number.isFinite(resolved.hpMax) ? resolved.hpMax : undefined,
    damageTaken: dealt,
  });
  finishFuryHit(resolved);
  finishFuryHit(unit);

  const afterHitHandlers = passiveCtx.afterHit.filter(isBasicAttackAfterHitHandler);

  if (afterHitHandlers.length > 0) {
    const afterCtx: BasicAttackAfterHitArgs = {
      target: resolved,
      owner: unit,
      result: { dealt, absorbed: abs.absorbed },
    };
    for (const fn of afterHitHandlers) {
      try {
        fn(afterCtx);
      } catch (err) {
        console.error('[passive afterHit]', err);
      }
    }
  }
}

export function doBasicWithFollowups(Game: SessionState, unit: UnitToken, cap = 2): void {
  try {
    basicAttack(Game, unit);
    const followupCount = Math.max(0, cap | 0);
    for (let i = 0; i < followupCount; i += 1) {
      if (!unit || !unit.alive) break;
      basicAttack(Game, unit);
    }
  } catch (error) {
    console.error('[doBasicWithFollowups]', error);
  }
}