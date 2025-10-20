// @ts-check
//v0.9
import { Statuses, hookOnLethalDamage } from './statuses.js';
import { vfxAddTracer, vfxAddHit, vfxAddMelee, vfxAddLightningArc } from './vfx.js';
import { slotToCell, cellReserved } from './engine.js';
import { vfxAddSpawn } from './vfx.js';
import { emitPassiveEvent } from './passives.js';
import { CFG } from './config.js';
import { gainFury, startFurySkill, finishFuryHit } from './utils/fury.js';
import { safeNow } from './utils/time.js';

/**
 * @typedef {import('../types/game-entities').SessionState} SessionState
 * @typedef {import('../types/game-entities').UnitToken} UnitToken
 */

/**
 * @typedef {Object} AbilityDamageOptions
 * @property {number} [base]
 * @property {number} [defPen]
 * @property {string} [attackType]
 * @property {string} [dtype]
 * @property {string} [furyTag]
 * @property {boolean} [isAoE]
 * @property {boolean} [isCrit]
 * @property {number} [targetsHit]
 */
/**
 * @param {SessionState | { tokens: UnitToken[] }} Game
 * @param {UnitToken} attacker
 * @returns {UnitToken | null}
 */
export function pickTarget(Game, attacker){
 const foe = attacker.side === 'ally' ? 'enemy' : 'ally';
 const pool = Game.tokens.filter(t => t.side === foe && t.alive);
  if (!pool.length) return null;

  // 1) “Trước mắt”: cùng hàng, ưu tiên cột sát midline → xa dần
 const r = attacker.cy;                 // 0=top,1=mid,2=bot
  const seq = [];
  const targetSide = attacker.side === 'ally' ? 'enemy' : 'ally';
  const s1 = Math.max(1, Math.min(3, (r|0) + 1)); // 1|2|3 (gần midline)
  seq.push(s1, s1 + 3, s1 + 6);        // 1→4→7 / 2→5→8 / 3→6→9
  for (const s of seq){
    const cell = slotToCell(targetSide, s);
    if (!cell) continue;
    const { cx, cy } = cell;
    const tgt = pool.find(t => t.cx === cx && t.cy === cy);
    if (tgt) return tgt;
 }

 // 2) Fallback: không có ai “trước mắt” ⇒ đánh đơn vị gần nhất
 return pool.sort((a,b)=>{
   const da = Math.abs(a.cx - attacker.cx) + Math.abs(a.cy - attacker.cy);
   const db = Math.abs(b.cx - attacker.cx) + Math.abs(b.cy - attacker.cy);
  return da - db;
 })[0] || null;
}

/**
 * @param {UnitToken} target
 * @param {number} amount
 * @returns {void}
 */
export function applyDamage(target, amount){
  if (!Number.isFinite(target.hpMax)) return;
  target.hp = Math.max(0, Math.min(target.hpMax, (target.hp|0) - (amount|0)));
  if (target.hp <= 0){
  if (target.alive !== false && !target.deadAt) target.deadAt = safeNow();
    target.alive = false;
  }
}
/**
 * @param {SessionState | null} Game
 * @param {UnitToken | null | undefined} attacker
 * @param {UnitToken | null | undefined} target
 * @param {AbilityDamageOptions & Record<string, unknown>} [opts]
 * @returns {{ dealt: number, absorbed: number, total: number }}
 */
export function dealAbilityDamage(Game, attacker, target, opts = {}){
  if (!attacker || !target || !target.alive) return { dealt: 0, absorbed: 0, total: 0 };

startFurySkill(attacker, { tag: opts.furyTag || opts.attackType || 'ability' });

  const dtype = opts.dtype || 'physical';
  const attackType = opts.attackType || 'skill';
  const baseDefault = dtype === 'arcane'
    ? Math.max(0, Math.floor(attacker.wil || 0))
    : Math.max(0, Math.floor(attacker.atk || 0));
  const base = Math.max(0, opts.base != null ? Math.floor(opts.base) : baseDefault);

  const pre = Statuses.beforeDamage(attacker, target, { dtype, base, attackType });

  const combinedPen = Math.max(0, Math.min(1, Math.max(pre.defPen || 0, opts.defPen || 0)));
 const defStat = dtype === 'arcane' ? (target.res || 0) : (target.arm || 0);

  let dmg = Math.max(0, Math.floor(pre.base * pre.outMul));
  if (pre.ignoreAll) {
    dmg = 0;
  } else {
    const effectiveDef = Math.max(0, defStat * (1 - combinedPen));
    dmg = Math.max(0, Math.floor(dmg * (1 - effectiveDef)));
    dmg = Math.max(0, Math.floor(dmg * pre.inMul));
  }

  const abs = Statuses.absorbShield(target, dmg, { dtype });
  const remain = Math.max(0, abs.remain);

  if (remain > 0) applyDamage(target, remain);
  if (target.hp <= 0) hookOnLethalDamage(target);

  Statuses.afterDamage(attacker, target, { dealt: remain, absorbed: abs.absorbed, dtype });

  if (Game) {
    try { vfxAddHit(Game, target); } catch (_) {}
  }

  const dealt = Math.max(0, remain);
  const isKill = target.hp <= 0;
  gainFury(attacker, {
    type: attackType === 'basic' ? 'basic' : 'ability',
    dealt,
    isAoE: !!opts.isAoE,
    isKill,
    isCrit: !!opts.isCrit,
    targetsHit: Number.isFinite(opts.targetsHit) ? opts.targetsHit : 1,
    targetMaxHp: Number.isFinite(target?.hpMax) ? target.hpMax : undefined
  });
  gainFury(target, {
    type: 'damageTaken',
    dealt,
    isAoE: !!opts.isAoE,
    selfMaxHp: Number.isFinite(target?.hpMax) ? target.hpMax : undefined,
    damageTaken: dealt
  });
  finishFuryHit(target);
  finishFuryHit(attacker);

  return { dealt: remain, absorbed: abs.absorbed, total: dmg };
}

/**
 * @param {UnitToken | null | undefined} target
 * @param {number} amount
 * @returns {{ healed: number, overheal: number }}
 */
export function healUnit(target, amount){
  if (!target || !Number.isFinite(target.hpMax)) return { healed: 0, overheal: 0 };
  const amt = Math.max(0, Math.floor(amount ?? 0));
if (amt <= 0) return { healed: 0, overheal: 0 };
  const before = Math.max(0, target.hp || 0);
  const healCap = Math.max(0, target.hpMax - before);
  const healed = Math.min(amt, healCap);
  target.hp = before + healed;
  return { healed, overheal: Math.max(0, amt - healed) };
}

/**
 * @param {UnitToken | null | undefined} target
 * @param {number} amount
 * @returns {number}
 */
export function grantShield(target, amount){
  if (!target) return 0;
  const amt = Math.max(0, Math.floor(amount ?? 0));
  if (amt <= 0) return 0;
  const cur = Statuses.get(target, 'shield');
  if (cur) {
    cur.amount = (cur.amount || 0) + amt;
   } else {
    Statuses.add(target, { id: 'shield', kind: 'buff', tag: 'shield', amount: amt });
  }
  return amt;
}

/**
 * @param {SessionState} Game
 * @param {UnitToken} unit
 * @returns {void}
 */
export function basicAttack(Game, unit){
  const foe = unit.side === 'ally' ? 'enemy' : 'ally';
  const pool = Game.tokens.filter(t => t.side === foe && t.alive);
  if (!pool.length) return;

  startFurySkill(unit, { tag: 'basic' });

  // Đầu tiên chọn theo “trước mắt/ganh gần” như cũ
  const fallback = pickTarget(Game, unit);

  // Sau đó cho Statuses có quyền điều phối (taunt/allure…), nếu trả về null thì bỏ lượt

  const tgt = Statuses.resolveTarget(unit, pool, { attackType: 'basic' }) ?? fallback;
  if (!tgt) return;

const isLoithienanh = unit?.id === 'loithienanh';

  const updateTurnBusy = (startedAt, busyMs) => {
    if (!Game?.turn) return;
    if (!Number.isFinite(startedAt) || !Number.isFinite(busyMs)) return;
    const prevBusy = Number.isFinite(Game.turn.busyUntil) ? Game.turn.busyUntil : 0;
    Game.turn.busyUntil = Math.max(prevBusy, startedAt + busyMs);
  };

  const triggerLightningArc = timing => {
    if (!isLoithienanh) return;
    const arcStart = safeNow();
    try {
      const busyMs = vfxAddLightningArc(Game, unit, tgt, {
        bindingKey: 'basic_combo',
        timing
      });
      updateTurnBusy(arcStart, busyMs);
    } catch (_) {}
  };

  const passiveCtx = {
    target: tgt,
    damage: { baseMul: 1, flatAdd: 0 },
    afterHit: [],
    log: Game?.passiveLog
  };
  emitPassiveEvent(Game, unit, 'onBasicHit', passiveCtx);
 
// VFX: tất cả basic đều step-in/out (1.1s), không dùng tracer
  const meleeDur = CFG?.ANIMATION?.meleeDurationMs ?? 1100;
  const meleeStartMs = safeNow();
  let meleeTriggered = false;
  try {
    vfxAddMelee(Game, unit, tgt, { dur: meleeDur });
    meleeTriggered = true;
  } catch (_) {}
  if (meleeTriggered && Game?.turn) {
    const prevBusy = Number.isFinite(Game.turn.busyUntil) ? Game.turn.busyUntil : 0;
    Game.turn.busyUntil = Math.max(prevBusy, meleeStartMs + meleeDur);
  }
 
  // Tính raw và modifiers trước giáp
  const dtype = 'physical';
  const rawBase = Math.max(
    1,
    Math.floor((unit.atk || 0) + (unit.wil || 0))
  );
  const modBase = Math.max(
    1,
    Math.floor(rawBase * ((passiveCtx.damage?.baseMul) ?? 1) + ((passiveCtx.damage?.flatAdd) ?? 0))
  );
  const pre = Statuses.beforeDamage(unit, tgt, { dtype, base: modBase, attackType: 'basic' });
  // OutMul (buff/debuff output)
  let dmg = Math.max(1, Math.floor(pre.base * pre.outMul));

  // Giáp/kháng có xuyên giáp (defPen)
  const def = Math.max(0, (tgt.arm ||0) * (1 - (pre.defPen ||0))); // dtype === 'physical'
  dmg = Math.max(0, Math.floor(dmg * (1 - def)));

  // InMul (giảm/tăng dmg nhận vào, stealth=0%)
  dmg = Math.max(0, Math.floor(dmg * pre.inMul));

  // Khiên hấp thụ
  triggerLightningArc('hit1');
  const abs = Statuses.absorbShield(tgt, dmg, { dtype });

  // Trừ HP phần còn lại
  triggerLightningArc('hit2');
  applyDamage(tgt, abs.remain);

  // VFX: hit ring tại target
  try { vfxAddHit(Game, tgt); } catch (_) {}
  // “Bất Khuất” (undying) — chết còn 1 HP (one-shot)
  if (tgt.hp <= 0) hookOnLethalDamage(tgt);
const dealt = Math.max(0, Math.min(dmg, abs.remain || 0));
  // Hậu quả sau đòn: phản dmg, độc theo dealt, execute ≤10%…
  Statuses.afterDamage(unit, tgt, { dealt, absorbed: abs.absorbed, dtype });

  const isKill = tgt.hp <= 0;
  gainFury(unit, {
    type: 'basic',
    dealt,
    isKill,
    targetsHit: 1,
    targetMaxHp: Number.isFinite(tgt?.hpMax) ? tgt.hpMax : undefined
  });
  gainFury(tgt, {
    type: 'damageTaken',
    dealt,
    selfMaxHp: Number.isFinite(tgt?.hpMax) ? tgt.hpMax : undefined,
    damageTaken: dealt
  });
  finishFuryHit(tgt);
  finishFuryHit(unit);

  if (Array.isArray(passiveCtx.afterHit) && passiveCtx.afterHit.length){
    const afterCtx = { target: tgt, owner: unit, result: { dealt, absorbed: abs.absorbed } };
    for (const fn of passiveCtx.afterHit) {
      try {
        fn(afterCtx);
      } catch (err){
        console.error('[passive afterHit]', err);
      }
    }
  }
}
 
// Helper: basic + follow-ups trong cùng turn-step.
// cap = số follow-up (không tính đòn thường). Không đẩy con trỏ lượt.
/**
 * @param {SessionState} Game
 * @param {UnitToken} unit
 * @param {number} [cap=2]
 * @returns {void}
 */
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
