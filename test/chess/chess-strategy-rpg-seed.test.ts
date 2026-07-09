import { describe, expect, test } from '@jest/globals';
import { hashSeedText, resolveTacticalAiProfile } from '../src/screens/chess-strategy-rpg/seed.ts';

describe('chess strategy rpg seed helpers', () => {
  test('hashSeedText deterministic for same seed', () => {
    expect(hashSeedText('ABC123XY')).toBe(hashSeedText('ABC123XY'));
    expect(hashSeedText('ABC123XY')).not.toBe(hashSeedText('ABC123XZ'));
  });

  test('resolveTacticalAiProfile deterministic and in allowed set', () => {
    const seed = 'QWERTY12';
    const first = resolveTacticalAiProfile(seed);
    const second = resolveTacticalAiProfile(seed);
    expect(first).toBe(second);
    expect(['Neutral', 'Aggressive', 'Defensive']).toContain(first);
  });
});
