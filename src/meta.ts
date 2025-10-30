//v0.8
// meta.ts — gom lookup + stat khởi tạo + nộ khởi điểm
import {
  CLASS_BASE,
  RANK_MULT,
  applyRankAndMods,
  getMetaById,
  getUnitKitById,
} from './catalog.ts';
import { extractOnSpawnRage, kitSupportsSummon } from './utils/kit.ts';

import type { CatalogStatBlock, UnitKitConfig } from './types/config.ts';
import type { MetaEntry } from '@shared-types/pve';
import type { UnitId } from '@shared-types/units';

import type { ClassName, RankName } from './catalog.ts';

type MetaId = UnitId | string | null | undefined;

export interface InstanceStats {
  hpMax: number;
  hp: number;
  atk: number;
  wil: number;
  arm: number;
  res: number;
  agi: number;
  per: number;
  spd: number;
  aeMax: number;
  ae: number;
  aeRegen: number;
  hpRegen: number;
  [extra: string]: number;
}

export interface InitialRageOptions {
  isLeader?: boolean;
  revive?: boolean;
  reviveSpec?: { rage?: number } | null | undefined;
  [extra: string]: unknown;
}

interface MetaService {
  get(id: MetaId): MetaEntry | undefined;
  classOf(id: MetaId): MetaEntry['class'] | null;
  rankOf(id: MetaId): MetaEntry['rank'] | null;
  kit(id: MetaId): UnitKitConfig | null;
  isSummoner(id: MetaId): boolean;
}

// Dùng trực tiếp catalog cho tra cứu
export const Meta = {
  get: getMetaById as MetaService['get'],
  classOf(id: MetaId) {
    const entry = getMetaById(id);
    return entry?.class ?? null;
  },
  rankOf(id: MetaId) {
    const entry = getMetaById(id);
    return entry?.rank ?? null;
  },
  kit(id: MetaId) {
    return getUnitKitById(id);
  },
  isSummoner(id: MetaId) {
    const entry = getMetaById(id);
    return !!(entry && entry.class === 'Summoner' && kitSupportsSummon(entry));
  },
} satisfies MetaService;

// Tạo chỉ số instance theo class+rank+mods (SPD không nhân theo rank)
const EMPTY_INSTANCE_STATS: InstanceStats = {
  hpMax: 0,
  hp: 0,
  atk: 0,
  wil: 0,
  arm: 0,
  res: 0,
  agi: 0,
  per: 0,
  spd: 1,
  aeMax: 0,
  ae: 0,
  aeRegen: 0,
  hpRegen: 0,
};

const isRankName = (value: unknown): value is RankName => (
  typeof value === 'string' && value in RANK_MULT
);

const isClassName = (value: unknown): value is ClassName => (
  typeof value === 'string' && value in CLASS_BASE
);

const coerceStatMods = (
  mods: MetaEntry['mods'],
): Partial<Record<keyof CatalogStatBlock, number>> | undefined => {
  if (!mods || typeof mods !== 'object') return undefined;
  const out: Partial<Record<keyof CatalogStatBlock, number>> = {};
  for (const [key, raw] of Object.entries(mods)) {
    if (typeof raw !== 'number' || !Number.isFinite(raw)) continue;
    out[key as keyof CatalogStatBlock] = raw;
  }
  return out;
};

export function makeInstanceStats(unitId: MetaId): InstanceStats {
  const entry = Meta.get(unitId);
  if (!entry) return { ...EMPTY_INSTANCE_STATS };
  const className = entry.class;
  if (!isClassName(className)) return { ...EMPTY_INSTANCE_STATS };
  const rank = entry.rank;
  if (!isRankName(rank)) return { ...EMPTY_INSTANCE_STATS };
  const base: CatalogStatBlock | undefined = CLASS_BASE[className];
  if (!base) return { ...EMPTY_INSTANCE_STATS };
  const fin = applyRankAndMods(base, rank, coerceStatMods(entry.mods));
  return {
    hpMax: Math.trunc(fin.HP ?? 0),
    hp: Math.trunc(fin.HP ?? 0),
    atk: Math.trunc(fin.ATK ?? 0),
    wil: Math.trunc(fin.WIL ?? 0),
    arm: fin.ARM || 0,
    res: fin.RES || 0,
    agi: Math.trunc(fin.AGI ?? 0),
    per: Math.trunc(fin.PER ?? 0),
    spd: fin.SPD || 1,
    aeMax: Math.trunc(fin.AEmax ?? 0),
    ae: 0,
    aeRegen: fin.AEregen || 0,
    hpRegen: fin.HPregen || 0,
  } satisfies InstanceStats;
}

// Nộ khi vào sân (trừ leader). Revive: theo spec của skill.
export function initialRageFor(unitId: MetaId, opts: InitialRageOptions = {}): number {
  const onSpawn = Meta.kit(unitId)?.onSpawn as { exceptLeader?: boolean } | undefined;
  if (!onSpawn) return 0;
  if (onSpawn.exceptLeader && opts.isLeader) {
    const leaderSpecific = extractOnSpawnRage(onSpawn, { ...opts, isLeader: true });
    return Math.max(0, leaderSpecific ?? 0);
  }
  const amount = extractOnSpawnRage(onSpawn, opts);
  if (amount != null) return Math.max(0, amount);
  if (opts.revive) return Math.max(0, opts.reviveSpec?.rage ?? 0);
  return 0;
}