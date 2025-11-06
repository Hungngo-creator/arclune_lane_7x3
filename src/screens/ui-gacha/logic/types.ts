export type CurrencyCode = 'VNT' | 'HNT' | 'TNT' | 'ThNT' | 'TT';

export const CURRENCY_ORDER: readonly CurrencyCode[] = ['VNT', 'HNT', 'TNT', 'ThNT', 'TT'];

export type Wallet = Record<CurrencyCode, number>;

export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'Prime';

export const RARITY_ORDER: readonly Rarity[] = ['N', 'R', 'SR', 'SSR', 'UR', 'Prime'];

export interface FeaturedUnit {
  readonly id: string;
  readonly name: string;
  readonly rarity: Rarity;
  readonly portrait?: string | null;
}

export interface BannerRates {
  readonly [rarity: string]: number;
}

export interface BannerCostConfig {
  readonly unit: CurrencyCode;
  readonly x1: number;
  readonly x10: number;
}

export interface RateUpConfig {
  readonly share: number;
  readonly featuredByRarity: Readonly<Record<Rarity, readonly FeaturedUnit[]>>;
}

export interface SoftPityRule {
  readonly soft: number;
  readonly softStep: number;
}

export interface HardPityRule {
  readonly hard: number;
  readonly hardGuaranteeFeatured?: boolean;
}

export interface BannerPityConfig {
  readonly srFloor: number;
  readonly ssr?: SoftPityRule & HardPityRule & { carryOver?: boolean };
  readonly ur?: SoftPityRule & HardPityRule;
  readonly prime?: SoftPityRule & HardPityRule;
}

export interface BannerDefinition {
  readonly id: string;
  readonly label: string;
  readonly type: 'Permanent' | 'LimitedUR' | 'LimitedPrime';
  readonly expiresAt?: number | null;
  readonly rates: BannerRates;
  readonly pity: BannerPityConfig;
  readonly cost: BannerCostConfig;
  readonly featured: readonly FeaturedUnit[];
  readonly background?: string | null;
  readonly description?: string | null;
}

export interface GachaConfig {
  readonly currencies: readonly CurrencyCode[];
  readonly costs: Record<string, BannerCostConfig>;
  readonly rateUpShare: number;
  readonly banners: readonly BannerDefinition[];
}

export type CurrencyConversionStep = `${CurrencyCode}->${CurrencyCode}`;

export interface ConversionResult {
  readonly ok: boolean;
  readonly wallet: Wallet;
  readonly tax: number;
  readonly received: number;
  readonly spent: number;
  readonly step: CurrencyConversionStep;
}

export interface AutoConvertDetail {
  readonly from: CurrencyCode;
  readonly to: CurrencyCode;
  readonly units: number;
  readonly amount: number;
}

export interface PaymentDetail {
  readonly currency: CurrencyCode;
  readonly cost: number;
  readonly usedDirect: number;
  readonly conversions: readonly AutoConvertDetail[];
  readonly usedFromHigher: number;
  readonly remaining: number;
}

export interface PaymentResult {
  readonly ok: boolean;
  readonly wallet: Wallet;
  readonly detail: PaymentDetail | null;
}

export type RandomSource = () => number;

export interface PityCounters {
  sr: number;
  ssr: number;
  ur: number;
  prime: number;
}

export interface BannerState {
  pulls: number;
  pity: PityCounters;
}

export type BannerStateMap = Map<string, BannerState>;

export interface RollOutcome {
  readonly rarity: Rarity;
  readonly featured: boolean;
  readonly pityTriggered?: 'srFloor' | 'soft' | 'hard' | null;
  readonly guaranteedFeatured?: boolean | null;
}

export interface RollResult {
  readonly outcome: RollOutcome;
  readonly pity: PityCounters;
}
