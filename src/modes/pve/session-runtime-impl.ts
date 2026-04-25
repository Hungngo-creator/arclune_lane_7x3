//home (termux)/arclune_lane_7x3/src/modes/pve/session-runtime-impl.ts

import { globalAetherPool } from '../../aether';
import { stepTurn, doActionOrSkip, predictSpawnCycle } from '../../turns';
import { enqueueImmediate, processActionChain } from '../../summon';
import { refillDeckEnemy, aiMaybeAct } from '../../ai';
import { Statuses, makeStatusEffect } from '../../statuses';
import { CFG, CAM } from '../../config';
import { UNITS } from '../../units';
import { Meta, makeInstanceStats, initialRageFor } from '../../meta';
import { pickTarget, dealAbilityDamage, healUnit, grantShield, applyDamage } from '../../combat';
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
  computeMeleeOffsets,
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
import { isUniqueGlobalSummonBlocked } from '../../utils/unique-global.ts';
import { nextRngValue } from '../../utils/rng.ts';
import { normalizeTagList } from '../../data/tags.ts';
import { dispatchGameplayTags } from '../../combat/tag-dispatch.ts';
import { isLeaderToken } from '../../combat/board-position-utils.ts';
import {
  normalizeConfig,
  createSession,
  invalidateSceneCache,
  ensureSceneCache,
  clearBackgroundSignatureCache,
  normalizeDeckEntries,
  getPreferredDeckInput,
  resolveEnemyUnits,
} from './session-state';
import { mapUnitProgressById } from './collection-mapper.ts';
import { runPveRuntimeUltHook } from './unit-runtime-hooks.ts';
import {
  ensureUyenState,
  getUyenUltChoice,
  grantUyenSummonRage,
  canCastLeaderUltChoice,
  isAnyLeaderUltReady,
  isUyenLeader,
  queueUyenUltCast,
} from '../../leader-uyen.ts';

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
  RuntimeUnitProgress,
  SummonSpec,
  SummonCreepSpec,
  SummonInheritSpec,
} from '@shared-types/pve';
import type { HudHandles, SummonBarHandles } from '@shared-types/ui';
import type { CameraPreset } from '@shared-types/config';
import type { NormalizedSessionConfig } from './session-state';
import type { SessionWithVfx, TokenMeleeOffsetMap } from '../../vfx';
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
  tags?: ReadonlyArray<string> | null;
  metadata?: { summon?: SummonSpec | null; tags?: ReadonlyArray<string> | null } | null;
  meta?: { summon?: SummonSpec | null; tags?: ReadonlyArray<string> | null } | null;
  summon?: SummonSpec | null;
}

const ULT_TAG_CACHE = new WeakMap<UltSpec, ReadonlyArray<string>>();

const getNormalizedUltTags = (ult: UltSpec): ReadonlyArray<string> => {
  const cached = ULT_TAG_CACHE.get(ult);
  if (cached) {
    return cached;
  }
  const rawUltTags = [
    ...(Array.isArray(ult.tags) ? ult.tags : []),
    ...(Array.isArray(ult.meta?.tags) ? ult.meta.tags : []),
    ...(Array.isArray(ult.metadata?.tags) ? ult.metadata.tags : []),
  ].filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0);
  const normalized = normalizeTagList(rawUltTags);
  ULT_TAG_CACHE.set(ult, normalized);
  return normalized;
};

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
const toPositiveOrNull = (value: unknown): number | null => {
  const parsed = parseFiniteNumber(value);
  if (parsed === null) return null;
  return parsed > 0 ? parsed : null;
};

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

const nextSessionRandom = (game: SessionState | null | undefined = Game): number => (
  nextRngValue(game?.rng)
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
  let normalized: DeckEntry[] | null = null;
  for (let index = 0; index < value.length; index += 1) {
    const entry = value[index];
    if (isDeckEntry(entry)) {
      if (normalized) normalized.push(entry);
      continue;
    }
    if (!normalized) {
      normalized = (value.slice(0, index) as DeckEntry[]);
    }
  }
  return normalized ?? (value as DeckEntry[]);
}

type LockedDeckCache = {
  deckRef: ReadonlyArray<DeckEntry>;
  ids: ReadonlySet<string>;
};

let lockedDeckCache: LockedDeckCache | null = null;
let lockedDeckNormalizeCache: {
  gameRef: SessionState;
  sourceRef: ReadonlyArray<unknown>;
  normalized: ReadonlyArray<DeckEntry>;
} | null = null;

const invalidateLockedDeckCache = (): void => {
  lockedDeckCache = null;
  lockedDeckNormalizeCache = null;u
};

const getLockedDeckIdSet = (lockedDeck: ReadonlyArray<DeckEntry>): ReadonlySet<string> => {
  if (lockedDeckCache?.deckRef === lockedDeck) {
    return lockedDeckCache.ids;
  }
  const ids = new Set<string>();
  for (let i = 0; i < lockedDeck.length; i += 1) {
    const entry = lockedDeck[i];
    if (!entry?.id) continue;
    ids.add(entry.id);
  }
  lockedDeckCache = {
    deckRef: lockedDeck,
    ids,
  };
  return ids;
};

function ensureDeck(): DeckEntry[] {
  const game = getInitializedGame();
  if (!game) return [];
  const deck = sanitizeDeckEntries(game.deck3);
  const lockedDeck = ensureLockedPlayerDeck();
  const lockedIds = getLockedDeckIdSet(lockedDeck);
  const filteredDeck: DeckEntry[] = [];
  let removed = false;
  for (let i = 0; i < deck.length; i += 1) {
    const entry = deck[i];
    if (!entry) {
      removed = true;
      continue;
    }
    if (!lockedIds.has(entry.id)) {
      removed = true;
      continue;
    }
    filteredDeck.push(entry);
  }
  if (removed || deck !== game.deck3) {
    game.deck3 = removed ? filteredDeck : deck;
  }
  return removed ? filteredDeck : deck;
}

function ensureLockedPlayerDeck(): ReadonlyArray<DeckEntry> {
  const game = getInitializedGame();
  if (!game) return [];
  const lockedSource = Array.isArray(game.playerDeckLocked) && game.playerDeckLocked.length
    ? game.playerDeckLocked
    : game.unitsAll;
    if (
    lockedDeckNormalizeCache
    && lockedDeckNormalizeCache.gameRef === game
    && lockedDeckNormalizeCache.sourceRef === lockedSource
  ) {
    return lockedDeckNormalizeCache.normalized;
  }
  const lockedDeck = sanitizeDeckEntries(lockedSource);
  if (lockedDeck !== game.playerDeckLocked) {
    game.playerDeckLocked = lockedDeck;
    invalidateLockedDeckCache();
  }
  lockedDeckNormalizeCache = {
    gameRef: game,
    sourceRef: lockedSource,
    normalized: lockedDeck,
  };
  return lockedDeck;
}

function isCardInLockedDeck(cardId: string, game: SessionState | null | undefined = Game): boolean {
  if (!game) return false;
  const lockedDeck = ensureLockedPlayerDeck();
  return getLockedDeckIdSet(lockedDeck).has(cardId);
}

const getCardCost = (card: DeckEntry | null | undefined): number => {
  if (!card) return 0;
  return parseFiniteNumber(card.cost) ?? 0;
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
const AETHER_DEBUG_FLAG = typeof window !== 'undefined'
  && (((window as unknown as { __ARCLUNE_DEBUG_AETHER?: boolean }).__ARCLUNE_DEBUG_AETHER) === true
    || new URLSearchParams(window.location.search).get('debugAether') === '1');

const aetherDebugState = {
  frames: 0,
  totalMs: 0,
  maxMs: 0,
  lastRectTop: Number.NaN,
  lastRectLeft: Number.NaN,
};

function emitAetherDebug(rect: DOMRect, elapsedMs: number): void {
  if (!AETHER_DEBUG_FLAG) return;
  aetherDebugState.frames += 1;
  aetherDebugState.totalMs += elapsedMs;
  aetherDebugState.maxMs = Math.max(aetherDebugState.maxMs, elapsedMs);

  if (aetherDebugState.frames < 60) return;
  const snapshot = globalAetherPool.debugSnapshot();
  const avgMs = aetherDebugState.totalMs / aetherDebugState.frames;
  const rectMoved = rect.top !== aetherDebugState.lastRectTop || rect.left !== aetherDebugState.lastRectLeft;

  console.debug('[aether-debug] frame-window', {
    frames: aetherDebugState.frames,
    avgMs: Number(avgMs.toFixed(3)),
    maxMs: Number(aetherDebugState.maxMs.toFixed(3)),
    rectMoved,
    rectTop: Number(rect.top.toFixed(2)),
    rectLeft: Number(rect.left.toFixed(2)),
    styleWrites: {
      ally: snapshot.ally.styleWrites,
      enemy: snapshot.enemy.styleWrites,
    },
    syncCalls: {
      ally: snapshot.ally.syncCalls,
      enemy: snapshot.enemy.syncCalls,
    },
  });

  aetherDebugState.frames = 0;
  aetherDebugState.totalMs = 0;
  aetherDebugState.maxMs = 0;
  aetherDebugState.lastRectTop = rect.top;
  aetherDebugState.lastRectLeft = rect.left;
  globalAetherPool.resetDebugSnapshot();
}
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
const cameraPresetSignatureCache = new WeakMap<object, string>();
const getCachedCameraPresetSignature = (preset: CameraPreset | null | undefined): string => {
  if (!preset || typeof preset !== 'object') return 'null';
  const key = preset as object;
  const cached = cameraPresetSignatureCache.get(key);
  if (cached) return cached;
  const signature = getCameraPresetSignature(preset);
  cameraPresetSignatureCache.set(key, signature);
  return signature;
};
let lastCamPresetSignature = getCachedCameraPresetSignature(CAM_PRESET);
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
let viewportResizeDebugState: {
  width: number;
  height: number;
  scale: number;
  offsetTop: number;
  offsetLeft: number;
} | null = null;
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
let leaderUltControlsEl: HTMLElement | null = null;
let leaderUltButtons: HTMLButtonElement[] = [];
let leaderUltControlsFingerprint: string | null = null;
let storedConfig: NormalizedSessionConfig = normalizeConfig();
let running = false;
let leaderEndCheckFlags: { ally: boolean; enemy: boolean } = { ally: false, enemy: false };
const hpBarGradientCache = new Map<string, GradientValue>();
const meleeOffsetTokenKeys = new Set<string>();
type StatusIconEntry = {
  statusId: string;
  statusName: string;
  tooltip: string;
  priority: number;
  stacks: number;
  turnsLeft: number | null;
  path: string;
  image: HTMLImageElement | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
};
type StatusIconHitbox = {
  x: number;
  y: number;
  size: number;
  tooltip: string;
};
type StatusMeta = {
  id: string;
  label: string;
  icon: string;
};
type StatusAggregate = {
  statusId: string;
  meta: StatusMeta;
  priority: number;
  stacks: number;
  turnsLeft: number | null;
};
type StatusAggregateCacheEntry = {
  signature: string;
  aggregates: StatusAggregate[];
};
const DEFAULT_STATUS_ICON_PATH = 'assets/weaken.svg';
type StatusIconId =
  | 'blind'
  | 'damageCut'
  | 'exalt'
  | 'weaken'
  | 'reflect'
  | 'haste'
  | 'silence'
  | 'pierce'
  | 'stun'
  | 'sleep'
  | 'taunt'
  | 'bleed'
  | 'fatigue'
  | 'daze'
  | 'fear'
  | 'shield'
  | 'stealth'
  | 'frenzy'
  | 'allure'
  | 'execute'
  | 'venom'
  | 'undying'
  | 'me_hoac'
  | 'loithienanh_spd_burn'
  | 'accuracy_down';

const STATUS_ICON_PATHS: Record<StatusIconId, string> = {
  blind: 'assets/blind.svg',
  damageCut: 'assets/damageCut.svg',
  exalt: 'assets/exalt.svg',
  weaken: 'assets/weaken.svg',
  reflect: 'assets/reflect.svg',
  haste: 'assets/haste.svg',
  silence: 'assets/silence.svg',
  pierce: 'assets/pierce.svg',
  stun: 'assets/silence.svg',
  sleep: 'assets/silence.svg',
  taunt: 'assets/silence.svg',
  bleed: 'assets/weaken.svg',
  fatigue: 'assets/weaken.svg',
  daze: 'assets/weaken.svg',
  fear: 'assets/silence.svg',
  shield: 'assets/reflect.svg',
  stealth: 'assets/haste.svg',
  frenzy: 'assets/exalt.svg',
  allure: 'assets/haste.svg',
  execute: 'assets/pierce.svg',
  venom: 'assets/pierce.svg',
  undying: 'assets/reflect.svg',
  me_hoac: 'assets/silence.svg',
  loithienanh_spd_burn: 'assets/weaken.svg',
  accuracy_down: 'assets/weaken.svg',
};
const ATTACK_EVENT_TYPES = new Set(['melee', 'tracer', 'lightning_arc', 'blood_pulse', 'ground_burst']);
const MAX_STATUS_ICONS_PER_TOKEN = 5;
const CONTROL_TAGS = new Set(['control', 'silence', 'taunt', 'stun', 'sleep', 'fear']);
const STATUS_META_BY_ID: Record<string, StatusMeta> = {
  blind: { id: 'blind', label: 'Blind', icon: STATUS_ICON_PATHS.blind },
  damageCut: { id: 'damageCut', label: 'Damage Cut', icon: STATUS_ICON_PATHS.damageCut },
  exalt: { id: 'exalt', label: 'Exalt', icon: STATUS_ICON_PATHS.exalt },
  weaken: { id: 'weaken', label: 'Weaken', icon: STATUS_ICON_PATHS.weaken },
  reflect: { id: 'reflect', label: 'Reflect', icon: STATUS_ICON_PATHS.reflect },
  haste: { id: 'haste', label: 'Haste', icon: STATUS_ICON_PATHS.haste },
  silence: { id: 'silence', label: 'Silence', icon: STATUS_ICON_PATHS.silence },
  pierce: { id: 'pierce', label: 'Pierce', icon: STATUS_ICON_PATHS.pierce },
  stun: { id: 'stun', label: 'Stun', icon: STATUS_ICON_PATHS.stun },
  sleep: { id: 'sleep', label: 'Sleep', icon: STATUS_ICON_PATHS.sleep },
  taunt: { id: 'taunt', label: 'Taunt', icon: STATUS_ICON_PATHS.taunt },
  bleed: { id: 'bleed', label: 'Bleed', icon: STATUS_ICON_PATHS.bleed },
  fatigue: { id: 'fatigue', label: 'Fatigue', icon: STATUS_ICON_PATHS.fatigue },
  daze: { id: 'daze', label: 'Daze', icon: STATUS_ICON_PATHS.daze },
  fear: { id: 'fear', label: 'Fear', icon: STATUS_ICON_PATHS.fear },
  shield: { id: 'shield', label: 'Shield', icon: STATUS_ICON_PATHS.shield },
  stealth: { id: 'stealth', label: 'Stealth', icon: STATUS_ICON_PATHS.stealth },
  frenzy: { id: 'frenzy', label: 'Frenzy', icon: STATUS_ICON_PATHS.frenzy },
  allure: { id: 'allure', label: 'Allure', icon: STATUS_ICON_PATHS.allure },
  execute: { id: 'execute', label: 'Execute', icon: STATUS_ICON_PATHS.execute },
  venom: { id: 'venom', label: 'Venom', icon: STATUS_ICON_PATHS.venom },
  undying: { id: 'undying', label: 'Undying', icon: STATUS_ICON_PATHS.undying },
  me_hoac: { id: 'me_hoac', label: 'Mê Hoặc', icon: STATUS_ICON_PATHS.me_hoac },
  loithienanh_spd_burn: { id: 'loithienanh_spd_burn', label: 'SPD Burn', icon: STATUS_ICON_PATHS.loithienanh_spd_burn },
  accuracy_down: { id: 'accuracy_down', label: 'Accuracy Down', icon: STATUS_ICON_PATHS.accuracy_down },
};
const STATUS_ID_ALIAS_TO_CANONICAL: Readonly<Record<string, string>> = Object.freeze({
  dmgCut: 'damageCut',
});
const STATUS_META_BY_TAG: Record<string, StatusMeta> = {
  control: { id: 'control', label: 'Control', icon: 'assets/silence.svg' },
  silence: { id: 'silence', label: 'Silence', icon: 'assets/silence.svg' },
  shield: { id: 'shield', label: 'Shield', icon: 'assets/reflect.svg' },
  mitigation: { id: 'mitigation', label: 'Mitigation', icon: 'assets/damageCut.svg' },
  output: { id: 'output', label: 'Output Down', icon: 'assets/weaken.svg' },
  stat: { id: 'stat', label: 'Stat', icon: 'assets/haste.svg' },
  penetration: { id: 'penetration', label: 'Penetration', icon: 'assets/pierce.svg' },
  dot: { id: 'dot', label: 'Damage over Time', icon: 'assets/weaken.svg' },
  counter: { id: 'counter', label: 'Counter', icon: 'assets/reflect.svg' },
};
const statusIconCache = new Map<string, StatusIconEntry>();
const statusAggregateCache = new WeakMap<ReadonlyArray<Record<string, unknown> | null | undefined>, StatusAggregateCacheEntry>();
const statusIconHitboxes: StatusIconHitbox[] = [];
let statusIconHoverTooltip = '';
let canvasMouseMoveHandler: ((event: MouseEvent) => void) | null = null;

type RequestAnimationFrameFn = (callback: FrameRequestCallback) => number;
type CancelAnimationFrameFn = (handle: number) => void;

const getRequestAnimationFrame = (): RequestAnimationFrameFn | null => {
  if (winRef && typeof winRef.requestAnimationFrame === 'function'){
    return winRef.requestAnimationFrame.bind(winRef);
  }
  return typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null;
};

const getCancelAnimationFrame = (): CancelAnimationFrameFn | null => {
  if (winRef && typeof winRef.cancelAnimationFrame === 'function'){
    return winRef.cancelAnimationFrame.bind(winRef);
  }
  return typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : null;
};

const makeMeleeTokenKey = (token: Partial<UnitToken> | null | undefined): string | null => {
  if (Number.isFinite(token?.iid)){
    return `iid:${token?.iid}`;
  }
  if (typeof token?.id === 'string' && token.id.length > 0){
    return `id:${token.id}`;
  }
  return null;
};

const syncMeleeOffsetTokens = (
  offsets: TokenMeleeOffsetMap | null | undefined,
): TokenMeleeOffsetMap | null => {
  meleeOffsetTokenKeys.clear();
  if (!offsets || !offsets.size) return null;
  for (const key of offsets.keys()){
    meleeOffsetTokenKeys.add(key);
  }
  return offsets;
};

let summonBarRenderPending = false;
const flushSummonBarRender = (): void => {
  summonBarRenderPending = false;
  const game = getInitializedGame();
  const bar = game?.ui?.bar ?? null;
  if (bar?.render) bar.render();
};

const renderSummonBar = (): void => {
  if (summonBarRenderPending) return;
  summonBarRenderPending = true;
  if (typeof queueMicrotask === 'function'){
    queueMicrotask(flushSummonBarRender);
    return;
  }
  Promise.resolve().then(flushSummonBarRender);
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
  applyCollectionSkinsToSession(Game);
  _IID = 1;
  _BORN = 1;
  CLOCK = createClock();
  invalidateSceneCache();
  meleeOffsetTokenKeys.clear();
  creepDeathHealProcessed.clear();
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

[TURN_START, TURN_END].forEach((eventType) => {
  try {
    addGameEventListener(eventType, () => {
      statusIconHitboxes.length = 0;
      statusIconHoverTooltip = '';
      if (canvas) canvas.title = '';
      scheduleDraw();
    });
  } catch (err) {
    console.error('[events] status icon refresh listener', err);
  }
});

const toAnimationFrameHandle = (handle: FrameHandle): number | null => (
  typeof handle === 'number' ? handle : null
);

let drawFrameHandle: FrameHandle | null = null;
let drawFrameUsesTimeout = false;
let drawPending = false;
let drawPaused = false;

function cancelScheduledDraw(): void {
  if (drawFrameHandle !== null){
    if (drawFrameUsesTimeout){
      clearTimeout(drawFrameHandle);
    } else {
      const cancel = getCancelAnimationFrame();
      const frameHandle = toAnimationFrameHandle(drawFrameHandle);
      if (typeof cancel === 'function' && frameHandle !== null){
        cancel(frameHandle);
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
  const raf = getRequestAnimationFrame();
  const runDrawFrame = (): void => {
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
  };
  if (raf){
    drawFrameUsesTimeout = false;
    drawFrameHandle = raf(runDrawFrame);
  } else {
    drawFrameUsesTimeout = true;
    drawFrameHandle = setTimeout(runDrawFrame, 16);
  }
}

function cancelScheduledResize(): void {
  if (resizeSchedulerHandle !== null){
    if (resizeSchedulerUsesTimeout){
      clearTimeout(resizeSchedulerHandle);
    } else {
      const cancel = getCancelAnimationFrame();
      const frameHandle = toAnimationFrameHandle(resizeSchedulerHandle);
      if (typeof cancel === 'function' && frameHandle !== null){
        cancel(frameHandle);
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
  const raf = getRequestAnimationFrame();
  if (raf){
    resizeSchedulerUsesTimeout = false;
    resizeSchedulerHandle = raf(flushScheduledResize);
  } else {
    resizeSchedulerUsesTimeout = true;
    resizeSchedulerHandle = setTimeout(flushScheduledResize, 32);
  }
}

function scheduleViewportResizeIfChanged(reason: 'resize' | 'scroll'): void {
  const viewport = winRef?.visualViewport;
  if (!viewport) {
    scheduleResize();
    return;
  }
  const nextState = {
    width: Number.isFinite(viewport.width) ? viewport.width : 0,
    height: Number.isFinite(viewport.height) ? viewport.height : 0,
    scale: Number.isFinite(viewport.scale) ? viewport.scale : 1,
    offsetTop: Number.isFinite(viewport.offsetTop) ? viewport.offsetTop : 0,
    offsetLeft: Number.isFinite(viewport.offsetLeft) ? viewport.offsetLeft : 0,
  };

  const prev = viewportResizeDebugState;
  viewportResizeDebugState = nextState;
  if (!prev) {
    scheduleResize();
    return;
  }

  const widthChanged = Math.abs(nextState.width - prev.width) >= 1;
  const heightChanged = Math.abs(nextState.height - prev.height) >= 1;
  const scaleChanged = Math.abs(nextState.scale - prev.scale) >= 0.01;
  const offsetChanged = Math.abs(nextState.offsetTop - prev.offsetTop) >= 1
    || Math.abs(nextState.offsetLeft - prev.offsetLeft) >= 1;

  if (AETHER_DEBUG_FLAG && reason === 'scroll' && (heightChanged || scaleChanged || offsetChanged)) {
    console.debug('[aether-debug][viewport-scroll]', {
      widthChanged,
      heightChanged,
      scaleChanged,
      offsetChanged,
      prev,
      next: nextState,
    });
  }

  if (widthChanged || heightChanged || scaleChanged || reason === 'resize') {
    scheduleResize();
    return;
  }

  const debugEnabled = !!(winRef && (winRef as unknown as { __ARC_DEBUG_VIEWPORT__?: boolean }).__ARC_DEBUG_VIEWPORT__);
  if (debugEnabled && reason === 'scroll' && typeof console !== 'undefined' && typeof console.debug === 'function'){
    console.debug('[pve][viewport-scroll] skip resize: size unchanged', {
      width: nextState.width,
      height: nextState.height,
      scale: nextState.scale,
      offsetTop: nextState.offsetTop,
      offsetLeft: nextState.offsetLeft,
    });
  }
}

const DEFAULT_TOKEN_COLOR = '#a9f58c';

function refreshQueuedArtFor(unitId: string): void {
  const updated = getUnitArt(unitId);
  const nextColor = updated?.palette?.primary ?? DEFAULT_TOKEN_COLOR;
  const apply = (map: Map<number, QueuedSummonRequest> | null | undefined): void => {
    if (!map || typeof map.values !== 'function') return;
    for (const pending of map.values()){
      if (!pending || pending.unitId !== unitId) continue;
      const pendingExt = pending as ExtendedQueuedSummon;
      if (pendingExt){
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

function applyCollectionSkinsToSession(game: SessionState | null | undefined = Game): void {
  if (!game) return;
  const progressById = game.runtime?.unitProgressById;
  if (!progressById || typeof progressById.forEach !== 'function') return;
  for (const [unitId, progress] of progressById.entries()){
    const skinKey = typeof progress?.skinKey === 'string' && progress.skinKey.trim()
      ? progress.skinKey.trim()
      : null;
    if (!skinKey) continue;
    setUnitSkinForSession(unitId, skinKey);
  }
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
const creepDeathHealProcessed = new Set<string>();
const CREEP_DEATH_HEAL_DEBUG_KEY = 'pve.creepDeathHeal';
const normalizedTagsByUnitId = new Map<string, string[]>();
const creepDeathHealPctByUnitId = new Map<string, number>();
const EMPTY_TAG_LIST: string[] = [];
const FALLBACK_CREEP_DEATH_HEAL_BY_ID: Readonly<Record<string, number>> = {
  creep_1: 0.03,
  creep_2: 0.04,
  creep_3: 0.05,
};

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

const readTokenTags = (token: UnitToken | null | undefined): string[] => {
  if (!token) return EMPTY_TAG_LIST;
  if (typeof token.id === 'string' && token.id) {
    const cached = normalizedTagsByUnitId.get(token.id);
    if (cached) return cached;
  }

  const directTagsRaw = Array.isArray(token.tags) ? token.tags : EMPTY_TAG_LIST;
  const directTags: string[] = [];
  for (const tag of directTagsRaw) {
    if (typeof tag === 'string') {
      directTags.push(tag);
    }
  }

  const metaTagsRaw = getMetaById(token.id)?.tags;
  const metaTags: string[] = [];
  if (Array.isArray(metaTagsRaw)) {
    for (const tag of metaTagsRaw) {
      if (typeof tag === 'string') {
        metaTags.push(tag);
      }
    }
  }

  if (directTags.length === 0 && metaTags.length === 0) {
    return EMPTY_TAG_LIST;
  }

  const merged = directTags.length === 0
    ? metaTags
    : metaTags.length === 0
      ? directTags
      : [...directTags, ...metaTags];
  const normalized = normalizeTagList(merged);
  if (typeof token.id === 'string' && token.id) {
    normalizedTagsByUnitId.set(token.id, normalized);
  }
  return normalized;
};

const isCreepGroupToken = (token: UnitToken | null | undefined): boolean => {
  const tags = readTokenTags(token);
  if (tags.includes('creep')) return true;
  return tags.includes('npc') && tags.includes('pve');
};

const resolveCreepDeathHealPct = (token: UnitToken | null | undefined): number => {
  if (!token) return 0;
  if (typeof token.id === 'string' && token.id) {
    const cached = creepDeathHealPctByUnitId.get(token.id);
    if (cached != null) return cached;
  }
  const passives = getMetaById(token.id)?.kit?.passives;
  if (Array.isArray(passives)){
    for (const passive of passives){
      if (!passive || typeof passive !== 'object') continue;
      const whenRaw = (passive as { when?: unknown }).when;
      const when = typeof whenRaw === 'string' ? whenRaw.trim().toLowerCase() : '';
      if (when !== 'ondeath') continue;
      const params = (passive as { params?: Record<string, unknown> }).params;
      const mode = typeof params?.mode === 'string' ? params.mode.trim().toLowerCase() : '';
      if (mode && mode !== 'castermax') continue;
      const amount = parseFiniteNumber(params?.amount);
      if (amount && amount > 0) {
        const resolved = Math.max(0, Math.min(1, amount));
        if (typeof token.id === 'string' && token.id) {
          creepDeathHealPctByUnitId.set(token.id, resolved);
        }
        return resolved;
      }
    }
  }
  const fallback = FALLBACK_CREEP_DEATH_HEAL_BY_ID[token.id] ?? 0;
  if (typeof token.id === 'string' && token.id) {
    creepDeathHealPctByUnitId.set(token.id, fallback);
  }
  return fallback;
};

function maybePruneCreepDeathHealProcessed(tokens: ReadonlyArray<UnitToken>): void {
  if (creepDeathHealProcessed.size < 2048) return;
  const aliveDeadKeys = new Set<string>();
  for (const token of tokens) {
    if (!token || token.alive) continue;
    const deadAt = parseFiniteNumber(token.deadAt);
    if (!deadAt || deadAt <= 0) continue;
    aliveDeadKeys.add(`${token.iid ?? token.id}:${deadAt}`);
  }
  if (!aliveDeadKeys.size) {
    creepDeathHealProcessed.clear();
    return;
  }
  for (const key of creepDeathHealProcessed) {
    if (!aliveDeadKeys.has(key)) {
      creepDeathHealProcessed.delete(key);
    }
  }
}

function processCreepDeathHealing(now: number): void {
  if (!Game?.tokens?.length) return;
  const tokens = Game.tokens;
  maybePruneCreepDeathHealProcessed(tokens);
  const passiveLog = Array.isArray(Game.passiveLog) ? Game.passiveLog : [];
  if (!Array.isArray(Game.passiveLog)) Game.passiveLog = passiveLog;
  const creepAlliesBySide = new Map<Side, UnitToken[]>();
  const getCreepAlliesBySide = (side: Side): UnitToken[] => {
    const cached = creepAlliesBySide.get(side);
    if (cached) return cached;
    const allies: UnitToken[] = [];
    for (const token of tokens) {
      if (!token || !token.alive) continue;
      if (token.side !== side) continue;
      if (!isCreepGroupToken(token)) continue;
      allies.push(token);
    }
    creepAlliesBySide.set(side, allies);
    return allies;
  };

  for (const deadToken of tokens){
    if (!deadToken || deadToken.alive) continue;
    if (!isCreepGroupToken(deadToken)) continue;
    const deadAt = parseFiniteNumber(deadToken.deadAt);
    if (!deadAt || deadAt <= 0) continue;
    const deathKey = `${deadToken.iid ?? deadToken.id}:${deadAt}`;
    if (creepDeathHealProcessed.has(deathKey)) continue;
    creepDeathHealProcessed.add(deathKey);

    const healPct = resolveCreepDeathHealPct(deadToken);
    const deadHpMax = Math.max(0, Math.round(parseFiniteNumber(deadToken.hpMax) ?? 0));
    const healAmount = Math.max(0, Math.round(deadHpMax * healPct));
    if (healAmount <= 0) continue;

    let healedTargets = 0;
    for (const ally of getCreepAlliesBySide(deadToken.side)){
      const hpMax = Math.max(0, Math.round(parseFiniteNumber(ally.hpMax) ?? 0));
      if (hpMax <= 0) continue;
      const before = Math.max(0, Math.round(parseFiniteNumber(ally.hp) ?? 0));
      if (before >= hpMax) continue;
      healUnit(ally, healAmount);
      const after = Math.max(0, Math.round(parseFiniteNumber(ally.hp) ?? 0));
      if (after > before) healedTargets += 1;
    }

    passiveLog.push({
      key: CREEP_DEATH_HEAL_DEBUG_KEY,
      type: CREEP_DEATH_HEAL_DEBUG_KEY,
      timestamp: now,
      sourceIid: deadToken.iid ?? null,
      sourceId: deadToken.id,
      side: deadToken.side,
      healPct,
      healAmount,
      healedTargets,
      deadAt,
    });

    if (CFG?.DEBUG?.LOG_EVENTS && typeof console !== 'undefined' && typeof console.debug === 'function'){
      console.debug(`[${CREEP_DEATH_HEAL_DEBUG_KEY}]`, {
        sourceId: deadToken.id,
        sourceIid: deadToken.iid ?? null,
        side: deadToken.side,
        healPct,
        healAmount,
        healedTargets,
      });
    }
  }
}

// Xác chết chờ vanish (để sau này thay bằng dead-animation)
const DEATH_VANISH_MS = 900;
function cleanupDead(now: number): void {
  if (!Game?.tokens) return;
  const tokens = Game.tokens;
  let write = 0;
  for (let read = 0; read < tokens.length; read += 1) {
    const token = tokens[read];
    if (!token) continue;
    if (token.alive) {
      if (write !== read) tokens[write] = token;
      write += 1;
      continue;
    }
    const deadAt = parseFiniteNumber(token.deadAt) ?? 0;
    if (!deadAt || now - deadAt < DEATH_VANISH_MS) {
      if (write !== read) tokens[write] = token;
      write += 1;
    }
    // else: bỏ hẳn khỏi mảng -> không vẽ, không chặn ô
  }
  if (write < tokens.length) tokens.length = write;
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

function countAliveMinionsOf(masterIid: number): number {
  const tokens = Game?.tokens;
  if (!tokens?.length) return 0;
  let count = 0;
  for (const token of tokens){
    if (!token?.alive || !token.isMinion || token.ownerIid !== masterIid) continue;
    count += 1;
  }
  return count;
}
function removeOldestMinions(masterIid: number, count: number): void {
  if (count <= 0) return;
  const tokens = Game?.tokens;
  if (!tokens) return;

  const limit = Math.max(1, Math.floor(count));
  const selected: UnitToken[] = [];
  const bornOf = (token: UnitToken): number => token.bornSerial || 0;

  for (const token of tokens) {
    if (!token?.alive || !token.isMinion || token.ownerIid !== masterIid) continue;
    if (selected.length < limit) {
      selected.push(token);
      continue;
    }

    let newestIndex = 0;
    for (let index = 1; index < selected.length; index += 1) {
      if (bornOf(selected[index]) > bornOf(selected[newestIndex])) newestIndex = index;
    }
    if (bornOf(token) < bornOf(selected[newestIndex])) {
      selected[newestIndex] = token;
    }
  }

  if (!selected.length) return;
  const removal = new Set<UnitToken>(selected);

  let write = 0;
  for (let read = 0; read < tokens.length; read += 1) {
    const token = tokens[read];
    if (!token || !removal.has(token)) {
      if (token) {
        if (write !== read) tokens[write] = token;
        write += 1;
      }
      continue;
    }
    token.alive = false;
  }
  if (write < tokens.length) tokens.length = write;
 }
function extendBusy(duration: number): void {
  const game = getInitializedGame();
  if (!game || !game.turn) return;
  const now = getNow();
  const dur = Math.max(0, duration|0);
  game.turn.busyUntil = mergeBusyUntil(game.turn.busyUntil, now, dur);
}

function performUyenLeaderUlt(game: SessionState, unit: UnitToken): boolean {
  const state = ensureUyenState(unit);
  if (!state) return false;
  const furyNow = Math.max(0, Math.floor(parseFiniteNumber(unit.fury) ?? 0));
  const choice = getUyenUltChoice(unit);

  if (choice === 'A') {
    if (furyNow < 100) return false;
    spendFury(unit, 100);
    const candidates: Array<'A1' | 'A2' | 'A3'> = [];
    if (state.a1Stacks < 10) candidates.push('A1');
    candidates.push('A2');
    if (state.a3Stacks < 3) candidates.push('A3');
    const roll = candidates[Math.floor(nextSessionRandom(game) * Math.max(1, candidates.length))] ?? 'A2';
    if (roll === 'A1') {
      state.a1Stacks += 1;
    } else if (roll === 'A2') {
      const allies = (game.tokens || []).filter((token) => token.alive && token.side === unit.side);
      for (const ally of allies) {
        const haste = makeStatusEffect('haste', { pct: 0.25, turns: 3 });
        if (haste) Statuses.add(ally, { ...haste, sourceUnitId: unit.id });
      }
    } else {
      state.a3Stacks += 1;
      unit.hpMax = Math.max(1, Math.round((parseFiniteNumber(unit.hpMax) ?? 1) * 1.1));
      unit.hp = Math.min(unit.hpMax, Math.round((parseFiniteNumber(unit.hp) ?? 0) * 1.1));
    }
    return true;
  }

  if (choice === 'B') {
    if (state.bUses >= 10 || furyNow <= 0) return false;
    const cost = Math.max(1, Math.floor(furyNow * 0.4));
    spendFury(unit, cost);
    unit.furyMax = Math.max(1, Math.round((parseFiniteNumber(unit.furyMax) ?? 100) * 1.3));
    unit.rage = unit.fury;
    healUnit(unit, Math.round((parseFiniteNumber(unit.hpMax) ?? 0) * 0.05));
    state.bUses += 1;
    if (state.bUses === 3 || state.bUses === 6 || state.bUses === 10) {
      unit.hpMax = Math.max(1, Math.round((parseFiniteNumber(unit.hpMax) ?? 1) * 1.05));
      unit.hp = Math.min(unit.hpMax, parseFiniteNumber(unit.hp) ?? unit.hpMax);
    }
    return true;
  }

  if (furyNow < 100) return false;
  spendFury(unit, 100);
  const enemySide = unit.side === 'ally' ? 'enemy' : 'ally';
  const enemies = (game.tokens || []).filter((token) => token.alive && token.side === enemySide);
  const bonus = Math.min(state.bUses * 0.05, 0.35);
  for (const enemy of enemies) {
    const hpBase = 0.5 * (parseFiniteNumber(unit.hpMax) ?? 0);
    const hpComp = isUyenLeader(enemy) ? Math.min(hpBase, 0.1 * (parseFiniteNumber(unit.hpMax) ?? 0)) : hpBase;
    const base = hpComp + 0.6 * (parseFiniteNumber(unit.atk) ?? 0) + 0.6 * (parseFiniteNumber(unit.wil) ?? 0);
    const scaled = Math.max(1, Math.round(base * (1 + bonus)));
    dealAbilityDamage(game, unit, enemy, {
      base: Math.round(scaled * 0.5),
      dtype: 'physical',
      attackType: 'skill',
      defPen: 0.1,
    });
    dealAbilityDamage(game, unit, enemy, {
      base: Math.round(scaled * 0.5),
      dtype: 'arcane',
      attackType: 'skill',
      defPen: 0.1,
    });
  }
  return true;
}

function taxiDistance(from: Pick<UnitToken, 'cx' | 'cy'>, to: Pick<UnitToken, 'cx' | 'cy'>): number {
  return Math.abs(from.cx - to.cx) + Math.abs(from.cy - to.cy);
}

function pickNearestAliveUnits(
  candidates: readonly UnitToken[],
  origin: Pick<UnitToken, 'cx' | 'cy'>,
  take: number,
  exclude?: ReadonlySet<UnitToken>,
): UnitToken[] {
  if (!Array.isArray(candidates) || candidates.length <= 0 || take <= 0) return [];
  const limit = Math.max(0, Math.floor(take));
  if (limit <= 0) return [];

  const selected: UnitToken[] = [];
  const selectedDistance: number[] = [];

  for (const candidate of candidates) {
    if (!candidate?.alive) continue;
    if (exclude?.has(candidate)) continue;
    const distance = taxiDistance(origin, candidate);
    const worstDistance = selectedDistance.length > 0
      ? selectedDistance[selectedDistance.length - 1] ?? Number.POSITIVE_INFINITY
      : Number.POSITIVE_INFINITY;
    if (selected.length >= limit && distance >= worstDistance) continue;

    let insertAt = selectedDistance.length;
    while (insertAt > 0 && distance < (selectedDistance[insertAt - 1] ?? Number.POSITIVE_INFINITY)) {
      insertAt -= 1;
    }
    selected.splice(insertAt, 0, candidate);
    selectedDistance.splice(insertAt, 0, distance);

    if (selected.length > limit) {
      selected.pop();
      selectedDistance.pop();
    }
  }

  return selected;
}

// Thực thi Ult: Summoner -> Immediate Summon theo meta; class khác: trừ nộ
function performUlt(unit: UnitToken): void {
  const game = getInitializedGame();
  if (!game){
    setFury(unit, 0);
    return;
  }

  if (isUyenLeader(unit)) {
    const casted = performUyenLeaderUlt(game, unit);
    if (casted) {
      extendBusy(900);
    }
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
    const allTokens = game.tokens || [];
    const queued = game.queued || { ally: new Map(), enemy: new Map() };
    const slotsSource = summonSpec as Parameters<typeof resolveSummonSlots>[0];
    const resolvedSlots = resolveSummonSlots(slotsSource, slot);
    const patternSlots: number[] = [];
    for (const rawSlot of resolvedSlots){
      if (typeof rawSlot !== 'number' || !Number.isFinite(rawSlot)) continue;
      const { cx, cy } = slotToCell(unit.side, rawSlot);
      if (cellReserved(allTokens, queued, cx, cy)) continue;
      patternSlots.push(rawSlot);
    }
    patternSlots.sort((a, b) => a - b);

    const desired = parseFiniteNumber(summonSpec.count) ?? (patternSlots.length || 1);
    const need = Math.min(patternSlots.length, Math.max(0, desired));

    if (need > 0){
      const limit = parseFiniteNumber(summonSpec.limit) ?? Infinity;
      const have = countAliveMinionsOf(unit.iid);
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
  if (runPveRuntimeUltHook({
    game,
    unit,
    ultSkill: u,
    extendBusy,
  })) {
    return;
  }
  const normalizedUltTags = getNormalizedUltTags(u);
  dispatchGameplayTags(normalizedUltTags, {
    game,
    attacker: unit,
    target: pickTarget(game, unit),
    cost: resolveUltCost(unit, CFG),
    side: unit.side,
    payload: u,
  });
  
  const allTokens = game.tokens || [];
  let aliveTokenCache: UnitToken[] | null = null;
  const aliveBySideCache = new Map<Side, UnitToken[]>();
  const getAliveTokens = (): UnitToken[] => {
    if (aliveTokenCache) return aliveTokenCache;
    aliveTokenCache = allTokens.filter((token) => token.alive);
    return aliveTokenCache;
  };
  const getAliveBySide = (side: Side): UnitToken[] => {
    const cached = aliveBySideCache.get(side);
    if (cached) return cached;
    const filtered = getAliveTokens().filter((token) => token.side === side);
    aliveBySideCache.set(side, filtered);
    return filtered;
  };

  let busyMs = 900;

  switch(u.type){
    case 'drain': {
      const foes = getAliveBySide(foeSide);
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

      const foes = getAliveBySide(foeSide);

      const hits = getUltHitCount(u);
      const selected: UnitToken[] = [];
      const selectedSet = new Set<UnitToken>();
      if (foes.length){
        const primary = pickTarget(game, unit);
        if (primary){
          selected.push(primary);
          selectedSet.add(primary);
        }
        const nearestPool = pickNearestAliveUnits(foes, unit, Math.max(0, hits - selected.length), selectedSet);
        for (const enemy of nearestPool){
          if (selected.length >= hits) break;
          selected.push(enemy);
          selectedSet.add(enemy);
        }
        if (selected.length > hits) selected.length = hits;
        if (!selected.length && foes.length){
          selected.push(foes[0]);
        }
      }
      const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });

      const applyBusyFromVfx = (startedAt: number, duration: number | null | undefined): void => {
        if (!Number.isFinite(startedAt) || !Number.isFinite(duration)) return;
        const resolved = duration as number;
        busyMs = Math.max(busyMs, resolved);
        if (game.turn){
          game.turn.busyUntil = mergeBusyUntil(game.turn.busyUntil, startedAt, resolved);
        }
      };

      const bindingKey = 'huyet_hon_loi_quyet';

      const runBurstVfx = (
        effect: (session: SessionWithVfx) => number | null | undefined,
      ): void => {
        if (!sessionVfx) return;
        const startedAt = getNow();
        try {
          const dur = effect(sessionVfx);
          applyBusyFromVfx(startedAt, dur);
        } catch (_) {}
      };

      runBurstVfx((session) => vfxAddBloodPulse(session, unit, {
        bindingKey,
        timing: 'charge_up'
      }));

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

        runBurstVfx((session) => vfxAddLightningArc(session, unit, tgt, {
          bindingKey,
          timing: 'burst_core',
          targetBindingKey: bindingKey,
          targetTiming: 'burst_core'
        }));

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
              tick: 'turn',
              sourceUnitId: unit.id,
            });
          }
          if (typeof tgt._recalcStats === 'function') tgt._recalcStats();
        }
      }

       runBurstVfx((session) => vfxAddGroundBurst(session, unit, {
        bindingKey,
        anchorId: 'right_foot',
        timing: 'ground_crack'
      }));

      runBurstVfx((session) => vfxAddGroundBurst(session, unit, {
        bindingKey,
        anchorId: 'left_foot',
        timing: 'ground_crack'
      }));

      runBurstVfx((session) => vfxAddShieldWrap(session, unit, {
        bindingKey,
        anchorId: 'root',
        timing: 'burst_core'
      }));

      const reduceDmg = parseFiniteNumber(u.reduceDmg);
      if (reduceDmg && reduceDmg > 0){
        const turns = getUltDurationTurns(u, parseFiniteNumber(u.turns) ?? 1);
        const damageCut = makeStatusEffect('damageCut', { pct: reduceDmg, turns });
        if (damageCut) {
          Statuses.add(unit, { ...damageCut, sourceUnitId: unit.id });
        }
      }

      busyMs = Math.max(busyMs, 1600);
      break;
    }

    case 'strikeLaneMid': {
      const primary = pickTarget(game, unit);
      if (!primary) break;
      const laneX = primary.cx;
      const aliveNow = getAliveTokens();
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
          Statuses.add(unit, { ...damageCut, sourceUnitId: unit.id });
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
      const foes = getAliveBySide(foeSide);
      if (!foes.length) break;
      const take = Math.max(1, Math.min(foes.length, getUltTargetCount(u, foes.length)));
      const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
      const nearestTargets = pickNearestAliveUnits(foes, unit, take);
      for (let i=0; i<nearestTargets.length; i++){
        const tgt = nearestTargets[i];
        if (!tgt) continue;
        const turns = getUltDurationTurns(u, parseFiniteNumber(u.turns) ?? 1);
        const sleep = makeStatusEffect('sleep', { turns });
        if (sleep) {
          Statuses.add(tgt, { ...sleep, sourceUnitId: unit.id });
        }
        if (sessionVfx) {
          try { vfxAddHit(sessionVfx, tgt); } catch(_){}
        }
      }
      busyMs = 1000;
      break;
    }

    case 'revive': {
      const fallen = allTokens.filter(t => t.side === unit.side && !t.alive);
      if (!fallen.length) break;
      fallen.sort((a,b)=> (b.deadAt||0) - (a.deadAt||0));
      const take = Math.max(1, Math.min(fallen.length, getUltTargetCount(u, 1)));
      const allies = getAliveBySide(unit.side);
      const sideLeader = allies.find((token) => isUyenLeader(token));
      const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
      for (let i=0; i<take; i++){
        const ally = fallen[i];
        if (!ally) continue;
        if (ally.id !== unit.id && readTokenTags(ally).includes('divine-nature')) continue;
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
            Statuses.add(ally, { ...silence, sourceUnitId: unit.id });
          }
        }
        if (sessionVfx) {
          try { vfxAddSpawn(sessionVfx, ally.cx, ally.cy, ally.side); } catch(_){}
        }
        grantUyenSummonRage(sideLeader, { revived: true, isMinion: !!ally.isMinion });
      }
      busyMs = 1500;
      break;
    }

    case 'equalizeHP': {
      let allies = getAliveBySide(unit.side);
      if (!allies.length) break;
      const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
      allies.sort((a,b)=>{
        const ra = (a.hpMax || 1) ? (a.hp || 0) / a.hpMax : 0;
        const rb = (b.hpMax || 1) ? (b.hp || 0) / b.hpMax : 0;
        return ra - rb;
      });
      const count = Math.max(1, Math.min(allies.length, getUltAlliesCount(u, allies.length)));
      const selected = allies.slice(0, count);
      if (u.healLeader){
        const leaderId = unit.side === 'ally' ? 'leaderA' : 'leaderB';
        const leader = allies.find(t => t.id === leaderId);
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
          if (sessionVfx) {
            try { vfxAddHit(sessionVfx, tgt); } catch(_){ }
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
      const allies = getAliveBySide(unit.side);
      const others = allies.filter(t => t !== unit);
      const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
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
          Statuses.add(tgt, { ...haste, sourceUnitId: unit.id });
        }
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

function resolveBattlefieldSnapshot(
  game: SessionState | CombatSessionState,
): {
  leaderA: UnitToken | null;
  leaderB: UnitToken | null;
  bossAlive: boolean;
} {
  const tokens = Array.isArray(game.tokens) ? game.tokens : [];
  let leaderA: UnitToken | null = null;
  let leaderB: UnitToken | null = null;
  let bossAlive = false;

  for (const token of tokens) {
    if (!token) continue;

    if (!leaderA && (token.id === 'leaderA' || slotIndex('ally', token.cx, token.cy) === 8)) {
      leaderA = token;
    }
    if (!leaderB && (token.id === 'leaderB' || slotIndex('enemy', token.cx, token.cy) === 8)) {
      leaderB = token;
    }
    if (!bossAlive && token.alive && token.side === 'enemy' && isBossToken(game, token)) {
      bossAlive = true;
    }

    if (leaderA && leaderB && bossAlive) break;
  }

  return { leaderA, leaderB, bossAlive };
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

  const { leaderA, leaderB, bossAlive } = resolveBattlefieldSnapshot(game);
  const leaderAAlive = isUnitAlive(leaderA);
  const leaderBAlive = isUnitAlive(leaderB);

  const contextDetail: Record<string, unknown> =
    context && typeof context === 'object' ? { ...context } : {};
  const triggerValue = contextDetail['trigger'];
  const trigger = typeof triggerValue === 'string' ? triggerValue : null;
  const leaderAHpRatio = getHpRatio(leaderA);
  const leaderBHpRatio = getHpRatio(leaderB);
  const threshold = 0.3;
  const shouldCheckAlly = !leaderAAlive || leaderAHpRatio <= threshold;
  const shouldCheckEnemy = !leaderBAlive || leaderBHpRatio <= threshold;
  leaderEndCheckFlags = {
    ally: shouldCheckAlly,
    enemy: shouldCheckEnemy,
  };
  contextDetail['leaderCheckFlags'] = { ...leaderEndCheckFlags };

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

function finalizeBattleIfLeaderDown(game: (SessionState | CombatSessionState) | null, trigger: string, timestamp: number): boolean {
  const result = checkBattleEndResult(game, { trigger, timestamp });
  return Boolean(result);
}
// Giảm TTL minion của 1 phe sau khi phe đó kết thúc phase
function tickMinionTTL(side: Side): void {
  if (!Game?.tokens) return;
  const tokens = Game.tokens;
  let writeIndex = 0;
  for (const t of tokens){
    if (!t) continue;
    let shouldRemove = false;
    if (!t.alive) continue;
   if (t.side === side && t.isMinion) {
      const ttl = t.ttlTurns;
      if (typeof ttl === 'number' && Number.isFinite(ttl)) {
        const nextTtl = ttl - 1;
        t.ttlTurns = nextTtl;
        if (nextTtl <= 0) {
          t.alive = false;
          shouldRemove = true;
        }
      }
    }
    if (!shouldRemove) {
      tokens[writeIndex] = t;
      writeIndex += 1;
    }
  }
  if (writeIndex < tokens.length) {
    tokens.length = writeIndex;
  }
}

function resolveAllyLeaderForControl(): UnitToken | null {
  if (!Game || !Array.isArray(Game.tokens)) return null;
  const alive = Game.tokens.find((token) => token.alive && token.side === 'ally' && isUyenLeader(token));
  if (alive) return alive;
  return Game.tokens.find((token) => token.side === 'ally' && isUyenLeader(token)) ?? null;
}

function syncLeaderUltControls(): void {
  if (!leaderUltControlsEl) return;
  const leader = resolveAllyLeaderForControl();
  const show = Boolean(leader && leader.alive && isAnyLeaderUltReady(leader));

  if (!show || !leader) {
    const hiddenFingerprint = 'hidden';
    if (leaderUltControlsFingerprint === hiddenFingerprint) return;
    leaderUltControlsEl.hidden = true;
    for (const button of leaderUltButtons){
      if (!button) continue;
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
      button.classList.remove('is-selected');
    }
    leaderUltControlsFingerprint = hiddenFingerprint;
    return;
  }

  const selected = getUyenUltChoice(leader);
  const readyA = canCastLeaderUltChoice(leader, 'A');
  const readyB = canCastLeaderUltChoice(leader, 'B');
  const readyC = canCastLeaderUltChoice(leader, 'C');
  const state = ensureUyenState(leader);
  const fury = Math.max(0, Math.floor(parseFiniteNumber(leader.fury) ?? 0));
  const furyMax = Math.max(1, Math.floor(parseFiniteNumber(leader.furyMax) ?? 100));
  const bUses = state?.bUses ?? 0;
  const fingerprint = [
    leader.iid ?? 0,
    fury,
    furyMax,
    bUses,
    selected,
    readyA ? 1 : 0,
    readyB ? 1 : 0,
    readyC ? 1 : 0,
    leaderUltButtons.length,
  ].join('|');
  if (leaderUltControlsFingerprint === fingerprint) return;

  leaderUltControlsEl.hidden = false;
  for (const button of leaderUltButtons){
    if (!button) continue;
    const choice = button.dataset.ultChoice;
    const ready = choice === 'A'
      ? readyA
      : (choice === 'B'
        ? readyB
        : (choice === 'C' ? readyC : false));
    button.classList.toggle('is-selected', choice === selected);
    button.disabled = !ready;
    button.setAttribute('aria-disabled', ready ? 'false' : 'true');
  }
  leaderUltControlsFingerprint = fingerprint;
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

  const controlsFromRoot = (root && typeof (root as ParentNode).querySelector === 'function')
    ? (root as ParentNode).querySelector('[data-role="leader-ult-controls"]')
    : null;
  const controlsFromDocument = typeof doc.querySelector === 'function'
    ? doc.querySelector('[data-role="leader-ult-controls"]')
    : null;
  leaderUltControlsEl = (controlsFromRoot ?? controlsFromDocument) as HTMLElement | null;
  leaderUltControlsFingerprint = null;
  leaderUltButtons = leaderUltControlsEl
    ? Array.from(leaderUltControlsEl.querySelectorAll<HTMLButtonElement>('button[data-ult-choice]'))
    : [];
  for (const button of leaderUltButtons){
    button.onclick = () => {
      const choice = button.dataset.ultChoice;
      if (choice !== 'A' && choice !== 'B' && choice !== 'C') return;
      const leader = resolveAllyLeaderForControl();
      if (!leader || !leader.alive || !canCastLeaderUltChoice(leader, choice)) return;
      queueUyenUltCast(leader, choice);
      syncLeaderUltControls();
    };
  }
  syncLeaderUltControls();
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
  if (Game.tokens) { globalAetherPool.init(Game.tokens);
  }

  if (hud && Game) hud.update(Game);
  scheduleDraw();
  leaderEndCheckFlags = { ally: false, enemy: false };
  Game._inited = true;

  refillDeck();
  refillDeckEnemy(Game);

  cleanupSummonBar();
  const barHandle = startSummonBar(doc, {
    onPick: (card): void => {
      const game = getInitializedGame();
      if (!game) return;
      const entry = asDeckEntry(card);
      if (!isCardInLockedDeck(entry.id, game)) return;
      game.selectedId = entry.id;
      renderSummonBar();
    },
    canAfford: (card): boolean => {
      const game = getInitializedGame();
      if (!game) return false;
      const entry = asDeckEntry(card);
      if (isUniqueGlobalSummonBlocked(game, { unitId: entry.id, tags: entry.tags ?? null })) return false;
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
  if (canvasMouseMoveHandler && canvas){
    canvas.removeEventListener('mousemove', canvasMouseMoveHandler);
    canvasMouseMoveHandler = null;
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
    if (!isCardInLockedDeck(card.id, game)) return;
    if (isUniqueGlobalSummonBlocked(game, { unitId: card.id, tags: card.tags ?? null })) return;

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
  canvasMouseMoveHandler = (ev: MouseEvent): void => {
    updateStatusIconHoverTooltip(ev.clientX, ev.clientY);
  };
  if (canvas && canvasMouseMoveHandler){
    canvas.addEventListener('mousemove', canvasMouseMoveHandler);
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
    visualViewportResizeHandler = (): void => { scheduleViewportResizeIfChanged('resize'); };
    viewport.addEventListener('resize', visualViewportResizeHandler);

    if (visualViewportScrollHandler && typeof viewport.removeEventListener === 'function'){
      viewport.removeEventListener('scroll', visualViewportScrollHandler);
    }
    visualViewportScrollHandler = (): void => { scheduleViewportResizeIfChanged('scroll'); };
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
      syncLeaderUltControls();

      CLOCK.lastLogicMs = sessionNowMs;

      if (Game.battle?.over) return;
      if (finalizeBattleIfLeaderDown(Game, 'leader-immediate', sessionNowMs)) {
        return;
      }

      let turnState = Game.turn ?? null;
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

      let readyByBusy = sessionNowMs >= busyUntil;
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
          if (finalizeBattleIfLeaderDown(Game, 'leader-immediate', sessionNowMs)) {
            return;
          }
          processCreepDeathHealing(sessionNowMs);
          cleanupDead(sessionNowMs);
          const postTurnResult = checkBattleEndResult(Game, { trigger: 'post-turn', timestamp: sessionNowMs });
          scheduleDraw();
          aiMaybeAct(Game, 'board');
          if (Game.battle?.over) {
            return;
          }
          turnState = Game.turn ?? null;
          if (turnState){
            const rawBusyAfter = turnState.busyUntil;
            busyUntil = isFiniteNumber(rawBusyAfter) && rawBusyAfter > 0 ? rawBusyAfter : 0;
            if (!isFiniteNumber(rawBusyAfter) || rawBusyAfter <= 0){
              turnState.busyUntil = busyUntil;
            }
          } else {
            busyUntil = 0;
          }
          readyByBusy = sessionNowMs >= busyUntil;
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
    const raf = getRequestAnimationFrame();
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

  const exclude = new Set(Game.usedUnitIds);
  for (let i = 0; i < deck.length; i += 1) {
    const entry = deck[i];
    if (!entry?.id) continue;
    exclude.add(entry.id);
  }
  const lockedDeck = ensureLockedPlayerDeck();
  const more = pickRandom(lockedDeck, exclude).slice(0, need);
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
  const camSignature = getCachedCameraPresetSignature(CAM_PRESET);
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
  let sessionVfx: SessionWithVfx | null = null;
  let meleeOffsets: TokenMeleeOffsetMap | null = null;
  if (Game.grid){
    sessionVfx = ensureSessionWithVfx(Game, { requireGrid: true });
    if (sessionVfx){
      const computedOffsets = computeMeleeOffsets(sessionVfx, CAM_PRESET);
      meleeOffsets = syncMeleeOffsetTokens(computedOffsets);
    } else {
      meleeOffsetTokenKeys.clear();
    }
  } else {
    meleeOffsetTokenKeys.clear();
}
  if (Game.grid){
    if (!gridDrawnViaScene) {
      drawGridOblique(ctx, Game.grid, CAM_PRESET);
    }
    drawQueuedOblique(ctx, Game.grid, Game.queued, CAM_PRESET);
    const tokens = Game.tokens || [];
    if (meleeOffsets){
      drawTokensOblique(ctx, Game.grid, tokens, CAM_PRESET, { meleeOffsets });
    } else {
      drawTokensOblique(ctx, Game.grid, tokens, CAM_PRESET);
    }

    const aetherSyncStart = SUPPORTS_PERF_NOW ? performance.now() : Date.now();
    const canvasEl = canvas as HTMLCanvasElement;
    const rect = canvasEl.getBoundingClientRect();
    const ratioX = rect.width / canvasEl.width;
    const ratioY = rect.height / canvasEl.height;
    const grid = Game?.grid;
    if (!grid) return;

    let allyLeaderAlive: UnitToken | null = null;
    let allyLeaderAny: UnitToken | null = null;
    let enemyLeaderAlive: UnitToken | null = null;
    let enemyLeaderAny: UnitToken | null = null;
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      if (!token) continue;
      if (token.id === 'leaderA') {
        if (token.alive && !allyLeaderAlive) allyLeaderAlive = token;
        if (!allyLeaderAny) allyLeaderAny = token;
      } else if (token.id === 'leaderB') {
        if (token.alive && !enemyLeaderAlive) enemyLeaderAlive = token;
        if (!enemyLeaderAny) enemyLeaderAny = token;
      }
      if ((allyLeaderAlive || allyLeaderAny) && (enemyLeaderAlive || enemyLeaderAny)) {
        if (allyLeaderAlive && enemyLeaderAlive) break;
      }
    }

    const allyLeader = allyLeaderAlive ?? allyLeaderAny;
    const enemyLeader = enemyLeaderAlive ?? enemyLeaderAny;

    const allyPos = projectLeaderGroundPos(allyLeader, 0, 1, { grid, rect, ratioX, ratioY });
    const enemyPos = projectLeaderGroundPos(enemyLeader, 6, 1, { grid, rect, ratioX, ratioY });
    const clampMargin = Math.max(12, Math.round(rect.width * 0.02));
    const halfTileAnchor = 0.5;
    const tilePxX = grid.tile * ratioX;
    const tilePxY = grid.tile * ratioY;
    const allyBackOffsetX = tilePxX * halfTileAnchor;
    const enemyBackOffsetX = tilePxX * halfTileAnchor;
    const allyBackOffsetY = tilePxY * 0.24;
    const enemyBackOffsetY = tilePxY * 0.24;

    // 5. Đồng bộ vị trí + đồng bộ bể AE chung theo đội hình sống
    globalAetherPool.syncAllVisuals(
       { x: allyPos.x, y: allyPos.y, s: allyPos.s },
       { x: enemyPos.x, y: enemyPos.y, s: enemyPos.s },
       tokens,
       {
         ally: {
           facing: 1,
            backOffsetX: allyBackOffsetX,
            backOffsetY: allyBackOffsetY,
            anchorLiftY: Number.isFinite(allyPos.anchor) ? Math.max(0, (1 - allyPos.anchor!) * 10 * allyPos.s) : 0,
           clamp: {
             minX: rect.left + clampMargin,
             maxX: rect.right - clampMargin,
             minY: rect.top + clampMargin,
             maxY: rect.bottom - clampMargin,
           },
         },
         enemy: {
           facing: -1,
           backOffsetX: enemyBackOffsetX,
           backOffsetY: enemyBackOffsetY,
            anchorLiftY: Number.isFinite(enemyPos.anchor) ? Math.max(0, (1 - enemyPos.anchor!) * 10 * enemyPos.s) : 0,
           clamp: {
             minX: rect.left + clampMargin,
             maxX: rect.right - clampMargin,
             minY: rect.top + clampMargin,
             maxY: rect.bottom - clampMargin,
           },
        },
      }
   );

   const aetherSyncEnd = SUPPORTS_PERF_NOW ? performance.now() : Date.now();
    emitAetherDebug(rect, aetherSyncEnd - aetherSyncStart);
  }
  if (sessionVfx){
    vfxDraw(ctx, sessionVfx, CAM_PRESET);
  }
  drawHPBars();
}

type ScreenProjectionContext = {
  grid: GridSpec;
  rect: DOMRect;
  ratioX: number;
  ratioY: number;
};

function getScreenPos(
  cx: number,
  cy: number,
  context: ScreenProjectionContext
): { x: number; y: number; s: number } {
  const { grid, rect, ratioX, ratioY } = context;
  const local = cellCenterObliqueLocal(grid, cx, cy, CAM_PRESET);
  return {
    x: rect.left + (local.x * ratioX),
    y: rect.top + (local.y * ratioY),
    s: local.scale * ratioX,
  };
}

function resolveLeaderPivotAnchor(token: UnitToken | null): number | null {
  if (!token) return null;
  const spriteAnchor = Number((token.art?.sprite as { anchor?: unknown } | null | undefined)?.anchor);
  if (Number.isFinite(spriteAnchor)) return Math.max(0, Math.min(1, spriteAnchor));
  const layoutAnchor = Number((token.art?.layout as { anchor?: unknown } | null | undefined)?.anchor);
  if (Number.isFinite(layoutAnchor)) return Math.max(0, Math.min(1, layoutAnchor));
  return null;
}

function projectLeaderGroundPos(
  token: UnitToken | null,
  fallbackCx: number,
  fallbackCy: number,
  context: ScreenProjectionContext,
): { x: number; y: number; s: number; anchor: number | null } {
  const projected = token
    ? getScreenPos(token.cx, token.cy, context)
    : getScreenPos(fallbackCx, fallbackCy, context);
  if (!token) return { ...projected, anchor: null };

  const pivotAnchor = resolveLeaderPivotAnchor(token);
  if (!Number.isFinite(pivotAnchor)) {
    return { ...projected, anchor: null };
  }

  const layout = (token.art?.layout as { spriteHeight?: unknown } | null | undefined) ?? null;
  const sprite = (token.art?.sprite as { scale?: unknown } | null | undefined) ?? null;
  const spriteHeightMult = Number.isFinite(Number(layout?.spriteHeight)) ? Number(layout?.spriteHeight) : 2.4;
  const spriteScale = Number.isFinite(Number(sprite?.scale)) ? Number(sprite?.scale) : 1;
  const artSize = Number.isFinite(Number(token.art?.size)) ? Number(token.art?.size) : 1;
  const radiusPx = Math.max(6, Math.floor(context.grid.tile * 0.36 * projected.s));
  const spriteHeightPx = radiusPx * spriteHeightMult * spriteScale * artSize;
  const anchorValue = pivotAnchor as number;
  const footShiftY = spriteHeightPx * (1 - anchorValue);

  return {
    x: projected.x,
    y: projected.y + footShiftY,
    s: projected.s,
    anchor: anchorValue,
  };
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

function collectActiveAttackTokenKeys(): Set<string> {
  const active = new Set<string>();
  for (const key of meleeOffsetTokenKeys){
    active.add(key);
  }
  const events = Array.isArray(Game?.vfx) ? Game.vfx : [];
  if (!events.length) return active;
  const nowMs = safeNow();
  for (const event of events){
    if (!event || typeof event !== 'object') continue;
    const rec = event as Record<string, unknown>;
    const type = typeof rec.type === 'string' ? rec.type : '';
    if (!ATTACK_EVENT_TYPES.has(type)) continue;
    const dur = parseFiniteNumber(rec.dur) ?? 0;
    if (dur <= 0) continue;
    const t0 = parseFiniteNumber(rec.t0) ?? 0;
    const tt = (nowMs - t0) / dur;
    if (!(tt > 0 && tt < 1)) continue;
    const refA = rec.refA as Partial<UnitToken> | null | undefined;
    const fallback = {
      iid: parseFiniteNumber(rec.iidA),
      id: typeof rec.idA === 'string' ? rec.idA : null,
    };
    const key = makeMeleeTokenKey({ iid: refA?.iid ?? fallback.iid ?? undefined, id: refA?.id ?? fallback.id ?? undefined });
    if (key) active.add(key);
  }
  return active;
}

function getShieldRatio(unit: UnitToken): number {
  const shield = Statuses.get(unit, 'shield');
  const shieldAmount = Math.max(0, toFiniteOrZero((shield as { amount?: unknown } | null)?.amount));
  const hpMax = Math.max(1, toFiniteOrZero(unit.hpMax));
  return Math.max(0, Math.min(1, shieldAmount / hpMax));
}

function getStatusMeta(status: Record<string, unknown> | null | undefined): StatusMeta {
  const rawId = typeof status?.id === 'string' ? status.id : '';
  const id = STATUS_ID_ALIAS_TO_CANONICAL[rawId] ?? rawId;
  const tag = typeof status?.tag === 'string' ? status.tag : '';
  const byId = id ? STATUS_META_BY_ID[id] : null;
  const byTag = tag ? STATUS_META_BY_TAG[tag] : null;
  if (byId) return byId;
  if (byTag) return byTag;
  const fallbackId = id || tag || 'default';
  const fallbackLabel = id || tag || 'Effect';
  const fallbackIcon = fallbackId in STATUS_ICON_PATHS
    ? STATUS_ICON_PATHS[fallbackId as StatusIconId]
    : DEFAULT_STATUS_ICON_PATH;
  return { id: fallbackId, label: fallbackLabel, icon: fallbackIcon };
}

function computeStatusTurnsLeft(status: Record<string, unknown> | null | undefined): number | null {
  const candidates = [status?.dur, status?.ttlTurns, status?.turns, status?.ttl];
  for (const value of candidates){
    const parsed = parseFiniteNumber(value);
    if (parsed !== null){
      return Math.max(0, Math.round(parsed));
    }
  }
  return null;
}

function buildStatusTooltip(label: string, stacks: number, turnsLeft: number | null): string {
  const stacksText = `x${Math.max(1, stacks)}`;
  const turnsText = turnsLeft === null ? '∞T' : `${turnsLeft}T`;
  return `${label} ${stacksText} · ${turnsText}`;
}

function buildStatusAggregateSignature(statuses: ReadonlyArray<Record<string, unknown> | null | undefined>): string {
  let signature = `len:${statuses.length}`;
  for (const status of statuses){
    if (!status || typeof status !== 'object') {
      signature += '|_';
      continue;
    }
    const id = typeof status.id === 'string' ? status.id : '';
    const tag = typeof status.tag === 'string' ? status.tag : '';
    const kind = typeof status.kind === 'string' ? status.kind : '';
    const stacks = parseFiniteNumber(status.stacks) ?? 1;
    const turnsLeft = computeStatusTurnsLeft(status);
    signature += `|${id}:${tag}:${kind}:${stacks}:${turnsLeft ?? 'inf'}`;
  }
  return signature;
}

function aggregateStatuses(statusesInput: ReadonlyArray<Record<string, unknown> | null | undefined>): StatusAggregate[] {
  const statuses = Array.isArray(statusesInput) ? statusesInput : [];
  if (!statuses.length) return [];
  const signature = buildStatusAggregateSignature(statuses);
  const cached = statusAggregateCache.get(statuses);
  if (cached && cached.signature === signature) {
    return cached.aggregates;
  }

  const byStatusId = new Map<string, StatusAggregate>();
  for (const rawStatus of statuses) {
    if (!rawStatus || typeof rawStatus !== 'object') continue;
    const statusRecord = rawStatus as Record<string, unknown>;
    const statusId = typeof statusRecord.id === 'string' ? statusRecord.id : null;
    if (!statusId) continue;

    const tag = typeof statusRecord.tag === 'string' ? statusRecord.tag : '';
    const kind = typeof statusRecord.kind === 'string' ? statusRecord.kind : '';
    const isControl = CONTROL_TAGS.has(tag) || CONTROL_TAGS.has(statusId);
    const isDebuff = kind === 'debuff';
    const priority = isControl ? 0 : (isDebuff ? 1 : 2);
    const turnsLeft = computeStatusTurnsLeft(statusRecord);
    const stacks = Math.max(1, Math.round(parseFiniteNumber(statusRecord.stacks) ?? 1));

    const existing = byStatusId.get(statusId);
    if (!existing) {
      byStatusId.set(statusId, {
        statusId,
        meta: getStatusMeta(statusRecord),
        priority,
        stacks,
        turnsLeft,
      });
      continue;
    }

    existing.stacks += stacks;
    if (turnsLeft !== null) {
      existing.turnsLeft = existing.turnsLeft === null
        ? turnsLeft
        : Math.max(existing.turnsLeft, turnsLeft);
    }
    existing.priority = Math.min(existing.priority, priority);
  }

  const aggregates = Array.from(byStatusId.values());
  aggregates.sort((a, b) => (
    a.priority - b.priority
    || ((b.turnsLeft ?? Number.MAX_SAFE_INTEGER) - (a.turnsLeft ?? Number.MAX_SAFE_INTEGER))
    || a.meta.label.localeCompare(b.meta.label)
  ));
  statusAggregateCache.set(statuses, { signature, aggregates });
  return aggregates;
}

function ensureStatusIconLoaded(iconId: string, iconPath: string): StatusIconEntry | null {
  if (typeof Image === 'undefined') return null;
  let cache = statusIconCache.get(iconId);
  if (!cache) {
    cache = {
      statusId: iconId,
      statusName: iconId,
      tooltip: iconId,
      priority: 0,
      stacks: 1,
      turnsLeft: null,
      path: iconPath,
      image: null,
      status: 'idle',
    };
    statusIconCache.set(iconId, cache);
  }
  if (cache.path !== iconPath){
    cache.path = iconPath;
    cache.status = 'idle';
    cache.image = null;
  }
  if (cache.status !== 'idle') return cache;
  const image = new Image();
  cache.image = image;
  cache.status = 'loading';
  if ('decoding' in image) {
    (image as HTMLImageElement & { decoding?: string }).decoding = 'async';
  }
  image.onload = () => {
    cache!.status = 'ready';
  };
  image.onerror = () => {
    if (cache!.path !== DEFAULT_STATUS_ICON_PATH) {
      cache!.status = 'idle';
      cache!.image = null;
      cache!.path = DEFAULT_STATUS_ICON_PATH;
      ensureStatusIconLoaded(iconId, DEFAULT_STATUS_ICON_PATH);
      return;
    }
    cache!.status = 'error';
  };
  image.src = iconPath;
  return cache;
}

function collectStatusIcons(unit: UnitToken): StatusIconEntry[] {
  const statuses = Array.isArray(unit.statuses) ? unit.statuses : [];
  if (!statuses.length) return [];
  const icons: StatusIconEntry[] = [];
  const aggregates = aggregateStatuses(statuses);
  for (const aggregate of aggregates) {
    if (icons.length >= MAX_STATUS_ICONS_PER_TOKEN) break;
    const icon = ensureStatusIconLoaded(aggregate.meta.id, aggregate.meta.icon);
    if (!icon || icon.status !== 'ready' || !icon.image) continue;
    icons.push({
      ...icon,
      statusId: aggregate.statusId,
      statusName: aggregate.meta.label,
      tooltip: buildStatusTooltip(aggregate.meta.label, aggregate.stacks, aggregate.turnsLeft),
      priority: aggregate.priority,
      stacks: aggregate.stacks,
      turnsLeft: aggregate.turnsLeft,
    });
  }
  return icons;
}


export function __resolveStatusIconPreview(statusesInput: ReadonlyArray<Record<string, unknown> | null | undefined>): Array<{ id: string; tooltip: string; priority: number }> {
  const preview: Array<{ id: string; tooltip: string; priority: number }> = [];
  const aggregates = aggregateStatuses(statusesInput);
  for (const aggregate of aggregates){
    if (preview.length >= MAX_STATUS_ICONS_PER_TOKEN) break;
    preview.push({
      id: aggregate.statusId,
      tooltip: buildStatusTooltip(aggregate.meta.label, aggregate.stacks, aggregate.turnsLeft),
      priority: aggregate.priority,
    });
  }
  return preview;
}

function updateStatusIconHoverTooltip(clientX: number, clientY: number): void {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  let nextTooltip = '';
  for (const hitbox of statusIconHitboxes){
    const withinX = x >= hitbox.x && x <= hitbox.x + hitbox.size;
    const withinY = y >= hitbox.y && y <= hitbox.y + hitbox.size;
    if (withinX && withinY){
      nextTooltip = hitbox.tooltip;
      break;
    }
  }
  if (statusIconHoverTooltip === nextTooltip) return;
  statusIconHoverTooltip = nextTooltip;
  canvas.title = nextTooltip;
}

function drawHPBars(): void {
  if (!ctx || !Game?.grid) return;
  statusIconHitboxes.length = 0;
  const drawCtx = ctx;
  const baseR = Math.floor(Game.grid.tile * 0.36);
  const tokens = Game.tokens || [];
  const activeAttackKeys = collectActiveAttackTokenKeys();

  for (const t of tokens){
    if (!t.alive || !Number.isFinite(t.hpMax)) continue;
    const meleeKey = makeMeleeTokenKey(t);
    if (meleeKey && activeAttackKeys.has(meleeKey)) continue;

    const p = cellCenterObliqueLocal(Game.grid, t.cx, t.cy, CAM_PRESET);
    const art = t.art || getUnitArt(t.id, { skinKey: t.skinKey });
    const layout = (art?.layout as UnitArtLayout | Record<string, unknown>) ?? {};
    const layoutRecord = layout as Record<string, unknown>;
    const spriteRecord = (art?.sprite as Record<string, unknown> | null | undefined) ?? null;

    const r = Math.max(6, Math.floor(baseR * (p.scale || 1)));
    const spriteHeightMult = parseFiniteNumber(layoutRecord.spriteHeight) ?? 2.4;
    const spriteScale = parseFiniteNumber(spriteRecord?.scale) ?? 1;
    const artSize = parseFiniteNumber(art?.size) ?? 1;
    const anchor = parseFiniteNumber(spriteRecord?.anchor) ?? parseFiniteNumber(layoutRecord.anchor) ?? 0.78;
    const spriteHeight = r * spriteHeightMult * artSize * spriteScale;

    const widthRatio = parseFiniteNumber(layoutRecord.hpWidth) ?? 1.55;
    const heightRatio = parseFiniteNumber(layoutRecord.hpHeight) ?? 0.22;
    const barWidth = Math.max(24, Math.floor(r * widthRatio));
    const barHeight = Math.max(4, Math.floor(r * heightRatio));
    const headY = p.y - spriteHeight * anchor;
    const hpY = Math.round(headY - Math.max(6, Math.floor(r * 0.34)) - barHeight);
    const hpX = Math.round(p.x - barWidth / 2);
    const statusIcons = collectStatusIcons(t);
    const statusIconSize = Math.max(2, Math.floor(barHeight * 0.9));
    const statusIconGap = Math.max(1, Math.floor(statusIconSize * 0.2));
    const statusRowWidth = statusIcons.length > 0
      ? (statusIcons.length * statusIconSize) + ((statusIcons.length - 1) * statusIconGap)
      : 0;
    const statusY = hpY - statusIconSize - 2;
    const statusStartX = Math.round(hpX + (barWidth - statusRowWidth) / 2);

    const hpRatio = Math.max(0, Math.min(1, (t.hp || 0) / (t.hpMax || 1)));
    const shieldRatio = getShieldRatio(t);

    const bgColor = art?.hpBar?.bg || 'rgba(9,14,21,0.86)';
    const fillColor = art?.hpBar?.fill || '#48d267';
    const borderColor = art?.hpBar?.border || 'rgba(0,0,0,0.62)';
    const radius = Math.max(2, Math.floor(barHeight / 2));

    drawCtx.save();
    drawCtx.shadowColor = 'transparent';
    drawCtx.shadowBlur = 0;

    roundedRectPathUI(drawCtx, hpX, hpY, barWidth, barHeight, radius);
    drawCtx.fillStyle = bgColor;
    drawCtx.fill();
    if (borderColor && borderColor !== 'none'){
      drawCtx.strokeStyle = borderColor;
      drawCtx.lineWidth = 1;
      drawCtx.stroke();
    }

    const inset = 1;
    const innerHeight = Math.max(1, barHeight - inset * 2);
    const innerRadius = Math.max(1, radius - inset);
    const innerWidth = Math.max(1, barWidth - inset * 2);
    const filledWidth = Math.round(innerWidth * hpRatio);
    if (filledWidth > 0){
      const fillStyle = ensureHpBarGradient(fillColor, innerHeight, innerRadius, hpY + inset, hpX + inset);
      drawCtx.save();
      drawCtx.translate(hpX + inset, hpY + inset);
      roundedRectPathUI(drawCtx, 0, 0, filledWidth, innerHeight, innerRadius);
      drawCtx.fillStyle = fillStyle;
      drawCtx.fill();
      drawCtx.restore();
    }

    if (shieldRatio > 0){
      const dimWidth = Math.max(1, Math.round(innerWidth * shieldRatio));
      drawCtx.save();
      drawCtx.beginPath();
      roundedRectPathUI(drawCtx, hpX + inset, hpY + inset, dimWidth, innerHeight, innerRadius);
      drawCtx.fillStyle = 'rgba(190, 210, 205, 0.32)';
      drawCtx.fill();
      drawCtx.restore();
    }

    if (statusIcons.length > 0){
      statusIcons.forEach((icon, index) => {
        const iconX = statusStartX + index * (statusIconSize + statusIconGap);
        drawCtx.drawImage(icon.image as CanvasImageSource, iconX, statusY, statusIconSize, statusIconSize);
        if (icon.stacks > 1) {
          const stackText = icon.stacks > 99 ? '99+' : `${icon.stacks}`;
          const badgeSize = Math.max(7, Math.round(statusIconSize * 0.62));
          const badgeX = iconX + statusIconSize - badgeSize;
          const badgeY = statusY + statusIconSize - badgeSize;
          drawCtx.save();
          drawCtx.fillStyle = 'rgba(8, 12, 22, 0.92)';
          drawCtx.strokeStyle = 'rgba(255,255,255,0.82)';
          drawCtx.lineWidth = 1;
          roundedRectPathUI(drawCtx, badgeX, badgeY, badgeSize, badgeSize, Math.max(2, Math.floor(badgeSize / 3)));
          drawCtx.fill();
          drawCtx.stroke();
          drawCtx.fillStyle = '#f3f8ff';
          drawCtx.font = `${Math.max(6, Math.floor(badgeSize * 0.58))}px system-ui, sans-serif`;
          drawCtx.textAlign = 'center';
          drawCtx.textBaseline = 'middle';
          drawCtx.fillText(stackText, badgeX + (badgeSize / 2), badgeY + (badgeSize / 2) + 0.5);
          drawCtx.restore();
        }
        statusIconHitboxes.push({ x: iconX, y: statusY, size: statusIconSize, tooltip: icon.tooltip });
      });
    }

    const ticks = 10;
    drawCtx.save();
    drawCtx.strokeStyle = 'rgba(0,0,0,0.45)';
    drawCtx.lineWidth = 1;
    for (let i = 1; i < ticks; i += 1){
      const tx = hpX + inset + Math.round((innerWidth * i) / ticks) + 0.5;
      drawCtx.beginPath();
      drawCtx.moveTo(tx, hpY + inset + 0.5);
      drawCtx.lineTo(tx, hpY + inset + innerHeight - 0.5);
      drawCtx.stroke();
    }
    drawCtx.restore();

    const furyMax = Math.max(1, parseFiniteNumber(t.furyMax) ?? 100);
    const furyNow = Math.max(0, parseFiniteNumber(t.fury) ?? parseFiniteNumber(t.rage) ?? 0);
    const furyRatio = Math.max(0, Math.min(1, furyNow / furyMax));
    const rageHeight = Math.max(2, Math.floor(barHeight * 0.55));
    const rageY = hpY + barHeight + 2;
    const rageRadius = Math.max(1, Math.floor(rageHeight / 2));

    roundedRectPathUI(drawCtx, hpX, rageY, barWidth, rageHeight, rageRadius);
    drawCtx.fillStyle = 'rgba(9,14,21,0.72)';
    drawCtx.fill();
    const rageFilledWidth = Math.round((barWidth - 2) * furyRatio);
    if (rageFilledWidth > 0){
      roundedRectPathUI(drawCtx, hpX + 1, rageY + 1, rageFilledWidth, Math.max(1, rageHeight - 2), Math.max(1, rageRadius - 1));
      drawCtx.fillStyle = '#7b5cff';
      drawCtx.fill();
    }

    drawCtx.restore();
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

function isDocumentNode(value: Element | Document): value is Document {
  const documentNodeType = typeof Node !== 'undefined' ? Node.DOCUMENT_NODE : 9;
  return value.nodeType === documentNodeType;
}

function configureRoot(root: RootLike): void {
  rootElement = root || null;
  if (rootElement && rootElement.ownerDocument){
    docRef = rootElement.ownerDocument;
  } else if (rootElement && isDocumentNode(rootElement)){
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
      const cancel = getCancelAnimationFrame();
      const frameHandle = toAnimationFrameHandle(tickLoopHandle);
      if (cancel && frameHandle !== null){
        cancel(frameHandle);
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
  if (canvas && canvasMouseMoveHandler && typeof canvas.removeEventListener === 'function'){
    canvas.removeEventListener('mousemove', canvasMouseMoveHandler);
  }
  canvasClickHandler = null;
  canvasMouseMoveHandler = null;
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
  viewportResizeDebugState = null;
  cancelScheduledResize();
  unbindArtSpriteListener();
  unbindVisibility();
}

function resetDomRefs(): void {
  canvas = null;
  ctx = null;
  hud = null;
  hudCleanup = null;
  if (leaderUltControlsEl){
    leaderUltControlsEl.hidden = true;
  }
  for (const button of leaderUltButtons){
    button.onclick = null;
  }
  leaderUltButtons = [];
  leaderUltControlsEl = null;
  leaderUltControlsFingerprint = null;
  timerElement = null;
  statusIconHoverTooltip = '';
  statusIconHitboxes.length = 0;
  hpBarGradientCache.clear();
  invalidateSceneCache();
}

function stopSession(): void {
  clearSessionTimers();
  clearSessionListeners();
  cleanupSummonBar();
  globalAetherPool.destroy();
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
  const game = Game;
  let sceneChanged = false;
  if (typeof cfg.sceneTheme !== 'undefined'){
    if (game.sceneTheme !== cfg.sceneTheme) sceneChanged = true;
    game.sceneTheme = cfg.sceneTheme;
  }
  if (typeof cfg.backgroundKey !== 'undefined'){
    if (game.backgroundKey !== cfg.backgroundKey){
      sceneChanged = true;
      clearBackgroundSignatureCache();
    }
    game.backgroundKey = cfg.backgroundKey;
  }
  if (typeof cfg.modeKey !== 'undefined'){
    game.modeKey = typeof cfg.modeKey === 'string' ? cfg.modeKey : (cfg.modeKey || null);
  }
  const preferredDeckInput = getPreferredDeckInput(cfg);
  if (preferredDeckInput) {
    const deck = normalizeDeckEntries(preferredDeckInput);
    if (deck.length) {
      const deckUnitIds = new Set(deck.map((entry) => entry.id));
      game.unitsAll = deck;
      game.playerDeckLocked = Array.from(deck);
      game.deck3 = ensureDeck().filter((card) => deckUnitIds.has(card.id));
      if (game.selectedId && !deckUnitIds.has(game.selectedId)) {
        game.selectedId = null;
      }
      refillDeck();
    }
  }
  let collectionProgressById: Map<string, RuntimeUnitProgress> | null = null;
  if (typeof cfg.collectionState !== 'undefined'){
    collectionProgressById = mapUnitProgressById(cfg.collectionState ?? null);
    game.runtime.unitProgressById = collectionProgressById;
    applyCollectionSkinsToSession(game);
  }
  if (cfg.aiPreset){
    const preset: EnemyAIPreset = cfg.aiPreset || {};
    const lineupInput = getPreferredDeckInput(cfg);
    const enemyUnits = resolveEnemyUnits({
      aiPreset: preset,
      preferredDeck: lineupInput,
      fallbackDeck: game.playerDeckLocked ?? game.unitsAll ?? [],
      ...(collectionProgressById
        ? { unitProgressById: collectionProgressById }
        : { collectionState: cfg.collectionState ?? null }),
    });
    if (enemyUnits.length) game.ai.unitsAll = enemyUnits;
    const parsedCostCap = toPositiveOrNull(preset.costCap);
    if (parsedCostCap !== null) game.ai.costCap = parsedCostCap;
    const parsedSummonLimit = toPositiveOrNull(preset.summonLimit);
    if (parsedSummonLimit !== null) game.ai.summonLimit = parsedSummonLimit;
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