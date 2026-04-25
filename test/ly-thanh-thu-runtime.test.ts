import { describe, expect, it, jest } from '@jest/globals';

import { performActiveSkill } from '../src/combat/perform-active-skill.ts';
import { runRuntimeTurnStart, runRuntimeUnitDeath, runRuntimeUnitRevive } from '../src/combat/unit-runtime-hooks.ts';
import { slotToCell } from '../src/engine.ts';
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
} as unknown as SessionState);

describe('ly_thanh_thu runtime hook', () => {
  it('skill2 schedules flying sword stages and triggers skill3 aether drain when >=2 targets are hit', () => {
    const caster = atSlot('ally', 5, { id: 'ly_thanh_thu', iid: 101, atk: 200, wil: 100 });
    const enemy1 = atSlot('enemy', 1, { id: 'enemy_1', iid: 201, hp: 500, hpMax: 500 });
    const enemy4 = atSlot('enemy', 4, { id: 'enemy_4', iid: 202, hp: 500, hpMax: 500 });
    const enemy7 = atSlot('enemy', 7, { id: 'enemy_7', iid: 203, hp: 500, hpMax: 500 });
    const enemy8 = atSlot('enemy', 8, { id: 'enemy_8', iid: 204, hp: 500, hpMax: 500 });
    const enemy9 = atSlot('enemy', 9, { id: 'enemy_9', iid: 205, hp: 500, hpMax: 500 });
    const game = makeGame([caster, enemy1, enemy4, enemy7, enemy8, enemy9]);

    const currentSpy = jest.spyOn(globalAetherPool, 'current').mockReturnValue(999);
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockReturnValue(true);

    const castResult = performActiveSkill(game, caster, 'skill2');
    expect(castResult.ok).toBe(true);
    expect(enemy1.hp).toBeLessThan(500);
    expect(enemy4.hp).toBeLessThan(500);
    expect(enemy7.hp).toBeLessThan(500);
    expect(enemy7.statuses?.some((status) => status.id === 'bleed')).toBe(true);

    runRuntimeTurnStart(game, caster);
    expect(enemy8.hp).toBeLessThan(500);
    expect(enemy9.hp).toBeLessThan(500);

    const defenseTriggers = consumeSpy.mock.calls.filter(([side, amount]) => side === 'ally' && amount === 8);
    expect(defenseTriggers.length).toBeGreaterThanOrEqual(2);

    currentSpy.mockRestore();
    consumeSpy.mockRestore();
  });

  it('transfers 50% passive bonus to allied leader on death and resets stacks on revive', () => {
    const leader = atSlot('ally', 8, { id: 'leaderA', iid: 10, atk: 300, wil: 300 });
    const caster = atSlot('ally', 5, { id: 'ly_thanh_thu', iid: 11, atk: 100, wil: 100 });
    const enemy = atSlot('enemy', 5, { id: 'enemy', iid: 20 });
    const game = makeGame([leader, caster, enemy]);

    caster.alive = true;
    runRuntimeUnitDeath({ game, deadUnit: enemy, killer: caster });
    runRuntimeUnitDeath({ game, deadUnit: makeToken({ id: 'enemy2', iid: 21, side: 'enemy', alive: false }), killer: caster });

    const atkBeforeDeath = caster.atk;
    const wilBeforeDeath = caster.wil;

    caster.alive = false;
    runRuntimeUnitDeath({ game, deadUnit: caster, killer: null });

    expect(leader.atk).toBeGreaterThan(300);
    expect(leader.wil).toBeGreaterThan(300);

    caster.alive = true;
    runRuntimeUnitRevive({ game, unit: caster });

    expect(caster.atk).toBeLessThanOrEqual(atkBeforeDeath);
    expect(caster.wil).toBeLessThanOrEqual(wilBeforeDeath);
    expect((caster as UnitToken & { _lyThanhThuPassiveStacks?: number })._lyThanhThuPassiveStacks ?? 0).toBe(0);
  });
});
