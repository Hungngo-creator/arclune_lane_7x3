const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const bundlePath = path.join(__dirname, '..', 'dist', 'app.js');

function loadBuiltRuntime() {
  const source = fs.readFileSync(bundlePath, 'utf8');
  const bootstrapIndex = source.lastIndexOf('try {');
  if (bootstrapIndex < 0) throw new Error('built bootstrap boundary not found');
  const context = {
    console,
    process: { env: { NODE_ENV: 'development' } },
    setTimeout,
    clearTimeout,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Array,
    Object,
    Number,
    String,
    Boolean,
    Math,
    Date,
    RegExp,
    JSON,
  };
  context.globalThis = context;
  vm.createContext(context);
  new vm.Script(source.slice(0, bootstrapIndex), { filename: 'dist/app.js' }).runInContext(context);
  return context;
}

function createBattle(runtime, hp = 1000) {
  const { createSession } = runtime.__require('./modes/pve/session-state.ts');
  const { slotToCell } = runtime.__require('./engine.ts');
  const game = createSession({ turnMode: 'interleaved_by_position', rngSeed: 1 });
  const unit = (id, side, slot) => ({
    id, iid: `${id}:iid`, trueSelfId: id, entityKind: 'collection-unit', incarnationSerial: 1,
    lifeSerial: 1, lifeState: 'alive', alive: true, side, ...slotToCell(side, slot), hp, hpMax: hp,
    atk: 100, wil: 20, arm: 0.1, res: 0.1, ae: 0, aeMax: 0, fury: 0, statuses: [],
  });
  const ally = unit('built_ally', 'ally', 1);
  const enemy = unit('built_enemy', 'enemy', 1);
  game.tokens = [ally, enemy];
  game.meta = new Map([[ally.id, { followupCap: 3 }], [enemy.id, { followupCap: 3 }]]);
  game.queued = { ally: new Map(), enemy: new Map() };
  game.battle = { over: false, winner: null };
  return { game, ally, enemy };
}

test('generated loader boots Turn Base modules and runs six real alternating actions', () => {
  const runtime = loadBuiltRuntime();
  const turns = runtime.__require('./turns.ts');
  const statusesModule = runtime.__require('./statuses.ts');
  const queryModule = runtime.__require('./combat/status-query.ts');
  const { game, ally, enemy } = createBattle(runtime);
  const hooks = { doActionOrSkip: turns.doActionOrSkip, processActionChain: () => null, checkBattleEnd: () => false };

  expect(typeof statusesModule.Statuses.resolveTarget).toBe('function');
  expect(typeof queryModule.resolveTarget).toBe('function');
  expect(runtime.__require('./statuses.js')).toBe(statusesModule);
  expect(runtime.__require('@statuses')).toBe(statusesModule);
  expect(Object.keys(runtime.__moduleCache).filter(id => id === './statuses.ts')).toHaveLength(1);

  const hp = [[ally.hp, enemy.hp]];
  for (let index = 0; index < 6; index += 1) {
    turns.stepTurn(game, hooks);
    hp.push([ally.hp, enemy.hp]);
    expect(game.runtime.actionExecutionStack).toEqual([]);
    expect(game.runtime.actionFault).toBeUndefined();
  }
  expect(hp[1]).toEqual([1000, 881]);
  expect(hp[2]).toEqual([881, 881]);
  const events = game.runtime.combatEvents;
  expect(events.filter(event => event.type === 'DAMAGE_BATCH_RESOLVED')).toHaveLength(6);
  expect(events.filter(event => event.type === 'ACTION_END')).toHaveLength(6);
  const actionIds = events.filter(event => event.type === 'ACTION_START').map(event => event.actionId);
  expect(new Set(actionIds).size).toBe(6);
});

test('built status query preserves taunt, dead exclusion, fallback and typed no-target behavior', () => {
  const runtime = loadBuiltRuntime();
  const turns = runtime.__require('./turns.ts');
  const { resolveTarget } = runtime.__require('./combat/status-query.ts');
  const { game, ally, enemy } = createBattle(runtime);
  const second = { ...enemy, id: 'second', iid: 'second:iid', cx: enemy.cx + 2, statuses: [{ id: 'taunt', kind: 'debuff' }] };
  game.tokens.push(second);
  expect(resolveTarget(ally, [enemy, second], { attackType: 'basic' })).toBe(second);
  second.alive = false;
  second.lifeState = 'dead';
  expect(turns.doActionOrSkip(game, ally)).toMatchObject({ acted: true });
  game.tokens = [ally];
  expect(turns.doActionOrSkip(game, ally)).toMatchObject({ acted: false, reason: 'noTarget' });
});

test('generated loader caches cycle records before factory execution', () => {
  const runtime = loadBuiltRuntime();
  runtime.__modules['./cycle-a.ts'] = (exports, module, requireModule) => {
    exports.name = 'a';
    exports.peer = requireModule('./cycle-b.ts');
  };
  runtime.__modules['./cycle-b.ts'] = (exports, module, requireModule) => {
    exports.name = 'b';
    exports.peer = requireModule('./cycle-a.ts');
  };
  const a = runtime.__require('./cycle-a.ts');
  expect(a.peer.peer).toBe(a);
  expect(a.peer.name).toBe('b');
});

test('built combat resolves HP zero, death confirmation and battle end', () => {
  const runtime = loadBuiltRuntime();
  runtime.__require('./turns.ts');
  const combat = runtime.__require('./combat.ts');
  const { game, ally, enemy } = createBattle(runtime, 100);
  ally.isLeader = true;
  enemy.isLeader = true;
  const result = combat.doBasicWithFollowups(game, ally, 0);
  expect(result).toMatchObject({ ok: true, committedHits: 1 });
  expect(enemy.hp).toBe(0);
  expect(enemy.lifeState).toBe('dead-confirmed');
  const eventTypes = game.runtime.combatEvents.map(event => event.type);
  expect(eventTypes).toEqual(expect.arrayContaining(['HP_ZERO', 'DEATH_CONFIRMED', 'ACTION_END']));
  expect(game.runtime.actionExecutionStack).toEqual([]);
  expect(game.runtime.battleEnd).toMatchObject({ ended: true, winner: 'ally' });
});
