import { performChapMinhUltRuntime } from './chap-minh-runtime.ts';
import { performLyThanhThuUltRuntime } from './ly-thanh-thu-runtime.ts';
import { performNguyenLeUltRuntime } from './nguyen-le-runtime.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

export interface PveUltHookContext {
  game: SessionState;
  unit: UnitToken;
  ultSkill: unknown;
  extendBusy: (ms: number) => void;
}

interface PveUnitRuntimeHook {
  onUlt?: (ctx: PveUltHookContext) => void;
}

const PVE_UNIT_RUNTIME_HOOKS: Readonly<Record<string, PveUnitRuntimeHook>> = Object.freeze({
  huyen_vu_chap_minh: {
    onUlt: performChapMinhUltRuntime,
  },
  ly_thanh_thu: {
    onUlt: performLyThanhThuUltRuntime,
  },
  nguyen_le: {
    onUlt: performNguyenLeUltRuntime,
  },
});

export function runPveRuntimeUltHook(ctx: PveUltHookContext): void {
  PVE_UNIT_RUNTIME_HOOKS[ctx.unit.id]?.onUlt?.(ctx);
}
