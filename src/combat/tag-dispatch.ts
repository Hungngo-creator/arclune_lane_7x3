import { applyDamage, grantShield } from './apply-damage.ts';
import { toFiniteNumber, toPositiveTurns, toRoundedInt } from './number-utils.ts';
import { Statuses } from '../statuses.ts';
import { normalizeTagList } from '../data/tags.ts';
import { dealAbilityDamage, healUnit } from '../combat.ts';
import { nextRngValue } from '../utils/rng.ts';
import { ensureStatusList, getStatusEntryById } from './status-utils.ts';
import { partitionTokensBySide } from './token-side-utils.ts';

import type { SessionState } from '@shared-types/combat';
import type { Side, UnitToken } from '@shared-types/units';

export interface TagDispatchContext {
  game: SessionState | null;
  attacker: UnitToken | null;
  target?: UnitToken | null;
  targets?: UnitToken[];
  cost?: number;
  side?: Side | null;
  payload?: Record<string, unknown> | null;
  onAetherCost?: (amount: number, side: Side) => boolean;
  deferEffects?: boolean;
  onSummon?: () => void;
  tagsNormalized?: boolean;
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
  payload: Record<string, unknown> | null;
  onAetherCost: (amount: number, side: Side) => boolean;
  onSummon: () => void;
  deferEffects: boolean;
  attackerTokens: UnitToken[];
  opponentTokens: UnitToken[];
};

type TagHandler = (ctx: NormalizedContext, result: TagDispatchResult) => void;

const resolveTargets = (targets: UnitToken[] | undefined, target: UnitToken | null): UnitToken[] => {
  if (Array.isArray(targets) && targets.length > 0) {
    return targets.filter((token): token is UnitToken => Boolean(token?.alive));
  }
  if (target?.alive) return [target];
  return [];
};

const EMPTY_TOKENS: UnitToken[] = [];

const resolveRandom = (ctx: Pick<NormalizedContext, 'game'>): (() => number) => (
  ctx.game?.rng ? () => nextRngValue(ctx.game?.rng) : Math.random
);

const sampleTargets = (tokens: ReadonlyArray<UnitToken>, limit: number, randomFn: () => number): UnitToken[] => {
  if (limit <= 0 || tokens.length === 0) return [];
  if (tokens.length <= limit) return [...tokens];

  const pool = [...tokens];
  for (let i = 0; i < limit; i += 1) {
    const swapIndex = i + Math.floor(randomFn() * (pool.length - i));
    [pool[i], pool[swapIndex]] = [pool[swapIndex], pool[i]];
  }
  return pool.slice(0, limit);
};

const sampleTargetsWithReplacement = (tokens: ReadonlyArray<UnitToken>, limit: number, randomFn: () => number): UnitToken[] => {
  if (limit <= 0 || tokens.length === 0) return [];
  const sampled: UnitToken[] = [];
  for (let i = 0; i < limit; i += 1) {
    const picked = tokens[Math.floor(randomFn() * tokens.length)];
    if (picked) sampled.push(picked);
  }
  return sampled;
};

const readTargetLimit = (ctx: Pick<NormalizedContext, 'payload'>, fallback: number): number => (
  Math.max(1, toRoundedInt(ctx.payload?.targetCount ?? ctx.payload?.targets, fallback))
);

const readAllowDuplicateTargets = (ctx: Pick<NormalizedContext, 'payload'>): boolean => (
  ctx.payload?.allowDuplicateTargets === true
  || ctx.payload?.allowDuplicates === true
);

const sampleFromCandidates = (ctx: Pick<NormalizedContext, 'payload' | 'game'>, candidates: ReadonlyArray<UnitToken>, limit: number): UnitToken[] => {
  const randomFn = resolveRandom(ctx);
  if (readAllowDuplicateTargets(ctx)) {
    return sampleTargetsWithReplacement(candidates, limit, randomFn);
  }
  return sampleTargets(candidates, limit, randomFn);
};

const readTurns = (payload: Record<string, unknown> | null, ...keys: string[]): number => {
  for (const key of keys){
    const raw = (payload?.[key] ?? null) as unknown;
    const direct = toFiniteNumber(raw, NaN);
    if (Number.isFinite(direct) && direct > 0) return toPositiveTurns(direct);
    if (raw && typeof raw === 'object'){
      const nestedTurns = toFiniteNumber((raw as Record<string, unknown>).turns, NaN);
      if (Number.isFinite(nestedTurns) && nestedTurns > 0) return toPositiveTurns(nestedTurns);
    }
  }
  return 1;
};

const addStatus = (target: UnitToken, id: string, turns: number, sourceUnitId?: string): void => {
  Statuses.add(target, {
    id,
    kind: 'debuff',
    tag: id,
    dur: toPositiveTurns(turns),
    tick: 'turn',
    ...(sourceUnitId ? { sourceUnitId } : {}),
  });
};

const applyTaggedStatus = (
  ctx: NormalizedContext,
  result: TagDispatchResult,
  statusId: string,
  ...turnKeys: string[]
): void => {
  if (ctx.deferEffects) return;
  const turns = readTurns(ctx.payload, ...turnKeys);
  const sourceUnitId = ctx.attacker?.id;
  for (const token of result.targets) addStatus(token, statusId, turns, sourceUnitId);
  if (result.targets.length > 0) result.sideEffects.push(`${statusId}:${turns}`);
};

function applyMarkStackingStatus(ctx: NormalizedContext, result: TagDispatchResult): void {
  if (ctx.deferEffects) return;
  const payload = ctx.payload ?? {};
  const statusId = String(payload.markId ?? 'mark');
  const stacksPerApply = Math.max(1, toRoundedInt(payload.markStacks ?? payload.stacks ?? 1, 1));
  const maxStacks = Math.max(1, toRoundedInt(payload.markMaxStacks ?? payload.maxStacks ?? 3, 3));
  const sleepTurnsOnCap = Math.max(0, toRoundedInt(payload.sleepTurnsOnCap ?? payload.markSleepTurns ?? 0, 0));
  const nonPurgeableByTag = result.tags.includes('sleep-setup');
  const purgeable = typeof payload.markPurgeable === 'boolean' ? payload.markPurgeable : !nonPurgeableByTag;

  for (const target of result.targets) {
    const statuses = ensureStatusList(target);
    const existingEntry = getStatusEntryById(target, statusId, statuses);

    if (!existingEntry) {
      Statuses.add(target, {
        id: statusId,
        kind: 'mark',
        tag: 'mark',
        stacks: Math.min(maxStacks, stacksPerApply),
        maxStacks,
        purgeable,
        ...(ctx.attacker?.id ? { sourceUnitId: ctx.attacker.id } : {}),
      });
      continue;
    }

    const status = existingEntry.status;
    const currentStacks = Math.max(0, toRoundedInt(status?.stacks ?? 0, 0));
    const nextStacks = Math.min(maxStacks, currentStacks + stacksPerApply);
    status.stacks = nextStacks;
    status.maxStacks = maxStacks;
    status.purgeable = purgeable;

    if (nextStacks < maxStacks) continue;
    if (sleepTurnsOnCap > 0 || nonPurgeableByTag) {
      addStatus(target, 'sleep', Math.max(1, sleepTurnsOnCap || 1), ctx.attacker?.id);
      result.sideEffects.push(`sleep:${Math.max(1, sleepTurnsOnCap || 1)}`);
    }
    statuses.splice(existingEntry.index, 1);
    result.sideEffects.push(`mark-cap:${statusId}`);
  }
}

const HANDLERS: Readonly<Record<string, TagHandler>> = Object.freeze({
  'aether-cost': (ctx, result) => {
    const amount = Math.max(0, toRoundedInt(ctx.cost, 0));
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
    result.targets = ctx.attackerTokens.slice(0, limit);
  },
  enemy: (ctx, result) => {
    if (!ctx.attacker) return;
    if (result.targets.length > 0) return;
    result.targets = ctx.opponentTokens.slice(0, readTargetLimit(ctx, 1));
  },
  'random-target': (ctx, result) => {
    if (!ctx.attacker) return;
    if (result.targets.length > 0) return;
    const candidates = ctx.opponentTokens;
    if (candidates.length > 0) result.targets = sampleFromCandidates(ctx, candidates, 1);
  },
  'random-aoe': (ctx, result) => {
    if (!ctx.attacker) return;
    const limit = readTargetLimit(ctx, 2);
    result.targets = sampleFromCandidates(ctx, ctx.opponentTokens, limit);
  },
  'multi-target': (ctx, result) => {
    if (!ctx.attacker) return;
    if (result.targets.length > 0) return;
    result.targets = ctx.opponentTokens.slice(0, readTargetLimit(ctx, 2));
  },
  aoe: (ctx, result) => {
    if (!ctx.attacker) return;
    result.targets = ctx.opponentTokens;
  },
  heal: (ctx, result) => {
    if (ctx.deferEffects) return;
    const amount = Math.max(0, toRoundedInt(ctx.payload?.healAmount ?? ctx.payload?.heal, 0));
    if (amount <= 0) return;
    const targets = result.targets.length > 0 ? result.targets : (ctx.attacker ? [ctx.attacker] : []);
    for (const token of targets) {
      healUnit(token, amount);
    }
    result.sideEffects.push(`heal:${amount}`);
  },
  'team-heal': (ctx, result) => {
    if (ctx.deferEffects) return;
    const amount = Math.max(0, toRoundedInt(ctx.payload?.healAmount ?? ctx.payload?.heal, 0));
    if (amount <= 0 || !ctx.attacker) return;
    for (const token of ctx.attackerTokens) healUnit(token, amount);
    result.sideEffects.push(`team-heal:${amount}`);
  },
  shield: (ctx, result) => {
    if (ctx.deferEffects) return;
    const amount = Math.max(0, toRoundedInt(ctx.payload?.shieldAmount ?? ctx.payload?.shield, 0));
    if (amount <= 0) return;
    const targets = result.targets.length > 0 ? result.targets : (ctx.attacker ? [ctx.attacker] : []);
    for (const token of targets) grantShield(token, amount);
    result.sideEffects.push(`shield:${amount}`);
  },
  silence: (ctx, result) => {
    applyTaggedStatus(ctx, result, 'silence', 'silenceTurns', 'turns', 'duration');
  },
  sleep: (ctx, result) => {
    applyTaggedStatus(ctx, result, 'sleep', 'sleepTurns', 'turns', 'duration');
  },
  mark: (ctx, result) => {
    applyMarkStackingStatus(ctx, result);
  },
  control: (ctx, result) => {
    const statusId = String(ctx.payload?.controlStatus ?? 'control');
    applyTaggedStatus(ctx, result, statusId, 'controlTurns', 'turns', 'duration');
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
    const amount = Math.max(0, toRoundedInt(ctx.payload?.hpDelta ?? ctx.payload?.damage, 0));
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
  const tags = context.tagsNormalized
    ? (Array.isArray(rawTags) ? [...rawTags] : [])
    : normalizeTagList(rawTags);
  const target = context.target ?? null;
  const attacker = context.attacker ?? null;
  const { allyTokens, enemyTokens } = context.game && attacker
    ? partitionTokensBySide(context.game.tokens, attacker.side, { sortByBoardPosition: true })
    : { allyTokens: EMPTY_TOKENS, enemyTokens: EMPTY_TOKENS };

  const ctx: NormalizedContext = {
    game: context.game ?? null,
    attacker,
    target,
    targets: resolveTargets(context.targets, target),
    cost: Math.max(0, toRoundedInt(context.cost, 0)),
    side: context.side ?? context.attacker?.side ?? null,
    payload: context.payload ?? null,
    onAetherCost: context.onAetherCost ?? (() => false),
    onSummon: context.onSummon ?? (() => undefined),
    deferEffects: Boolean(context.deferEffects),
    attackerTokens: attacker ? allyTokens : EMPTY_TOKENS,
    opponentTokens: attacker ? enemyTokens : EMPTY_TOKENS,
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
