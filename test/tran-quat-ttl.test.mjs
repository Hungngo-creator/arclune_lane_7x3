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
