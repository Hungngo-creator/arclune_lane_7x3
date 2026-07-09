import type { EnemyKind, EnemyTier } from './enemies.ts';
import type { ElementalTowerElement, StructureType, WallBranchLv3, WallBranchLv5 } from './structures.ts';
import type { TieredAmount, VinhDaResourceId, VinhDaTier } from './economy/resources.ts';

export type BuildSiteKind = 'rock' | 'ground' | 'wall-slot';
export type ElementalRegionKind = 'fire' | 'wood' | 'water' | 'earth' | 'metal' | 'thunder' | 'blood' | 'light' | 'wind' | 'dark';
export type Side = 'left' | 'right';

export type EnemyAttackShape = 'melee' | 'projectile' | 'explosion' | 'flyby' | 'line' | 'aura';
export type EnemyStatusOnHit = 'contamination' | 'bleed' | 'slow' | 'paralysis';
export type ApostleState = 'ambush' | 'assaultBase' | 'assaultStructure';

export interface VinhDaTimedStack {
  remainingSeconds: number;
}

export interface VinhDaStatusCollection {
  bleedStacks?: VinhDaTimedStack[];
  contaminationStacks?: number;
  paralysisSeconds?: number;
  paralysisSourceCooldowns?: Record<string, number>;
  slowSeconds?: number;
  slowMultiplier?: number;
  knockbackSourceCooldowns?: Record<string, number>;
  burnSeconds?: number;
  burnDps?: number;
  elementalAllyBuffSeconds?: number;
  elementalHealingBonus?: number;
  elementalArmBonusPercent?: number;
  elementalResBonusPercent?: number;
  elementalAtkBonusPercent?: number;
  elementalWilBonusPercent?: number;
  elementalBloodMaxHpBonus?: number;
  elementalRegionEarthBonusApplied?: boolean;
}

export type EnemyUltimate = 'dragon-rage' | 'commander-aura' | 'death-burst';

export interface ElementalRegion {
  id: string;
  kind: ElementalRegionKind;
  startX: number;
  endX: number;
}

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
  mountedLevel?: number;
  branchLv3?: WallBranchLv3;
  branchLv5?: WallBranchLv5;
  mountedStructure?: StructureType | null;
  element?: ElementalTowerElement;
}

export interface RuntimeSoldier {
  id: number;
  siteId: string;
  rank: number;
  hp: number;
  x: number;
  side: Side;
  attackCooldown: number;
  ultimateReady?: boolean;
  statuses?: VinhDaStatusCollection;
}

export type DroppedResourceKind = VinhDaResourceId;

export interface DroppedResource extends TieredAmount {
  id: number;
  x: number;
  kind: DroppedResourceKind;
  tier?: EnemyTier | VinhDaTier;
}

export interface EnemyPortal {
  id: string;
  side?: Side;
  x?: number;
}

export interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  hp: number;
  maxHp: number;
  speed: number;
  baseSpeed: number;
  groundSpeed: number;
  flySpeed: number;
  weight: number;
  attackCooldown: number;
  atk: number;
  wil: number;
  arm: number;
  res: number;
  tier: EnemyTier;
  rank: number;
  projectileSpeed: number;
  attackShape: EnemyAttackShape;
  aoeRadius: number;
  statusOnHit: EnemyStatusOnHit | null;
  canFly: boolean;
  hasCommanderAura: boolean;
  contaminationOnHit: boolean;
  bleedOnHit: boolean;
  deathExplosion: boolean;
  regen: boolean;
  dragonDestroyStructure: boolean;
  ultimate: EnemyUltimate | null;
  side: Side;
  apostleState?: ApostleState;
  mageOrbTimer?: number;
  mageOrbs?: number;
  birdAccelerating?: boolean;
  regenTimer?: number;
  dragonDestroyCooldown?: number;
  dragonUltimateCooldown?: number;
  statuses?: VinhDaStatusCollection;
  burnSeconds?: number;
  burnDps?: number;
  slowSeconds?: number;
  slowMultiplier?: number;
  paralysisCooldown?: number;
  bloodMaxHpStacks?: number;
  lightVulnerableSeconds?: number;
  bleedSeconds?: number;
  bleedMaxHpDpsPercent?: number;
}

export interface StructureRuntime {
  cooldown: number;
  hp: number;
  biochemicalCooldown?: number;
  linkedWallSiteId?: string | null;
  linkedMaxHpBonus?: number;
  linkedRegenBonus?: number;
  armed?: boolean;
  fuse?: number;
  dragonHitCount?: number;
  attackerCooldowns?: Map<string, number>;
  prayerTimer?: number;
  contaminationCleanseTimer?: number;
  statuses?: VinhDaStatusCollection;
  soldierSpawnTimer?: number;
  soldiers?: RuntimeSoldier[];
  nextSoldierId?: number;
  emergencyHealCooldown?: number;
  burstShotsRemaining?: number;
  gravityEnabled?: boolean;
}
