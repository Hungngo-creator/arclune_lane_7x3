import { CRYSTAL_X, ENEMY_SPAWN_INTERVAL, ENEMY_START_PADDING, WORLD_WIDTH } from '../src/screens/vinh-da/constants.ts';
import { ENEMY_TEMPLATES } from '../src/screens/vinh-da/enemies.ts';
import { BASE_STRUCTURE_STATS, BUILD_SITES, getBaseLevelStat } from '../src/screens/vinh-da/structures.ts';
import type { StructureType } from '../src/screens/vinh-da/structures.ts';
import { getLivingTerritoryWallBounds, getScaledThreatBudget, getVinhDaWaveConfig, isXInLivingTerritory, spawnWaveEnemy, updateEnemies, updateStructures } from '../src/screens/vinh-da/simulation.ts';
import type { VinhDaSimulationContext, VinhDaSimulationState } from '../src/screens/vinh-da/simulation.ts';
import type { BuildSite, EnemyPortal, PlacedStructure, StructureRuntime } from '../src/screens/vinh-da/types.ts';

const buildSitesById = new Map<string, BuildSite>(BUILD_SITES.map(site => [site.id, site]));

const createContext = (structures: PlacedStructure[], runtimes: Map<string, StructureRuntime>): VinhDaSimulationContext => {
  const structuresById = new Map<string, PlacedStructure>(structures.map(structure => [structure.siteId, structure]));
  const structureSitesByType = new Map<StructureType, Set<string>>();
  for (const structure of structures){
    let siteIds = structureSitesByType.get(structure.type);
    if (!siteIds){
      siteIds = new Set<string>();
      structureSitesByType.set(structure.type, siteIds);
    }
    siteIds.add(structure.siteId);
  }
  const state: VinhDaSimulationState = {
    bloodSealStone: 0,
    carriedDaThach: 0,
    droppedResources: [],
    nextDroppedResourceId: 1,
    baseHp: 10,
    leaderX: CRYSTAL_X,
    enemies: [],
    enemyPortals: [],
    nextEnemyId: 1,
    enemySpawnTimer: 0,
    dayNightPhase: 'day',
    phaseRemainingSeconds: 0,
    leaderAttackCooldown: 0,
    structures: structuresById,
    nightIndex: 1,
    waveThreatBudgetRemaining: 0,
  };
  return {
    state,
    structureSitesByType,
    getBuildSite: siteId => siteId ? buildSitesById.get(siteId) ?? null : null,
    ensureStructureRuntime: structure => runtimes.get(structure.siteId) ?? { cooldown: 0, hp: 0 },
    getStructureMaxHp: () => 10,
    deleteStructure: siteId => structuresById.delete(siteId),
    structureSiteIdsOfType: type => structureSitesByType.get(type) ?? [],
    renderEconomy: jest.fn(),
    renderDroppedResources: jest.fn(),
    renderBuildSite: jest.fn(),
    renderDayNightTimer: jest.fn(),
    removeEnemyElement: jest.fn(),
  };
};

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

  it('scales threat budget by night without mutating the base wave table', () => {
    const baseWave = getVinhDaWaveConfig(5, 1.2);
    expect(baseWave.threatBudget).toBe(20);
    expect(getScaledThreatBudget(baseWave.threatBudget, 1)).toBe(20);
    expect(getScaledThreatBudget(baseWave.threatBudget, 5)).toBeCloseTo(20 * Math.pow(1.05, 4));
    expect(getVinhDaWaveConfig(5, 1.2).threatBudget).toBe(20);
  });
});

describe('Vĩnh Dạ living territory wall bounds', () => {

  test('co lãnh địa theo hai tường ngoài cùng còn sống', () => {
    const runtimes = new Map<string, StructureRuntime>([
      ['wall-left', { cooldown: 0, hp: 8 }],
      ['wall-right', { cooldown: 0, hp: 8 }],
    ]);
    const ctx = createContext([
      { siteId: 'wall-left', type: 'wall', level: 1 },
      { siteId: 'wall-right', type: 'wall', level: 1 },
    ], runtimes);

    const initialBounds = getLivingTerritoryWallBounds(ctx);
    expect(initialBounds).toEqual({ leftX: buildSitesById.get('wall-left')!.x, rightX: buildSitesById.get('wall-right')!.x });
    expect(isXInLivingTerritory(ctx, CRYSTAL_X, initialBounds)).toBe(true);

    runtimes.get('wall-left')!.hp = 0;
    expect(getLivingTerritoryWallBounds(ctx)).toBeNull();
    expect(isXInLivingTerritory(ctx, CRYSTAL_X)).toBe(false);
  });
});

describe('Vĩnh Dạ base branch and leader safeguards', () => {
  it('keeps lv3-lv6 base stats cumulative with lv6 overrides', () => {
    expect(BASE_STRUCTURE_STATS[3]).toMatchObject({ hp: 55, arm: 7, res: 7, healPerSecond: 4 });
    expect(BASE_STRUCTURE_STATS[4]).toMatchObject({ hp: 65, arm: 9, res: 9, healPerSecond: 5 });
    expect(BASE_STRUCTURE_STATS[5]).toMatchObject({ hp: 80, arm: 11, res: 11, healPerSecond: 5, leaderShieldPercent: 0.2 });
    expect(BASE_STRUCTURE_STATS[6]).toMatchObject({ hp: 80, arm: 11, res: 11, healPerSecond: 3, emergencyHealPercent: 0.2, emergencyBaseSelfDamagePercent: 0.1, emergencyCooldownNights: 2 });
    expect(getBaseLevelStat(3, 'attack')).toMatchObject({ hp: 50, arm: 6, res: 6, healPerSecond: 3, buffAtkPercent: 0.05, buffWilPercent: 0.05 });
  });

  it('applies lv5 leader shield once per night and lv6 emergency heal on night cooldown', () => {
    const ctx = createContext([], new Map());
    Object.assign(ctx.state, {
      baseHp: 80,
      baseLevel: 6,
      leaderHp: 8,
      leaderMaxHp: 100,
      dayNightPhase: 'night',
      nightIndex: 3,
    });

    updateStructures(ctx, 0);
    expect(ctx.state.leaderShield).toBe(20);
    expect(ctx.state.leaderHp).toBe(28);
    expect(ctx.state.baseHp).toBe(72);
    expect(ctx.state.leaderEmergencyCooldownUntilNight).toBe(5);

    ctx.state.leaderShield = 0;
    ctx.state.leaderHp = 10;
    updateStructures(ctx, 0);
    expect(ctx.state.leaderShield).toBe(0);
    expect(ctx.state.leaderHp).toBe(10);

    ctx.state.nightIndex = 5;
    updateStructures(ctx, 0);
    expect(ctx.state.leaderShield).toBe(20);
    expect(ctx.state.leaderHp).toBe(30);
    expect(ctx.state.baseHp).toBe(64);
  });
});

  describe('Vĩnh Dạ enemy portal spawning', () => {
  const expectOneOrTwoPortalsPerSide = (portals: EnemyPortal[]): void => {
    for (const side of ['left', 'right'] as const){
      const count = portals.filter(portal => portal.side === side).length;
      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(2);
    }
  };

  it('keeps generated portal layouts to one or two portals on each side', () => {
    const portals: EnemyPortal[] = [
      { id: 'left-portal-1', side: 'left', x: 120 },
      { id: 'left-portal-2', side: 'left', x: 180 },
      { id: 'right-portal-1', side: 'right', x: 920 },
    ];

    expectOneOrTwoPortalsPerSide(portals);
  });

  it('spawns a wave enemy from a portal on the requested side and spends weight budget', () => {
    const ctx = createContext([], new Map());
    Object.assign(ctx.state, {
      dayNightPhase: 'night',
      waveThreatBudgetRemaining: ENEMY_TEMPLATES.madDog.weight,
      enemyPortals: [
        { id: 'left-portal-1', side: 'left', x: 140 },
        { id: 'right-portal-1', side: 'right', x: 910 },
      ] satisfies EnemyPortal[],
    });

    expect(spawnWaveEnemy(ctx, 'right')).toBe(true);

    expect(ctx.state.enemies).toHaveLength(1);
    expect(ctx.state.enemies[0]).toMatchObject({ side: 'right', x: 910, kind: 'madDog' });
    expect(ctx.state.waveThreatBudgetRemaining).toBeCloseTo(0);
  });

  it('lets updateEnemies choose a valid portal instead of alternating sides', () => {
    const ctx = createContext([], new Map());
    Object.assign(ctx.state, {
      dayNightPhase: 'night',
      nextEnemyId: 2,
      enemySpawnTimer: ENEMY_SPAWN_INTERVAL,
      waveThreatBudgetRemaining: ENEMY_TEMPLATES.madDog.weight,
      enemyPortals: [{ id: 'right-portal-1', side: 'right', x: 930 }] satisfies EnemyPortal[],
    });

    updateEnemies(ctx, 0);

    expect(ctx.state.enemies).toHaveLength(1);
    expect(ctx.state.enemies[0]).toMatchObject({ side: 'right', x: 930, kind: 'madDog' });
    expect(ctx.state.waveThreatBudgetRemaining).toBeCloseTo(0);
  });

  it('falls back to map-edge spawning when no valid portal is available', () => {
    const ctx = createContext([], new Map());
    Object.assign(ctx.state, {
      dayNightPhase: 'night',
      nextEnemyId: 2,
      waveThreatBudgetRemaining: ENEMY_TEMPLATES.madDog.weight,
      enemyPortals: [{ id: 'broken-portal' }] satisfies EnemyPortal[],
    });

    expect(spawnWaveEnemy(ctx)).toBe(true);

    expect(ctx.state.enemies).toHaveLength(1);
    expect(ctx.state.enemies[0]).toMatchObject({ side: 'left', x: ENEMY_START_PADDING, kind: 'madDog' });
    expect(ctx.state.enemies[0]?.x).not.toBe(WORLD_WIDTH - ENEMY_START_PADDING);
    expect(ctx.state.waveThreatBudgetRemaining).toBeCloseTo(0);
  });
});