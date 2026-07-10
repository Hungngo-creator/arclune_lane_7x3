import {
  CASTLE_OUTER_LEFT,
  CASTLE_OUTER_RIGHT,
  CRYSTAL_X,
  DEFAULT_STRUCTURE_COOLDOWN,
  ENEMY_ATTACK_RANGE,
  ENEMY_LIMIT,
  ENEMY_SPAWN_INTERVAL,
  ENEMY_START_PADDING,
  ELEMENTAL_REGION_DARK_CONTAMINATION_COOLDOWN_SECONDS,
  ELEMENTAL_REGION_DARK_CONTAMINATION_SECONDS,
  ELEMENTAL_REGION_EARTH_DEFENSE_BONUS_PERCENT,
  ELEMENTAL_REGION_FIRE_BURN_MAX_HP_PER_SECOND,
  ELEMENTAL_REGION_FIRE_BURN_SECONDS,
  ELEMENTAL_REGION_LIGHT_CONTAMINATION_CLEANSE_PER_SECOND,
  ELEMENTAL_REGION_LIGHT_VULNERABLE_SECONDS,
  ELEMENTAL_REGION_THUNDER_PARALYSIS_CHANCE_PER_SECOND,
  ELEMENTAL_REGION_THUNDER_PARALYSIS_COOLDOWN_SECONDS,
  ELEMENTAL_REGION_THUNDER_PARALYSIS_SECONDS,
  LANDMINE_BLAST_RADIUS,
  LANDMINE_FUSE_SECONDS,
  LANDMINE_TRIGGER_RADIUS,
  LANDMINE_TRUE_DAMAGE,
  SPIKE_TRAP_BLEED_MAX_HP_PER_SECOND,
  SPIKE_TRAP_BLEED_SECONDS,
  SPIKE_TRAP_MAX_WEIGHT_EXCLUSIVE,
  SPIKE_TRAP_MIN_WEIGHT,
  SPIKE_TRAP_RADIUS,
  SPIKE_TRAP_SLOW_MULTIPLIER,
  SPIKE_TRAP_SLOW_SECONDS,
  LEADER_ATTACK_RANGE,
  LEADER_BASIC_ATTACK_COOLDOWN_SECONDS,
  LEADER_BASIC_ATTACK_DAMAGE,
  SWAMP_RADIUS,
  WORLD_WIDTH
} from './constants.ts';
import { nextRngValue } from '../../utils/rng.ts';
import type { RngState } from '@shared-types/rng';
import { getElementalRegionAtX } from './elemental-regions.ts';
import { DEFAULT_ENEMY_TEMPLATE, ENEMY_TEMPLATES, reduceDamageByDefense, scaleEnemyTierStat } from './enemies.ts';
import { applyCreaturePrefixPostRank, applyPrefixBonusDrops, canApplyCreaturePrefix, getPrefixNightCap, getPrefixThreatCostMultiplier } from './combat/prefixes.ts';
import type { CreaturePrefix, EnemyFaction, EnemyRole } from './combat/prefixes.ts';
import type { EnemyKind, EnemyTemplate, EnemyTier } from './enemies.ts';
import { BASE_STRUCTURE_STATS, getBaseLevelStat, getStructureLevelStat, metersToWorldUnits } from './structures.ts';
import type { BarracksSoldierRank, BaseBranchLv3, ElementalTowerElement, StructureType } from './structures.ts';
import type { BuildSite, DroppedResource, ElementalRegion, Enemy, EnemyPortal, PlacedStructure, Side, StructureRuntime } from './types.ts';
import { pickModuleOutcome } from './map-modules.ts';
import type { ModuleInteractionId, RuntimeMapModule } from './map-modules.ts';
import { getLiquidHntValue } from './economy/conversion.ts';
import { createVinhDaMerchantStock, rollVinhDaMerchantPresence } from './economy/merchant.ts';
import type { VinhDaMerchantOffer } from './economy/merchant.ts';
import { settleVinhDaMapEconomy } from './economy/settlement.ts';
import { rollEnemyResourceDrops } from './economy/dropTables.ts';
import type { TieredAmount } from './economy/resources.ts';

export const DAY_DURATION_SECONDS = 300;
export const RESOURCE_PICKUP_RANGE = 54;
export const RESOURCE_DEPOSIT_RANGE = 90;
export const BASE_BUFF_DAILY_UPKEEP = 5;
export const STRUCTURE_HEALING_CAP_MAX_HP_PER_SECOND = 0.08;
export const TELEPORT_RETREAT_COST = 3;
export const TELEPORT_BANKED_RESOURCE_KEEP_RATIO = 0.75;
export const ESCORT_START_RESOURCE_COST = 10;
export const ESCORT_START_NIGHT_INDEX = 3;
export const ESCORT_SEAL_POINTS = Object.freeze([CRYSTAL_X + 520, CRYSTAL_X + 1040, CRYSTAL_X + 1560] as const);
export const ESCORT_SPEED = 42;
export const ESCORT_SEAL_REACH_RANGE = 18;
const BASE_HEALING_CAP_WINDOW_SECONDS = 1;
export type DayNightPhase = 'day' | 'night' | 'escort';

export interface VinhDaWaveConfig {
  minNightIndex: number;
  mapTier: EnemyTier;
  threatBudget: number;
  enemyWeights: Partial<Record<EnemyKind, number>>;
}

const VINH_DA_WAVE_TABLE: readonly VinhDaWaveConfig[] = Object.freeze([
  { minNightIndex: 1, mapTier: 1.1, threatBudget: 8, enemyWeights: { twisted: 5, crawler: 3, madDog: 1 } },
  { minNightIndex: 3, mapTier: 1.1, threatBudget: 13, enemyWeights: { listener: 2, twisted: 4, crawler: 4, madDog: 2, bloodLordCultist: 1 } },
  { minNightIndex: 5, mapTier: 1.2, threatBudget: 20, enemyWeights: { listener: 2, twisted: 3, crawler: 3, madDog: 2, bloodLordCultist: 2, suicideBomber: 2, darkMage: 1, ironMan: 1 } },
  { minNightIndex: 8, mapTier: 1.2, threatBudget: 28, enemyWeights: { crawler: 3, madDog: 2, bloodLordCultist: 2, bloodLordPriest: 1, suicideBomber: 2, darkMage: 2, ironMan: 2, mutantBird: 1, resentmentStatue: 0.6 } },
  { minNightIndex: 12, mapTier: 1.3, threatBudget: 40, enemyWeights: { crawler: 2, madDog: 2, bloodLordCultist: 2, bloodLordPriest: 1, listener: 2, suicideBomber: 2, darkMage: 3, ironMan: 3, mutantBird: 2, resentmentStatue: 1, darkHighPriest: 0.25, resentfulDragon: 0.35 } }
]);

export const getScaledThreatBudget = (baseBudget: number, nightIndex: number): number => (
  baseBudget * Math.pow(1.05, Math.max(0, nightIndex - 1))
);

export const getVinhDaWaveConfig = (nightIndex: number, mapTier: EnemyTier = 1.1): VinhDaWaveConfig => {
  const targetNight = Math.max(1, Math.floor(nightIndex));
  let selected = VINH_DA_WAVE_TABLE[0]!;
  for (const config of VINH_DA_WAVE_TABLE){
    if (config.minNightIndex <= targetNight && config.mapTier <= mapTier) selected = config;
  }
  return selected;
};

const chooseEnemyKindForBudget = (config: VinhDaWaveConfig, budgetRemaining: number): EnemyKind | null => {
  const choices = Object.entries(config.enemyWeights)
    .map(([kind, weight]) => ({ kind: kind as EnemyKind, rollWeight: weight ?? 0, cost: ENEMY_TEMPLATES[kind as EnemyKind]?.threatCost ?? Number.POSITIVE_INFINITY }))
    .filter(choice => choice.rollWeight > 0 && choice.cost <= budgetRemaining);
  const totalWeight = choices.reduce((total, choice) => total + choice.rollWeight, 0);
  if (totalWeight <= 0) return null;
  let roll = Math.random() * totalWeight;
  for (const choice of choices){
    roll -= choice.rollWeight;
    if (roll <= 0) return choice.kind;
  }
  return choices[choices.length - 1]?.kind ?? null;
};

export interface VinhDaSimulationState {
  bloodSealStone: number;
  carriedDaThach: number;
  carriedResources?: TieredAmount[];
  baseStoredResources?: TieredAmount[];
  baseLiquidHnt?: number;
  condensedHnt?: number;
  baseEnergyShortage?: boolean;
  harvestRate?: number;
  merchantDayIndex?: number;
  nextMerchantRollDay?: number;
  merchantPresent?: boolean;
  merchantOpen?: boolean;
  merchantStock?: VinhDaMerchantOffer[];
  droppedResources: DroppedResource[];
  nextDroppedResourceId: number;
  lootRng?: RngState;
  baseHp: number;
  baseLevel?: number;
  baseX?: number;
  escortSealIndex?: number;
  securedSealPoints?: number[];
  baseBranchLv3?: BaseBranchLv3;
  contamination?: number;
  baseStatuses?: import('./types.ts').VinhDaStatusCollection;
  leaderHp?: number;
  leaderMaxHp?: number;
  leaderShield?: number;
  leaderShieldNightIndex?: number;
  leaderEmergencyCooldownUntilNight?: number;
  baseHealingCapWindowRemaining?: number;
  baseHealingCapUsed?: number;
  leaderX: number;
  enemies: Enemy[];
  enemyPortals: EnemyPortal[];
  nextEnemyId: number;
  enemySpawnTimer: number;
  dayNightPhase: DayNightPhase;
  phaseRemainingSeconds: number;
  leaderAttackCooldown: number;
  structures: Map<string, PlacedStructure>;
  nightIndex: number;
  mapTier?: EnemyTier;
  waveThreatBudgetRemaining: number;
  elementalRegions?: readonly ElementalRegion[];
  teleportCooldownSeconds?: number;
  teleportActive?: boolean;
  teleportRetreatReason?: string | null;
  teleportedToSealedOldMap?: boolean;
  mapModules?: RuntimeMapModule[];
}

export const settleCompletedVinhDaMap = (ctx: VinhDaSimulationContext): ReturnType<typeof settleVinhDaMapEconomy> => {
  const result = settleVinhDaMapEconomy({
    liquidHntRemaining: ctx.state.baseLiquidHnt ?? 0,
    directResources: ctx.state.carriedResources ?? [],
    harvestRate: ctx.state.harvestRate ?? 1
  });
  ctx.state.condensedHnt = Math.max(0, ctx.state.condensedHnt ?? ctx.state.bloodSealStone) + result.totalCondensedHnt;
  ctx.state.bloodSealStone = ctx.state.condensedHnt;
  ctx.state.baseLiquidHnt = 0;
  if (ctx.state.carriedResources) ctx.state.carriedResources.length = 0;
  ctx.state.carriedDaThach = 0;
  ctx.state.baseStoredResources = [...(ctx.state.baseStoredResources ?? []), ...result.keptResources];
  ctx.renderEconomy();
  return result;
};

export const getBaseX = (state: Pick<VinhDaSimulationState, 'baseX'>): number => (Number.isFinite(state.baseX) ? state.baseX! : CRYSTAL_X);
export const getCurrentSealPointX = (state: Pick<VinhDaSimulationState, 'escortSealIndex'>): number | null => ESCORT_SEAL_POINTS[state.escortSealIndex ?? 0] ?? null;
export const canStartEscort = (ctx: VinhDaSimulationContext): boolean => (
  ctx.state.dayNightPhase !== 'escort'
  && ctx.state.bloodSealStone >= ESCORT_START_RESOURCE_COST
  && ctx.state.nightIndex >= ESCORT_START_NIGHT_INDEX
  && getCurrentSealPointX(ctx.state) !== null
);
export const startEscort = (ctx: VinhDaSimulationContext): boolean => {
  if (!canStartEscort(ctx)) return false;
  ctx.state.bloodSealStone -= ESCORT_START_RESOURCE_COST;
  ctx.state.dayNightPhase = 'escort';
  ctx.state.baseX = getBaseX(ctx.state);
  ctx.renderEconomy();
  ctx.renderDayNightTimer();
  return true;
};

const completeEscortSealPoint = (ctx: VinhDaSimulationContext): void => {
  const targetX = getCurrentSealPointX(ctx.state);
  if (targetX === null) return;
  ctx.state.securedSealPoints = [...(ctx.state.securedSealPoints ?? []), targetX];
  ctx.state.baseStatuses = { ...(ctx.state.baseStatuses ?? {}), contaminationStacks: 0, bleedStacks: [] };
  ctx.state.contamination = 0;
  ctx.state.escortSealIndex = (ctx.state.escortSealIndex ?? 0) + 1;
  ctx.state.dayNightPhase = getCurrentSealPointX(ctx.state) === null ? 'day' : 'night';
  ctx.state.phaseRemainingSeconds = DAY_DURATION_SECONDS;
  clearEnemiesWithoutReward(ctx);
};

const updateEscortMovement = (ctx: VinhDaSimulationContext, dt: number): void => {
  if (ctx.state.dayNightPhase !== 'escort') return;
  const targetX = getCurrentSealPointX(ctx.state);
  if (targetX === null){
    ctx.state.dayNightPhase = 'day';
    return;
  }
  const baseX = getBaseX(ctx.state);
  const delta = targetX - baseX;
  const step = Math.sign(delta) * Math.min(Math.abs(delta), ESCORT_SPEED * dt);
  ctx.state.baseX = baseX + step;
  if (Math.abs(targetX - getBaseX(ctx.state)) <= ESCORT_SEAL_REACH_RANGE) completeEscortSealPoint(ctx);
};

export interface VinhDaSimulationContext {
  state: VinhDaSimulationState;
  structureSitesByType: Map<StructureType, Set<string>>;
  getBuildSite(siteId: string | null | undefined): BuildSite | null;
  ensureStructureRuntime(structure: PlacedStructure): StructureRuntime;
  getStructureMaxHp(structure: PlacedStructure): number;
  deleteStructure(siteId: string): boolean;
  structureSiteIdsOfType(type: StructureType): Iterable<string>;
  renderEconomy(): void;
  renderDroppedResources(): void;
  renderBuildSite(siteId: string): void;
  renderDayNightTimer(): void;
  removeEnemyElement(enemyId: number): void;
}

export interface TeleportRetreatResult {
  ok: boolean;
  reason?: 'missing-teleport' | 'missing-map-module' | 'cooldown' | 'insufficient-resource' | 'already-active';
  cooldownSeconds: number;
  bloodSealStoneBefore: number;
  bloodSealStoneAfter: number;
  carriedDaThachBefore: number;
  carriedDaThachAfter: number;
  lostBloodSealStone: number;
  transferredDaThach: number;
}

const getTeleportStructures = (ctx: VinhDaSimulationContext): PlacedStructure[] => (
  [...ctx.structureSiteIdsOfType('teleport')]
    .map(siteId => ctx.state.structures.get(siteId))
    .filter((structure): structure is PlacedStructure => structure?.type === 'teleport')
);

export const getReadyTeleportStructure = (ctx: VinhDaSimulationContext): PlacedStructure | null => (
  getTeleportStructures(ctx).find(structure => (ctx.ensureStructureRuntime(structure).cooldown ?? 0) <= 0) ?? null
);

export const canActivateTeleportRetreat = (ctx: VinhDaSimulationContext): TeleportRetreatResult => {
  const readyTeleport = getReadyTeleportStructure(ctx);
  const fallbackCooldown = Math.min(...getTeleportStructures(ctx).map(structure => ctx.ensureStructureRuntime(structure).cooldown).filter(Number.isFinite));
  const cooldownSeconds = readyTeleport ? 0 : Math.max(0, Number.isFinite(fallbackCooldown) ? fallbackCooldown : ctx.state.teleportCooldownSeconds ?? 0);
  const baseResult = {
    cooldownSeconds,
    bloodSealStoneBefore: ctx.state.bloodSealStone,
    bloodSealStoneAfter: ctx.state.bloodSealStone,
    carriedDaThachBefore: ctx.state.carriedDaThach,
    carriedDaThachAfter: ctx.state.carriedDaThach,
    lostBloodSealStone: 0,
    transferredDaThach: 0
  };
  if (ctx.state.teleportActive) return { ok: false, reason: 'already-active', ...baseResult };
  if (!readyTeleport && getTeleportStructures(ctx).length <= 0 && !ctx.state.mapModules?.some(module => module.id === 'teleportArray')) return { ok: false, reason: 'missing-teleport', ...baseResult };
  if (!readyTeleport && !ctx.state.mapModules?.some(module => module.id === 'teleportArray' && !module.depleted)) return { ok: false, reason: 'cooldown', ...baseResult };
  if (ctx.state.bloodSealStone < TELEPORT_RETREAT_COST) return { ok: false, reason: 'insufficient-resource', ...baseResult };
  return { ok: true, ...baseResult };
};

export const activateTeleportRetreat = (ctx: VinhDaSimulationContext): TeleportRetreatResult => {
  const guard = canActivateTeleportRetreat(ctx);
  if (!guard.ok) return guard;
  const structure = getReadyTeleportStructure(ctx);
  const teleportModule = !structure ? ctx.state.mapModules?.find(module => module.id === 'teleportArray' && !module.depleted) : null;
  if (!structure && !teleportModule) return { ...guard, ok: false, reason: 'missing-teleport' };
  const runtime = structure ? ctx.ensureStructureRuntime(structure) : null;
  const stat = structure ? getStructureLevelStat('teleport', structure.level) : null;
  const bloodSealStoneBefore = ctx.state.bloodSealStone;
  const carriedDaThachBefore = ctx.state.carriedDaThach;
  const afterCost = Math.max(0, bloodSealStoneBefore - TELEPORT_RETREAT_COST);
  const bloodSealStoneAfter = Math.floor(afterCost * TELEPORT_BANKED_RESOURCE_KEEP_RATIO);
  ctx.state.bloodSealStone = bloodSealStoneAfter;
  ctx.state.carriedDaThach = carriedDaThachBefore;
  ctx.state.teleportActive = true;
  ctx.state.teleportRetreatReason = 'sealed-old-map-retreat';
  ctx.state.teleportedToSealedOldMap = true;
  ctx.state.teleportCooldownSeconds = stat?.cooldownSeconds ?? 0;
  if (runtime) runtime.cooldown = ctx.state.teleportCooldownSeconds;
  if (teleportModule) teleportModule.depleted = true;
  ctx.renderEconomy();
  if (structure) ctx.renderBuildSite(structure.siteId);
  return {
    ok: true,
    cooldownSeconds: runtime?.cooldown ?? 0,
    bloodSealStoneBefore,
    bloodSealStoneAfter,
    carriedDaThachBefore,
    carriedDaThachAfter: ctx.state.carriedDaThach,
    lostBloodSealStone: bloodSealStoneBefore - bloodSealStoneAfter,
    transferredDaThach: ctx.state.carriedDaThach
  };
};

const getEnemyRankMultiplier = (rank: number): number => 1 + Math.max(0, rank - 1) * 0.1;
const getEnemyFaction = (kind: EnemyKind): EnemyFaction => kind === 'bloodLordCultist' || kind === 'bloodLordPriest' ? 'bloodLord' : kind === 'resentmentStatue' ? 'neutral' : 'eternalNight';
const getEnemyRole = (kind: EnemyKind): EnemyRole => kind === 'fleshRemnant' ? 'boss' : kind === 'darkHighPriest' || kind === 'resentfulDragon' ? 'miniBoss' : 'normal';
const rollWavePrefix = (ctx: VinhDaSimulationContext, kind: EnemyKind): CreaturePrefix | null => {
  const role = getEnemyRole(kind);
  if (role !== 'normal') return null;
  const night = ctx.state.nightIndex;
  const spawned = ctx.state.enemies.length + 1;
  const counts = ctx.state.enemies.reduce((record, enemy) => { if (enemy.prefix) record[enemy.prefix] = (record[enemy.prefix] ?? 0) + 1; return record; }, {} as Partial<Record<CreaturePrefix, number>>);
  const candidates: readonly [CreaturePrefix, number][] = [['hero', 0.01], ['champion', 0.035], ['elite', 0.08]];
  for (const [prefix, chance] of candidates){
    if (!canApplyCreaturePrefix(role, prefix)) continue;
    const definition = (prefix === 'elite' ? 2 : prefix === 'champion' ? 4 : 2);
    if (night < definition) continue;
    if ((counts[prefix] ?? 0) >= getPrefixNightCap(prefix, spawned)) continue;
    if (Math.random() < chance) return prefix;
  }
  return null;
};

export const spawnEnemy = (ctx: VinhDaSimulationContext, side: Side, kind: EnemyKind = 'twisted', spawnX?: number, allowOutsideNight = false, prefix: CreaturePrefix | null = null): void => {
    if ((!allowOutsideNight && ctx.state.dayNightPhase !== 'night') || ctx.state.enemies.length >= ENEMY_LIMIT) return;
    const template = ENEMY_TEMPLATES[kind] ?? DEFAULT_ENEMY_TEMPLATE;
  const tier = ctx.state.mapTier ?? template.tier;
    const rankMultiplier = getEnemyRankMultiplier(template.rank);
    const rankedStats = {
      hp: scaleEnemyTierStat(template.hp, tier) * rankMultiplier,
      atk: scaleEnemyTierStat(template.atk, tier) * rankMultiplier,
      wil: scaleEnemyTierStat(template.wil, tier) * rankMultiplier,
      arm: scaleEnemyTierStat(template.arm, tier) * rankMultiplier,
      res: scaleEnemyTierStat(template.res, tier) * rankMultiplier,
      speed: template.speed,
      attackCooldown: template.attackCooldown
    };
    const role = getEnemyRole(template.kind);
    const appliedPrefix = canApplyCreaturePrefix(role, prefix) ? prefix : null;
    const finalStats = applyCreaturePrefixPostRank(rankedStats, appliedPrefix);
    const hp = finalStats.hp;
    const atk = finalStats.atk;
    const wil = finalStats.wil;
    ctx.state.enemies.push({
      id: ctx.state.nextEnemyId,
      x: spawnX ?? (side === 'left' ? ENEMY_START_PADDING : WORLD_WIDTH - ENEMY_START_PADDING),
      kind: template.kind,
      hp,
      maxHp: hp,
      speed: finalStats.speed,
      baseSpeed: finalStats.speed,
      groundSpeed: template.groundSpeed,
      flySpeed: template.flySpeed,
      weight: template.weight,
      threatCost: template.threatCost * getPrefixThreatCostMultiplier(appliedPrefix),
      prefix: appliedPrefix,
      faction: getEnemyFaction(template.kind),
      attackCooldown: finalStats.attackCooldown,
      atk,
      wil,
      arm: finalStats.arm,
      res: finalStats.res,
      tier,
      rank: template.rank,
      projectileSpeed: template.projectileSpeed,
      attackShape: template.attackShape,
      aoeRadius: template.aoeRadius,
      statusOnHit: template.statusOnHit,
      canFly: template.canFly,
      hasCommanderAura: template.hasCommanderAura,
      contaminationOnHit: template.contaminationOnHit,
      bleedOnHit: template.bleedOnHit,
      deathExplosion: template.deathExplosion,
      regen: template.regen,
      dragonDestroyStructure: template.dragonDestroyStructure,
      ultimate: template.ultimate,
      side,
      apostleState: template.kind === 'apostle' ? 'ambush' : undefined
    });
    ctx.state.nextEnemyId += 1;
  };

const isValidEnemyPortal = (portal: EnemyPortal): portal is EnemyPortal & { side: Side; x: number } => (
  (portal.side === 'left' || portal.side === 'right') && Number.isFinite(portal.x)
);

const chooseEnemyPortal = (ctx: VinhDaSimulationContext, side?: Side): (EnemyPortal & { side: Side; x: number }) | null => {
  const validPortals = ctx.state.enemyPortals.filter(isValidEnemyPortal);
  const portals = side ? validPortals.filter(portal => portal.side === side) : validPortals;
  return portals.length > 0 ? portals[Math.floor(Math.random() * portals.length)]! : null;
};

const getFallbackSpawnSide = (ctx: VinhDaSimulationContext, side?: Side): Side => side ?? (ctx.state.nextEnemyId % 2 === 0 ? 'left' : 'right');

export const spawnWaveEnemy = (ctx: VinhDaSimulationContext, side?: Side): boolean => {
  const config = getVinhDaWaveConfig(ctx.state.nightIndex, ctx.state.mapTier);
  const kind = chooseEnemyKindForBudget(config, ctx.state.waveThreatBudgetRemaining);
  if (!kind) return false;
  const previousNextEnemyId = ctx.state.nextEnemyId;
  const portal = chooseEnemyPortal(ctx, side);
  const spawnSide = portal?.side ?? getFallbackSpawnSide(ctx, side);
  const prefix = rollWavePrefix(ctx, kind);
  spawnEnemy(ctx, spawnSide, kind, portal?.x, false, prefix);
  if (ctx.state.nextEnemyId === previousNextEnemyId) return false;
  const spawnedEnemy = ctx.state.enemies.find(enemy => enemy.id === previousNextEnemyId);
  ctx.state.waveThreatBudgetRemaining = Math.max(0, ctx.state.waveThreatBudgetRemaining - (spawnedEnemy?.threatCost ?? ENEMY_TEMPLATES[kind].threatCost));
  return true;
};
const BLEED_SECONDS = 3;
const BLEED_MAX_HP_DPS_PERCENT = 0.03;
const BLEED_STACK_CAP = 5;
const LIGHTNING_PARALYSIS_SECONDS = 0.75;
const LIGHTNING_PARALYSIS_COOLDOWN_SECONDS = 4;
const WIND_SLOW_SECONDS = 2;
const WIND_SLOW_MULTIPLIER = 0.9;
const WIND_KNOCKBACK_COOLDOWN_SECONDS = 3;
const WIND_KNOCKBACK_DISTANCE = 60;
const CONTAMINATION_APOSTLE_STACKS = 5;
const APOSTLE_COMMAND_AURA_RADIUS = 15 * 100;
const APOSTLE_COMMAND_AURA_MULTIPLIER = 1.05;

const ensureStatuses = <T extends { statuses?: import('./types.ts').VinhDaStatusCollection }>(target: T): import('./types.ts').VinhDaStatusCollection => (target.statuses ??= {});
const addBleedStack = (target: { statuses?: import('./types.ts').VinhDaStatusCollection }): void => {
  const statuses = ensureStatuses(target);
  const stacks = statuses.bleedStacks ??= [];
  if (stacks.length >= BLEED_STACK_CAP) return;
  stacks.push({ remainingSeconds: BLEED_SECONDS });
};
const tickStatusCooldowns = (cooldowns: Record<string, number> | undefined, dt: number): void => {
  if (!cooldowns) return;
  for (const key of Object.keys(cooldowns)){
    const next = Math.max(0, cooldowns[key]! - dt);
    if (next > 0) cooldowns[key] = next;
    else delete cooldowns[key];
  }
};
const getBaseContaminationStacks = (ctx: VinhDaSimulationContext): number => ctx.state.baseStatuses?.contaminationStacks ?? ctx.state.contamination ?? 0;
const setBaseContaminationStacks = (ctx: VinhDaSimulationContext, stacks: number): void => {
  const nextStacks = Math.max(0, Math.floor(stacks));
  const statuses = ctx.state.baseStatuses ??= {};
  statuses.contaminationStacks = nextStacks;
  ctx.state.contamination = nextStacks;
};
const addBaseContaminationStack = (ctx: VinhDaSimulationContext): void => {
  setBaseContaminationStacks(ctx, getBaseContaminationStacks(ctx) + 1);
};
const applyContaminationHit = (ctx: VinhDaSimulationContext, enemy: Enemy): void => {
    if (!enemy.contaminationOnHit) return;
    addBaseContaminationStack(ctx);
  };
const applyBleedHit = (target: { statuses?: import('./types.ts').VinhDaStatusCollection }, enemy: Enemy): void => {
  if (enemy.bleedOnHit) addBleedStack(target);
};
const applyBaseBleedHit = (ctx: VinhDaSimulationContext, enemy: Enemy): void => {
  if (!enemy.bleedOnHit) return;
  const statuses = ctx.state.baseStatuses ??= {};
  const stacks = statuses.bleedStacks ??= [];
  if (stacks.length < BLEED_STACK_CAP) stacks.push({ remainingSeconds: BLEED_SECONDS });
};
const triggerDeathExplosion = (ctx: VinhDaSimulationContext, enemy: Enemy): void => {
    if (!enemy.deathExplosion) return;
    const radius = enemy.aoeRadius || getEnemyTemplate(enemy).aoeRadius;
    const damage = Math.max(enemy.atk, enemy.wil) * 2;
    if (Math.abs(enemy.x - getBaseX(ctx.state)) <= radius) damageBase(ctx, damage);
  for (const structure of ctx.state.structures.values()){
      const site = ctx.getBuildSite(structure.siteId);
      if (!site || Math.abs(site.x - enemy.x) > radius) continue;
      damageStructure(ctx, site, ctx.ensureStructureRuntime(structure), damage, enemy);
  }
    for (let i = ctx.state.enemies.length - 1; i >= 0; i -= 1){
      const target = ctx.state.enemies[i];
      if (!target || target.id === enemy.id || Math.abs(target.x - enemy.x) > radius) continue;
      if (damageEnemy(ctx, target, damage)) removeEnemyAt(ctx, i, true);
    }
  };
export const removeEnemyAt = (ctx: VinhDaSimulationContext, index: number, reward: boolean, triggerDeathEffects = true): void => {
    const [enemy] = ctx.state.enemies.splice(index, 1);
    if (!enemy) return;
    ctx.removeEnemyElement(enemy.id);
  if (triggerDeathEffects) triggerDeathExplosion(ctx, enemy);
    if (reward && ctx.state.dayNightPhase === 'night'){
      const drops = applyPrefixBonusDrops(enemy, rollEnemyResourceDrops({ kind: enemy.kind, enemyTier: enemy.tier, mapTier: ctx.state.mapTier, randomValue: () => nextRngValue(ctx.state.lootRng) }), () => nextRngValue(ctx.state.lootRng));
      for (const drop of drops){
        if (drop.amount <= 0) continue;
        ctx.state.droppedResources.push({ id: ctx.state.nextDroppedResourceId, x: enemy.x, kind: drop.resourceId, ...drop });
        ctx.state.nextDroppedResourceId += 1;
      }
      if (drops.length > 0) ctx.renderDroppedResources();
    }
  };
export const clearEnemiesWithoutReward = (ctx: VinhDaSimulationContext): void => {
    while (ctx.state.enemies.length > 0) removeEnemyAt(ctx, ctx.state.enemies.length - 1, false, false);
    ctx.state.enemySpawnTimer = 0;
  };
export const addTieredAmount = (resources: TieredAmount[], resource: TieredAmount): void => {
  const existing = resources.find(item => item.resourceId === resource.resourceId && item.tier === resource.tier);
  if (existing) existing.amount += resource.amount;
  else resources.push({ resourceId: resource.resourceId, amount: resource.amount, tier: resource.tier });
};

export interface ModuleInteractionResult {
  ok: boolean;
  reason?: 'missing-module' | 'already-depleted' | 'missing-interaction' | 'not-day';
  resources: TieredAmount[];
  spawnedEnemies: EnemyKind[];
  notice?: string;
}

export const resolveMapModuleInteraction = (ctx: VinhDaSimulationContext, instanceId: string, interactionId: ModuleInteractionId): ModuleInteractionResult => {
  const module = ctx.state.mapModules?.find(item => item.instanceId === instanceId);
  if (!module) return { ok: false, reason: 'missing-module', resources: [], spawnedEnemies: [] };
  if (module.depleted && interactionId !== 'activateTeleport') return { ok: false, reason: 'already-depleted', resources: [], spawnedEnemies: [] };
  if (ctx.state.dayNightPhase !== 'day' && interactionId !== 'activateTeleport') return { ok: false, reason: 'not-day', resources: [], spawnedEnemies: [] };
  const interaction = module.interactions.find(item => item.id === interactionId);
  if (!interaction) return { ok: false, reason: 'missing-interaction', resources: [], spawnedEnemies: [] };
  if (interactionId === 'activateTeleport') {
    module.depleted = true;
    ctx.state.teleportActive = true;
    ctx.state.teleportRetreatReason = 'map-module-complete';
    ctx.state.teleportedToSealedOldMap = true;
    settleCompletedVinhDaMap(ctx);
    ctx.renderEconomy();
    return { ok: true, resources: [], spawnedEnemies: [], notice: 'Truyền Tống Trận hoàn thành map và kết toán tài nguyên.' };
  }
  const pool = module.resourcePools.find(item => item.id === interaction.resourcePoolId);
  const outcome = pool ? pickModuleOutcome(pool, () => nextRngValue(ctx.state.lootRng)) : null;
  const tier = ctx.state.mapTier;
  const resources = (outcome?.resources ?? []).map(resource => ({ ...resource, tier: resource.tier ?? tier }));
  ctx.state.baseStoredResources ??= [];
  for (const resource of resources) addTieredAmount(ctx.state.baseStoredResources, resource);
  const spawnedEnemies = [...(interaction.spawnEnemies ?? []), ...(outcome?.spawnEnemies ?? [])];
  for (const enemyKind of spawnedEnemies){
    const side = module.x < getBaseX(ctx.state) ? 'left' : 'right';
    const beforeId = ctx.state.nextEnemyId;
    spawnEnemy(ctx, side, enemyKind, module.x, true);
    const enemy = ctx.state.enemies.find(item => item.id === beforeId);
    if (enemy && outcome?.daytimeLeashedEnemies){
      enemy.moduleLeashX = module.x;
      enemy.moduleLeashRadius = 120;
      enemy.moduleLeashUntilNight = true;
    }
  }
  module.depleted = true;
  ctx.renderEconomy();
  return { ok: true, resources, spawnedEnemies, notice: outcome?.notice };
};

export const collectDroppedResources = (ctx: VinhDaSimulationContext): void => {
  let collected = 0;
  ctx.state.carriedResources ??= [];
  ctx.state.baseStoredResources ??= [];
  for (let i = ctx.state.droppedResources.length - 1; i >= 0; i -= 1){
    const resource = ctx.state.droppedResources[i];
    if (!resource || Math.abs(resource.x - ctx.state.leaderX) > RESOURCE_PICKUP_RANGE) continue;
    collected += resource.amount;
    addTieredAmount(ctx.state.carriedResources, resource);
    if (resource.resourceId === 'darkStone') ctx.state.carriedDaThach += resource.amount;
    ctx.state.droppedResources.splice(i, 1);
  }
  if (collected > 0){
    ctx.renderDroppedResources();
    ctx.renderEconomy();
  }
  if (ctx.state.carriedResources.length > 0 && Math.abs(ctx.state.leaderX - getBaseX(ctx.state)) <= RESOURCE_DEPOSIT_RANGE){
    for (const resource of ctx.state.carriedResources){
      addTieredAmount(ctx.state.baseStoredResources, resource);
      if (ctx.state.baseEnergyShortage) continue;
      ctx.state.baseLiquidHnt = (ctx.state.baseLiquidHnt ?? 0) + getLiquidHntValue(resource);
    }
    ctx.state.carriedResources.length = 0;
    ctx.state.carriedDaThach = 0;
    ctx.renderEconomy();
  }
};
export const getBlockingWall = (ctx: VinhDaSimulationContext, enemy: Enemy): { site: BuildSite; runtime: StructureRuntime } | null => {
    for (const siteId of ctx.structureSiteIdsOfType('wall')){
      const structure = ctx.state.structures.get(siteId);
      if (!structure) continue;
      const site = ctx.getBuildSite(siteId);
      if (!site || (enemy.side === 'left' ? site.x >= getBaseX(ctx.state) : site.x <= getBaseX(ctx.state))) continue;
      const runtime = ctx.ensureStructureRuntime(structure);
      if (runtime.hp > 0 && Math.abs(enemy.x - site.x) <= ENEMY_ATTACK_RANGE) return { site, runtime };
    }
    return null;
  };
export const damageEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, amount: number, atkRatio = 0.5, ignoreDefenseBelow = 0): boolean => {
    const safeAtkRatio = Math.max(0, Math.min(1, atkRatio));
    const effectiveArm = enemy.arm <= ignoreDefenseBelow ? 0 : enemy.arm;
    const effectiveRes = enemy.res <= ignoreDefenseBelow ? 0 : enemy.res;
    const atkPart = reduceDamageByDefense(amount * safeAtkRatio, effectiveArm);
    const wilPart = reduceDamageByDefense(amount * (1 - safeAtkRatio), effectiveRes);
    enemy.hp -= atkPart + wilPart;
    return enemy.hp <= 0;
  };

const BLOOD_MAX_HP_STACK_CAP = 17;
const ELEMENTAL_ALLY_BUFF_SECONDS = 3;
const getBaseStat = (ctx: VinhDaSimulationContext) => {
  const level = ctx.state.baseLevel ?? 0;
  const stat = ctx.state.baseBranchLv3 ? getBaseLevelStat(level, ctx.state.baseBranchLv3) : (BASE_STRUCTURE_STATS[level] ?? BASE_STRUCTURE_STATS[0]!);
  const tier = ctx.state.mapTier;
  if (!tier) return stat;
  return {
    ...stat,
    hp: scaleEnemyTierStat(stat.hp, tier),
    ...(stat.arm === undefined ? {} : { arm: scaleEnemyTierStat(stat.arm, tier) }),
    ...(stat.res === undefined ? {} : { res: scaleEnemyTierStat(stat.res, tier) }),
    ...(stat.healPerSecond === undefined ? {} : { healPerSecond: scaleEnemyTierStat(stat.healPerSecond, tier) }),
    ...(stat.allyHealPerSecond === undefined ? {} : { allyHealPerSecond: scaleEnemyTierStat(stat.allyHealPerSecond, tier) }),
    ...(stat.allyAtkBonus === undefined ? {} : { allyAtkBonus: scaleEnemyTierStat(stat.allyAtkBonus, tier) })
  };
};
const getLeaderMaxHp = (ctx: VinhDaSimulationContext): number => {
  const maxHp = ctx.state.leaderMaxHp ?? getBaseStat(ctx).hp;
  ctx.state.leaderMaxHp = maxHp;
  return maxHp;
};
const getLeaderHp = (ctx: VinhDaSimulationContext): number => {
  const hp = ctx.state.leaderHp ?? getLeaderMaxHp(ctx);
  ctx.state.leaderHp = Math.min(getLeaderMaxHp(ctx), hp);
  return ctx.state.leaderHp;
};
const healLeader = (ctx: VinhDaSimulationContext, amount: number): void => {
  if (ctx.state.baseEnergyShortage) return;
  ctx.state.leaderHp = Math.min(getLeaderMaxHp(ctx), getLeaderHp(ctx) + Math.max(0, amount));
};
const capStructureHeal = (maxHp: number, amount: number, dt = 1): number => Math.min(Math.max(0, amount), Math.max(0, maxHp) * STRUCTURE_HEALING_CAP_MAX_HP_PER_SECOND * Math.max(0, dt));
const healLeaderFromStructure = (ctx: VinhDaSimulationContext, amount: number, dt: number): void => healLeader(ctx, capStructureHeal(getLeaderMaxHp(ctx), amount, dt));
const damageLeader = (ctx: VinhDaSimulationContext, amount: number): boolean => {
  let remaining = Math.max(0, amount);
  const shield = ctx.state.leaderShield ?? 0;
  if (shield > 0){
    const absorbed = Math.min(shield, remaining);
    ctx.state.leaderShield = shield - absorbed;
    remaining -= absorbed;
  }
  if (remaining > 0) ctx.state.leaderHp = Math.max(0, getLeaderHp(ctx) - remaining);
  return getLeaderHp(ctx) <= 0;
};
const applyLeaderNightShield = (ctx: VinhDaSimulationContext): void => {
  const stat = getBaseStat(ctx);
  if ((stat.leaderShieldPercent ?? 0) <= 0 || ctx.state.leaderShieldNightIndex === ctx.state.nightIndex) return;
  ctx.state.leaderShield = Math.max(ctx.state.leaderShield ?? 0, getLeaderMaxHp(ctx) * (stat.leaderShieldPercent ?? 0));
  ctx.state.leaderShieldNightIndex = ctx.state.nightIndex;
};
export interface TerritoryWallBounds {
  leftX: number;
  rightX: number;
}
export const getLivingTerritoryWallBounds = (ctx: VinhDaSimulationContext): TerritoryWallBounds | null => {
  let leftX: number | null = null;
  let rightX: number | null = null;
  for (const siteId of ctx.structureSiteIdsOfType('wall')){
    const structure = ctx.state.structures.get(siteId);
    if (!structure || structure.type !== 'wall') continue;
    const site = ctx.getBuildSite(siteId);
    if (!site) continue;
    const runtime = ctx.ensureStructureRuntime(structure);
    if (runtime.hp <= 0) continue;
    if (site.x < getBaseX(ctx.state)){
      leftX = leftX === null ? site.x : Math.min(leftX, site.x);
    } else if (site.x > getBaseX(ctx.state)){
      rightX = rightX === null ? site.x : Math.max(rightX, site.x);
    }
  }
  return leftX === null || rightX === null ? null : { leftX, rightX };
};
export const isXInLivingTerritory = (ctx: VinhDaSimulationContext, x: number, bounds = getLivingTerritoryWallBounds(ctx)): boolean => Boolean(bounds && x >= bounds.leftX && x <= bounds.rightX);

const getTerritoryChurchBuff = (ctx: VinhDaSimulationContext, x: number, bounds = getLivingTerritoryWallBounds(ctx)): Pick<ReturnType<typeof getStructureLevelStat>, 'buffHpPercent' | 'buffArmPercent' | 'buffResPercent' | 'buffAtkPercent' | 'buffWilPercent'> => {
  if (!isXInLivingTerritory(ctx, getBaseX(ctx.state), bounds) || !isXInLivingTerritory(ctx, x, bounds)) return {};
  const total: { buffHpPercent?: number; buffArmPercent?: number; buffResPercent?: number; buffAtkPercent?: number; buffWilPercent?: number } = {};
  for (const siteId of ctx.structureSiteIdsOfType('church')){
    const structure = ctx.state.structures.get(siteId);
    const site = structure ? ctx.getBuildSite(siteId) : null;
    if (!structure || !site || !isXInLivingTerritory(ctx, site.x, bounds)) continue;
    const stat = getStructureLevelStat('church', structure.level);
    total.buffHpPercent = (total.buffHpPercent ?? 0) + (stat.buffHpPercent ?? 0);
    total.buffArmPercent = (total.buffArmPercent ?? 0) + (stat.buffArmPercent ?? 0);
    total.buffResPercent = (total.buffResPercent ?? 0) + (stat.buffResPercent ?? 0);
    total.buffAtkPercent = (total.buffAtkPercent ?? 0) + (stat.buffAtkPercent ?? 0);
    total.buffWilPercent = (total.buffWilPercent ?? 0) + (stat.buffWilPercent ?? 0);
  }
  return total;
};
const getTerritoryBaseAllyAtkBonus = (ctx: VinhDaSimulationContext, x: number, bounds = getLivingTerritoryWallBounds(ctx)): number => (
  isXInLivingTerritory(ctx, getBaseX(ctx.state), bounds) && isXInLivingTerritory(ctx, x, bounds) ? (getBaseStat(ctx).allyAtkBonus ?? 0) * (1 + ((getTerritoryChurchBuff(ctx, x, bounds).buffAtkPercent ?? 0) + (getTerritoryChurchBuff(ctx, x, bounds).buffWilPercent ?? 0)) / 2) : 0
);
const getChurchHealingBonus = (ctx: VinhDaSimulationContext, bounds = getLivingTerritoryWallBounds(ctx)): number => {
  if (!isXInLivingTerritory(ctx, getBaseX(ctx.state), bounds)) return 0;
  let bonus = getBaseStat(ctx).healingBonusPercent ?? 0;
  bonus += ctx.state.baseStatuses?.elementalHealingBonus ?? 0;
  for (const siteId of ctx.structureSiteIdsOfType('church')){
    const structure = ctx.state.structures.get(siteId);
    if (!structure) continue;
    const site = ctx.getBuildSite(siteId);
    if (!site || !isXInLivingTerritory(ctx, site.x, bounds)) continue;
    bonus += getStructureLevelStat('church', structure.level).healingBonusPercent ?? 0;
  }
  return bonus;
};
const getBaseMaxHp = (ctx: VinhDaSimulationContext): number => {
  const stat = getBaseStat(ctx);
  return (stat.hp + (stat.shield ?? 0) + (ctx.state.baseStatuses?.elementalBloodMaxHpBonus ?? 0)) * (1 + (getTerritoryChurchBuff(ctx, getBaseX(ctx.state)).buffHpPercent ?? 0));
};
const resetBaseHealingCapWindow = (ctx: VinhDaSimulationContext): void => {
  ctx.state.baseHealingCapWindowRemaining = BASE_HEALING_CAP_WINDOW_SECONDS;
  ctx.state.baseHealingCapUsed = 0;
};
const tickBaseHealingCapWindow = (ctx: VinhDaSimulationContext, dt: number): void => {
  const remaining = (ctx.state.baseHealingCapWindowRemaining ?? 0) - dt;
  if (remaining > 0){
    ctx.state.baseHealingCapWindowRemaining = remaining;
    return;
  }
  resetBaseHealingCapWindow(ctx);
};
const healBase = (ctx: VinhDaSimulationContext, amount: number, bounds = getLivingTerritoryWallBounds(ctx)): void => {
  if (ctx.state.baseEnergyShortage) return;
  if (!isXInLivingTerritory(ctx, getBaseX(ctx.state), bounds)) return;
  const maxHp = getBaseMaxHp(ctx);
  const requestedHeal = amount * (1 + getChurchHealingBonus(ctx));
  const cap = maxHp * STRUCTURE_HEALING_CAP_MAX_HP_PER_SECOND;
  const remainingCap = Math.max(0, cap - (ctx.state.baseHealingCapUsed ?? 0));
  const appliedHeal = Math.min(requestedHeal, remainingCap, Math.max(0, maxHp - ctx.state.baseHp));
  if (appliedHeal <= 0) return;
  ctx.state.baseHealingCapUsed = (ctx.state.baseHealingCapUsed ?? 0) + appliedHeal;
  ctx.state.baseHp += appliedHeal;
};
const applyElementAllyBuffInRange = (ctx: VinhDaSimulationContext, sourceX: number, range: number, apply: (statuses: import('./types.ts').VinhDaStatusCollection) => void): void => {
  if (ctx.state.baseEnergyShortage) return;
  const bounds = getLivingTerritoryWallBounds(ctx);
  if (isXInLivingTerritory(ctx, getBaseX(ctx.state), bounds) && Math.abs(getBaseX(ctx.state) - sourceX) <= range){
    const statuses = ctx.state.baseStatuses ??= {};
    statuses.elementalAllyBuffSeconds = Math.max(statuses.elementalAllyBuffSeconds ?? 0, ELEMENTAL_ALLY_BUFF_SECONDS);
    apply(statuses);
  }
  for (const structure of ctx.state.structures.values()){
    const site = ctx.getBuildSite(structure.siteId);
    if (!site || !isXInLivingTerritory(ctx, site.x, bounds) || Math.abs(site.x - sourceX) > range) continue;
    const runtime = ctx.ensureStructureRuntime(structure);
    const statuses = runtime.statuses ??= {};
    statuses.elementalAllyBuffSeconds = Math.max(statuses.elementalAllyBuffSeconds ?? 0, ELEMENTAL_ALLY_BUFF_SECONDS);
    apply(statuses);
  }
};
const applyElementEffect = (ctx: VinhDaSimulationContext, enemy: Enemy, element: ElementalTowerElement, damage: number, sourceX: number, range: number): void => {
  switch (element){
    case 'Hỏa':
      {
        const statuses = ensureStatuses(enemy);
        statuses.burnSeconds = Math.max(statuses.burnSeconds ?? 0, 3);
        statuses.burnDps = Math.max(statuses.burnDps ?? 0, damage * 0.2);
      }
      break;
    case 'Mộc':
      applyElementAllyBuffInRange(ctx, sourceX, range, () => {});
      healBase(ctx, Math.max(0.1, damage * 0.05));
      break;
    case 'Thủy':
      applyElementAllyBuffInRange(ctx, sourceX, range, statuses => { statuses.elementalHealingBonus = Math.max(statuses.elementalHealingBonus ?? 0, 0.12); });
      break;
    case 'Thổ':
      applyElementAllyBuffInRange(ctx, sourceX, range, statuses => {
        statuses.elementalArmBonusPercent = Math.max(statuses.elementalArmBonusPercent ?? 0, 0.07);
        statuses.elementalResBonusPercent = Math.max(statuses.elementalResBonusPercent ?? 0, 0.07);
      });
      break;
    case 'Kim':
      applyElementAllyBuffInRange(ctx, sourceX, range, statuses => {
        statuses.elementalAtkBonusPercent = Math.max(statuses.elementalAtkBonusPercent ?? 0, 0.05);
        statuses.elementalWilBonusPercent = Math.max(statuses.elementalWilBonusPercent ?? 0, 0.05);
      });
      break;
    case 'Lôi':
      {
        const statuses = ensureStatuses(enemy);
        const key = 'elementalTower:Lôi';
        const cooldowns = statuses.paralysisSourceCooldowns ??= {};
        if ((cooldowns[key] ?? 0) <= 0){
          statuses.paralysisSeconds = Math.max(statuses.paralysisSeconds ?? 0, LIGHTNING_PARALYSIS_SECONDS);
          cooldowns[key] = LIGHTNING_PARALYSIS_COOLDOWN_SECONDS;
        }
      }
      break;
    case 'Huyết': {
      const stacks = Math.min(BLOOD_MAX_HP_STACK_CAP, (enemy.bloodMaxHpStacks ?? 0) + 1);
      if (stacks !== (enemy.bloodMaxHpStacks ?? 0)){
        enemy.bloodMaxHpStacks = stacks;
        applyElementAllyBuffInRange(ctx, sourceX, range, statuses => { statuses.elementalBloodMaxHpBonus = (statuses.elementalBloodMaxHpBonus ?? 0) + damage * 0.03; });
        healBase(ctx, damage * 0.03);
      }
      break;
    }
    case 'Ánh Sáng':
      enemy.lightVulnerableSeconds = Math.max(enemy.lightVulnerableSeconds ?? 0, 4);
      break;
    case 'Phong':
      {
        const statuses = ensureStatuses(enemy);
        const key = 'elementalTower:Phong';
        if ((statuses.slowSeconds ?? 0) > 0){
          const cooldowns = statuses.knockbackSourceCooldowns ??= {};
          if ((cooldowns[key] ?? 0) <= 0){
            enemy.x += (enemy.x < sourceX ? -1 : 1) * WIND_KNOCKBACK_DISTANCE;
            cooldowns[key] = WIND_KNOCKBACK_COOLDOWN_SECONDS;
          }
        } else {
          statuses.slowSeconds = WIND_SLOW_SECONDS;
          statuses.slowMultiplier = WIND_SLOW_MULTIPLIER;
        }
      }
      break;
  }
};

export const reduceStructureDamage = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime, attacker: Enemy | null, amount: number): number => {
    if (structure.type !== 'wall') return amount;
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5, structure.element);
  const churchBuff = ctx.getBuildSite(structure.siteId) ? getTerritoryChurchBuff(ctx, ctx.getBuildSite(structure.siteId)!.x) : {};
  const arm = (stat.arm ?? 0) * (1 + (runtime.statuses?.elementalArmBonusPercent ?? 0) + (churchBuff.buffArmPercent ?? 0));
    const res = (stat.res ?? 0) * (1 + (runtime.statuses?.elementalResBonusPercent ?? 0) + (churchBuff.buffResPercent ?? 0));
    const defenseMultiplier = ((100 / (100 + Math.max(0, arm))) + (100 / (100 + Math.max(0, res)))) / 2;
    const mitigatedAmount = amount * defenseMultiplier;
    if (structure.branchLv3 !== 'slippery' || !attacker) return mitigatedAmount;
    const cooldowns = runtime.attackerCooldowns ??= new Map<string, number>();
    const key = `slippery:${attacker.id}`;
    if ((cooldowns.get(key) ?? 0) > 0 || Math.random() >= (stat.slipperyChance ?? 0)) return mitigatedAmount;
    cooldowns.set(key, stat.slipperyCooldownSeconds ?? 3);
    return mitigatedAmount * (stat.slipperyDamageMultiplier ?? 1);
  };
export const triggerWallHitEffects = (ctx: VinhDaSimulationContext, structure: PlacedStructure, site: BuildSite, runtime: StructureRuntime, attacker: Enemy): void => {
    if (structure.type !== 'wall') return;
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5, structure.element);
    const cooldowns = runtime.attackerCooldowns ??= new Map<string, number>();
    if (structure.branchLv3 === 'spike' && stat.spikeTrueDamage && damageEnemy(ctx, attacker, stat.spikeTrueDamage)) return;
    if (structure.branchLv3 === 'shock'){
      const key = `shock:${attacker.id}`;
      if ((cooldowns.get(key) ?? 0) <= 0){
        attacker.x += (attacker.side === 'left' ? -1 : 1) * (stat.shockKnockback ?? 0);
        cooldowns.set(key, stat.shockCooldownSeconds ?? 3);
      }
    }
    if (structure.branchLv5 === 'curse'){
      const key = `curse:${attacker.id}`;
      if ((cooldowns.get(key) ?? 0) <= 0){
        const loss = attacker.maxHp * (stat.curseMaxHpPercent ?? 0);
        attacker.maxHp = Math.max(1, attacker.maxHp - loss);
        attacker.hp = Math.min(attacker.hp, attacker.maxHp);
        cooldowns.set(key, stat.curseCooldownSeconds ?? 3);
      }
    }
  };
export const damageStructure = (ctx: VinhDaSimulationContext, site: BuildSite, runtime: StructureRuntime, amount: number, attacker: Enemy | null = null): boolean => {
    const structure = ctx.state.structures.get(site.id);
    const finalAmount = structure ? reduceStructureDamage(ctx, structure, runtime, attacker, amount) : amount;
    runtime.hp -= finalAmount;
    if (structure && attacker && runtime.hp > 0) triggerWallHitEffects(ctx, structure, site, runtime, attacker);
    if (runtime.hp > 0) return false;
    ctx.deleteStructure(site.id);
    ctx.renderBuildSite(site.id);
    return true;
  };
export const damageBase = (ctx: VinhDaSimulationContext, amount: number): boolean => {
    ctx.state.baseHp = Math.max(0, ctx.state.baseHp - amount);
    return ctx.state.baseHp <= 0;
  };
const getEnemyTemplate = (enemy: Enemy): EnemyTemplate => ENEMY_TEMPLATES[enemy.kind] ?? DEFAULT_ENEMY_TEMPLATE;
const getEnemyPrimaryTargetX = (ctx: VinhDaSimulationContext, enemy: Enemy): number => enemy.canFly ? ctx.state.leaderX : getBaseX(ctx.state);
const getEnemyMoveDirection = (ctx: VinhDaSimulationContext, enemy: Enemy, targetX = getEnemyPrimaryTargetX(ctx, enemy)): number => enemy.x < targetX ? 1 : -1;
export const getStructureAhead = (ctx: VinhDaSimulationContext, enemy: Enemy, range: number): { site: BuildSite; runtime: StructureRuntime } | null => {
    const direction = getEnemyMoveDirection(ctx, enemy);
    let closest: { site: BuildSite; runtime: StructureRuntime; distance: number } | null = null;
    for (const structure of ctx.state.structures.values()){
      if (structure.type === 'wall') continue;
      const site = ctx.getBuildSite(structure.siteId);
      if (!site) continue;
      const distance = Math.abs(enemy.x - site.x);
      const isAhead = direction > 0 ? site.x >= enemy.x : site.x <= enemy.x;
      if (!isAhead || distance > range) continue;
      const runtime = ctx.ensureStructureRuntime(structure);
      if (runtime.hp <= 0 || (closest && distance >= closest.distance)) continue;
      closest = { site, runtime, distance };
    }
    return closest ? { site: closest.site, runtime: closest.runtime } : null;
  };
const tryEnemyAttack = (enemy: Enemy, template: EnemyTemplate, attack: () => void): boolean => {
    if (enemy.attackCooldown > 0) return true;
    attack();
    enemy.attackCooldown = template.attackCooldown;
    return true;
  };
export const getEnemyEffectiveSpeed = (ctx: VinhDaSimulationContext, enemy: Enemy): number => {
  if (ctx.state.dayNightPhase === 'day' && enemy.moduleLeashUntilNight) return 0;
  if (ctx.state.dayNightPhase === 'night' && enemy.moduleLeashUntilNight) enemy.moduleLeashUntilNight = false;
    const statusMultiplier = enemy.statuses?.slowSeconds && enemy.statuses.slowSeconds > 0 ? (enemy.statuses.slowMultiplier ?? 1) : 1;
    if (enemy.canFly) return enemy.baseSpeed * statusMultiplier;
    for (const siteId of ctx.structureSiteIdsOfType('swamp')){
      const site = ctx.getBuildSite(siteId);
      if (site && Math.abs(enemy.x - site.x) <= SWAMP_RADIUS){
        if (enemy.weight >= 1 && enemy.weight < 2) return enemy.baseSpeed * 0.5 * statusMultiplier;
        if (enemy.weight >= 2 && enemy.weight < 3) return enemy.baseSpeed * 0.75 * statusMultiplier;
        return enemy.baseSpeed * statusMultiplier;
      }
    }
    return enemy.baseSpeed * statusMultiplier;
  };
const moveEnemyToward = (ctx: VinhDaSimulationContext, enemy: Enemy, targetX: number, dt: number, speed = getEnemyEffectiveSpeed(ctx, enemy)): void => {
    enemy.x += getEnemyMoveDirection(ctx, enemy, targetX) * speed * dt;
  };
const getEnemyDamageWithApostleAura = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate): number => {
  if (enemy.kind === 'apostle') return template.damage;
  return template.damage * (ctx.state.enemies.some(source => source.kind === 'apostle' && source.id !== enemy.id && Math.abs(source.x - enemy.x) <= APOSTLE_COMMAND_AURA_RADIUS) ? APOSTLE_COMMAND_AURA_MULTIPLIER : 1);
};

export const attackEnemyTarget = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, targetX: number, dt: number): void => {
    if (Math.abs(enemy.x - targetX) <= template.attackRange){
      tryEnemyAttack(enemy, template, () => { applyContaminationHit(ctx, enemy); applyBaseBleedHit(ctx, enemy); damageBase(ctx, getEnemyDamageWithApostleAura(ctx, enemy, template)); });
      return;
    }
    moveEnemyToward(ctx, enemy, targetX, dt);
  };
export const updateMeleeBasicEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    const wall = getBlockingWall(ctx, enemy);
    if (wall){
      tryEnemyAttack(enemy, template, () => { applyBleedHit(wall.runtime, enemy); damageStructure(ctx, wall.site, wall.runtime, getEnemyDamageWithApostleAura(ctx, enemy, template), enemy); });
      return;
    }
    attackEnemyTarget(ctx, enemy, template, getEnemyPrimaryTargetX(ctx, enemy), dt);
  };
export const updateSuicideBomberEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    const wall = getBlockingWall(ctx, enemy);
    if (wall){
      tryEnemyAttack(enemy, template, () => {
        applyContaminationHit(ctx, enemy);
        applyBleedHit(wall.runtime, enemy);
        damageStructure(ctx, wall.site, wall.runtime, getEnemyDamageWithApostleAura(ctx, enemy, template), enemy);
      });
      return;
    }
    if (Math.abs(enemy.x - getBaseX(ctx.state)) <= template.attackRange){
      tryEnemyAttack(enemy, template, () => {
        applyContaminationHit(ctx, enemy);
        applyBaseBleedHit(ctx, enemy);
        damageBase(ctx, getEnemyDamageWithApostleAura(ctx, enemy, template));
      });
      return;
    }
    moveEnemyToward(ctx, enemy, getBaseX(ctx.state), dt);
  };
export const updateFlyingEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, index: number, dt: number): void => {
    const targetX = getEnemyPrimaryTargetX(ctx, enemy);
    const distance = Math.abs(enemy.x - targetX);
    if (distance < 3 * 100){
      enemy.birdAccelerating = false;
      moveEnemyToward(ctx, enemy, enemy.x + (enemy.x < targetX ? -1 : 1) * template.attackRange, dt, enemy.flySpeed);
      return;
    }
    enemy.birdAccelerating = distance <= template.attackRange;
    if (distance <= template.attackRange && enemy.birdAccelerating){
      damageLeader(ctx, distance <= 6 * 100 ? 1.2 : distance <= 9 * 100 ? 2 : 2.5);
      removeEnemyAt(ctx, index, false);
      return;
    }
    moveEnemyToward(ctx, enemy, targetX, dt, enemy.birdAccelerating ? 3.5 * 100 : enemy.flySpeed);
  };
export const updateDarkMageEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    const wall = getBlockingWall(ctx, enemy);
    if (wall){
      tryEnemyAttack(enemy, template, () => { applyBleedHit(wall.runtime, enemy); damageStructure(ctx, wall.site, wall.runtime, getEnemyDamageWithApostleAura(ctx, enemy, template), enemy); });
      return;
    }
    if (Math.abs(enemy.x - getBaseX(ctx.state)) > template.attackRange){
      moveEnemyToward(ctx, enemy, getBaseX(ctx.state), dt);
      return;
    }
    enemy.mageOrbTimer = (enemy.mageOrbTimer ?? 0) + dt;
    while (enemy.mageOrbTimer >= 2 && (enemy.mageOrbs ?? 0) < 3){
      enemy.mageOrbTimer -= 2;
      enemy.mageOrbs = (enemy.mageOrbs ?? 0) + 1;
    }
    if ((enemy.mageOrbs ?? 0) >= 3){
      tryEnemyAttack(enemy, template, () => {
        damageBase(ctx, Math.max(enemy.atk, enemy.wil) * (enemy.mageOrbs ?? 3));
        enemy.mageOrbs = 0;
        enemy.mageOrbTimer = 0;
      });
    }
  };
export const damageDragonStructureCounter = (ctx: VinhDaSimulationContext, site: BuildSite, runtime: StructureRuntime): boolean => {
    const structure = ctx.state.structures.get(site.id);
    if (!structure || structure.type === 'wall') return false;
    runtime.dragonHitCount = (runtime.dragonHitCount ?? 0) + 1;
    if (runtime.dragonHitCount < structure.level) return false;
    ctx.deleteStructure(site.id);
    ctx.renderBuildSite(site.id);
    return true;
  };
const getDragonDamage = (enemy: Enemy, multiplier = 1): number => {
    const rageMultiplier = enemy.hp <= enemy.maxHp * 0.3 ? 1.1 : 1;
    return Math.max(enemy.atk, enemy.wil) * rageMultiplier * multiplier;
  };
const applyDragonBreath = (ctx: VinhDaSimulationContext, enemy: Enemy, damage: number, applyDestroy: boolean): void => {
    const direction = getEnemyMoveDirection(ctx, enemy, getBaseX(ctx.state));
    if (direction > 0 ? getBaseX(ctx.state) >= enemy.x : getBaseX(ctx.state) <= enemy.x){
      if (Math.abs(enemy.x - getBaseX(ctx.state)) <= enemy.aoeRadius) damageBase(ctx, damage);
    }
    for (let i = ctx.state.enemies.length - 1; i >= 0; i -= 1){
      const target = ctx.state.enemies[i];
      if (!target || target.id === enemy.id) continue;
      const ahead = direction > 0 ? target.x >= enemy.x : target.x <= enemy.x;
      if (!ahead || Math.abs(target.x - enemy.x) > enemy.aoeRadius) continue;
      if (damageEnemy(ctx, target, damage)) removeEnemyAt(ctx, i, true);
    }
    const structureAhead = getStructureAhead(ctx, enemy, applyDestroy ? 3 * 100 : enemy.aoeRadius);
    if (applyDestroy && structureAhead && (enemy.dragonDestroyCooldown ?? 0) <= 0){
      damageDragonStructureCounter(ctx, structureAhead.site, structureAhead.runtime);
      enemy.dragonDestroyCooldown = 10;
    }
  };

export const updateApostleEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    enemy.apostleState = 'ambush';
    const wall = getBlockingWall(ctx, enemy);
    if (wall){
      enemy.apostleState = 'assaultStructure';
      tryEnemyAttack(enemy, template, () => {
        applyBleedHit(wall.runtime, enemy);
        damageStructure(ctx, wall.site, wall.runtime, getEnemyDamageWithApostleAura(ctx, enemy, template), enemy);
      });
      return;
    }
    const structure = getStructureAhead(ctx, enemy, template.attackRange);
    if (structure){
      enemy.apostleState = 'assaultStructure';
      tryEnemyAttack(enemy, template, () => {
        const statuses = ensureStatuses(structure.runtime);
        statuses.contaminationStacks = (statuses.contaminationStacks ?? 0) + 1;
        damageStructure(ctx, structure.site, structure.runtime, getEnemyDamageWithApostleAura(ctx, enemy, template), enemy);
      });
      return;
    }
    enemy.apostleState = 'assaultBase';
    if (Math.abs(enemy.x - getBaseX(ctx.state)) <= template.attackRange){
      tryEnemyAttack(enemy, template, () => {
        applyContaminationHit(ctx, enemy);
        damageBase(ctx, getEnemyDamageWithApostleAura(ctx, enemy, template));
      });
      return;
    }
    moveEnemyToward(ctx, enemy, getBaseX(ctx.state), dt);
  };

export const updateResentfulDragonEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    const inBreathRange = Math.abs(enemy.x - getBaseX(ctx.state)) <= template.aoeRadius || Boolean(getStructureAhead(ctx, enemy, template.aoeRadius));
    enemy.dragonUltimateCooldown = Math.max(0, (enemy.dragonUltimateCooldown ?? 20) - dt);
    enemy.dragonDestroyCooldown = Math.max(0, (enemy.dragonDestroyCooldown ?? 0) - dt);
    if (inBreathRange){
      if ((enemy.dragonUltimateCooldown ?? 0) <= 0){
        applyDragonBreath(ctx, enemy, getDragonDamage(enemy, 2), true);
        enemy.dragonUltimateCooldown = 20;
        enemy.attackCooldown = template.attackCooldown;
        return;
      }
      tryEnemyAttack(enemy, template, () => { applyDragonBreath(ctx, enemy, getDragonDamage(enemy), true); });
      return;
    }
    moveEnemyToward(ctx, enemy, getBaseX(ctx.state), dt, enemy.baseSpeed);
  };
const isUnitInLandmineTriggerRadius = (ctx: VinhDaSimulationContext, site: BuildSite): boolean => (
    Math.abs(ctx.state.leaderX - site.x) <= LANDMINE_TRIGGER_RADIUS
    || ctx.state.enemies.some(enemy => Math.abs(enemy.x - site.x) <= LANDMINE_TRIGGER_RADIUS)
  );
export const explodeLandmine = (ctx: VinhDaSimulationContext, site: BuildSite): void => {
    for (let i = ctx.state.enemies.length - 1; i >= 0; i -= 1){
      const enemy = ctx.state.enemies[i];
      if (enemy && Math.abs(enemy.x - site.x) <= LANDMINE_BLAST_RADIUS && damageEnemy(ctx, enemy, LANDMINE_TRUE_DAMAGE)) removeEnemyAt(ctx, i, true);
    }
    ctx.deleteStructure(site.id);
    ctx.renderBuildSite(site.id);
  };

const tickStatusCollection = (statuses: import('./types.ts').VinhDaStatusCollection | undefined, dt: number): number => {
  if (!statuses) return 0;
  tickStatusCooldowns(statuses.paralysisSourceCooldowns, dt);
  tickStatusCooldowns(statuses.knockbackSourceCooldowns, dt);
  statuses.paralysisSeconds = Math.max(0, (statuses.paralysisSeconds ?? 0) - dt);
  statuses.slowSeconds = Math.max(0, (statuses.slowSeconds ?? 0) - dt);
  statuses.burnSeconds = Math.max(0, (statuses.burnSeconds ?? 0) - dt);
  if (statuses.slowSeconds <= 0) statuses.slowMultiplier = undefined;
  if (statuses.burnSeconds <= 0) statuses.burnDps = undefined;
  statuses.elementalAllyBuffSeconds = Math.max(0, (statuses.elementalAllyBuffSeconds ?? 0) - dt);
  if (statuses.elementalAllyBuffSeconds <= 0){
    statuses.elementalHealingBonus = undefined;
    statuses.elementalArmBonusPercent = undefined;
    statuses.elementalResBonusPercent = undefined;
    statuses.elementalAtkBonusPercent = undefined;
    statuses.elementalWilBonusPercent = undefined;
  }
  let bleedStacks = statuses.bleedStacks ?? [];
  let activeBleedStacks = 0;
  for (const stack of bleedStacks){
    if (stack.remainingSeconds > 0) activeBleedStacks += 1;
    stack.remainingSeconds = Math.max(0, stack.remainingSeconds - dt);
  }
  bleedStacks = bleedStacks.filter(stack => stack.remainingSeconds > 0);
  if (bleedStacks.length > 0) statuses.bleedStacks = bleedStacks;
  else statuses.bleedStacks = undefined;
  return activeBleedStacks;
};
const tickEnemyStatuses = (ctx: VinhDaSimulationContext, enemy: Enemy, dt: number): boolean => {
  const activeBurnDps = (enemy.statuses?.burnSeconds ?? 0) > 0 ? (enemy.statuses?.burnDps ?? 0) : 0;
  const bleedStacks = tickStatusCollection(enemy.statuses, dt);
  const bleedDamage = enemy.maxHp * BLEED_MAX_HP_DPS_PERCENT * bleedStacks * dt;
  return damageEnemy(ctx, enemy, activeBurnDps * dt + bleedDamage);
};

export const applyElementalRegionEnemyEffect = (ctx: VinhDaSimulationContext, enemy: Enemy, dt: number): void => {
  const region = getElementalRegionAtX(ctx.state.elementalRegions, enemy.x);
  if (!region) return;
  const statuses = ensureStatuses(enemy);
  switch (region.kind){
    case 'fire':
      statuses.burnSeconds = Math.max(statuses.burnSeconds ?? 0, ELEMENTAL_REGION_FIRE_BURN_SECONDS);
      statuses.burnDps = Math.max(statuses.burnDps ?? 0, enemy.maxHp * ELEMENTAL_REGION_FIRE_BURN_MAX_HP_PER_SECOND);
      break;
    case 'light':
      enemy.lightVulnerableSeconds = Math.max(enemy.lightVulnerableSeconds ?? 0, ELEMENTAL_REGION_LIGHT_VULNERABLE_SECONDS);
      if (statuses.contaminationStacks) statuses.contaminationStacks = Math.max(0, statuses.contaminationStacks - ELEMENTAL_REGION_LIGHT_CONTAMINATION_CLEANSE_PER_SECOND * dt);
      break;
    case 'dark': {
      const cooldowns = statuses.paralysisSourceCooldowns ??= {};
      if ((cooldowns['elementalRegion:dark'] ?? 0) <= 0){
        statuses.contaminationStacks = (statuses.contaminationStacks ?? 0) + 1;
        cooldowns['elementalRegion:dark'] = ELEMENTAL_REGION_DARK_CONTAMINATION_COOLDOWN_SECONDS;
      }
      statuses.slowSeconds = Math.max(statuses.slowSeconds ?? 0, ELEMENTAL_REGION_DARK_CONTAMINATION_SECONDS);
      break;
    }
    case 'thunder': {
      const cooldowns = statuses.paralysisSourceCooldowns ??= {};
      if ((cooldowns['elementalRegion:thunder'] ?? 0) <= 0 && Math.random() < ELEMENTAL_REGION_THUNDER_PARALYSIS_CHANCE_PER_SECOND * dt){
        statuses.paralysisSeconds = Math.max(statuses.paralysisSeconds ?? 0, ELEMENTAL_REGION_THUNDER_PARALYSIS_SECONDS);
        cooldowns['elementalRegion:thunder'] = ELEMENTAL_REGION_THUNDER_PARALYSIS_COOLDOWN_SECONDS;
      }
      break;
    }
    case 'earth':
      if (!statuses.elementalRegionEarthBonusApplied){
        enemy.arm = (enemy.arm ?? 0) * (1 + ELEMENTAL_REGION_EARTH_DEFENSE_BONUS_PERCENT);
        enemy.res = (enemy.res ?? 0) * (1 + ELEMENTAL_REGION_EARTH_DEFENSE_BONUS_PERCENT);
        statuses.elementalRegionEarthBonusApplied = true;
      }
      break;
    case 'wood':
    case 'water':
    case 'metal':
    case 'blood':
    case 'wind':
      break;
  }
};
const tickBaseStatuses = (ctx: VinhDaSimulationContext, dt: number): void => {
  const bleedStacks = tickStatusCollection(ctx.state.baseStatuses, dt);
  if (bleedStacks <= 0) return;
  damageBase(ctx, getBaseStat(ctx).hp * BLEED_MAX_HP_DPS_PERCENT * bleedStacks * dt);
};
const tickStructureStatuses = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime, dt: number): void => {
  const bleedStacks = tickStatusCollection(runtime.statuses, dt);
  if (bleedStacks <= 0 || runtime.hp <= 0) return;
  const site = ctx.getBuildSite(structure.siteId);
  if (site) damageStructure(ctx, site, runtime, ctx.getStructureMaxHp(structure) * BLEED_MAX_HP_DPS_PERCENT * bleedStacks * dt);
};

export const updateEnemies = (ctx: VinhDaSimulationContext, dt: number): void => {
    if (ctx.state.dayNightPhase === 'night') ctx.state.enemySpawnTimer += dt;
    else ctx.state.enemySpawnTimer = 0;
    ctx.state.leaderAttackCooldown = Math.max(0, ctx.state.leaderAttackCooldown - dt);
    while (ctx.state.dayNightPhase === 'night' && ctx.state.enemySpawnTimer >= ENEMY_SPAWN_INTERVAL){
      ctx.state.enemySpawnTimer -= ENEMY_SPAWN_INTERVAL;
      if (!spawnWaveEnemy(ctx)) break;
    }

    for (let i = ctx.state.enemies.length - 1; i >= 0; i -= 1){
      const enemy = ctx.state.enemies[i];
      if (!enemy) continue;
      enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
      enemy.paralysisCooldown = Math.max(0, (enemy.paralysisCooldown ?? 0) - dt);
      applyElementalRegionEnemyEffect(ctx, enemy, dt);
      if (tickEnemyStatuses(ctx, enemy, dt)){ removeEnemyAt(ctx, i, true); continue; }
      enemy.lightVulnerableSeconds = Math.max(0, (enemy.lightVulnerableSeconds ?? 0) - dt);
      if (enemy.regen){
        enemy.regenTimer = (enemy.regenTimer ?? 0) + dt;
        const interval = enemy.kind === 'resentfulDragon' ? 2 : 5;
        while (enemy.regenTimer >= interval){
          enemy.regenTimer -= interval;
          const amount = enemy.kind === 'resentfulDragon' ? enemy.maxHp * 0.03 : enemy.tier === 1.3 ? 3 : enemy.tier === 1.2 ? 2 : 1;
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + amount);
        }
      }
      if ((enemy.statuses?.paralysisSeconds ?? 0) > 0) continue;
      const template = getEnemyTemplate(enemy);
      switch (enemy.kind){
        case 'suicideBomber':
          updateSuicideBomberEnemy(ctx, enemy, template, dt);
          break;
        case 'mutantBird':
          updateFlyingEnemy(ctx, enemy, template, i, dt);
          break;
        case 'darkMage':
          updateDarkMageEnemy(ctx, enemy, template, dt);
          break;
        case 'resentfulDragon':
          updateResentfulDragonEnemy(ctx, enemy, template, dt);
          break;
        case 'twisted':
        case 'crawler':
        case 'madDog':
        case 'ironMan':
          updateMeleeBasicEnemy(ctx, enemy, template, dt);
          break;
          case 'apostle':
          updateApostleEnemy(ctx, enemy, template, dt);
          break;
      }
      if (!ctx.state.enemies.includes(enemy)) continue;
      if (ctx.state.leaderAttackCooldown === 0 && Math.abs(enemy.x - ctx.state.leaderX) <= LEADER_ATTACK_RANGE){
        ctx.state.leaderAttackCooldown = LEADER_BASIC_ATTACK_COOLDOWN_SECONDS;
        if (damageEnemy(ctx, enemy, LEADER_BASIC_ATTACK_DAMAGE + getTerritoryBaseAllyAtkBonus(ctx, ctx.state.leaderX))) removeEnemyAt(ctx, i, true);
      }
    }
  };

const applyBaseBuffDailyUpkeep = (ctx: VinhDaSimulationContext): void => {
  if ((ctx.state.baseLevel ?? 0) <= 0) return;
  let remaining = BASE_BUFF_DAILY_UPKEEP;
  const liquid = ctx.state.baseLiquidHnt ?? 0;
  const liquidPaid = Math.min(liquid, remaining);
  ctx.state.baseLiquidHnt = liquid - liquidPaid;
  remaining -= liquidPaid;
  if (remaining > 0){
    const hardPaid = Math.min(ctx.state.condensedHnt ?? ctx.state.bloodSealStone, remaining);
    ctx.state.condensedHnt = Math.max(0, (ctx.state.condensedHnt ?? ctx.state.bloodSealStone) - hardPaid);
    ctx.state.bloodSealStone = ctx.state.condensedHnt;
    remaining -= hardPaid;
  }
  ctx.state.baseEnergyShortage = remaining > 0;
  ctx.renderEconomy();
};

const convertContaminationToApostles = (ctx: VinhDaSimulationContext): void => {
  const stacks = getBaseContaminationStacks(ctx);
  const apostleCount = Math.floor(stacks / CONTAMINATION_APOSTLE_STACKS);
  if (apostleCount <= 0) return;
  setBaseContaminationStacks(ctx, stacks % CONTAMINATION_APOSTLE_STACKS);
  for (let i = 0; i < apostleCount; i += 1){
    spawnEnemy(ctx, (ctx.state.nextEnemyId + i) % 2 === 0 ? 'left' : 'right', 'apostle', undefined, true);
  }
};

export const rollVinhDaMerchantForDay = (ctx: VinhDaSimulationContext): void => {
  const dayIndex = ctx.state.merchantDayIndex ?? 0;
  const nextRollDay = ctx.state.nextMerchantRollDay ?? 3;
  ctx.state.merchantPresent = false;
  ctx.state.merchantOpen = false;
  if (dayIndex < nextRollDay) return;
  ctx.state.nextMerchantRollDay = nextRollDay + 3;
  ctx.state.merchantPresent = rollVinhDaMerchantPresence(ctx.state.dayNightPhase, () => nextRngValue(ctx.state.lootRng));
  ctx.state.merchantStock = ctx.state.merchantPresent ? createVinhDaMerchantStock(ctx.state.mapTier, () => nextRngValue(ctx.state.lootRng)) : [];
};

export const updateDayNightTimer = (ctx: VinhDaSimulationContext, dt: number): void => {
    if (ctx.state.dayNightPhase === 'escort'){
      updateEscortMovement(ctx, dt);
      ctx.renderDayNightTimer();
      return;
    }
  ctx.state.phaseRemainingSeconds -= dt;
    while (ctx.state.phaseRemainingSeconds <= 0){
      ctx.state.phaseRemainingSeconds += DAY_DURATION_SECONDS;
      ctx.state.dayNightPhase = ctx.state.dayNightPhase === 'night' ? 'day' : 'night';
      if (ctx.state.dayNightPhase === 'day'){
        ctx.state.merchantDayIndex = (ctx.state.merchantDayIndex ?? 0) + 1;
        clearEnemiesWithoutReward(ctx);
        applyBaseBuffDailyUpkeep(ctx);
        convertContaminationToApostles(ctx);
      rollVinhDaMerchantForDay(ctx);
      } else {
        ctx.state.merchantPresent = false;
        ctx.state.merchantOpen = false;
        ctx.state.nightIndex += 1;
        const waveConfig = getVinhDaWaveConfig(ctx.state.nightIndex, ctx.state.mapTier);
        ctx.state.waveThreatBudgetRemaining = getScaledThreatBudget(waveConfig.threatBudget, ctx.state.nightIndex);
        applyLeaderNightShield(ctx);
      }
    }
    ctx.renderDayNightTimer();
  };
export const updateStructureRuntimeTimers = (ctx: VinhDaSimulationContext, runtime: StructureRuntime, dt: number): void => {
  runtime.biochemicalCooldown = Math.max(0, (runtime.biochemicalCooldown ?? 0) - dt);
  runtime.prayerTimer = Math.max(0, (runtime.prayerTimer ?? 0) - dt);
  runtime.contaminationCleanseTimer = Math.max(0, (runtime.contaminationCleanseTimer ?? 0) - dt);
  runtime.soldierSpawnTimer = Math.max(0, (runtime.soldierSpawnTimer ?? 0) - dt);
    for (const [key, remaining] of runtime.attackerCooldowns ?? []){
      const next = Math.max(0, remaining - dt);
      if (next > 0) runtime.attackerCooldowns?.set(key, next);
      else runtime.attackerCooldowns?.delete(key);
    }
  };
const getWallSide = (site: BuildSite): Side | null => {
    if (site.x <= CASTLE_OUTER_LEFT) return 'left';
    if (site.x >= CASTLE_OUTER_RIGHT) return 'right';
    return null;
  };
const findLinkedWall = (ctx: VinhDaSimulationContext, source: PlacedStructure, sourceSite: BuildSite): PlacedStructure | null => {
    const sourceSide = getWallSide(sourceSite);
    if (!sourceSide) return null;
    let closest: { structure: PlacedStructure; distance: number } | null = null;
    for (const siteId of ctx.structureSiteIdsOfType('wall')){
      if (siteId === source.siteId) continue;
      const candidate = ctx.state.structures.get(siteId);
      const candidateSite = ctx.getBuildSite(siteId);
      if (!candidate || !candidateSite || getWallSide(candidateSite) === sourceSide) continue;
      const distance = Math.abs(candidateSite.x - sourceSite.x);
      if (!closest || distance < closest.distance) closest = { structure: candidate, distance };
    }
    return closest?.structure ?? null;
  };
export const updateWallLink = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime): void => {
    if (structure.type !== 'wall' || structure.level < 5 || structure.branchLv5 !== 'link') return;
    const site = ctx.getBuildSite(structure.siteId);
    if (!site) return;
    const linked = findLinkedWall(ctx, structure, site);
    if (!linked) return;
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5, structure.element);
    const sourceMaxHp = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5, structure.element).hp;
    const linkedRuntime = ctx.ensureStructureRuntime(linked);
    runtime.linkedWallSiteId = linked.siteId;
    linkedRuntime.linkedMaxHpBonus = (linkedRuntime.linkedMaxHpBonus ?? 0) + sourceMaxHp * (stat.linkedHpBonusPercent ?? 0);
    linkedRuntime.linkedRegenBonus = (linkedRuntime.linkedRegenBonus ?? 0) + (stat.hpRegen ?? 0) * (stat.linkedRegenShare ?? 0);
};
export const updateWallRegeneration = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime, dt: number): void => {
    if (structure.type !== 'wall') return;
    const maxHp = ctx.getStructureMaxHp(structure);
    const regen = (getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5, structure.element).hpRegen ?? 0) + (runtime.linkedRegenBonus ?? 0);
    runtime.hp = Math.min(maxHp, runtime.hp + regen * dt);
  };
export const updateBiochemicalWall = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime): void => {
    if (structure.type !== 'wall' || structure.level < 5 || structure.branchLv5 !== 'biochemical' || (runtime.biochemicalCooldown ?? 0) > 0) return;
    const site = ctx.getBuildSite(structure.siteId);
    if (!site) return;
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5, structure.element);
    const candidates = ctx.state.enemies
      .map((enemy, index) => ({ enemy, index, sort: Math.random() }))
      .filter(item => Math.abs(item.enemy.x - site.x) <= (stat.biochemicalRange ?? 0))
      .sort((a, b) => a.sort - b.sort)
      .slice(0, stat.biochemicalMaxTargets ?? 3)
      .sort((a, b) => b.index - a.index);
    if (candidates.length <= 0) return;
    for (const { enemy, index } of candidates){
      runtime.hp = Math.min(ctx.getStructureMaxHp(structure), runtime.hp + Math.max(0, enemy.hp));
      removeEnemyAt(ctx, index, false);
    }
    runtime.biochemicalCooldown = stat.biochemicalCooldownSeconds ?? 5;
  };


const canTriggerSpikeTrap = (enemy: Enemy): boolean => enemy.weight >= SPIKE_TRAP_MIN_WEIGHT && enemy.weight < SPIKE_TRAP_MAX_WEIGHT_EXCLUSIVE;
const updateSpikeTrap = (ctx: VinhDaSimulationContext, site: BuildSite): void => {
  for (const enemy of ctx.state.enemies){
    if (enemy.canFly || !canTriggerSpikeTrap(enemy) || Math.abs(enemy.x - site.x) > SPIKE_TRAP_RADIUS) continue;
    const statuses = ensureStatuses(enemy);
    statuses.slowSeconds = Math.max(statuses.slowSeconds ?? 0, SPIKE_TRAP_SLOW_SECONDS);
    statuses.slowMultiplier = Math.min(statuses.slowMultiplier ?? 1, SPIKE_TRAP_SLOW_MULTIPLIER);
    addBleedStack(enemy);
  }
};
const updateAntiAirCannon = (ctx: VinhDaSimulationContext, structure: PlacedStructure, site: BuildSite, runtime: StructureRuntime, dt: number): void => {
  if (structure.type !== 'antiAirCannon') return;
  const stat = getStructureLevelStat('antiAirCannon', structure.level, structure.branchLv3, structure.branchLv5);
  runtime.cooldown = Math.max(0, runtime.cooldown - dt);
  if ((runtime.burstShotsRemaining ?? 0) <= 0 && runtime.cooldown <= 0) runtime.burstShotsRemaining = stat.burstShotCount ?? 1;
  if (runtime.cooldown > 0 || (runtime.burstShotsRemaining ?? 0) <= 0) return;
  const target = ctx.state.enemies.find(enemy => (stat.affectsGroundAtLv6 || enemy.canFly) && Math.abs(enemy.x - site.x) <= (stat.range ?? 0));
  if (!target) return;
  runtime.burstShotsRemaining = Math.max(0, (runtime.burstShotsRemaining ?? 1) - 1);
  runtime.cooldown = (runtime.burstShotsRemaining ?? 0) > 0 ? (stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN) : (stat.reloadSeconds ?? stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN);
  hitStructureTarget(ctx, target, stat.damage ?? 0);
};
const getStructureTargetsInRange = (ctx: VinhDaSimulationContext, site: BuildSite, stat: { range?: number; maxTargets?: number }): Enemy[] => ctx.state.enemies
  .filter(enemy => Math.abs(enemy.x - site.x) <= (stat.range ?? 0))
  .slice(0, stat.maxTargets ?? 1);

const hitStructureTarget = (ctx: VinhDaSimulationContext, target: Enemy, damage: number, atkRatio = 0.5, ignoreDefenseBelow = 0): void => {
  if (damageEnemy(ctx, target, damage, atkRatio, ignoreDefenseBelow)) removeEnemyAt(ctx, ctx.state.enemies.indexOf(target), true);
};

const updateGravityCannon = (ctx: VinhDaSimulationContext, structure: PlacedStructure, site: BuildSite, runtime: StructureRuntime, dt: number): void => {
  if (structure.type !== 'gravityCannon') return;
  const stat = getStructureLevelStat('gravityCannon', structure.level, structure.branchLv3);
  runtime.cooldown = Math.max(0, runtime.cooldown - dt);
  if (structure.level >= 6 && runtime.gravityEnabled === undefined) runtime.gravityEnabled = true;
  if (structure.level >= 6 && runtime.gravityEnabled === false) return;
  if (runtime.cooldown > 0) return;
  const minWeight = stat.minAffectedWeight ?? 0;
  const maxWeight = stat.maxAffectedWeight ?? 0;
  const triggerRadius = stat.triggerRadius ?? stat.range ?? 0;
  const center = ctx.state.enemies.find(enemy => !enemy.canFly && enemy.weight >= minWeight && enemy.weight <= maxWeight && Math.abs(enemy.x - site.x) <= triggerRadius)?.x;
  if (center === undefined){
    runtime.gravityChargeSeconds = 0;
    return;
  }
  const needsCharge = structure.branchLv3 === 'clearField' && structure.level >= 4;
  if (needsCharge){
    runtime.gravityChargeSeconds = (runtime.gravityChargeSeconds ?? 0) + dt;
    if (runtime.gravityChargeSeconds < (stat.chargeSeconds ?? 10)) return;
  }
  for (const enemy of [...ctx.state.enemies]){
    if (enemy.canFly || enemy.weight < minWeight || enemy.weight > maxWeight || Math.abs(enemy.x - center) > (stat.pullRadius ?? 0)) continue;
    const isBoss = enemy.kind === 'resentfulDragon' || enemy.kind === 'fleshRemnant' || enemy.ultimate === 'dragon-rage';
    const effectMultiplier = isBoss ? (stat.bossEffectMultiplier ?? 1) : 1;
    hitStructureTarget(ctx, enemy, enemy.maxHp * (stat.damageMaxHpPercent ?? 0) * effectMultiplier, 1);
    if (enemy.hp <= 0) continue;
    const direction = enemy.x >= site.x ? 1 : -1;
    const launchDistance = Math.min(stat.maxLaunchDistance ?? 0, (stat.launchSpeed ?? 0) * (stat.pullDurationSeconds ?? 1));
    const bossClamp = isBoss ? metersToWorldUnits(25) : launchDistance;
    enemy.x += direction * Math.min(launchDistance, bossClamp) * effectMultiplier;
    const statuses = ensureStatuses(enemy);
    statuses.slowSeconds = Math.max(statuses.slowSeconds ?? 0, 1);
    statuses.slowMultiplier = Math.min(statuses.slowMultiplier ?? 1, 0.65);
  }
  runtime.gravityChargeSeconds = 0;
  runtime.cooldown = stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN;
};

const updateBaseSupport = (ctx: VinhDaSimulationContext, dt: number): void => {
  if (ctx.state.baseEnergyShortage) return;
  const stat = getBaseStat(ctx);
  const territoryBounds = getLivingTerritoryWallBounds(ctx);
  if (!isXInLivingTerritory(ctx, getBaseX(ctx.state), territoryBounds)) return;
  if (ctx.state.dayNightPhase === 'night') applyLeaderNightShield(ctx);
  if ((stat.emergencyHealPercent ?? 0) > 0 && getLeaderHp(ctx) > 0 && getLeaderHp(ctx) <= getLeaderMaxHp(ctx) * 0.12 && (ctx.state.leaderEmergencyCooldownUntilNight ?? 0) <= ctx.state.nightIndex){
    healLeader(ctx, getLeaderMaxHp(ctx) * (stat.emergencyHealPercent ?? 0));
    ctx.state.baseHp = Math.max(0, ctx.state.baseHp - stat.hp * (stat.emergencyBaseSelfDamagePercent ?? 0));
    ctx.state.leaderEmergencyCooldownUntilNight = ctx.state.nightIndex + (stat.emergencyCooldownNights ?? 2) + 1;
  }
  const leaderFlatHeal = stat.healPerSecond ?? 0;
  const leaderPercentHeal = getLeaderMaxHp(ctx) * (stat.leaderHealMaxHpPercentPerSecond ?? 0);
  if (leaderFlatHeal + leaderPercentHeal > 0) healLeaderFromStructure(ctx, (leaderFlatHeal + leaderPercentHeal) * dt, dt);
  const allyHeal = stat.allyHealPerSecond ?? 0;
  if (allyHeal > 0){
    for (const structure of ctx.state.structures.values()){
      const site = ctx.getBuildSite(structure.siteId);
      if (!site || !isXInLivingTerritory(ctx, site.x, territoryBounds)) continue;
      const runtime = ctx.ensureStructureRuntime(structure);
      if (!runtime.soldiers) continue;
      for (const soldier of runtime.soldiers) soldier.hp = Math.min(soldier.maxHp ?? soldier.hp, soldier.hp + capStructureHeal(soldier.maxHp ?? soldier.hp, allyHeal * dt, dt));
    }
  }
};
const updateChurch = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime, dt: number): void => {
  if (ctx.state.baseEnergyShortage) return;
  if (structure.type !== 'church') return;
  const site = ctx.getBuildSite(structure.siteId);
  const territoryBounds = getLivingTerritoryWallBounds(ctx);
  if (!site || !isXInLivingTerritory(ctx, site.x, territoryBounds) || !isXInLivingTerritory(ctx, getBaseX(ctx.state), territoryBounds)) return;
  const stat = getStructureLevelStat('church', structure.level);
  if ((stat.baseHealMaxHpPercentPerSecond ?? 0) > 0) healBase(ctx, getBaseMaxHp(ctx) * (stat.baseHealMaxHpPercentPerSecond ?? 0) * dt, territoryBounds);
  if ((runtime.prayerTimer ?? 0) <= 0){
    healBase(ctx, 1 + structure.level, territoryBounds);
    runtime.prayerTimer = stat.prayerIntervalSeconds ?? 20;
  }
  if ((runtime.contaminationCleanseTimer ?? 0) <= 0){
    setBaseContaminationStacks(ctx, getBaseContaminationStacks(ctx) - structure.level);
    runtime.contaminationCleanseTimer = stat.cleanseContaminationSeconds ?? 120;
  }
};
type VinhDaCollectionRank = BarracksSoldierRank | 'Prime';
const BARRACKS_RANK_POWER: Record<BarracksSoldierRank, number> = { N: 1, R: 2, SR: 3, SSR: 4, UR: 5 };
const BARRACKS_RANKS: readonly BarracksSoldierRank[] = ['N', 'R', 'SR', 'SSR', 'UR'];
export const getVinhDaMapRankCap = (mapTier: number): BarracksSoldierRank => mapTier >= 1.3 ? 'UR' : mapTier >= 1.2 ? 'SSR' : mapTier >= 1.1 ? 'SR' : 'R';
export const normalizeVinhDaCollectionRank = (rank: VinhDaCollectionRank, mapTier: number): BarracksSoldierRank => {
  const safeRank: BarracksSoldierRank = rank === 'Prime' ? 'UR' : rank;
  const cap = getVinhDaMapRankCap(mapTier);
  return BARRACKS_RANKS[Math.min(BARRACKS_RANK_POWER[safeRank], BARRACKS_RANK_POWER[cap]) - 1] ?? 'N';
};
const getMapCappedBarracksRank = normalizeVinhDaCollectionRank;
const updateBarracks = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime, dt: number): void => {
  if (structure.type !== 'barracks') return;
  const site = ctx.getBuildSite(structure.siteId);
  if (!site) return;
  const stat = getStructureLevelStat('barracks', structure.level);
  runtime.soldiers ??= [];
  runtime.soldiers = runtime.soldiers.filter(soldier => soldier.hp > 0).slice(0, stat.soldierCap ?? 0);
  for (const soldier of runtime.soldiers){
    soldier.rage = Math.min(100, (soldier.rage ?? 0) + dt * 10);
    if (soldier.ultimatePermission && (soldier.rage ?? 0) >= 100){
      const target = ctx.state.enemies.find(enemy => Math.abs(enemy.x - soldier.x) <= 260);
      if (target) hitStructureTarget(ctx, target, 4 + soldier.rank * 2, 0.5);
      soldier.rage = 0;
      soldier.ultimateReady = false;
    }
  }
  if (runtime.soldiers.length >= (stat.soldierCap ?? 0) || (runtime.soldierSpawnTimer ?? 0) > 0) return;
  runtime.nextSoldierId = (runtime.nextSoldierId ?? 0) + 1;
  const requestedRank = stat.soldierRankName ?? 'N';
  const rankName = getMapCappedBarracksRank(requestedRank, ctx.state.mapTier ?? 1.1);
  const rank = BARRACKS_RANK_POWER[rankName];
  const maxHp = 8 + rank * 4;
  runtime.soldiers.push({ id: runtime.nextSoldierId, siteId: structure.siteId, rank, rankName, collectionRank: stat.collectionRank, mapCappedFromRank: rankName === requestedRank ? undefined : requestedRank, maxHp, hp: maxHp, rage: 0, x: site.x, side: runtime.nextSoldierId % 2 === 0 ? 'left' : 'right', attackCooldown: 0, ultimatePermission: Boolean(stat.ultimatePermission), ultimateReady: false });
  runtime.soldierSpawnTimer = stat.soldierSpawnSeconds ?? 10;
};

export const updateStructures = (ctx: VinhDaSimulationContext, dt: number): void => {
    for (const structure of ctx.state.structures.values()){
      const runtime = ctx.ensureStructureRuntime(structure);
      updateStructureRuntimeTimers(ctx, runtime, dt);
      runtime.linkedWallSiteId = null;
      runtime.linkedMaxHpBonus = 0;
      runtime.linkedRegenBonus = 0;
    }
    for (const structure of ctx.state.structures.values()){
      const runtime = ctx.ensureStructureRuntime(structure);
      updateWallLink(ctx, structure, runtime);
    }
  tickBaseHealingCapWindow(ctx, dt);
  tickBaseStatuses(ctx, dt);
  updateBaseSupport(ctx, dt);
    for (const structure of ctx.state.structures.values()){
      const runtime = ctx.ensureStructureRuntime(structure);
      tickStructureStatuses(ctx, structure, runtime, dt);
      updateWallRegeneration(ctx, structure, runtime, dt);
      updateBiochemicalWall(ctx, structure, runtime);
      updateChurch(ctx, structure, runtime, dt);
      updateBarracks(ctx, structure, runtime, dt);
      if (structure.type === 'teleport') runtime.cooldown = Math.max(0, runtime.cooldown - dt);
      const site = ctx.getBuildSite(structure.siteId);
      if (!site) continue;
      if (structure.type === 'spikeTrap') updateSpikeTrap(ctx, site);
      updateAntiAirCannon(ctx, structure, site, runtime, dt);
      updateGravityCannon(ctx, structure, site, runtime, dt);
    }
    for (const type of ['watchtower', 'elementalTower', 'executionBlade'] as const){
      for (const siteId of ctx.structureSiteIdsOfType(type)){
        const structure = ctx.state.structures.get(siteId);
        if (!structure || (structure.type !== type && structure.mountedStructure !== type)) continue;
        const site = ctx.getBuildSite(structure.siteId);
        if (!site) continue;
        const runtime = ctx.ensureStructureRuntime(structure);
        runtime.cooldown = Math.max(0, runtime.cooldown - dt);
        if (runtime.cooldown > 0) continue;
        const stat = getStructureLevelStat(type, structure.type === type ? structure.level : structure.mountedLevel ?? 1, structure.branchLv3, structure.branchLv5, structure.element);
        const targets = getStructureTargetsInRange(ctx, site, stat);
        if (targets.length <= 0) continue;
        runtime.gravityChargeSeconds = 0;
  runtime.cooldown = stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN;
        const explosionHitIds = new Set(targets.map(target => target.id));
        for (const target of targets){
          const baseDamage = ((stat.damage ?? 0) + getTerritoryBaseAllyAtkBonus(ctx, site.x)) * (1 + (((runtime.statuses?.elementalAtkBonusPercent ?? 0) + (runtime.statuses?.elementalWilBonusPercent ?? 0)) / 2));
          const bonus = stat.element === 'Ánh Sáng' ? 1.1 : target.lightVulnerableSeconds && target.lightVulnerableSeconds > 0 ? 1.2 : 1;
          if (stat.element) applyElementEffect(ctx, target, stat.element, baseDamage, site.x, stat.range ?? 0);
          const damageAtkRatio = type === 'elementalTower' ? 0.2 : 0.5;
          hitStructureTarget(ctx, target, baseDamage * bonus, damageAtkRatio, stat.ignoreDefenseBelow ?? 0);
          if (type === 'elementalTower' && structure.level >= 4){
            const splashDamage = stat.splashDamage ?? (structure.level >= 5 ? 2.5 : 1);
            const splashLimit = stat.splashMaxTargets ?? (structure.level >= 5 ? 5 : 3);
            const splashRange = stat.splashRange ?? (structure.level >= 5 ? 90 : 60);
            const splashTargets = ctx.state.enemies
              .filter(enemy => enemy.id !== target.id && !explosionHitIds.has(enemy.id) && Math.abs(enemy.x - target.x) <= splashRange)
              .slice(0, splashLimit);
            for (const splashTarget of splashTargets){
              explosionHitIds.add(splashTarget.id);
              hitStructureTarget(ctx, splashTarget, splashDamage * bonus, damageAtkRatio, stat.ignoreDefenseBelow ?? 0);
            }
          }
        }
      }
    }

    for (const siteId of [...ctx.structureSiteIdsOfType('landmine')]){
      const structure = ctx.state.structures.get(siteId);
      const site = ctx.getBuildSite(siteId);
      if (!structure || !site) continue;
      const runtime = ctx.ensureStructureRuntime(structure);
      if (!runtime.armed && isUnitInLandmineTriggerRadius(ctx, site)){
        runtime.armed = true;
        runtime.fuse = LANDMINE_FUSE_SECONDS;
      }
      if (!runtime.armed) continue;
      runtime.fuse = Math.max(0, (runtime.fuse ?? LANDMINE_FUSE_SECONDS) - dt);
      if (runtime.fuse <= 0) explodeLandmine(ctx, site);
    }
  };
