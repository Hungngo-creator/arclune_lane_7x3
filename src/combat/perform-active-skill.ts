import { dealAbilityDamage, pickTarget } from '../combat.ts';
import { applyMarkSleepSetupTag, dispatchGameplayTags } from './tag-dispatch.ts';
import { skillSets } from '../data/skills.ts';
import { normalizeTagList } from '../data/tags.ts';
import { enqueueImmediate } from '../summon.ts';
import { cellReserved, slotToCell } from '../engine.ts';
import { globalAetherPool } from '../aether.ts';
import { Statuses } from '../statuses.ts';
import { runRuntimeActiveSkill } from './unit-runtime-hooks.ts';
import { resolveSkillPayload } from './skill-metadata-utils.ts';
import { readAtkWilPower, readUnitHpState, toFiniteNumber, toFloorInt, toPositiveTurns, toRoundedInt } from './number-utils.ts';
import { partitionTokensBySide } from './token-side-utils.ts';
import { buildSkillResult } from './skill-result.ts';
import { canonicalizeCombatTags } from './tag-aliases.ts';

import type { SessionState } from '@shared-types/combat';
import type { SkillSection } from '@shared-types/config';
import type { UnitToken } from '@shared-types/units';

type ActiveSkillKey = 'skill1' | 'skill2' | 'skill3';
const EMPTY_TAGS: string[] = [];
const EFFECT_APPLICATION_TAGS = new Set([
  'heal',
  'team-heal',
  'shield',
  'silence',
  'sleep',
  'mark',
  'control',
  'taunt',
  'non-heal-hp-change',
]);
const DAMAGE_TARGET_TAG = 'non-heal-hp-change';
const MONG_YEM_ID = 'mong_yem';
const MONG_YEM_DREAM_MARK_PAYLOAD = Object.freeze({
  markId: 'me_hoac',
  markStacks: 1,
  markMaxStacks: 3,
  markPurgeable: false,
  sleepTurnsOnCap: 1,
});
const BLOOD_AVATAR_ID = 'blood_avatar';
const BLOOD_AVATAR_SKILL_COST = 25;
const BLOOD_AVATAR_BLEED_STATUS = Object.freeze({
  id: 'bleed',
  kind: 'debuff',
  tag: 'bleed',
  dur: 2,
  tick: 'turn',
} as const);
const BLOOD_AVATAR_MARK_STATUS = Object.freeze({
  id: 'huyet_an',
  kind: 'mark',
  tag: 'mark',
  stacks: 1,
  maxStacks: 5,
  purgeable: false,
} as const);

type BloodAvatarState = UnitToken & { _bloodFieldUsed?: boolean };

export interface PerformActiveSkillResult {
  ok: boolean;
  skillKey: ActiveSkillKey;
  skill: SkillSection | null;
  tags: string[];
  appliedTags: string[];
  targetCount: number;
  reason?: 'missing-skill' | 'insufficient-aether' | 'blocked';
}

interface ParsedSkillTags {
  effectTags: string[];
  hasAetherCostTag: boolean;
  hasSummonTag: boolean;
  hasUniqueGlobalTag: boolean;
  hasDamageTag: boolean;
}
type SkillUsageStore = Record<string, number>;

function readPayloadNumber(payload: Record<string, unknown>, fallback: number, ...keys: string[]): number {
  for (const key of keys) {
    const parsed = toFiniteNumber(payload[key], NaN);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function resolveActiveSkill(caster: UnitToken, skillKey: ActiveSkillKey): SkillSection | null {
  const set = skillSets[caster.id as keyof typeof skillSets];
  if (!set) return null;
  const idx = Number(skillKey.replace('skill', '')) - 1;
  if (!Number.isFinite(idx) || idx < 0) return null;
  return set.skills[idx] ?? (idx === 0 ? set.skill : null) ?? null;
}

function canApplyUniqueGlobal(game: SessionState, summonId: string): boolean {
  return !game.tokens.some((token) => token.alive && token.id === summonId);
}

function applyHpCostWithState(
  caster: UnitToken,
  hpMax: number,
  currentHp: number,
  payload: Record<string, unknown>,
): boolean {
  const ratio = Math.max(0, readPayloadNumber(payload, 0, 'hpCostRatio', 'hpCostPercent'));
  const flat = Math.max(0, toFloorInt(readPayloadNumber(payload, 0, 'hpCostFlat', 'hpCost'), 0));
  const minRemainRatio = Math.max(0, readPayloadNumber(payload, 0, 'minRemainingHpRatio', 'minHpRatio'));

  const hpCost = Math.max(flat, Math.floor(hpMax * ratio));
  if (hpCost <= 0) return true;

  const minRemain = Math.max(1, Math.floor(hpMax * minRemainRatio));
  const nextHp = currentHp - hpCost;
  if (nextHp < minRemain) return false;
  caster.hp = Math.max(1, nextHp);
  return true;
}

function checkHpConditionWithState(
  hpMax: number,
  currentHp: number,
  payload: Record<string, unknown>,
): boolean {
  const requiredRatio = Math.max(
    0,
    readPayloadNumber(
      payload,
      0,
      'minCurrentHpRatio',
      'requireCurrentHpRatioMin',
      'requiredHpRatio',
      'conditionMinHpRatio',
    ),
  );
  if (requiredRatio <= 0) return true;
  return currentHp / hpMax >= requiredRatio;
}

function checkTurnParityCondition(game: SessionState, payload: Record<string, unknown>): boolean {
  const turn = game.turn;
  const turnCount = turn && typeof turn === 'object' && Number.isFinite((turn as { turnCount?: unknown }).turnCount)
    ? toFloorInt((turn as { turnCount?: unknown }).turnCount, 0)
    : NaN;
  if (!Number.isFinite(turnCount) || turnCount <= 0) return true;
  const mode = String(payload.turnParity ?? payload.requireTurnParity ?? payload.conditionTurnParity ?? '').trim().toLowerCase();
  if (!mode) return true;
  if (mode === 'odd' || mode === 'le') return (turnCount % 2) === 1;
  if (mode === 'even' || mode === 'chan') return (turnCount % 2) === 0;
  return true;
}

function readSkillUseCap(payload: Record<string, unknown>): number {
  return Math.max(
    0,
    toRoundedInt(readPayloadNumber(payload, 0, 'maxUsesPerBattle', 'maxUses', 'battleUseCap'), 0),
  );
}

function hasSkillUseQuota(game: SessionState, caster: UnitToken, skillKey: ActiveSkillKey, maxUses: number): boolean {
  if (maxUses <= 0) return true;
  const runtimeRoot = game.runtime;
  const usageStore = runtimeRoot?._skillUsageByCaster as Record<string, SkillUsageStore> | undefined;
  const casterUsage = usageStore?.[String(caster.iid ?? caster.id)];
  const currentUses = Math.max(0, toRoundedInt(casterUsage?.[skillKey] ?? 0, 0));
  return currentUses < maxUses;
}

function recordSkillUseQuota(game: SessionState, caster: UnitToken, skillKey: ActiveSkillKey, maxUses: number): void {
  if (maxUses <= 0) return;

  const runtimeRoot = (game.runtime ??= {});
  const usageStore = ((runtimeRoot._skillUsageByCaster as Record<string, SkillUsageStore> | undefined) ??= {});
  const casterKey = String(caster.iid ?? caster.id);
  const casterUsage = (usageStore[casterKey] ??= {});
  const currentUses = Math.max(0, toRoundedInt(casterUsage[skillKey] ?? 0, 0));
  casterUsage[skillKey] = Math.min(maxUses, currentUses + 1);
}

function firstOpenSlot(game: SessionState, side: UnitToken['side']): number | null {
  const aliveTokens: UnitToken[] = [];
  for (const token of game.tokens) {
    if (token.alive) aliveTokens.push(token);
  }

  for (let slot = 1; slot <= 9; slot += 1) {
    const { cx, cy } = slotToCell(side, slot);
    if (!cellReserved(aliveTokens, game.queued, cx, cy)) return slot;
  }
  return null;
}

function consumeSideAether(side: UnitToken['side'], amount: number): boolean {
  const normalized = Math.max(0, toRoundedInt(amount, 0));
  if (normalized <= 0) return true;
  if (globalAetherPool.current(side) < normalized) return false;
  return globalAetherPool.consume(side, normalized);
}

function resolveDirectDamageMultiplier(skill: SkillSection): number | null {
  const direct = (skill.damage as Record<string, unknown> | undefined)?.multiplier ?? skill.damageMultiplier;
  const parsed = toFiniteNumber(direct, NaN);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function parseSkillTags(tags: ReadonlyArray<string>): ParsedSkillTags {
  const effectTags: string[] = [];
  const seenEffects = new Set<string>();
  let hasAetherCostTag = false;
  let hasSummonTag = false;
  let hasUniqueGlobalTag = false;
  let hasDamageTag = false;
  for (const tag of tags) {
    switch (tag) {
      case 'aether-cost':
        hasAetherCostTag = true;
        break;
      case 'summon':
        hasSummonTag = true;
        break;
      case 'unique-global':
        hasUniqueGlobalTag = true;
        break;
      case DAMAGE_TARGET_TAG:
        hasDamageTag = true;
        break;
      default:
        break;
    }
    if (EFFECT_APPLICATION_TAGS.has(tag) && !seenEffects.has(tag)) {
      seenEffects.add(tag);
      effectTags.push(tag);
    }
  }
  return {
    effectTags,
    hasAetherCostTag,
    hasSummonTag,
    hasUniqueGlobalTag,
    hasDamageTag,
  };
}

export function performActiveSkill(game: SessionState, caster: UnitToken, skillKey: ActiveSkillKey): PerformActiveSkillResult {
  if (!caster.alive) {
    return buildSkillResult(false, skillKey, null, EMPTY_TAGS, EMPTY_TAGS, 0, 'blocked');
  }

  const skill = resolveActiveSkill(caster, skillKey);
  if (!skill) {
    return buildSkillResult(false, skillKey, null, EMPTY_TAGS, EMPTY_TAGS, 0, 'missing-skill');
  }

  const tags = canonicalizeCombatTags(normalizeTagList(skill.tags ?? []));
  const {
    effectTags,
    hasAetherCostTag,
    hasSummonTag,
    hasUniqueGlobalTag,
    hasDamageTag,
  } = parseSkillTags(tags);
  const payload = resolveSkillPayload(skill);
  const maxSkillUses = readSkillUseCap(payload);
  if (!hasSkillUseQuota(game, caster, skillKey, maxSkillUses)) {
  }
  const skillCost = Math.max(0, toRoundedInt(skill.cost?.aether, 0));
  const usesTagAetherCost = skillCost > 0 && hasAetherCostTag;
  if (usesTagAetherCost && globalAetherPool.current(caster.side) < skillCost) {
      return buildSkillResult(false, skillKey, skill, tags, EMPTY_TAGS, 0, 'insufficient-aether');
  }

  let consumedAether = skillCost <= 0;

  const dispatch = dispatchGameplayTags(tags, {
    game,
    attacker: caster,
    target: pickTarget(game, caster),
    side: caster.side,
    cost: skillCost,
    payload,
    deferEffects: true,
    tagsNormalized: true,
    tagsCanonical: true,
    onAetherCost: (amount, side) => {
      if (amount <= 0) {
        consumedAether = true;
        return true;
      }
      const ok = globalAetherPool.consume(side, amount);
      consumedAether = ok;
      return ok;
    },
    onSummon: () => undefined,
  });

  if (usesTagAetherCost && !consumedAether) {
    return buildSkillResult(false, skillKey, skill, tags, dispatch.applied, dispatch.targets.length, 'insufficient-aether');
  }

  const targets = dispatch.targets.length > 0 ? dispatch.targets : (caster.alive ? [caster] : []);
  const { hpMax: casterHpMax, hp: casterCurrentHp } = readUnitHpState(caster);
  if (!checkHpConditionWithState(casterHpMax, casterCurrentHp, payload)) {
    return buildSkillResult(false, skillKey, skill, tags, dispatch.applied, 0, 'blocked');
  }
  if (!checkTurnParityCondition(game, payload)) {
    return buildSkillResult(false, skillKey, skill, tags, dispatch.applied, 0, 'blocked');
  }
  if (!applyHpCostWithState(caster, casterHpMax, casterCurrentHp, payload)) {
    return buildSkillResult(false, skillKey, skill, tags, dispatch.applied, 0, 'blocked');
  }

  const runtimeSkillResult = runRuntimeActiveSkill({
    game,
    caster,
    skillKey,
    skill,
    tags,
    appliedTags: dispatch.applied,
  });
  if (runtimeSkillResult) {
    if (runtimeSkillResult.ok) recordSkillUseQuota(game, caster, skillKey, maxSkillUses);
    return runtimeSkillResult;
  }
  const casterPower = readAtkWilPower(caster);

  if (caster.id === BLOOD_AVATAR_ID) {
    const enemies = partitionTokensBySide(game.tokens, caster.side).enemyTokens;
    const consumeBloodAether = (): boolean => (
      usesTagAetherCost || consumeSideAether(caster.side, BLOOD_AVATAR_SKILL_COST)
    );
    if (skillKey === 'skill1') {
      if (!consumeBloodAether()) {
        return buildSkillResult(false, skillKey, skill, tags, dispatch.applied, enemies.length, 'insufficient-aether');
      }
      const base = Math.max(1, toRoundedInt(casterPower * 1.4, 1));
      const picked = enemies.slice(0, 6);
      for (const target of picked) {
        dealAbilityDamage(game, caster, target, { base, attackType: 'skill', skill, isAoE: true, targetsHit: picked.length });
        Statuses.add(target, { ...BLOOD_AVATAR_BLEED_STATUS, sourceUnitId: caster.id });
        Statuses.add(target, { ...BLOOD_AVATAR_MARK_STATUS, sourceUnitId: caster.id });
      }
      recordSkillUseQuota(game, caster, skillKey, maxSkillUses);
      return buildSkillResult(true, skillKey, skill, tags, dispatch.applied, picked.length);
    }
    if (skillKey === 'skill2') {
      const casterState = caster as BloodAvatarState;
      if (casterState._bloodFieldUsed) {
        return buildSkillResult(false, skillKey, skill, tags, dispatch.applied, 0, 'blocked');
      }
      casterState._bloodFieldUsed = true;
      Statuses.add(caster, { id: 'blood_field_active', kind: 'field', tag: 'field', dur: 2, tick: 'turn', sourceUnitId: caster.id });
      for (const token of game.tokens) {
        if (!token.alive) continue;
        if (token.side === caster.side) {
          Statuses.add(token, { id: 'field_hp_regen_up', kind: 'buff', tag: 'field', dur: 2, tick: 'turn', amount: 0.25, sourceUnitId: caster.id });
        } else {
          Statuses.add(token, { id: 'heal_efficiency_down', kind: 'debuff', tag: 'field', dur: 2, tick: 'turn', amount: 0.25, sourceUnitId: caster.id });
        }
      }
      recordSkillUseQuota(game, caster, skillKey, maxSkillUses);
      return buildSkillResult(true, skillKey, skill, tags, dispatch.applied, enemies.length);
    }
    if (skillKey === 'skill3') {
      if (!consumeBloodAether()) {
        return buildSkillResult(false, skillKey, skill, tags, dispatch.applied, 0, 'insufficient-aether');
      }
      const hpCost = Math.max(1, Math.floor((caster.hpMax ?? 0) * 0.1));
      caster.hp = Math.max(1, toFloorInt((caster.hp ?? 0) - hpCost, 1));
      globalAetherPool.gain(caster.side, 15);
      recordSkillUseQuota(game, caster, skillKey, maxSkillUses);
      return buildSkillResult(true, skillKey, skill, tags, dispatch.applied, 0);
    }
  }

  if (hasSummonTag) {
    const openSlot = firstOpenSlot(game, caster.side);
    if (openSlot) {
      const summon = (payload.summon ?? skill.summon ?? {}) as Record<string, unknown>;
      const summonId = typeof summon.id === 'string' ? summon.id : `${caster.id}_minion`;
      if (hasUniqueGlobalTag && !canApplyUniqueGlobal(game, summonId)) {
        return buildSkillResult(false, skillKey, skill, tags, dispatch.applied, 0, 'blocked');
      }
      enqueueImmediate(game, {
        side: caster.side,
        slot: openSlot,
        unit: {
          id: summonId,
          name: typeof summon.name === 'string' ? summon.name : 'Creep',
          ownerIid: caster.iid,
          isMinion: true,
          ttlTurns: toPositiveTurns(summon.ttlTurns ?? summon.ttl, 3),
        },
      });
    }
  }

  if (effectTags.length > 0) {
    dispatchGameplayTags(effectTags, {
      game,
      attacker: caster,
      target: targets[0] ?? null,
      targets,
      side: caster.side,
      payload,
      deferEffects: false,
      tagsNormalized: true,
      tagsCanonical: true,
      onAetherCost: () => false,
      onSummon: () => undefined,
    });
  }

  const damagedEnemies: UnitToken[] = [];
  const directDamageMultiplier = resolveDirectDamageMultiplier(skill);
  if (hasDamageTag || directDamageMultiplier != null) {
    const multiplier = Math.max(0, directDamageMultiplier ?? 1);
    const base = Math.max(1, toRoundedInt(casterPower * multiplier, 1));
    for (const target of targets) {
      if (target.side === caster.side) continue;
      dealAbilityDamage(game, caster, target, { base, attackType: 'skill', skill });
      damagedEnemies.push(target);
    }
  }

  if (caster.id === MONG_YEM_ID && damagedEnemies.length > 0) {
    for (const target of damagedEnemies) {
      applyMarkSleepSetupTag(game, caster, target, MONG_YEM_DREAM_MARK_PAYLOAD);
    }
  }

  recordSkillUseQuota(game, caster, skillKey, maxSkillUses);
  return buildSkillResult(true, skillKey, skill, tags, dispatch.applied, dispatch.targets.length);
}

export type { ActiveSkillKey };
