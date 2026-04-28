import { dealAbilityDamage, healUnit, pickTarget } from '../../combat.ts';
import { globalAetherPool } from '../../aether.ts';
import { setFury } from '../../utils/fury.ts';
import { buildSkillResult } from '../skill-result.ts';
import { readAtkWilPower, toFiniteNumber, toRoundedInt } from '../number-utils.ts';
import { nextRngValue } from '../../utils/rng.ts';

import type { SessionState } from '@shared-types/combat';
import type { RngState } from '@shared-types/rng';
import type { UnitToken } from '@shared-types/units';
import type { UnitRuntimeHook } from './types.ts';

const CO_TRUONG_PHONG_ID = 'co_truong_phong';
const BASE_SWORD_GAIN_PER_TURN = 3;
const MAX_RULE_STACKS = 5;
const SKILL1_AE_COST = 20;
const SKILL1_SWORD_COST = 2;
const SKILL1_DAMAGE_RATIO = 1.5;
const SKILL2_AE_COST = 35;
const SKILL2_SWORD_COST = 3;
const SKILL2_HITS = 3;
const SKILL2_HEAL_RATIO = 0.55;
const SKILL3_RAGE_DRAIN_PER_HIT = 8;
const SKILL3_AE_COST_PER_TURN = 8;

type CoTruongPhongCarrier = UnitToken & {
  _coTruongPhongFlyingSwords?: number;
  _coTruongPhongRuleStacks?: number;
  _coTruongPhongLawActive?: boolean;
};

function toInt(value: unknown, fallback = 0): number {
  return Math.max(0, toRoundedInt(toFiniteNumber(value, fallback), fallback));
}

function getSwordCount(unit: CoTruongPhongCarrier): number {
  return toInt(unit._coTruongPhongFlyingSwords, 0);
}

function setSwordCount(unit: CoTruongPhongCarrier, value: number): void {
  unit._coTruongPhongFlyingSwords = Math.max(0, toInt(value, 0));
}

function getRuleStacks(unit: CoTruongPhongCarrier): number {
  return Math.min(MAX_RULE_STACKS, toInt(unit._coTruongPhongRuleStacks, 0));
}

function spendSkillAether(unit: CoTruongPhongCarrier, amount: number): boolean {
  const normalized = Math.max(0, Math.floor(toFiniteNumber(amount, 0)));
  if (normalized <= 0) return true;
  return globalAetherPool.consume(unit.side, normalized);
}

function reduceTargetRage(target: UnitToken, amount: number): void {
  if (!target?.alive || amount <= 0) return;
  setFury(target, Math.max(0, toFiniteNumber(target.fury, 0) - amount));
}

function drainRageOnSuccessfulHit(unit: CoTruongPhongCarrier, target: UnitToken, dealt: number): void {
  if (!unit._coTruongPhongLawActive) return;
  if (dealt <= 0) return;
  reduceTargetRage(target, SKILL3_RAGE_DRAIN_PER_HIT);
}

function selectRandomEnemies(rng: RngState | null | undefined, enemyPool: UnitToken[], count: number): UnitToken[] {
  if (enemyPool.length <= 1 || count <= 1) return enemyPool.length > 0 ? [enemyPool[0]] : [];
  const available = [...enemyPool];
  const picked: UnitToken[] = [];
  const maxPick = Math.min(count, available.length);
  for (let i = 0; i < maxPick; i += 1) {
    const roll = nextRngValue(rng);
    const idx = Math.floor(Math.max(0, roll) * available.length) % available.length;
    const target = available.splice(idx, 1)[0];
    if (target) picked.push(target);
  }
  return picked;
}

function enemyLeader(unit: CoTruongPhongCarrier, allTokens: UnitToken[]): UnitToken | null {
  const foe = unit.side === 'ally' ? 'enemy' : 'ally';
  const leader = allTokens.find((token) => token?.alive && token.side === foe && token.cy === 3);
  return leader ?? null;
}

function castSkill1Runtime(game: SessionState, caster: CoTruongPhongCarrier): number {
  const enemies = game.tokens.filter((token) => token?.alive && token.side !== caster.side);
  if (enemies.length <= 0) return 0;
  const targets = selectRandomEnemies(game.rng, enemies, 2);
  if (targets.length <= 0) return 0;
  const base = Math.max(1, Math.floor(readAtkWilPower(caster) * SKILL1_DAMAGE_RATIO));
  let successHits = 0;
  for (const target of targets) {
    const result = dealAbilityDamage(game, caster, target, { base, attackType: 'skill', skill: null });
    drainRageOnSuccessfulHit(caster, target, result.dealt);
    if (result.dealt > 0) successHits += 1;
  }
  return successHits;
}

function castSkill2Runtime(game: SessionState, caster: CoTruongPhongCarrier): number {
  const leader = enemyLeader(caster, game.tokens) ?? pickTarget(game, caster);
  if (!leader?.alive) return 0;
  const base = Math.max(1, Math.floor(readAtkWilPower(caster)));
  let successHits = 0;
  for (let i = 0; i < SKILL2_HITS; i += 1) {
    const result = dealAbilityDamage(game, caster, leader, { base, attackType: 'skill', skill: null });
    drainRageOnSuccessfulHit(caster, leader, result.dealt);
    if (result.dealt > 0) {
      successHits += 1;
      healUnit(caster, Math.max(1, Math.floor(result.dealt * SKILL2_HEAL_RATIO)));
    }
  }
  return successHits;
}

export const coTruongPhongRuntimeHook: UnitRuntimeHook = {
  onActiveSkill({ game, caster, skillKey, skill, tags, appliedTags }) {
    if (caster.id !== CO_TRUONG_PHONG_ID) return null;
    const coTruongPhong = caster as CoTruongPhongCarrier;
    const swordCount = getSwordCount(coTruongPhong);
    if (skillKey === 'skill3') {
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, 0);
    }
    if (skillKey === 'skill1') {
      if (swordCount < SKILL1_SWORD_COST) return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
      if (!spendSkillAether(coTruongPhong, SKILL1_AE_COST)) return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'insufficient-aether');
      setSwordCount(coTruongPhong, swordCount - SKILL1_SWORD_COST);
      const hitCount = castSkill1Runtime(game, coTruongPhong);
      return buildSkillResult(hitCount > 0, skillKey, skill, tags, appliedTags, hitCount, hitCount > 0 ? undefined : 'blocked');
    }
    if (skillKey === 'skill2') {
      if (swordCount < SKILL2_SWORD_COST) return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
      if (!spendSkillAether(coTruongPhong, SKILL2_AE_COST)) return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'insufficient-aether');
      setSwordCount(coTruongPhong, swordCount - SKILL2_SWORD_COST);
      const hitCount = castSkill2Runtime(game, coTruongPhong);
      return buildSkillResult(hitCount > 0, skillKey, skill, tags, appliedTags, hitCount, hitCount > 0 ? undefined : 'blocked');
    }
    return null;
  },
  onTurnStart({ unit }) {
    const coTruongPhong = unit as CoTruongPhongCarrier | null | undefined;
    if (!coTruongPhong || coTruongPhong.id !== CO_TRUONG_PHONG_ID || !coTruongPhong.alive) return;
    const ruleStacks = getRuleStacks(coTruongPhong);
    const generated = BASE_SWORD_GAIN_PER_TURN + ruleStacks;
    setSwordCount(coTruongPhong, getSwordCount(coTruongPhong) + generated);
    coTruongPhong._coTruongPhongLawActive = spendSkillAether(coTruongPhong, SKILL3_AE_COST_PER_TURN);
  },
  onBasicAttackResolved({ attacker, target, dealt }) {
    const coTruongPhong = attacker as CoTruongPhongCarrier;
    if (!coTruongPhong || coTruongPhong.id !== CO_TRUONG_PHONG_ID || !coTruongPhong.alive) return;
    drainRageOnSuccessfulHit(coTruongPhong, target, dealt);
  },
  onUnitDeath({ deadUnit, killer }) {
    const coTruongPhong = killer as CoTruongPhongCarrier | null;
    if (!coTruongPhong || coTruongPhong.id !== CO_TRUONG_PHONG_ID || !coTruongPhong.alive) return;
    if (deadUnit.side === coTruongPhong.side) return;
    coTruongPhong._coTruongPhongRuleStacks = Math.min(MAX_RULE_STACKS, getRuleStacks(coTruongPhong) + 1);
  },
  onUnitRevive({ unit }) {
    const coTruongPhong = unit as CoTruongPhongCarrier;
    if (coTruongPhong.id !== CO_TRUONG_PHONG_ID) return;
    coTruongPhong._coTruongPhongFlyingSwords = 0;
    coTruongPhong._coTruongPhongRuleStacks = 0;
    coTruongPhong._coTruongPhongLawActive = false;
  },
  onUlt({ game, caster }) {
    if (caster.id !== CO_TRUONG_PHONG_ID || !caster.alive) return false;
    const coTruongPhong = caster as CoTruongPhongCarrier;
    let swords = getSwordCount(coTruongPhong);
    if (swords <= 0) return false;
    let casts = 0;
    while (swords >= SKILL2_SWORD_COST) {
      setSwordCount(coTruongPhong, swords - SKILL2_SWORD_COST);
      castSkill2Runtime(game, coTruongPhong);
      swords = getSwordCount(coTruongPhong);
      casts += 1;
      if (!coTruongPhong.alive) break;
    }
    swords = getSwordCount(coTruongPhong);
    if (coTruongPhong.alive && swords >= SKILL1_SWORD_COST) {
      setSwordCount(coTruongPhong, swords - SKILL1_SWORD_COST);
      castSkill1Runtime(game, coTruongPhong);
      casts += 1;
    }
    return casts > 0;
  },
};
