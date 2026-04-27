import { parseFiniteNumber } from './session-state';

export type FrameHandle = number | ReturnType<typeof setTimeout>;
export type RequestAnimationFrameFn = (callback: FrameRequestCallback) => number;
export type CancelAnimationFrameFn = (handle: number) => void;
type NullableRequestAnimationFrameFn = RequestAnimationFrameFn | null;
type NullableCancelAnimationFrameFn = CancelAnimationFrameFn | null;

export type ViewportResizeDebugState = {
  width: number;
  height: number;
  scale: number;
  offsetTop: number;
  offsetLeft: number;
};

type SessionRenderControllerDeps = {
  getCanvas: () => HTMLCanvasElement | null;
  getContext: () => CanvasRenderingContext2D | null;
  drawNow: () => void;
  onDrawError: (error: unknown) => void;
  shouldKeepDrawing: () => boolean;
  onResize: () => void;
  onResizeError: (error: unknown) => void;
  getRequestAnimationFrame: () => NullableRequestAnimationFrameFn;
  getCancelAnimationFrame: () => NullableCancelAnimationFrameFn;
  getWindowRef: () => (Window & typeof globalThis) | null;
  getViewportResizeDebugState: () => ViewportResizeDebugState | null;
  setViewportResizeDebugState: (state: ViewportResizeDebugState | null) => void;
  isAetherDebugEnabled: () => boolean;
};

type SessionRenderController = {
  cancelScheduledDraw: () => void;
  scheduleDraw: () => void;
  cancelScheduledResize: () => void;
  scheduleResize: () => void;
  scheduleViewportResizeIfChanged: (reason: 'resize' | 'scroll') => void;
  setDrawPaused: (paused: boolean) => void;
};

const toAnimationFrameHandle = (handle: FrameHandle): number | null => (
  typeof handle === 'number' ? handle : null
);

type BrowserFrameDeps = {
  getWindowRef: () => (Window & typeof globalThis) | null;
};

type BrowserFrameFns = {
  getRequestAnimationFrame: () => NullableRequestAnimationFrameFn;
  getCancelAnimationFrame: () => NullableCancelAnimationFrameFn;
};

export const createBrowserFrameFns = (
  deps: BrowserFrameDeps,
): BrowserFrameFns => {
  let cachedRafWindowRef: (Window & typeof globalThis) | null = null;
  let cachedRafFn: NullableRequestAnimationFrameFn = null;
  let cachedCancelRafFn: NullableCancelAnimationFrameFn = null;

  const refreshAnimationFrameFns = (): void => {
    const win = deps.getWindowRef();
    if (win === cachedRafWindowRef) return;
    cachedRafWindowRef = win;
    if (win && typeof win.requestAnimationFrame === 'function'){
      cachedRafFn = win.requestAnimationFrame.bind(win);
    } else {
      cachedRafFn = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null;
    }
    if (win && typeof win.cancelAnimationFrame === 'function'){
      cachedCancelRafFn = win.cancelAnimationFrame.bind(win);
    } else {
      cachedCancelRafFn = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : null;
    }
  };

  return {
    getRequestAnimationFrame: (): NullableRequestAnimationFrameFn => {
      refreshAnimationFrameFns();
      return cachedRafFn;
    },
    getCancelAnimationFrame: (): NullableCancelAnimationFrameFn => {
      refreshAnimationFrameFns();
      return cachedCancelRafFn;
    },
  };
};

export const createSessionRenderController = (
  deps: SessionRenderControllerDeps,
): SessionRenderController => {
  let drawFrameHandle: FrameHandle | null = null;
  let drawFrameUsesTimeout = false;
  let drawPending = false;
  let drawPaused = false;

  let resizeSchedulerHandle: FrameHandle | null = null;
  let resizeSchedulerUsesTimeout = false;
  let pendingResize = false;

  const cancelScheduledDraw = (): void => {
    if (drawFrameHandle !== null){
      if (drawFrameUsesTimeout){
        clearTimeout(drawFrameHandle);
      } else {
        const cancel = deps.getCancelAnimationFrame();
        const frameHandle = toAnimationFrameHandle(drawFrameHandle);
        if (typeof cancel === 'function' && frameHandle !== null){
          cancel(frameHandle);
        }
      }
      drawFrameHandle = null;
      drawFrameUsesTimeout = false;
    }
    drawPending = false;
  };

  const scheduleDraw = (): void => {
    if (drawPaused) return;
    if (drawPending) return;
    if (!deps.getCanvas() || !deps.getContext()) return;
    drawPending = true;
    const raf = deps.getRequestAnimationFrame();
    const runDrawFrame = (): void => {
      drawFrameHandle = null;
      drawFrameUsesTimeout = false;
      drawPending = false;
      if (drawPaused) return;
      try {
        deps.drawNow();
      } catch (err) {
        deps.onDrawError(err);
      }
      if (deps.shouldKeepDrawing()) scheduleDraw();
    };
    if (raf){
      drawFrameUsesTimeout = false;
      drawFrameHandle = raf(runDrawFrame);
    } else {
      drawFrameUsesTimeout = true;
      drawFrameHandle = setTimeout(runDrawFrame, 16);
    }
  };

  const cancelScheduledResize = (): void => {
    if (resizeSchedulerHandle !== null){
      if (resizeSchedulerUsesTimeout){
        clearTimeout(resizeSchedulerHandle);
      } else {
        const cancel = deps.getCancelAnimationFrame();
        const frameHandle = toAnimationFrameHandle(resizeSchedulerHandle);
        if (typeof cancel === 'function' && frameHandle !== null){
          cancel(frameHandle);
        }
      }
      resizeSchedulerHandle = null;
      resizeSchedulerUsesTimeout = false;
    }
    pendingResize = false;
  };

  const flushScheduledResize = (): void => {
    resizeSchedulerHandle = null;
    resizeSchedulerUsesTimeout = false;
    pendingResize = false;
    try {
      deps.onResize();
      scheduleDraw();
    } catch (err) {
      deps.onResizeError(err);
    }
  };

  const scheduleResize = (): void => {
    if (pendingResize) return;
    pendingResize = true;
    const raf = deps.getRequestAnimationFrame();
    if (raf){
      resizeSchedulerUsesTimeout = false;
      resizeSchedulerHandle = raf(flushScheduledResize);
    } else {
      resizeSchedulerUsesTimeout = true;
      resizeSchedulerHandle = setTimeout(flushScheduledResize, 32);
    }
  };

  const scheduleViewportResizeIfChanged = (reason: 'resize' | 'scroll'): void => {
    const viewport = deps.getWindowRef()?.visualViewport;
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

    const prev = deps.getViewportResizeDebugState();
    deps.setViewportResizeDebugState(nextState);
    if (!prev) {
      scheduleResize();
      return;
    }

    const widthChanged = Math.abs(nextState.width - prev.width) >= 1;
    const heightChanged = Math.abs(nextState.height - prev.height) >= 1;
    const scaleChanged = Math.abs(nextState.scale - prev.scale) >= 0.01;
    const offsetChanged = Math.abs(nextState.offsetTop - prev.offsetTop) >= 1
      || Math.abs(nextState.offsetLeft - prev.offsetLeft) >= 1;

    if (deps.isAetherDebugEnabled() && reason === 'scroll' && (heightChanged || scaleChanged || offsetChanged)) {
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

    const winRef = deps.getWindowRef();
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
  };

  const setDrawPaused = (paused: boolean): void => {
    drawPaused = !!paused;
    if (drawPaused){
      cancelScheduledDraw();
    } else {
      scheduleDraw();
    }
  };

  return {
    cancelScheduledDraw,
    scheduleDraw,
    cancelScheduledResize,
    scheduleResize,
    scheduleViewportResizeIfChanged,
    setDrawPaused,
  };
};

export type StatusMeta = {
  id: string;
  label: string;
  icon: string;
};

export type StatusAggregate = {
  statusId: string;
  meta: StatusMeta;
  priority: number;
  stacks: number;
  turnsLeft: number | null;
};

export type RenderableStatusIcon = {
  statusId: string;
  statusName: string;
  tooltip: string;
  priority: number;
  stacks: number;
  turnsLeft: number | null;
};

type StatusAggregateCacheEntry = {
  signature: string;
  aggregates: StatusAggregate[];
};

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

export const DEFAULT_STATUS_ICON_PATH = 'assets/weaken.svg';
export const MAX_STATUS_ICONS_PER_TOKEN = 5;

const CONTROL_TAGS = new Set(['control', 'silence', 'taunt', 'stun', 'sleep', 'fear']);
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
const statusAggregateCache = new WeakMap<ReadonlyArray<Record<string, unknown> | null | undefined>, StatusAggregateCacheEntry>();

const getStatusMeta = (status: Record<string, unknown> | null | undefined): StatusMeta => {
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
};

const computeStatusTurnsLeft = (status: Record<string, unknown> | null | undefined): number | null => {
  const candidates = [status?.dur, status?.ttlTurns, status?.turns, status?.ttl];
  for (const value of candidates){
    const parsed = parseFiniteNumber(value);
    if (parsed !== null){
      return Math.max(0, Math.round(parsed));
    }
  }
  return null;
};

export const buildStatusTooltip = (label: string, stacks: number, turnsLeft: number | null): string => {
  const stacksText = `x${Math.max(1, stacks)}`;
  const turnsText = turnsLeft === null ? '∞T' : `${turnsLeft}T`;
  return `${label} ${stacksText} · ${turnsText}`;
};

const buildStatusAggregateSignature = (statuses: ReadonlyArray<Record<string, unknown> | null | undefined>): string => {
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
};

export const aggregateStatuses = (statusesInput: ReadonlyArray<Record<string, unknown> | null | undefined>): StatusAggregate[] => {
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
};

export const resolveStatusIconPreview = (
  statusesInput: ReadonlyArray<Record<string, unknown> | null | undefined>,
): Array<{ id: string; tooltip: string; priority: number }> => {
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
};

type ResolveReadyStatusIconDeps<TIcon> = {
  statusesInput: ReadonlyArray<Record<string, unknown> | null | undefined>;
  maxIcons?: number;
  ensureStatusIcon: (iconId: string, iconPath: string) => TIcon | null;
  isIconReady: (icon: TIcon | null) => boolean;
};

export const collectRenderableStatusIcons = <TIcon>(
  deps: ResolveReadyStatusIconDeps<TIcon>,
): Array<RenderableStatusIcon & { icon: TIcon }> => {
  const statuses = Array.isArray(deps.statusesInput) ? deps.statusesInput : [];
  if (!statuses.length) return [];
  const maxIcons = Number.isFinite(deps.maxIcons)
    ? Math.max(1, Math.round(deps.maxIcons as number))
    : MAX_STATUS_ICONS_PER_TOKEN;
  const aggregates = aggregateStatuses(statuses);
  const icons: Array<RenderableStatusIcon & { icon: TIcon }> = [];
  for (const aggregate of aggregates) {
    if (icons.length >= maxIcons) break;
    const icon = deps.ensureStatusIcon(aggregate.meta.id, aggregate.meta.icon);
    if (!deps.isIconReady(icon)) continue;
    icons.push({
      icon: icon as TIcon,
      statusId: aggregate.statusId,
      statusName: aggregate.meta.label,
      tooltip: buildStatusTooltip(aggregate.meta.label, aggregate.stacks, aggregate.turnsLeft),
      priority: aggregate.priority,
      stacks: aggregate.stacks,
      turnsLeft: aggregate.turnsLeft,
    });
  }
  return icons;
};