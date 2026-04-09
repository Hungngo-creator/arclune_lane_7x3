import type { SkillSection } from '@shared-types/config';
import type { ActiveSkillKey, PerformActiveSkillResult } from './perform-active-skill.ts';

export function buildSkillResult(
  ok: boolean,
  skillKey: ActiveSkillKey,
  skill: SkillSection | null,
  tags: string[],
  appliedTags: string[],
  targetCount: number,
  reason?: PerformActiveSkillResult['reason'],
): PerformActiveSkillResult {
  return {
    ok,
    skillKey,
    skill,
    tags,
    appliedTags,
    targetCount,
    ...(reason ? { reason } : {}),
  };
}
