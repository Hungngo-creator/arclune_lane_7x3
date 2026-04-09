import type { StatusEffect } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';

export interface StatusEntry {
  statuses: StatusEffect[];
  index: number;
  status: StatusEffect;
}

export function ensureStatusList(unit?: UnitToken | null): StatusEffect[] {
  if (!unit) return [];
  if (!Array.isArray(unit.statuses)) {
    unit.statuses = [];
  }
  return unit.statuses;
}

export function getStatusEntryById(
  target: UnitToken | null | undefined,
  statusId: string,
  statuses?: StatusEffect[],
): StatusEntry | null {
  const index = findStatusIndexById(target, statusId, statuses);
  if (index < 0) return null;
  const list = statuses ?? (Array.isArray(target?.statuses) ? target.statuses : null);
  if (!list) return null;
  const status = list[index];
  if (!status) return null;
  return { statuses: list, index, status };
}

export function findStatusIndexById(
  target: UnitToken | null | undefined,
  statusId: string,
  statuses?: StatusEffect[],
): number {
  if (!target || !statusId) return -1;
  const list = statuses ?? (Array.isArray(target.statuses) ? target.statuses : null);
  if (!list || list.length === 0) return -1;
  for (let i = 0; i < list.length; i += 1) {
    if (list[i]?.id === statusId) return i;
  }
  return -1;
}
