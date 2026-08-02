import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import { applyDamage } from '../apply-damage.ts';
import { consumeShield, readShieldAmount } from '../apply-damage.ts';
import { assertDamageInvariant } from './invariants.ts';
import { resolveDamagePacket } from './damage-resolver.ts';
import { nextEventSerial } from './sequence.ts';
import type { ActionIdentity, CombatantSnapshot, DamageContext, DamagePacket, DamageResolution, SourceAttribution } from './types.ts';

export interface DamageBatchTargetSnapshot extends CombatantSnapshot { trueSelfId: string | null; lifeSerial: number; slot: number; weight: number; capRatio: number | null }
export interface DamageBatchCommand {
  identity: ActionIdentity; source: SourceAttribution;
  packets: readonly DamagePacket[]; contexts: readonly DamageContext[];
  targets: readonly DamageBatchTargetSnapshot[];
  shieldSnapshot: number; specialMitigation: { kind: string; prevented: number } | null;
  batchPolicy: 'single' | 'shared-hp'; sharedHpPolicy: { primaryTargetIid: string | number } | null;
}
export interface DamageBatchSnapshot { command: DamageBatchCommand }
export interface DamageCommitResult { hpBefore: number; hpAfter: number; hpDamage: number; reachedZero: boolean; targetIid: string | number; trueSelfId: string | null; allocationOrder: number }
export interface DamageBatchResolution {
  identity: ActionIdentity; source: SourceAttribution; packetResolutions: ReadonlyArray<{ packet: DamagePacket; resolution: DamageResolution }>;
  shieldDamage: number; shieldBefore: number; shieldAfter: number; preventedDamage: number;
  hpAllocations: ReadonlyArray<DamageCommitResult>;
}

/** Pure: resolves all components and shared allocation without retaining tokens. */
export function resolveDamageBatch(command: DamageBatchCommand): DamageBatchResolution {
  const packetResolutions = command.packets.map((packet, index) => {
    const context = { ...command.contexts[index]!, shield: { shieldBefore: 0 } };
    const resolution = resolveDamagePacket(packet, context);
    assertDamageInvariant(packet, resolution);
    return { packet, resolution };
  });
  const postSpecial = Math.max(0, packetResolutions.reduce((sum, item) => sum + item.resolution.finalRoundedDamage, 0) - (command.specialMitigation?.prevented ?? 0));
  const shieldDamage = command.packets.every(packet => packet.pierceShield) ? 0 : Math.min(command.shieldSnapshot, postSpecial);
  const shieldRemaining = command.shieldSnapshot - shieldDamage;
  const rawHp = postSpecial - shieldDamage;
  const targets = command.targets;
  const totalWeight = targets.reduce((sum, target) => sum + target.weight, 0) || 1;
  let assigned = 0;
  const hpAllocations = targets.map((target, index) => {
    const last = index === targets.length - 1;
    let allocation = command.batchPolicy === 'shared-hp'
      ? (last ? Math.max(0, rawHp - assigned) : Math.floor(rawHp * target.weight / totalWeight))
      : rawHp;
    if (target.capRatio != null) allocation = Math.min(allocation, Math.floor(target.maxHp * target.capRatio));
    assigned += allocation;
    const hpDamage = Math.min(target.currentHp, allocation);
    return { hpBefore: target.currentHp, hpAfter: target.currentHp - hpDamage, hpDamage, reachedZero: target.currentHp > 0 && hpDamage >= target.currentHp, targetIid: target.iid, trueSelfId: target.trueSelfId, allocationOrder: index };
  });
  return { identity: command.identity, source: command.source, packetResolutions, shieldDamage, shieldBefore: command.shieldSnapshot, shieldAfter: shieldRemaining, preventedDamage: packetResolutions.reduce((s, p) => s + p.resolution.preventedDamage, 0) + (command.specialMitigation?.prevented ?? 0), hpAllocations };
}

/** The only standard-damage mutation boundary. It never recalculates damage. */
export function commitDamageBatch(game: SessionState | null, resolution: DamageBatchResolution, targets: readonly UnitToken[]): { commits: DamageCommitResult[]; event: Record<string, unknown> } {
  const primaryIid = resolution.packetResolutions[0]?.packet.targetIid;
  const primary = targets.find(token => (token.iid ?? token.id) === primaryIid);
  const consumed = primary ? consumeShield(primary, resolution.shieldDamage) : 0;
  if (consumed !== resolution.shieldDamage || (primary && readShieldAmount(primary) !== resolution.shieldAfter)) throw new Error('[combat-kernel] shield snapshot/commit mismatch');
  for (const allocation of resolution.hpAllocations) {
    const target = targets.find(token => (token.iid ?? token.id) === allocation.targetIid);
    if (target) applyDamage(target, allocation.hpDamage);
  }
  const event = { type: 'DAMAGE_BATCH_RESOLVED', eventSerial: game ? nextEventSerial(game) : 0, actionId: resolution.identity.actionId, chainId: resolution.identity.chainId, parentActionId: resolution.identity.parentActionId, source: resolution.source, packets: resolution.packetResolutions, shieldAllocation: { before: resolution.shieldBefore, damage: resolution.shieldDamage, after: resolution.shieldAfter }, hpAllocation: resolution.hpAllocations, preventedDamage: resolution.preventedDamage };
  if (game) (((game.runtime ??= {}) as { combatEvents?: Record<string, unknown>[] }).combatEvents ??= []).push(event);
  return { commits: [...resolution.hpAllocations], event };
}

