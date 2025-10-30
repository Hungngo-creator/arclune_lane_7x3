import type { UnitId } from '@shared-types/units';

type NormalizableUnitId = UnitId | number | null | undefined;

export function normalizeUnitId(id: NormalizableUnitId): string {
  if (typeof id === 'string'){
    return id;
  }
  if (typeof id === 'number'){
    return Number.isFinite(id) ? String(id) : '';
  }
  if (id == null){
    return '';
  }
  const value = String(id);
  return typeof value === 'string' ? value : '';
}
