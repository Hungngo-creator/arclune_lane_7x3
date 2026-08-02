import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import { consumeShield, readShieldAmount } from '../apply-damage.ts';
import { resolveDamageBatch, type DamageBatchCommand, type DamageBatchResolution } from './damage-batch.ts';
import { createHpZeroCandidate, type HPZeroCandidate } from './life-cycle.ts';
import { nextEventSerial } from './sequence.ts';
import type { ActionIdentity, SourceAttribution } from './types.ts';

export interface ActionResolutionCommand { identity: ActionIdentity; source: SourceAttribution; attackerSnapshot: Readonly<Record<string, unknown>>; damageBatches: readonly DamageBatchCommand[]; targetOrder: readonly (string | number)[]; reactionMetadata?: Readonly<Record<string, unknown>> }
export interface ActionResolutionSnapshot { command: ActionResolutionCommand; targetSnapshots: ReadonlyArray<{ iid: string | number; hp: number; hpMax: number; lifeSerial: number; shield: number }> }
export interface ActionResolution { snapshot: ActionResolutionSnapshot; batches: readonly DamageBatchResolution[] }
export interface ActionTargetAggregate { targetIid: string | number; trueSelfId: string | null; lifeSerial: number; totalHpDamage: number; totalShieldDamage: number; totalOverkillDamage: number; packetCount: number; reachedZero: boolean; source: SourceAttribution; actionId: string | number; chainId: string | number }
export interface ActionCommitResult { identity: ActionIdentity; aggregates: readonly ActionTargetAggregate[]; hpZeroCandidates: readonly HPZeroCandidate[]; event: Record<string, unknown> }
const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => { if (!condition) throw new Error(`[combat-kernel] ${message}`); };

/** Resolves every target from the same pre-action snapshot without mutation. */
export function resolveAction(command: ActionResolutionCommand): ActionResolution {
  assert(command.damageBatches.every(batch => batch.identity.actionId === command.identity.actionId), 'batch belongs to another action');
  const targets = new Map<string | number, ActionResolutionSnapshot['targetSnapshots'][number]>();
  for (const batch of command.damageBatches) for (const target of batch.targets) targets.set(target.iid, { iid: target.iid, hp: target.currentHp, hpMax: target.maxHp, lifeSerial: target.lifeSerial, shield: batch.packets[0]?.targetIid === target.iid ? batch.shieldSnapshot : 0 });
  return { snapshot: { command, targetSnapshots: [...targets.values()] }, batches: command.damageBatches.map(resolveDamageBatch) };
}

/** Prevalidates the complete action, then commits every shield/HP before publishing success or lethal candidates. */
export function commitActionResolution(game: SessionState, resolution: ActionResolution, targets: readonly UnitToken[]): ActionCommitResult {
  assert(new Set(resolution.snapshot.command.targetOrder).size === resolution.snapshot.command.targetOrder.length, 'targetOrder contains duplicates');
  const byIid = new Map(targets.map(target => [target.iid ?? target.id, target]));
  for (const snapshot of resolution.snapshot.targetSnapshots) { const target = byIid.get(snapshot.iid); assert(target, `target ${String(snapshot.iid)} missing`); assert(Number(target.hp ?? 0) === snapshot.hp && Number(target.hpMax ?? 0) === snapshot.hpMax && Number(target.lifeSerial ?? 1) === snapshot.lifeSerial, `stale target ${String(snapshot.iid)}`); }
  for (const batch of resolution.batches) { const primary = byIid.get(batch.packetResolutions[0]!.packet.targetIid); assert(primary && readShieldAmount(primary) === batch.shieldBefore, 'stale shield snapshot'); }
  const totals = new Map<string | number, ActionTargetAggregate>();
  for (const batch of resolution.batches) {
    const primaryIid = batch.packetResolutions[0]!.packet.targetIid; const primary = byIid.get(primaryIid)!; assert(consumeShield(primary, batch.shieldDamage) === batch.shieldDamage, 'shield commit mismatch');
    for (const allocation of batch.hpAllocations) {
      const target = byIid.get(allocation.targetIid)!; target.hp = allocation.hpAfter;
      const current = totals.get(allocation.targetIid) ?? { targetIid: allocation.targetIid, trueSelfId: allocation.trueSelfId, lifeSerial: allocation.lifeSerial ?? 1, totalHpDamage: 0, totalShieldDamage: 0, totalOverkillDamage: 0, packetCount: 0, reachedZero: false, source: batch.source, actionId: batch.identity.actionId, chainId: batch.identity.chainId };
      current.totalHpDamage += allocation.hpDamage; current.reachedZero ||= allocation.reachedZero;
      if (allocation.targetIid === primaryIid) { current.totalShieldDamage += batch.shieldDamage; current.totalOverkillDamage += batch.appliedPackets.reduce((sum, packet) => sum + packet.overkillDamage, 0); current.packetCount += batch.appliedPackets.length; }
      totals.set(allocation.targetIid, current);
    }
  }
  const aggregates = resolution.snapshot.command.targetOrder.map(iid => totals.get(iid)).filter((value): value is ActionTargetAggregate => !!value);
  const hpZeroCandidates = aggregates.filter(item => item.reachedZero).map(item => createHpZeroCandidate(game, byIid.get(item.targetIid)!, resolution.snapshot.command.identity, item.source, 'damage', item.totalHpDamage, item.totalOverkillDamage));
  const event = { type: 'ACTION_COMMITTED', eventSerial: nextEventSerial(game), actionId: resolution.snapshot.command.identity.actionId, chainId: resolution.snapshot.command.identity.chainId, parentActionId: resolution.snapshot.command.identity.parentActionId, aggregates, reactionMetadata: resolution.snapshot.command.reactionMetadata ?? {} };
  (((game.runtime ??= {}) as { combatEvents?: Record<string, unknown>[] }).combatEvents ??= []).push(event);
  return { identity: resolution.snapshot.command.identity, aggregates, hpZeroCandidates, event };
}
