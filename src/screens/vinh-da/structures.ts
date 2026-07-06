import {
  BUILD_SITE_CASTLE_PADDING,
  BUILD_SITE_EDGE_PADDING,
  GROUND_PLOT_CENTER_X,
  GROUND_PLOT_WIDTH,
  CASTLE_OUTER_LEFT,
  CASTLE_OUTER_RIGHT,
  WORLD_WIDTH
} from './constants.ts';
import type { BuildSite, BuildSiteKind } from './types.ts';

export type StructureType = 'watchtower' | 'wall' | 'elementalTower' | 'barracks' | 'church' | 'crystalSeal' | 'landmine' | 'swamp';

export interface BuildMenuOption {
  label: string;
  type: StructureType;
}

export type WallBranchLv3 = 'spike' | 'slippery' | 'shock';
export type WallBranchLv5 = 'biochemical' | 'curse' | 'link';

export interface StructureLevelStat {
  hp: number;
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
}

export const UPGRADE_NODE_LABEL = 'Nâng cấp';
export const BUILD_LEVEL_COST = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
} as const satisfies Record<number, number>;

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
    biochemical: { hpBonus: 20, armBonus: 4, resBonus: 4, hpRegenBonus: 5 },
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
  { label: 'Đầm lầy', type: 'swamp' }
] as const satisfies readonly BuildMenuOption[];

export const STRUCTURE_SURFACES: Record<StructureType, readonly BuildSiteKind[]> = {
  watchtower: ['rock', 'wall-slot'],
  wall: ['wall-slot'],
  elementalTower: ['rock', 'wall-slot'],
  barracks: ['rock', 'wall-slot'],
  church: ['rock', 'wall-slot'],
  crystalSeal: ['rock', 'wall-slot'],
  landmine: ['ground'],
  swamp: ['ground']
} as const;

export const isStructureAllowedOnBuildSite = (type: StructureType, site: Pick<BuildSite, 'kind'>): boolean => STRUCTURE_SURFACES[type].includes(site.kind);

export const GROUND_BUILD_SITE_ALLOWED = ['landmine', 'swamp'] as const satisfies readonly StructureType[];
export const WALL_BUILD_SITE_ALLOWED = ['wall'] as const satisfies readonly StructureType[];
export const CASTLE_GROUND_BUILD_SITE_ALLOWED = GROUND_BUILD_SITE_ALLOWED;

export const WALL_STRUCTURE_STATS: Record<number, StructureLevelStat> = {
  1: WALL_LEVELS[1],
  2: WALL_LEVELS[2],
};

export const WATCHTOWER_STRUCTURE_STATS: Record<number, StructureLevelStat> = {
  1: { hp: 1, range: 460, damage: 1, cooldownSeconds: 0.55 },
  2: { hp: 1, range: 460, damage: 2, cooldownSeconds: 0.55 }
};

export const GROUND_STRUCTURE_STATS: Record<Exclude<StructureType, 'wall' | 'watchtower'>, Record<number, StructureLevelStat>> = {
  elementalTower: {
    1: { hp: 1, range: 460, damage: 1, cooldownSeconds: 0.55 },
    2: { hp: 1, range: 460, damage: 2, cooldownSeconds: 0.55 }
  },
  barracks: {
    1: { hp: 1 },
    2: { hp: 1 }
  },
  church: {
    1: { hp: 1 },
    2: { hp: 1 }
  },
  crystalSeal: {
    1: { hp: 1 },
    2: { hp: 1 }
    },
  landmine: {
    1: { hp: 1 },
    2: { hp: 1 }
  },
  swamp: {
    1: { hp: 1 },
    2: { hp: 1 }
  }
};

const isOutsideCastleBuildPadding = (x: number): boolean => (
  x <= CASTLE_OUTER_LEFT - BUILD_SITE_CASTLE_PADDING
  || x >= CASTLE_OUTER_RIGHT + BUILD_SITE_CASTLE_PADDING
);

const createGroundBuildSites = (): BuildSite[] => {
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

export const BUILD_SITES = [
  { id: 'wall-left', x: CASTLE_OUTER_LEFT - 120, kind: 'wall-slot', allowed: WALL_BUILD_SITE_ALLOWED },
  { id: 'wall-right', x: CASTLE_OUTER_RIGHT + 120, kind: 'wall-slot', allowed: WALL_BUILD_SITE_ALLOWED },
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
    hp: lv4.hp + lv5Config.hpBonus,
    arm: (lv4.arm ?? 0) + lv5Config.armBonus,
    res: (lv4.res ?? 0) + lv5Config.resBonus,
    hpRegen: (lv4.hpRegen ?? 0) + lv5Config.hpRegenBonus
  };
};

export const getStructureLevelStat = (type: StructureType, level: number, branchLv3?: WallBranchLv3, branchLv5?: WallBranchLv5): StructureLevelStat => {
  if (type === 'wall') return getWallLevelStat(level, branchLv3, branchLv5);
  if (type === 'watchtower') return WATCHTOWER_STRUCTURE_STATS[level] ?? { hp: 1 };
  return GROUND_STRUCTURE_STATS[type][level] ?? { hp: 1 };
};
