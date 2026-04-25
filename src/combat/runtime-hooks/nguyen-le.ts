import { dealAbilityDamage } from '../../combat.ts';
import { globalAetherPool } from '../../aether.ts';
import { Statuses } from '../../statuses.ts';
import { nextRngValue } from '../../utils/rng.ts';
import { buildSkillResult } from '../skill-result.ts';
import { readAtkWilPower, toFiniteNumber } from '../number-utils.ts';
import { findAliveUnitAtSlot } from '../board-position-utils.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import type { UnitRuntimeHook } from './types.ts';

const NGUYEN_LE_ID = 'nguyen_le';
const IMMUNITY_POOL = ['poison', 'stun', 'sleep', 'bleed', 'fatigue'] as const;

type NguyenLeCarrier = UnitToken & {
  _nguyenLeKillStacks?: number;
  _nguyenLeAtkBonus?: number;
  _nguyenLeWilBonus?: number;
  _nguyenLeDebuffImmunities?: string[];
  _nguyenLeSkill1LastDamageTurn?: number;
  _nguyenLeSkill1LastDamageSerial?: number;
  _lastDamageTaken?: number;
  _lastDamageTakenSerial?: number;
  _lastDamageTakenTurn?: number;
};

function countAliveInRow(game: SessionState, side: UnitToken['side'], slots: readonly number[]): number {
  let count = 0;
  for (const slot of slots) {
    if (findAliveUnitAtSlot(game, side, slot)) count += 1;
  }
  return count;
}

function ensureImmunityStore(unit: NguyenLeCarrier): Set<string> {
  const list = Array.isArray(unit._nguyenLeDebuffImmunities) ? unit._nguyenLeDebuffImmunities : [];
  const store = new Set<string>();
  for (const id of list) {
    if (typeof id === 'string' && id.trim()) store.add(id.trim().toLowerCase());
  }
  unit._nguyenLeDebuffImmunities = [...store];
  return store;
}

function grantRandomDebuffImmunity(game: SessionState, unit: NguyenLeCarrier): void {
  const store = ensureImmunityStore(unit);
  const options = IMMUNITY_POOL.filter((id) => !store.has(id));
  const pickPool = options.length > 0 ? options : [...IMMUNITY_POOL];
  if (pickPool.length <= 0) return;
  const roll = nextRngValue(game.rng);
  const idx = Math.max(0, Math.floor(roll * pickPool.length)) % pickPool.length;
  const picked = pickPool[idx] ?? pickPool[0];
  if (!picked) return;
  store.add(picked);
  unit._nguyenLeDebuffImmunities = [...store];
}

function resetKillPassive(unit: NguyenLeCarrier): void {
  const atkBonus = Math.max(0, toFiniteNumber(unit._nguyenLeAtkBonus, 0));
  const wilBonus = Math.max(0, toFiniteNumber(unit._nguyenLeWilBonus, 0));
  if (atkBonus > 0) {
    unit.atk = Math.max(0, Math.floor(toFiniteNumber(unit.atk, 0) - atkBonus));
  }
  if (wilBonus > 0) {
    unit.wil = Math.max(0, Math.floor(toFiniteNumber(unit.wil, 0) - wilBonus));
  }
  unit._nguyenLeKillStacks = 0;
  unit._nguyenLeAtkBonus = 0;
  unit._nguyenLeWilBonus = 0;
  unit._nguyenLeDebuffImmunities = [];
}

export const nguyenLeRuntimeHook: UnitRuntimeHook = {
  onActiveSkill({ game, caster, skillKey, skill, tags, appliedTags }) {
    if (caster.id !== NGUYEN_LE_ID) return null;

    const enemySide: UnitToken['side'] = caster.side === 'ally' ? 'enemy' : 'ally';
    if (skillKey === 'skill2') {
      const rows = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ] as const;
      let chosen: readonly number[] = rows[0];
      let chosenCount = -1;
      for (const row of rows) {
        const count = countAliveInRow(game, enemySide, row);
        if (count > chosenCount) {
          chosen = row;
          chosenCount = count;
        }
      }
      if (chosenCount <= 0) {
        return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
      }

      const cost = Math.max(0, Math.min(21, chosenCount * 7));
      if (!globalAetherPool.consume(caster.side, cost)) {
        return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'insufficient-aether');
      }

      const base = Math.max(1, Math.floor(readAtkWilPower(caster) * 1.5));
      let hits = 0;
      for (const slot of chosen) {
        const target = findAliveUnitAtSlot(game, enemySide, slot);
        if (!target) continue;
        dealAbilityDamage(game, caster, target, {
          base,
          dtype: 'mixed',
          attackType: 'skill',
          skill,
          isAoE: true,
        });
        hits += 1;
      }
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, hits);
    }

    if (skillKey === 'skill3') {
      if (!globalAetherPool.consume(caster.side, 20)) {
        return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'insufficient-aether');
      }
      Statuses.add(caster, {
        id: 'nguyen_le_skill3_atk_up',
        kind: 'buff',
        tag: 'stat',
        attr: 'atk',
        mode: 'percent',
        amount: 0.5,
        dur: 2,
        tick: 'turn',
        sourceUnitId: caster.id,
      });
      Statuses.add(caster, {
        id: 'nguyen_le_skill3_wil_up',
        kind: 'buff',
        tag: 'stat',
        attr: 'wil',
        mode: 'percent',
        amount: 0.5,
        dur: 2,
        tick: 'turn',
        sourceUnitId: caster.id,
      });
      if (typeof caster._recalcStats === 'function') {
        caster._recalcStats();
      }
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, 0);
    }

    return null;
  },
  onDamageResolved({ target }) {
    const unit = target as NguyenLeCarrier | null | undefined;
    if (!unit || !unit.alive || unit.id !== NGUYEN_LE_ID) return;
    const damageTaken = Math.max(0, toFiniteNumber(unit._lastDamageTaken, 0));
    const hpMax = Math.max(0, toFiniteNumber(unit.hpMax, 0));
    if (hpMax <= 0 || damageTaken <= hpMax * 0.2) return;

    const serial = Math.max(0, Math.floor(toFiniteNumber(unit._lastDamageTakenSerial, 0)));
    const turnStamp = Math.max(1, Math.floor(toFiniteNumber(unit._lastDamageTakenTurn, 1)));
    if (unit._nguyenLeSkill1LastDamageSerial === serial && unit._nguyenLeSkill1LastDamageTurn === turnStamp) return;

    if (!globalAetherPool.consume(unit.side, 10)) return;

    const heal = Math.max(1, Math.floor(readAtkWilPower(unit) * 0.5));
    unit.hp = Math.min(hpMax, Math.max(0, toFiniteNumber(unit.hp, 0)) + heal);
    unit._nguyenLeSkill1LastDamageSerial = serial;
    unit._nguyenLeSkill1LastDamageTurn = turnStamp;
  },
  onUnitDeath({ deadUnit, killer, game }) {
    if (killer && killer.id === NGUYEN_LE_ID) {
      const unit = killer as NguyenLeCarrier;
      const stacks = Math.max(0, Math.floor(toFiniteNumber(unit._nguyenLeKillStacks, 0)));
      const atkNow = Math.max(0, toFiniteNumber(unit.atk, 0));
      const wilNow = Math.max(0, toFiniteNumber(unit.wil, 0));
      const atkGain = Math.max(0, Math.floor(atkNow * 0.05));
      const wilGain = Math.max(0, Math.floor(wilNow * 0.05));
      unit.atk = Math.max(0, Math.floor(atkNow + atkGain));
      unit.wil = Math.max(0, Math.floor(wilNow + wilGain));
      unit._nguyenLeKillStacks = stacks + 1;
      unit._nguyenLeAtkBonus = Math.max(0, toFiniteNumber(unit._nguyenLeAtkBonus, 0) + atkGain);
      unit._nguyenLeWilBonus = Math.max(0, toFiniteNumber(unit._nguyenLeWilBonus, 0) + wilGain);
      grantRandomDebuffImmunity(game, unit);
    }

    if (deadUnit.id === NGUYEN_LE_ID) {
      resetKillPassive(deadUnit as NguyenLeCarrier);
    }
  },
  onUnitRevive({ unit }) {
    if (unit.id !== NGUYEN_LE_ID) return;
    resetKillPassive(unit as NguyenLeCarrier);
  },
};
