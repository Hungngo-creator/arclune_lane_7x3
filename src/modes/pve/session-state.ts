import type { CreateSessionOptions, RuntimeUnitProgress, SessionState } from '@shared-types/pve';
import type {
  CameraPreset,
  GameConfig,
  SceneConfig,
  TurnOrderPairScanEntry,
  TurnOrderPairScanSideObject,
  TurnOrderPairScanSlotObject,
  TurnOrderSide,
} from '@shared-types/config';
import type { TurnSnapshot } from '@shared-types/turn-order';
import type { QueuedSummonState, ActionChainEntry, UnitId, Side } from '@shared-types/units';
import { createSummonQueue } from '@shared-types/units.ts';

import { CFG } from '../../config.ts';
import { UNITS, lookupUnit } from '../../units.ts';
import { getMetaById } from '../../catalog.ts';
import { deriveBudgetFromRankRole, evaluateCostBudget } from '../../data/cost-budget.ts';
import { makeInstanceStats, metaServiceAdapter } from '../../meta.ts';
import { gameEvents } from '../../events.ts';
import { getEnvironmentBackground, drawEnvironmentProps } from '../../background.ts';
import { getCachedBattlefieldScene } from '../../scene.ts';
import { drawGridOblique } from '../../engine.ts';
import { getUnitArt } from '../../art.ts';
import { normalizeUnitId } from '../../utils/unit-id.ts';
import { createRngState, nextRngValue } from '../../utils/rng.ts';
import { stableStringify } from '../../utils/format.ts';
import { normalizeClassName, normalizeElementKey, normalizeElementList } from '../../utils/domain-normalization.ts';
import { mapUnitProgressById } from './collection-mapper.ts';
import { buildAICreepDeckFromLineup } from './creep-builder.ts';

type SceneConfigWithExtras = (SceneConfig & { CURRENT_BACKGROUND?: string | null | undefined }) | null;

const DEFAULT_UNIT_ROSTER = UNITS.map((unit) => {
  const unitId = normalizeUnitId(unit.id);
  const art = getUnitArt(unitId);
  return {
    id: unitId,
    name: unit.name,
    cost: Number.isFinite(unit.cost) ? unit.cost : null,
    art,
    skinKey: art?.skinKey ?? null,
  } satisfies SessionState['unitsAll'][number];
}) as ReadonlyArray<SessionState['unitsAll'][number]>;

type SessionConfigInput = Partial<CreateSessionOptions> & {
  scene?: {
    theme?: string;
    backgroundKey?: string;
    background?: string;
    [extra: string]: unknown;
  };
};

export type NormalizedSessionConfig = (CreateSessionOptions & {
  sceneTheme?: string;
  backgroundKey?: string;
}) & Record<string, unknown>;

const NORMALIZABLE_DECK_FIELDS = ['lineupDeck', 'playerDeck', 'deck'] as const;
type NormalizableDeckField = (typeof NORMALIZABLE_DECK_FIELDS)[number];
type DeckInputSource = Partial<Record<NormalizableDeckField, unknown>>;

type DeckNormalizationCache = WeakMap<ReadonlyArray<unknown>, SessionState['unitsAll']>;
const GLOBAL_DECK_NORMALIZATION_CACHE: DeckNormalizationCache = new WeakMap();

function normalizeDeckEntriesCached(
  value: ReadonlyArray<unknown>,
  cache: DeckNormalizationCache,
): SessionState['unitsAll'] {
  const cached = cache.get(value);
  if (cached) return cached;
  const normalized = normalizeDeckEntries(value);
  cache.set(value, normalized);
  return normalized;
}

function hasDeckEntries(value: unknown): value is ReadonlyArray<unknown> {
  return Array.isArray(value) && value.length > 0;
}

function isNormalizedDeckEntries(value: unknown): value is SessionState['unitsAll'] {
  if (!Array.isArray(value)) return false;
  for (let index = 0; index < value.length; index += 1) {
    const entry = value[index];
    if (!entry || typeof entry !== 'object') return false;
    if (typeof (entry as { id?: unknown }).id !== 'string') return false;
  }
  return true;
}

function toDeckEntries(value: unknown): SessionState['unitsAll'] {
  if (!hasDeckEntries(value)) return EMPTY_UNIT_DECK;
  const cached = GLOBAL_DECK_NORMALIZATION_CACHE.get(value);
  if (cached) return cached;
  if (isNormalizedDeckEntries(value)) {
    GLOBAL_DECK_NORMALIZATION_CACHE.set(value, value);
    return value;
  }
  const normalized = normalizeDeckEntriesCached(value, GLOBAL_DECK_NORMALIZATION_CACHE);
  return normalized;
}

function pickFirstDeckInput(source: DeckInputSource): ReadonlyArray<unknown> | null {
  const lineupDeck = source.lineupDeck;
  if (hasDeckEntries(lineupDeck)) return lineupDeck;
  const playerDeck = source.playerDeck;
  if (hasDeckEntries(playerDeck)) return playerDeck;
  const deck = source.deck;
  if (hasDeckEntries(deck)) return deck;
  return null;
}

export function getPreferredDeckInput(config: {
  lineupDeck?: unknown;
  playerDeck?: unknown;
  deck?: unknown;
}): ReadonlyArray<unknown> | null {
  return pickFirstDeckInput(config);
}

export function getPreferredDeckEntries(config: {
  lineupDeck?: unknown;
  playerDeck?: unknown;
  deck?: unknown;
}): SessionState['unitsAll'] {
  return toDeckEntries(pickFirstDeckInput(config));
}

type TurnOrderEntry = { side: Side; slot: number };
const TURN_ORDER_FALLBACK_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const DEFAULT_TURN_ORDER_SIDES = ['ally', 'enemy'] as const satisfies ReadonlyArray<TurnOrderSide>;

type BackgroundConfig = ReturnType<typeof getEnvironmentBackground>;

type BackgroundCacheEntry = {
  config: BackgroundConfig;
  signature: string;
};

function getSceneConfig(cfg: GameConfig | null | undefined): SceneConfigWithExtras {
  if (!cfg || typeof cfg !== 'object') return null;
  const sceneCandidate = (cfg as { SCENE?: unknown }).SCENE;
  if (!sceneCandidate || typeof sceneCandidate !== 'object') return null;
  const scene = sceneCandidate as SceneConfig & { CURRENT_BACKGROUND?: string | null | undefined };
  if (typeof scene.DEFAULT_THEME !== 'string' || typeof scene.CURRENT_THEME !== 'string') return null;
  if (!scene.THEMES || typeof scene.THEMES !== 'object') return null;
  return scene;
}

function getTurnOrderMode(cfg: GameConfig): string | null {
  const rawMode = cfg.turnOrder.mode ?? null;
  return typeof rawMode === 'string' ? rawMode : null;
}

function buildQueuedSummonState(): QueuedSummonState {
  return {
    ally: createSummonQueue(),
    enemy: createSummonQueue(),
  };
}

interface BuildAiStateParams {
  preset: CreateSessionOptions['aiPreset'] | null | undefined;
  unitsAll: SessionState['ai']['unitsAll'];
  defaultCostCap: number;
  defaultSummonLimit: number;
}

type MutableAiPreset = NonNullable<NormalizedSessionConfig['aiPreset']>;

interface ResolveEnemyUnitsOptions {
  aiPreset?: CreateSessionOptions['aiPreset'] | null;
  preferredDeck?: ReadonlyArray<unknown> | null;
  fallbackDeck?: ReadonlyArray<unknown> | null;
  unitProgressById?: ReadonlyMap<string, RuntimeUnitProgress> | null;
  collectionState?: CreateSessionOptions['collectionState'] | null;
  modeKey?: string | null;
  stageId?: string | null;
}
interface ResolvePlayerDeckOptions {
  preferredDeck: SessionState['unitsAll'];
  fallbackSingleDeck: SessionState['unitsAll'];
  defaultRoster: ReadonlyArray<SessionState['unitsAll'][number]>;
  unitProgressById: ReadonlyMap<string, RuntimeUnitProgress>;
}

const EMPTY_UNIT_PROGRESS = new Map<string, RuntimeUnitProgress>();
const AUTO_PLAYER_DECK_SIZE = 10;
const EMPTY_UNIT_DECK = [] as SessionState['unitsAll'];
const DEFAULT_FALLBACK_DECK = DEFAULT_UNIT_ROSTER.slice(0, AUTO_PLAYER_DECK_SIZE) as SessionState['unitsAll'];
const DEFAULT_SINGLE_UNIT_DECK = DEFAULT_FALLBACK_DECK.slice(0, 1) as SessionState['unitsAll'];

export function parseFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeIntegerWithFallback(value: unknown, min: number, fallback: number): number {
  const numeric = parseFiniteNumber(value);
  if (numeric == null) return fallback;
  return Math.max(min, Math.floor(numeric));
}

function estimateUnitStrength(unitId: string, progress: RuntimeUnitProgress | undefined): number {
  const level = normalizeIntegerWithFallback(progress?.level, 1, 1);
  const stars = normalizeIntegerWithFallback(progress?.stars, 0, 0);
  const realm = normalizeIntegerWithFallback(progress?.realm, 0, 0);
  const subRealm = normalizeIntegerWithFallback(progress?.subRealm, 0, 0);
  const tp = normalizeIntegerWithFallback(progress?.tp, 0, 0);
  const stats = makeInstanceStats(unitId, level, stars);
  const weightedStats = (stats.hpMax * 0.18) + (stats.atk * 4) + (stats.wil * 3) + ((stats.arm + stats.res) * 500);
  const weightedProgress = (level * 12) + (stars * 220) + (realm * 180) + (subRealm * 35) + (tp * 10);
  return weightedStats + weightedProgress;
}

function buildAutoPlayerDeckFromCollection(
  progressById: ReadonlyMap<string, RuntimeUnitProgress>,
): SessionState['unitsAll'] {
  if (progressById.size === 0) return [];
  const ranked: Array<{ unitId: string; score: number }> = [];
  for (const [unitId, progress] of progressById.entries()) {
    if (!unitId || progress?.owned === false || !lookupUnit(unitId)) continue;
    ranked.push({
      unitId,
      score: estimateUnitStrength(unitId, progress),
    });
  }
  if (!ranked.length) return [];
  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.unitId.localeCompare(b.unitId);
  });
  const limit = Math.min(AUTO_PLAYER_DECK_SIZE, ranked.length);
  const pickedIds = new Array<string>(limit);
  for (let index = 0; index < limit; index += 1) {
    pickedIds[index] = ranked[index]!.unitId;
  }
  return normalizeDeckEntries(pickedIds);
}

function normalizePositiveLimit(value: unknown, fallback: number): number {
  const numeric = parseFiniteNumber(value);
  if (numeric != null && numeric > 0) return numeric;
  return fallback;
}

function buildAiState(params: BuildAiStateParams): SessionState['ai'] {
  const { preset, unitsAll, defaultCostCap, defaultSummonLimit } = params;
  const startingDeck = Array.isArray(preset?.startingDeck) ? preset.startingDeck : null;
  const costCap = normalizePositiveLimit(preset?.costCap, defaultCostCap);
  const summonLimit = normalizePositiveLimit(preset?.summonLimit, defaultSummonLimit);
  return {
    cost: 0,
    costCap,
    summoned: 0,
    summonLimit,
    unitsAll,
    usedUnitIds: new Set<UnitId>(),
    deck: startingDeck ? [...startingDeck] : [],
    selectedId: null,
    lastThinkMs: 0,
    lastDecision: null,
  };
}

function normalizeAiPresetDeckLists(
  preset: MutableAiPreset,
  cache: DeckNormalizationCache,
): MutableAiPreset {
  if (Array.isArray(preset.deck)) preset.deck = normalizeDeckEntriesCached(preset.deck, cache);
  if (Array.isArray(preset.unitsAll)) preset.unitsAll = normalizeDeckEntriesCached(preset.unitsAll, cache);
  return preset;
}

function getAiPresetDeckEntries(
  preset: ResolveEnemyUnitsOptions['aiPreset'] | null | undefined,
): SessionState['ai']['unitsAll'] | null {
  if (!preset) return null;
  const preferredDeckInput = pickFirstDeckInput({
    lineupDeck: preset.deck,
    playerDeck: preset.unitsAll,
    deck: null,
  });
  return preferredDeckInput ? toDeckEntries(preferredDeckInput) : null;
}

export function resolveEnemyUnits(options: ResolveEnemyUnitsOptions): SessionState['ai']['unitsAll'] {
  const presetDeck = getAiPresetDeckEntries(options.aiPreset);
  if (presetDeck) return presetDeck;
  const deckInput = options.preferredDeck ?? options.fallbackDeck;
  const lineupDeck = deckInput ? toDeckEntries(deckInput) : EMPTY_UNIT_DECK;
  const progressById = options.unitProgressById
    ?? (lineupDeck.length > 0
      ? mapUnitProgressById(options.collectionState ?? null)
      : EMPTY_UNIT_PROGRESS);

  return buildAICreepDeckFromLineup({
    lineup: lineupDeck,
    progressById,
    creepIds: resolveCampaignStageCreepIds(options.modeKey, options.stageId, lineupDeck.length),
  });
}

function isCampaignJadeForestStage11(modeKey: string | null | undefined, stageId: string | null | undefined): boolean {
  return modeKey === 'campaign' && stageId === '1-1';
}

function resolveCampaignStageCreepIds(
  modeKey: string | null | undefined,
  stageId: string | null | undefined,
  lineupSize: number,
): ReadonlyArray<string> | null {
  if (!isCampaignJadeForestStage11(modeKey, stageId)) return null;
  if (lineupSize <= 4) return Array.from({ length: 4 }, () => 'creep_3');
  if (lineupSize <= 7) return Array.from({ length: 3 }, () => 'creep_2');
  if (lineupSize <= 10) return Array.from({ length: 3 }, () => 'creep_1');
  return Array.from({ length: 3 }, () => 'creep_1');
}

function resolvePlayerDeck(options: ResolvePlayerDeckOptions): {
  hasPreferredDeck: boolean;
  autoPlayerDeck: SessionState['unitsAll'];
  lockedPlayerDeck: SessionState['unitsAll'];
  allyUnits: SessionState['unitsAll'];
} {
  const { preferredDeck, fallbackSingleDeck, defaultRoster, unitProgressById } = options;
  const hasPreferredDeck = preferredDeck.length > 0;
  const autoPlayerDeck = hasPreferredDeck ? EMPTY_UNIT_DECK : buildAutoPlayerDeckFromCollection(unitProgressById);
  const lockedPlayerDeck = hasPreferredDeck
    ? preferredDeck
    : (autoPlayerDeck.length > 0 ? autoPlayerDeck : fallbackSingleDeck);
  return {
    hasPreferredDeck,
    autoPlayerDeck,
    lockedPlayerDeck,
    allyUnits: lockedPlayerDeck.length ? [...lockedPlayerDeck] : [...defaultRoster],
  };
}

interface BuildBaseStateParams {
  modeKey: string | null;
  allyUnits: SessionState['unitsAll'];
  lockedPlayerDeck: SessionState['unitsAll'];
  costCap: number;
  summonLimit: number;
  sceneTheme: string | null;
  backgroundKey: string | null;
  turn: TurnSnapshot;
  ai: SessionState['ai'];
  unitProgressById: Map<string, RuntimeUnitProgress>;
  rngSeed?: number;
}

function buildBaseState(params: BuildBaseStateParams): SessionState {
  return {
    modeKey: params.modeKey,
    grid: null,
    tokens: [],
    cost: 0,
    costCap: params.costCap,
    summoned: 0,
    summonLimit: params.summonLimit,
    unitsAll: params.allyUnits,
    playerDeckLocked: params.lockedPlayerDeck,
    usedUnitIds: new Set<UnitId>(),
    deck3: [],
    selectedId: null,
    ui: { bar: null },
    turn: params.turn,
    queued: buildQueuedSummonState(),
    actionChain: [],
    events: gameEvents,
    sceneTheme: params.sceneTheme,
    backgroundKey: params.backgroundKey,
    battle: {
      over: false,
      winner: null,
      reason: null,
      detail: null,
      finishedAt: 0,
      result: null,
    },
    result: null,
    ai: params.ai,
    meta: metaServiceAdapter,
    rng: createRngState(params.rngSeed),
    runtime: {
      encounter: null,
      wave: null,
      rewardQueue: [],
      unitProgressById: params.unitProgressById,
    },
  };
}

export interface SceneCacheEntry {
  canvas: OffscreenCanvas | HTMLCanvasElement;
  pixelWidth: number;
  pixelHeight: number;
  cssWidth: number;
  cssHeight: number;
  themeKey: string | null | undefined;
  backgroundKey: string | null | undefined;
  backgroundSignature: string;
  dpr: number;
  baseKey: string | null | undefined;
  includesGrid: boolean;
  camPresetSignature: string;
}

export interface EnsureSceneCacheArgs {
  game: SessionState | null;
  canvas: HTMLCanvasElement | OffscreenCanvas | null;
  documentRef: Document | null;
  camPreset: CameraPreset | undefined;
}

const backgroundSignatureCache = new Map<string, BackgroundCacheEntry>();
let camPresetSignatureCache = new WeakMap<object, string>();
let sceneCache: SceneCacheEntry | null = null;

export function getCamPresetSignature(camPreset: CameraPreset | undefined): string {
  if (!camPreset || typeof camPreset !== 'object') {
    return stableStringify(camPreset ?? null);
  }
  const cached = camPresetSignatureCache.get(camPreset);
  if (cached) return cached;
  const signature = stableStringify(camPreset);
  camPresetSignatureCache.set(camPreset, signature);
  return signature;
}

function normalizeBackgroundCacheKey(backgroundKey: string | null | undefined): string {
  return `key:${backgroundKey ?? '__no-key__'}`;
}

export function clearBackgroundSignatureCache(): void {
  backgroundSignatureCache.clear();
  camPresetSignatureCache = new WeakMap<object, string>();
}

export function computeBackgroundSignature(backgroundKey: string | null | undefined): string {
  const cacheKey = normalizeBackgroundCacheKey(backgroundKey);
  const config = getEnvironmentBackground(backgroundKey);
  if (!config) {
    backgroundSignatureCache.delete(cacheKey);
    return `${backgroundKey || 'no-key'}:no-config`;
  }
  const cached = backgroundSignatureCache.get(cacheKey);
  if (cached && cached.config === config) {
    return cached.signature;
  }
  let signature: string;
  try {
    signature = `${backgroundKey || 'no-key'}:${stableStringify(config)}`;
  } catch (_) {
    const keyPart = (config as Record<string, unknown>)?.key ?? '';
    const themePart = (config as Record<string, unknown>)?.theme ?? '';
    const propsLength = Array.isArray((config as Record<string, unknown>)?.props)
      ? ((config as { props: unknown[] }).props.length)
      : 0;
    signature = `${backgroundKey || 'no-key'}:fallback:${String(keyPart)}:${String(themePart)}:${propsLength}`;
  }
  backgroundSignatureCache.set(cacheKey, { config, signature });
  return signature;
}

export function normalizeConfig(input: SessionConfigInput = {}): NormalizedSessionConfig {
  const deckNormalizationCache: DeckNormalizationCache = new WeakMap();
  const { scene, ...rest } = input;
  const out = { ...rest } as NormalizedSessionConfig;
  const sceneConfig: NonNullable<SessionConfigInput['scene']> = scene ?? {};
  if (typeof out.sceneTheme === 'undefined' && typeof sceneConfig.theme === 'string') {
    out.sceneTheme = sceneConfig.theme;
  }
  if (typeof out.backgroundKey === 'undefined') {
    if (typeof sceneConfig.backgroundKey === 'string') out.backgroundKey = sceneConfig.backgroundKey;
    else if (typeof sceneConfig.background === 'string') out.backgroundKey = sceneConfig.background;
  }
  for (const field of NORMALIZABLE_DECK_FIELDS) {
    const value = out[field];
    if (Array.isArray(value)) {
      out[field] = normalizeDeckEntriesCached(value, deckNormalizationCache);
    }
  }
  if (typeof out.collectionState === 'undefined') {
    out.collectionState = null;
  }
  if (out.aiPreset) {
    out.aiPreset = normalizeAiPresetDeckLists({ ...out.aiPreset }, deckNormalizationCache);
  }
  return out;
}

function isTurnOrderSide(value: unknown): value is TurnOrderSide {
  return value === 'ally' || value === 'enemy';
}

function resolveTurnOrderSides(rawSides: unknown): readonly TurnOrderSide[] {
  if (!Array.isArray(rawSides) || rawSides.length === 0) {
    return DEFAULT_TURN_ORDER_SIDES;
  }
  const sides: TurnOrderSide[] = [];
  for (let index = 0; index < rawSides.length; index += 1) {
    const side = rawSides[index];
    if (isTurnOrderSide(side)) sides.push(side);
  }
  return sides.length > 0 ? sides : DEFAULT_TURN_ORDER_SIDES;
}

function isPairScanTuple(entry: readonly unknown[]): entry is readonly [string, number] {
  return entry.length === 2 && typeof entry[0] === 'string' && Number.isFinite(entry[1]);
}

function hasSlotKey(value: { slot?: unknown; s?: unknown; index?: unknown }): boolean {
  return 'slot' in value || 's' in value || 'index' in value;
}

function isPairScanObject(
  entry: unknown,
): entry is TurnOrderPairScanSideObject | TurnOrderPairScanSlotObject {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
  const candidate = entry as { slot?: unknown; s?: unknown; index?: unknown };
  return hasSlotKey(candidate);
}

function isPairScanObjectWithSide(entry: unknown): entry is TurnOrderPairScanSideObject {
  if (!isPairScanObject(entry)) return false;
  const candidate = entry as { side?: unknown };
  return typeof candidate.side === 'string';
}

function isPairScanObjectWithoutSide(entry: unknown): entry is TurnOrderPairScanSlotObject {
  if (!isPairScanObject(entry)) return false;
  const candidate = entry as { side?: unknown };
  return typeof candidate.side !== 'string';
}

function parseSlotValue(entry: TurnOrderPairScanSideObject | TurnOrderPairScanSlotObject): number | null {
  return parseFiniteNumber(entry.slot ?? entry.s ?? entry.index);
}

function clampTurnOrderSlot(slot: number): number {
  const rounded = Math.round(slot);
  return Math.max(1, Math.min(9, rounded));
}

function pushTurnOrderForSides(output: TurnOrderEntry[], sides: readonly TurnOrderSide[], slot: number): void {
  const normalizedSlot = clampTurnOrderSlot(slot);
  for (let sideIndex = 0; sideIndex < sides.length; sideIndex += 1) {
    output.push({ side: sides[sideIndex], slot: normalizedSlot });
  }
}

function appendNormalizedPairScanEntry(
  output: TurnOrderEntry[],
  entry: TurnOrderPairScanEntry,
  sides: readonly TurnOrderSide[],
): void {
  if (typeof entry === 'number') {
    if (Number.isFinite(entry)) {
      pushTurnOrderForSides(output, sides, entry);
    }
    return;
  }

  if (Array.isArray(entry)) {
    if (isPairScanTuple(entry)) {
      const [, slot] = entry;
      const side: Side = entry[0] === 'enemy' ? 'enemy' : 'ally';
      output.push({ side, slot: clampTurnOrderSlot(slot) });
      return;
    }
    for (let index = 0; index < entry.length; index += 1) {
      const value = entry[index];
      if (typeof value === 'number' && Number.isFinite(value)) {
        pushTurnOrderForSides(output, sides, value);
      }
    }
    return;
  }

  if (isPairScanObjectWithSide(entry)) {
    const slot = parseSlotValue(entry);
    if (slot !== null) {
      const side: Side = entry.side === 'enemy' ? 'enemy' : 'ally';
      output.push({ side, slot: clampTurnOrderSlot(slot) });
    }
    return;
  }

  if (isPairScanObjectWithoutSide(entry)) {
    const slot = parseSlotValue(entry);
    if (slot !== null) pushTurnOrderForSides(output, sides, slot);
  }
}

function createSequentialTurnSnapshot(): TurnSnapshot {
  const { order, indexMap } = buildTurnOrder();
  return {
    mode: 'sequential',
    order,
    orderIndex: indexMap,
    cursor: 0,
    cycle: 0,
    busyUntil: 0,
  } satisfies TurnSnapshot;
}

export function buildTurnOrder(): { order: TurnOrderEntry[]; indexMap: Map<string, number> } {
  const cfg = CFG.turnOrder;
  const sides = resolveTurnOrderSides(cfg.sides);
  const order: TurnOrderEntry[] = [];
  const scan = Array.isArray(cfg.pairScan) ? cfg.pairScan : [];
  for (let index = 0; index < scan.length; index += 1) {
    appendNormalizedPairScanEntry(order, scan[index], sides);
  }
  if (!order.length) {
    for (const slot of TURN_ORDER_FALLBACK_SLOTS) {
      pushTurnOrderForSides(order, sides, slot);
    }
  }

  const indexMap = new Map<string, number>();
  for (let idx = 0; idx < order.length; idx += 1) {
    const entry = order[idx];
    if (!entry) continue;
    const key = `${entry.side}:${entry.slot}`;
    if (!indexMap.has(key)) indexMap.set(key, idx);
  }

  return { order, indexMap };
}

export function createSession(options: CreateSessionOptions = {}): SessionState {
  const normalized = normalizeConfig(options);
  const unitProgressById = mapUnitProgressById(normalized.collectionState ?? null);
  const modeKey = typeof normalized.modeKey === 'string' ? normalized.modeKey : null;
  const stageId = typeof (normalized as { stageId?: unknown }).stageId === 'string'
    ? String((normalized as { stageId?: unknown }).stageId)
    : null;
  const sceneCfg = getSceneConfig(CFG);
  const sceneTheme = normalized.sceneTheme
    ?? sceneCfg?.CURRENT_THEME
    ?? sceneCfg?.DEFAULT_THEME
    ?? null;
  const backgroundKey = normalized.backgroundKey
    ?? CFG.CURRENT_BACKGROUND
    ?? sceneCfg?.CURRENT_BACKGROUND
    ?? sceneCfg?.CURRENT_THEME
    ?? sceneCfg?.DEFAULT_THEME
    ?? null;

  const preferredPlayerDeck = getPreferredDeckEntries(normalized);
  const {
    hasPreferredDeck,
    autoPlayerDeck,
    lockedPlayerDeck,
    allyUnits,
  } = resolvePlayerDeck({
    preferredDeck: preferredPlayerDeck,
    fallbackSingleDeck: DEFAULT_SINGLE_UNIT_DECK,
    defaultRoster: DEFAULT_UNIT_ROSTER,
    unitProgressById,
  });

  const enemyPreset = normalized.aiPreset ?? null;
  const enemyUnits = resolveEnemyUnits({
    aiPreset: enemyPreset,
    preferredDeck: hasPreferredDeck ? preferredPlayerDeck : autoPlayerDeck,
    fallbackDeck: DEFAULT_FALLBACK_DECK,
    unitProgressById,
    collectionState: normalized.collectionState ?? null,
    modeKey,
    stageId,
  });

  const requestedTurnMode = normalized.turnMode
    ?? normalized.turn?.mode
    ?? normalized.turnOrderMode
    ?? normalized.turnOrder?.mode
    ?? getTurnOrderMode(CFG);
  const useInterleaved = requestedTurnMode === 'interleaved_by_position';
  const allyColsRaw = CFG.ALLY_COLS;
  const gridRowsRaw = CFG.GRID_ROWS;
  const allyCols = Number.isFinite(allyColsRaw) ? Math.max(1, Math.floor(allyColsRaw)) : 3;
  const gridRows = Number.isFinite(gridRowsRaw) ? Math.max(1, Math.floor(gridRowsRaw)) : 3;
  const slotsPerSide = Math.max(1, allyCols * gridRows);
  const initialTurnRng = createRngState(normalized.rngSeed);
  const randomStartSide = nextRngValue(initialTurnRng) < 0.5 ? 'ALLY' : 'ENEMY';

  const turnState: TurnSnapshot = useInterleaved
    ? {
      mode: 'interleaved_by_position',
      nextSide: randomStartSide,
      lastPos: { ALLY: 0, ENEMY: 0 },
      wrapCount: { ALLY: 0, ENEMY: 0 },
      turnCount: 0,
      slotCount: slotsPerSide,
      cycle: 0,
      busyUntil: 0,
    } satisfies TurnSnapshot
    : createSequentialTurnSnapshot();

  const aiState = buildAiState({
    preset: enemyPreset,
    unitsAll: enemyUnits,
    defaultCostCap: CFG.COST_CAP,
    defaultSummonLimit: CFG.SUMMON_LIMIT,
  });

  const costCap = parseFiniteNumber(normalized.costCap) ?? CFG.COST_CAP;
  const summonLimit = parseFiniteNumber(normalized.summonLimit) ?? CFG.SUMMON_LIMIT;
  const rngSeed = parseFiniteNumber(normalized.rngSeed) ?? undefined;

  return buildBaseState({
    modeKey,
    allyUnits,
    lockedPlayerDeck,
    costCap,
    summonLimit,
    sceneTheme,
    backgroundKey,
    turn: turnState,
    ai: aiState,
    unitProgressById,
    rngSeed,
  });
}

export function invalidateSceneCache(): void {
  sceneCache = null;
  clearBackgroundSignatureCache();
}

export function createSceneCacheCanvas(
  pixelWidth: number,
  pixelHeight: number,
  documentRef: Document | null,
): OffscreenCanvas | HTMLCanvasElement | null {
  if (!Number.isFinite(pixelWidth) || !Number.isFinite(pixelHeight)) return null;
  const safeW = Math.max(1, Math.floor(pixelWidth));
  const safeH = Math.max(1, Math.floor(pixelHeight));
  if (typeof OffscreenCanvas === 'function') {
    try {
      return new OffscreenCanvas(safeW, safeH);
    } catch (_) {
      // ignore and fall back
    }
  }
  const doc = documentRef || (typeof document !== 'undefined' ? document : null);
  if (!doc || typeof doc.createElement !== 'function') return null;
  const offscreen = doc.createElement('canvas');
  offscreen.width = safeW;
  offscreen.height = safeH;
  return offscreen;
}

export function ensureSceneCache(args: EnsureSceneCacheArgs): SceneCacheEntry | null {
  const { game, canvas, documentRef, camPreset } = args;
  if (!game?.grid) return null;
  if (typeof game.grid !== 'object') return null;
  const grid = game.grid as Parameters<typeof drawEnvironmentProps>[1];
  const gridDims = game.grid as { dpr?: number | null | undefined; w?: number | null | undefined; h?: number | null | undefined };
  const dprCandidate = Number(gridDims.dpr);
  const dprRaw = Number.isFinite(dprCandidate) && dprCandidate > 0 ? dprCandidate : 1;
  const cssWidth = typeof gridDims.w === 'number' ? gridDims.w : canvas ? canvas.width / dprRaw : 0;
  const cssHeight = typeof gridDims.h === 'number' ? gridDims.h : canvas ? canvas.height / dprRaw : 0;
  if (!cssWidth || !cssHeight) return null;
  const pixelWidth = Math.max(1, Math.round(cssWidth * dprRaw));
  const pixelHeight = Math.max(1, Math.round(cssHeight * dprRaw));

  const sceneCfg = getSceneConfig(CFG);
  const themeKey = game.sceneTheme ?? sceneCfg?.CURRENT_THEME ?? sceneCfg?.DEFAULT_THEME ?? null;
  const theme = themeKey ? sceneCfg?.THEMES?.[themeKey] ?? null : null;
  const backgroundKey = game.backgroundKey ?? null;
  const camPresetSignature = getCamPresetSignature(camPreset);

  const baseScene = getCachedBattlefieldScene(
    grid as Parameters<typeof getCachedBattlefieldScene>[0],
    theme,
    { width: cssWidth, height: cssHeight, dpr: dprRaw },
  );
  const baseKey = baseScene?.cacheKey ?? null;
  if (!baseScene) {
    sceneCache = null;
    return null;
  }
  const backgroundSignature = computeBackgroundSignature(backgroundKey);

  const cachedScene = sceneCache;
  const needsRebuild = !cachedScene
    || cachedScene.pixelWidth !== pixelWidth
    || cachedScene.pixelHeight !== pixelHeight
    || cachedScene.themeKey !== themeKey
    || cachedScene.backgroundKey !== backgroundKey
    || cachedScene.backgroundSignature !== backgroundSignature
    || cachedScene.dpr !== dprRaw
    || cachedScene.baseKey !== baseKey
    || cachedScene.camPresetSignature !== camPresetSignature
    || !cachedScene.includesGrid;

  if (!needsRebuild) return sceneCache;

  const offscreen = createSceneCacheCanvas(pixelWidth, pixelHeight, documentRef);
  if (!offscreen) return null;
  const cacheCtx = offscreen.getContext('2d');
  if (!cacheCtx) return null;

  if (typeof cacheCtx.resetTransform === 'function') {
    cacheCtx.resetTransform();
  } else if (typeof cacheCtx.setTransform === 'function') {
    cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
  }
  cacheCtx.clearRect(0, 0, pixelWidth, pixelHeight);

  try {
    cacheCtx.drawImage(baseScene.canvas as CanvasImageSource, 0, 0);
  } catch (err) {
    console.error('[scene-cache:base]', err);
    return null;
  }

  if (typeof cacheCtx.setTransform === 'function') {
    cacheCtx.setTransform(dprRaw, 0, 0, dprRaw, 0, 0);
  } else if (dprRaw !== 1 && typeof cacheCtx.scale === 'function') {
    cacheCtx.scale(dprRaw, dprRaw);
  }

  const drawCtx = cacheCtx as CanvasRenderingContext2D;
  try {
    drawEnvironmentProps(drawCtx, grid, camPreset, backgroundKey ?? undefined);
    drawGridOblique(drawCtx, grid, camPreset);
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
    dpr: dprRaw,
    baseKey,
    includesGrid: true,
    camPresetSignature,
  };
  return sceneCache;
}

export { backgroundSignatureCache as __backgroundSignatureCache };
const deckEntrySkeletonCache = new Map<string, SessionState['unitsAll'][number]>();
const MAX_PLAYER_DECK_SIZE = 10;

function resolveElementFromRecord(record: Record<string, unknown>): string {
  return normalizeElementKey(
    record.element
    ?? record.base_element
    ?? record.baseElement
    ?? record.nguyenTo
    ?? record.nguyen_to
    ?? record.he,
  ) ?? 'neutral';
}

function cloneDeckEntrySkeleton(entry: SessionState['unitsAll'][number]): SessionState['unitsAll'][number] {
  return {
    ...entry,
    art: entry.art ?? null,
    skinKey: entry.skinKey ?? null,
  } satisfies SessionState['unitsAll'][number];
}

function resolveUnitDeployCost(unitId: string): number | null {
  const normalizedId = normalizeUnitId(unitId);
  const unitDef = lookupUnit(normalizedId);
  const directCost = parseFiniteNumber(unitDef?.cost);
  if (directCost != null && directCost > 0) {
    return directCost;
  }

  const meta = getMetaById(normalizedId);
  if (!meta) {
    return null;
  }

  const metadataCost = parseFiniteNumber((meta as Record<string, unknown>).cost);
  if (metadataCost != null && metadataCost > 0) {
    return metadataCost;
  }

  const rank = typeof meta.rank === 'string' ? meta.rank : null;
  const className = typeof meta.class === 'string' ? meta.class : null;
  const budget = deriveBudgetFromRankRole(rank, className);
  const evaluated = evaluateCostBudget(budget);
  return Number.isFinite(evaluated.cost) && evaluated.cost > 0
    ? evaluated.cost
    : null;
}

function makeDeckEntrySkeleton(unitId: string): SessionState['unitsAll'][number] {
  const normalizedId = normalizeUnitId(unitId);
  const cached = deckEntrySkeletonCache.get(normalizedId);
  if (cached) return cloneDeckEntrySkeleton(cached);

  const unitDef = lookupUnit(normalizedId);
  const art = getUnitArt(normalizedId);
  const skeleton = {
    id: normalizedId,
    cost: resolveUnitDeployCost(normalizedId),
    name: typeof unitDef?.name === 'string' ? unitDef.name : null,
    art,
    skinKey: art?.skinKey ?? null,
  } satisfies SessionState['unitsAll'][number];
  deckEntrySkeletonCache.set(normalizedId, skeleton);
  return cloneDeckEntrySkeleton(skeleton);
}

function normalizeDeckEntry(entry: unknown): SessionState['unitsAll'][number] | null {
  if (!entry) return null;
  if (typeof entry === 'string') {
    return makeDeckEntrySkeleton(entry);
  }
  if (typeof entry !== 'object') return null;
  const candidate = entry as Record<string, unknown>;
  const idRaw = candidate.id;
  if (typeof idRaw !== 'string' || idRaw.trim() === '') return null;
  const skeleton = makeDeckEntrySkeleton(idRaw);
  const merged: SessionState['unitsAll'][number] & Record<string, unknown> = {
    ...skeleton,
    ...(candidate as SessionState['unitsAll'][number]),
    id: skeleton.id,
  };
  const costOverride = parseFiniteNumber(candidate.cost);
  merged.cost = costOverride ?? skeleton.cost ?? null;
  const nameCandidate = candidate.name;
  if (typeof nameCandidate === 'string' && nameCandidate.trim() !== '') {
    merged.name = nameCandidate;
  } else if (merged.name == null) {
    merged.name = skeleton.name ?? null;
  }
  if (merged.art == null) {
    merged.art = skeleton.art ?? null;
  }
  const normalizedClass = normalizeClassName(candidate.class);
  if (normalizedClass) {
    merged.class = normalizedClass;
  }

  const normalizedElement = resolveElementFromRecord(candidate);
  merged.element = normalizedElement;
  merged.base_element = normalizedElement;

  const metadataRaw = candidate.metadata;
  if (metadataRaw && typeof metadataRaw === 'object' && !Array.isArray(metadataRaw)) {
    const metadata = { ...(metadataRaw as Record<string, unknown>) };
    metadata.element = resolveElementFromRecord(metadata);

    if (metadata.elements != null) {
      metadata.elements = normalizeElementList(metadata.elements);
    }
    merged.metadata = metadata;
  }
  if (typeof merged.skinKey === 'string') {
    merged.skinKey = merged.skinKey.trim() !== '' ? merged.skinKey : merged.art?.skinKey ?? skeleton.skinKey ?? null;
  } else {
    merged.skinKey = merged.art?.skinKey ?? skeleton.skinKey ?? null;
  }
  return merged;
}

export function normalizeDeckEntries(value: unknown): SessionState['unitsAll'] {
  if (!Array.isArray(value)) return [];
  const normalized: SessionState['unitsAll'][number][] = [];
  const seenIds = new Set<string>();
  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    if (normalized.length >= MAX_PLAYER_DECK_SIZE) break;
    const entry = normalizeDeckEntry(item);
    if (!entry) continue;
    const unitId = entry.id;
    if (seenIds.has(unitId)) continue;
    seenIds.add(unitId);
    normalized.push(entry);
  }
  return normalized as SessionState['unitsAll'];
}