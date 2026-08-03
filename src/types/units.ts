//home (termux)/arclune_lane_7x3/src/types/units.ts
import type { StatusEffect } from './combat';
import type { UnitArt } from './art';

export type UnitId = string;

export type Side = 'ally' | 'enemy';
export type LifeState = 'alive' | 'hp-zero' | 'death-prevention' | 'dead-confirmed' | 'removed' | 'erased';

export interface StatBlock {
  hpMax?: number;
  hp?: number;
  atk?: number;
  wil?: number;
  arm?: number;
  res?: number;
  agi?: number;
  per?: number;
  spd?: number;
  aeMax?: number;
  ae?: number;
  aeRegen?: number;
  hpRegen?: number;
  fury?: number;
  furyMax?: number;
  rage?: number;
  /** Các chỉ số cơ sở trước khi áp buff/debuff */
  baseStats?: Record<string, number>;
}

export interface FuryState {
  turnGain: number;
  skillGain: number;
  hitGain: number;
  skillPerTargetGain: number;
  skillDrain: number;
  turnStamp: unknown;
  skillTag: string | null;
  freshSummon: boolean;
  lastStart: number;
}

export interface UnitToken extends StatBlock {
  id: UnitId;
  name?: string;
  side: Side;
  cx: number;
  cy: number;
  iid?: number;
  /** Stable identity of an HP-bearing non-summon across revived lives. */
  trueSelfId?: string;
  /** Starts at one and increments only when this true self is reborn. */
  incarnationSerial?: number;
  /** Starts at one and increments whenever this true self begins a revived life. */
  lifeSerial?: number;
  bornSerial?: number;
  ownerIid?: number;
  /** Spawn-time combat identity; lifecycle policy must not infer this from flags. */
  entityKind?: 'collection-unit' | 'leader' | 'npc' | 'boss' | 'summon' | 'summoned-creep' | 'clone' | 'combat-object';
  alive: boolean;
  /** Canonical lifecycle state. `alive` remains a compatibility projection. */
  lifeState?: LifeState;
  deadAt?: number;
  isMinion?: boolean;
  ttlTurns?: number;
  statuses?: StatusEffect[];
  color?: string;
  class?: string;
  element?: string;
  base_element?: string;
  art?: UnitArt | null;
  skinKey?: string | null;
  furyMax?: number;
  fury?: number;
  rage?: number;
  _furyState?: FuryState;
  [extra: string]: unknown;
}

export interface SummonRequest {
  by?: UnitId | null;
  side: Side;
  slot: number;
  unit?: (Partial<UnitToken> & { art?: UnitArt | null }) | null;
}

export interface QueuedSummonRequest {
  unitId: UnitId;
  side: Side;
  slot: number;
  cx: number;
  cy: number;
  spawnCycle: number;
  name?: string;
  color?: string;
  class?: string;
  element?: string;
  base_element?: string;
  revive?: boolean;
  revived?: Partial<UnitToken> | null;
  source?: string;
  mutated?: boolean;
  mutationBonusPct?: number;
  mutationDebuffPool?: Array<'bleed' | 'stun' | 'poison'>;
  statOverrides?: Partial<StatBlock>;
}

export type SummonQueue = Map<number, QueuedSummonRequest>;

export function createSummonQueue(): SummonQueue {
  return new Map<number, QueuedSummonRequest>();
}

export interface QueuedSummonState extends Record<Side, SummonQueue> {
  ally: SummonQueue;
  enemy: SummonQueue;
}

export interface ActionChainEntry {
  side: Side;
  slot: number;
  unit: Partial<UnitToken>;
}

export type ActionChainProcessedResult = number | null;