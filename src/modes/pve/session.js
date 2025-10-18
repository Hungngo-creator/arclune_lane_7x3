//v0.7.6
import { stepTurn, doActionOrSkip } from '../../turns.js';
import { enqueueImmediate, processActionChain } from '../../summon.js';
import { refillDeckEnemy, aiMaybeAct } from '../../ai.js';
import { Statuses } from '../../statuses.js';
import { CFG, CAM } from '../../config.js';
import { UNITS } from '../../units.js';
import { Meta, makeInstanceStats, initialRageFor } from '../../meta.js';
import { basicAttack, pickTarget, dealAbilityDamage, healUnit, grantShield, applyDamage } from '../../combat.js';
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
} from '../../engine.js';
import { drawEnvironmentProps, getEnvironmentBackground } from '../../background.js';
import { getUnitArt, setUnitSkin } from '../../art.js';
import { initHUD, startSummonBar } from '../../ui.js';
import { vfxDraw, vfxAddSpawn, vfxAddHit, vfxAddMelee } from '../../vfx.js';
import { drawBattlefieldScene, getCachedBattlefieldScene } from '../../scene.js';
import { gameEvents, TURN_START, TURN_END, ACTION_START, ACTION_END } from '../../events.js';
import { ensureNestedModuleSupport } from '../../utils/dummy.js';
import { safeNow } from '../../utils/time.js';
import { getSummonSpec, resolveSummonSlots } from '../../utils/kit.js';
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

let Game = null;
let tickLoopHandle = null;
let tickLoopUsesTimeout = false;
let resizeHandler = null;
let resizeSchedulerHandle = null;
let resizeSchedulerUsesTimeout = false;
let pendingResize = false;
let canvasClickHandler = null;
let artSpriteHandler = null;
let visibilityHandlerBound = false;
let winRef = null;
let docRef = null;
let rootElement = null;
let storedConfig = {};
let running = false;
let sceneCache = null;
const hpBarGradientCache = new Map();
const backgroundSignatureCache = new Map();

function stableStringify(value, seen = new WeakSet()){
  if (value === null) return 'null';
  const type = typeof value;
  if (type === 'undefined') return 'undefined';
  if (type === 'number' || type === 'boolean' || type === 'bigint') return String(value);
  if (type === 'string') return JSON.stringify(value);
  if (type === 'symbol') return value.toString();
  if (type === 'function') return `[Function:${value.name || 'anonymous'}]`;
  if (Array.isArray(value)){
    return `[${value.map(entry => stableStringify(entry, seen)).join(',')}]`;
  }
  if (type === 'object'){
    if (seen.has(value)) return '"[Circular]"';
    seen.add(value);
    const keys = Object.keys(value).sort();
    const entries = keys.map(key => `${JSON.stringify(key)}:${stableStringify(value[key], seen)}`);
    seen.delete(value);
    return `{${entries.join(',')}}`;
  }
  return String(value);
}

function normalizeBackgroundCacheKey(backgroundKey){
  return `key:${backgroundKey ?? '__no-key__'}`;
}

export function clearBackgroundSignatureCache(){
  backgroundSignatureCache.clear();
}

export function computeBackgroundSignature(backgroundKey){
  const cacheKey = normalizeBackgroundCacheKey(backgroundKey);
  const config = getEnvironmentBackground(backgroundKey);
  if (!config){
    backgroundSignatureCache.delete(cacheKey);
    return `${backgroundKey || 'no-key'}:no-config`;
  }
  const cached = backgroundSignatureCache.get(cacheKey);
  if (cached && cached.config === config){
    return cached.signature;
  }
  let signature;
  try {
    signature = `${backgroundKey || 'no-key'}:${stableStringify(config)}`;
  } catch (_) {
    const keyPart = config?.key ?? '';
    const themePart = config?.theme ?? '';
    const propsLength = Array.isArray(config?.props) ? config.props.length : 0;
    signature = `${backgroundKey || 'no-key'}:fallback:${String(keyPart)}:${String(themePart)}:${propsLength}`;
  }
  backgroundSignatureCache.set(cacheKey, { config, signature });
  return signature;
}

function normalizeConfig(input = {}){
  const out = { ...input };
  const scene = input.scene || {};
  if (typeof out.sceneTheme === 'undefined' && typeof scene.theme !== 'undefined'){
    out.sceneTheme = scene.theme;
  }
  if (typeof out.backgroundKey === 'undefined'){
    if (typeof scene.backgroundKey !== 'undefined') out.backgroundKey = scene.backgroundKey;
    else if (typeof scene.background !== 'undefined') out.backgroundKey = scene.background;
  }
  delete out.scene;
  return out;
}

function createGameState(options = {}){
  options = normalizeConfig(options);
  const modeKey = typeof options.modeKey === 'string' ? options.modeKey : null;
  const sceneTheme = options.sceneTheme
    ?? CFG.SCENE?.CURRENT_THEME
    ?? CFG.SCENE?.DEFAULT_THEME;
  const backgroundKey = options.backgroundKey
    ?? CFG.CURRENT_BACKGROUND
    ?? CFG.SCENE?.CURRENT_BACKGROUND
    ?? CFG.SCENE?.CURRENT_THEME
    ?? CFG.SCENE?.DEFAULT_THEME;

  const allyUnits = Array.isArray(options.deck) && options.deck.length
    ? options.deck
    : UNITS;
  const enemyPreset = options.aiPreset || {};
  const enemyUnits = Array.isArray(enemyPreset.deck) && enemyPreset.deck.length
    ? enemyPreset.deck
    : (Array.isArray(enemyPreset.unitsAll) && enemyPreset.unitsAll.length ? enemyPreset.unitsAll : UNITS);

  const game = {
    modeKey,
    grid: null,
    tokens: [],
    cost: 0,
    costCap: Number.isFinite(options.costCap) ? options.costCap : CFG.COST_CAP,
    summoned: 0,
    summonLimit: Number.isFinite(options.summonLimit) ? options.summonLimit : CFG.SUMMON_LIMIT,

    // deck-3 + quản lý “độc nhất”
    unitsAll: allyUnits,
    usedUnitIds: new Set(),       // những unit đã ra sân
    deck3: [],                    // mảng 3 unit
    selectedId: null,
    ui: { bar: null },
    turn: { phase: 'ally', last: { ally: 0, enemy: 0 }, cycle: 0, busyUntil: 0 },
    queued: { ally: new Map(), enemy: new Map() },
    actionChain: [],
    events: gameEvents,
    sceneTheme,
    backgroundKey
  };

  game.ai = {
    cost: 0,
    costCap: Number.isFinite(enemyPreset.costCap) ? enemyPreset.costCap : (enemyPreset.costCap ?? CFG.COST_CAP),
    summoned: 0,
    summonLimit: Number.isFinite(enemyPreset.summonLimit) ? enemyPreset.summonLimit : (enemyPreset.summonLimit ?? CFG.SUMMON_LIMIT),
    unitsAll: enemyUnits,
    usedUnitIds: new Set(),
    deck: Array.isArray(enemyPreset.startingDeck) ? enemyPreset.startingDeck.slice() : [],
    selectedId: null,
    lastThinkMs: 0,
    lastDecision: null
  };

  game.meta = Meta;
  return game;
}

function resetSessionState(options = {}){
  storedConfig = normalizeConfig({ ...storedConfig, ...options });
  Game = createGameState(storedConfig);
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
    if (hud && typeof hud.update === 'function'){
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

function invalidateSceneCache(){
  sceneCache = null;
  clearBackgroundSignatureCache();
}

function createSceneCacheCanvas(pixelWidth, pixelHeight){
  if (!Number.isFinite(pixelWidth) || !Number.isFinite(pixelHeight)) return null;
  const safeW = Math.max(1, Math.floor(pixelWidth));
  const safeH = Math.max(1, Math.floor(pixelHeight));
  if (typeof OffscreenCanvas === 'function'){
    try {
      return new OffscreenCanvas(safeW, safeH);
    } catch (_) {}
  }
  const doc = docRef || (typeof document !== 'undefined' ? document : null);
  if (!doc || typeof doc.createElement !== 'function') return null;
  const offscreen = doc.createElement('canvas');
  offscreen.width = safeW;
  offscreen.height = safeH;
  return offscreen;
}

function ensureSceneCache(){
  if (!Game || !Game.grid) return null;
  const grid = Game.grid;
  const sceneCfg = CFG.SCENE || {};
  const themeKey = Game.sceneTheme || sceneCfg.CURRENT_THEME || sceneCfg.DEFAULT_THEME;
  const theme = (sceneCfg.THEMES && themeKey) ? sceneCfg.THEMES[themeKey] : null;
  const backgroundKey = Game.backgroundKey;
  const backgroundSignature = computeBackgroundSignature(backgroundKey);
  const dpr = Number.isFinite(grid.dpr) && grid.dpr > 0 ? grid.dpr : 1;
  const cssWidth = grid.w ?? (canvas ? canvas.width / dpr : 0);
  const cssHeight = grid.h ?? (canvas ? canvas.height / dpr : 0);
  if (!cssWidth || !cssHeight) return null;
  const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
  const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));

  const baseScene = getCachedBattlefieldScene(grid, theme, { width: cssWidth, height: cssHeight, dpr });
  const baseKey = baseScene?.cacheKey;
  if (!baseScene){
    sceneCache = null;
    return null;
  }
  
  let needsRebuild = false;
  if (!sceneCache) needsRebuild = true;
  else if (sceneCache.pixelWidth !== pixelWidth || sceneCache.pixelHeight !== pixelHeight) needsRebuild = true;
  else if (sceneCache.themeKey !== themeKey || sceneCache.backgroundKey !== backgroundKey) needsRebuild = true;
  else if (sceneCache.backgroundSignature !== backgroundSignature) needsRebuild = true;
  else if (sceneCache.dpr !== dpr) needsRebuild = true;
  else if (sceneCache.baseKey !== baseKey) needsRebuild = true;

  if (!needsRebuild) return sceneCache;

  const offscreen = createSceneCacheCanvas(pixelWidth, pixelHeight);
  if (!offscreen) return null;
  const cacheCtx = offscreen.getContext('2d');
  if (!cacheCtx) return null;

  if (typeof cacheCtx.resetTransform === 'function'){
    cacheCtx.resetTransform();
  } else if (typeof cacheCtx.setTransform === 'function'){
    cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
  }
  cacheCtx.clearRect(0, 0, pixelWidth, pixelHeight);
  
  try {
    cacheCtx.drawImage(baseScene.canvas, 0, 0);
  } catch (err) {
    console.error('[scene-cache:base]', err);
    return null;
  }
  
  if (typeof cacheCtx.setTransform === 'function'){
    cacheCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  } else if (dpr !== 1 && typeof cacheCtx.scale === 'function'){
    cacheCtx.scale(dpr, dpr);
  }

  try {
    drawEnvironmentProps(cacheCtx, grid, CAM_PRESET, backgroundKey);
  } catch (err) {
    console.error('[scene-cache]', err);
    return null;
  }

  sceneCache = {
    canvas: offscreen,
    pixelWidth,
    pixelHeight,
    cssWidth,
    cssHeight,
    themeKey,
    backgroundKey,
    backgroundSignature,
    dpr, baseKey
  };
  return sceneCache;
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
  const now = getNow();
  const prev = Number.isFinite(Game.turn.busyUntil) ? Game.turn.busyUntil : now;
  const dur = Math.max(0, duration|0);
  Game.turn.busyUntil = Math.max(prev, now + dur);
}

// Thực thi Ult: Summoner -> Immediate Summon theo meta; class khác: trừ nộ
function performUlt(unit){
  const meta = Game.meta.get(unit.id);
  if (!meta) { unit.rage = 0; return; }

  const slot = slotIndex(unit.side, unit.cx, unit.cy);

const summonSpec = meta.class === 'Summoner' ? getSummonSpec(meta) : null;
  if (meta.class === 'Summoner' && summonSpec){
    const aliveNow = tokensAlive();
    const patternSlots = resolveSummonSlots(summonSpec, slot)
      .filter(Boolean)
      .filter(s => {
        const { cx, cy } = slotToCell(unit.side, s);
        return !cellReserved(aliveNow, Game.queued, cx, cy);
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
    unit.rage = 0;
    return;
  }

  const u = meta.kit?.ult;
  if (!u){ unit.rage = Math.max(0, unit.rage - 100); return; }

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
  unit.rage = Math.max(0, unit.rage - 100);
}
const tokensAlive = () => (Game?.tokens || []).filter(t => t.alive);
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
  if (Game?._inited) return true;
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
  spawnLeaders(Game.tokens, Game.grid);

  Game.tokens.forEach(t=>{
    if (t.id === 'leaderA' || t.id === 'leaderB'){
      vfxAddSpawn(Game, t.cx, t.cy, t.side);
    }
  });
  Game.tokens.forEach(t=>{
    if (!t.iid) t.iid = nextIid();
    if (t.id === 'leaderA' || t.id === 'leaderB'){
      Object.assign(t, {
        hpMax: 1600, hp: 1600, arm: 0.12, res: 0.12, atk: 40, wil: 30,
        aeMax: 0, ae: 0, rage: 0
      });
    }
  });
  Game.tokens.forEach(t => { if (!t.iid) t.iid = nextIid(); });

  hud.update(Game);
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
    hud.update(Game);
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

  const queryFromRoot = (selector)=>{
    if (root && typeof root.querySelector === 'function'){
      const el = root.querySelector(selector);
      if (el) return el;
    }
    return null;
  };
  
  const updateTimerAndCost = (timestamp)=>{
    if (!CLOCK) return;
    const now = Number.isFinite(timestamp) ? timestamp : getNow();
    const elapsedSec = Math.floor((now - CLOCK.startMs) / 1000);

    const remain = Math.max(0, 240 - elapsedSec);
    if (remain !== CLOCK.lastTimerRemain){
      CLOCK.lastTimerRemain = remain;
      const mm = String(Math.floor(remain/60)).padStart(2,'0');
      const ss = String(remain%60).padStart(2,'0');
      const tEl = /** @type {HTMLElement|null} */ (queryFromRoot('#timer') || doc.getElementById('timer'));
      if (tEl) tEl.textContent = `${mm}:${ss}`;
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

      hud.update(Game);
      if (!Game.selectedId) selectFirstAffordable();
      if (Game.ui?.bar) Game.ui.bar.render();
      aiMaybeAct(Game, 'cost');
    }

    const busyUntil = (Game.turn?.busyUntil) ?? 0;
    if (now >= busyUntil && now - CLOCK.lastTurnStepMs >= CLOCK.turnEveryMs){
      CLOCK.lastTurnStepMs = now;
      stepTurn(Game, {
        performUlt,
        processActionChain,
        allocIid: nextIid,
        doActionOrSkip
      });
      cleanupDead(now);
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
  if (!ctx || !canvas || !Game.grid) return;            // guard
  const clearW = Game.grid.w ?? canvas.width;
  const clearH = Game.grid.h ?? canvas.height;
  ctx.clearRect(0, 0, clearW, clearH);
  const cache = ensureSceneCache();
  if (cache && cache.canvas){
    ctx.drawImage(cache.canvas, 0, 0, cache.pixelWidth, cache.pixelHeight, 0, 0, cache.cssWidth, cache.cssHeight);
  } else {
    const sceneCfg = CFG.SCENE || {};
    const themeKey = Game.sceneTheme || sceneCfg.CURRENT_THEME || sceneCfg.DEFAULT_THEME;
    const theme = (sceneCfg.THEMES && themeKey) ? sceneCfg.THEMES[themeKey] : null;
    drawBattlefieldScene(ctx, Game.grid, theme);
    drawEnvironmentProps(ctx, Game.grid, CAM_PRESET, Game.backgroundKey);
  }
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

function onSessionEvent(type, handler){
  if (!type || typeof handler !== 'function') return ()=>{};
  if (!gameEvents || typeof gameEvents.addEventListener !== 'function') return ()=>{};
  gameEvents.addEventListener(type, handler);
  return ()=>{
    if (typeof gameEvents.removeEventListener === 'function'){
      gameEvents.removeEventListener(type, handler);
    }
  };
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
    onEvent: onSessionEvent
  };
}

export const __backgroundSignatureCache = backgroundSignatureCache;
export function __getStoredConfig(){
  return storedConfig ? { ...storedConfig } : {};
}

export function __getActiveGame(){
  return Game;
}
export { gameEvents, emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END } from '../../events.js';
