//home (termux)/arclune_lane_7x3/src/units.ts
import {
  deriveBudgetFromRankRole,
  evaluateCostBudget,
  mergeBudgetInputs,
  type CostBudgetInput,
} from './data/cost-budget';
import type { UnitId } from '@shared-types/units';

export interface UnitDefinition {
  id: UnitId;
  name: string;
  cost: number;
  rank?: string | null;
  role?: string | null;
}

interface UnitSeedDefinition extends Omit<UnitDefinition, 'cost'> {
  budget?: CostBudgetInput;
}

export function resolveUnitCost(seed: UnitSeedDefinition): number {
  const baseline = deriveBudgetFromRankRole(seed.rank, seed.role);
  const mergedBudget = mergeBudgetInputs(baseline, seed.budget);
  return evaluateCostBudget(mergedBudget).cost;
}

const UNIT_LIST = [
{ id: 'thien_luu', name: 'Thiên Lưu', rank: 'SSR', role: 'Ranger' },
  { id: 'vu_thien', name: 'Vũ Thiên', rank: 'SSR', role: 'Warrior' },
  { id: 'anna', name: 'Anna', rank: 'SSR', role: 'Support' },
  { id: 'lao_khat_cai', name: 'Lão Khất Cái', rank: 'SR', role: 'Warrior' },
  { id: 'ai_lan', name: 'Ái Lân', rank: 'SSR', role: 'Support' },
  { id: 'faun', name: 'Faun', rank: 'SSR', role: 'Summoner' },
  { id: 'basil_thorne', name: 'Basil Thorne', rank: 'SSR', role: 'Tanker' },
  { id: 'mong_yem', name: 'Mộng Yểm', rank: 'SSR', role: 'Mage' },
  { id: 'chan_nga', name: 'Chân Ngã', rank: 'UR', role: 'Summoner' },
  { id: 'ma_ton_diep_lam', name: 'Ma Tôn - Diệp Lâm', rank: 'UR', role: 'Mage' },
  { id: 'mo_da', name: 'Mộ Dạ', rank: 'SSR', role: 'Assassin' },
  { id: 'ngao_binh', name: 'Ngao Bính', rank: 'UR', role: 'Warrior' },
  { id: 'lau_khac_ma_chu', name: 'Lậu Khắc Ma Chủ', rank: 'Prime', role: 'Mage' },
  { id: 'blood_avatar', name: 'Hóa Thân Huyết Chủ', rank: 'Prime', role: 'Mage' },
  { id: 'phe', name: 'Phệ', rank: 'UR', role: 'Mage' },
  { id: 'kiemtruongda', name: 'Kiếm Trường Dạ', rank: 'UR', role: 'Warrior' },
  { id: 'loithienanh', name: 'Lôi Thiên Ảnh', rank: 'SSR', role: 'Tanker' },
  { id: 'huyen_vu_chap_minh', name: 'Huyền Vũ – Chấp Minh', rank: 'UR', role: 'Tanker' },
  { id: 'laky', name: 'La Kỳ', rank: 'SSR', role: 'Support' },
  { id: 'kydieu', name: 'Kỳ Diêu', rank: 'SSR', role: 'Support' },
  { id: 'doanminh', name: 'Doãn Minh', rank: 'SR', role: 'Support' },
  { id: 'tranquat', name: 'Trần Quát', rank: 'R', role: 'Summoner' },
  { id: 'linhgac', name: 'Lính Gác', rank: 'N', role: 'Warrior' },
] satisfies ReadonlyArray<UnitSeedDefinition>;

const RESOLVED_UNIT_LIST = UNIT_LIST.map((unit) => ({
  id: unit.id,
  name: unit.name,
  rank: unit.rank ?? null,
  role: unit.role ?? null,
  cost: resolveUnitCost(unit),
})) satisfies ReadonlyArray<UnitDefinition>;

export const UNITS: ReadonlyArray<UnitDefinition> = RESOLVED_UNIT_LIST;

export const UNIT_INDEX: ReadonlyMap<UnitId, UnitDefinition> = new Map<UnitId, UnitDefinition>(
  RESOLVED_UNIT_LIST.map((unit) => [unit.id, unit] as const),
);

export function lookupUnit(unitId: UnitId): UnitDefinition | null {
  const unit = UNIT_INDEX.get(unitId);
  return unit ? { ...unit } : null;
}