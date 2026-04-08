//home (termux)/arclune_lane_7x3/src/combat.ts

import { getMetaById } from './catalog.ts';
import { Statuses, hookOnLethalDamage } from './statuses.ts';
import type { DamageResult } from './statuses.ts';
import { applyDamage, grantShield } from './combat/apply-damage.ts';
import { calculateFinalDamage, type DamageBreakdownMetadata } from './combat/calculate-final-damage.ts';
import { asSessionWithVfx, vfxAddHit, vfxAddMelee, vfxAddLightningArc } from './vfx.ts';
import { slotIndex } from './engine.ts';
import { emitPassiveEvent, getPassiveLog, type AfterHitHandler } from './passives.ts';
import { CFG } from './config.ts';
import { gainFury, startFurySkill, finishFuryHit } from './utils/fury.ts';
import { mergeBusyUntil, sessionNow } from './utils/time.ts';
import { ABSOLUTE_ATTACK_TAG_IDS, ABSOLUTE_SHIELD_TAG_IDS } from './data/tags.ts';
import { applyUyenBasicExtras } from './leader-uyen.ts';
import { nextRngValue } from './utils/rng.ts';
import { normalizeClassName } from './utils/domain-normalization.ts';
import { getCounterBonusMetadata } from './combat/counter-matrix.ts';
import {
  applyChapMinhMitigation,
  recordChapMinhPreventedDamage,
} from './combat/chap-minh-runtime.ts';
import { runRuntimeDamageResolved } from './combat/unit-runtime-hooks.ts';

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
  classBonus?: number;
  elementBonus?: number;
  synergyBonus?: number;
  damageBreakdown?: Partial<DamageBreakdownMetadata>;
  skill?: unknown;
  [extra: string]: unknown;
}

export interface AbilityDamageResult {
  dealt: number;
  absorbed: number;
  total: number;
  breakdown: DamageBreakdownMetadata;
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
const ABSOLUTE_ATTACK_TAG_NEEDLES = ABSOLUTE_ATTACK_TAG_IDS
  .filter((needle): needle is string => typeof needle === 'string')
  .map((needle) => needle.toLowerCase());
const ABSOLUTE_SHIELD_TAG_NEEDLES = ABSOLUTE_SHIELD_TAG_IDS
  .filter((needle): needle is string => typeof needle === 'string')
  .map((needle) => needle.toLowerCase());

const toFinite = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp01 = (value: unknown): number => Math.max(0, Math.min(1, toFinite(value, 0)));

interface DamageEventContextSnapshot {
  attackerKey: string | null;
  defenderKey: string | null;
  actionType: string | null;
  damageType: string | null;
  rawDamage: number;
  finalDamage: number;
  dealtDamage: number;
  absorbedDamage: number;
  classBonus: number;
  elementBonus: number;
  synergyBonus: number;
  summary: string;
}

interface DamageMetadataCarrier extends UnitToken {
  _lastDamageContext?: DamageEventContextSnapshot | null;
  _lastCounterBreakdown?: DamageBreakdownMetadata | null;
  _lastDamageSummary?: string | null;
}

interface ReflectResolutionResult {
  reflectedToAttacker: number;
  reflectedToTarget: number;
}

const REFLECT_EQUAL_EPSILON = 0.0001;

const applyResolvedReflectDamage = (
  source: UnitToken,
  receiver: UnitToken,
  incomingDamage: number,
  dtype: string,
): number => {
  const normalizedIncoming = Math.max(0, Math.floor(incomingDamage));
  if (normalizedIncoming <= 0) return 0;

  const reflectCtx = Statuses.beforeDamage(source, receiver, {
    dtype,
    base: normalizedIncoming,
    attackType: 'reflect',
  });

  const total = calculateFinalDamage(source, receiver, null, normalizedIncoming, {
    ignoreAll: !!reflectCtx.ignoreAll,
    reductionMultiplier: reflectCtx.inMul,
    defenseMultiplier: dtype === 'arcane'
      ? (100 / (100 + Math.max(0, receiver.res ?? 0)))
      : (100 / (100 + Math.max(0, receiver.arm ?? 0))),
  }).total;

  const absorbed = Statuses.absorbShield(receiver, total, { dtype });
  const beforeHp = Math.max(0, Math.floor(receiver.hp ?? 0));
  applyDamage(receiver, absorbed.remain);
  const afterHp = Math.max(0, Math.floor(receiver.hp ?? 0));
  const dealt = Math.max(0, beforeHp - afterHp);
  if (receiver.hp <= 0) {
    hookOnLethalDamage(receiver);
  }
  if (dealt > 0) {
    gainFury(receiver, {
      type: 'damageTaken',
      dealt,
      selfMaxHp: Number.isFinite(receiver?.hpMax) ? receiver.hpMax : undefined,
      damageTaken: dealt,
    });
    finishFuryHit(receiver);
  }
  return dealt;
};

const resolveReflectDamage = (
  attacker: UnitToken,
  target: UnitToken,
  dealt: number,
  dtype: string,
): ReflectResolutionResult => {
  const targetReflect = clamp01(Statuses.get(target, 'reflect')?.power ?? 0);
  if (dealt <= 0 || targetReflect <= 0) {
    return { reflectedToAttacker: 0, reflectedToTarget: 0 };
  }

  const attackerReflect = clamp01(Statuses.get(attacker, 'reflect')?.power ?? 0);
  const hasEqualReflect = Math.abs(targetReflect - attackerReflect) <= REFLECT_EQUAL_EPSILON;
  const fullReflectDuel = targetReflect >= 1 && attackerReflect >= 1;

  if (fullReflectDuel || (hasEqualReflect && targetReflect > 0)) {
    const mirrored = Math.round(Math.max(0, dealt) * targetReflect);
    const reflectedToAttacker = applyResolvedReflectDamage(target, attacker, mirrored, dtype);
    const reflectedToTarget = applyResolvedReflectDamage(attacker, target, mirrored, dtype);
    return { reflectedToAttacker, reflectedToTarget };
  }

  const netReflectPct = Math.max(0, targetReflect - attackerReflect);
  if (netReflectPct <= 0) {
    return { reflectedToAttacker: 0, reflectedToTarget: 0 };
  }

  const reflectedToAttacker = applyResolvedReflectDamage(
    target,
    attacker,
    Math.round(dealt * netReflectPct),
    dtype,
  );
  return { reflectedToAttacker, reflectedToTarget: 0 };
};

const unitEventKey = (unit: UnitToken | null | undefined): string | null => {
  if (!unit) return null;
  const iid = Number.isFinite(unit.iid) ? String(unit.iid) : null;
  return iid ? `${unit.id}#${iid}` : unit.id;
};

const pctLabel = (bonus: number): string => `${bonus >= 0 ? '+' : ''}${Math.round(bonus * 100)}%`;

const buildDamageSummary = (ctx: Omit<DamageEventContextSnapshot, 'summary'>): string => {
  const source = ctx.actionType ?? 'attack';
  const target = ctx.defenderKey ?? 'target';
  return [
    `${source} hit ${target}: ${ctx.finalDamage} dmg`,
    `(class ${pctLabel(ctx.classBonus)}, element ${pctLabel(ctx.elementBonus)}, synergy ${pctLabel(ctx.synergyBonus)})`,
  ].join(' ');
};

const normalizeWeight = (value: unknown): number => Math.max(0, toFinite(value, 0));

const REALM_ROLE_SCALE: Readonly<Record<string, number>> = {
  Tanker: 0.9,
  Warrior: 1,
  Assassin: 1.02,
  Ranger: 1.03,
  Mage: 1.05,
  Support: 0.95,
  Summoner: 0.97,
};

const realmBonusFromUnit = (unit: UnitToken): number => {
  const realm = Math.max(0, Math.floor(toFinite(unit.realm, 0)));
  const subRealm = Math.max(0, Math.floor(toFinite(unit.subRealm, 0)));
  if (realm <= 0 && subRealm <= 0) return 0;
  const base = Math.max(0, Math.floor((unit.atk ?? 0) + (unit.wil ?? 0)));
  const ratio = Math.min(0.6, realm * 0.02 + subRealm * 0.005);
  const className = normalizeClassName(getMetaById(unit.id)?.class);
  const roleScale = className ? (REALM_ROLE_SCALE[className] ?? 1) : 1;
  return Math.round(base * ratio * roleScale);
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
    ? ABSOLUTE_ATTACK_TAG_NEEDLES
    : ABSOLUTE_SHIELD_TAG_NEEDLES;

  const includesAbsolute = (value: string): boolean => (
    value.includes('absolute') || value.includes('tuyetdoi')
  );

  for (let i = 0; i < statuses.length; i += 1) {
    const status = statuses[i] as { id?: string; tag?: string };
    const id = typeof status.id === 'string' ? status.id.toLowerCase() : '';
    const tag = typeof status.tag === 'string' ? status.tag.toLowerCase() : '';
    if (includesAbsolute(id) || includesAbsolute(tag)) return true;
    for (let j = 0; j < modeNeedles.length; j += 1) {
      const needle = modeNeedles[j];
      if (!needle) continue;
      if (id.includes(needle) || tag.includes(needle)) return true;
    }
  }
  return false;
};

const getSharedHpGroup = (target: UnitToken): string | null => {
  const sharedHpGroup = target.sharedHpGroup;
  if (typeof sharedHpGroup === 'string' && sharedHpGroup.trim()) return sharedHpGroup;
  const sharedDamageGroup = target.sharedDamageGroup;
  if (typeof sharedDamageGroup === 'string' && sharedDamageGroup.trim()) return sharedDamageGroup;
  const linkGroup = target.linkGroup;
  if (typeof linkGroup === 'string' && linkGroup.trim()) return linkGroup;
  const statuses = Array.isArray(target.statuses) ? target.statuses : [];
  for (let i = 0; i < statuses.length; i += 1) {
    const status = statuses[i] as Record<string, unknown>;
    const idTag = `${status.id ?? ''}|${status.tag ?? ''}`.toLowerCase();
    if (!idTag.includes('share')) continue;
    const group = status.group;
    if (typeof group === 'string' && group.trim()) return group;
    const link = status.link;
    if (typeof link === 'string' && link.trim()) return link;
    const key = status.key;
    if (typeof key === 'string' && key.trim()) return key;
  }
  return null;
};

const getSharedHpRules = (target: UnitToken): { group: string | null; weight: number; capRatio: number | null } => {
  const group = getSharedHpGroup(target);
  if (!group) return { group: null, weight: 1, capRatio: null };
  const statuses = Array.isArray(target.statuses) ? target.statuses : [];
  const weighted = toFinite(target.sharedHpWeight ?? target.shareWeight, Number.NaN);
  const capped = toFinite(target.sharedHpCapRatio ?? target.shareCapRatio, Number.NaN);
  let weight = Number.isFinite(weighted) ? Math.max(0.05, weighted) : 1;
  let capRatio = Number.isFinite(capped) ? Math.max(0, capped) : null;
  for (let i = 0; i < statuses.length; i += 1) {
    const status = statuses[i] as Record<string, unknown>;
    const idTag = `${status.id ?? ''}|${status.tag ?? ''}`.toLowerCase();
    if (!idTag.includes('share')) continue;
    const statusWeight = toFinite(status.weight, Number.NaN);
    if (Number.isFinite(statusWeight)) weight = Math.max(0.05, statusWeight);
    const statusCap = toFinite(status.capRatio, Number.NaN);
    if (Number.isFinite(statusCap)) capRatio = Math.max(0, statusCap);
  }
  return { group, weight, capRatio };
};

const GAME_CONFIG = CFG as Readonly<GameConfig>;

export function pickTarget(Game: TargetableGameState, attacker: UnitToken): UnitToken | null {
  const foeSide = attacker.side === 'ally' ? 'enemy' : 'ally';
  const pool: UnitToken[] = [];
  const bySlot = new Map<number, UnitToken>();
  const occupiedSlots = new Set<number>();
  let nearestOverall: UnitToken | null = null;
  let nearestOverallDistance = Number.POSITIVE_INFINITY;

  const distanceToAttacker = (token: UnitToken): number => (
    Math.abs(token.cx - attacker.cx) + Math.abs(token.cy - attacker.cy)
  );

  for (const token of Game.tokens) {
    if (token.side !== foeSide || !token.alive) continue;
    pool.push(token);
    const slot = slotIndex(token.side, token.cx, token.cy);
    bySlot.set(slot, token);
    occupiedSlots.add(slot);
    const distance = distanceToAttacker(token);
    if (
      !nearestOverall
      || distance < nearestOverallDistance
      || (distance === nearestOverallDistance && slot < slotIndex(nearestOverall.side, nearestOverall.cx, nearestOverall.cy))
    ) {
      nearestOverall = token;
      nearestOverallDistance = distance;
    }
  }

  if (pool.length === 0) return null;

  const meta = getMetaById(attacker.id);
  const className = normalizeClassName(meta?.class);
  const isAssassin = className === 'Assassin';

  const slotOf = (token: UnitToken): number => slotIndex(token.side, token.cx, token.cy);

  const isBlockedLeader = (slot: number): boolean => (
    slot === 8 && (occupiedSlots.has(2) || occupiedSlots.has(5))
  );

  if (isAssassin) {
    let nearestBackline: UnitToken | null = null;
    let nearestBacklineDistance = Number.POSITIVE_INFINITY;
    for (const target of pool) {
      const slot = slotOf(target);
      if (slot < 7) continue;
      const distance = distanceToAttacker(target);
      if (
        !nearestBackline
        || distance < nearestBacklineDistance
        || (distance === nearestBacklineDistance && slot < slotOf(nearestBackline))
      ) {
        nearestBackline = target;
        nearestBacklineDistance = distance;
      }
    }
    if (nearestBackline) return nearestBackline;
  }

  const attackerRow = attacker.cy;
  const targetSide = foeSide;
  const primarySlot = Math.max(1, Math.min(3, (attackerRow | 0) + 1));
  const slotPriority: ReadonlyArray<number> = [primarySlot, primarySlot + 3, primarySlot + 6];

  for (const slot of slotPriority) {
    if (isBlockedLeader(slot)) continue;
    const found = bySlot.get(slot);
    if (found) return found;
  }

  if (nearestOverall && !isBlockedLeader(slotOf(nearestOverall))) {
    return nearestOverall;
  }

  for (const target of pool) {
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
    return {
      dealt: 0,
      absorbed: 0,
      total: 0,
      breakdown: { classBonus: 0, elementBonus: 0, synergyBonus: 0 },
    };
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
  const sideUnits = Game?.tokens?.filter((token) => token.side === attacker.side && token.alive) ?? [];
  const counterMetadata = getCounterBonusMetadata(attacker, target, sideUnits, { skill: opts.skill });

  const atkAbsolute = hasAbsoluteLawTag(attacker, 'attack');
  const shieldAbsolute = hasAbsoluteLawTag(target, 'shield');
  const attackerRank = getRankPriority(attacker);
  const targetRank = getRankPriority(target);
  const shieldWinsLaw = atkAbsolute && shieldAbsolute && targetRank > attackerRank;
  const bypassShieldByLaw = atkAbsolute && shieldAbsolute && attackerRank >= targetRank;

  const rawDamage = Math.max(0, Math.floor((pre.base * skillMulti + realmBonus) * pre.outMul));
  const bonusBreakdown = {
    classBonus: toFinite(opts.classBonus ?? opts.damageBreakdown?.classBonus, counterMetadata.classBonus),
    elementBonus: toFinite(opts.elementBonus ?? opts.damageBreakdown?.elementBonus, counterMetadata.elementBonus),
    synergyBonus: toFinite(opts.synergyBonus ?? opts.damageBreakdown?.synergyBonus, counterMetadata.synergyBonus),
  };
  const finalDamage = calculateFinalDamage(attacker, target, opts.skill, rawDamage, {
    ignoreAll: pre.ignoreAll || shieldWinsLaw,
    defenseMultiplier: defMultiplier,
    reductionMultiplier: pre.inMul,
    breakdown: bonusBreakdown,
  });
  const chapMinhMitigation = applyChapMinhMitigation(target, finalDamage.total, {
    isAoE: !!opts.isAoE,
    skill: opts.skill,
  });
  const dmg = chapMinhMitigation.finalDamage;
  if (chapMinhMitigation.prevented > 0) {
    recordChapMinhPreventedDamage(chapMinhMitigation.owner, chapMinhMitigation.prevented);
  }

  const abs = bypassShieldByLaw
    ? { remain: dmg, absorbed: 0, broke: false }
    : (Statuses.absorbShield(target, dmg, { dtype }) as ShieldAbsorptionResult);
  const remain = Math.max(0, Math.floor(abs.remain));
  let dealtTotal = 0;
  const attackerState = attacker as UnitToken & { _directKills?: number };

  const emitOnDeathPassive = (unit: UnitToken): void => {
    if (!Game || unit.alive) return;
    const deadAt = Number(unit.deadAt ?? 0);
    const marker = Number((unit as UnitToken & { _passiveDeathAt?: number })._passiveDeathAt ?? Number.NaN);
    if (Number.isFinite(marker) && marker === deadAt) return;
    (unit as UnitToken & { _passiveDeathAt?: number })._passiveDeathAt = deadAt;
    emitPassiveEvent(Game, unit, 'onDeath', { log: getPassiveLog(Game) });
  };
  const sharedRules = getSharedHpRules(target);
  const sharedTargets = [] as UnitToken[];
  if (sharedRules.group && Game) {
    for (let i = 0; i < Game.tokens.length; i += 1) {
      const token = Game.tokens[i];
      if (!token?.alive || token.side !== target.side) continue;
      const tokenGroup = getSharedHpGroup(token);
      if (tokenGroup === sharedRules.group) sharedTargets.push(token);
    }
  }

  if (remain > 0 && sharedTargets.length > 1) {
    const weightedTargets = [] as Array<{ token: UnitToken; weight: number; capRatio: number | null }>;
    for (const token of sharedTargets) {
      const rules = token === target ? sharedRules : getSharedHpRules(token);
      weightedTargets.push({ token, weight: Math.max(0.05, rules.weight), capRatio: rules.capRatio });
    }
    const totalWeight = weightedTargets.reduce((acc, entry) => acc + entry.weight, 0) || 1;
    let assigned = 0;
    for (let i = 0; i < weightedTargets.length; i += 1) {
      const entry = weightedTargets[i];
      if (!entry) continue;
      const isLast = i === weightedTargets.length - 1;
      let payload = isLast
        ? Math.max(0, remain - assigned)
        : Math.max(0, Math.floor(remain * (entry.weight / totalWeight)));
      if (entry.capRatio != null && Number.isFinite(entry.token.hpMax)) {
        const capValue = Math.max(0, Math.floor((entry.token.hpMax ?? 0) * entry.capRatio));
        payload = Math.min(payload, capValue);
      }
      assigned += payload;
      if (payload <= 0) continue;
      const beforeHp = Math.max(0, Math.floor(entry.token.hp ?? 0));
      applyDamage(entry.token, payload);
      const afterHp = Math.max(0, Math.floor(entry.token.hp ?? 0));
      dealtTotal += Math.max(0, beforeHp - afterHp);
      if (entry.token.hp <= 0) {
        hookOnLethalDamage(entry.token);
        emitOnDeathPassive(entry.token);
      }
    }
  } else if (remain > 0) {
    const beforeHp = Math.max(0, Math.floor(target.hp ?? 0));
    applyDamage(target, remain);
    const afterHp = Math.max(0, Math.floor(target.hp ?? 0));
    dealtTotal += Math.max(0, beforeHp - afterHp);
  }
  if (target.hp <= 0) {
    emitPassiveEvent(Game, target, 'onLethalDamage', { log: getPassiveLog(Game), attacker, attackType });
  }
  if (target.hp <= 0) {
    hookOnLethalDamage(target);
  }
  runRuntimeDamageResolved(target);

  const damageResult: DamageResult = {
    dealt: dealtTotal,
    absorbed: abs.absorbed,
    dtype,
    breakdown: finalDamage.breakdown,
  };
  Statuses.afterDamage(attacker, target, damageResult);
  const dealt = Math.max(0, dealtTotal);
  resolveReflectDamage(attacker, target, dealt, dtype);

  const sessionVfx = asSessionWithVfx(Game);

  if (sessionVfx) {
    try {
      const hasAdvantage = (finalDamage.breakdown.classBonus + finalDamage.breakdown.elementBonus + finalDamage.breakdown.synergyBonus) > 0;
      vfxAddHit(sessionVfx, target, { isCrit: !!opts.isCrit, advantage: hasAdvantage });
    } catch {
      // bỏ qua lỗi VFX runtime
    }
  }

  const isKill = target.hp <= 0;
  if (isKill) {
    attackerState._directKills = Math.max(0, Math.floor(Number(attackerState._directKills ?? 0))) + 1;
    emitPassiveEvent(Game, attacker, 'onEnemyDeath', { log: getPassiveLog(Game), target, attackType, isDirectKill: true });
    const bloodAvatarObservers = Game?.tokens?.filter((token) =>
      token.alive
      && token.id === 'blood_avatar'
      && token.side !== target.side
      && token.iid !== attacker.iid
    ) ?? [];
    if (bloodAvatarObservers.length > 0) {
      const observerLog = getPassiveLog(Game);
      for (const observer of bloodAvatarObservers) {
        emitPassiveEvent(Game, observer, 'onEnemyDeath', {
          log: observerLog,
          target,
          attackType,
          isDirectKill: false,
        });
      }
    }
  }

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

  const attackerCarrier = attacker as DamageMetadataCarrier;
  const metadataBase = {
    attackerKey: unitEventKey(attacker),
    defenderKey: unitEventKey(target),
    actionType: attackType || null,
    damageType: dtype || null,
    rawDamage: rawDamage,
    finalDamage: dmg,
    dealtDamage: dealt,
    absorbedDamage: abs.absorbed,
    classBonus: finalDamage.breakdown.classBonus,
    elementBonus: finalDamage.breakdown.elementBonus,
    synergyBonus: finalDamage.breakdown.synergyBonus,
  };
  const snapshot: DamageEventContextSnapshot = {
    ...metadataBase,
    summary: buildDamageSummary(metadataBase),
  };
  const previous = attackerCarrier._lastDamageContext;
  if (!previous || snapshot.finalDamage >= previous.finalDamage) {
    attackerCarrier._lastDamageContext = snapshot;
    attackerCarrier._lastCounterBreakdown = { ...finalDamage.breakdown };
    attackerCarrier._lastDamageSummary = snapshot.summary;
  }

  return { dealt, absorbed: abs.absorbed, total: dmg, breakdown: finalDamage.breakdown };
}

export interface HealResult {
  healed: number;
  overheal: number;
}

export function healUnit(target: UnitToken | null | undefined, amount: number): HealResult {
  if (!target || !Number.isFinite(target.hpMax)) {
    return { healed: 0, overheal: 0 };
  }

  let efficiency = 1;
  const statuses = Array.isArray(target?.statuses) ? target.statuses : [];
  for (const status of statuses) {
    if (!status) continue;
    if (status.id === 'heal_efficiency_down') {
      const ratio = Number((status as Record<string, unknown>).amount ?? (status as Record<string, unknown>).power ?? 0);
      if (Number.isFinite(ratio) && ratio > 0) {
        efficiency = Math.max(0, efficiency - ratio);
      }
    }
  }
  const amt = Math.max(0, Math.floor((amount ?? 0) * efficiency));
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
  const isChapMinh = unit.id === 'huyen_vu_chap_minh';
  const basicDamageType = isChapMinh ? 'mixed' : 'physical';
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

  if (!isChapMinh) {
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
    dtype: basicDamageType,
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
  if (unit.mutated === true && resolved.alive) {
    const pool = Array.isArray(unit.mutationDebuffPool)
      ? unit.mutationDebuffPool.filter((id: unknown): id is 'bleed' | 'stun' | 'poison' => id === 'bleed' || id === 'stun' || id === 'poison')
      : ['bleed', 'stun', 'poison'];
    const debuffPool = pool.length > 0 ? pool : ['bleed', 'stun', 'poison'];
    const roll = nextRngValue(Game.rng);
    const idx = Math.floor(roll * debuffPool.length) % debuffPool.length;
    const debuffId = debuffPool[idx] ?? 'bleed';
    const status = Statuses.make[debuffId]?.({ turns: debuffId === 'stun' ? 1 : 2 });
    if (status) {
      Statuses.add(resolved, {
        ...status,
        sourceUnitId: unit.id,
      });
    }
  }
  const turnStamp = `${Game.turn?.cycle ?? 0}:${unit.iid ?? 0}`;
  applyUyenBasicExtras(unit, resolved, {
    wasKill: !resolved.alive,
    turnStamp,
  });

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