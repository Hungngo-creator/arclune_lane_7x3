import type { StatusEffect } from './combat';
import type { UnitArt } from './art';

export type UnitId = string;

export type Side = 'ally' | 'enemy';

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
  baseStats?: Partial<Pick<StatBlock, 'atk' | 'wil' | 'res'>>;
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
  bornSerial?: number;
  ownerIid?: number;
  alive: boolean;
  deadAt?: number;
  isMinion?: boolean;
  ttlTurns?: number;
  statuses?: StatusEffect[];
  color?: string;
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
  revive?: boolean;
  revived?: Partial<UnitToken> | null;
  source?: string;
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