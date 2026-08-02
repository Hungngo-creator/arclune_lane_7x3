export type CombatId = string | number;

let compatibilitySerial = 0;

/** Transitional deterministic-within-process ids until actions own their ids. */
export function nextCompatibilityId(prefix: 'action' | 'chain' | 'packet'): string {
  compatibilitySerial += 1;
  return `legacy-${prefix}-${compatibilitySerial}`;
}

