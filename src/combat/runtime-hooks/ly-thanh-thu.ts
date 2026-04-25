import { dealAbilityDamage, pickTarget } from '../../combat.ts';
import { Statuses } from '../../statuses.ts';
import { globalAetherPool } from '../../aether.ts';
import { buildSkillResult } from '../skill-result.ts';
import { readAtkWilPower, toFiniteNumber, toRoundedInt } from '../number-utils.ts';
import { findAliveUnitAtSlot, isLeaderToken } from '../board-position-utils.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import type { UnitRuntimeHook } from './types.ts';

const LY_THANH_THU_ID = 'ly_thanh_thu';
const PASSIVE_GAIN_RATIO = 0.1;
const PASSIVE_MAX_PER_TURN = 3;
const PASSIVE_MAX_STACKS = 25;
const PASSIVE_HEAL_EVERY_STACKS = 5;
const PASSIVE_HEAL_RATIO = 0.2;
const PASSIVE_TRANSFER_RATIO = 0.5;
const SKILL3_RES_ARM_RATIO = 0.2;
const SKILL3_MAX_STACKS = 3;
const SKILL3_STACK_DURATION_TURNS = 2;
const BLEED_DURATION = 1;

type DefenseStackEntry = {
  armBonus: number;
  resBonus: number;
  expiresAtTurn: number;
};

type FlyingSwordStage = {
  slots: number[];
  countsAsBasic: boolean;
  parkSlot?: number;
};

type FlyingSwordState = {
  ownerIid: string;
  stageIndex: number;
  waitTurns: number;
  parkedSlot?: number;
};

type LyThanhThuCarrier = UnitToken & {
  _lyThanhThuPassiveStacks?: number;
  _lyThanhThuPassiveTurnStamp?: number;
  _lyThanhThuPassiveTurnGain?: number;
  _lyThanhThuPassiveAtkBonus?: number;
  _lyThanhThuPassiveWilBonus?: number;
  _lyThanhThuDefenseStacks?: DefenseStackEntry[];
};

type RuntimeState = {
  swords: FlyingSwordState[];
};

const FLYING_SWORD_STAGES: ReadonlyArray<FlyingSwordStage> = [
  { slots: [7, 8, 9], countsAsBasic: true, parkSlot: 9 },
  { slots: [9, 6, 3], countsAsBasic: false, parkSlot: 3 },
  { slots: [2, 3], countsAsBasic: false, parkSlot: 2 },
  { slots: [2, 5, 8], countsAsBasic: true },
];

function readTurnStamp(game: SessionState): number {
  const count = Number((game.turn as { turnCount?: unknown } | null | undefined)?.turnCount ?? Number.NaN);
  if (Number.isFinite(count) && count > 0) return Math.floor(count);
  return Math.max(1, Math.floor(Number((game.turn as { cycle?: unknown } | null | undefined)?.cycle ?? 1)));
}

function isSummonedUnit(unit: UnitToken): boolean {
  return !!unit.isMinion || unit.ownerIid != null;
}

function findLeader(game: SessionState, side: UnitToken['side']): UnitToken | null {
  for (const token of game.tokens) {
    if (!token.alive || token.side !== side) continue;
    if (isLeaderToken(token)) return token;
  }
  return null;
}

function getRuntimeState(game: SessionState): RuntimeState {
  const runtimeRoot = (game.runtime ??= {});
  const current = runtimeRoot._lyThanhThuRuntime as RuntimeState | undefined;
  if (current) return current;
  const created: RuntimeState = { swords: [] };
  runtimeRoot._lyThanhThuRuntime = created;
  return created;
}

function addPassiveStack(game: SessionState, unit: LyThanhThuCarrier): void {
  const turnStamp = readTurnStamp(game);
  if ((unit._lyThanhThuPassiveTurnStamp ?? -1) !== turnStamp) {
    unit._lyThanhThuPassiveTurnStamp = turnStamp;
    unit._lyThanhThuPassiveTurnGain = 0;
  }

  const turnGain = Math.max(0, toRoundedInt(unit._lyThanhThuPassiveTurnGain ?? 0, 0));
  if (turnGain >= PASSIVE_MAX_PER_TURN) return;
  const stacks = Math.max(0, toRoundedInt(unit._lyThanhThuPassiveStacks ?? 0, 0));
  if (stacks >= PASSIVE_MAX_STACKS) return;

  const atkNow = Math.max(0, toFiniteNumber(unit.atk, 0));
  const wilNow = Math.max(0, toFiniteNumber(unit.wil, 0));
  const atkGain = Math.max(0, Math.floor(atkNow * PASSIVE_GAIN_RATIO));
  const wilGain = Math.max(0, Math.floor(wilNow * PASSIVE_GAIN_RATIO));
  if (atkGain <= 0 && wilGain <= 0) return;

  unit.atk = Math.max(0, Math.floor(atkNow + atkGain));
  unit.wil = Math.max(0, Math.floor(wilNow + wilGain));
  unit._lyThanhThuPassiveAtkBonus = Math.max(0, toFiniteNumber(unit._lyThanhThuPassiveAtkBonus, 0) + atkGain);
  unit._lyThanhThuPassiveWilBonus = Math.max(0, toFiniteNumber(unit._lyThanhThuPassiveWilBonus, 0) + wilGain);
  unit._lyThanhThuPassiveStacks = stacks + 1;
  unit._lyThanhThuPassiveTurnGain = turnGain + 1;

  if ((unit._lyThanhThuPassiveStacks % PASSIVE_HEAL_EVERY_STACKS) === 0) {
    const heal = Math.max(1, Math.floor(Math.max(0, toFiniteNumber(unit.hpMax, 0)) * PASSIVE_HEAL_RATIO));
    unit.hp = Math.min(
      Math.max(0, toFiniteNumber(unit.hpMax, 0)),
      Math.max(0, toFiniteNumber(unit.hp, 0)) + heal,
    );
  }
}

function transferPassiveStatsToLeader(game: SessionState, unit: LyThanhThuCarrier): void {
  const leader = findLeader(game, unit.side);
  if (!leader || leader.iid === unit.iid) return;
  const atkBonus = Math.max(0, Math.floor(toFiniteNumber(unit._lyThanhThuPassiveAtkBonus, 0) * PASSIVE_TRANSFER_RATIO));
  const wilBonus = Math.max(0, Math.floor(toFiniteNumber(unit._lyThanhThuPassiveWilBonus, 0) * PASSIVE_TRANSFER_RATIO));
  if (atkBonus > 0) leader.atk = Math.max(0, Math.floor(toFiniteNumber(leader.atk, 0) + atkBonus));
  if (wilBonus > 0) leader.wil = Math.max(0, Math.floor(toFiniteNumber(leader.wil, 0) + wilBonus));
}

function resetPassive(unit: LyThanhThuCarrier): void {
  const atkBonus = Math.max(0, toFiniteNumber(unit._lyThanhThuPassiveAtkBonus, 0));
  const wilBonus = Math.max(0, toFiniteNumber(unit._lyThanhThuPassiveWilBonus, 0));
  if (atkBonus > 0) {
    unit.atk = Math.max(0, Math.floor(toFiniteNumber(unit.atk, 0) - atkBonus));
  }
  if (wilBonus > 0) {
    unit.wil = Math.max(0, Math.floor(toFiniteNumber(unit.wil, 0) - wilBonus));
  }
  unit._lyThanhThuPassiveStacks = 0;
  unit._lyThanhThuPassiveTurnStamp = undefined;
  unit._lyThanhThuPassiveTurnGain = 0;
  unit._lyThanhThuPassiveAtkBonus = 0;
  unit._lyThanhThuPassiveWilBonus = 0;
}

function applyBleedAtSlot(game: SessionState, side: UnitToken['side'], slot: number, sourceUnitId: string): void {
  const target = findAliveUnitAtSlot(game, side, slot);
  if (!target) return;
  Statuses.add(target, {
    id: 'bleed',
    kind: 'debuff',
    tag: 'bleed',
    dur: BLEED_DURATION,
    tick: 'turn',
    sourceUnitId,
  });
}

function triggerSkill3Defense(game: SessionState, caster: LyThanhThuCarrier): void {
  if (!globalAetherPool.consume(caster.side, 8)) return;
  const turnStamp = readTurnStamp(game);
  const expiresAtTurn = turnStamp + Math.max(0, SKILL3_STACK_DURATION_TURNS - 2);
  const stacks = caster._lyThanhThuDefenseStacks ?? [];
  if (stacks.length >= SKILL3_MAX_STACKS) {
    const oldest = stacks.shift();
    if (oldest) {
      oldest.expiresAtTurn = expiresAtTurn;
      stacks.push(oldest);
    }
    caster._lyThanhThuDefenseStacks = stacks;
    return;
  }

  const armNow = Math.max(0, toFiniteNumber(caster.arm, 0));
  const resNow = Math.max(0, toFiniteNumber(caster.res, 0));
  const armBonus = armNow * SKILL3_RES_ARM_RATIO;
  const resBonus = resNow * SKILL3_RES_ARM_RATIO;

  caster.arm = Math.max(0, armNow + armBonus);
  caster.res = Math.max(0, resNow + resBonus);
  stacks.push({ armBonus, resBonus, expiresAtTurn });
  caster._lyThanhThuDefenseStacks = stacks;
}

function expireDefenseStacks(game: SessionState, unit: LyThanhThuCarrier): void {
  const stacks = unit._lyThanhThuDefenseStacks;
  if (!Array.isArray(stacks) || stacks.length === 0) return;
  const turnStamp = readTurnStamp(game);
  const remain: DefenseStackEntry[] = [];
  for (const stack of stacks) {
    if (stack.expiresAtTurn >= turnStamp) {
      remain.push(stack);
      continue;
    }
    unit.arm = Math.max(0, toFiniteNumber(unit.arm, 0) - Math.max(0, stack.armBonus));
    unit.res = Math.max(0, toFiniteNumber(unit.res, 0) - Math.max(0, stack.resBonus));
  }
  unit._lyThanhThuDefenseStacks = remain;
}

function runFlyingSwordStage(game: SessionState, caster: LyThanhThuCarrier, stage: FlyingSwordStage, skill: unknown): number {
  let hits = 0;
  const base = Math.max(1, Math.floor(readAtkWilPower(caster)));
  const enemySide: UnitToken['side'] = caster.side === 'ally' ? 'enemy' : 'ally';
  for (const slot of stage.slots) {
    const target = findAliveUnitAtSlot(game, enemySide, slot);
    if (!target) continue;
    const dealt = dealAbilityDamage(game, caster, target, {
      base,
      dtype: 'mixed',
      attackType: stage.countsAsBasic ? 'basic' : 'skill',
      skill,
    isAoE: true,
    });
    if (Math.max(0, toRoundedInt(dealt.dealt, 0)) > 0) {
      hits += 1;
    }
  }
  if (stage.parkSlot != null) {
    applyBleedAtSlot(game, enemySide, stage.parkSlot, caster.id);
  }
  return hits;
}

function clearDefenseStacks(unit: LyThanhThuCarrier): void {
  const stacks = unit._lyThanhThuDefenseStacks;
  if (!Array.isArray(stacks) || stacks.length === 0) {
    unit._lyThanhThuDefenseStacks = [];
    return;
  }
  for (const stack of stacks) {
    unit.arm = Math.max(0, toFiniteNumber(unit.arm, 0) - Math.max(0, toFiniteNumber(stack.armBonus, 0)));
    unit.res = Math.max(0, toFiniteNumber(unit.res, 0) - Math.max(0, toFiniteNumber(stack.resBonus, 0)));
  }
  unit._lyThanhThuDefenseStacks = [];
}

function clearFlyingSwords(game: SessionState, unit: UnitToken): void {
  const runtime = getRuntimeState(game);
  const ownerKey = String(unit.iid ?? unit.id);
  runtime.swords = runtime.swords.filter((sword) => sword.ownerIid !== ownerKey);
}

function resetFlyingSwordForOwner(game: SessionState, owner: UnitToken): void {
  clearFlyingSwords(game, owner);
}

export const lyThanhThuRuntimeHook: UnitRuntimeHook = {
  onActiveSkill({ game, caster, skillKey, skill, tags, appliedTags }) {
    const ltt = caster as LyThanhThuCarrier;
    if (skillKey === 'skill1') {
      const target = pickTarget(game, caster);
      if (!target) return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
      const base = Math.max(1, Math.floor(readAtkWilPower(caster) * 2.5));
      dealAbilityDamage(game, caster, target, { base, dtype: 'mixed', attackType: 'basic', skill });
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, 1);
    }

    if (skillKey === 'skill2') {
      resetFlyingSwordForOwner(game, caster);
      const firstStageHits = runFlyingSwordStage(game, ltt, { slots: [1, 4, 7], countsAsBasic: false, parkSlot: 7 }, skill);
      if (firstStageHits >= 2) {
        triggerSkill3Defense(game, ltt);
      }
      const runtime = getRuntimeState(game);
      runtime.swords.push({
        ownerIid: String(caster.iid ?? caster.id),
        stageIndex: 0,
        waitTurns: 1,
        parkedSlot: 7,
      });
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, firstStageHits);
    }

    if (skillKey === 'skill3') {
    return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
    }

    return null;
  },
  onTurnStart({ game, unit }) {
    const ltt = unit as LyThanhThuCarrier | null | undefined;
    if (!ltt || ltt.id !== LY_THANH_THU_ID || !ltt.alive) return;
    const runtime = getRuntimeState(game);
    const ownerKey = String(ltt.iid ?? ltt.id);
    for (let index = runtime.swords.length - 1; index >= 0; index -= 1) {
      const sword = runtime.swords[index];
      if (!sword) continue;
      if (sword.ownerIid !== ownerKey) continue;
      if (sword.waitTurns > 0 && sword.parkedSlot != null) {
        const bleedSide: UnitToken['side'] = ltt.side === 'ally' ? 'enemy' : 'ally';
        applyBleedAtSlot(game, bleedSide, sword.parkedSlot, ltt.id);
      }
      sword.waitTurns -= 1;
      if (sword.waitTurns > 0) continue;
      const stage = FLYING_SWORD_STAGES[sword.stageIndex];
      if (!stage) {
        runtime.swords.splice(index, 1);
        continue;
      }
      const hits = runFlyingSwordStage(game, ltt, stage, null);
      if (hits >= 2) {
        triggerSkill3Defense(game, ltt);
      }
      sword.stageIndex += 1;
      if (sword.stageIndex >= FLYING_SWORD_STAGES.length) {
        runtime.swords.splice(index, 1);
      } else {
        sword.waitTurns = 1;
        sword.parkedSlot = FLYING_SWORD_STAGES[sword.stageIndex - 1]?.parkSlot;
      }
    }
  },
  onTurnEnd({ game, unit }) {
    const ltt = unit as LyThanhThuCarrier | null | undefined;
    if (!ltt || ltt.id !== LY_THANH_THU_ID) return;
    expireDefenseStacks(game, ltt);
  },
  onUnitDeath({ game, deadUnit }) {
    if (deadUnit.id === LY_THANH_THU_ID) {
      const ltt = deadUnit as LyThanhThuCarrier;
      transferPassiveStatsToLeader(game, ltt);
      clearDefenseStacks(ltt);
      clearFlyingSwords(game, ltt);
    }
    if (isSummonedUnit(deadUnit)) return;
    for (const token of game.tokens) {
      if (!token.alive || token.id !== LY_THANH_THU_ID) continue;
      addPassiveStack(game, token as LyThanhThuCarrier);
    }
  },
  onUnitRevive({ unit }) {
    if (unit.id !== LY_THANH_THU_ID) return;
    const ltt = unit as LyThanhThuCarrier;
    resetPassive(ltt);
    clearDefenseStacks(ltt);
  },
};
