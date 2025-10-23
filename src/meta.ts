//v0.8
// meta.ts — gom lookup + stat khởi tạo + nộ khởi điểm
import {
  CLASS_BASE,
  applyRankAndMods,
  getMetaById,
} from './catalog.js';
import { extractOnSpawnRage, kitSupportsSummon } from './utils/kit.js';

import type { CatalogStatBlock } from '@types/config';
import type { MetaEntry } from '@types/pve';
import type { UnitId } from '@types/units';

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
  kit(id: MetaId): MetaEntry['kit'] | null;
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
    const entry = getMetaById(id);
    return (entry?.kit ?? null) as MetaEntry['kit'] | null;
  },
  isSummoner(id: MetaId) {
    const entry = getMetaById(id);
    return !!(entry && entry.class === 'Summoner' && kitSupportsSummon(entry));
  },
} satisfies MetaService;

// Tạo chỉ số instance theo class+rank+mods (SPD không nhân theo rank)
export function makeInstanceStats(unitId: MetaId): InstanceStats | Record<string, never> {
  const entry = Meta.get(unitId);
  if (!entry) return {};
  const base: CatalogStatBlock | undefined = CLASS_BASE[entry.class];
  if (!base) return {};
  const fin = applyRankAndMods(base, entry.rank, entry.mods);
  return {
    hpMax: fin.HP | 0,
    hp: fin.HP | 0,
    atk: fin.ATK | 0,
    wil: fin.WIL | 0,
    arm: fin.ARM || 0,
    res: fin.RES || 0,
    agi: fin.AGI | 0,
    per: fin.PER | 0,
    spd: fin.SPD || 1,
    aeMax: fin.AEmax | 0,
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