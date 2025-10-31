const perf = typeof globalThis !== 'undefined' ? globalThis.performance : undefined;
const hasPerfNow = !!(perf && typeof perf.now === 'function');
let lastFallbackNow = 0;

let sessionOffset = 0;
let sessionReady = false;
let rafOffset: number | null = null;

const readPerfTimeOrigin = (): number | null => {
  if (!perf) return null;
  const originRaw = (perf as { timeOrigin?: unknown }).timeOrigin;
  if (typeof originRaw === 'number' && Number.isFinite(originRaw)) return originRaw;
  const timing = (perf as { timing?: { navigationStart?: number } }).timing;
  const navigationStart = timing?.navigationStart;
  if (typeof navigationStart === 'number' && Number.isFinite(navigationStart)){
    return navigationStart;
  }
  return null;
};

function ensureSessionTimeBase(): void {
  if (sessionReady) return;
  resetSessionTimeBase();
}

export function resetSessionTimeBase(): void {
  const now = safeNow();
  let offset = 0;
  if (hasPerfNow){
    const origin = readPerfTimeOrigin();
    if (origin !== null){
      offset = origin;
    } else if (typeof Date?.now === 'function'){
      offset = Date.now() - now;
    }
  }
  sessionOffset = offset;
  sessionReady = true;
  rafOffset = null;
}

export function safeNow(): number {
  if (hasPerfNow && perf) return perf.now();
  const current = Date.now();
  if (current <= lastFallbackNow) {
    lastFallbackNow += 1;
    return lastFallbackNow;
  }
  lastFallbackNow = current;
  return current;
}

export function sessionNow(): number {
  ensureSessionTimeBase();
  return safeNow() + sessionOffset;
}

export function toSessionTime(value: number): number {
  ensureSessionTimeBase();
  if (!Number.isFinite(value)) return sessionNow();
  return value + sessionOffset;
}

export function normalizeAnimationFrameTimestamp(timestamp?: number): number {
  ensureSessionTimeBase();
  const fallback = sessionNow();
  if (!Number.isFinite(timestamp)) return fallback;
  const numeric = Number(timestamp);
  if (rafOffset === null){
    rafOffset = fallback - numeric;
    return fallback;
  }
  return numeric + rafOffset;
}

export function mergeBusyUntil(
  previous: unknown,
  startedAt: number,
  duration: number,
): number {
  ensureSessionTimeBase();
  const start = Number.isFinite(startedAt) ? startedAt : sessionNow();
  const dur = Number.isFinite(duration) ? Math.max(0, Number(duration)) : 0;
  const prev = Number.isFinite(previous as number) ? Number(previous) : start;
  return Math.max(prev, start + dur);
}