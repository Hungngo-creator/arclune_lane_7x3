import type { RngState } from '@shared-types/rng';

const UINT32_MAX = 0x100000000;
const DEFAULT_SEED = 0x9e3779b9;

function toUint32(value: unknown, fallback = DEFAULT_SEED): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback >>> 0;
  return (numeric >>> 0) || (fallback >>> 0);
}

export function createRngState(seed?: unknown): RngState {
  return {
    seed: toUint32(seed),
    calls: 0,
  };
}

export function nextRngValue(rng: RngState | null | undefined): number {
  const state = rng ?? createRngState();
  let seed = toUint32(state.seed);
  seed = (seed * 1664525 + 1013904223) >>> 0;
  state.seed = seed;
  state.calls = Math.max(0, Math.floor(Number(state.calls) || 0)) + 1;
  return seed / UINT32_MAX;
}
