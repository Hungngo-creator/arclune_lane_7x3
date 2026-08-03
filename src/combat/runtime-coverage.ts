import type { RosterEntry } from '../catalog.ts';

const ULTIMATE_TYPES = new Set([
  'auto-cast-fury', 'burst', 'clone-summon', 'drain', 'dual-form', 'dual-stance', 'equalizeHP',
  'evolution', 'executioner', 'finisher', 'fortify', 'haste', 'heal', 'hpTradeBurst', 'revive',
  'sleep', 'strikeLaneMid', 'summon', 'summon-random', 'time-rift', 'ultimate', 'weather-control', 'worldshift',
]);
const PASSIVE_EFFECTS = new Set([
  'allyScaling', 'applyDebuff', 'applyFormRegen', 'conditionalBuff', 'gainATK%', 'gainBonus',
  'gainDamageBonus', 'gainDynamicAtkWilStack', 'gainKillScalingAndDebuffImmunity', 'gainMaxHPPercent',
  'gainRES%', 'gainWIL%', 'grantColumnShieldAndAura', 'grantFollowUp', 'grantStats',
  'manageFlyingSwordsAndLawUpkeep', 'phaseShiftWhenCriticalHP', 'placeMark', 'reduceDamageFromTag',
  'scalePerSummon', 'stackBuff', 'summonClone', 'surviveAtOneHP', 'swapStance', 'teamHeal',
]);

export type RuntimeCoverage = { unsupportedUltimateTypes: string[]; unsupportedPassiveEffects: string[] };
export function inventoryRosterRuntimeCoverage(roster: readonly RosterEntry[]): RuntimeCoverage {
  const unsupportedUltimateTypes: string[] = [];
  const unsupportedPassiveEffects: string[] = [];
  for (const unit of roster) {
    const ult = unit.kit?.ult as Record<string, unknown> | null | undefined;
    if (typeof ult?.type === 'string' && !ULTIMATE_TYPES.has(ult.type)) unsupportedUltimateTypes.push(`${unit.id} -> ${ult.type}`);
    for (const passive of unit.kit?.passives ?? []) {
      const effects = [passive.effect, ...(Array.isArray(passive.effects) ? passive.effects : [])];
      for (const effect of effects) {
        const key = typeof effect === 'string' ? effect : effect && typeof effect === 'object' ? String((effect as { type?: string; kind?: string }).type ?? (effect as { kind?: string }).kind ?? '') : '';
        if (key && !PASSIVE_EFFECTS.has(key)) unsupportedPassiveEffects.push(`${unit.id} -> ${key}`);
      }
    }
  }
  return { unsupportedUltimateTypes, unsupportedPassiveEffects };
}

export function formatRuntimeCoverageFailures(coverage: RuntimeCoverage): string {
  return `Unsupported Ultimate types:\n  ${coverage.unsupportedUltimateTypes.join('\n  ') || '(none)'}\n\nUnsupported passive effects:\n  ${coverage.unsupportedPassiveEffects.join('\n  ') || '(none)'}`;
}
