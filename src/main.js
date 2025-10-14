//v0.7.6
import { stepTurn, doActionOrSkip } from './turns.js';
import { enqueueImmediate, processActionChain } from './summon.js';
import { refillDeckEnemy, aiMaybeAct } from './ai.js';
import { Statuses } from './statuses.js';
import { CFG, CAM } from './config.js';
import { UNITS } from './units.js';
import { Meta, makeInstanceStats, initialRageFor } from './meta.js';
import { basicAttack, pickTarget, dealAbilityDamage, healUnit, grantShield, applyDamage } from './combat.js';
import {
  ROSTER, ROSTER_MAP,
  CLASS_BASE, RANK_MULT,
  getMetaById, isSummoner, applyRankAndMods
} from './catalog.js';
import {
  makeGrid, drawGridOblique,
  drawTokensOblique, drawQueuedOblique,
  hitToCellOblique, projectCellOblique,
  cellOccupied, spawnLeaders, pickRandom, slotIndex, slotToCell, cellReserved, ORDER_ENEMY,
  ART_SPRITE_EVENT,
} from './engine.js';
import { drawEnvironmentProps } from './background.js';
import { getUnitArt, setUnitSkin } from './art.js';
import { initHUD, startSummonBar } from './ui.js';
import { vfxDraw, vfxAddSpawn, vfxAddHit, vfxAddMelee } from './vfx.js';
import { drawBattlefieldScene } from './scene.js';
import { gameEvents, TURN_START, TURN_END, ACTION_START, ACTION_END } from './events.js';
import { ensureNestedModuleSupport } from './utils/dummy.js';
/** @type {HTMLCanvasElement|null} */ let canvas = null;
/** @type {CanvasRenderingContext2D|null} */ let ctx = null;
/** @type {{update:(g:any)=>void}|null} */ let hud = null;   // ← THÊM
const CAM_PRESET = CAM[CFG.CAMERA] || CAM.landscape_oblique;
const HAND_SIZE  = CFG.HAND_SIZE ?? 4;

ensureNestedModuleSupport();

// --- Instance counters (để gắn id cho token/minion) ---
let _IID = 1;
let _BORN = 1;
const nextIid = ()=> _IID++;

const Game = {
  grid: null,
  tokens: [],
  cost: 0, costCap: CFG.COST_CAP,
  summoned: 0, summonLimit: CFG.SUMMON_LIMIT,

  // deck-3 + quản lý “độc nhất”
  unitsAll: UNITS,
  usedUnitIds: new Set(),       // những unit đã ra sân
  deck3: [],                    // mảng 3 unit
  selectedId: null,
  ui: { bar: null },
  turn: { phase: 'ally', last: { ally: 0, enemy: 0 }, cycle: 0, busyUntil: 0 },
 queued: { ally: new Map(), enemy: new Map() },
  actionChain: [],
  events: gameEvents,
  sceneTheme: (CFG.SCENE?.CURRENT_THEME) || (CFG.SCENE?.DEFAULT_THEME),
  backgroundKey: CFG.CURRENT_BACKGROUND || CFG.SCENE?.CURRENT_BACKGROUND || (CFG.SCENE?.CURRENT_THEME) || (CFG.SCENE?.DEFAULT_THEME)
};
// --- Enemy AI state (deck-4, cost riêng) ---
Game.ai = {
 cost: 0, costCap: CFG.COST_CAP, summoned: 0, summonLimit: CFG.SUMMON_LIMIT,
  unitsAll: UNITS, usedUnitIds: new Set(), deck: [], selectedId: null,
  lastThinkMs: 0, lastDecision: null
};
Game.meta = Meta;

if (CFG?.DEBUG?.LOG_EVENTS) {
  const logEvent = (type) => (ev)=>{
    const detail = ev?.detail || {};
    const unit = detail.unit;
    const info = {
      side: detail.side ?? null,
      slot: detail.slot ?? null,
      cycle: detail.cycle ?? null,
      phase: detail.phase ?? null,
      unit: unit?.id || unit?.name || null,
      action: detail.action || null,
      skipped: detail.skipped || false,
      reason: detail.reason || null,
      processedChain: detail.processedChain ?? null
    };
    console.debug(`[events] ${type}`, info);
  };
  const types = [TURN_START, TURN_END, ACTION_START, ACTION_END];
  for (const type of types){
    try {
      gameEvents.addEventListener(type, logEvent(type));
    } catch (err) {
      console.error('[events]', err);
    }
  }
}

let drawFrameHandle = null;
let drawPending = false;
let drawPaused = false;

function cancelScheduledDraw(){
  if (drawFrameHandle !== null){
    cancelAnimationFrame(drawFrameHandle);
    drawFrameHandle = null;
  }
  drawPending = false;
}

function scheduleDraw(){
  if (drawPaused) return;
  if (drawPending) return;
  if (!canvas || !ctx) return;
  drawPending = true;
  drawFrameHandle = requestAnimationFrame(()=>{
    drawFrameHandle = null;
    drawPending = false;
    if (drawPaused) return;
    try {
      draw();
    } catch (err) {
      console.error('[draw]', err);
    }
    if (Game?.vfx && Game.vfx.length) scheduleDraw();
  });
}

function refreshQueuedArtFor(unitId){
  const apply = (map)=>{
    if (!map || typeof map.values !== 'function') return;
    for (const pending of map.values()){
      if (!pending || pending.unitId !== unitId) continue;
      const updated = getUnitArt(unitId);
      pending.art = updated;
      pending.skinKey = updated?.skinKey;
      if (!pending.color && updated?.palette?.primary){
        pending.color = updated.palette.primary;
      }
    }
  };
  apply(Game.queued?.ally);
  apply(Game.queued?.enemy);
}

Game.setUnitSkin = (unitId, skinKey)=>{
  const ok = setUnitSkin(unitId, skinKey);
  if (!ok) return false;
  for (const token of Game.tokens){
    if (!token || token.id !== unitId) continue;
    const art = getUnitArt(unitId);
    token.art = art;
    token.skinKey = art?.skinKey;
    if (!token.color && art?.palette?.primary){
      token.color = art.palette.primary;
    }
  }
  refreshQueuedArtFor(unitId);
  scheduleDraw();
  return true;
};

function setDrawPaused(paused){
  drawPaused = !!paused;
  if (drawPaused){
    cancelScheduledDraw();
  } else {
    scheduleDraw();
  }
}
if (typeof window !== 'undefined'){
  window.addEventListener(ART_SPRITE_EVENT, ()=>{ scheduleDraw(); });
  try {
    window.arcluneSetUnitSkin = Game.setUnitSkin;
  } catch (_){}
}
// Master clock theo timestamp – tránh drift giữa nhiều interval
const CLOCK = {
  startMs: performance.now(),
  lastTimerRemain: 240,
  lastCostCreditedSec: 0, turnEveryMs: 600,
  lastTurnStepMs: performance.now()
};

// Xác chết chờ vanish (để sau này thay bằng dead-animation)
const DEATH_VANISH_MS = 900;
function cleanupDead(now){
  const keep = [];
  for (const t of Game.tokens){
    if (t.alive) { keep.push(t); continue; }
    const t0 = t.deadAt || 0;
    if (!t0) { keep.push(t); continue; }                 // phòng hờ
    if (now - t0 < DEATH_VANISH_MS) { keep.push(t); }    // còn “thây”
    // else: bỏ hẳn khỏi mảng -> không vẽ, không chặn ô
  }
  Game.tokens = keep;
}
/* ---------- META-GATED HELPERS (W4-J4) ---------- */
function neighborSlotsVertical(slot){
  const res = [];
  const row = (slot - 1) % 3;      // 0=trên,1=giữa,2=dưới
  if (row > 0) res.push(slot - 1); // phía trên
  if (row < 2) res.push(slot + 1); // phía dưới
  return res;
}
 
// Liệt kê ô trống hợp lệ của phe enemy theo thứ tự 1→9 (sớm→muộn)
function listEmptyEnemySlots(){
 const out = [];
 for (let s = 1; s <= 9; s++){
   const { cx, cy } = slotToCell('enemy', s);
    if (!cellReserved(tokensAlive(), Game.queued, cx, cy)) out.push({ s, cx, cy });
  }
 return out;
}
// ETA score: ra trong chu kỳ hiện tại = 1.0; phải đợi chu kỳ sau = 0.5
function etaScoreEnemy(slot){
 const last = Game.turn.last.enemy || 0;
 if (Game.turn.phase === 'enemy' && slot > last) return 1.0;
 return 0.5;
}
// Áp lực lên leader đối phương (ally leader ở cx=0,cy=1) – gần hơn = điểm cao
function pressureScore(cx, cy){
 const dist = Math.abs(cx - 0) + Math.abs(cy - 1);
 return 1 - Math.min(1, dist / 7); // 0..1
}

// Độ an toàn sơ bộ: ít đồng minh (phe ta) cùng hàng, ít bị kẹp cự ly ngắn
function safetyScore(cx, cy){
  const foes = tokensAlive().filter(t => t.side === 'ally');
  const sameRow = foes.filter(t => t.cy === cy);
  const near = sameRow.filter(t => Math.abs(t.cx - cx) <= 1).length;
 const far  = sameRow.length - near;
 // nhiều địch ở gần -> nguy hiểm (điểm thấp)
 return Math.max(0, Math.min(1, 1 - (near*0.6 + far*0.2)/3));
}

function summonerFeasibility(unitId, baseSlot){
 const meta = Game.meta.get(unitId);
 if (!meta || meta.class !== 'Summoner' || meta?.kit?.ult?.type !== 'summon') return 1.0;
 const u = meta.kit.ult;
 const cand = getPatternSlots(u.pattern || 'verticalNeighbors', baseSlot)
.filter(Boolean)
  .filter(s => {
   const { cx, cy } = slotToCell('enemy', s);
    return !cellReserved(tokensAlive(), Game.queued, cx, cy);
  });
 const need = Math.max(1, u.count || 1);
  return Math.min(1, cand.length / need);
}
// --- Summon helpers (W4-J5) ---
function getPatternSlots(pattern, baseSlot){
  switch(pattern){
    case 'verticalNeighbors': {
      const row = (baseSlot - 1) % 3;
      const v = [];
      if (row > 0) v.push(baseSlot - 1);
      if (row < 2) v.push(baseSlot + 1);
      return v;
    }
    case 'rowNeighbors': { // dự phòng tương lai
      const col = Math.floor((baseSlot - 1) / 3);
      const row = (baseSlot - 1) % 3;
      const left  = (col < 2) ? ((col + 1) * 3 + row + 1) : null;
      const right = (col > 0) ? ((col - 1) * 3 + row + 1) : null;
      return [right, left].filter(Boolean);
    }
    default: return [];
  }
}

// LẤY TỪ INSTANCE đang đứng trên sân (đúng spec: thừa hưởng % chỉ số hiện tại của chủ)
function creepStatsFromInherit(masterUnit, inherit){
  const hpMax = Math.round((masterUnit?.hpMax || 0) * (inherit?.HP  || 0));
  const atk   = Math.round((masterUnit?.atk   || 0) * (inherit?.ATK || 0));
   return { hpMax, hp: hpMax, atk };
}

function getMinionsOf(masterIid){
  return Game.tokens.filter(t => t.isMinion && t.ownerIid === masterIid && t.alive);
}
function removeOldestMinions(masterIid, count){
  if (count <= 0) return;
  const list = getMinionsOf(masterIid).sort((a,b)=> (a.bornSerial||0) - (b.bornSerial||0));
  for (let i=0;i<count && i<list.length;i++){
    const x = list[i];
    x.alive = false;
    // xoá khỏi mảng để khỏi vẽ/đụng lượt
    const idx = Game.tokens.indexOf(x);
    if (idx >= 0) Game.tokens.splice(idx,1);
  }
}
function extendBusy(duration){
  if (!Game || !Game.turn) return;
  const now = performance.now();
  const prev = Number.isFinite(Game.turn.busyUntil) ? Game.turn.busyUntil : now;
  const dur = Math.max(0, duration|0);
  Game.turn.busyUntil = Math.max(prev, now + dur);
}

// Thực thi Ult: Summoner -> Immediate Summon theo meta; class khác: trừ nộ
function performUlt(unit){
  const meta = Game.meta.get(unit.id);
  if (!meta) { unit.rage = 0; return; }

  const slot = slotIndex(unit.side, unit.cx, unit.cy);

  // Chỉ Summoner có ult 'summon' mới Immediate
  const u = meta.kit?.ult;
  if (meta.class === 'Summoner' && u?.type === 'summon'){
    const cand = getPatternSlots(u.pattern || 'verticalNeighbors', slot)
      .filter(Boolean)
      // chỉ giữ slot trống thực sự (không active/queued)
      .filter(s => {
        const { cx, cy } = slotToCell(unit.side, s);
     return !cellReserved(tokensAlive(), Game.queued, cx, cy);
      })
      .sort((a,b)=> a-b);

    // spawn tối đa “count”
    const need = Math.min(u.count || 0, cand.length);
    
      if (need > 0){
        // Limit & replace
        const limit = Number.isFinite(u.limit) ? u.limit : Infinity;
        const have  = getMinionsOf(unit.iid).length;
        const over  = Math.max(0, have + need - limit);
        if (over > 0 && (u.replace === 'oldest')) removeOldestMinions(unit.iid, over);

        // Tính thừa hưởng stat 1 lần
        const inheritStats = creepStatsFromInherit(unit, u.inherit);

        // Enqueue theo slot tăng dần
        for (let i=0;i<need;i++){
          const s = cand[i];
          enqueueImmediate(Game, {
            by: unit.id, side: unit.side, slot: s,
            unit: {
              id: `${unit.id}_minion`, name: 'Creep', color: '#ffd27d',
              isMinion: true, ownerIid: unit.iid,
              bornSerial: _BORN++,
              ttlTurns: u.ttl || 3,
              ...inheritStats
            }
          });
      }
    }
    unit.rage = 0; // đã dùng ult
    return;
  }
  if (!u){ unit.rage = Math.max(0, unit.rage - 100); return; }

  const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
  let busyMs = 900;

  switch(u.type){
    case 'drain': {
      const foes = tokensAlive().filter(t => t.side === foeSide);
      if (!foes.length) break;
      const scale = typeof u.power === 'number' ? u.power : 1.2;
      let totalDrain = 0;
      for (const tgt of foes){
        if (!tgt.alive) continue;
        const base = Math.max(1, Math.round((unit.wil || 0) * scale));
        const { dealt } = dealAbilityDamage(Game, unit, tgt, {
          base,
          dtype: 'arcane',
          attackType: 'skill'
        });
        totalDrain += dealt;
      }
      if (totalDrain > 0){
        const { overheal } = healUnit(unit, totalDrain);
        if (overheal > 0) grantShield(unit, overheal);
      }
      busyMs = 1400;
      break;
    }

    case 'strikeLaneMid': {
      const primary = pickTarget(Game, unit);
      if (!primary) break;
      const laneX = primary.cx;
      const laneTargets = tokensAlive().filter(t => t.side === foeSide && t.cx === laneX);
      const hits = Math.max(1, (u.hits|0) || 1);
      const scale = typeof u.scale === 'number' ? u.scale : 0.9;
      const meleeDur = 1600;
      try { vfxAddMelee(Game, unit, primary, { dur: meleeDur }); } catch(_){}
      busyMs = Math.max(busyMs, meleeDur);
      for (const enemy of laneTargets){
        if (!enemy.alive) continue;
        for (let h=0; h<hits; h++){
          if (!enemy.alive) break;
          let base = Math.max(1, Math.round((unit.atk || 0) * scale));
          if (u.bonusVsLeader && (enemy.id === 'leaderA' || enemy.id === 'leaderB')){
            base = Math.round(base * (1 + u.bonusVsLeader));
          }
          dealAbilityDamage(Game, unit, enemy, {
            base,
            dtype: 'arcane',
            attackType: u.tagAsBasic ? 'basic' : 'skill',
            defPen: u.penRES ?? 0
          });
        }
      }
      break;
    }

    case 'selfBuff': {
      const tradePct = Math.max(0, Math.min(0.9, u.selfHPTrade ?? 0));
      const pay = Math.round((unit.hpMax || 0) * tradePct);
      const maxPay = Math.max(0, Math.min(pay, Math.max(0, (unit.hp || 0) - 1)));
      if (maxPay > 0) applyDamage(unit, maxPay);
      const reduce = Math.max(0, u.reduceDmg ?? 0);
      if (reduce > 0){
        Statuses.add(unit, Statuses.make.damageCut({ pct: reduce, turns: u.turns || 1 }));
      }
      try { vfxAddHit(Game, unit); } catch(_){}
      busyMs = 800;
      break;
    }

    case 'sleep': {
      const foes = tokensAlive().filter(t => t.side === foeSide);
      if (!foes.length) break;
      const take = Math.max(1, Math.min(foes.length, (u.targets|0) || foes.length));
      foes.sort((a,b)=>{
        const da = Math.abs(a.cx - unit.cx) + Math.abs(a.cy - unit.cy);
        const db = Math.abs(b.cx - unit.cx) + Math.abs(b.cy - unit.cy);
        return da - db;
      });
      for (let i=0; i<take; i++){
        const tgt = foes[i];
        Statuses.add(tgt, Statuses.make.sleep({ turns: u.turns || 1 }));
        try { vfxAddHit(Game, tgt); } catch(_){}
      }
      busyMs = 1000;
      break;
    }

    case 'revive': {
      const fallen = Game.tokens.filter(t => t.side === unit.side && !t.alive);
      if (!fallen.length) break;
      fallen.sort((a,b)=> (b.deadAt||0) - (a.deadAt||0));
      const take = Math.max(1, Math.min(fallen.length, (u.targets|0) || 1));
      for (let i=0; i<take; i++){
        const ally = fallen[i];
        ally.alive = true;
        ally.deadAt = 0;
        ally.hp = 0;
        Statuses.purge(ally);
        const hpPct = Math.max(0, Math.min(1, (u.revived?.hpPct) ?? 0.5));
        const healAmt = Math.max(1, Math.round((ally.hpMax || 0) * hpPct));
        healUnit(ally, healAmt);
        ally.rage = Math.max(0, (u.revived?.rage) ?? 0);
        if (u.revived?.lockSkillsTurns){
          Statuses.add(ally, Statuses.make.silence({ turns: u.revived.lockSkillsTurns }));
        }
        try { vfxAddSpawn(Game, ally.cx, ally.cy, ally.side); } catch(_){}
      }
      busyMs = 1500;
      break;
    }

    case 'equalizeHP': {
      let allies = tokensAlive().filter(t => t.side === unit.side);
      if (!allies.length) break;
      allies.sort((a,b)=>{
        const ra = (a.hpMax || 1) ? (a.hp || 0) / a.hpMax : 0;
        const rb = (b.hpMax || 1) ? (b.hp || 0) / b.hpMax : 0;
        return ra - rb;
      });
      const count = Math.max(1, Math.min(allies.length, (u.allies|0) || allies.length));
      const selected = allies.slice(0, count);
      if (u.healLeader){
        const leaderId = unit.side === 'ally' ? 'leaderA' : 'leaderB';
        const leader = Game.tokens.find(t => t.id === leaderId && t.alive);
        if (leader && !selected.includes(leader)) selected.push(leader);
      }
      if (!selected.length) break;
      const ratio = selected.reduce((acc, t) => {
        const r = (t.hpMax || 1) ? (t.hp || 0) / t.hpMax : 0;
        return Math.max(acc, r);
      }, 0);
      for (const tgt of selected){
        const goal = Math.min(tgt.hpMax || 0, Math.round((tgt.hpMax || 0) * ratio));
        if (goal > (tgt.hp || 0)){
          healUnit(tgt, goal - (tgt.hp || 0));
          try { vfxAddHit(Game, tgt); } catch(_){}
        }
      }
      busyMs = 1000;
      break;
    }

    case 'haste': {
      const targets = new Set();
      targets.add(unit);
      const extraAllies = (()=>{
        if (typeof u.targets === 'number') return Math.max(0, (u.targets|0) - 1);
        if (typeof u.targets === 'string'){
          const m = u.targets.match(/(\d+)/);
          if (m && m[1]) return Math.max(0, parseInt(m[1], 10));
        }
        return 0;
      })();
      const others = tokensAlive().filter(t => t.side === unit.side && t !== unit);
      others.sort((a,b)=> (a.spd||0) - (b.spd||0));
      for (const ally of others){
        if (targets.size >= extraAllies + 1) break;
        targets.add(ally);
      }
      const pct = u.attackSpeed ?? 0.1;
      for (const tgt of targets){
        Statuses.add(tgt, Statuses.make.haste({ pct, turns: u.turns || 1 }));
        try { vfxAddHit(Game, tgt); } catch(_){}
      }
      busyMs = 900;
      break;
    }

    default:
      break;
  }

  extendBusy(busyMs);
  unit.rage = Math.max(0, unit.rage - 100);
}
const tokensAlive = () => Game.tokens.filter(t => t.alive);
// Giảm TTL minion của 1 phe sau khi phe đó kết thúc phase
function tickMinionTTL(side){
  // gom những minion hết hạn để xoá sau vòng lặp
  const toRemove = [];
  for (const t of Game.tokens){
    if (!t.alive) continue;
    if (t.side !== side) continue;
    if (!t.isMinion) continue;
    if (!Number.isFinite(t.ttlTurns)) continue;

    t.ttlTurns -= 1;
    if (t.ttlTurns <= 0) toRemove.push(t);
  }
  // xoá ra khỏi tokens để không còn được vẽ/đi lượt
  for (const t of toRemove){
    t.alive = false;
    const idx = Game.tokens.indexOf(t);
    if (idx >= 0) Game.tokens.splice(idx, 1);
  }
}

function init(){ 
  // Guard: nếu đã init rồi thì thoát
if (Game._inited) return;
  // 1) Canvas + ctx + HUD
  const boardEl = /** @type {HTMLCanvasElement} */ (document.getElementById('board'));
  if (!boardEl) return;
  canvas = boardEl;
  ctx = /** @type {CanvasRenderingContext2D} */ (boardEl.getContext('2d'));

  hud = initHUD(document);

  // 2) Bắt đầu trận
  resize();
  spawnLeaders(Game.tokens, Game.grid);

Game.tokens.forEach(t=>{
 if (t.id === 'leaderA' || t.id === 'leaderB'){
   vfxAddSpawn(Game, t.cx, t.cy, t.side);
 }
});
  // Gán chỉ số mặc định cho 2 leader (vì không nằm trong catalog)
Game.tokens.forEach(t=>{
  if (!t.iid) t.iid = nextIid();
  if (t.id === 'leaderA' || t.id === 'leaderB'){
    Object.assign(t, {
      hpMax: 1600, hp: 1600, arm: 0.12, res: 0.12, atk: 40, wil: 30,
      aeMax: 0, ae: 0, rage: 0
    });
  }
});
  // gán iid cho leader vừa spawn từ engine
Game.tokens.forEach(t => { if (!t.iid) t.iid = nextIid(); });

  hud.update(Game);
scheduleDraw();
  Game._inited = true;   // đánh dấu thành công
  // 3) Master clock + cost + timer + bước lượt (Sparse Cursor)
  setInterval(()=>{
    const now = performance.now();
    const elapsedSec = Math.floor((now - CLOCK.startMs) / 1000);

    // Timer 04:00
    const remain = Math.max(0, 240 - elapsedSec);
    if (remain !== CLOCK.lastTimerRemain){
      CLOCK.lastTimerRemain = remain;
      const mm = String(Math.floor(remain/60)).padStart(2,'0');
      const ss = String(remain%60).padStart(2,'0');
      const tEl = document.getElementById('timer');
      if (tEl) tEl.textContent = `${mm}:${ss}`;
    }

// Cost +1/s cho CẢ HAI phe dùng chung deltaSec (không cướp mốc của nhau)
const deltaSec = elapsedSec - CLOCK.lastCostCreditedSec;
if (deltaSec > 0) {
  // Ally
  if (Game.cost < Game.costCap) {
    Game.cost = Math.min(Game.costCap, Game.cost + deltaSec);
  }
  // Enemy AI
  if (Game.ai.cost < Game.ai.costCap) {
    Game.ai.cost = Math.min(Game.ai.costCap, Game.ai.cost + deltaSec);
  }

  // Ghi mốc sau khi cộng cho cả hai
  CLOCK.lastCostCreditedSec = elapsedSec;

  // Cập nhật HUD & auto-pick phe ta
  hud.update(Game);
  if (!Game.selectedId) selectFirstAffordable();
  if (Game.ui?.bar) Game.ui.bar.render();

  // Cho AI suy nghĩ ngay khi cost đổi
  aiMaybeAct(Game, 'cost');
}

    // Bước lượt theo nhịp demo
    const busyUntil = (Game.turn?.busyUntil) ?? 0;
    if (now >= busyUntil && now - CLOCK.lastTurnStepMs >= CLOCK.turnEveryMs){
      CLOCK.lastTurnStepMs = now;
  stepTurn(Game, {
  performUlt,               // dùng ult (có immediate summon)
  processActionChain,       // xử lý creep hành động ngay
  allocIid: nextIid,        // gán iid cho token/minion
  doActionOrSkip            // để creep basic ngay trong chain
});
cleanupDead(performance.now());
scheduleDraw();
aiMaybeAct(Game, 'board');
    }
  }, 250);
  
  function selectFirstAffordable(){
  const deck = Game.deck3 || [];
  const i = deck.findIndex(c => Game.cost >= c.cost);
  Game.selectedId = i >= 0 ? deck[i].id : null;
}
// 4) Deck-3 lần đầu
  refillDeck();
  selectFirstAffordable();
 // 4b) Enemy deck lần đầu
refillDeckEnemy(Game);
  // 5) Summon bar (B2): đưa vào Game.ui.bar
  Game.ui.bar = startSummonBar(document, {
    onPick: (c)=>{
      Game.selectedId = c.id;
      Game.ui.bar.render();
    },
    canAfford: (c)=> Game.cost >= c.cost,
    getDeck: ()=> Game.deck3,
    getSelectedId: ()=> Game.selectedId
  });
  Game.ui.bar.render();

  // 6) Click canvas để summon
  canvas.addEventListener('click', (ev)=>{
    const rect = canvas.getBoundingClientRect();
    const p = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    const cell = hitToCellOblique(Game.grid, p.x, p.y, CAM_PRESET);
    if (!cell) return;

    // chỉ 3 cột trái
    if (cell.cx >= CFG.ALLY_COLS) return;

    // phải có thẻ được chọn
    const card = Game.deck3.find(u => u.id === Game.selectedId);
    if (!card) return;

// ô trống (active) + đủ cost + còn lượt
  // chặn cả ô đã có unit ACTIVE hoặc đang QUEUED (Chờ Lượt)
 if (cellReserved(tokensAlive(), Game.queued, cell.cx, cell.cy)) return;
    if (Game.cost < card.cost) return;
    if (Game.summoned >= Game.summonLimit) return;
    
    const slot = slotIndex('ally', cell.cx, cell.cy);
   // Nếu slot này đã có pending thì bỏ (tránh đặt chồng)
   if (Game.queued.ally.has(slot)) return;

const spawnCycle =
  (Game.turn.phase === 'ally' && slot > (Game.turn.last.ally || 0))
    ? Game.turn.cycle
    : Game.turn.cycle + 1; 
    const pendingArt = getUnitArt(card.id);
   const pending = {
    unitId: card.id, name: card.name, side:'ally',
     cx: cell.cx, cy: cell.cy, slot, spawnCycle,
     color: pendingArt?.palette?.primary || '#a9f58c',
     art: pendingArt,
     skinKey: pendingArt?.skinKey
   };
   Game.queued.ally.set(slot, pending);

Game.cost = Math.max(0, Game.cost - card.cost);
   hud.update(Game);                 // cập nhật HUD ngay, không đợi tick
     Game.summoned += 1;
     Game.usedUnitIds.add(card.id);

    // Bỏ thẻ khỏi deck và bổ sung thẻ mới
    Game.deck3 = Game.deck3.filter(u => u.id !== card.id);
    Game.selectedId = null;
    refillDeck();
    selectFirstAffordable();
    Game.ui.bar.render();
    scheduleDraw();
  });
window.addEventListener('resize', ()=>{ resize(); scheduleDraw(); });
}

/* ---------- Deck logic ---------- */
function refillDeck(){

  const need = HAND_SIZE - Game.deck3.length;
  if (need <= 0) return;

  const exclude = new Set([
    ...Game.usedUnitIds,
    ...Game.deck3.map(u=>u.id)
  ]);
  const more = pickRandom(Game.unitsAll, exclude).slice(0, need);
  Game.deck3.push(...more);
}

/* ---------- Vẽ ---------- */
function resize(){
  if (!canvas) return;                                  // guard
  Game.grid = makeGrid(canvas, CFG.GRID_COLS, CFG.GRID_ROWS);
  if (ctx && Game.grid){
    const scale = Number.isFinite(Game.grid.dpr) && Game.grid.dpr > 0
      ? Game.grid.dpr
      : ((typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio) && window.devicePixelRatio > 0)
        ? window.devicePixelRatio
        : 1);
    if (typeof ctx.setTransform === 'function'){
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    } else {
      if (typeof ctx.resetTransform === 'function'){
        ctx.resetTransform();
      }
      if (typeof ctx.scale === 'function'){
        ctx.scale(scale, scale);
      }
    }
  }
}
function draw(){
  if (!ctx || !canvas || !Game.grid) return;            // guard
  const clearW = Game.grid.w ?? canvas.width;
  const clearH = Game.grid.h ?? canvas.height;
  ctx.clearRect(0, 0, clearW, clearH);
  const sceneCfg = CFG.SCENE || {};
  const themeKey = Game.sceneTheme || sceneCfg.CURRENT_THEME || sceneCfg.DEFAULT_THEME;
  const theme = (sceneCfg.THEMES && themeKey) ? sceneCfg.THEMES[themeKey] : null;
  drawBattlefieldScene(ctx, Game.grid, theme);
  drawEnvironmentProps(ctx, Game.grid, CAM_PRESET, Game.backgroundKey);
  drawGridOblique(ctx, Game.grid, CAM_PRESET);
  drawQueuedOblique(ctx, Game.grid, Game.queued, CAM_PRESET);
  drawTokensOblique(ctx, Game.grid, Game.tokens, CAM_PRESET);
  vfxDraw(ctx, Game, CAM_PRESET);
  drawHPBars();
}
function cellCenterObliqueLocal(g, cx, cy, C){
  const colsW = g.tile * g.cols;
  const topScale = ((C?.topScale) ?? 0.80);
  const rowGap = ((C?.rowGapRatio) ?? 0.62) * g.tile;

  function rowLR(r){
    const pinch = (1 - topScale) * colsW;
    const t = r / g.rows;
    const width = colsW - pinch * (1 - t);
    const left  = g.ox + (colsW - width) / 2;
    const right = left + width;
    return { left, right };
  }
  const yTop = g.oy + cy * rowGap;
  const yBot = yTop + rowGap;
  const LRt = rowLR(cy);
  const LRb = rowLR(cy + 1);

  const xtL = LRt.left +  (cx    / g.cols) * (LRt.right - LRt.left);
  const xtR = LRt.left +  ((cx+1)/ g.cols) * (LRt.right - LRt.left);
  const xbL = LRb.left +  (cx    / g.cols) * (LRb.right - LRb.left);
  const xbR = LRb.left +  ((cx+1)/ g.cols) * (LRb.right - LRb.left);

  const x = (xtL + xtR + xbL + xbR) / 4;
  const y = (yTop + yBot) / 2;

  const k = ((C?.depthScale) ?? 0.94);
  const scale = Math.pow(k, g.rows - 1 - cy);
  return { x, y, scale };
}

function roundedRectPathUI(ctx, x, y, w, h, radius){
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function lightenColor(color, amount){
  if (typeof color !== 'string') return color;
  if (!color.startsWith('#')) return color;
  let hex = color.slice(1);
  if (hex.length === 3){
    hex = hex.split('').map(ch => ch + ch).join('');
  }
  if (hex.length !== 6) return color;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const mix = (c)=> Math.min(255, Math.round(c + (255 - c) * amount));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function drawHPBars(){
  if (!ctx || !Game.grid) return;
  const baseR = Math.floor(Game.grid.tile * 0.36);
  for (const t of Game.tokens){
    if (!t.alive || !Number.isFinite(t.hpMax)) continue;
const p = cellCenterObliqueLocal(Game.grid, t.cx, t.cy, CAM_PRESET);
    const art = t.art || getUnitArt(t.id, { skinKey: t.skinKey });
    const layout = art?.layout || {};
    const r = Math.max(6, Math.floor(baseR * (p.scale || 1)));
    const barWidth = Math.max(28, Math.floor(r * (layout.hpWidth ?? 2.4)));
    const barHeight = Math.max(5, Math.floor(r * (layout.hpHeight ?? 0.42)));
    const offset = layout.hpOffset ?? 1.46;
    const x = Math.round(p.x - barWidth / 2);
    const y = Math.round(p.y + r * offset - barHeight / 2);
    const ratio = Math.max(0, Math.min(1, (t.hp || 0) / (t.hpMax || 1)));
    const bgColor = art?.hpBar?.bg || 'rgba(9,14,21,0.74)';
    const fillColor = art?.hpBar?.fill || '#6ff0c0';
    const borderColor = art?.hpBar?.border || 'rgba(0,0,0,0.55)';
    const radius = Math.max(2, Math.floor(barHeight / 2));
    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    roundedRectPathUI(ctx, x, y, barWidth, barHeight, radius);
    ctx.fillStyle = bgColor;
    ctx.fill();
    if (borderColor && borderColor !== 'none'){
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = Math.max(1, Math.floor(barHeight * 0.18));
      ctx.stroke();
    }
    const inset = Math.max(1, Math.floor(barHeight * 0.25));
    const innerHeight = Math.max(1, barHeight - inset * 2);
    const innerRadius = Math.max(1, radius - inset);
    const innerWidth = Math.max(0, barWidth - inset * 2);
    const filledWidth = Math.round(innerWidth * ratio);
    if (filledWidth > 0){
      roundedRectPathUI(ctx, x + inset, y + inset, filledWidth, innerHeight, innerRadius);
      const grad = ctx.createLinearGradient(x, y + inset, x, y + inset + innerHeight);
      const topFill = lightenColor(fillColor, 0.25);
      grad.addColorStop(0, topFill);
      grad.addColorStop(1, fillColor);
      ctx.fillStyle = grad;
      ctx.fill();
    }
    ctx.restore();
  }
}
/* ---------- Chạy ---------- */
let _booted = false;
let _booting = false;
let _visibilityListenerBound = false;
function handleVisibilityChange(){
  if (typeof document === 'undefined') return;
  setDrawPaused(document.hidden);
}

export function startGame(){
  if (_booted || _booting) return;
  _booting = true;
  try {
    init();
    if (!Game._inited){
      return;
    }
    _booted = true;
    if (!_visibilityListenerBound && typeof document !== 'undefined' && typeof document.addEventListener === 'function'){
      document.addEventListener('visibilitychange', handleVisibilityChange);
      _visibilityListenerBound = true;
    }
    if (typeof document !== 'undefined'){
      setDrawPaused(document.hidden);
    }
  } catch (err) {
    _booted = false;
    throw err;
  } finally {
    _booting = false;
  }
}

export { gameEvents, emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END } from './events.js';
