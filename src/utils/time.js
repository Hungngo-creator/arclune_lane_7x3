const perf = typeof globalThis !== 'undefined' ? globalThis.performance : undefined;
const hasPerfNow = !!(perf && typeof perf.now === 'function');
let lastFallbackNow = 0;

export function safeNow(){
  if (hasPerfNow) return perf.now();
  const current = Date.now();
  if (current <= lastFallbackNow) {
    lastFallbackNow += 1;
    return lastFallbackNow;
  }
  lastFallbackNow = current;
  return current;
}
