import { CFG } from './config.ts';
import { ensureSpriteLoaded, projectCellOblique } from './engine.ts';

import type {
  BackgroundConfig,
  BackgroundDefinitionConfig,
  BackgroundFallback,
  BackgroundPalette,
  BackgroundPropConfig,
} from '@shared-types/config';

type GridSpec = Parameters<typeof projectCellOblique>[0];
type CameraOptions = Parameters<typeof projectCellOblique>[3];
type SpriteCacheEntry = ReturnType<typeof ensureSpriteLoaded>;
type EnsureSpriteArg = Parameters<typeof ensureSpriteLoaded>[0];

const ENVIRONMENT_SPRITE_CACHE = new Map<string, SpriteCacheEntry | null>();

function ensureEnvironmentSprite(asset: string): SpriteCacheEntry | null {
  if (!asset) return null;
  const cached = ENVIRONMENT_SPRITE_CACHE.get(asset);
  if (cached !== undefined) return cached;
  const descriptor = {
    sprite: {
      src: asset,
      key: asset,
      anchor: 1,
      scale: 1,
      aspect: null,
      shadow: null,
      skinId: null,
      cacheKey: asset,
    },
  } as EnsureSpriteArg;
  const entry = ensureSpriteLoaded(descriptor) ?? null;
  ENVIRONMENT_SPRITE_CACHE.set(asset, entry);
  return entry;
}

type EnvironmentPropDefaults = {
  asset?: string | null;
  size?: { w: number; h: number };
  anchor?: { x: number; y: number };
  baseLift?: number;
  fallback?: BackgroundFallback | null;
  palette?: BackgroundPalette | null;
};

interface NormalizedPropConfig {
  type: string | null;
  asset: string | null;
  fallback: BackgroundFallback | null;
  palette: BackgroundPalette;
  anchor: { x: number; y: number };
  size: { w: number; h: number };
  cell: { cx: number; cy: number };
  depth: number;
  baseLift: number;
  offset: { x: number; y: number };
  pixelOffset: { x: number; y: number };
  scale: number;
  alpha: number;
  flip: number;
  sortBias: number;
}

interface NormalizedPropEntry {
  prop: NormalizedPropConfig;
  base: { cx: number; cyWithDepth: number };
  spriteEntry: SpriteCacheEntry | null;
}

interface DrawableEntry {
  prop: NormalizedPropConfig;
  x: number;
  y: number;
  scale: number;
  spriteEntry: SpriteCacheEntry | null;
  sortY: number;
}

interface BoardState {
  signature: string;
  drawables: DrawableEntry[];
}

interface BackgroundPropCacheEntry {
  signature: string;
  normalizedProps: NormalizedPropEntry[];
  boardStates: Map<string, BoardState>;
}

const BACKGROUND_PROP_CACHE: WeakMap<BackgroundDefinitionConfig, BackgroundPropCacheEntry> = new WeakMap();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const toNumberOr = (value: unknown, fallback: number): number => (isFiniteNumber(value) ? value : fallback);

const toOptionalNumber = (value: unknown): number | undefined => (isFiniteNumber(value) ? value : undefined);

const mergePalette = (
  ...palettes: Array<BackgroundPalette | null | undefined>
): BackgroundPalette => {
  const result: BackgroundPalette = {};
  for (const palette of palettes) {
    if (!palette || !isRecord(palette)) continue;
    if (typeof palette.primary === 'string') result.primary = palette.primary;
    if (typeof palette.secondary === 'string') result.secondary = palette.secondary;
    if (typeof palette.accent === 'string') result.accent = palette.accent;
    if (typeof palette.shadow === 'string') result.shadow = palette.shadow;
    if (typeof palette.outline === 'string') result.outline = palette.outline;
  }
  return result;
};

const cloneFallback = (fallback: BackgroundFallback | null | undefined): BackgroundFallback | null => {
  if (!fallback || !isRecord(fallback)) return null;
  const clone: BackgroundFallback = {};
  if (typeof fallback.shape === 'string') clone.shape = fallback.shape;
  return clone;
};

const normalizeVector = (
  value: unknown,
  fallbackX: number,
  fallbackY: number,
): { x: number; y: number } => {
  const record = isRecord(value) ? value : {};
  return {
    x: toNumberOr(record.x, fallbackX),
    y: toNumberOr(record.y, fallbackY),
  };
};

const normalizeSize = (
  value: unknown,
  fallbackW: number,
  fallbackH: number,
): { w: number; h: number } => {
  const record = isRecord(value) ? value : {};
  return {
    w: toNumberOr(record.w, fallbackW),
    h: toNumberOr(record.h, fallbackH),
  };
};

const hasOwn = <Obj extends object, Key extends PropertyKey>(
  obj: Obj,
  key: Key,
): key is Key & keyof Obj => Object.prototype.hasOwnProperty.call(obj, key);

export const SCENERY = {
  'stone-obelisk': {
    asset: 'dist/assets/environment/stone-obelisk.svg',
    size: { w: 120, h: 220 },
    anchor: { x: 0.5, y: 1 },
    baseLift: 0.52,
    fallback: { shape: 'obelisk' },
    palette: {
      primary: '#d6e2fb',
      secondary: '#7d8ba9',
      accent: '#f7fbff',
      shadow: '#2c3346',
      outline: 'rgba(16,20,32,0.78)',
    },
  },
  'sun-banner': {
    asset: 'dist/assets/environment/sun-banner.svg',
    size: { w: 140, h: 200 },
    anchor: { x: 0.5, y: 1 },
    baseLift: 0.56,
    fallback: { shape: 'banner' },
    palette: {
      primary: '#ffe3a6',
      secondary: '#d47b3a',
      accent: '#fff4d1',
      shadow: '#6d3218',
      outline: 'rgba(46,23,11,0.78)',
    },
  },
} as const satisfies Record<string, EnvironmentPropDefaults>;

export type SceneryKey = keyof typeof SCENERY;

export const ENVIRONMENT_PROP_TYPES: Record<SceneryKey, EnvironmentPropDefaults> = SCENERY;

const isSceneryKey = (value: unknown): value is SceneryKey =>
  typeof value === 'string' && hasOwn(SCENERY, value);

const normalizePropInput = (value: unknown): BackgroundPropConfig | null => {
  if (!isRecord(value)) return null;
  const type = typeof value.type === 'string' ? value.type : null;
  if (!type) return null;

  const cellRecord = isRecord(value.cell) ? value.cell : {};
  const cx = toNumberOr(value.cx ?? cellRecord.cx, 0);
  const cy = toNumberOr(value.cy ?? cellRecord.cy, 0);
  const depth = toOptionalNumber((cellRecord as { depth?: unknown }).depth ?? value.depth);

  const prop: BackgroundPropConfig = {
    ...(value as BackgroundPropConfig),
    type,
    cell: { cx, cy, ...(depth !== undefined ? { depth } : {}) },
    asset: typeof value.asset === 'string' ? value.asset : null,
    fallback: cloneFallback(value.fallback as BackgroundFallback | null | undefined),
    palette: mergePalette(value.palette as BackgroundPalette | null | undefined),
    anchor: isRecord(value.anchor) ? { ...value.anchor } : null,
    size: isRecord(value.size) ? { ...value.size } : null,
    baseLift: toOptionalNumber(value.baseLift),
    pixelOffset: isRecord(value.pixelOffset) ? { ...value.pixelOffset } : null,
    cx: toOptionalNumber(value.cx),
    cy: toOptionalNumber(value.cy),
  };

  return prop;
};

const normalizeBackgroundDefinition = (value: unknown): BackgroundDefinitionConfig | null => {
  if (!isRecord(value)) return null;
  const propsInput = Array.isArray(value.props) ? value.props : [];
  const props: BackgroundPropConfig[] = [];
  for (const prop of propsInput) {
    const normalized = normalizePropInput(prop);
    if (normalized) props.push(normalized);
  }
  return { props } satisfies BackgroundDefinitionConfig;
};

let BACKGROUND_CONFIG_MAP: Map<string, BackgroundDefinitionConfig> | null = null;

function getBackgroundConfigMap(): Map<string, BackgroundDefinitionConfig> {
  if (BACKGROUND_CONFIG_MAP) return BACKGROUND_CONFIG_MAP;
  const map = new Map<string, BackgroundDefinitionConfig>();
  const entries = CFG.BACKGROUNDS && typeof CFG.BACKGROUNDS === 'object'
    ? Object.entries(CFG.BACKGROUNDS)
    : [];
  for (const [key, entry] of entries) {
    const normalized = normalizeBackgroundDefinition(entry);
    if (normalized) {
      map.set(key, normalized);
    }
  }
  BACKGROUND_CONFIG_MAP = map;
  return map;
}

function stableStringify(value: unknown, seen: WeakSet<object> = new WeakSet()): string {
  if (value === null) return 'null';
  const type = typeof value;
  if (type === 'undefined') return 'undefined';
  if (type === 'number' || type === 'boolean' || type === 'bigint') return String(value);
  if (type === 'string') return JSON.stringify(value);
  if (type === 'symbol') return value.toString();
  if (type === 'function') {
    const func = value as { name?: string };
    return `[Function:${func.name || 'anonymous'}]`;
  }
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

function computePropsSignature(props: ReadonlyArray<BackgroundPropConfig> | null | undefined): string {
  if (!props || !props.length) return 'len:0';
  try {
    return stableStringify(props);
  } catch {
    return `len:${props.length}`;
  }
}

function getBoardSignature(g: GridSpec | null | undefined, cam: CameraOptions | null | undefined): string {
  if (!g) return 'no-grid';
  const baseParts = [
    g.cols,
    g.rows,
    g.tile,
    g.ox,
    g.oy,
    g.w,
    g.h,
    g.pad,
    g.dpr,
  ];
  const camParts = [
    cam?.rowGapRatio ?? 'rg',
    cam?.topScale ?? 'ts',
    cam?.depthScale ?? 'ds',
  ];
  return [...baseParts, ...camParts].join('|');
}

function resolveBackground(backgroundKey: string | null | undefined): { key: string; config: BackgroundDefinitionConfig } | null {
  const backgrounds = getBackgroundConfigMap();
  if (backgrounds.size === 0) return null;

  const tryResolve = (key: string | null | undefined): { key: string; config: BackgroundDefinitionConfig } | null => {
    if (!key) return null;
    const config = backgrounds.get(key);
    return config ? { key, config } : null;
  };

  const direct = tryResolve(backgroundKey ?? null);
  if (direct) return direct;

  const preferred = typeof CFG.CURRENT_BACKGROUND === 'string'
    ? CFG.CURRENT_BACKGROUND
    : typeof CFG.SCENE?.CURRENT_BACKGROUND === 'string'
      ? CFG.SCENE?.CURRENT_BACKGROUND
      : null;
  const preferredMatch = tryResolve(preferred);
  if (preferredMatch) return preferredMatch;

  const themeKey = typeof CFG.SCENE?.CURRENT_THEME === 'string'
    ? CFG.SCENE?.CURRENT_THEME
    : typeof CFG.SCENE?.DEFAULT_THEME === 'string'
      ? CFG.SCENE?.DEFAULT_THEME
      : null;
  const themeMatch = tryResolve(themeKey);
  if (themeMatch) return themeMatch;

  const firstEntry = backgrounds.entries().next();
  if (!firstEntry.done) {
    const [key, config] = firstEntry.value;
    return { key, config };
  }
  return null;
}

function normalizePropConfig(propCfg: BackgroundPropConfig | null | undefined): NormalizedPropConfig | null {
  if (!propCfg) return null;
  const typeId = typeof propCfg.type === 'string' ? propCfg.type : null;
  const typeKey = typeId && isSceneryKey(typeId) ? typeId : null;
  const typeDef = typeKey ? ENVIRONMENT_PROP_TYPES[typeKey] : null;
  const anchorDefaults = typeDef?.anchor ?? null;
  const sizeDefaults = typeDef?.size ?? null;
  const anchor = normalizeVector(propCfg.anchor, anchorDefaults?.x ?? 0.5, anchorDefaults?.y ?? 1);
  const size = normalizeSize(propCfg.size, sizeDefaults?.w ?? 120, sizeDefaults?.h ?? 180);
  const palette = mergePalette(typeDef?.palette ?? null, propCfg.palette ?? null);
  const cellCx = toNumberOr(propCfg.cx ?? propCfg.cell?.cx, 0);
  const cellCy = toNumberOr(propCfg.cy ?? propCfg.cell?.cy, 0);
  const depth = toNumberOr(propCfg.cell?.depth ?? propCfg.depth, 0);
  return {
    type: typeId,
    asset: typeof propCfg.asset === 'string' ? propCfg.asset : typeDef?.asset ?? null,
    fallback: cloneFallback(propCfg.fallback) ?? cloneFallback(typeDef?.fallback) ?? null,
    palette,
    anchor,
    size,
    cell: { cx: cellCx, cy: cellCy },
    depth,
    baseLift: toNumberOr(propCfg.baseLift, typeDef?.baseLift ?? 0.5),
    offset: {
      x: toNumberOr(propCfg.offset?.x, 0),
      y: toNumberOr(propCfg.offset?.y, 0),
    },
    pixelOffset: {
      x: toNumberOr(propCfg.pixelOffset?.x, 0),
      y: toNumberOr(propCfg.pixelOffset?.y, 0),
    },
    scale: toNumberOr(propCfg.scale, 1),
    alpha: toNumberOr(propCfg.alpha, 1),
    flip: toNumberOr(propCfg.flip, 1),
    sortBias: toNumberOr(propCfg.sortBias, 0),
  };
}

function getBackgroundPropCache(config: BackgroundDefinitionConfig | null): BackgroundPropCacheEntry | null {
  if (!config) return null;
  const props = Array.isArray(config.props) ? config.props : [];
  const signature = computePropsSignature(props);
  let cache = BACKGROUND_PROP_CACHE.get(config);
  if (!cache || cache.signature !== signature) {
    const normalizedProps: NormalizedPropEntry[] = [];
    for (const rawProp of props) {
      const prop = normalizePropConfig(rawProp);
      if (!prop) continue;
      const cyWithDepth = prop.cell.cy + prop.depth;
      const spriteEntry = ensureEnvironmentSprite(prop.asset ?? '');
      normalizedProps.push({
        prop,
        base: {
          cx: prop.cell.cx,
          cyWithDepth,
        },
        spriteEntry,
      });
    }
    cache = {
      signature,
      normalizedProps,
      boardStates: new Map<string, BoardState>(),
    };
    BACKGROUND_PROP_CACHE.set(config, cache);
  }
  return cache;
}

function buildBoardState(
  normalizedProps: readonly NormalizedPropEntry[],
  g: GridSpec | null | undefined,
  cam: CameraOptions | null | undefined,
): BoardState | undefined {
  if (!g) return undefined;
  const rowGap = ((cam?.rowGapRatio) ?? 0.62) * g.tile;
  const drawables: DrawableEntry[] = [];
  for (const entry of normalizedProps) {
    if (!entry?.prop) continue;
    const { prop, base } = entry;
    const projection = projectCellOblique(g, base.cx, base.cyWithDepth, cam);
    const scale = projection.scale * prop.scale;
    const spriteEntry = entry.spriteEntry ?? ensureEnvironmentSprite(prop.asset ?? '');
    entry.spriteEntry = spriteEntry;
    drawables.push({
      prop,
      x: projection.x + prop.offset.x * g.tile + prop.pixelOffset.x,
      y: projection.y + prop.baseLift * rowGap + prop.offset.y * rowGap + prop.pixelOffset.y,
      scale,
      spriteEntry,
      sortY: projection.y + prop.sortBias,
    });
  }
  drawables.sort((a, b) => a.sortY - b.sortY);
  return {
    signature: getBoardSignature(g, cam),
    drawables,
  };
}

function drawFallback(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  anchor: { x?: number | null; y?: number | null },
  palette: BackgroundPalette,
  fallback: BackgroundFallback | null,
): void {
  const primary = palette?.primary || '#ccd7ec';
  const secondary = palette?.secondary || '#7b86a1';
  const accent = palette?.accent || '#f4f7ff';
  const shadow = palette?.shadow || 'rgba(18,22,34,0.65)';
  const outline = palette?.outline || 'rgba(12,18,28,0.9)';
  const top = -height * (anchor?.y ?? 1);
  const bottom = top + height;
  const halfW = width / 2;
  ctx.save();
  ctx.beginPath();
  switch (fallback?.shape) {
    case 'banner': {
      ctx.moveTo(-halfW * 0.65, top + height * 0.08);
      ctx.lineTo(halfW * 0.65, top + height * 0.08);
      ctx.lineTo(halfW * 0.65, bottom - height * 0.35);
      ctx.lineTo(0, bottom);
      ctx.lineTo(-halfW * 0.65, bottom - height * 0.35);
      ctx.closePath();
      ctx.fillStyle = primary;
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.lineWidth = Math.max(2, width * 0.05);
      ctx.stroke();
      ctx.fillStyle = secondary;
      ctx.fillRect(-halfW * 0.65, top + height * 0.02, halfW * 1.3, height * 0.12);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(0, top + height * 0.38, width * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = shadow;
      ctx.lineWidth = Math.max(2, width * 0.04);
      ctx.stroke();
      break;
    }
    case 'obelisk':
    default: {
      ctx.moveTo(0, top);
      ctx.lineTo(halfW * 0.7, top + height * 0.12);
      ctx.lineTo(halfW * 0.54, bottom);
      ctx.lineTo(-halfW * 0.54, bottom);
      ctx.lineTo(-halfW * 0.7, top + height * 0.12);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, top, 0, bottom);
      grad.addColorStop(0, primary);
      grad.addColorStop(1, secondary);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.lineWidth = Math.max(2, width * 0.05);
      ctx.stroke();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(-halfW * 0.25, top + height * 0.22);
      ctx.lineTo(-halfW * 0.12, top + height * 0.08);
      ctx.lineTo(halfW * 0.18, top + height * 0.18);
      ctx.lineTo(halfW * 0.12, top + height * 0.34);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = shadow;
      ctx.beginPath();
      ctx.moveTo(-halfW * 0.38, top + height * 0.16);
      ctx.lineTo(-halfW * 0.24, bottom - height * 0.08);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

export function drawEnvironmentProps(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  g: GridSpec,
  cam: CameraOptions | null | undefined,
  backgroundKey?: string | null,
): void {
  if (!ctx || !g) return;
  const resolved = resolveBackground(backgroundKey ?? null);
  if (!resolved) return;
  const { config } = resolved;
  if (!config || (config as { enabled?: boolean }).enabled === false) return;
  const cache = getBackgroundPropCache(config);
  const normalizedProps = cache?.normalizedProps;
  if (!normalizedProps || !normalizedProps.length) return;

  const boardSignature = getBoardSignature(g, cam);
  let boardState = cache.boardStates.get(boardSignature);
  if (!boardState) {
    boardState = buildBoardState(normalizedProps, g, cam);
    if (!boardState) return;
    cache.boardStates.set(boardSignature, boardState);
  }

  for (const item of boardState.drawables) {
    const { prop } = item;
    let width = prop.size.w * item.scale;
    let height = prop.size.h * item.scale;
    const spriteEntry = item.spriteEntry;
    if (spriteEntry && spriteEntry.status === 'ready' && spriteEntry.img) {
      const naturalW = spriteEntry.img.naturalWidth || prop.size.w;
      const naturalH = spriteEntry.img.naturalHeight || prop.size.h;
      width = naturalW * item.scale;
      height = naturalH * item.scale;
    }
    ctx.save();
    ctx.globalAlpha = prop.alpha;
    ctx.translate(item.x, item.y);
    if (prop.flip === -1) {
      ctx.scale(-1, 1);
    }
    const drawX = -width * (prop.anchor.x ?? 0.5);
    const drawY = -height * (prop.anchor.y ?? 1);
    if (spriteEntry && spriteEntry.status === 'ready' && spriteEntry.img) {
      ctx.drawImage(spriteEntry.img, drawX, drawY, width, height);
    } else {
      drawFallback(ctx, width, height, prop.anchor, prop.palette, prop.fallback);
    }
    ctx.restore();
  }
}

export function getEnvironmentBackground(backgroundKey?: string | null): BackgroundConfig {
  const resolved = resolveBackground(backgroundKey ?? null);
  return resolved ? resolved.config : null;
}