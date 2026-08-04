import { dealAbilityDamage, pickTarget } from '../../combat.ts';
import { Statuses } from '../../statuses.ts';
import { buildSkillResult } from '../skill-result.ts';
import { applyMarkSleepEffect } from '../mark-sleep-effect.ts';
import { readAtkWilPower, toFiniteNumber, toPositiveTurns, toRoundedInt } from '../number-utils.ts';
import { createSkillMetadataReader } from '../skill-metadata-utils.ts';
import { getStatusEntryById } from '../status-utils.ts';
import { nextRngValue } from '../../utils/rng.ts';
import { partitionTokensBySide, sampleTokens } from '../token-side-utils.ts';
import { commitRuntimeStats } from '../character-state-gateways.ts';

import type { UnitToken } from '@shared-types/units';
import type { UnitRuntimeHook } from './types.ts';

const MONG_YEM_SELF_SLEEP_FLAG = 'mong_yem_self_sleep';
const MONG_YEM_SELF_SLEEP_GROWTH_RATIO = 0.07;
const MONG_YEM_SELF_SLEEP_WAKE_HP_RATIO = 0.35;
const MONG_YEM_MARK_ID = 'me_hoac';

type MongYemStateCarrier = UnitToken & {
  _mongYemSelfSleepActive?: boolean;
};

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
  commitRuntimeStats(unit, { atk: Math.max(0, Math.floor(atk * (1 + MONG_YEM_SELF_SLEEP_GROWTH_RATIO))), wil: Math.max(0, Math.floor(wil * (1 + MONG_YEM_SELF_SLEEP_GROWTH_RATIO))) });
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

export const mongYemRuntimeHook: UnitRuntimeHook = {
  onActiveSkill({ game, caster, skillKey, skill, tags, appliedTags }) {
    const skillMeta = createSkillMetadataReader(skill);
    if (skillKey === 'skill1') {
      const duration = toPositiveTurns(skillMeta.readNumber(3, 'duration', 'turns'));
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
      const duration = toPositiveTurns(skillMeta.readNumber(99, 'duration', 'turns'));
      const selfSleepDamageReduction = Math.max(
        0,
        skillMeta.readNumber(0.5, 'selfSleepDamageReduction', 'selfDamageReduction', 'damageReduction'),
      );
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
        amount: selfSleepDamageReduction,
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
    const bonusConfig = skillMeta.readRecord('bonusPerMark');
    const markId = typeof bonusConfig?.id === 'string' ? bonusConfig.id : MONG_YEM_MARK_ID;
    const markBonusAmount = Math.max(0, toFiniteNumber(bonusConfig?.amount, 0));
    const markBonusMax = Math.max(0, toFiniteNumber(bonusConfig?.max, 0));
    const markMaxStacks = Math.max(1, toRoundedInt(
      skillMeta.readNumber(3, 'markMaxStacks', 'maxMarkStacks'),
      3
    ));
    const sleepTurnsOnCap = toPositiveTurns(skillMeta.readNumber(1, 'sleepTurnsOnCap', 'sleepTurns'));
    const markStacks = readStatusStacks(target, markId);
    const markBonus = Math.min(markBonusMax, markStacks * markBonusAmount);
    const finalMultiplier = baseMultiplier * (1 + markBonus);
    const base = Math.max(1, Math.floor(readAtkWilPower(caster) * finalMultiplier));

    const pierceConfig = skillMeta.readRecord('pierceIfSleeping');
    const sleeping = getStatusEntryById(target, 'sleep') != null;
    const defPen = sleeping
      ? Math.max(0, toFiniteNumber(pierceConfig?.ARM ?? 0, 0), toFiniteNumber(pierceConfig?.RES ?? 0, 0))
      : 0;

    dealAbilityDamage(game, caster, target, { base, dtype: 'mixed', attackType: 'skill', skill, defPen });

    applyMarkSleepEffect(caster, target, {
      markId, stacks: 1, maxStacks: markMaxStacks, purgeable: false,
      sleepTurnsOnCap,
    });

    let spreadHits = 0;
    const spreadConfig = skillMeta.readRecord('spreadMark');
    const spreadTargets = Math.max(0, toRoundedInt(spreadConfig?.targets, 0));
    if (sleeping && spreadTargets > 0) {
      const spreadMarkId = typeof spreadConfig?.id === 'string' ? spreadConfig.id : markId;
      const spreadStacks = Math.max(1, toRoundedInt(spreadConfig?.stacks, 1));
      const spreadMaxStacks = Math.max(1, toRoundedInt(spreadConfig?.maxStacks, markMaxStacks));
      const spreadSleepTurnsOnCap = toPositiveTurns(toFiniteNumber(spreadConfig?.sleepTurnsOnCap, sleepTurnsOnCap));
      const enemies = partitionTokensBySide(game.tokens, caster.side, { sortByBoardPosition: true }).enemyTokens;
      const spreadCandidates = sampleTokens(enemies, spreadTargets, {
        exclude: (enemy) => enemy.iid === target.iid,
        randomValue: () => nextRngValue(game.rng),
      });
      for (const enemy of spreadCandidates) {
        spreadHits += 1;
        applyMarkSleepEffect(caster, enemy, {
          markId: spreadMarkId, stacks: spreadStacks, maxStacks: spreadMaxStacks, purgeable: false,
          sleepTurnsOnCap: spreadSleepTurnsOnCap,
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
