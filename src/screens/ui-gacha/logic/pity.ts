import { RARITY_ORDER } from './types.ts';
import type {
  BannerDefinition,
  BannerState,
  BannerStateMap,
  PityCounters,
  RollOutcome,
  RollResult,
  Rarity,
} from './types.ts';

const RARITY_INDEX = new Map<Rarity, number>(RARITY_ORDER.map((rarity, index) => [rarity, index]));

function rarityAtLeast(rarity: Rarity, threshold: Rarity): boolean {
  const rarityIndex = RARITY_INDEX.get(rarity) ?? 0;
  const thresholdIndex = RARITY_INDEX.get(threshold) ?? 0;
  return rarityIndex >= thresholdIndex;
}

export function createEmptyPity(): PityCounters {
  return { sr: 0, ssr: 0, ur: 0, prime: 0 };
}

export function createBannerState(): BannerState {
  return { pulls: 0, pity: createEmptyPity() };
}

function getStateKey(banner: BannerDefinition): string {
  if (banner.type === 'Permanent' && banner.pity.ssr?.carryOver) {
    return 'Permanent';
  }
  return banner.id;
}

export function getBannerState(map: BannerStateMap, banner: BannerDefinition): BannerState {
  const key = getStateKey(banner);
  const existing = map.get(key);
  if (existing) {
    return existing;
  }
  const state = createBannerState();
  map.set(key, state);
  return state;
}

interface EffectiveRatesResult {
  readonly forced: Rarity | null;
  readonly srFloor: boolean;
  readonly rates: Record<Rarity, number>;
  readonly guaranteeFeatured: boolean;
}

function ensureRates(banner: BannerDefinition): Record<Rarity, number> {
  const rates: Record<Rarity, number> = {
    N: 0,
    R: 0,
    SR: 0,
    SSR: 0,
    UR: 0,
    Prime: 0,
  };
  for (const rarity of Object.keys(banner.rates) as Rarity[]) {
    const value = banner.rates[rarity];
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      rates[rarity] = value;
    }
  }
  return rates;
}

function computeSoftBonus(pulls: number, soft: number, step: number): number {
  if (!Number.isFinite(soft) || !Number.isFinite(step)) {
    return 0;
  }
  if (pulls + 1 <= soft) {
    return 0;
  }
  const extraPulls = pulls + 1 - soft;
  return extraPulls * step;
}

function applySoftPity(
  rarity: Rarity,
  pulls: number,
  rates: Record<Rarity, number>,
  soft?: number,
  step?: number,
): void {
  if (!soft || !step) {
    return;
  }
  const bonus = computeSoftBonus(pulls, soft, step);
  if (bonus <= 0) {
    return;
  }
  const current = rates[rarity] ?? 0;
  const next = Math.min(1, current + bonus);
  rates[rarity] = next;
}

function normalizeRates(rates: Record<Rarity, number>): Record<Rarity, number> {
  let total = 0;
  for (const rarity of RARITY_ORDER) {
    total += rates[rarity] ?? 0;
  }
  if (total <= 0) {
    return { ...rates };
  }
  const normalized: Record<Rarity, number> = { ...rates };
  for (const rarity of RARITY_ORDER) {
    normalized[rarity] = (rates[rarity] ?? 0) / total;
  }
  return normalized;
}

function computeEffectiveRates(
  banner: BannerDefinition,
  state: BannerState,
): EffectiveRatesResult {
  const baseRates = ensureRates(banner);
  const pity = state.pity;
  const srFloor = pity.sr >= (banner.pity.srFloor - 1);

  const ssrRule = banner.pity.ssr;
  const urRule = banner.pity.ur;
  const primeRule = banner.pity.prime;

  const nextSSR = pity.ssr + 1;
  const nextUR = pity.ur + 1;
  const nextPrime = pity.prime + 1;

  if (primeRule?.hard && nextPrime >= primeRule.hard) {
    return {
      forced: 'Prime',
      srFloor,
      rates: baseRates,
      guaranteeFeatured: Boolean(primeRule.hardGuaranteeFeatured),
    };
  }
  if (urRule?.hard && nextUR >= urRule.hard) {
    return {
      forced: 'UR',
      srFloor,
      rates: baseRates,
      guaranteeFeatured: Boolean(urRule.hardGuaranteeFeatured),
    };
  }
  if (ssrRule?.hard && nextSSR >= ssrRule.hard) {
    return { forced: 'SSR', srFloor, rates: baseRates, guaranteeFeatured: false };
  }

  const workingRates: Record<Rarity, number> = { ...baseRates };
  if (srFloor) {
    workingRates.N = 0;
    workingRates.R = 0;
  }

  if (primeRule) {
    applySoftPity('Prime', pity.prime, workingRates, primeRule.soft, primeRule.softStep);
  }
  if (urRule) {
    applySoftPity('UR', pity.ur, workingRates, urRule.soft, urRule.softStep);
  }
  if (ssrRule) {
    applySoftPity('SSR', pity.ssr, workingRates, ssrRule.soft, ssrRule.softStep);
  }

  const normalized = normalizeRates(workingRates);
  return { forced: null, srFloor, rates: normalized, guaranteeFeatured: false };
}

function pickRarity(rates: Record<Rarity, number>, random: number): Rarity {
  let cumulative = 0;
  for (const rarity of RARITY_ORDER) {
    const value = rates[rarity] ?? 0;
    cumulative += value;
    if (random <= cumulative + 1e-8) {
      return rarity;
    }
  }
  return 'N';
}

export function rollOnce(
  banner: BannerDefinition,
  state: BannerState,
  rng: () => number,
): RollOutcome {
  const effective = computeEffectiveRates(banner, state);
  let rarity: Rarity;
  let pityTriggered: RollOutcome['pityTriggered'] = null;
  let guaranteedFeatured = false;
  if (effective.forced) {
    rarity = effective.forced;
    pityTriggered = 'hard';
    guaranteedFeatured = effective.guaranteeFeatured;
  } else {
    const randomValue = Math.max(0, Math.min(0.999999, rng()));
    rarity = pickRarity(effective.rates, randomValue);
    if (effective.srFloor && !rarityAtLeast(rarity, 'SR')) {
      rarity = 'SR';
      pityTriggered = 'srFloor';
    }
    if (!pityTriggered && rarity === 'SSR' && banner.pity.ssr && state.pity.ssr + 1 > banner.pity.ssr.soft) {
      pityTriggered = 'soft';
    }
    if (!pityTriggered && rarity === 'UR' && banner.pity.ur && state.pity.ur + 1 > banner.pity.ur.soft) {
      pityTriggered = 'soft';
    }
    if (!pityTriggered && rarity === 'Prime' && banner.pity.prime && state.pity.prime + 1 > banner.pity.prime.soft) {
      pityTriggered = 'soft';
    }
  }
  return { rarity, featured: false, pityTriggered, guaranteedFeatured };
}

function resetCountersAfterHit(state: BannerState, rarity: Rarity): void {
  state.pity.sr += 1;
  if (rarityAtLeast(rarity, 'SR')) {
    state.pity.sr = 0;
  }

  state.pity.ssr += 1;
  if (rarity === 'SSR' || rarity === 'UR' || rarity === 'Prime') {
    state.pity.ssr = 0;
  }

  state.pity.ur += 1;
  if (rarity === 'UR' || rarity === 'Prime') {
    state.pity.ur = 0;
  }

  state.pity.prime += 1;
  if (rarity === 'Prime') {
    state.pity.prime = 0;
  }
}

export function applyRoll(
  banner: BannerDefinition,
  state: BannerState,
  rng: () => number,
  pickFeatured: (rarity: Rarity, forced: boolean) => boolean,
): RollResult {
  const outcome = rollOnce(banner, state, rng);
  resetCountersAfterHit(state, outcome.rarity);
  state.pulls += 1;
  const featured = pickFeatured(outcome.rarity, outcome.guaranteedFeatured === true);
  return {
    outcome: { ...outcome, featured },
    pity: { ...state.pity },
  };
}
