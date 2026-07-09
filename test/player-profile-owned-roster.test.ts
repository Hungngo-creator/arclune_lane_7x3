import { loadPlayerProfile, isUnitOwnedByProfile, patchPlayerProfile } from '../src/utils/player-profile.ts';
import { ROSTER } from '../src/catalog.ts';

describe('owned roster defaults', () => {
  const storage = new Map<string, string>();
  const localStorageMock = {
    getItem: jest.fn((key: string) => storage.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => { storage.set(key, value); }),
    removeItem: jest.fn((key: string) => { storage.delete(key); }),
    clear: jest.fn(() => { storage.clear(); }),
  };

  beforeEach(() => {
    storage.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    (globalThis as { window?: unknown }).window = { localStorage: localStorageMock };
  });

  it('gives a blank profile every real Prime unit and does not unlock thien_luu SSR', () => {
    const profile = loadPlayerProfile();
    const primeIds = ROSTER.filter((unit) => unit.rank === 'Prime').map((unit) => unit.id);

    expect(profile.ownedUnitIds?.sort()).toEqual([...primeIds].sort());
    for (const unitId of primeIds) {
      expect(profile.ownedByUnit?.[unitId]).toBe(true);
      expect(isUnitOwnedByProfile(profile, unitId)).toBe(true);
    }
    expect(isUnitOwnedByProfile(profile, 'thien_luu')).toBe(false);
  });

  it('keeps thien_luu locked until the owned roster is patched by gacha', () => {
    const before = loadPlayerProfile();
    expect(isUnitOwnedByProfile(before, 'thien_luu')).toBe(false);

    const after = patchPlayerProfile({ ownedByUnit: { thien_luu: true } });

    expect(after.ownedByUnit?.thien_luu).toBe(true);
    expect(after.ownedUnitIds).toContain('thien_luu');
    expect(isUnitOwnedByProfile(after, 'thien_luu')).toBe(true);
  });
});

