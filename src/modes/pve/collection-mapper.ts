import { Meta, makeInstanceStats } from '../../meta.ts';

import type { InstanceStats } from '../../meta.ts';
import type {
  CollectionStateInput,
  GambitActionType,
  GambitConditionType,
  GambitSlotInput,
  GambitSlotsContainerInput,
  RuntimeGambitSlot,
  RuntimeUnitProgress,
} from '@shared-types/pve';

type CollectionItemCandidate = Record<string, unknown>;

const SKIN_FIELD_KEYS = ['skinKey', 'skin', 'avatarSkin', 'selectedSkin'] as const;
const PROGRESS_MAP_CACHE = new WeakMap<object, Map<string, RuntimeUnitProgress>>();

const GAMBITS_MAX_SLOTS = 5;
const GAMBITS_CONDITIONS = new Set<GambitConditionType>([
  'self_hp_below',
  'self_has_debuff',
  'self_full_fury',
  'ally_lowest_hp',
  'ally_controlled',
  'pool_aether_above',
  'enemy_lowest_hp',
  'enemy_is_boss',
  'enemy_role_is',
  'enemy_has_shield',
  'always',
]);
const GAMBITS_ACTIONS = new Set<GambitActionType>(['basic', 'ult', 'skill1', 'skill2', 'skill3']);

const extractGambitSlots = (value: unknown): ReadonlyArray<GambitSlotInput> | null => {
  if (Array.isArray(value)) return value as ReadonlyArray<GambitSlotInput>;
  if (!value || typeof value !== 'object') return null;
  const container = value as GambitSlotsContainerInput;
  const candidates = [container.slots, container.rows, container.gambit, container.tacticalAi];
  return candidates.find((entry): entry is ReadonlyArray<GambitSlotInput> => Array.isArray(entry)) ?? null;
};

const normalizeGambitSlots = (value: unknown): RuntimeGambitSlot[] | undefined => {
  const slots = extractGambitSlots(value);
  if (!slots) return undefined;
  const normalized: RuntimeGambitSlot[] = [];
  for (const raw of slots.slice(0, GAMBITS_MAX_SLOTS)) {
    if (!raw || typeof raw !== 'object') continue;
    const slot = raw as GambitSlotInput;
    const condition = typeof slot.condition === 'string' && GAMBITS_CONDITIONS.has(slot.condition as GambitConditionType)
      ? (slot.condition as GambitConditionType)
      : null;
    const action = typeof slot.action === 'string' && GAMBITS_ACTIONS.has(slot.action as GambitActionType)
      ? (slot.action as GambitActionType)
      : null;
    if (!condition || !action) continue;

    const threshold = asFinite(slot.threshold);
    const targetRole = typeof slot.targetRole === 'string' && slot.targetRole.trim() ? slot.targetRole.trim() : undefined;
    const enabled = asBoolean(slot.enabled);

    normalized.push({
      condition,
      action,
      ...(threshold != null ? { threshold } : {}),
      ...(targetRole ? { targetRole } : {}),
      enabled: enabled ?? true,
    });
  }

  return normalized.length > 0 ? normalized : undefined;
};

const asFinite = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
    if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  }
  return null;
};

const readUnitId = (entry: CollectionItemCandidate): string | null => {
  const raw = entry.unitId ?? entry.id ?? entry.key;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
};

const getCollectionEntries = (collectionState: CollectionStateInput | null | undefined): ReadonlyArray<CollectionItemCandidate> => {
  if (!collectionState || typeof collectionState !== 'object') return [];
  const source = collectionState as Record<string, unknown>;
  const list = source.units ?? source.ownedUnits ?? source.roster ?? source.collection;
  if (!Array.isArray(list)) return [];
  return list.filter((item): item is CollectionItemCandidate => Boolean(item && typeof item === 'object'));
};

const normalizeProgress = (entry: CollectionItemCandidate): RuntimeUnitProgress | null => {
  const unitId = readUnitId(entry);
  if (!unitId) return null;

  const level = asFinite(entry.level ?? entry.lv);
  const realm = asFinite(entry.realm);
  const subRealm = asFinite(entry.subRealm ?? entry.sub_realm);
  const stars = asFinite(entry.stars ?? entry.star);
  const owned = asBoolean(entry.owned ?? entry.unlocked ?? entry.isOwned);
  const awakened = asBoolean(entry.awakened ?? entry.isAwakened);
  const inLineup = asBoolean(entry.inLineup ?? entry.isInLineup);
  const rawSkin = SKIN_FIELD_KEYS
    .map((key) => entry[key])
    .find((value) => typeof value === 'string' && value.trim() !== '');
  const skinKey = typeof rawSkin === 'string' ? rawSkin.trim() : null;

  const gambit = normalizeGambitSlots(entry.gambit ?? entry.tacticalAi);

  const progress: RuntimeUnitProgress = {
    unitId,
    ...(level != null ? { level: Math.max(1, Math.floor(level)) } : {}),
    ...(realm != null ? { realm: Math.max(0, Math.floor(realm)) } : {}),
    ...(subRealm != null ? { subRealm: Math.max(0, Math.floor(subRealm)) } : {}),
    ...(stars != null ? { stars: Math.max(0, Math.floor(stars)) } : {}),
    ...(owned != null ? { owned } : {}),
    ...(awakened != null ? { awakened } : {}),
    ...(inLineup != null ? { inLineup } : {}),
    ...(skinKey ? { skinKey } : {}),
    ...(gambit ? { gambit } : {}),
  };

  return progress;
};

export function mapUnitProgressById(collectionState: CollectionStateInput | null | undefined): Map<string, RuntimeUnitProgress> {
  if (collectionState && typeof collectionState === 'object') {
    const cached = PROGRESS_MAP_CACHE.get(collectionState as object);
    if (cached) return cached;
  }

  const out = new Map<string, RuntimeUnitProgress>();
  const entries = getCollectionEntries(collectionState);
  for (const entry of entries) {
    const normalized = normalizeProgress(entry);
    if (!normalized) continue;
    out.set(normalized.unitId, normalized);
  }

  if (collectionState && typeof collectionState === 'object') {
    PROGRESS_MAP_CACHE.set(collectionState as object, out);
  }

  return out;
}

export function resolveRuntimeUnitStats(
  unitId: string,
  progressMap: ReadonlyMap<string, RuntimeUnitProgress> | null | undefined,
): InstanceStats & Pick<RuntimeUnitProgress, 'level' | 'realm' | 'subRealm' | 'stars'> {
  const meta = Meta.get(unitId);
  const progress = progressMap?.get(unitId);
  const level = Math.max(1, Math.floor(progress?.level ?? 1));
  const realm = Math.max(0, Math.floor(progress?.realm ?? 0));
  const subRealm = Math.max(0, Math.floor(progress?.subRealm ?? 0));
  const stars = Math.max(0, Math.floor(progress?.stars ?? 0));

  const stats = meta ? makeInstanceStats(unitId, level, stars) : makeInstanceStats(unitId);
  return {
    ...stats,
    level,
    realm,
    subRealm,
    stars,
  };
}
