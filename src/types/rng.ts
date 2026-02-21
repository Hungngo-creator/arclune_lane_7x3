//home (termux)/arclune_lane_7x3/src/types/rng.ts
export interface RngState {
  seed: number;
  calls: number;
  history?: number[];
  [extra: string]: unknown;
}