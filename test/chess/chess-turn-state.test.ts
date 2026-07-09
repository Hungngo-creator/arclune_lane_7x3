import {
  applyActionCommand,
  canUseCommand,
  chooseFallbackAction,
  consumeDecisionTime,
  createInitialMatchState,
  resolveAction,
} from '../src/screens/chess-strategy-rpg/turn-state';

describe('chess turn-state tactical loop', () => {
  test('locks input after action and only allows endTurn', () => {
    let state = createInitialMatchState(4, 'elimination');
    expect(canUseCommand(state, 'move')).toBe(true);
    state = applyActionCommand(state, 'basicAttack');
    expect(state.turn.hasActed).toBe(true);
    expect(state.inputLocked).toBe(true);
    expect(canUseCommand(state, 'move')).toBe(false);
    expect(canUseCommand(state, 'basicAttack')).toBe(false);
    expect(canUseCommand(state, 'endTurn')).toBe(true);
  });

  test('ult resolver validates and updates rage/resource stage', () => {
    const fail = resolveAction({
      actorTeam: 'player',
      action: 'castUlt',
      inRange: true,
      validTarget: true,
      aeBefore: 3,
      actorRage: 40,
      requireManualUlt: true,
      ultCost: 100,
      targetHp: 40,
      damage: 30,
    });
    expect(fail.ok).toBe(false);
    expect(fail.log).toEqual(['insufficient-rage']);

    const ok = resolveAction({
      actorTeam: 'player',
      action: 'castUlt',
      inRange: true,
      validTarget: true,
      aeBefore: 3,
      actorRage: 100,
      requireManualUlt: true,
      ultCost: 100,
      targetHp: 40,
      damage: 30,
    });
    expect(ok.ok).toBe(true);
    expect(ok.nextRage).toBe(0);
    expect(ok.targetHp).toBe(10);
  });

  test('timer consumes team bank and timeout triggers safe fallback', () => {
    let state = createInitialMatchState(4, 'elimination');
    state = {
      ...state,
      resources: {
        ...state.resources,
        player: { ...state.resources.player, bankTimeMs: 2_000 },
      },
    };

    const withinBudget = consumeDecisionTime(state, 8_500);
    expect(withinBudget.timeout).toBe(false);
    expect(withinBudget.state.unitTimer.remainingMs).toBe(0);
    expect(withinBudget.state.resources.player.bankTimeMs).toBe(1_500);

    const timedOut = consumeDecisionTime(withinBudget.state, 2_000);
    expect(timedOut.timeout).toBe(true);
    const fallback = chooseFallbackAction(timedOut.state, { hasSafeBasicTarget: false, lethalRisk: 1 });
    expect(fallback.type).toBe('skipAction');
  });
});
