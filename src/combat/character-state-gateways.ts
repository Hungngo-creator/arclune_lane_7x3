import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import { commitHealing, commitHpMutation, resolveHealing, resolveMaxHpMutation } from './kernel/hp-mutation.ts';

type RuntimeStat = 'atk' | 'wil' | 'arm' | 'res' | 'agi' | 'spd';
const sourceFor = (unit: UnitToken) => ({ immediateSourceIid: unit.iid ?? unit.id, controllerIid: unit.iid ?? unit.id, creditTrueSelfId: unit.trueSelfId ?? unit.id, ownerIid: unit.iid ?? unit.id, environmentSourceId: null });

export function commitRuntimeStats(unit: UnitToken, values: Partial<Record<RuntimeStat, number>>): void {
  for (const [key, value] of Object.entries(values) as Array<[RuntimeStat, number]>) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`[character-runtime] invalid ${key} mutation`);
    unit[key] = value;
  }
}
export function commitRuntimeStat(unit: UnitToken, key: RuntimeStat, value: number): void { commitRuntimeStats(unit, { [key]: value }); }
export function commitRuntimeHpValue(game: SessionState | null, unit: UnitToken, value: number): void {
  commitHpMutation(game, unit, resolveMaxHpMutation(unit, unit.hpMax, 'unchanged', 'set-value', sourceFor(unit), { setCurrentHp: value }));
}
export function commitRuntimeHealing(game: SessionState | null, unit: UnitToken, amount: number): void {
  commitHealing(game, unit, resolveHealing(unit, amount, sourceFor(unit)));
}
export function commitRuntimeMaxHp(game: SessionState | null, unit: UnitToken, amount: number, direction: 'gain' | 'lose'): void {
  const next = direction === 'gain' ? unit.hpMax + Math.max(0, amount) : Math.max(1, unit.hpMax - Math.max(0, amount));
  commitHpMutation(game, unit, resolveMaxHpMutation(unit, next, 'set-value', direction === 'gain' ? 'set-full' : 'clamp', sourceFor(unit)));
}
