import { Meta, makeInstanceStats } from './meta.ts';
import { TP_DELTA } from './data/roster-preview.ts';
import { applyCultivationBonus } from './cultivation.ts';
import { applyEquipmentTpAllocationToInstanceStats } from './utils/equipment.ts';

import type { InstanceStats } from './meta.ts';
import type { RuntimeUnitProgress } from '@shared-types/pve';

type RuntimeStatProgress = Pick<RuntimeUnitProgress, 'level' | 'realm' | 'subRealm' | 'stars' | 'tpAlloc' | 'equipment'>;

const INSTANCE_STAT_BY_TP_STAT: Readonly<Record<string, keyof InstanceStats>> = Object.freeze({
  HP: 'hpMax',
  ATK: 'atk',
  WIL: 'wil',
  ARM: 'arm',
  RES: 'res',
  AGI: 'agi',
  PER: 'per',
  AEmax: 'aeMax',
  AEregen: 'aeRegen',
  HPregen: 'hpRegen',
});

function normalizeInteger(value: unknown, min: number, fallback: number): number {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : null;
  if (numeric == null) return fallback;
  return Math.max(min, Math.floor(numeric));
}

function applyTpAllocToInstanceStats(
  stats: InstanceStats,
  tpAlloc: RuntimeUnitProgress['tpAlloc'] | null | undefined,
): InstanceStats {
  if (!tpAlloc) return stats;
  let out: InstanceStats | null = null;
  for (const [stat, amount] of Object.entries(tpAlloc)) {
    const delta = TP_DELTA[stat];
    const instanceKey = INSTANCE_STAT_BY_TP_STAT[stat];
    if (typeof delta !== 'number' || !instanceKey || !Number.isFinite(amount) || amount === 0) continue;
    if (!out) out = { ...stats };
    const bonus = delta * amount;
    out[instanceKey] = (out[instanceKey] ?? 0) + bonus;
    if (instanceKey === 'hpMax') {
      out.hp = (out.hp ?? 0) + bonus;
    }
  }
  return out ?? stats;
}

export type FinalCollectionUnitStats = InstanceStats & Pick<RuntimeUnitProgress, 'level' | 'realm' | 'subRealm' | 'stars'>;

export function resolveFinalCollectionUnitStats(params: {
  unitId: string;
  progress?: RuntimeStatProgress | null;
  hasCultivationData?: boolean;
}): FinalCollectionUnitStats {
  const { unitId, progress } = params;
  const level = normalizeInteger(progress?.level, 1, 1);
  const realm = normalizeInteger(progress?.realm, 0, 0);
  const subRealm = normalizeInteger(progress?.subRealm, 0, 0);
  const stars = normalizeInteger(progress?.stars, 0, 0);
  const baseStats = Meta.get(unitId) ? makeInstanceStats(unitId, level, stars) : makeInstanceStats(unitId);
  const allocatedStats = applyEquipmentTpAllocationToInstanceStats(
    applyTpAllocToInstanceStats(baseStats, progress?.tpAlloc),
    progress?.equipment,
  );
  const cultivatedStats = applyCultivationBonus({
    ...allocatedStats,
    id: unitId,
    hasCultivationData: params.hasCultivationData ?? !!progress,
    realm,
    subRealm,
  });
  const { id: _id, hasCultivationData: _hasCultivationData, ...stats } = cultivatedStats;
  return {
    ...stats,
    level,
    realm,
    subRealm,
    stars,
  };
}

