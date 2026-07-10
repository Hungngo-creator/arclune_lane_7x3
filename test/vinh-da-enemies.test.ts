import { CRYSTAL_X, ENEMY_SPAWN_INTERVAL, ENEMY_START_PADDING, WORLD_WIDTH } from '../src/screens/vinh-da/constants.ts';
import { ENEMY_TEMPLATES } from '../src/screens/vinh-da/enemies.ts';
import { BASE_STRUCTURE_STATS, BUILD_SITES, getBaseLevelStat, getStructureLevelStat } from '../src/screens/vinh-da/structures.ts';
import type { StructureType } from '../src/screens/vinh-da/structures.ts';
import { ESCORT_SEAL_POINTS, ESCORT_START_NIGHT_INDEX, ESCORT_START_RESOURCE_COST, canStartEscort, damageEnemy, getBaseX, getLivingTerritoryWallBounds, getScaledThreatBudget, getVinhDaWaveConfig, isXInLivingTerritory, removeEnemyAt, spawnEnemy, spawnWaveEnemy, startEscort, updateDayNightTimer, updateEnemies, updateStructures } from '../src/screens/vinh-da/simulation.ts';
import type { VinhDaSimulationContext, VinhDaSimulationState } from '../src/screens/vinh-da/simulation.ts';
import type { BuildSite, EnemyPortal, PlacedStructure, StructureRuntime } from '../src/screens/vinh-da/types.ts';

const buildSitesById = new Map<string, BuildSite>(BUILD_SITES.map(site => [site.id, site]));

const createContext = (structures: PlacedStructure[], runtimes: Map<string, StructureRuntime>, extraBuildSites: BuildSite[] = []): VinhDaSimulationContext => {
  const scopedBuildSites = new Map<string, BuildSite>([...buildSitesById, ...extraBuildSites.map(site => [site.id, site] as const)]);
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
    getBuildSite: siteId => siteId ? scopedBuildSites.get(siteId) ?? null : null,
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
    expect(ENEMY_TEMPLATES.twisted).toMatchObject({ hp: 3, atk: 1, wil: 0, arm: 0, res: 0, speed: 40, weight: 1, attackRange: 28, attackCooldown: 2.5, attackShape: 'melee', statusOnHit: 'bleed', reward: 1, canFly: false });
    expect(ENEMY_TEMPLATES.crawler).toMatchObject({ hp: 3, atk: 1, wil: 0, arm: 0, res: 0, speed: 100, weight: 0.9, attackRange: 20, attackCooldown: 2, attackShape: 'melee', statusOnHit: 'bleed', reward: 1, canFly: false });
    expect(ENEMY_TEMPLATES.madDog).toMatchObject({ hp: 1.5, atk: 1, wil: 0, arm: 0, res: 0, speed: 130, weight: 0.3, attackRange: 18, attackCooldown: 4, attackShape: 'melee', statusOnHit: 'contamination', reward: 1, canFly: false });
    expect(ENEMY_TEMPLATES.suicideBomber).toMatchObject({ hp: 2, atk: 2, wil: 2, arm: 2, res: 2, speed: 45, weight: 1.5, attackRange: 28, attackCooldown: 3, attackShape: 'melee', statusOnHit: 'contamination', reward: 2, canFly: false, deathExplosion: true, contaminationOnHit: true });
  });

  it('covers supplemental flying, caster, tank, and Oán Long specs', () => {
    expect(ENEMY_TEMPLATES.mutantBird).toMatchObject({ hp: 1.3, atk: 1, wil: 1, arm: 0, res: 0, speed: 150, weight: 0.1, attackRange: 1200, attackCooldown: 0, attackShape: 'flyby', statusOnHit: null, reward: 1, canFly: true });
    expect(ENEMY_TEMPLATES.darkMage).toMatchObject({ hp: 3, atk: 1, wil: 3.5, arm: 1, res: 1, speed: 50, weight: 1, attackRange: 200, projectileSpeed: 200, attackCooldown: 2, attackShape: 'projectile', statusOnHit: 'contamination', reward: 2, canFly: false });
    expect(ENEMY_TEMPLATES.ironMan).toMatchObject({ hp: 5.5, atk: 2, wil: 2, arm: 4, res: 3, speed: 30, weight: 2.8, attackRange: 26, attackCooldown: 1.5, attackShape: 'melee', statusOnHit: null, reward: 3, regen: true, canFly: false });
    expect(ENEMY_TEMPLATES.apostle).toMatchObject({ hp: 5, atk: 2, wil: 2, arm: 2, res: 2, weight: 1, attackRange: 150, projectileSpeed: 150, attackCooldown: 3, attackShape: 'projectile', statusOnHit: 'contamination', reward: 0, hasCommanderAura: true });
    expect(ENEMY_TEMPLATES.apostle.speed).toBeCloseTo(55);
    expect(ENEMY_TEMPLATES.resentfulDragon).toMatchObject({ hp: 15, atk: 6, wil: 8, arm: 7, res: 7, speed: 250, groundSpeed: 80, weight: 4, attackRange: 500, attackCooldown: 5, attackShape: 'line', statusOnHit: null, reward: 8, regen: true, canFly: true, dragonDestroyStructure: true, ultimate: 'dragon-rage' });
  });
});

describe('Vĩnh Dạ enemy behavior locks', () => {
  const placeEnemy = (ctx: VinhDaSimulationContext, kind: Parameters<typeof spawnEnemy>[2], x: number, side: 'left' | 'right' = 'left'): void => {
    Object.assign(ctx.state, { dayNightPhase: 'night', leaderAttackCooldown: 999 });
    spawnEnemy(ctx, side, kind, x, true);
    ctx.state.enemies[0]!.attackCooldown = 0;
  };

  it('drops typed resources when an enemy dies to player or structures during night', () => {
    const ctx = createContext([], new Map());
    Object.assign(ctx.state, { baseLevel: 1, dayNightPhase: 'night', nightIndex: 4, mapTier: 1.2 });
    spawnEnemy(ctx, 'left', 'twisted', CRYSTAL_X - 50, true);

    const enemy = ctx.state.enemies[0]!;
    expect(damageEnemy(ctx, enemy, 999)).toBe(true);
    removeEnemyAt(ctx, ctx.state.enemies.indexOf(enemy), true);

    expect(ctx.state.enemies).toHaveLength(0);
    expect(ctx.state.droppedResources).toHaveLength(1);
    expect(ctx.state.droppedResources[0]).toMatchObject({ kind: 'darkStone', resourceId: 'darkStone', tier: 1.2, amount: expect.any(Number), x: CRYSTAL_X - 50 });
    expect(ctx.state.droppedResources[0]!.amount).toBeGreaterThan(0);
    expect(ctx.renderDroppedResources).toHaveBeenCalledTimes(1);
  });

  it('clears leftover night enemies at daybreak without granting rewards before upkeep and apostles', () => {
    const ctx = createContext([], new Map());
    Object.assign(ctx.state, {
      baseLevel: 1,
      bloodSealStone: 5,
      contamination: 5,
      dayNightPhase: 'night',
      phaseRemainingSeconds: 1,
      nightIndex: 2,
    });
    spawnEnemy(ctx, 'left', 'twisted', CRYSTAL_X - 50, true);
    spawnEnemy(ctx, 'left', 'suicideBomber', CRYSTAL_X - 40, true);

    updateDayNightTimer(ctx, 1);

    expect(ctx.state.dayNightPhase).toBe('day');
    expect(ctx.state.enemies).toHaveLength(1);
    expect(ctx.state.enemies[0]!.kind).toBe('apostle');
    expect(ctx.state.bloodSealStone).toBe(0);
    expect(ctx.state.baseEnergyShortage).toBe(false);
    expect(ctx.state.droppedResources).toHaveLength(0);
    expect(ctx.state.nextDroppedResourceId).toBe(1);
    expect(ctx.state.contamination).toBe(0);
    expect(ctx.renderDroppedResources).not.toHaveBeenCalled();
  });

  it('melee enemies hit a blocking wall before the base', () => {
    const wallX = buildSitesById.get('wall-left')!.x;
    const runtimes = new Map<string, StructureRuntime>([['wall-left', { cooldown: 0, hp: 10 }]]);
    const ctx = createContext([{ siteId: 'wall-left', type: 'wall', level: 1 }], runtimes);
    placeEnemy(ctx, 'crawler', wallX - 10);

    updateEnemies(ctx, 0);

    expect(runtimes.get('wall-left')!.hp).toBeLessThan(10);
    expect(ctx.state.baseHp).toBe(10);
  });

  it('flying enemies ignore walls and strike the leader according to distance bands', () => {
    const runtimes = new Map<string, StructureRuntime>([['wall-left', { cooldown: 0, hp: 10 }]]);
    const ctx = createContext([{ siteId: 'wall-left', type: 'wall', level: 1 }], runtimes);
    Object.assign(ctx.state, { leaderHp: 20, leaderMaxHp: 20, leaderX: CRYSTAL_X });
    placeEnemy(ctx, 'mutantBird', CRYSTAL_X - 800);

    updateEnemies(ctx, 0);

    expect(runtimes.get('wall-left')!.hp).toBe(10);
    expect(ctx.state.leaderHp).toBe(18);
    expect(ctx.state.enemies).toHaveLength(0);
  });

  it('Dark Mage stores three orbs over cadence before firing a projectile burst', () => {
    const ctx = createContext([], new Map());
    placeEnemy(ctx, 'darkMage', CRYSTAL_X - 100);

    updateEnemies(ctx, 2);
    expect(ctx.state.enemies[0]!.mageOrbs).toBe(1);
    expect(ctx.state.baseHp).toBe(10);

    updateEnemies(ctx, 4);
    expect(ctx.state.enemies[0]!.mageOrbs).toBe(0);
    expect(ctx.state.baseHp).toBe(0);
  });

  it('Suicide Bomber contaminates on hit and explodes across base, structures, and enemies in its radius', () => {
    const wallX = buildSitesById.get('wall-left')!.x;
    const runtimes = new Map<string, StructureRuntime>([['wall-left', { cooldown: 0, hp: 10 }]]);
    const ctx = createContext([{ siteId: 'wall-left', type: 'wall', level: 1 }], runtimes);
    placeEnemy(ctx, 'suicideBomber', wallX - 10);

    updateEnemies(ctx, 0);
    expect(ctx.state.contamination).toBe(1);

    const bomber = ctx.state.enemies[0]!;
    bomber.x = CRYSTAL_X;
    placeEnemy(ctx, 'twisted', CRYSTAL_X + 10);
    const nearby = ctx.state.enemies[1]!;
    damageEnemy(ctx, bomber, 999);
    const bomberIndex = ctx.state.enemies.indexOf(bomber);
    expect(bomberIndex).toBeGreaterThanOrEqual(0);
    const beforeBaseHp = ctx.state.baseHp;
    updateEnemies(ctx, 0);

    expect(ctx.state.baseHp).toBeLessThan(beforeBaseHp);
    expect(ctx.state.enemies).not.toContain(nearby);
  });

  it('Iron Man regenerates only on its five second interval', () => {
    const ctx = createContext([], new Map());
    Object.assign(ctx.state, { mapTier: 1.2 });
    placeEnemy(ctx, 'ironMan', CRYSTAL_X - 200);
    const ironMan = ctx.state.enemies[0]!;
    ironMan.hp = 1;

    updateEnemies(ctx, 4.9);
    expect(ironMan.hp).toBe(1);

    updateEnemies(ctx, 0.1);
    expect(ironMan.hp).toBe(3);
  });

  it('Apostle aura does not stack and apostles prefer wall, structure, then base', () => {
    const wallX = buildSitesById.get('wall-left')!.x;
    const runtimes = new Map<string, StructureRuntime>([
      ['wall-left', { cooldown: 0, hp: 10 }],
      ['ground-left-1', { cooldown: 0, hp: 10 }],
    ]);
    const ctx = createContext([
      { siteId: 'wall-left', type: 'wall', level: 1 },
      { siteId: 'ground-left-1', type: 'watchtower', level: 1 },
    ], runtimes);
    placeEnemy(ctx, 'apostle', wallX - 10);
    placeEnemy(ctx, 'apostle', wallX - 12);
    placeEnemy(ctx, 'twisted', wallX - 14);

    updateEnemies(ctx, 0);
    expect(ctx.state.enemies.find(enemy => enemy.kind === 'apostle')!.apostleState).toBe('assaultStructure');
    expect(runtimes.get('wall-left')!.hp).toBeLessThan(10);

    const wallHpAfterApostles = runtimes.get('wall-left')!.hp;
    updateEnemies(ctx, 2.5);
    expect(wallHpAfterApostles - runtimes.get('wall-left')!.hp).toBeCloseTo(ENEMY_TEMPLATES.twisted.damage * 1.05 * (100 / 101), 3);

    ctx.state.structures.delete('wall-left');
    (ctx.structureSitesByType.get('wall') as Set<string>).delete('wall-left');
    ctx.state.enemies = ctx.state.enemies.filter(enemy => enemy.kind === 'apostle');
    ctx.state.enemies[0]!.attackCooldown = 0;
    ctx.state.enemies[0]!.x = buildSitesById.get('ground-left-1')!.x - 10;
    updateEnemies(ctx, 0);
    expect(ctx.state.enemies[0]!.apostleState).toBe('assaultStructure');
    expect(runtimes.get('ground-left-1')!.statuses?.contaminationStacks).toBe(1);

    ctx.state.structures.clear();
    ctx.state.enemies[0]!.attackCooldown = 0;
    ctx.state.enemies[0]!.x = CRYSTAL_X - ENEMY_TEMPLATES.apostle.attackRange;
    updateEnemies(ctx, 0);
    expect(ctx.state.enemies[0]!.apostleState).toBe('assaultBase');
    expect(ctx.state.baseHp).toBeLessThan(10);
  });

  it('Resentful Dragon destroys structures by level count and gates ultimate by cooldown', () => {
    const runtimes = new Map<string, StructureRuntime>([['ground-left-1', { cooldown: 0, hp: 100 }]]);
    const ctx = createContext([{ siteId: 'ground-left-1', type: 'watchtower', level: 2 }], runtimes);
    const structureX = buildSitesById.get('ground-left-1')!.x;
    placeEnemy(ctx, 'resentfulDragon', structureX - 250);
    const dragon = ctx.state.enemies[0]!;
    dragon.dragonUltimateCooldown = 999;

    updateEnemies(ctx, 0);
    expect(runtimes.get('ground-left-1')!.dragonHitCount).toBe(1);
    expect(ctx.state.structures.has('ground-left-1')).toBe(true);

    dragon.attackCooldown = 0;
    dragon.dragonDestroyCooldown = 0;
    updateEnemies(ctx, 0);
    expect(ctx.state.structures.has('ground-left-1')).toBe(false);

    dragon.x = CRYSTAL_X - 100;
    dragon.attackCooldown = 999;
    dragon.dragonUltimateCooldown = 0;
    ctx.state.baseHp = 100;
    const beforeBaseHp = ctx.state.baseHp;
    updateEnemies(ctx, 0);
    expect(ctx.state.baseHp).toBeCloseTo(beforeBaseHp - dragon.wil * 2);
    expect(dragon.dragonUltimateCooldown).toBe(20);
  });
});

describe('Vĩnh Dạ escort relocation', () => {
  it('keeps the base position fallback at the original crystal coordinate', () => {
    const ctx = createContext([], new Map());

    expect(getBaseX(ctx.state)).toBe(CRYSTAL_X);
  });

  it('starts escort only after resource and night gates are satisfied', () => {
    const ctx = createContext([], new Map());
    Object.assign(ctx.state, { bloodSealStone: ESCORT_START_RESOURCE_COST, nightIndex: ESCORT_START_NIGHT_INDEX });

    expect(canStartEscort(ctx)).toBe(true);
    expect(startEscort(ctx)).toBe(true);
    expect(ctx.state.dayNightPhase).toBe('escort');
    expect(ctx.state.bloodSealStone).toBe(0);
    expect(getBaseX(ctx.state)).toBe(CRYSTAL_X);
  });

  it('retargets ground enemies to the moving base during escort', () => {
    const ctx = createContext([], new Map());
    Object.assign(ctx.state, { dayNightPhase: 'escort', baseX: CRYSTAL_X + 300, leaderAttackCooldown: 999 });
    spawnEnemy(ctx, 'left', 'twisted', CRYSTAL_X + 300 - ENEMY_TEMPLATES.twisted.attackRange, true);
    ctx.state.enemies[0]!.attackCooldown = 0;

    updateEnemies(ctx, 0);

    expect(ctx.state.baseHp).toBeLessThan(10);
  });

  it('moves territory bounds with the escorted base and clears the old zone after sealing', () => {
    const leftSite: BuildSite = { id: 'escort-wall-left', x: CRYSTAL_X + 220, kind: 'wall', allowed: ['wall'] };
    const rightSite: BuildSite = { id: 'escort-wall-right', x: CRYSTAL_X + 620, kind: 'wall', allowed: ['wall'] };
    const runtimes = new Map<string, StructureRuntime>([
      [leftSite.id, { cooldown: 0, hp: 8 }],
      [rightSite.id, { cooldown: 0, hp: 8 }],
    ]);
    const ctx = createContext([
      { siteId: leftSite.id, type: 'wall', level: 1 },
      { siteId: rightSite.id, type: 'wall', level: 1 },
    ], runtimes, [leftSite, rightSite]);
    Object.assign(ctx.state, { dayNightPhase: 'escort', baseX: CRYSTAL_X + 400, contamination: 4, baseStatuses: { contaminationStacks: 4 } });
    (ctx.structureSitesByType.get('wall') as Set<string>).add(leftSite.id);
    (ctx.structureSitesByType.get('wall') as Set<string>).add(rightSite.id);

    expect(isXInLivingTerritory(ctx, getBaseX(ctx.state))).toBe(true);
    expect(isXInLivingTerritory(ctx, CRYSTAL_X)).toBe(false);

    ctx.state.baseX = ESCORT_SEAL_POINTS[0] - 1;
    updateDayNightTimer(ctx, 1);

    expect(ctx.state.securedSealPoints).toContain(ESCORT_SEAL_POINTS[0]);
    expect(ctx.state.contamination).toBe(0);
    expect(ctx.state.baseStatuses?.contaminationStacks).toBe(0);
    expect(ctx.state.escortSealIndex).toBe(1);
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
  test('áp elemental ally buff cho base và structure trong lãnh địa khi đủ tường trái/phải', () => {
    const insideSite: BuildSite = { id: 'inside-tower', x: CRYSTAL_X + 20, kind: 'rock', allowed: [] };
    const runtimes = new Map<string, StructureRuntime>([
      ['wall-left', { cooldown: 0, hp: 8 }],
      ['wall-right', { cooldown: 0, hp: 8 }],
      ['inside-tower', { cooldown: 0, hp: 10 }],
    ]);
    const ctx = createContext([
      { siteId: 'wall-left', type: 'wall', level: 1 },
      { siteId: 'wall-right', type: 'wall', level: 1 },
      { siteId: 'inside-tower', type: 'elementalTower', level: 1, element: 'Thổ' },
    ], runtimes, [insideSite]);
    spawnEnemy(ctx, 'left', 'twisted', insideSite.x, true);

    updateStructures(ctx, 0);

    expect(ctx.state.baseStatuses?.elementalAllyBuffSeconds).toBeGreaterThan(0);
    expect(ctx.state.baseStatuses?.elementalArmBonusPercent).toBeCloseTo(0.07);
    expect(runtimes.get('inside-tower')!.statuses?.elementalResBonusPercent).toBeCloseTo(0.07);
  });

  test('không áp elemental ally buff khi một tường biên đã vỡ', () => {
    const insideSite: BuildSite = { id: 'inside-tower', x: CRYSTAL_X + 20, kind: 'rock', allowed: [] };
    const runtimes = new Map<string, StructureRuntime>([
      ['wall-left', { cooldown: 0, hp: 0 }],
      ['wall-right', { cooldown: 0, hp: 8 }],
      ['inside-tower', { cooldown: 0, hp: 10 }],
    ]);
    const ctx = createContext([
      { siteId: 'wall-left', type: 'wall', level: 1 },
      { siteId: 'wall-right', type: 'wall', level: 1 },
      { siteId: 'inside-tower', type: 'elementalTower', level: 1, element: 'Thổ' },
    ], runtimes, [insideSite]);
    spawnEnemy(ctx, 'left', 'twisted', insideSite.x, true);

    updateStructures(ctx, 0);

    expect(getLivingTerritoryWallBounds(ctx)).toBeNull();
    expect(ctx.state.baseStatuses?.elementalAllyBuffSeconds).toBeUndefined();
    expect(runtimes.get('inside-tower')!.statuses?.elementalResBonusPercent).toBeUndefined();
  });

  test('church/base heal không áp khi base nằm ngoài lãnh địa sống', () => {
    const churchSite: BuildSite = { id: 'inside-church', x: CRYSTAL_X + 20, kind: 'rock', allowed: [] };
    const validRuntimes = new Map<string, StructureRuntime>([
      ['wall-left', { cooldown: 0, hp: 8 }],
      ['wall-right', { cooldown: 0, hp: 8 }],
      ['inside-church', { cooldown: 0, hp: 14, prayerTimer: 0 }],
    ]);
    const validCtx = createContext([
      { siteId: 'wall-left', type: 'wall', level: 1 },
      { siteId: 'wall-right', type: 'wall', level: 1 },
      { siteId: 'inside-church', type: 'church', level: 1 },
    ], validRuntimes, [churchSite]);
    validCtx.state.baseHp = 10;
    updateStructures(validCtx, 0);
    expect(validCtx.state.baseHp).toBeGreaterThan(10);

    const invalidRuntimes = new Map<string, StructureRuntime>([
      ['wall-right', { cooldown: 0, hp: 8 }],
      ['inside-church', { cooldown: 0, hp: 14, prayerTimer: 0 }],
    ]);
    const invalidCtx = createContext([
      { siteId: 'wall-right', type: 'wall', level: 1 },
      { siteId: 'inside-church', type: 'church', level: 1 },
    ], invalidRuntimes, [churchSite]);
    Object.assign(invalidCtx.state, { baseHp: 10, baseLevel: 1 });
    updateStructures(invalidCtx, 1);
    expect(invalidCtx.state.baseHp).toBe(10);
  });

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

describe('Vĩnh Dạ Đao Phủ structure', () => {
  const placeExecutionBlade = (level: number): VinhDaSimulationContext => {
    const siteId = 'rock-left-1';
    const runtimes = new Map<string, StructureRuntime>([[siteId, { cooldown: 0, hp: 12 }]]);
    const ctx = createContext([{ siteId, type: 'executionBlade', level, branchLv3: level >= 3 ? 'spike' : undefined }], runtimes);
    Object.assign(ctx.state, { dayNightPhase: 'night' });
    return ctx;
  };

  it('lv1 hits at most five targets and treats ARM/RES <= 1 as ignored defense', () => {
    const ctx = placeExecutionBlade(1);
    const x = buildSitesById.get('rock-left-1')!.x;
    for (let index = 0; index < 6; index += 1) spawnEnemy(ctx, 'left', 'twisted', x + index, true);
    ctx.state.enemies.forEach(enemy => { enemy.hp = 10; enemy.maxHp = 10; enemy.arm = 1; enemy.res = 1; });

    updateStructures(ctx, 0);

    const damaged = ctx.state.enemies.filter(enemy => enemy.hp === 7);
    expect(damaged).toHaveLength(5);
    expect(ctx.state.enemies.filter(enemy => enemy.hp === 10)).toHaveLength(1);
  });

  it('lv2 uses increased damage and longer cooldown from the spec', () => {
    const ctx = placeExecutionBlade(2);
    const x = buildSitesById.get('rock-left-1')!.x;
    spawnEnemy(ctx, 'left', 'ironMan', x, true);
    const enemy = ctx.state.enemies[0]!;
    enemy.hp = 10;
    enemy.maxHp = 10;
    enemy.arm = 1;
    enemy.res = 2;

    updateStructures(ctx, 0);

    expect(enemy.hp).toBeCloseTo(5.049, 3);
    expect(ctx.ensureStructureRuntime(ctx.state.structures.get('rock-left-1')!).cooldown).toBeCloseTo(6.5);
  });

  it('lv3 marks the Nguyên Tố Hóa branch with an element while preserving blade targeting', () => {
    const ctx = placeExecutionBlade(3);
    const x = buildSitesById.get('rock-left-1')!.x;
    spawnEnemy(ctx, 'left', 'twisted', x, true);
    ctx.state.enemies[0]!.hp = 20;
    ctx.state.enemies[0]!.maxHp = 20;

    updateStructures(ctx, 0);

    expect(getStructureLevelStat('executionBlade', 3).element).toBe('Hỏa');
    expect(ctx.state.enemies[0]!.statuses?.burnSeconds).toBeGreaterThan(0);
    expect(ctx.state.enemies[0]!.hp).toBeLessThan(ctx.state.enemies[0]!.maxHp);
  });
});

describe('Vĩnh Dạ base branch and leader safeguards', () => {
  it('keeps lv3-lv6 base stats cumulative with lv6 overrides', () => {
    expect(BASE_STRUCTURE_STATS[3]).toMatchObject({ hp: 55, arm: 7, res: 7, healPerSecond: 4 });
    expect(BASE_STRUCTURE_STATS[5]).toMatchObject({ hp: 80, arm: 11, res: 11, healPerSecond: 4, allyHealPerSecond: 2, leaderHealMaxHpPercentPerSecond: 0.01, leaderShieldPercent: 0.2 });
    expect(BASE_STRUCTURE_STATS[6]).toMatchObject({ hp: 80, arm: 11, res: 11, healPerSecond: 4, allyHealPerSecond: 5, emergencyHealPercent: 0.2, emergencyBaseSelfDamagePercent: 0.1, emergencyCooldownNights: 2 });
    expect(getBaseLevelStat(3, 'attack')).toMatchObject({ hp: 50, arm: 5, res: 5, healPerSecond: 3, allyAtkBonus: 2 });
  });

  it('applies lv5 leader shield once per night and lv6 emergency heal on night cooldown', () => {
    const ctx = createContext([
      { siteId: 'wall-left', type: 'wall', level: 1 },
      { siteId: 'wall-right', type: 'wall', level: 1 },
    ], new Map<string, StructureRuntime>([
      ['wall-left', { cooldown: 0, hp: 8 }],
      ['wall-right', { cooldown: 0, hp: 8 }],
    ]));
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
    expect(ctx.state.leaderEmergencyCooldownUntilNight).toBe(6);

    ctx.state.leaderShield = 0;
    ctx.state.leaderHp = 10;
    updateStructures(ctx, 0);
    expect(ctx.state.leaderShield).toBe(0);
    expect(ctx.state.leaderHp).toBe(10);

    ctx.state.nightIndex = 5;
    updateStructures(ctx, 0);
    expect(ctx.state.leaderShield).toBe(20);
    expect(ctx.state.leaderHp).toBe(10);
    expect(ctx.state.baseHp).toBe(72);

    ctx.state.leaderShield = 0;
    ctx.state.leaderHp = 10;
    ctx.state.nightIndex = 6;
    updateStructures(ctx, 0);
    expect(ctx.state.leaderShield).toBe(20);
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