import type { EnemyKind } from './enemies.ts';
import type { StructureType } from './structures.ts';

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
}

export interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  hp: number;
  speed: number;
  baseSpeed: number;
  weight: number;
  attackCooldown: number;
  canFly: boolean;
  side: Side;
}

export interface StructureRuntime {
  cooldown: number;
  hp: number;
  armed?: boolean;
  fuse?: number;
}
