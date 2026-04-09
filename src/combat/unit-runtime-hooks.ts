import { dealAbilityDamage, pickTarget } from '../combat.ts';
import {
  activateChapMinhLink,
  applyChapMinhActionEnd,
  applyChapMinhPhaseShift,
  recoverChapMinhMaxHpPerTurn,
  refreshChapMinhOwnership,
} from './chap-minh-runtime.ts';
import { consumeShieldByCurrentRatio, readShieldAmount } from './apply-damage.ts';
import { Statuses } from '../statuses.ts';
import { buildSkillResult } from './skill-result.ts';

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
const CHAP_MINH_ULT_ARM_RES_BUFF = 0.5;
const CHAP_MINH_ULT_HEAL_RATIO = 0.35;
const CHAP_MINH_ULT_SHIELD_DAMAGE_RATIO = 0.5;

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
      const heal = Math.max(1, Math.floor((caster.hpMax ?? 0) * CHAP_MINH_ULT_HEAL_RATIO));
      caster.hp = Math.max(0, Math.min(caster.hpMax ?? 0, (caster.hp ?? 0) + heal));

      Statuses.add(caster, {
        id: 'chap_minh_ult_arm_up',
        kind: 'buff',
        tag: 'arm-up',
        amount: CHAP_MINH_ULT_ARM_RES_BUFF,
        dur: 2,
        tick: 'turn',
        sourceUnitId: caster.id,
      });
      Statuses.add(caster, {
        id: 'chap_minh_ult_res_up',
        kind: 'buff',
        tag: 'res-up',
        amount: CHAP_MINH_ULT_ARM_RES_BUFF,
        dur: 2,
        tick: 'turn',
        sourceUnitId: caster.id,
      });

      const shieldBonusDamage = Math.max(0, Math.floor(readShieldAmount(caster) * CHAP_MINH_ULT_SHIELD_DAMAGE_RATIO));
      const base = Math.max(1, Math.floor((caster.atk ?? 0) + (caster.wil ?? 0) + shieldBonusDamage));
      let hits = 0;
      for (const token of game.tokens) {
        if (!token.alive || token.side === caster.side) continue;
        dealAbilityDamage(game, caster, token, { base, dtype: 'mixed', attackType: 'skill', skill, isAoE: true });
        hits += 1;
      }

      return buildSkillResult(true, skillKey, skill, tags, appliedTags, hits);
    }

    if (skillKey !== 'skill2') return null;

    consumeShieldByCurrentRatio(caster, 0.1);

    const target = pickTarget(game, caster);
    if (!target?.alive) {
      return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
    }

    const base = Math.max(1, Math.floor((caster.atk ?? 0) + (caster.wil ?? 0)));
    for (let hit = 0; hit < 3; hit += 1) {
      dealAbilityDamage(game, caster, target, { base, dtype: 'mixed', attackType: 'skill', skill });
    }

    return buildSkillResult(true, skillKey, skill, tags, appliedTags, 1);
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
