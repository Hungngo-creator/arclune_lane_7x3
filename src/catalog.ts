// @ts-check
//v0.8
// 1) Rank multiplier (đơn giản) — áp lên TẤT CẢ stat trừ SPD
import { kitSupportsSummon } from './utils/kit.ts';

import type {
  CatalogStatBlock,
  RosterUnitDefinition,
  UnitKitConfig,
  UnitKitMap,
} from './types/config.ts';
import type { UnitId } from '@shared-types/units';
import type { UnknownRecord } from '@shared-types/common';

export interface RosterKitDefinition
  extends Omit<UnitKitConfig, 'ult' | 'onSpawn' | 'passives' | 'traits'>,
    UnknownRecord {
  onSpawn?: UnknownRecord | null;
  basic?: UnknownRecord | null;
  skills?: ReadonlyArray<UnknownRecord> | null;
  ult?: UnknownRecord | null;
  talent?: UnknownRecord | null;
  technique?: UnknownRecord | null;
  passives?: ReadonlyArray<UnknownRecord> | null;
  traits?: ReadonlyArray<UnknownRecord> | null;
}

export type RosterEntry = Omit<RosterUnitDefinition, 'kit'> & {
  kit: RosterKitDefinition;
};

const asUnknownRecord = <T extends UnknownRecord>(value: T): UnknownRecord => value;

const asUnknownRecordArray = <T extends UnknownRecord>(
  value: ReadonlyArray<T>,
): ReadonlyArray<UnknownRecord> => value;

const isObjectLike = (value: unknown): value is Record<string, unknown> => (
  !!value && typeof value === 'object' && !Array.isArray(value)
);

const asUnitKitConfig = (value: unknown): UnitKitConfig | null => (
  isObjectLike(value) ? (value as UnitKitConfig) : null
);

export const RANK_MULT = {
  N: 0.80,
  R: 0.90,
  SR: 1.05,
  SSR: 1.25,
  UR: 1.50,
  Prime: 1.80,
} satisfies Readonly<Record<'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'Prime', number>>;

export type RankName = keyof typeof RANK_MULT;

// 2) Class base (mốc lv1 để test). SPD không chịu rank multiplier.
export const CLASS_BASE = {
  Mage:     { HP:360, ATK:28, WIL:30, ARM:0.08, RES:0.12, AGI:10, PER:12, SPD:1.00, AEmax:110, AEregen: 8.0, HPregen:14 },
  Tanker:   { HP:500, ATK:22, WIL:20, ARM:0.18, RES:0.14, AGI: 9, PER:10, SPD:0.95, AEmax: 60, AEregen: 4.0, HPregen:22 },
  Ranger:   { HP:360, ATK:35, WIL:16, ARM:0.08, RES:0.08, AGI:12, PER:14, SPD:1.20, AEmax: 75, AEregen: 7.0, HPregen:12 },
  Warrior:  { HP:400, ATK:30, WIL:18, ARM:0.14, RES:0.08, AGI:11, PER:11, SPD:1.10, AEmax: 70, AEregen: 6.0, HPregen:16 },
  Summoner: { HP:330, ATK:22, WIL:26, ARM:0.08, RES:0.14, AGI:10, PER:10, SPD:1.05, AEmax: 90, AEregen: 8.5, HPregen:18 },
  Support:  { HP:380, ATK:24, WIL:24, ARM:0.10, RES:0.13, AGI:10, PER:11, SPD:1.00, AEmax:100, AEregen: 7.5, HPregen:20 },
  Assassin: { HP:320, ATK:36, WIL:16, ARM:0.06, RES:0.08, AGI:14, PER:16, SPD:1.25, AEmax: 65, AEregen: 6.0, HPregen:10 }
} satisfies Readonly<Record<'Mage' | 'Tanker' | 'Ranger' | 'Warrior' | 'Summoner' | 'Support' | 'Assassin', CatalogStatBlock>>;

export type ClassName = keyof typeof CLASS_BASE;

const isRankName = (value: string): value is RankName => value in RANK_MULT;
const isClassName = (value: string): value is ClassName => value in CLASS_BASE;

type MaybeUnitId = UnitId | string | null | undefined;

// 3) Helper: áp rank & mod (mods không áp vào SPD)
export function applyRankAndMods(
  base: CatalogStatBlock,
  rank: RankName,
  mods: Partial<Record<keyof CatalogStatBlock, number>> = {},
): CatalogStatBlock {
  const multiplier = RANK_MULT[rank] ?? 1;
  const out: CatalogStatBlock = { ...base };
  const keys = Object.keys(base) as Array<keyof CatalogStatBlock>;
  for (const key of keys){
    const baseValue = base[key] ?? 0;
    const mod = 1 + (mods?.[key] ?? 0);
    if (key === 'SPD') { // SPD không nhân theo bậc
      out[key] = Math.round(baseValue * mod * 100) / 100;
      continue;
    }
    const precision = (key === 'ARM' || key === 'RES') ? 100 : (key === 'AEregen' ? 10 : 1);
    out[key] = Math.round(baseValue * mod * multiplier * precision) / precision;
  }
  return out;
}

// 4) Roster (dex/meta) — 8 nhân vật, ngân sách mod bằng nhau (~+20% tổng, không đụng SPD)
//  - onSpawn.rage: 100 cho mọi unit từ deck (trừ leader). Revive không áp quy tắc này.
//  - kit.traits.summon / kit.ult.summon đánh dấu Summoner -> kích hoạt Immediate Summon (action-chain).
export const ROSTER = [
  {
    id: 'diep_minh', name: 'Diệp Minh', class: 'Support', rank: 'SSR',
    mods: { HP: 0.06, WIL: 0.10, RES: 0.08, AEregen: 0.05 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true, aura: { id: 'thien_diep', regenPercentMaxHPPerTurn: 0.02 } }),
      basic: asUnknownRecord({
        name: 'Thảo Kiếm Đoạt',
        tags: ['single-target', 'seed'],
        damageMultiplier: 1.00,
        mark: { id: 'thuc_mach', maxStacks: 3, purgeable: false }
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Vệ Mộc Trấn Hộ',
          cost: { aether: 20 },
          targets: 'ally',
          shieldPercentMaxHP: 0.25,
          healPercentMaxHP: 0.06,
          duration: 2,
          notes: 'Gieo mộc khí thành khiên ôm lấy đồng minh, hồi 6% Max HP và tạo lá chắn bằng 25% Max HP trong 2 lượt.'
        },
        {
          key: 'skill2',
          name: 'Thực Linh Dẫn Lộ',
          cost: { aether: 25 },
          duration: 3,
          field: { id: 'thuc_linh_tran', affects: 'team', regenPercentMaxHPPerTurn: 0.04, bonusRES: 0.12 },
          notes: 'Trải thảm thực linh 3 lượt, cấp mọi đồng minh hồi phục 4% Max HP mỗi lượt và +12% RES.'
        },
        {
          key: 'skill3',
          name: 'Liên Đằng Phong Tỏa',
          cost: { aether: 30 },
          aoe: 'line',
          damageMultiplier: 1.10,
          root: { turns: 1 },
          spreadMark: { id: 'thuc_mach', stacks: 1, targets: 2 },
          notes: 'Chém quét thành dây leo siết chặt, gây 110% sát thương đòn đánh thường, trói chân 1 lượt và lan 1 tầng Thực Mạch sang tối đa 2 kẻ địch.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'field',
        duration: 3,
        aura: {
          allies: { healPercentMaxHPPerTurn: 0.05, shieldPercentMaxHP: 0.12 },
          enemies: { damageTaken: 0.12, rootOnEntryTurns: 1 }
        },
        notes: 'Khai mở “Thiên Diệp Bảo Hộ” trong 3 lượt: đồng minh trong vùng nhận hồi 5% Max HP và lá chắn 12% Max HP mỗi lượt; kẻ địch lần đầu bước vào bị trói 1 lượt và tăng 12% sát thương gánh chịu.'
      }),
      talent: asUnknownRecord({
        name: 'Lâm Ý Vĩnh Thịnh',
        mark: {
          id: 'thuc_mach',
          kind: 'mark',
          maxStacks: 3,
          purgeable: false,
          onCap: { immobilize: { turns: 1 } }
        },
        aura: { regenPercentMaxHPPerTurn: 0.02, bonusShieldPower: 0.10 }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'thuc_mach_basic',
          name: 'Ấn Mộc Gieo Hạt',
          when: 'onBasicHit',
          effect: 'placeMark',
          params: { id: 'thuc_mach', stacks: 1, maxStacks: 3, purgeable: false }
        },
        {
          id: 'thien_diep_aura',
          name: 'Thực Mộc Gia Trì',
          when: 'onBattlefield',
          effect: 'teamAura',
          params: { affects: 'adjacentAllies', regenPercentMaxHPPerTurn: 0.02, bonusRES: 0.08 }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'auto_cast_ult', text: 'Ultimate auto-cast khi đầy nộ theo luật chung.' },
        { id: 'lore_lam_aura', text: 'Aura thực vật bao phủ thân kiếm, SVG cần hiệu ứng sương lá chuyển động quanh áo choàng.' }
      ])
    }
  },
  {
    id: 'nguyet_san', name: 'Nguyệt San', class: 'Assassin', rank: 'UR',
    mods: { ATK: 0.10, PER: 0.12, SPD: 0.10 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true, stealth: { turns: 1 } }),
      basic: asUnknownRecord({
        name: 'Ảnh Nguyệt Đoạn',
        tags: ['single-target', 'blink'],
        damageMultiplier: 1.05,
        reposition: { type: 'behindTarget' },
        notes: 'Đột kích phía sau mục tiêu với 105% sát thương và lùi về vị trí cũ.'
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Huyền Nguyệt Ẩn Tích',
          cost: { aether: 25 },
          duration: 2,
          stealth: { turns: 2, breakOnAttack: false },
          dodgeAll: 0.30,
          notes: 'Tàng hình 2 lượt, tăng 30% né mọi đòn. Không mất tàng hình khi dùng kỹ năng dịch chuyển.'
        },
        {
          key: 'skill2',
          name: 'Nguyệt Ảnh Hoán Thân',
          cost: { aether: 30 },
          teleport: { range: 'anyShadow', createsShadow: true },
          buffStats: { SPD: 0.15, PER: 0.10 },
          duration: 2,
          notes: 'Đặt dấu ấn bóng tại vị trí hiện tại, dịch chuyển đến mục tiêu tùy chọn rồi +15% SPD, +10% PER trong 2 lượt.'
        },
        {
          key: 'skill3',
          name: 'Nguyệt Diệt Ảnh Phạt',
          cost: { aether: 35 },
          aoe: 'circle',
          damageMultiplier: 1.60,
          executesBelowPercentHP: 0.25,
          nightmarkDetonation: { id: 'nguyet_an', bonusDamage: 0.30 },
          notes: 'Bùng nổ ánh trăng quanh bóng đứng, gây 160% sát thương; mục tiêu dưới 25% HP bị kết liễu. Kích nổ mọi Nguyệt Ấn gây thêm 30% sát thương.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'blink-assassinate',
        damageMultiplier: 3.20,
        pierce: { ARM: 0.30, RES: 0.30 },
        guaranteeCrit: true,
        refundsStealth: true,
        notes: '“Huyết Nguyệt Định Mệnh”: lao qua bóng tối đến kẻ thù có Nguyệt Ấn gần nhất, gây 320% sát thương xuyên 30% ARM/RES và tái kích hoạt trạng thái ẩn thân.'
      }),
      talent: asUnknownRecord({
        name: 'Nguyệt Ảnh Ấn',
        mark: { id: 'nguyet_an', kind: 'mark', maxStacks: 5, purgeable: false, decayIfNoRefreshTurns: 2 },
        shadowRecall: { cooldown: 2 }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'nguyet_an_basic',
          name: 'Ảnh Nguyệt Lưu Tích',
          when: 'onHit',
          effect: 'placeMark',
          params: { id: 'nguyet_an', stacks: 1, maxStacks: 5, purgeable: false, decayIfNoRefreshTurns: 2 }
        },
        {
          id: 'shadow_gate',
          name: 'Liên Ảnh Môn',
          when: 'onShadowRecall',
          effect: 'resetCooldown',
          params: { skills: ['skill1'], bonusDamageNextHit: 0.25 }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'auto_cast_ult', text: 'Ultimate auto-cast khi đầy nộ theo luật chung.' },
        { id: 'lore_nguyet', text: 'SVG cần haze trăng chuyển động che mặt và váy tầng bóng tối, kèm hiệu ứng dịch chuyển.' }
      ])
    }
  },
  {
    id: 'trung_lam', name: 'Trùng Lâm', class: 'Summoner', rank: 'SSR',
    mods: { HP: 0.12, ATK: 0.06, ARM: 0.10 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true, bonusSummonArmor: 0.10 }),
      basic: asUnknownRecord({
        name: 'Sừng Lâm Trảm',
        tags: ['single-target', 'beast'],
        damageMultiplier: 1.10,
        knockback: 1,
        notes: 'Húc bằng sừng lá, gây 110% sát thương và đẩy lùi mục tiêu 1 ô nếu có.'
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Hống Lâm Triệu Tập',
          cost: { aether: 25 },
          summon: {
            id: 'lam_ho_ve',
            inherit: { HP: 0.60, ATK: 0.60, ARM: 0.20 },
            ttl: 4,
            limit: 1,
            replace: 'refresh'
          },
          notes: 'Triệu hồi Lâm Hộ Vệ trong 4 lượt, thừa hưởng 60% chỉ số và 20% ARM bonus. Nếu đã tồn tại sẽ làm mới thời gian.'
        },
        {
          key: 'skill2',
          name: 'Giáp Gai Nguyên Sinh',
          cost: { aether: 20 },
          duration: 3,
          buffStats: { ARM: 0.25, RES: 0.15 },
          thorns: { percentDamage: 0.20 },
          appliesToSummons: true,
          notes: 'Phủ giáp gai cho bản thân và Lâm Hộ Vệ, +25% ARM, +15% RES và phản 20% sát thương cận chiến trong 3 lượt.'
        },
        {
          key: 'skill3',
          name: 'Sinh Lâm Hồi Sinh',
          cost: { aether: 30 },
          healPercentMaxHP: 0.18,
          reviveSummon: true,
          buffStats: { ATK: 0.12 },
          duration: 2,
          notes: 'Hấp thụ aether rừng để hồi 18% Max HP cho bản thân, hồi sinh Lâm Hộ Vệ đã ngã gục và tăng 12% ATK cho cả hai trong 2 lượt.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'roar',
        aoe: 'allEnemies',
        debuffs: [{ id: 'weaken', amount: 0.15, turns: 2 }, { id: 'slow', amount: 0.20, turns: 2 }],
        summonEmpower: { id: 'lam_ho_ve', bonus: { damage: 0.25, lifesteal: 0.15 }, turns: 2 },
        notes: '“Vương Lâm Thú Khiếu” làm run sợ toàn chiến trường: mọi địch -15% sát thương, -20% SPD trong 2 lượt; Lâm Hộ Vệ nhận +25% sát thương và 15% hút máu.'
      }),
      talent: asUnknownRecord({
        name: 'Lâm Uy Ngự Địa',
        summonBond: { id: 'lam_ho_ve', sharedHP: 0.20 },
        aura: { allies: 'nature', stats: { ATK: 0.08 } }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'lam_ho_ve_guard',
          name: 'Thú Hộ Vệ',
          when: 'onAllyTargeted',
          effect: 'intercept',
          params: { summonId: 'lam_ho_ve', chance: 0.30 }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'auto_cast_ult', text: 'Ultimate auto-cast khi đầy nộ theo luật chung.' },
        { id: 'svg_beast', text: 'SVG cần thể hiện hình thái dị thú bốn chân và tách riêng companion “Lâm Hộ Vệ”.' }
      ])
    }
  },
  {
    id: 'huyet_tich', name: 'Huyết Tịch', class: 'Mage', rank: 'UR',
    mods: { WIL: 0.14, AEregen: 0.12, HP: 0.08 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true, bloodReserve: 40 }),
      basic: asUnknownRecord({
        name: 'Huyết Đoạt',
        tags: ['single-target', 'drain'],
        lifesteal: 0.15,
        damageMultiplier: 1.00,
        notes: 'Mỗi đòn đánh thường hút 15% sát thương gây ra để nuôi hồ huyết.'
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Huyết Trướng Bảo Hộ',
          cost: { aether: 25 },
          duration: 2,
          shieldPercentCasterMaxHP: 0.35,
          convertDamageToBlood: 0.30,
          notes: 'Tạo màn huyết bảo hộ 2 lượt: nhận lá chắn 35% Max HP của Huyết Tịch, 30% sát thương nhận vào chuyển thành tích lũy huyết hồ.'
        },
        {
          key: 'skill2',
          name: 'Huyết Chú Phản Hồi',
          cost: { aether: 30 },
          duration: 3,
          link: { sharePercent: 0.35, targets: 1 },
          healPercentDamage: 0.30,
          notes: 'Kết huyết với một đồng minh: chuyển 35% sát thương họ nhận sang Huyết Tịch và hồi lại 30% lượng đó.'
        },
        {
          key: 'skill3',
          name: 'Huyết Độc Triều',
          cost: { aether: 35 },
          aoe: 'cone',
          damageMultiplier: 1.40,
          applyPoison: { id: 'huyet_doc', stacks: 2, maxStacks: 6 },
          notes: 'Phun huyết độc phạm vi hình nón, gây 140% sát thương và đặt 2 tầng Huyết Độc (tối đa 6).' 
        }
      ]),
      ult: asUnknownRecord({
        type: 'bloodstorm',
        aoe: 'allEnemies',
        damageMultiplier: 2.20,
        detonatePoison: { id: 'huyet_doc', bonusPerStack: 0.12 },
        healAlliesFromTotal: { percent: 0.30, distribute: 'lowestHP' },
        notes: '“Huyết Tịch Chiến Vũ” dâng bão máu quét toàn chiến trường: gây 220% sát thương, kích nổ Huyết Độc mỗi tầng thêm 12% sát thương và chữa 30% tổng sát thương cho đồng minh HP thấp nhất.'
      }),
      talent: asUnknownRecord({
        name: 'Nguyên Huyết Chi Chủ',
        resource: { id: 'blood_reserve', max: 100 },
        conversion: { per10: { healPercentMaxHP: 0.03, damageBonus: 0.04 } },
        mark: { id: 'huyet_doc', kind: 'poison', maxStacks: 6, purgeable: true }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'blood_reserve_gain',
          name: 'Hồ Huyết Vô Tận',
          when: 'onDamageDealt',
          effect: 'gainResource',
          params: { resourceId: 'blood_reserve', amountPerPercentHP: 2 }
        },
        {
          id: 'blood_reserve_spend',
          name: 'Tế Huyết Cường Hoá',
          when: 'onUltCast',
          effect: 'convertResource',
          params: { resourceId: 'blood_reserve', spendAll: true, bonusDamagePer10: 0.04 }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'auto_cast_ult', text: 'Ultimate auto-cast khi đầy nộ theo luật chung.' },
        { id: 'svg_blood', text: 'SVG bổ sung huyết cầu động quanh đầu và haze đỏ trắng bao phủ khuôn mặt.' }
      ])
    }
  },
  {
    id: 'khai_nguyen_tu', name: 'Khai Nguyên Tử', class: 'Mage', rank: 'UR',
    mods: { WIL: 0.12, AEmax: 0.15, AEregen: 0.12 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true, portalCharges: 2 }),
      basic: asUnknownRecord({
        name: 'Pháp Trượng Khai Thiên',
        tags: ['single-target', 'arcane'],
        damageMultiplier: 1.15,
        bonus: { aetherGain: 6 },
        notes: 'Đòn đánh thường chuyển hoá aether, hoàn lại 6 Aether khi trúng mục tiêu.'
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Nguyên Môn Huyễn Giới',
          cost: { aether: 20 },
          teleportAlly: { range: 'any', cleanseDebuff: 1 },
          buffStats: { RES: 0.15 },
          duration: 2,
          notes: 'Mở cổng dịch chuyển đồng minh đến vị trí bất kỳ và thanh tẩy 1 hiệu ứng xấu, +15% RES trong 2 lượt.'
        },
        {
          key: 'skill2',
          name: 'Triệu Hoán Nguyên Khí',
          cost: { aether: 25 },
          summon: {
            id: 'nguyen_khi_thap',
            inherit: { WIL: 0.70 },
            ttl: 3,
            limit: 1,
            forbiddenSkills: ['ult']
          },
          notes: 'Triệu hồi “Nguyên Khí Tháp” trong 3 lượt, khuếch đại đòn phép với 70% WIL của Khai Nguyên Tử.'
        },
        {
          key: 'skill3',
          name: 'Huyễn Thuật Đa Tầng',
          cost: { aether: 35 },
          duration: 3,
          stackingBuffs: [{ stats: { WIL: 0.08 }, trigger: 'turnEnd', maxStacks: 3 }],
          cooldown: 3,
          notes: 'Thi triển tầng phép liên hoàn: mỗi lượt cuối tăng 8% WIL (tối đa 3 tầng), tái sử dụng làm mới thời gian nhưng không vượt quá giới hạn.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'time-stop',
        duration: 1,
        skipEnemyTurns: 1,
        bonusAether: 30,
        summonEmpower: { id: 'nguyen_khi_thap', bonus: { pierceRES: 0.25 } },
        notes: '“Khai Thiên Định Cực” tạm dừng thời gian 1 lượt địch, hoàn trả 30 Aether cho phe ta và khiến Nguyên Khí Tháp xuyên 25% RES.'
      }),
      talent: asUnknownRecord({
        name: 'Nguyên Chú Khai Thế',
        portalCharges: 2,
        rechargePerTurn: 1,
        bonusAetherPerCharge: 5
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'portal_charge_gain',
          name: 'Tụ Khí Pháp Ấn',
          when: 'onTurnStart',
          effect: 'gainPortalCharge',
          params: { amount: 1, max: 3 }
        },
        {
          id: 'portal_spend_bonus',
          name: 'Chuyển Dịch Định Luật',
          when: 'onPortalUse',
          effect: 'grantBuff',
          params: { stats: { AEregen: 0.20 }, turns: 1 }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'auto_cast_ult', text: 'Ultimate auto-cast khi đầy nộ theo luật chung.' },
        { id: 'svg_portal', text: 'SVG cần phù văn bạc chuyển động quanh áo choàng và hiệu ứng cổng không gian phía sau.' }
      ])
    }
  },
  {
    id: 'thien_luu', name: 'Thiên Lưu', class: 'Ranger', rank: 'SSR',
    mods: { ATK: 0.08, PER: 0.08, SPD: 0.08 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true, weatherState: 'clear' }),
      basic: asUnknownRecord({
        name: 'Thiên Kiếm Thuần Quang',
        tags: ['single-target', 'flying'],
        damageMultiplier: 1.05,
        bonus: { accuracy: 0.15 },
        notes: 'Chém kiếm khí tinh khiết từ trên cao, +15% chính xác khi mục tiêu đang chịu debuff thời tiết.'
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Phong Vũ Dẫn Hướng',
          cost: { aether: 20 },
          duration: 2,
          weatherShift: 'storm',
          buffStats: { SPD: 0.12 },
          notes: 'Gọi gió mưa tạo trạng thái Bão trong 2 lượt và tăng 12% SPD cho bản thân.'
        },
        {
          key: 'skill2',
          name: 'Thiên Quang Liên Xạ',
          cost: { aether: 25 },
          hits: 3,
          targets: 'randomEnemies',
          damageMultiplier: 0.75,
          bonusDamageIfWeather: { weather: 'storm', amount: 0.20 },
          notes: 'Bắn ba luồng kiếm quang vào kẻ địch ngẫu nhiên, mỗi luồng 75% sát thương; nếu đang Bão, mỗi hit thêm 20% sát thương.'
        },
        {
          key: 'skill3',
          name: 'Tinh Không Phi Hành',
          cost: { aether: 30 },
          duration: 2,
          flying: true,
          dodgeRanged: 0.35,
          grantAlly: { shieldPercentMaxHP: 0.18, targets: 1 },
          notes: 'Bay lên tinh không 2 lượt, tăng 35% né đòn tầm xa và cấp 18% lá chắn Max HP cho 1 đồng minh bất kỳ.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'weather-control',
        weatherShift: 'aurora',
        damageMultiplier: 2.60,
        aoe: 'allEnemies',
        debuffs: [{ id: 'accuracy_down', amount: 0.20, turns: 2 }],
        alliesBuff: { critRate: 0.20, turns: 2 },
        notes: '“Thiên Lưu Tụ Quang” triệu hồi cực quang: gây 260% sát thương toàn địch, giảm 20% chính xác của chúng trong 2 lượt và ban +20% tỉ lệ chí mạng cho đồng minh.'
      }),
      talent: asUnknownRecord({
        name: 'Sứ Mệnh Khí Tượng',
        weatherCycle: ['clear', 'storm', 'aurora'],
        bonusPerWeather: {
          clear: { ATK: 0.05 },
          storm: { SPD: 0.08 },
          aurora: { critDamage: 0.20 }
        }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'weather_followup',
          name: 'Lạc Không Hồi Âm',
          when: 'onWeatherShift',
          effect: 'grantFollowUp',
          params: { damageMultiplier: 1.00, expiresAfter: 1 }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'auto_cast_ult', text: 'Ultimate auto-cast khi đầy nộ theo luật chung.' },
        { id: 'svg_weather', text: 'SVG cần mũ ánh sáng và aurora, bổ sung tia sét quanh áo choàng trong suốt.' }
      ])
    }
  },
  {
    id: 'mong_yem', name: 'Mộng Yểm', class: 'Support', rank: 'UR',
    mods: { WIL: 0.12, AEregen: 0.08 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target', 'sleep-setup'],
        debuff: { id: 'me_hoac', stacks: 1, maxStacks: 3, purgeable: false }
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Huyễn Ảnh Che Màn',
          cost: { aether: 30 },
          duration: 3,
          selfBuff: { dodgeBasic: 0.50 },
          notes: 'Giảm 50% tỉ lệ bị đòn đánh thường trúng trong 3 lượt (tính cả lượt kích hoạt).'
        },
        {
          key: 'skill2',
          name: 'Thụy Ca Tự Miên',
          cost: { aether: 35 },
          duration: 3,
          delayTurns: 0,
          selfSleep: true,
          reduceDamage: 0.50,
          perTurnBuffStats: { ATK: 0.07, WIL: 0.07 },
          notes: 'Trong thời gian ngủ không thể hành động; mỗi lượt đang ngủ cộng 7% ATK/WIL. Tự thức khi HP ≤ 30% hoặc người chơi huỷ thủ công.'
        },
        {
          key: 'skill3',
          name: 'Phá Mộng Tàn Ca',
          cost: { aether: 25 },
          damageMultiplier: 1.80,
          bonusPerMark: { id: 'me_hoac', amount: 0.20, max: 0.60 },
          pierceIfSleeping: { ARM: 0.30, RES: 0.30 },
          spreadMark: { id: 'me_hoac', stacks: 1, targets: 2 },
          notes: 'Không tính là đòn đánh thường; ưu tiên mục tiêu đang có Mê Hoặc. Nếu mục tiêu ngủ, bỏ qua 30% ARM/RES và lan 1 tầng Mê Hoặc sang tối đa 2 kẻ địch khác.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'worldshift',
        duration: 3,
        randomBuffs: { allies: 1, enemies: 1 },
        notes: 'Tạo “Thế Giới Thứ Hai” trong 3 lượt: mỗi đồng minh hiện hữu và khi vào sân nhận 1 buff ngẫu nhiên; mỗi kẻ địch nhận 1 debuff ngẫu nhiên.'
      }),
      talent: asUnknownRecord({
        name: 'Mê Ca Dẫn Thụy',
        mark: {
          id: 'me_hoac',
          kind: 'mark',
          maxStacks: 3,
          purgeable: false,
          onCap: { sleep: { turns: 1 } },
          decayIfNoRefreshTurns: null
        }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'me_hoac_apply',
          name: 'Mê Ca Dẫn Thụy',
          when: 'onAbilityHit',
          effect: 'placeMark',
          params: {
            id: 'me_hoac',
            stacks: 1,
            maxStacks: 3,
            purgeable: false,
            sleepTurnsOnCap: 1
          }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'sleep_reset', text: 'Khi đạt 3 tầng Mê Hoặc, mục tiêu ngủ 1 lượt rồi đặt lại về 0 tầng.' },
        { id: 'self_sleep_control', text: 'Thụy Ca Tự Miên có thể được hủy sớm bằng thao tác thủ công; tự thức khi HP ≤ 30%.' }
      ])
    }
  },
  {
    id: 'chan_nga', name: 'Chân Ngã', class: 'Summoner', rank: 'UR',
    mods: { HP: 0.10, WIL: 0.10 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true, bonusMaxHPPercent: 0.10 }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target']
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Liên Ảnh Hồi Tức',
          cost: { aether: 30 },
          healSelfPercentMaxHP: 0.06,
          healClonePercentMaxHP: 0.04,
          notes: 'Chia 10% hồi máu dựa trên Max HP: 6% cho bản thể, 4% cho clone nếu tồn tại.'
        },
        {
          key: 'skill2',
          name: 'Cộng Lực Ảnh Thân',
          cost: { aether: 25 },
          duration: 3,
          buffStats: { ATK: 0.10, WIL: 0.10 },
          appliesToClone: true,
          notes: 'Buff đồng thời bản thể và clone; tái kích hoạt làm mới thời gian.'
        },
        {
          key: 'skill3',
          name: 'Quy Nhất Bản Ảnh',
          cost: { aether: 40 },
          cooldown: 3,
          requiresCloneAdjacent: true,
          shieldPercentMaxHP: 0.50,
          duration: 3,
          burstBuff: { stats: { ATK: 0.15, WIL: 0.15 }, turns: 2 },
          notes: 'Tiêu biến clone đứng kề, hợp nhất để nhận khiên = 50% Max HP trong 3 lượt và +15% ATK/WIL trong 2 lượt.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'clone-summon',
        conditions: { requiresNoClone: true, minHpPercent: 0.60 },
        summon: {
          id: 'chan_nga_clone',
          inheritPercent: 0.85,
          forbiddenSkills: ['skill3'],
          ttl: 6,
          locksUlt: true,
          rageLocked: true
        },
        hpTradePercentCurrent: 0.50,
        notes: 'Giảm 50% HP hiện tại của bản thể để triệu hồi clone 85% chỉ số. Clone tồn tại tối đa 6 lượt, không thể dùng Quy Nhất Bản Ảnh, không tích nộ.'
      }),
      talent: asUnknownRecord({
        name: 'Dự Phòng Chân Thể',
        cloneSnapshotPercent: 0.85,
        cloneTtlTurns: 6,
        postDeathTransfer: { status: 'doat_xa', debuff: { id: 'linh_met', turns: 3, aetherRegen: -0.50 }, lockUlt: true }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'clone_on_ult',
          name: 'Thứ Hai Chân Thân',
          when: 'onUltCast',
          effect: 'summonClone',
          params: {
            inheritPercent: 0.85,
            ttl: 6,
            forbiddenSkills: ['skill3'],
            rageLocked: true
          }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'clone_limit', text: 'Chỉ duy trì 1 clone cùng lúc; ult thất bại nếu không còn ô trống.' },
        { id: 'doat_xa', text: 'Nếu bản thể tử vong khi có clone, đoạt xá vào clone và chịu Linh Mệt 3 lượt (khóa Ultimate, -50% hồi Aether).' }
      ])
    }
  },
  {
    id: 'ma_ton_diep_lam', name: 'Ma Tôn - Diệp Lâm', class: 'Mage', rank: 'UR',
    mods: { WIL: 0.12, AEmax: 0.08 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true, bonusSPDPercent: 0.10 }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target', 'mark-builder'],
        debuff: { id: 'ma_chung', stacks: 1, purgeable: false }
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Thôn Chủng Dưỡng Thể',
          cost: { aether: 30 },
          consumeMarks: { id: 'ma_chung', scope: 'all' },
          bonusPerMark: { stat: 'HP', amount: 0.05 },
          notes: 'Thu hồi toàn bộ Ma Chủng trên chiến trường, mỗi tầng chuyển thành +5% Max HP tạm thời.'
        },
        {
          key: 'skill2',
          name: 'Ma Chủ Hiển Thân',
          cost: { aether: 25 },
          requiresTotalMarks: { id: 'ma_chung', amount: 12 },
          stance: 'ma_chu',
          notes: 'Khi tổng Ma Chủng ≥ 12, thu hồi Ma Chủng trên một mục tiêu để hoá Ma Chủ: mất quyền dùng Ultimate và mọi Ma Chủng cấy tiếp gây thêm +2% sát thương cuối dạng Thuật.'
        },
        {
          key: 'skill3',
          name: 'Nhiếp Chủng Song Chưởng',
          cost: { aether: 25 },
          countsAsBasic: true,
          hits: 2,
          damageMultiplier: 1.00,
          priorityTarget: 'ma_chung',
          splash: { ratio: 0.70, maxTargets: 2 },
          notes: 'Đánh hai lần vào mục tiêu có Ma Chủng gần nhất, mỗi lần lan 70% sát thương sang tối đa 2 kẻ địch lân cận.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'mark-detonation',
        aoe: 'allEnemies',
        markId: 'ma_chung',
        damagePerMark: { percentTargetMaxHP: 0.05, scaleWIL: 0.00 },
        debuffPerThreshold: { stacks: 2, effects: [{ id: 'fear', turns: 1 }, { id: 'bleed', turns: 1 }] },
        notes: 'Kích hoạt toàn bộ Ma Chủng trên kẻ địch, mỗi tầng gây 5% Max HP của mục tiêu dưới dạng sát thương WIL. Mỗi 2 tầng áp Sợ Hãi và Chảy Máu 1 lượt; Ma Chủng bị tiêu hao.'
      }),
      talent: asUnknownRecord({
        name: 'Chú Ấn Ma Chủng',
        mark: {
          id: 'ma_chung',
          kind: 'mark',
          maxStacks: null,
          purgeable: false,
          decayIfNoRefreshTurns: 3
        }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'ma_chung_apply',
          name: 'Chú Ấn Ma Chủng',
          when: 'onBasicHit',
          effect: 'placeMark',
          params: { id: 'ma_chung', stacks: 1, purgeable: false, decayIfNoRefreshTurns: 3 }
        },
        {
          id: 'ma_chu_bonus',
          name: 'Ma Chủ Hiển Thân',
          when: 'onMarkApplied',
          effect: 'gainDamageBonus',
          params: { markId: 'ma_chung', amount: 0.02, type: 'arcane', stance: 'ma_chu' }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'ma_chung_decay', text: 'Ma Chủng mất sau 3 lượt không được cấy thêm; không có trần cộng dồn.' },
        { id: 'ma_chu_lock', text: 'Ở trạng thái Ma Chủ, Diệp Lâm không thể dùng Tuyệt kỹ.' }
      ])
    }
  },
  {
    id: 'vu_thien', name: 'Vũ Thiên', class: 'Warrior', rank: 'SSR',
    mods: { HP: 0.05, ATK: 0.08, WIL: 0.06 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target'],
        damageMultiplier: 1.00,
        notes: 'Vung đinh ba gây 100% ATK + 100% WIL. Ở trạng thái Ánh Sáng, đòn đánh thường hồi 10% sát thương gây ra.'
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Lam Triều Bộc Lực',
          cost: { aether: 35 },
          duration: 1,
          buffStats: { ATK: 0.40, WIL: 0.40 },
          notes: 'Tăng 40% ATK/WIL trong 1 lượt, thích hợp mở chuỗi burst.'
        },
        {
          key: 'skill2',
          name: 'Hải Mâu Phá Lãng',
          cost: { aether: 25 },
          damageMultiplier: 1.50,
          tags: ['single-target'],
          notes: 'Phóng đinh ba gây 150% đòn đánh thường lên 1 mục tiêu rồi thu hồi vũ khí.'
        },
        {
          key: 'skill3',
          name: 'Triều Ảnh Hồi Kích',
          cost: { aether: 30 },
          duration: 1,
          counterChance: 0.25,
          dodgeBasicChance: 0.25,
          counterType: 'basic',
          notes: 'Kích hoạt trạng thái phản công: trong 1 lượt, mỗi lần bị đánh có 25% né và phản đòn cơ bản. Nếu ngã gục phải kích lại.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'burst',
        tags: ['single-target'],
        damageMultiplier: 3.00,
        debuffs: [{ id: 'tram_mac', turns: 1 }],
        selfBuff: { adaptive: true, turns: 1 },
        notes: 'Hải Uy Trảm Ngôn gây 300% sát thương, đặt Trầm Mặc 1 lượt và cấp "Thích Ứng" cho bản thân.'
      }),
      talent: null,
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'hai_trieu_khai_tran',
          name: 'Hải Triều Khai Trận',
          when: 'onSpawn',
          effect: 'grantStats',
          params: { stats: { ATK: 0.05, WIL: 0.05 }, stackable: false }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'counter_mode', text: 'Triều Ảnh Hồi Kích là hiệu ứng duy trì 1 lượt, mất khi bị hạ gục.' },
        { id: 'adaptive_buff', text: 'Thích Ứng dùng thông số phòng thủ chuẩn của hệ thống.' }
      ])
    }
  },
  {
    id: 'anna', name: 'Anna', class: 'Support', rank: 'SSR',
    mods: { HP: 0.08, WIL: 0.06, AEmax: 0.05 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target', 'heal'],
        damageMultiplier: 1.00,
        healRandomAllyPercentMaxHP: 0.03,
        notes: 'Gây sát thương 100% ATK + WIL và hồi 3% Max HP của Anna cho 1 đồng minh ngẫu nhiên.'
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Aegis Tụ Linh',
          cost: { aether: 20 },
          duration: 2,
          buffStats: { ARM: 0.20, RES: 0.20 },
          notes: 'Tăng 20% ARM/RES trong 2 lượt.'
        },
        {
          key: 'skill2',
          name: 'Huyết Tế Vương Tọa',
          cost: { aether: 25 },
          hpSacrificePercentMax: 0.50,
          transferToLeader: true,
          minHpPercentToCast: 0.70,
          notes: 'Hiến 50% Max HP hiện tại (không giảm Max HP) cho Leader, chỉ dùng khi HP ≥ 70%.'
        },
        {
          key: 'skill3',
          name: 'Hỗn Linh Trường Ca',
          cost: { aether: 20 },
          targets: 2,
          damageMultiplier: 1.40,
          tags: ['multi-target'],
          notes: 'Đánh ngẫu nhiên 2 kẻ địch, mỗi mục tiêu nhận 140% đòn đánh thường.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'heal',
        tags: ['team-heal'],
        healPercentMaxHP: 0.50,
        healScale: { ATK: 0.20, WIL: 0.20 },
        affects: 'allAllies',
        notes: 'Thánh Lễ Tái Sinh hồi 50% Max HP + 20% ATK/WIL cho toàn bộ đồng minh.'
      }),
      talent: asUnknownRecord({
        name: 'Ấn Chú Thăng Hoa',
        stacks: 5,
        perStack: { HP: 0.05, ATK: 0.05, WIL: 0.05 },
        trigger: 'onUltCast'
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'an_chu_thang_hoa',
          name: 'Ấn Chú Thăng Hoa',
          when: 'onUltCast',
          effect: 'stackBuff',
          params: { stats: { HP: 0.05, ATK: 0.05, WIL: 0.05 }, maxStacks: 5 }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'blood_transfer', text: 'Huyết Tế Vương Tọa chuyển thẳng HP nên chịu các hệ số tăng/giảm hồi máu của người nhận.' },
        { id: 'auto_cast_ult', text: 'Ultimate auto-cast khi đầy nộ theo luật chung.' }
      ])
    }
  },
  {
    id: 'lao_khat_cai', name: 'Lão Khất Cái', class: 'Warrior', rank: 'SR',
    mods: { ATK: 0.06, AGI: 0.05 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target'],
        damageMultiplier: 1.00,
        notes: 'Đánh gậy gây 100% ATK + WIL lên 1 mục tiêu.'
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Khất Côn Xuyên Tạng',
          cost: { aether: 20 },
          countsAsBasic: true,
          damageMultiplier: 1.00,
          pierce: { ARM: 0.15, RES: 0.15 },
          notes: 'Đòn đánh thường gia tăng, bỏ qua 15% ARM/RES.'
        },
        {
          key: 'skill2',
          name: 'Tam Thập Lục Kế: Tẩu Vi Thượng',
          cost: { aether: 25 },
          duration: null,
          oneTime: true,
          evadeAoEChance: 0.25,
          reposition: { pattern: 'nearestAllySlot' },
          notes: 'Áp dụng hiệu ứng trốn AOE 1 lần: khi bị skill AOE nhắm trực tiếp có 25% chạy sang ô đồng minh trống gần nhất.'
        },
        {
          key: 'skill3',
          name: 'Loạn Côn Tam Liên',
          cost: { aether: 35 },
          hits: 3,
          randomTargets: 3,
          countsAsBasic: true,
          damageMultiplier: 1.00,
          pierce: { ARM: 0.20, RES: 0.20 },
          notes: 'Đánh ngẫu nhiên 3 mục tiêu, mỗi hit bỏ qua 20% ARM/RES.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'finisher',
        tags: ['single-target'],
        damageMultiplier: 2.50,
        pierce: { ARM: 0.10, RES: 0.10 },
        notes: 'Nhất Côn Đoạt Mệnh gây 250% sát thương và xuyên 10% phòng thủ.'
      }),
      talent: null,
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'tap_dan_tu_luc',
          name: 'Tạp Dân Tụ Lực',
          when: 'onBattlefield',
          effect: 'allyScaling',
          params: { excludeLeader: true, perAllyStats: { ATK: 0.02, WIL: 0.02, AGI: 0.02 } }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'taunt_immunity', text: 'Miễn nhiễm Khiêu Khích đến từ địch.' },
        { id: 'aoe_escape', text: 'Tẩu Vi Thượng không kích hoạt với AOE chọn mục tiêu ngẫu nhiên hay đòn đơn mục tiêu.' }
      ])
    }
  },
  {
    id: 'ai_lan', name: 'Ái Lân', class: 'Support', rank: 'UR',
    mods: { WIL: 0.12, AEregen: 0.10, HP: 0.06 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true, startingStance: 'light' }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target'],
        damageMultiplier: 1.00,
        debuffs: [{ id: 'agi_down', amount: 0.05, turns: 1, whenStance: 'light' }],
        pierce: { ARM: 0.10, RES: 0.10, whenStance: 'dark' },
        bonus: { dazeChance: 0.02 },
        notes: 'Ở Ánh Sáng: giảm 5% AGI và hồi 10% sát thương gây ra. Ở Bóng Tối: bỏ qua 10% ARM/RES. Đòn đánh có 2% làm Choáng.'
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Song Cực Hiến Phúc',
          cost: { aether: 25 },
          usableIn: ['light', 'dark'],
          transferHp: { toLeaderPercentMax: 0.20, toRandomAllyPercentMax: 0.10 },
          shields: [
            { target: 'leader', percentCasterMaxHP: 0.10, turns: 2 },
            { target: 'randomAlly', percentCasterMaxHP: 0.10, turns: 2 }
          ],
          notes: 'Chuyển HP cho Leader và 1 đồng minh ngẫu nhiên, đồng thời cấp khiên =10% Max HP bản thân trong 2 lượt.'
        },
        {
          key: 'skill2',
          name: 'D’moreth • Hắc Tế Tam Ấn',
          cost: { aether: 25 },
          usableIn: ['dark'],
          pattern: 'random3',
          damageMultiplier: 0.70,
          tags: ['aoe'],
          notes: 'Chỉ dùng ở Bóng Tối: gây 70% đòn đánh thường lên 3 kẻ địch ngẫu nhiên, không tính là đòn đánh thường.'
        },
        {
          key: 'skill3',
          name: 'Thánh Minh Trùng Tụ',
          cost: { aether: 20 },
          usableIn: ['light'],
          healSelfScale: { ATK: 0.60, WIL: 0.60 },
          healRandomAllyScale: { ATK: 0.60, WIL: 0.60 },
          notes: 'Chỉ dùng ở Ánh Sáng: hồi 60% tổng ATK+WIL cho bản thân và 1 đồng minh ngẫu nhiên.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'dual-stance',
        light: {
          name: 'Khải Minh Thánh Lễ',
          healTargets: 3,
          healPercentMaxHP: 0.30,
          healScale: { ATK: 0.05, WIL: 0.05 }
        },
        dark: {
          name: 'Đọa Ảnh Tứ Hình',
          targets: 4,
          damageMultiplier: 0.75,
          countsAsBasic: false
        },
        notes: 'Ultimate phụ thuộc trạng thái hiện tại: Ánh Sáng hồi máu 3 đồng minh, Bóng Tối gây sát thương lên 4 kẻ địch ngẫu nhiên.'
      }),
      talent: asUnknownRecord({
        name: 'Thánh Ám Luân Chuyển',
        stanceCycle: ['light', 'dark'],
        turnOrder: 'alternate',
        lightEffects: { basicHealPercentDamage: 0.10, agiDownPercent: 0.05 },
        darkEffects: { pierce: 0.10 }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'stance_cycle',
          name: 'Thánh Ám Luân Chuyển',
          when: 'turnStart',
          effect: 'swapStance',
          params: { cycle: ['light', 'dark'], start: 'light' }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'stance_rules', text: 'Kỹ năng kiểm tra stance: nếu không đúng trạng thái sẽ bị vô hiệu.' },
        { id: 'dual_ult', text: 'Ultimate dùng biến thể tương ứng với stance tại thời điểm auto-cast.' }
      ])
    }
  },
  {
    id: 'faun', name: 'Faun', class: 'Summoner', rank: 'SSR',
    mods: { WIL: 0.08, AEregen: 0.08, HP: 0.04 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true, furyMax: 85 }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target'],
        damageMultiplier: 1.00,
        notes: 'Tấn công một mục tiêu bằng 100% ATK + WIL; thú triệu hồi kế thừa cách tính này.'
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Dã Linh Hiệp Kích',
          cost: { aether: 25 },
          chainAttack: true,
          summonFollowUp: true,
          notes: 'Faun và mỗi thú đang tồn tại lần lượt thực hiện 1 đòn đánh thường ngay lập tức, không tiêu lượt hiện tại.'
        },
        {
          key: 'skill2',
          name: 'Ấn Khế Cường Thừa',
          cost: { aether: 25 },
          empoweredSummons: { count: 5, inheritPercent: 0.80 },
          notes: '5 thú tiếp theo triệu hồi từ Ultimate được thừa hưởng 80% chỉ số của Faun thay vì 50%.'
        },
        {
          key: 'skill3',
          name: 'Thú Tế Hộ Mệnh',
          cost: { aether: 25 },
          healSelfPercentMaxHP: 0.07,
          gainTenacity: 1,
          deathTrigger: { sacrificeSummon: 'lowestHP', preferMarked: true },
          notes: 'Hồi 7% Max HP và nhận 1 Bất Khuất; khi Bất Khuất kích hoạt sẽ hi sinh thú HP thấp nhất (ưu tiên thú đã dính dấu từ kỹ năng này).' 
        }
      ]),
      ult: asUnknownRecord({
        type: 'summon-random',
        summon: {
          pool: [
            { id: 'faun_tieu_hac', inheritPercent: 0.50, ttl: 5, traits: ['pierce_arm_0_10'], tag: 'faun_beast' },
            { id: 'faun_tieu_bach', inheritPercent: 0.50, ttl: 5, traits: ['bonus_damage_0_05'], tag: 'faun_beast' },
            { id: 'faun_tieu_hoang', inheritPercent: 0.50, ttl: 5, traits: ['on_death_heal_faun_0_50'], tag: 'faun_beast' },
            { id: 'faun_tieu_bat_diem', inheritPercent: 0.50, ttl: 5, traits: ['heal_allies_0_30'], basicDealsDamage: false, tag: 'faun_beast' },
            { id: 'faun_nhi_cau', inheritPercent: 0.50, ttl: 5, traits: ['heal_self_0_10', 'periodic_taunt'], basicDealsDamage: false, tag: 'faun_beast' }
          ],
          limit: 1,
          uniquePerType: true
        },
        summonPool: [
          { id: 'faun_tieu_hac', inheritPercent: 0.50, ttl: 5, traits: ['pierce_arm_0_10'], tag: 'faun_beast' },
          { id: 'faun_tieu_bach', inheritPercent: 0.50, ttl: 5, traits: ['bonus_damage_0_05'], tag: 'faun_beast' },
          { id: 'faun_tieu_hoang', inheritPercent: 0.50, ttl: 5, traits: ['on_death_heal_faun_0_50'], tag: 'faun_beast' },
          { id: 'faun_tieu_bat_diem', inheritPercent: 0.50, ttl: 5, traits: ['heal_allies_0_30'], basicDealsDamage: false, tag: 'faun_beast' },
          { id: 'faun_nhi_cau', inheritPercent: 0.50, ttl: 5, traits: ['heal_self_0_10', 'periodic_taunt'], basicDealsDamage: false, tag: 'faun_beast' }
        ],
        limit: 1,
        uniquePerType: true,
        notes: 'Triệu hồi ngẫu nhiên 1 thú trong 5 loại, mỗi loại tồn tại tối đa 5 lượt và không trùng lặp.'
      }),
      talent: asUnknownRecord({
        name: 'Vạn Thú Đồng Hưởng',
        perSummonStats: { HP: 0.03, ATK: 0.03, WIL: 0.03, ARM: 0.03, RES: 0.03, AEregen: 0.03, AEmax: 0.03 },
        maxStacks: 5
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'summon_synergy',
          name: 'Vạn Thú Đồng Hưởng',
          when: 'onSummonStateChange',
          effect: 'scalePerSummon',
          params: { perSummonStats: { HP: 0.03, ATK: 0.03, WIL: 0.03, ARM: 0.03, RES: 0.03, AEregen: 0.03, AEmax: 0.03 }, maxStacks: 5 }
        },
        {
          id: 'faun_beast_resist',
          name: 'Đồng Bộ Thú Linh',
          when: 'onDamageTaken',
          effect: 'reduceDamageFromTag',
          params: { tag: 'faun_beast', amount: 0.20 }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'summon_limitations', text: 'Không thể tồn tại hai thú cùng loại; triệu hồi mới sẽ thay thế thú cũ.' },
        { id: 'rage_cap', text: 'Thanh nộ tối đa của Faun là 85.' }
      ])
    }
  },
  {
    id: 'basil_thorne', name: 'Basil Thorne', class: 'Tanker', rank: 'SR',
    mods: { HP: 0.08, ARM: 0.08, RES: 0.06 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target'],
        damageMultiplier: 1.00,
        notes: 'Đâm gai gây 100% ATK + WIL lên 1 địch.'
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Chiết Luyện Độc Tích',
          cost: { aether: 30 },
          convertDebuff: { id: 'doc', stat: 'HP', amountPerStack: 0.015 },
          removeDebuff: { id: 'doc', scope: 'all' },
          notes: 'Mỗi stack Độc trên kẻ địch tăng 1,5% Max HP cho Basil rồi xóa toàn bộ Độc.'
        },
        {
          key: 'skill2',
          name: 'Khế Ước Gai Huyết',
          cost: { aether: 25 },
          duration: 2,
          sacrificeMaxHPPercent: 0.10,
          reflectDamage: 0.30,
          notes: 'Giảm 10% Max HP thực để nhận hiệu ứng phản sát thương trong 2 lượt.'
        },
        {
          key: 'skill3',
          name: 'Song Tiêm Trảm',
          cost: { aether: 20 },
          countsAsBasic: true,
          hits: 2,
          damageMultiplier: 1.00,
          tags: ['multi-hit'],
          notes: 'Gây 2 đòn đánh thường liên tiếp lên cùng mục tiêu.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'fortify',
        tags: ['taunt'],
        duration: 2,
        taunt: true,
        buffStats: { ARM: 0.20, RES: 0.20 },
        notes: 'Pháo Đài Gai Đen: nhận Khiêu Khích 2 lượt và tăng 20% ARM/RES trong thời gian này.'
      }),
      talent: asUnknownRecord({
        name: 'Gai Độc',
        mark: { id: 'doc', maxStacks: 10, purgeable: true }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'toxic_thorns',
          name: 'Gai Độc',
          when: 'onHitByEnemy',
          effect: 'applyDebuff',
          params: { id: 'doc', stacks: 1, maxStacksPerTarget: 10, perTurnLimit: 1 }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'poison_cap', text: 'Mỗi kẻ địch chỉ nhận tối đa 1 stack Độc từ nội tại mỗi lượt.' },
        { id: 'reflect_cost', text: 'Khế Ước Gai Huyết trừ Max HP thật, khiên không chặn được chi phí.' }
      ])
    }
  },
  {
    id: 'mo_da', name: 'Mộ Dạ', class: 'Warrior', rank: 'SSR',
    mods: { ATK: 0.10, WIL: 0.10 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target']
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'U Trào Tụ Lực',
          cost: { aether: 20 },
          duration: 3,
          buffStats: { ATK: 0.10, WIL: 0.10 },
          maxStacks: 3
        },
        {
          key: 'skill2',
          name: 'Huyết Tế Cuồng Khí',
          cost: { aether: 15 },
          hpTradePercentCurrent: 0.35,
          duration: 3,
          buffStats: { ATK: 0.25, WIL: 0.25 },
          maxStacks: 2,
          notes: 'Hiến 35% HP hiện có (không giảm trần), cộng dồn tối đa 2 lần nếu tái kích hoạt khi hiệu ứng còn.'
        },
        {
          key: 'skill3',
          name: 'Mộ Vực Trảm',
          cost: { aether: 15 },
          countsAsBasic: true,
          damageMultiplier: 1.50
        }
      ]),
      ult: asUnknownRecord({
        type: 'executioner',
        countsAsBasic: true,
        untargetable: { singleTargetOnly: true, turns: 2 },
        pierce: { ARM: 0.30, RES: 0.30 },
        damageMultiplier: 2.00,
        target: 'single',
        buffs: [{ id: 'bat_khuat', turns: 1 }, { id: 'tan_sat', turns: 2 }],
        notes: 'Gây 200% sát thương hỗn hợp lên một mục tiêu, bỏ qua 30% ARM/RES và nhận hiệu ứng Bất Khuất + Tàn Sát; miễn bị chỉ định bởi đòn đơn trong 2 lượt.'
      }),
      talent: asUnknownRecord({
        name: 'Dạ Mộ Nhị Cực',
        conditional: {
          ifHPAbove: 0.70,
          stats: { WIL: 0.10 },
          elseStats: { ARM: 0.05, RES: 0.05 }
        }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'night_duality',
          name: 'Dạ Mộ Nhị Cực',
          when: 'onTurnStart',
          effect: 'conditionalBuff',
          params: { ifHPgt: 0.70, WIL: 0.10, elseARM: 0.05, elseRES: 0.05, purgeable: false }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'blood_trade', text: 'Huyết Tế Cuồng Khí không thể tự sát và chỉ tiêu hao HP hiện có.' },
        { id: 'sleep_proof', text: 'Trong Tàn Sát, Mộ Dạ vẫn có thể thực thi đòn đánh thường dù đang không thể bị chọn bởi đòn đơn.' }
      ])
    }
  },
  {
    id: 'ngao_binh', name: 'Ngao Bính', class: 'Warrior', rank: 'UR',
    mods: { HP: 0.10, ATK: 0.10 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true, form: 'au_long' }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target', 'form-scaling'],
        hits: 1,
        piercePercent: 0.02,
        damageModifiersByForm: {
          au_long: { bonus: 0 },
          thanh_nien: { bonus: 0.20 },
          truong_thanh: { bonus: 0.30 },
          long_than: { bonus: 0.40, splash: 0.40 }
        }
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Long Trảo Song Trảm',
          cost: { aether: 25 },
          countsAsBasic: true,
          hits: 2,
          damageMultiplier: 1.00
        },
        {
          key: 'skill2',
          name: 'Long Huyết Phẫn Viêm',
          cost: { aether: 25 },
          hpTradePercentMaxHP: 0.25,
          duration: 3,
          selfDebuff: { RES: -0.10, ARM: -0.10 },
          basicDamageBonus: 0.50,
          notes: 'Thiêu đốt 25% Max HP bản thân; giảm 10% ARM/RES và tăng 50% sát thương đòn đánh thường trong 3 lượt.'
        },
        {
          key: 'skill3',
          name: 'Long Ảnh Truy Kích',
          cost: { aether: 25 },
          countsAsBasic: false,
          damageMultiplier: 1.40,
          splash: { ratioByForm: { au_long: 0.30, thanh_nien: 0.40, truong_thanh: 0.50, long_than: 0.60 }, maxTargets: 2 }
        }
      ]),
      ult: asUnknownRecord({
        type: 'evolution',
        sequence: [
          {
            form: 'thanh_nien',
            cocoonTurns: 1,
            reduceDamage: 0.40,
            postBuffs: { piercePercent: 0.05, reduceDamageTaken: 0.11, agi: 0.10, hpRegenPercentMaxHP: 0.01 }
          },
          {
            form: 'truong_thanh',
            cocoonTurns: 1,
            reduceDamage: 0.50,
            postBuffs: { piercePercent: 0.09, reduceDamageTaken: 0.15, agi: 0.15, hpRegenPercentMaxHP: 0.017 }
          },
          {
            form: 'long_than',
            cocoonTurns: 1,
            reduceDamage: 0.60,
            postBuffs: { piercePercent: 0.14, reduceDamageTaken: 0.22, agi: 0.20, hpRegenPercentMaxHP: 0.03, basicTransforms: 'long_tuc' }
          }
        ],
        rageBonusPerBreak: 15,
        notes: 'Mỗi lần dùng Tuyệt kỹ, Ngao Bính hóa trứng 1 lượt (không thể tấn công, giảm sát thương nhận theo cấp) rồi phá xác nâng trạng thái. Sau khi phá xác nhận thêm nộ để duy trì nhịp tiến hóa.'
      }),
      talent: asUnknownRecord({
        name: 'Long Cốt Bất Diệt',
        forms: {
          au_long: { piercePercent: 0.02, damageTakenReduce: 0.08, agi: 0.05, hpRegenPercentMaxHP: 0.005 },
          thanh_nien: { piercePercent: 0.05, damageTakenReduce: 0.11, agi: 0.10, hpRegenPercentMaxHP: 0.01 },
          truong_thanh: { piercePercent: 0.09, damageTakenReduce: 0.15, agi: 0.15, hpRegenPercentMaxHP: 0.017 },
          long_than: { piercePercent: 0.14, damageTakenReduce: 0.22, agi: 0.20, hpRegenPercentMaxHP: 0.03 }
        }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'dragon_form_scaling',
          name: 'Long Cốt Bất Diệt',
          when: 'onTurnEnd',
          effect: 'applyFormRegen',
          params: {
            forms: {
              au_long: 0.005,
              thanh_nien: 0.01,
              truong_thanh: 0.017,
              long_than: 0.03
            }
          }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'form_progression', text: 'Khởi đầu ở Ấu Long; mỗi lần Tam Chuyển Long Thai nâng trạng thái theo thứ tự và không thể đảo ngược.' },
        { id: 'egg_turn', text: 'Trong lượt Hoá Trứng, Ngao Bính không thể tấn công nhưng giảm sát thương nhận tùy cấp.' }
      ])
    }
  },
  {
    id: 'lau_khac_ma_chu', name: 'Lậu Khắc Ma Chủ', class: 'Mage', rank: 'Prime',
    mods: { WIL: 0.12, AEregen: 0.08 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target', 'mark-builder'],
        debuff: { id: 'sa_an', stacks: 1, maxStacks: 5, purgeable: false }
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Hắc Sa Song Chưởng',
          cost: { aether: 25 },
          hits: 2,
          countsAsBasic: true,
          damageMultiplier: 1.00,
          targets: 'randomEnemies',
          notes: 'Tung hai chưởng vào hai mục tiêu ngẫu nhiên, mỗi hit 100% sát thương đòn đánh thường và đặt Sa Ấn.'
        },
        {
          key: 'skill2',
          name: 'Trùng Ấn Lậu Khắc',
          cost: { aether: 25 },
          duration: 3,
          delayTurns: 1,
          markBonus: { id: 'sa_an', extraStacks: 1 },
          notes: 'Bắt đầu từ lượt kế tiếp trong 3 lượt, mỗi đòn đánh thường/kỹ năng áp 2 tầng Sa Ấn thay vì 1.'
        },
        {
          key: 'skill3',
          name: 'Tam Luân Tán Chưởng',
          cost: { aether: 35 },
          hits: 3,
          countsAsBasic: false,
          damageMultiplier: 1.00,
          targets: 'randomEnemies',
          notes: 'Gây 3 hit liên tiếp vào 3 kẻ địch ngẫu nhiên, mỗi hit 100% sát thương đòn đánh thường và đặt Sa Ấn.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'time-rift',
        randomOutcome: 0.5,
        outcomes: {
          nghich: {
            rewindAllies: 1,
            notes: 'Nghịch Lưu: đồng minh trở về trạng thái của 1 lượt trước (vị trí, HP, buff/debuff; đơn vị mới triệu hồi trong lượt hiện tại quay về deck và hoàn cost).'
          },
          thuan: {
            grantExtraBasic: true,
            notes: 'Thuận Lưu: sau khi thi triển, mọi đồng minh lập tức thực thi 1 lượt đánh thường.'
          }
        },
        notes: 'Thiên Mệnh Lậu Khắc Ma Kinh: thời sa chọn ngẫu nhiên Nghịch Lưu hoặc Thuận Lưu (50%).'
      }),
      talent: asUnknownRecord({
        name: 'Lậu Ấn Trói Thời',
        mark: {
          id: 'sa_an',
          kind: 'mark',
          maxStacks: 5,
          purgeable: false,
          onCap: { skipTurn: 1 }
        }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'sa_an_apply',
          name: 'Lậu Ấn Trói Thời',
          when: 'onAbilityHit',
          effect: 'placeMark',
          params: { id: 'sa_an', stacks: 1, maxStacks: 5, purgeable: false, skipTurnOnCap: true }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'sa_an_reset', text: 'Sa Ấn tồn tại tới hết trận trừ khi bị thanh tẩy hoặc đạt 5 tầng gây bỏ lượt và đặt lại về 0.' },
        { id: 'time_rift', text: 'Thiên Mệnh Lậu Khắc Ma Kinh chọn ngẫu nhiên Nghịch Lưu hoặc Thuận Lưu với xác suất 50%.' }
      ])
    }
  },
  {
    id: 'phe', name: 'Phệ', class: 'Mage', rank: 'Prime',
    mods: { WIL: 0.10, AEregen: 0.10 }, // 20% tổng
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target', 'lifesteal', 'mark'],
        lifesteal: 0.10,
        mark: {
          id: 'mark_devour',
          maxStacks: 3,
          ttlTurns: 3,
          perTurnLimit: 2,
          explosion: { trigger: 'targetTurnStart', scaleWIL: 0.5 }
        }
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Song Huyết Cầu',
          cost: { aether: 25 },
          hits: 2,
          countsAsBasic: true,
          targets: 'randomEnemies',
          damageMultiplier: 1.30,
          notes: 'Mỗi hit tính là đòn đánh thường, làm mới thời hạn Phệ Ấn và tôn trọng trần 2 Ấn / mục tiêu / lượt.'
        },
        {
          key: 'skill2',
          name: 'Huyết Chướng',
          cost: { aether: 20 },
          duration: 2,
          reduceDamage: 0.30,
          healPercentMaxHPPerTurn: 0.15,
          untargetable: { singleTargetOnly: true },
          damageDealtModifier: -0.30,
          notes: 'Giảm 30% sát thương gây ra trong thời gian hiệu lực và chỉ miễn khỏi việc bị chỉ định bởi đòn đơn mục tiêu.'
        },
        {
          key: 'skill3',
          name: 'Huyết Thệ',
          cost: { aether: 35 },
          duration: 4,
          link: { sharePercent: 0.5, maxLinks: 1 },
          notes: 'Liên kết tự chấm dứt nếu mục tiêu rời sân; sát thương chuyển tiếp không thể bị chuyển lần hai.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'drain',
        countsAsBasic: true,
        aoe: 'allEnemies',
        hpDrainPercentCurrent: 0.08,
        damageScaleWIL: 0.65,
        healSelfFromTotal: 0.35,
        healAlliesFromTotal: { percent: 0.25, targets: 2 },
        overhealShieldCap: 0.6,
        selfBuff: { stat: 'WIL', amount: 0.20, turns: 2 },
        marksPerTarget: 1,
        notes: 'Không thể né; mỗi mục tiêu nhận thêm 1 Phệ Ấn (tuân thủ giới hạn 2 Ấn mỗi lượt).' 
      }),
      talent: asUnknownRecord({
        name: 'Phệ Ấn',
        id: 'mark_devour',
        maxStacks: 3,
        ttlTurns: 3,
        perTurnLimit: 2,
        explosion: { scaleWIL: 0.50, trigger: 'targetTurnStart' },
        decayIfNoRefreshTurns: 3,
        blessing: { hpMax: 0.15, hpRegen: 0.50 }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'mark_devour',
          name: 'Phệ Ấn',
          when: 'onAbilityHit',
          effect: 'placeMark',
          params: {
            stacksToExplode: 3,
            ttlTurns: 3,
            dmgFromWIL: 0.5,
            perTargetPerTurn: 2,
            purgeable: false,
            decayIfNoRefreshTurns: 3
          }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'mark_cap', text: 'Mỗi mục tiêu chỉ nhận tối đa 2 Phệ Ấn mỗi lượt; đạt 3 tầng sẽ nổ ở đầu lượt của chính mục tiêu.' },
        { id: 'overheal_cap', text: 'Hút máu dư chuyển thành Giáp Máu với trần +60% Máu tối đa.' },
        { id: 'link_limit', text: 'Chỉ duy trì 1 liên kết Huyết Thệ cùng lúc; liên kết tự hủy khi mục tiêu rời sân.' }
      ])
    }
  },
  {
    id: 'kiemtruongda', name: 'Kiếm Trường Dạ', class: 'Warrior', rank: 'Prime',
    mods: { ATK: 0.12, PER: 0.08 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target', 'armor-pierce'],
        piercePercent: 0.05
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Loạn Trảm Dạ Hành',
          cost: { aether: 25 },
          countsAsBasic: true,
          targets: 'randomRow',
          damageMultiplier: 1.50
        },
        {
          key: 'skill2',
          name: 'Ngũ Kiếm Huyền Ấn',
          cost: { aether: 20 },
          duration: 'battle',
          randomStance: ['Kiếm Sinh', 'Kiếm Ma', 'Kiếm Thổ', 'Kiếm Hỏa', 'Kiếm Hư']
        },
        {
          key: 'skill3',
          name: 'Kiếm Ý Tinh Luyện',
          cost: { aether: 25 },
          delayTurns: 1,
          duration: 3,
          buffStats: { ATK: 0.23, WIL: 0.23 },
          notes: 'Hiệu lực bắt đầu từ lượt kế tiếp và dựa trên chỉ số hiện có khi kích hoạt.'
        }
      ]),
      ult: asUnknownRecord({
        type: 'strikeLaneMid',
        countsAsBasic: true,
        hits: 4,
        penRES: 0.30,
        bonusVsLeader: 0.20,
        targets: 'columnMid'
      }),
      talent: asUnknownRecord({
        name: 'Kiếm Tâm',
        scaling: { stats: { ATK: 0.05, WIL: 0.05 }, basedOn: 'battleStart' }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'atk_on_ult',
          name: 'Kiếm Tâm - ATK',
          when: 'onUltCast',
          effect: 'gainATK%',
          params: { amount: 0.05, duration: 'perm', stack: true, purgeable: false }
        },
        {
          id: 'wil_on_ult',
          name: 'Kiếm Tâm - WIL',
          when: 'onUltCast',
          effect: 'gainWIL%',
          params: { amount: 0.05, duration: 'perm', stack: true, purgeable: false }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'stance_unique', text: 'Ngũ Kiếm Huyền Ấn chỉ duy trì một Ấn Kiếm duy nhất tới hết trận.' },
        { id: 'refine_delay', text: 'Kiếm Ý Tinh Luyện kích hoạt sau 1 lượt trì hoãn dựa trên chỉ số hiện có.' },
        { id: 'ult_scaling', text: 'Mỗi lần dùng Vạn Kiếm Quy Tông cộng vĩnh viễn +5% ATK/WIL dựa trên chỉ số khởi trận.' }
      ])
    }
  },
  {
    id: 'loithienanh', name: 'Lôi Thiên Ảnh', class: 'Tanker', rank: 'SSR',
    mods: { RES: 0.10, WIL: 0.10 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        hits: 2,
        tags: ['multi-hit', 'spd-debuff'],
        debuff: { stat: 'SPD', amount: -0.02, maxStacks: 5 }
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Lôi Ảnh Tam Kích',
          cost: { aether: 25 },
          hits: 3,
          countsAsBasic: true,
          targets: 'randomEnemies',
          damageMultiplier: 1.10,
          bonusIfAdjacent: 0.10,
          notes: 'Được tính là đòn đánh thường; nếu 3 mục tiêu đứng liền kề sẽ nhận thêm 10% sát thương.'
        },
        {
          key: 'skill2',
          name: 'Ngũ Lôi Phệ Thân',
          cost: { aether: 35 },
          hpTradePercent: 0.05,
          hits: 5,
          targets: 'randomEnemies',
          damageMultiplier: 1.30,
          notes: 'Không tính là đòn đánh thường; vẫn kích hoạt thiêu đốt HP và giữ giới hạn tối thiểu 1 HP.'
        },
        {
          key: 'skill3',
          name: 'Lôi Thể Bách Chiến',
          cost: { aether: 30 },
          bonusMaxHPBase: 0.20,
          limitUses: 3
        }
      ]),
      ult: asUnknownRecord({
        type: 'hpTradeBurst',
        countsAsBasic: true,
        hpTradePercent: 0.15,
        hits: 3,
        damage: { percentTargetMaxHP: 0.07, bossPercent: 0.04, scaleWIL: 0.50 },
        reduceDmg: 0.30,
        duration: 2,
        appliesDebuff: { stat: 'SPD', amount: -0.02, maxStacks: 5 },
        notes: 'Không tự sát, tối thiểu còn 1 HP; mỗi hit tính là đòn đánh thường và cộng tầng giảm SPD.'
      }),
      talent: asUnknownRecord({
        name: 'Song Thể Lôi Đạo',
        conditional: {
          ifHPAbove: 0.5,
          stats: { ARM: 0.20, RES: 0.20 },
          elseStats: { ATK: 0.20, WIL: 0.20 }
        }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'swap_res_wil',
          name: 'Song Thể Lôi Đạo',
          when: 'onTurnStart',
          effect: 'conditionalBuff',
          params: { ifHPgt: 0.5, RES: 0.20, ARM: 0.20, elseATK: 0.20, elseWIL: 0.20, purgeable: false }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'hp_trade_limits', text: 'Mọi kỹ năng đốt máu không thể khiến Lôi Thiên Ảnh tự sát (tối thiểu còn 1 HP).' },
        { id: 'spd_burn', text: 'Giảm SPD cộng dồn tối đa 5 tầng từ đòn đánh thường và tuyệt kỹ.' },
        { id: 'body_fortify_lock', text: 'Lôi Thể Bách Chiến bị khoá vĩnh viễn sau 3 lần sử dụng.' }
      ])
    }
  },
  {
    id: 'laky', name: 'La Kỳ', class: 'Support', rank: 'SSR',
    mods: { WIL: 0.10, PER: 0.10 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target', 'sleep-setup'],
        debuff: { id: 'me_hoac', stacks: 1, maxStacks: 4 }
      }),
      skills: asUnknownRecordArray([
        {
          key: 'skill1',
          name: 'Mộng Trảo',
          cost: { aether: 25 },
          hits: 3,
          countsAsBasic: true,
          targets: 'randomEnemies',
          notes: 'Mỗi hit cộng 1 tầng Mê Hoặc lên mục tiêu trúng đòn.'
        },
        {
          key: 'skill2',
          name: 'Vạn Mộng Trận',
          cost: { aether: 35 },
          hits: 5,
          countsAsBasic: true,
          targets: 'randomEnemies',
          notes: 'Mỗi hit cộng 1 tầng Mê Hoặc lên mục tiêu trúng đòn.'
        },
        {
          key: 'skill3',
          name: 'Mộng Giới Hộ Thân',
          cost: { aether: 20 },
          duration: 3,
          reduceDamage: 0.20
        }
      ]),
      ult: asUnknownRecord({ type: 'sleep', targets: 3, turns: 2, bossModifier: 0.5 }),
      talent: asUnknownRecord({
        name: 'Mê Mộng Chú',
        resPerSleeping: 0.02
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'res_per_sleeping_enemy',
          name: 'Mê Mộng Chú',
          when: 'onTurnStart',
          effect: 'gainRES%',
          params: { perTarget: 0.02, unlimited: true }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'me_hoac_limit', text: 'Tối đa 4 tầng Mê Hoặc, kích hoạt ngủ trong 1 lượt rồi đặt lại (không thể bị xoá trước khi kích hoạt).' },
        { id: 'boss_sleep_half', text: 'Boss PvE chỉ ngủ nửa thời gian (làm tròn xuống).' }
      ])
    }
  },
  {
    id: 'kydieu', name: 'Kỳ Diêu', class: 'Support', rank: 'SR',
    mods: { WIL: 0.10, RES: 0.10 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target']
      }),
      skills: asUnknownRecordArray([
        { key: 'skill1', name: 'Tế Lễ Phản Hồn', cost: { aether: 20 }, duration: 3, selfRegenPercent: 0.08 },
        {
          key: 'skill2',
          name: 'Thí Thân Hộ Chủ',
          cost: { aether: 15 },
          sacrifice: true,
          reviveDelayTurns: 4,
          reviveReturn: { hpPercent: 0.5, ragePercent: 0.5, aether: 0 },
          grantLeader: { buff: 'indomitability', stacks: 1 }
        },
        { key: 'skill3', name: 'Tế Vũ Tăng Bão', cost: { aether: 20 }, duration: 4, rageGainBonus: 0.50 }
      ]),
      ult: asUnknownRecord({ type: 'revive', targets: 1, revived: { rage: 0, lockSkillsTurns: 1, hpPercent: 0.15 } }),
      talent: asUnknownRecord({
        name: 'Phục Tế Khôi Minh',
        perActionStacks: { ARM: 0.03, RES: 0.03 }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'res_stack_per_action',
          name: 'Phục Tế Khôi Minh',
          when: 'onActionEnd',
          effect: 'gainRES%',
          params: { amount: 0.03, stack: true, purgeable: false }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'self_sacrifice_return', text: 'Sau 4 lượt tự hiến, Kỳ Diêu hồi sinh với 50% HP, 50% nộ và 0 Aether; sân kín thì biến mất.' },
        { id: 'revive_lock', text: 'Đồng minh do tuyệt kỹ hồi sinh bị khoá kỹ năng 1 lượt và nộ về 0.' }
      ])
    }
  },
  {
    id: 'doanminh', name: 'Doãn Minh', class: 'Support', rank: 'SR',
    mods: { WIL: 0.10, AEmax: 0.10 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true, teamHealOnEntry: 0.05 }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target']
      }),
      skills: asUnknownRecordArray([
        { key: 'skill1', name: 'Cán Cân Giáng Phạt', cost: { aether: 20 }, countsAsBasic: true, damageMultiplier: 1.50 },
        { key: 'skill2', name: 'Phán Xét Cứu Rỗi', cost: { aether: 15 }, healPercentCasterMaxHP: 0.10, targets: 3 },
        { key: 'skill3', name: 'Cân Bằng Sinh Mệnh', cost: { aether: 15 }, bonusMaxHPBase: 0.10, limitUses: 5 }
      ]),
      ult: asUnknownRecord({ type: 'equalizeHP', allies: 3, healLeader: true, leaderHealPercentCasterMaxHP: 0.10 }),
      talent: asUnknownRecord({
        name: 'Thăng Bình Pháp Lực',
        onSpawnHealPercent: 0.05
      }),
      technique: null,
      passives: asUnknownRecordArray([]),
      traits: asUnknownRecordArray([
       { id: 'hp_balance', text: 'Cân bằng HP không vượt quá ngưỡng tối đa và bỏ qua Leader.' },
       { id: 'hp_gain_cap', text: 'Cân Bằng Sinh Mệnh chỉ dùng tối đa 5 lần mỗi trận.' }
      ])
    }
  },
  {
    id: 'tranquat', name: 'Trần Quát', class: 'Summoner', rank: 'R',
    mods: { ATK: 0.10, PER: 0.10 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target']
      }),
      skills: asUnknownRecordArray([
        { key: 'skill1', name: 'Sai Khiển Tiểu Đệ', cost: { aether: 15 }, ordersMinions: 2 },
        { key: 'skill2', name: 'Khiên Mộc Dẫn Địch', cost: { aether: 20 }, duration: 3, applyTauntToMinions: true },
        {
          key: 'skill3',
          name: 'Tăng Cường Tòng Bộc',
          cost: { aether: 20 },
          inheritBonus: { HP: 0.20, ATK: 0.20, WIL: 0.20 },
          limitUses: 5
        }
      ]),
      ult: asUnknownRecord({
        type: 'summon',
        pattern: 'verticalNeighbors',
        count: 2,
        ttl: 4,
        inherit: { HP: 0.50, ATK: 0.50, WIL: 0.50 },
        limit: 2,
        replace: 'oldest',
        creep: { hasRage: false, canChain: false, basicOnly: true }
      }),
      talent: asUnknownRecord({
        name: 'Đại Ca Đầu Đàn',
        perMinionBasicBonus: 0.15,
        onMinionDeath: { stats: { ATK: 0.05, WIL: 0.05 }, maxStacks: null }
      }),
      technique: null,
      passives: asUnknownRecordArray([
        {
          id: 'basic_dmg_per_minion',
          name: 'Đại Ca Đầu Đàn',
          when: 'onBasicHit',
          effect: 'gainBonus',
          params: { perMinion: 0.15 }
        }
      ]),
      traits: asUnknownRecordArray([
        { id: 'summon_ttl', text: 'Tiểu đệ tồn tại tối đa 4 lượt và không thể hồi sinh.' },
        { id: 'summon_limit', text: 'Chỉ duy trì tối đa 2 tiểu đệ; triệu hồi mới thay thế đơn vị tồn tại lâu nhất.' },
        { id: 'boost_lock', text: 'Tăng Cường Tòng Bộc khóa sau 5 lần sử dụng và chỉ ảnh hưởng tiểu đệ triệu hồi sau đó.' }
      ])
    }
  },
  {
    id: 'linhgac', name: 'Lính Gác', class: 'Warrior', rank: 'N',
    mods: { ARM: 0.10, ATK: 0.10 },
    kit: {
      onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
      basic: asUnknownRecord({
        name: 'Đánh Thường',
        tags: ['single-target']
      }),
      skills: asUnknownRecordArray([
        { key: 'skill1', name: 'Trảm Cảnh Giới', cost: { aether: 20 }, countsAsBasic: true, damageMultiplier: 1.50 },
        { key: 'skill2', name: 'Thành Lũy Tạm Thời', cost: { aether: 15 }, duration: 3, buffStats: { RES: 0.20, ARM: 0.20 } },
        {
          key: 'skill3',
          name: 'Kiên Cố Trường Kỳ',
          cost: { aether: 20 },
          permanent: true,
          buffStats: { RES: 0.05, ARM: 0.05 },
          lowHPBonus: { threshold: 0.30, stats: { RES: 0.15, ARM: 0.15 } }
        }
      ]),
      ult: asUnknownRecord({ type: 'haste', targets: 'self+2allies', attackSpeed: 0.20, turns: 2, selfBasicBonus: 0.05 }),
      talent: asUnknownRecord({
        name: 'Cảnh Giới Bất Biến',
        onSpawnStats: { AGI: 0.05, ATK: 0.05 }
      }),
      technique: null,
      passives: asUnknownRecordArray([]),
      traits: asUnknownRecordArray([
        { id: 'permanent_stack', text: 'Kiên Cố Trường Kỳ cộng dồn vĩnh viễn, mạnh hơn khi HP < 30%.' },
        { id: 'ult_damage_bonus', text: 'Trong thời gian Còi Tăng Tốc, đòn đánh thường gây thêm 5% sát thương.' }
      ])
    }
  }
] satisfies ReadonlyArray<RosterEntry>;

const unitBaseEntries = ROSTER
  .map((entry) => {
    const rank = entry.rank;
    const className = entry.class;
    if (!isRankName(rank) || !isClassName(className)) {
      return null;
    }
    const base = CLASS_BASE[className];
    const final = applyRankAndMods(base, rank, entry.mods);
    return [entry.id, final] as const;
  })
  .filter((pair): pair is readonly [UnitId, CatalogStatBlock] => pair !== null);

export const UNIT_BASE = Object.freeze(
  Object.fromEntries(unitBaseEntries),
) satisfies Readonly<Record<UnitId, CatalogStatBlock>>;

// 5) Map & helper tra cứu
export const ROSTER_MAP = new Map<UnitId, RosterEntry>(
  ROSTER.map((entry) => [entry.id, entry] as const),
);

export const getMetaById = (id: MaybeUnitId): RosterEntry | undefined => {
  if (typeof id !== 'string') return undefined;
  return ROSTER_MAP.get(id);
};

const unitKitEntries = ROSTER.map((entry) => [entry.id, asUnitKitConfig(entry.kit)] as const);

export const UNIT_KITS = Object.freeze(
  Object.fromEntries(unitKitEntries),
) as UnitKitMap;

export const getUnitKitById = (id: MaybeUnitId): UnitKitConfig | null => {
  if (typeof id !== 'string') return null;
  const kit = UNIT_KITS[id as UnitId] ?? null;
  return asUnitKitConfig(kit);
};

export const isSummoner = (id: MaybeUnitId): boolean => {
  const m = getMetaById(id);
  return !!(m && m.class === 'Summoner' && kitSupportsSummon(m));
};
