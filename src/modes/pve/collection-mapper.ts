import { Meta, makeInstanceStats } from '../../meta.ts';
import { TP_DELTA } from '../../data/roster-preview.ts';y

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
const PROGRESS_LIST_CACHE = new WeakMap<object, Map<string, RuntimeUnitProgress>>();

const GAMBITS_MAX_SLOTS = 5;
const GAMBITS_CONDITIONS = new Set<GambitConditionType>([
  'self_hp_below',
  'self_has_debuff',
  'ally_lowest_hp',
  'ally_controlled',
  'pool_aether_above',
  'enemy_lowest_hp',
  'enemy_is_boss',
  'enemy_role_is',
  'enemy_has_shield',
  'always',
]);
const GAMBITS_ACTIONS = new Set<GambitActionType>(['basic', 'skill1', 'skill2', 'skill3']);

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

const getCollectionEntries = (collectionState: CollectionStateInput | null | undefined): ReadonlyArray<unknown> => {
  if (!collectionState || typeof collectionState !== 'object') return [];
  const source = collectionState as Record<string, unknown>;
  const list = source.units ?? source.ownedUnits ?? source.roster ?? source.collection;
  if (!Array.isArray(list)) return [];
  return list;
};

const normalizeInteger = (value: unknown, min: number): number | null => {
  const numeric = asFinite(value);
  if (numeric == null) return null;
  return Math.max(min, Math.floor(numeric));
};

const normalizeIntegerWithFallback = (value: unknown, min: number, fallback: number): number => (
  normalizeInteger(value, min) ?? fallback
);

const readSkinKey = (entry: CollectionItemCandidate): string | null => {
  for (const key of SKIN_FIELD_KEYS) {
    const value = entry[key];
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return null;
};

const INSTANCE_STAT_BY_TP_STAT: Readonly<Record<string, keyof InstanceStats>> = Object.freeze({
  HP: 'hpMax',
  ATK: 'atk',
  WIL: 'wil',
  ARM: 'arm',
  RES: 'res',
  AGI: 'agi',
  PER: 'per',
  AEmax: 'aeMax',
  AEregen: 'aeRegen',
  HPregen: 'hpRegen',
});

const normalizeTpAlloc = (value: unknown): Record<string, number> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const normalized: Record<string, number> = {};
  for (const [stat, rawAmount] of Object.entries(value as Record<string, unknown>)) {
    const amount = asFinite(rawAmount);
    if (amount == null || amount === 0 || typeof TP_DELTA[stat] !== 'number') continue;
    normalized[stat] = amount;
  }
  return Object.keys(normalized).length > 0 ? normalized : null;
};

const applyTpAllocToInstanceStats = (
  stats: InstanceStats,
  tpAlloc: RuntimeUnitProgress['tpAlloc'] | null | undefined,
): InstanceStats => {
  if (!tpAlloc) return stats;
  let out: InstanceStats | null = null;
  for (const [stat, amount] of Object.entries(tpAlloc)) {
    const delta = TP_DELTA[stat];
    const instanceKey = INSTANCE_STAT_BY_TP_STAT[stat];
    if (typeof delta !== 'number' || !instanceKey || !Number.isFinite(amount) || amount === 0) continue;
    if (!out) out = { ...stats };
    const bonus = delta * amount;
    out[instanceKey] = (out[instanceKey] ?? 0) + bonus;
    if (instanceKey === 'hpMax') {
      out.hp = (out.hp ?? 0) + bonus;
    }
  }
  return out ?? stats;
};

const normalizeProgress = (entry: CollectionItemCandidate): RuntimeUnitProgress | null => {
  const unitId = readUnitId(entry);
  if (!unitId) return null;

  const level = asFinite(entry.level ?? entry.lv);
  const realm = asFinite(entry.realm);
  const subRealm = asFinite(entry.subRealm ?? entry.sub_realm);
  const stars = asFinite(entry.stars ?? entry.star);
  const tp = asFinite(entry.tp ?? entry.talentPoint ?? entry.talentPoints);
  const tpAlloc = normalizeTpAlloc(entry.tpAlloc ?? entry.tpAllocation ?? entry.talentAllocation ?? entry.talentAlloc);
  const owned = asBoolean(entry.owned ?? entry.unlocked ?? entry.isOwned);
  const awakened = asBoolean(entry.awakened ?? entry.isAwakened);
  const inLineup = asBoolean(entry.inLineup ?? entry.isInLineup);
  const skinKey = readSkinKey(entry);

  const gambit = normalizeGambitSlots(entry.gambit ?? entry.tacticalAi);

  const normalizedLevel = normalizeInteger(level, 1);
  const normalizedRealm = normalizeInteger(realm, 0);
  const normalizedSubRealm = normalizeInteger(subRealm, 0);
  const normalizedStars = normalizeInteger(stars, 0);
  const normalizedTp = normalizeInteger(tp, 0);

  const progress: RuntimeUnitProgress = {
    unitId,
    ...(normalizedLevel != null ? { level: normalizedLevel } : {}),
    ...(normalizedRealm != null ? { realm: normalizedRealm } : {}),
    ...(normalizedSubRealm != null ? { subRealm: normalizedSubRealm } : {}),
    ...(normalizedStars != null ? { stars: normalizedStars } : {}),
    ...(normalizedTp != null ? { tp: normalizedTp } : {}),
    ...(tpAlloc ? { tpAlloc } : {}),
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

  const entries = getCollectionEntries(collectionState);
  const listCacheKey = Array.isArray(entries) ? (entries as object) : null;
  if (listCacheKey){
    const cached = PROGRESS_LIST_CACHE.get(listCacheKey);
    if (cached){
      if (collectionState && typeof collectionState === 'object') {
        PROGRESS_MAP_CACHE.set(collectionState as object, cached);
      }
      return cached;
    }
  }

  const out = new Map<string, RuntimeUnitProgress>();
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)){
      continue;
    }
    const normalized = normalizeProgress(entry as CollectionItemCandidate);
    if (!normalized) continue;
    out.set(normalized.unitId, normalized);
  }

    if (listCacheKey){
    PROGRESS_LIST_CACHE.set(listCacheKey, out);
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
  const level = normalizeIntegerWithFallback(progress?.level, 1, 1);
  const realm = normalizeIntegerWithFallback(progress?.realm, 0, 0);
  const subRealm = normalizeIntegerWithFallback(progress?.subRealm, 0, 0);
  const stars = normalizeIntegerWithFallback(progress?.stars, 0, 0);

  const stats = applyTpAllocToInstanceStats(
    meta ? makeInstanceStats(unitId, level, stars) : makeInstanceStats(unitId),
    progress?.tpAlloc,
  );
  return {
    ...stats,
    level,
    realm,
    subRealm,
    stars,
  };
}
