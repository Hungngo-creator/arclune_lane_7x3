export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'PRIME';

const RARITY_SEQUENCE: readonly Rarity[] = ['N', 'R', 'SR', 'SSR', 'UR', 'PRIME'];

const RARITY_ALIASES: Readonly<Record<string, Rarity>> = {
  Prime: 'PRIME',
};

export function normalizeRarity(value: unknown): Rarity {
  const key = String(value ?? '').trim().toUpperCase();
  if (RARITY_SEQUENCE.includes(key as Rarity)){
    return key as Rarity;
  }
  const alias = RARITY_ALIASES[String(value ?? '').trim()];
  if (alias){
    return alias;
  }
  throw new Error(`Rarity không hợp lệ: ${value}`);
}

export function coerceRarity(value: unknown, fallback: Rarity = 'N'): Rarity {
  try {
    return normalizeRarity(value);
  } catch {
    return fallback;
  }
}
