import {
  CASTLE_OUTER_LEFT,
  CASTLE_OUTER_RIGHT,
  CRYSTAL_X,
  DEFAULT_STRUCTURE_COOLDOWN,
  ENEMY_ATTACK_RANGE,
  ENEMY_LIMIT,
  ENEMY_SPAWN_INTERVAL,
  ENEMY_START_PADDING,
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
import { DEFAULT_ENEMY_TEMPLATE, ENEMY_TEMPLATES, reduceDamageByDefense, scaleEnemyTierStat } from './enemies.ts';
import type { EnemyKind, EnemyTemplate, EnemyTier } from './enemies.ts';
import { BASE_STRUCTURE_STATS, getBaseLevelStat, getStructureLevelStat } from './structures.ts';
import type { BaseBranchLv3, ElementalTowerElement, StructureType } from './structures.ts';
import type { BuildSite, DroppedResource, Enemy, EnemyPortal, PlacedStructure, Side, StructureRuntime } from './types.ts';

export const DAY_DURATION_SECONDS = 300;
export const RESOURCE_PICKUP_RANGE = 54;
export const RESOURCE_DEPOSIT_RANGE = 90;
export const BASE_BUFF_DAILY_UPKEEP = 1;
export const STRUCTURE_HEALING_CAP_MAX_HP_PER_SECOND = 0.08;
const BASE_HEALING_CAP_WINDOW_SECONDS = 1;
export type DayNightPhase = 'day' | 'night';

export interface VinhDaWaveConfig {
  minNightIndex: number;
  mapTier: EnemyTier;
  threatBudget: number;
  enemyWeights: Partial<Record<EnemyKind, number>>;
}

const VINH_DA_WAVE_TABLE: readonly VinhDaWaveConfig[] = Object.freeze([
  { minNightIndex: 1, mapTier: 1.1, threatBudget: 8, enemyWeights: { twisted: 5, crawler: 3, madDog: 1 } },
  { minNightIndex: 3, mapTier: 1.1, threatBudget: 13, enemyWeights: { twisted: 4, crawler: 4, madDog: 2 } },
  { minNightIndex: 5, mapTier: 1.2, threatBudget: 20, enemyWeights: { twisted: 3, crawler: 3, madDog: 2, suicideBomber: 2, darkMage: 1, ironMan: 1 } },
  { minNightIndex: 8, mapTier: 1.2, threatBudget: 28, enemyWeights: { crawler: 3, madDog: 2, suicideBomber: 2, darkMage: 2, ironMan: 2, mutantBird: 1 } },
  { minNightIndex: 12, mapTier: 1.3, threatBudget: 40, enemyWeights: { crawler: 2, madDog: 2, suicideBomber: 2, darkMage: 3, ironMan: 3, mutantBird: 2, resentfulDragon: 0.35 } }
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
    .map(([kind, weight]) => ({ kind: kind as EnemyKind, rollWeight: weight ?? 0, cost: ENEMY_TEMPLATES[kind as EnemyKind]?.weight ?? Number.POSITIVE_INFINITY }))
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
  droppedResources: DroppedResource[];
  nextDroppedResourceId: number;
  baseHp: number;
  baseLevel?: number;
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
}

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

export const spawnEnemy = (ctx: VinhDaSimulationContext, side: Side, kind: EnemyKind = 'twisted', spawnX?: number, allowOutsideNight = false): void => {
    if ((!allowOutsideNight && ctx.state.dayNightPhase !== 'night') || ctx.state.enemies.length >= ENEMY_LIMIT) return;
    const template = ENEMY_TEMPLATES[kind] ?? DEFAULT_ENEMY_TEMPLATE;
  const tier = ctx.state.mapTier ?? template.tier;
    const hp = scaleEnemyTierStat(template.hp, tier);
    const atk = scaleEnemyTierStat(template.atk, tier);
    const wil = scaleEnemyTierStat(template.wil, tier);
    ctx.state.enemies.push({
      id: ctx.state.nextEnemyId,
      x: spawnX ?? (side === 'left' ? ENEMY_START_PADDING : WORLD_WIDTH - ENEMY_START_PADDING),
      kind: template.kind,
      hp,
      maxHp: hp,
      speed: template.speed,
      baseSpeed: template.speed,
      groundSpeed: template.groundSpeed,
      flySpeed: template.flySpeed,
      weight: template.weight,
      attackCooldown: template.attackCooldown,
      atk,
      wil,
      arm: template.arm,
      res: template.res,
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
  spawnEnemy(ctx, spawnSide, kind, portal?.x);
  if (ctx.state.nextEnemyId === previousNextEnemyId) return false;
  ctx.state.waveThreatBudgetRemaining = Math.max(0, ctx.state.waveThreatBudgetRemaining - ENEMY_TEMPLATES[kind].weight);
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
    if (Math.abs(enemy.x - CRYSTAL_X) <= radius) damageBase(ctx, damage);
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
export const removeEnemyAt = (ctx: VinhDaSimulationContext, index: number, reward: boolean): void => {
    const [enemy] = ctx.state.enemies.splice(index, 1);
    if (!enemy) return;
    ctx.removeEnemyElement(enemy.id);
  triggerDeathExplosion(ctx, enemy);
    if (reward){
      const amount = ENEMY_TEMPLATES[enemy.kind].reward;
      if (amount > 0){
        ctx.state.droppedResources.push({ id: ctx.state.nextDroppedResourceId, x: enemy.x, amount });
        ctx.state.nextDroppedResourceId += 1;
        ctx.renderDroppedResources();
      }
    }
  };
export const clearEnemiesWithoutReward = (ctx: VinhDaSimulationContext): void => {
    while (ctx.state.enemies.length > 0) removeEnemyAt(ctx, ctx.state.enemies.length - 1, false);
    ctx.state.enemySpawnTimer = 0;
  };
export const collectDroppedResources = (ctx: VinhDaSimulationContext): void => {
  let collected = 0;
  for (let i = ctx.state.droppedResources.length - 1; i >= 0; i -= 1){
    const resource = ctx.state.droppedResources[i];
    if (!resource || Math.abs(resource.x - ctx.state.leaderX) > RESOURCE_PICKUP_RANGE) continue;
    collected += resource.amount;
    ctx.state.droppedResources.splice(i, 1);
  }
  if (collected > 0){
    ctx.state.carriedDaThach += collected;
    ctx.renderDroppedResources();
    ctx.renderEconomy();
  }
  if (ctx.state.carriedDaThach > 0 && Math.abs(ctx.state.leaderX - CRYSTAL_X) <= RESOURCE_DEPOSIT_RANGE){
    ctx.state.bloodSealStone += ctx.state.carriedDaThach;
    ctx.state.carriedDaThach = 0;
    ctx.renderEconomy();
  }
};
export const getBlockingWall = (ctx: VinhDaSimulationContext, enemy: Enemy): { site: BuildSite; runtime: StructureRuntime } | null => {
    for (const siteId of ctx.structureSiteIdsOfType('wall')){
      const structure = ctx.state.structures.get(siteId);
      if (!structure) continue;
      const site = ctx.getBuildSite(siteId);
      if (!site || (enemy.side === 'left' ? site.x >= CRYSTAL_X : site.x <= CRYSTAL_X)) continue;
      const runtime = ctx.ensureStructureRuntime(structure);
      if (runtime.hp > 0 && Math.abs(enemy.x - site.x) <= ENEMY_ATTACK_RANGE) return { site, runtime };
    }
    return null;
  };
export const damageEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, amount: number, atkRatio = 0.5): boolean => {
    const safeAtkRatio = Math.max(0, Math.min(1, atkRatio));
    const atkPart = reduceDamageByDefense(amount * safeAtkRatio, enemy.arm);
    const wilPart = reduceDamageByDefense(amount * (1 - safeAtkRatio), enemy.res);
    enemy.hp -= atkPart + wilPart;
    return enemy.hp <= 0;
  };

const BLOOD_MAX_HP_STACK_CAP = 17;
const ELEMENTAL_ALLY_BUFF_SECONDS = 3;
const getBaseStat = (ctx: VinhDaSimulationContext) => {
  const level = ctx.state.baseLevel ?? 0;
  return ctx.state.baseBranchLv3 ? getBaseLevelStat(level, ctx.state.baseBranchLv3) : (BASE_STRUCTURE_STATS[level] ?? BASE_STRUCTURE_STATS[0]!);
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
  ctx.state.leaderHp = Math.min(getLeaderMaxHp(ctx), getLeaderHp(ctx) + Math.max(0, amount));
};
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
    if (site.x < CRYSTAL_X){
      leftX = leftX === null ? site.x : Math.min(leftX, site.x);
    } else if (site.x > CRYSTAL_X){
      rightX = rightX === null ? site.x : Math.max(rightX, site.x);
    }
  }
  return leftX === null || rightX === null ? null : { leftX, rightX };
};
export const isXInLivingTerritory = (ctx: VinhDaSimulationContext, x: number, bounds = getLivingTerritoryWallBounds(ctx)): boolean => Boolean(bounds && x >= bounds.leftX && x <= bounds.rightX);
const getChurchHealingBonus = (ctx: VinhDaSimulationContext, bounds = getLivingTerritoryWallBounds(ctx)): number => {
  if (!isXInLivingTerritory(ctx, CRYSTAL_X, bounds)) return 0;
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
  return stat.hp + (stat.shield ?? 0) + (ctx.state.baseStatuses?.elementalBloodMaxHpBonus ?? 0);
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
const healBase = (ctx: VinhDaSimulationContext, amount: number): void => {
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
  if (Math.abs(CRYSTAL_X - sourceX) <= range){
    const statuses = ctx.state.baseStatuses ??= {};
    statuses.elementalAllyBuffSeconds = Math.max(statuses.elementalAllyBuffSeconds ?? 0, ELEMENTAL_ALLY_BUFF_SECONDS);
    apply(statuses);
  }
  for (const structure of ctx.state.structures.values()){
    const site = ctx.getBuildSite(structure.siteId);
    if (!site || Math.abs(site.x - sourceX) > range) continue;
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
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5);
  const arm = (stat.arm ?? 0) * (1 + (runtime.statuses?.elementalArmBonusPercent ?? 0));
    const res = (stat.res ?? 0) * (1 + (runtime.statuses?.elementalResBonusPercent ?? 0));
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
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5);
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
const getEnemyPrimaryTargetX = (ctx: VinhDaSimulationContext, enemy: Enemy): number => enemy.canFly ? ctx.state.leaderX : CRYSTAL_X;
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
    if (Math.abs(enemy.x - CRYSTAL_X) <= template.attackRange){
      tryEnemyAttack(enemy, template, () => {
        applyContaminationHit(ctx, enemy);
        applyBaseBleedHit(ctx, enemy);
        damageBase(ctx, getEnemyDamageWithApostleAura(ctx, enemy, template));
      });
      return;
    }
    moveEnemyToward(ctx, enemy, CRYSTAL_X, dt);
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
    if (Math.abs(enemy.x - CRYSTAL_X) > template.attackRange){
      moveEnemyToward(ctx, enemy, CRYSTAL_X, dt);
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
    const direction = getEnemyMoveDirection(ctx, enemy, CRYSTAL_X);
    if (direction > 0 ? CRYSTAL_X >= enemy.x : CRYSTAL_X <= enemy.x){
      if (Math.abs(enemy.x - CRYSTAL_X) <= enemy.aoeRadius) damageBase(ctx, damage);
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
    if (Math.abs(enemy.x - CRYSTAL_X) <= template.attackRange){
      tryEnemyAttack(enemy, template, () => {
        applyContaminationHit(ctx, enemy);
        damageBase(ctx, getEnemyDamageWithApostleAura(ctx, enemy, template));
      });
      return;
    }
    moveEnemyToward(ctx, enemy, CRYSTAL_X, dt);
  };

export const updateResentfulDragonEnemy = (ctx: VinhDaSimulationContext, enemy: Enemy, template: EnemyTemplate, dt: number): void => {
    const inBreathRange = Math.abs(enemy.x - CRYSTAL_X) <= template.aoeRadius || Boolean(getStructureAhead(ctx, enemy, template.aoeRadius));
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
    moveEnemyToward(ctx, enemy, CRYSTAL_X, dt, enemy.baseSpeed);
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
        if (damageEnemy(ctx, enemy, LEADER_BASIC_ATTACK_DAMAGE)) removeEnemyAt(ctx, i, true);
      }
    }
  };

const applyBaseBuffDailyUpkeep = (ctx: VinhDaSimulationContext): void => {
  if ((ctx.state.baseLevel ?? 0) <= 0) return;
  ctx.state.bloodSealStone = Math.max(0, ctx.state.bloodSealStone - BASE_BUFF_DAILY_UPKEEP);
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

export const updateDayNightTimer = (ctx: VinhDaSimulationContext, dt: number): void => {
    ctx.state.phaseRemainingSeconds -= dt;
    while (ctx.state.phaseRemainingSeconds <= 0){
      ctx.state.phaseRemainingSeconds += DAY_DURATION_SECONDS;
      ctx.state.dayNightPhase = ctx.state.dayNightPhase === 'night' ? 'day' : 'night';
      if (ctx.state.dayNightPhase === 'day'){
        clearEnemiesWithoutReward(ctx);
        applyBaseBuffDailyUpkeep(ctx);
        convertContaminationToApostles(ctx);
      } else {
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
  runtime.emergencyHealCooldown = Math.max(0, (runtime.emergencyHealCooldown ?? 0) - dt);
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
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5);
    const sourceMaxHp = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5).hp;
    const linkedRuntime = ctx.ensureStructureRuntime(linked);
    runtime.linkedWallSiteId = linked.siteId;
    linkedRuntime.linkedMaxHpBonus = (linkedRuntime.linkedMaxHpBonus ?? 0) + sourceMaxHp * (stat.linkedHpBonusPercent ?? 0);
    linkedRuntime.linkedRegenBonus = (linkedRuntime.linkedRegenBonus ?? 0) + (stat.hpRegen ?? 0) * (stat.linkedRegenShare ?? 0);
};
export const updateWallRegeneration = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime, dt: number): void => {
    if (structure.type !== 'wall') return;
    const maxHp = ctx.getStructureMaxHp(structure);
    const regen = (getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5).hpRegen ?? 0) + (runtime.linkedRegenBonus ?? 0);
    runtime.hp = Math.min(maxHp, runtime.hp + regen * dt);
  };
export const updateBiochemicalWall = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime): void => {
    if (structure.type !== 'wall' || structure.level < 5 || structure.branchLv5 !== 'biochemical' || (runtime.biochemicalCooldown ?? 0) > 0) return;
    const site = ctx.getBuildSite(structure.siteId);
    if (!site) return;
    const stat = getStructureLevelStat(structure.type, structure.level, structure.branchLv3, structure.branchLv5);
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
  const stat = getStructureLevelStat('antiAirCannon', structure.level);
  runtime.cooldown = Math.max(0, runtime.cooldown - dt);
  if ((runtime.burstShotsRemaining ?? 0) <= 0 && runtime.cooldown <= 0) runtime.burstShotsRemaining = stat.burstShotCount ?? 1;
  if (runtime.cooldown > 0 || (runtime.burstShotsRemaining ?? 0) <= 0) return;
  const target = ctx.state.enemies.find(enemy => (structure.level >= 6 || enemy.canFly) && Math.abs(enemy.x - site.x) <= (stat.range ?? 0));
  if (!target) return;
  runtime.burstShotsRemaining = Math.max(0, (runtime.burstShotsRemaining ?? 1) - 1);
  runtime.cooldown = (runtime.burstShotsRemaining ?? 0) > 0 ? (stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN) : (stat.reloadSeconds ?? stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN);
  if (damageEnemy(ctx, target, stat.damage ?? 0)) removeEnemyAt(ctx, ctx.state.enemies.indexOf(target), true);
};
const updateGravityCannon = (ctx: VinhDaSimulationContext, structure: PlacedStructure, site: BuildSite, runtime: StructureRuntime, dt: number): void => {
  if (structure.type !== 'gravityCannon') return;
  const stat = getStructureLevelStat('gravityCannon', structure.level);
  runtime.cooldown = Math.max(0, runtime.cooldown - dt);
  if (structure.level >= 6 && runtime.gravityEnabled === undefined) runtime.gravityEnabled = true;
  if (structure.level >= 6 && runtime.gravityEnabled === false) return;
  if (runtime.cooldown > 0) return;
  const center = ctx.state.enemies.find(enemy => Math.abs(enemy.x - site.x) <= (stat.range ?? 0) && enemy.weight <= (stat.maxAffectedWeight ?? 0))?.x;
  if (center === undefined) return;
  for (const enemy of ctx.state.enemies){
    if (enemy.weight > (stat.maxAffectedWeight ?? 0) || Math.abs(enemy.x - center) > (stat.pullRadius ?? 0)) continue;
    enemy.x += (center - enemy.x) * Math.min(1, (stat.pullStrength ?? 0) / Math.max(1, Math.abs(center - enemy.x)) * dt);
    const statuses = ensureStatuses(enemy);
    statuses.slowSeconds = Math.max(statuses.slowSeconds ?? 0, 1);
    statuses.slowMultiplier = Math.min(statuses.slowMultiplier ?? 1, 0.65);
  }
  runtime.cooldown = stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN;
};

const updateBaseSupport = (ctx: VinhDaSimulationContext, dt: number): void => {
  const stat = getBaseStat(ctx);
  if (ctx.state.dayNightPhase === 'night') applyLeaderNightShield(ctx);
  if ((stat.emergencyHealPercent ?? 0) > 0 && getLeaderHp(ctx) > 0 && getLeaderHp(ctx) <= getLeaderMaxHp(ctx) * 0.12 && (ctx.state.leaderEmergencyCooldownUntilNight ?? 0) <= ctx.state.nightIndex){
    healLeader(ctx, getLeaderMaxHp(ctx) * (stat.emergencyHealPercent ?? 0));
    ctx.state.baseHp = Math.max(0, ctx.state.baseHp - stat.hp * (stat.emergencyBaseSelfDamagePercent ?? 0));
    ctx.state.leaderEmergencyCooldownUntilNight = ctx.state.nightIndex + (stat.emergencyCooldownNights ?? 2);
  }
  const territoryBounds = getLivingTerritoryWallBounds(ctx);
  if (!isXInLivingTerritory(ctx, CRYSTAL_X, territoryBounds)) return;
  if ((stat.healPerSecond ?? 0) > 0) healBase(ctx, (stat.healPerSecond ?? 0) * dt);
  for (const structure of ctx.state.structures.values()){
    const site = ctx.getBuildSite(structure.siteId);
    if (!site || !isXInLivingTerritory(ctx, site.x, territoryBounds)) continue;
    const runtime = ctx.ensureStructureRuntime(structure);
    if ((runtime.emergencyHealCooldown ?? 0) > 0) continue;
    if ((stat.emergencyCooldownSeconds ?? 0) > 0 && (stat.emergencyHealPercent ?? 0) > 0 && ctx.state.baseHp > 0 && ctx.state.baseHp <= stat.hp * 0.2){
      healBase(ctx, stat.hp * (stat.emergencyHealPercent ?? 0));
      runtime.emergencyHealCooldown = stat.emergencyCooldownSeconds ?? 60;
      break;
    }
  }
};
const updateChurch = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime): void => {
  if (structure.type !== 'church') return;
  const stat = getStructureLevelStat('church', structure.level);
  if ((runtime.prayerTimer ?? 0) <= 0){
    healBase(ctx, 1 + structure.level);
    runtime.prayerTimer = stat.prayerIntervalSeconds ?? 20;
  }
  if ((runtime.contaminationCleanseTimer ?? 0) <= 0){
    setBaseContaminationStacks(ctx, getBaseContaminationStacks(ctx) - structure.level);
    runtime.contaminationCleanseTimer = stat.cleanseContaminationSeconds ?? 120;
  }
};
const updateBarracks = (ctx: VinhDaSimulationContext, structure: PlacedStructure, runtime: StructureRuntime): void => {
  if (structure.type !== 'barracks') return;
  const site = ctx.getBuildSite(structure.siteId);
  if (!site) return;
  const stat = getStructureLevelStat('barracks', structure.level);
  runtime.soldiers ??= [];
  runtime.soldiers = runtime.soldiers.filter(soldier => soldier.hp > 0).slice(0, stat.soldierCap ?? 0);
  if (runtime.soldiers.length >= (stat.soldierCap ?? 0) || (runtime.soldierSpawnTimer ?? 0) > 0) return;
  runtime.nextSoldierId = (runtime.nextSoldierId ?? 0) + 1;
  runtime.soldiers.push({ id: runtime.nextSoldierId, siteId: structure.siteId, rank: stat.soldierRank ?? 1, hp: 8 + (stat.soldierRank ?? 1) * 4, x: site.x, side: runtime.nextSoldierId % 2 === 0 ? 'left' : 'right', attackCooldown: 0, ultimateReady: Boolean(stat.ultimatePermission) });
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
      updateChurch(ctx, structure, runtime);
      updateBarracks(ctx, structure, runtime);
      const site = ctx.getBuildSite(structure.siteId);
      if (!site) continue;
      if (structure.type === 'spikeTrap') updateSpikeTrap(ctx, site);
      updateAntiAirCannon(ctx, structure, site, runtime, dt);
      updateGravityCannon(ctx, structure, site, runtime, dt);
    }
    for (const type of ['watchtower', 'elementalTower'] as const){
      for (const siteId of ctx.structureSiteIdsOfType(type)){
        const structure = ctx.state.structures.get(siteId);
        if (!structure || (structure.type !== type && structure.mountedStructure !== type)) continue;
        const site = ctx.getBuildSite(structure.siteId);
        if (!site) continue;
        const runtime = ctx.ensureStructureRuntime(structure);
        runtime.cooldown = Math.max(0, runtime.cooldown - dt);
        if (runtime.cooldown > 0) continue;
        const stat = getStructureLevelStat(type, structure.type === type ? structure.level : structure.mountedLevel ?? 1, structure.branchLv3, structure.branchLv5, structure.element);
        const targets = ctx.state.enemies
          .filter(enemy => Math.abs(enemy.x - site.x) <= (stat.range ?? 0))
          .slice(0, stat.maxTargets ?? 1);
        if (targets.length <= 0) continue;
        runtime.cooldown = stat.cooldownSeconds ?? DEFAULT_STRUCTURE_COOLDOWN;
        const explosionHitIds = new Set(targets.map(target => target.id));
        for (const target of targets){
          const baseDamage = (stat.damage ?? 0) * (1 + (((runtime.statuses?.elementalAtkBonusPercent ?? 0) + (runtime.statuses?.elementalWilBonusPercent ?? 0)) / 2));
          const bonus = stat.element === 'Ánh Sáng' ? 1.1 : target.lightVulnerableSeconds && target.lightVulnerableSeconds > 0 ? 1.2 : 1;
          if (stat.element) applyElementEffect(ctx, target, stat.element, baseDamage, site.x, stat.range ?? 0);
          const damageAtkRatio = type === 'elementalTower' ? 0.2 : 0.5;
          if (damageEnemy(ctx, target, baseDamage * bonus, damageAtkRatio)) removeEnemyAt(ctx, ctx.state.enemies.indexOf(target), true);
          if (type === 'elementalTower' && structure.level >= 4){
            const splashDamage = stat.splashDamage ?? (structure.level >= 5 ? 2.5 : 1);
            const splashLimit = stat.splashMaxTargets ?? (structure.level >= 5 ? 5 : 3);
            const splashRange = stat.splashRange ?? (structure.level >= 5 ? 90 : 60);
            const splashTargets = ctx.state.enemies
              .filter(enemy => enemy.id !== target.id && !explosionHitIds.has(enemy.id) && Math.abs(enemy.x - target.x) <= splashRange)
              .slice(0, splashLimit);
            for (const splashTarget of splashTargets){
              explosionHitIds.add(splashTarget.id);
              if (damageEnemy(ctx, splashTarget, splashDamage * bonus, damageAtkRatio)) removeEnemyAt(ctx, ctx.state.enemies.indexOf(splashTarget), true);
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
