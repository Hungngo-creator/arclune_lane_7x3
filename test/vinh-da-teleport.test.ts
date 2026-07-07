import {
  TELEPORT_BANKED_RESOURCE_KEEP_RATIO,
  TELEPORT_RETREAT_COST,
  activateTeleportRetreat,
  canActivateTeleportRetreat,
  updateStructures,
  type VinhDaSimulationContext,
  type VinhDaSimulationState
} from '../src/screens/vinh-da/simulation.ts';
import { getStructureLevelStat, type StructureType } from '../src/screens/vinh-da/structures.ts';
import type { BuildSite, PlacedStructure, StructureRuntime } from '../src/screens/vinh-da/types.ts';

const createTeleportContext = (overrides: Partial<VinhDaSimulationState> = {}, runtimeCooldown = 0): VinhDaSimulationContext => {
  const teleport: PlacedStructure = { siteId: 'ground-center-0', type: 'teleport', level: 2 };
  const structures = new Map<string, PlacedStructure>([['ground-center-0', teleport]]);
  const runtimes = new Map<string, StructureRuntime>([['ground-center-0', { cooldown: runtimeCooldown, hp: getStructureLevelStat('teleport', 2).hp }]]);
  const sites = new Map<string, BuildSite>([['ground-center-0', { id: 'ground-center-0', x: 500, kind: 'ground', allowed: ['teleport'] }]]);
  const state: VinhDaSimulationState = {
    bloodSealStone: 10,
    carriedDaThach: 4,
    droppedResources: [],
    nextDroppedResourceId: 1,
    baseHp: 20,
    leaderX: 500,
    enemies: [],
    enemyPortals: [],
    nextEnemyId: 1,
    enemySpawnTimer: 0,
    dayNightPhase: 'night',
    phaseRemainingSeconds: 300,
    leaderAttackCooldown: 0,
    structures,
    nightIndex: 1,
    waveThreatBudgetRemaining: 0,
    ...overrides
  };
  return {
    state,
    structureSitesByType: new Map<StructureType, Set<string>>([['teleport', new Set(['ground-center-0'])]]),
    getBuildSite: siteId => siteId ? sites.get(siteId) ?? null : null,
    ensureStructureRuntime: structure => {
      let runtime = runtimes.get(structure.siteId);
      if (!runtime){
        runtime = { cooldown: 0, hp: getStructureLevelStat(structure.type, structure.level).hp };
        runtimes.set(structure.siteId, runtime);
      }
      return runtime;
    },
    getStructureMaxHp: structure => getStructureLevelStat(structure.type, structure.level).hp,
    deleteStructure: siteId => structures.delete(siteId),
    structureSiteIdsOfType: type => type === 'teleport' ? ['ground-center-0'] : [],
    renderEconomy: jest.fn(),
    renderDroppedResources: jest.fn(),
    renderBuildSite: jest.fn(),
    renderDayNightTimer: jest.fn(),
    removeEnemyElement: jest.fn()
  };
};

describe('Vĩnh Dạ teleport retreat', () => {
  it('requires an affordable ready teleport before activation', () => {
    expect(canActivateTeleportRetreat(createTeleportContext({}, 12))).toMatchObject({ ok: false, reason: 'cooldown', cooldownSeconds: 12 });
    expect(canActivateTeleportRetreat(createTeleportContext({ bloodSealStone: TELEPORT_RETREAT_COST - 1 }))).toMatchObject({ ok: false, reason: 'insufficient-resource' });
    expect(canActivateTeleportRetreat(createTeleportContext())).toMatchObject({ ok: true, cooldownSeconds: 0 });
  });

  it('transfers resources, marks sealed-old-map retreat state, and starts cooldown', () => {
    const ctx = createTeleportContext({ bloodSealStone: 19, carriedDaThach: 7 });
    const result = activateTeleportRetreat(ctx);
    const expectedBanked = Math.floor((19 - TELEPORT_RETREAT_COST) * TELEPORT_BANKED_RESOURCE_KEEP_RATIO);
    expect(result).toMatchObject({ ok: true, bloodSealStoneBefore: 19, bloodSealStoneAfter: expectedBanked, carriedDaThachAfter: 7, transferredDaThach: 7 });
    expect(ctx.state).toMatchObject({ bloodSealStone: expectedBanked, carriedDaThach: 7, teleportActive: true, teleportRetreatReason: 'sealed-old-map-retreat', teleportedToSealedOldMap: true });
    expect(ctx.ensureStructureRuntime(ctx.state.structures.get('ground-center-0')!).cooldown).toBe(getStructureLevelStat('teleport', 2).cooldownSeconds);
  });

  it('ticks teleport cooldown through structure updates', () => {
    const ctx = createTeleportContext({}, 5);
    updateStructures(ctx, 2);
    expect(ctx.ensureStructureRuntime(ctx.state.structures.get('ground-center-0')!).cooldown).toBe(3);
  });
});

