import type { SessionState } from '@shared-types/combat';
import type { Side } from '../../types/units.ts';
import { getLifeState, type DeathRecord } from './life-cycle.ts';
import { nextEventSerial } from './sequence.ts';

export interface BattleEndResult { ended: boolean; winner: Side | 'draw' | null; reason: string | null }
export function evaluateBattleEnd(game: SessionState, _wave: readonly DeathRecord[] = []): BattleEndResult {
  const rt = (game.runtime ??= {}) as { battleEnd?: BattleEndResult; combatEvents?: Record<string, unknown>[] };
  if (rt.battleEnd?.ended) return rt.battleEnd;
  const ally = game.tokens.find(unit => unit.isLeader && unit.side === 'ally');
  const enemy = game.tokens.find(unit => unit.isLeader && unit.side === 'enemy');
  const allyDead = !!ally && getLifeState(ally) === 'dead-confirmed'; const enemyDead = !!enemy && getLifeState(enemy) === 'dead-confirmed';
  if (!allyDead && !enemyDead) return { ended: false, winner: null, reason: null };
  const result: BattleEndResult = { ended: true, winner: allyDead && enemyDead ? 'draw' : allyDead ? 'enemy' : 'ally', reason: 'leader-death' };
  rt.battleEnd = result; (rt.combatEvents ??= []).push({ type: 'BATTLE_ENDED', eventSerial: nextEventSerial(game), ...result });
  return result;
}
