import { describe, expect, it } from '@jest/globals';

import { dispatchGameplayTags } from '../src/combat/tag-dispatch.ts';
import { normalizeTagList } from '../src/data/tags.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

const makeToken = (overrides: Partial<UnitToken>): UnitToken => ({
  id: 'unit',
  side: 'ally',
  cx: 0,
  cy: 0,
  alive: true,
  hp: 100,
  hpMax: 100,
  statuses: [],
  ...overrides,
});

const makeGame = (tokens: UnitToken[]): SessionState => ({ tokens } as SessionState);

describe('combat tag dispatcher matrix', () => {
  it('handles aether-cost', () => {
    const attacker = makeToken({ id: 'attacker', side: 'ally' });
    let consumed = 0;
    const result = dispatchGameplayTags(normalizeTagList(['aether-cost']), {
      game: makeGame([attacker]),
      attacker,
      side: 'ally',
      cost: 4,
      onAetherCost: (amount) => {
        consumed += amount;
        return true;
      },
    });
    expect(consumed).toBe(4);
    expect(result.sideEffects).toContain('aether:ally:4');
  });

  it('handles single-target / multi-target / aoe target selection', () => {
    const attacker = makeToken({ id: 'attacker', side: 'ally' });
    const e1 = makeToken({ id: 'e1', side: 'enemy', cx: 1 });
    const e2 = makeToken({ id: 'e2', side: 'enemy', cx: 2 });
    const e3 = makeToken({ id: 'e3', side: 'enemy', cx: 3 });
    const game = makeGame([attacker, e1, e2, e3]);

    const single = dispatchGameplayTags(normalizeTagList(['single-target']), {
      game,
      attacker,
      target: e2,
    });
    expect(single.targets.map((token) => token.id)).toEqual(['e2']);

    const multi = dispatchGameplayTags(normalizeTagList(['multi-target']), {
      game,
      attacker,
      payload: { targetCount: 2 },
    });
    expect(multi.targets).toHaveLength(2);

    const aoe = dispatchGameplayTags(normalizeTagList(['aoe']), {
      game,
      attacker,
    });
    expect(aoe.targets).toHaveLength(3);
  });

  it('handles heal and shield', () => {
    const attacker = makeToken({ id: 'attacker', side: 'ally', hp: 40, hpMax: 100 });
    const result = dispatchGameplayTags(normalizeTagList(['heal', 'barrier']), {
      game: makeGame([attacker]),
      attacker,
      targets: [attacker],
      payload: { healAmount: 20, shieldAmount: 30 },
    });

    expect(attacker.hp).toBe(60);
    const shield = (attacker.statuses ?? []).find((status) => status.id === 'shield');
    expect(shield?.amount ?? 0).toBe(30);
    expect(result.applied).toEqual(expect.arrayContaining(['heal', 'shield']));
  });

  it('handles silence / sleep / mark statuses', () => {
    const attacker = makeToken({ id: 'attacker', side: 'ally' });
    const target = makeToken({ id: 'target', side: 'enemy' });

    dispatchGameplayTags(normalizeTagList(['silence', 'sleep', 'mark']), {
      game: makeGame([attacker, target]),
      attacker,
      targets: [target],
      payload: { turns: 2 },
    });

    const ids = (target.statuses ?? []).map((status) => status.id);
    expect(ids).toEqual(expect.arrayContaining(['silence', 'sleep', 'mark']));
  });

  it('handles summon and non-heal-hp-change', () => {
    const attacker = makeToken({ id: 'attacker', side: 'ally' });
    const target = makeToken({ id: 'target', side: 'enemy', hp: 100, hpMax: 100 });
    let summoned = 0;

    dispatchGameplayTags(normalizeTagList(['summon', 'non-heal-hp-change']), {
      game: makeGame([attacker, target]),
      attacker,
      targets: [target],
      payload: { hpDelta: 25 },
      onSummon: () => {
        summoned += 1;
      },
    });

    expect(summoned).toBe(1);
    expect(target.hp).toBe(75);
  });
});
