import { getSkillSet } from '../data/skills.ts';
import { normalizeTagList } from '../data/tags.ts';

import type { SessionState } from '../types/combat.ts';

const UNIQUE_GLOBAL_TAG = 'unique-global';

const normalizeModeKey = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const collectSkillTags = (unitId: string): string[] => {
  const set = getSkillSet(unitId as never);
  if (!set) return [];
  const tags = [
    ...(set.basic?.tags ?? []),
    ...(set.skill?.tags ?? []),
    ...(set.ult?.tags ?? []),
    ...(set.talent?.tags ?? []),
    ...(set.technique?.tags ?? []),
    ...((set.skills ?? []).flatMap((section: { tags?: string[] } | null | undefined) => section?.tags ?? [])),
  ];
  return normalizeTagList(tags);
};

const hasUniqueGlobalTag = (unitId: string, explicitTags?: ReadonlyArray<string> | null): boolean => {
  const directTags = normalizeTagList(explicitTags ?? []);
  if (directTags.includes(UNIQUE_GLOBAL_TAG)) return true;
  return collectSkillTags(unitId).includes(UNIQUE_GLOBAL_TAG);
};

export function isCampaignMode(game: SessionState | null | undefined): boolean {
  return normalizeModeKey(game?.modeKey) === 'campaign';
}

export function isUniqueGlobalSummonBlocked(
  game: SessionState | null | undefined,
  params: { unitId: string | null | undefined; tags?: ReadonlyArray<string> | null }
): boolean {
  const unitId = typeof params.unitId === 'string' ? params.unitId.trim() : '';
  if (!game || !isCampaignMode(game) || !unitId) return false;
  if (!hasUniqueGlobalTag(unitId, params.tags)) return false;
  return game.tokens.some((token) => token?.alive && token.id === unitId);
}
