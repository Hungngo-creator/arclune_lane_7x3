import { dealAbilityDamage, pickTarget } from '../combat.ts';
import {
  activateChapMinhLink,
  applyChapMinhActionEnd,
  applyChapMinhPhaseShift,
  recoverChapMinhMaxHpPerTurn,
  refreshChapMinhOwnership,
} from './chap-minh-runtime.ts';
import { consumeShieldByCurrentRatio, readShieldAmount } from './apply-damage.ts';
import { Statuses } from '../statuses.ts';
import { buildSkillResult } from './skill-result.ts';
import { applyMarkSleepSetupTag } from './tag-dispatch.ts';
import { toFiniteNumber, toPositiveTurns, toRoundedInt } from './number-utils.ts';
import { getStatusEntryById } from './status-utils.ts';

import type { SessionState } from '@shared-types/combat';
import type { SkillSection } from '@shared-types/config';
import type { UnitToken } from '@shared-types/units';
import type { ActiveSkillKey, PerformActiveSkillResult } from './perform-active-skill.ts';

interface RuntimeSkillContext {
  game: SessionState;
  caster: UnitToken;
  skillKey: ActiveSkillKey;
  skill: SkillSection;
  tags: string[];
  appliedTags: string[];
}

interface RuntimeTurnContext {
  game: SessionState;
  unit: UnitToken | null | undefined;
}

interface RuntimeOnDamageContext {
  target: UnitToken | null | undefined;
}

interface UnitRuntimeHook {
  onActiveSkill?: (ctx: RuntimeSkillContext) => PerformActiveSkillResult | null;
  onTurnStart?: (ctx: RuntimeTurnContext) => void;
  onActionEnd?: (ctx: RuntimeTurnContext) => void;
  onTurnEnd?: (ctx: RuntimeTurnContext) => void;
  onDamageResolved?: (ctx: RuntimeOnDamageContext) => void;
}

const CHAP_MINH_ID = 'huyen_vu_chap_minh';
const MONG_YEM_ID = 'mong_yem';
const CHAP_MINH_ULT_ARM_RES_BUFF = 0.5;
const CHAP_MINH_ULT_HEAL_RATIO = 0.35;
const CHAP_MINH_ULT_SHIELD_DAMAGE_RATIO = 0.5;
const MONG_YEM_SELF_SLEEP_FLAG = 'mong_yem_self_sleep';
const MONG_YEM_SELF_SLEEP_GROWTH_RATIO = 0.07;
const MONG_YEM_SELF_SLEEP_WAKE_HP_RATIO = 0.35;
const MONG_YEM_MARK_ID = 'me_hoac';

type MongYemStateCarrier = UnitToken & {
  _mongYemSelfSleepActive?: boolean;
};

const chapMinhRuntimeHook: UnitRuntimeHook = {
  onActiveSkill({ game, caster, skillKey, skill, tags, appliedTags }) {
    if (skillKey === 'skill1') {
      activateChapMinhLink(caster);
      refreshChapMinhOwnership(game);
      return {
        ok: true,
        skillKey,
        skill,
        tags,
        appliedTags,
        targetCount: 0,
      };
    }

    if (skillKey === 'skill3') {
      const heal = Math.max(1, Math.floor((caster.hpMax ?? 0) * CHAP_MINH_ULT_HEAL_RATIO));
      caster.hp = Math.max(0, Math.min(caster.hpMax ?? 0, (caster.hp ?? 0) + heal));

      Statuses.add(caster, {
        id: 'chap_minh_ult_arm_up',
        kind: 'buff',
        tag: 'arm-up',
        amount: CHAP_MINH_ULT_ARM_RES_BUFF,
        dur: 2,
        tick: 'turn',
        sourceUnitId: caster.id,
      });
      Statuses.add(caster, {
        id: 'chap_minh_ult_res_up',
        kind: 'buff',
        tag: 'res-up',
        amount: CHAP_MINH_ULT_ARM_RES_BUFF,
        dur: 2,
        tick: 'turn',
        sourceUnitId: caster.id,
      });

      const shieldBonusDamage = Math.max(0, Math.floor(readShieldAmount(caster) * CHAP_MINH_ULT_SHIELD_DAMAGE_RATIO));
      const base = Math.max(1, Math.floor((caster.atk ?? 0) + (caster.wil ?? 0) + shieldBonusDamage));
      let hits = 0;
      for (const token of game.tokens) {
        if (!token.alive || token.side === caster.side) continue;
        dealAbilityDamage(game, caster, token, { base, dtype: 'mixed', attackType: 'skill', skill, isAoE: true });
        hits += 1;
      }

      return buildSkillResult(true, skillKey, skill, tags, appliedTags, hits);
    }

    if (skillKey !== 'skill2') return null;

    consumeShieldByCurrentRatio(caster, 0.1);

    const target = pickTarget(game, caster);
    if (!target?.alive) {
      return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
    }

    const base = Math.max(1, Math.floor((caster.atk ?? 0) + (caster.wil ?? 0)));
    for (let hit = 0; hit < 3; hit += 1) {
      dealAbilityDamage(game, caster, target, { base, dtype: 'mixed', attackType: 'skill', skill });
    }

    return buildSkillResult(true, skillKey, skill, tags, appliedTags, 1);
  },
  onTurnStart({ game, unit }) {
    recoverChapMinhMaxHpPerTurn(unit);
    refreshChapMinhOwnership(game);
  },
  onActionEnd({ game, unit }) {
    applyChapMinhActionEnd(game, unit);
    refreshChapMinhOwnership(game);
  },
  onTurnEnd({ game, unit }) {
    applyChapMinhPhaseShift(unit);
    refreshChapMinhOwnership(game);
  },
  onDamageResolved({ target }) {
    applyChapMinhPhaseShift(target);
  },
};

function resolveSkillMetaNumber(
  skill: SkillSection,
  fallback: number,
  ...keys: string[]
): number {
  for (const key of keys) {
    const direct = toFiniteNumber((skill as Record<string, unknown>)[key], NaN);
    if (Number.isFinite(direct)) return direct;
  }
  return fallback;
}

function clearMongYemSelfSleep(unit: MongYemStateCarrier): void {
  unit._mongYemSelfSleepActive = false;
  if (!Array.isArray(unit.statuses) || unit.statuses.length === 0) return;
  for (let index = unit.statuses.length - 1; index >= 0; index -= 1) {
    const status = unit.statuses[index];
    if (!status) continue;
    if (status.id === 'sleep' || status.id === MONG_YEM_SELF_SLEEP_FLAG) {
      unit.statuses.splice(index, 1);
    }
  }
}

function applyMongYemSelfSleepGrowth(unit: MongYemStateCarrier): void {
  const atk = Math.max(0, toFiniteNumber(unit.atk, 0));
  const wil = Math.max(0, toFiniteNumber(unit.wil, 0));
  unit.atk = Math.max(0, Math.floor(atk * (1 + MONG_YEM_SELF_SLEEP_GROWTH_RATIO)));
  unit.wil = Math.max(0, Math.floor(wil * (1 + MONG_YEM_SELF_SLEEP_GROWTH_RATIO)));
}

function maybeWakeMongYem(unit: MongYemStateCarrier): void {
  const hpMax = Math.max(1, toFiniteNumber(unit.hpMax, 1));
  const hp = Math.max(0, toFiniteNumber(unit.hp, hpMax));
  if (hp > hpMax * MONG_YEM_SELF_SLEEP_WAKE_HP_RATIO) return;
  clearMongYemSelfSleep(unit);
}

function readStatusStacks(unit: UnitToken, statusId: string): number {
  const statusEntry = getStatusEntryById(unit, statusId);
  return Math.max(0, toRoundedInt(statusEntry?.status.stacks ?? 0, 0));
}

const mongYemRuntimeHook: UnitRuntimeHook = {
  onActiveSkill({ game, caster, skillKey, skill, tags, appliedTags }) {
    if (skillKey === 'skill1') {
      const duration = toPositiveTurns(resolveSkillMetaNumber(skill, 3, 'duration', 'turns'));
      Statuses.add(caster, {
        id: 'mong_yem_evade_basic',
        kind: 'buff',
        tag: 'self-buff',
        amount: 0.5,
        dur: duration,
        tick: 'turn',
        sourceUnitId: caster.id,
      });
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, 0);
    }

    if (skillKey === 'skill2') {
      const duration = toPositiveTurns(resolveSkillMetaNumber(skill, 99, 'duration', 'turns'));
      Statuses.add(caster, {
        id: 'sleep',
        kind: 'debuff',
        tag: 'sleep',
        dur: duration,
        tick: 'turn',
        sourceUnitId: caster.id,
      });
      Statuses.add(caster, {
        id: MONG_YEM_SELF_SLEEP_FLAG,
        kind: 'buff',
        tag: 'defense',
        amount: 0.5,
        dur: duration,
        tick: 'turn',
        sourceUnitId: caster.id,
      });
      (caster as MongYemStateCarrier)._mongYemSelfSleepActive = true;
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, 0);
    }

    if (skillKey !== 'skill3') return null;

    const target = pickTarget(game, caster);
    if (!target?.alive) {
      return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
    }

    const baseMultiplier = Math.max(0, toFiniteNumber(skill.damageMultiplier, 1.8));
    const bonusConfig = (skill as Record<string, unknown>).bonusPerMark as Record<string, unknown> | undefined;
    const markId = typeof bonusConfig?.id === 'string' ? bonusConfig.id : MONG_YEM_MARK_ID;
    const markBonusAmount = Math.max(0, toFiniteNumber(bonusConfig?.amount, 0));
    const markBonusMax = Math.max(0, toFiniteNumber(bonusConfig?.max, 0));
    const markStacks = readStatusStacks(target, markId);
    const markBonus = Math.min(markBonusMax, markStacks * markBonusAmount);
    const finalMultiplier = baseMultiplier * (1 + markBonus);
    const base = Math.max(1, Math.floor(((caster.atk ?? 0) + (caster.wil ?? 0)) * finalMultiplier));

    const pierceConfig = (skill as Record<string, unknown>).pierceIfSleeping as Record<string, unknown> | undefined;
    const sleeping = getStatusEntryById(target, 'sleep') != null;
    const defPen = sleeping
      ? Math.max(0, toFiniteNumber(pierceConfig?.ARM ?? 0, 0), toFiniteNumber(pierceConfig?.RES ?? 0, 0))
      : 0;

    dealAbilityDamage(game, caster, target, { base, dtype: 'mixed', attackType: 'skill', skill, defPen });

    applyMarkSleepSetupTag(game, caster, target, {
      markId,
      markStacks: 1,
      markMaxStacks: 3,
      markPurgeable: false,
      sleepTurnsOnCap: 1,
    });

    let spreadHits = 0;
    const spreadConfig = (skill as Record<string, unknown>).spreadMark as Record<string, unknown> | undefined;
    const spreadTargets = Math.max(0, toRoundedInt(spreadConfig?.targets, 0));
    if (sleeping && spreadTargets > 0) {
      const spreadMarkId = typeof spreadConfig?.id === 'string' ? spreadConfig.id : markId;
      const spreadStacks = Math.max(1, toRoundedInt(spreadConfig?.stacks, 1));
      for (const token of game.tokens) {
        if (spreadHits >= spreadTargets) break;
        if (!token.alive || token.side === caster.side || token.iid === target.iid) continue;
        spreadHits += 1;
        applyMarkSleepSetupTag(game, caster, token, {
          markId: spreadMarkId,
          markStacks: spreadStacks,
          markMaxStacks: 3,
          markPurgeable: false,
          sleepTurnsOnCap: 1,
        });
      }
    }

    return buildSkillResult(true, skillKey, skill, tags, appliedTags, 1 + spreadHits);
  },
  onTurnStart({ unit }) {
    const mongYem = unit as MongYemStateCarrier | null | undefined;
    if (!mongYem?.alive || !mongYem._mongYemSelfSleepActive) return;
    applyMongYemSelfSleepGrowth(mongYem);
    maybeWakeMongYem(mongYem);
  },
  onDamageResolved({ target }) {
    const mongYem = target as MongYemStateCarrier | null | undefined;
    if (!mongYem?.alive || !mongYem._mongYemSelfSleepActive) return;
    maybeWakeMongYem(mongYem);
  },
};

const UNIT_RUNTIME_HOOKS: Readonly<Record<string, UnitRuntimeHook>> = Object.freeze({
  [CHAP_MINH_ID]: chapMinhRuntimeHook,
  [MONG_YEM_ID]: mongYemRuntimeHook,
});

export function getUnitRuntimeHook(unitId: string | null | undefined): UnitRuntimeHook | null {
  if (!unitId) return null;
  return UNIT_RUNTIME_HOOKS[unitId] ?? null;
}

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

export function runRuntimeActiveSkill(ctx: RuntimeSkillContext): PerformActiveSkillResult | null {
  return getUnitRuntimeHook(ctx.caster.id)?.onActiveSkill?.(ctx) ?? null;
}
