import { describe, expect, test } from '@jest/globals';

import { consumeShieldByCurrentRatio, grantShield } from '../src/combat/apply-damage.ts';

import type { UnitToken } from '@shared-types/units';

const makeUnit = (overrides: Partial<UnitToken> = {}): UnitToken => ({
  id: 'u',
  side: 'ally',
  iid: 1,
  cx: 0,
  cy: 0,
  alive: true,
  hp: 100,
  hpMax: 100,
  statuses: [],
  ...overrides,
});

describe('apply-damage shield helpers', () => {
  test('consumeShieldByCurrentRatio consumes in-place and keeps remaining shield', () => {
    const unit = makeUnit();
    grantShield(unit, 100);

    const consumed = consumeShieldByCurrentRatio(unit, 0.25);
    expect(consumed).toBe(25);
    const shield = (unit.statuses ?? []).find((status) => status.id === 'shield');
    expect(shield?.amount).toBe(75);
  });

  test('consumeShieldByCurrentRatio removes shield when fully consumed', () => {
    const unit = makeUnit();
    grantShield(unit, 40);

    const consumed = consumeShieldByCurrentRatio(unit, 1);
    expect(consumed).toBe(40);
    const shield = (unit.statuses ?? []).find((status) => status.id === 'shield');
    expect(shield).toBeUndefined();
  });
});
