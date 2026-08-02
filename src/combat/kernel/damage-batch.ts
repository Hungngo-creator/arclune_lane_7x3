import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import { applyDamage, consumeShield, readShieldAmount } from '../apply-damage.ts';
import { assertDamageInvariant } from './invariants.ts';
import { resolveDamagePacket } from './damage-resolver.ts';
import { nextEventSerial } from './sequence.ts';
import type { ActionIdentity, AppliedPacketResult, CombatantSnapshot, DamageContext, DamagePacket, DamageResolution, SourceAttribution } from './types.ts';

export interface DamageBatchTargetSnapshot extends CombatantSnapshot { trueSelfId: string | null; lifeSerial: number; slot: number; weight: number; capRatio: number | null }
export interface DamageBatchCommand {
  identity: ActionIdentity; source: SourceAttribution; packets: readonly DamagePacket[]; contexts: readonly DamageContext[];
  targets: readonly DamageBatchTargetSnapshot[]; shieldSnapshot: number;
  specialMitigation: { kind: string; prevented: number } | null;
  batchPolicy: 'single' | 'shared-hp'; sharedHpPolicy: { primaryTargetIid: string | number } | null;
}
export interface DamageBatchSnapshot { command: DamageBatchCommand }
export interface DamageCommitResult { hpBefore: number; hpAfter: number; hpDamage: number; reachedZero: boolean; targetIid: string | number; trueSelfId: string | null; lifeSerial?: number; allocationOrder: number }
export interface DamageBatchResolution {
  identity: ActionIdentity; source: SourceAttribution;
  packetResolutions: ReadonlyArray<{ packet: DamagePacket; resolution: DamageResolution }>;
  appliedPackets: readonly AppliedPacketResult[]; shieldDamage: number; shieldBefore: number; shieldAfter: number;
  preventedDamage: number; hpAllocations: ReadonlyArray<DamageCommitResult>; targetSnapshots: readonly DamageBatchTargetSnapshot[];
}

const invariant: (condition: unknown, message: string) => asserts condition = (condition, message) => { if (!condition) throw new Error(`[combat-kernel] ${message}`); };
const finiteNonnegative = (value: number, field: string): number => { invariant(Number.isFinite(value) && value >= 0, `${field} must be finite and non-negative`); return value; };

/** Pure: resolves components, deterministic special/shield allocation, then authoritative HP allocation. */
export function resolveDamageBatch(command: DamageBatchCommand): DamageBatchResolution {
  invariant(command.packets.length > 0, 'damage batch packets must not be empty');
  invariant(command.packets.length === command.contexts.length, 'packets and contexts length mismatch');
  invariant(command.targets.length > 0, 'damage batch targets must not be empty');
  finiteNonnegative(command.shieldSnapshot, 'shieldSnapshot');
  const primaryIid = command.packets[0]!.targetIid;
  const serials = new Set<number>(); let previous = 0;
  command.packets.forEach((packet) => {
    invariant(packet.actionId === command.identity.actionId && packet.chainId === command.identity.chainId, 'packet identity does not match batch identity');
    invariant(packet.targetIid === primaryIid, 'packet target does not match primary target');
    invariant(Number.isInteger(packet.packetSerial) && packet.packetSerial! > previous && !serials.has(packet.packetSerial!), 'packetSerial must be unique and strictly increasing');
    previous = packet.packetSerial!; serials.add(previous);
  });
  invariant(new Set(command.targets.map(target => target.iid)).size === command.targets.length, 'duplicate target iid');
  command.targets.forEach((target, index) => {
    finiteNonnegative(target.currentHp, `targets[${index}].currentHp`); finiteNonnegative(target.maxHp, `targets[${index}].maxHp`);
    finiteNonnegative(target.weight, `targets[${index}].weight`); invariant(Number.isInteger(target.lifeSerial) && target.lifeSerial >= 1, `targets[${index}].lifeSerial must be positive integer`);
    if (target.capRatio != null) finiteNonnegative(target.capRatio, `targets[${index}].capRatio`);
  });
  invariant(command.targets.some(target => target.iid === primaryIid), 'primary target is missing from target snapshots');

  const packetResolutions = command.packets.map((packet, index) => {
    const resolution = resolveDamagePacket(packet, { ...command.contexts[index]!, shield: { shieldBefore: 0 } });
    assertDamageInvariant(packet, resolution); return { packet, resolution };
  });
  const mitigated = packetResolutions.map(item => item.resolution.finalRoundedDamage);
  const mitigatedTotal = mitigated.reduce((sum, value) => sum + value, 0);
  const requestedSpecial = finiteNonnegative(command.specialMitigation?.prevented ?? 0, 'specialMitigation.prevented');
  const specialTotal = Math.min(mitigatedTotal, requestedSpecial);
  let specialAssigned = 0;
  const specialByPacket = mitigated.map((value, index) => {
    const amount = index === mitigated.length - 1 ? specialTotal - specialAssigned
      : (mitigatedTotal === 0 ? 0 : Math.floor(specialTotal * value / mitigatedTotal));
    specialAssigned += amount; return amount;
  });
  let shieldRemaining = command.shieldSnapshot;
  const provisional = packetResolutions.map((item, index) => {
    const afterSpecial = mitigated[index]! - specialByPacket[index]!;
    const shieldDamage = item.packet.pierceShield ? 0 : Math.min(shieldRemaining, afterSpecial);
    shieldRemaining -= shieldDamage;
    return { item, mitigatedDamage: mitigated[index]!, specialPreventedDamage: specialByPacket[index]!, shieldDamage, postShieldDamage: afterSpecial - shieldDamage };
  });
  const shieldDamage = command.shieldSnapshot - shieldRemaining;
  const rawHp = provisional.reduce((sum, item) => sum + item.postShieldDamage, 0);
  const totalWeight = command.targets.reduce((sum, target) => sum + target.weight, 0) || 1;
  let assigned = 0;
  const hpAllocations = command.targets.map((target, index) => {
    const last = index === command.targets.length - 1;
    let allocation = command.batchPolicy === 'shared-hp' ? (last ? Math.max(0, rawHp - assigned) : Math.floor(rawHp * target.weight / totalWeight)) : rawHp;
    if (target.capRatio != null) allocation = Math.min(allocation, Math.floor(target.maxHp * target.capRatio));
    assigned += allocation; const hpDamage = Math.min(target.currentHp, allocation);
    return { hpBefore: target.currentHp, hpAfter: target.currentHp - hpDamage, hpDamage, reachedZero: target.currentHp > 0 && hpDamage >= target.currentHp, targetIid: target.iid, trueSelfId: target.trueSelfId, lifeSerial: target.lifeSerial, allocationOrder: index };
  });
  let committedRemaining = hpAllocations.reduce((sum, item) => sum + item.hpDamage, 0);
  const appliedPackets: AppliedPacketResult[] = provisional.map(({ item, ...values }) => {
    const effectiveHpDamage = Math.min(committedRemaining, values.postShieldDamage); committedRemaining -= effectiveHpDamage;
    return { packetId: item.packet.packetId, packetSerial: item.packet.packetSerial!, targetIid: item.packet.targetIid, ...values, effectiveHpDamage, overkillDamage: values.postShieldDamage - effectiveHpDamage };
  });
  return { identity: command.identity, source: command.source, packetResolutions, appliedPackets, shieldDamage, shieldBefore: command.shieldSnapshot, shieldAfter: shieldRemaining,
    preventedDamage: packetResolutions.reduce((sum, item) => sum + item.resolution.preventedDamage, 0) + specialTotal,
    hpAllocations, targetSnapshots: command.targets.map(target => ({ ...target })) };
}

/** Atomic standard-damage mutation boundary: every snapshot is checked before the first mutation. */
export function commitDamageBatch(game: SessionState | null, resolution: DamageBatchResolution, targets: readonly UnitToken[]): { commits: DamageCommitResult[]; event: Record<string, unknown> } {
  invariant(resolution.packetResolutions.length > 0, 'cannot commit empty damage batch');
  invariant(new Set(targets.map(token => token.iid ?? token.id)).size === targets.length, 'duplicate commit target iid');
  const byIid = new Map(targets.map(token => [token.iid ?? token.id, token]));
  for (const snapshot of resolution.targetSnapshots) {
    const target = byIid.get(snapshot.iid); invariant(target, `allocation target ${String(snapshot.iid)} is missing`);
    invariant(Number(target.hp ?? 0) === snapshot.currentHp, `stale hp snapshot for ${String(snapshot.iid)}`);
    invariant(Number(target.hpMax ?? 0) === snapshot.maxHp, `stale maxHp snapshot for ${String(snapshot.iid)}`);
    invariant(Number(target.lifeSerial ?? 1) === snapshot.lifeSerial, `stale lifeSerial snapshot for ${String(snapshot.iid)}`);
  }
  const primaryIid = resolution.packetResolutions[0]!.packet.targetIid;
  const primary = byIid.get(primaryIid); invariant(primary, 'primary target is missing');
  invariant(readShieldAmount(primary) === resolution.shieldBefore, 'stale shield snapshot');
  resolution.hpAllocations.forEach((allocation) => {
    invariant(byIid.has(allocation.targetIid), `allocation target ${String(allocation.targetIid)} is missing`);
    invariant(allocation.hpDamage >= 0 && allocation.hpDamage <= allocation.hpBefore && allocation.hpAfter === allocation.hpBefore - allocation.hpDamage, 'invalid HP allocation');
  });
  const consumed = consumeShield(primary, resolution.shieldDamage);
  invariant(consumed === resolution.shieldDamage && readShieldAmount(primary) === resolution.shieldAfter, 'shield commit mismatch');
  for (const allocation of resolution.hpAllocations) applyDamage(byIid.get(allocation.targetIid)!, allocation.hpDamage);
  const event = { type: 'DAMAGE_BATCH_RESOLVED', state: 'committed', eventSerial: game ? nextEventSerial(game) : 0,
    actionId: resolution.identity.actionId, chainId: resolution.identity.chainId, parentActionId: resolution.identity.parentActionId,
    source: resolution.source, packets: resolution.appliedPackets, shieldAllocation: { before: resolution.shieldBefore, damage: resolution.shieldDamage, after: resolution.shieldAfter }, hpAllocation: resolution.hpAllocations, preventedDamage: resolution.preventedDamage };
  if (game) (((game.runtime ??= {}) as { combatEvents?: Record<string, unknown>[] }).combatEvents ??= []).push(event);
  return { commits: [...resolution.hpAllocations], event };
}
