import type { SessionState } from '@shared-types/combat';
import type { SkillSection } from '@shared-types/config';
import type { UnitToken } from '@shared-types/units';
import type { ActiveSkillKey } from '../perform-active-skill.ts';

export interface RuntimeSkillContext {
  game: SessionState;
  caster: UnitToken;
  skillKey: ActiveSkillKey;
  skill: SkillSection;
  tags: string[];
  appliedTags: string[];
}

export interface RuntimeTurnContext {
  game: SessionState;
  unit: UnitToken | null | undefined;
}

export interface RuntimeOnDamageContext {
  target: UnitToken | null | undefined;
}

export interface RuntimeOnBasicAttackContext {
  game: SessionState;
  attacker: UnitToken;
  target: UnitToken;
  dealt: number;
}

export interface RuntimeOnUnitDeathContext {
  game: SessionState;
  deadUnit: UnitToken;
  killer: UnitToken | null;
}

export interface RuntimeOnUnitReviveContext {
  game: SessionState;
  unit: UnitToken;
}

export interface RuntimeUltContext {
  game: SessionState;
  caster: UnitToken;
}

export interface UnitRuntimeHook {
  onActiveSkill?: (ctx: RuntimeSkillContext) => void;
  onUlt?: (ctx: RuntimeUltContext) => boolean;
  onTurnStart?: (ctx: RuntimeTurnContext) => void;
  onActionEnd?: (ctx: RuntimeTurnContext) => void;
  onTurnEnd?: (ctx: RuntimeTurnContext) => void;
  onDamageResolved?: (ctx: RuntimeOnDamageContext) => void;
  onBasicAttackResolved?: (ctx: RuntimeOnBasicAttackContext) => void;
  onUnitDeath?: (ctx: RuntimeOnUnitDeathContext) => void;
  onUnitRevive?: (ctx: RuntimeOnUnitReviveContext) => void;
}
