import { ENEMY_TEMPLATES } from '../src/screens/vinh-da/enemies.ts';

describe('Vĩnh Dạ enemy Khai Nguyên 1 templates', () => {
  it('keeps core enemy stats aligned with the defense mode spec', () => {
    expect(ENEMY_TEMPLATES.twisted).toMatchObject({ hp: 3, speed: 40, weight: 1, damage: 1, attackCooldown: 2.5, canFly: false });
    expect(ENEMY_TEMPLATES.crawler).toMatchObject({ hp: 3, speed: 100, weight: 0.9, damage: 1, attackCooldown: 2, canFly: false });
    expect(ENEMY_TEMPLATES.madDog).toMatchObject({ hp: 1.5, speed: 130, weight: 0.3, damage: 1, attackCooldown: 4, canFly: false });
    expect(ENEMY_TEMPLATES.suicideBomber).toMatchObject({ hp: 2, speed: 45, weight: 1.5, damage: 4, attackCooldown: 3, canFly: false });
  });

  it('covers supplemental flying, caster, tank, and Oán Long specs', () => {
    expect(ENEMY_TEMPLATES.mutantBird).toMatchObject({ hp: 1.3, speed: 150, weight: 0.1, damage: 2.5, canFly: true });
    expect(ENEMY_TEMPLATES.darkMage).toMatchObject({ hp: 3, speed: 50, weight: 1, damage: 3.5, attackCooldown: 2, canFly: false });
    expect(ENEMY_TEMPLATES.ironMan).toMatchObject({ hp: 5.5, speed: 30, weight: 2.8, damage: 2, attackCooldown: 1.5, canFly: false });
    expect(ENEMY_TEMPLATES.resentfulDragon).toMatchObject({ hp: 15, speed: 250, weight: 4, damage: 8, attackCooldown: 5, canFly: true });
  });
});
