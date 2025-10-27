import { z } from 'zod';

import { HAS_INTL_NUMBER_FORMAT, createNumberFormatter } from '../utils/format.ts';
import { loadConfig } from './load-config.ts';

import type {
  CurrencyDefinition,
  LotterySplit,
  PityConfiguration,
  ShopTaxBracket
} from '@types/config';

type CurrencyId = 'VNT' | 'HNT' | 'TNT' | 'ThNT' | 'TT';
const CurrencyIdSchema = z.enum(['VNT', 'HNT', 'TNT', 'ThNT', 'TT'] as [string, ...string[]]);
const currencyIdValues: CurrencyId[] = ['VNT', 'HNT', 'TNT', 'ThNT', 'TT'];

const CurrencySchema = z.object({
  id: CurrencyIdSchema,
  name: z.string(),
  shortName: z.string(),
  suffix: z.string(),
  ratioToBase: z.number(),
  description: z.string().optional()
});

const PityRuleSchema = z.object({ tier: z.string(), pull: z.number() });

const PityEntrySchema = z.object({
  tier: z.string(),
  hardPity: z.number(),
  softGuarantees: z.array(PityRuleSchema)
});

const PityTierSchema = z.enum(['SSR', 'UR', 'PRIME']);
type PityTier = z.infer<typeof PityTierSchema>;

const PityConfigSchema = z.object({
  SSR: PityEntrySchema,
  UR: PityEntrySchema,
  PRIME: PityEntrySchema
});

const ShopRankSchema = z.enum(['N', 'R', 'SR', 'SSR', 'UR', 'PRIME']);

const ShopTaxBracketSchema = z.object({
  rank: ShopRankSchema,
  label: z.string(),
  rate: z.number()
});

const LotterySplitSchema = z.object({
  devVault: z.number(),
  prizePool: z.number()
});

const EconomyConfigSchema = z.object({
  currencies: z.array(CurrencySchema),
  pityConfig: PityConfigSchema,
  shopTaxBrackets: z.array(ShopTaxBracketSchema),
  lotterySplit: LotterySplitSchema
});

const economyConfig = await loadConfig(
  new URL('./economy.config.ts', import.meta.url),
  EconomyConfigSchema
);

for (const [tier, entry] of Object.entries(economyConfig.pityConfig)){
  if (entry.tier !== tier){
    throw new Error(`Cấu hình pity cho tier "${tier}" không khớp giá trị nội tại (${entry.tier}).`);
  }
}

const currencyIdMap = {} as Record<CurrencyId, CurrencyId>;
for (const id of currencyIdValues){
  currencyIdMap[id] = id;
}

const CURRENCY_IDS = Object.freeze({
  ...currencyIdMap,
  THNT: currencyIdMap.ThNT
});

const CURRENCIES: ReadonlyArray<CurrencyDefinition> = Object.freeze(
  economyConfig.currencies.map((currency) => Object.freeze({ ...currency }))
);

const CURRENCY_INDEX: Readonly<Record<string, CurrencyDefinition>> = CURRENCIES.reduce<Record<string, CurrencyDefinition>>((acc, currency) => {
  acc[currency.id] = currency;
  return acc;
}, {});

function getCurrency(currencyId: string): CurrencyDefinition | null {
  return CURRENCY_INDEX[currencyId] ?? null;
}

function listCurrencies(): CurrencyDefinition[] {
  return [...CURRENCIES];
}

function convertCurrency(value: number, fromId: string, toId: string): number {
  const from = getCurrency(fromId);
  const to = getCurrency(toId);
  if (!from || !to){
    throw new Error(`Invalid currency conversion from ${fromId} to ${toId}`);
  }
  const valueInBase = value * from.ratioToBase;
  return valueInBase / to.ratioToBase;
}

const FORMATTER_STANDARD = createNumberFormatter('vi-VN', {
  maximumFractionDigits: 0
});

let FORMATTER_COMPACT = FORMATTER_STANDARD;
let HAS_COMPACT_FORMAT = false;
if (HAS_INTL_NUMBER_FORMAT){
  try {
    FORMATTER_COMPACT = createNumberFormatter('vi-VN', {
      notation: 'compact',
      maximumFractionDigits: 1
    });
    HAS_COMPACT_FORMAT = true;
  } catch (error) {
    FORMATTER_COMPACT = FORMATTER_STANDARD;
  }
}

interface FormatBalanceOptions {
  notation?: 'standard' | 'compact';
  includeSuffix?: boolean;
  precision?: number;
  autoScale?: boolean;
}

function formatBalance(value: number, currencyId: string, options: FormatBalanceOptions = {}){
  const currency = getCurrency(currencyId);
  if (!currency){
    throw new Error(`Unknown currency id: ${currencyId}`);
  }

  const {
    notation = 'standard',
    includeSuffix = true,
    precision,
    autoScale = false
  } = options;

  let amount = value;
  let suffix = currency.suffix;

  if (autoScale){
    const ordered = [...CURRENCIES].sort((a, b) => a.ratioToBase - b.ratioToBase);
    for (let i = ordered.length - 1; i >= 0; i -= 1){
      const candidate = ordered[i];
      if (!candidate) continue;
      const inCandidate = convertCurrency(value, currency.id, candidate.id);
      if (Math.abs(inCandidate) >= 1){
        amount = inCandidate;
        suffix = candidate.suffix;
        break;
      }
    }
  }

  const shouldUseCompact = notation === 'compact' && HAS_COMPACT_FORMAT;

  let formatter = shouldUseCompact ? FORMATTER_COMPACT : FORMATTER_STANDARD;
  if (typeof precision === 'number'){
    const formatterOptions: Intl.NumberFormatOptions = {
      maximumFractionDigits: precision,
      minimumFractionDigits: precision
    };
    if (shouldUseCompact && HAS_INTL_NUMBER_FORMAT){
      formatterOptions.notation = 'compact';
    }
    formatter = createNumberFormatter('vi-VN', formatterOptions);
  }

  const formatted = formatter.format(amount);
  return includeSuffix ? `${formatted} ${suffix}` : formatted;
}

const PITY_CONFIG: Readonly<Record<PityTier, PityConfiguration>> = Object.freeze(
  Object.fromEntries(
    Object.entries(economyConfig.pityConfig).map(([tier, config]) => [
      tier,
      {
        tier: config.tier,
        hardPity: config.hardPity,
        softGuarantees: config.softGuarantees.map((rule) => ({ ...rule }))
      }
    ])
  ) as Record<PityTier, PityConfiguration>
);

function isPityTier(tier: string): tier is PityTier {
  return tier in PITY_CONFIG;
}

function getPityConfig(tier: string): PityConfiguration | null {
  if (isPityTier(tier)){
    return PITY_CONFIG[tier] ?? null;
  }
  return null;
}

function listPityTiers(): string[] {
  return Object.keys(PITY_CONFIG);
}

const SHOP_TAX_BRACKETS: ReadonlyArray<ShopTaxBracket> = Object.freeze(
  economyConfig.shopTaxBrackets.map((bracket) => Object.freeze({ ...bracket }))
);

const SHOP_TAX_INDEX: Readonly<Record<string, ShopTaxBracket>> = SHOP_TAX_BRACKETS.reduce<Record<string, ShopTaxBracket>>((acc, bracket) => {
  acc[bracket.rank] = bracket;
  return acc;
}, {});

function getShopTaxBracket(rank: string): ShopTaxBracket | null {
  return SHOP_TAX_INDEX[rank] ?? null;
}

function getShopTaxRate(rank: string): number | null {
  const bracket = getShopTaxBracket(rank);
  return bracket ? bracket.rate : null;
}

const LOTTERY_SPLIT: LotterySplit = Object.freeze({ ...economyConfig.lotterySplit });

function getLotterySplit(): LotterySplit {
  return LOTTERY_SPLIT;
}

export {
  CURRENCY_IDS,
  CURRENCIES,
  listCurrencies,
  getCurrency,
  convertCurrency,
  formatBalance,
  PITY_CONFIG,
  getPityConfig,
  listPityTiers,
  SHOP_TAX_BRACKETS,
  getShopTaxBracket,
  getShopTaxRate,
  LOTTERY_SPLIT,
  getLotterySplit
};