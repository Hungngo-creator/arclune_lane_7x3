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
  if (!target || !statusId) return null;
  const list = statuses ?? (Array.isArray(target.statuses) ? target.statuses : null);
  if (!list || list.length === 0) return null;

  for (let i = 0; i < list.length; i += 1) {
    const status = list[i];
    if (status?.id !== statusId) continue;
    return { statuses: list, index: i, status };
  }
  return null;
}
