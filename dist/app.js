// Bundled by build.mjs
const __modules = Object.create(null);
function __define(id, factory){ __modules[id] = { factory, exports: null, initialized: false }; }
function __require(id){
  const mod = __modules[id];
  if (!mod) throw new Error('Module not found: ' + id);
  if (!mod.initialized){
    mod.initialized = true;
    const module = { exports: {} };
    mod.exports = module.exports;
    mod.factory(module.exports, module, __require);
    mod.exports = module.exports;
  }
  return mod.exports;
}
__define('./ai.js', (exports, module, __require) => {
  // ai.js v0.7.6
  const __dep0 = __require('./engine.js');
  const pickRandom = __dep0.pickRandom;
  const slotToCell = __dep0.slotToCell;
  const cellReserved = __dep0.cellReserved;
  const __dep1 = __require('./config.js');
  const CFG = __dep1.CFG;

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
    const ult = meta?.kit?.ult || {};
    const tags = Array.isArray(ult.tags) ? ult.tags : [];
    const hasInstant = !!(ult.instant || ult.cast === 'instant' || ult.immediate === true
      || (meta?.class === 'Summoner' && ult.type === 'summon'));
    const hasDefBuff = typeof ult.reduceDmg === 'number'
      || typeof ult.shield === 'number'
      || typeof ult.barrier === 'number'
      || ult.type === 'selfBuff'
      || tags.includes('defense');
    const hasRevive = ult.type === 'revive' || ult.revive === true || typeof ult.revived === 'object';
    return { hasInstant, hasDefBuff, hasRevive };
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
  function refillDeckEnemy(Game){
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
    if (meta && meta.class === 'Summoner' && meta?.kit?.ult?.type === 'summon'){
      const ult = meta.kit.ult || {};
      const patternSlots = getPatternSlots(ult.pattern || 'verticalNeighbors', slot).filter(Boolean);
      if (patternSlots.length){
        let available = 0;
        for (const s of patternSlots){
          const { cx: scx, cy: scy } = slotToCell('enemy', s);
          if (!cellReserved(alive, Game.queued, scx, scy)) available += 1;
        }
        const countRaw = Number(ult.count);
        const need = Math.min(patternSlots.length, Math.max(1, Number.isFinite(countRaw) ? countRaw : 1));
        if (available < need) return 'summonBlocked';
      }
    }
    return null;
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

  function queueEnemyAt(Game, card, slot, cx, cy){
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

  function aiMaybeAct(Game, reason){
    const now = performance.now();
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
    const cells = listEmptyEnemySlots(Game);
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
        const s  = safetyScore(Game, cell.cx, cell.cy);
        const e  = etaScoreEnemy(Game, cell.s);
        const sf = summonerFeasibility(Game, card.id, cell.s);

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
        const rowFactor = rowCrowdingFactor(Game, cell.cy);
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

    const alive = tokensAlive(Game);
    let chosen = null;
    for (const entry of evaluations){
      const blocked = candidateBlocked(Game, entry, alive);
      if (blocked){
        entry.blockedReason = blocked;
        continue;
      }
      const ok = queueEnemyAt(Game, entry.card, entry.cell.s, entry.cell.cx, entry.cell.cy);
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

  exports.refillDeckEnemy = refillDeckEnemy;
  exports.queueEnemyAt = queueEnemyAt;
  exports.aiMaybeAct = aiMaybeAct;
});
__define('./art.js', (exports, module, __require) => {
  // v0.7.7 – Unit art catalog

  function svgData(width, height, body){
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  function sanitizeId(base, palette){
    const seed = `${palette.primary || ''}${palette.secondary || ''}${palette.accent || ''}`.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    return `${base}${seed}` || `${base}0`;
  }

  function svgShield(palette){
    const gradId = sanitizeId('gradShield', palette);
    const light = palette.accent || '#f4f8ff';
    const outline = palette.outline || 'rgba(12,18,26,0.85)';
    const body = `
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette.primary || '#7abfff'}"/>
          <stop offset="100%" stop-color="${palette.secondary || '#12344b'}"/>
        </linearGradient>
      </defs>
      <path d="M48 4 L92 22 L82 84 L48 112 L14 84 L4 22 Z" fill="url(#${gradId})" stroke="${outline}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M48 20 L74 30 L66 70 L48 86 L30 70 L22 30 Z" fill="${light}" opacity="0.32"/>
      <path d="M48 44 L60 52 L48 74 L36 52 Z" fill="${light}" opacity="0.55"/>
      <circle cx="48" cy="44" r="6" fill="${light}" opacity="0.8"/>
    `;
    return svgData(96, 120, body);
  }

  function svgWing(palette){
    const gradId = sanitizeId('gradWing', palette);
    const accent = palette.accent || '#ffe2e6';
    const outline = palette.outline || 'rgba(24,12,16,0.85)';
    const body = `
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.primary || '#ffb3bc'}"/>
          <stop offset="100%" stop-color="${palette.secondary || '#4c1a23'}"/>
        </linearGradient>
      </defs>
      <path d="M16 100 C10 66 18 30 42 12 C64 -2 94 8 110 28 C106 58 88 96 52 116 Z" fill="url(#${gradId})" stroke="${outline}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M36 34 C50 26 72 26 84 42 C76 60 64 74 48 84 C34 72 32 54 36 34 Z" fill="${accent}" opacity="0.38"/>
      <path d="M48 52 C60 48 74 50 82 58 C70 74 60 88 46 96 C40 84 42 66 48 52 Z" fill="${accent}" opacity="0.45"/>
    `;
    return svgData(120, 128, body);
  }

  function svgRune(palette){
    const gradId = sanitizeId('gradRune', palette);
    const accent = palette.accent || '#f1dbff';
    const outline = palette.outline || 'rgba(22,15,35,0.85)';
    const body = `
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette.primary || '#b487ff'}"/>
          <stop offset="100%" stop-color="${palette.secondary || '#2e1c52'}"/>
        </linearGradient>
      </defs>
      <path d="M60 8 L104 48 L60 104 L16 48 Z" fill="url(#${gradId})" stroke="${outline}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M60 24 L88 48 L60 88 L32 48 Z" fill="${accent}" opacity="0.28"/>
      <path d="M60 26 L68 48 L60 70 L52 48 Z" fill="${accent}" opacity="0.65"/>
      <circle cx="60" cy="48" r="6" fill="${accent}" opacity="0.82"/>
    `;
    return svgData(120, 120, body);
  }

  function svgBloom(palette){
    const gradId = sanitizeId('gradBloom', palette);
    const accent = palette.accent || '#ffeef7';
    const outline = palette.outline || 'rgba(22,26,24,0.78)';
    const body = `
      <defs>
        <radialGradient id="${gradId}" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stop-color="${palette.primary || '#ffcff1'}"/>
          <stop offset="100%" stop-color="${palette.secondary || '#873772'}"/>
        </radialGradient>
      </defs>
      <path d="M60 8 C78 10 94 22 102 40 C118 56 122 80 110 98 C92 120 66 122 42 116 C24 106 12 90 10 70 C8 50 16 30 30 18 C38 10 50 8 60 8 Z" fill="url(#${gradId})" stroke="${outline}" stroke-width="4"/>
      <path d="M60 22 C72 24 84 32 90 44 C96 60 90 78 74 92 C62 102 46 106 34 100 C26 90 24 74 28 60 C34 40 46 24 60 22 Z" fill="${accent}" opacity="0.3"/>
      <circle cx="60" cy="58" r="12" fill="${accent}" opacity="0.6"/>
    `;
    return svgData(120, 128, body);
  }

  function svgPike(palette){
    const gradId = sanitizeId('gradPike', palette);
    const accent = palette.accent || '#f9f7e8';
    const outline = palette.outline || 'rgba(28,26,18,0.82)';
    const body = `
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette.primary || '#ffd37a'}"/>
          <stop offset="100%" stop-color="${palette.secondary || '#5b2f12'}"/>
        </linearGradient>
      </defs>
      <path d="M60 0 L92 40 L76 112 L44 112 L28 40 Z" fill="url(#${gradId})" stroke="${outline}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M60 22 L76 46 L64 94 L56 94 L44 46 Z" fill="${accent}" opacity="0.3"/>
      <path d="M60 8 L70 40 L60 52 L50 40 Z" fill="${accent}" opacity="0.6"/>
    `;
    return svgData(120, 120, body);
  }

  function svgSentinel(palette){
    const gradId = sanitizeId('gradSentinel', palette);
    const accent = palette.accent || '#e1f7ff';
    const outline = palette.outline || 'rgba(18,25,32,0.85)';
    const body = `
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette.primary || '#8fd6ff'}"/>
          <stop offset="100%" stop-color="${palette.secondary || '#1d3346'}"/>
        </linearGradient>
      </defs>
      <path d="M60 6 C86 12 108 38 112 68 C116 98 102 122 76 130 C56 134 36 128 22 114 C10 102 4 86 6 70 C10 40 32 14 60 6 Z" fill="url(#${gradId})" stroke="${outline}" stroke-width="4"/>
      <path d="M60 22 C78 28 92 46 92 66 C92 90 78 110 56 116 C38 114 24 100 22 82 C20 58 34 34 60 22 Z" fill="${accent}" opacity="0.3"/>
      <circle cx="60" cy="64" r="12" fill="${accent}" opacity="0.6"/>
    `;
    return svgData(120, 132, body);
  }

  const SPRITES = {
    shield: svgShield,
    wing: svgWing,
    rune: svgRune,
    bloom: svgBloom,
    pike: svgPike,
    sentinel: svgSentinel
  };

  function merge(target, source){
    return Object.assign({}, target, source || {});
  }

  function makeArt(pattern, palette, opts = {}){
    const spriteFactory = opts.spriteFactory || SPRITES[pattern];
    const sprite = opts.sprite === null ? null : (opts.sprite || (spriteFactory ? spriteFactory(palette) : null));
    const layout = merge({
      anchor: 0.78,
      labelOffset: 1.18,
      labelFont: 0.72,
      hpOffset: 1.46,
      hpWidth: 2.4,
      hpHeight: 0.42,
      spriteAspect: 0.78,
      spriteHeight: 2.4
    }, opts.layout);
    const label = merge({
      bg: 'rgba(12,20,30,0.82)',
      text: '#f4f8ff',
      stroke: 'rgba(255,255,255,0.08)'
    }, opts.label);
    const hpBar = merge({
      bg: 'rgba(9,14,21,0.74)',
      fill: palette.accent || '#6ff0c0',
      border: 'rgba(0,0,0,0.55)'
    }, opts.hpBar);
    return {
      sprite,
      palette,
      shape: opts.shape || pattern,
      size: opts.size ?? 1,
      shadow: opts.shadow ?? 'rgba(0,0,0,0.35)',
      glow: opts.glow ?? palette.accent || '#8cf6ff',
      mirror: opts.mirror ?? true,
      layout,
      label,
      hpBar
    };
  }

  const basePalettes = {
    default:   { primary:'#7fa6c0', secondary:'#1d2b38', accent:'#d6f2ff', outline:'#223548' },
    leaderA:   { primary:'#74cfff', secondary:'#123c55', accent:'#dff7ff', outline:'#1a4d68' },
    leaderB:   { primary:'#ff9aa0', secondary:'#4a1921', accent:'#ffd9dd', outline:'#571f28' },
    phe:       { primary:'#a884ff', secondary:'#2b1954', accent:'#f1ddff', outline:'#3a2366' },
    kiem:      { primary:'#ffd37a', secondary:'#5b2f12', accent:'#fff3c3', outline:'#4a260f' },
    loithien:  { primary:'#8bd1ff', secondary:'#163044', accent:'#c7f1ff', outline:'#1e3e53' },
    laky:      { primary:'#ffc9ec', secondary:'#7c336a', accent:'#ffeef9', outline:'#5a214b' },
    kydieu:    { primary:'#a0f2d4', secondary:'#1f4f47', accent:'#e7fff5', outline:'#1b3c36' },
    doanminh:  { primary:'#ffe6a5', secondary:'#3e2b12', accent:'#fff8da', outline:'#2f2110' },
    tranquat:  { primary:'#89f5ff', secondary:'#1a3651', accent:'#d0fbff', outline:'#223e58' },
    linhgac:   { primary:'#9ec4ff', secondary:'#2a3f5c', accent:'#e4f1ff', outline:'#24364c' },
    minion:    { primary:'#ffd27d', secondary:'#5a3a17', accent:'#fff4cc', outline:'#452b0f' }
  };

  const UNIT_ART = {
    default: makeArt('sentinel', basePalettes.default, {
      layout: { labelOffset: 1.1, hpOffset: 1.38 }
    }),
    leaderA: makeArt('shield', basePalettes.leaderA, {
      layout: { labelOffset: 1.24, hpOffset: 1.52, hpWidth: 2.6 },
      label: { text: '#e5f6ff', bg: 'rgba(12,30,44,0.88)' },
      hpBar: { fill: '#6ff0c0' }
    }),
    leaderB: makeArt('wing', basePalettes.leaderB, {
      layout: { labelOffset: 1.3, hpOffset: 1.58, hpWidth: 2.6 },
      label: { text: '#ffe6ec', bg: 'rgba(46,16,24,0.88)' },
      hpBar: { fill: '#ff9aa0' }
    }),
    phe: makeArt('rune', basePalettes.phe, {
      layout: { labelOffset: 1.2, hpOffset: 1.48 },
      hpBar: { fill: '#c19bff' }
    }),
    kiemtruongda: makeArt('pike', basePalettes.kiem, {
      layout: { labelOffset: 1.22, hpOffset: 1.5 },
      hpBar: { fill: '#ffd37a' }
    }),
    loithienanh: makeArt('sentinel', basePalettes.loithien, {
      layout: { labelOffset: 1.18, hpOffset: 1.46 },
      hpBar: { fill: '#80f2ff' }
    }),
    laky: makeArt('bloom', basePalettes.laky, {
      layout: { labelOffset: 1.18, hpOffset: 1.44 },
      hpBar: { fill: '#ffb8e9' }
    }),
    kydieu: makeArt('rune', basePalettes.kydieu, {
      layout: { labelOffset: 1.16, hpOffset: 1.42 },
      hpBar: { fill: '#9af5d2' }
    }),
    doanminh: makeArt('pike', basePalettes.doanminh, {
      layout: { labelOffset: 1.26, hpOffset: 1.54 },
      hpBar: { fill: '#ffe6a5' }
    }),
    tranquat: makeArt('rune', basePalettes.tranquat, {
      layout: { labelOffset: 1.18, hpOffset: 1.46 },
      hpBar: { fill: '#7fe9ff' }
    }),
    linhgac: makeArt('sentinel', basePalettes.linhgac, {
      layout: { labelOffset: 1.16, hpOffset: 1.42 },
      hpBar: { fill: '#a9d6ff' }
    }),
    minion: makeArt('pike', basePalettes.minion, {
      layout: { labelOffset: 1.08, hpOffset: 1.32, hpWidth: 2.1, hpHeight: 0.38 },
      label: { text: '#fff1d0' },
      hpBar: { fill: '#ffd27d' }
    })
  };

  function getUnitArt(id){
    if (!id) return UNIT_ART.default;
    if (UNIT_ART[id]) return UNIT_ART[id];
    if (id.endsWith('_minion')){
      const base = id.replace(/_minion$/, '');
      return UNIT_ART[`${base}_minion`] || UNIT_ART.minion || UNIT_ART.default;
    }
    return UNIT_ART.default;
  }

  function getPalette(id){
    const art = getUnitArt(id);
    return art?.palette || basePalettes.default;
  }

  exports.UNIT_ART = UNIT_ART;
  exports.getUnitArt = getUnitArt;
  exports.getPalette = getPalette;
});
__define('./catalog.js', (exports, module, __require) => {
  //v0.7
  // 1) Rank multiplier (đơn giản) — áp lên TẤT CẢ stat trừ SPD
  const RANK_MULT = { N:0.60, R:0.80, SR:1.00, SSR:1.30, UR:1.60, Prime:2.00 };

  // 2) Class base (mốc lv1 để test). SPD không chịu rank multiplier.
  const CLASS_BASE = {
    Mage:     { HP:360, ATK:28, WIL:30, ARM:0.08, RES:0.12, AGI:10, PER:12, SPD:1.00, AEmax:110, AEregen:0.80 },
    Tanker:   { HP:500, ATK:22, WIL:20, ARM:0.18, RES:0.14, AGI: 9, PER:10, SPD:0.95, AEmax: 60, AEregen:0.40 },
    Ranger:   { HP:360, ATK:35, WIL:16, ARM:0.08, RES:0.08, AGI:12, PER:14, SPD:1.20, AEmax: 75, AEregen:0.70 },
    Warrior:  { HP:400, ATK:30, WIL:18, ARM:0.14, RES:0.08, AGI:11, PER:11, SPD:1.10, AEmax: 70, AEregen:0.60 },
    Summoner: { HP:330, ATK:22, WIL:26, ARM:0.08, RES:0.14, AGI:10, PER:10, SPD:1.05, AEmax: 90, AEregen:0.85 },
    Support:  { HP:380, ATK:24, WIL:24, ARM:0.10, RES:0.13, AGI:10, PER:11, SPD:1.00, AEmax:100, AEregen:0.75 },
    Assassin: { HP:320, ATK:36, WIL:16, ARM:0.06, RES:0.08, AGI:14, PER:16, SPD:1.25, AEmax: 65, AEregen:0.60 }
  };

  // 3) Helper: áp rank & mod (mods không áp vào SPD)
  function applyRankAndMods(base, rank, mods = {}){
    const m = RANK_MULT[rank] ?? 1;
    const out = { ...base };
    for (const k of Object.keys(base)){
      if (k === 'SPD') { // SPD không nhân theo bậc
        out[k] = Math.round(base[k] * (1 + (mods[k] || 0)) * 100) / 100;
      } else {
        out[k] = Math.round(base[k] * (1 + (mods[k] || 0)) * m);
      }
    }
    return out;
  }

  // 4) Roster (dex/meta) — 8 nhân vật, ngân sách mod bằng nhau (~+20% tổng, không đụng SPD)
  //  - onSpawn.rage: 100 cho mọi unit từ deck (trừ leader). Revive không áp quy tắc này.
  //  - kit.ult.type: 'summon' chỉ dành cho class Summoner -> kích hoạt Immediate Summon (action-chain).
  const ROSTER = [
    {
      id: 'phe', name: 'Phệ', class: 'Mage', rank: 'Prime',
      mods: { WIL:+0.10, AEregen:+0.10 }, // 20% tổng
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
        ult: { type: 'drain', aoe: 'allEnemies', notes: 'lifedrain->overheal->shield; không summon' },
        passives: [
          { id:'mark_devour', when:'onBasicHit', effect:'placeMark', params:{ stacksToExplode:3, ttlTurns:3, dmgFromWIL:0.5, purgeable:false } }
        ]
      }
    },
    {
      id: 'kiemtruongda', name: 'Kiếm Trường Dạ', class: 'Warrior', rank: 'Prime',
      mods: { ATK:+0.12, PER:+0.08 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
        ult: { type:'strikeLaneMid', hits:4, tagAsBasic:true, bonusVsLeader:0.20, penRES:0.30 },
        passives: [{ id:'atk_on_ult', when:'onUltCast', effect:'gainATK%', params:{ amount:+0.10, duration:'perm', stack:true } }]
      }
    },
    {
      id: 'loithienanh', name: 'Lôi Thiên Ảnh', class: 'Tanker', rank: 'SSR',
      mods: { RES:+0.10, WIL:+0.10 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
        ult: { type:'selfBuff', reduceDmg:0.35, turns:2, selfHPTrade:0.10 },
        passives: [{ id:'swap_res_wil', when:'onTurnStart', effect:'conditionalBuff',
                     params:{ ifHPgt:0.5, RES:+0.20, elseWIL:+0.20, purgeable:false } }]
      }
    },
    {
      id: 'laky', name: 'La Kỳ', class: 'Support', rank: 'SSR',
      mods: { WIL:+0.10, PER:+0.10 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
        ult: { type:'sleep', targets:3, turns:2 },
        passives: [{ id:'res_per_sleeping_enemy', when:'onTurnStart', effect:'gainRES%', params:{ perTarget:+0.02, unlimited:true } }]
      }
    },
    {
      id: 'kydieu', name: 'Kỳ Diêu', class: 'Support', rank: 'SR',
      mods: { WIL:+0.10, RES:+0.10 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
        ult: { type:'revive', targets:1, revived:{ rage:0, lockSkillsTurns:1 } },
        passives: [{ id:'res_stack_per_action', when:'onActionEnd', effect:'gainRES%', params:{ amount:+0.01, stack:true, purgeable:false } }]
      }
    },
    {
      id: 'doanminh', name: 'Doãn Minh', class: 'Support', rank: 'SR',
      mods: { WIL:+0.10, AEmax:+0.10 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true, teamHealOnEntry:0.05 },
        ult: { type:'equalizeHP', allies:3, healLeader:true }
      }
    },
    {
      id: 'tranquat', name: 'Trần Quát', class: 'Summoner', rank: 'R',
      mods: { ATK:+0.10, PER:+0.10 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
        // Immediate Summon: 2 creep cùng CỘT (slot-1 & slot+1 nếu trống), hành động ngay theo slot tăng dần.
        ult: { type:'summon',
    pattern:'verticalNeighbors', count:2, ttl:3,
    inherit:{ HP:0.50, ATK:0.50 }, limit:2, replace:'oldest',
    creep:{ hasRage:false, canChain:false, basicOnly:true },
        },
        passives: [{ id:'basic_dmg_per_minion', when:'onBasicHit', effect:'gainBonus', params:{ perMinion:+0.02 } }]
      }
    },
    {
      id: 'linhgac', name: 'Lính Gác', class: 'Warrior', rank: 'N',
      mods: { ARM:+0.10, ATK:+0.10 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
        ult: { type:'haste', targets:'self+2allies', attackSpeed:+0.20, turns:2 }
      }
    }
  ];

  // 5) Map & helper tra cứu
  const ROSTER_MAP = new Map(ROSTER.map(x => [x.id, x]));
  const getMetaById = (id) => ROSTER_MAP.get(id);
  const isSummoner = (id) => {
    const m = getMetaById(id);
    return !!(m && m.class === 'Summoner' && m.kit?.ult?.type === 'summon');
  };

  exports.RANK_MULT = RANK_MULT;
  exports.CLASS_BASE = CLASS_BASE;
  exports.ROSTER = ROSTER;
  exports.ROSTER_MAP = ROSTER_MAP;
  exports.getMetaById = getMetaById;
  exports.isSummoner = isSummoner;
  exports.applyRankAndMods = applyRankAndMods;
});
__define('./combat.js', (exports, module, __require) => {
  //v0.8
  const __dep0 = __require('./statuses.js');
  const Statuses = __dep0.Statuses;
  const hookOnLethalDamage = __dep0.hookOnLethalDamage;
  const __dep1 = __require('./vfx.js');
  const vfxAddTracer = __dep1.vfxAddTracer;
  const vfxAddHit = __dep1.vfxAddHit;
  const vfxAddMelee = __dep1.vfxAddMelee;
  const __dep2 = __require('./engine.js');
  const slotToCell = __dep2.slotToCell;
  const cellReserved = __dep2.cellReserved;
  const __dep3 = __require('./vfx.js');
  const vfxAddSpawn = __dep3.vfxAddSpawn;
  const __dep4 = __require('./passives.js');
  const emitPassiveEvent = __dep4.emitPassiveEvent;
  function pickTarget(Game, attacker){
   const foe = attacker.side === 'ally' ? 'enemy' : 'ally';
   const pool = Game.tokens.filter(t => t.side === foe && t.alive);
    if (!pool.length) return null;

    // 1) “Trước mắt”: cùng hàng, ưu tiên cột sát midline → xa dần
   const r = attacker.cy;                 // 0=top,1=mid,2=bot
    const seq = [];
    if (attacker.side === 'ally'){
    // enemy: cột 4 là 1..3 (dưới→trên) ⇒ slot hàng r là (3 - r)
     const s1 = 3 - r;                    // 1|2|3 (gần midline)
    seq.push(s1, s1 + 3, s1 + 6);        // 2→5→8 (hàng mid) / 1→4→7 / 3→6→9
    for (const s of seq){
      const { cx, cy } = slotToCell('enemy', s);
      const tgt = pool.find(t => t.cx === cx && t.cy === cy);
      if (tgt) return tgt;
   }
   } else {
     // ally: cột 2 là 1..3 (trên→dưới) ⇒ slot hàng r là (r + 1)
    const s1 = r + 1;                    // 1|2|3 (gần midline phía ally)
     seq.push(s1, s1 + 3, s1 + 6);        // 2→5→8 ... theo chiều đối xứng
      for (const s of seq){
       const { cx, cy } = slotToCell('ally', s);
      const tgt = pool.find(t => t.cx === cx && t.cy === cy);
     if (tgt) return tgt;
   } 
   }
   // 2) Fallback: không có ai “trước mắt” ⇒ đánh đơn vị gần nhất
   return pool.sort((a,b)=>{
     const da = Math.abs(a.cx - attacker.cx) + Math.abs(a.cy - attacker.cy);
     const db = Math.abs(b.cx - attacker.cx) + Math.abs(b.cy - attacker.cy);
    return da - db;
   })[0] || null;
  }

  function computeDamage(attacker, target, type='physical'){
    const atk = attacker.atk||0, wil = attacker.wil||0;
    if (type==='arcane'){
      const raw = Math.max(1, Math.floor(wil));
      const cut = 1 - (target.res||0);
      return Math.max(1, Math.floor(raw * cut));
    } else {
      const raw = Math.max(1, Math.floor(atk));
      const cut = 1 - (target.arm||0);
      return Math.max(1, Math.floor(raw * cut));
    }
  }

  function applyDamage(target, amount){
    if (!Number.isFinite(target.hpMax)) return;
    target.hp = Math.max(0, Math.min(target.hpMax, (target.hp|0) - (amount|0)));
    if (target.hp <= 0){
      if (target.alive !== false && !target.deadAt) target.deadAt = performance.now();
      target.alive = false;
    }
  }
  function dealAbilityDamage(Game, attacker, target, opts = {}){
    if (!attacker || !target || !target.alive) return { dealt: 0, absorbed: 0, total: 0 };

    const dtype = opts.dtype || 'physical';
    const attackType = opts.attackType || 'skill';
    const baseDefault = dtype === 'arcane'
      ? Math.max(0, Math.floor(attacker.wil || 0))
      : Math.max(0, Math.floor(attacker.atk || 0));
    const base = Math.max(0, opts.base != null ? Math.floor(opts.base) : baseDefault);

    const pre = Statuses.beforeDamage(attacker, target, { dtype, base, attackType });

    const combinedPen = Math.max(0, Math.min(1, Math.max(pre.defPen || 0, opts.defPen || 0)));
   const defStat = dtype === 'arcane' ? (target.res || 0) : (target.arm || 0);

    let dmg = Math.max(0, Math.floor(pre.base * pre.outMul));
    if (pre.ignoreAll) {
      dmg = 0;
    } else {
      const effectiveDef = Math.max(0, defStat * (1 - combinedPen));
      dmg = Math.max(0, Math.floor(dmg * (1 - effectiveDef)));
      dmg = Math.max(0, Math.floor(dmg * pre.inMul));
    }

    const abs = Statuses.absorbShield(target, dmg, { dtype });
    const remain = Math.max(0, abs.remain);

    if (remain > 0) applyDamage(target, remain);
  if (target.hp <= 0) hookOnLethalDamage(target);

    Statuses.afterDamage(attacker, target, { dealt: remain, absorbed: abs.absorbed, dtype });

    if (Game) {
      try { vfxAddHit(Game, target); } catch (_) {}
    }

    return { dealt: remain, absorbed: abs.absorbed, total: dmg };
  }

  function healUnit(target, amount){
    if (!target || !Number.isFinite(target.hpMax)) return { healed: 0, overheal: 0 };
    const amt = Math.max(0, Math.floor(amount ?? 0));
  if (amt <= 0) return { healed: 0, overheal: 0 };
    const before = Math.max(0, target.hp || 0);
    const healCap = Math.max(0, target.hpMax - before);
    const healed = Math.min(amt, healCap);
    target.hp = before + healed;
    return { healed, overheal: Math.max(0, amt - healed) };
  }

  function grantShield(target, amount){
    if (!target) return 0;
    const amt = Math.max(0, Math.floor(amount ?? 0));
    if (amt <= 0) return 0;
    const cur = Statuses.get(target, 'shield');
    if (cur) {
      cur.amount = (cur.amount || 0) + amt;
     } else {
      Statuses.add(target, { id: 'shield', kind: 'buff', tag: 'shield', amount: amt });
    }
    return amt;
  }
   
  function basicAttack(Game, unit){
    const foe = unit.side === 'ally' ? 'enemy' : 'ally';
    const pool = Game.tokens.filter(t => t.side === foe && t.alive);
    if (!pool.length) return;

    // Đầu tiên chọn theo “trước mắt/ganh gần” như cũ
    const fallback = pickTarget(Game, unit);

    // Sau đó cho Statuses có quyền điều phối (taunt/allure…), nếu trả về null thì bỏ lượt
   
    const tgt = Statuses.resolveTarget(unit, pool, { attackType: 'basic' }) ?? fallback;
    if (!tgt) return;

    const passiveCtx = {
      target: tgt,
      damage: { baseMul: 1, flatAdd: 0 },
      afterHit: [],
      log: Game?.passiveLog
    };
    emitPassiveEvent(Game, unit, 'onBasicHit', passiveCtx);
   
     // VFX: tất cả basic đều step-in/out (1.8s), không dùng tracer
    const meleeDur = 1800;
    const meleeStartMs = performance.now();
    let meleeTriggered = false;
    try {
      vfxAddMelee(Game, unit, tgt, { dur: meleeDur });
      meleeTriggered = true;
    } catch (_) {}
    if (meleeTriggered && Game?.turn) {
      const prevBusy = Number.isFinite(Game.turn.busyUntil) ? Game.turn.busyUntil : 0;
      Game.turn.busyUntil = Math.max(prevBusy, meleeStartMs + meleeDur);
    }
   
    // Tính raw và modifiers trước giáp
    const dtype = 'physical';
    const rawBase = Math.max(1, Math.floor(unit.atk || 0));
    const modBase = Math.max(
      1,
      Math.floor(rawBase * (passiveCtx.damage?.baseMul ?? 1) + (passiveCtx.damage?.flatAdd ?? 0))
    );
    const pre = Statuses.beforeDamage(unit, tgt, { dtype, base: modBase, attackType: 'basic' });
    // OutMul (buff/debuff output)
    let dmg = Math.max(1, Math.floor(pre.base * pre.outMul));

    // Giáp/kháng có xuyên giáp (defPen)
    const def = Math.max(0, (tgt.arm ||0) * (1 - (pre.defPen ||0))); // dtype === 'physical'
    dmg = Math.max(0, Math.floor(dmg * (1 - def)));

    // InMul (giảm/tăng dmg nhận vào, stealth=0%)
    dmg = Math.max(0, Math.floor(dmg * pre.inMul));

    // Khiên hấp thụ
    const abs = Statuses.absorbShield(tgt, dmg, { dtype });

    // Trừ HP phần còn lại
    applyDamage(tgt, abs.remain);

    // VFX: hit ring tại target
    try { vfxAddHit(Game, tgt); } catch (_) {}
    // “Bất Khuất” (undying) — chết còn 1 HP (one-shot)
    if (tgt.hp <= 0) hookOnLethalDamage(tgt);
  const dealt = Math.max(0, Math.min(dmg, abs.remain || 0));
    // Hậu quả sau đòn: phản dmg, độc theo dealt, execute ≤10%…
    Statuses.afterDamage(unit, tgt, { dealt, absorbed: abs.absorbed, dtype });

    if (Array.isArray(passiveCtx.afterHit) && passiveCtx.afterHit.length){
      const afterCtx = { target: tgt, owner: unit, result: { dealt, absorbed: abs.absorbed } };
      for (const fn of passiveCtx.afterHit) {
        try {
          fn(afterCtx);
        } catch (err){
          console.error('[passive afterHit]', err);
        }
      }
    }
  }
   
  // Helper: basic + follow-ups trong cùng turn-step.
  // cap = số follow-up (không tính đòn thường). Không đẩy con trỏ lượt.
  function doBasicWithFollowups(Game, unit, cap = 2){
    try {
     // Đòn đánh thường đầu tiên
     basicAttack(Game, unit);
     // Đòn phụ
     const n = Math.max(0, cap|0);
    for (let i=0; i<n; i++){
       if (!unit || !unit.alive) break;
        basicAttack(Game, unit);
     }
    } catch(e){
      console.error('[doBasicWithFollowups]', e);
    }
  }

  exports.pickTarget = pickTarget;
  exports.computeDamage = computeDamage;
  exports.applyDamage = applyDamage;
  exports.dealAbilityDamage = dealAbilityDamage;
  exports.healUnit = healUnit;
  exports.grantShield = grantShield;
  exports.basicAttack = basicAttack;
  exports.doBasicWithFollowups = doBasicWithFollowups;
});
__define('./config.js', (exports, module, __require) => {
  // config.js v0.7.5
  const CFG = {
    GRID_COLS: 7,
    GRID_ROWS: 3,
    ALLY_COLS: 3,
    ENEMY_COLS: 3,
    COST_CAP: 30,
    SUMMON_LIMIT: 10,
   HAND_SIZE: 4,
  FOLLOWUP_CAP_DEFAULT: 2,

    // === AI tuning ===
    AI: {
      WEIGHTS: {
        pressure: 0.42,
        safety: 0.20,
        eta: 0.16,
        summon: 0.08,
        kitInstant: 0.06,
        kitDefense: 0.04,
        kitRevive: 0.04
      },
      ROW_CROWDING_PENALTY: 0.85,
      ROLE: {
        Tanker:   { front: 0.08, back: -0.04 },
        Warrior:  { front: 0.04, back:  0.00 },
        Ranger:   { front:-0.03, back:  0.06 },
        Mage:     { front:-0.02, back:  0.05 },
        Assassin: { front: 0.03, back: -0.03 },
        Support:  { front:-0.02, back:  0.03 },
        Summoner: { front: 0.00, back:  0.04, summonBoost: 0.05 }
      }, DEBUG: { KEEP_TOP: 6 }
    },

    // === UI constants (C2) ===
    UI: {                           // <-- bỏ dấu phẩy ở đầu
      PAD: 12,
      BOARD_MAX_W: 900,
      BOARD_MIN_H: 220,
      BOARD_H_RATIO: 3/7,
      CARD_GAP: 12,
      CARD_MIN: 40
    },                              // <-- thêm dấu phẩy ở đây
  // === Debug flags (W0-J1) ===
   DEBUG: {
     SHOW_QUEUED: true,        // vẽ unit "Chờ Lượt" cho phe mình (ally) khi có
     SHOW_QUEUED_ENEMY: false  // kẻ địch không thấy (đúng design)
   },
    COLORS: {
      ally: '#1e2b36',
      enemy: '#2a1c22',
      mid:  '#1c222a',
      line: '#24303c',
      tokenText: '#0d1216'
    },

    CAMERA: 'landscape_oblique'
  };

  // Camera presets (giữ nguyên)
  const CAM = {
    landscape_oblique: { rowGapRatio: 0.62, topScale: 0.80, depthScale: 0.94 },
    portrait_leader45: { rowGapRatio: 0.72, topScale: 0.86, depthScale: 0.96 }
  };
  // === Token render style ===
  const TOKEN_STYLE = 'chibi'; // 'chibi' | 'disk'

  // Proportions cho chibi (tính theo bán kính cơ sở r)
  const CHIBI = {
    // đường đậm hơn + tỉ lệ chibi mập mạp (đầu to, tay chân ngắn)
    line: 3,
    headR: 0.52,   // đầu to hơn
    torso: 0.70,   // thân ngắn hơn
    arm: 0.58,     // tay ngắn hơn
    leg: 0.68,     // chân ngắn hơn
    weapon: 0.78,  // vũ khí ngắn hơn để cân đối
    nameAlpha: 0.7
  };

  exports.CFG = CFG;
  exports.CAM = CAM;
  exports.TOKEN_STYLE = TOKEN_STYLE;
  exports.CHIBI = CHIBI;
});
__define('./engine.js', (exports, module, __require) => {
  const __dep0 = __require('./config.js');
  const TOKEN_STYLE = __dep0.TOKEN_STYLE;
  const CHIBI = __dep0.CHIBI;
  const CFG = __dep0.CFG;
  const __dep1 = __require('./art.js');
  const getUnitArt = __dep1.getUnitArt;
  //v0.7.3
  /* ---------- Grid ---------- */
  function makeGrid(canvas, cols, rows){
    const pad = CFG.UI?.PAD ?? 12;
    const w = Math.min(window.innerWidth - pad*2, CFG.UI?.BOARD_MAX_W ?? 900);
    const h = Math.max(
      Math.floor(w * (CFG.UI?.BOARD_H_RATIO ?? (3/7))),
      CFG.UI?.BOARD_MIN_H ?? 220
    );
    canvas.width = w; canvas.height = h;

    const usableW = w - pad * 2;
    const usableH = h - pad * 2;

    const tile = Math.floor(Math.min(usableW / cols, usableH / rows));

    const ox = Math.floor((w - tile*cols)/2);
    const oy = Math.floor((h - tile*rows)/2);
    return { cols, rows, tile, ox, oy, w, h, pad };
  }

  function hitToCell(g, px, py){
    const cx = Math.floor((px - g.ox) / g.tile);
    const cy = Math.floor((py - g.oy) / g.tile);
    if (cx<0 || cy<0 || cx>=g.cols || cy>=g.rows) return null;
    return { cx, cy };
  }

  /* ---------- Tokens ---------- */
  function drawTokens(ctx, g, tokens){
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    const fs = Math.floor(g.tile*0.28);

    tokens.forEach(t=>{
      const {x,y} = cellCenter(g, t.cx, t.cy);
      const r = Math.floor(g.tile*0.36);
      ctx.fillStyle = t.color; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = CFG.COLORS.tokenText; ctx.font = `${fs}px system-ui`;
      ctx.fillText(t.name, x, y);
    });
  }

  function cellOccupied(tokens, cx, cy){
    return tokens.some(t => t.cx === cx && t.cy === cy);
  }

  // queued: { ally:Map(slot→PendingUnit), enemy:Map(...) }
  function cellReserved(tokens, queued, cx, cy){
    // 1) Active đang đứng
    if (cellOccupied(tokens, cx, cy)) return true;
    // 2) Queued (đã trừ cost, đang mờ)
    if (queued){
      const checkQ = (m)=> {
        if (!m || typeof m.values !== 'function') return false;
        for (const p of m.values()){
        if (!p) continue;
          if (p.cx === cx && p.cy === cy) return true;
        }
        return false;
      };
      if (checkQ(queued.ally))  return true;
      if (checkQ(queued.enemy)) return true;
    }
    return false;
  }

  function spawnLeaders(tokens, g){
    // Ally leader ở (0,1), Enemy leader ở (6,1)
    tokens.push({ id:'leaderA', name:'Uyên', color:'#6cc8ff', cx:0, cy:1, side:'ally', alive:true, art: getUnitArt('leaderA') });
    tokens.push({ id:'leaderB', name:'Địch', color:'#ff9aa0', cx:g.cols-1, cy:1, side:'enemy', alive:true, art: getUnitArt('leaderB') });
  }

  /* ---------- Helper ---------- */
  function pickRandom(pool, excludeSet, n = 4){
    const remain = pool.filter(u => !excludeSet.has(u.id));
    for (let i=remain.length-1;i>0;i--){
     const j = (Math.random()*(i+1))|0; const t = remain[i]; remain[i]=remain[j]; remain[j]=t;
   }
   return remain.slice(0, n);
  }
  // Giữ alias cũ (nếu có file nào khác còn import)
  const pick3Random = (pool, ex) => pickRandom(pool, ex, 3);
  // === Grid nghiêng kiểu hình thang (không bị crop) ===

  // Biên trái/phải của một "đường hàng" r (cho phép số thực)
  // r = 0 là đỉnh trên, r = g.rows là đáy
  function _rowLR(g, r, C){
    const colsW = g.tile * g.cols;
    const topScale = C.topScale ?? 0.80;           // 0.75..0.90
    const pinch = (1 - topScale) * colsW;          // lượng "bóp" ở đỉnh
    const t = r / g.rows;                           // 0..1 từ trên xuống dưới
    const width = colsW - pinch * (1 - t);         // càng lên trên càng hẹp
    const left  = g.ox + (colsW - width) / 2;      // cân giữa
    const right = left + width;
    return { left, right };
  }

  function drawGridOblique(ctx, g, cam, opts = {}){
    const C = cam || { rowGapRatio:0.62, topScale:0.80, depthScale:0.94 };
    const colors = Object.assign({}, CFG.COLORS, opts.colors||{});
    const rowGap = (C.rowGapRatio ?? 0.62) * g.tile;

    ctx.clearRect(0, 0, g.w, g.h);

    for (let cy=0; cy<g.rows; cy++){
      const yTop = g.oy + cy*rowGap;
      const yBot = g.oy + (cy+1)*rowGap;
      const LRt = _rowLR(g, cy,   C);
      const LRb = _rowLR(g, cy+1, C);

      for (let cx=0; cx<g.cols; cx++){
        // chia đều theo tỉ lệ trên mỗi cạnh
        const xtL = LRt.left +  (cx    / g.cols) * (LRt.right - LRt.left);
        const xtR = LRt.left +  ((cx+1)/ g.cols) * (LRt.right - LRt.left);
        const xbL = LRb.left +  (cx    / g.cols) * (LRb.right - LRb.left);
        const xbR = LRb.left +  ((cx+1)/ g.cols) * (LRb.right - LRb.left);

        // màu theo phe
        let fill;
        if (cx < CFG.ALLY_COLS) fill = colors.ally;
        else if (cx >= g.cols - CFG.ENEMY_COLS) fill = colors.enemy;
        else fill = colors.mid;

        ctx.beginPath();
        ctx.moveTo(xtL, yTop);   // TL
        ctx.lineTo(xtR, yTop);   // TR
        ctx.lineTo(xbR, yBot);   // BR
        ctx.lineTo(xbL, yBot);   // BL
        ctx.closePath();
        ctx.fillStyle = fill; ctx.fill();
        ctx.strokeStyle = colors.line; ctx.lineWidth = 1; ctx.stroke();
      }
    }
  }

  // Hit-test ngược theo hình thang
  function hitToCellOblique(g, px, py, cam){
    const C = cam || { rowGapRatio:0.62, topScale:0.80 };
    const rowGap = (C.rowGapRatio ?? 0.62) * g.tile;

    const r = (py - g.oy) / rowGap;           // chỉ số hàng dạng thực
    if (r < 0 || r >= g.rows) return null;

    const LR = _rowLR(g, r, C);
    const u = (px - LR.left) / (LR.right - LR.left);  // 0..1 trên bề ngang tại hàng r
    if (u < 0 || u >= 1) return null;

    const cx = Math.floor(u * g.cols);
    const cy = Math.floor(r);
    return { cx, cy };
  }
  // Bốn đỉnh của ô (cx,cy) trong lưới hình thang + tâm ô
  function _cellQuadOblique(g, cx, cy, C){
    const rowGap = (C.rowGapRatio ?? 0.62) * g.tile;
    const yTop = g.oy + cy * rowGap;
    const yBot = yTop + rowGap;
    const LRt = _rowLR(g, cy,   C);
    const LRb = _rowLR(g, cy+1, C);

    const xtL = LRt.left +  (cx    / g.cols) * (LRt.right - LRt.left);
    const xtR = LRt.left +  ((cx+1)/ g.cols) * (LRt.right - LRt.left);
    const xbL = LRb.left +  (cx    / g.cols) * (LRb.right - LRb.left);
    const xbR = LRb.left +  ((cx+1)/ g.cols) * (LRb.right - LRb.left);
    return { xtL, xtR, xbL, xbR, yTop, yBot };
  }

  function _cellCenterOblique(g, cx, cy, C){
    const q = _cellQuadOblique(g, cx, cy, C);
    const x = (q.xtL + q.xtR + q.xbL + q.xbR) / 4;
    const y = (q.yTop + q.yBot) / 2;
    return { x, y };
  }

  // --- Optional oblique rendering (non-breaking) ---
  function projectCellOblique(g, cx, cy, cam){
    const rowGap = (cam?.rowGapRatio ?? 0.62) * g.tile;
    const skew   = (cam?.skewXPerRow ?? 0.28) * g.tile;
    const k      =  (cam?.depthScale  ?? 0.94);
    // cy: 0=trên (xa), 2=dưới (gần)
    const depth  = (g.rows - 1 - cy);
    const scale  = Math.pow(k, depth);
    const x = g.ox + (cx + 0.5) * g.tile + cy * skew;
    const y = g.oy + (cy + 0.5) * rowGap;
    return { x, y, scale };
  }
  function drawChibi(ctx, x, y, r, facing = 1, color = '#a9f58c') {
    const lw = Math.max(CHIBI.line, Math.floor(r * 0.28));
    const hr = Math.max(3, Math.floor(r * CHIBI.headR));
    const torso = r * CHIBI.torso;
    const arm = r * CHIBI.arm;
    const leg = r * CHIBI.leg;
    const wep = r * CHIBI.weapon;

    ctx.save();
    ctx.translate(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lw;

    // đầu
    ctx.beginPath();
    ctx.arc(0, -torso - hr, hr, 0, Math.PI * 2);
    ctx.stroke();

    // thân
    ctx.beginPath();
    ctx.moveTo(0, -torso);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // tay
    ctx.beginPath();
    ctx.moveTo(0, -torso * 0.6);
    ctx.lineTo(-arm * 0.8, -torso * 0.2);             // tay sau
    ctx.moveTo(0, -torso * 0.6);
    ctx.lineTo(arm * 0.8 * facing, -torso * 0.2);     // tay cầm kiếm
    ctx.stroke();

    // chân
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-leg * 0.6, leg * 0.9);
    ctx.moveTo(0, 0);
    ctx.lineTo(leg * 0.6, leg * 0.9);
    ctx.stroke();

    // kiếm
    const hx = arm * 0.8 * facing, hy = -torso * 0.2;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx + wep * facing, hy);
    ctx.stroke();

    ctx.restore();
  }

  const SPRITE_CACHE = new Map();
  const ART_SPRITE_EVENT = 'unit-art:sprite-loaded';

  function ensureTokenArt(token){
    if (!token) return null;
    if (!token.art) token.art = getUnitArt(token.id);
    return token.art;
  }

  function ensureSpriteLoaded(art){
    if (!art || !art.sprite || typeof Image === 'undefined') return null;
    let entry = SPRITE_CACHE.get(art.sprite);
    if (!entry){
      const img = new Image();
      entry = { status: 'loading', img };
      if ('decoding' in img) img.decoding = 'async';
      img.onload = ()=>{
        entry.status = 'ready';
        if (typeof window !== 'undefined'){
          try {
            window.dispatchEvent(new Event(ART_SPRITE_EVENT));
          } catch(_){}
        }
      };
      img.onerror = ()=>{ entry.status = 'error'; };
      img.src = art.sprite;
      SPRITE_CACHE.set(art.sprite, entry);
    }
    return entry;
  }

  function drawStylizedShape(ctx, width, height, anchor, art){
    const palette = art?.palette || {};
    const primary = palette.primary || '#86c4ff';
    const secondary = palette.secondary || '#1f3242';
    const accent = palette.accent || '#d2f4ff';
    const outline = palette.outline || 'rgba(0,0,0,0.55)';
    const top = -height * anchor;
    const bottom = height - height * anchor;
    const halfW = width / 2;
    const shape = art?.shape || 'sentinel';
    const gradient = ctx.createLinearGradient(0, top, 0, bottom);
    gradient.addColorStop(0, primary);
    gradient.addColorStop(1, secondary);

    ctx.save();
    ctx.beginPath();
    switch(shape){
      case 'wing': {
        ctx.moveTo(-halfW * 0.92, bottom * 0.35);
        ctx.quadraticCurveTo(-halfW * 1.05, top + height * 0.1, 0, top);
        ctx.quadraticCurveTo(halfW * 1.05, top + height * 0.2, halfW * 0.9, bottom * 0.4);
        ctx.quadraticCurveTo(halfW * 0.45, bottom * 0.92, 0, bottom);
        ctx.quadraticCurveTo(-halfW * 0.4, bottom * 0.86, -halfW * 0.92, bottom * 0.35);
        break;
      }
      case 'rune': {
        ctx.moveTo(0, top);
        ctx.lineTo(halfW, top + height * 0.42);
        ctx.lineTo(0, bottom);
        ctx.lineTo(-halfW, top + height * 0.42);
        break;
      }
      case 'bloom': {
        ctx.moveTo(0, top);
        ctx.bezierCurveTo(halfW * 0.8, top + height * 0.05, halfW * 1.05, top + height * 0.45, halfW * 0.78, bottom * 0.38);
        ctx.bezierCurveTo(halfW * 0.68, bottom * 0.92, halfW * 0.2, bottom, 0, bottom);
        ctx.bezierCurveTo(-halfW * 0.2, bottom, -halfW * 0.68, bottom * 0.92, -halfW * 0.78, bottom * 0.38);
        ctx.bezierCurveTo(-halfW * 1.05, top + height * 0.45, -halfW * 0.8, top + height * 0.05, 0, top);
        break;
      }
      case 'pike': {
        ctx.moveTo(0, top);
        ctx.lineTo(halfW * 0.92, top + height * 0.32);
        ctx.lineTo(halfW * 0.52, bottom);
        ctx.lineTo(-halfW * 0.52, bottom);
        ctx.lineTo(-halfW * 0.92, top + height * 0.32);
        break;
      }
      case 'shield':
      case 'sentinel':
      default: {
        ctx.moveTo(0, top);
        ctx.bezierCurveTo(halfW, top + height * 0.22, halfW * 0.85, bottom * 0.16, 0, bottom);
        ctx.bezierCurveTo(-halfW * 0.85, bottom * 0.16, -halfW, top + height * 0.22, 0, top);
        break;
      }
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.lineWidth = Math.max(2, width * 0.06);
    ctx.strokeStyle = outline;
    ctx.stroke();

    ctx.globalAlpha = 0.35;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(-halfW * 0.58, top + height * 0.22);
    ctx.quadraticCurveTo(0, top + height * 0.05, halfW * 0.58, top + height * 0.22);
    ctx.quadraticCurveTo(halfW * 0.2, top + height * 0.32, 0, top + height * 0.28);
    ctx.quadraticCurveTo(-halfW * 0.2, top + height * 0.32, -halfW * 0.58, top + height * 0.22);
    ctx.fill();
    ctx.restore();
  }

  function roundedRectPath(ctx, x, y, w, h, radius){
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function formatName(text){
    if (!text) return '';
    const str = String(text);
    if (str.length <= 16) return str;
    return `${str.slice(0, 15)}…`;
  }

  function drawNameplate(ctx, text, x, y, r, art){
    if (!text) return;
    const layout = art?.layout || {};
    const fontSize = Math.max(11, Math.floor(r * (layout.labelFont || 0.7)));
    const padX = Math.max(8, Math.floor(fontSize * 0.6));
    const padY = Math.max(4, Math.floor(fontSize * 0.35));
    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.font = `${fontSize}px 'Be Vietnam Pro', 'Inter', system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const metrics = ctx.measureText(text);
    const width = Math.ceil(metrics.width + padX * 2);
    const height = Math.ceil(fontSize + padY * 2);
    const radius = Math.max(4, Math.floor(height / 2));
    const boxX = Math.round(x - width / 2);
    const boxY = Math.round(y - height / 2);
    roundedRectPath(ctx, boxX, boxY, width, height, radius);
    ctx.fillStyle = art?.label?.bg || 'rgba(12,20,30,0.82)';
    ctx.fill();
    if (art?.label?.stroke){
      ctx.strokeStyle = art.label.stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.fillStyle = art?.label?.text || '#f4f8ff';
    ctx.fillText(text, x, boxY + height / 2);
    ctx.restore();
    }
  function drawTokensOblique(ctx, g, tokens, cam){
    const C = cam || { rowGapRatio: 0.62, topScale: 0.80, depthScale: 0.94 };
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const baseR = Math.floor(g.tile * 0.36);
    const k = C.depthScale ?? 0.94; // scale theo chiều sâu

    // Vẽ xa trước – gần sau theo tung độ tâm-ô
    const sorted = tokens.slice().sort((a,b)=>{
      const ya = _cellCenterOblique(g, a.cx, a.cy, C).y;
      const yb = _cellCenterOblique(g, b.cx, b.cy, C).y;
      return ya === yb ? a.cx - b.cx : ya - yb;
    });
      for (const t of sorted){
      if (!t.alive) continue; // chết là thôi vẽ ngay
      const p = _cellCenterOblique(g, t.cx, t.cy, C);
      const depth = g.rows - 1 - t.cy;
      const scale = Math.pow(k, depth);
      const r = Math.max(6, Math.floor(baseR * scale));
      const facing = (t.side === 'ally') ? 1 : -1;
        
  const art = ensureTokenArt(t) || getUnitArt(t.id);
      const layout = art?.layout || {};
      const spriteHeightMult = layout.spriteHeight || 2.4;
      const spriteAspect = layout.spriteAspect || 0.78;
      const spriteHeight = r * spriteHeightMult * (art?.size ?? 1);
      const spriteWidth = spriteHeight * spriteAspect;
      const anchor = layout.anchor ?? 0.78;
      const hasRichArt = !!(art && (art.sprite || art.shape));

      if (hasRichArt){
        const spriteEntry = ensureSpriteLoaded(art);
        const spriteReady = spriteEntry && spriteEntry.status === 'ready';
        ctx.save();
        ctx.translate(p.x, p.y);
        if (facing === -1 && art?.mirror !== false) ctx.scale(-1, 1);
        ctx.shadowColor = art?.glow || art?.shadow || 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = Math.max(6, r * 0.7);
        ctx.shadowOffsetY = Math.max(2, r * 0.2);
        if (spriteReady){
          ctx.drawImage(spriteEntry.img, -spriteWidth/2, -spriteHeight*anchor, spriteWidth, spriteHeight);
        } else {
          drawStylizedShape(ctx, spriteWidth, spriteHeight, anchor, art);
        }
        ctx.restore();
        } else if (TOKEN_STYLE === 'chibi') {
        drawChibi(ctx, p.x, p.y, r, facing, t.color || '#9adcf0');
      } else {
        ctx.fillStyle = t.color || '#9adcf0';
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI*2);
        ctx.fill();
      }

      if (art?.label !== false){
        const name = formatName(t.name || t.id);
        const offset = layout.labelOffset ?? 1.2;
        drawNameplate(ctx, name, p.x, p.y + r * offset, r, art);
      }
    }
  }
   
  // (W2-J2) Vẽ “Chờ Lượt” – silhouette mờ/tối, chỉ hiển thị theo flag DEBUG
  function drawQueuedOblique(ctx, g, queued, cam){
   if (!queued) return;
   const C = cam || { rowGapRatio: 0.62, topScale: 0.80, depthScale: 0.94 };
   const baseR = Math.floor(g.tile * 0.36);
   const k = C.depthScale ?? 0.94;

   function drawSide(map, side){
    if (!map) return;
     // Ally thấy theo SHOW_QUEUED; enemy ẩn trừ khi bật SHOW_QUEUED_ENEMY
    if (side === 'ally'  && !(CFG.DEBUG?.SHOW_QUEUED)) return;
     if (side === 'enemy' && !(CFG.DEBUG?.SHOW_QUEUED_ENEMY)) return;
     for (const p of map.values()){
      const c = _cellCenterOblique(g, p.cx, p.cy, C);
      const depth = g.rows - 1 - p.cy;
      const r = Math.max(6, Math.floor(baseR * Math.pow(k, depth)));
       ctx.save();
       ctx.globalAlpha = 0.5;          // mờ/tối
      ctx.fillStyle = p.color || '#5b6a78';
       ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
   }
    drawSide(queued.ally,  'ally');
    drawSide(queued.enemy, 'enemy');
  }

  /* ---------- TURN/ZONE HELPERS (W1-J1) ---------- */
  const SIDE = { ALLY: 'ally', ENEMY: 'enemy' };

  // Trả về chỉ số lượt 1..9 của ô (cx,cy) theo phe
  function slotIndex(side, cx, cy){
    if (side === SIDE.ALLY || side === 'ally'){
     // Ally: c=2 → 1..3 (trên→dưới), c=1 → 4..6, c=0 → 7..9
      return (CFG.ALLY_COLS - 1 - cx) * 3 + (cy + 1);
   } else {
     // Enemy: c=4 → 1..3 (dưới→trên), c=5 → 4..6, c=6 → 7..9
     const enemyStart = CFG.GRID_COLS - CFG.ENEMY_COLS; // 7-3=4
     const colIndex = cx - enemyStart;                   // 0..2
     return colIndex * 3 + (3 - cy);
    }
  }

  // Ngược lại: từ slot (1..9) suy ra (cx,cy) theo phe
  function slotToCell(side, slot){
   const s = Math.max(1, Math.min(9, slot|0));
   const colIndex = Math.floor((s - 1) / 3); // 0..2 (gần mid → xa)
    const rowIndex = (s - 1) % 3;             // 0..2
   if (side === SIDE.ALLY || side === 'ally'){
     const cx = (CFG.ALLY_COLS - 1) - colIndex; // 2,1,0
     const cy = rowIndex;                       // 0..2 (trên→dưới)
    return { cx, cy };
    } else {
      const enemyStart = CFG.GRID_COLS - CFG.ENEMY_COLS; // 4
     const cx = enemyStart + colIndex;                  // 4,5,6
      const cy = 2 - rowIndex;                           // 2,1,0 (dưới→trên)
     return { cx, cy };
   }
  }

  // Gán nhãn “mã vùng” cho AI/AoE (A1..A9 | E1..E9) hoặc mã số tileId
  function zoneCode(side, cx, cy, { numeric=false } = {}){
    const slot = slotIndex(side, cx, cy);
    if (numeric) return (side === SIDE.ALLY || side === 'ally' ? 0 : 1) * 16 + slot;
   const pfx = (side === SIDE.ALLY || side === 'ally') ? 'A' : 'E';
    return pfx + String(slot);
  }

  // Bảng tra cứu thuận tiện (chưa dùng nhưng hữu ích cho AI/visual debug)
  const ORDER_ALLY  = Array.from({length:9}, (_,i)=> slotToCell(SIDE.ALLY,  i+1));
  const ORDER_ENEMY = Array.from({length:9}, (_,i)=> slotToCell(SIDE.ENEMY, i+1));

  exports.pick3Random = pick3Random;
  exports.ART_SPRITE_EVENT = ART_SPRITE_EVENT;
  exports.SIDE = SIDE;
  exports.ORDER_ALLY = ORDER_ALLY;
  exports.ORDER_ENEMY = ORDER_ENEMY;
  exports.makeGrid = makeGrid;
  exports.hitToCell = hitToCell;
  exports.drawTokens = drawTokens;
  exports.cellOccupied = cellOccupied;
  exports.cellReserved = cellReserved;
  exports.spawnLeaders = spawnLeaders;
  exports.pickRandom = pickRandom;
  exports.drawGridOblique = drawGridOblique;
  exports.hitToCellOblique = hitToCellOblique;
  exports.projectCellOblique = projectCellOblique;
  exports.drawTokensOblique = drawTokensOblique;
  exports.drawQueuedOblique = drawQueuedOblique;
  exports.slotIndex = slotIndex;
  exports.slotToCell = slotToCell;
  exports.zoneCode = zoneCode;
});
__define('./entry.js', (exports, module, __require) => {
  const __dep0 = __require('./main.js');
  const startGame = __dep0.startGame;

  const SUCCESS_EVENT = 'arclune:loaded';

  function dispatchLoaded(){
    try {
      window.dispatchEvent(new Event(SUCCESS_EVENT));
    } catch (err) {
      console.warn('Unable to dispatch load event', err);
    }
  }

  function ensureRenderer(){
    if (typeof window.arcluneRenderMessage === 'function'){
      return window.arcluneRenderMessage;
    }
    return (options = {}) => {
      const { title = 'Arclune', body = '' } = options;
      const wrapper = document.createElement('div');
      wrapper.style.maxWidth = '640px';
      wrapper.style.margin = '48px auto';
      wrapper.style.padding = '32px';
      wrapper.style.background = 'rgba(12,18,24,0.85)';
      wrapper.style.border = '1px solid #2a3a4a';
      wrapper.style.borderRadius = '16px';
      wrapper.style.textAlign = 'center';
      wrapper.style.lineHeight = '1.6';
      wrapper.innerHTML = `
        <h2 style="margin-top:0;color:#ffe066;">${title}</h2>
        ${body}
      `;
      document.body.innerHTML = '';
      document.body.appendChild(wrapper);
    };
  }

  function resolveErrorMessage(error, fallback = 'Lỗi không xác định.'){
    if (error && typeof error === 'object' && 'message' in error){
      return String(error.message);
    }
    const value = typeof error === 'undefined' || error === null ? '' : String(error);
    return value.trim() ? value : fallback;
  }

  function showFileProtocolWarning(renderMessage, error){
    const detail = typeof error === 'undefined' ? '' : resolveErrorMessage(error);
    const detailMarkup = detail
      ? `<p style="margin-top:16px;"><small>Lỗi gốc: ${detail}</small></p>`
      : '';
    const body = `
      <p>Vui lòng khởi chạy Arclune thông qua một HTTP server thay vì mở trực tiếp từ ổ đĩa.</p>
      <p>Ví dụ: chạy <code>npx serve</code> hoặc bất kỳ server tĩnh nào khác rồi truy cập qua <code>http://localhost:*</code>.</p>
      ${detailMarkup}
      `;
    renderMessage({
      title: 'Không thể chạy từ file://',
      body
    });
  }

  function showFatalError(error, renderMessage){
    const detail = resolveErrorMessage(error);
    renderMessage({
      title: 'Không thể khởi động Arclune',
      body: `<p>${detail}</p>`
    });
  }

  (function bootstrap(){
    const renderMessage = ensureRenderer();
    const protocol = window?.location?.protocol;
    const isFileProtocol = protocol === 'file:';
    try {
      startGame();
      dispatchLoaded();
    } catch (error) {
      console.error('Arclune failed to start', error);
      if (typeof window.arcluneShowFatal === 'function'){
        window.arcluneShowFatal(error);
        } else if (isFileProtocol) {
        showFileProtocolWarning(renderMessage, error);
      } else {
        showFatalError(error, renderMessage);
      }
    }
  })();

});
__define('./events.js', (exports, module, __require) => {
  // events.js
  const HAS_EVENT_TARGET = typeof EventTarget === 'function';

  class SimpleEventTarget {
    constructor(){
      this._map = new Map();
    }
    addEventListener(type, handler){
      if (!type || typeof handler !== 'function') return;
      const list = this._map.get(type) || [];
      list.push(handler);
      this._map.set(type, list);
    }
    removeEventListener(type, handler){
      if (!type || typeof handler !== 'function') return;
      const list = this._map.get(type);
      if (!list || !list.length) return;
      const idx = list.indexOf(handler);
      if (idx >= 0){
        list.splice(idx, 1);
        if (!list.length) this._map.delete(type);
        else this._map.set(type, list);
      }
    }
    dispatchEvent(event){
      if (!event || !event.type) return false;
      const list = this._map.get(event.type);
      if (!list || !list.length) return true;
      for (const handler of [...list]){
        try {
          handler.call(this, event);
        } catch (err) {
          console.error('[events]', err);
        }
      }
      return true;
    }
  }

  function makeEventTarget(){
    if (!HAS_EVENT_TARGET) return new SimpleEventTarget();
    try {
      const target = new EventTarget();
      const probeType = '__probe__';
      let handled = false;
      const handler = () => { handled = true; };
      if (typeof target.addEventListener === 'function'){
        target.addEventListener(probeType, handler);
        try {
          const probeEvent = typeof Event === 'function' ? new Event(probeType) : { type: probeType };
          if (typeof target.dispatchEvent === 'function'){
            target.dispatchEvent(probeEvent);
          }
        } finally {
          if (typeof target.removeEventListener === 'function'){
            target.removeEventListener(probeType, handler);
          }
        }
      }
      if (handled) return target;
    } catch (err) {
      console.warn('[events] Falling back to SimpleEventTarget:', err);
    }
    return new SimpleEventTarget();
  }

  function makeEvent(type, detail){
    if (typeof CustomEvent === 'function'){
      return new CustomEvent(type, { detail });
    }
    if (typeof Event === 'function'){
      const ev = new Event(type);
      ev.detail = detail;
      return ev;
    }
    return { type, detail };
  }

  const TURN_START = 'turn:start';
  const TURN_END = 'turn:end';
  const ACTION_START = 'action:start';
  const ACTION_END = 'action:end';

  const gameEvents = makeEventTarget();

  function emitGameEvent(type, detail){
    if (!type || !gameEvents) return false;
    const event = makeEvent(type, detail);
    try {
      if (typeof gameEvents.dispatchEvent === 'function'){
        return gameEvents.dispatchEvent(event);
      }
      if (typeof gameEvents.emit === 'function'){
        gameEvents.emit(type, detail);
        return true;
      }
    } catch (err) {
      console.error('[events]', err);
    }
    return false;
  }

  exports.TURN_START = TURN_START;
  exports.TURN_END = TURN_END;
  exports.ACTION_START = ACTION_START;
  exports.ACTION_END = ACTION_END;
  exports.gameEvents = gameEvents;
  exports.emitGameEvent = emitGameEvent;
});
__define('./main.js', (exports, module, __require) => {
  //v0.7.6
  const __dep1 = __require('./turns.js');
  const stepTurn = __dep1.stepTurn;
  const doActionOrSkip = __dep1.doActionOrSkip;
  const __dep2 = __require('./summon.js');
  const enqueueImmediate = __dep2.enqueueImmediate;
  const processActionChain = __dep2.processActionChain;
  const __dep3 = __require('./ai.js');
  const refillDeckEnemy = __dep3.refillDeckEnemy;
  const aiMaybeAct = __dep3.aiMaybeAct;
  const __dep4 = __require('./statuses.js');
  const Statuses = __dep4.Statuses;
  const __dep5 = __require('./config.js');
  const CFG = __dep5.CFG;
  const CAM = __dep5.CAM;
  const __dep6 = __require('./units.js');
  const UNITS = __dep6.UNITS;
  const __dep7 = __require('./meta.js');
  const Meta = __dep7.Meta;
  const makeInstanceStats = __dep7.makeInstanceStats;
  const initialRageFor = __dep7.initialRageFor;
  const __dep8 = __require('./combat.js');
  const basicAttack = __dep8.basicAttack;
  const pickTarget = __dep8.pickTarget;
  const dealAbilityDamage = __dep8.dealAbilityDamage;
  const healUnit = __dep8.healUnit;
  const grantShield = __dep8.grantShield;
  const applyDamage = __dep8.applyDamage;
  const __dep9 = __require('./catalog.js');
  const ROSTER = __dep9.ROSTER;
  const ROSTER_MAP = __dep9.ROSTER_MAP;
  const CLASS_BASE = __dep9.CLASS_BASE;
  const RANK_MULT = __dep9.RANK_MULT;
  const getMetaById = __dep9.getMetaById;
  const isSummoner = __dep9.isSummoner;
  const applyRankAndMods = __dep9.applyRankAndMods;
  const __dep10 = __require('./engine.js');
  const makeGrid = __dep10.makeGrid;
  const drawGridOblique = __dep10.drawGridOblique;
  const drawTokensOblique = __dep10.drawTokensOblique;
  const drawQueuedOblique = __dep10.drawQueuedOblique;
  const hitToCellOblique = __dep10.hitToCellOblique;
  const projectCellOblique = __dep10.projectCellOblique;
  const cellOccupied = __dep10.cellOccupied;
  const spawnLeaders = __dep10.spawnLeaders;
  const pickRandom = __dep10.pickRandom;
  const slotIndex = __dep10.slotIndex;
  const slotToCell = __dep10.slotToCell;
  const cellReserved = __dep10.cellReserved;
  const ORDER_ENEMY = __dep10.ORDER_ENEMY;
  const ART_SPRITE_EVENT = __dep10.ART_SPRITE_EVENT;
  const __dep11 = __require('./art.js');
  const getUnitArt = __dep11.getUnitArt;
  const __dep12 = __require('./ui.js');
  const initHUD = __dep12.initHUD;
  const startSummonBar = __dep12.startSummonBar;
  const __dep13 = __require('./vfx.js');
  const vfxDraw = __dep13.vfxDraw;
  const vfxAddSpawn = __dep13.vfxAddSpawn;
  const vfxAddHit = __dep13.vfxAddHit;
  const vfxAddMelee = __dep13.vfxAddMelee;
  const __dep14 = __require('./events.js');
  const gameEvents = __dep14.gameEvents;
  const TURN_START = __dep14.TURN_START;
  const TURN_END = __dep14.TURN_END;
  const ACTION_START = __dep14.ACTION_START;
  const ACTION_END = __dep14.ACTION_END;
  /** @type {HTMLCanvasElement|null} */ let canvas = null;
  /** @type {CanvasRenderingContext2D|null} */ let ctx = null;
  /** @type {{update:(g:any)=>void}|null} */ let hud = null;   // ← THÊM
  const CAM_PRESET = CAM[CFG.CAMERA] || CAM.landscape_oblique;
  const HAND_SIZE  = CFG.HAND_SIZE ?? 4;

  // --- Instance counters (để gắn id cho token/minion) ---
  let _IID = 1;
  let _BORN = 1;
  const nextIid = ()=> _IID++;

  const Game = {
    grid: null,
    tokens: [],
    cost: 0, costCap: CFG.COST_CAP,
    summoned: 0, summonLimit: CFG.SUMMON_LIMIT,

    // deck-3 + quản lý “độc nhất”
    unitsAll: UNITS,
    usedUnitIds: new Set(),       // những unit đã ra sân
    deck3: [],                    // mảng 3 unit
    selectedId: null,
    ui: { bar: null },
    turn: { phase: 'ally', last: { ally: 0, enemy: 0 }, cycle: 0, busyUntil: 0 },
      queued: { ally: new Map(), enemy: new Map() },
    actionChain: [],
    events: gameEvents
  };
  // --- Enemy AI state (deck-4, cost riêng) ---
  Game.ai = {
   cost: 0, costCap: CFG.COST_CAP, summoned: 0, summonLimit: CFG.SUMMON_LIMIT,
    unitsAll: UNITS, usedUnitIds: new Set(), deck: [], selectedId: null,
    lastThinkMs: 0, lastDecision: null
  };
  Game.meta = Meta;

  if (CFG?.DEBUG?.LOG_EVENTS) {
    const logEvent = (type) => (ev)=>{
      const detail = ev?.detail || {};
      const unit = detail.unit;
      const info = {
        side: detail.side ?? null,
        slot: detail.slot ?? null,
        cycle: detail.cycle ?? null,
        phase: detail.phase ?? null,
        unit: unit?.id || unit?.name || null,
        action: detail.action || null,
        skipped: detail.skipped || false,
        reason: detail.reason || null,
        processedChain: detail.processedChain ?? null
      };
      console.debug(`[events] ${type}`, info);
    };
    const types = [TURN_START, TURN_END, ACTION_START, ACTION_END];
    for (const type of types){
      try {
        gameEvents.addEventListener(type, logEvent(type));
      } catch (err) {
        console.error('[events]', err);
      }
    }
  }

  let drawFrameHandle = null;
  let drawPending = false;
  let drawPaused = false;

  function cancelScheduledDraw(){
    if (drawFrameHandle !== null){
      cancelAnimationFrame(drawFrameHandle);
      drawFrameHandle = null;
    }
    drawPending = false;
  }

  function scheduleDraw(){
    if (drawPaused) return;
    if (drawPending) return;
    if (!canvas || !ctx) return;
    drawPending = true;
    drawFrameHandle = requestAnimationFrame(()=>{
      drawFrameHandle = null;
      drawPending = false;
      if (drawPaused) return;
      try {
        draw();
      } catch (err) {
        console.error('[draw]', err);
      }
      if (Game?.vfx && Game.vfx.length) scheduleDraw();
    });
  }

  function setDrawPaused(paused){
    drawPaused = !!paused;
    if (drawPaused){
      cancelScheduledDraw();
    } else {
      scheduleDraw();
    }
  }
  if (typeof window !== 'undefined'){
    window.addEventListener(ART_SPRITE_EVENT, ()=>{ scheduleDraw(); });
  }
  // Master clock theo timestamp – tránh drift giữa nhiều interval
  const CLOCK = {
    startMs: performance.now(),
    lastTimerRemain: 240,
    lastCostCreditedSec: 0, turnEveryMs: 600,
    lastTurnStepMs: performance.now()
  };

  // Xác chết chờ vanish (để sau này thay bằng dead-animation)
  const DEATH_VANISH_MS = 900;
  function cleanupDead(now){
    const keep = [];
    for (const t of Game.tokens){
      if (t.alive) { keep.push(t); continue; }
      const t0 = t.deadAt || 0;
      if (!t0) { keep.push(t); continue; }                 // phòng hờ
      if (now - t0 < DEATH_VANISH_MS) { keep.push(t); }    // còn “thây”
      // else: bỏ hẳn khỏi mảng -> không vẽ, không chặn ô
    }
    Game.tokens = keep;
  }
  /* ---------- META-GATED HELPERS (W4-J4) ---------- */
  function neighborSlotsVertical(slot){
    const res = [];
    const row = (slot - 1) % 3;      // 0=trên,1=giữa,2=dưới
    if (row > 0) res.push(slot - 1); // phía trên
    if (row < 2) res.push(slot + 1); // phía dưới
    return res;
  }
   
  // Liệt kê ô trống hợp lệ của phe enemy theo thứ tự 1→9 (sớm→muộn)
  function listEmptyEnemySlots(){
   const out = [];
   for (let s = 1; s <= 9; s++){
     const { cx, cy } = slotToCell('enemy', s);
      if (!cellReserved(tokensAlive(), Game.queued, cx, cy)) out.push({ s, cx, cy });
    }
   return out;
  }
  // ETA score: ra trong chu kỳ hiện tại = 1.0; phải đợi chu kỳ sau = 0.5
  function etaScoreEnemy(slot){
   const last = Game.turn.last.enemy || 0;
   if (Game.turn.phase === 'enemy' && slot > last) return 1.0;
   return 0.5;
  }
  // Áp lực lên leader đối phương (ally leader ở cx=0,cy=1) – gần hơn = điểm cao
  function pressureScore(cx, cy){
   const dist = Math.abs(cx - 0) + Math.abs(cy - 1);
   return 1 - Math.min(1, dist / 7); // 0..1
  }

  // Độ an toàn sơ bộ: ít đồng minh (phe ta) cùng hàng, ít bị kẹp cự ly ngắn
  function safetyScore(cx, cy){
    const foes = tokensAlive().filter(t => t.side === 'ally');
    const sameRow = foes.filter(t => t.cy === cy);
    const near = sameRow.filter(t => Math.abs(t.cx - cx) <= 1).length;
   const far  = sameRow.length - near;
   // nhiều địch ở gần -> nguy hiểm (điểm thấp)
   return Math.max(0, Math.min(1, 1 - (near*0.6 + far*0.2)/3));
  }

  function summonerFeasibility(unitId, baseSlot){
   const meta = Game.meta.get(unitId);
   if (!meta || meta.class !== 'Summoner' || meta?.kit?.ult?.type !== 'summon') return 1.0;
   const u = meta.kit.ult;
   const cand = getPatternSlots(u.pattern || 'verticalNeighbors', baseSlot)
  .filter(Boolean)
    .filter(s => {
     const { cx, cy } = slotToCell('enemy', s);
      return !cellReserved(tokensAlive(), Game.queued, cx, cy);
    });
   const need = Math.max(1, u.count || 1);
    return Math.min(1, cand.length / need);
  }
  // --- Summon helpers (W4-J5) ---
  function getPatternSlots(pattern, baseSlot){
    switch(pattern){
      case 'verticalNeighbors': {
        const row = (baseSlot - 1) % 3;
        const v = [];
        if (row > 0) v.push(baseSlot - 1);
        if (row < 2) v.push(baseSlot + 1);
        return v;
      }
      case 'rowNeighbors': { // dự phòng tương lai
        const col = Math.floor((baseSlot - 1) / 3);
        const row = (baseSlot - 1) % 3;
        const left  = (col < 2) ? ((col + 1) * 3 + row + 1) : null;
        const right = (col > 0) ? ((col - 1) * 3 + row + 1) : null;
        return [right, left].filter(Boolean);
      }
      default: return [];
    }
  }

  // LẤY TỪ INSTANCE đang đứng trên sân (đúng spec: thừa hưởng % chỉ số hiện tại của chủ)
  function creepStatsFromInherit(masterUnit, inherit){
    const hpMax = Math.round((masterUnit?.hpMax || 0) * (inherit?.HP  || 0));
    const atk   = Math.round((masterUnit?.atk   || 0) * (inherit?.ATK || 0));
     return { hpMax, hp: hpMax, atk };
  }

  function getMinionsOf(masterIid){
    return Game.tokens.filter(t => t.isMinion && t.ownerIid === masterIid && t.alive);
  }
  function removeOldestMinions(masterIid, count){
    if (count <= 0) return;
    const list = getMinionsOf(masterIid).sort((a,b)=> (a.bornSerial||0) - (b.bornSerial||0));
    for (let i=0;i<count && i<list.length;i++){
      const x = list[i];
      x.alive = false;
      // xoá khỏi mảng để khỏi vẽ/đụng lượt
      const idx = Game.tokens.indexOf(x);
      if (idx >= 0) Game.tokens.splice(idx,1);
    }
  }
  function extendBusy(duration){
    if (!Game || !Game.turn) return;
    const now = performance.now();
    const prev = Number.isFinite(Game.turn.busyUntil) ? Game.turn.busyUntil : now;
    const dur = Math.max(0, duration|0);
    Game.turn.busyUntil = Math.max(prev, now + dur);
  }

  // Thực thi Ult: Summoner -> Immediate Summon theo meta; class khác: trừ nộ
  function performUlt(unit){
    const meta = Game.meta.get(unit.id);
    if (!meta) { unit.rage = 0; return; }

    const slot = slotIndex(unit.side, unit.cx, unit.cy);

    // Chỉ Summoner có ult 'summon' mới Immediate
    const u = meta.kit?.ult;
    if (meta.class === 'Summoner' && u?.type === 'summon'){
      const cand = getPatternSlots(u.pattern || 'verticalNeighbors', slot)
        .filter(Boolean)
        // chỉ giữ slot trống thực sự (không active/queued)
        .filter(s => {
          const { cx, cy } = slotToCell(unit.side, s);
       return !cellReserved(tokensAlive(), Game.queued, cx, cy);
        })
        .sort((a,b)=> a-b);

      // spawn tối đa “count”
      const need = Math.min(u.count || 0, cand.length);
      
        if (need > 0){
          // Limit & replace
          const limit = Number.isFinite(u.limit) ? u.limit : Infinity;
          const have  = getMinionsOf(unit.iid).length;
          const over  = Math.max(0, have + need - limit);
          if (over > 0 && (u.replace === 'oldest')) removeOldestMinions(unit.iid, over);

          // Tính thừa hưởng stat 1 lần
          const inheritStats = creepStatsFromInherit(unit, u.inherit);

          // Enqueue theo slot tăng dần
          for (let i=0;i<need;i++){
            const s = cand[i];
            enqueueImmediate(Game, {
              by: unit.id, side: unit.side, slot: s,
              unit: {
                id: `${unit.id}_minion`, name: 'Creep', color: '#ffd27d',
                isMinion: true, ownerIid: unit.iid,
                bornSerial: _BORN++,
                ttlTurns: u.ttl || 3,
                ...inheritStats
              }
            });
        }
      }
      unit.rage = 0; // đã dùng ult
      return;
    }
    if (!u){ unit.rage = Math.max(0, unit.rage - 100); return; }

    const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
    let busyMs = 900;

    switch(u.type){
      case 'drain': {
        const foes = tokensAlive().filter(t => t.side === foeSide);
        if (!foes.length) break;
        const scale = typeof u.power === 'number' ? u.power : 1.2;
        let totalDrain = 0;
        for (const tgt of foes){
          if (!tgt.alive) continue;
          const base = Math.max(1, Math.round((unit.wil || 0) * scale));
          const { dealt } = dealAbilityDamage(Game, unit, tgt, {
            base,
            dtype: 'arcane',
            attackType: 'skill'
          });
          totalDrain += dealt;
        }
        if (totalDrain > 0){
          const { overheal } = healUnit(unit, totalDrain);
          if (overheal > 0) grantShield(unit, overheal);
        }
        busyMs = 1400;
        break;
      }

      case 'strikeLaneMid': {
        const primary = pickTarget(Game, unit);
        if (!primary) break;
        const laneX = primary.cx;
        const laneTargets = tokensAlive().filter(t => t.side === foeSide && t.cx === laneX);
        const hits = Math.max(1, (u.hits|0) || 1);
        const scale = typeof u.scale === 'number' ? u.scale : 0.9;
        const meleeDur = 1600;
        try { vfxAddMelee(Game, unit, primary, { dur: meleeDur }); } catch(_){}
        busyMs = Math.max(busyMs, meleeDur);
        for (const enemy of laneTargets){
          if (!enemy.alive) continue;
          for (let h=0; h<hits; h++){
            if (!enemy.alive) break;
            let base = Math.max(1, Math.round((unit.atk || 0) * scale));
            if (u.bonusVsLeader && (enemy.id === 'leaderA' || enemy.id === 'leaderB')){
              base = Math.round(base * (1 + u.bonusVsLeader));
            }
            dealAbilityDamage(Game, unit, enemy, {
              base,
              dtype: 'arcane',
              attackType: u.tagAsBasic ? 'basic' : 'skill',
              defPen: u.penRES ?? 0
            });
          }
        }
        break;
      }

      case 'selfBuff': {
        const tradePct = Math.max(0, Math.min(0.9, u.selfHPTrade ?? 0));
        const pay = Math.round((unit.hpMax || 0) * tradePct);
        const maxPay = Math.max(0, Math.min(pay, Math.max(0, (unit.hp || 0) - 1)));
        if (maxPay > 0) applyDamage(unit, maxPay);
        const reduce = Math.max(0, u.reduceDmg ?? 0);
        if (reduce > 0){
          Statuses.add(unit, Statuses.make.damageCut({ pct: reduce, turns: u.turns || 1 }));
        }
        try { vfxAddHit(Game, unit); } catch(_){}
        busyMs = 800;
        break;
      }

      case 'sleep': {
        const foes = tokensAlive().filter(t => t.side === foeSide);
        if (!foes.length) break;
        const take = Math.max(1, Math.min(foes.length, (u.targets|0) || foes.length));
        foes.sort((a,b)=>{
          const da = Math.abs(a.cx - unit.cx) + Math.abs(a.cy - unit.cy);
          const db = Math.abs(b.cx - unit.cx) + Math.abs(b.cy - unit.cy);
          return da - db;
        });
        for (let i=0; i<take; i++){
          const tgt = foes[i];
          Statuses.add(tgt, Statuses.make.sleep({ turns: u.turns || 1 }));
          try { vfxAddHit(Game, tgt); } catch(_){}
        }
        busyMs = 1000;
        break;
      }

      case 'revive': {
        const fallen = Game.tokens.filter(t => t.side === unit.side && !t.alive);
        if (!fallen.length) break;
        fallen.sort((a,b)=> (b.deadAt||0) - (a.deadAt||0));
        const take = Math.max(1, Math.min(fallen.length, (u.targets|0) || 1));
        for (let i=0; i<take; i++){
          const ally = fallen[i];
          ally.alive = true;
          ally.deadAt = 0;
          ally.hp = 0;
          Statuses.purge(ally);
          const hpPct = Math.max(0, Math.min(1, u.revived?.hpPct ?? 0.5));
          const healAmt = Math.max(1, Math.round((ally.hpMax || 0) * hpPct));
          healUnit(ally, healAmt);
          ally.rage = Math.max(0, u.revived?.rage ?? 0);
          if (u.revived?.lockSkillsTurns){
            Statuses.add(ally, Statuses.make.silence({ turns: u.revived.lockSkillsTurns }));
          }
          try { vfxAddSpawn(Game, ally.cx, ally.cy, ally.side); } catch(_){}
        }
        busyMs = 1500;
        break;
      }

      case 'equalizeHP': {
        let allies = tokensAlive().filter(t => t.side === unit.side);
        if (!allies.length) break;
        allies.sort((a,b)=>{
          const ra = (a.hpMax || 1) ? (a.hp || 0) / a.hpMax : 0;
          const rb = (b.hpMax || 1) ? (b.hp || 0) / b.hpMax : 0;
          return ra - rb;
        });
        const count = Math.max(1, Math.min(allies.length, (u.allies|0) || allies.length));
        const selected = allies.slice(0, count);
        if (u.healLeader){
          const leaderId = unit.side === 'ally' ? 'leaderA' : 'leaderB';
          const leader = Game.tokens.find(t => t.id === leaderId && t.alive);
          if (leader && !selected.includes(leader)) selected.push(leader);
        }
        if (!selected.length) break;
        const ratio = selected.reduce((acc, t) => {
          const r = (t.hpMax || 1) ? (t.hp || 0) / t.hpMax : 0;
          return Math.max(acc, r);
        }, 0);
        for (const tgt of selected){
          const goal = Math.min(tgt.hpMax || 0, Math.round((tgt.hpMax || 0) * ratio));
          if (goal > (tgt.hp || 0)){
            healUnit(tgt, goal - (tgt.hp || 0));
            try { vfxAddHit(Game, tgt); } catch(_){}
          }
        }
        busyMs = 1000;
        break;
      }

      case 'haste': {
        const targets = new Set();
        targets.add(unit);
        const extraAllies = (()=>{
          if (typeof u.targets === 'number') return Math.max(0, (u.targets|0) - 1);
          if (typeof u.targets === 'string'){
            const m = u.targets.match(/(\d+)/);
            if (m && m[1]) return Math.max(0, parseInt(m[1], 10));
          }
          return 0;
        })();
        const others = tokensAlive().filter(t => t.side === unit.side && t !== unit);
        others.sort((a,b)=> (a.spd||0) - (b.spd||0));
        for (const ally of others){
          if (targets.size >= extraAllies + 1) break;
          targets.add(ally);
        }
        const pct = u.attackSpeed ?? 0.1;
        for (const tgt of targets){
          Statuses.add(tgt, Statuses.make.haste({ pct, turns: u.turns || 1 }));
          try { vfxAddHit(Game, tgt); } catch(_){}
        }
        busyMs = 900;
        break;
      }

      default:
        break;
    }

    extendBusy(busyMs);
    unit.rage = Math.max(0, unit.rage - 100);
  }
  const tokensAlive = () => Game.tokens.filter(t => t.alive);
  // Giảm TTL minion của 1 phe sau khi phe đó kết thúc phase
  function tickMinionTTL(side){
    // gom những minion hết hạn để xoá sau vòng lặp
    const toRemove = [];
    for (const t of Game.tokens){
      if (!t.alive) continue;
      if (t.side !== side) continue;
      if (!t.isMinion) continue;
      if (!Number.isFinite(t.ttlTurns)) continue;

      t.ttlTurns -= 1;
      if (t.ttlTurns <= 0) toRemove.push(t);
    }
    // xoá ra khỏi tokens để không còn được vẽ/đi lượt
    for (const t of toRemove){
      t.alive = false;
      const idx = Game.tokens.indexOf(t);
      if (idx >= 0) Game.tokens.splice(idx, 1);
    }
  }

  function init(){ 
    // Guard: nếu đã init rồi thì thoát
  if (Game._inited) return;
    // 1) Canvas + ctx + HUD
    const boardEl = /** @type {HTMLCanvasElement} */ (document.getElementById('board'));
    if (!boardEl) return;
    canvas = boardEl;
    ctx = /** @type {CanvasRenderingContext2D} */ (boardEl.getContext('2d'));

    hud = initHUD(document);

    // 2) Bắt đầu trận
    resize();
    spawnLeaders(Game.tokens, Game.grid);

  Game.tokens.forEach(t=>{
   if (t.id === 'leaderA' || t.id === 'leaderB'){
     vfxAddSpawn(Game, t.cx, t.cy, t.side);
   }
  });
    // Gán chỉ số mặc định cho 2 leader (vì không nằm trong catalog)
  Game.tokens.forEach(t=>{
    if (!t.iid) t.iid = nextIid();
    if (t.id === 'leaderA' || t.id === 'leaderB'){
      Object.assign(t, {
        hpMax: 1600, hp: 1600, arm: 0.12, res: 0.12, atk: 40, wil: 30,
        aeMax: 0, ae: 0, rage: 0
      });
    }
  });
    // gán iid cho leader vừa spawn từ engine
  Game.tokens.forEach(t => { if (!t.iid) t.iid = nextIid(); });

    hud.update(Game);
  scheduleDraw();
    Game._inited = true;   // đánh dấu thành công
    // 3) Master clock + cost + timer + bước lượt (Sparse Cursor)
    setInterval(()=>{
      const now = performance.now();
      const elapsedSec = Math.floor((now - CLOCK.startMs) / 1000);

      // Timer 04:00
      const remain = Math.max(0, 240 - elapsedSec);
      if (remain !== CLOCK.lastTimerRemain){
        CLOCK.lastTimerRemain = remain;
        const mm = String(Math.floor(remain/60)).padStart(2,'0');
        const ss = String(remain%60).padStart(2,'0');
        const tEl = document.getElementById('timer');
        if (tEl) tEl.textContent = `${mm}:${ss}`;
      }

  // Cost +1/s cho CẢ HAI phe dùng chung deltaSec (không cướp mốc của nhau)
  const deltaSec = elapsedSec - CLOCK.lastCostCreditedSec;
  if (deltaSec > 0) {
    // Ally
    if (Game.cost < Game.costCap) {
      Game.cost = Math.min(Game.costCap, Game.cost + deltaSec);
    }
    // Enemy AI
    if (Game.ai.cost < Game.ai.costCap) {
      Game.ai.cost = Math.min(Game.ai.costCap, Game.ai.cost + deltaSec);
    }

    // Ghi mốc sau khi cộng cho cả hai
    CLOCK.lastCostCreditedSec = elapsedSec;

    // Cập nhật HUD & auto-pick phe ta
    hud.update(Game);
    if (!Game.selectedId) selectFirstAffordable();
    if (Game.ui?.bar) Game.ui.bar.render();

    // Cho AI suy nghĩ ngay khi cost đổi
    aiMaybeAct(Game, 'cost');
  }

      // Bước lượt theo nhịp demo
      const busyUntil = Game.turn?.busyUntil ?? 0;
      if (now >= busyUntil && now - CLOCK.lastTurnStepMs >= CLOCK.turnEveryMs){
        CLOCK.lastTurnStepMs = now;
    stepTurn(Game, {
    performUlt,               // dùng ult (có immediate summon)
    processActionChain,       // xử lý creep hành động ngay
    allocIid: nextIid,        // gán iid cho token/minion
    doActionOrSkip            // để creep basic ngay trong chain
  });
  cleanupDead(performance.now());
  scheduleDraw();
  aiMaybeAct(Game, 'board');
      }
    }, 250);
    
    function selectFirstAffordable(){
    const deck = Game.deck3 || [];
    const i = deck.findIndex(c => Game.cost >= c.cost);
    Game.selectedId = i >= 0 ? deck[i].id : null;
  }
  // 4) Deck-3 lần đầu
    refillDeck();
    selectFirstAffordable();
   // 4b) Enemy deck lần đầu
  refillDeckEnemy(Game);
    // 5) Summon bar (B2): đưa vào Game.ui.bar
    Game.ui.bar = startSummonBar(document, {
      onPick: (c)=>{
        Game.selectedId = c.id;
        Game.ui.bar.render();
      },
      canAfford: (c)=> Game.cost >= c.cost,
      getDeck: ()=> Game.deck3,
      getSelectedId: ()=> Game.selectedId
    });
    Game.ui.bar.render();

    // 6) Click canvas để summon
    canvas.addEventListener('click', (ev)=>{
      const rect = canvas.getBoundingClientRect();
      const p = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      const cell = hitToCellOblique(Game.grid, p.x, p.y, CAM_PRESET);
      if (!cell) return;

      // chỉ 3 cột trái
      if (cell.cx >= CFG.ALLY_COLS) return;

      // phải có thẻ được chọn
      const card = Game.deck3.find(u => u.id === Game.selectedId);
      if (!card) return;

  // ô trống (active) + đủ cost + còn lượt
    // chặn cả ô đã có unit ACTIVE hoặc đang QUEUED (Chờ Lượt)
   if (cellReserved(tokensAlive(), Game.queued, cell.cx, cell.cy)) return;
      if (Game.cost < card.cost) return;
      if (Game.summoned >= Game.summonLimit) return;
      
      const slot = slotIndex('ally', cell.cx, cell.cy);
     // Nếu slot này đã có pending thì bỏ (tránh đặt chồng)
     if (Game.queued.ally.has(slot)) return;

  const spawnCycle =
    (Game.turn.phase === 'ally' && slot > (Game.turn.last.ally || 0))
      ? Game.turn.cycle
      : Game.turn.cycle + 1; 
      const pendingArt = getUnitArt(card.id);
     const pending = {
      unitId: card.id, name: card.name, side:'ally',
       cx: cell.cx, cy: cell.cy, slot, spawnCycle,
       color: pendingArt?.palette?.primary || '#a9f58c',
       art: pendingArt
     };
     Game.queued.ally.set(slot, pending);

  Game.cost = Math.max(0, Game.cost - card.cost);
     hud.update(Game);                 // cập nhật HUD ngay, không đợi tick
       Game.summoned += 1;
       Game.usedUnitIds.add(card.id);

      // Bỏ thẻ khỏi deck và bổ sung thẻ mới
      Game.deck3 = Game.deck3.filter(u => u.id !== card.id);
      Game.selectedId = null;
      refillDeck();
      selectFirstAffordable();
      Game.ui.bar.render();
      scheduleDraw();
    });
  window.addEventListener('resize', ()=>{ resize(); scheduleDraw(); });
  }

  /* ---------- Deck logic ---------- */
  function refillDeck(){

    const need = HAND_SIZE - Game.deck3.length;
    if (need <= 0) return;

    const exclude = new Set([
      ...Game.usedUnitIds,
      ...Game.deck3.map(u=>u.id)
    ]);
    const more = pickRandom(Game.unitsAll, exclude).slice(0, need);
    Game.deck3.push(...more);
  }

  /* ---------- Vẽ ---------- */
  function resize(){
    if (!canvas) return;                                  // guard
    Game.grid = makeGrid(canvas, CFG.GRID_COLS, CFG.GRID_ROWS);
  }
  function draw(){
    if (!ctx || !canvas || !Game.grid) return;            // guard
    drawGridOblique(ctx, Game.grid, CAM_PRESET);
    drawQueuedOblique(ctx, Game.grid, Game.queued, CAM_PRESET);
    drawTokensOblique(ctx, Game.grid, Game.tokens, CAM_PRESET);
  vfxDraw(ctx, Game, CAM_PRESET);
   drawHPBars();
  }
  function cellCenterObliqueLocal(g, cx, cy, C){
    const colsW = g.tile * g.cols;
    const topScale = (C?.topScale ?? 0.80);
    const rowGap = (C?.rowGapRatio ?? 0.62) * g.tile;

    function rowLR(r){
      const pinch = (1 - topScale) * colsW;
      const t = r / g.rows;
      const width = colsW - pinch * (1 - t);
      const left  = g.ox + (colsW - width) / 2;
      const right = left + width;
      return { left, right };
    }
    const yTop = g.oy + cy * rowGap;
    const yBot = yTop + rowGap;
    const LRt = rowLR(cy);
    const LRb = rowLR(cy + 1);

    const xtL = LRt.left +  (cx    / g.cols) * (LRt.right - LRt.left);
    const xtR = LRt.left +  ((cx+1)/ g.cols) * (LRt.right - LRt.left);
    const xbL = LRb.left +  (cx    / g.cols) * (LRb.right - LRb.left);
    const xbR = LRb.left +  ((cx+1)/ g.cols) * (LRb.right - LRb.left);

    const x = (xtL + xtR + xbL + xbR) / 4;
    const y = (yTop + yBot) / 2;

    const k = (C?.depthScale ?? 0.94);
    const scale = Math.pow(k, g.rows - 1 - cy);
    return { x, y, scale };
  }

  function roundedRectPathUI(ctx, x, y, w, h, radius){
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function lightenColor(color, amount){
    if (typeof color !== 'string') return color;
    if (!color.startsWith('#')) return color;
    let hex = color.slice(1);
    if (hex.length === 3){
      hex = hex.split('').map(ch => ch + ch).join('');
    }
    if (hex.length !== 6) return color;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const mix = (c)=> Math.min(255, Math.round(c + (255 - c) * amount));
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  }

  function drawHPBars(){
    if (!ctx || !Game.grid) return;
    const baseR = Math.floor(Game.grid.tile * 0.36);
    for (const t of Game.tokens){
      if (!t.alive || !Number.isFinite(t.hpMax)) continue;
  const p = cellCenterObliqueLocal(Game.grid, t.cx, t.cy, CAM_PRESET);
      const art = t.art || getUnitArt(t.id);
      const layout = art?.layout || {};
      const r = Math.max(6, Math.floor(baseR * (p.scale || 1)));
      const barWidth = Math.max(28, Math.floor(r * (layout.hpWidth ?? 2.4)));
      const barHeight = Math.max(5, Math.floor(r * (layout.hpHeight ?? 0.42)));
      const offset = layout.hpOffset ?? 1.46;
      const x = Math.round(p.x - barWidth / 2);
      const y = Math.round(p.y + r * offset - barHeight / 2);
      const ratio = Math.max(0, Math.min(1, (t.hp || 0) / (t.hpMax || 1)));
      const bgColor = art?.hpBar?.bg || 'rgba(9,14,21,0.74)';
      const fillColor = art?.hpBar?.fill || '#6ff0c0';
      const borderColor = art?.hpBar?.border || 'rgba(0,0,0,0.55)';
      const radius = Math.max(2, Math.floor(barHeight / 2));
      ctx.save();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      roundedRectPathUI(ctx, x, y, barWidth, barHeight, radius);
      ctx.fillStyle = bgColor;
      ctx.fill();
      if (borderColor && borderColor !== 'none'){
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = Math.max(1, Math.floor(barHeight * 0.18));
        ctx.stroke();
      }
      const inset = Math.max(1, Math.floor(barHeight * 0.25));
      const innerHeight = Math.max(1, barHeight - inset * 2);
      const innerRadius = Math.max(1, radius - inset);
      const innerWidth = Math.max(0, barWidth - inset * 2);
      const filledWidth = Math.round(innerWidth * ratio);
      if (filledWidth > 0){
        roundedRectPathUI(ctx, x + inset, y + inset, filledWidth, innerHeight, innerRadius);
        const grad = ctx.createLinearGradient(x, y + inset, x, y + inset + innerHeight);
        const topFill = lightenColor(fillColor, 0.25);
        grad.addColorStop(0, topFill);
        grad.addColorStop(1, fillColor);
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.restore();
    }
  }
  /* ---------- Chạy ---------- */
  let _booted = false;
  function startGame(){
    if (_booted) return;
    _booted = true;
    init();
    document.addEventListener('visibilitychange', ()=>{
      setDrawPaused(document.hidden);
    });
    setDrawPaused(document.hidden);
  }

  const __reexport0 = __require('./events.js');

  exports.gameEvents = __reexport0.gameEvents;
  exports.emitGameEvent = __reexport0.emitGameEvent;
  exports.TURN_START = __reexport0.TURN_START;
  exports.TURN_END = __reexport0.TURN_END;
  exports.ACTION_START = __reexport0.ACTION_START;
  exports.ACTION_END = __reexport0.ACTION_END;
  exports.startGame = startGame;
});
__define('./meta.js', (exports, module, __require) => {
  //v0.7
  // meta.js — gom lookup + stat khởi tạo + nộ khởi điểm
  const __dep0 = __require('./catalog.js');
  const CLASS_BASE = __dep0.CLASS_BASE;
  const getMetaById = __dep0.getMetaById;
  const _isSummoner = __dep0.isSummoner;
  const applyRankAndMods = __dep0.applyRankAndMods;

  // Dùng trực tiếp catalog cho tra cứu
  const Meta = {
    get: getMetaById,
    classOf(id){ return this.get(id)?.class ?? null; },
    rankOf(id){  return this.get(id)?.rank  ?? null; },
    kit(id){     return this.get(id)?.kit   ?? null; },
    // chỉ coi là Summoner khi ult.type='summon'
    isSummoner(id){
      const m = this.get(id);
      return !!(m && m.class === 'Summoner' && m.kit?.ult?.type === 'summon');
    }
  };

  // Tạo chỉ số instance theo class+rank+mods (SPD không nhân theo rank)
  function makeInstanceStats(unitId){
    const m = Meta.get(unitId);
    if (!m) return {};
    const fin = applyRankAndMods(CLASS_BASE[m.class], m.rank, m.mods);
    return {
      hpMax: fin.HP|0, hp: fin.HP|0,
      atk: fin.ATK|0, wil: fin.WIL|0,
      arm: fin.ARM||0, res: fin.RES||0,
      agi: fin.AGI|0, per: fin.PER|0,
      spd: fin.SPD||1,
      aeMax: fin.AEmax|0, ae: 0, aeRegen: fin.AEregen||0
    };
  }

  // Nộ khi vào sân (trừ leader). Revive: theo spec của skill.
  function initialRageFor(unitId, opts = {}){
    const onSpawn = Meta.kit(unitId)?.onSpawn;
    if (!onSpawn) return 0;
    if (onSpawn.exceptLeader && opts.isLeader) return 0;
    if (opts.revive) return Math.max(0, opts.reviveSpec?.rage ?? 0);
    return onSpawn.rage ?? 0;
  }

  exports.Meta = Meta;
  exports.makeInstanceStats = makeInstanceStats;
  exports.initialRageFor = initialRageFor;
});
__define('./passives.js', (exports, module, __require) => {
  // passives.js — passive event dispatch & helpers v0.7
  const __dep0 = __require('./statuses.js');
  const Statuses = __dep0.Statuses;
  const hookOnLethalDamage = __dep0.hookOnLethalDamage;

  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  function ensureStatusContainer(unit){
    if (!unit) return;
    if (!Array.isArray(unit.statuses)) unit.statuses = [];
  }

  function stacksOf(unit, id){
    const s = Statuses.get(unit, id);
    return s ? (s.stacks || 0) : 0;
  }

  function ensureStatBuff(unit, id, { attr, mode='percent', amount=0, purgeable=true }){
    ensureStatusContainer(unit);
    let st = Statuses.get(unit, id);
    if (!st){
      st = Statuses.add(unit, {
        id,
        kind: 'buff',
        tag: 'stat',
        attr,
        mode,
        amount,
        purgeable,
        stacks: 0
      });
    }
    st.attr = attr;
    st.mode = mode;
    st.amount = amount;
    st.purgeable = purgeable;
    return st;
  }

  function applyStatStacks(st, stacks, { maxStacks = null } = {}){
    if (!st) return;
    let next = Math.max(0, stacks|0);
    if (typeof maxStacks === 'number'){ next = Math.min(next, maxStacks); }
    st.stacks = next;
  }

  function recomputeFromStatuses(unit){
    if (!unit || !unit.baseStats) return;
    ensureStatusContainer(unit);
    const base = unit.baseStats;
    const percent = { atk:0, res:0, wil:0 };
    const flat    = { atk:0, res:0, wil:0 };
    for (const st of unit.statuses){
      if (!st || !st.attr || !st.mode) continue;
  const stacks = st.stacks == null ? 1 : st.stacks;
      const amount = (st.amount ?? st.power ?? 0) * stacks;
      if (!Number.isFinite(amount)) continue;
      if (st.mode === 'percent'){
        percent[st.attr] = (percent[st.attr] || 0) + amount;
      } else if (st.mode === 'flat'){
        flat[st.attr] = (flat[st.attr] || 0) + amount;
      }
    }

    if (base.atk != null){
      const pct = 1 + (percent.atk || 0);
      const flatAdd = flat.atk || 0;
      unit.atk = Math.max(0, Math.round(base.atk * pct + flatAdd));
    }
  if (base.wil != null){
      const pct = 1 + (percent.wil || 0);
      const flatAdd = flat.wil || 0;
      unit.wil = Math.max(0, Math.round(base.wil * pct + flatAdd));
    }
    if (base.res != null){
      const pct = 1 + (percent.res || 0);
      const flatAdd = flat.res || 0;
      const raw = base.res * pct + flatAdd;
      unit.res = clamp01(raw);
    }
  }

  function healTeam(Game, unit, pct){
    if (!Game || !unit) return;
    if (!Number.isFinite(pct) || pct <= 0) return;
    const allies = (Game.tokens || []).filter(t => t.side === unit.side && t.alive);
    for (const ally of allies){
      if (!Number.isFinite(ally.hpMax)) continue;
      const heal = Math.max(0, Math.round((ally.hpMax || 0) * pct));
      if (heal <= 0) continue;
      ally.hp = Math.min(ally.hpMax, (ally.hp ?? ally.hpMax) + heal);
    }
  }

  const EFFECTS = {
    placeMark({ Game, unit, passive, ctx }){
      if (!ctx || !ctx.target) return;
      const params = passive?.params || {};
      const ttl = Number.isFinite(params.ttlTurns) ? params.ttlTurns : 3;
      const stacksToExplode = Math.max(1, params.stacksToExplode || 3);
      const dmgMul = params.dmgFromWIL ?? 0.5;
      const purgeable = params.purgeable !== false;
      if (!Array.isArray(ctx.afterHit)) ctx.afterHit = [];
      ctx.afterHit.push((afterCtx = {}) => {
        const target = afterCtx.target || ctx.target;
        if (!target || !target.alive) return;
        ensureStatusContainer(target);
        let st = Statuses.get(target, passive.id);
        if (!st){
          st = Statuses.add(target, {
            id: passive.id,
            kind: 'debuff',
            tag: 'mark',
            stacks: 0,
            dur: ttl,
            tick: 'turn',
            purgeable
          });
        }
        st.dur = ttl;
        st.stacks = (st.stacks || 0) + 1;
        if (st.stacks < stacksToExplode) return;

        Statuses.remove(target, passive.id);
        const amount = Math.max(1, Math.round((unit?.wil || 0) * dmgMul));
        target.hp = Math.max(0, (target.hp || 0) - amount);
        if (target.hp <= 0){
          if (!hookOnLethalDamage(target)){
            target.alive = false;
            if (!target.deadAt) target.deadAt = performance.now();
          }
        }
        if (ctx && Array.isArray(ctx.log)){
          ctx.log.push({ t: passive.id, source: unit?.name, target: target?.name, dmg: amount });
        }
      });
    },

    gainATKPercent({ unit, passive }){
      if (!unit) return;
      const params = passive?.params || {};
      const amount = params.amount ?? 0;
      const stackable = params.stack !== false;
      const st = ensureStatBuff(unit, passive.id, { attr:'atk', mode:'percent', amount, purgeable: params.purgeable !== false });
      const nextStacks = stackable ? (st.stacks || 0) + 1 : 1;
      applyStatStacks(st, nextStacks, { maxStacks: params.maxStacks });
      recomputeFromStatuses(unit);
    },

    conditionalBuff({ unit, passive, ctx }){
      if (!unit) return;
      const params = passive?.params || {};
      const hpMax = unit.hpMax || 0;
      const hpPct = hpMax > 0 ? (unit.hp || 0) / hpMax : 0;
      const threshold = params.ifHPgt ?? 0.5;
      const resBuff = params.RES ?? 0;
      const wilBuff = params.elseWIL ?? 0;
      if (hpPct > threshold){
        const st = ensureStatBuff(unit, `${passive.id}_res`, { attr:'res', mode:'percent', amount: resBuff, purgeable: params.purgeable !== false });
        applyStatStacks(st, 1);
        Statuses.remove(unit, `${passive.id}_wil`);
      } else {
        const st = ensureStatBuff(unit, `${passive.id}_wil`, { attr:'wil', mode:'percent', amount: wilBuff, purgeable: params.purgeable !== false });
        applyStatStacks(st, 1);
        Statuses.remove(unit, `${passive.id}_res`);
      }
      recomputeFromStatuses(unit);
    },

    gainRESPct({ Game, unit, passive }){
      if (!unit) return;
      const params = passive?.params || {};
      const st = ensureStatBuff(unit, passive.id, { attr:'res', mode:'percent', amount: params.amount ?? 0, purgeable: params.purgeable !== false });
      const stackable = params.stack !== false;
      const count = stackable ? (st.stacks || 0) + 1 : 1;
      applyStatStacks(st, count, { maxStacks: params.maxStacks });
      recomputeFromStatuses(unit);
    },

    gainBonus({ Game, unit, passive, ctx }){
      if (!unit || !ctx) return;
      const params = passive?.params || {};
      const perMinion = params.perMinion ?? 0;
      const ownerIid = unit.iid;
      const minions = (Game.tokens || []).filter(t => t && t.alive && t.isMinion && t.ownerIid === ownerIid).length;
      const st = ensureStatBuff(unit, passive.id, { attr:'atk', mode:'percent', amount: 0, purgeable: params.purgeable !== false });
      st.attr = 'atk';
      st.mode = 'percent';
      st.amount = perMinion;
      applyStatStacks(st, minions);
      recomputeFromStatuses(unit);
      if (ctx.damage){
        const bonusPct = perMinion * minions;
        ctx.damage.baseMul = (ctx.damage.baseMul ?? 1) * (1 + bonusPct);
      }
    },

    resPerSleeping({ Game, unit, passive }){
      if (!Game || !unit) return;
      const params = passive?.params || {};
      const foes = (Game.tokens || []).filter(t => t && t.alive && t.side !== unit.side && Statuses.has(t, 'sleep'));
      const st = ensureStatBuff(unit, passive.id, { attr:'res', mode:'percent', amount: params.perTarget ?? 0, purgeable: params.purgeable !== false });
      applyStatStacks(st, foes.length, { maxStacks: params.maxStacks });
      recomputeFromStatuses(unit);
    }
  };

  const EFFECT_MAP = {
    placeMark: EFFECTS.placeMark,
    'gainATK%': EFFECTS.gainATKPercent,
    conditionalBuff: EFFECTS.conditionalBuff,
    'gainRES%': EFFECTS.gainRESPct,
    gainBonus: EFFECTS.gainBonus
  };

  function emitPassiveEvent(Game, unit, when, ctx = {}){
    if (!Game || !unit) return;
    const meta = Game.meta && typeof Game.meta.get === 'function' ? Game.meta.get(unit.id) : null;
    const kit = meta?.kit;
    if (!kit || !Array.isArray(kit.passives)) return;
    ctx.meta = meta;
    ctx.kit = kit;
    for (const passive of kit.passives){
      if (!passive || passive.when !== when) continue;
      let handler = EFFECT_MAP[passive.effect];
      if (passive.effect === 'gainRES%' && passive?.params?.perTarget != null){
        handler = EFFECTS.resPerSleeping;
      }
      if (typeof handler !== 'function') continue;
      handler({ Game, unit, passive, ctx });
    }
  }

  function applyOnSpawnEffects(Game, unit, onSpawn = {}){
    if (!Game || !unit || !onSpawn) return;
    ensureStatusContainer(unit);
    if (onSpawn.teamHealOnEntry){
      healTeam(Game, unit, onSpawn.teamHealOnEntry);
    }
    if (Array.isArray(onSpawn.statuses)){
      for (const st of onSpawn.statuses){
        if (!st || typeof st !== 'object') continue;
        Statuses.add(unit, st);
      }
    }
    if (typeof unit._recalcStats === 'function'){
      unit._recalcStats();
    } else {
      recomputeFromStatuses(unit);
    }
  }

  function prepareUnitForPassives(unit){
    if (!unit) return;
    ensureStatusContainer(unit);
    unit._recalcStats = () => recomputeFromStatuses(unit);
  }

  exports.recomputeUnitStats = recomputeFromStatuses;
  exports.stacksOf = stacksOf;

  exports.emitPassiveEvent = emitPassiveEvent;
  exports.applyOnSpawnEffects = applyOnSpawnEffects;
  exports.prepareUnitForPassives = prepareUnitForPassives;
});
__define('./statuses.js', (exports, module, __require) => {
  // statuses.js — Hệ trạng thái/effect data-driven v0.7
  // Dùng ES module. Không phụ thuộc code ngoài.
  // Cách dùng chính:
  // - Statuses.add(unit, Statuses.make.stun({turns:2}))
  // - if (!Statuses.canAct(unit)) { Statuses.onTurnEnd(unit, ctx); return; }
  // - target = Statuses.resolveTarget(attacker, candidates, {attackType:'basic'}) ?? fallback
  //   - const pre = Statuses.beforeDamage(attacker, target, {dtype:'phys', base:raw});
  //   - let dmg = pre.base * pre.outMul; // trước giáp
  //   - // áp xuyên giáp pre.defPen vào công thức của mày rồi tính giảm giáp…
  //   - dmg = dmg * pre.inMul; // giảm/tăng sát thương đến từ target (damageCut/invulnerable…)
  //   - const abs = Statuses.absorbShield(target, dmg, {dtype:'any'});
  //   - apply hp -= abs.remain;  // abs.absorbed là lượng vào khiên
  //   - Statuses.afterDamage(attacker, target, {dealt:abs.remain, absorbed:abs.absorbed, dtype:'phys'});

  const byId = (u) => (u && u.statuses) || (u.statuses = []);

  // ===== Utilities
  function _find(u, id) {
    const arr = byId(u);
    const i = arr.findIndex(s => s.id === id);
    return [arr, i, i >= 0 ? arr[i] : null];
  }
  function clamp01(x){ return x < 0 ? 0 : (x > 1 ? 1 : x); }
  function _dec(u, s){
    if (typeof s.dur === 'number') { s.dur -= 1; if (s.dur <= 0) Statuses.remove(u, s.id); }
  }
  function _sum(arr, sel){ return arr.reduce((a,b)=>a + (sel ? sel(b) : b), 0); }

  // ===== Public API
  const Statuses = {
    // ---- CRUD
    add(unit, st) {
      const arr = byId(unit);
      const [_, i, cur] = _find(unit, st.id);
      if (cur) {
        // stacking / refresh logic
        if (st.maxStacks && cur.stacks != null) {
          cur.stacks = Math.min(st.maxStacks, (cur.stacks || 1) + (st.stacks || 1));
        }
        if (st.dur != null) cur.dur = st.dur;            // refresh thời lượng
        if (st.power != null) cur.power = st.power;      // replace nếu mạnh hơn (tuỳ loại)
        if (st.amount != null) cur.amount = (cur.amount ?? 0) + (st.amount ?? 0); // shield cộng dồn
        return cur;
      }
      const copy = { ...st };
      if (copy.stacks == null) copy.stacks = 1;
      arr.push(copy);
      return copy;
    },
    remove(unit, id){
      const [arr, i] = _find(unit, id);
      if (i >= 0) arr.splice(i,1);
    },
    has(unit, id){ const [, , cur] = _find(unit, id); return !!cur; },
    get(unit, id){ const [, , cur] = _find(unit, id); return cur; },
    purge(unit){ unit.statuses = []; },
    stacks(unit, id){ const s = this.get(unit,id); return s ? (s.stacks || 0) : 0; },

    // ---- Turn hooks
    onTurnStart(unit, ctx){
      // chặn hành động nếu bị stun/sleep
      // (đếm thời lượng ở onTurnEnd để vẫn "mất lượt" trọn vẹn)
    },
    onTurnEnd(unit, ctx){
      const arr = byId(unit);
      // Bleed: mất 5% HPmax sau khi unit này kết thúc lượt (effect 4)
      const bleed = this.get(unit, 'bleed');
      if (bleed){
        const lost = Math.round(unit.hpMax * 0.05);
        unit.hp = Math.max(0, unit.hp - lost);
        if (ctx?.log) ctx.log.push({t:'bleed', who:unit.name, lost});
        _dec(unit, bleed);
      }
      // Các status có dur tính theo lượt của chính unit sẽ giảm ở đây
      for (const s of [...arr]) {
        if (s.id !== 'bleed' && s.tick === 'turn') _dec(unit, s);
      }
    },
    onPhaseStart(side, ctx){/* reserved */},
    onPhaseEnd(side, ctx){/* reserved */},

    // ---- Action gates
    canAct(unit){
      return !(this.has(unit,'stun') || this.has(unit,'sleep'));
    },
    blocks(unit, what){ // what: 'ult'
      if (what === 'ult') return this.has(unit,'silence');
      return false;
    },

    // ---- Targeting
    resolveTarget(attacker, candidates, {attackType} = {attackType:'basic'}){
      // 2) "Mê hoặc": không thể bị nhắm bởi đòn đánh thường
      if (attackType === 'basic') {
        const filtered = candidates.filter(t => !this.has(t,'allure'));
        if (filtered.length) candidates = filtered;
      }
      // 1) Taunt: nếu có bất kỳ mục tiêu mang taunt → bắt buộc chọn trong nhóm đó
      const taunters = candidates.filter(t => this.has(t,'taunt'));
      if (taunters.length){
        // chọn gần nhất theo Manhattan làm tie-break
        let best = null, bestD = 1e9;
        for (const t of taunters){
          const d = Math.abs(t.cx - attacker.cx) + Math.abs(t.cy - attacker.cy);
          if (d < bestD){ best = t; bestD = d; }
        }
        return best;
      }
      return null; // để engine tiếp tục fallback positional rule của mày
    },

    // ---- Stat & damage pipelines
    // Sửa chỉ số tạm thời (spd/agi…)
    modifyStats(unit, base){
      let out = { ...base };
      // 11) Chóng mặt: -10% SPD & AGI
      if (this.has(unit,'daze')){
        out.SPD = (out.SPD ?? 0) * 0.9;
        out.AGI = (out.AGI ?? 0) * 0.9;
      }
      // 14) Sợ hãi: -10% SPD
      if (this.has(unit,'fear')){
        out.SPD = (out.SPD ?? 0) * 0.9;
      }
        // 20) Thần tốc: +% SPD
      const haste = this.get(unit,'haste');
      if (haste){
        const boost = 1 + clamp01(haste.power ?? 0.1);
        out.SPD = (out.SPD ?? 0) * boost;
      }
      return out;
    },

    // Trước khi tính sát thương/giáp
    beforeDamage(attacker, target, ctx = {dtype:'phys', base:0}){
      let outMul = 1;     // nhân vào sát thương gây ra (attacker side)
      let inMul = 1;      // nhân vào sát thương nhận vào (target side)
      let defPen = 0;     // % xuyên giáp/kháng (0..1)
      let ignoreAll = false;

      // 6) Mệt mỏi: -10% tổng sát thương gây ra
      if (this.has(attacker,'fatigue')) outMul *= 0.90;
      // 9) Hưng phấn: +10% tổng sát thương
      if (this.has(attacker,'exalt')) outMul *= 1.10;
      // 12) Cuồng bạo: +20% sát thương đòn đánh thường
      if (ctx.attackType === 'basic' && this.has(attacker,'frenzy')) outMul *= 1.20;
      // 13) Suy yếu: -10% tổng sát thương, tối đa 5 stack
      const weak = this.get(attacker,'weaken');
      if (weak) outMul *= (1 - 0.10 * Math.min(5, weak.stacks || 1));
      // 14) Sợ hãi: -10% tổng sát thương
      if (this.has(attacker,'fear')) outMul *= 0.90;

      // 5) Giảm sát thương nhận vào n%
      const cut = this.get(target,'dmgCut');
      if (cut) inMul *= (1 - clamp01(cut.power ?? 0));
      // 15) Tàng hình: miễn 100% sát thương trong 1 turn
      if (this.has(target,'stealth')) { inMul = 0; ignoreAll = true; }
      // 10) Xuyên giáp: bỏ qua 10% ARM/RES
      const pierce = this.get(attacker,'pierce');
      if (pierce) defPen = Math.max(defPen, clamp01(pierce.power ?? 0.10));
      // 1) Stun/Sleep: không tác động sát thương, chỉ chặn hành động → xử ở canAct()

      return { ...ctx, outMul, inMul, defPen, ignoreAll };
    },

    // Khiên hấp thụ sát thương (8)
    absorbShield(target, dmg, ctx={dtype:'any'}){
      const s = this.get(target,'shield');
      if (!s || (s.amount ?? 0) <= 0) return { remain: dmg, absorbed: 0, broke:false };
      let left = s.amount ?? 0;
      const absorbed = Math.min(left, dmg);
      left -= absorbed;
      s.amount = left;
      if (left <= 0) this.remove(target, 'shield');
      return { remain: dmg - absorbed, absorbed, broke: left<=0 };
    },

    // Sau khi đã trừ khiên và trừ vào HP
    afterDamage(attacker, target, result = {dealt:0, absorbed:0, dtype:'phys'}){
      const dealt = result.dealt;

      // 3) Phản sát thương: attacker nhận n% sát thương cuối cùng
      const reflect = this.get(target, 'reflect');
      if (reflect && dealt > 0){
        const back = Math.round(dealt * clamp01(reflect.power ?? 0));
        attacker.hp = Math.max(0, attacker.hp - back);
        // không phản khi stealth target đang miễn sát thương (dealt=0 thì như nhau)
      }

      // 16) Độc (venom): khi attacker có hiệu ứng, mỗi đòn sẽ gây thêm n% sát thương đã gây ra
      const venom = this.get(attacker, 'venom');
      if (venom && dealt > 0){
        const extra = Math.round(dealt * clamp01(venom.power ?? 0));
        target.hp = Math.max(0, target.hp - extra);
      }

      // 17) Tàn sát: nếu sau đòn còn ≤10% HPmax → xử tử
      if (this.has(attacker,'execute')){
        if (target.hp <= Math.ceil(target.hpMax * 0.10)) target.hp = 0;
      }

      // Hết lượt: giảm thời lượng các status “bị đánh thì giảm” (reflect chỉ theo turn → không giảm ở đây)

      return result;
    },

    // ===== Factory (constructor) cho 19 hiệu ứng
    make: {
      // 1) Stun/Sleep
      stun:      ({turns=1}={}) => ({ id:'stun',   kind:'debuff', tag:'control', dur:turns, tick:'turn' }),
      sleep:     ({turns=1}={}) => ({ id:'sleep',  kind:'debuff', tag:'control', dur:turns, tick:'turn' }),

      // 2) Taunt/Khiêu khích
      taunt:     ({turns=1}={}) => ({ id:'taunt',  kind:'debuff', tag:'control', dur:turns, tick:'turn' }),

      // 3) Phản sát thương
      reflect:   ({pct=0.2, turns=1}={}) => ({ id:'reflect', kind:'buff', tag:'counter', power:pct, dur:turns, tick:'turn' }),

      // 4) Chảy máu
      bleed:     ({turns=2}={}) => ({ id:'bleed',  kind:'debuff', tag:'dot', dur:turns, tick:'turn' }),

      // 5) Giảm sát thương nhận vào
      damageCut: ({pct=0.2, turns=1}={}) => ({ id:'dmgCut', kind:'buff', tag:'mitigation', power:pct, dur:turns, tick:'turn' }),

      // 6) Mệt mỏi (giảm output)
      fatigue:   ({turns=2}={}) => ({ id:'fatigue', kind:'debuff', tag:'output', dur:turns, tick:'turn' }),

      // 7) Quên Lãng (cấm ult)
      silence:   ({turns=1}={}) => ({ id:'silence', kind:'debuff', tag:'silence', dur:turns, tick:'turn' }),

      // 8) Khiên (không giới hạn turn, tự hết khi cạn)
      shield:    ({pct=0.2, amount=0, of='self'}={}) => ({ id:'shield', kind:'buff', tag:'shield',
                      amount: amount ?? 0, // nên set = Math.round(unit.hpMax * pct) khi add()
                      power:pct, tick:null }),

      // 9) Hưng phấn (+10% output)
      exalt:     ({turns=2}={}) => ({ id:'exalt', kind:'buff', tag:'output', dur:turns, tick:'turn' }),

      // 10) Xuyên giáp 10%
      pierce:    ({pct=0.10, turns=2}={}) => ({ id:'pierce', kind:'buff', tag:'penetration', power:pct, dur:turns, tick:'turn' }),

      // 11) Chóng mặt: -10% SPD/AGI
      daze:      ({turns=1}={}) => ({ id:'daze', kind:'debuff', tag:'stat', dur:turns, tick:'turn' }),

      // 12) Cuồng bạo: +20% basic
      frenzy:    ({turns=2}={}) => ({ id:'frenzy', kind:'buff', tag:'basic-boost', dur:turns, tick:'turn' }),

      // 13) Suy yếu: -10% output, stack tối đa 5
      weaken:    ({turns=2, stacks=1}={}) => ({ id:'weaken', kind:'debuff', tag:'output', dur:turns, tick:'turn', stacks, maxStacks:5 }),

      // 14) Sợ hãi: -10% output & -10% SPD
      fear:      ({turns=1}={}) => ({ id:'fear', kind:'debuff', tag:'output', dur:turns, tick:'turn' }),

      // 15) Tàng hình: miễn 100% dmg 1 turn
      stealth:   ({turns=1}={}) => ({ id:'stealth', kind:'buff', tag:'invuln', dur:turns, tick:'turn' }),

      // 16) Độc (venom on attacker): mỗi hit gây thêm n% dmg đã gây
      venom:     ({pct=0.15, turns=2}={}) => ({ id:'venom', kind:'buff', tag:'on-hit', power:pct, dur:turns, tick:'turn' }),

      // 17) Tàn sát (execute)
      execute:   ({turns=2}={}) => ({ id:'execute', kind:'buff', tag:'execute', dur:turns, tick:'turn' }),

      // 18) “Bất Khuất” (tên đề nghị) — chết còn 1 HP (one-shot, không theo turn)
      undying:   () => ({ id:'undying', kind:'buff', tag:'cheat-death', once:true }),

      // 19) Mê hoặc — không thể bị target bằng đòn đánh thường
      allure:    ({turns=1}={}) => ({ id:'allure', kind:'buff', tag:'avoid-basic', dur:turns, tick:'turn' }),
   // 20) Thần tốc: +% SPD
      haste:     ({pct=0.10, turns=1}={}) => ({ id:'haste', kind:'buff', tag:'stat', power:pct, dur:turns, tick:'turn' }),
    },
  };

  // ===== Special: hook chặn chết còn 1HP (18)
  function hookOnLethalDamage(target){
    const s = Statuses.get(target, 'undying');
    if (!s) return false;
    if (target.hp <= 0){ target.hp = 1; Statuses.remove(target, 'undying'); return true; }
    return false;
  }

  // ===== Helper: thêm khiên theo % HPmax (tiện dụng)
  function grantShieldByPct(unit, pct){
    const add = Math.max(1, Math.round((unit.hpMax || 0) * pct));
    const cur = Statuses.get(unit, 'shield');
    if (cur) cur.amount = (cur.amount || 0) + add;
    else Statuses.add(unit, {id:'shield', kind:'buff', tag:'shield', amount:add});
    return add;
  }

  exports.Statuses = Statuses;
  exports.hookOnLethalDamage = hookOnLethalDamage;
  exports.grantShieldByPct = grantShieldByPct;
});
__define('./summon.js', (exports, module, __require) => {
  // v0.7.3
  const __dep0 = __require('./engine.js');
  const slotToCell = __dep0.slotToCell;
  const cellReserved = __dep0.cellReserved;
  const __dep1 = __require('./vfx.js');
  const vfxAddSpawn = __dep1.vfxAddSpawn;
  const __dep2 = __require('./art.js');
  const getUnitArt = __dep2.getUnitArt;
  // local helper
  const tokensAlive = (Game) => Game.tokens.filter(t => t.alive);

  // en-queue các yêu cầu “Immediate” trong lúc 1 unit đang hành động
  // req: { by?:unitId, side:'ally'|'enemy', slot:1..9, unit:{...} }
  function enqueueImmediate(Game, req){
    if (req.by){
      const mm = Game.meta.get(req.by);
      const ok = !!(mm && mm.class === 'Summoner' && mm.kit?.ult?.type === 'summon');
      if (!ok) return false;
    }
    const { cx, cy } = slotToCell(req.side, req.slot);
    if (cellReserved(tokensAlive(Game), Game.queued, cx, cy)) return false;

    Game.actionChain.push({
      side: req.side,
      slot: req.slot,
      unit: req.unit || { id:'creep', name:'Creep', color:'#ffd27d' }
    });
    return true;
  }

  // xử lý toàn bộ chain của 1 phe sau khi actor vừa hành động
  // trả về slot lớn nhất đã hành động trong chain (để cập nhật turn.last)
  function processActionChain(Game, side, baseSlot, hooks){
    const list = Game.actionChain.filter(x => x.side === side);
    if (!list.length) return baseSlot ?? null;

    list.sort((a,b)=> a.slot - b.slot);

    let maxSlot = baseSlot ?? 0;
    for (const item of list){
      const { cx, cy } = slotToCell(side, item.slot);
      if (cellReserved(tokensAlive(Game), Game.queued, cx, cy)) continue;

      // spawn creep immediate
      const extra = item.unit || {};
      const art = getUnitArt(extra.id || 'minion');
      Game.tokens.push({
        id: extra.id || 'creep', name: extra.name || 'Creep',
        color: extra.color || art?.palette?.primary || '#ffd27d',
        cx, cy, side, alive:true,
        isMinion: !!extra.isMinion,
        ownerIid: extra.ownerIid,
        bornSerial: extra.bornSerial,
        ttlTurns: extra.ttlTurns,
        hpMax: extra.hpMax, hp: extra.hp, atk: extra.atk, art
      });
      try { vfxAddSpawn(Game, cx, cy, side); } catch(_){}
      // gắn instance id
      const spawned = Game.tokens[Game.tokens.length - 1];
      spawned.iid = hooks.allocIid?.() ?? (spawned.iid||0);

      // creep hành động NGAY trong chain (1 lượt), chỉ basic theo spec creep cơ bản
      // (nếu về sau cần hạn chế further — thêm flags trong meta.creep)
      // gọi lại doActionOrSkip để dùng chung status/ult-guard (creep thường không có ult)
      const creep = Game.tokens.find(t => t.alive && t.side===side && t.cx===cx && t.cy===cy);
      if (creep) hooks.doActionOrSkip?.(Game, creep, hooks);

      if (item.slot > maxSlot) maxSlot = item.slot;
    }

    Game.actionChain = Game.actionChain.filter(x => x.side !== side);
    return maxSlot;
  }

  exports.enqueueImmediate = enqueueImmediate;
  exports.processActionChain = processActionChain;
});
__define('./turns.js', (exports, module, __require) => {
  // v0.7.4
  const __dep0 = __require('./engine.js');
  const slotToCell = __dep0.slotToCell;
  const slotIndex = __dep0.slotIndex;
  const __dep1 = __require('./statuses.js');
  const Statuses = __dep1.Statuses;
  const __dep2 = __require('./combat.js');
  const doBasicWithFollowups = __dep2.doBasicWithFollowups;
  const __dep3 = __require('./config.js');
  const CFG = __dep3.CFG;
  const __dep4 = __require('./meta.js');
  const makeInstanceStats = __dep4.makeInstanceStats;
  const initialRageFor = __dep4.initialRageFor;
  const __dep5 = __require('./vfx.js');
  const vfxAddSpawn = __dep5.vfxAddSpawn;
  const __dep6 = __require('./art.js');
  const getUnitArt = __dep6.getUnitArt;
  const __dep7 = __require('./passives.js');
  const emitPassiveEvent = __dep7.emitPassiveEvent;
  const applyOnSpawnEffects = __dep7.applyOnSpawnEffects;
  const prepareUnitForPassives = __dep7.prepareUnitForPassives;
  const __dep8 = __require('./events.js');
  const emitGameEvent = __dep8.emitGameEvent;
  const TURN_START = __dep8.TURN_START;
  const TURN_END = __dep8.TURN_END;
  const ACTION_START = __dep8.ACTION_START;
  const ACTION_END = __dep8.ACTION_END;

  // local helper
  const tokensAlive = (Game) => Game.tokens.filter(t => t.alive);

  // --- Active/Spawn helpers (từ main.js) ---
  function getActiveAt(Game, side, slot){
    const { cx, cy } = slotToCell(side, slot);
    return Game.tokens.find(t => t.side===side && t.cx===cx && t.cy===cy && t.alive);
  }

  function hasActorThisCycle(Game, side, s){
    const { cx, cy } = slotToCell(side, s);
    const active = Game.tokens.some(t => t.side===side && t.cx===cx && t.cy===cy && t.alive);
    if (active) return true;
    const q = Game.queued[side] && Game.queued[side].get(s);
    return !!(q && q.spawnCycle <= Game.turn.cycle);
  }

  function spawnQueuedIfDue(Game, side, slot, { allocIid }){
    const m = Game.queued[side];
    const p = m && m.get(slot);
    if (!p) return false;
    if (p.spawnCycle > Game.turn.cycle) return false;

    m.delete(slot);

    const meta = Game.meta && typeof Game.meta.get === 'function' ? Game.meta.get(p.unitId) : null;
    const kit = meta?.kit;
    const obj = {
      id: p.unitId, name: p.name, color: p.color || '#a9f58c',
      cx: p.cx, cy: p.cy, side: p.side, alive: true,
      rage: initialRageFor(p.unitId, { isLeader:false, revive: !!p.revive, reviveSpec: p.revived })
    };
    Object.assign(obj, makeInstanceStats(p.unitId));
    obj.statuses = [];
    obj.baseStats = {
      atk: obj.atk,
      res: obj.res,
      wil: obj.wil
    };
    obj.iid = allocIid();
    obj.art = getUnitArt(p.unitId);
    obj.color = obj.color || obj.art?.palette?.primary || '#a9f58c';
    prepareUnitForPassives(obj);
    Game.tokens.push(obj);
  applyOnSpawnEffects(Game, obj, kit?.onSpawn);
    try { vfxAddSpawn(Game, p.cx, p.cy, p.side); } catch(_){}
     return true;
  }

  // giảm TTL minion sau khi 1 phe kết thúc phase
  function tickMinionTTL(Game, side){
    const toRemove = [];
    for (const t of Game.tokens){
      if (!t.alive) continue;
      if (t.side !== side) continue;
      if (!t.isMinion) continue;
      if (!Number.isFinite(t.ttlTurns)) continue;
      t.ttlTurns -= 1;
      if (t.ttlTurns <= 0) toRemove.push(t);
    }
    for (const t of toRemove){
      t.alive = false;
      const idx = Game.tokens.indexOf(t);
      if (idx >= 0) Game.tokens.splice(idx, 1);
    }
  }

  // hành động 1 unit (ưu tiên ult nếu đủ nộ & không bị chặn)
  function doActionOrSkip(Game, unit, { performUlt }){
    const ensureBusyReset = () => {
      if (!Game || !Game.turn) return;
      const now = performance.now();
      if (!Number.isFinite(Game.turn.busyUntil) || Game.turn.busyUntil < now) {
        Game.turn.busyUntil = now;
      }
    };
    const slot = unit ? slotIndex(unit.side, unit.cx, unit.cy) : null;
    const baseDetail = {
      game: Game,
      unit: unit || null,
      side: unit?.side ?? null,
      slot,
      phase: Game?.turn?.phase ?? null,
      cycle: Game?.turn?.cycle ?? null,
      action: null,
      skipped: false,
      reason: null
    };
    const finishAction = (extra)=>{
      emitGameEvent(ACTION_END, { ...baseDetail, ...extra });
    };
    if (!unit || !unit.alive) {
      emitGameEvent(ACTION_START, baseDetail);
      ensureBusyReset();
      finishAction({ skipped: true, reason: 'missingUnit' });
      return;
    }
    const meta = Game.meta.get(unit.id);
    emitPassiveEvent(Game, unit, 'onTurnStart', {});

    Statuses.onTurnStart(unit, {});
    emitGameEvent(ACTION_START, baseDetail);

    if (!Statuses.canAct(unit)) {
      Statuses.onTurnEnd(unit, {});
      ensureBusyReset();
      finishAction({ skipped: true, reason: 'status' });
      return;
    }

    if (meta && (unit.rage|0) >= 100 && !Statuses.blocks(unit,'ult')){
      let ultOk = false;
      try {
        performUlt(unit);
        ultOk = true;
      } catch(e){
        console.error('[performUlt]', e);
        unit.rage = 0;
      }
      if (ultOk) emitPassiveEvent(Game, unit, 'onUltCast', {});
      Statuses.onTurnEnd(unit, {});
      ensureBusyReset();
      finishAction({ action: 'ult', ultOk });
      return;
    }

    const cap = (meta && typeof meta.followupCap === 'number') ? (meta.followupCap|0) : (CFG.FOLLOWUP_CAP_DEFAULT|0);
   doBasicWithFollowups(Game, unit, cap);
    emitPassiveEvent(Game, unit, 'onActionEnd', {});
    Statuses.onTurnEnd(unit, {});
    ensureBusyReset();
    finishAction({ action: 'basic' });
  }

  // Bước con trỏ lượt (sparse-cursor) đúng đặc tả
  // hooks = { performUlt, processActionChain, allocIid }
  function stepTurn(Game, hooks){
    const side = Game.turn.phase;
    const last = Game.turn.last[side] || 0;

    // tìm slot kế tiếp có actor/queued trong chu kỳ hiện tại
    let found = null;
    for (let s = last + 1; s <= 9; s++){
      if (!hasActorThisCycle(Game, side, s)) continue;

      // nếu có queued tới hạn → spawn trước khi hành động
      const spawned = spawnQueuedIfDue(Game, side, s, hooks);
      let actor = getActiveAt(Game, side, s);
      if (!actor && spawned) actor = getActiveAt(Game, side, s);

      let turnDetail = null;
      let maxSlot = null;
      if (actor){
        turnDetail = {
          game: Game,
          side,
          slot: s,
          unit: actor,
          cycle: Game?.turn?.cycle ?? null,
          phase: Game?.turn?.phase ?? null,
          spawned: !!spawned,
          processedChain: null
        };
        emitGameEvent(TURN_START, turnDetail);
      }
  try {
        if (actor){
          doActionOrSkip(Game, actor, hooks);
        }

        // xử lý Immediate chain (creep hành động ngay theo slot tăng dần)
        maxSlot = hooks.processActionChain(Game, side, s, hooks);
        Game.turn.last[side] = Math.max(s, maxSlot ?? s);
        found = s;
        break;
      } finally {
        if (turnDetail){
          emitGameEvent(TURN_END, { ...turnDetail, processedChain: maxSlot ?? null });
        }
  }
    }

    if (found !== null) return; // đã đi 1 bước trong phe hiện tại

    // không còn slot nào trong phe này → kết thúc phase & chuyển phe
    const finishedSide = side;
    if (finishedSide === 'ally'){
      Game.turn.phase = 'enemy';
      Game.turn.last.enemy = 0;
    } else {
      Game.turn.phase = 'ally';
      Game.turn.last.ally = 0;
      Game.turn.cycle += 1;
    }
    // minion của phe vừa xong phase bị trừ TTL
    tickMinionTTL(Game, finishedSide);
  }

  exports.getActiveAt = getActiveAt;
  exports.hasActorThisCycle = hasActorThisCycle;
  exports.spawnQueuedIfDue = spawnQueuedIfDue;
  exports.tickMinionTTL = tickMinionTTL;
  exports.doActionOrSkip = doActionOrSkip;
  exports.stepTurn = stepTurn;
});
__define('./ui.js', (exports, module, __require) => {
  //v0.7.1
  const __dep0 = __require('./config.js');
  const CFG = __dep0.CFG;
  const __dep1 = __require('./events.js');
  const gameEvents = __dep1.gameEvents;
  const TURN_START = __dep1.TURN_START;
  const TURN_END = __dep1.TURN_END;
  const ACTION_END = __dep1.ACTION_END;

  function initHUD(doc){
    const costNow  = doc.getElementById('costNow');   // số cost hiện tại
   const costRing = doc.getElementById('costRing');  // vòng tròn tiến trình
   const costChip = doc.getElementById('costChip');  // chip bao ngoài
    function update(Game){
      if (!Game) return;

      const cap = Game.costCap ?? CFG.COST_CAP ?? 30;
      const now = Math.floor(Game.cost ?? 0);
      const ratio = Math.max(0, Math.min(1, now / cap));

      if (costNow) costNow.textContent = now;
      // Vòng tròn tiến trình n/30
      if (costRing){
         const deg = (ratio * 360).toFixed(1) + 'deg';
         costRing.style.setProperty('--deg', deg);
       }
      // Khi max cap, làm chip sáng hơn
      if (costChip){
        costChip.classList.toggle('full', now >= cap);
       }
     }
    const handleGameEvent = (ev)=>{
      const state = ev?.detail?.game;
      if (state) update(state);
    };
    if (gameEvents && typeof gameEvents.addEventListener === 'function'){
      const types = [TURN_START, TURN_END, ACTION_END];
      for (const type of types){
        gameEvents.addEventListener(type, handleGameEvent);
      }
    }
     return { update };
   }
  /* ---------- Summon Bar (deck-size = 4) ---------- */
  function startSummonBar(doc, options){
    options = options || {};
    const onPick = options.onPick || (()=>{});
    const canAfford = options.canAfford || (()=>true);
    const getDeck = options.getDeck || (()=>[]);
    const getSelectedId = options.getSelectedId || (()=>null);

  const host = doc.getElementById('cards');
    if (!host){
      return { render: ()=>{} };
    }

    if (host){
      host.innerHTML = '';
      host.addEventListener('click', (event) => {
        const btn = event.target.closest('button.card');
        if (!btn || btn.disabled || !host.contains(btn)) return;

        const deck = getDeck() || [];
        const targetId = btn.dataset.id;
        if (!targetId) return;
        const card = deck.find((c) => `${c.id}` === targetId);
        if (!card || !canAfford(card)) return;

        onPick(card);
        [...host.children].forEach((node) => node.classList.toggle('active', node === btn));
      });
    }

  // C2: đồng bộ cỡ ô cost theo bề rộng sân (7 cột), lấy số từ CFG.UI
  const _GAP = CFG.UI?.CARD_GAP ?? 12;     // khớp CSS khoảng cách
  const _MIN = CFG.UI?.CARD_MIN ?? 40;     // cỡ tối thiểu
  const boardEl = doc.getElementById('board'); // cache DOM
  function debounce(fn, wait){
    let timer = null;
    function debounced(...args){
      if (timer){
        clearTimeout(timer);
      }
      timer = setTimeout(()=>{
        timer = null;
        fn.apply(this, args);
      }, wait);
    }
    debounced.cancel = ()=>{
      if (timer){
        clearTimeout(timer);
        timer = null;
      }
    };

    debounced.flush = (...args)=>{
      if (timer){
        clearTimeout(timer);
        timer = null;
      }
      fn.apply(this, args);
    };
    return debounced;
  }

  const syncCardSize = debounce(()=>{
    if (!boardEl) return;
    const w = boardEl.clientWidth || boardEl.getBoundingClientRect().width || 0;
    
    // 7 cột -> 6 khoảng cách
    const cell = Math.max(_MIN, Math.floor((w - _GAP*6)/7));
    if (host){
      host.style.setProperty('--cell', `${cell}px`);
    } 
  }, 120);
  syncCardSize.flush();

  let cleanupResize = ()=>{};
  if (boardEl && typeof ResizeObserver === 'function'){
    const observer = new ResizeObserver(()=> syncCardSize());
    observer.observe(boardEl);
    cleanupResize = ()=>{
      observer.disconnect();
      syncCardSize.cancel();
    };
  } else {
    const handleResize = ()=> syncCardSize();
    window.addEventListener('resize', handleResize);
    cleanupResize = ()=>{
      window.removeEventListener('resize', handleResize);
      syncCardSize.cancel();
    };
  }

  let removalObserver = null;
  if (host && typeof MutationObserver === 'function'){
    const target = doc.body || doc.documentElement;
    if (target){
      removalObserver = new MutationObserver(()=>{
        if (!host.isConnected){
          cleanupResize();
          removalObserver.disconnect();
          removalObserver = null;
        }
      });
      removalObserver.observe(target, { childList: true, subtree: true });
    }
  }
  // mỗi thẻ cost là 1 ô vuông, chỉ hiện cost
  function makeBtn(c){
    const btn = doc.createElement('button');
    btn.className = 'card';
    btn.dataset.id = c.id;
    // chỉ hiện cost, không hiện tên
    btn.innerHTML = `<span class="cost">${c.cost}</span>`;

    // trạng thái đủ/thiếu cost
    const ok = canAfford(c);
    btn.disabled = !ok;
    btn.classList.toggle('disabled', !ok);  // chỉ để CSS quyết định độ sáng

    return btn;
  }
  let btns = []; // sẽ chứa đúng 3 button được tạo bằng makeBtn

  function render(){
    const deck = getDeck();              // luôn gồm tối đa 3 thẻ hiện hành
    // đảm bảo đủ số nút (tạo mới bằng makeBtn – chỉ hiện cost)
    while (btns.length < deck.length){
      const btn = makeBtn(deck[btns.length]);
      host.appendChild(btn);
      btns.push(btn);
    }
    // cập nhật trạng thái từng nút theo deck hiện tại
    for (let i = 0; i < btns.length; i++){
      const b = btns[i];
      const c = deck[i];
      if (!c){ b.hidden = true; continue; }
      b.hidden = false;
      b.dataset.id = c.id;

      // cập nhật cost (giữ UI “chỉ cost”)
      const span = b.querySelector('.cost');
      if (span) span.textContent = c.cost;

    const afford = canAfford(c);
    b.disabled = !afford;
    b.classList.toggle('disabled', !afford); // để CSS điều khiển độ sáng
    b.style.opacity = ''; // xóa mọi inline opacity cũ nếu còn
      b.classList.toggle('active', getSelectedId() === c.id);

    }
  }
  if (gameEvents && typeof gameEvents.addEventListener === 'function'){
      const rerender = ()=> render();
      const types = [TURN_START, TURN_END, ACTION_END];
      for (const type of types){
        gameEvents.addEventListener(type, rerender);
      }
    }

    return { render };
  }

  exports.initHUD = initHUD;
  exports.startSummonBar = startSummonBar;
});
__define('./units.js', (exports, module, __require) => {
  // ver v.0.7

  const UNITS = [
    { id: 'phe',          name: 'Phệ',             cost: 20 },
    { id: 'kiemtruongda', name: 'Kiếm Trường Dạ',  cost: 16 },
    { id: 'loithienanh',  name: 'Lôi Thiên Ảnh',   cost: 18 },
    { id: 'laky',         name: 'La Kỳ',           cost: 14 },
    { id: 'kydieu',       name: 'Kỳ Diêu',         cost: 12 },
    { id: 'doanminh',     name: 'Doãn Minh',       cost: 12 },
    { id: 'tranquat',     name: 'Trần Quát',       cost: 10 },
    { id: 'linhgac',      name: 'Lính Gác',        cost:  8 }
  ];

  exports.UNITS = UNITS;
});
__define('./vfx.js', (exports, module, __require) => {
  // 0.6 vfx.js
  // VFX layer: spawn pop, hit ring, ranged tracer, melee step-in/out
  // Không thay đổi logic combat/turn — chỉ vẽ đè.
  // Durations: spawn 500ms, hit 380ms, tracer 400ms, melee 1200ms.

  const __dep0 = __require('./engine.js');
  const projectCellOblique = __dep0.projectCellOblique;
  const __dep1 = __require('./config.js');
  const CFG = __dep1.CFG;
  const CHIBI = __dep1.CHIBI;

  const now = () => performance.now();
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) * 0.5;

  function pool(Game) {
    if (!Game.vfx) Game.vfx = [];
    return Game.vfx;
  }

  /* ------------------- Adders ------------------- */
  function vfxAddSpawn(Game, cx, cy, side) {
    pool(Game).push({ type: 'spawn', t0: now(), dur: 500, cx, cy, side });
  }

  function vfxAddHit(Game, target, opts = {}) {
    pool(Game).push({ type: 'hit', t0: now(), dur: 380, ref: target, ...opts });
  }

  function vfxAddTracer(Game, attacker, target, opts = {}) {
    pool(Game).push({ type: 'tracer', t0: now(), dur: opts.dur || 400, refA: attacker, refB: target });
  }

  function vfxAddMelee(Game, attacker, target, { dur = 1800 } = {}) {
    // Overlay step-in/out (không di chuyển token thật)
    pool(Game).push({ type: 'melee', t0: now(), dur, refA: attacker, refB: target });
  }
  function drawChibiOverlay(ctx, x, y, r, facing, color) {
    const lw = Math.max(CHIBI.line, Math.floor(r*0.28));
    const hr = Math.max(3, Math.floor(r*CHIBI.headR));
    const torso = r*CHIBI.torso, arm=r*CHIBI.arm, leg=r*CHIBI.leg, wep=r*CHIBI.weapon;

    ctx.save(); ctx.translate(x,y); ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.strokeStyle = color; ctx.lineWidth = lw;

    // đầu
    ctx.beginPath(); ctx.arc(0, -torso-hr, hr, 0, Math.PI*2); ctx.stroke();
    // thân
    ctx.beginPath(); ctx.moveTo(0, -torso); ctx.lineTo(0, 0); ctx.stroke();
    // tay (tay trước cầm kiếm theo hướng facing)
    ctx.beginPath();
    ctx.moveTo(0, -torso*0.6); ctx.lineTo(-arm*0.8, -torso*0.2);
    ctx.moveTo(0, -torso*0.6); ctx.lineTo( arm*0.8*facing, -torso*0.2);
    ctx.stroke();
    // chân
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-leg*0.6, leg*0.9);
    ctx.moveTo(0, 0); ctx.lineTo( leg*0.6, leg*0.9);
    ctx.stroke();
    // kiếm
    const hx = arm*0.8*facing, hy = -torso*0.2;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + wep*facing, hy); ctx.stroke();

    ctx.restore();
  }
  /* ------------------- Drawer ------------------- */
  function vfxDraw(ctx, Game, cam) {
    const list = pool(Game);
    if (!list.length || !Game.grid) return;

    const keep = [];
    for (const e of list) {
      const t = (now() - e.t0) / e.dur;
      const done = t >= 1;
      const tt = Math.max(0, Math.min(1, t));

      if (e.type === 'spawn') {
        const p = projectCellOblique(Game.grid, e.cx, e.cy, cam);
        const r0 = Math.max(8, Math.floor(Game.grid.tile * 0.22 * p.scale));
        const r = r0 + Math.floor(r0 * 1.8 * tt);
        ctx.save();
        ctx.globalAlpha = 1 - tt;
        ctx.strokeStyle = e.side === 'ally' ? '#9ef0a4' : '#ffb4c0';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      else if (e.type === 'hit') {
        const ref = e.ref && Game.tokens.find(tk => tk === e.ref || (tk.iid && e.ref.iid && tk.iid === e.ref.iid));
        if (ref) {
          const p = projectCellOblique(Game.grid, ref.cx, ref.cy, cam);
          const r = Math.floor(Game.grid.tile * 0.25 * (0.6 + 1.1 * tt) * p.scale);
          ctx.save();
          ctx.globalAlpha = 0.9 * (1 - tt);
          ctx.strokeStyle = '#e6f2ff';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        }
      }
      else if (e.type === 'tracer') {
    // disabled: không vẽ “đường trắng” nữa
  }
      else if (e.type === 'melee') {
    const A = e.refA, B = e.refB;
    if (A && B && A.alive && B.alive) {
      const pa = projectCellOblique(Game.grid, A.cx, A.cy, cam);
      const pb = projectCellOblique(Game.grid, B.cx, B.cy, cam);

      // Đi vào ~40%, dừng ngắn, rồi lùi về (easeInOut) – không chạm hẳn mục tiêu để đỡ che
      const tN = Math.max(0, Math.min(1, (now() - e.t0) / e.dur));
      const k = easeInOut(tN) * 0.88;
      const mx = lerp(pa.x, pb.x, k);
      const my = lerp(pa.y, pb.y, k);

      // scale theo chiều sâu (khớp render token)
      const depth = Game.grid.rows - 1 - A.cy;
      const kDepth = (cam?.depthScale ?? 0.94);
      const r = Math.max(6, Math.floor(Game.grid.tile * 0.36 * Math.pow(kDepth, depth)));

      const facing = (A.side === 'ally') ? 1 : -1;
      const color  = A.color || (A.side === 'ally' ? '#9adcf0' : '#ffb4c0');

      ctx.save();
      ctx.globalAlpha = 0.95;
      drawChibiOverlay(ctx, mx, my, r, facing, color);
      ctx.restore();
    }
  }

      if (!done) keep.push(e);
    }
    Game.vfx = keep;
  }

  exports.vfxAddSpawn = vfxAddSpawn;
  exports.vfxAddHit = vfxAddHit;
  exports.vfxAddTracer = vfxAddTracer;
  exports.vfxAddMelee = vfxAddMelee;
  exports.vfxDraw = vfxDraw;
});
try {
  __require('./entry.js');
} catch (err) {
  console.error('Failed to bootstrap Arclune bundle:', err);
  throw err;
}
