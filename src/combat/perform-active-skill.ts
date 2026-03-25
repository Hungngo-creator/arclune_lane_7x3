import { dealAbilityDamage, healUnit, pickTarget } from '../combat.ts';
import { dispatchGameplayTags } from './tag-dispatch.ts';
import { skillSets } from '../data/skills.ts';
import { normalizeTagList } from '../data/tags.ts';
import { enqueueImmediate } from '../summon.ts';
import { cellReserved, slotToCell } from '../engine.ts';
import { globalAetherPool } from '../aether.ts';
import { Statuses } from '../statuses.ts';
import { grantShield } from './apply-damage.ts';

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

function readNumberish(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
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
  const payload = resolvePayload(skill);
  const skillCost = Math.max(0, Math.round(readNumberish(skill.cost?.aether, 0)));
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
  const turns = Math.max(1, Math.round(readNumberish(payload.turns ?? payload.duration, 1)));

  if (hasTag('summon')) {
    const openSlot = firstOpenSlot(game, caster.side);
    if (openSlot) {
      const summon = (payload.summon ?? skill.summon ?? {}) as Record<string, unknown>;
      enqueueImmediate(game, {
        side: caster.side,
        slot: openSlot,
        unit: {
          id: typeof summon.id === 'string' ? summon.id : `${caster.id}_minion`,
          name: typeof summon.name === 'string' ? summon.name : 'Creep',
          ownerIid: caster.iid,
          isMinion: true,
          ttlTurns: Math.max(1, Math.round(readNumberish(summon.ttlTurns ?? summon.ttl, 3))),
        },
      });
    }
  }

  if (hasTag('heal')) {
    const amount = Math.max(0, Math.round(readNumberish(payload.healAmount ?? payload.heal, 0)));
    for (const target of targets) healUnit(target, amount);
  }

  if (hasTag('team-heal')) {
    const amount = Math.max(0, Math.round(readNumberish(payload.healAmount ?? payload.heal, 0)));
    const allies = game.tokens.filter((token) => token.alive && token.side === caster.side);
    for (const ally of allies) healUnit(ally, amount);
  }

  if (hasTag('shield')) {
    const amount = Math.max(0, Math.round(readNumberish(payload.shieldAmount ?? payload.shield, 0)));
    for (const target of targets) grantShield(target, amount);
  }

  if (hasTag('silence')) {
    for (const target of targets) addTaggedStatus(target, 'silence', turns, caster);
  }
  if (hasTag('sleep')) {
    for (const target of targets) addTaggedStatus(target, 'sleep', turns, caster);
  }
  if (hasTag('mark')) {
    for (const target of targets) addTaggedStatus(target, 'mark', turns, caster);
  }
  if (hasTag('control')) {
    const statusId = typeof payload.controlStatus === 'string' ? payload.controlStatus : 'control';
    for (const target of targets) addTaggedStatus(target, statusId, turns, caster);
  }

  if (hasTag('single-target') || hasTag('multi-target') || hasTag('aoe') || hasTag('non-heal-hp-change') || skill.damage) {
    const multiplier = Math.max(0, readNumberish((skill.damage as Record<string, unknown> | undefined)?.multiplier ?? skill.damageMultiplier ?? 1, 1));
    const base = Math.max(1, Math.round(((caster.atk ?? 0) + (caster.wil ?? 0)) * multiplier));
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
