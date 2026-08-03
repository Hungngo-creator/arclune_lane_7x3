import type { CombatId } from './ids.ts';

export type DamageType = 'physical' | 'will' | 'true' | 'reflected';
export type DamageOrigin = 'direct' | 'followup' | 'counter' | 'dot' | 'reflected' | 'environment' | 'self-damage';
export type ReactionAggregation = 'packet' | 'action';
export interface ReactionPolicy {
  readonly canLifesteal: boolean; readonly canReflect: boolean; readonly canCounter: boolean;
  readonly canTriggerOnDamage: boolean; readonly canTriggerOnHit: boolean;
  readonly canGrantRage: boolean; readonly canTriggerOnKill: boolean;
  readonly aggregation: ReactionAggregation;
}
export type LegacyDamageType = DamageType | 'arcane';
export type HpMutationKind = 'damage' | 'healing' | 'hp-cost' | 'self-damage' | 'sacrifice' | 'non-damage-hp-loss' | 'execute' | 'max-hp-mutation';
export type CurrentHpPolicy = 'preserve-absolute' | 'preserve-ratio' | 'clamp' | 'set-full' | 'set-value';
export type MaxHpPolicy = 'unchanged' | 'add-flat' | 'add-percent' | 'set-value';
export type MutationResetPolicy = 'on-revive' | 'on-rebirth' | 'on-leave-battle' | 'never-within-battle';

export interface ActionIdentity {
  readonly actionId: CombatId;
  readonly chainId: CombatId;
  readonly parentActionId: CombatId | null;
  readonly actionKind: string;
  readonly actionSerial: number;
}

export interface SourceAttribution {
  readonly immediateSourceIid: CombatId | null;
  readonly sourceIid?: CombatId | null;
  readonly controllerIid: CombatId | null;
  readonly creditTrueSelfId: CombatId | null;
  readonly ownerIid: CombatId | null;
  readonly environmentSourceId: CombatId | null;
  readonly originActionId?: CombatId | null;
  readonly sourceSide?: 'ally' | 'enemy' | null;
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
  readonly packetSerial?: number;
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

/** Pure mitigation output. HP and shield are deliberately absent until batch allocation. */
export interface PacketMitigationResult {
  readonly declaredDamage: number; readonly incomingDamage: number; readonly effectiveDefense: number;
  readonly defenseMultiplier: number; readonly postMitigationDamage: number;
  readonly roundedMitigatedDamage: number; readonly defensePreventedDamage: number;
}

export interface AppliedPacketResult {
  readonly packetId: CombatId; readonly packetSerial: number; readonly targetIid: CombatId;
  readonly mitigatedDamage: number; readonly specialPreventedDamage: number;
  readonly shieldDamage: number; readonly postShieldDamage: number;
  readonly effectiveHpDamage: number; readonly overkillDamage: number;
}

export interface HpMutation {
  readonly kind: HpMutationKind;
  readonly amount: number;
  readonly source: SourceAttribution;
  readonly canKill: boolean;
  readonly currentHpPolicy: CurrentHpPolicy;
  readonly maxHpPolicy: MaxHpPolicy;
  readonly resetPolicy: MutationResetPolicy;
}

export function normalizeDamageType(type: LegacyDamageType | string): DamageType {
  if (type === 'arcane') return 'will';
  if (type === 'physical' || type === 'will' || type === 'true' || type === 'reflected') return type;
  throw new Error(`[combat-kernel] unknown damage type: ${String(type)}`);
}
