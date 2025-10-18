import { CLASS_BASE, RANK_MULT, ROSTER } from '../catalog.js';

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

const STAT_ORDER = [
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
];

const PRECISION = {
  ARM: 100,
  RES: 100,
  SPD: 100,
  AEregen: 10
};

function roundStat(stat, value) {
  const precision = PRECISION[stat] ?? 1;
  return Math.round(value * precision) / precision;
}

function roundTpValue(value) {
  return Math.round(value * 1e6) / 1e6;
}

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

function getRankMultiplier(rank) {
  const multiplier = RANK_MULT[rank];
  if (multiplier === undefined) {
    throw new Error(`Missing rank multiplier for "${rank}"`);
  }
  return multiplier;
}

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

export function computeFinalStats(className, rank, tpAlloc = {}) {
  const base = CLASS_BASE[className];
  if (!base) {
    throw new Error(`Unknown class "${className}"`);
  }
  const preRank = applyTpToBase(base, tpAlloc);
  return applyRankMultiplier(preRank, rank);
}

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

function totalTp(tpAlloc = {}) {
  return roundTpValue(
    Object.values(tpAlloc).reduce((sum, value) => sum + value, 0)
  );
}

export function buildRosterPreviews(tpAllocations = undefined) {
  const result = {};
  for (const unit of ROSTER) {
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