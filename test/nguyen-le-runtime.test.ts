import { describe, expect, it, jest } from '@jest/globals';

import { performActiveSkill } from '../src/combat/perform-active-skill.ts';
import { runRuntimeDamageResolved, runRuntimeUnitDeath } from '../src/combat/unit-runtime-hooks.ts';
import { globalAetherPool } from '../src/aether.ts';
import { slotToCell } from '../src/engine.ts';
import { Statuses } from '../src/statuses.ts';

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
  atk: 100,
  wil: 100,
  arm: 20,
  res: 20,
  statuses: [],
  ...overrides,
});

const atSlot = (side: UnitToken['side'], slot: number, overrides: Partial<UnitToken>): UnitToken => {
  const { cx, cy } = slotToCell(side, slot);
  return makeToken({ side, cx, cy, ...overrides });
};

const makeGame = (tokens: UnitToken[]): SessionState => ({
  tokens,
  actionChain: [],
  queued: { ally: new Map(), enemy: new Map() },
  runtime: {},
  turn: { turnCount: 1, cycle: 1 },
  rng: Math,
} as unknown as SessionState);

describe('nguyen_le runtime hook', () => {
  it('applies kill passive: grant random immunity and +5% ATK/WIL from current stats', () => {
    const nguyenLe = atSlot('ally', 5, { id: 'nguyen_le', iid: 35, atk: 200, wil: 100 });
    const deadEnemy = atSlot('enemy', 5, { id: 'enemy', iid: 99, alive: false });
    const game = makeGame([nguyenLe, deadEnemy]);

    runRuntimeUnitDeath({ game, deadUnit: deadEnemy, killer: nguyenLe });

    expect(nguyenLe.atk).toBe(210);
    expect(nguyenLe.wil).toBe(105);
    const immunities = (nguyenLe as UnitToken & { _nguyenLeDebuffImmunities?: string[] })._nguyenLeDebuffImmunities ?? [];
    expect(immunities.length).toBe(1);

    Statuses.add(nguyenLe, {
      id: immunities[0]!,
      kind: 'debuff',
      tag: 'test',
      dur: 2,
      tick: 'turn',
    });
    expect((nguyenLe.statuses ?? []).some((status) => status.id === immunities[0])).toBe(false);
  });

  it('skill1 auto-heals when taking >20% max HP damage and consumes 10 aether once per damage event', () => {
    const nguyenLe = atSlot('ally', 5, { id: 'nguyen_le', iid: 35, hp: 120, hpMax: 200, atk: 100, wil: 100 });
    const game = makeGame([nguyenLe]);
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockReturnValue(true);

    const carrier = nguyenLe as UnitToken & {
      _lastDamageTaken?: number;
      _lastDamageTakenSerial?: number;
      _lastDamageTakenTurn?: number;
    };
    carrier._lastDamageTaken = 60;
    carrier._lastDamageTakenSerial = 1;
    carrier._lastDamageTakenTurn = 1;

    runRuntimeDamageResolved(nguyenLe);
    expect(nguyenLe.hp).toBe(200);

    runRuntimeDamageResolved(nguyenLe);
    expect(consumeSpy).toHaveBeenCalledTimes(1);

    consumeSpy.mockRestore();
  });

  it('skill2 targets the most occupied enemy row and drains 7 aether per enemy hit (max 21)', () => {
    const nguyenLe = atSlot('ally', 5, { id: 'nguyen_le', iid: 35, atk: 120, wil: 80 });
    const enemy4 = atSlot('enemy', 4, { id: 'enemy4', iid: 104, hp: 300, hpMax: 300 });
    const enemy5 = atSlot('enemy', 5, { id: 'enemy5', iid: 105, hp: 300, hpMax: 300 });
    const enemy6 = atSlot('enemy', 6, { id: 'enemy6', iid: 106, hp: 300, hpMax: 300 });
    const enemy1 = atSlot('enemy', 1, { id: 'enemy1', iid: 101, hp: 300, hpMax: 300 });
    const game = makeGame([nguyenLe, enemy1, enemy4, enemy5, enemy6]);

    const currentSpy = jest.spyOn(globalAetherPool, 'current').mockReturnValue(999);
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockReturnValue(true);

    const result = performActiveSkill(game, nguyenLe, 'skill2');
    expect(result.ok).toBe(true);
    expect(enemy4.hp).toBeLessThan(300);
    expect(enemy5.hp).toBeLessThan(300);
    expect(enemy6.hp).toBeLessThan(300);
    expect(enemy1.hp).toBe(300);
    expect(consumeSpy).toHaveBeenCalledWith('ally', 21);

    currentSpy.mockRestore();
    consumeSpy.mockRestore();
  });
});
