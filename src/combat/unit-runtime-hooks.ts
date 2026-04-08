import { dealAbilityDamage, pickTarget } from '../combat.ts';
import {
  activateChapMinhLink,
  applyChapMinhActionEnd,
  applyChapMinhPhaseShift,
  recoverChapMinhMaxHpPerTurn,
  refreshChapMinhOwnership,
} from './chap-minh-runtime.ts';
import { consumeShieldByCurrentRatio } from './apply-damage.ts';

import type { SessionState } from '@shared-types/combat';
import type { SkillSection } from '@shared-types/config';
import type { UnitToken } from '@shared-types/units';
import type { ActiveSkillKey, PerformActiveSkillResult } from './perform-active-skill.ts';

interface RuntimeSkillContext {
  game: SessionState;
  caster: UnitToken;
  skillKey: ActiveSkillKey;
  skill: SkillSection;
  tags: string[];
  appliedTags: string[];
}

interface RuntimeTurnContext {
  game: SessionState;
  unit: UnitToken | null | undefined;
}

interface RuntimeOnDamageContext {
  target: UnitToken | null | undefined;
}

interface UnitRuntimeHook {
  onActiveSkill?: (ctx: RuntimeSkillContext) => PerformActiveSkillResult | null;
  onTurnStart?: (ctx: RuntimeTurnContext) => void;
  onActionEnd?: (ctx: RuntimeTurnContext) => void;
  onTurnEnd?: (ctx: RuntimeTurnContext) => void;
  onDamageResolved?: (ctx: RuntimeOnDamageContext) => void;
}

const CHAP_MINH_ID = 'huyen_vu_chap_minh';

const chapMinhRuntimeHook: UnitRuntimeHook = {
  onActiveSkill({ game, caster, skillKey, skill, tags, appliedTags }) {
    if (skillKey === 'skill1') {
      activateChapMinhLink(caster);
      refreshChapMinhOwnership(game);
      return {
        ok: true,
        skillKey,
        skill,
        tags,
        appliedTags,
        targetCount: 0,
      };
    }

    if (skillKey === 'skill3') {
      return {
        ok: false,
        skillKey,
        skill,
        tags,
        appliedTags,
        targetCount: 0,
        reason: 'blocked',
      };
    }

    if (skillKey !== 'skill2') return null;

    consumeShieldByCurrentRatio(caster, 0.1);

    const target = pickTarget(game, caster);
    if (!target?.alive) {
      return {
        ok: false,
        skillKey,
        skill,
        tags,
        appliedTags,
        targetCount: 0,
        reason: 'blocked',
      };
    }

    const base = Math.max(1, Math.floor((caster.atk ?? 0) + (caster.wil ?? 0)));
    for (let hit = 0; hit < 3; hit += 1) {
      dealAbilityDamage(game, caster, target, { base, dtype: 'mixed', attackType: 'skill', skill });
    }

    return {
      ok: true,
      skillKey,
      skill,
      tags,
      appliedTags,
      targetCount: 1,
    };
  },
  onTurnStart({ game, unit }) {
    recoverChapMinhMaxHpPerTurn(unit);
    refreshChapMinhOwnership(game);
  },
  onActionEnd({ game, unit }) {
    applyChapMinhActionEnd(game, unit);
    refreshChapMinhOwnership(game);
  },
  onTurnEnd({ game, unit }) {
    applyChapMinhPhaseShift(unit);
    refreshChapMinhOwnership(game);
  },
  onDamageResolved({ target }) {
    applyChapMinhPhaseShift(target);
  },
};

const UNIT_RUNTIME_HOOKS: Readonly<Record<string, UnitRuntimeHook>> = Object.freeze({
  [CHAP_MINH_ID]: chapMinhRuntimeHook,
});

export function getUnitRuntimeHook(unitId: string | null | undefined): UnitRuntimeHook | null {
  if (!unitId) return null;
  return UNIT_RUNTIME_HOOKS[unitId] ?? null;
}

export function runRuntimeTurnStart(game: SessionState, unit: UnitToken | null | undefined): void {
  if (!unit) return;
  getUnitRuntimeHook(unit.id)?.onTurnStart?.({ game, unit });
}

export function runRuntimeActionEnd(game: SessionState, unit: UnitToken | null | undefined): void {
  if (!unit) return;
  getUnitRuntimeHook(unit.id)?.onActionEnd?.({ game, unit });
}

export function runRuntimeTurnEnd(game: SessionState, unit: UnitToken | null | undefined): void {
  if (!unit) return;
  getUnitRuntimeHook(unit.id)?.onTurnEnd?.({ game, unit });
}

export function runRuntimeDamageResolved(target: UnitToken | null | undefined): void {
  if (!target) return;
  getUnitRuntimeHook(target.id)?.onDamageResolved?.({ target });
}

export function runRuntimeActiveSkill(ctx: RuntimeSkillContext): PerformActiveSkillResult | null {
  return getUnitRuntimeHook(ctx.caster.id)?.onActiveSkill?.(ctx) ?? null;
}
