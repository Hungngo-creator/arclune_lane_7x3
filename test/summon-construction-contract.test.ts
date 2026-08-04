import { processActionChain } from '../src/summon.ts';
import { slotToCell } from '../src/engine.ts';
import type { SessionState } from '../src/types/combat.ts';

const game = (): SessionState => ({
  tokens: [], actionChain: [], meta: new Map(), queued: { ally: new Map(), enemy: new Map() }, runtime: {}, battle: { over: false },
} as unknown as SessionState);

describe('immediate summon construction contract', () => {
  it('finalizes complete inherited combat stats before insertion', () => {
    const state = game();
    state.actionChain.push({ side: 'ally', slot: 2, unit: { id: 'tranquat_minion', ownerIid: 77, hp: 500, hpMax: 500, atk: 60, wil: 40, res: 20, arm: 10, ttlTurns: 4 } });
    processActionChain(state, 'ally', 1, { doActionOrSkip: () => ({ consumedTurn: true, acted: false, skipped: true, reason: null }) });
    expect(state.tokens).toHaveLength(1);
    expect(state.tokens[0]).toMatchObject({ id: 'tranquat_minion', ownerIid: 77, hp: 500, hpMax: 500, atk: 60, wil: 40, res: 20, arm: 10, ttlTurns: 4, entityKind: 'summon', alive: true, lifeState: 'alive' });
  });

  it('rejects malformed HP atomically with a diagnostic', () => {
    const state = game();
    state.actionChain.push({ side: 'enemy', slot: 4, unit: { id: 'broken_minion', ownerIid: 88, atk: 10 } });
    expect(() => processActionChain(state, 'enemy', 1)).toThrow(/owner=88.*slot=4.*summon=broken_minion.*hpMax,hp/);
    expect(state.tokens).toHaveLength(0);
    expect(state.actionChain).toHaveLength(1);
    expect(slotToCell('enemy', 4)).toEqual({ cx: 5, cy: 2 });
  });
});
