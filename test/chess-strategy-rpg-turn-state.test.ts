import { describe, expect, test } from '@jest/globals';
import {
  advanceTurn,
  ANTI_HOARD_AE_DECAY,
  applyActionCommand,
  canUseCommand,
  createInitialMatchState,
  evaluateMatchResult,
  PLAYER_TURN_CAP,
  recordMove,
} from '../src/screens/chess-strategy-rpg/turn-state.ts';

describe('chess strategy rpg turn state', () => {
  test('starts at player phase slot 1 and tracks move/action state', () => {
    let state = createInitialMatchState(4);
    expect(state.phase).toBe('player');
    expect(state.activeTeam).toBe('player');
    expect(state.activeIndexInLineup).toBe(0);
    expect(state.turnCountPlayer).toBe(1);

    state = recordMove(state, 4);
    expect(state.movedTiles).toBe(4);
    expect(state.resources.player.ae).toBe(3);
    expect(canUseCommand(state, 'basicAttack')).toBe(true);

    state = applyActionCommand(state, 'basicAttack');
    expect(state.actionUsed).toBe(true);
    expect(state.resources.player.ae).toBe(5);
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

  test('locks skill by team AE and ult by manual rage gate', () => {
    const state = createInitialMatchState(2);

    expect(canUseCommand(state, 'castSkill', { skillCost: 4 })).toBe(false);
    expect(canUseCommand(state, 'castUlt', { manualUlt: false, rage: 100, ultCost: 100 })).toBe(false);
    expect(canUseCommand(state, 'castUlt', { manualUlt: true, rage: 99, ultCost: 100 })).toBe(false);
    expect(canUseCommand(state, 'castUlt', { manualUlt: true, rage: 100, ultCost: 100 })).toBe(true);
  });

  test('applies anti-hoard AE decay after two team turns without skill', () => {
    let state = createInitialMatchState(1);
    state.resources.player.ae = 10;

    state = applyActionCommand(state, 'basicAttack');
    state = advanceTurn(state);
    state = applyActionCommand(state, 'basicAttack');
    state = advanceTurn(state);
    state = applyActionCommand(state, 'basicAttack');
    state = advanceTurn(state);

    expect(state.resources.player.ae).toBe(10 + 2 + 2 - ANTI_HOARD_AE_DECAY);
    expect(state.resources.player.noSkillTurns).toBe(0);
  });

  test('resolves elimination objective and turn cap defeat', () => {
    let state = createInitialMatchState(1);
    state = evaluateMatchResult(state, { player: 1, enemy: 0 });
    expect(state.result.status).toBe('win');
    expect(state.result.reason).toBe('elimination');

    let capState = createInitialMatchState(1);
    capState.turnCountPlayer = PLAYER_TURN_CAP + 1;
    capState = evaluateMatchResult(capState, { player: 1, enemy: 1 });
    expect(capState.result.status).toBe('lose');
    expect(capState.result.reason).toBe('turn-cap');
  });
});
