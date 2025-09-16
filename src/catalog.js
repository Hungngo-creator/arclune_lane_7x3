//v0.7
// 1) Rank multiplier (đơn giản) — áp lên TẤT CẢ stat trừ SPD
export const RANK_MULT = { N:0.60, R:0.80, SR:1.00, SSR:1.30, UR:1.60, Prime:2.00 };

// 2) Class base (mốc lv1 để test). SPD không chịu rank multiplier.
export const CLASS_BASE = {
  Mage:     { HP:360, ATK:28, WIL:30, ARM:0.08, RES:0.12, AGI:10, PER:12, SPD:1.00, AEmax:110, AEregen:0.80 },
  Tanker:   { HP:500, ATK:22, WIL:20, ARM:0.18, RES:0.14, AGI: 9, PER:10, SPD:0.95, AEmax: 60, AEregen:0.40 },
  Ranger:   { HP:360, ATK:35, WIL:16, ARM:0.08, RES:0.08, AGI:12, PER:14, SPD:1.20, AEmax: 75, AEregen:0.70 },
  Warrior:  { HP:400, ATK:30, WIL:18, ARM:0.14, RES:0.08, AGI:11, PER:11, SPD:1.10, AEmax: 70, AEregen:0.60 },
  Summoner: { HP:330, ATK:22, WIL:26, ARM:0.08, RES:0.14, AGI:10, PER:10, SPD:1.05, AEmax: 90, AEregen:0.85 },
  Support:  { HP:380, ATK:24, WIL:24, ARM:0.10, RES:0.13, AGI:10, PER:11, SPD:1.00, AEmax:100, AEregen:0.75 },
  Assassin: { HP:320, ATK:36, WIL:16, ARM:0.06, RES:0.08, AGI:14, PER:16, SPD:1.25, AEmax: 65, AEregen:0.60 }
};

// 3) Helper: áp rank & mod (mods không áp vào SPD)
export function applyRankAndMods(base, rank, mods = {}){
  const m = RANK_MULT[rank] ?? 1;
  const out = { ...base };
  for (const k of Object.keys(base)){
    if (k === 'SPD') { // SPD không nhân theo bậc
      out[k] = Math.round(base[k] * (1 + (mods[k] || 0)) * 100) / 100;
    } else {
      out[k] = Math.round(base[k] * (1 + (mods[k] || 0)) * m);
    }
  }
  return out;
}

// 4) Roster (dex/meta) — 8 nhân vật, ngân sách mod bằng nhau (~+20% tổng, không đụng SPD)
//  - onSpawn.rage: 100 cho mọi unit từ deck (trừ leader). Revive không áp quy tắc này.
//  - kit.ult.type: 'summon' chỉ dành cho class Summoner -> kích hoạt Immediate Summon (action-chain).
export const ROSTER = [
  {
    id: 'phe', name: 'Phệ', class: 'Mage', rank: 'Prime',
    mods: { WIL:+0.10, AEregen:+0.10 }, // 20% tổng
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
      ult: { type: 'drain', aoe: 'allEnemies', notes: 'lifedrain->overheal->shield; không summon' },
      passives: [
        { id:'mark_devour', when:'onBasicHit', effect:'placeMark', params:{ stacksToExplode:3, ttlTurns:3, dmgFromWIL:0.5, purgeable:false } }
      ]
    }
  },
  {
    id: 'kiemtruongda', name: 'Kiếm Trường Dạ', class: 'Warrior', rank: 'Prime',
    mods: { ATK:+0.12, PER:+0.08 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
      ult: { type:'strikeLaneMid', hits:4, tagAsBasic:true, bonusVsLeader:0.20, penRES:0.30 },
      passives: [{ id:'atk_on_ult', when:'onUltCast', effect:'gainATK%', params:{ amount:+0.10, duration:'perm', stack:true } }]
    }
  },
  {
    id: 'loithienanh', name: 'Lôi Thiên Ảnh', class: 'Tanker', rank: 'SSR',
    mods: { RES:+0.10, WIL:+0.10 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
      ult: { type:'selfBuff', reduceDmg:0.35, turns:2, selfHPTrade:0.10 },
      passives: [{ id:'swap_res_wil', when:'onTurnStart', effect:'conditionalBuff',
                   params:{ ifHPgt:0.5, RES:+0.20, elseWIL:+0.20, purgeable:false } }]
    }
  },
  {
    id: 'laky', name: 'La Kỳ', class: 'Support', rank: 'SSR',
    mods: { WIL:+0.10, PER:+0.10 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
      ult: { type:'sleep', targets:3, turns:2 },
      passives: [{ id:'res_per_sleeping_enemy', when:'onTurnStart', effect:'gainRES%', params:{ perTarget:+0.02, unlimited:true } }]
    }
  },
  {
    id: 'kydieu', name: 'Kỳ Diêu', class: 'Support', rank: 'SR',
    mods: { WIL:+0.10, RES:+0.10 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
      ult: { type:'revive', targets:1, revived:{ rage:0, lockSkillsTurns:1 } },
      passives: [{ id:'res_stack_per_action', when:'onActionEnd', effect:'gainRES%', params:{ amount:+0.01, stack:true, purgeable:false } }]
    }
  },
  {
    id: 'doanminh', name: 'Doãn Minh', class: 'Support', rank: 'SR',
    mods: { WIL:+0.10, AEmax:+0.10 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true, teamHealOnEntry:0.05 },
      ult: { type:'equalizeHP', allies:3, healLeader:true }
    }
  },
  {
    id: 'tranquat', name: 'Trần Quát', class: 'Summoner', rank: 'R',
    mods: { ATK:+0.10, PER:+0.10 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
      // Immediate Summon: 2 creep cùng CỘT (slot-1 & slot+1 nếu trống), hành động ngay theo slot tăng dần.
      ult: { type:'summon',
  pattern:'verticalNeighbors', count:2, ttl:3,
  inherit:{ HP:0.50, ATK:0.50 }, limit:2, replace:'oldest',
  creep:{ hasRage:false, canChain:false, basicOnly:true },
      },
      passives: [{ id:'basic_dmg_per_minion', when:'onBasicHit', effect:'gainBonus', params:{ perMinion:+0.02 } }]
    }
  },
  {
    id: 'linhgac', name: 'Lính Gác', class: 'Warrior', rank: 'N',
    mods: { ARM:+0.10, ATK:+0.10 },
    kit: {
      onSpawn: { rage: 100, exceptLeader: true },
      ult: { type:'haste', targets:'self+2allies', attackSpeed:+0.20, turns:2 }
    }
  }
];

// 5) Map & helper tra cứu
export const ROSTER_MAP = new Map(ROSTER.map(x => [x.id, x]));
export const getMetaById = (id) => ROSTER_MAP.get(id);
export const isSummoner = (id) => {
  const m = getMetaById(id);
  return !!(m && m.class === 'Summoner' && m.kit?.ult?.type === 'summon');
};
