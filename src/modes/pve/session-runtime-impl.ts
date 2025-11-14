//v0.7.7
import { stepTurn, doActionOrSkip, predictSpawnCycle } from '../../turns';
import { enqueueImmediate, processActionChain } from '../../summon';
import { refillDeckEnemy, aiMaybeAct } from '../../ai';
import { Statuses, makeStatusEffect } from '../../statuses';
import { CFG, CAM } from '../../config';
import { UNITS } from '../../units';
import { Meta, makeInstanceStats, initialRageFor } from '../../meta';
import { basicAttack, pickTarget, dealAbilityDamage, healUnit, grantShield, applyDamage } from '../../combat';
import { initializeFury, setFury, spendFury, resolveUltCost, gainFury, finishFuryHit } from '../../utils/fury';
import {
  ROSTER, ROSTER_MAP,
  CLASS_BASE, RANK_MULT,
  getMetaById, isSummoner, applyRankAndMods
} from '../../catalog';
import {
  makeGrid, drawGridOblique,
  drawTokensOblique, drawQueuedOblique,
  hitToCellOblique, projectCellOblique,
  cellOccupied, spawnLeaders, pickRandom, slotIndex, slotToCell, cellReserved, ORDER_ENEMY,
  ART_SPRITE_EVENT,
} from '../../engine';
import { drawEnvironmentProps } from '../../background';
import { getUnitArt, setUnitSkin } from '../../art';
import { initHUD, startSummonBar } from '../../ui';
import {
  vfxDraw,
  vfxAddSpawn,
  vfxAddHit,
  vfxAddMelee,
  vfxAddLightningArc,
  vfxAddBloodPulse,
  vfxAddGroundBurst,
  vfxAddShieldWrap,
  asSessionWithVfx as baseAsSessionWithVfx,
} from '../../vfx';
import { drawBattlefieldScene } from '../../scene';
import {
  gameEvents,
  TURN_START,
  TURN_END,
  ACTION_START,
  ACTION_END,
  BATTLE_END,
  emitGameEvent,
  addGameEventListener,
} from '../../events';
import { ensureNestedModuleSupport } from '../../utils/dummy';
import {
  mergeBusyUntil,
  normalizeAnimationFrameTimestamp,
  resetSessionTimeBase,
  safeNow,
  sessionNow,
} from '../../utils/time';
import { getSummonSpec, resolveSummonSlots } from '../../utils/kit';
import {
  normalizeConfig,
  createSession,
  invalidateSceneCache,
  ensureSceneCache,
  clearBackgroundSignatureCache,
  normalizeDeckEntries,
} from './session-state';

import type {
  BattleDetail,
  BattleResult,
  BattleState,
  LeaderSnapshot,
  PveDeckEntry,
  SessionState as CombatSessionState,
} from '@shared-types/combat';
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
  SummonSpec,
  SummonCreepSpec,
  SummonInheritSpec,
} from '@shared-types/pve';
import type { HudHandles, SummonBarHandles } from '@shared-types/ui';
import type { CameraPreset } from '@shared-types/config';
import type { NormalizedSessionConfig } from './session-state';
import type { SessionWithVfx } from '../../vfx';
import type { GameEventDetailMap, GameEventHandler, GameEventType } from '../../events';
import type { UnitArtLayout } from '@shared-types/art';

type RootLike = Element | Document | null | undefined;
type StartConfigOverrides = Partial<CreateSessionOptions> & Record<string, unknown>;
type PveSessionStartConfig = StartConfigOverrides & {
  root?: RootLike;
  rootEl?: RootLike;
};

type FrameHandle = number | ReturnType<typeof setTimeout>;
type GradientValue = CanvasGradient | string;
type CanvasClickHandler = (event: MouseEvent) => void;
type ClockState = {
  startMs: number;
  startSafeMs: number;
  lastTimerRemain: number;
  lastCostCreditedSec: number;
  turnEveryMs: number;
  lastTurnStepMs: number;
  lastFrameMs: number;
  lastLogicMs: number;
  costAccumulator: number;
  lastTimerText: string | null;
};
type ExtendedQueuedSummon = (QueuedSummonRequest & {
  art?: ReturnType<typeof getUnitArt> | null;
  skinKey?: string | null;
  color?: string | null;
  [extra: string]: unknown;
}) | null;
type DeckEntry = PveDeckEntry;
type GridSpec = ReturnType<typeof makeGrid>;

type InitializedSessionState = SessionState & { _inited: true };

interface SkillRuntime extends Record<string, unknown> {
  hits?: number | string | null;
  hitCount?: number | string | null;
  count?: number | string | null;
  targets?: number | string | null;
  targetCount?: number | string | null;
  duration?: number | string | null;
  durationTurns?: number | string | null;
  turns?: number | string | null;
  busyMs?: number | string | null;
  durationMs?: number | string | null;
}

interface UltDamageSpec extends Record<string, unknown> {
  type?: string | null;
  scaleWIL?: number | string | null;
  scaleWil?: number | string | null;
  flat?: number | string | null;
  flatAdd?: number | string | null;
  percentTargetMaxHP?: number | string | null;
  basePercentMaxHPTarget?: number | string | null;
  bossPercent?: number | string | null;
  defPen?: number | string | null;
  pen?: number | string | null;
}

interface UltDebuffSpec extends Record<string, unknown> {
  id?: string | null;
  amount?: number | string | null;
  amountPercent?: number | string | null;
  maxStacks?: number | string | null;
  turns?: number | string | null;
}

interface UltReviveSpec extends Record<string, unknown> {
  hpPercent?: number | string | null;
  hpPct?: number | string | null;
  rage?: number | string | null;
  lockSkillsTurns?: number | string | null;
}

interface UltSpec extends Record<string, unknown> {
  type?: string | null;
  power?: number | string | null;
  hpTradePercent?: number | string | null;
  hpTrade?: { percentMaxHP?: number | string | null } | null;
  hits?: number | string | null;
  scale?: number | string | null;
  countsAsBasic?: boolean | null;
  tagAsBasic?: boolean | null;
  damage?: UltDamageSpec | null;
  appliesDebuff?: UltDebuffSpec | null;
  duration?: number | string | null;
  turns?: number | string | null;
  reduceDmg?: number | string | null;
  bonusVsLeader?: number | string | null;
  penRES?: number | string | null;
  selfHPTrade?: number | string | null;
  targets?: number | string | null;
  revived?: UltReviveSpec | null;
  allies?: number | string | null;
  healLeader?: boolean | null;
  attackSpeed?: number | string | null;
  runtime?: SkillRuntime | null;
  metadata?: { summon?: SummonSpec | null } | null;
  meta?: { summon?: SummonSpec | null } | null;
  summon?: SummonSpec | null;
}

const isPlainRecord = (value: unknown): value is Record<string, unknown> => (
  !!value && typeof value === 'object'
);

const isFiniteNumber = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value)
);

const parseFiniteNumber = (value: unknown): number | null => {
  if (isFiniteNumber(value)) return value;
  if (typeof value === 'string' && value.trim() !== ''){
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const toFiniteOrZero = (value: unknown): number => parseFiniteNumber(value) ?? 0;

const toStartConfigOverrides = (value: unknown): StartConfigOverrides => {
  if (!isPlainRecord(value)) return {};
  return { ...(value as Record<string, unknown>) } as StartConfigOverrides;
};

const toRootLike = (value: unknown): RootLike => {
  if (value == null) return value as null | undefined;
  if (typeof Element !== 'undefined' && value instanceof Element) return value;
  if (typeof Document !== 'undefined' && value instanceof Document) return value;
  if (typeof (value as { nodeType?: unknown }).nodeType === 'number'){
    return value as Element | Document;
  }
  return null;
};

const isInitializedGame = (
  game: SessionState | null | undefined = Game,
): game is InitializedSessionState => Boolean(game && game._inited);

const getInitializedGame = (): InitializedSessionState | null => (
  isInitializedGame() ? (Game as InitializedSessionState) : null
);

const coerceSkillRuntime = (value: unknown): SkillRuntime | null => {
  if (!isPlainRecord(value)) return null;
  const record = value as SkillRuntime;
  const normalized: SkillRuntime = { ...record };
  const numericKeys: ReadonlyArray<keyof SkillRuntime> = [
    'hits',
    'hitCount',
    'count',
    'targets',
    'targetCount',
    'duration',
    'durationTurns',
    'turns',
    'busyMs',
    'durationMs',
  ];
  for (const key of numericKeys){
    const parsed = parseFiniteNumber(record[key]);
    if (parsed != null) normalized[key] = parsed;
  }
  return normalized;
};

const coerceSummonCreep = (value: unknown): SummonCreepSpec | null => {
  if (!isPlainRecord(value)) return null;
  const record = value as SummonCreepSpec;
  const creep: SummonCreepSpec = { ...record };
  const ttlTurns = parseFiniteNumber(record.ttlTurns ?? record.ttl);
  if (ttlTurns != null) creep.ttlTurns = ttlTurns;
  return creep;
};

const coerceSummonSpec = (value: unknown): SummonSpec | null => {
  if (!value || typeof value !== 'object') return null;
  const spec = { ...(value as SummonSpec) };
  const sanitizeString = (input: unknown): string | undefined => {
    if (typeof input !== 'string') return undefined;
    const trimmed = input.trim();
    return trimmed ? trimmed : undefined;
  };
  spec.pattern = sanitizeString(spec.pattern);
  spec.placement = sanitizeString(spec.placement);
  spec.patternKey = sanitizeString(spec.patternKey);
  spec.shape = sanitizeString(spec.shape);
  spec.area = sanitizeString(spec.area);
  spec.replace = sanitizeString(spec.replace);
  if (Array.isArray(spec.slots)){
    spec.slots = spec.slots
      .map((slot) => parseFiniteNumber(slot))
      .filter((slot): slot is number => slot != null);
  }
  const count = parseFiniteNumber(spec.count);
  const summonCount = parseFiniteNumber(spec.summonCount);
  const resolvedCount = count ?? summonCount;
  if (resolvedCount != null){
    spec.count = resolvedCount;
    spec.summonCount = resolvedCount;
  }
  const ttl = parseFiniteNumber(spec.ttl);
  const ttlTurns = parseFiniteNumber(spec.ttlTurns ?? ttl);
  if (ttlTurns != null){
    spec.ttlTurns = ttlTurns;
    if (ttl == null) spec.ttl = ttlTurns;
  } else if (ttl != null){
    spec.ttl = ttl;
  }
  const limit = parseFiniteNumber(spec.limit);
  if (limit != null) spec.limit = limit;
  spec.inherit = isPlainRecord(spec.inherit) ? (spec.inherit as SummonInheritSpec) : null;
  spec.creep = coerceSummonCreep(spec.creep);
  return spec;
};

const isDamageSpec = (value: unknown): value is UltDamageSpec => isPlainRecord(value);

const coerceDamageSpec = (value: unknown): UltDamageSpec | null => {
  if (!isDamageSpec(value)) return null;
  const record = value as UltDamageSpec;
  const damage: UltDamageSpec = { ...record };
  const numericKeys: ReadonlyArray<keyof UltDamageSpec> = [
    'scaleWIL',
    'scaleWil',
    'flat',
    'flatAdd',
    'percentTargetMaxHP',
    'basePercentMaxHPTarget',
    'bossPercent',
    'defPen',
    'pen',
  ];
  for (const key of numericKeys){
    const parsed = parseFiniteNumber(record[key]);
    if (parsed != null) damage[key] = parsed;
  }
  if (typeof record.type === 'string') damage.type = record.type;
  return damage;
};

const coerceUlt = (value: unknown): UltSpec | null => {
  if (!value || typeof value !== 'object') return null;
  const record = value as UltSpec;
  const ult: UltSpec = { ...record };
  const numericKeys: ReadonlyArray<keyof UltSpec> = [
    'power',
    'hpTradePercent',
    'hits',
    'scale',
    'duration',
    'turns',
    'reduceDmg',
    'bonusVsLeader',
    'penRES',
    'selfHPTrade',
    'attackSpeed',
  ];
  for (const key of numericKeys){
    const parsed = parseFiniteNumber(record[key]);
    if (parsed != null) ult[key] = parsed;
  }
  const targetsParsed = parseFiniteNumber(record.targets);
  if (targetsParsed != null) ult.targets = targetsParsed;
  const alliesParsed = parseFiniteNumber(record.allies);
  if (alliesParsed != null) ult.allies = alliesParsed;
  ult.runtime = coerceSkillRuntime(record.runtime);
  const resolvedSummon =
    coerceSummonSpec(record.summon)
    ?? coerceSummonSpec(record.metadata?.summon)
    ?? coerceSummonSpec(record.meta?.summon);
  if (resolvedSummon) ult.summon = resolvedSummon;
  if (ult.metadata?.summon){
    ult.metadata = { ...ult.metadata, summon: coerceSummonSpec(ult.metadata.summon) };
  }
  if (ult.meta?.summon){
    ult.meta = { ...ult.meta, summon: coerceSummonSpec(ult.meta.summon) };
  }
  ult.damage = coerceDamageSpec(record.damage);
  return ult;
};

const readCountCandidate = (value: unknown): number | null => {
  const numeric = parseFiniteNumber(value);
  if (numeric != null) return numeric;
  if (typeof value === 'string'){
    const match = value.match(/(\d+)/);
    if (match && match[1]){
      const parsed = Number(match[1]);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
};

const resolveCount = (
  candidates: ReadonlyArray<unknown>,
  fallback: number,
  { min, max }: { min?: number; max?: number } = {},
): number => {
  for (const candidate of candidates){
    const value = readCountCandidate(candidate);
    if (value != null){
      let resolved = Math.round(value);
      if (typeof min === 'number') resolved = Math.max(min, resolved);
      if (typeof max === 'number') resolved = Math.min(max, resolved);
      return resolved;
    }
  }
  return fallback;
};

const getUltHitCount = (ult: UltSpec | null | undefined): number => {
  const runtime = ult?.runtime;
  const resolved = resolveCount([
    ult?.hits,
    runtime?.hits,
    runtime?.hitCount,
    runtime?.count,
  ], 1, { min: 1 });
  return Math.max(1, resolved);
};

const getUltTargetCount = (
  ult: UltSpec | null | undefined,
  fallback: number,
): number => {
  const runtime = ult?.runtime;
  return resolveCount([
    ult?.targets,
    runtime?.targets,
    runtime?.targetCount,
    runtime?.count,
  ], fallback, { min: 0 });
};

const getUltAlliesCount = (
  ult: UltSpec | null | undefined,
  fallback: number,
): number => resolveCount([
  ult?.allies,
  ult?.runtime?.targets,
  ult?.runtime?.count,
], fallback, { min: 0 });

const getUltDurationTurns = (
  ult: UltSpec | null | undefined,
  fallback: number,
): number => {
  const runtime = ult?.runtime;
  const resolved = resolveCount([
    ult?.duration,
    ult?.turns,
    runtime?.duration,
    runtime?.turns,
    runtime?.durationTurns,
  ], fallback, { min: 1 });
  return Math.max(1, resolved);
};

const ensureSessionWithVfx = (
  game: SessionState | SessionWithVfx | null | undefined,
  options?: { requireGrid?: boolean },
): SessionWithVfx | null => {
  const session = baseAsSessionWithVfx(game, options);
  if (!session) return null;
  if (!Array.isArray(session.vfx)){
    session.vfx = [];
  }
  return session;
};

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
  const game = getInitializedGame();
  if (!game) return [];
  const deck = sanitizeDeckEntries(game.deck3);
  if (deck !== game.deck3) {
    game.deck3 = deck;
  }
  return deck;
}

function ensureRoster(): ReadonlyArray<DeckEntry> {
  const game = getInitializedGame();
  if (!game) return [];
  const roster = sanitizeDeckEntries(game.unitsAll);
  if (roster !== game.unitsAll) {
    game.unitsAll = roster;
  }
  return game.unitsAll;
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
  config: unknown,
): { rest: StartConfigOverrides; root: RootLike } {
  if (!isPlainRecord(config)){
    return { rest: {}, root: null };
  }
  const { root, rootEl, ...rest } = config as Record<string, unknown>;
  const resolvedRoot = toRootLike(root) ?? toRootLike(rootEl) ?? null;
  return {
    rest: toStartConfigOverrides(rest),
    root: resolvedRoot,
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
const DEFAULT_CAMERA_KEY: keyof typeof CAM = 'landscape_oblique';
const resolveCameraPreset = (): CameraPreset => {
  const key = (CFG.CAMERA ?? DEFAULT_CAMERA_KEY) as keyof typeof CAM;
  const preset = CAM[key];
  return preset ?? CAM[DEFAULT_CAMERA_KEY];
};
const CAM_PRESET = resolveCameraPreset();
const getCameraPresetSignature = (preset: CameraPreset | null | undefined): string => {
  if (!preset) return 'null';
  const record = preset as Record<string, unknown>;
  return Object.keys(record)
    .sort()
    .map((key) => {
      const value = record[key];
      if (typeof value === 'number') return `${key}:${Number.isFinite(value) ? value : 'NaN'}`;
      if (typeof value === 'boolean') return `${key}:${value ? 'true' : 'false'}`;
      if (typeof value === 'string') return `${key}:"${value}"`;
      if (value === null) return `${key}:null`;
      if (typeof value === 'undefined') return `${key}:undefined`;
      return `${key}:${String(value)}`;
    })
    .join('|');
};
let lastCamPresetSignature = getCameraPresetSignature(CAM_PRESET);
const HAND_SIZE  = CFG.HAND_SIZE ?? 4;

ensureNestedModuleSupport();

const getNow = (): number => sessionNow();
const SUPPORTS_PERF_NOW = typeof globalThis !== 'undefined'
  && !!globalThis.performance
  && typeof globalThis.performance.now === 'function';
const RAF_TIMESTAMP_MAX = 2_147_483_647; // ~24 ngày tính từ mốc điều hướng
const RAF_DRIFT_TOLERANCE_MS = 120_000;   // 2 phút – đủ rộng cho mọi sai lệch hợp lệ
const CLOCK_DRIFT_TOLERANCE_MS = RAF_DRIFT_TOLERANCE_MS;
const LOGIC_MIN_INTERVAL_MS = 40;
const MAX_TURNS_PER_TICK = 6;

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
let canvasClickHandler: CanvasClickHandler | null = null;
let artSpriteHandler: (() => void) | null = null;
let visibilityHandlerBound = false;
let winRef: (Window & typeof globalThis) | null = null;
let docRef: Document | null = null;
let rootElement: Element | Document | null = null;
let timerElement: HTMLElement | null = null;
let storedConfig: NormalizedSessionConfig = normalizeConfig();
let running = false;
const hpBarGradientCache = new Map<string, GradientValue>();

const renderSummonBar = (): void => {
  const game = getInitializedGame();
  const bar = game?.ui?.bar ?? null;
  if (bar?.render) bar.render();
};

function cleanupSummonBar(): void {
  if (summonBarHandle && typeof summonBarHandle.cleanup === 'function'){
    try {
      summonBarHandle.cleanup();
    } catch {}
  }
  summonBarHandle = null;
  const game = getInitializedGame();
  if (game?.ui){
    game.ui.bar = null;
  }
}

function resetSessionState(options: StartConfigOverrides | null | undefined = {}): void {
  const overrides = toStartConfigOverrides(options);
  storedConfig = normalizeConfig({ ...storedConfig, ...overrides });
  resetSessionTimeBase();
  Game = createSession(storedConfig);
  _IID = 1;
  _BORN = 1;
  CLOCK = createClock();
  invalidateSceneCache();
}

if (CFG?.DEBUG?.LOG_EVENTS) {
  const logEvent = <T extends GameEventType>(type: T): GameEventHandler<T> => (event) => {
    const detail = (event?.detail ?? {}) as GameEventDetailMap[T] & Record<string, unknown>;
    const unitRaw = (detail['unit'] ?? null) as { id?: string; name?: string } | null | undefined;
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
      side: readString(detail['side'] as unknown),
      slot: readNumber(detail['slot'] as unknown),
      cycle: readNumber(detail['cycle'] as unknown),
      orderIndex: readNumber(detail['orderIndex'] as unknown),
      orderLength: readNumber(detail['orderLength'] as unknown),
      phase: readString(detail['phase'] as unknown),
      unit: readString(unitRaw?.id) ?? readString(unitRaw?.name),
      action: readString(detail['action'] as unknown),
      skipped: Boolean(detail['skipped']),
      reason: readString(detail['reason'] as unknown),
      processedChain: detail['processedChain'] ?? null,
    };
    console.debug(`[events] ${type}`, info);
  };
  const types: ReadonlyArray<GameEventType> = [TURN_START, TURN_END, ACTION_START, ACTION_END];
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
  const palettePrimary = art?.palette?.primary;
  const primaryColor = typeof palettePrimary === 'string' ? palettePrimary : null;
  const resolveColor = (current: unknown): string => {
    if (typeof primaryColor === 'string' && primaryColor.length > 0){
      return primaryColor;
    }
    if (typeof current === 'string' && current.length > 0){
      return current;
    }
    return DEFAULT_TOKEN_COLOR;
  };
  const applyArtMetadata = (entry: DeckEntry | null | undefined): void => {
    if (!entry || entry.id !== unitId) return;
    const color = typeof entry.color === 'string' ? entry.color : null;
    const nextColor = resolveColor(color);
    entry.art = art ?? null;
    entry.skinKey = resolvedSkin;
    entry.color = nextColor;
  };
  const tokens = Game.tokens || [];
  for (const token of tokens){
    if (!token || token.id !== unitId) continue;
    const color = typeof token.color === 'string' ? token.color : null;
    const nextColor = resolveColor(color);
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
  const safe = safeNow();
  const now = getNow();
  const intervalCandidate = CFG?.ANIMATION?.turnIntervalMs;
  const parsedInterval = Number(intervalCandidate);
  const turnEveryMs = Number.isFinite(parsedInterval) && parsedInterval > 0
    ? parsedInterval
    : 600;
  return {
    startMs: now,
    startSafeMs: safe,
    lastTimerRemain: 240,
    lastCostCreditedSec: 0,
    turnEveryMs,
    lastTurnStepMs: now - turnEveryMs,
    lastFrameMs: now,
    lastLogicMs: now - LOGIC_MIN_INTERVAL_MS,
    costAccumulator: 0,
    lastTimerText: null,
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
  inherit: SummonInheritSpec | null | undefined,
): Partial<Pick<UnitToken, 'hpMax' | 'hp' | 'atk' | 'wil' | 'res' | 'arm'>> {
  if (!inherit || typeof inherit !== 'object') return {};
  const hpRatio = parseFiniteNumber(inherit.HP ?? inherit.hp ?? inherit.HPMax ?? inherit.hpMax) ?? 0;
  const atkRatio = parseFiniteNumber(inherit.ATK ?? inherit.atk) ?? 0;
  const wilRatio = parseFiniteNumber(inherit.WIL ?? inherit.wil) ?? 0;
  const resRatio = parseFiniteNumber(inherit.RES ?? inherit.res) ?? 0;
  const armRatio = parseFiniteNumber(inherit.ARM ?? inherit.arm) ?? 0;
  const hpMaxBase = toFiniteOrZero(masterUnit?.hpMax);
  const atkBase = toFiniteOrZero(masterUnit?.atk);
  const wilBase = toFiniteOrZero(masterUnit?.wil);
  const resBase = toFiniteOrZero(masterUnit?.res);
  const armBase = toFiniteOrZero(masterUnit?.arm);
  const hpMax = Math.round(hpMaxBase * hpRatio);
  const atk   = Math.round(atkBase * atkRatio);
  const wil   = Math.round(wilBase * wilRatio);
  const res   = Math.round(resBase * resRatio);
  const arm   = Math.round(armBase * armRatio * 100) / 100;
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
  const game = getInitializedGame();
  if (!game || !game.turn) return;
  const now = getNow();
  const dur = Math.max(0, duration|0);
  game.turn.busyUntil = mergeBusyUntil(game.turn.busyUntil, now, dur);
}

// Thực thi Ult: Summoner -> Immediate Summon theo meta; class khác: trừ nộ
function performUlt(unit: UnitToken): void {
  const game = getInitializedGame();
  if (!game){
    setFury(unit, 0);
    return;
  }
  const metaGetter = game.meta?.get;
  const meta = typeof metaGetter === 'function' ? metaGetter.call(game.meta, unit.id) : null;
  if (!meta) { setFury(unit, 0); return; }

  const slot = slotIndex(unit.side, unit.cx, unit.cy);

  const summonSpecRaw = meta.class === 'Summoner' ? getSummonSpec(meta) : null;
  const summonSpec = meta.class === 'Summoner' ? coerceSummonSpec(summonSpecRaw) : null;
  if (summonSpec){
    summonSpec.pattern = typeof summonSpec.pattern === 'string'
      ? (summonSpec.pattern.trim() || undefined)
      : undefined;
  }
  if (meta.class === 'Summoner' && summonSpec){
    const aliveNow = tokensAlive();
    const queued = game.queued || { ally: new Map(), enemy: new Map() };
    const slotsSource = summonSpec as Parameters<typeof resolveSummonSlots>[0];
    const patternSlots = resolveSummonSlots(slotsSource, slot)
      .filter((s): s is number => typeof s === 'number' && Number.isFinite(s))
      .filter((s) => {
        const { cx, cy } = slotToCell(unit.side, s);
        return !cellReserved(aliveNow, queued, cx, cy);
      })
      .sort((a, b) => a - b);

    const desired = parseFiniteNumber(summonSpec.count) ?? (patternSlots.length || 1);
    const need = Math.min(patternSlots.length, Math.max(0, desired));

    if (need > 0){
      const limit = parseFiniteNumber(summonSpec.limit) ?? Infinity;
      const have  = getMinionsOf(unit.iid).length;
      const over  = Math.max(0, have + need - limit);
      const replacePolicy = typeof summonSpec.replace === 'string' ? summonSpec.replace.trim().toLowerCase() : null;
      if (over > 0 && replacePolicy === 'oldest') removeOldestMinions(unit.iid, over);

      const inheritStats = creepStatsFromInherit(unit, summonSpec.inherit);
      const ttlBase = parseFiniteNumber(summonSpec.ttlTurns ?? summonSpec.ttl);

      for (let i = 0; i < need; i++){
        const s = patternSlots[i];
        const base = (summonSpec.creep ?? {}) as SummonCreepSpec;
        const spawnTtl = parseFiniteNumber(base.ttlTurns ?? base.ttl) ?? ttlBase;
        const creepId = typeof base.id === 'string' && base.id.trim() ? base.id : `${unit.id}_minion`;
        const creepName = typeof base.name === 'string' && base.name.trim()
          ? base.name
          : (typeof base.label === 'string' && base.label.trim() ? base.label : 'Creep');
        const creepColor = typeof base.color === 'string' && base.color.trim() ? base.color : '#ffd27d';
        const ttlTurns = Math.max(1, Math.round(parseFiniteNumber(spawnTtl) ?? 3));
        enqueueImmediate(game, {
          by: unit.id,
          side: unit.side,
          slot: s,
          unit: {
            id: creepId,
            name: creepName,
            color: creepColor,
            isMinion: base.isMinion !== false,
            ownerIid: unit.iid,
            bornSerial: _BORN++,
            ttlTurns,
            ...inheritStats
          }
        });
      }
    }
    setFury(unit, 0);
    return;
  }

  const u = coerceUlt(meta.kit?.ult);
  if (!u){ spendFury(unit, resolveUltCost(unit)); return; }

  const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
  let busyMs = 900;

  switch(u.type){
    case 'drain': {
      const aliveNow = tokensAlive();
      const foes = aliveNow.filter(t => t.side === foeSide);
      if (!foes.length) break;
      const scale = parseFiniteNumber(u.power) ?? 1.2;
      let totalDrain = 0;
      for (const tgt of foes){
        if (!tgt.alive) continue;
        const base = Math.max(1, Math.round((unit.wil || 0) * scale));
        const { dealt } = dealAbilityDamage(game, unit, tgt, {
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
      const hpTradePctRaw = parseFiniteNumber(u.hpTradePercent ?? u.hpTrade?.percentMaxHP) ?? 0;
      const hpTradePct = Math.max(0, Math.min(0.95, hpTradePctRaw));
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
      const foes = aliveNow.filter((t) => t.side === foeSide && t.alive);

      const hits = getUltHitCount(u);
      const selected: UnitToken[] = [];
      if (foes.length){
        const primary = pickTarget(game, unit);
        if (primary){
          selected.push(primary);
        }
        const pool = foes.filter((t) => !selected.includes(t));
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
        const resolved = duration as number;
        busyMs = Math.max(busyMs, resolved);
        if (game.turn){
          game.turn.busyUntil = mergeBusyUntil(game.turn.busyUntil, startedAt, resolved);
        }
      };

      const bindingKey = 'huyet_hon_loi_quyet';

      {
        const startedAt = getNow();
        const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
        if (sessionVfx) {
          try {
            const dur = vfxAddBloodPulse(sessionVfx, unit, {
              bindingKey,
              timing: 'charge_up'
            });
            applyBusyFromVfx(startedAt, dur);
          } catch (_) {}
        }
      }

      const damageSpec = (u.damage ?? {}) as UltDamageSpec;
      const dtype = typeof damageSpec.type === 'string' && damageSpec.type ? damageSpec.type : 'arcane';
      const attackType = u.countsAsBasic ? 'basic' : 'skill';
      const wilScale = parseFiniteNumber(damageSpec.scaleWIL ?? damageSpec.scaleWil) ?? 0;
      const flatAdd = parseFiniteNumber(damageSpec.flat ?? damageSpec.flatAdd) ?? 0;
      const debuffSpec = u.appliesDebuff ?? null;
      const debuffId = typeof debuffSpec?.id === 'string' && debuffSpec.id ? debuffSpec.id : 'loithienanh_spd_burn';
      const debuffAmount = parseFiniteNumber(debuffSpec?.amount ?? debuffSpec?.amountPercent) ?? 0;
      const debuffMaxStacks = Math.max(1, Math.round(parseFiniteNumber(debuffSpec?.maxStacks) ?? 1));
      const debuffDuration = Math.max(1, Math.round(parseFiniteNumber(debuffSpec?.turns) ?? getUltDurationTurns(u, parseFiniteNumber(u.turns) ?? 1)));

      for (const tgt of selected){
        if (!tgt || !tgt.alive) continue;
        const tgtRank = game.meta?.rankOf?.(tgt.id) || tgt?.rank || '';
        const isBoss = typeof tgtRank === 'string' && tgtRank.toLowerCase() === 'boss';
        const pctDefault = parseFiniteNumber(damageSpec.percentTargetMaxHP ?? damageSpec.basePercentMaxHPTarget) ?? 0;
        const pct = isBoss
          ? parseFiniteNumber(damageSpec.bossPercent) ?? pctDefault
          : pctDefault;
        const baseFromPct = Math.round(Math.max(0, pct) * Math.max(0, tgt.hpMax || 0));
        const baseFromWil = Math.round(Math.max(0, wilScale) * Math.max(0, unit.wil || 0));
        const baseFlat = Math.round(Math.max(0, flatAdd));
        const base = Math.max(1, baseFromPct + baseFromWil + baseFlat);
        dealAbilityDamage(game, unit, tgt, {
          base,
          dtype,
          attackType,
          defPen: parseFiniteNumber(damageSpec.defPen ?? damageSpec.pen) ?? 0
        });

        {
          const startedAt = getNow();
        const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
          if (sessionVfx) {
            try {
              const dur = vfxAddLightningArc(sessionVfx, unit, tgt, {
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
        const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
        if (sessionVfx) {
          try {
            const dur = vfxAddGroundBurst(sessionVfx, unit, {
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
        const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
        if (sessionVfx) {
          try {
            const dur = vfxAddGroundBurst(sessionVfx, unit, {
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
        const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
        if (sessionVfx) {
          try {
            const dur = vfxAddShieldWrap(sessionVfx, unit, {
              bindingKey,
              anchorId: 'root',
              timing: 'burst_core'
            });
            applyBusyFromVfx(startedAt, dur);
          } catch (_) {}
        }
      }

      const reduceDmg = parseFiniteNumber(u.reduceDmg);
      if (reduceDmg && reduceDmg > 0){
        const turns = getUltDurationTurns(u, parseFiniteNumber(u.turns) ?? 1);
        const damageCut = makeStatusEffect('damageCut', { pct: reduceDmg, turns });
        if (damageCut) {
          Statuses.add(unit, damageCut);
        }
      }

      busyMs = Math.max(busyMs, 1600);
      break;
    }

    case 'strikeLaneMid': {
      const primary = pickTarget(game, unit);
      if (!primary) break;
      const laneX = primary.cx;
      const aliveNow = tokensAlive();
      const laneTargets = aliveNow.filter(t => t.side === foeSide && t.cx === laneX);
      const hits = getUltHitCount(u);
      const scale = parseFiniteNumber(u.scale) ?? 0.9;
      const meleeDur = parseFiniteNumber(CFG?.ANIMATION?.meleeDurationMs) ?? 2000;
      const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
      if (sessionVfx) {
        try { vfxAddMelee(sessionVfx, unit, primary, { dur: meleeDur }); } catch(_){}
      }
      busyMs = Math.max(busyMs, meleeDur);
      for (const enemy of laneTargets){
        if (!enemy.alive) continue;
        for (let h=0; h<hits; h++){
          if (!enemy.alive) break;
          let base = Math.max(1, Math.round((unit.atk || 0) * scale));
          const bonusVsLeader = parseFiniteNumber(u.bonusVsLeader) ?? 0;
          if (bonusVsLeader && (enemy.id === 'leaderA' || enemy.id === 'leaderB')){
            base = Math.round(base * (1 + bonusVsLeader));
          }
          dealAbilityDamage(game, unit, enemy, {
            base,
            dtype: 'arcane',
            attackType: u.tagAsBasic ? 'basic' : 'skill',
            defPen: parseFiniteNumber(u.penRES) ?? 0
          });
        }
      }
      break;
    }

    case 'selfBuff': {
      const tradePct = Math.max(0, Math.min(0.9, parseFiniteNumber(u.selfHPTrade) ?? 0));
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
      const reduce = Math.max(0, parseFiniteNumber(u.reduceDmg) ?? 0);
      if (reduce > 0){
        const turns = getUltDurationTurns(u, parseFiniteNumber(u.turns) ?? 1);
        const damageCut = makeStatusEffect('damageCut', { pct: reduce, turns });
        if (damageCut) {
          Statuses.add(unit, damageCut);
        }
      }
      {
        const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
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
      const take = Math.max(1, Math.min(foes.length, getUltTargetCount(u, foes.length)));
      foes.sort((a,b)=>{
        const da = Math.abs(a.cx - unit.cx) + Math.abs(a.cy - unit.cy);
        const db = Math.abs(b.cx - unit.cx) + Math.abs(b.cy - unit.cy);
        return da - db;
      });
      for (let i=0; i<take; i++){
        const tgt = foes[i];
        if (!tgt) continue;
        const turns = getUltDurationTurns(u, parseFiniteNumber(u.turns) ?? 1);
        const sleep = makeStatusEffect('sleep', { turns });
        if (sleep) {
          Statuses.add(tgt, sleep);
        }
        const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
        if (sessionVfx) {
          try { vfxAddHit(sessionVfx, tgt); } catch(_){}
        }
      }
      busyMs = 1000;
      break;
    }

    case 'revive': {
      const tokens = game.tokens || [];
      const fallen = tokens.filter(t => t.side === unit.side && !t.alive);
      if (!fallen.length) break;
      fallen.sort((a,b)=> (b.deadAt||0) - (a.deadAt||0));
      const take = Math.max(1, Math.min(fallen.length, getUltTargetCount(u, 1)));
      for (let i=0; i<take; i++){
        const ally = fallen[i];
        if (!ally) continue;
        ally.alive = true;
        ally.deadAt = 0;
        ally.hp = 0;
        Statuses.purge(ally);
        const revivedHp = parseFiniteNumber(u.revived?.hpPercent ?? u.revived?.hpPct) ?? 0.5;
        const hpPct = Math.max(0, Math.min(1, revivedHp));
        const healAmt = Math.max(1, Math.round((ally.hpMax || 0) * hpPct));
        healUnit(ally, healAmt);
        setFury(ally, Math.max(0, parseFiniteNumber(u.revived?.rage) ?? 0));
        if (u.revived?.lockSkillsTurns){
          const silenceTurns = Math.max(1, Math.round(parseFiniteNumber(u.revived.lockSkillsTurns) ?? 1));
          const silence = makeStatusEffect('silence', { turns: silenceTurns });
          if (silence) {
            Statuses.add(ally, silence);
          }
        }
        const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
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
      const count = Math.max(1, Math.min(allies.length, getUltAlliesCount(u, allies.length)));
      const selected = allies.slice(0, count);
      if (u.healLeader){
        const leaderId = unit.side === 'ally' ? 'leaderA' : 'leaderB';
        const tokens = game.tokens || [];
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
          const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
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
      const extraAllies = Math.max(0, getUltTargetCount(u, 1) - 1);
      const aliveNow = tokensAlive();
      const others = aliveNow.filter(t => t.side === unit.side && t !== unit);
      others.sort((a,b)=> (a.spd||0) - (b.spd||0));
      for (const ally of others){
        if (targets.size >= extraAllies + 1) break;
        targets.add(ally);
      }
      const pct = parseFiniteNumber(u.attackSpeed) ?? 0.1;
      for (const tgt of targets){
        const turns = getUltDurationTurns(u, parseFiniteNumber(u.turns) ?? 1);
        const haste = makeStatusEffect('haste', { pct, turns });
        if (haste) {
          Statuses.add(tgt, haste);
        }
        const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
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

function ensureBattleState(game: (SessionState | CombatSessionState) | null): BattleState | null {
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

function isBossToken(
  game: (SessionState | CombatSessionState) | null,
  token: UnitToken | null | undefined,
): boolean {
  if (!token) return false;
  if (token.isBoss) return true;
  const rankRaw = typeof token.rank === 'string' && token.rank ? token.rank : (game?.meta?.rankOf?.(token.id) || '');
  const rank = typeof rankRaw === 'string' ? rankRaw.toLowerCase() : '';
  return rank === 'boss';
}

function isPvpMode(game: (SessionState | CombatSessionState) | null): boolean {
  const key = (game?.modeKey || '').toString().toLowerCase();
  if (!key) return false;
  if (key === 'ares') return true;
  return key.includes('pvp');
}

function finalizeBattle(
  game: (SessionState | CombatSessionState) | null,
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
    game.turn.busyUntil = mergeBusyUntil(game.turn.busyUntil, finishedAt, 0);
  }
  if (game === Game){
    running = false;
    clearSessionTimers();
    try {
      if (hud && typeof hud.update === 'function' && Game) hud.update(Game);
    } catch (_) {}
    scheduleDraw();
  }
  if (game){
    emitGameEvent(BATTLE_END, { game, result, context });
  }
  return result;
}

function checkBattleEndResult(
  game: (SessionState | CombatSessionState) | null,
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
  const timestampCandidate = typeof timestampRaw === 'number' ? timestampRaw : Number(timestampRaw);
  const finishedAt = Number.isFinite(timestampCandidate)
    ? normalizeAnimationFrameTimestamp(timestampCandidate)
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
    const ttl = t.ttlTurns;
    if (typeof ttl !== 'number' || !Number.isFinite(ttl)) continue;

    const nextTtl = ttl - 1;
    t.ttlTurns = nextTtl;
    if (nextTtl <= 0) toRemove.push(t);
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
  const currentHud = hud;
  hudCleanup = currentHud ? () => currentHud.cleanup() : null;
  const tokens = Array.isArray(Game.tokens) ? Game.tokens : [];
  if (!Array.isArray(Game.tokens)){
    Game.tokens = tokens;
  }

  resize();

  let spawnGrid: GridSpec | null = (Game.grid ?? null) as GridSpec | null;
  if (!spawnGrid){
    const parsedCols = parseFiniteNumber(CFG?.GRID_COLS);
    const parsedRows = parseFiniteNumber(CFG?.GRID_ROWS);
    const fallbackCols = parsedCols !== null && parsedCols > 0
      ? Math.max(1, Math.floor(parsedCols))
      : 7;
    const fallbackRows = parsedRows !== null && parsedRows > 0
      ? Math.max(1, Math.floor(parsedRows))
      : 3;
    spawnGrid = makeGrid(canvas ?? null, fallbackCols, fallbackRows);
  }

  if (spawnGrid){
    spawnLeaders(tokens, spawnGrid);
    if (!Game.grid){
      Game.grid = spawnGrid;
    }
  }

  const sessionVfx = ensureSessionWithVfx(Game, { requireGrid: true });
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
      const game = getInitializedGame();
      if (!game) return;
      const entry = asDeckEntry(card);
      game.selectedId = entry.id;
      renderSummonBar();
    },
    canAfford: (card): boolean => {
      const game = getInitializedGame();
      if (!game) return false;
      const entry = asDeckEntry(card);
      return game.cost >= getCardCost(entry);
    },
    getDeck: (): DeckEntry[] => {
      const game = getInitializedGame();
      if (!game) return [] as DeckEntry[];
      return ensureDeck();
    },
    getSelectedId: (): string | null => {
      const game = getInitializedGame();
      return game ? game.selectedId : null;
    },
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
    const game = getInitializedGame();
    if (!canvas || !game) return;
    const { grid } = game;
    if (!grid) return;
    const rect = canvas.getBoundingClientRect();
    const p = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    const cell = hitToCellOblique(grid, p.x, p.y, CAM_PRESET);
    if (!cell) return;

    if (cell.cx >= CFG.ALLY_COLS) return;

    const deck = ensureDeck();
    const card = deck.find((u) => u.id === game.selectedId) ?? null;
    if (!card) return;

    if (cellReserved(tokensAlive(), game.queued, cell.cx, cell.cy)) return;
    const cardCost = getCardCost(card);
    if (game.cost < cardCost) return;
    if (game.summoned >= game.summonLimit) return;

    const slot = slotIndex('ally', cell.cx, cell.cy);
    if (game.queued.ally.has(slot)) return;

    const spawnCycle = predictSpawnCycle(game, 'ally', slot);
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
    game.queued.ally.set(slot, pending);

    game.cost = Math.max(0, game.cost - cardCost);
    if (hud && game) hud.update(game);
    game.summoned += 1;
    game.usedUnitIds.add(card.id);

    game.deck3 = deck.filter((u) => u.id !== card.id);
    game.selectedId = null;
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

    timerElement = (queryFromRoot('#timer') || doc.getElementById('timer')) as HTMLElement | null;

  const updateTimerAndCost = (timestamp?: number): void => {
    if (!CLOCK || !Game) return;
    if (Game.battle?.over) return;

    const safeNowMs = safeNow();
    const sessionNowMsRaw = sessionNow();
    let forcedElapsedSec: number | null = null;
    const safeDelta = safeNowMs - CLOCK.startSafeMs;
    const previousStartMs = Number.isFinite(CLOCK.startMs) ? CLOCK.startMs : null;
    const sessionWentBack = previousStartMs !== null
      && Number.isFinite(sessionNowMsRaw)
      && sessionNowMsRaw < previousStartMs;
    if (safeDelta < -CLOCK_DRIFT_TOLERANCE_MS || sessionWentBack){
      const previousElapsedSec = Number.isFinite(CLOCK.lastCostCreditedSec)
        ? Math.max(0, CLOCK.lastCostCreditedSec)
        : Math.max(
          0,
          240 - (Number.isFinite(CLOCK.lastTimerRemain) ? CLOCK.lastTimerRemain : 240),
        );
      const previousRemain = Number.isFinite(CLOCK.lastTimerRemain)
        ? Math.max(0, CLOCK.lastTimerRemain)
        : Math.max(0, 240 - previousElapsedSec);
      const previousTurnStep = Number.isFinite(CLOCK.lastTurnStepMs)
        ? CLOCK.lastTurnStepMs
        : null;

        let turnEveryMs = CLOCK.turnEveryMs;
        const cfgTurnEvery = CFG?.ANIMATION?.turnIntervalMs;
        const parsedTurnEvery = Number(cfgTurnEvery);
        if (!Number.isFinite(turnEveryMs) || turnEveryMs <= 0){
          turnEveryMs = Number.isFinite(parsedTurnEvery) && parsedTurnEvery > 0
            ? parsedTurnEvery
            : 600;
          CLOCK.turnEveryMs = turnEveryMs;
        }

        const previousElapsedMs = Math.max(0, previousElapsedSec) * 1000;
        let sessionForRebase = sessionNowMsRaw;
        if (!Number.isFinite(sessionForRebase)){
          sessionForRebase = previousStartMs !== null
            ? previousStartMs + previousElapsedMs
            : safeNowMs;
        }

        let normalizedStart = Number.isFinite(sessionForRebase)
          ? sessionForRebase - previousElapsedMs
          : sessionForRebase;
        if (!Number.isFinite(normalizedStart)){
          normalizedStart = sessionForRebase;
        }
        CLOCK.startMs = Number.isFinite(normalizedStart)
          ? normalizedStart
          : sessionForRebase;
        if (!Number.isFinite(CLOCK.startMs)){
          CLOCK.startMs = sessionForRebase;
        }
        CLOCK.startSafeMs = safeNowMs;

        forcedElapsedSec = previousElapsedSec;
        CLOCK.lastCostCreditedSec = previousElapsedSec;
        CLOCK.lastTimerRemain = previousRemain;

        const minTurnStep = Number.isFinite(sessionForRebase)
          ? sessionForRebase - turnEveryMs
          : previousTurnStep ?? CLOCK.startMs - turnEveryMs;
        const maxTurnStep = Number.isFinite(sessionForRebase)
          ? sessionForRebase
          : CLOCK.startMs;
        let normalizedTurnStep = previousTurnStep ?? minTurnStep;
        if (!Number.isFinite(normalizedTurnStep)){
          normalizedTurnStep = minTurnStep;
        }
        if (Number.isFinite(minTurnStep) && normalizedTurnStep < minTurnStep){
          normalizedTurnStep = minTurnStep;
        }
        if (Number.isFinite(maxTurnStep) && normalizedTurnStep > maxTurnStep){
          normalizedTurnStep = maxTurnStep;
        }
        CLOCK.lastTurnStepMs = normalizedTurnStep;

        const rebaseFrame = Number.isFinite(sessionForRebase)
          ? sessionForRebase
          : CLOCK.startMs;
        CLOCK.lastFrameMs = Number.isFinite(rebaseFrame)
          ? rebaseFrame
          : CLOCK.startMs;
          CLOCK.lastLogicMs = Number.isFinite(rebaseFrame)
          ? rebaseFrame - LOGIC_MIN_INTERVAL_MS
          : CLOCK.startMs - LOGIC_MIN_INTERVAL_MS;
        CLOCK.costAccumulator = 0;
        CLOCK.lastTimerText = null;
      }

      const expectedSessionMs = safeNowMs - CLOCK.startSafeMs + CLOCK.startMs;
      let sessionNowMs = getNow();
      const needRebase = !Number.isFinite(sessionNowMs)
        || Math.abs(sessionNowMs - expectedSessionMs) > CLOCK_DRIFT_TOLERANCE_MS;
      if (needRebase){
        sessionNowMs = expectedSessionMs;
      }
      if (isFiniteNumber(timestamp)){
        const rafTs = Number(timestamp);
        if (SUPPORTS_PERF_NOW || (rafTs >= 0 && rafTs <= RAF_TIMESTAMP_MAX)){
          sessionNowMs = normalizeAnimationFrameTimestamp(rafTs);
        }
        if (needRebase){
          const adjusted = expectedSessionMs;
          if (!Number.isFinite(sessionNowMs)
            || Math.abs(sessionNowMs - adjusted) > CLOCK_DRIFT_TOLERANCE_MS){
            sessionNowMs = adjusted;
          }
        }
      }

      if (!Number.isFinite(CLOCK.lastFrameMs)){
        CLOCK.lastFrameMs = Number.isFinite(CLOCK.startMs)
          ? CLOCK.startMs
          : expectedSessionMs;
      }

      const lastFrameMs = Number.isFinite(CLOCK.lastFrameMs)
        ? CLOCK.lastFrameMs
        : expectedSessionMs;
      if (!Number.isFinite(sessionNowMs)){
        sessionNowMs = expectedSessionMs;
      }
      if (Number.isFinite(lastFrameMs) && sessionNowMs <= lastFrameMs){
        const fallbackFrame = Math.max(expectedSessionMs, lastFrameMs + 1);
        sessionNowMs = fallbackFrame;
      }
      CLOCK.lastFrameMs = Number.isFinite(sessionNowMs) ? sessionNowMs : expectedSessionMs;

      if (!Number.isFinite(CLOCK.lastLogicMs)){
        CLOCK.lastLogicMs = sessionNowMs - LOGIC_MIN_INTERVAL_MS;
      }

      const logicSinceMs = sessionNowMs - CLOCK.lastLogicMs;
      if (Number.isFinite(logicSinceMs) && logicSinceMs < LOGIC_MIN_INTERVAL_MS){
        return;
      }

      const startMs = Number.isFinite(CLOCK.startMs) ? CLOCK.startMs : CLOCK.lastFrameMs;
      let elapsedMsPrecise = Number.isFinite(startMs) ? sessionNowMs - startMs : 0;
      if (!Number.isFinite(elapsedMsPrecise)){
        elapsedMsPrecise = (forcedElapsedSec ?? 0) * 1000;
      }
      if (elapsedMsPrecise < 0){
        elapsedMsPrecise = 0;
      }
      let elapsedSecPrecise = elapsedMsPrecise / 1000;
      if (forcedElapsedSec !== null && elapsedSecPrecise < forcedElapsedSec){
        elapsedSecPrecise = forcedElapsedSec;
        elapsedMsPrecise = elapsedSecPrecise * 1000;
      }

      const prevRemainDisplay = Number.isFinite(CLOCK.lastTimerRemain)
        ? CLOCK.lastTimerRemain
        : Math.max(0, 240 - Math.floor(elapsedSecPrecise));
      const remainSecPrecise = Math.max(0, 240 - elapsedSecPrecise);
      const remainDisplay = Math.max(0, Math.floor(remainSecPrecise));
      const mm = String(Math.floor(remainDisplay / 60)).padStart(2, '0');
      const ss = String(remainDisplay % 60).padStart(2, '0');
      const nextTimerText = `${mm}:${ss}`;
      if (nextTimerText !== CLOCK.lastTimerText){
        let tEl = timerElement;
        if (!tEl || !tEl.isConnected){
          const refreshed = (queryFromRoot('#timer') || doc.getElementById('timer')) as HTMLElement | null;
          timerElement = refreshed ?? null;
          tEl = timerElement;
        }
        if (tEl) tEl.textContent = nextTimerText;
        CLOCK.lastTimerText = nextTimerText;
      }
      CLOCK.lastTimerRemain = remainDisplay;
      if (CLOCK.lastTimerText === null){
        CLOCK.lastTimerText = nextTimerText;
      }

      if (remainSecPrecise <= 0 && prevRemainDisplay > 0){
        const timeoutResult = checkBattleEndResult(Game, { trigger: 'timeout', remain: remainDisplay, timestamp: sessionNowMs });
        if (timeoutResult) return;
      }

      const lastCredited = Number.isFinite(CLOCK.lastCostCreditedSec)
        ? CLOCK.lastCostCreditedSec
        : 0;
      let deltaSec = elapsedSecPrecise - lastCredited;
      if (!Number.isFinite(deltaSec) || deltaSec < 0){
        deltaSec = 0;
      }
      const accumulatorBase = Number.isFinite(CLOCK.costAccumulator) ? CLOCK.costAccumulator : 0;
      let nextAccumulator = accumulatorBase + deltaSec;
      let costGranted = 0;
      if (nextAccumulator >= 1){
        costGranted = Math.floor(nextAccumulator);
        nextAccumulator -= costGranted;
      }
      if (!Number.isFinite(nextAccumulator) || nextAccumulator < 0){
        nextAccumulator = 0;
      }
      CLOCK.costAccumulator = nextAccumulator;
      CLOCK.lastCostCreditedSec = Math.max(lastCredited, elapsedSecPrecise);

      let costChanged = false;
      if (costGranted > 0){
        if (Game.cost < Game.costCap){
          const nextCost = Math.min(Game.costCap, Game.cost + costGranted);
          if (nextCost !== Game.cost){
            Game.cost = nextCost;
            costChanged = true;
          }
        }
        if (Game.ai.cost < Game.ai.costCap){
          const nextAiCost = Math.min(Game.ai.costCap, Game.ai.cost + costGranted);
          if (nextAiCost !== Game.ai.cost){
            Game.ai.cost = nextAiCost;
            costChanged = true;
          }
        }
      }

        if (costChanged){
        if (hud && Game) hud.update(Game);
        if (!Game.selectedId) selectFirstAffordable();
        renderSummonBar();
        aiMaybeAct(Game, 'cost');
      }

      CLOCK.lastLogicMs = sessionNowMs;

      if (Game.battle?.over) return;

      const turnState = Game.turn ?? null;
      let busyUntil = 0;
      if (turnState){
        const rawBusy = turnState.busyUntil;
        busyUntil = isFiniteNumber(rawBusy) && rawBusy > 0 ? rawBusy : 0;
        if (!isFiniteNumber(rawBusy) || rawBusy <= 0){
          turnState.busyUntil = busyUntil;
        }
      }

      const cfgTurnEvery = CFG?.ANIMATION?.turnIntervalMs;
      const defaultTurnEveryMs = Number.isFinite(cfgTurnEvery) && cfgTurnEvery && cfgTurnEvery > 0
        ? cfgTurnEvery
        : 600;
      let turnEveryMs = CLOCK.turnEveryMs;
      if (!Number.isFinite(turnEveryMs) || turnEveryMs <= 0){
        turnEveryMs = defaultTurnEveryMs;
        CLOCK.turnEveryMs = turnEveryMs;
      }

      const stallDeltaEpsilon = 1;
      const initialTurnBaseline = Number.isFinite(CLOCK.startMs)
        ? CLOCK.startMs - turnEveryMs
        : sessionNowMs - turnEveryMs;
      if (!Number.isFinite(CLOCK.lastTurnStepMs)){
        CLOCK.lastTurnStepMs = initialTurnBaseline;
      } else if (CLOCK.lastTurnStepMs > sessionNowMs){
        CLOCK.lastTurnStepMs = sessionNowMs - turnEveryMs;
      }

      const readyByBusy = sessionNowMs >= busyUntil;
      let elapsedForTurn = sessionNowMs - CLOCK.lastTurnStepMs;

      if (readyByBusy && (!Number.isFinite(elapsedForTurn) || elapsedForTurn < -stallDeltaEpsilon)){
        CLOCK.lastTurnStepMs = sessionNowMs - turnEveryMs;
        elapsedForTurn = turnEveryMs;
      }

      if (readyByBusy && elapsedForTurn >= turnEveryMs){
        let turnsProcessed = 0;
        while (readyByBusy && elapsedForTurn >= turnEveryMs && turnsProcessed < MAX_TURNS_PER_TICK){
          CLOCK.lastTurnStepMs += turnEveryMs;
          elapsedForTurn -= turnEveryMs;
          turnsProcessed += 1;
          stepTurn(Game, {
            performUlt,
            processActionChain,
            allocIid: nextIid,
            doActionOrSkip,
            checkBattleEnd(gameState, info) {
              return Boolean(checkBattleEndResult(gameState, info));
            },
          });
          cleanupDead(sessionNowMs);
          const postTurnResult = checkBattleEndResult(Game, { trigger: 'post-turn', timestamp: sessionNowMs });
          scheduleDraw();
          if (postTurnResult){
            return;
          }
          aiMaybeAct(Game, 'board');
        }
      }
  };

  const runTickLoop = (timestamp?: number): void => {
    tickLoopHandle = null;
    try {
      updateTimerAndCost(timestamp);
    } catch (err) {
      console.error('[pve] tick loop error', err);
      if (hud && typeof hud.update === 'function'){
        try {
          hud.update({ cost: Game?.cost ?? null, costCap: Game?.costCap ?? null });
        } catch (hudErr) {
          console.error('[pve] HUD update fallback sau lỗi tick thất bại', hudErr);
        }
      }
    }
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
      const turnMs = Number.isFinite(CLOCK.turnEveryMs) && CLOCK.turnEveryMs > 0
        ? CLOCK.turnEveryMs
        : LOGIC_MIN_INTERVAL_MS;
      const turnSlice = Math.max(1, Math.floor(turnMs / 4));
      const timeoutDelay = Math.max(8, Math.min(LOGIC_MIN_INTERVAL_MS, turnSlice || LOGIC_MIN_INTERVAL_MS));
      tickLoopHandle = setTimeout(() => runTickLoop(), timeoutDelay);
    }
  }

  updateTimerAndCost();
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
    tile: Game.grid.tile,
    ox: Game.grid.ox,
    oy: Game.grid.oy,
    pad: Game.grid.pad,
    pixelW: Game.grid.pixelW,
    pixelH: Game.grid.pixelH,
    pixelArea: Game.grid.pixelArea,
  } : null;
  Game.grid = makeGrid(canvas, CFG.GRID_COLS, CFG.GRID_ROWS);
  if (ctx && Game.grid){
    const maxDprCfg = CFG.UI?.MAX_DPR;
    const maxDpr = Number.isFinite(maxDprCfg) && maxDprCfg > 0 ? maxDprCfg : 3;
    const view = winRef ?? (typeof window !== 'undefined' ? window : null);
    let viewDprRaw = 1;
    if (view && Number.isFinite(view.devicePixelRatio) && view.devicePixelRatio > 0){
      viewDprRaw = view.devicePixelRatio;
    }
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
    || prevGrid.tile !== g.tile
    || prevGrid.ox !== g.ox
    || prevGrid.oy !== g.oy
    || prevGrid.pad !== g.pad
    || prevGrid.pixelW !== g.pixelW
    || prevGrid.pixelH !== g.pixelH
    || prevGrid.pixelArea !== g.pixelArea;
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
  const camSignature = getCameraPresetSignature(CAM_PRESET);
  if (camSignature !== lastCamPresetSignature) {
    lastCamPresetSignature = camSignature;
    invalidateSceneCache();
  }
  const cache = ensureSceneCache({
    game: Game,
    canvas,
    documentRef: docRef,
    camPreset: CAM_PRESET
  });
  let gridDrawnViaScene = false;
  if (cache && cache.canvas){
    ctx.drawImage(cache.canvas, 0, 0, cache.pixelWidth, cache.pixelHeight, 0, 0, cache.cssWidth, cache.cssHeight);
    gridDrawnViaScene = !!cache.includesGrid;
  } else {
    const sceneCfg = CFG.SCENE || {};
    const themeKey = Game.sceneTheme || sceneCfg.CURRENT_THEME || sceneCfg.DEFAULT_THEME;
    const theme = (sceneCfg.THEMES && themeKey) ? sceneCfg.THEMES[themeKey] : null;
    if (Game.grid) {
      drawBattlefieldScene(ctx, Game.grid, theme);
      drawEnvironmentProps(ctx, Game.grid, CAM_PRESET, Game.backgroundKey);
      drawGridOblique(ctx, Game.grid, CAM_PRESET);
      gridDrawnViaScene = true;
    }
  }
  if (Game.grid){
    if (!gridDrawnViaScene) {
      drawGridOblique(ctx, Game.grid, CAM_PRESET);
    }
    drawQueuedOblique(ctx, Game.grid, Game.queued, CAM_PRESET);
    const tokens = Game.tokens || [];
    drawTokensOblique(ctx, Game.grid, tokens, CAM_PRESET);
  }
  const sessionVfx = ensureSessionWithVfx(Game, { requireGrid: true });
  if (sessionVfx){
    vfxDraw(ctx, sessionVfx, CAM_PRESET);
  }
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
  const mix = (c: number)=> Math.min(255, Math.round(c + (255 - c) * amount));
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
  const baseFill = typeof fillColor === 'string' ? fillColor : '#6ff0c0';
  if (!ctx || !Number.isFinite(innerHeight) || innerHeight <= 0){
    hpBarGradientCache.set(key, baseFill);
    return baseFill;
  }
  const startYSafe = Number.isFinite(startY) ? startY : 0;
  const gradient = ctx.createLinearGradient(x, startYSafe, x, startYSafe + innerHeight);
  if (!gradient){
    hpBarGradientCache.set(key, baseFill);
    return baseFill;
  }
  const topFill = lightenColor(baseFill, 0.25) ?? baseFill;
  gradient.addColorStop(0, topFill);
  gradient.addColorStop(1, baseFill);
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
    const layout = (art?.layout as UnitArtLayout | Record<string, unknown>) ?? {};
    const layoutRecord = layout as Record<string, unknown>;
    const r = Math.max(6, Math.floor(baseR * (p.scale || 1)));
    const widthRatio = parseFiniteNumber(layoutRecord.hpWidth) ?? 2.4;
    const heightRatio = parseFiniteNumber(layoutRecord.hpHeight) ?? 0.42;
    const offsetRatio = parseFiniteNumber(layoutRecord.hpOffset) ?? 1.46;
    const barWidth = Math.max(28, Math.floor(r * widthRatio));
    const barHeight = Math.max(5, Math.floor(r * heightRatio));
    const offset = offsetRatio;
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

function resolveTimerElement(): void {
  const doc = docRef ?? (typeof document !== 'undefined' ? document : null);
  const root = rootElement ?? null;
  if (!doc){
    timerElement = null;
    return;
  }
  const queryFromRoot = (selector: string): Element | null => {
    if (root && typeof (root as ParentNode).querySelector === 'function'){
      const el = (root as ParentNode).querySelector(selector);
      if (el) return el;
    }
    return null;
  };
  timerElement = (queryFromRoot('#timer') || doc.getElementById('timer')) as HTMLElement | null;
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
resolveTimerElement();
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
  timerElement = null;
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
  timerElement = null;
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

function startSession(config: StartConfigOverrides | null | undefined = {}): SessionState | null {
  configureRoot(rootElement);
  resolveTimerElement();
  const overrides = normalizeConfig(toStartConfigOverrides(config));
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
    const parsedCostCap = parseFiniteNumber(preset.costCap);
    if (parsedCostCap !== null) Game.ai.costCap = parsedCostCap;
    const parsedSummonLimit = parseFiniteNumber(preset.summonLimit);
    if (parsedSummonLimit !== null) Game.ai.summonLimit = parsedSummonLimit;
  }
  if (sceneChanged){
    invalidateSceneCache();
    scheduleDraw();
  }
}

function updateSessionConfig(next: StartConfigOverrides | null | undefined = {}): void {
  const normalized = normalizeConfig(toStartConfigOverrides(next));
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
      updateSessionConfig(next);
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
export { gameEvents, emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END, TURN_REGEN, BATTLE_END } from '../../events';
export { clearBackgroundSignatureCache, computeBackgroundSignature, __backgroundSignatureCache } from './session-state';