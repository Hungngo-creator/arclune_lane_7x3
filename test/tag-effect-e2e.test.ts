import { dispatchGameplayTags } from '../src/combat/tag-dispatch.ts';
import { normalizeTagList } from '../src/data/tags.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

const token = (overrides: Partial<UnitToken>): UnitToken => ({
  id: 'unit',
  iid: 1,
  side: 'ally',
  cx: 0,
  cy: 0,
  alive: true,
  hp: 100,
  hpMax: 100,
  atk: 50,
  wil: 40,
  statuses: [],
  ...overrides,
});

describe('tag effect end-to-end', () => {
  it('applies damage -> heal -> silence with state transitions', () => {
    const caster = token({ id: 'caster', side: 'ally', hp: 70, hpMax: 100 });
    const enemy = token({ id: 'enemy', side: 'enemy', iid: 2, cx: 1, cy: 1, hp: 120, hpMax: 120 });
    const game = {
      tokens: [caster, enemy],
      actionChain: [],
      queued: { ally: new Map(), enemy: new Map() },
    } as unknown as SessionState;

    dispatchGameplayTags(normalizeTagList(['single-target', 'non-heal-hp-change']), {
      game,
      attacker: caster,
      target: enemy,
      payload: { hpDelta: 25 },
    });
    expect(enemy.hp).toBeLessThan(120);

    dispatchGameplayTags(normalizeTagList(['self', 'heal']), {
      game,
      attacker: caster,
      payload: { healAmount: 20 },
    });
    expect(caster.hp).toBeGreaterThan(70);

    dispatchGameplayTags(normalizeTagList(['single-target', 'silence']), {
      game,
      attacker: caster,
      target: enemy,
      payload: { turns: 2 },
    });
    expect(enemy.statuses?.some((status) => status.id === 'silence')).toBe(true);
  });
});
