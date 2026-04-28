import { describe, expect, it, jest } from '@jest/globals';

import { performActiveSkill } from '../src/combat/perform-active-skill.ts';
import { runRuntimeTurnStart, runRuntimeUlt } from '../src/combat/unit-runtime-hooks.ts';
import { slotToCell } from '../src/engine.ts';
import { globalAetherPool } from '../src/aether.ts';
import * as combatModule from '../src/combat.ts';

import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

type CoTruongPhongState = UnitToken & {
  _coTruongPhongFlyingSwords?: number;
  _coTruongPhongLawActive?: boolean;
};

const makeToken = (overrides: Partial<UnitToken>): UnitToken => ({
  id: 'unit',
  iid: 1,
  side: 'ally',
  cx: 0,
  cy: 0,
  alive: true,
  hp: 1000,
  hpMax: 1000,
  atk: 120,
  wil: 120,
  arm: 0,
  res: 0,
  fury: 100,
  ae: 50,
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

function createCoTruongPhongBattleFixture() {
  const coTruongPhong = atSlot('ally', 5, { id: 'co_truong_phong', iid: 101, atk: 150, wil: 150 }) as CoTruongPhongState;
  const enemyLeader = atSlot('enemy', 5, { id: 'enemy_leader', iid: 202, fury: 100, hp: 5000, hpMax: 5000, cy: 3 });
  const enemyOther = atSlot('enemy', 2, { id: 'enemy_2', iid: 203, fury: 100, hp: 5000, hpMax: 5000 });
  const game = makeGame([coTruongPhong, enemyLeader, enemyOther]);
  return { game, coTruongPhong, enemyLeader, enemyOther };
}

describe('co_truong_phong runtime hook', () => {
  it('skill2 only drains 24 fury when all 3 hits land and skill3 law is active', () => {
    const { game, coTruongPhong, enemyLeader } = createCoTruongPhongBattleFixture();
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockImplementation((_side, amount) => amount === 35);

    coTruongPhong._coTruongPhongFlyingSwords = 3;
    coTruongPhong._coTruongPhongLawActive = true;
    const result = performActiveSkill(game, coTruongPhong, 'skill2');

    expect(result.ok).toBe(true);
    expect(enemyLeader.fury).toBe(76);
    consumeSpy.mockRestore();
  });

  it('turn start creates swords and consumes 8 ally-pool AE to keep skill3 active', () => {
    const { game, coTruongPhong } = createCoTruongPhongBattleFixture();
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockImplementation((_side, amount) => amount === 8);

    runRuntimeTurnStart(game, coTruongPhong);

    expect(coTruongPhong._coTruongPhongFlyingSwords).toBe(3);
    expect(coTruongPhong._coTruongPhongLawActive).toBe(true);
    expect(consumeSpy).toHaveBeenCalledWith('ally', 8);
    consumeSpy.mockRestore();
  });

  it('ultimate chain-casts skill2 then skill1 based on swords without consuming skill AE', () => {
    const { game, coTruongPhong } = createCoTruongPhongBattleFixture();
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockReturnValue(true);

    coTruongPhong._coTruongPhongFlyingSwords = 5;
    coTruongPhong._coTruongPhongLawActive = true;

    const ok = runRuntimeUlt({ game, caster: coTruongPhong });

    expect(ok).toBe(true);
    expect(coTruongPhong._coTruongPhongFlyingSwords).toBe(0);
    expect(consumeSpy.mock.calls.some(([, amount]) => amount === 20 || amount === 35)).toBe(false);
    consumeSpy.mockRestore();
  });

  it('skill1 still executes 2 sword hits even when only 1 enemy remains', () => {
    const coTruongPhong = atSlot('ally', 5, { id: 'co_truong_phong', iid: 101, atk: 150, wil: 150 }) as CoTruongPhongState;
    const enemyLeader = atSlot('enemy', 5, { id: 'enemy_leader', iid: 202, fury: 100, hp: 5000, hpMax: 5000, cy: 3 });
    const game = makeGame([coTruongPhong, enemyLeader]);
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockImplementation((_side, amount) => amount === 20);
    const abilitySpy = jest.spyOn(combatModule, 'dealAbilityDamage').mockReturnValue({ dealt: 10 } as never);

    coTruongPhong._coTruongPhongFlyingSwords = 2;
    coTruongPhong._coTruongPhongLawActive = true;
    const result = performActiveSkill(game, coTruongPhong, 'skill1');

    expect(result.ok).toBe(true);
    expect(abilitySpy).toHaveBeenCalledTimes(2);
    expect(enemyLeader.fury).toBe(84);
    consumeSpy.mockRestore();
    abilitySpy.mockRestore();
  });
});
