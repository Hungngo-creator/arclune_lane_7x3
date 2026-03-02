import { normalizeTagId, normalizeTagList, hasAnyTag } from './tags';

describe('tag registry', () => {
  test('normalizes aliases into canonical ids', () => {
    expect(normalizeTagId('instant-cast')).toBe('instant');
    expect(normalizeTagId('armor-pierce')).toBe('pierce');
    expect(normalizeTagId('tuyetdoi_khien')).toBe('absolute-shield');
  });

  test('deduplicates and canonicalizes list', () => {
    expect(normalizeTagList(['instantCast', 'instant', 'line-target'])).toEqual(['instant', 'line']);
  });

  test('checks inclusion by canonical ids', () => {
    expect(hasAnyTag(['defensive', 'buff'], ['defense'])).toBe(true);
    expect(hasAnyTag(['heal'], ['control'])).toBe(false);
  });
});
