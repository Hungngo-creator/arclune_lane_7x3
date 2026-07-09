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

  it('spawns token with equipment HP and ATK applied before session combat', () => {
    const collectionState = {
      units: [
        { unitId: 'thien_luu', equipment: { shirt: 'ao-luyen-khi-su-vo-danh', weapon: 'kiem-cu-luyen-khi-su-vo-danh' } },
      ],
    };
    const unitProgressById = mapUnitProgressById(collectionState);
    const base = resolveRuntimeUnitStats('thien_luu', new Map());
    const equipped = resolveRuntimeUnitStats('thien_luu', unitProgressById);

    expect(unitProgressById.get('thien_luu')?.equipment).toEqual({
      head: null,
      shirt: 'ao-luyen-khi-su-vo-danh',
      weapon: 'kiem-cu-luyen-khi-su-vo-danh',
      accessory: null,
      pants: null,
      ring1: null,
      ring2: null,
      ring3: null,
    });
    expect(equipped.hpMax).toBe(base.hpMax + 60);
    expect(equipped.hp).toBe(base.hp + 60);
    expect(equipped.atk).toBe(base.atk + 2);

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
    const token = (game as { tokens: Array<{ id: string; hpMax: number; hp: number; atk: number }> }).tokens.find((entry) => entry.id === 'thien_luu');

    expect(result.spawned).toBe(true);
    expect(token).toBeTruthy();
    expect(token?.hpMax).toBe(base.hpMax + 60);
    expect(token?.hp).toBe(base.hp + 60);
    expect(token?.atk).toBe(base.atk + 2);
  });
});

