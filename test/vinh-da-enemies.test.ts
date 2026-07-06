import { ENEMY_TEMPLATES } from '../src/screens/vinh-da/enemies.ts';
import { getVinhDaWaveConfig } from '../src/screens/vinh-da/simulation.ts';

describe('Vĩnh Dạ enemy Khai Nguyên 1 templates', () => {
  it('keeps core enemy stats aligned with the defense mode spec', () => {
    expect(ENEMY_TEMPLATES.twisted).toMatchObject({ hp: 3, speed: 40, weight: 1, damage: 1, attackCooldown: 2.5, canFly: false });
    expect(ENEMY_TEMPLATES.crawler).toMatchObject({ hp: 3, speed: 100, weight: 0.9, damage: 1, attackCooldown: 2, canFly: false });
    expect(ENEMY_TEMPLATES.madDog).toMatchObject({ hp: 1.5, speed: 130, weight: 0.3, damage: 1, attackCooldown: 4, canFly: false });
    expect(ENEMY_TEMPLATES.suicideBomber).toMatchObject({ hp: 2, speed: 45, weight: 1.5, damage: 2, attackCooldown: 3, canFly: false, deathExplosion: true, contaminationOnHit: true });
  });

  it('covers supplemental flying, caster, tank, and Oán Long specs', () => {
    expect(ENEMY_TEMPLATES.mutantBird).toMatchObject({ hp: 1.3, speed: 150, weight: 0.1, damage: 1, attackRange: 1200, canFly: true });
    expect(ENEMY_TEMPLATES.darkMage).toMatchObject({ hp: 3, speed: 50, weight: 1, damage: 3.5, projectileSpeed: 200, attackCooldown: 2, canFly: false });
    expect(ENEMY_TEMPLATES.ironMan).toMatchObject({ hp: 5.5, speed: 30, weight: 2.8, damage: 2, attackCooldown: 1.5, regen: true, canFly: false });
    expect(ENEMY_TEMPLATES.resentfulDragon).toMatchObject({ hp: 15, speed: 250, groundSpeed: 80, weight: 4, damage: 8, attackCooldown: 5, regen: true, canFly: true });
  });
});

describe('Vĩnh Dạ wave table', () => {
  it('ramps enemy pools by night index, tier, and threat budget', () => {
    const firstNight = getVinhDaWaveConfig(1, 1.1);
    expect(firstNight.threatBudget).toBe(8);
    expect(Object.keys(firstNight.enemyWeights).sort()).toEqual(['crawler', 'madDog', 'twisted']);

    const midWave = getVinhDaWaveConfig(5, 1.2);
    expect(midWave.threatBudget).toBe(20);
    expect(midWave.enemyWeights).toMatchObject({ suicideBomber: 2, darkMage: 1, ironMan: 1 });

    const bossWave = getVinhDaWaveConfig(12, 1.3);
    expect(bossWave.threatBudget).toBe(40);
    expect(bossWave.enemyWeights.resentfulDragon).toBeGreaterThan(0);
  });
});