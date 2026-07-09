import type { UnknownRecord } from '@shared-types/common';
import type { SavedPlayerProfile } from './player-profile.ts';
import { normalizeUnitId } from './unit-id.ts';

type CollectionUnitPatch = Record<string, unknown> & { unitId: string };

type ProfileProgressFields = Pick<
  SavedPlayerProfile,
  'tacticalAiByUnit' | 'cultivationByUnit' | 'tpByUnit' | 'tpAllocByUnit' | 'ownedByUnit' | 'equipmentByUnit'
>;

const isPlainRecord = (value: unknown): value is UnknownRecord => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
);

const normalizeProfileBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value !== 0 : null;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
    if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  }
  return null;
};

const collectNormalizedUnitPatches = (
  sourceByUnit: unknown,
  buildPatch: (unitId: string, value: unknown) => CollectionUnitPatch | null,
): CollectionUnitPatch[] => {
  if (!sourceByUnit || typeof sourceByUnit !== 'object' || Array.isArray(sourceByUnit)) return [];

  return Object.entries(sourceByUnit as Record<string, unknown>).reduce<CollectionUnitPatch[]>((acc, [unitId, value]) => {
    const normalizedUnitId = normalizeUnitId(unitId);
    if (!normalizedUnitId) return acc;
    const patch = buildPatch(normalizedUnitId, value);
    if (patch) acc.push(patch);
    return acc;
  }, []);
};

const mergeCollectionUnitPatches = (
  currentCollectionState: unknown,
  patches: ReadonlyArray<CollectionUnitPatch>,
): UnknownRecord | null => {
  if (patches.length === 0) return null;

  const sourceState = isPlainRecord(currentCollectionState) ? currentCollectionState : {};
  const sourceUnits = Array.isArray(sourceState.units) ? sourceState.units : [];
  const mergedUnits = [...sourceUnits];
  const unitIndexById = new Map<string, number>();

  for (let index = 0; index < mergedUnits.length; index += 1) {
    const entry = mergedUnits[index];
    if (!isPlainRecord(entry)) continue;
    const rawUnitId = entry.unitId ?? entry.id ?? entry.key;
    const normalizedUnitId = normalizeUnitId(typeof rawUnitId === 'string' ? rawUnitId : '');
    if (!normalizedUnitId || unitIndexById.has(normalizedUnitId)) continue;
    unitIndexById.set(normalizedUnitId, index);
  }

  for (const patch of patches) {
    const index = unitIndexById.get(patch.unitId);
    if (typeof index === 'number') {
      const existing = mergedUnits[index];
      const nextEntry: Record<string, unknown> = isPlainRecord(existing) ? { ...existing } : { unitId: patch.unitId };
      mergedUnits[index] = { ...nextEntry, ...patch };
      continue;
    }
    unitIndexById.set(patch.unitId, mergedUnits.length);
    mergedUnits.push({ ...patch });
  }

  return {
    ...sourceState,
    units: mergedUnits,
  };
};

export function mergeProfileProgressIntoCollectionState(
  currentCollectionState: unknown,
  profile: ProfileProgressFields | null | undefined,
): UnknownRecord | null {
  if (!profile) return null;

  const patches: CollectionUnitPatch[] = [
    ...collectNormalizedUnitPatches(profile.tacticalAiByUnit, (unitId, gambit) => (
      Array.isArray(gambit) || isPlainRecord(gambit) ? { unitId, gambit } : null
    )),
    ...collectNormalizedUnitPatches(profile.cultivationByUnit, (unitId, progress) => {
      if (!isPlainRecord(progress)) return null;
      const realm = typeof progress.realm === 'number' && Number.isFinite(progress.realm) ? Math.max(1, Math.floor(progress.realm)) : null;
      const subRealm = typeof progress.subRealm === 'number' && Number.isFinite(progress.subRealm) ? Math.max(0, Math.floor(progress.subRealm)) : null;
      return realm != null || subRealm != null
        ? { unitId, ...(realm != null ? { realm } : {}), ...(subRealm != null ? { subRealm } : {}) }
        : null;
    }),
    ...collectNormalizedUnitPatches(profile.tpByUnit, (unitId, tp) => (
      typeof tp === 'number' && Number.isFinite(tp) ? { unitId, tp: Math.max(0, Math.floor(tp)) } : null
    )),
    ...collectNormalizedUnitPatches(profile.tpAllocByUnit, (unitId, tpAlloc) => (
      isPlainRecord(tpAlloc) ? { unitId, tpAlloc: { ...tpAlloc } } : null
    )),
    ...collectNormalizedUnitPatches(profile.ownedByUnit, (unitId, owned) => {
      const normalizedOwned = normalizeProfileBoolean(owned);
      return normalizedOwned != null ? { unitId, owned: normalizedOwned } : null;
    }),
...collectNormalizedUnitPatches(profile.equipmentByUnit, (unitId, equipment) => (
      isPlainRecord(equipment) ? { unitId, equipment: { ...equipment } } : null
    )),
  ];

  return mergeCollectionUnitPatches(currentCollectionState, patches);
}

