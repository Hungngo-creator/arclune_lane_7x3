export type EnemyKind =
  | 'twisted'
  | 'crawler'
  | 'madDog'
  | 'suicideBomber'
  | 'mutantBird'
  | 'darkMage'
  | 'ironMan'
  | 'resentfulDragon';6

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

export const ENEMY_TEMPLATES = {
  twisted: {
    kind: 'twisted',
    label: 'Kẻ vặn vẹo',
    hp: 3,
    speed: 46,
    weight: 1,
    attackRange: 28,
    attackCooldown: 1,
    damage: 1,
    canFly: false,
    reward: 1
  },
  crawler: {
    kind: 'crawler',
    label: 'Kẻ bò trườn',
    hp: 2,
    speed: 58,
    weight: 0.8,
    attackRange: 20,
    attackCooldown: 0.8,
    damage: 1,
    canFly: false,
    reward: 1
  },
  madDog: {
    kind: 'madDog',
    label: 'Chó điên',
    hp: 4,
    speed: 72,
    weight: 1,
    attackRange: 18,
    attackCooldown: 0.75,
    damage: 1,
    canFly: false,
    reward: 1
  },
  suicideBomber: {
    kind: 'suicideBomber',
    label: 'Kẻ tự bạo',
    hp: 2,
    speed: 52,
    weight: 1.2,
    attackRange: 28,
    attackCooldown: 1.6,
    damage: 4,
    canFly: false,
    reward: 2
  },
  mutantBird: {
    kind: 'mutantBird',
    label: 'Chim đột biến',
    hp: 2,
    speed: 84,
    weight: 0.6,
    attackRange: 22,
    attackCooldown: 0.9,
    damage: 1,
    canFly: true,
    reward: 1
  },
  darkMage: {
    kind: 'darkMage',
    label: 'Pháp sư hắc ám',
    hp: 5,
    speed: 38,
    weight: 0.9,
    attackRange: 140,
    attackCooldown: 2.2,
    damage: 2,
    canFly: false,
    reward: 2
  },
  ironMan: {
    kind: 'ironMan',
    label: 'Người sắt',
    hp: 12,
    speed: 28,
    weight: 3,
    attackRange: 26,
    attackCooldown: 1.4,
    damage: 2,
    canFly: false,
    reward: 3
  },
  resentfulDragon: {
    kind: 'resentfulDragon',
    label: 'Rồng oán hận',
    hp: 28,
    speed: 34,
    weight: 5,
    attackRange: 180,
    attackCooldown: 2.8,
    damage: 5,
    canFly: true,
    reward: 8
  }
} as const satisfies Record<EnemyTemplateId, EnemyKind>;

export const DEFAULT_ENEMY_TEMPLATE = ENEMY_TEMPLATES.twisted;
