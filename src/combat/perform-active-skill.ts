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
import { readAtkWilPower, toFiniteNumber, toFloorInt, toPositiveTurns, toRoundedInt } from './number-utils.ts';
import { partitionTokensBySide } from './token-side-utils.ts';
import { buildSkillResult } from './skill-result.ts';

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
const MENG_YEM_ID = 'mong_yem';
const MENG_YEM_DREAM_MARK_PAYLOAD = Object.freeze({
  markId: 'me_hoac',
  markStacks: 1,
  markMaxStacks: 3,
  markPurgeable: false,
  sleepTurnsOnCap: 1,
});
const BLOOD_AVATAR_ID = 'blood_avatar';
const BLOOD_AVATAR_SKILL_COST = 25;

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

function applyHpCost(caster: UnitToken, payload: Record<string, unknown>): boolean {
  const hpMax = Math.max(1, toFloorInt(caster.hpMax, 1));
  const currentHp = Math.max(0, toFloorInt(caster.hp, hpMax));
  const ratio = Math.max(0, toFiniteNumber(payload.hpCostRatio ?? payload.hpCostPercent, 0));
  const flat = Math.max(0, toFloorInt(payload.hpCostFlat ?? payload.hpCost, 0));
  const minRemainRatio = Math.max(0, toFiniteNumber(payload.minRemainingHpRatio ?? payload.minHpRatio, 0));

  const hpCost = Math.max(flat, Math.floor(hpMax * ratio));
  if (hpCost <= 0) return true;

  const minRemain = Math.max(1, Math.floor(hpMax * minRemainRatio));
  const nextHp = currentHp - hpCost;
  if (nextHp < minRemain) return false;
  caster.hp = Math.max(1, nextHp);
  return true;
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
    if (EFFECT_APPLICATION_TAGS.has(tag)) effectTags.push(tag);
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

  const tags = normalizeTagList(skill.tags ?? []);
  const {
    effectTags,
    hasAetherCostTag,
    hasSummonTag,
    hasUniqueGlobalTag,
    hasDamageTag,
  } = parseSkillTags(tags);
  const payload = resolveSkillPayload(skill);
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
  if (!applyHpCost(caster, payload)) {
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
  if (runtimeSkillResult) return runtimeSkillResult;
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
        Statuses.add(target, { id: 'bleed', kind: 'debuff', tag: 'bleed', dur: 2, tick: 'turn', sourceUnitId: caster.id });
        Statuses.add(target, { id: 'huyet_an', kind: 'mark', tag: 'mark', stacks: 1, maxStacks: 5, purgeable: false, sourceUnitId: caster.id });
      }
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
      return buildSkillResult(true, skillKey, skill, tags, dispatch.applied, enemies.length);
    }
    if (skillKey === 'skill3') {
      if (!consumeBloodAether()) {
        return buildSkillResult(false, skillKey, skill, tags, dispatch.applied, 0, 'insufficient-aether');
      }
      const hpCost = Math.max(1, Math.floor((caster.hpMax ?? 0) * 0.1));
      caster.hp = Math.max(1, toFloorInt((caster.hp ?? 0) - hpCost, 1));
      globalAetherPool.gain(caster.side, 15);
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

  if (caster.id === MENG_YEM_ID && damagedEnemies.length > 0) {
    for (const target of damagedEnemies) {
      applyMarkSleepSetupTag(game, caster, target, MENG_YEM_DREAM_MARK_PAYLOAD);
    }
  }

  return buildSkillResult(true, skillKey, skill, tags, dispatch.applied, dispatch.targets.length);
}

export type { ActiveSkillKey };
