export function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clampMin(value: unknown, min: number, fallback = 0): number {
  return Math.max(min, toFiniteNumber(value, fallback));
}

export function toFloorInt(value: unknown, fallback = 0): number {
  return Math.floor(toFiniteNumber(value, fallback));
}

export function toRoundedInt(value: unknown, fallback = 0): number {
  return Math.round(toFiniteNumber(value, fallback));
}

export function toNonNegativeFloorInt(value: unknown, fallback = 0): number {
  return Math.max(0, toFloorInt(value, fallback));
}

/** Canonical combat HP contract: finite, non-negative integers rounded down. */
export function normalizeCombatHpValue(value: unknown, field = 'hp'): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`[combat-kernel] ${field} must be finite`);
  return Math.max(0, Math.floor(parsed));
}

/** Reads HP as one state so current HP can never exceed Max HP. */
export function readCombatHpState(unit: { hp?: unknown; hpMax?: unknown } | null | undefined): { hp: number; hpMax: number } {
  const hpMax = normalizeCombatHpValue(unit?.hpMax ?? 0, 'hpMax');
  return { hp: Math.min(hpMax, normalizeCombatHpValue(unit?.hp ?? hpMax, 'hp')), hpMax };
}

/** Authoritative ingress/commit normalizer. A fractionally full unit stays full. */
export function normalizeCombatHpState<T extends { hp?: unknown; hpMax?: unknown }>(unit: T): { hp: number; hpMax: number } {
  const state = readCombatHpState(unit);
  unit.hpMax = state.hpMax;
  unit.hp = state.hp;
  return state;
}

export function toPositiveTurns(value: unknown, fallback = 1): number {
  const direct = toFiniteNumber(value, NaN);
  if (!Number.isFinite(direct) || direct <= 0) return Math.max(1, Math.round(fallback));
  return Math.max(1, Math.round(direct));
}
export function readAtkWilPower(unit: { atk?: unknown; wil?: unknown } | null | undefined): number {
  if (!unit) return 0;
  return Math.max(0, toFiniteNumber(unit.atk, 0) + toFiniteNumber(unit.wil, 0));
}

export function readUnitHpState(unit: { hp?: unknown; hpMax?: unknown } | null | undefined): { hp: number; hpMax: number } {
  const state = readCombatHpState({ hp: unit?.hp ?? 1, hpMax: unit?.hpMax ?? 1 });
  const hpMax = Math.max(1, state.hpMax);
  const hp = Math.min(hpMax, state.hp);
  return { hp, hpMax };
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}