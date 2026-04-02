import { describe, expect, test } from '@jest/globals';
import {
  advanceTurn,
  ANTI_HOARD_AE_DECAY,
  applyActionCommand,
  applySkipAction,
  canUseCommand,
  chooseFallbackAction,
  consumeDecisionTime,
  createInitialMatchState,
  evaluateMatchResult,
  evaluateObjectiveResult,
  PLAYER_TURN_CAP,
  recordMove,
  resolveAction,
  resolveRescueBarrier,
  SHRINK_START_PLAYER_TURN,
  UNIT_TURN_BASE_TIME_MS,
} from '../src/screens/chess-strategy-rpg/turn-state.ts';

describe('chess strategy rpg turn state', () => {
  test('starts at player phase slot 1 and tracks move/action state', () => {
    let state = createInitialMatchState(4);
    expect(state.phase).toBe('player');
    expect(state.activeTeam).toBe('player');
    expect(state.activeIndexInLineup).toBe(0);
    expect(state.turnCountPlayer).toBe(1);
    expect(canUseCommand(state, 'endTurn')).toBe(false);

    state = recordMove(state, 4);
    expect(state.turn.hasMoved).toBe(true);
    expect(state.resources.player.ae).toBe(3);
    expect(canUseCommand(state, 'basicAttack')).toBe(true);

    state = applyActionCommand(state, 'basicAttack');
    expect(state.turn.hasActed).toBe(true);
    expect(state.resources.player.ae).toBe(5);
    expect(canUseCommand(state, 'castSkill')).toBe(false);
    expect(canUseCommand(state, 'move')).toBe(false);
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

  test('supports skip action and locks non-endturn input after action', () => {
    let state = createInitialMatchState(1);
    state = applySkipAction(state);
    expect(state.turn.hasActed).toBe(true);
    expect(state.inputLocked).toBe(true);
    expect(canUseCommand(state, 'move')).toBe(false);
    expect(canUseCommand(state, 'endTurn')).toBe(true);
  });

  test('marks ult as acted when manual gate and rage cost are met', () => {
    let state = createInitialMatchState(1);
    state = applyActionCommand(state, 'castUlt', {
      manualUlt: true,
      rage: 100,
      ultCost: 100,
    });
    expect(state.turn.hasActed).toBe(true);
    expect(state.inputLocked).toBe(true);
    expect(canUseCommand(state, 'endTurn')).toBe(true);
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
    expect(capState.result.status).toBe('draw');
    expect(capState.result.reason).toBe('turn-cap-draw');
  });

  test('applies turn-cap tie-break by alive units then hp percentage', () => {
    let byAlive = createInitialMatchState(1);
    byAlive.turnCountPlayer = PLAYER_TURN_CAP + 1;
    byAlive = evaluateMatchResult(byAlive, { player: 2, enemy: 1 });
    expect(byAlive.result.status).toBe('win');
    expect(byAlive.result.reason).toBe('turn-cap-tiebreak:alive-units');

    let byHpPct = createInitialMatchState(1);
    byHpPct.turnCountPlayer = PLAYER_TURN_CAP + 1;
    byHpPct = evaluateMatchResult(byHpPct, { player: 1, enemy: 1 }, { player: 1.2, enemy: 0.6 });
    expect(byHpPct.result.status).toBe('win');
    expect(byHpPct.result.reason).toBe('turn-cap-tiebreak:hp-pct');
  });

  test('resolves simultaneous wipe as draw', () => {
    let state = createInitialMatchState(1);
    state = evaluateMatchResult(state, { player: 0, enemy: 0 });
    expect(state.result.status).toBe('draw');
    expect(state.result.reason).toBe('simultaneous-elimination');
  });

  test('action resolver follows common pipeline', () => {
    const result = resolveAction({
      actorTeam: 'player',
      action: 'castSkill',
      inRange: true,
      validTarget: true,
      skillCost: 4,
      aeBefore: 6,
      damage: 11,
      targetHp: 10,
    });
    expect(result.ok).toBe(true);
    expect(result.nextAe).toBe(2);
    expect(result.isTargetDead).toBe(true);
    expect(result.log).toContain('resource:update');
    expect(result.log).toContain('apply:no-buff');
  });

  test('action resolver validates ult manual/rage gate and buff application', () => {
    const invalidUlt = resolveAction({
      actorTeam: 'player',
      action: 'castUlt',
      inRange: true,
      validTarget: true,
      aeBefore: 3,
      actorRage: 90,
      ultCost: 100,
      requireManualUlt: true,
      targetHp: 30,
    });
    expect(invalidUlt.ok).toBe(false);
    expect(invalidUlt.log).toContain('insufficient-rage');

    const buffedSkill = resolveAction({
      actorTeam: 'player',
      action: 'castSkill',
      inRange: true,
      validTarget: true,
      aeBefore: 8,
      skillCost: 4,
      buffIds: ['haste'],
      targetHp: 20,
    });
    expect(buffedSkill.ok).toBe(true);
    expect(buffedSkill.log).toContain('apply:buff');
    expect(buffedSkill.buffsApplied).toEqual(['haste']);

    const ultOk = resolveAction({
      actorTeam: 'player',
      action: 'castUlt',
      inRange: true,
      validTarget: true,
      aeBefore: 2,
      actorRage: 100,
      ultCost: 100,
      requireManualUlt: true,
      targetHp: 30,
    });
    expect(ultOk.ok).toBe(true);
    expect(ultOk.nextRage).toBe(0);
  });

  test('objective framework hooks rescue and boss', () => {
    const rescueState = createInitialMatchState(1, 'rescue');
    const rescueLose = evaluateObjectiveResult(rescueState, {
      hook: 'onTurnEnd',
      context: {
        aliveByTeam: { player: 1, enemy: 1 },
        objectiveState: { rescueTargetAlive: false },
      },
    });
    expect(rescueLose.result.status).toBe('lose');

    const bossState = createInitialMatchState(1, 'boss');
    const bossWin = evaluateObjectiveResult(bossState, {
      hook: 'onAction',
      context: {
        aliveByTeam: { player: 1, enemy: 1 },
        objectiveState: { bossAlive: false },
      },
    });
    expect(bossWin.result.status).toBe('win');
  });

  test('timer and bank fallback', () => {
    let state = createInitialMatchState(1);
    state.resources.player.bankTimeMs = 500;
    const useBudget = consumeDecisionTime(state, UNIT_TURN_BASE_TIME_MS + 300);
    expect(useBudget.timeout).toBe(false);
    expect(useBudget.state.resources.player.bankTimeMs).toBe(200);

    const timeout = consumeDecisionTime(useBudget.state, 10_000);
    expect(timeout.timeout).toBe(true);
    expect(chooseFallbackAction(timeout.state).type).toBe('basicAttack');
    expect(chooseFallbackAction(timeout.state, { hasSafeBasicTarget: false, lethalRisk: 1 }).type).toBe('skipAction');
  });

  test('shrink starts from player turn 4 and increments per side end turn', () => {
    let state = createInitialMatchState(1);
    state.turnCountPlayer = SHRINK_START_PLAYER_TURN;
    const s1 = advanceTurn(state);
    expect(s1.collapseRings).toBe(1);
    const s2 = advanceTurn(s1);
    expect(s2.collapseRings).toBe(2);
  });

  test('rescue barrier absorbs first lethal hit only', () => {
    const blocked = resolveRescueBarrier({
      enabled: true,
      charges: 1,
      targetHp: 30,
      incomingDamage: 40,
    });
    expect(blocked.triggered).toBe(true);
    expect(blocked.damageAfterBarrier).toBe(0);
    expect(blocked.remainingCharges).toBe(0);

    const noCharge = resolveRescueBarrier({
      enabled: true,
      charges: blocked.remainingCharges,
      targetHp: 30,
      incomingDamage: 40,
    });
    expect(noCharge.triggered).toBe(false);
    expect(noCharge.damageAfterBarrier).toBe(40);
  });
});
