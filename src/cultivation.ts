import type { StatBlock } from './types/units';

import {
  getCultivationRealmEconomy,
  type CultivationRealmEconomy,
} from './data/economy.ts';
import {
  spendAetherWithPriority,
  type CurrencyWallet,
  type SpendAetherResult,
} from './utils/currency.ts';

export interface CultivationProgress {
  realm?: number | null;
  subRealm?: number | null;
  hasCultivationData?: boolean;
}

export interface CultivationUnitInput extends StatBlock, CultivationProgress {
  id?: string;
}

interface CultivationStepBonus {
  hpMax: number;
  atk: number;
  wil: number;
  arm: number;
  res: number;
  aeMax: number;
  aeRegen: number;
}

interface RealmConfig {
  maxSubRealm: number;
  perSubRealm: CultivationStepBonus;
}

export interface CultivationCostInfo {
  realm: number;
  currentSubRealm: number;
  nextRealm: number;
  nextSubRealm: number;
  isBreakthrough: boolean;
  aetherCost: number;
  specialSubRealmCount: number;
}

export interface CanBreakthroughResult {
  canBreakthrough: boolean;
  nextRealm: number | null;
  reason: 'realm_not_found' | 'need_more_subrealm' | 'no_next_realm' | 'ready';
}

export interface CultivationPlayerState extends Record<string, unknown> {
  currencies?: CurrencyWallet;
  cultivation?: {
    realm?: number;
    subRealm?: number;
  };
}

export interface CultivationUpgradePayload {
  ok: boolean;
  reason: 'upgraded' | 'insufficient_currency' | 'invalid_realm' | 'invalid_cost';
  spent: SpendAetherResult;
  costAether: number;
  previousRealm: number;
  previousSubRealm: number;
  newRealm: number;
  newSubRealm: number;
  isBreakthrough: boolean;
  playerState: CultivationPlayerState;
}

const REALM_CONFIGS: Record<number, RealmConfig> = {
  1: {
    maxSubRealm: 9,
    perSubRealm: {
      hpMax: 0.02,
      atk: 0.015,
      wil: 0.015,
      arm: 0.01,
      res: 0.01,
      aeMax: 0.008,
      aeRegen: 0.003,
    },
  },
  2: {
    maxSubRealm: 9,
    perSubRealm: {
      hpMax: 0.025,
      atk: 0.018,
      wil: 0.018,
      arm: 0.012,
      res: 0.012,
      aeMax: 0.009,
      aeRegen: 0.0035,
    },
  },
  3: {
    maxSubRealm: 9,
    perSubRealm: {
      hpMax: 0.03,
      atk: 0.022,
      wil: 0.024,
      arm: 0.014,
      res: 0.014,
      aeMax: 0.01,
      aeRegen: 0.004,
    },
  },
4: {
    maxSubRealm: 9,
    perSubRealm: {
      hpMax: 0.035,
      atk: 0.027,
      wil: 0.03,
      arm: 0.017,
      res: 0.017,
      aeMax: 0.011,
      aeRegen: 0.0045,
    },
  },
  5: {
    maxSubRealm: 7,
    perSubRealm: {
      hpMax: 0.055,
      atk: 0.04,
      wil: 0.043,
      arm: 0.028,
      res: 0.028,
      aeMax: 0.016,
      aeRegen: 0.007,
    },
  },
  6: {
    maxSubRealm: 3,
    perSubRealm: {
      hpMax: 0.09,
      atk: 0.07,
      wil: 0.075,
      arm: 0.05,
      res: 0.05,
      aeMax: 0.024,
      aeRegen: 0.011,
    },
  },
  7: {
    maxSubRealm: 9,
    perSubRealm: {
      hpMax: 0.07,
      atk: 0.05,
      wil: 0.055,
      arm: 0.036,
      res: 0.036,
      aeMax: 0.02,
      aeRegen: 0.008,
    },
  },
  8: {
    maxSubRealm: 9,
    perSubRealm: {
      hpMax: 0.08,
      atk: 0.06,
      wil: 0.065,
      arm: 0.042,
      res: 0.042,
      aeMax: 0.022,
      aeRegen: 0.009,
    },
  },
  9: {
    maxSubRealm: 9,
    perSubRealm: {
      hpMax: 0.09,
      atk: 0.07,
      wil: 0.075,
      arm: 0.05,
      res: 0.05,
      aeMax: 0.024,
      aeRegen: 0.01,
    },
  },
};

const ZERO_BONUS: CultivationStepBonus = {
  hpMax: 0,
  atk: 0,
  wil: 0,
  arm: 0,
  res: 0,
  aeMax: 0,
  aeRegen: 0,
};

const asNonNegativeInt = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.floor(parsed));
};

const roundStat = (value: number): number => Math.round(value * 10000) / 10000;

const getRealmConfig = (realm: number): RealmConfig | null => REALM_CONFIGS[realm] ?? null;

const getTotalBonus = (realm: number, subRealm: number): CultivationStepBonus => {
  const config = getRealmConfig(realm);
  if (!config) return ZERO_BONUS;
  const appliedSubRealm = Math.max(0, Math.min(config.maxSubRealm, subRealm));

  return {
    hpMax: config.perSubRealm.hpMax * appliedSubRealm,
    atk: config.perSubRealm.atk * appliedSubRealm,
    wil: config.perSubRealm.wil * appliedSubRealm,
    arm: config.perSubRealm.arm * appliedSubRealm,
    res: config.perSubRealm.res * appliedSubRealm,
    aeMax: config.perSubRealm.aeMax * appliedSubRealm,
    aeRegen: config.perSubRealm.aeRegen * appliedSubRealm,
  };
};

const scaleStat = (rawValue: unknown, ratio: number): number | undefined => {
  if (typeof rawValue !== 'number' || !Number.isFinite(rawValue)) return undefined;
  return roundStat(rawValue * (1 + ratio));
};

const resolveRealmEconomy = (realm: number): CultivationRealmEconomy | null => getCultivationRealmEconomy(realm);

export function getCultivationCost(realm: number, subRealm: number): CultivationCostInfo | null {
  const realmNo = asNonNegativeInt(realm);
  const subNo = asNonNegativeInt(subRealm);
  const realmEconomy = resolveRealmEconomy(realmNo);
  if (!realmEconomy) return null;

  const targetSubRealm = subNo + 1;
  const perSubRealmCost = realmEconomy.subRealmCosts[targetSubRealm - 1] ?? null;
  if (perSubRealmCost != null){
    return {
      realm: realmNo,
      currentSubRealm: subNo,
      nextRealm: realmNo,
      nextSubRealm: targetSubRealm,
      isBreakthrough: false,
      aetherCost: perSubRealmCost,
      specialSubRealmCount: realmEconomy.specialSubRealmCount,
    };
  }

  const nextRealmEconomy = resolveRealmEconomy(realmNo + 1);
  if (!nextRealmEconomy) return null;

  return {
    realm: realmNo,
    currentSubRealm: subNo,
    nextRealm: realmNo + 1,
    nextSubRealm: 1,
    isBreakthrough: true,
    aetherCost: realmEconomy.breakthroughCost,
    specialSubRealmCount: realmEconomy.specialSubRealmCount,
  };
}

export function canBreakthrough(realm: number, subRealm: number): CanBreakthroughResult {
  const realmNo = asNonNegativeInt(realm);
  const subNo = asNonNegativeInt(subRealm);
  const realmEconomy = resolveRealmEconomy(realmNo);
  if (!realmEconomy){
    return { canBreakthrough: false, nextRealm: null, reason: 'realm_not_found' };
  }

  if (subNo < realmEconomy.subRealmCosts.length){
    return { canBreakthrough: false, nextRealm: null, reason: 'need_more_subrealm' };
  }

  const nextRealm = resolveRealmEconomy(realmNo + 1);
  if (!nextRealm){
    return { canBreakthrough: false, nextRealm: null, reason: 'no_next_realm' };
  }

  return { canBreakthrough: true, nextRealm: realmNo + 1, reason: 'ready' };
}

export function upgradeCultivation(
  playerStateInput: CultivationPlayerState,
  realm: number,
  subRealm: number,
): CultivationUpgradePayload {
  const currentRealm = asNonNegativeInt(realm);
  const currentSubRealm = asNonNegativeInt(subRealm);
  const playerState: CultivationPlayerState = { ...playerStateInput };
  const costInfo = getCultivationCost(currentRealm, currentSubRealm);

  if (!costInfo){
    return {
      ok: false,
      reason: 'invalid_realm',
      spent: {
        ok: false,
        wallet: { ...(playerState.currencies ?? {}) },
        deducted: {},
        spentAether: 0,
        missingAether: 0,
      },
      costAether: 0,
      previousRealm: currentRealm,
      previousSubRealm: currentSubRealm,
      newRealm: currentRealm,
      newSubRealm: currentSubRealm,
      isBreakthrough: false,
      playerState,
    };
  }

  if (costInfo.aetherCost <= 0){
    return {
      ok: false,
      reason: 'invalid_cost',
      spent: {
        ok: false,
        wallet: { ...(playerState.currencies ?? {}) },
        deducted: {},
        spentAether: 0,
        missingAether: 0,
      },
      costAether: costInfo.aetherCost,
      previousRealm: currentRealm,
      previousSubRealm: currentSubRealm,
      newRealm: currentRealm,
      newSubRealm: currentSubRealm,
      isBreakthrough: false,
      playerState,
    };
  }

  const spent = spendAetherWithPriority(playerState.currencies ?? {}, costInfo.aetherCost);
  if (!spent.ok){
    return {
      ok: false,
      reason: 'insufficient_currency',
      spent,
      costAether: costInfo.aetherCost,
      previousRealm: currentRealm,
      previousSubRealm: currentSubRealm,
      newRealm: currentRealm,
      newSubRealm: currentSubRealm,
      isBreakthrough: costInfo.isBreakthrough,
      playerState,
    };
  }

  playerState.currencies = spent.wallet;
  playerState.cultivation = {
    realm: costInfo.nextRealm,
    subRealm: costInfo.nextSubRealm,
  };

  return {
    ok: true,
    reason: 'upgraded',
    spent,
    costAether: costInfo.aetherCost,
    previousRealm: currentRealm,
    previousSubRealm: currentSubRealm,
    newRealm: costInfo.nextRealm,
    newSubRealm: costInfo.nextSubRealm,
    isBreakthrough: costInfo.isBreakthrough,
    playerState,
  };
}

export function applyCultivationBonus<T extends CultivationUnitInput>(unit: T): T {
  if (!unit || typeof unit !== 'object') return unit;

  const hasCultivationData = unit.hasCultivationData ?? false;
  const isSystemLeader = unit.id === 'leaderA' || unit.id === 'leaderB';
  if (isSystemLeader && !hasCultivationData) {
    return unit;
  }

  const realm = asNonNegativeInt(unit.realm);
  const subRealm = asNonNegativeInt(unit.subRealm);
  if (realm <= 0 || subRealm <= 0) {
    return unit;
  }

  const totalBonus = getTotalBonus(realm, subRealm);
  if (totalBonus === ZERO_BONUS) {
    return unit;
  }

  const hpMax = scaleStat(unit.hpMax, totalBonus.hpMax);
  const nextHp = scaleStat(unit.hp, totalBonus.hpMax);
  const atk = scaleStat(unit.atk, totalBonus.atk);
  const wil = scaleStat(unit.wil, totalBonus.wil);
  const arm = scaleStat(unit.arm, totalBonus.arm);
  const res = scaleStat(unit.res, totalBonus.res);
  const aeMax = scaleStat(unit.aeMax, totalBonus.aeMax);
  const aeRegen = scaleStat(unit.aeRegen, totalBonus.aeRegen);

  return {
    ...unit,
    ...(hpMax !== undefined ? { hpMax } : {}),
    ...(nextHp !== undefined ? { hp: hpMax !== undefined ? Math.min(nextHp, hpMax) : nextHp } : {}),
    ...(atk !== undefined ? { atk } : {}),
    ...(wil !== undefined ? { wil } : {}),
    ...(arm !== undefined ? { arm } : {}),
    ...(res !== undefined ? { res } : {}),
    ...(aeMax !== undefined ? { aeMax } : {}),
    ...(aeRegen !== undefined ? { aeRegen } : {}),
  };
}
