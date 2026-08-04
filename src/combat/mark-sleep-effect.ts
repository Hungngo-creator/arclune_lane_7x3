import { Statuses } from '../statuses.ts';
import { getStatusEntryById } from './status-utils.ts';
import type { UnitToken } from '@shared-types/units';

export interface MarkSleepEffect { readonly markId: string; readonly stacks: number; readonly maxStacks: number; readonly purgeable: boolean; readonly sleepTurnsOnCap: number }

/** Applies the authored mark mechanic without interpreting gameplay tags. */
export function applyMarkSleepEffect(source: UnitToken, target: UnitToken, effect: MarkSleepEffect): void {
  const existing = getStatusEntryById(target, effect.markId);
  if (!existing) {
    Statuses.add(target, { id: effect.markId, kind: 'mark', tag: 'mark', stacks: Math.min(effect.maxStacks, effect.stacks), maxStacks: effect.maxStacks, purgeable: effect.purgeable, sourceUnitId: source.id });
    return;
  }
  const next = Math.min(effect.maxStacks, Math.max(0, Number(existing.status.stacks) || 0) + effect.stacks);
  existing.status.stacks = next;
  existing.status.maxStacks = effect.maxStacks;
  existing.status.purgeable = effect.purgeable;
  if (next < effect.maxStacks) return;
  if (effect.sleepTurnsOnCap > 0) Statuses.add(target, { id: 'sleep', kind: 'debuff', tag: 'sleep', dur: effect.sleepTurnsOnCap, tick: 'turn', sourceUnitId: source.id });
  target.statuses?.splice(existing.index, 1);
}
