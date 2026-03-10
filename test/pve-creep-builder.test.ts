import { buildAICreepDeckFromLineup } from '../src/modes/pve/creep-builder.ts';
import { createSession } from '../src/modes/pve/session-state.ts';
import { queueEnemyAt } from '../src/ai.ts';
import { spawnQueuedIfDue } from '../src/turns.ts';

describe('pve creep builder and runtime assignment', () => {
  test('buildAICreepDeckFromLineup maps rank/tu vi/class/tp/cost from lineup and keeps creep_3 strongest slot', () => {
    const lineup = [
      { id: 'anna', class: 'Support', rank: 'SSR', cost: 3 },
      { id: 'linhgac', class: 'Warrior', rank: 'N', cost: 1 },
      { id: 'phe', class: 'Mage', rank: 'UR', cost: 5 },
    ];
    const collectionState = {
      units: [
        { id: 'anna', level: 55, realm: 3, subRealm: 2, tp: 12 },
        { id: 'linhgac', level: 20, realm: 1, subRealm: 1 },
        { id: 'phe', level: 88, realm: 5, subRealm: 4, tp: 23 },
      ],
    };

    const creeps = buildAICreepDeckFromLineup({ lineup, collectionState });
    const byId = new Map(creeps.map((entry) => [entry.id, entry]));

    expect(creeps.map((entry) => entry.id)).toEqual(['creep_1', 'creep_2', 'creep_3']);
    expect(byId.get('creep_3')?.rank).toBe('UR');
    expect(byId.get('creep_3')?.realm).toBe(5);
    expect(byId.get('creep_3')?.subRealm).toBe(4);
    expect(byId.get('creep_3')?.class).toBe('Mage');
    expect(byId.get('creep_3')?.tp).toBe(23);
    expect(byId.get('creep_3')?.cost).toBe(5);

    expect(byId.get('creep_1')?.dynamicRankSource).toBe('lineup');
    expect(byId.get('creep_1')?.dynamicLevelSource).toBe('lineup');
    expect(byId.get('creep_1')?.cost).toBe(1);
  });

  test('enemy queued creep keeps copied class when spawned', () => {
    const game = createSession({ rngSeed: 7 });
    game.ai.cost = 999;
    game.ai.summonLimit = 99;
    const card = {
      id: 'creep_1',
      cost: 0,
      name: 'Creep #1',
      class: 'Support',
      mutationBonusPct: 0.1,
      mutationDebuffPool: ['bleed'],
    } as any;

    const queued = queueEnemyAt(game, card, 1, 3, 0);
    expect(queued).toBe(true);
    expect(game.queued.enemy.get(1)?.class).toBe('Support');

    const spawned = spawnQueuedIfDue(game, { side: 'enemy', slot: 1 }, { allocIid: () => 99 });
    expect(spawned.spawned).toBe(true);
    expect(game.tokens.find((token) => token.iid === 99)?.class).toBe('Support');
  });
});
