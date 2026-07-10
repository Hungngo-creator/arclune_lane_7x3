import type { EnemyKind, EnemyTier } from './enemies.ts';
import type { ElementalRegionKind } from './types.ts';
import type { TieredAmount, VinhDaResourceId } from './economy/resources.ts';

export type MapModuleId =
  | 'mineralMine'
  | 'rawCrystalOre'
  | 'spiritTree'
  | 'elementalZone'
  | 'teleportArray'
  | 'resentmentPit'
  | 'bloodLordAltar'
  | 'machineKingdomRuins'
  | 'foreignGravityField'
  | 'brokenFormationPattern'
  | 'corruptedSpiritWoodForest';

export type ModuleInteractionId = 'mine2h' | 'pray2h' | 'destroy' | 'activateTeleport';
export type ModuleSpawnPreference = 'anywhere' | 'nearDarkRegion' | 'nearTeleportOrRuins' | 'nearWoodDarkOverlap' | 'nearBase';

export interface ModuleSpawnRules {
  minTier?: EnemyTier | number;
  baseChance: number;
  tierIndexChanceBonus?: number;
  minCount?: number;
  maxCount?: number;
  preference?: ModuleSpawnPreference;
  notes?: string;
}

export interface ResourcePoolOutcome {
  weight: number;
  resources?: readonly TieredAmount[];
  spawnEnemies?: readonly EnemyKind[];
  daytimeLeashedEnemies?: boolean;
  notice?: string;
}

export interface ResourcePool {
  id: string;
  outcomes: readonly ResourcePoolOutcome[];
}

export interface ModuleInteraction {
  id: ModuleInteractionId;
  label: string;
  durationHours?: number;
  resourcePoolId?: string;
  completesMap?: boolean;
  spawnEnemies?: readonly EnemyKind[];
  notes?: string;
}

export interface MapModule {
  id: MapModuleId;
  label: string;
  tags: readonly string[];
  spawnRules: ModuleSpawnRules;
  interactions: readonly ModuleInteraction[];
  resourcePools: readonly ResourcePool[];
  dangerLevel: number;
}

export interface RuntimeMapModule extends MapModule {
  instanceId: string;
  x: number;
  depleted?: boolean;
  interactionLockedUntil?: number;
}

export interface MapModuleGenerationContext {
  mapTier: number;
  baseX: number;
  worldWidth: number;
  elementalRegions: readonly { kind: ElementalRegionKind; startX: number; endX: number }[];
  randomValue?: () => number;
}

const tiered = (resourceId: VinhDaResourceId, amount: number): TieredAmount => ({ resourceId, amount });
const untiered = (resourceId: VinhDaResourceId, amount: number): TieredAmount => ({ resourceId, amount });
export const getVinhDaTierIndex = (mapTier: number): number => Math.max(0, Math.round((mapTier - 1.1) * 10));
const chanceWithTier = (baseChance: number, tierBonus: number | undefined, tierIndex: number): number => Math.max(0, Math.min(1, baseChance + (tierBonus ?? 0) * tierIndex));

export const MAP_MODULES = Object.freeze({
  mineralMine: { id: 'mineralMine', label: 'Mỏ Khoáng Sản', tags: ['khoáng', 'hắc thiết', 'tài nguyên'], spawnRules: { baseChance: 1, minCount: 3, maxCount: 3 }, interactions: [{ id: 'mine2h', label: 'Khai thác 2 giờ', durationHours: 2, resourcePoolId: 'iron' }], resourcePools: [{ id: 'iron', outcomes: [{ weight: 35, resources: [tiered('blackIron', 6)] }, { weight: 25, resources: [tiered('blackIron', 10)] }, { weight: 20, resources: [tiered('blackIron', 14)] }, { weight: 15, resources: [tiered('blackIron', 20)] }, { weight: 5, resources: [tiered('blackIron', 28)] }] }], dangerLevel: 1 },
  rawCrystalOre: { id: 'rawCrystalOre', label: 'Quặng Nguyên Tinh', tags: ['nguyên tinh', 'tài nguyên'], spawnRules: { baseChance: 1, minCount: 1, maxCount: 4 }, interactions: [{ id: 'mine2h', label: 'Khai thác 2 giờ', durationHours: 2, resourcePoolId: 'crystal' }], resourcePools: [{ id: 'crystal', outcomes: [{ weight: 35, resources: [tiered('darkStone', 15)] }, { weight: 25, resources: [tiered('elementStone', 12)] }, { weight: 15, resources: [tiered('voidStone', 10)] }, { weight: 25, resources: [tiered('darkStone', 5)], spawnEnemies: ['listener'], daytimeLeashedEnemies: true }] }], dangerLevel: 1 },
  spiritTree: { id: 'spiritTree', label: 'Linh Thụ', tags: ['linh thụ', 'mộc', 'nguyên tố'], spawnRules: { minTier: 1.4, baseChance: 0.2, tierIndexChanceBonus: 0.1, maxCount: 1, notes: 'Ưu tiên Hỏa/Lôi/Phong dày đặc theo tier.' }, interactions: [{ id: 'mine2h', label: 'Thu hái 2 giờ', durationHours: 2, resourcePoolId: 'spirit' }], resourcePools: [{ id: 'spirit', outcomes: [{ weight: 60, resources: [tiered('spiritWood', 4)] }, { weight: 30, resources: [tiered('spiritHerb', 2)] }, { weight: 10, resources: [tiered('elementStone', 1)] }] }], dangerLevel: 1 },
  elementalZone: { id: 'elementalZone', label: 'Vùng Nguyên Tố', tags: ['nguyên tố', 'địa hình'], spawnRules: { baseChance: 1, minCount: 1, maxCount: 4, notes: 'Hắc Ám do elemental-regions.ts đảm bảo; vùng khác cap 4/5/6 theo tier.' }, interactions: [{ id: 'mine2h', label: 'Thu tinh nguyên 2 giờ', durationHours: 2, resourcePoolId: 'element' }], resourcePools: [{ id: 'element', outcomes: [{ weight: 70, resources: [tiered('elementStone', 1)] }, { weight: 20, resources: [tiered('elementStone', 2)] }, { weight: 10, resources: [tiered('heavyWater', 1)] }] }], dangerLevel: 1 },
  teleportArray: { id: 'teleportArray', label: 'Truyền Tống Trận', tags: ['truyền tống', 'không gian', 'thoát map'], spawnRules: { baseChance: 1, minCount: 1, maxCount: 1, preference: 'nearBase' }, interactions: [{ id: 'activateTeleport', label: 'Kích hoạt truyền tống', completesMap: true, notes: 'Đưa base vào trận: hoàn thành map và kết toán tài nguyên.' }], resourcePools: [], dangerLevel: 0 },
  resentmentPit: { id: 'resentmentPit', label: 'Oán Niệm Hố', tags: ['oán', 'hắc ám', 'nguy hiểm', 'tài nguyên'], spawnRules: { minTier: 1.3, baseChance: 0.2, tierIndexChanceBonus: 0.03, maxCount: 1, preference: 'nearDarkRegion' }, interactions: [{ id: 'mine2h', label: 'Khai thác 2 giờ', durationHours: 2, resourcePoolId: 'resentment' }], resourcePools: [{ id: 'resentment', outcomes: [{ weight: 50, resources: [tiered('resentmentStone', 2)] }, { weight: 25, resources: [tiered('resentmentStone', 3)] }, { weight: 10, resources: [tiered('voidStone', 1)] }, { weight: 15, spawnEnemies: ['suicideBomber'], daytimeLeashedEnemies: true }, { weight: 5, spawnEnemies: ['resentmentStatue'], daytimeLeashedEnemies: true }] }], dangerLevel: 4 },
  bloodLordAltar: { id: 'bloodLordAltar', label: 'Huyết Chủ Tế Đàn', tags: ['huyết chủ', 'tín ngưỡng', 'trung lập', 'nguy hiểm'], spawnRules: { baseChance: 0.15, maxCount: 1, notes: '+5% nếu có làng/cựu doanh trại; tránh quá gần base đêm đầu.' }, interactions: [{ id: 'pray2h', label: 'Cầu nguyện 2 giờ', durationHours: 2, resourcePoolId: 'pray' }, { id: 'destroy', label: 'Phá hủy tế đàn', resourcePoolId: 'destroy' }], resourcePools: [{ id: 'pray', outcomes: [{ weight: 60, resources: [tiered('wishStone', 1)] }, { weight: 20, resources: [tiered('bloodLordSigil', 1)] }, { weight: 20, spawnEnemies: ['bloodLordPriest'], daytimeLeashedEnemies: true }] }, { id: 'destroy', outcomes: [{ weight: 80, resources: [tiered('resentmentStone', 1)] }, { weight: 20, resources: [tiered('resentmentStone', 1), tiered('bloodLordSigil', 1)] }] }], dangerLevel: 3 },
  machineKingdomRuins: { id: 'machineKingdomRuins', label: 'Phế Tích Cơ Giới Quốc', tags: ['cơ giới', 'công nghệ', 'hiếm', 'kiến trúc'], spawnRules: { minTier: 1.4, baseChance: 0.1, tierIndexChanceBonus: 0.02, maxCount: 1 }, interactions: [{ id: 'mine2h', label: 'Trục vớt 2 giờ', durationHours: 2, resourcePoolId: 'machine' }], resourcePools: [{ id: 'machine', outcomes: [{ weight: 40, resources: [untiered('machinePart', 1)] }, { weight: 25, resources: [untiered('machinePart', 2)] }, { weight: 20, resources: [untiered('mindStone', 1)] }, { weight: 10, resources: [tiered('heavyWater', 1)] }, { weight: 5, spawnEnemies: ['ironMan'], daytimeLeashedEnemies: true }] }], dangerLevel: 3 },
  foreignGravityField: { id: 'foreignGravityField', label: 'Dị Vực Trọng Lực', tags: ['trọng lực', 'thủy', 'thổ', 'không gian', 'hiếm'], spawnRules: { baseChance: 0.08, tierIndexChanceBonus: 0.02, maxCount: 1 }, interactions: [{ id: 'mine2h', label: 'Ổn định 2 giờ', durationHours: 2, resourcePoolId: 'gravity' }], resourcePools: [{ id: 'gravity', outcomes: [{ weight: 15, resources: [tiered('heavyWater', 1)] }, { weight: 1, resources: [tiered('voidStone', 1)] }, { weight: 84, notice: 'Trường trọng lực dao động nhưng chưa kết tinh.' }] }], dangerLevel: 2 },
  brokenFormationPattern: { id: 'brokenFormationPattern', label: 'Trận Văn Đứt Gãy', tags: ['trận pháp', 'phong ấn', 'không gian'], spawnRules: { baseChance: 0.12, maxCount: 1, preference: 'nearTeleportOrRuins' }, interactions: [{ id: 'mine2h', label: 'Khảo sát 2 giờ', durationHours: 2, resourcePoolId: 'formation' }], resourcePools: [{ id: 'formation', outcomes: [{ weight: 50, resources: [untiered('sealDust', 1)] }, { weight: 20, resources: [untiered('sealDust', 2)] }, { weight: 10, resources: [tiered('voidStone', 1)] }, { weight: 20, notice: 'Bẫy dịch chuyển nhỏ được kích hoạt.' }] }], dangerLevel: 2 },
  corruptedSpiritWoodForest: { id: 'corruptedSpiritWoodForest', label: 'Rừng Linh Mộc Bị Ô Nhiễm', tags: ['mộc', 'hắc ám', 'linh mộc', 'nguy hiểm'], spawnRules: { baseChance: 0.2, maxCount: 1, preference: 'nearWoodDarkOverlap' }, interactions: [{ id: 'mine2h', label: 'Khai thác 2 giờ', durationHours: 2, resourcePoolId: 'wood' }], resourcePools: [{ id: 'wood', outcomes: [{ weight: 50, resources: [tiered('spiritWood', 4)] }, { weight: 25, resources: [tiered('spiritWood', 6)] }, { weight: 15, resources: [tiered('spiritHerb', 3)] }, { weight: 10, spawnEnemies: ['crawler', 'mutantBird'], daytimeLeashedEnemies: true }] }], dangerLevel: 3 }
} as const satisfies Record<MapModuleId, MapModule>);

const pickCount = (module: MapModule, randomValue: () => number): number => {
  if (module.id === 'rawCrystalOre') return 1 + (randomValue() < 0.5 ? 1 + (randomValue() < 0.25 ? 1 + (randomValue() < 0.05 ? 1 : 0) : 0) : 0);
  return module.spawnRules.minCount ?? (module.spawnRules.maxCount ?? 1);
};

const pickX = (module: MapModule, context: MapModuleGenerationContext, randomValue: () => number): number => {
  if (module.id === 'teleportArray') {
    const cap = 150 * (1 + getVinhDaTierIndex(context.mapTier) * 0.05);
    return Math.max(80, Math.min(context.worldWidth - 80, context.baseX + (randomValue() < 0.5 ? -1 : 1) * (80 + randomValue() * Math.max(20, cap - 80))));
  }
  const dark = context.elementalRegions.find(region => region.kind === 'dark');
  if (module.spawnRules.preference === 'nearDarkRegion' && dark) return dark.startX + randomValue() * (dark.endX - dark.startX);
  return 80 + randomValue() * Math.max(1, context.worldWidth - 160);
};

export const createMapModules = (context: MapModuleGenerationContext): RuntimeMapModule[] => {
  const randomValue = context.randomValue ?? Math.random;
  const tierIndex = getVinhDaTierIndex(context.mapTier);
  const modules: RuntimeMapModule[] = [];
  for (const module of Object.values(MAP_MODULES) as MapModule[]){
    if (module.spawnRules.minTier !== undefined && context.mapTier < module.spawnRules.minTier) continue;
    const chance = chanceWithTier(module.spawnRules.baseChance, module.spawnRules.tierIndexChanceBonus, tierIndex);
    if (chance < 1 && randomValue() >= chance) continue;
    const count = Math.min(module.spawnRules.maxCount ?? Number.POSITIVE_INFINITY, pickCount(module, randomValue));
    for (let index = 0; index < count; index += 1) modules.push({ ...module, instanceId: `${module.id}-${index + 1}`, x: pickX(module, context, randomValue) });
  }
  return modules.sort((a, b) => a.x - b.x);
};

export const pickModuleOutcome = (pool: ResourcePool, randomValue: () => number): ResourcePoolOutcome | null => {
  const total = pool.outcomes.reduce((sum, outcome) => sum + Math.max(0, outcome.weight), 0);
  if (total <= 0) return null;
  let roll = Math.max(0, Math.min(0.999999, randomValue())) * total;
  for (const outcome of pool.outcomes){
    roll -= Math.max(0, outcome.weight);
    if (roll < 0) return outcome;
  }
  return pool.outcomes[pool.outcomes.length - 1] ?? null;
};

