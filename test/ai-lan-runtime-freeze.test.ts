import { ROSTER } from '../src/catalog';
import { applyOnSpawnEffects, emitPassiveEvent, prepareUnitForPassives } from '../src/passives';
import { createSession } from '../src/modes/pve/session-state';
import { performDualStanceUltimate } from '../src/modes/pve/session-runtime-impl';
import { createNaturalAction, withActionExecution } from '../src/combat/kernel';
import { slotToCell } from '../src/engine';

const definition = ROSTER.find(unit => unit.id === 'ai_lan')!;
function setup() {
  const game: any = createSession({ turnMode: 'interleaved_by_position', rngSeed: 19 });
  const make = (id: string, side: 'ally'|'enemy', slot: number) => ({ id, iid: `${id}:${side}:${slot}`, trueSelfId: id, entityKind: 'collection-unit', incarnationSerial: 1, lifeSerial: 1, lifeState: 'alive', alive: true, side, ...slotToCell(side, slot), hp: 500, hpMax: 1000, atk: 100, wil: 100, arm: 0, res: 0, fury: 100, furyMax: 100, statuses: [] });
  const actor: any = make('ai_lan', 'ally', 1);
  game.tokens = [actor, make('a2','ally',2), make('a3','ally',3), make('a4','ally',4), make('e1','enemy',1), make('e2','enemy',2), make('e3','enemy',3), make('e4','enemy',4), make('e5','enemy',5)];
  game.meta = new Map([[actor.id, definition]]);
  prepareUnitForPassives(actor);
  applyOnSpawnEffects(game, actor, definition.kit.onSpawn);
  return { game, actor };
}

test('real onSpawn stance is unique and turn-start alternates once per natural turn', () => {
  const { game, actor } = setup();
  expect(actor.stance).toBe('light');
  applyOnSpawnEffects(game, actor, definition.kit.onSpawn);
  expect(actor.statuses).toHaveLength(0);
  emitPassiveEvent(game, actor, 'turnStart');
  expect(actor.stance).toBe('dark');
  emitPassiveEvent(game, actor, 'turnStart');
  expect(actor.stance).toBe('dark');
  actor._furyState = { turnStamp: 'ally:1:1' };
  emitPassiveEvent(game, actor, 'turnStart');
  expect(actor.stance).toBe('light');
});

test.each(['light', 'dark'] as const)('dual-stance %s payload uses one canonical root action', stance => {
  const { game, actor } = setup(); actor.stance = stance;
  const before = game.tokens.map((unit: any) => unit.hp);
  const eventsBefore = game.runtime.combatEvents?.length ?? 0;
  withActionExecution(game, createNaturalAction(game, 'ult'), () => performDualStanceUltimate(game, actor, definition.kit.ult as Record<string, unknown>));
  const events = game.runtime.combatEvents.slice(eventsBefore);
  expect(events.filter((event: any) => event.type === 'ACTION_START')).toHaveLength(1);
  expect(events.filter((event: any) => event.type === 'ACTION_END')).toHaveLength(1);
  expect(game.runtime.actionExecutionStack).toEqual([]);
  if (stance === 'light') expect(game.tokens.filter((unit: any, index: number) => unit.side === 'ally' && unit.hp > before[index])).toHaveLength(3);
  else expect(game.tokens.filter((unit: any, index: number) => unit.side === 'enemy' && unit.hp < before[index])).toHaveLength(4);
  expect(game.runtime.actionFault).toBeUndefined();
});

test.each([0, 99, 100])('real Fury %i is preserved by spawn/stance initialization', fury => {
  const { game, actor } = setup(); actor.fury = fury;
  applyOnSpawnEffects(game, actor, definition.kit.onSpawn);
  expect(actor.fury).toBe(fury);
});
