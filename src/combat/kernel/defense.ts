import type { DefenseModifiers, DefensePenetration } from './types.ts';

export function normalizeDefenseRating(value: unknown): number {
  const rating = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(rating) ? rating : 0;
}

export function resolveEffectiveDefense(
  rating: number,
  modifiers: DefenseModifiers = { flat: 0, percent: 0 },
  penetration: DefensePenetration = { flat: 0, percent: 0 },
): number {
  const base = normalizeDefenseRating(rating) + normalizeDefenseRating(modifiers.flat);
  const modified = base * (1 + normalizeDefenseRating(modifiers.percent));
  return modified * (1 - normalizeDefenseRating(penetration.percent)) - normalizeDefenseRating(penetration.flat);
}

export function resolveDefenseMultiplier(defense: number): number {
  const rating = normalizeDefenseRating(defense);
  return rating >= 0 ? 100 / (100 + rating) : 2 - (100 / (100 - rating));
}

