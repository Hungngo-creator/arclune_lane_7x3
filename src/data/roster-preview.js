// @ts-check
import { CLASS_BASE, RANK_MULT, ROSTER } from '../catalog.js';

/** @typedef {import('../../types/game-entities').CatalogStatBlock} CatalogStatBlock */
/** @typedef {import('../../types/game-entities').RosterPreview} RosterPreview */
/** @typedef {import('../../types/game-entities').RosterPreviewRow} RosterPreviewRow */
/** @typedef {import('../../types/game-entities').RosterUnitDefinition} RosterUnitDefinition */announcements.js

// Talent Point (TP) deltas documented in "ý tưởng nhân vật v3.txt".
export const TP_DELTA = Object.freeze({
  HP: 20,
  ATK: 1,
  WIL: 1,
  ARM: 0.01,
  RES: 0.01,
  AGI: 1,
  PER: 1,
  AEmax: 10,
  AEregen: 0.5,
  HPregen: 2
});

const STAT_ORDER = /** @satisfies ReadonlyArray<string> */ ([
  'HP',
  'ATK',
  'WIL',
  'ARM',
  'RES',
  'AGI',
  'PER',
  'SPD',
  'AEmax',
  'AEregen',
  'HPregen'
]);

const PRECISION = {
  ARM: 100,
  RES: 100,
  SPD: 100,
  AEregen: 10
};

/**
 * @param {string} stat
 * @param {number} value
 */
function roundStat(stat, value) {
  const precision = PRECISION[stat] ?? 1;
  return Math.round(value * precision) / precision;
}

/**
 * @param {number} value
 */
function roundTpValue(value) {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * @param {Record<string, number | null | undefined>} [tpAlloc]
 * @returns {Record<string, number>}
 */
function sanitizeTpAllocation(tpAlloc = {}) {
  const clean = {};
  for (const [stat, value] of Object.entries(tpAlloc)) {
    if (!TP_DELTA[stat]) continue;
    const rounded = roundTpValue(value ?? 0);
    if (rounded !== 0) {
      clean[stat] = rounded;
    }
  }
  return clean;
}

/**
 * @param {CatalogStatBlock} base
 * @param {Record<string, number | null | undefined>} [tpAlloc]
 * @returns {CatalogStatBlock}
 */
export function applyTpToBase(base, tpAlloc = {}) {
  const cleanTp = sanitizeTpAllocation(tpAlloc);
  const out = {};
  for (const [stat, baseValue] of Object.entries(base)) {
    const delta = TP_DELTA[stat];
    if (delta) {
      const tp = cleanTp[stat] ?? 0;
      out[stat] = baseValue + delta * tp;
    } else {
      out[stat] = baseValue;
    }
  }
  return out;
}

/**
 * @param {keyof typeof RANK_MULT} rank
 * @returns {number}
 */
function getRankMultiplier(rank) {
  const multiplier = RANK_MULT[rank];
  if (multiplier === undefined) {
    throw new Error(`Missing rank multiplier for "${rank}"`);
  }
  return multiplier;
}

/**
 * @param {CatalogStatBlock} preRank
 * @param {keyof typeof RANK_MULT} rank
 * @returns {CatalogStatBlock}
 */
export function applyRankMultiplier(preRank, rank) {
  const multiplier = getRankMultiplier(rank);
  const out = {};
  for (const [stat, value] of Object.entries(preRank)) {
    if (stat === 'SPD') {
      out[stat] = roundStat(stat, value);
      continue;
    }
    out[stat] = roundStat(stat, value * multiplier);
  }
  return out;
}

/**
 * @param {keyof typeof CLASS_BASE} className
 * @param {keyof typeof RANK_MULT} rank
 * @param {Record<string, number | null | undefined>} [tpAlloc]
 * @returns {CatalogStatBlock}
 */
export function computeFinalStats(className, rank, tpAlloc = {}) {
  const base = CLASS_BASE[className];
  if (!base) {
    throw new Error(`Unknown class "${className}"`);
  }
  const preRank = applyTpToBase(base, tpAlloc);
  return applyRankMultiplier(preRank, rank);
}

/**
 * @param {CatalogStatBlock} base
 * @param {RosterUnitDefinition['mods']} [mods]
 * @returns {Record<string, number>}
 */
export function deriveTpFromMods(base, mods = {}) {
  if (!mods) return {};
  const tp = {};
  for (const [stat, modValue] of Object.entries(mods)) {
    if (!TP_DELTA[stat]) continue;
    const baseValue = base[stat];
    if (typeof baseValue !== 'number') continue;
    const raw = (baseValue * (modValue ?? 0)) / TP_DELTA[stat];
    const rounded = roundTpValue(raw);
    if (rounded !== 0) {
      tp[stat] = rounded;
    }
  }
  return tp;
}

/**
 * @param {Record<string, number>} [tpAlloc]
 */
function totalTp(tpAlloc = {}) {
  return roundTpValue(
    Object.values(tpAlloc).reduce((sum, value) => sum + value, 0)
  );
}

/**
 * @param {Record<string, Record<string, number>> | undefined} [tpAllocations]
 * @returns {Record<string, RosterPreview>}
 */
export function buildRosterPreviews(tpAllocations = undefined) {
  /** @type {Record<string, RosterPreview>} */
  const result = {};
    for (const unit of /** @type {ReadonlyArray<RosterUnitDefinition>} */ (ROSTER)) {
    const base = CLASS_BASE[unit.class];
    if (!base) continue;
    const derivedTp = tpAllocations?.[unit.id] ?? deriveTpFromMods(base, unit.mods);
    const cleanTp = sanitizeTpAllocation(derivedTp);
    const preRank = applyTpToBase(base, cleanTp);
    const multiplier = getRankMultiplier(unit.rank);
    const final = applyRankMultiplier(preRank, unit.rank);
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
export function buildPreviewRows(previews, statsOrder = STAT_ORDER) {
  return statsOrder.map((stat) => ({
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
    const base = CLASS_BASE[unit.class];
    return [unit.id, deriveTpFromMods(base, unit.mods)];
  })
);

export const ROSTER_PREVIEWS = buildRosterPreviews(ROSTER_TP_ALLOCATIONS);
export const ROSTER_PREVIEW_ROWS = buildPreviewRows(ROSTER_PREVIEWS);
export const STAT_KEYS = [...STAT_ORDER];