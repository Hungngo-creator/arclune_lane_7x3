import type { BoardCell } from './index.ts';

/**
 * House module = "ô nhà" trong Monopoly.
 *
 * Thiết kế tách riêng để nhiệm vụ sau chỉ cần đọc file này là hiểu:
 * - Cách spawn slot nhà ngẫu nhiên (marker '?', tối đa 16).
 * - Cách reveal tier + bất động sản khi người chơi chọn mua.
 * - Cách tích trữ bạc từ tự sinh + thuế + mỏ.
 * - Cách xử lý đi ngang / đạp trúng cho chủ nhà và người khác.
 * - Cách nâng cấp nhà theo rule từng bất động sản.
 */

export type HouseTier = 1 | 2 | 3 | 4 | 5;

export interface HouseCombatRules {
  readonly passDamageByOwnerBasicHits?: number;
  readonly landDamageByOwnerBasicHits?: number;
  readonly range3DamageByOwnerBasicHits?: number;
  readonly range2DamageByOwnerBasicHits?: number;
}

export interface HouseDefinition {
  readonly id: string;
  readonly name: string;
  readonly tier: HouseTier;
  /** Thu nhập theo năm (không dùng cho mỏ, vì mỏ dùng minePerYearSilver). */
  readonly yearlySilver: number;
    /** Thuế khi avatar không phải chủ đi ngang. */
  readonly passTaxSilver: number;
  /** Thuế khi avatar không phải chủ đạp trúng ô nhà. */
  readonly landTaxSilver: number;
  /** Phí nâng lên cấp kế tiếp (null = cấp 5, không nâng). */
  readonly upgradeCostSilver: number | null;
  /** Với bất động sản dạng mỏ: bạc khai thác / năm. */
  readonly minePerYearSilver?: number;
  /** Với bất động sản dạng mỏ: số năm khai thác tối đa. */
  readonly mineYears?: number;
  readonly ownerPassBuff?: string;
  readonly ownerLandBuff?: string;
  readonly specialRules?: ReadonlyArray<string>;
  readonly combatRules?: HouseCombatRules;
}

export interface HouseStatusDelta {
  readonly thirst?: number;
  readonly hunger?: number;
  readonly spirit?: number;
}

export interface HouseVisitorPenalty {
  readonly hpRatioLoss: number;
  readonly statusDelta: HouseStatusDelta;
}

export interface HouseSpiritOverflowResult {
  readonly nextSpirit: number;
  readonly nextSpiritCap: number;
  readonly overflowConvertedToCap: number;
}

export const MONOPOLY_HOUSE_SPAWN_LIMIT = 16;

export const HOUSE_TIER_BUY_COST: Readonly<Record<HouseTier, number>> = Object.freeze({
  1: 50,
  2: 300,
  3: 600,
  4: 900,
  5: 1500
});

export const HOUSE_TIER_ROLL_TABLE: ReadonlyArray<Readonly<{ tier: HouseTier; weight: number }>> = Object.freeze([
  Object.freeze({ tier: 5, weight: 3 }),
  Object.freeze({ tier: 4, weight: 6 }),
  Object.freeze({ tier: 3, weight: 9 }),
  Object.freeze({ tier: 2, weight: 18 }),
  Object.freeze({ tier: 1, weight: 64 })
]);

const DEFINITIONS: ReadonlyArray<HouseDefinition> = Object.freeze([
  { id: 'tieu_diem', name: 'Tiểu điếm', tier: 1, yearlySilver: 20, passTaxSilver: 5, landTaxSilver: 20, upgradeCostSilver: 200, ownerLandBuff: '+10 đói/+10 khát' },
  { id: 'thon_nho', name: 'Thôn nhỏ', tier: 1, yearlySilver: 30, passTaxSilver: 5, landTaxSilver: 20, upgradeCostSilver: 250, ownerLandBuff: '+3% HP max, +5 đói, +10 khát' },
  { id: 'tuu_lau', name: 'Tửu Lâu', tier: 2, yearlySilver: 80, passTaxSilver: 10, landTaxSilver: 30, upgradeCostSilver: 500, ownerLandBuff: '+20 khát, +5 tinh thần' },
  { id: 'quang_nho', name: 'Quặng nhỏ', tier: 2, yearlySilver: 0, passTaxSilver: 0, landTaxSilver: 0, upgradeCostSilver: 450, minePerYearSilver: 250, mineYears: 3 },
  { id: 'duoc_duong', name: 'Dược Đường', tier: 2, yearlySilver: 100, passTaxSilver: 15, landTaxSilver: 35, upgradeCostSilver: 550, ownerPassBuff: '+4% HP max', ownerLandBuff: '+10% HP max' },
  { id: 'quang_vua', name: 'Quặng vừa', tier: 3, yearlySilver: 0, passTaxSilver: 0, landTaxSilver: 0, upgradeCostSilver: 800, minePerYearSilver: 400, mineYears: 4 },
  { id: 'duoc_coc', name: 'Dược Cốc', tier: 3, yearlySilver: 250, passTaxSilver: 50, landTaxSilver: 120, upgradeCostSilver: 900, ownerPassBuff: '+6% HP max', ownerLandBuff: '+15% HP max, +3 tinh thần' },
  { id: 'tan_khi_mon', name: 'Tán Khí Môn', tier: 3, yearlySilver: 230, passTaxSilver: 70, landTaxSilver: 160, upgradeCostSilver: 950, ownerPassBuff: '+5% HP max, +10 đói/khát, +5 tinh thần' },
  { id: 'khi_cac', name: 'Khí Các', tier: 3, yearlySilver: 230, passTaxSilver: 80, landTaxSilver: 180, upgradeCostSilver: 900, ownerPassBuff: '+10 đói/khát/tinh thần' },
  { id: 'thuong_hoi', name: 'Thương hội', tier: 4, yearlySilver: 350, passTaxSilver: 120, landTaxSilver: 250, upgradeCostSilver: 1300, ownerPassBuff: '+8% HP max, +10 đói/khát/tinh thần', ownerLandBuff: '+17% HP max, +20 đói/khát/tinh thần' },
  { id: 'mo_khong_lo', name: 'Mỏ Khổng lồ', tier: 4, yearlySilver: 0, passTaxSilver: 0, landTaxSilver: 0, upgradeCostSilver: 1200, minePerYearSilver: 700, mineYears: 8 },
  { id: 'tien_gia_phu_de', name: 'Tiên Gia Phủ Đệ', tier: 4, yearlySilver: 300, passTaxSilver: 180, landTaxSilver: 300, upgradeCostSilver: 1400, ownerPassBuff: '+11% HP max, +12 đói/khát/tinh thần', ownerLandBuff: '+23% HP max, +25 đói/khát/tinh thần' },
  { id: 'ba_nen_nhang', name: 'Ba Nén Nhang', tier: 4, yearlySilver: 400, passTaxSilver: 300, landTaxSilver: 700, upgradeCostSilver: 1550, ownerPassBuff: '+20 tinh thần', specialRules: ['Kẻ địch đi ngang/đạp trúng mất thêm HP và chỉ số', 'Chủ đạp trúng khi HP < 8% max thì bị phản sát (HP=0)'] },
  { id: 'hop_hoan_tong', name: 'Hợp Hoan Tông', tier: 5, yearlySilver: 700, passTaxSilver: 500, landTaxSilver: 1000, upgradeCostSilver: null, ownerPassBuff: '+15 tinh thần', ownerLandBuff: '+35 tinh thần' },
  { id: 'anh_sat_mon', name: 'Ảnh sát môn', tier: 5, yearlySilver: 750, passTaxSilver: 700, landTaxSilver: 1500, upgradeCostSilver: null, ownerPassBuff: '+30 tinh thần', ownerLandBuff: '+65 tinh thần', specialRules: ['Trốn thuế có thể bị giết hoặc giảm vĩnh viễn 3% HP max', 'Tinh thần dư chuyển 50% sang max tinh thần'] },
  { id: 'thi_than_thuong', name: 'Thí Thần Thương', tier: 5, yearlySilver: 0, passTaxSilver: 0, landTaxSilver: 0, upgradeCostSilver: null, combatRules: { passDamageByOwnerBasicHits: 2, landDamageByOwnerBasicHits: 4 }, specialRules: ['Không thuế/không tự sinh tiền'] },
  { id: 'anh_cung', name: 'Ảnh Cung', tier: 5, yearlySilver: 0, passTaxSilver: 0, landTaxSilver: 0, upgradeCostSilver: null, combatRules: { passDamageByOwnerBasicHits: 1, landDamageByOwnerBasicHits: 3 }, specialRules: ['Đạp trúng có thể kéo chủ về ô Ảnh Cung (trừ Quỷ Vực/Bí Cảnh)'] },
  { id: 'tai_cac', name: 'Tài Các', tier: 5, yearlySilver: 1300, passTaxSilver: 800, landTaxSilver: 1700, upgradeCostSilver: null, ownerPassBuff: '+50 tinh thần', ownerLandBuff: '+100 tinh thần' },
  { id: 'thi_than_cung', name: 'Thí Thần Cung', tier: 5, yearlySilver: 0, passTaxSilver: 0, landTaxSilver: 0, upgradeCostSilver: null, combatRules: { range3DamageByOwnerBasicHits: 2, range2DamageByOwnerBasicHits: 5 }, specialRules: ['Bắn xuyên map: tấn công theo bán kính'] }
]);

const DEFINITIONS_BY_TIER = new Map<HouseTier, ReadonlyArray<HouseDefinition>>();
for (const tier of [1, 2, 3, 4, 5] as const) {
  DEFINITIONS_BY_TIER.set(tier, Object.freeze(DEFINITIONS.filter(entry => entry.tier === tier)));
}

export interface HiddenHouseSlot {
  readonly cellIndex: number;
  readonly marker: '?';
  revealedTier: HouseTier | null;
  definitionId: string | null;
  ownerAvatarId: number | null;
  treasurySilver: number;
  minedYears: number;
}

export interface HouseTraverseResult {
  readonly expectedTaxSilver: number;
  readonly paidTaxSilver: number;
  readonly ownerCollectedSilver: number;
  readonly houseTreasurySilver: number;
  readonly ownerTriggeredHouse: boolean;
}

export function createRandomHouseSlots(cells: ReadonlyArray<BoardCell>, rng: () => number = Math.random, cap = MONOPOLY_HOUSE_SPAWN_LIMIT): HiddenHouseSlot[] {
  const limit = Math.max(0, Math.min(cap, MONOPOLY_HOUSE_SPAWN_LIMIT, cells.length));
  const pool = [...cells.map(cell => cell.index + 1)];
  const chosen: HiddenHouseSlot[] = [];
  for (let i = 0; i < limit; i += 1) {
    const pick = Math.floor(Math.max(0, Math.min(0.999999, rng())) * pool.length);
    const [cellIndex] = pool.splice(pick, 1);
    if (typeof cellIndex !== 'number') break;
    chosen.push({
      cellIndex,
      marker: '?',
      revealedTier: null,
      definitionId: null,
      ownerAvatarId: null,
      treasurySilver: 0,
      minedYears: 0
    });
  }
  return chosen;
}

export function rollHouseTier(rng: () => number = Math.random): HouseTier {
  const roll = Math.max(0, Math.min(0.999999, rng())) * 100;
  let cursor = 0;
  for (const entry of HOUSE_TIER_ROLL_TABLE) {
    cursor += entry.weight;
    if (roll < cursor) return entry.tier;
  }
  return 1;
}

export function pickRandomHouseDefinitionByTier(tier: HouseTier, rng: () => number = Math.random): HouseDefinition {
  const pool = DEFINITIONS_BY_TIER.get(tier) ?? [];
  if (pool.length <= 0) {
    throw new Error(`Thiếu định nghĩa nhà ở cấp ${tier}`);
  }
  const index = Math.floor(Math.max(0, Math.min(0.999999, rng())) * pool.length);
  return pool[index] ?? pool[0]!;
}

export function getHouseDefinitionById(definitionId: string | null): HouseDefinition | null {
  if (!definitionId) return null;
  return DEFINITIONS.find(entry => entry.id === definitionId) ?? null;
}

export function revealHousePurchase(slot: HiddenHouseSlot, buyerAvatarId: number, walletSilver: number, rng: () => number = Math.random): {
  ok: boolean;
  nextWalletSilver: number;
  tier: HouseTier;
  definition: HouseDefinition | null;
  reason?: string;
} {
  const tier = rollHouseTier(rng);
  const cost = HOUSE_TIER_BUY_COST[tier];
  if (walletSilver < cost) {
    return { ok: false, nextWalletSilver: walletSilver, tier, definition: null, reason: 'not_enough_silver' };
  }
  const definition = pickRandomHouseDefinitionByTier(tier, rng);
  slot.revealedTier = tier;
  slot.definitionId = definition.id;
  slot.ownerAvatarId = buyerAvatarId;
  return { ok: true, nextWalletSilver: walletSilver - cost, tier, definition };
}

/**
 * Tăng treasury theo năm.
 * - yearCompleted = false: chưa qua chu kỳ năm => chỉ giữ nguyên treasury (không tự sinh thêm).
 * - yearCompleted = true: cộng yearlySilver hoặc minePerYearSilver (nếu còn lượt khai thác).
 */
export function collectHouseIncome(slot: HiddenHouseSlot, yearCompleted: boolean): number {
  const def = getHouseDefinitionById(slot.definitionId);
  if (!def) return 0;
  if (def.minePerYearSilver && def.mineYears) {
    if (slot.minedYears >= def.mineYears) return slot.treasurySilver;
    if (yearCompleted) {
      slot.treasurySilver += def.minePerYearSilver;
      slot.minedYears += 1;
    }
    return slot.treasurySilver;
  }
  if (yearCompleted) {
    slot.treasurySilver += def.yearlySilver;
  }
  return slot.treasurySilver;
}

/** Xử lý đi ngang / đạp trúng ô nhà. Thuế luôn cộng vào treasury để chủ thu khi đi ngang. */
export function settleHouseTraverse(
  slot: HiddenHouseSlot,
  actorAvatarId: number,
  isLanding: boolean,
  maxPayableSilver = Number.POSITIVE_INFINITY
): HouseTraverseResult {
  const def = getHouseDefinitionById(slot.definitionId);
  if (!def || slot.ownerAvatarId == null) {
    return { expectedTaxSilver: 0, paidTaxSilver: 0, ownerCollectedSilver: 0, houseTreasurySilver: slot.treasurySilver, ownerTriggeredHouse: false };
  }

  if (actorAvatarId === slot.ownerAvatarId) {
    const ownerCollectedSilver = slot.treasurySilver;
    slot.treasurySilver = 0;
    return { expectedTaxSilver: 0, paidTaxSilver: 0, ownerCollectedSilver, houseTreasurySilver: slot.treasurySilver, ownerTriggeredHouse: true };
  }

  const expectedTaxSilver = isLanding ? def.landTaxSilver : def.passTaxSilver;
  const paidTaxSilver = Math.max(0, Math.min(expectedTaxSilver, Math.floor(maxPayableSilver)));
  slot.treasurySilver += paidTaxSilver;
  return { expectedTaxSilver, paidTaxSilver, ownerCollectedSilver: 0, houseTreasurySilver: slot.treasurySilver, ownerTriggeredHouse: false };
}

export function upgradeHouse(slot: HiddenHouseSlot, walletSilver: number, rng: () => number = Math.random): {
  ok: boolean;
  nextWalletSilver: number;
  nextDefinition: HouseDefinition | null;
  reason?: string;
} {
  const currentDef = getHouseDefinitionById(slot.definitionId);
  if (!currentDef || slot.revealedTier == null) {
    return { ok: false, nextWalletSilver: walletSilver, nextDefinition: null, reason: 'house_not_owned' };
  }
  if (currentDef.upgradeCostSilver == null || slot.revealedTier >= 5) {
    return { ok: false, nextWalletSilver: walletSilver, nextDefinition: null, reason: 'max_tier' };
  }
  if (walletSilver < currentDef.upgradeCostSilver) {
    return { ok: false, nextWalletSilver: walletSilver, nextDefinition: null, reason: 'not_enough_silver' };
  }
  const nextTier = (slot.revealedTier + 1) as HouseTier;
  const nextDefinition = pickRandomHouseDefinitionByTier(nextTier, rng);
  slot.revealedTier = nextTier;
  slot.definitionId = nextDefinition.id;
  return { ok: true, nextWalletSilver: walletSilver - currentDef.upgradeCostSilver, nextDefinition };
}

export function getHouseDefinitions(): ReadonlyArray<HouseDefinition> {
  return DEFINITIONS;
}

/** Ba Nén Nhang: debuff riêng cho người không phải chủ khi đi ngang/đạp trúng. */
export function getHouseVisitorPenalty(definitionId: string | null, isLanding: boolean): HouseVisitorPenalty {
  if (definitionId !== 'ba_nen_nhang') {
    return { hpRatioLoss: 0, statusDelta: {} };
  }
  if (isLanding) {
    return {
      hpRatioLoss: 0.13,
      statusDelta: { thirst: -10, hunger: -10, spirit: -13 }
    };
  }
  return {
    hpRatioLoss: 0.05,
    statusDelta: {}
  };
}

/** Ảnh sát môn: tinh thần dư được chuyển 50% thành max tinh thần (không hồi phần max mới tăng). */
export function applySpiritGainWithHouseOverflow(
  definitionId: string | null,
  currentSpirit: number,
  currentSpiritCap: number,
  spiritGain: number
): HouseSpiritOverflowResult {
  const cap = Math.max(0, Number.isFinite(currentSpiritCap) ? currentSpiritCap : 100);
  const baseSpirit = Math.max(0, Number.isFinite(currentSpirit) ? currentSpirit : 0);
  const gain = Math.max(0, Number.isFinite(spiritGain) ? spiritGain : 0);
  const rawNext = baseSpirit + gain;
  if (definitionId !== 'anh_sat_mon' || rawNext <= cap) {
    return { nextSpirit: Math.min(cap, rawNext), nextSpiritCap: cap, overflowConvertedToCap: 0 };
  }
  const overflow = rawNext - cap;
  const converted = overflow * 0.5;
  return {
    nextSpirit: cap,
    nextSpiritCap: cap + converted,
    overflowConvertedToCap: converted
  };
}

/** Ảnh sát môn: nếu không trả đủ thuế thì nhận phạt theo HP hiện tại. */
export function shouldTriggerAssassinTaxPunishment(definitionId: string | null, expectedTax: number, paidTax: number): boolean {
  return definitionId === 'anh_sat_mon' && expectedTax > paidTax;
}