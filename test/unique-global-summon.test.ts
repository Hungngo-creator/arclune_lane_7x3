import { slotToCell } from '../src/engine.ts';
import { spawnQueuedIfDue } from '../src/turns.ts';
import { isUniqueGlobalSummonBlocked } from '../src/utils/unique-global.ts';

describe('unique-global summon rule (campaign only)', () => {
  it('blocks summon when same unit id already alive on battlefield in campaign', () => {
    const { cx, cy } = slotToCell('ally', 2);
    const Game = {
      modeKey: 'campaign',
      tokens: [{ id: 'hung_prime', alive: true, side: 'ally', cx: 0, cy: 0 }],
      queued: { ally: new Map(), enemy: new Map() },
      turn: { cycle: 0 },
      meta: new Map(),
      runtime: { unitProgressById: new Map() },
    };

    Game.queued.ally.set(2, {
      unitId: 'hung_prime',
      side: 'ally',
      cx,
      cy,
      slot: 2,
      spawnCycle: 0,
      tags: ['unique-global'],
      source: 'deck',
    });

    const result = spawnQueuedIfDue(Game as never, { side: 'ally', slot: 2 });
    expect(result.spawned).toBe(false);
    expect(Game.tokens).toHaveLength(1);
  });

  it('allows summon outside campaign even with unique-global tag', () => {
    const { cx, cy } = slotToCell('ally', 2);
    const Game = {
      modeKey: 'arena',
      tokens: [{ id: 'hung_prime', alive: true, side: 'ally', cx: 0, cy: 0 }],
      queued: { ally: new Map(), enemy: new Map() },
      turn: { cycle: 0 },
      meta: new Map([[ 'hung_prime', { kit: {} } ]]),
      runtime: { unitProgressById: new Map() },
    };

    Game.queued.ally.set(2, {
      unitId: 'hung_prime',
      name: 'Hưng',
      side: 'ally',
      cx,
      cy,
      slot: 2,
      spawnCycle: 0,
      tags: ['unique-global'],
      source: 'deck',
    });

    const result = spawnQueuedIfDue(Game as never, { side: 'ally', slot: 2 });
    expect(result.spawned).toBe(true);
    expect(Game.tokens).toHaveLength(2);
  });

  it('helper checks campaign mode and alive duplicate id', () => {
    const blocked = isUniqueGlobalSummonBlocked({
      modeKey: 'campaign',
      tokens: [{ id: 'hung_prime', alive: true }],
    } as never, {
      unitId: 'hung_prime',
      tags: ['unique-global'],
    });
    expect(blocked).toBe(true);
  });
});
