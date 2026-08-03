import type { SessionState } from '@shared-types/combat';

export interface TrueSelfCombatRecord {
  trueSelfId: string;
  confirmedKills: number;
  incarnationSerial: number;
  deathHistory: string[];
  reviveHistory: Array<Record<string, unknown>>;
  reincarnationHistory: Array<Record<string, unknown>>;
  rebirthHistory: Array<Record<string, unknown>>;
}

type Runtime = { trueSelfRecords?: Record<string, Partial<TrueSelfCombatRecord>> };
const positiveInteger = (value: unknown, fallback: number): number => Number.isInteger(value) && Number(value) >= 1 ? Number(value) : fallback;
const nonNegativeInteger = (value: unknown): number => Number.isInteger(value) && Number(value) >= 0 ? Number(value) : 0;
const history = (value: unknown): Array<Record<string, unknown>> => Array.isArray(value) ? value.filter(item => item != null && typeof item === 'object') as Array<Record<string, unknown>> : [];

/** The only migration/initialization boundary for persistent true-self combat state. */
export function ensureTrueSelfCombatRecord(game: SessionState, trueSelfId: string): TrueSelfCombatRecord {
  if (!trueSelfId) throw new Error('[combat-identity] trueSelfId is required');
  const records = (((game.runtime ??= {}) as Runtime).trueSelfRecords ??= {});
  const old = records[trueSelfId] ?? {};
  const record: TrueSelfCombatRecord = {
    trueSelfId,
    confirmedKills: nonNegativeInteger(old.confirmedKills),
    incarnationSerial: positiveInteger(old.incarnationSerial, 1),
    deathHistory: Array.isArray(old.deathHistory) ? old.deathHistory.filter(item => typeof item === 'string') : [],
    reviveHistory: history(old.reviveHistory),
    reincarnationHistory: history(old.reincarnationHistory),
    rebirthHistory: history(old.rebirthHistory),
  };
  records[trueSelfId] = record;
  return record;
}

export const lifeIdentityKey = (trueSelfId: string, incarnationSerial: number, lifeSerial: number): string =>
  `${trueSelfId}:${incarnationSerial}:${lifeSerial}`;
