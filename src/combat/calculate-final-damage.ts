import type { UnitToken } from '@shared-types/units';

export interface DamageBreakdownMetadata {
  classBonus: number;
  elementBonus: number;
  synergyBonus: number;
}

export interface CalculateFinalDamageContext {
  ignoreAll?: boolean;
  defenseMultiplier?: number;
  reductionMultiplier?: number;
  breakdown?: Partial<DamageBreakdownMetadata> | null;
}

export interface CalculateFinalDamageResult {
  total: number;
  breakdown: DamageBreakdownMetadata;
}

const clampDamage = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
};

const normalizeBonus = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(-1, parsed);
};

const applyMitigationLayer = (damage: number, factor: number): number => (
  Math.max(0, Math.floor(Math.max(0, damage) * Math.max(0, factor)))
);

const applyHardRuleLayer = (damage: number, blocked: boolean): number => (
  blocked ? 0 : Math.max(0, damage)
);

const toNonNegativeFactor = (value: unknown, fallback = 1): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return Math.max(0, fallback);
  return Math.max(0, parsed);
};

const resolveBreakdown = (context?: CalculateFinalDamageContext | null): DamageBreakdownMetadata => {
  const raw = context?.breakdown ?? null;
  return {
    classBonus: normalizeBonus(raw?.classBonus),
    elementBonus: normalizeBonus(raw?.elementBonus),
    synergyBonus: normalizeBonus(raw?.synergyBonus),
  };
};

const resolveCounterMultiplier = (breakdown: DamageBreakdownMetadata): number => (
  Math.max(0, 1 + breakdown.classBonus + breakdown.elementBonus + breakdown.synergyBonus)
};

export function calculateFinalDamage(
  _attacker: UnitToken,
  _defender: UnitToken,
  _skill: unknown,
  rawDamage: number,
  context: CalculateFinalDamageContext = {}
): CalculateFinalDamageResult {
  const breakdown = resolveBreakdown(context);
  const counterMultiplier = resolveCounterMultiplier(breakdown);
  const defenseMultiplier = toNonNegativeFactor(context.defenseMultiplier, 1);
  const reductionMultiplier = toNonNegativeFactor(context.reductionMultiplier, 1);

  let total = clampDamage(rawDamage);
  total = applyMitigationLayer(total, counterMultiplier);
  total = applyHardRuleLayer(total, !!context.ignoreAll);
  total = applyMitigationLayer(total, defenseMultiplier);
  total = applyMitigationLayer(total, reductionMultiplier);

  return { total, breakdown };
}
