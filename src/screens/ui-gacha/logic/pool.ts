import { ROSTER } from '../../../catalog.ts';
import { normalizeUnitId } from '../../../utils/unit-id.ts';
import { RARITY_ORDER, type BannerDefinition, type FeaturedUnit, type Rarity } from './types.ts';

const EXCLUDED_GACHA_TAGS = new Set(['npc', 'pve', 'pve_only']);
const EXCLUDED_GACHA_IDS = new Set(['creep_1', 'creep_2', 'creep_3']);
const PERMANENT_POOL_RARITIES = new Set<Rarity>(['N', 'R', 'SR', 'SSR']);
const VALID_RARITIES = new Set<Rarity>(RARITY_ORDER);

export interface GachaPoolUnit extends FeaturedUnit {
  readonly source: unknown;
}

type RosterLikeEntry = {
  readonly id?: unknown;
  readonly key?: unknown;
  readonly name?: unknown;
  readonly title?: unknown;
  readonly rank?: unknown;
  readonly rarity?: unknown;
  readonly tier?: unknown;
  readonly portrait?: unknown;
  readonly avatar?: unknown;
  readonly icon?: unknown;
  readonly tags?: unknown;
  readonly notes?: unknown;
  readonly isNpc?: unknown;
};

const toStringValue = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export function normalizeGachaRarity(value: unknown): Rarity | null {
  const text = toStringValue(value);
  if (!text) return null;
  const matched = RARITY_ORDER.find((rarity) => rarity.toLowerCase() === text.toLowerCase());
  return matched && VALID_RARITIES.has(matched) ? matched : null;
}

const readRank = (entry: RosterLikeEntry): Rarity | null => (
  normalizeGachaRarity(entry.rank)
  ?? normalizeGachaRarity(entry.rarity)
  ?? normalizeGachaRarity(entry.tier)
);

const readTags = (entry: RosterLikeEntry): string[] => {
  if (!Array.isArray(entry.tags)) return [];
  return entry.tags
    .map((tag) => toStringValue(tag)?.toLowerCase() ?? null)
    .filter((tag): tag is string => Boolean(tag));
};

const hasExcludedNotes = (entry: RosterLikeEntry): boolean => {
  const notes = toStringValue(entry.notes)?.toLowerCase();
  if (!notes) return false;
  return notes.includes('pve_only') || notes.includes('npc') || notes.includes('pve');
};

export function isGachaSummonableCatalogUnit(entry: unknown): entry is RosterLikeEntry {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
  const record = entry as RosterLikeEntry;
  const id = toStringValue(record.id ?? record.key);
  if (!id || EXCLUDED_GACHA_IDS.has(normalizeUnitId(id))) return false;
  if (record.isNpc === true) return false;
  if (!readRank(record)) return false;
  if (readTags(record).some((tag) => EXCLUDED_GACHA_TAGS.has(tag))) return false;
  return !hasExcludedNotes(record);
}

export function toGachaPoolUnit(entry: unknown): GachaPoolUnit | null {
  if (!isGachaSummonableCatalogUnit(entry)) return null;
  const id = toStringValue(entry.id ?? entry.key);
  const rarity = readRank(entry);
  if (!id || !rarity) return null;
  const normalizedId = normalizeUnitId(id);
  return {
    id: normalizedId,
    name: toStringValue(entry.name ?? entry.title) ?? normalizedId,
    rarity,
    portrait: toStringValue(entry.portrait ?? entry.avatar ?? entry.icon),
    isNpc: false,
    tags: readTags(entry),
    source: entry,
  };
}

export function createGachaPool(source: readonly unknown[] = ROSTER): GachaPoolUnit[] {
  const pool: GachaPoolUnit[] = [];
  const seen = new Set<string>();
  for (const entry of source) {
    const unit = toGachaPoolUnit(entry);
    if (!unit || seen.has(unit.id)) continue;
    seen.add(unit.id);
    pool.push(unit);
  }
  return pool;
}

export function getPermanentGachaPool(source?: readonly unknown[]): GachaPoolUnit[] {
  return createGachaPool(source).filter((unit) => PERMANENT_POOL_RARITIES.has(unit.rarity));
}

export function getBannerFallbackPool(banner: BannerDefinition, source?: readonly unknown[]): GachaPoolUnit[] {
  if (banner.type === 'Permanent') {
    return getPermanentGachaPool(source);
  }
  return createGachaPool(source);
}

export function getBannerPoolByRarity(
  banner: BannerDefinition,
  rarity: Rarity,
  source?: readonly unknown[],
): GachaPoolUnit[] {
  return getBannerFallbackPool(banner, source).filter((unit) => unit.rarity === rarity);
}

