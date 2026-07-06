export type EnemyKind =
  | 'twisted'
  | 'crawler'
  | 'madDog'
  | 'suicideBomber'
  | 'mutantBird'
  | 'darkMage'
  | 'ironMan'
  | 'resentfulDragon';

export interface EnemyTemplate {
  kind: EnemyKind;
  label: string;
  hp: number;
  speed: number;
  weight: number;
  attackRange: number;
  attackCooldown: number;
  damage: number;
  canFly: boolean;
  reward: number;
}

const METERS_TO_WORLD_UNITS = 100;

export const ENEMY_TEMPLATES = {
  twisted: {
    kind: 'twisted',
    label: 'Kẻ vặn vẹo',
    hp: 3,
    speed: 0.4 * METERS_TO_WORLD_UNITS,
    weight: 1,
    attackRange: 28,
    attackCooldown: 2.5,
    damage: 1,
    canFly: false,
    reward: 1
  },
  crawler: {
    kind: 'crawler',
    label: 'Người bò sát',
    hp: 3,
    speed: 1 * METERS_TO_WORLD_UNITS,
    weight: 0.9,
    attackRange: 20,
    attackCooldown: 2,
    damage: 1,
    canFly: false,
    reward: 1
  },
  madDog: {
    kind: 'madDog',
    label: 'Chó điên',
    hp: 1.5,
    speed: 1.3 * METERS_TO_WORLD_UNITS,
    weight: 0.3,
    attackRange: 18,
    attackCooldown: 4,
    damage: 1,
    canFly: false,
    reward: 1
  },
  suicideBomber: {
    kind: 'suicideBomber',
    label: 'Bạo Tạc Giả',
    hp: 1,
    speed: 0.45 * METERS_TO_WORLD_UNITS,
    weight: 1.5,
    attackRange: 5 * METERS_TO_WORLD_UNITS,
    attackCooldown: 1.6,
    damage: 4,
    canFly: false,
    reward: 2
  },
  mutantBird: {
    kind: 'mutantBird',
    label: 'Chim biến dị',
    hp: 1.3,
    speed: 1.5 * METERS_TO_WORLD_UNITS,
    weight: 0.1,
    attackRange: 12 * METERS_TO_WORLD_UNITS,
    attackCooldown: 0,
    damage: 2.5,
    canFly: true,
    reward: 1
  },
  darkMage: {
    kind: 'darkMage',
    label: 'Pháp sư hắc ám',
    hp: 3,
    speed: 0.5 * METERS_TO_WORLD_UNITS,
    weight: 1,
    attackRange: 200,
    attackCooldown: 2,
    damage: 3.5,
    canFly: false,
    reward: 2
  },
  ironMan: {
    kind: 'ironMan',
    label: 'Thiết Hán',
    hp: 5.5,
    speed: 0.3 * METERS_TO_WORLD_UNITS,
    weight: 2.8,
    attackRange: 26,
    attackCooldown: 1.5,
    damage: 2,
    canFly: false,
    reward: 3
  },
  resentfulDragon: {
    kind: 'resentfulDragon',
    label: 'Oán Long',
    hp: 15,
    speed: 2.5 * METERS_TO_WORLD_UNITS,
    weight: 4,
    attackRange: 5 * METERS_TO_WORLD_UNITS,
    attackCooldown: 5,
    damage: 8,
    canFly: true,
    reward: 8
  }
} as const satisfies Record<EnemyKind, EnemyTemplate>;

export const DEFAULT_ENEMY_TEMPLATE = ENEMY_TEMPLATES.twisted;
