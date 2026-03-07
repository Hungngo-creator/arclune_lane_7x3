import { describe, expect, test } from '@jest/globals';

import { calculateFinalDamage } from '../src/combat/calculate-final-damage.ts';

describe('calculate final damage', () => {
  test('counter bonuses are additive before defense and reduction', () => {
    const attacker = { id: 'a', side: 'ally', cx: 0, cy: 0, alive: true } as any;
    const defender = { id: 'd', side: 'enemy', cx: 1, cy: 0, alive: true } as any;

    const result = calculateFinalDamage(attacker, defender, null, 100, {
      breakdown: { classBonus: 0.1, elementBonus: 0.1, synergyBonus: 0.05 },
      defenseMultiplier: 0.5,
      reductionMultiplier: 0.8,
    });

    expect(result.total).toBe(49);
    expect(result.breakdown).toEqual({ classBonus: 0.1, elementBonus: 0.1, synergyBonus: 0.05 });
  });

  test('invalid inputs stay safe and never go below zero', () => {
    const attacker = { id: 'a', side: 'ally', cx: 0, cy: 0, alive: true } as any;
    const defender = { id: 'd', side: 'enemy', cx: 1, cy: 0, alive: true } as any;

    const result = calculateFinalDamage(attacker, defender, null, Number.NaN, {
      breakdown: { classBonus: -9, elementBonus: Number.NaN, synergyBonus: 0 },
      defenseMultiplier: Number.NaN,
      reductionMultiplier: 1,
    });

    expect(result.total).toBe(0);
  });
});
