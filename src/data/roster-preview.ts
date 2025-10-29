import { z } from 'zod';

import { CLASS_BASE, RANK_MULT, ROSTER } from '../catalog.ts';
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

function roundStat(stat: string, value: number) {
  const precision = PRECISION[stat] ?? 1;
  return Math.round(value * precision) / precision;
}

function roundTpValue(value: number) {
  return Math.round(value * 1e6) / 1e6;
}

function sanitizeTpAllocation(tpAlloc: Record<string, number | null | undefined> = {}) {
  const clean: Record<string, number> = {};
  for (const [stat, value] of Object.entries(tpAlloc)) {
    if (!(stat in TP_DELTA)) continue;
    const rounded = roundTpValue(value ?? 0);
    if (rounded !== 0) {
      clean[stat] = rounded;
    }
  }
  return clean;
}

export function applyTpToBase(
  base: CatalogStatBlock,
  tpAlloc: Record<string, number | null | undefined> = {}
): CatalogStatBlock {
  const cleanTp = sanitizeTpAllocation(tpAlloc);
  const out: CatalogStatBlock = { ...base };
  for (const [stat, baseValue] of Object.entries(base) as Array<[string, number]>) {
    const delta = TP_DELTA[stat];
    if (delta) {
      const tp = cleanTp[stat] ?? 0;
      out[stat] = (baseValue ?? 0) + delta * tp;
    } else {
      out[stat] = baseValue;
    }
  }
  return out;
}

function getRankMultiplier(rank: keyof typeof RANK_MULT) {
  const multiplier = RANK_MULT[rank];
  if (multiplier === undefined) {
    throw new Error(`Missing rank multiplier for "${rank}"`);
  }
  return multiplier;
}

export function applyRankMultiplier(preRank: CatalogStatBlock, rank: keyof typeof RANK_MULT): CatalogStatBlock {
  const multiplier = getRankMultiplier(rank);
  const out: CatalogStatBlock = { ...preRank };
  for (const [stat, value] of Object.entries(preRank) as Array<[string, number]>) {
    if (stat === 'SPD') {
      out[stat] = roundStat(stat, value ?? 0);
      continue;
    }
    out[stat] = roundStat(stat, (value ?? 0) * multiplier);
  }
  return out;
}

export function computeFinalStats(
  className: keyof typeof CLASS_BASE,
  rank: keyof typeof RANK_MULT,
  tpAlloc: Record<string, number | null | undefined> = {}
): CatalogStatBlock {
  const base = CLASS_BASE[className];
  if (!base) {
    throw new Error(`Unknown class "${className}"`);
  }
  const preRank = applyTpToBase(base, tpAlloc);
  return applyRankMultiplier(preRank, rank);
}

export function deriveTpFromMods(
  base: CatalogStatBlock,
  mods: RosterUnitDefinition['mods'] = {}
): Record<string, number> {
  if (!mods) return {};
  const tp: Record<string, number> = {};
  for (const [stat, modValue] of Object.entries(mods)) {
    if (!(stat in TP_DELTA)) continue;
    const baseValue = base[stat];
    if (typeof baseValue !== 'number') continue;
    const delta = TP_DELTA[stat];
    const raw = delta ? (baseValue * (modValue ?? 0)) / delta : 0;
    const rounded = roundTpValue(raw);
    if (rounded !== 0) {
      tp[stat] = rounded;
    }
  }
  return tp;
}

function totalTp(tpAlloc: Record<string, number> = {}) {
  return roundTpValue(
    Object.values(tpAlloc).reduce((sum, value) => sum + value, 0)
  );
}

export function buildRosterPreviews(
  tpAllocations: Record<string, Record<string, number>> | undefined = undefined
): Record<string, RosterPreview> {
  const result: Record<string, RosterPreview> = {};
  for (const unit of ROSTER as ReadonlyArray<RosterUnitDefinition>) {
    const base = CLASS_BASE[unit.class as keyof typeof CLASS_BASE];
    if (!base) continue;
    const derivedTp = tpAllocations?.[unit.id] ?? deriveTpFromMods(base, unit.mods);
    const cleanTp = sanitizeTpAllocation(derivedTp);
    const preRank = applyTpToBase(base, cleanTp);
    const rankKey = unit.rank as keyof typeof RANK_MULT;
    const multiplier = getRankMultiplier(rankKey);
    const final = applyRankMultiplier(preRank, rankKey);
    result[unit.id] = {
      id: unit.id,
      name: unit.name,
      class: unit.class,
      rank: unit.rank,
      rankMultiplier: multiplier,
      tp: cleanTp,
      totalTP: totalTp(cleanTp),
      preRank,
      final
    };
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
    values: ROSTER.map((unit) => {
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

export const ROSTER_TP_ALLOCATIONS = Object.fromEntries(
  ROSTER.map((unit) => {
    const base = CLASS_BASE[unit.class as keyof typeof CLASS_BASE];
    return [unit.id, deriveTpFromMods(base, unit.mods)];
  })
) as Readonly<Record<string, Record<string, number>>>;

export const ROSTER_PREVIEWS = buildRosterPreviews(ROSTER_TP_ALLOCATIONS);
export const ROSTER_PREVIEW_ROWS = buildPreviewRows(ROSTER_PREVIEWS);
export const STAT_KEYS = [...STAT_ORDER];