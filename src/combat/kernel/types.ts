import type { CombatId } from './ids.ts';

export type DamageType = 'physical' | 'will' | 'true' | 'reflected';
export type LegacyDamageType = DamageType | 'arcane';
export type HpMutationKind = 'damage' | 'healing' | 'hp-cost' | 'self-damage' | 'sacrifice' | 'max-hp-mutation';

export interface ActionIdentity {
  readonly actionId: CombatId;
  readonly chainId: CombatId;
  readonly parentActionId: CombatId | null;
  readonly actionKind: string;
  readonly actionSerial: number;
}

export interface SourceAttribution {
  readonly immediateSourceIid: CombatId | null;
  readonly controllerIid: CombatId | null;
  readonly creditTrueSelfId: CombatId | null;
  readonly ownerIid: CombatId | null;
  readonly environmentSourceId: CombatId | null;
}

export interface DamagePacket {
  readonly packetId: CombatId;
  readonly actionId: CombatId;
  readonly chainId: CombatId;
  readonly source: SourceAttribution;
  readonly targetIid: CombatId;
  readonly damageType: DamageType;
  readonly declaredDamage: number;
  readonly tags: readonly string[];
  readonly isDot: boolean;
  readonly isReflect: boolean;
  readonly isFollowup: boolean;
  readonly isCounter: boolean;
  readonly reactionDepth: number;
  readonly pierceShield: boolean;
}

export interface CombatantSnapshot {
  readonly iid: CombatId;
  readonly currentHp: number;
  readonly maxHp: number;
  readonly arm: number;
  readonly res: number;
}

export interface DefensePenetration {
  readonly flat: number;
  readonly percent: number;
}

export interface DefenseModifiers {
  readonly flat: number;
  readonly percent: number;
}

export interface ShieldSnapshot {
  readonly shieldBefore: number;
}

export interface DamageContext {
  readonly attacker: CombatantSnapshot;
  readonly defender: CombatantSnapshot;
  readonly defensePenetration: DefensePenetration;
  readonly defenseModifiers: DefenseModifiers;
  readonly outgoingModifiers: readonly number[];
  readonly incomingModifiers: readonly number[];
  readonly genericDamageReduction: number;
  readonly reflectDamageReduction: number;
  readonly shield: ShieldSnapshot;
}

export interface DamageResolution {
  readonly declaredDamage: number;
  readonly incomingDamage: number;
  readonly effectiveDefense: number;
  readonly defenseMultiplier: number;
  readonly postMitigationDamage: number;
  readonly shieldBefore: number;
  readonly shieldDamage: number;
  readonly shieldAfter: number;
  readonly hpDamage: number;
  readonly overkillDamage: number;
  readonly preventedDamage: number;
  readonly finalRoundedDamage: number;
}

export interface HpMutation {
  readonly kind: HpMutationKind;
  readonly amount: number;
  readonly source: SourceAttribution;
  readonly canKill: boolean;
  readonly currentHpPolicy: string;
  readonly maxHpPolicy: string;
  readonly resetPolicy: string;
}

export function normalizeDamageType(type: LegacyDamageType | string): DamageType {
  if (type === 'arcane') return 'will';
  if (type === 'will' || type === 'true' || type === 'reflected') return type;
  return 'physical';
}

