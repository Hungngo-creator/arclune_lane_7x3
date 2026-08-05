import type { SessionState } from '@shared-types/combat';

interface RngRuntime { rng?: () => number; random?: () => number; canonicalRngSeed?: number }

export function getSessionRandom(game: SessionState): () => number {
  const runtime = (game.runtime ??= {}) as RngRuntime;
  if (typeof runtime.rng === 'function') return runtime.rng;
  if (typeof runtime.random === 'function') return runtime.random;
  const root = game as SessionState & { rng?: () => number; random?: () => number };
  if (typeof root.rng === 'function') return root.rng;
  if (typeof root.random === 'function') return root.random;
  runtime.canonicalRngSeed = Number.isSafeInteger(runtime.canonicalRngSeed) ? runtime.canonicalRngSeed : 0x5eed1234;
  runtime.rng = () => {
    runtime.canonicalRngSeed = ((runtime.canonicalRngSeed! * 1664525 + 1013904223) >>> 0);
    return runtime.canonicalRngSeed / 0x100000000;
  };
  return runtime.rng;
}
