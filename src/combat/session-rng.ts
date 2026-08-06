import { nextRngValue } from '../utils/rng.ts';
import type { SessionState } from '@shared-types/combat';

export function getSessionRandom(game: SessionState): () => number {
  if (!game.rng) throw new Error('[canonical-action] session has no authoritative RNG state');
  return () => nextRngValue(game.rng);
}
