//v0.7.9
import { Statuses, hookOnLethalDamage } from './statuses.js';
import { vfxAddTracer, vfxAddHit, vfxAddMelee } from './vfx.js';
import { slotToCell, cellReserved } from './engine.js';
import { vfxAddSpawn } from './vfx.js';
export function pickTarget(Game, attacker){
 const foe = attacker.side === 'ally' ? 'enemy' : 'ally';
 const pool = Game.tokens.filter(t => t.side === foe && t.alive);
  if (!pool.length) return null;

  // 1) “Trước mắt”: cùng hàng, ưu tiên cột sát midline → xa dần
 const r = attacker.cy;                 // 0=top,1=mid,2=bot
  const seq = [];
  if (attacker.side === 'ally'){
  // enemy: cột 4 là 1..3 (dưới→trên) ⇒ slot hàng r là (3 - r)
   const s1 = 3 - r;                    // 1|2|3 (gần midline)
  seq.push(s1, s1 + 3, s1 + 6);        // 2→5→8 (hàng mid) / 1→4→7 / 3→6→9
  for (const s of seq){
    const { cx, cy } = slotToCell('enemy', s);
    const tgt = pool.find(t => t.cx === cx && t.cy === cy);
    if (tgt) return tgt;
 }
 } else {
   // ally: cột 2 là 1..3 (trên→dưới) ⇒ slot hàng r là (r + 1)
  const s1 = r + 1;                    // 1|2|3 (gần midline phía ally)
   seq.push(s1, s1 + 3, s1 + 6);        // 2→5→8 ... theo chiều đối xứng
    for (const s of seq){
     const { cx, cy } = slotToCell('ally', s);
    const tgt = pool.find(t => t.cx === cx && t.cy === cy);
   if (tgt) return tgt;
 } 
 }
 // 2) Fallback: không có ai “trước mắt” ⇒ đánh đơn vị gần nhất
 return pool.sort((a,b)=>{
   const da = Math.abs(a.cx - attacker.cx) + Math.abs(a.cy - attacker.cy);
   const db = Math.abs(b.cx - attacker.cx) + Math.abs(b.cy - attacker.cy);
  return da - db;
 })[0] || null;
}

export function computeDamage(attacker, target, type='physical'){
  const atk = attacker.atk||0, wil = attacker.wil||0;
  if (type==='arcane'){
    const raw = Math.max(1, Math.floor(wil));
    const cut = 1 - (target.res||0);
    return Math.max(1, Math.floor(raw * cut));
  } else {
    const raw = Math.max(1, Math.floor(atk));
    const cut = 1 - (target.arm||0);
    return Math.max(1, Math.floor(raw * cut));
  }
}

export function applyDamage(target, amount){
  if (!Number.isFinite(target.hpMax)) return;
  target.hp = Math.max(0, Math.min(target.hpMax, (target.hp|0) - (amount|0)));
  if (target.hp <= 0){
    if (target.alive !== false && !target.deadAt) target.deadAt = performance.now();
    target.alive = false;
  }
}

export function basicAttack(Game, unit){
  const foe = unit.side === 'ally' ? 'enemy' : 'ally';
  const pool = Game.tokens.filter(t => t.side===foe && t.alive);
  if (!pool.length) return;

  // Đầu tiên chọn theo “trước mắt/ganh gần” như cũ
  const fallback = pickTarget(Game, unit);

  // Sau đó cho Statuses có quyền điều phối (taunt/allure…), nếu trả về null thì bỏ lượt
 const tgt = Statuses.resolveTarget(unit, pool, { attackType:'basic' }) ?? fallback;
   if (!tgt) return;
// VFX: tất cả basic đều step-in/out (1.2s), không dùng tracer
try { vfxAddMelee(Game, unit, tgt, { dur: 1800 }); } catch(_){}
  // Tính raw và modifiers trước giáp
  const dtype = 'physical';
  const rawBase = Math.max(1, Math.floor(unit.atk||0));
  const pre = Statuses.beforeDamage(unit, tgt, { dtype, base: rawBase, attackType:'basic' });

  // OutMul (buff/debuff output)
  let dmg = Math.max(1, Math.floor(pre.base * pre.outMul));

  // Giáp/kháng có xuyên giáp (defPen)
  const def = Math.max(0, (tgt.arm||0) * (1 - (pre.defPen||0))); // dtype === 'physical'
  dmg = Math.max(0, Math.floor(dmg * (1 - def)));

  // InMul (giảm/tăng dmg nhận vào, stealth=0%)
  dmg = Math.max(0, Math.floor(dmg * pre.inMul));

// Khiên hấp thụ
   const abs = Statuses.absorbShield(tgt, dmg, { dtype });
 
   // Trừ HP phần còn lại
   applyDamage(tgt, abs.remain);
 // VFX: hit ring tại target
 try { vfxAddHit(Game, tgt); } catch(_){}

  // “Bất Khuất” (undying) — chết còn 1 HP (one-shot)
  if (tgt.hp <= 0) hookOnLethalDamage(tgt);

  // Hậu quả sau đòn: phản dmg, độc theo dealt, execute ≤10%…
  Statuses.afterDamage(unit, tgt, { dealt: Math.max(0, Math.min(dmg, (abs.remain||0))), absorbed: abs.absorbed, dtype });
}
 
// Helper: basic + follow-ups trong cùng turn-step.
// cap = số follow-up (không tính đòn thường). Không đẩy con trỏ lượt.
export function doBasicWithFollowups(Game, unit, cap = 2){
  try {
   // Đòn đánh thường đầu tiên
   basicAttack(Game, unit);
   // Đòn phụ
   const n = Math.max(0, cap|0);
  for (let i=0; i<n; i++){
     if (!unit || !unit.alive) break;
      basicAttack(Game, unit);
   }
  } catch(e){
    console.error('[doBasicWithFollowups]', e);
  }
}
