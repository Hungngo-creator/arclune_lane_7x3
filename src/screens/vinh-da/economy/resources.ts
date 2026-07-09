import type { EnemyTier } from '../enemies.ts';

export type VinhDaTier = EnemyTier;

export type VinhDaResourceId =
  | 'darkStone'
  | 'blackIron'
  | 'blackBone'
  | 'resentmentStone'
  | 'elementStone'
  | 'wishStone'
  | 'voidStone'
  | 'heavyWater'
  | 'mindStone'
  | 'machinePart'
  | 'sealDust'
  | 'nightCore'
  | 'fleshCrystal'
  | 'dragonScale'
  | 'spiritWood'
  | 'spiritHerb'
  | 'hazySoul'
  | 'bloodLordSigil';

export type TieredAmount = {
  resourceId: VinhDaResourceId;
  amount: number;
  tier?: VinhDaTier;
};

export const TIERED_VINH_DA_RESOURCES = Object.freeze([
  'darkStone',
  'blackIron',
  'elementStone',
  'heavyWater',
  'voidStone',
  'wishStone',
  'resentmentStone',
  'dragonScale',
  'spiritWood',
  'spiritHerb',
  'fleshCrystal',
  'nightCore',
  'bloodLordSigil'
] as const satisfies readonly VinhDaResourceId[]);

export const UNTIERED_VINH_DA_RESOURCES = Object.freeze([
  'blackBone',
  'mindStone',
  'machinePart',
  'hazySoul',
  'sealDust'
] as const satisfies readonly VinhDaResourceId[]);

export const VINH_DA_RESOURCE_LABELS = Object.freeze({
  darkStone: 'Dạ Thạch',
  blackIron: 'Hắc Thiết',
  blackBone: 'Hắc Cốt',
  resentmentStone: 'Oán Thạch',
  elementStone: 'Nguyên Tố Thạch',
  wishStone: 'Nguyện Thạch',
  voidStone: 'Hư Không Thạch',
  heavyWater: 'Huyền Minh Trọng Thủy',
  mindStone: 'Niệm Thạch',
  machinePart: 'Cơ Giới Linh Kiện',
  sealDust: 'Bụi Phong Ấn',
  nightCore: 'Tinh Hạch Vĩnh Dạ',
  fleshCrystal: 'Huyết Nhục Kết Tinh',
  dragonScale: 'Long Lân',
  spiritWood: 'Linh Mộc',
  spiritHerb: 'Linh Thảo',
  hazySoul: 'Tinh Phách Mờ',
  bloodLordSigil: 'Huyết Chủ Ấn Phiến'
} as const satisfies Record<VinhDaResourceId, string>);

export const isTieredVinhDaResource = (resourceId: VinhDaResourceId): boolean => (
  (TIERED_VINH_DA_RESOURCES as readonly VinhDaResourceId[]).includes(resourceId)
);

export const getResourceLabel = (resourceId: VinhDaResourceId): string => VINH_DA_RESOURCE_LABELS[resourceId];

