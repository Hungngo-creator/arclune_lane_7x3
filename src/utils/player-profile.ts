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
  tpAllocByUnit?: Record<string, Record<string, number>>;
  equipmentByUnit?: Record<string, Record<string, string | null>>;
  tacticalAiByUnit?: Record<string, unknown>;
  ownedByUnit?: Record<string, boolean>;
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
const MAX_LINEUP_BUFF_SLOTS = 6;

let cachedRawProfile: string | null | undefined;
let cachedParsedProfile: SavedPlayerProfile | null = null;

const isObject = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const canUseLocalStorage = (): boolean => (
  typeof window !== 'undefined' && !!window.localStorage
);

const isFiniteNumber = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value)
);

const toNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const readStoredRaw = (): string | null => {
  if (!canUseLocalStorage()) return null;
  return window.localStorage.getItem(STORAGE_KEY);
};

const writeStoredRaw = (raw: string): void => {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, raw);
};

const sanitizeLineupBuffIndexes = (value: unknown): number[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const normalized: number[] = [];
  for (let i = 0; i < value.length && normalized.length < MAX_LINEUP_BUFF_SLOTS; i += 1) {
    const entry = value[i];
    if (!Number.isInteger(entry)) continue;
    const buffIndex = Number(entry);
    if (buffIndex < 0) continue;
    normalized.push(buffIndex);
  }
  return normalized;
};

const sanitizeCultivationByUnit = (value: unknown): SavedPlayerProfile['cultivationByUnit'] => {
  if (!isObject(value)) return undefined;
  const normalized: NonNullable<SavedPlayerProfile['cultivationByUnit']> = {};
  for (const [unitId, entry] of Object.entries(value)) {
    const validId = toNonEmptyString(unitId);
    if (!validId || !isObject(entry)) continue;
    const realm = isFiniteNumber(entry.realm) ? Math.max(1, Math.floor(entry.realm)) : 1;
    const subRealm = isFiniteNumber(entry.subRealm) ? Math.max(0, Math.floor(entry.subRealm)) : 0;
    normalized[validId] = { realm, subRealm };
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const sanitizeOwnedByUnit = (value: unknown): SavedPlayerProfile['ownedByUnit'] => {
  if (!isObject(value)) return undefined;
  const normalized: NonNullable<SavedPlayerProfile['ownedByUnit']> = {};
  for (const [unitId, owned] of Object.entries(value)) {
    const validId = toNonEmptyString(unitId);
    if (!validId || typeof owned !== 'boolean') continue;
    normalized[validId] = owned;
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const sanitizeSavedProfile = (rawProfile: unknown): SavedPlayerProfile => {
  if (!isObject(rawProfile)) return EMPTY_PROFILE;

  const normalized: SavedPlayerProfile = { ...rawProfile } as SavedPlayerProfile;
  normalized.lineupDeck = Array.isArray(rawProfile.lineupDeck)
    ? rawProfile.lineupDeck.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : undefined;
  normalized.lineupActiveBuffOptionIndexes = sanitizeLineupBuffIndexes(rawProfile.lineupActiveBuffOptionIndexes);
  normalized.cultivationByUnit = sanitizeCultivationByUnit(rawProfile.cultivationByUnit);
  normalized.ownedByUnit = sanitizeOwnedByUnit(rawProfile.ownedByUnit);

  const sectName = toNonEmptyString(rawProfile.sectName);
  normalized.sectName = sectName ?? '';

  return normalized;
};

const parseStoredProfile = (raw: string | null): SavedPlayerProfile => {
  if (!raw) return EMPTY_PROFILE;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return sanitizeSavedProfile(parsed);
  } catch {
    return EMPTY_PROFILE;
  }
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
  ownedByUnit: mergeRecord(current.ownedByUnit, patch.ownedByUnit),
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
  const raw = readStoredRaw();
  if (raw === cachedRawProfile && cachedParsedProfile) return cachedParsedProfile;

  const parsed = parseStoredProfile(raw);
  cachedRawProfile = raw;
  cachedParsedProfile = parsed;
  return parsed;
}

export function savePlayerProfile(next: SavedPlayerProfile): void {
  const normalized = sanitizeSavedProfile(next);
  const nextRaw = JSON.stringify(normalized);
  const currentRaw = readStoredRaw();
  if (currentRaw === nextRaw) return;
  writeStoredRaw(nextRaw);
  cachedRawProfile = nextRaw;
  cachedParsedProfile = normalized;
}

export function patchPlayerProfile(patch: SavedPlayerProfile): SavedPlayerProfile {
  const merged = buildMergedProfile(loadPlayerProfile(), sanitizeSavedProfile(patch));
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
    ownedByUnit: {},
  };

  savePlayerProfile(resetProfile);
  return resetProfile;
}