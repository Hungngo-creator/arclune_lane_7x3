import { getMetaById } from '../catalog.ts';
import { slotIndex } from '../engine.ts';
import { normalizeClassName } from '../utils/domain-normalization.ts';
import { isCombatAlive } from './kernel/life-cycle.ts';
import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

/** The single production owner for ordinary selected-enemy targeting. */
export function pickCombatTarget(game: { readonly tokens: ReadonlyArray<UnitToken> }, attacker: UnitToken): UnitToken | null {
  const foeSide = attacker.side === 'ally' ? 'enemy' : 'ally';
  const pool = game.tokens.filter(token => token.side === foeSide && isCombatAlive(token));
  if (!pool.length) return null;
  const slotOf = (token: UnitToken) => slotIndex(token.side, token.cx, token.cy);
  const bySlot = new Map<number, UnitToken>();
  for (const token of pool) {
    const slot = slotOf(token);
    const duplicate = bySlot.get(slot);
    if (duplicate) throw new Error(`[combat-occupancy] duplicate target occupancy side=${foeSide} slot=${slot} first=${duplicate.id}/${String(duplicate.iid)} second=${token.id}/${String(token.iid)}`);
    bySlot.set(slot, token);
  }
  const distance = (token: UnitToken) => Math.abs(token.cx - attacker.cx) + Math.abs(token.cy - attacker.cy);
  const ordered = [...pool].sort((a, b) => distance(a) - distance(b) || slotOf(a) - slotOf(b));
  const taunter = [...pool].filter(token => token.statuses?.some((status: { id?: string }) => status.id === 'taunt')).sort((a, b) => slotOf(a) - slotOf(b))[0];
  if (taunter) return taunter;
  if (normalizeClassName(getMetaById(attacker.id)?.class) === 'Assassin') {
    const backline = ordered.find(token => slotOf(token) >= 7);
    if (backline) return backline;
  }
  const occupied = new Set(bySlot.keys());
  const blocked = (slot: number) => slot === 8 && (occupied.has(2) || occupied.has(5));
  const actorSlot = slotOf(attacker);
  const priority = [1, 4, 7].includes(actorSlot) ? [3, 6, 9, 2, 5, 8]
    : [3, 6, 9].includes(actorSlot) ? [1, 4, 7, 2, 5, 8]
      : [2, 5, 8].includes(actorSlot) ? [2, 5, 8] : [];
  for (const slot of priority) if (!blocked(slot) && bySlot.has(slot)) return bySlot.get(slot)!;
  return ordered.find(token => !blocked(slotOf(token))) ?? null;
}
