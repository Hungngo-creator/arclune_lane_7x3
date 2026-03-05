import { createSession } from '../src/modes/pve/session-state.ts';
import { spawnQueuedIfDue } from '../src/turns.ts';
import { basicAttack } from '../src/combat.ts';
import { createRngState } from '../src/utils/rng.ts';
import { Statuses } from '../src/statuses.ts';

describe('pve mutated creep', () => {
  test('rolls mutation on creep spawn using seeded rng', () => {
    const game = createSession({ rngSeed: 1 });
    game.queued.enemy.set(1, {
      unitId: 'creep_1',
      side: 'enemy',
      cx: 3,
      cy: 0,
      slot: 1,
      spawnCycle: 0,
      source: 'deck',
      mutationBonusPct: 0.1,
      mutationDebuffPool: ['bleed', 'stun', 'poison'],
    });

    const spawned = spawnQueuedIfDue(game, { side: 'enemy', slot: 1 }, { allocIid: () => 77 });
    expect(spawned.spawned).toBe(true);

    const creep = game.tokens.find((token) => token.iid === 77);
    expect(creep).toBeTruthy();
    expect(creep?.mutated).toBe(true);
    expect(creep?.mutationBonusPct).toBe(0.1);
    expect(Array.isArray(creep?.mutationDebuffPool)).toBe(true);
  });

  test('mutated creep basic attack applies debuff; normal creep does not', () => {
    const mutated = {
      id: 'creep_1',
      side: 'enemy',
      cx: 3,
      cy: 0,
      alive: true,
      atk: 80,
      wil: 20,
      arm: 0,
      res: 0,
      hp: 1000,
      hpMax: 1000,
      mutated: true,
      mutationDebuffPool: ['bleed', 'stun', 'poison'],
      statuses: [],
      iid: 10,
      fury: 0,
      furyMax: 100,
    };
    const normal = { ...mutated, iid: 11, mutated: false };
    const allyA = {
      id: 'leaderA',
      side: 'ally',
      cx: 0,
      cy: 0,
      alive: true,
      atk: 10,
      wil: 10,
      arm: 0,
      res: 0,
      hp: 1000,
      hpMax: 1000,
      statuses: [],
      iid: 20,
      fury: 0,
      furyMax: 100,
    };
    const gameMutated = {
      tokens: [mutated, allyA],
      meta: { get: () => null },
      turn: { cycle: 0, busyUntil: 0 },
      rng: createRngState(1000),
    } as any;

    basicAttack(gameMutated, mutated as any);
    expect(
      Statuses.has(allyA as any, 'bleed')
      || Statuses.has(allyA as any, 'stun')
      || Statuses.has(allyA as any, 'poison')
    ).toBe(true);

    const allyB = { ...allyA, iid: 21, statuses: [] as Array<Record<string, unknown>> };
    const gameNormal = {
      tokens: [normal, allyB],
      meta: { get: () => null },
      turn: { cycle: 0, busyUntil: 0 },
      rng: createRngState(1),
    } as any;
    basicAttack(gameNormal, normal as any);
    expect(Statuses.has(allyB as any, 'bleed')).toBe(false);
    expect(Statuses.has(allyB as any, 'stun')).toBe(false);
    expect(Statuses.has(allyB as any, 'poison')).toBe(false);
  });
});
