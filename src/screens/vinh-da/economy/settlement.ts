import { getCondensedHntValue, settleBaseEssence } from './conversion.ts';
import type { TieredAmount } from './resources.ts';

export const VINH_DA_DEFAULT_HARVEST_RATE = 1;
export const VINH_DA_SETTLEMENT_CONDENSE_RATE = 0.9;

export interface VinhDaSettlementResult {
  condensedHntFromLiquid: number;
  condensedHntFromResources: number;
  totalCondensedHnt: number;
  keptResources: TieredAmount[];
}

const cloneResource = (resource: TieredAmount): TieredAmount => ({ resourceId: resource.resourceId, amount: resource.amount, tier: resource.tier });
const isMandatoryOrProgressResource = (resource: TieredAmount): boolean => resource.resourceId === 'fleshCrystal';

export const settleVinhDaMapEconomy = (params: { liquidHntRemaining: number; directResources?: readonly TieredAmount[]; harvestRate?: number }): VinhDaSettlementResult => {
  const harvestRate = Math.max(0, params.harvestRate ?? VINH_DA_DEFAULT_HARVEST_RATE);
  const condensedHntFromLiquid = settleBaseEssence(params.liquidHntRemaining, harvestRate);
  let condensedHntFromResources = 0;
  const keptResources: TieredAmount[] = [];
  for (const resource of params.directResources ?? []){
    if (resource.amount <= 0) continue;
    if (isMandatoryOrProgressResource(resource)){
      keptResources.push(cloneResource(resource));
      continue;
    }
    const value = getCondensedHntValue(resource) * harvestRate;
    if (value > 0) condensedHntFromResources += value;
    else keptResources.push(cloneResource(resource));
  }
  condensedHntFromResources = Math.floor(condensedHntFromResources);
  return {
    condensedHntFromLiquid,
    condensedHntFromResources,
    totalCondensedHnt: condensedHntFromLiquid + condensedHntFromResources,
    keptResources
  };
};

