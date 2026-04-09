import { describe, expect, it } from '@jest/globals';

import { dispatchGameplayTags } from '../src/combat/tag-dispatch.ts';
import { performActiveSkill } from '../src/combat/perform-active-skill.ts';
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

  it('supports duplicate random targets when payload allows replacement', () => {
    const attacker = makeToken({ id: 'attacker', side: 'ally' });
    const target = makeToken({ id: 'e1', side: 'enemy', cx: 1 });
    const game = makeGame([attacker, target]);

    const randomAoE = dispatchGameplayTags(normalizeTagList(['random-aoe']), {
      game,
      attacker,
      payload: { targetCount: 3, allowDuplicateTargets: true },
    });

    expect(randomAoE.targets).toHaveLength(3);
    expect(randomAoE.targets.every((entry) => entry.id === 'e1')).toBe(true);
  });

  it('prioritizes global-rule targeting over narrower target tags', () => {
    const attacker = makeToken({ id: 'attacker', side: 'ally' });
    const ally = makeToken({ id: 'ally', side: 'ally', cx: 1, cy: 0 });
    const enemy = makeToken({ id: 'enemy', side: 'enemy', cx: 0, cy: 1 });
    const game = makeGame([attacker, ally, enemy]);

    const result = dispatchGameplayTags(normalizeTagList(['enemy', 'global-rule']), {
      game,
      attacker,
    });

    expect(result.targets.map((token) => token.id).sort()).toEqual(['ally', 'attacker', 'enemy']);
    expect(result.applied).toEqual(expect.arrayContaining(['enemy', 'global-rule']));
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

  it('converts overheal into shield when payload enables overflow shield ratio', () => {
    const attacker = makeToken({ id: 'attacker', side: 'ally', hp: 95, hpMax: 100, statuses: [] });
    dispatchGameplayTags(normalizeTagList(['self', 'heal']), {
      game: makeGame([attacker]),
      attacker,
      payload: { healAmount: 20, overhealToShieldRatio: 1, overflowShieldTurns: 2 },
    });

    expect(attacker.hp).toBe(100);
    const shield = (attacker.statuses ?? []).find((status) => status.id === 'shield');
    expect(shield?.amount).toBe(15);
    expect(shield?.dur).toBe(2);
  });

  it('resolves ally/team-heal from attacker perspective for both sides', () => {
    const enemyAttacker = makeToken({ id: 'enemy-attacker', side: 'enemy', hp: 25, hpMax: 100, cx: 1, cy: 1 });
    const enemyAlly = makeToken({ id: 'enemy-ally', side: 'enemy', hp: 30, hpMax: 100, cx: 2, cy: 1 });
    const opposingUnit = makeToken({ id: 'ally-opponent', side: 'ally', hp: 10, hpMax: 100, cx: 0, cy: 1 });

    const game = makeGame([enemyAttacker, enemyAlly, opposingUnit]);

    const allyTargeting = dispatchGameplayTags(['ally'], {
      game,
      attacker: enemyAttacker,
      payload: { targetCount: 2 },
      tagsNormalized: true,
    });
    expect(allyTargeting.targets.map((token) => token.id).sort()).toEqual(['enemy-ally', 'enemy-attacker']);

    dispatchGameplayTags(normalizeTagList(['team-heal']), {
      game,
      attacker: enemyAttacker,
      payload: { healAmount: 20 },
    });

    expect(enemyAttacker.hp).toBe(45);
    expect(enemyAlly.hp).toBe(50);
    expect(opposingUnit.hp).toBe(10);
  });

  it('supports lowest-hp targeting priority for ally/enemy selectors', () => {
    const attacker = makeToken({ id: 'attacker', side: 'ally', hp: 80, hpMax: 100 });
    const allyLow = makeToken({ id: 'ally-low', side: 'ally', hp: 10, hpMax: 100, cx: 2, cy: 0 });
    const allyHigh = makeToken({ id: 'ally-high', side: 'ally', hp: 90, hpMax: 100, cx: 1, cy: 0 });
    const enemyLow = makeToken({ id: 'enemy-low', side: 'enemy', hp: 5, hpMax: 100, cx: 2, cy: 1 });
    const enemyHigh = makeToken({ id: 'enemy-high', side: 'enemy', hp: 95, hpMax: 100, cx: 1, cy: 1 });
    const game = makeGame([attacker, allyLow, allyHigh, enemyLow, enemyHigh]);

    const allyResult = dispatchGameplayTags(['ally'], {
      game,
      attacker,
      tagsNormalized: true,
      payload: { targetCount: 2, targetPriority: 'lowest-hp' },
    });
    expect(allyResult.targets.map((token) => token.id)).toEqual(['ally-low', 'attacker']);

    const enemyResult = dispatchGameplayTags(['enemy'], {
      game,
      attacker,
      tagsNormalized: true,
      payload: { targetCount: 1, targetPriority: 'lowest-hp' },
    });
    expect(enemyResult.targets.map((token) => token.id)).toEqual(['enemy-low']);
  });

  it('accepts character-spec style targeting aliases and hp-ratio priority', () => {
    const attacker = makeToken({ id: 'attacker', side: 'ally', hp: 90, hpMax: 100 });
    const allyA = makeToken({ id: 'ally-a', side: 'ally', hp: 20, hpMax: 40, cx: 1, cy: 0 }); // 50%
    const allyB = makeToken({ id: 'ally-b', side: 'ally', hp: 30, hpMax: 100, cx: 2, cy: 0 }); // 30%
    const enemyA = makeToken({ id: 'enemy-a', side: 'enemy', hp: 10, hpMax: 100, cx: 1, cy: 1 });
    const enemyB = makeToken({ id: 'enemy-b', side: 'enemy', hp: 60, hpMax: 100, cx: 2, cy: 1 });
    const game = makeGame([attacker, allyA, allyB, enemyA, enemyB]);

    const allyAliasResult = dispatchGameplayTags(['bản thân lẫn đồng minh'], {
      game,
      attacker,
      tagsNormalized: true,
      payload: { targetCount: 1, targetPriority: 'lowest-hp-ratio' },
    });
    expect(allyAliasResult.targets.map((token) => token.id)).toEqual(['ally-b']);

    const enemyAliasResult = dispatchGameplayTags(['đơn mục tiêu ngẫu nhiên', 'kẻ địch'], {
      game,
      attacker,
      tagsNormalized: true,
      payload: { targetCount: 1 },
    });
    expect(enemyAliasResult.targets).toHaveLength(1);
    expect(['enemy-a', 'enemy-b']).toContain(enemyAliasResult.targets[0]?.id);
  });

  it('supports leader-first priority and leader-only target role', () => {
    const attacker = makeToken({ id: 'attacker', side: 'ally', cx: 2, cy: 0 });
    const enemyLeader = makeToken({ id: 'enemy-leader', side: 'enemy', cx: 6, cy: 1 }); // slot 8
    const enemyOther = makeToken({ id: 'enemy-other', side: 'enemy', cx: 3, cy: 0 }); // slot 1
    const game = makeGame([attacker, enemyLeader, enemyOther]);

    const leaderFirst = dispatchGameplayTags(['enemy'], {
      game,
      attacker,
      tagsNormalized: true,
      payload: { targetCount: 1, targetPriority: 'leader-first' },
    });
    expect(leaderFirst.targets.map((token) => token.id)).toEqual(['enemy-leader']);

    const leaderOnly = dispatchGameplayTags(['enemy'], {
      game,
      attacker,
      tagsNormalized: true,
      payload: { targetCount: 2, targetRole: 'leader' },
    });
    expect(leaderOnly.targets.map((token) => token.id)).toEqual(['enemy-leader']);
  });

  it('maps character-doc leader-target aliases to leader-target runtime selection', () => {
    const attacker = makeToken({ id: 'attacker', side: 'ally', cx: 2, cy: 0 });
    const enemyLeader = makeToken({ id: 'enemy-leader', side: 'enemy', cx: 6, cy: 1 }); // slot 8
    const enemyOther = makeToken({ id: 'enemy-other', side: 'enemy', cx: 3, cy: 0 });
    const game = makeGame([attacker, enemyLeader, enemyOther]);

    const result = dispatchGameplayTags(['mục tiêu: leader'], {
      game,
      attacker,
      tagsNormalized: true,
    });

    expect(result.targets.map((token) => token.id)).toEqual(['enemy-leader']);
    expect(result.applied).toContain('leader-target');
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
    
    expect(ids).toEqual(expect.arrayContaining(['silence', 'sleep']));
  });

  it('supports mark stack cap with sleep trigger from sleep-setup mechanics', () => {
    const attacker = makeToken({ id: 'attacker', side: 'ally' });
    const target = makeToken({ id: 'target', side: 'enemy', statuses: [] });
    const game = makeGame([attacker, target]);
    const tags = ['single-target', 'mark', 'sleep-setup'];

    for (let i = 0; i < 3; i += 1) {
      dispatchGameplayTags(tags, {
        game,
        attacker,
        target,
        tagsNormalized: true,
        payload: { markId: 'me_hoac', markMaxStacks: 3, sleepTurnsOnCap: 1, markPurgeable: false },
      });
    }

    const ids = (target.statuses ?? []).map((status) => status.id);
    expect(ids).toContain('sleep');
    expect(ids).not.toContain('me_hoac');
    const sleepStatus = (target.statuses ?? []).find((status) => status.id === 'sleep');
    expect(sleepStatus?.sourceUnitId).toBe('attacker');
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

  it('applies Mong Yem dream-mark stack and sleep-on-cap via combat tag runtime', () => {
    const caster = makeToken({ id: 'mong_yem', side: 'ally', cx: 0, cy: 0, atk: 70, wil: 70 });
    const enemy = makeToken({ id: 'enemy', side: 'enemy', iid: 9, cx: 1, cy: 1, hp: 3000, hpMax: 3000, statuses: [] });
    const game = makeGame([caster, enemy]);

    for (let i = 0; i < 3; i += 1) {
      const result = performActiveSkill(game, caster, 'skill3');
      expect(result.ok).toBe(true);
    }

    const statusIds = enemy.statuses?.map((status) => status.id) ?? [];
    expect(statusIds).toContain('sleep');
    expect(statusIds).not.toContain('me_hoac');
  });
});
