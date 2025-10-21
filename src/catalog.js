// @ts-check
//v0.8
// 1) Rank multiplier (đơn giản) — áp lên TẤT CẢ stat trừ SPD
import { kitSupportsSummon } from './utils/kit.js';

/** @typedef {import('./types/config.js').CatalogStatBlock} CatalogStatBlock */
/** @typedef {import('./types/config.js').RosterUnitDefinition} RosterUnitDefinition */
/** @typedef {import('./types/units.js').UnitId} UnitId */

export const RANK_MULT = { N:0.80, R:0.90, SR:1.05, SSR:1.25, UR:1.50, Prime:1.80 };

// 2) Class base (mốc lv1 để test). SPD không chịu rank multiplier.
/** @type {Readonly<Record<string, CatalogStatBlock>>} */
export const CLASS_BASE = ({
  Mage:     { HP:360, ATK:28, WIL:30, ARM:0.08, RES:0.12, AGI:10, PER:12, SPD:1.00, AEmax:110, AEregen: 8.0, HPregen:14 },
  Tanker:   { HP:500, ATK:22, WIL:20, ARM:0.18, RES:0.14, AGI: 9, PER:10, SPD:0.95, AEmax: 60, AEregen: 4.0, HPregen:22 },
  Ranger:   { HP:360, ATK:35, WIL:16, ARM:0.08, RES:0.08, AGI:12, PER:14, SPD:1.20, AEmax: 75, AEregen: 7.0, HPregen:12 },
  Warrior:  { HP:400, ATK:30, WIL:18, ARM:0.14, RES:0.08, AGI:11, PER:11, SPD:1.10, AEmax: 70, AEregen: 6.0, HPregen:16 },
  Summoner: { HP:330, ATK:22, WIL:26, ARM:0.08, RES:0.14, AGI:10, PER:10, SPD:1.05, AEmax: 90, AEregen: 8.5, HPregen:18 },
  Support:  { HP:380, ATK:24, WIL:24, ARM:0.10, RES:0.13, AGI:10, PER:11, SPD:1.00, AEmax:100, AEregen: 7.5, HPregen:20 },
  Assassin: { HP:320, ATK:36, WIL:16, ARM:0.06, RES:0.08, AGI:14, PER:16, SPD:1.25, AEmax: 65, AEregen: 6.0, HPregen:10 }
});

// 3) Helper: áp rank & mod (mods không áp vào SPD)
/**
 * @param {CatalogStatBlock} base
 * @param {keyof typeof RANK_MULT} rank
 * @param {Partial<Record<keyof CatalogStatBlock, number>>} [mods]
 * @returns {CatalogStatBlock}
 */
export function applyRankAndMods(base, rank, mods = {}){
  const m = RANK_MULT[rank] ?? 1;
  const out = { ...base };
  const keys = /** @type {Array<keyof CatalogStatBlock>} */ (Object.keys(base));
  for (const key of keys){
    const baseValue = base[key] ?? 0;
    const mod = 1 + (mods?.[key] ?? 0);
    if (key === 'SPD') { // SPD không nhân theo bậc
      out[key] = Math.round(baseValue * mod * 100) / 100;
      continue;
    }
    const precision = (key === 'ARM' || key === 'RES') ? 100 : (key === 'AEregen' ? 10 : 1);
    out[key] = Math.round(baseValue * mod * m * precision) / precision;
  }
  return out;
}

// 4) Roster (dex/meta) — 8 nhân vật, ngân sách mod bằng nhau (~+20% tổng, không đụng SPD)
//  - onSpawn.rage: 100 cho mọi unit từ deck (trừ leader). Revive không áp quy tắc này.
//  - kit.traits.summon / kit.ult.summon đánh dấu Summoner -> kích hoạt Immediate Summon (action-chain).
/** @type {ReadonlyArray<RosterUnitDefinition>} */
export const ROSTER = ([
  {
    id: 'phe', name: 'Phệ', class: 'Mage', rank: 'Prime',
    mods: { WIL:+0.10, AEregen:+0.10 }, // 20% tổng
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
      basic: {
        name: 'Đánh Thường',
        tags: ['single-target', 'lifesteal', 'mark'],
        lifesteal: 0.10,
        mark: { id: 'mark_devour', maxStacks: 3, ttlTurns: 3 }
      },
      skills: [
        { key: 'skill1', name: 'Song Huyết Cầu', cost: { aether: 25 }, hits: 2, countsAsBasic: true, targets: 'randomEnemies', notes: 'Mỗi hit làm mới thời hạn Phệ Ấn.' },
        { key: 'skill2', name: 'Huyết Chướng', cost: { aether: 25 }, duration: 2, reduceDamage: 0.30, healPercentMaxHPPerTurn: 0.15, untargetable: true },
        { key: 'skill3', name: 'Huyết Thệ', cost: { aether: 40 }, duration: 5, link: { sharePercent: 0.5, maxLinks: 1 } }
      ],
      ult: {
        type: 'drain',
        countsAsBasic: true,
        aoe: 'allEnemies',
        hpDrainPercentCurrent: 0.07,
        damageScaleWIL: 0.80,
        healSelfFromTotal: 0.40,
        healAlliesFromTotal: 0.30,
        overhealShieldCap: 1.0,
        selfBuff: { stat: 'WIL', amount: 0.20, turns: 2 },
        marksPerTarget: 1,
        notes: 'Không thể né; mỗi mục tiêu nhận thêm 1 Phệ Ấn.'
      },
      talent: {
        name: 'Phệ Ấn',
        id: 'mark_devour',
        maxStacks: 3,
        ttlTurns: 3,
        explosion: { scaleWIL: 0.50 },
        blessing: { hpMax: 0.15, hpRegen: 0.50 }
      },
      technique: null,
      passives: [
       { id:'mark_devour', name:'Phệ Ấn', when:'onBasicHit', effect:'placeMark', params:{ stacksToExplode:3, ttlTurns:3, dmgFromWIL:0.5, purgeable:false } }
      ],
      traits: [
        { id: 'mark_cap', text: 'Phệ Ấn tối đa 3 tầng và tự kích nổ vào lượt của mục tiêu.' },
        { id: 'overheal_cap', text: 'Hút máu dư chuyển thành Giáp Máu tối đa bằng 100% Máu tối đa.' },
        { id: 'link_limit', text: 'Chỉ duy trì 1 liên kết Huyết Thệ cùng lúc.' }
      ]
    }
  },
  {
    id: 'kiemtruongda', name: 'Kiếm Trường Dạ', class: 'Warrior', rank: 'Prime',
    mods: { ATK:+0.12, PER:+0.08 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
      basic: {
        name: 'Đánh Thường',
        tags: ['single-target', 'armor-pierce'],
        piercePercent: 0.05
      },
      skills: [
        { key: 'skill1', name: 'Loạn Trảm Dạ Hành', cost: { aether: 25 }, countsAsBasic: true, targets: 'randomRow', damageMultiplier: 1.50 },
        { key: 'skill2', name: 'Ngũ Kiếm Huyền Ấn', cost: { aether: 20 }, duration: 'battle', randomStance: ['Kiếm Sinh','Kiếm Ma','Kiếm Thổ','Kiếm Hỏa','Kiếm Hư'] },
        { key: 'skill3', name: 'Kiếm Ý Tinh Luyện', cost: { aether: 25 }, delayTurns: 1, duration: 3, buffStats: { ATK: 0.20, WIL: 0.20 } }
      ],
      ult: {
        type:'strikeLaneMid',
        countsAsBasic: true,
        hits:4,
        penRES:0.30,
        bonusVsLeader:0.20,
        targets:'columnMid'
      },
      talent: {
        name: 'Kiếm Tâm',
        scaling: { stats: { ATK: 0.05, WIL: 0.05 }, basedOn: 'battleStart' }
      },
      technique: null,
      passives: [
        { id:'atk_on_ult', name:'Kiếm Tâm - ATK', when:'onUltCast', effect:'gainATK%', params:{ amount:+0.05, duration:'perm', stack:true, purgeable:false } },
        { id:'wil_on_ult', name:'Kiếm Tâm - WIL', when:'onUltCast', effect:'gainWIL%', params:{ amount:+0.05, duration:'perm', stack:true, purgeable:false } }
      ],
      traits: [
        { id:'stance_unique', text:'Ngũ Kiếm Huyền Ấn chỉ chọn 1 trạng thái cho tới hết trận.' },
        { id:'refine_delay', text:'Kiếm Ý Tinh Luyện kích hoạt sau 1 lượt trì hoãn.' },
        { id:'ult_scaling', text:'Mỗi lần dùng Vạn Kiếm Quy Tông cộng vĩnh viễn +5% ATK/WIL (không giới hạn).' }
      ]
    }
  },
  {
    id: 'loithienanh', name: 'Lôi Thiên Ảnh', class: 'Tanker', rank: 'SSR',
    mods: { RES:+0.10, WIL:+0.10 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
      basic: {
        name: 'Đánh Thường',
        hits: 2,
        tags: ['multi-hit', 'spd-debuff'],
        debuff: { stat: 'SPD', amount: -0.02, maxStacks: 5 }
      },
      skills: [
        { key: 'skill1', name: 'Lôi Ảnh Tam Kích', cost: { aether: 25 }, hits: 3, countsAsBasic: true, targets: 'randomEnemies', bonusIfAdjacent: 0.10 },
        { key: 'skill2', name: 'Ngũ Lôi Phệ Thân', cost: { aether: 35 }, hpTradePercent: 0.05, hits: 5, targets: 'randomEnemies' },
        { key: 'skill3', name: 'Lôi Thể Bách Chiến', cost: { aether: 30 }, bonusMaxHPBase: 0.20, limitUses: 3 }
      ],
      ult: {
        type:'hpTradeBurst',
        countsAsBasic: true,
        hpTradePercent: 0.15,
        hits: 3,
        damage: { percentTargetMaxHP: 0.07, bossPercent: 0.04, scaleWIL: 0.50 },
        reduceDmg: 0.30,
        duration: 2,
        appliesDebuff: { stat: 'SPD', amount: -0.02, maxStacks: 5 },
        notes: 'Không tự sát, tối thiểu còn 1 HP.'
      },
      talent: {
        name: 'Song Thể Lôi Đạo',
        conditional: {
          ifHPAbove: 0.5,
          stats: { ARM: 0.20, RES: 0.20 },
          elseStats: { ATK: 0.20, WIL: 0.20 }
        }
      },
      technique: null,
      passives: [{ id:'swap_res_wil', name:'Song Thể Lôi Đạo', when:'onTurnStart', effect:'conditionalBuff',
                   params:{ ifHPgt:0.5, RES:+0.20, ARM:+0.20, elseATK:+0.20, elseWIL:+0.20, purgeable:false } }],
      traits: [
        { id:'hp_trade_limits', text:'Mọi kỹ năng đốt máu không thể khiến Lôi Thiên Ảnh tự sát (tối thiểu còn 1 HP).' },
        { id:'spd_burn', text:'Giảm SPD cộng dồn tối đa 5 tầng từ đòn đánh thường và tuyệt kỹ.' },
        { id:'body_fortify_lock', text:'Lôi Thể Bách Chiến bị khoá vĩnh viễn sau 3 lần sử dụng.' }
      ]
    }
  },
  {
    id: 'laky', name: 'La Kỳ', class: 'Support', rank: 'SSR',
    mods: { WIL:+0.10, PER:+0.10 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
      basic: {
        name: 'Đánh Thường',
        tags: ['single-target', 'sleep-setup'],
        debuff: { id: 'me_hoac', stacks: 1, maxStacks: 4 }
      },
      skills: [
        { key: 'skill1', name: 'Mộng Trảo', cost: { aether: 25 }, hits: 3, countsAsBasic: true, targets: 'randomEnemies' },
        { key: 'skill2', name: 'Vạn Mộng Trận', cost: { aether: 35 }, hits: 5, countsAsBasic: true, targets: 'randomEnemies' },
        { key: 'skill3', name: 'Mộng Giới Hộ Thân', cost: { aether: 20 }, duration: 3, reduceDamage: 0.20 }
      ],
      ult: { type:'sleep', targets:3, turns:2, bossModifier:0.5 },
      talent: {
        name: 'Mê Mộng Chú',
        resPerSleeping: 0.02
      },
      technique: null,
      passives: [{ id:'res_per_sleeping_enemy', name:'Mê Mộng Chú', when:'onTurnStart', effect:'gainRES%', params:{ perTarget:+0.02, unlimited:true } }],
      traits: [
        { id:'me_hoac_limit', text:'Tối đa 4 tầng Mê Hoặc, kích hoạt ngủ trong 1 lượt rồi đặt lại.' },
        { id:'boss_sleep_half', text:'Boss PvE chỉ ngủ nửa thời gian (làm tròn xuống).' }
      ]
    }
  },
  {
    id: 'kydieu', name: 'Kỳ Diêu', class: 'Support', rank: 'SR',
    mods: { WIL:+0.10, RES:+0.10 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
      basic: {
        name: 'Đánh Thường',
        tags: ['single-target']
      },
      skills: [
        { key:'skill1', name:'Tế Lễ Phản Hồn', cost:{ aether:20 }, duration:3, selfRegenPercent:0.08 },
        { key:'skill2', name:'Thí Thân Hộ Chủ', cost:{ aether:15 }, sacrifice:true, reviveDelayTurns:4, reviveReturn:{ hpPercent:0.5, ragePercent:0.5, aether:0 }, grantLeader:{ buff:'indomitability', stacks:1 } },
        { key:'skill3', name:'Tế Vũ Tăng Bão', cost:{ aether:20 }, duration:4, rageGainBonus:0.50 }
      ],
      ult: { type:'revive', targets:1, revived:{ rage:0, lockSkillsTurns:1, hpPercent:0.15 } },
      talent: {
        name:'Phục Tế Khôi Minh',
        perActionStacks:{ ARM:0.03, RES:0.03 }
      },
      technique: null,
      passives: [{ id:'res_stack_per_action', name:'Phục Tế Khôi Minh', when:'onActionEnd', effect:'gainRES%', params:{ amount:+0.01, stack:true, purgeable:false } }],
      traits: [
        { id:'self_sacrifice_return', text:'Sau 4 lượt tự hiến, Kỳ Diêu hồi sinh với 50% HP, 50% nộ và 0 Aether; sân kín thì biến mất.' },
        { id:'revive_lock', text:'Đồng minh do tuyệt kỹ hồi sinh bị khoá kỹ năng 1 lượt và nộ về 0.' }
      ]
    }
  },
  {
    id: 'doanminh', name: 'Doãn Minh', class: 'Support', rank: 'SR',
    mods: { WIL:+0.10, AEmax:+0.10 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true, teamHealOnEntry:0.05 },
      basic: {
        name: 'Đánh Thường',
        tags: ['single-target']
      },
      skills: [
        { key:'skill1', name:'Cán Cân Giáng Phạt', cost:{ aether:20 }, countsAsBasic:true, damageMultiplier:1.50 },
        { key:'skill2', name:'Phán Xét Cứu Rỗi', cost:{ aether:15 }, healPercentCasterMaxHP:0.10, targets:3 },
        { key:'skill3', name:'Cân Bằng Sinh Mệnh', cost:{ aether:15 }, bonusMaxHPBase:0.10, limitUses:5 }
      ],
      ult: { type:'equalizeHP', allies:3, healLeader:true, leaderHealPercentCasterMaxHP:0.10 },
      talent: {
        name:'Thăng Bình Pháp Lực',
        onSpawnHealPercent:0.05
      },
      technique: null,
      passives: [],
      traits: [
        { id:'hp_balance', text:'Cân bằng HP không vượt quá ngưỡng tối đa và bỏ qua Leader.' },
        { id:'hp_gain_cap', text:'Cân Bằng Sinh Mệnh chỉ dùng tối đa 5 lần mỗi trận.' }
      ]
    }
  },
  {
    id: 'tranquat', name: 'Trần Quát', class: 'Summoner', rank: 'R',
    mods: { ATK:+0.10, PER:+0.10 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
basic: {
        name: 'Đánh Thường',
        tags: ['single-target']
      },
      skills: [
        { key:'skill1', name:'Sai Khiển Tiểu Đệ', cost:{ aether:15 }, ordersMinions:2 },
        { key:'skill2', name:'Khiên Mộc Dẫn Địch', cost:{ aether:20 }, duration:3, applyTauntToMinions:true },
        { key:'skill3', name:'Tăng Cường Tòng Bộc', cost:{ aether:20 }, inheritBonus:{ HP:0.20, ATK:0.20, WIL:0.20 }, limitUses:5 }
      ],
      ult: { type:'summon', pattern:'verticalNeighbors', count:2, ttl:4, inherit:{ HP:0.50, ATK:0.50, WIL:0.50 }, limit:2, replace:'oldest', creep:{ hasRage:false, canChain:false, basicOnly:true } },
      talent: {
        name:'Đại Ca Đầu Đàn',
        perMinionBasicBonus:0.15,
        onMinionDeath:{ stats:{ ATK:0.05, WIL:0.05 }, maxStacks:3 }
      },
      technique: null,
      passives: [{ id:'basic_dmg_per_minion', name:'Đại Ca Đầu Đàn', when:'onBasicHit', effect:'gainBonus', params:{ perMinion:+0.02 } }],
      traits: [
        { id:'summon_ttl', text:'Tiểu đệ tồn tại tối đa 4 lượt và không thể hồi sinh.' },
        { id:'summon_limit', text:'Chỉ duy trì tối đa 2 tiểu đệ; triệu hồi mới thay thế đơn vị tồn tại lâu nhất.' },
        { id:'boost_lock', text:'Tăng Cường Tòng Bộc khóa sau 5 lần sử dụng và chỉ ảnh hưởng tiểu đệ triệu hồi sau đó.' }
      ]
    }
  },
  {
    id: 'linhgac', name: 'Lính Gác', class: 'Warrior', rank: 'N',
    mods: { ARM:+0.10, ATK:+0.10 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
      basic: {
        name: 'Đánh Thường',
        tags: ['single-target']
      },
      skills: [
        { key:'skill1', name:'Trảm Cảnh Giới', cost:{ aether:20 }, countsAsBasic:true, damageMultiplier:1.50 },
        { key:'skill2', name:'Thành Lũy Tạm Thời', cost:{ aether:15 }, duration:3, buffStats:{ RES:0.20, ARM:0.20 } },
        { key:'skill3', name:'Kiên Cố Trường Kỳ', cost:{ aether:20 }, permanent:true, buffStats:{ RES:0.05, ARM:0.05 }, lowHPBonus:{ threshold:0.30, stats:{ RES:0.15, ARM:0.15 } } }
      ],
      ult: { type:'haste', targets:'self+2allies', attackSpeed:+0.20, turns:2, selfBasicBonus:0.05 },
      talent: {
        name:'Cảnh Giới Bất Biến',
        onSpawnStats:{ AGI:0.05, ATK:0.05 }
      },
      technique: null,
      passives: [],
      traits: [
        { id:'permanent_stack', text:'Kiên Cố Trường Kỳ cộng dồn vĩnh viễn, mạnh hơn khi HP < 30%.' },
        { id:'ult_damage_bonus', text:'Trong thời gian Còi Tăng Tốc, đòn đánh thường gây thêm 5% sát thương.' }
      ]
    }
  }
]);

// 5) Map & helper tra cứu
export const ROSTER_MAP = new Map(ROSTER.map(entry => [entry.id, entry]));

/**
 * @param {UnitId | string | null | undefined} id
 * @returns {RosterUnitDefinition | undefined}
 */
export const getMetaById = (id) => (id == null ? undefined : ROSTER_MAP.get(id));

/**
 * @param {UnitId | string | null | undefined} id
 * @returns {boolean}
 */
export const isSummoner = (id) => {
  const m = getMetaById(id);
  return !!(m && m.class === 'Summoner' && kitSupportsSummon(m));
};
