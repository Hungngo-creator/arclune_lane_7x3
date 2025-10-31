// @ts-nocheck
import { describe, it, expect } from '@jest/globals';
import { loadTurnsHarness } from './helpers/turns-harness.mjs';

describe('tickMinionTTL - xử lý lỗi hệ thống', () => {
  it('không giảm TTL khi doActionOrSkip trả về consumedTurn=false với lý do systemError', async () => {
    const { stepTurn, deps } = await loadTurnsHarness();
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

    let glitch = true;
    const hooks = {
      doActionOrSkip(_game, unit){
        if (unit?.side === 'ally'){
          if (glitch){
            glitch = false;
            return { consumedTurn: false, acted: false, skipped: true, reason: 'systemError' };
          }
          return { consumedTurn: true, acted: true, skipped: false, reason: null };
        }
        return { consumedTurn: true, acted: true, skipped: false, reason: null };
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
