//v0.7.7
import { stepTurn, doActionOrSkip, predictSpawnCycle } from '../../turns.ts';
import { enqueueImmediate, processActionChain } from '../../summon.ts';
import { refillDeckEnemy, aiMaybeAct } from '../../ai.ts';
import { Statuses } from '../../statuses.ts';
import { CFG, CAM } from '../../config.ts';
import { UNITS } from '../../units.ts';
import { Meta, makeInstanceStats, initialRageFor } from '../../meta.ts';
import { basicAttack, pickTarget, dealAbilityDamage, healUnit, grantShield, applyDamage } from '../../combat.ts';
import { initializeFury, setFury, spendFury, resolveUltCost, gainFury, finishFuryHit } from '../../utils/fury.ts';
import {
  ROSTER, ROSTER_MAP,
  CLASS_BASE, RANK_MULT,
  getMetaById, isSummoner, applyRankAndMods
} from '../../catalog.ts';
import {
  makeGrid, drawGridOblique,
  drawTokensOblique, drawQueuedOblique,
  hitToCellOblique, projectCellOblique,
  cellOccupied, spawnLeaders, pickRandom, slotIndex, slotToCell, cellReserved, ORDER_ENEMY,
  ART_SPRITE_EVENT,
} from '../../engine.ts';
import { drawEnvironmentProps } from '../../background.ts';
import { getUnitArt, setUnitSkin } from '../../art.ts';
import { initHUD, startSummonBar } from '../../ui.ts';
import {
  vfxDraw,
  vfxAddSpawn,
  vfxAddHit,
  vfxAddMelee,
  vfxAddLightningArc,
  vfxAddBloodPulse,
  vfxAddGroundBurst,
  vfxAddShieldWrap,
  asSessionWithVfx,
} from '../../vfx.ts';
import { drawBattlefieldScene } from '../../scene.ts';
import {
  gameEvents,
  TURN_START,
  TURN_END,
  ACTION_START,
  ACTION_END,
  BATTLE_END,
  emitGameEvent,
  addGameEventListener,
} from '../../events.ts';
import { ensureNestedModuleSupport } from '../../utils/dummy.ts';
import { safeNow } from '../../utils/time.ts';
import { getSummonSpec, resolveSummonSlots } from '../../utils/kit.ts';
import {
  normalizeConfig,
  createSession,
  invalidateSceneCache,
  ensureSceneCache,
  clearBackgroundSignatureCache,
  normalizeDeckEntries,
} from './session-state.ts';

import type { BattleDetail, BattleResult, BattleState, LeaderSnapshot, PveDeckEntry } from '@shared-types/combat';
import type {
  UnitToken,
  ActionChainEntry,
  QueuedSummonRequest,
  Side,
} from '@shared-types/units';
import type { TurnSnapshot } from '@shared-types/turn-order';
import type {
  RewardRoll,
  WaveState,
  EncounterState,
  SessionRuntimeState,
  CreateSessionOptions,
  SessionState,
} from '@shared-types/pve';
import type { HudHandles, SummonBarHandles } from '@shared-types/ui';
import type { NormalizedSessionConfig } from './session-state.ts';

type RootLike = Element | Document | null | undefined;
type StartConfigOverrides = Partial<CreateSessionOptions> & Record<string, unknown>;
type PveSessionStartConfig = StartConfigOverrides & {
  root?: RootLike;
  rootEl?: RootLike;
};

type FrameHandle = number | ReturnType<typeof setTimeout>;
type GradientValue = CanvasGradient | string | undefined;
type CanvasClickHandler = ((event: Event) => void) | null;
type ClockState = {
  startMs: number;
  lastTimerRemain: number;
  lastCostCreditedSec: number;
  turnEveryMs: number;
  lastTurnStepMs: number;
};
type ExtendedQueuedSummon = (QueuedSummonRequest & {
  art?: ReturnType<typeof getUnitArt> | null;
  skinKey?: string | null;
  color?: string | null;
  [extra: string]: unknown;
}) | null;
type DeckEntry = PveDeckEntry;
type CameraPreset = { topScale?: number; rowGapRatio?: number; depthScale?: number } | null | undefined;
type GridSpec = ReturnType<typeof makeGrid>;

const isDeckEntry = (value: unknown): value is DeckEntry => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { id?: unknown };
  return typeof candidate.id === 'string' && candidate.id.trim() !== '';
};

function assertDeckEntry(value: unknown): asserts value is DeckEntry {
  if (!isDeckEntry(value)) {
    throw new TypeError('Thẻ bài không hợp lệ.');
  }
}

function asDeckEntry<T>(value: T): DeckEntry {
  assertDeckEntry(value);
  return value;
}

function sanitizeDeckEntries(value: unknown): DeckEntry[] {
  if (!Array.isArray(value)) return [];
  let changed = false;
  const normalized: DeckEntry[] = [];
  for (const entry of value) {
    if (isDeckEntry(entry)) {
      normalized.push(entry);
    } else {
      changed = true;
    }
  }
  return changed ? normalized : (value as DeckEntry[]);
}

function ensureDeck(): DeckEntry[] {
  if (!Game) return [];
  const deck = sanitizeDeckEntries(Game.deck3);
  if (deck !== Game.deck3) {
    Game.deck3 = deck;
  }
  return deck;
}

function ensureRoster(): ReadonlyArray<DeckEntry> {
  if (!Game) return [];
  const roster = sanitizeDeckEntries(Game.unitsAll);
  if (roster !== Game.unitsAll) {
    Game.unitsAll = roster;
  }
  return Game.unitsAll;
}

const getCardCost = (card: DeckEntry | null | undefined): number => {
  if (!card) return 0;
  const raw = card.cost;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export type PveSessionHandle = {
  start: (startConfig?: PveSessionStartConfig | null) => SessionState | null;
  stop: () => void;
  updateConfig: (next?: StartConfigOverrides | null) => void;
  setUnitSkin: (unitId: string, skinKey: string | null | undefined) => boolean;
};

function sanitizeStartConfig(
  config: PveSessionStartConfig | null | undefined,
): { rest: StartConfigOverrides; root: RootLike } {
  const raw = (config ?? {}) as PveSessionStartConfig;
  const { root, rootEl, ...rest } = raw;
  return {
    rest: rest as StartConfigOverrides,
    root: (root ?? rootEl) ?? null,
  };
}

type BattleFinalizePayload = {
  winner?: BattleResult['winner'];
  reason?: string | null;
  detail?: BattleDetail | null;
  finishedAt?: number;
};

type EnemyAIPreset = {
  deck?: ReadonlyArray<PveDeckEntry>;
  unitsAll?: ReadonlyArray<PveDeckEntry>;
  costCap?: number;
  summonLimit?: number;
  startingDeck?: ReadonlyArray<UnitToken>;
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let hud: HudHandles | null = null;
let summonBarHandle: SummonBarHandles | null = null;
let hudCleanup: (() => void) | null = null;
const CAM_PRESET = CAM[CFG.CAMERA] || CAM.landscape_oblique;
const HAND_SIZE  = CFG.HAND_SIZE ?? 4;

ensureNestedModuleSupport();

const getNow = (): number => safeNow();

// --- Instance counters (để gắn id cho token/minion) ---
let _IID = 1;
let _BORN = 1;
const nextIid = (): number => _IID++;

let Game: SessionState | null = null;
let tickLoopHandle: FrameHandle | null = null;
let tickLoopUsesTimeout = false;
let resizeHandler: (() => void) | null = null;
let visualViewportResizeHandler: (() => void) | null = null;
let visualViewportScrollHandler: (() => void) | null = null;
let resizeSchedulerHandle: FrameHandle | null = null;
let resizeSchedulerUsesTimeout = false;
let pendingResize = false;
let canvasClickHandler: CanvasClickHandler = null;
let artSpriteHandler: (() => void) | null = null;
let visibilityHandlerBound = false;
let winRef: (Window & typeof globalThis) | null = null;
let docRef: Document | null = null;
let rootElement: Element | Document | null = null;
let storedConfig: NormalizedSessionConfig = normalizeConfig();
let running = false;
const hpBarGradientCache = new Map<string, GradientValue>();

const renderSummonBar = (): void => {
  const bar = Game?.ui?.bar ?? null;
  if (bar?.render) bar.render();
};

function cleanupSummonBar(): void {
  if (summonBarHandle && typeof summonBarHandle.cleanup === 'function'){
    try {
      summonBarHandle.cleanup();
    } catch {}
  }
  summonBarHandle = null;
  if (Game?.ui){
    Game.ui.bar = null;
  }
}

function resetSessionState(options: StartConfigOverrides = {}): void {
  storedConfig = normalizeConfig({ ...storedConfig, ...options });
  Game = createSession(storedConfig);
  _IID = 1;
  _BORN = 1;
  CLOCK = createClock();
  invalidateSceneCache();
}

if (CFG?.DEBUG?.LOG_EVENTS) {
  const logEvent = (type: string) => (ev: Event): void => {
    const detailRaw = (ev as CustomEvent<Record<string, unknown>> | null)?.detail ?? {};
    const detail = detailRaw as Record<string, unknown>;
    const unitRaw = detail['unit'] as { id?: string; name?: string } | null | undefined;
    const readString = (value: unknown): string | null => (typeof value === 'string' ? value : null);
    const readNumber = (value: unknown): number | null => {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string'){
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    };
    const info = {
      side: readString(detail['side']),
      slot: readNumber(detail['slot']),
      cycle: readNumber(detail['cycle']),
      orderIndex: readNumber(detail['orderIndex']),
      orderLength: readNumber(detail['orderLength']),
      phase: readString(detail['phase']),
      unit: readString(unitRaw?.id) ?? readString(unitRaw?.name),
      action: readString(detail['action']),
      skipped: Boolean(detail['skipped']),
      reason: readString(detail['reason']),
      processedChain: detail['processedChain'] ?? null,
    };
    console.debug(`[events] ${type}`, info);
  };
  const types = [TURN_START, TURN_END, ACTION_START, ACTION_END] as const;
  for (const type of types){
    try {
      addGameEventListener(type, logEvent(type));
    } catch (err) {
      console.error('[events]', err);
    }
  }
}

let drawFrameHandle: FrameHandle | null = null;
let drawFrameUsesTimeout = false;
let drawPending = false;
let drawPaused = false;

function cancelScheduledDraw(): void {
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

function scheduleDraw(): void {
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

function cancelScheduledResize(): void {
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

function flushScheduledResize(): void {
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

function scheduleResize(): void {
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

const DEFAULT_TOKEN_COLOR = '#a9f58c';

function refreshQueuedArtFor(unitId: string): void {
  const apply = (map: Map<number, QueuedSummonRequest> | null | undefined): void => {
    if (!map || typeof map.values !== 'function') return;
    for (const pending of map.values()){
      if (!pending || pending.unitId !== unitId) continue;
      const updated = getUnitArt(unitId);
      const pendingExt = pending as ExtendedQueuedSummon;
      if (pendingExt){
        const nextColor = updated?.palette?.primary ?? pendingExt.color ?? DEFAULT_TOKEN_COLOR;
        pendingExt.art = updated ?? null;
        pendingExt.skinKey = updated?.skinKey ?? null;
        pendingExt.color = nextColor;
      }
    }
  };
  if (!Game?.queued) return;
  apply(Game.queued.ally);
  apply(Game.queued.enemy);
}

function setUnitSkinForSession(unitId: string, skinKey: string | null | undefined): boolean {
  if (!Game) return false;
  const ok = setUnitSkin(unitId, skinKey);
  if (!ok) return false;
  const art = getUnitArt(unitId);
  const resolvedSkin = art?.skinKey ?? null;
  const primaryColor = art?.palette?.primary ?? null;
  const resolveColor = (current: string | null | undefined): string => {
    return primaryColor ?? current ?? DEFAULT_TOKEN_COLOR;
  };
  const applyArtMetadata = (entry: DeckEntry | null | undefined): void => {
    if (!entry || entry.id !== unitId) return;
    const nextColor = resolveColor(entry.color);
    entry.art = art ?? null;
    entry.skinKey = resolvedSkin;
    entry.color = nextColor;
  };
  const tokens = Game.tokens || [];
  for (const token of tokens){
    if (!token || token.id !== unitId) continue;
    const nextColor = resolveColor(token.color);
    token.art = art;
    token.skinKey = resolvedSkin;
    token.color = nextColor;
  }
  if (Array.isArray(Game.deck3)){
    for (const entry of Game.deck3){
      applyArtMetadata(entry);
    }
  }
  if (Array.isArray(Game.unitsAll)){
    for (const entry of Game.unitsAll){
      applyArtMetadata(entry);
    }
  }
  refreshQueuedArtFor(unitId);
  renderSummonBar();
  scheduleDraw();
  return true;
}

function setDrawPaused(paused: boolean): void {
  drawPaused = !!paused;
  if (drawPaused){
    cancelScheduledDraw();
  } else {
    scheduleDraw();
  }
}
function bindArtSpriteListener(): void {
  if (!winRef || typeof winRef.addEventListener !== 'function') return;
  if (artSpriteHandler) return;
  artSpriteHandler = ()=>{ invalidateSceneCache(); scheduleDraw(); };
  winRef.addEventListener(ART_SPRITE_EVENT, artSpriteHandler);
}

function unbindArtSpriteListener(): void {
  if (!winRef || !artSpriteHandler || typeof winRef.removeEventListener !== 'function') return;
  winRef.removeEventListener(ART_SPRITE_EVENT, artSpriteHandler);
  artSpriteHandler = null;
}
// Master clock theo timestamp – tránh drift giữa nhiều interval
let CLOCK: ClockState | null = null;

function createClock(): ClockState {
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
function cleanupDead(now: number): void {
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
function creepStatsFromInherit(
  masterUnit: UnitToken | null | undefined,
  inherit: Record<string, unknown> | null | undefined,
): Partial<Pick<UnitToken, 'hpMax' | 'hp' | 'atk' | 'wil' | 'res' | 'arm'>> {
  if (!inherit || typeof inherit !== 'object') return {};
  const hpMax = Math.round((masterUnit?.hpMax || 0) * ((inherit.HP ?? inherit.hp ?? inherit.HPMax ?? inherit.hpMax) || 0));
  const atk   = Math.round((masterUnit?.atk   || 0) * ((inherit.ATK ?? inherit.atk) || 0));
  const wil   = Math.round((masterUnit?.wil   || 0) * ((inherit.WIL ?? inherit.wil) || 0));
  const res   = Math.round((masterUnit?.res   || 0) * ((inherit.RES ?? inherit.res) || 0));
  const arm   = Math.round((masterUnit?.arm   || 0) * ((inherit.ARM ?? inherit.arm) || 0) * 100) / 100;
  const stats: Partial<Pick<UnitToken, 'hpMax' | 'hp' | 'atk' | 'wil' | 'res' | 'arm'>> = {};
  if (hpMax > 0){ stats.hpMax = hpMax; stats.hp = hpMax; }
  if (atk > 0) stats.atk = atk;
  if (wil > 0) stats.wil = wil;
  if (res > 0) stats.res = res;
  if (arm > 0) stats.arm = Math.max(0, Math.min(1, arm));
  return stats;
}

function getMinionsOf(masterIid: number): UnitToken[] {
  return (Game?.tokens || []).filter((t) => t.isMinion && t.ownerIid === masterIid && t.alive);
}
function removeOldestMinions(masterIid: number, count: number): void {
  if (count <= 0) return;
  const tokens = Game?.tokens;
  if (!tokens) return;
  const list = getMinionsOf(masterIid).sort((a, b) => (a.bornSerial || 0) - (b.bornSerial || 0));
  for (let i=0;i<count && i<list.length;i++){
    const x = list[i];
    x.alive = false;
    // xoá khỏi mảng để khỏi vẽ/đụng lượt
    const idx = tokens.indexOf(x);
    if (idx >= 0) tokens.splice(idx,1);
  }
}
function extendBusy(duration: number): void {
  if (!Game || !Game.turn) return;
  const now = getNow();
  const prev = Number.isFinite(Game.turn.busyUntil) ? Game.turn.busyUntil : now;
  const dur = Math.max(0, duration|0);
  Game.turn.busyUntil = Math.max(prev, now + dur);
}

// Thực thi Ult: Summoner -> Immediate Summon theo meta; class khác: trừ nộ
function performUlt(unit: UnitToken): void {
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

      const applyBusyFromVfx = (startedAt: number, duration: number | null | undefined): void => {
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
        const GameVfx = asSessionWithVfx(Game, { requireGrid: true });
        if (GameVfx) {
          try {
            const dur = vfxAddBloodPulse(GameVfx, unit, {
              bindingKey,
              timing: 'charge_up'
            });
            applyBusyFromVfx(startedAt, dur);
          } catch (_) {}
        }
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
        const GameVfx = asSessionWithVfx(Game, { requireGrid: true });
        if (GameVfx) {
          try {
            const dur = vfxAddLightningArc(GameVfx, unit, tgt, {
              bindingKey,
              timing: 'burst_core',
              targetBindingKey: bindingKey,
              targetTiming: 'burst_core'
            });
            applyBusyFromVfx(startedAt, dur);
          } catch (_) {}
        }
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
        const GameVfx = asSessionWithVfx(Game, { requireGrid: true });
        if (GameVfx) {
          try {
            const dur = vfxAddGroundBurst(GameVfx, unit, {
              bindingKey,
              anchorId: 'right_foot',
              timing: 'ground_crack'
            });
            applyBusyFromVfx(startedAt, dur);
          } catch (_) {}
        }
      }

      {
        const startedAt = getNow();
        const GameVfx = asSessionWithVfx(Game, { requireGrid: true });
        if (GameVfx) {
          try {
            const dur = vfxAddGroundBurst(GameVfx, unit, {
              bindingKey,
              anchorId: 'left_foot',
              timing: 'ground_crack'
            });
            applyBusyFromVfx(startedAt, dur);
          } catch (_) {}
        }
      }

      {
       const startedAt = getNow();
        const GameVfx = asSessionWithVfx(Game, { requireGrid: true });
        if (GameVfx) {
          try {
            const dur = vfxAddShieldWrap(GameVfx, unit, {
              bindingKey,
              anchorId: 'root',
              timing: 'burst_core'
            });
            applyBusyFromVfx(startedAt, dur);
          } catch (_) {}
        }
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
      const GameVfx = asSessionWithVfx(Game, { requireGrid: true });
      if (GameVfx) {
        try { vfxAddMelee(GameVfx, unit, primary, { dur: meleeDur }); } catch(_){}
      }
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
      {
        const sessionVfx = asSessionWithVfx(Game, { requireGrid: true });
        if (sessionVfx) {
          try { vfxAddHit(sessionVfx, unit); } catch(_){}
        }
      }
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
        if (!tgt) continue;
        Statuses.add(tgt, Statuses.make.sleep({ turns: u.turns || 1 }));
        const sessionVfx = asSessionWithVfx(Game, { requireGrid: true });
        if (sessionVfx) {
          try { vfxAddHit(sessionVfx, tgt); } catch(_){}
        }
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
        if (!ally) continue;
        ally.alive = true;
        ally.deadAt = 0;
        ally.hp = 0;
        Statuses.purge(ally);
        const revivedHp = u.revived?.hpPercent ?? u.revived?.hpPct ?? 0.5;
        const hpPct = Math.max(0, Math.min(1, revivedHp));
        const healAmt = Math.max(1, Math.round((ally.hpMax || 0) * hpPct));
        healUnit(ally, healAmt);
        setFury(ally, Math.max(0, (u.revived?.rage) ?? 0));
        if (u.revived?.lockSkillsTurns){
          Statuses.add(ally, Statuses.make.silence({ turns: u.revived.lockSkillsTurns }));
        }
        const sessionVfx = asSessionWithVfx(Game, { requireGrid: true });
        if (sessionVfx) {
          try { vfxAddSpawn(sessionVfx, ally.cx, ally.cy, ally.side); } catch(_){}
        }
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
          const sessionVfx = asSessionWithVfx(Game, { requireGrid: true });
          if (sessionVfx) {
            try { vfxAddHit(sessionVfx, tgt); } catch(_){}
          }
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
        const sessionVfx = asSessionWithVfx(Game, { requireGrid: true });
        if (sessionVfx) {
          try { vfxAddHit(sessionVfx, tgt); } catch(_){}
        }
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
const tokensAlive = (): UnitToken[] => (Game?.tokens || []).filter((t) => t.alive);

function ensureBattleState(game: SessionState | null): BattleState | null {
  if (!game || typeof game !== 'object') return null;
  if (!game.battle || typeof game.battle !== 'object'){
    game.battle = {
      over: false,
      winner: null,
      reason: null,
      detail: null,
      finishedAt: 0,
      result: null,
    } as BattleState;
  }
  if (typeof game.result === 'undefined'){
    game.result = null;
  }
  if (!Object.prototype.hasOwnProperty.call(game.battle, 'result')){
    (game.battle as BattleState).result = null;
  }
  return game.battle as BattleState;
}

function isUnitAlive(unit: UnitToken | null | undefined): boolean {
  if (!unit) return false;
  if (!unit.alive) return false;
  if (Number.isFinite(unit.hp)){
    return unit.hp > 0;
  }
  return true;
}

function getHpRatio(unit: UnitToken | null | undefined): number {
  if (!unit) return 0;
  const hp = Number.isFinite(unit.hp) ? unit.hp : 0;
  const hpMax = Number.isFinite(unit.hpMax) ? unit.hpMax : 0;
  if (hpMax > 0){
    return Math.max(0, Math.min(1, hp / hpMax));
  }
  return hp > 0 ? 1 : 0;
}

function snapshotLeader(unit: UnitToken | null | undefined): LeaderSnapshot | null {
  if (!unit) return null;
  return {
    id: unit.id || null,
    side: unit.side || null,
    alive: !!unit.alive,
    hp: Number.isFinite(unit.hp) ? Math.max(0, unit.hp) : null,
    hpMax: Number.isFinite(unit.hpMax) ? Math.max(0, unit.hpMax) : null
  };
}

function isBossToken(game: SessionState | null, token: UnitToken | null | undefined): boolean {
  if (!token) return false;
  if (token.isBoss) return true;
  const rankRaw = typeof token.rank === 'string' && token.rank ? token.rank : (game?.meta?.rankOf?.(token.id) || '');
  const rank = typeof rankRaw === 'string' ? rankRaw.toLowerCase() : '';
  return rank === 'boss';
}

function isPvpMode(game: SessionState | null): boolean {
  const key = (game?.modeKey || '').toString().toLowerCase();
  if (!key) return false;
  if (key === 'ares') return true;
  return key.includes('pvp');
}

function finalizeBattle(
  game: SessionState | null,
  payload: BattleFinalizePayload,
  context: Record<string, unknown>,
): BattleResult | null {
  const battle = ensureBattleState(game);
  if (!battle || battle.over) return battle?.result || null;
  const finishedAtRaw = payload?.finishedAt;
  const finishedAt = typeof finishedAtRaw === 'number' && Number.isFinite(finishedAtRaw)
    ? finishedAtRaw
    : getNow();
  const result: BattleResult = {
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
  if (game) game.result = result;
  if (game?.turn){
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

function checkBattleEnd(
  game: SessionState | null,
  context: Record<string, unknown> = {},
): BattleResult | null {
  if (!game) return null;
  const battle = ensureBattleState(game);
  if (!battle) return null;
  if (battle.over) return battle.result || null;

  const tokens = Array.isArray(game.tokens) ? game.tokens : [];
  const leaderA = tokens.find(t => t && t.id === 'leaderA');
  const leaderB = tokens.find(t => t && t.id === 'leaderB');
  const leaderAAlive = isUnitAlive(leaderA);
  const leaderBAlive = isUnitAlive(leaderB);

  const contextDetail: Record<string, unknown> =
    context && typeof context === 'object' ? { ...context } : {};
  const triggerValue = contextDetail['trigger'];
  const trigger = typeof triggerValue === 'string' ? triggerValue : null;
  const detail: BattleDetail = {
    context: contextDetail,
    leaders: {
      ally: snapshotLeader(leaderA),
      enemy: snapshotLeader(leaderB)
    }
  };

  let winner: BattleResult['winner'] | null = null;
  let reason: string | null = null;

  if (!leaderAAlive || !leaderBAlive){
    reason = 'leader_down';
    if (leaderAAlive && !leaderBAlive) winner = 'ally';
    else if (!leaderAAlive && leaderBAlive) winner = 'enemy';
    else winner = 'draw';
} else if (trigger === 'timeout'){
    reason = 'timeout';
    const remainRaw = contextDetail['remain'];
    const remainCandidate = typeof remainRaw === 'number' ? remainRaw : Number(remainRaw);
    const remain = Number.isFinite(remainCandidate) ? remainCandidate : 0;
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
      const bossAlive = tokens.some((t) => t && t.alive && t.side === 'enemy' && isBossToken(game, t));
      detail.timeout = {
        mode: 'pve',
        remain,
        bossAlive
      };
      winner = bossAlive ? 'enemy' : 'ally';
    }
  }

  if (!winner) return null;

  const timestampRaw = contextDetail['timestamp'];
  const finishedAt = typeof timestampRaw === 'number' && Number.isFinite(timestampRaw)
    ? timestampRaw
    : undefined;
  return finalizeBattle(game, { winner, reason, detail, finishedAt }, contextDetail);
}
// Giảm TTL minion của 1 phe sau khi phe đó kết thúc phase
function tickMinionTTL(side: Side): void {
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

function init(): boolean {
  if (!Game) return false;
  if (Game._inited) return true;
  const doc = docRef ?? (typeof document !== 'undefined' ? document : null);
  if (!doc) return false;
  const root = rootElement ?? null;
  const boardFromRoot = (root && typeof (root as ParentNode).querySelector === 'function')
    ? (root as ParentNode).querySelector('#board')
    : null;
  const boardFromDocument = typeof doc.querySelector === 'function'
    ? doc.querySelector('#board')
  : typeof doc.getElementById === 'function'
      ? doc.getElementById('board')
      : null;
  const boardEl = (boardFromRoot ?? boardFromDocument) as HTMLCanvasElement | null;
  if (!boardEl){
    return false;
  }
  canvas = boardEl;
  ctx = boardEl.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx){
    console.warn('[pve] Không thể lấy ngữ cảnh 2D cho canvas PvE.');
    return false;
  }

  if (typeof hudCleanup === 'function'){
    hudCleanup();
    hudCleanup = null;
  }
  hud = initHUD(doc, root ?? undefined);
  hudCleanup = hud ? () => hud.cleanup() : null;
  resize();
  if (Game.grid) spawnLeaders(Game.tokens, Game.grid);

  const tokens = Game.tokens || [];
  const sessionVfx = asSessionWithVfx(Game, { requireGrid: true });
  if (sessionVfx){
    for (const t of tokens){
      if (t.id === 'leaderA' || t.id === 'leaderB'){
        try { vfxAddSpawn(sessionVfx, t.cx, t.cy, t.side); } catch(_){}
      }
    }
  }
  for (const t of tokens){
    if (!t.iid) t.iid = nextIid();
    if (t.id === 'leaderA' || t.id === 'leaderB'){
      Object.assign(t, {
        hpMax: 1600,
        hp: 1600,
        arm: 0.12,
        res: 0.12,
        atk: 40,
        wil: 30,
        aeMax: 0,
        ae: 0,
      });
      initializeFury(t, t.id, 0);
    }
}
  for (const t of tokens){
    if (!t.iid) t.iid = nextIid();
  }

  if (hud && Game) hud.update(Game);
  scheduleDraw();
  Game._inited = true;

  refillDeck();
  refillDeckEnemy(Game);

  cleanupSummonBar();
  const barHandle = startSummonBar(doc, {
    onPick: (card): void => {
      const entry = asDeckEntry(card);
      Game.selectedId = entry.id;
      renderSummonBar();
    },
    canAfford: (card): boolean => {
      const entry = asDeckEntry(card);
      return Game.cost >= getCardCost(entry);
    },
    getDeck: () => ensureDeck(),
    getSelectedId: () => Game.selectedId,
  }, root ?? undefined);
  summonBarHandle = barHandle;
  Game.ui.bar = barHandle;

  selectFirstAffordable();
  renderSummonBar();

  if (canvasClickHandler && canvas){
    canvas.removeEventListener('click', canvasClickHandler);
    canvasClickHandler = null;
  }
  canvasClickHandler = (ev: MouseEvent): void => {
    if (!canvas || !Game.grid) return;
    const rect = canvas.getBoundingClientRect();
    const p = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    const cell = hitToCellOblique(Game.grid, p.x, p.y, CAM_PRESET);
    if (!cell) return;

    if (cell.cx >= CFG.ALLY_COLS) return;

    const deck = ensureDeck();
    const card = deck.find((u) => u.id === Game.selectedId) ?? null;
    if (!card) return;

    if (cellReserved(tokensAlive(), Game.queued, cell.cx, cell.cy)) return;
    const cardCost = getCardCost(card);
    if (Game.cost < cardCost) return;
    if (Game.summoned >= Game.summonLimit) return;

    const slot = slotIndex('ally', cell.cx, cell.cy);
    if (Game.queued.ally.has(slot)) return;

    const spawnCycle = predictSpawnCycle(Game, 'ally', slot);
    const pendingArt = getUnitArt(card.id);
    const pending: QueuedSummonRequest & {
      art?: ReturnType<typeof getUnitArt> | null;
      skinKey?: string | null;
    } = {
      unitId: card.id,
      name: typeof card.name === 'string' ? card.name : null,
      side: 'ally',
      cx: cell.cx,
      cy: cell.cy,
      slot,
      spawnCycle,
      source: 'deck',
      color: pendingArt?.palette?.primary || '#a9f58c',
      art: pendingArt ?? null,
      skinKey: pendingArt?.skinKey ?? null,
    };
    Game.queued.ally.set(slot, pending);

    Game.cost = Math.max(0, Game.cost - cardCost);
    if (hud && Game) hud.update(Game);
    Game.summoned += 1;
    Game.usedUnitIds.add(card.id);

    Game.deck3 = deck.filter((u) => u.id !== card.id);
    Game.selectedId = null;
    refillDeck();
    selectFirstAffordable();
    renderSummonBar();
    scheduleDraw();
  };
  if (canvas && canvasClickHandler){
    canvas.addEventListener('click', canvasClickHandler);
  }

  if (resizeHandler && winRef && typeof winRef.removeEventListener === 'function'){
    winRef.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  resizeHandler = (): void => { scheduleResize(); };
  if (winRef && typeof winRef.addEventListener === 'function' && resizeHandler){
    winRef.addEventListener('resize', resizeHandler);
  }

  const viewport = winRef?.visualViewport ?? null;
  if (viewport && typeof viewport.addEventListener === 'function'){
    if (visualViewportResizeHandler && typeof viewport.removeEventListener === 'function'){
      viewport.removeEventListener('resize', visualViewportResizeHandler);
    }
    visualViewportResizeHandler = (): void => { scheduleResize(); };
    viewport.addEventListener('resize', visualViewportResizeHandler);

    if (visualViewportScrollHandler && typeof viewport.removeEventListener === 'function'){
      viewport.removeEventListener('scroll', visualViewportScrollHandler);
    }
    visualViewportScrollHandler = (): void => { scheduleResize(); };
    viewport.addEventListener('scroll', visualViewportScrollHandler);
  }

  const queryFromRoot = (selector: string): Element | null => {
    if (root && typeof (root as ParentNode).querySelector === 'function'){
      const el = (root as ParentNode).querySelector(selector);
      if (el) return el;
    }
    return null;
  };

    const updateTimerAndCost = (timestamp?: number): void => {
    if (!CLOCK || !Game) return;
    if (Game.battle?.over) return;

    const now = Number.isFinite(timestamp) ? Number(timestamp) : getNow();
    const elapsedSec = Math.floor((now - CLOCK.startMs) / 1000);

    const prevRemain = Number.isFinite(CLOCK.lastTimerRemain) ? CLOCK.lastTimerRemain : 0;
    const remain = Math.max(0, 240 - elapsedSec);
    if (remain !== CLOCK.lastTimerRemain){
      CLOCK.lastTimerRemain = remain;
      const mm = String(Math.floor(remain / 60)).padStart(2, '0');
      const ss = String(remain % 60).padStart(2, '0');
      const tEl = (queryFromRoot('#timer') || doc.getElementById('timer')) as HTMLElement | null;
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

      if (hud && Game) hud.update(Game);
      if (!Game.selectedId) selectFirstAffordable();
      renderSummonBar();
      aiMaybeAct(Game, 'cost');
    }

   if (Game.battle?.over) return;

    const busyUntil = Game.turn?.busyUntil ?? 0;
    if (now >= busyUntil && now - CLOCK.lastTurnStepMs >= CLOCK.turnEveryMs){
      CLOCK.lastTurnStepMs = now;
      stepTurn(Game, {
        performUlt,
        processActionChain,
        allocIid: nextIid,
        doActionOrSkip,
        checkBattleEnd,
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

  const runTickLoop = (timestamp?: number): void => {
    tickLoopHandle = null;
    updateTimerAndCost(timestamp);
    if (!running || !CLOCK) return;
    scheduleTickLoop();
  };

  function scheduleTickLoop(): void {
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
      tickLoopHandle = setTimeout(() => runTickLoop(getNow()), 16);
    }
  }

  updateTimerAndCost(getNow());
  scheduleTickLoop();
  return true;
}

function selectFirstAffordable(): void {
  if (!Game) return;

  const deck = ensureDeck();
  if (!deck.length){
    Game.selectedId = null;
    return;
  }

  let cheapestAffordable: DeckEntry | null = null;
  let cheapestAffordableCost = Infinity;
  let cheapestOverall: DeckEntry | null = null;
  let cheapestOverallCost = Infinity;

  for (const card of deck){
    if (!card) continue;

    const cardCost = getCardCost(card);

    if (cardCost < cheapestOverallCost){
      cheapestOverall = card;
      cheapestOverallCost = cardCost;
    }

    const costForComparison = Number.isFinite(cardCost) ? cardCost : 0;
    const affordable = costForComparison <= Game.cost;
    if (affordable && cardCost < cheapestAffordableCost){
      cheapestAffordable = card;
      cheapestAffordableCost = cardCost;
    }
  }

  const chosen = (cheapestAffordable || cheapestOverall) ?? null;
  Game.selectedId = chosen ? chosen.id : null;
}

/* ---------- Deck logic ---------- */
function refillDeck(): void {
  if (!Game) return;

  const deck = ensureDeck();
  const need = HAND_SIZE - deck.length;
  if (need <= 0) return;

  const exclude = new Set([
    ...Game.usedUnitIds,
    ...deck.map((u) => u.id)
  ]);
  const roster = ensureRoster();
  const more = pickRandom(roster, exclude).slice(0, need);
  deck.push(...more);
  Game.deck3 = deck;
}

/* ---------- Vẽ ---------- */
function resize(): void {
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
function draw(): void {
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
function cellCenterObliqueLocal(g: GridSpec, cx: number, cy: number, C: CameraPreset): { x: number; y: number; scale: number } {
  const colsW = g.tile * g.cols;
  const topScale = ((C?.topScale) ?? 0.80);
  const rowGap = ((C?.rowGapRatio) ?? 0.62) * g.tile;

  function rowLR(r: number): { left: number; right: number } {
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

function roundedRectPathUI(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number): void {
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

function lightenColor(color: string | null | undefined, amount: number): string | null | undefined {
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

function normalizeHpBarCacheKey(
  fillColor: string | undefined,
  innerHeight: number,
  innerRadius: number,
  startY: number,
): string {
  const color = typeof fillColor === 'string' ? fillColor.trim().toLowerCase() : String(fillColor ?? '');
  const height = Number.isFinite(innerHeight) ? Math.max(0, Math.round(innerHeight)) : 0;
  const radius = Number.isFinite(innerRadius) ? Math.max(0, Math.round(innerRadius)) : 0;
  const start = Number.isFinite(startY) ? Math.round(startY * 100) / 100 : 0;
  return `${color}|h:${height}|r:${radius}|y:${start}`;
}

function ensureHpBarGradient(
  fillColor: string | undefined,
  innerHeight: number,
  innerRadius: number,
  startY: number,
  x: number,
): GradientValue {
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

function drawHPBars(): void {
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
function handleVisibilityChange(): void {
  if (!docRef) return;
  setDrawPaused(!!docRef.hidden);
}

function bindVisibility(): void {
  if (visibilityHandlerBound) return;
  const doc = docRef;
  if (!doc || typeof doc.addEventListener !== 'function') return;
  doc.addEventListener('visibilitychange', handleVisibilityChange);
  visibilityHandlerBound = true;
}

function unbindVisibility(): void {
  if (!visibilityHandlerBound) return;
  const doc = docRef;
  if (doc && typeof doc.removeEventListener === 'function'){
    doc.removeEventListener('visibilitychange', handleVisibilityChange);
  }
  visibilityHandlerBound = false;
}

function configureRoot(root: RootLike): void {
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

function clearSessionTimers(): void {
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

function clearSessionListeners(): void {
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

function resetDomRefs(): void {
  canvas = null;
  ctx = null;
  hud = null;
  hudCleanup = null;
  hpBarGradientCache.clear();
  invalidateSceneCache();
}

function stopSession(): void {
  clearSessionTimers();
  clearSessionListeners();
  cleanupSummonBar();
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

function bindSession(): void {
  bindArtSpriteListener();
  bindVisibility();
  if (docRef){
    setDrawPaused(!!docRef.hidden);
  } else {
    setDrawPaused(false);
  }
}

function startSession(config: StartConfigOverrides = {}): SessionState | null {
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

function applyConfigToRunningGame(cfg: NormalizedSessionConfig): void {
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
  if (Array.isArray(cfg.deck) && cfg.deck.length) {
    const deck = normalizeDeckEntries(cfg.deck);
    if (deck.length) Game.unitsAll = deck;
  }
  if (cfg.aiPreset){
    const preset: EnemyAIPreset = cfg.aiPreset || {};
    if (Array.isArray(preset.deck) && preset.deck.length){
      const enemyDeck = normalizeDeckEntries(preset.deck);
      if (enemyDeck.length) Game.ai.unitsAll = enemyDeck;
    } else if (Array.isArray(preset.unitsAll) && preset.unitsAll.length){
      const enemyPool = normalizeDeckEntries(preset.unitsAll);
      if (enemyPool.length) Game.ai.unitsAll = enemyPool;
    }
    if (Number.isFinite(preset.costCap)) Game.ai.costCap = preset.costCap;
    if (Number.isFinite(preset.summonLimit)) Game.ai.summonLimit = preset.summonLimit;
  }
  if (sceneChanged){
    invalidateSceneCache();
    scheduleDraw();
  }
}

function updateSessionConfig(next: StartConfigOverrides = {}): void {
  const normalized = normalizeConfig(next);
  storedConfig = normalizeConfig({ ...storedConfig, ...normalized });
  applyConfigToRunningGame(normalized);
}

export function createPveSession(
  rootEl: RootLike,
  options: PveSessionStartConfig | null = null,
): PveSessionHandle {
  const initial = sanitizeStartConfig(options);
  const normalized = normalizeConfig(initial.rest);
  storedConfig = { ...normalized };
  configureRoot((rootEl ?? initial.root) ?? null);

  const handle: PveSessionHandle = {
    start(startConfig: PveSessionStartConfig | null = null): SessionState | null {
      const { rest, root } = sanitizeStartConfig(startConfig);
      if (root) configureRoot(root);
      return startSession(rest);
    },
    stop(): void {
      stopSession();
    },
    updateConfig(next: StartConfigOverrides | null = null): void {
      const overrides = (next ?? {}) as StartConfigOverrides;
      updateSessionConfig(overrides);
    },
    setUnitSkin(unitId: string, skinKey: string | null | undefined): boolean {
      return setUnitSkinForSession(unitId, skinKey);
    },
  };
  
  return handle;
}

export function __getStoredConfig(): NormalizedSessionConfig {
  return { ...storedConfig };
}

export function __getActiveGame(): SessionState | null {
  return Game;
}
export { gameEvents, emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END, TURN_REGEN, BATTLE_END } from '../../events.ts';
export { clearBackgroundSignatureCache, computeBackgroundSignature, __backgroundSignatureCache } from './session-state.ts';