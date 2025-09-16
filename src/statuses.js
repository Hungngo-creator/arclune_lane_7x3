// statuses.js — Hệ trạng thái/effect data-driven v0.7
// Dùng ES module. Không phụ thuộc code ngoài.
// Cách dùng chính:
// - Statuses.add(unit, Statuses.make.stun({turns:2}))
// - if (!Statuses.canAct(unit)) { Statuses.onTurnEnd(unit, ctx); return; }
// - target = Statuses.resolveTarget(attacker, candidates, {attackType:'basic'}) ?? fallback
//   - const pre = Statuses.beforeDamage(attacker, target, {dtype:'phys', base:raw});
//   - let dmg = pre.base * pre.outMul; // trước giáp
//   - // áp xuyên giáp pre.defPen vào công thức của mày rồi tính giảm giáp…
//   - dmg = dmg * pre.inMul; // giảm/tăng sát thương đến từ target (damageCut/invulnerable…)
//   - const abs = Statuses.absorbShield(target, dmg, {dtype:'any'});
//   - apply hp -= abs.remain;  // abs.absorbed là lượng vào khiên
//   - Statuses.afterDamage(attacker, target, {dealt:abs.remain, absorbed:abs.absorbed, dtype:'phys'});

const byId = (u) => (u && u.statuses) || (u.statuses = []);

// ===== Utilities
function _find(u, id) {
  const arr = byId(u);
  const i = arr.findIndex(s => s.id === id);
  return [arr, i, i >= 0 ? arr[i] : null];
}
function clamp01(x){ return x < 0 ? 0 : (x > 1 ? 1 : x); }
function _dec(u, s){
  if (typeof s.dur === 'number') { s.dur -= 1; if (s.dur <= 0) Statuses.remove(u, s.id); }
}
function _sum(arr, sel){ return arr.reduce((a,b)=>a + (sel ? sel(b) : b), 0); }

// ===== Public API
export const Statuses = {
  // ---- CRUD
  add(unit, st) {
    const arr = byId(unit);
    const [_, i, cur] = _find(unit, st.id);
    if (cur) {
      // stacking / refresh logic
      if (st.maxStacks && cur.stacks != null) {
        cur.stacks = Math.min(st.maxStacks, (cur.stacks || 1) + (st.stacks || 1));
      }
      if (st.dur != null) cur.dur = st.dur;            // refresh thời lượng
      if (st.power != null) cur.power = st.power;      // replace nếu mạnh hơn (tuỳ loại)
      if (st.amount != null) cur.amount = (cur.amount ?? 0) + (st.amount ?? 0); // shield cộng dồn
      return cur;
    }
    const copy = { ...st };
    if (copy.stacks == null) copy.stacks = 1;
    arr.push(copy);
    return copy;
  },
  remove(unit, id){
    const [arr, i] = _find(unit, id);
    if (i >= 0) arr.splice(i,1);
  },
  has(unit, id){ const [, , cur] = _find(unit, id); return !!cur; },
  get(unit, id){ const [, , cur] = _find(unit, id); return cur; },
  purge(unit){ unit.statuses = []; },
  stacks(unit, id){ const s = this.get(unit,id); return s ? (s.stacks || 0) : 0; },

  // ---- Turn hooks
  onTurnStart(unit, ctx){
    // chặn hành động nếu bị stun/sleep
    // (đếm thời lượng ở onTurnEnd để vẫn "mất lượt" trọn vẹn)
  },
  onTurnEnd(unit, ctx){
    const arr = byId(unit);
    // Bleed: mất 5% HPmax sau khi unit này kết thúc lượt (effect 4)
    const bleed = this.get(unit, 'bleed');
    if (bleed){
      const lost = Math.round(unit.hpMax * 0.05);
      unit.hp = Math.max(0, unit.hp - lost);
      if (ctx?.log) ctx.log.push({t:'bleed', who:unit.name, lost});
      _dec(unit, bleed);
    }
    // Các status có dur tính theo lượt của chính unit sẽ giảm ở đây
    for (const s of [...arr]) {
      if (s.id !== 'bleed' && s.tick === 'turn') _dec(unit, s);
    }
  },
  onPhaseStart(side, ctx){/* reserved */},
  onPhaseEnd(side, ctx){/* reserved */},

  // ---- Action gates
  canAct(unit){
    return !(this.has(unit,'stun') || this.has(unit,'sleep'));
  },
  blocks(unit, what){ // what: 'ult'
    if (what === 'ult') return this.has(unit,'silence');
    return false;
  },

  // ---- Targeting
  resolveTarget(attacker, candidates, {attackType} = {attackType:'basic'}){
    // 2) "Mê hoặc": không thể bị nhắm bởi đòn đánh thường
    if (attackType === 'basic') {
      const filtered = candidates.filter(t => !this.has(t,'allure'));
      if (filtered.length) candidates = filtered;
    }
    // 1) Taunt: nếu có bất kỳ mục tiêu mang taunt → bắt buộc chọn trong nhóm đó
    const taunters = candidates.filter(t => this.has(t,'taunt'));
    if (taunters.length){
      // chọn gần nhất theo Manhattan làm tie-break
      let best = null, bestD = 1e9;
      for (const t of taunters){
        const d = Math.abs(t.cx - attacker.cx) + Math.abs(t.cy - attacker.cy);
        if (d < bestD){ best = t; bestD = d; }
      }
      return best;
    }
    return null; // để engine tiếp tục fallback positional rule của mày
  },

  // ---- Stat & damage pipelines
  // Sửa chỉ số tạm thời (spd/agi…)
  modifyStats(unit, base){
    let out = { ...base };
    // 11) Chóng mặt: -10% SPD & AGI
    if (this.has(unit,'daze')){
      out.SPD = (out.SPD ?? 0) * 0.9;
      out.AGI = (out.AGI ?? 0) * 0.9;
    }
    // 14) Sợ hãi: -10% SPD
    if (this.has(unit,'fear')){
      out.SPD = (out.SPD ?? 0) * 0.9;
    }
    return out;
  },

  // Trước khi tính sát thương/giáp
  beforeDamage(attacker, target, ctx = {dtype:'phys', base:0}){
    let outMul = 1;     // nhân vào sát thương gây ra (attacker side)
    let inMul = 1;      // nhân vào sát thương nhận vào (target side)
    let defPen = 0;     // % xuyên giáp/kháng (0..1)
    let ignoreAll = false;

    // 6) Mệt mỏi: -10% tổng sát thương gây ra
    if (this.has(attacker,'fatigue')) outMul *= 0.90;
    // 9) Hưng phấn: +10% tổng sát thương
    if (this.has(attacker,'exalt')) outMul *= 1.10;
    // 12) Cuồng bạo: +20% sát thương đòn đánh thường
    if (ctx.attackType === 'basic' && this.has(attacker,'frenzy')) outMul *= 1.20;
    // 13) Suy yếu: -10% tổng sát thương, tối đa 5 stack
    const weak = this.get(attacker,'weaken');
    if (weak) outMul *= (1 - 0.10 * Math.min(5, weak.stacks || 1));
    // 14) Sợ hãi: -10% tổng sát thương
    if (this.has(attacker,'fear')) outMul *= 0.90;

    // 5) Giảm sát thương nhận vào n%
    const cut = this.get(target,'dmgCut');
    if (cut) inMul *= (1 - clamp01(cut.power ?? 0));
    // 15) Tàng hình: miễn 100% sát thương trong 1 turn
    if (this.has(target,'stealth')) { inMul = 0; ignoreAll = true; }
    // 10) Xuyên giáp: bỏ qua 10% ARM/RES
    const pierce = this.get(attacker,'pierce');
    if (pierce) defPen = Math.max(defPen, clamp01(pierce.power ?? 0.10));
    // 1) Stun/Sleep: không tác động sát thương, chỉ chặn hành động → xử ở canAct()

    return { ...ctx, outMul, inMul, defPen, ignoreAll };
  },

  // Khiên hấp thụ sát thương (8)
  absorbShield(target, dmg, ctx={dtype:'any'}){
    const s = this.get(target,'shield');
    if (!s || (s.amount ?? 0) <= 0) return { remain: dmg, absorbed: 0, broke:false };
    let left = s.amount ?? 0;
    const absorbed = Math.min(left, dmg);
    left -= absorbed;
    s.amount = left;
    if (left <= 0) this.remove(target, 'shield');
    return { remain: dmg - absorbed, absorbed, broke: left<=0 };
  },

  // Sau khi đã trừ khiên và trừ vào HP
  afterDamage(attacker, target, result = {dealt:0, absorbed:0, dtype:'phys'}){
    const dealt = result.dealt;

    // 3) Phản sát thương: attacker nhận n% sát thương cuối cùng
    const reflect = this.get(target, 'reflect');
    if (reflect && dealt > 0){
      const back = Math.round(dealt * clamp01(reflect.power ?? 0));
      attacker.hp = Math.max(0, attacker.hp - back);
      // không phản khi stealth target đang miễn sát thương (dealt=0 thì như nhau)
    }

    // 16) Độc (venom): khi attacker có hiệu ứng, mỗi đòn sẽ gây thêm n% sát thương đã gây ra
    const venom = this.get(attacker, 'venom');
    if (venom && dealt > 0){
      const extra = Math.round(dealt * clamp01(venom.power ?? 0));
      target.hp = Math.max(0, target.hp - extra);
    }

    // 17) Tàn sát: nếu sau đòn còn ≤10% HPmax → xử tử
    if (this.has(attacker,'execute')){
      if (target.hp <= Math.ceil(target.hpMax * 0.10)) target.hp = 0;
    }

    // Hết lượt: giảm thời lượng các status “bị đánh thì giảm” (reflect chỉ theo turn → không giảm ở đây)

    return result;
  },

  // ===== Factory (constructor) cho 19 hiệu ứng
  make: {
    // 1) Stun/Sleep
    stun:      ({turns=1}={}) => ({ id:'stun',   kind:'debuff', tag:'control', dur:turns, tick:'turn' }),
    sleep:     ({turns=1}={}) => ({ id:'sleep',  kind:'debuff', tag:'control', dur:turns, tick:'turn' }),

    // 2) Taunt/Khiêu khích
    taunt:     ({turns=1}={}) => ({ id:'taunt',  kind:'debuff', tag:'control', dur:turns, tick:'turn' }),

    // 3) Phản sát thương
    reflect:   ({pct=0.2, turns=1}={}) => ({ id:'reflect', kind:'buff', tag:'counter', power:pct, dur:turns, tick:'turn' }),

    // 4) Chảy máu
    bleed:     ({turns=2}={}) => ({ id:'bleed',  kind:'debuff', tag:'dot', dur:turns, tick:'turn' }),

    // 5) Giảm sát thương nhận vào
    damageCut: ({pct=0.2, turns=1}={}) => ({ id:'dmgCut', kind:'buff', tag:'mitigation', power:pct, dur:turns, tick:'turn' }),

    // 6) Mệt mỏi (giảm output)
    fatigue:   ({turns=2}={}) => ({ id:'fatigue', kind:'debuff', tag:'output', dur:turns, tick:'turn' }),

    // 7) Quên Lãng (cấm ult)
    silence:   ({turns=1}={}) => ({ id:'silence', kind:'debuff', tag:'silence', dur:turns, tick:'turn' }),

    // 8) Khiên (không giới hạn turn, tự hết khi cạn)
    shield:    ({pct=0.2, amount=0, of='self'}={}) => ({ id:'shield', kind:'buff', tag:'shield',
                    amount: amount ?? 0, // nên set = Math.round(unit.hpMax * pct) khi add()
                    power:pct, tick:null }),

    // 9) Hưng phấn (+10% output)
    exalt:     ({turns=2}={}) => ({ id:'exalt', kind:'buff', tag:'output', dur:turns, tick:'turn' }),

    // 10) Xuyên giáp 10%
    pierce:    ({pct=0.10, turns=2}={}) => ({ id:'pierce', kind:'buff', tag:'penetration', power:pct, dur:turns, tick:'turn' }),

    // 11) Chóng mặt: -10% SPD/AGI
    daze:      ({turns=1}={}) => ({ id:'daze', kind:'debuff', tag:'stat', dur:turns, tick:'turn' }),

    // 12) Cuồng bạo: +20% basic
    frenzy:    ({turns=2}={}) => ({ id:'frenzy', kind:'buff', tag:'basic-boost', dur:turns, tick:'turn' }),

    // 13) Suy yếu: -10% output, stack tối đa 5
    weaken:    ({turns=2, stacks=1}={}) => ({ id:'weaken', kind:'debuff', tag:'output', dur:turns, tick:'turn', stacks, maxStacks:5 }),

    // 14) Sợ hãi: -10% output & -10% SPD
    fear:      ({turns=1}={}) => ({ id:'fear', kind:'debuff', tag:'output', dur:turns, tick:'turn' }),

    // 15) Tàng hình: miễn 100% dmg 1 turn
    stealth:   ({turns=1}={}) => ({ id:'stealth', kind:'buff', tag:'invuln', dur:turns, tick:'turn' }),

    // 16) Độc (venom on attacker): mỗi hit gây thêm n% dmg đã gây
    venom:     ({pct=0.15, turns=2}={}) => ({ id:'venom', kind:'buff', tag:'on-hit', power:pct, dur:turns, tick:'turn' }),

    // 17) Tàn sát (execute)
    execute:   ({turns=2}={}) => ({ id:'execute', kind:'buff', tag:'execute', dur:turns, tick:'turn' }),

    // 18) “Bất Khuất” (tên đề nghị) — chết còn 1 HP (one-shot, không theo turn)
    undying:   () => ({ id:'undying', kind:'buff', tag:'cheat-death', once:true }),

    // 19) Mê hoặc — không thể bị target bằng đòn đánh thường
    allure:    ({turns=1}={}) => ({ id:'allure', kind:'buff', tag:'avoid-basic', dur:turns, tick:'turn' }),
  },
};

// ===== Special: hook chặn chết còn 1HP (18)
export function hookOnLethalDamage(target){
  const s = Statuses.get(target, 'undying');
  if (!s) return false;
  if (target.hp <= 0){ target.hp = 1; Statuses.remove(target, 'undying'); return true; }
  return false;
}

// ===== Helper: thêm khiên theo % HPmax (tiện dụng)
export function grantShieldByPct(unit, pct){
  const add = Math.max(1, Math.round((unit.hpMax || 0) * pct));
  const cur = Statuses.get(unit, 'shield');
  if (cur) cur.amount = (cur.amount || 0) + add;
  else Statuses.add(unit, {id:'shield', kind:'buff', tag:'shield', amount:add});
  return add;
}
