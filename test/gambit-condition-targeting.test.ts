import { evaluateGambitLogic } from '../src/ai.ts';

describe('gambit condition targeting thresholds', () => {
  it('ally_lowest_hp checks teammate instead of self and respects threshold', () => {
    const self = {
      id: 'unit_self',
      iid: 1,
      side: 'ally',
      alive: true,
      hp: 90,
      hpMax: 100,
      fury: 0,
      furyMax: 100,
      statuses: [],
    };
    const ally = {
      id: 'unit_ally',
      iid: 2,
      side: 'ally',
      alive: true,
      hp: 20,
      hpMax: 100,
      fury: 0,
      furyMax: 100,
      statuses: [],
    };
    const enemy = {
      id: 'enemy_a',
      iid: 11,
      side: 'enemy',
      alive: true,
      hp: 80,
      hpMax: 100,
      fury: 0,
      furyMax: 100,
      statuses: [],
    };

    const Game = {
      tokens: [self, ally, enemy],
      runtime: {
        unitProgressById: new Map([
          ['unit_self', {
            gambit: [
              { condition: 'ally_lowest_hp', threshold: 30, action: 'skill3', enabled: true },
            ],
          }],
        ]),
      },
      meta: new Map(),
    };

    const decision = evaluateGambitLogic(Game as never, self as never);
    expect(decision.action).toBe('skill3');
    expect(decision.slotIndex).toBe(0);
  });

  it('enemy_lowest_hp respects threshold and falls back when unmet', () => {
    const self = {
      id: 'unit_self',
      iid: 1,
      side: 'ally',
      alive: true,
      hp: 90,
      hpMax: 100,
      fury: 0,
      furyMax: 100,
      statuses: [],
    };
    const enemyA = {
      id: 'enemy_a',
      iid: 11,
      side: 'enemy',
      alive: true,
      hp: 40,
      hpMax: 100,
      fury: 0,
      furyMax: 100,
      statuses: [],
    };
    const enemyB = {
      id: 'enemy_b',
      iid: 12,
      side: 'enemy',
      alive: true,
      hp: 70,
      hpMax: 100,
      fury: 0,
      furyMax: 100,
      statuses: [],
    };

    const Game = {
      tokens: [self, enemyA, enemyB],
      runtime: {
        unitProgressById: new Map([
          ['unit_self', {
            gambit: [
              { condition: 'enemy_lowest_hp', threshold: 30, action: 'skill1', enabled: true },
              { condition: 'always', action: 'basic', enabled: true },
            ],
          }],
        ]),
      },
      meta: new Map(),
    };

    const decision = evaluateGambitLogic(Game as never, self as never);
    expect(decision.action).toBe('basic');
    expect(decision.slotIndex).toBe(1);
  });
});
