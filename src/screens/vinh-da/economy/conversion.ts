import type { TieredAmount, VinhDaResourceId } from './resources.ts';

const TNT_TO_HNT = 100;

const TIERED_LIQUID_HNT_BASE: Partial<Record<VinhDaResourceId, number>> = Object.freeze({
  darkStone: 0.9,
  blackIron: 0.9,
  resentmentStone: 1.2,
  spiritWood: 1.6,
  spiritHerb: 1,
  elementStone: 35,
  wishStone: 18,
  heavyWater: 1 * TNT_TO_HNT,
  voidStone: 3 * TNT_TO_HNT,
  dragonScale: 4 * TNT_TO_HNT,
  nightCore: 5 * TNT_TO_HNT,
  bloodLordSigil: 2 * TNT_TO_HNT,
  fleshCrystal: 10 * TNT_TO_HNT
});

const UNTIERED_LIQUID_HNT_VALUE: Partial<Record<VinhDaResourceId, number>> = Object.freeze({
  blackBone: 4,
  mindStone: 25,
  machinePart: 18,
  hazySoul: 12,
  sealDust: 8
});

export const getTierIndex = (tierMajor: number, tierMinor: number): number => (tierMajor - 1) * 9 + tierMinor;

const splitTier = (tier?: number): { major: number; minor: number } => {
  const safeTier = Number.isFinite(tier) ? tier! : 1.1;
  const major = Math.max(1, Math.floor(safeTier));
  const minor = Math.max(1, Math.round((safeTier - major) * 10));
  return { major, minor };
};

export const getLiquidHntValue = (resource: TieredAmount): number => {
  const amount = Math.max(0, resource.amount);
  const tieredBase = TIERED_LIQUID_HNT_BASE[resource.resourceId];
  if (tieredBase !== undefined){
    const { major, minor } = splitTier(resource.tier);
    return amount * tieredBase * getTierIndex(major, minor);
  }
  return amount * (UNTIERED_LIQUID_HNT_VALUE[resource.resourceId] ?? 0);
};

export const getCondensedHntValue = (resource: TieredAmount): number => getLiquidHntValue(resource) * 0.9;

export const settleBaseEssence = (liquidHnt: number, harvestRate: number): number => (
  Math.floor(Math.max(0, liquidHnt) * 0.9 * Math.max(0, harvestRate))
);
