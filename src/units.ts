import type { UnitId } from '@shared-types/units';

export interface UnitDefinition {
  id: UnitId;
  name: string;
  cost: number;
  rank?: string | null;
  role?: string | null;
}

const UNIT_LIST = [
  { id: 'mong_yem', name: 'Mộng Yểm', cost: 18 },
  { id: 'chan_nga', name: 'Chân Ngã', cost: 18 },
  { id: 'ma_ton_diep_lam', name: 'Ma Tôn - Diệp Lâm', cost: 19 },
  { id: 'mo_da', name: 'Mộ Dạ', cost: 15 },
  { id: 'ngao_binh', name: 'Ngao Bính', cost: 18 },
  { id: 'lau_khac_ma_chu', name: 'Lậu Khắc Ma Chủ', cost: 21 },
  { id: 'phe', name: 'Phệ', cost: 20 },
  { id: 'kiemtruongda', name: 'Kiếm Trường Dạ', cost: 16 },
  { id: 'loithienanh', name: 'Lôi Thiên Ảnh', cost: 18 },
  { id: 'laky', name: 'La Kỳ', cost: 14 },
  { id: 'kydieu', name: 'Kỳ Diêu', cost: 12 },
  { id: 'doanminh', name: 'Doãn Minh', cost: 12 },
  { id: 'tranquat', name: 'Trần Quát', cost: 10 },
  { id: 'linhgac', name: 'Lính Gác', cost: 8 },
] satisfies ReadonlyArray<UnitDefinition>;

export const UNITS: ReadonlyArray<UnitDefinition> = UNIT_LIST;

const UNIT_INDEX_INTERNAL = new Map<UnitId, UnitDefinition>(
  UNIT_LIST.map((unit) => [unit.id, unit] as const),
);

export const UNIT_INDEX: ReadonlyMap<UnitId, UnitDefinition> = UNIT_INDEX_INTERNAL;

export function lookupUnit(unitId: UnitId): UnitDefinition | null {
  const unit = UNIT_INDEX_INTERNAL.get(unitId);
  return unit ? { ...unit } : null;
}