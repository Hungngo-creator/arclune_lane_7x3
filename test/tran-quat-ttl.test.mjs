// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { loadTurnsHarness, loadSummonHarness } from './helpers/turns-harness.mjs';

describe('Ulti Trần Quát - TTL creep', () => {
  it('chỉ giảm TTL sau khi phe sở hữu kết thúc lượt', async () => {
    const turnsHarness = await loadTurnsHarness();
    const { tickMinionTTL, deps } = turnsHarness;
    const summonHarness = await loadSummonHarness({
      './engine.js': deps['./engine.js'],
      './art.ts': deps['./art.ts'],
      './passives.ts': deps['./passives.ts'],
    });
    const { enqueueImmediate, processActionChain } = summonHarness;
    const slotToCell = deps['./engine.js'].slotToCell;

    const allyLeader = { id: 'leaderA', side: 'ally', alive: true, ...slotToCell('ally', 1) };
    const enemyLeader = { id: 'leaderB', side: 'enemy', alive: true, ...slotToCell('enemy', 1) };

    const Game = {
      tokens: [allyLeader, enemyLeader],
      meta: new Map(),
      queued: { ally: new Map(), enemy: new Map() },
      actionChain: [],
      turn: {
        order: [
          { side: 'ally', slot: 1 },
          { side: 'enemy', slot: 1 },
        ],
        cursor: 0,
        cycle: 0,
        orderIndex: new Map(),
      },
    };

    const initialTtl = 2;
    const enqueueOk = enqueueImmediate(Game, {
      side: 'ally',
      slot: 2,
      unit: {
        id: 'creepAlpha',
        name: 'Creep',
        isMinion: true,
        ttlTurns: initialTtl,
        hp: 5,
        hpMax: 5,
      },
    });
    expect(enqueueOk).toBe(true);
    expect(Game.actionChain).toHaveLength(1);

    processActionChain(Game, 'ally', 1, {
      allocIid: () => 101,
    });

    let creep = Game.tokens.find((t) => t.id === 'creepAlpha');
    expect(creep?.ttlTurns).toBe(initialTtl);

    tickMinionTTL(Game, 'enemy');
    creep = Game.tokens.find((t) => t.id === 'creepAlpha');
    expect(creep?.ttlTurns).toBe(initialTtl);

    tickMinionTTL(Game, 'ally');
    creep = Game.tokens.find((t) => t.id === 'creepAlpha');
    expect(creep?.ttlTurns).toBe(initialTtl - 1);

    tickMinionTTL(Game, 'ally');
    creep = Game.tokens.find((t) => t.id === 'creepAlpha');
    expect(creep).toBeUndefined();
  });
});

it('không trừ TTL creep của Trần Quát khi lượt ult bị bỏ qua vì lỗi đồng hồ', async () => {
  const turnsHarness = await loadTurnsHarness();
  const { stepTurn, doActionOrSkip: realDoActionOrSkip, deps } = turnsHarness;
  const slotToCell = deps['./engine.js'].slotToCell;

  const tranQuat = {
    id: 'tranquat',
    side: 'ally',
    alive: true,
    fury: 100,
    ...slotToCell('ally', 1)
  };
  const enemyLeader = {
    id: 'enemyLeader',
    side: 'enemy',
    alive: true,
    ...slotToCell('enemy', 1)
  };
  const creep = {
    id: 'creepFollower',
    side: 'ally',
    alive: true,
    isMinion: true,
    ttlTurns: 3,
    ...slotToCell('ally', 2)
  };

  const Game = {
    tokens: [tranQuat, enemyLeader, creep],
    meta: new Map([[tranQuat.id, {}]]),
    queued: { ally: new Map(), enemy: new Map() },
    turn: {
      order: [
        { side: 'ally', slot: 1 },
        { side: 'enemy', slot: 1 },
      ],
      cursor: 0,
      cycle: 0,
      orderIndex: new Map(),
    },
  };

  let glitch = true;
  let ultCasted = 0;
  const hooks = {
    performUlt(unit){
      if (unit?.id === tranQuat.id){
        ultCasted += 1;
      }
    },
    doActionOrSkip(game, unit, options = {}){
      if (unit?.id === tranQuat.id && glitch){
        glitch = false;
        return { consumedTurn: false, skipped: true, reason: 'systemError' };
      }
      return realDoActionOrSkip(game, unit, options);
    },
    processActionChain(){
      return null;
    },
  };

  const initialTtl = creep.ttlTurns;

  stepTurn(Game, hooks);
  expect(creep.ttlTurns).toBe(initialTtl);

  stepTurn(Game, hooks);
  expect(creep.ttlTurns).toBe(initialTtl);

  stepTurn(Game, hooks);
  expect(creep.ttlTurns).toBe(initialTtl - 1);
  expect(ultCasted).toBe(1);
});