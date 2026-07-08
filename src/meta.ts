//home (termux)/arclune_lane_7x3/src/meta.ts — gom lookup + stat khởi tạo + nộ khởi điểm
import {
  CLASS_BASE,
  RANK_MULT,
  CLASS_GROWTH,
  getMetaById,
  getUnitKitById,
  scaleStatByRank,
} from './catalog.ts';
import { extractOnSpawnRage, kitSupportsSummon } from './utils/kit.ts';
import { normalizeClassName } from './utils/domain-normalization.ts';

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

const lookupMeta = getMetaById as MetaLookupService['get'];
const classOfMeta = (entry: MetaEntry | null | undefined): MetaEntry['class'] | null => (
  normalizeClassName(entry?.class) ?? null
);

// Dùng trực tiếp catalog cho tra cứu
export const Meta = {
  get: lookupMeta,
  classOf(id: MetaId) {
    return classOfMeta(lookupMeta(id));
  },
  rankOf(id: MetaId) {
    return lookupMeta(id)?.rank ?? null;
  },
  kit(id: MetaId) {
    return getUnitKitById(id);
  },
  isSummoner(id: MetaId) {
    const entry = lookupMeta(id);
    return !!(entry && classOfMeta(entry) === 'Summoner' && kitSupportsSummon(entry));
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
    const className = Meta.classOf(id);
    return typeof className === 'string' ? className : null;
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
const cloneEmptyStats = (): InstanceStats => ({ ...EMPTY_INSTANCE_STATS });

const isRankName = (value: unknown): value is RankName => (
  typeof value === 'string' && value in RANK_MULT
);

export function makeInstanceStats(unitId: MetaId, level: number = 1, stars: number = 0): InstanceStats {
  const entry = Meta.get(unitId);
  if (!entry) return cloneEmptyStats();

  const className = normalizeClassName(entry.class);
  const rank = entry.rank;

  if (!className || !isRankName(rank)) return cloneEmptyStats();
  const base = CLASS_BASE[className];
  const growthByClass = CLASS_GROWTH as Partial<Record<ClassName, Partial<CatalogStatBlock>>>;
  const delta = growthByClass[className] ?? {};

  const currentBase: CatalogStatBlock = {
    HP:  base.HP  + (level - 1) * (delta.HP ?? 0),
    ATK: base.ATK + (level - 1) * (delta.ATK ?? 0),
    WIL: base.WIL + (level - 1) * (delta.WIL ?? 0),
    ARM: base.ARM + (level - 1) * (delta.ARM ?? 0),
    RES: base.RES + (level - 1) * (delta.RES ?? 0),
    AGI: base.AGI ?? 0,
    PER: base.PER ?? 0,
    SPD: base.SPD || 1,
    AEmax: base.AEmax ?? 0,
    AEregen: base.AEregen || 0,
    HPregen: base.HPregen || 0,
  };

  const rankBonus = stars * 0.05;
  const scaleInt = (stat: keyof CatalogStatBlock, value: number): number => (
    Math.trunc(scaleStatByRank(stat, value, rank, rankBonus))
  );
  const scaleFixed4 = (stat: keyof CatalogStatBlock, value: number): number => (
    Number(scaleStatByRank(stat, value, rank, rankBonus).toFixed(4))
  );
  const scaledHp = scaleInt('HP', currentBase.HP);

  return {
    hpMax: scaledHp,
    hp: scaledHp,
    atk: scaleInt('ATK', currentBase.ATK),
    wil: scaleInt('WIL', currentBase.WIL),
    arm: scaleFixed4('ARM', currentBase.ARM),
    res: scaleFixed4('RES', currentBase.RES),
    agi: Math.trunc(base.AGI ?? 0),
    per: Math.trunc(base.PER ?? 0),
    spd: base.SPD || 1,
    aeMax: Math.trunc(base.AEmax ?? 0),
    ae: 0,
    aeRegen: base.AEregen || 0,
    hpRegen: scaleInt('HPregen', currentBase.HPregen || 0),
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