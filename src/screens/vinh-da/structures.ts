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

export type StructureType = 'watchtower' | 'wall' | 'elementalTower' | 'barracks' | 'church' | 'crystalSeal' | 'landmine' | 'swamp' | 'spikeTrap' | 'antiAirCannon' | 'gravityCannon';
export type ElementalTowerElement = 'Hỏa' | 'Mộc' | 'Thủy' | 'Thổ' | 'Kim' | 'Lôi' | 'Huyết' | 'Ánh Sáng' | 'Phong';

export interface BuildMenuOption {
  label: string;
  type: StructureType;
}

export type WallBranchLv3 = 'spike' | 'slippery' | 'shock';
export type WallBranchLv5 = 'biochemical' | 'curse' | 'link';

export interface StructureLevelStat {
  hp: number;
  maxTargets?: number;
  projectileSpeed?: number;
  element?: ElementalTowerElement;
  healPerSecond?: number;
  healingBonusPercent?: number;
  shield?: number;
  emergencyHealPercent?: number;
  emergencyCooldownSeconds?: number;
  buffArmPercent?: number;
  buffResPercent?: number;
  buffAtkPercent?: number;
  buffWilPercent?: number;
  prayerIntervalSeconds?: number;
  cleanseContaminationSeconds?: number;
  soldierCap?: number;
  soldierRank?: number;
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
  affectsGroundAtLv6?: boolean;
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

const STRUCTURE_COST_MULTIPLIER: Record<StructureType, number> = {
  watchtower: 1,
  wall: 0.8,
  elementalTower: 1.15,
  barracks: 1.2,
  church: 1.1,
  crystalSeal: 1,
  landmine: 0.6,
  swamp: 0.75,
  spikeTrap: 0.75,
  antiAirCannon: 1.25,
  gravityCannon: 1.35,
};

export const getBuildLevelCost = (type: StructureType, level: number): number => Math.max(1, Math.ceil((BUILD_LEVEL_COST[level as keyof typeof BUILD_LEVEL_COST] ?? BUILD_LEVEL_COST[6]) * (STRUCTURE_COST_MULTIPLIER[type] ?? 1)));

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
  { label: 'Bẫy', type: 'elementalTower' },
  { label: 'Pha lê', type: 'crystalSeal' },
  { label: 'Ấn', type: 'church' },
  { label: 'Trại', type: 'barracks' }
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
} as const;

export const isStructureAllowedOnBuildSite = (type: StructureType, site: Pick<BuildSite, 'kind'>): boolean => STRUCTURE_SURFACES[type].includes(site.kind);

export const ROCK_BUILD_SITE_ALLOWED = ['watchtower', 'elementalTower', 'barracks', 'church', 'crystalSeal'] as const satisfies readonly StructureType[];
export const GROUND_BUILD_SITE_ALLOWED = ['landmine', 'spikeTrap', 'swamp', 'antiAirCannon', 'gravityCannon'] as const satisfies readonly StructureType[];
export const WALL_BUILD_SITE_ALLOWED = ['wall'] as const satisfies readonly StructureType[];
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

export const ELEMENTAL_TOWER_ELEMENTS = ['Hỏa', 'Mộc', 'Thủy', 'Thổ', 'Kim', 'Lôi', 'Huyết', 'Ánh Sáng', 'Phong'] as const satisfies readonly ElementalTowerElement[];
export const ELEMENTAL_TOWER_STRUCTURE_STATS: Record<ElementalTowerElement, Record<number, StructureLevelStat>> = Object.fromEntries(ELEMENTAL_TOWER_ELEMENTS.map((element) => [element, {
  1: { hp: 10, element, maxTargets: 1, range: ELEMENTAL_TOWER_RANGE_WORLD_UNITS, damage: 2, cooldownSeconds: 2, projectileSpeed: 6 },
  2: { hp: 14, element, maxTargets: 1, range: ELEMENTAL_TOWER_RANGE_WORLD_UNITS, damage: 4, cooldownSeconds: 1.8, projectileSpeed: 6 },
  3: { hp: 20, element, maxTargets: 2, range: ELEMENTAL_TOWER_RANGE_WORLD_UNITS, damage: 4, cooldownSeconds: 1.6, projectileSpeed: 6 },
  4: { hp: 28, element, maxTargets: 2, range: ELEMENTAL_TOWER_RANGE_WORLD_UNITS, damage: 5, cooldownSeconds: 1.5, projectileSpeed: 6 },
  5: { hp: 36, element, maxTargets: 3, range: ELEMENTAL_TOWER_RANGE_WORLD_UNITS, damage: 7, cooldownSeconds: 3, projectileSpeed: 6 }
}])) as unknown as Record<ElementalTowerElement, Record<number, StructureLevelStat>>;

export const GROUND_STRUCTURE_STATS: Record<Exclude<StructureType, 'wall' | 'watchtower'>, Record<number, StructureLevelStat>> = {
  elementalTower: ELEMENTAL_TOWER_STRUCTURE_STATS['Hỏa'],
  barracks: {
    1: { hp: 18, soldierCap: 1, soldierRank: 1, soldierSpawnSeconds: 10 },
    2: { hp: 24, soldierCap: 2, soldierRank: 1, soldierSpawnSeconds: 9 },
    3: { hp: 32, soldierCap: 2, soldierRank: 2, soldierSpawnSeconds: 8 },
    4: { hp: 42, soldierCap: 3, soldierRank: 2, soldierSpawnSeconds: 7 },
    5: { hp: 54, soldierCap: 4, soldierRank: 3, soldierSpawnSeconds: 6 },
    6: { hp: 70, soldierCap: 5, soldierRank: 4, soldierSpawnSeconds: 5, ultimatePermission: true }
  },
  church: {
    1: { hp: 14, buffArmPercent: 0.03, buffResPercent: 0.03, prayerIntervalSeconds: 20, cleanseContaminationSeconds: CONTAMINATION_CLEANSE_SECONDS },
    2: { hp: 18, buffArmPercent: 0.05, buffResPercent: 0.05, healingBonusPercent: 0.05, prayerIntervalSeconds: 18, cleanseContaminationSeconds: CONTAMINATION_CLEANSE_SECONDS },
    3: { hp: 24, buffArmPercent: 0.07, buffResPercent: 0.07, buffAtkPercent: 0.04, buffWilPercent: 0.04, healingBonusPercent: 0.08, prayerIntervalSeconds: 16, cleanseContaminationSeconds: CONTAMINATION_CLEANSE_SECONDS },
    4: { hp: 32, buffArmPercent: 0.1, buffResPercent: 0.1, buffAtkPercent: 0.06, buffWilPercent: 0.06, healingBonusPercent: 0.12, prayerIntervalSeconds: 14, cleanseContaminationSeconds: CONTAMINATION_CLEANSE_SECONDS },
    5: { hp: 44, buffArmPercent: 0.14, buffResPercent: 0.14, buffAtkPercent: 0.08, buffWilPercent: 0.08, healingBonusPercent: 0.16, shield: 12, prayerIntervalSeconds: 12, cleanseContaminationSeconds: CONTAMINATION_CLEANSE_SECONDS }
  },
  crystalSeal: {
    0: { hp: 20, arm: 2, res: 2, healPerSecond: 0 },
    1: { hp: 30, arm: 3, res: 3, healPerSecond: 1 },
    2: { hp: 40, arm: 4, res: 4, healPerSecond: 2 },
    3: { hp: 55, arm: 7, res: 7, healPerSecond: 4 },
    4: { hp: 65, arm: 9, res: 9, healPerSecond: 5 },
    5: { hp: 80, arm: 11, res: 11, healPerSecond: 5, shield: 0.2 },
    6: { hp: 80, arm: 11, res: 11, healPerSecond: 3, emergencyHealPercent: 0.2, emergencyCooldownSeconds: 600 }
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
    1: { hp: 8, range: metersToWorldUnits(130), damage: 2, cooldownSeconds: 0.18, reloadSeconds: 2.6, burstShotCount: 3, maxTargets: 1, projectileSpeed: 10 },
    2: { hp: 12, range: metersToWorldUnits(140), damage: 3, cooldownSeconds: 0.16, reloadSeconds: 2.5, burstShotCount: 3, maxTargets: 1, projectileSpeed: 10 },
    3: { hp: 16, range: metersToWorldUnits(150), damage: 4, cooldownSeconds: 0.14, reloadSeconds: 2.4, burstShotCount: 4, maxTargets: 1, projectileSpeed: 11 },
    4: { hp: 22, range: metersToWorldUnits(160), damage: 5, cooldownSeconds: 0.12, reloadSeconds: 2.3, burstShotCount: 4, maxTargets: 1, projectileSpeed: 11 },
    5: { hp: 30, range: metersToWorldUnits(170), damage: 7, cooldownSeconds: 0.1, reloadSeconds: 2.2, burstShotCount: 5, maxTargets: 1, projectileSpeed: 12 },
    6: { hp: 40, range: metersToWorldUnits(180), damage: 9, cooldownSeconds: 0.09, reloadSeconds: 2, burstShotCount: 6, maxTargets: 1, projectileSpeed: 12, affectsGroundAtLv6: true }
  },
  gravityCannon: {
    1: { hp: 10, range: metersToWorldUnits(115), pullRadius: metersToWorldUnits(55), pullStrength: 70, cooldownSeconds: 4.5, maxAffectedWeight: 1 },
    2: { hp: 14, range: metersToWorldUnits(125), pullRadius: metersToWorldUnits(60), pullStrength: 85, cooldownSeconds: 4.2, maxAffectedWeight: 1.5 },
    3: { hp: 20, range: metersToWorldUnits(135), pullRadius: metersToWorldUnits(65), pullStrength: 100, cooldownSeconds: 3.9, maxAffectedWeight: 2 },
    4: { hp: 28, range: metersToWorldUnits(145), pullRadius: metersToWorldUnits(70), pullStrength: 115, cooldownSeconds: 3.6, maxAffectedWeight: 2.5 },
    5: { hp: 36, range: metersToWorldUnits(155), pullRadius: metersToWorldUnits(75), pullStrength: 130, cooldownSeconds: 3.3, maxAffectedWeight: 3 },
    6: { hp: 48, range: metersToWorldUnits(165), pullRadius: metersToWorldUnits(85), pullStrength: 155, cooldownSeconds: 3, maxAffectedWeight: Number.POSITIVE_INFINITY }
  }
};

const isOutsideCastleBuildPadding = (x: number): boolean => (
  x <= CASTLE_OUTER_LEFT - BUILD_SITE_CASTLE_PADDING
  || x >= CASTLE_OUTER_RIGHT + BUILD_SITE_CASTLE_PADDING
);

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
      sites.push({ id: `rock-left-${leftIndex}`, x: leftX, kind: 'rock', allowed: ROCK_BUILD_SITE_ALLOWED });
      leftIndex += 1;
    }
    if (hasRightSite && isOutsideCastleBuildPadding(rightX)){
      sites.push({ id: `rock-right-${rightIndex}`, x: rightX, kind: 'rock', allowed: ROCK_BUILD_SITE_ALLOWED });
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

export const BASE_STRUCTURE_STATS: Record<number, StructureLevelStat> = {
  0: { hp: 20, arm: 2, res: 2, healPerSecond: 0 },
  1: { hp: 30, arm: 3, res: 3, healPerSecond: 1 },
  2: { hp: 40, arm: 4, res: 4, healPerSecond: 2 },
  3: { hp: 55, arm: 7, res: 7, healPerSecond: 4 },
  4: { hp: 65, arm: 9, res: 9, healPerSecond: 5 },
  5: { hp: 80, arm: 11, res: 11, healPerSecond: 5, shield: 0.2 },
  6: { hp: 80, arm: 11, res: 11, healPerSecond: 3, emergencyHealPercent: 0.2, emergencyCooldownSeconds: 600 }
};

export const getElementalTowerLevelStat = (level: number, element: ElementalTowerElement = 'Hỏa'): StructureLevelStat => ELEMENTAL_TOWER_STRUCTURE_STATS[element][level] ?? ELEMENTAL_TOWER_STRUCTURE_STATS[element][1] ?? { hp: 1 };

export const getStructureLevelStat = (type: StructureType, level: number, branchLv3?: WallBranchLv3, branchLv5?: WallBranchLv5, element?: ElementalTowerElement): StructureLevelStat => {
  if (type === 'wall') return getWallLevelStat(level, branchLv3, branchLv5);
  if (type === 'watchtower') return WATCHTOWER_STRUCTURE_STATS[level] ?? { hp: 1 };
  if (type === 'elementalTower') return getElementalTowerLevelStat(level, element);
  return GROUND_STRUCTURE_STATS[type][level] ?? { hp: 1 };
};
