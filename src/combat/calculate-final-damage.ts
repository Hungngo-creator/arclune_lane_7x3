import type { UnitToken } from '@shared-types/units';
import { toFiniteNumber, toFloorInt } from './number-utils.ts';

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
  return Math.max(0, toFloorInt(value, 0));
};

const normalizeBonus = (value: unknown): number => {
  const parsed = toFiniteNumber(value, NaN);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(-1, parsed);
};

const toNonNegativeFactor = (value: unknown, fallback = 1): number => {
  const parsed = toFiniteNumber(value, NaN);
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
);

export function calculateFinalDamage(
  _attacker: UnitToken,
  _defender: UnitToken,
  _skill: unknown,
  rawDamage: number,
  context: CalculateFinalDamageContext = {}
): CalculateFinalDamageResult {
  const breakdown = resolveBreakdown(context);
  if (context.ignoreAll) {
    return { total: 0, breakdown };
  }

  const counterMultiplier = resolveCounterMultiplier(breakdown);
  const defenseMultiplier = toNonNegativeFactor(context.defenseMultiplier, 1);
  const reductionMultiplier = toNonNegativeFactor(context.reductionMultiplier, 1);

  let total = clampDamage(rawDamage);
  if (counterMultiplier !== 1) total = Math.max(0, Math.floor(total * counterMultiplier));
  if (total > 0 && defenseMultiplier !== 1) total = Math.max(0, Math.floor(total * defenseMultiplier));
  if (total > 0 && reductionMultiplier !== 1) total = Math.max(0, Math.floor(total * reductionMultiplier));

  return { total, breakdown };
}
