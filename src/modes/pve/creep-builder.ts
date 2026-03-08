import { lookupUnit } from '../../units.ts';
import { mapUnitProgressById } from './collection-mapper.ts';
import { normalizeClassName } from '../../utils/domain-normalization.ts';

import type { PveDeckEntry } from '@shared-types/combat';
import type { CollectionStateInput, RuntimeUnitProgress } from '@shared-types/pve';

type ProgressProfile = {
  level?: number;
  realm?: number;
  subRealm?: number;
  className?: string;
};

type LineupSampling = {
  rankCounts: Map<string, number>;
  totalRanked: number;
  progressProfiles: ProgressProfile[];
};

type UnitRankCache = Map<string, string | null>;

type CreepUnitBase = {
  name: string;
  cost: number;
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
const CREEP_UNIT_BASE = new Map<string, CreepUnitBase>(
  CREEP_SLOT_ORDER.map(({ id }) => {
    const unitDef = lookupUnit(id);
    return [
      id,
      {
        name: unitDef?.name ?? id,
        cost: Number.isFinite(unitDef?.cost) ? Number(unitDef?.cost) : 0,
      },
    ] as const;
  }),
);

function normalizeRank(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const normalized = value.trim().toUpperCase();
  return normalized;
}

function sampleLineup(
  lineup: ReadonlyArray<PveDeckEntry>,
  progressById: ReadonlyMap<string, RuntimeUnitProgress>,
): LineupSampling {
  const rankCounts = new Map<string, number>();
  const rankByUnitId: UnitRankCache = new Map();
  const progressProfiles: ProgressProfile[] = [];
  let totalRanked = 0;

  for (const entry of lineup) {
    const directRank = normalizeRank(entry.rank);
    let fallbackRank = rankByUnitId.get(entry.id) ?? null;
    if (!rankByUnitId.has(entry.id)) {
      fallbackRank = normalizeRank(lookupUnit(entry.id)?.rank);
      rankByUnitId.set(entry.id, fallbackRank);
    }
    const rank = directRank ?? fallbackRank;
    if (!rank) continue;
    rankCounts.set(rank, (rankCounts.get(rank) ?? 0) + 1);
    totalRanked += 1;

    const progress = progressById.get(entry.id);
    if (!progress) continue;
    progressProfiles.push({
      level: typeof progress.level === 'number' ? progress.level : undefined,
      realm: typeof progress.realm === 'number' ? progress.realm : undefined,
      subRealm: typeof progress.subRealm === 'number' ? progress.subRealm : undefined,
      className: normalizeClassName(entry.class) ?? undefined,
    });
  }
  return { rankCounts, totalRanked, progressProfiles };
}

function compareRankDesc(left: string, right: string): number {
  const leftScore = RANK_PRIORITY_SCORE.get(left) ?? 0;
  const rightScore = RANK_PRIORITY_SCORE.get(right) ?? 0;
  if (leftScore !== rightScore) return rightScore - leftScore;
  return left.localeCompare(right);
}

function allocateRanksForCreeps(rankStats: Pick<LineupSampling, 'rankCounts' | 'totalRanked'>, creepCount: number): string[] {
  const entries = Array.from(rankStats.rankCounts.entries());
  if (!entries.length || rankStats.totalRanked <= 0) return [];

  const provisional = entries.map(([rank, count]) => {
    const exact = (count * creepCount) / rankStats.totalRanked;
    const base = Math.floor(exact);
    return { rank, base, remainder: exact - base };
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

  let highestRank: string | null = null;
  for (const [rank] of entries) {
    if (highestRank == null || compareRankDesc(rank, highestRank) < 0) {
      highestRank = rank;
    }
  }

  if (highestRank) {
    let highestBucket: (typeof provisional)[number] | null = null;
    let donor: (typeof provisional)[number] | null = null;
    for (const entry of provisional) {
      if (entry.rank === highestRank) {
        highestBucket = entry;
        continue;
      }
      if (entry.base <= 0) continue;
      if (!donor) {
        donor = entry;
        continue;
      }
    if (entry.base > donor.base || (entry.base === donor.base && compareRankDesc(donor.rank, entry.rank) < 0)) {
        donor = entry;
      }
    }

    if (highestBucket && highestBucket.base <= 0 && donor) {
      donor.base -= 1;
      highestBucket.base += 1;
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
  const unitBase = CREEP_UNIT_BASE.get(creepId) ?? { name: creepId, cost: 0 };
  const level = clampInteger(profile.level, 1);
  const realm = clampInteger(profile.realm, 0);
  const subRealm = clampInteger(profile.subRealm, 0);
  const className = normalizeClassName(profile.className);

  return {
    id: creepId,
    name: unitBase.name,
    cost: unitBase.cost,
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
  const lineupSampling = sampleLineup(lineup, progressById);
  const rankStats = {
    rankCounts: lineupSampling.rankCounts,
    totalRanked: lineupSampling.totalRanked,
  };
  const allocatedRanks = allocateRanksForCreeps(rankStats, creepCount);
  const allocatedProgress = allocateProgressForCreeps(lineupSampling.progressProfiles, creepCount);

  return CREEP_SLOT_ORDER.map((creep) => {
    const creepId = creep.id;
    const profile = allocatedProgress[creep.powerSlot] ?? {};
    const rank = allocatedRanks[creep.powerSlot] ?? null;
    return toCreepDeckEntry({ creepId, profile, rank });
  });
}
