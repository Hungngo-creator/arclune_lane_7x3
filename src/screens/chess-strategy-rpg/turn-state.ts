export type TeamId = 'player' | 'enemy';

export type MatchCommandType = 'move' | 'basicAttack' | 'castSkill' | 'castUlt' | 'endTurn';

export interface TeamResourceState {
  ae: number;
  noSkillTurns: number;
}

export interface MatchState {
  phase: TeamId;
  activeTeam: TeamId;
  activeIndexInLineup: number;
  turnCountPlayer: number;
  actionUsed: boolean;
  movedTiles: number;
  readonly lineupSize: number;
  resources: Record<TeamId, TeamResourceState>;
  roundSkillUsed: Record<TeamId, boolean>;
}

export interface CommandCheckOptions {
  skillCost?: number;
  ae?: number;
  manualUlt?: boolean;
  rage?: number;
  ultCost?: number;
}

export interface ApplyActionOptions {
  skillCost?: number;
}

export const MOVE_AE_PER_TILE = 1;
export const MOVE_AE_CAP_PER_TURN = 3;
export const BASIC_ATTACK_AE_GAIN = 2;
export const ANTI_HOARD_DECAY_AFTER_TURNS = 2;
export const ANTI_HOARD_AE_DECAY = 3;

export function createInitialMatchState(lineupSize: number): MatchState {
  return {
    phase: 'player',
    activeTeam: 'player',
    activeIndexInLineup: 0,
    turnCountPlayer: 1,
    actionUsed: false,
    movedTiles: 0,
    lineupSize: Math.max(1, Math.floor(lineupSize)),
    resources: {
      player: { ae: 0, noSkillTurns: 0 },
      enemy: { ae: 0, noSkillTurns: 0 },
    },
    roundSkillUsed: {
      player: false,
      enemy: false,
    },
  };
}

export function canUseCommand(state: MatchState, command: MatchCommandType, options: CommandCheckOptions = {}): boolean {
  if (command === 'endTurn') return true;
  if (command === 'move') return true;
  if (state.actionUsed) return false;
  if (command === 'castSkill') {
    return (options.ae ?? state.resources[state.activeTeam].ae) >= (options.skillCost ?? 0);
  }
  if (command === 'castUlt') {
    if (!options.manualUlt) return false;
    return (options.rage ?? 0) >= (options.ultCost ?? 100);
  }
  return true;
}

export function recordMove(state: MatchState, tileSteps: number): MatchState {
  const steps = Math.max(0, Math.floor(tileSteps));
  const nextMovedTiles = state.movedTiles + steps;
  const prevEligible = Math.min(MOVE_AE_CAP_PER_TURN, state.movedTiles);
  const nextEligible = Math.min(MOVE_AE_CAP_PER_TURN, nextMovedTiles);
  const aeGain = Math.max(0, nextEligible - prevEligible) * MOVE_AE_PER_TILE;
  const activeResources = state.resources[state.activeTeam];
  return {
    ...state,
    movedTiles: nextMovedTiles,
    resources: {
      ...state.resources,
      [state.activeTeam]: {
        ...activeResources,
        ae: Number((activeResources.ae + aeGain).toFixed(1)),
      },
    },
  };
}

export function markActionUsed(state: MatchState): MatchState {
  return {
    ...state,
    actionUsed: true,
  };
}

export function applyActionCommand(state: MatchState, command: 'basicAttack' | 'castSkill' | 'castUlt', options: ApplyActionOptions = {}): MatchState {
  const activeResources = state.resources[state.activeTeam];
  if (command === 'basicAttack') {
    return {
      ...markActionUsed(state),
      resources: {
        ...state.resources,
        [state.activeTeam]: {
          ...activeResources,
          ae: Number((activeResources.ae + BASIC_ATTACK_AE_GAIN).toFixed(1)),
        },
      },
    };
  }

  if (command === 'castSkill') {
    const skillCost = Math.max(0, options.skillCost ?? 0);
    return {
      ...markActionUsed(state),
      resources: {
        ...state.resources,
        [state.activeTeam]: {
          ...activeResources,
          ae: Number(Math.max(0, activeResources.ae - skillCost).toFixed(1)),
          noSkillTurns: 0,
        },
      },
      roundSkillUsed: {
        ...state.roundSkillUsed,
        [state.activeTeam]: true,
      },
    };
  }

  return markActionUsed(state);
}

export function advanceTurn(state: MatchState): MatchState {
  const nextIndex = state.activeIndexInLineup + 1;
  if (nextIndex < state.lineupSize) {
    return {
      ...state,
      activeIndexInLineup: nextIndex,
      actionUsed: false,
      movedTiles: 0,
    };
  }

  const previousTeam = state.activeTeam;
  const previousResources = state.resources[previousTeam];
  const noSkillTurns = state.roundSkillUsed[previousTeam] ? 0 : previousResources.noSkillTurns + 1;
  const shouldDecay = noSkillTurns >= ANTI_HOARD_DECAY_AFTER_TURNS;
  const previousTeamResources: TeamResourceState = {
    ae: shouldDecay ? Math.max(0, previousResources.ae - ANTI_HOARD_AE_DECAY) : previousResources.ae,
    noSkillTurns: shouldDecay ? 0 : noSkillTurns,
  };

  const nextPhase: TeamId = state.activeTeam === 'player' ? 'enemy' : 'player';
  const nextTurnCountPlayer = nextPhase === 'player' ? state.turnCountPlayer + 1 : state.turnCountPlayer;
  return {
    ...state,
    phase: nextPhase,
    activeTeam: nextPhase,
    activeIndexInLineup: 0,
    turnCountPlayer: nextTurnCountPlayer,
    actionUsed: false,
    movedTiles: 0,
    resources: {
      ...state.resources,
      [previousTeam]: previousTeamResources,
    },
    roundSkillUsed: {
      ...state.roundSkillUsed,
      [previousTeam]: false,
    },
  };
}
