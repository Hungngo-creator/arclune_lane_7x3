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
    
