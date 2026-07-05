import type { StructureType } from './structures.ts';

export type BuildSiteKind = 'rock' | 'ground' | 'wall-slot';
export type Side = 'left' | 'right';
export type EnemyTemplateId = 'twisted';

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
  templateId: EnemyTemplateId;
  x: number;
  hp: number;
  speed: number;
  baseSpeed: number;
  weight: number;
  side: Side;
}

export interface StructureRuntime {
  cooldown: number;
  hp: number;
  armed?: boolean;
  fuse?: number;
}
