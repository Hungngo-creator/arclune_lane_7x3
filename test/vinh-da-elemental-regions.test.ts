import { getElementalRegionAtX } from '../src/screens/vinh-da/elemental-regions.ts';
import { applyElementalRegionEnemyEffect, type VinhDaSimulationContext, type VinhDaSimulationState } from '../src/screens/vinh-da/simulation.ts';
import type { Enemy } from '../src/screens/vinh-da/types.ts';
import { ELEMENTAL_REGION_FIRE_BURN_MAX_HP_PER_SECOND, ELEMENTAL_REGION_FIRE_BURN_SECONDS } from '../src/screens/vinh-da/constants.ts';

describe('Vĩnh Dạ elemental regions', () => {
  test('getElementalRegionAtX trả đúng vùng theo tọa độ và an toàn ngoài vùng', () => {
    const regions = [
      { id: 'dark-left', kind: 'dark' as const, startX: 0, endX: 10 },
      { id: 'fire-mid', kind: 'fire' as const, startX: 20, endX: 30 }
    ];

    expect(getElementalRegionAtX(regions, 0)?.id).toBe('dark-left');
    expect(getElementalRegionAtX(regions, 25)?.id).toBe('fire-mid');
    expect(getElementalRegionAtX(regions, 15)).toBeNull();
    expect(getElementalRegionAtX(undefined, 25)).toBeNull();
  });

  test('vùng fire áp burn nhẹ theo maxHp bằng constant cân bằng', () => {
    const enemy = { id: 1, x: 25, maxHp: 200, hp: 200, statuses: {} } as Enemy;
    const state = { elementalRegions: [{ id: 'fire-mid', kind: 'fire' as const, startX: 20, endX: 30 }] } as VinhDaSimulationState;
    const ctx = { state } as VinhDaSimulationContext;

    applyElementalRegionEnemyEffect(ctx, enemy, 1);

    expect(enemy.statuses?.burnSeconds).toBe(ELEMENTAL_REGION_FIRE_BURN_SECONDS);
    expect(enemy.statuses?.burnDps).toBe(200 * ELEMENTAL_REGION_FIRE_BURN_MAX_HP_PER_SECOND);
  });
});

