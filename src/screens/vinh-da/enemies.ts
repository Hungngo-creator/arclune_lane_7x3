import type { DroppedResourceKind, EnemyAttackShape, EnemyStatusOnHit, EnemyUltimate } from './types.ts';

export type EnemyKind =
  | 'twisted'
  | 'crawler'
  | 'madDog'
  | 'suicideBomber'
  | 'mutantBird'
  | 'darkMage'
  | 'ironMan'
  | 'resentfulDragon'
  | 'apostle';

export type EnemyTier = 1.1 | 1.2 | 1.3;

export interface EnemyCombatStats {
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
}

export interface EnemyBehaviorFlags {
  canFly: boolean;
  groundSpeed: number;
  flySpeed: number;
  hasCommanderAura: boolean;
  contaminationOnHit: boolean;
  bleedOnHit: boolean;
  deathExplosion: boolean;
  regen: boolean;
  dragonDestroyStructure: boolean;
  ultimate: EnemyUltimate | null;
}

export interface EnemyTemplate extends EnemyCombatStats, EnemyBehaviorFlags {
  kind: EnemyKind;
  label: string;
  hp: number;
  speed: number;
  weight: number;
  attackRange: number;
  attackCooldown: number;
  /** Derived from ATK/WIL for legacy callers; prefer atk/wil in new combat code. */
  damage: number;
  reward: number;
}

const METERS_TO_WORLD_UNITS = 100;

const DEFAULT_COMBAT_STATS: Pick<EnemyCombatStats, 'wil' | 'arm' | 'res' | 'tier' | 'rank' | 'projectileSpeed' | 'attackShape' | 'aoeRadius' | 'statusOnHit'> = {
  wil: 0,
  arm: 0,
  res: 0,
  tier: 1.1,
  rank: 1,
  projectileSpeed: 0,
  attackShape: 'melee',
  aoeRadius: 0,
  statusOnHit: null
};

const DEFAULT_BEHAVIOR_FLAGS: Pick<EnemyBehaviorFlags, 'canFly' | 'hasCommanderAura' | 'contaminationOnHit' | 'bleedOnHit' | 'deathExplosion' | 'regen' | 'dragonDestroyStructure' | 'ultimate'> = {
  canFly: false,
  hasCommanderAura: false,
  contaminationOnHit: false,
  bleedOnHit: false,
  deathExplosion: false,
  regen: false,
  dragonDestroyStructure: false,
  ultimate: null
};

type EnemyTemplateInput = Omit<EnemyTemplate, 'damage' | 'groundSpeed' | 'flySpeed' | keyof typeof DEFAULT_COMBAT_STATS | keyof typeof DEFAULT_BEHAVIOR_FLAGS> &
  Partial<Omit<EnemyCombatStats, 'atk'>> &
  Partial<Omit<EnemyBehaviorFlags, 'groundSpeed' | 'flySpeed'>> & {
    atk: number;
    groundSpeed?: number;
    flySpeed?: number;
    damage?: never;
  };

const deriveEnemyDamage = ({ atk, wil }: Pick<EnemyCombatStats, 'atk' | 'wil'>): number => Math.max(atk, wil);

const defineEnemyTemplate = (template: EnemyTemplateInput): EnemyTemplate => {
  const combatStats = { ...DEFAULT_COMBAT_STATS, ...template };
  const behaviorFlags = { ...DEFAULT_BEHAVIOR_FLAGS, ...template };
  const groundSpeed = template.groundSpeed ?? template.speed;
  const flySpeed = template.flySpeed ?? (behaviorFlags.canFly ? template.speed : 0);

  return {
    ...template,
    ...combatStats,
    ...behaviorFlags,
    groundSpeed,
    flySpeed,
    speed: behaviorFlags.canFly ? flySpeed : groundSpeed,
    damage: deriveEnemyDamage(combatStats)
  };
};

export const getEnemyTierScalingMultiplier = (tier: EnemyTier): number => {
  if (tier === 1.2) return 2;
  if (tier === 1.3) return 3;
  return 1;
};

export const scaleEnemyTierStat = (value: number, tier: EnemyTier): number => value * getEnemyTierScalingMultiplier(tier);

export const reduceDamageByDefense = (raw: number, defense: number): number => raw * 100 / (100 + Math.max(0, defense));

export const ENEMY_TEMPLATES = {
  twisted: defineEnemyTemplate({
    kind: 'twisted',
    label: 'Kẻ vặn vẹo',
    hp: 3,
    speed: 0.4 * METERS_TO_WORLD_UNITS,
    weight: 1,
    attackRange: 28,
    attackCooldown: 2.5,
    atk: 1,
    statusOnHit: 'bleed',
    bleedOnHit: true,
    reward: 1
  }),
  crawler: defineEnemyTemplate({
    kind: 'crawler',
    label: 'Người bò sát',
    hp: 3,
    speed: 1 * METERS_TO_WORLD_UNITS,
    weight: 0.9,
    attackRange: 20,
    attackCooldown: 2,
    atk: 1,
    statusOnHit: 'bleed',
    bleedOnHit: true,
    reward: 1
  }),
  madDog: defineEnemyTemplate({
    kind: 'madDog',
    label: 'Chó điên',
    hp: 1.5,
    speed: 1.3 * METERS_TO_WORLD_UNITS,
    weight: 0.3,
    attackRange: 18,
    attackCooldown: 4,
    atk: 1,
    rank: 2,
    statusOnHit: 'contamination',
    contaminationOnHit: true,
    reward: 1
  }),
  suicideBomber: defineEnemyTemplate({
    kind: 'suicideBomber',
    label: 'Bạo Tạc Giả',
    hp: 2,
    speed: 0.45 * METERS_TO_WORLD_UNITS,
    weight: 1.5,
    attackRange: 28,
    attackCooldown: 3,
    atk: 2,
    wil: 2,
    arm: 2,
    res: 2,
    attackShape: 'melee',
    aoeRadius: 5 * METERS_TO_WORLD_UNITS,
    statusOnHit: 'contamination',
    contaminationOnHit: true,
    deathExplosion: true,
    reward: 2
  }),
  mutantBird: defineEnemyTemplate({
    kind: 'mutantBird',
    label: 'Chim biến dị',
    hp: 1.3,
    speed: 1.5 * METERS_TO_WORLD_UNITS,
    weight: 0.1,
    attackRange: 12 * METERS_TO_WORLD_UNITS,
    attackCooldown: 0,
    atk: 1,
    wil: 1,
    canFly: true,
    attackShape: 'flyby',
    reward: 1
  }),
  darkMage: defineEnemyTemplate({
    kind: 'darkMage',
    label: 'Pháp sư hắc ám',
    hp: 3,
    speed: 0.5 * METERS_TO_WORLD_UNITS,
    weight: 1,
    attackRange: 200,
    attackCooldown: 2,
    atk: 1,
    wil: 3.5,
    arm: 1,
    res: 1,
    projectileSpeed: 2 * METERS_TO_WORLD_UNITS,
    attackShape: 'projectile',
    statusOnHit: 'contamination',
    contaminationOnHit: true,
    reward: 2
  }),
  ironMan: defineEnemyTemplate({
    kind: 'ironMan',
    label: 'Thiết Hán',
    hp: 5.5,
    speed: 0.3 * METERS_TO_WORLD_UNITS,
    weight: 2.8,
    attackRange: 26,
    attackCooldown: 1.5,
    atk: 2,
    wil: 2,
    arm: 4,
    res: 3,
    regen: true,
    rank: 2,
    reward: 3
  }),
  apostle: defineEnemyTemplate({
    kind: 'apostle',
    label: 'Sứ Đồ',
    hp: 5,
    speed: 0.55 * METERS_TO_WORLD_UNITS,
    weight: 1,
    attackRange: 150,
    attackCooldown: 3,
    projectileSpeed: 1.5 * METERS_TO_WORLD_UNITS,
    attackShape: 'projectile',
    hasCommanderAura: true,
    atk: 2,
    wil: 2,
    arm: 2,
    res: 2,
    statusOnHit: 'contamination',
    contaminationOnHit: true,
    reward: 0
  }),
  resentfulDragon: defineEnemyTemplate({
    kind: 'resentfulDragon',
    label: 'Oán Long',
    hp: 15,
    speed: 2.5 * METERS_TO_WORLD_UNITS,
    groundSpeed: 0.8 * METERS_TO_WORLD_UNITS,
    weight: 4,
    attackRange: 5 * METERS_TO_WORLD_UNITS,
    attackCooldown: 5,
    atk: 6,
    wil: 8,
    arm: 7,
    res: 7,
    tier: 1.3,
    rank: 3,
    canFly: true,
    attackShape: 'line',
    aoeRadius: 5 * METERS_TO_WORLD_UNITS,
    regen: true,
    dragonDestroyStructure: true,
    ultimate: 'dragon-rage',
    reward: 8
  })
} as const satisfies Record<EnemyKind, EnemyTemplate>;

export const DEFAULT_ENEMY_TEMPLATE = ENEMY_TEMPLATES.twisted;
export interface EnemyResourceDrop {
  kind: DroppedResourceKind;
  amount: number;
}

const ENEMY_KIND_DROP_MULTIPLIERS = {
  twisted: 1,
  crawler: 1,
  madDog: 1,
  suicideBomber: 1,
  mutantBird: 1,
  darkMage: 1,
  ironMan: 1,
  resentfulDragon: 1,
  apostle: 0
} as const satisfies Record<EnemyKind, number>;

const getDropTierMultiplier = (tier: EnemyTier): number => {
  if (tier === 1.3) return 1.5;
  if (tier === 1.2) return 1.25;
  return 1;
};

export const getEnemyResourceDrop = (input: {
  kind: EnemyKind;
  enemyTier: EnemyTier;
  mapTier?: EnemyTier;
  rank: number;
  nightIndex: number;
}): EnemyResourceDrop | null => {
  const template = ENEMY_TEMPLATES[input.kind] ?? DEFAULT_ENEMY_TEMPLATE;
  const baseReward = template.reward * ENEMY_KIND_DROP_MULTIPLIERS[input.kind];
  if (baseReward <= 0) return null;
  const mapTier = input.mapTier ?? input.enemyTier;
  const rankMultiplier = 1 + Math.max(0, input.rank - 1) * 0.25;
  const nightMultiplier = 1 + Math.max(0, Math.floor(input.nightIndex) - 1) * 0.03;
  const amount = Math.max(1, Math.round(baseReward * getDropTierMultiplier(input.enemyTier) * getDropTierMultiplier(mapTier) * rankMultiplier * nightMultiplier));
  return { kind: 'daThach', amount };
};