// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { loadTurnsHarness } from './helpers/turns-harness.mjs';

describe('tickMinionTTL - thiếu mục tiêu', () => {
  it('giữ nguyên TTL khi lượt bị bỏ qua do không tìm thấy đơn vị hành động', async () => {
    const { stepTurn, doActionOrSkip: realDoActionOrSkip, deps } = await loadTurnsHarness();
    const slotToCell = deps['./engine.js'].slotToCell;

    const allyLeader = { id: 'allyLeader', side: 'ally', alive: true, ...slotToCell('ally', 1) };
    const enemyLeader = { id: 'enemyLeader', side: 'enemy', alive: true, ...slotToCell('enemy', 1) };
    const minion = { id: 'allyMinion', side: 'ally', alive: true, isMinion: true, ttlTurns: 2, ...slotToCell('ally', 2) };

    const Game = {
      tokens: [allyLeader, enemyLeader, minion],
      meta: new Map(),
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

    let missingOnce = true;
    const hooks = {
      doActionOrSkip(game, unit, ctx){
        if (unit?.side === 'ally' && missingOnce){
          missingOnce = false;
          return realDoActionOrSkip(game, null, ctx);
        }
        return realDoActionOrSkip(game, unit, ctx);
      },
      processActionChain(){
        return null;
      },
    };

    const initialTtl = minion.ttlTurns;

    stepTurn(Game, hooks);
    expect(minion.ttlTurns).toBe(initialTtl);

    stepTurn(Game, hooks);
    expect(minion.ttlTurns).toBe(initialTtl);

    stepTurn(Game, hooks);
    expect(minion.ttlTurns).toBe(initialTtl - 1);
  });
});
