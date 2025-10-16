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
__define('./app/shell.js', (exports, module, __require) => {
  const DEFAULT_SCREEN = 'main-menu';

  function cloneState(state){
    return {
      screen: state.screen,
      activeSession: state.activeSession,
      screenParams: state.screenParams
    };
  }

  function createAppShell(options = {}){
    const state = {
      screen: options.screen || DEFAULT_SCREEN,
      activeSession: options.activeSession || null,
      screenParams: options.screenParams || null
    };
    const listeners = new Set();

    function notify(){
      const snapshot = cloneState(state);
      for (const fn of listeners){
        try {
          fn(snapshot);
        } catch (err) {
          console.error('[shell] listener error', err);
        }
      }
    }

    function setScreen(nextScreen, params){
      const target = nextScreen || DEFAULT_SCREEN;
      let changed = false;
      if (state.screen !== target){
        state.screen = target;
        changed = true;
      }
      const normalizedParams = params || null;
      if (state.screenParams !== normalizedParams){
        state.screenParams = normalizedParams;
        changed = true;
      }
      if (changed) notify();
    }

    function setSession(nextSession){
      if (state.activeSession === nextSession) return;
      state.activeSession = nextSession || null;
      notify();
    }

    function subscribe(handler){
      if (typeof handler !== 'function') return ()=>{};
      listeners.add(handler);
      try {
        handler(cloneState(state));
      } catch (err) {
        console.error('[shell] listener error', err);
      }
      return ()=>{
        listeners.delete(handler);
      };
    }

    return {
      enterScreen(key, params){
        setScreen(key, params);
      },
      setActiveSession(session){
        setSession(session);
      },
      clearActiveSession(){
        if (!state.activeSession) return;
        state.activeSession = null;
        notify();
      },
      getState(){
        return cloneState(state);
      },
      onChange: subscribe
    };
  }


  exports.createAppShell = createAppShell;
  exports.default = createAppShell;
  module.exports.default = exports.default;
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

  const UNIT_SKIN_SELECTION = new Map();

  function getBaseArt(id){
    if (!id) return UNIT_ART.default;
    if (UNIT_ART[id]) return UNIT_ART[id];
    if (id.endsWith('_minion')){
      const base = id.replace(/_minion$/, '');
      if (UNIT_ART[`${base}_minion`]) return UNIT_ART[`${base}_minion`];
      if (UNIT_ART.minion) return UNIT_ART.minion;
    }
    return UNIT_ART.default;
  }

  function resolveSkinKey(id, baseArt, explicit){
    if (!baseArt) return null;
    if (explicit && baseArt.skins && baseArt.skins[explicit]) return explicit;
    const override = UNIT_SKIN_SELECTION.get(id);
    if (override && baseArt.skins && baseArt.skins[override]) return override;
    if (baseArt.defaultSkin && baseArt.skins && baseArt.skins[baseArt.defaultSkin]) return baseArt.defaultSkin;
    const keys = baseArt.skins ? Object.keys(baseArt.skins) : [];
    return keys[0] || null;
  }

  function instantiateArt(id, baseArt, skinKey){
    if (!baseArt) return null;
    const art = {
      ...baseArt,
      layout: baseArt.layout ? { ...baseArt.layout } : undefined,
      label: baseArt.label ? { ...baseArt.label } : undefined,
      hpBar: baseArt.hpBar ? { ...baseArt.hpBar } : undefined
    };
    const spriteDef = (skinKey && baseArt.skins && baseArt.skins[skinKey]) ? baseArt.skins[skinKey] : null;
    if (spriteDef){
      art.sprite = {
        ...spriteDef,
        key: skinKey,
        skinId: spriteDef.skinId || skinKey
      };
    } else {
      art.sprite = null;
    }
    art.skinKey = skinKey || null;
    return art;
  }

  function setUnitSkin(unitId, skinKey){
    if (!unitId) return false;
    const baseArt = getBaseArt(unitId);
    if (!baseArt || !baseArt.skins) return false;
    if (!skinKey){
      UNIT_SKIN_SELECTION.delete(unitId);
      return true;
    }
    if (baseArt.skins[skinKey]){
      UNIT_SKIN_SELECTION.set(unitId, skinKey);
      return true;
    }
    return false;
  }

  function getUnitSkin(unitId){
    const baseArt = getBaseArt(unitId);
    if (!baseArt) return null;
    const override = UNIT_SKIN_SELECTION.get(unitId);
    if (override && baseArt.skins && baseArt.skins[override]) return override;
    if (baseArt.defaultSkin && baseArt.skins && baseArt.skins[baseArt.defaultSkin]) return baseArt.defaultSkin;
    const keys = baseArt.skins ? Object.keys(baseArt.skins) : [];
    return keys[0] || null;
  }

  function normalizeShadow(shadow, fallback){
    if (shadow === null) return null;
    const base = {
      color: 'rgba(0,0,0,0.35)',
      blur: 18,
      offsetX: 0,
      offsetY: 10
    };
    if (typeof fallback === 'string') base.color = fallback;
    if (typeof shadow === 'string'){ return { ...base, color: shadow }; }
    if (shadow && typeof shadow === 'object'){
      return {
        color: shadow.color ?? base.color,
        blur: Number.isFinite(shadow.blur) ? shadow.blur : base.blur,
        offsetX: Number.isFinite(shadow.offsetX) ? shadow.offsetX : base.offsetX,
        offsetY: Number.isFinite(shadow.offsetY) ? shadow.offsetY : base.offsetY
      };
    }
    return { ...base, color: fallback || base.color };
  }

  function normalizeSpriteEntry(conf, { anchor, shadow }){
    if (!conf) return null;
    const input = typeof conf === 'string' ? { src: conf } : conf;
    const src = input.src || input.url || null;
    if (!src) return null;
    const normalizedShadow = normalizeShadow(input.shadow, shadow);
    return {
      src,
      anchor: Number.isFinite(input.anchor) ? input.anchor : anchor,
      scale: Number.isFinite(input.scale) ? input.scale : 1,
      aspect: Number.isFinite(input.aspect) ? input.aspect : null,
      shadow: normalizedShadow,
      skinId: input.skinId || input.key || input.id || null,
      cacheKey: input.cacheKey || null
    };
  }

  function makeArt(pattern, palette, opts = {}){
    const spriteFactory = opts.spriteFactory || SPRITES[pattern];
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
    const shadow = opts.shadow ?? 'rgba(0,0,0,0.35)';

    const defaultSkinKey = opts.defaultSkin || 'default';
    const skinsInput = opts.skins || (opts.sprite ? { [defaultSkinKey]: opts.sprite } : null);
    const normalizedSkins = {};
    const anchor = layout.anchor ?? 0.78;
    if (skinsInput){
      for (const [key, conf] of Object.entries(skinsInput)){
        const normalized = normalizeSpriteEntry(conf, { anchor, shadow });
        if (!normalized) continue;
        normalized.key = key;
        if (!normalized.skinId) normalized.skinId = key;
        normalizedSkins[key] = normalized;
      }
    } else if (opts.sprite !== null && spriteFactory){
      const generated = normalizeSpriteEntry({ src: spriteFactory(palette) }, { anchor, shadow });
      if (generated){
        generated.key = defaultSkinKey;
        if (!generated.skinId) generated.skinId = defaultSkinKey;
        normalizedSkins[defaultSkinKey] = generated;
      }
    }

    const preferredKey = normalizedSkins[defaultSkinKey] ? defaultSkinKey : Object.keys(normalizedSkins)[0] || defaultSkinKey;

    return {
      sprite: normalizedSkins[preferredKey] || null,
      skins: normalizedSkins,
      defaultSkin: preferredKey,
      palette,
      shape: opts.shape || pattern,
      size: opts.size ?? 1,
      shadow,
      glow: opts.glow ?? palette.accent ?? '#8cf6ff',
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
      layout: { labelOffset: 1.1, hpOffset: 1.38, spriteAspect: 0.8 },
      skins: {
        default: {
          src: './dist/assets/units/default/default.svg',
          anchor: 0.86,
          scale: 1.02,
          aspect: 0.8,
          shadow: { color: 'rgba(18,28,38,0.55)', blur: 22, offsetY: 10 }
        }
      }
    }),
    leaderA: makeArt('shield', basePalettes.leaderA, {
      layout: { labelOffset: 1.24, hpOffset: 1.52, hpWidth: 2.6, spriteAspect: 0.8 },
      label: { text: '#e5f6ff', bg: 'rgba(12,30,44,0.88)' },
      hpBar: { fill: '#6ff0c0' },
      skins: {
        default: {
          src: './dist/assets/units/leaderA/default.svg',
          anchor: 0.86,
          scale: 1.08,
          aspect: 0.8,
          shadow: { color: 'rgba(20,62,84,0.6)', blur: 26, offsetY: 12 }
        },
        ascendant: {
          src: './dist/assets/units/leaderA/ascendant.svg',
          anchor: 0.86,
          scale: 1.08,
          aspect: 0.8,
          shadow: { color: 'rgba(26,112,138,0.58)', blur: 28, offsetY: 12 }
        }
      }
    }),
    leaderB: makeArt('wing', basePalettes.leaderB, {
      layout: { labelOffset: 1.3, hpOffset: 1.58, hpWidth: 2.6, spriteAspect: 0.8 },
      label: { text: '#ffe6ec', bg: 'rgba(46,16,24,0.88)' },
      hpBar: { fill: '#ff9aa0' },
      skins: {
        default: {
          src: './dist/assets/units/leaderB/default.svg',
          anchor: 0.88,
          scale: 1.12,
          aspect: 0.8,
          shadow: { color: 'rgba(58,16,28,0.6)', blur: 28, offsetY: 12 }
        },
        nightfall: {
          src: './dist/assets/units/leaderB/nightfall.svg',
          anchor: 0.88,
          scale: 1.12,
          aspect: 0.8,
          shadow: { color: 'rgba(48,12,44,0.6)', blur: 30, offsetY: 14 }
        }
      }
    }),
    phe: makeArt('rune', basePalettes.phe, {
      layout: { labelOffset: 1.2, hpOffset: 1.48, spriteAspect: 0.8 },
      hpBar: { fill: '#c19bff' },
      skins: {
        default: {
          src: './dist/assets/units/phe/default.svg',
          anchor: 0.86,
          scale: 1.04,
          aspect: 0.8,
          shadow: { color: 'rgba(34,20,68,0.55)', blur: 22, offsetY: 10 }
        }
      }
    }),
    kiemtruongda: makeArt('pike', basePalettes.kiem, {
      layout: { labelOffset: 1.22, hpOffset: 1.5, spriteAspect: 0.8 },
      hpBar: { fill: '#ffd37a' },
      skins: {
        default: {
          src: './dist/assets/units/kiemtruongda/default.svg',
          anchor: 0.86,
          scale: 1.06,
          aspect: 0.8,
          shadow: { color: 'rgba(64,32,14,0.58)', blur: 24, offsetY: 12 }
        }
      }
    }),
    loithienanh: makeArt('sentinel', basePalettes.loithien, {
      layout: { labelOffset: 1.18, hpOffset: 1.46, spriteAspect: 0.8 },
      hpBar: { fill: '#80f2ff' },
      skins: {
        default: {
          src: './dist/assets/units/loithienanh/default.svg',
          anchor: 0.88,
          scale: 1.08,
          aspect: 0.8,
          shadow: { color: 'rgba(22,52,70,0.55)', blur: 26, offsetY: 12 }
        }
      }
    }),
    laky: makeArt('bloom', basePalettes.laky, {
      layout: { labelOffset: 1.18, hpOffset: 1.44, spriteAspect: 0.8 },
      hpBar: { fill: '#ffb8e9' },
      skins: {
        default: {
          src: './dist/assets/units/laky/default.svg',
          anchor: 0.9,
          scale: 1.12,
          aspect: 0.8,
          shadow: { color: 'rgba(86,34,82,0.55)', blur: 28, offsetY: 12 }
        }
      }
    }),
    kydieu: makeArt('rune', basePalettes.kydieu, {
      layout: { labelOffset: 1.16, hpOffset: 1.42, spriteAspect: 0.8 },
      hpBar: { fill: '#9af5d2' },
      skins: {
        default: {
          src: './dist/assets/units/kydieu/default.svg',
          anchor: 0.86,
          scale: 1.04,
          aspect: 0.8,
          shadow: { color: 'rgba(28,78,70,0.55)', blur: 22, offsetY: 10 }
        }
      }
    }),
    doanminh: makeArt('pike', basePalettes.doanminh, {
      layout: { labelOffset: 1.26, hpOffset: 1.54, spriteAspect: 0.8 },
      hpBar: { fill: '#ffe6a5' },
      skins: {
        default: {
          src: './dist/assets/units/doanminh/default.svg',
          anchor: 0.86,
          scale: 1.08,
          aspect: 0.8,
          shadow: { color: 'rgba(52,36,14,0.58)', blur: 24, offsetY: 12 }
        }
      }
    }),
    tranquat: makeArt('rune', basePalettes.tranquat, {
      layout: { labelOffset: 1.18, hpOffset: 1.46, spriteAspect: 0.8 },
      hpBar: { fill: '#7fe9ff' },
      skins: {
        default: {
          src: './dist/assets/units/tranquat/default.svg',
          anchor: 0.86,
          scale: 1.04,
          aspect: 0.8,
          shadow: { color: 'rgba(26,60,88,0.55)', blur: 22, offsetY: 10 }
        }
      }
    }),
    linhgac: makeArt('sentinel', basePalettes.linhgac, {
      layout: { labelOffset: 1.16, hpOffset: 1.42, spriteAspect: 0.8 },
      hpBar: { fill: '#a9d6ff' },
      skins: {
        default: {
          src: './dist/assets/units/linhgac/default.svg',
          anchor: 0.88,
          scale: 1.06,
          aspect: 0.8,
          shadow: { color: 'rgba(32,54,76,0.55)', blur: 24, offsetY: 12 }
        }
      }
    }),
    minion: makeArt('pike', basePalettes.minion, {
      layout: { labelOffset: 1.08, hpOffset: 1.32, hpWidth: 2.1, hpHeight: 0.38, spriteAspect: 0.8 },
      label: { text: '#fff1d0' },
      hpBar: { fill: '#ffd27d' },
      skins: {
        default: {
          src: './dist/assets/units/minion/default.svg',
          anchor: 0.84,
          scale: 1,
          aspect: 0.8,
          shadow: { color: 'rgba(58,42,20,0.58)', blur: 20, offsetY: 10 }
        }
      }
    })
  };

  function getUnitArt(id, opts = {}){
    const baseArt = getBaseArt(id);
    const skinKey = resolveSkinKey(id, baseArt, opts.skinKey);
    return instantiateArt(id, baseArt, skinKey);
  }

  function getPalette(id){
    const art = getUnitArt(id);
    return art?.palette || basePalettes.default;
  }

  exports.UNIT_ART = UNIT_ART;
  exports.setUnitSkin = setUnitSkin;
  exports.getUnitSkin = getUnitSkin;
  exports.getUnitArt = getUnitArt;
  exports.getPalette = getPalette;
});
__define('./background.js', (exports, module, __require) => {
  const __dep0 = __require('./config.js');
  const CFG = __dep0.CFG;
  const __dep1 = __require('./engine.js');
  const projectCellOblique = __dep1.projectCellOblique;
  const ensureSpriteLoaded = __dep1.ensureSpriteLoaded;

  const BACKGROUND_PROP_CACHE = new WeakMap();

  function stableStringify(value, seen = new WeakSet()){
    if (value === null) return 'null';
    const type = typeof value;
    if (type === 'undefined') return 'undefined';
    if (type === 'number' || type === 'boolean') return String(value);
    if (type === 'string') return JSON.stringify(value);
    if (type === 'symbol') return value.toString();
    if (type === 'function') return `[Function:${value.name || 'anonymous'}]`;
    if (Array.isArray(value)){
      return `[${value.map(v => stableStringify(v, seen)).join(',')}]`;
    }
    if (type === 'object'){
      if (seen.has(value)) return '"[Circular]"';
      seen.add(value);
      const keys = Object.keys(value).sort();
      const entries = keys.map(key => `${JSON.stringify(key)}:${stableStringify(value[key], seen)}`);
      seen.delete(value);
      return `{${entries.join(',')}}`;
    }
    return String(value);
  }

  function computePropsSignature(props){
    if (!Array.isArray(props) || !props.length) return 'len:0';
    try {
      return stableStringify(props);
    } catch(_){
      return `len:${props.length}`;
    }
  }

  function getBoardSignature(g, cam){
    if (!g) return 'no-grid';
    const baseParts = [
      g.cols,
      g.rows,
      g.tile,
      g.ox,
      g.oy,
      g.w,
      g.h,
      g.pad,
      g.dpr
    ];
    const camParts = [
      cam?.rowGapRatio ?? 'rg',
      cam?.skewXPerRow ?? 'sk',
      cam?.depthScale ?? 'ds'
    ];
    return [...baseParts, ...camParts].join('|');
  }

  const ENVIRONMENT_PROP_TYPES = {
    'stone-obelisk': {
      asset: 'dist/assets/environment/stone-obelisk.svg',
      size: { w: 120, h: 220 },
      anchor: { x: 0.5, y: 1 },
      baseLift: 0.52,
      fallback: { shape: 'obelisk' },
      palette: {
        primary: '#d6e2fb',
        secondary: '#7d8ba9',
        accent: '#f7fbff',
        shadow: '#2c3346',
        outline: 'rgba(16,20,32,0.78)'
      }
    },
    'sun-banner': {
      asset: 'dist/assets/environment/sun-banner.svg',
      size: { w: 140, h: 200 },
      anchor: { x: 0.5, y: 1 },
      baseLift: 0.56,
      fallback: { shape: 'banner' },
      palette: {
        primary: '#ffe3a6',
        secondary: '#d47b3a',
        accent: '#fff4d1',
        shadow: '#6d3218',
        outline: 'rgba(46,23,11,0.78)'
      }
    }
  };

  function resolveBackground(backgroundKey){
    const backgrounds = CFG.BACKGROUNDS || {};
    if (!backgrounds || typeof backgrounds !== 'object') return null;
    if (backgroundKey && backgrounds[backgroundKey]){
      return { key: backgroundKey, config: backgrounds[backgroundKey] };
    }
    const preferred = CFG.CURRENT_BACKGROUND || CFG.SCENE?.CURRENT_BACKGROUND;
    if (preferred && backgrounds[preferred]){
      return { key: preferred, config: backgrounds[preferred] };
    }
    const themeKey = CFG.SCENE?.CURRENT_THEME || CFG.SCENE?.DEFAULT_THEME;
    if (themeKey && backgrounds[themeKey]){
      return { key: themeKey, config: backgrounds[themeKey] };
    }
    const fallbackKey = Object.keys(backgrounds)[0];
    if (fallbackKey){
      return { key: fallbackKey, config: backgrounds[fallbackKey] };
    }
    return null;
  }

  function normalizePropConfig(propCfg){
    if (!propCfg) return null;
    const typeId = propCfg.type || propCfg.kind;
    const typeDef = typeId ? ENVIRONMENT_PROP_TYPES[typeId] : null;
    const anchor = {
      x: propCfg.anchor?.x ?? typeDef?.anchor?.x ?? 0.5,
      y: propCfg.anchor?.y ?? typeDef?.anchor?.y ?? 1
    };
    const size = {
      w: propCfg.size?.w ?? typeDef?.size?.w ?? 120,
      h: propCfg.size?.h ?? typeDef?.size?.h ?? 180
    };
    const palette = {
      ...(typeDef?.palette || {}),
      ...(propCfg.palette || {})
    };
    return {
      type: typeId,
      asset: propCfg.asset ?? typeDef?.asset ?? null,
      fallback: propCfg.fallback ?? typeDef?.fallback ?? null,
      palette,
      anchor,
      size,
      cell: {
        cx: propCfg.cx ?? propCfg.cell?.cx ?? 0,
        cy: propCfg.cy ?? propCfg.cell?.cy ?? 0
      },
      depth: propCfg.depth ?? propCfg.cell?.depth ?? 0,
      baseLift: propCfg.baseLift ?? typeDef?.baseLift ?? 0.5,
      offset: {
        x: propCfg.offset?.x ?? 0,
        y: propCfg.offset?.y ?? 0
      },
      pixelOffset: {
        x: propCfg.pixelOffset?.x ?? 0,
        y: propCfg.pixelOffset?.y ?? 0
      },
      scale: propCfg.scale ?? 1,
      alpha: propCfg.alpha ?? 1,
      flip: propCfg.flip ?? 1,
      sortBias: propCfg.sortBias ?? 0
    };
  }

  function getBackgroundPropCache(config){
    if (!config) return null;
    const props = Array.isArray(config.props) ? config.props : [];
    const signature = computePropsSignature(props);
    let cache = BACKGROUND_PROP_CACHE.get(config);
    if (!cache || cache.signature !== signature){
      const normalizedProps = [];
      for (const rawProp of props){
        const prop = normalizePropConfig(rawProp);
        if (!prop) continue;
        const cyWithDepth = prop.cell.cy + (prop.depth ?? 0);
        const spriteEntry = prop.asset ? ensureSpriteLoaded({ sprite: prop.asset }) : null;
        normalizedProps.push({
          prop,
          base: {
            cx: prop.cell.cx,
            cyWithDepth
          },
          spriteEntry
        });
      }
      cache = {
        signature,
        normalizedProps,
        boardStates: new Map()
      };
      BACKGROUND_PROP_CACHE.set(config, cache);
    }
    return cache;
  }

  function buildBoardState(normalizedProps, g, cam){
    if (!g) return null;
    const rowGap = ((cam?.rowGapRatio) ?? 0.62) * g.tile;
    const drawables = [];
    for (const entry of normalizedProps){
      if (!entry?.prop) continue;
      const { prop, base } = entry;
      const projection = projectCellOblique(g, base.cx, base.cyWithDepth, cam);
      const scale = projection.scale * prop.scale;
      const spriteEntry = entry.spriteEntry || (prop.asset ? ensureSpriteLoaded({ sprite: prop.asset }) : null);
      entry.spriteEntry = spriteEntry;
      drawables.push({
        prop,
        x: projection.x + prop.offset.x * g.tile + prop.pixelOffset.x,
        y: projection.y + (prop.baseLift ?? 0.5) * rowGap + prop.offset.y * rowGap + prop.pixelOffset.y,
        scale,
        spriteEntry,
        sortY: projection.y + prop.sortBias
      });
    }
    drawables.sort((a, b) => a.sortY - b.sortY);
    return {
      signature: getBoardSignature(g, cam),
      drawables
    };
  }

  function drawFallback(ctx, width, height, anchor, palette, fallback){
    const primary = palette?.primary || '#ccd7ec';
    const secondary = palette?.secondary || '#7b86a1';
    const accent = palette?.accent || '#f4f7ff';
    const shadow = palette?.shadow || 'rgba(18,22,34,0.65)';
    const outline = palette?.outline || 'rgba(12,18,28,0.9)';
    const top = -height * (anchor?.y ?? 1);
    const bottom = top + height;
    const halfW = width / 2;
    ctx.save();
    ctx.beginPath();
    switch(fallback?.shape){
      case 'banner': {
        ctx.moveTo(-halfW * 0.65, top + height * 0.08);
        ctx.lineTo(halfW * 0.65, top + height * 0.08);
        ctx.lineTo(halfW * 0.65, bottom - height * 0.35);
        ctx.lineTo(0, bottom);
        ctx.lineTo(-halfW * 0.65, bottom - height * 0.35);
        ctx.closePath();
        ctx.fillStyle = primary;
        ctx.fill();
        ctx.strokeStyle = outline;
        ctx.lineWidth = Math.max(2, width * 0.05);
        ctx.stroke();
        ctx.fillStyle = secondary;
        ctx.fillRect(-halfW * 0.65, top + height * 0.02, halfW * 1.3, height * 0.12);
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(0, top + height * 0.38, width * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = shadow;
        ctx.lineWidth = Math.max(2, width * 0.04);
        ctx.stroke();
        break;
      }
      case 'obelisk':
      default: {
        ctx.moveTo(0, top);
        ctx.lineTo(halfW * 0.7, top + height * 0.12);
        ctx.lineTo(halfW * 0.54, bottom);
        ctx.lineTo(-halfW * 0.54, bottom);
        ctx.lineTo(-halfW * 0.7, top + height * 0.12);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, top, 0, bottom);
        grad.addColorStop(0, primary);
        grad.addColorStop(1, secondary);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = outline;
        ctx.lineWidth = Math.max(2, width * 0.05);
        ctx.stroke();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.moveTo(-halfW * 0.25, top + height * 0.22);
        ctx.lineTo(-halfW * 0.12, top + height * 0.08);
        ctx.lineTo(halfW * 0.18, top + height * 0.18);
        ctx.lineTo(halfW * 0.12, top + height * 0.34);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = shadow;
        ctx.beginPath();
        ctx.moveTo(-halfW * 0.38, top + height * 0.16);
        ctx.lineTo(-halfW * 0.24, bottom - height * 0.08);
        ctx.stroke();
        break;
      }
    }
    ctx.restore();
  }

  function drawEnvironmentProps(ctx, g, cam, backgroundKey){
    if (!ctx || !g) return;
    const resolved = resolveBackground(backgroundKey);
    if (!resolved) return;
    const { config } = resolved;
    if (!config || config.enabled === false) return;
    const cache = getBackgroundPropCache(config);
    const normalizedProps = cache?.normalizedProps;
    if (!normalizedProps || !normalizedProps.length) return;

    const boardSignature = getBoardSignature(g, cam);
    let boardState = cache.boardStates.get(boardSignature);
    if (!boardState){
      boardState = buildBoardState(normalizedProps, g, cam);
      if (!boardState) return;
      cache.boardStates.set(boardSignature, boardState);
    }

    for (const item of boardState.drawables){
      const { prop } = item;
      let width = prop.size.w * item.scale;
      let height = prop.size.h * item.scale;
      const spriteEntry = item.spriteEntry;
      if (spriteEntry && spriteEntry.status === 'ready' && spriteEntry.img){
        const naturalW = spriteEntry.img.naturalWidth || prop.size.w;
        const naturalH = spriteEntry.img.naturalHeight || prop.size.h;
        width = naturalW * item.scale;
        height = naturalH * item.scale;
      }
      ctx.save();
      ctx.globalAlpha = prop.alpha;
      ctx.translate(item.x, item.y);
      if (prop.flip === -1){
        ctx.scale(-1, 1);
      }
      const drawX = -width * (prop.anchor.x ?? 0.5);
      const drawY = -height * (prop.anchor.y ?? 1);
      if (spriteEntry && spriteEntry.status === 'ready' && spriteEntry.img){
        ctx.drawImage(spriteEntry.img, drawX, drawY, width, height);
      } else {
        drawFallback(ctx, width, height, prop.anchor, prop.palette, prop.fallback);
      }
      ctx.restore();
    }
  }

  function getEnvironmentBackground(backgroundKey){
    const resolved = resolveBackground(backgroundKey);
    return resolved ? resolved.config : null;
  }
  exports.ENVIRONMENT_PROP_TYPES = ENVIRONMENT_PROP_TYPES;
  exports.drawEnvironmentProps = drawEnvironmentProps;
  exports.getEnvironmentBackground = getEnvironmentBackground;
});
__define('./catalog.js', (exports, module, __require) => {
  //v0.7
  // 1) Rank multiplier (đơn giản) — áp lên TẤT CẢ stat trừ SPD
  const RANK_MULT = { N:0.60, R:0.80, SR:1.00, SSR:1.30, UR:1.60, Prime:2.00 };

  // 2) Class base (mốc lv1 để test). SPD không chịu rank multiplier.
  const CLASS_BASE = {
    Mage:     { HP:360, ATK:28, WIL:30, ARM:0.08, RES:0.12, AGI:10, PER:12, SPD:1.00, AEmax:110, AEregen: 8.0, HPregen:14 },
    Tanker:   { HP:500, ATK:22, WIL:20, ARM:0.18, RES:0.14, AGI: 9, PER:10, SPD:0.95, AEmax: 60, AEregen: 4.0, HPregen:22 },
    Ranger:   { HP:360, ATK:35, WIL:16, ARM:0.08, RES:0.08, AGI:12, PER:14, SPD:1.20, AEmax: 75, AEregen: 7.0, HPregen:12 },
    Warrior:  { HP:400, ATK:30, WIL:18, ARM:0.14, RES:0.08, AGI:11, PER:11, SPD:1.10, AEmax: 70, AEregen: 6.0, HPregen:16 },
    Summoner: { HP:330, ATK:22, WIL:26, ARM:0.08, RES:0.14, AGI:10, PER:10, SPD:1.05, AEmax: 90, AEregen: 8.5, HPregen:18 },
    Support:  { HP:380, ATK:24, WIL:24, ARM:0.10, RES:0.13, AGI:10, PER:11, SPD:1.00, AEmax:100, AEregen: 7.5, HPregen:20 },
    Assassin: { HP:320, ATK:36, WIL:16, ARM:0.06, RES:0.08, AGI:14, PER:16, SPD:1.25, AEmax: 65, AEregen: 6.0, HPregen:10 }
  };

  // 3) Helper: áp rank & mod (mods không áp vào SPD)
  function applyRankAndMods(base, rank, mods = {}){
    const m = RANK_MULT[rank] ?? 1;
    const out = { ...base };
    for (const k of Object.keys(base)){
      const mod = 1 + (mods[k] || 0);
      if (k === 'SPD') { // SPD không nhân theo bậc
        out[k] = Math.round(base[k] * mod * 100) / 100;
        continue;
      }
      const precision = (k === 'ARM' || k === 'RES') ? 100 : (k === 'AEregen' ? 10 : 1);
      out[k] = Math.round(base[k] * mod * m * precision) / precision;
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
      Math.floor(rawBase * ((passiveCtx.damage?.baseMul) ?? 1) + ((passiveCtx.damage?.flatAdd) ?? 0))
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
      MAX_DPR: 2.5,
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
    SCENE: {
      DEFAULT_THEME: 'daylight',
      CURRENT_THEME: 'daylight',
      THEMES: {
        daylight: {
          sky: {
            top: '#1b2434',
            mid: '#2f455e',
            bottom: '#55759a',
            glow: 'rgba(255, 236, 205, 0.35)'
          },
          horizon: {
            color: '#f4d9ad',
            glow: 'rgba(255, 236, 205, 0.55)',
            height: 0.22,
            thickness: 0.9
          },
          ground: {
            top: '#312724',
            accent: '#3f302c',
            bottom: '#181210',
            highlight: '#6c5344',
            parallax: 0.12,
            topScale: 0.9,
            bottomScale: 1.45
          }
        }
      }
    },

  CURRENT_BACKGROUND: 'daylight',
    BACKGROUNDS: {
      daylight: {
        props: [
          {
            type: 'stone-obelisk',
            cell: { cx: -0.8, cy: -0.2 },
            offset: { x: -0.35, y: -0.08 },
            scale: 1.02,
            alpha: 0.94
          },
          {
            type: 'stone-obelisk',
            cell: { cx: 6.8, cy: -0.25 },
            offset: { x: 0.32, y: -0.1 },
            scale: 1.02,
            alpha: 0.94,
            flip: -1
          },
          {
            type: 'sun-banner',
            cell: { cx: -1.05, cy: 2.24 },
            depth: 0.15,
            offset: { x: -0.28, y: 0.38 },
            sortBias: 18,
            scale: 1.08,
            alpha: 0.96
          },
          {
            type: 'sun-banner',
            cell: { cx: 7.05, cy: 2.28 },
            depth: 0.15,
            offset: { x: 0.28, y: 0.38 },
            sortBias: 18,
            scale: 1.08,
            alpha: 0.96,
            flip: -1
          }
        ]
      }
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
__define('./data/modes.js', (exports, module, __require) => {
  const MODE_TYPES = Object.freeze({
    PVE: 'PvE',
    PVP: 'PvP',
    ECONOMY: 'Kinh tế'
  });

  const MODE_STATUS = Object.freeze({
    AVAILABLE: 'available',
    COMING_SOON: 'coming-soon',
    PLANNED: 'planned'
  });

  const MENU_SECTION_DEFINITIONS = [
    { id: 'core-pve', title: 'PvE' },
    { id: 'economy', title: 'Kinh tế & Hạ tầng' }
  ];

  const MODE_GROUPS = [
    {
      id: 'arena-hub',
      title: 'Chiến Trường',
      shortDescription: 'Tụ điểm tổng hợp các hoạt động chiến đấu luân phiên để người chơi bước vào chiến dịch, thử thách và mùa giải.',
      icon: '🏟️',
      tags: ['PvE', 'PvP'],
      menuSections: ['core-pve'],
      childModeIds: ['arena', 'beast-arena', 'ares', 'challenge', 'campaign'],
      extraClasses: ['mode-card--wide']
    }
  ];

  const MODES = [
    {
      id: 'campaign',
      title: 'Chiến Dịch',
      type: MODE_TYPES.PVE,
      status: MODE_STATUS.AVAILABLE,
      icon: '🛡️',
      shortDescription: 'PvE cốt truyện trên bản đồ 2D để đi nhiệm vụ, nhặt vật phẩm đột phá và mở khóa kiến trúc tông môn.',
      unlockNotes: 'Mở từ đầu; tiến trình mở rộng sang hệ tu luyện 15 đại cảnh giới và tái thiết các kiến trúc tông môn.',
      tags: ['PvE'],
      menuSections: ['core-pve'],
      parentId: 'arena-hub',
      shell: {
        screenId: 'pve-session',
        moduleId: './modes/pve/session.js',
        defaultParams: { modeKey: 'campaign' }
      }
    },
    {
      id: 'challenge',
      title: 'Thử Thách',
      type: MODE_TYPES.PVE,
      status: MODE_STATUS.AVAILABLE,
      icon: '🎯',
      shortDescription: 'Các màn PvE với đội hình cố định cùng phần thưởng đặc biệt dành cho người vượt qua.',
      unlockNotes: 'Có sẵn để thử sức với các đội hình cố định và nhận phần thưởng thử thách đặc biệt.',
      tags: ['PvE'],
      menuSections: ['core-pve'],
      parentId: 'arena-hub',
      shell: {
        screenId: 'pve-session',
        moduleId: './modes/pve/session.js',
        defaultParams: { modeKey: 'challenge' }
      }
    },
    {
      id: 'arena',
      title: 'Đấu Trường',
      type: MODE_TYPES.PVE,
      status: MODE_STATUS.AVAILABLE,
      icon: '🏟️',
      shortDescription: 'Deck PvE đối đầu deck do AI điều khiển, xoay vòng mùa giải 7 ngày với bảng xếp hạng phần thưởng.',
      unlockNotes: 'Yêu cầu chuẩn bị deck xếp sẵn; tham chiến theo mùa 7 ngày để nhận thưởng và leo bảng.',
      tags: ['PvE'],
      menuSections: ['core-pve'],
      parentId: 'arena-hub',
      shell: {
        screenId: 'pve-session',
        moduleId: './modes/pve/session.js',
        defaultParams: { modeKey: 'arena' }
      }
    },
    {
      id: 'ares',
      title: 'Ares',
      type: MODE_TYPES.PVP,
      status: MODE_STATUS.COMING_SOON,
      icon: '⚔️',
      shortDescription: 'PvP thời gian thực, hiển thị "Coming soon" cho tới khi hạ tầng networking hoàn tất.',
      unlockNotes: 'Chờ kết nối hệ thống PvP online realtime trước khi mở cho người chơi.',
      tags: ['PvP', 'Coming soon'],
      menuSections: ['core-pve'],
      parentId: 'arena-hub',
      shell: {
        screenId: 'main-menu',
        fallbackModuleId: './modes/coming-soon.stub.js'
      }
    },
    {
      id: 'tongmon',
      title: 'Tông Môn',
      type: MODE_TYPES.ECONOMY,
      status: MODE_STATUS.COMING_SOON,
      icon: '🏯',
      shortDescription: 'Quản lý Trấn Yêu Tháp, Tàng Kinh Các, Đan Phong và Tu Luyện Phòng gắn với kinh tế nguyên tinh.',
      unlockNotes: 'Mở khi người chơi tái thiết tông môn tàn tạ, liên kết tiến trình PvE và dòng nguyên tinh.',
      tags: ['Kinh tế nguyên tinh', 'Coming soon'],
      menuSections: ['economy'],
      shell: {
        screenId: 'main-menu',
        fallbackModuleId: './modes/coming-soon.stub.js'
      }
    },
    {
      id: 'gacha',
      title: 'Gacha',
      type: MODE_TYPES.ECONOMY,
      status: MODE_STATUS.COMING_SOON,
      icon: '🎲',
      shortDescription: 'Quầy gacha phân tab Nhân Vật, Công Pháp, Vũ Khí, Sủng Thú với pity riêng và chi phí tiền tệ khác nhau.',
      unlockNotes: 'Kích hoạt cùng các banner pity, tiêu tốn những loại tiền tệ và vé gacha tương ứng.',
      tags: ['Kinh tế nguyên tinh', 'Coming soon'],
      menuSections: ['economy'],
      shell: {
        screenId: 'main-menu',
        fallbackModuleId: './modes/coming-soon.stub.js'
      }
    },
    {
      id: 'collection',
      title: 'Bộ Sưu Tập',
      type: MODE_TYPES.ECONOMY,
      status: MODE_STATUS.COMING_SOON,
      icon: '📚',
      shortDescription: 'Hiển thị hồ sơ nhân vật, sủng thú, công pháp, rank budget, sao và class từ dữ liệu tổng hợp.',
      unlockNotes: 'Mở khi người chơi bắt đầu thu thập nhân vật và sủng thú để theo dõi tiến trình nâng sao và rank budget.',
      tags: ['Kinh tế nguyên tinh', 'Coming soon'],
      menuSections: ['economy'],
      shell: {
        screenId: 'main-menu',
        fallbackModuleId: './modes/coming-soon.stub.js'
      }
    },
    {
      id: 'market',
      title: 'Chợ Đen & Shop Dev',
      type: MODE_TYPES.ECONOMY,
      status: MODE_STATUS.COMING_SOON,
      icon: '💰',
      shortDescription: 'Trao đổi vật phẩm giữa người chơi kèm thuế theo bậc và shop dev bán vật phẩm bằng tiền thật.',
      unlockNotes: 'Mở khi nền kinh tế ổn định để người chơi giao dịch, đồng thời kích hoạt kênh shop của dev.',
      tags: ['Kinh tế nguyên tinh', 'Coming soon'],
      menuSections: ['economy'],
      shell: {
        screenId: 'main-menu',
        fallbackModuleId: './modes/coming-soon.stub.js'
      }
    },
    {
      id: 'events',
      title: 'Sự Kiện & Vé Số',
      type: MODE_TYPES.ECONOMY,
      status: MODE_STATUS.COMING_SOON,
      icon: '🎟️',
      shortDescription: 'Event giới hạn thời gian kết hợp vé số dùng tiền tệ trong game, chia thưởng và doanh thu theo tỉ lệ.',
      unlockNotes: 'Kích hoạt theo lịch sự kiện; vé số thu 50% tiền cho dev và 50% đưa vào quỹ giải thưởng.',
      tags: ['Kinh tế nguyên tinh', 'Coming soon'],
      menuSections: ['economy'],
      shell: {
        screenId: 'main-menu',
        fallbackModuleId: './modes/coming-soon.stub.js'
      }
    },
    {
      id: 'social',
      title: 'Chat & Xã hội',
      type: MODE_TYPES.ECONOMY,
      status: MODE_STATUS.COMING_SOON,
      icon: '💬',
      shortDescription: 'Khung chat realtime cùng kênh thông báo cộng đồng để người chơi tương tác.',
      unlockNotes: 'Mở khi hệ thống chat realtime hoàn thiện để player trò chuyện và nhận thông báo.',
      tags: ['Coming soon'],
      menuSections: ['economy'],
      shell: {
        screenId: 'main-menu',
        fallbackModuleId: './modes/coming-soon.stub.js'
      }
    },
    {
      id: 'beast-arena',
      title: 'Đấu Thú Trường',
      type: MODE_TYPES.PVP,
      status: MODE_STATUS.COMING_SOON,
      icon: '🐾',
      shortDescription: 'Đưa sủng thú chiến đấu tự động để leo hệ thống rank từ Đồng tới Đấu Thần theo số trận thắng.',
      unlockNotes: 'Yêu cầu sở hữu sủng thú và tham gia mùa giải để leo hạng, nhận thưởng ở mọi bậc và phần thưởng đặc biệt cho top.',
      tags: ['PvP', 'Coming soon'],
      menuSections: ['core-pve'],
      parentId: 'arena-hub',
      shell: {
        screenId: 'main-menu',
        fallbackModuleId: './modes/coming-soon.stub.js'
      }
    }
  ];

  const MODE_INDEX = MODES.reduce((acc, mode) => {
    acc[mode.id] = mode;
    return acc;
  }, {});

  function getModeById(id){
    return id ? MODE_INDEX[id] || null : null;
  }

  function listModesByType(type, options = {}){
    const { includeStatuses } = options;
    return MODES.filter(mode => {
      if (type && mode.type !== type) return false;
      if (Array.isArray(includeStatuses) && includeStatuses.length > 0){
        return includeStatuses.includes(mode.status);
      }
      return true;
    });
  }

  function listModesForSection(sectionId, options = {}){
    const { includeStatuses } = options;
    return MODES.filter(mode => {
      if (!mode.menuSections || !mode.menuSections.includes(sectionId)){
        return false;
      }
      if (Array.isArray(includeStatuses) && includeStatuses.length > 0){
        return includeStatuses.includes(mode.status);
      }
      return true;
    });
  }

  function getMenuSections(options = {}){
    const { includeStatuses } = options;
    const includeSet = Array.isArray(includeStatuses) && includeStatuses.length > 0
      ? new Set(includeStatuses)
      : null;

    const filterChildModeIds = (childIds = []) => {
      return childIds.filter(childId => {
        const mode = MODE_INDEX[childId];
        if (!mode) return false;
        if (includeSet && !includeSet.has(mode.status)) return false;
        return true;
      });
    };
    return MENU_SECTION_DEFINITIONS.map(section => {
      const entries = [];

      MODE_GROUPS.forEach(group => {
        if (!group.menuSections || !group.menuSections.includes(section.id)) return;
        const childModeIds = filterChildModeIds(group.childModeIds);
        if (childModeIds.length === 0) return;
        entries.push({
          id: group.id,
          type: 'group',
          cardId: group.id,
          childModeIds
        });
      });

      const standaloneModes = listModesForSection(section.id, { includeStatuses })
        .filter(mode => !mode.parentId);

      standaloneModes.forEach(mode => {
        entries.push({
          id: mode.id,
          type: 'mode',
          cardId: mode.id,
          childModeIds: [mode.id]
        });
      });

      if (entries.length === 0) return null;
      
      return {
        id: section.id,
        title: section.title,
        entries
      };
     }).filter(Boolean);
  }

  exports.MODES = MODES;
  exports.MODE_GROUPS = MODE_GROUPS;
  exports.MODE_TYPES = MODE_TYPES;
  exports.MODE_STATUS = MODE_STATUS;
  exports.MENU_SECTION_DEFINITIONS = MENU_SECTION_DEFINITIONS;
  exports.MODE_INDEX = MODE_INDEX;
  exports.getModeById = getModeById;
  exports.listModesByType = listModesByType;
  exports.listModesForSection = listModesForSection;
  exports.getMenuSections = getMenuSections;
});
__define('./engine.js', (exports, module, __require) => {
  const __dep0 = __require('./config.js');
  const TOKEN_STYLE = __dep0.TOKEN_STYLE;
  const CHIBI = __dep0.CHIBI;
  const CFG = __dep0.CFG;
  const __dep1 = __require('./art.js');
  const getUnitArt = __dep1.getUnitArt;
  const getUnitSkin = __dep1.getUnitSkin;
  //v0.7.3
  /* ---------- Grid ---------- */
  function makeGrid(canvas, cols, rows){
    const pad = (CFG.UI?.PAD) ?? 12;
    const w = Math.min(window.innerWidth - pad*2, (CFG.UI?.BOARD_MAX_W) ?? 900);
    const h = Math.max(
      Math.floor(w * ((CFG.UI?.BOARD_H_RATIO) ?? (3/7))),
      (CFG.UI?.BOARD_MIN_H) ?? 220
    );

  const maxDprCfg = CFG.UI?.MAX_DPR;
    const maxDpr = Number.isFinite(maxDprCfg) && maxDprCfg > 0 ? maxDprCfg : 3;
    const dprRaw = (typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio))
      ? window.devicePixelRatio
      : 1;
    const dprSafe = dprRaw > 0 ? dprRaw : 1;
    const dpr = Math.min(maxDpr, dprSafe);

    const displayW = w;
    const displayH = h;
    const pixelW = Math.round(displayW * dpr);
    const pixelH = Math.round(displayH * dpr);

    if (canvas){
      if (canvas.style){
        canvas.style.width = `${displayW}px`;
        canvas.style.height = `${displayH}px`;
      }
      if (canvas.width !== pixelW) canvas.width = pixelW;
      if (canvas.height !== pixelH) canvas.height = pixelH;
    }

    const usableW = displayW - pad * 2;
    const usableH = displayH - pad * 2;

    const tile = Math.floor(Math.min(usableW / cols, usableH / rows));

    const ox = Math.floor((displayW - tile*cols)/2);
    const oy = Math.floor((displayH - tile*rows)/2);
    return { cols, rows, tile, ox, oy, w: displayW, h: displayH, pad, dpr };
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
    const artAlly = getUnitArt('leaderA');
    const artEnemy = getUnitArt('leaderB');
    tokens.push({ id:'leaderA', name:'Uyên', color:'#6cc8ff', cx:0, cy:1, side:'ally', alive:true, art: artAlly, skinKey: artAlly?.skinKey });
    tokens.push({ id:'leaderB', name:'Địch', color:'#ff9aa0', cx:g.cols-1, cy:1, side:'enemy', alive:true, art: artEnemy, skinKey: artEnemy?.skinKey });
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
    const rowGap = ((cam?.rowGapRatio) ?? 0.62) * g.tile;
    const skew   = ((cam?.skewXPerRow) ?? 0.28) * g.tile;
    const k      =  ((cam?.depthScale)  ?? 0.94);
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

  const TOKEN_PROJECTION_CACHE = new WeakMap();
  const TOKEN_VISUAL_CACHE = new Map();

  function contextSignature(g, cam){
    const C = cam || {};
    return [
      g.cols, g.rows, g.tile, g.ox, g.oy,
      C.rowGapRatio ?? 0.62,
      C.skewXPerRow ?? 0.28,
      C.depthScale ?? 0.94
    ].join('|');
  }

  function warnInvalidToken(context, token){
    if (!CFG.DEBUG) return;
    try {
      console.warn(`[engine] ${context}: expected token object but received`, token);
    } catch(_){}
  }

  function getTokenProjection(token, g, cam, sig){
    if (!token){
      return null;
    }
    if (typeof token !== 'object' || token === null){
      warnInvalidToken('getTokenProjection', token);
      return null;
    }
    let entry = TOKEN_PROJECTION_CACHE.get(token);
    if (!entry || entry.cx !== token.cx || entry.cy !== token.cy || entry.sig !== sig){
      const projection = projectCellOblique(g, token.cx, token.cy, cam);
      entry = {
        cx: token.cx,
        cy: token.cy,
        sig,
        projection
      };
      TOKEN_PROJECTION_CACHE.set(token, entry);
    }
    return entry.projection;
  }

  function clearTokenCaches(token){
    if (!token){
      return;
    }
    if (typeof token !== 'object' || token === null){
      warnInvalidToken('clearTokenCaches', token);
      return;
    }
    TOKEN_PROJECTION_CACHE.delete(token);
    const skinKey = token.skinKey ?? null;
    const cacheKey = `${token.id ?? '__anon__'}::${skinKey ?? ''}`;
    TOKEN_VISUAL_CACHE.delete(cacheKey);
  }

  function getTokenVisual(token, art){
    if (!token) return { spriteEntry: null, shadowCfg: null };
    const skinKey = art?.skinKey ?? token.skinKey ?? null;
    const cacheKey = `${token.id ?? '__anon__'}::${skinKey ?? ''}`;
    const spriteCfg = art?.sprite || {};
    const descriptor = typeof spriteCfg === 'string' ? { src: spriteCfg } : spriteCfg;
    const spriteSrc = descriptor?.src ?? null;
    const spriteKey = descriptor?.cacheKey || (spriteSrc ? `${spriteSrc}::${descriptor?.skinId ?? skinKey ?? ''}` : null);

    let entry = TOKEN_VISUAL_CACHE.get(cacheKey);
    if (!entry || entry.spriteKey !== spriteKey){
      const spriteEntry = spriteSrc ? ensureSpriteLoaded(art) : null;
      const shadowCfg = descriptor?.shadow ?? art?.shadow ?? null;
      entry = {
        spriteKey,
        spriteEntry,
        shadowCfg
      };
      TOKEN_VISUAL_CACHE.set(cacheKey, entry);
    }
    return entry;
  }

  function ensureTokenArt(token){
    if (!token) return null;
    const desiredSkin = getUnitSkin(token.id);
    if (!token.art || token.skinKey !== desiredSkin){
      const art = getUnitArt(token.id, { skinKey: desiredSkin });
      token.art = art;
      token.skinKey = art?.skinKey ?? desiredSkin ?? null;
    }
    return token.art;
  }

  function ensureSpriteLoaded(art){
    if (!art || !art.sprite || typeof Image === 'undefined') return null;
    const descriptor = typeof art.sprite === 'string' ? { src: art.sprite } : art.sprite;
    if (!descriptor || !descriptor.src) return null;
    const skinId = descriptor.skinId ?? art.skinKey ?? null;
    const key = descriptor.cacheKey || `${descriptor.src}::${skinId ?? ''}`;
    let entry = SPRITE_CACHE.get(key);
    if (!entry){
      const img = new Image();
      entry = { status: 'loading', img, key, src: descriptor.src, skinId };
      if ('decoding' in img) img.decoding = 'async';
      img.onload = ()=>{
        entry.status = 'ready';
        if (typeof window !== 'undefined'){
          try {
            window.dispatchEvent(new Event(ART_SPRITE_EVENT));
          } catch(_){}
        }
      };
      img.onerror = ()=>{
        entry.status = 'error';
      };
      img.src = descriptor.src;
      SPRITE_CACHE.set(key, entry);
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
    const sig = contextSignature(g, C);

  const alive = [];
    for (const token of tokens){
      if (!token || !token.alive){
        if (token && !token.alive){
          if (typeof token === 'object' && token !== null){
            clearTokenCaches(token);
          } else {
            warnInvalidToken('drawTokensOblique', token);
          }
        }
        continue;
      }
      const projection = getTokenProjection(token, g, C, sig);
      if (!projection) continue;
      alive.push({ token, projection });
    }

    alive.sort((a, b)=>{
      const ya = a.projection.y;
      const yb = b.projection.y;
      if (ya === yb) return a.token.cx - b.token.cx;
      return ya - yb;
    });
   for (const { token: t, projection: p } of alive){
      const scale = p.scale ?? 1;
      const r = Math.max(6, Math.floor(baseR * scale));
      const facing = (t.side === 'ally') ? 1 : -1;

      const art = ensureTokenArt(t);
      const layout = art?.layout || {};
      const spriteCfgRaw = art?.sprite;
      const spriteCfg = typeof spriteCfgRaw === 'string' ? { src: spriteCfgRaw } : (spriteCfgRaw || {});
      const spriteHeightMult = layout.spriteHeight || 2.4;
      const spriteScale = Number.isFinite(spriteCfg.scale) ? spriteCfg.scale : 1;
      const spriteHeight = r * spriteHeightMult * ((art?.size) ?? 1) * spriteScale;
      const spriteAspect = (Number.isFinite(spriteCfg.aspect) ? spriteCfg.aspect : null) || layout.spriteAspect || 0.78;
      const spriteWidth = spriteHeight * spriteAspect;
      const anchor = Number.isFinite(spriteCfg.anchor) ? spriteCfg.anchor : (layout.anchor ?? 0.78);
      const hasRichArt = !!(art && ((spriteCfg && spriteCfg.src) || art.shape));

      if (hasRichArt){
        const { spriteEntry, shadowCfg } = getTokenVisual(t, art);
        const spriteReady = spriteEntry && spriteEntry.status === 'ready' && spriteEntry.img;
        ctx.save();
        ctx.translate(p.x, p.y);
        if (facing === -1 && art?.mirror !== false) ctx.scale(-1, 1);
        const shadow = shadowCfg || {};
        const shadowColor = shadow.color || art?.glow || art?.shadow || 'rgba(0,0,0,0.35)';
        const shadowBlur = Number.isFinite(shadow.blur) ? shadow.blur : Math.max(6, r * 0.7);
        const shadowOffsetX = Number.isFinite(shadow.offsetX) ? shadow.offsetX : 0;
        const shadowOffsetY = Number.isFinite(shadow.offsetY) ? shadow.offsetY : Math.max(2, r * 0.2);
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
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
  exports.ensureSpriteLoaded = ensureSpriteLoaded;
  exports.drawTokensOblique = drawTokensOblique;
  exports.drawQueuedOblique = drawQueuedOblique;
  exports.slotIndex = slotIndex;
  exports.slotToCell = slotToCell;
  exports.zoneCode = zoneCode;
});
__define('./entry.js', (exports, module, __require) => {
  const __dep0 = __require('./app/shell.js');
  const createAppShell = __dep0.createAppShell;
  const __dep1 = __require('./screens/main-menu/view.js');
  const renderMainMenuView = __dep1.renderMainMenuView;
  const __dep2 = __require('./data/modes.js');
  const MODES = __dep2.MODES;
  const MODE_GROUPS = __dep2.MODE_GROUPS;
  const MODE_STATUS = __dep2.MODE_STATUS;
  const getMenuSections = __dep2.getMenuSections;

  const SUCCESS_EVENT = 'arclune:loaded';
  const SCREEN_MAIN_MENU = 'main-menu';
  const SCREEN_PVE = 'pve-session';

  function loadBundledModule(id){
    if (typeof __require === 'function'){
      return Promise.resolve().then(() => __require(id));
    }
    return import(id);
  }

  const MODE_DEFINITIONS = MODES.reduce((acc, mode) => {
    const shell = mode.shell || {};
    const screenId = shell.screenId || SCREEN_MAIN_MENU;
    const moduleId = mode.status === MODE_STATUS.AVAILABLE && shell.moduleId
      ? shell.moduleId
      : (shell.fallbackModuleId || './modes/coming-soon.stub.js');
    const params = mode.status === MODE_STATUS.AVAILABLE && shell.defaultParams
      ? { ...shell.defaultParams }
      : null;

    acc[mode.id] = {
      key: mode.id,
      label: mode.title,
      type: mode.type,
      description: mode.shortDescription,
      loader: () => loadBundledModule(moduleId),
      screenId,
      icon: mode.icon,
      tags: Array.isArray(mode.tags) ? [...mode.tags] : [],
      status: mode.status,
      unlockNotes: mode.unlockNotes || '',
      params
    };
    return acc;
  }, {});

  const MODE_METADATA = MODES.map(mode => {
    const definition = MODE_DEFINITIONS[mode.id];
    return {
      key: mode.id,
      id: definition?.screenId || SCREEN_MAIN_MENU,
      title: mode.title,
      description: mode.shortDescription,
      icon: mode.icon,
      tags: Array.isArray(mode.tags) ? [...mode.tags] : [],
      status: mode.status,
      params: definition?.params || null,
      parentId: mode.parentId || null
    };
  });

  const MODE_GROUP_METADATA = MODE_GROUPS.map(group => {
    const childModeIds = Array.isArray(group.childModeIds) ? [...group.childModeIds] : [];
    const childStatuses = childModeIds.reduce((acc, childId) => {
      const child = MODES.find(mode => mode.id === childId);
      if (child){
        acc.add(child.status);
      }
      return acc;
    }, new Set());
    let status = MODE_STATUS.PLANNED;
    if (childStatuses.has(MODE_STATUS.AVAILABLE)){
      status = MODE_STATUS.AVAILABLE;
    } else if (childStatuses.has(MODE_STATUS.COMING_SOON)){
      status = MODE_STATUS.COMING_SOON;
    } else if (childStatuses.size > 0){
      status = Array.from(childStatuses)[0];
    }
    return {
      key: group.id,
      id: SCREEN_MAIN_MENU,
      title: group.title,
      description: group.shortDescription,
      icon: group.icon,
      tags: Array.isArray(group.tags) ? [...group.tags] : [],
      status,
      params: null,
      parentId: null,
      isGroup: true,
      childModeIds,
      extraClasses: Array.isArray(group.extraClasses) ? [...group.extraClasses] : []
    };
  });

  const CARD_METADATA = [...MODE_METADATA, ...MODE_GROUP_METADATA];

  const MENU_SECTIONS = getMenuSections({
    includeStatuses: [MODE_STATUS.AVAILABLE, MODE_STATUS.COMING_SOON]
  });

  let activeModal = null;
  let shellInstance = null;
  let rootElement = null;
  let pveRenderToken = 0;
  const bootstrapOptions = { isFileProtocol: false };
  let renderMessageRef = null;
  let mainMenuView = null;

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

  function showFatalError(error, renderMessage, options){
   const { isFileProtocol = false } = options || {};
    const detail = resolveErrorMessage(error);
    const advice = isFileProtocol
      ? '<p><small>Arclune đang chạy trực tiếp từ ổ đĩa (<code>file://</code>). Nếu gặp lỗi tải tài nguyên, hãy thử mở thông qua một HTTP server tĩnh.</small></p>'
      : '';
    renderMessage({
      title: 'Không thể khởi động Arclune',
      body: `<p>${detail}</p>${advice}`
    });
  }

  function isMissingModuleError(error){
    if (!error || typeof error !== 'object') return false;
    if ('code' in error && error.code === 'MODULE_NOT_FOUND') return true;
    const message = typeof error.message === 'string' ? error.message : '';
    return /Cannot find module/i.test(message) || /module(\s|-)not(\s|-)found/i.test(message);
  }

  function isComingSoonModule(module){
    if (!module) return true;
    if (module.comingSoon) return true;
    if (module.default && module.default.comingSoon) return true;
    return false;
  }

  function dismissModal(){
    if (activeModal && typeof activeModal.remove === 'function'){
      activeModal.remove();
    }
    activeModal = null;
  }

  function showComingSoonModal(label){
    dismissModal();
    if (!rootElement) return;
    const modal = document.createElement('div');
    modal.className = 'app-modal';
    modal.innerHTML = `
      <div class="app-modal__dialog">
        <h3 class="app-modal__title">Coming soon</h3>
        <p class="app-modal__body">${label ? `Chế độ <b>${label}</b> đang được hoàn thiện.` : 'Tính năng đang được phát triển.'}</p>
        <div class="app-modal__actions">
          <button type="button" class="app-modal__button" data-action="close">Đã hiểu</button>
        </div>
      </div>
    `;
    const closeButton = modal.querySelector('[data-action="close"]');
    if (closeButton){
      closeButton.addEventListener('click', ()=>{
        dismissModal();
      });
    }
    rootElement.appendChild(modal);
    activeModal = modal;
  }

  function renderMainMenuScreen(){
    if (!rootElement || !shellInstance) return;
    dismissModal();
    rootElement.classList.remove('app--pve');

    if (mainMenuView && typeof mainMenuView.destroy === 'function'){
      mainMenuView.destroy();
      mainMenuView = null;
    }
    const sections = MENU_SECTIONS.map(section => ({
      id: section.id,
      title: section.title,
      entries: (section.entries || []).map(entry => ({
        id: entry.id,
        type: entry.type,
        cardId: entry.cardId,
        childModeIds: Array.isArray(entry.childModeIds) ? [...entry.childModeIds] : []
      }))
    }));
    mainMenuView = renderMainMenuView({
      root: rootElement,
      shell: shellInstance,
      sections,
      metadata: CARD_METADATA,
      playerGender: bootstrapOptions.playerGender || 'neutral',
      onShowComingSoon: mode => {
        const def = mode?.key ? MODE_DEFINITIONS[mode.key] : null;
        const label = def?.label || mode?.title || mode?.label || '';
        showComingSoonModal(label);
      }
    });
  }

  function renderPveLayout(options){
    if (!rootElement) return null;
    dismissModal();
    rootElement.classList.remove('app--main-menu');
    rootElement.classList.add('app--pve');
    rootElement.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'pve-screen';
    container.setAttribute('data-mode', options?.modeKey || 'pve');
    container.innerHTML = `
      <div class="pve-toolbar">
        <h2 class="pve-toolbar__title">${options?.title || 'PvE'}</h2>
        <div class="pve-toolbar__actions">
          <button type="button" class="pve-toolbar__button" data-action="exit">Thoát</button>
        </div>
      </div>
      <div id="boardWrap">
        <canvas id="board"></canvas>
      </div>
      <div id="bottomHUD" class="hud-bottom">
        <div id="timer" class="chip chip-timer">04:00</div>
        <div id="costChip" class="chip chip-cost">
          <div id="costRing"></div>
          <div id="costNow">0</div>
        </div>
      </div>
      <div id="cards"></div>
    `;
    rootElement.appendChild(container);
    const exitButton = container.querySelector('[data-action="exit"]');
    if (exitButton && typeof options?.onExit === 'function'){
      exitButton.addEventListener('click', options.onExit);
    }
    return container;
  }

  function getModeDefinition(modeKey){
    return MODE_DEFINITIONS[modeKey] || null;
  }

  function teardownActiveSession(){
    if (!shellInstance) return;
    const current = shellInstance.getState()?.activeSession;
    if (current && typeof current.stop === 'function'){
      try {
        current.stop();
      } catch (err) {
        console.warn('[pve] stop session failed', err);
      }
    }
    shellInstance.setActiveSession(null);
  }

  async function mountPveScreen(params){
    const token = ++pveRenderToken;
    teardownActiveSession();
    const modeKey = params?.modeKey && MODE_DEFINITIONS[params.modeKey] ? params.modeKey : 'campaign';
    const definition = MODE_DEFINITIONS[modeKey] || MODE_DEFINITIONS.campaign;
    if (rootElement){
      rootElement.classList.add('app--pve');
      rootElement.innerHTML = `<div class="app-loading">Đang tải ${definition.label}...</div>`;
    }
    let module;
    try {
      module = await definition.loader();
    } catch (error) {
      if (token !== pveRenderToken) return;
      if (isMissingModuleError(error)){
        showComingSoonModal(definition.label);
        shellInstance.enterScreen(SCREEN_MAIN_MENU);
        return;
      }
      throw error;
    }
    if (token !== pveRenderToken) return;
    if (isComingSoonModule(module)){
      showComingSoonModal(definition.label);
      shellInstance.enterScreen(SCREEN_MAIN_MENU);
      return;
    }
    const createPveSession = typeof module.createPveSession === 'function'
      ? module.createPveSession
      : (module.default && typeof module.default.createPveSession === 'function'
        ? module.default.createPveSession
        : null);
    if (typeof createPveSession !== 'function'){
      throw new Error('PvE module missing createPveSession().');
    }
    const container = renderPveLayout({
      title: definition.label,
      modeKey: definition.key,
      onExit: ()=>{
        const state = shellInstance.getState();
        const session = state?.activeSession;
        if (session && typeof session.stop === 'function'){
          try {
            session.stop();
          } catch (err) {
            console.warn('[pve] stop session failed', err);
          }
        }
        shellInstance.setActiveSession(null);
        shellInstance.enterScreen(SCREEN_MAIN_MENU);
      }
    });
    if (!container){
      throw new Error('Không thể dựng giao diện PvE.');
    }
    const session = createPveSession(container);
    shellInstance.setActiveSession(session);
    if (typeof session.start === 'function'){
      try {
        session.start({ ...(params?.sessionConfig || {}), root: container });
      } catch (err) {
        shellInstance.setActiveSession(null);
        throw err;
      }
    }
  }

  (function bootstrap(){
    const renderMessage = ensureRenderer();
    const protocol = window?.location?.protocol;
    const isFileProtocol = protocol === 'file:';
    try {
      if (isFileProtocol){
        console.warn('Đang chạy Arclune trực tiếp từ file://. Một số trình duyệt có thể chặn tài nguyên liên quan.');
      }
      rootElement = document.getElementById('appRoot');
      if (!rootElement){
        throw new Error('Không tìm thấy phần tử #appRoot.');
      }
      shellInstance = createAppShell();
      renderMessageRef = renderMessage;
      bootstrapOptions.isFileProtocol = isFileProtocol;
      let lastScreen = null;
      let lastParams = null;

      shellInstance.onChange(state => {
        if (state.screen === SCREEN_MAIN_MENU && (lastScreen !== SCREEN_MAIN_MENU || state.screenParams !== lastParams)){
          if (lastScreen !== SCREEN_MAIN_MENU){
            lastScreen = SCREEN_MAIN_MENU;
            lastParams = state.screenParams;
            pveRenderToken += 1;
            renderMainMenuScreen();
          }
        } else if (state.screen === SCREEN_PVE){
          if (mainMenuView && typeof mainMenuView.destroy === 'function'){
            mainMenuView.destroy();
            mainMenuView = null;
          }
          if (lastScreen !== SCREEN_PVE){
            lastScreen = SCREEN_PVE;
            lastParams = state.screenParams;
            mountPveScreen(state.screenParams || {}).catch(error => {
              console.error('Arclune failed to start PvE session', error);
              if (renderMessageRef){
                showFatalError(error, renderMessageRef, bootstrapOptions);
              }
            });
          }
        } else if (mainMenuView && typeof mainMenuView.destroy === 'function'){
          mainMenuView.destroy();
          mainMenuView = null;
        }
      });
      
      dispatchLoaded();
    } catch (error) {
      console.error('Arclune failed to start', error);
      if (typeof window.arcluneShowFatal === 'function'){
        window.arcluneShowFatal(error);
      } else {
        showFatalError(error, renderMessage, { isFileProtocol });
      }
    }
  })();

});
__define('./events.js', (exports, module, __require) => {
  // events.js
  const HAS_EVENT_TARGET = typeof EventTarget === 'function';

  function createNativeEvent(type, detail){
    if (!type) return null;
    if (typeof CustomEvent === 'function'){
      try {
        return new CustomEvent(type, { detail });
      } catch (_) {
        // ignore and fall through
      }
    }
    if (typeof Event === 'function'){
      try {
        const ev = new Event(type);
        try {
          ev.detail = detail;
        } catch (_) {
          // ignore assignment failures (readonly in some browsers)
        }
        return ev;
      } catch (_) {
        // ignore and fall through
      }
    }
    if (typeof document === 'object' && document && typeof document.createEvent === 'function'){
      try {
        const ev = document.createEvent('Event');
        if (typeof ev.initEvent === 'function'){
          ev.initEvent(type, false, false);
        }
        ev.detail = detail;
        return ev;
      } catch (_) {
        // ignore and fall through
      }
    }
    return null;
  }
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
    const probeType = '__probe__';
    const probeEvent = createNativeEvent(probeType);
    const hasEventConstructor = typeof Event === 'function';
    const isRealEvent = !!probeEvent && (!hasEventConstructor || probeEvent instanceof Event);
    if (!isRealEvent) return new SimpleEventTarget();
    try {
      const target = new EventTarget();
      let handled = false;
      const handler = () => { handled = true; };
      if (typeof target.addEventListener === 'function'){
        target.addEventListener(probeType, handler);
        try {
          if (typeof target.dispatchEvent === 'function' && isRealEvent){
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

  const TURN_START = 'turn:start';
  const TURN_END = 'turn:end';
  const ACTION_START = 'action:start';
  const ACTION_END = 'action:end';

  const gameEvents = makeEventTarget();

  function emitGameEvent(type, detail){
    if (!type || !gameEvents) return false;
    try {
      if (typeof gameEvents.dispatchEvent === 'function'){
        const nativeEvent = createNativeEvent(type, detail);
        if (nativeEvent){
          return gameEvents.dispatchEvent(nativeEvent);
        }
        if (gameEvents instanceof SimpleEventTarget){
          return gameEvents.dispatchEvent({ type, detail });
        }
        return false;
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
  const __dep1 = __require('./modes/pve/session.js');
  const createPveSession = __dep1.createPveSession;
  const __dep2 = __require('./utils/dummy.js');
  const ensureNestedModuleSupport = __dep2.ensureNestedModuleSupport;
  const __reexport0 = __require('./events.js');

  let currentSession = null;

  function resolveRoot(config){
    if (!config) return (typeof document !== 'undefined') ? document : null;
    if (config.root) return config.root;
    if (config.rootEl) return config.rootEl;
    if (config.element) return config.element;
    return (typeof document !== 'undefined') ? document : null;
  }

  function startGame(options = {}){
    ensureNestedModuleSupport();
    const { root, rootEl, element, ...rest } = options || {};
    const rootTarget = resolveRoot({ root, rootEl, element });
    const initialConfig = { ...rest };
    if (!currentSession){
      currentSession = createPveSession(rootTarget, initialConfig);
  }
    const startConfig = { ...initialConfig };
    if (rootTarget && rootTarget !== resolveRoot({})){
      startConfig.root = rootTarget;
  }
    return currentSession.start(startConfig);
  }

  function stopGame(){
    if (!currentSession) return;
    currentSession.stop();
  }

  function updateGameConfig(config = {}){
    if (!currentSession) return;
    currentSession.updateConfig(config);
  }

  function getCurrentSession(){
    return currentSession;
  }

  function setUnitSkin(unitId, skinKey){
    if (!currentSession) return false;
    return currentSession.setUnitSkin(unitId, skinKey);
  }

  function onGameEvent(type, handler){
    if (!currentSession) return ()=>{};
    return currentSession.onEvent(type, handler);
  }

  exports.gameEvents = __reexport0.gameEvents;
  exports.emitGameEvent = __reexport0.emitGameEvent;
  exports.TURN_START = __reexport0.TURN_START;
  exports.TURN_END = __reexport0.TURN_END;
  exports.ACTION_START = __reexport0.ACTION_START;
  exports.ACTION_END = __reexport0.ACTION_END;
  exports.startGame = startGame;
  exports.stopGame = stopGame;
  exports.updateGameConfig = updateGameConfig;
  exports.getCurrentSession = getCurrentSession;
  exports.setUnitSkin = setUnitSkin;
  exports.onGameEvent = onGameEvent;
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
    classOf(id){ return (this.get(id)?.class) ?? null; },
    rankOf(id){  return (this.get(id)?.rank)  ?? null; },
    kit(id){     return (this.get(id)?.kit)   ?? null; },
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
    if (opts.revive) return Math.max(0, (opts.reviveSpec?.rage) ?? 0);
    return onSpawn.rage ?? 0;
  }

  exports.Meta = Meta;
  exports.makeInstanceStats = makeInstanceStats;
  exports.initialRageFor = initialRageFor;
});
__define('./modes/coming-soon.stub.js', (exports, module, __require) => {
  const comingSoon = true;

  function describe(){
    return 'coming-soon';
  }

  const __defaultExport = {
    comingSoon
  };
  exports.comingSoon = comingSoon;
  exports.describe = describe;
  exports.default = __defaultExport;
  module.exports.default = exports.default;
});
__define('./modes/pve/session.js', (exports, module, __require) => {
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
  const __dep11 = __require('./background.js');
  const drawEnvironmentProps = __dep11.drawEnvironmentProps;
  const __dep12 = __require('./art.js');
  const getUnitArt = __dep12.getUnitArt;
  const setUnitSkin = __dep12.setUnitSkin;
  const __dep13 = __require('./ui.js');
  const initHUD = __dep13.initHUD;
  const startSummonBar = __dep13.startSummonBar;
  const __dep14 = __require('./vfx.js');
  const vfxDraw = __dep14.vfxDraw;
  const vfxAddSpawn = __dep14.vfxAddSpawn;
  const vfxAddHit = __dep14.vfxAddHit;
  const vfxAddMelee = __dep14.vfxAddMelee;
  const __dep15 = __require('./scene.js');
  const drawBattlefieldScene = __dep15.drawBattlefieldScene;
  const __dep16 = __require('./events.js');
  const gameEvents = __dep16.gameEvents;
  const TURN_START = __dep16.TURN_START;
  const TURN_END = __dep16.TURN_END;
  const ACTION_START = __dep16.ACTION_START;
  const ACTION_END = __dep16.ACTION_END;
  const __dep17 = __require('./utils/dummy.js');
  const ensureNestedModuleSupport = __dep17.ensureNestedModuleSupport;
  /** @type {HTMLCanvasElement|null} */ let canvas = null;
  /** @type {CanvasRenderingContext2D|null} */ let ctx = null;
  /** @type {{update:(g:any)=>void}|null} */ let hud = null;   // ← THÊM
  const CAM_PRESET = CAM[CFG.CAMERA] || CAM.landscape_oblique;
  const HAND_SIZE  = CFG.HAND_SIZE ?? 4;

  ensureNestedModuleSupport();

  // --- Instance counters (để gắn id cho token/minion) ---
  let _IID = 1;
  let _BORN = 1;
  const nextIid = ()=> _IID++;

  let Game = null;
  let tickLoopHandle = null;
  let tickLoopUsesTimeout = false;
  let resizeHandler = null;
  let canvasClickHandler = null;
  let artSpriteHandler = null;
  let visibilityHandlerBound = false;
  let winRef = null;
  let docRef = null;
  let rootElement = null;
  let storedConfig = {};
  let running = false;
  let sceneCache = null;

  function normalizeConfig(input = {}){
    const out = { ...input };
    const scene = input.scene || {};
    if (typeof out.sceneTheme === 'undefined' && typeof scene.theme !== 'undefined'){
      out.sceneTheme = scene.theme;
    }
    if (typeof out.backgroundKey === 'undefined'){
      if (typeof scene.backgroundKey !== 'undefined') out.backgroundKey = scene.backgroundKey;
      else if (typeof scene.background !== 'undefined') out.backgroundKey = scene.background;
    }
    delete out.scene;
    return out;
  }

  function createGameState(options = {}){
    options = normalizeConfig(options);
    const sceneTheme = options.sceneTheme
      ?? CFG.SCENE?.CURRENT_THEME
      ?? CFG.SCENE?.DEFAULT_THEME;
    const backgroundKey = options.backgroundKey
      ?? CFG.CURRENT_BACKGROUND
      ?? CFG.SCENE?.CURRENT_BACKGROUND
      ?? CFG.SCENE?.CURRENT_THEME
      ?? CFG.SCENE?.DEFAULT_THEME;

    const allyUnits = Array.isArray(options.deck) && options.deck.length
      ? options.deck
      : UNITS;
    const enemyPreset = options.aiPreset || {};
    const enemyUnits = Array.isArray(enemyPreset.deck) && enemyPreset.deck.length
      ? enemyPreset.deck
      : (Array.isArray(enemyPreset.unitsAll) && enemyPreset.unitsAll.length ? enemyPreset.unitsAll : UNITS);

    const game = {
      grid: null,
      tokens: [],
      cost: 0,
      costCap: Number.isFinite(options.costCap) ? options.costCap : CFG.COST_CAP,
      summoned: 0,
      summonLimit: Number.isFinite(options.summonLimit) ? options.summonLimit : CFG.SUMMON_LIMIT,

      // deck-3 + quản lý “độc nhất”
      unitsAll: allyUnits,
      usedUnitIds: new Set(),       // những unit đã ra sân
      deck3: [],                    // mảng 3 unit
      selectedId: null,
      ui: { bar: null },
      turn: { phase: 'ally', last: { ally: 0, enemy: 0 }, cycle: 0, busyUntil: 0 },
      queued: { ally: new Map(), enemy: new Map() },
      actionChain: [],
      events: gameEvents,
      sceneTheme,
      backgroundKey
    };

    game.ai = {
      cost: 0,
      costCap: Number.isFinite(enemyPreset.costCap) ? enemyPreset.costCap : (enemyPreset.costCap ?? CFG.COST_CAP),
      summoned: 0,
      summonLimit: Number.isFinite(enemyPreset.summonLimit) ? enemyPreset.summonLimit : (enemyPreset.summonLimit ?? CFG.SUMMON_LIMIT),
      unitsAll: enemyUnits,
      usedUnitIds: new Set(),
      deck: Array.isArray(enemyPreset.startingDeck) ? enemyPreset.startingDeck.slice() : [],
      selectedId: null,
      lastThinkMs: 0,
      lastDecision: null
    };

    game.meta = Meta;
    return game;
  }

  function resetSessionState(options = {}){
    storedConfig = normalizeConfig({ ...storedConfig, ...options });
    Game = createGameState(storedConfig);
    _IID = 1;
    _BORN = 1;
    CLOCK = createClock();
    invalidateSceneCache();
  }

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

  function invalidateSceneCache(){
    sceneCache = null;
  }

  function createSceneCacheCanvas(pixelWidth, pixelHeight){
    if (!Number.isFinite(pixelWidth) || !Number.isFinite(pixelHeight)) return null;
    const safeW = Math.max(1, Math.floor(pixelWidth));
    const safeH = Math.max(1, Math.floor(pixelHeight));
    if (typeof OffscreenCanvas === 'function'){
      try {
        return new OffscreenCanvas(safeW, safeH);
      } catch (_) {}
    }
    const doc = docRef || (typeof document !== 'undefined' ? document : null);
    if (!doc || typeof doc.createElement !== 'function') return null;
    const offscreen = doc.createElement('canvas');
    offscreen.width = safeW;
    offscreen.height = safeH;
    return offscreen;
  }

  function ensureSceneCache(){
    if (!Game || !Game.grid) return null;
    const grid = Game.grid;
    const sceneCfg = CFG.SCENE || {};
    const themeKey = Game.sceneTheme || sceneCfg.CURRENT_THEME || sceneCfg.DEFAULT_THEME;
    const theme = (sceneCfg.THEMES && themeKey) ? sceneCfg.THEMES[themeKey] : null;
    const backgroundKey = Game.backgroundKey;
    const dpr = grid.dpr ?? 1;
    const cssWidth = grid.w ?? (canvas ? canvas.width / dpr : 0);
    const cssHeight = grid.h ?? (canvas ? canvas.height / dpr : 0);
    if (!cssWidth || !cssHeight) return null;
    const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
    const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));

    let needsRebuild = false;
    if (!sceneCache) needsRebuild = true;
    else if (sceneCache.pixelWidth !== pixelWidth || sceneCache.pixelHeight !== pixelHeight) needsRebuild = true;
    else if (sceneCache.themeKey !== themeKey || sceneCache.backgroundKey !== backgroundKey) needsRebuild = true;
    else if (sceneCache.dpr !== dpr) needsRebuild = true;

    if (!needsRebuild) return sceneCache;

    const offscreen = createSceneCacheCanvas(pixelWidth, pixelHeight);
    if (!offscreen) return null;
    const cacheCtx = offscreen.getContext('2d');
    if (!cacheCtx) return null;

    if (typeof cacheCtx.resetTransform === 'function'){
      cacheCtx.resetTransform();
    } else if (typeof cacheCtx.setTransform === 'function'){
      cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
    }
    cacheCtx.clearRect(0, 0, pixelWidth, pixelHeight);

    if (typeof cacheCtx.setTransform === 'function'){
      cacheCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    } else if (dpr !== 1 && typeof cacheCtx.scale === 'function'){
      cacheCtx.scale(dpr, dpr);
    }

    try {
      drawBattlefieldScene(cacheCtx, grid, theme);
      drawEnvironmentProps(cacheCtx, grid, CAM_PRESET, backgroundKey);
    } catch (err) {
      console.error('[scene-cache]', err);
      return null;
    }

    sceneCache = {
      canvas: offscreen,
      pixelWidth,
      pixelHeight,
      cssWidth,
      cssHeight,
      themeKey,
      backgroundKey,
      dpr
    };
    return sceneCache;
  }

  function refreshQueuedArtFor(unitId){
    const apply = (map)=>{
      if (!map || typeof map.values !== 'function') return;
      for (const pending of map.values()){
        if (!pending || pending.unitId !== unitId) continue;
        const updated = getUnitArt(unitId);
        pending.art = updated;
        pending.skinKey = updated?.skinKey;
        if (!pending.color && updated?.palette?.primary){
          pending.color = updated.palette.primary;
        }
      }
    };
    apply(Game.queued?.ally);
    apply(Game.queued?.enemy);
  }

  function setUnitSkinForSession(unitId, skinKey){
    if (!Game) return false;
    const ok = setUnitSkin(unitId, skinKey);
    if (!ok) return false;
    for (const token of Game.tokens){
      if (!token || token.id !== unitId) continue;
      const art = getUnitArt(unitId);
      token.art = art;
      token.skinKey = art?.skinKey;
      if (!token.color && art?.palette?.primary){
        token.color = art.palette.primary;
      }
    }
    refreshQueuedArtFor(unitId);
    scheduleDraw();
    return true;
  }

  function setDrawPaused(paused){
    drawPaused = !!paused;
    if (drawPaused){
      cancelScheduledDraw();
    } else {
      scheduleDraw();
    }
  }
  function bindArtSpriteListener(){
    if (!winRef || typeof winRef.addEventListener !== 'function') return;
    if (artSpriteHandler) return;
    artSpriteHandler = ()=>{ invalidateSceneCache(); scheduleDraw(); };
    winRef.addEventListener(ART_SPRITE_EVENT, artSpriteHandler);
  }

  function unbindArtSpriteListener(){
    if (!winRef || !artSpriteHandler || typeof winRef.removeEventListener !== 'function') return;
    winRef.removeEventListener(ART_SPRITE_EVENT, artSpriteHandler);
    artSpriteHandler = null;
  }
  // Master clock theo timestamp – tránh drift giữa nhiều interval
  let CLOCK = null;

  function createClock(){
    const now = performance.now();
    return {
      startMs: now,
      lastTimerRemain: 240,
      lastCostCreditedSec: 0,
      turnEveryMs: 600,
      lastTurnStepMs: now
    };
  }

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
          const hpPct = Math.max(0, Math.min(1, (u.revived?.hpPct) ?? 0.5));
          const healAmt = Math.max(1, Math.round((ally.hpMax || 0) * hpPct));
          healUnit(ally, healAmt);
          ally.rage = Math.max(0, (u.revived?.rage) ?? 0);
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
  const tokensAlive = () => (Game?.tokens || []).filter(t => t.alive);
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
    if (Game?._inited) return;
    const doc = docRef || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;
    const boardEl = /** @type {HTMLCanvasElement} */ (doc.getElementById('board'));
    if (!boardEl) return;
    canvas = boardEl;
    ctx = /** @type {CanvasRenderingContext2D} */ (boardEl.getContext('2d'));

    hud = initHUD(doc);

    resize();
    spawnLeaders(Game.tokens, Game.grid);

    Game.tokens.forEach(t=>{
      if (t.id === 'leaderA' || t.id === 'leaderB'){
        vfxAddSpawn(Game, t.cx, t.cy, t.side);
      }
    });
    Game.tokens.forEach(t=>{
      if (!t.iid) t.iid = nextIid();
      if (t.id === 'leaderA' || t.id === 'leaderB'){
        Object.assign(t, {
          hpMax: 1600, hp: 1600, arm: 0.12, res: 0.12, atk: 40, wil: 30,
          aeMax: 0, ae: 0, rage: 0
        });
      }
    });
    Game.tokens.forEach(t => { if (!t.iid) t.iid = nextIid(); });

    hud.update(Game);
    scheduleDraw();
    Game._inited = true;

    refillDeck();
    refillDeckEnemy(Game);

    Game.ui.bar = startSummonBar(doc, {
      onPick: (c)=>{
        Game.selectedId = c.id;
        Game.ui.bar.render();
      },
      canAfford: (c)=> Game.cost >= c.cost,
      getDeck: ()=> Game.deck3,
      getSelectedId: ()=> Game.selectedId
    });

    selectFirstAffordable();
    Game.ui.bar.render();

    if (canvasClickHandler){
      canvas.removeEventListener('click', canvasClickHandler);
      canvasClickHandler = null;
    }
    canvasClickHandler = (ev)=>{
      const rect = canvas.getBoundingClientRect();
      const p = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      const cell = hitToCellOblique(Game.grid, p.x, p.y, CAM_PRESET);
      if (!cell) return;

      if (cell.cx >= CFG.ALLY_COLS) return;

      const card = Game.deck3.find(u => u.id === Game.selectedId);
      if (!card) return;

      if (cellReserved(tokensAlive(), Game.queued, cell.cx, cell.cy)) return;
      if (Game.cost < card.cost) return;
      if (Game.summoned >= Game.summonLimit) return;

      const slot = slotIndex('ally', cell.cx, cell.cy);
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
        art: pendingArt,
        skinKey: pendingArt?.skinKey
      };
      Game.queued.ally.set(slot, pending);

      Game.cost = Math.max(0, Game.cost - card.cost);
      hud.update(Game);
      Game.summoned += 1;
      Game.usedUnitIds.add(card.id);

      Game.deck3 = Game.deck3.filter(u => u.id !== card.id);
      Game.selectedId = null;
      refillDeck();
      selectFirstAffordable();
      Game.ui.bar.render();
      scheduleDraw();
    };
    canvas.addEventListener('click', canvasClickHandler);

    if (resizeHandler && winRef && typeof winRef.removeEventListener === 'function'){
      winRef.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    resizeHandler = ()=>{ resize(); scheduleDraw(); };
    if (winRef && typeof winRef.addEventListener === 'function'){
      winRef.addEventListener('resize', resizeHandler);
    }

    const updateTimerAndCost = (timestamp)=>{
      if (!CLOCK) return;
      const now = Number.isFinite(timestamp) ? timestamp : performance.now();
      const elapsedSec = Math.floor((now - CLOCK.startMs) / 1000);

      const remain = Math.max(0, 240 - elapsedSec);
      if (remain !== CLOCK.lastTimerRemain){
        CLOCK.lastTimerRemain = remain;
        const mm = String(Math.floor(remain/60)).padStart(2,'0');
        const ss = String(remain%60).padStart(2,'0');
        const tEl = doc.getElementById('timer');
        if (tEl) tEl.textContent = `${mm}:${ss}`;
      }

      const deltaSec = elapsedSec - CLOCK.lastCostCreditedSec;
      if (deltaSec > 0) {
        if (Game.cost < Game.costCap) {
          Game.cost = Math.min(Game.costCap, Game.cost + deltaSec);
        }
        if (Game.ai.cost < Game.ai.costCap) {
          Game.ai.cost = Math.min(Game.ai.costCap, Game.ai.cost + deltaSec);
        }

        CLOCK.lastCostCreditedSec = elapsedSec;

        hud.update(Game);
        if (!Game.selectedId) selectFirstAffordable();
        if (Game.ui?.bar) Game.ui.bar.render();
        aiMaybeAct(Game, 'cost');
      }

      const busyUntil = (Game.turn?.busyUntil) ?? 0;
      if (now >= busyUntil && now - CLOCK.lastTurnStepMs >= CLOCK.turnEveryMs){
        CLOCK.lastTurnStepMs = now;
        stepTurn(Game, {
          performUlt,
          processActionChain,
          allocIid: nextIid,
          doActionOrSkip
        });
        cleanupDead(now);
        scheduleDraw();
        aiMaybeAct(Game, 'board');
      }
    };

    const runTickLoop = (timestamp)=>{
      tickLoopHandle = null;
      updateTimerAndCost(timestamp);
      if (!running || !CLOCK) return;
      scheduleTickLoop();
    };

    function scheduleTickLoop(){
      if (!running || !CLOCK) return;
      if (tickLoopHandle !== null) return;
      const raf = (winRef && typeof winRef.requestAnimationFrame === 'function')
        ? winRef.requestAnimationFrame.bind(winRef)
        : (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null);
      if (raf){
        tickLoopUsesTimeout = false;
        tickLoopHandle = raf(runTickLoop);
      } else {
        tickLoopUsesTimeout = true;
        tickLoopHandle = setTimeout(()=> runTickLoop(performance.now()), 16);
      }
    }
    
    updateTimerAndCost(performance.now());
    scheduleTickLoop();
  }

  function selectFirstAffordable(){
    if (!Game) return;

    const deck = Array.isArray(Game.deck3) ? Game.deck3 : [];
    if (!deck.length){
      Game.selectedId = null;
      return;
    }

    const affordable = deck.find(card => {
      if (!card) return false;
      if (!Number.isFinite(card.cost)) return true;
      return card.cost <= Game.cost;
    });

    const chosen = affordable || deck[0] || null;
    Game.selectedId = chosen ? chosen.id : null;
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
    const prevGrid = Game?.grid ? {
      w: Game.grid.w,
      h: Game.grid.h,
      dpr: Game.grid.dpr,
      cols: Game.grid.cols,
      rows: Game.grid.rows,
      tile: Game.grid.tile
    } : null;
    Game.grid = makeGrid(canvas, CFG.GRID_COLS, CFG.GRID_ROWS);
    if (ctx && Game.grid){
      const maxDprCfg = CFG.UI?.MAX_DPR;
      const maxDpr = Number.isFinite(maxDprCfg) && maxDprCfg > 0 ? maxDprCfg : 3;
      const view = winRef || (typeof window !== 'undefined' ? window : null);
      const viewDprRaw = Number.isFinite(view?.devicePixelRatio) && (view?.devicePixelRatio || 0) > 0
        ? view.devicePixelRatio
        : 1;
      const fallbackDpr = Math.min(maxDpr, viewDprRaw);
      const gridDpr = Number.isFinite(Game.grid.dpr) && Game.grid.dpr > 0
        ? Math.min(maxDpr, Game.grid.dpr)
        : fallbackDpr;
      const dpr = gridDpr;
      if (typeof ctx.setTransform === 'function'){
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      } else {
        if (typeof ctx.resetTransform === 'function'){
          ctx.resetTransform();
        }
        if (typeof ctx.scale === 'function'){
          ctx.scale(dpr, dpr);
        }
      }
    }
    const g = Game.grid;
    const gridChanged = !prevGrid
      || prevGrid.w !== g.w
      || prevGrid.h !== g.h
      || prevGrid.dpr !== g.dpr
      || prevGrid.cols !== g.cols
      || prevGrid.rows !== g.rows
      || prevGrid.tile !== g.tile;
    if (gridChanged){
      invalidateSceneCache();
    }
  }
  function draw(){
    if (!ctx || !canvas || !Game.grid) return;            // guard
    const clearW = Game.grid.w ?? canvas.width;
    const clearH = Game.grid.h ?? canvas.height;
    ctx.clearRect(0, 0, clearW, clearH);
    const cache = ensureSceneCache();
    if (cache && cache.canvas){
      ctx.drawImage(cache.canvas, 0, 0, cache.pixelWidth, cache.pixelHeight, 0, 0, cache.cssWidth, cache.cssHeight);
    } else {
      const sceneCfg = CFG.SCENE || {};
      const themeKey = Game.sceneTheme || sceneCfg.CURRENT_THEME || sceneCfg.DEFAULT_THEME;
      const theme = (sceneCfg.THEMES && themeKey) ? sceneCfg.THEMES[themeKey] : null;
      drawBattlefieldScene(ctx, Game.grid, theme);
      drawEnvironmentProps(ctx, Game.grid, CAM_PRESET, Game.backgroundKey);
    }
    drawGridOblique(ctx, Game.grid, CAM_PRESET);
    drawQueuedOblique(ctx, Game.grid, Game.queued, CAM_PRESET);
    drawTokensOblique(ctx, Game.grid, Game.tokens, CAM_PRESET);
    vfxDraw(ctx, Game, CAM_PRESET);
    drawHPBars();
  }
  function cellCenterObliqueLocal(g, cx, cy, C){
    const colsW = g.tile * g.cols;
    const topScale = ((C?.topScale) ?? 0.80);
    const rowGap = ((C?.rowGapRatio) ?? 0.62) * g.tile;

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

    const k = ((C?.depthScale) ?? 0.94);
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
      const art = t.art || getUnitArt(t.id, { skinKey: t.skinKey });
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
  function handleVisibilityChange(){
    if (!docRef) return;
    setDrawPaused(!!docRef.hidden);
  }

  function bindVisibility(){
    if (visibilityHandlerBound) return;
    const doc = docRef;
    if (!doc || typeof doc.addEventListener !== 'function') return;
    doc.addEventListener('visibilitychange', handleVisibilityChange);
    visibilityHandlerBound = true;
  }

  function unbindVisibility(){
    if (!visibilityHandlerBound) return;
    const doc = docRef;
    if (doc && typeof doc.removeEventListener === 'function'){
      doc.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    visibilityHandlerBound = false;
  }

  function configureRoot(root){
    rootElement = root || null;
    if (rootElement && rootElement.ownerDocument){
      docRef = rootElement.ownerDocument;
    } else if (rootElement && rootElement.nodeType === 9){
      docRef = rootElement;
    } else {
      docRef = typeof document !== 'undefined' ? document : null;
    }
    winRef = docRef?.defaultView ?? (typeof window !== 'undefined' ? window : null);
  }

  function clearSessionTimers(){
    if (tickLoopHandle !== null){
      if (tickLoopUsesTimeout){
        clearTimeout(tickLoopHandle);
      } else {
        const cancel = (winRef && typeof winRef.cancelAnimationFrame === 'function')
          ? winRef.cancelAnimationFrame.bind(winRef)
          : (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : null);
        if (cancel){
          cancel(tickLoopHandle);
        }
      }
      tickLoopHandle = null;
      tickLoopUsesTimeout = false;
    }
    cancelScheduledDraw();
  }

  function clearSessionListeners(){
    if (canvas && canvasClickHandler && typeof canvas.removeEventListener === 'function'){
      canvas.removeEventListener('click', canvasClickHandler);
    }
    canvasClickHandler = null;
    if (resizeHandler && winRef && typeof winRef.removeEventListener === 'function'){
      winRef.removeEventListener('resize', resizeHandler);
    }
    resizeHandler = null;
    unbindArtSpriteListener();
    unbindVisibility();
  }

  function resetDomRefs(){
    canvas = null;
    ctx = null;
    hud = null;
    invalidateSceneCache();
  }

  function stopSession(){
    clearSessionTimers();
    clearSessionListeners();
    if (Game){
      if (Game.queued?.ally?.clear) Game.queued.ally.clear();
      if (Game.queued?.enemy?.clear) Game.queued.enemy.clear();
      if (Array.isArray(Game.tokens)) Game.tokens.length = 0;
      if (Array.isArray(Game.deck3)) Game.deck3.length = 0;
      if (Game.usedUnitIds?.clear) Game.usedUnitIds.clear();
      if (Game.ai){
        Game.ai.deck = Array.isArray(Game.ai.deck) ? [] : Game.ai.deck;
        if (Game.ai.usedUnitIds?.clear) Game.ai.usedUnitIds.clear();
        Game.ai.selectedId = null;
        Game.ai.cost = 0;
        Game.ai.summoned = 0;
      }
      Game.cost = 0;
      Game.summoned = 0;
      Game.selectedId = null;
      Game._inited = false;
    }
    resetDomRefs();
    CLOCK = null;
    Game = null;
    running = false;
    invalidateSceneCache();
  }

  function bindSession(){
    bindArtSpriteListener();
    bindVisibility();
    if (docRef){
      setDrawPaused(!!docRef.hidden);
    } else {
      setDrawPaused(false);
    }
  }

  function startSession(config = {}){
    configureRoot(rootElement);
    const overrides = normalizeConfig(config);
    if (running) stopSession();
    resetSessionState(overrides);
    resetDomRefs();
    running = true;
    try {
      init();
      if (!Game || !Game._inited){
        throw new Error('Unable to initialise PvE session');
      }
      bindSession();
      return Game;
    } catch (err) {
      running = false;
      stopSession();
      throw err;
    }
  }

  function applyConfigToRunningGame(cfg){
    if (!Game) return;
    let sceneChanged = false;
    if (typeof cfg.sceneTheme !== 'undefined'){
      if (Game.sceneTheme !== cfg.sceneTheme) sceneChanged = true;
      Game.sceneTheme = cfg.sceneTheme;
    }
    if (typeof cfg.backgroundKey !== 'undefined'){
      if (Game.backgroundKey !== cfg.backgroundKey) sceneChanged = true;
      Game.backgroundKey = cfg.backgroundKey;
    }
    if (Array.isArray(cfg.deck) && cfg.deck.length) Game.unitsAll = cfg.deck;
    if (cfg.aiPreset){
      const preset = cfg.aiPreset || {};
      if (Array.isArray(preset.deck) && preset.deck.length){
        Game.ai.unitsAll = preset.deck;
      } else if (Array.isArray(preset.unitsAll) && preset.unitsAll.length){
        Game.ai.unitsAll = preset.unitsAll;
      }
      if (Number.isFinite(preset.costCap)) Game.ai.costCap = preset.costCap;
      if (Number.isFinite(preset.summonLimit)) Game.ai.summonLimit = preset.summonLimit;
    }
    if (sceneChanged){
      invalidateSceneCache();
      scheduleDraw();
    }
  }

  function updateSessionConfig(next = {}){
    const normalized = normalizeConfig(next);
    storedConfig = normalizeConfig({ ...storedConfig, ...normalized });
    applyConfigToRunningGame(normalized);
  }

  function onSessionEvent(type, handler){
    if (!type || typeof handler !== 'function') return ()=>{};
    if (!gameEvents || typeof gameEvents.addEventListener !== 'function') return ()=>{};
    gameEvents.addEventListener(type, handler);
    return ()=>{
      if (typeof gameEvents.removeEventListener === 'function'){
        gameEvents.removeEventListener(type, handler);
      }
    };
  }

  function createPveSession(rootEl, options = {}){
    storedConfig = normalizeConfig(options || {});
    configureRoot(rootEl);
    return {
      start(startConfig = {}){
        if (startConfig && (startConfig.root || startConfig.rootEl)) {
          const r = startConfig.root || startConfig.rootEl;
          const rest = { ...startConfig };
          delete rest.root;
          delete rest.rootEl;
          configureRoot(r);
          return startSession(rest);
        }
        return startSession(startConfig);
      },
      stop(){
        stopSession();
      },
      updateConfig(next = {}){
        updateSessionConfig(next);
      },
      setUnitSkin(unitId, skinKey){
        return setUnitSkinForSession(unitId, skinKey);
      },
      onEvent: onSessionEvent
    };
  }

  const __reexport0 = __require('./events.js');

  exports.gameEvents = __reexport0.gameEvents;
  exports.emitGameEvent = __reexport0.emitGameEvent;
  exports.TURN_START = __reexport0.TURN_START;
  exports.TURN_END = __reexport0.TURN_END;
  exports.ACTION_START = __reexport0.ACTION_START;
  exports.ACTION_END = __reexport0.ACTION_END;
  exports.createPveSession = createPveSession;
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
__define('./scene.js', (exports, module, __require) => {
  const DEFAULT_THEME = {
    sky: {
      top: '#1b2434',
      mid: '#2f455e',
      bottom: '#55759a',
      glow: 'rgba(255, 236, 205, 0.35)'
    },
    horizon: {
      color: '#f4d9ad',
      glow: 'rgba(255, 236, 205, 0.55)',
      height: 0.22,
      thickness: 0.9
    },
    ground: {
      top: '#312724',
      accent: '#3f302c',
      bottom: '#181210',
      highlight: '#6c5344',
      parallax: 0.12,
      topScale: 0.9,
      bottomScale: 1.45
    }
  };

  function mergeTheme(theme){
    if (!theme) return DEFAULT_THEME;
    return {
      sky: { ...DEFAULT_THEME.sky, ...(theme.sky || {}) },
      horizon: { ...DEFAULT_THEME.horizon, ...(theme.horizon || {}) },
      ground: { ...DEFAULT_THEME.ground, ...(theme.ground || {}) }
    };
  }

  function hexToRgb(hex){
    if (typeof hex !== 'string') return null;
    let value = hex.trim();
    if (!value.startsWith('#')) return null;
    value = value.slice(1);
    if (value.length === 3){
      value = value.split('').map(ch => ch + ch).join('');
    }
    if (value.length !== 6) return null;
    const num = Number.parseInt(value, 16);
    if (Number.isNaN(num)) return null;
    return {
      r: (num >> 16) & 0xff,
      g: (num >> 8) & 0xff,
      b: num & 0xff
    };
  }

  function mixHex(a, b, t){
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    if (!ca || !cb) return t < 0.5 ? (a || b) : (b || a);
    const mix = (x, y)=> Math.round(x + (y - x) * t);
    const r = mix(ca.r, cb.r);
    const g = mix(ca.g, cb.g);
    const bVal = mix(ca.b, cb.b);
    return `rgb(${r}, ${g}, ${bVal})`;
  }

  function drawBattlefieldScene(ctx, g, theme){
    if (!ctx || !g) return;
    const t = mergeTheme(theme);
    const w = g.w ?? ctx.canvas.width;
    const h = g.h ?? ctx.canvas.height;
    const boardTop = g.oy;
    const boardHeight = g.tile * g.rows;
    const boardBottom = boardTop + boardHeight;
    const centerX = g.ox + (g.tile * g.cols) / 2;

    ctx.save();

    // --- Sky gradient ---
    const skyGradient = ctx.createLinearGradient(0, 0, 0, boardBottom);
    skyGradient.addColorStop(0, t.sky.top);
    skyGradient.addColorStop(0.55, t.sky.mid);
    skyGradient.addColorStop(1, t.sky.bottom);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, w, boardBottom);

    // extend sky color below the board in case the canvas is taller
    if (boardBottom < h){
      ctx.fillStyle = t.sky.bottom;
      ctx.fillRect(0, boardBottom, w, h - boardBottom);
    }

    // --- Horizon glow band ---
    const horizonY = boardTop + Math.min(Math.max(t.horizon.height, 0), 1) * boardHeight;
    const glowHeight = Math.max(4, g.tile * t.horizon.thickness);
    const glowGradient = ctx.createLinearGradient(0, horizonY - glowHeight, 0, horizonY + glowHeight);
    glowGradient.addColorStop(0, 'rgba(0,0,0,0)');
    glowGradient.addColorStop(0.45, t.horizon.glow);
    glowGradient.addColorStop(0.55, t.horizon.glow);
    glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, Math.max(0, horizonY - glowHeight), w, glowHeight * 2);

    // Horizon line
    ctx.strokeStyle = t.horizon.color;
    ctx.lineWidth = Math.max(1, g.tile * 0.05);
    ctx.beginPath();
    ctx.moveTo(g.ox - g.tile, horizonY);
    ctx.lineTo(g.ox + g.tile * g.cols + g.tile, horizonY);
    ctx.stroke();

    // --- Ground base ---
    const groundTopWidth = g.tile * g.cols * t.ground.topScale;
    const groundBottomWidth = g.tile * g.cols * t.ground.bottomScale;
    const groundTop = boardTop + g.tile * 0.35;
    const groundBottom = h;
    const groundGradient = ctx.createLinearGradient(0, groundTop, 0, groundBottom);
    groundGradient.addColorStop(0, t.ground.top);
    groundGradient.addColorStop(0.45, t.ground.accent);
    groundGradient.addColorStop(1, t.ground.bottom);

    ctx.fillStyle = groundGradient;
    ctx.beginPath();
    ctx.moveTo(centerX - groundTopWidth / 2, groundTop);
    ctx.lineTo(centerX + groundTopWidth / 2, groundTop);
    ctx.lineTo(centerX + groundBottomWidth / 2, groundBottom);
    ctx.lineTo(centerX - groundBottomWidth / 2, groundBottom);
    ctx.closePath();
    ctx.fill();

    // --- Parallax stripes ---
    const layerCount = Math.max(4, g.rows * 2);
    const parallaxStrength = t.ground.parallax * g.tile;
    for (let i = 0; i < layerCount; i++){
      const t0 = i / layerCount;
      const t1 = (i + 1) / layerCount;
      const width0 = groundTopWidth + (groundBottomWidth - groundTopWidth) * t0;
      const width1 = groundTopWidth + (groundBottomWidth - groundTopWidth) * t1;
      const shift0 = (t0 - 0.5) * parallaxStrength;
      const shift1 = (t1 - 0.5) * parallaxStrength;
      const y0 = groundTop + (groundBottom - groundTop) * t0;
      const y1 = groundTop + (groundBottom - groundTop) * t1;
      const shade = mixHex(t.ground.highlight, t.ground.bottom, Math.pow(t0, 1.2));

      ctx.globalAlpha = 0.28;
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.moveTo(centerX - width0 / 2 + shift0, y0);
      ctx.lineTo(centerX + width0 / 2 + shift0, y0);
      ctx.lineTo(centerX + width1 / 2 + shift1, y1);
      ctx.lineTo(centerX - width1 / 2 + shift1, y1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // subtle rim light near the board edge
    const rimGradient = ctx.createLinearGradient(0, boardBottom - g.tile * 0.4, 0, boardBottom + g.tile);
    rimGradient.addColorStop(0, 'rgba(255,255,255,0.25)');
    rimGradient.addColorStop(0.4, 'rgba(255,255,255,0.08)');
    rimGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rimGradient;
    ctx.beginPath();
    ctx.moveTo(centerX - groundTopWidth / 2, boardBottom - g.tile * 0.4);
    ctx.lineTo(centerX + groundTopWidth / 2, boardBottom - g.tile * 0.4);
    ctx.lineTo(centerX + groundTopWidth / 2, boardBottom + g.tile);
    ctx.lineTo(centerX - groundTopWidth / 2, boardBottom + g.tile);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
  exports.drawBattlefieldScene = drawBattlefieldScene;
});
__define('./screens/main-menu/dialogues.js', (exports, module, __require) => {
  const __dep0 = __require('./art.js');
  const getUnitArt = __dep0.getUnitArt;

  const HERO_DEFAULT_ID = 'leaderA';

  const HERO_LIBRARY = {
    leaderA: {
      id: 'leaderA',
      name: 'Uyên',
      title: 'Hộ Độn Tuyến Đầu',
      faction: 'Đoàn Thủ Hộ Lam Quang',
      role: 'Kỵ sĩ phòng tuyến',
      portrait: 'leaderA',
      motto: 'Giữ vững ánh lam, bảo hộ tuyến đầu.',
      hotspots: [
        {
          key: 'sigil',
          label: 'Ấn Tịnh Quang',
          description: 'Điều chỉnh giáp hộ thân – cực kỳ nhạy cảm.',
          cue: 'sensitive',
          type: 'sensitive'
        }
      ],
      dialogues: {
        intro: {
          male: [
            { text: 'Huynh đến đúng lúc, đội trinh sát đang chờ hiệu lệnh.', tone: 'greeting' },
            { text: 'Sương sớm thuận lợi cho một trận phản công, huynh thấy sao?', tone: 'greeting' }
          ],
          female: [
            { text: 'Tỷ về rồi à? Học viện chắc nhớ tỷ lắm.', tone: 'greeting' },
            { text: 'Đại tỷ đến rồi, đội hình lập tức trật tự hơn hẳn.', tone: 'greeting' }
          ],
          neutral: [
            { text: 'Ngày mới, chiến tuyến mới. Ta luôn sẵn sàng.', tone: 'greeting' },
            { text: 'Chúng ta hành quân khi ánh lam còn phủ cả mặt đất.', tone: 'greeting' }
          ]
        },
        hover: {
          male: [
            { text: 'Yên tâm, áo giáp đã được gia cố. Chỉ cần huynh ra hiệu.', tone: 'focus' },
            { text: 'Huynh cứ nói, Uyên sẽ nghe.', tone: 'focus' }
          ],
          female: [
            { text: 'Tỷ định thay đổi đội hình à? Uyên sẽ thích ứng ngay.', tone: 'focus' },
            { text: 'Đừng quên khởi động, tỷ nhé. Giáp lam khá nặng đó.', tone: 'gentle' }
          ],
          neutral: [
            { text: 'Tôi đang nghe chỉ huy. Có nhiệm vụ mới không?', tone: 'focus' }
          ]
        },
        tap: {
          male: [
            { text: 'Cho Uyên tọa độ, huynh sẽ thấy tuyến đầu mở ra.', tone: 'motivate' },
            { text: 'Một mệnh lệnh thôi, huynh.', tone: 'motivate' }
          ],
          female: [
            { text: 'Uyên ổn cả, tỷ cứ tập trung chỉ huy.', tone: 'motivate' },
            { text: 'Chúng ta sẽ thắng gọn, tỷ tin chứ?', tone: 'motivate' }
          ],
          neutral: [
            { text: 'Chỉ cần hiệu lệnh, tôi sẽ dẫn đầu ngay.', tone: 'motivate' },
            { text: 'Cả đội đang nhìn vào chỉ huy đấy.', tone: 'motivate' }
          ]
        },
        sensitive: {
          male: [
            { text: 'Ấy! Đừng chạm vào ấn Tịnh Quang, dễ kích hoạt giáp hộ thân đó!', tone: 'warning' },
            { text: 'Huynh nghịch thế là bộ giáp khóa cứng mất!', tone: 'warning' }
          ],
          female: [
            { text: 'Khoan! Tỷ mà chạm nữa là cơ chế an toàn tự đóng lại đấy!', tone: 'warning' },
            { text: 'Ấn ấy nối trực tiếp với mạch nguyên tinh, nhạy lắm!', tone: 'warning' }
          ],
          neutral: [
            { text: 'Phần ấn điều khiển cực nhạy, xin đừng động vào.', tone: 'warning' },
            { text: 'Chạm mạnh là hệ thống phòng ngự lập tức kích hoạt đấy!', tone: 'warning' }
          ]
        },
        idle: {
          male: [
            { text: 'Bầu trời trong như vậy, chắc chắn là điềm tốt.', tone: 'calm' }
          ],
          female: [
            { text: 'Uyên sẽ kiểm tra lại dây khóa. Tỷ cứ yên tâm.', tone: 'calm' }
          ],
          neutral: [
            { text: 'Một hơi thở sâu trước trận chiến luôn giúp tinh thần vững hơn.', tone: 'calm' }
          ]
        }
      }
    },
    default: {
      id: HERO_DEFAULT_ID,
      name: 'Chiến binh Arclune',
      title: 'Hộ vệ tiền tuyến',
      faction: 'Arclune',
      role: 'Đa năng',
      portrait: HERO_DEFAULT_ID,
      motto: 'Vì ánh sáng Arclune.',
      hotspots: [
        {
          key: 'sigil',
          label: 'Phù hiệu chiến',
          description: 'Điểm neo năng lượng cần tránh va chạm.',
          cue: 'sensitive',
          type: 'sensitive'
        }
      ],
      dialogues: {
        intro: {
          neutral: [
            { text: 'Sẵn sàng cho mọi nhiệm vụ.', tone: 'greeting' }
          ]
        },
        hover: {
          neutral: [
            { text: 'Đợi lệnh từ chỉ huy.', tone: 'focus' }
          ]
        },
        tap: {
          neutral: [
            { text: 'Tiến lên vì Arclune!', tone: 'motivate' }
          ]
        },
        sensitive: {
          neutral: [
            { text: 'Điểm đó nhạy cảm đấy, xin nhẹ tay.', tone: 'warning' }
          ]
        },
        idle: {
          neutral: [
            { text: 'Luôn giữ trạng thái chiến đấu.', tone: 'calm' }
          ]
        }
      }
    }
  };

  const GENDER_MAP = {
    male: 'male',
    m: 'male',
    nam: 'male',
    anh: 'male',
    huynh: 'male',
    female: 'female',
    f: 'female',
    nu: 'female',
    chi: 'female',
    ty: 'female',
    undefined: 'neutral',
    null: 'neutral'
  };

  const CUE_LABELS = {
    intro: 'Chào hỏi',
    hover: 'Phản hồi',
    tap: 'Hiệu lệnh',
    sensitive: 'Cảnh báo',
    idle: 'Độc thoại'
  };

  const CUE_TONES = {
    greeting: 'greeting',
    focus: 'focus',
    gentle: 'gentle',
    motivate: 'motivate',
    warning: 'warning',
    calm: 'calm'
  };

  const TONE_TO_CUE = {
    intro: 'greeting',
    hover: 'focus',
    tap: 'motivate',
    sensitive: 'warning',
    idle: 'calm'
  };

  function normalizeGender(value){
    if (typeof value === 'string'){
      const key = value.trim().toLowerCase();
      if (key in GENDER_MAP) return GENDER_MAP[key];
    }
    return 'neutral';
  }

  function ensureArray(value){
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  function pickLine(pool){
    const list = ensureArray(pool).filter(Boolean);
    if (!list.length) return null;
    const index = Math.floor(Math.random() * list.length);
    const item = list[index];
    if (item && typeof item === 'object'){ return { text: item.text || '', tone: item.tone || null, label: item.label || null }; }
    return { text: String(item || ''), tone: null, label: null };
  }

  function inferTone(cue){
    return CUE_TONES[cue] || TONE_TO_CUE[cue] || 'calm';
  }

  function inferLabel(cue){
    return CUE_LABELS[cue] || 'Tương tác';
  }

  function getHeroProfile(heroId = HERO_DEFAULT_ID){
    const profile = HERO_LIBRARY[heroId] || HERO_LIBRARY.default;
    const art = getUnitArt(profile.portrait || heroId || HERO_DEFAULT_ID) || null;
    return {
      id: profile.id,
      name: profile.name,
      title: profile.title,
      faction: profile.faction,
      role: profile.role,
      motto: profile.motto,
      portrait: profile.portrait || heroId || HERO_DEFAULT_ID,
      hotspots: (profile.hotspots || []).map(item => ({ ...item })),
      art
    };
  }

  function getHeroHotspots(heroId = HERO_DEFAULT_ID){
    const profile = HERO_LIBRARY[heroId] || HERO_LIBRARY.default;
    return (profile.hotspots || []).map(item => ({ ...item }));
  }

  function getHeroDialogue(heroId, cue, options = {}){
    const targetCue = cue || 'intro';
    const gender = normalizeGender(options.gender);
    const zone = options.zone || null;
    const profile = HERO_LIBRARY[heroId] || HERO_LIBRARY.default;
    const fallback = HERO_LIBRARY.default;
    const table = profile.dialogues?.[targetCue] || fallback.dialogues?.[targetCue] || null;
    const pool = table ? (table[gender] || table.neutral || table.default || null) : null;
    const picked = pickLine(pool);
    const text = picked?.text?.trim() ? picked.text.trim() : '...';
    const tone = picked?.tone || inferTone(targetCue);
    const label = picked?.label || inferLabel(targetCue);
    return {
      heroId: profile.id,
      cue: targetCue,
      zone,
      text,
      tone,
      label
    };
  }

  function listAvailableHeroes(){
    return Object.keys(HERO_LIBRARY).filter(key => key !== 'default');
  }
  exports.HERO_DEFAULT_ID = HERO_DEFAULT_ID;
  exports.getHeroProfile = getHeroProfile;
  exports.getHeroHotspots = getHeroHotspots;
  exports.getHeroDialogue = getHeroDialogue;
  exports.listAvailableHeroes = listAvailableHeroes;
});
__define('./screens/main-menu/view.js', (exports, module, __require) => {
  const __dep0 = __require('./screens/main-menu/dialogues.js');
  const getHeroDialogue = __dep0.getHeroDialogue;
  const getHeroHotspots = __dep0.getHeroHotspots;
  const getHeroProfile = __dep0.getHeroProfile;
  const HERO_DEFAULT_ID = __dep0.HERO_DEFAULT_ID;

  const STYLE_ID = 'main-menu-view-style';

  const TONE_ICONS = {
    greeting: '✨',
    focus: '🎯',
    gentle: '🌬️',
    motivate: '🔥',
    warning: '⚠️',
    calm: '🌙'
  };

  const TAG_CLASS_MAP = new Map([
    ['PvE', 'mode-tag--pve'],
    ['PvP', 'mode-tag--pvp'],
    ['Coming soon', 'mode-tag--coming'],
    ['Kinh tế nguyên tinh', 'mode-tag--economy']
  ]);

  const SIDE_SLOTS = [
    {
      key: 'event',
      label: 'Sự kiện',
      title: 'Thông báo chiến dịch',
      description: 'Kênh sự kiện sẽ cập nhật tại đây. Tham gia để nhận nguyên tinh và danh vọng.'
    },
    {
      key: 'lottery',
      label: 'Vé số',
      title: 'Vé số Nguyên Tinh',
      description: 'Vé số tuần vẫn đang hoàn thiện. Giữ nguyên tinh để tham gia khi mở bán.'
    },
    {
      key: 'gacha',
      label: 'Gacha',
      title: 'Banner trạm tiếp tế',
      description: 'Quầy triệu hồi tướng chủ lực sẽ hiển thị banner ở vị trí này.'
    },
    {
      key: 'chat',
      label: 'Chat',
      title: 'Kênh quân đoàn',
      description: 'Xem nhanh tin nhắn gần nhất từ đội. Chức năng chat đang được kết nối.'
    }
  ];

  function ensureStyles(){
    let style = document.getElementById(STYLE_ID);
    if (!style || style.tagName.toLowerCase() !== 'style'){
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    const css = `
      .app--main-menu{padding:32px 16px 64px;}
      .main-menu-v2{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:32px;color:inherit;}
      .main-menu-v2__header{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-end;justify-content:space-between;}
      .main-menu-v2__brand{display:flex;flex-direction:column;gap:10px;max-width:520px;}
      .main-menu-v2__title{margin:0;font-size:44px;letter-spacing:.08em;text-transform:uppercase;}
      .main-menu-v2__subtitle{margin:0;color:#9cbcd9;line-height:1.6;font-size:17px;}
      .main-menu-v2__meta{display:flex;gap:12px;flex-wrap:wrap;}
      .main-menu-v2__meta-chip{padding:8px 16px;border-radius:999px;border:1px solid rgba(125,211,252,.32);background:rgba(18,28,38,.68);letter-spacing:.12em;font-size:12px;text-transform:uppercase;color:#aee4ff;}
      .main-menu-v2__layout{display:grid;grid-template-columns:minmax(0,3fr) minmax(240px,1fr);gap:32px;align-items:start;}
      .main-menu-v2__primary{display:flex;flex-direction:column;gap:32px;}
      .hero-section{display:flex;flex-direction:column;gap:16px;}
      .hero-panel{position:relative;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);border-radius:26px;overflow:hidden;border:1px solid rgba(125,211,252,.32);background:linear-gradient(135deg,var(--hero-secondary,rgba(20,32,44,.92)),rgba(12,20,28,.75));box-shadow:0 32px 68px rgba(3,8,16,.55);min-height:340px;transition:box-shadow .3s ease,border-color .3s ease;}
      .hero-panel::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 18% 24%,rgba(255,255,255,.18),transparent 58%);opacity:.6;pointer-events:none;}
      .hero-panel__info{position:relative;z-index:2;padding:32px;display:flex;flex-direction:column;gap:18px;background:linear-gradient(180deg,rgba(12,18,24,.85),rgba(12,18,24,.35));}
      .hero-panel__identity{display:flex;flex-direction:column;gap:6px;}
      .hero-panel__role{margin:0;font-size:13px;text-transform:uppercase;letter-spacing:.16em;color:rgba(174,228,255,.68);}
      .hero-panel__name{margin:0;font-size:26px;letter-spacing:.06em;}
      .hero-panel__motto{margin:0;font-size:14px;color:#9cbcd9;line-height:1.6;}
      .hero-dialogue{position:relative;background:rgba(12,24,34,.88);border:1px solid rgba(125,211,252,.28);border-radius:18px;padding:18px 22px;box-shadow:0 18px 42px rgba(6,10,16,.55);display:flex;flex-direction:column;gap:10px;min-height:96px;}
      .hero-dialogue__tone{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;display:flex;align-items:center;gap:6px;}
      .hero-dialogue__tone[data-tone="warning"]{color:#ffe066;}
      .hero-dialogue__tone[data-tone="motivate"]{color:#9fffe0;}
      .hero-dialogue__tone[data-tone="greeting"]{color:#aee4ff;}
      .hero-dialogue__tone[data-tone="gentle"]{color:#ffc9ec;}
      .hero-dialogue__tone[data-tone="focus"]{color:#7dd3fc;}
      .hero-dialogue__tone[data-tone="calm"]{color:#9cbcd9;}
      .hero-dialogue__text{margin:0;font-size:16px;line-height:1.6;color:#e6f2ff;}
      .hero-panel__canvas{position:relative;z-index:1;border:none;outline:none;background:linear-gradient(160deg,rgba(255,255,255,.05),rgba(9,15,21,.72));display:flex;align-items:flex-end;justify-content:center;cursor:pointer;overflow:hidden;padding:24px;min-height:340px;}
      .hero-panel__canvas img{width:92%;max-width:420px;height:auto;filter:drop-shadow(0 24px 48px rgba(0,0,0,.6));transition:transform .3s ease,filter .3s ease;}
      .hero-panel__glow{position:absolute;bottom:-38%;left:50%;transform:translateX(-50%);width:160%;height:160%;background:radial-gradient(circle,var(--hero-accent,rgba(125,211,252,.65)) 0%,transparent 65%);opacity:.45;transition:opacity .3s ease,transform .3s ease;pointer-events:none;}
      .hero-panel.is-hovered{border-color:rgba(125,211,252,.5);box-shadow:0 36px 72px rgba(6,12,20,.65);}
      .hero-panel.is-hovered .hero-panel__canvas img{transform:translateY(-8px) scale(1.04);filter:drop-shadow(0 28px 52px rgba(0,0,0,.7));}
      .hero-panel.is-hovered .hero-panel__glow{opacity:.72;}
      .hero-panel.is-pressed .hero-panel__canvas img{transform:translateY(2px) scale(.98);}
      .hero-panel--alert{animation:hero-alert .8s ease;}
      @keyframes hero-alert{0%{box-shadow:0 34px 76px rgba(40,10,10,.65);}40%{box-shadow:0 20px 56px rgba(120,40,20,.55);}100%{box-shadow:0 32px 68px rgba(3,8,16,.55);}}
      .hero-panel__hotspot{position:absolute;border:1px dashed rgba(255,255,255,.42);background:rgba(125,211,252,.16);backdrop-filter:blur(2px);border-radius:50%;width:30%;height:30%;top:24%;right:18%;opacity:0;transform:scale(.9);transition:opacity .2s ease,transform .2s ease,border-color .2s ease;background-clip:padding-box;}
      .hero-panel__hotspot span{position:absolute;bottom:-36px;left:50%;transform:translateX(-50%);background:rgba(8,16,24,.92);padding:6px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.4);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#c8e7ff;white-space:nowrap;opacity:0;transition:opacity .2s ease,transform .2s ease;pointer-events:none;}
      .hero-panel.is-hovered .hero-panel__hotspot,.hero-panel__hotspot:focus-visible,.hero-panel__hotspot:hover{opacity:1;transform:scale(1);}
      .hero-panel__hotspot:hover span,.hero-panel__hotspot:focus-visible span{opacity:1;transform:translate(-50%,-6px);}
      .hero-panel__hotspot:focus-visible{outline:2px solid var(--hero-accent,#7dd3fc);outline-offset:4px;}
      .main-menu-modes{display:flex;flex-direction:column;gap:24px;}
      .main-menu-modes__title{margin:0;font-size:24px;letter-spacing:.1em;text-transform:uppercase;color:#aee4ff;}
      .mode-section{display:flex;flex-direction:column;gap:18px;}
      .mode-section__name{margin:0;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
      .mode-grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));}
      .mode-card{position:relative;display:flex;flex-direction:column;gap:12px;align-items:flex-start;padding:24px;border-radius:20px;border:1px solid rgba(125,211,252,.24);background:linear-gradient(150deg,rgba(16,26,36,.92),rgba(18,30,42,.65));color:inherit;cursor:pointer;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;}
      .mode-card:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(6,12,18,.55);border-color:rgba(125,211,252,.46);}
      .mode-card:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:4px;}
      .mode-card__icon{font-size:28px;line-height:1;filter:drop-shadow(0 0 10px rgba(125,211,252,.26));}
      .mode-card__title{margin:0;font-size:18px;letter-spacing:.06em;text-transform:uppercase;}
      .mode-card__desc{margin:0;color:#9cbcd9;font-size:14px;line-height:1.6;}
      .mode-card__tags{display:flex;gap:8px;flex-wrap:wrap;}
      .mode-tag{padding:6px 12px;border-radius:999px;border:1px solid rgba(125,211,252,.25);background:rgba(12,22,32,.82);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#aee4ff;}
      .mode-tag--pve{color:#a8ffd9;border-color:rgba(117,255,208,.35);background:rgba(10,26,22,.82);}
      .mode-tag--pvp{color:#ff9aa0;border-color:rgba(255,154,160,.35);background:rgba(38,18,24,.82);}
      .mode-tag--coming{color:#ffe066;border-color:rgba(255,224,102,.35);background:rgba(36,26,12,.82);}
      .mode-tag--economy{color:#ffd9a1;border-color:rgba(255,195,128,.35);background:rgba(36,24,12,.82);}
      .mode-card__status{position:absolute;top:18px;right:18px;padding:6px 12px;border-radius:999px;border:1px solid rgba(255,224,102,.42);background:rgba(36,26,12,.78);color:#ffe066;font-size:11px;letter-spacing:.16em;text-transform:uppercase;}
      .mode-card--coming{border-style:dashed;opacity:.88;}
      .mode-card--group{position:relative;cursor:pointer;z-index:1;}
      .mode-card--group:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:4px;}
      .mode-card--group.is-open{z-index:5;}
      .mode-card__group-caret{position:absolute;top:22px;right:20px;font-size:14px;opacity:.65;transition:transform .2s ease,opacity .2s ease;}
      .mode-card--group:hover .mode-card__group-caret{opacity:.9;}
      .mode-card--group.is-open .mode-card__group-caret{transform:rotate(180deg);}
      .mode-card__group-info{display:flex;flex-direction:column;gap:12px;width:100%;}
      .mode-card__group-children{display:none;width:100%;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;}
      .mode-card--group.is-open .mode-card__group-children{display:grid;}
      .mode-card--group.is-open .mode-card__group-info{display:none;}
      .mode-card__child{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:14px;border:1px solid rgba(125,211,252,.18);background:rgba(12,22,32,.9);color:inherit;cursor:pointer;text-align:left;transition:border-color .2s ease,background .2s ease,transform .2s ease;}
      .mode-card__child:hover{border-color:rgba(125,211,252,.42);background:rgba(16,30,44,.95);transform:translateY(-2px);}
      .mode-card__child:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
      .mode-card__child-icon{font-size:20px;line-height:1;}
      .mode-card__child-body{display:flex;flex-direction:column;gap:4px;align-items:flex-start;}
      .mode-card__child-title{font-size:13px;letter-spacing:.12em;text-transform:uppercase;}
      .mode-card__child-status{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7da0c7;}
      .mode-card__child-desc{font-size:12px;color:#9cbcd9;line-height:1.4;}
      .mode-card__child--coming{opacity:.9;}
      .mode-card__child--coming .mode-card__child-status{color:#ffe066;}
      .main-menu-sidebar{display:flex;flex-direction:column;gap:16px;}
      .sidebar-slot{position:relative;padding:20px 22px;border-radius:18px;border:1px solid rgba(125,211,252,.18);background:rgba(12,20,28,.82);overflow:hidden;display:flex;flex-direction:column;gap:8px;min-height:104px;}
      .sidebar-slot::after{content:'';position:absolute;inset:auto -40% -60% 50%;transform:translateX(-50%);width:140%;height:120%;background:radial-gradient(circle,rgba(125,211,252,.18),transparent 70%);opacity:.4;pointer-events:none;}
      .sidebar-slot__label{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7da0c7;}
      .sidebar-slot__title{margin:0;font-size:16px;letter-spacing:.04em;}
      .sidebar-slot__desc{margin:0;font-size:13px;color:#9cbcd9;line-height:1.5;}
      @media(max-width:1080px){.hero-panel{grid-template-columns:1fr;}.hero-panel__canvas{min-height:300px;}}
      @media(max-width:960px){.main-menu-v2__layout{grid-template-columns:1fr;}.main-menu-sidebar{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;}}
      @media(max-width:640px){.main-menu-v2{gap:24px;}.hero-panel__info{padding:24px;}.hero-panel__canvas{padding:20px;}.main-menu-v2__title{font-size:36px;}.mode-card{padding:20px;}}
    `;
    
    if (style.textContent !== css){
      style.textContent = css;
    }
  }

  function applyPalette(element, profile){
    const palette = profile?.art?.palette || {};
    if (!element) return;
    if (palette.primary) element.style.setProperty('--hero-primary', palette.primary);
    if (palette.secondary) element.style.setProperty('--hero-secondary', palette.secondary);
    if (palette.accent) element.style.setProperty('--hero-accent', palette.accent);
    if (palette.outline) element.style.setProperty('--hero-outline', palette.outline);
  }

  function buildModeCardBase(element, mode, options = {}){
    if (!element || !mode) return null;
    const { extraClasses = [], showStatus = true } = options;
    element.classList.add('mode-card');
    extraClasses.forEach(cls => element.classList.add(cls));
    element.dataset.mode = mode.key;

    const icon = document.createElement('span');
    icon.className = 'mode-card__icon';
    icon.textContent = mode.icon || '◆';
    element.appendChild(icon);

    const title = document.createElement('h3');
    title.className = 'mode-card__title';
    title.textContent = mode.title || mode.label || mode.key;
    element.appendChild(title);

    if (mode.description){
      const desc = document.createElement('p');
      desc.className = 'mode-card__desc';
      desc.textContent = mode.description;
      element.appendChild(desc);
    }

    const tags = document.createElement('div');
    tags.className = 'mode-card__tags';
    (mode.tags || []).forEach(tag => {
      const chip = document.createElement('span');
      chip.className = 'mode-tag';
      chip.textContent = tag;
      const mapped = TAG_CLASS_MAP.get(tag);
      if (mapped) chip.classList.add(mapped);
      tags.appendChild(chip);
    });
    if (tags.childElementCount > 0){
      element.appendChild(tags);
    }

    let statusEl = null;
    if (showStatus && mode.status === 'coming-soon'){
      element.classList.add('mode-card--coming');
      element.setAttribute('aria-describedby', `${mode.key}-status`);
      element.setAttribute('aria-disabled', 'true');
      statusEl = document.createElement('span');
      statusEl.id = `${mode.key}-status`;
      statusEl.className = 'mode-card__status';
      statusEl.textContent = 'Coming soon';
      element.appendChild(statusEl);
    }

    return { statusEl };
  }

  function createModeCard(mode, shell, onShowComingSoon, addCleanup, options = {}){
    const button = document.createElement('button');
    button.type = 'button';
    const extraClasses = Array.isArray(options.extraClasses)
      ? options.extraClasses
      : (options.extraClass ? [options.extraClass] : []);
    buildModeCardBase(button, mode, {
      extraClasses,
      showStatus: options.showStatus !== false
    });

    const handleClick = event => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof options.onPrimaryAction === 'function'){
        options.onPrimaryAction({ mode, event, element: button });
        return;
      }
      if (!shell || typeof shell.enterScreen !== 'function') return;
      if (mode.status === 'coming-soon'){
        if (typeof onShowComingSoon === 'function'){
          onShowComingSoon(mode);
        }
        shell.enterScreen(mode.id || 'main-menu', mode.params || null);
        return;
      }
      shell.enterScreen(mode.id || 'main-menu', mode.params || null);
    };
    button.addEventListener('click', handleClick);
    addCleanup(() => button.removeEventListener('click', handleClick));
    if (typeof options.afterCreate === 'function'){
      options.afterCreate(button);
    }

    return button;
  }

  function createModeGroupCard(group, childModes, shell, onShowComingSoon, addCleanup){
    const wrapper = document.createElement('div');
    const groupClasses = Array.isArray(group.extraClasses)
      ? ['mode-card--group', ...group.extraClasses]
      : ['mode-card--group'];
    buildModeCardBase(wrapper, group, { extraClasses: groupClasses, showStatus: false });
    wrapper.setAttribute('role', 'button');
    wrapper.setAttribute('aria-haspopup', 'true');
    wrapper.setAttribute('aria-expanded', 'false');
    if (group.title){
      wrapper.setAttribute('aria-label', `Chọn chế độ trong ${group.title}`);
    }
    wrapper.tabIndex = 0;
    
    const infoBlock = document.createElement('div');
    infoBlock.className = 'mode-card__group-info';
    infoBlock.setAttribute('aria-hidden', 'false');
    const existingIcon = wrapper.querySelector('.mode-card__icon');
    const existingTitle = wrapper.querySelector('.mode-card__title');
    const existingDesc = wrapper.querySelector('.mode-card__desc');
    if (existingIcon) infoBlock.appendChild(existingIcon);
    if (existingTitle) infoBlock.appendChild(existingTitle);
    if (existingDesc) infoBlock.appendChild(existingDesc);
    wrapper.insertBefore(infoBlock, wrapper.firstChild);

    const caret = document.createElement('span');
    caret.className = 'mode-card__group-caret';
    caret.setAttribute('aria-hidden', 'true');
    caret.textContent = '▾';
    wrapper.appendChild(caret);

    const childrenGrid = document.createElement('div');
    childrenGrid.className = 'mode-card__group-children';
    childrenGrid.setAttribute('role', 'menu');
    childrenGrid.setAttribute('aria-hidden', 'true');
    childrenGrid.hidden = true;
    wrapper.appendChild(childrenGrid);

    let isOpen = false;
    let documentListenerActive = false;

    const handleDocumentClick = event => {
      if (!wrapper.contains(event.target)){
        close();
      }
    };

    const bindOutsideClick = () => {
      if (documentListenerActive) return;
      document.addEventListener('click', handleDocumentClick);
      documentListenerActive = true;
    };

    const unbindOutsideClick = () => {
      if (!documentListenerActive) return;
      document.removeEventListener('click', handleDocumentClick);
      documentListenerActive = false;
    };

    const open = () => {
      if (isOpen) return;
      isOpen = true;
      wrapper.classList.add('is-open');
      wrapper.setAttribute('aria-expanded', 'true');
      infoBlock.hidden = true;
      infoBlock.setAttribute('aria-hidden', 'true');
      childrenGrid.hidden = false;
      childrenGrid.setAttribute('aria-hidden', 'false');
      setTimeout(bindOutsideClick, 0);
    };

    const close = () => {
      if (!isOpen) return;
      isOpen = false;
      wrapper.classList.remove('is-open');
      wrapper.setAttribute('aria-expanded', 'false');
      infoBlock.hidden = false;
      infoBlock.setAttribute('aria-hidden', 'false');
      childrenGrid.hidden = true;
      childrenGrid.setAttribute('aria-hidden', 'true');
      unbindOutsideClick();
    };

    const toggle = () => {
      if (isOpen){
        close();
      } else {
        open();
      }
    };

    const handleToggle = event => {
      event.preventDefault();
      event.stopPropagation();
      toggle();
    };

    const handleKeydown = event => {
      if (event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        toggle();
        return;
      }
      if (event.key === 'Escape' && isOpen){
        event.preventDefault();
        close();
        wrapper.focus({ preventScroll: true });
      }
    };

    const handleFocusOut = event => {
      if (!isOpen) return;
      if (!wrapper.contains(event.relatedTarget)){
        close();
      }
    };

    wrapper.addEventListener('click', handleToggle);
    wrapper.addEventListener('keydown', handleKeydown);
    wrapper.addEventListener('focusout', handleFocusOut);

    addCleanup(() => {
      wrapper.removeEventListener('click', handleToggle);
      wrapper.removeEventListener('keydown', handleKeydown);
      wrapper.removeEventListener('focusout', handleFocusOut);
      unbindOutsideClick();
    });

    childModes.forEach(child => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'mode-card__child';
      item.dataset.mode = child.key;
      item.setAttribute('role', 'menuitem');
      if (child.status === 'coming-soon'){
        item.classList.add('mode-card__child--coming');
      }

      const icon = document.createElement('span');
      icon.className = 'mode-card__child-icon';
      icon.textContent = child.icon || '◆';
      item.appendChild(icon);

      const body = document.createElement('span');
      body.className = 'mode-card__child-body';

      const title = document.createElement('span');
      title.className = 'mode-card__child-title';
      title.textContent = child.title || child.label || child.key;
      body.appendChild(title);

      const status = document.createElement('span');
      status.className = 'mode-card__child-status';
      status.textContent = child.status === 'coming-soon' ? 'Coming soon' : 'Sẵn sàng';
      body.appendChild(status);

      if (child.description){
        const desc = document.createElement('span');
        desc.className = 'mode-card__child-desc';
        desc.textContent = child.description;
        body.appendChild(desc);
      }

      item.appendChild(body);

      const handleSelect = event => {
        event.preventDefault();
        event.stopPropagation();
        if (!shell || typeof shell.enterScreen !== 'function') return;
        if (child.status === 'coming-soon' && typeof onShowComingSoon === 'function'){
          onShowComingSoon(child);
        }
        shell.enterScreen(child.id || 'main-menu', child.params || null);
        close();
        wrapper.focus({ preventScroll: true });
      };

      item.addEventListener('click', handleSelect);
      addCleanup(() => item.removeEventListener('click', handleSelect));

      childrenGrid.appendChild(item);
    });

    return wrapper;
  }

  function createModesSection(options){
    const { sections = [], metadata = [], shell, onShowComingSoon, addCleanup } = options;
    const sectionEl = document.createElement('section');
    sectionEl.className = 'main-menu-modes';

    const title = document.createElement('h2');
    title.className = 'main-menu-modes__title';
    title.textContent = 'Chế độ tác chiến';
    sectionEl.appendChild(title);

    const metaByKey = new Map();
    metadata.forEach(mode => {
      metaByKey.set(mode.key, mode);
    });

    sections.forEach(section => {
      const sectionGroup = document.createElement('div');
      sectionGroup.className = 'mode-section';

      const heading = document.createElement('h3');
      heading.className = 'mode-section__name';
      heading.textContent = section.title || 'Danh mục';
      sectionGroup.appendChild(heading);

      const grid = document.createElement('div');
      grid.className = 'mode-grid';

      (section.entries || []).forEach(entry => {
        const cardKey = entry.cardId || entry.id;
        if (!cardKey) return;
        const cardMeta = metaByKey.get(cardKey);
        if (!cardMeta) return;

        if (entry.type === 'group'){
          const childMetas = (entry.childModeIds || [])
            .map(childId => metaByKey.get(childId))
            .filter(Boolean);
          if (childMetas.length === 0) return;
          const groupCard = createModeGroupCard(cardMeta, childMetas, shell, onShowComingSoon, addCleanup);
          grid.appendChild(groupCard);
          return;
        }

        const card = createModeCard(cardMeta, shell, onShowComingSoon, addCleanup);
        grid.appendChild(card);
      });

      sectionGroup.appendChild(grid);
      sectionEl.appendChild(sectionGroup);
    });

    return sectionEl;
  }

  function cueTone(tone){
    return TONE_ICONS[tone] ? { icon: TONE_ICONS[tone], tone } : { icon: '✦', tone: tone || 'calm' };
  }

  function createHeroSection(options){
    const { heroId = HERO_DEFAULT_ID, playerGender = 'neutral', addCleanup } = options;
    const profile = getHeroProfile(heroId);
    const heroSection = document.createElement('section');
    heroSection.className = 'hero-section';

    const panel = document.createElement('div');
    panel.className = 'hero-panel';
      applyPalette(panel, profile);
    heroSection.appendChild(panel);

    const info = document.createElement('div');
    info.className = 'hero-panel__info';

    const dialogue = document.createElement('div');
    dialogue.className = 'hero-dialogue';

    const toneEl = document.createElement('div');
    toneEl.className = 'hero-dialogue__tone';
    dialogue.appendChild(toneEl);

    const textEl = document.createElement('p');
    textEl.className = 'hero-dialogue__text';
    dialogue.appendChild(textEl);

    info.appendChild(dialogue);

    const identity = document.createElement('div');
    identity.className = 'hero-panel__identity';
    const role = document.createElement('p');
    role.className = 'hero-panel__role';
    role.textContent = `${profile.faction || 'Arclune'} — ${profile.role || 'Tiên phong'}`;
    const name = document.createElement('h2');
    name.className = 'hero-panel__name';
    name.textContent = profile.name || 'Anh hùng';
    identity.appendChild(role);
    identity.appendChild(name);
    if (profile.title){
      const title = document.createElement('p');
      title.className = 'hero-panel__motto';
      title.textContent = profile.title;
      identity.appendChild(title);
    }
    if (profile.motto){
      const motto = document.createElement('p');
      motto.className = 'hero-panel__motto';
      motto.textContent = profile.motto;
      identity.appendChild(motto);
    }
    info.appendChild(identity);

    panel.appendChild(info);

    const canvas = document.createElement('button');
    canvas.type = 'button';
    canvas.className = 'hero-panel__canvas';
    canvas.setAttribute('aria-label', `Tương tác với ${profile.name || 'nhân vật chính'}`);

    if (profile.art?.sprite?.src){
      const img = document.createElement('img');
      img.src = profile.art.sprite.src;
      img.alt = profile.name || 'Anh hùng Arclune';
      canvas.appendChild(img);
    }

    const glow = document.createElement('div');
    glow.className = 'hero-panel__glow';
    canvas.appendChild(glow);

    const hotspots = getHeroHotspots(profile.id);
    hotspots.forEach(spot => {
      const hotspotBtn = document.createElement('button');
      hotspotBtn.type = 'button';
      hotspotBtn.className = 'hero-panel__hotspot';
      hotspotBtn.dataset.cue = spot.cue || 'sensitive';
      hotspotBtn.dataset.zone = spot.key;
      hotspotBtn.setAttribute('aria-label', spot.label || 'Điểm tương tác đặc biệt');
      const label = document.createElement('span');
      label.textContent = spot.label || 'Tương tác';
      hotspotBtn.appendChild(label);
      const handleClick = event => {
        event.preventDefault();
        event.stopPropagation();
        showDialogue(spot.cue || 'sensitive', { zone: spot.key });
        panel.classList.add('hero-panel--alert');
        setTimeout(() => panel.classList.remove('hero-panel--alert'), 620);
      };
      const handleHover = () => {
        panel.classList.add('is-hovered');
      };
      const handleLeave = () => {
        panel.classList.remove('is-hovered');
      };
      hotspotBtn.addEventListener('click', handleClick);
      hotspotBtn.addEventListener('mouseenter', handleHover);
      hotspotBtn.addEventListener('focus', handleHover);
      hotspotBtn.addEventListener('mouseleave', handleLeave);
      hotspotBtn.addEventListener('blur', handleLeave);
      addCleanup(() => {
        hotspotBtn.removeEventListener('click', handleClick);
        hotspotBtn.removeEventListener('mouseenter', handleHover);
        hotspotBtn.removeEventListener('focus', handleHover);
        hotspotBtn.removeEventListener('mouseleave', handleLeave);
        hotspotBtn.removeEventListener('blur', handleLeave);
      });
      canvas.appendChild(hotspotBtn);
    });

    panel.appendChild(canvas);

    const updateTone = (tone, label) => {
      const { icon, tone: normalizedTone } = cueTone(tone);
      toneEl.dataset.tone = normalizedTone;
      toneEl.textContent = `${icon} ${label || ''}`.trim();
    };

    const showDialogue = (cue, extra = {}) => {
      const dialogueData = getHeroDialogue(profile.id, cue, { gender: playerGender, zone: extra.zone });
      textEl.textContent = dialogueData.text;
      updateTone(dialogueData.tone, dialogueData.label);
    };

    const handleEnter = () => {
      panel.classList.add('is-hovered');
      showDialogue('hover');
    };
    const handleLeave = () => {
      panel.classList.remove('is-hovered');
      showDialogue('idle');
    };
    const handleClick = event => {
      event.preventDefault();
      panel.classList.add('is-pressed');
      showDialogue('tap');
      setTimeout(() => panel.classList.remove('is-pressed'), 220);
    };
    const handleKey = event => {
      if (event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        handleClick(event);
      }
    };

    canvas.addEventListener('mouseenter', handleEnter);
    canvas.addEventListener('focus', handleEnter);
    canvas.addEventListener('mouseleave', handleLeave);
    canvas.addEventListener('blur', handleLeave);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('keydown', handleKey);
    addCleanup(() => {
      canvas.removeEventListener('mouseenter', handleEnter);
      canvas.removeEventListener('focus', handleEnter);
      canvas.removeEventListener('mouseleave', handleLeave);
      canvas.removeEventListener('blur', handleLeave);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('keydown', handleKey);
    });

    showDialogue('intro');

    heroSection.appendChild(panel);
    return heroSection;
  }

  function createSidebar(){
    const aside = document.createElement('aside');
    aside.className = 'main-menu-sidebar';
    SIDE_SLOTS.forEach(slot => {
      const card = document.createElement('div');
      card.className = 'sidebar-slot';
      card.dataset.slot = slot.key;

      const label = document.createElement('span');
      label.className = 'sidebar-slot__label';
      label.textContent = slot.label;

      const title = document.createElement('h4');
      title.className = 'sidebar-slot__title';
      title.textContent = slot.title;

      const desc = document.createElement('p');
      desc.className = 'sidebar-slot__desc';
      desc.textContent = slot.description;

      card.appendChild(label);
      card.appendChild(title);
      card.appendChild(desc);
      aside.appendChild(card);
    });
    return aside;
  }

  function createHeader(){
    const header = document.createElement('header');
    header.className = 'main-menu-v2__header';

    const brand = document.createElement('div');
    brand.className = 'main-menu-v2__brand';

    const title = document.createElement('h1');
    title.className = 'main-menu-v2__title';
    title.textContent = 'Arclune';
    const subtitle = document.createElement('p');
    subtitle.className = 'main-menu-v2__subtitle';
    subtitle.textContent = 'Chiến thuật sân 7x3. Chọn chế độ để khởi động đội hình, tương tác với hộ vệ để nghe lời nhắc nhở.';

    brand.appendChild(title);
    brand.appendChild(subtitle);

    const meta = document.createElement('div');
    meta.className = 'main-menu-v2__meta';

    const chipAlpha = document.createElement('span');
    chipAlpha.className = 'main-menu-v2__meta-chip';
    chipAlpha.textContent = 'Alpha preview';
    const chipBuild = document.createElement('span');
    chipBuild.className = 'main-menu-v2__meta-chip';
    chipBuild.textContent = 'v0.7.4';

    meta.appendChild(chipAlpha);
    meta.appendChild(chipBuild);

    header.appendChild(brand);
    header.appendChild(meta);
    return header;
  }

  function renderMainMenuView(options = {}){
    const { root, shell, sections = [], metadata = [], heroId = HERO_DEFAULT_ID, playerGender = 'neutral', onShowComingSoon } = options;
    if (!root) return null;
    ensureStyles();
    root.innerHTML = '';
    root.classList.remove('app--pve');
    root.classList.add('app--main-menu');

    const cleanups = [];
    const addCleanup = fn => {
      if (typeof fn === 'function') cleanups.push(fn);
    };

    const container = document.createElement('div');
    container.className = 'main-menu-v2';

    const header = createHeader();
    container.appendChild(header);

    const layout = document.createElement('div');
    layout.className = 'main-menu-v2__layout';
    container.appendChild(layout);

    const primary = document.createElement('div');
    primary.className = 'main-menu-v2__primary';
    const hero = createHeroSection({ heroId, playerGender, addCleanup });
    primary.appendChild(hero);
    const modes = createModesSection({ sections, metadata, shell, onShowComingSoon, addCleanup });
    primary.appendChild(modes);

    const sidebar = createSidebar();

    layout.appendChild(primary);
    layout.appendChild(sidebar);

    root.appendChild(container);

    return {
      destroy(){
        cleanups.forEach(fn => {
          try {
            fn();
          } catch (err) {
            console.error('[main-menu] cleanup failed', err);
          }
        });
        cleanups.length = 0;
        if (container.parentNode === root){
          root.removeChild(container);
        }
        root.classList.remove('app--main-menu');
      }
    };
  }



  exports.renderMainMenuView = renderMainMenuView;
  exports.default = renderMainMenuView;
  module.exports.default = exports.default;
});
__define('./statuses.js', (exports, module, __require) => {
  // statuses.js — Hệ trạng thái/effect data-driven v0.7
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
        hpMax: extra.hpMax, hp: extra.hp, atk: extra.atk,
        art,
        skinKey: art?.skinKey
      });
      try { vfxAddSpawn(Game, cx, cy, side); } catch(_){}
      // gắn instance id
      const spawned = Game.tokens[Game.tokens.length - 1];
      spawned.iid = (hooks.allocIid?.()) ?? (spawned.iid || 0);

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
    obj.skinKey = obj.art?.skinKey;
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
      side: (unit?.side) ?? null,
      slot,
      phase: (Game?.turn?.phase) ?? null,
      cycle: (Game?.turn?.cycle) ?? null,
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
          cycle: (Game?.turn?.cycle) ?? null,
          phase: (Game?.turn?.phase) ?? null,
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

      const capRaw = Game.costCap ?? CFG.COST_CAP ?? 30;
      const cap = Number.isFinite(capRaw) && capRaw > 0 ? capRaw : 1;
      const now = Math.max(0, Math.floor(Game.cost ?? 0));
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
    const _GAP = (CFG.UI?.CARD_GAP) ?? 12;     // khớp CSS khoảng cách
    const _MIN = (CFG.UI?.CARD_MIN) ?? 40;     // cỡ tối thiểu
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
      const cell = Math.max(_MIN, Math.floor((w - _GAP * 6) / 7));
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
        if (!c){
          b.hidden = true;
          continue;
        }
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
__define('./utils/dummy.js', (exports, module, __require) => {
  function ensureNestedModuleSupport(){
    return true;
  }

  exports.ensureNestedModuleSupport = ensureNestedModuleSupport;
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
      const kDepth = ((cam?.depthScale) ?? 0.94);
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
