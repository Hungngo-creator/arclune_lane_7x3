import { ROSTER } from '../src/catalog';
import { doActionOrSkip } from '../src/turns';
import { doBasicWithFollowups } from '../src/combat';
import { prepareUnitForPassives, emitPassiveEvent } from '../src/passives';
import { currentActionExecution } from '../src/combat/kernel';
import { createSession } from '../src/modes/pve/session-state';
import { slotToCell } from '../src/engine';

const definition = ROSTER.find(unit => unit.id === 'loithienanh')!;

function battle() {
  const game: any = createSession({ turnMode: 'interleaved_by_position', rngSeed: 7 });
  const make = (id: string, side: 'ally' | 'enemy', slot: number) => ({
    id, iid: `${id}:${slot}`, trueSelfId: id, entityKind: 'collection-unit', incarnationSerial: 1,
    lifeSerial: 1, lifeState: 'alive', alive: true, side, ...slotToCell(side, slot),
    hp: 10_000, hpMax: 10_000, atk: 100, wil: 100, arm: 0.1, res: 0.1,
    spd: 1, fury: 0, furyMax: 120, statuses: [],
  });
  const actor: any = make(definition.id, 'ally', 1);
  const enemy: any = make('mong_yem', 'enemy', 1);
  game.tokens = [actor, enemy];
  game.meta = new Map([[definition.id, definition], [enemy.id, ROSTER.find(unit => unit.id === enemy.id)]]);
  prepareUnitForPassives(actor);
  return { game, actor, enemy };
}

test('real Lôi Thiên Ảnh passive is an exclusive finite stance and does not grow stacks', () => {
  const { game, actor } = battle();
  for (let turn = 0; turn < 5; turn += 1) emitPassiveEvent(game, actor, 'onTurnStart', {});
  expect(actor.statuses.filter((status: any) => status.id.startsWith('swap_res_wil_')).map((status: any) => [status.id, status.stacks]))
    .toEqual([['swap_res_wil_res', 1], ['swap_res_wil_arm', 1]]);
  actor.hp = actor.hpMax / 2;
  emitPassiveEvent(game, actor, 'onTurnStart', {});
  expect(actor.statuses.some((status: any) => status.id === 'swap_res_wil_res')).toBe(false);
  expect(actor.statuses.some((status: any) => status.id === 'swap_res_wil_arm')).toBe(false);
  expect(actor.statuses.filter((status: any) => status.id.startsWith('swap_res_wil_')).map((status: any) => [status.id, status.stacks]))
    .toEqual([['swap_res_wil_atk', 1], ['swap_res_wil_wil', 1]]);
  expect(['hp', 'hpMax', 'atk', 'wil', 'arm', 'res'].every(key => Number.isFinite(actor[key]))).toBe(true);
});

test('real catalog basic commits two packets in one root action', () => {
  const { game, actor } = battle();
  const result = doBasicWithFollowups(game, actor, 0);
  expect(definition.kit.basic?.hits).toBe(2);
  expect(result).toMatchObject({ ok: true, attemptedHits: 2, committedHits: 2 });
  const damageEvents = game.runtime.combatEvents.filter((event: any) => event.type === 'DAMAGE_BATCH_RESOLVED');
  expect(damageEvents).toHaveLength(2);
  expect(new Set(damageEvents.map((event: any) => event.actionId))).toEqual(new Set([result.rootActionId]));
  expect(new Set(damageEvents.flatMap((event: any) => event.packets.map((packet: any) => packet.packetId))).size).toBe(2);
  expect(game.runtime.actionExecutionStack).toEqual([]);
});

test.each([[100, false], [109, false], [110, true], [120, true]])('Fury %i starts Ultimate only at the real 110 threshold', (fury, expectedUlt) => {
  const { game, actor } = battle();
  actor.fury = fury;
  let calls = 0;
  const result = doActionOrSkip(game, actor, { performUlt(unit) {
    calls += 1;
    expect(unit).toBe(actor);
    expect(currentActionExecution(game)).toBeNull();
  }});
  expect(calls === 1).toBe(expectedUlt);
  expect(result.acted).toBe(true);
  if (expectedUlt) expect(actor.fury).toBe(Math.min(120, fury + 3) - 110);
  else expect(Number.isFinite(actor.fury)).toBe(true);
  expect(game.runtime.actionFault).toBeUndefined();
  expect(game.runtime.actionExecutionStack).toEqual([]);
});
