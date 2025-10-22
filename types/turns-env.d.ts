declare module './engine.ts' {
  export function slotToCell(side: unknown, slot: number): { cx: number; cy: number };
  export function slotIndex(side: unknown, cx: number, cy: number): number;
}

declare module '../engine.ts' {
  export function slotIndex(side: unknown, cx: number, cy: number): number;
}

declare module './statuses.js' {
  export const Statuses: {
    canAct(unit: unknown): boolean;
    onTurnStart(unit: unknown, ctx: unknown): void;
    onTurnEnd(unit: unknown, ctx: unknown): void;
    blocks(unit: unknown, kind: string): boolean;
  };
}

declare module '../statuses.js' {
  export const Statuses: {
    canAct(unit: unknown): boolean;
  };
}

declare module './combat.ts' {
  export function doBasicWithFollowups(state: unknown, unit: unknown, cap: number): void;
}

declare module './config.js' {
  export const CFG: Record<string, unknown>;
}

declare module './meta.js' {
  export function makeInstanceStats(unitId: unknown): Record<string, unknown>;
  export function initialRageFor(unitId: unknown, options?: Record<string, unknown>): number;
}

declare module './vfx.js' {
  export function vfxAddSpawn(...args: unknown[]): void;
  export function vfxAddBloodPulse(...args: unknown[]): void;
}

declare module './art.js' {
  export function getUnitArt(unitId: unknown): Record<string, unknown> | null;
}

declare module './passives.js' {
  export function emitPassiveEvent(...args: unknown[]): void;
  export function applyOnSpawnEffects(...args: unknown[]): void;
  export function prepareUnitForPassives(unit: unknown): void;
}

declare module './events.ts' {
  export function emitGameEvent(...args: unknown[]): void;
  export const TURN_START: string;
  export const TURN_END: string;
  export const ACTION_START: string;
  export const ACTION_END: string;
  export const TURN_REGEN: string;
}

declare module './utils/time.js' {
  export function safeNow(): number;
}

declare module './utils/fury.js' {
  export function initializeFury(...args: unknown[]): void;
  export function startFuryTurn(...args: unknown[]): void;
  export function spendFury(...args: unknown[]): void;
  export function resolveUltCost(unit: unknown, cfg: unknown): number;
  export function setFury(...args: unknown[]): void;
  export function clearFreshSummon(...args: unknown[]): void;
}
