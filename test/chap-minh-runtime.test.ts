import { describe, expect, test } from '@jest/globals';

import {
  activateChapMinhLink,
  applyChapMinhMitigation,
  recordChapMinhPreventedDamage,
  applyChapMinhPhaseShift,
  recoverChapMinhMaxHpPerTurn,
} from '../src/combat/chap-minh-runtime.ts';
import { normalizeElementKey } from '../src/utils/domain-normalization.ts';

import type { UnitToken } from '../src/types/units.ts';

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
  test('normalizes element alias ánh sáng to light', () => {
    expect(normalizeElementKey('ánh sáng')).toBe('light');
    expect(normalizeElementKey('anh sang')).toBe('light');
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

    const reducedByRuleBypass = applyChapMinhMitigation(ally, 1000, { skill: { tags: ['global-rule', 'aoe'] } });
    expect(reducedByRuleBypass.finalDamage).toBe(650);
    expect(reducedByRuleBypass.prevented).toBe(350);
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
});
