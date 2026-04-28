export const COST_MIN = 7;
export const COST_MAX = 22;

export const RANK_MULTIPLIER: Readonly<Record<string, number>> = Object.freeze({
  N: 0.8,
  R: 0.85,
  SR: 0.95,
  SSR: 1.1,
  UR: 1.3,
  PRIME: 1.55,
});

export const RANK_COST_ANCHOR: Readonly<Record<string, number>> = Object.freeze({
  N: 7,
  R: 9,
  SR: 11,
  SSR: 14,
  UR: 18,
  PRIME: 21,
});

export interface SummonCostTagInput {
  hasRuleTag?: boolean;
  hasLawTag?: boolean;
  hasAoeFieldTag?: boolean;
  hasAbsoluteTag?: boolean;
  supportsAllyResource?: boolean;
  hasDivineNature?: boolean;
  longSetup?: boolean;
  hasFriendlyFireRisk?: boolean;
  hasRemovedRisk?: boolean;
  hasSelfHarmRisk?: boolean;
  hasVanishRisk?: boolean;
  isSupremePrime?: boolean;
}

export interface SummonCostInput extends SummonCostTagInput {
  rank: string;
}

export interface SummonCostResult {
  rank: string;
  multiplier: number;
  anchorCost: number;
  powerPoint: number;
  riskPoint: number;
  powerScore: number;
  riskScore: number;
  preClampCost: number;
  finalCost: number;
  needsSrRecheck: boolean;
}

export interface CostBudgetBreakdown {
  tagComplexity: number;
  battlefieldInfluence: number;
  economyPressure: number;
  scalingCeiling: number;
  tacticalFlexibility: number;
  setupPenalty: number;
  selfRiskPenalty: number;
  vanishRiskPenalty: number;
  consistencyPenalty: number;
  divineBonus: number;
  divinePenalty: number;
}

export interface CostBudgetInput {
  rank?: string;
  rankAnchorCost?: number;
  rankMultiplier?: number;
  tagComplexity?: number;
  battlefieldInfluence?: number;
  economyPressure?: number;
  scalingCeiling?: number;
  tacticalFlexibility?: number;
  setupPenalty?: number;
  selfRiskPenalty?: number;
  vanishRiskPenalty?: number;
  consistencyPenalty?: number;
  hasDivineNature?: boolean;
  divineSelfSustainBonus?: number;
}

export interface CostBudgetResult {
  powerScore: number;
  riskScore: number;
  netScore: number;
  cost: number;
  breakdown: CostBudgetBreakdown;
}

const SCORE_RANGES = {
  tagComplexity: [0, 6],
  battlefieldInfluence: [0, 6],
  economyPressure: [0, 4],
  scalingCeiling: [0, 4],
  tacticalFlexibility: [0, 4],
  setupPenalty: [0, 4],
  selfRiskPenalty: [0, 4],
  vanishRiskPenalty: [0, 4],
  consistencyPenalty: [0, 3],
  divineSelfSustainBonus: [0, 2],
} as const;
const SCORE_METRIC_KEYS = [
  'tagComplexity',
  'battlefieldInfluence',
  'economyPressure',
  'scalingCeiling',
  'tacticalFlexibility',
  'setupPenalty',
  'selfRiskPenalty',
  'vanishRiskPenalty',
  'consistencyPenalty',
] as const;
type ScoreKey = typeof SCORE_METRIC_KEYS[number];

const RANK_BUDGET_BASE: Readonly<Record<string, CostBudgetInput>> = Object.freeze({
  N: { tagComplexity: 0, battlefieldInfluence: 1, economyPressure: 0, scalingCeiling: 0, tacticalFlexibility: 1 },
  R: { tagComplexity: 1, battlefieldInfluence: 1, economyPressure: 0, scalingCeiling: 1, tacticalFlexibility: 1 },
  SR: { tagComplexity: 2, battlefieldInfluence: 2, economyPressure: 1, scalingCeiling: 2, tacticalFlexibility: 2 },
  SSR: { tagComplexity: 3, battlefieldInfluence: 3, economyPressure: 1, scalingCeiling: 2, tacticalFlexibility: 2 },
  UR: { tagComplexity: 4, battlefieldInfluence: 4, economyPressure: 2, scalingCeiling: 3, tacticalFlexibility: 3 },
  PRIME: { tagComplexity: 5, battlefieldInfluence: 5, economyPressure: 2, scalingCeiling: 4, tacticalFlexibility: 3 },
});

const ROLE_BUDGET_MOD: Readonly<Record<string, CostBudgetInput>> = Object.freeze({
  tanker: { setupPenalty: 1, tacticalFlexibility: 1 },
  warrior: { battlefieldInfluence: 1 },
  assassin: { scalingCeiling: 1, consistencyPenalty: 1 },
  mage: { battlefieldInfluence: 1, economyPressure: 1 },
  support: { tacticalFlexibility: 1, economyPressure: 1, setupPenalty: 1 },
  summoner: { tacticalFlexibility: 2, setupPenalty: 2, vanishRiskPenalty: 1 },
  ranger: { consistencyPenalty: 1, scalingCeiling: 1 },
});

const RANK_IDEAL_COST_RANGE: Readonly<Record<string, readonly [number, number]>> = Object.freeze({
  N: [7, 9],
  R: [9, 10],
  SR: [11, 13],
  SSR: [14, 17],
  UR: [18, 20],
  PRIME: [21, 22],
});

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)){
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

function normalizeRankKey(rank: string | null | undefined): string {
  return String(rank ?? '').trim().toUpperCase();
}

function resolveRankAnchorByKey(rankKey: string): number {
  return RANK_COST_ANCHOR[rankKey] ?? 12;
}

function resolveRankMultiplierByKey(rankKey: string): number {
  return RANK_MULTIPLIER[rankKey] ?? 0.95;
}

/**
 * V2 Summon Cost logic for manual balancing:
 * Cost = CostNeo(rank) + Σ(điểm cộng) - Σ(điểm trừ)
 * Sau đó clamp vào [7..22] (hoặc trần mở rộng với PRIME đặc biệt).
 *
 * Rank multiplier giữ vai trò hệ số tham chiếu khi so với hệ cũ,
 * không nhân trực tiếp vào cost neo để tránh làm loãng lợi thế kinh tế của bậc thấp.
 */
export function evaluateSummonCost(input: SummonCostInput): SummonCostResult {
  const rank = normalizeRankKey(input.rank);
  const anchorCost = resolveRankAnchorByKey(rank);
  const multiplier = resolveRankMultiplierByKey(rank);

  const powerPoint = (input.hasRuleTag ? 1 : 0)
    + (input.hasLawTag ? 1 : 0)
    + (input.hasAbsoluteTag ? 0.5 : 0)
    + (input.supportsAllyResource ? 0.75 : 0)
    + (input.hasAoeFieldTag ? 1 : 0);
  const riskPoint = (input.hasDivineNature ? 1 : 0)
    + (input.hasSelfHarmRisk ? 1 : 0)
    + (input.longSetup ? 1 : 0)
    + (input.hasVanishRisk ? 1 : 0)
    + (input.hasFriendlyFireRisk ? 1 : 0)
    + (input.hasRemovedRisk ? 1 : 0);

  const powerScore = powerPoint * 1.5;
  const riskScore = riskPoint * 3;
  const primeDivineAdjustment = rank === 'PRIME' && input.hasDivineNature ? 1 : 0;
  const preClampCost = anchorCost + powerScore - riskScore - primeDivineAdjustment;

  const hardCap = rank === 'PRIME' && input.isSupremePrime ? 30 : 22;
  let finalCost = Math.round(clamp(preClampCost, COST_MIN, hardCap));

  // Rule bảo vệ giá trị SR: nếu vượt ngưỡng SSR mà không đủ trần tag lõi, ép hạ cost.
  let needsSrRecheck = false;
  if (rank === 'SR' && finalCost > 15) {
    const hasCoreTopTags = Boolean(input.hasRuleTag && input.hasLawTag);
    if (!hasCoreTopTags) {
      finalCost = 15;
      needsSrRecheck = true;
    }
  }

  return {
    rank,
    multiplier,
    anchorCost,
    powerPoint,
    riskPoint,
    powerScore,
    riskScore,
    preClampCost,
    finalCost,
    needsSrRecheck,
  };
}

export interface SummonCostComparison {
  doanMinh: SummonCostResult;
  primeDivine: SummonCostResult;
  costDelta: number;
  multiplierDelta: number;
}

export function simulateSummonCostComparison(): SummonCostComparison {
  const doanMinh = evaluateSummonCost({
    rank: 'SR',
    hasLawTag: true,
    supportsAllyResource: true,
    longSetup: true,
  });
  const primeDivine = evaluateSummonCost({
    rank: 'Prime',
    hasRuleTag: true,
    hasLawTag: true,
    hasAoeFieldTag: true,
    hasAbsoluteTag: true,
    supportsAllyResource: true,
    hasDivineNature: true,
    hasVanishRisk: true,
  });

  return {
    doanMinh,
    primeDivine,
    costDelta: primeDivine.finalCost - doanMinh.finalCost,
    multiplierDelta: Number((primeDivine.multiplier - doanMinh.multiplier).toFixed(2)),
  };
}

function normalizeMetric(value: number | undefined, min: number, max: number): number {
  return Math.round(clamp(value ?? 0, min, max));
}

function normalizeBreakdown(input: CostBudgetInput): CostBudgetBreakdown {
  const hasDivineNature = Boolean(input.hasDivineNature);
  const divineBonus = hasDivineNature
    ? 3 + normalizeMetric(input.divineSelfSustainBonus, SCORE_RANGES.divineSelfSustainBonus[0], SCORE_RANGES.divineSelfSustainBonus[1])
    : 0;
  const divinePenalty = hasDivineNature ? 3 : 0;

  return {
    tagComplexity: normalizeMetric(input.tagComplexity, SCORE_RANGES.tagComplexity[0], SCORE_RANGES.tagComplexity[1]),
    battlefieldInfluence: normalizeMetric(input.battlefieldInfluence, SCORE_RANGES.battlefieldInfluence[0], SCORE_RANGES.battlefieldInfluence[1]),
    economyPressure: normalizeMetric(input.economyPressure, SCORE_RANGES.economyPressure[0], SCORE_RANGES.economyPressure[1]),
    scalingCeiling: normalizeMetric(input.scalingCeiling, SCORE_RANGES.scalingCeiling[0], SCORE_RANGES.scalingCeiling[1]),
    tacticalFlexibility: normalizeMetric(input.tacticalFlexibility, SCORE_RANGES.tacticalFlexibility[0], SCORE_RANGES.tacticalFlexibility[1]),
    setupPenalty: normalizeMetric(input.setupPenalty, SCORE_RANGES.setupPenalty[0], SCORE_RANGES.setupPenalty[1]),
    selfRiskPenalty: normalizeMetric(input.selfRiskPenalty, SCORE_RANGES.selfRiskPenalty[0], SCORE_RANGES.selfRiskPenalty[1]),
    vanishRiskPenalty: normalizeMetric(input.vanishRiskPenalty, SCORE_RANGES.vanishRiskPenalty[0], SCORE_RANGES.vanishRiskPenalty[1]),
    consistencyPenalty: normalizeMetric(input.consistencyPenalty, SCORE_RANGES.consistencyPenalty[0], SCORE_RANGES.consistencyPenalty[1]),
    divineBonus,
    divinePenalty,
  };
}

function addMetric(base: number | undefined, delta: number | undefined): number {
  return (base ?? 0) + (delta ?? 0);
}

export function mergeBudgetInputs(...inputs: Array<CostBudgetInput | null | undefined>): CostBudgetInput {
  const merged: CostBudgetInput = {};
  for (const input of inputs) {
    if (!input){
      continue;
    }
    if (typeof input.rankAnchorCost === 'number' && Number.isFinite(input.rankAnchorCost)) {
      merged.rankAnchorCost = input.rankAnchorCost;
    }
    if (typeof input.rank === 'string' && input.rank.trim()) {
      merged.rank = normalizeRankKey(input.rank);
    }
    if (typeof input.rankMultiplier === 'number' && Number.isFinite(input.rankMultiplier)) {
      merged.rankMultiplier = input.rankMultiplier;
    }
    for (const key of SCORE_METRIC_KEYS){
      merged[key] = addMetric(merged[key], input[key]);
    }
    if (input.hasDivineNature){
      merged.hasDivineNature = true;
    }
    merged.divineSelfSustainBonus = addMetric(merged.divineSelfSustainBonus, input.divineSelfSustainBonus);
  }
  return merged;
}

export function deriveBudgetFromRankRole(rank?: string | null, role?: string | null): CostBudgetInput {
  const rankKey = normalizeRankKey(rank);
  const roleKey = String(role ?? '').trim().toLowerCase();
  return mergeBudgetInputs(
    {
      rank: rankKey,
      rankAnchorCost: resolveRankAnchorByKey(rankKey),
      rankMultiplier: resolveRankMultiplierByKey(rankKey),
    },
    { battlefieldInfluence: 1, tacticalFlexibility: 1 },
    RANK_BUDGET_BASE[rankKey],
    ROLE_BUDGET_MOD[roleKey],
    rankKey === 'PRIME' ? { hasDivineNature: true } : null,
  );
}

/**
 * Cost budget core:
 * - PowerScore = tổng nhóm điểm cộng.
 * - RiskScore = tổng nhóm điểm trừ.
 * - NetScore = PowerScore - RiskScore.
 * - Cost = clamp theo rank-range và biên toàn cục [7..22] (có ngoại lệ PRIME trần mở rộng).
 */
export function evaluateCostBudget(input: CostBudgetInput): CostBudgetResult {
  const breakdown = normalizeBreakdown(input);
  const powerScore = breakdown.tagComplexity
    + breakdown.battlefieldInfluence
    + breakdown.economyPressure
    + breakdown.scalingCeiling
    + breakdown.tacticalFlexibility
    + breakdown.divineBonus;
  const riskScore = breakdown.setupPenalty
    + breakdown.selfRiskPenalty
    + breakdown.vanishRiskPenalty
    + breakdown.consistencyPenalty
    + breakdown.divinePenalty;
  const adjustedRiskScore = riskScore * 1.15;
  const netScore = powerScore - adjustedRiskScore;
  const rankAnchorCost = clamp(input.rankAnchorCost ?? 14, COST_MIN, COST_MAX);
  const rankMultiplier = clamp(input.rankMultiplier ?? 0.95, 0.8, 1.55);
  const rankScale = rankMultiplier / 0.95;
  const netScale = 0.3 * (0.7 + rankScale * 0.3);
  const lowRankRelief = rankMultiplier < 0.95
    ? (0.95 - rankMultiplier) * 6
    : 0;
  const rawCost = rankAnchorCost + netScore * netScale - lowRankRelief;
  const rankKey = normalizeRankKey(input.rank);
  const idealRange = RANK_IDEAL_COST_RANGE[rankKey];
  const rankBoundMin = idealRange?.[0] ?? COST_MIN;
  let rankBoundMax = idealRange?.[1] ?? COST_MAX;
  if (rankKey === 'PRIME' && powerScore >= 26 && netScore >= 22) {
    rankBoundMax = 23;
  }
  const boundedMin = Math.max(COST_MIN, rankBoundMin);
  const boundedMax = Math.max(boundedMin, rankBoundMax);
  const cost = Math.round(clamp(rawCost, boundedMin, boundedMax));

  return {
    powerScore,
    riskScore,
    netScore,
    cost,
    breakdown,
  };
}

export function estimateCostFromTags(tags: readonly string[]): CostBudgetResult {
  const normalizedTags = tags.map((tag) => String(tag).trim().toLowerCase());
  const normalizedTagSet = new Set(normalizedTags);
  const has = (...needles: string[]) => needles.some((needle) => normalizedTagSet.has(needle));
  const normalizedTagText = normalizedTags.join(' || ');
  const containsAny = (...needles: string[]) => needles.some((needle) => normalizedTagText.includes(needle));
  const input: CostBudgetInput = {
    tagComplexity: 0,
    battlefieldInfluence: 1,
    economyPressure: 0,
    scalingCeiling: 0,
    tacticalFlexibility: 1,
    setupPenalty: 0,
    selfRiskPenalty: 0,
    vanishRiskPenalty: 0,
    consistencyPenalty: 0,
    hasDivineNature: containsAny('thần tính', 'divine'),
  };
  const addScore = (key: ScoreKey, delta: number): void => {
    const current = typeof input[key] === 'number' ? (input[key] as number) : 0;
    input[key] = current + delta;
  };

  if (has('quy-tac') || containsAny('quy tắc')){
    addScore('tagComplexity', 3);
    addScore('battlefieldInfluence', 2);
  }
  if (has('phap-tac') || containsAny('pháp tắc')){
    addScore('tagComplexity', 2);
    addScore('battlefieldInfluence', 1);
  }
  if (has('tuyet-doi') || containsAny('tuyệt đối', 'absolute')){
    addScore('tagComplexity', 1);
  }
  if (containsAny('aoe', 'toàn sân', 'global')){
    addScore('battlefieldInfluence', 2);
  }
  if (containsAny('buff', 'debuff', 'heal', 'shield', 'hồi')){
    addScore('tacticalFlexibility', 1);
  }
  if (containsAny('summon', 'triệu hồi')){
    addScore('tacticalFlexibility', 1);
    addScore('setupPenalty', 1);
  }
  if (containsAny('cost', 'aether', 'nộ', 'energy', 'resource')){
    addScore('economyPressure', 1);
  }
  if (containsAny('vĩnh viễn', 'stack', 'tiến hóa', 'evolve', 'evolution')){
    addScore('scalingCeiling', 2);
  }
  if (containsAny('friendly fire', 'không phân địch ta', 'toàn bộ sinh vật', 'tự tổn thương', 'self-debuff', 'self debuff')){
    addScore('selfRiskPenalty', 2);
  }
  if (containsAny('biến mất', 'removed', 'vanish', 'out trận')){
    addScore('vanishRiskPenalty', 2);
  }
  if (containsAny('ngẫu nhiên', 'random')){
    addScore('consistencyPenalty', 1);
  }

  return evaluateCostBudget(input);
}
