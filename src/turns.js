// v0.7.4
import { slotToCell } from './engine.js';
import { Statuses } from './statuses.js';
import { doBasicWithFollowups } from './combat.js';
import { CFG } from './config.js';
import { makeInstanceStats, initialRageFor } from './meta.js';
import { vfxAddSpawn } from './vfx.js';
import { getUnitArt } from './art.js';
import { emitPassiveEvent, applyOnSpawnEffects, prepareUnitForPassives } from './passives.js';

// local helper
const tokensAlive = (Game) => Game.tokens.filter(t => t.alive);

// --- Active/Spawn helpers (từ main.js) ---
export function getActiveAt(Game, side, slot){
  const { cx, cy } = slotToCell(side, slot);
  return Game.tokens.find(t => t.side===side && t.cx===cx && t.cy===cy && t.alive);
}

export function hasActorThisCycle(Game, side, s){
  const { cx, cy } = slotToCell(side, s);
  const active = Game.tokens.some(t => t.side===side && t.cx===cx && t.cy===cy && t.alive);
  if (active) return true;
  const q = Game.queued[side] && Game.queued[side].get(s);
  return !!(q && q.spawnCycle <= Game.turn.cycle);
}

export function spawnQueuedIfDue(Game, side, slot, { allocIid }){
  const m = Game.queued[side];
  const p = m && m.get(slot);
  if (!p) return false;
  if (p.spawnCycle > Game.turn.cycle) return false;

  m.delete(slot);

  const meta = Game.meta && typeof Game.meta.get === 'function' ? Game.meta.get(p.unitId) : null;
  const kit = meta?.kit;
  const obj = {
    id: p.unitId, name: p.name, color: p.color || '#a9f58c',
    cx: p.cx, cy: p.cy, side: p.side, alive: true,
    rage: initialRageFor(p.unitId, { isLeader:false, revive: !!p.revive, reviveSpec: p.revived })
  };
  Object.assign(obj, makeInstanceStats(p.unitId));
  obj.statuses = [];
  obj.baseStats = {
    atk: obj.atk,
    res: obj.res,
    wil: obj.wil
  };
  obj.iid = allocIid();
  obj.art = getUnitArt(p.unitId);
  obj.color = obj.color || obj.art?.palette?.primary || '#a9f58c';
  prepareUnitForPassives(obj);
  Game.tokens.push(obj);
applyOnSpawnEffects(Game, obj, kit?.onSpawn);
  try { vfxAddSpawn(Game, p.cx, p.cy, p.side); } catch(_){}
   return true;
}

// giảm TTL minion sau khi 1 phe kết thúc phase
export function tickMinionTTL(Game, side){
  const toRemove = [];
  for (const t of Game.tokens){
    if (!t.alive) continue;
    if (t.side !== side) continue;
    if (!t.isMinion) continue;
    if (!Number.isFinite(t.ttlTurns)) continue;
    t.ttlTurns -= 1;
    if (t.ttlTurns <= 0) toRemove.push(t);
  }
  for (const t of toRemove){
    t.alive = false;
    const idx = Game.tokens.indexOf(t);
    if (idx >= 0) Game.tokens.splice(idx, 1);
  }
}

// hành động 1 unit (ưu tiên ult nếu đủ nộ & không bị chặn)
export function doActionOrSkip(Game, unit, { performUlt }){
  const ensureBusyReset = () => {
    if (!Game || !Game.turn) return;
    const now = performance.now();
    if (!Number.isFinite(Game.turn.busyUntil) || Game.turn.busyUntil < now) {
      Game.turn.busyUntil = now;
    }
  };

  if (!unit || !unit.alive) {
    ensureBusyReset();
    return;
  }
  const meta = Game.meta.get(unit.id);
  emitPassiveEvent(Game, unit, 'onTurnStart', {});
  

  Statuses.onTurnStart(unit, {});

  if (!Statuses.canAct(unit)) {
    Statuses.onTurnEnd(unit, {});
    ensureBusyReset();
    return;
  }

  if (meta && (unit.rage|0) >= 100 && !Statuses.blocks(unit,'ult')){
    let ultOk = false;
    try {
      performUlt(unit);
      ultOk = true;
    } catch(e){
      console.error('[performUlt]', e);
      unit.rage = 0;
    }
    if (ultOk) emitPassiveEvent(Game, unit, 'onUltCast', {});
    Statuses.onTurnEnd(unit, {});
    ensureBusyReset();
    return;
  }

  const cap = (meta && typeof meta.followupCap === 'number') ? (meta.followupCap|0) : (CFG.FOLLOWUP_CAP_DEFAULT|0);
 doBasicWithFollowups(Game, unit, cap);
  emitPassiveEvent(Game, unit, 'onActionEnd', {});
  Statuses.onTurnEnd(unit, {});
  ensureBusyReset();
}

// Bước con trỏ lượt (sparse-cursor) đúng đặc tả
// hooks = { performUlt, processActionChain, allocIid }
export function stepTurn(Game, hooks){
  const side = Game.turn.phase;
  const last = Game.turn.last[side] || 0;

  // tìm slot kế tiếp có actor/queued trong chu kỳ hiện tại
  let found = null;
  for (let s = last + 1; s <= 9; s++){
    if (!hasActorThisCycle(Game, side, s)) continue;

    // nếu có queued tới hạn → spawn trước khi hành động
    const spawned = spawnQueuedIfDue(Game, side, s, hooks);
    let actor = getActiveAt(Game, side, s);
    if (!actor && spawned) actor = getActiveAt(Game, side, s);

    if (actor){
      doActionOrSkip(Game, actor, hooks);
    }

    // xử lý Immediate chain (creep hành động ngay theo slot tăng dần)
    const maxSlot = hooks.processActionChain(Game, side, s, hooks);
    Game.turn.last[side] = Math.max(s, maxSlot ?? s);
    found = s;
    break;
  }

  if (found !== null) return; // đã đi 1 bước trong phe hiện tại

  // không còn slot nào trong phe này → kết thúc phase & chuyển phe
  const finishedSide = side;
  if (finishedSide === 'ally'){
    Game.turn.phase = 'enemy';
    Game.turn.last.enemy = 0;
  } else {
    Game.turn.phase = 'ally';
    Game.turn.last.ally = 0;
    Game.turn.cycle += 1;
  }
  // minion của phe vừa xong phase bị trừ TTL
  tickMinionTTL(Game, finishedSide);
}
