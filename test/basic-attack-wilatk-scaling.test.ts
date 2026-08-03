import { describe, expect, it } from '@jest/globals';

import { basicAttack } from '../src/combat.ts';
import { slotToCell } from '../src/engine.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

const makeUnit = (overrides: Partial<UnitToken>): UnitToken => ({
  id: 'unit',
  iid: 1,
  side: 'ally',
  cx: 0,
  cy: 0,
  alive: true,
  hp: 999,
  hpMax: 999,
  atk: 100,
  wil: 100,
  arm: 0,
  res: 0,
  statuses: [],
  ...overrides,
});

const makeGame = (tokens: UnitToken[]): SessionState => ({
  tokens,
  actionChain: [],
  queued: { ally: new Map(), enemy: new Map() },
  turn: { turnCount: 1, cycle: 1 },
  runtime: {},
} as unknown as SessionState);

describe('basic attack scaling for ly_thanh_thu and nguyen_le', () => {
  const cases = [
    { id: 'ly_thanh_thu', atk: 120, wil: 80 },
    { id: 'nguyen_le', atk: 90, wil: 110 },
  ] as const;

  it.each(cases)('uses 100% ATK + 100% WIL for $id basic attack damage base', ({ id, atk, wil }) => {
    const attacker = makeUnit({ id, side: 'ally', ...slotToCell('ally', 5), atk, wil, hp: 800, hpMax: 800 });
    const defender = makeUnit({
      id: 'enemy',
      iid: 2,
      side: 'enemy',
      ...slotToCell('enemy', 5),
      hp: 1200,
      hpMax: 1200,
      atk: 10,
      wil: 10,
      arm: 0,
      res: 0,
    });
    const game = makeGame([attacker, defender]);

    basicAttack(game, attacker);

    const expectedDamage = atk + wil;
    expect(defender.hp).toBe(1200 - expectedDamage);
  });
});
