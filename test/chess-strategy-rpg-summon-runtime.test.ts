import { describe, expect, test } from '@jest/globals';
import { resolveSummonerSkillSpawn } from '../src/screens/chess-strategy-rpg/match.ts';

describe('chess strategy rpg summon runtime', () => {
  const caster = {
    id: 'player-summoner',
    label: 'P1',
    classId: 'summoner',
    team: 'player' as const,
    x: 5,
    y: 5,
    hp: 100,
    maxHp: 100,
    atk: 20,
    arm: 10,
    rage: 0,
    maxRage: 100,
    skillCost: 4,
    moveRange: 3,
    basicRange: 2,
    zocImmune: false,
    slotIndex: 0,
    isSummon: false,
  };

  test('spawns summon on adjacent playable tile', () => {
    const resolved = resolveSummonerSkillSpawn({
      caster,
      playable: new Set(['5,5', '6,5', '5,6']),
      occupied: new Set(['5,5']),
      teamSummons: [],
      spawnedOrder: 1,
    });

    expect(resolved.created).not.toBeNull();
    expect(resolved.created?.x).toBe(6);
    expect(resolved.created?.y).toBe(5);
    expect(resolved.replacedId).toBeNull();
    expect(resolved.nextSpawnedOrder).toBe(2);
  });

  test('replaces lowest hp summon when over cap', () => {
    const resolved = resolveSummonerSkillSpawn({
      caster,
      playable: new Set(['5,5', '6,5']),
      occupied: new Set(['5,5']),
      spawnedOrder: 4,
      teamSummons: [
        { ...caster, id: 's-1', isSummon: true, slotIndex: -1, hp: 30, maxHp: 100, x: 1, y: 1, zocImmune: true },
        { ...caster, id: 's-2', isSummon: true, slotIndex: -1, hp: 80, maxHp: 100, x: 2, y: 2, zocImmune: true },
        { ...caster, id: 's-3', isSummon: true, slotIndex: -1, hp: 70, maxHp: 100, x: 3, y: 3, zocImmune: true },
      ],
    });

    expect(resolved.created?.id).toBe('player-summoner-summon-4');
    expect(resolved.replacedId).toBe('s-1');
  });
});
