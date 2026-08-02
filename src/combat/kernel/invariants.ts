import type { DamagePacket, DamageResolution } from './types.ts';

const assert = (condition: boolean, message: string): void => { if (!condition) throw new Error(`[combat-kernel] ${message}`); };
const finite = (value: number): boolean => Number.isFinite(value);

export function assertDamageInvariant(packet: DamagePacket, result: DamageResolution): void {
  if (process.env.NODE_ENV === 'production') return;
  assert(packet.actionId !== '' && packet.actionId != null, 'actionId is required');
  assert(packet.packetId !== '' && packet.packetId != null, 'packetId is required');
  assert(packet.targetIid !== '' && packet.targetIid != null, 'targetIid is required');
  assert(finite(packet.reactionDepth) && packet.reactionDepth >= 0, 'reactionDepth must be non-negative');
  for (const [key, value] of Object.entries(result)) assert(finite(value), `${key} must be finite`);
  assert(result.declaredDamage >= 0 && result.hpDamage >= 0 && result.overkillDamage >= 0, 'damage must be non-negative');
  assert(result.shieldDamage <= result.shieldBefore, 'shieldDamage exceeds shield snapshot');
  assert(result.hpDamage + result.overkillDamage <= result.finalRoundedDamage - result.shieldDamage, 'post-shield allocation exceeded');
  for (const value of Object.values(packet.source)) {
    assert(value == null || typeof value === 'string' || typeof value === 'number', 'source attribution contains a mutable object');
  }
}

