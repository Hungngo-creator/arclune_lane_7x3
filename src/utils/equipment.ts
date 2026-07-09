import type { InstanceStats } from '../meta.ts';

export const TP_ALLOCATABLE_KEYS = ['HP', 'ATK', 'WIL', 'ARM', 'RES'] as const;
export type TpStatKey = (typeof TP_ALLOCATABLE_KEYS)[number];
export type TpAllocMap = Partial<Record<TpStatKey, number>>;

export type EquipmentSlotKey = 'head' | 'shirt' | 'weapon' | 'accessory' | 'pants' | 'ring1' | 'ring2' | 'ring3';

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlotKey;
  quantity?: number;
  tpAlloc?: Partial<Record<string, number>>;
  setName?: string | null;
  icon?: string | null;
  symbol?: string | null;
}

export type UnitEquipmentState = Partial<Record<EquipmentSlotKey, string | null>>;

export const EQUIPMENT_SLOT_SEQUENCE: ReadonlyArray<EquipmentSlotKey> = Object.freeze([
  'head',
  'shirt',
  'weapon',
  'accessory',
  'pants',
  'ring1',
  'ring2',
  'ring3',
]);

export const EQUIPMENT_SLOT_LABEL: Readonly<Record<EquipmentSlotKey, string>> = Object.freeze({
  head: 'Đầu',
  shirt: 'Áo',
  weapon: 'Vũ khí',
  accessory: 'Trang sức',
  pants: 'Quần',
  ring1: 'Nhẫn 1',
  ring2: 'Nhẫn 2',
  ring3: 'Nhẫn 3',
});

export const EQUIPMENT_SLOT_FILTER: Readonly<Record<EquipmentSlotKey, EquipmentSlotKey>> = Object.freeze({
  head: 'head',
  shirt: 'shirt',
  weapon: 'weapon',
  accessory: 'accessory',
  pants: 'pants',
  ring1: 'ring1',
  ring2: 'ring1',
  ring3: 'ring1',
});

export const EQUIPMENT_INVENTORY: ReadonlyArray<EquipmentItem> = Object.freeze([
 { id: 'ao-luyen-khi-su-vo-danh', name: 'Áo của luyện khí sư vô danh', slot: 'shirt', tpAlloc: { ARM: 1, RES: 1, HP: 2 }, setName: 'Luyện khí sư vô danh' },
  { id: 'quan-luyen-khi-su-vo-danh', name: 'Quần của luyện khí sư vô danh', slot: 'pants', tpAlloc: { AGI: 2, HP: 1 }, setName: 'Luyện khí sư vô danh' },
  { id: 'kiem-cu-luyen-khi-su-vo-danh', name: 'Kiếm cũ của luyện khí sư vô danh', slot: 'weapon', tpAlloc: { ATK: 2, WIL: 1 }, setName: 'Luyện khí sư vô danh', symbol: '⚔' },
  { id: 'mu-ke-hanh-khat', name: 'Mũ của kẻ hành khất', slot: 'head', tpAlloc: { HP: 1, HPregen: 1 }, symbol: '◉' },
  { id: 'nhan-ke-hanh-khat', name: 'Nhẫn của kẻ hành khất', slot: 'ring1', tpAlloc: { ATK: 1, WIL: 1 }, quantity: 2, symbol: '◌' },
]);

export const EQUIPMENT_ITEM_BY_ID: ReadonlyMap<string, EquipmentItem> = new Map(EQUIPMENT_INVENTORY.map((item) => [item.id, item]));

export const TP_STAT_GAIN_PER_POINT: Readonly<Record<TpStatKey, number>> = Object.freeze({
  HP: 20,
  ATK: 1,
  WIL: 1,
  ARM: 0.5,
  RES: 0.5,
});

export function normalizeUnitEquipmentState(value: unknown): UnitEquipmentState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  const normalized: UnitEquipmentState = {};
  for (const key of EQUIPMENT_SLOT_SEQUENCE){
    const raw = source[key];
    normalized[key] = typeof raw === 'string' && raw.trim() ? raw : null;
  }
  return normalized;
}

export function mergeTpAllocation(target: Record<string, number>, source: Partial<Record<string, number>> | null | undefined): void {
  if (!source) return;
  for (const [key, rawValue] of Object.entries(source)){
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value <= 0) continue;
    target[key] = (target[key] ?? 0) + value;
  }
}

export function resolveEquipmentTpAllocation(equipment: UnitEquipmentState): Record<string, number> {
  const allocation: Record<string, number> = {};
  let voDanhPieces = 0;
  for (const slot of EQUIPMENT_SLOT_SEQUENCE){
    const id = equipment[slot];
    if (!id) continue;
    const item = EQUIPMENT_ITEM_BY_ID.get(id);
    if (!item) continue;
    mergeTpAllocation(allocation, item.tpAlloc);
    if (item.setName === 'Luyện khí sư vô danh'){
      voDanhPieces += 1;
    }
  }
  if (voDanhPieces >= 3){
    mergeTpAllocation(allocation, { HP: 1, WIL: 1, ATK: 1 });
  } else if (voDanhPieces >= 2){
    mergeTpAllocation(allocation, { HP: 1 });
  }
  return allocation;
}

export function applyEquipmentTpAllocationToInstanceStats(
  stats: InstanceStats,
  equipment: UnitEquipmentState | null | undefined,
): InstanceStats {
  if (!equipment) return stats;
  const equipmentTpAlloc = resolveEquipmentTpAllocation(equipment);
  let out: InstanceStats | null = null;
  for (const [stat, points] of Object.entries(equipmentTpAlloc)){
    const gain = TP_STAT_GAIN_PER_POINT[stat as TpStatKey];
    if (typeof gain !== 'number' || !Number.isFinite(points) || points === 0) continue;
    if (!out) out = { ...stats };
    const bonus = gain * points;
    if (stat === 'HP'){
      out.hpMax = (out.hpMax ?? 0) + bonus;
      out.hp = (out.hp ?? 0) + bonus;
    } else if (stat === 'ATK'){
      out.atk = (out.atk ?? 0) + bonus;
    } else if (stat === 'WIL'){
      out.wil = (out.wil ?? 0) + bonus;
    } else if (stat === 'ARM'){
      out.arm = (out.arm ?? 0) + bonus;
    } else if (stat === 'RES'){
      out.res = (out.res ?? 0) + bonus;
    }
  }
  return out ?? stats;
}

