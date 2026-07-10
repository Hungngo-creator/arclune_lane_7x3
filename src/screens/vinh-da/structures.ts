import {
  BUILD_SITE_CASTLE_PADDING,
  BUILD_SITE_EDGE_PADDING,
  BUILD_SITE_SPACING,
  GROUND_PLOT_CENTER_X,
  GROUND_PLOT_WIDTH,
  CASTLE_OUTER_LEFT,
  CASTLE_OUTER_RIGHT,
  WORLD_WIDTH
} from './constants.ts';
import type { BuildSite, BuildSiteKind } from './types.ts';
import { isTieredVinhDaResource } from './economy/resources.ts';
import type { TieredAmount, VinhDaResourceId, VinhDaTier } from './economy/resources.ts';

export type StructureType = 'watchtower' | 'wall' | 'elementalTower' | 'barracks' | 'church' | 'crystalSeal' | 'landmine' | 'swamp' | 'spikeTrap' | 'antiAirCannon' | 'gravityCannon' | 'executionBlade' | 'teleport';
export type ElementalTowerElement = 'Hỏa' | 'Mộc' | 'Thủy' | 'Thổ' | 'Kim' | 'Lôi' | 'Huyết' | 'Ánh Sáng' | 'Phong';

export interface BuildMenuOption {
  label: string;
  type: StructureType;
}

export type WallBranchLv3 = 'spike' | 'slippery' | 'shock';
export type WallBranchLv5 = 'biochemical' | 'curse' | 'link';
export type AntiAirBranchLv3 = 'quality' | 'quantity';
export type AntiAirBranchLv5 = 'rapidFire' | 'dragonSlayer';
export type GravityBranchLv4 = 'godSlayer' | 'clearField';
export type BaseBranchLv3 = 'defense' | 'attack';
export type BarracksSoldierRank = 'N' | 'R' | 'SR' | 'SSR' | 'UR';

export interface StructureLevelStat {
  hp: number;
  maxTargets?: number;
  projectileSpeed?: number;
  element?: ElementalTowerElement;
  healPerSecond?: number;
  allyHealPerSecond?: number;
  leaderHealMaxHpPercentPerSecond?: number;
  baseHealMaxHpPercentPerSecond?: number;
  allyAtkBonus?: number;
  healingBonusPercent?: number;
  shield?: number;
  emergencyHealPercent?: number;
  emergencyCooldownSeconds?: number;
  emergencyCooldownNights?: number;
  emergencyBaseSelfDamagePercent?: number;
  leaderShieldPercent?: number;
  buffHpPercent?: number;
  buffArmPercent?: number;
  buffResPercent?: number;
  buffAtkPercent?: number;
  buffWilPercent?: number;
  prayerIntervalSeconds?: number;
  cleanseContaminationSeconds?: number;
  soldierCap?: number;
  soldierRank?: number;
  soldierRankName?: BarracksSoldierRank;
  collectionRank?: BarracksSoldierRank;
  requiresCollectionPick?: boolean;
  mapTierCap?: VinhDaTier;
  soldierSpawnSeconds?: number;
  ultimatePermission?: boolean;
  range?: number;
  damage?: number;
  cooldownSeconds?: number;
  arm?: number;
  res?: number;
  hpRegen?: number;
  spikeTrueDamage?: number;
  slipperyChance?: number;
  slipperyDamageMultiplier?: number;
  slipperyCooldownSeconds?: number;
  shockKnockback?: number;
  shockCooldownSeconds?: number;
  curseMaxHpPercent?: number;
  curseCooldownSeconds?: number;
  biochemicalCooldownSeconds?: number;
  biochemicalRange?: number;
  biochemicalMaxTargets?: number;
  linkedHpBonusPercent?: number;
  linkedRegenShare?: number;
  burstShotCount?: number;
  reloadSeconds?: number;
  pullRadius?: number;
  pullStrength?: number;
  maxAffectedWeight?: number;
  minAffectedWeight?: number;
  triggerRadius?: number;
  damageMaxHpPercent?: number;
  pullDurationSeconds?: number;
  chargeSeconds?: number;
  launchSpeed?: number;
  maxLaunchDistance?: number;
  bossEffectMultiplier?: number;
  affectsGroundAtLv6?: boolean;
  splashDamage?: number;
  splashMaxTargets?: number;
  splashRange?: number;
  ignoreDefenseBelow?: number;
}


export const UPGRADE_NODE_LABEL = 'Nâng cấp';
export const BUILD_LEVEL_COST = {
  1: 2,
  2: 3,
  3: 5,
  4: 8,
  5: 12,
  6: 18,
} as const satisfies Record<number, number>;

type StructureCostBranch = WallBranchLv3 | WallBranchLv5 | BaseBranchLv3 | AntiAirBranchLv3 | AntiAirBranchLv5 | GravityBranchLv4 | 'elementalize' | 'soulSlash';
type CostToken = readonly [resourceId: VinhDaResourceId, amount: number, tierOffset?: number];

const c = (resourceId: VinhDaResourceId, amount: number, tierOffset = 0): CostToken => [resourceId, amount, tierOffset];
const cost = (...items: CostToken[]): readonly CostToken[] => items;

const STRUCTURE_UPGRADE_COSTS = {
  crystalSeal: {
    0: cost(),
    1: cost(c('darkStone', 4), c('blackIron', 4)),
    2: cost(c('darkStone', 8), c('blackIron', 6), c('blackBone', 1)),
    3: {
      defense: cost(c('darkStone', 12), c('blackIron', 8), c('blackBone', 3), c('wishStone', 1)),
      attack: cost(c('darkStone', 12), c('blackIron', 8), c('blackBone', 3), c('resentmentStone', 1)),
      default: cost(c('darkStone', 12), c('blackIron', 8), c('blackBone', 3), c('wishStone', 1))
    },
    4: cost(c('darkStone', 16), c('blackIron', 12), c('blackBone', 4), c('sealDust', 1)),
    5: cost(c('darkStone', 24), c('blackIron', 16), c('blackBone', 6), c('fleshCrystal', 1)),
    6: cost(c('darkStone', 30), c('blackIron', 20), c('blackBone', 8), c('fleshCrystal', 2), c('nightCore', 1))
  },
  wall: {
    1: cost(c('blackIron', 4), c('darkStone', 2)),
    2: cost(c('blackIron', 6), c('darkStone', 3)),
    3: {
      spike: cost(c('blackIron', 8), c('darkStone', 4), c('blackBone', 2)),
      slippery: cost(c('blackIron', 6), c('darkStone', 4), c('heavyWater', 1)),
      shock: cost(c('blackIron', 8), c('darkStone', 4), c('resentmentStone', 1)),
      default: cost(c('blackIron', 8), c('darkStone', 4), c('blackBone', 2))
    },
    4: cost(c('blackIron', 10), c('darkStone', 6), c('blackBone', 3)),
    5: {
      biochemical: cost(c('blackIron', 12), c('darkStone', 8), c('blackBone', 4), c('spiritWood', 2), c('fleshCrystal', 1)),
      curse: cost(c('blackIron', 10), c('darkStone', 8), c('blackBone', 4), c('resentmentStone', 4)),
      link: cost(c('blackIron', 10), c('darkStone', 8), c('blackBone', 3), c('voidStone', 1), c('sealDust', 1)),
      default: cost(c('blackIron', 12), c('darkStone', 8), c('blackBone', 4), c('spiritWood', 2), c('fleshCrystal', 1))
    },
    6: cost(c('blackIron', 16), c('darkStone', 10), c('blackBone', 5), c('nightCore', 1))
  },
  watchtower: { 1: cost(c('blackIron', 6), c('darkStone', 3)), 2: cost(c('blackIron', 5), c('darkStone', 3)), 3: cost(c('blackIron', 8), c('darkStone', 5), c('blackBone', 1)), 4: cost(c('blackIron', 10), c('darkStone', 6), c('blackBone', 2)), 5: cost(c('blackIron', 12), c('darkStone', 8), c('blackBone', 3), c('mindStone', 1)) },
  elementalTower: { 1: cost(c('blackIron', 5), c('darkStone', 3), c('elementStone', 1)), 2: cost(c('blackIron', 5), c('darkStone', 4), c('elementStone', 1)), 3: cost(c('blackIron', 8), c('darkStone', 5), c('elementStone', 2), c('blackBone', 1)), 4: cost(c('blackIron', 10), c('darkStone', 7), c('elementStone', 2), c('blackBone', 2), c('mageStaff', 1)), 5: cost(c('blackIron', 12), c('darkStone', 9), c('elementStone', 3), c('blackBone', 3), c('mageStaff', 2), c('mindStone', 1)) },
  barracks: { 1: cost(c('blackIron', 8), c('spiritWood', 4), c('darkStone', 2)), 2: cost(c('blackIron', 8), c('spiritWood', 4), c('blackBone', 2)), 3: cost(c('blackIron', 12), c('spiritWood', 6), c('blackBone', 4)), 4: cost(c('blackIron', 16), c('spiritWood', 8), c('blackBone', 6), c('mindStone', 1)), 5: cost(c('blackIron', 20), c('spiritWood', 10), c('blackBone', 8), c('mindStone', 2), c('fleshCrystal', 1)), 6: cost(c('blackIron', 24), c('spiritWood', 12), c('blackBone', 10), c('mindStone', 2), c('nightCore', 1)) },
  church: { 1: cost(c('blackIron', 4), c('darkStone', 4), c('wishStone', 1)), 2: cost(c('blackIron', 6), c('darkStone', 5), c('wishStone', 1), c('blackBone', 1)), 3: cost(c('blackIron', 8), c('darkStone', 6), c('wishStone', 2), c('apostleCloak', 1)), 4: cost(c('blackIron', 10), c('darkStone', 8), c('wishStone', 3), c('apostleCloak', 2), c('bloodLordSigil', 1)), 5: cost(c('blackIron', 12), c('darkStone', 10), c('wishStone', 4), c('apostleCloak', 3), c('bloodLordSigil', 2), c('fleshCrystal', 1)) },
  antiAirCannon: { 1: cost(c('blackIron', 8), c('darkStone', 4), c('machinePart', 1)), 2: cost(c('blackIron', 8), c('darkStone', 5), c('machinePart', 1)), 3: { quality: cost(c('blackIron', 12), c('darkStone', 6), c('machinePart', 2), c('mindStone', 1)), quantity: cost(c('blackIron', 10), c('darkStone', 6), c('machinePart', 2)), default: cost(c('blackIron', 12), c('darkStone', 6), c('machinePart', 2), c('mindStone', 1)) }, 4: cost(c('blackIron', 12), c('darkStone', 8), c('machinePart', 2), c('blackBone', 2)), 5: { rapidFire: cost(c('blackIron', 16), c('darkStone', 10), c('machinePart', 3), c('mindStone', 2)), dragonSlayer: cost(c('blackIron', 18), c('darkStone', 10), c('machinePart', 4), c('dragonScale', 1)), default: cost(c('blackIron', 16), c('darkStone', 10), c('machinePart', 3), c('mindStone', 2)) }, 6: cost(c('blackIron', 24), c('darkStone', 12), c('machinePart', 5), c('dragonScale', 2), c('nightCore', 1)) },
  gravityCannon: { 1: cost(c('blackIron', 8), c('darkStone', 4), c('heavyWater', 1), c('machinePart', 1)), 2: cost(c('blackIron', 10), c('darkStone', 6), c('heavyWater', 1), c('machinePart', 1)), 3: cost(c('blackIron', 12), c('darkStone', 8), c('heavyWater', 2), c('machinePart', 2)), 4: { godSlayer: cost(c('blackIron', 16), c('darkStone', 10), c('heavyWater', 3), c('voidStone', 2), c('dragonScale', 1)), clearField: cost(c('blackIron', 14), c('darkStone', 10), c('heavyWater', 2), c('voidStone', 1), c('machinePart', 2)), default: cost(c('blackIron', 16), c('darkStone', 10), c('heavyWater', 3), c('voidStone', 2), c('dragonScale', 1)) }, 5: cost(c('blackIron', 18), c('darkStone', 12), c('heavyWater', 3), c('voidStone', 2), c('nightCore', 1)), 6: cost(c('blackIron', 20), c('darkStone', 12), c('heavyWater', 4), c('voidStone', 3), c('nightCore', 2)) },
  executionBlade: { 1: cost(c('blackIron', 6), c('darkStone', 4), c('mindStone', 1)), 2: cost(c('blackIron', 8), c('darkStone', 5), c('mindStone', 1)), 3: cost(c('blackIron', 10), c('darkStone', 6), c('mindStone', 1), c('elementStone', 1)), 4: cost(c('blackIron', 12), c('darkStone', 8), c('mindStone', 2), c('blackBone', 2)), 5: cost(c('blackIron', 16), c('darkStone', 10), c('mindStone', 3), c('voidStone', 1)), 6: cost(c('blackIron', 20), c('darkStone', 12), c('mindStone', 4), c('nightCore', 1)) },
  landmine: { 1: cost(c('blackIron', 2), c('darkStone', 1)) },
  swamp: { 1: cost(c('spiritWood', 2), c('heavyWater', 1)) },
  spikeTrap: { 1: cost(c('blackIron', 3), c('resentmentStone', 1)) },
  teleport: { 1: cost(c('voidStone', 2), c('sealDust', 4), c('darkStone', 10)), 2: cost(c('voidStone', 3), c('sealDust', 6), c('darkStone', 15), c('mindStone', 1)), 3: cost(c('voidStone', 5), c('sealDust', 10), c('darkStone', 20), c('fleshCrystal', 1)), 4: cost(c('voidStone', 3), c('sealDust', 5), c('nightCore', 1)) }
} as const;

const normalizeMapTier = (mapTier: VinhDaTier | number = 1.1): VinhDaTier => Math.round(Math.max(1.1, Number(mapTier)) * 10) / 10 as VinhDaTier;
const resolveCostTokens = (type: StructureType, level: number, branch?: StructureCostBranch): readonly CostToken[] => {
  const byLevel = STRUCTURE_UPGRADE_COSTS[type]?.[level as keyof (typeof STRUCTURE_UPGRADE_COSTS)[StructureType]];
  if (!byLevel) return cost(c('darkStone', BUILD_LEVEL_COST[level as keyof typeof BUILD_LEVEL_COST] ?? BUILD_LEVEL_COST[6]));
  if (Array.isArray(byLevel)) return byLevel as readonly CostToken[];
  const branched = byLevel as unknown as Record<string, readonly CostToken[]>;
  return branched[String(branch)] ?? branched.default ?? cost(c('darkStone', 1));
};

export const getStructureUpgradeCost = (type: StructureType, level: number, branch?: StructureCostBranch, mapTier: VinhDaTier | number = 1.1): TieredAmount[] => {
  const tier = normalizeMapTier(mapTier);
  return resolveCostTokens(type, level, branch).map(([resourceId, amount, tierOffset]) => ({
    resourceId,
    amount,
    tier: isTieredVinhDaResource(resourceId) ? (tierOffset === undefined ? tier : normalizeMapTier(tier + tierOffset)) : undefined
  }));
};

export const getBuildLevelCost = (type: StructureType, level: number): number => getStructureUpgradeCost(type, level).reduce((total, item) => total + item.amount, 0);

export const WALL_LEVELS = {
  1: { hp: 15, arm: 1, res: 1, hpRegen: 1 },
  2: { hp: 25, arm: 2, res: 2, hpRegen: 2 },
  3: {
    spike: { hp: 35, arm: 4, res: 4, hpRegen: 2, spikeTrueDamage: 1 },
    slippery: { hp: 30, arm: 3, res: 3, hpRegen: 2, slipperyChance: 0.3, slipperyDamageMultiplier: 0.2, slipperyCooldownSeconds: 3 },
    shock: { hp: 37, arm: 3, res: 3, hpRegen: 2, shockKnockback: 200, shockCooldownSeconds: 3 }
  },
  4: { hpBonus: 15, armBonus: 3, resBonus: 3, hpRegen: 5 },
  5: {
    biochemical: { hpBonus: 20, armBonus: 4, resBonus: 4, hpRegenBonus: 5, biochemicalCooldownSeconds: 5, biochemicalRange: 460, biochemicalMaxTargets: 3 },
    curse: { hpBonus: 20, armBonus: 3, resBonus: 3, hpRegenBonus: 3, curseMaxHpPercent: 0.03, curseCooldownSeconds: 3 },
    link: { hpBonus: 0, armBonus: 0, resBonus: 0, hpRegenBonus: 10, linkedHpBonusPercent: 0.2, linkedRegenShare: 0.5 }
  },
  6: { canMountStructure: true }
} as const;

export const BUILD_NODE_OPTIONS = [
  { label: 'Tháp', type: 'watchtower' },
  { label: 'Tường', type: 'wall' },
  { label: 'Tháp Nguyên Tố', type: 'elementalTower' },
  { label: 'Đao Phủ', type: 'executionBlade' },
  { label: 'Pha lê', type: 'crystalSeal' },
  { label: 'Nhà Thờ', type: 'church' },
  { label: 'Trại', type: 'barracks' },
  { label: 'Truyền Tống Trận', type: 'teleport' }
] as const satisfies readonly BuildMenuOption[];

export const GROUND_BUILD_NODE_OPTIONS = [
  { label: 'Địa lôi', type: 'landmine' },
  { label: 'Địa thứ', type: 'spikeTrap' },
  { label: 'Đầm lầy', type: 'swamp' },
  { label: 'Pháo phòng không', type: 'antiAirCannon' },
  { label: 'Pháo trọng lực', type: 'gravityCannon' },
] as const satisfies readonly BuildMenuOption[];

export const STRUCTURE_SURFACES: Record<StructureType, readonly BuildSiteKind[]> = {
  watchtower: ['rock'],
  wall: ['wall-slot'],
  elementalTower: ['rock'],
  barracks: ['rock'],
  church: ['rock'],
  crystalSeal: ['rock'],
  landmine: ['ground'],
  spikeTrap: ['ground'],
  swamp: ['ground'],
  antiAirCannon: ['ground'],
  gravityCannon: ['ground'],
  executionBlade: ['rock'],
  teleport: ['ground'],
} as const;

export const isStructureAllowedOnBuildSite = (type: StructureType, site: Pick<BuildSite, 'kind'>): boolean => STRUCTURE_SURFACES[type].includes(site.kind);

const STRUCTURE_TYPES = Object.keys(STRUCTURE_SURFACES) as StructureType[];
export const ROCK_BUILD_SITE_ALLOWED = STRUCTURE_TYPES.filter(type => STRUCTURE_SURFACES[type].includes('rock'));
export const GROUND_BUILD_SITE_ALLOWED = STRUCTURE_TYPES.filter(type => STRUCTURE_SURFACES[type].includes('ground'));
export const WALL_BUILD_SITE_ALLOWED = STRUCTURE_TYPES.filter(type => STRUCTURE_SURFACES[type].includes('wall-slot'));
export const CASTLE_GROUND_BUILD_SITE_ALLOWED = GROUND_BUILD_SITE_ALLOWED;

const METERS_TO_WORLD_UNITS = 460 / 150;
export const metersToWorldUnits = (meters: number): number => Math.round(meters * METERS_TO_WORLD_UNITS);
export const WATCHTOWER_RANGE_WORLD_UNITS = metersToWorldUnits(150);
export const ELEMENTAL_TOWER_RANGE_WORLD_UNITS = metersToWorldUnits(100);
export const LORE_HOUR_SECONDS = 10;
export const CONTAMINATION_CLEANSE_SECONDS = 2 * LORE_HOUR_SECONDS;

export const WALL_STRUCTURE_STATS: Record<number, StructureLevelStat> = {
  1: WALL_LEVELS[1],
  2: WALL_LEVELS[2],
};

export const WATCHTOWER_STRUCTURE_STATS: Record<number, StructureLevelStat> = {
  1: { hp: 12, maxTargets: 1, range: WATCHTOWER_RANGE_WORLD_UNITS, damage: 2, cooldownSeconds: 1, projectileSpeed: 8 },
  2: { hp: 16, maxTargets: 1, range: WATCHTOWER_RANGE_WORLD_UNITS, damage: 3, cooldownSeconds: 1, projectileSpeed: 8 },
  3: { hp: 22, maxTargets: 2, range: WATCHTOWER_RANGE_WORLD_UNITS, damage: 3, cooldownSeconds: 1, projectileSpeed: 8 },
  4: { hp: 30, maxTargets: 3, range: WATCHTOWER_RANGE_WORLD_UNITS, damage: 4, cooldownSeconds: 1, projectileSpeed: 8 },
  5: { hp: 40, maxTargets: 4, range: WATCHTOWER_RANGE_WORLD_UNITS, damage: 5, cooldownSeconds: 5, projectileSpeed: 8 }
};

export const EXECUTION_BLADE_STRUCTURE_STATS: Record<number, StructureLevelStat> = {
  1: { hp: 12, maxTargets: 5, range: WATCHTOWER_RANGE_WORLD_UNITS, damage: 3, cooldownSeconds: 6, projectileSpeed: 1, ignoreDefenseBelow: 1 },
  2: { hp: 16, maxTargets: 5, range: WATCHTOWER_RANGE_WORLD_UNITS, damage: 5, cooldownSeconds: 6.5, projectileSpeed: 2, ignoreDefenseBelow: 1 },
  3: { hp: 22, maxTargets: 5, range: WATCHTOWER_RANGE_WORLD_UNITS, damage: 5, cooldownSeconds: 6.5, projectileSpeed: 2, ignoreDefenseBelow: 1, element: 'Hỏa' },
  4: { hp: 30, maxTargets: 5, range: WATCHTOWER_RANGE_WORLD_UNITS, damage: 6, cooldownSeconds: 6.25, projectileSpeed: 2.5, ignoreDefenseBelow: 1, element: 'Hỏa' },
  5: { hp: 40, maxTargets: 5, range: WATCHTOWER_RANGE_WORLD_UNITS, damage: 8, cooldownSeconds: 6, projectileSpeed: 3, ignoreDefenseBelow: 1, element: 'Hỏa' },
  6: { hp: 52, maxTargets: 5, range: WATCHTOWER_RANGE_WORLD_UNITS, damage: 10, cooldownSeconds: 5.5, projectileSpeed: 3.5, ignoreDefenseBelow: 1, element: 'Hỏa' }
};

export const ELEMENTAL_TOWER_ELEMENTS = ['Hỏa', 'Mộc', 'Thủy', 'Thổ', 'Kim', 'Lôi', 'Huyết', 'Ánh Sáng', 'Phong'] as const satisfies readonly ElementalTowerElement[];
export const ELEMENTAL_TOWER_STRUCTURE_STATS: Record<ElementalTowerElement, Record<number, StructureLevelStat>> = Object.fromEntries(ELEMENTAL_TOWER_ELEMENTS.map((element) => [element, {
  1: { hp: 10, element, maxTargets: 1, range: ELEMENTAL_TOWER_RANGE_WORLD_UNITS, damage: 2, cooldownSeconds: 2, projectileSpeed: 6 },
  2: { hp: 14, element, maxTargets: 1, range: ELEMENTAL_TOWER_RANGE_WORLD_UNITS, damage: 4, cooldownSeconds: 1.8, projectileSpeed: 6 },
  3: { hp: 20, element, maxTargets: 2, range: ELEMENTAL_TOWER_RANGE_WORLD_UNITS, damage: 4, cooldownSeconds: 1.6, projectileSpeed: 6 },
  4: { hp: 28, element, maxTargets: 2, range: ELEMENTAL_TOWER_RANGE_WORLD_UNITS, damage: 5, cooldownSeconds: 1.5, projectileSpeed: 6, splashDamage: 1, splashMaxTargets: 3, splashRange: 60 },
  5: { hp: 36, element, maxTargets: 3, range: ELEMENTAL_TOWER_RANGE_WORLD_UNITS, damage: 7, cooldownSeconds: 3, projectileSpeed: 6, splashDamage: 2.5, splashMaxTargets: 5, splashRange: 90 }
}])) as unknown as Record<ElementalTowerElement, Record<number, StructureLevelStat>>;

export const GROUND_STRUCTURE_STATS: Record<Exclude<StructureType, 'wall' | 'watchtower'>, Record<number, StructureLevelStat>> = {
  elementalTower: ELEMENTAL_TOWER_STRUCTURE_STATS['Hỏa'],
  executionBlade: EXECUTION_BLADE_STRUCTURE_STATS,
  teleport: {
    1: { hp: 16, cooldownSeconds: 180 },
    2: { hp: 22, cooldownSeconds: 160 },
    3: { hp: 30, cooldownSeconds: 140 },
    4: { hp: 40, cooldownSeconds: 120 },
    5: { hp: 52, cooldownSeconds: 100 },
    6: { hp: 68, cooldownSeconds: 80 }
  },
  barracks: {
    1: { hp: 18, soldierCap: 2, soldierRank: 1, soldierRankName: 'N', soldierSpawnSeconds: 10, ultimatePermission: false },
    2: { hp: 24, soldierCap: 2, soldierRank: 2, soldierRankName: 'R', soldierSpawnSeconds: 9, ultimatePermission: false },
    3: { hp: 32, soldierCap: 3, soldierRank: 3, soldierRankName: 'SR', soldierSpawnSeconds: 8, ultimatePermission: true },
    4: { hp: 42, soldierCap: 3, soldierRank: 4, soldierRankName: 'SSR', collectionRank: 'SSR', requiresCollectionPick: true, mapTierCap: 1.2, soldierSpawnSeconds: 7, ultimatePermission: true },
    5: { hp: 54, soldierCap: 3, soldierRank: 5, soldierRankName: 'UR', collectionRank: 'UR', requiresCollectionPick: true, mapTierCap: 1.3, soldierSpawnSeconds: 6, ultimatePermission: true },
    6: { hp: 70, soldierCap: 4, soldierRank: 5, soldierRankName: 'UR', collectionRank: 'UR', requiresCollectionPick: true, mapTierCap: 1.3, soldierSpawnSeconds: 5, ultimatePermission: true }
  },
  church: {
    1: { hp: 14, buffHpPercent: 0.05, buffArmPercent: 0.05, buffResPercent: 0.05, prayerIntervalSeconds: 3 * LORE_HOUR_SECONDS, cleanseContaminationSeconds: CONTAMINATION_CLEANSE_SECONDS },
    2: { hp: 18, buffHpPercent: 0.075, buffArmPercent: 0.075, buffResPercent: 0.075, prayerIntervalSeconds: 4 * LORE_HOUR_SECONDS, cleanseContaminationSeconds: CONTAMINATION_CLEANSE_SECONDS },
    3: { hp: 24, buffHpPercent: 0.075, buffArmPercent: 0.075, buffResPercent: 0.075, buffAtkPercent: 0.05, buffWilPercent: 0.05, prayerIntervalSeconds: 6 * LORE_HOUR_SECONDS, cleanseContaminationSeconds: CONTAMINATION_CLEANSE_SECONDS },
    4: { hp: 32, buffHpPercent: 0.15, buffArmPercent: 0.15, buffResPercent: 0.15, buffAtkPercent: 0.1, buffWilPercent: 0.1, prayerIntervalSeconds: 10 * LORE_HOUR_SECONDS, cleanseContaminationSeconds: CONTAMINATION_CLEANSE_SECONDS },
    5: { hp: 44, buffHpPercent: 0.15, buffArmPercent: 0.15, buffResPercent: 0.15, buffAtkPercent: 0.1, buffWilPercent: 0.1, baseHealMaxHpPercentPerSecond: 0.02, prayerIntervalSeconds: 18 * LORE_HOUR_SECONDS, cleanseContaminationSeconds: CONTAMINATION_CLEANSE_SECONDS }
  },
  crystalSeal: {
    0: { hp: 20, arm: 2, res: 2, healPerSecond: 0 },
    1: { hp: 30, arm: 3, res: 3, healPerSecond: 1 },
    2: { hp: 40, arm: 4, res: 4, healPerSecond: 2 },
    3: { hp: 55, arm: 7, res: 7, healPerSecond: 4, allyHealPerSecond: 1 },
    4: { hp: 65, arm: 9, res: 9, healPerSecond: 4, allyHealPerSecond: 2 },
    5: { hp: 80, arm: 11, res: 11, healPerSecond: 4, allyHealPerSecond: 2, leaderHealMaxHpPercentPerSecond: 0.01, leaderShieldPercent: 0.2 },
    6: { hp: 80, arm: 11, res: 11, healPerSecond: 4, allyHealPerSecond: 5, leaderHealMaxHpPercentPerSecond: 0.01, leaderShieldPercent: 0.2, emergencyHealPercent: 0.2, emergencyBaseSelfDamagePercent: 0.1, emergencyCooldownNights: 2 }
  },
  landmine: {
    1: { hp: 1 },
    2: { hp: 1 }
  },
  spikeTrap: {
    1: { hp: 1 }
  },
  swamp: {
    1: { hp: 1 },
    2: { hp: 1 }
    },
  antiAirCannon: {
    1: { hp: 8, range: metersToWorldUnits(10), damage: 0.7, cooldownSeconds: 1, reloadSeconds: 15, burstShotCount: 5, maxTargets: 1, projectileSpeed: 12 },
    2: { hp: 12, range: metersToWorldUnits(15), damage: 1.1, cooldownSeconds: 1.2, reloadSeconds: 18, burstShotCount: 6, maxTargets: 1, projectileSpeed: 12 }
  },
  gravityCannon: {
    1: { hp: 10, range: metersToWorldUnits(0.5), triggerRadius: metersToWorldUnits(0.5), pullRadius: metersToWorldUnits(0.5), damageMaxHpPercent: 0.25, pullDurationSeconds: 3, launchSpeed: metersToWorldUnits(10), cooldownSeconds: 15, minAffectedWeight: 1, maxAffectedWeight: 2, maxLaunchDistance: metersToWorldUnits(15) },
    2: { hp: 14, range: metersToWorldUnits(0.7), triggerRadius: metersToWorldUnits(0.7), pullRadius: metersToWorldUnits(0.7), damageMaxHpPercent: 0.3, pullDurationSeconds: 4, launchSpeed: metersToWorldUnits(15), cooldownSeconds: 10, minAffectedWeight: 1, maxAffectedWeight: 2, maxLaunchDistance: metersToWorldUnits(15) },
    3: { hp: 20, range: metersToWorldUnits(0.9), triggerRadius: metersToWorldUnits(0.9), pullRadius: metersToWorldUnits(0.9), damageMaxHpPercent: 0.35, pullDurationSeconds: 5, launchSpeed: metersToWorldUnits(20), cooldownSeconds: 10, minAffectedWeight: 1, maxAffectedWeight: 3, maxLaunchDistance: metersToWorldUnits(15) }
  }
};

const isOutsideCastleBuildPadding = (x: number): boolean => (
  x <= CASTLE_OUTER_LEFT - BUILD_SITE_CASTLE_PADDING
  || x >= CASTLE_OUTER_RIGHT + BUILD_SITE_CASTLE_PADDING
);

const isRockBuildSiteIndexVisible = (index: number): boolean => index <= 2 || (index - 2) % 6 === 0;

export const createGroundBuildSites = (): BuildSite[] => {
  const sites: BuildSite[] = [];
  const minX = BUILD_SITE_EDGE_PADDING;
  const maxX = WORLD_WIDTH - BUILD_SITE_EDGE_PADDING;
  const addSite = (id: string, x: number, allowed: readonly StructureType[] = GROUND_BUILD_SITE_ALLOWED): void => {
    if (x >= minX && x <= maxX) sites.push({ id, x, kind: 'ground', allowed });
  };

  addSite('ground-center-0', GROUND_PLOT_CENTER_X, CASTLE_GROUND_BUILD_SITE_ALLOWED);

  let leftIndex = 1;
  let rightIndex = 1;
  for (let offsetIndex = 1; ; offsetIndex += 1){
    const leftX = GROUND_PLOT_CENTER_X - GROUND_PLOT_WIDTH * offsetIndex;
    const rightX = GROUND_PLOT_CENTER_X + GROUND_PLOT_WIDTH * offsetIndex;
    const hasLeftSite = leftX >= minX;
    const hasRightSite = rightX <= maxX;
    if (!hasLeftSite && !hasRightSite) break;

    if (hasLeftSite && isOutsideCastleBuildPadding(leftX)){
      addSite(`ground-left-${leftIndex}`, leftX);
      leftIndex += 1;
    }
    if (hasRightSite && isOutsideCastleBuildPadding(rightX)){
      addSite(`ground-right-${rightIndex}`, rightX);
      rightIndex += 1;
    }
  }

  return sites;
};

export const createRockBuildSites = (): BuildSite[] => {
  const sites: BuildSite[] = [];
  const minX = BUILD_SITE_EDGE_PADDING;
  const maxX = WORLD_WIDTH - BUILD_SITE_EDGE_PADDING;
  let leftIndex = 1;
  let rightIndex = 1;

  for (let offsetIndex = 1; ; offsetIndex += 1){
    const leftX = GROUND_PLOT_CENTER_X - BUILD_SITE_SPACING * offsetIndex;
    const rightX = GROUND_PLOT_CENTER_X + BUILD_SITE_SPACING * offsetIndex;
    const hasLeftSite = leftX >= minX;
    const hasRightSite = rightX <= maxX;
    if (!hasLeftSite && !hasRightSite) break;

    if (hasLeftSite && isOutsideCastleBuildPadding(leftX)){
      if (isRockBuildSiteIndexVisible(leftIndex)){
        sites.push({ id: `rock-left-${leftIndex}`, x: leftX, kind: 'rock', allowed: ROCK_BUILD_SITE_ALLOWED });
      }
      leftIndex += 1;
    }
    if (hasRightSite && isOutsideCastleBuildPadding(rightX)){
      if (isRockBuildSiteIndexVisible(rightIndex)){
        sites.push({ id: `rock-right-${rightIndex}`, x: rightX, kind: 'rock', allowed: ROCK_BUILD_SITE_ALLOWED });
      }
      rightIndex += 1;
    }
  }

  return sites;
};

export const BUILD_SITES = [
  { id: 'wall-left', x: CASTLE_OUTER_LEFT - 120, kind: 'wall-slot', allowed: WALL_BUILD_SITE_ALLOWED },
  { id: 'wall-right', x: CASTLE_OUTER_RIGHT + 120, kind: 'wall-slot', allowed: WALL_BUILD_SITE_ALLOWED },
  ...createRockBuildSites(),
  ...createGroundBuildSites()
] as const satisfies readonly BuildSite[];

export const getWallLevelStat = (level: number, branchLv3?: WallBranchLv3, branchLv5?: WallBranchLv5): StructureLevelStat => {
  if (level <= 1) return WALL_LEVELS[1];
  if (level === 2) return WALL_LEVELS[2];

  const lv3 = WALL_LEVELS[3][branchLv3 ?? 'spike'];
  const lv4 = level >= 4
    ? {
        ...lv3,
        hp: lv3.hp + WALL_LEVELS[4].hpBonus,
        arm: (lv3.arm ?? 0) + WALL_LEVELS[4].armBonus,
        res: (lv3.res ?? 0) + WALL_LEVELS[4].resBonus,
        hpRegen: WALL_LEVELS[4].hpRegen
      }
    : lv3;
  if (level < 5) return lv4;

  const lv5Config = WALL_LEVELS[5][branchLv5 ?? 'curse'];
  return {
    ...lv4,
    ...('curseMaxHpPercent' in lv5Config ? { curseMaxHpPercent: lv5Config.curseMaxHpPercent, curseCooldownSeconds: lv5Config.curseCooldownSeconds } : {}),
    ...('biochemicalCooldownSeconds' in lv5Config ? { biochemicalCooldownSeconds: lv5Config.biochemicalCooldownSeconds, biochemicalRange: lv5Config.biochemicalRange, biochemicalMaxTargets: lv5Config.biochemicalMaxTargets } : {}),
    ...('linkedHpBonusPercent' in lv5Config ? { linkedHpBonusPercent: lv5Config.linkedHpBonusPercent, linkedRegenShare: lv5Config.linkedRegenShare } : {}),
    hp: lv4.hp + lv5Config.hpBonus,
    arm: (lv4.arm ?? 0) + lv5Config.armBonus,
    res: (lv4.res ?? 0) + lv5Config.resBonus,
    hpRegen: (lv4.hpRegen ?? 0) + lv5Config.hpRegenBonus
  };
};

export const BASE_LEVELS = {
  0: { hp: 20, arm: 2, res: 2, healPerSecond: 0 },
  1: { hp: 30, arm: 3, res: 3, healPerSecond: 1 },
  2: { hp: 40, arm: 4, res: 4, healPerSecond: 2 },
  3: {
    defense: { hpBonus: 15, armBonus: 3, resBonus: 3, healPerSecondBonus: 2, allyHealPerSecond: 1 },
    attack: { hpBonus: 10, armBonus: 1, resBonus: 1, healPerSecondBonus: 1, allyAtkBonus: 2 }
  },
  4: { hpBonus: 10, armBonus: 2, resBonus: 2, allyHealPerSecondBonus: 1 },
  5: { hpBonus: 15, armBonus: 2, resBonus: 2, leaderHealMaxHpPercentPerSecond: 0.01, leaderShieldPercent: 0.2 },
  6: { allyHealPerSecondBonus: 3, emergencyHealPercent: 0.2, emergencyBaseSelfDamagePercent: 0.1, emergencyCooldownNights: 2 }
} as const;

export const getBaseLevelStat = (level: number, branchLv3: BaseBranchLv3 = 'defense'): StructureLevelStat => {
  if (level <= 0) return BASE_LEVELS[0];
  if (level === 1) return BASE_LEVELS[1];
  if (level === 2) return BASE_LEVELS[2];

  const lv3Config = BASE_LEVELS[3][branchLv3];
  const lv3: StructureLevelStat = {
    ...BASE_LEVELS[2],
    ...('allyAtkBonus' in lv3Config ? { allyAtkBonus: lv3Config.allyAtkBonus } : {}),
    ...('allyHealPerSecond' in lv3Config ? { allyHealPerSecond: lv3Config.allyHealPerSecond } : {}),
    hp: BASE_LEVELS[2].hp + lv3Config.hpBonus,
    arm: BASE_LEVELS[2].arm + lv3Config.armBonus,
    res: BASE_LEVELS[2].res + lv3Config.resBonus,
    healPerSecond: BASE_LEVELS[2].healPerSecond + lv3Config.healPerSecondBonus
  };
  if (level === 3) return lv3;

  const lv4: StructureLevelStat = {
    ...lv3,
    hp: lv3.hp + BASE_LEVELS[4].hpBonus,
    arm: (lv3.arm ?? 0) + BASE_LEVELS[4].armBonus,
    res: (lv3.res ?? 0) + BASE_LEVELS[4].resBonus,
    healPerSecond: lv3.healPerSecond,
    allyHealPerSecond: (lv3.allyHealPerSecond ?? 0) + BASE_LEVELS[4].allyHealPerSecondBonus,
  };
  if (level === 4) return lv4;

  const lv5: StructureLevelStat = {
    ...lv4,
    hp: lv4.hp + BASE_LEVELS[5].hpBonus,
    arm: (lv4.arm ?? 0) + BASE_LEVELS[5].armBonus,
    res: (lv4.res ?? 0) + BASE_LEVELS[5].resBonus,
    leaderHealMaxHpPercentPerSecond: BASE_LEVELS[5].leaderHealMaxHpPercentPerSecond,
    leaderShieldPercent: BASE_LEVELS[5].leaderShieldPercent
  };
  if (level === 5) return lv5;

  return {
    ...lv5,
    allyHealPerSecond: (lv5.allyHealPerSecond ?? 0) + BASE_LEVELS[6].allyHealPerSecondBonus,
    emergencyHealPercent: BASE_LEVELS[6].emergencyHealPercent,
    emergencyBaseSelfDamagePercent: BASE_LEVELS[6].emergencyBaseSelfDamagePercent,
    emergencyCooldownNights: BASE_LEVELS[6].emergencyCooldownNights
  };
};

export const BASE_STRUCTURE_STATS: Record<number, StructureLevelStat> = {
  0: getBaseLevelStat(0),
  1: getBaseLevelStat(1),
  2: getBaseLevelStat(2),
  3: getBaseLevelStat(3),
  4: getBaseLevelStat(4),
  5: getBaseLevelStat(5),
  6: getBaseLevelStat(6)
};

const ANTI_AIR_LV3_STATS = {
  quality: { hp: 16, range: metersToWorldUnits(20), damage: 2.2, cooldownSeconds: 1.6, reloadSeconds: 24, burstShotCount: 7, maxTargets: 1, projectileSpeed: 12 },
  quantity: { hp: 16, range: metersToWorldUnits(21), damage: 1.5, cooldownSeconds: 1.3, reloadSeconds: 20, burstShotCount: 5, maxTargets: 1, projectileSpeed: 12 }
} as const satisfies Record<AntiAirBranchLv3, StructureLevelStat>;

export const getAntiAirCannonLevelStat = (level: number, branchLv3: AntiAirBranchLv3 = 'quality', branchLv5: AntiAirBranchLv5 = 'rapidFire'): StructureLevelStat => {
  if (level <= 2) return GROUND_STRUCTURE_STATS.antiAirCannon[level] ?? GROUND_STRUCTURE_STATS.antiAirCannon[1] ?? { hp: 1 };
  const lv3 = ANTI_AIR_LV3_STATS[branchLv3];
  if (level === 3) return lv3;
  const lv4 = { ...lv3, hp: 22, range: metersToWorldUnits(23), damage: (lv3.damage ?? 0) + 0.3, cooldownSeconds: Math.max(0, (lv3.cooldownSeconds ?? 0) - 0.3), reloadSeconds: Math.max(0, (lv3.reloadSeconds ?? 0) - 5) };
  if (level === 4) return lv4;
  const lv5Bonus = branchLv5 === 'dragonSlayer' ? { damage: 3, cooldown: 0.3, reload: 2 } : { damage: 1, cooldown: 1, reload: 5 };
  const lv5 = { ...lv4, hp: 30, range: metersToWorldUnits(26), damage: (lv4.damage ?? 0) + lv5Bonus.damage, cooldownSeconds: Math.max(0, (lv4.cooldownSeconds ?? 0) - lv5Bonus.cooldown), reloadSeconds: Math.max(0, (lv4.reloadSeconds ?? 0) - lv5Bonus.reload) };
  if (level === 5) return lv5;
  return { ...lv5, hp: 40, damage: (lv5.damage ?? 0) + 3, cooldownSeconds: Math.max(0, (lv5.cooldownSeconds ?? 0) - 0.5), reloadSeconds: Math.max(0, (lv5.reloadSeconds ?? 0) - 5), affectsGroundAtLv6: true };
};

export const getGravityCannonLevelStat = (level: number, branchLv4: GravityBranchLv4 = 'godSlayer'): StructureLevelStat => {
  if (level <= 3) return GROUND_STRUCTURE_STATS.gravityCannon[level] ?? GROUND_STRUCTURE_STATS.gravityCannon[1] ?? { hp: 1 };
  const lv4 = branchLv4 === 'clearField'
    ? { hp: 28, range: metersToWorldUnits(0.3), triggerRadius: metersToWorldUnits(0.3), pullRadius: metersToWorldUnits(2), damageMaxHpPercent: 0.35, pullDurationSeconds: 1, chargeSeconds: 10, launchSpeed: metersToWorldUnits(15), cooldownSeconds: 25, minAffectedWeight: 1, maxAffectedWeight: 3, maxLaunchDistance: metersToWorldUnits(35) }
    : { hp: 28, range: metersToWorldUnits(0.5), triggerRadius: metersToWorldUnits(0.5), pullRadius: metersToWorldUnits(1.2), damageMaxHpPercent: 0.4, pullDurationSeconds: 5, launchSpeed: metersToWorldUnits(15), cooldownSeconds: 35, minAffectedWeight: 4, maxAffectedWeight: 5, maxLaunchDistance: metersToWorldUnits(35), bossEffectMultiplier: 0.4 };
  if (level === 4) return lv4;
  const lv5 = { ...lv4, hp: 36, damageMaxHpPercent: (lv4.damageMaxHpPercent ?? 0) + 0.1, cooldownSeconds: Math.max(0, (lv4.cooldownSeconds ?? 0) - 5) };
  return level === 5 ? lv5 : { ...lv5, hp: 48 };
};

export const getElementalTowerLevelStat = (level: number, element: ElementalTowerElement = 'Hỏa'): StructureLevelStat => ELEMENTAL_TOWER_STRUCTURE_STATS[element][level] ?? ELEMENTAL_TOWER_STRUCTURE_STATS[element][1] ?? { hp: 1 };

export const getStructureLevelStat = (type: StructureType, level: number, branchLv3?: WallBranchLv3 | BaseBranchLv3 | AntiAirBranchLv3 | GravityBranchLv4, branchLv5?: WallBranchLv5 | AntiAirBranchLv5, element?: ElementalTowerElement): StructureLevelStat => {
  if (type === 'wall') return getWallLevelStat(level, branchLv3 as WallBranchLv3 | undefined, branchLv5 as WallBranchLv5 | undefined);
  if (type === 'crystalSeal') return getBaseLevelStat(level, branchLv3 === 'attack' ? 'attack' : 'defense');
  if (type === 'watchtower') return WATCHTOWER_STRUCTURE_STATS[level] ?? { hp: 1 };
  if (type === 'elementalTower') return getElementalTowerLevelStat(level, element);
  if (type === 'executionBlade') return EXECUTION_BLADE_STRUCTURE_STATS[level] ?? EXECUTION_BLADE_STRUCTURE_STATS[1] ?? { hp: 1 };
  if (type === 'antiAirCannon') return getAntiAirCannonLevelStat(level, branchLv3 === 'quantity' ? 'quantity' : 'quality', branchLv5 === 'dragonSlayer' ? 'dragonSlayer' : 'rapidFire');
  if (type === 'gravityCannon') return getGravityCannonLevelStat(level, branchLv3 === 'clearField' ? 'clearField' : 'godSlayer');
  return GROUND_STRUCTURE_STATS[type][level] ?? { hp: 1 };
};
