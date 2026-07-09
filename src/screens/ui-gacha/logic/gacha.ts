//home (termux)/arclune_lane_7x3/src/screens/ui-gacha/logic/gacha.ts
import { GACHA_CONFIG } from './config.ts';
import { applyRoll, getBannerState } from './pity.ts';
import {
  type BannerDefinition,
  type BannerStateMap,
  type FeaturedUnit,
  type RandomSource,
  type RollResult,
  type Rarity,
} from './types.ts';
import { getBannerPoolByRarity, isGachaSummonableCatalogUnit } from './pool.ts';

const DEFAULT_RANDOM: RandomSource = () => Math.random();

function pickUnitFromPool<TUnit extends FeaturedUnit>(pool: readonly TUnit[], rng: RandomSource): TUnit | null {
  if (pool.length === 0) {
    return null;
  }
  const normalized = Math.max(0, Math.min(0.999999, rng()));
  return pool[Math.floor(normalized * pool.length)] ?? null;
}

function resolveRollUnit(
  banner: BannerDefinition,
  result: RollResult,
  rng: RandomSource,
): RollResult {
  const rarity = result.outcome.rarity;
  const featuredPool = result.outcome.featured ? getSummonableFeaturedByRarity(banner, rarity) : [];
  const pool = featuredPool.length > 0 ? featuredPool : getBannerPoolByRarity(banner, rarity);
  const unit = pickUnitFromPool(pool, rng);
  if (!unit && typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(`[gacha] Empty unit pool for ${banner.id}/${rarity}; roll will not unlock a unit.`);
  }
  return { ...result, unit };
}

const FEATURED_SUMMONABLE_CACHE = new WeakMap<BannerDefinition, FeaturedUnit[]>();
const FEATURED_BY_RARITY_CACHE = new WeakMap<BannerDefinition, Map<Rarity, FeaturedUnit[]>>();
let bannerLookupSource: ReadonlyArray<BannerDefinition> | null = null;
let bannerLookupById = new Map<string, BannerDefinition>();

function getBannerLookup(): Map<string, BannerDefinition> {
  const currentSource = GACHA_CONFIG.banners;
  if (bannerLookupSource === currentSource) {
    return bannerLookupById;
  }
  bannerLookupSource = currentSource;
  bannerLookupById = new Map(currentSource.map((entry) => [entry.id, entry] as const));
  return bannerLookupById;
}

export function isGachaSummonableFeaturedUnit(entry: FeaturedUnit): boolean {
  return isGachaSummonableCatalogUnit(entry);
}

export function getSummonableFeaturedUnits(banner: BannerDefinition): FeaturedUnit[] {
  const cached = FEATURED_SUMMONABLE_CACHE.get(banner);
  if (cached) {
    return cached;
  }
  const filtered = banner.featured.filter(isGachaSummonableFeaturedUnit);
  FEATURED_SUMMONABLE_CACHE.set(banner, filtered);
  return filtered;
}

function getSummonableFeaturedByRarity(banner: BannerDefinition, rarity: Rarity): FeaturedUnit[] {
  let rarityMap = FEATURED_BY_RARITY_CACHE.get(banner);
  if (!rarityMap) {
    rarityMap = new Map<Rarity, FeaturedUnit[]>();
    FEATURED_BY_RARITY_CACHE.set(banner, rarityMap);
  }
  const cached = rarityMap.get(rarity);
  if (cached) {
    return cached;
  }
  const matched = getSummonableFeaturedUnits(banner).filter((entry) => entry.rarity === rarity);
  rarityMap.set(rarity, matched);
  return matched;
}

function shouldHitFeatured(
  banner: BannerDefinition,
  rarity: Rarity,
  forced: boolean,
  rng: RandomSource,
): boolean {
  if (forced) {
    return true;
  }
  const featured = getSummonableFeaturedByRarity(banner, rarity);
  if (featured.length === 0) {
    return false;
  }
  const share = GACHA_CONFIG.rateUpShare;
  const roll = rng();
  return roll < share;
}

export function rollBanner(
  banner: BannerDefinition,
  stateMap: BannerStateMap,
  options: { rng?: RandomSource; featuredRng?: RandomSource; unitRng?: RandomSource } = {},
): RollResult {
  const rng = options.rng ?? DEFAULT_RANDOM;
  const featuredRng = options.featuredRng ?? DEFAULT_RANDOM;
  const unitRng = options.unitRng ?? featuredRng;
  const state = getBannerState(stateMap, banner);
  const result = applyRoll(banner, state, rng, (rarity, forced) => shouldHitFeatured(banner, rarity, forced, featuredRng));
  return resolveRollUnit(banner, result, unitRng);
}

export function multiRoll(
  banner: BannerDefinition,
  stateMap: BannerStateMap,
  count: number,
  options: { rng?: RandomSource; featuredRng?: RandomSource; unitRng?: RandomSource } = {},
): RollResult[] {
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (total === 0) {
    return [];
  }

  const rng = options.rng ?? DEFAULT_RANDOM;
  const featuredRng = options.featuredRng ?? DEFAULT_RANDOM;
  const unitRng = options.unitRng ?? featuredRng;
  const state = getBannerState(stateMap, banner);
  const chooseFeatured = (rarity: Rarity, forced: boolean): boolean => (
    shouldHitFeatured(banner, rarity, forced, featuredRng)
  );

  const results = new Array<RollResult>(total);
  for (let i = 0; i < total; i += 1) {
    results[i] = resolveRollUnit(banner, applyRoll(banner, state, rng, chooseFeatured), unitRng);
  }
  return results;
}

export function getBannerById(id: string): BannerDefinition | null {
  return getBannerLookup().get(id) ?? null;
}