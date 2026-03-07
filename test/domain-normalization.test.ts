import { describe, expect, test } from '@jest/globals';

import {
  normalizeClassName,
  normalizeElementKey,
  normalizeElementList,
} from '../src/utils/domain-normalization.ts';

describe('domain normalization', () => {
  test('normalizes class alias archer <-> ranger', () => {
    expect(normalizeClassName('archer')).toBe('Ranger');
    expect(normalizeClassName('RANGER')).toBe('Ranger');
  });

  test('normalizes elemental aliases to lowercase canonical keys', () => {
    expect(normalizeElementKey('Hỏa')).toBe('fire');
    expect(normalizeElementKey('KIM')).toBe('metal');
    expect(normalizeElementKey('Thủy')).toBe('water');
    expect(normalizeElementKey('lightning')).toBe('lightning');
  });

  test('normalizes array values and removes duplicates', () => {
    expect(normalizeElementList(['Hỏa', 'fire', 'KIM', 'metal', 'unknown'])).toEqual(['fire', 'metal']);
  });
});
