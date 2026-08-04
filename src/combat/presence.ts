import type { LifeState, UnitToken } from '../types/units.ts';

export interface CombatPresence {
  readonly isCombatAlive: boolean;
  readonly isTargetable: boolean;
  readonly isTurnEligible: boolean;
  readonly isAuthoritativeOccupant: boolean;
  readonly isLiveRenderable: boolean;
  readonly isCorpseRenderable: boolean;
}

const NON_LIVE_STATES = new Set<LifeState>(['hp-zero', 'death-prevention', 'dead-confirmed', 'removed', 'erased']);

/** The single character-agnostic projection of canonical gameplay presence. */
export function projectCombatPresence(unit: UnitToken | null | undefined): CombatPresence {
  if (!unit) return { isCombatAlive: false, isTargetable: false, isTurnEligible: false, isAuthoritativeOccupant: false, isLiveRenderable: false, isCorpseRenderable: false };
  const lifeState = unit.lifeState ?? (unit.alive !== false && (unit.hp == null || unit.hp > 0) ? 'alive' : 'dead-confirmed');
  const live = lifeState === 'alive' && !NON_LIVE_STATES.has(lifeState) && unit.alive !== false && (unit.hp == null || Number(unit.hp) > 0);
  const corpse = !live && lifeState !== 'removed' && lifeState !== 'erased';
  return { isCombatAlive: live, isTargetable: live, isTurnEligible: live, isAuthoritativeOccupant: live, isLiveRenderable: live, isCorpseRenderable: corpse };
}

export const isCombatAlive = (unit: UnitToken | null | undefined): boolean => projectCombatPresence(unit).isCombatAlive;
export const isTargetable = (unit: UnitToken | null | undefined): boolean => projectCombatPresence(unit).isTargetable;
export const isTurnEligible = (unit: UnitToken | null | undefined): boolean => projectCombatPresence(unit).isTurnEligible;
export const isAuthoritativeOccupant = (unit: UnitToken | null | undefined): boolean => projectCombatPresence(unit).isAuthoritativeOccupant;
export const isLiveRenderable = (unit: UnitToken | null | undefined): boolean => projectCombatPresence(unit).isLiveRenderable;
export const isCorpseRenderable = (unit: UnitToken | null | undefined): boolean => projectCombatPresence(unit).isCorpseRenderable;
