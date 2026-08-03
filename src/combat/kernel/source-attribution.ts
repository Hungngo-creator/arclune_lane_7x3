import type { CombatId } from './ids.ts';
import type { SourceAttribution } from './types.ts';

interface AttributionEntity { readonly iid?: CombatId | null; readonly id?: CombatId | null }
export interface SourceAttributionInput {
  immediateSource?: AttributionEntity | CombatId | null;
  controller?: AttributionEntity | CombatId | null;
  owner?: AttributionEntity | CombatId | null;
  trueSelf?: AttributionEntity | CombatId | null;
  environment?: AttributionEntity | CombatId | null;
  originActionId?: CombatId | null;
  sourceSide?: 'ally' | 'enemy' | null;
}

const iidOf = (value: AttributionEntity | CombatId | null | undefined): CombatId | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;
  return value?.iid ?? null;
};
const idOf = (value: AttributionEntity | CombatId | null | undefined): CombatId | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;
  return value?.id ?? value?.iid ?? null;
};

export function resolveSourceAttribution(input: SourceAttributionInput): SourceAttribution {
  const sourceIid=iidOf(input.immediateSource);
  return {
    immediateSourceIid: sourceIid,
    sourceIid,
    controllerIid: iidOf(input.controller),
    // Credit is opt-in: controller/definition ids are not stable true-self identity.
    creditTrueSelfId: idOf(input.trueSelf),
    ownerIid: iidOf(input.owner),
    environmentSourceId: idOf(input.environment),
    originActionId: input.originActionId ?? null,
    sourceSide: input.sourceSide ?? null,
  };
}

/** Old statuses stored only a definition id. Keep it readable and warn in development. */
export function resolveLegacyStatusSource(status: { sourceIid?: CombatId; sourceUnitId?: CombatId }): SourceAttribution {
  if (status.sourceIid == null && status.sourceUnitId != null && process.env.NODE_ENV !== 'production') {
    console.warn(`[combat-kernel] status source ${String(status.sourceUnitId)} has no combat iid`);
  }
  return resolveSourceAttribution({ immediateSource: status.sourceIid ?? null });
}
