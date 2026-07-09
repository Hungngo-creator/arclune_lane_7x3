import { lookupUnit } from '../../units.ts';
import { mapUnitProgressById, resolveRuntimeUnitStats } from './collection-mapper.ts';
import { applyCultivationBonus } from '../../cultivation.ts';
import { normalizeClassName } from '../../utils/domain-normalization.ts';

import type { PveDeckEntry } from '@shared-types/combat';
import type { CollectionStateInput, RuntimeUnitProgress } from '@shared-types/pve';

type RuntimeStatProfile = {
  hp?: number;
  hpMax?: number;
  atk?: number;
  wil?: number;
  arm?: number;
  res?: number;
  agi?: number;
  per?: number;
  aeMax?: number;
  aeRegen?: number;
  hpRegen?: number;
};

type ProgressProfile = {
  level?: number;
  realm?: number;
  subRealm?: number;
  stars?: number;
  className?: string;
  tp?: number;
  stats?: RuntimeStatProfile;
};

type LineupSampling = {
  rankCounts: Map<string, number>;
  totalRanked: number;
  progressProfiles: ProgressProfile[];
  costs: number[];
};

type UnitRankCache = Map<string, string | null>;
type UnitMetaCache = Map<string, { rank: string | null; cost: number | null; name: string | null }>;

type RankAllocation = {
  rank: string;
  base: number;
  remainder: number;
};

const CREEP_SLOT_ORDER = [
  { id: 'creep_1', powerSlot: 2 },
  { id: 'creep_2', powerSlot: 1 },
  { id: 'creep_3', powerSlot: 0 },
] as const;
const CREEP_POWER_SLOT_BY_ID = new Map<string, number>(
  CREEP_SLOT_ORDER.map((entry) => [entry.id, entry.powerSlot]),
);
const RANK_PRIORITY = ['N', 'R', 'SR', 'SSR', 'UR', 'PRIME'] as const;
const RANK_PRIORITY_SCORE = new Map<string, number>(
  RANK_PRIORITY.map((rank, index) => [rank, index + 1]),
);
const EMPTY_PROGRESS_BY_ID = new Map<string, RuntimeUnitProgress>();
const DEFAULT_EMPTY_PROFILE: Readonly<ProgressProfile> = Object.freeze({});
const DEFAULT_EMPTY_CREEP_DECK: ReadonlyArray<PveDeckEntry> = Object.freeze(
  CREEP_SLOT_ORDER.map((creep) => ({
    id: creep.id,
    name: lookupUnit(creep.id)?.name ?? creep.id,
    cost: 1,
    dynamicRankSource: 'lineup',
    dynamicLevelSource: 'lineup',
  } satisfies PveDeckEntry)),
);

function normalizeRank(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const normalized = value.trim().toUpperCase();
  return normalized;
}

function resolveRuntimeStatProfile(
  unitId: string,
  progressById: ReadonlyMap<string, RuntimeUnitProgress>,
): RuntimeStatProfile {
  const progress = progressById.get(unitId);
  const baseStats = resolveRuntimeUnitStats(unitId, progressById);
  const stats = applyCultivationBonus({
    ...baseStats,
    id: unitId,
    hasCultivationData: progressById.has(unitId),
    realm: progress?.realm,
    subRealm: progress?.subRealm,
  });
  return {
    hp: stats.hp,
    hpMax: stats.hpMax,
    atk: stats.atk,
    wil: stats.wil,
    arm: stats.arm,
    res: stats.res,
    agi: stats.agi,
    per: stats.per,
    aeMax: stats.aeMax,
    aeRegen: stats.aeRegen,
    hpRegen: stats.hpRegen,
  };
}

function sampleLineup(
  lineup: ReadonlyArray<PveDeckEntry>,
  progressById: ReadonlyMap<string, RuntimeUnitProgress>,
  unitMetaById: UnitMetaCache,
): LineupSampling {
  const rankCounts = new Map<string, number>();
  const rankByUnitId: UnitRankCache = new Map();
  const progressProfiles: ProgressProfile[] = [];
  const costs: number[] = [];
  let totalRanked = 0;

  const getUnitMeta = (unitId: string): { rank: string | null; cost: number | null; name: string | null } => {
    const cached = unitMetaById.get(unitId);
    if (cached) return cached;
    const unit = lookupUnit(unitId);
    const next = {
      rank: normalizeRank(unit?.rank),
      cost: Number.isFinite(unit?.cost) ? Number(unit?.cost) : null,
      name: typeof unit?.name === 'string' && unit.name ? unit.name : null,
    };
    unitMetaById.set(unitId, next);
    return next;
  };

  for (const entry of lineup) {
    const directRank = normalizeRank(entry.rank);
    let fallbackRank = rankByUnitId.get(entry.id) ?? null;
    if (!rankByUnitId.has(entry.id)) {
      fallbackRank = getUnitMeta(entry.id).rank;
      rankByUnitId.set(entry.id, fallbackRank);
    }
    const rank = directRank ?? fallbackRank;
    if (!rank) continue;
    rankCounts.set(rank, (rankCounts.get(rank) ?? 0) + 1);
    totalRanked += 1;

    const cost = Number.isFinite(entry.cost) ? Number(entry.cost) : getUnitMeta(entry.id).cost;
    if (typeof cost === 'number' && Number.isFinite(cost) && cost > 0) costs.push(Math.floor(cost));

    const progress = progressById.get(entry.id);
    const progressRecord = progress as Record<string, unknown> | undefined;
    const rawTp = progressRecord?.tp ?? (entry as Record<string, unknown>).tp;
    const parsedTp = Number.isFinite(rawTp) ? Number(rawTp) : undefined;
    progressProfiles.push({
      level: typeof progress?.level === 'number' ? progress.level : undefined,
      realm: typeof progress?.realm === 'number' ? progress.realm : undefined,
      subRealm: typeof progress?.subRealm === 'number' ? progress.subRealm : undefined,
      stars: typeof progress?.stars === 'number' ? progress.stars : undefined,
      className: normalizeClassName(entry.class) ?? undefined,
      tp: parsedTp,
      stats: resolveRuntimeStatProfile(entry.id, progressById),
    });
  }
  return { rankCounts, totalRanked, progressProfiles, costs };
}

function compareRankDesc(left: string, right: string): number {
  const leftScore = RANK_PRIORITY_SCORE.get(left) ?? 0;
  const rightScore = RANK_PRIORITY_SCORE.get(right) ?? 0;
  if (leftScore !== rightScore) return rightScore - leftScore;
  return left.localeCompare(right);
}

function pickHighestRank(ranks: ReadonlyArray<string>): string | null {
  let highest: string | null = null;
  for (const rank of ranks) {
    if (!highest || compareRankDesc(rank, highest) < 0) highest = rank;
  }
  return highest;
}

function pickDonorBucket(buckets: ReadonlyArray<RankAllocation>, highestRank: string): RankAllocation | null {
  let donor: RankAllocation | null = null;
  for (const bucket of buckets) {
    if (bucket.rank === highestRank || bucket.base <= 0) continue;
    if (!donor) {
      donor = bucket;
      continue;
    }
    if (bucket.base > donor.base || (bucket.base === donor.base && compareRankDesc(donor.rank, bucket.rank) < 0)) {
      donor = bucket;
    }
  }
  return donor;
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

  const highestRank = pickHighestRank(entries.map(([rank]) => rank));
  const highestBucket = highestRank
    ? provisional.find((entry) => entry.rank === highestRank) ?? null
    : null;
  const donor = highestRank ? pickDonorBucket(provisional, highestRank) : null;

  if (highestBucket && highestBucket.base <= 0 && donor) {
    donor.base -= 1;
    highestBucket.base += 1;
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
  const stars = typeof profile.stars === 'number' ? profile.stars : 0;
  const hpMax = typeof profile.stats?.hpMax === 'number' ? profile.stats.hpMax : 0;
  const atk = typeof profile.stats?.atk === 'number' ? profile.stats.atk : 0;
  const wil = typeof profile.stats?.wil === 'number' ? profile.stats.wil : 0;
  const defenses = ((typeof profile.stats?.arm === 'number' ? profile.stats.arm : 0)
    + (typeof profile.stats?.res === 'number' ? profile.stats.res : 0));
  return (hpMax * 0.18) + (atk * 4) + (wil * 3) + (defenses * 500) + (realm * 10000) + (subRealm * 100) + (stars * 220) + level;
}

function allocateProgressForCreeps(profiles: ReadonlyArray<ProgressProfile>, creepCount: number): ProgressProfile[] {
  if (!profiles.length) return Array.from({ length: creepCount }, () => DEFAULT_EMPTY_PROFILE);
  const sorted = [...profiles].sort((a, b) => progressScore(b) - progressScore(a));
  const output: ProgressProfile[] = [];
  for (let i = 0; i < creepCount; i += 1) {
    output.push(sorted[Math.min(i, sorted.length - 1)] ?? {});
  }
  return output;
}

function allocateCostsForCreeps(costs: ReadonlyArray<number>, creepCount: number): number[] {
  if (!costs.length) return Array.from({ length: creepCount }, () => 1);
  const sorted = [...costs]
    .map(value => Math.max(1, Math.floor(value)))
    .sort((a, b) => b - a);
  const output: number[] = [];
  for (let i = 0; i < creepCount; i += 1) {
    output.push(sorted[Math.min(i, sorted.length - 1)] ?? 1);
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
  cost: number;
  unitMetaById: UnitMetaCache;
}): PveDeckEntry {
  const { creepId, profile, rank, cost, unitMetaById } = params;
  const cachedMeta = unitMetaById.get(creepId);
  const unitName = cachedMeta?.name ?? lookupUnit(creepId)?.name ?? creepId;
  const level = clampInteger(profile.level, 1);
  const realm = clampInteger(profile.realm, 0);
  const subRealm = clampInteger(profile.subRealm, 0);
  const stars = clampInteger(profile.stars, 0);
  const className = normalizeClassName(profile.className);
  const statOverrides = profile.stats ? { ...profile.stats } : undefined;

  return {
    id: creepId,
    name: unitName,
    cost,
    dynamicRankSource: 'lineup',
    dynamicLevelSource: 'lineup',
    ...(rank ? { rank } : {}),
    ...(level != null ? { level } : {}),
    ...(realm != null ? { realm } : {}),
    ...(subRealm != null ? { subRealm } : {}),
    ...(stars != null ? { stars } : {}),
    ...(statOverrides ? { statOverrides, ...statOverrides } : {}),
    ...(className ? { class: className } : {}),
    ...(typeof profile.tp === 'number' ? { tp: profile.tp } : {}),
  } satisfies PveDeckEntry;
}

export function buildAICreepDeckFromLineup(params: {
  lineup: ReadonlyArray<PveDeckEntry>;
  collectionState?: CollectionStateInput | null;
  progressById?: ReadonlyMap<string, RuntimeUnitProgress> | null;
  creepIds?: ReadonlyArray<string> | null;
}): PveDeckEntry[] {
  const configuredCreepIds = Array.isArray(params.creepIds) && params.creepIds.length > 0
    ? params.creepIds.filter((value): value is string => typeof value === 'string' && value.trim() !== '')
    : null;
  const creepIds = configuredCreepIds && configuredCreepIds.length > 0
    ? configuredCreepIds
    : CREEP_SLOT_ORDER.map((entry) => entry.id);
  const lineup = Array.isArray(params.lineup) ? params.lineup : [];
  if (lineup.length === 0) {
    if (!configuredCreepIds || configuredCreepIds.length <= 0) {
      return DEFAULT_EMPTY_CREEP_DECK.map(entry => ({ ...entry }));
    }
    return creepIds.map((creepId) => ({
      id: creepId,
      name: lookupUnit(creepId)?.name ?? creepId,
      cost: 1,
      dynamicRankSource: 'lineup',
      dynamicLevelSource: 'lineup',
    } satisfies PveDeckEntry));
  }
  const creepCount = creepIds.length;
  const progressById = params.progressById
    ?? (lineup.length > 0
      ? mapUnitProgressById(params.collectionState ?? null)
      : EMPTY_PROGRESS_BY_ID);
  const unitMetaById: UnitMetaCache = new Map();
  const lineupSampling = sampleLineup(lineup, progressById, unitMetaById);
  const allocatedRanks = allocateRanksForCreeps(lineupSampling, creepCount);
  const allocatedProgress = allocateProgressForCreeps(lineupSampling.progressProfiles, creepCount);
  const allocatedCosts = allocateCostsForCreeps(lineupSampling.costs, creepCount);

  return creepIds.map((creepId) => {
    const powerSlot = CREEP_POWER_SLOT_BY_ID.get(creepId) ?? 0;
    const profile = allocatedProgress[powerSlot] ?? {};
    const rank = allocatedRanks[powerSlot] ?? null;
    const cost = allocatedCosts[powerSlot] ?? 1;
    return toCreepDeckEntry({
      creepId,
      profile,
      rank,
      cost,
      unitMetaById,
    });
  });
}
