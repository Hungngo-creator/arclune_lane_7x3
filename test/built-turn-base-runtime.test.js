const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const bundlePath = path.join(__dirname, '..', 'dist', 'app.js');

function createBrowserDocument() {
  const element = () => ({
    style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    appendChild() {}, removeChild() {}, replaceChildren() {}, addEventListener() {}, removeEventListener() {},
    setAttribute() {}, removeAttribute() {}, querySelector() { return null; }, querySelectorAll() { return []; },
    innerHTML: '', textContent: '',
  });
  const root = element();
  return {
    body: root,
    head: element(),
    documentElement: element(),
    readyState: 'complete',
    createElement: element,
    createTextNode: (text) => ({ textContent: text }),
    getElementById: () => root,
    querySelector: () => root,
    querySelectorAll: () => [],
    addEventListener() {},
    removeEventListener() {},
  };
}

function loadBuiltRuntime(bundleSource) {
  const source = bundleSource ?? fs.readFileSync(bundlePath, 'utf8');
  const context = {
    console,
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
  document: createBrowserDocument(),
    location: { protocol: 'https:', href: 'https://arclune.test/', search: '', hash: '' },
    navigator: { userAgent: 'browser-vm' },
    Event: class Event { constructor(type) { this.type = type; } },
    CustomEvent: class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } },
    EventTarget: class EventTarget { addEventListener() {} removeEventListener() {} dispatchEvent() { return true; } },
    Element: Object,
    HTMLElement: Object,
    HTMLStyleElement: Object,
    HTMLInputElement: Object,
    HTMLButtonElement: Object,
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  };
  expect('process' in context).toBe(false);
  expect('Buffer' in context).toBe(false);
  context.globalThis = context;
  context.window = context;
  context.self = context;
  context.addEventListener = () => {};
  context.removeEventListener = () => {};
  context.dispatchEvent = () => true;
  context.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  context.cancelAnimationFrame = clearTimeout;
  vm.createContext(context);
  new vm.Script(source, { filename: 'dist/app.js' }).runInContext(context);
  return context;
}

function buildFallback(mode) {
  const result = spawnSync(process.execPath, ['build.mjs', `--mode=${mode}`], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    env: { ...process.env, ARCLUNE_FORCE_ESBUILD_FALLBACK: '1' },
  });
  expect(result.status).toBe(0);
  const source = fs.readFileSync(bundlePath, 'utf8');
  expect(source).not.toMatch(/process\.env\.NODE_ENV/);
  return source;
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
  const ally = unit('thien_luu', 'ally', 1);
  const enemy = unit('thien_luu', 'enemy', 1);
  game.tokens = [ally, enemy];
  game.meta = new Map([[ally.id, { followupCap: 3 }], [enemy.id, { followupCap: 3 }]]);
  game.queued = { ally: new Map(), enemy: new Map() };
  game.battle = { over: false, winner: null };
  return { game, ally, enemy };
}

function expectTurnAndLifecycleSmoke(runtime) {
  const turns = runtime.__require('./turns.ts');
  const { game, ally, enemy } = createBattle(runtime);
  const hooks = { doActionOrSkip: turns.doActionOrSkip, processActionChain: () => null, checkBattleEnd: () => false };
  for (let index = 0; index < 6; index += 1) {
    turns.stepTurn(game, hooks);
    expect(game.runtime.actionExecutionStack).toEqual([]);
    expect(game.runtime.actionFault).toBeUndefined();
  }
  expect(ally.hp).toBeLessThan(1000);
  expect(enemy.hp).toBeLessThan(1000);
  const events = game.runtime.combatEvents;
  expect(events.filter(event => event.type === 'ACTION_END')).toHaveLength(6);
  expect(new Set(events.filter(event => event.type === 'ACTION_START').map(event => event.actionId)).size).toBe(6);

  const combat = runtime.__require('./combat.ts');
  const lethal = createBattle(runtime, 100);
  lethal.ally.isLeader = true;
  lethal.enemy.isLeader = true;
  expect(combat.doBasicWithFollowups(lethal.game, lethal.ally, 0)).toMatchObject({ ok: true, committedHits: 1 });
  const lethalEvents = lethal.game.runtime.combatEvents.map(event => event.type);
  expect(lethalEvents).toEqual(expect.arrayContaining(['HP_ZERO', 'DEATH_CONFIRMED', 'ACTION_END']));
  expect(lethal.game.runtime.actionExecutionStack).toEqual([]);
  expect(lethal.game.runtime.battleEnd).toMatchObject({ ended: true, winner: 'ally' });
}

test.each(['development', 'production'])('forced fallback %s bundle boots and matches Turn Base runtime', (mode) => {
  const runtime = loadBuiltRuntime(buildFallback(mode));
  expectTurnAndLifecycleSmoke(runtime);
});

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
  expect(Object.keys(runtime.__moduleCache).filter(id => id === './statuses.ts')).toHaveLength(1);

  const hp = [[ally.hp, enemy.hp]];
  for (let index = 0; index < 6; index += 1) {
    turns.stepTurn(game, hooks);
    hp.push([ally.hp, enemy.hp]);
    expect(game.runtime.actionExecutionStack).toEqual([]);
    expect(game.runtime.actionFault).toBeUndefined();
  }
  expect(hp[1][0]).toBe(1000);
  expect(hp[1][1]).toBeLessThan(1000);
  expect(hp[2][0]).toBeLessThan(1000);
  const events = game.runtime.combatEvents;
  expect(events.filter(event => event.type === 'DAMAGE_BATCH_RESOLVED')).toHaveLength(6);
  expect(events.filter(event => event.type === 'ACTION_END')).toHaveLength(6);
  const actionIds = events.filter(event => event.type === 'ACTION_START').map(event => event.actionId);
  expect(new Set(actionIds).size).toBe(6);
});

test('generated production bundle runs the real Lôi Thiên Ảnh catalog unit for twenty natural actions', () => {
  const runtime = loadBuiltRuntime();
  const turns = runtime.__require('./turns.ts');
  const { ROSTER } = runtime.__require('./catalog.ts');
  const { prepareUnitForPassives } = runtime.__require('./passives.ts');
  const { createSession } = runtime.__require('./modes/pve/session-state.ts');
  const { slotToCell } = runtime.__require('./engine.ts');
  const game = createSession({ turnMode: 'interleaved_by_position', rngSeed: 17 });
  const definition = ROSTER.find(unit => unit.id === 'loithienanh');
  const ordinaryDefinition = ROSTER.find(unit => unit.id === 'mong_yem');
  expect(definition.kit.basic.hits).toBe(2);
  const make = (definition, side, slot) => ({
    id: definition.id, iid: `${definition.id}:${side}:${slot}`, trueSelfId: definition.id,
    entityKind: 'collection-unit', incarnationSerial: 1, lifeSerial: 1, lifeState: 'alive', alive: true,
    side, ...slotToCell(side, slot), hp: 100000, hpMax: 100000, atk: 100, wil: 100,
    arm: 0.1, res: 0.1, spd: 1, fury: 0, furyMax: definition.id === 'loithienanh' ? 120 : 100, statuses: [],
  });
  const ordinary = make(ordinaryDefinition, 'ally', 1);
  const loithienanh = make(definition, 'ally', 2);
  const enemyA = make(ordinaryDefinition, 'enemy', 1);
  const enemyB = make(ordinaryDefinition, 'enemy', 2);
  game.tokens = [ordinary, enemyA];
  game.meta = new Map([[ordinary.id, ordinaryDefinition], [loithienanh.id, definition]]);
  prepareUnitForPassives(ordinary);
  prepareUnitForPassives(enemyA);
  // This is the reported ordering: an ordinary roster unit acts twice before
  // the actual second roster unit enters the live turn order.
  const hooks = { doActionOrSkip: turns.doActionOrSkip, performUlt() {}, processActionChain: () => null, checkBattleEnd: () => false };
  turns.stepTurn(game, hooks);
  turns.stepTurn(game, hooks);
  game.tokens.push(loithienanh, enemyB);
  prepareUnitForPassives(loithienanh);
  prepareUnitForPassives(enemyB);
  for (let index = 0; index < 20; index += 1) {
    turns.stepTurn(game, hooks);
    expect(game.runtime.actionFault).toBeUndefined();
    expect(game.runtime.actionExecutionStack).toEqual([]);
    expect(Number.isFinite(game.turn.busyUntil)).toBe(true);
  }
  const packetEvents = game.runtime.combatEvents.filter(event => event.type === 'DAMAGE_BATCH_RESOLVED');
  expect(packetEvents).toHaveLength(10);
  expect(loithienanh.statuses.some(status => status.id === 'swap_res_wil_arm')).toBe(true);
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
