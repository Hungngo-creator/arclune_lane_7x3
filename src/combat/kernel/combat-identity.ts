import type { UnitToken } from '@shared-types/units';

export type CombatIdentityKind = 'collection-unit' | 'leader' | 'npc' | 'boss' | 'summon' | 'summoned-creep' | 'clone' | 'combat-object';
const OWNS_TRUE_SELF: ReadonlySet<CombatIdentityKind> = new Set(['collection-unit', 'leader', 'npc', 'boss']);

/** Establishes instance identity without ever treating a definition id as a true self. */
export function ensureCombatIdentity(unit: UnitToken, kind: CombatIdentityKind): UnitToken {
  unit.entityKind = kind;
  if (unit.iid == null) throw new Error(`[combat-identity] ${kind} requires an instance iid`);
  if (OWNS_TRUE_SELF.has(kind)) {
    unit.trueSelfId ??= `true-self:${kind}:${String(unit.iid)}`;
    unit.incarnationSerial ??= 1;
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
/** Validates canonical spawn identity without consulting legacy flags. */
export function assertCombatIdentity(unit: UnitToken): CombatIdentityKind {
  const kind = unit.entityKind;
  if (!kind) throw new Error('[combat-identity] combat token is missing entityKind');
  if (unit.iid == null) throw new Error(`[combat-identity] ${kind} requires an instance iid`);
  assertHpBearerIdentity(unit, kind);
  if (OWNS_TRUE_SELF.has(kind)) {
    if (!Number.isInteger(unit.incarnationSerial) || Number(unit.incarnationSerial) < 1) throw new Error(`[combat-identity] ${kind} has malformed incarnationSerial`);
    if (!Number.isInteger(unit.lifeSerial) || Number(unit.lifeSerial) < 1) throw new Error(`[combat-identity] ${kind} has malformed lifeSerial`);
  }
  return kind;
}
