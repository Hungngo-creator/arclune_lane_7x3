//home (termux)/arclune_lane_7x3/src/types/rng.ts
import type { UnknownRecord } from './common.ts';

export interface RngState extends UnknownRecord {
  seed: number;
  calls: number;
  history?: number[];
  [extra: string]: unknown;
}