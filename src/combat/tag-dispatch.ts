import { applyDamage, grantShield } from './apply-damage.ts';
import { Statuses } from '../statuses.ts';
import { normalizeTagList } from '../data/tags.ts';
import { dealAbilityDamage, healUnit } from '../combat.ts';

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
  deferEffects?: boolean;
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
  deferEffects: boolean;
  allyTokens: UnitToken[];
  enemyTokens: UnitToken[];
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

const EMPTY_TOKENS: UnitToken[] = [];

function splitAliveTokensBySide(
  tokens: ReadonlyArray<UnitToken>,
  attacker: UnitToken | null,
): { allyTokens: UnitToken[]; enemyTokens: UnitToken[] } {
  if (!attacker) {
    return {
      allyTokens: EMPTY_TOKENS,
      enemyTokens: EMPTY_TOKENS,
    };
  }

  const allyTokens: UnitToken[] = [];
  const enemyTokens: UnitToken[] = [];
  for (const token of tokens) {
    if (!token?.alive) continue;
    if (token.side === attacker.side) allyTokens.push(token);
    else enemyTokens.push(token);
  }

  allyTokens.sort((a, b) => (a.cy - b.cy) || (a.cx - b.cx));
  enemyTokens.sort((a, b) => (a.cy - b.cy) || (a.cx - b.cx));
  return { allyTokens, enemyTokens };
}

const collectSideTokens = (ctx: Pick<NormalizedContext, 'attacker' | 'allyTokens' | 'enemyTokens'>, side: Side): UnitToken[] => {
  if (!ctx.attacker) return EMPTY_TOKENS;
  const isAttackerSide = ctx.attacker.side === side;
  return isAttackerSide ? ctx.allyTokens : ctx.enemyTokens;
};

const readTargetLimit = (ctx: Pick<NormalizedContext, 'payload'>, fallback: number): number => (
  Math.max(1, Math.round(asFinite(ctx.payload?.targetCount ?? ctx.payload?.targets, fallback)))
);

const readTurns = (payload: Record<string, unknown> | null, ...keys: string[]): number => {
  for (const key of keys){
    const raw = (payload?.[key] ?? null) as unknown;
    const direct = asFinite(raw, NaN);
    if (Number.isFinite(direct) && direct > 0) return Math.max(1, Math.round(direct));
    if (raw && typeof raw === 'object'){
      const nestedTurns = asFinite((raw as Record<string, unknown>).turns, NaN);
      if (Number.isFinite(nestedTurns) && nestedTurns > 0) return Math.max(1, Math.round(nestedTurns));
    }
  }
  return 1;
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
  self: (ctx, result) => {
    if (ctx.attacker?.alive) result.targets = [ctx.attacker];
  },
  ally: (ctx, result) => {
    if (!ctx.attacker) return;
    if (result.targets.length > 0) return;
    const limit = readTargetLimit(ctx, 1);
    result.targets = collectSideTokens(ctx, 'ally').slice(0, limit);
  },
  enemy: (ctx, result) => {
    if (!ctx.attacker) return;
    if (result.targets.length > 0) return;
    const foeSide = ctx.attacker.side === 'ally' ? 'enemy' : 'ally';
    const limit = readTargetLimit(ctx, 1);
    result.targets = collectSideTokens(ctx, foeSide).slice(0, limit);
  },
  'random-target': (ctx, result) => {
    if (!ctx.attacker) return;
    if (result.targets.length > 0) return;
    const foeSide = ctx.attacker.side === 'ally' ? 'enemy' : 'ally';
    const candidates = collectSideTokens(ctx, foeSide);
    if (candidates.length > 0) result.targets = [candidates[0]];
  },
  'random-aoe': (ctx, result) => {
    if (!ctx.attacker) return;
    const foeSide = ctx.attacker.side === 'ally' ? 'enemy' : 'ally';
    const limit = readTargetLimit(ctx, 2);
    result.targets = collectSideTokens(ctx, foeSide).slice(0, limit);
  },
  'multi-target': (ctx, result) => {
    if (!ctx.attacker) return;
    if (result.targets.length > 0) return;
    const limit = readTargetLimit(ctx, 2);
    const foeSide = ctx.attacker.side === 'ally' ? 'enemy' : 'ally';
    result.targets = collectSideTokens(ctx, foeSide).slice(0, limit);
  },
  aoe: (ctx, result) => {
    if (!ctx.attacker) return;
    const foeSide = ctx.attacker.side === 'ally' ? 'enemy' : 'ally';
    result.targets = collectSideTokens(ctx, foeSide);
  },
  heal: (ctx, result) => {
    if (ctx.deferEffects) return;
    const amount = Math.max(0, Math.round(asFinite(ctx.payload?.healAmount ?? ctx.payload?.heal, 0)));
    if (amount <= 0) return;
    const targets = result.targets.length > 0 ? result.targets : (ctx.attacker ? [ctx.attacker] : []);
    for (const token of targets) {
      healUnit(token, amount);
    }
    result.sideEffects.push(`heal:${amount}`);
  },
  'team-heal': (ctx, result) => {
    if (ctx.deferEffects) return;
    const amount = Math.max(0, Math.round(asFinite(ctx.payload?.healAmount ?? ctx.payload?.heal, 0)));
    if (amount <= 0 || !ctx.attacker) return;
    for (const token of collectSideTokens(ctx, 'ally')) healUnit(token, amount);
    result.sideEffects.push(`team-heal:${amount}`);
  },
  shield: (ctx, result) => {
    if (ctx.deferEffects) return;
    const amount = Math.max(0, Math.round(asFinite(ctx.payload?.shieldAmount ?? ctx.payload?.shield, 0)));
    if (amount <= 0) return;
    const targets = result.targets.length > 0 ? result.targets : (ctx.attacker ? [ctx.attacker] : []);
    for (const token of targets) grantShield(token, amount);
    result.sideEffects.push(`shield:${amount}`);
  },
  silence: (ctx, result) => {
    if (ctx.deferEffects) return;
    const turns = readTurns(ctx.payload, 'silenceTurns', 'turns', 'duration');
    for (const token of result.targets) addStatus(token, 'silence', turns);
    if (result.targets.length > 0) result.sideEffects.push(`silence:${turns}`);
  },
  sleep: (ctx, result) => {
    if (ctx.deferEffects) return;
    const turns = readTurns(ctx.payload, 'sleepTurns', 'turns', 'duration');
    for (const token of result.targets) addStatus(token, 'sleep', turns);
    if (result.targets.length > 0) result.sideEffects.push(`sleep:${turns}`);
  },
  mark: (ctx, result) => {
    if (ctx.deferEffects) return;
    const turns = readTurns(ctx.payload, 'markTurns', 'turns', 'duration');
    for (const token of result.targets) addStatus(token, 'mark', turns);
    if (result.targets.length > 0) result.sideEffects.push(`mark:${turns}`);
  },
  control: (ctx, result) => {
    if (ctx.deferEffects) return;
    const turns = readTurns(ctx.payload, 'controlTurns', 'turns', 'duration');
    const statusId = String(ctx.payload?.controlStatus ?? 'control');
    for (const token of result.targets) addStatus(token, statusId, turns);
    if (result.targets.length > 0) result.sideEffects.push(`${statusId}:${turns}`);
  },
  summon: (ctx, result) => {
    if (ctx.deferEffects) return;
    if (typeof ctx.onSummon === 'function') {
      ctx.onSummon();
      result.sideEffects.push('summon');
    }
  },
  'non-heal-hp-change': (ctx, result) => {
    if (ctx.deferEffects) return;
    const amount = Math.max(0, Math.round(asFinite(ctx.payload?.hpDelta ?? ctx.payload?.damage, 0)));
    if (amount <= 0) return;
    for (const token of result.targets) {
      if (ctx.game && ctx.attacker) {
        dealAbilityDamage(ctx.game, ctx.attacker, token, { base: amount, attackType: 'skill' });
      } else {
        applyDamage(token, amount);
      }
    }
    if (result.targets.length > 0) result.sideEffects.push(`hp-change:${amount}`);
  },
});

export function dispatchGameplayTags(
  rawTags: ReadonlyArray<string> | null | undefined,
  context: TagDispatchContext,
): TagDispatchResult {
  const tags = normalizeTagList(rawTags);
  const target = context.target ?? null;
  const attacker = context.attacker ?? null;
  const { allyTokens, enemyTokens } = context.game
    ? splitAliveTokensBySide(context.game.tokens, attacker)
    : { allyTokens: EMPTY_TOKENS, enemyTokens: EMPTY_TOKENS };

  const ctx: NormalizedContext = {
    game: context.game ?? null,
    attacker,
    target,
    targets: resolveTargets(context.targets, target),
    cost: Math.max(0, Math.round(asFinite(context.cost, 0))),
    side: context.side ?? context.attacker?.side ?? null,
    turn: context.turn ?? null,
    payload: context.payload ?? null,
    onAetherCost: context.onAetherCost ?? (() => false),
    onSummon: context.onSummon ?? (() => undefined),
    deferEffects: Boolean(context.deferEffects),
    allyTokens,
    enemyTokens,
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
