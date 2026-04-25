import { mongYemRuntimeHook } from './mong-yem.ts';
import { lyThanhThuRuntimeHook } from './ly-thanh-thu.ts';

import type { UnitRuntimeHook } from './types.ts';

export const UNIT_RUNTIME_HOOKS: Readonly<Record<string, UnitRuntimeHook>> = Object.freeze({
  mong_yem: mongYemRuntimeHook,
  ly_thanh_thu: lyThanhThuRuntimeHook,
});

export function getUnitRuntimeHook(unitId: string | null | undefined): UnitRuntimeHook | null {
  if (!unitId) return null;
  return UNIT_RUNTIME_HOOKS[unitId] ?? null;
}
