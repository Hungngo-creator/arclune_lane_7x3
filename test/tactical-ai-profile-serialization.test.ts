import { loadPlayerProfile, patchPlayerProfile, savePlayerProfile } from '../src/utils/player-profile.ts';
import { mapUnitProgressById } from '../src/modes/pve/collection-mapper.ts';

describe('tacticalAiByUnit serialization/deserialization', () => {
  const storage = new Map<string, string>();

  const localStorageMock = {
    getItem: jest.fn((key: string) => storage.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: jest.fn((key: string) => {
      storage.delete(key);
    }),
    clear: jest.fn(() => {
      storage.clear();
    }),
  };

  beforeEach(() => {
    storage.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    (globalThis as { window?: unknown }).window = {
      localStorage: localStorageMock,
    };
  });

  it('keeps tacticalAiByUnit persisted and migrates legacy gambit rows safely', () => {
    savePlayerProfile({
      tacticalAiByUnit: {
        hero_legacy: [
          { condition: 'always', action: 'ult', threshold: '70', enabled: true },
          { condition: 'self_hp_below', action: 'basic', threshold: 25, enabled: true },
          { condition: 'always', action: 'unknown_action', threshold: 10, enabled: true },
        ],
      },
    });

    const loaded = loadPlayerProfile();
    expect(loaded.tacticalAiByUnit).toEqual({
      hero_legacy: [
        { condition: 'always', action: 'ult', threshold: '70', enabled: true },
        { condition: 'self_hp_below', action: 'basic', threshold: 25, enabled: true },
        { condition: 'always', action: 'unknown_action', threshold: 10, enabled: true },
      ],
    });

    patchPlayerProfile({ tacticalAiByUnit: loaded.tacticalAiByUnit });

    const tacticalAiByUnit = (loaded.tacticalAiByUnit ?? {}) as Record<string, unknown>;
    const mapped = mapUnitProgressById({
      units: [{ unitId: 'hero_legacy', tacticalAi: tacticalAiByUnit.hero_legacy as unknown[] }],
    });

    expect(mapped.get('hero_legacy')?.gambit).toEqual([
      { condition: 'always', action: 'ult', threshold: 70, enabled: true },
      { condition: 'self_hp_below', action: 'basic', threshold: 25, enabled: true },
    ]);
  });
});
