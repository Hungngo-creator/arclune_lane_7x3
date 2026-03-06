export const COST_MIN = 8;
export const COST_MAX = 22;

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

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)){
    return min;
  }
  return Math.max(min, Math.min(max, value));
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
    merged.tagComplexity = addMetric(merged.tagComplexity, input.tagComplexity);
    merged.battlefieldInfluence = addMetric(merged.battlefieldInfluence, input.battlefieldInfluence);
    merged.economyPressure = addMetric(merged.economyPressure, input.economyPressure);
    merged.scalingCeiling = addMetric(merged.scalingCeiling, input.scalingCeiling);
    merged.tacticalFlexibility = addMetric(merged.tacticalFlexibility, input.tacticalFlexibility);
    merged.setupPenalty = addMetric(merged.setupPenalty, input.setupPenalty);
    merged.selfRiskPenalty = addMetric(merged.selfRiskPenalty, input.selfRiskPenalty);
    merged.vanishRiskPenalty = addMetric(merged.vanishRiskPenalty, input.vanishRiskPenalty);
    merged.consistencyPenalty = addMetric(merged.consistencyPenalty, input.consistencyPenalty);
    if (input.hasDivineNature){
      merged.hasDivineNature = true;
    }
    merged.divineSelfSustainBonus = addMetric(merged.divineSelfSustainBonus, input.divineSelfSustainBonus);
  }
  return merged;
}

export function deriveBudgetFromRankRole(rank?: string | null, role?: string | null): CostBudgetInput {
  const rankKey = String(rank ?? '').trim().toUpperCase();
  const roleKey = String(role ?? '').trim().toLowerCase();
  return mergeBudgetInputs(
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
 * - Cost = clamp(8, 22, round(14 + NetScore * 0.4)).
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
  const netScore = powerScore - riskScore;
  const rawCost = 14 + netScore * 0.4;
  const cost = Math.round(clamp(rawCost, COST_MIN, COST_MAX));

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
  const has = (...needles: string[]) => needles.some((needle) => normalizedTags.includes(needle));
  const containsAny = (...needles: string[]) => needles.some((needle) => normalizedTags.some((tag) => tag.includes(needle)));

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

  if (has('quy-tac') || containsAny('quy tắc')){
    input.tagComplexity = (input.tagComplexity ?? 0) + 3;
    input.battlefieldInfluence = (input.battlefieldInfluence ?? 0) + 2;
  }
  if (has('phap-tac') || containsAny('pháp tắc')){
    input.tagComplexity = (input.tagComplexity ?? 0) + 2;
    input.battlefieldInfluence = (input.battlefieldInfluence ?? 0) + 1;
  }
  if (has('tuyet-doi') || containsAny('tuyệt đối', 'absolute')){
    input.tagComplexity = (input.tagComplexity ?? 0) + 1;
  }
  if (containsAny('aoe', 'toàn sân', 'global')){
    input.battlefieldInfluence = (input.battlefieldInfluence ?? 0) + 2;
  }
  if (containsAny('buff', 'debuff', 'heal', 'shield', 'hồi')){
    input.tacticalFlexibility = (input.tacticalFlexibility ?? 0) + 1;
  }
  if (containsAny('summon', 'triệu hồi')){
    input.tacticalFlexibility = (input.tacticalFlexibility ?? 0) + 1;
    input.setupPenalty = (input.setupPenalty ?? 0) + 1;
  }
  if (containsAny('cost', 'aether', 'nộ', 'energy', 'resource')){
    input.economyPressure = (input.economyPressure ?? 0) + 1;
  }
  if (containsAny('vĩnh viễn', 'stack', 'tiến hóa', 'evolve', 'evolution')){
    input.scalingCeiling = (input.scalingCeiling ?? 0) + 2;
  }
  if (containsAny('friendly fire', 'không phân địch ta', 'toàn bộ sinh vật', 'tự tổn thương', 'self-debuff', 'self debuff')){
    input.selfRiskPenalty = (input.selfRiskPenalty ?? 0) + 2;
  }
  if (containsAny('biến mất', 'removed', 'vanish', 'out trận')){
    input.vanishRiskPenalty = (input.vanishRiskPenalty ?? 0) + 2;
  }
  if (containsAny('ngẫu nhiên', 'random')){
    input.consistencyPenalty = (input.consistencyPenalty ?? 0) + 1;
  }

  return evaluateCostBudget(input);
}
