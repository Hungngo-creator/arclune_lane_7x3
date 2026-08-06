import { skillSets } from '../data/skills.ts';
import { performCanonicalActiveSkill } from './canonical-action-executor.ts';
import { buildSkillResult } from './skill-result.ts';

import type { SessionState } from '@shared-types/combat';
import type { SkillSection } from '@shared-types/config';
import type { UnitToken } from '@shared-types/units';

type ActiveSkillKey = 'skill1' | 'skill2' | 'skill3';
const EMPTY_TAGS: string[] = [];

export interface PerformActiveSkillResult {
  ok: boolean;
  skillKey: ActiveSkillKey;
  skill: SkillSection | null;
  tags: string[];
  appliedTags: string[];
  targetCount: number;
  reason?: 'missing-skill' | 'insufficient-aether' | 'insufficient-cost' | 'blocked';
}

function resolveActiveSkill(caster: UnitToken, skillKey: ActiveSkillKey): SkillSection | null {
  const set = skillSets[caster.id as keyof typeof skillSets];
  if (!set) return null;
  const idx = Number(skillKey.replace('skill', '')) - 1;
  if (!Number.isFinite(idx) || idx < 0) return null;
  return set.skills[idx] ?? (idx === 0 ? set.skill : null) ?? null;
}

export function performActiveSkill(game: SessionState, caster: UnitToken, skillKey: ActiveSkillKey): PerformActiveSkillResult {
  if (!caster.alive) return buildSkillResult(false, skillKey, null, EMPTY_TAGS, EMPTY_TAGS, 0, 'blocked');
  const skill = resolveActiveSkill(caster, skillKey);
  if (!skill) return buildSkillResult(false, skillKey, null, EMPTY_TAGS, EMPTY_TAGS, 0, 'missing-skill');
  return performCanonicalActiveSkill(game, caster, skillKey, skill) as PerformActiveSkillResult;
}

export type { ActiveSkillKey };
