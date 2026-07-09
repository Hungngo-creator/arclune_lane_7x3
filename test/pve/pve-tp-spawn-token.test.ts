import { mapUnitProgressById, resolveRuntimeUnitStats } from '../src/modes/pve/collection-mapper.ts';
import { spawnQueuedIfDue } from '../src/turns.ts';

describe('PvE TP allocation spawn stats', () => {
  it('spawns token with HP TP allocation applied to hpMax and hp', () => {
    const collectionState = { units: [{ unitId: 'thien_luu', tpAlloc: { HP: 2 } }] };
    const unitProgressById = mapUnitProgressById(collectionState);
    const base = resolveRuntimeUnitStats('thien_luu', new Map());
    const pos = { cx: 1, cy: 1 };
    const game = {
      tokens: [],
      meta: { get: () => ({ class: 'Warrior', kit: null }) },
      runtime: { unitProgressById },
      queued: {
        ally: new Map([[5, { unitId: 'thien_luu', side: 'ally', slot: 5, source: 'deck', ...pos }]]),
        enemy: new Map(),
      },
      turn: { cycle: 0 },
    } as never;

    const result = spawnQueuedIfDue(game, { side: 'ally', slot: 5 });
    const token = (game as { tokens: Array<{ id: string; hpMax: number; hp: number }> }).tokens.find((entry) => entry.id === 'thien_luu');

    expect(result.spawned).toBe(true);
    expect(token).toBeTruthy();
    expect(token?.hpMax).toBe(base.hpMax + 40);
    expect(token?.hp).toBe(base.hp + 40);
  });
});

