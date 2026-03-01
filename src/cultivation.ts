import type { StatBlock } from './types/units';

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

const REALM_CONFIGS: Record<number, RealmConfig> = {
  // Realm 1: Đúc Phách (7 tiểu cấp)
  1: {
    maxSubRealm: 7,
    perSubRealm: {
      hpMax: 0.03,
      atk: 0.02,
      wil: 0.02,
      arm: 0.015,
      res: 0.015,
      aeMax: 0.01,
      aeRegen: 0.005,
    },
  },
  // Realm 2: Luyện Hồn (3 tiểu cấp)
  2: {
    maxSubRealm: 3,
    perSubRealm: {
      hpMax: 0.06,
      atk: 0.04,
      wil: 0.05,
      arm: 0.03,
      res: 0.03,
      aeMax: 0.02,
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
