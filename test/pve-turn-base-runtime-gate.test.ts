import { createSession } from '../src/modes/pve/session-state';
import { slotToCell } from '../src/engine';
import { doActionOrSkip, stepTurn } from '../src/turns';
import { doBasicWithFollowups } from '../src/combat';
import * as combat from '../src/combat';
import { Statuses } from '../src/statuses';
import type { UnitToken } from '../src/types/units';

function unit(id: string, side: 'ally' | 'enemy', slot: number): UnitToken {
  return { id, iid: `${id}:iid`, trueSelfId: id, entityKind: 'collection-unit', incarnationSerial: 1,
    lifeSerial: 1, lifeState: 'alive', alive: true, side, ...slotToCell(side, slot), hp: 1000, hpMax: 1000,
    atk: 100, wil: 20, arm: 0.1, res: 0.1, ae: 0, aeMax: 0, fury: 0, statuses: [] } as UnitToken;
}

function battle() {
  const game = createSession({ turnMode: 'interleaved_by_position', rngSeed: 1 });
  const ally = unit('runtime_ally', 'ally', 1);
  const enemy = unit('runtime_enemy', 'enemy', 1);
  game.tokens = [ally, enemy];
  game.meta = new Map([[ally.id, { followupCap: 3 }], [enemy.id, { followupCap: 3 }]]) as typeof game.meta;
  game.queued = { ally: new Map(), enemy: new Map() };
  game.battle = { over: false, winner: null };
  return { game, ally, enemy };
}

const hooks = { doActionOrSkip, processActionChain() { return null; }, checkBattleEnd() { return false; } } as any;

describe('production Turn Base runtime recovery gate', () => {
  test('real interleaved stepTurn alternates actors and commits canonical damage for six actions', () => {
    const { game, ally, enemy } = battle();
    const hp = [[ally.hp, enemy.hp]];
    for (let action = 0; action < 6; action += 1) {
      stepTurn(game, hooks);
      hp.push([ally.hp, enemy.hp]);
      expect((game.runtime as any).actionExecutionStack).toEqual([]);
    }
    expect(hp[1]).toEqual([1000, 881]);
    expect(hp[2]).toEqual([881, 881]);
    expect(ally.hp).toBeLessThan(1000);
    expect(enemy.hp).toBeLessThan(1000);
    const events = (game.runtime as any).combatEvents as Array<any>;
    expect(events.filter(event => event.type === 'DAMAGE_BATCH_RESOLVED')).toHaveLength(6);
    expect(events.filter(event => event.type === 'NATURAL_ACTION_COMPLETED')).toHaveLength(6);
    const starts = events.filter(event => event.type === 'ACTION_START');
    expect(starts.map(event => event.actionId)).toEqual(['action-1', 'action-2', 'action-3', 'action-4', 'action-5', 'action-6']);
    expect(starts.map(event => event.chainId)).toEqual(['chain-1', 'chain-2', 'chain-3', 'chain-4', 'chain-5', 'chain-6']);
    expect((game.turn as any).nextSide).toBe('ALLY');
    expect((game.turn as any).lastPos).toEqual({ ALLY: 1, ENEMY: 1 });
  });

  test('followupCap is a ceiling and does not manufacture linked attacks', () => {
    const { game, ally, enemy } = battle();
    const result = doBasicWithFollowups(game, ally, 9);
    expect(result).toMatchObject({ ok: true, attemptedHits: 1, committedHits: 1, totalHpDamage: 119, targetIids: [enemy.iid] });
    expect(enemy.hp).toBe(881);
    expect((game.runtime as any).actionExecutionStack).toEqual([]);
    expect((game.runtime as any).combatEvents.filter((event: any) => event.type === 'ACTION_START')).toHaveLength(1);
  });

  test('missing target is a typed failure and is never reported as acted', () => {
    const { game, ally } = battle();
    game.tokens = [ally];
    const resolution = doActionOrSkip(game, ally);
    expect(resolution).toMatchObject({ acted: false, consumedTurn: false, skipped: true, reason: 'noTarget' });
    expect((game.runtime as any).actionExecutionStack ?? []).toEqual([]);
    expect(((game.runtime as any).combatEvents ?? []).some((event: any) => event.type === 'NATURAL_ACTION_COMPLETED')).toBe(false);
  });

  test('lethal real turn-start status invalidates the selected life before any payload', () => {
    const { game, ally } = battle();
    ally.hp = 1;
    ally.fury = 100;
    const performUlt = jest.fn();
    const basic = jest.spyOn(combat, 'doBasicWithFollowups');
    jest.spyOn(Statuses, 'onTurnStart').mockImplementationOnce((actor) => {
      actor.hp = 0; actor.alive = false; actor.lifeState = 'hp-zero';
    });
    const resolution = doActionOrSkip(game, ally, { performUlt });
    expect(resolution).toMatchObject({ acted: false, consumedTurn: false, skipped: true, reason: 'missingUnit' });
    expect(ally.hp).toBe(0);
    expect(performUlt).not.toHaveBeenCalled();
    expect(basic).not.toHaveBeenCalled();
  });

  test('technical basic failure is visible, pauses runtime, and emits no successful completion', () => {
    const { game, ally } = battle();
    const fault = new Error('kernel boundary failed');
    jest.spyOn(combat, 'doBasicWithFollowups').mockImplementationOnce(() => { throw fault; });
    expect(() => doActionOrSkip(game, ally)).toThrow(fault);
    expect((game.runtime as any).actionFault).toBe(fault);
    expect((game.runtime as any).actionExecutionStack ?? []).toEqual([]);
    const events = ((game.runtime as any).combatEvents ?? []) as Array<any>;
    expect(events.some(event => event.type === 'NATURAL_ACTION_COMPLETED')).toBe(false);
    expect(events.some(event => event.type === 'ACTION_END')).toBe(false);
  });
});
