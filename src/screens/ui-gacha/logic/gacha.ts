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

const DEFAULT_RANDOM: RandomSource = () => Math.random();

const EXCLUDED_GACHA_TAGS = new Set(['npc', 'pve']);
const FEATURED_SUMMONABLE_CACHE = new WeakMap<BannerDefinition, FeaturedUnit[]>();
const FEATURED_BY_RARITY_CACHE = new WeakMap<BannerDefinition, Map<Rarity, FeaturedUnit[]>>();

export function isGachaSummonableFeaturedUnit(entry: FeaturedUnit): boolean {
  if (!entry || typeof entry !== 'object') return false;
  if (entry.isNpc === true) return false;
  if (!Array.isArray(entry.tags)) return true;
  return !entry.tags.some((tag) => typeof tag === 'string' && EXCLUDED_GACHA_TAGS.has(tag.trim().toLowerCase()));
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
  const featured = getSummonableFeaturedByRarity(banner, rarity);
  if (featured.length === 0) {
    return false;
  }
  if (forced) {
    return true;
  }
  const share = GACHA_CONFIG.rateUpShare;
  const roll = rng();
  return roll < share;
}

export function rollBanner(
  banner: BannerDefinition,
  stateMap: BannerStateMap,
  options: { rng?: RandomSource; featuredRng?: RandomSource } = {},
): RollResult {
  const rng = options.rng ?? DEFAULT_RANDOM;
  const featuredRng = options.featuredRng ?? DEFAULT_RANDOM;
  const state = getBannerState(stateMap, banner);
  return applyRoll(banner, state, rng, (rarity, forced) => shouldHitFeatured(banner, rarity, forced, featuredRng));
}

export function multiRoll(
  banner: BannerDefinition,
  stateMap: BannerStateMap,
  count: number,
  options: { rng?: RandomSource; featuredRng?: RandomSource } = {},
): RollResult[] {
  const results: RollResult[] = [];
  for (let i = 0; i < count; i += 1) {
    results.push(rollBanner(banner, stateMap, options));
  }
  return results;
}

export function getBannerById(id: string): BannerDefinition | null {
  return GACHA_CONFIG.banners.find((entry) => entry.id === id) ?? null;
}