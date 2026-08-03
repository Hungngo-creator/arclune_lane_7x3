//home (termux)/arclune_lane_7x3/src/statuses.ts
import { dealAbilityDamage } from './combat.ts';
import { commitHpMutation, createHpZeroCandidate, createLinkedAction, createNaturalAction, currentActionExecution, finalizeCombatAction, resolveHpLoss, resolveSourceAttribution, withActionExecution } from './combat/kernel/index.ts';
import { normalizeTagList } from './data/tags.ts';
import { gainFury, finishFuryHit } from './utils/fury.ts';

import type { DamageContext, StatusEffect, StatusRegistry } from '@shared-types/combat';
import type { UnitToken } from '@shared-types/units';
import type { SessionState } from '@shared-types/combat';

interface ShieldResult {
  remain: number;
  absorbed: number;
  broke: boolean;
}

export interface DamageResult {
  dealt?: number;
  absorbed?: number;
  dtype?: string;
  breakdown?: {
    classBonus?: number;
    elementBonus?: number;
    synergyBonus?: number;
  };
  game?: SessionState | null;
  attackType?: string;
}

interface ResolveContext {
  attackType?: string;
}

interface StatusTurnContext extends Record<string, unknown> {
  log?: Array<Record<string, unknown>>;
  game?: SessionState;
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
  resolveTarget(attacker: UnitToken, candidates: ReadonlyArray<UnitToken>, ctx?: ResolveContext): UnitToken | null;
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
const TURN_TICK = 'turn';
const DOT_DAMAGE_BY_STATUS: Readonly<Record<'bleed' | 'poison', number>> = Object.freeze({
  bleed: 0.05,
  poison: 0.03,
});
const DOT_STATUS_ID_SET = new Set<string>(Object.keys(DOT_DAMAGE_BY_STATUS));
const TAUNT_STATUS_ID = 'taunt';
const ALLURE_STATUS_ID = 'allure';

const isAxiomBlockedKind = (kind: StatusEffect['kind']): boolean =>
  kind === 'buff' || kind === 'debuff' || kind === 'mark';

const isDotStatusId = (id: string): id is keyof typeof DOT_DAMAGE_BY_STATUS =>
  DOT_STATUS_ID_SET.has(id);

const ensureStatusList = (unit?: UnitToken | null): StatusEffect[] => {
  if (!unit) return [];
  if (!Array.isArray(unit.statuses)) {
    unit.statuses = [];
  }
  return unit.statuses;
};

const hasDivineNatureTag = (unit: UnitToken | null | undefined): boolean => {
  if (!unit) return false;
  if (unit.hasDivineNature === true) return true;
  const rawTags: unknown[] = Array.isArray(unit.tags) ? unit.tags : [];
  return normalizeTagList(rawTags.filter((tag): tag is string => typeof tag === 'string')).includes('divine-nature');
};

const isTokenCandidate = (value: unknown): value is UnitToken => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as UnitToken;
  return (
    typeof candidate.cx === 'number'
    && typeof candidate.cy === 'number'
    && typeof candidate.side === 'string'
  );
};

function findStatus(
  unit: UnitToken | null | undefined,
  id: string,
): [StatusEffect[], number, StatusEffect | null] {
  const list = ensureStatusList(unit);
  const index = list.findIndex(status => status.id === id);
  const found = index >= 0 ? list[index] ?? null : null;
  return [list, index, found];
}

function decrementDuration(unit: UnitToken, status: StatusEffect): void {
  if (typeof status.dur === 'number') {
    status.dur -= 1;
    if (status.dur <= 0) Statuses.remove(unit, status.id);
  }
}

function logStatusTick(ctx: StatusTurnContext | undefined, id: string, unit: UnitToken, lost: number): void {
  if (!ctx?.log || !Array.isArray(ctx.log)) return;
  ctx.log.push({ t: id, who: unit.name, lost });
}

function applyDotTick(unit: UnitToken, status: StatusEffect, ctx?: StatusTurnContext): void {
  if (!isDotStatusId(status.id)) return;
  const id = status.id;
  const pct = DOT_DAMAGE_BY_STATUS[id];
  const lost = Math.round((unit.hpMax ?? 0) * pct);
  const game = ctx?.game;
  if (!game) throw new Error('[combat-kernel] damaging status tick requires game context');
  const resolved = resolveStatusSourceAttribution(status, game);
  const source = resolved.liveSource ?? ({ iid: resolved.attribution.immediateSourceIid ?? `status:${String(status.statusInstanceId ?? status.id)}`, trueSelfId: resolved.attribution.creditTrueSelfId, side: status.sourceSide ?? (unit.side === 'ally' ? 'enemy' : 'ally'), cx: -1, cy: -1, alive: false, lifeState: 'removed', atk: Number(status.snapshotAtk ?? 0), wil: Number(status.snapshotWil ?? 0), statuses: [] } as unknown as UnitToken);
  const identity = createNaturalAction(game, 'dot-tick');
  status.tickSerial = Math.max(0, Number(status.tickSerial ?? 0)) + 1;
  withActionExecution(game, identity, () => dealAbilityDamage(game, source, unit, { base: lost, dtype: status.damageType === 'true' ? 'true' : status.damageType === 'will' ? 'arcane' : 'physical', attackType: 'dot', skillMul: 1, sourceAttribution: resolved.attribution }), { originActionId: typeof status.originActionId === 'string' || typeof status.originActionId === 'number' ? status.originActionId : null });
  logStatusTick(ctx, id, unit, lost);
  decrementDuration(unit, status);
}

export function resolveStatusSourceAttribution(status: StatusEffect, game: SessionState): { attribution: ReturnType<typeof resolveSourceAttribution>; liveSource: UnitToken | null } {
  const sourceIid = typeof status.sourceIid === 'string' || typeof status.sourceIid === 'number' ? status.sourceIid : null;
  const live = sourceIid == null ? null : game.tokens.find(token => (token.iid ?? token.id) === sourceIid) ?? null;
  const dynamic = status.snapshotPolicy === 'dynamic';
  return { attribution: resolveSourceAttribution({ immediateSource: sourceIid, controller: status.controllerIid as string | number | null, owner: status.ownerIid as string | number | null, trueSelf: status.creditTrueSelfId as string | number | null, originActionId: status.originActionId as string | number | null, sourceSide: status.sourceSide === 'ally' || status.sourceSide === 'enemy' ? status.sourceSide : null }), liveSource: dynamic ? live : null };
}

const createTimedStatus = (
  id: string,
  kind: 'buff' | 'debuff',
  tag: string,
  turns: number,
): StatusEffect => ({
  id,
  kind,
  tag,
  dur: turns,
  tick: 'turn',
});

const statusFactories = {
  stun: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return createTimedStatus('stun', 'debuff', 'control', turns);
  },
  sleep: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return createTimedStatus('sleep', 'debuff', 'control', turns);
  },
  taunt: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return createTimedStatus('taunt', 'debuff', 'control', turns);
  },
  reflect: (spec?: Record<string, unknown>) => {
    const { pct = 0.2, turns = 1 } = (spec ?? {}) as { pct?: number; turns?: number };
    return { id: 'reflect', kind: 'buff', tag: 'counter', power: pct, dur: turns, tick: 'turn' };
  },
  bleed: (spec?: Record<string, unknown>) => {
    const { turns = 2 } = (spec ?? {}) as { turns?: number };
    return { ...createTimedStatus('bleed', 'debuff', 'dot', turns), ...spec, turns: undefined, statusInstanceId: spec?.statusInstanceId ?? `bleed-status`, damageType: spec?.damageType ?? 'physical', snapshotPolicy: spec?.snapshotPolicy ?? 'dynamic', tickSerial: spec?.tickSerial ?? 0 };
  },
  poison: (spec?: Record<string, unknown>) => {
    const { turns = 2 } = (spec ?? {}) as { turns?: number };
    return { ...createTimedStatus('poison', 'debuff', 'dot', turns), ...spec, turns: undefined, statusInstanceId: spec?.statusInstanceId ?? `poison-status`, damageType: spec?.damageType ?? 'will', snapshotPolicy: spec?.snapshotPolicy ?? 'dynamic', tickSerial: spec?.tickSerial ?? 0 };
  },
  damageCut: (spec?: Record<string, unknown>) => {
    const { pct = 0.2, turns = 1 } = (spec ?? {}) as { pct?: number; turns?: number };
    return { id: 'dmgCut', kind: 'buff', tag: 'mitigation', power: pct, dur: turns, tick: 'turn' };
  },
  fatigue: (spec?: Record<string, unknown>) => {
    const { turns = 2 } = (spec ?? {}) as { turns?: number };
    return createTimedStatus('fatigue', 'debuff', 'output', turns);
  },
  silence: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return createTimedStatus('silence', 'debuff', 'silence', turns);
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
    return createTimedStatus('exalt', 'buff', 'output', turns);
  },
  pierce: (spec?: Record<string, unknown>) => {
    const { pct = 0.1, turns = 2 } = (spec ?? {}) as { pct?: number; turns?: number };
    return { id: 'pierce', kind: 'buff', tag: 'penetration', power: pct, dur: turns, tick: 'turn' };
  },
  daze: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return createTimedStatus('daze', 'debuff', 'stat', turns);
  },
  frenzy: (spec?: Record<string, unknown>) => {
    const { turns = 2 } = (spec ?? {}) as { turns?: number };
    return createTimedStatus('frenzy', 'buff', 'basic-boost', turns);
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
    return createTimedStatus('fear', 'debuff', 'output', turns);
  },
  stealth: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return createTimedStatus('stealth', 'buff', 'invuln', turns);
  },
  venom: (spec?: Record<string, unknown>) => {
    const { pct = 0.15, turns = 2 } = (spec ?? {}) as { pct?: number; turns?: number };
    return { id: 'venom', kind: 'buff', tag: 'on-hit', power: pct, dur: turns, tick: 'turn' };
  },
  execute: (spec?: Record<string, unknown>) => {
    const { turns = 2 } = (spec ?? {}) as { turns?: number };
    return createTimedStatus('execute', 'buff', 'execute', turns);
  },
  undying: () => ({ id: 'undying', kind: 'buff', tag: 'cheat-death', once: true }),
  allure: (spec?: Record<string, unknown>) => {
    const { turns = 1 } = (spec ?? {}) as { turns?: number };
    return createTimedStatus('allure', 'buff', 'avoid-basic', turns);
  },
  haste: (spec?: Record<string, unknown>) => {
    const { pct = 0.1, turns = 1 } = (spec ?? {}) as { pct?: number; turns?: number };
    return { id: 'haste', kind: 'buff', tag: 'stat', power: pct, dur: turns, tick: 'turn' };
  },
} satisfies StatusRegistry;

const hasDebuffImmunity = (unit: UnitToken, statusId: string): boolean => {
  const carrier = unit as UnitToken & { _nguyenLeDebuffImmunities?: unknown };
  const list = carrier._nguyenLeDebuffImmunities;
  if (!Array.isArray(list) || list.length <= 0) return false;
  const id = String(statusId || '').trim().toLowerCase();
  if (!id) return false;
  for (const entry of list) {
    if (typeof entry !== 'string') continue;
    if (entry.trim().toLowerCase() === id) return true;
  }
  return false;
};

export const Statuses: StatusService = {
  add(unit, status) {
    if (isAxiomBlockedKind(status.kind) && hasDivineNatureTag(unit)) {
      return status;
    }
    if (status.kind === 'debuff' && hasDebuffImmunity(unit, status.id)) {
      return status;
    }
    const list = ensureStatusList(unit);
    const index = list.findIndex(existingStatus => existingStatus.id === status.id);
    const existing = index >= 0 ? list[index] ?? null : null;
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
    const statuses = ensureStatusList(unit);
    let bleed: StatusEffect | null = null;
    let poison: StatusEffect | null = null;
    for (let i = statuses.length - 1; i >= 0; i -= 1) {
      const status = statuses[i];
      if (!status) continue;
      if (!bleed && status.id === 'bleed') bleed = status;
      else if (!poison && status.id === 'poison') poison = status;
      if (status.tick === TURN_TICK && !isDotStatusId(status.id)) decrementDuration(unit, status);
    }
    if (bleed) applyDotTick(unit, bleed, ctx);
    if (poison) applyDotTick(unit, poison, ctx);
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
    if (!Array.isArray(candidates) || candidates.length <= 0) return null;

    let nearestTaunter: UnitToken | null = null;
    let nearestTaunterDistance = Number.POSITIVE_INFINITY;
    let nearestTaunterNonAllure: UnitToken | null = null;
    let nearestTaunterNonAllureDistance = Number.POSITIVE_INFINITY;
    let hasNonAllureCandidate = false;

    for (const candidate of candidates) {
      if (!isTokenCandidate(candidate)) continue;
      const distance = Math.abs(candidate.cx - attacker.cx) + Math.abs(candidate.cy - attacker.cy);
      const candidateStatuses = ensureStatusList(candidate);
      let isAllure = false;
      let hasTaunt = false;
      for (const status of candidateStatuses) {
        if (!status) continue;
        if (!isAllure && status.id === ALLURE_STATUS_ID) isAllure = true;
        else if (!hasTaunt && status.id === TAUNT_STATUS_ID) hasTaunt = true;
        if (isAllure && hasTaunt) break;
      }
      if (!isAllure) hasNonAllureCandidate = true;
      if (!hasTaunt) continue;

      if (distance < nearestTaunterDistance) {
        nearestTaunter = candidate;
        nearestTaunterDistance = distance;
      }
      if (!isAllure && distance < nearestTaunterNonAllureDistance) {
        nearestTaunterNonAllure = candidate;
        nearestTaunterNonAllureDistance = distance;
      }
    }

    if (attackType === 'basic' && hasNonAllureCandidate) {
      return nearestTaunterNonAllure;
    }
    return nearestTaunter;
  },
  modifyStats(unit, base) {
    const statuses = ensureStatusList(unit);
    let hasDaze = false;
    let hasFear = false;
    let haste: StatusEffect | null = null;
    for (const status of statuses) {
      if (!status) continue;
      if (!hasDaze && status.id === 'daze') hasDaze = true;
      else if (!hasFear && status.id === 'fear') hasFear = true;
      else if (!haste && status.id === 'haste') haste = status;
      if (hasDaze && hasFear && haste) break;
    }
    const next = { ...base };
    if (hasDaze) {
      next.SPD = (next.SPD ?? 0) * 0.9;
      next.AGI = (next.AGI ?? 0) * 0.9;
    }
    if (hasFear) {
      next.SPD = (next.SPD ?? 0) * 0.9;
    }
    if (haste) {
      const boost = 1 + clamp01(haste.power ?? 0.1);
      next.SPD = (next.SPD ?? 0) * boost;
    }
    return next;
  },
  beforeDamage(attacker, target, ctx = {}) {
    const attackerStatuses = ensureStatusList(attacker);
    let fatigue: StatusEffect | null = null;
    let exalt: StatusEffect | null = null;
    let frenzy: StatusEffect | null = null;
    let weak: StatusEffect | null = null;
    let fear: StatusEffect | null = null;
    let pierce: StatusEffect | null = null;
    for (const status of attackerStatuses) {
      if (!status) continue;
      if (!fatigue && status.id === 'fatigue') fatigue = status;
      else if (!exalt && status.id === 'exalt') exalt = status;
      else if (!frenzy && status.id === 'frenzy') frenzy = status;
      else if (!weak && status.id === 'weaken') weak = status;
      else if (!fear && status.id === 'fear') fear = status;
      else if (
        !pierce
        && (
          status.id === 'pierce'
          || status.id === 'duong_ha_skill2_pierce'
          || status.tag === 'penetration'
        )
      ) {
        pierce = status;
      }
      if (fatigue && exalt && frenzy && weak && fear && pierce) break;
    }
    const targetStatuses = ensureStatusList(target);
    let cut: StatusEffect | null = null;
    let stealth: StatusEffect | null = null;
    for (const status of targetStatuses) {
      if (!status) continue;
      if (!cut && status.id === 'dmgCut') cut = status;
      else if (!stealth && status.id === 'stealth') stealth = status;
      if (cut && stealth) break;
    }
    const attackType = ctx.attackType ?? 'basic';
    const dtype = ctx.dtype ?? 'phys';
    const base = ctx.base ?? 0;
    let outMul = 1;
    let inMul = 1;
    let defPen = 0;
    let ignoreAll = false;

    if (fatigue) outMul *= 0.9;
    if (exalt) outMul *= 1.1;
    if (attackType === 'basic' && frenzy) outMul *= 1.2;
    if (weak) outMul *= 1 - 0.1 * Math.min(5, weak.stacks ?? 1);
    if (fear) outMul *= 0.9;

    if (cut) inMul *= 1 - clamp01(cut.power ?? 0);
    if (stealth) {
      inMul = 0;
      ignoreAll = true;
    }
    if (pierce) defPen = Math.max(defPen, clamp01(pierce.power ?? 0.1));

    const context: DamageContext = {
      ...ctx,
      attackType,
      dtype,
      base,
      outMul,
      inMul,
      defPen,
      ignoreAll,
    };
    return context;
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
    const venom = this.get(attacker, 'venom');
    if (venom && dealt > 0 && result.attackType !== 'venom') {
      const extra = Math.round(dealt * clamp01(venom.power ?? 0));
      const game = result.game;
      const parent = game ? currentActionExecution(game) : null;
      if (!game || !parent) throw new Error('[combat-kernel] Venom requires an active production action');
      const linked = createLinkedAction(game, parent.identity, 'venom');
      withActionExecution(game, linked, () => dealAbilityDamage(game, attacker, target, { base: extra, dtype: result.dtype ?? 'physical', attackType: 'venom', skillMul: 1 }));
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

    const reflectPower = clamp01(this.get(target, 'reflect')?.power ?? 0);
    void reflectPower;

    if (this.has(attacker, 'execute')) {
      if ((target.hp ?? 0) <= Math.ceil((target.hpMax ?? 0) * 0.1)) {
        const game = result.game;
        const action = game ? currentActionExecution(game) : null;
        if (!game || !action) throw new Error('[combat-kernel] Execute requires an active production action');
        const source = resolveSourceAttribution({ immediateSource: attacker, controller: attacker, trueSelf: attacker.trueSelfId ?? null, owner: attacker });
        const mutation = resolveHpLoss(target, Number(target.hp ?? 0), 'execute', source, true);
        commitHpMutation(game, target, mutation, action.identity);
        if (mutation.hpBefore > 0 && mutation.hpAfter === 0) createHpZeroCandidate(game, target, action.identity, source, 'execute', mutation.effectiveAmount);
      }
    }

    return result;
  },
  make: statusFactories,
};

export function makeStatusEffect<K extends keyof StatusRegistry>(
  key: K,
  spec?: Parameters<StatusRegistry[K]>[0],
): ReturnType<StatusRegistry[K]> | null {
  const factory = Statuses.make[key];
  if (typeof factory === 'function') {
    return factory(spec);
  }
  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(`[Statuses] Không tìm thấy factory cho hiệu ứng "${String(key)}".`);
  }
  return null;
}

export function applyStatus(unit: UnitToken | null | undefined, status: StatusEffect): StatusEffect | null {
  if (!unit) return null;
  return Statuses.add(unit, status);
}

export function clearStatus(unit: UnitToken | null | undefined, id: string): void {
  if (!unit) return;
  Statuses.remove(unit, id);
}

export function hookOnLethalDamage(target: UnitToken): boolean {
  // Compatibility adapter only: the lifecycle coordinator owns the commit.
  return (target.hp ?? 0) <= 0 && Statuses.has(target, 'undying');
}