export interface SavedPlayerProfile {
  lineupDeck?: string[];
  lineupActiveBuffOptionIndexes?: number[];
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
  sectCultivation?: {
    startedAtMs?: number;
    lastClaimedAtMs?: number;
    totalMinutes?: number;
  };
}

const STORAGE_KEY = 'arclune.playerProfile.v1';

const EMPTY_PROFILE: SavedPlayerProfile = {};

const isObject = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const canUseLocalStorage = (): boolean => (
  typeof window !== 'undefined' && !!window.localStorage
);

const readStoredRaw = (): string | null => {
  if (!canUseLocalStorage()) return null;
  return window.localStorage.getItem(STORAGE_KEY);
};

const writeStoredRaw = (raw: string): void => {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, raw);
};

const parseStoredProfile = (raw: string | null): SavedPlayerProfile => {
  if (!raw) return EMPTY_PROFILE;
  const parsed = JSON.parse(raw) as unknown;
  return isObject(parsed) ? (parsed as SavedPlayerProfile) : EMPTY_PROFILE;
};

const mergeRecord = <T extends Record<string, unknown>>(
  current?: T,
  patch?: T,
): T | undefined => {
  if (!current && !patch) return undefined;
  if (!current) return { ...patch } as T;
  if (!patch) return current;
  return { ...current, ...patch };
};

const buildMergedProfile = (
  current: SavedPlayerProfile,
  patch: SavedPlayerProfile,
): SavedPlayerProfile => ({
  ...current,
  ...patch,
  cultivationByUnit: mergeRecord(current.cultivationByUnit, patch.cultivationByUnit),
  tpByUnit: mergeRecord(current.tpByUnit, patch.tpByUnit),
  tpAllocByUnit: mergeRecord(current.tpAllocByUnit, patch.tpAllocByUnit),
  equipmentByUnit: mergeRecord(current.equipmentByUnit, patch.equipmentByUnit),
  tacticalAiByUnit: mergeRecord(current.tacticalAiByUnit, patch.tacticalAiByUnit),
  collectionUi: mergeRecord(current.collectionUi, patch.collectionUi),
  sectCultivation: mergeRecord(current.sectCultivation, patch.sectCultivation),
});

const normalizeCultivationByUnit = (
  cultivationByUnit?: SavedPlayerProfile['cultivationByUnit'],
): Record<string, { realm: number; subRealm: number }> => {
  const normalized: Record<string, { realm: number; subRealm: number }> = {};
  if (!cultivationByUnit) return normalized;

  for (const unitId of Object.keys(cultivationByUnit)) {
    if (!unitId || !unitId.trim()) continue;
    normalized[unitId] = { realm: 1, subRealm: 0 };
  }

  return normalized;
};

export function loadPlayerProfile(): SavedPlayerProfile {
  try {
    return parseStoredProfile(readStoredRaw());
  } catch (error) {
    console.warn('[profile] Không thể đọc player profile.', error);
    return EMPTY_PROFILE;
  }
}

export function savePlayerProfile(next: SavedPlayerProfile): void {
  try {
    const nextRaw = JSON.stringify(next);
    const currentRaw = readStoredRaw();
    if (currentRaw === nextRaw) return;
    writeStoredRaw(nextRaw);
  } catch (error) {
    console.warn('[profile] Không thể lưu player profile.', error);
  }
}

export function patchPlayerProfile(patch: SavedPlayerProfile): SavedPlayerProfile {
  const merged = buildMergedProfile(loadPlayerProfile(), patch);
  savePlayerProfile(merged);
  return merged;
}

export function resetPlayerProfileData(): SavedPlayerProfile {
  const current = loadPlayerProfile();
  const resetProfile: SavedPlayerProfile = {
    lineupDeck: [],
    lineupActiveBuffOptionIndexes: [],
    lineupStateById: {},
    cultivationByUnit: normalizeCultivationByUnit(current.cultivationByUnit),
    sectName: '',
    tpByUnit: {},
    tpAllocByUnit: {},
    equipmentByUnit: {},
    tacticalAiByUnit: {},
  };

  savePlayerProfile(resetProfile);
  return resetProfile;
}