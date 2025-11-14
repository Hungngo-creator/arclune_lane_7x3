import { pickRandom, slotToCell, cellReserved } from './engine.ts';
import { predictSpawnCycle } from './turns.ts';
import { CFG } from './config.ts';
import { safeNow as sharedSafeNow } from './utils/time.ts';
import { detectUltBehavior, getSummonSpec, resolveSummonSlots } from './utils/kit.ts';
import { lookupUnit } from './units.ts';

import type { AiCard, AiCardDeck, AiDeckEntry, AiDeckPool, SessionState } from '@shared-types/combat';
import type { RosterUnitDefinition } from '@shared-types/config';
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

type CandidateContributions = Record<string, number>;

type CandidateMultipliers = {
  row: number;
  role: number;
};

type CandidateMeta = RosterUnitDefinition | null | undefined;

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
  cell: CandidateCell;
  score: number;
  baseScore: number;
  contributions: CandidateContributions;
  raw: CandidateContributions;
  multipliers: CandidateMultipliers;
  blockedReason?: string | null;
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

const safeNow = (): number => sharedSafeNow();

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

function listEmptyEnemySlots(Game: SessionState, aliveTokens?: readonly UnitToken[] | null): CandidateCell[] {
  const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
  const out: CandidateCell[] = [];
  for (let s = 1; s <= 9; s += 1) {
    const { cx, cy } = slotToCell('enemy', s);
    if (!cellReserved(alive, Game.queued, cx, cy)) out.push({ s, cx, cy });
  }
  return out;
}

function etaScoreEnemy(Game: SessionState, slot: number): number {
  return predictSpawnCycle(Game, 'enemy', slot) === (Game.turn?.cycle ?? 0) ? 1 : 0.5;
}

function pressureScore(cx: number, cy: number): number {
  const dist = Math.abs(cx - 0) + Math.abs(cy - 1);
  return 1 - Math.min(1, dist / 7);
}

function safetyScore(Game: SessionState, cx: number, cy: number, allyTokens?: readonly UnitToken[] | null): number {
  const foesSource = Array.isArray(allyTokens) ? allyTokens : tokensAlive(Game).filter((t) => t.side === 'ally');
  const sameRow = foesSource.filter((t) => t.cy === cy);
  const near = sameRow.filter((t) => Math.abs(t.cx - cx) <= 1).length;
  const far = sameRow.length - near;
  return Math.max(0, Math.min(1, 1 - ((near * 0.6 + far * 0.2) / 3)));
}

function summonerFeasibility(
  Game: SessionState,
  unitId: UnitId,
  baseSlot: number,
  aliveTokens?: readonly UnitToken[] | null,
): number {
  const meta = toMetaEntry(Game.meta.get(unitId));
  if (!meta || meta.class !== 'Summoner') return 1;
  const summonSpec = getSummonSpec(meta);
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
  aliveTokens?: readonly UnitToken[] | null,
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
  if (meta && meta.class === 'Summoner') {
    const summonSpec = getSummonSpec(meta);
    if (summonSpec) {
      const patternSlots = resolveSummonSlots(summonSpec, slot);
      if (patternSlots.length) {
        let available = 0;
        for (const s of patternSlots) {
          const { cx: scx, cy: scy } = slotToCell('enemy', s);
          if (!cellReserved(alive, Game.queued, scx, scy)) available += 1;
        }
        const countRaw = Number(summonSpec.count);
        const need = Math.min(
          patternSlots.length,
          Math.max(1, Number.isFinite(countRaw) ? countRaw : 1),
        );
        if (available < need) return 'summonBlocked';
      }
    }
  }
  return null;
}

function rowCrowdingFactor(
  Game: SessionState,
  cy: number,
  enemyTokens?: readonly UnitToken[] | null,
): number {
  const ours = (Array.isArray(enemyTokens) ? enemyTokens : tokensAlive(Game).filter((t) => t.side === 'enemy')).filter(
    (t) => t.cy === cy,
  ).length;
  let queued = 0;
  const queue = Game.queued.enemy;
  for (const request of queue.values()) {
  if (request && request.cy === cy) queued += 1;
  }
  const n = ours + queued;
  if (n >= 3) return 0.7;
  if (n === 2) return CFG.AI?.ROW_CROWDING_PENALTY ?? 0.85;
  return 1;
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
  aliveTokens?: readonly UnitToken[] | null,
): boolean {
  const cost = Number.isFinite(card.cost) ? card.cost : NaN;
  if (!Number.isFinite(cost) || Game.ai.cost < cost) return false;
  if (Game.ai.summoned >= Game.ai.summonLimit) return false;
  const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
  if (cellReserved(alive, Game.queued, cx, cy)) return false;
  const queue = ensureEnemyQueue(Game);
  if (queue.has(slot)) return false;

  const spawnCycle = predictSpawnCycle(Game, 'enemy', slot);

  queue.set(slot, {
    unitId: card.id,
    name: typeof card.name === 'string' ? card.name : undefined,
    side: 'enemy',
    cx,
    cy,
    slot,
    spawnCycle,
    color: '#ed9dad',
    source: 'deck',
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
  if (now - (Game.ai.lastThinkMs || 0) < 120) return;
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

  const alive = tokensAlive(Game);
  const aliveAllies = alive.filter((t) => t.side === 'ally');
  const aliveEnemies = alive.filter((t) => t.side === 'enemy');

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

  const evaluations: CandidateEvaluation[] = [];
  let bestEvaluation: CandidateEvaluation | null = null;
  const keepTop = dbgCfg.keepTop;
  const trackTopCandidates = keepTop > 0;
  const topCandidates: CandidateEvaluation[] = [];

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
    const kitTraits = detectKitTraits(meta);
    for (const cell of cells) {
      const p = pressureScore(cell.cx, cell.cy);
      const s = safetyScore(Game, cell.cx, cell.cy, aliveAllies);
      const e = etaScoreEnemy(Game, cell.s);
      const sf = summonerFeasibility(Game, card.id, cell.s, alive);

      const kitInstantScore = kitTraits.hasInstant ? e : 0;
      const kitDefenseScore = kitTraits.hasDefBuff ? 1 - s : 0;
      const kitReviveScore = kitTraits.hasRevive ? s : 0;

      const contributions: CandidateContributions = {
        pressure: (weights.pressure ?? 0) * p,
        safety: (weights.safety ?? 0) * s,
        eta: (weights.eta ?? 0) * e,
        summon: (weights.summon ?? 0) * sf,
        kitInstant: (weights.kitInstant ?? 0) * kitInstantScore,
        kitDefense: (weights.kitDefense ?? 0) * kitDefenseScore,
        kitRevive: (weights.kitRevive ?? 0) * kitReviveScore,
      };

      const baseScore = Object.values(contributions).reduce((acc, val) => acc + val, 0);
      const rowFactor = rowCrowdingFactor(Game, cell.cy, aliveEnemies);
      const roleFactor = roleBias(meta?.class, cell.cx);
      const finalScore = baseScore * rowFactor * roleFactor;

      const evaluation: CandidateEvaluation = {
        card,
        meta,
        cell,
        score: finalScore,
        baseScore,
        contributions,
        raw: {
          pressure: p,
          safety: s,
          eta: e,
          summon: sf,
          kitInstant: kitInstantScore,
          kitDefense: kitDefenseScore,
          kitRevive: kitReviveScore,
        },
        multipliers: { row: rowFactor, role: roleFactor },
      };

      evaluations.push(evaluation);
      if (!bestEvaluation || evaluation.score > bestEvaluation.score) bestEvaluation = evaluation;
      insertTopCandidate?.(evaluation);
    }
  }

  if (!evaluations.length) {
    const decision: AiDecision = {
      reason,
      at: now,
      weights,
      chosen: null,
      considered: [],
      skipped: 'noEvaluation',
    };
    Game.ai.lastDecision = decision;
    Game.ai.lastThinkMs = now;
    return;
  }

  let chosen: CandidateEvaluation | null = null;
  const findNextCandidate = (): CandidateEvaluation | null => {
    let next: CandidateEvaluation | null = null;
    for (const entry of evaluations) {
      if (entry.blockedReason) continue;
      if (!next || entry.score > next.score) next = entry;
    }
    return next;
  };

  let current = bestEvaluation ?? findNextCandidate();
  while (!chosen && current) {
    const blocked = candidateBlocked(Game, current, alive);
    if (blocked) {
      current.blockedReason = blocked;
    } else {
      const ok = queueEnemyAt(Game, current.card, current.cell.s, current.cell.cx, current.cell.cy, alive);
      if (ok) {
        chosen = current;
        break;
      }
      current.blockedReason = 'queueFailed';
    }
    current = findNextCandidate();
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