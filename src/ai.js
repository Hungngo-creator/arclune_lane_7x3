// ai.js v0.7.6
import { pickRandom, slotToCell, cellReserved } from './engine.js';
import { CFG } from './config.js';
import { safeNow as sharedSafeNow } from './utils/time.js';
import { detectUltBehavior, getSummonSpec, resolveSummonSlots } from './utils/kit.js';

const safeNow = () => sharedSafeNow();

const tokensAlive = (Game) => Game.tokens.filter(t => t.alive);
const DEFAULT_WEIGHTS = Object.freeze({
  pressure: 0.42,
  safety: 0.20,
  eta: 0.16,
  summon: 0.08,
  kitInstant: 0.06,
  kitDefense: 0.04,
  kitRevive: 0.04
});

const DEFAULT_DEBUG_KEEP = 6;

function mergedWeights(){
  const cfg = CFG.AI?.WEIGHTS || {};
  const out = { ...DEFAULT_WEIGHTS };
  for (const [key, val] of Object.entries(cfg)){
    if (typeof val === 'number' && Number.isFinite(val)) out[key] = val;
  }
  return out;
}

function debugConfig(){
  const cfg = CFG.AI?.DEBUG || {};
  const keepTopRaw = cfg.keepTop ?? cfg.KEEP_TOP ?? DEFAULT_DEBUG_KEEP;
  const keepTopNum = Number(keepTopRaw);
  return {
    keepTop: Math.max(0, Math.floor(Number.isFinite(keepTopNum) ? keepTopNum : DEFAULT_DEBUG_KEEP))
  };
}

function detectKitTraits(meta){
  const analysis = detectUltBehavior(meta?.kit || meta || {});
  const hasInstant = analysis.hasInstant || (meta?.class === 'Summoner' && !!analysis.summon);
  return {
    hasInstant: !!hasInstant,
    hasDefBuff: !!analysis.hasDefensive,
    hasRevive: !!analysis.hasRevive
  };
}

function exportCandidateDebug(entry){
  if (!entry) return null;
  return {
    cardId: entry.card?.id,
    cardName: entry.card?.name,
    cost: entry.card?.cost,
    slot: entry.cell?.s,
    cx: entry.cell?.cx,
    cy: entry.cell?.cy,
    score: entry.score,
    baseScore: entry.baseScore,
    contributions: entry.contributions,
    raw: entry.raw,
    multipliers: entry.multipliers,
    blocked: entry.blockedReason || null
  };
}

// luôn giữ deck-4 của địch đầy
export function refillDeckEnemy(Game){
  const handSize = CFG.HAND_SIZE ?? 4;
  const need = handSize - Game.ai.deck.length;
  if (need <= 0) return;
  const exclude = new Set([...Game.ai.usedUnitIds, ...Game.ai.deck.map(u=>u.id)]);
  const more = pickRandom(Game.ai.unitsAll, exclude, handSize).slice(0, need);
  Game.ai.deck.push(...more);
}

function listEmptyEnemySlots(Game, aliveTokens){
  const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
  const out = [];
  for (let s = 1; s <= 9; s++){
    const { cx, cy } = slotToCell('enemy', s);
    if (!cellReserved(alive, Game.queued, cx, cy)) out.push({ s, cx, cy });
  }
  return out;
}
function etaScoreEnemy(Game, slot){
  const last = Game.turn.last.enemy || 0;
  if (Game.turn.phase === 'enemy' && slot > last) return 1.0;
  return 0.5;
}
function pressureScore(cx, cy){
  const dist = Math.abs(cx - 0) + Math.abs(cy - 1);
  return 1 - Math.min(1, dist / 7);
}
function safetyScore(Game, cx, cy, allyTokens){
  const foesSource = Array.isArray(allyTokens) ? allyTokens : tokensAlive(Game).filter(t => t.side === 'ally');
  const sameRow = foesSource.filter(t => t.cy === cy);
  const near = sameRow.filter(t => Math.abs(t.cx - cx) <= 1).length;
  const far  = sameRow.length - near;
  return Math.max(0, Math.min(1, 1 - (near*0.6 + far*0.2)/3));
}
function summonerFeasibility(Game, unitId, baseSlot, aliveTokens){
  const meta = Game.meta.get(unitId);
  if (!meta || meta.class !== 'Summoner') return 1.0;
  const summonSpec = getSummonSpec(meta);
  if (!summonSpec) return 1.0;
  const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
  const cand = resolveSummonSlots(summonSpec, baseSlot)
    .filter(Boolean)
    .filter(s => {
      const { cx, cy } = slotToCell('enemy', s);
      return !cellReserved(alive, Game.queued, cx, cy);
    });
  const countRaw = Number(summonSpec.count);
  const need = Math.max(1, Number.isFinite(countRaw) ? countRaw : 1);
  return Math.min(1, cand.length / need);
}
function candidateBlocked(Game, entry, aliveTokens){
  if (!entry) return 'invalid';
  const alive = aliveTokens || tokensAlive(Game);
  const slot = entry.cell?.s;
  const cx = entry.cell?.cx;
  const cy = entry.cell?.cy;
  if (!Number.isFinite(slot) || !Number.isFinite(cx) || !Number.isFinite(cy)) return 'invalid';
  if (Game.queued?.enemy?.has(slot)) return 'slotQueued';
  if (cellReserved(alive, Game.queued, cx, cy)) return 'cellReserved';

  const meta = entry.meta;
  if (meta && meta.class === 'Summoner'){
    const summonSpec = getSummonSpec(meta);
    if (summonSpec){
      const patternSlots = resolveSummonSlots(summonSpec, slot).filter(Boolean);
      if (patternSlots.length){
        let available = 0;
        for (const s of patternSlots){
          const { cx: scx, cy: scy } = slotToCell('enemy', s);
          if (!cellReserved(alive, Game.queued, scx, scy)) available += 1;
        }
        const countRaw = Number(summonSpec.count);
        const need = Math.min(patternSlots.length, Math.max(1, Number.isFinite(countRaw) ? countRaw : 1));
        if (available < need) return 'summonBlocked';
      }
    }
  }
  return null;
}

function rowCrowdingFactor(Game, cy, enemyTokens){
  const ours = (Array.isArray(enemyTokens) ? enemyTokens : tokensAlive(Game).filter(t => t.side==='enemy'))
    .filter(t => t.cy===cy).length;
  let queued = 0;
  const m = Game.queued?.enemy;
  if (m && typeof m.values === 'function'){
    for (const p of m.values()) { if (p && p.cy === cy) queued++; }
  }
  const n = ours + queued;
  if (n >= 3) return 0.70;
  if (n === 2) return ((CFG.AI?.ROW_CROWDING_PENALTY) ?? 0.85);
  return 1.0;
}
function roleBias(className, cx){
  const front = (cx <= (CFG.GRID_COLS - CFG.ENEMY_COLS)); // cột 4–5 là "front" phía địch
  const R = CFG.AI?.ROLE?.[className] || {};
  let f = 1.0;
  if (front && typeof R.front === 'number') f *= (1 + R.front);
  if (!front && typeof R.back  === 'number') f *= (1 + R.back);
  return f;
}

export function queueEnemyAt(Game, card, slot, cx, cy, aliveTokens){
  if (Game.ai.cost < card.cost) return false;
  if (Game.ai.summoned >= Game.ai.summonLimit) return false;
  const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
  if (cellReserved(alive, Game.queued, cx, cy)) return false;
  if (Game.queued.enemy.has(slot)) return false;

  const spawnCycle = (Game.turn.phase === 'enemy' && slot > (Game.turn.last.enemy||0))
    ? Game.turn.cycle : Game.turn.cycle + 1;

  Game.queued.enemy.set(slot, {
    unitId: card.id, name: card.name, side:'enemy',
    cx, cy, slot, spawnCycle, color:'#ed9dad'
  });

  Game.ai.cost = Math.max(0, Game.ai.cost - card.cost);
  Game.ai.summoned += 1;
  Game.ai.usedUnitIds.add(card.id);
  Game.ai.deck = Game.ai.deck.filter(u => u.id !== card.id);
  refillDeckEnemy(Game);
  return true;
}

export function aiMaybeAct(Game, reason){
  const now = safeNow();
  if (now - (Game.ai.lastThinkMs||0) < 120) return;
  const weights = mergedWeights();
  const dbgCfg = debugConfig();

  const hand = Game.ai.deck.filter(c => Game.ai.cost >= c.cost);
  if (!hand.length) {
    Game.ai.lastDecision = {
      reason,
      at: now,
      weights,
      chosen: null,
      considered: [],
      skipped: 'noPlayableCard'
    };
    Game.ai.lastThinkMs = now;
    return;
 }
  const alive = tokensAlive(Game);
  const aliveAllies = alive.filter(t => t.side === 'ally');
  const aliveEnemies = alive.filter(t => t.side === 'enemy');

  const cells = listEmptyEnemySlots(Game, alive);
    if (!cells.length) {
    Game.ai.lastDecision = {
      reason,
      at: now,
      weights,
      chosen: null,
      considered: [],
      skipped: 'noOpenSlot'
    };
    Game.ai.lastThinkMs = now;
    return;
    }

  const evaluations = [];
  for (const card of hand){
    const meta = Game.meta.get(card.id);
    const kitTraits = detectKitTraits(meta);
    for (const cell of cells){

      const p  = pressureScore(cell.cx, cell.cy);
      const s  = safetyScore(Game, cell.cx, cell.cy, aliveAllies);
      const e  = etaScoreEnemy(Game, cell.s);
      const sf = summonerFeasibility(Game, card.id, cell.s, alive);

      const kitInstantScore = kitTraits.hasInstant ? e : 0;
      const kitDefenseScore = kitTraits.hasDefBuff ? (1 - s) : 0;
      const kitReviveScore  = kitTraits.hasRevive ? s : 0;

      const contributions = {
        pressure: (weights.pressure ?? 0) * p,
        safety: (weights.safety ?? 0) * s,
        eta: (weights.eta ?? 0) * e,
        summon: (weights.summon ?? 0) * sf,
        kitInstant: (weights.kitInstant ?? 0) * kitInstantScore,
        kitDefense: (weights.kitDefense ?? 0) * kitDefenseScore,
        kitRevive: (weights.kitRevive ?? 0) * kitReviveScore
      };

      const baseScore = Object.values(contributions).reduce((acc, val) => acc + val, 0);
      const rowFactor = rowCrowdingFactor(Game, cell.cy, aliveEnemies);
      const roleFactor = roleBias(meta?.class, cell.cx);
      const finalScore = baseScore * rowFactor * roleFactor;

      evaluations.push({
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
          kitRevive: kitReviveScore
        },
        multipliers: { row: rowFactor, role: roleFactor }
      });
    }
  }
  if (!evaluations.length) {
    Game.ai.lastDecision = {
      reason,
      at: now,
      weights,
      chosen: null,
      considered: [],
      skipped: 'noEvaluation'
    };
    Game.ai.lastThinkMs = now;
    return;
  }

  evaluations.sort((a, b) => (b.score - a.score));

  let chosen = null;
  for (const entry of evaluations){
    const blocked = candidateBlocked(Game, entry, alive);
    if (blocked){
      entry.blockedReason = blocked;
      continue;
    }
    const ok = queueEnemyAt(Game, entry.card, entry.cell.s, entry.cell.cx, entry.cell.cy, alive);
    if (ok){
      chosen = entry;
      break;
    }
    entry.blockedReason = 'queueFailed';
  }
  const considered = dbgCfg.keepTop > 0
    ? evaluations.slice(0, dbgCfg.keepTop).map(exportCandidateDebug)
    : [];

  Game.ai.lastDecision = {
    reason,
    at: now,
    weights,
    chosen: exportCandidateDebug(chosen),
    considered,
    skipped: chosen ? null : 'allBlocked'
  };
  Game.ai.lastThinkMs = now;
}
