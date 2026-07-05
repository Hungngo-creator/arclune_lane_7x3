import {
  BUILD_SITE_CASTLE_PADDING,
  BUILD_SITE_EDGE_PADDING,
  BUILD_SITE_SPACING,
  CASTLE_OUTER_LEFT,
  CASTLE_OUTER_RIGHT,
  CRYSTAL_X,
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

const createGroundBuildSites = (): BuildSite[] => {
  const sites: BuildSite[] = [];
  const addSide = (side: 'left' | 'right', startX: number, endX: number): void => {
    const direction = side === 'left' ? -1 : 1;
    let index = 1;
    for (let x = startX; direction < 0 ? x >= endX : x <= endX; x += direction * BUILD_SITE_SPACING){
      sites.push({ id: `ground-${side}-${index}`, x, kind: 'ground', allowed: GROUND_BUILD_SITE_ALLOWED });
      index += 1;
    }
  };

  addSide('left', CASTLE_OUTER_LEFT - BUILD_SITE_CASTLE_PADDING, BUILD_SITE_EDGE_PADDING);
  addSide('right', CASTLE_OUTER_RIGHT + BUILD_SITE_CASTLE_PADDING, WORLD_WIDTH - BUILD_SITE_EDGE_PADDING);
  return sites;
};

export const BUILD_SITES = [
  { id: 'wall-left', x: CASTLE_OUTER_LEFT - 120, kind: 'wall-slot', allowed: WALL_BUILD_SITE_ALLOWED },
  { id: 'wall-right', x: CASTLE_OUTER_RIGHT + 120, kind: 'wall-slot', allowed: WALL_BUILD_SITE_ALLOWED },
  { id: 'castle-ground', x: CRYSTAL_X, kind: 'ground', allowed: CASTLE_GROUND_BUILD_SITE_ALLOWED },
  ...createGroundBuildSites()
] as const satisfies readonly BuildSite[];

export const getStructureLevelStat = (type: StructureType, level: number): StructureLevelStat => {
  if (type === 'wall') return WALL_STRUCTURE_STATS[level] ?? { hp: 1 };
  if (type === 'watchtower') return WATCHTOWER_STRUCTURE_STATS[level] ?? { hp: 1 };
  return GROUND_STRUCTURE_STATS[type][level] ?? { hp: 1 };
};
