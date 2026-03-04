import { applyDamage, grantShield } from './apply-damage.ts';
import { Statuses } from '../statuses.ts';
import { normalizeTagList } from '../data/tags.ts';

import type { SessionState } from '@shared-types/combat';
import type { Side, UnitToken } from '@shared-types/units';

export interface TagDispatchContext {
  game: SessionState | null;
  attacker: UnitToken | null;
  target?: UnitToken | null;
  targets?: UnitToken[];
  cost?: number;
  side?: Side | null;
  turn?: number | null;
  payload?: Record<string, unknown> | null;
  onAetherCost?: (amount: number, side: Side) => boolean;
  onSummon?: () => void;
}

export interface TagDispatchResult {
  tags: string[];
  targets: UnitToken[];
  applied: string[];
  sideEffects: string[];
}

type NormalizedContext = {
  game: SessionState | null;
  attacker: UnitToken | null;
  target: UnitToken | null;
  targets: UnitToken[];
  cost: number;
  side: Side | null;
  turn: number | null;
  payload: Record<string, unknown> | null;
  onAetherCost: (amount: number, side: Side) => boolean;
  onSummon: () => void;
};

type TagHandler = (ctx: NormalizedContext, result: TagDispatchResult) => void;

const asFinite = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveTargets = (targets: UnitToken[] | undefined, target: UnitToken | null): UnitToken[] => {
  if (Array.isArray(targets) && targets.length > 0) {
    return targets.filter((token): token is UnitToken => Boolean(token?.alive));
  }
  if (target?.alive) return [target];
  return [];
};

const addStatus = (target: UnitToken, id: string, turns: number): void => {
  Statuses.add(target, {
    id,
    kind: 'debuff',
    tag: id,
    dur: Math.max(1, Math.round(turns)),
    tick: 'turn',
  });
};

const HANDLERS: Readonly<Record<string, TagHandler>> = Object.freeze({
  'aether-cost': (ctx, result) => {
    const amount = Math.max(0, Math.round(asFinite(ctx.cost, 0)));
    if (!ctx.side || amount <= 0 || typeof ctx.onAetherCost !== 'function') return;
    const consumed = ctx.onAetherCost(amount, ctx.side);
    if (consumed) result.sideEffects.push(`aether:${ctx.side}:${amount}`);
  },
  'single-target': (ctx, result) => {
    if (result.targets.length > 0) return;
    if (ctx.target?.alive) result.targets = [ctx.target];
  },
  'multi-target': (ctx, result) => {
    if (!ctx.game || !ctx.attacker) return;
    if (result.targets.length > 0) return;
    const limit = Math.max(1, Math.round(asFinite(ctx.payload?.targetCount ?? ctx.payload?.targets, 2)));
    const foeSide = ctx.attacker.side === 'ally' ? 'enemy' : 'ally';
    result.targets = ctx.game.tokens.filter((token) => token.alive && token.side === foeSide).slice(0, limit);
  },
  aoe: (ctx, result) => {
    if (!ctx.game || !ctx.attacker) return;
    const foeSide = ctx.attacker.side === 'ally' ? 'enemy' : 'ally';
    result.targets = ctx.game.tokens.filter((token) => token.alive && token.side === foeSide);
  },
  heal: (ctx, result) => {
    const amount = Math.max(0, Math.round(asFinite(ctx.payload?.healAmount ?? ctx.payload?.heal, 0)));
    if (amount <= 0) return;
    const targets = result.targets.length > 0 ? result.targets : (ctx.attacker ? [ctx.attacker] : []);
    for (const token of targets) {
      const hpMax = Number.isFinite(token.hpMax) ? Number(token.hpMax) : Number.POSITIVE_INFINITY;
      const current = Number.isFinite(token.hp) ? Number(token.hp) : 0;
      token.hp = Math.max(0, Math.min(hpMax, current + amount));
    }
    result.sideEffects.push(`heal:${amount}`);
  },
  shield: (ctx, result) => {
    const amount = Math.max(0, Math.round(asFinite(ctx.payload?.shieldAmount ?? ctx.payload?.shield, 0)));
    if (amount <= 0) return;
    const targets = result.targets.length > 0 ? result.targets : (ctx.attacker ? [ctx.attacker] : []);
    for (const token of targets) grantShield(token, amount);
    result.sideEffects.push(`shield:${amount}`);
  },
  silence: (ctx, result) => {
    const turns = Math.max(1, Math.round(asFinite(ctx.payload?.silenceTurns ?? ctx.payload?.turns, 1)));
    for (const token of result.targets) addStatus(token, 'silence', turns);
    if (result.targets.length > 0) result.sideEffects.push(`silence:${turns}`);
  },
  sleep: (ctx, result) => {
    const turns = Math.max(1, Math.round(asFinite(ctx.payload?.sleepTurns ?? ctx.payload?.turns, 1)));
    for (const token of result.targets) addStatus(token, 'sleep', turns);
    if (result.targets.length > 0) result.sideEffects.push(`sleep:${turns}`);
  },
  mark: (ctx, result) => {
    const turns = Math.max(1, Math.round(asFinite(ctx.payload?.markTurns ?? ctx.payload?.turns, 2)));
    for (const token of result.targets) addStatus(token, 'mark', turns);
    if (result.targets.length > 0) result.sideEffects.push(`mark:${turns}`);
  },
  summon: (ctx, result) => {
    if (typeof ctx.onSummon === 'function') {
      ctx.onSummon();
      result.sideEffects.push('summon');
    }
  },
  'non-heal-hp-change': (ctx, result) => {
    const amount = Math.max(0, Math.round(asFinite(ctx.payload?.hpDelta ?? ctx.payload?.damage, 0)));
    if (amount <= 0) return;
    for (const token of result.targets) applyDamage(token, amount);
    if (result.targets.length > 0) result.sideEffects.push(`hp-change:${amount}`);
  },
});

export function dispatchGameplayTags(
  rawTags: ReadonlyArray<string> | null | undefined,
  context: TagDispatchContext,
): TagDispatchResult {
  const tags = normalizeTagList(rawTags);
  const target = context.target ?? null;
  const ctx: NormalizedContext = {
    game: context.game ?? null,
    attacker: context.attacker ?? null,
    target,
    targets: resolveTargets(context.targets, target),
    cost: Math.max(0, Math.round(asFinite(context.cost, 0))),
    side: context.side ?? context.attacker?.side ?? null,
    turn: context.turn ?? null,
    payload: context.payload ?? null,
    onAetherCost: context.onAetherCost ?? (() => false),
    onSummon: context.onSummon ?? (() => undefined),
  };

  const result: TagDispatchResult = {
    tags,
    targets: [...ctx.targets],
    applied: [],
    sideEffects: [],
  };

  for (const tag of tags) {
    const handler = HANDLERS[tag];
    if (!handler) continue;
    handler(ctx, result);
    result.applied.push(tag);
  }

  return result;
}
