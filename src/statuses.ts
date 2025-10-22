import { gainFury, finishFuryHit } from './utils/fury.js';

import type { DamageContext, StatusEffect, StatusRegistry } from '@types/combat';
import type { UnitToken } from '@types/units';

interface ShieldResult {
  remain: number;
  absorbed: number;
  broke: boolean;
}

interface DamageResult {
  dealt?: number;
  absorbed?: number;
  dtype?: string;
}

interface ResolveContext {
  attackType?: string;
}

interface StatusTurnContext extends Record<string, unknown> {
  log?: Array<Record<string, unknown>>;
}

interface StatusService {
  add(unit: UnitToken, status: StatusEffect): StatusEffect;
  remove(unit: UnitToken, id: string): void;
  has(unit: UnitToken, id: string): boolean;
  get(unit: UnitToken, id: string): StatusEffect | null;
  purge(unit: UnitToken): void;
  stacks(unit: UnitToken, id: string): number;
  onTurnStart(unit: UnitToken, ctx?: Record<string, unknown>): void;
  onTurnEnd(unit: UnitToken, ctx?: StatusTurnContext): void;
  onPhaseStart(side: string, ctx?: Record<string, unknown>): void;
  onPhaseEnd(side: string, ctx?: Record<string, unknown>): void;
  canAct(unit: UnitToken): boolean;
  blocks(unit: UnitToken, what: string): boolean;
  resolveTarget(attacker: UnitToken, candidates: UnitToken[], ctx?: ResolveContext): UnitToken | null;
  modifyStats(unit: UnitToken, base: Record<string, number>): Record<string, number>;
  beforeDamage(
    attacker: UnitToken,
    target: UnitToken,
    ctx?: Partial<DamageContext> & ResolveContext,
  ): DamageContext;
  absorbShield(target: UnitToken, dmg: number, ctx?: Record<string, unknown>): ShieldResult;
  afterDamage(attacker: UnitToken, target: UnitToken, result?: DamageResult): DamageResult;
  make: StatusRegistry;
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const ensureStatusList = (unit?: UnitToken | null): StatusEffect[] => {
  if (!unit) return [];
  if (!Array.isArray(unit.statuses)) {
    unit.statuses = [];
  }
  return unit.statuses;
};

function findStatus(
  unit: UnitToken | null | undefined,
  id: string,
): [StatusEffect[], number, StatusEffect | null] {
  const list = ensureStatusList(unit);
  const index = list.findIndex(status => status.id === id);
  return [list, index, index >= 0 ? list[index] : null];
}

function decrementDuration(unit: UnitToken, status: StatusEffect): void {
  if (typeof status.dur === 'number') {
    status.dur -= 1;
    if (status.dur <= 0) Statuses.remove(unit, status.id);
  }
}

const statusFactories = {
  stun: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return { id: 'stun', kind: 'debuff', tag: 'control', dur: turns, tick: 'turn' };
  },
  sleep: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return { id: 'sleep', kind: 'debuff', tag: 'control', dur: turns, tick: 'turn' };
  },
  taunt: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return { id: 'taunt', kind: 'debuff', tag: 'control', dur: turns, tick: 'turn' };
  },
  reflect: (spec?: Record<string, unknown>) => {
    const { pct = 0.2, turns = 1 } = (spec ?? {}) as { pct?: number; turns?: number };
    return { id: 'reflect', kind: 'buff', tag: 'counter', power: pct, dur: turns, tick: 'turn' };
  },
  bleed: (spec?: Record<string, unknown>) => {
    const { turns = 2 } = (spec ?? {}) as { turns?: number };
    return { id: 'bleed', kind: 'debuff', tag: 'dot', dur: turns, tick: 'turn' };
  },
  damageCut: (spec?: Record<string, unknown>) => {
    const { pct = 0.2, turns = 1 } = (spec ?? {}) as { pct?: number; turns?: number };
    return { id: 'dmgCut', kind: 'buff', tag: 'mitigation', power: pct, dur: turns, tick: 'turn' };
  },
  fatigue: (spec?: Record<string, unknown>) => {
    const { turns = 2 } = (spec ?? {}) as { turns?: number };
    return { id: 'fatigue', kind: 'debuff', tag: 'output', dur: turns, tick: 'turn' };
  },
  silence: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return { id: 'silence', kind: 'debuff', tag: 'silence', dur: turns, tick: 'turn' };
  },
  shield: (spec?: Record<string, unknown>) => {
    const { pct = 0.2, amount = 0 } = (spec ?? {}) as { pct?: number; amount?: number };
    return {
      id: 'shield',
      kind: 'buff',
      tag: 'shield',
      amount: amount ?? 0,
      power: pct,
      tick: null,
    };
  },
  exalt: (spec?: Record<string, unknown>) => {
    const { turns = 2 } = (spec ?? {}) as { turns?: number };
    return { id: 'exalt', kind: 'buff', tag: 'output', dur: turns, tick: 'turn' };
  },
  pierce: (spec?: Record<string, unknown>) => {
    const { pct = 0.1, turns = 2 } = (spec ?? {}) as { pct?: number; turns?: number };
    return { id: 'pierce', kind: 'buff', tag: 'penetration', power: pct, dur: turns, tick: 'turn' };
  },
  daze: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return { id: 'daze', kind: 'debuff', tag: 'stat', dur: turns, tick: 'turn' };
  },
  frenzy: (spec?: Record<string, unknown>) => {
    const { turns = 2 } = (spec ?? {}) as { turns?: number };
    return { id: 'frenzy', kind: 'buff', tag: 'basic-boost', dur: turns, tick: 'turn' };
  },
  weaken: (spec?: Record<string, unknown>) => {
    const { turns = 2, stacks = 1 } = (spec ?? {}) as { turns?: number; stacks?: number };
    return {
      id: 'weaken',
      kind: 'debuff',
      tag: 'output',
      dur: turns,
      tick: 'turn',
      stacks,
      maxStacks: 5,
    };
  },
  fear: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return { id: 'fear', kind: 'debuff', tag: 'output', dur: turns, tick: 'turn' };
  },
  stealth: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return { id: 'stealth', kind: 'buff', tag: 'invuln', dur: turns, tick: 'turn' };
  },
  venom: (spec?: Record<string, unknown>) => {
    const { pct = 0.15, turns = 2 } = (spec ?? {}) as { pct?: number; turns?: number };
    return { id: 'venom', kind: 'buff', tag: 'on-hit', power: pct, dur: turns, tick: 'turn' };
  },
  execute: (spec?: Record<string, unknown>) => {
    const { turns = 2 } = (spec ?? {}) as { turns?: number };
    return { id: 'execute', kind: 'buff', tag: 'execute', dur: turns, tick: 'turn' };
  },
  undying: () => ({ id: 'undying', kind: 'buff', tag: 'cheat-death', once: true }),
  allure: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return { id: 'allure', kind: 'buff', tag: 'avoid-basic', dur: turns, tick: 'turn' };
  },
  haste: (spec?: Record<string, unknown>) => {
    const { pct = 0.1, turns = 1 } = (spec ?? {}) as { pct?: number; turns?: number };
    return { id: 'haste', kind: 'buff', tag: 'stat', power: pct, dur: turns, tick: 'turn' };
  },
} satisfies StatusRegistry;

export const Statuses: StatusService = {
  add(unit, status) {
    const list = ensureStatusList(unit);
    const [, index, existing] = findStatus(unit, status.id);
    if (existing) {
      if (status.maxStacks && existing.stacks != null) {
        existing.stacks = Math.min(status.maxStacks, (existing.stacks || 1) + (status.stacks || 1));
      }
      if (status.dur != null) existing.dur = status.dur;
      if (status.power != null) existing.power = status.power;
      if (status.amount != null) existing.amount = (existing.amount ?? 0) + (status.amount ?? 0);
      return existing;
    }
    const copy: StatusEffect = { ...status };
    if (copy.stacks == null) copy.stacks = 1;
    list.push(copy);
    return copy;
  },
  remove(unit, id) {
    const [list, index] = findStatus(unit, id);
    if (index >= 0) list.splice(index, 1);
  },
  has(unit, id) {
    const [, , found] = findStatus(unit, id);
    return found != null;
  },
  get(unit, id) {
    const [, , found] = findStatus(unit, id);
    return found;
  },
  purge(unit) {
    unit.statuses = [];
  },
  stacks(unit, id) {
    const found = this.get(unit, id);
    return found ? found.stacks ?? 0 : 0;
  },
  onTurnStart(_unit, _ctx) {
    // reserved
  },
  onTurnEnd(unit, ctx) {
    const list = ensureStatusList(unit);
    const bleed = this.get(unit, 'bleed');
    if (bleed) {
      const lost = Math.round((unit.hpMax ?? 0) * 0.05);
      unit.hp = Math.max(0, (unit.hp ?? 0) - lost);
      if (ctx?.log && Array.isArray(ctx.log)) {
        ctx.log.push({ t: 'bleed', who: unit.name, lost });
      }
      decrementDuration(unit, bleed);
    }
    for (const status of [...list]) {
      if (status.id !== 'bleed' && status.tick === 'turn') {
        decrementDuration(unit, status);
      }
    }
  },
  onPhaseStart(_side, _ctx) {
    // reserved
  },
  onPhaseEnd(_side, _ctx) {
    // reserved
  },
  canAct(unit) {
    return !(this.has(unit, 'stun') || this.has(unit, 'sleep'));
  },
  blocks(unit, what) {
    if (what === 'ult') return this.has(unit, 'silence');
    return false;
  },
  resolveTarget(attacker, candidates, ctx = {}) {
    const attackType = ctx.attackType ?? 'basic';
    let pool = candidates;
    if (attackType === 'basic') {
      const filtered = candidates.filter(target => !this.has(target, 'allure'));
      if (filtered.length > 0) {
        pool = filtered;
      }
    }
    const taunters = pool.filter(target => this.has(target, 'taunt'));
    if (taunters.length > 0) {
      let best: UnitToken | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (const target of taunters) {
        const distance = Math.abs(target.cx - attacker.cx) + Math.abs(target.cy - attacker.cy);
        if (distance < bestDistance) {
          best = target;
          bestDistance = distance;
        }
      }
      return best;
    }
    return null;
  },
  modifyStats(unit, base) {
    const next = { ...base };
    if (this.has(unit, 'daze')) {
      next.SPD = (next.SPD ?? 0) * 0.9;
      next.AGI = (next.AGI ?? 0) * 0.9;
    }
    if (this.has(unit, 'fear')) {
      next.SPD = (next.SPD ?? 0) * 0.9;
    }
    const haste = this.get(unit, 'haste');
    if (haste) {
      const boost = 1 + clamp01(haste.power ?? 0.1);
      next.SPD = (next.SPD ?? 0) * boost;
    }
    return next;
  },
  beforeDamage(attacker, target, ctx = {}) {
    const attackType = ctx.attackType ?? 'basic';
    const dtype = ctx.dtype ?? 'phys';
    const base = ctx.base ?? 0;
    let outMul = 1;
    let inMul = 1;
    let defPen = 0;
    let ignoreAll = false;

    if (this.has(attacker, 'fatigue')) outMul *= 0.9;
    if (this.has(attacker, 'exalt')) outMul *= 1.1;
    if (attackType === 'basic' && this.has(attacker, 'frenzy')) outMul *= 1.2;
    const weak = this.get(attacker, 'weaken');
    if (weak) outMul *= 1 - 0.1 * Math.min(5, weak.stacks ?? 1);
    if (this.has(attacker, 'fear')) outMul *= 0.9;

    const cut = this.get(target, 'dmgCut');
    if (cut) inMul *= 1 - clamp01(cut.power ?? 0);
    if (this.has(target, 'stealth')) {
      inMul = 0;
      ignoreAll = true;
    }
    const pierce = this.get(attacker, 'pierce');
    if (pierce) defPen = Math.max(defPen, clamp01(pierce.power ?? 0.1));

    return {
      ...ctx,
      attackType,
      dtype,
      base,
      outMul,
      inMul,
      defPen,
      ignoreAll,
    } as DamageContext;
  },
  absorbShield(target, dmg, _ctx = {}) {
    const shield = this.get(target, 'shield');
    if (!shield || (shield.amount ?? 0) <= 0) {
      return { remain: dmg, absorbed: 0, broke: false };
    }
    const current = shield.amount ?? 0;
    const absorbed = Math.min(current, dmg);
    const remain = dmg - absorbed;
    const left = current - absorbed;
    shield.amount = left;
    if (left <= 0) {
      this.remove(target, 'shield');
    }
    return { remain, absorbed, broke: left <= 0 };
  },
  afterDamage(attacker, target, result = {}) {
    const dealt = result.dealt ?? 0;
    const reflect = this.get(target, 'reflect');
    if (reflect && dealt > 0) {
      const back = Math.round(dealt * clamp01(reflect.power ?? 0));
      attacker.hp = Math.max(0, (attacker.hp ?? 0) - back);
      if (back > 0) {
        gainFury(attacker, {
          type: 'damageTaken',
          dealt: back,
          selfMaxHp: Number.isFinite(attacker?.hpMax) ? attacker.hpMax : undefined,
          damageTaken: back,
        });
        finishFuryHit(attacker);
      }
    }

    const venom = this.get(attacker, 'venom');
    if (venom && dealt > 0) {
      const extra = Math.round(dealt * clamp01(venom.power ?? 0));
      target.hp = Math.max(0, (target.hp ?? 0) - extra);
      if (extra > 0) {
        gainFury(target, {
          type: 'damageTaken',
          dealt: extra,
          selfMaxHp: Number.isFinite(target?.hpMax) ? target.hpMax : undefined,
          damageTaken: extra,
        });
        finishFuryHit(target);
      }
    }

    if (this.has(attacker, 'execute')) {
      if ((target.hp ?? 0) <= Math.ceil((target.hpMax ?? 0) * 0.1)) {
        target.hp = 0;
      }
    }

    return result;
  },
  make: statusFactories,
};

export function applyStatus(unit: UnitToken | null | undefined, status: StatusEffect): StatusEffect | null {
  if (!unit) return null;
  return Statuses.add(unit, status);
}

export function clearStatus(unit: UnitToken | null | undefined, id: string): void {
  if (!unit) return;
  Statuses.remove(unit, id);
}

export function hookOnLethalDamage(target: UnitToken): boolean {
  const status = Statuses.get(target, 'undying');
  if (!status) return false;
  if ((target.hp ?? 0) <= 0) {
    target.hp = 1;
    Statuses.remove(target, 'undying');
    return true;
  }
  return false;
}