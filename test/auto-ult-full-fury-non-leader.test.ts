import { slotToCell } from '../src/engine.ts';
import { spawnQueuedIfDue } from '../src/turns.ts';

describe('auto-ult full fury for non-leader summon', () => {
  it('auto casts ult when deck summon is non-leader', () => {
    const Game = {
      tokens: [],
      meta: new Map([[ 'mong_yem', { kit: {} } ]]),
      queued: { ally: new Map(), enemy: new Map() },
      turn: { cycle: 0 },
      runtime: { unitProgressById: new Map() },
    };

    const { cx, cy } = slotToCell('ally', 2);

    Game.queued.ally.set(2, {
      unitId: 'mong_yem',
      name: 'Mộng Yểm',
      side: 'ally',
      cx,
      cy,
      slot: 2,
      spawnCycle: 0,
      source: 'deck',
    });

    const performUlt = jest.fn();
    const result = spawnQueuedIfDue(Game as never, { side: 'ally', slot: 2 }, { performUlt });

    expect(result.spawned).toBe(true);
    expect(result.actor?.id).toBe('mong_yem');
    expect(performUlt).toHaveBeenCalledTimes(1);
  });
});
