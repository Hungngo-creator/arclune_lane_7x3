import { getTierIndex } from './conversion.ts';
import type { TieredAmount, VinhDaTier } from './resources.ts';

export type VinhDaMerchantCurrency = 'HNT' | 'TNT' | 'ThNT';
export interface VinhDaMerchantPrice { currency: VinhDaMerchantCurrency; amount: number; }
export interface VinhDaMerchantOffer { id: string; label: string; stock: number; resources: TieredAmount[]; price: VinhDaMerchantPrice; rare?: boolean; }

const tierIndexOf = (tier: VinhDaTier = 1.1): number => getTierIndex(Math.floor(tier), Math.round((tier - Math.floor(tier)) * 10));
const tiered = (resourceId: TieredAmount['resourceId'], amount: number, tier: VinhDaTier): TieredAmount => ({ resourceId, amount, tier });
const untiered = (resourceId: TieredAmount['resourceId'], amount: number): TieredAmount => ({ resourceId, amount });
const price = (currency: VinhDaMerchantCurrency, amount: number): VinhDaMerchantPrice => ({ currency, amount });

export const rollVinhDaMerchantPresence = (phase: 'day' | 'night' | 'escort', randomValue: () => number): boolean => phase === 'day' && randomValue() < 0.7;

export const createVinhDaMerchantStock = (tier: VinhDaTier = 1.1, randomValue: () => number = Math.random): VinhDaMerchantOffer[] => {
  const idx = tierIndexOf(tier);
  const offers: VinhDaMerchantOffer[] = [
    { id: 'blackIron', label: '5 Hắc Thiết', stock: 2, resources: [tiered('blackIron', 5, tier)], price: price('HNT', 8 * idx) },
    { id: 'darkStone', label: '3 Dạ Thạch', stock: 2, resources: [tiered('darkStone', 3, tier)], price: price('HNT', 4 * idx) },
    { id: 'blackBone', label: '1 Hắc Cốt', stock: 1, resources: [untiered('blackBone', 1)], price: price('HNT', 10) },
    { id: 'sealDust', label: '1 Bụi Phong Ấn', stock: 1, resources: [untiered('sealDust', 1)], price: price('HNT', 20) },
    { id: 'spiritHerb', label: '1 Linh Thảo', stock: 2, resources: [tiered('spiritHerb', 1, tier)], price: price('HNT', 2 * idx) },
    { id: 'spiritWood', label: '1 Linh Mộc', stock: 2, resources: [tiered('spiritWood', 1, tier)], price: price('HNT', 3 * idx) }
  ];
  const rare: VinhDaMerchantOffer[] = [
    { id: 'elementStone', label: '1 Nguyên Tố Thạch', stock: 1, resources: [tiered('elementStone', 1, tier)], price: price('HNT', 45 * idx), rare: true },
    { id: 'wishStone', label: '1 Nguyện Thạch', stock: 1, resources: [tiered('wishStone', 1, tier)], price: price('HNT', 25 * idx), rare: true },
    { id: 'mindStone', label: '1 Niệm Thạch', stock: 1, resources: [untiered('mindStone', 1)], price: price('HNT', 40), rare: true },
    { id: 'machinePart', label: '1 Cơ Giới Linh Kiện', stock: 1, resources: [untiered('machinePart', 1)], price: price('HNT', 30), rare: true },
    { id: 'heavyWater', label: '1 HMTT', stock: 1, resources: [tiered('heavyWater', 1, tier)], price: price('TNT', 1.5 * idx), rare: true },
    { id: 'voidStone', label: '1 Hư Không Thạch', stock: 1, resources: [tiered('voidStone', 1, tier)], price: price('TNT', 4 * idx), rare: true }
  ];
  for (const offer of rare) if (randomValue() < 0.45) offers.push(offer);
  return offers;
};

export const getMerchantPriceInHnt = (price: VinhDaMerchantPrice): number => price.currency === 'ThNT' ? price.amount * 10000 : price.currency === 'TNT' ? price.amount * 100 : price.amount;

