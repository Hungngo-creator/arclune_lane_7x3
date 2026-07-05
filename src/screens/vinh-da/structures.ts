import {
  BUILD_SITE_CASTLE_PADDING,
  BUILD_SITE_EDGE_PADDING,
  GROUND_PLOT_CENTER_X,
  GROUND_PLOT_WIDTH,
  CASTLE_OUTER_LEFT,
  CASTLE_OUTER_RIGHT,
  WORLD_WIDTH
} from './constants.ts';
import type { BuildSite } from './types.ts';

export type StructureType = 'watchtower' | 'wall' | 'elementalTower' | 'barracks' | 'church' | 'crystalSeal';

export interface BuildMenuOption {
  label: string;
  type: StructureType;
}

export interface StructureLevelStat {
  hp: number;
  range?: number;
  damage?: number;
  cooldownSeconds?: number;
}

export const UPGRADE_NODE_LABEL = 'Nâng cấp';
export const BUILD_LEVEL_COST = {
  1: 0,
  2: 1
} as const satisfies Record<number, number>;

export const BUILD_NODE_OPTIONS = [
  { label: 'Tháp', type: 'watchtower' },
  { label: 'Tường', type: 'wall' },
  { label: 'Bẫy', type: 'elementalTower' },
  { label: 'Pha lê', type: 'crystalSeal' },
  { label: 'Ấn', type: 'church' },
  { label: 'Trại', type: 'barracks' }
] as const satisfies readonly BuildMenuOption[];

export const GROUND_BUILD_SITE_ALLOWED = ['watchtower', 'elementalTower', 'barracks', 'church'] as const satisfies readonly StructureType[];
export const WALL_BUILD_SITE_ALLOWED = ['wall'] as const satisfies readonly StructureType[];
export const CASTLE_GROUND_BUILD_SITE_ALLOWED = ['church', 'crystalSeal'] as const satisfies readonly StructureType[];

export const WALL_STRUCTURE_STATS: Record<number, StructureLevelStat> = {
  1: { hp: 8 },
  2: { hp: 16 }
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

export const getStructureLevelStat = (type: StructureType, level: number): StructureLevelStat => {
  if (type === 'wall') return WALL_STRUCTURE_STATS[level] ?? { hp: 1 };
  if (type === 'watchtower') return WATCHTOWER_STRUCTURE_STATS[level] ?? { hp: 1 };
  return GROUND_STRUCTURE_STATS[type][level] ?? { hp: 1 };
};
