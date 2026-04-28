import { z } from 'zod';

import { CLASS_BASE, RANK_MULT, ROSTER } from '../catalog.ts';
import { assertDefined } from '../utils/assert.ts';
import rawRosterPreviewConfig from './roster-preview.config.ts';

import type {
  CatalogStatBlock,
  RosterPreview,
  RosterPreviewRow,
  RosterUnitDefinition
} from '@shared-types/config';

const RosterPreviewConfigSchema = z.object({
  tpDelta: z.record(z.number()),
  statOrder: z.array(z.string()),
  precision: z.record(z.number())
});

const rosterPreviewConfig = RosterPreviewConfigSchema.parse(rawRosterPreviewConfig);

// Talent Point (TP) deltas documented trong "ý tưởng nhân vật v3.txt".
export const TP_DELTA: Readonly<Record<string, number>> = Object.freeze({
  ...rosterPreviewConfig.tpDelta
});

const STAT_ORDER: ReadonlyArray<string> = Object.freeze([
  ...rosterPreviewConfig.statOrder
]);

const PRECISION: Readonly<Record<string, number>> = Object.freeze({
  ...rosterPreviewConfig.precision
});
const ROSTER_PREVIEW_META = Object.freeze(
  ROSTER.map((unit) => ({ id: unit.id, name: unit.name }))
);
const hasTpDelta = (stat: string): boolean => typeof TP_DELTA[stat] === 'number';
const getTpDelta = (stat: string): number => TP_DELTA[stat] ?? 0;
const isNonZero = (value: number): boolean => value !== 0;

function roundStat(stat: string, value: number) {
  const precision = PRECISION[stat] ?? 1;
  return Math.round(value * precision) / precision;
}

const TP_ROUND_FACTOR = 1e6;

function roundTpValue(value: number) {
  return Math.round(value * TP_ROUND_FACTOR) / TP_ROUND_FACTOR;
}

function getClassBase(className: string | null | undefined): CatalogStatBlock {
  const normalized = String(className ?? '') as keyof typeof CLASS_BASE;
  return assertDefined(CLASS_BASE[normalized], `Unknown class "${className ?? ''}"`);
}

function sanitizeTpAllocation(tpAlloc: Record<string, number | null | undefined> = {}) {
  const clean: Record<string, number> = {};
  for (const [stat, value] of Object.entries(tpAlloc)) {
    if (!hasTpDelta(stat)) continue;
    const rounded = roundTpValue(value ?? 0);
    if (isNonZero(rounded)) {
      clean[stat] = rounded;
    }
  }
  return clean;
}

function mapStatBlock(
  stats: CatalogStatBlock,
  transform: (stat: string, value: number) => number,
): CatalogStatBlock {
  const out: CatalogStatBlock = {};
  for (const [stat, value] of Object.entries(stats) as Array<[string, number]>) {
    out[stat] = transform(stat, value ?? 0);
  }
  return out;
}

function applyTpDelta(base: CatalogStatBlock, cleanTp: Record<string, number>): CatalogStatBlock {
  return mapStatBlock(base, (stat, baseValue) => {
    const delta = getTpDelta(stat);
    if (delta) {
      return baseValue + delta * (cleanTp[stat] ?? 0);
    }
   return baseValue;
  });
}

export function applyTpToBase(
  base: CatalogStatBlock,
  tpAlloc: Record<string, number | null | undefined> = {}
): CatalogStatBlock {
  return applyTpDelta(base, sanitizeTpAllocation(tpAlloc));
}

function getRankMultiplier(rank: keyof typeof RANK_MULT) {
  return assertDefined(
    RANK_MULT[rank],
    `Missing rank multiplier for "${rank}"`
  );
}

export function applyRankMultiplier(preRank: CatalogStatBlock, rank: keyof typeof RANK_MULT): CatalogStatBlock {
  const multiplier = getRankMultiplier(rank);
  return mapStatBlock(preRank, (stat, value) => {
    if (stat === 'SPD') {
      return roundStat(stat, value);
    }
    return roundStat(stat, value * multiplier);
  });
}

function computePreviewStats(
  base: CatalogStatBlock,
  rank: keyof typeof RANK_MULT,
  tpAlloc: Record<string, number | null | undefined>,
): { preRank: CatalogStatBlock; final: CatalogStatBlock } {
  const preRank = applyTpToBase(base, tpAlloc);
  return {
    preRank,
    final: applyRankMultiplier(preRank, rank),
  };
}

export function computeFinalStats(
  className: keyof typeof CLASS_BASE,
  rank: keyof typeof RANK_MULT,
  tpAlloc: Record<string, number | null | undefined> = {}
): CatalogStatBlock {
  const base = getClassBase(className);
  return computePreviewStats(base, rank, tpAlloc).final;
}

export function deriveTpFromMods(
  base: CatalogStatBlock,
  mods: RosterUnitDefinition['mods'] = {}
): Record<string, number> {
  if (!mods) return {};
  const rawTp: Record<string, number> = {};
  for (const [stat, modValue] of Object.entries(mods) as Array<[string, number | null | undefined]>) {
    if (!hasTpDelta(stat)) continue;
    const baseValue = base[stat];
    if (typeof baseValue !== 'number') continue;
    const delta = getTpDelta(stat) || 1;
    const raw = (baseValue * (modValue ?? 0)) / delta;
    if (isNonZero(raw)) {
      rawTp[stat] = raw;
    }
  }
  return sanitizeTpAllocation(rawTp);
}

function totalTp(tpAlloc: Record<string, number> = {}) {
  return roundTpValue(
    Object.values(tpAlloc).reduce((sum, value) => sum + value, 0)
  );
}

function resolveUnitTpAllocation(
  unit: RosterUnitDefinition,
  base: CatalogStatBlock,
  providedAllocations?: Record<string, Record<string, number>>,
): Record<string, number> {
  const derivedTp = providedAllocations?.[unit.id];
  if (derivedTp){
    return sanitizeTpAllocation(derivedTp);
  }
  return deriveTpFromMods(base, unit.mods);
}
function resolvePreviewForUnit(
  unit: RosterUnitDefinition,
  tpAllocations?: Record<string, Record<string, number>>,
): RosterPreview {
  const base = getClassBase(unit.class);
  const cleanTp = resolveUnitTpAllocation(unit, base, tpAllocations);
  const rankKey = unit.rank as keyof typeof RANK_MULT;
  const { preRank, final } = computePreviewStats(base, rankKey, cleanTp);
  return {
    id: unit.id,
    name: unit.name,
    class: unit.class,
    rank: unit.rank,
    rankMultiplier: getRankMultiplier(rankKey),
    tp: cleanTp,
    totalTP: totalTp(cleanTp),
    preRank,
    final,
  };
}

export function buildRosterPreviews(
  tpAllocations?: Record<string, Record<string, number>>
): Record<string, RosterPreview> {
  const result: Record<string, RosterPreview> = {};
  for (const unit of ROSTER as ReadonlyArray<RosterUnitDefinition>) {
    result[unit.id] = resolvePreviewForUnit(unit, tpAllocations);
  }
  return result;
}

/**
 * @param {Record<string, RosterPreview>} previews
 * @param {ReadonlyArray<string>} [statsOrder]
 * @returns {RosterPreviewRow[]}
 */
export function buildPreviewRows(
  previews: Record<string, RosterPreview>,
  statsOrder: ReadonlyArray<string> = STAT_ORDER
): RosterPreviewRow[] {
  return statsOrder.map((stat): RosterPreviewRow => ({
    stat,
    values: ROSTER_PREVIEW_META.map((unit) => {
      const preview = previews[unit.id];
      return {
        id: unit.id,
        name: unit.name,
        value: preview?.final?.[stat] ?? null,
        preRank: preview?.preRank?.[stat] ?? null,
        tp: preview?.tp?.[stat] ?? 0
      };
    })
  }));
}

export const ROSTER_TP_ALLOCATIONS: Readonly<Record<string, Record<string, number>>> = Object.freeze(
  ROSTER.reduce<Record<string, Record<string, number>>>((acc, unit) => {
    acc[unit.id] = resolveUnitTpAllocation(unit, getClassBase(unit.class));
    return acc;
  }, {})
);

export const ROSTER_PREVIEWS = buildRosterPreviews(ROSTER_TP_ALLOCATIONS);
export const ROSTER_PREVIEW_ROWS = buildPreviewRows(ROSTER_PREVIEWS);
export const STAT_KEYS = Object.freeze([...STAT_ORDER]);