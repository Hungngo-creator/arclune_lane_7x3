declare module './engine.ts' {
  export function slotToCell(side: unknown, slot: number): { cx: number; cy: number };
  export function slotIndex(side: unknown, cx: number, cy: number): number;
}

declare module '../engine.ts' {
  export function slotIndex(side: unknown, cx: number, cy: number): number;
}

declare module './statuses.ts' {
  import type { DamageContext, StatusEffect, StatusRegistry } from '@types/combat';
  import type { UnitToken } from '@types/units';

  export interface ShieldResult {
    remain: number;
    absorbed: number;
    broke: boolean;
  }

  export interface DamageResult {
    dealt?: number;
    absorbed?: number;
    dtype?: string;
  }

  export interface StatusService {
    add(unit: UnitToken | null | undefined, status: StatusEffect): StatusEffect;
    remove(unit: UnitToken | null | undefined, id: string): void;
    has(unit: UnitToken | null | undefined, id: string): boolean;
    get(unit: UnitToken | null | undefined, id: string): StatusEffect | null;
    purge(unit: UnitToken | null | undefined): void;
    stacks(unit: UnitToken | null | undefined, id: string): number;
    onTurnStart(unit: UnitToken | null | undefined, ctx?: Record<string, unknown>): void;
    onTurnEnd(unit: UnitToken | null | undefined, ctx?: Record<string, unknown>): void;
    onPhaseStart(side: string, ctx?: Record<string, unknown>): void;
    onPhaseEnd(side: string, ctx?: Record<string, unknown>): void;
    canAct(unit: UnitToken | null | undefined): boolean;
    blocks(unit: UnitToken | null | undefined, kind: string): boolean;
    resolveTarget(
      attacker: UnitToken,
      candidates: ReadonlyArray<UnitToken>,
      ctx?: Record<string, unknown>,
    ): UnitToken | null;
    modifyStats(unit: UnitToken | null | undefined, base: Record<string, number>): Record<string, number>;
    beforeDamage(
      attacker: UnitToken,
      target: UnitToken,
      ctx?: Partial<DamageContext> & Record<string, unknown>,
    ): DamageContext;
    absorbShield(target: UnitToken, dmg: number, ctx?: Record<string, unknown>): ShieldResult;
    afterDamage(attacker: UnitToken, target: UnitToken, result?: DamageResult): DamageResult;
    make: StatusRegistry;
  }

  export const Statuses: StatusService;
  export function hookOnLethalDamage(target: UnitToken): boolean;
}

declare module '../statuses.ts' {
  export * from './statuses.ts';
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

declare module './passives.ts' {
  import type { SessionState } from '@types/combat';
  import type { UnitToken } from '@types/units';

  export interface PassiveRuntimeContext extends Record<string, unknown> {
    afterHit?: Array<(afterCtx?: Record<string, unknown>) => void>;
    damage?: Record<string, unknown> & { baseMul?: number };
    log?: Array<Record<string, unknown>>;
    target?: UnitToken | null;
  }

  export function emitPassiveEvent(
    Game: SessionState | null | undefined,
    unit: UnitToken | null | undefined,
    when: string,
    ctx?: PassiveRuntimeContext,
  ): void;
  export function applyOnSpawnEffects(
    Game: SessionState | null | undefined,
    unit: UnitToken | null | undefined,
    onSpawn?: Record<string, unknown>,
  ): void;
  export function prepareUnitForPassives(unit: UnitToken | null | undefined): void;
  export function stacksOf(unit: UnitToken | null | undefined, id: string): number;
  export function recomputeUnitStats(unit: UnitToken | null | undefined): void;
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