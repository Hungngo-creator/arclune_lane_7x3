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
