export type TeamId = 'player' | 'enemy';

export type MatchCommandType = 'move' | 'basicAttack' | 'castSkill' | 'castUlt' | 'endTurn';

export interface MatchState {
  phase: TeamId;
  activeTeam: TeamId;
  activeIndexInLineup: number;
  turnCountPlayer: number;
  actionUsed: boolean;
  movedTiles: number;
  readonly lineupSize: number;
}

export function createInitialMatchState(lineupSize: number): MatchState {
  return {
    phase: 'player',
    activeTeam: 'player',
    activeIndexInLineup: 0,
    turnCountPlayer: 1,
    actionUsed: false,
    movedTiles: 0,
    lineupSize: Math.max(1, Math.floor(lineupSize)),
  };
}

export function canUseCommand(state: MatchState, command: MatchCommandType): boolean {
  if (command === 'endTurn') return true;
  if (command === 'move') return true;
  return !state.actionUsed;
}

export function recordMove(state: MatchState, tileSteps: number): MatchState {
  return {
    ...state,
    movedTiles: state.movedTiles + Math.max(0, Math.floor(tileSteps)),
  };
}

export function markActionUsed(state: MatchState): MatchState {
  return {
    ...state,
    actionUsed: true,
  };
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
  };
}
