import type { BannerDefinition, CurrencyCode, GachaConfig, Wallet } from './types.ts';
import { CURRENCY_ORDER } from './types.ts';

export const DEFAULT_WALLET: Wallet = {
  VNT: 125_000,
  HNT: 5_200,
  TNT: 620,
  ThNT: 120,
  TT: 18,
};

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

const BANNERS: BannerDefinition[] = [
  {
    id: 'permanent',
    label: 'Triệu Hồi Chung',
    type: 'Permanent',
    description: 'Danh sách N / R / SR / SSR toàn bộ.',
    cost: { unit: 'HNT', x1: 250, x10: 2_500 },
    rates: { N: 0.6, R: 0.25, SR: 0.12, SSR: 0.03 },
    pity: {
      srFloor: 10,
      ssr: { soft: 60, softStep: 0.005, hard: 80, hardGuaranteeFeatured: false, carryOver: true },
    },
    featured: [
      { id: 'permanent-01', name: 'Diệp Minh', rarity: 'SSR', portrait: 'assets/u_diep_minh.svg' },
      { id: 'permanent-02', name: 'Thiên Lưu', rarity: 'SSR', portrait: 'assets/u_thien_luu.svg' },
      { id: 'permanent-03', name: 'Mộ Dạ', rarity: 'SSR', portrait: 'assets/u_mo_da.svg' },
    ],
    background: 'assets/banner_standard.svg',
  },
  {
    id: 'limited-ur',
    label: 'Giới Hạn UR',
    type: 'LimitedUR',
    description: 'UR rate-up, pity hard bảo đảm UR featured.',
    cost: { unit: 'TNT', x1: 250, x10: 2_500 },
    rates: { N: 0.586, R: 0.244, SR: 0.117, SSR: 0.03, UR: 0.015, Prime: 0.0075 },
    pity: {
      srFloor: 10,
      ur: { soft: 70, softStep: 0.003, hard: 90, hardGuaranteeFeatured: true },
      ssr: { soft: 60, softStep: 0.005, hard: 80, hardGuaranteeFeatured: false },
    },
    featured: [
      { id: 'limited-ur-01', name: 'Nguyệt San', rarity: 'UR', portrait: 'assets/u_nguyet_san.svg' },
      { id: 'limited-ur-02', name: 'Huyết Tịch', rarity: 'UR', portrait: 'assets/u_huyet_tich.svg' },
      { id: 'limited-ur-03', name: 'Khai Nguyên Tử', rarity: 'UR', portrait: 'assets/u_khai_nguyen_tu.svg' },
      { id: 'limited-ur-04', name: 'Mộng Yểm', rarity: 'UR', portrait: 'assets/u_mong_yem.svg' },
    ],
    expiresAt: now + 7 * day,
    background: 'assets/banner_dragon.svg',
  },
  {
    id: 'limited-prime',
    label: 'Giới Hạn Prime',
    type: 'LimitedPrime',
    description: 'Prime rate-up, pity bảo đảm Prime featured.',
    cost: { unit: 'ThNT', x1: 300, x10: 3_000 },
    rates: { N: 0.586, R: 0.244, SR: 0.117, SSR: 0.03, UR: 0.015, Prime: 0.0075 },
    pity: {
      srFloor: 10,
      prime: { soft: 130, softStep: 0.001, hard: 180, hardGuaranteeFeatured: true },
      ur: { soft: 70, softStep: 0.003, hard: 90, hardGuaranteeFeatured: true },
    },
    featured: [
      { id: 'limited-prime-01', name: 'Lậu Khắc Ma Chủ', rarity: 'Prime', portrait: 'assets/u_lau_khac_ma_chu.svg' },
      { id: 'limited-prime-02', name: 'Dạ Nhạc', rarity: 'Prime', portrait: 'assets/u_chan_nga.svg' },
    ],
    expiresAt: now + 3 * day,
    background: 'assets/banner_void.svg',
  },
];

export const GACHA_CONFIG: GachaConfig = {
  currencies: ['VNT', 'HNT', 'TNT', 'ThNT', 'TT'],
  costs: {
    Permanent: { unit: 'HNT', x1: 250, x10: 2_500 },
    LimitedUR: { unit: 'TNT', x1: 250, x10: 2_500 },
    LimitedPrime: { unit: 'ThNT', x1: 300, x10: 3_000 },
  },
  rateUpShare: 0.7,
  banners: BANNERS,
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  VNT: 'Vụn',
  HNT: 'Hạ',
  TNT: 'Trung',
  ThNT: 'Thượng',
  TT: 'Thần Tinh',
};

export function createWallet(initial?: Partial<Wallet>): Wallet {
  const wallet: Partial<Wallet> = {};
  for (const code of CURRENCY_ORDER){
    const fallback = DEFAULT_WALLET[code] ?? 0;
    wallet[code] = Math.max(0, Math.trunc((initial?.[code] ?? fallback) ?? 0));
  }
  return wallet as Wallet;
}