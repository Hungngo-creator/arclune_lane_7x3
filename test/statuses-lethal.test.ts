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

  it('bleed cannot consume undying outside the death coordinator', () => {
    const unit = createUnit({ hp: 5, hpMax: 100 });
    addStatus(unit, 'bleed', { turns: 1 });
    addStatus(unit, 'undying');

    Statuses.onTurnEnd(unit, { log: [] });

    expect(unit.hp).toBe(0);
    expect(unit.alive).toBe(false);
    expect(Statuses.has(unit, 'undying')).toBe(true);
  });

  it('legacy reflect cannot consume undying outside the death coordinator', () => {
    const attacker = createUnit({ hp: 4, hpMax: 20 });
    const target = createUnit({ side: 'enemy' });
    addStatus(attacker, 'undying');
    addStatus(target, 'reflect', { pct: 1, turns: 1 });

    Statuses.afterDamage(attacker, target, { dealt: 4 });

    expect(attacker.hp).toBe(0);
    expect(attacker.alive).toBe(false);
    expect(Statuses.has(attacker, 'undying')).toBe(true);
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

  it('legacy venom cannot consume undying outside the death coordinator', () => {
    const attacker = createUnit();
    const target = createUnit({ side: 'enemy', hp: 5, hpMax: 30 });
    addStatus(attacker, 'venom', { pct: 1, turns: 1 });
    addStatus(target, 'undying');

    Statuses.afterDamage(attacker, target, { dealt: 5 });

    expect(target.hp).toBe(0);
    expect(target.alive).toBe(false);
    expect(Statuses.has(target, 'undying')).toBe(true);
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

  it('legacy execute cannot consume undying outside the death coordinator', () => {
    const attacker = createUnit();
    const target = createUnit({ side: 'enemy', hp: 4, hpMax: 40 });
    addStatus(attacker, 'execute', { turns: 1 });
    addStatus(target, 'undying');

    Statuses.afterDamage(attacker, target, { dealt: 1 });

    expect(target.hp).toBe(0);
    expect(target.alive).toBe(false);
    expect(Statuses.has(target, 'undying')).toBe(true);
  });

  it('divine-nature blocks buff/debuff/mark statuses from all sources', () => {
    const unit = createUnit({ id: 'lau_khac_ma_chu', tags: ['divine-nature'] });
    const buff = makeStatusEffect('haste', { turns: 2 });
    const debuff = makeStatusEffect('sleep', { turns: 1 });
    const mark = { id: 'huyet_an', kind: 'mark', tag: 'mark', stacks: 1, maxStacks: 5, sourceUnitId: 'enemy-controller' } as const;
    if (!buff || !debuff) throw new Error('status factory unavailable');

    Statuses.add(unit, { ...buff, sourceUnitId: unit.id });
    Statuses.add(unit, { ...buff, sourceUnitId: 'ally-buffer' });
    Statuses.add(unit, { ...debuff, sourceUnitId: 'enemy-controller' });
    Statuses.add(unit, mark);

    expect(Statuses.has(unit, 'haste')).toBe(false);
    expect(Statuses.has(unit, 'sleep')).toBe(false);
    expect(Statuses.has(unit, 'huyet_an')).toBe(false);
  });
 });