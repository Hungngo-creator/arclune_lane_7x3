import type { EnemyKind } from './enemies.ts';
import type { StructureType, WallBranchLv3, WallBranchLv5 } from './structures.ts';

export type BuildSiteKind = 'rock' | 'ground' | 'wall-slot';
export type Side = 'left' | 'right';

export interface BuildSite {
  id: string;
  x: number;
  kind: BuildSiteKind;
  allowed: readonly StructureType[];
}

export interface PlacedStructure {
  siteId: string;
  type: StructureType;
  level: number;
  branchLv3?: WallBranchLv3;
  branchLv5?: WallBranchLv5;
  mountedStructure?: StructureType | null;
}

export interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  hp: number;
  maxHp: number;
  speed: number;
  baseSpeed: number;
  weight: number;
  attackCooldown: number;
  canFly: boolean;
  side: Side;
  mageOrbTimer?: number;
  mageOrbs?: number;
}

export interface StructureRuntime {
  cooldown: number;
  hp: number;
  armed?: boolean;
  fuse?: number;
  dragonHitCount?: number;
  attackerCooldowns?: Map<string, number>;
}
