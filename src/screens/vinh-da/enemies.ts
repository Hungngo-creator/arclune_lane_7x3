import type { EnemyTemplateId } from './types.ts';

export interface EnemyTemplate {
  id: EnemyTemplateId;
  label: string;
  hp: number;
  speed: number;
  weight: number;
}

export const ENEMY_TEMPLATES = {
  twisted: {
    id: 'twisted',
    label: 'Kẻ vặn vẹo',
    hp: 3,
    speed: 46,
    weight: 1
  }
} as const satisfies Record<EnemyTemplateId, EnemyTemplate>;

export const DEFAULT_ENEMY_TEMPLATE = ENEMY_TEMPLATES.twisted;
