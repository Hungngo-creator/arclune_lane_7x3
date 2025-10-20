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
  const __dep1 = __require('./turns.js');
  const predictSpawnCycle = __dep1.predictSpawnCycle;
  const __dep2 = __require('./config.js');
  const CFG = __dep2.CFG;
  const __dep3 = __require('./utils/time.js');
  const sharedSafeNow = __dep3.safeNow;
  const __dep4 = __require('./utils/kit.js');
  const detectUltBehavior = __dep4.detectUltBehavior;
  const getSummonSpec = __dep4.getSummonSpec;
  const resolveSummonSlots = __dep4.resolveSummonSlots;

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
  function refillDeckEnemy(Game){
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
    return predictSpawnCycle(Game, 'enemy', slot) === (Game.turn?.cycle ?? 0) ? 1.0 : 0.5;
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

  function queueEnemyAt(Game, card, slot, cx, cy, aliveTokens){
    if (Game.ai.cost < card.cost) return false;
    if (Game.ai.summoned >= Game.ai.summonLimit) return false;
    const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
    if (cellReserved(alive, Game.queued, cx, cy)) return false;
    if (Game.queued.enemy.has(slot)) return false;

    const spawnCycle = predictSpawnCycle(Game, 'enemy', slot);

    Game.queued.enemy.set(slot, {
      unitId: card.id, name: card.name, side:'enemy',
      cx, cy, slot, spawnCycle, color:'#ed9dad',
      source: 'deck'
    });

    Game.ai.cost = Math.max(0, Game.ai.cost - card.cost);
    Game.ai.summoned += 1;
    Game.ai.usedUnitIds.add(card.id);
    Game.ai.deck = Game.ai.deck.filter(u => u.id !== card.id);
    refillDeckEnemy(Game);
    return true;
  }

  function aiMaybeAct(Game, reason){
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
    let errorHandler = typeof options.onError === 'function' ? options.onError : null;

    function dispatchError(error, context){
      console.error('[shell] listener error', error);
      if (!errorHandler) return;
      try {
        errorHandler(error, context || null);
      } catch (handlerError) {
        console.error('[shell] error handler failure', handlerError);
      }
    }

    function notify(){
      const snapshot = cloneState(state);
      for (const fn of listeners){
        try {
          fn(snapshot);
        } catch (err) {
          dispatchError(err, { phase: 'notify', listener: fn });
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
        dispatchError(err, { phase: 'subscribe', listener: handler });
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
      onChange: subscribe,
      setErrorHandler(handler){
        if (typeof handler === 'function'){
          errorHandler = handler;
        } else {
          errorHandler = null;
        }
      }
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
  exports.UNIT_ART = UNIT_ART;
  exports.setUnitSkin = setUnitSkin;
  exports.getUnitSkin = getUnitSkin;
  exports.getUnitArt = getUnitArt;
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
      cam?.topScale ?? 'ts',
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
  const __dep0 = __require('./utils/kit.js');
  const kitSupportsSummon = __dep0.kitSupportsSummon;
  const RANK_MULT = { N:0.80, R:0.90, SR:1.05, SSR:1.25, UR:1.50, Prime:1.80 };

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
  //  - kit.traits.summon / kit.ult.summon đánh dấu Summoner -> kích hoạt Immediate Summon (action-chain).
  const ROSTER = [
    {
      id: 'phe', name: 'Phệ', class: 'Mage', rank: 'Prime',
      mods: { WIL:+0.10, AEregen:+0.10 }, // 20% tổng
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
        basic: {
          name: 'Đánh Thường',
          tags: ['single-target', 'lifesteal', 'mark'],
          lifesteal: 0.10,
          mark: { id: 'mark_devour', maxStacks: 3, ttlTurns: 3 }
        },
        skills: [
          { key: 'skill1', name: 'Song Huyết Cầu', cost: { aether: 25 }, hits: 2, countsAsBasic: true, targets: 'randomEnemies', notes: 'Mỗi hit làm mới thời hạn Phệ Ấn.' },
          { key: 'skill2', name: 'Huyết Chướng', cost: { aether: 25 }, duration: 2, reduceDamage: 0.30, healPercentMaxHPPerTurn: 0.15, untargetable: true },
          { key: 'skill3', name: 'Huyết Thệ', cost: { aether: 40 }, duration: 5, link: { sharePercent: 0.5, maxLinks: 1 } }
        ],
        ult: {
          type: 'drain',
          countsAsBasic: true,
          aoe: 'allEnemies',
          hpDrainPercentCurrent: 0.07,
          damageScaleWIL: 0.80,
          healSelfFromTotal: 0.40,
          healAlliesFromTotal: 0.30,
          overhealShieldCap: 1.0,
          selfBuff: { stat: 'WIL', amount: 0.20, turns: 2 },
          marksPerTarget: 1,
          notes: 'Không thể né; mỗi mục tiêu nhận thêm 1 Phệ Ấn.'
        },
        talent: {
          name: 'Phệ Ấn',
          id: 'mark_devour',
          maxStacks: 3,
          ttlTurns: 3,
          explosion: { scaleWIL: 0.50 },
          blessing: { hpMax: 0.15, hpRegen: 0.50 }
        },
        technique: null,
        passives: [
         { id:'mark_devour', name:'Phệ Ấn', when:'onBasicHit', effect:'placeMark', params:{ stacksToExplode:3, ttlTurns:3, dmgFromWIL:0.5, purgeable:false } }
        ],
        traits: [
          { id: 'mark_cap', text: 'Phệ Ấn tối đa 3 tầng và tự kích nổ vào lượt của mục tiêu.' },
          { id: 'overheal_cap', text: 'Hút máu dư chuyển thành Giáp Máu tối đa bằng 100% Máu tối đa.' },
          { id: 'link_limit', text: 'Chỉ duy trì 1 liên kết Huyết Thệ cùng lúc.' }
        ]
      }
    },
    {
      id: 'kiemtruongda', name: 'Kiếm Trường Dạ', class: 'Warrior', rank: 'Prime',
      mods: { ATK:+0.12, PER:+0.08 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
        basic: {
          name: 'Đánh Thường',
          tags: ['single-target', 'armor-pierce'],
          piercePercent: 0.05
        },
        skills: [
          { key: 'skill1', name: 'Loạn Trảm Dạ Hành', cost: { aether: 25 }, countsAsBasic: true, targets: 'randomRow', damageMultiplier: 1.50 },
          { key: 'skill2', name: 'Ngũ Kiếm Huyền Ấn', cost: { aether: 20 }, duration: 'battle', randomStance: ['Kiếm Sinh','Kiếm Ma','Kiếm Thổ','Kiếm Hỏa','Kiếm Hư'] },
          { key: 'skill3', name: 'Kiếm Ý Tinh Luyện', cost: { aether: 25 }, delayTurns: 1, duration: 3, buffStats: { ATK: 0.20, WIL: 0.20 } }
        ],
        ult: {
          type:'strikeLaneMid',
          countsAsBasic: true,
          hits:4,
          penRES:0.30,
          bonusVsLeader:0.20,
          targets:'columnMid'
        },
        talent: {
          name: 'Kiếm Tâm',
          scaling: { stats: { ATK: 0.05, WIL: 0.05 }, basedOn: 'battleStart' }
        },
        technique: null,
        passives: [
          { id:'atk_on_ult', name:'Kiếm Tâm - ATK', when:'onUltCast', effect:'gainATK%', params:{ amount:+0.05, duration:'perm', stack:true, purgeable:false } },
          { id:'wil_on_ult', name:'Kiếm Tâm - WIL', when:'onUltCast', effect:'gainWIL%', params:{ amount:+0.05, duration:'perm', stack:true, purgeable:false } }
        ],
        traits: [
          { id:'stance_unique', text:'Ngũ Kiếm Huyền Ấn chỉ chọn 1 trạng thái cho tới hết trận.' },
          { id:'refine_delay', text:'Kiếm Ý Tinh Luyện kích hoạt sau 1 lượt trì hoãn.' },
          { id:'ult_scaling', text:'Mỗi lần dùng Vạn Kiếm Quy Tông cộng vĩnh viễn +5% ATK/WIL (không giới hạn).' }
        ]
      }
    },
    {
      id: 'loithienanh', name: 'Lôi Thiên Ảnh', class: 'Tanker', rank: 'SSR',
      mods: { RES:+0.10, WIL:+0.10 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
        basic: {
          name: 'Đánh Thường',
          hits: 2,
          tags: ['multi-hit', 'spd-debuff'],
          debuff: { stat: 'SPD', amount: -0.02, maxStacks: 5 }
        },
        skills: [
          { key: 'skill1', name: 'Lôi Ảnh Tam Kích', cost: { aether: 25 }, hits: 3, countsAsBasic: true, targets: 'randomEnemies', bonusIfAdjacent: 0.10 },
          { key: 'skill2', name: 'Ngũ Lôi Phệ Thân', cost: { aether: 35 }, hpTradePercent: 0.05, hits: 5, targets: 'randomEnemies' },
          { key: 'skill3', name: 'Lôi Thể Bách Chiến', cost: { aether: 30 }, bonusMaxHPBase: 0.20, limitUses: 3 }
        ],
        ult: {
          type:'hpTradeBurst',
          countsAsBasic: true,
          hpTradePercent: 0.15,
          hits: 3,
          damage: { percentTargetMaxHP: 0.07, bossPercent: 0.04, scaleWIL: 0.50 },
          reduceDmg: 0.30,
          duration: 2,
          appliesDebuff: { stat: 'SPD', amount: -0.02, maxStacks: 5 },
          notes: 'Không tự sát, tối thiểu còn 1 HP.'
        },
        talent: {
          name: 'Song Thể Lôi Đạo',
          conditional: {
            ifHPAbove: 0.5,
            stats: { ARM: 0.20, RES: 0.20 },
            elseStats: { ATK: 0.20, WIL: 0.20 }
          }
        },
        technique: null,
        passives: [{ id:'swap_res_wil', name:'Song Thể Lôi Đạo', when:'onTurnStart', effect:'conditionalBuff',
                     params:{ ifHPgt:0.5, RES:+0.20, ARM:+0.20, elseATK:+0.20, elseWIL:+0.20, purgeable:false } }],
        traits: [
          { id:'hp_trade_limits', text:'Mọi kỹ năng đốt máu không thể khiến Lôi Thiên Ảnh tự sát (tối thiểu còn 1 HP).' },
          { id:'spd_burn', text:'Giảm SPD cộng dồn tối đa 5 tầng từ đòn đánh thường và tuyệt kỹ.' },
          { id:'body_fortify_lock', text:'Lôi Thể Bách Chiến bị khoá vĩnh viễn sau 3 lần sử dụng.' }
        ]
      }
    },
    {
      id: 'laky', name: 'La Kỳ', class: 'Support', rank: 'SSR',
      mods: { WIL:+0.10, PER:+0.10 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
        basic: {
          name: 'Đánh Thường',
          tags: ['single-target', 'sleep-setup'],
          debuff: { id: 'me_hoac', stacks: 1, maxStacks: 4 }
        },
        skills: [
          { key: 'skill1', name: 'Mộng Trảo', cost: { aether: 25 }, hits: 3, countsAsBasic: true, targets: 'randomEnemies' },
          { key: 'skill2', name: 'Vạn Mộng Trận', cost: { aether: 35 }, hits: 5, countsAsBasic: true, targets: 'randomEnemies' },
          { key: 'skill3', name: 'Mộng Giới Hộ Thân', cost: { aether: 20 }, duration: 3, reduceDamage: 0.20 }
        ],
        ult: { type:'sleep', targets:3, turns:2, bossModifier:0.5 },
        talent: {
          name: 'Mê Mộng Chú',
          resPerSleeping: 0.02
        },
        technique: null,
        passives: [{ id:'res_per_sleeping_enemy', name:'Mê Mộng Chú', when:'onTurnStart', effect:'gainRES%', params:{ perTarget:+0.02, unlimited:true } }],
        traits: [
          { id:'me_hoac_limit', text:'Tối đa 4 tầng Mê Hoặc, kích hoạt ngủ trong 1 lượt rồi đặt lại.' },
          { id:'boss_sleep_half', text:'Boss PvE chỉ ngủ nửa thời gian (làm tròn xuống).' }
        ]
      }
    },
    {
      id: 'kydieu', name: 'Kỳ Diêu', class: 'Support', rank: 'SR',
      mods: { WIL:+0.10, RES:+0.10 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
        basic: {
          name: 'Đánh Thường',
          tags: ['single-target']
        },
        skills: [
          { key:'skill1', name:'Tế Lễ Phản Hồn', cost:{ aether:20 }, duration:3, selfRegenPercent:0.08 },
          { key:'skill2', name:'Thí Thân Hộ Chủ', cost:{ aether:15 }, sacrifice:true, reviveDelayTurns:4, reviveReturn:{ hpPercent:0.5, ragePercent:0.5, aether:0 }, grantLeader:{ buff:'indomitability', stacks:1 } },
          { key:'skill3', name:'Tế Vũ Tăng Bão', cost:{ aether:20 }, duration:4, rageGainBonus:0.50 }
        ],
        ult: { type:'revive', targets:1, revived:{ rage:0, lockSkillsTurns:1, hpPercent:0.15 } },
        talent: {
          name:'Phục Tế Khôi Minh',
          perActionStacks:{ ARM:0.03, RES:0.03 }
        },
        technique: null,
        passives: [{ id:'res_stack_per_action', name:'Phục Tế Khôi Minh', when:'onActionEnd', effect:'gainRES%', params:{ amount:+0.01, stack:true, purgeable:false } }],
        traits: [
          { id:'self_sacrifice_return', text:'Sau 4 lượt tự hiến, Kỳ Diêu hồi sinh với 50% HP, 50% nộ và 0 Aether; sân kín thì biến mất.' },
          { id:'revive_lock', text:'Đồng minh do tuyệt kỹ hồi sinh bị khoá kỹ năng 1 lượt và nộ về 0.' }
        ]
      }
    },
    {
      id: 'doanminh', name: 'Doãn Minh', class: 'Support', rank: 'SR',
      mods: { WIL:+0.10, AEmax:+0.10 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true, teamHealOnEntry:0.05 },
        basic: {
          name: 'Đánh Thường',
          tags: ['single-target']
        },
        skills: [
          { key:'skill1', name:'Cán Cân Giáng Phạt', cost:{ aether:20 }, countsAsBasic:true, damageMultiplier:1.50 },
          { key:'skill2', name:'Phán Xét Cứu Rỗi', cost:{ aether:15 }, healPercentCasterMaxHP:0.10, targets:3 },
          { key:'skill3', name:'Cân Bằng Sinh Mệnh', cost:{ aether:15 }, bonusMaxHPBase:0.10, limitUses:5 }
        ],
        ult: { type:'equalizeHP', allies:3, healLeader:true, leaderHealPercentCasterMaxHP:0.10 },
        talent: {
          name:'Thăng Bình Pháp Lực',
          onSpawnHealPercent:0.05
        },
        technique: null,
        passives: [],
        traits: [
          { id:'hp_balance', text:'Cân bằng HP không vượt quá ngưỡng tối đa và bỏ qua Leader.' },
          { id:'hp_gain_cap', text:'Cân Bằng Sinh Mệnh chỉ dùng tối đa 5 lần mỗi trận.' }
        ]
      }
    },
    {
      id: 'tranquat', name: 'Trần Quát', class: 'Summoner', rank: 'R',
      mods: { ATK:+0.10, PER:+0.10 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
  basic: {
          name: 'Đánh Thường',
          tags: ['single-target']
        },
        skills: [
          { key:'skill1', name:'Sai Khiển Tiểu Đệ', cost:{ aether:15 }, ordersMinions:2 },
          { key:'skill2', name:'Khiên Mộc Dẫn Địch', cost:{ aether:20 }, duration:3, applyTauntToMinions:true },
          { key:'skill3', name:'Tăng Cường Tòng Bộc', cost:{ aether:20 }, inheritBonus:{ HP:0.20, ATK:0.20, WIL:0.20 }, limitUses:5 }
        ],
        ult: { type:'summon', pattern:'verticalNeighbors', count:2, ttl:4, inherit:{ HP:0.50, ATK:0.50, WIL:0.50 }, limit:2, replace:'oldest', creep:{ hasRage:false, canChain:false, basicOnly:true } },
        talent: {
          name:'Đại Ca Đầu Đàn',
          perMinionBasicBonus:0.15,
          onMinionDeath:{ stats:{ ATK:0.05, WIL:0.05 }, maxStacks:3 }
        },
        technique: null,
        passives: [{ id:'basic_dmg_per_minion', name:'Đại Ca Đầu Đàn', when:'onBasicHit', effect:'gainBonus', params:{ perMinion:+0.02 } }],
        traits: [
          { id:'summon_ttl', text:'Tiểu đệ tồn tại tối đa 4 lượt và không thể hồi sinh.' },
          { id:'summon_limit', text:'Chỉ duy trì tối đa 2 tiểu đệ; triệu hồi mới thay thế đơn vị tồn tại lâu nhất.' },
          { id:'boost_lock', text:'Tăng Cường Tòng Bộc khóa sau 5 lần sử dụng và chỉ ảnh hưởng tiểu đệ triệu hồi sau đó.' }
        ]
      }
    },
    {
      id: 'linhgac', name: 'Lính Gác', class: 'Warrior', rank: 'N',
      mods: { ARM:+0.10, ATK:+0.10 },
      kit: {
        onSpawn: { rage: 100, exceptLeader: true },
        basic: {
          name: 'Đánh Thường',
          tags: ['single-target']
        },
        skills: [
          { key:'skill1', name:'Trảm Cảnh Giới', cost:{ aether:20 }, countsAsBasic:true, damageMultiplier:1.50 },
          { key:'skill2', name:'Thành Lũy Tạm Thời', cost:{ aether:15 }, duration:3, buffStats:{ RES:0.20, ARM:0.20 } },
          { key:'skill3', name:'Kiên Cố Trường Kỳ', cost:{ aether:20 }, permanent:true, buffStats:{ RES:0.05, ARM:0.05 }, lowHPBonus:{ threshold:0.30, stats:{ RES:0.15, ARM:0.15 } } }
        ],
        ult: { type:'haste', targets:'self+2allies', attackSpeed:+0.20, turns:2, selfBasicBonus:0.05 },
        talent: {
          name:'Cảnh Giới Bất Biến',
          onSpawnStats:{ AGI:0.05, ATK:0.05 }
        },
        technique: null,
        passives: [],
        traits: [
          { id:'permanent_stack', text:'Kiên Cố Trường Kỳ cộng dồn vĩnh viễn, mạnh hơn khi HP < 30%.' },
          { id:'ult_damage_bonus', text:'Trong thời gian Còi Tăng Tốc, đòn đánh thường gây thêm 5% sát thương.' }
        ]
      }
    }
  ];

  // 5) Map & helper tra cứu
  const ROSTER_MAP = new Map(ROSTER.map(x => [x.id, x]));
  const getMetaById = (id) => ROSTER_MAP.get(id);
  const isSummoner = (id) => {
    const m = getMetaById(id);
    return !!(m && m.class === 'Summoner' && kitSupportsSummon(m));
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
  const vfxAddLightningArc = __dep1.vfxAddLightningArc;
  const __dep2 = __require('./engine.js');
  const slotToCell = __dep2.slotToCell;
  const cellReserved = __dep2.cellReserved;
  const __dep3 = __require('./vfx.js');
  const vfxAddSpawn = __dep3.vfxAddSpawn;
  const __dep4 = __require('./passives.js');
  const emitPassiveEvent = __dep4.emitPassiveEvent;
  const __dep5 = __require('./config.js');
  const CFG = __dep5.CFG;
  const __dep6 = __require('./utils/fury.js');
  const gainFury = __dep6.gainFury;
  const startFurySkill = __dep6.startFurySkill;
  const finishFuryHit = __dep6.finishFuryHit;
  const __dep7 = __require('./utils/time.js');
  const safeNow = __dep7.safeNow;
  function pickTarget(Game, attacker){
   const foe = attacker.side === 'ally' ? 'enemy' : 'ally';
   const pool = Game.tokens.filter(t => t.side === foe && t.alive);
    if (!pool.length) return null;

    // 1) “Trước mắt”: cùng hàng, ưu tiên cột sát midline → xa dần
   const r = attacker.cy;                 // 0=top,1=mid,2=bot
    const seq = [];
    const targetSide = attacker.side === 'ally' ? 'enemy' : 'ally';
    const s1 = Math.max(1, Math.min(3, (r|0) + 1)); // 1|2|3 (gần midline)
    seq.push(s1, s1 + 3, s1 + 6);        // 1→4→7 / 2→5→8 / 3→6→9
    for (const s of seq){
      const cell = slotToCell(targetSide, s);
      if (!cell) continue;
      const { cx, cy } = cell;
      const tgt = pool.find(t => t.cx === cx && t.cy === cy);
      if (tgt) return tgt;
   }

   // 2) Fallback: không có ai “trước mắt” ⇒ đánh đơn vị gần nhất
   return pool.sort((a,b)=>{
     const da = Math.abs(a.cx - attacker.cx) + Math.abs(a.cy - attacker.cy);
     const db = Math.abs(b.cx - attacker.cx) + Math.abs(b.cy - attacker.cy);
    return da - db;
   })[0] || null;
  }

  function applyDamage(target, amount){
    if (!Number.isFinite(target.hpMax)) return;
    target.hp = Math.max(0, Math.min(target.hpMax, (target.hp|0) - (amount|0)));
    if (target.hp <= 0){
    if (target.alive !== false && !target.deadAt) target.deadAt = safeNow();
      target.alive = false;
    }
  }
  function dealAbilityDamage(Game, attacker, target, opts = {}){
    if (!attacker || !target || !target.alive) return { dealt: 0, absorbed: 0, total: 0 };

  startFurySkill(attacker, { tag: opts.furyTag || opts.attackType || 'ability' });

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

    const dealt = Math.max(0, remain);
    const isKill = target.hp <= 0;
    gainFury(attacker, {
      type: attackType === 'basic' ? 'basic' : 'ability',
      dealt,
      isAoE: !!opts.isAoE,
      isKill,
      isCrit: !!opts.isCrit,
      targetsHit: Number.isFinite(opts.targetsHit) ? opts.targetsHit : 1,
      targetMaxHp: Number.isFinite(target?.hpMax) ? target.hpMax : undefined
    });
    gainFury(target, {
      type: 'damageTaken',
      dealt,
      isAoE: !!opts.isAoE,
      selfMaxHp: Number.isFinite(target?.hpMax) ? target.hpMax : undefined,
      damageTaken: dealt
    });
    finishFuryHit(target);
    finishFuryHit(attacker);

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

    startFurySkill(unit, { tag: 'basic' });

    // Đầu tiên chọn theo “trước mắt/ganh gần” như cũ
    const fallback = pickTarget(Game, unit);

    // Sau đó cho Statuses có quyền điều phối (taunt/allure…), nếu trả về null thì bỏ lượt

    const tgt = Statuses.resolveTarget(unit, pool, { attackType: 'basic' }) ?? fallback;
    if (!tgt) return;

  const isLoithienanh = unit?.id === 'loithienanh';

    const updateTurnBusy = (startedAt, busyMs) => {
      if (!Game?.turn) return;
      if (!Number.isFinite(startedAt) || !Number.isFinite(busyMs)) return;
      const prevBusy = Number.isFinite(Game.turn.busyUntil) ? Game.turn.busyUntil : 0;
      Game.turn.busyUntil = Math.max(prevBusy, startedAt + busyMs);
    };

    const triggerLightningArc = timing => {
      if (!isLoithienanh) return;
      const arcStart = safeNow();
      try {
        const busyMs = vfxAddLightningArc(Game, unit, tgt, {
          bindingKey: 'basic_combo',
          timing
        });
        updateTurnBusy(arcStart, busyMs);
      } catch (_) {}
    };

    const passiveCtx = {
      target: tgt,
      damage: { baseMul: 1, flatAdd: 0 },
      afterHit: [],
      log: Game?.passiveLog
    };
    emitPassiveEvent(Game, unit, 'onBasicHit', passiveCtx);
   
  // VFX: tất cả basic đều step-in/out (1.1s), không dùng tracer
    const meleeDur = CFG?.ANIMATION?.meleeDurationMs ?? 1100;
    const meleeStartMs = safeNow();
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
    const rawBase = Math.max(
      1,
      Math.floor((unit.atk || 0) + (unit.wil || 0))
    );
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
    triggerLightningArc('hit1');
    const abs = Statuses.absorbShield(tgt, dmg, { dtype });

    // Trừ HP phần còn lại
    triggerLightningArc('hit2');
    applyDamage(tgt, abs.remain);

    // VFX: hit ring tại target
    try { vfxAddHit(Game, tgt); } catch (_) {}
    // “Bất Khuất” (undying) — chết còn 1 HP (one-shot)
    if (tgt.hp <= 0) hookOnLethalDamage(tgt);
  const dealt = Math.max(0, Math.min(dmg, abs.remain || 0));
    // Hậu quả sau đòn: phản dmg, độc theo dealt, execute ≤10%…
    Statuses.afterDamage(unit, tgt, { dealt, absorbed: abs.absorbed, dtype });

    const isKill = tgt.hp <= 0;
    gainFury(unit, {
      type: 'basic',
      dealt,
      isKill,
      targetsHit: 1,
      targetMaxHp: Number.isFinite(tgt?.hpMax) ? tgt.hpMax : undefined
    });
    gainFury(tgt, {
      type: 'damageTaken',
      dealt,
      selfMaxHp: Number.isFinite(tgt?.hpMax) ? tgt.hpMax : undefined,
      damageTaken: dealt
    });
    finishFuryHit(tgt);
    finishFuryHit(unit);

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

    fury: {
      max: 100,
      ultCost: 100,
      specialMax: {
        loithienanh: { max: 120, ultCost: 110 }
      },
      caps: {
        perTurn: 40,
        perSkill: 30,
        perHit: 20
      },
      gain: {
        turnStart: { amount: 3 },
        dealSingle: { base: 6, crit: 4, kill: 8, targetRatio: 10 },
        dealAoePerTarget: { base: 3, perTarget: 3, crit: 3, kill: 6, targetRatio: 6 },
        damageTaken: { base: 2, selfRatio: 18 }
      },
      drain: {
        perTargetBase: 10,
        perTargetPct: 0.25,
        skillTotalCap: 40
      }
    },

  turnOrder: {
      pairScan: [1, 4, 7, 2, 5, 8, 3, 6, 9],
      sides: ['ally', 'enemy']
    },

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
      MAX_PIXEL_AREA: 2_400_000,
      CARD_GAP: 12,
      CARD_MIN: 40
    },
    ANIMATION: {
      turnIntervalMs: 480,
      meleeDurationMs: 1100
    },
  // === Debug flags (W0-J1) ===
    DEBUG: {
     SHOW_QUEUED: true,        // vẽ unit "Chờ Lượt" cho phe mình (ally) khi có
     SHOW_QUEUED_ENEMY: false  // kẻ địch không thấy (đúng design)
   },
   PERFORMANCE: {
     LOW_POWER_MODE: false,
      LOW_POWER_DPR: 1.5,
      LOW_POWER_SHADOWS: false,        // true: luôn ưu tiên preset bóng rẻ tiền
      LOW_SHADOW_PRESET: 'off',        // 'off' | 'medium' | 'soft' khi LOW_POWER_SHADOWS bật
      SHADOW_MEDIUM_THRESHOLD: 8,      // ≥ số token này thì giảm blur thay vì tắt hẳn
      SHADOW_DISABLE_THRESHOLD: 10,    // ≥ số token này thì chuyển sang preset rẻ nhất
      MEDIUM_SHADOW_PRESET: 'medium',  // 'medium' | 'soft' | 'off' khi đạt ngưỡng medium
      HIGH_LOAD_SHADOW_PRESET: 'off',  // preset áp dụng khi đạt ngưỡng disable
      SHADOW_HIGH_DPR_CUTOFF: 1.8,     // DPI (dpr) cao hơn ngưỡng sẽ giảm bóng
      HIGH_DPR_SHADOW_PRESET: 'medium' // preset cho màn hình dpr cao
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
__define('./data/announcements.js', (exports, module, __require) => {
  const __dep0 = __require('./data/economy.js');
  const CURRENCY_IDS = __dep0.CURRENCY_IDS;
  const convertCurrency = __dep0.convertCurrency;
  const formatBalance = __dep0.formatBalance;
  const getLotterySplit = __dep0.getLotterySplit;

  const LOTTERY_SPLIT = getLotterySplit();
  const LOTTERY_DEV_PERCENT = Math.round((LOTTERY_SPLIT.devVault || 0) * 100);
  const LOTTERY_PRIZE_PERCENT = Math.round((LOTTERY_SPLIT.prizePool || 0) * 100);

  const TT_CONVERSION_CHAIN = [
    formatBalance(1, CURRENCY_IDS.TT),
    formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.THNT), CURRENCY_IDS.THNT),
    formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.TNT), CURRENCY_IDS.TNT),
    formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.HNT), CURRENCY_IDS.HNT),
    formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.VNT), CURRENCY_IDS.VNT)
  ].join(' = ');

  function isEntryActive(entry, now){
    if (!entry) return false;
    if (!entry.startAt && !entry.endAt) return true;
    const start = entry.startAt ? new Date(entry.startAt) : null;
    const end = entry.endAt ? new Date(entry.endAt) : null;
    if (start && Number.isFinite(start.getTime()) && now < start) return false;
    if (end && Number.isFinite(end.getTime()) && now > end) return false;
    return true;
  }

  const SIDE_SLOT_ANNOUNCEMENTS = [
    {
      key: 'event',
      label: 'Sự kiện giới hạn',
      entries: [
        {
          id: 'primal-lottery',
          title: 'Chiến dịch Vé số Nguyên Tinh',
          shortDescription: `Mở lại vé số tuần, chia ${LOTTERY_PRIZE_PERCENT}% quỹ thưởng và ${LOTTERY_DEV_PERCENT}% vận hành.`,
          tooltip: 'Hoạt động vé số giới hạn thời gian: người chơi dùng tiền tệ trong game để mua vé; 50% doanh thu quay về ví dev để ổn định kinh tế, 50% tích vào giải thưởng cho cộng đồng.',
          rewardCallout: `Chuỗi quy đổi tham chiếu: ${TT_CONVERSION_CHAIN}.`,
          startAt: null,
          endAt: null,
          translationKey: 'sidebar.events.primalLottery'
        },
        {
          id: 'arena-season',
          title: 'Đấu Trường — Mùa 7 ngày',
          shortDescription: 'Deck vs deck do AI điều khiển, vận hành theo mùa 7 ngày với bảng xếp hạng riêng.',
          tooltip: 'Đấu Trường (PvE deck vs deck) chạy theo chu kỳ 7 ngày: dùng lại logic combat, bổ sung hệ thống phần thưởng và bảng xếp hạng để người chơi tranh hạng.',
          rewardCallout: 'Phần thưởng mùa làm mới mỗi tuần.',
          startAt: '2025-09-08T00:00:00+07:00',
          endAt: '2025-09-14T23:59:59+07:00',
          translationKey: 'sidebar.events.arenaSeason'
        }
      ]
    },
    {
      key: 'achievement',
      label: 'Thành tựu nổi bật',
      entries: [
        {
          id: 'beast-kings',
          title: 'Danh hiệu Thú Vương',
          shortDescription: 'Đạt 500/1000/10000 trận thắng trong một mùa đấu thú trường để nhận Thú Vương, Bách Thú Vương, Vạn Thú Vương.',
          tooltip: 'Chuỗi thành tựu đấu thú trường: Thú Vương (500 trận thắng), Bách Thú Vương (1000 trận), Vạn Thú Vương (10000 trận) trong cùng một mùa.',
          rewardCallout: 'Phần thưởng thành tựu sẽ cập nhật sau bản cân bằng tiền tệ.',
          startAt: null,
          endAt: null,
          translationKey: 'sidebar.achievements.beastKings'
        },
        {
          id: 'gacha-legends',
          title: 'Huyền thoại Gacha',
          shortDescription: 'Kẻ May Mắn và Cha của Kẻ May Mắn yêu cầu chuỗi SSR/UR hi hữu trong 10 lần triệu hồi.',
          tooltip: 'Thành tựu gacha: Kẻ May Mắn nhận 3 SSR trong một lần gacha 10; Cha của Kẻ May Mắn nhận 4 SSR hoặc 2 UR trong một lần gacha 10.',
          rewardCallout: 'Thành tựu tôn vinh vận may tuyệt đối trong banner trạm tiếp tế.',
          startAt: '2025-09-15T00:00:00+07:00',
          endAt: '2025-09-30T23:59:59+07:00',
          translationKey: 'sidebar.achievements.gachaLegends'
        }
      ]
    },
    {
      key: 'ladder',
      label: 'Đấu thú trường',
      entries: [
        {
          id: 'ladder-progress',
          title: 'Thang bậc đấu thú',
          shortDescription: 'Chuỗi thắng 1→186 trận đưa bạn từ Đồng đến Tối Cao; giữ top sẽ chạm Đấu Thần & Đấu Vương.',
          tooltip: 'Thắng liên tục mở khoá bậc: 1/3/6 trận đạt Đồng 1/2/3; 10/14/18 cho Bạc; 23→33 cho Vàng; 39→51 cho Bạch Kim; 58→72 cho Kim Cương; 80→96 cho Bậc Thầy; 105→123 cho Bá Chủ; 133→153 cho Thách Đấu; 164→186 cho Tối Cao. Top 1 giữ mùa đạt Đấu Thần, Top 2-4 đạt Đấu Vương.',
          rewardCallout: 'Mọi bậc đều có thưởng; phần thưởng đặc biệt cho Đấu Thần và Đấu Vương cuối mùa.',
          startAt: null,
          endAt: null,
          translationKey: 'sidebar.ladder.progress'
        },
        {
          id: 'defense-record',
          title: 'Giữ vững Đấu Thần',
          shortDescription: 'Đạt Đấu Thần và phòng thủ 300 lượt tấn công mà không thất bại để ghi dấu “Ngươi thật là ích kỷ a”.',
          tooltip: 'Thành tựu phòng thủ đấu thú trường: chịu 300 lần công kích khi ở rank Đấu Thần nhưng không bị đánh bại để nhận danh hiệu “Ngươi thật là ích kỷ a”.',
          rewardCallout: 'Kể cả phòng thủ cũng được ghi nhận trên bảng danh dự đấu thú.',
          startAt: '2025-10-01T00:00:00+07:00',
          endAt: null,
          translationKey: 'sidebar.ladder.defenseRecord'
        }
      ]
    },
    {
      key: 'community',
      label: 'Chat & xã hội',
      entries: [
        {
          id: 'community-channel',
          title: 'Kênh quân đoàn',
          shortDescription: 'Khung chat realtime + thông báo cộng đồng giúp bạn theo dõi đội hình và lịch sự kiện.',
          tooltip: 'Chat & Xã hội: khung chat realtime kết nối quân đoàn, kết hợp thông báo cộng đồng để hội viên bắt kịp hoạt động.',
          rewardCallout: 'Nhận ping khi đội mở lobby hoặc khi sự kiện đấu thú sắp khóa sổ.',
          startAt: null,
          endAt: null,
          translationKey: 'sidebar.community.channel'
        }
      ]
    }
  ];

  function selectAnnouncementEntry(slotKey, options = {}){
    const now = options.now instanceof Date ? options.now : new Date();
    const slot = SIDE_SLOT_ANNOUNCEMENTS.find(item => item.key === slotKey);
    if (!slot) return null;
    const entry = slot.entries.find(item => isEntryActive(item, now)) || slot.entries[0] || null;
    if (!entry) return null;
    return { slot, entry };
  }

  function getAllSidebarAnnouncements(options = {}){
    const now = options.now instanceof Date ? options.now : new Date();
    return SIDE_SLOT_ANNOUNCEMENTS.map(slot => {
      const entry = slot.entries.find(item => isEntryActive(item, now)) || slot.entries[0] || null;
      return {
        key: slot.key,
        label: slot.label,
        entry
      };
    }).filter(item => Boolean(item.entry));
  }


  exports.SIDE_SLOT_ANNOUNCEMENTS = SIDE_SLOT_ANNOUNCEMENTS;
  exports.selectAnnouncementEntry = selectAnnouncementEntry;
  exports.getAllSidebarAnnouncements = getAllSidebarAnnouncements;
  exports.default = SIDE_SLOT_ANNOUNCEMENTS;
  module.exports.default = exports.default;
});
__define('./data/economy.js', (exports, module, __require) => {
  const __dep0 = __require('./utils/format.js');
  const HAS_INTL_NUMBER_FORMAT = __dep0.HAS_INTL_NUMBER_FORMAT;
  const createNumberFormatter = __dep0.createNumberFormatter;

  const CURRENCY_IDS = Object.freeze({
    VNT: 'VNT',
    HNT: 'HNT',
    TNT: 'TNT',
    THNT: 'ThNT',
    TT: 'TT'
  });

  const CURRENCIES = Object.freeze([
    {
      id: CURRENCY_IDS.VNT,
      name: 'Vụn Nguyên Tinh',
      shortName: 'Vụn',
      suffix: 'VNT',
      ratioToBase: 1,
      description: 'Đơn vị nhỏ nhất, rơi ra từ tinh thể vỡ và hoạt động hằng ngày.'
    },
    {
      id: CURRENCY_IDS.HNT,
      name: 'Hạ Nguyên Tinh',
      shortName: 'Hạ',
      suffix: 'HNT',
      ratioToBase: 100,
      description: 'Tinh thể đã tinh luyện, dùng cho giao dịch phổ thông và vé gacha thường.'
    },
    {
      id: CURRENCY_IDS.TNT,
      name: 'Trung Nguyên Tinh',
      shortName: 'Trung',
      suffix: 'TNT',
      ratioToBase: 1000,
      description: 'Kho dự trữ cho các kiến trúc tông môn, chế tác pháp khí và banner cao cấp.'
    },
    {
      id: CURRENCY_IDS.THNT,
      name: 'Thượng Nguyên Tinh',
      shortName: 'Thượng',
      suffix: 'ThNT',
      ratioToBase: 10000,
      description: 'Đơn vị luân chuyển giữa các tông môn, đổi thưởng cao cấp và sự kiện giới hạn.'
    },
    {
      id: CURRENCY_IDS.TT,
      name: 'Thần Tinh',
      shortName: 'Thần',
      suffix: 'TT',
      ratioToBase: 100000,
      description: 'Đơn vị tối thượng cho các giao dịch Prime và quỹ dự trữ chiến lược.'
    }
  ]);

  const CURRENCY_INDEX = CURRENCIES.reduce((acc, currency) => {
    acc[currency.id] = currency;
    return acc;
  }, {});

  function getCurrency(currencyId){
    return CURRENCY_INDEX[currencyId] || null;
  }

  function listCurrencies(){
    return CURRENCIES.slice();
  }

  function convertCurrency(value, fromId, toId){
    const from = getCurrency(fromId);
    const to = getCurrency(toId);
    if (!from || !to){
      throw new Error(`Invalid currency conversion from ${fromId} to ${toId}`);
    }
    const valueInBase = value * from.ratioToBase;
    return valueInBase / to.ratioToBase;
  }

  const FORMATTER_STANDARD = createNumberFormatter('vi-VN', {
    maximumFractionDigits: 0
  });

  let FORMATTER_COMPACT = FORMATTER_STANDARD;
  let HAS_COMPACT_FORMAT = false;
  if (HAS_INTL_NUMBER_FORMAT){
    try {
      FORMATTER_COMPACT = createNumberFormatter('vi-VN', {
        notation: 'compact',
        maximumFractionDigits: 1
      });
      HAS_COMPACT_FORMAT = true;
    } catch (error) {
      FORMATTER_COMPACT = FORMATTER_STANDARD;
    }
  }

  function formatBalance(value, currencyId, options = {}){
    const currency = getCurrency(currencyId);
    if (!currency){
      throw new Error(`Unknown currency id: ${currencyId}`);
    }

    const {
      notation = 'standard',
      includeSuffix = true,
      precision,
      autoScale = false
    } = options;

    let amount = value;
    let suffix = currency.suffix;

    if (autoScale){
      const ordered = CURRENCIES.slice().sort((a, b) => a.ratioToBase - b.ratioToBase);
      for (let i = ordered.length - 1; i >= 0; i -= 1){
        const candidate = ordered[i];
        const inCandidate = convertCurrency(value, currency.id, candidate.id);
        if (Math.abs(inCandidate) >= 1){
          amount = inCandidate;
          suffix = candidate.suffix;
          break;
        }
      }
    }

    const shouldUseCompact = notation === 'compact' && HAS_COMPACT_FORMAT;

    let formatter = shouldUseCompact ? FORMATTER_COMPACT : FORMATTER_STANDARD;
    if (typeof precision === 'number'){
      const formatterOptions = {
        maximumFractionDigits: precision,
        minimumFractionDigits: precision
      };
      if (shouldUseCompact && HAS_INTL_NUMBER_FORMAT){
        formatterOptions.notation = 'compact';
      }
      formatter = createNumberFormatter('vi-VN', formatterOptions);
    }

    const formatted = formatter.format(amount);
    return includeSuffix ? `${formatted} ${suffix}` : formatted;
  }

  const PITY_CONFIG = Object.freeze({
    SSR: Object.freeze({
      tier: 'SSR',
      hardPity: 60,
      softGuarantees: []
    }),
    UR: Object.freeze({
      tier: 'UR',
      hardPity: 70,
      softGuarantees: [
        { tier: 'SSR', pull: 50 }
      ]
    }),
    PRIME: Object.freeze({
      tier: 'PRIME',
      hardPity: 80,
      softGuarantees: [
        { tier: 'SSR', pull: 40 },
        { tier: 'UR', pull: 60 }
      ]
    })
  });

  function getPityConfig(tier){
    return PITY_CONFIG[tier] || null;
  }

  function listPityTiers(){
    return Object.keys(PITY_CONFIG);
  }

  const SHOP_TAX_BRACKETS = Object.freeze([
    { rank: 'N', label: 'Phổ thông (N)', rate: 0.05 },
    { rank: 'R', label: 'Hiếm (R)', rate: 0.08 },
    { rank: 'SR', label: 'Siêu hiếm (SR)', rate: 0.1 },
    { rank: 'SSR', label: 'Cực hiếm (SSR)', rate: 0.12 },
    { rank: 'UR', label: 'Siêu thực (UR)', rate: 0.15 },
    { rank: 'PRIME', label: 'Tối thượng (Prime)', rate: 0.18 }
  ]);

  const SHOP_TAX_INDEX = SHOP_TAX_BRACKETS.reduce((acc, bracket) => {
    acc[bracket.rank] = bracket;
    return acc;
  }, {});

  function getShopTaxBracket(rank){
    return SHOP_TAX_INDEX[rank] || null;
  }

  function getShopTaxRate(rank){
    const bracket = getShopTaxBracket(rank);
    return bracket ? bracket.rate : null;
  }

  const LOTTERY_SPLIT = Object.freeze({
    devVault: 0.5,
    prizePool: 0.5
  });

  function getLotterySplit(){
    return LOTTERY_SPLIT;
  }

  exports.CURRENCY_IDS = CURRENCY_IDS;
  exports.CURRENCIES = CURRENCIES;
  exports.listCurrencies = listCurrencies;
  exports.getCurrency = getCurrency;
  exports.convertCurrency = convertCurrency;
  exports.formatBalance = formatBalance;
  exports.PITY_CONFIG = PITY_CONFIG;
  exports.getPityConfig = getPityConfig;
  exports.listPityTiers = listPityTiers;
  exports.SHOP_TAX_BRACKETS = SHOP_TAX_BRACKETS;
  exports.getShopTaxBracket = getShopTaxBracket;
  exports.getShopTaxRate = getShopTaxRate;
  exports.LOTTERY_SPLIT = LOTTERY_SPLIT;
  exports.getLotterySplit = getLotterySplit;
});
__define('./data/modes.js', (exports, module, __require) => {
  const __dep0 = __require('./data/economy.js');
  const getLotterySplit = __dep0.getLotterySplit;
  const getPityConfig = __dep0.getPityConfig;
  const getShopTaxRate = __dep0.getShopTaxRate;

  const SSR_PITY = getPityConfig('SSR');
  const UR_PITY = getPityConfig('UR');
  const PRIME_PITY = getPityConfig('PRIME');
  const LOTTERY_SPLIT = getLotterySplit();
  const BASE_TAX_RATE = getShopTaxRate('N');
  const TOP_TAX_RATE = getShopTaxRate('PRIME');

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
      shortDescription: `Quầy gacha phân tab Nhân Vật, Công Pháp, Vũ Khí, Sủng Thú với bảo hiểm ${SSR_PITY?.hardPity || 60}/${UR_PITY?.hardPity || 70}/${PRIME_PITY?.hardPity || 80} lượt cho các banner SSR/UR/Prime.`,
      unlockNotes: `Banner UR bảo hiểm SSR ở lượt ${UR_PITY?.softGuarantees?.[0]?.pull || 50}; banner Prime lần lượt bảo hiểm SSR/UR ở ${PRIME_PITY?.softGuarantees?.map(rule => rule.pull).join('/') || '40/60'} và Prime ở ${PRIME_PITY?.hardPity || 80}.`,
      tags: ['Kinh tế nguyên tinh', 'Coming soon'],
      menuSections: ['economy'],
      shell: {
        screenId: 'main-menu',
        fallbackModuleId: './modes/coming-soon.stub.js'
      }
    },
    {
      id: 'lineup',
      title: 'Đội Hình',
      type: MODE_TYPES.ECONOMY,
      status: MODE_STATUS.AVAILABLE,
      icon: '🧾',
      shortDescription: 'Quản lý các đội hình đề xuất cho PvE, PvP thử nghiệm và hạ tầng kinh tế.',
      unlockNotes: 'Mở khi người chơi hoàn tất hướng dẫn xây dựng đội hình đầu tiên trong phần Chiến Dịch.',
      tags: ['Kinh tế nguyên tinh'],
      menuSections: ['economy'],
      shell: {
        screenId: 'lineup',
        moduleId: './screens/lineup/index.js',
        defaultParams: {
          shortDescription: 'Theo dõi đội hình đề xuất và cấu trúc tổ đội tối ưu cho từng mục tiêu.',
          lineups: [
            {
              id: 'starter-balance',
              title: 'Khởi đầu Cân bằng',
              role: 'PvE cốt truyện',
              description: 'Đội hình 3 DPS linh hoạt kèm 1 hỗ trợ buff và 1 tanker giữ aggro cho các màn đầu.',
              members: [
                'Thần Kiếm Lục Ảnh · DPS',
                'Huyền Chân Đan Sư · Hỗ trợ',
                'Thiên Khuyết Long Ẩn · DPS',
                'Thánh Hộ Vệ Viêm Lân · Tank',
                'Thái Âm Tuyết Hồ · DPS phụ'
              ]
            }
          ]
        }
      }
    },
    {
      id: 'collection',
      title: 'Bộ Sưu Tập',
      type: MODE_TYPES.ECONOMY,
      status: MODE_STATUS.AVAILABLE,
      icon: '📚',
      shortDescription: 'Hiển thị hồ sơ nhân vật, sủng thú, công pháp, rank budget, sao và class từ dữ liệu tổng hợp.',
      unlockNotes: 'Mở khi người chơi bắt đầu thu thập nhân vật và sủng thú để theo dõi tiến trình nâng sao và rank budget.',
      tags: ['Kinh tế nguyên tinh'],
      menuSections: ['economy'],
      shell: {
        screenId: 'collection',
        moduleId: './screens/collection/index.js',
        defaultParams: null
      }
    },
    {
      id: 'market',
      title: 'Chợ Đen & Shop Dev',
      type: MODE_TYPES.ECONOMY,
      status: MODE_STATUS.COMING_SOON,
      icon: '💰',
      shortDescription: `Trao đổi vật phẩm giữa người chơi với thuế theo bậc từ ${Math.round((BASE_TAX_RATE || 0) * 100)}% tới ${Math.round((TOP_TAX_RATE || 0) * 100)}% cùng shop dev bán vật phẩm bằng tiền thật.`,
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
      shortDescription: 'Event giới hạn thời gian kết hợp vé số dùng tiền tệ trong game với cơ chế chia doanh thu rõ ràng.',
      unlockNotes: `Vé số chuyển ${Math.round((LOTTERY_SPLIT.devVault || 0) * 100)}% cho quỹ vận hành và ${Math.round((LOTTERY_SPLIT.prizePool || 0) * 100)}% vào quỹ giải thưởng, kích hoạt theo lịch sự kiện.`,
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
  exports.listModesForSection = listModesForSection;
  exports.getMenuSections = getMenuSections;
});
__define('./data/roster-preview.js', (exports, module, __require) => {
  const __dep0 = __require('./catalog.js');
  const CLASS_BASE = __dep0.CLASS_BASE;
  const RANK_MULT = __dep0.RANK_MULT;
  const ROSTER = __dep0.ROSTER;

  // Talent Point (TP) deltas documented in "ý tưởng nhân vật v3.txt".
  const TP_DELTA = Object.freeze({
    HP: 20,
    ATK: 1,
    WIL: 1,
    ARM: 0.01,
    RES: 0.01,
    AGI: 1,
    PER: 1,
    AEmax: 10,
    AEregen: 0.5,
    HPregen: 2
  });

  const STAT_ORDER = [
    'HP',
    'ATK',
    'WIL',
    'ARM',
    'RES',
    'AGI',
    'PER',
    'SPD',
    'AEmax',
    'AEregen',
    'HPregen'
  ];

  const PRECISION = {
    ARM: 100,
    RES: 100,
    SPD: 100,
    AEregen: 10
  };

  function roundStat(stat, value) {
    const precision = PRECISION[stat] ?? 1;
    return Math.round(value * precision) / precision;
  }

  function roundTpValue(value) {
    return Math.round(value * 1e6) / 1e6;
  }

  function sanitizeTpAllocation(tpAlloc = {}) {
    const clean = {};
    for (const [stat, value] of Object.entries(tpAlloc)) {
      if (!TP_DELTA[stat]) continue;
      const rounded = roundTpValue(value ?? 0);
      if (rounded !== 0) {
        clean[stat] = rounded;
      }
    }
    return clean;
  }

  function applyTpToBase(base, tpAlloc = {}) {
    const cleanTp = sanitizeTpAllocation(tpAlloc);
    const out = {};
    for (const [stat, baseValue] of Object.entries(base)) {
      const delta = TP_DELTA[stat];
      if (delta) {
        const tp = cleanTp[stat] ?? 0;
        out[stat] = baseValue + delta * tp;
      } else {
        out[stat] = baseValue;
      }
    }
    return out;
  }

  function getRankMultiplier(rank) {
    const multiplier = RANK_MULT[rank];
    if (multiplier === undefined) {
      throw new Error(`Missing rank multiplier for "${rank}"`);
    }
    return multiplier;
  }

  function applyRankMultiplier(preRank, rank) {
    const multiplier = getRankMultiplier(rank);
    const out = {};
    for (const [stat, value] of Object.entries(preRank)) {
      if (stat === 'SPD') {
        out[stat] = roundStat(stat, value);
        continue;
      }
      out[stat] = roundStat(stat, value * multiplier);
    }
    return out;
  }

  function computeFinalStats(className, rank, tpAlloc = {}) {
    const base = CLASS_BASE[className];
    if (!base) {
      throw new Error(`Unknown class "${className}"`);
    }
    const preRank = applyTpToBase(base, tpAlloc);
    return applyRankMultiplier(preRank, rank);
  }

  function deriveTpFromMods(base, mods = {}) {
    if (!mods) return {};
    const tp = {};
    for (const [stat, modValue] of Object.entries(mods)) {
      if (!TP_DELTA[stat]) continue;
      const baseValue = base[stat];
      if (typeof baseValue !== 'number') continue;
      const raw = (baseValue * (modValue ?? 0)) / TP_DELTA[stat];
      const rounded = roundTpValue(raw);
      if (rounded !== 0) {
        tp[stat] = rounded;
      }
    }
    return tp;
  }

  function totalTp(tpAlloc = {}) {
    return roundTpValue(
      Object.values(tpAlloc).reduce((sum, value) => sum + value, 0)
    );
  }

  function buildRosterPreviews(tpAllocations = undefined) {
    const result = {};
    for (const unit of ROSTER) {
      const base = CLASS_BASE[unit.class];
      if (!base) continue;
      const derivedTp = tpAllocations?.[unit.id] ?? deriveTpFromMods(base, unit.mods);
      const cleanTp = sanitizeTpAllocation(derivedTp);
      const preRank = applyTpToBase(base, cleanTp);
      const multiplier = getRankMultiplier(unit.rank);
      const final = applyRankMultiplier(preRank, unit.rank);
      result[unit.id] = {
        id: unit.id,
        name: unit.name,
        class: unit.class,
        rank: unit.rank,
        rankMultiplier: multiplier,
        tp: cleanTp,
        totalTP: totalTp(cleanTp),
        preRank,
        final
      };
    }
    return result;
  }

  function buildPreviewRows(previews, statsOrder = STAT_ORDER) {
    return statsOrder.map((stat) => ({
      stat,
      values: ROSTER.map((unit) => {
        const preview = previews[unit.id];
        return {
          id: unit.id,
          name: unit.name,
          value: preview?.final?.[stat] ?? null,
          preRank: preview?.preRank?.[stat] ?? null,
          tp: preview?.tp?.[stat] ?? 0
        };
      })
    }));
  }

  const ROSTER_TP_ALLOCATIONS = Object.fromEntries(
    ROSTER.map((unit) => {
      const base = CLASS_BASE[unit.class];
      return [unit.id, deriveTpFromMods(base, unit.mods)];
    })
  );

  const ROSTER_PREVIEWS = buildRosterPreviews(ROSTER_TP_ALLOCATIONS);
  const ROSTER_PREVIEW_ROWS = buildPreviewRows(ROSTER_PREVIEWS);
  const STAT_KEYS = [...STAT_ORDER];
  exports.TP_DELTA = TP_DELTA;
  exports.ROSTER_TP_ALLOCATIONS = ROSTER_TP_ALLOCATIONS;
  exports.ROSTER_PREVIEWS = ROSTER_PREVIEWS;
  exports.ROSTER_PREVIEW_ROWS = ROSTER_PREVIEW_ROWS;
  exports.STAT_KEYS = STAT_KEYS;
  exports.applyTpToBase = applyTpToBase;
  exports.applyRankMultiplier = applyRankMultiplier;
  exports.computeFinalStats = computeFinalStats;
  exports.deriveTpFromMods = deriveTpFromMods;
  exports.buildRosterPreviews = buildRosterPreviews;
  exports.buildPreviewRows = buildPreviewRows;
});
__define('./data/skills.js', (exports, module, __require) => {
  const __dep0 = __require('./catalog.js');
  const ROSTER = __dep0.ROSTER;

  function deepFreeze(value){
    if (Array.isArray(value)){
      value.forEach(deepFreeze);
      return Object.freeze(value);
    }
    if (value && typeof value === 'object'){
      Object.values(value).forEach(deepFreeze);
      return Object.freeze(value);
    }
    return value;
  }

  function normalizeSection(section){
    if (!section) return null;
    if (typeof section === 'string'){
      return { name: '', description: section };
    }
    const normalized = { ...section };
    if (Array.isArray(section.tags)){
      normalized.tags = [...section.tags];
    }
    if (Array.isArray(section.notes)){
      normalized.notes = [...section.notes];
    }
    if (section.notes && !Array.isArray(section.notes)){
      normalized.notes = [section.notes];
    }
    return normalized;
  }

  function normalizeSkillEntry(entry){
    if (!entry) return null;
    const normalized = { ...entry };
    if (Array.isArray(entry.tags)){
      normalized.tags = [...entry.tags];
    }
    if (entry.cost && typeof entry.cost === 'object'){
      normalized.cost = { ...entry.cost };
    }
    if (Array.isArray(entry.notes)){
      normalized.notes = [...entry.notes];
    }
    if (entry.notes && !Array.isArray(entry.notes)){
      normalized.notes = [entry.notes];
    }
    return normalized;
  }

  const rawSkillSets = [
    {
      unitId: 'phe',
      basic: {
        name: 'Đánh Thường',
        type: 'basic',
        tags: ['single-target', 'lifesteal', 'mark'],
        effects: {
          lifesteal: { percentOfDamage: 0.10 },
          applyMark: { id: 'phe_mark', stacks: 1, maxStacks: 3, ttlTurns: 3, refreshOnHit: true }
        },
        description: 'Gây sát thương theo n% WIL + x% ATK lên một mục tiêu, hồi lại 10% lượng sát thương gây ra và đặt 1 tầng Phệ Ấn lên mục tiêu (tối đa 3 tầng, làm mới thời gian tồn tại mỗi khi cộng dồn).'
      },
      skills: [
        {
          key: 'skill1',
          name: 'Song Huyết Cầu',
          type: 'active',
          cost: { aether: 25 },
          tags: ['counts-as-basic', 'multi-hit'],
          hits: 2,
          targets: 'randomEnemies',
          description: 'Phóng hai huyết cầu vào hai kẻ địch ngẫu nhiên. Mỗi hit gây 150% sát thương đòn đánh thường, được tính như đòn đánh thường để kích hoạt hút máu và Phệ Ấn, đồng thời làm mới thời hạn dấu ấn trên mục tiêu trúng đòn.'
        },
        {
          key: 'skill2',
          name: 'Huyết Chướng',
          type: 'active',
          cost: { aether: 25 },
          duration: { turns: 2 },
          buffs: [{ stat: 'damageTaken', type: 'multiplier', amount: -0.30 }],
          shields: [{ stat: 'hpRegen', amountPercentMaxHP: 0.15, perTurn: true }],
          description: 'Tạo màn huyết chướng trong 2 lượt: Phệ giảm 30% sát thương phải chịu, nhận hồi phục 15% Máu tối đa mỗi lượt và không thể bị chỉ định bởi đòn đơn mục tiêu. Hiệu ứng duy trì kể cả khi đang bị khống chế.'
        },
        {
          key: 'skill3',
          name: 'Huyết Thệ',
          type: 'active',
          cost: { aether: 40 },
          duration: { turns: 5 },
          links: { maxConcurrent: 1, sharePercent: 0.5 },
          description: 'Liên kết thanh HP với một đồng minh ngẫu nhiên (có thể là Leader) trong 5 lượt. 50% sát thương đồng minh phải nhận sẽ chuyển sang Phệ; chỉ duy trì một mối liên kết cùng lúc và thay thế liên kết cũ nếu dùng lại.'
        }
      ],
      ult: {
        name: 'Thiên Mệnh Phệ Nguyên Kinh',
        type: 'ultimate',
        tags: ['aoe', 'hp-drain', 'counts-as-basic'],
        duration: { turns: 2, affectedStat: 'WIL' },
        hpDrain: { percentCurrentHP: 0.07, perBoss: 0.07 },
        damage: { scaleWIL: 0.80, type: 'arcane', unavoidable: true },
        heals: { selfPercentTotalDamage: 0.40, allies: { targets: 2, percentTotalDamage: 0.30 } },
        overhealToShield: { capPercentMaxHP: 1.0 },
        postBuff: { stat: 'WIL', percent: 0.20, turns: 2 },
        marksApplied: { stacks: 1, maxPerTarget: 3 },
        description: 'Hút máu toàn bộ kẻ địch: mỗi mục tiêu mất 7% HP hiện tại + 80% WIL của Phệ (Thuật, không thể né tránh, vẫn chịu kháng). Phần sát thương gây ra hồi cho Phệ 40% và hồi cho hai đồng minh ngẫu nhiên mỗi người 30%, phần vượt trần chuyển thành Giáp Máu tới tối đa +100% Máu tối đa. Sau khi thi triển nhận thêm 20% WIL trong 2 lượt và đặt 1 tầng Phệ Ấn lên các mục tiêu bị hút.'
      },
      talent: {
        name: 'Phệ Ấn',
        type: 'talent',
        maxStacks: 3,
        explosion: { damageScaleWIL: 0.50, trigger: 'onTurnStartTarget' },
        ttl: { turns: 3, refreshOnApply: true },
        purgeable: false,
        description: 'Mỗi đòn đánh thường/kỹ năng/tuyệt kỹ trúng mục tiêu đặt 1 Phệ Ấn (tối đa 3 cộng dồn). Khi đạt 3 cộng dồn, Phệ Ấn tự kích nổ trong lượt của mục tiêu, gây sát thương bằng 50% WIL của Phệ. Dấu ấn tồn tại tối đa 3 lượt nếu không được làm mới và không thể bị xoá bỏ, lãng quên hoặc cướp. Chúc Phúc Của Huyết Chủ: khi vào trận nhận thêm 15% Máu tối đa và +50% hồi HP.'
      },
      technique: null,
      notes: [
        'Song Huyết Cầu và mọi hit từ tuyệt kỹ đều được tính như đòn đánh thường để cộng Phệ Ấn và hút máu.',
        'Huyết Thệ chuyển hướng sát thương nhưng Phệ vẫn chịu sát thương nên cần giữ lượng hồi phục luôn sẵn sàng.'
      ]
    },
    {
      unitId: 'kiemtruongda',
      basic: {
        name: 'Đánh Thường',
        type: 'basic',
        tags: ['single-target', 'armor-pierce'],
        piercePercent: 0.05,
        description: 'Chém một mục tiêu bằng n% ATK + x% WIL và bỏ qua 5% ARM/RES của mục tiêu. Mỗi nguồn xuyên giáp khác từ bộ kỹ năng sẽ cộng dồn trực tiếp với hiệu ứng này.'
      },
      skills: [
        {
          key: 'skill1',
          name: 'Loạn Trảm Dạ Hành',
          type: 'active',
          cost: { aether: 25 },
          hits: 1,
          tags: ['counts-as-basic', 'line-target'],
          targets: 'randomRow',
          description: 'Gây sát thương bằng 150% đòn đánh thường lên một hàng ngang ngẫu nhiên (1-2-3, 4-5-6 hoặc 7-8-9). Được tính là đòn đánh thường, giữ nguyên khả năng xuyên giáp hiện có của Kiếm Trường Dạ.'
        },
        {
          key: 'skill2',
          name: 'Ngũ Kiếm Huyền Ấn',
          type: 'active',
          cost: { aether: 20 },
          duration: { turns: 'battle' },
          buffs: [
            { id: 'kiem_sinh', effect: 'lifesteal', amountPercentDamage: 0.05 },
            { id: 'kiem_ma', effect: 'pierce', amount: 0.10 },
            { id: 'kiem_tho', effect: 'selfBuff', stats: { ARM: 0.05, RES: 0.05 } },
            { id: 'kiem_hoa', effect: 'damageBonus', amount: 0.05 },
            { id: 'kiem_hu', effect: 'dodge', amount: 0.15 }
          ],
          description: 'Kích hoạt ngẫu nhiên một trong năm trạng thái kiếm cho tới hết trận: Kiếm Sinh (hút máu 5% tổng sát thương gây ra), Kiếm Ma (xuyên thêm 10% ARM/RES), Kiếm Thổ (+5% ARM/RES), Kiếm Hỏa (+5% tổng sát thương), Kiếm Hư (+15% tỉ lệ né đòn đánh thường). Mỗi trận chỉ duy trì một trạng thái và không thể thay đổi.'
        },
        {
          key: 'skill3',
          name: 'Kiếm Ý Tinh Luyện',
          type: 'active',
          cost: { aether: 25 },
          duration: { turns: 3, start: 'nextTurn' },
          buffs: [{ stats: { ATK: 0.20, WIL: 0.20 }, delayTurns: 1 }],
          description: 'Tăng 20% ATK/WIL dựa trên chỉ số hiện tại trong 3 lượt, hiệu lực bắt đầu từ lượt kế tiếp sau khi thi triển. Có thể cộng dồn với các nguồn buff khác.'
        }
      ],
      ult: {
        name: 'Vạn Kiếm Quy Tông',
        type: 'ultimate',
        tags: ['counts-as-basic', 'column'],
        hits: 4,
        piercePercent: 0.30,
        targets: 'columnMid',
        description: 'Phóng thích 4 nhát chém dọc cột giữa hướng Leader địch (ô 2-5-8). Mỗi hit gây 80% sát thương đòn đánh thường (lai vật lý/thuật), xuyên 30% RES và được tính là đòn đánh thường; nếu mục tiêu né đòn đánh thường thì hit tương ứng trượt.'
      },
      talent: {
        name: 'Kiếm Tâm',
        type: 'talent',
        scaling: { stats: { ATK: 0.05, WIL: 0.05 }, basedOn: 'battleStart' },
        description: 'Mỗi lần thi triển tuyệt kỹ thành công, Kiếm Trường Dạ nhận vĩnh viễn +5% ATK và +5% WIL dựa trên chỉ số ban đầu khi vào trận. Hiệu ứng tích lũy không giới hạn, không thể bị xoá hoặc cướp.'
      },
      technique: null,
      notes: [
        'Các hit từ tuyệt kỹ được tính riêng rẽ giúp tận dụng hiệu ứng đòn đánh thường và cộng dồn Xuyên Giáp.',
        'Ngũ Kiếm Huyền Ấn cần hiệu ứng hình ảnh để người chơi nhận biết trạng thái hiện tại.'
      ]
    },
    {
      unitId: 'loithienanh',
      basic: {
        name: 'Đánh Thường',
        type: 'basic',
        hits: 2,
        tags: ['multi-hit', 'spd-debuff'],
        debuffs: [{ stat: 'SPD', amountPercent: -0.02, maxStacks: 5 }],
        description: 'Ra hai cú đấm liên tiếp vào một mục tiêu: hit đầu gây sát thương bằng n% ATK + x% WIL, hit thứ hai gây thêm 50% sát thương của hit đầu. Mỗi hit giảm 2% SPD của mục tiêu (tối đa 5 cộng dồn) cho tới khi bị xoá.'
      },
      skills: [
        {
          key: 'skill1',
          name: 'Lôi Ảnh Tam Kích',
          type: 'active',
          cost: { aether: 25 },
          hits: 3,
          tags: ['counts-as-basic', 'random-target'],
          bonusDamage: { condition: 'targetsAdjacent', amount: 0.10 },
          description: 'Giương tay thu lôi đánh ngẫu nhiên ba kẻ địch, mỗi mục tiêu nhận 110% sát thương đòn đánh thường và được tính như đòn đánh thường. Nếu cả ba mục tiêu đứng liền kề nhau, toàn bộ nhận thêm 10% sát thương.'
        },
        {
          key: 'skill2',
          name: 'Ngũ Lôi Phệ Thân',
          type: 'active',
          cost: { aether: 35 },
          hpTrade: { percentMaxHP: 0.05, lethal: false },
          hits: 5,
          tags: ['random-target'],
          description: 'Thiêu đốt 5% Máu tối đa của bản thân (không thể tự sát) rồi gọi 5 lôi cầu tấn công ngẫu nhiên 5 kẻ địch. Mỗi cầu gây 130% sát thương đòn đánh thường nhưng không được tính là đòn đánh thường.'
        },
        {
          key: 'skill3',
          name: 'Lôi Thể Bách Chiến',
          type: 'active',
          cost: { aether: 30 },
          buffs: [{ stat: 'HP', type: 'percentBase', amount: 0.20 }],
          limitUses: 3,
          lockout: 'battle',
          description: 'Tăng 20% Máu tối đa dựa trên giá trị gốc khi vào trận. Sau 3 lần sử dụng, kỹ năng bị khoá cho tới hết trận.'
        }
      ],
      ult: {
        name: 'Huyết Hồn Lôi Quyết',
        type: 'ultimate',
        tags: ['hp-trade', 'multi-hit', 'counts-as-basic'],
        hits: 3,
        hpTrade: { percentMaxHP: 0.15, lethal: false, minHP: 1 },
        damage: { basePercentMaxHPTarget: 0.07, bossPercent: 0.04, scaleWIL: 0.50, type: 'arcane' },
        debuffs: [{ stat: 'SPD', amountPercent: -0.02, maxStacks: 5 }],
        postBuff: { stat: 'damageTaken', percent: -0.30, turns: 2 },
        duration: { turns: 2 },
        description: 'Thiêu đốt 15% Máu tối đa của bản thân (không làm giảm trần, không thể tự sát, tối thiểu còn 1 HP) rồi gây sát thương Thuật bằng 7% Max HP mục tiêu (4% với boss PvE) + 50% WIL lên 3 kẻ địch ngẫu nhiên. Mỗi hit được tính là đòn đánh thường và cộng thêm 1 tầng giảm 2% SPD (tối đa 5 tầng). Sau khi thi triển, Lôi Thiên Ảnh giảm 30% sát thương phải chịu trong 2 lượt.'
      },
      talent: {
        name: 'Song Thể Lôi Đạo',
        type: 'talent',
        description: 'Khi HP ≥ 50%, Lôi Thiên Ảnh nhận +20% ARM/RES. Khi HP ≤ 49%, chuyển sang +20% WIL/ATK. Hiệu ứng luôn hoạt động, không thể bị xoá hoặc lãng quên.'
      },
      technique: null,
      notes: [
        'Các kỹ năng tiêu hao HP không thể khiến nhân vật tự sát.',
        'Giảm SPD từ đòn đánh thường cũng áp dụng lên các hit của tuyệt kỹ.'
      ]
    },
    {
      unitId: 'laky',
      basic: {
        name: 'Đánh Thường',
        type: 'basic',
        tags: ['single-target', 'sleep-setup'],
        debuffs: [{ id: 'me_hoac', stacks: 1, maxStacks: 4, effect: 'sleepTrigger' }],
        description: 'Gây sát thương bằng n% WIL + x% ATK lên một mục tiêu và cộng 1 tầng “Mê Hoặc”. Đạt 4 tầng khiến mục tiêu ngủ trong 1 lượt rồi đặt lại; các tầng không thể bị xoá trước khi kích hoạt.'
      },
      skills: [
        {
          key: 'skill1',
          name: 'Mộng Trảo',
          type: 'active',
          cost: { aether: 25 },
          hits: 3,
          tags: ['counts-as-basic', 'random-aoe'],
          description: 'Gây ba đòn tấn công diện rộng ngẫu nhiên, mỗi đòn gây 130% sát thương đòn đánh thường, cộng tầng Mê Hoặc cho các mục tiêu trúng hit.'
        },
        {
          key: 'skill2',
          name: 'Vạn Mộng Trận',
          type: 'active',
          cost: { aether: 35 },
          hits: 5,
          tags: ['counts-as-basic', 'random-aoe'],
          description: 'Gây năm đòn diện rộng ngẫu nhiên, mỗi đòn gây 100% sát thương đòn đánh thường và cộng tầng Mê Hoặc cho từng mục tiêu trúng hit.'
        },
        {
          key: 'skill3',
          name: 'Mộng Giới Hộ Thân',
          type: 'active',
          cost: { aether: 20 },
          duration: { turns: 3 },
          buffs: [{ stat: 'damageTaken', percent: -0.20 }],
          description: 'Tạo kết giới mộng bảo hộ trong 3 lượt, giảm 20% mọi sát thương phải chịu.'
        }
      ],
      ult: {
        name: 'Đại Mộng Thiên Thu',
        type: 'ultimate',
        tags: ['control', 'sleep'],
        duration: { turns: 2, bossModifier: 0.5 },
        targets: 3,
        description: 'Gây trạng thái Ngủ lên ba kẻ địch ngẫu nhiên trong 2 lượt: mục tiêu không hành động, không thể né/đỡ/parry nhưng vẫn nhận sát thương đầy đủ. Boss PvE chỉ ngủ nửa thời gian (làm tròn xuống).'
      },
      talent: {
        name: 'Mê Mộng Chú',
        type: 'talent',
        buffs: { perSleepingEnemy: { stat: 'RES', percent: 0.02 }, maxStacks: null },
        description: 'Nhận +2% RES cho mỗi kẻ địch đang ngủ. Hiệu ứng cộng dồn không giới hạn, luôn hoạt động và không thể bị xoá.'
      },
      technique: null,
      notes: [
        'Hiệu ứng Mê Hoặc không tự biến mất; sau khi kích hoạt ngủ sẽ đặt lại số tầng về 0.',
        'Có thể hỗ trợ đồng đội khống chế bằng cách chuẩn bị sẵn tầng Mê Hoặc trước khi dùng tuyệt kỹ.'
      ]
    },
    {
      unitId: 'doanminh',
      basic: {
        name: 'Đánh Thường',
        type: 'basic',
        tags: ['single-target'],
        description: 'Gây sát thương bằng n% WIL + x% ATK lên một mục tiêu.'
      },
      skills: [
        {
          key: 'skill1',
          name: 'Cán Cân Giáng Phạt',
          type: 'active',
          cost: { aether: 20 },
          tags: ['counts-as-basic'],
          description: 'Dùng cán cân nện vào một kẻ địch, gây 150% sát thương đòn đánh thường và được tính như đòn đánh thường.'
        },
        {
          key: 'skill2',
          name: 'Phán Xét Cứu Rỗi',
          type: 'active',
          cost: { aether: 15 },
          heals: { targets: 3, percentMaxHPOfCaster: 0.10 },
          description: 'Hồi phục cho ba đồng minh ngẫu nhiên, mỗi người nhận lượng HP bằng 10% Máu tối đa của Doãn Minh.'
        },
        {
          key: 'skill3',
          name: 'Cân Bằng Sinh Mệnh',
          type: 'active',
          cost: { aether: 15 },
          buffs: [{ stat: 'HP', type: 'percentBase', amount: 0.10 }],
          limitUses: 5,
          description: 'Tăng 10% Máu tối đa của bản thân dựa trên giá trị gốc khi vào trận. Có thể sử dụng tối đa 5 lần trong một trận.'
        }
      ],
      ult: {
        name: 'Cán Cân Công Lý',
        type: 'ultimate',
        tags: ['support', 'hp-redistribute'],
        targets: { allies: 3, excludeLeader: true },
        heals: { leaderPercentMaxHPOfCaster: 0.10 },
        description: 'Chọn ngẫu nhiên ba đồng minh (trừ Leader) còn sống và cân bằng lượng HP của họ về cùng một mức trung bình (không vượt quá Máu tối đa). Đồng thời hồi cho Leader 10% Máu tối đa của Doãn Minh.'
      },
      talent: {
        name: 'Thăng Bình Pháp Lực',
        type: 'talent',
        onSpawn: { teamHealPercentMaxHPOfCaster: 0.05 },
        description: 'Khi ra sân, hồi HP cho toàn bộ đồng minh trên sân bằng 5% Máu tối đa của Doãn Minh.'
      },
      technique: null,
      notes: [
        'Cân bằng HP từ tuyệt kỹ không làm mất phần máu vượt ngưỡng hiện có của các mục tiêu khác.',
        'Nội tại kích hoạt cả khi được triệu hồi lại sau khi rời sân.'
      ]
    },
    {
      unitId: 'kydieu',
      basic: {
        name: 'Đánh Thường',
        type: 'basic',
        tags: ['single-target'],
        description: 'Gây sát thương bằng n% ATK + x% WIL lên một mục tiêu.'
      },
      skills: [
        {
          key: 'skill1',
          name: 'Tế Lễ Phản Hồn',
          type: 'active',
          cost: { aether: 20 },
          duration: { turns: 3 },
          heals: { selfPercentMaxHPPerTurn: 0.08 },
          description: 'Tế lễ hồi nguyên trong 3 lượt: mỗi lượt Kỳ Diêu hồi 8% Máu tối đa của bản thân.'
        },
        {
          key: 'skill2',
          name: 'Thí Thân Hộ Chủ',
          type: 'active',
          cost: { aether: 15 },
          hpTrade: { sacrificeSelf: true },
          reviveDelay: { turns: 4, ragePercent: 0.5, hpPercent: 0.5, aether: 0 },
          buffs: [{ target: 'leader', effect: 'indomitability', stacks: 1 }],
          description: 'Hy sinh bản thân (HP về 0) để ban cho Leader 1 tầng Bất Khuất. Sau 4 lượt, Kỳ Diêu hồi sinh ngẫu nhiên trên sân với 0 Aether, 50% nộ tối đa và 50% HP tối đa; nếu sân kín cô biến mất vĩnh viễn.'
        },
        {
          key: 'skill3',
          name: 'Tế Vũ Tăng Bão',
          type: 'active',
          cost: { aether: 20 },
          duration: { turns: 4 },
          buffs: [{ stat: 'rageGain', percent: 0.50 }],
          description: 'Tăng 50% tốc độ tích nộ cho bản thân trong 4 lượt.'
        }
      ],
      ult: {
        name: 'Hoàn Hồn Mộ Tặc',
        type: 'ultimate',
        tags: ['revive'],
        revive: { targets: 1, priority: 'recent', hpPercent: 0.15, ragePercent: 0, lockSkillsTurns: 1 },
        description: 'Hồi sinh một đồng minh ngẫu nhiên (ưu tiên người vừa ngã xuống gần nhất). Khi sống lại, mục tiêu nhận tối đa 15% Máu tối đa của chính họ, nộ về 0 và bị khoá kỹ năng trong 1 lượt.'
      },
      talent: {
        name: 'Phục Tế Khôi Minh',
        type: 'talent',
        scaling: { perAction: { ARM: 0.03, RES: 0.03 }, purgeable: false },
        description: 'Mỗi lượt hành động thành công cộng vĩnh viễn +3% ARM và +3% RES. Hiệu ứng không giới hạn cộng dồn và không thể bị xoá hoặc cướp.'
      },
      technique: null,
      notes: [
        'Thí Thân Hộ Chủ có thể kết hợp với nội tại để tích phòng thủ trước khi tự hiến.',
        'Khi hồi sinh do tuyệt kỹ, đồng minh sẽ không được nhận lại Aether và phải chờ 1 lượt mới có thể dùng kỹ năng.'
      ]
    },
    {
      unitId: 'tranquat',
      basic: {
        name: 'Đánh Thường',
        type: 'basic',
        tags: ['single-target'],
        description: 'Gây sát thương bằng n% ATK + x% WIL lên một mục tiêu.'
      },
      skills: [
        {
          key: 'skill1',
          name: 'Sai Khiển Tiểu Đệ',
          type: 'active',
          cost: { aether: 15 },
          description: 'Sai khiến tối đa hai tiểu đệ hiện có tấn công một kẻ địch bằng đòn đánh thường của chúng ngay lập tức. Nếu còn ít hơn hai tiểu đệ, chỉ các đơn vị còn lại tham gia.'
        },
        {
          key: 'skill2',
          name: 'Khiên Mộc Dẫn Địch',
          type: 'active',
          cost: { aether: 20 },
          duration: { turns: 3 },
          buffs: [{ target: 'minions', effect: 'taunt' }],
          description: 'Đặt hiệu ứng Khiêu Khích lên toàn bộ tiểu đệ còn sống trên sân trong 3 lượt, buộc kẻ địch ưu tiên chúng.'
        },
        {
          key: 'skill3',
          name: 'Tăng Cường Tòng Bộc',
          type: 'active',
          cost: { aether: 20 },
          buffs: [{ target: 'futureSummons', inheritBonus: { HP: 0.20, ATK: 0.20, WIL: 0.20 } }],
          limitUses: 5,
          lockout: 'battle',
          description: 'Tăng giới hạn HP/ATK/WIL mà tiểu đệ kế thừa từ Trần Quát thêm 20%. Chỉ áp dụng cho các tiểu đệ được triệu hồi sau khi sử dụng; kỹ năng bị khoá sau 5 lần dùng.'
        }
      ],
      ult: {
        name: 'Gọi Tiểu Đệ',
        type: 'ultimate',
        tags: ['summon'],
        summon: { count: 2, placement: 'adjacentRow', inherit: { HP: 0.5, ATK: 0.5, WIL: 0.5 }, ttlTurns: 4, limit: 2, replace: 'oldest' },
        description: 'Triệu hồi 2 tiểu đệ vào các ô trống lân cận cùng hàng. Mỗi tiểu đệ kế thừa 50% HP/ATK/WIL của Trần Quát (có thể tăng thêm nhờ Tăng Cường Tòng Bộc), tồn tại tối đa 4 lượt hoặc tới khi bị tiêu diệt. Chỉ duy trì tối đa 2 tiểu đệ cùng lúc; triệu hồi mới thay thế tiểu đệ tồn tại lâu nhất. Tiểu đệ không thể hồi sinh.'
      },
      talent: {
        name: 'Đại Ca Đầu Đàn',
        type: 'talent',
        bonuses: { perMinion: { basicDamagePercent: 0.15 }, onMinionDeath: { stats: { ATK: 0.05, WIL: 0.05 }, maxStacks: 3 } },
        description: 'Mỗi tiểu đệ hiện diện trên sân giúp Trần Quát nhận thêm 15% tổng sát thương đòn đánh thường. Khi một tiểu đệ bị hạ gục, Trần Quát nhận thêm 5% ATK/WIL (tối đa 3 lần trong trận).'
      },
      technique: null,
      notes: [
        'Các tiểu đệ được gọi bằng kỹ năng vẫn tuân theo giới hạn 2 đơn vị như trong tuyệt kỹ.',
        'Khi sử dụng Sai Khiển Tiểu Đệ, nếu không còn tiểu đệ nào trên sân thì kỹ năng sẽ không gây hiệu ứng.'
      ]
    },
    {
      unitId: 'linhgac',
      basic: {
        name: 'Đánh Thường',
        type: 'basic',
        tags: ['single-target'],
        description: 'Gây sát thương bằng n% ATK + x% WIL lên một mục tiêu.'
      },
      skills: [
        {
          key: 'skill1',
          name: 'Trảm Cảnh Giới',
          type: 'active',
          cost: { aether: 20 },
          tags: ['counts-as-basic'],
          description: 'Gây sát thương bằng 150% đòn đánh thường lên một mục tiêu và được tính như đòn đánh thường.'
        },
        {
          key: 'skill2',
          name: 'Thành Lũy Tạm Thời',
          type: 'active',
          cost: { aether: 15 },
          duration: { turns: 3 },
          buffs: [{ stats: { RES: 0.20, ARM: 0.20 } }],
          description: 'Tăng 20% RES và ARM cho bản thân trong 3 lượt.'
        },
        {
          key: 'skill3',
          name: 'Kiên Cố Trường Kỳ',
          type: 'active',
          cost: { aether: 20 },
          buffs: [{ stats: { RES: 0.05, ARM: 0.05 }, type: 'permanent', thresholdBonus: { hpBelowPercent: 0.30, stats: { RES: 0.15, ARM: 0.15 } } }],
          description: 'Tăng 5% RES/ARM của bản thân cho đến hết trận. Khi HP dưới 30% Max HP, mỗi lần dùng kỹ năng này thay vì 5% sẽ tăng 15% RES/ARM.'
        }
      ],
      ult: {
        name: 'Còi Tăng Tốc',
        type: 'ultimate',
        tags: ['support', 'haste'],
        duration: { turns: 2 },
        buffs: [{ targets: 'self+2allies', stat: 'attackSpeed', percent: 0.20 }],
        bonuses: { selfBasicDamagePercent: 0.05 },
        description: 'Tăng 20% tốc đánh cho bản thân và hai đồng minh ngẫu nhiên trong 2 lượt. Trong thời gian này, đòn đánh thường của Lính Gác gây thêm 5% tổng sát thương.'
      },
      talent: {
        name: 'Cảnh Giới Bất Biến',
        type: 'talent',
        onSpawn: { stats: { AGI: 0.05, ATK: 0.05 } },
        description: 'Khi vào trận nhận ngay +5% AGI và +5% ATK. Hiệu ứng luôn hoạt động trong suốt trận đấu.'
      },
      technique: null,
      notes: [
        'Kiên Cố Trường Kỳ giúp tích lũy phòng thủ cao hơn khi Lính Gác ở ngưỡng máu nguy hiểm.',
        'Còi Tăng Tốc ưu tiên đồng minh ngẫu nhiên; hiệu ứng có thể trùng lặp với các nguồn tăng tốc khác.'
      ]
    }
  ];

  const SKILL_KEYS = ['basic', 'skill', 'skills', 'ult', 'talent', 'technique', 'notes'];

  const skillSets = rawSkillSets.reduce((acc, entry) => {
    const skills = Array.isArray(entry.skills) ? entry.skills.map(normalizeSkillEntry) : [];
    const skill = entry.skill ? normalizeSkillEntry(entry.skill) : (skills[0] ?? null);
    const normalized = {
      unitId: entry.unitId,
      basic: normalizeSection(entry.basic),
      skill,
      skills,
      ult: normalizeSection(entry.ult),
      talent: normalizeSection(entry.talent),
      technique: normalizeSection(entry.technique),
      notes: Array.isArray(entry.notes) ? [...entry.notes] : (entry.notes ? [entry.notes] : [])
    };
    deepFreeze(normalized);
    acc[entry.unitId] = normalized;
    return acc;
  }, {});

  deepFreeze(skillSets);

  exports.skillSets = skillSets;

  function getSkillSet(unitId){
    if (!unitId) return null;
    return skillSets[unitId] ?? null;
  }

  function listSkillSets(){
    return ROSTER.map(unit => skillSets[unit.id]).filter(Boolean);
  }

  function hasSkillSet(unitId){
    return unitId != null && Object.prototype.hasOwnProperty.call(skillSets, unitId);
  }

  function validateSkillSetStructure(entry){
    if (!entry || typeof entry !== 'object') return false;
    for (const key of SKILL_KEYS){
      if (!(key in entry)){
        return false;
      }
    }
    if (!entry.unitId) return false;
    if (entry.skills && !Array.isArray(entry.skills)) return false;
    return true;
  }

  exports.getSkillSet = getSkillSet;
  exports.listSkillSets = listSkillSets;
  exports.hasSkillSet = hasSkillSet;
  exports.validateSkillSetStructure = validateSkillSetStructure;
});
__define('./data/vfx_anchors/loithienanh.json', (exports, module, __require) => {
  const data = JSON.parse('{"unitId":"loithienanh","bodyAnchors":{"root":{"x":0.5,"y":0.5},"head":{"x":0.5,"y":0.86},"chest":{"x":0.5,"y":0.68},"pelvis":{"x":0.5,"y":0.44},"right_fist":{"x":0.66,"y":0.58},"left_fist":{"x":0.34,"y":0.58},"right_elbow":{"x":0.63,"y":0.66},"left_elbow":{"x":0.37,"y":0.66},"right_foot":{"x":0.6,"y":0.1},"left_foot":{"x":0.4,"y":0.1},"back_core":{"x":0.5,"y":0.64}},"vfxBindings":{"basic_combo":{"description":"Đòn đấm thường hai hit, ưu tiên tay phải sau đó tay trái.","anchors":[{"id":"right_fist","timing":"hit1","radius":0.12},{"id":"left_fist","timing":"hit2","radius":0.11}]},"loi_anh_tam_kich":{"description":"Skill1 tung ba cú đấm lôi, tái sử dụng anchor tay phải cho tia hồ quang và tay trái khi chuyển mục tiêu.","anchors":[{"id":"right_fist","timing":"arc_spawn","radius":0.14},{"id":"left_fist","timing":"follow_through","radius":0.12}]},"ngu_loi_phe_than":{"description":"Skill2 đốt máu phát lôi cầu quanh thân, xuất phát từ ngực lan ra 5 hướng.","anchors":[{"id":"chest","timing":"charge","radius":0.18},{"id":"right_fist","timing":"launch_major","radius":0.14},{"id":"left_fist","timing":"launch_minor","radius":0.13}]},"loi_the_bach_chien":{"description":"Skill3 dựng lớp bảo hộ bằng trường điện quấn quanh thân.","anchors":[{"id":"chest","timing":"shield_core","radius":0.22},{"id":"back_core","timing":"shield_back","radius":0.24}]},"huyet_hon_loi_quyet":{"description":"Tuyệt kỹ bùng nổ lôi huyết: hút năng lượng ở ngực, nổ ra trước bụng và chân.","anchors":[{"id":"chest","timing":"charge_up","radius":0.2},{"id":"root","timing":"burst_core","radius":0.26},{"id":"right_foot","timing":"ground_crack","radius":0.15},{"id":"left_foot","timing":"ground_crack","radius":0.15}]}},"ambientEffects":{"lightning_scars":{"description":"Hoa văn lôi văn chạy trên tay và ngực, phát sáng nhịp tim.","anchors":[{"id":"right_elbow","timing":"pulse","radius":0.1},{"id":"left_elbow","timing":"pulse","radius":0.1},{"id":"chest","timing":"pulse","radius":0.12}]},"thermal_noise":{"description":"Nhiễu nhiệt nhẹ trên toàn thân khi đứng yên.","anchors":[{"id":"chest","timing":"idle","radius":0.3}]},"storm_backdrop":{"description":"Hiệu ứng hậu cảnh vòng ấn lôi huyết và mây dông trong các cảnh ult.","anchors":[{"id":"back_core","timing":"ult_only","radius":0.35}]}}}');
  module.exports = data;
  module.exports.default = data;
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
    let viewportW = null;
    if (typeof window !== 'undefined'){
      const { innerWidth, visualViewport } = window;
      if (Number.isFinite(innerWidth)) viewportW = viewportW === null ? innerWidth : Math.min(viewportW, innerWidth);
      const vvWidth = visualViewport?.width;
      if (Number.isFinite(vvWidth)) viewportW = viewportW === null ? vvWidth : Math.min(viewportW, vvWidth);
    }
    if (typeof document !== 'undefined'){
      const docWidth = document.documentElement?.clientWidth;
      if (Number.isFinite(docWidth)) viewportW = viewportW === null ? docWidth : Math.min(viewportW, docWidth);
    }
    const boardMaxW = (CFG.UI?.BOARD_MAX_W) ?? 900;
    const viewportSafeW = viewportW === null ? boardMaxW + pad * 2 : viewportW;
    const availableW = Math.max(1, viewportSafeW - pad * 2);
    const w = Math.min(availableW, boardMaxW);
    const h = Math.max(
      Math.floor(w * ((CFG.UI?.BOARD_H_RATIO) ?? (3/7))),
      (CFG.UI?.BOARD_MIN_H) ?? 220
    );

    const maxDprCfg = CFG.UI?.MAX_DPR;
    const dprClamp = Number.isFinite(maxDprCfg) && maxDprCfg > 0 ? maxDprCfg : 2;
    const dprRaw = (typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio))
      ? window.devicePixelRatio
      : 1;
    const dprSafe = dprRaw > 0 ? dprRaw : 1;
    const perfCfg = CFG.PERFORMANCE || {};
    const lowPowerMode = !!perfCfg.LOW_POWER_MODE;
    const lowPowerDprCfg = perfCfg.LOW_POWER_DPR;
    const lowPowerDpr = Number.isFinite(lowPowerDprCfg) && lowPowerDprCfg > 0
      ? Math.min(dprClamp, lowPowerDprCfg)
      : 1.5;

    let dpr = Math.min(dprClamp, dprSafe);
    if (lowPowerMode){
      dpr = Math.min(dpr, lowPowerDpr);
    }

    const displayW = w;
    const displayH = h;
    const maxPixelAreaCfg = CFG.UI?.MAX_PIXEL_AREA;
    const pixelAreaLimit = Number.isFinite(maxPixelAreaCfg) && maxPixelAreaCfg > 0
      ? maxPixelAreaCfg
      : null;
    if (pixelAreaLimit){
      const cssArea = displayW * displayH;
      if (cssArea > 0){
        const maxDprByArea = Math.sqrt(pixelAreaLimit / cssArea);
        if (Number.isFinite(maxDprByArea) && maxDprByArea > 0){
          dpr = Math.min(dpr, maxDprByArea);
        }
      }
    }

    if (!Number.isFinite(dpr) || dpr <= 0){
      dpr = 1;
    }

  if (typeof window !== 'undefined'){
      const vvScale = window.visualViewport?.scale;
      if (Number.isFinite(vvScale) && vvScale > 0){
        const scaledDpr = dpr * vvScale;
        if (Number.isFinite(scaledDpr) && scaledDpr > 0){
          dpr = Math.min(dpr, scaledDpr);
        }
      }
    }

    const pixelW = Math.max(1, Math.round(displayW * dpr));
    const pixelH = Math.max(1, Math.round(displayH * dpr));
    const pixelArea = pixelW * pixelH;

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
    return { cols, rows, tile, ox, oy, w: displayW, h: displayH, pad, dpr, pixelW, pixelH, pixelArea };
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
    const C = cam || {};
    const { x, y } = _cellCenterOblique(g, cx, cy, C);
    const k      =  (C.depthScale ?? 0.94);
    // cy: 0=trên (xa), 2=dưới (gần)
    const depth  = (g.rows - 1 - cy);
    const scale  = Math.pow(k, depth);
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
      C.topScale ?? 0.80,
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

  const nameplateMetricsCache = new Map();
  let nameplateCacheFontSignature = '';

  function drawNameplate(ctx, text, x, y, r, art){
    if (!text) return;
    const layout = art?.layout || {};
    const fontSize = Math.max(11, Math.floor(r * (layout.labelFont || 0.7)));
    const padX = Math.max(8, Math.floor(fontSize * 0.6));
    const padY = Math.max(4, Math.floor(fontSize * 0.35));
    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    const font = `${fontSize}px 'Be Vietnam Pro', 'Inter', system-ui`;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (font !== nameplateCacheFontSignature){
      nameplateMetricsCache.clear();
      nameplateCacheFontSignature = font;
    }
    const key = `${fontSize}|${text}`;
    let cached = nameplateMetricsCache.get(key);
    if (!cached){
      const metrics = ctx.measureText(text);
      cached = {
        width: Math.ceil(metrics.width + padX * 2),
        height: Math.ceil(fontSize + padY * 2)
      };
      nameplateMetricsCache.set(key, cached);
    }
    const { width, height } = cached;
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
    const perfCfg = CFG?.PERFORMANCE || {};
    const normalizePreset = (value, fallback = null)=>{
      if (value === 'off' || value === 'soft' || value === 'medium') return value;
      return fallback;
    };
    const mediumThreshold = Number.isFinite(perfCfg.SHADOW_MEDIUM_THRESHOLD)
      ? perfCfg.SHADOW_MEDIUM_THRESHOLD
      : null;
    const shadowThreshold = Number.isFinite(perfCfg.SHADOW_DISABLE_THRESHOLD)
      ? perfCfg.SHADOW_DISABLE_THRESHOLD
      : null;
    const highDprCutoff = Number.isFinite(perfCfg.SHADOW_HIGH_DPR_CUTOFF)
      ? perfCfg.SHADOW_HIGH_DPR_CUTOFF
      : null;
    const gridDpr = Number.isFinite(g?.dpr) ? g.dpr : null;

    let shadowPreset = null;
    if (perfCfg.LOW_POWER_SHADOWS){
      shadowPreset = normalizePreset(perfCfg.LOW_SHADOW_PRESET, 'off');
    } else {
      if (!shadowPreset && highDprCutoff !== null && gridDpr !== null && gridDpr >= highDprCutoff){
        shadowPreset = normalizePreset(perfCfg.HIGH_DPR_SHADOW_PRESET, 'off');
      }
      if (!shadowPreset && shadowThreshold !== null && alive.length >= shadowThreshold){
        shadowPreset = normalizePreset(perfCfg.HIGH_LOAD_SHADOW_PRESET, normalizePreset(perfCfg.LOW_SHADOW_PRESET, 'off'));
      }
      if (!shadowPreset && mediumThreshold !== null && alive.length >= mediumThreshold){
        shadowPreset = normalizePreset(perfCfg.MEDIUM_SHADOW_PRESET, 'medium');
      }
    }
    const reduceShadows = !!shadowPreset;
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
        let shadowColor = shadow.color || art?.glow || art?.shadow || 'rgba(0,0,0,0.35)';
        let shadowBlur = Number.isFinite(shadow.blur) ? shadow.blur : Math.max(6, r * 0.7);
        let shadowOffsetX = Number.isFinite(shadow.offsetX) ? shadow.offsetX : 0;
        let shadowOffsetY = Number.isFinite(shadow.offsetY) ? shadow.offsetY : Math.max(2, r * 0.2);
        if (reduceShadows){
          const cheap = shadowPreset;
          if (cheap === 'soft'){ // giữ chút bóng nhẹ nhàng
            shadowColor = 'rgba(0, 0, 0, 0.18)';
            shadowBlur = Math.min(6, shadowBlur * 0.4);
            shadowOffsetX = 0;
            shadowOffsetY = Math.min(4, Math.max(1, shadowOffsetY * 0.4));
          } else if (cheap === 'medium'){
            shadowColor = 'rgba(0, 0, 0, 0.24)';
            shadowBlur = Math.min(10, Math.max(2, shadowBlur * 0.6));
            shadowOffsetX = 0;
            shadowOffsetY = Math.min(6, Math.max(1, shadowOffsetY * 0.6));
          } else {
            shadowColor = 'transparent';
            shadowBlur = 0;
            shadowOffsetX = 0;
            shadowOffsetY = 0;
          }
        }
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
  // Enemy: c=4 → 1..3 (trên→dưới), c=5 → 4..6, c=6 → 7..9
     const enemyStart = CFG.GRID_COLS - CFG.ENEMY_COLS; // 7-3=4
     const colIndex = cx - enemyStart;                   // 0..2
     return colIndex * 3 + (cy + 1);
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
     const cy = rowIndex;                               // 0..2 (trên→dưới)
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
  const SCREEN_COLLECTION = 'collection';
  const SCREEN_LINEUP = 'lineup';
  const APP_SCREEN_CLASSES = [
    `app--${SCREEN_MAIN_MENU}`,
    `app--${SCREEN_PVE}`,
    `app--${SCREEN_COLLECTION}`,
    `app--${SCREEN_LINEUP}`
  ];

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

  const SCREEN_DEFINITION_LOOKUP = Object.values(MODE_DEFINITIONS).reduce((map, definition) => {
    if (definition && definition.screenId && !map.has(definition.screenId)){
      map.set(definition.screenId, definition);
    }
    return map;
  }, new Map());

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
  let customScreenController = null;
  let customScreenId = null;
  let customScreenToken = 0;
  let collectionView = null;
  let collectionRenderToken = 0;
  let lineupView = null;
  let lineupRenderToken = 0;

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
    const name = typeof error.name === 'string' ? error.name : '';
    if (name === 'TypeError'){
      const typeErrorImportPatterns = [
        /Failed to fetch dynamically imported module/i,
        /dynamically imported module/i,
        /Importing a module script failed/i,
        /Failed to resolve module specifier/i,
        /Module script load failed/i,
        /MIME type/i
      ];
      if (typeErrorImportPatterns.some(pattern => pattern.test(message))){
        return true;
      }
    }
    if (error && error.cause && error.cause !== error && typeof error.cause === 'object'){
      if (isMissingModuleError(error.cause)){
        return true;
      }
    }
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

  function clearAppScreenClasses(){
    if (!rootElement || !rootElement.classList) return;
    APP_SCREEN_CLASSES.forEach(cls => rootElement.classList.remove(cls));
  }

  function destroyCustomScreen(force = false){
    const hasActiveScreen = !!(customScreenController || customScreenId);
    if (!force && !hasActiveScreen){
      return;
    }
    if (customScreenController && typeof customScreenController.destroy === 'function'){
      try {
        customScreenController.destroy();
      } catch (err) {
        console.error('[screen] cleanup error', err);
      }
    }
    customScreenController = null;
    customScreenId = null;
    if (!rootElement) return;
    if (rootElement.classList){
      APP_SCREEN_CLASSES.forEach(cls => rootElement.classList.remove(cls));
    }
    if (typeof rootElement.innerHTML === 'string'){
      rootElement.innerHTML = '';
    }
  }

  function destroyCollectionView(){
    if (collectionView && typeof collectionView.destroy === 'function'){
      try {
        collectionView.destroy();
      } catch (err) {
        console.error('[collection] cleanup error', err);
      }
    }
    collectionView = null;
  }

  function destroyLineupView(){
    if (lineupView && typeof lineupView.destroy === 'function'){
      try {
        lineupView.destroy();
      } catch (err) {
        console.error('[lineup] cleanup error', err);
      }
    }
    lineupView = null;
  }

  function cloneParamValue(value){
    if (!value || typeof value !== 'object'){
      return value;
    }
    if (Array.isArray(value)){
      return [...value];
    }
  return { ...value };
  }

  function mergeDefinitionParams(definition, params){
    const baseValue = typeof definition?.params !== 'undefined'
      ? cloneParamValue(definition.params)
      : undefined;
    const incomingValue = typeof params !== 'undefined'
      ? cloneParamValue(params)
      : undefined;
    const baseIsObject = baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue);
    const incomingIsObject = incomingValue && typeof incomingValue === 'object' && !Array.isArray(incomingValue);

    if (baseIsObject || incomingIsObject){
      return {
        ...(baseIsObject ? baseValue : {}),
        ...(incomingIsObject ? incomingValue : {})
      };
    }

    if (typeof incomingValue !== 'undefined'){
      return incomingValue;
    }

    if (typeof baseValue !== 'undefined'){
      return baseValue;
    }

    return null;
  }

  function resolveScreenRenderer(module){
    if (!module) return null;
    if (typeof module.renderCollectionScreen === 'function') return module.renderCollectionScreen;
    if (typeof module.renderScreen === 'function') return module.renderScreen;
    if (typeof module.default === 'function') return module.default;
    if (module.default){
      if (typeof module.default.renderCollectionScreen === 'function') return module.default.renderCollectionScreen;
      if (typeof module.default.renderScreen === 'function') return module.default.renderScreen;
    }
    return null;
  }

  function getDefinitionByScreen(screenId){
    return SCREEN_DEFINITION_LOOKUP.get(screenId) || null;
  }

  async function mountModeScreen(screenId, params){
    const token = ++customScreenToken;
    destroyCustomScreen(true);
    dismissModal();
    if (!rootElement || !shellInstance) return;

    const definition = getDefinitionByScreen(screenId);
    if (!definition){
      console.warn(`[screen] Không tìm thấy định nghĩa cho màn hình ${screenId}.`);
      shellInstance.enterScreen(SCREEN_MAIN_MENU);
      return;
    }

    const mergedParams = mergeDefinitionParams(definition, params);
    
    clearAppScreenClasses();
    if (rootElement.classList){
      rootElement.classList.add(`app--${screenId}`);
    }
    if (typeof rootElement.innerHTML === 'string'){
      const label = definition.label || 'màn hình';
      rootElement.innerHTML = `<div class="app-loading">Đang tải ${label}...</div>`;
    }

    let module;
    try {
      module = await definition.loader();
    } catch (error) {
      if (token !== customScreenToken) return;
      if (isMissingModuleError(error)){
        showComingSoonModal(definition.label);
        shellInstance.enterScreen(SCREEN_MAIN_MENU);
        return;
      }
      throw error;
    }

    if (token !== customScreenToken) return;

    if (isComingSoonModule(module)){
      showComingSoonModal(definition.label);
      shellInstance.enterScreen(SCREEN_MAIN_MENU);
      return;
    }

    const renderer = resolveScreenRenderer(module);
    if (typeof renderer !== 'function'){
      throw new Error(`Module màn hình ${screenId} không cung cấp hàm render hợp lệ.`);
    }

    if (typeof rootElement.innerHTML === 'string'){
      rootElement.innerHTML = '';
    }

    const controller = renderer({
      root: rootElement,
      shell: shellInstance,
      definition,
      params: mergedParams,
      screenId
    }) || null;

    customScreenController = controller;
    customScreenId = screenId;
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

  async function renderCollectionScreen(params){
    if (!rootElement || !shellInstance) return;
    const token = ++collectionRenderToken;
    dismissModal();
    clearAppScreenClasses();
    destroyCollectionView();
    lineupRenderToken += 1;
    destroyLineupView();
    if (rootElement.classList){
      rootElement.classList.add('app--collection');
    }
    if (typeof rootElement.innerHTML === 'string'){
      rootElement.innerHTML = '<div class="app-loading">Đang tải bộ sưu tập...</div>';
    }

    let module;
    try {
      module = await loadBundledModule('./screens/collection/index.js');
    } catch (error) {
      if (token !== collectionRenderToken) return;
      throw error;
    }

    if (token !== collectionRenderToken) return;

    const render = module?.renderCollectionScreen || module?.default?.renderCollectionScreen;
    if (typeof render !== 'function'){
      throw new Error('Module bộ sưu tập không cung cấp hàm render hợp lệ.');
    }

    const definition = getDefinitionByScreen(SCREEN_COLLECTION);
    collectionView = render({
      root: rootElement,
      shell: shellInstance,
      definition,
      params: params || null
    }) || null;
  }

  async function renderLineupScreen(params){
    if (!rootElement || !shellInstance) return;
    const token = ++lineupRenderToken;
    dismissModal();
    clearAppScreenClasses();
    destroyLineupView();
    collectionRenderToken += 1;
    destroyCollectionView();
    if (rootElement.classList){
      rootElement.classList.add('app--lineup');
    }
    if (typeof rootElement.innerHTML === 'string'){
      rootElement.innerHTML = '<div class="app-loading">Đang tải đội hình...</div>';
    }

    let module;
    try {
      module = await loadBundledModule('./screens/lineup/index.js');
    } catch (error) {
      if (token !== lineupRenderToken) return;
      throw error;
    }

    if (token !== lineupRenderToken) return;

    const render = module?.renderLineupScreen || module?.default?.renderLineupScreen;
    if (typeof render !== 'function'){
      throw new Error('Module đội hình không cung cấp hàm render hợp lệ.');
    }

    const definition = getDefinitionByScreen(SCREEN_LINEUP);
    lineupView = render({
      root: rootElement,
      shell: shellInstance,
      definition,
      params: params || null
    }) || null;
  }

  function renderMainMenuScreen(){
    if (!rootElement || !shellInstance) return;
    dismissModal();
    clearAppScreenClasses();
    if (rootElement.classList){
      rootElement.classList.add('app--main-menu');
    }

  lineupRenderToken += 1;
    destroyLineupView();

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
    clearAppScreenClasses();
    if (rootElement.classList){
      rootElement.classList.add('app--pve');
    }
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
    const extractStartConfig = (source) => {
      if (!source || typeof source !== 'object') return null;
      const payload = source.sessionConfig && typeof source.sessionConfig === 'object'
        ? source.sessionConfig
        : source;
      return { ...payload };
    };
    teardownActiveSession();
    const modeKey = params?.modeKey && MODE_DEFINITIONS[params.modeKey] ? params.modeKey : 'campaign';
    const definition = MODE_DEFINITIONS[modeKey] || MODE_DEFINITIONS.campaign;
    const rawParams = (params && typeof params === 'object') ? params : {};
    const defaultParams = (definition?.params && typeof definition.params === 'object') ? definition.params : {};
    const mergedParams = { ...defaultParams, ...rawParams };
    const definitionConfig = extractStartConfig(definition?.params);
    const incomingConfig = extractStartConfig(params);
    const mergedStartConfig = {
      ...(definitionConfig || {}),
      ...(incomingConfig || {})
    };
    const hasSessionConfig = Object.prototype.hasOwnProperty.call(mergedParams, 'sessionConfig');
    const sessionConfigValue = hasSessionConfig && mergedParams.sessionConfig && typeof mergedParams.sessionConfig === 'object'
      ? { ...mergedParams.sessionConfig }
      : mergedParams.sessionConfig;
      const hasSessionConfigObject = hasSessionConfig && sessionConfigValue && typeof sessionConfigValue === 'object';
    const { sessionConfig: _ignoredSessionConfig, ...restMergedParams } = mergedParams;
    const createSessionOptions = {
      ...restMergedParams,
      ...mergedStartConfig,
      ...(hasSessionConfig ? {
        sessionConfig: hasSessionConfigObject ? { ...sessionConfigValue } : sessionConfigValue
      } : {})
    };
    const startSessionOptions = {
      ...restMergedParams,
      ...mergedStartConfig
    };
    if (rootElement){
      clearAppScreenClasses();
      if (rootElement.classList){
        rootElement.classList.add('app--pve');
      }
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
    const session = createPveSession(container, createSessionOptions);
    shellInstance.setActiveSession(session);
    if (typeof session.start === 'function'){
      const scheduleRetry = (callback) => {
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'){
          window.requestAnimationFrame(callback);
        } else {
          setTimeout(callback, 0);
        }
      };
      const MAX_BOARD_RETRIES = 30;
      const startSessionSafely = () => {
        if (token !== pveRenderToken) return;
        const startConfig = { ...startSessionOptions, root: container };
        try {
          const result = session.start(startConfig);
          if (!result){
            handleMissingBoard();
          }
        } catch (err) {
          shellInstance.setActiveSession(null);
          throw err;
        }
      };
      const handleMissingBoard = () => {
        if (typeof window !== 'undefined' && typeof window.alert === 'function'){
          window.alert('Không thể tải bàn chơi PvE. Đang quay lại menu chính.');
        } else {
          console.warn('Không thể tải bàn chơi PvE. Đang quay lại menu chính.');
        }
        shellInstance.setActiveSession(null);
        shellInstance.enterScreen(SCREEN_MAIN_MENU);
      };
      const attemptStart = (attempt = 0) => {
        if (token !== pveRenderToken) return;
        const boardElement = container.querySelector('#board');
        if (boardElement){
          startSessionSafely();
          return;
        }
        if (attempt >= MAX_BOARD_RETRIES){
          handleMissingBoard();
          return;
        }
        scheduleRetry(() => attemptStart(attempt + 1));
      };
      const initialBoard = container.querySelector('#board');
      if (initialBoard){
        startSessionSafely();
      } else {
        attemptStart();
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
      renderMessageRef = renderMessage;
      const handleShellError = (error) => {
        console.error('Arclune shell listener error', error);
        const renderer = renderMessageRef || renderMessage;
        if (renderer){
          showFatalError(error, renderer, bootstrapOptions);
        }
      };
      shellInstance = createAppShell({ onError: handleShellError });
      bootstrapOptions.isFileProtocol = isFileProtocol;
      let lastScreen = null;
      let lastParams = null;

      shellInstance.onChange(state => {
        const nextScreen = state.screen;
        const nextParams = state.screenParams;
        const screenChanged = nextScreen !== lastScreen;
        const paramsChanged = nextParams !== lastParams;

        if (!screenChanged && !paramsChanged){
          return;
        }

        if (nextScreen === SCREEN_MAIN_MENU){
          customScreenToken += 1;
          destroyCustomScreen();
          collectionRenderToken += 1;
          destroyCollectionView();
          lineupRenderToken += 1;
          destroyLineupView();
          lastScreen = SCREEN_MAIN_MENU;
          lastParams = nextParams;
          pveRenderToken += 1;
          renderMainMenuScreen();
          return;
        }

        if (nextScreen === SCREEN_COLLECTION){
          customScreenToken += 1;
          destroyCustomScreen();
          collectionRenderToken += 1;
          destroyCollectionView();
          lineupRenderToken += 1;
          destroyLineupView();
          if (mainMenuView && typeof mainMenuView.destroy === 'function'){
            mainMenuView.destroy();
            mainMenuView = null;
          }
          lastScreen = SCREEN_COLLECTION;
          lastParams = nextParams;
          pveRenderToken += 1;
          renderCollectionScreen(nextParams || null).catch(error => {
            console.error('Arclune failed to load collection screen', error);
            if (renderMessageRef){
              showFatalError(error, renderMessageRef, bootstrapOptions);
            }
          });
          return;
        }

  if (nextScreen === SCREEN_LINEUP){
          customScreenToken += 1;
          destroyCustomScreen();
          collectionRenderToken += 1;
          destroyCollectionView();
          lineupRenderToken += 1;
          destroyLineupView();
          if (mainMenuView && typeof mainMenuView.destroy === 'function'){
            mainMenuView.destroy();
            mainMenuView = null;
          }
          lastScreen = SCREEN_LINEUP;
          lastParams = nextParams;
          pveRenderToken += 1;
          renderLineupScreen(nextParams || null).catch(error => {
            console.error('Arclune failed to load lineup screen', error);
            if (renderMessageRef){
              showFatalError(error, renderMessageRef, bootstrapOptions);
            }
          });
          return;
        }

        if (nextScreen === SCREEN_PVE){
          customScreenToken += 1;
          destroyCustomScreen();
          collectionRenderToken += 1;
          destroyCollectionView();
          lineupRenderToken += 1;
          destroyLineupView();
          if (mainMenuView && typeof mainMenuView.destroy === 'function'){
            mainMenuView.destroy();
            mainMenuView = null;
          }
          lastScreen = SCREEN_PVE;
          lastParams = nextParams;
          mountPveScreen(nextParams || {}).catch(error => {
            console.error('Arclune failed to start PvE session', error);
            if (renderMessageRef){
              showFatalError(error, renderMessageRef, bootstrapOptions);
            }
          });
          return;
        }

        if (mainMenuView && typeof mainMenuView.destroy === 'function'){
          mainMenuView.destroy();
          mainMenuView = null;
        }

        collectionRenderToken += 1;
        destroyCollectionView();
        lineupRenderToken += 1;
        destroyLineupView();

        lastScreen = nextScreen;
        lastParams = nextParams;
        mountModeScreen(nextScreen, nextParams || null).catch(error => {
          console.error(`Arclune failed to load screen ${nextScreen}`, error);
          if (renderMessageRef){
            showFatalError(error, renderMessageRef, bootstrapOptions);
          }
        });
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
  const TURN_REGEN = 'turn:regen';

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
  exports.TURN_REGEN = TURN_REGEN;
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
    const startConfig = { ...initialConfig, root: rootTarget };
    const session = currentSession.start(startConfig);
    if (!session){
      throw new Error('PvE board markup not found; render the layout before calling startGame');
    }
    return session;
  }

  function stopGame(){
    if (!currentSession) return;
    currentSession.stop();
    currentSession = null;
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
  exports.TURN_REGEN = __reexport0.TURN_REGEN;
  exports.startGame = startGame;
  exports.stopGame = stopGame;
  exports.updateGameConfig = updateGameConfig;
  exports.getCurrentSession = getCurrentSession;
  exports.setUnitSkin = setUnitSkin;
  exports.onGameEvent = onGameEvent;
});
__define('./meta.js', (exports, module, __require) => {
  //v0.8
  // meta.js — gom lookup + stat khởi tạo + nộ khởi điểm
  const __dep0 = __require('./catalog.js');
  const CLASS_BASE = __dep0.CLASS_BASE;
  const getMetaById = __dep0.getMetaById;
  const applyRankAndMods = __dep0.applyRankAndMods;
  const __dep1 = __require('./utils/kit.js');
  const kitSupportsSummon = __dep1.kitSupportsSummon;
  const extractOnSpawnRage = __dep1.extractOnSpawnRage;

  // Dùng trực tiếp catalog cho tra cứu
  const Meta = {
    get: getMetaById,
    classOf(id){ return (this.get(id)?.class) ?? null; },
    rankOf(id){  return (this.get(id)?.rank)  ?? null; },
    kit(id){     return (this.get(id)?.kit)   ?? null; },
    isSummoner(id){
      const m = this.get(id);
      return !!(m && m.class === 'Summoner' && kitSupportsSummon(m));
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
      aeMax: fin.AEmax|0, ae: 0, aeRegen: fin.AEregen||0, hpRegen: fin.HPregen||0
    };
  }

  // Nộ khi vào sân (trừ leader). Revive: theo spec của skill.
  function initialRageFor(unitId, opts = {}){
    const onSpawn = Meta.kit(unitId)?.onSpawn;
    if (!onSpawn) return 0;
    if (onSpawn.exceptLeader && opts.isLeader) {
      const leaderSpecific = extractOnSpawnRage(onSpawn, { ...opts, isLeader: true });
      return Math.max(0, leaderSpecific ?? 0);
    }
    const amount = extractOnSpawnRage(onSpawn, opts);
    if (amount != null) return Math.max(0, amount);
    if (opts.revive) return Math.max(0, (opts.reviveSpec?.rage) ?? 0);
    return 0;
  }

  exports.Meta = Meta;
  exports.makeInstanceStats = makeInstanceStats;
  exports.initialRageFor = initialRageFor;
});
__define('./modes/coming-soon.stub.js', (exports, module, __require) => {
  const comingSoon = true;

  const __defaultExport = {
    comingSoon
  };
  exports.comingSoon = comingSoon;
  exports.default = __defaultExport;
  module.exports.default = exports.default;
});
__define('./modes/pve/session.js', (exports, module, __require) => {
  //v0.7.6
  const __dep1 = __require('./turns.js');
  const stepTurn = __dep1.stepTurn;
  const doActionOrSkip = __dep1.doActionOrSkip;
  const predictSpawnCycle = __dep1.predictSpawnCycle;
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
  const __dep9 = __require('./utils/fury.js');
  const initializeFury = __dep9.initializeFury;
  const setFury = __dep9.setFury;
  const spendFury = __dep9.spendFury;
  const resolveUltCost = __dep9.resolveUltCost;
  const gainFury = __dep9.gainFury;
  const finishFuryHit = __dep9.finishFuryHit;
  const __dep10 = __require('./catalog.js');
  const ROSTER = __dep10.ROSTER;
  const ROSTER_MAP = __dep10.ROSTER_MAP;
  const CLASS_BASE = __dep10.CLASS_BASE;
  const RANK_MULT = __dep10.RANK_MULT;
  const getMetaById = __dep10.getMetaById;
  const isSummoner = __dep10.isSummoner;
  const applyRankAndMods = __dep10.applyRankAndMods;
  const __dep11 = __require('./engine.js');
  const makeGrid = __dep11.makeGrid;
  const drawGridOblique = __dep11.drawGridOblique;
  const drawTokensOblique = __dep11.drawTokensOblique;
  const drawQueuedOblique = __dep11.drawQueuedOblique;
  const hitToCellOblique = __dep11.hitToCellOblique;
  const projectCellOblique = __dep11.projectCellOblique;
  const cellOccupied = __dep11.cellOccupied;
  const spawnLeaders = __dep11.spawnLeaders;
  const pickRandom = __dep11.pickRandom;
  const slotIndex = __dep11.slotIndex;
  const slotToCell = __dep11.slotToCell;
  const cellReserved = __dep11.cellReserved;
  const ORDER_ENEMY = __dep11.ORDER_ENEMY;
  const ART_SPRITE_EVENT = __dep11.ART_SPRITE_EVENT;
  const __dep12 = __require('./background.js');
  const drawEnvironmentProps = __dep12.drawEnvironmentProps;
  const getEnvironmentBackground = __dep12.getEnvironmentBackground;
  const __dep13 = __require('./art.js');
  const getUnitArt = __dep13.getUnitArt;
  const setUnitSkin = __dep13.setUnitSkin;
  const __dep14 = __require('./ui.js');
  const initHUD = __dep14.initHUD;
  const startSummonBar = __dep14.startSummonBar;
  const __dep15 = __require('./vfx.js');
  const vfxDraw = __dep15.vfxDraw;
  const vfxAddSpawn = __dep15.vfxAddSpawn;
  const vfxAddHit = __dep15.vfxAddHit;
  const vfxAddMelee = __dep15.vfxAddMelee;
  const vfxAddLightningArc = __dep15.vfxAddLightningArc;
  const vfxAddBloodPulse = __dep15.vfxAddBloodPulse;
  const vfxAddGroundBurst = __dep15.vfxAddGroundBurst;
  const vfxAddShieldWrap = __dep15.vfxAddShieldWrap;
  const __dep16 = __require('./scene.js');
  const drawBattlefieldScene = __dep16.drawBattlefieldScene;
  const getCachedBattlefieldScene = __dep16.getCachedBattlefieldScene;
  const __dep17 = __require('./events.js');
  const gameEvents = __dep17.gameEvents;
  const TURN_START = __dep17.TURN_START;
  const TURN_END = __dep17.TURN_END;
  const ACTION_START = __dep17.ACTION_START;
  const ACTION_END = __dep17.ACTION_END;
  const __dep18 = __require('./utils/dummy.js');
  const ensureNestedModuleSupport = __dep18.ensureNestedModuleSupport;
  const __dep19 = __require('./utils/time.js');
  const safeNow = __dep19.safeNow;
  const __dep20 = __require('./utils/kit.js');
  const getSummonSpec = __dep20.getSummonSpec;
  const resolveSummonSlots = __dep20.resolveSummonSlots;
  /** @type {HTMLCanvasElement|null} */ let canvas = null;
  /** @type {CanvasRenderingContext2D|null} */ let ctx = null;
  /** @type {{update:(g:any)=>void, cleanup?:()=>void}|null} */ let hud = null;   // ← THÊM
  /** @type {(() => void)|null} */ let hudCleanup = null;
  const CAM_PRESET = CAM[CFG.CAMERA] || CAM.landscape_oblique;
  const HAND_SIZE  = CFG.HAND_SIZE ?? 4;

  ensureNestedModuleSupport();

  const getNow = () => safeNow();

  // --- Instance counters (để gắn id cho token/minion) ---
  let _IID = 1;
  let _BORN = 1;
  const nextIid = ()=> _IID++;

  let Game = null;
  let tickLoopHandle = null;
  let tickLoopUsesTimeout = false;
  let resizeHandler = null;
  let visualViewportResizeHandler = null;
  let visualViewportScrollHandler = null;
  let resizeSchedulerHandle = null;
  let resizeSchedulerUsesTimeout = false;
  let pendingResize = false;
  let canvasClickHandler = null;
  let artSpriteHandler = null;
  let visibilityHandlerBound = false;
  let winRef = null;
  let docRef = null;
  let rootElement = null;
  let storedConfig = {};
  let running = false;
  let sceneCache = null;
  const hpBarGradientCache = new Map();
  const backgroundSignatureCache = new Map();

  function stableStringify(value, seen = new WeakSet()){
    if (value === null) return 'null';
    const type = typeof value;
    if (type === 'undefined') return 'undefined';
    if (type === 'number' || type === 'boolean' || type === 'bigint') return String(value);
    if (type === 'string') return JSON.stringify(value);
    if (type === 'symbol') return value.toString();
    if (type === 'function') return `[Function:${value.name || 'anonymous'}]`;
    if (Array.isArray(value)){
      return `[${value.map(entry => stableStringify(entry, seen)).join(',')}]`;
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

  function normalizeBackgroundCacheKey(backgroundKey){
    return `key:${backgroundKey ?? '__no-key__'}`;
  }

  function clearBackgroundSignatureCache(){
    backgroundSignatureCache.clear();
  }

  function computeBackgroundSignature(backgroundKey){
    const cacheKey = normalizeBackgroundCacheKey(backgroundKey);
    const config = getEnvironmentBackground(backgroundKey);
    if (!config){
      backgroundSignatureCache.delete(cacheKey);
      return `${backgroundKey || 'no-key'}:no-config`;
    }
    const cached = backgroundSignatureCache.get(cacheKey);
    if (cached && cached.config === config){
      return cached.signature;
    }
    let signature;
    try {
      signature = `${backgroundKey || 'no-key'}:${stableStringify(config)}`;
    } catch (_) {
      const keyPart = config?.key ?? '';
      const themePart = config?.theme ?? '';
      const propsLength = Array.isArray(config?.props) ? config.props.length : 0;
      signature = `${backgroundKey || 'no-key'}:fallback:${String(keyPart)}:${String(themePart)}:${propsLength}`;
    }
    backgroundSignatureCache.set(cacheKey, { config, signature });
    return signature;
  }

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

  function buildTurnOrder(){
    const cfg = CFG.turnOrder || {};
    const rawSides = Array.isArray(cfg.sides) ? cfg.sides : null;
    const sides = (rawSides && rawSides.length) ? rawSides.filter(s => s === 'ally' || s === 'enemy') : ['ally', 'enemy'];
    const order = [];
    const addPair = (side, slot)=>{
      if (side !== 'ally' && side !== 'enemy') return;
      const num = Number(slot);
      if (!Number.isFinite(num)) return;
      const safeSlot = Math.max(1, Math.min(9, Math.round(num)));
      order.push({ side, slot: safeSlot });
    };
    const appendSlots = (slot)=>{
      for (const side of sides){
        addPair(side, slot);
      }
    };

    const scan = Array.isArray(cfg.pairScan) ? cfg.pairScan : null;
    if (scan && scan.length){
      for (const entry of scan){
        if (typeof entry === 'number'){
          appendSlots(entry);
          continue;
        }
        if (Array.isArray(entry)){
          if (entry.length === 2 && typeof entry[0] === 'string' && Number.isFinite(entry[1])){
            addPair(entry[0] === 'enemy' ? 'enemy' : 'ally', entry[1]);
          } else {
            for (const val of entry){
              if (typeof val === 'number') appendSlots(val);
            }
          }
          continue;
        }
        if (entry && typeof entry === 'object'){
          const slot = Number(entry.slot ?? entry.s ?? entry.index);
          if (typeof entry.side === 'string' && Number.isFinite(slot)){
            addPair(entry.side === 'enemy' ? 'enemy' : 'ally', slot);
          } else if (Number.isFinite(slot)){
            appendSlots(slot);
          }
        }
      }
    }

    if (!order.length){
      const fallback = [1,2,3,4,5,6,7,8,9];
      for (const slot of fallback) appendSlots(slot);
    }

    const indexMap = new Map();
    order.forEach((entry, idx)=>{
      const key = `${entry.side}:${entry.slot}`;
      if (!indexMap.has(key)) indexMap.set(key, idx);
    });

    return { order, indexMap };
  }

  function createGameState(options = {}){
    options = normalizeConfig(options);
    const modeKey = typeof options.modeKey === 'string' ? options.modeKey : null;
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

  const requestedTurnMode = options.turnMode
      ?? options.turn?.mode
      ?? options.turnOrderMode
      ?? options.turnOrder?.mode
      ?? CFG?.turnOrder?.mode;
    const useInterleaved = requestedTurnMode === 'interleaved_by_position';
    const allyCols = Number.isFinite(CFG?.ALLY_COLS) ? Math.max(1, Math.floor(CFG.ALLY_COLS)) : 3;
    const gridRows = Number.isFinite(CFG?.GRID_ROWS) ? Math.max(1, Math.floor(CFG.GRID_ROWS)) : 3;
    const slotsPerSide = Math.max(1, allyCols * gridRows);

    const buildTurnState = () => {
      if (useInterleaved){
        return {
          mode: 'interleaved_by_position',
          nextSide: 'ALLY',
          lastPos: { ALLY: 0, ENEMY: 0 },
          wrapCount: { ALLY: 0, ENEMY: 0 },
          turnCount: 0,
          slotCount: slotsPerSide,
          cycle: 0,
          busyUntil: 0
        };
      }
      const { order, indexMap } = buildTurnOrder();
      return { order, orderIndex: indexMap, cursor: 0, cycle: 0, busyUntil: 0 };
    };

    const game = {
      modeKey,
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
      turn: buildTurnState(),
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
        orderIndex: detail.orderIndex ?? null,
        orderLength: detail.orderLength ?? null,
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
  let drawFrameUsesTimeout = false;
  let drawPending = false;
  let drawPaused = false;

  function cancelScheduledDraw(){
    if (drawFrameHandle !== null){
      if (drawFrameUsesTimeout){
        clearTimeout(drawFrameHandle);
      } else {
        const cancel = (winRef && typeof winRef.cancelAnimationFrame === 'function')
          ? winRef.cancelAnimationFrame.bind(winRef)
          : (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : null);
        if (typeof cancel === 'function'){
          cancel(drawFrameHandle);
        }
      }
      drawFrameHandle = null;
      drawFrameUsesTimeout = false;
    }
    drawPending = false;
  }

  function scheduleDraw(){
    if (drawPaused) return;
    if (drawPending) return;
    if (!canvas || !ctx) return;
    drawPending = true;
    const raf = (winRef && typeof winRef.requestAnimationFrame === 'function')
      ? winRef.requestAnimationFrame.bind(winRef)
      : (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null);
    if (raf){
      drawFrameUsesTimeout = false;
      drawFrameHandle = raf(()=>{
        drawFrameHandle = null;
        drawFrameUsesTimeout = false;
        drawPending = false;
        if (drawPaused) return;
        try {
          draw();
        } catch (err) {
          console.error('[draw]', err);
        }
        if (Game?.vfx && Game.vfx.length) scheduleDraw();
      });
    } else {
      drawFrameUsesTimeout = true;
      drawFrameHandle = setTimeout(()=>{
        drawFrameHandle = null;
        drawFrameUsesTimeout = false;
        drawPending = false;
        if (drawPaused) return;
        try {
          draw();
        } catch (err) {
          console.error('[draw]', err);
        }
        if (Game?.vfx && Game.vfx.length) scheduleDraw();
      }, 16);
    }
  }

  function cancelScheduledResize(){
    if (resizeSchedulerHandle !== null){
      if (resizeSchedulerUsesTimeout){
        clearTimeout(resizeSchedulerHandle);
      } else {
        const cancel = (winRef && typeof winRef.cancelAnimationFrame === 'function')
          ? winRef.cancelAnimationFrame.bind(winRef)
          : (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : null);
        if (typeof cancel === 'function'){
          cancel(resizeSchedulerHandle);
        }
      }
      resizeSchedulerHandle = null;
      resizeSchedulerUsesTimeout = false;
    }
    pendingResize = false;
  }

  function flushScheduledResize(){
    resizeSchedulerHandle = null;
    resizeSchedulerUsesTimeout = false;
    pendingResize = false;
    try {
      resize();
      if (hud && typeof hud.update === 'function'){
        hud.update(Game);
      }
      scheduleDraw();
    } catch (err) {
      console.error('[resize]', err);
    }
  }

  function scheduleResize(){
    if (pendingResize) return;
    pendingResize = true;
    const raf = (winRef && typeof winRef.requestAnimationFrame === 'function')
      ? winRef.requestAnimationFrame.bind(winRef)
      : (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null);
    if (raf){
      resizeSchedulerUsesTimeout = false;
      resizeSchedulerHandle = raf(flushScheduledResize);
    } else {
      resizeSchedulerUsesTimeout = true;
      resizeSchedulerHandle = setTimeout(flushScheduledResize, 32);
    }
  }

  function invalidateSceneCache(){
    sceneCache = null;
    clearBackgroundSignatureCache();
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
    const backgroundSignature = computeBackgroundSignature(backgroundKey);
    const dpr = Number.isFinite(grid.dpr) && grid.dpr > 0 ? grid.dpr : 1;
    const cssWidth = grid.w ?? (canvas ? canvas.width / dpr : 0);
    const cssHeight = grid.h ?? (canvas ? canvas.height / dpr : 0);
    if (!cssWidth || !cssHeight) return null;
    const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
    const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));

    const baseScene = getCachedBattlefieldScene(grid, theme, { width: cssWidth, height: cssHeight, dpr });
    const baseKey = baseScene?.cacheKey;
    if (!baseScene){
      sceneCache = null;
      return null;
    }
    
    let needsRebuild = false;
    if (!sceneCache) needsRebuild = true;
    else if (sceneCache.pixelWidth !== pixelWidth || sceneCache.pixelHeight !== pixelHeight) needsRebuild = true;
    else if (sceneCache.themeKey !== themeKey || sceneCache.backgroundKey !== backgroundKey) needsRebuild = true;
    else if (sceneCache.backgroundSignature !== backgroundSignature) needsRebuild = true;
    else if (sceneCache.dpr !== dpr) needsRebuild = true;
    else if (sceneCache.baseKey !== baseKey) needsRebuild = true;

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
    
    try {
      cacheCtx.drawImage(baseScene.canvas, 0, 0);
    } catch (err) {
      console.error('[scene-cache:base]', err);
      return null;
    }
    
    if (typeof cacheCtx.setTransform === 'function'){
      cacheCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    } else if (dpr !== 1 && typeof cacheCtx.scale === 'function'){
      cacheCtx.scale(dpr, dpr);
    }

    try {
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
      backgroundSignature,
      dpr, baseKey
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
    const now = getNow();
    return {
      startMs: now,
      lastTimerRemain: 240,
      lastCostCreditedSec: 0,
      turnEveryMs: CFG?.ANIMATION?.turnIntervalMs ?? 600,
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

  // LẤY TỪ INSTANCE đang đứng trên sân (đúng spec: thừa hưởng % chỉ số hiện tại của chủ)
  function creepStatsFromInherit(masterUnit, inherit){
    if (!inherit || typeof inherit !== 'object') return {};
    const hpMax = Math.round((masterUnit?.hpMax || 0) * ((inherit.HP ?? inherit.hp ?? inherit.HPMax ?? inherit.hpMax) || 0));
    const atk   = Math.round((masterUnit?.atk   || 0) * ((inherit.ATK ?? inherit.atk) || 0));
    const wil   = Math.round((masterUnit?.wil   || 0) * ((inherit.WIL ?? inherit.wil) || 0));
    const res   = Math.round((masterUnit?.res   || 0) * ((inherit.RES ?? inherit.res) || 0));
    const arm   = Math.round((masterUnit?.arm   || 0) * ((inherit.ARM ?? inherit.arm) || 0) * 100) / 100;
    const stats = {};
    if (hpMax > 0){ stats.hpMax = hpMax; stats.hp = hpMax; }
    if (atk > 0) stats.atk = atk;
    if (wil > 0) stats.wil = wil;
    if (res > 0) stats.res = res;
    if (arm > 0) stats.arm = Math.max(0, Math.min(1, arm));
    return stats;
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
    const now = getNow();
    const prev = Number.isFinite(Game.turn.busyUntil) ? Game.turn.busyUntil : now;
    const dur = Math.max(0, duration|0);
    Game.turn.busyUntil = Math.max(prev, now + dur);
  }

  // Thực thi Ult: Summoner -> Immediate Summon theo meta; class khác: trừ nộ
  function performUlt(unit){
    const meta = Game.meta.get(unit.id);
    if (!meta) { setFury(unit, 0); return; }

    const slot = slotIndex(unit.side, unit.cx, unit.cy);

  const summonSpec = meta.class === 'Summoner' ? getSummonSpec(meta) : null;
    if (meta.class === 'Summoner' && summonSpec){
      const aliveNow = tokensAlive();
      const patternSlots = resolveSummonSlots(summonSpec, slot)
        .filter(Boolean)
        .filter(s => {
          const { cx, cy } = slotToCell(unit.side, s);
          return !cellReserved(aliveNow, Game.queued, cx, cy);
        })
        .sort((a, b) => a - b);

      const countRaw = Number(summonSpec.count);
      const desired = Number.isFinite(countRaw) ? countRaw : (patternSlots.length || 1);
      const need = Math.min(patternSlots.length, Math.max(0, desired));

      if (need > 0){
        const limit = Number.isFinite(summonSpec.limit) ? summonSpec.limit : Infinity;
        const have  = getMinionsOf(unit.iid).length;
        const over  = Math.max(0, have + need - limit);
        const replacePolicy = typeof summonSpec.replace === 'string' ? summonSpec.replace.trim().toLowerCase() : null;
        if (over > 0 && replacePolicy === 'oldest') removeOldestMinions(unit.iid, over);

        const inheritStats = creepStatsFromInherit(unit, summonSpec.inherit);
        const ttl = Number.isFinite(summonSpec.ttlTurns)
          ? summonSpec.ttlTurns
          : (Number.isFinite(summonSpec.ttl) ? summonSpec.ttl : null);

        for (let i = 0; i < need; i++){
          const s = patternSlots[i];
          const base = summonSpec.creep || {};
          const spawnTtl = Number.isFinite(base.ttlTurns) ? base.ttlTurns : ttl;
          enqueueImmediate(Game, {
            by: unit.id,
            side: unit.side,
            slot: s,
            unit: {
              id: base.id || `${unit.id}_minion`,
              name: base.name || base.label || 'Creep',
              color: base.color || '#ffd27d',
              isMinion: base.isMinion !== false,
              ownerIid: unit.iid,
              bornSerial: _BORN++,
              ttlTurns: Number.isFinite(spawnTtl) ? spawnTtl : 3,
              ...inheritStats
            }
          });
        }
      }
      setFury(unit, 0);
      return;
    }

    const u = meta.kit?.ult;
    if (!u){ spendFury(unit, resolveUltCost(unit)); return; }

    const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
    let busyMs = 900;

    switch(u.type){
      case 'drain': {
        const aliveNow = tokensAlive();
        const foes = aliveNow.filter(t => t.side === foeSide);
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

  case 'hpTradeBurst': {
        const hpTradePctRaw = Number.isFinite(u.hpTradePercent) ? u.hpTradePercent : (u.hpTrade?.percentMaxHP ?? 0);
        const hpTradePct = Math.max(0, Math.min(0.95, hpTradePctRaw || 0));
        const hpMax = Number.isFinite(unit.hpMax) ? unit.hpMax : 0;
        const currentHp = Number.isFinite(unit.hp) ? unit.hp : 0;
        const desiredTrade = Math.round(hpMax * hpTradePct);
        const maxLoss = Math.max(0, currentHp - 1);
        const hpPayment = Math.max(0, Math.min(desiredTrade, maxLoss));
        if (hpPayment > 0){
          applyDamage(unit, hpPayment);
          gainFury(unit, {
            type: 'damageTaken',
            dealt: hpPayment,
            selfMaxHp: Number.isFinite(unit?.hpMax) ? unit.hpMax : undefined,
            damageTaken: hpPayment
          });
          finishFuryHit(unit);
        }

        const aliveNow = tokensAlive();
        const foes = aliveNow.filter(t => t.side === foeSide && t.alive);

        const hits = Math.max(1, (u.hits | 0) || 1);
        const selected = [];
        if (foes.length){
          const primary = pickTarget(Game, unit);
          if (primary){
            selected.push(primary);
          }
          const pool = foes.filter(t => !selected.includes(t));
          pool.sort((a, b) => {
            const da = Math.abs(a.cx - unit.cx) + Math.abs(a.cy - unit.cy);
            const db = Math.abs(b.cx - unit.cx) + Math.abs(b.cy - unit.cy);
            return da - db;
          });
          for (const enemy of pool){
            if (selected.length >= hits) break;
            selected.push(enemy);
          }
          if (selected.length > hits) selected.length = hits;
          if (!selected.length && foes.length){
            selected.push(foes[0]);
          }
        }

        const applyBusyFromVfx = (startedAt, duration) => {
          if (!Number.isFinite(startedAt) || !Number.isFinite(duration)) return;
          busyMs = Math.max(busyMs, duration);
          if (Game?.turn){
            const prev = Number.isFinite(Game.turn.busyUntil) ? Game.turn.busyUntil : startedAt;
            Game.turn.busyUntil = Math.max(prev, startedAt + duration);
          }
        };

        const bindingKey = 'huyet_hon_loi_quyet';

        {
          const startedAt = getNow();
          try {
            const dur = vfxAddBloodPulse(Game, unit, {
              bindingKey,
              timing: 'charge_up'
            });
            applyBusyFromVfx(startedAt, dur);
          } catch (_) {}
        }

        const damageSpec = u.damage || {};
        const dtype = damageSpec.type || 'arcane';
        const attackType = u.countsAsBasic ? 'basic' : 'skill';
        const wilScale = Number.isFinite(damageSpec.scaleWIL) ? damageSpec.scaleWIL : (damageSpec.scaleWil ?? 0);
        const flatAdd = Number.isFinite(damageSpec.flat) ? damageSpec.flat : (damageSpec.flatAdd ?? 0);
        const debuffSpec = u.appliesDebuff || null;
        const debuffId = debuffSpec?.id || 'loithienanh_spd_burn';
        const debuffAmount = Number.isFinite(debuffSpec?.amount)
          ? debuffSpec.amount
          : (Number.isFinite(debuffSpec?.amountPercent) ? debuffSpec.amountPercent : 0);
        const debuffMaxStacks = Math.max(1, (debuffSpec?.maxStacks | 0) || 1);
        const debuffDuration = Number.isFinite(debuffSpec?.turns)
          ? debuffSpec.turns
          : (Number.isFinite(u.duration) ? u.duration : (u.turns || 1));

        for (const tgt of selected){
          if (!tgt || !tgt.alive) continue;
          const tgtRank = Game?.meta?.rankOf?.(tgt.id) || tgt?.rank || '';
          const isBoss = typeof tgtRank === 'string' && tgtRank.toLowerCase() === 'boss';
          const pctDefault = Number.isFinite(damageSpec.percentTargetMaxHP)
            ? damageSpec.percentTargetMaxHP
            : (Number.isFinite(damageSpec.basePercentMaxHPTarget) ? damageSpec.basePercentMaxHPTarget : 0);
          const pct = isBoss
            ? (Number.isFinite(damageSpec.bossPercent) ? damageSpec.bossPercent : pctDefault)
            : pctDefault;
          const baseFromPct = Math.round(Math.max(0, pct) * Math.max(0, tgt.hpMax || 0));
          const baseFromWil = Math.round(Math.max(0, wilScale || 0) * Math.max(0, unit.wil || 0));
          const baseFlat = Math.round(Math.max(0, flatAdd || 0));
          const base = Math.max(1, baseFromPct + baseFromWil + baseFlat);
          dealAbilityDamage(Game, unit, tgt, {
            base,
            dtype,
            attackType,
            defPen: Number.isFinite(damageSpec.defPen) ? damageSpec.defPen : (damageSpec.pen ?? 0)
          });

          {
            const startedAt = getNow();
            try {
              const dur = vfxAddLightningArc(Game, unit, tgt, {
                bindingKey,
                timing: 'burst_core',
                targetBindingKey: bindingKey,
                targetTiming: 'burst_core'
              });
              applyBusyFromVfx(startedAt, dur);
            } catch (_) {}
          }

          if (debuffAmount && tgt.alive){
            const existing = Statuses.get(tgt, debuffId);
            if (existing){
              existing.stacks = Math.min(debuffMaxStacks, (existing.stacks || 1) + 1);
              if (Number.isFinite(debuffDuration)) existing.dur = debuffDuration;
            } else {
              Statuses.add(tgt, {
                id: debuffId,
                kind: 'debuff',
                tag: 'stat',
                attr: 'spd',
                mode: 'percent',
                amount: debuffAmount,
                stacks: 1,
                maxStacks: debuffMaxStacks,
                dur: Number.isFinite(debuffDuration) ? debuffDuration : undefined,
                tick: 'turn'
              });
            }
            if (typeof tgt._recalcStats === 'function') tgt._recalcStats();
          }
        }

        {
          const startedAt = getNow();
          try {
            const dur = vfxAddGroundBurst(Game, unit, {
              bindingKey,
              anchorId: 'right_foot',
              timing: 'ground_crack'
            });
            applyBusyFromVfx(startedAt, dur);
          } catch (_) {}
        }

        {
          const startedAt = getNow();
          try {
            const dur = vfxAddGroundBurst(Game, unit, {
              bindingKey,
              anchorId: 'left_foot',
              timing: 'ground_crack'
            });
            applyBusyFromVfx(startedAt, dur);
          } catch (_) {}
        }

        {
         const startedAt = getNow();
          try {
            const dur = vfxAddShieldWrap(Game, unit, {
              bindingKey,
              anchorId: 'root',
              timing: 'burst_core'
            });
            applyBusyFromVfx(startedAt, dur);
          } catch (_) {}
        }

        if (Number.isFinite(u.reduceDmg) && u.reduceDmg > 0){
          const turns = Number.isFinite(u.duration) ? u.duration : (u.turns || 1);
          Statuses.add(unit, Statuses.make.damageCut({ pct: u.reduceDmg, turns }));
        }

        busyMs = Math.max(busyMs, 1600);
        break;
      }

      case 'strikeLaneMid': {
        const primary = pickTarget(Game, unit);
        if (!primary) break;
        const laneX = primary.cx;
        const aliveNow = tokensAlive();
        const laneTargets = aliveNow.filter(t => t.side === foeSide && t.cx === laneX);
        const hits = Math.max(1, (u.hits|0) || 1);
        const scale = typeof u.scale === 'number' ? u.scale : 0.9;
        const meleeDur = CFG?.ANIMATION?.meleeDurationMs ?? 1100;
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
        if (maxPay > 0){
          applyDamage(unit, maxPay);
          gainFury(unit, {
            type: 'damageTaken',
            dealt: maxPay,
            selfMaxHp: Number.isFinite(unit?.hpMax) ? unit.hpMax : undefined,
            damageTaken: maxPay
          });
          finishFuryHit(unit);
        }
        const reduce = Math.max(0, u.reduceDmg ?? 0);
        if (reduce > 0){
          Statuses.add(unit, Statuses.make.damageCut({ pct: reduce, turns: u.turns || 1 }));
        }
        try { vfxAddHit(Game, unit); } catch(_){}
        busyMs = 800;
        break;
      }

      case 'sleep': {
        const aliveNow = tokensAlive();
        const foes = aliveNow.filter(t => t.side === foeSide);
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
          if (ally){
            setFury(ally, Math.max(0, (u.revived?.rage) ?? 0));
          }
          if (u.revived?.lockSkillsTurns){
            Statuses.add(ally, Statuses.make.silence({ turns: u.revived.lockSkillsTurns }));
          }
          try { vfxAddSpawn(Game, ally.cx, ally.cy, ally.side); } catch(_){}
        }
        busyMs = 1500;
        break;
      }

      case 'equalizeHP': {
        const aliveNow = tokensAlive();
        let allies = aliveNow.filter(t => t.side === unit.side);
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
        const aliveNow = tokensAlive();
        const others = aliveNow.filter(t => t.side === unit.side && t !== unit);
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
    spendFury(unit, resolveUltCost(unit));
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
    if (Game?._inited) return true;
    const doc = docRef || (typeof document !== 'undefined' ? document : null);
    if (!doc) return false;
    const root = rootElement || null;
    const boardFromRoot = (root && typeof root.querySelector === 'function')
      ? root.querySelector('#board')
      : null;
    const boardFromDocument = (typeof doc.querySelector === 'function')
      ? doc.querySelector('#board')
      : (typeof doc.getElementById === 'function' ? doc.getElementById('board') : null);
    const boardEl = /** @type {HTMLCanvasElement|null} */ (boardFromRoot || boardFromDocument);
    if (!boardEl){
      return false;
    }
    canvas = boardEl;
    ctx = /** @type {CanvasRenderingContext2D} */ (boardEl.getContext('2d'));
    
    if (typeof hudCleanup === 'function'){
      hudCleanup();
      hudCleanup = null;
    }
    hud = initHUD(doc, root);
    hudCleanup = (hud && typeof hud.cleanup === 'function') ? hud.cleanup : null;
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
          aeMax: 0, ae: 0
        });
        initializeFury(t, t.id, 0);
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
    }, root);

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

      const spawnCycle = predictSpawnCycle(Game, 'ally', slot);
      const pendingArt = getUnitArt(card.id);
      const pending = {
        unitId: card.id, name: card.name, side:'ally',
        cx: cell.cx, cy: cell.cy, slot, spawnCycle,
        source: 'deck',
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
    resizeHandler = ()=>{ scheduleResize(); };
    if (winRef && typeof winRef.addEventListener === 'function'){
      winRef.addEventListener('resize', resizeHandler);
    }

  const viewport = winRef?.visualViewport;
    if (viewport && typeof viewport.addEventListener === 'function'){
      if (visualViewportResizeHandler && typeof viewport.removeEventListener === 'function'){
        viewport.removeEventListener('resize', visualViewportResizeHandler);
      }
      visualViewportResizeHandler = ()=>{ scheduleResize(); };
      viewport.addEventListener('resize', visualViewportResizeHandler);

      if (visualViewportScrollHandler && typeof viewport.removeEventListener === 'function'){
        viewport.removeEventListener('scroll', visualViewportScrollHandler);
      }
      visualViewportScrollHandler = ()=>{ scheduleResize(); };
      viewport.addEventListener('scroll', visualViewportScrollHandler);
    }

    const queryFromRoot = (selector)=>{
      if (root && typeof root.querySelector === 'function'){
        const el = root.querySelector(selector);
        if (el) return el;
      }
      return null;
    };
    
    const updateTimerAndCost = (timestamp)=>{
      if (!CLOCK) return;
      const now = Number.isFinite(timestamp) ? timestamp : getNow();
      const elapsedSec = Math.floor((now - CLOCK.startMs) / 1000);

      const remain = Math.max(0, 240 - elapsedSec);
      if (remain !== CLOCK.lastTimerRemain){
        CLOCK.lastTimerRemain = remain;
        const mm = String(Math.floor(remain/60)).padStart(2,'0');
        const ss = String(remain%60).padStart(2,'0');
        const tEl = /** @type {HTMLElement|null} */ (queryFromRoot('#timer') || doc.getElementById('timer'));
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
        tickLoopHandle = setTimeout(()=> runTickLoop(getNow()), 16);
      }
    }
    updateTimerAndCost(getNow());
    scheduleTickLoop();
    return true;
  }

  function selectFirstAffordable(){
    if (!Game) return;

    const deck = Array.isArray(Game.deck3) ? Game.deck3 : [];
    if (!deck.length){
      Game.selectedId = null;
      return;
    }

    let cheapestAffordable = null;
    let cheapestAffordableCost = Infinity;
    let cheapestOverall = null;
    let cheapestOverallCost = Infinity;

    for (const card of deck){
      if (!card) continue;

      const hasFiniteCost = Number.isFinite(card.cost);
      const cardCost = hasFiniteCost ? card.cost : 0;

      if (cardCost < cheapestOverallCost){
        cheapestOverall = card;
        cheapestOverallCost = cardCost;
      }

      const affordable = !hasFiniteCost || card.cost <= Game.cost;
      if (affordable && cardCost < cheapestAffordableCost){
        cheapestAffordable = card;
        cheapestAffordableCost = cardCost;
      }
    }

    const chosen = (cheapestAffordable || cheapestOverall) ?? null;
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
      hpBarGradientCache.clear();
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

  function normalizeHpBarCacheKey(fillColor, innerHeight, innerRadius, startY){
    const color = typeof fillColor === 'string' ? fillColor.trim().toLowerCase() : String(fillColor ?? '');
    const height = Number.isFinite(innerHeight) ? Math.max(0, Math.round(innerHeight)) : 0;
    const radius = Number.isFinite(innerRadius) ? Math.max(0, Math.round(innerRadius)) : 0;
    const start = Number.isFinite(startY) ? Math.round(startY * 100) / 100 : 0;
    return `${color}|h:${height}|r:${radius}|y:${start}`;
  }

  function ensureHpBarGradient(fillColor, innerHeight, innerRadius, startY, x){
    const key = normalizeHpBarCacheKey(fillColor, innerHeight, innerRadius, startY);
    const cached = hpBarGradientCache.get(key);
    if (cached) return cached;
    if (!ctx || !Number.isFinite(innerHeight) || innerHeight <= 0){
      hpBarGradientCache.set(key, fillColor);
      return fillColor;
    }
    const startYSafe = Number.isFinite(startY) ? startY : 0;
    const gradient = ctx.createLinearGradient(x, startYSafe, x, startYSafe + innerHeight);
    if (!gradient){
      hpBarGradientCache.set(key, fillColor);
      return fillColor;
    }
    const topFill = lightenColor(fillColor, 0.25);
    gradient.addColorStop(0, topFill);
    gradient.addColorStop(1, fillColor);
    hpBarGradientCache.set(key, gradient);
    return gradient;
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
        const gradientY = y + inset;
        const gradientX = x + inset;
        const fillStyle = ensureHpBarGradient(fillColor, innerHeight, innerRadius, gradientY, gradientX);
        ctx.save();
        ctx.translate(gradientX, gradientY);
        roundedRectPathUI(ctx, 0, 0, filledWidth, innerHeight, innerRadius);
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.restore();
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
    cancelScheduledResize();
  }

  function clearSessionListeners(){
    if (canvas && canvasClickHandler && typeof canvas.removeEventListener === 'function'){
      canvas.removeEventListener('click', canvasClickHandler);
    }
    canvasClickHandler = null;
    if (typeof hudCleanup === 'function'){
      hudCleanup();
    }
    hudCleanup = null;
    if (resizeHandler && winRef && typeof winRef.removeEventListener === 'function'){
      winRef.removeEventListener('resize', resizeHandler);
    }
    resizeHandler = null;
    const viewport = winRef?.visualViewport;
    if (viewport && typeof viewport.removeEventListener === 'function'){
      if (visualViewportResizeHandler){
        viewport.removeEventListener('resize', visualViewportResizeHandler);
      }
      if (visualViewportScrollHandler){
        viewport.removeEventListener('scroll', visualViewportScrollHandler);
      }
    }
    visualViewportResizeHandler = null;
    visualViewportScrollHandler = null;
    cancelScheduledResize();
    unbindArtSpriteListener();
    unbindVisibility();
  }

  function resetDomRefs(){
    canvas = null;
    ctx = null;
    hud = null;
    hudCleanup = null;
    hpBarGradientCache.clear();
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
      const initialised = init();
      if (!initialised){
        stopSession();
        return null;
      }
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
      if (Game.backgroundKey !== cfg.backgroundKey){
        sceneChanged = true;
        clearBackgroundSignatureCache();
      }
      Game.backgroundKey = cfg.backgroundKey;
    }
    if (typeof cfg.modeKey !== 'undefined'){
      Game.modeKey = typeof cfg.modeKey === 'string' ? cfg.modeKey : (cfg.modeKey || null);
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
    const normalized = normalizeConfig(options || {});
    storedConfig = { ...normalized };
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

  const __backgroundSignatureCache = backgroundSignatureCache;
  function __getStoredConfig(){
    return storedConfig ? { ...storedConfig } : {};
  }

  function __getActiveGame(){
    return Game;
  }
  const __reexport0 = __require('./events.js');
  exports.gameEvents = __reexport0.gameEvents;
  exports.emitGameEvent = __reexport0.emitGameEvent;
  exports.TURN_START = __reexport0.TURN_START;
  exports.TURN_END = __reexport0.TURN_END;
  exports.ACTION_START = __reexport0.ACTION_START;
  exports.ACTION_END = __reexport0.ACTION_END;
  exports.TURN_REGEN = __reexport0.TURN_REGEN;
  exports.__backgroundSignatureCache = __backgroundSignatureCache;
  exports.clearBackgroundSignatureCache = clearBackgroundSignatureCache;
  exports.computeBackgroundSignature = computeBackgroundSignature;
  exports.createPveSession = createPveSession;
  exports.__getStoredConfig = __getStoredConfig;
  exports.__getActiveGame = __getActiveGame;
});
__define('./passives.js', (exports, module, __require) => {
  // passives.js — passive event dispatch & helpers v0.7
  const __dep0 = __require('./statuses.js');
  const Statuses = __dep0.Statuses;
  const hookOnLethalDamage = __dep0.hookOnLethalDamage;
  const __dep1 = __require('./utils/time.js');
  const safeNow = __dep1.safeNow;

  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  const STAT_ALIAS = new Map([
    ['atk', 'atk'],
    ['attack', 'atk'],
    ['wil', 'wil'],
    ['will', 'wil'],
    ['res', 'res'],
    ['arm', 'arm'],
    ['agi', 'agi'],
    ['agility', 'agi'],
    ['per', 'per'],
    ['perception', 'per'],
    ['hp', 'hp'],
    ['hpmax', 'hpMax'],
    ['maxhp', 'hpMax'],
    ['hp_max', 'hpMax'],
    ['hpmax%', 'hpMax'],
    ['spd', 'spd'],
    ['speed', 'spd'],
    ['aemax', 'aeMax'],
    ['ae_max', 'aeMax'],
    ['aeregen', 'aeRegen'],
    ['ae_regen', 'aeRegen'],
    ['hpregen', 'hpRegen'],
    ['hp_regen', 'hpRegen']
  ]);

  const BASE_STAT_KEYS = ['atk','wil','res','arm','agi','per','hpMax','spd','aeMax','aeRegen','hpRegen'];

  function normalizeStatKey(stat){
    if (typeof stat === 'string'){
      const trimmed = stat.trim();
      if (!trimmed) return null;
      const canonical = trimmed.replace(/[%_\s]/g, '').toLowerCase();
      return STAT_ALIAS.get(canonical) || trimmed;
    }
    return null;
  }

  const normalizeKey = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

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
    const statKey = normalizeStatKey(attr) || attr;
    let st = Statuses.get(unit, id);
    if (!st){
      st = Statuses.add(unit, {
        id,
        kind: 'buff',
        tag: 'stat',
        attr: statKey,
        mode,
        amount,
        purgeable,
        stacks: 0
      });
    }
    st.attr = statKey;
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

  function applyStatMap(unit, passive, stats, options = {}){
    if (!unit || !stats) return false;
    const mode = options.mode === 'flat' ? 'flat' : 'percent';
    const purgeable = options.purgeable !== false;
    const stackable = options.stack !== false;
    const stacks = Number.isFinite(options.stacks) ? options.stacks : 1;
    const maxStacks = options.maxStacks;
    const idPrefix = options.idPrefix || (passive?.id || 'stat');
    let applied = false;
    for (const [stat, value] of Object.entries(stats)){
      if (!Number.isFinite(value)) continue;
      const attr = normalizeStatKey(stat);
      if (!attr) continue;
      const st = ensureStatBuff(unit, `${idPrefix}_${attr}`, { attr, mode, amount: value, purgeable });
      const nextStacks = stackable ? (st.stacks || 0) + stacks : stacks;
      applyStatStacks(st, nextStacks, { maxStacks });
      applied = true;
    }
    if (applied) recomputeFromStatuses(unit);
    return applied;
  }

  function captureBaseStats(unit){
    const out = {};
    for (const key of BASE_STAT_KEYS){
      const value = unit[key];
      if (typeof value === 'number' && Number.isFinite(value)){
        out[key] = value;
      }
    }
    return out;
  }

  function hasLivingMinion(unit, Game){
    if (!unit || !Game) return false;
    return (Game.tokens || []).some(t => t && t.alive && t.isMinion && t.ownerIid === unit.iid);
  }

  function evaluateConditionObject(condition, { Game, unit, ctx, passive }){
    if (!condition || typeof condition !== 'object') return true;
    const hpMax = Number.isFinite(unit?.hpMax) ? unit.hpMax : Number.isFinite(unit?.baseStats?.hpMax) ? unit.baseStats.hpMax : 0;
    const hpPct = hpMax > 0 ? ((unit?.hp ?? hpMax) / hpMax) : 0;
    if (condition.selfHPAbove != null && hpPct <= condition.selfHPAbove) return false;
    if (condition.selfHPBelow != null && hpPct >= condition.selfHPBelow) return false;
    if (condition.hpAbove != null && hpPct <= condition.hpAbove) return false;
    if (condition.hpBelow != null && hpPct >= condition.hpBelow) return false;

    if (condition.requiresStatus){
      const list = Array.isArray(condition.requiresStatus) ? condition.requiresStatus : [condition.requiresStatus];
      for (const id of list){
        if (!Statuses.has(unit, id)) return false;
      }
    }

    if (condition.targetHasStatus){
      const target = ctx?.target;
      if (!target) return false;
      const list = Array.isArray(condition.targetHasStatus) ? condition.targetHasStatus : [condition.targetHasStatus];
      for (const id of list){
        if (!Statuses.has(target, id)) return false;
      }
    }

    if (condition.minMinions != null){
      const tokens = Game?.tokens || [];
      const count = tokens.filter(t => t && t.alive && t.isMinion && t.ownerIid === unit.iid).length;
      if (count < condition.minMinions) return false;
    }

    if (condition.maxStacks != null){
      const stackId = condition.stackId || passive?.id;
      if (stackId){
        const st = Statuses.get(unit, stackId);
        const stacks = st ? (st.stacks || 0) : 0;
        if (stacks >= condition.maxStacks) return false;
      }
    }

    return true;
  }

  function passiveConditionsOk({ Game, unit, passive, ctx }){
    const conditions = passive?.conditions;
    if (!conditions) return true;
    const list = Array.isArray(conditions) ? conditions : [conditions];
    for (const cond of list){
      if (!cond) continue;
      if (typeof cond === 'function'){
        try {
          if (!cond({ Game, unit, ctx, passive })) return false;
        } catch (_) {
          return false;
        }
        continue;
      }
      if (typeof cond === 'string'){
        const key = cond.trim().toLowerCase();
        if (key === 'hasminion' || key === 'requiresminion'){
          if (!hasLivingMinion(unit, Game)) return false;
        }
        continue;
      }
      if (typeof cond === 'object'){
        if (!evaluateConditionObject(cond, { Game, unit, ctx, passive })) return false;
      }
    }
    return true;
  }

  function recomputeFromStatuses(unit){
    if (!unit || !unit.baseStats) return;
    ensureStatusContainer(unit);

    const percent = new Map();
    const flat = new Map();
    for (const st of unit.statuses){
      if (!st || !st.attr || !st.mode) continue;
    const attr = normalizeStatKey(st.attr);
      if (!attr) continue;
      const stacks = st.stacks == null ? 1 : st.stacks;
      const amount = (st.amount ?? st.power ?? 0) * stacks;
      if (!Number.isFinite(amount)) continue;
      const mode = st.mode === 'flat' ? 'flat' : 'percent';
      const store = mode === 'flat' ? flat : percent;
      const prev = store.get(attr) || 0;
      store.set(attr, prev + amount);
    }

  for (const [key, baseValue] of Object.entries(unit.baseStats)){
      if (!Number.isFinite(baseValue)) continue;
      const attr = normalizeStatKey(key) || key;
      const pct = percent.get(attr) ?? percent.get(key) ?? 0;
      const add = flat.get(attr) ?? flat.get(key) ?? 0;
      let next = baseValue * (1 + pct) + add;

      if (attr === 'arm' || attr === 'res'){
        unit[attr] = clamp01(next);
        continue;
      }
      if (attr === 'spd'){
        unit[attr] = Math.max(0, Math.round(next * 100) / 100);
        continue;
      }
      if (attr === 'hpMax' || attr === 'hp' || attr === 'aeMax'){
        unit[attr] = Math.max(0, Math.round(next));
        continue;
      }
      if (attr === 'aeRegen' || attr === 'hpRegen'){
        unit[attr] = Math.max(0, Math.round(next * 100) / 100);
        continue;
      }
      unit[attr] = Math.max(0, Math.round(next));
    }
  }

  function healTeam(Game, unit, pct, opts = {}){
    if (!Game || !unit) return;
    if (!Number.isFinite(pct) || pct <= 0) return;
    const mode = opts.mode || 'targetMax';
    const casterHpMax = Number.isFinite(unit.hpMax) ? unit.hpMax : 0;
    const allies = (Game.tokens || []).filter(t => t.side === unit.side && t.alive);
    for (const ally of allies){
      if (!Number.isFinite(ally.hpMax)) continue;
      const base = mode === 'casterMax' ? casterHpMax : (ally.hpMax || 0);
      if (!Number.isFinite(base) || base <= 0) continue;
      const heal = Math.max(0, Math.round(base * pct));
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
            if (!target.deadAt) target.deadAt = safeNow();
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
      applyStatMap(unit, passive, { atk: amount }, {
        mode: 'percent',
        stack: params.stack !== false,
        purgeable: params.purgeable !== false,
        maxStacks: params.maxStacks
      });
    },

    gainWILPercent({ unit, passive }){
      if (!unit) return;
      const params = passive?.params || {};
      const amount = params.amount ?? 0;
      applyStatMap(unit, passive, { wil: amount }, {
        mode: 'percent',
        stack: params.stack !== false,
        purgeable: params.purgeable !== false,
        maxStacks: params.maxStacks
      });
    },

    conditionalBuff({ unit, passive, ctx }){
      if (!unit) return;
      const params = passive?.params || {};
      const hpMax = unit.hpMax || 0;
      const hpPct = hpMax > 0 ? (unit.hp || 0) / hpMax : 0;
      const threshold = params.ifHPgt ?? 0.5;
      const trueStats = {};
      const falseStats = {};
      if (params.RES != null) trueStats.res = params.RES;
      if (params.ARM != null) trueStats.arm = params.ARM;
      if (params.ATK != null) trueStats.atk = params.ATK;
      if (params.WIL != null) trueStats.wil = params.WIL;
      if (params.elseRES != null) falseStats.res = params.elseRES;
      if (params.elseARM != null) falseStats.arm = params.elseARM;
      if (params.elseATK != null) falseStats.atk = params.elseATK;
      if (params.elseWIL != null) falseStats.wil = params.elseWIL;

      const purgeable = params.purgeable !== false;
      const applyStats = (stats, suffix) => {
        for (const [stat, amount] of Object.entries(stats)){
          const attr = stat.toLowerCase();
          const st = ensureStatBuff(unit, `${passive.id}_${attr}`, { attr, mode:'percent', amount, purgeable });
          applyStatStacks(st, 1);
        }
      };
      const removeStats = (stats) => {
        for (const stat of Object.keys(stats)){
          Statuses.remove(unit, `${passive.id}_${stat.toLowerCase()}`);
        }
      };

      if (hpPct > threshold){
        applyStats(trueStats);
        removeStats(falseStats);
      } else {
        applyStats(falseStats);
        removeStats(trueStats);
      }
      recomputeFromStatuses(unit);
    },

    gainRESPct({ Game, unit, passive }){
      if (!unit) return;
      const params = passive?.params || {};
      const amount = params.amount ?? 0;
      applyStatMap(unit, passive, { res: amount }, {
        mode: 'percent',
        stack: params.stack !== false,
        purgeable: params.purgeable !== false,
        maxStacks: params.maxStacks
      });
    },

    gainStats({ unit, passive }){
      if (!unit) return;
      const params = passive?.params || {};
      const modeRaw = params.mode || params.statMode || params.kind;
      const mode = modeRaw === 'flat' ? 'flat' : 'percent';
      let applied = false;
      if (params.stats && typeof params.stats === 'object'){
        applied = applyStatMap(unit, passive, params.stats, {
          mode,
          stack: params.stack !== false,
          stacks: params.stacks,
          purgeable: params.purgeable !== false,
          maxStacks: params.maxStacks,
          idPrefix: params.idPrefix || passive?.id
        }) || applied;
      }
      if (params.flatStats && typeof params.flatStats === 'object'){
        applied = applyStatMap(unit, passive, params.flatStats, {
          mode: 'flat',
          stack: params.stackFlat !== false,
          stacks: params.stacksFlat ?? params.stacks,
          purgeable: params.purgeable !== false,
          maxStacks: params.maxStacksFlat ?? params.maxStacks,
          idPrefix: `${passive?.id || 'stat'}_flat`
        }) || applied;
      }
      if (!applied && params.attr != null && Number.isFinite(params.amount)){
        const attr = normalizeStatKey(params.attr);
        if (attr){
          applyStatMap(unit, passive, { [attr]: params.amount }, {
            mode,
            stack: params.stack !== false,
            stacks: params.stacks,
            purgeable: params.purgeable !== false,
            maxStacks: params.maxStacks
          });
        }
      }
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
    'gainWIL%': EFFECTS.gainWILPercent,
    conditionalBuff: EFFECTS.conditionalBuff,
    'gainRES%': EFFECTS.gainRESPct,
    gainBonus: EFFECTS.gainBonus,
    gainStats: EFFECTS.gainStats,
    'gainStats%': EFFECTS.gainStats,
    statBuff: EFFECTS.gainStats,
    statGain: EFFECTS.gainStats
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
      const effectKey = typeof passive.effect === 'string'
        ? passive.effect
        : (passive.effect?.type || passive.effect?.kind || null);
      let handler = effectKey ? EFFECT_MAP[effectKey] : EFFECT_MAP[passive.effect];
      let effectivePassive = passive;

      if (passive && typeof passive.effect === 'object' && passive.effect !== null){
        const spec = passive.effect;
        const type = spec.type || spec.kind;
        if (type && EFFECT_MAP[type]) handler = EFFECT_MAP[type];
        const mergedParams = {
          ...(spec.params || {}),
          ...(passive.params || {}),
          ...(spec.stats ? { stats: spec.stats } : {}),
          ...(spec.flatStats ? { flatStats: spec.flatStats } : {})
        };
        effectivePassive = { ...passive, params: mergedParams };
        if (!handler && (mergedParams.stats || mergedParams.flatStats)){
          handler = EFFECTS.gainStats;
        }
      } else if (!handler && passive?.params && (passive.params.stats || passive.params.flatStats)){
        handler = EFFECTS.gainStats;
      }

      if (effectKey === 'gainRES%' && effectivePassive?.params?.perTarget != null){
        handler = EFFECTS.resPerSleeping;
      }
      if (typeof handler !== 'function') continue;
      if (!passiveConditionsOk({ Game, unit, passive: effectivePassive, ctx })) continue;
      handler({ Game, unit, passive: effectivePassive, ctx });
    }
  }

  function applyOnSpawnEffects(Game, unit, onSpawn = {}){
    if (!Game || !unit || !onSpawn) return;
    ensureStatusContainer(unit);

    const effects = [];
    if (Array.isArray(onSpawn.effects)) effects.push(...onSpawn.effects);

    if (Number.isFinite(onSpawn.teamHealOnEntry) && onSpawn.teamHealOnEntry > 0){
      effects.push({ type: 'teamHeal', amount: onSpawn.teamHealOnEntry, mode: 'targetMax' });
    }
    const casterHeal = onSpawn.teamHealPercentMaxHPOfCaster ?? onSpawn.teamHealPercentCasterMaxHP;
    if (Number.isFinite(casterHeal) && casterHeal > 0){
      effects.push({ type: 'teamHeal', amount: casterHeal, mode: 'casterMax' });
    }

    if (Array.isArray(onSpawn.statuses)){
      for (const st of onSpawn.statuses){
        if (!st || typeof st !== 'object') continue;
        effects.push({ type: 'status', status: st });
      }
    }
    if (Array.isArray(onSpawn.addStatuses)){
      for (const st of onSpawn.addStatuses){
        if (!st || typeof st !== 'object') continue;
        effects.push({ type: 'status', status: st });
      }
    }
    if (onSpawn.status && typeof onSpawn.status === 'object'){
      effects.push({ type: 'status', status: onSpawn.status });
    }

    if (onSpawn.stats && typeof onSpawn.stats === 'object'){
      effects.push({ type: 'stats', stats: onSpawn.stats, mode: onSpawn.statsMode || onSpawn.mode, purgeable: onSpawn.purgeable });
    }
    if (onSpawn.flatStats && typeof onSpawn.flatStats === 'object'){
      effects.push({ type: 'stats', stats: onSpawn.flatStats, mode: 'flat', purgeable: onSpawn.purgeable, id: 'onSpawn_flat' });
    }

    let statsChanged = false;
    for (const effect of effects){
      if (!effect) continue;
      const type = normalizeKey(effect.type || effect.kind || effect.effect);
      if (type === 'teamheal'){
        const amount = effect.amount ?? effect.value ?? effect.percent ?? 0;
        if (!Number.isFinite(amount) || amount <= 0) continue;
        const mode = effect.mode === 'casterMax' ? 'casterMax' : 'targetMax';
        healTeam(Game, unit, amount, { mode });
        continue;
      }
      if (type === 'status' || type === 'addstatus'){
        if (effect.status && typeof effect.status === 'object'){
          Statuses.add(unit, effect.status);
        }
        continue;
      }
      if (type === 'stats' || type === 'stat' || type === 'buff'){
        const stats = effect.stats || effect.values;
        if (!stats || typeof stats !== 'object') continue;
        const applied = applyStatMap(unit, { id: effect.id || 'onSpawn' }, stats, {
          mode: effect.mode === 'flat' ? 'flat' : (effect.statMode === 'flat' ? 'flat' : 'percent'),
          stack: effect.stack !== false,
          stacks: effect.stacks,
          purgeable: effect.purgeable !== false,
          maxStacks: effect.maxStacks,
          idPrefix: effect.id || 'onSpawn'
        });
        statsChanged = applied || statsChanged;
        continue;
      }
    }

    if (statsChanged){
      if (typeof unit._recalcStats === 'function'){
        unit._recalcStats();
      } else {
        recomputeFromStatuses(unit);
      }
    } else if (typeof unit._recalcStats === 'function'){
      unit._recalcStats();
    } else {
      recomputeFromStatuses(unit);
    }
  }

  function prepareUnitForPassives(unit){
    if (!unit) return;
    ensureStatusContainer(unit);
    const captured = captureBaseStats(unit);
    if (!unit.baseStats || typeof unit.baseStats !== 'object'){
      unit.baseStats = { ...captured };
    } else {
      for (const [key, value] of Object.entries(captured)){
        if (!Number.isFinite(unit.baseStats[key])){
          unit.baseStats[key] = value;
        }
      }
    }
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

  const battlefieldSceneCache = new Map();

  function normalizeDimension(value){
    if (!Number.isFinite(value)) return 0;
    return value;
  }

  function createOffscreenCanvas(pixelWidth, pixelHeight){
    const safeW = Math.max(1, Math.floor(pixelWidth || 0));
    const safeH = Math.max(1, Math.floor(pixelHeight || 0));
    if (!safeW || !safeH) return null;
    if (typeof OffscreenCanvas === 'function'){
      try {
        return new OffscreenCanvas(safeW, safeH);
      } catch (_) {}
    }
    if (typeof document !== 'undefined' && typeof document.createElement === 'function'){
      const canvas = document.createElement('canvas');
      canvas.width = safeW;
      canvas.height = safeH;
      return canvas;
    }
    return null;
  }

  function themeSignature(theme){
    try {
      const merged = mergeTheme(theme);
      return JSON.stringify(merged);
    } catch (_) {
      return 'default-theme';
    }
  }

  function gridSignature(g, cssWidth, cssHeight, dpr){
    if (!g) return 'no-grid';
    const parts = [
      `cols:${g.cols ?? 'na'}`,
      `rows:${g.rows ?? 'na'}`,
      `tile:${Math.round(g.tile ?? 0)}`,
      `ox:${Math.round(g.ox ?? 0)}`,
      `oy:${Math.round(g.oy ?? 0)}`,
      `w:${Math.round(cssWidth ?? 0)}`,
      `h:${Math.round(cssHeight ?? 0)}`,
      `dpr:${Number.isFinite(dpr) ? dpr : 'na'}`
    ];
    return parts.join('|');
  }

  function invalidateBattlefieldSceneCache(){
    battlefieldSceneCache.clear();
  }

  function getCachedBattlefieldScene(g, theme, options = {}){
    if (!g) return null;
    const cssWidth = normalizeDimension(options.width ?? g.w);
    const cssHeight = normalizeDimension(options.height ?? g.h);
    const dpr = Number.isFinite(options.dpr) && options.dpr > 0
      ? options.dpr
      : (Number.isFinite(g.dpr) && g.dpr > 0 ? g.dpr : 1);
    if (!cssWidth || !cssHeight) return null;
    const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
    const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));
    const gridKey = gridSignature(g, cssWidth, cssHeight, dpr);
    const themeKey = themeSignature(theme);
    const cacheKey = `${gridKey}::${themeKey}`;
    const existing = battlefieldSceneCache.get(cacheKey);
    if (existing && existing.pixelWidth === pixelWidth && existing.pixelHeight === pixelHeight){
      return existing;
    }

    const offscreen = createOffscreenCanvas(pixelWidth, pixelHeight);
    if (!offscreen) return null;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return null;

    if (typeof offCtx.resetTransform === 'function') offCtx.resetTransform();
    else if (typeof offCtx.setTransform === 'function') offCtx.setTransform(1, 0, 0, 1, 0, 0);

    offCtx.clearRect(0, 0, pixelWidth, pixelHeight);

    if (typeof offCtx.setTransform === 'function') offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    else if (dpr !== 1 && typeof offCtx.scale === 'function') offCtx.scale(dpr, dpr);

    const gridForDraw = { ...g, w: cssWidth, h: cssHeight, dpr };
    drawBattlefieldScene(offCtx, gridForDraw, theme);

    const entry = {
      canvas: offscreen,
      pixelWidth,
      pixelHeight,
      cssWidth,
      cssHeight,
      dpr,
      gridKey,
      themeKey,
      cacheKey
    };
    battlefieldSceneCache.set(cacheKey, entry);
    return entry;
  }

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
  exports.invalidateBattlefieldSceneCache = invalidateBattlefieldSceneCache;
  exports.getCachedBattlefieldScene = getCachedBattlefieldScene;
  exports.drawBattlefieldScene = drawBattlefieldScene;
});
__define('./screens/collection/index.js', (exports, module, __require) => {
  const __dep0 = __require('./screens/collection/view.js');
  const renderCollectionView = __dep0.renderCollectionView;

  function mergeParams(base, override){
    if (!base && !override) return null;
    if (!base) return typeof override === 'object' ? { ...override } : override;
    if (!override) return typeof base === 'object' ? { ...base } : base;
    if (typeof base === 'object' && typeof override === 'object' && !Array.isArray(base) && !Array.isArray(override)){
      return { ...base, ...override };
    }
  return override;
  }

  function renderCollectionScreen(options = {}){
    const { root, shell, definition, params } = options;
    if (!root){
      throw new Error('renderCollectionScreen cần một phần tử root hợp lệ.');
    }

  const defParams = definition?.params || null;
    const mergedPlayerState = mergeParams(defParams?.playerState || null, params?.playerState || null) || {};
    const rosterSource = mergeParams(defParams?.roster || null, params?.roster || null) || null;
    const currencies = mergeParams(defParams?.currencies || null, params?.currencies || null)
      || mergedPlayerState?.currencies
      || null;

    return renderCollectionView({
      root,
      shell,
      playerState: mergedPlayerState,
      roster: rosterSource,
      currencies
    });
  }

  exports.renderCollectionView = renderCollectionView;

  const __defaultExport = { renderCollectionScreen };
  exports.renderCollectionScreen = renderCollectionScreen;
  exports.default = __defaultExport;
  module.exports.default = exports.default;
});
__define('./screens/collection/view.js', (exports, module, __require) => {
  const __dep0 = __require('./catalog.js');
  const ROSTER = __dep0.ROSTER;
  const __dep1 = __require('./units.js');
  const UNITS = __dep1.UNITS;
  const __dep2 = __require('./art.js');
  const getUnitArt = __dep2.getUnitArt;
  const __dep3 = __require('./data/economy.js');
  const listCurrencies = __dep3.listCurrencies;
  const __dep4 = __require('./data/skills.js');
  const getSkillSet = __dep4.getSkillSet;
  const __dep5 = __require('./utils/format.js');
  const createNumberFormatter = __dep5.createNumberFormatter;

  const STYLE_ID = 'collection-view-style-v2';

  const TAB_DEFINITIONS = [
    { key: 'awakening', label: 'Thức Tỉnh', hint: 'Theo dõi mốc thức tỉnh, sao và điểm đột phá của nhân vật đã sở hữu.' },
    { key: 'skills', label: 'Kĩ Năng', hint: 'Mở lớp phủ mô tả kỹ năng, chuỗi nâng cấp và yêu cầu nguyên liệu.' },
    { key: 'arts', label: 'Công Pháp & Trang Bị', hint: 'Liệt kê công pháp, pháp khí và trang bị đang trang bị cho nhân vật.' },
    { key: 'skins', label: 'Skin', hint: 'Quản lý skin đã mở khóa và áp dụng bảng phối màu yêu thích.' },
    { key: 'voice', label: 'Giọng Nói', hint: 'Nghe thử voice line, thiết lập voice pack và gợi ý mở khóa.' }
  ];

  const currencyCatalog = listCurrencies();
  const currencyFormatter = createNumberFormatter('vi-VN');

  function ensureStyles(){
    if (typeof document === 'undefined') return;
    let style = document.getElementById(STYLE_ID);
    if (!style || style.tagName.toLowerCase() !== 'style'){
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    const css = `
      .app--collection{padding:32px 16px 64px;}
      .collection-view{max-width:1280px;margin:0 auto;display:flex;flex-direction:column;gap:28px;color:inherit;}
      .collection-view__header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;}
      .collection-view__title-group{display:flex;align-items:center;gap:12px;}
      .collection-view__back{padding:10px 18px;border-radius:999px;border:1px solid rgba(125,211,252,.32);background:rgba(16,26,36,.78);color:#aee4ff;letter-spacing:.08em;text-transform:uppercase;font-size:12px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;}
      .collection-view__back:hover{transform:translateY(-2px);border-color:rgba(174,228,255,.52);box-shadow:0 12px 26px rgba(6,12,20,.45);}
      .collection-view__back:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
      .collection-view__title{margin:0;font-size:36px;letter-spacing:.08em;text-transform:uppercase;}
      .collection-view__wallet{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:flex-end;}
      .collection-wallet__item{min-width:130px;padding:10px 14px;border-radius:14px;border:1px solid rgba(125,211,252,.22);background:rgba(12,20,28,.82);display:flex;flex-direction:column;gap:4px;}
      .collection-wallet__name{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;margin:0;}
      .collection-wallet__balance{font-size:16px;margin:0;color:#e6f2ff;}
      .collection-view__layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(0,3fr) minmax(0,1.2fr);gap:24px;align-items:stretch;}
      .collection-roster{border-radius:24px;border:1px solid rgba(125,211,252,.2);background:linear-gradient(160deg,rgba(12,22,32,.94),rgba(6,14,22,.78));padding:20px;display:flex;flex-direction:column;gap:12px;overflow:hidden;}
      .collection-roster__list{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;max-height:560px;overflow:auto;padding-right:4px;}
      .collection-roster__entry{--entry-bg:rgba(12,20,28,.72);--entry-bg-hover:rgba(16,26,36,.9);--entry-bg-selected:rgba(18,30,42,.95);--entry-border:transparent;--entry-border-hover:rgba(125,211,252,.35);--entry-border-selected:rgba(125,211,252,.55);--entry-shadow:none;--entry-shadow-selected:0 16px 36px rgba(6,12,20,.45);display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid var(--entry-border);background:var(--entry-bg);color:inherit;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease;width:100%;}
      .collection-roster__entry:hover{transform:translateY(-2px);border-color:var(--entry-border-hover);background:var(--entry-bg-hover);box-shadow:var(--entry-shadow-hover,var(--entry-shadow));}
      .collection-roster__entry:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
      .collection-roster__entry.is-selected{border-color:var(--entry-border-selected);background:var(--entry-bg-selected);box-shadow:var(--entry-shadow-selected);}
      .collection-roster__entry[data-rank="S"]{--entry-bg:rgba(38,20,52,.78);--entry-bg-hover:rgba(48,26,68,.92);--entry-bg-selected:rgba(54,30,74,.96);--entry-border:rgba(255,180,255,.4);--entry-border-hover:rgba(255,204,255,.58);--entry-border-selected:rgba(255,228,255,.72);--entry-shadow:0 0 0 1px rgba(255,192,255,.2);--entry-shadow-hover:0 10px 26px rgba(150,66,188,.45);--entry-shadow-selected:0 18px 44px rgba(150,66,188,.6);}
      .collection-roster__entry[data-rank="A"]{--entry-bg:rgba(30,40,58,.78);--entry-bg-hover:rgba(38,50,72,.92);--entry-bg-selected:rgba(44,58,84,.96);--entry-border:rgba(124,187,255,.35);--entry-border-hover:rgba(158,208,255,.52);--entry-border-selected:rgba(188,226,255,.7);--entry-shadow:0 0 0 1px rgba(140,200,255,.2);--entry-shadow-hover:0 10px 26px rgba(64,116,188,.42);--entry-shadow-selected:0 18px 44px rgba(64,116,188,.55);}
      .collection-roster__entry[data-rank="B"]{--entry-bg:rgba(28,46,40,.78);--entry-bg-hover:rgba(34,58,50,.9);--entry-bg-selected:rgba(40,68,58,.95);--entry-border:rgba(120,224,185,.35);--entry-border-hover:rgba(146,236,204,.52);--entry-border-selected:rgba(176,246,220,.68);--entry-shadow:0 0 0 1px rgba(126,236,199,.18);--entry-shadow-hover:0 10px 24px rgba(42,126,110,.4);--entry-shadow-selected:0 18px 38px rgba(42,126,110,.52);}
      .collection-roster__entry[data-rank="C"]{--entry-bg:rgba(46,46,28,.78);--entry-bg-hover:rgba(58,58,34,.9);--entry-bg-selected:rgba(68,68,40,.95);--entry-border:rgba(232,212,124,.32);--entry-border-hover:rgba(244,226,150,.48);--entry-border-selected:rgba(252,238,176,.64);--entry-shadow:0 0 0 1px rgba(240,224,150,.16);--entry-shadow-hover:0 10px 24px rgba(162,138,52,.38);--entry-shadow-selected:0 18px 36px rgba(162,138,52,.48);}
      .collection-roster__entry[data-rank="D"]{--entry-bg:rgba(48,34,24,.78);--entry-bg-hover:rgba(60,42,30,.9);--entry-bg-selected:rgba(70,48,36,.95);--entry-border:rgba(255,170,108,.3);--entry-border-hover:rgba(255,188,138,.46);--entry-border-selected:rgba(255,208,170,.6);--entry-shadow:0 0 0 1px rgba(255,182,132,.14);--entry-shadow-hover:0 10px 22px rgba(168,88,42,.36);--entry-shadow-selected:0 18px 32px rgba(168,88,42,.45);}
      .collection-roster__entry[data-rank="unknown"],
      .collection-roster__entry:not([data-rank]){--entry-bg:rgba(12,20,28,.72);--entry-bg-hover:rgba(16,26,36,.9);--entry-bg-selected:rgba(18,30,42,.95);--entry-border:rgba(125,211,252,.2);--entry-border-hover:rgba(125,211,252,.35);--entry-border-selected:rgba(125,211,252,.55);--entry-shadow:none;--entry-shadow-hover:0 10px 20px rgba(6,12,20,.35);--entry-shadow-selected:0 16px 36px rgba(6,12,20,.45);}
      .collection-roster__avatar{width:48px;height:48px;border-radius:14px;background:rgba(24,34,44,.85);overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;--aura-background:radial-gradient(circle at 50% 50%,rgba(174,228,255,.6),rgba(16,26,36,0));--aura-shadow:0 0 0 rgba(0,0,0,0);}
      .collection-roster__entry[data-rank="S"] .collection-roster__avatar{--aura-background:radial-gradient(circle at 50% 45%,rgba(255,210,255,.9),rgba(120,24,160,0));--aura-shadow:0 0 22px rgba(214,118,255,.65);}
      .collection-roster__entry[data-rank="A"] .collection-roster__avatar{--aura-background:radial-gradient(circle at 50% 45%,rgba(170,210,255,.85),rgba(32,68,160,0));--aura-shadow:0 0 20px rgba(104,162,255,.55);}
      .collection-roster__entry[data-rank="B"] .collection-roster__avatar{--aura-background:radial-gradient(circle at 50% 45%,rgba(160,240,210,.85),rgba(16,94,72,0));--aura-shadow:0 0 18px rgba(92,206,162,.5);}
      .collection-roster__entry[data-rank="C"] .collection-roster__avatar{--aura-background:radial-gradient(circle at 50% 45%,rgba(244,226,150,.82),rgba(120,94,20,0));--aura-shadow:0 0 16px rgba(204,172,68,.48);}
      .collection-roster__entry[data-rank="D"] .collection-roster__avatar{--aura-background:radial-gradient(circle at 50% 45%,rgba(255,196,150,.8),rgba(122,52,14,0));--aura-shadow:0 0 14px rgba(202,108,52,.45);}
      .collection-roster__entry[data-rank="unknown"] .collection-roster__avatar,
      .collection-roster__entry:not([data-rank]) .collection-roster__avatar{--aura-background:radial-gradient(circle at 50% 45%,rgba(174,228,255,.6),rgba(16,26,36,0));--aura-shadow:0 0 12px rgba(6,12,20,.35);}
      .collection-roster__aura{position:absolute;inset:-6px;border-radius:inherit;background:var(--aura-background);box-shadow:var(--aura-shadow);opacity:.92;pointer-events:none;filter:saturate(1.15);transition:opacity .2s ease,transform .2s ease;z-index:0;}
      .collection-roster__entry:hover .collection-roster__aura{opacity:1;}
      .collection-roster__entry.is-selected .collection-roster__aura{opacity:1;transform:scale(1.02);}
      .collection-roster__avatar img{width:58px;height:58px;object-fit:contain;filter:drop-shadow(0 8px 16px rgba(0,0,0,.55));position:relative;z-index:1;}
      .collection-roster__avatar span{position:relative;z-index:1;color:#aee4ff;font-weight:600;letter-spacing:.08em;}
      .collection-roster__cost{margin-left:auto;padding:5px 9px;border-radius:11px;background:rgba(36,18,12,.72);color:#ffd9a1;font-size:11px;letter-spacing:.12em;text-transform:uppercase;display:flex;align-items:center;gap:6px;}
      .collection-roster__cost.is-highlighted{background:rgba(255,184,108,.9);color:#1e1206;box-shadow:0 10px 24px rgba(255,184,108,.45);}
      .collection-stage{position:relative;border-radius:28px;border:1px solid rgba(125,211,252,.24);background:linear-gradient(150deg,rgba(16,24,34,.92),rgba(10,16,26,.72));padding:28px;display:flex;flex-direction:column;gap:18px;overflow:visible;min-height:420px;}
      .collection-stage__art{flex:1;display:flex;align-items:flex-end;justify-content:center;position:relative;}
      .collection-stage__sprite{width:82%;max-width:420px;height:auto;filter:drop-shadow(0 32px 60px rgba(0,0,0,.6));transition:transform .3s ease,filter .3s ease;}
      .collection-stage__info{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;}
      .collection-stage__identity{display:flex;flex-direction:column;gap:6px;}
      .collection-stage__name{margin:0;font-size:26px;letter-spacing:.06em;}
      .collection-stage__tags{display:flex;gap:10px;flex-wrap:wrap;}
      .collection-stage__tag{padding:6px 12px;border-radius:999px;border:1px solid rgba(125,211,252,.28);background:rgba(12,22,32,.78);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#aee4ff;}
      .collection-stage__cost{padding:8px 16px;border-radius:999px;background:rgba(36,18,12,.82);color:#ffd9a1;font-size:13px;letter-spacing:.14em;text-transform:uppercase;border:1px solid rgba(255,184,108,.32);}
      .collection-stage__status{margin:0;color:#9cbcd9;font-size:14px;line-height:1.6;}
      .collection-tabs{border-radius:24px;border:1px solid rgba(125,211,252,.2);background:rgba(12,20,28,.9);padding:20px;display:flex;flex-direction:column;gap:12px;}
      .collection-tabs__title{margin:0 0 8px;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
      .collection-tabs__button{width:100%;padding:12px 14px;border-radius:14px;border:1px solid rgba(125,211,252,.18);background:rgba(8,16,24,.82);color:inherit;cursor:pointer;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:14px;transition:transform .18s ease,border-color .18s ease,background .18s ease;}
      .collection-tabs__button:hover{transform:translateX(4px);border-color:rgba(125,211,252,.42);background:rgba(16,26,36,.92);}
      .collection-tabs__button:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
      .collection-tabs__button.is-active{border-color:rgba(125,211,252,.55);background:rgba(18,30,42,.96);box-shadow:0 16px 36px rgba(6,12,20,.42);}
      .collection-tabs__hint{font-size:11px;color:#7da0c7;letter-spacing:.08em;text-transform:uppercase;}
      .collection-skill-overlay{position:absolute;top:15%;left:10%;width:82%;min-height:70%;padding:24px;border-radius:22px;border:1px solid rgba(125,211,252,.45);background:rgba(8,16,26,.92);box-shadow:0 42px 96px rgba(3,6,12,.75);display:flex;flex-direction:column;gap:18px;opacity:0;pointer-events:none;transition:opacity .24s ease,transform .24s ease;transform:translateY(12px);backdrop-filter:blur(6px);max-height:80vh;overflow:hidden;}
      .collection-skill-overlay.is-open{opacity:1;pointer-events:auto;transform:translateY(0);}
      .collection-skill-overlay__header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;}
      .collection-skill-overlay__title{margin:0;font-size:22px;letter-spacing:.06em;}
      .collection-skill-overlay__close{padding:8px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.28);background:rgba(16,24,34,.85);color:#aee4ff;font-size:12px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease;}
      .collection-skill-overlay__close:hover{transform:translateY(-2px);border-color:rgba(174,228,255,.48);}
      .collection-skill-overlay__close:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
      .collection-skill-overlay__content{display:grid;grid-template-columns:1fr;gap:24px;flex:1;overflow:auto;padding-right:8px;}
      .collection-skill-overlay__content.has-detail{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);}
      .collection-skill-overlay__details{display:flex;flex-direction:column;gap:12px;}
      .collection-skill-overlay__subtitle{margin:0;color:#9cbcd9;font-size:14px;line-height:1.6;}
      .collection-skill-overlay__abilities{display:flex;flex-direction:column;gap:12px;overflow:visible;max-height:none;padding-right:2px;}
      .collection-skill-card{border-radius:16px;border:1px solid rgba(125,211,252,.24);background:rgba(12,22,32,.88);padding:12px;display:flex;flex-direction:row;align-items:center;gap:12px;}
      .collection-skill-card__header{display:flex;align-items:center;gap:10px;flex:1;min-width:0;}
      .collection-skill-card__title{margin:0;font-size:15px;letter-spacing:.04em;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .collection-skill-card__actions{display:flex;align-items:center;gap:6px;margin-left:auto;}
      .collection-skill-card__badge{padding:3px 8px;border-radius:12px;border:1px solid rgba(125,211,252,.28);background:rgba(8,18,28,.82);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
      .collection-skill-card__upgrade{padding:5px 10px;border-radius:12px;border:1px solid rgba(174,228,255,.32);background:rgba(16,26,36,.88);color:#aee4ff;font-size:11px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease;}
      .collection-skill-card__upgrade:hover{transform:translateY(-1px);border-color:rgba(174,228,255,.52);box-shadow:0 8px 18px rgba(6,12,20,.38);}
      .collection-skill-card__upgrade:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
      .collection-skill-card__meta{display:none !important;}
      .collection-skill-card__description{display:none !important;}
      .collection-skill-card__notes{display:none !important;}
      .collection-skill-card.is-expanded{border-color:rgba(174,228,255,.6);box-shadow:0 22px 48px rgba(10,20,32,.52);background:rgba(16,28,40,.92);}
      .collection-skill-detail{border-radius:18px;border:1px solid rgba(125,211,252,.28);background:rgba(10,20,30,.86);padding:20px;display:flex;flex-direction:column;gap:14px;color:#e6f2ff;opacity:0;transform:translateY(10px);transition:opacity .2s ease,transform .2s ease;pointer-events:none;min-height:0;}
      .collection-skill-detail.is-active{opacity:1;transform:translateY(0);pointer-events:auto;}
      .collection-skill-detail__header{display:flex;flex-direction:column;gap:6px;}
      .collection-skill-detail__title{margin:0;font-size:20px;letter-spacing:.05em;}
      .collection-skill-detail__badge{align-self:flex-start;padding:4px 10px;border-radius:12px;border:1px solid rgba(174,228,255,.32);background:rgba(16,28,40,.82);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#aee4ff;}
      .collection-skill-detail__description{margin:0;color:#d7e7fb;font-size:14px;line-height:1.7;white-space:pre-line;}
      .collection-skill-detail__facts{display:flex;flex-direction:column;gap:8px;}
      .collection-skill-detail__fact{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:#cde1f5;background:rgba(12,24,36,.72);padding:10px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.2);}
      .collection-skill-detail__fact-icon{font-size:15px;line-height:1;}
      .collection-skill-detail__fact-label{font-weight:600;letter-spacing:.04em;}
      .collection-skill-detail__fact-value{font-size:13px;color:#e6f2ff;line-height:1.5;}
      .collection-skill-detail__notes{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#a9c7e6;}
      .collection-skill-detail__notes li{position:relative;padding-left:16px;}
      .collection-skill-detail__notes li::before{content:'•';position:absolute;left:0;color:#7da0c7;}
      .collection-skill-detail__empty{margin:0;color:#7da0c7;font-size:13px;line-height:1.6;}
      .collection-skill-card__empty{margin:0;color:#9cbcd9;font-size:13px;line-height:1.6;background:rgba(12,22,32,.88);border:1px dashed rgba(125,211,252,.28);border-radius:14px;padding:16px;text-align:center;}
      .collection-skill-overlay__notes{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#9cbcd9;}
      .collection-skill-overlay__notes li{position:relative;padding-left:16px;}
      .collection-skill-overlay__notes li::before{content:'•';position:absolute;left:0;color:#7da0c7;
      @media(max-width:1200px){
        .collection-view__layout{grid-template-columns:minmax(0,1.6fr) minmax(0,3fr) minmax(0,1.2fr);}
      }
      @media(max-width:1080px){
        .collection-view__layout{grid-template-columns:1fr;}
        .collection-roster__list{grid-template-columns:repeat(2,minmax(0,1fr));}
        .collection-skill-overlay{position:fixed;top:50%;left:50%;transform:translate(-50%,calc(-50% + 12px));width:88vw;min-height:0;max-height:85vh;}
        .collection-skill-overlay.is-open{transform:translate(-50%,-50%);}
        .collection-skill-overlay__content{grid-template-columns:1fr;}
        .collection-skill-overlay__content.has-detail{grid-template-columns:1fr;}
      }
      @media(max-width:820px){
        .collection-roster__list{grid-template-columns:1fr;}
      }
      @media(max-width:720px){
        .collection-view__title{font-size:30px;}
        .collection-roster__entry{padding:9px 11px;gap:9px;}
        .collection-roster__avatar{width:44px;height:44px;border-radius:12px;}
        .collection-roster__avatar img{width:52px;height:52px;}
        .collection-roster__cost{font-size:10px;padding:4px 8px;}
        .collection-skill-overlay__abilities{gap:10px;}
        .collection-skill-card{padding:8px 12px;gap:8px;flex-wrap:wrap;align-items:flex-start;}
        .collection-skill-card__header{flex-wrap:wrap;gap:8px;}
        .collection-skill-card__title{font-size:14px;white-space:normal;}
        .collection-skill-card__actions{width:100%;justify-content:flex-start;gap:8px;}
        .collection-skill-card__badge{font-size:11px;}
        .collection-skill-card__upgrade{font-size:11px;padding:6px 12px;}
      }
    `;

    if (style.textContent !== css){
      style.textContent = css;
    }
  }

  function cloneRoster(input){
    if (!Array.isArray(input) || input.length === 0){
      return ROSTER.map(unit => ({ ...unit }));
    }
    return input.map(entry => ({ ...entry }));
  }

  function buildRosterWithCost(rosterSource){
    const costs = new Map(UNITS.map(unit => [unit.id, unit.cost]));
    return rosterSource.map(entry => ({
      ...entry,
      cost: Number.isFinite(entry.cost) ? entry.cost : (costs.get(entry.id) ?? null)
    }));
  }

  function resolveCurrencyBalance(currencyId, providedCurrencies, playerState){
    const tryExtract = candidate => {
      if (candidate == null) return null;
      if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate;
      if (typeof candidate === 'string' && candidate.trim() !== '' && !Number.isNaN(Number(candidate))){
        return Number(candidate);
      }
      if (typeof candidate === 'object'){
        if (Number.isFinite(candidate.balance)) return candidate.balance;
        if (Number.isFinite(candidate.amount)) return candidate.amount;
        if (Number.isFinite(candidate.value)) return candidate.value;
      }
      return null;
    };

    const inspectContainer = container => {
      if (!container) return null;
      if (Array.isArray(container)){
        for (const entry of container){
          if (!entry) continue;
          const id = entry.id || entry.currencyId || entry.key;
          if (id === currencyId){
            const extracted = tryExtract(entry.balance ?? entry.amount ?? entry.value ?? entry.total ?? entry);
            if (extracted != null) return extracted;
          }
        }
        return null;
      }
      if (typeof container === 'object'){
        if (currencyId in container){
          const extracted = tryExtract(container[currencyId]);
          if (extracted != null) return extracted;
        }
        if (container.balances && currencyId in container.balances){
          const extracted = tryExtract(container.balances[currencyId]);
          if (extracted != null) return extracted;
        }
      }
      return null;
    };

    const fromProvided = inspectContainer(providedCurrencies);
    if (fromProvided != null) return fromProvided;
    const fromState = inspectContainer(playerState?.currencies);
    if (fromState != null) return fromState;
    return 0;
  }

  function describeUlt(unit){
    return unit?.name ? `Bộ kỹ năng của ${unit.name}.` : 'Chọn nhân vật để xem mô tả chi tiết.';
  }

  const TARGET_LABELS = {
    single: 'Đơn mục tiêu',
    singleTarget: 'Đơn mục tiêu',
    randomEnemies: 'Địch ngẫu nhiên',
    randomRow: 'Một hàng ngẫu nhiên',
    randomColumn: 'Một cột ngẫu nhiên',
    allEnemies: 'Toàn bộ địch',
    allAllies: 'Toàn bộ đồng minh',
    allies: 'Đồng minh',
    self: 'Bản thân',
    'self+2allies': 'Bản thân + 2 đồng minh'
  };

  const ABILITY_TYPE_LABELS = {
    basic: 'Đánh thường',
    active: 'Kĩ năng',
    ultimate: 'Tuyệt kỹ',
    talent: 'Thiên phú',
    technique: 'Tuyệt học',
    passive: 'Nội tại'
  };

  function formatResourceCost(cost){
    if (!cost || typeof cost !== 'object') return 'Không tốn tài nguyên';
    const parts = [];
    for (const [key, value] of Object.entries(cost)){
      if (!Number.isFinite(value)) continue;
      const label = key === 'aether' ? 'Aether' : key.replace(/_/g, ' ');
      parts.push(`${value} ${label}`);
    }
    return parts.length ? parts.join(' + ') : 'Không tốn tài nguyên';
  }

  function formatDuration(duration){
    if (!duration) return null;
    if (typeof duration === 'number') return `Hiệu lực ${duration} lượt`;
    if (typeof duration === 'string'){
      return duration === 'battle' ? 'Hiệu lực tới hết trận' : null;
    }
    const parts = [];
    if (duration.turns === 'battle'){
      parts.push('Hiệu lực tới hết trận');
    } else if (Number.isFinite(duration.turns)){
      parts.push(`Hiệu lực ${duration.turns} lượt`);
    }
    if (duration.start === 'nextTurn'){
      parts.push('Bắt đầu từ lượt kế tiếp');
    }
    if (Number.isFinite(duration.bossModifier) && Number.isFinite(duration.turns)){
      const bossTurns = Math.max(1, Math.floor(duration.turns * duration.bossModifier));
      parts.push(`Boss PvE: ${bossTurns} lượt`);
    }
    if (duration.affectedStat){
      parts.push(`Ảnh hưởng: ${duration.affectedStat}`);
    }
    return parts.length ? parts.join(' · ') : null;
  }

  function formatTargetLabel(target){
    if (target == null) return null;
    if (typeof target === 'number'){
      return `Nhắm tới ${target} mục tiêu`;
    }
    const key = target.toString();
    return TARGET_LABELS[key] || key;
  }

  function formatSummonSummary(summon){
    if (!summon || typeof summon !== 'object') return null;
    const parts = [];
    if (Number.isFinite(summon.count)){
      parts.push(`Triệu hồi ${summon.count} đơn vị`);
    } else {
      parts.push('Triệu hồi đơn vị');
    }
    if (summon.placement || summon.pattern){
      parts.push(`ô ${summon.placement || summon.pattern}`);
    }
    if (summon.limit != null){
      parts.push(`giới hạn ${summon.limit}`);
    }
    const ttl = summon.ttlTurns ?? summon.ttl;
    if (Number.isFinite(ttl) && ttl > 0){
      parts.push(`tồn tại ${ttl} lượt`);
    }
    if (summon.replace){
      parts.push(`thay ${summon.replace}`);
    }
    if (summon.inherit && typeof summon.inherit === 'object'){
      const inheritParts = [];
      for (const [stat, value] of Object.entries(summon.inherit)){
        if (!Number.isFinite(value)) continue;
        inheritParts.push(`${Math.round(value * 100)}% ${stat.toUpperCase()}`);
      }
      if (inheritParts.length){
        parts.push(`kế thừa ${inheritParts.join(', ')}`);
      }
    }
    return parts.join(' · ');
  }

  function formatReviveSummary(revive){
    if (!revive || typeof revive !== 'object') return null;
    const parts = [];
    const targets = Number.isFinite(revive.targets) ? revive.targets : 1;
    parts.push(`Hồi sinh ${targets} đồng minh`);
    if (revive.priority){
      parts.push(`ưu tiên ${revive.priority}`);
    }
    if (Number.isFinite(revive.hpPercent)){
      parts.push(`HP ${Math.round(revive.hpPercent * 100)}%`);
    }
    if (Number.isFinite(revive.ragePercent)){
      parts.push(`Nộ ${Math.round(revive.ragePercent * 100)}%`);
    }
    if (Number.isFinite(revive.lockSkillsTurns)){
      parts.push(`Khoá kỹ năng ${revive.lockSkillsTurns} lượt`);
    }
    return parts.join(' · ');
  }

  function formatLinksSummary(links){
    if (!links || typeof links !== 'object') return null;
    const parts = [];
    if (Number.isFinite(links.sharePercent)){
      parts.push(`Chia ${Math.round(links.sharePercent * 100)}% sát thương`);
    }
    if (links.maxConcurrent != null){
      parts.push(`tối đa ${links.maxConcurrent} mục tiêu`);
    }
    return parts.join(' · ');
  }

  function formatTagLabel(tag){
    if (typeof tag !== 'string') return '';
    return tag.replace(/-/g, ' ');
  }

  function labelForAbility(entry, fallback){
    const type = entry?.type;
    if (type && ABILITY_TYPE_LABELS[type]) return ABILITY_TYPE_LABELS[type];
    return fallback || 'Kĩ năng';
  }

  function collectAbilityFacts(entry){
    const facts = [];
    const addFact = (icon, label, value, tooltip = null) => {
      if (!value) return;
      facts.push({
        icon: icon || null,
        label: label || null,
        value,
        tooltip: tooltip || null
      });
    };

    if (entry?.cost && typeof entry.cost === 'object'){
      const formattedCost = formatResourceCost(entry.cost);
      if (formattedCost){
        addFact('💠', 'Chi phí', formattedCost);
      }
    }

    if (typeof entry?.hits === 'number' && entry.hits > 0){
      const displayHits = entry.hits === 1 ? '1 hit' : `${entry.hits} hit`;
      addFact('✦', 'Số hit', displayHits);
    }

    const targetLabel = formatTargetLabel(entry?.targets ?? entry?.target);
    if (targetLabel){
      addFact('🎯', 'Mục tiêu', targetLabel);
    }

    const duration = formatDuration(entry?.duration);
    if (duration){
      const parts = duration.split(' · ');
      const primary = parts.shift();
      const tooltip = parts.length ? duration : null;
      addFact('⏱', 'Hiệu lực', primary, tooltip);
    }

    if (Number.isFinite(entry?.limitUses)){
      addFact('🔁', 'Giới hạn', `${entry.limitUses} lần`);
    }

    if (entry?.lockout){
      const label = entry.lockout === 'battle' ? 'đến hết trận' : entry.lockout;
      addFact('🔒', 'Khoá', label);
    }

    if (Number.isFinite(entry?.maxStacks)){
      addFact('📚', 'Tối đa tầng', `${entry.maxStacks}`);
    }

    if (Array.isArray(entry?.tags) && entry.tags.length){
      const resolvedTags = entry.tags.map(formatTagLabel).filter(Boolean);
      if (resolvedTags.length){
        const [firstTag, ...restTags] = resolvedTags;
        const display = restTags.length ? `${firstTag} +${restTags.length}` : firstTag;
        addFact('🏷️', 'Tag', display, resolvedTags.join(', '));
      }
    }

    const summon = formatSummonSummary(entry?.summon);
    if (summon){
      addFact('🜂', 'Triệu hồi', summon);
    }

    const revive = formatReviveSummary(entry?.revive);
    if (revive){
      addFact('☯️', 'Hồi sinh', revive);
    }

    const links = formatLinksSummary(entry?.links);
    if (links){
      addFact('🔗', 'Liên kết', links);
    }

    return facts;
  }

  function renderAbilityCard(entry, { typeLabel = null, unitId = null } = {}){
    const card = document.createElement('article');
    card.className = 'collection-skill-card';

    const header = document.createElement('header');
    header.className = 'collection-skill-card__header';

    const title = document.createElement('h4');
    title.className = 'collection-skill-card__title';
    title.textContent = entry?.name || 'Kĩ năng';
    header.appendChild(title);
    
    const actions = document.createElement('div');
    actions.className = 'collection-skill-card__actions';
    
    const resolvedTypeLabel = typeLabel || labelForAbility(entry);

    const badge = document.createElement('span');
    badge.className = 'collection-skill-card__badge';
    badge.textContent = resolvedTypeLabel;
    actions.appendChild(badge);

    const abilityId = entry?.id ?? entry?.abilityId ?? null;
    const upgradeButton = document.createElement('button');
    upgradeButton.type = 'button';
    upgradeButton.className = 'collection-skill-card__upgrade';
    upgradeButton.textContent = 'Nâng cấp';
    if (abilityId != null){
      upgradeButton.dataset.abilityId = String(abilityId);
    }
    upgradeButton.addEventListener('click', () => {
      const detail = { abilityId, ability: entry };
      card.dispatchEvent(new CustomEvent('collection:request-upgrade', { bubbles: true, detail }));
    });
    actions.appendChild(upgradeButton);

    header.appendChild(actions);

    card.appendChild(header);

    const descriptionText = entry?.description && String(entry.description).trim() !== ''
      ? String(entry.description)
      : 'Chưa có mô tả chi tiết.';
    card.dataset.description = descriptionText;

        if (resolvedTypeLabel){
      card.dataset.typeLabel = resolvedTypeLabel;
    }
    if (unitId){
      card.dataset.unitId = String(unitId);
    }
    if (abilityId != null){
      card.dataset.abilityId = String(abilityId);
    }

    if (Array.isArray(entry?.notes)){
      const filteredNotes = entry.notes
        .map(note => (typeof note === 'string' ? note.trim() : ''))
        .filter(note => note.length > 0);
      if (filteredNotes.length){
        card.dataset.notes = JSON.stringify(filteredNotes);
      }
    }
    
    const facts = collectAbilityFacts(entry);
    if (facts.length){
      card.dataset.meta = JSON.stringify(facts);
    }

    card.addEventListener('click', event => {
      if (event.target.closest('.collection-skill-card__upgrade')){
        return;
      }
      const detail = {
        unitId: unitId || card.dataset.unitId || null,
        abilityId,
        ability: entry,
        typeLabel: resolvedTypeLabel
      };
      card.dispatchEvent(new CustomEvent('collection:toggle-skill-detail', { bubbles: true, detail }));
    });
    return card;
  }

  function renderCollectionView(options = {}){
    const { root, shell, playerState = {}, roster, currencies } = options;
    if (!root){
      throw new Error('renderCollectionView cần một phần tử root hợp lệ.');
    }

    ensureStyles();
    if (typeof root.innerHTML === 'string'){
      root.innerHTML = '';
    }
    if (root.classList){
      root.classList.add('app--collection');
    }

    const cleanups = [];
    const addCleanup = fn => {
      if (typeof fn === 'function') cleanups.push(fn);
    };

    const container = document.createElement('div');
    container.className = 'collection-view';

    const header = document.createElement('header');
    header.className = 'collection-view__header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'collection-view__title-group';

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'collection-view__back';
    backButton.textContent = '← Trở về menu chính';
    const handleBack = () => {
      if (shell && typeof shell.enterScreen === 'function'){
        shell.enterScreen('main-menu');
      }
    };
    backButton.addEventListener('click', handleBack);
    addCleanup(() => backButton.removeEventListener('click', handleBack));

    const title = document.createElement('h1');
    title.className = 'collection-view__title';
    title.textContent = 'Bộ Sưu Tập';

    titleGroup.appendChild(backButton);
    titleGroup.appendChild(title);

    const wallet = document.createElement('div');
    wallet.className = 'collection-view__wallet';

    for (const currency of currencyCatalog){
      const item = document.createElement('article');
      item.className = 'collection-wallet__item';

      const name = document.createElement('h2');
      name.className = 'collection-wallet__name';
      name.textContent = currency.shortName || currency.name || currency.id;
      item.appendChild(name);

      const balance = document.createElement('p');
      balance.className = 'collection-wallet__balance';
      const value = resolveCurrencyBalance(currency.id, currencies, playerState);
      balance.textContent = `${currencyFormatter.format(value)} ${currency.suffix || currency.id}`;
      item.appendChild(balance);

      wallet.appendChild(item);
    }

    header.appendChild(titleGroup);
    header.appendChild(wallet);

    container.appendChild(header);

    const layout = document.createElement('div');
    layout.className = 'collection-view__layout';

    const rosterPanel = document.createElement('section');
    rosterPanel.className = 'collection-roster';

    const rosterList = document.createElement('ul');
    rosterList.className = 'collection-roster__list';

    const rosterSource = buildRosterWithCost(cloneRoster(roster));
    const rosterEntries = new Map();

    for (const unit of rosterSource){
      const item = document.createElement('li');

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'collection-roster__entry';
      button.dataset.unitId = unit.id;
      button.dataset.rank = unit.rank || 'unknown';

      const avatar = document.createElement('div');
      avatar.className = 'collection-roster__avatar';
      const aura = document.createElement('div');
      aura.className = 'collection-roster__aura';
      avatar.appendChild(aura);
      const art = getUnitArt(unit.id);
      if (art?.sprite?.src){
        const img = document.createElement('img');
        img.src = art.sprite.src;
        img.alt = unit.name || unit.id;
        avatar.appendChild(img);
      } else {
        const fallback = document.createElement('span');
        fallback.textContent = '—';
        avatar.appendChild(fallback);
      }

      const cost = document.createElement('span');
      cost.className = 'collection-roster__cost';
      const costValue = Number.isFinite(unit.cost) ? unit.cost : '—';
      cost.textContent = `Cost ${costValue}`;

      const tooltipParts = [unit.name || unit.id];
      if (unit.rank){
        tooltipParts.push(`Rank ${unit.rank}`);
      }
      if (unit.class){
        tooltipParts.push(unit.class);
      }
      button.title = tooltipParts.join(' • ');
      button.setAttribute('aria-label', tooltipParts.join(' • '));

      button.appendChild(avatar);
      button.appendChild(cost);

      const handleSelect = () => {
        selectUnit(unit.id);
      };
      button.addEventListener('click', handleSelect);
      addCleanup(() => button.removeEventListener('click', handleSelect));

      item.appendChild(button);
      rosterList.appendChild(item);

      rosterEntries.set(unit.id, { button, costEl: cost, meta: unit });
    }

    rosterPanel.appendChild(rosterList);

    const stage = document.createElement('section');
    stage.className = 'collection-stage';

    const stageInfo = document.createElement('div');
    stageInfo.className = 'collection-stage__info';

    const identity = document.createElement('div');
    identity.className = 'collection-stage__identity';

    const stageName = document.createElement('h2');
    stageName.className = 'collection-stage__name';
    stageName.textContent = 'Chưa chọn nhân vật';

    const stageTags = document.createElement('div');
    stageTags.className = 'collection-stage__tags';

    const stageCost = document.createElement('div');
    stageCost.className = 'collection-stage__cost';
    stageCost.textContent = 'Cost —';

    identity.appendChild(stageName);
    identity.appendChild(stageTags);

    stageInfo.appendChild(identity);
    stageInfo.appendChild(stageCost);

    const stageArt = document.createElement('div');
    stageArt.className = 'collection-stage__art';

    const stageSprite = document.createElement('img');
    stageSprite.className = 'collection-stage__sprite';
    stageSprite.alt = '';
    stageSprite.style.opacity = '0';

    stageArt.appendChild(stageSprite);

    const stageStatus = document.createElement('p');
    stageStatus.className = 'collection-stage__status';
    stageStatus.textContent = 'Chọn một nhân vật để xem chi tiết và tab chức năng.';

    const overlay = document.createElement('div');
    overlay.className = 'collection-skill-overlay';

    const overlayHeader = document.createElement('div');
    overlayHeader.className = 'collection-skill-overlay__header';

    const overlayTitle = document.createElement('h3');
    overlayTitle.className = 'collection-skill-overlay__title';
    overlayTitle.textContent = 'Kĩ năng';

    const overlayClose = document.createElement('button');
    overlayClose.type = 'button';
    overlayClose.className = 'collection-skill-overlay__close';
    overlayClose.textContent = 'Đóng';

    const closeOverlay = () => {
      overlay.classList.remove('is-open');
      setActiveTab('awakening');
    };
    overlayClose.addEventListener('click', closeOverlay);
    addCleanup(() => overlayClose.removeEventListener('click', closeOverlay));

    overlayHeader.appendChild(overlayTitle);
    overlayHeader.appendChild(overlayClose);

    const overlayContent = document.createElement('div');
    overlayContent.className = 'collection-skill-overlay__content';

    const overlayDetails = document.createElement('div');
    overlayDetails.className = 'collection-skill-overlay__details';

    const overlaySubtitle = document.createElement('p');
    overlaySubtitle.className = 'collection-skill-overlay__subtitle';
    overlaySubtitle.textContent = 'Chọn nhân vật để xem mô tả kỹ năng.';

    const overlaySummary = document.createElement('p');
    overlaySummary.className = 'collection-skill-overlay__subtitle';
    overlaySummary.textContent = '';

    const overlayNotesList = document.createElement('ul');
    overlayNotesList.className = 'collection-skill-overlay__notes';
    const overlayAbilities = document.createElement('div');
    overlayAbilities.className = 'collection-skill-overlay__abilities';

  const overlayDetailPanel = document.createElement('aside');
    overlayDetailPanel.className = 'collection-skill-detail';
    overlayDetailPanel.setAttribute('aria-hidden', 'true');
    overlayDetailPanel.hidden = true;

    const detailHeader = document.createElement('div');
    detailHeader.className = 'collection-skill-detail__header';

    const detailTitle = document.createElement('h4');
    detailTitle.className = 'collection-skill-detail__title';
    detailTitle.textContent = 'Chi tiết kỹ năng';

    const detailBadge = document.createElement('span');
    detailBadge.className = 'collection-skill-detail__badge';
    detailBadge.textContent = '';
    detailBadge.style.display = 'none';

    detailHeader.appendChild(detailTitle);
    detailHeader.appendChild(detailBadge);

    const detailDescription = document.createElement('p');
    detailDescription.className = 'collection-skill-detail__description';
    detailDescription.textContent = 'Chọn một kỹ năng ở danh sách bên trái để xem mô tả chi tiết.';

    const detailFacts = document.createElement('div');
    detailFacts.className = 'collection-skill-detail__facts';

    const detailNotes = document.createElement('ul');
    detailNotes.className = 'collection-skill-detail__notes';

    const detailEmpty = document.createElement('p');
    detailEmpty.className = 'collection-skill-detail__empty';
    detailEmpty.textContent = 'Chưa có lưu ý bổ sung.';
    detailEmpty.style.display = 'none';

    overlayDetailPanel.appendChild(detailHeader);
    overlayDetailPanel.appendChild(detailDescription);
    overlayDetailPanel.appendChild(detailFacts);
    overlayDetailPanel.appendChild(detailNotes);
    overlayDetailPanel.appendChild(detailEmpty);

    overlayDetails.appendChild(overlaySubtitle);
    overlayDetails.appendChild(overlaySummary);
    overlayDetails.appendChild(overlayNotesList);
    overlayDetails.appendChild(overlayAbilities);

    overlayContent.appendChild(overlayDetails);
    overlayContent.appendChild(overlayDetailPanel);

    overlay.appendChild(overlayHeader);
    overlay.appendChild(overlayContent);

    stage.appendChild(stageInfo);
    stage.appendChild(stageArt);
    stage.appendChild(stageStatus);
    stage.appendChild(overlay);

  let activeAbilityCard = null;

    const clearSkillDetail = () => {
      if (activeAbilityCard){
        activeAbilityCard.classList.remove('is-expanded');
        activeAbilityCard = null;
      }
      overlayDetailPanel.classList.remove('is-active');
      overlayDetailPanel.setAttribute('aria-hidden', 'true');
      overlayDetailPanel.hidden = true;
      overlayContent.classList.remove('has-detail');
      detailTitle.textContent = 'Chi tiết kỹ năng';
      detailBadge.style.display = 'none';
      detailBadge.textContent = '';
      detailDescription.textContent = 'Chọn một kỹ năng ở danh sách bên trái để xem mô tả chi tiết.';
      while (detailFacts.firstChild){
        detailFacts.removeChild(detailFacts.firstChild);
      }
      while (detailNotes.firstChild){
        detailNotes.removeChild(detailNotes.firstChild);
      }
      detailEmpty.style.display = 'none';
    };

    const populateSkillDetail = (card, payload) => {
      if (!payload?.ability){
        clearSkillDetail();
        return;
      }

      if (activeAbilityCard && activeAbilityCard !== card){
        activeAbilityCard.classList.remove('is-expanded');
      }
      if (activeAbilityCard === card && overlayDetailPanel.classList.contains('is-active')){
        clearSkillDetail();
        return;
      }

      activeAbilityCard = card;
      activeAbilityCard.classList.add('is-expanded');

      const ability = payload.ability;
      const abilityName = ability?.name || 'Kĩ năng';
      detailTitle.textContent = abilityName;

      const typeLabel = payload.typeLabel || card.dataset.typeLabel || labelForAbility(ability);
      if (typeLabel){
        detailBadge.textContent = typeLabel;
        detailBadge.style.display = '';
      } else {
        detailBadge.textContent = '';
        detailBadge.style.display = 'none';
      }

      const description = ability?.description && String(ability.description).trim() !== ''
        ? String(ability.description)
        : card.dataset.description || 'Chưa có mô tả chi tiết.';
      detailDescription.textContent = description;

      while (detailFacts.firstChild){
        detailFacts.removeChild(detailFacts.firstChild);
      }
      const facts = collectAbilityFacts(ability);
      if (facts.length){
        for (const fact of facts){
          const item = document.createElement('div');
          item.className = 'collection-skill-detail__fact';

          if (fact.icon){
            const iconEl = document.createElement('span');
            iconEl.className = 'collection-skill-detail__fact-icon';
            iconEl.textContent = fact.icon;
            item.appendChild(iconEl);
          }

          const factBody = document.createElement('div');

          if (fact.label){
            const labelEl = document.createElement('div');
            labelEl.className = 'collection-skill-detail__fact-label';
            labelEl.textContent = fact.label;
            factBody.appendChild(labelEl);
          }

          const valueEl = document.createElement('div');
          valueEl.className = 'collection-skill-detail__fact-value';
          valueEl.textContent = fact.value;
          factBody.appendChild(valueEl);

          if (fact.tooltip){
            valueEl.title = fact.tooltip;
          }

          item.appendChild(factBody);
          detailFacts.appendChild(item);
        }
      }

      while (detailNotes.firstChild){
        detailNotes.removeChild(detailNotes.firstChild);
      }

      const rawNotes = Array.isArray(ability?.notes) ? ability.notes : [];
      let cardNotes = [];
      if (card.dataset.notes){
        try {
          const parsed = JSON.parse(card.dataset.notes);
          if (Array.isArray(parsed)){
            cardNotes = parsed;
          }
        } catch (error) {
          // bỏ qua lỗi parse và tiếp tục với danh sách rỗng
        }
      }
      const mergedNotes = [...rawNotes, ...cardNotes]
        .map(note => (typeof note === 'string' ? note.trim() : ''))
        .filter((note, index, array) => note && array.indexOf(note) === index);

      if (mergedNotes.length){
        for (const note of mergedNotes){
          const noteItem = document.createElement('li');
          noteItem.textContent = note;
          detailNotes.appendChild(noteItem);
        }
        detailEmpty.style.display = 'none';
      } else {
        detailEmpty.style.display = '';
      }

      overlayDetailPanel.hidden = false;
      overlayDetailPanel.classList.add('is-active');
      overlayDetailPanel.setAttribute('aria-hidden', 'false');
      overlayContent.classList.add('has-detail');
    };

    const handleSkillDetailToggle = event => {
      const card = event.target.closest('.collection-skill-card');
      if (!card){
        return;
      }
      populateSkillDetail(card, event.detail);
    };

    overlay.addEventListener('collection:toggle-skill-detail', handleSkillDetailToggle);
    addCleanup(() => overlay.removeEventListener('collection:toggle-skill-detail', handleSkillDetailToggle));

    const handleGlobalClick = event => {
      if (overlayDetailPanel.hidden) return;
      const target = event.target;
      if (overlay.contains(target)){
        if (target.closest('.collection-skill-detail')) return;
        if (target.closest('.collection-skill-card')) return;
      }
      clearSkillDetail();
    };

    document.addEventListener('click', handleGlobalClick);
    addCleanup(() => document.removeEventListener('click', handleGlobalClick));

    const tabs = document.createElement('aside');
    tabs.className = 'collection-tabs';

    const tabsTitle = document.createElement('h2');
    tabsTitle.className = 'collection-tabs__title';
    tabsTitle.textContent = 'Danh sách tab';
    tabs.appendChild(tabsTitle);

    const tabButtons = new Map();
    let activeTab = 'awakening';

    const setActiveTab = key => {
      activeTab = key;
      for (const [tabKey, button] of tabButtons){
        if (!button) continue;
        if (tabKey === key){
          button.classList.add('is-active');
        } else {
          button.classList.remove('is-active');
        }
      }
      const definition = TAB_DEFINITIONS.find(tab => tab.key === key);
      stageStatus.textContent = definition?.hint || 'Khung thông tin chức năng.';
      if (key === 'skills'){
        overlay.classList.add('is-open');
      } else {
        overlay.classList.remove('is-open');
        clearSkillDetail();
      }
    };

    const handleTabClick = key => {
      if (key === 'close'){
        if (shell && typeof shell.enterScreen === 'function'){
          shell.enterScreen('main-menu');
        }
        return;
      }
      setActiveTab(key);
    };

    for (const tab of TAB_DEFINITIONS){
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'collection-tabs__button';
      button.dataset.tabKey = tab.key;

      const label = document.createElement('span');
      label.textContent = tab.label;
      button.appendChild(label);

      const hint = document.createElement('span');
      hint.className = 'collection-tabs__hint';
      hint.textContent = '→';
      button.appendChild(hint);

      const clickHandler = () => handleTabClick(tab.key);
      button.addEventListener('click', clickHandler);
      addCleanup(() => button.removeEventListener('click', clickHandler));

      tabButtons.set(tab.key, button);
      tabs.appendChild(button);
    }

    const exitButton = document.createElement('button');
    exitButton.type = 'button';
    exitButton.className = 'collection-tabs__button';
    exitButton.dataset.tabKey = 'close';
    exitButton.innerHTML = '<span>Thoát</span><span class="collection-tabs__hint">↩</span>';
    const handleExit = () => {
      if (shell && typeof shell.enterScreen === 'function'){
        shell.enterScreen('main-menu');
      }
    };
    exitButton.addEventListener('click', handleExit);
    addCleanup(() => exitButton.removeEventListener('click', handleExit));
    tabs.appendChild(exitButton);

    layout.appendChild(rosterPanel);
    layout.appendChild(stage);
    layout.appendChild(tabs);

    container.appendChild(layout);

    if (root.appendChild){
      root.appendChild(container);
    }

    const selectUnit = unitId => {
      if (!unitId || !rosterEntries.has(unitId)) return;
      clearSkillDetail();
      for (const [id, entry] of rosterEntries){
        if (!entry?.button) continue;
        if (id === unitId){
          entry.button.classList.add('is-selected');
          if (entry.costEl){
            entry.costEl.classList.add('is-highlighted');
          }
        } else {
          entry.button.classList.remove('is-selected');
          if (entry.costEl){
            entry.costEl.classList.remove('is-highlighted');
          }
        }
      }

      const unit = rosterEntries.get(unitId)?.meta || null;
      stageName.textContent = unit?.name || unitId;

      while (stageTags.firstChild){
        stageTags.removeChild(stageTags.firstChild);
      }
      if (unit?.rank){
        const rankTag = document.createElement('span');
        rankTag.className = 'collection-stage__tag';
        rankTag.textContent = `Rank ${unit.rank}`;
        stageTags.appendChild(rankTag);
      }
      if (unit?.class){
        const classTag = document.createElement('span');
        classTag.className = 'collection-stage__tag';
        classTag.textContent = unit.class;
        stageTags.appendChild(classTag);
      }

      const costValue = Number.isFinite(unit?.cost) ? unit.cost : '—';
      stageCost.textContent = `Cost ${costValue}`;

      const art = getUnitArt(unitId);
      if (art?.sprite?.src){
        stageSprite.src = art.sprite.src;
        stageSprite.alt = unit?.name || unitId;
        stageSprite.style.opacity = '1';
      } else {
        stageSprite.removeAttribute('src');
        stageSprite.alt = '';
        stageSprite.style.opacity = '0';
      }

      overlayTitle.textContent = unit?.name ? `Kĩ năng · ${unit.name}` : 'Kĩ năng';
      
      const skillSet = getSkillSet(unitId);
      overlaySubtitle.textContent = describeUlt(unit);
      const summaryNote = skillSet?.notes?.[0] ?? '';
      overlaySummary.textContent = summaryNote;
      overlaySummary.style.display = summaryNote ? '' : 'none';

      while (overlayNotesList.firstChild){
        overlayNotesList.removeChild(overlayNotesList.firstChild);
      }
      const extraNotes = Array.isArray(skillSet?.notes) ? skillSet.notes.slice(1) : [];
      if (extraNotes.length){
        overlayNotesList.style.display = '';
        for (const note of extraNotes){
          if (!note) continue;
          const item = document.createElement('li');
          item.textContent = note;
          overlayNotesList.appendChild(item);
        }
      } else {
        overlayNotesList.style.display = 'none';
      }

      while (overlayAbilities.firstChild){
        overlayAbilities.removeChild(overlayAbilities.firstChild);
      }
      const abilityEntries = [];
      if (skillSet?.basic){
        abilityEntries.push({ entry: skillSet.basic, label: ABILITY_TYPE_LABELS.basic });
      }
      if (Array.isArray(skillSet?.skills)){
        skillSet.skills.forEach((skill, index) => {
          if (!skill) return;
          abilityEntries.push({ entry: skill, label: `Kĩ năng ${index + 1}` });
        });
      }
      if (skillSet?.ult){
        abilityEntries.push({ entry: skillSet.ult, label: ABILITY_TYPE_LABELS.ultimate });
      }
      if (skillSet?.talent){
        abilityEntries.push({ entry: skillSet.talent, label: ABILITY_TYPE_LABELS.talent });
      }
      if (skillSet?.technique){
        abilityEntries.push({ entry: skillSet.technique, label: ABILITY_TYPE_LABELS.technique });
      }

      if (abilityEntries.length){
        for (const ability of abilityEntries){
          overlayAbilities.appendChild(renderAbilityCard(ability.entry, { typeLabel: ability.label, unitId }));
        }
      } else {
        const placeholder = document.createElement('p');
        placeholder.className = 'collection-skill-card__empty';
        placeholder.textContent = 'Chưa có dữ liệu kỹ năng chi tiết cho nhân vật này.';
        overlayAbilities.appendChild(placeholder);
      }

      if (activeTab === 'skills'){
        overlay.classList.add('is-open');
      }
    };

    const observer = new MutationObserver(() => {
      // placeholder to keep overlay in DOM order if needed
    });
    observer.observe(stage, { childList: true });
    addCleanup(() => observer.disconnect());

    if (rosterEntries.size > 0){
      const [firstId] = rosterEntries.keys();
      if (firstId){
        selectUnit(firstId);
      }
    }

    setActiveTab(activeTab);

    return {
      destroy(){
        for (const fn of cleanups.splice(0, cleanups.length)){
          try {
            fn();
          } catch (error) {
            console.error('[collection] cleanup error', error);
          }
        }
        if (container.parentNode === root){
          root.removeChild(container);
        }
        if (root.classList){
          root.classList.remove('app--collection');
        }
      }
    };
  }


  exports.renderCollectionView = renderCollectionView;
  exports.default = renderCollectionView;
  module.exports.default = exports.default;
});
__define('./screens/lineup/index.js', (exports, module, __require) => {
  const __dep0 = __require('./screens/lineup/view.js');
  const renderLineupView = __dep0.renderLineupView;

  function mergeParams(base, override){
    if (!base && !override) return null;
    if (!base) return typeof override === 'object' ? { ...override } : override;
    if (!override) return typeof base === 'object' ? { ...base } : base;
    if (
      typeof base === 'object'
      && typeof override === 'object'
      && !Array.isArray(base)
      && !Array.isArray(override)
    ){
      return { ...base, ...override };
    }
    return override;
  }

    function resolveLineups(definitionParams, params){
    const base = Array.isArray(definitionParams?.lineups) ? definitionParams.lineups : null;
    const override = Array.isArray(params?.lineups) ? params.lineups : null;
    if (override) return override;
    if (base) return base;
    return [];
  }

  function renderLineupScreen(options = {}){
    const { root, shell, definition, params } = options;
    if (!root){
      throw new Error('renderLineupScreen cần một phần tử root hợp lệ.');
    }

    const defParams = definition?.params || null;
    const mergedPlayerState = mergeParams(defParams?.playerState || null, params?.playerState || null) || {};
    const lineups = resolveLineups(defParams, params);
    const roster = mergeParams(defParams?.roster || null, params?.roster || null) || null;
    const currencies = mergeParams(defParams?.currencies || null, params?.currencies || null)
      || mergedPlayerState?.currencies
      || null;
    const description = params?.shortDescription
      ?? defParams?.shortDescription
      ?? definition?.description
      ?? '';

    return renderLineupView({
      root,
      shell,
      definition,
      description,
      lineups,
      roster,
      playerState: mergedPlayerState,
      currencies
    });
  }

  exports.renderLineupView = renderLineupView;

  const __defaultExport = { renderLineupScreen };
  exports.renderLineupScreen = renderLineupScreen;
  exports.default = __defaultExport;
  module.exports.default = exports.default;
});
__define('./screens/lineup/view.js', (exports, module, __require) => {
  const __dep0 = __require('./catalog.js');
  const ROSTER = __dep0.ROSTER;
  const __dep1 = __require('./data/economy.js');
  const listCurrencies = __dep1.listCurrencies;
  const __dep2 = __require('./data/skills.js');
  const getSkillSet = __dep2.getSkillSet;
  const __dep3 = __require('./utils/format.js');
  const createNumberFormatter = __dep3.createNumberFormatter;

  const STYLE_ID = 'lineup-view-style-v1';

  const currencyCatalog = listCurrencies();
  const currencyIndex = new Map(currencyCatalog.map(currency => [currency.id, currency]));
  const numberFormatter = createNumberFormatter('vi-VN');

  function ensureStyles(){
    if (typeof document === 'undefined') return;
    let style = document.getElementById(STYLE_ID);
    if (!style || style.tagName.toLowerCase() !== 'style'){
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    const css = `
      .app--lineup{padding:32px 16px 72px;}
      .lineup-view{max-width:1320px;margin:0 auto;display:flex;flex-direction:column;gap:28px;color:inherit;--lineup-bench-slot-size:64px;--lineup-bench-slot-gap:12px;}
      .lineup-view__header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;}
      .lineup-view__actions{display:flex;flex-direction:column;align-items:flex-end;gap:12px;}
      .lineup-view__title-group{display:flex;flex-direction:column;gap:8px;}
      .lineup-view__title{margin:0;font-size:36px;letter-spacing:.08em;text-transform:uppercase;}
      .lineup-view__subtitle{margin:0;color:#9cbcd9;font-size:15px;line-height:1.6;max-width:720px;}
      .lineup-view__message{margin:0;color:#ffd9a1;font-size:13px;line-height:1.6;min-height:20px;}
      .lineup-view__message.is-error{color:#ff9b9b;}
      .lineup-view__back{padding:10px 18px;border-radius:999px;border:1px solid rgba(125,211,252,.32);background:rgba(12,22,32,.82);color:#aee4ff;letter-spacing:.08em;text-transform:uppercase;font-size:12px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;}
      .lineup-view__back:hover{transform:translateY(-2px);border-color:rgba(174,228,255,.52);box-shadow:0 12px 26px rgba(6,12,20,.4);}
      .lineup-view__back:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
      .lineup-view__wallet{display:flex;flex-wrap:wrap;gap:12px;align-items:center;}
      .lineup-wallet__item{padding:8px 12px;border-radius:14px;border:1px solid rgba(125,211,252,.22);background:rgba(12,20,28,.82);display:flex;flex-direction:column;gap:4px;min-width:120px;}
      .lineup-wallet__name{margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
      .lineup-wallet__balance{margin:0;font-size:15px;color:#e6f2ff;}
      .lineup-view__layout{display:grid;grid-template-columns:minmax(280px,1fr) minmax(0,3fr);gap:24px;align-items:start;}
      .lineup-main-area{display:grid;grid-template-columns:minmax(0,1fr);gap:24px;align-items:start;}
      .lineup-main{display:flex;flex-direction:column;gap:20px;}
      .lineup-slots{border-radius:24px;border:1px solid rgba(125,211,252,.24);background:linear-gradient(160deg,rgba(12,20,30,.92),rgba(8,16,24,.78));padding:20px;display:flex;flex-direction:column;gap:14px;}
      .lineup-slots__title{margin:0;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
      .lineup-slots__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;}
      .lineup-slot{position:relative;padding:14px;border-radius:16px;border:1px solid rgba(125,211,252,.22);background:rgba(8,16,26,.82);display:flex;flex-direction:column;gap:10px;align-items:flex-start;}
      .lineup-slot__label{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7da0c7;margin:0;}
      .lineup-slot__avatar{width:72px;height:72px;border-radius:18px;background:rgba(24,34,44,.85);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:600;color:#aee4ff;overflow:hidden;position:relative;}
      .lineup-slot__avatar img{width:100%;height:100%;object-fit:cover;}
      .lineup-slot__name{margin:0;font-size:14px;color:#e6f2ff;line-height:1.4;min-height:20px;}
      .lineup-slot__hint{margin:0;font-size:12px;color:#9cbcd9;}
      .lineup-slot__actions{display:flex;gap:8px;flex-wrap:wrap;}
      .lineup-button{padding:8px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.28);background:rgba(12,22,32,.9);color:#aee4ff;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease;}
      .lineup-button:hover{transform:translateY(-1px);border-color:rgba(174,228,255,.5);box-shadow:0 10px 20px rgba(6,12,20,.4);}
      .lineup-button:focus-visible{outline:2px solid rgba(174,228,255,.72);outline-offset:3px;}
      .lineup-slot.is-locked{border-style:dashed;border-color:rgba(125,211,252,.35);background:rgba(12,22,34,.6);}
      .lineup-slot__cost{margin:0;font-size:12px;color:#ffd9a1;letter-spacing:.08em;text-transform:uppercase;}
      .lineup-slot__locked-note{margin:0;font-size:12px;color:#9cbcd9;line-height:1.5;}
      .lineup-bench{display:flex;flex-direction:column;gap:12px;min-height:100%;padding:0;border:none;background:none;}
      .lineup-bench__title{margin:0;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
      .lineup-bench__content{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,320px);align-items:flex-start;gap:12px;flex:1;padding:0;border:none;background:none;}
     .lineup-bench__grid{display:flex;align-items:flex-start;justify-content:flex-start;gap:var(--lineup-bench-slot-gap);flex:1;min-height:0;align-self:stretch;}
      .lineup-bench__column{display:flex;flex-direction:column;gap:var(--lineup-bench-slot-gap);}
      .lineup-bench__column:first-child{margin-left:0;}
      .lineup-bench__cell{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;background:none;border:none;padding:0;width:var(--lineup-bench-slot-size);}
      .lineup-bench__cell:focus{outline:none;}
      .lineup-bench__cell:focus-visible{outline:none;}
      .lineup-bench__cell:hover .lineup-bench__avatar,
      .lineup-bench__cell:focus-visible .lineup-bench__avatar{transform:translateY(-2px);border-color:rgba(125,211,252,.45);background:rgba(16,28,40,.9);box-shadow:0 12px 28px rgba(6,12,20,.4);}
      .lineup-bench__cell:focus-visible .lineup-bench__avatar{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
      .lineup-bench__cell.is-active .lineup-bench__avatar{border-color:rgba(174,228,255,.6);box-shadow:0 12px 28px rgba(6,12,20,.4);transform:translateY(-2px);}
      .lineup-bench__cell.is-empty{opacity:0.6;}
      .lineup-bench__cell-code{margin:0;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7da0c7;text-align:center;line-height:1.2;font-weight:600;}
      .lineup-bench__avatar{width:48px;height:48px;border-radius:14px;background:rgba(24,34,44,.82);display:flex;align-items:center;justify-content:center;font-size:18px;color:#aee4ff;margin:0;overflow:hidden;border:1px solid rgba(125,211,252,.2);transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease;}
      .lineup-bench__avatar img{width:100%;height:100%;object-fit:cover;}
      .lineup-bench__details{border-radius:18px;border:1px solid rgba(125,211,252,.18);background:rgba(12,22,32,.78);padding:12px 14px;display:flex;flex-direction:column;gap:12px;align-self:flex-start;height:fit-content;overflow:auto;}
      .lineup-bench__details.is-empty{opacity:0.85;}
      .lineup-bench__details-section{display:flex;flex-direction:column;gap:4px;}
      .lineup-bench__details-heading{margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7da0c7;}
      .lineup-bench__details-text{margin:0;font-size:13px;color:#c8deff;line-height:1.5;}
      .lineup-bench__details-list{margin:0;padding-left:18px;font-size:13px;color:#c8deff;line-height:1.5;display:flex;flex-direction:column;gap:2px;}
      .lineup-bench__details-list li{margin:0;}
      .lineup-bench__details-empty{margin:0;font-size:13px;color:#9cbcd9;line-height:1.6;}
      .lineup-leader{border-radius:24px;border:1px solid rgba(255,209,132,.42);background:linear-gradient(150deg,rgba(36,26,12,.88),rgba(18,12,6,.92));padding:14px 16px;display:grid;grid-template-columns:minmax(0,120px) minmax(0,1fr);gap:12px;align-items:start;position:relative;overflow:hidden;}
      .lineup-leader__badge{position:absolute;top:12px;right:-18px;background:rgba(255,209,132,.16);color:#ffd184;padding:4px 26px;border-radius:999px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;transform:rotate(20deg);}
      .lineup-leader__main{display:flex;flex-direction:column;align-items:flex-start;gap:8px;}
      .lineup-leader__avatar{width:80px;height:80px;border-radius:20px;background:rgba(54,36,18,.9);display:flex;align-items:center;justify-content:center;font-size:26px;color:#ffd184;overflow:hidden;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease;border:1px solid rgba(255,209,132,.45);}
      .lineup-leader__avatar:hover{transform:translateY(-2px);box-shadow:0 18px 32px rgba(12,6,0,.5);}
      .lineup-leader__avatar:focus-visible{outline:2px solid rgba(255,209,132,.8);outline-offset:4px;}
      .lineup-leader__name{margin:0;font-size:16px;color:#ffe7b3;}
      .lineup-leader__note{margin:0;font-size:11px;color:#f0d9b2;line-height:1.5;}
      .lineup-passives{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:10px;}
      .lineup-passive{padding:10px;border-radius:14px;border:1px solid rgba(255,209,132,.28);background:rgba(38,26,12,.78);display:flex;flex-direction:column;gap:6px;cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease;color:#ffe7b3;height:100%;}
      .lineup-passive:hover{transform:translateY(-2px);border-color:rgba(255,209,132,.45);background:rgba(46,30,14,.86);}
      .lineup-passive:focus-visible{outline:2px solid rgba(255,209,132,.75);outline-offset:3px;}
      .lineup-passive__title{margin:0;font-size:13px;letter-spacing:.04em;}
      .lineup-passive__condition{margin:0;font-size:11px;color:#f3d2a2;}
      .lineup-passive.is-active{box-shadow:0 16px 34px rgba(255,184,108,.45);border-color:rgba(255,209,132,.72);background:rgba(56,36,18,.92);}
      .lineup-passive.is-empty{opacity:0.6;cursor:default;}
      .lineup-passive.is-empty:hover{transform:none;}
      .lineup-passive.is-empty:focus-visible{outline:none;}
      .lineup-roster{border-radius:28px;border:1px solid rgba(125,211,252,.22);background:rgba(8,16,24,.92);padding:20px;display:flex;flex-direction:column;gap:12px;}
      .lineup-roster__filters{display:flex;flex-wrap:wrap;gap:10px;}
      .lineup-roster__filter{padding:8px 14px;border-radius:999px;border:1px solid rgba(125,211,252,.24);background:rgba(12,22,32,.82);color:#aee4ff;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease;}
      .lineup-roster__filter:hover{transform:translateY(-1px);border-color:rgba(125,211,252,.42);}
      .lineup-roster__filter:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
      .lineup-roster__filter.is-active{border-color:rgba(174,228,255,.6);background:rgba(18,30,44,.94);box-shadow:0 12px 28px rgba(6,12,20,.4);}
      .lineup-roster__list{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;list-style:none;margin:0;padding:0;}
      .lineup-roster__entry{padding:12px;border-radius:16px;border:1px solid rgba(125,211,252,.18);background:rgba(12,22,32,.82);display:flex;align-items:center;gap:12px;cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease;}
      .lineup-roster__entry:hover{transform:translateY(-2px);border-color:rgba(125,211,252,.38);background:rgba(16,28,40,.9);}
      .lineup-roster__entry:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
      .lineup-roster__entry.is-selected{border-color:rgba(174,228,255,.6);background:rgba(18,30,44,.95);box-shadow:0 14px 30px rgba(6,12,20,.45);}
      .lineup-roster__entry.is-unavailable{opacity:0.55;}
      .lineup-roster__avatar{width:54px;height:54px;border-radius:16px;background:rgba(24,34,44,.82);display:flex;align-items:center;justify-content:center;color:#aee4ff;font-size:20px;overflow:hidden;}
      .lineup-roster__avatar img{width:100%;height:100%;object-fit:cover;}
      .lineup-roster__meta{display:flex;flex-direction:column;gap:4px;}
      .lineup-roster__name{margin:0;font-size:14px;color:#e6f2ff;}
      .lineup-roster__tag{margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
      .lineup-roster__extra{margin:0;font-size:12px;color:#9cbcd9;}
      .lineup-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(3,8,14,.66);backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:opacity .2s ease;z-index:80;}
      .lineup-overlay.is-open{opacity:1;pointer-events:auto;}
      .lineup-overlay__panel{max-width:540px;width:100%;background:rgba(8,16,24,.96);border:1px solid rgba(125,211,252,.35);border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:14px;color:#e6f2ff;box-shadow:0 32px 64px rgba(3,8,16,.75);}
      .lineup-overlay__close{align-self:flex-end;padding:8px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.3);background:rgba(12,22,32,.86);color:#aee4ff;font-size:12px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease;}
      .lineup-overlay__close:hover{transform:translateY(-1px);border-color:rgba(174,228,255,.5);}
      .lineup-overlay__close:focus-visible{outline:2px solid rgba(174,228,255,.7);outline-offset:3px;}
      .lineup-overlay__title{margin:0;font-size:20px;letter-spacing:.04em;}
      .lineup-overlay__subtitle{margin:0;font-size:13px;color:#9cbcd9;line-height:1.6;}
      .lineup-overlay__list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;max-height:360px;overflow:auto;}
      .lineup-overlay__option{padding:10px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.2);background:rgba(12,22,32,.82);display:flex;align-items:center;gap:10px;cursor:pointer;transition:transform .16s ease,border-color .16s ease;}
      .lineup-overlay__option:hover{transform:translateY(-1px);border-color:rgba(125,211,252,.42);background:rgba(16,28,40,.9);}
      .lineup-overlay__option:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
      .lineup-overlay__option-avatar{width:48px;height:48px;border-radius:14px;background:rgba(24,34,44,.82);display:flex;align-items:center;justify-content:center;color:#aee4ff;font-size:18px;overflow:hidden;}
      .lineup-overlay__option-name{margin:0;font-size:14px;color:#e6f2ff;}
      .lineup-overlay__option-meta{margin:0;font-size:12px;color:#9cbcd9;}
      @media(max-width:1080px){.lineup-view__layout{grid-template-columns:1fr;}.lineup-main-area{grid-template-columns:1fr;}.lineup-bench__content{grid-template-columns:1fr;}.lineup-leader{grid-template-columns:1fr;}.lineup-leader__badge{display:none;}}
      @media(max-width:720px){.lineup-view__title{font-size:30px;}.lineup-view__header{flex-direction:column;align-items:flex-start;}.lineup-main-area{gap:18px;}.lineup-bench__content{grid-template-columns:1fr;}.lineup-bench__grid{flex-wrap:wrap;}.lineup-slot__avatar{width:64px;height:64px;}.lineup-roster__list{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));}}
    `;

    if (style.textContent !== css){
      style.textContent = css;
    }
  }

  function cloneRoster(source){
    if (Array.isArray(source) && source.length > 0){
      return source.map(entry => ({ ...entry }));
    }
    return ROSTER.map(entry => ({ ...entry }));
  }

  function normalizeRosterEntry(entry, index){
    const id = entry.id || entry.key || `unit-${index}`;
    const name = entry.name || entry.title || `Nhân vật #${index + 1}`;
    const role = entry.class || entry.role || entry.archetype || '';
    const rank = entry.rank || entry.tier || '';
    const tags = Array.isArray(entry.tags)
      ? entry.tags.slice()
      : Array.isArray(entry.labels)
        ? entry.labels.slice()
        : [];
    const power = Number.isFinite(entry.power)
      ? entry.power
      : (Number.isFinite(entry.cp) ? entry.cp : null);
    const avatar = entry.avatar || entry.icon || entry.portrait || null;
    const passives = Array.isArray(entry.passives) ? entry.passives : [];
    return {
      id: String(id),
      name,
      role,
      rank,
      tags,
      power,
      avatar,
      passives,
      raw: entry
    };
  }

  function normalizeRoster(source){
    const cloned = cloneRoster(source);
    return cloned.map((entry, index) => normalizeRosterEntry(entry, index));
  }

  function normalizeAssignment(input, rosterIndex){
    if (!input){
      return { unitId: null, label: null };
    }
    if (typeof input === 'string'){
      const trimmed = input.trim();
      if (trimmed && rosterIndex.has(trimmed)){
        return { unitId: trimmed, label: null };
      }
      return { unitId: null, label: trimmed || null };
    }
    if (Array.isArray(input)){
      if (input.length >= 2 && typeof input[0] === 'string' && rosterIndex.has(input[0])){
        return { unitId: input[0], label: null };
      }
      if (input.length === 1){
        return normalizeAssignment(input[0], rosterIndex);
      }
    }
    if (typeof input === 'object'){
      const candidateId = input.unitId || input.id || input.key || null;
      const label = input.name || input.title || input.label || input.displayName || null;
      if (candidateId && rosterIndex.has(String(candidateId))){
        return { unitId: String(candidateId), label: label || null };
      }
      if (label){
        return { unitId: null, label };
      }
    }
    return { unitId: null, label: null };
  }

  function sanitizeCodeToken(token){
    if (!token){
      return '';
    }
    return token.replace(/[^A-Za-z0-9]/g, '');
  }

  function normalizeForCode(value){
    if (typeof value !== 'string'){
      return '';
    }
    const trimmed = value.trim();
    if (!trimmed){
      return '';
    }
    return trimmed.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  }

  function extractCodeFromNormalized(normalized){
    if (!normalized){
      return '';
    }
    const tokens = normalized.split(/[\s\-_/]+/).filter(Boolean);
    if (tokens.length >= 2){
      const firstToken = sanitizeCodeToken(tokens[0]);
      const lastToken = sanitizeCodeToken(tokens[tokens.length - 1]);
      let letters = '';
      if (firstToken){
        letters += firstToken[0];
      }
      if (lastToken){
        letters += lastToken[0];
      }
      if (tokens.length > 2 && letters.length < 3){
        const extraToken = sanitizeCodeToken(tokens[1]);
        if (extraToken){
          letters += extraToken[0];
        }
      }
      letters = letters.slice(0, 3);
      if (letters){
        return letters;
      }
    }
    const cleaned = sanitizeCodeToken(normalized);
    return cleaned.slice(0, 3);
  }

  function getUnitCode(unit, fallbackLabel){
    const nameSource = normalizeForCode(
      (typeof unit?.name === 'string' && unit.name.trim())
        ? unit.name
        : (typeof fallbackLabel === 'string' ? fallbackLabel : '')
    );
    let code = extractCodeFromNormalized(nameSource);
    if (!code){
      const fallbackId = normalizeForCode(unit?.id != null ? String(unit.id) : '');
      code = extractCodeFromNormalized(fallbackId);
    }
    return code ? code.toLocaleUpperCase('vi-VN') : '';
  }

  function normalizeCost(cost, fallbackCurrencyId){
    if (cost == null){
      return null;
    }
    if (Array.isArray(cost)){
      if (cost.length >= 2 && typeof cost[0] === 'string' && !Number.isNaN(Number(cost[1]))){
        const amount = Number(cost[1]);
        if (Number.isFinite(amount) && amount > 0){
          return { currencyId: cost[0], amount };
        }
      }
      if (cost.length === 1){
        return normalizeCost(cost[0], fallbackCurrencyId);
      }
    }
    if (typeof cost === 'number'){
      if (!Number.isFinite(cost) || cost <= 0){
        return null;
      }
      return { currencyId: fallbackCurrencyId || 'VNT', amount: cost };
    }
    if (typeof cost === 'string'){
      const parsed = Number(cost);
      if (!Number.isNaN(parsed) && parsed > 0){
        return { currencyId: fallbackCurrencyId || 'VNT', amount: parsed };
      }
      return { currencyId: cost, amount: 1 };
    }
    if (typeof cost === 'object'){
      const currencyId = cost.currencyId || cost.id || cost.type || cost.code || fallbackCurrencyId || 'VNT';
      const rawAmount = cost.amount ?? cost.value ?? cost.cost ?? cost.price ?? cost.count ?? null;
      const amount = Number(rawAmount);
      if (Number.isFinite(amount) && amount > 0){
        return { currencyId: String(currencyId), amount };
      }
      if (Array.isArray(cost.values) && cost.values.length >= 2){
        const [id, value] = cost.values;
        const candidateAmount = Number(value);
        if (Number.isFinite(candidateAmount) && candidateAmount > 0){
          return { currencyId: id || currencyId, amount: candidateAmount };
        }
      }
    }
    return null;
  }

  function normalizeLineupEntry(entry, index, rosterIndex){
    const id = entry?.id || entry?.key || `lineup-${index}`;
    const name = entry?.title || entry?.name || `Đội hình #${index + 1}`;
    const role = entry?.role || entry?.archetype || '';
    const description = entry?.description || entry?.summary || '';
    const rawSlots = Array.isArray(entry?.slots) ? entry.slots : [];
    const memberList = Array.isArray(entry?.members) ? entry.members : [];
    const defaultCurrencyId = entry?.unlockCurrency || entry?.currencyId || entry?.defaultCurrencyId || null;
    const slotCosts = Array.isArray(entry?.slotCosts) ? entry.slotCosts : null;
    const unlockCosts = Array.isArray(entry?.unlockCosts) ? entry.unlockCosts : slotCosts;
    let unlockedCount = Math.min(3, 5);
    if (Number.isFinite(entry?.initialUnlockedSlots)){
      unlockedCount = Math.max(0, Math.min(5, Number(entry.initialUnlockedSlots)));
    } else if (rawSlots.some(slot => slot && slot.unlocked === false)){
      unlockedCount = rawSlots.filter(slot => slot && slot.unlocked !== false).length;
    }
    const slots = new Array(5).fill(null).map((_, slotIndex) => {
      const source = rawSlots[slotIndex] ?? memberList[slotIndex] ?? null;
      const { unitId, label } = normalizeAssignment(source, rosterIndex);
      const slotUnlock = source && typeof source === 'object' && 'unlocked' in source ? source.unlocked : null;
      const unlocked = slotUnlock != null ? Boolean(slotUnlock) : slotIndex < unlockedCount;
      const costSource = source?.cost
        ?? source?.unlockCost
        ?? (Array.isArray(unlockCosts) ? unlockCosts[slotIndex] : null)
        ?? entry?.slotCost
        ?? entry?.unlockCost
        ?? null;
      const unlockCost = normalizeCost(costSource, defaultCurrencyId);
      return {
        index: slotIndex,
        unitId: unitId || null,
        label: label || null,
        unlocked,
        unlockCost,
        meta: source && typeof source === 'object' ? { ...source } : null
      };
    });

    const benchSource = Array.isArray(entry?.bench)
      ? entry.bench
      : Array.isArray(entry?.reserve)
        ? entry.reserve
        : Array.isArray(entry?.members)
          ? entry.members.slice(5)
          : [];
    const bench = new Array(10).fill(null).map((_, benchIndex) => {
      const source = benchSource[benchIndex] ?? null;
      const { unitId, label } = normalizeAssignment(source, rosterIndex);
      return {
        index: benchIndex,
        unitId: unitId || null,
        label: label || null,
        meta: source && typeof source === 'object' ? { ...source } : null
      };
    });

    const passiveSource = Array.isArray(entry?.passives)
      ? entry.passives
      : Array.isArray(entry?.passiveSlots)
        ? entry.passiveSlots
        : [];
    const passives = new Array(6).fill(null).map((_, passiveIndex) => {
      const source = passiveSource[passiveIndex] ?? null;
      if (!source){
        return {
          index: passiveIndex,
          id: `passive-${passiveIndex}`,
          name: 'Chưa thiết lập',
          description: '',
          requirement: '',
          requiredUnitIds: [],
          requiredTags: [],
          isEmpty: true,
          autoActive: false,
          source: null
        };
      }
      const id = source.id || source.key || `passive-${passiveIndex}`;
      const name = source.name || source.title || `Passive #${passiveIndex + 1}`;
      const description = source.description || source.effect || source.text || '';
      const requirement = source.requirement || source.condition || source.prerequisite || '';
      const requiredUnitIds = Array.isArray(source.requiredUnitIds)
        ? source.requiredUnitIds.map(String)
        : Array.isArray(source.requires)
          ? source.requires.filter(item => typeof item === 'string').map(String)
          : (typeof source.requiredUnitId === 'string' ? [source.requiredUnitId] : []);
      const requiredTags = Array.isArray(source.requiredTags)
        ? source.requiredTags.map(String)
        : Array.isArray(source.tagsRequired)
          ? source.tagsRequired.map(String)
          : [];
      const auto = source.autoActive === true || source.alwaysActive === true || source.isActive === true;
      return {
        index: passiveIndex,
        id,
        name,
        description,
        requirement: typeof requirement === 'string' ? requirement : '',
        requiredUnitIds,
        requiredTags,
        isEmpty: false,
        autoActive: Boolean(auto),
        source
      };
    });

    const leaderId = entry?.leaderId || entry?.leader || entry?.captainId || null;

    const fallbackLeader = slots.find(slot => slot.unitId)?.unitId || null;

    return {
      id: String(id),
      name,
      role,
      description,
      slots,
      bench,
      passives,
      leaderId: leaderId && rosterIndex.has(String(leaderId)) ? String(leaderId) : fallbackLeader,
      defaultCurrencyId: defaultCurrencyId || null
    };
  }

  function normalizeLineups(rawLineups, roster){
    const rosterIndex = new Set(roster.map(unit => unit.id));
    if (!Array.isArray(rawLineups) || rawLineups.length === 0){
      const slots = new Array(5).fill(null).map((_, index) => ({
        index,
        unitId: null,
        label: null,
        unlocked: index < 3,
        unlockCost: null,
        meta: null
      }));
      const bench = new Array(10).fill(null).map((_, index) => ({
        index,
        unitId: null,
        label: null,
        meta: null
      }));
      const passives = new Array(6).fill(null).map((_, index) => ({
        index,
        id: `passive-${index}`,
        name: 'Chưa thiết lập',
        description: '',
        requirement: '',
        requiredUnitIds: [],
        requiredTags: [],
        isEmpty: true,
        autoActive: false,
        source: null
      }));
      return [{
        id: 'lineup-default',
        name: 'Đội hình mẫu',
        role: '',
        description: 'Thiết lập đội hình gồm tối đa 5 vị trí chủ lực và 10 vị trí dự bị.',
        slots,
        bench,
        passives,
        leaderId: null,
        defaultCurrencyId: null
      }];
    }
    return rawLineups.map((entry, index) => normalizeLineupEntry(entry || {}, index, rosterIndex));
  }

  function extractCurrencyBalances(source){
    const balances = new Map();
    if (!source){
      return balances;
    }
    const apply = (id, value) => {
      if (!id) return;
      const amount = Number(value);
      if (!Number.isNaN(amount)){
        balances.set(String(id), amount);
      }
    };

    if (Array.isArray(source)){
      source.forEach(entry => {
        if (!entry) return;
        if (typeof entry === 'number'){ apply('VNT', entry); return; }
        if (typeof entry === 'string'){
          const [id, value] = entry.split(':');
          if (id && value){
            apply(id.trim(), Number(value));
          }
          return;
        }
        if (typeof entry === 'object'){
          const id = entry.currencyId || entry.id || entry.key || entry.type;
          const value = entry.balance ?? entry.amount ?? entry.value ?? entry.total ?? entry;
          apply(id, value);
        }
      });
      return balances;
    }

    if (typeof source === 'object'){
      Object.entries(source).forEach(([key, value]) => {
        if (value && typeof value === 'object' && ('balance' in value || 'amount' in value || 'value' in value || 'total' in value)){
          const id = value.currencyId || value.id || value.key || key;
          apply(id, value.balance ?? value.amount ?? value.value ?? value.total);
        } else {
          apply(key, value);
        }
      });
      if (source.balances && typeof source.balances === 'object'){
        Object.entries(source.balances).forEach(([key, value]) => apply(key, value));
      }
    }

    return balances;
  }

  function createCurrencyBalances(primary, secondary){
    const base = extractCurrencyBalances(primary);
    const override = extractCurrencyBalances(secondary);
    for (const [key, value] of override.entries()){
      base.set(key, value);
    }
    currencyCatalog.forEach(currency => {
      if (!base.has(currency.id)){
        base.set(currency.id, 0);
      }
    });
    return base;
  }
  function formatCurrencyBalance(amount, currencyId){
    const currency = currencyIndex.get(currencyId);
    const formatted = numberFormatter.format(Number.isFinite(amount) ? amount : 0);
    const suffix = currency?.suffix || currencyId || '';
    return suffix ? `${formatted} ${suffix}` : formatted;
  }

  function getInitials(name){
    if (!name) return '';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1){
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function collectAssignedUnitIds(lineup){
    const ids = new Set();
    lineup.slots.forEach(slot => {
      if (slot.unitId){
        ids.add(slot.unitId);
      }
    });
    lineup.bench.forEach(cell => {
      if (cell.unitId){
        ids.add(cell.unitId);
      }
    });
    if (lineup.leaderId){
      ids.add(lineup.leaderId);
    }
    return ids;
  }

  function evaluatePassive(passive, assignedUnitIds, rosterLookup){
    if (!passive || passive.isEmpty){
      return false;
    }
    if (passive.autoActive){
      return true;
    }
    if (passive.requiredUnitIds && passive.requiredUnitIds.length > 0){
      for (const required of passive.requiredUnitIds){
        if (!assignedUnitIds.has(required)){
          return false;
        }
      }
    }
    if (passive.requiredTags && passive.requiredTags.length > 0){
      const availableTags = new Set();
      assignedUnitIds.forEach(id => {
        const unit = rosterLookup.get(id);
        if (!unit) return;
        if (unit.role) availableTags.add(unit.role);
        if (unit.rank) availableTags.add(unit.rank);
        (unit.tags || []).forEach(tag => availableTags.add(tag));
      });
      const hasAllTags = passive.requiredTags.every(tag => availableTags.has(tag));
      if (!hasAllTags){
        return false;
      }
    }
    if (!passive.requiredUnitIds?.length && !passive.requiredTags?.length){
      return assignedUnitIds.size > 0;
    }
    return true;
  }

  function createOverlay(){
    const overlay = document.createElement('div');
    overlay.className = 'lineup-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="lineup-overlay__panel" role="document">
        <button type="button" class="lineup-overlay__close" aria-label="Đóng">Đóng</button>
        <div class="lineup-overlay__body"></div>
      </div>
    `;
    return overlay;
  }

  function renderAvatar(container, avatarUrl, name){
    container.innerHTML = '';
    if (avatarUrl){
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.alt = name || '';
      container.appendChild(img);
    } else {
      container.textContent = getInitials(name || '');
    }
  }

  function filterRoster(roster, filter){
    if (!filter || filter.type === 'all' || !filter.value){
      return roster;
    }
    const value = String(filter.value).toLowerCase();
    if (filter.type === 'class'){
      return roster.filter(unit => (unit.role || '').toLowerCase() === value);
    }
    if (filter.type === 'rank'){
      return roster.filter(unit => (unit.rank || '').toLowerCase() === value);
    }
    if (filter.type === 'tag'){
      return roster.filter(unit => unit.tags.some(tag => String(tag).toLowerCase() === value));
    }
    return roster;
  }

  function createFilterOptions(roster){
    const classes = new Set();
    const ranks = new Set();
    const tags = new Set();
    roster.forEach(unit => {
      if (unit.role) classes.add(unit.role);
      if (unit.rank) ranks.add(unit.rank);
      (unit.tags || []).forEach(tag => tags.add(tag));
    });
    return {
      classes: Array.from(classes),
      ranks: Array.from(ranks),
      tags: Array.from(tags)
    };
  }
  function removeUnitFromPlacements(lineup, unitId, options = {}){
    if (!unitId) return;
    const { keepLeader = false } = options;
    lineup.slots.forEach(slot => {
      if (slot.unitId === unitId){
        slot.unitId = null;
      }
    });
    lineup.bench.forEach(cell => {
      if (cell.unitId === unitId){
        cell.unitId = null;
      }
    });
    if (!keepLeader && lineup.leaderId === unitId){
      lineup.leaderId = null;
    }
  }

  function assignUnitToSlot(lineup, slotIndex, unitId){
    const slot = lineup.slots[slotIndex];
    if (!slot){
      return { ok: false, message: 'Không tìm thấy vị trí.' };
    }
    if (!slot.unlocked){
      return { ok: false, message: 'Vị trí đang bị khóa.' };
    }
    if (slot.unitId === unitId){
      return { ok: true };
    }
    removeUnitFromPlacements(lineup, unitId, { keepLeader: true });
    slot.unitId = unitId;
    slot.label = null;
    return { ok: true };
  }

  function assignUnitToBench(lineup, benchIndex, unitId){
    const cell = lineup.bench[benchIndex];
    if (!cell){
      return { ok: false, message: 'Không tìm thấy ô dự bị.' };
    }
    if (cell.unitId === unitId){
      return { ok: true };
    }
    removeUnitFromPlacements(lineup, unitId, { keepLeader: true });
    cell.unitId = unitId;
    cell.label = null;
    return { ok: true };
  }

  function removeUnitFromBench(lineup, benchIndex){
    const cell = lineup.bench[benchIndex];
    if (!cell) return;
    cell.unitId = null;
  }

  function isUnitPlaced(lineup, unitId){
    if (!unitId) return false;
    if (lineup.leaderId === unitId) return true;
    if (lineup.slots.some(slot => slot.unitId === unitId)) return true;
    if (lineup.bench.some(cell => cell.unitId === unitId)) return true;
    return false;
  }
  function renderLineupView(options = {}){
    const {
      root,
      shell,
      definition,
      description,
      lineups,
      roster,
      playerState,
      currencies
    } = options;

    if (!root){
      throw new Error('renderLineupView cần một phần tử root hợp lệ.');
    }

    ensureStyles();

    const normalizedRoster = normalizeRoster(roster);
    const normalizedLineups = normalizeLineups(lineups, normalizedRoster);
    const rosterLookup = new Map(normalizedRoster.map(unit => [unit.id, unit]));
    const lineupState = new Map();
    normalizedLineups.forEach(lineup => {
      lineupState.set(lineup.id, {
        ...lineup,
        slots: lineup.slots.map(slot => ({ ...slot })),
        bench: lineup.bench.map(cell => ({ ...cell })),
        passives: lineup.passives.map(passive => ({ ...passive })),
        leaderId: lineup.leaderId || null
      });
    });

    const playerCurrencies = playerState?.currencies || null;
    const currencyBalances = createCurrencyBalances(playerCurrencies, currencies);

    const state = {
      selectedLineupId: normalizedLineups[0]?.id || null,
      selectedUnitId: null,
      activeBenchIndex: null,
      filter: { type: 'all', value: null },
      message: '',
      messageType: 'info',
      currencyBalances,
      lineupState,
      roster: normalizedRoster,
      rosterLookup,
      filterOptions: createFilterOptions(normalizedRoster)
    };

    root.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'lineup-view';
    root.appendChild(container);

    const header = document.createElement('div');
    header.className = 'lineup-view__header';
    const titleGroup = document.createElement('div');
    titleGroup.className = 'lineup-view__title-group';
    const titleEl = document.createElement('h1');
    titleEl.className = 'lineup-view__title';
    titleEl.textContent = definition?.label || definition?.title || 'Đội hình';
    titleGroup.appendChild(titleEl);
    if (description){
      const subtitleEl = document.createElement('p');
      subtitleEl.className = 'lineup-view__subtitle';
      subtitleEl.textContent = description;
      titleGroup.appendChild(subtitleEl);
    }
    const messageEl = document.createElement('p');
    messageEl.className = 'lineup-view__message';
    titleGroup.appendChild(messageEl);
    header.appendChild(titleGroup);

    const actions = document.createElement('div');
    actions.className = 'lineup-view__actions';
    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'lineup-view__back';
    backButton.textContent = 'Quay lại menu chính';
    backButton.setAttribute('aria-label', 'Quay lại Main Menu');
    actions.appendChild(backButton);
    const walletEl = document.createElement('div');
    walletEl.className = 'lineup-view__wallet';
    actions.appendChild(walletEl);
    header.appendChild(actions);
    container.appendChild(header);

    const layout = document.createElement('div');
    layout.className = 'lineup-view__layout';
    container.appendChild(layout);

    const leaderSection = document.createElement('section');
    leaderSection.className = 'lineup-leader';
    const leaderBadge = document.createElement('span');
    leaderBadge.className = 'lineup-leader__badge';
    leaderBadge.textContent = 'Leader';
    leaderSection.appendChild(leaderBadge);
    const leaderMain = document.createElement('div');
    leaderMain.className = 'lineup-leader__main';
    const leaderAvatar = document.createElement('button');
    leaderAvatar.type = 'button';
    leaderAvatar.className = 'lineup-leader__avatar';
    leaderAvatar.setAttribute('aria-label', 'Chọn leader');
    leaderMain.appendChild(leaderAvatar);
    const leaderName = document.createElement('p');
    leaderName.className = 'lineup-leader__name';
    leaderMain.appendChild(leaderName);
    const leaderNote = document.createElement('p');
    leaderNote.className = 'lineup-leader__note';
    leaderNote.textContent = 'Leader cung cấp buff đội hình và quyết định lượt hành động đầu tiên.';
    leaderMain.appendChild(leaderNote);
    leaderSection.appendChild(leaderMain);
    const passiveGrid = document.createElement('div');
    passiveGrid.className = 'lineup-passives';
    leaderSection.appendChild(passiveGrid);
    layout.appendChild(leaderSection);

    const mainArea = document.createElement('div');
    mainArea.className = 'lineup-main-area';
    layout.appendChild(mainArea);

    const mainColumn = document.createElement('div');
    mainColumn.className = 'lineup-main';
    mainArea.appendChild(mainColumn);

    const benchSection = document.createElement('section');
    benchSection.className = 'lineup-bench';
    const benchTitle = document.createElement('p');
    benchTitle.className = 'lineup-bench__title';
    benchTitle.textContent = 'Đội hình';
    benchSection.appendChild(benchTitle);
    const benchContent = document.createElement('div');
    benchContent.className = 'lineup-bench__content';
    benchSection.appendChild(benchContent);
    const benchGrid = document.createElement('div');
    benchGrid.className = 'lineup-bench__grid';
    benchContent.appendChild(benchGrid);
    const benchDetails = document.createElement('aside');
    benchDetails.className = 'lineup-bench__details is-empty';
    benchContent.appendChild(benchDetails);

    function syncBenchDetailsHeight(){
      if (!benchDetails || !leaderSection || typeof leaderSection.getBoundingClientRect !== 'function'){
        benchDetails.style.maxHeight = '';
        return;
      }
      const rect = leaderSection.getBoundingClientRect();
      if (rect && Number.isFinite(rect.height)){
        benchDetails.style.maxHeight = `${rect.height}px`;
      } else {
        benchDetails.style.maxHeight = '';
      }
    }
    mainArea.appendChild(benchSection);

    const rosterSection = document.createElement('section');
    rosterSection.className = 'lineup-roster';
    const rosterFilters = document.createElement('div');
    rosterFilters.className = 'lineup-roster__filters';
    rosterSection.appendChild(rosterFilters);
    const rosterList = document.createElement('div');
    rosterList.className = 'lineup-roster__list';
    rosterSection.appendChild(rosterList);
    container.appendChild(rosterSection);

    const passiveOverlay = createOverlay();
    passiveOverlay.classList.add('lineup-overlay--passive');
    const passiveOverlayBody = passiveOverlay.querySelector('.lineup-overlay__body');
    const passiveClose = passiveOverlay.querySelector('.lineup-overlay__close');
    passiveOverlayBody.innerHTML = '';
    document.body.appendChild(passiveOverlay);

    const leaderOverlay = createOverlay();
    leaderOverlay.classList.add('lineup-overlay--leader');
    const leaderOverlayBody = leaderOverlay.querySelector('.lineup-overlay__body');
    const leaderClose = leaderOverlay.querySelector('.lineup-overlay__close');
    leaderOverlayBody.innerHTML = '';
    document.body.appendChild(leaderOverlay);

    let activeOverlay = null;

    function closeOverlay(target){
      if (!target) return;
      target.classList.remove('is-open');
      if (activeOverlay === target){
        activeOverlay = null;
      }
    }

    function openOverlay(target){
      if (!target) return;
      target.classList.add('is-open');
      activeOverlay = target;
    }
    function getSelectedLineup(){
      if (!state.selectedLineupId) return null;
      return state.lineupState.get(state.selectedLineupId) || null;
    }

    function setMessage(text, type = 'info'){
      state.message = text || '';
      state.messageType = type;
      messageEl.textContent = text || '';
      if (type === 'error'){
        messageEl.classList.add('is-error');
      } else {
        messageEl.classList.remove('is-error');
      }
    }

    function refreshWallet(){
      walletEl.innerHTML = '';
      for (const [currencyId, balance] of state.currencyBalances.entries()){
        const item = document.createElement('div');
        item.className = 'lineup-wallet__item';
        const name = document.createElement('p');
        name.className = 'lineup-wallet__name';
        const currency = currencyIndex.get(currencyId);
        name.textContent = currency?.name || currencyId;
        const value = document.createElement('p');
        value.className = 'lineup-wallet__balance';
        value.textContent = formatCurrencyBalance(balance, currencyId);
        item.appendChild(name);
        item.appendChild(value);
        walletEl.appendChild(item);
      }
    }

  function renderBenchDetails(){
      benchDetails.innerHTML = '';
      const lineup = getSelectedLineup();
      if (!lineup){
        benchDetails.classList.add('is-empty');
        const empty = document.createElement('p');
        empty.className = 'lineup-bench__details-empty';
        empty.textContent = 'Chưa có đội hình để hiển thị thông tin.';
        benchDetails.appendChild(empty);
        syncBenchDetailsHeight();
        return;
      }

      const index = Number.isFinite(state.activeBenchIndex) ? state.activeBenchIndex : null;
      if (index == null){
        benchDetails.classList.add('is-empty');
        const hint = document.createElement('p');
        hint.className = 'lineup-bench__details-empty';
        hint.textContent = 'Chọn một ô dự bị để xem mô tả kỹ năng.';
        benchDetails.appendChild(hint);
        syncBenchDetailsHeight();
        return;
      }

      const cell = lineup.bench[index];
      if (!cell){
        benchDetails.classList.add('is-empty');
        const missing = document.createElement('p');
        missing.className = 'lineup-bench__details-empty';
        missing.textContent = 'Không tìm thấy ô dự bị tương ứng.';
        benchDetails.appendChild(missing);
        syncBenchDetailsHeight();
        return;
      }

      const unit = cell.unitId ? rosterLookup.get(cell.unitId) : null;
      if (!unit){
        benchDetails.classList.add('is-empty');
        const empty = document.createElement('p');
        empty.className = 'lineup-bench__details-empty';
        empty.textContent = cell.label
          ? `Ô dự bị được ghi chú "${cell.label}".`
          : 'Ô dự bị hiện đang trống.';
        benchDetails.appendChild(empty);
        syncBenchDetailsHeight();
        return;
      }

      benchDetails.classList.remove('is-empty');

      const kit = unit.raw?.kit || null;
      const skillSet = unit.id ? getSkillSet(unit.id) : null;

      const skills = Array.isArray(kit?.skills)
        ? kit.skills
            .filter(skill => {
              const skillName = typeof skill?.name === 'string' ? skill.name.trim() : '';
              const skillKey = typeof skill?.key === 'string' ? skill.key.trim() : '';
              return skillName !== 'Đánh Thường' && skillKey !== 'Đánh Thường';
            })
            .slice(0, 3)
        : [];

      const kitUlt = kit?.ult || null;
      const skillSetUlt = skillSet?.ult || null;
      const hasUlt = Boolean(kitUlt || skillSetUlt);
      const ultName = hasUlt
        ? (kitUlt?.name || skillSetUlt?.name || kitUlt?.id || 'Chưa đặt tên')
        : null;

      if (!skills.length && !hasUlt){
        const fallback = document.createElement('p');
        fallback.className = 'lineup-bench__details-empty';
        fallback.textContent = 'Chưa có dữ liệu chi tiết cho nhân vật này.';
        benchDetails.appendChild(fallback);
      } else {
        if (skills.length){
          const skillSection = document.createElement('div');
          skillSection.className = 'lineup-bench__details-section';
          const heading = document.createElement('p');
          heading.className = 'lineup-bench__details-heading';
          heading.textContent = 'Kỹ năng';
          skillSection.appendChild(heading);
          const list = document.createElement('ul');
          list.className = 'lineup-bench__details-list';
          skills.forEach((skill, idx) => {
            const item = document.createElement('li');
            const name = skill?.name || skill?.key || `Kỹ năng #${idx + 1}`;
            item.textContent = name;
            list.appendChild(item);
          });
          skillSection.appendChild(list);
          benchDetails.appendChild(skillSection);
        }

        if (hasUlt){
          const ultSection = document.createElement('div');
          ultSection.className = 'lineup-bench__details-section';
          const heading = document.createElement('p');
          heading.className = 'lineup-bench__details-heading';
          heading.textContent = 'Tuyệt kỹ';
          ultSection.appendChild(heading);
          const text = document.createElement('p');
          text.className = 'lineup-bench__details-text';
          text.textContent = ultName;
          ultSection.appendChild(text);
          benchDetails.appendChild(ultSection);
        }
      }
      
      syncBenchDetailsHeight();
    }

    function updateActiveBenchHighlight(){
      const cells = benchGrid.querySelectorAll('.lineup-bench__cell');
      cells.forEach(cell => {
        const idx = Number(cell.dataset.benchIndex);
        if (Number.isFinite(idx) && idx === state.activeBenchIndex){
          cell.classList.add('is-active');
        } else {
          cell.classList.remove('is-active');
        }
      });
    }

    function renderBench(){
      const lineup = getSelectedLineup();
      benchGrid.innerHTML = '';
      if (!lineup){
        state.activeBenchIndex = null;
        renderBenchDetails();
        return;
      }

      if (!Number.isInteger(state.activeBenchIndex) || !lineup.bench[state.activeBenchIndex]){
        state.activeBenchIndex = null;
      }
      
      const columnCount = 5;
      const columnEls = Array.from({ length: columnCount }, (_, idx) => {
        const columnEl = document.createElement('div');
        columnEl.className = 'lineup-bench__column';
        benchGrid.appendChild(columnEl);
        return columnEl;
      });

      lineup.bench.forEach(cell => {
        const cellEl = document.createElement('button');
        cellEl.type = 'button';
        cellEl.className = 'lineup-bench__cell';
        cellEl.dataset.benchIndex = String(cell.index);
        const unit = cell.unitId ? rosterLookup.get(cell.unitId) : null;
        const hasContent = Boolean(cell.unitId || cell.label);
        if (!hasContent){
          cellEl.classList.add('is-empty');
        }
        const displayName = unit?.name || cell.label || '';
        let ariaLabel = `Ô dự bị ${cell.index + 1}`;
        if (displayName){
          ariaLabel += `: ${displayName}`;
          if (cell.unitId){
            ariaLabel += '. Giữ Alt và click để gỡ.';
          }
        }
        cellEl.setAttribute('aria-label', ariaLabel);
        if (displayName){
          cellEl.title = cell.unitId
            ? `${displayName} — giữ Alt và click để gỡ.`
            : displayName;
        } else {
          cellEl.removeAttribute('title');
        }
        const codeText = (!cell.unitId && hasContent)
          ? getUnitCode(unit, cell.label || '')
          : '';
        const avatarEl = document.createElement('div');
        avatarEl.className = 'lineup-bench__avatar';
        const avatarSource = unit?.avatar || cell.meta?.avatar || null;
        const avatarLabel = unit?.name || cell.label || '';
        renderAvatar(avatarEl, avatarSource, avatarLabel);
        if (codeText){
          const codeEl = document.createElement('span');
          codeEl.className = 'lineup-bench__cell-code';
          codeEl.textContent = codeText;
          cellEl.appendChild(codeEl);
        }
        cellEl.appendChild(avatarEl);
        if (state.activeBenchIndex === cell.index){
          cellEl.classList.add('is-active');
        }
        const columnIndex = cell.index % columnCount;
        const targetColumn = columnEls[columnIndex] || columnEls[0];
        targetColumn.appendChild(cellEl);
      });
      
      updateActiveBenchHighlight();
      renderBenchDetails();
    }

    function renderLeader(){
      const lineup = getSelectedLineup();
      if (!lineup){
        renderAvatar(leaderAvatar, null, '');
        leaderName.textContent = 'Chưa chọn leader';
        syncBenchDetailsHeight();
        return;
      }
      if (lineup.leaderId){
        const unit = rosterLookup.get(lineup.leaderId);
        renderAvatar(leaderAvatar, unit?.avatar || null, unit?.name || '');
        leaderName.textContent = unit?.name || 'Leader';
      } else {
        renderAvatar(leaderAvatar, null, '');
        leaderName.textContent = 'Chưa chọn leader';
      }
      syncBenchDetailsHeight();
    }

    function renderPassives(){
      const lineup = getSelectedLineup();
      passiveGrid.innerHTML = '';
      if (!lineup){
        return;
      }
      const assignedIds = collectAssignedUnitIds(lineup);
      lineup.passives.forEach(passive => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lineup-passive';
        btn.dataset.passiveIndex = String(passive.index);
        btn.setAttribute('aria-label', passive.isEmpty ? 'Ô passive trống' : `Xem passive ${passive.name}`);
        if (passive.isEmpty){
          btn.classList.add('is-empty');
          btn.disabled = true;
        }
        if (evaluatePassive(passive, assignedIds, rosterLookup)){
          btn.classList.add('is-active');
        }
        const title = document.createElement('p');
        title.className = 'lineup-passive__title';
        title.textContent = passive.name;
        btn.appendChild(title);
        if (!passive.isEmpty){
          const condition = document.createElement('p');
          condition.className = 'lineup-passive__condition';
          condition.textContent = passive.requirement || 'Chạm để xem chi tiết.';
          btn.appendChild(condition);
        }
        passiveGrid.appendChild(btn);
      });
    }

    function renderFilters(){
      rosterFilters.innerHTML = '';
      const filters = [
        { type: 'all', value: null, label: 'Tất cả' },
        ...state.filterOptions.classes.map(value => ({ type: 'class', value, label: value })),
        ...state.filterOptions.ranks.map(value => ({ type: 'rank', value, label: value }))
      ];
      filters.forEach(filter => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'lineup-roster__filter';
        button.dataset.filterType = filter.type;
        if (filter.value != null){
          button.dataset.filterValue = filter.value;
        }
        button.textContent = filter.label;
        if (state.filter.type === filter.type && (state.filter.value || null) === (filter.value || null)){
          button.classList.add('is-active');
        }
        rosterFilters.appendChild(button);
      });
    }

    function renderRoster(){
      rosterList.innerHTML = '';
      const lineup = getSelectedLineup();
      const filtered = filterRoster(state.roster, state.filter);
      filtered.forEach(unit => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'lineup-roster__entry';
        button.dataset.unitId = unit.id;
        button.setAttribute('aria-label', `Chọn ${unit.name}`);
        if (state.selectedUnitId === unit.id){
          button.classList.add('is-selected');
        }
        if (lineup && isUnitPlaced(lineup, unit.id) && state.selectedUnitId !== unit.id){
          button.classList.add('is-unavailable');
        }
        const avatar = document.createElement('div');
        avatar.className = 'lineup-roster__avatar';
        renderAvatar(avatar, unit.avatar || null, unit.name);
        button.appendChild(avatar);
        const meta = document.createElement('div');
        meta.className = 'lineup-roster__meta';
        const name = document.createElement('p');
        name.className = 'lineup-roster__name';
        name.textContent = unit.name;
        meta.appendChild(name);
        if (unit.role || unit.rank){
          const tag = document.createElement('p');
          tag.className = 'lineup-roster__tag';
          tag.textContent = [unit.role, unit.rank].filter(Boolean).join(' · ');
          meta.appendChild(tag);
        }
        if (unit.power != null){
          const extra = document.createElement('p');
          extra.className = 'lineup-roster__extra';
          extra.textContent = `Chiến lực ${numberFormatter.format(unit.power)}`;
          meta.appendChild(extra);
        }
        button.appendChild(meta);
        rosterList.appendChild(button);
      });
    }

    function openPassiveDetails(passive){
      if (!passive || passive.isEmpty) return;
      passiveOverlayBody.innerHTML = '';
      const title = document.createElement('h3');
      title.className = 'lineup-overlay__title';
      title.textContent = passive.name;
      passiveOverlayBody.appendChild(title);
      const subtitle = document.createElement('p');
      subtitle.className = 'lineup-overlay__subtitle';
      subtitle.textContent = passive.description || 'Chưa có mô tả chi tiết.';
      passiveOverlayBody.appendChild(subtitle);
      if (passive.requirement){
        const requirement = document.createElement('p');
        requirement.className = 'lineup-overlay__subtitle';
        requirement.textContent = `Điều kiện: ${passive.requirement}`;
        passiveOverlayBody.appendChild(requirement);
      }
      if (passive.requiredUnitIds?.length){
        const units = passive.requiredUnitIds
          .map(id => rosterLookup.get(id)?.name || id)
          .join(', ');
        const reqUnits = document.createElement('p');
        reqUnits.className = 'lineup-overlay__subtitle';
        reqUnits.textContent = `Yêu cầu nhân vật: ${units}`;
        passiveOverlayBody.appendChild(reqUnits);
      }
      if (passive.requiredTags?.length){
        const tags = passive.requiredTags.join(', ');
        const reqTags = document.createElement('p');
        reqTags.className = 'lineup-overlay__subtitle';
        reqTags.textContent = `Yêu cầu tag: ${tags}`;
        passiveOverlayBody.appendChild(reqTags);
      }
      openOverlay(passiveOverlay);
      passiveClose.focus();
    }

    function openLeaderPicker(){
      const lineup = getSelectedLineup();
      if (!lineup) return;
      leaderOverlayBody.innerHTML = '';
      const title = document.createElement('h3');
      title.className = 'lineup-overlay__title';
      title.textContent = 'Chọn leader';
      leaderOverlayBody.appendChild(title);
      const subtitle = document.createElement('p');
      subtitle.className = 'lineup-overlay__subtitle';
      subtitle.textContent = 'Chỉ định leader sẽ kích hoạt buff đội hình và ưu tiên lượt đánh đầu.';
      leaderOverlayBody.appendChild(subtitle);
      const list = document.createElement('div');
      list.className = 'lineup-overlay__list';

      const clearOption = document.createElement('button');
      clearOption.type = 'button';
      clearOption.className = 'lineup-overlay__option';
      clearOption.textContent = 'Bỏ chọn leader';
      clearOption.dataset.unitId = '';
      list.appendChild(clearOption);

      state.roster.forEach(unit => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'lineup-overlay__option';
        option.dataset.unitId = unit.id;
        const avatar = document.createElement('div');
        avatar.className = 'lineup-overlay__option-avatar';
        renderAvatar(avatar, unit.avatar || null, unit.name);
        option.appendChild(avatar);
        const text = document.createElement('div');
        const name = document.createElement('p');
        name.className = 'lineup-overlay__option-name';
        name.textContent = unit.name;
        text.appendChild(name);
        const meta = document.createElement('p');
        meta.className = 'lineup-overlay__option-meta';
        meta.textContent = [unit.role, unit.rank].filter(Boolean).join(' · ');
        text.appendChild(meta);
        option.appendChild(text);
        if (lineup.leaderId === unit.id){
          option.classList.add('is-active');
        }
        list.appendChild(option);
      });

      leaderOverlayBody.appendChild(list);
      openOverlay(leaderOverlay);
      leaderClose.focus();
    }

    function setLeader(lineup, unitId){
      if (!lineup){
        return { ok: false, message: 'Không tìm thấy đội hình.' };
      }
      if (!unitId){
        lineup.leaderId = null;
        return { ok: true };
      }
      const unit = rosterLookup.get(unitId);
      if (!unit){
        return { ok: false, message: 'Không tìm thấy nhân vật.' };
      }
      if (!isUnitPlaced(lineup, unitId)){
        const slot = lineup.slots.find(entry => entry.unlocked && !entry.unitId);
        if (slot){
          assignUnitToSlot(lineup, slot.index, unitId);
        } else {
          const bench = lineup.bench.find(entry => !entry.unitId);
          if (bench){
            assignUnitToBench(lineup, bench.index, unitId);
          } else {
            return { ok: false, message: 'Không còn vị trí trống để gán leader.' };
          }
        }
      }
      lineup.leaderId = unitId;
      return { ok: true };
    }

    function handleBenchInteraction(event){
      const benchEl = event.target.closest('.lineup-bench__cell');
      if (!benchEl) return;
      const lineup = getSelectedLineup();
      if (!lineup) return;
      const benchIndex = Number(benchEl.dataset.benchIndex);
      if (!Number.isFinite(benchIndex)) return;
      const cell = lineup.bench[benchIndex];
      if (!cell) return;

      if (state.selectedUnitId){
        const result = assignUnitToBench(lineup, benchIndex, state.selectedUnitId);
        if (!result.ok){
          setMessage(result.message || 'Không thể gán nhân vật.', 'error');
        } else {
          setMessage('Đã thêm nhân vật vào dự bị.', 'info');
        }
        renderBench();
        renderLeader();
        renderPassives();
        renderRoster();
        return;
      }

      if (event.altKey || event.ctrlKey || event.metaKey){
        if (cell.unitId){
          removeUnitFromBench(lineup, benchIndex);
          state.activeBenchIndex = benchIndex;
          renderBench();
          renderPassives();
          renderRoster();
          renderLeader();
          setMessage('Đã bỏ nhân vật khỏi dự bị.', 'info');
        }
        return;
      }
     
      state.activeBenchIndex = benchIndex;
      updateActiveBenchHighlight();
      renderBenchDetails();
    }

    function handleBenchFocus(event){
      const benchEl = event.target.closest('.lineup-bench__cell');
      if (!benchEl) return;
      const lineup = getSelectedLineup();
      if (!lineup) return;
      const benchIndex = Number(benchEl.dataset.benchIndex);
      if (!Number.isFinite(benchIndex)) return;
      if (state.activeBenchIndex === benchIndex) return;
      state.activeBenchIndex = benchIndex;
      updateActiveBenchHighlight();
      renderBenchDetails();
    }

    function handlePassiveClick(event){
      const btn = event.target.closest('.lineup-passive');
      if (!btn) return;
      const lineup = getSelectedLineup();
      if (!lineup) return;
      const index = Number(btn.dataset.passiveIndex);
      if (!Number.isFinite(index)) return;
      const passive = lineup.passives[index];
      if (!passive || passive.isEmpty) return;
      openPassiveDetails(passive);
    }

    function handleRosterFilter(event){
      const button = event.target.closest('.lineup-roster__filter');
      if (!button) return;
      const type = button.dataset.filterType || 'all';
      const value = button.dataset.filterValue ?? null;
      state.filter = { type, value };
      renderFilters();
      renderRoster();
    }

    function handleRosterSelect(event){
      const entry = event.target.closest('.lineup-roster__entry');
      if (!entry) return;
      const unitId = entry.dataset.unitId;
      if (!unitId) return;
      if (state.selectedUnitId === unitId){
        state.selectedUnitId = null;
        setMessage('Đã bỏ chọn nhân vật.', 'info');
      } else {
        state.selectedUnitId = unitId;
        const unit = rosterLookup.get(unitId);
        setMessage(`Đã chọn ${unit?.name || 'nhân vật'}. Chạm ô dự bị hoặc leader để gán.`, 'info');
      }
      renderRoster();
    }

    function handleLeaderOption(event){
      const option = event.target.closest('.lineup-overlay__option');
      if (!option) return;
      const lineup = getSelectedLineup();
      if (!lineup) return;
      const unitId = option.dataset.unitId || null;
      const result = setLeader(lineup, unitId || null);
      if (!result.ok){
        setMessage(result.message || 'Không thể đặt leader.', 'error');
      } else {
        if (unitId){
          const unit = rosterLookup.get(unitId);
          setMessage(`Đã chọn ${unit?.name || 'leader'}.`, 'info');
        } else {
          setMessage('Đã bỏ chọn leader.', 'info');
        }
      }
      renderLeader();
      renderBench();
      renderPassives();
      renderRoster();
      closeOverlay(leaderOverlay);
    }

    function handleGlobalKey(event){
      if (event.key === 'Escape' && activeOverlay){
        closeOverlay(activeOverlay);
      }
    }
    const cleanup = [];

  let leaderObserver = null;
    if (typeof ResizeObserver === 'function'){
      leaderObserver = new ResizeObserver(() => {
        syncBenchDetailsHeight();
      });
      leaderObserver.observe(leaderSection);
      cleanup.push(() => {
        if (leaderObserver){
          leaderObserver.disconnect();
        }
      });
    }

    const handleWindowResize = () => syncBenchDetailsHeight();
    if (typeof window !== 'undefined'){
      window.addEventListener('resize', handleWindowResize);
      cleanup.push(() => window.removeEventListener('resize', handleWindowResize));
    }

    const handleBack = () => {
      if (shell && typeof shell.enterScreen === 'function'){
        shell.enterScreen('main-menu');
      }
    };
    backButton.addEventListener('click', handleBack);
    cleanup.push(() => backButton.removeEventListener('click', handleBack));

    benchGrid.addEventListener('click', handleBenchInteraction);
    cleanup.push(() => benchGrid.removeEventListener('click', handleBenchInteraction));
    benchGrid.addEventListener('focusin', handleBenchFocus);
    cleanup.push(() => benchGrid.removeEventListener('focusin', handleBenchFocus));
    benchGrid.addEventListener('mouseenter', handleBenchFocus, true);
    cleanup.push(() => benchGrid.removeEventListener('mouseenter', handleBenchFocus, true));

    passiveGrid.addEventListener('click', handlePassiveClick);
    cleanup.push(() => passiveGrid.removeEventListener('click', handlePassiveClick));

    rosterFilters.addEventListener('click', handleRosterFilter);
    cleanup.push(() => rosterFilters.removeEventListener('click', handleRosterFilter));

    rosterList.addEventListener('click', handleRosterSelect);
    cleanup.push(() => rosterList.removeEventListener('click', handleRosterSelect));

    const handleLeaderOpen = () => openLeaderPicker();
    leaderAvatar.addEventListener('click', handleLeaderOpen);
    cleanup.push(() => leaderAvatar.removeEventListener('click', handleLeaderOpen));

    const handlePassiveClose = () => closeOverlay(passiveOverlay);
    passiveClose.addEventListener('click', handlePassiveClose);
    cleanup.push(() => passiveClose.removeEventListener('click', handlePassiveClose));

    const handleLeaderClose = () => closeOverlay(leaderOverlay);
    leaderClose.addEventListener('click', handleLeaderClose);
    cleanup.push(() => leaderClose.removeEventListener('click', handleLeaderClose));

    const handlePassiveOverlayClick = event => {
      if (event.target === passiveOverlay){
        closeOverlay(passiveOverlay);
      }
    };
    passiveOverlay.addEventListener('click', handlePassiveOverlayClick);
    cleanup.push(() => passiveOverlay.removeEventListener('click', handlePassiveOverlayClick));

    const handleLeaderOverlayClick = event => {
      if (event.target === leaderOverlay){
        closeOverlay(leaderOverlay);
      }
    };
    leaderOverlay.addEventListener('click', handleLeaderOverlayClick);
    cleanup.push(() => leaderOverlay.removeEventListener('click', handleLeaderOverlayClick));

    leaderOverlayBody.addEventListener('click', handleLeaderOption);
    cleanup.push(() => leaderOverlayBody.removeEventListener('click', handleLeaderOption));

    document.addEventListener('keydown', handleGlobalKey);
    cleanup.push(() => document.removeEventListener('keydown', handleGlobalKey));

    refreshWallet();
    renderBench();
    renderLeader();
    renderPassives();
    renderFilters();
    renderRoster();
    setMessage('Chọn nhân vật từ danh sách để xây dựng đội hình.');

    cleanup.push(() => passiveOverlay.remove());
    cleanup.push(() => leaderOverlay.remove());

    return {
      destroy(){
        while (cleanup.length > 0){
          const fn = cleanup.pop();
          try {
            if (typeof fn === 'function'){
              fn();
            }
          } catch (error) {
            console.error('[lineup] destroy error', error);
          }
        }
      }
    };
  }

  const __defaultExport = { renderLineupView };
  exports.renderLineupView = renderLineupView;
  exports.default = __defaultExport;
  module.exports.default = exports.default;
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
  const __dep1 = __require('./data/announcements.js');
  const getAllSidebarAnnouncements = __dep1.getAllSidebarAnnouncements;

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
      .sidebar-slot__reward{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#ffe066;}
      .sidebar-slot:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:4px;}
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

  function createSidebar(options = {}){
    const { shell, addCleanup } = options;
    const aside = document.createElement('aside');
    aside.className = 'main-menu-sidebar';
    const announcements = getAllSidebarAnnouncements();

    const attachTooltipHandlers = (element, info) => {
      if (!element) return;
      const { slotKey, entry } = info || {};
      if (!slotKey || !entry) return;
      if (!shell || typeof shell.showTooltip !== 'function') return;
      const showTooltip = () => {
        shell.showTooltip({
          id: entry.id,
          slot: slotKey,
          title: entry.title,
          description: entry.tooltip,
          reward: entry.rewardCallout,
          translationKey: entry.translationKey || null,
          startAt: entry.startAt || null,
          endAt: entry.endAt || null
        });
      };
      const hideTooltip = () => {
        if (typeof shell.hideTooltip === 'function'){
          shell.hideTooltip({ id: entry.id, slot: slotKey });
        }
      };

      element.addEventListener('mouseenter', showTooltip);
      element.addEventListener('mouseleave', hideTooltip);
      element.addEventListener('focus', showTooltip);
      element.addEventListener('blur', hideTooltip);

      if (typeof addCleanup === 'function'){
        addCleanup(() => {
          element.removeEventListener('mouseenter', showTooltip);
          element.removeEventListener('mouseleave', hideTooltip);
          element.removeEventListener('focus', showTooltip);
          element.removeEventListener('blur', hideTooltip);
        });
      }
    };

      announcements.forEach(item => {
      const { key, label, entry } = item;
      if (!entry) return;
      const card = document.createElement('div');
      card.className = 'sidebar-slot';
      card.dataset.slot = key;
      if (entry.id) card.dataset.entryId = entry.id;
      if (entry.translationKey) card.dataset.translationKey = entry.translationKey;
      if (entry.startAt) card.dataset.startAt = entry.startAt;
      if (entry.endAt) card.dataset.endAt = entry.endAt;
      card.tabIndex = 0;

      const labelEl = document.createElement('span');
      labelEl.className = 'sidebar-slot__label';
      labelEl.textContent = label;

      const titleEl = document.createElement('h4');
      titleEl.className = 'sidebar-slot__title';
      titleEl.textContent = entry.title;

      const descEl = document.createElement('p');
      descEl.className = 'sidebar-slot__desc';
      descEl.textContent = entry.shortDescription;

      card.appendChild(labelEl);
      card.appendChild(titleEl);
      card.appendChild(descEl);

      if (entry.rewardCallout){
        const rewardEl = document.createElement('span');
        rewardEl.className = 'sidebar-slot__reward';
        rewardEl.textContent = entry.rewardCallout;
        card.appendChild(rewardEl);
      }

      const tooltipText = [entry.tooltip, entry.rewardCallout].filter(Boolean).join('\n\n');
      const hasCustomTooltip = Boolean(shell && typeof shell.showTooltip === 'function');
      if (tooltipText && !hasCustomTooltip){
        card.setAttribute('title', tooltipText);
      } else {
        card.removeAttribute('title');
      }

      attachTooltipHandlers(card, { slotKey: key, entry });
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

    const sidebar = createSidebar({ shell, addCleanup });

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
  const __dep0 = __require('./utils/fury.js');
  const gainFury = __dep0.gainFury;
  const finishFuryHit = __dep0.finishFuryHit;
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
        if (back > 0){
          gainFury(attacker, {
            type: 'damageTaken',
            dealt: back,
            selfMaxHp: Number.isFinite(attacker?.hpMax) ? attacker.hpMax : undefined,
            damageTaken: back
          });
          finishFuryHit(attacker);
        }
        // không phản khi stealth target đang miễn sát thương (dealt=0 thì như nhau)
      }

      // 16) Độc (venom): khi attacker có hiệu ứng, mỗi đòn sẽ gây thêm n% sát thương đã gây ra
      const venom = this.get(attacker, 'venom');
      if (venom && dealt > 0){
        const extra = Math.round(dealt * clamp01(venom.power ?? 0));
        target.hp = Math.max(0, target.hp - extra);
        if (extra > 0){
          gainFury(target, {
            type: 'damageTaken',
            dealt: extra,
            selfMaxHp: Number.isFinite(target?.hpMax) ? target.hpMax : undefined,
            damageTaken: extra
          });
          finishFuryHit(target);
        }
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

  exports.Statuses = Statuses;
  exports.hookOnLethalDamage = hookOnLethalDamage;
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
  const __dep3 = __require('./utils/kit.js');
  const kitSupportsSummon = __dep3.kitSupportsSummon;
  const __dep4 = __require('./passives.js');
  const prepareUnitForPassives = __dep4.prepareUnitForPassives;
  const applyOnSpawnEffects = __dep4.applyOnSpawnEffects;
  // local helper
  const tokensAlive = (Game) => Game.tokens.filter(t => t.alive);

  // en-queue các yêu cầu “Immediate” trong lúc 1 unit đang hành động
  // req: { by?:unitId, side:'ally'|'enemy', slot:1..9, unit:{...} }
  function enqueueImmediate(Game, req){
    if (req.by){
      const mm = Game.meta.get(req.by);
      const ok = !!(mm && mm.class === 'Summoner' && kitSupportsSummon(mm));
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
  // trả về slot lớn nhất đã hành động trong chain để tiện logging
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
      if (spawned){
        const meta = (extra.id && Game.meta && typeof Game.meta.get === 'function') ? Game.meta.get(extra.id) : null;
        const kit = meta?.kit;
        prepareUnitForPassives(spawned);
        applyOnSpawnEffects(Game, spawned, kit?.onSpawn);
      }
      spawned.iid = (hooks.allocIid?.()) ?? (spawned.iid || 0);

      // creep hành động NGAY trong chain (1 lượt), chỉ basic theo spec creep cơ bản
      // (nếu về sau cần hạn chế further — thêm flags trong meta.creep)
      // gọi lại doActionOrSkip để dùng chung status/ult-guard (creep thường không có ult)
      const creep = Game.tokens.find(t => t.alive && t.side===side && t.cx===cx && t.cy===cy);
      if (creep){
        const turnContext = {
          side,
          slot: item.slot,
          orderIndex: hooks.getTurnOrderIndex?.(Game, side, item.slot) ?? -1,
          orderLength: Array.isArray(Game.turn?.order) ? Game.turn.order.length : null,
          cycle: Game.turn?.cycle ?? 0
        };
        hooks.doActionOrSkip?.(Game, creep, { performUlt: hooks.performUlt, turnContext });
      }

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
  const vfxAddBloodPulse = __dep5.vfxAddBloodPulse;
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
  const TURN_REGEN = __dep8.TURN_REGEN;
  const __dep9 = __require('./utils/time.js');
  const safeNow = __dep9.safeNow;
  const __dep10 = __require('./utils/fury.js');
  const initializeFury = __dep10.initializeFury;
  const startFuryTurn = __dep10.startFuryTurn;
  const spendFury = __dep10.spendFury;
  const resolveUltCost = __dep10.resolveUltCost;
  const setFury = __dep10.setFury;
  const clearFreshSummon = __dep10.clearFreshSummon;
  const __dep11 = __require('./turns/interleaved.js');
  const nextTurnInterleaved = __dep11.nextTurnInterleaved;

  // local helper
  const tokensAlive = (Game) => Game.tokens.filter(t => t.alive);

  function applyTurnRegen(Game, unit){
    if (!unit || !unit.alive) return { hpDelta: 0, aeDelta: 0 };

    const clampStat = (value, max) => {
      if (!Number.isFinite(max)){
        return Math.max(0, value);
      }
      const upper = Math.max(0, max);
      return Math.max(0, Math.min(upper, value));
    };

    let hpDelta = 0;
    if (Number.isFinite(unit.hp) || Number.isFinite(unit.hpMax) || Number.isFinite(unit.hpRegen)){
      const currentHp = Number.isFinite(unit.hp) ? unit.hp : 0;
      const regenHp = Number.isFinite(unit.hpRegen) ? unit.hpRegen : 0;
      const afterHp = clampStat(currentHp + regenHp, unit.hpMax);
      hpDelta = afterHp - currentHp;
      unit.hp = afterHp;
    }

    let aeDelta = 0;
    if (Number.isFinite(unit.ae) || Number.isFinite(unit.aeMax) || Number.isFinite(unit.aeRegen)){
      const currentAe = Number.isFinite(unit.ae) ? unit.ae : 0;
      const regenAe = Number.isFinite(unit.aeRegen) ? unit.aeRegen : 0;
      const afterAe = clampStat(currentAe + regenAe, unit.aeMax);
      aeDelta = afterAe - currentAe;
      unit.ae = afterAe;
    }

    if (hpDelta !== 0 || aeDelta !== 0){
      emitGameEvent(TURN_REGEN, { game: Game, unit, hpDelta, aeDelta });
      if (hpDelta > 0){
        try {
          vfxAddBloodPulse(Game, unit, { color: '#7ef7c1', alpha: 0.65, maxScale: 2.4 });
        } catch (_) {}
      }
    }

    return { hpDelta, aeDelta };
  }

  // --- Active/Spawn helpers (từ main.js) ---
  const keyOf = (side, slot) => `${side}:${slot}`;

  function getActiveAt(Game, side, slot){
    const { cx, cy } = slotToCell(side, slot);
    return Game.tokens.find(t => t.side===side && t.cx===cx && t.cy===cy && t.alive);
  }

  function getTurnOrderIndex(Game, side, slot){
    const turn = Game?.turn;
    if (!turn) return -1;
    const key = keyOf(side, slot);
    if (turn.orderIndex instanceof Map && turn.orderIndex.has(key)){
      const v = turn.orderIndex.get(key);
      return typeof v === 'number' ? v : -1;
    }
    const order = Array.isArray(turn.order) ? turn.order : [];
    const idx = order.findIndex(entry => entry && entry.side === side && entry.slot === slot);
    if (turn.orderIndex instanceof Map && !turn.orderIndex.has(key) && idx >= 0){
      turn.orderIndex.set(key, idx);
    }
    return idx;
  }

  function predictSpawnCycle(Game, side, slot){
    const turn = Game?.turn;
    if (!turn) return 0;
    const order = Array.isArray(turn.order) ? turn.order : [];
    const orderLen = order.length;
    const currentCycle = turn.cycle ?? 0;
    if (!orderLen) return currentCycle + 1;
    const idx = getTurnOrderIndex(Game, side, slot);
    if (idx < 0) return currentCycle + 1;
    const cursorRaw = Number.isFinite(turn.cursor) ? turn.cursor : 0;
    const cursor = Math.max(0, Math.min(orderLen - 1, cursorRaw));
    return idx >= cursor ? currentCycle : currentCycle + 1;
  }

  function spawnQueuedIfDue(Game, entry, { allocIid, performUlt } = {}){
    if (!entry) return { actor: null, spawned: false };
    const side = entry.side;
    const slot = entry.slot;
    const active = getActiveAt(Game, side, slot);
    const m = Game.queued?.[side];
    const p = m && m.get(slot);
    if (!p){
      return { actor: active || null, spawned: false };
    }
    if ((p.spawnCycle ?? 0) > (Game?.turn?.cycle ?? 0)){
      return { actor: active || null, spawned: false };
    }

    m.delete(slot);

    const meta = Game.meta && typeof Game.meta.get === 'function' ? Game.meta.get(p.unitId) : null;
    const source = p.source || null;
    const fromDeck = source === 'deck';
    const kit = meta?.kit;
    const initialFury = initialRageFor(p.unitId, { isLeader:false, revive: !!p.revive, reviveSpec: p.revived });
    const obj = {
      id: p.unitId, name: p.name, color: p.color || '#a9f58c',
      cx: p.cx, cy: p.cy, side: p.side, alive: true
    };
    Object.assign(obj, makeInstanceStats(p.unitId));
    obj.statuses = [];
    obj.baseStats = {
      atk: obj.atk,
      res: obj.res,
      wil: obj.wil
    };
    obj.iid = typeof allocIid === 'function' ? allocIid() : obj.iid;
    obj.art = getUnitArt(p.unitId);
    obj.skinKey = obj.art?.skinKey;
    obj.color = obj.color || obj.art?.palette?.primary || '#a9f58c';
    initializeFury(obj, p.unitId, initialFury, CFG);
    if (fromDeck){
      setFury(obj, obj.furyMax);
    }
    prepareUnitForPassives(obj);
    Game.tokens.push(obj);
    applyOnSpawnEffects(Game, obj, kit?.onSpawn);
    try { vfxAddSpawn(Game, p.cx, p.cy, p.side); } catch(_){}
     const actor = getActiveAt(Game, side, slot);
    const isLeader = actor?.id === 'leaderA' || actor?.id === 'leaderB';
    const canAutoUlt = fromDeck && !isLeader && actor && actor.alive && typeof performUlt === 'function';
    if (canAutoUlt && !Statuses.blocks(actor, 'ult')){
      let ultOk = false;
      try {
        performUlt(actor);
        ultOk = true;
      } catch (err){
        console.error('[spawnQueuedIfDue.performUlt]', err);
      }
      if (ultOk){
        clearFreshSummon(actor);
      }
    }
    return { actor: actor || null, spawned: true };
  }

  // giảm TTL minion sau khi phe đó hoàn tất lượt của mình
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
  function doActionOrSkip(Game, unit, { performUlt, turnContext } = {}){
    const ensureBusyReset = () => {
      if (!Game || !Game.turn) return;
      const now = safeNow();
      if (!Number.isFinite(Game.turn.busyUntil) || Game.turn.busyUntil < now) {
        Game.turn.busyUntil = now;
      }
    };
    const slot = turnContext?.slot ?? (unit ? slotIndex(unit.side, unit.cx, unit.cy) : null);
    const side = turnContext?.side ?? unit?.side ?? null;
    const orderIndex = typeof turnContext?.orderIndex === 'number' ? turnContext.orderIndex : null;
    const cycle = typeof turnContext?.cycle === 'number' ? turnContext.cycle : (Game?.turn?.cycle ?? null);
    const orderLength = typeof turnContext?.orderLength === 'number'
      ? turnContext.orderLength
      : (Array.isArray(Game?.turn?.order) ? Game.turn.order.length : null);
    const baseDetail = {
      game: Game,
      unit: unit || null,
      side,
      slot,
      phase: side,
      cycle,
      orderIndex,
      orderLength,
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

   const turnStamp = `${side ?? ''}:${slot ?? ''}:${cycle ?? 0}`;
    startFuryTurn(unit, { turnStamp, startAmount: CFG?.fury?.turn?.startGain, grantStart: true });
    applyTurnRegen(Game, unit);
    Statuses.onTurnStart(unit, {});
    emitGameEvent(ACTION_START, baseDetail);

    if (!Statuses.canAct(unit)) {
      Statuses.onTurnEnd(unit, {});
      ensureBusyReset();
      finishAction({ skipped: true, reason: 'status' });
      return;
    }

    const ultCost = resolveUltCost(unit, CFG);
    if (meta && (unit.fury|0) >= ultCost && !Statuses.blocks(unit,'ult')){
      try {
        performUlt(unit);
        ultOk = true;
      } catch(e){
        console.error('[performUlt]', e);
        setFury(unit, 0);
      }
      if (ultOk) {
        spendFury(unit, ultCost, CFG);
        emitPassiveEvent(Game, unit, 'onUltCast', {});
      }
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
  // hooks = { performUlt, processActionChain, allocIid, doActionOrSkip }
  function stepTurn(Game, hooks){
    const turn = Game?.turn;
    if (!turn) return;

    if (turn.mode === 'interleaved_by_position'){
      let selection = nextTurnInterleaved(Game);
      if (!selection) return;

      let spawnLoopGuard = 0;
      while (selection && selection.spawnOnly){
        spawnLoopGuard += 1;
        if (spawnLoopGuard > 12){
          return;
        }
        const spawnEntry = { side: selection.side, slot: selection.pos };
        const spawnResult = spawnQueuedIfDue(Game, spawnEntry, hooks);
        if (!spawnResult.spawned){
          return;
        }
        selection = nextTurnInterleaved(Game);
        if (!selection) return;
      }
      if (!selection) return;

      const entry = { side: selection.side, slot: selection.pos };
      const { actor, spawned } = spawnQueuedIfDue(Game, entry, hooks);
      let active = null;
      if (actor && actor.alive){
        active = actor;
      } else if (selection.unit && selection.unit.alive){
        active = selection.unit;
      } else {
        active = getActiveAt(Game, entry.side, entry.slot);
      }

      if (spawned && actor && actor.alive){
        return;
      }

      if (!active || !active.alive){
        return;
      }

      const cycle = Number.isFinite(Game?.turn?.cycle) ? Game.turn.cycle : 0;
      const turnContext = {
        side: entry.side,
        slot: entry.slot,
        orderIndex: -1,
        orderLength: null,
        cycle
      };

      const turnDetail = {
        game: Game,
        side: entry.side,
        slot: entry.slot,
        unit: active,
        cycle,
        phase: entry.side,
        orderIndex: -1,
        orderLength: null,
        spawned: !!spawned,
        processedChain: null
      };

      emitGameEvent(TURN_START, turnDetail);

      try {
        hooks.doActionOrSkip?.(Game, active, { performUlt: hooks.performUlt, turnContext });
        const chainHooks = { ...hooks, getTurnOrderIndex };
        const processed = hooks.processActionChain?.(Game, entry.side, entry.slot, chainHooks);
        turnDetail.processedChain = processed ?? null;
      } finally {
        emitGameEvent(TURN_END, turnDetail);
      }

      tickMinionTTL(Game, entry.side);
      return;
    }

    const order = Array.isArray(turn?.order) ? turn.order : [];
    if (!order.length) return;

    const orderLength = order.length;
    let cursor = Math.max(0, Math.min(orderLength - 1, Number.isFinite(turn?.cursor) ? turn.cursor : 0));
    let cycle = Number.isFinite(turn?.cycle) ? turn.cycle : 0;

    const advanceCursor = () => {
      const nextCursor = (cursor + 1) % orderLength;
      Game.turn.cursor = nextCursor;
      if (nextCursor === 0){
        cycle += 1;
      }
      Game.turn.cycle = cycle;
      cursor = nextCursor;
    };

    for (let stepCount = 0; stepCount < orderLength; stepCount += 1){
      const entry = order[cursor];
      if (!entry){
        advanceCursor();
        continue;
      }

    const turnContext = {
        side: entry.side,
        slot: entry.slot,
        orderIndex: cursor,
        orderLength,
        cycle
      };

    const { actor, spawned } = spawnQueuedIfDue(Game, entry, hooks);
      if (spawned && actor && actor.alive){
        advanceCursor();
        return;
      }

      const active = actor && actor.alive ? actor : getActiveAt(Game, entry.side, entry.slot);
      const hasActive = !!(active && active.alive);

      if (!hasActive){
        advanceCursor();
        continue;
      }

      const turnDetail = {
        game: Game,
        side: entry.side,
        slot: entry.slot,
        unit: active,
        cycle,
        phase: entry.side,
        orderIndex: cursor,
        orderLength,
        spawned: !!spawned,
        processedChain: null
      };
      emitGameEvent(TURN_START, turnDetail);

      try {
        hooks.doActionOrSkip?.(Game, active, { performUlt: hooks.performUlt, turnContext });
        const chainHooks = { ...hooks, getTurnOrderIndex };
        const processed = hooks.processActionChain?.(Game, entry.side, entry.slot, chainHooks);
        turnDetail.processedChain = processed ?? null;
      } finally {
        emitGameEvent(TURN_END, turnDetail);
      }

      tickMinionTTL(Game, entry.side);

      advanceCursor();
      return;
    }
  }
  exports.getActiveAt = getActiveAt;
  exports.getTurnOrderIndex = getTurnOrderIndex;
  exports.predictSpawnCycle = predictSpawnCycle;
  exports.spawnQueuedIfDue = spawnQueuedIfDue;
  exports.tickMinionTTL = tickMinionTTL;
  exports.doActionOrSkip = doActionOrSkip;
  exports.stepTurn = stepTurn;
});
__define('./turns/interleaved.js', (exports, module, __require) => {
  // v0.7.7 interleaved helpers
  const __dep0 = __require('./engine.js');
  const slotIndex = __dep0.slotIndex;
  const __dep1 = __require('./statuses.js');
  const Statuses = __dep1.Statuses;

  const SIDE_TO_LOWER = { ALLY: 'ally', ENEMY: 'enemy' };
  const LOWER_TO_UPPER = { ally: 'ALLY', enemy: 'ENEMY' };
  const DEFAULT_LAST_POS = { ALLY: 0, ENEMY: 0 };
  const DEFAULT_WRAP_COUNT = { ALLY: 0, ENEMY: 0 };
  const SLOT_CAP = 9;

  function normalizeSide(side){
    if (side === 'ENEMY') return 'ENEMY';
    if (side === 'ALLY') return 'ALLY';
    return LOWER_TO_UPPER[side] || 'ALLY';
  }

  function resolveSlotCount(turn){
    const raw = Number.isFinite(turn?.slotCount) ? turn.slotCount : null;
    if (Number.isFinite(raw) && raw > 0){
      return Math.max(1, Math.min(SLOT_CAP, Math.floor(raw)));
    }
    return SLOT_CAP;
  }

  function ensureTurnState(turn){
    if (!turn.lastPos || typeof turn.lastPos !== 'object'){
      turn.lastPos = { ...DEFAULT_LAST_POS };
    } else {
      turn.lastPos.ALLY = Number.isFinite(turn.lastPos.ALLY) ? turn.lastPos.ALLY : 0;
      turn.lastPos.ENEMY = Number.isFinite(turn.lastPos.ENEMY) ? turn.lastPos.ENEMY : 0;
    }
    if (!turn.wrapCount || typeof turn.wrapCount !== 'object'){
      turn.wrapCount = { ...DEFAULT_WRAP_COUNT };
    } else {
      turn.wrapCount.ALLY = Number.isFinite(turn.wrapCount.ALLY) ? turn.wrapCount.ALLY : 0;
      turn.wrapCount.ENEMY = Number.isFinite(turn.wrapCount.ENEMY) ? turn.wrapCount.ENEMY : 0;
    }
    if (!Number.isFinite(turn.turnCount)){
      turn.turnCount = 0;
    }
  }

  function buildSlotMap(tokens, sideLower){
    const map = new Map();
    if (!Array.isArray(tokens)) return map;
    for (const unit of tokens){
      if (!unit || !unit.alive) continue;
      if (unit.side !== sideLower) continue;
      const slot = slotIndex(sideLower, unit.cx, unit.cy);
      if (!Number.isFinite(slot)) continue;
      if (!map.has(slot)){
        map.set(slot, unit);
      }
    }
    return map;
  }

  function isQueueDue(state, sideLower, slot){
    const queued = state?.queued?.[sideLower];
    if (!queued || typeof queued.get !== 'function') return false;
    const entry = queued.get(slot);
    if (!entry) return false;
    const cycle = Number.isFinite(state?.turn?.cycle) ? state.turn.cycle : 0;
    return (entry.spawnCycle ?? 0) <= cycle;
  }

  function makeWrappedFlag(start, pos){
    if (!Number.isFinite(start) || start <= 0) return false;
    return pos <= start;
  }

  function findNextOccupiedPos(state, side, startPos = 0){
    const turn = state?.turn || {};
    const sideKey = normalizeSide(side);
    const sideLower = SIDE_TO_LOWER[sideKey];
    if (!sideLower) return null;

    const slotCount = resolveSlotCount(turn);
    const start = Number.isFinite(startPos) ? Math.max(0, Math.min(slotCount, Math.floor(startPos))) : 0;
    const unitsBySlot = buildSlotMap(state?.tokens, sideLower);

    for (let offset = 1; offset <= slotCount; offset += 1){
      const pos = ((start + offset - 1) % slotCount) + 1;
      const wrapped = makeWrappedFlag(start, pos);
      const unit = unitsBySlot.get(pos) || null;
      if (unit && unit.alive && Statuses.canAct(unit)){
        return { pos, unit, wrapped, queued: isQueueDue(state, sideLower, pos) };
      }
      if (isQueueDue(state, sideLower, pos)){
        return { pos, unit: null, wrapped, queued: true };
      }
    }

    return null;
  }

  function nextTurnInterleaved(state){
    const turn = state?.turn;
    if (!state || !turn) return null;

    ensureTurnState(turn);
    const slotCount = resolveSlotCount(turn);
    if (slotCount <= 0) return null;

    const pickSide = (sideKey) => {
      const last = Number.isFinite(turn.lastPos?.[sideKey]) ? turn.lastPos[sideKey] : 0;
      const found = findNextOccupiedPos(state, sideKey, last);
      if (!found) return null;
      const sideLower = SIDE_TO_LOWER[sideKey];
      const isSpawnOnly = !found.unit && found.queued;
      if (isSpawnOnly){
        return {
          side: sideLower,
          pos: found.pos,
          unit: null,
          unitId: null,
          queued: true,
          wrapped: !!found.wrapped,
          sideKey,
          spawnOnly: true
        };
      }
      turn.lastPos[sideKey] = found.pos;
      if (found.wrapped){
        turn.wrapCount[sideKey] = (turn.wrapCount[sideKey] ?? 0) + 1;
      }
      return {
        side: sideLower,
        pos: found.pos,
        unit: found.unit || null,
        unitId: found.unit?.id ?? null,
        queued: !!found.queued,
        wrapped: !!found.wrapped,
        sideKey,
        spawnOnly: false
      };
    };

    const primarySide = normalizeSide(turn.nextSide);
    const fallbackSide = primarySide === 'ALLY' ? 'ENEMY' : 'ALLY';

    let selection = pickSide(primarySide);
    if (!selection){
      selection = pickSide(fallbackSide);
      if (!selection){
        turn.nextSide = fallbackSide;
        return null;
      }
    }

    if (selection.spawnOnly){
      return selection;
    }

    turn.nextSide = selection.sideKey === 'ALLY' ? 'ENEMY' : 'ALLY';
    turn.turnCount += 1;
    const allyWrap = turn.wrapCount.ALLY ?? 0;
    const enemyWrap = turn.wrapCount.ENEMY ?? 0;
    const maxWrap = Math.max(allyWrap, enemyWrap);
    if (!Number.isFinite(turn.cycle) || turn.cycle < maxWrap){
      turn.cycle = maxWrap;
    }

    return selection;
  }
  exports.findNextOccupiedPos = findNextOccupiedPos;
  exports.nextTurnInterleaved = nextTurnInterleaved;
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

  function initHUD(doc, root){
    const queryFromRoot = (id)=>{
      if (root && typeof root.querySelector === 'function'){
        const el = root.querySelector(`#${id}`);
        if (el) return el;
      }
      return null;
    };

    const costNow  = /** @type {HTMLElement|null} */ (queryFromRoot('costNow')  || doc.getElementById('costNow'));   // số cost hiện tại
    const costRing = /** @type {HTMLElement|null} */ (queryFromRoot('costRing') || doc.getElementById('costRing'));  // vòng tròn tiến trình
    const costChip = /** @type {HTMLElement|null} */ (queryFromRoot('costChip') || doc.getElementById('costChip'));  // chip bao ngoài
    function update(Game){
      if (!Game) return;

      const capRaw = Game.costCap ?? CFG.COST_CAP ?? 30;
      const cap = Number.isFinite(capRaw) && capRaw > 0 ? capRaw : 1;
      const now = Math.max(0, Math.floor(Game.cost ?? 0));
      const ratio = Math.max(0, Math.min(1, now / cap));

      if (costNow) costNow.textContent = String(now);
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
    let cleanedUp = false;
    const cleanup = ()=>{
      if (cleanedUp) return;
      cleanedUp = true;
      if (gameEvents && typeof gameEvents.removeEventListener === 'function'){
        const types = [TURN_START, TURN_END, ACTION_END];
        for (const type of types){
          gameEvents.removeEventListener(type, handleGameEvent);
        }
      }
    };

    if (gameEvents && typeof gameEvents.addEventListener === 'function'){
      const types = [TURN_START, TURN_END, ACTION_END];
      for (const type of types){
        gameEvents.addEventListener(type, handleGameEvent);
      }
    }
   return { update, cleanup };
  }
  /* ---------- Summon Bar (deck-size = 4) ---------- */
  function startSummonBar(doc, options, root){
    options = options || {};
    const onPick = options.onPick || (()=>{});
    const canAfford = options.canAfford || (()=>true);
    const getDeck = options.getDeck || (()=>[]);
    const getSelectedId = options.getSelectedId || (()=>null);

    const queryFromRoot = (selector, id)=>{
      if (root && typeof root.querySelector === 'function'){
        const el = root.querySelector(selector);
        if (el) return el;
      }
      if (id && typeof doc.getElementById === 'function'){
        return doc.getElementById(id);
      }
      return null;
    };

    const host = /** @type {HTMLElement|null} */ (queryFromRoot('#cards', 'cards'));
    if (!host){
      return { render: ()=>{} };
    }

    if (host){
      host.innerHTML = '';
      host.addEventListener('click', (event) => {
        const target = event.target instanceof Element
          ? event.target
          : event.currentTarget instanceof Element
            ? event.currentTarget
            : null;
        const btn = target ? target.closest('button.card') : null;
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
    const boardEl = /** @type {HTMLElement|null} */ (queryFromRoot('#board', 'board')); // cache DOM

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
        if (span) span.textContent = String(c.cost);

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
__define('./utils/format.js', (exports, module, __require) => {
  const HAS_INTL_NUMBER_FORMAT = typeof Intl === 'object' && typeof Intl.NumberFormat === 'function';

  function createNumberFormatter(locale, options){
    if (HAS_INTL_NUMBER_FORMAT){
      return new Intl.NumberFormat(locale, options);
    }

    const hasLocaleString = typeof Number.prototype.toLocaleString === 'function';

    return {
      format(value){
        if (typeof value === 'number'){
          if (hasLocaleString){
            try {
              return value.toLocaleString();
            } catch (error) {
              return String(value);
            }
          }
          return String(value);
        }

        if (value == null){
          return '';
        }

        if (hasLocaleString && typeof value?.toLocaleString === 'function'){
          try {
            return value.toLocaleString();
          } catch (error) {
            return String(value);
          }
        }

        return String(value);
      }
    };
  }

  exports.HAS_INTL_NUMBER_FORMAT = HAS_INTL_NUMBER_FORMAT;
  exports.createNumberFormatter = createNumberFormatter;
});
__define('./utils/fury.js', (exports, module, __require) => {
  const __dep0 = __require('./config.js');
  const CFG = __dep0.CFG;
  const __dep1 = __require('./utils/time.js');
  const safeNow = __dep1.safeNow;

  const DEFAULT_TURN_CAP = 40;
  const DEFAULT_SKILL_CAP = 30;
  const DEFAULT_HIT_CAP = 20;
  const TURN_GRANT_KEY = Symbol('turn');

  function toNumber(value){
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  function ensureAlias(unit){
    if (!unit) return;
    if (typeof unit.fury !== 'number' && typeof unit.rage === 'number'){
      unit.fury = unit.rage;
    }
    if (typeof unit.fury !== 'number') unit.fury = 0;
    try {
      const desc = Object.getOwnPropertyDescriptor(unit, 'rage');
      if (!desc || (!desc.get && !desc.set)){
        Object.defineProperty(unit, 'rage', {
          configurable: true,
          enumerable: true,
          get(){ return this.fury ?? 0; },
          set(v){ this.fury = toNumber(v); }
        });
      } else {
        unit.rage = unit.fury;
      }
    } catch (_) {
      unit.rage = unit.fury;
    }
  }

  function ensureState(unit){
    if (!unit) return null;
    ensureAlias(unit);
    if (!unit._furyState){
      unit._furyState = {
        turnGain: 0,
        skillGain: 0,
        hitGain: 0,
        skillPerTargetGain: 0,
        skillDrain: 0,
        turnStamp: null,
        skillTag: null,
        freshSummon: false,
        lastStart: safeNow()
      };
    }
    return unit._furyState;
  }

  function resolveMaxFury(unitId, cfg = CFG){
    const furyCfg = cfg?.fury || {};
    const special = furyCfg.specialMax || {};
    const entry = unitId ? special[unitId] : null;
    if (entry != null){
      if (typeof entry === 'number') return entry;
      if (typeof entry === 'object'){
        if (Number.isFinite(entry.max)) return entry.max;
        if (Number.isFinite(entry.value)) return entry.value;
      }
    }
    if (Number.isFinite(furyCfg.max)) return furyCfg.max;
    if (Number.isFinite(furyCfg.baseMax)) return furyCfg.baseMax;
    return 100;
  }

  function resolveUltCost(unit, cfg = CFG){
    if (!unit) return resolveMaxFury(null, cfg);
    const furyCfg = cfg?.fury || {};
    const special = furyCfg.specialMax || {};
    const entry = special[unit.id];
    if (entry && typeof entry === 'object' && Number.isFinite(entry.ultCost)){
      return entry.ultCost;
    }
    if (Number.isFinite(furyCfg.ultCost)) return furyCfg.ultCost;
    return unit.furyMax ?? resolveMaxFury(unit.id, cfg);
  }

  function initializeFury(unit, unitId, initial = 0, cfg = CFG){
    if (!unit) return;
    const max = resolveMaxFury(unitId, cfg);
    unit.furyMax = Number.isFinite(max) && max > 0 ? Math.max(1, Math.floor(max)) : 100;
    ensureAlias(unit);
    setFury(unit, initial);
    const state = ensureState(unit);
    if (state){
      state.turnGain = 0;
      state.skillGain = 0;
      state.hitGain = 0;
      state.skillPerTargetGain = 0;
      state.skillDrain = 0;
      state.turnStamp = null;
      state.skillTag = null;
      state.freshSummon = true;
      state.lastStart = safeNow();
    }
  }

  function markFreshSummon(unit, flag = true){
    const state = ensureState(unit);
    if (state){
      state.freshSummon = !!flag;
      state.lastStart = safeNow();
    }
  }

  function clearFreshSummon(unit){
    const state = ensureState(unit);
    if (state){
      state.freshSummon = false;
    }
  }

  function setFury(unit, value){
    if (!unit) return 0;
    ensureAlias(unit);
    const max = Number.isFinite(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, CFG);
    const amount = Math.max(0, Math.min(max, Math.floor(toNumber(value))));
    unit.fury = amount;
    unit.rage = amount;
    return amount;
  }

  function resolveTurnCap(cfg){
    const furyCfg = cfg?.fury || {};
    if (Number.isFinite(furyCfg.turnCap)) return furyCfg.turnCap;
    if (Number.isFinite(furyCfg?.caps?.perTurn)) return furyCfg.caps.perTurn;
    if (Number.isFinite(furyCfg?.turn?.cap)) return furyCfg.turn.cap;
    return DEFAULT_TURN_CAP;
  }

  function resolveSkillCap(cfg){
    const furyCfg = cfg?.fury || {};
    if (Number.isFinite(furyCfg.skillCap)) return furyCfg.skillCap;
    if (Number.isFinite(furyCfg?.caps?.perSkill)) return furyCfg.caps.perSkill;
    if (Number.isFinite(furyCfg?.skill?.cap)) return furyCfg.skill.cap;
    return DEFAULT_SKILL_CAP;
  }

  function resolveHitCap(cfg){
    const furyCfg = cfg?.fury || {};
    if (Number.isFinite(furyCfg.hitCap)) return furyCfg.hitCap;
    if (Number.isFinite(furyCfg?.caps?.perHit)) return furyCfg.caps.perHit;
    if (Number.isFinite(furyCfg?.hit?.cap)) return furyCfg.hit.cap;
    return DEFAULT_HIT_CAP;
  }

  function resolveGainAmount(spec = {}, cfg = CFG, state = null){
    if (Number.isFinite(spec.amount)){
      return { amount: Math.floor(spec.amount), perTarget: 0 };
    }
    const furyCfg = cfg?.fury || {};
    const table = furyCfg.gain || {};
    const type = spec.type || 'generic';

    if (type === 'turnStart'){
      const amount = Number.isFinite(table?.turnStart?.amount)
        ? table.turnStart.amount
        : (Number.isFinite(furyCfg?.turn?.startGain) ? furyCfg.turn.startGain : (furyCfg.startGain ?? 0));
      return { amount: Math.floor(Math.max(0, amount)), perTarget: 0 };
    }

    if (type === 'damageTaken'){
      const mode = table.damageTaken || {};
      let total = Number.isFinite(spec.base) ? spec.base : (Number.isFinite(mode.base) ? mode.base : 0);
      const ratio = Number.isFinite(mode.selfRatio) ? mode.selfRatio : 0;
      const taken = Number.isFinite(spec.damageTaken) ? spec.damageTaken : spec.dealt;
      if (ratio && Number.isFinite(taken) && Number.isFinite(spec.selfMaxHp) && spec.selfMaxHp > 0){
        total += Math.round((ratio * Math.max(0, taken)) / spec.selfMaxHp);
      }
      if (Number.isFinite(mode.min)) total = Math.max(mode.min, total);
      if (Number.isFinite(mode.max)) total = Math.min(mode.max, total);
      if (Number.isFinite(spec.bonus)) total += spec.bonus;
      if (Number.isFinite(spec.multiplier)) total *= spec.multiplier;
      return { amount: Math.floor(Math.max(0, total)), perTarget: 0 };
    }

    const isAoE = !!spec.isAoE || (Number.isFinite(spec.targetsHit) && spec.targetsHit > 1);
    const mode = isAoE ? (table.dealAoePerTarget || {}) : (table.dealSingle || {});
    let total = Number.isFinite(spec.base) ? spec.base : (Number.isFinite(mode.base) ? mode.base : 0);
    if (spec.isCrit && Number.isFinite(mode.crit)) total += mode.crit;
    if (spec.isKill && Number.isFinite(mode.kill)) total += mode.kill;

    let perTargetApplied = 0;
    if (Number.isFinite(spec.targetsHit) && spec.targetsHit > 0 && Number.isFinite(mode.perTarget)){
      const desired = mode.perTarget * spec.targetsHit;
      const used = state?.skillPerTargetGain ?? 0;
      const room = Math.max(0, 12 - used);
      const granted = Math.max(0, Math.min(desired, room));
      total += granted;
      perTargetApplied = granted;
    }

    const ratio = Number.isFinite(mode.targetRatio) ? mode.targetRatio : 0;
    if (ratio && Number.isFinite(spec.dealt) && Number.isFinite(spec.targetMaxHp) && spec.targetMaxHp > 0){
      total += Math.round((ratio * Math.max(0, spec.dealt)) / spec.targetMaxHp);
    }

     if (Number.isFinite(mode.min)) total = Math.max(mode.min, total);
    if (Number.isFinite(mode.max)) total = Math.min(mode.max, total);
    if (Number.isFinite(spec.bonus)) total += spec.bonus;
    if (Number.isFinite(spec.multiplier)) total *= spec.multiplier;

    return { amount: Math.floor(Math.max(0, total)), perTarget: perTargetApplied };
    }

  function applyBonuses(unit, amount){
    if (!unit) return amount;
    const bonus = toNumber(unit.furyGainBonus ?? unit.rageGainBonus);
    if (bonus !== 0) return Math.floor(Math.max(0, amount * (1 + bonus)));
    return amount;
  }

  function startFuryTurn(unit, opts = {}){
    const state = ensureState(unit);
    if (!state) return;
    if (opts.clearFresh !== false) state.freshSummon = false;
    const stamp = opts.turnStamp ?? opts.turnKey ?? TURN_GRANT_KEY;
    if (state.turnStamp !== stamp){
      state.turnStamp = stamp;
      state.turnGain = 0;
    }
    state.skillGain = 0;
    state.hitGain = 0;
    state.skillTag = null;
    state.skillPerTargetGain = 0;
    state.skillDrain = 0;
    if (opts.grantStart !== false){
      const furyCfg = CFG?.fury || {};
      const baseStart = Number.isFinite(furyCfg?.gain?.turnStart?.amount)
        ? furyCfg.gain.turnStart.amount
        : (Number.isFinite(furyCfg?.turn?.startGain) ? furyCfg.turn.startGain : (furyCfg.startGain ?? 3));
      const startAmount = Number.isFinite(opts.startAmount) ? opts.startAmount : baseStart;
      if (startAmount > 0){
        gainFury(unit, { amount: startAmount, type: 'turnStart' });
      }
    }
  }

  function startFurySkill(unit, { tag = null, forceReset = false } = {}){
    const state = ensureState(unit);
    if (!state) return;
    const skillTag = tag || '__skill__';
    if (forceReset || state.skillTag !== skillTag){
      state.skillTag = skillTag;
      state.skillGain = 0;
      state.hitGain = 0;
      state.skillPerTargetGain = 0;
      state.skillDrain = 0;
    }
  }

  function finishFuryHit(unit){
    const state = ensureState(unit);
    if (state){
      state.hitGain = 0;
    }
  }

  function gainFury(unit, spec = {}, cfg = CFG){
    if (!unit) return 0;
    ensureAlias(unit);
    const state = ensureState(unit);
    if (!state) return 0;
    const { amount: desiredRaw, perTarget = 0 } = resolveGainAmount(spec, cfg, state);
    if (desiredRaw <= 0) return 0;
    const turnCap = resolveTurnCap(cfg);
    const skillCap = resolveSkillCap(cfg);
    const hitCap = resolveHitCap(cfg);

    const perTurnLeft = turnCap - state.turnGain;
    const perSkillLeft = skillCap - state.skillGain;
    const perHitLeft = hitCap - state.hitGain;
    const room = Math.min(perTurnLeft, perSkillLeft, perHitLeft);
    if (room <= 0) return 0;

    const rawBeforeBonus = Math.min(desiredRaw, room);
    let amount = applyBonuses(unit, rawBeforeBonus);
    if (amount <= 0) return 0;

    const max = Number.isFinite(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, cfg);
    const next = Math.max(0, Math.min(max, Math.floor(unit.fury ?? 0) + amount));
    const gained = next - Math.floor(unit.fury ?? 0);
    if (gained <= 0) return 0;
    unit.fury = next;
    unit.rage = next;
    state.turnGain += gained;
    state.skillGain += gained;
    state.hitGain += gained;
    if (perTarget > 0 && rawBeforeBonus > 0){
      const ratio = amount > 0 ? Math.min(1, gained / amount) : 0;
      if (ratio > 0){
        const applied = Math.min(perTarget, Math.round(perTarget * ratio));
        state.skillPerTargetGain = Math.min(12, (state.skillPerTargetGain ?? 0) + applied);
      }
    }
    return gained;
  }

  function spendFury(unit, amount, cfg = CFG){
    if (!unit) return 0;
    ensureAlias(unit);
    const amt = Math.max(0, Math.floor(toNumber(amount)));
    const before = Math.floor(unit.fury ?? 0);
    const next = Math.max(0, before - amt);
    unit.fury = next;
    unit.rage = next;
    return before - next;
  }

  function drainFury(source, target, opts = {}, cfg = CFG){
    if (!target) return 0;
    ensureAlias(target);
    const targetState = ensureState(target);
    if (targetState?.freshSummon) return 0;
    const furyCfg = cfg?.fury || {};
    const drainCfg = furyCfg.drain || {};
    const base = Number.isFinite(opts.base)
      ? opts.base
      : (Number.isFinite(drainCfg.perTargetBase) ? drainCfg.perTargetBase : 0);
    const percent = Number.isFinite(opts.percent)
      ? opts.percent
      : (Number.isFinite(drainCfg.perTargetPct) ? drainCfg.perTargetPct : 0);
    const skillCap = Number.isFinite(opts.skillTotalCap)
      ? opts.skillTotalCap
      : (Number.isFinite(drainCfg.skillTotalCap) ? drainCfg.skillTotalCap : null);

    const current = Math.max(0, Math.floor(target.fury ?? 0));
    if (current <= 0) return 0;

    let desired = Math.max(0, Math.floor(base));
    if (percent) desired += Math.round(current * percent);
    if (desired <= 0) return 0;
    
    let capRoom = desired;
    let sourceState = null;
    if (Number.isFinite(skillCap)){
      sourceState = ensureState(source);
      const used = sourceState ? (sourceState.skillDrain ?? 0) : 0;
      capRoom = Math.max(0, Math.min(desired, skillCap - used));
    }

    const drained = Math.max(0, Math.min(current, capRoom));
    if (drained <= 0) return 0;

    target.fury = current - drained;
    target.rage = target.fury;
    
    if (sourceState && Number.isFinite(skillCap)){
      sourceState.skillDrain = (sourceState.skillDrain ?? 0) + drained;
    }

    return drained;
  }

  function furyValue(unit){
    if (!unit) return 0;
    ensureAlias(unit);
    return Math.floor(unit.fury ?? 0);
  }

  function furyRoom(unit){
    if (!unit) return 0;
    ensureAlias(unit);
    const max = Number.isFinite(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, CFG);
    return Math.max(0, max - Math.floor(unit.fury ?? 0));
  }

  function furyState(unit){
    return ensureState(unit);
  }

  exports.resolveMaxFury = resolveMaxFury;
  exports.resolveUltCost = resolveUltCost;
  exports.initializeFury = initializeFury;
  exports.markFreshSummon = markFreshSummon;
  exports.clearFreshSummon = clearFreshSummon;
  exports.setFury = setFury;
  exports.startFuryTurn = startFuryTurn;
  exports.startFurySkill = startFurySkill;
  exports.finishFuryHit = finishFuryHit;
  exports.gainFury = gainFury;
  exports.spendFury = spendFury;
  exports.drainFury = drainFury;
  exports.furyValue = furyValue;
  exports.furyRoom = furyRoom;
  exports.furyState = furyState;
});
__define('./utils/kit.js', (exports, module, __require) => {
  const KNOWN_SUMMON_KEYS = ['summon', 'summoner', 'immediateSummon'];
  const KNOWN_REVIVE_KEYS = ['revive', 'reviver'];
  const DEFENSIVE_TAGS = ['defense', 'defensive', 'protection', 'shield', 'barrier', 'support'];
  const INSTANT_TAGS = ['instant', 'instant-cast', 'instantCast'];

  function coerceKit(metaOrKit){
    if (!metaOrKit) return null;
    if (metaOrKit.kit) return metaOrKit.kit;
    return metaOrKit;
  }

  function normalizeKey(key){
    return typeof key === 'string' ? key.trim().toLowerCase() : '';
  }

  function readTrait(traits, key){
    if (!traits) return null;
    const target = normalizeKey(key);
    if (!target) return null;

    if (Array.isArray(traits)){
      for (const entry of traits){
        if (entry == null) continue;
        if (typeof entry === 'string'){
          if (normalizeKey(entry) === target) return true;
          continue;
        }
        if (typeof entry === 'object'){
          const id = normalizeKey(entry.id || entry.key || entry.type || entry.name);
          if (id === target) return entry;
          if (entry[target] != null) return entry[target];
        }
      }
      return null;
    }

    if (typeof traits === 'object'){
      for (const [k, value] of Object.entries(traits)){
        if (normalizeKey(k) === target) return value;
      }
    }
    return null;
  }

  function cloneShallow(value){
    if (!value || typeof value !== 'object') return value ?? null;
    if (Array.isArray(value)) return value.map(cloneShallow);
    const out = { ...value };
    for (const [k, v] of Object.entries(out)){
      if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = { ...v };
      if (Array.isArray(v)) out[k] = v.map(cloneShallow);
    }
    return out;
  }

  function extractUltSummonFields(ult){
    if (!ult || typeof ult !== 'object') return null;
    const out = {};
    let hasValue = false;
    const assign = (key, value, clone = false) => {
      if (value === undefined) return;
      if (value === null) return;
      out[key] = clone ? cloneShallow(value) : value;
      hasValue = true;
    };

    const pattern = ult.pattern ?? ult.placement;
    if (pattern !== undefined && pattern !== null) assign('pattern', pattern);
    const count = ult.count ?? ult.summonCount;
    if (count !== undefined && count !== null) assign('count', count);
    const ttlTurns = ult.ttlTurns ?? ult.ttl;
    if (ttlTurns !== undefined && ttlTurns !== null) assign('ttlTurns', ttlTurns);
    const ttl = ult.ttl ?? ult.ttlTurns;
    if (ttl !== undefined && ttl !== null) assign('ttl', ttl);
    assign('inherit', ult.inherit, true);
    const limit = ult.limit;
    if (limit !== undefined && limit !== null) assign('limit', limit);
    assign('replace', ult.replace);
    assign('creep', ult.creep, true);

    return hasValue ? out : null;
  }

  function applyUltSummonDefaults(spec, ult){
    const fields = extractUltSummonFields(ult);
    if (!fields) return spec;
    const out = spec ?? {};
    for (const [key, value] of Object.entries(fields)){
      if (out[key] === undefined || out[key] === null){
        out[key] = value;
      }
    }
    return out;
  }

  function collectUltTags(metaOrKit){
    const kit = coerceKit(metaOrKit);
    const ult = kit?.ult;
    const tags = new Set();
    const add = (val) => {
      if (typeof val === 'string' && val.trim() !== '') tags.add(val.trim());
    };
    const addMany = (vals) => {
      if (!Array.isArray(vals)) return;
      for (const val of vals){ add(val); }
    };

    if (!ult) return tags;
    add(ult.type);
    add(ult.kind);
    add(ult.category);
    addMany(ult.tags);

    const metadata = ult.metadata || ult.meta || null;
    if (metadata){
      add(metadata.type);
      add(metadata.kind);
      add(metadata.category);
      addMany(metadata.categories);
      addMany(metadata.tags);
      if (metadata.label) add(metadata.label);
    }

    const traitUlt = readTrait(kit?.traits, 'ult');
    if (traitUlt){
      if (typeof traitUlt === 'string') add(traitUlt);
      if (Array.isArray(traitUlt)) addMany(traitUlt);
      if (traitUlt && typeof traitUlt === 'object'){
        add(traitUlt.type);
        addMany(traitUlt.tags);
        addMany(traitUlt.categories);
        if (typeof traitUlt.label === 'string') add(traitUlt.label);
      }
    }

    return tags;
  }

  function getSummonSpec(metaOrKit){
    const kit = coerceKit(metaOrKit);
    if (!kit) return null;

    let spec = null;
    for (const key of KNOWN_SUMMON_KEYS){
      const trait = readTrait(kit.traits, key);
      if (trait){
        if (trait === true) {
          spec = {};
        } else if (typeof trait === 'object'){
          spec = cloneShallow(trait);
        } else if (typeof trait === 'number'){
          spec = { count: trait };
        } else {
          spec = {};
        }
        break;
      }
    }

    const ult = kit.ult || null;
    if (!spec && ult){
      if (ult.summon){
        spec = cloneShallow(ult.summon);
      } else if (ult.metadata?.summon){
        spec = cloneShallow(ult.metadata.summon);
      } else if (ult.meta?.summon){
        spec = cloneShallow(ult.meta.summon);
      }
    }

    const tags = collectUltTags(kit);
    if (!spec && kitUltHasTag(kit, 'summon', tags)){
      if (ult?.summon){
        spec = cloneShallow(ult.summon);
      }
      spec = applyUltSummonDefaults(spec, ult);
    }
    if (ult && typeof ult.type === 'string' && ult.type.toLowerCase() === 'summon'){
      spec = applyUltSummonDefaults(spec, ult);
    }

    if (!spec) return null;

    const normalized = cloneShallow(spec) || {};
    if (!normalized.pattern && typeof normalized.placement === 'string'){
      normalized.pattern = normalized.placement;
    }
    if (!normalized.pattern && typeof normalized.patternKey === 'string'){
      normalized.pattern = normalized.patternKey;
    }
    if (normalized.ttl == null && typeof normalized.ttlTurns === 'number'){
      normalized.ttl = normalized.ttlTurns;
    }
    if (normalized.ttlTurns == null && typeof normalized.ttl === 'number'){
      normalized.ttlTurns = normalized.ttl;
    }
    return normalized;
  }

  function getReviveSpec(metaOrKit){
    const kit = coerceKit(metaOrKit);
    if (!kit) return null;
    for (const key of KNOWN_REVIVE_KEYS){
      const trait = readTrait(kit.traits, key);
      if (trait){
        if (trait === true) return {};
        if (typeof trait === 'object') return cloneShallow(trait);
        return {};
      }
    }
    const ult = kit.ult || null;
    if (ult?.revive) return cloneShallow(ult.revive);
    if (ult?.metadata?.revive) return cloneShallow(ult.metadata.revive);
    if (kitUltHasTag(kit, 'revive')){
      return cloneShallow(ult?.revive || {});
    }
    return null;
  }

  function kitSupportsSummon(metaOrKit){
    return !!getSummonSpec(metaOrKit);
  }

  function kitUltHasTag(metaOrKit, tag, precomputedTags = null){
    if (!tag) return false;
    const tags = precomputedTags ?? collectUltTags(metaOrKit);
    const target = normalizeKey(tag);
    for (const t of tags){
      if (normalizeKey(t) === target) return true;
    }
    return false;
  }

  function detectUltBehavior(metaOrKit){
    const kit = coerceKit(metaOrKit);
    const ult = kit?.ult;
    const tags = collectUltTags(kit);
    const metadata = ult?.metadata || ult?.meta || {};
    const traits = kit?.traits || null;

    const hasInstant = Boolean(
      metadata.instant === true || metadata.instantCast === true || metadata.cast === 'instant'
        || (ult && (ult.instant || ult.cast === 'instant' || ult.immediate === true))
        || INSTANT_TAGS.some(tag => kitUltHasTag(kit, tag))
        || readTrait(traits, 'instantUlt') === true || readTrait(traits, 'instantUltimate') === true
    );

    const hasDefensive = Boolean(
      metadata.defensive === true || metadata.role === 'defensive'
        || DEFENSIVE_TAGS.some(tag => kitUltHasTag(kit, tag))
        || (ult && (typeof ult.reduceDamage === 'number' || typeof ult.shield === 'number' || typeof ult.barrier === 'number'
          || Array.isArray(ult.shields) || Array.isArray(ult.buffs) && ult.buffs.some(b => normalizeKey(b.effect) === 'shield')))
        || readTrait(traits, 'defensiveUlt') === true || readTrait(traits, 'guardianUlt') === true
    );

    const revive = getReviveSpec(kit);
    const hasRevive = !!revive;

    return {
      tags: Array.from(tags),
      hasInstant,
      hasDefensive,
      hasRevive,
      revive,
      summon: getSummonSpec(kit)
    };
  }

  function extractRageFromEffects(onSpawn, opts){
    const effects = Array.isArray(onSpawn?.effects) ? onSpawn.effects : [];
    for (const effect of effects){
      if (!effect) continue;
      const type = normalizeKey(effect.type || effect.kind || effect.effect);
      if (!type) continue;
      if (type === 'setrage' || type === 'addrage' || type === 'giverage'){
        if (opts.revive && normalizeKey(effect.phase || effect.stage || effect.when) === 'revive' && typeof effect.amount === 'number'){
          return effect.amount;
        }
        if (opts.isLeader && normalizeKey(effect.target) === 'leader' && typeof effect.amount === 'number'){
          return effect.amount;
        }
        if (!opts.isLeader && (effect.target == null || ['deck', 'nonleader', 'non-leader'].includes(normalizeKey(effect.target)))){
          if (typeof effect.amount === 'number') return effect.amount;
        }
        if (typeof effect.value === 'number') return effect.value;
        if (typeof effect.amount === 'number') return effect.amount;
      }
    }
    return null;
  }

  function extractOnSpawnRage(onSpawn, opts = {}){
    if (!onSpawn) return null;
    const { isLeader = false, revive = false, reviveSpec = null } = opts;

    if (revive && reviveSpec && typeof reviveSpec.rage === 'number'){
      return Math.max(0, reviveSpec.rage);
    }
    if (revive){
      const reviveCfg = onSpawn.revive || onSpawn.onRevive || onSpawn.revived || null;
      if (reviveCfg && typeof reviveCfg.rage === 'number') return Math.max(0, reviveCfg.rage);
    }

    const fromEffects = extractRageFromEffects(onSpawn, opts);
    if (fromEffects != null) return Math.max(0, fromEffects);

    const rage = onSpawn.rage;
    if (typeof rage === 'number') return Math.max(0, rage);
    if (typeof rage === 'string' && rage.trim() !== ''){
      const parsed = Number(rage);
      if (!Number.isNaN(parsed)) return Math.max(0, parsed);
    }
    if (rage && typeof rage === 'object'){
      if (revive && typeof rage.revive === 'number') return Math.max(0, rage.revive);
      if (isLeader && typeof rage.leader === 'number') return Math.max(0, rage.leader);
      if (!isLeader){
        if (typeof rage.deck === 'number') return Math.max(0, rage.deck);
        if (typeof rage.nonLeader === 'number') return Math.max(0, rage.nonLeader);
      }
      if (typeof rage.default === 'number') return Math.max(0, rage.default);
      if (typeof rage.value === 'number') return Math.max(0, rage.value);
    }

    if (onSpawn.deck && typeof onSpawn.deck.rage === 'number' && !isLeader){
      return Math.max(0, onSpawn.deck.rage);
    }
    if (onSpawn.default && typeof onSpawn.default.rage === 'number'){
      return Math.max(0, onSpawn.default.rage);
    }
    if (revive && typeof onSpawn.reviveRage === 'number'){
      return Math.max(0, onSpawn.reviveRage);
    }
    if (typeof onSpawn.defaultRage === 'number'){
      return Math.max(0, onSpawn.defaultRage);
    }
    if (typeof onSpawn.rageOnSummon === 'number' && !isLeader){
      return Math.max(0, onSpawn.rageOnSummon);
    }
    return null;
  }

  function verticalNeighbors(baseSlot){
    const row = (baseSlot - 1) % 3;
    const list = [];
    if (row > 0) list.push(baseSlot - 1);
    if (row < 2) list.push(baseSlot + 1);
    return list;
  }

  function rowNeighbors(baseSlot){
    const col = Math.floor((baseSlot - 1) / 3);
    const row = (baseSlot - 1) % 3;
    const left  = (col < 2) ? ((col + 1) * 3 + row + 1) : null;
    const right = (col > 0) ? ((col - 1) * 3 + row + 1) : null;
    return [right, left].filter(Boolean);
  }

  function resolveSummonSlots(spec, baseSlot){
    if (!spec || !Number.isFinite(baseSlot)) return [];
    if (Array.isArray(spec.slots) && spec.slots.length){
      return spec.slots.filter(s => Number.isFinite(s)).map(s => s|0);
    }

    const patternRaw = spec.pattern || spec.placement || spec.shape || spec.area;
    const pattern = normalizeKey(patternRaw);
    if (!pattern){
      return verticalNeighbors(baseSlot);
    }

    switch(pattern){
      case 'verticalneighbors':
      case 'columnneighbors':
      case 'column':
      case 'adjacentcolumn':
        return verticalNeighbors(baseSlot);
      case 'rowneighbors':
      case 'horizontalneighbors':
      case 'adjacentrow':
        return rowNeighbors(baseSlot);
      case 'adjacent':
      case 'adjacentall':
      case 'neighbors': {
        const merged = [...verticalNeighbors(baseSlot), ...rowNeighbors(baseSlot)];
        return Array.from(new Set(merged));
      }
      case 'self':
        return [baseSlot];
      default:
        return verticalNeighbors(baseSlot);
    }
  }

  exports.kitSupportsSummon = kitSupportsSummon;
  exports.getSummonSpec = getSummonSpec;
  exports.detectUltBehavior = detectUltBehavior;
  exports.extractOnSpawnRage = extractOnSpawnRage;
  exports.resolveSummonSlots = resolveSummonSlots;
  exports.kitUltHasTag = kitUltHasTag;
  exports.collectUltTags = collectUltTags;
  exports.getReviveSpec = getReviveSpec;
});
__define('./utils/time.js', (exports, module, __require) => {
  const perf = typeof globalThis !== 'undefined' ? globalThis.performance : undefined;
  const hasPerfNow = !!(perf && typeof perf.now === 'function');
  let lastFallbackNow = 0;

  function safeNow(){
    if (hasPerfNow) return perf.now();
    const current = Date.now();
    if (current <= lastFallbackNow) {
      lastFallbackNow += 1;
      return lastFallbackNow;
    }
    lastFallbackNow = current;
    return current;
  }
  exports.safeNow = safeNow;
});
__define('./vfx.js', (exports, module, __require) => {
  // 0.7 vfx.js
  // VFX layer: spawn pop, hit ring, ranged tracer, melee step-in/out
  // Không thay đổi logic combat/turn — chỉ vẽ đè.
  // Durations: spawn 500ms, hit 380ms, tracer 400ms, melee 1100ms.

  const __dep0 = __require('./engine.js');
  const projectCellOblique = __dep0.projectCellOblique;
  const __dep1 = __require('./config.js');
  const CFG = __dep1.CFG;
  const CHIBI = __dep1.CHIBI;
  const __dep2 = __require('./utils/time.js');
  const safeNow = __dep2.safeNow;
  const __dep3 = __require('./data/vfx_anchors/loithienanh.json');
  const loithienanhAnchors = __dep3.default ?? __dep3;

  const now = () => safeNow();
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) * 0.5;
  const isFiniteCoord = (value) => Number.isFinite(value);
  const hasFinitePoint = (obj) => obj && isFiniteCoord(obj.cx) && isFiniteCoord(obj.cy);
  const warnInvalidArc = (label, data) => {
    if (typeof console !== 'undefined' && console?.warn) {
      console.warn(`[vfxDraw] Skipping ${label} arc due to invalid geometry`, data);
    }
  };

  const DEFAULT_ANCHOR_ID = 'root';
  const DEFAULT_ANCHOR_POINT = { x: 0.5, y: 0.5 };
  const DEFAULT_ANCHOR_RADIUS = 0.2;
  const UNIT_WIDTH_RATIO = 0.9;
  const UNIT_HEIGHT_RATIO = 1.85;
  const DEFAULT_SEGMENTS = 6;

  const VFX_ANCHOR_CACHE = new Map();

  function registerAnchorDataset(dataset) {
    if (!dataset || typeof dataset !== 'object') return;
    const unitId = dataset.unitId || null;
    if (!unitId) return;
    const entry = {
      bodyAnchors: dataset.bodyAnchors || {},
      vfxBindings: dataset.vfxBindings || {},
      ambientEffects: dataset.ambientEffects || {}
    };
    VFX_ANCHOR_CACHE.set(unitId, entry);
  }

  registerAnchorDataset(loithienanhAnchors);

  function getUnitAnchorDataset(unit) {
    if (!unit) return null;
    const id = unit.unitId || unit.id || unit.name || null;
    if (!id) return null;
    return VFX_ANCHOR_CACHE.get(id) || null;
  }

  function resolveBindingAnchor(unit, { anchorId, bindingKey, timing, ambientKey, radius }) {
    const dataset = getUnitAnchorDataset(unit);
    let picked = null;

    if (bindingKey && dataset?.vfxBindings?.[bindingKey]?.anchors) {
      const anchors = dataset.vfxBindings[bindingKey].anchors;
      picked = anchors.find((item) => (timing && item.timing === timing) || (anchorId && item.id === anchorId)) || null;
      if (!picked && timing) {
        picked = anchors.find((item) => item.timing === timing) || null;
      }
      if (!picked && anchorId) {
        picked = anchors.find((item) => item.id === anchorId) || null;
      }
    }

    if (!picked && ambientKey && dataset?.ambientEffects?.[ambientKey]?.anchors) {
      const anchors = dataset.ambientEffects[ambientKey].anchors;
      picked = anchors.find((item) => (timing && item.timing === timing) || (anchorId && item.id === anchorId)) || null;
      if (!picked && timing) {
        picked = anchors.find((item) => item.timing === timing) || null;
      }
      if (!picked && anchorId) {
        picked = anchors.find((item) => item.id === anchorId) || null;
      }
    }

    const resolvedId = picked?.id || anchorId || DEFAULT_ANCHOR_ID;
    const resolvedRadius = Number.isFinite(radius) ? radius : (Number.isFinite(picked?.radius) ? picked.radius : null);

    return { id: resolvedId, radius: resolvedRadius };
  }

  function lookupBodyAnchor(unit, anchorId) {
    const dataset = getUnitAnchorDataset(unit);
    if (!dataset) return null;
    const anchor = dataset.bodyAnchors?.[anchorId];
    if (!anchor) return null;
    const x = Number(anchor.x);
    const y = Number(anchor.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y };
  }

  function createRandomPattern(length = DEFAULT_SEGMENTS) {
    const result = [];
    for (let i = 0; i < length; i += 1) {
      result.push(Math.random() * 2 - 1);
    }
    return result;
  }

  function computeAnchorCanvasPoint(Game, token, anchorId, radiusRatio, cam) {
    if (!Game?.grid || !token || !hasFinitePoint(token)) return null;
    const projection = projectCellOblique(Game.grid, token.cx, token.cy, cam);
    if (!projection || !isFiniteCoord(projection.x) || !isFiniteCoord(projection.y) || !isFiniteCoord(projection.scale)) return null;

    const anchor = lookupBodyAnchor(token, anchorId) || lookupBodyAnchor(token, DEFAULT_ANCHOR_ID) || DEFAULT_ANCHOR_POINT;
    const ax = Number(anchor?.x);
    const ay = Number(anchor?.y);
    const validAnchor = Number.isFinite(ax) && Number.isFinite(ay);
    const xRatio = validAnchor ? (ax - 0.5) : 0;
    const yRatio = validAnchor ? (ay - 0.5) : 0;

    const width = Game.grid.tile * UNIT_WIDTH_RATIO * projection.scale;
    const height = Game.grid.tile * UNIT_HEIGHT_RATIO * projection.scale;
    const px = projection.x + xRatio * width;
    const py = projection.y - yRatio * height;

    if (!isFiniteCoord(px) || !isFiniteCoord(py)) return null;

    const rr = Number.isFinite(radiusRatio) ? radiusRatio : DEFAULT_ANCHOR_RADIUS;
    const rPx = Math.max(2, Math.floor(rr * Game.grid.tile * projection.scale));
    return { x: px, y: py, r: rPx, scale: projection.scale };
  }

  function drawLightningArc(ctx, start, end, event, progress) {
    if (!start) return;
    const segments = Math.max(2, event.segments || DEFAULT_SEGMENTS);
    const color = event.color || '#7de5ff';
    const alpha = (event.alpha ?? 0.9) * (1 - progress);
    const thickness = Math.max(1, Math.floor((event.thickness ?? 2.4) * (start.scale ?? 1)));
    const pattern = Array.isArray(event.pattern) && event.pattern.length ? event.pattern : createRandomPattern(segments - 1);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = thickness;

    if (end) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dist = Math.hypot(dx, dy) || 1;
      const jitterFactor = (event.jitter ?? 0.22) * dist * (1 - progress * 0.6);
      const nx = -dy / dist;
      const ny = dx / dist;

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < segments; i += 1) {
        const t = i / segments;
        const noise = pattern[(i - 1) % pattern.length] || 0;
        const offset = noise * jitterFactor;
        const px = start.x + dx * t + nx * offset;
        const py = start.y + dy * t + ny * offset;
        ctx.lineTo(px, py);
      }
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else {
      const rayCount = segments + 1;
      const baseRadius = start.r * (event.rayScale ?? 2.4) * (1 + 0.2 * (1 - progress));
      for (let i = 0; i < rayCount; i += 1) {
        const seed = pattern[i % pattern.length] || 0;
        const angle = (i / rayCount) * Math.PI * 2 + seed * 0.5;
        const length = Math.max(start.r, baseRadius * (0.6 + Math.abs(seed)));
        const ex = start.x + Math.cos(angle) * length;
        const ey = start.y + Math.sin(angle) * length;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
    }

    if (event.glow !== false) {
      ctx.globalAlpha = alpha * 0.6;
      ctx.lineWidth = Math.max(thickness * 0.75, 1);
      ctx.beginPath();
      ctx.arc(start.x, start.y, Math.max(1, start.r * (event.glowScale ?? 1.1)), 0, Math.PI * 2);
      ctx.stroke();
      if (end) {
        ctx.beginPath();
        ctx.arc(end.x, end.y, Math.max(1, (end.r ?? start.r) * (event.glowScale ?? 1.1)), 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawBloodPulse(ctx, anchor, event, progress) {
    if (!anchor) return;
    const color = event.color || '#ff6b81';
    const rings = Math.max(1, event.rings || 2);
    const alpha = (event.alpha ?? 0.75) * (1 - progress);
    const maxScale = event.maxScale ?? 3.4;
    const growth = easeInOut(progress);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, Math.floor(anchor.r * 0.3));
    for (let i = 0; i < rings; i += 1) {
      const t = (i + 1) / rings;
      const radius = anchor.r * lerp(1, maxScale, Math.pow(growth, 0.8) * t);
      if (!isFiniteCoord(radius) || radius <= 0) continue;
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawShieldWrap(ctx, frontAnchor, backAnchor, event, progress) {
    if (!frontAnchor) return;
    const color = event.color || '#9bd8ff';
    const alpha = (event.alpha ?? 0.6) * (1 - progress * 0.7);
    const thickness = Math.max(2, Math.floor((event.thickness ?? 2.6) * (frontAnchor.scale ?? 1)));
    const spanY = Math.max(frontAnchor.r * (event.heightScale ?? 3.4), 4);
    const spanX = Math.max(frontAnchor.r * (event.widthScale ?? 2.6), 4);
    const wobble = (event.wobble ?? 0.18) * Math.sin(progress * Math.PI * 2);

    const centerX = frontAnchor.x;
    const centerY = frontAnchor.y - wobble * spanY;
    const gradientSpan = spanY * 0.35;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, spanX, spanY, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (backAnchor) {
      ctx.globalAlpha = alpha * 0.55;
      ctx.beginPath();
      ctx.ellipse(backAnchor.x, backAnchor.y + wobble * spanY * 0.6, spanX * 1.1, spanY * 1.05, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (typeof ctx.createLinearGradient === 'function') {
      ctx.globalAlpha = alpha * 0.35;
      const gradient = ctx.createLinearGradient(centerX, centerY - gradientSpan, centerX, centerY + gradientSpan);
      gradient.addColorStop(0, 'rgba(155, 216, 255, 0.0)');
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, 'rgba(155, 216, 255, 0.0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, spanX, spanY, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGroundBurst(ctx, anchor, event, progress) {
    if (!anchor) return;
    const color = event.color || '#ffa36e';
    const alpha = (event.alpha ?? 0.7) * (1 - progress);
    const shards = Math.max(3, event.shards || 5);
    const spread = anchor.r * (event.spread ?? 3.2);
    const lift = anchor.r * 0.4;
    const growth = easeInOut(progress);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    for (let i = 0; i < shards; i += 1) {
      const angle = (i / shards) * Math.PI * 2;
      const distance = spread * (0.4 + growth * 0.6);
      const px = anchor.x + Math.cos(angle) * distance;
      const py = anchor.y + Math.sin(angle) * (distance * 0.35) + lift * (0.5 - growth);
      if (!isFiniteCoord(px) || !isFiniteCoord(py)) continue;
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y);
      ctx.lineTo(px, py);
      ctx.lineTo(anchor.x + Math.cos(angle + 0.1) * (distance * 0.6), anchor.y + Math.sin(angle + 0.1) * (distance * 0.25));
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function pool(Game) {
    if (!Game.vfx) Game.vfx = [];
    return Game.vfx;
  }

  /* ------------------- Adders ------------------- */
  function vfxAddSpawn(Game, cx, cy, side) {
    const spawn = { type: 'spawn', t0: now(), dur: 500, cx, cy, side };
    pool(Game).push(spawn);
  }

  function vfxAddHit(Game, target, opts = {}) {
    pool(Game).push({ type: 'hit', t0: now(), dur: 380, ref: target, ...opts });
  }

  function vfxAddTracer(Game, attacker, target, opts = {}) {
    pool(Game).push({ type: 'tracer', t0: now(), dur: opts.dur || 400, refA: attacker, refB: target });
  }

  function vfxAddMelee(Game, attacker, target, { dur = CFG?.ANIMATION?.meleeDurationMs ?? 1100 } = {}) {
    // Overlay step-in/out (không di chuyển token thật)
    pool(Game).push({ type: 'melee', t0: now(), dur, refA: attacker, refB: target });
  }

  function makeLightningEvent(Game, source, target, opts = {}) {
    const busyMs = Number.isFinite(opts.busyMs) ? opts.busyMs : 420;
    const anchorA = resolveBindingAnchor(source, {
      anchorId: opts.anchorId,
      bindingKey: opts.bindingKey,
      timing: opts.timing,
      radius: opts.anchorRadius
    });
    const anchorB = target ? resolveBindingAnchor(target, {
      anchorId: opts.targetAnchorId,
      bindingKey: opts.targetBindingKey,
      timing: opts.targetTiming,
      radius: opts.targetRadius
    }) : null;

    pool(Game).push({
      type: 'lightning_arc',
      t0: now(),
      dur: busyMs,
      refA: source,
      refB: target || null,
      anchorA: anchorA.id,
      anchorB: anchorB?.id || null,
      radiusA: anchorA.radius,
      radiusB: anchorB?.radius,
      color: opts.color,
      thickness: opts.thickness,
      jitter: opts.jitter,
      pattern: createRandomPattern(DEFAULT_SEGMENTS),
      segments: opts.segments,
      glow: opts.glow,
      glowScale: opts.glowScale,
      rayScale: opts.rayScale
    });
    return busyMs;
  }

  function vfxAddLightningArc(Game, source, target, opts = {}) {
    return makeLightningEvent(Game, source, target, opts);
  }

  function vfxAddBloodPulse(Game, source, opts = {}) {
    const busyMs = Number.isFinite(opts.busyMs) ? opts.busyMs : 560;
    const anchor = resolveBindingAnchor(source, {
      anchorId: opts.anchorId,
      bindingKey: opts.bindingKey,
      timing: opts.timing,
      ambientKey: opts.ambientKey,
      radius: opts.anchorRadius
    });

    pool(Game).push({
      type: 'blood_pulse',
      t0: now(),
      dur: busyMs,
      refA: source,
      anchorA: anchor.id,
      radiusA: anchor.radius,
      color: opts.color,
      rings: opts.rings,
      maxScale: opts.maxScale,
      alpha: opts.alpha
    });
    return busyMs;
  }

  function vfxAddShieldWrap(Game, source, opts = {}) {
    const busyMs = Number.isFinite(opts.busyMs) ? opts.busyMs : 900;
    const front = resolveBindingAnchor(source, {
      anchorId: opts.anchorId,
      bindingKey: opts.bindingKey,
      timing: opts.timing,
      radius: opts.anchorRadius
    });
    const wantsBack = opts.backAnchorId != null || opts.backTiming != null || Number.isFinite(opts.backRadius);
    const back = wantsBack ? resolveBindingAnchor(source, {
      anchorId: opts.backAnchorId,
      bindingKey: opts.bindingKey,
      timing: opts.backTiming,
      radius: opts.backRadius
    }) : null;

    pool(Game).push({
      type: 'shield_wrap',
      t0: now(),
      dur: busyMs,
      refA: source,
      anchorA: front.id,
      anchorB: back?.id || null,
      radiusA: front.radius,
      radiusB: back?.radius,
      color: opts.color,
      alpha: opts.alpha,
      thickness: opts.thickness,
      heightScale: opts.heightScale,
      widthScale: opts.widthScale,
      wobble: opts.wobble
    });
    return busyMs;
  }

  function vfxAddGroundBurst(Game, source, opts = {}) {
    const busyMs = Number.isFinite(opts.busyMs) ? opts.busyMs : 640;
    const anchor = resolveBindingAnchor(source, {
      anchorId: opts.anchorId,
      bindingKey: opts.bindingKey,
      timing: opts.timing,
      radius: opts.anchorRadius
    });

    pool(Game).push({
      type: 'ground_burst',
      t0: now(),
      dur: busyMs,
      refA: source,
      anchorA: anchor.id,
      radiusA: anchor.radius,
      color: opts.color,
      shards: opts.shards,
      spread: opts.spread,
      alpha: opts.alpha
    });
    return busyMs;
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
        if (hasFinitePoint(e)) {
          const p = projectCellOblique(Game.grid, e.cx, e.cy, cam);
          const r0 = Math.max(8, Math.floor(Game.grid.tile * 0.22 * p.scale));
          const r = r0 + Math.floor(r0 * 1.8 * tt);
          if (isFiniteCoord(p.x) && isFiniteCoord(p.y) && isFiniteCoord(r) && r > 0) {
            ctx.save();
            ctx.globalAlpha = 1 - tt;
            ctx.strokeStyle = e.side === 'ally' ? '#9ef0a4' : '#ffb4c0';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
          } else {
            warnInvalidArc('spawn', { x: p?.x, y: p?.y, r });
          }
        }
      }

      else if (e.type === 'hit') {
        const tokens = Array.isArray(Game?.tokens) ? Game.tokens : null;
        const updateFromToken = (token) => {
          if (!token) return;
          if (token.iid != null && e.iid == null) e.iid = token.iid;
          if (isFiniteCoord(token.cx)) e.cx = token.cx;
          if (isFiniteCoord(token.cy)) e.cy = token.cy;
        };

        const initialRef = hasFinitePoint(e.ref) ? e.ref : null;
        updateFromToken(initialRef);

        const lookupLiveToken = () => {
          if (!tokens) return null;
          if (e.iid != null) {
            return tokens.find(t => t && t.iid === e.iid);
          }
        const ref = e.ref;
          if (ref?.iid != null) {
            return tokens.find(t => t && t.iid === ref.iid);
          }
          if (ref?.id != null) {
            return tokens.find(t => t && t.id === ref.id);
          }
          return null;
        };

          if ((!hasFinitePoint(e) || !initialRef) && tokens) {
          const live = lookupLiveToken();
          if (live) {
            e.ref = live;
            updateFromToken(live);
          }
        }

        if (hasFinitePoint(e)) {
          const p = projectCellOblique(Game.grid, e.cx, e.cy, cam);
          const r = Math.floor(Game.grid.tile * 0.25 * (0.6 + 1.1 * tt) * p.scale);
          if (isFiniteCoord(p.x) && isFiniteCoord(p.y) && isFiniteCoord(r) && r > 0) {
            ctx.save();
            ctx.globalAlpha = 0.9 * (1 - tt);
            ctx.strokeStyle = '#e6f2ff';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
          } else {
            warnInvalidArc('hit', { x: p?.x, y: p?.y, r });
          }
        }
      }
      else if (e.type === 'tracer') {
    // disabled: không vẽ “đường trắng” nữa
  }
      else if (e.type === 'melee') {
    const A = e.refA, B = e.refB;
    if (A && B && A.alive && B.alive && hasFinitePoint(A) && hasFinitePoint(B)) {
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

  else if (e.type === 'lightning_arc') {
        const start = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, e.radiusA, cam);
        const end = e.refB ? computeAnchorCanvasPoint(Game, e.refB, e.anchorB, e.radiusB, cam) : null;
        if (start && (!e.refB || end)) {
          drawLightningArc(ctx, start, end, e, tt);
        } else {
          warnInvalidArc('lightning', { start, end });
        }
      }
      else if (e.type === 'blood_pulse') {
        const anchor = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, e.radiusA, cam);
        if (anchor) {
          drawBloodPulse(ctx, anchor, e, tt);
        } else {
          warnInvalidArc('blood_pulse', { anchor });
        }
      }
      else if (e.type === 'shield_wrap') {
        const front = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, e.radiusA, cam);
        const back = e.anchorB ? computeAnchorCanvasPoint(Game, e.refA, e.anchorB, e.radiusB, cam) : null;
        if (front) {
          drawShieldWrap(ctx, front, back, e, tt);
        } else {
          warnInvalidArc('shield_wrap', { front, back });
        }
      }
      else if (e.type === 'ground_burst') {
        const anchor = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, e.radiusA, cam);
        if (anchor) {
          drawGroundBurst(ctx, anchor, e, tt);
        } else {
          warnInvalidArc('ground_burst', { anchor });
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
  exports.vfxAddLightningArc = vfxAddLightningArc;
  exports.vfxAddBloodPulse = vfxAddBloodPulse;
  exports.vfxAddShieldWrap = vfxAddShieldWrap;
  exports.vfxAddGroundBurst = vfxAddGroundBurst;
  exports.vfxDraw = vfxDraw;
});
try {
  __require('./entry.js');
} catch (err) {
  console.error('Failed to bootstrap Arclune bundle:', err);
  throw err;
}
