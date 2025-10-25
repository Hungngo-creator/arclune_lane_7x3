import { HAS_INTL_NUMBER_FORMAT, createNumberFormatter } from '../utils/format.ts';

import type {
  CurrencyDefinition,
  LotterySplit,
  PityConfiguration,
  ShopTaxBracket
} from '../types/config.ts';

const CURRENCY_IDS = {
  VNT: 'VNT',
  HNT: 'HNT',
  TNT: 'TNT',
  THNT: 'ThNT',
  TT: 'TT'
} as const satisfies Readonly<Record<'VNT' | 'HNT' | 'TNT' | 'THNT' | 'TT', string>>;

const CURRENCIES: ReadonlyArray<CurrencyDefinition> = [
  {
    id: CURRENCY_IDS.VNT,
    name: 'Vụn Nguyên Tinh',
    shortName: 'Vụn',
    suffix: 'VNT',
    ratioToBase: 1,
    description: 'Đơn vị nhỏ nhất, rơi ra từ tinh thể vỡ và hoạt động hằng ngày.'
  },
  {
    id: CURRENCY_IDS.HNT,
    name: 'Hạ Nguyên Tinh',
    shortName: 'Hạ',
    suffix: 'HNT',
    ratioToBase: 100,
    description: 'Tinh thể đã tinh luyện, dùng cho giao dịch phổ thông và vé gacha thường.'
  },
  {
    id: CURRENCY_IDS.TNT,
    name: 'Trung Nguyên Tinh',
    shortName: 'Trung',
    suffix: 'TNT',
    ratioToBase: 1000,
    description: 'Kho dự trữ cho các kiến trúc tông môn, chế tác pháp khí và banner cao cấp.'
  },
  {
    id: CURRENCY_IDS.THNT,
    name: 'Thượng Nguyên Tinh',
    shortName: 'Thượng',
    suffix: 'ThNT',
    ratioToBase: 10000,
    description: 'Đơn vị luân chuyển giữa các tông môn, đổi thưởng cao cấp và sự kiện giới hạn.'
  },
  {
    id: CURRENCY_IDS.TT,
    name: 'Thần Tinh',
    shortName: 'Thần',
    suffix: 'TT',
    ratioToBase: 100000,
    description: 'Đơn vị tối thượng cho các giao dịch Prime và quỹ dự trữ chiến lược.'
  }
] satisfies ReadonlyArray<CurrencyDefinition>;

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

const PITY_CONFIG = {
  SSR: {
    tier: 'SSR',
    hardPity: 60,
    softGuarantees: []
  },
  UR: {
    tier: 'UR',
    hardPity: 70,
    softGuarantees: [
      { tier: 'SSR', pull: 50 }
    ]
  },
  PRIME: {
    tier: 'PRIME',
    hardPity: 80,
    softGuarantees: [
      { tier: 'SSR', pull: 40 },
      { tier: 'UR', pull: 60 }
    ]
  }
} satisfies Readonly<Record<'SSR' | 'UR' | 'PRIME', PityConfiguration>>;

type PityTier = keyof typeof PITY_CONFIG;

function isPityTier(tier: string): tier is PityTier {
  return tier in PITY_CONFIG;
}

function getPityConfig(tier: string): PityConfiguration | null {
  if (isPityTier(tier)){
    return PITY_CONFIG[tier];
  }
  return null;
}

function listPityTiers(): string[] {
  return Object.keys(PITY_CONFIG);
}

const SHOP_TAX_BRACKETS = [
  { rank: 'N', label: 'Phổ thông (N)', rate: 0.05 },
  { rank: 'R', label: 'Hiếm (R)', rate: 0.08 },
  { rank: 'SR', label: 'Siêu hiếm (SR)', rate: 0.1 },
  { rank: 'SSR', label: 'Cực hiếm (SSR)', rate: 0.12 },
  { rank: 'UR', label: 'Siêu thực (UR)', rate: 0.15 },
  { rank: 'PRIME', label: 'Tối thượng (Prime)', rate: 0.18 }
] satisfies ReadonlyArray<ShopTaxBracket>;

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

const LOTTERY_SPLIT = {
  devVault: 0.5,
  prizePool: 0.5
} satisfies LotterySplit;

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