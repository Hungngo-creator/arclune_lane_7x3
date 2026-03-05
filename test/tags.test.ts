import {
  GAME_TAGS,
  TAG_IDS_BY_DOMAIN,
  getTagDefinition,
  hasAnyTag,
  listUnknownTags,
  normalizeTagId,
  normalizeTagList,
} from '../src/data/tags.ts';

describe('tag registry', () => {
  test('normalizes aliases into canonical ids', () => {
    expect(normalizeTagId('instant-cast')).toBe('instant');
    expect(normalizeTagId('armor-pierce')).toBe('pierce');
    expect(normalizeTagId('tuyetdoi_khien')).toBe('absolute-shield');
    expect(normalizeTagId('haste')).toBe('support');
    expect(normalizeTagId('reflect')).toBe('defense');
  });

  test('deduplicates and canonicalizes list', () => {
    expect(normalizeTagList(['instantCast', 'instant', 'line-target'])).toEqual(['instant', 'line']);
  });

  test('checks inclusion by canonical ids', () => {
    expect(hasAnyTag(['defensive', 'buff'], ['defense'])).toBe(true);
    expect(hasAnyTag(['heal'], ['control'])).toBe(false);
  });

  test('returns canonical tag definition from alias', () => {
    const tag = getTagDefinition('instantCast');
    expect(tag).toMatchObject({ id: 'instant', domain: 'timing' });
  });

  test('tracks unknown tags for migration warnings', () => {
    expect(listUnknownTags(['instant', 'legacy_tag', '  random-id  '])).toEqual(['legacy_tag', 'random-id']);
  });

  test('provides grouped ids by domain', () => {
    expect(TAG_IDS_BY_DOMAIN.rule).toEqual(expect.arrayContaining(['absolute-attack', 'absolute-shield', 'unique-global']));
    expect(TAG_IDS_BY_DOMAIN.effect).toEqual(expect.arrayContaining(['heal', 'shield', 'poison']));
    expect(Object.values(TAG_IDS_BY_DOMAIN).flat().length).toBe(GAME_TAGS.length);
  });
});
