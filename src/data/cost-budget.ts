import { normalizeTagList } from './tags.ts';

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
type ScoreMetrics = Pick<CostBudgetBreakdown, ScoreKey>;
interface CostTagScoreRule {
  id: string;
  label: string;
  metric: ScoreKey;
  delta?: number;
  perTag?: number;
  perKeyword?: number;
  cap?: number;
  tagIds?: ReadonlyArray<string>;
  keywords?: ReadonlyArray<string>;
  requiresAll?: ReadonlyArray<string>;
  excludesAny?: ReadonlyArray<string>;
}
interface CostTagSynergyRule {
  id: string;
  label: string;
  requiresAll: ReadonlyArray<string>;
  metric: ScoreKey;
  delta: number;
}
interface CostTagContext {
  hasTag: (...needles: string[]) => boolean;
  hasKeyword: (...keywords: string[]) => boolean;
  countMatchedTags: (tagIds: ReadonlyArray<string> | undefined) => number;
  countMatchedKeywords: (keywords: ReadonlyArray<string> | undefined) => number;
  totalTags: number;
  normalizedTags: ReadonlyArray<string>;
}
const normalizeKeywordTerm = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ');

export interface CostTagRuleMatch {
  ruleId: string;
  label: string;
  metric: ScoreKey;
  delta: number;
  matchedTags?: number;
  matchedKeywords?: number;
}

export interface CostTagBudgetInsights {
  normalizedTags: ReadonlyArray<string>;
  uniqueTagCount: number;
  keywordHitCount: number;
  ruleMatchCount: number;
  synergyMatchCount: number;
  riskSignals: ReadonlyArray<string>;
}

export interface CostTagBudgetDetail {
  input: CostBudgetInput;
  matches: ReadonlyArray<CostTagRuleMatch>;
  insights: CostTagBudgetInsights;
}

export interface CostBudgetProfileInput {
  rank?: string | null;
  role?: string | null;
  tags?: ReadonlyArray<string> | null;
  overrides?: CostBudgetInput | null;
}

export interface CostBudgetProfileDetail {
  input: CostBudgetInput;
  rankRoleInput: CostBudgetInput;
  tagInput: CostBudgetInput;
  matches: ReadonlyArray<CostTagRuleMatch>;
  result: CostBudgetResult;
}

function calculateRuleDelta(
  rule: CostTagScoreRule,
  matchedTags: number,
  matchedKeywords: number,
): number {
  const scaledByTags = typeof rule.perTag === 'number' ? matchedTags * rule.perTag : 0;
  const scaledByKeywords = typeof rule.perKeyword === 'number' ? matchedKeywords * rule.perKeyword : 0;
  const hasMatchedKeyword = matchedKeywords > 0;
  const hasMatchedTag = matchedTags > 0;
  const hasRuleSignal = hasMatchedTag || hasMatchedKeyword;
  const baseKeywordDelta = hasRuleSignal ? (rule.delta ?? 0) : 0;
  const totalDelta = scaledByTags + scaledByKeywords + baseKeywordDelta;
  if (totalDelta <= 0) return 0;
  if (typeof rule.cap === 'number'){
    return Math.min(totalDelta, rule.cap);
  }
  return totalDelta;
}

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
const ROLE_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  tank: 'tanker',
  guardian: 'tanker',
  fighter: 'warrior',
  dps: 'warrior',
  killer: 'assassin',
  caster: 'mage',
  healer: 'support',
  buffer: 'support',
  marksman: 'ranger',
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
function normalizeRoleKey(role: string | null | undefined): string {
  const normalized = String(role ?? '').trim().toLowerCase();
  return ROLE_ALIASES[normalized] ?? normalized;
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

function normalizeScoreMetrics(input: CostBudgetInput): ScoreMetrics {
  const normalized = {} as ScoreMetrics;
  for (const key of SCORE_METRIC_KEYS){
    const [min, max] = SCORE_RANGES[key];
    normalized[key] = normalizeMetric(input[key], min, max);
  }
  return normalized;
}

function normalizeBreakdown(input: CostBudgetInput): CostBudgetBreakdown {
  const hasDivineNature = Boolean(input.hasDivineNature);
  const divineBonus = hasDivineNature
    ? 3 + normalizeMetric(input.divineSelfSustainBonus, SCORE_RANGES.divineSelfSustainBonus[0], SCORE_RANGES.divineSelfSustainBonus[1])
    : 0;
  const divinePenalty = hasDivineNature ? 3 : 0;

  return {
    ...normalizeScoreMetrics(input),
    divineBonus,
    divinePenalty,
  };
}

function addMetric(base: number | undefined, delta: number | undefined): number {
  return (base ?? 0) + (delta ?? 0);
}

const COST_TAG_SCORE_RULES: ReadonlyArray<CostTagScoreRule> = Object.freeze([
  { id: 'complex-rule-core', label: 'Rule core tags', metric: 'tagComplexity', perTag: 1, cap: 4, tagIds: ['global-rule', 'absolute-attack', 'absolute-shield', 'divine-nature', 'unique-global'] },
  { id: 'complex-rule-text', label: 'Rule-centric keywords', metric: 'tagComplexity', delta: 2, keywords: ['pháp tắc'] },
  { id: 'zone-control', label: 'AoE and control pressure', metric: 'battlefieldInfluence', perTag: 2, cap: 5, tagIds: ['aoe', 'random-aoe', 'field', 'line', 'control', 'taunt', 'silence', 'poison'] },
  { id: 'global-rule-influence', label: 'Global rule text', metric: 'battlefieldInfluence', delta: 1, tagIds: ['global-rule'], keywords: ['quy tắc', 'rule'] },
  { id: 'global-influence-text', label: 'Global-scope text', metric: 'battlefieldInfluence', delta: 1, keywords: ['toàn sân', 'global'] },
  { id: 'economy-resource-load', label: 'Resource pressure', metric: 'economyPressure', delta: 1, perTag: 1, cap: 3, tagIds: ['aether-cost', 'mark', 'summon'], keywords: ['cost', 'aether', 'nộ', 'energy', 'resource'] },
  { id: 'scaling-growth', label: 'Scaling and growth tags', metric: 'scalingCeiling', delta: 1, perTag: 1, cap: 4, tagIds: ['stance', 'mark', 'chain', 'revive', 'execute', 'pierce'], keywords: ['vĩnh viễn', 'stack', 'tiến hóa', 'evolve', 'evolution'] },
  { id: 'utility-kit', label: 'Flexible utility kit', metric: 'tacticalFlexibility', perTag: 1, cap: 4, tagIds: ['support', 'self-buff', 'heal', 'team-heal', 'shield', 'revive', 'summon'] },
  { id: 'support-heal-pair', label: 'Support + heal combo', metric: 'tacticalFlexibility', delta: 1, requiresAll: ['support', 'heal'], excludesAny: ['summon'] },
  { id: 'buff-debuff-keywords', label: 'Buff/debuff text coverage', metric: 'tacticalFlexibility', delta: 1, perKeyword: 1, cap: 3, keywords: ['buff', 'debuff', 'hồi'] },
  { id: 'setup-load', label: 'Setup burden', metric: 'setupPenalty', delta: 1, perTag: 1, cap: 3, tagIds: ['summon', 'sleep', 'mark'], keywords: ['setup', 'triệu hồi', 'sleep'] },
  { id: 'self-risk', label: 'Self/friendly risk text', metric: 'selfRiskPenalty', delta: 1, perKeyword: 1, cap: 3, keywords: ['friendly fire', 'không phân địch ta', 'toàn bộ sinh vật', 'tự tổn thương', 'self-debuff', 'self debuff'] },
  { id: 'vanish-risk', label: 'Vanish/removed risk text', metric: 'vanishRiskPenalty', delta: 1, perKeyword: 1, cap: 3, keywords: ['biến mất', 'removed', 'vanish', 'out trận'] },
  { id: 'rng-consistency', label: 'Randomness penalty', metric: 'consistencyPenalty', perTag: 1, cap: 3, tagIds: ['random-target', 'random-aoe'], keywords: ['ngẫu nhiên', 'random', 'coin flip', 'coin-flip'] },
  { id: 'burst-finisher-pressure', label: 'Burst finisher pressure', metric: 'battlefieldInfluence', perTag: 1, cap: 2, tagIds: ['burst', 'execute'] },
  { id: 'line-burst-ceiling', label: 'Line burst scaling', metric: 'scalingCeiling', delta: 1, requiresAll: ['line', 'burst'] },
  { id: 'defensive-economy', label: 'Sustain economy tax', metric: 'economyPressure', delta: 1, requiresAll: ['shield', 'team-heal'] },
  { id: 'blink-flex', label: 'Blink tactical mobility', metric: 'tacticalFlexibility', delta: 1, tagIds: ['blink'] },
  { id: 'revive-economy-tax', label: 'Revive economy tax', metric: 'economyPressure', delta: 1, tagIds: ['revive'] },
  { id: 'resource-burst-risk', label: 'Burst resource strain', metric: 'setupPenalty', delta: 1, requiresAll: ['burst', 'aether-cost'] },
  { id: 'summon-wide-pressure', label: 'Summon + AoE influence', metric: 'battlefieldInfluence', delta: 1, requiresAll: ['summon', 'aoe'] },
  { id: 'rule-stability-tax', label: 'Rule + random consistency tax', metric: 'consistencyPenalty', delta: 1, requiresAll: ['global-rule', 'random-target'] },
  { id: 'control-setup-tax', label: 'Control setup tax', metric: 'setupPenalty', delta: 1, requiresAll: ['sleep', 'control'] },
  { id: 'mark-economy-pressure', label: 'Mark chain economy pressure', metric: 'economyPressure', perTag: 1, cap: 2, tagIds: ['mark', 'chain'] },
  { id: 'absolute-battle-tax', label: 'Absolute rule battlefield tax', metric: 'battlefieldInfluence', perTag: 1, cap: 2, tagIds: ['absolute-attack', 'absolute-shield'] },
  { id: 'field-line-pressure', label: 'Field + line pressure', metric: 'battlefieldInfluence', delta: 1, requiresAll: ['field', 'line'] },
  { id: 'revive-support-flex', label: 'Revive support flexibility', metric: 'tacticalFlexibility', delta: 1, requiresAll: ['revive', 'support'] },
]);

const COST_TAG_SYNERGY_RULES: ReadonlyArray<CostTagSynergyRule> = Object.freeze([
  { id: 'summon-support-flex', label: 'Summon support flexibility', requiresAll: ['summon', 'support'], metric: 'tacticalFlexibility', delta: 1 },
  { id: 'aoe-control-pressure', label: 'AoE control pressure', requiresAll: ['aoe', 'control'], metric: 'battlefieldInfluence', delta: 1 },
  { id: 'revive-shield-scale', label: 'Revive shield scaling', requiresAll: ['revive', 'shield'], metric: 'scalingCeiling', delta: 1 },
  { id: 'random-aoe-execute-risk', label: 'Random AoE execute volatility', requiresAll: ['random-aoe', 'execute'], metric: 'consistencyPenalty', delta: 1 },
  { id: 'global-aether-tax', label: 'Global aether economy tax', requiresAll: ['global-rule', 'aether-cost'], metric: 'economyPressure', delta: 1 },
  { id: 'burst-execute-scale', label: 'Burst execute scaling', requiresAll: ['burst', 'execute'], metric: 'scalingCeiling', delta: 1 },
  { id: 'heal-shield-utility', label: 'Heal shield utility', requiresAll: ['heal', 'shield'], metric: 'tacticalFlexibility', delta: 1 },
  { id: 'random-rule-inconsistency', label: 'Random rule inconsistency', requiresAll: ['random-target', 'global-rule'], metric: 'consistencyPenalty', delta: 1 },
  { id: 'mark-chain-scale', label: 'Mark chain scaling', requiresAll: ['mark', 'chain'], metric: 'scalingCeiling', delta: 1 },
  { id: 'taunt-shield-flex', label: 'Taunt shield frontline', requiresAll: ['taunt', 'shield'], metric: 'tacticalFlexibility', delta: 1 },
  { id: 'sleep-execute-setup', label: 'Sleep execute setup tax', requiresAll: ['sleep', 'execute'], metric: 'setupPenalty', delta: 1 },
  { id: 'pierce-burst-ceiling', label: 'Pierce burst ceiling', requiresAll: ['pierce', 'burst'], metric: 'scalingCeiling', delta: 1 },
  { id: 'support-revive-economy', label: 'Support revive economy pressure', requiresAll: ['support', 'revive'], metric: 'economyPressure', delta: 1 },
  { id: 'shield-control-frontline', label: 'Shield control frontline pressure', requiresAll: ['shield', 'control'], metric: 'battlefieldInfluence', delta: 1 },
]);

function createTagCostContext(tags: readonly string[]): CostTagContext {
  const normalizedTextTags = normalizeTagList(tags)
    .map((tag) => normalizeKeywordTerm(tag))
    .filter(Boolean);
  const normalizedTagSet = new Set(normalizedTextTags);
  const normalizedTagText = normalizedTextTags.join(' || ');
  const keywordCache = new Map<string, boolean>();
  const hasKeywordImpl = (keyword: string): boolean => {
    const normalizedKeyword = normalizeKeywordTerm(keyword);
    if (!normalizedKeyword) return false;
    if (normalizedTagSet.has(normalizedKeyword)) return true;
    return normalizedTagText.includes(normalizedKeyword);
  };

  const hasTag = (...needles: string[]): boolean => normalizeTagList(needles).some((needle) => normalizedTagSet.has(needle));
  const hasKeyword = (...keywords: string[]): boolean => keywords.some((keyword) => {
    const normalizedKeyword = normalizeKeywordTerm(keyword);
    const cached = keywordCache.get(normalizedKeyword);
    if (typeof cached === 'boolean'){
      return cached;
    }
    const matched = hasKeywordImpl(normalizedKeyword);
    keywordCache.set(normalizedKeyword, matched);
    return matched;
  });
  const countMatchedTags = (tagIds: ReadonlyArray<string> | undefined): number => {
    if (!Array.isArray(tagIds) || tagIds.length === 0) return 0;
    let count = 0;
    for (const tagId of tagIds){
      if (hasTag(tagId)) count += 1;
    }
    return count;
  };
  const countMatchedKeywords = (keywords: ReadonlyArray<string> | undefined): number => {
    if (!Array.isArray(keywords) || keywords.length === 0) return 0;
    let count = 0;
    for (const keyword of keywords){
      const normalizedKeyword = normalizeKeywordTerm(keyword);
      const cached = keywordCache.get(normalizedKeyword);
      if (typeof cached === 'boolean'){
        if (cached) count += 1;
        continue;
      }
      const matched = hasKeywordImpl(normalizedKeyword);
      keywordCache.set(normalizedKeyword, matched);
      if (matched) count += 1;
    }
    return count;
  };

  return {
    hasTag,
    hasKeyword,
    countMatchedTags,
    countMatchedKeywords,
    totalTags: normalizedTagSet.size,
    normalizedTags: [...normalizedTagSet],
  };
}

function isRuleApplicable(rule: CostTagScoreRule, tagContext: CostTagContext): boolean {
  if (rule.requiresAll && !rule.requiresAll.every((tagId) => tagContext.hasTag(tagId))){
    return false;
  }
  if (rule.excludesAny && rule.excludesAny.some((tagId) => tagContext.hasTag(tagId))){
    return false;
  }
  return true;
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
  const roleKey = normalizeRoleKey(role);
  return mergeBudgetInputs(
    {
      rank: rankKey,
      rankAnchorCost: resolveRankAnchorByKey(rankKey),
      rankMultiplier: resolveRankMultiplierByKey(rankKey),
    },
    { battlefieldInfluence: 1, tacticalFlexibility: 1 },
    RANK_BUDGET_BASE[rankKey],
    ROLE_BUDGET_MOD[roleKey],
    rankKey === 'UR' ? { economyPressure: 1 } : null,
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
  return evaluateCostBudget(deriveBudgetFromTagsDetailed(tags).input);
}

function buildRiskSignals(tagContext: CostTagContext): string[] {
  const riskSignals: string[] = [];
  if (tagContext.hasTag('random-target', 'random-aoe') || tagContext.hasKeyword('random', 'ngẫu nhiên', 'coin flip')) {
    riskSignals.push('volatility');
  }
  if (tagContext.hasTag('sleep', 'summon', 'mark') || tagContext.hasKeyword('setup', 'triệu hồi', 'sleep')) {
    riskSignals.push('setup-heavy');
  }
  if (tagContext.hasKeyword('friendly fire', 'tự tổn thương', 'không phân địch ta')) {
    riskSignals.push('friendly-risk');
  }
  if (tagContext.hasKeyword('vanish', 'removed', 'biến mất')) {
    riskSignals.push('vanish-risk');
  }
  return riskSignals;
}

export function deriveBudgetFromTagsDetailed(tags: readonly string[]): CostTagBudgetDetail {
  const tagContext = createTagCostContext(tags);
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
    hasDivineNature: tagContext.hasTag('divine-nature') || tagContext.countMatchedKeywords(['thần tính', 'divine']) > 0,
  };
  const matches: CostTagRuleMatch[] = [];
  const addScore = (key: ScoreKey, delta: number): void => {
    const current = typeof input[key] === 'number' ? (input[key] as number) : 0;
    input[key] = current + delta;
  };

  const addMatch = (
    ruleId: string,
    label: string,
    metric: ScoreKey,
    delta: number,
    matchedTags?: number,
    matchedKeywords?: number,
  ): void => {
    if (delta <= 0) return;
    matches.push({ ruleId, label, metric, delta, matchedTags, matchedKeywords });
  };
  if (tagContext.hasTag('global-rule') && tagContext.hasKeyword('global', 'toàn sân', 'quy tắc')){
    addScore('tagComplexity', 1);
    addMatch('rule-text-alignment', 'Global rule text alignment', 'tagComplexity', 1);
  }
  if (tagContext.totalTags >= 10){
    addScore('consistencyPenalty', 1);
    addMatch('high-tag-overload', 'High tag overload consistency tax', 'consistencyPenalty', 1, tagContext.totalTags, 0);
  }

  for (const rule of COST_TAG_SCORE_RULES){
    if (!isRuleApplicable(rule, tagContext)) continue;
    const matchedTags = tagContext.countMatchedTags(rule.tagIds);
    const matchedKeywords = tagContext.countMatchedKeywords(rule.keywords);
    const delta = calculateRuleDelta(rule, matchedTags, matchedKeywords);
    addScore(rule.metric, delta);
    addMatch(rule.id, rule.label, rule.metric, delta, matchedTags, matchedKeywords);
  }

  let synergyMatchCount = 0;
  for (const rule of COST_TAG_SYNERGY_RULES){
    if (!rule.requiresAll.every((tagId) => tagContext.hasTag(tagId))) continue;
    synergyMatchCount += 1;
    addScore(rule.metric, rule.delta);
    addMatch(`synergy:${rule.id}`, rule.label, rule.metric, rule.delta, rule.requiresAll.length, 0);
  }

  if (input.hasDivineNature){
    const divineSustainTags = tagContext.countMatchedTags(['heal', 'team-heal', 'shield', 'revive', 'support']);
    if (divineSustainTags > 0){
      input.divineSelfSustainBonus = Math.min(divineSustainTags, SCORE_RANGES.divineSelfSustainBonus[1]);
      addMatch('divine-self-sustain', 'Divine sustain bonus', 'tacticalFlexibility', input.divineSelfSustainBonus, divineSustainTags, 0);
    }
  }

  if (tagContext.totalTags >= 6){
    addScore('tagComplexity', 1);
    addMatch('complexity-size-6', 'Tag pool size >= 6', 'tagComplexity', 1);
  }
  if (tagContext.totalTags >= 9){
    addScore('tagComplexity', 1);
    addMatch('complexity-size-9', 'Tag pool size >= 9', 'tagComplexity', 1);
  }

  const keywordHitCount = matches.reduce((sum, match) => sum + (match.matchedKeywords ?? 0), 0);
  return {
    input,
    matches,
    insights: {
      normalizedTags: tagContext.normalizedTags,
      uniqueTagCount: tagContext.totalTags,
      keywordHitCount,
      ruleMatchCount: matches.length - synergyMatchCount,
      synergyMatchCount,
      riskSignals: buildRiskSignals(tagContext),
    },
  };
}

export function deriveBudgetFromProfileDetailed(profile: CostBudgetProfileInput): CostBudgetProfileDetail {
  const rankRoleInput = deriveBudgetFromRankRole(profile.rank, profile.role);
  const tagDetail = deriveBudgetFromTagsDetailed(profile.tags ?? []);
  const input = mergeBudgetInputs(
    rankRoleInput,
    tagDetail.input,
    profile.overrides ?? null,
  );
  const result = evaluateCostBudget(input);

  return {
    input,
    rankRoleInput,
    tagInput: tagDetail.input,
    matches: tagDetail.matches,
    result,
  };
}
