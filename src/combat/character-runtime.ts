import type { SessionState } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import type { ActionIdentity, DamagePacket, SourceAttribution } from './kernel/types.ts';

export type CharacterExecutionPhase = 'prepare' | 'resolve' | 'commit-primary' | 'post-commit' | 'finalize';
export type CharacterTargetPolicy = 'self' | 'selected-enemy' | 'selected-ally' | 'all-enemies' | 'all-allies' | 'explicit';
export type CharacterCommandType = 'ModifyDamagePlan' | 'ApplyStatus' | 'RemoveStatus' | 'DealDamage' | 'Heal' | 'MutateHp' | 'MutateMaxHp' | 'SpendResource' | 'GainResource' | 'Summon' | 'Move' | 'CreateField' | 'RequestDeathPrevention' | 'RequestRevive' | 'RequestRebirth' | 'SetStance' | 'SetForm';

export interface CharacterCommandMetadata {
  readonly source: SourceAttribution;
  readonly targetPolicy: CharacterTargetPolicy;
  readonly identity: ActionIdentity;
  readonly phase: CharacterExecutionPhase;
  readonly authority: string;
  readonly relation: 'primary' | 'linked';
  readonly consumesNaturalAction: boolean;
  readonly mayGenerateAether: boolean;
  readonly mayGenerateFury: boolean;
  readonly order: Readonly<{ priority: number; registrationSerial: number; commandSerial: number }>;
}

export type CharacterCommand = CharacterCommandMetadata & (
  | { readonly type: 'ModifyDamagePlan'; readonly packetId: DamagePacket['packetId']; readonly incomingMultiplier?: number; readonly outgoingMultiplier?: number }
  | { readonly type: 'ApplyStatus'; readonly targetIid: string | number; readonly status: Readonly<Record<string, unknown>> }
  | { readonly type: 'RemoveStatus'; readonly targetIid: string | number; readonly statusId: string }
  | { readonly type: 'DealDamage'; readonly targetIid: string | number; readonly amount: number; readonly damageType: DamagePacket['damageType'] }
  | { readonly type: 'Heal' | 'MutateHp' | 'MutateMaxHp'; readonly targetIid: string | number; readonly amount: number }
  | { readonly type: 'SpendResource' | 'GainResource'; readonly targetIid: string | number; readonly resource: 'aether' | 'fury'; readonly amount: number }
  | { readonly type: 'Summon' | 'CreateField'; readonly definitionId: string }
  | { readonly type: 'Move'; readonly targetIid: string | number; readonly cx: number; readonly cy: number }
  | { readonly type: 'RequestDeathPrevention' | 'RequestRevive' | 'RequestRebirth'; readonly targetIid: string | number }
  | { readonly type: 'SetStance' | 'SetForm'; readonly targetIid: string | number; readonly value: string }
);

export interface CharacterEventContext {
  readonly game: SessionState;
  readonly actor: Readonly<UnitToken>;
  readonly phase: CharacterExecutionPhase;
  readonly identity: ActionIdentity;
  readonly event: string;
}

export interface CharacterCapabilityManifest {
  readonly basic: 'supported' | 'not-declared';
  readonly skill1: 'supported' | 'not-declared';
  readonly skill2: 'supported' | 'not-declared';
  readonly skill3: 'supported' | 'not-declared';
  readonly ultimate: 'supported' | 'not-declared';
  readonly passives: 'supported' | 'not-declared';
  readonly customAdapter: string | null;
  readonly directMutationViolations: 0;
}

export interface CharacterRuntimeAdapter {
  readonly id: string;
  onEvent(context: CharacterEventContext): readonly CharacterCommand[];
}

export interface CharacterRuntimeDefinition {
  readonly characterId: string;
  readonly capabilities: CharacterCapabilityManifest;
  readonly adapter?: CharacterRuntimeAdapter;
  readonly deterministicTests: readonly string[];
}

const PRE_COMMIT_ALLOWED = new Set<CharacterCommandType>(['ModifyDamagePlan']);

export function assertCharacterCommandPhase(command: CharacterCommand): void {
  if ((command.phase === 'prepare' || command.phase === 'resolve') && !PRE_COMMIT_ALLOWED.has(command.type)) {
    throw new Error(`[character-runtime] ${command.type} cannot execute during ${command.phase}`);
  }
  if (command.type === 'ModifyDamagePlan' && command.phase !== 'prepare' && command.phase !== 'resolve') {
    throw new Error(`[character-runtime] ModifyDamagePlan cannot execute during ${command.phase}`);
  }
  if (!Number.isInteger(command.order.priority) || !Number.isInteger(command.order.registrationSerial) || !Number.isInteger(command.order.commandSerial)) {
    throw new Error('[character-runtime] command ordering metadata must contain integers');
  }
}

export function defineCharacterRuntime(definition: CharacterRuntimeDefinition): Readonly<CharacterRuntimeDefinition> {
  if (!definition.characterId.trim()) throw new Error('[character-runtime] characterId is required');
  if (definition.adapter && definition.adapter.id !== definition.capabilities.customAdapter) {
    throw new Error(`[character-runtime] ${definition.characterId}: adapter and capability manifest disagree`);
  }
  if (definition.deterministicTests.length === 0) throw new Error(`[character-runtime] ${definition.characterId}: deterministic tests are required`);
  return Object.freeze({ ...definition, capabilities: Object.freeze({ ...definition.capabilities }), deterministicTests: Object.freeze([...definition.deterministicTests]) });
}
