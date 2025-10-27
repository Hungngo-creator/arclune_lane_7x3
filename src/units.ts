import type { UnitId } from '@types/units';

export interface UnitDefinition {
  id: UnitId;
  name: string;
  cost: number;
  rank?: string | null;
  role?: string | null;
}

const UNIT_LIST = [
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