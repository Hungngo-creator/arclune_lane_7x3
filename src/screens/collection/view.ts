//home (termux)/arclune_lane_7x3/src/screens/collection/view.ts

import { getUnitArt } from '../../art.ts';
import { normalizeUnitId } from '../../utils/unit-id.ts';
import { getSkillSet } from '../../data/skills.ts';
import { createNumberFormatter } from '../../utils/format.ts';
import { upgradeCultivation, getCultivationCost, applyCultivationBonusToCatalogStats, type CultivationPlayerState } from '../../cultivation.ts';
import { getCultivationRealmEconomy } from '../../data/economy.ts';
import {
  createNormalizedWallet,
  getSharedCurrencyWallet,
  subscribeSharedCurrencyWallet,
  syncSharedCurrencyWallet,
} from '../../utils/currency.ts';
import { assertElement, ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { normalizeRarity } from '../../utils/rarity.ts';
import { ROSTER_PREVIEWS } from '../../data/roster-preview.ts';
import { TP_DELTA } from '../../data/roster-preview.ts';
import { CLASS_GROWTH } from '../../catalog.ts';

import {
  ABILITY_TYPE_LABELS,
  buildRosterWithCost,
  cloneRoster,
  collectAbilityFacts,
  describeUlt,
  formatTagLabel,
  labelForAbility,
  resolveCurrencyBalance,
  getCurrencyCatalog,
  ensureNumberFormatter,
} from './helpers.ts';
import { createFilterState, updateActiveTab, updateSelectedUnit } from './state.ts';
import { loadPlayerProfile, patchPlayerProfile } from '../../utils/player-profile.ts';
import type { AbilityFact } from './helpers.ts';
import type {
  CollectionEntry,
  CollectionTabKey,
  CollectionViewHandle,
  CollectionViewOptions,
  CurrencyCatalog,
  FilterState,
  UnknownRecord,
} from './types.ts';
import type { CurrencyDefinition } from '@shared-types/config';
import type { Rarity } from '../../utils/rarity.ts';

const STYLE_ID = 'collection-view-style-v2';

const TAB_DEFINITIONS = [
  { key: 'skills', label: 'Kĩ Năng & Thức Tỉnh', hint: 'Mở lớp phủ mô tả kỹ năng, chuỗi nâng cấp và yêu cầu nguyên liệu.', icon: 'assets/collection/skill&essence.webp' },
  { key: 'arts', label: 'Công Pháp & Trang Bị', hint: 'Liệt kê công pháp, pháp khí và trang bị đang trang bị cho nhân vật.', icon: 'assets/collection/gear&art.webp' },
  { key: 'skins', label: 'Skin', hint: 'Quản lý skin đã mở khóa và áp dụng bảng phối màu yêu thích.', icon: 'assets/collection/skin.webp' },
  { key: 'voice', label: 'Giọng Nói', hint: 'Nghe thử voice line, thiết lập voice pack và gợi ý mở khóa.', icon: 'assets/collection/voice.webp' }
] satisfies ReadonlyArray<{ key: CollectionTabKey; label: string; hint: string; icon: string }>;

const TAB_HINT_BY_KEY: Readonly<Record<CollectionTabKey, string>> = TAB_DEFINITIONS.reduce((acc, tab) => {
  acc[tab.key] = tab.hint;
  return acc;
}, {} as Record<CollectionTabKey, string>);

function resolveRosterCellGap(baseGapPx: number, reductionRatio: number): string {
  const normalizedBase = Number.isFinite(baseGapPx) ? Math.max(0, baseGapPx) : 0;
  const normalizedRatio = Number.isFinite(reductionRatio) ? Math.min(Math.max(reductionRatio, 0), 1) : 0;
  const reducedGap = normalizedBase * (1 - normalizedRatio);
  return `${Math.max(0, reducedGap).toFixed(2)}px`;
}

function clearChildren(node: HTMLElement): void {
  node.replaceChildren();
}

const currencyCatalog: CurrencyCatalog = getCurrencyCatalog();
const currencyFormatter = ensureNumberFormatter(createNumberFormatter, 'vi-VN');
const CORE_STAT_KEYS = ['HP', 'WIL', 'ATK', 'RES', 'ARM'] as const;

const TP_ALLOCATABLE_KEYS = ['HP', 'ATK', 'WIL', 'ARM', 'RES'] as const;
type TpStatKey = (typeof TP_ALLOCATABLE_KEYS)[number];
type TpAllocMap = Partial<Record<TpStatKey, number>>;

type EquipmentSlotKey = 'head' | 'shirt' | 'weapon' | 'accessory' | 'pants' | 'ring1' | 'ring2' | 'ring3';

interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlotKey;
  quantity?: number;
  tpAlloc?: Partial<Record<string, number>>;
  setName?: string | null;
  icon?: string | null;
  symbol?: string | null;
}

type UnitEquipmentState = Partial<Record<EquipmentSlotKey, string | null>>;

const EQUIPMENT_SLOT_SEQUENCE: ReadonlyArray<EquipmentSlotKey> = Object.freeze([
  'head',
  'shirt',
  'weapon',
  'accessory',
  'pants',
  'ring1',
  'ring2',
  'ring3',
]);

const EQUIPMENT_SLOT_LABEL: Readonly<Record<EquipmentSlotKey, string>> = Object.freeze({
  head: 'Đầu',
  shirt: 'Áo',
  weapon: 'Vũ khí',
  accessory: 'Trang sức',
  pants: 'Quần',
  ring1: 'Nhẫn 1',
  ring2: 'Nhẫn 2',
  ring3: 'Nhẫn 3',
});

const EQUIPMENT_SLOT_FILTER: Readonly<Record<EquipmentSlotKey, EquipmentSlotKey>> = Object.freeze({
  head: 'head',
  shirt: 'shirt',
  weapon: 'weapon',
  accessory: 'accessory',
  pants: 'pants',
  ring1: 'ring1',
  ring2: 'ring1',
  ring3: 'ring1',
});

const EQUIPMENT_INVENTORY: ReadonlyArray<EquipmentItem> = Object.freeze([
 { id: 'ao-luyen-khi-su-vo-danh', name: 'Áo của luyện khí sư vô danh', slot: 'shirt', tpAlloc: { ARM: 1, RES: 1, HP: 2 }, setName: 'Luyện khí sư vô danh' },
  { id: 'quan-luyen-khi-su-vo-danh', name: 'Quần của luyện khí sư vô danh', slot: 'pants', tpAlloc: { AGI: 2, HP: 1 }, setName: 'Luyện khí sư vô danh' },
  { id: 'kiem-cu-luyen-khi-su-vo-danh', name: 'Kiếm cũ của luyện khí sư vô danh', slot: 'weapon', tpAlloc: { ATK: 2, WIL: 1 }, setName: 'Luyện khí sư vô danh', symbol: '⚔' },
  { id: 'mu-ke-hanh-khat', name: 'Mũ của kẻ hành khất', slot: 'head', tpAlloc: { HP: 1, HPregen: 1 }, symbol: '◉' },
  { id: 'nhan-ke-hanh-khat', name: 'Nhẫn của kẻ hành khất', slot: 'ring1', tpAlloc: { ATK: 1, WIL: 1 }, quantity: 2, symbol: '◌' },
]);

const EQUIPMENT_ITEM_BY_ID: ReadonlyMap<string, EquipmentItem> = new Map(EQUIPMENT_INVENTORY.map((item) => [item.id, item]));


function normalizeUnitEquipmentState(value: unknown): UnitEquipmentState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  const normalized: UnitEquipmentState = {};
  for (const key of EQUIPMENT_SLOT_SEQUENCE){
    const raw = source[key];
    normalized[key] = typeof raw === 'string' && raw.trim() ? raw : null;
  }
  return normalized;
}

function resolveClassGrowthByUnit(unit: CollectionEntry | null): Record<string, number> {
  const className = typeof unit?.class === 'string' ? unit.class : '';
  const growth = (CLASS_GROWTH as Record<string, Record<string, number> | undefined>)[className];
  return growth ?? Object.fromEntries(Object.keys(TP_DELTA).map((key) => [key, 1]));
}


function isItemCompatibleWithSlot(item: EquipmentItem, slotKey: EquipmentSlotKey): boolean {
  return item.slot === EQUIPMENT_SLOT_FILTER[slotKey];
}

  function sumTpAllocation(allocation: Partial<Record<string, number>> | null | undefined): number {
  if (!allocation) return 0;
  let total = 0;
  for (const rawValue of Object.values(allocation)){
    const numeric = Number(rawValue);
    if (!Number.isFinite(numeric) || numeric <= 0) continue;
    total += numeric;
  }
  return total;
}

  function mergeTpAllocation(target: Record<string, number>, source: Partial<Record<string, number>> | null | undefined): void {
  if (!source) return;
  for (const [key, rawValue] of Object.entries(source)){
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value <= 0) continue;
    target[key] = (target[key] ?? 0) + value;
  }
}


function resolveEquippedItemUsage(equipment: UnitEquipmentState): Map<string, number> {
  const usage = new Map<string, number>();
  for (const slot of EQUIPMENT_SLOT_SEQUENCE){
    const id = equipment[slot];
    if (!id) continue;
    usage.set(id, (usage.get(id) ?? 0) + 1);
  }
  return usage;
}

function resolveAvailableQuantityForItem(params: {
  equipment: UnitEquipmentState;
  itemId: string;
  slotKey?: EquipmentSlotKey;
}): number {
  const item = EQUIPMENT_ITEM_BY_ID.get(params.itemId);
  if (!item) return 0;
  const baseQuantity = Math.max(1, Math.floor(Number(item.quantity ?? 1)));
  const usage = resolveEquippedItemUsage(params.equipment);
  let used = usage.get(params.itemId) ?? 0;
  if (params.slotKey && params.equipment[params.slotKey] === params.itemId){
    used = Math.max(0, used - 1);
  }
  return Math.max(0, baseQuantity - used);
}

  function resolveEquipmentTpAllocation(equipment: UnitEquipmentState): Record<string, number> {
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

const TP_STAT_GAIN_PER_POINT: Readonly<Record<TpStatKey, number>> = Object.freeze({
  HP: 20,
  ATK: 1,
  WIL: 1,
  ARM: 0.5,
  RES: 0.5,
});

const K_TP_COMBAT_POWER = 10;

const TP_EQUIVALENT_GAIN_BY_STAT: Readonly<Record<string, number>> = Object.freeze({
  HP: TP_STAT_GAIN_PER_POINT.HP,
  HPmax: TP_STAT_GAIN_PER_POINT.HP,
  ATK: TP_STAT_GAIN_PER_POINT.ATK,
  WIL: TP_STAT_GAIN_PER_POINT.WIL,
  ARM: TP_STAT_GAIN_PER_POINT.ARM,
  RES: TP_STAT_GAIN_PER_POINT.RES,
  AGI: 1,
  PER: 1,
  AEmax: 10,
  AEregen: 0.5,
  HPregen: 2,
  SPD: 0.01,
});

const TP_EQUIVALENT_STAT_KEYS = new Set<string>(Object.keys(TP_EQUIVALENT_GAIN_BY_STAT));

function toTpEquivalentFromStat(statKey: string, value: number): number {
  const gain = TP_EQUIVALENT_GAIN_BY_STAT[statKey];
  if (gain == null || !Number.isFinite(gain) || gain <= 0) return 0;
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value / gain;
}

function readCombatPowerTpBonus(raw: unknown): number {
  if (!raw || typeof raw !== 'object') return 0;
  const queue: unknown[] = [raw];
  let total = 0;
  let hops = 0;
  while (queue.length > 0 && hops < 256) {
    hops += 1;
    const current = queue.shift();
    if (!current || typeof current !== 'object') continue;

    if (Array.isArray(current)) {
      for (const item of current) queue.push(item);
      continue;
    }

    const record = current as Record<string, unknown>;
    for (const [rawKey, rawValue] of Object.entries(record)) {
      const key = rawKey.trim();
      const keyLower = key.toLowerCase();

      if (keyLower === 'combatpowertpbonus' || keyLower === 'powertpbonus' || keyLower === 'tpequivalent') {
        const numeric = typeof rawValue === 'number' ? rawValue : Number(rawValue);
        if (Number.isFinite(numeric) && numeric > 0) total += numeric;
        continue;
      }

      if (typeof rawValue === 'number' && Number.isFinite(rawValue) && rawValue > 0 && TP_EQUIVALENT_STAT_KEYS.has(key)) {
        total += toTpEquivalentFromStat(key, rawValue);
        continue;
      }

      if (rawValue && typeof rawValue === 'object') {
        queue.push(rawValue);
      }
    }
  }
  return Math.max(0, total);
}

const TP_GAIN_RULES: ReadonlyArray<{
  fromRealm: number;
  fromSubRealm: number;
  toRealm: number;
  toSubRealm: number;
  gain: number;
}> = Object.freeze([
  { fromRealm: 1, fromSubRealm: 0, toRealm: 1, toSubRealm: 1, gain: 5 },
  { fromRealm: 1, fromSubRealm: 1, toRealm: 1, toSubRealm: 2, gain: 5 },
  { fromRealm: 1, fromSubRealm: 2, toRealm: 1, toSubRealm: 3, gain: 5 },
  { fromRealm: 1, fromSubRealm: 3, toRealm: 1, toSubRealm: 4, gain: 5 },
  { fromRealm: 1, fromSubRealm: 4, toRealm: 1, toSubRealm: 5, gain: 5 },
  { fromRealm: 1, fromSubRealm: 5, toRealm: 1, toSubRealm: 6, gain: 5 },
  { fromRealm: 1, fromSubRealm: 6, toRealm: 1, toSubRealm: 7, gain: 5 },
  { fromRealm: 1, fromSubRealm: 7, toRealm: 1, toSubRealm: 8, gain: 5 },
  { fromRealm: 1, fromSubRealm: 8, toRealm: 1, toSubRealm: 9, gain: 5 },
  { fromRealm: 1, fromSubRealm: 9, toRealm: 2, toSubRealm: 1, gain: 30 },
  { fromRealm: 2, fromSubRealm: 1, toRealm: 2, toSubRealm: 2, gain: 10 },
  { fromRealm: 2, fromSubRealm: 2, toRealm: 2, toSubRealm: 3, gain: 10 },
  { fromRealm: 2, fromSubRealm: 3, toRealm: 2, toSubRealm: 4, gain: 10 },
  { fromRealm: 2, fromSubRealm: 4, toRealm: 2, toSubRealm: 5, gain: 10 },
  { fromRealm: 2, fromSubRealm: 5, toRealm: 2, toSubRealm: 6, gain: 10 },
  { fromRealm: 2, fromSubRealm: 6, toRealm: 2, toSubRealm: 7, gain: 10 },
  { fromRealm: 2, fromSubRealm: 7, toRealm: 2, toSubRealm: 8, gain: 10 },
  { fromRealm: 2, fromSubRealm: 8, toRealm: 2, toSubRealm: 9, gain: 10 },
  { fromRealm: 2, fromSubRealm: 9, toRealm: 3, toSubRealm: 1, gain: 70 },
  { fromRealm: 3, fromSubRealm: 1, toRealm: 3, toSubRealm: 2, gain: 40 },
  { fromRealm: 3, fromSubRealm: 2, toRealm: 3, toSubRealm: 3, gain: 40 },
  { fromRealm: 3, fromSubRealm: 3, toRealm: 3, toSubRealm: 4, gain: 50 },
  { fromRealm: 3, fromSubRealm: 4, toRealm: 3, toSubRealm: 5, gain: 50 },
  { fromRealm: 3, fromSubRealm: 5, toRealm: 3, toSubRealm: 6, gain: 50 },
  { fromRealm: 3, fromSubRealm: 6, toRealm: 3, toSubRealm: 7, gain: 60 },
  { fromRealm: 3, fromSubRealm: 7, toRealm: 3, toSubRealm: 8, gain: 60 },
  { fromRealm: 3, fromSubRealm: 8, toRealm: 3, toSubRealm: 9, gain: 60 },
  { fromRealm: 3, fromSubRealm: 9, toRealm: 4, toSubRealm: 1, gain: 150 },
  { fromRealm: 4, fromSubRealm: 1, toRealm: 4, toSubRealm: 2, gain: 160 },
  { fromRealm: 4, fromSubRealm: 2, toRealm: 4, toSubRealm: 3, gain: 160 },
  { fromRealm: 4, fromSubRealm: 3, toRealm: 4, toSubRealm: 4, gain: 170 },
  { fromRealm: 4, fromSubRealm: 4, toRealm: 4, toSubRealm: 5, gain: 170 },
  { fromRealm: 4, fromSubRealm: 5, toRealm: 4, toSubRealm: 6, gain: 170 },
  { fromRealm: 4, fromSubRealm: 6, toRealm: 4, toSubRealm: 7, gain: 180 },
  { fromRealm: 4, fromSubRealm: 7, toRealm: 4, toSubRealm: 8, gain: 180 },
  { fromRealm: 4, fromSubRealm: 8, toRealm: 4, toSubRealm: 9, gain: 180 },
  { fromRealm: 4, fromSubRealm: 9, toRealm: 5, toSubRealm: 1, gain: 300 },
  { fromRealm: 5, fromSubRealm: 1, toRealm: 5, toSubRealm: 2, gain: 350 },
  { fromRealm: 5, fromSubRealm: 2, toRealm: 5, toSubRealm: 3, gain: 400 },
  { fromRealm: 5, fromSubRealm: 3, toRealm: 5, toSubRealm: 4, gain: 400 },
  { fromRealm: 5, fromSubRealm: 4, toRealm: 5, toSubRealm: 5, gain: 450 },
  { fromRealm: 5, fromSubRealm: 5, toRealm: 5, toSubRealm: 6, gain: 450 },
  { fromRealm: 5, fromSubRealm: 6, toRealm: 5, toSubRealm: 7, gain: 500 },
  { fromRealm: 5, fromSubRealm: 7, toRealm: 6, toSubRealm: 1, gain: 825 },
  { fromRealm: 6, fromSubRealm: 1, toRealm: 6, toSubRealm: 2, gain: 925 },
  { fromRealm: 6, fromSubRealm: 2, toRealm: 6, toSubRealm: 3, gain: 1025 },
 ]); 

const TP_GAIN_RULE_LOOKUP: Readonly<Record<string, number>> = Object.freeze(
  Object.fromEntries(
    TP_GAIN_RULES.map((rule) => [
      `${rule.fromRealm}:${rule.fromSubRealm}->${rule.toRealm}:${rule.toSubRealm}`,
      rule.gain,
    ])
  )
);

const TP_FALLBACK_PER_SUBREALM_BY_REALM: Readonly<Record<number, number>> = Object.freeze({
  1: 5,
  2: 10,
  3: 50,
  4: 170,
  5: 450,
  6: 925,
  7: 1200,
  8: 1500,
  9: 1800,
});

const TP_FALLBACK_BREAKTHROUGH_BY_REALM: Readonly<Record<number, number>> = Object.freeze({
  1: 30,
  2: 70,
  3: 150,
  4: 300,
  5: 825,
  6: 1200,
  7: 1500,
  8: 1800,
});

function resolveRealmMaxSubRealm(realm: number): number {
  const realmEconomy = getCultivationRealmEconomy(realm);
  return realmEconomy?.subRealmCosts.length ?? 0;
}

function resolveNextCultivationStep(realm: number, subRealm: number): { realm: number; subRealm: number } | null {
  const currentMaxSubRealm = resolveRealmMaxSubRealm(realm);
  if (currentMaxSubRealm <= 0) return null;

  if (subRealm < currentMaxSubRealm){
    return { realm, subRealm: subRealm + 1 };
  }
  if (resolveRealmMaxSubRealm(realm + 1) <= 0){
    return null;
  }
  return { realm: realm + 1, subRealm: 1 };
}

function resolveFallbackTpGain(params: {
  fromRealm: number;
  fromSubRealm: number;
  toRealm: number;
  toSubRealm: number;
}): number {
  if (params.toRealm === params.fromRealm){
    return TP_FALLBACK_PER_SUBREALM_BY_REALM[params.toRealm] ?? 0;
  }
  return TP_FALLBACK_BREAKTHROUGH_BY_REALM[params.fromRealm] ?? 0;
}

function resolveTpGainForUpgrade(params: {
  fromRealm: number;
  fromSubRealm: number;
  toRealm: number;
  toSubRealm: number;
}): number {
  const key = `${params.fromRealm}:${params.fromSubRealm}->${params.toRealm}:${params.toSubRealm}`;
  const explicit = TP_GAIN_RULE_LOOKUP[key];
  if (typeof explicit === 'number') return explicit;
  return resolveFallbackTpGain(params);
}

function resolveTotalEarnedTp(realm: number, subRealm: number): number {
  const normalizedRealm = Number.isFinite(realm) ? Math.max(1, Math.floor(realm)) : 1;
  const normalizedSubRealm = Number.isFinite(subRealm) ? Math.max(0, Math.floor(subRealm)) : 0;

  let cursorRealm = 1;
  let cursorSubRealm = 0;
  let total = 0;

  while (cursorRealm < normalizedRealm || (cursorRealm === normalizedRealm && cursorSubRealm < normalizedSubRealm)){
    const next = resolveNextCultivationStep(cursorRealm, cursorSubRealm);
    if (!next) break;
    total += resolveTpGainForUpgrade({
      fromRealm: cursorRealm,
      fromSubRealm: cursorSubRealm,
      toRealm: next.realm,
      toSubRealm: next.subRealm,
    });
    cursorRealm = next.realm;
    cursorSubRealm = next.subRealm;
  }

  return Math.max(0, Math.floor(total));
}

function normalizeTpAllocMap(value: unknown): TpAllocMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  const result: TpAllocMap = {};
  for (const key of TP_ALLOCATABLE_KEYS){
    const raw = input[key];
    const no = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isFinite(no) || no <= 0) continue;
    result[key] = Math.floor(no);
  }
  return result;
}

function resolveTpBonusForStat(statKey: string, allocation: TpAllocMap): number {
  const key = statKey as TpStatKey;
  if (!TP_ALLOCATABLE_KEYS.includes(key)) return 0;
  const points = Number(allocation[key] ?? 0);
  if (!Number.isFinite(points) || points <= 0) return 0;
  return points * TP_STAT_GAIN_PER_POINT[key];
}

function toFiniteStatValue(value: unknown): number | null {
  if (typeof value !== 'number') return null;
  return Number.isFinite(value) ? value : null;
}

function resolveStatGainFromTpPoints(statKey: string, tpPoints: number): number {
  const gain = TP_EQUIVALENT_GAIN_BY_STAT[statKey];
  if (gain == null || !Number.isFinite(gain) || gain <= 0) return tpPoints;
  return tpPoints * gain;
}

export type CollectionStatPreview = {
  stats: Array<{ key: string; value: number }>;
  tpAlloc: TpAllocMap;
  equipmentTpAlloc: Record<string, number>;
};

export function resolveUnitStatPreview(params: {
  unitId: string | null;
  cultivation?: { realm?: number | null; subRealm?: number | null } | null;
  tpAllocation?: TpAllocMap;
  equipment?: UnitEquipmentState;
}): CollectionStatPreview {
  const { unitId } = params;
  const tpAlloc = normalizeTpAllocMap(params.tpAllocation ?? {});
  const equipmentTpAlloc = resolveEquipmentTpAllocation(params.equipment ?? {});
  if (!unitId) return { stats: [], tpAlloc, equipmentTpAlloc };

  const preview = ROSTER_PREVIEWS[unitId];
  const finalStats = preview?.final as Record<string, unknown> | undefined;
  if (!finalStats) return { stats: [], tpAlloc, equipmentTpAlloc };

  const cultivatedStats = applyCultivationBonusToCatalogStats({
    unitId,
    stats: finalStats,
    realm: params.cultivation?.realm ?? 1,
    subRealm: params.cultivation?.subRealm ?? 0,
  });
  const rows: Array<{ key: string; value: number }> = [];
  const hp = toFiniteStatValue(cultivatedStats.HP ?? finalStats.HPmax ?? finalStats.HP ?? null);
  if (hp != null){
    rows.push({
      key: 'HP',
      value: hp + resolveTpBonusForStat('HP', tpAlloc) + resolveStatGainFromTpPoints('HP', Number(equipmentTpAlloc.HP ?? 0)),
    });
  }

  for (const [key, rawValue] of Object.entries(finalStats)){
    if (key === 'HP' || key === 'HPmax') continue;
    const baseValue = toFiniteStatValue(rawValue);
    if (baseValue == null) continue;
    const cultivatedValue = toFiniteStatValue(cultivatedStats[key]);
    rows.push({
      key,
      value: (cultivatedValue ?? baseValue) + resolveTpBonusForStat(key, tpAlloc) + resolveStatGainFromTpPoints(key, Number(equipmentTpAlloc[key] ?? 0)),
    });
  }

  return { stats: rows, tpAlloc, equipmentTpAlloc };
}

export function resolveCollectionCombatPower(preview: CollectionStatPreview, totalTp: number, catalogTpEquivalent = 0): number {
  const normalizedTotalTp = Number.isFinite(totalTp) && totalTp > 0 ? Math.floor(totalTp) : 0;
  const tpScore = normalizedTotalTp * K_TP_COMBAT_POWER;
  const statTpEquivalent = preview.stats.reduce((sum, stat) => sum + toTpEquivalentFromStat(stat.key, stat.value), 0);
  const normalizedCatalogBonus = Number.isFinite(catalogTpEquivalent) && catalogTpEquivalent > 0 ? catalogTpEquivalent : 0;
  return Math.max(0, Math.round(tpScore + statTpEquivalent + normalizedCatalogBonus));
}

function toSafeText(value: string | number | null | undefined): string{
  if (value == null){
    return '';
  }
  if (typeof value === 'number'){
    return Number.isFinite(value) ? String(value) : '';
  }
  return value;
}

function parseJsonArrayFromDataset(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0);
  } catch {
    return [];
  }
}

function parseFactListFromDataset(value: string | undefined): AbilityFact[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    const normalizedFacts: AbilityFact[] = [];
    for (const entry of parsed){
      if (!entry || typeof entry !== 'object') continue;
      const fact = entry as Partial<AbilityFact>;
      const normalizedValue = toSafeText(fact.value ?? '');
      if (!normalizedValue) continue;
      normalizedFacts.push({
        icon: toSafeText(fact.icon ?? '') || null,
        label: toSafeText(fact.label ?? '') || null,
        value: normalizedValue,
        tooltip: toSafeText(fact.tooltip ?? '') || null,
      });
    }
    return normalizedFacts;
  } catch {
    return [];
  }
}

function ensureStyles(){
  const rosterCellGap = resolveRosterCellGap(78, 0.25);
  const css = `
    .app--collection{padding:32px 16px 64px;}
    .collection-view{--collection-tab-icon-size:36px;--collection-hub-left-shift:calc(var(--collection-tab-icon-size) * 3);max-width:1280px;margin:0 auto;display:flex;flex-direction:column;gap:28px;color:inherit;}
    .collection-view__header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;}
    .collection-view__title-group{display:flex;align-items:center;gap:12px;}
    .collection-view__back{padding:10px 18px;border-radius:999px;border:1px solid rgba(125,211,252,.32);background:rgba(16,26,36,.78);color:#aee4ff;letter-spacing:.08em;text-transform:uppercase;font-size:12px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;}
    .collection-view__back:hover{transform:translateY(-2px);border-color:rgba(174,228,255,.52);box-shadow:0 12px 26px rgba(6,12,20,.45);}
    .collection-view__back:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
    .collection-view__title{margin:0;font-size:36px;letter-spacing:.08em;text-transform:uppercase;}
    .collection-view__wallet{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:flex-end;}
    .collection-wallet__item{min-width:130px;padding:10px 14px;border-radius:14px;border:1px solid rgba(125,211,252,.22);background:rgba(12,20,28,.82);display:flex;flex-direction:column;gap:4px;}
    .collection-wallet__name{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;margin:0;}
    .collection-wallet__balance{font-size:16px;margin:0;color:#e6f2ff;}
    .collection-view__layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(0,3.3fr) max-content;gap:24px;align-items:stretch;position:relative;}
    .collection-roster{border-radius:0;border:none;background:none;padding:0;display:flex;flex-direction:column;gap:12px;overflow:visible;z-index:3;margin-right:calc(-10vw);}
    .collection-roster__list{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(3,max-content);column-gap:${rosterCellGap};row-gap:${rosterCellGap};justify-content:start;max-height:560px;overflow:auto;padding-right:4px;}
    .collection-roster__list > li{width:max-content;height:max-content;}
    .collection-roster__entry{display:inline-flex;align-items:center;justify-content:center;gap:0;padding:0;border-radius:0;border:none;background:none;color:inherit;cursor:pointer;transition:transform .18s ease,filter .18s ease;width:auto;}
    .collection-roster__entry:hover{transform:translateY(-2px);filter:brightness(1.08);}
    .collection-roster__entry:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
    .collection-roster__entry.is-selected{filter:brightness(1.15) saturate(1.05);}
    .collection-roster__entry[data-rank="S"]{--entry-bg:rgba(38,20,52,.78);--entry-bg-hover:rgba(48,26,68,.92);--entry-bg-selected:rgba(54,30,74,.96);--entry-border:rgba(255,180,255,.4);--entry-border-hover:rgba(255,204,255,.58);--entry-border-selected:rgba(255,228,255,.72);--entry-shadow:0 0 0 1px rgba(255,192,255,.2);--entry-shadow-hover:0 10px 26px rgba(150,66,188,.45);--entry-shadow-selected:0 18px 44px rgba(150,66,188,.6);}
    .collection-roster__entry[data-rank="A"]{--entry-bg:rgba(30,40,58,.78);--entry-bg-hover:rgba(38,50,72,.92);--entry-bg-selected:rgba(44,58,84,.96);--entry-border:rgba(124,187,255,.35);--entry-border-hover:rgba(158,208,255,.52);--entry-border-selected:rgba(188,226,255,.7);--entry-shadow:0 0 0 1px rgba(140,200,255,.2);--entry-shadow-hover:0 10px 26px rgba(64,116,188,.42);--entry-shadow-selected:0 18px 44px rgba(64,116,188,.55);}
    .collection-roster__entry[data-rank="B"]{--entry-bg:rgba(28,46,40,.78);--entry-bg-hover:rgba(34,58,50,.9);--entry-bg-selected:rgba(40,68,58,.95);--entry-border:rgba(120,224,185,.35);--entry-border-hover:rgba(146,236,204,.52);--entry-border-selected:rgba(176,246,220,.68);--entry-shadow:0 0 0 1px rgba(126,236,199,.18);--entry-shadow-hover:0 10px 24px rgba(42,126,110,.4);--entry-shadow-selected:0 18px 38px rgba(42,126,110,.52);}
    .collection-roster__entry[data-rank="C"]{--entry-bg:rgba(46,46,28,.78);--entry-bg-hover:rgba(58,58,34,.9);--entry-bg-selected:rgba(68,68,40,.95);--entry-border:rgba(232,212,124,.32);--entry-border-hover:rgba(244,226,150,.48);--entry-border-selected:rgba(252,238,176,.64);--entry-shadow:0 0 0 1px rgba(240,224,150,.16);--entry-shadow-hover:0 10px 24px rgba(162,138,52,.38);--entry-shadow-selected:0 18px 36px rgba(162,138,52,.48);}
    .collection-roster__entry[data-rank="D"]{--entry-bg:rgba(48,34,24,.78);--entry-bg-hover:rgba(60,42,30,.9);--entry-bg-selected:rgba(70,48,36,.95);--entry-border:rgba(255,170,108,.3);--entry-border-hover:rgba(255,188,138,.46);--entry-border-selected:rgba(255,208,170,.6);--entry-shadow:0 0 0 1px rgba(255,182,132,.14);--entry-shadow-hover:0 10px 22px rgba(168,88,42,.36);--entry-shadow-selected:0 18px 32px rgba(168,88,42,.45);}
    .collection-roster__entry[data-rank="unknown"],
    .collection-roster__entry:not([data-rank]){--entry-shadow:none;}
    .collection-roster__avatar{--collection-avatar-size:108px;--collection-gear-slot-size:calc(var(--collection-avatar-size) * .8);width:var(--collection-avatar-size);height:var(--collection-avatar-size);background:none;overflow:visible;position:relative;display:flex;align-items:center;justify-content:center;}
    .collection-roster__portrait{width:var(--collection-avatar-size);height:var(--collection-avatar-size);position:relative;z-index:2;display:flex;align-items:center;justify-content:center;overflow:hidden;}
    .collection-roster__portrait img{width:var(--collection-avatar-size);height:var(--collection-avatar-size);object-fit:contain;filter:drop-shadow(0 10px 18px rgba(0,0,0,.55));position:relative;z-index:1;}
    .collection-roster__portrait span{position:relative;z-index:1;color:#aee4ff;font-weight:600;letter-spacing:.08em;}
    .collection-stage{position:relative;border-radius:0;border:none;background:none;padding:28px;display:flex;flex-direction:column;gap:18px;overflow:visible;min-height:462px;width:110%;transform:translateX(10%);transform-origin:center;z-index:5;}
    .collection-stage>*{position:relative;z-index:2;}
    .collection-stage__art{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;z-index:1;pointer-events:none;}
    .collection-stage__sprite{width:100%;max-width:none;height:100%;object-fit:contain;opacity:.42;filter:drop-shadow(0 28px 56px rgba(0,0,0,.55));transition:transform .3s ease,filter .3s ease,opacity .3s ease;}
    .collection-stage__tuvi{position:absolute;left:50%;bottom:84px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:3;pointer-events:none;gap:8px;padding:8px 12px;border-radius:14px;background:rgba(6,14,24,.56);backdrop-filter:blur(2px);}
    .collection-stage__tuvi-realm{margin:0;color:#d6f1ff;font-size:20px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;text-align:center;}
    .collection-stage__tuvi-subrealm{display:none;}
    .collection-stage__tuvi-cost{margin:0;color:#9fc8ea;font-size:12px;letter-spacing:.05em;text-transform:uppercase;text-align:center;}
    .collection-stage__tuvi-actions{display:flex;position:absolute;left:50%;bottom:28px;transform:translateX(-50%);z-index:3;gap:10px;}
    .collection-stage__tuvi-btn{width:44px;height:44px;border-radius:50%;border:1px solid rgba(110,231,183,.6);background:linear-gradient(160deg,rgba(16,185,129,.35),rgba(5,46,22,.88));color:#dcfce7;font-size:24px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .18s ease,filter .18s ease;}
    .collection-stage__tuvi-btn:hover{transform:translateY(-2px);filter:brightness(1.08);}
    .collection-stage__tuvi-btn:focus-visible{outline:2px solid rgba(110,231,183,.82);outline-offset:2px;}
    .collection-stage__tuvi-btn:disabled{cursor:not-allowed;background:linear-gradient(160deg,rgba(40,40,40,.6),rgba(12,12,12,.95));border-color:rgba(115,115,115,.65);color:#737373;filter:none;}
    .collection-stage__info{display:none;}
    .collection-stage__identity{display:flex;flex-direction:column;gap:6px;}
    .collection-stage__name{margin:0;font-size:26px;letter-spacing:.06em;}
    .collection-stage__tags{display:flex;gap:10px;flex-wrap:wrap;}
    .collection-stage__tag{padding:6px 12px;border-radius:999px;border:1px solid rgba(125,211,252,.28);background:rgba(12,22,32,.78);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#aee4ff;}
    .collection-stage__status{display:none;}
    .collection-stage__mini-stats{position:absolute;left:12px;bottom:18px;z-index:4;min-width:170px;max-width:220px;border:1px solid rgba(125,211,252,.34);border-radius:14px;background:rgba(6,16,26,.32);backdrop-filter:blur(3px);padding:28px 10px 10px;display:flex;flex-direction:column;gap:6px;}
    .collection-stage__mini-stats-toggle{position:absolute;top:6px;left:6px;width:20px;height:20px;border-radius:50%;border:1px solid rgba(174,228,255,.45);background:rgba(11,24,34,.7);color:#d4edff;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;}
    .collection-stage__mini-stats-toggle:focus-visible{outline:2px solid rgba(174,228,255,.8);outline-offset:2px;}
    .collection-stage__mini-stats-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;}
    .collection-stage__mini-stats-item{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9fc8ea;}
    .collection-stage__mini-stats-item b{font-size:12px;color:#e6f2ff;letter-spacing:.04em;text-transform:none;}
    .collection-stage__mini-stats-stat{display:flex;align-items:center;gap:6px;}
    .collection-stage__mini-stats-plus{width:16px;height:16px;border-radius:999px;border:1px solid rgba(110,231,183,.52);background:rgba(10,42,28,.78);color:#c6ffe6;font-size:12px;line-height:1;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;}
    .collection-stage__mini-stats-plus:disabled{cursor:not-allowed;opacity:.45;}
    .collection-stage__tp-modal{position:fixed;inset:0;background:rgba(0,0,0,.58);display:none;align-items:center;justify-content:center;z-index:80;padding:16px;}
    .collection-stage__tp-modal.is-open{display:flex;}
    .collection-stage__tp-panel{width:min(320px,92vw);border:1px solid rgba(125,211,252,.4);border-radius:14px;background:rgba(7,17,28,.95);padding:14px;display:flex;flex-direction:column;gap:10px;}
    .collection-stage__tp-range{width:100%;}
    .collection-stage__tp-actions{display:flex;justify-content:flex-end;gap:8px;}
    .collection-stage__tp-btn{border:1px solid rgba(174,228,255,.35);background:rgba(16,26,36,.88);color:#d8eeff;border-radius:10px;padding:6px 10px;cursor:pointer;}
    .collection-stage__mini-stats-item.is-detail{display:none;}
    .collection-stage__mini-stats.is-detail-open .collection-stage__mini-stats-item.is-detail{display:flex;}
    .collection-stage__mini-stats-hint{margin:2px 0 0;font-size:10px;color:#7da0c7;line-height:1.4;}
    .collection-stage__mini-stats.is-detail-open .collection-stage__mini-stats-hint{display:none;}
    .collection-tabs{position:relative;border-radius:0;border:none;background:none;padding:0;display:flex;flex-direction:column;align-items:flex-end;justify-self:end;gap:10px;z-index:8;min-width:36px;}
    .collection-tabs__button{width:var(--collection-tab-icon-size);height:var(--collection-tab-icon-size);padding:0;border-radius:50%;border:1px solid rgba(125,211,252,.2);background:rgba(8,16,24,.82);color:inherit;cursor:pointer;display:flex;justify-content:center;align-items:center;transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease;}
    .collection-tabs__button:hover{transform:translateY(-2px);border-color:rgba(125,211,252,.42);background:rgba(16,26,36,.92);}
    .collection-tabs__button:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
    .collection-tabs__button.is-active{border-color:rgba(125,211,252,.55);background:rgba(18,30,42,.96);box-shadow:0 10px 24px rgba(6,12,20,.42);}
    .collection-tabs__icon{width:78%;height:78%;display:block;object-fit:contain;filter:drop-shadow(0 1px 3px rgba(0,0,0,.45));pointer-events:none;}
    .collection-skill-overlay{position:absolute;top:15%;left:4%;width:61.5%;min-height:0;padding:18px 20px 14px;border-radius:22px;border:1px solid rgba(125,211,252,.45);background:rgba(8,16,26,.92);box-shadow:0 42px 96px rgba(3,6,12,.75);display:flex;flex-direction:column;gap:14px;opacity:0;pointer-events:none;transition:opacity .24s ease,transform .24s ease;transform:translateY(12px);backdrop-filter:blur(6px);max-height:72vh;overflow:hidden;z-index:12;}
    .collection-skill-overlay.is-open{opacity:1;pointer-events:auto;transform:translateY(0);}
    .collection-skill-overlay__header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;}
    .collection-skill-overlay__title{margin:0;font-size:22px;letter-spacing:.06em;}
    .collection-skill-overlay__close{padding:8px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.28);background:rgba(16,24,34,.85);color:#aee4ff;font-size:12px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease;}
    .collection-skill-overlay__close:hover{transform:translateY(-2px);border-color:rgba(174,228,255,.48);}
    .collection-skill-overlay__close:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
    .collection-skill-overlay__content{display:grid;grid-template-columns:1fr;gap:14px;flex:1;overflow:auto;padding-right:4px;}
    .collection-skill-overlay__content.has-detail{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);}
    .collection-skill-overlay__details{display:flex;flex-direction:column;gap:12px;}
    .collection-skill-overlay__subtitle{margin:0;color:#9cbcd9;font-size:14px;line-height:1.6;}
    .collection-skill-overlay__abilities{display:flex;flex-direction:column;gap:10px;overflow:visible;max-height:none;padding-right:2px;width:75%;min-width:0;}
    .collection-skill-card{border-radius:16px;border:1px solid rgba(125,211,252,.24);background:rgba(12,22,32,.88);padding:10px 12px;display:flex;flex-direction:row;align-items:center;gap:10px;min-height:42px;}
    .collection-skill-card__header{display:flex;align-items:center;gap:8px;flex:1;min-width:0;}
    .collection-skill-card__title{margin:0;font-size:15px;letter-spacing:.04em;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .collection-skill-card__actions{display:flex;align-items:center;gap:6px;margin-left:auto;flex-shrink:0;}
    .collection-skill-card__badge{padding:3px 8px;border-radius:12px;border:1px solid rgba(125,211,252,.28);background:rgba(8,18,28,.82);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .collection-skill-card__upgrade{padding:5px 10px;border-radius:12px;border:1px solid rgba(174,228,255,.32);background:rgba(16,26,36,.88);color:#aee4ff;font-size:11px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease;}
    .collection-skill-card__upgrade:hover{transform:translateY(-1px);border-color:rgba(174,228,255,.52);box-shadow:0 8px 18px rgba(6,12,20,.38);}
    .collection-skill-card__upgrade:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
    .collection-skill-card__meta{display:none !important;}
    .collection-skill-card__description{display:none !important;}
    .collection-skill-card__notes{display:none !important;}
    .collection-skill-card.is-expanded{border-color:rgba(174,228,255,.6);box-shadow:0 22px 48px rgba(10,20,32,.52);background:rgba(16,28,40,.92);}
    .collection-skill-detail{border-radius:18px;border:1px solid rgba(125,211,252,.28);background:rgba(10,20,30,.86);padding:20px;display:flex;flex-direction:column;gap:14px;color:#e6f2ff;opacity:0;transform:translateY(10px);transition:opacity .2s ease,transform .2s ease;pointer-events:none;min-height:0;}
    .collection-skill-detail.is-active{opacity:1;transform:translateY(0);pointer-events:auto;}
    .collection-skill-detail__header{display:flex;flex-direction:column;gap:6px;}
    .collection-skill-detail__title{margin:0;font-size:20px;letter-spacing:.05em;}
    .collection-skill-detail__badge{align-self:flex-start;padding:4px 10px;border-radius:12px;border:1px solid rgba(174,228,255,.32);background:rgba(16,28,40,.82);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#aee4ff;}
    .collection-skill-detail__description{margin:0;color:#d7e7fb;font-size:14px;line-height:1.7;white-space:pre-line;}
    .collection-skill-detail__facts{display:flex;flex-direction:column;gap:8px;}
    .collection-skill-detail__fact{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:#cde1f5;background:rgba(12,24,36,.72);padding:10px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.2);}
    .collection-skill-detail__fact-icon{font-size:15px;line-height:1;}
    .collection-skill-detail__fact-label{font-weight:600;letter-spacing:.04em;}
    .collection-skill-detail__fact-value{font-size:13px;color:#e6f2ff;line-height:1.5;}
    .collection-skill-detail__notes{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#a9c7e6;}
    .collection-skill-detail__notes li{position:relative;padding-left:16px;}
    .collection-skill-detail__notes li::before{content:'•';position:absolute;left:0;color:#7da0c7;}
    .collection-skill-detail__empty{margin:0;color:#7da0c7;font-size:13px;line-height:1.6;}
    .collection-skill-card__empty{margin:0;color:#9cbcd9;font-size:13px;line-height:1.6;background:rgba(12,22,32,.88);border:1px dashed rgba(125,211,252,.28);border-radius:14px;padding:16px;text-align:center;}
    .collection-skill-overlay__notes{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#9cbcd9;}
    .collection-skill-overlay__notes li{position:relative;padding-left:16px;}
    .collection-skill-overlay__notes li::before{content:'•';position:absolute;left:0;color:#7da0c7;}
    .collection-arts-hubs{position:absolute;top:15%;left:50%;width:min(1120px,calc(100% - 20px));min-height:70%;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(240px,.9fr) minmax(0,1fr);gap:12px;opacity:0;pointer-events:none;transition:opacity .24s ease,transform .24s ease;transform:translate(calc(-50% - var(--collection-hub-left-shift)),12px);z-index:6;max-height:80vh;}
    .collection-arts-hubs.is-open{opacity:1;pointer-events:auto;transform:translate(calc(-50% - var(--collection-hub-left-shift)),0);}
    .collection-arts-hub{position:relative;border:1px solid rgba(125,211,252,.42);background:rgba(8,16,26,.92);box-shadow:0 30px 70px rgba(3,6,12,.62);backdrop-filter:blur(6px);padding:14px;display:flex;flex-direction:column;gap:12px;overflow:hidden;min-height:0;}
    .collection-arts-hub__icon{position:absolute;top:10px;left:10px;width:28px;height:28px;object-fit:contain;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));pointer-events:none;}
    .collection-arts-hub--gear{border:none;background:rgba(7,15,24,.78);box-shadow:0 20px 48px rgba(3,6,12,.55);display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:10px;padding:48px 12px 12px 12px;}
    .collection-arts-hub--gear .collection-arts-hub__icon{left:8px;top:8px;}
    .collection-arts-hub__filters{display:flex;flex-direction:column;gap:8px;align-items:flex-start;}
    .collection-arts-hub__filter{border:1px solid rgba(125,211,252,.32);background:rgba(11,24,35,.84);color:#d6eeff;font-size:10px;letter-spacing:.08em;text-transform:uppercase;writing-mode:vertical-rl;text-orientation:mixed;padding:8px 6px;border-radius:10px;cursor:pointer;min-height:52px;line-height:1.1;}
    .collection-arts-hub__filter.is-active{background:rgba(22,42,61,.96);border-color:rgba(174,228,255,.7);color:#f2fbff;}
    .collection-arts-hub__grid-wrap{min-height:0;overflow-y:auto;padding-right:4px;}
    .collection-arts-hub__grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;align-content:start;}
    .collection-arts-hub__slot{width:100%;aspect-ratio:1 / 1;box-sizing:border-box;border:1px solid rgba(174,228,255,.58);background:rgba(10,20,30,.4);display:flex;align-items:center;justify-content:center;color:#86a8c4;font-size:14px;box-shadow:inset 0 0 0 1px rgba(12,28,40,.55);cursor:pointer;position:relative;}
    .collection-arts-hub__slot.is-selected{border-color:rgba(233,247,255,.95);box-shadow:0 0 0 1px rgba(174,228,255,.48),inset 0 0 0 1px rgba(12,28,40,.55);}
    .collection-arts-hub__slot-qty{position:absolute;top:2px;left:3px;font-size:10px;font-weight:700;line-height:1;color:#f2fbff;text-shadow:0 1px 2px rgba(0,0,0,.7);}
    .collection-arts-hub__slot-label{position:absolute;left:3px;right:3px;bottom:2px;font-size:8px;line-height:1.2;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#9fc8ea;}
    .collection-arts-hub--paperdoll{border:none;background:rgba(7,15,24,.38);box-shadow:none;padding:48px 8px 12px;}
    .collection-equip-panel{display:flex;justify-content:center;align-items:flex-start;min-height:0;height:100%;}
    .collection-equip-layout{width:min(260px,100%);height:100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(5,minmax(48px,1fr));gap:8px;}
    .collection-equip-slot{position:relative;border:1px solid rgba(174,228,255,.48);background:rgba(8,18,28,.55);color:#d8efff;display:flex;align-items:center;justify-content:center;font-size:19px;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease;}
    .collection-equip-slot::before{content:'';position:absolute;inset:2px;border:2px solid rgba(174,228,255,.32);pointer-events:none;}
    .collection-equip-slot:hover{transform:translateY(-1px);border-color:rgba(204,239,255,.88);box-shadow:0 10px 26px rgba(3,9,16,.45);}
    .collection-equip-slot:focus-visible{outline:2px solid rgba(174,228,255,.92);outline-offset:2px;}
    .collection-equip-slot.is-pending{border-color:rgba(255,232,166,.92);box-shadow:0 0 0 1px rgba(255,232,166,.5);}
    .collection-equip-slot[data-slot='head']{grid-column:2;grid-row:1;}
    .collection-equip-slot[data-slot='shirt']{grid-column:2;grid-row:2;}
    .collection-equip-slot[data-slot='weapon']{grid-column:1;grid-row:3;}
    .collection-equip-slot[data-slot='accessory']{grid-column:3;grid-row:3;}
    .collection-equip-slot[data-slot='pants']{grid-column:2;grid-row:4;}
    .collection-equip-slot[data-slot='ring1']{grid-column:1;grid-row:5;}
    .collection-equip-slot[data-slot='ring2']{grid-column:2;grid-row:5;}
    .collection-equip-slot[data-slot='ring3']{grid-column:3;grid-row:5;}
    .collection-equip-slot__plus{font-size:20px;font-weight:700;line-height:1;color:#8db5d8;}
    .collection-equip-slot__symbol{font-size:20px;line-height:1;}
    .collection-equip-slot__name{position:absolute;bottom:4px;left:4px;right:4px;font-size:9px;letter-spacing:.04em;line-height:1.2;text-align:center;color:#aacde9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .collection-equip-slot__aura{position:absolute;width:46px;height:46px;border-radius:50%;border:1px solid rgba(170,215,255,.5);box-shadow:0 0 16px rgba(126,208,255,.35);}
    .collection-equip-popup{position:absolute;top:54px;left:50%;transform:translateX(-50%);width:min(320px,90%);border:1px solid rgba(174,228,255,.44);background:rgba(8,16,24,.96);padding:12px;z-index:9;display:none;flex-direction:column;gap:10px;box-shadow:0 16px 44px rgba(2,8,14,.62);}
    .collection-equip-popup.is-open{display:flex;}
    .collection-equip-popup__title{margin:0;font-size:13px;color:#d6eeff;letter-spacing:.06em;text-transform:uppercase;}
    .collection-equip-popup__desc{margin:0;font-size:12px;color:#99bedc;}
    .collection-equip-popup__list{display:flex;flex-direction:column;gap:6px;max-height:190px;overflow:auto;}
    .collection-equip-popup__item{border:1px solid rgba(125,211,252,.38);background:rgba(11,24,35,.84);color:#d6eeff;font-size:12px;padding:7px 9px;text-align:left;cursor:pointer;}
    .collection-equip-popup__actions{display:flex;gap:8px;justify-content:flex-end;}
    .collection-equip-popup__btn{border:1px solid rgba(125,211,252,.42);background:rgba(14,28,40,.9);color:#d6eeff;font-size:11px;padding:6px 10px;cursor:pointer;}
    .collection-arts-hub--art{padding:48px 12px 12px;justify-content:flex-start;}
    .collection-arts-hub__art-placeholder{margin:0;color:#9fc8ea;font-size:12px;letter-spacing:.04em;line-height:1.5;}
    @media(max-width:1200px){
      .collection-view__layout{grid-template-columns:minmax(0,1.6fr) minmax(0,3.3fr) max-content;}
    }
    @media(max-width:1080px){
    .collection-view{--collection-hub-left-shift:0px;}
      .collection-view__layout{grid-template-columns:1fr;}
      .collection-roster{margin-right:0;}
      .collection-roster__list{grid-template-columns:repeat(3,max-content);}
      .collection-skill-overlay{position:fixed;top:50%;left:50%;transform:translate(-50%,calc(-50% + 12px));width:88vw;min-height:0;max-height:85vh;}
      .collection-skill-overlay.is-open{transform:translate(-50%,-50%);}
      .collection-skill-overlay__content{grid-template-columns:1fr;}
      .collection-skill-overlay__content.has-detail{grid-template-columns:1fr;}
    }
    @media(max-width:820px){
      .collection-roster__list{grid-template-columns:repeat(3,max-content);}
    }
    @media(max-width:720px){
    .collection-view{--collection-hub-left-shift:0px;}
      .collection-view__title{font-size:30px;}
      .collection-roster__entry{padding:0;gap:0;}
      ..collection-roster__avatar{--collection-avatar-size:96px;}
      .collection-skill-overlay__abilities{gap:10px;width:100%;}
      .collection-skill-card{padding:8px 12px;gap:8px;flex-wrap:wrap;align-items:flex-start;}
      .collection-skill-card__header{flex-wrap:wrap;gap:8px;}
      .collection-skill-card__title{font-size:14px;white-space:normal;}
      .collection-skill-card__actions{width:100%;justify-content:flex-start;gap:8px;}
      .collection-skill-card__badge{font-size:11px;}
      .collection-skill-card__upgrade{font-size:11px;padding:6px 12px;}
      .collection-arts-hubs{top:8%;left:50%;width:min(96vw,680px);grid-template-columns:1fr;gap:10px;}
      .collection-arts-hub__grid{grid-template-columns:repeat(5,minmax(48px,var(--collection-gear-slot-size)));}
      .collection-arts-hub__filter{writing-mode:horizontal-tb;text-orientation:mixed;min-height:auto;padding:6px 8px;}
      .collection-arts-hub--gear{grid-template-columns:1fr;row-gap:10px;padding:46px 10px 10px;}
      .collection-arts-hub__filters{flex-direction:row;flex-wrap:wrap;}
    }
  `;

  ensureStyleTag(STYLE_ID, { css });
}

type AbilityEntry = Record<string, unknown> & {
  name?: string;
  description?: string;
  notes?: unknown;
  id?: string | number;
  abilityId?: string | number;
  type?: string;
};

type SkillDetailEventDetail = UnknownRecord;

interface AbilityDetailRecord extends SkillDetailEventDetail {
  ability?: AbilityEntry | null;
  abilityId?: string | number | null;
  typeLabel?: string | null;
  facts?: AbilityFact[];
  notes?: string[];
}

declare global {
  interface HTMLElementEventMap {
    'collection:toggle-skill-detail': CustomEvent<SkillDetailEventDetail>;
  }
}

interface AbilityCardOptions {
  typeLabel?: string | null;
  unitId?: string | null;
  abilityKey?: string | null;
  facts?: ReadonlyArray<AbilityFact>;
  notes?: ReadonlyArray<string>;
}

function renderAbilityCard(entry: AbilityEntry | null | undefined, options: AbilityCardOptions = {}): HTMLElement{
  const {
    typeLabel = null,
    unitId = null,
    abilityKey = null,
    facts: precomputedFacts = [],
    notes: precomputedNotes = [],
  } = options;
  const card = document.createElement('article');
  card.className = 'collection-skill-card';

  const header = document.createElement('header');
  header.className = 'collection-skill-card__header';

  const title = document.createElement('h4');
  title.className = 'collection-skill-card__title';
  title.textContent = toSafeText(entry?.name ?? 'Kĩ năng');
  header.appendChild(title);
  
  const actions = document.createElement('div');
  actions.className = 'collection-skill-card__actions';
  
  const resolvedTypeLabel = typeLabel || labelForAbility(entry);

  const badge = document.createElement('span');
  badge.className = 'collection-skill-card__badge';
  badge.textContent = toSafeText(resolvedTypeLabel);
  actions.appendChild(badge);

  const abilityId = entry?.id ?? entry?.abilityId ?? null;
  const upgradeButton = document.createElement('button');
  upgradeButton.type = 'button';
  upgradeButton.className = 'collection-skill-card__upgrade';
  upgradeButton.textContent = 'Nâng cấp';
  if (abilityId != null){
    upgradeButton.dataset.abilityId = String(abilityId);
  }
  if (abilityKey){
    upgradeButton.dataset.abilityKey = abilityKey;
  }
  actions.appendChild(upgradeButton);

  header.appendChild(actions);

  card.appendChild(header);

  const descriptionText = entry?.description && String(entry.description).trim() !== ''
    ? String(entry.description)
    : 'Chưa có mô tả chi tiết.';
  card.dataset.description = descriptionText;

  if (resolvedTypeLabel){
    card.dataset.typeLabel = resolvedTypeLabel;
  }
  if (unitId){
    card.dataset.unitId = String(unitId);
  }
  if (abilityId != null){
    card.dataset.abilityId = String(abilityId);
  }
  if (abilityKey){
    card.dataset.abilityKey = abilityKey;
  }

  const filteredNotes = precomputedNotes.length
    ? [...precomputedNotes]
    : (Array.isArray(entry?.notes)
    ? entry.notes
      .map(note => (typeof note === 'string' ? note.trim() : ''))
      .filter(note => note.length > 0)
    : []);
  if (filteredNotes.length){
    card.dataset.notes = JSON.stringify(filteredNotes);
  }

  const facts: AbilityFact[] = precomputedFacts.length ? [...precomputedFacts] : collectAbilityFacts(entry);
  if (facts.length){
    card.dataset.meta = JSON.stringify(facts);
  }

  return card;
}

export function renderCollectionView(options: CollectionViewOptions): CollectionViewHandle{
  const {
    root,
    shell = null,
    playerState = {} as UnknownRecord,
    roster = null,
    currencies = null,
  } = options;
  const host = assertElement<HTMLElement>(root, {
    guard: (node): node is HTMLElement => node instanceof HTMLElement,
    message: 'renderCollectionView cần một phần tử root hợp lệ.',
  });

  ensureStyles();

  const cleanups: Array<() => void> = [];
  const addCleanup = (fn: (() => void) | null | undefined) => {
    if (typeof fn === 'function') cleanups.push(fn);
  };

  const savedProfile = loadPlayerProfile();
  const savedCollectionUi = savedProfile.collectionUi ?? {};
  const initialTabCandidate = typeof savedCollectionUi.activeTab === 'string' ? savedCollectionUi.activeTab : null;
  const initialActiveTab: CollectionTabKey | null = initialTabCandidate && TAB_DEFINITIONS.some((tab) => tab.key === initialTabCandidate)
    ? initialTabCandidate as CollectionTabKey
    : null;
  const filterState: FilterState = createFilterState({ activeTab: initialActiveTab });
  const savedCultivationByUnit: Record<string, { realm: number; subRealm: number }> = {
    ...(savedProfile.cultivationByUnit ?? {}),
  };
  const savedTpByUnit: Record<string, number> = { ...(savedProfile.tpByUnit ?? {}) };
  const savedTpAllocByUnit: Record<string, TpAllocMap> = Object.fromEntries(
    Object.entries(savedProfile.tpAllocByUnit ?? {}).map(([unitId, alloc]) => [unitId, normalizeTpAllocMap(alloc)]),
  );
  const savedEquipmentByUnit: Record<string, UnitEquipmentState> = Object.fromEntries(
    Object.entries(savedProfile.equipmentByUnit ?? {}).map(([unitId, equipment]) => [unitId, normalizeUnitEquipmentState(equipment)]),
  );
  let shouldAutoOpenArtsHubs = false;
  let activeUnitId: string | null = null;
  const mutablePlayerState: CultivationPlayerState = {
    ...(playerState as CultivationPlayerState),
    currencies: { ...((playerState as CultivationPlayerState)?.currencies ?? {}) },
  };
  let hasPositiveCurrencyOverride = false;
  for (const currency of currencyCatalog){
    const resolved = resolveCurrencyBalance(currency.id, currencies, playerState);
    if (Number.isFinite(resolved) && resolved > 0){
      hasPositiveCurrencyOverride = true;
      mutablePlayerState.currencies![currency.id] = resolved;
    }
  }
  mutablePlayerState.currencies = createNormalizedWallet(
    hasPositiveCurrencyOverride ? mutablePlayerState.currencies : null,
    getSharedCurrencyWallet(),
  );
  syncSharedCurrencyWallet(mutablePlayerState.currencies, { merge: true });

  const container = document.createElement('div');
  container.className = 'collection-view';
  const mount = mountSection({
    root: host,
    section: container,
    rootClasses: 'app--collection',
  });

  const header = document.createElement('header');
  header.className = 'collection-view__header';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'collection-view__title-group';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'collection-view__back';
  backButton.textContent = '← Trở về menu chính';
  const handleBack = () => {
    if (shell && typeof shell.enterScreen === 'function'){
      shell.enterScreen('main-menu');
    }
  };
  backButton.addEventListener('click', handleBack);
  addCleanup(() => backButton.removeEventListener('click', handleBack));

  const title = document.createElement('h1');
  title.className = 'collection-view__title';
  title.textContent = 'Bộ Sưu Tập';

  titleGroup.appendChild(backButton);
  titleGroup.appendChild(title);

  const wallet = document.createElement('div');
  wallet.className = 'collection-view__wallet';
  const walletBalances = new Map<string, HTMLElement>();

  for (const currency of currencyCatalog){
    const item = document.createElement('article');
    item.className = 'collection-wallet__item';

    const name = document.createElement('h2');
    name.className = 'collection-wallet__name';
    name.textContent = currency.shortName || currency.name || currency.id;
    item.appendChild(name);

    const balance = document.createElement('p');
    balance.className = 'collection-wallet__balance';
    const value = resolveCurrencyBalance(currency.id, currencies, mutablePlayerState);
    const displayValue = Number.isFinite(value)
      ? value
      : Number(mutablePlayerState.currencies?.[currency.id] ?? 0);
    balance.textContent = `${currencyFormatter.format(displayValue)} ${currency.suffix || currency.id}`;
    item.appendChild(balance);
    walletBalances.set(currency.id, balance);

    wallet.appendChild(item);
  }

  header.appendChild(titleGroup);
  header.appendChild(wallet);

  container.appendChild(header);

  const layout = document.createElement('div');
  layout.className = 'collection-view__layout';

  const rosterPanel = document.createElement('section');
  rosterPanel.className = 'collection-roster';

  const rosterList = document.createElement('ul');
  rosterList.className = 'collection-roster__list';

  const rosterSource = buildRosterWithCost(cloneRoster(roster));
  const skillSetCache = new Map<string, ReturnType<typeof getSkillSet>>();
  const abilityDetailCache = new Map<string, AbilityDetailRecord>();
  const abilityRenderCache = new Map<string, HTMLElement[]>();
  const abilityDetailByUnitCache = new Map<string, Map<string, AbilityDetailRecord>>();
  const rosterEntries = new Map<string, {
    button: HTMLButtonElement;
    avatar: HTMLElement;
    meta: CollectionEntry;
    rarity: Rarity | null;
  }>();

  for (const unit of rosterSource){
    const unitId = normalizeUnitId(unit.id);
    const item = document.createElement('li');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'collection-roster__entry';
    button.dataset.unitId = unitId;
    const rawRank = typeof unit.rank === 'string' ? unit.rank : null;
    let rawMetaRank: string | null = null;
    if (unit.raw && typeof unit.raw === 'object'){
      const rankValue = (unit.raw as Record<string, unknown>).rank;
      rawMetaRank = typeof rankValue === 'string' ? rankValue : null;
    }

    let normalizedRank: Rarity | null = null;
    const rankCandidates: Array<string | null> = [rawRank, rawMetaRank];
    for (const candidate of rankCandidates){
      if (typeof candidate !== 'string' || !candidate.trim()){
        continue;
      }
      try {
        normalizedRank = normalizeRarity(candidate);
        break;
      } catch (error) {
        continue;
      }
    }

    const displayRank = normalizedRank ?? rawRank ?? rawMetaRank ?? null;
    button.dataset.rank = displayRank ?? 'unknown';

    const avatar = document.createElement('div');
    avatar.className = 'collection-roster__avatar';

    const portrait = document.createElement('div');
    portrait.className = 'collection-roster__portrait';
    const art = getUnitArt(unitId);
    if (art?.sprite?.src){
      const img = document.createElement('img');
      img.src = art.sprite.src;
      img.alt = unit.name || unitId;
      portrait.appendChild(img);
    } else {
      const fallback = document.createElement('span');
      fallback.textContent = '—';
      portrait.appendChild(fallback);
    }

   avatar.appendChild(portrait);

    const tooltipParts = [unit.name || unitId];
    if (displayRank){
      tooltipParts.push(`Rank ${displayRank}`);
    }
    if (unit.class){
      tooltipParts.push(unit.class);
    }
    button.title = tooltipParts.join(' • ');
    button.setAttribute('aria-label', tooltipParts.join(' • '));

    button.appendChild(avatar);

    item.appendChild(button);
    rosterList.appendChild(item);

    rosterEntries.set(unitId, { button, avatar, meta: unit, rarity: normalizedRank });
  }

   const handleRosterClick = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>('.collection-roster__entry');
    if (!button) return;
    const unitId = button.dataset.unitId ?? null;
    if (!unitId) return;
    selectUnit(unitId);
  };
  rosterList.addEventListener('click', handleRosterClick);
  addCleanup(() => rosterList.removeEventListener('click', handleRosterClick));

  rosterPanel.appendChild(rosterList);

  const stage = document.createElement('section');
  stage.className = 'collection-stage';

  const stageInfo = document.createElement('div');
  stageInfo.className = 'collection-stage__info';

  const identity = document.createElement('div');
  identity.className = 'collection-stage__identity';

  const stageName = document.createElement('h2');
  stageName.className = 'collection-stage__name';
  stageName.textContent = 'Chưa chọn nhân vật';

  const stageTags = document.createElement('div');
  stageTags.className = 'collection-stage__tags';

  identity.appendChild(stageName);
  identity.appendChild(stageTags);

  stageInfo.appendChild(identity);

  const stageArt = document.createElement('div');
  stageArt.className = 'collection-stage__art';

  const stageSprite = document.createElement('img');
  stageSprite.className = 'collection-stage__sprite';
  stageSprite.alt = '';
  stageSprite.style.opacity = '0';

  stageArt.appendChild(stageSprite);
  const tuViPanel = document.createElement('section');
  tuViPanel.className = 'collection-stage__tuvi';

  const tuViRealm = document.createElement('h3');
  tuViRealm.className = 'collection-stage__tuvi-realm';
  tuViRealm.textContent = 'Cảnh giới 1';

  const tuViSubRealm = document.createElement('p');
  tuViSubRealm.className = 'collection-stage__tuvi-subrealm';
  tuViSubRealm.textContent = 'Tiểu cảnh giới 0';

  const tuViCost = document.createElement('p');
  tuViCost.className = 'collection-stage__tuvi-cost';
  tuViCost.textContent = 'Chi phí kế tiếp: —';

  tuViPanel.appendChild(tuViRealm);
  tuViPanel.appendChild(tuViSubRealm);
  tuViPanel.appendChild(tuViCost);

  const tuViActions = document.createElement('div');
  tuViActions.className = 'collection-stage__tuvi-actions';

  const tuViUpgrade = document.createElement('button');
  tuViUpgrade.type = 'button';
  tuViUpgrade.className = 'collection-stage__tuvi-btn';
  tuViUpgrade.textContent = '+';
  tuViUpgrade.setAttribute('aria-label', 'Nâng một tiểu cảnh giới');

  const tuViDisabled1 = document.createElement('button');
  tuViDisabled1.type = 'button';
  tuViDisabled1.className = 'collection-stage__tuvi-btn';
  tuViDisabled1.textContent = '+';
  tuViDisabled1.disabled = true;

  const tuViDisabled2 = document.createElement('button');
  tuViDisabled2.type = 'button';
  tuViDisabled2.className = 'collection-stage__tuvi-btn';
  tuViDisabled2.textContent = '+';
  tuViDisabled2.disabled = true;

  tuViActions.appendChild(tuViUpgrade);
  tuViActions.appendChild(tuViDisabled1);
  tuViActions.appendChild(tuViDisabled2);

  const stageStatus = document.createElement('p');
  stageStatus.className = 'collection-stage__status';
  stageStatus.textContent = 'Chọn một nhân vật để xem chi tiết và tab chức năng.';

const miniStats = document.createElement('section');
  miniStats.className = 'collection-stage__mini-stats';

  const miniStatsToggle = document.createElement('button');
  miniStatsToggle.type = 'button';
  miniStatsToggle.className = 'collection-stage__mini-stats-toggle';
  miniStatsToggle.textContent = '?';
  miniStatsToggle.setAttribute('aria-label', 'Mở rộng chi tiết chỉ số');

  const miniStatsList = document.createElement('ul');
  miniStatsList.className = 'collection-stage__mini-stats-list';

  const miniStatsHint = document.createElement('p');
  miniStatsHint.className = 'collection-stage__mini-stats-hint';
  miniStatsHint.textContent = 'Bấm ? để mở Chi Tiết';

  miniStats.appendChild(miniStatsToggle);
  miniStats.appendChild(miniStatsList);
  miniStats.appendChild(miniStatsHint);
  stage.appendChild(miniStats);

  let isMiniStatsDetailOpen = false;
  let pendingTpStat: TpStatKey | null = null;

  const tpModal = document.createElement('div');
  tpModal.className = 'collection-stage__tp-modal';

  const tpPanel = document.createElement('section');
  tpPanel.className = 'collection-stage__tp-panel';

  const tpTitle = document.createElement('h4');
  tpTitle.textContent = 'Cộng TP chỉ số';

  const tpSummary = document.createElement('p');
  tpSummary.textContent = 'Chọn lượng TP muốn dùng.';

  const tpRange = document.createElement('input');
  tpRange.type = 'range';
  tpRange.className = 'collection-stage__tp-range';
  tpRange.min = '0';
  tpRange.max = '0';
  tpRange.step = '1';
  tpRange.value = '0';

  const tpRangeLabel = document.createElement('p');
  tpRangeLabel.textContent = '0 / 0 TP';

  const tpActions = document.createElement('div');
  tpActions.className = 'collection-stage__tp-actions';

  const tpCancel = document.createElement('button');
  tpCancel.type = 'button';
  tpCancel.className = 'collection-stage__tp-btn';
  tpCancel.textContent = 'Huỷ';

  const tpOk = document.createElement('button');
  tpOk.type = 'button';
  tpOk.className = 'collection-stage__tp-btn';
  tpOk.textContent = 'OK';

  tpActions.appendChild(tpCancel);
  tpActions.appendChild(tpOk);
  tpPanel.appendChild(tpTitle);
  tpPanel.appendChild(tpSummary);
  tpPanel.appendChild(tpRange);
  tpPanel.appendChild(tpRangeLabel);
  tpPanel.appendChild(tpActions);
  tpModal.appendChild(tpPanel);
  stage.appendChild(tpModal);

  const getUnitTp = (unitId: string | null): number => {
    if (!unitId) return 0;
    const raw = Number(savedTpByUnit[unitId] ?? 0);
    if (Number.isFinite(raw) && raw > 0){
      return Math.max(0, Math.floor(raw));
    }

    const cultivated = savedCultivationByUnit[unitId];
    if (!cultivated){
      return 0;
    }

    const earnedTp = resolveTotalEarnedTp(cultivated.realm, cultivated.subRealm);
    if (earnedTp <= 0){
      return 0;
    }

    const spentTp = Object.values(getUnitTpAlloc(unitId)).reduce((sum, value) => {
      const numeric = Number(value ?? 0);
      if (!Number.isFinite(numeric) || numeric <= 0) return sum;
      return sum + Math.floor(numeric);
    }, 0);

    return Math.max(0, earnedTp - spentTp);
  };

  const getUnitTpAlloc = (unitId: string | null): TpAllocMap => {
    if (!unitId) return {};
    return normalizeTpAllocMap(savedTpAllocByUnit[unitId] ?? {});
  };

  const setUnitTpAlloc = (unitId: string, nextAlloc: TpAllocMap): void => {
    savedTpAllocByUnit[unitId] = normalizeTpAllocMap(nextAlloc);
    patchPlayerProfile({ tpAllocByUnit: savedTpAllocByUnit });
  };

  const getUnitEquipment = (unitId: string | null): UnitEquipmentState => {
    if (!unitId) return {};
    return normalizeUnitEquipmentState(savedEquipmentByUnit[unitId] ?? {});
  };

  const setUnitEquipment = (unitId: string, equipment: UnitEquipmentState): void => {
    savedEquipmentByUnit[unitId] = normalizeUnitEquipmentState(equipment);
    patchPlayerProfile({ equipmentByUnit: savedEquipmentByUnit });
  };

  const closeTpModal = (): void => {
    pendingTpStat = null;
    tpModal.classList.remove('is-open');
  };

  const resolveCombatPower = (unitId: string | null, preview: CollectionStatPreview): number => {
    if (!unitId) return 0;
    const spentTp = Object.values(preview.tpAlloc).reduce((sum, value) => {
      const numeric = Number(value ?? 0);
      if (!Number.isFinite(numeric) || numeric <= 0) return sum;
      return sum + Math.floor(numeric);
    }, 0);
    const availableTp = getUnitTp(unitId);
    const totalTp = Math.max(0, spentTp + availableTp);
    const unitMeta = rosterEntries.get(unitId)?.meta ?? null;
    const unitEntry = unitMeta as Record<string, unknown> | undefined;
    return resolveCollectionCombatPower(preview, totalTp, readCombatPowerTpBonus(unitEntry ?? null));
  };

  const renderMiniStats = (unitId: string | null): void => {
    miniStatsList.replaceChildren();
    const unitCultivation = unitId ? savedCultivationByUnit[unitId] : null;
    const preview = resolveUnitStatPreview({
      unitId,
      cultivation: unitCultivation,
      tpAllocation: getUnitTpAlloc(unitId),
      equipment: getUnitEquipment(unitId),
    });
    const stats = preview.stats;
    if (!stats.length){
      const empty = document.createElement('li');
      empty.className = 'collection-stage__mini-stats-item';
      empty.textContent = 'Chưa có chỉ số';
      miniStatsList.appendChild(empty);
      return;
    }
    const unitTp = getUnitTp(unitId);
    const combatPower = resolveCombatPower(unitId, preview);

    const cpItem = document.createElement('li');
    cpItem.className = 'collection-stage__mini-stats-item';
    const cpLabel = document.createElement('span');
    cpLabel.textContent = 'Lực chiến';
    const cpValue = document.createElement('b');
    cpValue.textContent = currencyFormatter.format(combatPower);
    cpItem.appendChild(cpLabel);
    cpItem.appendChild(cpValue);
    miniStatsList.appendChild(cpItem);

    for (const stat of stats){
      const item = document.createElement('li');
      item.className = 'collection-stage__mini-stats-item';
      if (!CORE_STAT_KEYS.includes(stat.key as (typeof CORE_STAT_KEYS)[number])){
        item.classList.add('is-detail');
      }

    const statWrap = document.createElement('div');
      statWrap.className = 'collection-stage__mini-stats-stat';

      const label = document.createElement('span');
      label.textContent = stat.key;
      statWrap.appendChild(label);

      if (TP_ALLOCATABLE_KEYS.includes(stat.key as TpStatKey)){
        const plus = document.createElement('button');
        plus.type = 'button';
        plus.className = 'collection-stage__mini-stats-plus';
        plus.textContent = '+';
        plus.disabled = !unitId || unitTp <= 0;
        plus.dataset.statKey = stat.key;
        statWrap.appendChild(plus);
      }

      const value = document.createElement('b');
      value.textContent = currencyFormatter.format(stat.value);
      item.appendChild(statWrap);
      item.appendChild(value);
      miniStatsList.appendChild(item);
    }
  };

  const syncMiniStatsDetail = () => {
    miniStats.classList.toggle('is-detail-open', isMiniStatsDetailOpen);
    miniStatsToggle.setAttribute('aria-label', isMiniStatsDetailOpen ? 'Ẩn chi tiết chỉ số' : 'Mở rộng chi tiết chỉ số');
    miniStatsHint.style.display = isMiniStatsDetailOpen ? 'none' : '';
  };

  const handleMiniStatsToggle = () => {
    isMiniStatsDetailOpen = !isMiniStatsDetailOpen;
    syncMiniStatsDetail();
  };

  const updateTpRangeLabel = () => {
    const used = Number(tpRange.value || 0);
    const total = Number(tpRange.max || 0);
    tpRangeLabel.textContent = `${used} / ${total} TP`;
  };

  const openTpModal = (statKey: TpStatKey): void => {
    if (!activeUnitId) return;
    const totalTp = getUnitTp(activeUnitId);
    if (totalTp <= 0) return;
    pendingTpStat = statKey;
    tpTitle.textContent = `Cộng TP · ${statKey}`;
    tpSummary.textContent = `1 TP = +${TP_STAT_GAIN_PER_POINT[statKey]} ${statKey}`;
    tpRange.max = String(totalTp);
    tpRange.value = String(totalTp);
    updateTpRangeLabel();
    tpModal.classList.add('is-open');
  };

  const handleMiniStatsClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    const plus = target?.closest('.collection-stage__mini-stats-plus') as HTMLButtonElement | null;
    if (!plus) return;
    const key = String(plus.dataset.statKey ?? '') as TpStatKey;
    if (!TP_ALLOCATABLE_KEYS.includes(key)) return;
    openTpModal(key);
  };

  const handleTpRangeInput = () => updateTpRangeLabel();

  const handleTpConfirm = () => {
    if (!activeUnitId || !pendingTpStat){
      closeTpModal();
      return;
    }
    const spendTp = Math.max(0, Math.floor(Number(tpRange.value || 0)));
    const currentTp = getUnitTp(activeUnitId);
    if (spendTp <= 0 || spendTp > currentTp){
      closeTpModal();
      return;
    }
    const currentAlloc = getUnitTpAlloc(activeUnitId);
    const key = pendingTpStat;
    const nextAlloc: TpAllocMap = { ...currentAlloc, [key]: Number(currentAlloc[key] ?? 0) + spendTp };
    savedTpByUnit[activeUnitId] = currentTp - spendTp;
    setUnitTpAlloc(activeUnitId, nextAlloc);
    patchPlayerProfile({ tpByUnit: savedTpByUnit });
    renderMiniStats(activeUnitId);
    stageStatus.textContent = `Đã dùng ${spendTp} TP cho ${key}.`;
    closeTpModal();
  };

  miniStatsToggle.addEventListener('click', handleMiniStatsToggle);
  addCleanup(() => miniStatsToggle.removeEventListener('click', handleMiniStatsToggle));
  miniStatsList.addEventListener('click', handleMiniStatsClick);
  addCleanup(() => miniStatsList.removeEventListener('click', handleMiniStatsClick));
  tpCancel.addEventListener('click', closeTpModal);
  addCleanup(() => tpCancel.removeEventListener('click', closeTpModal));
  tpRange.addEventListener('input', handleTpRangeInput);
  addCleanup(() => tpRange.removeEventListener('input', handleTpRangeInput));
  tpOk.addEventListener('click', handleTpConfirm);
  addCleanup(() => tpOk.removeEventListener('click', handleTpConfirm));
  syncMiniStatsDetail();

  const overlay = document.createElement('div');
  overlay.className = 'collection-skill-overlay';

  const artsHubs = document.createElement('section');
  artsHubs.className = 'collection-arts-hubs';

  const gearHub = document.createElement('article');
  gearHub.className = 'collection-arts-hub collection-arts-hub--gear';

  const gearHubIcon = document.createElement('img');
  gearHubIcon.className = 'collection-arts-hub__icon';
  gearHubIcon.src = 'assets/collection/gear.webp';
  gearHubIcon.alt = '';
  gearHubIcon.loading = 'lazy';

  const gearFilters = document.createElement('nav');
  gearFilters.className = 'collection-arts-hub__filters';
  const gearFilterItems = [
    { key: 'all', label: 'Tất Cả' },
    { key: 'head', label: 'Đầu' },
    { key: 'weapon', label: 'Vũ Khí' },
    { key: 'shirt', label: 'Áo' },
    { key: 'pants', label: 'Quần' },
    { key: 'accessory', label: 'TSức' },
    { key: 'ring1', label: 'Nhẫn' },
  ] as const;

  let activeGearFilter: (typeof gearFilterItems)[number]['key'] = 'all';
  let selectedInventoryItemId: string | null = null;

  gearFilterItems.forEach(({ key, label }, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'collection-arts-hub__filter';
    button.textContent = label;
    button.dataset.filter = key;
    if (index === 0){
      button.classList.add('is-active');
    }
    gearFilters.appendChild(button);
  });

  const gearGridWrap = document.createElement('div');
  gearGridWrap.className = 'collection-arts-hub__grid-wrap';

  const gearGrid = document.createElement('div');
  gearGrid.className = 'collection-arts-hub__grid';

  const paperDollHub = document.createElement('article');
  paperDollHub.className = 'collection-arts-hub collection-arts-hub--paperdoll';

  const equipPanel = document.createElement('section');
  equipPanel.className = 'collection-equip-panel';

  const equipLayout = document.createElement('div');
  equipLayout.className = 'collection-equip-layout';

  const equipPopup = document.createElement('section');
  equipPopup.className = 'collection-equip-popup';

  const equipPopupTitle = document.createElement('h4');
  equipPopupTitle.className = 'collection-equip-popup__title';

  const equipPopupDesc = document.createElement('p');
  equipPopupDesc.className = 'collection-equip-popup__desc';

  const equipPopupList = document.createElement('div');
  equipPopupList.className = 'collection-equip-popup__list';

  const equipPopupActions = document.createElement('div');
  equipPopupActions.className = 'collection-equip-popup__actions';

  const equipPopupActionPrimary = document.createElement('button');
  equipPopupActionPrimary.type = 'button';
  equipPopupActionPrimary.className = 'collection-equip-popup__btn';

  const equipPopupClose = document.createElement('button');
  equipPopupClose.type = 'button';
  equipPopupClose.className = 'collection-equip-popup__btn';
  equipPopupClose.textContent = 'Đóng';

  equipPopupActions.appendChild(equipPopupActionPrimary);
  equipPopupActions.appendChild(equipPopupClose);
  equipPopup.appendChild(equipPopupTitle);
  equipPopup.appendChild(equipPopupDesc);
  equipPopup.appendChild(equipPopupList);
  equipPopup.appendChild(equipPopupActions);

  let activeEquipSlot: EquipmentSlotKey | null = null;

  const closeEquipPopup = () => {
    activeEquipSlot = null;
    equipPopup.classList.remove('is-open');
  };

  const renderGearInventory = (): void => {
    gearGrid.replaceChildren();
    const equipment = getUnitEquipment(activeUnitId);
    const visibleItems = activeGearFilter === 'all'
      ? EQUIPMENT_INVENTORY
      : EQUIPMENT_INVENTORY.filter((item) => item.slot === activeGearFilter);
      const availableItems = visibleItems.filter((item) => resolveAvailableQuantityForItem({ equipment, itemId: item.id }) > 0);
    if (selectedInventoryItemId && !availableItems.some((item) => item.id === selectedInventoryItemId)){
      selectedInventoryItemId = null;
    }
    const fragment = document.createDocumentFragment();
    for (const item of availableItems){
      const quantityLeft = resolveAvailableQuantityForItem({ equipment, itemId: item.id });
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = 'collection-arts-hub__slot';
      slot.dataset.itemId = item.id;
      slot.classList.toggle('is-selected', item.id === selectedInventoryItemId);
      slot.textContent = item.symbol ?? '◆';

      if (quantityLeft > 1){
        const quantity = document.createElement('span');
        quantity.className = 'collection-arts-hub__slot-qty';
        quantity.textContent = String(quantityLeft);
        slot.appendChild(quantity);
      }

      const label = document.createElement('span');
      label.className = 'collection-arts-hub__slot-label';
      label.textContent = item.name;
      slot.appendChild(label);
      fragment.appendChild(slot);
    }
    gearGrid.appendChild(fragment);
  };

  const renderEquipmentSlots = (unitId: string | null): void => {
    equipLayout.replaceChildren();
    const equipment = getUnitEquipment(unitId);
    for (const slotKey of EQUIPMENT_SLOT_SEQUENCE){
      const slotButton = document.createElement('button');
      slotButton.type = 'button';
      slotButton.className = 'collection-equip-slot';
      slotButton.dataset.slot = slotKey;
      slotButton.dataset.label = EQUIPMENT_SLOT_LABEL[slotKey];

      const pendingItem = selectedInventoryItemId ? EQUIPMENT_ITEM_BY_ID.get(selectedInventoryItemId) ?? null : null;
      if (pendingItem && isItemCompatibleWithSlot(pendingItem, slotKey)){
        slotButton.classList.add('is-pending');
      }

      const itemId = equipment[slotKey];
      const item = itemId ? EQUIPMENT_ITEM_BY_ID.get(itemId) ?? null : null;
      if (!item){
        const plus = document.createElement('span');
        plus.className = 'collection-equip-slot__plus';
        plus.textContent = '+';
        slotButton.appendChild(plus);
      } else {
        if (slotKey === 'head' && item.symbol === '◉'){
          const aura = document.createElement('span');
          aura.className = 'collection-equip-slot__aura';
          slotButton.appendChild(aura);
        }
        const symbol = document.createElement('span');
        symbol.className = 'collection-equip-slot__symbol';
        symbol.textContent = item.symbol ?? '◆';
        slotButton.appendChild(symbol);

        const name = document.createElement('span');
        name.className = 'collection-equip-slot__name';
        name.textContent = item.name;
        slotButton.appendChild(name);
      }
      equipLayout.appendChild(slotButton);
    }
  };

  const openEmptySlotPopup = (slotKey: EquipmentSlotKey): void => {
    activeEquipSlot = slotKey;
    equipPopupTitle.textContent = `Chọn trang bị · ${EQUIPMENT_SLOT_LABEL[slotKey]}`;
    equipPopupDesc.textContent = 'Danh sách vật phẩm phù hợp từ túi đồ.';
    equipPopupActionPrimary.style.display = 'none';
    equipPopupList.replaceChildren();

    const equipment = getUnitEquipment(activeUnitId);
    const candidates = EQUIPMENT_INVENTORY.filter((item) => isItemCompatibleWithSlot(item, slotKey) && resolveAvailableQuantityForItem({ equipment, itemId: item.id, slotKey }) > 0);
    if (!candidates.length){
      const empty = document.createElement('p');
      empty.className = 'collection-equip-popup__desc';
      empty.textContent = 'Không có vật phẩm phù hợp.';
      equipPopupList.appendChild(empty);
    } else {
      for (const item of candidates){
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'collection-equip-popup__item';
        button.dataset.itemId = item.id;
        button.textContent = `${item.name} (+${sumTpAllocation(item.tpAlloc)} TP)`;
        equipPopupList.appendChild(button);
      }
    }
    equipPopup.classList.add('is-open');
  };

  const openEquippedSlotPopup = (slotKey: EquipmentSlotKey, item: EquipmentItem): void => {
    activeEquipSlot = slotKey;
    equipPopupTitle.textContent = item.name;
    equipPopupDesc.textContent = `${EQUIPMENT_SLOT_LABEL[slotKey]} · +${sumTpAllocation(item.tpAlloc)} TP`;
    equipPopupList.replaceChildren();

    equipPopupActionPrimary.style.display = '';
    equipPopupActionPrimary.textContent = 'Thay đổi';
    equipPopupActionPrimary.dataset.action = 'change';

    const unequipBtn = document.createElement('button');
    unequipBtn.type = 'button';
    unequipBtn.className = 'collection-equip-popup__item';
    unequipBtn.dataset.action = 'unequip';
    unequipBtn.textContent = 'Tháo';
    equipPopupList.appendChild(unequipBtn);

    equipPopup.classList.add('is-open');
  };

  const handleGearFilterClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest<HTMLButtonElement>('.collection-arts-hub__filter');
    if (!button) return;
    const filter = button.dataset.filter;
    const filterItem = gearFilterItems.find((item) => item.key === filter);
    if (!filterItem) return;
    activeGearFilter = filterItem.key;
    for (const candidate of gearFilters.querySelectorAll<HTMLButtonElement>('.collection-arts-hub__filter')){
      candidate.classList.toggle('is-active', candidate === button);
    }
    renderGearInventory();
  };

  const handleGearInventoryClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    const itemButton = target?.closest<HTMLButtonElement>('.collection-arts-hub__slot[data-item-id]');
    if (!itemButton) return;
    const itemId = itemButton.dataset.itemId ?? null;
    selectedInventoryItemId = selectedInventoryItemId === itemId ? null : itemId;
    renderGearInventory();
    renderEquipmentSlots(activeUnitId);
    if (selectedInventoryItemId){
      stageStatus.textContent = `Đã chọn ${EQUIPMENT_ITEM_BY_ID.get(selectedInventoryItemId)?.name ?? 'vật phẩm'} từ Hub gear.`;
    }
  };

  const handleEquipLayoutClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    const slotButton = target?.closest<HTMLButtonElement>('.collection-equip-slot');
    if (!slotButton || !activeUnitId) return;
    const slotKey = slotButton.dataset.slot as EquipmentSlotKey;
    if (!slotKey || !EQUIPMENT_SLOT_SEQUENCE.includes(slotKey)) return;

    const pendingItem = selectedInventoryItemId ? EQUIPMENT_ITEM_BY_ID.get(selectedInventoryItemId) ?? null : null;
    if (pendingItem && isItemCompatibleWithSlot(pendingItem, slotKey)){
      const equipment = getUnitEquipment(activeUnitId);
      const quantityLeft = resolveAvailableQuantityForItem({ equipment, itemId: pendingItem.id, slotKey });
      if (quantityLeft <= 0){
        stageStatus.textContent = `${pendingItem.name} đã hết trong túi đồ.`;
        selectedInventoryItemId = null;
        renderGearInventory();
        return;
      }
      equipment[slotKey] = pendingItem.id;
      setUnitEquipment(activeUnitId, equipment);
      selectedInventoryItemId = null;
      renderGearInventory();
      renderEquipmentSlots(activeUnitId);
      renderMiniStats(activeUnitId);
      stageStatus.textContent = `Đã trang bị ${pendingItem.name} vào ${EQUIPMENT_SLOT_LABEL[slotKey]}.`;
      closeEquipPopup();
      return;
    }

    const equipment = getUnitEquipment(activeUnitId);
    const itemId = equipment[slotKey];
    const item = itemId ? EQUIPMENT_ITEM_BY_ID.get(itemId) ?? null : null;
    if (!item){
      openEmptySlotPopup(slotKey);
      return;
    }
    openEquippedSlotPopup(slotKey, item);
  };

  const handleEquipPopupClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    const chooseBtn = target?.closest<HTMLButtonElement>('.collection-equip-popup__item[data-item-id]');
    if (chooseBtn && activeUnitId && activeEquipSlot){
      const itemId = chooseBtn.dataset.itemId;
      if (itemId){
        const equipment = getUnitEquipment(activeUnitId);
        const quantityLeft = resolveAvailableQuantityForItem({ equipment, itemId, slotKey: activeEquipSlot });
        if (quantityLeft <= 0){
          stageStatus.textContent = `${EQUIPMENT_ITEM_BY_ID.get(itemId)?.name ?? 'Vật phẩm'} đã hết trong túi đồ.`;
          closeEquipPopup();
          renderGearInventory();
          return;
        }
        equipment[activeEquipSlot] = itemId;
        setUnitEquipment(activeUnitId, equipment);
        renderGearInventory();
        renderEquipmentSlots(activeUnitId);
        renderMiniStats(activeUnitId);
        stageStatus.textContent = `Đã trang bị ${EQUIPMENT_ITEM_BY_ID.get(itemId)?.name ?? 'vật phẩm'}.`;
      }
      closeEquipPopup();
      return;
    }

    const actionBtn = target?.closest<HTMLButtonElement>('.collection-equip-popup__item[data-action], .collection-equip-popup__btn[data-action]');
    if (!actionBtn || !activeUnitId || !activeEquipSlot) return;
    const action = actionBtn.dataset.action;
    if (action === 'unequip'){
      const equipment = getUnitEquipment(activeUnitId);
      equipment[activeEquipSlot] = null;
      setUnitEquipment(activeUnitId, equipment);
      renderGearInventory();
      renderEquipmentSlots(activeUnitId);
      renderMiniStats(activeUnitId);
      stageStatus.textContent = `Đã tháo ${EQUIPMENT_SLOT_LABEL[activeEquipSlot]}.`;
      closeEquipPopup();
      return;
    }
    if (action === 'change'){
      openEmptySlotPopup(activeEquipSlot);
    }
  };

  gearFilters.addEventListener('click', handleGearFilterClick);
  gearGrid.addEventListener('click', handleGearInventoryClick);
  equipPopupActionPrimary.addEventListener('click', handleEquipPopupClick as EventListener);
  equipPopupList.addEventListener('click', handleEquipPopupClick);
  equipPopupClose.addEventListener('click', closeEquipPopup);
  equipLayout.addEventListener('click', handleEquipLayoutClick);
  addCleanup(() => gearFilters.removeEventListener('click', handleGearFilterClick));
  addCleanup(() => gearGrid.removeEventListener('click', handleGearInventoryClick));
  addCleanup(() => equipPopupActionPrimary.removeEventListener('click', handleEquipPopupClick as EventListener));
  addCleanup(() => equipPopupList.removeEventListener('click', handleEquipPopupClick));
  addCleanup(() => equipPopupClose.removeEventListener('click', closeEquipPopup));
  addCleanup(() => equipLayout.removeEventListener('click', handleEquipLayoutClick));

  renderGearInventory();
  gearGridWrap.appendChild(gearGrid);
  gearHub.appendChild(gearHubIcon);
  gearHub.appendChild(gearFilters);
  gearHub.appendChild(gearGridWrap);

  equipPanel.appendChild(equipLayout);
  paperDollHub.appendChild(equipPanel);
  paperDollHub.appendChild(equipPopup);
  const artHub = document.createElement('article');
  artHub.className = 'collection-arts-hub collection-arts-hub--art';

  const artHubIcon = document.createElement('img');
  artHubIcon.className = 'collection-arts-hub__icon';
  artHubIcon.src = 'assets/collection/art.webp';
  artHubIcon.alt = '';
  artHubIcon.loading = 'lazy';

  const artHubPlaceholder = document.createElement('p');
  artHubPlaceholder.className = 'collection-arts-hub__art-placeholder';
  artHubPlaceholder.textContent = 'Hub công pháp đã sẵn sàng, dữ liệu phân loại sẽ được bổ sung ở bước tiếp theo.';

  artHub.appendChild(artHubIcon);
  artHub.appendChild(artHubPlaceholder);

  artsHubs.appendChild(gearHub);
  artsHubs.appendChild(paperDollHub);
  artsHubs.appendChild(artHub);

  const overlayHeader = document.createElement('div');
  overlayHeader.className = 'collection-skill-overlay__header';

  const overlayTitle = document.createElement('h3');
  overlayTitle.className = 'collection-skill-overlay__title';
  overlayTitle.textContent = 'Kĩ năng';

  const overlayClose = document.createElement('button');
  overlayClose.type = 'button';
  overlayClose.className = 'collection-skill-overlay__close';
  overlayClose.textContent = 'Đóng';

  const closeOverlay = () => {
    overlay.classList.remove('is-open');
    setActiveTab('arts');
  };
  overlayClose.addEventListener('click', closeOverlay);
  addCleanup(() => overlayClose.removeEventListener('click', closeOverlay));

  overlayHeader.appendChild(overlayTitle);
  overlayHeader.appendChild(overlayClose);

  const overlayContent = document.createElement('div');
  overlayContent.className = 'collection-skill-overlay__content';

  const overlayDetails = document.createElement('div');
  overlayDetails.className = 'collection-skill-overlay__details';

  const overlaySubtitle = document.createElement('p');
  overlaySubtitle.className = 'collection-skill-overlay__subtitle';
  overlaySubtitle.textContent = 'Chọn nhân vật để xem mô tả kỹ năng.';

  const overlaySummary = document.createElement('p');
  overlaySummary.className = 'collection-skill-overlay__subtitle';
  overlaySummary.textContent = '';

  const overlayNotesList = document.createElement('ul');
  overlayNotesList.className = 'collection-skill-overlay__notes';
  const overlayAbilities = document.createElement('div');
  overlayAbilities.className = 'collection-skill-overlay__abilities';

const overlayDetailPanel = document.createElement('aside');
  overlayDetailPanel.className = 'collection-skill-detail';
  overlayDetailPanel.setAttribute('aria-hidden', 'true');
  overlayDetailPanel.hidden = true;

  const detailHeader = document.createElement('div');
  detailHeader.className = 'collection-skill-detail__header';

  const detailTitle = document.createElement('h4');
  detailTitle.className = 'collection-skill-detail__title';
  detailTitle.textContent = 'Chi tiết kỹ năng';

  const detailBadge = document.createElement('span');
  detailBadge.className = 'collection-skill-detail__badge';
  detailBadge.textContent = '';
  detailBadge.style.display = 'none';

  detailHeader.appendChild(detailTitle);
  detailHeader.appendChild(detailBadge);

  const detailDescription = document.createElement('p');
  detailDescription.className = 'collection-skill-detail__description';
  detailDescription.textContent = 'Chọn một kỹ năng ở danh sách bên trái để xem mô tả chi tiết.';

  const detailFacts = document.createElement('div');
  detailFacts.className = 'collection-skill-detail__facts';

  const detailNotes = document.createElement('ul');
  detailNotes.className = 'collection-skill-detail__notes';

  const detailEmpty = document.createElement('p');
  detailEmpty.className = 'collection-skill-detail__empty';
  detailEmpty.textContent = 'Chưa có lưu ý bổ sung.';
  detailEmpty.style.display = 'none';

  overlayDetailPanel.appendChild(detailHeader);
  overlayDetailPanel.appendChild(detailDescription);
  overlayDetailPanel.appendChild(detailFacts);
  overlayDetailPanel.appendChild(detailNotes);
  overlayDetailPanel.appendChild(detailEmpty);

  overlayDetails.appendChild(overlaySubtitle);
  overlayDetails.appendChild(overlaySummary);
  overlayDetails.appendChild(overlayNotesList);
  overlayDetails.appendChild(overlayAbilities);

  overlayContent.appendChild(overlayDetails);
  overlayContent.appendChild(overlayDetailPanel);

  overlay.appendChild(overlayHeader);
  overlay.appendChild(overlayContent);

  stage.appendChild(stageInfo);
  stage.appendChild(stageArt);
  stage.appendChild(tuViPanel);
  stage.appendChild(tuViActions);
  stage.appendChild(stageStatus);
  stage.appendChild(overlay);
  stage.appendChild(artsHubs);

  let activeAbilityCard: HTMLElement | null = null;

  const clearSkillDetail = (): void => {
    if (activeAbilityCard){
      activeAbilityCard.classList.remove('is-expanded');
      activeAbilityCard = null;
    }
    overlayDetailPanel.classList.remove('is-active');
    overlayDetailPanel.setAttribute('aria-hidden', 'true');
    overlayDetailPanel.hidden = true;
    overlayContent.classList.remove('has-detail');
    detailTitle.textContent = 'Chi tiết kỹ năng';
    detailBadge.style.display = 'none';
    detailBadge.textContent = '';
    detailDescription.textContent = 'Chọn một kỹ năng ở danh sách bên trái để xem mô tả chi tiết.';
    clearChildren(detailFacts);
    clearChildren(detailNotes);
    detailEmpty.style.display = 'none';
  };

  const populateSkillDetail = (card: HTMLElement, payload: AbilityDetailRecord | null | undefined): void => {
    const ability = (payload?.ability ?? null) as AbilityEntry | null;
    if (!ability){
      clearSkillDetail();
      return;
    }

    if (activeAbilityCard && activeAbilityCard !== card){
      activeAbilityCard.classList.remove('is-expanded');
    }
    if (activeAbilityCard === card && overlayDetailPanel.classList.contains('is-active')){
      clearSkillDetail();
      return;
    }

    activeAbilityCard = card;
    activeAbilityCard.classList.add('is-expanded');

    const abilityName = ability?.name || 'Kĩ năng';
    detailTitle.textContent = toSafeText(abilityName);

    const typeLabel = (payload?.typeLabel as string | null | undefined)
      || card.dataset.typeLabel
      || labelForAbility(ability);
    if (typeLabel){
      detailBadge.textContent = toSafeText(typeLabel);
      detailBadge.style.display = '';
    } else {
      detailBadge.textContent = '';
      detailBadge.style.display = 'none';
    }

    const description = ability?.description && String(ability.description).trim() !== ''
      ? String(ability.description)
      : card.dataset.description || 'Chưa có mô tả chi tiết.';
    detailDescription.textContent = toSafeText(description);

    clearChildren(detailFacts);
    const factsFromCard = Array.isArray(payload?.facts) ? payload.facts : parseFactListFromDataset(card.dataset.meta);
    const facts: AbilityFact[] = factsFromCard.length ? factsFromCard : collectAbilityFacts(ability);
    if (facts.length){
      for (const fact of facts){
        const item = document.createElement('div');
        item.className = 'collection-skill-detail__fact';

        if (fact.icon){
          const iconEl = document.createElement('span');
          iconEl.className = 'collection-skill-detail__fact-icon';
          iconEl.textContent = toSafeText(fact.icon);
          item.appendChild(iconEl);
        }

        const factBody = document.createElement('div');

        if (fact.label){
          const labelEl = document.createElement('div');
          labelEl.className = 'collection-skill-detail__fact-label';
          labelEl.textContent = toSafeText(fact.label);
          factBody.appendChild(labelEl);
        }

        const valueEl = document.createElement('div');
        valueEl.className = 'collection-skill-detail__fact-value';
        valueEl.textContent = toSafeText(fact.value);
        factBody.appendChild(valueEl);

        if (fact.tooltip){
          valueEl.title = fact.tooltip;
        }

        item.appendChild(factBody);
        detailFacts.appendChild(item);
      }
    }

    clearChildren(detailNotes);

    const rawNotes = Array.isArray(payload?.notes) ? payload.notes : (Array.isArray(ability?.notes) ? ability.notes : []);
    const cardNotes = Array.isArray(payload?.notes) ? [] : parseJsonArrayFromDataset(card.dataset.notes);
    const mergedNotes: string[] = [];
    const noteSet = new Set<string>();
    for (const rawNote of [...rawNotes, ...cardNotes]){
      const normalized = typeof rawNote === 'string' ? rawNote.trim() : '';
      if (!normalized || noteSet.has(normalized)){
        continue;
      }
      noteSet.add(normalized);
      mergedNotes.push(normalized);
    }

    if (mergedNotes.length){
      for (const note of mergedNotes){
        const noteItem = document.createElement('li');
        noteItem.textContent = toSafeText(note);
        detailNotes.appendChild(noteItem);
      }
      detailEmpty.style.display = 'none';
    } else {
      detailEmpty.style.display = '';
    }

    overlayDetailPanel.hidden = false;
    overlayDetailPanel.classList.add('is-active');
    overlayDetailPanel.setAttribute('aria-hidden', 'false');
    overlayContent.classList.add('has-detail');
  };

  const handleAbilityInteractions = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const card = target.closest<HTMLElement>('.collection-skill-card');
    if (!card) return;
    const abilityKey = card.dataset.abilityKey ?? null;
    if (!abilityKey) return;
    const detail = abilityDetailCache.get(abilityKey);
    if (!detail) return;

    if (target.closest('.collection-skill-card__upgrade')){
      const upgradeDetail = {
        abilityId: detail.abilityId ?? null,
        ability: detail.ability ?? null,
      };
      card.dispatchEvent(new CustomEvent('collection:request-upgrade', {
        bubbles: true,
        detail: upgradeDetail,
      }));
      return;
    }

    populateSkillDetail(card, detail);
  };

  overlayAbilities.addEventListener('click', handleAbilityInteractions);
  addCleanup(() => overlayAbilities.removeEventListener('click', handleAbilityInteractions));

  const handleGlobalClick = (event: MouseEvent): void => {
    if (overlayDetailPanel.hidden) return;
    const target = event.target as HTMLElement | null;
    if (target && overlay.contains(target)){
      if (target.closest('.collection-skill-detail')) return;
      if (target.closest('.collection-skill-card')) return;
    }
    clearSkillDetail();
  };

  document.addEventListener('click', handleGlobalClick);
  addCleanup(() => document.removeEventListener('click', handleGlobalClick));

  const tabs = document.createElement('aside');
  tabs.className = 'collection-tabs';

  const tabButtons = new Map<CollectionTabKey, HTMLButtonElement>();

  const setActiveTab = (key: CollectionTabKey | null) => {
    updateActiveTab(filterState, key);
    for (const [tabKey, button] of tabButtons){
      if (!button) continue;
      if (tabKey === key){
        button.classList.add('is-active');
      } else {
        button.classList.remove('is-active');
      }
    }
    stageStatus.textContent = key ? (TAB_HINT_BY_KEY[key] || '') : 'Chọn một nhân vật để xem chi tiết.';
    const isSkillTab = key === 'skills';
    const isArtsTab = key === 'arts';

    if (isSkillTab){
      overlay.classList.add('is-open');
      if (activeUnitId){
        renderSkillAbilityList(activeUnitId);
      }
    } else {
      overlay.classList.remove('is-open');
      clearSkillDetail();
    }

    if (isArtsTab){
      artsHubs.classList.add('is-open');
    } else {
      artsHubs.classList.remove('is-open');
    }
  };

  const handleTabClick = (key: CollectionTabKey) => {
    if (filterState.activeTab === key){
      shouldAutoOpenArtsHubs = false;
      patchPlayerProfile({
        collectionUi: {
          activeTab: '',
          artsHubAutoOpen: false,
        },
      });
      setActiveTab(null);
      return;
    }

    shouldAutoOpenArtsHubs = key === 'arts';
    patchPlayerProfile({
      collectionUi: {
        activeTab: key,
        artsHubAutoOpen: shouldAutoOpenArtsHubs,
      },
    });

    setActiveTab(key);
  };

  for (const tab of TAB_DEFINITIONS){
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'collection-tabs__button';
    button.dataset.tabKey = tab.key;

    button.title = tab.label;
    button.setAttribute('aria-label', tab.label);

    const icon = document.createElement('img');
    icon.className = 'collection-tabs__icon';
    icon.src = tab.icon;
    icon.alt = '';
    icon.loading = 'lazy';
    button.appendChild(icon);

    const clickHandler = () => handleTabClick(tab.key);
    button.addEventListener('click', clickHandler);
    addCleanup(() => button.removeEventListener('click', clickHandler));

    tabButtons.set(tab.key, button);
    tabs.appendChild(button);
  }

  layout.appendChild(rosterPanel);
  layout.appendChild(stage);
  layout.appendChild(tabs);

  container.appendChild(layout);

const resolveCurrentCultivation = () => {
    const unitCultivation = activeUnitId ? savedCultivationByUnit[activeUnitId] : null;
    const cultivation = unitCultivation ?? { realm: 1, subRealm: 0 };
    const realm = Number.isFinite(cultivation.realm) ? Number(cultivation.realm) : 1;
    const subRealm = Number.isFinite(cultivation.subRealm) ? Number(cultivation.subRealm) : 0;
    return {
      realm: Math.max(1, Math.floor(realm)),
      subRealm: Math.max(0, Math.floor(subRealm)),
    };
  };

  const refreshWallet = () => {
    for (const currency of currencyCatalog){
      const balance = walletBalances.get(currency.id);
      if (!balance) continue;
      const value = Number(mutablePlayerState.currencies?.[currency.id] ?? 0);
      balance.textContent = `${currencyFormatter.format(Number.isFinite(value) ? value : 0)} ${currency.suffix || currency.id}`;
    }
  };

  const unsubscribeSharedWallet = subscribeSharedCurrencyWallet((walletSnapshot) => {
    mutablePlayerState.currencies = createNormalizedWallet(walletSnapshot);
    refreshWallet();
  });
  addCleanup(unsubscribeSharedWallet);

  let selectedUnitRenderKey = '';
  
  const refreshTuViPanel = () => {
    const { realm, subRealm } = resolveCurrentCultivation();
    const realmEconomy = getCultivationRealmEconomy(realm);
    const realmName = realmEconomy?.name ?? `Cảnh giới ${realm}`;
    const maxSubRealm = realmEconomy?.subRealmCosts.length ?? 0;

    tuViRealm.textContent = `${realmName} (${realm})`;
    tuViSubRealm.textContent = `Tiểu cảnh giới ${subRealm}/${maxSubRealm}`;

    const costInfo = getCultivationCost(realm, subRealm);
    if (!costInfo){
      tuViCost.textContent = 'Chi phí kế tiếp: Đã đạt giới hạn';
      return;
    }

    tuViCost.textContent = costInfo.isBreakthrough
      ? `Đột phá lên ${getCultivationRealmEconomy(costInfo.nextRealm)?.name ?? `Cảnh giới ${costInfo.nextRealm}`}: ${currencyFormatter.format(costInfo.aetherCost)} VNT`
      : `Chi phí kế tiếp: ${currencyFormatter.format(costInfo.aetherCost)} VNT`;
  };

  const renderSkillAbilityList = (unitId: string): void => {
    const selectedEntry = rosterEntries.get(unitId) || null;
    const unit = selectedEntry?.meta || null;
    const skillSet = skillSetCache.has(unitId)
      ? skillSetCache.get(unitId)
      : getSkillSet(unitId);
    if (!skillSetCache.has(unitId)){
      skillSetCache.set(unitId, skillSet);
    }

    overlayTitle.textContent = toSafeText(unit?.name ? `Kĩ năng · ${unit.name}` : 'Kĩ năng');
    overlaySubtitle.textContent = toSafeText(describeUlt(unit));
    const summaryNote = skillSet?.notes?.[0] ?? '';
    overlaySummary.textContent = toSafeText(summaryNote);
    overlaySummary.style.display = summaryNote ? '' : 'none';

    overlayNotesList.replaceChildren();
    const extraNotes = Array.isArray(skillSet?.notes) ? skillSet.notes.slice(1) : [];
    if (extraNotes.length){
      overlayNotesList.style.display = '';
      for (const note of extraNotes){
        if (!note) continue;
        const item = document.createElement('li');
        item.textContent = toSafeText(note);
        overlayNotesList.appendChild(item);
      }
    } else {
      overlayNotesList.style.display = 'none';
    }

    overlayAbilities.replaceChildren();
    abilityDetailCache.clear();
    const cachedCards = abilityRenderCache.get(unitId);
    const cachedDetails = abilityDetailByUnitCache.get(unitId);
    if (cachedDetails){
      for (const [abilityKey, detail] of cachedDetails){
        abilityDetailCache.set(abilityKey, detail);
      }
    }
    if (cachedCards && cachedCards.length){
      for (const cached of cachedCards){
        overlayAbilities.appendChild(cached.cloneNode(true));
      }
      return;
    }

    const abilityEntries: Array<{ entry: AbilityEntry | null | undefined; label: string }> = [];
    if (skillSet?.basic){
      abilityEntries.push({ entry: skillSet.basic, label: ABILITY_TYPE_LABELS.basic });
    }
    if (Array.isArray(skillSet?.skills)){
      skillSet.skills.forEach((skill: AbilityEntry | null | undefined, index: number) => {
        if (!skill) return;
        abilityEntries.push({ entry: skill, label: `Kĩ năng ${index + 1}` });
      });
    }
    if (skillSet?.ult){
      abilityEntries.push({ entry: skillSet.ult, label: ABILITY_TYPE_LABELS.ultimate });
    }
    if (skillSet?.talent){
      abilityEntries.push({ entry: skillSet.talent, label: ABILITY_TYPE_LABELS.talent });
    }
    if (skillSet?.technique){
      abilityEntries.push({ entry: skillSet.technique, label: ABILITY_TYPE_LABELS.technique });
    }

    if (abilityEntries.length){
      const renderedCards: HTMLElement[] = [];
      const detailMap = new Map<string, AbilityDetailRecord>();
      for (let index = 0; index < abilityEntries.length; index += 1){
        const ability = abilityEntries[index];
        if (!ability) continue;
        const abilityEntry = ability.entry;
        const abilityId = abilityEntry?.id ?? abilityEntry?.abilityId ?? null;
        const abilityKey = `${unitId}:${String(abilityId ?? index)}`;
        const normalizedNotes = Array.isArray(abilityEntry?.notes)
          ? abilityEntry.notes
            .map(note => (typeof note === 'string' ? note.trim() : ''))
            .filter(note => note.length > 0)
          : [];
        const facts = collectAbilityFacts(abilityEntry);
        const detailRecord: AbilityDetailRecord = {
          unitId,
          abilityId,
          ability: abilityEntry,
          typeLabel: ability.label,
          facts,
          notes: normalizedNotes,
        };
        abilityDetailCache.set(abilityKey, detailRecord);
        detailMap.set(abilityKey, detailRecord);

        const card = renderAbilityCard(abilityEntry, {
          typeLabel: ability.label,
          unitId,
          abilityKey,
          facts,
          notes: normalizedNotes,
        });
        renderedCards.push(card.cloneNode(true) as HTMLElement);
        overlayAbilities.appendChild(card);
      }
      abilityRenderCache.set(unitId, renderedCards);
      abilityDetailByUnitCache.set(unitId, detailMap);
    } else {
      const placeholder = document.createElement('p');
      placeholder.className = 'collection-skill-card__empty';
      placeholder.textContent = 'Chưa có dữ liệu kỹ năng chi tiết cho nhân vật này.';
      overlayAbilities.appendChild(placeholder);
      abilityRenderCache.set(unitId, [placeholder.cloneNode(true) as HTMLElement]);
      abilityDetailByUnitCache.set(unitId, new Map());
    }
  };

  const handleCultivationUpgrade = () => {
    if (!activeUnitId){
      stageStatus.textContent = 'Hãy chọn một nhân vật trước khi tăng tu vi.';
      return;
    }
    const { realm, subRealm } = resolveCurrentCultivation();
    const upgraded = upgradeCultivation(mutablePlayerState, realm, subRealm);
    if (!upgraded.ok){
      stageStatus.textContent = upgraded.reason === 'insufficient_currency'
        ? 'Không đủ VNT để nâng tiểu cảnh giới.'
        : 'Không thể nâng cấp tu vi ở trạng thái hiện tại.';
      return;
    }
    mutablePlayerState.currencies = { ...(upgraded.playerState.currencies ?? {}) };
    syncSharedCurrencyWallet(mutablePlayerState.currencies);
    const nextCultivation = { ...(upgraded.playerState.cultivation ?? {}) };
    savedCultivationByUnit[activeUnitId] = {
      realm: Number(nextCultivation.realm ?? upgraded.newRealm),
      subRealm: Number(nextCultivation.subRealm ?? upgraded.newSubRealm),
    };
    const gainedTp = resolveTpGainForUpgrade({
      fromRealm: upgraded.previousRealm,
      fromSubRealm: upgraded.previousSubRealm,
      toRealm: upgraded.newRealm,
      toSubRealm: upgraded.newSubRealm,
    });
    if (gainedTp > 0){
      savedTpByUnit[activeUnitId] = getUnitTp(activeUnitId) + gainedTp;
    }

    patchPlayerProfile({
      cultivationByUnit: savedCultivationByUnit,
      tpByUnit: savedTpByUnit,
    });
    refreshWallet();
    refreshTuViPanel();
    renderMiniStats(activeUnitId);
    const upgradedRealmName = getCultivationRealmEconomy(upgraded.newRealm)?.name ?? `Cảnh giới ${upgraded.newRealm}`;
    stageStatus.textContent = gainedTp > 0
      ? `Đã nâng lên ${upgradedRealmName} · Tiểu cảnh giới ${upgraded.newSubRealm} (+${gainedTp} TP).`
      : `Đã nâng lên ${upgradedRealmName} · Tiểu cảnh giới ${upgraded.newSubRealm}.`;
  };
  tuViUpgrade.addEventListener('click', handleCultivationUpgrade);
  addCleanup(() => tuViUpgrade.removeEventListener('click', handleCultivationUpgrade));

  refreshWallet();
  refreshTuViPanel();

  const selectUnit = (unitId: string | null) => {
    if (!unitId || !rosterEntries.has(unitId)) return;
    const nextRenderKey = `${unitId}::${filterState.activeTab}`;
    if (selectedUnitRenderKey === nextRenderKey){
      refreshTuViPanel();
      return;
    }
    selectedUnitRenderKey = nextRenderKey;
    activeUnitId = unitId;
    updateSelectedUnit(filterState, unitId);
    clearSkillDetail();
    for (const [id, entry] of rosterEntries){
      if (!entry?.button) continue;
      if (id === unitId){
        entry.button.classList.add('is-selected');
      } else {
        entry.button.classList.remove('is-selected');
      }
    }

    const selectedEntry = rosterEntries.get(unitId) || null;
    const unit = selectedEntry?.meta || null;
    stageName.textContent = '';
    stageTags.replaceChildren();

    const art = getUnitArt(unitId);
    if (art?.sprite?.src){
      stageSprite.src = art.sprite.src;
      stageSprite.alt = toSafeText(unit?.name ?? unitId);
      stageSprite.style.opacity = '1';
    } else {
      stageSprite.removeAttribute('src');
      stageSprite.alt = '';
      stageSprite.style.opacity = '0';
    }

    if (filterState.activeTab === 'skills'){
      renderSkillAbilityList(unitId);
    }

    if (filterState.activeTab === 'skills'){
      overlay.classList.add('is-open');
    }
    closeEquipPopup();
    renderGearInventory();
    renderEquipmentSlots(unitId);
    renderMiniStats(unitId);
    refreshTuViPanel();
  };

  if (rosterEntries.size > 0){
    const preferredId = Array.from(rosterEntries.keys())[0];
    if (preferredId){
      selectUnit(preferredId);
    }
  }

  setActiveTab(null);

  return {
    destroy(){
      for (const fn of cleanups.splice(0, cleanups.length)){
        try {
          fn();
        } catch (error) {
          console.error('[collection] cleanup error', error);
        }
      }
      mount.destroy();
    }
  } satisfies CollectionViewHandle;
}

export type { CollectionViewHandle } from './types.ts';