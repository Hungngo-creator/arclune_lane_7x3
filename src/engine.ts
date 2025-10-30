import { TOKEN_STYLE, CHIBI, CFG } from './config.ts';
import { getUnitArt, getUnitSkin } from './art.ts';
import type { UnitToken, QueuedSummonState, QueuedSummonRequest, Side } from '@shared-types/units';
import type { UnitArt, UnitArtPalette } from '@shared-types/art';

type GridSpec = {
  cols: number;
  rows: number;
  tile: number;
  ox: number;
  oy: number;
  w: number;
  h: number;
  pad: number;
  dpr: number;
  pixelW: number;
  pixelH: number;
  pixelArea: number;
};

type CameraOptions = {
  rowGapRatio?: number;
  topScale?: number;
  depthScale?: number;
};

type ProjectionState = {
  x: number;
  y: number;
  scale: number;
};

type ShadowConfig = {
  color?: string;
  blur?: number;
  offsetX?: number;
  offsetY?: number;
};

type SpriteDescriptor = {
  src?: string;
  cacheKey?: string;
  skinId?: string | null;
  shadow?: ShadowConfig | null;
  scale?: number;
  aspect?: number;
  anchor?: number;
};

type LayoutConfig = {
  spriteHeight?: number;
  spriteAspect?: number;
  anchor?: number;
  labelOffset?: number;
  labelFont?: number;
};

type LabelConfig = {
  bg?: string;
  text?: string;
  stroke?: string;
};

type UnitArtDescriptor = UnitArt;

type TokenWithArt = UnitToken & {
  art?: UnitArtDescriptor | null;
  skinKey?: string | null;
};

type SpriteCacheEntry = {
  status: 'loading' | 'ready' | 'error';
  img: HTMLImageElement;
  key: string;
  src: string;
  skinId: string | null;
};

type TokenProjectionEntry = {
  cx: number;
  cy: number;
  sig: string;
  projection: ProjectionState;
};

type TokenVisualEntry = {
  spriteKey: string | null;
  spriteEntry: SpriteCacheEntry | null;
  shadowCfg: ShadowConfig | string | null;
};

type ZoneCodeOptions = {
  numeric?: boolean;
};

type CellCoords = {
  cx: number;
  cy: number;
};

type TokenShadowPreset = 'off' | 'soft' | 'medium' | null;

type SummonMap = Map<number, QueuedSummonRequest> | null | undefined;

type SlotSpecifier = Side | keyof typeof SIDE;

type ChibiProportions = {
  line: number;
  headR: number;
  torso: number;
  arm: number;
  leg: number;
  weapon: number;
  nameAlpha: number;
};

const DEFAULT_OBLIQUE_CAMERA = {
  rowGapRatio: 0.62,
  topScale: 0.8,
  depthScale: 0.94,
} as const satisfies Required<CameraOptions>;

const CHIBI_PROPS: ChibiProportions = CHIBI as ChibiProportions;
const TOKEN_STYLE_VALUE = TOKEN_STYLE as 'chibi' | 'disk';

function coerceFinite(value: unknown, fallback: number): number {
  const candidate =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseFloat(value)
        : Number(value);
  return Number.isFinite(candidate) ? candidate : fallback;
}

/* ---------- Grid ---------- */
export function makeGrid(canvas: HTMLCanvasElement | null | undefined, cols: number, rows: number): GridSpec {
  const pad = coerceFinite(CFG.UI?.PAD, 12);
  const boardMaxW = coerceFinite(CFG.UI?.BOARD_MAX_W, 900);
  let viewportW = boardMaxW + pad * 2;

  if (typeof window !== 'undefined') {
    const { innerWidth, visualViewport } = window;
    viewportW = Math.min(viewportW, coerceFinite(innerWidth, viewportW));
    const vvWidth = visualViewport ? coerceFinite(visualViewport.width, viewportW) : viewportW;
    viewportW = Math.min(viewportW, vvWidth);
  }
  if (typeof document !== 'undefined') {
    const docWidth = coerceFinite(document.documentElement?.clientWidth, viewportW);
    viewportW = Math.min(viewportW, docWidth);
  }

  const viewportSafeW = viewportW;
  const availableW = Math.max(1, viewportSafeW - pad * 2);
  const w = Math.min(availableW, boardMaxW);
  const h = Math.max(Math.floor(w * (CFG.UI?.BOARD_H_RATIO ?? 3 / 7)), CFG.UI?.BOARD_MIN_H ?? 220);

  const maxDprCfg = CFG.UI?.MAX_DPR;
  const dprClamp = Number.isFinite(maxDprCfg) && maxDprCfg > 0 ? maxDprCfg : 2;
  const dprRaw = typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio)
    ? window.devicePixelRatio
    : 1;
  const dprSafe = dprRaw > 0 ? dprRaw : 1;
  const perfCfg = CFG.PERFORMANCE || {};
  const lowPowerMode = !!perfCfg.LOW_POWER_MODE;
  const lowPowerDprCfg = perfCfg.LOW_POWER_DPR;
  const lowPowerDpr = Number.isFinite(lowPowerDprCfg) && lowPowerDprCfg > 0
    ? Math.min(dprClamp, lowPowerDprCfg)
    : 1.5;

  let dpr = Math.min(dprClamp, dprSafe);
  if (lowPowerMode) {
    dpr = Math.min(dpr, lowPowerDpr);
  }

  const displayW = w;
  const displayH = h;
  const maxPixelAreaCfg = CFG.UI?.MAX_PIXEL_AREA;
  const pixelAreaLimit = Number.isFinite(maxPixelAreaCfg) && maxPixelAreaCfg > 0 ? maxPixelAreaCfg : null;
  if (pixelAreaLimit) {
    const cssArea = displayW * displayH;
    if (cssArea > 0) {
      const maxDprByArea = Math.sqrt(pixelAreaLimit / cssArea);
      if (Number.isFinite(maxDprByArea) && maxDprByArea > 0) {
        dpr = Math.min(dpr, maxDprByArea);
      }
    }
  }

  if (!Number.isFinite(dpr) || dpr <= 0) {
    dpr = 1;
  }

  if (typeof window !== 'undefined') {
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      const vvScale = coerceFinite(visualViewport.scale, 1);
      if (vvScale > 0) {
        const scaledDpr = dpr * vvScale;
        if (Number.isFinite(scaledDpr) && scaledDpr > 0) {
          dpr = Math.min(dpr, scaledDpr);
        }
      }
    }
  }

  const pixelW = Math.max(1, Math.round(displayW * dpr));
  const pixelH = Math.max(1, Math.round(displayH * dpr));
  const pixelArea = pixelW * pixelH;

  if (canvas) {
    if (canvas.style) {
      canvas.style.width = `${displayW}px`;
      canvas.style.height = `${displayH}px`;
    }
    if (canvas.width !== pixelW) canvas.width = pixelW;
    if (canvas.height !== pixelH) canvas.height = pixelH;
  }

  const usableW = displayW - pad * 2;
  const usableH = displayH - pad * 2;
  const tile = Math.floor(Math.min(usableW / cols, usableH / rows));
  const ox = Math.floor((displayW - tile * cols) / 2);
  const oy = Math.floor((displayH - tile * rows) / 2);

  return {
    cols,
    rows,
    tile,
    ox,
    oy,
    w: displayW,
    h: displayH,
    pad,
    dpr,
    pixelW,
    pixelH,
    pixelArea,
  };
}

export function hitToCell(g: GridSpec, px: number, py: number): CellCoords | null {
  const cx = Math.floor((px - g.ox) / g.tile);
  const cy = Math.floor((py - g.oy) / g.tile);
  if (cx < 0 || cy < 0 || cx >= g.cols || cy >= g.rows) return null;
  return { cx, cy };
}

function cellCenter(g: GridSpec, cx: number, cy: number): { x: number; y: number } {
  const x = g.ox + g.tile * (cx + 0.5);
  const y = g.oy + g.tile * (cy + 0.5);
  return { x, y };
}
/* ---------- Tokens ---------- */
export function drawTokens(ctx: CanvasRenderingContext2D, g: GridSpec, tokens: readonly UnitToken[]): void {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fs = Math.floor(g.tile * 0.28);

  tokens.forEach((t) => {
    const { x, y } = cellCenter(g, t.cx, t.cy);
    const r = Math.floor(g.tile * 0.36);
    ctx.fillStyle = t.color ?? '#9adcf0';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CFG.COLORS.tokenText;
    ctx.font = `${fs}px system-ui`;
    ctx.fillText(String(t.name ?? ''), x, y);
  });
}

export function cellOccupied(tokens: readonly UnitToken[], cx: number, cy: number): boolean {
  return tokens.some((t) => t.cx === cx && t.cy === cy);
}

function isSummonMap(value: SummonMap): value is Map<number, QueuedSummonRequest> {
  if (!value) return false;
  if (value instanceof Map) return true;
  return typeof (value as { values?: unknown }).values === 'function';
}

export function cellReserved(tokens: readonly UnitToken[], queued: QueuedSummonState | null | undefined, cx: number, cy: number): boolean {
  if (cellOccupied(tokens, cx, cy)) return true;
  if (queued) {
    const checkQueue = (m: SummonMap): boolean => {
      if (!isSummonMap(m)) return false;
      for (const request of m.values()) {
        if (!request) continue;
        if (request.cx === cx && request.cy === cy) return true;
      }
      return false;
    };
    if (checkQueue(queued.ally)) return true;
    if (checkQueue(queued.enemy)) return true;
  }
  return false;
}

export function spawnLeaders(tokens: TokenWithArt[], g: GridSpec): void {
  const artAlly = getUnitArt('leaderA') as UnitArtDescriptor | null;
  const artEnemy = getUnitArt('leaderB') as UnitArtDescriptor | null;
  tokens.push({
    id: 'leaderA',
    name: 'Uyên',
    color: '#6cc8ff',
    cx: 0,
    cy: 1,
    side: 'ally',
    alive: true,
    art: artAlly,
    skinKey: artAlly?.skinKey ?? null,
  });
  tokens.push({
    id: 'leaderB',
    name: 'Địch',
    color: '#ff9aa0',
    cx: g.cols - 1,
    cy: 1,
    side: 'enemy',
    alive: true,
    art: artEnemy,
    skinKey: artEnemy?.skinKey ?? null,
  });
}

/* ---------- Helper ---------- */
export function pickRandom<T>(pool: readonly T[], excludeSet: ReadonlySet<string>, n = 4): T[] {
  const remain = pool
    .filter((u): u is T => {
      if (typeof u === 'undefined') {
        return false;
      }
      if (u && typeof u === 'object') {
        const candidate = u as { id?: unknown };
        const id = candidate.id;
        if (id !== undefined && id !== null) {
          return !excludeSet.has(String(id));
        }
        return true;
      }
      if (typeof u === 'string') {
        return !excludeSet.has(u);
      }
      return true;
     })
    .slice();

  for (let i = remain.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = remain[i]!;
    remain[i] = remain[j]!;
    remain[j] = temp;
  }
  return remain.slice(0, n);
}

export const pick3Random = <T>(pool: readonly T[], excludeSet: ReadonlySet<string>): T[] => pickRandom(pool, excludeSet, 3);
/* ---------- Oblique grid helpers ---------- */
function rowLR(g: GridSpec, r: number, C: CameraOptions): { left: number; right: number } {
  const colsW = g.tile * g.cols;
  const topScale = C.topScale ?? 0.8;
  const pinch = (1 - topScale) * colsW;
  const t = r / g.rows;
  const width = colsW - pinch * (1 - t);
  const left = g.ox + (colsW - width) / 2;
  const right = left + width;
  return { left, right };
}

export function drawGridOblique(
  ctx: CanvasRenderingContext2D,
  g: GridSpec,
  cam: CameraOptions | null | undefined,
  opts: { colors?: Partial<Record<'ally' | 'enemy' | 'mid' | 'line', string>> } = {},
): void {
  const C = cam ?? DEFAULT_OBLIQUE_CAMERA;
  const colors = {
    ally: CFG.COLORS.ally,
    enemy: CFG.COLORS.enemy,
    mid: CFG.COLORS.mid,
    line: CFG.COLORS.line,
    ...(opts.colors ?? {}),
  } satisfies Record<'ally' | 'enemy' | 'mid' | 'line', string>;
  const rowGap = (C.rowGapRatio ?? 0.62) * g.tile;

  for (let cy = 0; cy < g.rows; cy++) {
    const yTop = g.oy + cy * rowGap;
    const yBot = g.oy + (cy + 1) * rowGap;
    const LRt = rowLR(g, cy, C);
    const LRb = rowLR(g, cy + 1, C);

    for (let cx = 0; cx < g.cols; cx++) {
      const xtL = LRt.left + (cx / g.cols) * (LRt.right - LRt.left);
      const xtR = LRt.left + ((cx + 1) / g.cols) * (LRt.right - LRt.left);
      const xbL = LRb.left + (cx / g.cols) * (LRb.right - LRb.left);
      const xbR = LRb.left + ((cx + 1) / g.cols) * (LRb.right - LRb.left);

      let fill: string;
      if (cx < CFG.ALLY_COLS) fill = colors.ally;
      else if (cx >= g.cols - CFG.ENEMY_COLS) fill = colors.enemy;
      else fill = colors.mid;

      ctx.beginPath();
      ctx.moveTo(xtL, yTop);
      ctx.lineTo(xtR, yTop);
      ctx.lineTo(xbR, yBot);
      ctx.lineTo(xbL, yBot);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

export function hitToCellOblique(g: GridSpec, px: number, py: number, cam: CameraOptions | null | undefined): CellCoords | null {
  const C = cam ?? DEFAULT_OBLIQUE_CAMERA;
  const rowGap = (C.rowGapRatio ?? 0.62) * g.tile;

  const r = (py - g.oy) / rowGap;
  if (r < 0 || r >= g.rows) return null;

  const LR = rowLR(g, r, C);
  const u = (px - LR.left) / (LR.right - LR.left);
  if (u < 0 || u >= 1) return null;

  const cx = Math.floor(u * g.cols);
  const cy = Math.floor(r);
  return { cx, cy };
}

function cellQuadOblique(g: GridSpec, cx: number, cy: number, C: CameraOptions): {
  xtL: number;
  xtR: number;
  xbL: number;
  xbR: number;
  yTop: number;
  yBot: number;
} {
  const rowGap = (C.rowGapRatio ?? 0.62) * g.tile;
  const yTop = g.oy + cy * rowGap;
  const yBot = yTop + rowGap;
  const LRt = rowLR(g, cy, C);
  const LRb = rowLR(g, cy + 1, C);

  const xtL = LRt.left + (cx / g.cols) * (LRt.right - LRt.left);
  const xtR = LRt.left + ((cx + 1) / g.cols) * (LRt.right - LRt.left);
  const xbL = LRb.left + (cx / g.cols) * (LRb.right - LRb.left);
  const xbR = LRb.left + ((cx + 1) / g.cols) * (LRb.right - LRb.left);
  return { xtL, xtR, xbL, xbR, yTop, yBot };
}

function cellCenterOblique(g: GridSpec, cx: number, cy: number, C: CameraOptions): { x: number; y: number } {
  const q = cellQuadOblique(g, cx, cy, C);
  const x = (q.xtL + q.xtR + q.xbL + q.xbR) / 4;
  const y = (q.yTop + q.yBot) / 2;
  return { x, y };
}

export function projectCellOblique(g: GridSpec, cx: number, cy: number, cam: CameraOptions | null | undefined): ProjectionState {
  const C = cam ?? {};
  const { x, y } = cellCenterOblique(g, cx, cy, C);
  const k = C.depthScale ?? 0.94;
  const depth = g.rows - 1 - cy;
  const scale = Math.pow(k, depth);
  return { x, y, scale };
}
function drawChibi(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  facing: number = 1,
  color: string = '#a9f58c',
): void {
  const lw = Math.max(CHIBI_PROPS.line, Math.floor(r * 0.28));
  const hr = Math.max(3, Math.floor(r * CHIBI_PROPS.headR));
  const torso = r * CHIBI_PROPS.torso;
  const arm = r * CHIBI_PROPS.arm;
  const leg = r * CHIBI_PROPS.leg;
  const wep = r * CHIBI_PROPS.weapon;

  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;

  ctx.beginPath();
  ctx.arc(0, -torso - hr, hr, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -torso);
  ctx.lineTo(0, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -torso * 0.6);
  ctx.lineTo(-arm * 0.8, -torso * 0.2);
  ctx.moveTo(0, -torso * 0.6);
  ctx.lineTo(arm * 0.8 * facing, -torso * 0.2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-leg * 0.6, leg * 0.9);
  ctx.moveTo(0, 0);
  ctx.lineTo(leg * 0.6, leg * 0.9);
  ctx.stroke();

  const hx = arm * 0.8 * facing;
  const hy = -torso * 0.2;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx + wep * facing, hy);
  ctx.stroke();

  ctx.restore();
}

const SPRITE_CACHE = new Map<string, SpriteCacheEntry>();
export const ART_SPRITE_EVENT = 'unit-art:sprite-loaded';

const TOKEN_PROJECTION_CACHE = new WeakMap<UnitToken, TokenProjectionEntry>();
const TOKEN_VISUAL_CACHE = new Map<string, TokenVisualEntry>();

function contextSignature(g: GridSpec, cam: CameraOptions | null | undefined): string {
  const C = cam ?? {};
  return [
    g.cols,
    g.rows,
    g.tile,
    g.ox,
    g.oy,
    C.rowGapRatio ?? 0.62,
    C.topScale ?? 0.8,
    C.depthScale ?? 0.94,
  ].join('|');
}

function warnInvalidToken(context: string, token: unknown): void {
  if (!CFG.DEBUG) return;
  try {
    console.warn(`[engine] ${context}: expected token object but received`, token);
  } catch (_err) {
    // ignore logging errors
  }
}

function getTokenProjection(
  token: UnitToken | null | undefined,
  g: GridSpec,
  cam: CameraOptions | null | undefined,
  sig: string,
): ProjectionState | null {
  if (!token) {
    return null;
  }
  if (typeof token !== 'object') {
    warnInvalidToken('getTokenProjection', token);
    return null;
  }
  let entry = TOKEN_PROJECTION_CACHE.get(token);
  if (!entry || entry.cx !== token.cx || entry.cy !== token.cy || entry.sig !== sig) {
    const projection = projectCellOblique(g, token.cx, token.cy, cam);
    entry = {
      cx: token.cx,
      cy: token.cy,
      sig,
      projection,
    };
    TOKEN_PROJECTION_CACHE.set(token, entry);
  }
  return entry.projection;
}

function clearTokenCaches(token: UnitToken | null | undefined): void {
  if (!token) {
    return;
  }
  if (typeof token !== 'object') {
    warnInvalidToken('clearTokenCaches', token);
    return;
  }
  TOKEN_PROJECTION_CACHE.delete(token);
  const skinKey = (token as TokenWithArt).skinKey ?? null;
  const cacheKey = `${token.id ?? '__anon__'}::${skinKey ?? ''}`;
  TOKEN_VISUAL_CACHE.delete(cacheKey);
}

function normalizeSpriteDescriptor(sprite: UnitArtDescriptor['sprite']): SpriteDescriptor | null {
  if (!sprite) return null;
  if (typeof sprite === 'string') {
    return { src: sprite };
  }

  const descriptor: SpriteDescriptor = {};
  if (typeof sprite.src === 'string') {
    descriptor.src = sprite.src;
  }
  if (typeof sprite.cacheKey === 'string') {
    descriptor.cacheKey = sprite.cacheKey;
  }
  if (sprite.skinId !== undefined) {
    descriptor.skinId = sprite.skinId ?? null;
  }
  if (sprite.shadow !== undefined) {
    descriptor.shadow = sprite.shadow ?? null;
  }
  if (Number.isFinite(sprite.scale)) {
    descriptor.scale = sprite.scale;
  }
  const aspect = typeof sprite.aspect === 'number' ? sprite.aspect : null;
  if (aspect !== null && Number.isFinite(aspect)) {
    descriptor.aspect = aspect;
  }
  if (Number.isFinite(sprite.anchor)) {
    descriptor.anchor = sprite.anchor;
  }
  return descriptor;
}

function getTokenVisual(token: TokenWithArt | null | undefined, art: UnitArtDescriptor | null | undefined): TokenVisualEntry {
  if (!token) {
    return { spriteKey: null, spriteEntry: null, shadowCfg: null };
  }
  const skinKey = art?.skinKey ?? token.skinKey ?? null;
  const cacheKey = `${token.id ?? '__anon__'}::${skinKey ?? ''}`;
  const descriptor = normalizeSpriteDescriptor(art?.sprite ?? null);
  const spriteSrc = descriptor?.src ?? null;
  const spriteKey = descriptor?.cacheKey || (spriteSrc ? `${spriteSrc}::${descriptor?.skinId ?? skinKey ?? ''}` : null);

  let entry = TOKEN_VISUAL_CACHE.get(cacheKey);
  if (!entry || entry.spriteKey !== spriteKey) {
    const spriteEntry = spriteSrc ? ensureSpriteLoaded(art) : null;
    const shadowCfg = descriptor?.shadow ?? art?.shadow ?? null;
    entry = {
      spriteKey,
      spriteEntry,
      shadowCfg,
    };
    TOKEN_VISUAL_CACHE.set(cacheKey, entry);
  }
  return entry;
}

function ensureTokenArt(token: TokenWithArt | null | undefined): UnitArtDescriptor | null {
  if (!token) return null;
  const desiredSkin = getUnitSkin(token.id);
  if (!token.art || token.skinKey !== desiredSkin) {
    const art = getUnitArt(token.id, { skinKey: desiredSkin }) as UnitArtDescriptor | null;
    token.art = art;
    token.skinKey = art?.skinKey ?? desiredSkin ?? null;
  }
  return token.art ?? null;
}
export function ensureSpriteLoaded(art: UnitArtDescriptor | null | undefined): SpriteCacheEntry | null {
  if (!art || !art.sprite || typeof Image === 'undefined') return null;
  const descriptor = normalizeSpriteDescriptor(art.sprite);
  if (!descriptor || !descriptor.src) return null;
  const skinId = descriptor.skinId ?? art.skinKey ?? null;
  const key = descriptor.cacheKey || `${descriptor.src}::${skinId ?? ''}`;
  let entry = SPRITE_CACHE.get(key);
  if (!entry) {
    const img = new Image();
    entry = { status: 'loading', img, key, src: descriptor.src, skinId };
    if ('decoding' in img) (img as HTMLImageElement & { decoding?: string }).decoding = 'async';
    img.onload = () => {
      entry!.status = 'ready';
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new Event(ART_SPRITE_EVENT));
        } catch (_err) {
          // ignore
        }
      }
    };
    img.onerror = () => {
      entry!.status = 'error';
    };
    img.src = descriptor.src;
    SPRITE_CACHE.set(key, entry);
  }
  return entry;
}

function drawStylizedShape(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  anchor: number,
  art: UnitArtDescriptor | null | undefined,
): void {
  const paletteSource = art?.palette ?? null;
  const palette: Partial<UnitArtPalette> = paletteSource ? { ...paletteSource } : {};
  const primary = typeof palette.primary === 'string' ? palette.primary : '#86c4ff';
  const secondary = typeof palette.secondary === 'string' ? palette.secondary : '#1f3242';
  const accent = typeof palette.accent === 'string' ? palette.accent : '#d2f4ff';
  const outline = typeof palette.outline === 'string' ? palette.outline : 'rgba(0,0,0,0.55)';
  const top = -height * anchor;
  const bottom = height - height * anchor;
  const halfW = width / 2;
  const shape = art?.shape ?? 'sentinel';
  const gradient = ctx.createLinearGradient(0, top, 0, bottom);
  gradient.addColorStop(0, primary);
  gradient.addColorStop(1, secondary);

  ctx.save();
  ctx.beginPath();
  switch (shape) {
    case 'wing': {
      ctx.moveTo(-halfW * 0.92, bottom * 0.35);
      ctx.quadraticCurveTo(-halfW * 1.05, top + height * 0.1, 0, top);
      ctx.quadraticCurveTo(halfW * 1.05, top + height * 0.2, halfW * 0.9, bottom * 0.4);
      ctx.quadraticCurveTo(halfW * 0.45, bottom * 0.92, 0, bottom);
      ctx.quadraticCurveTo(-halfW * 0.4, bottom * 0.86, -halfW * 0.92, bottom * 0.35);
      break;
    }
    case 'rune': {
      ctx.moveTo(0, top);
      ctx.lineTo(halfW, top + height * 0.42);
      ctx.lineTo(0, bottom);
      ctx.lineTo(-halfW, top + height * 0.42);
      break;
    }
    case 'bloom': {
      ctx.moveTo(0, top);
      ctx.bezierCurveTo(halfW * 0.8, top + height * 0.05, halfW * 1.05, top + height * 0.45, halfW * 0.78, bottom * 0.38);
      ctx.bezierCurveTo(halfW * 0.68, bottom * 0.92, halfW * 0.2, bottom, 0, bottom);
      ctx.bezierCurveTo(-halfW * 0.2, bottom, -halfW * 0.68, bottom * 0.92, -halfW * 0.78, bottom * 0.38);
      ctx.bezierCurveTo(-halfW * 1.05, top + height * 0.45, -halfW * 0.8, top + height * 0.05, 0, top);
      break;
    }
    case 'pike': {
      ctx.moveTo(0, top);
      ctx.lineTo(halfW * 0.92, top + height * 0.32);
      ctx.lineTo(halfW * 0.52, bottom);
      ctx.lineTo(-halfW * 0.52, bottom);
      ctx.lineTo(-halfW * 0.92, top + height * 0.32);
      break;
    }
    case 'shield':
    case 'sentinel':
    default: {
      ctx.moveTo(0, top);
      ctx.bezierCurveTo(halfW, top + height * 0.22, halfW * 0.85, bottom * 0.16, 0, bottom);
      ctx.bezierCurveTo(-halfW * 0.85, bottom * 0.16, -halfW, top + height * 0.22, 0, top);
      break;
    }
  }
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.lineWidth = Math.max(2, width * 0.06);
  ctx.strokeStyle = outline;
  ctx.stroke();

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(-halfW * 0.58, top + height * 0.22);
  ctx.quadraticCurveTo(0, top + height * 0.05, halfW * 0.58, top + height * 0.22);
  ctx.quadraticCurveTo(halfW * 0.2, top + height * 0.32, 0, top + height * 0.28);
  ctx.quadraticCurveTo(-halfW * 0.2, top + height * 0.32, -halfW * 0.58, top + height * 0.22);
  ctx.fill();
  ctx.restore();
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number): void {
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

function formatName(text: string | undefined): string {
  if (!text) return '';
  const str = String(text);
  if (str.length <= 16) return str;
  return `${str.slice(0, 15)}…`;
}

const nameplateMetricsCache = new Map<string, { width: number; height: number }>();
let nameplateCacheFontSignature = '';

function drawNameplate(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  r: number,
  art: UnitArtDescriptor | null | undefined,
): void {
  if (!text) return;
  const layout: LayoutConfig = art?.layout ?? {};
  const fontSize = Math.max(11, Math.floor(r * (layout.labelFont ?? 0.7)));
  const padX = Math.max(8, Math.floor(fontSize * 0.6));
  const padY = Math.max(4, Math.floor(fontSize * 0.35));
  ctx.save();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  const font = `${fontSize}px 'Be Vietnam Pro', 'Inter', system-ui`;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (font !== nameplateCacheFontSignature) {
    nameplateMetricsCache.clear();
    nameplateCacheFontSignature = font;
  }
  const key = `${fontSize}|${text}`;
  let cached = nameplateMetricsCache.get(key);
  if (!cached) {
    const metrics = ctx.measureText(text);
    cached = {
      width: Math.ceil(metrics.width + padX * 2),
      height: Math.ceil(fontSize + padY * 2),
    };
    nameplateMetricsCache.set(key, cached);
  }
  const { width, height } = cached;
  const radius = Math.max(4, Math.floor(height / 2));
  const boxX = Math.round(x - width / 2);
  const boxY = Math.round(y - height / 2);
  roundedRectPath(ctx, boxX, boxY, width, height, radius);
  const label = art?.label;
  const bgColor = (label && typeof label === 'object' && label.bg) || 'rgba(12,20,30,0.82)';
  ctx.fillStyle = bgColor;
  ctx.fill();
  if (label && typeof label === 'object' && label.stroke) {
    ctx.strokeStyle = label.stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  const textColor = (label && typeof label === 'object' && label.text) || '#f4f8ff';
  ctx.fillStyle = textColor;
  ctx.fillText(text, x, boxY + height / 2);
  ctx.restore();
}
export function drawTokensOblique(
  ctx: CanvasRenderingContext2D,
  g: GridSpec,
  tokens: readonly TokenWithArt[],
  cam: CameraOptions | null | undefined,
): void {
  const C = cam ?? DEFAULT_OBLIQUE_CAMERA;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const baseR = Math.floor(g.tile * 0.36);
  const sig = contextSignature(g, C);

  const alive: Array<{ token: TokenWithArt; projection: ProjectionState }> = [];
  for (const token of tokens) {
    if (!token || !token.alive) {
      if (token && !token.alive) {
        if (typeof token === 'object') {
          clearTokenCaches(token);
        } else {
          warnInvalidToken('drawTokensOblique', token);
        }
      }
      continue;
    }
    const projection = getTokenProjection(token, g, C, sig);
    if (!projection) continue;
    alive.push({ token, projection });
  }

  alive.sort((a, b) => {
    const ya = a.projection.y;
    const yb = b.projection.y;
    if (ya === yb) return a.token.cx - b.token.cx;
    return ya - yb;
  });

  const perfCfg = CFG?.PERFORMANCE || {};
  const normalizePreset = (value: unknown, fallback: TokenShadowPreset = null): TokenShadowPreset => {
    if (value === 'off' || value === 'soft' || value === 'medium') return value;
    return fallback;
  };
  const mediumThreshold = Number.isFinite(perfCfg.SHADOW_MEDIUM_THRESHOLD)
    ? (perfCfg.SHADOW_MEDIUM_THRESHOLD as number)
    : null;
  const shadowThreshold = Number.isFinite(perfCfg.SHADOW_DISABLE_THRESHOLD)
    ? (perfCfg.SHADOW_DISABLE_THRESHOLD as number)
    : null;
  const highDprCutoff = Number.isFinite(perfCfg.SHADOW_HIGH_DPR_CUTOFF)
    ? (perfCfg.SHADOW_HIGH_DPR_CUTOFF as number)
    : null;
  const gridDpr = Number.isFinite(g?.dpr) ? g.dpr : null;

  let shadowPreset: TokenShadowPreset = null;
  if (perfCfg.LOW_POWER_SHADOWS) {
    shadowPreset = normalizePreset(perfCfg.LOW_SHADOW_PRESET, 'off');
  } else {
    if (!shadowPreset && highDprCutoff !== null && gridDpr !== null && gridDpr >= highDprCutoff) {
      shadowPreset = normalizePreset(perfCfg.HIGH_DPR_SHADOW_PRESET, 'off');
    }
    if (!shadowPreset && shadowThreshold !== null && alive.length >= shadowThreshold) {
      shadowPreset = normalizePreset(
        perfCfg.HIGH_LOAD_SHADOW_PRESET,
        normalizePreset(perfCfg.LOW_SHADOW_PRESET, 'off'),
      );
    }
    if (!shadowPreset && mediumThreshold !== null && alive.length >= mediumThreshold) {
      shadowPreset = normalizePreset(perfCfg.MEDIUM_SHADOW_PRESET, 'medium');
    }
  }
  const reduceShadows = shadowPreset !== null;

  for (const { token: t, projection: p } of alive) {
    const scale = p.scale ?? 1;
    const r = Math.max(6, Math.floor(baseR * scale));
    const facing = t.side === 'ally' ? 1 : -1;

    const art = ensureTokenArt(t);
    const layout: LayoutConfig = art?.layout ?? {};
    const spriteCfg = normalizeSpriteDescriptor(art?.sprite ?? null) ?? {};
    const spriteHeightMult = layout.spriteHeight ?? 2.4;
    const spriteScale = Number.isFinite(spriteCfg.scale) ? spriteCfg.scale! : 1;
    const spriteHeight = r * spriteHeightMult * (art?.size ?? 1) * spriteScale;
    const spriteAspect = (Number.isFinite(spriteCfg.aspect) ? spriteCfg.aspect! : null) ?? layout.spriteAspect ?? 0.78;
    const spriteWidth = spriteHeight * spriteAspect;
    const anchor = Number.isFinite(spriteCfg.anchor) ? spriteCfg.anchor! : layout.anchor ?? 0.78;
    const hasRichArt = !!(art && ((spriteCfg && spriteCfg.src) || art.shape));

    if (hasRichArt) {
      const { spriteEntry, shadowCfg } = getTokenVisual(t, art);
      const spriteReady = !!(spriteEntry && spriteEntry.status === 'ready' && spriteEntry.img);
      ctx.save();
      ctx.translate(p.x, p.y);
      if (facing === -1 && art?.mirror !== false) ctx.scale(-1, 1);

      const rawShadow = shadowCfg ?? art?.shadow ?? null;
      const shadowObject: ShadowConfig = rawShadow && typeof rawShadow === 'object' ? rawShadow : {};
      const shadowColorFallback = typeof rawShadow === 'string'
        ? rawShadow
        : typeof art?.shadow === 'string'
          ? art.shadow
          : undefined;
      let shadowColor = shadowObject.color ?? art?.glow ?? shadowColorFallback ?? 'rgba(0,0,0,0.35)';
      let shadowBlur = Number.isFinite(shadowObject.blur) ? shadowObject.blur! : Math.max(6, r * 0.7);
      let shadowOffsetX = Number.isFinite(shadowObject.offsetX) ? shadowObject.offsetX! : 0;
      let shadowOffsetY = Number.isFinite(shadowObject.offsetY) ? shadowObject.offsetY! : Math.max(2, r * 0.2);

      if (reduceShadows) {
        const cheap = shadowPreset;
        if (cheap === 'soft') {
          shadowColor = 'rgba(0, 0, 0, 0.18)';
          shadowBlur = Math.min(6, shadowBlur * 0.4);
          shadowOffsetX = 0;
          shadowOffsetY = Math.min(4, Math.max(1, shadowOffsetY * 0.4));
        } else if (cheap === 'medium') {
          shadowColor = 'rgba(0, 0, 0, 0.24)';
          shadowBlur = Math.min(10, Math.max(2, shadowBlur * 0.6));
          shadowOffsetX = 0;
          shadowOffsetY = Math.min(6, Math.max(1, shadowOffsetY * 0.6));
        } else {
          shadowColor = 'transparent';
          shadowBlur = 0;
          shadowOffsetX = 0;
          shadowOffsetY = 0;
        }
      }

      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetX = shadowOffsetX;
      ctx.shadowOffsetY = shadowOffsetY;
      if (spriteReady && spriteEntry) {
        ctx.drawImage(spriteEntry.img, -spriteWidth / 2, -spriteHeight * anchor, spriteWidth, spriteHeight);
      } else {
        drawStylizedShape(ctx, spriteWidth, spriteHeight, anchor, art);
      }
      ctx.restore();
    } else if (TOKEN_STYLE_VALUE === 'chibi') {
      drawChibi(ctx, p.x, p.y, r, facing, t.color || '#9adcf0');
    } else {
      ctx.fillStyle = t.color || '#9adcf0';
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (art?.label !== false) {
      const name = formatName(t.name || t.id);
      const offset = layout.labelOffset ?? 1.2;
      drawNameplate(ctx, name, p.x, p.y + r * offset, r, art);
    }
  }
}

export function drawQueuedOblique(
  ctx: CanvasRenderingContext2D,
  g: GridSpec,
  queued: QueuedSummonState | null | undefined,
  cam: CameraOptions | null | undefined,
): void {
  if (!queued) return;
  const C = cam ?? DEFAULT_OBLIQUE_CAMERA;
  const baseR = Math.floor(g.tile * 0.36);
  const k = C.depthScale ?? 0.94;

  const drawSide = (map: SummonMap, side: Side): void => {
    if (!isSummonMap(map)) return;
    if (side === 'ally' && !(CFG.DEBUG?.SHOW_QUEUED)) return;
    if (side === 'enemy' && !(CFG.DEBUG?.SHOW_QUEUED_ENEMY)) return;
    for (const p of map.values()) {
      if (!p) continue;
      const c = cellCenterOblique(g, p.cx, p.cy, C);
      const depth = g.rows - 1 - p.cy;
      const r = Math.max(6, Math.floor(baseR * Math.pow(k, depth)));
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = p.color || '#5b6a78';
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  drawSide(queued.ally, 'ally');
  drawSide(queued.enemy, 'enemy');
}

export const SIDE = {
  ALLY: 'ally',
  ENEMY: 'enemy',
} as const satisfies Record<'ALLY' | 'ENEMY', Side>;

export function slotIndex(side: SlotSpecifier, cx: number, cy: number): number {
  if (side === SIDE.ALLY || side === 'ally') {
    return (CFG.ALLY_COLS - 1 - cx) * 3 + (cy + 1);
  }
  const enemyStart = CFG.GRID_COLS - CFG.ENEMY_COLS;
  const colIndex = cx - enemyStart;
  return colIndex * 3 + (cy + 1);
}

export function slotToCell(side: SlotSpecifier, slot: number): CellCoords {
  const s = Math.max(1, Math.min(9, slot | 0));
  const colIndex = Math.floor((s - 1) / 3);
  const rowIndex = (s - 1) % 3;
  if (side === SIDE.ALLY || side === 'ally') {
    const cx = CFG.ALLY_COLS - 1 - colIndex;
    const cy = rowIndex;
    return { cx, cy };
  }
  const enemyStart = CFG.GRID_COLS - CFG.ENEMY_COLS;
  const cx = enemyStart + colIndex;
  const cy = rowIndex;
  return { cx, cy };
}

export function zoneCode(side: SlotSpecifier, cx: number, cy: number, { numeric = false }: ZoneCodeOptions = {}): string | number {
  const slot = slotIndex(side, cx, cy);
  if (numeric) return (side === SIDE.ALLY || side === 'ally' ? 0 : 1) * 16 + slot;
  const prefix = side === SIDE.ALLY || side === 'ally' ? 'A' : 'E';
  return prefix + String(slot);
}

export const ORDER_ALLY: ReadonlyArray<CellCoords> = Array.from({ length: 9 }, (_, i) => slotToCell(SIDE.ALLY, i + 1));
export const ORDER_ENEMY: ReadonlyArray<CellCoords> = Array.from({ length: 9 }, (_, i) => slotToCell(SIDE.ENEMY, i + 1));