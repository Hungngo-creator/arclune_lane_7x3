import { grantShield } from './apply-damage.ts';
import { toFiniteNumber, toPositiveTurns, toRoundedInt } from './number-utils.ts';
import { Statuses } from '../statuses.ts';
import { normalizeTagList } from '../data/tags.ts';
import { dealAbilityDamage, healUnit } from '../combat.ts';
import { createNaturalAction, currentActionExecution, withActionExecution } from './kernel/index.ts';
import { nextRngValue } from '../utils/rng.ts';
import { ensureStatusList, getStatusEntryById } from './status-utils.ts';
import { partitionTokensBySide, sampleTokens } from './token-side-utils.ts';
import {
  canonicalizeCombatTagsWithRule,
  compareRuleConflictUnitPriority,
  compareRuleTagPriority,
} from './tag-aliases.ts';
import {
  createCrossSlotLookup,
  isLeaderToken,
  readBoardPosition,
  selectTargetsByBoardPredicate,
} from './board-position-utils.ts';

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
  tagsCanonical?: boolean;
}

export interface TagDispatchResult {
  tags: string[];
  highestRuleTag: 'doctrine-rule' | 'global-rule' | 'axiom-rule' | null;
  targets: UnitToken[];
  applied: string[];
  sideEffects: string[];
}
const MARK_APPLICATION_TAGS = Object.freeze(['mark', 'sleep-setup'] as const);
const EMPTY_TAGS: string[] = [];
const DOCTRINE_NO_HEAL_STATUS_ID = 'doctrine-no-heal';
const RULE_CONFLICT_CACHE = new WeakMap<SessionState, Map<string, boolean>>();
type NormalizedContext = {
  game: SessionState | null;
  attacker: UnitToken | null;
  target: UnitToken | null;
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

const readTargetLimit = (ctx: Pick<NormalizedContext, 'payload'>, fallback: number): number => (
  Math.max(1, toRoundedInt(ctx.payload?.targetCount ?? ctx.payload?.targets, fallback))
);

const readAllowDuplicateTargets = (ctx: Pick<NormalizedContext, 'payload'>): boolean => (
  ctx.payload?.allowDuplicateTargets === true
  || ctx.payload?.allowDuplicates === true
);

const sampleFromCandidates = (ctx: Pick<NormalizedContext, 'payload' | 'game'>, candidates: ReadonlyArray<UnitToken>, limit: number): UnitToken[] => {
  return sampleTokens(candidates, limit, {
    allowDuplicates: readAllowDuplicateTargets(ctx),
    randomValue: () => (ctx.game?.rng ? nextRngValue(ctx.game.rng) : Math.random()),
  });
};

type TargetPriority = 'board' | 'leader-first' | 'lowest-hp' | 'highest-hp' | 'lowest-hp-ratio' | 'highest-hp-ratio';
type TargetRole = 'any' | 'leader';

const TARGET_PRIORITY_ALIASES: Readonly<Record<string, TargetPriority>> = Object.freeze({
  'leader-first': 'leader-first',
  leader_first: 'leader-first',
  leader: 'leader-first',
  'lowest-hp': 'lowest-hp',
  lowest_hp: 'lowest-hp',
  'hp-asc': 'lowest-hp',
  'highest-hp': 'highest-hp',
  highest_hp: 'highest-hp',
  'hp-desc': 'highest-hp',
  'lowest-hp-ratio': 'lowest-hp-ratio',
  lowest_hp_ratio: 'lowest-hp-ratio',
  'lowest-hp-percent': 'lowest-hp-ratio',
  'highest-hp-ratio': 'highest-hp-ratio',
  highest_hp_ratio: 'highest-hp-ratio',
  'highest-hp-percent': 'highest-hp-ratio',
  'lowest-current-hp': 'lowest-hp',
  low_hp: 'lowest-hp',
  lowhp: 'lowest-hp',
  'thap-mau-nhat': 'lowest-hp',
  'mau-thap-nhat': 'lowest-hp',
  'hp-thap-nhat': 'lowest-hp',
  'thap-hp-nhat': 'lowest-hp',
  'hp-hien-tai-thap-nhat': 'lowest-hp',
  'mau-hien-tai-thap-nhat': 'lowest-hp',
  'thấp-máu-nhất': 'lowest-hp',
  'máu-thấp-nhất': 'lowest-hp',
  'hp-hiện-tại-thấp-nhất': 'lowest-hp',
  'máu-hiện-tại-thấp-nhất': 'lowest-hp',
  'highest-current-hp': 'highest-hp',
  high_hp: 'highest-hp',
  highhp: 'highest-hp',
  'mau-cao-nhat': 'highest-hp',
  'hp-hien-tai-cao-nhat': 'highest-hp',
  'máu-cao-nhất': 'highest-hp',
  'hp-hiện-tại-cao-nhất': 'highest-hp',
});

const normalizePriorityLookupKey = (value: unknown): string => (
  String(value ?? '')
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
);

const readTargetPriority = (payload: Record<string, unknown> | null): TargetPriority => {
  const raw = normalizePriorityLookupKey(payload?.targetPriority ?? payload?.priority);
  return TARGET_PRIORITY_ALIASES[raw] ?? 'board';
};

const readTargetRole = (payload: Record<string, unknown> | null): TargetRole => {
  const raw = normalizePriorityLookupKey(payload?.targetRole);
  if (raw === 'leader' || raw === 'muc-tieu-leader' || raw === 'mục-tiêu-leader') return 'leader';
  return 'any';
};

const resolvePrimaryEnemyTarget = (ctx: NormalizedContext, result: TagDispatchResult): UnitToken | null => {
  for (const token of result.targets) {
    if (token.side !== ctx.attacker?.side) return token;
  }
  if (ctx.target && ctx.target.side !== ctx.attacker?.side) return ctx.target;
  return ctx.opponentTokens[0] ?? null;
};

const selectColumnTargets = (pool: ReadonlyArray<UnitToken>, anchor: UnitToken | null): UnitToken[] => {
  const anchorPos = readBoardPosition(anchor);
  if (!anchorPos) return [];
  return selectTargetsByBoardPredicate(pool, (pos) => pos.col === anchorPos.col);
};

const selectCrossTargets = (pool: ReadonlyArray<UnitToken>, anchor: UnitToken | null): UnitToken[] => {
  const anchorPos = readBoardPosition(anchor);
  if (!anchorPos) return [];
  const crossSlots = createCrossSlotLookup(anchorPos.slot);
  return selectTargetsByBoardPredicate(pool, (pos) => crossSlots.has(pos.slot));
};

const filterTokensByRole = (ctx: Pick<NormalizedContext, 'targetRole'>, tokens: ReadonlyArray<UnitToken>): ReadonlyArray<UnitToken> => {
  if (ctx.targetRole !== 'leader') return tokens;
  const leaders: UnitToken[] = [];
  for (const token of tokens) {
    if (isLeaderToken(token)) leaders.push(token);
  }
  return leaders;
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
      const leader = findLeaderToken(tokens);
      return leader ? [leader] : [tokens[0]];
    }
    const useRatioMetric = priority === 'lowest-hp-ratio' || priority === 'highest-hp-ratio';
    const findLowest = priority === 'lowest-hp' || priority === 'lowest-hp-ratio';
    return pickTopByMetric(
      tokens,
      1,
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

const resolveRuleConflictBlock = (
  attacker: UnitToken | null,
  attackerKitKey: string,
  source: UnitToken | null,
  sourceKitKey: string,
  sourceRuleTag: string,
  attackerRuleTag: string,
  cache: Map<string, boolean> | null,
): boolean => {
  if (!attacker || !source) return true;
  const cacheKey = [
    String(attacker.id),
    attackerKitKey,
    attackerRuleTag,
    String(source.id),
    sourceKitKey,
    sourceRuleTag,
  ].join('::');
  const cached = cache?.get(cacheKey);
  if (typeof cached === 'boolean') return cached;
  const attackerWins = compareRuleConflictUnitPriority(attacker, source) > 0;
  cache?.set(cacheKey, attackerWins);
  return attackerWins;
};

const resolveKitConflictKey = (payload: Record<string, unknown> | null | undefined): string => (
  String(payload?.kitKey ?? payload?.skillKey ?? payload?.sourceSkillKey ?? payload?.abilityKey ?? '__kit__')
);

const getRuleConflictCache = (game: SessionState | null): Map<string, boolean> | null => {
  if (!game) return null;
  const existing = RULE_CONFLICT_CACHE.get(game);
  if (existing) return existing;
  const next = new Map<string, boolean>();
  RULE_CONFLICT_CACHE.set(game, next);
  return next;
};

const canReceiveHealUnderDoctrine = (
  token: UnitToken,
  game: SessionState | null,
  attacker: UnitToken | null,
  highestRuleTag: TagDispatchResult['highestRuleTag'],
  attackerSide: Side | null,
  attackerKitKey: string,
): boolean => {
  if (!Array.isArray(token.statuses) || token.statuses.length === 0) return true;
  const cache = getRuleConflictCache(game);
  for (const status of token.statuses) {
    if (!status || status.id !== DOCTRINE_NO_HEAL_STATUS_ID) continue;
    if (!attackerSide) return false;
    if ((status.sourceSide as Side | undefined) != null && status.sourceSide === attackerSide) continue;
    const sourceRuleTag = status.sourceRuleTag as TagDispatchResult['highestRuleTag'] | undefined;
    const ruleTagComparison = compareRuleTagPriority(highestRuleTag, sourceRuleTag ?? 'doctrine-rule');
    if (ruleTagComparison > 0) continue;
    if (ruleTagComparison < 0) return false;
    const sourceUnitId = status.sourceUnitId;
    const sourceUnit = sourceUnitId && game
      ? game.tokens.find((entry) => entry?.id === sourceUnitId) ?? null
      : null;
    const sourceKitKey = String(status.sourceKitKey ?? status.sourceSkillKey ?? '__kit__');
    if (!resolveRuleConflictBlock(
      attacker,
      attackerKitKey,
      sourceUnit,
      sourceKitKey,
      String(sourceRuleTag ?? 'doctrine-rule'),
      String(highestRuleTag ?? '__none__'),
      cache,
    )) return false;
  }
  return true;
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
  if (!ctx.game || !ctx.attacker) throw new Error('[combat-kernel] damage tag requires Game, attacker, and ActionExecutionContext');
  if (!currentActionExecution(ctx.game)) {
    withActionExecution(ctx.game, createNaturalAction(ctx.game, 'tag-damage'), () => applyDamageLikeEffect(ctx, result, amount));
    return;
  }
  for (const token of result.targets) {
    dealAbilityDamage(ctx.game, ctx.attacker, token, { base: amount, attackType: 'skill' });
  }
  if (result.targets.length > 0) result.sideEffects.push(`hp-change:${amount}`);
};

const applyHealToTokens = (
  game: SessionState | null,
  attacker: UnitToken | null,
  tokens: ReadonlyArray<UnitToken>,
  highestRuleTag: TagDispatchResult['highestRuleTag'],
  amount: number,
  attackerSide: Side | null,
  attackerKitKey: string,
): Array<{ token: UnitToken; overheal: number }> => {
  const healed: Array<{ token: UnitToken; overheal: number }> = [];
  for (const token of tokens) {
    if (!canReceiveHealUnderDoctrine(token, game, attacker, highestRuleTag, attackerSide, attackerKitKey)) continue;
    const healResult = healUnit(token, amount);
    healed.push({ token, overheal: Math.max(0, toFiniteNumber(healResult.overheal, 0)) });
  }
  return healed;
};

const hasAnyHealableToken = (
  game: SessionState | null,
  attacker: UnitToken | null,
  tokens: ReadonlyArray<UnitToken>,
  highestRuleTag: TagDispatchResult['highestRuleTag'],
  attackerSide: Side | null,
  attackerKitKey: string,
): boolean => {
  for (const token of tokens) {
    if (canReceiveHealUnderDoctrine(token, game, attacker, highestRuleTag, attackerSide, attackerKitKey)) return true;
  }
  return false;
};

const applyRuleNoHealStatus = (
  ctx: NormalizedContext,
  result: TagDispatchResult,
): void => {
  if (ctx.deferEffects || !ctx.attacker) return;
  const turns = readTurns(ctx.payload, 'forbidEnemyHealTurns', 'noHealTurns', 'turns', 'duration');
  const shouldForbidEnemyHeal = (
    ctx.payload?.forbidEnemyHeal === true
    || ctx.payload?.forbidHeal === true
    || (turns > 0 && (
      ctx.payload?.forbidEnemyHealTurns != null
      || ctx.payload?.noHealTurns != null
    ))
  );
  if (!shouldForbidEnemyHeal) return;
  const sourceKitKey = resolveKitConflictKey(ctx.payload);
  for (const token of ctx.opponentTokens) {
    Statuses.add(token, {
      id: DOCTRINE_NO_HEAL_STATUS_ID,
      kind: 'debuff',
      tag: 'no-heal',
      dur: turns,
      tick: 'turn',
      sourceUnitId: ctx.attacker.id,
      sourceSide: ctx.attacker.side,
      sourceRuleTag: result.highestRuleTag ?? 'doctrine-rule',
      sourceKitKey,
    });
  }
  result.sideEffects.push(`doctrine-no-heal:${turns}`);
};

const assignAllAliveTargets = (ctx: NormalizedContext, result: TagDispatchResult): boolean => {
  if (!ctx.game) return false;
  result.targets = collectAliveTargets(ctx.game.tokens);
  return true;
};

function applyMarkStackingStatus(ctx: NormalizedContext, result: TagDispatchResult): void {
  if (ctx.deferEffects) return;
  const payload = ctx.payload ?? {};
  const statusId = String(payload.markId ?? 'mark');
  const stacksPerApply = Math.max(1, toRoundedInt(payload.markStacks ?? payload.stacks ?? 1, 1));
  const maxStacks = Math.max(1, toRoundedInt(payload.markMaxStacks ?? payload.maxStacks ?? 3, 3));
  const sleepTurnsOnCap = Math.max(0, toRoundedInt(payload.sleepTurnsOnCap ?? payload.markSleepTurns ?? 0, 0));
  const sleepSetupByTag = result.tags.includes('sleep-setup');
  const nonPurgeableByTag = result.tags.includes('non-purgeable-mark');
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
    if (sleepTurnsOnCap > 0 || sleepSetupByTag) {
      addStatus(target, 'sleep', Math.max(1, sleepTurnsOnCap || 1), ctx.attacker?.id);
      result.sideEffects.push(`sleep:${Math.max(1, sleepTurnsOnCap || 1)}`);
    }
    statuses.splice(existingEntry.index, 1);
    result.sideEffects.push(`mark-cap:${statusId}`);
  }
}

const applyAllAliveRuleTargets: TagHandler = (ctx, result) => {
  assignAllAliveTargets(ctx, result);
};

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
  'column-aoe': (ctx, result) => {
    if (!ctx.attacker) return;
    const anchor = resolvePrimaryEnemyTarget(ctx, result);
    const selected = selectColumnTargets(ctx.opponentTokens, anchor);
    if (selected.length > 0) result.targets = selected;
  },
  'cross-aoe': (ctx, result) => {
    if (!ctx.attacker) return;
    const anchor = resolvePrimaryEnemyTarget(ctx, result);
    const selected = selectCrossTargets(ctx.opponentTokens, anchor);
    if (selected.length > 0) result.targets = selected;
  },
  aoe: (ctx, result) => {
    if (!ctx.attacker) return;
    result.targets = ctx.opponentTokens;
  },
  'axiom-rule': (ctx, result) => {
    applyAllAliveRuleTargets(ctx, result);
    applyRuleNoHealStatus(ctx, result);
  },
  'global-rule': (ctx, result) => {
    applyAllAliveRuleTargets(ctx, result);
    applyRuleNoHealStatus(ctx, result);
  },
  'doctrine-rule': (ctx, result) => {
    if (!assignAllAliveTargets(ctx, result)) return;
    applyRuleNoHealStatus(ctx, result);
  },
  heal: (ctx, result) => {
    const healTargets = resolveEffectTargets(ctx, result);
    const attackerKitKey = resolveKitConflictKey(ctx.payload);
    if (ctx.deferEffects) {
      if (!hasAnyHealableToken(
        ctx.game,
        ctx.attacker,
        healTargets,
        result.highestRuleTag,
        ctx.attacker?.side ?? null,
        attackerKitKey,
      )) {
        result.sideEffects.push('heal-blocked');
      }
      return;
    }
    const amount = readEffectAmount(ctx.payload, 'healAmount', 'heal');
    if (amount <= 0) return;
    const overhealShieldRatio = readOverhealShieldRatio(ctx.payload);
    const overflowShieldTurns = toPositiveTurns(
      toFiniteNumber(ctx.payload?.overflowShieldTurns ?? ctx.payload?.shieldTurns, 2),
      2,
    );
    const healedEntries = applyHealToTokens(
      ctx.game,
      ctx.attacker,
      healTargets,
      result.highestRuleTag,
      amount,
      ctx.attacker?.side ?? null,
      attackerKitKey,
    );
    for (const entry of healedEntries) {
      if (overhealShieldRatio > 0 && entry.overheal > 0) {
        const shieldAmount = Math.max(0, Math.floor(entry.overheal * overhealShieldRatio));
        if (shieldAmount > 0) {
          grantShield(entry.token, shieldAmount, { durationTurns: overflowShieldTurns });
          result.sideEffects.push(`overheal-shield:${shieldAmount}`);
        }
      }
    }
    result.sideEffects.push(`heal:${amount}`);
  },
  'team-heal': (ctx, result) => {
    const attackerKitKey = resolveKitConflictKey(ctx.payload);
    if (ctx.deferEffects) {
      if (!hasAnyHealableToken(
        ctx.game,
        ctx.attacker,
        ctx.attackerTokens,
        result.highestRuleTag,
        ctx.attacker?.side ?? null,
        attackerKitKey,
      )) {
        result.sideEffects.push('heal-blocked');
      }
      return;
    }
    const amount = readEffectAmount(ctx.payload, 'healAmount', 'heal');
    if (amount <= 0 || !ctx.attacker) return;
    applyHealToTokens(
      ctx.game,
      ctx.attacker,
      ctx.attackerTokens,
      result.highestRuleTag,
      amount,
      ctx.attacker.side,
      attackerKitKey,
    );
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
  instant: (_ctx, result) => {
    result.sideEffects.push('instant');
  },
  'non-purgeable-mark': () => {
    // Non-purgeable mark behavior is applied in mark stack resolver.
  },
  passive: () => {
    // Passive is metadata-level tag; runtime behavior is implemented per-unit hooks.
  },
  'mixed-damage': () => {
    // Mixed damage routing is resolved by damage pipeline metadata.
  },
  'vfx-transform': () => {
    // VFX transform is display metadata and does not mutate combat state directly.
  },
  condition: () => {
    // Condition tags are validated at skill execution stage.
  },
  'hp-cost': () => {
    // HP costs are resolved centrally in performActiveSkill payload processing.
  },
});

export function dispatchGameplayTags(
  rawTags: ReadonlyArray<string> | null | undefined,
  context: TagDispatchContext,
): TagDispatchResult {
  const normalizedTags = context.tagsNormalized
    ? (Array.isArray(rawTags) ? rawTags : EMPTY_TAGS)
    : normalizeTagList(rawTags);
  const treatAsCanonical = context.tagsCanonical === true;
  const { tags, highestRuleTag } = canonicalizeCombatTagsWithRule(normalizedTags, treatAsCanonical);
  const target = context.target ?? null;
  const attacker = context.attacker ?? null;
  const { allyTokens, enemyTokens } = context.game && attacker
    ? partitionTokensBySide(context.game.tokens, attacker.side, { sortByBoardPosition: true })
    : { allyTokens: EMPTY_TOKENS, enemyTokens: EMPTY_TOKENS };

  const initialTargets = resolveTargets(context.targets, target);

  const ctx: NormalizedContext = {
    game: context.game ?? null,
    attacker,
    target,
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
    highestRuleTag,
    targets: [...initialTargets],
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
    tagsCanonical: true,
  });
}
