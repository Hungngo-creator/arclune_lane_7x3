import { describe, expect, test } from '@jest/globals';
import { chooseBestCombatAction } from '../src/screens/chess-strategy-rpg/match.ts';

describe('chess strategy rpg ai action scoring', () => {
  test('ưu tiên ultimate khi đủ rage và có thể kết liễu mục tiêu', () => {
    const actor = {
      id: 'enemy-1',
      label: 'E1',
      classId: 'Mage',
      team: 'enemy',
      x: 10,
      y: 10,
      hp: 100,
      maxHp: 100,
      atk: 30,
      arm: 2,
      rage: 100,
      maxRage: 100,
      skillCost: 4,
      moveRange: 3,
      basicRange: 2,
      zocImmune: false,
      slotIndex: 0,
    };
    const enemies = [{
      id: 'player-1',
      label: 'P1',
      classId: 'Warrior',
      team: 'player',
      x: 11,
      y: 10,
      hp: 30,
      maxHp: 120,
      atk: 20,
      arm: 4,
      rage: 0,
      maxRage: 100,
      skillCost: 4,
      moveRange: 3,
      basicRange: 1,
      zocImmune: false,
      slotIndex: 0,
    }];

    const picked = chooseBestCombatAction({
      actor,
      enemies,
      teamAe: 8,
      aiProfile: 'Aggressive',
      canUse: (command) => command !== 'move' && command !== 'endTurn',
    });

    expect(picked.action).toBe('castUlt');
    expect(picked.target?.id).toBe('player-1');
  });

  test('fallback skipAction khi không có mục tiêu trong tầm', () => {
    const actor = {
      id: 'enemy-2',
      label: 'E2',
      classId: 'Ranger',
      team: 'enemy',
      x: 0,
      y: 0,
      hp: 80,
      maxHp: 80,
      atk: 15,
      arm: 1,
      rage: 10,
      maxRage: 100,
      skillCost: 4,
      moveRange: 3,
      basicRange: 1,
      zocImmune: false,
      slotIndex: 1,
    };
    const enemies = [{
      id: 'player-2',
      label: 'P2',
      classId: 'Tanker',
      team: 'player',
      x: 9,
      y: 9,
      hp: 200,
      maxHp: 200,
      atk: 10,
      arm: 5,
      rage: 0,
      maxRage: 100,
      skillCost: 4,
      moveRange: 2,
      basicRange: 1,
      zocImmune: false,
      slotIndex: 1,
    }];

    const picked = chooseBestCombatAction({
      actor,
      enemies,
      teamAe: 0,
      aiProfile: 'Neutral',
      canUse: (command) => command === 'basicAttack',
    });

    expect(picked.action).toBe('skipAction');
    expect(picked.target).toBeNull();
  });
});
