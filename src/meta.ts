//home (termux)/arclune_lane_7x3/src/meta.ts — gom lookup + stat khởi tạo + nộ khởi điểm
import {
  CLASS_BASE,
  RANK_MULT,
  CLASS_GROWTH,
  applyRankAndMods,
  getMetaById,
  getUnitKitById,
} from './catalog.ts';
import { extractOnSpawnRage, kitSupportsSummon } from './utils/kit.ts';

import type { CatalogStatBlock, RosterUnitDefinition, UnitKitConfig } from './types/config.ts';
import type { MetaEntry } from '@shared-types/pve';
import type { MetaService as SessionMetaService } from '@shared-types/combat';
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

interface MetaLookupService {
  get(id: MetaId): MetaEntry | undefined;
  classOf(id: MetaId): MetaEntry['class'] | null;
  rankOf(id: MetaId): MetaEntry['rank'] | null;
  kit(id: MetaId): UnitKitConfig | null;
  isSummoner(id: MetaId): boolean;
}

// Dùng trực tiếp catalog cho tra cứu
export const Meta = {
  get: getMetaById as MetaLookupService['get'],
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
} satisfies MetaLookupService;

const adaptMetaEntry = (
  entry: MetaEntry | null | undefined,
): RosterUnitDefinition | null => {
  if (!entry) return null;
  const resolvedKit: UnitKitConfig | null = entry.kit ?? getUnitKitById(entry.id);
  if (!resolvedKit) return null;
  const roster = { ...entry, kit: resolvedKit } as RosterUnitDefinition;
  return roster;
};

export const metaServiceAdapter: SessionMetaService = {
  get(id: UnitId | null | undefined): RosterUnitDefinition | null {
    if (!id) return null;
    return adaptMetaEntry(Meta.get(id));
  },
  classOf(id: UnitId | null | undefined): string | null {
    if (!id) return null;
    const value = Meta.classOf(id);
    return typeof value === 'string' ? value : null;
  },
  rankOf(id: UnitId | null | undefined): string | null {
    if (!id) return null;
    const value = Meta.rankOf(id);
    return typeof value === 'string' ? value : null;
  },
  kit(id: UnitId | null | undefined): Record<string, unknown> | null {
    if (!id) return null;
    return Meta.kit(id);
  },
  isSummoner(id: UnitId | null | undefined): boolean {
    if (!id) return false;
    return Meta.isSummoner(id);
  },
};

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

export function makeInstanceStats(unitId: MetaId, level: number = 1, stars: number = 0): InstanceStats {
  const entry = Meta.get(unitId);
  if (!entry) return { ...EMPTY_INSTANCE_STATS };

  const className = entry.class as ClassName;
  const rank = entry.rank as RankName;

  const base = CLASS_BASE[className];
  // Delta tăng trưởng (Laser)
  const delta = (CLASS_GROWTH as any)[className];

  // 1. TÍNH CHỈ SỐ GỐC THEO LEVEL (TIA LASER)
  const currentBase = {
    HP:  base.HP  + (level - 1) * (delta?.HP || 0),
    ATK: base.ATK + (level - 1) * (delta?.ATK || 0),
    WIL: base.WIL + (level - 1) * (delta?.WIL || 0),
    ARM: base.ARM + (level - 1) * (delta?.ARM || 0),
    RES: base.RES + (level - 1) * (delta?.RES || 0)
  };

  // 2. TÍNH HỆ SỐ (THẤU KÍNH) = RANK + SAO
  const rankMult = RANK_MULT[rank] + (stars * 0.05);

  // 3. XUẤT CHỈ SỐ CUỐI (LASER x THẤU KÍNH)
  return {
    hpMax: Math.trunc(currentBase.HP * rankMult),
    hp: Math.trunc(currentBase.HP * rankMult),
    atk: Math.trunc(currentBase.ATK * rankMult),
    wil: Math.trunc(currentBase.WIL * rankMult),
    arm: Number((currentBase.ARM * rankMult).toFixed(4)),
    res: Number((currentBase.RES * rankMult).toFixed(4)),
    agi: Math.trunc(base.AGI ?? 0),
    per: Math.trunc(base.PER ?? 0),
    spd: base.SPD || 1,
    aeMax: Math.trunc(base.AEmax ?? 0),
    ae: 0,
    aeRegen: base.AEregen || 0,
    hpRegen: base.HPregen || 0,
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