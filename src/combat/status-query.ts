import type { StatusEffect } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import { ensureStatusList } from './status-utils.ts';

export interface StatusTargetContext {
  attackType?: string;
}

const TAUNT_STATUS_ID = 'taunt';
const ALLURE_STATUS_ID = 'allure';

const isTokenCandidate = (value: unknown): value is UnitToken => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as UnitToken;
  return typeof candidate.cx === 'number' && typeof candidate.cy === 'number' && typeof candidate.side === 'string';
};

export function resolveTarget(
  attacker: UnitToken,
  candidates: ReadonlyArray<UnitToken>,
  ctx: StatusTargetContext = {},
): UnitToken | null {
  const attackType = ctx.attackType ?? 'basic';
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  let nearestTaunter: UnitToken | null = null;
  let nearestTaunterDistance = Number.POSITIVE_INFINITY;
  let nearestTaunterNonAllure: UnitToken | null = null;
  let nearestTaunterNonAllureDistance = Number.POSITIVE_INFINITY;
  let hasNonAllureCandidate = false;

  for (const candidate of candidates) {
    if (!isTokenCandidate(candidate)) continue;
    const distance = Math.abs(candidate.cx - attacker.cx) + Math.abs(candidate.cy - attacker.cy);
    const statuses: StatusEffect[] = ensureStatusList(candidate);
    let isAllure = false;
    let hasTaunt = false;
    for (const status of statuses) {
      if (!status) continue;
      if (status.id === ALLURE_STATUS_ID) isAllure = true;
      if (status.id === TAUNT_STATUS_ID) hasTaunt = true;
      if (isAllure && hasTaunt) break;
    }
    if (!isAllure) hasNonAllureCandidate = true;
    if (!hasTaunt) continue;
    if (distance < nearestTaunterDistance) {
      nearestTaunter = candidate;
      nearestTaunterDistance = distance;
    }
    if (!isAllure && distance < nearestTaunterNonAllureDistance) {
      nearestTaunterNonAllure = candidate;
      nearestTaunterNonAllureDistance = distance;
    }
  }

  if (attackType === 'basic' && hasNonAllureCandidate) return nearestTaunterNonAllure;
  return nearestTaunter;
}
