// passives.ts — passive event dispatch & helpers v0.7
import { Statuses, hookOnLethalDamage } from './statuses.ts';
import { safeNow } from './utils/time.js';

import type {
  PassiveDefinition,
  PassiveRegistry,
  PassiveSpec,
  SessionState,
  StatusEffect,
} from '@types/combat';
import type { UnitToken } from '@types/units';

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const STAT_ALIAS: Map<string, string> = new Map([
  ['atk', 'atk'],
  ['attack', 'atk'],
  ['wil', 'wil'],
  ['will', 'wil'],
  ['res', 'res'],
  ['arm', 'arm'],
  ['agi', 'agi'],
  ['agility', 'agi'],
  ['per', 'per'],
  ['perception', 'per'],
  ['hp', 'hp'],
  ['hpmax', 'hpMax'],
  ['maxhp', 'hpMax'],
  ['hp_max', 'hpMax'],
  ['hpmax%', 'hpMax'],
  ['spd', 'spd'],
  ['speed', 'spd'],
  ['aemax', 'aeMax'],
  ['ae_max', 'aeMax'],
  ['aeregen', 'aeRegen'],
  ['ae_regen', 'aeRegen'],
  ['hpregen', 'hpRegen'],
  ['hp_regen', 'hpRegen']
]);

const BASE_STAT_KEYS: Array<keyof UnitToken> = [
  'atk',
  'wil',
  'res',
  'arm',
  'agi',
  'per',
  'hpMax',
  'spd',
  'aeMax',
  'aeRegen',
  'hpRegen',
];

const normalizeStatKey = (stat: string | null | undefined): string | null => {
  if (typeof stat === 'string'){
    const trimmed = stat.trim();
    if (!trimmed) return null;
    const canonical = trimmed.replace(/[%_\s]/g, '').toLowerCase();
    return STAT_ALIAS.get(canonical) || trimmed;
  }
  return null;
};

const normalizeKey = (value: unknown): string => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const toNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const ensureStatusContainer = (unit: UnitToken | null | undefined): void => {
  if (!unit) return;
  if (!Array.isArray(unit.statuses)) unit.statuses = [];
};

const stacksOf = (unit: UnitToken | null | undefined, id: string): number => {
  const status = Statuses.get(unit, id);
  return status ? status.stacks ?? 0 : 0;
};

interface StatBuffSpec {
  attr: string | null | undefined;
  mode?: 'percent' | 'flat';
  amount?: number;
  purgeable?: boolean;
}

const ensureStatBuff = (
  unit: UnitToken | null | undefined,
  id: string,
  { attr, mode = 'percent', amount = 0, purgeable = true }: StatBuffSpec,
): StatusEffect | null => {
  ensureStatusContainer(unit);
  const statKey = normalizeStatKey(attr) || attr;
  let status = Statuses.get(unit, id);
  if (!status){
    status = Statuses.add(unit, {
      id,
      kind: 'buff',
      tag: 'stat',
      attr: statKey,
      mode,
      amount,
      purgeable,
      stacks: 0,
    });
  }
  status.attr = statKey;
  status.mode = mode;
  status.amount = amount;
  status.purgeable = purgeable;
  return status;
};

const applyStatStacks = (
  status: StatusEffect | null | undefined,
  stacks: number,
  { maxStacks = null }: { maxStacks?: number | null } = {},
): void => {
  if (!status) return;
  let next = Math.max(0, stacks | 0);
  if (typeof maxStacks === 'number'){
    next = Math.min(next, maxStacks);
  }
  status.stacks = next;
};

interface ApplyStatMapOptions {
  mode?: 'percent' | 'flat';
  purgeable?: boolean;
  stack?: boolean;
  stacks?: number;
  maxStacks?: number | null;
  idPrefix?: string;
  stackFlat?: boolean;
}

type AfterHitHandler = (afterCtx?: Record<string, unknown>) => void;

type PassiveRuntimeContext = Record<string, unknown> & {
  afterHit?: AfterHitHandler[];
  damage?: Record<string, unknown> & { baseMul?: number };
  log?: Array<Record<string, unknown>>;
  target?: UnitToken | null;
};

const applyStatMap = (
  unit: UnitToken | null | undefined,
  passive: PassiveSpec | null | undefined,
  stats: Record<string, number>,
  options: ApplyStatMapOptions = {},
): boolean => {
  if (!unit || !stats) return false;
  const mode = options.mode === 'flat' ? 'flat' : 'percent';
  const purgeable = options.purgeable !== false;
  const stackable = options.stack !== false;
  const stacks = Number.isFinite(options.stacks) ? Number(options.stacks) : 1;
  const maxStacks = options.maxStacks;
  const idPrefix = options.idPrefix || passive?.id || 'stat';
  let applied = false;
  for (const [stat, value] of Object.entries(stats)){
    if (!Number.isFinite(value)) continue;
    const attr = normalizeStatKey(stat);
    if (!attr) continue;
    const status = ensureStatBuff(unit, `${idPrefix}_${attr}`, { attr, mode, amount: value, purgeable });
    const nextStacks = stackable ? (status?.stacks ?? 0) + stacks : stacks;
    applyStatStacks(status, nextStacks, { maxStacks });
    applied = true;
  }
  if (applied) recomputeFromStatuses(unit);
  return applied;
};

const captureBaseStats = (unit: UnitToken | null | undefined): Record<string, number> => {
  const source = unit ?? ({} as UnitToken);
  const result: Record<string, number> = {};
  for (const key of BASE_STAT_KEYS){
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)){
      result[key] = value;
    }
  }
  return result;
};

const hasLivingMinion = (unit: UnitToken | null | undefined, Game: SessionState | null | undefined): boolean => {
  if (!unit || !Game) return false;
  return (Game.tokens || []).some(token => token && token.alive && token.isMinion && token.ownerIid === unit.iid);
};

/**
 * @param {Record<string, unknown> | null | undefined} condition
 * @param {{ Game?: SessionState | null; unit?: UnitToken | null; ctx?: Record<string, unknown> | null; passive?: PassiveDefinition | null }} options
 * @returns {boolean}
 */
interface PassiveConditionContext {
  Game?: SessionState | null;
  unit?: UnitToken | null;
  ctx?: Record<string, unknown> | null;
  passive?: PassiveSpec | null;
}

const evaluateConditionObject = (
  condition: Record<string, unknown> | null | undefined,
  { Game, unit, ctx, passive }: PassiveConditionContext,
): boolean => {
  if (!condition || typeof condition !== 'object') return true;
  const hpMax = Number.isFinite(unit?.hpMax)
    ? unit?.hpMax ?? 0
    : Number.isFinite(unit?.baseStats?.hpMax)
      ? unit?.baseStats?.hpMax ?? 0
      : 0;
  const hpPct = hpMax > 0 ? ((unit?.hp ?? hpMax) / hpMax) : 0;
  if (condition.selfHPAbove != null && hpPct <= Number(condition.selfHPAbove)) return false;
  if (condition.selfHPBelow != null && hpPct >= Number(condition.selfHPBelow)) return false;
  if (condition.hpAbove != null && hpPct <= Number(condition.hpAbove)) return false;
  if (condition.hpBelow != null && hpPct >= Number(condition.hpBelow)) return false;

  if ('requiresStatus' in condition && condition.requiresStatus){
    const list = Array.isArray(condition.requiresStatus) ? condition.requiresStatus : [condition.requiresStatus];
    for (const id of list){
      if (typeof id !== 'string' || !Statuses.has(unit ?? null, id)) return false;
    }
  }

  if ('targetHasStatus' in condition && condition.targetHasStatus){
    const target = (ctx as { target?: UnitToken | null } | null | undefined)?.target;
    if (!target) return false;
    const list = Array.isArray(condition.targetHasStatus) ? condition.targetHasStatus : [condition.targetHasStatus];
    for (const id of list){
      if (typeof id !== 'string' || !Statuses.has(target, id)) return false;
    }
  }

  if (condition.minMinions != null){
    const tokens = Game?.tokens || [];
    const count = tokens.filter(t => t && t.alive && t.isMinion && t.ownerIid === unit.iid).length;
    if (count < Number(condition.minMinions)) return false;
  }

  if (condition.maxStacks != null){
    const stackId = (condition.stackId as string | undefined) || passive?.id;
    if (stackId){
      const st = Statuses.get(unit ?? null, stackId);
      const stacks = st ? st.stacks ?? 0 : 0;
      if (stacks >= Number(condition.maxStacks)) return false;
    }
  }

  return true;
};

const passiveConditionsOk = ({
  Game,
  unit,
  passive,
  ctx,
}: {
  Game?: SessionState | null;
  unit?: UnitToken | null;
  passive?: PassiveSpec | null;
  ctx?: Record<string, unknown> | null;
}): boolean => {
  const conditions = passive?.conditions as unknown;
  if (!conditions) return true;
  const list = Array.isArray(conditions) ? conditions : [conditions];
  for (const cond of list){
    if (!cond) continue;
    if (typeof cond === 'function'){
      try {
        if (!cond({ Game, unit, ctx, passive })) return false;
      } catch (_) {
        return false;
      }
      continue;
    }
    if (typeof cond === 'string'){
      const key = cond.trim().toLowerCase();
      if (key === 'hasminion' || key === 'requiresminion'){
        if (!hasLivingMinion(unit, Game)) return false;
      }
      continue;
    }
    if (typeof cond === 'object'){
      if (!evaluateConditionObject(cond as Record<string, unknown>, { Game, unit, ctx, passive })) return false;
    }
  }
  return true;
};

const recomputeFromStatuses = (unit: UnitToken | null | undefined): void => {
  if (!unit || !unit.baseStats) return;
  ensureStatusContainer(unit);

  const percent = new Map<string, number>();
  const flat = new Map<string, number>();
  for (const status of unit.statuses ?? []){
    if (!status || !status.attr || !status.mode) continue;
    const attr = normalizeStatKey(status.attr);
    if (!attr) continue;
    const stacks = status.stacks == null ? 1 : status.stacks;
    const amount = (status.amount ?? status.power ?? 0) * stacks;
    if (!Number.isFinite(amount)) continue;
    const mode = status.mode === 'flat' ? 'flat' : 'percent';
    const store = mode === 'flat' ? flat : percent;
    const prev = store.get(attr) ?? 0;
    store.set(attr, prev + amount);
  }

  for (const [key, baseValue] of Object.entries(unit.baseStats)){
    if (!Number.isFinite(baseValue)) continue;
    const attr = normalizeStatKey(key) || key;
    const pct = percent.get(attr) ?? percent.get(key) ?? 0;
    const add = flat.get(attr) ?? flat.get(key) ?? 0;
    let next = (baseValue ?? 0) * (1 + pct) + add;

    if (attr === 'arm' || attr === 'res'){
      unit[attr] = clamp01(next);
      continue;
    }
    if (attr === 'spd'){
      unit[attr] = Math.max(0, Math.round(next * 100) / 100);
      continue;
    }
    if (attr === 'hpMax' || attr === 'hp' || attr === 'aeMax'){
      unit[attr] = Math.max(0, Math.round(next));
      continue;
    }
    if (attr === 'aeRegen' || attr === 'hpRegen'){
      unit[attr] = Math.max(0, Math.round(next * 100) / 100);
      continue;
    }
    unit[attr] = Math.max(0, Math.round(next));
  }
};

const healTeam = (
  Game: SessionState | null | undefined,
  unit: UnitToken | null | undefined,
  pct: number,
  opts: { mode?: 'targetMax' | 'casterMax' } = {},
): void => {
  if (!Game || !unit) return;
  if (!Number.isFinite(pct) || pct <= 0) return;
  const mode = opts.mode || 'targetMax';
  const casterHpMax = Number.isFinite(unit.hpMax) ? unit.hpMax ?? 0 : 0;
  const allies = (Game.tokens || []).filter(t => t && t.side === unit.side && t.alive);
  for (const ally of allies){
    if (!Number.isFinite(ally.hpMax)) continue;
    const base = mode === 'casterMax' ? casterHpMax : ally.hpMax ?? 0;
    if (!Number.isFinite(base) || base <= 0) continue;
    const healAmount = Math.max(0, Math.round(base * pct));
    if (healAmount <= 0) continue;
    ally.hp = Math.min(ally.hpMax ?? 0, (ally.hp ?? ally.hpMax ?? 0) + healAmount);
  }
};

const EFFECTS: Record<string, PassiveDefinition> = {
  placeMark({ unit, passive, ctx }) {
    const runtime = (ctx ?? {}) as PassiveRuntimeContext;
    const id = passive?.id;
    const target = runtime.target ?? null;
    if (!id || !target) return;
    const params = (passive?.params ?? {}) as Record<string, unknown>;
    const ttl = Number.isFinite(params.ttlTurns) ? Number(params.ttlTurns) : 3;
    const stacksToExplode = Math.max(1, toNumber(params.stacksToExplode, 3));
    const dmgMul = toNumber(params.dmgFromWIL, 0.5);
    const purgeable = params.purgeable !== false;
    if (!Array.isArray(runtime.afterHit)) runtime.afterHit = [];
    runtime.afterHit.push((afterCtx: Record<string, unknown> = {}) => {
      const afterTarget = (afterCtx.target as UnitToken | undefined) ?? runtime.target ?? null;
      if (!afterTarget || !afterTarget.alive) return;
      ensureStatusContainer(afterTarget);
      let status = Statuses.get(afterTarget, id);
      if (!status){
        status = Statuses.add(afterTarget, {
          id,
          kind: 'debuff',
          tag: 'mark',
          stacks: 0,
          dur: ttl,
          tick: 'turn',
          purgeable,
        });
      }
      if (!status) return;
      status.dur = ttl;
      status.stacks = (status.stacks ?? 0) + 1;
      if ((status.stacks ?? 0) < stacksToExplode) return;

      Statuses.remove(afterTarget, id);
      const amount = Math.max(1, Math.round(toNumber(unit?.wil, 0) * dmgMul));
      afterTarget.hp = Math.max(0, (afterTarget.hp ?? 0) - amount);
      if ((afterTarget.hp ?? 0) <= 0){
        if (!hookOnLethalDamage(afterTarget)){
          afterTarget.alive = false;
          if (!afterTarget.deadAt) afterTarget.deadAt = safeNow();
        }
      }
      if (Array.isArray(runtime.log)){
        runtime.log.push({ t: id, source: unit?.name, target: afterTarget?.name, dmg: amount });
      }
    });
  },

  gainATKPercent({ unit, passive }) {
    if (!unit) return;
    const params = (passive?.params ?? {}) as Record<string, unknown>;
    const amount = toNumber(params.amount, 0);
    applyStatMap(unit, passive ?? null, { atk: amount }, {
      mode: 'percent',
      stack: params.stack !== false,
      purgeable: params.purgeable !== false,
      maxStacks: typeof params.maxStacks === 'number' ? params.maxStacks : undefined,
    });
  },

  gainWILPercent({ unit, passive }) {
    if (!unit) return;
    const params = (passive?.params ?? {}) as Record<string, unknown>;
    const amount = toNumber(params.amount, 0);
    applyStatMap(unit, passive ?? null, { wil: amount }, {
      mode: 'percent',
      stack: params.stack !== false,
      purgeable: params.purgeable !== false,
      maxStacks: typeof params.maxStacks === 'number' ? params.maxStacks : undefined,
    });
  },

  conditionalBuff({ unit, passive }) {
    if (!unit || !passive?.id) return;
    const params = (passive.params ?? {}) as Record<string, unknown>;
    const hpMax = toNumber(unit.hpMax, 0);
    const hpPct = hpMax > 0 ? toNumber(unit.hp, hpMax) / hpMax : 0;
    const threshold = toNumber(params.ifHPgt, 0.5);
    const trueStats: Record<string, number> = {};
    const falseStats: Record<string, number> = {};
    if (params.RES != null) trueStats.res = toNumber(params.RES, 0);
    if (params.ARM != null) trueStats.arm = toNumber(params.ARM, 0);
    if (params.ATK != null) trueStats.atk = toNumber(params.ATK, 0);
    if (params.WIL != null) trueStats.wil = toNumber(params.WIL, 0);
    if (params.elseRES != null) falseStats.res = toNumber(params.elseRES, 0);
    if (params.elseARM != null) falseStats.arm = toNumber(params.elseARM, 0);
    if (params.elseATK != null) falseStats.atk = toNumber(params.elseATK, 0);
    if (params.elseWIL != null) falseStats.wil = toNumber(params.elseWIL, 0);

    const purgeable = params.purgeable !== false;
    const applyStats = (stats: Record<string, number>) => {
      for (const [stat, amount] of Object.entries(stats)){
        const attr = stat.toLowerCase();
        const status = ensureStatBuff(unit, `${passive.id}_${attr}`, { attr, mode: 'percent', amount, purgeable });
        applyStatStacks(status, 1);
      }
    };
    const removeStats = (stats: Record<string, number>) => {
      for (const stat of Object.keys(stats)){
        Statuses.remove(unit, `${passive.id}_${stat.toLowerCase()}`);
      }
    };

    if (hpPct > threshold){
      applyStats(trueStats);
      removeStats(falseStats);
    } else {
      applyStats(falseStats);
      removeStats(trueStats);
    }
    recomputeFromStatuses(unit);
  },

  gainRESPct({ Game, unit, passive }) {
    if (!unit) return;
    const params = (passive?.params ?? {}) as Record<string, unknown>;
    const amount = toNumber(params.amount, 0);
    applyStatMap(unit, passive ?? null, { res: amount }, {
      mode: 'percent',
      stack: params.stack !== false,
      purgeable: params.purgeable !== false,
      maxStacks: typeof params.maxStacks === 'number' ? params.maxStacks : undefined,
    });
  },

  gainStats({ unit, passive }) {
    if (!unit) return;
    const params = (passive?.params ?? {}) as Record<string, unknown>;
    const modeRaw = params.mode ?? params.statMode ?? params.kind;
    const mode = modeRaw === 'flat' ? 'flat' : 'percent';
    let applied = false;
    const stats = params.stats;
    if (stats && typeof stats === 'object'){
      applied = applyStatMap(unit, passive ?? null, stats as Record<string, number>, {
        mode,
        stack: params.stack !== false,
        stacks: typeof params.stacks === 'number' ? params.stacks : undefined,
        purgeable: params.purgeable !== false,
        maxStacks: typeof params.maxStacks === 'number' ? params.maxStacks : undefined,
        idPrefix: typeof params.idPrefix === 'string' ? params.idPrefix : passive?.id,
      }) || applied;
    }
    const flatStats = params.flatStats;
    if (flatStats && typeof flatStats === 'object'){
      applied = applyStatMap(unit, passive ?? null, flatStats as Record<string, number>, {
        mode: 'flat',
        stack: params.stackFlat !== false,
        stacks: typeof params.stacksFlat === 'number' ? params.stacksFlat : typeof params.stacks === 'number' ? params.stacks : undefined,
        purgeable: params.purgeable !== false,
        maxStacks: typeof params.maxStacksFlat === 'number' ? params.maxStacksFlat : typeof params.maxStacks === 'number' ? params.maxStacks : undefined,
        idPrefix: `${passive?.id ?? 'stat'}_flat`,
      }) || applied;
    }
    if (!applied && params.attr != null && typeof params.attr === 'string' && typeof params.amount === 'number'){
      const attr = normalizeStatKey(params.attr);
      if (attr){
        applyStatMap(unit, passive ?? null, { [attr]: params.amount } as Record<string, number>, {
          mode,
          stack: params.stack !== false,
          stacks: typeof params.stacks === 'number' ? params.stacks : undefined,
          purgeable: params.purgeable !== false,
          maxStacks: typeof params.maxStacks === 'number' ? params.maxStacks : undefined,
        });
      }
    }
  },

  gainBonus({ Game, unit, passive, ctx }) {
    if (!unit || !ctx || !passive?.id) return;
    const runtime = ctx as PassiveRuntimeContext;
    const params = (passive.params ?? {}) as Record<string, unknown>;
    const perMinion = toNumber(params.perMinion, 0);
    const ownerIid = unit.iid;
    const minions = (Game?.tokens || []).filter(token => token && token.alive && token.isMinion && token.ownerIid === ownerIid).length;
    const status = ensureStatBuff(unit, passive.id, { attr: 'atk', mode: 'percent', amount: 0, purgeable: params.purgeable !== false });
    if (!status) return;
    status.attr = 'atk';
    status.mode = 'percent';
    status.amount = perMinion;
    applyStatStacks(status, minions);
    recomputeFromStatuses(unit);
    if (runtime.damage){
      const bonusPct = perMinion * minions;
      runtime.damage.baseMul = toNumber(runtime.damage.baseMul, 1) * (1 + bonusPct);
    }
  },

  resPerSleeping({ Game, unit, passive }) {
    if (!Game || !unit || !passive?.id) return;
    const params = (passive.params ?? {}) as Record<string, unknown>;
    const foes = (Game.tokens || []).filter(token => token && token.alive && token.side !== unit.side && Statuses.has(token, 'sleep'));
    const status = ensureStatBuff(unit, passive.id, { attr: 'res', mode: 'percent', amount: toNumber(params.perTarget, 0), purgeable: params.purgeable !== false });
    applyStatStacks(status, foes.length, { maxStacks: typeof params.maxStacks === 'number' ? params.maxStacks : undefined });
    recomputeFromStatuses(unit);
  },
};

/** @type {Record<string, PassiveEffectHandler>} */
const PASSIVES = {
  placeMark: EFFECTS.placeMark,
  'gainATK%': EFFECTS.gainATKPercent,
  'gainWIL%': EFFECTS.gainWILPercent,
  conditionalBuff: EFFECTS.conditionalBuff,
  'gainRES%': EFFECTS.gainRESPct,
  gainBonus: EFFECTS.gainBonus,
  gainStats: EFFECTS.gainStats,
  'gainStats%': EFFECTS.gainStats,
  statBuff: EFFECTS.gainStats,
  statGain: EFFECTS.gainStats,
} satisfies PassiveRegistry;

/**
 * @param {SessionState | null | undefined} Game
 * @param {UnitToken | null | undefined} unit
 * @param {string} when
 * @param {Record<string, unknown>} [ctx]
 * @returns {void}
 */
export function emitPassiveEvent(
  Game: SessionState | null | undefined,
  unit: UnitToken | null | undefined,
  when: string,
  ctx: PassiveRuntimeContext = {},
): void {
  if (!Game || !unit) return;
  const meta = Game.meta && typeof Game.meta.get === 'function' ? Game.meta.get(unit.id) : null;
  const kit = meta?.kit;
  if (!kit || !Array.isArray(kit.passives)) return;
  ctx.meta = meta as unknown;
  ctx.kit = kit as unknown;
  for (const passive of kit.passives as Array<PassiveSpec | null | undefined>){
    if (!passive || passive.when !== when) continue;
    const effectKey = typeof passive.effect === 'string'
      ? passive.effect
      : (passive.effect?.type || passive.effect?.kind || null);
    let handler: PassiveDefinition | undefined = effectKey ? PASSIVES[effectKey] : undefined;
    let effectivePassive: PassiveSpec | null = passive;

    if (passive && typeof passive.effect === 'object' && passive.effect !== null){
      const spec = passive.effect;
      const type = spec.type || spec.kind;
      if (type && PASSIVES[type]) handler = PASSIVES[type];
      const mergedParams = {
        ...(spec.params || {}),
        ...(passive.params || {}),
        ...(spec.stats ? { stats: spec.stats } : {}),
        ...(spec.flatStats ? { flatStats: spec.flatStats } : {}),
      };
      effectivePassive = { ...passive, params: mergedParams };
      if (!handler && ((mergedParams as Record<string, unknown>).stats || (mergedParams as Record<string, unknown>).flatStats)){
        handler = EFFECTS.gainStats;
      }
    } else if (!handler && passive?.params && (passive.params.stats || passive.params.flatStats)){
      handler = EFFECTS.gainStats;
    }

    const params = effectivePassive?.params as Record<string, unknown> | undefined;
    if (effectKey === 'gainRES%' && params && params.perTarget != null){
      handler = EFFECTS.resPerSleeping;
    }
    if (typeof handler !== 'function') continue;
    if (!passiveConditionsOk({ Game, unit, passive: effectivePassive, ctx })) continue;
    handler({ Game: Game ?? null, unit: unit ?? null, passive: effectivePassive ?? null, ctx });
  }
}

/**
 * @param {SessionState | null | undefined} Game
 * @param {UnitToken | null | undefined} unit
 * @param {Record<string, unknown>} [onSpawn]
 * @returns {void}
 */
export function applyOnSpawnEffects(
  Game: SessionState | null | undefined,
  unit: UnitToken | null | undefined,
  onSpawn: Record<string, unknown> = {},
): void {
  if (!Game || !unit || !onSpawn) return;
  ensureStatusContainer(unit);

  const effects: Array<Record<string, unknown>> = [];
  if (Array.isArray(onSpawn.effects)) effects.push(...onSpawn.effects as Record<string, unknown>[]);

  if (Number.isFinite(onSpawn.teamHealOnEntry) && Number(onSpawn.teamHealOnEntry) > 0){
    effects.push({ type: 'teamHeal', amount: onSpawn.teamHealOnEntry, mode: 'targetMax' });
  }
  const casterHeal = (onSpawn.teamHealPercentMaxHPOfCaster ?? onSpawn.teamHealPercentCasterMaxHP) as number | undefined;
  if (Number.isFinite(casterHeal) && Number(casterHeal) > 0){
    effects.push({ type: 'teamHeal', amount: casterHeal, mode: 'casterMax' });
  }

  if (Array.isArray(onSpawn.statuses)){
    for (const st of onSpawn.statuses){
      if (!st || typeof st !== 'object') continue;
      effects.push({ type: 'status', status: st });
    }
  }
  if (Array.isArray(onSpawn.addStatuses)){
    for (const st of onSpawn.addStatuses){
      if (!st || typeof st !== 'object') continue;
      effects.push({ type: 'status', status: st });
    }
  }
  if (onSpawn.status && typeof onSpawn.status === 'object'){
    effects.push({ type: 'status', status: onSpawn.status });
  }

  if (onSpawn.stats && typeof onSpawn.stats === 'object'){
    effects.push({ type: 'stats', stats: onSpawn.stats, mode: onSpawn.statsMode || onSpawn.mode, purgeable: onSpawn.purgeable });
  }
  if (onSpawn.flatStats && typeof onSpawn.flatStats === 'object'){
    effects.push({ type: 'stats', stats: onSpawn.flatStats, mode: 'flat', purgeable: onSpawn.purgeable, id: 'onSpawn_flat' });
  }

  let statsChanged = false;
  for (const effect of effects){
    if (!effect) continue;
    const type = normalizeKey(effect.type ?? effect.kind ?? effect.effect);
    if (type === 'teamheal'){
      const amount = toNumber(effect.amount ?? effect.value ?? effect.percent, 0);
      if (amount <= 0) continue;
      const mode = effect.mode === 'casterMax' ? 'casterMax' : 'targetMax';
      healTeam(Game, unit, amount, { mode });
      continue;
    }
    if (type === 'status' || type === 'addstatus'){
      const statusEffect = effect.status;
      if (statusEffect && typeof statusEffect === 'object'){
        Statuses.add(unit, statusEffect as StatusEffect);
      }
      continue;
    }
    if (type === 'stats' || type === 'stat' || type === 'buff'){
      const stats = effect.stats || effect.values;
      if (!stats || typeof stats !== 'object') continue;
      const applied = applyStatMap(unit, ({ id: (effect.id as string) || 'onSpawn' } as PassiveSpec), stats as Record<string, number>, {
        mode: effect.mode === 'flat' ? 'flat' : (effect.statMode === 'flat' ? 'flat' : 'percent'),
        stack: effect.stack !== false,
        stacks: typeof effect.stacks === 'number' ? effect.stacks : undefined,
        purgeable: effect.purgeable !== false,
        maxStacks: typeof effect.maxStacks === 'number' ? effect.maxStacks : undefined,
        idPrefix: (effect.id as string) || 'onSpawn',
      });
      statsChanged = applied || statsChanged;
      continue;
    }
  }

  if (statsChanged){
    if (typeof unit._recalcStats === 'function'){
      unit._recalcStats();
    } else {
      recomputeFromStatuses(unit);
    }
  } else if (typeof unit._recalcStats === 'function'){
    unit._recalcStats();
  } else {
    recomputeFromStatuses(unit);
  }
}

/**
 * @param {UnitToken | null | undefined} unit
 * @returns {void}
 */
export function prepareUnitForPassives(unit: UnitToken | null | undefined): void {
  if (!unit) return;
  ensureStatusContainer(unit);
  const captured = captureBaseStats(unit);
  if (!unit.baseStats || typeof unit.baseStats !== 'object'){
    unit.baseStats = { ...captured } as Record<string, number>;
  } else {
    for (const [key, value] of Object.entries(captured)){
      if (!Number.isFinite((unit.baseStats as Record<string, number>)[key])){
        (unit.baseStats as Record<string, number>)[key] = value;
      }
    }
  }
  unit._recalcStats = () => recomputeFromStatuses(unit);
}

export { recomputeFromStatuses as recomputeUnitStats, stacksOf };