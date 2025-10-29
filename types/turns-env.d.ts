declare module './engine.ts' {
import type { Side } from '@shared-types/units';

  type SlotSpecifier = Side | Uppercase<Side>;

  interface CellCoords {
    cx: number;
    cy: number;
  }

  export function slotToCell(side: SlotSpecifier, slot: number): CellCoords;
  export function slotIndex(side: SlotSpecifier, cx: number, cy: number): number;
}

declare module '../engine.ts' {
  export * from './engine.ts';
}

declare module './statuses.ts' {
  import type { DamageContext, StatusEffect, StatusRegistry } from '@shared-types/combat';
  import type { UnitToken } from '@shared-types/units';

  interface ShieldResult {
    remain: number;
    absorbed: number;
    broke: boolean;
  }

  interface DamageResult {
    dealt?: number;
    absorbed?: number;
    dtype?: string;
  }

type StatusTarget = UnitToken | null | undefined;

  export interface StatusService {
    add(unit: StatusTarget, status: StatusEffect): StatusEffect;
    remove(unit: StatusTarget, id: string): void;
    has(unit: StatusTarget, id: string): boolean;
    get(unit: StatusTarget, id: string): StatusEffect | null;
    purge(unit: StatusTarget): void;
    stacks(unit: StatusTarget, id: string): number;
    onTurnStart(unit: StatusTarget, ctx?: Record<string, unknown>): void;
    onTurnEnd(unit: StatusTarget, ctx?: Record<string, unknown>): void;
    onPhaseStart(side: string, ctx?: Record<string, unknown>): void;
    onPhaseEnd(side: string, ctx?: Record<string, unknown>): void;
    canAct(unit: StatusTarget): boolean;
    blocks(unit: StatusTarget, kind: string): boolean;
    resolveTarget(
      attacker: UnitToken,
      candidates: ReadonlyArray<UnitToken>,
      ctx?: Record<string, unknown>,
    ): UnitToken | null;
    modifyStats(unit: StatusTarget, base: Record<string, number>): Record<string, number>;
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
  export function hookOnLethalDamage(target: StatusTarget): boolean;
}

declare module '../statuses.ts' {
  export * from './statuses.ts';
}

declare module './combat.ts' {
  import type { SessionState } from '@shared-types/combat';
  import type { UnitToken } from '@shared-types/units';

  export function doBasicWithFollowups(Game: SessionState, unit: UnitToken, cap?: number): void;
}

declare module './config.ts' {
  import type { GameConfig } from '@shared-types/config';

  export const CFG: GameConfig;
}

declare module './meta.ts' {
  import type { UnitId } from '@shared-types/units';

  export interface InstanceStats {
    hpMax: number;
    hp: number;
    atk: number;
    wil: number;
    arm: number;
    res: number;
    agi: number;
    per: number;
    spd: number;
    aeMax: number;
    ae: number;
    aeRegen: number;
    hpRegen: number;
    [extra: string]: number;
  }

  export interface InitialRageOptions {
    isLeader?: boolean;
    revive?: boolean;
    reviveSpec?: { rage?: number } | null | undefined;
    [extra: string]: unknown;
  }

  export function makeInstanceStats(unitId: UnitId): InstanceStats;
  export function initialRageFor(unitId: UnitId, options?: InitialRageOptions): number;
}

declare module './vfx.ts' {
  export type {
    SessionWithVfx,
    VfxEvent,
    VfxEventList,
    BloodPulseOptions,
    LightningArcOptions,
    ShieldWrapOptions,
    GroundBurstOptions,
  } from '../src/vfx.ts';

  export {
    vfxAddSpawn,
    vfxAddBloodPulse,
    vfxAddHit,
    vfxAddMelee,
    vfxAddTracer,
    vfxAddLightningArc,
    vfxAddShieldWrap,
    vfxAddGroundBurst,
    vfxDraw,
  } from '../src/vfx.ts';
}

declare module './art.ts' {
  export interface UnitArtInstance extends Record<string, unknown> {
    palette?: Record<string, unknown> | null;
    layout?: Record<string, unknown> | null;
    hpBar?: Record<string, unknown> | null;
    label?: Record<string, unknown> | null;
    sprite?: Record<string, unknown> | null;
    skinKey?: string | null;
  }

  export interface GetUnitArtOptions {
    skinKey?: string | null;
    [extra: string]: unknown;
  }

  export function getUnitArt(unitId: string, options?: GetUnitArtOptions): UnitArtInstance | null;
}

declare module './passives.ts' {
  import type { SessionState } from '@shared-types/combat';
  import type { UnitToken } from '@shared-types/units';

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
  import type {
    ActionChainProcessedResult,
    BattleDetail,
    BattleResult,
    SessionState,
  } from '@shared-types/combat';
  import type { Side, UnitToken } from '@shared-types/units';

  export const TURN_START: 'turn:start';
  export const TURN_END: 'turn:end';
  export const ACTION_START: 'action:start';
  export const ACTION_END: 'action:end';
  export const TURN_REGEN: 'turn:regen';
  export const BATTLE_END: 'battle:end';

  export type GameEventType =
    | typeof TURN_START
    | typeof TURN_END
    | typeof ACTION_START
    | typeof ACTION_END
    | typeof TURN_REGEN
    | typeof BATTLE_END;

  export interface TurnEventDetail {
    game: SessionState;
    unit: UnitToken | null;
    side: Side | null;
    slot: number | null;
    phase: string | null;
    cycle: number | null;
    orderIndex: number | null;
    orderLength: number | null;
    spawned: boolean;
    processedChain: ActionChainProcessedResult | null;
  }

  export interface ActionEventDetail {
    game: SessionState;
    unit: UnitToken | null;
    side: Side | null;
    slot: number | null;
    phase: string | null;
    cycle: number | null;
    orderIndex: number | null;
    orderLength: number | null;
    action: 'basic' | 'ult' | string | null;
    skipped: boolean;
    reason: string | null;
    ultOk?: boolean | null;
  }

  export interface TurnRegenDetail {
    game: SessionState;
    unit: UnitToken | null;
    hpDelta: number;
    aeDelta: number;
  }

  export interface BattleEndDetail {
    game: SessionState;
    result: BattleResult | null;
    context: BattleDetail['context'] | null | undefined;
  }

  export interface GameEventDetailMap {
    [TURN_START]: TurnEventDetail;
    [TURN_END]: TurnEventDetail;
    [ACTION_START]: ActionEventDetail;
    [ACTION_END]: ActionEventDetail;
    [TURN_REGEN]: TurnRegenDetail;
    [BATTLE_END]: BattleEndDetail;
  }

  export function emitGameEvent<T extends GameEventType>(
    type: T,
    detail: GameEventDetailMap[T],
  ): boolean;
}

declare module './utils/time.ts' {
  export function safeNow(): number;
}

declare module './utils/fury.ts' {
  import type { GameConfig } from '@shared-types/config';
  import type { UnitId, UnitToken } from '@shared-types/units';

  export interface FuryTurnOptions {
    clearFresh?: boolean;
    turnStamp?: unknown;
    turnKey?: unknown;
    grantStart?: boolean;
    startAmount?: number;
  }

  export function initializeFury(
    unit: UnitToken | null | undefined,
    unitId: UnitId | null | undefined,
    initial?: number,
    cfg?: GameConfig,
  ): void;
  export function startFuryTurn(unit: UnitToken | null | undefined, opts?: FuryTurnOptions): void;
  export function spendFury(
    unit: UnitToken | null | undefined,
    amount: number | null | undefined,
    cfg?: GameConfig,
  ): number;
  export function resolveUltCost(unit: UnitToken | null | undefined, cfg?: GameConfig): number;
  export function setFury(unit: UnitToken | null | undefined, value: number | null | undefined): number;
  export function clearFreshSummon(unit: UnitToken | null | undefined): void;
 }