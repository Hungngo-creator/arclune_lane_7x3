//home (termux)/arclune_lane_7x3/src/ai.ts
import { pickRandom, slotToCell, cellReserved } from './engine.ts';
import { CFG } from './config.ts';
import { safeNow } from './utils/time.ts';
import { detectUltBehavior, getSummonSpec, resolveSummonSlots } from './utils/kit.ts';
import { lookupUnit } from './units.ts';
import { globalAetherPool } from './aether.ts';
import { isUyenLeader, isAnyLeaderUltReady } from './leader-uyen.ts';
import { predictSpawnCycleByTurnOrder } from './turns/interleaved.ts';

import type { AiCard, AiCardDeck, AiDeckEntry, AiDeckPool, SessionState } from '@shared-types/combat';
import type { RosterUnitDefinition } from '@shared-types/config';
import type { GambitActionType, GambitConditionType, RuntimeGambitSlot, RuntimeUnitProgress } from '@shared-types/pve';
import { createSummonQueue } from '@shared-types/units.ts';
import type { SummonQueue, UnitId, UnitToken } from '@shared-types/units';

type CandidateCell = { s: number; cx: number; cy: number };
type WeightKey =
  | 'pressure'
  | 'safety'
  | 'eta'
  | 'summon'
  | 'kitInstant'
  | 'kitDefense'
  | 'kitRevive';

type DeckState = AiCardDeck;
export type AI_REASON = 'cost' | 'board' | (string & {});

type CandidateContributions = Record<WeightKey, number>;

type CandidateMultipliers = {
  row: number;
  role: number;
};

type AllyRowPressure = Map<number, { total: number; nearByCol: Map<number, number> }>;

type CandidateMeta = RosterUnitDefinition | null | undefined;
type ResolvedSummonSpec = ReturnType<typeof getSummonSpec>;

interface DeckEntryCandidate {
  id?: unknown;
  cost?: unknown;
  name?: unknown;
  class?: unknown;
  rank?: unknown;
  kit?: unknown;
  [key: string]: unknown;
}

function toMetaEntry(value: unknown): RosterUnitDefinition | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as DeckEntryCandidate;
  if (typeof candidate.id !== 'string') return null;
  if (typeof candidate.class !== 'string') return null;
  if (typeof candidate.rank !== 'string') return null;
  if (!candidate.kit || typeof candidate.kit !== 'object') return null;
  return candidate as RosterUnitDefinition;
}

interface CandidateEvaluation {
  card: AiCard;
  meta: CandidateMeta;
  summonSpec: ResolvedSummonSpec;
  cell: CandidateCell;
  score: number;
  baseScore: number;
  contributions: CandidateContributions;
  raw: CandidateContributions;
  multipliers: CandidateMultipliers;
  blockedReason?: string | null;
  summonPatternSlots?: readonly number[] | null;
}

interface CandidateDebug {
  cardId?: UnitId;
  cardName?: string | null;
  cost?: number;
  slot?: number;
  cx?: number;
  cy?: number;
  score?: number;
  baseScore?: number;
  contributions?: CandidateContributions;
  raw?: CandidateContributions;
  multipliers?: CandidateMultipliers;
  blocked?: string | null;
}

interface KitTraitSummary {
  hasInstant: boolean;
  hasDefBuff: boolean;
  hasRevive: boolean;
}

interface AiDecision extends Record<string, unknown> {
  reason: AI_REASON;
  at: number;
  weights: Record<string, number>;
  chosen: CandidateDebug | null;
  considered: CandidateDebug[];
  skipped: string | null;
}

const DEFAULT_WEIGHTS = Object.freeze({
  pressure: 0.42,
  safety: 0.2,
  eta: 0.16,
  summon: 0.08,
  kitInstant: 0.06,
  kitDefense: 0.04,
  kitRevive: 0.04,
} satisfies Record<WeightKey, number>);

const DEFAULT_DEBUG_KEEP = 6;

const tokensAlive = (Game: SessionState): ReadonlyArray<UnitToken> => Game.tokens.filter((t) => t.alive);

const makeCellKey = (cx: number, cy: number): string => `${cx}:${cy}`;

function collectReservedCellKeys(
  aliveTokens: readonly UnitToken[],
  queued: SessionState['queued'] | null | undefined,
): Set<string> {
  const reserved = new Set<string>();
  for (const token of aliveTokens) {
    reserved.add(makeCellKey(token.cx, token.cy));
  }
  if (!queued) return reserved;

  const appendQueued = (queue: SessionState['queued']['ally'] | SessionState['queued']['enemy']): void => {
    if (!queue || typeof queue.values !== 'function') return;
    for (const request of queue.values()) {
      if (!request) continue;
      reserved.add(makeCellKey(request.cx, request.cy));
    }
  };

  appendQueued(queued.ally);
  appendQueued(queued.enemy);
  return reserved;
}

function partitionAliveTokensBySide(
  Game: SessionState,
  aliveTokens: readonly UnitToken[] | null = null,
): { alive: readonly UnitToken[]; allies: UnitToken[]; enemies: UnitToken[] } {
  const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
  const allies: UnitToken[] = [];
  const enemies: UnitToken[] = [];
  for (const token of alive) {
    if (token.side === 'ally') {
      allies.push(token);
    } else if (token.side === 'enemy') {
      enemies.push(token);
    }
  }
  return { alive, allies, enemies };
}

function mergedWeights(): Record<string, number> {
  const cfg = CFG.AI?.WEIGHTS ?? {};
  const out: Record<string, number> = { ...DEFAULT_WEIGHTS };
  for (const [key, val] of Object.entries(cfg)) {
    if (typeof val === 'number' && Number.isFinite(val)) out[key] = val;
  }
  return out;
}

function debugConfig(): { keepTop: number } {
  const cfg = CFG.AI?.DEBUG ?? {};
  const keepTopRaw = cfg.keepTop ?? cfg.KEEP_TOP ?? DEFAULT_DEBUG_KEEP;
  const keepTopNum = Number(keepTopRaw);
  return {
    keepTop: Math.max(0, Math.floor(Number.isFinite(keepTopNum) ? keepTopNum : DEFAULT_DEBUG_KEEP)),
  };
}

function detectKitTraits(meta: CandidateMeta): KitTraitSummary {
  const kitSource = meta?.kit ?? meta ?? {};
  const analysis = detectUltBehavior(kitSource);
  const hasInstant = Boolean(analysis.hasInstant) || (meta?.class === 'Summoner' && Boolean(analysis.summon));
  return {
    hasInstant,
    hasDefBuff: Boolean(analysis.hasDefensive),
    hasRevive: Boolean(analysis.hasRevive),
  };
}

function exportCandidateDebug(entry: CandidateEvaluation | null | undefined): CandidateDebug | null {
  if (!entry) return null;
  return {
    cardId: entry.card?.id,
    cardName: entry.card?.name ?? null,
    cost: entry.card?.cost,
    slot: entry.cell?.s,
    cx: entry.cell?.cx,
    cy: entry.cell?.cy,
    score: entry.score,
    baseScore: entry.baseScore,
    contributions: entry.contributions,
    raw: entry.raw,
    multipliers: entry.multipliers,
    blocked: entry.blockedReason ?? null,
  };
}

function isAiCard(value: unknown): value is AiCard {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as AiCard;
  return typeof candidate.id === 'string' && candidate.id !== '' && typeof candidate.cost === 'number' && Number.isFinite(candidate.cost);
}

function normalizeDeckEntry(entry: AiDeckEntry): AiCard | null {
  if (typeof entry === 'string') {
    const def = lookupUnit(entry);
    return def ? { ...def } : null;
  }
  if (isAiCard(entry)) {
    const card: AiCard = { ...entry };
    return card;
  }
  if (entry && typeof entry === 'object') {
    const candidate = entry;
    const idRaw = typeof candidate.id === 'string' ? candidate.id : null;
    if (!idRaw || idRaw.trim() === '') return null;
    const def = lookupUnit(idRaw);
    const fallbackCost = def?.cost;
    const candidateCost = 'cost' in candidate ? candidate.cost : undefined;
    const cost =
      typeof candidateCost === 'number' && Number.isFinite(candidateCost)
        ? candidateCost
        : typeof fallbackCost === 'number' && Number.isFinite(fallbackCost)
          ? fallbackCost
          : null;
    if (cost === null) return null;
    const candidateName = 'name' in candidate ? candidate.name : undefined;
    const name =
      typeof candidateName === 'string' && candidateName.trim() !== ''
        ? candidateName
        : def?.name ?? null;
    const card: AiCard = {
      ...(def ?? { id: idRaw, cost }),
      id: idRaw,
      cost,
    };
    if (name != null) {
      card.name = name;
    }
    Object.assign(card, candidate);
    card.id = idRaw;
    card.cost = cost;
    if (name != null) {
      card.name = name;
    }
    return card;
  }
  return null;
}

function getDeck(Game: SessionState): DeckState {
  const source: AiDeckPool = Game.ai.deck;
  const normalized: DeckState = [];
  for (const entry of source) {
    const card = normalizeDeckEntry(entry);
    if (card) {
      normalized.push(card);
    }
  }
  Game.ai.deck = normalized;
  return normalized;
}

function listEmptyEnemySlots(Game: SessionState, aliveTokens: readonly UnitToken[] | null = null): CandidateCell[] {
  const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
  const reserved = collectReservedCellKeys(alive, Game.queued);
  const out: CandidateCell[] = [];
  for (let s = 1; s <= 9; s += 1) {
    const { cx, cy } = slotToCell('enemy', s);
    if (!reserved.has(makeCellKey(cx, cy))) out.push({ s, cx, cy });
  }
  return out;
}

function etaScoreEnemy(Game: SessionState, slot: number): number {
  return predictSpawnCycleByTurnOrder(Game, 'enemy', slot) === (Game.turn?.cycle ?? 0) ? 1 : 0.5;
}

function pressureScore(cx: number, cy: number): number {
  const dist = Math.abs(cx - 0) + Math.abs(cy - 1);
  return 1 - Math.min(1, dist / 7);
}

function buildAllyRowPressure(allyTokens: readonly UnitToken[]): AllyRowPressure {
  const rows: AllyRowPressure = new Map();
  for (const token of allyTokens) {
    const row = token.cy;
    const col = token.cx;
    let info = rows.get(row);
    if (!info) {
      info = { total: 0, nearByCol: new Map<number, number>() };
      rows.set(row, info);
    }
    info.total += 1;
    for (let delta = -1; delta <= 1; delta += 1) {
      const key = col - delta;
      info.nearByCol.set(key, (info.nearByCol.get(key) ?? 0) + 1);
    }
  }
  return rows;
}

function safetyScoreFast(cx: number, cy: number, allyPressure: AllyRowPressure): number {
  const info = allyPressure.get(cy);
  if (!info) return 1;
  const near = info.nearByCol.get(cx) ?? 0;
  const far = info.total - near;
  return Math.max(0, Math.min(1, 1 - ((near * 0.6 + far * 0.2) / 3)));
}

function summonerFeasibility(
  Game: SessionState,
  meta: CandidateMeta,
  summonSpec: ResolvedSummonSpec,
  baseSlot: number,
  aliveTokens: readonly UnitToken[] | null = null,
): number {
  if (!meta || meta.class !== 'Summoner') return 1;
  if (!summonSpec) return 1;
  const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
  const candidateSlots = resolveSummonSlots(summonSpec, baseSlot).filter((slot) => {
    const { cx, cy } = slotToCell('enemy', slot);
    return !cellReserved(alive, Game.queued, cx, cy);
  });
  const countRaw = summonSpec.count;
  const need = Math.max(1, typeof countRaw === 'number' && Number.isFinite(countRaw) ? countRaw : 1);
  return Math.min(1, candidateSlots.length / need);
}

function candidateBlocked(
  Game: SessionState,
  entry: CandidateEvaluation | null | undefined,
  aliveTokens: readonly UnitToken[] | null = null,
): string | null {
  if (!entry) return 'invalid';
  const alive = aliveTokens ?? tokensAlive(Game);
  const slot = entry.cell?.s;
  const cx = entry.cell?.cx;
  const cy = entry.cell?.cy;
  if (!Number.isFinite(slot) || !Number.isFinite(cx) || !Number.isFinite(cy)) return 'invalid';
  const enemyQueue = Game.queued.enemy;
  if (enemyQueue.has(slot)) return 'slotQueued';
  if (cellReserved(alive, Game.queued, cx, cy)) return 'cellReserved';

  const meta = entry.meta;
  if (meta && meta.class === 'Summoner' && entry.summonSpec) {
    const patternSlots = entry.summonPatternSlots ?? resolveSummonSlots(entry.summonSpec, slot);
    if (patternSlots.length) {
      let available = 0;
      for (const s of patternSlots) {
        const { cx: scx, cy: scy } = slotToCell('enemy', s);
        if (!cellReserved(alive, Game.queued, scx, scy)) available += 1;
      }
      const countRaw = Number(entry.summonSpec.count);
      const need = Math.min(
        patternSlots.length,
        Math.max(1, Number.isFinite(countRaw) ? countRaw : 1),
      );
      if (available < need) return 'summonBlocked';
    }
  }
  return null;
}

function buildEnemyRowCrowding(Game: SessionState, enemyTokens: readonly UnitToken[]): Map<number, number> {
  const rowCounts = new Map<number, number>();
  for (const token of enemyTokens) {
    rowCounts.set(token.cy, (rowCounts.get(token.cy) ?? 0) + 1);
  }
  for (const request of Game.queued.enemy.values()) {
    if (request && Number.isFinite(request.cy)) {
      rowCounts.set(request.cy, (rowCounts.get(request.cy) ?? 0) + 1);
    }
  }
  const factorByRow = new Map<number, number>();
  for (const [row, count] of rowCounts.entries()) {
    if (count >= 3) factorByRow.set(row, 0.7);
    else if (count === 2) factorByRow.set(row, CFG.AI?.ROW_CROWDING_PENALTY ?? 0.85);
    else factorByRow.set(row, 1);
  }
  return factorByRow;
}

function roleBias(className: unknown, cx: number): number {
  const front = cx <= CFG.GRID_COLS - CFG.ENEMY_COLS;
  const roleCfg = CFG.AI?.ROLE?.[typeof className === 'string' ? className : ''] ?? {};
  let factor = 1;
  if (front && typeof roleCfg.front === 'number') factor *= 1 + roleCfg.front;
  if (!front && typeof roleCfg.back === 'number') factor *= 1 + roleCfg.back;
  return factor;
}

function ensureUsedUnitIds(Game: SessionState): Set<UnitId> {
  if (Game.ai.usedUnitIds instanceof Set) return Game.ai.usedUnitIds;
  Game.ai.usedUnitIds = new Set<UnitId>();
  return Game.ai.usedUnitIds;
}

function isSummonQueue(value: unknown): value is SummonQueue {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { set?: unknown; get?: unknown; clear?: unknown };
  return (
    typeof candidate.set === 'function' &&
    typeof candidate.get === 'function' &&
    typeof candidate.clear === 'function'
  );
}

function ensureEnemyQueue(Game: SessionState): SummonQueue {
  const candidate: unknown = Game.queued.enemy;
  if (isSummonQueue(candidate)) {
    return candidate;
  }
  const created = createSummonQueue();
  Game.queued.enemy = created;
  return created;
}

export function refillDeckEnemy(Game: SessionState): void {
  const deck = getDeck(Game);
  const handSize = CFG.HAND_SIZE ?? 4;
  const need = handSize - deck.length;
  if (need <= 0) return;

  const exclude = new Set<string>();
  const usedIds = ensureUsedUnitIds(Game);
  for (const id of usedIds) exclude.add(String(id));
  for (const card of deck) exclude.add(String(card.id));

  const pool: ReadonlyArray<AiDeckEntry> = Game.ai.unitsAll;
  const more = pickRandom(pool, exclude, handSize).slice(0, need);
  const normalized: DeckState = [];
  for (const entry of more) {
    const card = normalizeDeckEntry(entry);
    if (card) normalized.push(card);
  }
  if (!normalized.length) return;
  deck.push(...normalized);
}

export function queueEnemyAt(
  Game: SessionState,
  card: AiCard,
  slot: number,
  cx: number,
  cy: number,
  aliveTokens: readonly UnitToken[] | null = null,
): boolean {
  const cost = Number.isFinite(card.cost) ? card.cost : NaN;
  if (!Number.isFinite(cost) || Game.ai.cost < cost) return false;
  if (Game.ai.summoned >= Game.ai.summonLimit) return false;
  const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
  if (cellReserved(alive, Game.queued, cx, cy)) return false;
  const queue = ensureEnemyQueue(Game);
  if (queue.has(slot)) return false;

  const spawnCycle = predictSpawnCycleByTurnOrder(Game, 'enemy', slot);
  const mutationBonusPct = Number.isFinite(card.mutationBonusPct)
    ? Number(card.mutationBonusPct)
    : undefined;
  const mutationDebuffPool = Array.isArray(card.mutationDebuffPool)
    ? card.mutationDebuffPool.filter((id) => id === 'bleed' || id === 'stun' || id === 'poison')
    : undefined;
  const statOverrides = card.statOverrides && typeof card.statOverrides === 'object' && !Array.isArray(card.statOverrides)
    ? { ...card.statOverrides }
    : undefined;

  queue.set(slot, {
    unitId: card.id,
    name: typeof card.name === 'string' ? card.name : undefined,
    side: 'enemy',
    cx,
    cy,
    slot,
    spawnCycle,
    color: '#ed9dad',
    class: typeof card.class === 'string' && card.class.trim() ? card.class : undefined,
    source: 'deck',
    mutationBonusPct,
    mutationDebuffPool,
    statOverrides,
  });

  Game.ai.cost = Math.max(0, Game.ai.cost - cost);
  Game.ai.summoned += 1;
  ensureUsedUnitIds(Game).add(card.id);

  const deck = getDeck(Game);
  const index = deck.findIndex((entry) => entry.id === card.id);
  if (index >= 0) deck.splice(index, 1);
  refillDeckEnemy(Game);
  return true;
}

export function aiMaybeAct(Game: SessionState, reason: AI_REASON): void {
  const now = safeNow();
  const cfgInterval = Number(CFG.AI?.THINK_INTERVAL_MS);
  const minThinkInterval = Number.isFinite(cfgInterval)
    ? Math.max(60, Math.floor(cfgInterval))
    : (reason === 'board' ? 220 : 140);
  if (now - (Game.ai.lastThinkMs || 0) < minThinkInterval) return;
  const weights = mergedWeights();
  const dbgCfg = debugConfig();

  const deck = getDeck(Game);
  const hand = deck.filter((c) => Number.isFinite(c.cost) && Game.ai.cost >= c.cost);
  if (!hand.length) {
    const decision: AiDecision = {
      reason,
      at: now,
      weights,
      chosen: null,
      considered: [],
      skipped: 'noPlayableCard',
    };
    Game.ai.lastDecision = decision;
    Game.ai.lastThinkMs = now;
    return;
  }

  const { alive, allies: aliveAllies, enemies: aliveEnemies } = partitionAliveTokensBySide(Game);
  const allyPressure = buildAllyRowPressure(aliveAllies);
  const rowFactorByCy = buildEnemyRowCrowding(Game, aliveEnemies);

  const cells = listEmptyEnemySlots(Game, alive);
  if (!cells.length) {
    const decision: AiDecision = {
      reason,
      at: now,
      weights,
      chosen: null,
      considered: [],
      skipped: 'noOpenSlot',
    };
    Game.ai.lastDecision = decision;
    Game.ai.lastThinkMs = now;
    return;
  }

  const keepTop = dbgCfg.keepTop;
  const trackTopCandidates = keepTop > 0;
  const topCandidates: CandidateEvaluation[] = [];
  let bestCandidate: CandidateEvaluation | null = null;
  const etaBySlot = new Map<number, number>();
  const cellBaseScoreBySlot = new Map<number, { pressure: number; safety: number; eta: number; rowFactor: number }>();
  const summonerFeasibilityByCardSlot = new Map<string, number>();
  const summonPatternSlotsByCardSlot = new Map<string, readonly number[]>();
  const summonSpecByCard = new Map<string, ResolvedSummonSpec>();
  const roleFactorByClassAndX = new Map<string, number>();

  const insertTopCandidate = trackTopCandidates
    ? (entry: CandidateEvaluation): void => {
        let inserted = false;
        for (let i = 0; i < topCandidates.length; i += 1) {
          const current = topCandidates[i];
          if (!current || entry.score > current.score) {
            topCandidates.splice(i, 0, entry);
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          if (topCandidates.length < keepTop) topCandidates.push(entry);
          return;
        }
        if (topCandidates.length > keepTop) topCandidates.length = keepTop;
      }
    : null;
  for (const card of hand) {
    const meta = toMetaEntry(Game.meta.get(card.id));
    const summonSpec = meta?.class === 'Summoner'
      ? (summonSpecByCard.get(card.id) ?? (() => {
          const next = getSummonSpec(meta);
          summonSpecByCard.set(card.id, next);
          return next;
        })())
      : null;
    const kitTraits = detectKitTraits(meta);
    for (const cell of cells) {
      const base = cellBaseScoreBySlot.get(cell.s) ?? (() => {
        const pressure = pressureScore(cell.cx, cell.cy);
        const safety = safetyScoreFast(cell.cx, cell.cy, allyPressure);
        const eta = etaBySlot.get(cell.s) ?? (() => {
          const score = etaScoreEnemy(Game, cell.s);
          etaBySlot.set(cell.s, score);
          return score;
        })();
        const rowFactor = rowFactorByCy.get(cell.cy) ?? 1;
        const next = { pressure, safety, eta, rowFactor };
        cellBaseScoreBySlot.set(cell.s, next);
        return next;
      })();
      const summonKey = `${card.id}:${cell.s}`;
      const sf = summonerFeasibilityByCardSlot.get(summonKey) ?? (() => {
        const summonValue = summonerFeasibility(Game, meta, summonSpec, cell.s, alive);
        summonerFeasibilityByCardSlot.set(summonKey, summonValue);
        return summonValue;
      })();
      const summonPatternSlots = summonSpec
        ? (summonPatternSlotsByCardSlot.get(summonKey) ?? (() => {
            const pattern = resolveSummonSlots(summonSpec, cell.s);
            summonPatternSlotsByCardSlot.set(summonKey, pattern);
            return pattern;
          })())
        : null;

      const kitInstantScore = kitTraits.hasInstant ? base.eta : 0;
      const kitDefenseScore = kitTraits.hasDefBuff ? 1 - base.safety : 0;
      const kitReviveScore = kitTraits.hasRevive ? base.safety : 0;

      const contributions: CandidateContributions = {
        pressure: (weights.pressure ?? 0) * base.pressure,
        safety: (weights.safety ?? 0) * base.safety,
        eta: (weights.eta ?? 0) * base.eta,
        summon: (weights.summon ?? 0) * sf,
        kitInstant: (weights.kitInstant ?? 0) * kitInstantScore,
        kitDefense: (weights.kitDefense ?? 0) * kitDefenseScore,
        kitRevive: (weights.kitRevive ?? 0) * kitReviveScore,
      };

      const baseScore =
        contributions.pressure +
        contributions.safety +
        contributions.eta +
        contributions.summon +
        contributions.kitInstant +
        contributions.kitDefense +
        contributions.kitRevive;
      const roleFactorKey = `${meta?.class ?? ''}:${cell.cx}`;
      const roleFactor = roleFactorByClassAndX.get(roleFactorKey) ?? (() => {
        const next = roleBias(meta?.class, cell.cx);
        roleFactorByClassAndX.set(roleFactorKey, next);
        return next;
      })();
      const finalScore = baseScore * base.rowFactor * roleFactor;

      const evaluation: CandidateEvaluation = {
        card,
        meta,
        summonSpec,
        cell,
        score: finalScore,
        baseScore,
        contributions,
        raw: {
          pressure: base.pressure,
          safety: base.safety,
          eta: base.eta,
          summon: sf,
          kitInstant: kitInstantScore,
          kitDefense: kitDefenseScore,
          kitRevive: kitReviveScore,
        },
        multipliers: { row: base.rowFactor, role: roleFactor },
        summonPatternSlots,
      };

      const blocked = candidateBlocked(Game, evaluation, alive);
      if (blocked) {
        evaluation.blockedReason = blocked;
      } else if (!bestCandidate || evaluation.score > bestCandidate.score) {
        bestCandidate = evaluation;
      }

      insertTopCandidate?.(evaluation);
    }
  }

  if (!bestCandidate) {
    const decision: AiDecision = {
      reason,
      at: now,
      weights,
      chosen: null,
      considered: [],
      skipped: 'allBlocked',
    };
    Game.ai.lastDecision = decision;
    Game.ai.lastThinkMs = now;
    return;
  }

  const selectedCandidate = bestCandidate;
  let chosen: CandidateEvaluation | null = selectedCandidate;
  const ok = queueEnemyAt(
    Game,
    selectedCandidate.card,
    selectedCandidate.cell.s,
    selectedCandidate.cell.cx,
    selectedCandidate.cell.cy,
    alive,
  );
  if (!ok) {
    selectedCandidate.blockedReason = 'queueFailed';
    chosen = null;
  }

  const considered = trackTopCandidates ? topCandidates.map(exportCandidateDebug).filter(Boolean) : [];

  const decision: AiDecision = {
    reason,
    at: now,
    weights,
    chosen: exportCandidateDebug(chosen),
    considered: considered as CandidateDebug[],
    skipped: chosen ? null : 'allBlocked',
  };
  Game.ai.lastDecision = decision;
  Game.ai.lastThinkMs = now;
}
export type GambitDecisionAction = GambitActionType | null;

export interface GambitEvaluation {
  action: GambitDecisionAction;
  slotIndex: number;
  reason: string;
}

function resolveHpRatio(unit: UnitToken | null | undefined): number {
  if (!unit) return 0;
  const hp = Number.isFinite(unit.hp) ? Number(unit.hp) : 0;
  const hpMax = Math.max(1, Number.isFinite(unit.hpMax) ? Number(unit.hpMax) : 1);
  return hp / hpMax;
}

function findLowestHpUnit(units: ReadonlyArray<UnitToken>): UnitToken | null {
  let best: UnitToken | null = null;
  let bestRatio = Number.POSITIVE_INFINITY;
  for (const token of units) {
    if (!token || !token.alive) continue;
    const ratio = resolveHpRatio(token);
    if (ratio < bestRatio) {
      bestRatio = ratio;
      best = token;
    }
  }
  return best;
}

function resolveHpPercent(unit: UnitToken | null | undefined): number {
  return resolveHpRatio(unit) * 100;
}

function evaluateGambitCondition(
  condition: GambitConditionType,
  Game: SessionState,
  unit: UnitToken,
  slot: RuntimeGambitSlot,
  allies: ReadonlyArray<UnitToken>,
  enemies: ReadonlyArray<UnitToken>,
): boolean {
  const threshold = Number.isFinite(slot.threshold) ? Number(slot.threshold) : 0;
  switch (condition) {
    case 'self_hp_below': {
      const hp = Number.isFinite(unit.hp) ? Number(unit.hp) : 0;
      const hpMax = Math.max(1, Number.isFinite(unit.hpMax) ? Number(unit.hpMax) : 1);
      return (hp / hpMax) * 100 < threshold;
    }
    case 'self_has_debuff':
      return Array.isArray(unit.statuses)
        && unit.statuses.some((status: { kind?: string } | null | undefined) => status && status.kind === 'debuff');
    case 'ally_lowest_hp':
      {
      const teammate = findLowestHpUnit(allies.filter((ally) => ally.iid !== unit.iid));
      if (!teammate) return false;
      if (threshold > 0) {
        return resolveHpPercent(teammate) < threshold;
      }
      return true;
    }
    case 'ally_controlled':
      return allies.some((ally) => Array.isArray(ally.statuses)
        && ally.statuses.some((s: { kind?: string; tag?: string } | null | undefined) => s && (String(s.kind).toLowerCase() === 'control' || String(s.tag ?? '').toLowerCase().includes('stun'))));
    case 'pool_aether_above':
      return globalAetherPool.current(unit.side) > threshold;
    case 'enemy_lowest_hp':
      {
      const enemy = findLowestHpUnit(enemies);
      if (!enemy) return false;
      if (threshold > 0) {
        return resolveHpPercent(enemy) < threshold;
      }
      return true;
    }
    case 'enemy_is_boss':
      return enemies.some((enemy) => enemy.id === 'leaderB' || enemy.id === 'boss' || enemy.isBoss === true);
    case 'enemy_role_is': {
      const role = (slot.targetRole ?? '').trim().toLowerCase();
      return enemies.some((enemy) => String(Game.meta?.get(enemy.id)?.class ?? '').toLowerCase() === role);
    }
    case 'enemy_has_shield':
      return enemies.some((enemy) => Number(enemy.shield ?? 0) > 0);
    case 'always':
      return true;
    default:
      return false;
  }
}

export function evaluateGambitLogic(Game: SessionState, unit: UnitToken, options: { startIndex?: number } = {}): GambitEvaluation {
  const unitProgressMap = Game.runtime?.unitProgressById as ReadonlyMap<string, RuntimeUnitProgress> | undefined;
  const profile = unitProgressMap?.get(unit.id);
  const slots: ReadonlyArray<RuntimeGambitSlot> = Array.isArray(profile?.gambit) ? profile.gambit : [];
  const { allies: aliveAllies, enemies: aliveEnemies } = partitionAliveTokensBySide(Game);
  const allies = unit.side === 'ally' ? aliveAllies : aliveEnemies;
  const enemies = unit.side === 'ally' ? aliveEnemies : aliveAllies;

  const startIndex = Math.max(0, Math.floor(options.startIndex ?? 0));
  for (let index = startIndex; index < Math.min(5, slots.length); index += 1) {
    const slot = slots[index];
    if (!slot || slot.enabled === false) continue;
    const conditionOk = evaluateGambitCondition(slot.condition, Game, unit, slot, allies, enemies);

    if (!conditionOk) continue;
    return {
      action: slot.action,
      slotIndex: index,
      reason: 'matched',
    };
  }

  return {
    action: null,
    slotIndex: -1,
    reason: 'noMatch',
  };
}