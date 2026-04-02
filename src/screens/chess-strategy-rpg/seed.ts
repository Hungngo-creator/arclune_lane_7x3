import { createRngState, nextRngValue } from '../../utils/rng.ts';

export type TacticalAiProfile = 'Neutral' | 'Aggressive' | 'Defensive';

export function hashSeedText(seedText: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < seedText.length; i += 1) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

export function resolveTacticalAiProfile(seedText: string): TacticalAiProfile {
  const profileRoll = nextRngValue(createRngState(hashSeedText(`${seedText}:ai-profile`)));
  if (profileRoll < 0.2) return 'Aggressive';
  if (profileRoll < 0.4) return 'Defensive';
  return 'Neutral';
}
