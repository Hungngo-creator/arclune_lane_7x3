import { describe, expect, it, jest } from '@jest/globals';

import { dispatchGameplayTags } from '../src/combat/tag-dispatch.ts';
import { compareRuleConflictUnitPriority, compareRuleTagPriority } from '../src/combat/tag-aliases.ts';
import { performActiveSkill } from '../src/combat/perform-active-skill.ts';
import { normalizeTagList } from '../src/data/tags.ts';
import { globalAetherPool } from '../src/aether.ts';
import * as skillMetadataUtils from '../src/combat/skill-metadata-utils.ts';

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

  it('resolves skill1..3 from skillSets; only skill3 follows direct-damage path for Mộng Yểm', () => {
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockReturnValue(true);
    const caster = makeToken({ id: 'mong_yem', side: 'ally', cx: 0, cy: 0 });
    const enemy = makeToken({ id: 'enemy', side: 'enemy', iid: 5, cx: 1, cy: 1, hp: 200, hpMax: 200 });
    const game = makeGame([caster, enemy]);

    const one = performActiveSkill(game, caster, 'skill1');
    const hpAfterOne = enemy.hp;
    const two = performActiveSkill(game, caster, 'skill2');
    const hpAfterTwo = enemy.hp;
    const three = performActiveSkill(game, caster, 'skill3');

    consumeSpy.mockRestore();

    expect(one.ok).toBe(true);
    expect(two.ok).toBe(true);
    expect(three.ok).toBe(true);
    expect(three.tags).toContain('single-target');
    expect(hpAfterOne).toBe(200);
    expect(hpAfterTwo).toBe(200);
    expect(enemy.hp).toBeLessThan(200);
    expect(one.targetCount).toBe(0);
    expect(two.targetCount).toBe(0);
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

  it('respects payload maxUsesPerBattle cap for active skills', () => {
    const payloadSpy = jest.spyOn(skillMetadataUtils, 'resolveSkillPayload');
    payloadSpy.mockImplementation((skill) => ({ ...(skill as Record<string, unknown>), maxUsesPerBattle: 1 }));

    const caster = makeToken({ id: 'mong_yem', side: 'ally', cx: 0, cy: 0 });
    const enemy = makeToken({ id: 'enemy', side: 'enemy', iid: 8, cx: 1, cy: 1, hp: 200, hpMax: 200 });
    const game = makeGame([caster, enemy]);

    const first = performActiveSkill(game, caster, 'skill1');
    const second = performActiveSkill(game, caster, 'skill1');

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    expect(second.reason).toBe('blocked');

    payloadSpy.mockRestore();
  });

  it('rule conflict comparator follows rank > cultivation > stars > awaken > cp', () => {
    expect(compareRuleTagPriority('axiom-rule', 'global-rule')).toBeGreaterThan(0);
    expect(compareRuleTagPriority('global-rule', 'doctrine-rule')).toBeGreaterThan(0);
    expect(compareRuleTagPriority('doctrine-rule', 'axiom-rule')).toBeLessThan(0);

    const rankWins = compareRuleConflictUnitPriority(
      { rank: 'UR', level: 10, stars: 1, awaken: 0, cp: 2000 },
      { rank: 'SSR', level: 99, stars: 5, awaken: 2, cp: 9000 },
    );
    expect(rankWins).toBeGreaterThan(0);

    const cultivationWins = compareRuleConflictUnitPriority(
      { rank: 'UR', level: 20, stars: 2, awaken: 0, cp: 1000 },
      { rank: 'UR', level: 19, stars: 5, awaken: 2, cp: 9999 },
    );
    expect(cultivationWins).toBeGreaterThan(0);

    const starsWins = compareRuleConflictUnitPriority(
      { rank: 'UR', level: 20, stars: 4, awaken: 0, cp: 1000 },
      { rank: 'UR', level: 20, stars: 3, awaken: 2, cp: 9999 },
    );
    expect(starsWins).toBeGreaterThan(0);

    const awakenWins = compareRuleConflictUnitPriority(
      { rank: 'UR', level: 20, stars: 4, awaken: 2, cp: 1000 },
      { rank: 'UR', level: 20, stars: 4, awaken: 1, cp: 9999 },
    );
    expect(awakenWins).toBeGreaterThan(0);

    const cpWins = compareRuleConflictUnitPriority(
      { rank: 'UR', level: 20, stars: 4, awaken: 2, cp: 1200 },
      { rank: 'UR', level: 20, stars: 4, awaken: 2, cp: 900 },
    );
    expect(cpWins).toBeGreaterThan(0);
  });

  it('healing under doctrine-no-heal is resolved by equal-tag unit priority', () => {
    const blocker = makeToken({
      id: 'blocker',
      iid: 10,
      side: 'enemy',
      rank: 'UR',
      level: 20,
      stars: 3,
      awaken: 1,
      cp: 1000,
    });
    const healer = makeToken({
      id: 'healer',
      iid: 11,
      side: 'ally',
      hp: 50,
      rank: 'UR',
      level: 20,
      stars: 3,
      awaken: 1,
      cp: 900,
    });
    const game = makeGame([healer, blocker]);

    dispatchGameplayTags(['doctrine-rule'], {
      game,
      attacker: blocker,
      payload: { forbidEnemyHeal: true, noHealTurns: 2 },
      tagsNormalized: true,
      tagsCanonical: true,
    });

    dispatchGameplayTags(['self', 'heal', 'doctrine-rule'], {
      game,
      attacker: healer,
      payload: { healAmount: 30 },
      tagsNormalized: true,
      tagsCanonical: true,
    });
    expect(healer.hp).toBe(50);

    const strongerHealer = makeToken({
      id: 'healer-2',
      iid: 12,
      side: 'ally',
      hp: 50,
      rank: 'UR',
      level: 20,
      stars: 3,
      awaken: 1,
      cp: 2000,
      statuses: [...(healer.statuses ?? [])],
    });
    game.tokens = [strongerHealer, blocker];
    dispatchGameplayTags(['self', 'heal', 'doctrine-rule'], {
      game,
      attacker: strongerHealer,
      payload: { healAmount: 30 },
      tagsNormalized: true,
      tagsCanonical: true,
    });
    expect(strongerHealer.hp).toBe(80);
  });

  it('global-rule no-heal and axiom-rule heal resolve by tag priority without unit tie-break', () => {
    const blocker = makeToken({
      id: 'blocker-g',
      iid: 20,
      side: 'enemy',
      rank: 'PRIME',
      level: 99,
      stars: 5,
      awaken: 2,
      cp: 99999,
    });
    const healer = makeToken({
      id: 'healer-g',
      iid: 21,
      side: 'ally',
      hp: 50,
      rank: 'SSR',
      level: 1,
      stars: 1,
      awaken: 0,
      cp: 100,
    });
    const game = makeGame([healer, blocker]);

    dispatchGameplayTags(['global-rule'], {
      game,
      attacker: blocker,
      payload: { forbidEnemyHeal: true, noHealTurns: 2 },
      tagsNormalized: true,
      tagsCanonical: true,
    });

    dispatchGameplayTags(['self', 'heal', 'axiom-rule'], {
      game,
      attacker: healer,
      payload: { healAmount: 30 },
      tagsNormalized: true,
      tagsCanonical: true,
    });
    expect(healer.hp).toBe(80);
  });

  it('deferred dispatch marks heal as blocked when caster has no qualifying rule tag override', () => {
    const blocker = makeToken({
      id: 'blocker-d',
      iid: 30,
      side: 'enemy',
      rank: 'UR',
      level: 30,
      stars: 4,
      awaken: 2,
      cp: 6000,
    });
    const healer = makeToken({
      id: 'healer-d',
      iid: 31,
      side: 'ally',
      hp: 40,
      rank: 'UR',
      level: 20,
      stars: 3,
      awaken: 1,
      cp: 2000,
    });
    const game = makeGame([healer, blocker]);

    dispatchGameplayTags(['doctrine-rule'], {
      game,
      attacker: blocker,
      payload: { skillKey: 'skill2', forbidEnemyHeal: true, noHealTurns: 2 },
      tagsNormalized: true,
      tagsCanonical: true,
    });

    const dispatch = dispatchGameplayTags(['self', 'heal'], {
      game,
      attacker: healer,
      payload: { skillKey: 'skill1', healAmount: 30 },
      deferEffects: true,
      tagsNormalized: true,
      tagsCanonical: true,
    });

    expect(dispatch.sideEffects).toContain('heal-blocked');
  });

  
});
