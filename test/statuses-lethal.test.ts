import { Statuses, makeStatusEffect } from '../src/statuses.ts';

import type { UnitToken } from '../src/types/units.ts';

describe('Statuses lethal handling', () => {
  let counter = 0;

  const createUnit = (overrides: Partial<UnitToken> = {}): UnitToken => {
    counter += 1;
    const hpMax = overrides.hpMax ?? 100;
    const base: UnitToken = {
      id: `unit-${counter}`,
      name: `Unit ${counter}`,
      side: overrides.side ?? 'ally',
      cx: overrides.cx ?? 0,
      cy: overrides.cy ?? 0,
      alive: overrides.alive ?? true,
      hpMax,
      hp: overrides.hp ?? hpMax,
      statuses: [],
    };
    const unit = { ...base, ...overrides } as UnitToken;
    if (!Array.isArray(unit.statuses)) {
      unit.statuses = [];
    }
    return unit;
  };

const addStatus = <K extends keyof typeof Statuses.make>(
    unit: UnitToken,
    key: K,
    spec?: Parameters<(typeof Statuses.make)[K]>[0],
  ): void => {
    const status = makeStatusEffect(key, spec);
    if (!status) {
      throw new Error(`Không thể tạo hiệu ứng trạng thái "${String(key)}".`);
    }
    Statuses.add(unit, status);
  };

  beforeEach(() => {
    counter = 0;
  });

  it('bleed damage marks units dead without undying', () => {
    const unit = createUnit({ hp: 5, hpMax: 100 });
    addStatus(unit, 'bleed', { turns: 1 });

    Statuses.onTurnEnd(unit, { log: [] });

    expect(unit.hp).toBe(0);
    expect(unit.alive).toBe(false);
    expect(unit.deadAt).toEqual(expect.any(Number));
  });

  it('bleed damage triggers undying revive', () => {
    const unit = createUnit({ hp: 5, hpMax: 100 });
    addStatus(unit, 'bleed', { turns: 1 });
    addStatus(unit, 'undying');

    Statuses.onTurnEnd(unit, { log: [] });

    expect(unit.hp).toBe(1);
    expect(unit.alive).toBe(true);
    expect(unit.deadAt).toBeUndefined();
    expect(Statuses.has(unit, 'undying')).toBe(false);
  });

  it('reflect lethal damage respects undying revive', () => {
    const attacker = createUnit({ hp: 4, hpMax: 20 });
    const target = createUnit({ side: 'enemy' });
    addStatus(attacker, 'undying');
    addStatus(target, 'reflect', { pct: 1, turns: 1 });

    Statuses.afterDamage(attacker, target, { dealt: 4 });

    expect(attacker.hp).toBe(1);
    expect(attacker.alive).toBe(true);
    expect(attacker.deadAt).toBeUndefined();
    expect(Statuses.has(attacker, 'undying')).toBe(false);
  });

  it('venom lethal damage marks targets dead', () => {
    const attacker = createUnit();
    const target = createUnit({ side: 'enemy', hp: 5, hpMax: 30 });
    addStatus(attacker, 'venom', { pct: 1, turns: 1 });

    Statuses.afterDamage(attacker, target, { dealt: 5 });

    expect(target.hp).toBe(0);
    expect(target.alive).toBe(false);
    expect(target.deadAt).toEqual(expect.any(Number));
  });

  it('venom lethal damage triggers undying revive', () => {
    const attacker = createUnit();
    const target = createUnit({ side: 'enemy', hp: 5, hpMax: 30 });
    addStatus(attacker, 'venom', { pct: 1, turns: 1 });
    addStatus(target, 'undying');

    Statuses.afterDamage(attacker, target, { dealt: 5 });

    expect(target.hp).toBe(1);
    expect(target.alive).toBe(true);
    expect(target.deadAt).toBeUndefined();
    expect(Statuses.has(target, 'undying')).toBe(false);
  });

  it('execute kills targets without undying', () => {
    const attacker = createUnit();
    const target = createUnit({ side: 'enemy', hp: 4, hpMax: 40 });
    addStatus(attacker, 'execute', { turns: 1 });

    Statuses.afterDamage(attacker, target, { dealt: 1 });

    expect(target.hp).toBe(0);
    expect(target.alive).toBe(false);
    expect(target.deadAt).toEqual(expect.any(Number));
  });

  it('execute respects undying revive', () => {
    const attacker = createUnit();
    const target = createUnit({ side: 'enemy', hp: 4, hpMax: 40 });
    addStatus(attacker, 'execute', { turns: 1 });
    addStatus(target, 'undying');

    Statuses.afterDamage(attacker, target, { dealt: 1 });

    expect(target.hp).toBe(1);
    expect(target.alive).toBe(true);
    expect(target.deadAt).toBeUndefined();
    expect(Statuses.has(target, 'undying')).toBe(false);
  });
});