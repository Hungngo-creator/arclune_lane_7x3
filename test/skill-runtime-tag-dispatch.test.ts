import { describe, expect, it, jest } from '@jest/globals';

import { dispatchGameplayTags } from '../src/combat/tag-dispatch.ts';
import { performActiveSkill } from '../src/combat/perform-active-skill.ts';
import { normalizeTagList } from '../src/data/tags.ts';
import { globalAetherPool } from '../src/aether.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

const makeToken = (overrides: Partial<UnitToken>): UnitToken => ({
  id: 'unit',
  iid: 1,
  side: 'ally',
  cx: 0,
  cy: 0,
  alive: true,
  hp: 100,
  hpMax: 100,
  atk: 60,
  wil: 40,
  statuses: [],
  ...overrides,
});

const makeGame = (tokens: UnitToken[]): SessionState => ({
  tokens,
  actionChain: [],
  queued: { ally: new Map(), enemy: new Map() },
} as unknown as SessionState);

describe('skill runtime tag contract', () => {
  it('core tags: damage/heal/shield/status/summon pass', () => {
    const caster = makeToken({ id: 'caster', side: 'ally', cx: 0, cy: 0, hp: 80 });
    const ally = makeToken({ id: 'ally', side: 'ally', iid: 2, cx: 1, cy: 0, hp: 40 });
    const enemy = makeToken({ id: 'enemy', side: 'enemy', iid: 3, cx: 0, cy: 1, hp: 120, hpMax: 120 });
    const game = makeGame([caster, ally, enemy]);

    dispatchGameplayTags(normalizeTagList(['single-target', 'non-heal-hp-change']), {
      game,
      attacker: caster,
      target: enemy,
      payload: { hpDelta: 20 },
    });
    expect(enemy.hp).toBeLessThan(120);

    dispatchGameplayTags(normalizeTagList(['self', 'heal']), {
      game,
      attacker: caster,
      payload: { healAmount: 15 },
    });
    expect(caster.hp).toBeGreaterThan(80);

    dispatchGameplayTags(normalizeTagList(['self', 'shield']), {
      game,
      attacker: caster,
      payload: { shieldAmount: 30 },
    });
    expect(caster.statuses?.some((status) => status.id === 'shield')).toBe(true);

    dispatchGameplayTags(normalizeTagList(['single-target', 'silence']), {
      game,
      attacker: caster,
      target: enemy,
      payload: { turns: 2 },
    });
    expect(enemy.statuses?.some((status) => status.id === 'silence')).toBe(true);

    let summoned = 0;
    dispatchGameplayTags(normalizeTagList(['summon']), {
      game,
      attacker: caster,
      onSummon: () => {
        summoned += 1;
      },
    });
    expect(summoned).toBe(1);
  });

  it('resolves skill1..3 from skillSets and performs active damage path', () => {
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockReturnValue(true);
    const caster = makeToken({ id: 'mong_yem', side: 'ally', cx: 0, cy: 0 });
    const enemy = makeToken({ id: 'enemy', side: 'enemy', iid: 5, cx: 1, cy: 1, hp: 200, hpMax: 200 });
    const game = makeGame([caster, enemy]);

    const one = performActiveSkill(game, caster, 'skill1');
    const two = performActiveSkill(game, caster, 'skill2');
    const three = performActiveSkill(game, caster, 'skill3');

    consumeSpy.mockRestore();

    expect(one.ok).toBe(true);
    expect(two.ok).toBe(true);
    expect(three.ok).toBe(true);
    expect(three.tags).toContain('single-target');
    expect(enemy.hp).toBeLessThan(200);
  });

  it('does not double-consume aether for blood_avatar active skills with aether-cost tag', () => {
    const currentSpy = jest.spyOn(globalAetherPool, 'current').mockReturnValue(100);
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockReturnValue(true);

    const caster = makeToken({ id: 'blood_avatar', side: 'ally', cx: 0, cy: 0 });
    const enemyA = makeToken({ id: 'enemy-a', side: 'enemy', iid: 5, cx: 1, cy: 1, hp: 200, hpMax: 200 });
    const enemyB = makeToken({ id: 'enemy-b', side: 'enemy', iid: 6, cx: 2, cy: 1, hp: 200, hpMax: 200 });
    const game = makeGame([caster, enemyA, enemyB]);

    const result = performActiveSkill(game, caster, 'skill1');

    expect(result.ok).toBe(true);
    const callsWith25 = consumeSpy.mock.calls.filter(([, amount]) => amount === 25);
    expect(callsWith25).toHaveLength(1);

    currentSpy.mockRestore();
    consumeSpy.mockRestore();
  });

  it('blocks active skill execution for dead casters', () => {
    const caster = makeToken({ id: 'mong_yem', side: 'ally', alive: false, hp: 0 });
    const enemy = makeToken({ id: 'enemy', side: 'enemy', iid: 8, cx: 1, cy: 1, hp: 200, hpMax: 200 });
    const game = makeGame([caster, enemy]);

    const result = performActiveSkill(game, caster, 'skill1');
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('blocked');
    expect(enemy.hp).toBe(200);
  });

});
