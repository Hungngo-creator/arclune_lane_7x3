import { applyDamage, grantShield } from './apply-damage.ts';
import { toFiniteNumber, toPositiveTurns, toRoundedInt } from './number-utils.ts';
import { Statuses } from '../statuses.ts';
import { normalizeTagList } from '../data/tags.ts';
import { dealAbilityDamage, healUnit } from '../combat.ts';
import { nextRngValue } from '../utils/rng.ts';
import { ensureStatusList, getStatusEntryById } from './status-utils.ts';
import { partitionTokensBySide } from './token-side-utils.ts';
import { slotIndex } from '../engine.ts';

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
const RULE_TARGET_OVERRIDE_TAGS = new Set(['global-rule']);
const MARK_APPLICATION_TAGS = Object.freeze(['mark', 'sleep-setup'] as const);
const EMPTY_TAGS: string[] = [];
const DISPATCH_TAG_ALIASES = Object.freeze<Record<string, string>>({
  'self-and-ally': 'ally',
  'ally-and-self': 'ally',
  'ban_than_lan_dong_minh': 'ally',
  'ban-than-lan-dong-minh': 'ally',
  'ban than lan dong minh': 'ally',
  'bản thân lẫn đồng minh': 'ally',
  'random-single': 'random-target',
  'single-target-random': 'random-target',
  'đơn mục tiêu ngẫu nhiên': 'random-target',
  'all-enemy': 'aoe',
  'kẻ địch': 'enemy',
  'lap-tuc': 'instant',
  'lập tức': 'instant',
  'quy tắc': 'global-rule',
  'quy-tac': 'global-rule',
  'muc-tieu-leader': 'leader-target',
  'mục tiêu leader': 'leader-target',
  'mục tiêu: leader': 'leader-target',
  'target-leader': 'leader-target',
});

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
  targetPriority: TargetPriority;
  targetRole: TargetRole;
};

type TagHandler = (ctx: NormalizedContext, result: TagDispatchResult) => void;

function resolveDispatchTag(tag: string): string {
  return DISPATCH_TAG_ALIASES[tag] ?? tag;
}

function collectAliveTargets(tokens: ReadonlyArray<UnitToken>): UnitToken[] {
  const alive: UnitToken[] = [];
  for (const token of tokens) {
    if (token?.alive) alive.push(token);
  }
  return alive;
}

const resolveTargets = (targets: UnitToken[] | undefined, target: UnitToken | null): UnitToken[] => {
  if (Array.isArray(targets) && targets.length > 0) {
    return collectAliveTargets(targets);
  }
  if (target?.alive) return [target];
  return [];
};

const EMPTY_TOKENS: UnitToken[] = [];

const resolveRandomValue = (ctx: Pick<NormalizedContext, 'game'>): number => (
  ctx.game?.rng ? nextRngValue(ctx.game.rng) : Math.random()
);

const sampleTargets = (
  ctx: Pick<NormalizedContext, 'game'>,
  tokens: ReadonlyArray<UnitToken>,
  limit: number,
  allowDuplicates: boolean,
): UnitToken[] => {
  if (limit <= 0 || tokens.length === 0) return [];
  if (allowDuplicates) {
    const sampled: UnitToken[] = [];
    for (let i = 0; i < limit; i += 1) {
      const picked = tokens[Math.floor(resolveRandomValue(ctx) * tokens.length)];
      if (picked) sampled.push(picked);
    }
    return sampled;
  }
  if (tokens.length <= limit) return [...tokens];

  const pool = [...tokens];
  for (let i = 0; i < limit; i += 1) {
    const swapIndex = i + Math.floor(resolveRandomValue(ctx) * (pool.length - i));
    [pool[i], pool[swapIndex]] = [pool[swapIndex], pool[i]];
  }
  return pool.slice(0, limit);
};

const readTargetLimit = (ctx: Pick<NormalizedContext, 'payload'>, fallback: number): number => (
  Math.max(1, toRoundedInt(ctx.payload?.targetCount ?? ctx.payload?.targets, fallback))
);

const readAllowDuplicateTargets = (ctx: Pick<NormalizedContext, 'payload'>): boolean => (
  ctx.payload?.allowDuplicateTargets === true
  || ctx.payload?.allowDuplicates === true
);

const sampleFromCandidates = (ctx: Pick<NormalizedContext, 'payload' | 'game'>, candidates: ReadonlyArray<UnitToken>, limit: number): UnitToken[] => {
  return sampleTargets(ctx, candidates, limit, readAllowDuplicateTargets(ctx));
};

type TargetPriority = 'board' | 'leader-first' | 'lowest-hp' | 'highest-hp' | 'lowest-hp-ratio' | 'highest-hp-ratio';
type TargetRole = 'any' | 'leader';

const readTargetPriority = (payload: Record<string, unknown> | null): TargetPriority => {
  const raw = String(payload?.targetPriority ?? payload?.priority ?? '').trim().toLowerCase();
  if (raw === 'leader-first' || raw === 'leader_first' || raw === 'leader') return 'leader-first';
  if (raw === 'lowest-hp' || raw === 'lowest_hp' || raw === 'hp-asc') return 'lowest-hp';
  if (raw === 'highest-hp' || raw === 'highest_hp' || raw === 'hp-desc') return 'highest-hp';
  if (raw === 'lowest-hp-ratio' || raw === 'lowest_hp_ratio' || raw === 'lowest-hp-percent') return 'lowest-hp-ratio';
  if (raw === 'highest-hp-ratio' || raw === 'highest_hp_ratio' || raw === 'highest-hp-percent') return 'highest-hp-ratio';
  return 'board';
};

const readTargetRole = (payload: Record<string, unknown> | null): TargetRole => {
  const raw = String(payload?.targetRole ?? '').trim().toLowerCase();
  if (raw === 'leader') return 'leader';
  return 'any';
};

const isLeaderToken = (token: UnitToken): boolean => {
  if (!Number.isFinite(token.cx) || !Number.isFinite(token.cy) || !token.side) return false;
  return slotIndex(token.side, token.cx, token.cy) === 8;
};

const filterTokensByRole = (ctx: Pick<NormalizedContext, 'targetRole'>, tokens: ReadonlyArray<UnitToken>): ReadonlyArray<UnitToken> => {
  if (ctx.targetRole !== 'leader') return tokens;
  const leaders: UnitToken[] = [];
  for (const token of tokens) {
    if (isLeaderToken(token)) leaders.push(token);
  }
  return leaders;
};

const pickSingleByMetric = (
  tokens: ReadonlyArray<UnitToken>,
  metric: (token: UnitToken) => number,
  findLowest: boolean,
): UnitToken[] => {
  if (tokens.length === 0) return [];
  let best = tokens[0];
  let bestValue = metric(best);
  for (let i = 1; i < tokens.length; i += 1) {
    const candidate = tokens[i];
    const candidateValue = metric(candidate);
    if ((findLowest && candidateValue < bestValue) || (!findLowest && candidateValue > bestValue)) {
      best = candidate;
      bestValue = candidateValue;
    }
  }
  return [best];
};

const insertMetricSorted = (
  entries: Array<{ token: UnitToken; metric: number }>,
  candidate: { token: UnitToken; metric: number },
  findLowest: boolean,
): void => {
  let inserted = false;
  for (let i = 0; i < entries.length; i += 1) {
    const existing = entries[i];
    if (!existing) continue;
    const shouldInsertBefore = findLowest
      ? candidate.metric < existing.metric
      : candidate.metric > existing.metric;
    if (!shouldInsertBefore) continue;
    entries.splice(i, 0, candidate);
    inserted = true;
    break;
  }
  if (!inserted) entries.push(candidate);
};

const pickTopByMetric = (
  tokens: ReadonlyArray<UnitToken>,
  limit: number,
  metricReader: (token: UnitToken) => number,
  findLowest: boolean,
): UnitToken[] => {
  if (limit <= 0 || tokens.length === 0) return [];
  if (limit >= tokens.length) {
    const cloned = [...tokens];
    cloned.sort((a, b) => {
      const aMetric = metricReader(a);
      const bMetric = metricReader(b);
      return findLowest ? aMetric - bMetric : bMetric - aMetric;
    });
    return cloned;
  }

  const selected: Array<{ token: UnitToken; metric: number }> = [];
  for (const token of tokens) {
    const metric = metricReader(token);
    if (selected.length < limit) {
      insertMetricSorted(selected, { token, metric }, findLowest);
      continue;
    }
    const tail = selected[selected.length - 1];
    if (!tail) continue;
    const shouldReplaceTail = findLowest ? metric < tail.metric : metric > tail.metric;
    if (!shouldReplaceTail) continue;
    selected.pop();
    insertMetricSorted(selected, { token, metric }, findLowest);
  }

  return selected.map((entry) => entry.token);
};

const readHpRatio = (unit: UnitToken): number => {
  const hpMax = Math.max(1, toFiniteNumber(unit.hpMax, 1));
  const hp = Math.max(0, toFiniteNumber(unit.hp, 0));
  return hp / hpMax;
};

const findLeaderToken = (tokens: ReadonlyArray<UnitToken>): UnitToken | null => {
  for (const token of tokens) {
    if (isLeaderToken(token)) return token;
  }
  return null;
};

const pickTargetsByPriority = (
  ctx: Pick<NormalizedContext, 'targetPriority'>,
  tokens: ReadonlyArray<UnitToken>,
  limit: number,
): UnitToken[] => {
  if (tokens.length <= 1 || limit <= 0) return tokens.slice(0, Math.max(0, limit));
  const priority = ctx.targetPriority;
  if (priority === 'board') return tokens.slice(0, limit);
  if (limit === 1) {
    if (priority === 'leader-first') {
      for (const token of tokens) {
        if (isLeaderToken(token)) return [token];
      }
      return [tokens[0]];
    }
    const useRatioMetric = priority === 'lowest-hp-ratio' || priority === 'highest-hp-ratio';
    const findLowest = priority === 'lowest-hp' || priority === 'lowest-hp-ratio';
    return pickSingleByMetric(
      tokens,
      (token) => (useRatioMetric ? readHpRatio(token) : toFiniteNumber(token.hp, 0)),
      findLowest,
    );
  }
  if (priority === 'leader-first') {
    const leaders: UnitToken[] = [];
    const nonLeaders: UnitToken[] = [];
    for (const token of tokens) {
      if (isLeaderToken(token)) leaders.push(token);
      else nonLeaders.push(token);
    }
    return [...leaders, ...nonLeaders].slice(0, limit);
  }
  const useRatioMetric = priority === 'lowest-hp-ratio' || priority === 'highest-hp-ratio';
  const findLowest = priority === 'lowest-hp' || priority === 'lowest-hp-ratio';
  return pickTopByMetric(
    tokens,
    limit,
    (token) => (useRatioMetric ? readHpRatio(token) : toFiniteNumber(token.hp, 0)),
    findLowest,
  );
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

const readEffectAmount = (
  payload: Record<string, unknown> | null,
  primaryKey: string,
  fallbackKey: string,
): number => Math.max(0, toRoundedInt(payload?.[primaryKey] ?? payload?.[fallbackKey], 0));

const readOverhealShieldRatio = (payload: Record<string, unknown> | null): number => {
  const explicit = toFiniteNumber(
    payload?.overhealToShieldRatio
      ?? payload?.overflowToShieldRatio
      ?? payload?.overflowShieldRatio,
    NaN,
  );
  if (Number.isFinite(explicit)) return Math.max(0, explicit);
  return payload?.overflowAsShield === true ? 1 : 0;
};

const resolveEffectTargets = (ctx: NormalizedContext, result: TagDispatchResult): UnitToken[] => (
  result.targets.length > 0 ? result.targets : (ctx.attacker ? [ctx.attacker] : EMPTY_TOKENS)
);

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

const assignTargetsIfEmpty = (result: TagDispatchResult, nextTargets: UnitToken[]): void => {
  if (result.targets.length > 0 || nextTargets.length === 0) return;
  result.targets = nextTargets;
};

const assignSliceTargetsIfEmpty = (
  ctx: Pick<NormalizedContext, 'targetPriority' | 'targetRole'>,
  result: TagDispatchResult,
  source: ReadonlyArray<UnitToken>,
  limit: number,
): void => {
  const filtered = filterTokensByRole(ctx, source);
  assignTargetsIfEmpty(result, pickTargetsByPriority(ctx, filtered, limit));
};

const applyDamageLikeEffect = (
  ctx: NormalizedContext,
  result: TagDispatchResult,
  amount: number,
): void => {
  if (amount <= 0) return;
  for (const token of result.targets) {
    if (ctx.game && ctx.attacker) {
      dealAbilityDamage(ctx.game, ctx.attacker, token, { base: amount, attackType: 'skill' });
    } else {
      applyDamage(token, amount);
    }
  }
  if (result.targets.length > 0) result.sideEffects.push(`hp-change:${amount}`);
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
    if (!ctx.side || amount <= 0) return;
    const consumed = ctx.onAetherCost(amount, ctx.side);
    if (consumed) result.sideEffects.push(`aether:${ctx.side}:${amount}`);
  },
  'single-target': (ctx, result) => {
    assignTargetsIfEmpty(result, ctx.target?.alive ? [ctx.target] : EMPTY_TOKENS);
  },
  self: (ctx, result) => {
    if (ctx.attacker?.alive) result.targets = [ctx.attacker];
  },
  ally: (ctx, result) => {
    if (!ctx.attacker) return;
    assignSliceTargetsIfEmpty(ctx, result, ctx.attackerTokens, readTargetLimit(ctx, 1));
  },
  enemy: (ctx, result) => {
    if (!ctx.attacker) return;
    assignSliceTargetsIfEmpty(ctx, result, ctx.opponentTokens, readTargetLimit(ctx, 1));
  },
  'leader-target': (ctx, result) => {
    if (!ctx.attacker) return;
    const leader = findLeaderToken(ctx.opponentTokens);
    assignTargetsIfEmpty(result, leader ? [leader] : EMPTY_TOKENS);
  },
  'random-target': (ctx, result) => {
    if (!ctx.attacker) return;
    const candidates = ctx.opponentTokens;
    assignTargetsIfEmpty(result, candidates.length > 0 ? sampleFromCandidates(ctx, candidates, 1) : EMPTY_TOKENS);
  },
  'random-aoe': (ctx, result) => {
    if (!ctx.attacker) return;
    const limit = readTargetLimit(ctx, 2);
    result.targets = sampleFromCandidates(ctx, ctx.opponentTokens, limit);
  },
  'multi-target': (ctx, result) => {
    if (!ctx.attacker) return;
    assignSliceTargetsIfEmpty(ctx, result, ctx.opponentTokens, readTargetLimit(ctx, 2));
  },
  aoe: (ctx, result) => {
    if (!ctx.attacker) return;
    result.targets = ctx.opponentTokens;
  },
  'global-rule': (ctx, result) => {
    if (!ctx.game) return;
    result.targets = collectAliveTargets(ctx.game.tokens);
  },
  heal: (ctx, result) => {
    if (ctx.deferEffects) return;
    const amount = readEffectAmount(ctx.payload, 'healAmount', 'heal');
    if (amount <= 0) return;
    const overhealShieldRatio = readOverhealShieldRatio(ctx.payload);
    const overflowShieldTurns = toPositiveTurns(
      toFiniteNumber(ctx.payload?.overflowShieldTurns ?? ctx.payload?.shieldTurns, 2),
      2,
    );
    for (const token of resolveEffectTargets(ctx, result)) {
      const healResult = healUnit(token, amount);
      if (overhealShieldRatio > 0 && healResult.overheal > 0) {
        const shieldAmount = Math.max(0, Math.floor(healResult.overheal * overhealShieldRatio));
        if (shieldAmount > 0) {
          grantShield(token, shieldAmount, { durationTurns: overflowShieldTurns });
          result.sideEffects.push(`overheal-shield:${shieldAmount}`);
        }
      }
    }
    result.sideEffects.push(`heal:${amount}`);
  },
  'team-heal': (ctx, result) => {
    if (ctx.deferEffects) return;
    const amount = readEffectAmount(ctx.payload, 'healAmount', 'heal');
    if (amount <= 0 || !ctx.attacker) return;
    for (const token of ctx.attackerTokens) healUnit(token, amount);
    result.sideEffects.push(`team-heal:${amount}`);
  },
  shield: (ctx, result) => {
    if (ctx.deferEffects) return;
    const amount = readEffectAmount(ctx.payload, 'shieldAmount', 'shield');
    if (amount <= 0) return;
    for (const token of resolveEffectTargets(ctx, result)) grantShield(token, amount);
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
  taunt: (ctx, result) => {
    applyTaggedStatus(ctx, result, 'taunt', 'tauntTurns', 'turns', 'duration');
  },
  summon: (ctx, result) => {
    if (ctx.deferEffects) return;
    ctx.onSummon();
    result.sideEffects.push('summon');
  },
  'non-heal-hp-change': (ctx, result) => {
    if (ctx.deferEffects) return;
    const amount = readEffectAmount(ctx.payload, 'hpDelta', 'damage');
    applyDamageLikeEffect(ctx, result, amount);
  },
});

export function dispatchGameplayTags(
  rawTags: ReadonlyArray<string> | null | undefined,
  context: TagDispatchContext,
): TagDispatchResult {
  const normalizedTags = context.tagsNormalized
    ? (Array.isArray(rawTags) ? rawTags : EMPTY_TAGS)
    : normalizeTagList(rawTags);
  const tags: string[] = [];
  const deferredRuleTags: string[] = [];
  for (const rawTag of normalizedTags) {
    const tag = resolveDispatchTag(rawTag);
    if (RULE_TARGET_OVERRIDE_TAGS.has(tag)) deferredRuleTags.push(tag);
    else tags.push(tag);
  }
  if (deferredRuleTags.length > 0) tags.push(...deferredRuleTags);
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
    targetPriority: readTargetPriority(context.payload ?? null),
    targetRole: readTargetRole(context.payload ?? null),
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

export interface MarkStackPayload extends Record<string, unknown> {
  markId?: string;
  markStacks?: number;
  markMaxStacks?: number;
  markPurgeable?: boolean;
  sleepTurnsOnCap?: number;
}

export function applyMarkSleepSetupTag(
  game: SessionState,
  attacker: UnitToken,
  target: UnitToken,
  payload: MarkStackPayload,
): void {
  dispatchGameplayTags(MARK_APPLICATION_TAGS, {
    game,
    attacker,
    target,
    targets: [target],
    side: attacker.side,
    payload,
    deferEffects: false,
    tagsNormalized: true,
  });
}
