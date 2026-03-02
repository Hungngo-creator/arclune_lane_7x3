export interface SavedPlayerProfile {
  lineupDeck?: string[];
  cultivationByUnit?: Record<string, { realm: number; subRealm: number }>;
}

const STORAGE_KEY = 'arclune.playerProfile.v1';

const isObject = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

export function loadPlayerProfile(): SavedPlayerProfile {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed)) return {};
    return parsed as SavedPlayerProfile;
  } catch (error) {
    console.warn('[profile] Không thể đọc player profile.', error);
    return {};
  }
}

export function savePlayerProfile(next: SavedPlayerProfile): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('[profile] Không thể lưu player profile.', error);
  }
}

export function patchPlayerProfile(patch: SavedPlayerProfile): SavedPlayerProfile {
  const current = loadPlayerProfile();
  const merged: SavedPlayerProfile = {
    ...current,
    ...patch,
    cultivationByUnit: {
      ...(current.cultivationByUnit ?? {}),
      ...(patch.cultivationByUnit ?? {}),
    },
  };
  savePlayerProfile(merged);
  return merged;
}
