import { dealAbilityDamage, healUnit, pickTarget } from '../combat.ts';
import { dispatchGameplayTags } from './tag-dispatch.ts';
import { skillSets } from '../data/skills.ts';
import { normalizeTagList } from '../data/tags.ts';
import { enqueueImmediate } from '../summon.ts';
import { cellReserved, slotToCell } from '../engine.ts';
import { globalAetherPool } from '../aether.ts';
import { Statuses } from '../statuses.ts';
import { grantShield } from './apply-damage.ts';
import { runRuntimeActiveSkill } from './unit-runtime-hooks.ts';
import { toFiniteNumber, toFloorInt, toPositiveTurns, toRoundedInt } from './number-utils.ts';

import type { SessionState } from '@shared-types/combat';
import type { SkillSection } from '@shared-types/config';
import type { UnitToken } from '@shared-types/units';

type ActiveSkillKey = 'skill1' | 'skill2' | 'skill3';

export interface PerformActiveSkillResult {
  ok: boolean;
  skillKey: ActiveSkillKey;
  skill: SkillSection | null;
  tags: string[];
  appliedTags: string[];
  targetCount: number;
  reason?: 'missing-skill' | 'insufficient-aether' | 'blocked';
}

function resolveActiveSkill(caster: UnitToken, skillKey: ActiveSkillKey): SkillSection | null {
  const set = skillSets[caster.id as keyof typeof skillSets];
  if (!set) return null;
  const idx = Number(skillKey.replace('skill', '')) - 1;
  if (!Number.isFinite(idx) || idx < 0) return null;
  return set.skills[idx] ?? (idx === 0 ? set.skill : null) ?? null;
}

function resolvePayload(skill: SkillSection): Record<string, unknown> {
  const nested = [skill.payload, skill.metadata?.payload, skill.meta?.payload]
    .find((value) => value && typeof value === 'object' && !Array.isArray(value));
  return {
    ...(nested as Record<string, unknown> | undefined),
    ...skill,
  };
}

function addTaggedStatus(target: UnitToken, id: string, turns: number, source: UnitToken): void {
  Statuses.add(target, {
    id,
    kind: 'debuff',
    tag: id,
    dur: Math.max(1, turns),
    tick: 'turn',
    sourceUnitId: source.id,
  });
}

function applyStatusToTargets(targets: ReadonlyArray<UnitToken>, statusId: string, turns: number, source: UnitToken): void {
  for (const target of targets) addTaggedStatus(target, statusId, turns, source);
}

function listAliveBySide(game: SessionState, side: UnitToken['side']): UnitToken[] {
  const alive: UnitToken[] = [];
  for (const token of game.tokens) {
    if (token.alive && token.side === side) alive.push(token);
  }
  return alive;
}

function canApplyUniqueGlobal(game: SessionState, caster: UnitToken, summonId: string): boolean {
  for (const token of game.tokens) {
    if (!token.alive || token.id !== summonId) continue;
    if (token.side !== caster.side) return false;
  }
  return true;
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
  const alive: UnitToken[] = [];
  for (const token of game.tokens) {
    if (token.alive) alive.push(token);
  }
  for (let slot = 1; slot <= 9; slot += 1) {
    const { cx, cy } = slotToCell(side, slot);
    if (!cellReserved(alive, game.queued, cx, cy)) return slot;
  }
  return null;
}

export function performActiveSkill(game: SessionState, caster: UnitToken, skillKey: ActiveSkillKey): PerformActiveSkillResult {
  const skill = resolveActiveSkill(caster, skillKey);
  if (!skill) {
    return { ok: false, skillKey, skill: null, tags: [], appliedTags: [], targetCount: 0, reason: 'missing-skill' };
  }

  const tags = normalizeTagList(skill.tags ?? []);
  const tagSet = new Set(tags);
  const hasTag = (tag: string): boolean => tagSet.has(tag);
  const hasDamageTag = hasTag('single-target') || hasTag('multi-target') || hasTag('aoe') || hasTag('non-heal-hp-change');
  const payload = resolvePayload(skill);
  const skillCost = Math.max(0, toRoundedInt(skill.cost?.aether, 0));
  if (skillCost > 0 && hasTag('aether-cost') && globalAetherPool.current(caster.side) < skillCost) {
    return {
      ok: false,
      skillKey,
      skill,
      tags,
      appliedTags: [],
      targetCount: 0,
      reason: 'insufficient-aether',
    };
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

  if (skillCost > 0 && hasTag('aether-cost') && !consumedAether) {
    return {
      ok: false,
      skillKey,
      skill,
      tags,
      appliedTags: dispatch.applied,
      targetCount: dispatch.targets.length,
      reason: 'insufficient-aether',
    };
  }

  const targets = dispatch.targets.length > 0 ? dispatch.targets : (caster.alive ? [caster] : []);
  const turns = toPositiveTurns(payload.turns ?? payload.duration, 1);
  if (!applyHpCost(caster, payload)) {
    return {
      ok: false,
      skillKey,
      skill,
      tags,
      appliedTags: dispatch.applied,
      targetCount: 0,
      reason: 'blocked',
    };
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

  if (caster.id === 'blood_avatar') {
    const enemySide = caster.side === 'ally' ? 'enemy' : 'ally';
    const enemies = listAliveBySide(game, enemySide);
    if (skillKey === 'skill1') {
      if (globalAetherPool.current(caster.side) < 25) {
        return { ok: false, skillKey, skill, tags, appliedTags: dispatch.applied, targetCount: enemies.length, reason: 'insufficient-aether' };
      }
      globalAetherPool.consume(caster.side, 25);
      const base = Math.max(1, toRoundedInt(((caster.atk ?? 0) + (caster.wil ?? 0)) * 1.4, 1));
      const picked = enemies.slice(0, 6);
      for (const target of picked) {
        dealAbilityDamage(game, caster, target, { base, attackType: 'skill', skill, isAoE: true, targetsHit: picked.length });
        Statuses.add(target, { id: 'bleed', kind: 'debuff', tag: 'bleed', dur: 2, tick: 'turn', sourceUnitId: caster.id });
        Statuses.add(target, { id: 'huyet_an', kind: 'mark', tag: 'mark', stacks: 1, maxStacks: 5, purgeable: false, sourceUnitId: caster.id });
      }
      return { ok: true, skillKey, skill, tags, appliedTags: dispatch.applied, targetCount: picked.length };
    }
    if (skillKey === 'skill2') {
      const casterState = caster as UnitToken & { _bloodFieldUsed?: boolean };
      if (casterState._bloodFieldUsed) {
        return { ok: false, skillKey, skill, tags, appliedTags: dispatch.applied, targetCount: 0, reason: 'blocked' };
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
      return { ok: true, skillKey, skill, tags, appliedTags: dispatch.applied, targetCount: enemies.length };
    }
    if (skillKey === 'skill3') {
      if (globalAetherPool.current(caster.side) < 25) {
        return { ok: false, skillKey, skill, tags, appliedTags: dispatch.applied, targetCount: 0, reason: 'insufficient-aether' };
      }
      globalAetherPool.consume(caster.side, 25);
      const hpCost = Math.max(1, Math.floor((caster.hpMax ?? 0) * 0.1));
      caster.hp = Math.max(1, toFloorInt((caster.hp ?? 0) - hpCost, 1));
      globalAetherPool.gain(caster.side, 15);
      return { ok: true, skillKey, skill, tags, appliedTags: dispatch.applied, targetCount: 0 };
    }
  }

  if (hasTag('summon')) {
    const openSlot = firstOpenSlot(game, caster.side);
    if (openSlot) {
      const summon = (payload.summon ?? skill.summon ?? {}) as Record<string, unknown>;
      const summonId = typeof summon.id === 'string' ? summon.id : `${caster.id}_minion`;
      if (hasTag('unique-global') && !canApplyUniqueGlobal(game, caster, summonId)) {
        return {
          ok: false,
          skillKey,
          skill,
          tags,
          appliedTags: dispatch.applied,
          targetCount: 0,
          reason: 'blocked',
        };
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

  if (hasTag('heal')) {
    const amount = Math.max(0, toRoundedInt(payload.healAmount ?? payload.heal, 0));
    for (const target of targets) healUnit(target, amount);
  }

  if (hasTag('team-heal')) {
    const amount = Math.max(0, toRoundedInt(payload.healAmount ?? payload.heal, 0));
    const allies = listAliveBySide(game, caster.side);
    for (const ally of allies) healUnit(ally, amount);
  }

  if (hasTag('shield')) {
    const amount = Math.max(0, toRoundedInt(payload.shieldAmount ?? payload.shield, 0));
    for (const target of targets) grantShield(target, amount);
  }

  if (hasTag('silence')) {
    applyStatusToTargets(targets, 'silence', turns, caster);
  }
  if (hasTag('sleep')) {
    applyStatusToTargets(targets, 'sleep', turns, caster);
  }
  if (hasTag('mark')) {
    applyStatusToTargets(targets, 'mark', turns, caster);
  }
  if (hasTag('control')) {
    const statusId = typeof payload.controlStatus === 'string' ? payload.controlStatus : 'control';
    applyStatusToTargets(targets, statusId, turns, caster);
  }

  if (hasDamageTag || skill.damage) {
    const multiplier = Math.max(0, toFiniteNumber((skill.damage as Record<string, unknown> | undefined)?.multiplier ?? skill.damageMultiplier ?? 1, 1));
    const base = Math.max(1, toRoundedInt(((caster.atk ?? 0) + (caster.wil ?? 0)) * multiplier, 1));
    for (const target of targets) {
      if (target.side === caster.side) continue;
      dealAbilityDamage(game, caster, target, { base, attackType: 'skill', skill });
    }
  }

  return {
    ok: true,
    skillKey,
    skill,
    tags,
    appliedTags: dispatch.applied,
    targetCount: dispatch.targets.length,
  };
}

export type { ActiveSkillKey };
