import type { UnitToken } from '@shared-types/units';
import type { SessionState } from '@shared-types/combat';
import type { SourceAttribution } from './kernel/types.ts';

export interface StatusDamageOptions {
  base?: number;
  dtype?: string;
  attackType?: string;
  skillMul?: number;
  sourceAttribution?: SourceAttribution;
  [extra: string]: unknown;
}

type StatusDamageHandler = (
  game: SessionState,
  source: UnitToken,
  target: UnitToken,
  options: StatusDamageOptions,
) => unknown;

let damageHandler: StatusDamageHandler | null = null;

export function registerStatusDamageHandler(handler: StatusDamageHandler): void {
  damageHandler = handler;
}

export function executeStatusDamage(
  game: SessionState,
  source: UnitToken,
  target: UnitToken,
  options: StatusDamageOptions,
): unknown {
  if (!damageHandler) {
    throw new Error('[statuses] combat damage adapter is not initialized');
  }
  return damageHandler(game, source, target, options);
}
