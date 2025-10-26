export const __typesOnly = null;

export type UnitId = string;

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

export interface UnitToken {
  id: UnitId;
  fury?: number;
  furyMax?: number;
  rage?: number;
  _furyState?: FuryState;
  [extra: string]: unknown;
}