import type { UnitToken } from '@shared-types/units';

export type CombatIdentityKind = 'collection-unit' | 'leader' | 'npc' | 'boss' | 'summon' | 'summoned-creep' | 'combat-object';
const OWNS_TRUE_SELF: ReadonlySet<CombatIdentityKind> = new Set(['collection-unit', 'leader', 'npc', 'boss']);

/** Establishes instance identity without ever treating a definition id as a true self. */
export function ensureCombatIdentity(unit: UnitToken, kind: CombatIdentityKind): UnitToken {
  if (unit.iid == null) throw new Error(`[combat-identity] ${kind} requires an instance iid`);
  if (OWNS_TRUE_SELF.has(kind)) {
    unit.trueSelfId ??= `true-self:${kind}:${String(unit.iid)}`;
    unit.lifeSerial ??= 1;
  } else {
    delete unit.trueSelfId; delete unit.lifeSerial;
  }
  return unit;
}

/** Called only by the revive transition, never by healing, moving, or reinsertion. */
export function beginRevivedLife(unit: UnitToken): number {
  if (!unit.trueSelfId) throw new Error('[combat-identity] cannot revive a unit without trueSelfId');
  const current = unit.lifeSerial ?? 1;
  if (!Number.isInteger(current) || current < 1) throw new Error('[combat-identity] malformed lifeSerial');
  unit.lifeSerial = current + 1; return unit.lifeSerial;
}

export function assertHpBearerIdentity(unit: UnitToken, kind: CombatIdentityKind): void {
  if ((unit.hpMax ?? 0) > 0 && OWNS_TRUE_SELF.has(kind) && !unit.trueSelfId) throw new Error(`[combat-identity] HP-bearing ${kind} is missing trueSelfId`);
}
