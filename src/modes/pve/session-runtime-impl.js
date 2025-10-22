// @ts-check
//v0.7.6
import { stepTurn, doActionOrSkip, predictSpawnCycle } from '../../turns.ts';
import { enqueueImmediate, processActionChain } from '../../summon.js';
import { refillDeckEnemy, aiMaybeAct } from '../../ai.ts';
import { Statuses } from '../../statuses.ts';
import { CFG, CAM } from '../../config.js';
import { UNITS } from '../../units.ts';
import { Meta, makeInstanceStats, initialRageFor } from '../../meta.js';
import { basicAttack, pickTarget, dealAbilityDamage, healUnit, grantShield, applyDamage } from '../../combat.ts';
import { initializeFury, setFury, spendFury, resolveUltCost, gainFury, finishFuryHit } from '../../utils/fury.js';
import {
  ROSTER, ROSTER_MAP,
  CLASS_BASE, RANK_MULT,
  getMetaById, isSummoner, applyRankAndMods
} from '../../catalog.js';
import {
  makeGrid, drawGridOblique,
  drawTokensOblique, drawQueuedOblique,
  hitToCellOblique, projectCellOblique,
  cellOccupied, spawnLeaders, pickRandom, slotIndex, slotToCell, cellReserved, ORDER_ENEMY,
  ART_SPRITE_EVENT,
} from '../../engine.ts';
import { drawEnvironmentProps } from '../../background.js';
import { getUnitArt, setUnitSkin } from '../../art.js';
import { initHUD, startSummonBar } from '../../ui.js';
import {
  vfxDraw,
  vfxAddSpawn,
  vfxAddHit,
  vfxAddMelee,
  vfxAddLightningArc,
  vfxAddBloodPulse,
  vfxAddGroundBurst,
  vfxAddShieldWrap
} from '../../vfx.js';
import { drawBattlefieldScene } from '../../scene.js';
import { gameEvents, TURN_START, TURN_END, ACTION_START, ACTION_END, BATTLE_END, emitGameEvent } from '../../events.ts';
import { ensureNestedModuleSupport } from '../../utils/dummy.js';
import { safeNow } from '../../utils/time.js';
import { getSummonSpec, resolveSummonSlots } from '../../utils/kit.js';
import {
  normalizeConfig,
  createSession,
  invalidateSceneCache,
  ensureSceneCache,
  clearBackgroundSignatureCache
} from './session-state.ts';

/**
 * @typedef {import('@types/units').UnitToken} UnitToken
 * @typedef {import('@types/units').QueuedSummonState} QueuedSummonState
 * @typedef {import('@types/units').ActionChainEntry} ActionChainEntry
 * @typedef {import('@types/combat').SessionState as CoreSessionState} CoreSessionState
 * @typedef {import('@types/turn-order').TurnSnapshot} TurnSnapshot
* @typedef {import('@types/pve').RewardRoll} RewardRoll
 * @typedef {import('@types/pve').WaveState} WaveState
 * @typedef {import('@types/pve').EncounterState} EncounterState
 * @typedef {import('@types/pve').SessionRuntimeState} SessionRuntimeState
 * @typedef {import('@types/pve').CreateSessionOptions} CreateSessionOptions
 * @typedef {import('@types/pve').SessionState} SessionStatee
 */

/**
 * @typedef {Object} EnemyAIPreset
 * @property {ReadonlyArray<string>=} deck
 * @property {ReadonlyArray<string>=} unitsAll
 * @property {number=} costCap
 * @property {number=} summonLimit
 * @property {ReadonlyArray<UnitToken>=} startingDeck
 */

/** @type {HTMLCanvasElement|null} */ let canvas = null;
/** @type {CanvasRenderingContext2D|null} */ let ctx = null;
/** @type {{update:(g:any)=>void, cleanup?:()=>void}|null} */ let hud = null;   // ← THÊM
/** @type {(() => void)|null} */ let hudCleanup = null;
const CAM_PRESET = CAM[CFG.CAMERA] || CAM.landscape_oblique;
const HAND_SIZE  = CFG.HAND_SIZE ?? 4;

ensureNestedModuleSupport();

const getNow = () => safeNow();

// --- Instance counters (để gắn id cho token/minion) ---
let _IID = 1;
let _BORN = 1;
const nextIid = ()=> _IID++;

/** @type {SessionState|null} */
let Game = null;
let tickLoopHandle = null;
let tickLoopUsesTimeout = false;
let resizeHandler = null;
let visualViewportResizeHandler = null;
let visualViewportScrollHandler = null;
let resizeSchedulerHandle = null;
let resizeSchedulerUsesTimeout = false;
let pendingResize = false;
let canvasClickHandler = null;
let artSpriteHandler = null;
let visibilityHandlerBound = false;
let winRef = null;
let docRef = null;
let rootElement = null;
/** @type {Record<string, unknown>} */
let storedConfig = {};
let running = false;
const hpBarGradientCache = new Map();

function resetSessionState(options = {}){
  storedConfig = normalizeConfig({ ...storedConfig, ...options });
  Game = createSession(/** @type {CreateSessionOptions} */ (storedConfig));
  _IID = 1;
  _BORN = 1;
  CLOCK = createClock();
  invalidateSceneCache();
}

if (CFG?.DEBUG?.LOG_EVENTS) {
  const logEvent = (type) => (ev)=>{
    const detail = ev?.detail || {};
    const unit = detail.unit;
    const info = {
      side: detail.side ?? null,
      slot: detail.slot ?? null,
      cycle: detail.cycle ?? null,
      orderIndex: detail.orderIndex ?? null,
      orderLength: detail.orderLength ?? null,
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
let drawFrameUsesTimeout = false;
let drawPending = false;
let drawPaused = false;

function cancelScheduledDraw(){
  if (drawFrameHandle !== null){
    if (drawFrameUsesTimeout){
      clearTimeout(drawFrameHandle);
    } else {
      const cancel = (winRef && typeof winRef.cancelAnimationFrame === 'function')
        ? winRef.cancelAnimationFrame.bind(winRef)
        : (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : null);
      if (typeof cancel === 'function'){
        cancel(drawFrameHandle);
      }
    }
    drawFrameHandle = null;
    drawFrameUsesTimeout = false;
  }
  drawPending = false;
}

function scheduleDraw(){
  if (drawPaused) return;
  if (drawPending) return;
  if (!canvas || !ctx) return;
  drawPending = true;
  const raf = (winRef && typeof winRef.requestAnimationFrame === 'function')
    ? winRef.requestAnimationFrame.bind(winRef)
    : (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null);
  if (raf){
    drawFrameUsesTimeout = false;
    drawFrameHandle = raf(()=>{
      drawFrameHandle = null;
      drawFrameUsesTimeout = false;
      drawPending = false;
      if (drawPaused) return;
      try {
        draw();
      } catch (err) {
        console.error('[draw]', err);
      }
      if (Game?.vfx && Game.vfx.length) scheduleDraw();
    });
  } else {
    drawFrameUsesTimeout = true;
    drawFrameHandle = setTimeout(()=>{
      drawFrameHandle = null;
      drawFrameUsesTimeout = false;
      drawPending = false;
      if (drawPaused) return;
      try {
        draw();
      } catch (err) {
        console.error('[draw]', err);
      }
      if (Game?.vfx && Game.vfx.length) scheduleDraw();
    }, 16);
  }
}

function cancelScheduledResize(){
  if (resizeSchedulerHandle !== null){
    if (resizeSchedulerUsesTimeout){
      clearTimeout(resizeSchedulerHandle);
    } else {
      const cancel = (winRef && typeof winRef.cancelAnimationFrame === 'function')
        ? winRef.cancelAnimationFrame.bind(winRef)
        : (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : null);
      if (typeof cancel === 'function'){
        cancel(resizeSchedulerHandle);
      }
    }
    resizeSchedulerHandle = null;
    resizeSchedulerUsesTimeout = false;
  }
  pendingResize = false;
}

function flushScheduledResize(){
  resizeSchedulerHandle = null;
  resizeSchedulerUsesTimeout = false;
  pendingResize = false;
  try {
    resize();
    if (hud && typeof hud.update === 'function' && Game){
      hud.update(Game);
    }
    scheduleDraw();
  } catch (err) {
    console.error('[resize]', err);
  }
}

function scheduleResize(){
  if (pendingResize) return;
  pendingResize = true;
  const raf = (winRef && typeof winRef.requestAnimationFrame === 'function')
    ? winRef.requestAnimationFrame.bind(winRef)
    : (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null);
  if (raf){
    resizeSchedulerUsesTimeout = false;
    resizeSchedulerHandle = raf(flushScheduledResize);
  } else {
    resizeSchedulerUsesTimeout = true;
    resizeSchedulerHandle = setTimeout(flushScheduledResize, 32);
  }
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

function setUnitSkinForSession(unitId, skinKey){
  if (!Game) return false;
  const ok = setUnitSkin(unitId, skinKey);
  if (!ok) return false;
  const tokens = Game.tokens || [];
  for (const token of tokens){
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
}

function setDrawPaused(paused){
  drawPaused = !!paused;
  if (drawPaused){
    cancelScheduledDraw();
  } else {
    scheduleDraw();
  }
}
function bindArtSpriteListener(){
  if (!winRef || typeof winRef.addEventListener !== 'function') return;
  if (artSpriteHandler) return;
  artSpriteHandler = ()=>{ invalidateSceneCache(); scheduleDraw(); };
  winRef.addEventListener(ART_SPRITE_EVENT, artSpriteHandler);
}

function unbindArtSpriteListener(){
  if (!winRef || !artSpriteHandler || typeof winRef.removeEventListener !== 'function') return;
  winRef.removeEventListener(ART_SPRITE_EVENT, artSpriteHandler);
  artSpriteHandler = null;
}
// Master clock theo timestamp – tránh drift giữa nhiều interval
let CLOCK = null;

function createClock(){
  const now = getNow();
  return {
    startMs: now,
    lastTimerRemain: 240,
    lastCostCreditedSec: 0,
    turnEveryMs: CFG?.ANIMATION?.turnIntervalMs ?? 600,
    lastTurnStepMs: now
  };
}

// Xác chết chờ vanish (để sau này thay bằng dead-animation)
const DEATH_VANISH_MS = 900;
function cleanupDead(now){
  if (!Game?.tokens) return;
  const tokens = Game.tokens;
  const keep = [];
  for (const t of tokens){
    if (t.alive) { keep.push(t); continue; }
    const t0 = t.deadAt || 0;
    if (!t0) { keep.push(t); continue; }                 // phòng hờ
    if (now - t0 < DEATH_VANISH_MS) { keep.push(t); }    // còn “thây”
    // else: bỏ hẳn khỏi mảng -> không vẽ, không chặn ô
  }
  Game.tokens = keep;
}

// LẤY TỪ INSTANCE đang đứng trên sân (đúng spec: thừa hưởng % chỉ số hiện tại của chủ)
function creepStatsFromInherit(masterUnit, inherit){
  if (!inherit || typeof inherit !== 'object') return {};
  const hpMax = Math.round((masterUnit?.hpMax || 0) * ((inherit.HP ?? inherit.hp ?? inherit.HPMax ?? inherit.hpMax) || 0));
  const atk   = Math.round((masterUnit?.atk   || 0) * ((inherit.ATK ?? inherit.atk) || 0));
  const wil   = Math.round((masterUnit?.wil   || 0) * ((inherit.WIL ?? inherit.wil) || 0));
  const res   = Math.round((masterUnit?.res   || 0) * ((inherit.RES ?? inherit.res) || 0));
  const arm   = Math.round((masterUnit?.arm   || 0) * ((inherit.ARM ?? inherit.arm) || 0) * 100) / 100;
  const stats = {};
  if (hpMax > 0){ stats.hpMax = hpMax; stats.hp = hpMax; }
  if (atk > 0) stats.atk = atk;
  if (wil > 0) stats.wil = wil;
  if (res > 0) stats.res = res;
  if (arm > 0) stats.arm = Math.max(0, Math.min(1, arm));
  return stats;
}

function getMinionsOf(masterIid){
  return (Game?.tokens || []).filter(t => t.isMinion && t.ownerIid === masterIid && t.alive);
}
function removeOldestMinions(masterIid, count){
  if (count <= 0) return;
  const tokens = Game?.tokens;
  if (!tokens) return;
  const list = getMinionsOf(masterIid).sort((a,b)=> (a.bornSerial||0) - (b.bornSerial||0));
  for (let i=0;i<count && i<list.length;i++){
    const x = list[i];
    x.alive = false;
    // xoá khỏi mảng để khỏi vẽ/đụng lượt
    const idx = tokens.indexOf(x);
    if (idx >= 0) tokens.splice(idx,1);
  }
}
function extendBusy(duration){
  if (!Game || !Game.turn) return;
  const now = getNow();
  const prev = Number.isFinite(Game.turn.busyUntil) ? Game.turn.busyUntil : now;
  const dur = Math.max(0, duration|0);
  Game.turn.busyUntil = Math.max(prev, now + dur);
}

// Thực thi Ult: Summoner -> Immediate Summon theo meta; class khác: trừ nộ
function performUlt(unit){
  if (!Game){
    setFury(unit, 0);
    return;
  }
  const metaGetter = Game.meta?.get;
  const meta = typeof metaGetter === 'function' ? metaGetter.call(Game.meta, unit.id) : null;
  if (!meta) { setFury(unit, 0); return; }

  const slot = slotIndex(unit.side, unit.cx, unit.cy);

  const summonSpec = meta.class === 'Summoner' ? getSummonSpec(meta) : null;
  if (meta.class === 'Summoner' && summonSpec){
    const aliveNow = tokensAlive();
    const queued = Game.queued || { ally: new Map(), enemy: new Map() };
    const patternSlots = resolveSummonSlots(summonSpec, slot)
      .filter(Boolean)
      .filter(s => {
        const { cx, cy } = slotToCell(unit.side, s);
        return !cellReserved(aliveNow, queued, cx, cy);
      })
      .sort((a, b) => a - b);

    const countRaw = Number(summonSpec.count);
    const desired = Number.isFinite(countRaw) ? countRaw : (patternSlots.length || 1);
    const need = Math.min(patternSlots.length, Math.max(0, desired));

    if (need > 0){
      const limit = Number.isFinite(summonSpec.limit) ? summonSpec.limit : Infinity;
      const have  = getMinionsOf(unit.iid).length;
      const over  = Math.max(0, have + need - limit);
      const replacePolicy = typeof summonSpec.replace === 'string' ? summonSpec.replace.trim().toLowerCase() : null;
      if (over > 0 && replacePolicy === 'oldest') removeOldestMinions(unit.iid, over);

      const inheritStats = creepStatsFromInherit(unit, summonSpec.inherit);
      const ttl = Number.isFinite(summonSpec.ttlTurns)
        ? summonSpec.ttlTurns
        : (Number.isFinite(summonSpec.ttl) ? summonSpec.ttl : null);

      for (let i = 0; i < need; i++){
        const s = patternSlots[i];
        const base = summonSpec.creep || {};
        const spawnTtl = Number.isFinite(base.ttlTurns) ? base.ttlTurns : ttl;
        enqueueImmediate(Game, {
          by: unit.id,
          side: unit.side,
          slot: s,
          unit: {
            id: base.id || `${unit.id}_minion`,
            name: base.name || base.label || 'Creep',
            color: base.color || '#ffd27d',
            isMinion: base.isMinion !== false,
            ownerIid: unit.iid,
            bornSerial: _BORN++,
            ttlTurns: Number.isFinite(spawnTtl) ? spawnTtl : 3,
            ...inheritStats
          }
        });
      }
    }
    setFury(unit, 0);
    return;
  }

  const u = meta.kit?.ult;
  if (!u){ spendFury(unit, resolveUltCost(unit)); return; }

  const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
  let busyMs = 900;

  switch(u.type){
    case 'drain': {
      const aliveNow = tokensAlive();
      const foes = aliveNow.filter(t => t.side === foeSide);
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

case 'hpTradeBurst': {
      const hpTradePctRaw = Number.isFinite(u.hpTradePercent) ? u.hpTradePercent : (u.hpTrade?.percentMaxHP ?? 0);
      const hpTradePct = Math.max(0, Math.min(0.95, hpTradePctRaw || 0));
      const hpMax = Number.isFinite(unit.hpMax) ? unit.hpMax : 0;
      const currentHp = Number.isFinite(unit.hp) ? unit.hp : 0;
      const desiredTrade = Math.round(hpMax * hpTradePct);
      const maxLoss = Math.max(0, currentHp - 1);
      const hpPayment = Math.max(0, Math.min(desiredTrade, maxLoss));
      if (hpPayment > 0){
        applyDamage(unit, hpPayment);
        gainFury(unit, {
          type: 'damageTaken',
          dealt: hpPayment,
          selfMaxHp: Number.isFinite(unit?.hpMax) ? unit.hpMax : undefined,
          damageTaken: hpPayment
        });
        finishFuryHit(unit);
      }

      const aliveNow = tokensAlive();
      const foes = aliveNow.filter(t => t.side === foeSide && t.alive);

      const hits = Math.max(1, (u.hits | 0) || 1);
      const selected = [];
      if (foes.length){
        const primary = pickTarget(Game, unit);
        if (primary){
          selected.push(primary);
        }
        const pool = foes.filter(t => !selected.includes(t));
        pool.sort((a, b) => {
          const da = Math.abs(a.cx - unit.cx) + Math.abs(a.cy - unit.cy);
          const db = Math.abs(b.cx - unit.cx) + Math.abs(b.cy - unit.cy);
          return da - db;
        });
        for (const enemy of pool){
          if (selected.length >= hits) break;
          selected.push(enemy);
        }
        if (selected.length > hits) selected.length = hits;
        if (!selected.length && foes.length){
          selected.push(foes[0]);
        }
      }

      const applyBusyFromVfx = (startedAt, duration) => {
        if (!Number.isFinite(startedAt) || !Number.isFinite(duration)) return;
        busyMs = Math.max(busyMs, duration);
        if (Game?.turn){
          const prev = Number.isFinite(Game.turn.busyUntil) ? Game.turn.busyUntil : startedAt;
          Game.turn.busyUntil = Math.max(prev, startedAt + duration);
        }
      };

      const bindingKey = 'huyet_hon_loi_quyet';

      {
        const startedAt = getNow();
        try {
          const dur = vfxAddBloodPulse(Game, unit, {
            bindingKey,
            timing: 'charge_up'
          });
          applyBusyFromVfx(startedAt, dur);
        } catch (_) {}
      }

      const damageSpec = u.damage || {};
      const dtype = damageSpec.type || 'arcane';
      const attackType = u.countsAsBasic ? 'basic' : 'skill';
      const wilScale = Number.isFinite(damageSpec.scaleWIL) ? damageSpec.scaleWIL : (damageSpec.scaleWil ?? 0);
      const flatAdd = Number.isFinite(damageSpec.flat) ? damageSpec.flat : (damageSpec.flatAdd ?? 0);
      const debuffSpec = u.appliesDebuff || null;
      const debuffId = debuffSpec?.id || 'loithienanh_spd_burn';
      const debuffAmount = Number.isFinite(debuffSpec?.amount)
        ? debuffSpec.amount
        : (Number.isFinite(debuffSpec?.amountPercent) ? debuffSpec.amountPercent : 0);
      const debuffMaxStacks = Math.max(1, (debuffSpec?.maxStacks | 0) || 1);
      const debuffDuration = Number.isFinite(debuffSpec?.turns)
        ? debuffSpec.turns
        : (Number.isFinite(u.duration) ? u.duration : (u.turns || 1));

      for (const tgt of selected){
        if (!tgt || !tgt.alive) continue;
        const tgtRank = Game?.meta?.rankOf?.(tgt.id) || tgt?.rank || '';
        const isBoss = typeof tgtRank === 'string' && tgtRank.toLowerCase() === 'boss';
        const pctDefault = Number.isFinite(damageSpec.percentTargetMaxHP)
          ? damageSpec.percentTargetMaxHP
          : (Number.isFinite(damageSpec.basePercentMaxHPTarget) ? damageSpec.basePercentMaxHPTarget : 0);
        const pct = isBoss
          ? (Number.isFinite(damageSpec.bossPercent) ? damageSpec.bossPercent : pctDefault)
          : pctDefault;
        const baseFromPct = Math.round(Math.max(0, pct) * Math.max(0, tgt.hpMax || 0));
        const baseFromWil = Math.round(Math.max(0, wilScale || 0) * Math.max(0, unit.wil || 0));
        const baseFlat = Math.round(Math.max(0, flatAdd || 0));
        const base = Math.max(1, baseFromPct + baseFromWil + baseFlat);
        dealAbilityDamage(Game, unit, tgt, {
          base,
          dtype,
          attackType,
          defPen: Number.isFinite(damageSpec.defPen) ? damageSpec.defPen : (damageSpec.pen ?? 0)
        });

        {
          const startedAt = getNow();
          try {
            const dur = vfxAddLightningArc(Game, unit, tgt, {
              bindingKey,
              timing: 'burst_core',
              targetBindingKey: bindingKey,
              targetTiming: 'burst_core'
            });
            applyBusyFromVfx(startedAt, dur);
          } catch (_) {}
        }

        if (debuffAmount && tgt.alive){
          const existing = Statuses.get(tgt, debuffId);
          if (existing){
            existing.stacks = Math.min(debuffMaxStacks, (existing.stacks || 1) + 1);
            if (Number.isFinite(debuffDuration)) existing.dur = debuffDuration;
          } else {
            Statuses.add(tgt, {
              id: debuffId,
              kind: 'debuff',
              tag: 'stat',
              attr: 'spd',
              mode: 'percent',
              amount: debuffAmount,
              stacks: 1,
              maxStacks: debuffMaxStacks,
              dur: Number.isFinite(debuffDuration) ? debuffDuration : undefined,
              tick: 'turn'
            });
          }
          if (typeof tgt._recalcStats === 'function') tgt._recalcStats();
        }
      }

      {
        const startedAt = getNow();
        try {
          const dur = vfxAddGroundBurst(Game, unit, {
            bindingKey,
            anchorId: 'right_foot',
            timing: 'ground_crack'
          });
          applyBusyFromVfx(startedAt, dur);
        } catch (_) {}
      }

      {
        const startedAt = getNow();
        try {
          const dur = vfxAddGroundBurst(Game, unit, {
            bindingKey,
            anchorId: 'left_foot',
            timing: 'ground_crack'
          });
          applyBusyFromVfx(startedAt, dur);
        } catch (_) {}
      }

      {
       const startedAt = getNow();
        try {
          const dur = vfxAddShieldWrap(Game, unit, {
            bindingKey,
            anchorId: 'root',
            timing: 'burst_core'
          });
          applyBusyFromVfx(startedAt, dur);
        } catch (_) {}
      }

      if (Number.isFinite(u.reduceDmg) && u.reduceDmg > 0){
        const turns = Number.isFinite(u.duration) ? u.duration : (u.turns || 1);
        Statuses.add(unit, Statuses.make.damageCut({ pct: u.reduceDmg, turns }));
      }

      busyMs = Math.max(busyMs, 1600);
      break;
    }

    case 'strikeLaneMid': {
      const primary = pickTarget(Game, unit);
      if (!primary) break;
      const laneX = primary.cx;
      const aliveNow = tokensAlive();
      const laneTargets = aliveNow.filter(t => t.side === foeSide && t.cx === laneX);
      const hits = Math.max(1, (u.hits|0) || 1);
      const scale = typeof u.scale === 'number' ? u.scale : 0.9;
      const meleeDur = CFG?.ANIMATION?.meleeDurationMs ?? 1100;
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
      if (maxPay > 0){
        applyDamage(unit, maxPay);
        gainFury(unit, {
          type: 'damageTaken',
          dealt: maxPay,
          selfMaxHp: Number.isFinite(unit?.hpMax) ? unit.hpMax : undefined,
          damageTaken: maxPay
        });
        finishFuryHit(unit);
      }
      const reduce = Math.max(0, u.reduceDmg ?? 0);
      if (reduce > 0){
        Statuses.add(unit, Statuses.make.damageCut({ pct: reduce, turns: u.turns || 1 }));
      }
      try { vfxAddHit(Game, unit); } catch(_){}
      busyMs = 800;
      break;
    }

    case 'sleep': {
      const aliveNow = tokensAlive();
      const foes = aliveNow.filter(t => t.side === foeSide);
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
      const tokens = Game?.tokens || [];
      const fallen = tokens.filter(t => t.side === unit.side && !t.alive);
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
        if (ally){
          setFury(ally, Math.max(0, (u.revived?.rage) ?? 0));
        }
        if (u.revived?.lockSkillsTurns){
          Statuses.add(ally, Statuses.make.silence({ turns: u.revived.lockSkillsTurns }));
        }
        try { vfxAddSpawn(Game, ally.cx, ally.cy, ally.side); } catch(_){}
      }
      busyMs = 1500;
      break;
    }

    case 'equalizeHP': {
      const aliveNow = tokensAlive();
      let allies = aliveNow.filter(t => t.side === unit.side);
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
        const tokens = Game?.tokens || [];
        const leader = tokens.find(t => t.id === leaderId && t.alive);
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
      const aliveNow = tokensAlive();
      const others = aliveNow.filter(t => t.side === unit.side && t !== unit);
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
  spendFury(unit, resolveUltCost(unit));
}
const tokensAlive = () => (Game?.tokens || []).filter(t => t.alive);

function ensureBattleState(game){
  if (!game || typeof game !== 'object') return null;
  if (!game.battle || typeof game.battle !== 'object'){
    game.battle = {
      over: false,
      winner: null,
      reason: null,
      detail: null,
      finishedAt: 0,
      result: null
    };
  }
  if (typeof game.result === 'undefined'){
    game.result = null;
  }
  if (!Object.prototype.hasOwnProperty.call(game.battle, 'result')){
    game.battle.result = null;
  }
  return game.battle;
}

function isUnitAlive(unit){
  if (!unit) return false;
  if (!unit.alive) return false;
  if (Number.isFinite(unit.hp)){
    return unit.hp > 0;
  }
  return true;
}

function getHpRatio(unit){
  if (!unit) return 0;
  const hp = Number.isFinite(unit.hp) ? unit.hp : 0;
  const hpMax = Number.isFinite(unit.hpMax) ? unit.hpMax : 0;
  if (hpMax > 0){
    return Math.max(0, Math.min(1, hp / hpMax));
  }
  return hp > 0 ? 1 : 0;
}

function snapshotLeader(unit){
  if (!unit) return null;
  return {
    id: unit.id || null,
    side: unit.side || null,
    alive: !!unit.alive,
    hp: Number.isFinite(unit.hp) ? Math.max(0, unit.hp) : null,
    hpMax: Number.isFinite(unit.hpMax) ? Math.max(0, unit.hpMax) : null
  };
}

function isBossToken(game, token){
  if (!token) return false;
  if (token.isBoss) return true;
  const rankRaw = typeof token.rank === 'string' && token.rank ? token.rank : (game?.meta?.rankOf?.(token.id) || '');
  const rank = typeof rankRaw === 'string' ? rankRaw.toLowerCase() : '';
  return rank === 'boss';
}

function isPvpMode(game){
  const key = (game?.modeKey || '').toString().toLowerCase();
  if (!key) return false;
  if (key === 'ares') return true;
  return key.includes('pvp');
}

function finalizeBattle(game, payload, context){
  const battle = ensureBattleState(game);
  if (!battle || battle.over) return battle?.result || null;
  const finishedAt = Number.isFinite(payload?.finishedAt) ? payload.finishedAt : getNow();
  const result = {
    winner: payload?.winner ?? null,
    reason: payload?.reason ?? null,
    detail: payload?.detail ?? null,
    finishedAt
  };
  battle.over = true;
  battle.winner = result.winner;
  battle.reason = result.reason;
  battle.detail = result.detail;
  battle.finishedAt = finishedAt;
  battle.result = result;
  game.result = result;
  if (game.turn){
    game.turn.completed = true;
    game.turn.busyUntil = finishedAt;
  }
  if (game === Game){
    running = false;
    clearSessionTimers();
    try {
      if (hud && typeof hud.update === 'function' && Game) hud.update(Game);
    } catch (_) {}
    scheduleDraw();
  }
  emitGameEvent(BATTLE_END, { game, result, context });
  return result;
}

function checkBattleEnd(game, context = {}){
  if (!game) return null;
  const battle = ensureBattleState(game);
  if (!battle) return null;
  if (battle.over) return battle.result || null;

  const tokens = Array.isArray(game.tokens) ? game.tokens : [];
  const leaderA = tokens.find(t => t && t.id === 'leaderA');
  const leaderB = tokens.find(t => t && t.id === 'leaderB');
  const leaderAAlive = isUnitAlive(leaderA);
  const leaderBAlive = isUnitAlive(leaderB);

  const contextDetail = context && typeof context === 'object' ? { ...context } : {};
  const detail = {
    context: contextDetail,
    leaders: {
      ally: snapshotLeader(leaderA),
      enemy: snapshotLeader(leaderB)
    }
  };

  let winner = null;
  let reason = null;

  if (!leaderAAlive || !leaderBAlive){
    reason = 'leader_down';
    if (leaderAAlive && !leaderBAlive) winner = 'ally';
    else if (!leaderAAlive && leaderBAlive) winner = 'enemy';
    else winner = 'draw';
  } else if (contextDetail.trigger === 'timeout'){
    reason = 'timeout';
    const remain = Number.isFinite(contextDetail.remain) ? contextDetail.remain : 0;
    if (isPvpMode(game)){
      const allyRatio = getHpRatio(leaderA);
      const enemyRatio = getHpRatio(leaderB);
      detail.timeout = {
        mode: 'pvp',
        remain,
        hpRatio: { ally: allyRatio, enemy: enemyRatio }
      };
      if (allyRatio > enemyRatio) winner = 'ally';
      else if (enemyRatio > allyRatio) winner = 'enemy';
      else winner = 'draw';
    } else {
      const bossAlive = tokens.some(t => t && t.alive && t.side === 'enemy' && isBossToken(game, t));
      detail.timeout = {
        mode: 'pve',
        remain,
        bossAlive
      };
      winner = bossAlive ? 'enemy' : 'ally';
    }
  }

  if (!winner) return null;

  const finishedAt = Number.isFinite(contextDetail.timestamp) ? contextDetail.timestamp : undefined;
  return finalizeBattle(game, { winner, reason, detail, finishedAt }, contextDetail);
}
// Giảm TTL minion của 1 phe sau khi phe đó kết thúc phase
function tickMinionTTL(side){
  // gom những minion hết hạn để xoá sau vòng lặp
  if (!Game?.tokens) return;
  const tokens = Game.tokens;
  const toRemove = [];
  for (const t of tokens){
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
    const idx = tokens.indexOf(t);
    if (idx >= 0) tokens.splice(idx, 1);
  }
}

function init(){
  if (!Game) return false;
  if (Game._inited) return true;
  const doc = docRef || (typeof document !== 'undefined' ? document : null);
  if (!doc) return false;
  const root = rootElement || null;
  const boardFromRoot = (root && typeof root.querySelector === 'function')
    ? root.querySelector('#board')
    : null;
  const boardFromDocument = (typeof doc.querySelector === 'function')
    ? doc.querySelector('#board')
    : (typeof doc.getElementById === 'function' ? doc.getElementById('board') : null);
  const boardEl = /** @type {HTMLCanvasElement|null} */ (boardFromRoot || boardFromDocument);
  if (!boardEl){
    return false;
  }
  canvas = boardEl;
  ctx = /** @type {CanvasRenderingContext2D} */ (boardEl.getContext('2d'));
  
  if (typeof hudCleanup === 'function'){
    hudCleanup();
    hudCleanup = null;
  }
  hud = initHUD(doc, root);
  hudCleanup = (hud && typeof hud.cleanup === 'function') ? hud.cleanup : null;
  resize();
  if (Game.grid) spawnLeaders(Game.tokens, Game.grid);

  const tokens = Game.tokens || [];
  tokens.forEach(t=>{
    if (t.id === 'leaderA' || t.id === 'leaderB'){
      vfxAddSpawn(Game, t.cx, t.cy, t.side);
    }
  });
  tokens.forEach(t=>{
    if (!t.iid) t.iid = nextIid();
    if (t.id === 'leaderA' || t.id === 'leaderB'){
      Object.assign(t, {
        hpMax: 1600, hp: 1600, arm: 0.12, res: 0.12, atk: 40, wil: 30,
        aeMax: 0, ae: 0
      });
      initializeFury(t, t.id, 0);
    }
  });
  tokens.forEach(t => { if (!t.iid) t.iid = nextIid(); });

  if (hud && typeof hud.update === 'function' && Game) hud.update(Game);
  scheduleDraw();
  Game._inited = true;

  refillDeck();
  refillDeckEnemy(Game);

  Game.ui.bar = startSummonBar(doc, {
    onPick: (c)=>{
      Game.selectedId = c.id;
      Game.ui.bar.render();
    },
    canAfford: (c)=> Game.cost >= c.cost,
    getDeck: ()=> Game.deck3,
    getSelectedId: ()=> Game.selectedId
  }, root);

  selectFirstAffordable();
  Game.ui.bar.render();

  if (canvasClickHandler){
    canvas.removeEventListener('click', canvasClickHandler);
    canvasClickHandler = null;
  }
  canvasClickHandler = (ev)=>{
    if (!Game.grid) return;
    const rect = canvas.getBoundingClientRect();
    const p = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    const cell = hitToCellOblique(Game.grid, p.x, p.y, CAM_PRESET);
    if (!cell) return;

    if (cell.cx >= CFG.ALLY_COLS) return;

    const card = Game.deck3.find(u => u.id === Game.selectedId);
    if (!card) return;

    if (cellReserved(tokensAlive(), Game.queued, cell.cx, cell.cy)) return;
    if (Game.cost < card.cost) return;
    if (Game.summoned >= Game.summonLimit) return;

    const slot = slotIndex('ally', cell.cx, cell.cy);
    if (Game.queued.ally.has(slot)) return;

    const spawnCycle = predictSpawnCycle(Game, 'ally', slot);
    const pendingArt = getUnitArt(card.id);
    const pending = {
      unitId: card.id, name: card.name, side:'ally',
      cx: cell.cx, cy: cell.cy, slot, spawnCycle,
      source: 'deck',
      color: pendingArt?.palette?.primary || '#a9f58c',
      art: pendingArt,
      skinKey: pendingArt?.skinKey
    };
    Game.queued.ally.set(slot, pending);

    Game.cost = Math.max(0, Game.cost - card.cost);
    if (hud && typeof hud.update === 'function' && Game) hud.update(Game);
    Game.summoned += 1;
    Game.usedUnitIds.add(card.id);

    Game.deck3 = Game.deck3.filter(u => u.id !== card.id);
    Game.selectedId = null;
    refillDeck();
    selectFirstAffordable();
    Game.ui.bar.render();
    scheduleDraw();
  };
  canvas.addEventListener('click', canvasClickHandler);

  if (resizeHandler && winRef && typeof winRef.removeEventListener === 'function'){
    winRef.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  resizeHandler = ()=>{ scheduleResize(); };
  if (winRef && typeof winRef.addEventListener === 'function'){
    winRef.addEventListener('resize', resizeHandler);
  }

const viewport = winRef?.visualViewport;
  if (viewport && typeof viewport.addEventListener === 'function'){
    if (visualViewportResizeHandler && typeof viewport.removeEventListener === 'function'){
      viewport.removeEventListener('resize', visualViewportResizeHandler);
    }
    visualViewportResizeHandler = ()=>{ scheduleResize(); };
    viewport.addEventListener('resize', visualViewportResizeHandler);

    if (visualViewportScrollHandler && typeof viewport.removeEventListener === 'function'){
      viewport.removeEventListener('scroll', visualViewportScrollHandler);
    }
    visualViewportScrollHandler = ()=>{ scheduleResize(); };
    viewport.addEventListener('scroll', visualViewportScrollHandler);
  }

  const queryFromRoot = (selector)=>{
    if (root && typeof root.querySelector === 'function'){
      const el = root.querySelector(selector);
      if (el) return el;
    }
    return null;
  };
  
  const updateTimerAndCost = (timestamp)=>{
    if (!CLOCK) return;
    if (!Game) return;
    if (Game?.battle?.over) return;

    const now = Number.isFinite(timestamp) ? timestamp : getNow();
    const elapsedSec = Math.floor((now - CLOCK.startMs) / 1000);

    const prevRemain = Number.isFinite(CLOCK.lastTimerRemain) ? CLOCK.lastTimerRemain : 0;
    const remain = Math.max(0, 240 - elapsedSec);
    if (remain !== CLOCK.lastTimerRemain){
      CLOCK.lastTimerRemain = remain;
      const mm = String(Math.floor(remain/60)).padStart(2,'0');
      const ss = String(remain%60).padStart(2,'0');
      const tEl = /** @type {HTMLElement|null} */ (queryFromRoot('#timer') || doc.getElementById('timer'));
      if (tEl) tEl.textContent = `${mm}:${ss}`;
    }

    if (remain <= 0 && prevRemain > 0){
      const timeoutResult = checkBattleEnd(Game, { trigger: 'timeout', remain, timestamp: now });
      if (timeoutResult) return;
    }

    const deltaSec = elapsedSec - CLOCK.lastCostCreditedSec;
    if (deltaSec > 0) {
      if (Game.cost < Game.costCap) {
        Game.cost = Math.min(Game.costCap, Game.cost + deltaSec);
      }
      if (Game.ai.cost < Game.ai.costCap) {
        Game.ai.cost = Math.min(Game.ai.costCap, Game.ai.cost + deltaSec);
      }

      CLOCK.lastCostCreditedSec = elapsedSec;

      if (hud && typeof hud.update === 'function' && Game) hud.update(Game);
      if (!Game.selectedId) selectFirstAffordable();
      if (Game.ui?.bar) Game.ui.bar.render();
      aiMaybeAct(Game, 'cost');
    }

  if (Game?.battle?.over) return;

    const busyUntil = (Game.turn?.busyUntil) ?? 0;
    if (now >= busyUntil && now - CLOCK.lastTurnStepMs >= CLOCK.turnEveryMs){
      CLOCK.lastTurnStepMs = now;
      stepTurn(Game, {
        performUlt,
        processActionChain,
        allocIid: nextIid,
        doActionOrSkip,
        checkBattleEnd
      });
      cleanupDead(now);
      const postTurnResult = checkBattleEnd(Game, { trigger: 'post-turn', timestamp: now });
      if (postTurnResult){
        scheduleDraw();
        return;
      }
      scheduleDraw();
      aiMaybeAct(Game, 'board');
    }
  };

  const runTickLoop = (timestamp)=>{
    tickLoopHandle = null;
    updateTimerAndCost(timestamp);
    if (!running || !CLOCK) return;
    scheduleTickLoop();
  };

  function scheduleTickLoop(){
    if (!running || !CLOCK) return;
    if (tickLoopHandle !== null) return;
    const raf = (winRef && typeof winRef.requestAnimationFrame === 'function')
      ? winRef.requestAnimationFrame.bind(winRef)
      : (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null);
    if (raf){
      tickLoopUsesTimeout = false;
      tickLoopHandle = raf(runTickLoop);
    } else {
      tickLoopUsesTimeout = true;
      tickLoopHandle = setTimeout(()=> runTickLoop(getNow()), 16);
    }
  }
  updateTimerAndCost(getNow());
  scheduleTickLoop();
  return true;
}

function selectFirstAffordable(){
  if (!Game) return;

  const deck = Array.isArray(Game.deck3) ? Game.deck3 : [];
  if (!deck.length){
    Game.selectedId = null;
    return;
  }

  let cheapestAffordable = null;
  let cheapestAffordableCost = Infinity;
  let cheapestOverall = null;
  let cheapestOverallCost = Infinity;

  for (const card of deck){
    if (!card) continue;

    const hasFiniteCost = Number.isFinite(card.cost);
    const cardCost = hasFiniteCost ? card.cost : 0;

    if (cardCost < cheapestOverallCost){
      cheapestOverall = card;
      cheapestOverallCost = cardCost;
    }

    const affordable = !hasFiniteCost || card.cost <= Game.cost;
    if (affordable && cardCost < cheapestAffordableCost){
      cheapestAffordable = card;
      cheapestAffordableCost = cardCost;
    }
  }

  const chosen = (cheapestAffordable || cheapestOverall) ?? null;
  Game.selectedId = chosen ? chosen.id : null;
}

/* ---------- Deck logic ---------- */
function refillDeck(){
  if (!Game) return;

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
  if (!canvas || !Game) return;                         // guard
  const prevGrid = Game?.grid ? {
    w: Game.grid.w,
    h: Game.grid.h,
    dpr: Game.grid.dpr,
    cols: Game.grid.cols,
    rows: Game.grid.rows,
    tile: Game.grid.tile
  } : null;
  Game.grid = makeGrid(canvas, CFG.GRID_COLS, CFG.GRID_ROWS);
  if (ctx && Game.grid){
    const maxDprCfg = CFG.UI?.MAX_DPR;
    const maxDpr = Number.isFinite(maxDprCfg) && maxDprCfg > 0 ? maxDprCfg : 3;
    const view = winRef || (typeof window !== 'undefined' ? window : null);
    const viewDprRaw = Number.isFinite(view?.devicePixelRatio) && (view?.devicePixelRatio || 0) > 0
      ? view.devicePixelRatio
      : 1;
    const fallbackDpr = Math.min(maxDpr, viewDprRaw);
    const gridDpr = Number.isFinite(Game.grid.dpr) && Game.grid.dpr > 0
      ? Math.min(maxDpr, Game.grid.dpr)
      : fallbackDpr;
    const dpr = gridDpr;
    if (typeof ctx.setTransform === 'function'){
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    } else {
      if (typeof ctx.resetTransform === 'function'){
        ctx.resetTransform();
      }
      if (typeof ctx.scale === 'function'){
        ctx.scale(dpr, dpr);
      }
    }
  }
  const g = Game.grid;
  const gridChanged = !prevGrid
    || prevGrid.w !== g.w
    || prevGrid.h !== g.h
    || prevGrid.dpr !== g.dpr
    || prevGrid.cols !== g.cols
    || prevGrid.rows !== g.rows
    || prevGrid.tile !== g.tile;
  if (gridChanged){
    hpBarGradientCache.clear();
    invalidateSceneCache();
  }
}
function draw(){
  if (!ctx || !canvas || !Game?.grid) return;           // guard
  const clearW = Game.grid?.w ?? canvas.width;
  const clearH = Game.grid?.h ?? canvas.height;
  ctx.clearRect(0, 0, clearW, clearH);
  const cache = ensureSceneCache({
    game: Game,
    canvas,
    documentRef: docRef,
    camPreset: CAM_PRESET
  });
  if (cache && cache.canvas){
    ctx.drawImage(cache.canvas, 0, 0, cache.pixelWidth, cache.pixelHeight, 0, 0, cache.cssWidth, cache.cssHeight);
  } else {
    const sceneCfg = CFG.SCENE || {};
    const themeKey = Game.sceneTheme || sceneCfg.CURRENT_THEME || sceneCfg.DEFAULT_THEME;
    const theme = (sceneCfg.THEMES && themeKey) ? sceneCfg.THEMES[themeKey] : null;
    if (Game.grid) drawBattlefieldScene(ctx, Game.grid, theme);
    if (Game.grid) drawEnvironmentProps(ctx, Game.grid, CAM_PRESET, Game.backgroundKey);
  }
  if (Game.grid){
    drawGridOblique(ctx, Game.grid, CAM_PRESET);
    drawQueuedOblique(ctx, Game.grid, Game.queued, CAM_PRESET);
    const tokens = Game.tokens || [];
    drawTokensOblique(ctx, Game.grid, tokens, CAM_PRESET);
  }
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

function normalizeHpBarCacheKey(fillColor, innerHeight, innerRadius, startY){
  const color = typeof fillColor === 'string' ? fillColor.trim().toLowerCase() : String(fillColor ?? '');
  const height = Number.isFinite(innerHeight) ? Math.max(0, Math.round(innerHeight)) : 0;
  const radius = Number.isFinite(innerRadius) ? Math.max(0, Math.round(innerRadius)) : 0;
  const start = Number.isFinite(startY) ? Math.round(startY * 100) / 100 : 0;
  return `${color}|h:${height}|r:${radius}|y:${start}`;
}

function ensureHpBarGradient(fillColor, innerHeight, innerRadius, startY, x){
  const key = normalizeHpBarCacheKey(fillColor, innerHeight, innerRadius, startY);
  const cached = hpBarGradientCache.get(key);
  if (cached) return cached;
  if (!ctx || !Number.isFinite(innerHeight) || innerHeight <= 0){
    hpBarGradientCache.set(key, fillColor);
    return fillColor;
  }
  const startYSafe = Number.isFinite(startY) ? startY : 0;
  const gradient = ctx.createLinearGradient(x, startYSafe, x, startYSafe + innerHeight);
  if (!gradient){
    hpBarGradientCache.set(key, fillColor);
    return fillColor;
  }
  const topFill = lightenColor(fillColor, 0.25);
  gradient.addColorStop(0, topFill);
  gradient.addColorStop(1, fillColor);
  hpBarGradientCache.set(key, gradient);
  return gradient;
}

function drawHPBars(){
  if (!ctx || !Game?.grid) return;
  const baseR = Math.floor(Game.grid.tile * 0.36);
  const tokens = Game.tokens || [];
  for (const t of tokens){
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
      const gradientY = y + inset;
      const gradientX = x + inset;
      const fillStyle = ensureHpBarGradient(fillColor, innerHeight, innerRadius, gradientY, gradientX);
      ctx.save();
      ctx.translate(gradientX, gradientY);
      roundedRectPathUI(ctx, 0, 0, filledWidth, innerHeight, innerRadius);
      ctx.fillStyle = fillStyle;
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}
/* ---------- Chạy ---------- */
function handleVisibilityChange(){
  if (!docRef) return;
  setDrawPaused(!!docRef.hidden);
}

function bindVisibility(){
  if (visibilityHandlerBound) return;
  const doc = docRef;
  if (!doc || typeof doc.addEventListener !== 'function') return;
  doc.addEventListener('visibilitychange', handleVisibilityChange);
  visibilityHandlerBound = true;
}

function unbindVisibility(){
  if (!visibilityHandlerBound) return;
  const doc = docRef;
  if (doc && typeof doc.removeEventListener === 'function'){
    doc.removeEventListener('visibilitychange', handleVisibilityChange);
  }
  visibilityHandlerBound = false;
}

function configureRoot(root){
  rootElement = root || null;
  if (rootElement && rootElement.ownerDocument){
    docRef = rootElement.ownerDocument;
  } else if (rootElement && rootElement.nodeType === 9){
    docRef = rootElement;
  } else {
    docRef = typeof document !== 'undefined' ? document : null;
  }
  winRef = docRef?.defaultView ?? (typeof window !== 'undefined' ? window : null);
}

function clearSessionTimers(){
  if (tickLoopHandle !== null){
    if (tickLoopUsesTimeout){
      clearTimeout(tickLoopHandle);
    } else {
      const cancel = (winRef && typeof winRef.cancelAnimationFrame === 'function')
        ? winRef.cancelAnimationFrame.bind(winRef)
        : (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : null);
      if (cancel){
        cancel(tickLoopHandle);
      }
    }
    tickLoopHandle = null;
    tickLoopUsesTimeout = false;
  }
  cancelScheduledDraw();
  cancelScheduledResize();
}

function clearSessionListeners(){
  if (canvas && canvasClickHandler && typeof canvas.removeEventListener === 'function'){
    canvas.removeEventListener('click', canvasClickHandler);
  }
  canvasClickHandler = null;
  if (typeof hudCleanup === 'function'){
    hudCleanup();
  }
  hudCleanup = null;
  if (resizeHandler && winRef && typeof winRef.removeEventListener === 'function'){
    winRef.removeEventListener('resize', resizeHandler);
  }
  resizeHandler = null;
  const viewport = winRef?.visualViewport;
  if (viewport && typeof viewport.removeEventListener === 'function'){
    if (visualViewportResizeHandler){
      viewport.removeEventListener('resize', visualViewportResizeHandler);
    }
    if (visualViewportScrollHandler){
      viewport.removeEventListener('scroll', visualViewportScrollHandler);
    }
  }
  visualViewportResizeHandler = null;
  visualViewportScrollHandler = null;
  cancelScheduledResize();
  unbindArtSpriteListener();
  unbindVisibility();
}

function resetDomRefs(){
  canvas = null;
  ctx = null;
  hud = null;
  hudCleanup = null;
  hpBarGradientCache.clear();
  invalidateSceneCache();
}

function stopSession(){
  clearSessionTimers();
  clearSessionListeners();
  if (Game){
    if (Game.queued?.ally?.clear) Game.queued.ally.clear();
    if (Game.queued?.enemy?.clear) Game.queued.enemy.clear();
    if (Array.isArray(Game.tokens)) Game.tokens.length = 0;
    if (Array.isArray(Game.deck3)) Game.deck3.length = 0;
    if (Game.usedUnitIds?.clear) Game.usedUnitIds.clear();
    if (Game.ai){
      Game.ai.deck = Array.isArray(Game.ai.deck) ? [] : Game.ai.deck;
      if (Game.ai.usedUnitIds?.clear) Game.ai.usedUnitIds.clear();
      Game.ai.selectedId = null;
      Game.ai.cost = 0;
      Game.ai.summoned = 0;
    }
    Game.cost = 0;
    Game.summoned = 0;
    Game.selectedId = null;
    Game._inited = false;
  }
  resetDomRefs();
  CLOCK = null;
  Game = null;
  running = false;
  invalidateSceneCache();
}

function bindSession(){
  bindArtSpriteListener();
  bindVisibility();
  if (docRef){
    setDrawPaused(!!docRef.hidden);
  } else {
    setDrawPaused(false);
  }
}

function startSession(config = {}){
  configureRoot(rootElement);
  const overrides = normalizeConfig(config);
  if (running) stopSession();
  resetSessionState(overrides);
  resetDomRefs();
  running = true;
  try {
    const initialised = init();
    if (!initialised){
      stopSession();
      return null;
    }
    if (!Game || !Game._inited){
      throw new Error('Unable to initialise PvE session');
    }
    bindSession();
    return Game;
  } catch (err) {
    running = false;
    stopSession();
    throw err;
  }
}

function applyConfigToRunningGame(cfg){
  if (!Game) return;
  let sceneChanged = false;
  if (typeof cfg.sceneTheme !== 'undefined'){
    if (Game.sceneTheme !== cfg.sceneTheme) sceneChanged = true;
    Game.sceneTheme = cfg.sceneTheme;
  }
  if (typeof cfg.backgroundKey !== 'undefined'){
    if (Game.backgroundKey !== cfg.backgroundKey){
      sceneChanged = true;
      clearBackgroundSignatureCache();
    }
    Game.backgroundKey = cfg.backgroundKey;
  }
  if (typeof cfg.modeKey !== 'undefined'){
    Game.modeKey = typeof cfg.modeKey === 'string' ? cfg.modeKey : (cfg.modeKey || null);
  }
  if (Array.isArray(cfg.deck) && cfg.deck.length) Game.unitsAll = cfg.deck;
  if (cfg.aiPreset){
    const preset = cfg.aiPreset || {};
    if (Array.isArray(preset.deck) && preset.deck.length){
      Game.ai.unitsAll = preset.deck;
    } else if (Array.isArray(preset.unitsAll) && preset.unitsAll.length){
      Game.ai.unitsAll = preset.unitsAll;
    }
    if (Number.isFinite(preset.costCap)) Game.ai.costCap = preset.costCap;
    if (Number.isFinite(preset.summonLimit)) Game.ai.summonLimit = preset.summonLimit;
  }
  if (sceneChanged){
    invalidateSceneCache();
    scheduleDraw();
  }
}

function updateSessionConfig(next = {}){
  const normalized = normalizeConfig(next);
  storedConfig = normalizeConfig({ ...storedConfig, ...normalized });
  applyConfigToRunningGame(normalized);
}

export function createPveSession(rootEl, options = {}){
  const normalized = normalizeConfig(options || {});
  storedConfig = { ...normalized };
  configureRoot(rootEl);
  return {
    start(startConfig = {}){
      if (startConfig && (startConfig.root || startConfig.rootEl)) {
        const r = startConfig.root || startConfig.rootEl;
        const rest = { ...startConfig };
        delete rest.root;
        delete rest.rootEl;
        configureRoot(r);
        return startSession(rest);
      }
      return startSession(startConfig);
    },
    stop(){
      stopSession();
    },
    updateConfig(next = {}){
      updateSessionConfig(next);
    },
    setUnitSkin(unitId, skinKey){
      return setUnitSkinForSession(unitId, skinKey);
    },
  };
}

export function __getStoredConfig(){
  return storedConfig ? { ...storedConfig } : {};
}

export function __getActiveGame(){
  return Game;
}
export { gameEvents, emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END, TURN_REGEN, BATTLE_END } from '../../events.ts';
export { clearBackgroundSignatureCache, computeBackgroundSignature, __backgroundSignatureCache } from './session-state.ts';