export interface SavedPlayerProfile {
  lineupDeck?: string[];
  lineupStateById?: Record<string, {
    leaderId?: string | null;
    cells?: Array<{
      index?: number;
      unitId?: string | null;
      unlocked?: boolean;
      label?: string | null;
    }>;
  }>;
  lineupPassiveSelectionById?: Record<string, Record<string, number>>;
  cultivationByUnit?: Record<string, { realm: number; subRealm: number }>;
  sectName?: string;
  tpByUnit?: Record<string, number>;
  tpAllocByUnit?: Record<string, Partial<Record<'HP' | 'ATK' | 'WIL' | 'ARM' | 'RES', number>>>;
  equipmentByUnit?: Record<string, Record<string, string | null>>;
  tacticalAiByUnit?: Record<string, unknown>;
  collectionUi?: {
    activeTab?: string;
    artsHubAutoOpen?: boolean;
  };
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
    tpByUnit: {
      ...(current.tpByUnit ?? {}),
      ...(patch.tpByUnit ?? {}),
    },
    tpAllocByUnit: {
      ...(current.tpAllocByUnit ?? {}),
      ...(patch.tpAllocByUnit ?? {}),
    },
    equipmentByUnit: {
      ...(current.equipmentByUnit ?? {}),
      ...(patch.equipmentByUnit ?? {}),
    },
    tacticalAiByUnit: {
      ...(current.tacticalAiByUnit ?? {}),
      ...(patch.tacticalAiByUnit ?? {}),
    },
    collectionUi: {
      ...(current.collectionUi ?? {}),
      ...(patch.collectionUi ?? {}),
    },
  };
  savePlayerProfile(merged);
  return merged;
}

export function resetPlayerProfileData(): SavedPlayerProfile {
  const current = loadPlayerProfile();
  const normalizedCultivationByUnit: Record<string, { realm: number; subRealm: number }> = {};
  for (const unitId of Object.keys(current.cultivationByUnit ?? {})){
    if (!unitId || !unitId.trim()) continue;
    normalizedCultivationByUnit[unitId] = { realm: 1, subRealm: 0 };
  }

  const resetProfile: SavedPlayerProfile = {
    lineupDeck: [],
    lineupStateById: {},
    cultivationByUnit: normalizedCultivationByUnit,
    sectName: '',
    tpByUnit: {},
    tpAllocByUnit: {},
    equipmentByUnit: {},
    tacticalAiByUnit: {},
  };

  savePlayerProfile(resetProfile);
  return resetProfile;
}