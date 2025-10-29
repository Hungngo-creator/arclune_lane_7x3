// 0.7 vfx.js
// VFX layer: spawn pop, hit ring, ranged tracer, melee step-in/out
// Không thay đổi logic combat/turn — chỉ vẽ đè.
// Durations: spawn 500ms, hit 380ms, tracer 400ms, melee 1100ms.

import { projectCellOblique } from './engine.ts';
import { CFG, CHIBI } from './config.ts';
import { safeNow } from './utils/time.ts';
import loithienanhAnchors from './data/vfx_anchors/loithienanh.json';
import { parseVfxAnchorDataset } from './data/vfx_anchors/schema';

import type { SessionState } from '@shared-types/combat';
import type { Side, UnitToken } from '@shared-types/units';
import type { VfxAnchorDataset } from '@shared-types/vfx';

type GridSpec = Parameters<typeof projectCellOblique>[0];
type CameraOptions = Parameters<typeof projectCellOblique>[3];

type TokenRef = (Partial<UnitToken> & {
  unitId?: string | null | undefined;
}) | null | undefined;

type AnchorDatasetEntry = Omit<VfxAnchorDataset, 'unitId'>;

type ResolvedAnchor = {
  id: string;
  radius: number | null;
};

type AnchorPoint = {
  x: number;
  y: number;
};

type AnchorProjection = AnchorPoint & {
  r: number;
  scale: number;
};

type BaseVfxEvent = {
  t0: number;
  dur: number;
};

type SpawnVfxEvent = BaseVfxEvent & {
  type: 'spawn';
  cx: number;
  cy: number;
  side: Side | null | undefined;
};

type HitVfxEvent = BaseVfxEvent & {
  type: 'hit';
  ref: TokenRef;
  iid?: number | null;
  cx?: number;
  cy?: number;
  side?: Side | string | null;
  [extra: string]: unknown;
};

type TracerVfxEvent = BaseVfxEvent & {
  type: 'tracer';
  refA: TokenRef;
  refB: TokenRef;
};

type MeleeVfxEvent = BaseVfxEvent & {
  type: 'melee';
  refA: TokenRef;
  refB: TokenRef;
};

type LightningArcVfxEvent = BaseVfxEvent & {
  type: 'lightning_arc';
  refA: TokenRef;
  refB: TokenRef;
  anchorA: string;
  anchorB: string | null;
  radiusA?: number | null;
  radiusB?: number | null;
  color?: string;
  thickness?: number;
  jitter?: number;
  pattern: number[];
  segments?: number;
  glow?: boolean;
  glowScale?: number;
  rayScale?: number;
  alpha?: number;
};

type BloodPulseVfxEvent = BaseVfxEvent & {
  type: 'blood_pulse';
  refA: TokenRef;
  anchorA: string;
  radiusA?: number | null;
  color?: string;
  rings?: number;
  maxScale?: number;
  alpha?: number;
};

type ShieldWrapVfxEvent = BaseVfxEvent & {
  type: 'shield_wrap';
  refA: TokenRef;
  anchorA: string;
  anchorB: string | null;
  radiusA?: number | null;
  radiusB?: number | null;
  color?: string;
  alpha?: number;
  thickness?: number;
  heightScale?: number;
  widthScale?: number;
  wobble?: number;
};

type GroundBurstVfxEvent = BaseVfxEvent & {
  type: 'ground_burst';
  refA: TokenRef;
  anchorA: string;
  radiusA?: number | null;
  color?: string;
  shards?: number;
  spread?: number;
  alpha?: number;
};

export type LightningArcOptions = {
  busyMs?: number;
  anchorId?: string;
  bindingKey?: string;
  timing?: string | number;
  ambientKey?: string;
  anchorRadius?: number;
  targetAnchorId?: string;
  targetBindingKey?: string;
  targetTiming?: string | number;
  targetRadius?: number;
  color?: string;
  thickness?: number;
  jitter?: number;
  segments?: number;
  glow?: boolean;
  glowScale?: number;
  rayScale?: number;
};

export type BloodPulseOptions = {
  busyMs?: number;
  anchorId?: string;
  bindingKey?: string;
  timing?: string | number;
  ambientKey?: string;
  anchorRadius?: number;
  color?: string;
  rings?: number;
  maxScale?: number;
  alpha?: number;
};

export type ShieldWrapOptions = {
  busyMs?: number;
  anchorId?: string;
  bindingKey?: string;
  timing?: string | number;
  anchorRadius?: number;
  backAnchorId?: string;
  backTiming?: string | number;
  backRadius?: number;
  color?: string;
  alpha?: number;
  thickness?: number;
  heightScale?: number;
  widthScale?: number;
  wobble?: number;
};

export type GroundBurstOptions = {
  busyMs?: number;
  anchorId?: string;
  bindingKey?: string;
  timing?: string | number;
  anchorRadius?: number;
  color?: string;
  shards?: number;
  spread?: number;
  alpha?: number;
};

export type VfxEvent =
  | SpawnVfxEvent
  | HitVfxEvent
  | TracerVfxEvent
  | MeleeVfxEvent
  | LightningArcVfxEvent
  | BloodPulseVfxEvent
  | ShieldWrapVfxEvent
  | GroundBurstVfxEvent;

export type VfxEventList = VfxEvent[];

export type SessionWithVfx = SessionState & {
  grid: GridSpec;
  tokens: ReadonlyArray<UnitToken>;
  vfx?: VfxEventList;
};

const now = (): number => safeNow();
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const easeInOut = (t: number): number => (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) * 0.5;
const isFiniteCoord = (value: unknown): value is number => Number.isFinite(value);
const hasFinitePoint = (obj: TokenRef): obj is TokenRef & { cx: number; cy: number } =>
  !!obj && isFiniteCoord(obj.cx) && isFiniteCoord(obj.cy);
const warnInvalidArc = (label: string, data: unknown): void => {
  if (typeof console !== 'undefined' && console?.warn) {
    console.warn(`[vfxDraw] Skipping ${label} arc due to invalid geometry`, data);
  }
};

const DEFAULT_ANCHOR_ID = 'root';
const DEFAULT_ANCHOR_POINT: AnchorPoint = { x: 0.5, y: 0.5 };
const DEFAULT_ANCHOR_RADIUS = 0.2;
const UNIT_WIDTH_RATIO = 0.9;
const UNIT_HEIGHT_RATIO = 1.85;
const DEFAULT_SEGMENTS = 6;

const VFX_ANCHOR_CACHE: Map<string, AnchorDatasetEntry> = new Map();

function registerAnchorDataset(dataset: VfxAnchorDataset | null | undefined): void {
  if (!dataset || typeof dataset !== 'object') return;
  const unitId = dataset.unitId || null;
  if (!unitId) return;
  const entry: AnchorDatasetEntry = {
    bodyAnchors: dataset.bodyAnchors || {},
    vfxBindings: dataset.vfxBindings || {},
    ambientEffects: dataset.ambientEffects || {}
  };
  VFX_ANCHOR_CACHE.set(unitId, entry);
}

try {
  const dataset = parseVfxAnchorDataset(loithienanhAnchors);
  registerAnchorDataset(dataset);
} catch (error) {
  // behavior-preserving: fall back to raw dataset when validation fails.
  if (typeof console !== 'undefined' && console?.warn) {
    console.warn('[vfxDraw] Failed to parse anchor dataset', error);
  }
  registerAnchorDataset(loithienanhAnchors);
}

function getUnitAnchorDataset(unit: TokenRef): AnchorDatasetEntry | null {
  if (!unit) return null;
  const id = (unit.unitId as string | null | undefined)
    || (typeof unit.id === 'string' ? unit.id : null)
    || (typeof unit.name === 'string' ? unit.name : null);
  if (!id) return null;
  return VFX_ANCHOR_CACHE.get(id) || null;
}

function resolveBindingAnchor(
  unit: TokenRef,
  { anchorId, bindingKey, timing, ambientKey, radius }: {
    anchorId?: string;
    bindingKey?: string;
    timing?: string | number;
    ambientKey?: string;
    radius?: number;
  },
): ResolvedAnchor {
  const dataset = getUnitAnchorDataset(unit);
  let picked: (AnchorDatasetEntry['vfxBindings'][string]['anchors'][number]) | null = null;

  if (bindingKey && dataset?.vfxBindings?.[bindingKey]?.anchors) {
    const anchors = dataset.vfxBindings[bindingKey].anchors;
    picked = anchors.find((item) => (timing && item.timing === timing) || (anchorId && item.id === anchorId)) || null;
    if (!picked && timing) {
      picked = anchors.find((item) => item.timing === timing) || null;
    }
    if (!picked && anchorId) {
      picked = anchors.find((item) => item.id === anchorId) || null;
    }
  }

  if (!picked && ambientKey && dataset?.ambientEffects?.[ambientKey]?.anchors) {
    const anchors = dataset.ambientEffects[ambientKey].anchors;
    picked = anchors.find((item) => (timing && item.timing === timing) || (anchorId && item.id === anchorId)) || null;
    if (!picked && timing) {
      picked = anchors.find((item) => item.timing === timing) || null;
    }
    if (!picked && anchorId) {
      picked = anchors.find((item) => item.id === anchorId) || null;
    }
  }

  const resolvedId = picked?.id || anchorId || DEFAULT_ANCHOR_ID;
  const resolvedRadius = Number.isFinite(radius) ? radius : (Number.isFinite(picked?.radius) ? picked.radius : null);

  return { id: resolvedId, radius: resolvedRadius ?? null };
}

function lookupBodyAnchor(unit: TokenRef, anchorId: string): AnchorPoint | null {
  const dataset = getUnitAnchorDataset(unit);
  if (!dataset) return null;
  const anchor = dataset.bodyAnchors?.[anchorId];
  if (!anchor) return null;
  const x = Number(anchor.x);
  const y = Number(anchor.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y };
}

function createRandomPattern(length = DEFAULT_SEGMENTS): number[] {
  const result: number[] = [];
  for (let i = 0; i < length; i += 1) {
    result.push(Math.random() * 2 - 1);
  }
  return result;
}

function computeAnchorCanvasPoint(
  Game: SessionWithVfx,
  token: TokenRef,
  anchorId: string | null | undefined,
  radiusRatio: number | null | undefined,
  cam: CameraOptions | null | undefined,
): AnchorProjection | null {
  if (!Game?.grid || !token || !hasFinitePoint(token)) return null;
  const projection = projectCellOblique(Game.grid, token.cx ?? 0, token.cy ?? 0, cam);
  if (!projection || !isFiniteCoord(projection.x) || !isFiniteCoord(projection.y) || !isFiniteCoord(projection.scale)) return null;

  const anchor = lookupBodyAnchor(token, anchorId ?? DEFAULT_ANCHOR_ID)
    || lookupBodyAnchor(token, DEFAULT_ANCHOR_ID)
    || DEFAULT_ANCHOR_POINT;
  const ax = Number(anchor?.x);
  const ay = Number(anchor?.y);
  const validAnchor = Number.isFinite(ax) && Number.isFinite(ay);
  const xRatio = validAnchor ? (ax - 0.5) : 0;
  const yRatio = validAnchor ? (ay - 0.5) : 0;

  const width = Game.grid.tile * UNIT_WIDTH_RATIO * projection.scale;
  const height = Game.grid.tile * UNIT_HEIGHT_RATIO * projection.scale;
  const px = projection.x + xRatio * width;
  const py = projection.y - yRatio * height;

  if (!isFiniteCoord(px) || !isFiniteCoord(py)) return null;

  const rr = Number.isFinite(radiusRatio) ? Number(radiusRatio) : DEFAULT_ANCHOR_RADIUS;
  const rPx = Math.max(2, Math.floor(rr * Game.grid.tile * projection.scale));
  return { x: px, y: py, r: rPx, scale: projection.scale };
}

function drawLightningArc(
  ctx: CanvasRenderingContext2D,
  start: AnchorProjection | null,
  end: AnchorProjection | null,
  event: LightningArcVfxEvent,
  progress: number,
): void {
  if (!start) return;
  const segments = Math.max(2, event.segments || DEFAULT_SEGMENTS);
  const color = event.color || '#7de5ff';
  const alpha = (event.alpha ?? 0.9) * (1 - progress);
  const thickness = Math.max(1, Math.floor((event.thickness ?? 2.4) * (start.scale ?? 1)));
  const pattern = Array.isArray(event.pattern) && event.pattern.length ? event.pattern : createRandomPattern(segments - 1);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = thickness;

  if (end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.hypot(dx, dy) || 1;
    const jitterFactor = (event.jitter ?? 0.22) * dist * (1 - progress * 0.6);
    const nx = -dy / dist;
    const ny = dx / dist;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < segments; i += 1) {
      const t = i / segments;
      const noise = pattern[(i - 1) % pattern.length] || 0;
      const offset = noise * jitterFactor;
      const px = start.x + dx * t + nx * offset;
      const py = start.y + dy * t + ny * offset;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  } else {
    const rayCount = segments + 1;
    const baseRadius = start.r * (event.rayScale ?? 2.4) * (1 + 0.2 * (1 - progress));
    for (let i = 0; i < rayCount; i += 1) {
      const seed = pattern[i % pattern.length] || 0;
      const angle = (i / rayCount) * Math.PI * 2 + seed * 0.5;
      const length = Math.max(start.r, baseRadius * (0.6 + Math.abs(seed)));
      const ex = start.x + Math.cos(angle) * length;
      const ey = start.y + Math.sin(angle) * length;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  }

  if (event.glow !== false) {
    ctx.globalAlpha = alpha * 0.6;
    ctx.lineWidth = Math.max(thickness * 0.75, 1);
    ctx.beginPath();
    ctx.arc(start.x, start.y, Math.max(1, start.r * (event.glowScale ?? 1.1)), 0, Math.PI * 2);
    ctx.stroke();
    if (end) {
      ctx.beginPath();
      ctx.arc(end.x, end.y, Math.max(1, (end.r ?? start.r) * (event.glowScale ?? 1.1)), 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawBloodPulse(
  ctx: CanvasRenderingContext2D,
  anchor: AnchorProjection | null,
  event: BloodPulseVfxEvent,
  progress: number,
): void {
  if (!anchor) return;
  const color = event.color || '#ff6b81';
  const rings = Math.max(1, event.rings || 2);
  const alpha = (event.alpha ?? 0.75) * (1 - progress);
  const maxScale = event.maxScale ?? 3.4;
  const growth = easeInOut(progress);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, Math.floor(anchor.r * 0.3));
  for (let i = 0; i < rings; i += 1) {
    const t = (i + 1) / rings;
    const radius = anchor.r * lerp(1, maxScale, Math.pow(growth, 0.8) * t);
    if (!isFiniteCoord(radius) || radius <= 0) continue;
    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawShieldWrap(
  ctx: CanvasRenderingContext2D,
  frontAnchor: AnchorProjection | null,
  backAnchor: AnchorProjection | null,
  event: ShieldWrapVfxEvent,
  progress: number,
): void {
  if (!frontAnchor) return;
  const color = event.color || '#9bd8ff';
  const alpha = (event.alpha ?? 0.6) * (1 - progress * 0.7);
  const thickness = Math.max(2, Math.floor((event.thickness ?? 2.6) * (frontAnchor.scale ?? 1)));
  const spanY = Math.max(frontAnchor.r * (event.heightScale ?? 3.4), 4);
  const spanX = Math.max(frontAnchor.r * (event.widthScale ?? 2.6), 4);
  const wobble = (event.wobble ?? 0.18) * Math.sin(progress * Math.PI * 2);

  const centerX = frontAnchor.x;
  const centerY = frontAnchor.y - wobble * spanY;
  const gradientSpan = spanY * 0.35;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;

  ctx.beginPath();
  ctx.ellipse(centerX, centerY, spanX, spanY, 0, 0, Math.PI * 2);
  ctx.stroke();

  if (backAnchor) {
    ctx.globalAlpha = alpha * 0.55;
    ctx.beginPath();
    ctx.ellipse(backAnchor.x, backAnchor.y + wobble * spanY * 0.6, spanX * 1.1, spanY * 1.05, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (typeof ctx.createLinearGradient === 'function') {
    ctx.globalAlpha = alpha * 0.35;
    const gradient = ctx.createLinearGradient(centerX, centerY - gradientSpan, centerX, centerY + gradientSpan);
    gradient.addColorStop(0, 'rgba(155, 216, 255, 0.0)');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'rgba(155, 216, 255, 0.0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, spanX, spanY, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGroundBurst(
  ctx: CanvasRenderingContext2D,
  anchor: AnchorProjection | null,
  event: GroundBurstVfxEvent,
  progress: number,
): void {
  if (!anchor) return;
  const color = event.color || '#ffa36e';
  const alpha = (event.alpha ?? 0.7) * (1 - progress);
  const shards = Math.max(3, event.shards || 5);
  const spread = anchor.r * (event.spread ?? 3.2);
  const lift = anchor.r * 0.4;
  const growth = easeInOut(progress);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  for (let i = 0; i < shards; i += 1) {
    const angle = (i / shards) * Math.PI * 2;
    const distance = spread * (0.4 + growth * 0.6);
    const px = anchor.x + Math.cos(angle) * distance;
    const py = anchor.y + Math.sin(angle) * (distance * 0.35) + lift * (0.5 - growth);
    if (!isFiniteCoord(px) || !isFiniteCoord(py)) continue;
    ctx.beginPath();
    ctx.moveTo(anchor.x, anchor.y);
    ctx.lineTo(px, py);
    ctx.lineTo(anchor.x + Math.cos(angle + 0.1) * (distance * 0.6), anchor.y + Math.sin(angle + 0.1) * (distance * 0.25));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function pool(Game: SessionWithVfx): VfxEventList {
  if (!Array.isArray(Game.vfx)) Game.vfx = [] as VfxEventList;
  return Game.vfx;
}

/* ------------------- Adders ------------------- */
export function vfxAddSpawn(Game: SessionWithVfx, cx: number, cy: number, side: Side | null | undefined): void {
  const spawn: SpawnVfxEvent = { type: 'spawn', t0: now(), dur: 500, cx, cy, side };
  pool(Game).push(spawn);
}

type HitEventExtras = Partial<Omit<HitVfxEvent, 'type' | 't0' | 'dur' | 'ref'>>;

export function vfxAddHit(Game: SessionWithVfx, target: TokenRef, opts: HitEventExtras = {}): void {
  const event: HitVfxEvent = { type: 'hit', t0: now(), dur: 380, ref: target, ...opts };
  pool(Game).push(event);
}

export function vfxAddTracer(
  Game: SessionWithVfx,
  attacker: TokenRef,
  target: TokenRef,
  opts: { dur?: number } = {},
): void {
  const dur = Number.isFinite(opts?.dur) ? Number(opts.dur) : 400;
  const event: TracerVfxEvent = { type: 'tracer', t0: now(), dur, refA: attacker, refB: target };
  pool(Game).push(event);
}

export function vfxAddMelee(
  Game: SessionWithVfx,
  attacker: TokenRef,
  target: TokenRef,
  { dur = CFG?.ANIMATION?.meleeDurationMs ?? 1100 }: { dur?: number } = {},
): void {
  // Overlay step-in/out (không di chuyển token thật)
  const event: MeleeVfxEvent = { type: 'melee', t0: now(), dur, refA: attacker, refB: target };
  pool(Game).push(event);
}

function makeLightningEvent(
  Game: SessionWithVfx,
  source: TokenRef,
  target: TokenRef,
  opts: LightningArcOptions = {},
): number {
  const busyMs = Number.isFinite(opts.busyMs) ? Number(opts.busyMs) : 420;
  const anchorA = resolveBindingAnchor(source, {
    anchorId: opts.anchorId,
    bindingKey: opts.bindingKey,
    timing: opts.timing,
    ambientKey: opts.ambientKey,
    radius: opts.anchorRadius
  });
  const anchorB = target
    ? resolveBindingAnchor(target, {
        anchorId: opts.targetAnchorId,
        bindingKey: opts.targetBindingKey,
        timing: opts.targetTiming,
        ambientKey: undefined,
        radius: opts.targetRadius,
      })
    : null;

  const event: LightningArcVfxEvent = {
    type: 'lightning_arc',
    t0: now(),
    dur: busyMs,
    refA: source,
    refB: target || null,
    anchorA: anchorA.id,
    anchorB: anchorB?.id || null,
    radiusA: anchorA.radius,
    radiusB: anchorB?.radius,
    color: opts.color,
    thickness: opts.thickness,
    jitter: opts.jitter,
    pattern: createRandomPattern(DEFAULT_SEGMENTS),
    segments: opts.segments,
    glow: opts.glow,
    glowScale: opts.glowScale,
    rayScale: opts.rayScale,
  };
  pool(Game).push(event);
  return busyMs;
}

export function vfxAddLightningArc(
  Game: SessionWithVfx,
  source: TokenRef,
  target: TokenRef,
  opts: LightningArcOptions = {},
): number {
  return makeLightningEvent(Game, source, target, opts);
}

export function vfxAddBloodPulse(Game: SessionWithVfx, source: TokenRef, opts: BloodPulseOptions = {}): number {
  const busyMs = Number.isFinite(opts.busyMs) ? Number(opts.busyMs) : 560;
  const anchor = resolveBindingAnchor(source, {
    anchorId: opts.anchorId,
    bindingKey: opts.bindingKey,
    timing: opts.timing,
    ambientKey: opts.ambientKey,
    radius: opts.anchorRadius
  });

  const event: BloodPulseVfxEvent = {
    type: 'blood_pulse',
    t0: now(),
    dur: busyMs,
    refA: source,
    anchorA: anchor.id,
    radiusA: anchor.radius,
    color: opts.color,
    rings: opts.rings,
    maxScale: opts.maxScale,
    alpha: opts.alpha,
  };
  pool(Game).push(event);
  return busyMs;
}

export function vfxAddShieldWrap(Game: SessionWithVfx, source: TokenRef, opts: ShieldWrapOptions = {}): number {
  const busyMs = Number.isFinite(opts.busyMs) ? Number(opts.busyMs) : 900;
  const front = resolveBindingAnchor(source, {
    anchorId: opts.anchorId,
    bindingKey: opts.bindingKey,
    timing: opts.timing,
    ambientKey: undefined,
    radius: opts.anchorRadius
  });
  const wantsBack = opts.backAnchorId != null || opts.backTiming != null || Number.isFinite(opts.backRadius);
  const back = wantsBack
    ? resolveBindingAnchor(source, {
        anchorId: opts.backAnchorId,
        bindingKey: opts.bindingKey,
        timing: opts.backTiming,
        ambientKey: undefined,
        radius: opts.backRadius,
      })
    : null;

  const event: ShieldWrapVfxEvent = {
    type: 'shield_wrap',
    t0: now(),
    dur: busyMs,
    refA: source,
    anchorA: front.id,
    anchorB: back?.id || null,
    radiusA: front.radius,
    radiusB: back?.radius,
    color: opts.color,
    alpha: opts.alpha,
    thickness: opts.thickness,
    heightScale: opts.heightScale,
    widthScale: opts.widthScale,
    wobble: opts.wobble,
  };
  pool(Game).push(event);
  return busyMs;
}

export function vfxAddGroundBurst(Game: SessionWithVfx, source: TokenRef, opts: GroundBurstOptions = {}): number {
  const busyMs = Number.isFinite(opts.busyMs) ? Number(opts.busyMs) : 640;
  const anchor = resolveBindingAnchor(source, {
    anchorId: opts.anchorId,
    bindingKey: opts.bindingKey,
    timing: opts.timing,
    ambientKey: undefined,
    radius: opts.anchorRadius
  });

  const event: GroundBurstVfxEvent = {
    type: 'ground_burst',
    t0: now(),
    dur: busyMs,
    refA: source,
    anchorA: anchor.id,
    radiusA: anchor.radius,
    color: opts.color,
    shards: opts.shards,
    spread: opts.spread,
    alpha: opts.alpha,
  };
  pool(Game).push(event);
  return busyMs;
}

function drawChibiOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  facing: number,
  color: string,
): void {
  const lw = Math.max(CHIBI.line, Math.floor(r * 0.28));
  const hr = Math.max(3, Math.floor(r * CHIBI.headR));
  const torso = r * CHIBI.torso;
  const arm = r * CHIBI.arm;
  const leg = r * CHIBI.leg;
  const wep = r * CHIBI.weapon;

  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;

  // đầu
  ctx.beginPath(); ctx.arc(0, -torso - hr, hr, 0, Math.PI * 2); ctx.stroke();
  // thân
  ctx.beginPath(); ctx.moveTo(0, -torso); ctx.lineTo(0, 0); ctx.stroke();
  // tay (tay trước cầm kiếm theo hướng facing)
  ctx.beginPath();
  ctx.moveTo(0, -torso * 0.6); ctx.lineTo(-arm * 0.8, -torso * 0.2);
  ctx.moveTo(0, -torso * 0.6); ctx.lineTo(arm * 0.8 * facing, -torso * 0.2);
  ctx.stroke();
  // chân
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(-leg * 0.6, leg * 0.9);
  ctx.moveTo(0, 0); ctx.lineTo(leg * 0.6, leg * 0.9);
  ctx.stroke();
  // kiếm
  const hx = arm * 0.8 * facing;
  const hy = -torso * 0.2;
  ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + wep * facing, hy); ctx.stroke();

  ctx.restore();
}
/* ------------------- Drawer ------------------- */
export function vfxDraw(
  ctx: CanvasRenderingContext2D,
  Game: SessionWithVfx,
  cam: CameraOptions | null | undefined,
): void {
  const list = pool(Game);
  if (!list.length || !Game.grid) return;

  const keep: VfxEventList = [];
  for (const e of list) {
    const t = (now() - e.t0) / e.dur;
    const done = t >= 1;
    const tt = Math.max(0, Math.min(1, t));

    switch (e.type) {
      case 'spawn': {
        const { cx, cy } = e;
        if (isFiniteCoord(cx) && isFiniteCoord(cy)) {
          const p = projectCellOblique(Game.grid, cx, cy, cam);
          const r0 = Math.max(8, Math.floor(Game.grid.tile * 0.22 * p.scale));
          const r = r0 + Math.floor(r0 * 1.8 * tt);
          if (isFiniteCoord(p.x) && isFiniteCoord(p.y) && isFiniteCoord(r) && r > 0) {
            ctx.save();
            ctx.globalAlpha = 1 - tt;
            ctx.strokeStyle = e.side === 'ally' ? '#9ef0a4' : '#ffb4c0';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
          } else {
            warnInvalidArc('spawn', { x: p?.x, y: p?.y, r });
          }
        }
        break;
      }

      case 'hit': {
        const tokens = Array.isArray(Game?.tokens) ? Game.tokens : null;
        const updateFromToken = (token: TokenRef): void => {
          if (!token) return;
          if (token.iid != null && e.iid == null) e.iid = token.iid;
          if (isFiniteCoord(token.cx)) e.cx = token.cx;
          if (isFiniteCoord(token.cy)) e.cy = token.cy;
        };

        const initialRef = hasFinitePoint(e.ref) ? e.ref : null;
        updateFromToken(initialRef);

        const lookupLiveToken = (): UnitToken | null => {
          if (!tokens) return null;
          if (e.iid != null) {
            return tokens.find(t => t && t.iid === e.iid) ?? null;
          }
          const ref = e.ref;
          if (ref?.iid != null) {
            return tokens.find(t => t && t.iid === ref.iid) ?? null;
          }
          if (typeof ref?.id === 'string') {
            return tokens.find(t => t && t.id === ref.id) ?? null;
          }
          return null;
        };

        const hasCoords = isFiniteCoord(e.cx) && isFiniteCoord(e.cy);
        if ((!hasCoords || !initialRef) && tokens) {
          const live = lookupLiveToken();
          if (live) {
            e.ref = live;
            updateFromToken(live);
          }
        }

        if (isFiniteCoord(e.cx) && isFiniteCoord(e.cy)) {
          const p = projectCellOblique(Game.grid, e.cx, e.cy, cam);
          const r = Math.floor(Game.grid.tile * 0.25 * (0.6 + 1.1 * tt) * p.scale);
          if (isFiniteCoord(p.x) && isFiniteCoord(p.y) && isFiniteCoord(r) && r > 0) {
            ctx.save();
            ctx.globalAlpha = 0.9 * (1 - tt);
            ctx.strokeStyle = '#e6f2ff';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
          } else {
            warnInvalidArc('hit', { x: p?.x, y: p?.y, r });
          }
        }
        break;
      }

      case 'tracer': {
        // disabled: không vẽ “đường trắng” nữa
        break;
      }

      case 'melee': {
        const A = e.refA;
        const B = e.refB;
        if (A && B && A.alive && B.alive && hasFinitePoint(A) && hasFinitePoint(B)) {
          const pa = projectCellOblique(Game.grid, A.cx ?? 0, A.cy ?? 0, cam);
          const pb = projectCellOblique(Game.grid, B.cx ?? 0, B.cy ?? 0, cam);

          const tN = Math.max(0, Math.min(1, (now() - e.t0) / e.dur));
          const k = easeInOut(tN) * 0.88;
          const mx = lerp(pa.x, pb.x, k);
          const my = lerp(pa.y, pb.y, k);

          const depth = Game.grid.rows - 1 - (A.cy ?? 0);
          const kDepth = cam?.depthScale ?? 0.94;
          const r = Math.max(6, Math.floor(Game.grid.tile * 0.36 * Math.pow(kDepth, depth)));

          const facing = A.side === 'ally' ? 1 : -1;
          const color = A.color || (A.side === 'ally' ? '#9adcf0' : '#ffb4c0');

          ctx.save();
          ctx.globalAlpha = 0.95;
          drawChibiOverlay(ctx, mx, my, r, facing, color);
          ctx.restore();
        }
        break;
      }

      case 'lightning_arc': {
        const start = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, e.radiusA ?? null, cam);
        const end = e.refB ? computeAnchorCanvasPoint(Game, e.refB, e.anchorB, e.radiusB ?? null, cam) : null;
        if (start && (!e.refB || end)) {
          drawLightningArc(ctx, start, end, e, tt);
        } else {
          warnInvalidArc('lightning', { start, end });
        }
        break;
      }

      case 'blood_pulse': {
        const anchor = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, e.radiusA ?? null, cam);
        if (anchor) {
          drawBloodPulse(ctx, anchor, e, tt);
        } else {
          warnInvalidArc('blood_pulse', { anchor });
        }
        break;
      }

      case 'shield_wrap': {
        const front = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, e.radiusA ?? null, cam);
        const back = e.anchorB ? computeAnchorCanvasPoint(Game, e.refA, e.anchorB, e.radiusB ?? null, cam) : null;
        if (front) {
          drawShieldWrap(ctx, front, back, e, tt);
        } else {
          warnInvalidArc('shield_wrap', { front, back });
        }
        break;
      }

      case 'ground_burst': {
        const anchor = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, e.radiusA ?? null, cam);
        if (anchor) {
          drawGroundBurst(ctx, anchor, e, tt);
        } else {
          warnInvalidArc('ground_burst', { anchor });
        }
        break;
      }

      default:
        break;
    }

    if (!done) keep.push(e);
  }
  Game.vfx = keep;
}