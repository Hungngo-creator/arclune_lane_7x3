import { describe, expect, test } from '@jest/globals';
import {
  advanceTurn,
  canUseCommand,
  createInitialMatchState,
  markActionUsed,
  recordMove,
} from '../src/screens/chess-strategy-rpg/turn-state.ts';

describe('chess strategy rpg turn state', () => {
  test('starts at player phase slot 1 and tracks move/action state', () => {
    let state = createInitialMatchState(4);
    expect(state.phase).toBe('player');
    expect(state.activeTeam).toBe('player');
    expect(state.activeIndexInLineup).toBe(0);
    expect(state.turnCountPlayer).toBe(1);

    state = recordMove(state, 3);
    expect(state.movedTiles).toBe(3);
    expect(canUseCommand(state, 'basicAttack')).toBe(true);

    state = markActionUsed(state);
    expect(state.actionUsed).toBe(true);
    expect(canUseCommand(state, 'castSkill')).toBe(false);
    expect(canUseCommand(state, 'endTurn')).toBe(true);
  });

  test('loops player phase to ai phase and back, one unit per slot', () => {
    let state = createInitialMatchState(2);

    state = advanceTurn(state);
    expect(state.activeTeam).toBe('player');
    expect(state.activeIndexInLineup).toBe(1);
    expect(state.turnCountPlayer).toBe(1);

    state = advanceTurn(state);
    expect(state.activeTeam).toBe('enemy');
    expect(state.phase).toBe('enemy');
    expect(state.activeIndexInLineup).toBe(0);
    expect(state.turnCountPlayer).toBe(1);

    state = advanceTurn(state);
    expect(state.activeTeam).toBe('enemy');
    expect(state.activeIndexInLineup).toBe(1);

    state = advanceTurn(state);
    expect(state.activeTeam).toBe('player');
    expect(state.phase).toBe('player');
    expect(state.activeIndexInLineup).toBe(0);
    expect(state.turnCountPlayer).toBe(2);
  });
});
