//home (termux)/arclune_lane_7x3/src/units.ts
import type { UnitId } from '@shared-types/units';

export interface UnitDefinition {
  id: UnitId;
  name: string;
  cost: number;
  rank?: string | null;
  role?: string | null;
}

const UNIT_LIST = [
  { id: 'diep_minh', name: 'Diệp Minh', cost: 17, rank: 'SSR', role: 'Support' },
  { id: 'nguyet_san', name: 'Nguyệt San', cost: 20, rank: 'UR', role: 'Assassin' },
  { id: 'trung_lam', name: 'Trùng Lâm', cost: 18, rank: 'SSR', role: 'Summoner' },
  { id: 'huyet_tich', name: 'Huyết Tịch', cost: 20, rank: 'UR', role: 'Mage' },
  { id: 'khai_nguyen_tu', name: 'Khai Nguyên Tử', cost: 21, rank: 'UR', role: 'Mage' },
  { id: 'thien_luu', name: 'Thiên Lưu', cost: 17, rank: 'SSR', role: 'Ranger' },
  { id: 'vu_thien', name: 'Vũ Thiên', cost: 17, rank: 'SSR', role: 'Warrior' },
  { id: 'anna', name: 'Anna', cost: 17, rank: 'SSR', role: 'Support' },
  { id: 'lao_khat_cai', name: 'Lão Khất Cái', cost: 12, rank: 'SR', role: 'Warrior' },
  { id: 'ai_lan', name: 'Ái Lân', cost: 20, rank: 'SSR', role: 'Support' },
  { id: 'faun', name: 'Faun', cost: 18, rank: 'SSR', role: 'Summoner' },
  { id: 'basil_thorne', name: 'Basil Thorne', cost: 13, rank: 'SSR', role: 'Tanker' },
  { id: 'mong_yem', name: 'Mộng Yểm', cost: 18, rank: 'SSR', role: 'Mage' },{ id: 'chan_nga', name: 'Chân Ngã', cost: 18, rank: 'UR', role: 'Summoner' },
  { id: 'ma_ton_diep_lam', name: 'Ma Tôn - Diệp Lâm', cost: 19, rank: 'UR', role: 'Mage' },
  { id: 'mo_da', name: 'Mộ Dạ', cost: 15, rank: 'SSR', role: 'Warrior' },
  { id: 'ngao_binh', name: 'Ngao Bính', cost: 18, rank: 'UR', role: 'Warrior' },
  { id: 'lau_khac_ma_chu', name: 'Lậu Khắc Ma Chủ', cost: 21, rank: 'Prime', role: 'Mage' },
  { id: 'phe', name: 'Phệ', cost: 20, rank: 'UR', role: 'Mage' },
  { id: 'kiemtruongda', name: 'Kiếm Trường Dạ', cost: 16, rank: 'UR', role: 'Warrior' },
  { id: 'loithienanh', name: 'Lôi Thiên Ảnh', cost: 18, rank: 'SSR', role: 'Tanker' },{ id: 'laky', name: 'La Kỳ', cost: 14, rank: 'SSR', role: 'Support' },
  { id: 'kydieu', name: 'Kỳ Diêu', cost: 12, rank: 'SR', role: 'Support' },
  { id: 'doanminh', name: 'Doãn Minh', cost: 12, rank: 'SR', role: 'Support' },
  { id: 'tranquat', name: 'Trần Quát', cost: 10, rank: 'R', role: 'Summoner' },
  { id: 'linhgac', name: 'Lính Gác', cost: 8, rank: 'N', role: 'Warrior' },
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