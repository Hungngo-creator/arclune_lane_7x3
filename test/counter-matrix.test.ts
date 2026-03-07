import { describe, expect, test } from '@jest/globals';

import {
  getClassBonus,
  getCounterBonusMetadata,
  getElementBonus,
  getSynergyBonus,
} from '../src/combat/counter-matrix.ts';

describe('counter matrix', () => {
  test('elemental cycle matrix gives +10% only on configured advantage edges', () => {
    const cycle = ['fire', 'metal', 'wood', 'earth', 'lightning', 'blood', 'water'] as const;

    for (let i = 0; i < cycle.length; i += 1) {
      const attacker = cycle[i];
      const target = cycle[(i + 1) % cycle.length];
      expect(getElementBonus(attacker, target)).toBeCloseTo(0.1, 8);

      for (const defender of cycle) {
        if (defender === target) continue;
        expect(getElementBonus(attacker, defender)).toBe(0);
      }
    }
  });

  test('light <-> dark are mutually advantageous', () => {
    expect(getElementBonus('light', 'dark')).toBeCloseTo(0.1, 8);
    expect(getElementBonus('dark', 'light')).toBeCloseTo(0.1, 8);
  });

  test('wind has no offensive counter relation', () => {
    expect(getElementBonus('wind', 'fire')).toBe(0);
    expect(getElementBonus('fire', 'wind')).toBe(0);
    expect(getElementBonus('wind', 'dark')).toBe(0);
  });

  test('neutral never triggers elemental advantage on either side', () => {
    expect(getElementBonus('neutral', 'fire')).toBe(0);
    expect(getElementBonus('fire', 'neutral')).toBe(0);
    expect(getElementBonus({ element: 'neutral' }, { element: 'metal' })).toBe(0);
  });

  test('attacker uses skill element first, then base element fallback', () => {
    const attacker = { element: 'water' };
    const defender = { element: 'metal' };
    const sideUnits = [{ element: 'wind', alive: true }, { element: 'fire', alive: true }];

    const withSkill = getCounterBonusMetadata(attacker, defender, sideUnits, { skill: { tags: ['element:fire'] } });
    expect(withSkill.classBonus).toBe(0);
    expect(withSkill.elementBonus).toBeCloseTo(0.1, 8);
    expect(withSkill.synergyBonus).toBeCloseTo(0.05, 8);
    expect(withSkill.totalBonus).toBeCloseTo(0.15, 8);

    expect(getCounterBonusMetadata(attacker, defender, sideUnits, { skill: { tags: ['unknown-tag'] } })).toEqual({
      classBonus: 0,
      elementBonus: 0,
      synergyBonus: 0,
      totalBonus: 0,
    });
  });

  test('class matrix applies +10% and +5% correctly', () => {
    const topTier: Array<[string, string]> = [
      ['Assassin', 'Mage'],
      ['Mage', 'Warrior'],
      ['Tanker', 'Assassin'],
      ['Warrior', 'Tanker'],
      ['Ranger', 'Mage'],
      ['Summoner', 'Ranger'],
      ['Support', 'Summoner'],
    ];

    const secondTier: Array<[string, string]> = [
      ['Assassin', 'Support'],
      ['Mage', 'Tanker'],
      ['Tanker', 'Summoner'],
      ['Warrior', 'Ranger'],
      ['Ranger', 'Support'],
      ['Summoner', 'Warrior'],
      ['Support', 'Mage'],
    ];

    for (const [attacker, defender] of topTier) {
      expect(getClassBonus(attacker, defender)).toBeCloseTo(0.1, 8);
    }

    for (const [attacker, defender] of secondTier) {
      expect(getClassBonus(attacker, defender)).toBeCloseTo(0.05, 8);
    }
  });

  test('class alias archer/ranger is normalized in both attacker and defender', () => {
    expect(getClassBonus('archer', 'mage')).toBeCloseTo(0.1, 8);
    expect(getClassBonus('summoner', 'archer')).toBeCloseTo(0.1, 8);
    expect(getClassBonus('warrior', 'archer')).toBeCloseTo(0.05, 8);
  });

  test('wind + fire lineup synergy grants +5% for fire attacker', () => {
    const attacker = { element: 'fire' };
    const sideUnits = [{ element: 'wind' }, { element: 'fire' }, { element: 'water' }];

    expect(getSynergyBonus(attacker, sideUnits, {})).toBeCloseTo(0.05, 8);
    expect(getSynergyBonus({ element: 'wind' }, sideUnits, {})).toBe(0);
    expect(getSynergyBonus(attacker, [{ element: 'fire' }], {})).toBe(0);
  });

  test('aggregate metadata returns expected structure and additive total', () => {
    const attacker = { class: 'archer', element: 'fire' };
    const defender = { class: 'mage', element: 'metal' };
    const sideUnits = [{ element: 'wind' }, { element: 'fire' }];

    expect(getCounterBonusMetadata(attacker, defender, sideUnits, {})).toEqual({
      classBonus: 0.1,
      elementBonus: 0.1,
      synergyBonus: 0.05,
      totalBonus: 0.25,
    });
  });

  test('unknown/null/invalid input is safe and always falls back to zero', () => {
    expect(getElementBonus(null, undefined)).toBe(0);
    expect(getElementBonus('?', '???')).toBe(0);

    expect(getClassBonus(null, undefined)).toBe(0);
    expect(getClassBonus('???', 'mage')).toBe(0);

    expect(getSynergyBonus(null, null, null)).toBe(0);
    expect(getSynergyBonus({ element: 'fire' }, 'not-an-array', null)).toBe(0);

    expect(getCounterBonusMetadata(null, undefined, null, null)).toEqual({
      classBonus: 0,
      elementBonus: 0,
      synergyBonus: 0,
      totalBonus: 0,
    });
  });
});
