// ai.js v0.7.5
import { pickRandom, slotToCell, cellReserved } from './engine.js';
import { CFG } from './config.js';

const tokensAlive = (Game) => Game.tokens.filter(t => t.alive);

// luôn giữ deck-4 của địch đầy
export function refillDeckEnemy(Game){
  const handSize = CFG.HAND_SIZE ?? 4;
  const need = handSize - Game.ai.deck.length;
  if (need <= 0) return;
  const exclude = new Set([...Game.ai.usedUnitIds, ...Game.ai.deck.map(u=>u.id)]);
  const more = pickRandom(Game.ai.unitsAll, exclude, handSize).slice(0, need);
  Game.ai.deck.push(...more);
}

function listEmptyEnemySlots(Game){
  const out = [];
  for (let s = 1; s <= 9; s++){
    const { cx, cy } = slotToCell('enemy', s);
    if (!cellReserved(tokensAlive(Game), Game.queued, cx, cy)) out.push({ s, cx, cy });
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
function safetyScore(Game, cx, cy){
  const foes = tokensAlive(Game).filter(t => t.side === 'ally');
  const sameRow = foes.filter(t => t.cy === cy);
  const near = sameRow.filter(t => Math.abs(t.cx - cx) <= 1).length;
  const far  = sameRow.length - near;
  return Math.max(0, Math.min(1, 1 - (near*0.6 + far*0.2)/3));
}
function getPatternSlots(pattern, baseSlot){
  switch(pattern){
    case 'verticalNeighbors': {
      const row = (baseSlot - 1) % 3;
      const v = [];
      if (row > 0) v.push(baseSlot - 1);
      if (row < 2) v.push(baseSlot + 1);
      return v;
    }
    case 'rowNeighbors': {
      const col = Math.floor((baseSlot - 1) / 3);
      const row = (baseSlot - 1) % 3;
      const left  = (col < 2) ? ((col + 1) * 3 + row + 1) : null;
      const right = (col > 0) ? ((col - 1) * 3 + row + 1) : null;
      return [right, left].filter(Boolean);
    }
    default: return [];
  }
}
function summonerFeasibility(Game, unitId, baseSlot){
  const meta = Game.meta.get(unitId);
  if (!meta || meta.class !== 'Summoner' || meta?.kit?.ult?.type !== 'summon') return 1.0;
  const u = meta.kit.ult;
  const cand = getPatternSlots(u.pattern || 'verticalNeighbors', baseSlot)
    .filter(Boolean)
    .filter(s => {
      const { cx, cy } = slotToCell('enemy', s);
      return !cellReserved(tokensAlive(Game), Game.queued, cx, cy);
    });
  const need = Math.max(1, u.count || 1);
  return Math.min(1, cand.length / need);
}
function rowCrowdingFactor(Game, cy){
  const ours = tokensAlive(Game).filter(t => t.side==='enemy' && t.cy===cy).length;
  let queued = 0;
  const m = Game.queued?.enemy;
  if (m && typeof m.values === 'function'){
    for (const p of m.values()) { if (p && p.cy === cy) queued++; }
  }
  const n = ours + queued;
  if (n >= 3) return 0.70;
  if (n === 2) return (CFG.AI?.ROW_CROWDING_PENALTY ?? 0.85);
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

export function queueEnemyAt(Game, card, slot, cx, cy){
  if (Game.ai.cost < card.cost) return false;
  if (Game.ai.summoned >= Game.ai.summonLimit) return false;
  if (cellReserved(tokensAlive(Game), Game.queued, cx, cy)) return false;
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
  const now = performance.now();
  if (now - (Game.ai.lastThinkMs||0) < 120) return;

  const hand = Game.ai.deck.filter(c => Game.ai.cost >= c.cost);
  if (!hand.length) { Game.ai.lastThinkMs = now; return; }

  const cells = listEmptyEnemySlots(Game);
  if (!cells.length) { Game.ai.lastThinkMs = now; return; }

  let best = null;
  for (const c of hand){
    const meta = Game.meta.get(c.id);
    for (const cell of cells){
      const W = (CFG.AI?.WEIGHTS) || { pressure:0.46, safety:0.26, eta:0.18, summon:0.10 };

      const p  = pressureScore(cell.cx, cell.cy);
      const s  = safetyScore(Game, cell.cx, cell.cy);
      const e  = etaScoreEnemy(Game, cell.s);
      const sf = summonerFeasibility(Game, c.id, cell.s);

      let score = W.pressure*p + W.safety*s + W.eta*e + W.summon*sf;
      score *= rowCrowdingFactor(Game, cell.cy) * roleBias(meta?.class, cell.cx);

      if (!best || score > best.score) best = { card:c, cell, score };
    }
  }
  if (best){
    queueEnemyAt(Game, best.card, best.cell.s, best.cell.cx, best.cell.cy);
  }
  Game.ai.lastThinkMs = now;
}
