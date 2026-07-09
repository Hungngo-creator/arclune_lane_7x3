import { describe, expect, test } from '@jest/globals';
import { resolveEnemyUnitsForChess, type BattleUnit } from '../src/screens/chess-strategy-rpg/battle.ts';

function makePlayerUnit(id: string, rank: string): BattleUnit {
  return {
    id,
    name: id,
    rank,
    hp: 100,
    atk: 10,
    wil: 10,
    res: 1,
    arm: 1,
    ae: 10,
    kitLabel: '0 skill, không ult',
  };
}

describe('chess strategy rpg enemy roster', () => {
  test('mirrors player rank distribution and excludes creep ids', () => {
    const player = [
      makePlayerUnit('u1', 'Prime'),
      makePlayerUnit('u2', 'Prime'),
      makePlayerUnit('u3', 'SSR'),
      makePlayerUnit('u4', 'SR'),
    ];

    const enemies = resolveEnemyUnitsForChess(3, 'ABC123XYZ', player);

    expect(enemies).toHaveLength(4);
    const ranks = enemies.map((unit) => unit.rank.toUpperCase());
    expect(ranks.filter((rank) => rank === 'PRIME')).toHaveLength(2);
    expect(ranks.filter((rank) => rank === 'SSR')).toHaveLength(1);
    expect(ranks.filter((rank) => rank === 'SR')).toHaveLength(1);
    expect(enemies.some((unit) => ['creep_1', 'creep_2', 'creep_3'].includes(unit.id))).toBe(false);
  });
});
