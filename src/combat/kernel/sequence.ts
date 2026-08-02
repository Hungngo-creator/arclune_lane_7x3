import type { SessionState } from '@shared-types/combat';
import type { ActionIdentity } from './types.ts';

export interface CombatSequenceState { actionSerial: number; chainSerial: number; eventSerial: number; deathSerial: number }
type RuntimeSequence = { combatSequence?: CombatSequenceState };

export function getCombatSequence(game: SessionState): CombatSequenceState {
  const runtime = (game.runtime ??= {}) as RuntimeSequence;
  const sequence = runtime.combatSequence ??= { actionSerial: 0, chainSerial: 0, eventSerial: 0, deathSerial: 0 };
  sequence.deathSerial ??= 0;
  return sequence;
}

export function createNaturalAction(game: SessionState, actionKind = 'ability'): ActionIdentity {
  const sequence = getCombatSequence(game);
  const actionSerial = ++sequence.actionSerial;
  const chainSerial = ++sequence.chainSerial;
  return { actionId: `action-${actionSerial}`, chainId: `chain-${chainSerial}`, parentActionId: null, actionKind, actionSerial };
}

export function createLinkedAction(game: SessionState, parent: ActionIdentity, actionKind: string): ActionIdentity {
  const actionSerial = ++getCombatSequence(game).actionSerial;
  return { actionId: `action-${actionSerial}`, chainId: parent.chainId, parentActionId: parent.actionId, actionKind, actionSerial };
}

export function nextEventSerial(game: SessionState): number { return ++getCombatSequence(game).eventSerial; }
export function nextDeathSerial(game: SessionState): number { return ++getCombatSequence(game).deathSerial; }
