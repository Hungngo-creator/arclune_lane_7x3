import type { CreateSessionOptions, SessionState } from '@types/pve';
import type { CameraPreset } from '@types/config';
import type { TurnSnapshot } from '@types/turn-order';
import type { QueuedSummonState, ActionChainEntry } from '@types/units';

import { CFG } from '../../config.js';
import { UNITS } from '../../units.ts';
import { Meta } from '../../meta.js';
import { gameEvents } from '../../events.ts';
import { getEnvironmentBackground, drawEnvironmentProps } from '../../background.js';
import { getCachedBattlefieldScene } from '../../scene.js';
import { Statuses } from '../../statuses.ts';

void Statuses;

type SessionConfigInput = Partial<
  CreateSessionOptions & {
    scene?: {
      theme?: string;
      backgroundKey?: string;
      background?: string;
      [extra: string]: unknown;
    };
    [extra: string]: unknown;
  }
>;

export type NormalizedSessionConfig = (CreateSessionOptions & {
  sceneTheme?: string;
  backgroundKey?: string;
}) & Record<string, unknown>;

type TurnOrderEntry = { side: 'ally' | 'enemy'; slot: number };

type BackgroundConfig = ReturnType<typeof getEnvironmentBackground>;

type BackgroundCacheEntry = {
  config: BackgroundConfig;
  signature: string;
};

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
  if (type === 'symbol') return value.toString();
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
  const out = { ...(input as Record<string, unknown>) } as NormalizedSessionConfig & {
    scene?: {
      theme?: string;
      backgroundKey?: string;
      background?: string;
      [extra: string]: unknown;
    };
  };
  const scene = (input.scene ?? {}) as {
    theme?: string;
    backgroundKey?: string;
    background?: string;
  };
  if (typeof out.sceneTheme === 'undefined' && typeof scene.theme !== 'undefined') {
    out.sceneTheme = scene.theme;
  }
  if (typeof out.backgroundKey === 'undefined') {
    if (typeof scene.backgroundKey !== 'undefined') out.backgroundKey = scene.backgroundKey;
    else if (typeof scene.background !== 'undefined') out.backgroundKey = scene.background;
  }
  delete (out as Record<string, unknown>).scene;
  return out;
}

export function buildTurnOrder(): { order: TurnOrderEntry[]; indexMap: Map<string, number> } {
  const cfg = (CFG as Record<string, unknown>).turnOrder as
    | { sides?: unknown; pairScan?: unknown }
    | undefined
    | null;
  const rawSides = Array.isArray(cfg?.sides) ? cfg?.sides : null;
  const sides = rawSides && rawSides.length
    ? (rawSides.filter((s) => s === 'ally' || s === 'enemy') as Array<'ally' | 'enemy'>)
    : ['ally', 'enemy'];
  const order: TurnOrderEntry[] = [];
  const addPair = (side: unknown, slot: unknown): void => {
    if (side !== 'ally' && side !== 'enemy') return;
    const num = Number(slot);
    if (!Number.isFinite(num)) return;
    const safeSlot = Math.max(1, Math.min(9, Math.round(num)));
    order.push({ side, slot: safeSlot });
  };
  const appendSlots = (slot: unknown): void => {
    for (const side of sides) {
      addPair(side, slot);
    }
  };

  const scan = Array.isArray(cfg?.pairScan) ? cfg?.pairScan : null;
  if (scan && scan.length) {
    for (const entry of scan) {
      if (typeof entry === 'number') {
        appendSlots(entry);
        continue;
      }
      if (Array.isArray(entry)) {
        if (entry.length === 2 && typeof entry[0] === 'string' && Number.isFinite(entry[1])) {
          addPair(entry[0] === 'enemy' ? 'enemy' : 'ally', entry[1]);
        } else {
          for (const val of entry) {
            if (typeof val === 'number') appendSlots(val);
          }
        }
        continue;
      }
      if (entry && typeof entry === 'object') {
        const candidate = entry as { side?: string; slot?: unknown; s?: unknown; index?: unknown };
        const slot = Number(candidate.slot ?? candidate.s ?? candidate.index);
        if (typeof candidate.side === 'string' && Number.isFinite(slot)) {
          addPair(candidate.side === 'enemy' ? 'enemy' : 'ally', slot);
        } else if (Number.isFinite(slot)) {
          appendSlots(slot);
        }
      }
    }
  }

  if (!order.length) {
    const fallback = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (const slot of fallback) appendSlots(slot);
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
  const sceneTheme = normalized.sceneTheme
    ?? (CFG as Record<string, any>).SCENE?.CURRENT_THEME
    ?? (CFG as Record<string, any>).SCENE?.DEFAULT_THEME;
  const backgroundKey = normalized.backgroundKey
    ?? (CFG as Record<string, any>).CURRENT_BACKGROUND
    ?? (CFG as Record<string, any>).SCENE?.CURRENT_BACKGROUND
    ?? (CFG as Record<string, any>).SCENE?.CURRENT_THEME
    ?? (CFG as Record<string, any>).SCENE?.DEFAULT_THEME;

  const allyUnits = (Array.isArray(normalized.deck) && normalized.deck.length
    ? normalized.deck
    : (UNITS as unknown)) as SessionState['unitsAll'];
  const enemyPreset = (normalized.aiPreset ?? {}) as {
    deck?: ReadonlyArray<string>;
    unitsAll?: ReadonlyArray<string>;
    costCap?: number;
    summonLimit?: number;
    startingDeck?: ReadonlyArray<unknown>;
  };
  const enemyUnits = (Array.isArray(enemyPreset.deck) && enemyPreset.deck.length
    ? enemyPreset.deck
    : (Array.isArray(enemyPreset.unitsAll) && enemyPreset.unitsAll.length ? enemyPreset.unitsAll : (UNITS as unknown))) as SessionState['unitsAll'];

  const requestedTurnMode = normalized.turnMode
    ?? normalized.turn?.mode
    ?? normalized.turnOrderMode
    ?? normalized.turnOrder?.mode
    ?? (CFG as Record<string, any>)?.turnOrder?.mode;
  const useInterleaved = requestedTurnMode === 'interleaved_by_position';
  const allyColsRaw = (CFG as Record<string, any>)?.ALLY_COLS;
  const gridRowsRaw = (CFG as Record<string, any>)?.GRID_ROWS;
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
      order,
      orderIndex: indexMap,
      cursor: 0,
      cycle: 0,
      busyUntil: 0,
    } satisfies TurnSnapshot;
  };

  const game = {
    modeKey,
    grid: null,
    tokens: [],
    cost: 0,
    costCap: Number.isFinite(normalized.costCap) ? Number(normalized.costCap) : (CFG as Record<string, any>).COST_CAP,
    summoned: 0,
    summonLimit: Number.isFinite(normalized.summonLimit)
      ? Number(normalized.summonLimit)
      : (CFG as Record<string, any>).SUMMON_LIMIT,
    battle: {
      over: false,
      winner: null,
      reason: null,
      detail: null,
      finishedAt: 0,
      result: null,
    },
    result: null,
    unitsAll: allyUnits,
    usedUnitIds: new Set(),
    deck3: [],
    selectedId: null,
    ui: { bar: null },
    turn: buildTurnState(),
    queued: { ally: new Map(), enemy: new Map() } as QueuedSummonState,
    actionChain: [] as ActionChainEntry[],
    events: gameEvents,
    sceneTheme,
    backgroundKey,
    runtime: {
      encounter: null,
      wave: null,
      rewardQueue: [],
    },
  } as SessionState;

  game.ai = {
    cost: 0,
    costCap: Number.isFinite(enemyPreset.costCap)
      ? Number(enemyPreset.costCap)
      : (enemyPreset.costCap ?? (CFG as Record<string, any>).COST_CAP),
    summoned: 0,
    summonLimit: Number.isFinite(enemyPreset.summonLimit)
      ? Number(enemyPreset.summonLimit)
      : (enemyPreset.summonLimit ?? (CFG as Record<string, any>).SUMMON_LIMIT),
    unitsAll: enemyUnits,
    usedUnitIds: new Set(),
    deck: Array.isArray(enemyPreset.startingDeck) ? enemyPreset.startingDeck.slice() : [],
    selectedId: null,
    lastThinkMs: 0,
    lastDecision: null,
  } as SessionState['ai'];

  game.meta = Meta;
  return game;
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
  const grid = game.grid as Record<string, any>;
  const sceneCfg = ((CFG as Record<string, any>).SCENE ?? {}) as Record<string, any>;
  const themeKey = game.sceneTheme ?? sceneCfg.CURRENT_THEME ?? sceneCfg.DEFAULT_THEME;
  const theme = themeKey ? sceneCfg.THEMES?.[themeKey] ?? null : null;
  const backgroundKey = game.backgroundKey;
  const backgroundSignature = computeBackgroundSignature(backgroundKey ?? null);
  const dprRaw = Number.isFinite(grid.dpr) && grid.dpr > 0 ? Number(grid.dpr) : 1;
  const cssWidth = grid.w ?? (canvas ? (canvas.width as number) / dprRaw : 0);
  const cssHeight = grid.h ?? (canvas ? (canvas.height as number) / dprRaw : 0);
  if (!cssWidth || !cssHeight) return null;
  const pixelWidth = Math.max(1, Math.round(cssWidth * dprRaw));
  const pixelHeight = Math.max(1, Math.round(cssHeight * dprRaw));

  const baseScene = getCachedBattlefieldScene(grid, theme, { width: cssWidth, height: cssHeight, dpr: dprRaw });
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