import { describe, expect, test } from '@jest/globals';

import {
  activateChapMinhLink,
  applyChapMinhActionEnd,
  applyChapMinhMitigation,
  recordChapMinhPreventedDamage,
  applyChapMinhPhaseShift,
  recoverChapMinhMaxHpPerTurn,
} from '../src/combat/chap-minh-runtime.ts';
import { performActiveSkill } from '../src/combat/perform-active-skill.ts';
import { basicAttack, dealAbilityDamage } from '../src/combat.ts';
import { normalizeElementKey } from '../src/utils/domain-normalization.ts';
import { ROSTER } from '../src/catalog.ts';
import { createSession } from '../src/modes/pve/session-state.ts';
import { allyAetherPool } from '../src/aether.ts';

import type { UnitToken } from '../src/types/units.ts';
import type { SessionState } from '../src/types/combat.ts';

function makeUnit(overrides: Partial<UnitToken>): UnitToken {
  return {
    id: 'unit',
    side: 'ally',
    cx: 0,
    cy: 0,
    alive: true,
    hp: 1000,
    hpMax: 1000,
    atk: 100,
    wil: 100,
    arm: 0,
    res: 0,
    statuses: [],
    ...overrides,
  } as UnitToken;
}

describe('chap minh runtime', () => {
  test('is present in roster and can be imported to session lineup from collection', () => {
    const chapMinhMeta = ROSTER.find((unit) => unit.id === 'huyen_vu_chap_minh');
    expect(chapMinhMeta).toBeTruthy();
    expect(chapMinhMeta?.rank).toBe('UR');
    expect(normalizeElementKey(chapMinhMeta?.base_element)).toBe('light');

    const modeKeys = ['campaign', 'chess-strategy-rpg', 'monopoly'] as const;
    for (const modeKey of modeKeys) {
      const session = createSession({
        modeKey,
        lineupDeck: ['huyen_vu_chap_minh'],
        collectionState: {
          units: [{ id: 'huyen_vu_chap_minh', owned: true, level: 80, realm: 6 }],
        },
      });
      expect(session.playerDeckLocked.some((entry) => entry.id === 'huyen_vu_chap_minh')).toBe(true);
    }
  });

  test('normalizes element alias ánh sáng to light', () => {
    expect(normalizeElementKey('ánh sáng')).toBe('light');
    expect(normalizeElementKey('anh sang')).toBe('light');
  });

  test('column shield from passive is timed to 1 turn', () => {
    const chapMinh = makeUnit({
      id: 'huyen_vu_chap_minh',
      side: 'ally',
      cx: 1,
      cy: 1,
      hp: 2000,
      hpMax: 2000,
      statuses: [],
    });
    const allySameColumn = makeUnit({
      id: 'ally_col',
      side: 'ally',
      cx: 0,
      cy: 1,
      statuses: [],
    });
    const allyOtherColumn = makeUnit({
      id: 'ally_other',
      side: 'ally',
      cx: 0,
      cy: 0,
      statuses: [],
    });
    const game = { tokens: [chapMinh, allySameColumn, allyOtherColumn] } as SessionState;

    applyChapMinhActionEnd(game, chapMinh);

    const sameColumnShield = allySameColumn.statuses?.find((status) => status.id === 'shield') ?? null;
    expect(sameColumnShield?.amount).toBe(300);
    expect(sameColumnShield?.dur).toBe(1);
    expect(sameColumnShield?.tick).toBe('turn');

    const otherColumnShield = allyOtherColumn.statuses?.find((status) => status.id === 'shield') ?? null;
    expect(otherColumnShield).toBeNull();
  });

  test('link mitigation accumulates prevented damage and triggers backlash', () => {
    const chapMinh = makeUnit({
      id: 'huyen_vu_chap_minh',
      side: 'ally',
      cx: 1,
      cy: 1,
      hp: 1000,
      hpMax: 1000,
      arm: 100,
      res: 100,
    }) as UnitToken & { _chapMinhLinkOwner?: UnitToken; _chapMinhLinkedSlots?: number[]; _chapMinhAccumulated?: number };
    activateChapMinhLink(chapMinh);

    const ally = makeUnit({ side: 'ally', cx: 1, cy: 0 }) as UnitToken & { _chapMinhLinkOwner?: UnitToken };
    ally._chapMinhLinkOwner = chapMinh;

    const reduced = applyChapMinhMitigation(ally, 1000, { isAoE: true, skill: { tags: [] } });
    expect(reduced.finalDamage).toBe(700);
    expect(reduced.prevented).toBe(300);

    recordChapMinhPreventedDamage(chapMinh, reduced.prevented + 500);
    expect((chapMinh._chapMinhAccumulated ?? 0)).toBe(0);
    expect(chapMinh.hp).toBeLessThan(1000);
  });

  test('global-rule tag bypasses link reduction but still keeps aoe column aura', () => {
    const chapMinh = makeUnit({
      id: 'huyen_vu_chap_minh',
      side: 'ally',
      cx: 1,
      cy: 1,
      hp: 1000,
      hpMax: 1000,
    }) as UnitToken & { _chapMinhLinkOwner?: UnitToken; _chapMinhLinkedSlots?: number[] };
    activateChapMinhLink(chapMinh);

    const ally = makeUnit({ side: 'ally', cx: 0, cy: 1 }) as UnitToken & { _chapMinhLinkOwner?: UnitToken };
    ally._chapMinhLinkOwner = chapMinh;

    const reducedByRuleBypass = applyChapMinhMitigation(ally, 1000, { skill: { tags: ['quy_tac', 'aoe-random'] } });
    expect(reducedByRuleBypass.finalDamage).toBe(650);
    expect(reducedByRuleBypass.prevented).toBe(350);
  });

  test('supports global-rule alias with spacing/diacritics to avoid duplicated bypass logic', () => {
    const chapMinh = makeUnit({
      id: 'huyen_vu_chap_minh',
      side: 'ally',
      cx: 1,
      cy: 1,
      hp: 1000,
      hpMax: 1000,
    }) as UnitToken & { _chapMinhLinkOwner?: UnitToken; _chapMinhLinkedSlots?: number[] };
    activateChapMinhLink(chapMinh);

    const ally = makeUnit({ side: 'ally', cx: 0, cy: 1 }) as UnitToken & { _chapMinhLinkOwner?: UnitToken };
    ally._chapMinhLinkOwner = chapMinh;

    const reducedByAlias = applyChapMinhMitigation(ally, 1000, { skill: { tags: ['Quy Tắc', 'AOE'] } });
    expect(reducedByAlias.finalDamage).toBe(650);
    expect(reducedByAlias.prevented).toBe(350);
  });

  test('phase shift cuts max hp once and restores max hp per turn without healing', () => {
    const chapMinh = makeUnit({
      id: 'huyen_vu_chap_minh',
      hpMax: 1000,
      hp: 100,
    }) as UnitToken & { _chapMinhLostMaxHp?: number };

    applyChapMinhPhaseShift(chapMinh);
    expect(chapMinh.hpMax).toBe(500);
    expect(chapMinh.hp).toBe(500);

    chapMinh.hp = 250;
    recoverChapMinhMaxHpPerTurn(chapMinh);
    expect(chapMinh.hpMax).toBe(600);
    expect(chapMinh.hp).toBe(250);
    expect(chapMinh._chapMinhLostMaxHp).toBe(400);
  });

  test('phase shift revives chap minh when lethal hit drops hp to 0 under threshold', () => {
    const chapMinh = makeUnit({
      id: 'huyen_vu_chap_minh',
      hpMax: 1000,
      hp: 0,
      alive: false,
      deadAt: 123456,
    }) as UnitToken;

    applyChapMinhPhaseShift(chapMinh);
    expect(chapMinh.alive).toBe(true);
    expect(chapMinh.deadAt).toBeUndefined();
    expect(chapMinh.hpMax).toBe(500);
    expect(chapMinh.hp).toBe(500);
  });

  test('accepts aoe alias tags to avoid duplicated aoe detection logic', () => {
    const chapMinh = makeUnit({
      id: 'huyen_vu_chap_minh',
      side: 'ally',
      cx: 1,
      cy: 1,
      hp: 1000,
      hpMax: 1000,
    }) as UnitToken & { _chapMinhLinkOwner?: UnitToken; _chapMinhLinkedSlots?: number[] };
    activateChapMinhLink(chapMinh);

    const allyInColumnOnly = makeUnit({ side: 'ally', cx: 0, cy: 1 }) as UnitToken & { _chapMinhLinkOwner?: UnitToken };
    allyInColumnOnly._chapMinhLinkOwner = chapMinh;

    const reduced = applyChapMinhMitigation(allyInColumnOnly, 1000, { skill: { tags: ['aoe-fixed'] } });
    expect(reduced.finalDamage).toBe(350);
    expect(reduced.prevented).toBe(650);
  });

  test('infers aoe mitigation from normalized skill tags', () => {
    const chapMinh = makeUnit({
      id: 'huyen_vu_chap_minh',
      side: 'ally',
      cx: 1,
      cy: 1,
      hp: 1000,
      hpMax: 1000,
    }) as UnitToken & { _chapMinhLinkOwner?: UnitToken; _chapMinhLinkedSlots?: number[] };
    activateChapMinhLink(chapMinh);

    const allyInColumnOnly = makeUnit({ side: 'ally', cx: 0, cy: 1 }) as UnitToken & { _chapMinhLinkOwner?: UnitToken };
    allyInColumnOnly._chapMinhLinkOwner = chapMinh;

    const reduced = applyChapMinhMitigation(allyInColumnOnly, 1000, { skill: { tags: ['aoe'] } });
    expect(reduced.finalDamage).toBe(350);
    expect(reduced.prevented).toBe(650);
  });

  test('skill2 consumes Aether + 10% current shield and resolves 3 pseudo-basic hits', () => {
    allyAetherPool.current = 10;
    allyAetherPool.max = 999;

    const chapMinh = makeUnit({
      id: 'huyen_vu_chap_minh',
      side: 'ally',
      iid: 'chap-minh',
      hp: 1800,
      hpMax: 1800,
      atk: 220,
      wil: 180,
      statuses: [{ id: 'shield', kind: 'buff', tag: 'shield', amount: 1000 }],
    });
    const enemy = makeUnit({
      id: 'enemy',
      side: 'enemy',
      iid: 'enemy-1',
      hp: 2000,
      hpMax: 2000,
      arm: 0,
      res: 0,
      statuses: [],
    });
    const game = {
      tokens: [chapMinh, enemy],
      queued: { ally: new Map(), enemy: new Map() },
      battle: { over: false, winner: null },
      meta: new Map(),
      turn: { cycle: 1 },
    } as unknown as SessionState;

    const result = performActiveSkill(game, chapMinh, 'skill2');
    expect(result.ok).toBe(true);
    expect(result.targetCount).toBe(1);
    expect(allyAetherPool.current).toBe(0);
    expect(chapMinh.statuses?.find((status) => status.id === 'shield')?.amount).toBe(900);
    expect(enemy.hp).toBeLessThan(2000);
  });

  test('basic attack uses mixed damage profile for chap minh (light spear ranged profile)', () => {
    const chapMinh = makeUnit({
      id: 'huyen_vu_chap_minh',
      side: 'ally',
      atk: 200,
      wil: 200,
      statuses: [],
    });
    const enemyMixed = makeUnit({
      id: 'enemy_mixed',
      side: 'enemy',
      hp: 2000,
      hpMax: 2000,
      arm: 900,
      res: 0,
      statuses: [],
    });
    const enemyPhysicalBaseline = makeUnit({
      id: 'enemy_physical',
      side: 'enemy',
      hp: 2000,
      hpMax: 2000,
      arm: 900,
      res: 0,
      statuses: [],
    });

    const mixedGame = {
      tokens: [chapMinh, enemyMixed],
      queued: { ally: new Map(), enemy: new Map() },
      battle: { over: false, winner: null },
      meta: new Map(),
      turn: { cycle: 1 },
    } as unknown as SessionState;
    basicAttack(mixedGame, chapMinh);
    const mixedDamage = 2000 - (enemyMixed.hp ?? 0);

    const physicalGame = {
      tokens: [chapMinh, enemyPhysicalBaseline],
      queued: { ally: new Map(), enemy: new Map() },
      battle: { over: false, winner: null },
      meta: new Map(),
      turn: { cycle: 1 },
    } as unknown as SessionState;
    dealAbilityDamage(physicalGame, chapMinh, enemyPhysicalBaseline, {
      base: Math.max(1, (chapMinh.atk ?? 0) + (chapMinh.wil ?? 0)),
      dtype: 'physical',
      attackType: 'basic',
    });
    const physicalDamage = 2000 - (enemyPhysicalBaseline.hp ?? 0);

    expect(mixedDamage).toBeGreaterThan(0);
    expect(mixedDamage).toBeGreaterThan(physicalDamage);
  });
});
