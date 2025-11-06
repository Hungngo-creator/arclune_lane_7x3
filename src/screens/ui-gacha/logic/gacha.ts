import { GACHA_CONFIG } from './config.ts';
import { applyRoll, getBannerState } from './pity.ts';
import {
  type BannerDefinition,
  type BannerStateMap,
  type RandomSource,
  type RollResult,
  type Rarity,
} from './types.ts';

const DEFAULT_RANDOM: RandomSource = () => Math.random();

function shouldHitFeatured(
  banner: BannerDefinition,
  rarity: Rarity,
  forced: boolean,
  rng: RandomSource,
): boolean {
  const featured = banner.featured.filter((entry) => entry.rarity === rarity);
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
