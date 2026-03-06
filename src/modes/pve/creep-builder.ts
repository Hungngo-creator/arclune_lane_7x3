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

const CREEP_SLOT_ORDER = [
  { id: 'creep_1', powerSlot: 2 },
  { id: 'creep_2', powerSlot: 1 },
  { id: 'creep_3', powerSlot: 0 },
] as const;
const RANK_PRIORITY = ['N', 'R', 'SR', 'SSR', 'UR', 'PRIME'] as const;
const RANK_PRIORITY_SCORE = new Map<string, number>(
  RANK_PRIORITY.map((rank, index) => [rank, index + 1]),
);

function normalizeRank(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const normalized = value.trim().toUpperCase();
  return normalized;
}

function collectRankStats(lineup: ReadonlyArray<PveDeckEntry>): RankStats {
  const rankCounts = new Map<string, number>();
  let totalRanked = 0;
  for (const entry of lineup) {
    const rank = normalizeRank(entry.rank) ?? normalizeRank(lookupUnit(entry.id)?.rank);
    if (!rank) continue;
    rankCounts.set(rank, (rankCounts.get(rank) ?? 0) + 1);
    totalRanked += 1;
  }
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

function collectLineupSignals(params: {
  lineup: ReadonlyArray<PveDeckEntry>;
  progressById: ReadonlyMap<string, RuntimeUnitProgress>;
}): { rankStats: RankStats; progressProfiles: ProgressProfile[] } {
  return {
    rankStats: collectRankStats(params.lineup),
    progressProfiles: mapLineupProgress(params.lineup, params.progressById),
  };
}

function clampInteger(value: unknown, min: number): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.max(min, Math.floor(value));
}

function toCreepDeckEntry(params: {
  creepId: string;
  profile: ProgressProfile;
  rank: string | null;
}): PveDeckEntry {
  const { creepId, profile, rank } = params;
  const unitDef = lookupUnit(creepId);
  const level = clampInteger(profile.level, 1);
  const realm = clampInteger(profile.realm, 0);
  const subRealm = clampInteger(profile.subRealm, 0);
  const className = typeof profile.className === 'string' && profile.className.trim()
    ? profile.className
    : null;

  return {
    id: creepId,
    name: unitDef?.name ?? creepId,
    cost: Number.isFinite(unitDef?.cost) ? Number(unitDef?.cost) : 0,
    dynamicRankSource: 'lineup',
    dynamicLevelSource: 'lineup',
    ...(rank ? { rank } : {}),
    ...(level != null ? { level } : {}),
    ...(realm != null ? { realm } : {}),
    ...(subRealm != null ? { subRealm } : {}),
    ...(className ? { class: className } : {}),
  } satisfies PveDeckEntry;
}

export function buildAICreepDeckFromLineup(params: {
  lineup: ReadonlyArray<PveDeckEntry>;
  collectionState?: CollectionStateInput | null;
  progressById?: ReadonlyMap<string, RuntimeUnitProgress> | null;
}): PveDeckEntry[] {
  const lineup = Array.isArray(params.lineup) ? params.lineup : [];
  const creepCount = CREEP_SLOT_ORDER.length;
  const progressById = params.progressById ?? mapUnitProgressById(params.collectionState ?? null);
  const lineupSignals = collectLineupSignals({ lineup, progressById });
  const allocatedRanks = allocateRanksForCreeps(lineupSignals.rankStats, creepCount);
  const allocatedProgress = allocateProgressForCreeps(lineupSignals.progressProfiles, creepCount);

  return CREEP_SLOT_ORDER.map((creep) => {
    const creepId = creep.id;
    const profile = allocatedProgress[creep.powerSlot] ?? {};
    const rank = allocatedRanks[creep.powerSlot] ?? null;
      return toCreepDeckEntry({ creepId, profile, rank });
  });
}
