import type { CreateSessionOptions, SessionState } from '@shared-types/pve';
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
import { createSummonQueue } from '@shared-types/units';

import { CFG } from '../../config.ts';
import { UNITS, lookupUnit } from '../../units.ts';
import { metaServiceAdapter } from '../../meta.ts';
import { gameEvents } from '../../events.ts';
import { getEnvironmentBackground, drawEnvironmentProps } from '../../background.ts';
import { getCachedBattlefieldScene } from '../../scene.ts';
import { Statuses } from '../../statuses.ts';
import { getUnitArt } from '../../art.ts';
import { normalizeUnitId } from '../../utils/unit-id.ts';

void Statuses;

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

type TurnOrderEntry = { side: Side; slot: number };

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

function buildAiState(params: BuildAiStateParams): SessionState['ai'] {
  const { preset, unitsAll, defaultCostCap, defaultSummonLimit } = params;
  const costCapCandidate = preset?.costCap;
  const summonLimitCandidate = preset?.summonLimit;
  const startingDeck = Array.isArray(preset?.startingDeck) ? preset.startingDeck : null;
  const costCap = Number.isFinite(costCapCandidate)
    ? Number(costCapCandidate)
    : typeof costCapCandidate === 'number'
      ? costCapCandidate
      : defaultCostCap;
  const summonLimit = Number.isFinite(summonLimitCandidate)
    ? Number(summonLimitCandidate)
    : typeof summonLimitCandidate === 'number'
      ? summonLimitCandidate
      : defaultSummonLimit;
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

interface BuildBaseStateParams {
  modeKey: string | null;
  allyUnits: SessionState['unitsAll'];
  costCap: number;
  summonLimit: number;
  sceneTheme: string | null;
  backgroundKey: string | null;
  turn: TurnSnapshot;
  ai: SessionState['ai'];
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
    runtime: {
      encounter: null,
      wave: null,
      rewardQueue: [],
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
}

export interface EnsureSceneCacheArgs {
  game: SessionState | null;
  canvas: HTMLCanvasElement | OffscreenCanvas | null;
  documentRef: Document | null;
  camPreset: CameraPreset | undefined;
}

const backgroundSignatureCache = new Map<string, BackgroundCacheEntry>();
let sceneCache: SceneCacheEntry | null = null;

function stableStringify(value: unknown, seen: WeakSet<object> = new WeakSet()): string {
  if (value === null) return 'null';
  const type = typeof value;
  if (type === 'undefined') return 'undefined';
  if (type === 'number' || type === 'boolean' || type === 'bigint') return String(value);
  if (type === 'string') return JSON.stringify(value);
  if (type === 'symbol') return (value as symbol).toString();
  if (type === 'function') return `[Function:${(value as { name?: string }).name || 'anonymous'}]`;
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry, seen)).join(',')}]`;
  }
  if (type === 'object') {
    const objectValue = value as Record<string | number | symbol, unknown>;
    if (seen.has(objectValue)) return '"[Circular]"';
    seen.add(objectValue);
    const keys = Object.keys(objectValue).sort();
    const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key], seen)}`);
    seen.delete(objectValue);
    return `{${entries.join(',')}}`;
  }
  return String(value);
}

function normalizeBackgroundCacheKey(backgroundKey: string | null | undefined): string {
  return `key:${backgroundKey ?? '__no-key__'}`;
}

export function clearBackgroundSignatureCache(): void {
  backgroundSignatureCache.clear();
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
  if (Array.isArray(out.deck)) {
    out.deck = normalizeDeckEntries(out.deck);
  }
  if (out.aiPreset) {
    const preset = { ...out.aiPreset };
    if (Array.isArray(preset.deck)) preset.deck = normalizeDeckEntries(preset.deck);
    if (Array.isArray(preset.unitsAll)) preset.unitsAll = normalizeDeckEntries(preset.unitsAll);
    out.aiPreset = preset;
  }
  return out;
}

function isTurnOrderSide(value: unknown): value is TurnOrderSide {
  return value === 'ally' || value === 'enemy';
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
  const raw = entry.slot ?? entry.s ?? entry.index;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function clampTurnOrderSlot(slot: number): number {
  const rounded = Math.round(slot);
  return Math.max(1, Math.min(9, rounded));
}

function normalizePairScanEntry(
  entry: TurnOrderPairScanEntry,
  sides: readonly TurnOrderSide[],
): TurnOrderEntry[] {
  const normalized: TurnOrderEntry[] = [];
  const pushPair = (side: TurnOrderSide, slot: number): void => {
    normalized.push({ side, slot: clampTurnOrderSlot(slot) });
  };
  const pushForSides = (slot: number, targetSides?: readonly TurnOrderSide[]): void => {
    const resolvedSides = targetSides && targetSides.length ? targetSides : sides;
    for (const side of resolvedSides) {
      pushPair(side, slot);
    }
  };

  if (typeof entry === 'number') {
    if (Number.isFinite(entry)) pushForSides(entry);
    return normalized;
  }

  if (Array.isArray(entry)) {
    if (isPairScanTuple(entry)) {
      const [, slot] = entry;
      const side: Side = entry[0] === 'enemy' ? 'enemy' : 'ally';
      pushPair(side, slot);
      return normalized;
    }
    for (const value of entry) {
      if (typeof value === 'number' && Number.isFinite(value)) pushForSides(value);
    }
    return normalized;
  }

  if (isPairScanObjectWithSide(entry)) {
    const slot = parseSlotValue(entry);
    if (slot !== null) {
      const side: Side = entry.side === 'enemy' ? 'enemy' : 'ally';
      pushPair(side, slot);
    }
    return normalized;
  }

  if (isPairScanObjectWithoutSide(entry)) {
    const slot = parseSlotValue(entry);
    if (slot !== null) pushForSides(slot);
  }

  return normalized;
}

export function buildTurnOrder(): { order: TurnOrderEntry[]; indexMap: Map<string, number> } {
  const cfg = CFG.turnOrder;
  const rawSides = Array.isArray(cfg.sides) ? cfg.sides : null;
  const sides = rawSides && rawSides.length
    ? rawSides.filter((side: unknown): side is TurnOrderSide => isTurnOrderSide(side))
    : (['ally', 'enemy'] as const satisfies ReadonlyArray<TurnOrderSide>);
  const order: TurnOrderEntry[] = [];
  const scan = Array.isArray(cfg.pairScan) ? [...cfg.pairScan] : [];
  for (const entry of scan) {
    const normalized = normalizePairScanEntry(entry, sides);
    if (normalized.length) order.push(...normalized);
  }
  if (!order.length) {
    const fallback = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
    for (const slot of fallback) {
      order.push(...normalizePairScanEntry(slot, sides));
    }
  }

  const indexMap = new Map<string, number>();
  order.forEach((entry, idx) => {
    const key = `${entry.side}:${entry.slot}`;
    if (!indexMap.has(key)) indexMap.set(key, idx);
  });

  return { order, indexMap };
}

export function createSession(options: CreateSessionOptions = {}): SessionState {
  const normalized = normalizeConfig(options);
  const modeKey = typeof normalized.modeKey === 'string' ? normalized.modeKey : null;
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

  const allyUnits: SessionState['unitsAll'] =
    Array.isArray(normalized.deck) && normalized.deck.length
      ? Array.from(normalized.deck)
      : Array.from(DEFAULT_UNIT_ROSTER);

  const enemyPreset = normalized.aiPreset ?? null;
  const enemyUnits: SessionState['ai']['unitsAll'] =
    Array.isArray(enemyPreset?.deck) && enemyPreset.deck.length
      ? Array.from(enemyPreset.deck)
      : Array.isArray(enemyPreset?.unitsAll) && enemyPreset.unitsAll.length
        ? Array.from(enemyPreset.unitsAll)
        : Array.from(DEFAULT_UNIT_ROSTER);

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

  const buildTurnState = (): TurnSnapshot => {
    if (useInterleaved) {
      return {
        mode: 'interleaved_by_position',
        nextSide: 'ALLY',
        lastPos: { ALLY: 0, ENEMY: 0 },
        wrapCount: { ALLY: 0, ENEMY: 0 },
        turnCount: 0,
        slotCount: slotsPerSide,
        cycle: 0,
        busyUntil: 0,
      } satisfies TurnSnapshot;
    }
    const { order, indexMap } = buildTurnOrder();
    return {
      mode: 'sequential',
      order,
      orderIndex: indexMap,
      cursor: 0,
      cycle: 0,
      busyUntil: 0,
    } satisfies TurnSnapshot;
  };

  const aiState = buildAiState({
    preset: enemyPreset,
    unitsAll: enemyUnits,
    defaultCostCap: CFG.COST_CAP,
    defaultSummonLimit: CFG.SUMMON_LIMIT,
  });

  const costCap = Number.isFinite(normalized.costCap)
    ? Number(normalized.costCap)
    : CFG.COST_CAP;
  const summonLimit = Number.isFinite(normalized.summonLimit)
    ? Number(normalized.summonLimit)
    : CFG.SUMMON_LIMIT;

  return buildBaseState({
    modeKey,
    allyUnits,
    costCap,
    summonLimit,
    sceneTheme,
    backgroundKey,
    turn: buildTurnState(),
    ai: aiState,
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
  const backgroundSignature = computeBackgroundSignature(backgroundKey);

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

  let needsRebuild = false;
  if (!sceneCache) needsRebuild = true;
  else if (sceneCache.pixelWidth !== pixelWidth || sceneCache.pixelHeight !== pixelHeight) needsRebuild = true;
  else if (sceneCache.themeKey !== themeKey || sceneCache.backgroundKey !== backgroundKey) needsRebuild = true;
  else if (sceneCache.backgroundSignature !== backgroundSignature) needsRebuild = true;
  else if (sceneCache.dpr !== dprRaw) needsRebuild = true;
  else if (sceneCache.baseKey !== baseKey) needsRebuild = true;

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

  try {
    drawEnvironmentProps(cacheCtx, grid, camPreset, backgroundKey ?? undefined);
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
  };
  return sceneCache;
}

export { backgroundSignatureCache as __backgroundSignatureCache };
function toFiniteCost(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function makeDeckEntrySkeleton(unitId: string): SessionState['unitsAll'][number] {
  const unitDef = lookupUnit(unitId);
  const art = getUnitArt(unitId);
  return {
    id: unitId,
    cost: toFiniteCost(unitDef?.cost) ?? null,
    name: typeof unitDef?.name === 'string' ? unitDef.name : null,
    art,
    skinKey: art?.skinKey ?? null,
  } satisfies SessionState['unitsAll'][number];
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
  const merged = { ...skeleton, ...(candidate as SessionState['unitsAll'][number]), id: idRaw };
  const costOverride = toFiniteCost(candidate.cost);
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
  for (const item of value) {
    const entry = normalizeDeckEntry(item);
    if (entry) normalized.push(entry);
  }
  return normalized as SessionState['unitsAll'];
}