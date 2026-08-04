import { dealAbilityDamage, pickTarget } from '../combat.ts';
import { skillSets } from '../data/skills.ts';
import { requireExecutableCharacterDefinition } from './executable-character-definition.ts';
import { enqueueImmediate } from '../summon.ts';
import { cellReserved, slotToCell } from '../engine.ts';
import { globalAetherPool } from '../aether.ts';
import { Statuses } from '../statuses.ts';
import { runRuntimeActiveSkill } from './unit-runtime-hooks.ts';
import { activateChapMinhLink, refreshChapMinhOwnership } from './chap-minh-runtime.ts';
import { createSkillMetadataContext, resolveSkillPayload } from './skill-metadata-utils.ts';
import { readAtkWilPower, readUnitHpState, toFiniteNumber, toFloorInt, toPositiveTurns, toRoundedInt } from './number-utils.ts';
import { partitionTokensBySide } from './token-side-utils.ts';
import { buildSkillResult } from './skill-result.ts';
import { applyMarkSleepEffect } from './mark-sleep-effect.ts';
import { consumeShieldByCurrentRatio, readShieldAmount } from './apply-damage.ts';
import { createNaturalAction, currentActionExecution, executeActionTransaction, resolveHealing, resolveHpLoss, resolveSourceAttribution } from './kernel/public.ts';
import { commitHealing, commitHpMutation } from './kernel/hp-mutation.ts';

import type { SessionState } from '@shared-types/combat';
import type { SkillSection } from '@shared-types/config';
import type { UnitToken } from '@shared-types/units';

type ActiveSkillKey = 'skill1' | 'skill2' | 'skill3';
const EMPTY_TAGS: string[] = [];
const MONG_YEM_ID = 'mong_yem';
const MONG_YEM_DREAM_MARK_PAYLOAD = Object.freeze({
  markId: 'me_hoac',
  markStacks: 1,
  markMaxStacks: 3,
  markPurgeable: false,
  sleepTurnsOnCap: 1,
});
const BLOOD_AVATAR_ID = 'blood_avatar';
const CHAP_MINH_ID = 'huyen_vu_chap_minh';
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

type SkillUsageStore = Record<string, number>;
type RuntimeSkillUsageStore = Record<string, SkillUsageStore>;

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
  game: SessionState,
  caster: UnitToken,
  hpMax: number,
  currentHp: number,
  readMetaNumber: (fallback: number, ...keys: string[]) => number,
): boolean {
  const ratio = Math.max(0, readMetaNumber(0, 'hpCostRatio', 'hpCostPercent'));
  const flat = Math.max(0, toFloorInt(readMetaNumber(0, 'hpCostFlat', 'hpCost'), 0));
  const minRemainRatio = Math.max(0, readMetaNumber(0, 'minRemainingHpRatio', 'minHpRatio'));

  const hpCost = Math.max(flat, Math.floor(hpMax * ratio));
  if (hpCost <= 0) return true;

  const minRemain = Math.max(1, Math.floor(hpMax * minRemainRatio));
  const nextHp = currentHp - hpCost;
  if (nextHp < minRemain) return false;
  const source = resolveSourceAttribution({ immediateSource: caster, controller: caster, trueSelf: caster.trueSelfId ?? null, owner: caster });
  const mutation = resolveHpLoss(caster, hpCost, 'hp-cost', source, false);
  if (!mutation.succeeded) return false;
  commitHpMutation(game, caster, mutation, currentActionExecution(game)?.identity);
  return true;
}

function checkHpConditionWithState(
  hpMax: number,
  currentHp: number,
  readMetaNumber: (fallback: number, ...keys: string[]) => number,
): boolean {
  const requiredRatio = Math.max(0, readMetaNumber(
    0,
    'minCurrentHpRatio',
    'requireCurrentHpRatioMin',
    'requiredHpRatio',
    'conditionMinHpRatio',
  ));
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
    toRoundedInt(toFiniteNumber(payload.maxUsesPerBattle ?? payload.maxUses ?? payload.battleUseCap, 0), 0),
  );
}

function resolveCasterSkillUsageStore(game: SessionState, caster: UnitToken): SkillUsageStore {
  const runtimeRoot = (game.runtime ??= {});
  const usageStore = ((runtimeRoot._skillUsageByCaster as RuntimeSkillUsageStore | undefined) ??= {});
  const casterKey = String(caster.iid ?? caster.id);
  return (usageStore[casterKey] ??= {});
}

function hasSkillUseQuota(game: SessionState, caster: UnitToken, skillKey: ActiveSkillKey, maxUses: number): boolean {
  if (maxUses <= 0) return true;
  const casterUsage = resolveCasterSkillUsageStore(game, caster);
  const currentUses = Math.max(0, toRoundedInt(casterUsage[skillKey] ?? 0, 0));
  return currentUses < maxUses;
}

function recordSkillUseQuota(game: SessionState, caster: UnitToken, skillKey: ActiveSkillKey, maxUses: number): void {
  if (maxUses <= 0) return;
  const casterUsage = resolveCasterSkillUsageStore(game, caster);
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

function executeActiveSkill(game: SessionState, caster: UnitToken, skillKey: ActiveSkillKey): PerformActiveSkillResult {
  if (!caster.alive) {
    return buildSkillResult(false, skillKey, null, EMPTY_TAGS, EMPTY_TAGS, 0, 'blocked');
  }

  const skill = resolveActiveSkill(caster, skillKey);
  if (!skill) {
    return buildSkillResult(false, skillKey, null, EMPTY_TAGS, EMPTY_TAGS, 0, 'missing-skill');
  }

  const definition = requireExecutableCharacterDefinition(caster.id).skills.find(action => action.actionId.endsWith(`:${skillKey}`));
  if (!definition) return buildSkillResult(false, skillKey, skill, EMPTY_TAGS, EMPTY_TAGS, 0, 'missing-skill');
  const tags = [...definition.metadataTags];
  const effectTags = definition.effects.map(effect => effect.type);
  const hasSummonTag = definition.effects.some(effect => effect.type === 'summon');
  const hasUniqueGlobalTag = definition.conditions.some(condition => condition.type === 'unique-summon');
  const hasDamageTag = definition.effects.some(effect => effect.type === 'deal-damage');
  const skillMeta = createSkillMetadataContext(skill);
  const payload = resolveSkillPayload(skill);
  const dispatchPayload = { ...(payload ?? {}), skillKey };
  const maxSkillUses = readSkillUseCap(payload);
  const runtimeSkillResult = runRuntimeActiveSkill({ game, caster, skillKey, skill, tags, appliedTags: [] });
  if (runtimeSkillResult) return runtimeSkillResult;
  if (!hasSkillUseQuota(game, caster, skillKey, maxSkillUses)) {
    return buildSkillResult(false, skillKey, skill, tags, EMPTY_TAGS, 0, 'blocked');
  }
  const skillCost = Math.max(0, toRoundedInt(skill.cost?.aether, 0));
  const usesTagAetherCost = skillCost > 0;
  if (usesTagAetherCost && globalAetherPool.current(caster.side) < skillCost) {
      return buildSkillResult(false, skillKey, skill, tags, EMPTY_TAGS, 0, 'insufficient-aether');
  }

  let consumedAether = skillCost <= 0;

  const primaryTarget = pickTarget(game, caster);
  const targets = primaryTarget ? [primaryTarget] : (caster.alive ? [caster] : []);
  const appliedTags: string[] = [];
  if (usesTagAetherCost) consumedAether = globalAetherPool.consume(caster.side, skillCost);

  if (usesTagAetherCost && !consumedAether) {
    return buildSkillResult(false, skillKey, skill, tags, appliedTags, targets.length, 'insufficient-aether');
  }
  const { hpMax: casterHpMax, hp: casterCurrentHp } = readUnitHpState(caster);
  if (!checkHpConditionWithState(casterHpMax, casterCurrentHp, skillMeta.readNumber)) {
    return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
  }
  if (!checkTurnParityCondition(game, payload)) {
    return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
  }
  if (!applyHpCostWithState(game, caster, casterHpMax, casterCurrentHp, skillMeta.readNumber)) {
    return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
  }

  const casterPower = readAtkWilPower(caster);

  if (caster.id === CHAP_MINH_ID) {
    if (skillKey === 'skill1') {
      activateChapMinhLink(caster);
      refreshChapMinhOwnership(game);
      recordSkillUseQuota(game, caster, skillKey, maxSkillUses);
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, 0);
    }
    if (skillKey === 'skill2') {
      consumeShieldByCurrentRatio(caster, 0.1);
      const target = pickTarget(game, caster);
      if (!target?.alive) {
        return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
      }
      const base = Math.max(1, Math.floor(casterPower));
      for (let hit = 0; hit < 3; hit += 1) {
        dealAbilityDamage(game, caster, target, { base, dtype: 'mixed', attackType: 'skill', skill });
      }
      recordSkillUseQuota(game, caster, skillKey, maxSkillUses);
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, 1);
    }
    if (skillKey === 'skill3') {
      const heal = Math.max(1, Math.floor((caster.hpMax ?? 0) * 0.35));
      const source = resolveSourceAttribution({ immediateSource: caster, controller: caster, trueSelf: caster.trueSelfId ?? null, owner: caster });
      commitHealing(game, caster, resolveHealing(caster, heal, source), currentActionExecution(game)?.identity);
      Statuses.add(caster, {
        id: 'chap_minh_ult_arm_up',
        kind: 'buff',
        tag: 'arm-up',
        amount: 0.5,
        dur: 2,
        tick: 'turn',
        sourceUnitId: caster.id,
      });
      Statuses.add(caster, {
        id: 'chap_minh_ult_res_up',
        kind: 'buff',
        tag: 'res-up',
        amount: 0.5,
        dur: 2,
        tick: 'turn',
        sourceUnitId: caster.id,
      });
      const shieldBonusDamage = Math.max(0, Math.floor(readShieldAmount(caster) * 0.5));
      const base = Math.max(1, Math.floor(casterPower + shieldBonusDamage));
      let hits = 0;
      for (const token of game.tokens) {
        if (!token.alive || token.side === caster.side) continue;
        dealAbilityDamage(game, caster, token, { base, dtype: 'mixed', attackType: 'skill', skill, isAoE: true });
        hits += 1;
      }
      recordSkillUseQuota(game, caster, skillKey, maxSkillUses);
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, hits);
    }
  }

  if (caster.id === BLOOD_AVATAR_ID) {
    const enemies = partitionTokensBySide(game.tokens, caster.side).enemyTokens;
    const consumeBloodAether = (): boolean => (
      usesTagAetherCost || consumeSideAether(caster.side, BLOOD_AVATAR_SKILL_COST)
    );
    if (skillKey === 'skill1') {
      if (!consumeBloodAether()) {
        return buildSkillResult(false, skillKey, skill, tags, appliedTags, enemies.length, 'insufficient-aether');
      }
      const base = Math.max(1, toRoundedInt(casterPower * 1.4, 1));
      const picked = enemies.slice(0, 6);
      for (const target of picked) {
        dealAbilityDamage(game, caster, target, { base, attackType: 'skill', skill, isAoE: true, targetsHit: picked.length });
        Statuses.add(target, { ...BLOOD_AVATAR_BLEED_STATUS, sourceUnitId: caster.id });
        Statuses.add(target, { ...BLOOD_AVATAR_MARK_STATUS, sourceUnitId: caster.id });
      }
      recordSkillUseQuota(game, caster, skillKey, maxSkillUses);
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, picked.length);
    }
    if (skillKey === 'skill2') {
      const casterState = caster as BloodAvatarState;
      if (casterState._bloodFieldUsed) {
        return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
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
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, enemies.length);
    }
    if (skillKey === 'skill3') {
      if (!consumeBloodAether()) {
        return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'insufficient-aether');
      }
      const hpCost = Math.max(1, Math.floor((caster.hpMax ?? 0) * 0.1));
      const source = resolveSourceAttribution({ immediateSource: caster, controller: caster, trueSelf: caster.trueSelfId ?? null, owner: caster });
      const mutation = resolveHpLoss(caster, hpCost, 'hp-cost', source, false);
      if (!mutation.succeeded) return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
      commitHpMutation(game, caster, mutation, currentActionExecution(game)?.identity);
      globalAetherPool.gain(caster.side, 15);
      recordSkillUseQuota(game, caster, skillKey, maxSkillUses);
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, 0);
    }
  }

  if (hasSummonTag) {
    const openSlot = firstOpenSlot(game, caster.side);
    if (openSlot) {
      const summon = (payload.summon ?? skill.summon ?? {}) as Record<string, unknown>;
      const summonId = typeof summon.id === 'string' ? summon.id : `${caster.id}_minion`;
      if (hasUniqueGlobalTag && !canApplyUniqueGlobal(game, summonId)) {
        return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
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
    appliedTags.push(...effectTags);
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
      applyMarkSleepEffect(caster, target, { markId: MONG_YEM_DREAM_MARK_PAYLOAD.markId, stacks: MONG_YEM_DREAM_MARK_PAYLOAD.markStacks, maxStacks: MONG_YEM_DREAM_MARK_PAYLOAD.markMaxStacks, purgeable: MONG_YEM_DREAM_MARK_PAYLOAD.markPurgeable, sleepTurnsOnCap: MONG_YEM_DREAM_MARK_PAYLOAD.sleepTurnsOnCap });
    }
  }

  recordSkillUseQuota(game, caster, skillKey, maxSkillUses);
  return buildSkillResult(true, skillKey, skill, tags, appliedTags, targets.length);
}

export function performActiveSkill(game: SessionState, caster: UnitToken, skillKey: ActiveSkillKey): PerformActiveSkillResult {
  if (currentActionExecution(game)) return executeActiveSkill(game, caster, skillKey);
  const identity = createNaturalAction(game, skillKey === 'skill3' ? 'ultimate' : 'active-skill');
  const target = pickTarget(game, caster) ?? caster;
  const transaction = executeActionTransaction({ game, identity, actor: caster, targets: [target], resolvePayload: () => executeActiveSkill(game, caster, skillKey) });
  return transaction.payload ?? buildSkillResult(false, skillKey, null, EMPTY_TAGS, EMPTY_TAGS, 0, transaction.reason === 'invalid-target' ? 'blocked' : 'blocked');
}

export type { ActiveSkillKey };
