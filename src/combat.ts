//home (termux)/arclune_lane_7x3/src/combat.ts

import { getMetaById } from './catalog.ts';
import { Statuses, hookOnLethalDamage } from './statuses.ts';
import { applyDamage, grantShield } from './combat/apply-damage.ts';
import { asSessionWithVfx, vfxAddHit, vfxAddMelee, vfxAddLightningArc } from './vfx.ts';
import { slotIndex, slotToCell } from './engine.ts';
import { emitPassiveEvent, getPassiveLog, type AfterHitHandler } from './passives.ts';
import { CFG } from './config.ts';
import { gainFury, startFurySkill, finishFuryHit } from './utils/fury.ts';
import { mergeBusyUntil, sessionNow } from './utils/time.ts';

export { applyDamage, grantShield };

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

const RANK_PRIORITY: Readonly<Record<string, number>> = {
  N: 1,
  R: 2,
  SR: 3,
  SSR: 4,
  UR: 5,
  Prime: 6,
};

const toFinite = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeWeight = (value: unknown): number => Math.max(0, toFinite(value, 0));

const realmBonusFromUnit = (unit: UnitToken): number => {
  const realm = Math.max(0, Math.floor(toFinite(unit.realm, 0)));
  const subRealm = Math.max(0, Math.floor(toFinite(unit.subRealm, 0)));
  if (realm <= 0 && subRealm <= 0) return 0;
  const base = Math.max(0, Math.floor((unit.atk ?? 0) + (unit.wil ?? 0)));
  const ratio = Math.min(0.6, realm * 0.02 + subRealm * 0.005);
  return Math.round(base * ratio);
};

const getRankPriority = (unit: UnitToken | null | undefined): number => {
  if (!unit) return 0;
  const rank = typeof unit.rank === 'string' ? unit.rank : (getMetaById(unit.id)?.rank ?? '');
  return RANK_PRIORITY[rank] ?? 0;
};

const hasAbsoluteLawTag = (unit: UnitToken | null | undefined, mode: 'attack' | 'shield'): boolean => {
  if (!unit) return false;
  const statuses = Array.isArray(unit.statuses) ? unit.statuses : [];
  const modeNeedles = mode === 'attack'
    ? ['absolute_attack', 'tuyetdoi_cong']
    : ['absolute_shield', 'tuyetdoi_khien'];
  return statuses.some((status) => {
    const haystack = `${status.id ?? ''}|${status.tag ?? ''}`.toLowerCase();
    if (haystack.includes('absolute') || haystack.includes('tuyetdoi')) return true;
    return modeNeedles.some((needle) => haystack.includes(needle));
  });
};

const getSharedHpGroup = (target: UnitToken): string | null => {
  const ownKey = [target.sharedHpGroup, target.sharedDamageGroup, target.linkGroup]
    .find((value) => typeof value === 'string' && value.trim());
  if (typeof ownKey === 'string') return ownKey;
  const statuses = Array.isArray(target.statuses) ? target.statuses : [];
  for (const status of statuses) {
    const idTag = `${status.id ?? ''}|${status.tag ?? ''}`.toLowerCase();
    if (!idTag.includes('share')) continue;
    const linked = [status.group, status.link, status.key]
      .find((value) => typeof value === 'string' && value.trim());
    if (typeof linked === 'string') return linked;
  }
  return null;
};

const GAME_CONFIG = CFG as Readonly<GameConfig>;

export function pickTarget(Game: TargetableGameState, attacker: UnitToken): UnitToken | null {
  const foeSide = attacker.side === 'ally' ? 'enemy' : 'ally';
  const pool = Game.tokens.filter((t): t is UnitToken => t.side === foeSide && t.alive);
  if (pool.length === 0) return null;

  const meta = getMetaById(attacker.id);
  const className = meta?.class ?? null;
  const isAssassin = className === 'Assassin';

  const slotOf = (token: UnitToken): number => slotIndex(token.side, token.cx, token.cy);
  const occupiedSlots = new Set<number>(pool.map(slotOf));
  const isBlockedLeader = (slot: number): boolean => (
    slot === 8 && (occupiedSlots.has(2) || occupiedSlots.has(5))
  );

  if (isAssassin) {
    const backline = pool.filter((target) => slotOf(target) >= 7);
    if (backline.length > 0) {
      backline.sort((a, b) => {
        const distanceA = Math.abs(a.cx - attacker.cx) + Math.abs(a.cy - attacker.cy);
        const distanceB = Math.abs(b.cx - attacker.cx) + Math.abs(b.cy - attacker.cy);
        return distanceA - distanceB;
      });
      return backline[0] ?? null;
    }
  }

  const attackerRow = attacker.cy;
  const targetSide = foeSide;
  const primarySlot = Math.max(1, Math.min(3, (attackerRow | 0) + 1));
  const slotPriority: ReadonlyArray<number> = [primarySlot, primarySlot + 3, primarySlot + 6];

  for (const slot of slotPriority) {
    if (isBlockedLeader(slot)) continue;
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

  for (const target of sorted) {
    if (isBlockedLeader(slotOf(target))) continue;
    return target;
  }

  return null;
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
  const baseDefault = Math.max(0, Math.floor((attacker.atk ?? 0) + (attacker.wil ?? 0)));
  const base = Math.max(0, opts.base != null ? Math.floor(Number(opts.base)) : baseDefault);
  const skillMulti = Math.max(0, toFinite(opts.skillMul ?? opts.skillMultiplier ?? 1, 1));
  const realmBonus = Number.isFinite(toFinite(opts.realmBonus, Number.NaN))
    ? Math.floor(toFinite(opts.realmBonus, 0))
    : realmBonusFromUnit(attacker);

  const pre = Statuses.beforeDamage(attacker, target, { dtype, base, attackType });

  const combinedPen = Math.max(0, Math.min(1, Math.max(pre.defPen ?? 0, opts.defPen ?? 0)));
  const physWeightRaw = normalizeWeight(opts.physicalRatio ?? opts.physRatio ?? (dtype === 'mixed' ? 0.5 : 0));
  const arcWeightRaw = normalizeWeight(opts.arcaneRatio ?? opts.magicRatio ?? (dtype === 'mixed' ? 0.5 : 0));
  const splitTotal = physWeightRaw + arcWeightRaw;
  const physWeight = dtype === 'mixed' ? (splitTotal > 0 ? physWeightRaw / splitTotal : 0.5) : (dtype === 'arcane' ? 0 : 1);
  const arcWeight = dtype === 'mixed' ? (splitTotal > 0 ? arcWeightRaw / splitTotal : 0.5) : (dtype === 'arcane' ? 1 : 0);
  const effectiveArm = Math.max(0, (target.arm ?? 0) * (1 - combinedPen));
  const effectiveRes = Math.max(0, (target.res ?? 0) * (1 - combinedPen));
  const defMultiplier = (physWeight * (100 / (100 + effectiveArm))) + (arcWeight * (100 / (100 + effectiveRes)));

  const atkAbsolute = hasAbsoluteLawTag(attacker, 'attack');
  const shieldAbsolute = hasAbsoluteLawTag(target, 'shield');
  const attackerRank = getRankPriority(attacker);
  const targetRank = getRankPriority(target);
  const shieldWinsLaw = atkAbsolute && shieldAbsolute && targetRank > attackerRank;
  const bypassShieldByLaw = atkAbsolute && shieldAbsolute && attackerRank >= targetRank;

  let dmg = Math.max(0, Math.floor((pre.base * skillMulti + realmBonus) * pre.outMul));
  if (pre.ignoreAll) {
    dmg = 0;
  } else if (shieldWinsLaw) {
    dmg = 0;
  } else {
    dmg = Math.max(0, Math.floor(dmg * defMultiplier));
    dmg = Math.max(0, Math.floor(dmg * pre.inMul));
  }

  const abs = bypassShieldByLaw
    ? { remain: dmg, absorbed: 0, broke: false }
    : (Statuses.absorbShield(target, dmg, { dtype }) as ShieldAbsorptionResult);
  const remain = Math.max(0, Math.floor(abs.remain));

  let dealtTotal = 0;
  const sharedGroup = getSharedHpGroup(target);
  const sharedTargets = sharedGroup && Game
    ? Game.tokens.filter((token) => token.alive && token.side === target.side && getSharedHpGroup(token) === sharedGroup)
    : [];

  if (remain > 0 && sharedTargets.length > 1) {
    const split = Math.floor(remain / sharedTargets.length);
    let carry = remain - split * sharedTargets.length;
    for (const token of sharedTargets) {
      const payload = split + (carry > 0 ? 1 : 0);
      if (carry > 0) carry -= 1;
      if (payload <= 0) continue;
      const beforeHp = Math.max(0, Math.floor(token.hp ?? 0));
      applyDamage(token, payload);
      const afterHp = Math.max(0, Math.floor(token.hp ?? 0));
      dealtTotal += Math.max(0, beforeHp - afterHp);
      if (token.hp <= 0) {
        hookOnLethalDamage(token);
      }
    }
  } else if (remain > 0) {
    const beforeHp = Math.max(0, Math.floor(target.hp ?? 0));
    applyDamage(target, remain);
    const afterHp = Math.max(0, Math.floor(target.hp ?? 0));
    dealtTotal += Math.max(0, beforeHp - afterHp);
  }
  if (target.hp <= 0) {
    hookOnLethalDamage(target);
  }

  const damageResult: DamageResult = { dealt: dealtTotal, absorbed: abs.absorbed, dtype };
  Statuses.afterDamage(attacker, target, damageResult);

  const sessionVfx = asSessionWithVfx(Game);

  if (sessionVfx) {
    try {
      vfxAddHit(sessionVfx, target);
    } catch {
      // bỏ qua lỗi VFX runtime
    }
  }

  const dealt = Math.max(0, dealtTotal);
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

  return { dealt, absorbed: abs.absorbed, total: dmg };
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

  const meleeDur = GAME_CONFIG.ANIMATION?.meleeDurationMs ?? 2000;
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

  const rawBase = Math.max(1, Math.floor((unit.atk ?? 0) + (unit.wil ?? 0)));
  const modBase = Math.max(
    1,
    Math.floor(rawBase * (passiveCtx.damage?.baseMul ?? 1) + (passiveCtx.damage?.flatAdd ?? 0))
  );

  triggerLightningArc('hit1');
  triggerLightningArc('hit2');
  const hitResult = dealAbilityDamage(Game, unit, resolved, {
    base: modBase,
    dtype: 'physical',
    attackType: 'basic',
  });

  if (sessionVfx) {
    try {
      vfxAddHit(sessionVfx, resolved);
    } catch {
      // bỏ qua lỗi VFX runtime
    }
  }
  const dealt = hitResult.dealt;

  const afterHitHandlers = passiveCtx.afterHit.filter(isBasicAttackAfterHitHandler);

  if (afterHitHandlers.length > 0) {
    const afterCtx: BasicAttackAfterHitArgs = {
      target: resolved,
      owner: unit,
      result: { dealt, absorbed: hitResult.absorbed },
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