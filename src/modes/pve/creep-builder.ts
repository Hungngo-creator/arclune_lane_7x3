import { lookupUnit } from '../../units.ts';
import { mapUnitProgressById } from './collection-mapper.ts';

import type { PveDeckEntry } from '@shared-types/combat';
import type { CollectionStateInput, RuntimeUnitProgress } from '@shared-types/pve';

type RankStats = {
  rankCounts: Map<string, number>;
  totalRanked: number;
};

type ProgressProfile = {
  level?: number;
  realm?: number;
  subRealm?: number;
  className?: string;
};

const CREEP_KIT_ORDER = ['creep_1', 'creep_2', 'creep_3'] as const;
const CREEP_POWER_ORDER = ['creep_3', 'creep_2', 'creep_1'] as const;
const RANK_PRIORITY = ['N', 'R', 'SR', 'SSR', 'UR', 'PRIME'] as const;
const RANK_SET = new Set<string>(RANK_PRIORITY);
const RANK_PRIORITY_SCORE = new Map<string, number>(
  RANK_PRIORITY.map((rank, index) => [rank, index + 1]),
);

function normalizeRank(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const normalized = value.trim().toUpperCase();
  return RANK_SET.has(normalized) ? normalized : normalized;
}

function readEntryRank(entry: PveDeckEntry): string | null {
  const explicitRank = normalizeRank(entry.rank);
  if (explicitRank) return explicitRank;
  return normalizeRank(lookupUnit(entry.id)?.rank);
}

function collectRankStats(lineup: ReadonlyArray<PveDeckEntry>): RankStats {
  const rankCounts = new Map<string, number>();
  for (const entry of lineup) {
    const rank = readEntryRank(entry);
    if (!rank) continue;
    rankCounts.set(rank, (rankCounts.get(rank) ?? 0) + 1);
  }
  const totalRanked = Array.from(rankCounts.values()).reduce((sum, count) => sum + count, 0);
  return { rankCounts, totalRanked };
}

function compareRankDesc(left: string, right: string): number {
  const leftScore = RANK_PRIORITY_SCORE.get(left) ?? 0;
  const rightScore = RANK_PRIORITY_SCORE.get(right) ?? 0;
  if (leftScore !== rightScore) return rightScore - leftScore;
  return left.localeCompare(right);
}

function allocateRanksForCreeps(rankStats: RankStats, creepCount: number): string[] {
  const entries = Array.from(rankStats.rankCounts.entries());
  if (!entries.length || rankStats.totalRanked <= 0) return [];

  const provisional = entries.map(([rank, count]) => {
    const exact = (count * creepCount) / rankStats.totalRanked;
    return { rank, base: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });

  let assigned = provisional.reduce((sum, entry) => sum + entry.base, 0);
  provisional.sort((a, b) => {
    if (b.remainder !== a.remainder) return b.remainder - a.remainder;
    return compareRankDesc(a.rank, b.rank);
  });
  for (const entry of provisional) {
    if (assigned >= creepCount) break;
    entry.base += 1;
    assigned += 1;
  }

  const highestRank = entries.map(([rank]) => rank).sort(compareRankDesc)[0] ?? null;
  if (highestRank) {
    const highestBucket = provisional.find((entry) => entry.rank === highestRank);
    if (highestBucket && highestBucket.base <= 0) {
      const donor = provisional
        .filter((entry) => entry.rank !== highestRank && entry.base > 0)
        .sort((a, b) => {
          if (a.base !== b.base) return b.base - a.base;
          return compareRankDesc(b.rank, a.rank);
        })[0];
      if (donor) {
        donor.base -= 1;
        highestBucket.base += 1;
      }
    }
  }

  const ranked: string[] = [];
  for (const entry of provisional) {
    for (let i = 0; i < entry.base && ranked.length < creepCount; i += 1) {
      ranked.push(entry.rank);
    }
  }
  ranked.sort(compareRankDesc);
  return ranked.slice(0, creepCount);
}

function mapLineupProgress(
  lineup: ReadonlyArray<PveDeckEntry>,
  progressById: ReadonlyMap<string, RuntimeUnitProgress>,
): ProgressProfile[] {
  const profiles: ProgressProfile[] = [];
  for (const entry of lineup) {
    const progress = progressById.get(entry.id);
    if (!progress) continue;
    profiles.push({
      level: typeof progress.level === 'number' ? progress.level : undefined,
      realm: typeof progress.realm === 'number' ? progress.realm : undefined,
      subRealm: typeof progress.subRealm === 'number' ? progress.subRealm : undefined,
      className: typeof entry.class === 'string' && entry.class.trim() ? entry.class : undefined,
    });
  }
  return profiles;
}

function progressScore(profile: ProgressProfile): number {
  const level = typeof profile.level === 'number' ? profile.level : 0;
  const realm = typeof profile.realm === 'number' ? profile.realm : 0;
  const subRealm = typeof profile.subRealm === 'number' ? profile.subRealm : 0;
  return (realm * 10000) + (subRealm * 100) + level;
}

function allocateProgressForCreeps(profiles: ReadonlyArray<ProgressProfile>, creepCount: number): ProgressProfile[] {
  if (!profiles.length) return Array.from({ length: creepCount }, () => ({}));
  const sorted = [...profiles].sort((a, b) => progressScore(b) - progressScore(a));
  const output: ProgressProfile[] = [];
  for (let i = 0; i < creepCount; i += 1) {
    output.push(sorted[Math.min(i, sorted.length - 1)] ?? {});
  }
  return output;
}

export function buildAICreepDeckFromLineup(params: {
  lineup: ReadonlyArray<PveDeckEntry>;
  collectionState?: CollectionStateInput | null;
}): PveDeckEntry[] {
  const lineup = Array.isArray(params.lineup) ? params.lineup : [];
  const creepCount = CREEP_KIT_ORDER.length;
  const allocatedRanks = allocateRanksForCreeps(collectRankStats(lineup), creepCount);

  const progressById = mapUnitProgressById(params.collectionState ?? null);
  const allocatedProgress = allocateProgressForCreeps(mapLineupProgress(lineup, progressById), creepCount);

  const rankByCreepId = new Map<string, string | null>();
  CREEP_POWER_ORDER.forEach((creepId, index) => {
    rankByCreepId.set(creepId, allocatedRanks[index] ?? null);
  });

  return CREEP_KIT_ORDER.map((creepId) => {
    const unitDef = lookupUnit(creepId);
    const powerIndex = CREEP_POWER_ORDER.indexOf(creepId);
    const profile = allocatedProgress[powerIndex] ?? {};
    const rank = rankByCreepId.get(creepId);
    return {
      id: creepId,
      name: unitDef?.name ?? creepId,
      cost: Number.isFinite(unitDef?.cost) ? Number(unitDef?.cost) : 0,
      dynamicRankSource: 'lineup',
      dynamicLevelSource: 'lineup',
      ...(rank ? { rank } : {}),
      ...(typeof profile.level === 'number' ? { level: Math.max(1, Math.floor(profile.level)) } : {}),
      ...(typeof profile.realm === 'number' ? { realm: Math.max(0, Math.floor(profile.realm)) } : {}),
      ...(typeof profile.subRealm === 'number' ? { subRealm: Math.max(0, Math.floor(profile.subRealm)) } : {}),
      ...(typeof profile.className === 'string' && profile.className.trim() ? { class: profile.className } : {}),
    } satisfies PveDeckEntry;
  });
}
