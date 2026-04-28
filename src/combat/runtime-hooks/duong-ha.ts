import { dealAbilityDamage } from '../../combat.ts';
import { basicAttack } from '../../combat.ts';
import { globalAetherPool } from '../../aether.ts';
import { Statuses } from '../../statuses.ts';
import { setFury } from '../../utils/fury.ts';
import { buildSkillResult } from '../skill-result.ts';
import { readAtkWilPower, toFiniteNumber } from '../number-utils.ts';

import type { UnitToken } from '@shared-types/units';
import type { UnitRuntimeHook } from './types.ts';

const DUONG_HA_ID = 'duong_ha';
const PASSIVE_SCALE_RATIO = 0.03;
const SKILL1_TURN_DRAIN = 5;
const SKILL1_RAGE_DRAIN = 10;
const SKILL1_FOLLOWUP_RATIO = 0.5;
const SKILL2_AE_COST = 3;
const SKILL2_PIERCE_RATIO = 0.2;
const SKILL3_RATIO = 0.3;
const SKILL3_DURATION = 3;

type DuongHaCarrier = UnitToken & {
  _duongHaPassiveStacks?: number;
  _duongHaPassiveAtkBonus?: number;
  _duongHaPassiveWilBonus?: number;
  _duongHaPassiveHpBonus?: number;
  _duongHaSkill2NextActive?: boolean;
  _duongHaSkill2ActiveThisTurn?: boolean;
  _duongHaSkill1ActiveThisTurn?: boolean;
};

function resetDuongHaPassive(unit: DuongHaCarrier): void {
  const atkBonus = Math.max(0, toFiniteNumber(unit._duongHaPassiveAtkBonus, 0));
  const wilBonus = Math.max(0, toFiniteNumber(unit._duongHaPassiveWilBonus, 0));
  const hpBonus = Math.max(0, toFiniteNumber(unit._duongHaPassiveHpBonus, 0));
  if (atkBonus > 0) unit.atk = Math.max(0, Math.floor(toFiniteNumber(unit.atk, 0) - atkBonus));
  if (wilBonus > 0) unit.wil = Math.max(0, Math.floor(toFiniteNumber(unit.wil, 0) - wilBonus));
  if (hpBonus > 0) {
    unit.hpMax = Math.max(1, Math.floor(toFiniteNumber(unit.hpMax, 1) - hpBonus));
    unit.hp = Math.min(Math.max(0, toFiniteNumber(unit.hp, 0)), Math.max(1, toFiniteNumber(unit.hpMax, 1)));
  }
  unit._duongHaPassiveStacks = 0;
  unit._duongHaPassiveAtkBonus = 0;
  unit._duongHaPassiveWilBonus = 0;
  unit._duongHaPassiveHpBonus = 0;
}

function addPassiveStack(unit: DuongHaCarrier): void {
  const atkNow = Math.max(0, toFiniteNumber(unit.atk, 0));
  const wilNow = Math.max(0, toFiniteNumber(unit.wil, 0));
  const hpMaxNow = Math.max(1, toFiniteNumber(unit.hpMax, 1));
  const atkGain = Math.max(1, Math.floor(atkNow * PASSIVE_SCALE_RATIO));
  const wilGain = Math.max(1, Math.floor(wilNow * PASSIVE_SCALE_RATIO));
  const hpGain = Math.max(1, Math.floor(hpMaxNow * PASSIVE_SCALE_RATIO));
  unit.atk = atkNow + atkGain;
  unit.wil = wilNow + wilGain;
  unit.hpMax = hpMaxNow + hpGain;
  unit.hp = Math.min(unit.hpMax, Math.max(0, toFiniteNumber(unit.hp, 0)) + hpGain);
  unit._duongHaPassiveStacks = Math.max(0, Math.floor(toFiniteNumber(unit._duongHaPassiveStacks, 0))) + 1;
  unit._duongHaPassiveAtkBonus = Math.max(0, toFiniteNumber(unit._duongHaPassiveAtkBonus, 0) + atkGain);
  unit._duongHaPassiveWilBonus = Math.max(0, toFiniteNumber(unit._duongHaPassiveWilBonus, 0) + wilGain);
  unit._duongHaPassiveHpBonus = Math.max(0, toFiniteNumber(unit._duongHaPassiveHpBonus, 0) + hpGain);
}

function refreshSkill2Toggle(unit: DuongHaCarrier): void {
  const shouldActivate = unit._duongHaSkill2NextActive !== false;
  unit._duongHaSkill2NextActive = !shouldActivate;
  if (!shouldActivate) {
    unit._duongHaSkill2ActiveThisTurn = false;
    return;
  }
  unit._duongHaSkill2ActiveThisTurn = globalAetherPool.consume(unit.side, SKILL2_AE_COST);
}

export const duongHaRuntimeHook: UnitRuntimeHook = {
  onUlt({ game, caster }) {
    if (caster.id !== DUONG_HA_ID) return false;
    for (let i = 0; i < 3; i += 1) {
      if (!caster.alive) break;
      basicAttack(game, caster);
    }
    return true;
  },
  onActiveSkill({ caster, skillKey, skill, tags, appliedTags }) {
    if (caster.id !== DUONG_HA_ID) return null;
    if (skillKey === 'skill1' || skillKey === 'skill2') {
      return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
    }
    if (skillKey !== 'skill3') return null;
    Statuses.add(caster, { id: 'duong_ha_skill3_atk', kind: 'buff', tag: 'stat', attr: 'atk', mode: 'percent', amount: SKILL3_RATIO, dur: SKILL3_DURATION, tick: 'turn', sourceUnitId: caster.id });
    Statuses.add(caster, { id: 'duong_ha_skill3_wil', kind: 'buff', tag: 'stat', attr: 'wil', mode: 'percent', amount: SKILL3_RATIO, dur: SKILL3_DURATION, tick: 'turn', sourceUnitId: caster.id });
    Statuses.add(caster, { id: 'duong_ha_skill3_agi', kind: 'buff', tag: 'stat', attr: 'agi', mode: 'percent', amount: SKILL3_RATIO, dur: SKILL3_DURATION, tick: 'turn', sourceUnitId: caster.id });
    if (typeof caster._recalcStats === 'function') caster._recalcStats();
    return buildSkillResult(true, skillKey, skill, tags, appliedTags, 0);
  },
  onTurnStart({ unit }) {
    const duongHa = unit as DuongHaCarrier | null | undefined;
    if (!duongHa || duongHa.id !== DUONG_HA_ID) return;
    if (!duongHa.alive) {
      resetDuongHaPassive(duongHa);
      Statuses.remove(duongHa, 'duong_ha_skill2_pierce');
      duongHa._duongHaSkill1ActiveThisTurn = false;
      duongHa._duongHaSkill2ActiveThisTurn = false;
      return;
    }
    duongHa._duongHaSkill1ActiveThisTurn = globalAetherPool.consume(duongHa.side, SKILL1_TURN_DRAIN);
    if (!duongHa._duongHaSkill1ActiveThisTurn) {
      duongHa._duongHaSkill2ActiveThisTurn = false;
      Statuses.remove(duongHa, 'duong_ha_skill2_pierce');
      return;
    }
    refreshSkill2Toggle(duongHa);
    Statuses.remove(duongHa, 'duong_ha_skill2_pierce');
    if (duongHa._duongHaSkill2ActiveThisTurn) {
      Statuses.add(duongHa, {
        id: 'duong_ha_skill2_pierce',
        kind: 'buff',
        tag: 'penetration',
        power: SKILL2_PIERCE_RATIO,
        dur: 1,
        tick: 'turn',
        sourceUnitId: duongHa.id,
      });
    }
  },
  onBasicAttackResolved({ game, attacker, target, dealt }) {
    const duongHa = attacker as DuongHaCarrier;
    if (duongHa.id !== DUONG_HA_ID || !duongHa.alive) return;
    if (!duongHa._duongHaSkill1ActiveThisTurn) return;
    if (dealt > 0) {
      setFury(target, Math.max(0, toFiniteNumber(target.fury, 0) - SKILL1_RAGE_DRAIN));
    }

    const followupBase = Math.max(1, Math.floor(readAtkWilPower(duongHa) * SKILL1_FOLLOWUP_RATIO));
    dealAbilityDamage(game, duongHa, target, {
      base: followupBase,
      dtype: 'mixed',
      attackType: 'followup',
      defPen: duongHa._duongHaSkill2ActiveThisTurn ? SKILL2_PIERCE_RATIO : 0,
      skill: null,
    });
  },
  onUnitDeath({ game, deadUnit }) {
    if (deadUnit.id === DUONG_HA_ID) {
      resetDuongHaPassive(deadUnit as DuongHaCarrier);
      return;
    }
    for (const token of game.tokens) {
      if (!token?.alive || token.id !== DUONG_HA_ID) continue;
      if (token.side === deadUnit.side) continue;
      addPassiveStack(token as DuongHaCarrier);
    }
  },
  onUnitRevive({ unit }) {
    if (unit.id !== DUONG_HA_ID) return;
    const duongHa = unit as DuongHaCarrier;
    resetDuongHaPassive(duongHa);
    duongHa._duongHaSkill2NextActive = true;
    duongHa._duongHaSkill1ActiveThisTurn = false;
    duongHa._duongHaSkill2ActiveThisTurn = false;
    Statuses.remove(duongHa, 'duong_ha_skill2_pierce');
  },
};
