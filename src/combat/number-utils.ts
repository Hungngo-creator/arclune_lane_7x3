export function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toFloorInt(value: unknown, fallback = 0): number {
  return Math.floor(toFiniteNumber(value, fallback));
}

export function toRoundedInt(value: unknown, fallback = 0): number {
  return Math.round(toFiniteNumber(value, fallback));
}

export function toPositiveTurns(value: unknown, fallback = 1): number {
  const direct = toFiniteNumber(value, NaN);
  if (!Number.isFinite(direct) || direct <= 0) return Math.max(1, Math.round(fallback));
  return Math.max(1, Math.round(direct));
}
