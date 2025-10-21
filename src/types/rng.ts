export interface RngState {
  seed: number;
  calls: number;
  history?: number[];
  [extra: string]: unknown;
}