import { CFG } from './config.ts';
import { ensureSpriteLoaded, projectCellOblique } from './engine.ts';

import type {
  BackgroundConfig,
  BackgroundDefinitionConfig,
  BackgroundFallback,
  BackgroundPalette,
  BackgroundPropConfig,
} from '@types/config';

type GridSpec = Parameters<typeof projectCellOblique>[0];
type CameraOptions = Parameters<typeof projectCellOblique>[3];
type SpriteCacheEntry = ReturnType<typeof ensureSpriteLoaded>;

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

export const ENVIRONMENT_PROP_TYPES = {
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
} satisfies Record<string, EnvironmentPropDefaults>;

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
  const backgrounds = CFG.BACKGROUNDS as Record<string, BackgroundDefinitionConfig> | undefined;
  if (!backgrounds || typeof backgrounds !== 'object') return null;
  if (backgroundKey && backgrounds[backgroundKey]) {
    return { key: backgroundKey, config: backgrounds[backgroundKey] };
  }
  const preferred = CFG.CURRENT_BACKGROUND || CFG.SCENE?.CURRENT_BACKGROUND;
  if (preferred && backgrounds[preferred]) {
    return { key: preferred, config: backgrounds[preferred] };
  }
  const themeKey = CFG.SCENE?.CURRENT_THEME || CFG.SCENE?.DEFAULT_THEME;
  if (themeKey && backgrounds[themeKey]) {
    return { key: themeKey, config: backgrounds[themeKey] };
  }
  const [fallbackKey] = Object.keys(backgrounds);
  if (fallbackKey) {
    return { key: fallbackKey, config: backgrounds[fallbackKey] };
  }
  return null;
}

function normalizePropConfig(propCfg: BackgroundPropConfig | null | undefined): NormalizedPropConfig | null {
  if (!propCfg) return null;
  const typeId = propCfg.type || (propCfg as { kind?: string }).kind || null;
  const typeDef = typeId ? ENVIRONMENT_PROP_TYPES[typeId] : undefined;
  const anchor = {
    x: propCfg.anchor?.x ?? typeDef?.anchor?.x ?? 0.5,
    y: propCfg.anchor?.y ?? typeDef?.anchor?.y ?? 1,
  };
  const size = {
    w: propCfg.size?.w ?? typeDef?.size?.w ?? 120,
    h: propCfg.size?.h ?? typeDef?.size?.h ?? 180,
  };
  const palette: BackgroundPalette = {
    ...(typeDef?.palette ?? {}),
    ...(propCfg.palette ?? {}),
  };
  const cellCx = propCfg.cx ?? propCfg.cell?.cx ?? 0;
  const cellCy = propCfg.cy ?? propCfg.cell?.cy ?? 0;
  const depth = propCfg.depth ?? propCfg.cell?.depth ?? 0;
  return {
    type: typeId,
    asset: propCfg.asset ?? typeDef?.asset ?? null,
    fallback: propCfg.fallback ?? typeDef?.fallback ?? null,
    palette,
    anchor,
    size,
    cell: { cx: cellCx, cy: cellCy },
    depth,
    baseLift: propCfg.baseLift ?? typeDef?.baseLift ?? 0.5,
    offset: {
      x: propCfg.offset?.x ?? 0,
      y: propCfg.offset?.y ?? 0,
    },
    pixelOffset: {
      x: propCfg.pixelOffset?.x ?? 0,
      y: propCfg.pixelOffset?.y ?? 0,
    },
    scale: propCfg.scale ?? 1,
    alpha: propCfg.alpha ?? 1,
    flip: propCfg.flip ?? 1,
    sortBias: propCfg.sortBias ?? 0,
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
      const spriteEntry = prop.asset ? ensureSpriteLoaded({ sprite: prop.asset }) : null;
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
): BoardState | null {
  if (!g) return null;
  const rowGap = ((cam?.rowGapRatio) ?? 0.62) * g.tile;
  const drawables: DrawableEntry[] = [];
  for (const entry of normalizedProps) {
    if (!entry?.prop) continue;
    const { prop, base } = entry;
    const projection = projectCellOblique(g, base.cx, base.cyWithDepth, cam);
    const scale = projection.scale * prop.scale;
    const spriteEntry = entry.spriteEntry ?? (prop.asset ? ensureSpriteLoaded({ sprite: prop.asset }) : null);
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
  ctx: CanvasRenderingContext2D,
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
  ctx: CanvasRenderingContext2D,
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