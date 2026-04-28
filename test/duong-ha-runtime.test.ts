import { describe, expect, it, jest } from '@jest/globals';

import { performActiveSkill } from '../src/combat/perform-active-skill.ts';
import { runRuntimeBasicAttackResolved, runRuntimeTurnStart, runRuntimeUnitDeath } from '../src/combat/unit-runtime-hooks.ts';
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

describe('duong_ha runtime hook', () => {
  it('blocks manual cast for skill1/skill2 because they are always-on mechanics', () => {
    const duongHa = atSlot('ally', 5, { id: 'duong_ha', iid: 71 });
    const enemy = atSlot('enemy', 5, { id: 'enemy', iid: 88 });
    const game = makeGame([duongHa, enemy]);

    const skill1 = performActiveSkill(game, duongHa, 'skill1');
    const skill2 = performActiveSkill(game, duongHa, 'skill2');

    expect(skill1.ok).toBe(false);
    expect(skill1.reason).toBe('blocked');
    expect(skill2.ok).toBe(false);
    expect(skill2.reason).toBe('blocked');
  });

  it('skill1 consumes 5 ally pool AE/turn, then drains 10 fury on hit and adds follow-up damage', () => {
    const duongHa = atSlot('ally', 5, { id: 'duong_ha', iid: 71, atk: 100, wil: 100, ae: 30 });
    const enemy = atSlot('enemy', 5, { id: 'enemy', iid: 88, hp: 400, hpMax: 400, fury: 80 });
    const game = makeGame([duongHa, enemy]);
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockImplementation((_side, amount) => amount === 5);

    runRuntimeTurnStart(game, duongHa);
    expect(consumeSpy).toHaveBeenCalledWith('ally', 5);

    const beforeHp = enemy.hp;
    runRuntimeBasicAttackResolved({ game, attacker: duongHa, target: enemy, dealt: 120 });

    expect(enemy.fury).toBeLessThan(80);
    expect(enemy.hp).toBeLessThan(beforeHp);
    consumeSpy.mockRestore();
  });

  it('skill2 toggles every turn (spawn starts ON), costs 3 ally pool AE when ON, and grants pierce status for basic attacks', () => {
    const duongHa = atSlot('ally', 5, { id: 'duong_ha', iid: 71, ae: 40 });
    const game = makeGame([duongHa]);
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockReturnValue(true);

    runRuntimeTurnStart(game, duongHa);
    expect(consumeSpy).toHaveBeenCalledWith('ally', 5);
    expect(consumeSpy).toHaveBeenCalledWith('ally', 3);
    expect(duongHa.statuses?.some((status) => status.id === 'duong_ha_skill2_pierce')).toBe(true);

    runRuntimeTurnStart(game, duongHa);
    expect(duongHa.statuses?.some((status) => status.id === 'duong_ha_skill2_pierce')).toBe(false);

    runRuntimeTurnStart(game, duongHa);
    expect(consumeSpy.mock.calls.filter(([side, amount]) => side === 'ally' && amount === 3).length).toBeGreaterThanOrEqual(2);
    expect(duongHa.statuses?.some((status) => status.id === 'duong_ha_skill2_pierce')).toBe(true);
  consumeSpy.mockRestore();
  });

  it('skill1 and skill2 do not activate when ally pool lacks AE', () => {
    const duongHa = atSlot('ally', 5, { id: 'duong_ha', iid: 71, atk: 100, wil: 100 });
    const enemy = atSlot('enemy', 5, { id: 'enemy', iid: 88, hp: 400, hpMax: 400, fury: 80 });
    const game = makeGame([duongHa, enemy]);
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockReturnValue(false);

    runRuntimeTurnStart(game, duongHa);
    expect(duongHa.statuses?.some((status) => status.id === 'duong_ha_skill2_pierce')).toBe(false);

    const beforeHp = enemy.hp;
    runRuntimeBasicAttackResolved({ game, attacker: duongHa, target: enemy, dealt: 120 });

    expect(enemy.fury).toBe(80);
    expect(enemy.hp).toBe(beforeHp);
    expect(consumeSpy).toHaveBeenCalledWith('ally', 5);
    expect(consumeSpy.mock.calls.some(([, amount]) => amount === 3)).toBe(false);
    consumeSpy.mockRestore();
  });

  it('resets passive stacks when unit is no longer alive on field', () => {
    const duongHa = atSlot('ally', 5, { id: 'duong_ha', iid: 71, atk: 100, wil: 100, hp: 1000, hpMax: 1000 });
    const deadEnemy = atSlot('enemy', 5, { id: 'enemy', iid: 88, alive: false });
    const game = makeGame([duongHa, deadEnemy]);

    runRuntimeUnitDeath({ game, deadUnit: deadEnemy, killer: null });
    expect(duongHa.atk).toBe(103);

    duongHa.alive = false;
    runRuntimeTurnStart(game, duongHa);

    expect(duongHa.atk).toBe(100);
    expect(duongHa.wil).toBe(100);
    expect(duongHa.hpMax).toBe(1000);
  });

  it('passive gains stack when any enemy dies while duong_ha is alive, including summon/creep units', () => {
    const duongHa = atSlot('ally', 5, { id: 'duong_ha', iid: 71, atk: 100, wil: 100, hp: 1000, hpMax: 1000 });
    const creep = atSlot('enemy', 5, { id: 'creep_1', iid: 99, alive: false, ownerIid: 5 });
    const game = makeGame([duongHa, creep]);

    runRuntimeUnitDeath({ game, deadUnit: creep, killer: null });

    expect(duongHa.atk).toBe(103);
    expect(duongHa.wil).toBe(103);
    expect(duongHa.hpMax).toBe(1030);
  });
});
