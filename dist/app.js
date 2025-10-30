// Bundled by build.mjs
const __modules = Object.create(null);
if (typeof globalThis !== "undefined" && typeof globalThis.__modules === "undefined"){ globalThis.__modules = __modules; }
const __legacyModuleAliases = {"./catalog.js":"./catalog.ts","./entry.js":"./entry.ts","./meta.js":"./meta.ts","./modes/coming-soon.stub.js":"./modes/coming-soon.stub.ts","./modes/pve/session.js":"./modes/pve/session.ts","./screens/collection/index.js":"./screens/collection/index.ts","./screens/lineup/index.js":"./screens/lineup/index.ts","@modes/coming-soon.stub.ts":"./modes/coming-soon.stub.ts","@modes/pve/session.ts":"./modes/pve/session.ts","@screens/collection/index.ts":"./screens/collection/index.ts","@screens/lineup/index.ts":"./screens/lineup/index.ts","./ai.js":"./ai.ts","./app/shell.js":"./app/shell.ts","./art.js":"./art.ts","./background.js":"./background.ts","./combat.js":"./combat.ts","./config.js":"./config.ts","./config/schema.js":"./config/schema.ts","./data/announcements.config.js":"./data/announcements.config.ts","./data/announcements.js":"./data/announcements.ts","./data/economy.config.js":"./data/economy.config.ts","./data/economy.js":"./data/economy.ts","./data/load-config.js":"./data/load-config.ts","./data/modes.js":"./data/modes.ts","./data/roster-preview.config.js":"./data/roster-preview.config.ts","./data/roster-preview.js":"./data/roster-preview.ts","./data/skills.config.js":"./data/skills.config.ts","./data/skills.js":"./data/skills.ts","./data/vfx_anchors/schema.js":"./data/vfx_anchors/schema.ts","./engine.js":"./engine.ts","./events.js":"./events.ts","./main.js":"./main.ts","./modes/pve/session-runtime-impl.js":"./modes/pve/session-runtime-impl.ts","./modes/pve/session-runtime.js":"./modes/pve/session-runtime.ts","./modes/pve/session-state.js":"./modes/pve/session-state.ts","./passives.js":"./passives.ts","./scene.js":"./scene.ts","./screens/collection/helpers.js":"./screens/collection/helpers.ts","./screens/collection/state.js":"./screens/collection/state.ts","./screens/collection/types.js":"./screens/collection/types.ts","./screens/collection/view.js":"./screens/collection/view.ts","./screens/lineup/view/events.js":"./screens/lineup/view/events.ts","./screens/lineup/view/index.js":"./screens/lineup/view/index.ts","./screens/lineup/view/render.js":"./screens/lineup/view/render.ts","./screens/lineup/view/state.js":"./screens/lineup/view/state.ts","./screens/main-menu/dialogues.js":"./screens/main-menu/dialogues.ts","./screens/main-menu/types.js":"./screens/main-menu/types.ts","./screens/main-menu/view/events.js":"./screens/main-menu/view/events.ts","./screens/main-menu/view/index.js":"./screens/main-menu/view/index.ts","./screens/main-menu/view/layout.js":"./screens/main-menu/view/layout.ts","./statuses.js":"./statuses.ts","./summon.js":"./summon.ts","./turns.js":"./turns.ts","./turns/interleaved.js":"./turns/interleaved.ts","./types/art.js":"./types/art.ts","./types/combat.js":"./types/combat.ts","./types/common.js":"./types/common.ts","./types/config.js":"./types/config.ts","./types/currency.js":"./types/currency.ts","./types/index.js":"./types/index.ts","./types/lineup.js":"./types/lineup.ts","./types/pve.js":"./types/pve.ts","./types/rng.js":"./types/rng.ts","./types/telemetry.js":"./types/telemetry.ts","./types/turn-order.js":"./types/turn-order.ts","./types/ui.js":"./types/ui.ts","./types/units.js":"./types/units.ts","./types/utils.js":"./types/utils.ts","./types/vfx.js":"./types/vfx.ts","./ui.js":"./ui.ts","./ui/dom.js":"./ui/dom.ts","./units.js":"./units.ts","./utils/assert.js":"./utils/assert.ts","./utils/dummy.js":"./utils/dummy.ts","./utils/format.js":"./utils/format.ts","./utils/fury.js":"./utils/fury.ts","./utils/kit.js":"./utils/kit.ts","./utils/time.js":"./utils/time.ts","./utils/unit-id.js":"./utils/unit-id.ts","./vfx.js":"./vfx.ts"};
if (typeof globalThis !== "undefined" && typeof globalThis.__legacyModuleAliases === "undefined"){ globalThis.__legacyModuleAliases = __legacyModuleAliases; }
function __normalizeModuleId(id){ return __legacyModuleAliases[id] || id; }
function __define(id, factory){ __modules[id] = { factory, exports: null, initialized: false }; }
function __require(id){
  const normalizedId = __normalizeModuleId(id);
  const mod = __modules[normalizedId];
  if (!mod) throw new Error('Module not found: ' + normalizedId);
  if (!mod.initialized){
    mod.initialized = true;
    const module = { exports: {} };
    mod.exports = module.exports;
    mod.factory(module.exports, module, __require);
    mod.exports = module.exports;
  }
  return mod.exports;
}
if (typeof globalThis !== "undefined" && typeof globalThis.__require === "undefined"){ globalThis.__require = __require; }
__define('./ai.ts', (exports, module, __require) => {
  const __dep0 = __require('./engine.ts');
  const pickRandom = __dep0.pickRandom;
  const slotToCell = __dep0.slotToCell;
  const cellReserved = __dep0.cellReserved;
  const __dep1 = __require('./turns.ts');
  const predictSpawnCycle = __dep1.predictSpawnCycle;
  const __dep2 = __require('./config.ts');
  const CFG = __dep2.CFG;
  const __dep3 = __require('./utils/time.ts');
  const sharedSafeNow = __dep3.safeNow;
  const __dep4 = __require('./utils/kit.ts');
  const detectUltBehavior = __dep4.detectUltBehavior;
  const getSummonSpec = __dep4.getSummonSpec;
  const resolveSummonSlots = __dep4.resolveSummonSlots;
  const __dep5 = __require('./units.ts');
  const lookupUnit = __dep5.lookupUnit;
  const __dep6 = __require('./../types/@shared-types/units.d.ts');
  const createSummonQueue = __dep6.createSummonQueue;
  function toMetaEntry(value) {
      if (!value || typeof value !== 'object')
          return null;
      const candidate = value;
      if (typeof candidate.id !== 'string')
          return null;
      if (typeof candidate.class !== 'string')
          return null;
      if (typeof candidate.rank !== 'string')
          return null;
      if (!candidate.kit || typeof candidate.kit !== 'object')
          return null;
      return candidate;
  }
  const safeNow = () => sharedSafeNow();
  const DEFAULT_WEIGHTS = Object.freeze({
      pressure: 0.42,
      safety: 0.2,
      eta: 0.16,
      summon: 0.08,
      kitInstant: 0.06,
      kitDefense: 0.04,
      kitRevive: 0.04,
  });
  const DEFAULT_DEBUG_KEEP = 6;
  const tokensAlive = (Game) => Game.tokens.filter((t) => t.alive);
  function mergedWeights() {
      var _a, _b;
      const cfg = (_b = (_a = CFG.AI) === null || _a === void 0 ? void 0 : _a.WEIGHTS) !== null && _b !== void 0 ? _b : {};
      const out = { ...DEFAULT_WEIGHTS };
      for (const [key, val] of Object.entries(cfg)) {
          if (typeof val === 'number' && Number.isFinite(val))
              out[key] = val;
      }
      return out;
  }
  function debugConfig() {
      var _a, _b, _c, _d;
      const cfg = (_b = (_a = CFG.AI) === null || _a === void 0 ? void 0 : _a.DEBUG) !== null && _b !== void 0 ? _b : {};
      const keepTopRaw = (_d = (_c = cfg.keepTop) !== null && _c !== void 0 ? _c : cfg.KEEP_TOP) !== null && _d !== void 0 ? _d : DEFAULT_DEBUG_KEEP;
      const keepTopNum = Number(keepTopRaw);
      return {
          keepTop: Math.max(0, Math.floor(Number.isFinite(keepTopNum) ? keepTopNum : DEFAULT_DEBUG_KEEP)),
      };
  }
  function detectKitTraits(meta) {
      var _a, _b;
      const kitSource = (_b = (_a = meta === null || meta === void 0 ? void 0 : meta.kit) !== null && _a !== void 0 ? _a : meta) !== null && _b !== void 0 ? _b : {};
      const analysis = detectUltBehavior(kitSource);
      const hasInstant = Boolean(analysis.hasInstant) || ((meta === null || meta === void 0 ? void 0 : meta.class) === 'Summoner' && Boolean(analysis.summon));
      return {
          hasInstant,
          hasDefBuff: Boolean(analysis.hasDefensive),
          hasRevive: Boolean(analysis.hasRevive),
      };
  }
  function exportCandidateDebug(entry) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      if (!entry)
          return null;
      return {
          cardId: (_a = entry.card) === null || _a === void 0 ? void 0 : _a.id,
          cardName: (_c = (_b = entry.card) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : null,
          cost: (_d = entry.card) === null || _d === void 0 ? void 0 : _d.cost,
          slot: (_e = entry.cell) === null || _e === void 0 ? void 0 : _e.s,
          cx: (_f = entry.cell) === null || _f === void 0 ? void 0 : _f.cx,
          cy: (_g = entry.cell) === null || _g === void 0 ? void 0 : _g.cy,
          score: entry.score,
          baseScore: entry.baseScore,
          contributions: entry.contributions,
          raw: entry.raw,
          multipliers: entry.multipliers,
          blocked: (_h = entry.blockedReason) !== null && _h !== void 0 ? _h : null,
      };
  }
  function isAiCard(value) {
      if (!value || typeof value !== 'object')
          return false;
      const candidate = value;
      return typeof candidate.id === 'string' && candidate.id !== '' && typeof candidate.cost === 'number' && Number.isFinite(candidate.cost);
  }
  function normalizeDeckEntry(entry) {
      var _a;
      if (typeof entry === 'string') {
          const def = lookupUnit(entry);
          return def ? { ...def } : null;
      }
      if (isAiCard(entry)) {
          const card = { ...entry };
          return card;
      }
      if (entry && typeof entry === 'object') {
          const candidate = entry;
          const idRaw = typeof candidate.id === 'string' ? candidate.id : null;
          if (!idRaw || idRaw.trim() === '')
              return null;
          const def = lookupUnit(idRaw);
          const fallbackCost = def === null || def === void 0 ? void 0 : def.cost;
          const candidateCost = 'cost' in candidate ? candidate.cost : undefined;
          const cost = typeof candidateCost === 'number' && Number.isFinite(candidateCost)
              ? candidateCost
              : typeof fallbackCost === 'number' && Number.isFinite(fallbackCost)
                  ? fallbackCost
                  : null;
          if (cost === null)
              return null;
          const candidateName = 'name' in candidate ? candidate.name : undefined;
          const name = typeof candidateName === 'string' && candidateName.trim() !== ''
              ? candidateName
              : (_a = def === null || def === void 0 ? void 0 : def.name) !== null && _a !== void 0 ? _a : null;
          const card = {
              ...(def !== null && def !== void 0 ? def : { id: idRaw, cost }),
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
  function getDeck(Game) {
      const source = Game.ai.deck;
      const normalized = [];
      for (const entry of source) {
          const card = normalizeDeckEntry(entry);
          if (card) {
              normalized.push(card);
          }
      }
      Game.ai.deck = normalized;
      return normalized;
  }
  function listEmptyEnemySlots(Game, aliveTokens) {
      const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
      const out = [];
      for (let s = 1; s <= 9; s += 1) {
          const { cx, cy } = slotToCell('enemy', s);
          if (!cellReserved(alive, Game.queued, cx, cy))
              out.push({ s, cx, cy });
      }
      return out;
  }
  function etaScoreEnemy(Game, slot) {
      var _a, _b;
      return predictSpawnCycle(Game, 'enemy', slot) === ((_b = (_a = Game.turn) === null || _a === void 0 ? void 0 : _a.cycle) !== null && _b !== void 0 ? _b : 0) ? 1 : 0.5;
  }
  function pressureScore(cx, cy) {
      const dist = Math.abs(cx - 0) + Math.abs(cy - 1);
      return 1 - Math.min(1, dist / 7);
  }
  function safetyScore(Game, cx, cy, allyTokens) {
      const foesSource = Array.isArray(allyTokens) ? allyTokens : tokensAlive(Game).filter((t) => t.side === 'ally');
      const sameRow = foesSource.filter((t) => t.cy === cy);
      const near = sameRow.filter((t) => Math.abs(t.cx - cx) <= 1).length;
      const far = sameRow.length - near;
      return Math.max(0, Math.min(1, 1 - ((near * 0.6 + far * 0.2) / 3)));
  }
  function summonerFeasibility(Game, unitId, baseSlot, aliveTokens) {
      const meta = toMetaEntry(Game.meta.get(unitId));
      if (!meta || meta.class !== 'Summoner')
          return 1;
      const summonSpec = getSummonSpec(meta);
      if (!summonSpec)
          return 1;
      const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
      const candidateSlots = resolveSummonSlots(summonSpec, baseSlot).filter((slot) => {
          const { cx, cy } = slotToCell('enemy', slot);
          return !cellReserved(alive, Game.queued, cx, cy);
      });
      const countRaw = summonSpec.count;
      const need = Math.max(1, typeof countRaw === 'number' && Number.isFinite(countRaw) ? countRaw : 1);
      return Math.min(1, candidateSlots.length / need);
  }
  function candidateBlocked(Game, entry, aliveTokens) {
      var _a, _b, _c;
      if (!entry)
          return 'invalid';
      const alive = aliveTokens !== null && aliveTokens !== void 0 ? aliveTokens : tokensAlive(Game);
      const slot = (_a = entry.cell) === null || _a === void 0 ? void 0 : _a.s;
      const cx = (_b = entry.cell) === null || _b === void 0 ? void 0 : _b.cx;
      const cy = (_c = entry.cell) === null || _c === void 0 ? void 0 : _c.cy;
      if (!Number.isFinite(slot) || !Number.isFinite(cx) || !Number.isFinite(cy))
          return 'invalid';
      const enemyQueue = Game.queued.enemy;
      if (enemyQueue.has(slot))
          return 'slotQueued';
      if (cellReserved(alive, Game.queued, cx, cy))
          return 'cellReserved';
      const meta = entry.meta;
      if (meta && meta.class === 'Summoner') {
          const summonSpec = getSummonSpec(meta);
          if (summonSpec) {
              const patternSlots = resolveSummonSlots(summonSpec, slot);
              if (patternSlots.length) {
                  let available = 0;
                  for (const s of patternSlots) {
                      const { cx: scx, cy: scy } = slotToCell('enemy', s);
                      if (!cellReserved(alive, Game.queued, scx, scy))
                          available += 1;
                  }
                  const countRaw = Number(summonSpec.count);
                  const need = Math.min(patternSlots.length, Math.max(1, Number.isFinite(countRaw) ? countRaw : 1));
                  if (available < need)
                      return 'summonBlocked';
              }
          }
      }
      return null;
  }
  function rowCrowdingFactor(Game, cy, enemyTokens) {
      var _a, _b;
      const ours = (Array.isArray(enemyTokens) ? enemyTokens : tokensAlive(Game).filter((t) => t.side === 'enemy')).filter((t) => t.cy === cy).length;
      let queued = 0;
      const queue = Game.queued.enemy;
      for (const request of queue.values()) {
          if (request && request.cy === cy)
              queued += 1;
      }
      const n = ours + queued;
      if (n >= 3)
          return 0.7;
      if (n === 2)
          return (_b = (_a = CFG.AI) === null || _a === void 0 ? void 0 : _a.ROW_CROWDING_PENALTY) !== null && _b !== void 0 ? _b : 0.85;
      return 1;
  }
  function roleBias(className, cx) {
      var _a, _b, _c;
      const front = cx <= CFG.GRID_COLS - CFG.ENEMY_COLS;
      const roleCfg = (_c = (_b = (_a = CFG.AI) === null || _a === void 0 ? void 0 : _a.ROLE) === null || _b === void 0 ? void 0 : _b[typeof className === 'string' ? className : '']) !== null && _c !== void 0 ? _c : {};
      let factor = 1;
      if (front && typeof roleCfg.front === 'number')
          factor *= 1 + roleCfg.front;
      if (!front && typeof roleCfg.back === 'number')
          factor *= 1 + roleCfg.back;
      return factor;
  }
  function ensureUsedUnitIds(Game) {
      if (Game.ai.usedUnitIds instanceof Set)
          return Game.ai.usedUnitIds;
      Game.ai.usedUnitIds = new Set();
      return Game.ai.usedUnitIds;
  }
  function isSummonQueue(value) {
      if (!value || typeof value !== 'object')
          return false;
      const candidate = value;
      return (typeof candidate.set === 'function' &&
          typeof candidate.get === 'function' &&
          typeof candidate.clear === 'function');
  }
  function ensureEnemyQueue(Game) {
      const candidate = Game.queued.enemy;
      if (isSummonQueue(candidate)) {
          return candidate;
      }
      const created = createSummonQueue();
      Game.queued.enemy = created;
      return created;
  }
  function refillDeckEnemy(Game) {
      var _a;
      const deck = getDeck(Game);
      const handSize = (_a = CFG.HAND_SIZE) !== null && _a !== void 0 ? _a : 4;
      const need = handSize - deck.length;
      if (need <= 0)
          return;
      const exclude = new Set();
      const usedIds = ensureUsedUnitIds(Game);
      for (const id of usedIds)
          exclude.add(String(id));
      for (const card of deck)
          exclude.add(String(card.id));
      const pool = Game.ai.unitsAll;
      const more = pickRandom(pool, exclude, handSize).slice(0, need);
      const normalized = [];
      for (const entry of more) {
          const card = normalizeDeckEntry(entry);
          if (card)
              normalized.push(card);
      }
      if (!normalized.length)
          return;
      deck.push(...normalized);
  }
  function queueEnemyAt(Game, card, slot, cx, cy, aliveTokens) {
      const cost = Number.isFinite(card.cost) ? card.cost : NaN;
      if (!Number.isFinite(cost) || Game.ai.cost < cost)
          return false;
      if (Game.ai.summoned >= Game.ai.summonLimit)
          return false;
      const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
      if (cellReserved(alive, Game.queued, cx, cy))
          return false;
      const queue = ensureEnemyQueue(Game);
      if (queue.has(slot))
          return false;
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
      if (index >= 0)
          deck.splice(index, 1);
      refillDeckEnemy(Game);
      return true;
  }
  function aiMaybeAct(Game, reason) {
      var _a, _b, _c, _d, _e, _f, _g;
      const now = safeNow();
      if (now - (Game.ai.lastThinkMs || 0) < 120)
          return;
      const weights = mergedWeights();
      const dbgCfg = debugConfig();
      const deck = getDeck(Game);
      const hand = deck.filter((c) => Number.isFinite(c.cost) && Game.ai.cost >= c.cost);
      if (!hand.length) {
          const decision = {
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
          const decision = {
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
      const evaluations = [];
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
              const contributions = {
                  pressure: ((_a = weights.pressure) !== null && _a !== void 0 ? _a : 0) * p,
                  safety: ((_b = weights.safety) !== null && _b !== void 0 ? _b : 0) * s,
                  eta: ((_c = weights.eta) !== null && _c !== void 0 ? _c : 0) * e,
                  summon: ((_d = weights.summon) !== null && _d !== void 0 ? _d : 0) * sf,
                  kitInstant: ((_e = weights.kitInstant) !== null && _e !== void 0 ? _e : 0) * kitInstantScore,
                  kitDefense: ((_f = weights.kitDefense) !== null && _f !== void 0 ? _f : 0) * kitDefenseScore,
                  kitRevive: ((_g = weights.kitRevive) !== null && _g !== void 0 ? _g : 0) * kitReviveScore,
              };
              const baseScore = Object.values(contributions).reduce((acc, val) => acc + val, 0);
              const rowFactor = rowCrowdingFactor(Game, cell.cy, aliveEnemies);
              const roleFactor = roleBias(meta === null || meta === void 0 ? void 0 : meta.class, cell.cx);
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
                      kitRevive: kitReviveScore,
                  },
                  multipliers: { row: rowFactor, role: roleFactor },
              });
          }
      }
      if (!evaluations.length) {
          const decision = {
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
      evaluations.sort((a, b) => b.score - a.score);
      let chosen = null;
      for (const entry of evaluations) {
          const blocked = candidateBlocked(Game, entry, alive);
          if (blocked) {
              entry.blockedReason = blocked;
              continue;
          }
          const ok = queueEnemyAt(Game, entry.card, entry.cell.s, entry.cell.cx, entry.cell.cy, alive);
          if (ok) {
              chosen = entry;
              break;
          }
          entry.blockedReason = 'queueFailed';
      }
      const considered = dbgCfg.keepTop > 0 ? evaluations.slice(0, dbgCfg.keepTop).map(exportCandidateDebug).filter(Boolean) : [];
      const decision = {
          reason,
          at: now,
          weights,
          chosen: exportCandidateDebug(chosen),
          considered: considered,
          skipped: chosen ? null : 'allBlocked',
      };
      Game.ai.lastDecision = decision;
      Game.ai.lastThinkMs = now;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'refillDeckEnemy')) exports.refillDeckEnemy = refillDeckEnemy;
  if (!Object.prototype.hasOwnProperty.call(exports, 'queueEnemyAt')) exports.queueEnemyAt = queueEnemyAt;
  if (!Object.prototype.hasOwnProperty.call(exports, 'aiMaybeAct')) exports.aiMaybeAct = aiMaybeAct;
});
__define('./app/shell.ts', (exports, module, __require) => {
  const DEFAULT_SCREEN = 'main-menu';
  function cloneParams(params) {
      if (params === null) {
          return null;
      }
      const cloned = { ...params };
      return Object.freeze(cloned);
  }
  function cloneState(state) {
      const snapshot = {
          screen: state.screen,
          activeSession: state.activeSession,
          screenParams: cloneParams(state.screenParams),
      };
      return Object.freeze(snapshot);
  }
  function normalizeScreen(screen) {
      if (screen === null || screen === undefined || screen === '') {
          return DEFAULT_SCREEN;
      }
      return screen;
  }
  function normalizeParams(params) {
      if (params === null || params === undefined) {
          return null;
      }
      return cloneParams(params);
  }
  function areParamsShallowEqual(current, next) {
      if (current === next) {
          return true;
      }
      if (current === null || next === null) {
          return false;
      }
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);
      if (currentKeys.length !== nextKeys.length) {
          return false;
      }
      for (const key of currentKeys) {
          if (!Object.prototype.hasOwnProperty.call(next, key)) {
              return false;
          }
          if (current[key] !== next[key]) {
              return false;
          }
      }
      return true;
  }
  function normalizeSession(session) {
      if (session === null || session === undefined) {
          return null;
      }
      return session;
  }
  function createAppShell(options = {}) {
      var _a;
      const initialScreen = normalizeScreen(options.screen);
      const initialSession = normalizeSession((_a = options.activeSession) !== null && _a !== void 0 ? _a : null);
      const initialParams = normalizeParams(options.screenParams);
      const state = {
          screen: initialScreen,
          activeSession: initialSession,
          screenParams: initialParams,
      };
      const listeners = new Set();
      let errorHandler = typeof options.onError === 'function' ? options.onError : null;
      function dispatchError(error, context) {
          console.error('[shell] listener error', error);
          if (!errorHandler) {
              return;
          }
          const normalizedContext = context !== null && context !== void 0 ? context : null;
          try {
              errorHandler(error, normalizedContext);
          }
          catch (handlerError) {
              console.error('[shell] error handler failure', handlerError);
          }
      }
      function notify() {
          const snapshot = cloneState(state);
          for (const fn of listeners) {
              try {
                  fn(snapshot);
              }
              catch (err) {
                  dispatchError(err, { phase: 'notify', listener: fn });
              }
          }
      }
      function setScreen(nextScreen, params) {
          const target = normalizeScreen(nextScreen);
          let changed = false;
          if (state.screen !== target) {
              state.screen = target;
              changed = true;
          }
          const nextParams = params !== null && params !== void 0 ? params : null;
          if (!areParamsShallowEqual(state.screenParams, nextParams)) {
              state.screenParams = normalizeParams(nextParams);
              changed = true;
          }
          if (changed) {
              notify();
          }
      }
      function setSession(nextSession) {
          const normalizedSession = normalizeSession(nextSession);
          if (state.activeSession === normalizedSession) {
              return;
          }
          state.activeSession = normalizedSession;
          notify();
      }
      function subscribe(handler) {
          if (typeof handler !== 'function') {
              return () => undefined;
          }
          listeners.add(handler);
          try {
              handler(cloneState(state));
          }
          catch (err) {
              dispatchError(err, { phase: 'subscribe', listener: handler });
          }
          return () => {
              listeners.delete(handler);
          };
      }
      const api = {
          enterScreen(key, params) {
              setScreen(key, params);
          },
          setActiveSession(session) {
              setSession(session);
          },
          clearActiveSession() {
              if (state.activeSession === null) {
                  return;
              }
              state.activeSession = null;
              notify();
          },
          getState() {
              return cloneState(state);
          },
          onChange: subscribe,
          setErrorHandler(handler) {
              if (typeof handler === 'function') {
                  errorHandler = handler;
              }
              else {
                  errorHandler = null;
              }
          },
      };
      return api;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'createAppShell')) exports.createAppShell = createAppShell;
});
__define('./art.ts', (exports, module, __require) => {
  // v0.7.7 – Unit art catalog
  function svgData(width, height, body) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  function sanitizeId(base, palette) {
      const seed = `${palette.primary || ''}${palette.secondary || ''}${palette.accent || ''}`.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
      return `${base}${seed}` || `${base}0`;
  }
  const DEFAULT_PALETTE = {
      primary: '#7fa6c0',
      secondary: '#1d2b38',
      accent: '#d6f2ff',
      outline: '#223548',
  };
  function normalizePalette(palette) {
      var _a, _b, _c, _d;
      if (!palette) {
          return { ...DEFAULT_PALETTE };
      }
      return {
          primary: (_a = palette.primary) !== null && _a !== void 0 ? _a : DEFAULT_PALETTE.primary,
          secondary: (_b = palette.secondary) !== null && _b !== void 0 ? _b : DEFAULT_PALETTE.secondary,
          accent: (_c = palette.accent) !== null && _c !== void 0 ? _c : DEFAULT_PALETTE.accent,
          outline: (_d = palette.outline) !== null && _d !== void 0 ? _d : DEFAULT_PALETTE.outline,
      };
  }
  function ensurePalette(palette) {
      return normalizePalette(palette);
  }
  function svgShield(paletteInput) {
      const palette = ensurePalette(paletteInput);
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
  function svgWing(paletteInput) {
      const palette = ensurePalette(paletteInput);
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
  function svgRune(paletteInput) {
      const palette = ensurePalette(paletteInput);
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
  function svgBloom(paletteInput) {
      const palette = ensurePalette(paletteInput);
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
  function svgPike(paletteInput) {
      const palette = ensurePalette(paletteInput);
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
  function svgSentinel(paletteInput) {
      const palette = ensurePalette(paletteInput);
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
  function merge(target, source) {
      return Object.assign({}, target, source !== null && source !== void 0 ? source : {});
  }
  const UNIT_SKIN_SELECTION = new Map();
  function hasArtEntry(key) {
      return Object.prototype.hasOwnProperty.call(UNIT_ART, key);
  }
  function getArtEntry(key) {
      var _a;
      if (hasArtEntry(key)) {
          const entry = (_a = UNIT_ART[key]) !== null && _a !== void 0 ? _a : UNIT_ART.default;
          return entry;
      }
      return UNIT_ART.default;
  }
  function getBaseArt(id) {
      const fallback = getArtEntry('default');
      if (!id)
          return fallback;
      if (hasArtEntry(id)) {
          return getArtEntry(id);
      }
      if (id.endsWith('_minion')) {
          const base = id.replace(/_minion$/, '');
          const minionKey = `${base}_minion`;
          if (hasArtEntry(minionKey)) {
              return getArtEntry(minionKey);
          }
          if (hasArtEntry('minion')) {
              return getArtEntry('minion');
          }
      }
      return fallback;
  }
  function resolveSkinKey(id, baseArt, explicit) {
      var _a;
      if (!baseArt)
          return null;
      if (explicit && baseArt.skins[explicit])
          return explicit;
      const idKey = id !== null && id !== void 0 ? id : '';
      const override = UNIT_SKIN_SELECTION.get(idKey);
      if (override && baseArt.skins[override])
          return override;
      if (baseArt.defaultSkin && baseArt.skins[baseArt.defaultSkin])
          return baseArt.defaultSkin;
      const keys = Object.keys((_a = baseArt.skins) !== null && _a !== void 0 ? _a : {});
      return keys[0] || null;
  }
  function cloneShadowConfig(shadow) {
      if (!shadow)
          return null;
      return {
          color: shadow.color,
          blur: shadow.blur,
          offsetX: shadow.offsetX,
          offsetY: shadow.offsetY,
      };
  }
  function cloneShadow(shadow) {
      if (shadow === null || shadow === undefined)
          return null;
      if (typeof shadow === 'string')
          return shadow;
      return cloneShadowConfig(shadow);
  }
  function cloneSpriteEntry(sprite, fallbackKey) {
      var _a, _b, _c, _d;
      if (!sprite)
          return null;
      const preferredKey = typeof sprite.key === 'string' && sprite.key.length > 0
          ? sprite.key
          : typeof fallbackKey === 'string' && fallbackKey.length > 0
              ? fallbackKey
              : 'default';
      const cloned = {
          ...sprite,
          key: preferredKey,
          aspect: (_a = sprite.aspect) !== null && _a !== void 0 ? _a : null,
          shadow: cloneShadowConfig(sprite.shadow),
          skinId: (_c = (_b = sprite.skinId) !== null && _b !== void 0 ? _b : fallbackKey) !== null && _c !== void 0 ? _c : preferredKey,
          cacheKey: (_d = sprite.cacheKey) !== null && _d !== void 0 ? _d : null,
      };
      return cloned;
  }
  function instantiateArt(_id, baseArt, skinKey) {
      var _a, _b, _c;
      if (!baseArt)
          return null;
      const normalizedSkinKey = (_a = skinKey !== null && skinKey !== void 0 ? skinKey : baseArt.defaultSkin) !== null && _a !== void 0 ? _a : null;
      const clonedSkins = {};
      for (const [key, sprite] of Object.entries((_b = baseArt.skins) !== null && _b !== void 0 ? _b : {})) {
          const clone = cloneSpriteEntry(sprite, key);
          if (clone)
              clonedSkins[key] = clone;
      }
      const sourceSprite = normalizedSkinKey && baseArt.skins
          ? (_c = baseArt.skins[normalizedSkinKey]) !== null && _c !== void 0 ? _c : baseArt.sprite
          : baseArt.sprite;
      const selectedSprite = cloneSpriteEntry(sourceSprite, normalizedSkinKey);
      const art = {
          ...baseArt,
          sprite: selectedSprite,
          skins: clonedSkins,
          defaultSkin: baseArt.defaultSkin,
          palette: ensurePalette(baseArt.palette),
          shape: baseArt.shape,
          size: baseArt.size,
          shadow: cloneShadow(baseArt.shadow),
          glow: baseArt.glow,
          mirror: baseArt.mirror,
          layout: { ...baseArt.layout },
          label: baseArt.label === false ? false : { ...baseArt.label },
          hpBar: { ...baseArt.hpBar },
          skinKey: normalizedSkinKey,
      };
      return art;
  }
  function setUnitSkin(unitId, skinKey) {
      if (!unitId)
          return false;
      const baseArt = getBaseArt(unitId);
      if (!baseArt || !baseArt.skins)
          return false;
      if (!skinKey) {
          UNIT_SKIN_SELECTION.delete(unitId);
          return true;
      }
      if (baseArt.skins[skinKey]) {
          UNIT_SKIN_SELECTION.set(unitId, skinKey);
          return true;
      }
      return false;
  }
  function getUnitSkin(unitId) {
      var _a;
      if (!unitId)
          return null;
      const baseArt = getBaseArt(unitId);
      if (!baseArt)
          return null;
      const override = UNIT_SKIN_SELECTION.get(unitId);
      if (override && baseArt.skins[override])
          return override;
      if (baseArt.defaultSkin && baseArt.skins[baseArt.defaultSkin])
          return baseArt.defaultSkin;
      const keys = Object.keys((_a = baseArt.skins) !== null && _a !== void 0 ? _a : {});
      return keys[0] || null;
  }
  function normalizeShadow(shadow, fallback) {
      var _a, _b, _c;
      if (shadow === null)
          return null;
      const base = {
          color: 'rgba(0,0,0,0.35)',
          blur: 18,
          offsetX: 0,
          offsetY: 10,
      };
      const fallbackColor = typeof fallback === 'string'
          ? fallback
          : fallback && typeof fallback === 'object'
              ? (_a = fallback.color) !== null && _a !== void 0 ? _a : null
              : null;
      if (fallbackColor) {
          base.color = fallbackColor;
      }
      if (typeof shadow === 'string') {
          return { ...base, color: shadow };
      }
      if (shadow && typeof shadow === 'object') {
          return {
              color: (_b = shadow.color) !== null && _b !== void 0 ? _b : base.color,
              blur: Number.isFinite(shadow.blur) ? shadow.blur : base.blur,
              offsetX: Number.isFinite(shadow.offsetX) ? shadow.offsetX : base.offsetX,
              offsetY: Number.isFinite(shadow.offsetY) ? shadow.offsetY : base.offsetY,
          };
      }
      if (fallback && typeof fallback === 'object') {
          return {
              color: (_c = fallback.color) !== null && _c !== void 0 ? _c : base.color,
              blur: Number.isFinite(fallback.blur) ? fallback.blur : base.blur,
              offsetX: Number.isFinite(fallback.offsetX) ? fallback.offsetX : base.offsetX,
              offsetY: Number.isFinite(fallback.offsetY) ? fallback.offsetY : base.offsetY,
          };
      }
      return { ...base };
  }
  function normalizeSpriteEntry(conf, context) {
      var _a, _b;
      if (!conf)
          return null;
      const input = typeof conf === 'string' ? { src: conf } : conf;
      const srcCandidate = (_b = (_a = input.src) !== null && _a !== void 0 ? _a : input.url) !== null && _b !== void 0 ? _b : null;
      if (!srcCandidate)
          return null;
      const normalizedShadow = normalizeShadow(input.shadow, context.shadow);
      return {
          src: srcCandidate,
          anchor: Number.isFinite(input.anchor) ? input.anchor : context.anchor,
          scale: Number.isFinite(input.scale) ? input.scale : 1,
          aspect: Number.isFinite(input.aspect) ? input.aspect : null,
          shadow: normalizedShadow,
          skinId: typeof input.skinId === 'string'
              ? input.skinId
              : typeof input.key === 'string'
                  ? input.key
                  : typeof input.id === 'string'
                      ? input.id
                      : null,
          cacheKey: typeof input.cacheKey === 'string' ? input.cacheKey : null,
      };
  }
  function makeArt(pattern, paletteInput, opts = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
      const normalizedPalette = normalizePalette(paletteInput);
      const spriteFactory = (_a = opts.spriteFactory) !== null && _a !== void 0 ? _a : (pattern in SPRITES ? SPRITES[pattern] : null);
      const layout = merge({
          anchor: 0.78,
          labelOffset: 1.18,
          labelFont: 0.72,
          hpOffset: 1.46,
          hpWidth: 2.4,
          hpHeight: 0.42,
          spriteAspect: 0.78,
          spriteHeight: 2.4,
      }, ((_b = opts.layout) !== null && _b !== void 0 ? _b : undefined));
      const label = opts.label === false
          ? false
          : merge({
              bg: 'rgba(12,20,30,0.82)',
              text: '#f4f8ff',
              stroke: 'rgba(255,255,255,0.08)',
          }, (_c = opts.label) !== null && _c !== void 0 ? _c : undefined);
      const hpBar = merge({
          bg: 'rgba(9,14,21,0.74)',
          fill: normalizedPalette.accent || '#6ff0c0',
          border: 'rgba(0,0,0,0.55)',
      }, ((_d = opts.hpBar) !== null && _d !== void 0 ? _d : undefined));
      const shadow = (_e = opts.shadow) !== null && _e !== void 0 ? _e : 'rgba(0,0,0,0.35)';
      const defaultSkinKey = opts.defaultSkin || 'default';
      const skinsInput = (_f = opts.skins) !== null && _f !== void 0 ? _f : (opts.sprite ? { [defaultSkinKey]: opts.sprite } : null);
      const normalizedSkins = {};
      const anchor = (_g = layout.anchor) !== null && _g !== void 0 ? _g : 0.78;
      if (skinsInput) {
          for (const [key, conf] of Object.entries(skinsInput)) {
              const normalized = normalizeSpriteEntry(conf, { anchor, shadow });
              if (!normalized)
                  continue;
              normalizedSkins[key] = {
                  ...normalized,
                  key,
                  skinId: typeof normalized.skinId === 'string' ? normalized.skinId : key,
              };
          }
      }
      else if (opts.sprite !== null && spriteFactory) {
          const generated = normalizeSpriteEntry({ src: spriteFactory(normalizedPalette) }, { anchor, shadow });
          if (generated) {
              normalizedSkins[defaultSkinKey] = {
                  ...generated,
                  key: defaultSkinKey,
                  skinId: typeof generated.skinId === 'string' ? generated.skinId : defaultSkinKey,
              };
          }
      }
      const preferredKey = normalizedSkins[defaultSkinKey]
          ? defaultSkinKey
          : Object.keys(normalizedSkins)[0] || defaultSkinKey;
      return {
          sprite: (_h = normalizedSkins[preferredKey]) !== null && _h !== void 0 ? _h : null,
          skins: normalizedSkins,
          defaultSkin: preferredKey,
          palette: normalizedPalette,
          shape: opts.shape || pattern,
          size: (_j = opts.size) !== null && _j !== void 0 ? _j : 1,
          shadow,
          glow: (_l = (_k = opts.glow) !== null && _k !== void 0 ? _k : normalizedPalette.accent) !== null && _l !== void 0 ? _l : '#8cf6ff',
          mirror: (_m = opts.mirror) !== null && _m !== void 0 ? _m : true,
          layout,
          label,
          hpBar,
      };
  }
  const basePalettes = {
      default: { primary: '#7fa6c0', secondary: '#1d2b38', accent: '#d6f2ff', outline: '#223548' },
      leaderA: { primary: '#74cfff', secondary: '#123c55', accent: '#dff7ff', outline: '#1a4d68' },
      leaderB: { primary: '#ff9aa0', secondary: '#4a1921', accent: '#ffd9dd', outline: '#571f28' },
      phe: { primary: '#a884ff', secondary: '#2b1954', accent: '#f1ddff', outline: '#3a2366' },
      kiem: { primary: '#ffd37a', secondary: '#5b2f12', accent: '#fff3c3', outline: '#4a260f' },
      loithien: { primary: '#8bd1ff', secondary: '#163044', accent: '#c7f1ff', outline: '#1e3e53' },
      laky: { primary: '#ffc9ec', secondary: '#7c336a', accent: '#ffeef9', outline: '#5a214b' },
      kydieu: { primary: '#a0f2d4', secondary: '#1f4f47', accent: '#e7fff5', outline: '#1b3c36' },
      doanminh: { primary: '#ffe6a5', secondary: '#3e2b12', accent: '#fff8da', outline: '#2f2110' },
      tranquat: { primary: '#89f5ff', secondary: '#1a3651', accent: '#d0fbff', outline: '#223e58' },
      linhgac: { primary: '#9ec4ff', secondary: '#2a3f5c', accent: '#e4f1ff', outline: '#24364c' },
      minion: { primary: '#ffd27d', secondary: '#5a3a17', accent: '#fff4cc', outline: '#452b0f' }
  };
  function getBasePalette(name) {
      var _a;
      return (_a = basePalettes[name]) !== null && _a !== void 0 ? _a : basePalettes.default;
  }
  const UNIT_ART = {
      default: makeArt('sentinel', getBasePalette('default'), {
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
      leaderA: makeArt('shield', getBasePalette('leaderA'), {
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
      leaderB: makeArt('wing', getBasePalette('leaderB'), {
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
      phe: makeArt('rune', getBasePalette('phe'), {
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
      kiemtruongda: makeArt('pike', getBasePalette('kiem'), {
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
      loithienanh: makeArt('sentinel', getBasePalette('loithien'), {
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
      laky: makeArt('bloom', getBasePalette('laky'), {
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
      kydieu: makeArt('rune', getBasePalette('kydieu'), {
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
      doanminh: makeArt('pike', getBasePalette('doanminh'), {
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
      tranquat: makeArt('rune', getBasePalette('tranquat'), {
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
      linhgac: makeArt('sentinel', getBasePalette('linhgac'), {
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
      minion: makeArt('pike', getBasePalette('minion'), {
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
  function getUnitArt(id, opts = {}) {
      var _a;
      const baseArt = getBaseArt(id);
      const skinKey = resolveSkinKey(id, baseArt, (_a = opts.skinKey) !== null && _a !== void 0 ? _a : null);
      return instantiateArt(id, baseArt, skinKey);
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'UNIT_ART')) exports.UNIT_ART = UNIT_ART;
  if (!Object.prototype.hasOwnProperty.call(exports, 'setUnitSkin')) exports.setUnitSkin = setUnitSkin;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getUnitSkin')) exports.getUnitSkin = getUnitSkin;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getUnitArt')) exports.getUnitArt = getUnitArt;
});
__define('./background.ts', (exports, module, __require) => {
  const __dep0 = __require('./config.ts');
  const CFG = __dep0.CFG;
  const __dep1 = __require('./engine.ts');
  const ensureSpriteLoaded = __dep1.ensureSpriteLoaded;
  const projectCellOblique = __dep1.projectCellOblique;
  const ENVIRONMENT_SPRITE_CACHE = new Map();
  function ensureEnvironmentSprite(asset) {
      var _a;
      if (!asset)
          return null;
      const cached = ENVIRONMENT_SPRITE_CACHE.get(asset);
      if (cached !== undefined)
          return cached;
      const descriptor = {
          sprite: {
              src: asset,
              key: asset,
              anchor: 1,
              scale: 1,
              aspect: null,
              shadow: null,
              skinId: null,
              cacheKey: asset,
          },
      };
      const entry = (_a = ensureSpriteLoaded(descriptor)) !== null && _a !== void 0 ? _a : null;
      ENVIRONMENT_SPRITE_CACHE.set(asset, entry);
      return entry;
  }
  const BACKGROUND_PROP_CACHE = new WeakMap();
  const isRecord = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
  const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
  const toNumberOr = (value, fallback) => (isFiniteNumber(value) ? value : fallback);
  const toOptionalNumber = (value) => (isFiniteNumber(value) ? value : undefined);
  const mergePalette = (...palettes) => {
      const result = {};
      for (const palette of palettes) {
          if (!palette || !isRecord(palette))
              continue;
          if (typeof palette.primary === 'string')
              result.primary = palette.primary;
          if (typeof palette.secondary === 'string')
              result.secondary = palette.secondary;
          if (typeof palette.accent === 'string')
              result.accent = palette.accent;
          if (typeof palette.shadow === 'string')
              result.shadow = palette.shadow;
          if (typeof palette.outline === 'string')
              result.outline = palette.outline;
      }
      return result;
  };
  const cloneFallback = (fallback) => {
      if (!fallback || !isRecord(fallback))
          return null;
      const clone = {};
      if (typeof fallback.shape === 'string')
          clone.shape = fallback.shape;
      return clone;
  };
  const normalizeVector = (value, fallbackX, fallbackY) => {
      const record = isRecord(value) ? value : {};
      return {
          x: toNumberOr(record.x, fallbackX),
          y: toNumberOr(record.y, fallbackY),
      };
  };
  const normalizeSize = (value, fallbackW, fallbackH) => {
      const record = isRecord(value) ? value : {};
      return {
          w: toNumberOr(record.w, fallbackW),
          h: toNumberOr(record.h, fallbackH),
      };
  };
  const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const SCENERY = {
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
              outline: 'rgba(16,20,32,0.78)',
          },
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
              outline: 'rgba(46,23,11,0.78)',
          },
      },
  };
  const ENVIRONMENT_PROP_TYPES = SCENERY;
  const isSceneryKey = (value) => typeof value === 'string' && hasOwn(SCENERY, value);
  const normalizePropInput = (value) => {
      var _a, _b, _c;
      if (!isRecord(value))
          return null;
      const type = typeof value.type === 'string' ? value.type : null;
      if (!type)
          return null;
      const cellRecord = isRecord(value.cell) ? value.cell : {};
      const cx = toNumberOr((_a = value.cx) !== null && _a !== void 0 ? _a : cellRecord.cx, 0);
      const cy = toNumberOr((_b = value.cy) !== null && _b !== void 0 ? _b : cellRecord.cy, 0);
      const depth = toOptionalNumber((_c = cellRecord.depth) !== null && _c !== void 0 ? _c : value.depth);
      const prop = {
          ...value,
          type,
          cell: { cx, cy, ...(depth !== undefined ? { depth } : {}) },
          asset: typeof value.asset === 'string' ? value.asset : null,
          fallback: cloneFallback(value.fallback),
          palette: mergePalette(value.palette),
          anchor: isRecord(value.anchor) ? { ...value.anchor } : null,
          size: isRecord(value.size) ? { ...value.size } : null,
          baseLift: toOptionalNumber(value.baseLift),
          pixelOffset: isRecord(value.pixelOffset) ? { ...value.pixelOffset } : null,
          cx: toOptionalNumber(value.cx),
          cy: toOptionalNumber(value.cy),
      };
      return prop;
  };
  const normalizeBackgroundDefinition = (value) => {
      if (!isRecord(value))
          return null;
      const propsInput = Array.isArray(value.props) ? value.props : [];
      const props = [];
      for (const prop of propsInput) {
          const normalized = normalizePropInput(prop);
          if (normalized)
              props.push(normalized);
      }
      return { props };
  };
  let BACKGROUND_CONFIG_MAP = null;
  function getBackgroundConfigMap() {
      if (BACKGROUND_CONFIG_MAP)
          return BACKGROUND_CONFIG_MAP;
      const map = new Map();
      const entries = CFG.BACKGROUNDS && typeof CFG.BACKGROUNDS === 'object'
          ? Object.entries(CFG.BACKGROUNDS)
          : [];
      for (const [key, entry] of entries) {
          const normalized = normalizeBackgroundDefinition(entry);
          if (normalized) {
              map.set(key, normalized);
          }
      }
      BACKGROUND_CONFIG_MAP = map;
      return map;
  }
  function stableStringify(value, seen = new WeakSet()) {
      var _a;
      if (value === null)
          return 'null';
      const type = typeof value;
      if (type === 'undefined')
          return 'undefined';
      if (type === 'number' || type === 'boolean' || type === 'bigint')
          return String(value);
      if (type === 'string')
          return JSON.stringify(value);
      if (type === 'symbol')
          return (_a = value === null || value === void 0 ? void 0 : value.toString()) !== null && _a !== void 0 ? _a : '[symbol]';
      if (type === 'function') {
          const func = value;
          return `[Function:${func.name || 'anonymous'}]`;
      }
      if (Array.isArray(value)) {
          return `[${value.map((entry) => stableStringify(entry, seen)).join(',')}]`;
      }
      if (type === 'object') {
          const objectValue = value;
          if (seen.has(objectValue))
              return '"[Circular]"';
          seen.add(objectValue);
          const keys = Object.keys(objectValue).sort();
          const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key], seen)}`);
          seen.delete(objectValue);
          return `{${entries.join(',')}}`;
      }
      return String(value);
  }
  function computePropsSignature(props) {
      if (!props || !props.length)
          return 'len:0';
      try {
          return stableStringify(props);
      }
      catch {
          return `len:${props.length}`;
      }
  }
  function joinSignatureParts(parts) {
      if (!Array.isArray(parts) || parts.length === 0) {
          return '';
      }
      const normalized = [];
      for (const part of parts) {
          if (part == null) {
              normalized.push('');
              continue;
          }
          if (typeof part === 'number') {
              normalized.push(Number.isFinite(part) ? String(part) : '');
              continue;
          }
          normalized.push(String(part));
      }
      return normalized.join('|');
  }
  function getBoardSignature(g, cam) {
      var _a, _b, _c;
      if (!g)
          return 'no-grid';
      const baseParts = [
          g.cols,
          g.rows,
          g.tile,
          g.ox,
          g.oy,
          g.w,
          g.h,
          g.pad,
          g.dpr,
      ];
      const camParts = [
          (_a = cam === null || cam === void 0 ? void 0 : cam.rowGapRatio) !== null && _a !== void 0 ? _a : 'rg',
          (_b = cam === null || cam === void 0 ? void 0 : cam.topScale) !== null && _b !== void 0 ? _b : 'ts',
          (_c = cam === null || cam === void 0 ? void 0 : cam.depthScale) !== null && _c !== void 0 ? _c : 'ds',
      ];
      return joinSignatureParts([...baseParts, ...camParts]);
  }
  function resolveBackground(backgroundKey) {
      var _a, _b, _c, _d, _e, _f;
      const backgrounds = getBackgroundConfigMap();
      if (backgrounds.size === 0)
          return null;
      const tryResolve = (key) => {
          if (!key)
              return null;
          const config = backgrounds.get(key);
          return config ? { key, config } : null;
      };
      const direct = tryResolve(backgroundKey !== null && backgroundKey !== void 0 ? backgroundKey : null);
      if (direct)
          return direct;
      const preferred = typeof CFG.CURRENT_BACKGROUND === 'string'
          ? CFG.CURRENT_BACKGROUND
          : typeof ((_a = CFG.SCENE) === null || _a === void 0 ? void 0 : _a.CURRENT_BACKGROUND) === 'string'
              ? (_b = CFG.SCENE) === null || _b === void 0 ? void 0 : _b.CURRENT_BACKGROUND
              : null;
      const preferredMatch = tryResolve(preferred);
      if (preferredMatch)
          return preferredMatch;
      const themeKey = typeof ((_c = CFG.SCENE) === null || _c === void 0 ? void 0 : _c.CURRENT_THEME) === 'string'
          ? (_d = CFG.SCENE) === null || _d === void 0 ? void 0 : _d.CURRENT_THEME
          : typeof ((_e = CFG.SCENE) === null || _e === void 0 ? void 0 : _e.DEFAULT_THEME) === 'string'
              ? (_f = CFG.SCENE) === null || _f === void 0 ? void 0 : _f.DEFAULT_THEME
              : null;
      const themeMatch = tryResolve(themeKey);
      if (themeMatch)
          return themeMatch;
      const firstEntry = backgrounds.entries().next();
      if (!firstEntry.done) {
          const [key, config] = firstEntry.value;
          return { key, config };
      }
      return null;
  }
  function normalizePropConfig(propCfg) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
      if (!propCfg)
          return null;
      const typeId = typeof propCfg.type === 'string' ? propCfg.type : null;
      const typeKey = typeId && isSceneryKey(typeId) ? typeId : null;
      const typeDef = typeKey ? ENVIRONMENT_PROP_TYPES[typeKey] : null;
      const anchorDefaults = (_a = typeDef === null || typeDef === void 0 ? void 0 : typeDef.anchor) !== null && _a !== void 0 ? _a : null;
      const sizeDefaults = (_b = typeDef === null || typeDef === void 0 ? void 0 : typeDef.size) !== null && _b !== void 0 ? _b : null;
      const anchor = normalizeVector(propCfg.anchor, (_c = anchorDefaults === null || anchorDefaults === void 0 ? void 0 : anchorDefaults.x) !== null && _c !== void 0 ? _c : 0.5, (_d = anchorDefaults === null || anchorDefaults === void 0 ? void 0 : anchorDefaults.y) !== null && _d !== void 0 ? _d : 1);
      const size = normalizeSize(propCfg.size, (_e = sizeDefaults === null || sizeDefaults === void 0 ? void 0 : sizeDefaults.w) !== null && _e !== void 0 ? _e : 120, (_f = sizeDefaults === null || sizeDefaults === void 0 ? void 0 : sizeDefaults.h) !== null && _f !== void 0 ? _f : 180);
      const palette = mergePalette((_g = typeDef === null || typeDef === void 0 ? void 0 : typeDef.palette) !== null && _g !== void 0 ? _g : null, (_h = propCfg.palette) !== null && _h !== void 0 ? _h : null);
      const cellCx = toNumberOr((_j = propCfg.cx) !== null && _j !== void 0 ? _j : (_k = propCfg.cell) === null || _k === void 0 ? void 0 : _k.cx, 0);
      const cellCy = toNumberOr((_l = propCfg.cy) !== null && _l !== void 0 ? _l : (_m = propCfg.cell) === null || _m === void 0 ? void 0 : _m.cy, 0);
      const depth = toNumberOr((_p = (_o = propCfg.cell) === null || _o === void 0 ? void 0 : _o.depth) !== null && _p !== void 0 ? _p : propCfg.depth, 0);
      return {
          type: typeId,
          asset: typeof propCfg.asset === 'string' ? propCfg.asset : (_q = typeDef === null || typeDef === void 0 ? void 0 : typeDef.asset) !== null && _q !== void 0 ? _q : null,
          fallback: (_s = (_r = cloneFallback(propCfg.fallback)) !== null && _r !== void 0 ? _r : cloneFallback(typeDef === null || typeDef === void 0 ? void 0 : typeDef.fallback)) !== null && _s !== void 0 ? _s : null,
          palette,
          anchor,
          size,
          cell: { cx: cellCx, cy: cellCy },
          depth,
          baseLift: toNumberOr(propCfg.baseLift, (_t = typeDef === null || typeDef === void 0 ? void 0 : typeDef.baseLift) !== null && _t !== void 0 ? _t : 0.5),
          offset: {
              x: toNumberOr((_u = propCfg.offset) === null || _u === void 0 ? void 0 : _u.x, 0),
              y: toNumberOr((_v = propCfg.offset) === null || _v === void 0 ? void 0 : _v.y, 0),
          },
          pixelOffset: {
              x: toNumberOr((_w = propCfg.pixelOffset) === null || _w === void 0 ? void 0 : _w.x, 0),
              y: toNumberOr((_x = propCfg.pixelOffset) === null || _x === void 0 ? void 0 : _x.y, 0),
          },
          scale: toNumberOr(propCfg.scale, 1),
          alpha: toNumberOr(propCfg.alpha, 1),
          flip: toNumberOr(propCfg.flip, 1),
          sortBias: toNumberOr(propCfg.sortBias, 0),
      };
  }
  function getBackgroundPropCache(config) {
      var _a;
      if (!config)
          return null;
      const props = Array.isArray(config.props) ? config.props : [];
      const signature = computePropsSignature(props);
      let cache = BACKGROUND_PROP_CACHE.get(config);
      if (!cache || cache.signature !== signature) {
          const normalizedProps = [];
          for (const rawProp of props) {
              const prop = normalizePropConfig(rawProp);
              if (!prop)
                  continue;
              const cyWithDepth = prop.cell.cy + prop.depth;
              const spriteEntry = ensureEnvironmentSprite((_a = prop.asset) !== null && _a !== void 0 ? _a : '');
              normalizedProps.push({
                  prop,
                  base: {
                      cx: prop.cell.cx,
                      cyWithDepth,
                  },
                  spriteEntry,
              });
          }
          cache = {
              signature,
              normalizedProps,
              boardStates: new Map(),
          };
          BACKGROUND_PROP_CACHE.set(config, cache);
      }
      return cache;
  }
  function buildBoardState(normalizedProps, g, cam) {
      var _a, _b, _c;
      if (!g)
          return undefined;
      const rowGap = ((_a = (cam === null || cam === void 0 ? void 0 : cam.rowGapRatio)) !== null && _a !== void 0 ? _a : 0.62) * g.tile;
      const drawables = [];
      for (const entry of normalizedProps) {
          if (!(entry === null || entry === void 0 ? void 0 : entry.prop))
              continue;
          const { prop, base } = entry;
          const projection = projectCellOblique(g, base.cx, base.cyWithDepth, cam);
          const scale = projection.scale * prop.scale;
          const spriteEntry = (_b = entry.spriteEntry) !== null && _b !== void 0 ? _b : ensureEnvironmentSprite((_c = prop.asset) !== null && _c !== void 0 ? _c : '');
          entry.spriteEntry = spriteEntry;
          drawables.push({
              prop,
              x: projection.x + prop.offset.x * g.tile + prop.pixelOffset.x,
              y: projection.y + prop.baseLift * rowGap + prop.offset.y * rowGap + prop.pixelOffset.y,
              scale,
              spriteEntry,
              sortY: projection.y + prop.sortBias,
          });
      }
      drawables.sort((a, b) => a.sortY - b.sortY);
      return {
          signature: getBoardSignature(g, cam),
          drawables,
      };
  }
  function drawFallback(ctx, width, height, anchor, palette, fallback) {
      var _a;
      const primary = (palette === null || palette === void 0 ? void 0 : palette.primary) || '#ccd7ec';
      const secondary = (palette === null || palette === void 0 ? void 0 : palette.secondary) || '#7b86a1';
      const accent = (palette === null || palette === void 0 ? void 0 : palette.accent) || '#f4f7ff';
      const shadow = (palette === null || palette === void 0 ? void 0 : palette.shadow) || 'rgba(18,22,34,0.65)';
      const outline = (palette === null || palette === void 0 ? void 0 : palette.outline) || 'rgba(12,18,28,0.9)';
      const top = -height * ((_a = anchor === null || anchor === void 0 ? void 0 : anchor.y) !== null && _a !== void 0 ? _a : 1);
      const bottom = top + height;
      const halfW = width / 2;
      ctx.save();
      ctx.beginPath();
      switch (fallback === null || fallback === void 0 ? void 0 : fallback.shape) {
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
  function drawEnvironmentProps(ctx, g, cam, backgroundKey) {
      var _a, _b;
      if (!ctx || !g)
          return;
      const resolved = resolveBackground(backgroundKey !== null && backgroundKey !== void 0 ? backgroundKey : null);
      if (!resolved)
          return;
      const { config } = resolved;
      if (!config || config.enabled === false)
          return;
      const cache = getBackgroundPropCache(config);
      const normalizedProps = cache === null || cache === void 0 ? void 0 : cache.normalizedProps;
      if (!normalizedProps || !normalizedProps.length)
          return;
      const boardSignature = getBoardSignature(g, cam);
      let boardState = cache.boardStates.get(boardSignature);
      if (!boardState) {
          boardState = buildBoardState(normalizedProps, g, cam);
          if (!boardState)
              return;
          cache.boardStates.set(boardSignature, boardState);
      }
      for (const item of boardState.drawables) {
          const { prop } = item;
          let width = prop.size.w * item.scale;
          let height = prop.size.h * item.scale;
          const spriteEntry = item.spriteEntry;
          if (spriteEntry && spriteEntry.status === 'ready' && spriteEntry.img) {
              const naturalW = spriteEntry.img.naturalWidth || prop.size.w;
              const naturalH = spriteEntry.img.naturalHeight || prop.size.h;
              width = naturalW * item.scale;
              height = naturalH * item.scale;
          }
          ctx.save();
          ctx.globalAlpha = prop.alpha;
          ctx.translate(item.x, item.y);
          if (prop.flip === -1) {
              ctx.scale(-1, 1);
          }
          const drawX = -width * ((_a = prop.anchor.x) !== null && _a !== void 0 ? _a : 0.5);
          const drawY = -height * ((_b = prop.anchor.y) !== null && _b !== void 0 ? _b : 1);
          if (spriteEntry && spriteEntry.status === 'ready' && spriteEntry.img) {
              ctx.drawImage(spriteEntry.img, drawX, drawY, width, height);
          }
          else {
              drawFallback(ctx, width, height, prop.anchor, prop.palette, prop.fallback);
          }
          ctx.restore();
      }
  }
  function getEnvironmentBackground(backgroundKey) {
      const resolved = resolveBackground(backgroundKey !== null && backgroundKey !== void 0 ? backgroundKey : null);
      return resolved ? resolved.config : null;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'SCENERY')) exports.SCENERY = SCENERY;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ENVIRONMENT_PROP_TYPES')) exports.ENVIRONMENT_PROP_TYPES = ENVIRONMENT_PROP_TYPES;
  if (!Object.prototype.hasOwnProperty.call(exports, 'drawEnvironmentProps')) exports.drawEnvironmentProps = drawEnvironmentProps;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getEnvironmentBackground')) exports.getEnvironmentBackground = getEnvironmentBackground;
});
__define('./catalog.ts', (exports, module, __require) => {
  // @ts-check
  //v0.8
  // 1) Rank multiplier (đơn giản) — áp lên TẤT CẢ stat trừ SPD
  const __dep0 = __require('./utils/kit.ts');
  const kitSupportsSummon = __dep0.kitSupportsSummon;
  const asUnknownRecord = (value) => value;
  const asUnknownRecordArray = (value) => value;
  const isObjectLike = (value) => (!!value && typeof value === 'object' && !Array.isArray(value));
  const asUnitKitConfig = (value) => (isObjectLike(value) ? value : null);
  const RANK_MULT = {
      N: 0.80,
      R: 0.90,
      SR: 1.05,
      SSR: 1.25,
      UR: 1.50,
      Prime: 1.80,
  };
  // 2) Class base (mốc lv1 để test). SPD không chịu rank multiplier.
  const CLASS_BASE = {
      Mage: { HP: 360, ATK: 28, WIL: 30, ARM: 0.08, RES: 0.12, AGI: 10, PER: 12, SPD: 1.00, AEmax: 110, AEregen: 8.0, HPregen: 14 },
      Tanker: { HP: 500, ATK: 22, WIL: 20, ARM: 0.18, RES: 0.14, AGI: 9, PER: 10, SPD: 0.95, AEmax: 60, AEregen: 4.0, HPregen: 22 },
      Ranger: { HP: 360, ATK: 35, WIL: 16, ARM: 0.08, RES: 0.08, AGI: 12, PER: 14, SPD: 1.20, AEmax: 75, AEregen: 7.0, HPregen: 12 },
      Warrior: { HP: 400, ATK: 30, WIL: 18, ARM: 0.14, RES: 0.08, AGI: 11, PER: 11, SPD: 1.10, AEmax: 70, AEregen: 6.0, HPregen: 16 },
      Summoner: { HP: 330, ATK: 22, WIL: 26, ARM: 0.08, RES: 0.14, AGI: 10, PER: 10, SPD: 1.05, AEmax: 90, AEregen: 8.5, HPregen: 18 },
      Support: { HP: 380, ATK: 24, WIL: 24, ARM: 0.10, RES: 0.13, AGI: 10, PER: 11, SPD: 1.00, AEmax: 100, AEregen: 7.5, HPregen: 20 },
      Assassin: { HP: 320, ATK: 36, WIL: 16, ARM: 0.06, RES: 0.08, AGI: 14, PER: 16, SPD: 1.25, AEmax: 65, AEregen: 6.0, HPregen: 10 }
  };
  const isRankName = (value) => value in RANK_MULT;
  const isClassName = (value) => value in CLASS_BASE;
  // 3) Helper: áp rank & mod (mods không áp vào SPD)
  function applyRankAndMods(base, rank, mods = {}) {
      var _a, _b, _c;
      const multiplier = (_a = RANK_MULT[rank]) !== null && _a !== void 0 ? _a : 1;
      const out = { ...base };
      const keys = Object.keys(base);
      for (const key of keys) {
          const baseValue = (_b = base[key]) !== null && _b !== void 0 ? _b : 0;
          const mod = 1 + ((_c = mods === null || mods === void 0 ? void 0 : mods[key]) !== null && _c !== void 0 ? _c : 0);
          if (key === 'SPD') { // SPD không nhân theo bậc
              out[key] = Math.round(baseValue * mod * 100) / 100;
              continue;
          }
          const precision = (key === 'ARM' || key === 'RES') ? 100 : (key === 'AEregen' ? 10 : 1);
          out[key] = Math.round(baseValue * mod * multiplier * precision) / precision;
      }
      return out;
  }
  // 4) Roster (dex/meta) — 8 nhân vật, ngân sách mod bằng nhau (~+20% tổng, không đụng SPD)
  //  - onSpawn.rage: 100 cho mọi unit từ deck (trừ leader). Revive không áp quy tắc này.
  //  - kit.traits.summon / kit.ult.summon đánh dấu Summoner -> kích hoạt Immediate Summon (action-chain).
  const ROSTER = [
      {
          id: 'phe', name: 'Phệ', class: 'Mage', rank: 'Prime',
          mods: { WIL: 0.10, AEregen: 0.10 }, // 20% tổng
          kit: {
              onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
              basic: asUnknownRecord({
                  name: 'Đánh Thường',
                  tags: ['single-target', 'lifesteal', 'mark'],
                  lifesteal: 0.10,
                  mark: { id: 'mark_devour', maxStacks: 3, ttlTurns: 3 }
              }),
              skills: asUnknownRecordArray([
                  {
                      key: 'skill1',
                      name: 'Song Huyết Cầu',
                      cost: { aether: 25 },
                      hits: 2,
                      countsAsBasic: true,
                      targets: 'randomEnemies',
                      notes: 'Mỗi hit làm mới thời hạn Phệ Ấn.'
                  },
                  {
                      key: 'skill2',
                      name: 'Huyết Chướng',
                      cost: { aether: 25 },
                      duration: 2,
                      reduceDamage: 0.30,
                      healPercentMaxHPPerTurn: 0.15,
                      untargetable: true
                  },
                  {
                      key: 'skill3',
                      name: 'Huyết Thệ',
                      cost: { aether: 40 },
                      duration: 5,
                      link: { sharePercent: 0.5, maxLinks: 1 }
                  }
              ]),
              ult: asUnknownRecord({
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
              }),
              talent: asUnknownRecord({
                  name: 'Phệ Ấn',
                  id: 'mark_devour',
                  maxStacks: 3,
                  ttlTurns: 3,
                  explosion: { scaleWIL: 0.50 },
                  blessing: { hpMax: 0.15, hpRegen: 0.50 }
              }),
              technique: null,
              passives: asUnknownRecordArray([
                  {
                      id: 'mark_devour',
                      name: 'Phệ Ấn',
                      when: 'onBasicHit',
                      effect: 'placeMark',
                      params: { stacksToExplode: 3, ttlTurns: 3, dmgFromWIL: 0.5, purgeable: false }
                  }
              ]),
              traits: asUnknownRecordArray([
                  { id: 'mark_cap', text: 'Phệ Ấn tối đa 3 tầng và tự kích nổ vào lượt của mục tiêu.' },
                  { id: 'overheal_cap', text: 'Hút máu dư chuyển thành Giáp Máu tối đa bằng 100% Máu tối đa.' },
                  { id: 'link_limit', text: 'Chỉ duy trì 1 liên kết Huyết Thệ cùng lúc.' }
              ])
          }
      },
      {
          id: 'kiemtruongda', name: 'Kiếm Trường Dạ', class: 'Warrior', rank: 'Prime',
          mods: { ATK: 0.12, PER: 0.08 },
          kit: {
              onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
              basic: asUnknownRecord({
                  name: 'Đánh Thường',
                  tags: ['single-target', 'armor-pierce'],
                  piercePercent: 0.05
              }),
              skills: asUnknownRecordArray([
                  {
                      key: 'skill1',
                      name: 'Loạn Trảm Dạ Hành',
                      cost: { aether: 25 },
                      countsAsBasic: true,
                      targets: 'randomRow',
                      damageMultiplier: 1.50
                  },
                  {
                      key: 'skill2',
                      name: 'Ngũ Kiếm Huyền Ấn',
                      cost: { aether: 20 },
                      duration: 'battle',
                      randomStance: ['Kiếm Sinh', 'Kiếm Ma', 'Kiếm Thổ', 'Kiếm Hỏa', 'Kiếm Hư']
                  },
                  {
                      key: 'skill3',
                      name: 'Kiếm Ý Tinh Luyện',
                      cost: { aether: 25 },
                      delayTurns: 1,
                      duration: 3,
                      buffStats: { ATK: 0.20, WIL: 0.20 }
                  }
              ]),
              ult: asUnknownRecord({
                  type: 'strikeLaneMid',
                  countsAsBasic: true,
                  hits: 4,
                  penRES: 0.30,
                  bonusVsLeader: 0.20,
                  targets: 'columnMid'
              }),
              talent: asUnknownRecord({
                  name: 'Kiếm Tâm',
                  scaling: { stats: { ATK: 0.05, WIL: 0.05 }, basedOn: 'battleStart' }
              }),
              technique: null,
              passives: asUnknownRecordArray([
                  {
                      id: 'atk_on_ult',
                      name: 'Kiếm Tâm - ATK',
                      when: 'onUltCast',
                      effect: 'gainATK%',
                      params: { amount: 0.05, duration: 'perm', stack: true, purgeable: false }
                  },
                  {
                      id: 'wil_on_ult',
                      name: 'Kiếm Tâm - WIL',
                      when: 'onUltCast',
                      effect: 'gainWIL%',
                      params: { amount: 0.05, duration: 'perm', stack: true, purgeable: false }
                  }
              ]),
              traits: asUnknownRecordArray([
                  { id: 'stance_unique', text: 'Ngũ Kiếm Huyền Ấn chỉ chọn 1 trạng thái cho tới hết trận.' },
                  { id: 'refine_delay', text: 'Kiếm Ý Tinh Luyện kích hoạt sau 1 lượt trì hoãn.' },
                  { id: 'ult_scaling', text: 'Mỗi lần dùng Vạn Kiếm Quy Tông cộng vĩnh viễn +5% ATK/WIL (không giới hạn).' }
              ])
          }
      },
      {
          id: 'loithienanh', name: 'Lôi Thiên Ảnh', class: 'Tanker', rank: 'SSR',
          mods: { RES: 0.10, WIL: 0.10 },
          kit: {
              onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
              basic: asUnknownRecord({
                  name: 'Đánh Thường',
                  hits: 2,
                  tags: ['multi-hit', 'spd-debuff'],
                  debuff: { stat: 'SPD', amount: -0.02, maxStacks: 5 }
              }),
              skills: asUnknownRecordArray([
                  {
                      key: 'skill1',
                      name: 'Lôi Ảnh Tam Kích',
                      cost: { aether: 25 },
                      hits: 3,
                      countsAsBasic: true,
                      targets: 'randomEnemies',
                      bonusIfAdjacent: 0.10
                  },
                  {
                      key: 'skill2',
                      name: 'Ngũ Lôi Phệ Thân',
                      cost: { aether: 35 },
                      hpTradePercent: 0.05,
                      hits: 5,
                      targets: 'randomEnemies'
                  },
                  {
                      key: 'skill3',
                      name: 'Lôi Thể Bách Chiến',
                      cost: { aether: 30 },
                      bonusMaxHPBase: 0.20,
                      limitUses: 3
                  }
              ]),
              ult: asUnknownRecord({
                  type: 'hpTradeBurst',
                  countsAsBasic: true,
                  hpTradePercent: 0.15,
                  hits: 3,
                  damage: { percentTargetMaxHP: 0.07, bossPercent: 0.04, scaleWIL: 0.50 },
                  reduceDmg: 0.30,
                  duration: 2,
                  appliesDebuff: { stat: 'SPD', amount: -0.02, maxStacks: 5 },
                  notes: 'Không tự sát, tối thiểu còn 1 HP.'
              }),
              talent: asUnknownRecord({
                  name: 'Song Thể Lôi Đạo',
                  conditional: {
                      ifHPAbove: 0.5,
                      stats: { ARM: 0.20, RES: 0.20 },
                      elseStats: { ATK: 0.20, WIL: 0.20 }
                  }
              }),
              technique: null,
              passives: asUnknownRecordArray([
                  {
                      id: 'swap_res_wil',
                      name: 'Song Thể Lôi Đạo',
                      when: 'onTurnStart',
                      effect: 'conditionalBuff',
                      params: { ifHPgt: 0.5, RES: 0.20, ARM: 0.20, elseATK: 0.20, elseWIL: 0.20, purgeable: false }
                  }
              ]),
              traits: asUnknownRecordArray([
                  { id: 'hp_trade_limits', text: 'Mọi kỹ năng đốt máu không thể khiến Lôi Thiên Ảnh tự sát (tối thiểu còn 1 HP).' },
                  { id: 'spd_burn', text: 'Giảm SPD cộng dồn tối đa 5 tầng từ đòn đánh thường và tuyệt kỹ.' },
                  { id: 'body_fortify_lock', text: 'Lôi Thể Bách Chiến bị khoá vĩnh viễn sau 3 lần sử dụng.' }
              ])
          }
      },
      {
          id: 'laky', name: 'La Kỳ', class: 'Support', rank: 'SSR',
          mods: { WIL: 0.10, PER: 0.10 },
          kit: {
              onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
              basic: asUnknownRecord({
                  name: 'Đánh Thường',
                  tags: ['single-target', 'sleep-setup'],
                  debuff: { id: 'me_hoac', stacks: 1, maxStacks: 4 }
              }),
              skills: asUnknownRecordArray([
                  {
                      key: 'skill1',
                      name: 'Mộng Trảo',
                      cost: { aether: 25 },
                      hits: 3,
                      countsAsBasic: true,
                      targets: 'randomEnemies'
                  },
                  {
                      key: 'skill2',
                      name: 'Vạn Mộng Trận',
                      cost: { aether: 35 },
                      hits: 5,
                      countsAsBasic: true,
                      targets: 'randomEnemies'
                  },
                  {
                      key: 'skill3',
                      name: 'Mộng Giới Hộ Thân',
                      cost: { aether: 20 },
                      duration: 3,
                      reduceDamage: 0.20
                  }
              ]),
              ult: asUnknownRecord({ type: 'sleep', targets: 3, turns: 2, bossModifier: 0.5 }),
              talent: asUnknownRecord({
                  name: 'Mê Mộng Chú',
                  resPerSleeping: 0.02
              }),
              technique: null,
              passives: asUnknownRecordArray([
                  {
                      id: 'res_per_sleeping_enemy',
                      name: 'Mê Mộng Chú',
                      when: 'onTurnStart',
                      effect: 'gainRES%',
                      params: { perTarget: 0.02, unlimited: true }
                  }
              ]),
              traits: asUnknownRecordArray([
                  { id: 'me_hoac_limit', text: 'Tối đa 4 tầng Mê Hoặc, kích hoạt ngủ trong 1 lượt rồi đặt lại.' },
                  { id: 'boss_sleep_half', text: 'Boss PvE chỉ ngủ nửa thời gian (làm tròn xuống).' }
              ])
          }
      },
      {
          id: 'kydieu', name: 'Kỳ Diêu', class: 'Support', rank: 'SR',
          mods: { WIL: 0.10, RES: 0.10 },
          kit: {
              onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
              basic: asUnknownRecord({
                  name: 'Đánh Thường',
                  tags: ['single-target']
              }),
              skills: asUnknownRecordArray([
                  { key: 'skill1', name: 'Tế Lễ Phản Hồn', cost: { aether: 20 }, duration: 3, selfRegenPercent: 0.08 },
                  {
                      key: 'skill2',
                      name: 'Thí Thân Hộ Chủ',
                      cost: { aether: 15 },
                      sacrifice: true,
                      reviveDelayTurns: 4,
                      reviveReturn: { hpPercent: 0.5, ragePercent: 0.5, aether: 0 },
                      grantLeader: { buff: 'indomitability', stacks: 1 }
                  },
                  { key: 'skill3', name: 'Tế Vũ Tăng Bão', cost: { aether: 20 }, duration: 4, rageGainBonus: 0.50 }
              ]),
              ult: asUnknownRecord({ type: 'revive', targets: 1, revived: { rage: 0, lockSkillsTurns: 1, hpPercent: 0.15 } }),
              talent: asUnknownRecord({
                  name: 'Phục Tế Khôi Minh',
                  perActionStacks: { ARM: 0.03, RES: 0.03 }
              }),
              technique: null,
              passives: asUnknownRecordArray([
                  {
                      id: 'res_stack_per_action',
                      name: 'Phục Tế Khôi Minh',
                      when: 'onActionEnd',
                      effect: 'gainRES%',
                      params: { amount: 0.01, stack: true, purgeable: false }
                  }
              ]),
              traits: asUnknownRecordArray([
                  { id: 'self_sacrifice_return', text: 'Sau 4 lượt tự hiến, Kỳ Diêu hồi sinh với 50% HP, 50% nộ và 0 Aether; sân kín thì biến mất.' },
                  { id: 'revive_lock', text: 'Đồng minh do tuyệt kỹ hồi sinh bị khoá kỹ năng 1 lượt và nộ về 0.' }
              ])
          }
      },
      {
          id: 'doanminh', name: 'Doãn Minh', class: 'Support', rank: 'SR',
          mods: { WIL: 0.10, AEmax: 0.10 },
          kit: {
              onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true, teamHealOnEntry: 0.05 }),
              basic: asUnknownRecord({
                  name: 'Đánh Thường',
                  tags: ['single-target']
              }),
              skills: asUnknownRecordArray([
                  { key: 'skill1', name: 'Cán Cân Giáng Phạt', cost: { aether: 20 }, countsAsBasic: true, damageMultiplier: 1.50 },
                  { key: 'skill2', name: 'Phán Xét Cứu Rỗi', cost: { aether: 15 }, healPercentCasterMaxHP: 0.10, targets: 3 },
                  { key: 'skill3', name: 'Cân Bằng Sinh Mệnh', cost: { aether: 15 }, bonusMaxHPBase: 0.10, limitUses: 5 }
              ]),
              ult: asUnknownRecord({ type: 'equalizeHP', allies: 3, healLeader: true, leaderHealPercentCasterMaxHP: 0.10 }),
              talent: asUnknownRecord({
                  name: 'Thăng Bình Pháp Lực',
                  onSpawnHealPercent: 0.05
              }),
              technique: null,
              passives: asUnknownRecordArray([]),
              traits: asUnknownRecordArray([
                  { id: 'hp_balance', text: 'Cân bằng HP không vượt quá ngưỡng tối đa và bỏ qua Leader.' },
                  { id: 'hp_gain_cap', text: 'Cân Bằng Sinh Mệnh chỉ dùng tối đa 5 lần mỗi trận.' }
              ])
          }
      },
      {
          id: 'tranquat', name: 'Trần Quát', class: 'Summoner', rank: 'R',
          mods: { ATK: 0.10, PER: 0.10 },
          kit: {
              onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
              basic: asUnknownRecord({
                  name: 'Đánh Thường',
                  tags: ['single-target']
              }),
              skills: asUnknownRecordArray([
                  { key: 'skill1', name: 'Sai Khiển Tiểu Đệ', cost: { aether: 15 }, ordersMinions: 2 },
                  { key: 'skill2', name: 'Khiên Mộc Dẫn Địch', cost: { aether: 20 }, duration: 3, applyTauntToMinions: true },
                  {
                      key: 'skill3',
                      name: 'Tăng Cường Tòng Bộc',
                      cost: { aether: 20 },
                      inheritBonus: { HP: 0.20, ATK: 0.20, WIL: 0.20 },
                      limitUses: 5
                  }
              ]),
              ult: asUnknownRecord({
                  type: 'summon',
                  pattern: 'verticalNeighbors',
                  count: 2,
                  ttl: 4,
                  inherit: { HP: 0.50, ATK: 0.50, WIL: 0.50 },
                  limit: 2,
                  replace: 'oldest',
                  creep: { hasRage: false, canChain: false, basicOnly: true }
              }),
              talent: asUnknownRecord({
                  name: 'Đại Ca Đầu Đàn',
                  perMinionBasicBonus: 0.15,
                  onMinionDeath: { stats: { ATK: 0.05, WIL: 0.05 }, maxStacks: 3 }
              }),
              technique: null,
              passives: asUnknownRecordArray([
                  {
                      id: 'basic_dmg_per_minion',
                      name: 'Đại Ca Đầu Đàn',
                      when: 'onBasicHit',
                      effect: 'gainBonus',
                      params: { perMinion: 0.02 }
                  }
              ]),
              traits: asUnknownRecordArray([
                  { id: 'summon_ttl', text: 'Tiểu đệ tồn tại tối đa 4 lượt và không thể hồi sinh.' },
                  { id: 'summon_limit', text: 'Chỉ duy trì tối đa 2 tiểu đệ; triệu hồi mới thay thế đơn vị tồn tại lâu nhất.' },
                  { id: 'boost_lock', text: 'Tăng Cường Tòng Bộc khóa sau 5 lần sử dụng và chỉ ảnh hưởng tiểu đệ triệu hồi sau đó.' }
              ])
          }
      },
      {
          id: 'linhgac', name: 'Lính Gác', class: 'Warrior', rank: 'N',
          mods: { ARM: 0.10, ATK: 0.10 },
          kit: {
              onSpawn: asUnknownRecord({ rage: 100, exceptLeader: true }),
              basic: asUnknownRecord({
                  name: 'Đánh Thường',
                  tags: ['single-target']
              }),
              skills: asUnknownRecordArray([
                  { key: 'skill1', name: 'Trảm Cảnh Giới', cost: { aether: 20 }, countsAsBasic: true, damageMultiplier: 1.50 },
                  { key: 'skill2', name: 'Thành Lũy Tạm Thời', cost: { aether: 15 }, duration: 3, buffStats: { RES: 0.20, ARM: 0.20 } },
                  {
                      key: 'skill3',
                      name: 'Kiên Cố Trường Kỳ',
                      cost: { aether: 20 },
                      permanent: true,
                      buffStats: { RES: 0.05, ARM: 0.05 },
                      lowHPBonus: { threshold: 0.30, stats: { RES: 0.15, ARM: 0.15 } }
                  }
              ]),
              ult: asUnknownRecord({ type: 'haste', targets: 'self+2allies', attackSpeed: 0.20, turns: 2, selfBasicBonus: 0.05 }),
              talent: asUnknownRecord({
                  name: 'Cảnh Giới Bất Biến',
                  onSpawnStats: { AGI: 0.05, ATK: 0.05 }
              }),
              technique: null,
              passives: asUnknownRecordArray([]),
              traits: asUnknownRecordArray([
                  { id: 'permanent_stack', text: 'Kiên Cố Trường Kỳ cộng dồn vĩnh viễn, mạnh hơn khi HP < 30%.' },
                  { id: 'ult_damage_bonus', text: 'Trong thời gian Còi Tăng Tốc, đòn đánh thường gây thêm 5% sát thương.' }
              ])
          }
      }
  ];
  const unitBaseEntries = ROSTER
      .map((entry) => {
      const rank = entry.rank;
      const className = entry.class;
      if (!isRankName(rank) || !isClassName(className)) {
          return null;
      }
      const base = CLASS_BASE[className];
      const final = applyRankAndMods(base, rank, entry.mods);
      return [entry.id, final];
  })
      .filter((pair) => pair !== null);
  const UNIT_BASE = Object.freeze(Object.fromEntries(unitBaseEntries));
  // 5) Map & helper tra cứu
  const ROSTER_MAP = new Map(ROSTER.map((entry) => [entry.id, entry]));
  const getMetaById = (id) => {
      if (typeof id !== 'string')
          return undefined;
      return ROSTER_MAP.get(id);
  };
  const unitKitEntries = ROSTER.map((entry) => [entry.id, asUnitKitConfig(entry.kit)]);
  const UNIT_KITS = Object.freeze(Object.fromEntries(unitKitEntries));
  const getUnitKitById = (id) => {
      var _a;
      if (typeof id !== 'string')
          return null;
      const kit = (_a = UNIT_KITS[id]) !== null && _a !== void 0 ? _a : null;
      return asUnitKitConfig(kit);
  };
  const isSummoner = (id) => {
      const m = getMetaById(id);
      return !!(m && m.class === 'Summoner' && kitSupportsSummon(m));
  };

  if (!Object.prototype.hasOwnProperty.call(exports, 'RANK_MULT')) exports.RANK_MULT = RANK_MULT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CLASS_BASE')) exports.CLASS_BASE = CLASS_BASE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ROSTER')) exports.ROSTER = ROSTER;
  if (!Object.prototype.hasOwnProperty.call(exports, 'UNIT_BASE')) exports.UNIT_BASE = UNIT_BASE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ROSTER_MAP')) exports.ROSTER_MAP = ROSTER_MAP;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getMetaById')) exports.getMetaById = getMetaById;
  if (!Object.prototype.hasOwnProperty.call(exports, 'UNIT_KITS')) exports.UNIT_KITS = UNIT_KITS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getUnitKitById')) exports.getUnitKitById = getUnitKitById;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isSummoner')) exports.isSummoner = isSummoner;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyRankAndMods')) exports.applyRankAndMods = applyRankAndMods;
});
__define('./combat.ts', (exports, module, __require) => {
  const __dep0 = __require('./statuses.ts');
  const Statuses = __dep0.Statuses;
  const hookOnLethalDamage = __dep0.hookOnLethalDamage;
  const __dep1 = __require('./vfx.ts');
  const asSessionWithVfx = __dep1.asSessionWithVfx;
  const vfxAddHit = __dep1.vfxAddHit;
  const vfxAddMelee = __dep1.vfxAddMelee;
  const vfxAddLightningArc = __dep1.vfxAddLightningArc;
  const __dep2 = __require('./engine.ts');
  const slotToCell = __dep2.slotToCell;
  const __dep3 = __require('./passives.ts');
  const emitPassiveEvent = __dep3.emitPassiveEvent;
  const getPassiveLog = __dep3.getPassiveLog;
  const __dep4 = __require('./config.ts');
  const CFG = __dep4.CFG;
  const __dep5 = __require('./utils/fury.ts');
  const gainFury = __dep5.gainFury;
  const startFurySkill = __dep5.startFurySkill;
  const finishFuryHit = __dep5.finishFuryHit;
  const __dep6 = __require('./utils/time.ts');
  const safeNow = __dep6.safeNow;
  const isBasicAttackAfterHitHandler = (handler) => typeof handler === 'function';
  const GAME_CONFIG = CFG;
  function pickTarget(Game, attacker) {
      var _a;
      const foeSide = attacker.side === 'ally' ? 'enemy' : 'ally';
      const pool = Game.tokens.filter((t) => t.side === foeSide && t.alive);
      if (pool.length === 0)
          return null;
      const attackerRow = attacker.cy;
      const targetSide = foeSide;
      const primarySlot = Math.max(1, Math.min(3, (attackerRow | 0) + 1));
      const slotPriority = [primarySlot, primarySlot + 3, primarySlot + 6];
      for (const slot of slotPriority) {
          const cell = slotToCell(targetSide, slot);
          const { cx, cy } = cell;
          const found = pool.find(t => t.cx === cx && t.cy === cy);
          if (found)
              return found;
      }
      const sorted = [...pool].sort((a, b) => {
          const distanceA = Math.abs(a.cx - attacker.cx) + Math.abs(a.cy - attacker.cy);
          const distanceB = Math.abs(b.cx - attacker.cx) + Math.abs(b.cy - attacker.cy);
          return distanceA - distanceB;
      });
      return (_a = sorted[0]) !== null && _a !== void 0 ? _a : null;
  }
  function applyDamage(target, amount) {
      var _a, _b;
      if (!Number.isFinite(target.hpMax))
          return;
      const currentHp = (_a = target.hp) !== null && _a !== void 0 ? _a : 0;
      const maxHp = (_b = target.hpMax) !== null && _b !== void 0 ? _b : 0;
      const newHp = Math.max(0, Math.min(maxHp, Math.floor(currentHp) - Math.floor(amount)));
      target.hp = newHp;
      if (target.hp <= 0) {
          if (target.alive !== false && !target.deadAt) {
              target.deadAt = safeNow();
          }
          target.alive = false;
      }
  }
  function dealAbilityDamage(Game, attacker, target, opts = {}) {
      var _a, _b, _c, _d, _e, _f;
      if (!attacker || !target || !target.alive) {
          return { dealt: 0, absorbed: 0, total: 0 };
      }
      startFurySkill(attacker, { tag: String(opts.furyTag || opts.attackType || 'ability') });
      const dtype = typeof opts.dtype === 'string' ? opts.dtype : 'physical';
      const attackType = typeof opts.attackType === 'string' ? opts.attackType : 'skill';
      const baseDefault = dtype === 'arcane'
          ? Math.max(0, Math.floor((_a = attacker.wil) !== null && _a !== void 0 ? _a : 0))
          : Math.max(0, Math.floor((_b = attacker.atk) !== null && _b !== void 0 ? _b : 0));
      const base = Math.max(0, opts.base != null ? Math.floor(Number(opts.base)) : baseDefault);
      const pre = Statuses.beforeDamage(attacker, target, { dtype, base, attackType });
      const combinedPen = Math.max(0, Math.min(1, Math.max((_c = pre.defPen) !== null && _c !== void 0 ? _c : 0, (_d = opts.defPen) !== null && _d !== void 0 ? _d : 0)));
      const defenseStat = dtype === 'arcane' ? (_e = target.res) !== null && _e !== void 0 ? _e : 0 : (_f = target.arm) !== null && _f !== void 0 ? _f : 0;
      let dmg = Math.max(0, Math.floor(pre.base * pre.outMul));
      if (pre.ignoreAll) {
          dmg = 0;
      }
      else {
          const effectiveDef = Math.max(0, defenseStat * (1 - combinedPen));
          dmg = Math.max(0, Math.floor(dmg * (1 - effectiveDef)));
          dmg = Math.max(0, Math.floor(dmg * pre.inMul));
      }
      const abs = Statuses.absorbShield(target, dmg, { dtype });
      const remain = Math.max(0, Math.floor(abs.remain));
      if (remain > 0) {
          applyDamage(target, remain);
      }
      if (target.hp <= 0) {
          hookOnLethalDamage(target);
      }
      const damageResult = { dealt: remain, absorbed: abs.absorbed, dtype };
      Statuses.afterDamage(attacker, target, damageResult);
      const sessionVfx = asSessionWithVfx(Game);
      if (sessionVfx) {
          try {
              vfxAddHit(sessionVfx, target);
          }
          catch {
              // bỏ qua lỗi VFX runtime
          }
      }
      const dealt = Math.max(0, remain);
      const isKill = target.hp <= 0;
      gainFury(attacker, {
          type: attackType === 'basic' ? 'basic' : 'ability',
          dealt,
          isAoE: !!opts.isAoE,
          isKill,
          isCrit: !!opts.isCrit,
          targetsHit: Number.isFinite(opts.targetsHit) ? Number(opts.targetsHit) : 1,
          targetMaxHp: Number.isFinite(target.hpMax) ? target.hpMax : undefined,
      });
      gainFury(target, {
          type: 'damageTaken',
          dealt,
          isAoE: !!opts.isAoE,
          selfMaxHp: Number.isFinite(target.hpMax) ? target.hpMax : undefined,
          damageTaken: dealt,
      });
      finishFuryHit(target);
      finishFuryHit(attacker);
      return { dealt: remain, absorbed: abs.absorbed, total: dmg };
  }
  function healUnit(target, amount) {
      var _a, _b;
      if (!target || !Number.isFinite(target.hpMax)) {
          return { healed: 0, overheal: 0 };
      }
      const amt = Math.max(0, Math.floor(amount !== null && amount !== void 0 ? amount : 0));
      if (amt <= 0) {
          return { healed: 0, overheal: 0 };
      }
      const before = Math.max(0, Math.floor((_a = target.hp) !== null && _a !== void 0 ? _a : 0));
      const healCap = Math.max(0, ((_b = target.hpMax) !== null && _b !== void 0 ? _b : 0) - before);
      const healed = Math.min(amt, healCap);
      target.hp = before + healed;
      return { healed, overheal: Math.max(0, amt - healed) };
  }
  function grantShield(target, amount) {
      var _a;
      if (!target)
          return 0;
      const amt = Math.max(0, Math.floor(amount !== null && amount !== void 0 ? amount : 0));
      if (amt <= 0)
          return 0;
      const current = Statuses.get(target, 'shield');
      if (current) {
          current.amount = ((_a = current.amount) !== null && _a !== void 0 ? _a : 0) + amt;
      }
      else {
          Statuses.add(target, { id: 'shield', kind: 'buff', tag: 'shield', amount: amt });
      }
      return amt;
  }
  function basicAttack(Game, unit) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
      const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
      const pool = Game.tokens.filter((t) => t.side === foeSide && t.alive);
      if (pool.length === 0)
          return;
      startFurySkill(unit, { tag: 'basic' });
      const fallback = pickTarget(Game, unit);
      const resolved = (_a = Statuses.resolveTarget(unit, pool, { attackType: 'basic' })) !== null && _a !== void 0 ? _a : fallback;
      if (!resolved)
          return;
      const isLoithienanh = unit.id === 'loithienanh';
      const sessionVfx = asSessionWithVfx(Game);
      const updateTurnBusy = (startedAt, busyMs) => {
          if (!Game.turn)
              return;
          if (!Number.isFinite(startedAt) || !Number.isFinite(busyMs))
              return;
          const prevBusy = Number.isFinite(Game.turn.busyUntil) ? Number(Game.turn.busyUntil) : 0;
          Game.turn.busyUntil = Math.max(prevBusy, startedAt + busyMs);
      };
      const triggerLightningArc = (timing) => {
          if (!isLoithienanh || !sessionVfx)
              return;
          const arcStart = safeNow();
          try {
              const busyMs = vfxAddLightningArc(sessionVfx, unit, resolved, {
                  bindingKey: 'basic_combo',
                  timing,
              });
              updateTurnBusy(arcStart, busyMs);
          }
          catch {
              // bỏ qua lỗi VFX runtime
          }
      };
      const passiveCtx = {
          target: resolved,
          damage: { baseMul: 1, flatAdd: 0 },
          afterHit: [],
          log: getPassiveLog(Game),
      };
      emitPassiveEvent(Game, unit, 'onBasicHit', passiveCtx);
      const meleeDur = (_c = (_b = GAME_CONFIG.ANIMATION) === null || _b === void 0 ? void 0 : _b.meleeDurationMs) !== null && _c !== void 0 ? _c : 1100;
      const meleeStartMs = safeNow();
      let meleeTriggered = false;
      if (sessionVfx) {
          try {
              vfxAddMelee(sessionVfx, unit, resolved, { dur: meleeDur });
              meleeTriggered = true;
          }
          catch {
              // bỏ qua lỗi VFX runtime
          }
      }
      if (meleeTriggered && Game.turn) {
          const prevBusy = Number.isFinite(Game.turn.busyUntil) ? Number(Game.turn.busyUntil) : 0;
          Game.turn.busyUntil = Math.max(prevBusy, meleeStartMs + meleeDur);
      }
      const dtype = 'physical';
      const rawBase = Math.max(1, Math.floor(((_d = unit.atk) !== null && _d !== void 0 ? _d : 0) + ((_e = unit.wil) !== null && _e !== void 0 ? _e : 0)));
      const modBase = Math.max(1, Math.floor(rawBase * ((_g = (_f = passiveCtx.damage) === null || _f === void 0 ? void 0 : _f.baseMul) !== null && _g !== void 0 ? _g : 1) + ((_j = (_h = passiveCtx.damage) === null || _h === void 0 ? void 0 : _h.flatAdd) !== null && _j !== void 0 ? _j : 0)));
      const pre = Statuses.beforeDamage(unit, resolved, { dtype, base: modBase, attackType: 'basic' });
      let dmg = Math.max(1, Math.floor(pre.base * pre.outMul));
      const def = Math.max(0, ((_k = resolved.arm) !== null && _k !== void 0 ? _k : 0) * (1 - ((_l = pre.defPen) !== null && _l !== void 0 ? _l : 0)));
      dmg = Math.max(0, Math.floor(dmg * (1 - def)));
      dmg = Math.max(0, Math.floor(dmg * pre.inMul));
      triggerLightningArc('hit1');
      const abs = Statuses.absorbShield(resolved, dmg, { dtype });
      triggerLightningArc('hit2');
      applyDamage(resolved, abs.remain);
      if (sessionVfx) {
          try {
              vfxAddHit(sessionVfx, resolved);
          }
          catch {
              // bỏ qua lỗi VFX runtime
          }
      }
      if (resolved.hp <= 0) {
          hookOnLethalDamage(resolved);
      }
      const dealt = Math.max(0, Math.min(dmg, (_m = abs.remain) !== null && _m !== void 0 ? _m : 0));
      const damageResult = { dealt, absorbed: abs.absorbed, dtype };
      Statuses.afterDamage(unit, resolved, damageResult);
      const isKill = resolved.hp <= 0;
      gainFury(unit, {
          type: 'basic',
          dealt,
          isKill,
          targetsHit: 1,
          targetMaxHp: Number.isFinite(resolved.hpMax) ? resolved.hpMax : undefined,
      });
      gainFury(resolved, {
          type: 'damageTaken',
          dealt,
          selfMaxHp: Number.isFinite(resolved.hpMax) ? resolved.hpMax : undefined,
          damageTaken: dealt,
      });
      finishFuryHit(resolved);
      finishFuryHit(unit);
      const afterHitHandlers = passiveCtx.afterHit.filter(isBasicAttackAfterHitHandler);
      if (afterHitHandlers.length > 0) {
          const afterCtx = {
              target: resolved,
              owner: unit,
              result: { dealt, absorbed: abs.absorbed },
          };
          for (const fn of afterHitHandlers) {
              try {
                  fn(afterCtx);
              }
              catch (err) {
                  console.error('[passive afterHit]', err);
              }
          }
      }
  }
  function doBasicWithFollowups(Game, unit, cap = 2) {
      try {
          basicAttack(Game, unit);
          const followupCount = Math.max(0, cap | 0);
          for (let i = 0; i < followupCount; i += 1) {
              if (!unit || !unit.alive)
                  break;
              basicAttack(Game, unit);
          }
      }
      catch (error) {
          console.error('[doBasicWithFollowups]', error);
      }
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'isBasicAttackAfterHitHandler')) exports.isBasicAttackAfterHitHandler = isBasicAttackAfterHitHandler;
  if (!Object.prototype.hasOwnProperty.call(exports, 'pickTarget')) exports.pickTarget = pickTarget;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyDamage')) exports.applyDamage = applyDamage;
  if (!Object.prototype.hasOwnProperty.call(exports, 'dealAbilityDamage')) exports.dealAbilityDamage = dealAbilityDamage;
  if (!Object.prototype.hasOwnProperty.call(exports, 'healUnit')) exports.healUnit = healUnit;
  if (!Object.prototype.hasOwnProperty.call(exports, 'grantShield')) exports.grantShield = grantShield;
  if (!Object.prototype.hasOwnProperty.call(exports, 'basicAttack')) exports.basicAttack = basicAttack;
  if (!Object.prototype.hasOwnProperty.call(exports, 'doBasicWithFollowups')) exports.doBasicWithFollowups = doBasicWithFollowups;
});
__define('./config.ts', (exports, module, __require) => {
  // config.ts v0.7.5
  const __dep0 = __require('./config/schema.ts');
  const parseGameConfig = __dep0.parseGameConfig;
  const daylightTheme = {
      sky: {
          top: '#1b2434',
          mid: '#2f455e',
          bottom: '#55759a',
          glow: 'rgba(255, 236, 205, 0.35)',
      },
      horizon: {
          color: '#f4d9ad',
          glow: 'rgba(255, 236, 205, 0.55)',
          height: 0.22,
          thickness: 0.9,
      },
      ground: {
          top: '#312724',
          accent: '#3f302c',
          bottom: '#181210',
          highlight: '#6c5344',
          parallax: 0.12,
          topScale: 0.9,
          bottomScale: 1.45,
      },
  };
  const backgroundDefinitions = {
      daylight: {
          props: [
              {
                  type: 'stone-obelisk',
                  cell: { cx: -0.8, cy: -0.2 },
                  offset: { x: -0.35, y: -0.08 },
                  scale: 1.02,
                  alpha: 0.94,
              },
              {
                  type: 'stone-obelisk',
                  cell: { cx: 6.8, cy: -0.25 },
                  offset: { x: 0.32, y: -0.1 },
                  scale: 1.02,
                  alpha: 0.94,
                  flip: -1,
              },
              {
                  type: 'sun-banner',
                  cell: { cx: -1.05, cy: 2.24 },
                  depth: 0.15,
                  offset: { x: -0.28, y: 0.38 },
                  sortBias: 18,
                  scale: 1.08,
                  alpha: 0.96,
              },
              {
                  type: 'sun-banner',
                  cell: { cx: 7.05, cy: 2.28 },
                  depth: 0.15,
                  offset: { x: 0.28, y: 0.38 },
                  sortBias: 18,
                  scale: 1.08,
                  alpha: 0.96,
                  flip: -1,
              },
          ],
      },
  };
  const rawConfig = {
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
              Tanker: { front: 0.08, back: -0.04 },
              Warrior: { front: 0.04, back: 0.00 },
              Ranger: { front: -0.03, back: 0.06 },
              Mage: { front: -0.02, back: 0.05 },
              Assassin: { front: 0.03, back: -0.03 },
              Support: { front: -0.02, back: 0.03 },
              Summoner: { front: 0.00, back: 0.04, summonBoost: 0.05 }
          }, DEBUG: { KEEP_TOP: 6 }
      },
      // === UI constants (C2) ===
      UI: {
          PAD: 12,
          BOARD_MAX_W: 900,
          BOARD_MIN_H: 220,
          BOARD_H_RATIO: 3 / 7,
          MAX_DPR: 2.5,
          MAX_PIXEL_AREA: 2400000,
          CARD_GAP: 12,
          CARD_MIN: 40
      },
      ANIMATION: {
          turnIntervalMs: 480,
          meleeDurationMs: 1100
      },
      // === Debug flags (W0-J1) ===
      DEBUG: {
          SHOW_QUEUED: true, // vẽ unit "Chờ Lượt" cho phe mình (ally) khi có
          SHOW_QUEUED_ENEMY: false // kẻ địch không thấy (đúng design)
      },
      PERFORMANCE: {
          LOW_POWER_MODE: false,
          LOW_POWER_DPR: 1.5,
          LOW_POWER_SHADOWS: false, // true: luôn ưu tiên preset bóng rẻ tiền
          LOW_SHADOW_PRESET: 'off', // 'off' | 'medium' | 'soft' khi LOW_POWER_SHADOWS bật
          SHADOW_MEDIUM_THRESHOLD: 8, // ≥ số token này thì giảm blur thay vì tắt hẳn
          SHADOW_DISABLE_THRESHOLD: 10, // ≥ số token này thì chuyển sang preset rẻ nhất
          MEDIUM_SHADOW_PRESET: 'medium', // 'medium' | 'soft' | 'off' khi đạt ngưỡng medium
          HIGH_LOAD_SHADOW_PRESET: 'off', // preset áp dụng khi đạt ngưỡng disable
          SHADOW_HIGH_DPR_CUTOFF: 1.8, // DPI (dpr) cao hơn ngưỡng sẽ giảm bóng
          HIGH_DPR_SHADOW_PRESET: 'medium' // preset cho màn hình dpr cao
      },
      COLORS: {
          ally: '#1e2b36',
          enemy: '#2a1c22',
          mid: '#1c222a',
          line: '#24303c',
          tokenText: '#0d1216'
      },
      SCENE: {
          DEFAULT_THEME: 'daylight',
          CURRENT_THEME: 'daylight',
          THEMES: {
              daylight: daylightTheme,
          },
      },
      CURRENT_BACKGROUND: 'daylight',
      BACKGROUNDS: backgroundDefinitions,
      CAMERA: 'landscape_oblique',
  };
  const parsedConfig = parseGameConfig(rawConfig); // behavior-preserving validation
  Object.freeze(parsedConfig);
  const CFG = parsedConfig;
  const CAM = {
      landscape_oblique: { rowGapRatio: 0.62, topScale: 0.80, depthScale: 0.94 },
      portrait_leader45: { rowGapRatio: 0.72, topScale: 0.86, depthScale: 0.96 },
  };
  // === Token render style ===
  const TOKEN_STYLE = 'chibi';
  // Proportions cho chibi (tính theo bán kính cơ sở r)
  const CHIBI = {
      // đường đậm hơn + tỉ lệ chibi mập mạp (đầu to, tay chân ngắn)
      line: 3,
      headR: 0.52, // đầu to hơn
      torso: 0.70, // thân ngắn hơn
      arm: 0.58, // tay ngắn hơn
      leg: 0.68, // chân ngắn hơn
      weapon: 0.78, // vũ khí ngắn hơn để cân đối
      nameAlpha: 0.7
  };

  if (!Object.prototype.hasOwnProperty.call(exports, 'CFG')) exports.CFG = CFG;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CAM')) exports.CAM = CAM;
  if (!Object.prototype.hasOwnProperty.call(exports, 'TOKEN_STYLE')) exports.TOKEN_STYLE = TOKEN_STYLE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CHIBI')) exports.CHIBI = CHIBI;
});
__define('./config/package-lock.json', (exports, module, __require) => {
  const data = JSON.parse('{"name":"arclune_lane_7x3","version":"1.0.0","lockfileVersion":3,"requires":true,"packages":{"":{"name":"arclune_lane_7x3","version":"1.0.0","license":"ISC","dependencies":{"zod":"file:tools/zod-stub"},"devDependencies":{"esbuild":"file:tools/esbuild-stub","tsx":"file:tools/tsx-stub"}},"node_modules/esbuild":{"resolved":"tools/esbuild-stub","link":true},"node_modules/zod":{"resolved":"tools/zod-stub","link":true},"node_modules/tsx":{"resolved":"tools/tsx-stub","link":true},"tools/esbuild-stub":{"name":"esbuild","version":"0.0.0-stub","dev":true},"tools/zod-stub":{"name":"zod","version":"0.0.0-stub"},"tools/tsx-stub":{"name":"tsx","version":"4.7.1","dev":true,"bin":{"tsx":"bin.js"}}}}');
  module.exports = data;
  module.exports.default = data;
});
__define('./config/package.json', (exports, module, __require) => {
  const data = JSON.parse('{"name":"arclune_lane_7x3","version":"1.0.0","description":"","scripts":{"build":"npm run build:prod","build:dev":"node ../../tools/generate-loithienanh-svg.mjs && node ../../build.mjs --mode=development","build:prod":"node ../../tools/generate-loithienanh-svg.mjs && node ../../build.mjs --mode=production","dev":"APP_ENTRY=${APP_ENTRY:-src/main.ts} tsx watch $APP_ENTRY","start":"NODE_ENV=${NODE_ENV:-production} APP_ENTRY=${APP_ENTRY:-src/main.ts} tsx $APP_ENTRY","test":"jest --runInBand","typecheck":"tsc --noEmit"},"keywords":[],"author":"","license":"ISC","type":"commonjs","dependencies":{"zod":"file:tools/zod-stub"},"devDependencies":{"@types/jest":"^29.5.12","esbuild":"file:tools/esbuild-stub","jest":"^29.7.0","ts-jest":"^29.2.5","ts-node":"^10.9.2","tsx":"file:tools/tsx-stub","typescript":"^5.4.0"}}');
  module.exports = data;
  module.exports.default = data;
});
__define('./config/schema.ts', (exports, module, __require) => {
  const __dep0 = __require('./../tools/zod-stub/index.js');
  const z = __dep0.z;
  const SideSchema = z.enum(['ally', 'enemy']);
  const FuryCapsSchema = z.object({
      perTurn: z.number(),
      perSkill: z.number(),
      perHit: z.number()
  });
  const FuryGainEntrySchema = z.object({
      base: z.number(),
      perTarget: z.number().optional(),
      crit: z.number().optional(),
      kill: z.number().optional(),
      targetRatio: z.number().optional()
  });
  const FuryConfigSchema = z.object({
      max: z.number(),
      ultCost: z.number(),
      specialMax: z.record(z.object({
          max: z.number(),
          ultCost: z.number()
      })),
      caps: FuryCapsSchema,
      gain: z.object({
          turnStart: z.object({ amount: z.number() }),
          dealSingle: FuryGainEntrySchema,
          dealAoePerTarget: FuryGainEntrySchema,
          damageTaken: z.object({ base: z.number(), selfRatio: z.number() })
      }),
      drain: z.object({
          perTargetBase: z.number(),
          perTargetPct: z.number(),
          skillTotalCap: z.number()
      })
  });
  const TurnOrderSlotValueSchema = z.union([z.number(), z.string()]);
  const TurnOrderPairScanObjectSchema = z.object({
      side: SideSchema.optional(),
      slot: TurnOrderSlotValueSchema.optional(),
      s: TurnOrderSlotValueSchema.optional(),
      index: TurnOrderSlotValueSchema.optional()
  });
  const TurnOrderPairScanEntrySchema = z.union([
      z.number(),
      z.array(z.number()),
      z.tuple([SideSchema, z.number()]),
      TurnOrderPairScanObjectSchema
  ]);
  const TurnOrderConfigSchema = z.object({
      mode: z.string().optional(),
      pairScan: z.array(TurnOrderPairScanEntrySchema).optional(),
      sides: z.array(SideSchema).optional()
  });
  const AiWeightsSchema = z.object({
      pressure: z.number(),
      safety: z.number(),
      eta: z.number(),
      summon: z.number(),
      kitInstant: z.number(),
      kitDefense: z.number(),
      kitRevive: z.number()
  });
  const AiRoleWeightSchema = z.object({
      front: z.number(),
      back: z.number(),
      summonBoost: z.number().optional()
  });
  const AiConfigSchema = z.object({
      WEIGHTS: AiWeightsSchema,
      ROW_CROWDING_PENALTY: z.number(),
      ROLE: z.record(AiRoleWeightSchema),
      DEBUG: z.object({ KEEP_TOP: z.number() })
  });
  const AnimationConfigSchema = z.object({
      turnIntervalMs: z.number(),
      meleeDurationMs: z.number()
  });
  const UiConfigSchema = z.object({
      PAD: z.number(),
      BOARD_MAX_W: z.number(),
      BOARD_MIN_H: z.number(),
      BOARD_H_RATIO: z.number(),
      MAX_DPR: z.number(),
      MAX_PIXEL_AREA: z.number(),
      CARD_GAP: z.number(),
      CARD_MIN: z.number()
  });
  const DebugFlagsSchema = z.object({
      SHOW_QUEUED: z.boolean(),
      SHOW_QUEUED_ENEMY: z.boolean()
  });
  const ShadowPresetSchema = z.enum(['off', 'medium', 'soft']);
  const PerformanceConfigSchema = z.object({
      LOW_POWER_MODE: z.boolean(),
      LOW_POWER_DPR: z.number(),
      LOW_POWER_SHADOWS: z.boolean(),
      LOW_SHADOW_PRESET: ShadowPresetSchema,
      SHADOW_MEDIUM_THRESHOLD: z.number(),
      SHADOW_DISABLE_THRESHOLD: z.number(),
      MEDIUM_SHADOW_PRESET: ShadowPresetSchema,
      HIGH_LOAD_SHADOW_PRESET: ShadowPresetSchema,
      SHADOW_HIGH_DPR_CUTOFF: z.number(),
      HIGH_DPR_SHADOW_PRESET: ShadowPresetSchema
  });
  const ColorPaletteSchema = z.object({
      ally: z.string(),
      enemy: z.string(),
      mid: z.string(),
      line: z.string(),
      tokenText: z.string()
  });
  const SceneLayerSchema = z.object({
      top: z.string().optional(),
      mid: z.string().optional(),
      bottom: z.string().optional(),
      glow: z.string().optional(),
      height: z.number().optional(),
      thickness: z.number().optional(),
      color: z.string().optional(),
      accent: z.string().optional(),
      parallax: z.number().optional(),
      topScale: z.number().optional(),
      bottomScale: z.number().optional(),
      highlight: z.string().optional()
  });
  const SceneThemeObjectSchema = z.object({
      sky: SceneLayerSchema,
      horizon: SceneLayerSchema,
      ground: SceneLayerSchema
  });
  function assertSceneTheme(theme, themeName) {
      if (typeof theme.sky.top !== 'string' || theme.sky.top.length === 0) {
          const themeLabel = themeName ? `SCENE.THEMES["${themeName}"]` : 'Scene theme';
          throw new TypeError(`${themeLabel} is missing sky.top`);
      }
  }
  function assertSceneThemeRecord(themes) {
      for (const [name, theme] of Object.entries(themes)) {
          assertSceneTheme(theme, name);
      }
  }
  function parseSceneTheme(value, themeName) {
      const parsed = SceneThemeObjectSchema.parse(value);
      assertSceneTheme(parsed, themeName);
      return parsed;
  }
  const SceneConfigSchema = z.object({
      DEFAULT_THEME: z.string(),
      CURRENT_THEME: z.string(),
      THEMES: z.record(SceneThemeObjectSchema)
  });
  function parseSceneConfig(value) {
      const parsed = SceneConfigSchema.parse(value);
      assertSceneThemeRecord(parsed.THEMES);
      return parsed;
  }
  const BackgroundPropSchema = z.object({
      type: z.string(),
      cell: z.object({ cx: z.number(), cy: z.number() }),
      offset: z.object({ x: z.number().optional(), y: z.number().optional() }).optional(),
      scale: z.number().optional(),
      alpha: z.number().optional(),
      depth: z.number().optional(),
      sortBias: z.number().optional(),
      flip: z.number().optional()
  });
  const BackgroundDefinitionSchema = z.object({
      props: z.array(BackgroundPropSchema)
  });
  const WorldMapConfigSchema = z.object({
      SCENE: SceneConfigSchema,
      CURRENT_BACKGROUND: z.string(),
      BACKGROUNDS: z.record(BackgroundDefinitionSchema),
      CAMERA: z.string()
  });
  function parseWorldMapConfig(value) {
      const parsed = WorldMapConfigSchema.parse(value);
      assertSceneThemeRecord(parsed.SCENE.THEMES);
      return parsed;
  }
  const CombatTuningSchema = z.object({
      GRID_COLS: z.number(),
      GRID_ROWS: z.number(),
      ALLY_COLS: z.number(),
      ENEMY_COLS: z.number(),
      COST_CAP: z.number(),
      SUMMON_LIMIT: z.number(),
      HAND_SIZE: z.number(),
      FOLLOWUP_CAP_DEFAULT: z.number(),
      fury: FuryConfigSchema,
      turnOrder: TurnOrderConfigSchema,
      AI: AiConfigSchema,
      ANIMATION: AnimationConfigSchema
  });
  const GameConfigSchema = CombatTuningSchema
      .merge(z.object({
      UI: UiConfigSchema,
      DEBUG: DebugFlagsSchema,
      PERFORMANCE: PerformanceConfigSchema,
      COLORS: ColorPaletteSchema
  }))
      .merge(WorldMapConfigSchema);
  function parseGameConfig(value) {
      const parsed = GameConfigSchema.parse(value);
      assertSceneThemeRecord(parsed.SCENE.THEMES);
      return parsed;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'GameConfigSchema')) exports.GameConfigSchema = GameConfigSchema;
  if (!Object.prototype.hasOwnProperty.call(exports, 'parseSceneTheme')) exports.parseSceneTheme = parseSceneTheme;
  if (!Object.prototype.hasOwnProperty.call(exports, 'parseSceneConfig')) exports.parseSceneConfig = parseSceneConfig;
  if (!Object.prototype.hasOwnProperty.call(exports, 'parseWorldMapConfig')) exports.parseWorldMapConfig = parseWorldMapConfig;
  if (!Object.prototype.hasOwnProperty.call(exports, 'parseGameConfig')) exports.parseGameConfig = parseGameConfig;
});
__define('./data/announcements.config.ts', (exports, module, __require) => {
  const announcementsConfig = [
      {
          key: 'event',
          label: 'Sự kiện giới hạn',
          entries: [
              {
                  id: 'primal-lottery',
                  title: 'Chiến dịch Vé số Nguyên Tinh',
                  shortDescription: 'Mở lại vé số tuần, chia {{LOTTERY_PRIZE_PERCENT}}% quỹ thưởng và {{LOTTERY_DEV_PERCENT}}% vận hành.',
                  tooltip: 'Hoạt động vé số giới hạn thời gian: người chơi dùng tiền tệ trong game để mua vé; 50% doanh thu quay về ví dev để ổn định kinh tế, 50% tích vào giải thưởng cho cộng đồng.',
                  rewardCallout: 'Chuỗi quy đổi tham chiếu: {{TT_CONVERSION_CHAIN}}.',
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
                  translationKey: 'sidebar.ladder.progress'
              },
              {
                  id: 'defense-record',
                  title: 'Giữ vững Đấu Thần',
                  shortDescription: 'Đạt Đấu Thần và phòng thủ 300 lượt tấn công mà không thất bại để ghi dấu “Ngươi thật là ích kỷ a”.',
                  tooltip: 'Thành tựu phòng thủ đấu thú trường: chịu 300 lần công kích khi ở rank Đấu Thần nhưng không bị đánh bại để nhận danh hiệu “Ngươi thật là ích kỷ a”.',
                  rewardCallout: 'Kể cả phòng thủ cũng được ghi nhận trên bảng danh dự đấu thú.',
                  startAt: '2025-10-01T00:00:00+07:00',
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
                  translationKey: 'sidebar.community.channel'
              }
          ]
      }
  ];


  if (!Object.prototype.hasOwnProperty.call(exports, 'default')) exports.default = announcementsConfig;
  module.exports.default = exports.default;
});
__define('./data/announcements.ts', (exports, module, __require) => {
  const __dep0 = __require('./../tools/zod-stub/index.js');
  const z = __dep0.z;
  const __dep1 = __require('./data/economy.ts');
  const CURRENCY_IDS = __dep1.CURRENCY_IDS;
  const convertCurrency = __dep1.convertCurrency;
  const formatBalance = __dep1.formatBalance;
  const getLotterySplit = __dep1.getLotterySplit;
  const __dep2 = __require('./data/announcements.config.ts');
  const rawAnnouncementsConfig = __dep2.default ?? __dep2;
  const AnnouncementEntryConfigSchema = z.object({
      id: z.string(),
      title: z.string(),
      shortDescription: z.string(),
      tooltip: z.string().optional(),
      rewardCallout: z.string().optional(),
      startAt: z.string().optional(),
      endAt: z.string().optional(),
      translationKey: z.string().optional()
  });
  const AnnouncementSlotConfigSchema = z.object({
      key: z.string(),
      label: z.string(),
      entries: z.array(AnnouncementEntryConfigSchema)
  });
  const AnnouncementsConfigSchema = z.array(AnnouncementSlotConfigSchema);
  const LOTTERY_SPLIT = getLotterySplit();
  const LOTTERY_DEV_PERCENT = Math.round((LOTTERY_SPLIT.devVault || 0) * 100);
  const LOTTERY_PRIZE_PERCENT = Math.round((LOTTERY_SPLIT.prizePool || 0) * 100);
  const TT_CONVERSION_CHAIN = [
      formatBalance(1, CURRENCY_IDS.TT),
      formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.ThNT), CURRENCY_IDS.ThNT),
      formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.TNT), CURRENCY_IDS.TNT),
      formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.HNT), CURRENCY_IDS.HNT),
      formatBalance(convertCurrency(1, CURRENCY_IDS.TT, CURRENCY_IDS.VNT), CURRENCY_IDS.VNT)
  ].join(' = ');
  const announcementConfig = AnnouncementsConfigSchema.parse(rawAnnouncementsConfig);
  const MACROS = Object.freeze({
      LOTTERY_PRIZE_PERCENT: `${LOTTERY_PRIZE_PERCENT}`,
      LOTTERY_DEV_PERCENT: `${LOTTERY_DEV_PERCENT}`,
      TT_CONVERSION_CHAIN
  });
  function applyMacros(value) {
      if (value === undefined || value === null)
          return value;
      let result = value;
      for (const [token, replacement] of Object.entries(MACROS)) {
          result = result.replaceAll(`{{${token}}}`, replacement);
      }
      return result;
  }
  function isEntryActive(entry, now) {
      if (!entry)
          return false;
      if (!entry.startAt && !entry.endAt)
          return true;
      const start = entry.startAt ? new Date(entry.startAt) : null;
      const end = entry.endAt ? new Date(entry.endAt) : null;
      if (start && Number.isFinite(start.getTime()) && now < start)
          return false;
      if (end && Number.isFinite(end.getTime()) && now > end)
          return false;
      return true;
  }
  const SIDE_SLOT_ANNOUNCEMENTS = Object.freeze(announcementConfig.map((slot) => ({
      key: slot.key,
      label: slot.label,
      entries: Object.freeze(slot.entries.map((entry) => {
          var _a, _b, _c, _d, _e;
          return Object.freeze({
              ...entry,
              shortDescription: (_a = applyMacros(entry.shortDescription)) !== null && _a !== void 0 ? _a : entry.shortDescription,
              tooltip: (_b = applyMacros(entry.tooltip)) !== null && _b !== void 0 ? _b : undefined,
              rewardCallout: (_c = applyMacros(entry.rewardCallout)) !== null && _c !== void 0 ? _c : undefined,
              startAt: (_d = entry.startAt) !== null && _d !== void 0 ? _d : null,
              endAt: (_e = entry.endAt) !== null && _e !== void 0 ? _e : null
          });
      }))
  })));
  /**
   * @param {string} slotKey
   * @param {{ now?: Date }} [options]
   * @returns {{ slot: AnnouncementSlot; entry: AnnouncementEntry } | null}
   */
  function selectAnnouncementEntry(slotKey, options = {}) {
      var _a, _b;
      const now = options.now instanceof Date ? options.now : new Date();
      const slot = SIDE_SLOT_ANNOUNCEMENTS.find(item => item.key === slotKey);
      if (!slot)
          return null;
      const entry = (_b = (_a = slot.entries.find((item) => isEntryActive(item, now))) !== null && _a !== void 0 ? _a : slot.entries.at(0)) !== null && _b !== void 0 ? _b : null;
      if (!entry)
          return null;
      return { slot, entry };
  }
  function getAllSidebarAnnouncements(options = {}) {
      const now = options.now instanceof Date ? options.now : new Date();
      return SIDE_SLOT_ANNOUNCEMENTS.map(slot => {
          var _a, _b;
          const entry = (_b = (_a = slot.entries.find((item) => isEntryActive(item, now))) !== null && _a !== void 0 ? _a : slot.entries.at(0)) !== null && _b !== void 0 ? _b : null;
          return {
              key: slot.key,
              label: slot.label,
              entry
          };
      }).filter((item) => Boolean(item.entry));
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'SIDE_SLOT_ANNOUNCEMENTS')) exports.SIDE_SLOT_ANNOUNCEMENTS = SIDE_SLOT_ANNOUNCEMENTS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'selectAnnouncementEntry')) exports.selectAnnouncementEntry = selectAnnouncementEntry;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getAllSidebarAnnouncements')) exports.getAllSidebarAnnouncements = getAllSidebarAnnouncements;
});
__define('./data/economy.config.ts', (exports, module, __require) => {
  const economyConfig = {
      currencies: [
          {
              id: 'VNT',
              name: 'Vụn Nguyên Tinh',
              shortName: 'Vụn',
              suffix: 'VNT',
              ratioToBase: 1,
              description: 'Đơn vị nhỏ nhất, rơi ra từ tinh thể vỡ và hoạt động hằng ngày.'
          },
          {
              id: 'HNT',
              name: 'Hạ Nguyên Tinh',
              shortName: 'Hạ',
              suffix: 'HNT',
              ratioToBase: 100,
              description: 'Tinh thể đã tinh luyện, dùng cho giao dịch phổ thông và vé gacha thường.'
          },
          {
              id: 'TNT',
              name: 'Trung Nguyên Tinh',
              shortName: 'Trung',
              suffix: 'TNT',
              ratioToBase: 1000,
              description: 'Kho dự trữ cho các kiến trúc tông môn, chế tác pháp khí và banner cao cấp.'
          },
          {
              id: 'ThNT',
              name: 'Thượng Nguyên Tinh',
              shortName: 'Thượng',
              suffix: 'ThNT',
              ratioToBase: 10000,
              description: 'Đơn vị luân chuyển giữa các tông môn, đổi thưởng cao cấp và sự kiện giới hạn.'
          },
          {
              id: 'TT',
              name: 'Thần Tinh',
              shortName: 'Thần',
              suffix: 'TT',
              ratioToBase: 100000,
              description: 'Đơn vị tối thượng cho các giao dịch Prime và quỹ dự trữ chiến lược.'
          }
      ],
      pityConfig: {
          SSR: {
              tier: 'SSR',
              hardPity: 60,
              softGuarantees: []
          },
          UR: {
              tier: 'UR',
              hardPity: 70,
              softGuarantees: [
                  { tier: 'SSR', pull: 50 }
              ]
          },
          PRIME: {
              tier: 'PRIME',
              hardPity: 80,
              softGuarantees: [
                  { tier: 'SSR', pull: 40 },
                  { tier: 'UR', pull: 60 }
              ]
          }
      },
      shopTaxBrackets: [
          { rank: 'N', label: 'Phổ thông (N)', rate: 0.05 },
          { rank: 'R', label: 'Hiếm (R)', rate: 0.08 },
          { rank: 'SR', label: 'Siêu hiếm (SR)', rate: 0.1 },
          { rank: 'SSR', label: 'Cực hiếm (SSR)', rate: 0.12 },
          { rank: 'UR', label: 'Siêu thực (UR)', rate: 0.15 },
          { rank: 'PRIME', label: 'Tối thượng (Prime)', rate: 0.18 }
      ],
      lotterySplit: {
          devVault: 0.5,
          prizePool: 0.5
      }
  };


  if (!Object.prototype.hasOwnProperty.call(exports, 'default')) exports.default = economyConfig;
  module.exports.default = exports.default;
});
__define('./data/economy.ts', (exports, module, __require) => {
  const __dep0 = __require('./../tools/zod-stub/index.js');
  const z = __dep0.z;
  const __dep1 = __require('./utils/format.ts');
  const HAS_INTL_NUMBER_FORMAT = __dep1.HAS_INTL_NUMBER_FORMAT;
  const createNumberFormatter = __dep1.createNumberFormatter;
  const __dep2 = __require('./utils/assert.ts');
  const assertDefined = __dep2.assertDefined;
  const __dep3 = __require('./data/economy.config.ts');
  const rawEconomyConfig = __dep3.default ?? __dep3;
  const CurrencyIdSchema = z.enum(['VNT', 'HNT', 'TNT', 'ThNT', 'TT']);
  const currencyIdValues = ['VNT', 'HNT', 'TNT', 'ThNT', 'TT'];
  const CurrencySchema = z.object({
      id: CurrencyIdSchema,
      name: z.string(),
      shortName: z.string(),
      suffix: z.string(),
      ratioToBase: z.number(),
      description: z.string().optional()
  });
  const PityRuleSchema = z.object({ tier: z.string(), pull: z.number() });
  const PityEntrySchema = z.object({
      tier: z.string(),
      hardPity: z.number(),
      softGuarantees: z.array(PityRuleSchema)
  });
  const PityTierSchema = z.enum(['SSR', 'UR', 'PRIME']);
  const PityConfigSchema = z.object({
      SSR: PityEntrySchema,
      UR: PityEntrySchema,
      PRIME: PityEntrySchema
  });
  const ShopRankSchema = z.enum(['N', 'R', 'SR', 'SSR', 'UR', 'PRIME']);
  const ShopTaxBracketSchema = z.object({
      rank: ShopRankSchema,
      label: z.string(),
      rate: z.number()
  });
  const LotterySplitSchema = z.object({
      devVault: z.number(),
      prizePool: z.number()
  });
  const EconomyConfigSchema = z.object({
      currencies: z.array(CurrencySchema),
      pityConfig: PityConfigSchema,
      shopTaxBrackets: z.array(ShopTaxBracketSchema),
      lotterySplit: LotterySplitSchema
  });
  const economyConfig = EconomyConfigSchema.parse(rawEconomyConfig);
  const pityEntries = Object.entries(economyConfig.pityConfig);
  for (const [tier, entry] of pityEntries) {
      if (entry.tier !== tier) {
          throw new Error(`Cấu hình pity cho tier "${tier}" không khớp giá trị nội tại (${entry.tier}).`);
      }
  }
  const currencyIdMap = {};
  for (const id of currencyIdValues) {
      currencyIdMap[id] = id;
  }
  const CURRENCY_IDS = Object.freeze({
      ...currencyIdMap,
      THNT: currencyIdMap.ThNT
  });
  const CURRENCIES = Object.freeze(economyConfig.currencies.map((currency) => Object.freeze({ ...currency })));
  const CURRENCY_INDEX = CURRENCIES.reduce((acc, currency) => {
      acc[currency.id] = currency;
      return acc;
  }, {});
  function getCurrency(currencyId) {
      var _a;
      return (_a = CURRENCY_INDEX[currencyId]) !== null && _a !== void 0 ? _a : null;
  }
  function listCurrencies() {
      return [...CURRENCIES];
  }
  function convertCurrency(value, fromId, toId) {
      const from = assertDefined(getCurrency(fromId), `Invalid currency conversion from ${fromId} to ${toId}`);
      const to = assertDefined(getCurrency(toId), `Invalid currency conversion from ${fromId} to ${toId}`);
      const valueInBase = value * from.ratioToBase;
      return valueInBase / to.ratioToBase;
  }
  const FORMATTER_STANDARD = createNumberFormatter('vi-VN', {
      maximumFractionDigits: 0
  });
  let FORMATTER_COMPACT = FORMATTER_STANDARD;
  let HAS_COMPACT_FORMAT = false;
  if (HAS_INTL_NUMBER_FORMAT) {
      try {
          FORMATTER_COMPACT = createNumberFormatter('vi-VN', {
              notation: 'compact',
              maximumFractionDigits: 1
          });
          HAS_COMPACT_FORMAT = true;
      }
      catch (error) {
          FORMATTER_COMPACT = FORMATTER_STANDARD;
      }
  }
  function formatBalance(value, currencyId, options = {}) {
      const currency = getCurrency(currencyId);
      if (!currency) {
          throw new Error(`Unknown currency id: ${currencyId}`);
      }
      const { notation = 'standard', includeSuffix = true, precision, autoScale = false } = options;
      let amount = value;
      let suffix = currency.suffix;
      if (autoScale) {
          const ordered = [...CURRENCIES].sort((a, b) => a.ratioToBase - b.ratioToBase);
          for (let i = ordered.length - 1; i >= 0; i -= 1) {
              const candidate = ordered[i];
              if (!candidate)
                  continue;
              const inCandidate = convertCurrency(value, currency.id, candidate.id);
              if (Math.abs(inCandidate) >= 1) {
                  amount = inCandidate;
                  suffix = candidate.suffix;
                  break;
              }
          }
      }
      const shouldUseCompact = notation === 'compact' && HAS_COMPACT_FORMAT;
      let formatter = shouldUseCompact ? FORMATTER_COMPACT : FORMATTER_STANDARD;
      if (typeof precision === 'number') {
          const formatterOptions = {
              maximumFractionDigits: precision,
              minimumFractionDigits: precision
          };
          if (shouldUseCompact && HAS_INTL_NUMBER_FORMAT) {
              formatterOptions.notation = 'compact';
          }
          formatter = createNumberFormatter('vi-VN', formatterOptions);
      }
      const formatted = formatter.format(amount);
      return includeSuffix ? `${formatted} ${suffix}` : formatted;
  }
  const PITY_CONFIG = Object.freeze(Object.fromEntries(pityEntries.map(([tier, config]) => [
      tier,
      {
          tier: config.tier,
          hardPity: config.hardPity,
          softGuarantees: config.softGuarantees.map((rule) => ({ ...rule }))
      }
  ])));
  function isPityTier(tier) {
      return tier in PITY_CONFIG;
  }
  function getPityConfig(tier) {
      var _a;
      if (isPityTier(tier)) {
          return (_a = PITY_CONFIG[tier]) !== null && _a !== void 0 ? _a : null;
      }
      return null;
  }
  function listPityTiers() {
      return Object.keys(PITY_CONFIG);
  }
  const SHOP_TAX_BRACKETS = Object.freeze(economyConfig.shopTaxBrackets.map((bracket) => Object.freeze({ ...bracket })));
  const SHOP_TAX_INDEX = SHOP_TAX_BRACKETS.reduce((acc, bracket) => {
      acc[bracket.rank] = bracket;
      return acc;
  }, {});
  function getShopTaxBracket(rank) {
      var _a;
      return (_a = SHOP_TAX_INDEX[rank]) !== null && _a !== void 0 ? _a : null;
  }
  function getShopTaxRate(rank) {
      const bracket = getShopTaxBracket(rank);
      return bracket ? bracket.rate : null;
  }
  const LOTTERY_SPLIT = Object.freeze({ ...economyConfig.lotterySplit });
  function getLotterySplit() {
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
__define('./data/load-config.ts', (exports, module, __require) => {
  function loadConfig(rawConfig, schema) {
      try {
          return schema.parse(rawConfig);
      }
      catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Không thể tải cấu hình: ${message}`, {
              cause: error instanceof Error ? error : undefined
          });
      }
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'loadConfig')) exports.loadConfig = loadConfig;
});
__define('./data/modes.ts', (exports, module, __require) => {
  var _a, _b, _c;
  const __dep0 = __require('./data/economy.ts');
  const getLotterySplit = __dep0.getLotterySplit;
  const getPityConfig = __dep0.getPityConfig;
  const getShopTaxRate = __dep0.getShopTaxRate;
  const SSR_PITY = getPityConfig('SSR');
  const UR_PITY = getPityConfig('UR');
  const PRIME_PITY = getPityConfig('PRIME');
  const LOTTERY_SPLIT = getLotterySplit();
  const BASE_TAX_RATE = getShopTaxRate('N');
  const TOP_TAX_RATE = getShopTaxRate('PRIME');
  const PVE_SESSION_MODULE_ID = '@modes/pve/session.ts';
  const COMING_SOON_MODULE_ID = '@modes/coming-soon.stub.ts';
  const LINEUP_SCREEN_MODULE_ID = '@screens/lineup/index.ts';
  const COLLECTION_SCREEN_MODULE_ID = '@screens/collection/index.ts';
  const MODE_TYPES = {
      PVE: 'PvE',
      PVP: 'PvP',
      ECONOMY: 'Kinh tế'
  };
  const MODE_STATUS = {
      AVAILABLE: 'available',
      COMING_SOON: 'coming-soon',
      PLANNED: 'planned'
  };
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
              moduleId: PVE_SESSION_MODULE_ID,
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
              moduleId: PVE_SESSION_MODULE_ID,
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
              moduleId: PVE_SESSION_MODULE_ID,
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
              fallbackModuleId: COMING_SOON_MODULE_ID
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
              fallbackModuleId: COMING_SOON_MODULE_ID
          }
      },
      {
          id: 'gacha',
          title: 'Gacha',
          type: MODE_TYPES.ECONOMY,
          status: MODE_STATUS.COMING_SOON,
          icon: '🎲',
          shortDescription: `Quầy gacha phân tab Nhân Vật, Công Pháp, Vũ Khí, Sủng Thú với bảo hiểm ${(SSR_PITY === null || SSR_PITY === void 0 ? void 0 : SSR_PITY.hardPity) || 60}/${(UR_PITY === null || UR_PITY === void 0 ? void 0 : UR_PITY.hardPity) || 70}/${(PRIME_PITY === null || PRIME_PITY === void 0 ? void 0 : PRIME_PITY.hardPity) || 80} lượt cho các banner SSR/UR/Prime.`,
          unlockNotes: `Banner UR bảo hiểm SSR ở lượt ${((_b = (_a = UR_PITY === null || UR_PITY === void 0 ? void 0 : UR_PITY.softGuarantees) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.pull) || 50}; banner Prime lần lượt bảo hiểm SSR/UR ở ${((_c = PRIME_PITY === null || PRIME_PITY === void 0 ? void 0 : PRIME_PITY.softGuarantees) === null || _c === void 0 ? void 0 : _c.map(({ pull }) => pull).join('/')) || '40/60'} và Prime ở ${(PRIME_PITY === null || PRIME_PITY === void 0 ? void 0 : PRIME_PITY.hardPity) || 80}.`,
          tags: ['Kinh tế nguyên tinh', 'Coming soon'],
          menuSections: ['economy'],
          shell: {
              screenId: 'main-menu',
              fallbackModuleId: COMING_SOON_MODULE_ID
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
              moduleId: LINEUP_SCREEN_MODULE_ID,
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
              moduleId: COLLECTION_SCREEN_MODULE_ID
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
              fallbackModuleId: COMING_SOON_MODULE_ID
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
              fallbackModuleId: COMING_SOON_MODULE_ID
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
              fallbackModuleId: COMING_SOON_MODULE_ID
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
              fallbackModuleId: COMING_SOON_MODULE_ID
          }
      }
  ];
  const MODE_INDEX = MODES.reduce((acc, mode) => {
      acc[mode.id] = mode;
      return acc;
  }, {});
  function listModesForSection(sectionId, options = {}) {
      const { includeStatuses } = options;
      return MODES.filter(mode => {
          if (!mode.menuSections || !mode.menuSections.includes(sectionId)) {
              return false;
          }
          if (Array.isArray(includeStatuses) && includeStatuses.length > 0) {
              return includeStatuses.includes(mode.status);
          }
          return true;
      });
  }
  function getMenuSections(options = {}) {
      const { includeStatuses } = options;
      const includeSet = Array.isArray(includeStatuses) && includeStatuses.length > 0
          ? new Set(includeStatuses)
          : null;
      const filterChildModeIds = (childIds = []) => {
          return childIds.filter(childId => {
              const mode = MODE_INDEX[childId];
              if (!mode)
                  return false;
              if (includeSet && !includeSet.has(mode.status))
                  return false;
              return true;
          });
      };
      return MENU_SECTION_DEFINITIONS.map(section => {
          const entries = [];
          MODE_GROUPS.forEach(group => {
              if (!group.menuSections || !group.menuSections.includes(section.id))
                  return;
              const childModeIds = filterChildModeIds(group.childModeIds);
              if (childModeIds.length === 0)
                  return;
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
          if (entries.length === 0)
              return null;
          return {
              id: section.id,
              title: section.title,
              entries
          };
      }).filter((entry) => Boolean(entry));
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
__define('./data/roster-preview.config.ts', (exports, module, __require) => {
  const rosterPreviewConfig = {
      tpDelta: {
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
      },
      statOrder: [
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
      ],
      precision: {
          ARM: 100,
          RES: 100,
          SPD: 100,
          AEregen: 10
      }
  };


  if (!Object.prototype.hasOwnProperty.call(exports, 'default')) exports.default = rosterPreviewConfig;
  module.exports.default = exports.default;
});
__define('./data/roster-preview.ts', (exports, module, __require) => {
  const __dep0 = __require('./../tools/zod-stub/index.js');
  const z = __dep0.z;
  const __dep1 = __require('./catalog.ts');
  const CLASS_BASE = __dep1.CLASS_BASE;
  const RANK_MULT = __dep1.RANK_MULT;
  const ROSTER = __dep1.ROSTER;
  const __dep2 = __require('./utils/assert.ts');
  const assertDefined = __dep2.assertDefined;
  const __dep3 = __require('./data/roster-preview.config.ts');
  const rawRosterPreviewConfig = __dep3.default ?? __dep3;
  const RosterPreviewConfigSchema = z.object({
      tpDelta: z.record(z.number()),
      statOrder: z.array(z.string()),
      precision: z.record(z.number())
  });
  const rosterPreviewConfig = RosterPreviewConfigSchema.parse(rawRosterPreviewConfig);
  // Talent Point (TP) deltas documented trong "ý tưởng nhân vật v3.txt".
  const TP_DELTA = Object.freeze({
      ...rosterPreviewConfig.tpDelta
  });
  const STAT_ORDER = Object.freeze([
      ...rosterPreviewConfig.statOrder
  ]);
  const PRECISION = Object.freeze({
      ...rosterPreviewConfig.precision
  });
  function roundStat(stat, value) {
      var _a;
      const precision = (_a = PRECISION[stat]) !== null && _a !== void 0 ? _a : 1;
      return Math.round(value * precision) / precision;
  }
  function roundTpValue(value) {
      return Math.round(value * 1e6) / 1e6;
  }
  function sanitizeTpAllocation(tpAlloc = {}) {
      const clean = {};
      for (const [stat, value] of Object.entries(tpAlloc)) {
          if (!(stat in TP_DELTA))
              continue;
          const rounded = roundTpValue(value !== null && value !== void 0 ? value : 0);
          if (rounded !== 0) {
              clean[stat] = rounded;
          }
      }
      return clean;
  }
  function applyTpToBase(base, tpAlloc = {}) {
      var _a;
      const cleanTp = sanitizeTpAllocation(tpAlloc);
      const out = { ...base };
      for (const [stat, baseValue] of Object.entries(base)) {
          const delta = TP_DELTA[stat];
          if (delta) {
              const tp = (_a = cleanTp[stat]) !== null && _a !== void 0 ? _a : 0;
              out[stat] = (baseValue !== null && baseValue !== void 0 ? baseValue : 0) + delta * tp;
          }
          else {
              out[stat] = baseValue;
          }
      }
      return out;
  }
  function getRankMultiplier(rank) {
      return assertDefined(RANK_MULT[rank], `Missing rank multiplier for "${rank}"`);
  }
  function applyRankMultiplier(preRank, rank) {
      const multiplier = getRankMultiplier(rank);
      const out = { ...preRank };
      for (const [stat, value] of Object.entries(preRank)) {
          if (stat === 'SPD') {
              out[stat] = roundStat(stat, value !== null && value !== void 0 ? value : 0);
              continue;
          }
          out[stat] = roundStat(stat, (value !== null && value !== void 0 ? value : 0) * multiplier);
      }
      return out;
  }
  function computeFinalStats(className, rank, tpAlloc = {}) {
      const base = assertDefined(CLASS_BASE[className], `Unknown class "${className}"`);
      const preRank = applyTpToBase(base, tpAlloc);
      return applyRankMultiplier(preRank, rank);
  }
  function deriveTpFromMods(base, mods = {}) {
      if (!mods)
          return {};
      const tp = {};
      for (const [stat, modValue] of Object.entries(mods)) {
          if (!(stat in TP_DELTA))
              continue;
          const baseValue = base[stat];
          if (typeof baseValue !== 'number')
              continue;
          const delta = TP_DELTA[stat];
          const raw = delta ? (baseValue * (modValue !== null && modValue !== void 0 ? modValue : 0)) / delta : 0;
          const rounded = roundTpValue(raw);
          if (rounded !== 0) {
              tp[stat] = rounded;
          }
      }
      return tp;
  }
  function totalTp(tpAlloc = {}) {
      return roundTpValue(Object.values(tpAlloc).reduce((sum, value) => sum + value, 0));
  }
  function buildRosterPreviews(tpAllocations = undefined) {
      var _a;
      const result = {};
      for (const unit of ROSTER) {
          const base = CLASS_BASE[unit.class];
          if (!base)
              continue;
          const derivedTp = (_a = tpAllocations === null || tpAllocations === void 0 ? void 0 : tpAllocations[unit.id]) !== null && _a !== void 0 ? _a : deriveTpFromMods(base, unit.mods);
          const cleanTp = sanitizeTpAllocation(derivedTp);
          const preRank = applyTpToBase(base, cleanTp);
          const rankKey = unit.rank;
          const multiplier = getRankMultiplier(rankKey);
          const final = applyRankMultiplier(preRank, rankKey);
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
  /**
   * @param {Record<string, RosterPreview>} previews
   * @param {ReadonlyArray<string>} [statsOrder]
   * @returns {RosterPreviewRow[]}
   */
  function buildPreviewRows(previews, statsOrder = STAT_ORDER) {
      return statsOrder.map((stat) => ({
          stat,
          values: ROSTER.map((unit) => {
              var _a, _b, _c, _d, _e, _f;
              const preview = previews[unit.id];
              return {
                  id: unit.id,
                  name: unit.name,
                  value: (_b = (_a = preview === null || preview === void 0 ? void 0 : preview.final) === null || _a === void 0 ? void 0 : _a[stat]) !== null && _b !== void 0 ? _b : null,
                  preRank: (_d = (_c = preview === null || preview === void 0 ? void 0 : preview.preRank) === null || _c === void 0 ? void 0 : _c[stat]) !== null && _d !== void 0 ? _d : null,
                  tp: (_f = (_e = preview === null || preview === void 0 ? void 0 : preview.tp) === null || _e === void 0 ? void 0 : _e[stat]) !== null && _f !== void 0 ? _f : 0
              };
          })
      }));
  }
  const ROSTER_TP_ALLOCATIONS = Object.fromEntries(ROSTER.map((unit) => {
      const base = CLASS_BASE[unit.class];
      return [unit.id, deriveTpFromMods(base, unit.mods)];
  }));
  const ROSTER_PREVIEWS = buildRosterPreviews(ROSTER_TP_ALLOCATIONS);
  const ROSTER_PREVIEW_ROWS = buildPreviewRows(ROSTER_PREVIEWS);
  const STAT_KEYS = [...STAT_ORDER];

  if (!Object.prototype.hasOwnProperty.call(exports, 'TP_DELTA')) exports.TP_DELTA = TP_DELTA;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ROSTER_TP_ALLOCATIONS')) exports.ROSTER_TP_ALLOCATIONS = ROSTER_TP_ALLOCATIONS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ROSTER_PREVIEWS')) exports.ROSTER_PREVIEWS = ROSTER_PREVIEWS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ROSTER_PREVIEW_ROWS')) exports.ROSTER_PREVIEW_ROWS = ROSTER_PREVIEW_ROWS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'STAT_KEYS')) exports.STAT_KEYS = STAT_KEYS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyTpToBase')) exports.applyTpToBase = applyTpToBase;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyRankMultiplier')) exports.applyRankMultiplier = applyRankMultiplier;
  if (!Object.prototype.hasOwnProperty.call(exports, 'computeFinalStats')) exports.computeFinalStats = computeFinalStats;
  if (!Object.prototype.hasOwnProperty.call(exports, 'deriveTpFromMods')) exports.deriveTpFromMods = deriveTpFromMods;
  if (!Object.prototype.hasOwnProperty.call(exports, 'buildRosterPreviews')) exports.buildRosterPreviews = buildRosterPreviews;
  if (!Object.prototype.hasOwnProperty.call(exports, 'buildPreviewRows')) exports.buildPreviewRows = buildPreviewRows;
});
__define('./data/skills.config.ts', (exports, module, __require) => {
  const skillsConfig = [
      {
          unitId: 'phe',
          basic: {
              name: 'Đánh Thường',
              type: 'basic',
              tags: ['single-target', 'lifesteal', 'mark'],
              effects: {
                  lifesteal: { percentOfDamage: 0.10 },
                  applyMark: { id: 'mark_devour', stacks: 1, maxStacks: 3, ttlTurns: 3, refreshOnHit: true }
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


  if (!Object.prototype.hasOwnProperty.call(exports, 'default')) exports.default = skillsConfig;
  module.exports.default = exports.default;
});
__define('./data/skills.ts', (exports, module, __require) => {
  const __dep0 = __require('./../tools/zod-stub/index.js');
  const z = __dep0.z;
  const __dep1 = __require('./catalog.ts');
  const ROSTER = __dep1.ROSTER;
  const __dep2 = __require('./data/skills.config.ts');
  const rawSkillSetsConfig = __dep2.default ?? __dep2;
  function deepFreeze(value) {
      if (Array.isArray(value)) {
          value.forEach(deepFreeze);
          return Object.freeze(value);
      }
      if (value && typeof value === 'object') {
          Object.values(value).forEach(deepFreeze);
          return Object.freeze(value);
      }
      return value;
  }
  function normalizeSection(section) {
      if (!section)
          return null;
      if (typeof section === 'string') {
          return { name: '', description: section };
      }
      const normalized = { ...section };
      if (Array.isArray(section.tags)) {
          normalized.tags = [...section.tags];
      }
      if (Array.isArray(section.notes)) {
          normalized.notes = [...section.notes];
      }
      else if (typeof section.notes === 'string') {
          const note = section.notes;
          normalized.notes = [note];
      }
      return normalized;
  }
  function normalizeSkillEntry(entry) {
      if (!entry)
          return null;
      const normalized = { ...entry };
      if (Array.isArray(entry.tags)) {
          normalized.tags = [...entry.tags];
      }
      if (entry.cost && typeof entry.cost === 'object') {
          normalized.cost = { ...entry.cost };
      }
      if (Array.isArray(entry.notes)) {
          normalized.notes = [...entry.notes];
      }
      if (entry.notes && !Array.isArray(entry.notes)) {
          const note = entry.notes;
          normalized.notes = [note];
      }
      return normalized;
  }
  const RawSkillSetSchema = z.object({
      unitId: z.string()
  });
  const RawSkillSetListSchema = z.array(RawSkillSetSchema);
  const rawSkillSets = RawSkillSetListSchema.parse(rawSkillSetsConfig);
  const SKILL_KEYS = ['basic', 'skill', 'skills', 'ult', 'talent', 'technique', 'notes'];
  const skillSets = rawSkillSets.reduce((acc, entry) => {
      var _a;
      const skills = Array.isArray(entry.skills)
          ? entry.skills.map(normalizeSkillEntry).filter(isSkillSection)
          : [];
      const skill = entry.skill ? normalizeSkillEntry(entry.skill) : ((_a = skills[0]) !== null && _a !== void 0 ? _a : null);
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
  function isSkillEntry(entry) {
      return Boolean(entry);
  }
  function isSkillSection(entry) {
      return Boolean(entry);
  }
  function getSkillSet(unitId) {
      var _a;
      if (!unitId)
          return null;
      return (_a = skillSets[unitId]) !== null && _a !== void 0 ? _a : null;
  }
  function listSkillSets() {
      return ROSTER
          .map(unit => skillSets[unit.id])
          .filter(isSkillEntry);
  }
  function hasSkillSet(unitId) {
      return unitId != null && Object.prototype.hasOwnProperty.call(skillSets, unitId);
  }
  function validateSkillSetStructure(entry) {
      if (!entry || typeof entry !== 'object')
          return false;
      const record = entry;
      for (const key of SKILL_KEYS) {
          if (!(key in entry)) {
              return false;
          }
      }
      if (!('unitId' in record) || !record.unitId)
          return false;
      if ('skills' in record) {
          const skillsValue = record.skills;
          if (skillsValue && !Array.isArray(skillsValue))
              return false;
      }
      return true;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'getSkillSet')) exports.getSkillSet = getSkillSet;
  if (!Object.prototype.hasOwnProperty.call(exports, 'listSkillSets')) exports.listSkillSets = listSkillSets;
  if (!Object.prototype.hasOwnProperty.call(exports, 'hasSkillSet')) exports.hasSkillSet = hasSkillSet;
  if (!Object.prototype.hasOwnProperty.call(exports, 'validateSkillSetStructure')) exports.validateSkillSetStructure = validateSkillSetStructure;
});
__define('./data/vfx_anchors/loithienanh.json', (exports, module, __require) => {
  const data = JSON.parse('{"unitId":"loithienanh","bodyAnchors":{"root":{"x":0.5,"y":0.5},"head":{"x":0.5,"y":0.86},"chest":{"x":0.5,"y":0.68},"pelvis":{"x":0.5,"y":0.44},"right_fist":{"x":0.66,"y":0.58},"left_fist":{"x":0.34,"y":0.58},"right_elbow":{"x":0.63,"y":0.66},"left_elbow":{"x":0.37,"y":0.66},"right_foot":{"x":0.6,"y":0.1},"left_foot":{"x":0.4,"y":0.1},"back_core":{"x":0.5,"y":0.64}},"vfxBindings":{"basic_combo":{"description":"Đòn đấm thường hai hit, ưu tiên tay phải sau đó tay trái.","anchors":[{"id":"right_fist","timing":"hit1","radius":0.12},{"id":"left_fist","timing":"hit2","radius":0.11}]},"loi_anh_tam_kich":{"description":"Skill1 tung ba cú đấm lôi, tái sử dụng anchor tay phải cho tia hồ quang và tay trái khi chuyển mục tiêu.","anchors":[{"id":"right_fist","timing":"arc_spawn","radius":0.14},{"id":"left_fist","timing":"follow_through","radius":0.12}]},"ngu_loi_phe_than":{"description":"Skill2 đốt máu phát lôi cầu quanh thân, xuất phát từ ngực lan ra 5 hướng.","anchors":[{"id":"chest","timing":"charge","radius":0.18},{"id":"right_fist","timing":"launch_major","radius":0.14},{"id":"left_fist","timing":"launch_minor","radius":0.13}]},"loi_the_bach_chien":{"description":"Skill3 dựng lớp bảo hộ bằng trường điện quấn quanh thân.","anchors":[{"id":"chest","timing":"shield_core","radius":0.22},{"id":"back_core","timing":"shield_back","radius":0.24}]},"huyet_hon_loi_quyet":{"description":"Tuyệt kỹ bùng nổ lôi huyết: hút năng lượng ở ngực, nổ ra trước bụng và chân.","anchors":[{"id":"chest","timing":"charge_up","radius":0.2},{"id":"root","timing":"burst_core","radius":0.26},{"id":"right_foot","timing":"ground_crack","radius":0.15},{"id":"left_foot","timing":"ground_crack","radius":0.15}]}},"ambientEffects":{"lightning_scars":{"description":"Hoa văn lôi văn chạy trên tay và ngực, phát sáng nhịp tim.","anchors":[{"id":"right_elbow","timing":"pulse","radius":0.1},{"id":"left_elbow","timing":"pulse","radius":0.1},{"id":"chest","timing":"pulse","radius":0.12}]},"thermal_noise":{"description":"Nhiễu nhiệt nhẹ trên toàn thân khi đứng yên.","anchors":[{"id":"chest","timing":"idle","radius":0.3}]},"storm_backdrop":{"description":"Hiệu ứng hậu cảnh vòng ấn lôi huyết và mây dông trong các cảnh ult.","anchors":[{"id":"back_core","timing":"ult_only","radius":0.35}]}}}');
  module.exports = data;
  module.exports.default = data;
});
__define('./data/vfx_anchors/schema.ts', (exports, module, __require) => {
  const __dep0 = __require('./../tools/zod-stub/index.js');
  const z = __dep0.z;
  const AnchorPointSchema = z.object({
      x: z.number(),
      y: z.number()
  });
  const AnchorSchema = z.object({
      id: z.string(),
      timing: z.string().optional(),
      radius: z.number().optional()
  });
  const BindingSchema = z.object({
      description: z.string().optional(),
      anchors: z.array(AnchorSchema)
  });
  const BindingMapSchema = z.record(BindingSchema);
  const VfxAnchorDatasetSchema = z.object({
      unitId: z.string(),
      bodyAnchors: z.record(AnchorPointSchema).optional(),
      vfxBindings: BindingMapSchema.optional(),
      ambientEffects: BindingMapSchema.optional()
  });
  const parseVfxAnchorDataset = (input) => {
      var _a, _b, _c;
      const dataset = VfxAnchorDatasetSchema.parse(input);
      return {
          unitId: dataset.unitId,
          bodyAnchors: (_a = dataset.bodyAnchors) !== null && _a !== void 0 ? _a : {},
          vfxBindings: (_b = dataset.vfxBindings) !== null && _b !== void 0 ? _b : {},
          ambientEffects: (_c = dataset.ambientEffects) !== null && _c !== void 0 ? _c : {}
      };
  };

  if (!Object.prototype.hasOwnProperty.call(exports, 'parseVfxAnchorDataset')) exports.parseVfxAnchorDataset = parseVfxAnchorDataset;
});
__define('./engine.ts', (exports, module, __require) => {
  const __dep0 = __require('./config.ts');
  const TOKEN_STYLE = __dep0.TOKEN_STYLE;
  const CHIBI = __dep0.CHIBI;
  const CFG = __dep0.CFG;
  const __dep1 = __require('./art.ts');
  const getUnitArt = __dep1.getUnitArt;
  const getUnitSkin = __dep1.getUnitSkin;
  const DEFAULT_OBLIQUE_CAMERA = {
      rowGapRatio: 0.62,
      topScale: 0.8,
      depthScale: 0.94,
  };
  const CHIBI_PROPS = CHIBI;
  const TOKEN_STYLE_VALUE = TOKEN_STYLE;
  function coerceFinite(value, fallback) {
      const candidate = typeof value === 'number'
          ? value
          : typeof value === 'string'
              ? Number.parseFloat(value)
              : Number(value);
      return Number.isFinite(candidate) ? candidate : fallback;
  }
  /* ---------- Grid ---------- */
  function makeGrid(canvas, cols, rows) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j;
      const pad = coerceFinite((_a = CFG.UI) === null || _a === void 0 ? void 0 : _a.PAD, 12);
      const boardMaxW = coerceFinite((_b = CFG.UI) === null || _b === void 0 ? void 0 : _b.BOARD_MAX_W, 900);
      let viewportW = boardMaxW + pad * 2;
      if (typeof window !== 'undefined') {
          const { innerWidth, visualViewport } = window;
          viewportW = Math.min(viewportW, coerceFinite(innerWidth, viewportW));
          const vvWidth = visualViewport ? coerceFinite(visualViewport.width, viewportW) : viewportW;
          viewportW = Math.min(viewportW, vvWidth);
      }
      if (typeof document !== 'undefined') {
          const docWidth = coerceFinite((_c = document.documentElement) === null || _c === void 0 ? void 0 : _c.clientWidth, viewportW);
          viewportW = Math.min(viewportW, docWidth);
      }
      const viewportSafeW = viewportW;
      const availableW = Math.max(1, viewportSafeW - pad * 2);
      const w = Math.min(availableW, boardMaxW);
      const h = Math.max(Math.floor(w * ((_e = (_d = CFG.UI) === null || _d === void 0 ? void 0 : _d.BOARD_H_RATIO) !== null && _e !== void 0 ? _e : 3 / 7)), (_g = (_f = CFG.UI) === null || _f === void 0 ? void 0 : _f.BOARD_MIN_H) !== null && _g !== void 0 ? _g : 220);
      const maxDprCfg = (_h = CFG.UI) === null || _h === void 0 ? void 0 : _h.MAX_DPR;
      const dprClamp = Number.isFinite(maxDprCfg) && maxDprCfg > 0 ? maxDprCfg : 2;
      const dprRaw = typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio)
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
      if (lowPowerMode) {
          dpr = Math.min(dpr, lowPowerDpr);
      }
      const displayW = w;
      const displayH = h;
      const maxPixelAreaCfg = (_j = CFG.UI) === null || _j === void 0 ? void 0 : _j.MAX_PIXEL_AREA;
      const pixelAreaLimit = Number.isFinite(maxPixelAreaCfg) && maxPixelAreaCfg > 0 ? maxPixelAreaCfg : null;
      if (pixelAreaLimit) {
          const cssArea = displayW * displayH;
          if (cssArea > 0) {
              const maxDprByArea = Math.sqrt(pixelAreaLimit / cssArea);
              if (Number.isFinite(maxDprByArea) && maxDprByArea > 0) {
                  dpr = Math.min(dpr, maxDprByArea);
              }
          }
      }
      if (!Number.isFinite(dpr) || dpr <= 0) {
          dpr = 1;
      }
      if (typeof window !== 'undefined') {
          const visualViewport = window.visualViewport;
          if (visualViewport) {
              const vvScale = coerceFinite(visualViewport.scale, 1);
              if (vvScale > 0) {
                  const scaledDpr = dpr * vvScale;
                  if (Number.isFinite(scaledDpr) && scaledDpr > 0) {
                      dpr = Math.min(dpr, scaledDpr);
                  }
              }
          }
      }
      const pixelW = Math.max(1, Math.round(displayW * dpr));
      const pixelH = Math.max(1, Math.round(displayH * dpr));
      const pixelArea = pixelW * pixelH;
      if (canvas) {
          if (canvas.style) {
              canvas.style.width = `${displayW}px`;
              canvas.style.height = `${displayH}px`;
          }
          if (canvas.width !== pixelW)
              canvas.width = pixelW;
          if (canvas.height !== pixelH)
              canvas.height = pixelH;
      }
      const usableW = displayW - pad * 2;
      const usableH = displayH - pad * 2;
      const tile = Math.floor(Math.min(usableW / cols, usableH / rows));
      const ox = Math.floor((displayW - tile * cols) / 2);
      const oy = Math.floor((displayH - tile * rows) / 2);
      return {
          cols,
          rows,
          tile,
          ox,
          oy,
          w: displayW,
          h: displayH,
          pad,
          dpr,
          pixelW,
          pixelH,
          pixelArea,
      };
  }
  function hitToCell(g, px, py) {
      const cx = Math.floor((px - g.ox) / g.tile);
      const cy = Math.floor((py - g.oy) / g.tile);
      if (cx < 0 || cy < 0 || cx >= g.cols || cy >= g.rows)
          return null;
      return { cx, cy };
  }
  function cellCenter(g, cx, cy) {
      const x = g.ox + g.tile * (cx + 0.5);
      const y = g.oy + g.tile * (cy + 0.5);
      return { x, y };
  }
  /* ---------- Tokens ---------- */
  function drawTokens(ctx, g, tokens) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fs = Math.floor(g.tile * 0.28);
      tokens.forEach((t) => {
          var _a, _b;
          const { x, y } = cellCenter(g, t.cx, t.cy);
          const r = Math.floor(g.tile * 0.36);
          ctx.fillStyle = (_a = t.color) !== null && _a !== void 0 ? _a : '#9adcf0';
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = CFG.COLORS.tokenText;
          ctx.font = `${fs}px system-ui`;
          ctx.fillText(String((_b = t.name) !== null && _b !== void 0 ? _b : ''), x, y);
      });
  }
  function cellOccupied(tokens, cx, cy) {
      return tokens.some((t) => t.cx === cx && t.cy === cy);
  }
  function isSummonMap(value) {
      if (!value)
          return false;
      if (value instanceof Map)
          return true;
      return typeof value.values === 'function';
  }
  function cellReserved(tokens, queued, cx, cy) {
      if (cellOccupied(tokens, cx, cy))
          return true;
      if (queued) {
          const checkQueue = (m) => {
              if (!isSummonMap(m))
                  return false;
              for (const request of m.values()) {
                  if (!request)
                      continue;
                  if (request.cx === cx && request.cy === cy)
                      return true;
              }
              return false;
          };
          if (checkQueue(queued.ally))
              return true;
          if (checkQueue(queued.enemy))
              return true;
      }
      return false;
  }
  function spawnLeaders(tokens, g) {
      var _a, _b;
      const artAlly = getUnitArt('leaderA');
      const artEnemy = getUnitArt('leaderB');
      tokens.push({
          id: 'leaderA',
          name: 'Uyên',
          color: '#6cc8ff',
          cx: 0,
          cy: 1,
          side: 'ally',
          alive: true,
          art: artAlly,
          skinKey: (_a = artAlly === null || artAlly === void 0 ? void 0 : artAlly.skinKey) !== null && _a !== void 0 ? _a : null,
      });
      tokens.push({
          id: 'leaderB',
          name: 'Địch',
          color: '#ff9aa0',
          cx: g.cols - 1,
          cy: 1,
          side: 'enemy',
          alive: true,
          art: artEnemy,
          skinKey: (_b = artEnemy === null || artEnemy === void 0 ? void 0 : artEnemy.skinKey) !== null && _b !== void 0 ? _b : null,
      });
  }
  /* ---------- Helper ---------- */
  function pickRandom(pool, excludeSet, n = 4) {
      const remain = pool
          .filter((u) => {
          if (typeof u === 'undefined') {
              return false;
          }
          if (u && typeof u === 'object') {
              const candidate = u;
              const id = candidate.id;
              if (id !== undefined && id !== null) {
                  return !excludeSet.has(String(id));
              }
              return true;
          }
          if (typeof u === 'string') {
              return !excludeSet.has(u);
          }
          return true;
      })
          .slice();
      for (let i = remain.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = remain[i];
          remain[i] = remain[j];
          remain[j] = temp;
      }
      return remain.slice(0, n);
  }
  const pick3Random = (pool, excludeSet) => pickRandom(pool, excludeSet, 3);
  /* ---------- Oblique grid helpers ---------- */
  function rowLR(g, r, C) {
      var _a;
      const colsW = g.tile * g.cols;
      const topScale = (_a = C.topScale) !== null && _a !== void 0 ? _a : 0.8;
      const pinch = (1 - topScale) * colsW;
      const t = r / g.rows;
      const width = colsW - pinch * (1 - t);
      const left = g.ox + (colsW - width) / 2;
      const right = left + width;
      return { left, right };
  }
  function drawGridOblique(ctx, g, cam, opts = {}) {
      var _a, _b;
      const C = cam !== null && cam !== void 0 ? cam : DEFAULT_OBLIQUE_CAMERA;
      const colors = {
          ally: CFG.COLORS.ally,
          enemy: CFG.COLORS.enemy,
          mid: CFG.COLORS.mid,
          line: CFG.COLORS.line,
          ...((_a = opts.colors) !== null && _a !== void 0 ? _a : {}),
      };
      const rowGap = ((_b = C.rowGapRatio) !== null && _b !== void 0 ? _b : 0.62) * g.tile;
      for (let cy = 0; cy < g.rows; cy++) {
          const yTop = g.oy + cy * rowGap;
          const yBot = g.oy + (cy + 1) * rowGap;
          const LRt = rowLR(g, cy, C);
          const LRb = rowLR(g, cy + 1, C);
          for (let cx = 0; cx < g.cols; cx++) {
              const xtL = LRt.left + (cx / g.cols) * (LRt.right - LRt.left);
              const xtR = LRt.left + ((cx + 1) / g.cols) * (LRt.right - LRt.left);
              const xbL = LRb.left + (cx / g.cols) * (LRb.right - LRb.left);
              const xbR = LRb.left + ((cx + 1) / g.cols) * (LRb.right - LRb.left);
              let fill;
              if (cx < CFG.ALLY_COLS)
                  fill = colors.ally;
              else if (cx >= g.cols - CFG.ENEMY_COLS)
                  fill = colors.enemy;
              else
                  fill = colors.mid;
              ctx.beginPath();
              ctx.moveTo(xtL, yTop);
              ctx.lineTo(xtR, yTop);
              ctx.lineTo(xbR, yBot);
              ctx.lineTo(xbL, yBot);
              ctx.closePath();
              ctx.fillStyle = fill;
              ctx.fill();
              ctx.strokeStyle = colors.line;
              ctx.lineWidth = 1;
              ctx.stroke();
          }
      }
  }
  function hitToCellOblique(g, px, py, cam) {
      var _a;
      const C = cam !== null && cam !== void 0 ? cam : DEFAULT_OBLIQUE_CAMERA;
      const rowGap = ((_a = C.rowGapRatio) !== null && _a !== void 0 ? _a : 0.62) * g.tile;
      const r = (py - g.oy) / rowGap;
      if (r < 0 || r >= g.rows)
          return null;
      const LR = rowLR(g, r, C);
      const u = (px - LR.left) / (LR.right - LR.left);
      if (u < 0 || u >= 1)
          return null;
      const cx = Math.floor(u * g.cols);
      const cy = Math.floor(r);
      return { cx, cy };
  }
  function cellQuadOblique(g, cx, cy, C) {
      var _a;
      const rowGap = ((_a = C.rowGapRatio) !== null && _a !== void 0 ? _a : 0.62) * g.tile;
      const yTop = g.oy + cy * rowGap;
      const yBot = yTop + rowGap;
      const LRt = rowLR(g, cy, C);
      const LRb = rowLR(g, cy + 1, C);
      const xtL = LRt.left + (cx / g.cols) * (LRt.right - LRt.left);
      const xtR = LRt.left + ((cx + 1) / g.cols) * (LRt.right - LRt.left);
      const xbL = LRb.left + (cx / g.cols) * (LRb.right - LRb.left);
      const xbR = LRb.left + ((cx + 1) / g.cols) * (LRb.right - LRb.left);
      return { xtL, xtR, xbL, xbR, yTop, yBot };
  }
  function cellCenterOblique(g, cx, cy, C) {
      const q = cellQuadOblique(g, cx, cy, C);
      const x = (q.xtL + q.xtR + q.xbL + q.xbR) / 4;
      const y = (q.yTop + q.yBot) / 2;
      return { x, y };
  }
  function projectCellOblique(g, cx, cy, cam) {
      var _a;
      const C = cam !== null && cam !== void 0 ? cam : {};
      const { x, y } = cellCenterOblique(g, cx, cy, C);
      const k = (_a = C.depthScale) !== null && _a !== void 0 ? _a : 0.94;
      const depth = g.rows - 1 - cy;
      const scale = Math.pow(k, depth);
      return { x, y, scale };
  }
  function drawChibi(ctx, x, y, r, facing = 1, color = '#a9f58c') {
      const lw = Math.max(CHIBI_PROPS.line, Math.floor(r * 0.28));
      const hr = Math.max(3, Math.floor(r * CHIBI_PROPS.headR));
      const torso = r * CHIBI_PROPS.torso;
      const arm = r * CHIBI_PROPS.arm;
      const leg = r * CHIBI_PROPS.leg;
      const wep = r * CHIBI_PROPS.weapon;
      ctx.save();
      ctx.translate(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.arc(0, -torso - hr, hr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -torso);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -torso * 0.6);
      ctx.lineTo(-arm * 0.8, -torso * 0.2);
      ctx.moveTo(0, -torso * 0.6);
      ctx.lineTo(arm * 0.8 * facing, -torso * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-leg * 0.6, leg * 0.9);
      ctx.moveTo(0, 0);
      ctx.lineTo(leg * 0.6, leg * 0.9);
      ctx.stroke();
      const hx = arm * 0.8 * facing;
      const hy = -torso * 0.2;
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
  function joinSignatureParts(parts) {
      if (!Array.isArray(parts) || parts.length === 0) {
          return '';
      }
      const normalized = [];
      for (const part of parts) {
          if (part == null) {
              normalized.push('');
              continue;
          }
          if (typeof part === 'number') {
              normalized.push(Number.isFinite(part) ? String(part) : '');
              continue;
          }
          normalized.push(String(part));
      }
      return normalized.join('|');
  }
  function contextSignature(g, cam) {
      var _a, _b, _c;
      const C = cam !== null && cam !== void 0 ? cam : {};
      return joinSignatureParts([
          g.cols,
          g.rows,
          g.tile,
          g.ox,
          g.oy,
          (_a = C.rowGapRatio) !== null && _a !== void 0 ? _a : 0.62,
          (_b = C.topScale) !== null && _b !== void 0 ? _b : 0.8,
          (_c = C.depthScale) !== null && _c !== void 0 ? _c : 0.94,
      ]);
  }
  function warnInvalidToken(context, token) {
      if (!CFG.DEBUG)
          return;
      try {
          console.warn(`[engine] ${context}: expected token object but received`, token);
      }
      catch (_err) {
          // ignore logging errors
      }
  }
  function getTokenProjection(token, g, cam, sig) {
      if (!token) {
          return null;
      }
      if (typeof token !== 'object') {
          warnInvalidToken('getTokenProjection', token);
          return null;
      }
      let entry = TOKEN_PROJECTION_CACHE.get(token);
      if (!entry || entry.cx !== token.cx || entry.cy !== token.cy || entry.sig !== sig) {
          const projection = projectCellOblique(g, token.cx, token.cy, cam);
          entry = {
              cx: token.cx,
              cy: token.cy,
              sig,
              projection,
          };
          TOKEN_PROJECTION_CACHE.set(token, entry);
      }
      return entry.projection;
  }
  function clearTokenCaches(token) {
      var _a, _b;
      if (!token) {
          return;
      }
      if (typeof token !== 'object') {
          warnInvalidToken('clearTokenCaches', token);
          return;
      }
      TOKEN_PROJECTION_CACHE.delete(token);
      const skinKey = (_a = token.skinKey) !== null && _a !== void 0 ? _a : null;
      const cacheKey = `${(_b = token.id) !== null && _b !== void 0 ? _b : '__anon__'}::${skinKey !== null && skinKey !== void 0 ? skinKey : ''}`;
      TOKEN_VISUAL_CACHE.delete(cacheKey);
  }
  function normalizeSpriteDescriptor(sprite) {
      var _a, _b;
      if (!sprite)
          return null;
      if (typeof sprite === 'string') {
          return { src: sprite };
      }
      const descriptor = {};
      if (typeof sprite.src === 'string') {
          descriptor.src = sprite.src;
      }
      if (typeof sprite.cacheKey === 'string') {
          descriptor.cacheKey = sprite.cacheKey;
      }
      if (sprite.skinId !== undefined) {
          descriptor.skinId = (_a = sprite.skinId) !== null && _a !== void 0 ? _a : null;
      }
      if (sprite.shadow !== undefined) {
          descriptor.shadow = (_b = sprite.shadow) !== null && _b !== void 0 ? _b : null;
      }
      if (Number.isFinite(sprite.scale)) {
          descriptor.scale = sprite.scale;
      }
      const aspect = typeof sprite.aspect === 'number' ? sprite.aspect : null;
      if (aspect !== null && Number.isFinite(aspect)) {
          descriptor.aspect = aspect;
      }
      if (Number.isFinite(sprite.anchor)) {
          descriptor.anchor = sprite.anchor;
      }
      return descriptor;
  }
  function getTokenVisual(token, art) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j;
      if (!token) {
          return { spriteKey: null, spriteEntry: null, shadowCfg: null };
      }
      const skinKey = (_b = (_a = art === null || art === void 0 ? void 0 : art.skinKey) !== null && _a !== void 0 ? _a : token.skinKey) !== null && _b !== void 0 ? _b : null;
      const cacheKey = `${(_c = token.id) !== null && _c !== void 0 ? _c : '__anon__'}::${skinKey !== null && skinKey !== void 0 ? skinKey : ''}`;
      const descriptor = normalizeSpriteDescriptor((_d = art === null || art === void 0 ? void 0 : art.sprite) !== null && _d !== void 0 ? _d : null);
      const spriteSrc = (_e = descriptor === null || descriptor === void 0 ? void 0 : descriptor.src) !== null && _e !== void 0 ? _e : null;
      const spriteKey = (descriptor === null || descriptor === void 0 ? void 0 : descriptor.cacheKey) || (spriteSrc ? `${spriteSrc}::${(_g = (_f = descriptor === null || descriptor === void 0 ? void 0 : descriptor.skinId) !== null && _f !== void 0 ? _f : skinKey) !== null && _g !== void 0 ? _g : ''}` : null);
      let entry = TOKEN_VISUAL_CACHE.get(cacheKey);
      if (!entry || entry.spriteKey !== spriteKey) {
          const spriteEntry = spriteSrc ? ensureSpriteLoaded(art) : null;
          const shadowCfg = (_j = (_h = descriptor === null || descriptor === void 0 ? void 0 : descriptor.shadow) !== null && _h !== void 0 ? _h : art === null || art === void 0 ? void 0 : art.shadow) !== null && _j !== void 0 ? _j : null;
          entry = {
              spriteKey,
              spriteEntry,
              shadowCfg,
          };
          TOKEN_VISUAL_CACHE.set(cacheKey, entry);
      }
      return entry;
  }
  function ensureTokenArt(token) {
      var _a, _b, _c;
      if (!token)
          return null;
      const desiredSkin = getUnitSkin(token.id);
      if (!token.art || token.skinKey !== desiredSkin) {
          const art = getUnitArt(token.id, { skinKey: desiredSkin });
          token.art = art;
          token.skinKey = (_b = (_a = art === null || art === void 0 ? void 0 : art.skinKey) !== null && _a !== void 0 ? _a : desiredSkin) !== null && _b !== void 0 ? _b : null;
      }
      return (_c = token.art) !== null && _c !== void 0 ? _c : null;
  }
  function ensureSpriteLoaded(art) {
      var _a, _b;
      if (!art || !art.sprite || typeof Image === 'undefined')
          return null;
      const descriptor = normalizeSpriteDescriptor(art.sprite);
      if (!descriptor || !descriptor.src)
          return null;
      const skinId = (_b = (_a = descriptor.skinId) !== null && _a !== void 0 ? _a : art.skinKey) !== null && _b !== void 0 ? _b : null;
      const key = descriptor.cacheKey || `${descriptor.src}::${skinId !== null && skinId !== void 0 ? skinId : ''}`;
      let entry = SPRITE_CACHE.get(key);
      if (!entry) {
          const img = new Image();
          entry = { status: 'loading', img, key, src: descriptor.src, skinId };
          if ('decoding' in img)
              img.decoding = 'async';
          img.onload = () => {
              entry.status = 'ready';
              if (typeof window !== 'undefined') {
                  try {
                      window.dispatchEvent(new Event(ART_SPRITE_EVENT));
                  }
                  catch (_err) {
                      // ignore
                  }
              }
          };
          img.onerror = () => {
              entry.status = 'error';
          };
          img.src = descriptor.src;
          SPRITE_CACHE.set(key, entry);
      }
      return entry;
  }
  function drawStylizedShape(ctx, width, height, anchor, art) {
      var _a, _b;
      const paletteSource = (_a = art === null || art === void 0 ? void 0 : art.palette) !== null && _a !== void 0 ? _a : null;
      const palette = paletteSource ? { ...paletteSource } : {};
      const primary = typeof palette.primary === 'string' ? palette.primary : '#86c4ff';
      const secondary = typeof palette.secondary === 'string' ? palette.secondary : '#1f3242';
      const accent = typeof palette.accent === 'string' ? palette.accent : '#d2f4ff';
      const outline = typeof palette.outline === 'string' ? palette.outline : 'rgba(0,0,0,0.55)';
      const top = -height * anchor;
      const bottom = height - height * anchor;
      const halfW = width / 2;
      const shape = (_b = art === null || art === void 0 ? void 0 : art.shape) !== null && _b !== void 0 ? _b : 'sentinel';
      const gradient = ctx.createLinearGradient(0, top, 0, bottom);
      gradient.addColorStop(0, primary);
      gradient.addColorStop(1, secondary);
      ctx.save();
      ctx.beginPath();
      switch (shape) {
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
  function roundedRectPath(ctx, x, y, w, h, radius) {
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
  function formatName(text) {
      if (!text)
          return '';
      const str = String(text);
      if (str.length <= 16)
          return str;
      return `${str.slice(0, 15)}…`;
  }
  const nameplateMetricsCache = new Map();
  let nameplateCacheFontSignature = '';
  function drawNameplate(ctx, text, x, y, r, art) {
      var _a, _b;
      if (!text)
          return;
      const layout = (_a = art === null || art === void 0 ? void 0 : art.layout) !== null && _a !== void 0 ? _a : {};
      const fontSize = Math.max(11, Math.floor(r * ((_b = layout.labelFont) !== null && _b !== void 0 ? _b : 0.7)));
      const padX = Math.max(8, Math.floor(fontSize * 0.6));
      const padY = Math.max(4, Math.floor(fontSize * 0.35));
      ctx.save();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      const font = `${fontSize}px 'Be Vietnam Pro', 'Inter', system-ui`;
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (font !== nameplateCacheFontSignature) {
          nameplateMetricsCache.clear();
          nameplateCacheFontSignature = font;
      }
      const key = `${fontSize}|${text}`;
      let cached = nameplateMetricsCache.get(key);
      if (!cached) {
          const metrics = ctx.measureText(text);
          cached = {
              width: Math.ceil(metrics.width + padX * 2),
              height: Math.ceil(fontSize + padY * 2),
          };
          nameplateMetricsCache.set(key, cached);
      }
      const { width, height } = cached;
      const radius = Math.max(4, Math.floor(height / 2));
      const boxX = Math.round(x - width / 2);
      const boxY = Math.round(y - height / 2);
      roundedRectPath(ctx, boxX, boxY, width, height, radius);
      const label = art === null || art === void 0 ? void 0 : art.label;
      const bgColor = (label && typeof label === 'object' && label.bg) || 'rgba(12,20,30,0.82)';
      ctx.fillStyle = bgColor;
      ctx.fill();
      if (label && typeof label === 'object' && label.stroke) {
          ctx.strokeStyle = label.stroke;
          ctx.lineWidth = 1;
          ctx.stroke();
      }
      const textColor = (label && typeof label === 'object' && label.text) || '#f4f8ff';
      ctx.fillStyle = textColor;
      ctx.fillText(text, x, boxY + height / 2);
      ctx.restore();
  }
  function drawTokensOblique(ctx, g, tokens, cam) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
      const C = cam !== null && cam !== void 0 ? cam : DEFAULT_OBLIQUE_CAMERA;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const baseR = Math.floor(g.tile * 0.36);
      const sig = contextSignature(g, C);
      const alive = [];
      for (const token of tokens) {
          if (!token || !token.alive) {
              if (token && !token.alive) {
                  if (typeof token === 'object') {
                      clearTokenCaches(token);
                  }
                  else {
                      warnInvalidToken('drawTokensOblique', token);
                  }
              }
              continue;
          }
          const projection = getTokenProjection(token, g, C, sig);
          if (!projection)
              continue;
          alive.push({ token, projection });
      }
      alive.sort((a, b) => {
          const ya = a.projection.y;
          const yb = b.projection.y;
          if (ya === yb)
              return a.token.cx - b.token.cx;
          return ya - yb;
      });
      const perfCfg = (CFG === null || CFG === void 0 ? void 0 : CFG.PERFORMANCE) || {};
      const normalizePreset = (value, fallback = null) => {
          if (value === 'off' || value === 'soft' || value === 'medium')
              return value;
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
      const gridDpr = Number.isFinite(g === null || g === void 0 ? void 0 : g.dpr) ? g.dpr : null;
      let shadowPreset = null;
      if (perfCfg.LOW_POWER_SHADOWS) {
          shadowPreset = normalizePreset(perfCfg.LOW_SHADOW_PRESET, 'off');
      }
      else {
          if (!shadowPreset && highDprCutoff !== null && gridDpr !== null && gridDpr >= highDprCutoff) {
              shadowPreset = normalizePreset(perfCfg.HIGH_DPR_SHADOW_PRESET, 'off');
          }
          if (!shadowPreset && shadowThreshold !== null && alive.length >= shadowThreshold) {
              shadowPreset = normalizePreset(perfCfg.HIGH_LOAD_SHADOW_PRESET, normalizePreset(perfCfg.LOW_SHADOW_PRESET, 'off'));
          }
          if (!shadowPreset && mediumThreshold !== null && alive.length >= mediumThreshold) {
              shadowPreset = normalizePreset(perfCfg.MEDIUM_SHADOW_PRESET, 'medium');
          }
      }
      const reduceShadows = shadowPreset !== null;
      for (const { token: t, projection: p } of alive) {
          const scale = (_a = p.scale) !== null && _a !== void 0 ? _a : 1;
          const r = Math.max(6, Math.floor(baseR * scale));
          const facing = t.side === 'ally' ? 1 : -1;
          const art = ensureTokenArt(t);
          const layout = (_b = art === null || art === void 0 ? void 0 : art.layout) !== null && _b !== void 0 ? _b : {};
          const spriteCfg = (_d = normalizeSpriteDescriptor((_c = art === null || art === void 0 ? void 0 : art.sprite) !== null && _c !== void 0 ? _c : null)) !== null && _d !== void 0 ? _d : {};
          const spriteHeightMult = (_e = layout.spriteHeight) !== null && _e !== void 0 ? _e : 2.4;
          const spriteScale = Number.isFinite(spriteCfg.scale) ? spriteCfg.scale : 1;
          const spriteHeight = r * spriteHeightMult * ((_f = art === null || art === void 0 ? void 0 : art.size) !== null && _f !== void 0 ? _f : 1) * spriteScale;
          const spriteAspect = (_h = (_g = (Number.isFinite(spriteCfg.aspect) ? spriteCfg.aspect : null)) !== null && _g !== void 0 ? _g : layout.spriteAspect) !== null && _h !== void 0 ? _h : 0.78;
          const spriteWidth = spriteHeight * spriteAspect;
          const anchor = Number.isFinite(spriteCfg.anchor) ? spriteCfg.anchor : (_j = layout.anchor) !== null && _j !== void 0 ? _j : 0.78;
          const hasRichArt = !!(art && ((spriteCfg && spriteCfg.src) || art.shape));
          if (hasRichArt) {
              const { spriteEntry, shadowCfg } = getTokenVisual(t, art);
              const spriteReady = !!(spriteEntry && spriteEntry.status === 'ready' && spriteEntry.img);
              ctx.save();
              ctx.translate(p.x, p.y);
              if (facing === -1 && (art === null || art === void 0 ? void 0 : art.mirror) !== false)
                  ctx.scale(-1, 1);
              const rawShadow = (_k = shadowCfg !== null && shadowCfg !== void 0 ? shadowCfg : art === null || art === void 0 ? void 0 : art.shadow) !== null && _k !== void 0 ? _k : null;
              const shadowObject = rawShadow && typeof rawShadow === 'object' ? rawShadow : {};
              const shadowColorFallback = typeof rawShadow === 'string'
                  ? rawShadow
                  : typeof (art === null || art === void 0 ? void 0 : art.shadow) === 'string'
                      ? art.shadow
                      : undefined;
              let shadowColor = (_o = (_m = (_l = shadowObject.color) !== null && _l !== void 0 ? _l : art === null || art === void 0 ? void 0 : art.glow) !== null && _m !== void 0 ? _m : shadowColorFallback) !== null && _o !== void 0 ? _o : 'rgba(0,0,0,0.35)';
              let shadowBlur = Number.isFinite(shadowObject.blur) ? shadowObject.blur : Math.max(6, r * 0.7);
              let shadowOffsetX = Number.isFinite(shadowObject.offsetX) ? shadowObject.offsetX : 0;
              let shadowOffsetY = Number.isFinite(shadowObject.offsetY) ? shadowObject.offsetY : Math.max(2, r * 0.2);
              if (reduceShadows) {
                  const cheap = shadowPreset;
                  if (cheap === 'soft') {
                      shadowColor = 'rgba(0, 0, 0, 0.18)';
                      shadowBlur = Math.min(6, shadowBlur * 0.4);
                      shadowOffsetX = 0;
                      shadowOffsetY = Math.min(4, Math.max(1, shadowOffsetY * 0.4));
                  }
                  else if (cheap === 'medium') {
                      shadowColor = 'rgba(0, 0, 0, 0.24)';
                      shadowBlur = Math.min(10, Math.max(2, shadowBlur * 0.6));
                      shadowOffsetX = 0;
                      shadowOffsetY = Math.min(6, Math.max(1, shadowOffsetY * 0.6));
                  }
                  else {
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
              if (spriteReady && spriteEntry) {
                  ctx.drawImage(spriteEntry.img, -spriteWidth / 2, -spriteHeight * anchor, spriteWidth, spriteHeight);
              }
              else {
                  drawStylizedShape(ctx, spriteWidth, spriteHeight, anchor, art);
              }
              ctx.restore();
          }
          else if (TOKEN_STYLE_VALUE === 'chibi') {
              drawChibi(ctx, p.x, p.y, r, facing, t.color || '#9adcf0');
          }
          else {
              ctx.fillStyle = t.color || '#9adcf0';
              ctx.beginPath();
              ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
              ctx.fill();
          }
          if ((art === null || art === void 0 ? void 0 : art.label) !== false) {
              const name = formatName(t.name || t.id);
              const offset = (_p = layout.labelOffset) !== null && _p !== void 0 ? _p : 1.2;
              drawNameplate(ctx, name, p.x, p.y + r * offset, r, art);
          }
      }
  }
  function drawQueuedOblique(ctx, g, queued, cam) {
      var _a;
      if (!queued)
          return;
      const C = cam !== null && cam !== void 0 ? cam : DEFAULT_OBLIQUE_CAMERA;
      const baseR = Math.floor(g.tile * 0.36);
      const k = (_a = C.depthScale) !== null && _a !== void 0 ? _a : 0.94;
      const drawSide = (map, side) => {
          var _a, _b;
          if (!isSummonMap(map))
              return;
          if (side === 'ally' && !((_a = CFG.DEBUG) === null || _a === void 0 ? void 0 : _a.SHOW_QUEUED))
              return;
          if (side === 'enemy' && !((_b = CFG.DEBUG) === null || _b === void 0 ? void 0 : _b.SHOW_QUEUED_ENEMY))
              return;
          for (const p of map.values()) {
              if (!p)
                  continue;
              const c = cellCenterOblique(g, p.cx, p.cy, C);
              const depth = g.rows - 1 - p.cy;
              const r = Math.max(6, Math.floor(baseR * Math.pow(k, depth)));
              ctx.save();
              ctx.globalAlpha = 0.5;
              ctx.fillStyle = p.color || '#5b6a78';
              ctx.beginPath();
              ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
          }
      };
      drawSide(queued.ally, 'ally');
      drawSide(queued.enemy, 'enemy');
  }
  const SIDE = {
      ALLY: 'ally',
      ENEMY: 'enemy',
  };
  function slotIndex(side, cx, cy) {
      if (side === SIDE.ALLY || side === 'ally') {
          return (CFG.ALLY_COLS - 1 - cx) * 3 + (cy + 1);
      }
      const enemyStart = CFG.GRID_COLS - CFG.ENEMY_COLS;
      const colIndex = cx - enemyStart;
      return colIndex * 3 + (cy + 1);
  }
  function slotToCell(side, slot) {
      const s = Math.max(1, Math.min(9, slot | 0));
      const colIndex = Math.floor((s - 1) / 3);
      const rowIndex = (s - 1) % 3;
      if (side === SIDE.ALLY || side === 'ally') {
          const cx = CFG.ALLY_COLS - 1 - colIndex;
          const cy = rowIndex;
          return { cx, cy };
      }
      const enemyStart = CFG.GRID_COLS - CFG.ENEMY_COLS;
      const cx = enemyStart + colIndex;
      const cy = rowIndex;
      return { cx, cy };
  }
  function zoneCode(side, cx, cy, { numeric = false } = {}) {
      const slot = slotIndex(side, cx, cy);
      if (numeric)
          return (side === SIDE.ALLY || side === 'ally' ? 0 : 1) * 16 + slot;
      const prefix = side === SIDE.ALLY || side === 'ally' ? 'A' : 'E';
      return prefix + String(slot);
  }
  const ORDER_ALLY = Array.from({ length: 9 }, (_, i) => slotToCell(SIDE.ALLY, i + 1));
  const ORDER_ENEMY = Array.from({ length: 9 }, (_, i) => slotToCell(SIDE.ENEMY, i + 1));

  if (!Object.prototype.hasOwnProperty.call(exports, 'pick3Random')) exports.pick3Random = pick3Random;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ART_SPRITE_EVENT')) exports.ART_SPRITE_EVENT = ART_SPRITE_EVENT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'SIDE')) exports.SIDE = SIDE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ORDER_ALLY')) exports.ORDER_ALLY = ORDER_ALLY;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ORDER_ENEMY')) exports.ORDER_ENEMY = ORDER_ENEMY;
  if (!Object.prototype.hasOwnProperty.call(exports, 'makeGrid')) exports.makeGrid = makeGrid;
  if (!Object.prototype.hasOwnProperty.call(exports, 'hitToCell')) exports.hitToCell = hitToCell;
  if (!Object.prototype.hasOwnProperty.call(exports, 'drawTokens')) exports.drawTokens = drawTokens;
  if (!Object.prototype.hasOwnProperty.call(exports, 'cellOccupied')) exports.cellOccupied = cellOccupied;
  if (!Object.prototype.hasOwnProperty.call(exports, 'cellReserved')) exports.cellReserved = cellReserved;
  if (!Object.prototype.hasOwnProperty.call(exports, 'spawnLeaders')) exports.spawnLeaders = spawnLeaders;
  if (!Object.prototype.hasOwnProperty.call(exports, 'pickRandom')) exports.pickRandom = pickRandom;
  if (!Object.prototype.hasOwnProperty.call(exports, 'drawGridOblique')) exports.drawGridOblique = drawGridOblique;
  if (!Object.prototype.hasOwnProperty.call(exports, 'hitToCellOblique')) exports.hitToCellOblique = hitToCellOblique;
  if (!Object.prototype.hasOwnProperty.call(exports, 'projectCellOblique')) exports.projectCellOblique = projectCellOblique;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ensureSpriteLoaded')) exports.ensureSpriteLoaded = ensureSpriteLoaded;
  if (!Object.prototype.hasOwnProperty.call(exports, 'drawTokensOblique')) exports.drawTokensOblique = drawTokensOblique;
  if (!Object.prototype.hasOwnProperty.call(exports, 'drawQueuedOblique')) exports.drawQueuedOblique = drawQueuedOblique;
  if (!Object.prototype.hasOwnProperty.call(exports, 'slotIndex')) exports.slotIndex = slotIndex;
  if (!Object.prototype.hasOwnProperty.call(exports, 'slotToCell')) exports.slotToCell = slotToCell;
  if (!Object.prototype.hasOwnProperty.call(exports, 'zoneCode')) exports.zoneCode = zoneCode;
});
__define('./entry.ts', (exports, module, __require) => {
  const __dep0 = __require('./app/shell.ts');
  const createAppShell = __dep0.createAppShell;
  const __dep1 = __require('./screens/main-menu/view/index.ts');
  const renderMainMenuView = __dep1.renderMainMenuView;
  const __dep2 = __require('./data/modes.ts');
  const MODES = __dep2.MODES;
  const MODE_GROUPS = __dep2.MODE_GROUPS;
  const MODE_STATUS = __dep2.MODE_STATUS;
  const getMenuSections = __dep2.getMenuSections;
  const isStoppableSession = (value) => (Boolean(value) && typeof value.stop === 'function');
  const isStartableSession = (value) => (Boolean(value) && typeof value.start === 'function');
  const SUCCESS_EVENT = 'arclune:loaded';
  const SCREEN_MAIN_MENU = 'main-menu';
  const SCREEN_PVE = 'pve-session';
  const SCREEN_COLLECTION = 'collection';
  const SCREEN_LINEUP = 'lineup';
  const COMING_SOON_MODULE_ID = '@modes/coming-soon.stub.ts';
  const COLLECTION_SCREEN_MODULE_ID = '@screens/collection/index.ts';
  const LINEUP_SCREEN_MODULE_ID = '@screens/lineup/index.ts';
  const APP_SCREEN_CLASSES = [
      `app--${SCREEN_MAIN_MENU}`,
      `app--${SCREEN_PVE}`,
      'app--pve',
      `app--${SCREEN_COLLECTION}`,
      `app--${SCREEN_LINEUP}`
  ];
  async function loadBundledModule(id) {
      var _a, _b;
      const globalRequire = typeof globalThis !== 'undefined'
          ? globalThis.__require
          : undefined;
      const runtimeRequire = typeof __require === 'function'
          ? __require
          : typeof globalRequire === 'function'
              ? globalRequire
              : null;
      const loader = runtimeRequire
          ? Promise.resolve().then(() => runtimeRequire(id))
          : import(id);
      const resolved = await loader;
      if (resolved && typeof resolved === 'object') {
          const moduleRecord = resolved;
          const comingSoonFlag = (_a = moduleRecord.comingSoon) !== null && _a !== void 0 ? _a : (_b = moduleRecord.COMING_SOON_MODULE) === null || _b === void 0 ? void 0 : _b.comingSoon;
          if (typeof comingSoonFlag !== 'undefined' && moduleRecord.comingSoon !== comingSoonFlag) {
              return { ...moduleRecord, comingSoon: comingSoonFlag };
          }
      }
      return resolved;
  }
  function isScreenParamMap(value) {
      return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }
  function cloneScreenParamMap(source) {
      return { ...source };
  }
  function cloneScreenParams(params) {
      if (!params) {
          return null;
      }
      return cloneScreenParamMap(params);
  }
  const MODE_DEFINITIONS = MODES.reduce((acc, mode) => {
      const shell = mode.shell;
      const screenId = (shell === null || shell === void 0 ? void 0 : shell.screenId) || SCREEN_MAIN_MENU;
      const moduleId = mode.status === MODE_STATUS.AVAILABLE && (shell === null || shell === void 0 ? void 0 : shell.moduleId)
          ? shell.moduleId
          : ((shell === null || shell === void 0 ? void 0 : shell.fallbackModuleId) || COMING_SOON_MODULE_ID);
      const defaultParams = shell === null || shell === void 0 ? void 0 : shell.defaultParams;
      const params = mode.status === MODE_STATUS.AVAILABLE && isScreenParamMap(defaultParams)
          ? cloneScreenParamMap(defaultParams)
          : null;
      acc[mode.id] = {
          key: mode.id,
          label: mode.title,
          type: mode.type,
          description: mode.shortDescription || '',
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
      if (definition && definition.screenId && !map.has(definition.screenId)) {
          map.set(definition.screenId, definition);
      }
      return map;
  }, new Map());
  const MODE_METADATA = MODES.map(mode => {
      const definition = MODE_DEFINITIONS[mode.id];
      return {
          key: mode.id,
          id: (definition === null || definition === void 0 ? void 0 : definition.screenId) || SCREEN_MAIN_MENU,
          title: mode.title,
          description: mode.shortDescription,
          icon: mode.icon,
          tags: Array.isArray(mode.tags) ? [...mode.tags] : [],
          status: mode.status,
          params: (definition === null || definition === void 0 ? void 0 : definition.params) || null,
          parentId: mode.parentId || null
      };
  });
  const MODE_GROUP_METADATA = MODE_GROUPS.map(group => {
      const childModeIds = Array.isArray(group.childModeIds) ? [...group.childModeIds] : [];
      const childStatuses = childModeIds.reduce((acc, childId) => {
          const child = MODES.find(mode => mode.id === childId);
          if (child) {
              acc.add(child.status);
          }
          return acc;
      }, new Set());
      let status = MODE_STATUS.PLANNED;
      if (childStatuses.has(MODE_STATUS.AVAILABLE)) {
          status = MODE_STATUS.AVAILABLE;
      }
      else if (childStatuses.has(MODE_STATUS.COMING_SOON)) {
          status = MODE_STATUS.COMING_SOON;
      }
      else if (childStatuses.size > 0) {
          const derivedStatus = Array.from(childStatuses)[0];
          if (derivedStatus) {
              status = derivedStatus;
          }
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
  const CARD_METADATA = Object.freeze([
      ...MODE_METADATA,
      ...MODE_GROUP_METADATA
  ]);
  const MENU_SECTIONS = Object.freeze(getMenuSections({
      includeStatuses: [MODE_STATUS.AVAILABLE, MODE_STATUS.COMING_SOON]
  }).map(section => Object.freeze({
      id: section.id,
      title: section.title,
      entries: Object.freeze(section.entries.map(entry => Object.freeze({
          id: entry.id,
          type: entry.type,
          cardId: entry.cardId,
          childModeIds: Object.freeze([...entry.childModeIds])
      })))
  })));
  let activeModal = null;
  let shellInstance = null;
  let rootElement = null;
  let pveRenderToken = 0;
  const bootstrapOptions = { isFileProtocol: false };
  let renderMessageRef = null;
  let renderMessageIsExternal = false;
  let mainMenuView = null;
  let customScreenController = null;
  let customScreenId = null;
  let customScreenToken = 0;
  let collectionView = null;
  let collectionRenderToken = 0;
  let lineupView = null;
  let lineupRenderToken = 0;
  function areScreenParamsEqual(current, next) {
      if (current === next) {
          return true;
      }
      if (current === null || next === null) {
          return false;
      }
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);
      if (currentKeys.length !== nextKeys.length) {
          return false;
      }
      for (const key of currentKeys) {
          if (!Object.prototype.hasOwnProperty.call(next, key)) {
              return false;
          }
          if (current[key] !== next[key]) {
              return false;
          }
      }
      return true;
  }
  function dispatchLoaded() {
      try {
          window.dispatchEvent(new Event(SUCCESS_EVENT));
      }
      catch (err) {
          console.warn('Unable to dispatch load event', err);
      }
  }
  function ensureRenderer() {
      if (typeof window.arcluneRenderMessage === 'function') {
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
  function resolveErrorMessage(error, fallback = 'Lỗi không xác định.') {
      if (error && typeof error === 'object' && 'message' in error) {
          return String(error.message);
      }
      const value = typeof error === 'undefined' || error === null ? '' : String(error);
      return value.trim() ? value : fallback;
  }
  function showFatalError(error, renderMessage, options) {
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
  function isMissingModuleError(error) {
      if (!error || typeof error !== 'object')
          return false;
      const err = error;
      if (err.code === 'MODULE_NOT_FOUND')
          return true;
      const message = typeof err.message === 'string' ? err.message : '';
      const name = typeof err.name === 'string' ? err.name : '';
      if (name === 'TypeError') {
          const typeErrorImportPatterns = [
              /Failed to fetch dynamically imported module/i,
              /dynamically imported module/i,
              /Importing a module script failed/i,
              /Failed to resolve module specifier/i,
              /Module script load failed/i,
              /MIME type/i
          ];
          if (typeErrorImportPatterns.some(pattern => pattern.test(message))) {
              return true;
          }
      }
      if (err.cause && err.cause !== error && typeof err.cause === 'object') {
          if (isMissingModuleError(err.cause)) {
              return true;
          }
      }
      return /Cannot find module/i.test(message) || /module(\s|-)not(\s|-)found/i.test(message);
  }
  function isComingSoonModule(module) {
      var _a;
      if (!module)
          return true;
      const record = module;
      if (record.comingSoon)
          return true;
      if ((_a = record.COMING_SOON_MODULE) === null || _a === void 0 ? void 0 : _a.comingSoon)
          return true;
      return false;
  }
  function dismissModal() {
      if (activeModal && typeof activeModal.remove === 'function') {
          activeModal.remove();
      }
      activeModal = null;
  }
  function clearAppScreenClasses() {
      const root = rootElement;
      if (!root || !root.classList)
          return;
      APP_SCREEN_CLASSES.forEach(cls => root.classList.remove(cls));
  }
  function destroyCustomScreen(force = false) {
      const hasActiveScreen = !!(customScreenController || customScreenId);
      if (!force && !hasActiveScreen) {
          return;
      }
      if (customScreenController && typeof customScreenController.destroy === 'function') {
          try {
              customScreenController.destroy();
          }
          catch (err) {
              console.error('[screen] cleanup error', err);
          }
      }
      customScreenController = null;
      customScreenId = null;
      const root = rootElement;
      if (!root)
          return;
      if (root.classList) {
          APP_SCREEN_CLASSES.forEach(cls => root.classList.remove(cls));
      }
      if (typeof root.innerHTML === 'string') {
          root.innerHTML = '';
      }
  }
  function destroyCollectionView() {
      if (collectionView && typeof collectionView.destroy === 'function') {
          try {
              collectionView.destroy();
          }
          catch (err) {
              console.error('[collection] cleanup error', err);
          }
      }
      collectionView = null;
  }
  function destroyLineupView() {
      if (lineupView && typeof lineupView.destroy === 'function') {
          try {
              lineupView.destroy();
          }
          catch (err) {
              console.error('[lineup] cleanup error', err);
          }
      }
      lineupView = null;
  }
  function mergeDefinitionParams(definition, params) {
      var _a;
      const baseValue = cloneScreenParams((_a = definition === null || definition === void 0 ? void 0 : definition.params) !== null && _a !== void 0 ? _a : null);
      const incomingValue = cloneScreenParams(params);
      if (!baseValue && !incomingValue) {
          return null;
      }
      if (!baseValue) {
          return incomingValue;
      }
      if (!incomingValue) {
          return baseValue;
      }
      return { ...baseValue, ...incomingValue };
  }
  function pickFunctionFromSource(source, preferredKeys = [], fallbackKeys = []) {
      if (!source)
          return null;
      if (typeof source === 'function') {
          return source;
      }
      if (source && typeof source === 'object') {
          const record = source;
          for (const key of preferredKeys) {
              const value = record[key];
              if (typeof value === 'function') {
                  return source;
              }
          }
          for (const key of fallbackKeys) {
              const value = record[key];
              if (typeof value === 'function') {
                  return source;
              }
          }
      }
      return null;
  }
  function resolveModuleFunction(module, preferredKeys = [], fallbackKeys = []) {
      const candidate = pickFunctionFromSource(module, preferredKeys, fallbackKeys);
      return typeof candidate === 'function' ? candidate : null;
  }
  function resolveScreenRenderer(module) {
      const candidate = resolveModuleFunction(module, ['renderCollectionScreen', 'renderScreen'], ['render']);
      return typeof candidate === 'function' ? candidate : null;
  }
  function getDefinitionByScreen(screenId) {
      return SCREEN_DEFINITION_LOOKUP.get(screenId) || null;
  }
  async function mountModeScreen(screenId, params) {
      var _a;
      const token = ++customScreenToken;
      destroyCustomScreen(true);
      dismissModal();
      if (!rootElement || !shellInstance)
          return;
      const definition = getDefinitionByScreen(screenId);
      if (!definition) {
          console.warn(`[screen] Không tìm thấy định nghĩa cho màn hình ${screenId}.`);
          shellInstance.enterScreen(SCREEN_MAIN_MENU);
          return;
      }
      const mergedParams = mergeDefinitionParams(definition, params);
      clearAppScreenClasses();
      if (rootElement.classList) {
          rootElement.classList.add(`app--${screenId}`);
      }
      if (typeof rootElement.innerHTML === 'string') {
          const label = definition.label || 'màn hình';
          rootElement.innerHTML = `<div class="app-loading">Đang tải ${label}...</div>`;
      }
      let module;
      try {
          module = await definition.loader();
      }
      catch (error) {
          if (token !== customScreenToken)
              return;
          if (isMissingModuleError(error)) {
              showComingSoonModal(definition.label);
              shellInstance.enterScreen(SCREEN_MAIN_MENU);
              return;
          }
          throw error;
      }
      if (token !== customScreenToken)
          return;
      if (isComingSoonModule(module)) {
          showComingSoonModal(definition.label);
          shellInstance.enterScreen(SCREEN_MAIN_MENU);
          return;
      }
      const renderer = resolveScreenRenderer(module);
      if (typeof renderer !== 'function') {
          throw new Error(`Module màn hình ${screenId} không cung cấp hàm render hợp lệ.`);
      }
      if (typeof rootElement.innerHTML === 'string') {
          rootElement.innerHTML = '';
      }
      const controller = (_a = renderer({
          root: rootElement,
          shell: shellInstance,
          definition,
          params: mergedParams,
          screenId
      })) !== null && _a !== void 0 ? _a : null;
      customScreenController = controller;
      customScreenId = screenId;
  }
  function showComingSoonModal(label) {
      dismissModal();
      if (!rootElement)
          return;
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
      if (closeButton instanceof HTMLElement) {
          closeButton.addEventListener('click', () => {
              dismissModal();
          });
      }
      rootElement.appendChild(modal);
      activeModal = modal;
  }
  function showPveBoardMissingNotice(message) {
      const title = 'Không thể tải chế độ PvE';
      if (renderMessageRef && renderMessageIsExternal) {
          try {
              renderMessageRef({
                  title,
                  body: `<p>${message}</p>`
              });
              return true;
          }
          catch (error) {
              console.warn('Không thể sử dụng renderMessageRef để hiển thị thông báo PvE.', error);
          }
      }
      if (typeof document === 'undefined' || !document.body) {
          return false;
      }
      const modalId = 'pve-board-error-modal';
      const existing = document.getElementById(modalId);
      if (existing && typeof existing.remove === 'function') {
          existing.remove();
      }
      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'app-modal';
      modal.setAttribute('role', 'alertdialog');
      modal.setAttribute('aria-modal', 'true');
      modal.style.position = 'fixed';
      modal.style.inset = '0';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.padding = '16px';
      modal.style.background = 'rgba(8, 12, 18, 0.82)';
      modal.style.zIndex = '2147483647';
      modal.innerHTML = `
      <div class="app-modal__dialog" style="max-width:420px;width:100%;background:#0c1218;border:1px solid #2a3a4a;border-radius:16px;padding:24px;box-shadow:0 12px 32px rgba(0,0,0,0.45);text-align:center;">
        <h3 class="app-modal__title" style="margin-top:0;margin-bottom:12px;color:#ffe066;">${title}</h3>
        <p class="app-modal__body" style="margin:0 0 16px;color:#f1f3f5;line-height:1.6;">${message}</p>
        <div class="app-modal__actions">
          <button type="button" class="app-modal__button" data-action="close" style="min-width:120px;padding:8px 16px;border-radius:999px;background:#1f2c3a;color:#f1f3f5;border:1px solid #334559;cursor:pointer;">Đã hiểu</button>
        </div>
      </div>
    `;
      const closeButton = modal.querySelector('[data-action="close"]');
      if (closeButton instanceof HTMLElement) {
          closeButton.addEventListener('click', () => {
              modal.remove();
          });
      }
      document.body.appendChild(modal);
      return true;
  }
  async function renderCollectionScreen(params) {
      var _a;
      const root = rootElement;
      const shell = shellInstance;
      if (!root || !shell)
          return;
      const token = ++collectionRenderToken;
      dismissModal();
      clearAppScreenClasses();
      destroyCollectionView();
      lineupRenderToken += 1;
      destroyLineupView();
      if (root.classList) {
          root.classList.add('app--collection');
      }
      if (typeof root.innerHTML === 'string') {
          root.innerHTML = '<div class="app-loading">Đang tải bộ sưu tập...</div>';
      }
      let module;
      try {
          module = await loadBundledModule(COLLECTION_SCREEN_MODULE_ID);
      }
      catch (error) {
          if (token !== collectionRenderToken)
              return;
          throw error;
      }
      if (token !== collectionRenderToken)
          return;
      const render = resolveModuleFunction(module, ['renderCollectionScreen', 'renderCollectionView'], ['render']);
      if (typeof render !== 'function') {
          throw new Error('Module bộ sưu tập không cung cấp hàm render hợp lệ.');
      }
      const definition = getDefinitionByScreen(SCREEN_COLLECTION);
      if (!definition) {
          throw new Error('Không tìm thấy định nghĩa màn hình bộ sưu tập.');
      }
      collectionView = ((_a = render({
          root,
          shell,
          definition,
          params: params || null,
          screenId: SCREEN_COLLECTION
      })) !== null && _a !== void 0 ? _a : null);
  }
  async function renderLineupScreen(params) {
      var _a;
      const root = rootElement;
      const shell = shellInstance;
      if (!root || !shell)
          return;
      const token = ++lineupRenderToken;
      dismissModal();
      clearAppScreenClasses();
      destroyLineupView();
      collectionRenderToken += 1;
      destroyCollectionView();
      if (root.classList) {
          root.classList.add('app--lineup');
      }
      if (typeof root.innerHTML === 'string') {
          root.innerHTML = '<div class="app-loading">Đang tải đội hình...</div>';
      }
      let module;
      try {
          module = await loadBundledModule(LINEUP_SCREEN_MODULE_ID);
      }
      catch (error) {
          if (token !== lineupRenderToken)
              return;
          throw error;
      }
      if (token !== lineupRenderToken)
          return;
      const render = resolveModuleFunction(module, ['renderLineupScreen'], ['render']);
      if (typeof render !== 'function') {
          throw new Error('Module đội hình không cung cấp hàm render hợp lệ.');
      }
      const definition = getDefinitionByScreen(SCREEN_LINEUP);
      if (!definition) {
          throw new Error('Không tìm thấy định nghĩa màn hình đội hình.');
      }
      const lineupResult = render({
          root,
          shell,
          definition,
          params: params || null,
          screenId: SCREEN_LINEUP
      });
      lineupView = (_a = lineupResult) !== null && _a !== void 0 ? _a : null;
  }
  function renderMainMenuScreen() {
      if (!rootElement || !shellInstance)
          return;
      dismissModal();
      clearAppScreenClasses();
      if (rootElement.classList) {
          rootElement.classList.add('app--main-menu');
      }
      lineupRenderToken += 1;
      destroyLineupView();
      if (mainMenuView && typeof mainMenuView.destroy === 'function') {
          mainMenuView.destroy();
          mainMenuView = null;
      }
      const sections = MENU_SECTIONS;
      mainMenuView = renderMainMenuView({
          root: rootElement,
          shell: shellInstance,
          sections,
          metadata: CARD_METADATA,
          playerGender: bootstrapOptions.playerGender || 'neutral',
          onShowComingSoon: (mode) => {
              const def = (mode === null || mode === void 0 ? void 0 : mode.key) ? MODE_DEFINITIONS[mode.key] : null;
              const label = (def === null || def === void 0 ? void 0 : def.label) || (mode === null || mode === void 0 ? void 0 : mode.title) || (mode === null || mode === void 0 ? void 0 : mode.label) || '';
              showComingSoonModal(label);
          }
      });
  }
  function renderPveLayout(options) {
      if (!rootElement)
          return null;
      dismissModal();
      clearAppScreenClasses();
      if (rootElement.classList) {
          rootElement.classList.add('app--pve');
      }
      rootElement.innerHTML = '';
      const container = document.createElement('div');
      container.className = 'pve-screen';
      container.setAttribute('data-mode', (options === null || options === void 0 ? void 0 : options.modeKey) || 'pve');
      container.innerHTML = `
      <div class="pve-toolbar">
        <h2 class="pve-toolbar__title">${(options === null || options === void 0 ? void 0 : options.title) || 'PvE'}</h2>
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
      if (exitButton instanceof HTMLElement && typeof (options === null || options === void 0 ? void 0 : options.onExit) === 'function') {
          exitButton.addEventListener('click', options.onExit);
      }
      return container;
  }
  function teardownActiveSession() {
      var _a;
      if (!shellInstance)
          return;
      const current = (_a = shellInstance.getState()) === null || _a === void 0 ? void 0 : _a.activeSession;
      if (current && typeof current.stop === 'function') {
          try {
              current.stop();
          }
          catch (err) {
              console.warn('[pve] stop session failed', err);
          }
      }
      shellInstance.setActiveSession(null);
  }
  async function mountPveScreen(params) {
      var _a, _b;
      const token = ++pveRenderToken;
      const extractStartConfig = (source) => {
          if (!source || typeof source !== 'object')
              return null;
          const record = source;
          const payload = record.sessionConfig && typeof record.sessionConfig === 'object'
              ? record.sessionConfig
              : record;
          return { ...payload };
      };
      teardownActiveSession();
      if (!shellInstance)
          return;
      const shell = shellInstance;
      const candidateModeKey = params && typeof params === 'object' && !Array.isArray(params)
          ? params.modeKey
          : undefined;
      const modeKey = typeof candidateModeKey === 'string' && MODE_DEFINITIONS[candidateModeKey]
          ? candidateModeKey
          : 'campaign';
      const fallbackDefinition = MODE_DEFINITIONS.campaign;
      if (!fallbackDefinition) {
          throw new Error('Thiếu định nghĩa chế độ campaign.');
      }
      const definition = (_a = MODE_DEFINITIONS[modeKey]) !== null && _a !== void 0 ? _a : fallbackDefinition;
      const rawParams = params && typeof params === 'object' && !Array.isArray(params)
          ? { ...params }
          : {};
      const defaultParams = (definition === null || definition === void 0 ? void 0 : definition.params) && typeof definition.params === 'object' && !Array.isArray(definition.params)
          ? { ...definition.params }
          : {};
      const mergedParams = { ...defaultParams, ...rawParams };
      const definitionConfig = extractStartConfig((_b = definition === null || definition === void 0 ? void 0 : definition.params) !== null && _b !== void 0 ? _b : null);
      const incomingConfig = extractStartConfig(params);
      const mergedStartConfig = {
          ...(definitionConfig || {}),
          ...(incomingConfig || {})
      };
      const mergedParamsWithConfig = mergedParams;
      const hasSessionConfig = Object.prototype.hasOwnProperty.call(mergedParamsWithConfig, 'sessionConfig');
      const sessionConfigValue = hasSessionConfig && mergedParamsWithConfig.sessionConfig && typeof mergedParamsWithConfig.sessionConfig === 'object'
          ? { ...mergedParamsWithConfig.sessionConfig }
          : mergedParamsWithConfig.sessionConfig;
      const hasSessionConfigObject = hasSessionConfig && sessionConfigValue && typeof sessionConfigValue === 'object';
      const { sessionConfig: _ignoredSessionConfig, ...restMergedParams } = mergedParamsWithConfig;
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
      if (rootElement) {
          clearAppScreenClasses();
          if (rootElement.classList) {
              rootElement.classList.add('app--pve');
          }
          rootElement.innerHTML = `<div class="app-loading">Đang tải ${definition.label}...</div>`;
      }
      let module;
      try {
          module = await definition.loader();
      }
      catch (error) {
          if (token !== pveRenderToken)
              return;
          if (isMissingModuleError(error)) {
              showComingSoonModal(definition.label);
              shell.enterScreen(SCREEN_MAIN_MENU);
              return;
          }
          throw error;
      }
      if (token !== pveRenderToken)
          return;
      if (isComingSoonModule(module)) {
          showComingSoonModal(definition.label);
          shell.enterScreen(SCREEN_MAIN_MENU);
          return;
      }
      const createPveSession = resolveModuleFunction(module, ['createPveSession']);
      if (typeof createPveSession !== 'function') {
          throw new Error('PvE module missing createPveSession().');
      }
      const container = renderPveLayout({
          title: definition.label,
          modeKey: definition.key,
          onExit: () => {
              const state = shell.getState();
              const session = state === null || state === void 0 ? void 0 : state.activeSession;
              if (isStoppableSession(session)) {
                  try {
                      session.stop();
                  }
                  catch (err) {
                      console.warn('[pve] stop session failed', err);
                  }
              }
              shell.setActiveSession(null);
              shell.enterScreen(SCREEN_MAIN_MENU);
          }
      });
      if (!container) {
          throw new Error('Không thể dựng giao diện PvE.');
      }
      const session = createPveSession(container, createSessionOptions);
      shell.setActiveSession(session);
      if (isStartableSession(session)) {
          const scheduleRetry = (callback) => {
              if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
                  window.requestAnimationFrame(callback);
              }
              else {
                  setTimeout(callback, 0);
              }
          };
          const MAX_BOARD_RETRIES = 30;
          const startSessionSafely = () => {
              if (token !== pveRenderToken)
                  return;
              const startConfig = { ...startSessionOptions, root: container };
              try {
                  const result = session.start(startConfig);
                  if (!result) {
                      handleMissingBoard();
                  }
              }
              catch (err) {
                  shell.setActiveSession(null);
                  throw err;
              }
          };
          const handleMissingBoard = () => {
              const message = 'Không thể tải bàn chơi PvE. Đang quay lại menu chính.';
              const displayed = showPveBoardMissingNotice(message);
              if (!displayed) {
                  console.warn(message);
              }
              shell.setActiveSession(null);
              shell.enterScreen(SCREEN_MAIN_MENU);
          };
          const attemptStart = (attempt = 0) => {
              if (token !== pveRenderToken)
                  return;
              const boardElement = container.querySelector('#board');
              if (boardElement) {
                  startSessionSafely();
                  return;
              }
              if (attempt >= MAX_BOARD_RETRIES) {
                  handleMissingBoard();
                  return;
              }
              scheduleRetry(() => attemptStart(attempt + 1));
          };
          const initialBoard = container.querySelector('#board');
          if (initialBoard) {
              startSessionSafely();
          }
          else {
              attemptStart();
          }
      }
  }
  (function bootstrap() {
      var _a;
      const renderMessage = ensureRenderer();
      const protocol = (_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.protocol;
      const isFileProtocol = protocol === 'file:';
      try {
          if (isFileProtocol) {
              console.warn('Đang chạy Arclune trực tiếp từ file://. Một số trình duyệt có thể chặn tài nguyên liên quan.');
          }
          rootElement = document.getElementById('appRoot');
          if (!rootElement) {
              throw new Error('Không tìm thấy phần tử #appRoot.');
          }
          renderMessageRef = renderMessage;
          renderMessageIsExternal = typeof window !== 'undefined' && typeof window.arcluneRenderMessage === 'function';
          const handleShellError = (error) => {
              console.error('Arclune shell listener error', error);
              const renderer = renderMessageRef || renderMessage;
              if (renderer) {
                  showFatalError(error, renderer, bootstrapOptions);
              }
          };
          shellInstance = createAppShell({ onError: handleShellError });
          bootstrapOptions.isFileProtocol = isFileProtocol;
          let lastScreen = null;
          let lastParams = null;
          shellInstance.onChange((state) => {
              const nextScreen = state.screen;
              const nextParams = state.screenParams;
              const screenChanged = nextScreen !== lastScreen;
              const paramsChanged = !areScreenParamsEqual(nextParams, lastParams);
              if (!screenChanged && !paramsChanged) {
                  return;
              }
              if (nextScreen === SCREEN_MAIN_MENU) {
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
              if (nextScreen === SCREEN_COLLECTION) {
                  customScreenToken += 1;
                  destroyCustomScreen();
                  collectionRenderToken += 1;
                  destroyCollectionView();
                  lineupRenderToken += 1;
                  destroyLineupView();
                  if (mainMenuView && typeof mainMenuView.destroy === 'function') {
                      mainMenuView.destroy();
                      mainMenuView = null;
                  }
                  lastScreen = SCREEN_COLLECTION;
                  lastParams = nextParams;
                  pveRenderToken += 1;
                  renderCollectionScreen(nextParams || null).catch((error) => {
                      console.error('Arclune failed to load collection screen', error);
                      if (renderMessageRef) {
                          showFatalError(error, renderMessageRef, bootstrapOptions);
                      }
                  });
                  return;
              }
              if (nextScreen === SCREEN_LINEUP) {
                  customScreenToken += 1;
                  destroyCustomScreen();
                  collectionRenderToken += 1;
                  destroyCollectionView();
                  lineupRenderToken += 1;
                  destroyLineupView();
                  if (mainMenuView && typeof mainMenuView.destroy === 'function') {
                      mainMenuView.destroy();
                      mainMenuView = null;
                  }
                  lastScreen = SCREEN_LINEUP;
                  lastParams = nextParams;
                  pveRenderToken += 1;
                  renderLineupScreen(nextParams || null).catch((error) => {
                      console.error('Arclune failed to load lineup screen', error);
                      if (renderMessageRef) {
                          showFatalError(error, renderMessageRef, bootstrapOptions);
                      }
                  });
                  return;
              }
              if (nextScreen === SCREEN_PVE) {
                  customScreenToken += 1;
                  destroyCustomScreen();
                  collectionRenderToken += 1;
                  destroyCollectionView();
                  lineupRenderToken += 1;
                  destroyLineupView();
                  if (mainMenuView && typeof mainMenuView.destroy === 'function') {
                      mainMenuView.destroy();
                      mainMenuView = null;
                  }
                  lastScreen = SCREEN_PVE;
                  lastParams = nextParams;
                  mountPveScreen(nextParams || {}).catch((error) => {
                      console.error('Arclune failed to start PvE session', error);
                      if (renderMessageRef) {
                          showFatalError(error, renderMessageRef, bootstrapOptions);
                      }
                  });
                  return;
              }
              if (mainMenuView && typeof mainMenuView.destroy === 'function') {
                  mainMenuView.destroy();
                  mainMenuView = null;
              }
              collectionRenderToken += 1;
              destroyCollectionView();
              lineupRenderToken += 1;
              destroyLineupView();
              lastScreen = nextScreen;
              lastParams = nextParams;
              mountModeScreen(nextScreen, nextParams || null).catch((error) => {
                  console.error(`Arclune failed to load screen ${nextScreen}`, error);
                  if (renderMessageRef) {
                      showFatalError(error, renderMessageRef, bootstrapOptions);
                  }
              });
          });
          dispatchLoaded();
      }
      catch (error) {
          console.error('Arclune failed to start', error);
          if (typeof window.arcluneShowFatal === 'function') {
              window.arcluneShowFatal(error);
          }
          else {
              showFatalError(error, renderMessage, { isFileProtocol });
          }
      }
  })();

});
__define('./events.ts', (exports, module, __require) => {
  const TURN_START = 'turn:start';
  const TURN_END = 'turn:end';
  const ACTION_START = 'action:start';
  const ACTION_END = 'action:end';
  const TURN_REGEN = 'turn:regen';
  const BATTLE_END = 'battle:end';
  const isGameEventRecord = (payload) => {
      if (!payload || typeof payload !== 'object')
          return false;
      const record = payload;
      return typeof record.detail !== 'undefined' && typeof record.type === 'string';
  };
  const isCompatibleHandler = (handler) => typeof handler === 'function';
  const HAS_EVENT_TARGET = typeof EventTarget === 'function';
  function createNativeEvent(type, detail) {
      if (!type)
          return null;
      if (typeof CustomEvent === 'function') {
          try {
              return new CustomEvent(type, { detail });
          }
          catch (_err) {
              // ignore and fall through
          }
      }
      if (typeof Event === 'function') {
          try {
              const ev = new Event(type);
              try {
                  ev.detail = detail;
              }
              catch (_assignErr) {
                  // ignore assignment failures (readonly in some browsers)
              }
              return ev;
          }
          catch (_err) {
              // ignore and fall through
          }
      }
      if (typeof document === 'object' && document && typeof document.createEvent === 'function') {
          try {
              const ev = document.createEvent('Event');
              if (typeof ev.initEvent === 'function') {
                  ev.initEvent(type, false, false);
              }
              ev.detail = detail;
              return ev;
          }
          catch (_err) {
              // ignore and fall through
          }
      }
      return null;
  }
  class SimpleEventTarget {
      constructor() {
          this.listeners = new Map();
      }
      addEventListener(type, handler) {
          var _a;
          if (!type || typeof handler !== 'function')
              return;
          const set = (_a = this.listeners.get(type)) !== null && _a !== void 0 ? _a : new Set();
          set.add(handler);
          this.listeners.set(type, set);
      }
      removeEventListener(type, handler) {
          if (!type || typeof handler !== 'function')
              return;
          const set = this.listeners.get(type);
          if (!set || set.size === 0)
              return;
          set.delete(handler);
          if (set.size === 0) {
              this.listeners.delete(type);
          }
      }
      dispatchEvent(event) {
          if (!event || !event.type)
              return false;
          const type = event.type;
          if (!type)
              return false;
          const set = this.listeners.get(type);
          if (!set || set.size === 0)
              return true;
          const snapshot = Array.from(set);
          const eventRecord = event;
          try {
              if (typeof eventRecord.target === 'undefined') {
                  eventRecord.target = this;
              }
              eventRecord.currentTarget = this;
          }
          catch (_err) {
              // ignore assignment failures
          }
          for (const handler of snapshot) {
              try {
                  handler.call(this, event);
              }
              catch (err) {
                  console.error('[events]', err);
              }
          }
          return true;
      }
  }
  function isEventEmitterLike(value) {
      if (!value || typeof value !== 'object') {
          return false;
      }
      const candidate = value;
      return (typeof candidate.on === 'function' &&
          typeof candidate.emit === 'function');
  }
  function makeEventTarget() {
      if (!HAS_EVENT_TARGET)
          return new SimpleEventTarget();
      const probeType = '__probe__';
      const probeEvent = createNativeEvent(probeType);
      const hasEventConstructor = typeof Event === 'function';
      const isRealEvent = !!probeEvent && (!hasEventConstructor || probeEvent instanceof Event);
      if (!isRealEvent)
          return new SimpleEventTarget();
      try {
          const target = new EventTarget();
          let handled = false;
          const handler = () => {
              handled = true;
          };
          if (typeof target.addEventListener === 'function') {
              target.addEventListener(probeType, handler);
              try {
                  if (typeof target.dispatchEvent === 'function' && isRealEvent) {
                      target.dispatchEvent(probeEvent);
                  }
              }
              finally {
                  if (typeof target.removeEventListener === 'function') {
                      target.removeEventListener(probeType, handler);
                  }
              }
          }
          if (handled)
              return target;
      }
      catch (err) {
          console.warn('[events] Falling back to SimpleEventTarget:', err);
      }
      return new SimpleEventTarget();
  }
  const gameEvents = makeEventTarget();
  function emitGameEvent(type, detail) {
      if (!type || !gameEvents)
          return false;
      try {
          if (HAS_EVENT_TARGET && gameEvents instanceof EventTarget) {
              const nativeEvent = createNativeEvent(type, detail);
              if (nativeEvent) {
                  return gameEvents.dispatchEvent(nativeEvent);
              }
          }
          if (gameEvents instanceof SimpleEventTarget) {
              const syntheticEvent = {
                  type,
                  detail: detail,
              };
              return gameEvents.dispatchEvent(syntheticEvent);
          }
          if (isEventEmitterLike(gameEvents)) {
              gameEvents.emit(type, detail);
              return true;
          }
      }
      catch (err) {
          console.error('[events]', err);
      }
      return false;
  }
  const dispatchGameEvent = (type, detail) => emitGameEvent(type, detail);
  function addGameEventListener(type, handler) {
      if (!type || !isCompatibleHandler(handler) || !gameEvents) {
          return () => { };
      }
      const normalizedHandler = function (event) {
          handler.call(this, event);
      };
      if (HAS_EVENT_TARGET && gameEvents instanceof EventTarget) {
          const eventListener = normalizedHandler;
          gameEvents.addEventListener(type, eventListener);
          let disposed = false;
          return () => {
              if (disposed)
                  return;
              disposed = true;
              if (HAS_EVENT_TARGET && gameEvents instanceof EventTarget) {
                  gameEvents.removeEventListener(type, eventListener);
              }
          };
      }
      if (gameEvents instanceof SimpleEventTarget) {
          gameEvents.addEventListener(type, normalizedHandler);
          let disposed = false;
          return () => {
              if (disposed)
                  return;
              disposed = true;
              gameEvents.removeEventListener(type, normalizedHandler);
          };
      }
      if (isEventEmitterLike(gameEvents)) {
          const emitterHandler = function (payload) {
              const eventRecord = isGameEventRecord(payload)
                  ? payload
                  : {
                      type,
                      detail: payload,
                  };
              const record = eventRecord;
              try {
                  if (typeof record.target === 'undefined') {
                      record.target = gameEvents;
                  }
                  record.currentTarget = gameEvents;
              }
              catch (_err) {
                  // ignore assignment failures
              }
              handler.call(this, eventRecord);
          };
          gameEvents.on(type, emitterHandler);
          let disposed = false;
          return () => {
              if (disposed)
                  return;
              disposed = true;
              if (typeof gameEvents.off === 'function') {
                  gameEvents.off(type, emitterHandler);
              }
          };
      }
      return () => { };
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'TURN_START')) exports.TURN_START = TURN_START;
  if (!Object.prototype.hasOwnProperty.call(exports, 'TURN_END')) exports.TURN_END = TURN_END;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ACTION_START')) exports.ACTION_START = ACTION_START;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ACTION_END')) exports.ACTION_END = ACTION_END;
  if (!Object.prototype.hasOwnProperty.call(exports, 'TURN_REGEN')) exports.TURN_REGEN = TURN_REGEN;
  if (!Object.prototype.hasOwnProperty.call(exports, 'BATTLE_END')) exports.BATTLE_END = BATTLE_END;
  if (!Object.prototype.hasOwnProperty.call(exports, 'gameEvents')) exports.gameEvents = gameEvents;
  if (!Object.prototype.hasOwnProperty.call(exports, 'dispatchGameEvent')) exports.dispatchGameEvent = dispatchGameEvent;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isEventEmitterLike')) exports.isEventEmitterLike = isEventEmitterLike;
  if (!Object.prototype.hasOwnProperty.call(exports, 'emitGameEvent')) exports.emitGameEvent = emitGameEvent;
  if (!Object.prototype.hasOwnProperty.call(exports, 'addGameEventListener')) exports.addGameEventListener = addGameEventListener;
});
__define('./main.ts', (exports, module, __require) => {
  const __dep1 = __require('./events.ts');
  const addGameEventListener = __dep1.addGameEventListener;
  const __dep2 = __require('./modes/pve/session.ts');
  const createPveSession = __dep2.createPveSession;
  const __dep3 = __require('./utils/dummy.ts');
  const ensureNestedModuleSupport = __dep3.ensureNestedModuleSupport;
  const __reexport0 = __require('./events.ts');
  let currentSession = null;
  const isPlainRecord = (value) => (!!value && typeof value === 'object');
  const toRootSource = (value) => {
      if (value == null)
          return value;
      if (typeof Element !== 'undefined' && value instanceof Element)
          return value;
      if (typeof Document !== 'undefined' && value instanceof Document)
          return value;
      if (typeof value.nodeType === 'number') {
          return value;
      }
      return undefined;
  };
  const toSessionConfigOverrides = (value) => {
      if (!isPlainRecord(value)) {
          return {};
      }
      return { ...value };
  };
  function resolveRoot(config) {
      if (!config)
          return typeof document !== 'undefined' ? document : null;
      if (config.root)
          return config.root;
      if (config.rootEl)
          return config.rootEl;
      if (config.element)
          return config.element;
      return typeof document !== 'undefined' ? document : null;
  }
  function startGame(options) {
      ensureNestedModuleSupport();
      const rawOptions = isPlainRecord(options) ? options : {};
      const { root, rootEl, element, ...rest } = rawOptions;
      const rootTarget = resolveRoot({
          root: toRootSource(root),
          rootEl: toRootSource(rootEl),
          element: toRootSource(element),
      });
      const initialConfig = toSessionConfigOverrides(rest);
      if (!currentSession) {
          currentSession = createPveSession(rootTarget, initialConfig);
      }
      const startConfig = { ...initialConfig, root: rootTarget };
      const session = currentSession.start(startConfig);
      if (!session) {
          throw new Error('PvE board markup not found; render the layout before calling startGame');
      }
      return session;
  }
  function stopGame() {
      if (!currentSession)
          return;
      currentSession.stop();
      currentSession = null;
  }
  function updateGameConfig(config = {}) {
      if (!currentSession)
          return;
      currentSession.updateConfig(config !== null && config !== void 0 ? config : {});
  }
  function getCurrentSession() {
      return currentSession;
  }
  function setUnitSkin(unitId, skinKey) {
      if (!currentSession)
          return false;
      return currentSession.setUnitSkin(unitId, skinKey);
  }
  function onGameEvent(type, handler) {
      var _a;
      const subscribe = (_a = currentSession === null || currentSession === void 0 ? void 0 : currentSession.onEvent) !== null && _a !== void 0 ? _a : addGameEventListener;
      return subscribe(type, handler);
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'gameEvents')) exports.gameEvents = __reexport0.gameEvents;
  if (!Object.prototype.hasOwnProperty.call(exports, 'emitGameEvent')) exports.emitGameEvent = __reexport0.emitGameEvent;
  if (!Object.prototype.hasOwnProperty.call(exports, 'dispatchGameEvent')) exports.dispatchGameEvent = __reexport0.dispatchGameEvent;
  if (!Object.prototype.hasOwnProperty.call(exports, 'addGameEventListener')) exports.addGameEventListener = __reexport0.addGameEventListener;
  if (!Object.prototype.hasOwnProperty.call(exports, 'TURN_START')) exports.TURN_START = __reexport0.TURN_START;
  if (!Object.prototype.hasOwnProperty.call(exports, 'TURN_END')) exports.TURN_END = __reexport0.TURN_END;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ACTION_START')) exports.ACTION_START = __reexport0.ACTION_START;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ACTION_END')) exports.ACTION_END = __reexport0.ACTION_END;
  if (!Object.prototype.hasOwnProperty.call(exports, 'TURN_REGEN')) exports.TURN_REGEN = __reexport0.TURN_REGEN;
  if (!Object.prototype.hasOwnProperty.call(exports, 'BATTLE_END')) exports.BATTLE_END = __reexport0.BATTLE_END;
  if (!Object.prototype.hasOwnProperty.call(exports, 'startGame')) exports.startGame = startGame;
  if (!Object.prototype.hasOwnProperty.call(exports, 'stopGame')) exports.stopGame = stopGame;
  if (!Object.prototype.hasOwnProperty.call(exports, 'updateGameConfig')) exports.updateGameConfig = updateGameConfig;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getCurrentSession')) exports.getCurrentSession = getCurrentSession;
  if (!Object.prototype.hasOwnProperty.call(exports, 'setUnitSkin')) exports.setUnitSkin = setUnitSkin;
  if (!Object.prototype.hasOwnProperty.call(exports, 'onGameEvent')) exports.onGameEvent = onGameEvent;
});
__define('./meta.ts', (exports, module, __require) => {
  //v0.8
  // meta.ts — gom lookup + stat khởi tạo + nộ khởi điểm
  const __dep0 = __require('./catalog.ts');
  const CLASS_BASE = __dep0.CLASS_BASE;
  const RANK_MULT = __dep0.RANK_MULT;
  const applyRankAndMods = __dep0.applyRankAndMods;
  const getMetaById = __dep0.getMetaById;
  const getUnitKitById = __dep0.getUnitKitById;
  const __dep1 = __require('./utils/kit.ts');
  const extractOnSpawnRage = __dep1.extractOnSpawnRage;
  const kitSupportsSummon = __dep1.kitSupportsSummon;
  // Dùng trực tiếp catalog cho tra cứu
  const Meta = {
      get: getMetaById,
      classOf(id) {
          var _a;
          const entry = getMetaById(id);
          return (_a = entry === null || entry === void 0 ? void 0 : entry.class) !== null && _a !== void 0 ? _a : null;
      },
      rankOf(id) {
          var _a;
          const entry = getMetaById(id);
          return (_a = entry === null || entry === void 0 ? void 0 : entry.rank) !== null && _a !== void 0 ? _a : null;
      },
      kit(id) {
          return getUnitKitById(id);
      },
      isSummoner(id) {
          const entry = getMetaById(id);
          return !!(entry && entry.class === 'Summoner' && kitSupportsSummon(entry));
      },
  };
  const adaptMetaEntry = (entry) => {
      var _a;
      if (!entry)
          return null;
      const resolvedKit = (_a = entry.kit) !== null && _a !== void 0 ? _a : getUnitKitById(entry.id);
      if (!resolvedKit)
          return null;
      const roster = { ...entry, kit: resolvedKit };
      return roster;
  };
  const metaServiceAdapter = {
      get(id) {
          if (!id)
              return null;
          return adaptMetaEntry(Meta.get(id));
      },
      classOf(id) {
          if (!id)
              return null;
          const value = Meta.classOf(id);
          return typeof value === 'string' ? value : null;
      },
      rankOf(id) {
          if (!id)
              return null;
          const value = Meta.rankOf(id);
          return typeof value === 'string' ? value : null;
      },
      kit(id) {
          if (!id)
              return null;
          return Meta.kit(id);
      },
      isSummoner(id) {
          if (!id)
              return false;
          return Meta.isSummoner(id);
      },
  };
  // Tạo chỉ số instance theo class+rank+mods (SPD không nhân theo rank)
  const EMPTY_INSTANCE_STATS = {
      hpMax: 0,
      hp: 0,
      atk: 0,
      wil: 0,
      arm: 0,
      res: 0,
      agi: 0,
      per: 0,
      spd: 1,
      aeMax: 0,
      ae: 0,
      aeRegen: 0,
      hpRegen: 0,
  };
  const isRankName = (value) => (typeof value === 'string' && value in RANK_MULT);
  const isClassName = (value) => (typeof value === 'string' && value in CLASS_BASE);
  const coerceStatMods = (mods) => {
      if (!mods || typeof mods !== 'object')
          return undefined;
      const out = {};
      for (const [key, raw] of Object.entries(mods)) {
          if (typeof raw !== 'number' || !Number.isFinite(raw))
              continue;
          out[key] = raw;
      }
      return out;
  };
  function makeInstanceStats(unitId) {
      var _a, _b, _c, _d, _e, _f, _g;
      const entry = Meta.get(unitId);
      if (!entry)
          return { ...EMPTY_INSTANCE_STATS };
      const className = entry.class;
      if (!isClassName(className))
          return { ...EMPTY_INSTANCE_STATS };
      const rank = entry.rank;
      if (!isRankName(rank))
          return { ...EMPTY_INSTANCE_STATS };
      const base = CLASS_BASE[className];
      if (!base)
          return { ...EMPTY_INSTANCE_STATS };
      const fin = applyRankAndMods(base, rank, coerceStatMods(entry.mods));
      return {
          hpMax: Math.trunc((_a = fin.HP) !== null && _a !== void 0 ? _a : 0),
          hp: Math.trunc((_b = fin.HP) !== null && _b !== void 0 ? _b : 0),
          atk: Math.trunc((_c = fin.ATK) !== null && _c !== void 0 ? _c : 0),
          wil: Math.trunc((_d = fin.WIL) !== null && _d !== void 0 ? _d : 0),
          arm: fin.ARM || 0,
          res: fin.RES || 0,
          agi: Math.trunc((_e = fin.AGI) !== null && _e !== void 0 ? _e : 0),
          per: Math.trunc((_f = fin.PER) !== null && _f !== void 0 ? _f : 0),
          spd: fin.SPD || 1,
          aeMax: Math.trunc((_g = fin.AEmax) !== null && _g !== void 0 ? _g : 0),
          ae: 0,
          aeRegen: fin.AEregen || 0,
          hpRegen: fin.HPregen || 0,
      };
  }
  // Nộ khi vào sân (trừ leader). Revive: theo spec của skill.
  function initialRageFor(unitId, opts = {}) {
      var _a, _b, _c;
      const onSpawn = (_a = Meta.kit(unitId)) === null || _a === void 0 ? void 0 : _a.onSpawn;
      if (!onSpawn)
          return 0;
      if (onSpawn.exceptLeader && opts.isLeader) {
          const leaderSpecific = extractOnSpawnRage(onSpawn, { ...opts, isLeader: true });
          return Math.max(0, leaderSpecific !== null && leaderSpecific !== void 0 ? leaderSpecific : 0);
      }
      const amount = extractOnSpawnRage(onSpawn, opts);
      if (amount != null)
          return Math.max(0, amount);
      if (opts.revive)
          return Math.max(0, (_c = (_b = opts.reviveSpec) === null || _b === void 0 ? void 0 : _b.rage) !== null && _c !== void 0 ? _c : 0);
      return 0;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'Meta')) exports.Meta = Meta;
  if (!Object.prototype.hasOwnProperty.call(exports, 'metaServiceAdapter')) exports.metaServiceAdapter = metaServiceAdapter;
  if (!Object.prototype.hasOwnProperty.call(exports, 'makeInstanceStats')) exports.makeInstanceStats = makeInstanceStats;
  if (!Object.prototype.hasOwnProperty.call(exports, 'initialRageFor')) exports.initialRageFor = initialRageFor;
});
__define('./modes/coming-soon.stub.ts', (exports, module, __require) => {
  const comingSoon = true;
  const COMING_SOON_MODULE = {
      comingSoon,
  };

  if (!Object.prototype.hasOwnProperty.call(exports, 'comingSoon')) exports.comingSoon = comingSoon;
  if (!Object.prototype.hasOwnProperty.call(exports, 'COMING_SOON_MODULE')) exports.COMING_SOON_MODULE = COMING_SOON_MODULE;
});
__define('./modes/pve/session-runtime-impl.ts', (exports, module, __require) => {
  var _a, _b;
  //v0.7.7
  const __dep2 = __require('./turns.ts');
  const stepTurn = __dep2.stepTurn;
  const doActionOrSkip = __dep2.doActionOrSkip;
  const predictSpawnCycle = __dep2.predictSpawnCycle;
  const __dep3 = __require('./summon.ts');
  const enqueueImmediate = __dep3.enqueueImmediate;
  const processActionChain = __dep3.processActionChain;
  const __dep4 = __require('./ai.ts');
  const refillDeckEnemy = __dep4.refillDeckEnemy;
  const aiMaybeAct = __dep4.aiMaybeAct;
  const __dep5 = __require('./statuses.ts');
  const Statuses = __dep5.Statuses;
  const __dep6 = __require('./config.ts');
  const CFG = __dep6.CFG;
  const CAM = __dep6.CAM;
  const __dep7 = __require('./combat.ts');
  const pickTarget = __dep7.pickTarget;
  const dealAbilityDamage = __dep7.dealAbilityDamage;
  const healUnit = __dep7.healUnit;
  const grantShield = __dep7.grantShield;
  const applyDamage = __dep7.applyDamage;
  const __dep8 = __require('./utils/fury.ts');
  const initializeFury = __dep8.initializeFury;
  const setFury = __dep8.setFury;
  const spendFury = __dep8.spendFury;
  const resolveUltCost = __dep8.resolveUltCost;
  const gainFury = __dep8.gainFury;
  const finishFuryHit = __dep8.finishFuryHit;
  const __dep9 = __require('./engine.ts');
  const makeGrid = __dep9.makeGrid;
  const drawGridOblique = __dep9.drawGridOblique;
  const drawTokensOblique = __dep9.drawTokensOblique;
  const drawQueuedOblique = __dep9.drawQueuedOblique;
  const hitToCellOblique = __dep9.hitToCellOblique;
  const spawnLeaders = __dep9.spawnLeaders;
  const pickRandom = __dep9.pickRandom;
  const slotIndex = __dep9.slotIndex;
  const slotToCell = __dep9.slotToCell;
  const cellReserved = __dep9.cellReserved;
  const ART_SPRITE_EVENT = __dep9.ART_SPRITE_EVENT;
  const __dep10 = __require('./background.ts');
  const drawEnvironmentProps = __dep10.drawEnvironmentProps;
  const __dep11 = __require('./art.ts');
  const getUnitArt = __dep11.getUnitArt;
  const setUnitSkin = __dep11.setUnitSkin;
  const __dep12 = __require('./ui.ts');
  const initHUD = __dep12.initHUD;
  const startSummonBar = __dep12.startSummonBar;
  const __dep13 = __require('./vfx.ts');
  const vfxDraw = __dep13.vfxDraw;
  const vfxAddSpawn = __dep13.vfxAddSpawn;
  const vfxAddHit = __dep13.vfxAddHit;
  const vfxAddMelee = __dep13.vfxAddMelee;
  const vfxAddLightningArc = __dep13.vfxAddLightningArc;
  const vfxAddBloodPulse = __dep13.vfxAddBloodPulse;
  const vfxAddGroundBurst = __dep13.vfxAddGroundBurst;
  const vfxAddShieldWrap = __dep13.vfxAddShieldWrap;
  const baseAsSessionWithVfx = __dep13.asSessionWithVfx;
  const __dep14 = __require('./scene.ts');
  const drawBattlefieldScene = __dep14.drawBattlefieldScene;
  const __dep15 = __require('./events.ts');
  const TURN_START = __dep15.TURN_START;
  const TURN_END = __dep15.TURN_END;
  const ACTION_START = __dep15.ACTION_START;
  const ACTION_END = __dep15.ACTION_END;
  const BATTLE_END = __dep15.BATTLE_END;
  const emitGameEvent = __dep15.emitGameEvent;
  const addGameEventListener = __dep15.addGameEventListener;
  const __dep16 = __require('./utils/dummy.ts');
  const ensureNestedModuleSupport = __dep16.ensureNestedModuleSupport;
  const __dep17 = __require('./utils/time.ts');
  const safeNow = __dep17.safeNow;
  const __dep18 = __require('./utils/kit.ts');
  const getSummonSpec = __dep18.getSummonSpec;
  const resolveSummonSlots = __dep18.resolveSummonSlots;
  const __dep19 = __require('./modes/pve/session-state.ts');
  const normalizeConfig = __dep19.normalizeConfig;
  const createSession = __dep19.createSession;
  const invalidateSceneCache = __dep19.invalidateSceneCache;
  const ensureSceneCache = __dep19.ensureSceneCache;
  const clearBackgroundSignatureCache = __dep19.clearBackgroundSignatureCache;
  const normalizeDeckEntries = __dep19.normalizeDeckEntries;
  const isPlainRecord = (value) => (!!value && typeof value === 'object');
  const isFiniteNumber = (value) => (typeof value === 'number' && Number.isFinite(value));
  const parseFiniteNumber = (value) => {
      if (isFiniteNumber(value))
          return value;
      if (typeof value === 'string' && value.trim() !== '') {
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
  };
  const toFiniteOrZero = (value) => { var _a; return (_a = parseFiniteNumber(value)) !== null && _a !== void 0 ? _a : 0; };
  const toStartConfigOverrides = (value) => {
      if (!isPlainRecord(value))
          return {};
      return { ...value };
  };
  const toRootLike = (value) => {
      if (value == null)
          return value;
      if (typeof Element !== 'undefined' && value instanceof Element)
          return value;
      if (typeof Document !== 'undefined' && value instanceof Document)
          return value;
      if (typeof value.nodeType === 'number') {
          return value;
      }
      return null;
  };
  const isInitializedGame = (game = Game) => Boolean(game && game._inited);
  const getInitializedGame = () => (isInitializedGame() ? Game : null);
  const coerceSkillRuntime = (value) => {
      if (!isPlainRecord(value))
          return null;
      const record = value;
      const normalized = { ...record };
      const numericKeys = [
          'hits',
          'hitCount',
          'count',
          'targets',
          'targetCount',
          'duration',
          'durationTurns',
          'turns',
          'busyMs',
          'durationMs',
      ];
      for (const key of numericKeys) {
          const parsed = parseFiniteNumber(record[key]);
          if (parsed != null)
              normalized[key] = parsed;
      }
      return normalized;
  };
  const coerceSummonCreep = (value) => {
      var _a;
      if (!isPlainRecord(value))
          return null;
      const record = value;
      const creep = { ...record };
      const ttlTurns = parseFiniteNumber((_a = record.ttlTurns) !== null && _a !== void 0 ? _a : record.ttl);
      if (ttlTurns != null)
          creep.ttlTurns = ttlTurns;
      return creep;
  };
  const coerceSummonSpec = (value) => {
      var _a;
      if (!value || typeof value !== 'object')
          return null;
      const spec = { ...value };
      if (Array.isArray(spec.slots)) {
          spec.slots = spec.slots
              .map((slot) => parseFiniteNumber(slot))
              .filter((slot) => slot != null);
      }
      const count = parseFiniteNumber(spec.count);
      const summonCount = parseFiniteNumber(spec.summonCount);
      const resolvedCount = count !== null && count !== void 0 ? count : summonCount;
      if (resolvedCount != null) {
          spec.count = resolvedCount;
          spec.summonCount = resolvedCount;
      }
      const ttl = parseFiniteNumber(spec.ttl);
      const ttlTurns = parseFiniteNumber((_a = spec.ttlTurns) !== null && _a !== void 0 ? _a : ttl);
      if (ttlTurns != null) {
          spec.ttlTurns = ttlTurns;
          if (ttl == null)
              spec.ttl = ttlTurns;
      }
      else if (ttl != null) {
          spec.ttl = ttl;
      }
      const limit = parseFiniteNumber(spec.limit);
      if (limit != null)
          spec.limit = limit;
      spec.inherit = isPlainRecord(spec.inherit) ? spec.inherit : null;
      spec.creep = coerceSummonCreep(spec.creep);
      return spec;
  };
  const isDamageSpec = (value) => isPlainRecord(value);
  const coerceDamageSpec = (value) => {
      if (!isDamageSpec(value))
          return null;
      const record = value;
      const damage = { ...record };
      const numericKeys = [
          'scaleWIL',
          'scaleWil',
          'flat',
          'flatAdd',
          'percentTargetMaxHP',
          'basePercentMaxHPTarget',
          'bossPercent',
          'defPen',
          'pen',
      ];
      for (const key of numericKeys) {
          const parsed = parseFiniteNumber(record[key]);
          if (parsed != null)
              damage[key] = parsed;
      }
      if (typeof record.type === 'string')
          damage.type = record.type;
      return damage;
  };
  const coerceUlt = (value) => {
      var _a, _b, _c, _d, _e, _f;
      if (!value || typeof value !== 'object')
          return null;
      const record = value;
      const ult = { ...record };
      const numericKeys = [
          'power',
          'hpTradePercent',
          'hits',
          'scale',
          'duration',
          'turns',
          'reduceDmg',
          'bonusVsLeader',
          'penRES',
          'selfHPTrade',
          'attackSpeed',
      ];
      for (const key of numericKeys) {
          const parsed = parseFiniteNumber(record[key]);
          if (parsed != null)
              ult[key] = parsed;
      }
      const targetsParsed = parseFiniteNumber(record.targets);
      if (targetsParsed != null)
          ult.targets = targetsParsed;
      const alliesParsed = parseFiniteNumber(record.allies);
      if (alliesParsed != null)
          ult.allies = alliesParsed;
      ult.runtime = coerceSkillRuntime(record.runtime);
      const resolvedSummon = (_c = (_a = coerceSummonSpec(record.summon)) !== null && _a !== void 0 ? _a : coerceSummonSpec((_b = record.metadata) === null || _b === void 0 ? void 0 : _b.summon)) !== null && _c !== void 0 ? _c : coerceSummonSpec((_d = record.meta) === null || _d === void 0 ? void 0 : _d.summon);
      if (resolvedSummon)
          ult.summon = resolvedSummon;
      if ((_e = ult.metadata) === null || _e === void 0 ? void 0 : _e.summon) {
          ult.metadata = { ...ult.metadata, summon: coerceSummonSpec(ult.metadata.summon) };
      }
      if ((_f = ult.meta) === null || _f === void 0 ? void 0 : _f.summon) {
          ult.meta = { ...ult.meta, summon: coerceSummonSpec(ult.meta.summon) };
      }
      ult.damage = coerceDamageSpec(record.damage);
      return ult;
  };
  const readCountCandidate = (value) => {
      const numeric = parseFiniteNumber(value);
      if (numeric != null)
          return numeric;
      if (typeof value === 'string') {
          const match = value.match(/(\d+)/);
          if (match && match[1]) {
              const parsed = Number(match[1]);
              if (Number.isFinite(parsed))
                  return parsed;
          }
      }
      return null;
  };
  const resolveCount = (candidates, fallback, { min, max } = {}) => {
      for (const candidate of candidates) {
          const value = readCountCandidate(candidate);
          if (value != null) {
              let resolved = Math.round(value);
              if (typeof min === 'number')
                  resolved = Math.max(min, resolved);
              if (typeof max === 'number')
                  resolved = Math.min(max, resolved);
              return resolved;
          }
      }
      return fallback;
  };
  const getUltHitCount = (ult) => {
      const runtime = ult === null || ult === void 0 ? void 0 : ult.runtime;
      const resolved = resolveCount([
          ult === null || ult === void 0 ? void 0 : ult.hits,
          runtime === null || runtime === void 0 ? void 0 : runtime.hits,
          runtime === null || runtime === void 0 ? void 0 : runtime.hitCount,
          runtime === null || runtime === void 0 ? void 0 : runtime.count,
      ], 1, { min: 1 });
      return Math.max(1, resolved);
  };
  const getUltTargetCount = (ult, fallback) => {
      const runtime = ult === null || ult === void 0 ? void 0 : ult.runtime;
      return resolveCount([
          ult === null || ult === void 0 ? void 0 : ult.targets,
          runtime === null || runtime === void 0 ? void 0 : runtime.targets,
          runtime === null || runtime === void 0 ? void 0 : runtime.targetCount,
          runtime === null || runtime === void 0 ? void 0 : runtime.count,
      ], fallback, { min: 0 });
  };
  const getUltAlliesCount = (ult, fallback) => {
      var _a, _b;
      return resolveCount([
          ult === null || ult === void 0 ? void 0 : ult.allies,
          (_a = ult === null || ult === void 0 ? void 0 : ult.runtime) === null || _a === void 0 ? void 0 : _a.targets,
          (_b = ult === null || ult === void 0 ? void 0 : ult.runtime) === null || _b === void 0 ? void 0 : _b.count,
      ], fallback, { min: 0 });
  };
  const getUltDurationTurns = (ult, fallback) => {
      const runtime = ult === null || ult === void 0 ? void 0 : ult.runtime;
      const resolved = resolveCount([
          ult === null || ult === void 0 ? void 0 : ult.duration,
          ult === null || ult === void 0 ? void 0 : ult.turns,
          runtime === null || runtime === void 0 ? void 0 : runtime.duration,
          runtime === null || runtime === void 0 ? void 0 : runtime.turns,
          runtime === null || runtime === void 0 ? void 0 : runtime.durationTurns,
      ], fallback, { min: 1 });
      return Math.max(1, resolved);
  };
  const ensureSessionWithVfx = (game, options) => {
      const session = baseAsSessionWithVfx(game, options);
      if (!session)
          return null;
      if (!Array.isArray(session.vfx)) {
          session.vfx = [];
      }
      return session;
  };
  const isDeckEntry = (value) => {
      if (!value || typeof value !== 'object')
          return false;
      const candidate = value;
      return typeof candidate.id === 'string' && candidate.id.trim() !== '';
  };
  function assertDeckEntry(value) {
      if (!isDeckEntry(value)) {
          throw new TypeError('Thẻ bài không hợp lệ.');
      }
  }
  function asDeckEntry(value) {
      assertDeckEntry(value);
      return value;
  }
  function sanitizeDeckEntries(value) {
      if (!Array.isArray(value))
          return [];
      let changed = false;
      const normalized = [];
      for (const entry of value) {
          if (isDeckEntry(entry)) {
              normalized.push(entry);
          }
          else {
              changed = true;
          }
      }
      return changed ? normalized : value;
  }
  function ensureDeck() {
      const game = getInitializedGame();
      if (!game)
          return [];
      const deck = sanitizeDeckEntries(game.deck3);
      if (deck !== game.deck3) {
          game.deck3 = deck;
      }
      return deck;
  }
  function ensureRoster() {
      const game = getInitializedGame();
      if (!game)
          return [];
      const roster = sanitizeDeckEntries(game.unitsAll);
      if (roster !== game.unitsAll) {
          game.unitsAll = roster;
      }
      return game.unitsAll;
  }
  const getCardCost = (card) => {
      if (!card)
          return 0;
      const raw = card.cost;
      if (typeof raw === 'number' && Number.isFinite(raw))
          return raw;
      if (typeof raw === 'string') {
          const parsed = Number(raw);
          return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
  };
  function sanitizeStartConfig(config) {
      var _a, _b;
      if (!isPlainRecord(config)) {
          return { rest: {}, root: null };
      }
      const { root, rootEl, ...rest } = config;
      const resolvedRoot = (_b = (_a = toRootLike(root)) !== null && _a !== void 0 ? _a : toRootLike(rootEl)) !== null && _b !== void 0 ? _b : null;
      return {
          rest: toStartConfigOverrides(rest),
          root: resolvedRoot,
      };
  }
  let canvas = null;
  let ctx = null;
  let hud = null;
  let summonBarHandle = null;
  let hudCleanup = null;
  const DEFAULT_CAMERA_KEY = 'landscape_oblique';
  const resolveCameraPreset = () => {
      var _a;
      const key = ((_a = CFG.CAMERA) !== null && _a !== void 0 ? _a : DEFAULT_CAMERA_KEY);
      const preset = CAM[key];
      return preset !== null && preset !== void 0 ? preset : CAM[DEFAULT_CAMERA_KEY];
  };
  const CAM_PRESET = resolveCameraPreset();
  const HAND_SIZE = (_a = CFG.HAND_SIZE) !== null && _a !== void 0 ? _a : 4;
  ensureNestedModuleSupport();
  const getNow = () => safeNow();
  // --- Instance counters (để gắn id cho token/minion) ---
  let _IID = 1;
  let _BORN = 1;
  const nextIid = () => _IID++;
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
  let storedConfig = normalizeConfig();
  let running = false;
  const hpBarGradientCache = new Map();
  const renderSummonBar = () => {
      var _a, _b;
      const game = getInitializedGame();
      const bar = (_b = (_a = game === null || game === void 0 ? void 0 : game.ui) === null || _a === void 0 ? void 0 : _a.bar) !== null && _b !== void 0 ? _b : null;
      if (bar === null || bar === void 0 ? void 0 : bar.render)
          bar.render();
  };
  function cleanupSummonBar() {
      if (summonBarHandle && typeof summonBarHandle.cleanup === 'function') {
          try {
              summonBarHandle.cleanup();
          }
          catch { }
      }
      summonBarHandle = null;
      const game = getInitializedGame();
      if (game === null || game === void 0 ? void 0 : game.ui) {
          game.ui.bar = null;
      }
  }
  function resetSessionState(options = {}) {
      const overrides = toStartConfigOverrides(options);
      storedConfig = normalizeConfig({ ...storedConfig, ...overrides });
      Game = createSession(storedConfig);
      _IID = 1;
      _BORN = 1;
      CLOCK = createClock();
      invalidateSceneCache();
  }
  if ((_b = CFG === null || CFG === void 0 ? void 0 : CFG.DEBUG) === null || _b === void 0 ? void 0 : _b.LOG_EVENTS) {
      const logEvent = (type) => (event) => {
          var _a, _b, _c, _d;
          const detail = ((_a = event === null || event === void 0 ? void 0 : event.detail) !== null && _a !== void 0 ? _a : {});
          const unitRaw = ((_b = detail['unit']) !== null && _b !== void 0 ? _b : null);
          const readString = (value) => (typeof value === 'string' ? value : null);
          const readNumber = (value) => {
              if (typeof value === 'number' && Number.isFinite(value))
                  return value;
              if (typeof value === 'string') {
                  const parsed = Number(value);
                  return Number.isFinite(parsed) ? parsed : null;
              }
              return null;
          };
          const info = {
              side: readString(detail['side']),
              slot: readNumber(detail['slot']),
              cycle: readNumber(detail['cycle']),
              orderIndex: readNumber(detail['orderIndex']),
              orderLength: readNumber(detail['orderLength']),
              phase: readString(detail['phase']),
              unit: (_c = readString(unitRaw === null || unitRaw === void 0 ? void 0 : unitRaw.id)) !== null && _c !== void 0 ? _c : readString(unitRaw === null || unitRaw === void 0 ? void 0 : unitRaw.name),
              action: readString(detail['action']),
              skipped: Boolean(detail['skipped']),
              reason: readString(detail['reason']),
              processedChain: (_d = detail['processedChain']) !== null && _d !== void 0 ? _d : null,
          };
          console.debug(`[events] ${type}`, info);
      };
      const types = [TURN_START, TURN_END, ACTION_START, ACTION_END];
      for (const type of types) {
          try {
              addGameEventListener(type, logEvent(type));
          }
          catch (err) {
              console.error('[events]', err);
          }
      }
  }
  let drawFrameHandle = null;
  let drawFrameUsesTimeout = false;
  let drawPending = false;
  let drawPaused = false;
  function cancelScheduledDraw() {
      if (drawFrameHandle !== null) {
          if (drawFrameUsesTimeout) {
              clearTimeout(drawFrameHandle);
          }
          else {
              const cancel = (winRef && typeof winRef.cancelAnimationFrame === 'function')
                  ? winRef.cancelAnimationFrame.bind(winRef)
                  : (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : null);
              if (typeof cancel === 'function') {
                  cancel(drawFrameHandle);
              }
          }
          drawFrameHandle = null;
          drawFrameUsesTimeout = false;
      }
      drawPending = false;
  }
  function scheduleDraw() {
      if (drawPaused)
          return;
      if (drawPending)
          return;
      if (!canvas || !ctx)
          return;
      drawPending = true;
      const raf = (winRef && typeof winRef.requestAnimationFrame === 'function')
          ? winRef.requestAnimationFrame.bind(winRef)
          : (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null);
      if (raf) {
          drawFrameUsesTimeout = false;
          drawFrameHandle = raf(() => {
              drawFrameHandle = null;
              drawFrameUsesTimeout = false;
              drawPending = false;
              if (drawPaused)
                  return;
              try {
                  draw();
              }
              catch (err) {
                  console.error('[draw]', err);
              }
              if ((Game === null || Game === void 0 ? void 0 : Game.vfx) && Game.vfx.length)
                  scheduleDraw();
          });
      }
      else {
          drawFrameUsesTimeout = true;
          drawFrameHandle = setTimeout(() => {
              drawFrameHandle = null;
              drawFrameUsesTimeout = false;
              drawPending = false;
              if (drawPaused)
                  return;
              try {
                  draw();
              }
              catch (err) {
                  console.error('[draw]', err);
              }
              if ((Game === null || Game === void 0 ? void 0 : Game.vfx) && Game.vfx.length)
                  scheduleDraw();
          }, 16);
      }
  }
  function cancelScheduledResize() {
      if (resizeSchedulerHandle !== null) {
          if (resizeSchedulerUsesTimeout) {
              clearTimeout(resizeSchedulerHandle);
          }
          else {
              const cancel = (winRef && typeof winRef.cancelAnimationFrame === 'function')
                  ? winRef.cancelAnimationFrame.bind(winRef)
                  : (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : null);
              if (typeof cancel === 'function') {
                  cancel(resizeSchedulerHandle);
              }
          }
          resizeSchedulerHandle = null;
          resizeSchedulerUsesTimeout = false;
      }
      pendingResize = false;
  }
  function flushScheduledResize() {
      resizeSchedulerHandle = null;
      resizeSchedulerUsesTimeout = false;
      pendingResize = false;
      try {
          resize();
          if (hud && typeof hud.update === 'function' && Game) {
              hud.update(Game);
          }
          scheduleDraw();
      }
      catch (err) {
          console.error('[resize]', err);
      }
  }
  function scheduleResize() {
      if (pendingResize)
          return;
      pendingResize = true;
      const raf = (winRef && typeof winRef.requestAnimationFrame === 'function')
          ? winRef.requestAnimationFrame.bind(winRef)
          : (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null);
      if (raf) {
          resizeSchedulerUsesTimeout = false;
          resizeSchedulerHandle = raf(flushScheduledResize);
      }
      else {
          resizeSchedulerUsesTimeout = true;
          resizeSchedulerHandle = setTimeout(flushScheduledResize, 32);
      }
  }
  const DEFAULT_TOKEN_COLOR = '#a9f58c';
  function refreshQueuedArtFor(unitId) {
      const apply = (map) => {
          var _a, _b, _c, _d;
          if (!map || typeof map.values !== 'function')
              return;
          for (const pending of map.values()) {
              if (!pending || pending.unitId !== unitId)
                  continue;
              const updated = getUnitArt(unitId);
              const pendingExt = pending;
              if (pendingExt) {
                  const nextColor = (_c = (_b = (_a = updated === null || updated === void 0 ? void 0 : updated.palette) === null || _a === void 0 ? void 0 : _a.primary) !== null && _b !== void 0 ? _b : pendingExt.color) !== null && _c !== void 0 ? _c : DEFAULT_TOKEN_COLOR;
                  pendingExt.art = updated !== null && updated !== void 0 ? updated : null;
                  pendingExt.skinKey = (_d = updated === null || updated === void 0 ? void 0 : updated.skinKey) !== null && _d !== void 0 ? _d : null;
                  pendingExt.color = nextColor;
              }
          }
      };
      if (!(Game === null || Game === void 0 ? void 0 : Game.queued))
          return;
      apply(Game.queued.ally);
      apply(Game.queued.enemy);
  }
  function setUnitSkinForSession(unitId, skinKey) {
      var _a, _b, _c;
      if (!Game)
          return false;
      const ok = setUnitSkin(unitId, skinKey);
      if (!ok)
          return false;
      const art = getUnitArt(unitId);
      const resolvedSkin = (_a = art === null || art === void 0 ? void 0 : art.skinKey) !== null && _a !== void 0 ? _a : null;
      const primaryColor = (_c = (_b = art === null || art === void 0 ? void 0 : art.palette) === null || _b === void 0 ? void 0 : _b.primary) !== null && _c !== void 0 ? _c : null;
      const resolveColor = (current) => {
          var _a;
          return (_a = primaryColor !== null && primaryColor !== void 0 ? primaryColor : current) !== null && _a !== void 0 ? _a : DEFAULT_TOKEN_COLOR;
      };
      const applyArtMetadata = (entry) => {
          if (!entry || entry.id !== unitId)
              return;
          const nextColor = resolveColor(entry.color);
          entry.art = art !== null && art !== void 0 ? art : null;
          entry.skinKey = resolvedSkin;
          entry.color = nextColor;
      };
      const tokens = Game.tokens || [];
      for (const token of tokens) {
          if (!token || token.id !== unitId)
              continue;
          const nextColor = resolveColor(token.color);
          token.art = art;
          token.skinKey = resolvedSkin;
          token.color = nextColor;
      }
      if (Array.isArray(Game.deck3)) {
          for (const entry of Game.deck3) {
              applyArtMetadata(entry);
          }
      }
      if (Array.isArray(Game.unitsAll)) {
          for (const entry of Game.unitsAll) {
              applyArtMetadata(entry);
          }
      }
      refreshQueuedArtFor(unitId);
      renderSummonBar();
      scheduleDraw();
      return true;
  }
  function setDrawPaused(paused) {
      drawPaused = !!paused;
      if (drawPaused) {
          cancelScheduledDraw();
      }
      else {
          scheduleDraw();
      }
  }
  function bindArtSpriteListener() {
      if (!winRef || typeof winRef.addEventListener !== 'function')
          return;
      if (artSpriteHandler)
          return;
      artSpriteHandler = () => { invalidateSceneCache(); scheduleDraw(); };
      winRef.addEventListener(ART_SPRITE_EVENT, artSpriteHandler);
  }
  function unbindArtSpriteListener() {
      if (!winRef || !artSpriteHandler || typeof winRef.removeEventListener !== 'function')
          return;
      winRef.removeEventListener(ART_SPRITE_EVENT, artSpriteHandler);
      artSpriteHandler = null;
  }
  // Master clock theo timestamp – tránh drift giữa nhiều interval
  let CLOCK = null;
  function createClock() {
      var _a, _b;
      const now = getNow();
      return {
          startMs: now,
          lastTimerRemain: 240,
          lastCostCreditedSec: 0,
          turnEveryMs: (_b = (_a = CFG === null || CFG === void 0 ? void 0 : CFG.ANIMATION) === null || _a === void 0 ? void 0 : _a.turnIntervalMs) !== null && _b !== void 0 ? _b : 600,
          lastTurnStepMs: now
      };
  }
  // Xác chết chờ vanish (để sau này thay bằng dead-animation)
  const DEATH_VANISH_MS = 900;
  function cleanupDead(now) {
      if (!(Game === null || Game === void 0 ? void 0 : Game.tokens))
          return;
      const tokens = Game.tokens;
      const keep = [];
      for (const t of tokens) {
          if (t.alive) {
              keep.push(t);
              continue;
          }
          const t0 = t.deadAt || 0;
          if (!t0) {
              keep.push(t);
              continue;
          } // phòng hờ
          if (now - t0 < DEATH_VANISH_MS) {
              keep.push(t);
          } // còn “thây”
          // else: bỏ hẳn khỏi mảng -> không vẽ, không chặn ô
      }
      Game.tokens = keep;
  }
  // LẤY TỪ INSTANCE đang đứng trên sân (đúng spec: thừa hưởng % chỉ số hiện tại của chủ)
  function creepStatsFromInherit(masterUnit, inherit) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
      if (!inherit || typeof inherit !== 'object')
          return {};
      const hpRatio = (_d = parseFiniteNumber((_c = (_b = (_a = inherit.HP) !== null && _a !== void 0 ? _a : inherit.hp) !== null && _b !== void 0 ? _b : inherit.HPMax) !== null && _c !== void 0 ? _c : inherit.hpMax)) !== null && _d !== void 0 ? _d : 0;
      const atkRatio = (_f = parseFiniteNumber((_e = inherit.ATK) !== null && _e !== void 0 ? _e : inherit.atk)) !== null && _f !== void 0 ? _f : 0;
      const wilRatio = (_h = parseFiniteNumber((_g = inherit.WIL) !== null && _g !== void 0 ? _g : inherit.wil)) !== null && _h !== void 0 ? _h : 0;
      const resRatio = (_k = parseFiniteNumber((_j = inherit.RES) !== null && _j !== void 0 ? _j : inherit.res)) !== null && _k !== void 0 ? _k : 0;
      const armRatio = (_m = parseFiniteNumber((_l = inherit.ARM) !== null && _l !== void 0 ? _l : inherit.arm)) !== null && _m !== void 0 ? _m : 0;
      const hpMaxBase = toFiniteOrZero(masterUnit === null || masterUnit === void 0 ? void 0 : masterUnit.hpMax);
      const atkBase = toFiniteOrZero(masterUnit === null || masterUnit === void 0 ? void 0 : masterUnit.atk);
      const wilBase = toFiniteOrZero(masterUnit === null || masterUnit === void 0 ? void 0 : masterUnit.wil);
      const resBase = toFiniteOrZero(masterUnit === null || masterUnit === void 0 ? void 0 : masterUnit.res);
      const armBase = toFiniteOrZero(masterUnit === null || masterUnit === void 0 ? void 0 : masterUnit.arm);
      const hpMax = Math.round(hpMaxBase * hpRatio);
      const atk = Math.round(atkBase * atkRatio);
      const wil = Math.round(wilBase * wilRatio);
      const res = Math.round(resBase * resRatio);
      const arm = Math.round(armBase * armRatio * 100) / 100;
      const stats = {};
      if (hpMax > 0) {
          stats.hpMax = hpMax;
          stats.hp = hpMax;
      }
      if (atk > 0)
          stats.atk = atk;
      if (wil > 0)
          stats.wil = wil;
      if (res > 0)
          stats.res = res;
      if (arm > 0)
          stats.arm = Math.max(0, Math.min(1, arm));
      return stats;
  }
  function getMinionsOf(masterIid) {
      return ((Game === null || Game === void 0 ? void 0 : Game.tokens) || []).filter((t) => t.isMinion && t.ownerIid === masterIid && t.alive);
  }
  function removeOldestMinions(masterIid, count) {
      if (count <= 0)
          return;
      const tokens = Game === null || Game === void 0 ? void 0 : Game.tokens;
      if (!tokens)
          return;
      const list = getMinionsOf(masterIid).sort((a, b) => (a.bornSerial || 0) - (b.bornSerial || 0));
      for (let i = 0; i < count && i < list.length; i++) {
          const x = list[i];
          x.alive = false;
          // xoá khỏi mảng để khỏi vẽ/đụng lượt
          const idx = tokens.indexOf(x);
          if (idx >= 0)
              tokens.splice(idx, 1);
      }
  }
  function extendBusy(duration) {
      const game = getInitializedGame();
      if (!game || !game.turn)
          return;
      const now = getNow();
      const prev = Number.isFinite(game.turn.busyUntil) ? game.turn.busyUntil : now;
      const dur = Math.max(0, duration | 0);
      game.turn.busyUntil = Math.max(prev, now + dur);
  }
  // Thực thi Ult: Summoner -> Immediate Summon theo meta; class khác: trừ nộ
  function performUlt(unit) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26;
      const game = getInitializedGame();
      if (!game) {
          setFury(unit, 0);
          return;
      }
      const metaGetter = (_a = game.meta) === null || _a === void 0 ? void 0 : _a.get;
      const meta = typeof metaGetter === 'function' ? metaGetter.call(game.meta, unit.id) : null;
      if (!meta) {
          setFury(unit, 0);
          return;
      }
      const slot = slotIndex(unit.side, unit.cx, unit.cy);
      const summonSpecRaw = meta.class === 'Summoner' ? getSummonSpec(meta) : null;
      const summonSpec = meta.class === 'Summoner' ? coerceSummonSpec(summonSpecRaw) : null;
      if (meta.class === 'Summoner' && summonSpec) {
          const aliveNow = tokensAlive();
          const queued = game.queued || { ally: new Map(), enemy: new Map() };
          const patternSlots = resolveSummonSlots(summonSpec, slot)
              .filter((s) => typeof s === 'number' && Number.isFinite(s))
              .filter((s) => {
              const { cx, cy } = slotToCell(unit.side, s);
              return !cellReserved(aliveNow, queued, cx, cy);
          })
              .sort((a, b) => a - b);
          const desired = (_b = parseFiniteNumber(summonSpec.count)) !== null && _b !== void 0 ? _b : (patternSlots.length || 1);
          const need = Math.min(patternSlots.length, Math.max(0, desired));
          if (need > 0) {
              const limit = (_c = parseFiniteNumber(summonSpec.limit)) !== null && _c !== void 0 ? _c : Infinity;
              const have = getMinionsOf(unit.iid).length;
              const over = Math.max(0, have + need - limit);
              const replacePolicy = typeof summonSpec.replace === 'string' ? summonSpec.replace.trim().toLowerCase() : null;
              if (over > 0 && replacePolicy === 'oldest')
                  removeOldestMinions(unit.iid, over);
              const inheritStats = creepStatsFromInherit(unit, summonSpec.inherit);
              const ttlBase = parseFiniteNumber((_d = summonSpec.ttlTurns) !== null && _d !== void 0 ? _d : summonSpec.ttl);
              for (let i = 0; i < need; i++) {
                  const s = patternSlots[i];
                  const base = ((_e = summonSpec.creep) !== null && _e !== void 0 ? _e : {});
                  const spawnTtl = (_g = parseFiniteNumber((_f = base.ttlTurns) !== null && _f !== void 0 ? _f : base.ttl)) !== null && _g !== void 0 ? _g : ttlBase;
                  const creepId = typeof base.id === 'string' && base.id.trim() ? base.id : `${unit.id}_minion`;
                  const creepName = typeof base.name === 'string' && base.name.trim()
                      ? base.name
                      : (typeof base.label === 'string' && base.label.trim() ? base.label : 'Creep');
                  const creepColor = typeof base.color === 'string' && base.color.trim() ? base.color : '#ffd27d';
                  const ttlTurns = Math.max(1, Math.round((_h = parseFiniteNumber(spawnTtl)) !== null && _h !== void 0 ? _h : 3));
                  enqueueImmediate(game, {
                      by: unit.id,
                      side: unit.side,
                      slot: s,
                      unit: {
                          id: creepId,
                          name: creepName,
                          color: creepColor,
                          isMinion: base.isMinion !== false,
                          ownerIid: unit.iid,
                          bornSerial: _BORN++,
                          ttlTurns,
                          ...inheritStats
                      }
                  });
              }
          }
          setFury(unit, 0);
          return;
      }
      const u = coerceUlt((_j = meta.kit) === null || _j === void 0 ? void 0 : _j.ult);
      if (!u) {
          spendFury(unit, resolveUltCost(unit));
          return;
      }
      const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
      let busyMs = 900;
      switch (u.type) {
          case 'drain': {
              const aliveNow = tokensAlive();
              const foes = aliveNow.filter(t => t.side === foeSide);
              if (!foes.length)
                  break;
              const scale = (_k = parseFiniteNumber(u.power)) !== null && _k !== void 0 ? _k : 1.2;
              let totalDrain = 0;
              for (const tgt of foes) {
                  if (!tgt.alive)
                      continue;
                  const base = Math.max(1, Math.round((unit.wil || 0) * scale));
                  const { dealt } = dealAbilityDamage(game, unit, tgt, {
                      base,
                      dtype: 'arcane',
                      attackType: 'skill'
                  });
                  totalDrain += dealt;
              }
              if (totalDrain > 0) {
                  const { overheal } = healUnit(unit, totalDrain);
                  if (overheal > 0)
                      grantShield(unit, overheal);
              }
              busyMs = 1400;
              break;
          }
          case 'hpTradeBurst': {
              const hpTradePctRaw = (_o = parseFiniteNumber((_l = u.hpTradePercent) !== null && _l !== void 0 ? _l : (_m = u.hpTrade) === null || _m === void 0 ? void 0 : _m.percentMaxHP)) !== null && _o !== void 0 ? _o : 0;
              const hpTradePct = Math.max(0, Math.min(0.95, hpTradePctRaw));
              const hpMax = Number.isFinite(unit.hpMax) ? unit.hpMax : 0;
              const currentHp = Number.isFinite(unit.hp) ? unit.hp : 0;
              const desiredTrade = Math.round(hpMax * hpTradePct);
              const maxLoss = Math.max(0, currentHp - 1);
              const hpPayment = Math.max(0, Math.min(desiredTrade, maxLoss));
              if (hpPayment > 0) {
                  applyDamage(unit, hpPayment);
                  gainFury(unit, {
                      type: 'damageTaken',
                      dealt: hpPayment,
                      selfMaxHp: Number.isFinite(unit === null || unit === void 0 ? void 0 : unit.hpMax) ? unit.hpMax : undefined,
                      damageTaken: hpPayment
                  });
                  finishFuryHit(unit);
              }
              const aliveNow = tokensAlive();
              const foes = aliveNow.filter((t) => t.side === foeSide && t.alive);
              const hits = getUltHitCount(u);
              const selected = [];
              if (foes.length) {
                  const primary = pickTarget(game, unit);
                  if (primary) {
                      selected.push(primary);
                  }
                  const pool = foes.filter((t) => !selected.includes(t));
                  pool.sort((a, b) => {
                      const da = Math.abs(a.cx - unit.cx) + Math.abs(a.cy - unit.cy);
                      const db = Math.abs(b.cx - unit.cx) + Math.abs(b.cy - unit.cy);
                      return da - db;
                  });
                  for (const enemy of pool) {
                      if (selected.length >= hits)
                          break;
                      selected.push(enemy);
                  }
                  if (selected.length > hits)
                      selected.length = hits;
                  if (!selected.length && foes.length) {
                      selected.push(foes[0]);
                  }
              }
              const applyBusyFromVfx = (startedAt, duration) => {
                  if (!Number.isFinite(startedAt) || !Number.isFinite(duration))
                      return;
                  const resolved = duration;
                  busyMs = Math.max(busyMs, resolved);
                  if (game.turn) {
                      const prev = Number.isFinite(game.turn.busyUntil) ? game.turn.busyUntil : startedAt;
                      game.turn.busyUntil = Math.max(prev, startedAt + resolved);
                  }
              };
              const bindingKey = 'huyet_hon_loi_quyet';
              {
                  const startedAt = getNow();
                  const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
                  if (sessionVfx) {
                      try {
                          const dur = vfxAddBloodPulse(sessionVfx, unit, {
                              bindingKey,
                              timing: 'charge_up'
                          });
                          applyBusyFromVfx(startedAt, dur);
                      }
                      catch (_) { }
                  }
              }
              const damageSpec = ((_p = u.damage) !== null && _p !== void 0 ? _p : {});
              const dtype = typeof damageSpec.type === 'string' && damageSpec.type ? damageSpec.type : 'arcane';
              const attackType = u.countsAsBasic ? 'basic' : 'skill';
              const wilScale = (_r = parseFiniteNumber((_q = damageSpec.scaleWIL) !== null && _q !== void 0 ? _q : damageSpec.scaleWil)) !== null && _r !== void 0 ? _r : 0;
              const flatAdd = (_t = parseFiniteNumber((_s = damageSpec.flat) !== null && _s !== void 0 ? _s : damageSpec.flatAdd)) !== null && _t !== void 0 ? _t : 0;
              const debuffSpec = (_u = u.appliesDebuff) !== null && _u !== void 0 ? _u : null;
              const debuffId = typeof (debuffSpec === null || debuffSpec === void 0 ? void 0 : debuffSpec.id) === 'string' && debuffSpec.id ? debuffSpec.id : 'loithienanh_spd_burn';
              const debuffAmount = (_w = parseFiniteNumber((_v = debuffSpec === null || debuffSpec === void 0 ? void 0 : debuffSpec.amount) !== null && _v !== void 0 ? _v : debuffSpec === null || debuffSpec === void 0 ? void 0 : debuffSpec.amountPercent)) !== null && _w !== void 0 ? _w : 0;
              const debuffMaxStacks = Math.max(1, Math.round((_x = parseFiniteNumber(debuffSpec === null || debuffSpec === void 0 ? void 0 : debuffSpec.maxStacks)) !== null && _x !== void 0 ? _x : 1));
              const debuffDuration = Math.max(1, Math.round((_y = parseFiniteNumber(debuffSpec === null || debuffSpec === void 0 ? void 0 : debuffSpec.turns)) !== null && _y !== void 0 ? _y : getUltDurationTurns(u, (_z = parseFiniteNumber(u.turns)) !== null && _z !== void 0 ? _z : 1)));
              for (const tgt of selected) {
                  if (!tgt || !tgt.alive)
                      continue;
                  const tgtRank = ((_1 = (_0 = game.meta) === null || _0 === void 0 ? void 0 : _0.rankOf) === null || _1 === void 0 ? void 0 : _1.call(_0, tgt.id)) || (tgt === null || tgt === void 0 ? void 0 : tgt.rank) || '';
                  const isBoss = typeof tgtRank === 'string' && tgtRank.toLowerCase() === 'boss';
                  const pctDefault = (_3 = parseFiniteNumber((_2 = damageSpec.percentTargetMaxHP) !== null && _2 !== void 0 ? _2 : damageSpec.basePercentMaxHPTarget)) !== null && _3 !== void 0 ? _3 : 0;
                  const pct = isBoss
                      ? (_4 = parseFiniteNumber(damageSpec.bossPercent)) !== null && _4 !== void 0 ? _4 : pctDefault
                      : pctDefault;
                  const baseFromPct = Math.round(Math.max(0, pct) * Math.max(0, tgt.hpMax || 0));
                  const baseFromWil = Math.round(Math.max(0, wilScale) * Math.max(0, unit.wil || 0));
                  const baseFlat = Math.round(Math.max(0, flatAdd));
                  const base = Math.max(1, baseFromPct + baseFromWil + baseFlat);
                  dealAbilityDamage(game, unit, tgt, {
                      base,
                      dtype,
                      attackType,
                      defPen: (_6 = parseFiniteNumber((_5 = damageSpec.defPen) !== null && _5 !== void 0 ? _5 : damageSpec.pen)) !== null && _6 !== void 0 ? _6 : 0
                  });
                  {
                      const startedAt = getNow();
                      const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
                      if (sessionVfx) {
                          try {
                              const dur = vfxAddLightningArc(sessionVfx, unit, tgt, {
                                  bindingKey,
                                  timing: 'burst_core',
                                  targetBindingKey: bindingKey,
                                  targetTiming: 'burst_core'
                              });
                              applyBusyFromVfx(startedAt, dur);
                          }
                          catch (_) { }
                      }
                  }
                  if (debuffAmount && tgt.alive) {
                      const existing = Statuses.get(tgt, debuffId);
                      if (existing) {
                          existing.stacks = Math.min(debuffMaxStacks, (existing.stacks || 1) + 1);
                          if (Number.isFinite(debuffDuration))
                              existing.dur = debuffDuration;
                      }
                      else {
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
                      if (typeof tgt._recalcStats === 'function')
                          tgt._recalcStats();
                  }
              }
              {
                  const startedAt = getNow();
                  const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
                  if (sessionVfx) {
                      try {
                          const dur = vfxAddGroundBurst(sessionVfx, unit, {
                              bindingKey,
                              anchorId: 'right_foot',
                              timing: 'ground_crack'
                          });
                          applyBusyFromVfx(startedAt, dur);
                      }
                      catch (_) { }
                  }
              }
              {
                  const startedAt = getNow();
                  const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
                  if (sessionVfx) {
                      try {
                          const dur = vfxAddGroundBurst(sessionVfx, unit, {
                              bindingKey,
                              anchorId: 'left_foot',
                              timing: 'ground_crack'
                          });
                          applyBusyFromVfx(startedAt, dur);
                      }
                      catch (_) { }
                  }
              }
              {
                  const startedAt = getNow();
                  const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
                  if (sessionVfx) {
                      try {
                          const dur = vfxAddShieldWrap(sessionVfx, unit, {
                              bindingKey,
                              anchorId: 'root',
                              timing: 'burst_core'
                          });
                          applyBusyFromVfx(startedAt, dur);
                      }
                      catch (_) { }
                  }
              }
              const reduceDmg = parseFiniteNumber(u.reduceDmg);
              if (reduceDmg && reduceDmg > 0) {
                  const turns = getUltDurationTurns(u, (_7 = parseFiniteNumber(u.turns)) !== null && _7 !== void 0 ? _7 : 1);
                  Statuses.add(unit, Statuses.make.damageCut({ pct: reduceDmg, turns }));
              }
              busyMs = Math.max(busyMs, 1600);
              break;
          }
          case 'strikeLaneMid': {
              const primary = pickTarget(game, unit);
              if (!primary)
                  break;
              const laneX = primary.cx;
              const aliveNow = tokensAlive();
              const laneTargets = aliveNow.filter(t => t.side === foeSide && t.cx === laneX);
              const hits = getUltHitCount(u);
              const scale = (_8 = parseFiniteNumber(u.scale)) !== null && _8 !== void 0 ? _8 : 0.9;
              const meleeDur = (_10 = parseFiniteNumber((_9 = CFG === null || CFG === void 0 ? void 0 : CFG.ANIMATION) === null || _9 === void 0 ? void 0 : _9.meleeDurationMs)) !== null && _10 !== void 0 ? _10 : 1100;
              const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
              if (sessionVfx) {
                  try {
                      vfxAddMelee(sessionVfx, unit, primary, { dur: meleeDur });
                  }
                  catch (_) { }
              }
              busyMs = Math.max(busyMs, meleeDur);
              for (const enemy of laneTargets) {
                  if (!enemy.alive)
                      continue;
                  for (let h = 0; h < hits; h++) {
                      if (!enemy.alive)
                          break;
                      let base = Math.max(1, Math.round((unit.atk || 0) * scale));
                      const bonusVsLeader = (_11 = parseFiniteNumber(u.bonusVsLeader)) !== null && _11 !== void 0 ? _11 : 0;
                      if (bonusVsLeader && (enemy.id === 'leaderA' || enemy.id === 'leaderB')) {
                          base = Math.round(base * (1 + bonusVsLeader));
                      }
                      dealAbilityDamage(game, unit, enemy, {
                          base,
                          dtype: 'arcane',
                          attackType: u.tagAsBasic ? 'basic' : 'skill',
                          defPen: (_12 = parseFiniteNumber(u.penRES)) !== null && _12 !== void 0 ? _12 : 0
                      });
                  }
              }
              break;
          }
          case 'selfBuff': {
              const tradePct = Math.max(0, Math.min(0.9, (_13 = parseFiniteNumber(u.selfHPTrade)) !== null && _13 !== void 0 ? _13 : 0));
              const pay = Math.round((unit.hpMax || 0) * tradePct);
              const maxPay = Math.max(0, Math.min(pay, Math.max(0, (unit.hp || 0) - 1)));
              if (maxPay > 0) {
                  applyDamage(unit, maxPay);
                  gainFury(unit, {
                      type: 'damageTaken',
                      dealt: maxPay,
                      selfMaxHp: Number.isFinite(unit === null || unit === void 0 ? void 0 : unit.hpMax) ? unit.hpMax : undefined,
                      damageTaken: maxPay
                  });
                  finishFuryHit(unit);
              }
              const reduce = Math.max(0, (_14 = parseFiniteNumber(u.reduceDmg)) !== null && _14 !== void 0 ? _14 : 0);
              if (reduce > 0) {
                  const turns = getUltDurationTurns(u, (_15 = parseFiniteNumber(u.turns)) !== null && _15 !== void 0 ? _15 : 1);
                  Statuses.add(unit, Statuses.make.damageCut({ pct: reduce, turns }));
              }
              {
                  const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
                  if (sessionVfx) {
                      try {
                          vfxAddHit(sessionVfx, unit);
                      }
                      catch (_) { }
                  }
              }
              busyMs = 800;
              break;
          }
          case 'sleep': {
              const aliveNow = tokensAlive();
              const foes = aliveNow.filter(t => t.side === foeSide);
              if (!foes.length)
                  break;
              const take = Math.max(1, Math.min(foes.length, getUltTargetCount(u, foes.length)));
              foes.sort((a, b) => {
                  const da = Math.abs(a.cx - unit.cx) + Math.abs(a.cy - unit.cy);
                  const db = Math.abs(b.cx - unit.cx) + Math.abs(b.cy - unit.cy);
                  return da - db;
              });
              for (let i = 0; i < take; i++) {
                  const tgt = foes[i];
                  if (!tgt)
                      continue;
                  const turns = getUltDurationTurns(u, (_16 = parseFiniteNumber(u.turns)) !== null && _16 !== void 0 ? _16 : 1);
                  Statuses.add(tgt, Statuses.make.sleep({ turns }));
                  const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
                  if (sessionVfx) {
                      try {
                          vfxAddHit(sessionVfx, tgt);
                      }
                      catch (_) { }
                  }
              }
              busyMs = 1000;
              break;
          }
          case 'revive': {
              const tokens = game.tokens || [];
              const fallen = tokens.filter(t => t.side === unit.side && !t.alive);
              if (!fallen.length)
                  break;
              fallen.sort((a, b) => (b.deadAt || 0) - (a.deadAt || 0));
              const take = Math.max(1, Math.min(fallen.length, getUltTargetCount(u, 1)));
              for (let i = 0; i < take; i++) {
                  const ally = fallen[i];
                  if (!ally)
                      continue;
                  ally.alive = true;
                  ally.deadAt = 0;
                  ally.hp = 0;
                  Statuses.purge(ally);
                  const revivedHp = (_20 = parseFiniteNumber((_18 = (_17 = u.revived) === null || _17 === void 0 ? void 0 : _17.hpPercent) !== null && _18 !== void 0 ? _18 : (_19 = u.revived) === null || _19 === void 0 ? void 0 : _19.hpPct)) !== null && _20 !== void 0 ? _20 : 0.5;
                  const hpPct = Math.max(0, Math.min(1, revivedHp));
                  const healAmt = Math.max(1, Math.round((ally.hpMax || 0) * hpPct));
                  healUnit(ally, healAmt);
                  setFury(ally, Math.max(0, (_22 = parseFiniteNumber((_21 = u.revived) === null || _21 === void 0 ? void 0 : _21.rage)) !== null && _22 !== void 0 ? _22 : 0));
                  if ((_23 = u.revived) === null || _23 === void 0 ? void 0 : _23.lockSkillsTurns) {
                      const silenceTurns = Math.max(1, Math.round((_24 = parseFiniteNumber(u.revived.lockSkillsTurns)) !== null && _24 !== void 0 ? _24 : 1));
                      Statuses.add(ally, Statuses.make.silence({ turns: silenceTurns }));
                  }
                  const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
                  if (sessionVfx) {
                      try {
                          vfxAddSpawn(sessionVfx, ally.cx, ally.cy, ally.side);
                      }
                      catch (_) { }
                  }
              }
              busyMs = 1500;
              break;
          }
          case 'equalizeHP': {
              const aliveNow = tokensAlive();
              let allies = aliveNow.filter(t => t.side === unit.side);
              if (!allies.length)
                  break;
              allies.sort((a, b) => {
                  const ra = (a.hpMax || 1) ? (a.hp || 0) / a.hpMax : 0;
                  const rb = (b.hpMax || 1) ? (b.hp || 0) / b.hpMax : 0;
                  return ra - rb;
              });
              const count = Math.max(1, Math.min(allies.length, getUltAlliesCount(u, allies.length)));
              const selected = allies.slice(0, count);
              if (u.healLeader) {
                  const leaderId = unit.side === 'ally' ? 'leaderA' : 'leaderB';
                  const tokens = game.tokens || [];
                  const leader = tokens.find(t => t.id === leaderId && t.alive);
                  if (leader && !selected.includes(leader))
                      selected.push(leader);
              }
              if (!selected.length)
                  break;
              const ratio = selected.reduce((acc, t) => {
                  const r = (t.hpMax || 1) ? (t.hp || 0) / t.hpMax : 0;
                  return Math.max(acc, r);
              }, 0);
              for (const tgt of selected) {
                  const goal = Math.min(tgt.hpMax || 0, Math.round((tgt.hpMax || 0) * ratio));
                  if (goal > (tgt.hp || 0)) {
                      healUnit(tgt, goal - (tgt.hp || 0));
                      const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
                      if (sessionVfx) {
                          try {
                              vfxAddHit(sessionVfx, tgt);
                          }
                          catch (_) { }
                      }
                  }
              }
              busyMs = 1000;
              break;
          }
          case 'haste': {
              const targets = new Set();
              targets.add(unit);
              const extraAllies = Math.max(0, getUltTargetCount(u, 1) - 1);
              const aliveNow = tokensAlive();
              const others = aliveNow.filter(t => t.side === unit.side && t !== unit);
              others.sort((a, b) => (a.spd || 0) - (b.spd || 0));
              for (const ally of others) {
                  if (targets.size >= extraAllies + 1)
                      break;
                  targets.add(ally);
              }
              const pct = (_25 = parseFiniteNumber(u.attackSpeed)) !== null && _25 !== void 0 ? _25 : 0.1;
              for (const tgt of targets) {
                  const turns = getUltDurationTurns(u, (_26 = parseFiniteNumber(u.turns)) !== null && _26 !== void 0 ? _26 : 1);
                  Statuses.add(tgt, Statuses.make.haste({ pct, turns }));
                  const sessionVfx = ensureSessionWithVfx(game, { requireGrid: true });
                  if (sessionVfx) {
                      try {
                          vfxAddHit(sessionVfx, tgt);
                      }
                      catch (_) { }
                  }
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
  const tokensAlive = () => ((Game === null || Game === void 0 ? void 0 : Game.tokens) || []).filter((t) => t.alive);
  function ensureBattleState(game) {
      if (!game || typeof game !== 'object')
          return null;
      if (!game.battle || typeof game.battle !== 'object') {
          game.battle = {
              over: false,
              winner: null,
              reason: null,
              detail: null,
              finishedAt: 0,
              result: null,
          };
      }
      if (typeof game.result === 'undefined') {
          game.result = null;
      }
      if (!Object.prototype.hasOwnProperty.call(game.battle, 'result')) {
          game.battle.result = null;
      }
      return game.battle;
  }
  function isUnitAlive(unit) {
      if (!unit)
          return false;
      if (!unit.alive)
          return false;
      if (Number.isFinite(unit.hp)) {
          return unit.hp > 0;
      }
      return true;
  }
  function getHpRatio(unit) {
      if (!unit)
          return 0;
      const hp = Number.isFinite(unit.hp) ? unit.hp : 0;
      const hpMax = Number.isFinite(unit.hpMax) ? unit.hpMax : 0;
      if (hpMax > 0) {
          return Math.max(0, Math.min(1, hp / hpMax));
      }
      return hp > 0 ? 1 : 0;
  }
  function snapshotLeader(unit) {
      if (!unit)
          return null;
      return {
          id: unit.id || null,
          side: unit.side || null,
          alive: !!unit.alive,
          hp: Number.isFinite(unit.hp) ? Math.max(0, unit.hp) : null,
          hpMax: Number.isFinite(unit.hpMax) ? Math.max(0, unit.hpMax) : null
      };
  }
  function isBossToken(game, token) {
      var _a, _b;
      if (!token)
          return false;
      if (token.isBoss)
          return true;
      const rankRaw = typeof token.rank === 'string' && token.rank ? token.rank : (((_b = (_a = game === null || game === void 0 ? void 0 : game.meta) === null || _a === void 0 ? void 0 : _a.rankOf) === null || _b === void 0 ? void 0 : _b.call(_a, token.id)) || '');
      const rank = typeof rankRaw === 'string' ? rankRaw.toLowerCase() : '';
      return rank === 'boss';
  }
  function isPvpMode(game) {
      const key = ((game === null || game === void 0 ? void 0 : game.modeKey) || '').toString().toLowerCase();
      if (!key)
          return false;
      if (key === 'ares')
          return true;
      return key.includes('pvp');
  }
  function finalizeBattle(game, payload, context) {
      var _a, _b, _c;
      const battle = ensureBattleState(game);
      if (!battle || battle.over)
          return (battle === null || battle === void 0 ? void 0 : battle.result) || null;
      const finishedAtRaw = payload === null || payload === void 0 ? void 0 : payload.finishedAt;
      const finishedAt = typeof finishedAtRaw === 'number' && Number.isFinite(finishedAtRaw)
          ? finishedAtRaw
          : getNow();
      const result = {
          winner: (_a = payload === null || payload === void 0 ? void 0 : payload.winner) !== null && _a !== void 0 ? _a : null,
          reason: (_b = payload === null || payload === void 0 ? void 0 : payload.reason) !== null && _b !== void 0 ? _b : null,
          detail: (_c = payload === null || payload === void 0 ? void 0 : payload.detail) !== null && _c !== void 0 ? _c : null,
          finishedAt
      };
      battle.over = true;
      battle.winner = result.winner;
      battle.reason = result.reason;
      battle.detail = result.detail;
      battle.finishedAt = finishedAt;
      battle.result = result;
      if (game)
          game.result = result;
      if (game === null || game === void 0 ? void 0 : game.turn) {
          game.turn.completed = true;
          game.turn.busyUntil = finishedAt;
      }
      if (game === Game) {
          running = false;
          clearSessionTimers();
          try {
              if (hud && typeof hud.update === 'function' && Game)
                  hud.update(Game);
          }
          catch (_) { }
          scheduleDraw();
      }
      emitGameEvent(BATTLE_END, { game, result, context });
      return result;
  }
  function checkBattleEnd(game, context = {}) {
      if (!game)
          return null;
      const battle = ensureBattleState(game);
      if (!battle)
          return null;
      if (battle.over)
          return battle.result || null;
      const tokens = Array.isArray(game.tokens) ? game.tokens : [];
      const leaderA = tokens.find(t => t && t.id === 'leaderA');
      const leaderB = tokens.find(t => t && t.id === 'leaderB');
      const leaderAAlive = isUnitAlive(leaderA);
      const leaderBAlive = isUnitAlive(leaderB);
      const contextDetail = context && typeof context === 'object' ? { ...context } : {};
      const triggerValue = contextDetail['trigger'];
      const trigger = typeof triggerValue === 'string' ? triggerValue : null;
      const detail = {
          context: contextDetail,
          leaders: {
              ally: snapshotLeader(leaderA),
              enemy: snapshotLeader(leaderB)
          }
      };
      let winner = null;
      let reason = null;
      if (!leaderAAlive || !leaderBAlive) {
          reason = 'leader_down';
          if (leaderAAlive && !leaderBAlive)
              winner = 'ally';
          else if (!leaderAAlive && leaderBAlive)
              winner = 'enemy';
          else
              winner = 'draw';
      }
      else if (trigger === 'timeout') {
          reason = 'timeout';
          const remainRaw = contextDetail['remain'];
          const remainCandidate = typeof remainRaw === 'number' ? remainRaw : Number(remainRaw);
          const remain = Number.isFinite(remainCandidate) ? remainCandidate : 0;
          if (isPvpMode(game)) {
              const allyRatio = getHpRatio(leaderA);
              const enemyRatio = getHpRatio(leaderB);
              detail.timeout = {
                  mode: 'pvp',
                  remain,
                  hpRatio: { ally: allyRatio, enemy: enemyRatio }
              };
              if (allyRatio > enemyRatio)
                  winner = 'ally';
              else if (enemyRatio > allyRatio)
                  winner = 'enemy';
              else
                  winner = 'draw';
          }
          else {
              const bossAlive = tokens.some((t) => t && t.alive && t.side === 'enemy' && isBossToken(game, t));
              detail.timeout = {
                  mode: 'pve',
                  remain,
                  bossAlive
              };
              winner = bossAlive ? 'enemy' : 'ally';
          }
      }
      if (!winner)
          return null;
      const timestampRaw = contextDetail['timestamp'];
      const finishedAt = typeof timestampRaw === 'number' && Number.isFinite(timestampRaw)
          ? timestampRaw
          : undefined;
      return finalizeBattle(game, { winner, reason, detail, finishedAt }, contextDetail);
  }
  // Giảm TTL minion của 1 phe sau khi phe đó kết thúc phase
  function tickMinionTTL(side) {
      // gom những minion hết hạn để xoá sau vòng lặp
      if (!(Game === null || Game === void 0 ? void 0 : Game.tokens))
          return;
      const tokens = Game.tokens;
      const toRemove = [];
      for (const t of tokens) {
          if (!t.alive)
              continue;
          if (t.side !== side)
              continue;
          if (!t.isMinion)
              continue;
          if (!Number.isFinite(t.ttlTurns))
              continue;
          t.ttlTurns -= 1;
          if (t.ttlTurns <= 0)
              toRemove.push(t);
      }
      // xoá ra khỏi tokens để không còn được vẽ/đi lượt
      for (const t of toRemove) {
          t.alive = false;
          const idx = tokens.indexOf(t);
          if (idx >= 0)
              tokens.splice(idx, 1);
      }
  }
  function init() {
      var _a;
      if (!Game)
          return false;
      if (Game._inited)
          return true;
      const doc = docRef !== null && docRef !== void 0 ? docRef : (typeof document !== 'undefined' ? document : null);
      if (!doc)
          return false;
      const root = rootElement !== null && rootElement !== void 0 ? rootElement : null;
      const boardFromRoot = (root && typeof root.querySelector === 'function')
          ? root.querySelector('#board')
          : null;
      const boardFromDocument = typeof doc.querySelector === 'function'
          ? doc.querySelector('#board')
          : typeof doc.getElementById === 'function'
              ? doc.getElementById('board')
              : null;
      const boardEl = (boardFromRoot !== null && boardFromRoot !== void 0 ? boardFromRoot : boardFromDocument);
      if (!boardEl) {
          return false;
      }
      canvas = boardEl;
      ctx = boardEl.getContext('2d');
      if (!ctx) {
          console.warn('[pve] Không thể lấy ngữ cảnh 2D cho canvas PvE.');
          return false;
      }
      if (typeof hudCleanup === 'function') {
          hudCleanup();
          hudCleanup = null;
      }
      hud = initHUD(doc, root !== null && root !== void 0 ? root : undefined);
      hudCleanup = hud ? () => hud.cleanup() : null;
      resize();
      if (Game.grid)
          spawnLeaders(Game.tokens, Game.grid);
      const tokens = Game.tokens || [];
      const sessionVfx = ensureSessionWithVfx(Game, { requireGrid: true });
      if (sessionVfx) {
          for (const t of tokens) {
              if (t.id === 'leaderA' || t.id === 'leaderB') {
                  try {
                      vfxAddSpawn(sessionVfx, t.cx, t.cy, t.side);
                  }
                  catch (_) { }
              }
          }
      }
      for (const t of tokens) {
          if (!t.iid)
              t.iid = nextIid();
          if (t.id === 'leaderA' || t.id === 'leaderB') {
              Object.assign(t, {
                  hpMax: 1600,
                  hp: 1600,
                  arm: 0.12,
                  res: 0.12,
                  atk: 40,
                  wil: 30,
                  aeMax: 0,
                  ae: 0,
              });
              initializeFury(t, t.id, 0);
          }
      }
      for (const t of tokens) {
          if (!t.iid)
              t.iid = nextIid();
      }
      if (hud && Game)
          hud.update(Game);
      scheduleDraw();
      Game._inited = true;
      refillDeck();
      refillDeckEnemy(Game);
      cleanupSummonBar();
      const barHandle = startSummonBar(doc, {
          onPick: (card) => {
              const entry = asDeckEntry(card);
              Game.selectedId = entry.id;
              renderSummonBar();
          },
          canAfford: (card) => {
              const entry = asDeckEntry(card);
              return Game.cost >= getCardCost(entry);
          },
          getDeck: () => ensureDeck(),
          getSelectedId: () => Game.selectedId,
      }, root !== null && root !== void 0 ? root : undefined);
      summonBarHandle = barHandle;
      Game.ui.bar = barHandle;
      selectFirstAffordable();
      renderSummonBar();
      if (canvasClickHandler && canvas) {
          canvas.removeEventListener('click', canvasClickHandler);
          canvasClickHandler = null;
      }
      canvasClickHandler = (ev) => {
          var _a, _b, _c;
          const game = getInitializedGame();
          if (!canvas || !(game === null || game === void 0 ? void 0 : game.grid))
              return;
          const rect = canvas.getBoundingClientRect();
          const p = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
          const cell = hitToCellOblique(game.grid, p.x, p.y, CAM_PRESET);
          if (!cell)
              return;
          if (cell.cx >= CFG.ALLY_COLS)
              return;
          const deck = ensureDeck();
          const card = (_a = deck.find((u) => u.id === game.selectedId)) !== null && _a !== void 0 ? _a : null;
          if (!card)
              return;
          if (cellReserved(tokensAlive(), game.queued, cell.cx, cell.cy))
              return;
          const cardCost = getCardCost(card);
          if (game.cost < cardCost)
              return;
          if (game.summoned >= game.summonLimit)
              return;
          const slot = slotIndex('ally', cell.cx, cell.cy);
          if (game.queued.ally.has(slot))
              return;
          const spawnCycle = predictSpawnCycle(game, 'ally', slot);
          const pendingArt = getUnitArt(card.id);
          const pending = {
              unitId: card.id,
              name: typeof card.name === 'string' ? card.name : null,
              side: 'ally',
              cx: cell.cx,
              cy: cell.cy,
              slot,
              spawnCycle,
              source: 'deck',
              color: ((_b = pendingArt === null || pendingArt === void 0 ? void 0 : pendingArt.palette) === null || _b === void 0 ? void 0 : _b.primary) || '#a9f58c',
              art: pendingArt !== null && pendingArt !== void 0 ? pendingArt : null,
              skinKey: (_c = pendingArt === null || pendingArt === void 0 ? void 0 : pendingArt.skinKey) !== null && _c !== void 0 ? _c : null,
          };
          game.queued.ally.set(slot, pending);
          game.cost = Math.max(0, game.cost - cardCost);
          if (hud && game)
              hud.update(game);
          game.summoned += 1;
          game.usedUnitIds.add(card.id);
          game.deck3 = deck.filter((u) => u.id !== card.id);
          game.selectedId = null;
          refillDeck();
          selectFirstAffordable();
          renderSummonBar();
          scheduleDraw();
      };
      if (canvas && canvasClickHandler) {
          canvas.addEventListener('click', canvasClickHandler);
      }
      if (resizeHandler && winRef && typeof winRef.removeEventListener === 'function') {
          winRef.removeEventListener('resize', resizeHandler);
          resizeHandler = null;
      }
      resizeHandler = () => { scheduleResize(); };
      if (winRef && typeof winRef.addEventListener === 'function' && resizeHandler) {
          winRef.addEventListener('resize', resizeHandler);
      }
      const viewport = (_a = winRef === null || winRef === void 0 ? void 0 : winRef.visualViewport) !== null && _a !== void 0 ? _a : null;
      if (viewport && typeof viewport.addEventListener === 'function') {
          if (visualViewportResizeHandler && typeof viewport.removeEventListener === 'function') {
              viewport.removeEventListener('resize', visualViewportResizeHandler);
          }
          visualViewportResizeHandler = () => { scheduleResize(); };
          viewport.addEventListener('resize', visualViewportResizeHandler);
          if (visualViewportScrollHandler && typeof viewport.removeEventListener === 'function') {
              viewport.removeEventListener('scroll', visualViewportScrollHandler);
          }
          visualViewportScrollHandler = () => { scheduleResize(); };
          viewport.addEventListener('scroll', visualViewportScrollHandler);
      }
      const queryFromRoot = (selector) => {
          if (root && typeof root.querySelector === 'function') {
              const el = root.querySelector(selector);
              if (el)
                  return el;
          }
          return null;
      };
      const updateTimerAndCost = (timestamp) => {
          var _a, _b, _c, _d;
          if (!CLOCK || !Game)
              return;
          if ((_a = Game.battle) === null || _a === void 0 ? void 0 : _a.over)
              return;
          const now = Number.isFinite(timestamp) ? Number(timestamp) : getNow();
          const elapsedSec = Math.floor((now - CLOCK.startMs) / 1000);
          const prevRemain = Number.isFinite(CLOCK.lastTimerRemain) ? CLOCK.lastTimerRemain : 0;
          const remain = Math.max(0, 240 - elapsedSec);
          if (remain !== CLOCK.lastTimerRemain) {
              CLOCK.lastTimerRemain = remain;
              const mm = String(Math.floor(remain / 60)).padStart(2, '0');
              const ss = String(remain % 60).padStart(2, '0');
              const tEl = (queryFromRoot('#timer') || doc.getElementById('timer'));
              if (tEl)
                  tEl.textContent = `${mm}:${ss}`;
          }
          if (remain <= 0 && prevRemain > 0) {
              const timeoutResult = checkBattleEnd(Game, { trigger: 'timeout', remain, timestamp: now });
              if (timeoutResult)
                  return;
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
              if (hud && Game)
                  hud.update(Game);
              if (!Game.selectedId)
                  selectFirstAffordable();
              renderSummonBar();
              aiMaybeAct(Game, 'cost');
          }
          if ((_b = Game.battle) === null || _b === void 0 ? void 0 : _b.over)
              return;
          const busyUntil = (_d = (_c = Game.turn) === null || _c === void 0 ? void 0 : _c.busyUntil) !== null && _d !== void 0 ? _d : 0;
          if (now >= busyUntil && now - CLOCK.lastTurnStepMs >= CLOCK.turnEveryMs) {
              CLOCK.lastTurnStepMs = now;
              stepTurn(Game, {
                  performUlt,
                  processActionChain,
                  allocIid: nextIid,
                  doActionOrSkip,
                  checkBattleEnd,
              });
              cleanupDead(now);
              const postTurnResult = checkBattleEnd(Game, { trigger: 'post-turn', timestamp: now });
              if (postTurnResult) {
                  scheduleDraw();
                  return;
              }
              scheduleDraw();
              aiMaybeAct(Game, 'board');
          }
      };
      const runTickLoop = (timestamp) => {
          tickLoopHandle = null;
          updateTimerAndCost(timestamp);
          if (!running || !CLOCK)
              return;
          scheduleTickLoop();
      };
      function scheduleTickLoop() {
          if (!running || !CLOCK)
              return;
          if (tickLoopHandle !== null)
              return;
          const raf = (winRef && typeof winRef.requestAnimationFrame === 'function')
              ? winRef.requestAnimationFrame.bind(winRef)
              : (typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null);
          if (raf) {
              tickLoopUsesTimeout = false;
              tickLoopHandle = raf(runTickLoop);
          }
          else {
              tickLoopUsesTimeout = true;
              tickLoopHandle = setTimeout(() => runTickLoop(getNow()), 16);
          }
      }
      updateTimerAndCost(getNow());
      scheduleTickLoop();
      return true;
  }
  function selectFirstAffordable() {
      var _a;
      if (!Game)
          return;
      const deck = ensureDeck();
      if (!deck.length) {
          Game.selectedId = null;
          return;
      }
      let cheapestAffordable = null;
      let cheapestAffordableCost = Infinity;
      let cheapestOverall = null;
      let cheapestOverallCost = Infinity;
      for (const card of deck) {
          if (!card)
              continue;
          const cardCost = getCardCost(card);
          if (cardCost < cheapestOverallCost) {
              cheapestOverall = card;
              cheapestOverallCost = cardCost;
          }
          const costForComparison = Number.isFinite(cardCost) ? cardCost : 0;
          const affordable = costForComparison <= Game.cost;
          if (affordable && cardCost < cheapestAffordableCost) {
              cheapestAffordable = card;
              cheapestAffordableCost = cardCost;
          }
      }
      const chosen = (_a = (cheapestAffordable || cheapestOverall)) !== null && _a !== void 0 ? _a : null;
      Game.selectedId = chosen ? chosen.id : null;
  }
  /* ---------- Deck logic ---------- */
  function refillDeck() {
      if (!Game)
          return;
      const deck = ensureDeck();
      const need = HAND_SIZE - deck.length;
      if (need <= 0)
          return;
      const exclude = new Set([
          ...Game.usedUnitIds,
          ...deck.map((u) => u.id)
      ]);
      const roster = ensureRoster();
      const more = pickRandom(roster, exclude).slice(0, need);
      deck.push(...more);
      Game.deck3 = deck;
  }
  /* ---------- Vẽ ---------- */
  function resize() {
      var _a;
      if (!canvas || !Game)
          return; // guard
      const prevGrid = (Game === null || Game === void 0 ? void 0 : Game.grid) ? {
          w: Game.grid.w,
          h: Game.grid.h,
          dpr: Game.grid.dpr,
          cols: Game.grid.cols,
          rows: Game.grid.rows,
          tile: Game.grid.tile
      } : null;
      Game.grid = makeGrid(canvas, CFG.GRID_COLS, CFG.GRID_ROWS);
      if (ctx && Game.grid) {
          const maxDprCfg = (_a = CFG.UI) === null || _a === void 0 ? void 0 : _a.MAX_DPR;
          const maxDpr = Number.isFinite(maxDprCfg) && maxDprCfg > 0 ? maxDprCfg : 3;
          const view = winRef || (typeof window !== 'undefined' ? window : null);
          const viewDprRaw = Number.isFinite(view === null || view === void 0 ? void 0 : view.devicePixelRatio) && ((view === null || view === void 0 ? void 0 : view.devicePixelRatio) || 0) > 0
              ? view.devicePixelRatio
              : 1;
          const fallbackDpr = Math.min(maxDpr, viewDprRaw);
          const gridDpr = Number.isFinite(Game.grid.dpr) && Game.grid.dpr > 0
              ? Math.min(maxDpr, Game.grid.dpr)
              : fallbackDpr;
          const dpr = gridDpr;
          if (typeof ctx.setTransform === 'function') {
              ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          }
          else {
              if (typeof ctx.resetTransform === 'function') {
                  ctx.resetTransform();
              }
              if (typeof ctx.scale === 'function') {
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
      if (gridChanged) {
          hpBarGradientCache.clear();
          invalidateSceneCache();
      }
  }
  function draw() {
      var _a, _b, _c, _d;
      if (!ctx || !canvas || !(Game === null || Game === void 0 ? void 0 : Game.grid))
          return; // guard
      const clearW = (_b = (_a = Game.grid) === null || _a === void 0 ? void 0 : _a.w) !== null && _b !== void 0 ? _b : canvas.width;
      const clearH = (_d = (_c = Game.grid) === null || _c === void 0 ? void 0 : _c.h) !== null && _d !== void 0 ? _d : canvas.height;
      ctx.clearRect(0, 0, clearW, clearH);
      const cache = ensureSceneCache({
          game: Game,
          canvas,
          documentRef: docRef,
          camPreset: CAM_PRESET
      });
      if (cache && cache.canvas) {
          ctx.drawImage(cache.canvas, 0, 0, cache.pixelWidth, cache.pixelHeight, 0, 0, cache.cssWidth, cache.cssHeight);
      }
      else {
          const sceneCfg = CFG.SCENE || {};
          const themeKey = Game.sceneTheme || sceneCfg.CURRENT_THEME || sceneCfg.DEFAULT_THEME;
          const theme = (sceneCfg.THEMES && themeKey) ? sceneCfg.THEMES[themeKey] : null;
          if (Game.grid)
              drawBattlefieldScene(ctx, Game.grid, theme);
          if (Game.grid)
              drawEnvironmentProps(ctx, Game.grid, CAM_PRESET, Game.backgroundKey);
      }
      if (Game.grid) {
          drawGridOblique(ctx, Game.grid, CAM_PRESET);
          drawQueuedOblique(ctx, Game.grid, Game.queued, CAM_PRESET);
          const tokens = Game.tokens || [];
          drawTokensOblique(ctx, Game.grid, tokens, CAM_PRESET);
      }
      vfxDraw(ctx, Game, CAM_PRESET);
      drawHPBars();
  }
  function cellCenterObliqueLocal(g, cx, cy, C) {
      var _a, _b, _c;
      const colsW = g.tile * g.cols;
      const topScale = ((_a = (C === null || C === void 0 ? void 0 : C.topScale)) !== null && _a !== void 0 ? _a : 0.80);
      const rowGap = ((_b = (C === null || C === void 0 ? void 0 : C.rowGapRatio)) !== null && _b !== void 0 ? _b : 0.62) * g.tile;
      function rowLR(r) {
          const pinch = (1 - topScale) * colsW;
          const t = r / g.rows;
          const width = colsW - pinch * (1 - t);
          const left = g.ox + (colsW - width) / 2;
          const right = left + width;
          return { left, right };
      }
      const yTop = g.oy + cy * rowGap;
      const yBot = yTop + rowGap;
      const LRt = rowLR(cy);
      const LRb = rowLR(cy + 1);
      const xtL = LRt.left + (cx / g.cols) * (LRt.right - LRt.left);
      const xtR = LRt.left + ((cx + 1) / g.cols) * (LRt.right - LRt.left);
      const xbL = LRb.left + (cx / g.cols) * (LRb.right - LRb.left);
      const xbR = LRb.left + ((cx + 1) / g.cols) * (LRb.right - LRb.left);
      const x = (xtL + xtR + xbL + xbR) / 4;
      const y = (yTop + yBot) / 2;
      const k = ((_c = (C === null || C === void 0 ? void 0 : C.depthScale)) !== null && _c !== void 0 ? _c : 0.94);
      const scale = Math.pow(k, g.rows - 1 - cy);
      return { x, y, scale };
  }
  function roundedRectPathUI(ctx, x, y, w, h, radius) {
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
  function lightenColor(color, amount) {
      if (typeof color !== 'string')
          return color;
      if (!color.startsWith('#'))
          return color;
      let hex = color.slice(1);
      if (hex.length === 3) {
          hex = hex.split('').map(ch => ch + ch).join('');
      }
      if (hex.length !== 6)
          return color;
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const mix = (c) => Math.min(255, Math.round(c + (255 - c) * amount));
      return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  }
  function normalizeHpBarCacheKey(fillColor, innerHeight, innerRadius, startY) {
      const color = typeof fillColor === 'string' ? fillColor.trim().toLowerCase() : String(fillColor !== null && fillColor !== void 0 ? fillColor : '');
      const height = Number.isFinite(innerHeight) ? Math.max(0, Math.round(innerHeight)) : 0;
      const radius = Number.isFinite(innerRadius) ? Math.max(0, Math.round(innerRadius)) : 0;
      const start = Number.isFinite(startY) ? Math.round(startY * 100) / 100 : 0;
      return `${color}|h:${height}|r:${radius}|y:${start}`;
  }
  function ensureHpBarGradient(fillColor, innerHeight, innerRadius, startY, x) {
      const key = normalizeHpBarCacheKey(fillColor, innerHeight, innerRadius, startY);
      const cached = hpBarGradientCache.get(key);
      if (cached)
          return cached;
      if (!ctx || !Number.isFinite(innerHeight) || innerHeight <= 0) {
          hpBarGradientCache.set(key, fillColor);
          return fillColor;
      }
      const startYSafe = Number.isFinite(startY) ? startY : 0;
      const gradient = ctx.createLinearGradient(x, startYSafe, x, startYSafe + innerHeight);
      if (!gradient) {
          hpBarGradientCache.set(key, fillColor);
          return fillColor;
      }
      const topFill = lightenColor(fillColor, 0.25);
      gradient.addColorStop(0, topFill);
      gradient.addColorStop(1, fillColor);
      hpBarGradientCache.set(key, gradient);
      return gradient;
  }
  function drawHPBars() {
      var _a, _b, _c, _d, _e, _f;
      if (!ctx || !(Game === null || Game === void 0 ? void 0 : Game.grid))
          return;
      const baseR = Math.floor(Game.grid.tile * 0.36);
      const tokens = Game.tokens || [];
      for (const t of tokens) {
          if (!t.alive || !Number.isFinite(t.hpMax))
              continue;
          const p = cellCenterObliqueLocal(Game.grid, t.cx, t.cy, CAM_PRESET);
          const art = t.art || getUnitArt(t.id, { skinKey: t.skinKey });
          const layout = (art === null || art === void 0 ? void 0 : art.layout) || {};
          const r = Math.max(6, Math.floor(baseR * (p.scale || 1)));
          const widthRatio = (_a = parseFiniteNumber(layout.hpWidth)) !== null && _a !== void 0 ? _a : 2.4;
          const heightRatio = (_b = parseFiniteNumber(layout.hpHeight)) !== null && _b !== void 0 ? _b : 0.42;
          const offsetRatio = (_c = parseFiniteNumber(layout.hpOffset)) !== null && _c !== void 0 ? _c : 1.46;
          const barWidth = Math.max(28, Math.floor(r * widthRatio));
          const barHeight = Math.max(5, Math.floor(r * heightRatio));
          const offset = offsetRatio;
          const x = Math.round(p.x - barWidth / 2);
          const y = Math.round(p.y + r * offset - barHeight / 2);
          const ratio = Math.max(0, Math.min(1, (t.hp || 0) / (t.hpMax || 1)));
          const bgColor = ((_d = art === null || art === void 0 ? void 0 : art.hpBar) === null || _d === void 0 ? void 0 : _d.bg) || 'rgba(9,14,21,0.74)';
          const fillColor = ((_e = art === null || art === void 0 ? void 0 : art.hpBar) === null || _e === void 0 ? void 0 : _e.fill) || '#6ff0c0';
          const borderColor = ((_f = art === null || art === void 0 ? void 0 : art.hpBar) === null || _f === void 0 ? void 0 : _f.border) || 'rgba(0,0,0,0.55)';
          const radius = Math.max(2, Math.floor(barHeight / 2));
          ctx.save();
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          roundedRectPathUI(ctx, x, y, barWidth, barHeight, radius);
          ctx.fillStyle = bgColor;
          ctx.fill();
          if (borderColor && borderColor !== 'none') {
              ctx.strokeStyle = borderColor;
              ctx.lineWidth = Math.max(1, Math.floor(barHeight * 0.18));
              ctx.stroke();
          }
          const inset = Math.max(1, Math.floor(barHeight * 0.25));
          const innerHeight = Math.max(1, barHeight - inset * 2);
          const innerRadius = Math.max(1, radius - inset);
          const innerWidth = Math.max(0, barWidth - inset * 2);
          const filledWidth = Math.round(innerWidth * ratio);
          if (filledWidth > 0) {
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
  function handleVisibilityChange() {
      if (!docRef)
          return;
      setDrawPaused(!!docRef.hidden);
  }
  function bindVisibility() {
      if (visibilityHandlerBound)
          return;
      const doc = docRef;
      if (!doc || typeof doc.addEventListener !== 'function')
          return;
      doc.addEventListener('visibilitychange', handleVisibilityChange);
      visibilityHandlerBound = true;
  }
  function unbindVisibility() {
      if (!visibilityHandlerBound)
          return;
      const doc = docRef;
      if (doc && typeof doc.removeEventListener === 'function') {
          doc.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      visibilityHandlerBound = false;
  }
  function configureRoot(root) {
      var _a;
      rootElement = root || null;
      if (rootElement && rootElement.ownerDocument) {
          docRef = rootElement.ownerDocument;
      }
      else if (rootElement && rootElement.nodeType === 9) {
          docRef = rootElement;
      }
      else {
          docRef = typeof document !== 'undefined' ? document : null;
      }
      winRef = (_a = docRef === null || docRef === void 0 ? void 0 : docRef.defaultView) !== null && _a !== void 0 ? _a : (typeof window !== 'undefined' ? window : null);
  }
  function clearSessionTimers() {
      if (tickLoopHandle !== null) {
          if (tickLoopUsesTimeout) {
              clearTimeout(tickLoopHandle);
          }
          else {
              const cancel = (winRef && typeof winRef.cancelAnimationFrame === 'function')
                  ? winRef.cancelAnimationFrame.bind(winRef)
                  : (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : null);
              if (cancel) {
                  cancel(tickLoopHandle);
              }
          }
          tickLoopHandle = null;
          tickLoopUsesTimeout = false;
      }
      cancelScheduledDraw();
      cancelScheduledResize();
  }
  function clearSessionListeners() {
      if (canvas && canvasClickHandler && typeof canvas.removeEventListener === 'function') {
          canvas.removeEventListener('click', canvasClickHandler);
      }
      canvasClickHandler = null;
      if (typeof hudCleanup === 'function') {
          hudCleanup();
      }
      hudCleanup = null;
      if (resizeHandler && winRef && typeof winRef.removeEventListener === 'function') {
          winRef.removeEventListener('resize', resizeHandler);
      }
      resizeHandler = null;
      const viewport = winRef === null || winRef === void 0 ? void 0 : winRef.visualViewport;
      if (viewport && typeof viewport.removeEventListener === 'function') {
          if (visualViewportResizeHandler) {
              viewport.removeEventListener('resize', visualViewportResizeHandler);
          }
          if (visualViewportScrollHandler) {
              viewport.removeEventListener('scroll', visualViewportScrollHandler);
          }
      }
      visualViewportResizeHandler = null;
      visualViewportScrollHandler = null;
      cancelScheduledResize();
      unbindArtSpriteListener();
      unbindVisibility();
  }
  function resetDomRefs() {
      canvas = null;
      ctx = null;
      hud = null;
      hudCleanup = null;
      hpBarGradientCache.clear();
      invalidateSceneCache();
  }
  function stopSession() {
      var _a, _b, _c, _d, _e, _f;
      clearSessionTimers();
      clearSessionListeners();
      cleanupSummonBar();
      if (Game) {
          if ((_b = (_a = Game.queued) === null || _a === void 0 ? void 0 : _a.ally) === null || _b === void 0 ? void 0 : _b.clear)
              Game.queued.ally.clear();
          if ((_d = (_c = Game.queued) === null || _c === void 0 ? void 0 : _c.enemy) === null || _d === void 0 ? void 0 : _d.clear)
              Game.queued.enemy.clear();
          if (Array.isArray(Game.tokens))
              Game.tokens.length = 0;
          if (Array.isArray(Game.deck3))
              Game.deck3.length = 0;
          if ((_e = Game.usedUnitIds) === null || _e === void 0 ? void 0 : _e.clear)
              Game.usedUnitIds.clear();
          if (Game.ai) {
              Game.ai.deck = Array.isArray(Game.ai.deck) ? [] : Game.ai.deck;
              if ((_f = Game.ai.usedUnitIds) === null || _f === void 0 ? void 0 : _f.clear)
                  Game.ai.usedUnitIds.clear();
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
  function bindSession() {
      bindArtSpriteListener();
      bindVisibility();
      if (docRef) {
          setDrawPaused(!!docRef.hidden);
      }
      else {
          setDrawPaused(false);
      }
  }
  function startSession(config = {}) {
      configureRoot(rootElement);
      const overrides = normalizeConfig(toStartConfigOverrides(config));
      if (running)
          stopSession();
      resetSessionState(overrides);
      resetDomRefs();
      running = true;
      try {
          const initialised = init();
          if (!initialised) {
              stopSession();
              return null;
          }
          if (!Game || !Game._inited) {
              throw new Error('Unable to initialise PvE session');
          }
          bindSession();
          return Game;
      }
      catch (err) {
          running = false;
          stopSession();
          throw err;
      }
  }
  function applyConfigToRunningGame(cfg) {
      if (!Game)
          return;
      let sceneChanged = false;
      if (typeof cfg.sceneTheme !== 'undefined') {
          if (Game.sceneTheme !== cfg.sceneTheme)
              sceneChanged = true;
          Game.sceneTheme = cfg.sceneTheme;
      }
      if (typeof cfg.backgroundKey !== 'undefined') {
          if (Game.backgroundKey !== cfg.backgroundKey) {
              sceneChanged = true;
              clearBackgroundSignatureCache();
          }
          Game.backgroundKey = cfg.backgroundKey;
      }
      if (typeof cfg.modeKey !== 'undefined') {
          Game.modeKey = typeof cfg.modeKey === 'string' ? cfg.modeKey : (cfg.modeKey || null);
      }
      if (Array.isArray(cfg.deck) && cfg.deck.length) {
          const deck = normalizeDeckEntries(cfg.deck);
          if (deck.length)
              Game.unitsAll = deck;
      }
      if (cfg.aiPreset) {
          const preset = cfg.aiPreset || {};
          if (Array.isArray(preset.deck) && preset.deck.length) {
              const enemyDeck = normalizeDeckEntries(preset.deck);
              if (enemyDeck.length)
                  Game.ai.unitsAll = enemyDeck;
          }
          else if (Array.isArray(preset.unitsAll) && preset.unitsAll.length) {
              const enemyPool = normalizeDeckEntries(preset.unitsAll);
              if (enemyPool.length)
                  Game.ai.unitsAll = enemyPool;
          }
          if (Number.isFinite(preset.costCap))
              Game.ai.costCap = preset.costCap;
          if (Number.isFinite(preset.summonLimit))
              Game.ai.summonLimit = preset.summonLimit;
      }
      if (sceneChanged) {
          invalidateSceneCache();
          scheduleDraw();
      }
  }
  function updateSessionConfig(next = {}) {
      const normalized = normalizeConfig(toStartConfigOverrides(next));
      storedConfig = normalizeConfig({ ...storedConfig, ...normalized });
      applyConfigToRunningGame(normalized);
  }
  function createPveSession(rootEl, options = null) {
      var _a;
      const initial = sanitizeStartConfig(options);
      const normalized = normalizeConfig(initial.rest);
      storedConfig = { ...normalized };
      configureRoot((_a = (rootEl !== null && rootEl !== void 0 ? rootEl : initial.root)) !== null && _a !== void 0 ? _a : null);
      const handle = {
          start(startConfig = null) {
              const { rest, root } = sanitizeStartConfig(startConfig);
              if (root)
                  configureRoot(root);
              return startSession(rest);
          },
          stop() {
              stopSession();
          },
          updateConfig(next = null) {
              updateSessionConfig(next);
          },
          setUnitSkin(unitId, skinKey) {
              return setUnitSkinForSession(unitId, skinKey);
          },
      };
      return handle;
  }
  function __getStoredConfig() {
      return { ...storedConfig };
  }
  function __getActiveGame() {
      return Game;
  }
  const __reexport0 = __require('./events.ts');
  const __reexport1 = __require('./modes/pve/session-state.ts');

  if (!Object.prototype.hasOwnProperty.call(exports, 'gameEvents')) exports.gameEvents = __reexport0.gameEvents;
  if (!Object.prototype.hasOwnProperty.call(exports, 'emitGameEvent')) exports.emitGameEvent = __reexport0.emitGameEvent;
  if (!Object.prototype.hasOwnProperty.call(exports, 'TURN_START')) exports.TURN_START = __reexport0.TURN_START;
  if (!Object.prototype.hasOwnProperty.call(exports, 'TURN_END')) exports.TURN_END = __reexport0.TURN_END;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ACTION_START')) exports.ACTION_START = __reexport0.ACTION_START;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ACTION_END')) exports.ACTION_END = __reexport0.ACTION_END;
  if (!Object.prototype.hasOwnProperty.call(exports, 'TURN_REGEN')) exports.TURN_REGEN = __reexport0.TURN_REGEN;
  if (!Object.prototype.hasOwnProperty.call(exports, 'BATTLE_END')) exports.BATTLE_END = __reexport0.BATTLE_END;
  if (!Object.prototype.hasOwnProperty.call(exports, 'clearBackgroundSignatureCache')) exports.clearBackgroundSignatureCache = __reexport1.clearBackgroundSignatureCache;
  if (!Object.prototype.hasOwnProperty.call(exports, 'computeBackgroundSignature')) exports.computeBackgroundSignature = __reexport1.computeBackgroundSignature;
  if (!Object.prototype.hasOwnProperty.call(exports, '__backgroundSignatureCache')) exports.__backgroundSignatureCache = __reexport1.__backgroundSignatureCache;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createPveSession')) exports.createPveSession = createPveSession;
  if (!Object.prototype.hasOwnProperty.call(exports, '__getStoredConfig')) exports.__getStoredConfig = __getStoredConfig;
  if (!Object.prototype.hasOwnProperty.call(exports, '__getActiveGame')) exports.__getActiveGame = __getActiveGame;
});
__define('./modes/pve/session-runtime.ts', (exports, module, __require) => {
  const __dep0 = __require('./events.ts');
  const gameEvents = __dep0.gameEvents;
  const emitGameEvent = __dep0.emitGameEvent;
  const TURN_START = __dep0.TURN_START;
  const TURN_END = __dep0.TURN_END;
  const ACTION_START = __dep0.ACTION_START;
  const ACTION_END = __dep0.ACTION_END;
  const TURN_REGEN = __dep0.TURN_REGEN;
  const BATTLE_END = __dep0.BATTLE_END;
  const addGameEventListener = __dep0.addGameEventListener;
  const __dep1 = __require('./modes/pve/session-runtime-impl.ts');
  const createPveSessionImpl = __dep1.createPveSession;
  const __getStoredConfig = __dep1.__getStoredConfig;
  const __getActiveGame = __dep1.__getActiveGame;
  function isReward(entry) {
      return Boolean(entry && typeof entry.id === 'string');
  }
  function normalizeRewardList(value) {
      if (!Array.isArray(value))
          return [];
      return value.filter(isReward);
  }
  function ensureRewardQueue(runtime) {
      if (Array.isArray(runtime.rewardQueue)) {
          runtime.rewardQueue = runtime.rewardQueue.filter(isReward);
      }
      else {
          runtime.rewardQueue = [];
      }
      return runtime.rewardQueue;
  }
  function ensurePendingRewards(encounter) {
      if (Array.isArray(encounter.pendingRewards)) {
          encounter.pendingRewards = encounter.pendingRewards.filter(isReward);
      }
      else {
          encounter.pendingRewards = [];
      }
      return encounter.pendingRewards;
  }
  function mergeRewards(existing, additions) {
      if (!existing.length && !additions.length)
          return [];
      if (!additions.length)
          return existing.slice();
      const map = new Map();
      for (const reward of existing) {
          map.set(reward.id, reward);
      }
      for (const reward of additions) {
          if (map.has(reward.id)) {
              map.delete(reward.id);
          }
          map.set(reward.id, reward);
      }
      return Array.from(map.values());
  }
  function updateRuntimeRewards(runtime, additions) {
      const queue = ensureRewardQueue(runtime);
      const merged = mergeRewards(queue, additions);
      runtime.rewardQueue = merged;
      return merged;
  }
  function updateEncounterRewards(encounter, additions) {
      const pending = ensurePendingRewards(encounter);
      const merged = mergeRewards(pending, additions);
      encounter.pendingRewards = merged;
      return merged;
  }
  function toWaveList(value) {
      if (!Array.isArray(value))
          return [];
      return value.filter((wave) => Boolean(wave));
  }
  function getTurnSnapshot(session) {
      const turn = session === null || session === void 0 ? void 0 : session.turn;
      return turn !== null && turn !== void 0 ? turn : null;
  }
  function advanceSession(session) {
      var _a;
      const runtime = session === null || session === void 0 ? void 0 : session.runtime;
      if (!runtime)
          return null;
      const encounter = runtime.encounter;
      if (!encounter) {
          runtime.wave = null;
          return null;
      }
      ensureRewardQueue(runtime);
      ensurePendingRewards(encounter);
      const waves = toWaveList(encounter.waves);
      const index = Math.max(0, encounter.waveIndex | 0);
      const wave = (_a = waves[index]) !== null && _a !== void 0 ? _a : null;
      if (!wave) {
          encounter.status = 'completed';
          runtime.wave = null;
          return encounter;
      }
      switch (wave.status) {
          case 'pending':
              wave.status = 'spawning';
              runtime.wave = wave;
              if (encounter.status === 'idle')
                  encounter.status = 'running';
              break;
          case 'spawning':
              wave.status = 'active';
              runtime.wave = wave;
              encounter.status = 'running';
              break;
          case 'active': {
              wave.status = 'cleared';
              runtime.wave = null;
              encounter.waveIndex = index + 1;
              const rewards = normalizeRewardList(wave.rewards);
              if (rewards.length) {
                  updateEncounterRewards(encounter, rewards);
                  updateRuntimeRewards(runtime, rewards);
              }
              break;
          }
          case 'cleared':
              runtime.wave = null;
              encounter.waveIndex = index + 1;
              break;
          default:
              runtime.wave = null;
              break;
      }
      if (encounter.waveIndex >= waves.length) {
          encounter.status = 'completed';
          runtime.wave = null;
      }
      const currentTurn = getTurnSnapshot(session);
      void currentTurn;
      return encounter;
  }
  function applyReward(session, reward) {
      if (!(session === null || session === void 0 ? void 0 : session.runtime))
          return null;
      if (!isReward(reward))
          return null;
      const runtime = session.runtime;
      const queue = ensureRewardQueue(runtime);
      runtime.rewardQueue = queue.filter((entry) => entry.id !== reward.id);
      const encounter = runtime.encounter;
      if (encounter) {
          const pending = ensurePendingRewards(encounter);
          encounter.pendingRewards = pending.filter((entry) => entry.id !== reward.id);
      }
      return reward;
  }
  function onSessionEvent(type, handler) {
      if (!type || typeof handler !== 'function') {
          return () => { };
      }
      return addGameEventListener(type, handler);
  }
  function createPveSession(rootEl, options = {}) {
      const controller = createPveSessionImpl(rootEl, options);
      return {
          ...controller,
          onEvent: onSessionEvent,
      };
  }
  exports.__getStoredConfig = __getStoredConfig;
  exports.__getActiveGame = __getActiveGame;
  exports.gameEvents = gameEvents;
  exports.emitGameEvent = emitGameEvent;
  exports.TURN_START = TURN_START;
  exports.TURN_END = TURN_END;
  exports.ACTION_START = ACTION_START;
  exports.ACTION_END = ACTION_END;
  exports.TURN_REGEN = TURN_REGEN;
  exports.BATTLE_END = BATTLE_END;

  if (!Object.prototype.hasOwnProperty.call(exports, 'advanceSession')) exports.advanceSession = advanceSession;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyReward')) exports.applyReward = applyReward;
  if (!Object.prototype.hasOwnProperty.call(exports, 'onSessionEvent')) exports.onSessionEvent = onSessionEvent;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createPveSession')) exports.createPveSession = createPveSession;
});
__define('./modes/pve/session-state.ts', (exports, module, __require) => {
  const __dep0 = __require('./../types/@shared-types/units.d.ts');
  const createSummonQueue = __dep0.createSummonQueue;
  const __dep1 = __require('./config.ts');
  const CFG = __dep1.CFG;
  const __dep2 = __require('./units.ts');
  const UNITS = __dep2.UNITS;
  const lookupUnit = __dep2.lookupUnit;
  const __dep3 = __require('./meta.ts');
  const metaServiceAdapter = __dep3.metaServiceAdapter;
  const __dep4 = __require('./events.ts');
  const gameEvents = __dep4.gameEvents;
  const __dep5 = __require('./background.ts');
  const getEnvironmentBackground = __dep5.getEnvironmentBackground;
  const drawEnvironmentProps = __dep5.drawEnvironmentProps;
  const __dep6 = __require('./scene.ts');
  const getCachedBattlefieldScene = __dep6.getCachedBattlefieldScene;
  const __dep7 = __require('./statuses.ts');
  const Statuses = __dep7.Statuses;
  const __dep8 = __require('./art.ts');
  const getUnitArt = __dep8.getUnitArt;
  const __dep9 = __require('./utils/unit-id.ts');
  const normalizeUnitId = __dep9.normalizeUnitId;
  void Statuses;
  const DEFAULT_UNIT_ROSTER = UNITS.map((unit) => {
      var _a;
      const unitId = normalizeUnitId(unit.id);
      const art = getUnitArt(unitId);
      return {
          id: unitId,
          name: unit.name,
          cost: Number.isFinite(unit.cost) ? unit.cost : null,
          art,
          skinKey: (_a = art === null || art === void 0 ? void 0 : art.skinKey) !== null && _a !== void 0 ? _a : null,
      };
  });
  function getSceneConfig(cfg) {
      if (!cfg || typeof cfg !== 'object')
          return null;
      const sceneCandidate = cfg.SCENE;
      if (!sceneCandidate || typeof sceneCandidate !== 'object')
          return null;
      const scene = sceneCandidate;
      if (typeof scene.DEFAULT_THEME !== 'string' || typeof scene.CURRENT_THEME !== 'string')
          return null;
      if (!scene.THEMES || typeof scene.THEMES !== 'object')
          return null;
      return scene;
  }
  function getTurnOrderMode(cfg) {
      var _a;
      const rawMode = (_a = cfg.turnOrder.mode) !== null && _a !== void 0 ? _a : null;
      return typeof rawMode === 'string' ? rawMode : null;
  }
  function buildQueuedSummonState() {
      return {
          ally: createSummonQueue(),
          enemy: createSummonQueue(),
      };
  }
  function buildAiState(params) {
      const { preset, unitsAll, defaultCostCap, defaultSummonLimit } = params;
      const costCapCandidate = preset === null || preset === void 0 ? void 0 : preset.costCap;
      const summonLimitCandidate = preset === null || preset === void 0 ? void 0 : preset.summonLimit;
      const startingDeck = Array.isArray(preset === null || preset === void 0 ? void 0 : preset.startingDeck) ? preset.startingDeck : null;
      const costCap = Number.isFinite(costCapCandidate)
          ? Number(costCapCandidate)
          : typeof costCapCandidate === 'number'
              ? costCapCandidate
              : defaultCostCap;
      const summonLimit = Number.isFinite(summonLimitCandidate)
          ? Number(summonLimitCandidate)
          : typeof summonLimitCandidate === 'number'
              ? summonLimitCandidate
              : defaultSummonLimit;
      return {
          cost: 0,
          costCap,
          summoned: 0,
          summonLimit,
          unitsAll,
          usedUnitIds: new Set(),
          deck: startingDeck ? [...startingDeck] : [],
          selectedId: null,
          lastThinkMs: 0,
          lastDecision: null,
      };
  }
  function buildBaseState(params) {
      return {
          modeKey: params.modeKey,
          grid: null,
          tokens: [],
          cost: 0,
          costCap: params.costCap,
          summoned: 0,
          summonLimit: params.summonLimit,
          unitsAll: params.allyUnits,
          usedUnitIds: new Set(),
          deck3: [],
          selectedId: null,
          ui: { bar: null },
          turn: params.turn,
          queued: buildQueuedSummonState(),
          actionChain: [],
          events: gameEvents,
          sceneTheme: params.sceneTheme,
          backgroundKey: params.backgroundKey,
          battle: {
              over: false,
              winner: null,
              reason: null,
              detail: null,
              finishedAt: 0,
              result: null,
          },
          result: null,
          ai: params.ai,
          meta: metaServiceAdapter,
          runtime: {
              encounter: null,
              wave: null,
              rewardQueue: [],
          },
      };
  }
  const backgroundSignatureCache = new Map();
  let sceneCache = null;
  function stableStringify(value, seen = new WeakSet()) {
      if (value === null)
          return 'null';
      const type = typeof value;
      if (type === 'undefined')
          return 'undefined';
      if (type === 'number' || type === 'boolean' || type === 'bigint')
          return String(value);
      if (type === 'string')
          return JSON.stringify(value);
      if (type === 'symbol')
          return value.toString();
      if (type === 'function')
          return `[Function:${value.name || 'anonymous'}]`;
      if (Array.isArray(value)) {
          return `[${value.map((entry) => stableStringify(entry, seen)).join(',')}]`;
      }
      if (type === 'object') {
          const objectValue = value;
          if (seen.has(objectValue))
              return '"[Circular]"';
          seen.add(objectValue);
          const keys = Object.keys(objectValue).sort();
          const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key], seen)}`);
          seen.delete(objectValue);
          return `{${entries.join(',')}}`;
      }
      return String(value);
  }
  function normalizeBackgroundCacheKey(backgroundKey) {
      return `key:${backgroundKey !== null && backgroundKey !== void 0 ? backgroundKey : '__no-key__'}`;
  }
  function clearBackgroundSignatureCache() {
      backgroundSignatureCache.clear();
  }
  function computeBackgroundSignature(backgroundKey) {
      var _a, _b;
      const cacheKey = normalizeBackgroundCacheKey(backgroundKey);
      const config = getEnvironmentBackground(backgroundKey);
      if (!config) {
          backgroundSignatureCache.delete(cacheKey);
          return `${backgroundKey || 'no-key'}:no-config`;
      }
      const cached = backgroundSignatureCache.get(cacheKey);
      if (cached && cached.config === config) {
          return cached.signature;
      }
      let signature;
      try {
          signature = `${backgroundKey || 'no-key'}:${stableStringify(config)}`;
      }
      catch (_) {
          const keyPart = (_a = config === null || config === void 0 ? void 0 : config.key) !== null && _a !== void 0 ? _a : '';
          const themePart = (_b = config === null || config === void 0 ? void 0 : config.theme) !== null && _b !== void 0 ? _b : '';
          const propsLength = Array.isArray(config === null || config === void 0 ? void 0 : config.props)
              ? (config.props.length)
              : 0;
          signature = `${backgroundKey || 'no-key'}:fallback:${String(keyPart)}:${String(themePart)}:${propsLength}`;
      }
      backgroundSignatureCache.set(cacheKey, { config, signature });
      return signature;
  }
  function normalizeConfig(input = {}) {
      const { scene, ...rest } = input;
      const out = { ...rest };
      const sceneConfig = scene !== null && scene !== void 0 ? scene : {};
      if (typeof out.sceneTheme === 'undefined' && typeof sceneConfig.theme === 'string') {
          out.sceneTheme = sceneConfig.theme;
      }
      if (typeof out.backgroundKey === 'undefined') {
          if (typeof sceneConfig.backgroundKey === 'string')
              out.backgroundKey = sceneConfig.backgroundKey;
          else if (typeof sceneConfig.background === 'string')
              out.backgroundKey = sceneConfig.background;
      }
      if (Array.isArray(out.deck)) {
          out.deck = normalizeDeckEntries(out.deck);
      }
      if (out.aiPreset) {
          const preset = { ...out.aiPreset };
          if (Array.isArray(preset.deck))
              preset.deck = normalizeDeckEntries(preset.deck);
          if (Array.isArray(preset.unitsAll))
              preset.unitsAll = normalizeDeckEntries(preset.unitsAll);
          out.aiPreset = preset;
      }
      return out;
  }
  function isTurnOrderSide(value) {
      return value === 'ally' || value === 'enemy';
  }
  function isPairScanTuple(entry) {
      return entry.length === 2 && typeof entry[0] === 'string' && Number.isFinite(entry[1]);
  }
  function hasSlotKey(value) {
      return 'slot' in value || 's' in value || 'index' in value;
  }
  function isPairScanObject(entry) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry))
          return false;
      const candidate = entry;
      return hasSlotKey(candidate);
  }
  function isPairScanObjectWithSide(entry) {
      if (!isPairScanObject(entry))
          return false;
      const candidate = entry;
      return typeof candidate.side === 'string';
  }
  function isPairScanObjectWithoutSide(entry) {
      if (!isPairScanObject(entry))
          return false;
      const candidate = entry;
      return typeof candidate.side !== 'string';
  }
  function parseSlotValue(entry) {
      var _a, _b;
      const raw = (_b = (_a = entry.slot) !== null && _a !== void 0 ? _a : entry.s) !== null && _b !== void 0 ? _b : entry.index;
      if (typeof raw === 'number' && Number.isFinite(raw))
          return raw;
      if (typeof raw === 'string') {
          const parsed = Number(raw);
          return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
  }
  function clampTurnOrderSlot(slot) {
      const rounded = Math.round(slot);
      return Math.max(1, Math.min(9, rounded));
  }
  function normalizePairScanEntry(entry, sides) {
      const normalized = [];
      const pushPair = (side, slot) => {
          normalized.push({ side, slot: clampTurnOrderSlot(slot) });
      };
      const pushForSides = (slot, targetSides) => {
          const resolvedSides = targetSides && targetSides.length ? targetSides : sides;
          for (const side of resolvedSides) {
              pushPair(side, slot);
          }
      };
      if (typeof entry === 'number') {
          if (Number.isFinite(entry))
              pushForSides(entry);
          return normalized;
      }
      if (Array.isArray(entry)) {
          if (isPairScanTuple(entry)) {
              const [, slot] = entry;
              const side = entry[0] === 'enemy' ? 'enemy' : 'ally';
              pushPair(side, slot);
              return normalized;
          }
          for (const value of entry) {
              if (typeof value === 'number' && Number.isFinite(value))
                  pushForSides(value);
          }
          return normalized;
      }
      if (isPairScanObjectWithSide(entry)) {
          const slot = parseSlotValue(entry);
          if (slot !== null) {
              const side = entry.side === 'enemy' ? 'enemy' : 'ally';
              pushPair(side, slot);
          }
          return normalized;
      }
      if (isPairScanObjectWithoutSide(entry)) {
          const slot = parseSlotValue(entry);
          if (slot !== null)
              pushForSides(slot);
      }
      return normalized;
  }
  function buildTurnOrder() {
      const cfg = CFG.turnOrder;
      const rawSides = Array.isArray(cfg.sides) ? cfg.sides : null;
      const sides = rawSides && rawSides.length
          ? rawSides.filter((side) => isTurnOrderSide(side))
          : ['ally', 'enemy'];
      const order = [];
      const scan = Array.isArray(cfg.pairScan) ? [...cfg.pairScan] : [];
      for (const entry of scan) {
          const normalized = normalizePairScanEntry(entry, sides);
          if (normalized.length)
              order.push(...normalized);
      }
      if (!order.length) {
          const fallback = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          for (const slot of fallback) {
              order.push(...normalizePairScanEntry(slot, sides));
          }
      }
      const indexMap = new Map();
      order.forEach((entry, idx) => {
          const key = `${entry.side}:${entry.slot}`;
          if (!indexMap.has(key))
              indexMap.set(key, idx);
      });
      return { order, indexMap };
  }
  function createSession(options = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
      const normalized = normalizeConfig(options);
      const modeKey = typeof normalized.modeKey === 'string' ? normalized.modeKey : null;
      const sceneCfg = getSceneConfig(CFG);
      const sceneTheme = (_c = (_b = (_a = normalized.sceneTheme) !== null && _a !== void 0 ? _a : sceneCfg === null || sceneCfg === void 0 ? void 0 : sceneCfg.CURRENT_THEME) !== null && _b !== void 0 ? _b : sceneCfg === null || sceneCfg === void 0 ? void 0 : sceneCfg.DEFAULT_THEME) !== null && _c !== void 0 ? _c : null;
      const backgroundKey = (_h = (_g = (_f = (_e = (_d = normalized.backgroundKey) !== null && _d !== void 0 ? _d : CFG.CURRENT_BACKGROUND) !== null && _e !== void 0 ? _e : sceneCfg === null || sceneCfg === void 0 ? void 0 : sceneCfg.CURRENT_BACKGROUND) !== null && _f !== void 0 ? _f : sceneCfg === null || sceneCfg === void 0 ? void 0 : sceneCfg.CURRENT_THEME) !== null && _g !== void 0 ? _g : sceneCfg === null || sceneCfg === void 0 ? void 0 : sceneCfg.DEFAULT_THEME) !== null && _h !== void 0 ? _h : null;
      const allyUnits = Array.isArray(normalized.deck) && normalized.deck.length
          ? Array.from(normalized.deck)
          : Array.from(DEFAULT_UNIT_ROSTER);
      const enemyPreset = (_j = normalized.aiPreset) !== null && _j !== void 0 ? _j : null;
      const enemyUnits = Array.isArray(enemyPreset === null || enemyPreset === void 0 ? void 0 : enemyPreset.deck) && enemyPreset.deck.length
          ? Array.from(enemyPreset.deck)
          : Array.isArray(enemyPreset === null || enemyPreset === void 0 ? void 0 : enemyPreset.unitsAll) && enemyPreset.unitsAll.length
              ? Array.from(enemyPreset.unitsAll)
              : Array.from(DEFAULT_UNIT_ROSTER);
      const requestedTurnMode = (_q = (_o = (_m = (_k = normalized.turnMode) !== null && _k !== void 0 ? _k : (_l = normalized.turn) === null || _l === void 0 ? void 0 : _l.mode) !== null && _m !== void 0 ? _m : normalized.turnOrderMode) !== null && _o !== void 0 ? _o : (_p = normalized.turnOrder) === null || _p === void 0 ? void 0 : _p.mode) !== null && _q !== void 0 ? _q : getTurnOrderMode(CFG);
      const useInterleaved = requestedTurnMode === 'interleaved_by_position';
      const allyColsRaw = CFG.ALLY_COLS;
      const gridRowsRaw = CFG.GRID_ROWS;
      const allyCols = Number.isFinite(allyColsRaw) ? Math.max(1, Math.floor(allyColsRaw)) : 3;
      const gridRows = Number.isFinite(gridRowsRaw) ? Math.max(1, Math.floor(gridRowsRaw)) : 3;
      const slotsPerSide = Math.max(1, allyCols * gridRows);
      const buildTurnState = () => {
          if (useInterleaved) {
              return {
                  mode: 'interleaved_by_position',
                  nextSide: 'ALLY',
                  lastPos: { ALLY: 0, ENEMY: 0 },
                  wrapCount: { ALLY: 0, ENEMY: 0 },
                  turnCount: 0,
                  slotCount: slotsPerSide,
                  cycle: 0,
                  busyUntil: 0,
              };
          }
          const { order, indexMap } = buildTurnOrder();
          return {
              mode: 'sequential',
              order,
              orderIndex: indexMap,
              cursor: 0,
              cycle: 0,
              busyUntil: 0,
          };
      };
      const aiState = buildAiState({
          preset: enemyPreset,
          unitsAll: enemyUnits,
          defaultCostCap: CFG.COST_CAP,
          defaultSummonLimit: CFG.SUMMON_LIMIT,
      });
      const costCap = Number.isFinite(normalized.costCap)
          ? Number(normalized.costCap)
          : CFG.COST_CAP;
      const summonLimit = Number.isFinite(normalized.summonLimit)
          ? Number(normalized.summonLimit)
          : CFG.SUMMON_LIMIT;
      return buildBaseState({
          modeKey,
          allyUnits,
          costCap,
          summonLimit,
          sceneTheme,
          backgroundKey,
          turn: buildTurnState(),
          ai: aiState,
      });
  }
  function invalidateSceneCache() {
      sceneCache = null;
      clearBackgroundSignatureCache();
  }
  function createSceneCacheCanvas(pixelWidth, pixelHeight, documentRef) {
      if (!Number.isFinite(pixelWidth) || !Number.isFinite(pixelHeight))
          return null;
      const safeW = Math.max(1, Math.floor(pixelWidth));
      const safeH = Math.max(1, Math.floor(pixelHeight));
      if (typeof OffscreenCanvas === 'function') {
          try {
              return new OffscreenCanvas(safeW, safeH);
          }
          catch (_) {
              // ignore and fall back
          }
      }
      const doc = documentRef || (typeof document !== 'undefined' ? document : null);
      if (!doc || typeof doc.createElement !== 'function')
          return null;
      const offscreen = doc.createElement('canvas');
      offscreen.width = safeW;
      offscreen.height = safeH;
      return offscreen;
  }
  function ensureSceneCache(args) {
      var _a, _b, _c, _d, _e, _f, _g;
      const { game, canvas, documentRef, camPreset } = args;
      if (!(game === null || game === void 0 ? void 0 : game.grid))
          return null;
      if (typeof game.grid !== 'object')
          return null;
      const grid = game.grid;
      const gridDims = game.grid;
      const dprCandidate = Number(gridDims.dpr);
      const dprRaw = Number.isFinite(dprCandidate) && dprCandidate > 0 ? dprCandidate : 1;
      const cssWidth = typeof gridDims.w === 'number' ? gridDims.w : canvas ? canvas.width / dprRaw : 0;
      const cssHeight = typeof gridDims.h === 'number' ? gridDims.h : canvas ? canvas.height / dprRaw : 0;
      if (!cssWidth || !cssHeight)
          return null;
      const pixelWidth = Math.max(1, Math.round(cssWidth * dprRaw));
      const pixelHeight = Math.max(1, Math.round(cssHeight * dprRaw));
      const sceneCfg = getSceneConfig(CFG);
      const themeKey = (_c = (_b = (_a = game.sceneTheme) !== null && _a !== void 0 ? _a : sceneCfg === null || sceneCfg === void 0 ? void 0 : sceneCfg.CURRENT_THEME) !== null && _b !== void 0 ? _b : sceneCfg === null || sceneCfg === void 0 ? void 0 : sceneCfg.DEFAULT_THEME) !== null && _c !== void 0 ? _c : null;
      const theme = themeKey ? (_e = (_d = sceneCfg === null || sceneCfg === void 0 ? void 0 : sceneCfg.THEMES) === null || _d === void 0 ? void 0 : _d[themeKey]) !== null && _e !== void 0 ? _e : null : null;
      const backgroundKey = (_f = game.backgroundKey) !== null && _f !== void 0 ? _f : null;
      const backgroundSignature = computeBackgroundSignature(backgroundKey);
      const baseScene = getCachedBattlefieldScene(grid, theme, { width: cssWidth, height: cssHeight, dpr: dprRaw });
      const baseKey = (_g = baseScene === null || baseScene === void 0 ? void 0 : baseScene.cacheKey) !== null && _g !== void 0 ? _g : null;
      if (!baseScene) {
          sceneCache = null;
          return null;
      }
      let needsRebuild = false;
      if (!sceneCache)
          needsRebuild = true;
      else if (sceneCache.pixelWidth !== pixelWidth || sceneCache.pixelHeight !== pixelHeight)
          needsRebuild = true;
      else if (sceneCache.themeKey !== themeKey || sceneCache.backgroundKey !== backgroundKey)
          needsRebuild = true;
      else if (sceneCache.backgroundSignature !== backgroundSignature)
          needsRebuild = true;
      else if (sceneCache.dpr !== dprRaw)
          needsRebuild = true;
      else if (sceneCache.baseKey !== baseKey)
          needsRebuild = true;
      if (!needsRebuild)
          return sceneCache;
      const offscreen = createSceneCacheCanvas(pixelWidth, pixelHeight, documentRef);
      if (!offscreen)
          return null;
      const cacheCtx = offscreen.getContext('2d');
      if (!cacheCtx)
          return null;
      if (typeof cacheCtx.resetTransform === 'function') {
          cacheCtx.resetTransform();
      }
      else if (typeof cacheCtx.setTransform === 'function') {
          cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
      }
      cacheCtx.clearRect(0, 0, pixelWidth, pixelHeight);
      try {
          cacheCtx.drawImage(baseScene.canvas, 0, 0);
      }
      catch (err) {
          console.error('[scene-cache:base]', err);
          return null;
      }
      if (typeof cacheCtx.setTransform === 'function') {
          cacheCtx.setTransform(dprRaw, 0, 0, dprRaw, 0, 0);
      }
      else if (dprRaw !== 1 && typeof cacheCtx.scale === 'function') {
          cacheCtx.scale(dprRaw, dprRaw);
      }
      try {
          drawEnvironmentProps(cacheCtx, grid, camPreset, backgroundKey !== null && backgroundKey !== void 0 ? backgroundKey : undefined);
      }
      catch (err) {
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
          dpr: dprRaw,
          baseKey,
      };
      return sceneCache;
  }
  exports.__backgroundSignatureCache = backgroundSignatureCache;
  function toFiniteCost(value) {
      if (typeof value === 'number')
          return Number.isFinite(value) ? value : null;
      if (typeof value === 'string') {
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
  }
  function makeDeckEntrySkeleton(unitId) {
      var _a, _b;
      const unitDef = lookupUnit(unitId);
      const art = getUnitArt(unitId);
      return {
          id: unitId,
          cost: (_a = toFiniteCost(unitDef === null || unitDef === void 0 ? void 0 : unitDef.cost)) !== null && _a !== void 0 ? _a : null,
          name: typeof (unitDef === null || unitDef === void 0 ? void 0 : unitDef.name) === 'string' ? unitDef.name : null,
          art,
          skinKey: (_b = art === null || art === void 0 ? void 0 : art.skinKey) !== null && _b !== void 0 ? _b : null,
      };
  }
  function normalizeDeckEntry(entry) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j;
      if (!entry)
          return null;
      if (typeof entry === 'string') {
          return makeDeckEntrySkeleton(entry);
      }
      if (typeof entry !== 'object')
          return null;
      const candidate = entry;
      const idRaw = candidate.id;
      if (typeof idRaw !== 'string' || idRaw.trim() === '')
          return null;
      const skeleton = makeDeckEntrySkeleton(idRaw);
      const merged = { ...skeleton, ...candidate, id: idRaw };
      const costOverride = toFiniteCost(candidate.cost);
      merged.cost = (_a = costOverride !== null && costOverride !== void 0 ? costOverride : skeleton.cost) !== null && _a !== void 0 ? _a : null;
      const nameCandidate = candidate.name;
      if (typeof nameCandidate === 'string' && nameCandidate.trim() !== '') {
          merged.name = nameCandidate;
      }
      else if (merged.name == null) {
          merged.name = (_b = skeleton.name) !== null && _b !== void 0 ? _b : null;
      }
      if (merged.art == null) {
          merged.art = (_c = skeleton.art) !== null && _c !== void 0 ? _c : null;
      }
      if (typeof merged.skinKey === 'string') {
          merged.skinKey = merged.skinKey.trim() !== '' ? merged.skinKey : (_f = (_e = (_d = merged.art) === null || _d === void 0 ? void 0 : _d.skinKey) !== null && _e !== void 0 ? _e : skeleton.skinKey) !== null && _f !== void 0 ? _f : null;
      }
      else {
          merged.skinKey = (_j = (_h = (_g = merged.art) === null || _g === void 0 ? void 0 : _g.skinKey) !== null && _h !== void 0 ? _h : skeleton.skinKey) !== null && _j !== void 0 ? _j : null;
      }
      return merged;
  }
  function normalizeDeckEntries(value) {
      if (!Array.isArray(value))
          return [];
      const normalized = [];
      for (const item of value) {
          const entry = normalizeDeckEntry(item);
          if (entry)
              normalized.push(entry);
      }
      return normalized;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'clearBackgroundSignatureCache')) exports.clearBackgroundSignatureCache = clearBackgroundSignatureCache;
  if (!Object.prototype.hasOwnProperty.call(exports, 'computeBackgroundSignature')) exports.computeBackgroundSignature = computeBackgroundSignature;
  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeConfig')) exports.normalizeConfig = normalizeConfig;
  if (!Object.prototype.hasOwnProperty.call(exports, 'buildTurnOrder')) exports.buildTurnOrder = buildTurnOrder;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createSession')) exports.createSession = createSession;
  if (!Object.prototype.hasOwnProperty.call(exports, 'invalidateSceneCache')) exports.invalidateSceneCache = invalidateSceneCache;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createSceneCacheCanvas')) exports.createSceneCacheCanvas = createSceneCacheCanvas;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ensureSceneCache')) exports.ensureSceneCache = ensureSceneCache;
  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeDeckEntries')) exports.normalizeDeckEntries = normalizeDeckEntries;
});
__define('./modes/pve/session.ts', (exports, module, __require) => {
  const __reexport0 = __require('./modes/pve/session-state.ts');
  for (const key of Object.keys(__reexport0)) {
    if (key === 'default') continue;
    if (Object.prototype.hasOwnProperty.call(exports, key)) continue;
    exports[key] = __reexport0[key];
  }
  const __reexport1 = __require('./modes/pve/session-runtime.ts');
  for (const key of Object.keys(__reexport1)) {
    if (key === 'default') continue;
    if (Object.prototype.hasOwnProperty.call(exports, key)) continue;
    exports[key] = __reexport1[key];
  }

});
__define('./passives.ts', (exports, module, __require) => {
  // passives.ts — passive event dispatch & helpers v0.7
  const __dep0 = __require('./statuses.ts');
  const Statuses = __dep0.Statuses;
  const hookOnLethalDamage = __dep0.hookOnLethalDamage;
  const __dep1 = __require('./utils/time.ts');
  const safeNow = __dep1.safeNow;
  const clamp01 = (value) => Math.max(0, Math.min(1, value));
  const isRecord = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
  const isPassiveKitDefinition = (value) => {
      if (!isRecord(value))
          return false;
      const passives = value.passives;
      if (passives != null && !Array.isArray(passives))
          return false;
      const onSpawn = value.onSpawn;
      if (onSpawn != null && (typeof onSpawn !== 'object' || Array.isArray(onSpawn)))
          return false;
      return true;
  };
  const coercePassiveMeta = (value) => {
      if (!isRecord(value))
          return null;
      const kitCandidate = 'kit' in value ? value.kit : null;
      const kit = isPassiveKitDefinition(kitCandidate) ? kitCandidate : null;
      const meta = value;
      return {
          meta,
          kit,
      };
  };
  const isEffectCandidate = (value) => {
      if (typeof value === 'string')
          return true;
      return !!value && typeof value === 'object';
  };
  const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const collectPassiveEffects = (passive) => {
      if (!passive)
          return [];
      const out = [];
      const effects = Array.isArray(passive.effects) ? passive.effects : null;
      if (effects) {
          for (const entry of effects) {
              if (!isEffectCandidate(entry))
                  continue;
              out.push(entry);
          }
      }
      if (!out.length && isEffectCandidate(passive.effect)) {
          out.push(passive.effect);
      }
      return out;
  };
  const getPassiveLog = (Game) => {
      const logCandidate = Game === null || Game === void 0 ? void 0 : Game.passiveLog;
      if (!Array.isArray(logCandidate))
          return [];
      const result = [];
      for (const entry of logCandidate) {
          if (isRecord(entry)) {
              result.push(entry);
          }
      }
      return result;
  };
  const defaultPassive = ({ passive }) => {
      var _a;
      const id = (_a = passive === null || passive === void 0 ? void 0 : passive.id) !== null && _a !== void 0 ? _a : 'unknown';
      throw new Error(`Passive handler not implemented: ${id}`);
  };
  const resolvePassiveEffect = (basePassive, effect) => {
      const key = typeof effect === 'string'
          ? effect
          : effect && typeof effect === 'object'
              ? (effect.type || effect.kind || null)
              : null;
      let handler = getRegisteredPassive(key);
      let params = basePassive.params;
      let resolved = basePassive;
      if (effect && typeof effect === 'object') {
          const spec = effect;
          const type = spec.type || spec.kind;
          if (type) {
              const candidate = getRegisteredPassive(type);
              if (candidate)
                  handler = candidate;
          }
          const mergedParams = {
              ...(basePassive.params || {}),
              ...(spec.params || {}),
          };
          if (spec.stats && typeof spec.stats === 'object') {
              mergedParams.stats = spec.stats;
          }
          if (spec.flatStats && typeof spec.flatStats === 'object') {
              mergedParams.flatStats = spec.flatStats;
          }
          resolved = { ...basePassive, params: mergedParams };
          if (spec.id && typeof spec.id === 'string' && spec.id.trim()) {
              resolved.id = spec.id;
          }
          params = mergedParams;
          if (!handler && (mergedParams.stats || mergedParams.flatStats)) {
              handler = EFFECTS.gainStats;
          }
      }
      else if (!handler && basePassive.params && (basePassive.params.stats || basePassive.params.flatStats)) {
          handler = EFFECTS.gainStats;
      }
      return { handler: handler !== null && handler !== void 0 ? handler : defaultPassive, passive: resolved, params, key };
  };
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
  const BASE_STAT_KEYS = [
      'atk',
      'wil',
      'res',
      'arm',
      'agi',
      'per',
      'hpMax',
      'spd',
      'aeMax',
      'aeRegen',
      'hpRegen',
  ];
  const normalizeStatKey = (stat) => {
      if (typeof stat === 'string') {
          const trimmed = stat.trim();
          if (!trimmed)
              return null;
          const canonical = trimmed.replace(/[%_\s]/g, '').toLowerCase();
          return STAT_ALIAS.get(canonical) || trimmed;
      }
      return null;
  };
  const normalizeKey = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
  const toNumber = (value, fallback = 0) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  const ensureStatusContainer = (unit) => {
      if (!unit)
          return;
      if (!Array.isArray(unit.statuses))
          unit.statuses = [];
  };
  const stacksOf = (unit, id) => {
      var _a;
      const status = Statuses.get(unit, id);
      return status ? (_a = status.stacks) !== null && _a !== void 0 ? _a : 0 : 0;
  };
  const ensureStatBuff = (unit, id, { attr, mode = 'percent', amount = 0, purgeable = true }) => {
      ensureStatusContainer(unit);
      const statKey = normalizeStatKey(attr) || attr;
      let status = Statuses.get(unit, id);
      if (!status) {
          status = Statuses.add(unit, {
              id,
              kind: 'buff',
              tag: 'stat',
              attr: statKey,
              mode,
              amount,
              purgeable,
              stacks: 0,
          });
      }
      status.attr = statKey;
      status.mode = mode;
      status.amount = amount;
      status.purgeable = purgeable;
      return status;
  };
  const applyStatStacks = (status, stacks, { maxStacks = null } = {}) => {
      if (!status)
          return;
      let next = Math.max(0, stacks | 0);
      if (typeof maxStacks === 'number') {
          next = Math.min(next, maxStacks);
      }
      status.stacks = next;
  };
  const applyStatMap = (unit, passive, stats, options = {}) => {
      var _a;
      if (!unit || !stats)
          return false;
      const mode = options.mode === 'flat' ? 'flat' : 'percent';
      const purgeable = options.purgeable !== false;
      const stackable = options.stack !== false;
      const stacks = Number.isFinite(options.stacks) ? Number(options.stacks) : 1;
      const maxStacks = options.maxStacks;
      const idPrefix = options.idPrefix || (passive === null || passive === void 0 ? void 0 : passive.id) || 'stat';
      let applied = false;
      for (const [stat, value] of Object.entries(stats)) {
          if (!Number.isFinite(value))
              continue;
          const attr = normalizeStatKey(stat);
          if (!attr)
              continue;
          const status = ensureStatBuff(unit, `${idPrefix}_${attr}`, { attr, mode, amount: value, purgeable });
          const nextStacks = stackable ? ((_a = status === null || status === void 0 ? void 0 : status.stacks) !== null && _a !== void 0 ? _a : 0) + stacks : stacks;
          applyStatStacks(status, nextStacks, { maxStacks });
          applied = true;
      }
      if (applied)
          recomputeFromStatuses(unit);
      return applied;
  };
  const captureBaseStats = (unit) => {
      const source = unit !== null && unit !== void 0 ? unit : {};
      const result = {};
      for (const key of BASE_STAT_KEYS) {
          const value = source[key];
          if (typeof value === 'number' && Number.isFinite(value)) {
              result[key] = value;
          }
      }
      return result;
  };
  const hasLivingMinion = (unit, Game) => {
      if (!unit || !Game)
          return false;
      return (Game.tokens || []).some(token => token && token.alive && token.isMinion && token.ownerIid === unit.iid);
  };
  /**
   * @param {Record<string, unknown> | null | undefined} condition
   * @param {{ Game?: SessionState | null; unit?: UnitToken | null; ctx?: Record<string, unknown> | null; passive?: PassiveDefinition | null }} options
   * @returns {boolean}
   */
  const evaluateConditionObject = (condition, { Game, unit, ctx, passive }) => {
      var _a, _b, _c, _d, _e, _f;
      if (!condition || typeof condition !== 'object')
          return true;
      const hpMax = Number.isFinite(unit === null || unit === void 0 ? void 0 : unit.hpMax)
          ? (_a = unit === null || unit === void 0 ? void 0 : unit.hpMax) !== null && _a !== void 0 ? _a : 0
          : Number.isFinite((_b = unit === null || unit === void 0 ? void 0 : unit.baseStats) === null || _b === void 0 ? void 0 : _b.hpMax)
              ? (_d = (_c = unit === null || unit === void 0 ? void 0 : unit.baseStats) === null || _c === void 0 ? void 0 : _c.hpMax) !== null && _d !== void 0 ? _d : 0
              : 0;
      const hpPct = hpMax > 0 ? (((_e = unit === null || unit === void 0 ? void 0 : unit.hp) !== null && _e !== void 0 ? _e : hpMax) / hpMax) : 0;
      if (condition.selfHPAbove != null && hpPct <= Number(condition.selfHPAbove))
          return false;
      if (condition.selfHPBelow != null && hpPct >= Number(condition.selfHPBelow))
          return false;
      if (condition.hpAbove != null && hpPct <= Number(condition.hpAbove))
          return false;
      if (condition.hpBelow != null && hpPct >= Number(condition.hpBelow))
          return false;
      if ('requiresStatus' in condition && condition.requiresStatus) {
          const list = Array.isArray(condition.requiresStatus) ? condition.requiresStatus : [condition.requiresStatus];
          for (const id of list) {
              if (typeof id !== 'string' || !Statuses.has(unit !== null && unit !== void 0 ? unit : null, id))
                  return false;
          }
      }
      if ('targetHasStatus' in condition && condition.targetHasStatus) {
          const target = ctx === null || ctx === void 0 ? void 0 : ctx.target;
          if (!target)
              return false;
          const list = Array.isArray(condition.targetHasStatus) ? condition.targetHasStatus : [condition.targetHasStatus];
          for (const id of list) {
              if (typeof id !== 'string' || !Statuses.has(target, id))
                  return false;
          }
      }
      if (condition.minMinions != null) {
          const ownerIid = unit === null || unit === void 0 ? void 0 : unit.iid;
          if (ownerIid == null)
              return false;
          const tokens = (Game === null || Game === void 0 ? void 0 : Game.tokens) || [];
          const count = tokens.filter(t => t && t.alive && t.isMinion && t.ownerIid === ownerIid).length;
          if (count < Number(condition.minMinions))
              return false;
      }
      if (condition.maxStacks != null) {
          const stackId = condition.stackId || (passive === null || passive === void 0 ? void 0 : passive.id);
          if (stackId) {
              const st = Statuses.get(unit !== null && unit !== void 0 ? unit : null, stackId);
              const stacks = st ? (_f = st.stacks) !== null && _f !== void 0 ? _f : 0 : 0;
              if (stacks >= Number(condition.maxStacks))
                  return false;
          }
      }
      return true;
  };
  const isPassiveConditionFn = (cond) => typeof cond === 'function';
  const isPassiveConditionObject = (cond) => !!cond && typeof cond === 'object' && !Array.isArray(cond);
  const passiveConditionsOk = ({ Game, unit, passive, ctx, }) => {
      var _a;
      const conditionsCandidate = passive ? ((_a = passive.conditions) !== null && _a !== void 0 ? _a : null) : null;
      if (!conditionsCandidate)
          return true;
      const conditions = Array.isArray(conditionsCandidate) ? conditionsCandidate : [conditionsCandidate];
      for (const cond of conditions) {
          if (!cond)
              continue;
          if (isPassiveConditionFn(cond)) {
              try {
                  if (!cond({ Game, unit, ctx, passive }))
                      return false;
              }
              catch (_) {
                  return false;
              }
              continue;
          }
          if (typeof cond === 'string') {
              const key = cond.trim().toLowerCase();
              if (key === 'hasminion' || key === 'requiresminion') {
                  if (!hasLivingMinion(unit, Game))
                      return false;
              }
              continue;
          }
          if (isPassiveConditionObject(cond)) {
              if (!evaluateConditionObject(cond, { Game, unit, ctx, passive }))
                  return false;
          }
      }
      return true;
  };
  const recomputeFromStatuses = (unit) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      if (!unit || !unit.baseStats)
          return;
      ensureStatusContainer(unit);
      const percent = new Map();
      const flat = new Map();
      for (const status of (_a = unit.statuses) !== null && _a !== void 0 ? _a : []) {
          if (!status || !status.attr || !status.mode)
              continue;
          const attr = normalizeStatKey(status.attr);
          if (!attr)
              continue;
          const stacks = status.stacks == null ? 1 : status.stacks;
          const amount = ((_c = (_b = status.amount) !== null && _b !== void 0 ? _b : status.power) !== null && _c !== void 0 ? _c : 0) * stacks;
          if (!Number.isFinite(amount))
              continue;
          const mode = status.mode === 'flat' ? 'flat' : 'percent';
          const store = mode === 'flat' ? flat : percent;
          const prev = (_d = store.get(attr)) !== null && _d !== void 0 ? _d : 0;
          store.set(attr, prev + amount);
      }
      for (const [key, baseValue] of Object.entries(unit.baseStats)) {
          if (typeof baseValue !== 'number' || !Number.isFinite(baseValue))
              continue;
          const attr = normalizeStatKey(key) || key;
          const pct = Number((_f = (_e = percent.get(attr)) !== null && _e !== void 0 ? _e : percent.get(key)) !== null && _f !== void 0 ? _f : 0);
          const add = Number((_h = (_g = flat.get(attr)) !== null && _g !== void 0 ? _g : flat.get(key)) !== null && _h !== void 0 ? _h : 0);
          let next = baseValue * (1 + pct) + add;
          if (attr === 'arm' || attr === 'res') {
              unit[attr] = clamp01(next);
              continue;
          }
          if (attr === 'spd') {
              unit[attr] = Math.max(0, Math.round(next * 100) / 100);
              continue;
          }
          if (attr === 'hpMax' || attr === 'hp' || attr === 'aeMax') {
              unit[attr] = Math.max(0, Math.round(next));
              continue;
          }
          if (attr === 'aeRegen' || attr === 'hpRegen') {
              unit[attr] = Math.max(0, Math.round(next * 100) / 100);
              continue;
          }
          unit[attr] = Math.max(0, Math.round(next));
      }
  };
  const healTeam = (Game, unit, pct, opts = {}) => {
      var _a, _b, _c, _d, _e;
      if (!Game || !unit)
          return;
      if (!Number.isFinite(pct) || pct <= 0)
          return;
      const mode = opts.mode || 'targetMax';
      const casterHpMax = Number.isFinite(unit.hpMax) ? (_a = unit.hpMax) !== null && _a !== void 0 ? _a : 0 : 0;
      const allies = (Game.tokens || []).filter(t => t && t.side === unit.side && t.alive);
      for (const ally of allies) {
          if (!Number.isFinite(ally.hpMax))
              continue;
          const base = mode === 'casterMax' ? casterHpMax : ((_b = ally.hpMax) !== null && _b !== void 0 ? _b : 0);
          if (!Number.isFinite(base) || base <= 0)
              continue;
          const healAmount = Math.max(0, Math.round(base * pct));
          if (healAmount <= 0)
              continue;
          ally.hp = Math.min((_c = ally.hpMax) !== null && _c !== void 0 ? _c : 0, ((_e = (_d = ally.hp) !== null && _d !== void 0 ? _d : ally.hpMax) !== null && _e !== void 0 ? _e : 0) + healAmount);
      }
  };
  const EFFECTS = {
      placeMark({ unit, passive, ctx }) {
          var _a, _b;
          const runtime = (ctx !== null && ctx !== void 0 ? ctx : {});
          const id = passive === null || passive === void 0 ? void 0 : passive.id;
          const target = (_a = runtime.target) !== null && _a !== void 0 ? _a : null;
          if (!id || !target)
              return;
          const params = ((_b = passive === null || passive === void 0 ? void 0 : passive.params) !== null && _b !== void 0 ? _b : {});
          const ttl = Number.isFinite(params.ttlTurns) ? Number(params.ttlTurns) : 3;
          const stacksToExplode = Math.max(1, toNumber(params.stacksToExplode, 3));
          const dmgMul = toNumber(params.dmgFromWIL, 0.5);
          const purgeable = params.purgeable !== false;
          if (!Array.isArray(runtime.afterHit))
              runtime.afterHit = [];
          runtime.afterHit.push((afterCtx = {}) => {
              var _a, _b, _c, _d, _e, _f;
              const afterTarget = (_b = (_a = afterCtx.target) !== null && _a !== void 0 ? _a : runtime.target) !== null && _b !== void 0 ? _b : null;
              if (!afterTarget || !afterTarget.alive)
                  return;
              ensureStatusContainer(afterTarget);
              let status = Statuses.get(afterTarget, id);
              if (!status) {
                  status = Statuses.add(afterTarget, {
                      id,
                      kind: 'debuff',
                      tag: 'mark',
                      stacks: 0,
                      dur: ttl,
                      tick: 'turn',
                      purgeable,
                  });
              }
              if (!status)
                  return;
              status.dur = ttl;
              status.stacks = ((_c = status.stacks) !== null && _c !== void 0 ? _c : 0) + 1;
              if (((_d = status.stacks) !== null && _d !== void 0 ? _d : 0) < stacksToExplode)
                  return;
              Statuses.remove(afterTarget, id);
              const amount = Math.max(1, Math.round(toNumber(unit === null || unit === void 0 ? void 0 : unit.wil, 0) * dmgMul));
              afterTarget.hp = Math.max(0, ((_e = afterTarget.hp) !== null && _e !== void 0 ? _e : 0) - amount);
              if (((_f = afterTarget.hp) !== null && _f !== void 0 ? _f : 0) <= 0) {
                  if (!hookOnLethalDamage(afterTarget)) {
                      afterTarget.alive = false;
                      if (!afterTarget.deadAt)
                          afterTarget.deadAt = safeNow();
                  }
              }
              if (Array.isArray(runtime.log)) {
                  runtime.log.push({ t: id, source: unit === null || unit === void 0 ? void 0 : unit.name, target: afterTarget === null || afterTarget === void 0 ? void 0 : afterTarget.name, dmg: amount });
              }
          });
      },
      gainATKPercent({ unit, passive }) {
          var _a;
          if (!unit)
              return;
          const params = ((_a = passive === null || passive === void 0 ? void 0 : passive.params) !== null && _a !== void 0 ? _a : {});
          const amount = toNumber(params.amount, 0);
          applyStatMap(unit, passive !== null && passive !== void 0 ? passive : null, { atk: amount }, {
              mode: 'percent',
              stack: params.stack !== false,
              purgeable: params.purgeable !== false,
              maxStacks: typeof params.maxStacks === 'number' ? params.maxStacks : undefined,
          });
      },
      gainWILPercent({ unit, passive }) {
          var _a;
          if (!unit)
              return;
          const params = ((_a = passive === null || passive === void 0 ? void 0 : passive.params) !== null && _a !== void 0 ? _a : {});
          const amount = toNumber(params.amount, 0);
          applyStatMap(unit, passive !== null && passive !== void 0 ? passive : null, { wil: amount }, {
              mode: 'percent',
              stack: params.stack !== false,
              purgeable: params.purgeable !== false,
              maxStacks: typeof params.maxStacks === 'number' ? params.maxStacks : undefined,
          });
      },
      conditionalBuff({ unit, passive }) {
          var _a;
          if (!unit || !(passive === null || passive === void 0 ? void 0 : passive.id))
              return;
          const params = ((_a = passive.params) !== null && _a !== void 0 ? _a : {});
          const hpMax = toNumber(unit.hpMax, 0);
          const hpPct = hpMax > 0 ? toNumber(unit.hp, hpMax) / hpMax : 0;
          const threshold = toNumber(params.ifHPgt, 0.5);
          const trueStats = {};
          const falseStats = {};
          if (params.RES != null)
              trueStats.res = toNumber(params.RES, 0);
          if (params.ARM != null)
              trueStats.arm = toNumber(params.ARM, 0);
          if (params.ATK != null)
              trueStats.atk = toNumber(params.ATK, 0);
          if (params.WIL != null)
              trueStats.wil = toNumber(params.WIL, 0);
          if (params.elseRES != null)
              falseStats.res = toNumber(params.elseRES, 0);
          if (params.elseARM != null)
              falseStats.arm = toNumber(params.elseARM, 0);
          if (params.elseATK != null)
              falseStats.atk = toNumber(params.elseATK, 0);
          if (params.elseWIL != null)
              falseStats.wil = toNumber(params.elseWIL, 0);
          const purgeable = params.purgeable !== false;
          const applyStats = (stats) => {
              for (const [stat, amount] of Object.entries(stats)) {
                  const attr = stat.toLowerCase();
                  const status = ensureStatBuff(unit, `${passive.id}_${attr}`, { attr, mode: 'percent', amount, purgeable });
                  applyStatStacks(status, 1);
              }
          };
          const removeStats = (stats) => {
              for (const stat of Object.keys(stats)) {
                  Statuses.remove(unit, `${passive.id}_${stat.toLowerCase()}`);
              }
          };
          if (hpPct > threshold) {
              applyStats(trueStats);
              removeStats(falseStats);
          }
          else {
              applyStats(falseStats);
              removeStats(trueStats);
          }
          recomputeFromStatuses(unit);
      },
      gainRESPct({ Game, unit, passive }) {
          var _a;
          if (!unit)
              return;
          const params = ((_a = passive === null || passive === void 0 ? void 0 : passive.params) !== null && _a !== void 0 ? _a : {});
          const amount = toNumber(params.amount, 0);
          applyStatMap(unit, passive !== null && passive !== void 0 ? passive : null, { res: amount }, {
              mode: 'percent',
              stack: params.stack !== false,
              purgeable: params.purgeable !== false,
              maxStacks: typeof params.maxStacks === 'number' ? params.maxStacks : undefined,
          });
      },
      gainStats({ unit, passive }) {
          var _a, _b, _c, _d;
          if (!unit)
              return;
          const params = ((_a = passive === null || passive === void 0 ? void 0 : passive.params) !== null && _a !== void 0 ? _a : {});
          const modeRaw = (_c = (_b = params.mode) !== null && _b !== void 0 ? _b : params.statMode) !== null && _c !== void 0 ? _c : params.kind;
          const mode = modeRaw === 'flat' ? 'flat' : 'percent';
          let applied = false;
          const stats = params.stats;
          if (stats && typeof stats === 'object') {
              applied = applyStatMap(unit, passive !== null && passive !== void 0 ? passive : null, stats, {
                  mode,
                  stack: params.stack !== false,
                  stacks: typeof params.stacks === 'number' ? params.stacks : undefined,
                  purgeable: params.purgeable !== false,
                  maxStacks: typeof params.maxStacks === 'number' ? params.maxStacks : undefined,
                  idPrefix: typeof params.idPrefix === 'string' ? params.idPrefix : passive === null || passive === void 0 ? void 0 : passive.id,
              }) || applied;
          }
          const flatStats = params.flatStats;
          if (flatStats && typeof flatStats === 'object') {
              applied = applyStatMap(unit, passive !== null && passive !== void 0 ? passive : null, flatStats, {
                  mode: 'flat',
                  stack: params.stackFlat !== false,
                  stacks: typeof params.stacksFlat === 'number' ? params.stacksFlat : typeof params.stacks === 'number' ? params.stacks : undefined,
                  purgeable: params.purgeable !== false,
                  maxStacks: typeof params.maxStacksFlat === 'number' ? params.maxStacksFlat : typeof params.maxStacks === 'number' ? params.maxStacks : undefined,
                  idPrefix: `${(_d = passive === null || passive === void 0 ? void 0 : passive.id) !== null && _d !== void 0 ? _d : 'stat'}_flat`,
              }) || applied;
          }
          if (!applied && params.attr != null && typeof params.attr === 'string' && typeof params.amount === 'number') {
              const attr = normalizeStatKey(params.attr);
              if (attr) {
                  applyStatMap(unit, passive !== null && passive !== void 0 ? passive : null, { [attr]: params.amount }, {
                      mode,
                      stack: params.stack !== false,
                      stacks: typeof params.stacks === 'number' ? params.stacks : undefined,
                      purgeable: params.purgeable !== false,
                      maxStacks: typeof params.maxStacks === 'number' ? params.maxStacks : undefined,
                  });
              }
          }
      },
      gainBonus({ Game, unit, passive, ctx }) {
          var _a;
          if (!unit || !ctx || !(passive === null || passive === void 0 ? void 0 : passive.id))
              return;
          const runtime = ctx;
          const params = ((_a = passive.params) !== null && _a !== void 0 ? _a : {});
          const perMinion = toNumber(params.perMinion, 0);
          const ownerIid = unit.iid;
          const minions = ((Game === null || Game === void 0 ? void 0 : Game.tokens) || []).filter(token => token && token.alive && token.isMinion && token.ownerIid === ownerIid).length;
          const status = ensureStatBuff(unit, passive.id, { attr: 'atk', mode: 'percent', amount: 0, purgeable: params.purgeable !== false });
          if (!status)
              return;
          status.attr = 'atk';
          status.mode = 'percent';
          status.amount = perMinion;
          applyStatStacks(status, minions);
          recomputeFromStatuses(unit);
          if (runtime.damage) {
              const bonusPct = perMinion * minions;
              runtime.damage.baseMul = toNumber(runtime.damage.baseMul, 1) * (1 + bonusPct);
          }
      },
      resPerSleeping({ Game, unit, passive }) {
          var _a;
          if (!Game || !unit || !(passive === null || passive === void 0 ? void 0 : passive.id))
              return;
          const params = ((_a = passive.params) !== null && _a !== void 0 ? _a : {});
          const foes = (Game.tokens || []).filter(token => token && token.alive && token.side !== unit.side && Statuses.has(token, 'sleep'));
          const status = ensureStatBuff(unit, passive.id, { attr: 'res', mode: 'percent', amount: toNumber(params.perTarget, 0), purgeable: params.purgeable !== false });
          applyStatStacks(status, foes.length, { maxStacks: typeof params.maxStacks === 'number' ? params.maxStacks : undefined });
          recomputeFromStatuses(unit);
      },
  };
  /** @type {Record<string, PassiveEffectHandler>} */
  const PASSIVE_ENTRIES = {
      placeMark: EFFECTS.placeMark,
      'gainATK%': EFFECTS.gainATKPercent,
      'gainWIL%': EFFECTS.gainWILPercent,
      conditionalBuff: EFFECTS.conditionalBuff,
      'gainRES%': EFFECTS.gainRESPct,
      gainBonus: EFFECTS.gainBonus,
      gainStats: EFFECTS.gainStats,
      'gainStats%': EFFECTS.gainStats,
      statBuff: EFFECTS.gainStats,
      statGain: EFFECTS.gainStats,
  };
  const PASSIVES = Object.freeze(Object.fromEntries(Object.entries(PASSIVE_ENTRIES).map(([key, handler]) => [
      key,
      typeof handler === 'function' ? handler : defaultPassive,
  ])));
  function getRegisteredPassive(key) {
      if (!key)
          return null;
      const candidate = hasOwn(PASSIVES, key) ? PASSIVES[key] : undefined;
      return typeof candidate === 'function' ? candidate : null;
  }
  /**
   * @param {SessionState | null | undefined} Game
   * @param {UnitToken | null | undefined} unit
   * @param {string} when
   * @param {Record<string, unknown>} [ctx]
   * @returns {void}
   */
  function emitPassiveEvent(Game, unit, when, ctx = {}) {
      var _a, _b;
      if (!Game || !unit)
          return;
      const metaValue = Game.meta && typeof Game.meta.get === 'function' ? Game.meta.get(unit.id) : null;
      const metaContext = coercePassiveMeta(metaValue);
      const kit = (_a = metaContext === null || metaContext === void 0 ? void 0 : metaContext.kit) !== null && _a !== void 0 ? _a : null;
      ctx.meta = (_b = metaContext === null || metaContext === void 0 ? void 0 : metaContext.meta) !== null && _b !== void 0 ? _b : null;
      ctx.kit = kit;
      if (!kit || !Array.isArray(kit.passives))
          return;
      for (const passive of kit.passives) {
          if (!passive || passive.when !== when)
              continue;
          const effects = collectPassiveEffects(passive);
          if (!effects.length)
              continue;
          for (const effect of effects) {
              const { handler, passive: effectivePassive, params, key } = resolvePassiveEffect(passive, effect);
              if (typeof handler !== 'function')
                  continue;
              if (!effectivePassive)
                  continue;
              const handlerToUse = key === 'gainRES%' && params && params.perTarget != null
                  ? EFFECTS.resPerSleeping
                  : handler;
              if (typeof handlerToUse !== 'function')
                  continue;
              if (!passiveConditionsOk({ Game, unit, passive: effectivePassive, ctx }))
                  continue;
              handlerToUse({ Game: Game !== null && Game !== void 0 ? Game : null, unit: unit !== null && unit !== void 0 ? unit : null, passive: effectivePassive !== null && effectivePassive !== void 0 ? effectivePassive : null, ctx });
          }
      }
  }
  /**
   * @param {SessionState | null | undefined} Game
   * @param {UnitToken | null | undefined} unit
   * @param {UnitKitConfig['onSpawn']} [onSpawn]
   * @returns {void}
   */
  function applyOnSpawnEffects(Game, unit, onSpawn) {
      var _a, _b, _c, _d, _e;
      if (!Game || !unit || !onSpawn)
          return;
      const config = isRecord(onSpawn) ? onSpawn : null;
      if (!config)
          return;
      ensureStatusContainer(unit);
      const effects = [];
      if (Array.isArray(config.effects)) {
          for (const effect of config.effects) {
              if (isRecord(effect))
                  effects.push(effect);
          }
      }
      if (Number.isFinite(config.teamHealOnEntry) && Number(config.teamHealOnEntry) > 0) {
          effects.push({ type: 'teamHeal', amount: config.teamHealOnEntry, mode: 'targetMax' });
      }
      const casterHeal = ((_a = config.teamHealPercentMaxHPOfCaster) !== null && _a !== void 0 ? _a : config.teamHealPercentCasterMaxHP);
      if (Number.isFinite(casterHeal) && Number(casterHeal) > 0) {
          effects.push({ type: 'teamHeal', amount: casterHeal, mode: 'casterMax' });
      }
      if (Array.isArray(config.statuses)) {
          for (const st of config.statuses) {
              if (!st || typeof st !== 'object')
                  continue;
              effects.push({ type: 'status', status: st });
          }
      }
      if (Array.isArray(config.addStatuses)) {
          for (const st of config.addStatuses) {
              if (!st || typeof st !== 'object')
                  continue;
              effects.push({ type: 'status', status: st });
          }
      }
      if (config.status && typeof config.status === 'object') {
          effects.push({ type: 'status', status: config.status });
      }
      if (config.stats && typeof config.stats === 'object') {
          effects.push({ type: 'stats', stats: config.stats, mode: config.statsMode || config.mode, purgeable: config.purgeable });
      }
      if (config.flatStats && typeof config.flatStats === 'object') {
          effects.push({ type: 'stats', stats: config.flatStats, mode: 'flat', purgeable: config.purgeable, id: 'onSpawn_flat' });
      }
      let statsChanged = false;
      for (const effect of effects) {
          if (!effect)
              continue;
          const type = normalizeKey((_c = (_b = effect.type) !== null && _b !== void 0 ? _b : effect.kind) !== null && _c !== void 0 ? _c : effect.effect);
          if (type === 'teamheal') {
              const amount = toNumber((_e = (_d = effect.amount) !== null && _d !== void 0 ? _d : effect.value) !== null && _e !== void 0 ? _e : effect.percent, 0);
              if (amount <= 0)
                  continue;
              const mode = effect.mode === 'casterMax' ? 'casterMax' : 'targetMax';
              healTeam(Game, unit, amount, { mode });
              continue;
          }
          if (type === 'status' || type === 'addstatus') {
              const statusEffect = effect.status;
              if (statusEffect && typeof statusEffect === 'object') {
                  Statuses.add(unit, statusEffect);
              }
              continue;
          }
          if (type === 'stats' || type === 'stat' || type === 'buff') {
              const stats = effect.stats || effect.values;
              if (!stats || typeof stats !== 'object')
                  continue;
              const effectId = typeof effect.id === 'string' && effect.id.trim() ? effect.id : 'onSpawn';
              const applied = applyStatMap(unit, { id: effectId }, stats, {
                  mode: effect.mode === 'flat' ? 'flat' : (effect.statMode === 'flat' ? 'flat' : 'percent'),
                  stack: effect.stack !== false,
                  stacks: typeof effect.stacks === 'number' ? effect.stacks : undefined,
                  purgeable: effect.purgeable !== false,
                  maxStacks: typeof effect.maxStacks === 'number' ? effect.maxStacks : undefined,
                  idPrefix: effectId,
              });
              statsChanged = applied || statsChanged;
              continue;
          }
      }
      if (statsChanged) {
          if (typeof unit._recalcStats === 'function') {
              unit._recalcStats();
          }
          else {
              recomputeFromStatuses(unit);
          }
      }
      else if (typeof unit._recalcStats === 'function') {
          unit._recalcStats();
      }
      else {
          recomputeFromStatuses(unit);
      }
  }
  /**
   * @param {UnitToken | null | undefined} unit
   * @returns {void}
   */
  function prepareUnitForPassives(unit) {
      if (!unit)
          return;
      ensureStatusContainer(unit);
      const captured = captureBaseStats(unit);
      if (!unit.baseStats || typeof unit.baseStats !== 'object') {
          unit.baseStats = { ...captured };
      }
      else {
          for (const [key, value] of Object.entries(captured)) {
              if (!Number.isFinite(unit.baseStats[key])) {
                  unit.baseStats[key] = value;
              }
          }
      }
      unit._recalcStats = () => recomputeFromStatuses(unit);
  }
  exports.recomputeUnitStats = recomputeFromStatuses;
  exports.stacksOf = stacksOf;

  if (!Object.prototype.hasOwnProperty.call(exports, 'getPassiveLog')) exports.getPassiveLog = getPassiveLog;
  if (!Object.prototype.hasOwnProperty.call(exports, 'emitPassiveEvent')) exports.emitPassiveEvent = emitPassiveEvent;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyOnSpawnEffects')) exports.applyOnSpawnEffects = applyOnSpawnEffects;
  if (!Object.prototype.hasOwnProperty.call(exports, 'prepareUnitForPassives')) exports.prepareUnitForPassives = prepareUnitForPassives;
});
__define('./scene.ts', (exports, module, __require) => {
  const DEFAULT_THEME = {
      sky: {
          top: '#1b2434',
          mid: '#2f455e',
          bottom: '#55759a',
          glow: 'rgba(255, 236, 205, 0.35)',
      },
      horizon: {
          color: '#f4d9ad',
          glow: 'rgba(255, 236, 205, 0.55)',
          height: 0.22,
          thickness: 0.9,
      },
      ground: {
          top: '#312724',
          accent: '#3f302c',
          bottom: '#181210',
          highlight: '#6c5344',
          parallax: 0.12,
          topScale: 0.9,
          bottomScale: 1.45,
      },
  };
  const battlefieldSceneCache = new Map();
  function normalizeDimension(value) {
      if (!Number.isFinite(value))
          return 0;
      return value;
  }
  function createOffscreenCanvas(pixelWidth, pixelHeight) {
      const safeW = Math.max(1, Math.floor(pixelWidth || 0));
      const safeH = Math.max(1, Math.floor(pixelHeight || 0));
      if (!safeW || !safeH)
          return null;
      if (typeof OffscreenCanvas === 'function') {
          try {
              return new OffscreenCanvas(safeW, safeH);
          }
          catch {
              // ignore and fall back
          }
      }
      if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
          const canvas = document.createElement('canvas');
          canvas.width = safeW;
          canvas.height = safeH;
          return canvas;
      }
      return null;
  }
  function themeSignature(theme) {
      try {
          const merged = mergeTheme(theme);
          return JSON.stringify(merged);
      }
      catch {
          return 'default-theme';
      }
  }
  function joinSignatureParts(parts) {
      if (!Array.isArray(parts) || parts.length === 0) {
          return '';
      }
      const normalized = [];
      for (const part of parts) {
          if (part == null) {
              normalized.push('');
              continue;
          }
          if (typeof part === 'number') {
              normalized.push(Number.isFinite(part) ? String(part) : '');
              continue;
          }
          normalized.push(String(part));
      }
      return normalized.join('|');
  }
  function gridSignature(g, cssWidth, cssHeight, dpr) {
      var _a, _b, _c, _d, _e;
      if (!g)
          return 'no-grid';
      const parts = [
          `cols:${(_a = g.cols) !== null && _a !== void 0 ? _a : 'na'}`,
          `rows:${(_b = g.rows) !== null && _b !== void 0 ? _b : 'na'}`,
          `tile:${Math.round((_c = g.tile) !== null && _c !== void 0 ? _c : 0)}`,
          `ox:${Math.round((_d = g.ox) !== null && _d !== void 0 ? _d : 0)}`,
          `oy:${Math.round((_e = g.oy) !== null && _e !== void 0 ? _e : 0)}`,
          `w:${Math.round(cssWidth !== null && cssWidth !== void 0 ? cssWidth : 0)}`,
          `h:${Math.round(cssHeight !== null && cssHeight !== void 0 ? cssHeight : 0)}`,
          `dpr:${Number.isFinite(dpr) ? dpr : 'na'}`,
      ];
      return joinSignatureParts(parts);
  }
  function invalidateBattlefieldSceneCache() {
      battlefieldSceneCache.clear();
  }
  function getCachedBattlefieldScene(g, theme, options = {}) {
      var _a, _b, _c, _d;
      if (!g)
          return null;
      const cssWidth = normalizeDimension((_a = options.width) !== null && _a !== void 0 ? _a : g.w);
      const cssHeight = normalizeDimension((_b = options.height) !== null && _b !== void 0 ? _b : g.h);
      const dpr = Number.isFinite(options.dpr) && ((_c = options.dpr) !== null && _c !== void 0 ? _c : 0) > 0
          ? options.dpr
          : (Number.isFinite(g.dpr) && ((_d = g.dpr) !== null && _d !== void 0 ? _d : 0) > 0 ? g.dpr : 1);
      if (!cssWidth || !cssHeight)
          return null;
      const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
      const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));
      const gridKey = gridSignature(g, cssWidth, cssHeight, dpr);
      const themeKey = themeSignature(theme);
      const cacheKey = `${gridKey}::${themeKey}`;
      const existing = battlefieldSceneCache.get(cacheKey);
      if (existing && existing.pixelWidth === pixelWidth && existing.pixelHeight === pixelHeight) {
          return existing;
      }
      const offscreen = createOffscreenCanvas(pixelWidth, pixelHeight);
      if (!offscreen)
          return null;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx)
          return null;
      if (typeof offCtx.resetTransform === 'function')
          offCtx.resetTransform();
      else if (typeof offCtx.setTransform === 'function')
          offCtx.setTransform(1, 0, 0, 1, 0, 0);
      offCtx.clearRect(0, 0, pixelWidth, pixelHeight);
      if (typeof offCtx.setTransform === 'function')
          offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      else if (dpr !== 1 && typeof offCtx.scale === 'function')
          offCtx.scale(dpr, dpr);
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
          cacheKey,
      };
      battlefieldSceneCache.set(cacheKey, entry);
      return entry;
  }
  function mergeTheme(theme) {
      if (!theme)
          return DEFAULT_THEME;
      return {
          sky: { ...DEFAULT_THEME.sky, ...(theme.sky || {}) },
          horizon: { ...DEFAULT_THEME.horizon, ...(theme.horizon || {}) },
          ground: { ...DEFAULT_THEME.ground, ...(theme.ground || {}) },
      };
  }
  function hexToRgb(hex) {
      if (typeof hex !== 'string')
          return null;
      let value = hex.trim();
      if (!value.startsWith('#'))
          return null;
      value = value.slice(1);
      if (value.length === 3) {
          value = value.split('').map((ch) => ch + ch).join('');
      }
      if (value.length !== 6)
          return null;
      const num = Number.parseInt(value, 16);
      if (Number.isNaN(num))
          return null;
      return {
          r: (num >> 16) & 0xff,
          g: (num >> 8) & 0xff,
          b: num & 0xff,
      };
  }
  function mixHex(a, b, t) {
      const ca = hexToRgb(a);
      const cb = hexToRgb(b);
      if (!ca || !cb)
          return t < 0.5 ? (a || b || '') : (b || a || '');
      const mix = (x, y) => Math.round(x + (y - x) * t);
      const r = mix(ca.r, cb.r);
      const g = mix(ca.g, cb.g);
      const bVal = mix(ca.b, cb.b);
      return `rgb(${r}, ${g}, ${bVal})`;
  }
  function drawBattlefieldScene(ctx, g, theme) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
      if (!ctx || !g)
          return;
      const t = mergeTheme(theme);
      const w = (_a = g.w) !== null && _a !== void 0 ? _a : ctx.canvas.width;
      const h = (_b = g.h) !== null && _b !== void 0 ? _b : ctx.canvas.height;
      const boardTop = g.oy;
      const boardHeight = g.tile * g.rows;
      const boardBottom = boardTop + boardHeight;
      const centerX = g.ox + (g.tile * g.cols) / 2;
      ctx.save();
      const skyGradient = ctx.createLinearGradient(0, 0, 0, boardBottom);
      skyGradient.addColorStop(0, t.sky.top);
      skyGradient.addColorStop(0.55, t.sky.mid);
      skyGradient.addColorStop(1, t.sky.bottom);
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, w, boardBottom);
      if (boardBottom < h) {
          ctx.fillStyle = t.sky.bottom;
          ctx.fillRect(0, boardBottom, w, h - boardBottom);
      }
      const horizonY = boardTop + Math.min(Math.max((_c = t.horizon.height) !== null && _c !== void 0 ? _c : 0, 0), 1) * boardHeight;
      const glowHeight = Math.max(4, g.tile * ((_d = t.horizon.thickness) !== null && _d !== void 0 ? _d : 0));
      const glowGradient = ctx.createLinearGradient(0, horizonY - glowHeight, 0, horizonY + glowHeight);
      glowGradient.addColorStop(0, 'rgba(0,0,0,0)');
      glowGradient.addColorStop(0.45, (_e = t.horizon.glow) !== null && _e !== void 0 ? _e : 'rgba(0,0,0,0)');
      glowGradient.addColorStop(0.55, (_f = t.horizon.glow) !== null && _f !== void 0 ? _f : 'rgba(0,0,0,0)');
      glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, Math.max(0, horizonY - glowHeight), w, glowHeight * 2);
      ctx.strokeStyle = (_g = t.horizon.color) !== null && _g !== void 0 ? _g : '#f4d9ad';
      ctx.lineWidth = Math.max(1, g.tile * 0.05);
      ctx.beginPath();
      ctx.moveTo(g.ox - g.tile, horizonY);
      ctx.lineTo(g.ox + g.tile * g.cols + g.tile, horizonY);
      ctx.stroke();
      const groundTopScale = (_h = t.ground.topScale) !== null && _h !== void 0 ? _h : 1;
      const groundBottomScale = (_j = t.ground.bottomScale) !== null && _j !== void 0 ? _j : 1;
      const groundTopWidth = g.tile * g.cols * groundTopScale;
      const groundBottomWidth = g.tile * g.cols * groundBottomScale;
      const groundTop = boardTop + g.tile * 0.35;
      const groundBottom = h;
      const groundGradient = ctx.createLinearGradient(0, groundTop, 0, groundBottom);
      groundGradient.addColorStop(0, (_k = t.ground.top) !== null && _k !== void 0 ? _k : '#312724');
      groundGradient.addColorStop(0.45, (_l = t.ground.accent) !== null && _l !== void 0 ? _l : '#3f302c');
      groundGradient.addColorStop(1, (_m = t.ground.bottom) !== null && _m !== void 0 ? _m : '#181210');
      ctx.fillStyle = groundGradient;
      ctx.beginPath();
      ctx.moveTo(centerX - groundTopWidth / 2, groundTop);
      ctx.lineTo(centerX + groundTopWidth / 2, groundTop);
      ctx.lineTo(centerX + groundBottomWidth / 2, groundBottom);
      ctx.lineTo(centerX - groundBottomWidth / 2, groundBottom);
      ctx.closePath();
      ctx.fill();
      const layerCount = Math.max(4, g.rows * 2);
      const parallaxStrength = ((_o = t.ground.parallax) !== null && _o !== void 0 ? _o : 0) * g.tile;
      for (let i = 0; i < layerCount; i += 1) {
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

  if (!Object.prototype.hasOwnProperty.call(exports, 'invalidateBattlefieldSceneCache')) exports.invalidateBattlefieldSceneCache = invalidateBattlefieldSceneCache;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getCachedBattlefieldScene')) exports.getCachedBattlefieldScene = getCachedBattlefieldScene;
  if (!Object.prototype.hasOwnProperty.call(exports, 'drawBattlefieldScene')) exports.drawBattlefieldScene = drawBattlefieldScene;
});
__define('./screens/collection/helpers.ts', (exports, module, __require) => {
  const __dep0 = __require('./catalog.ts');
  const ROSTER = __dep0.ROSTER;
  const __dep1 = __require('./units.ts');
  const UNITS = __dep1.UNITS;
  const __dep2 = __require('./utils/unit-id.ts');
  const normalizeUnitId = __dep2.normalizeUnitId;
  const __dep3 = __require('./types/currency.ts');
  const isCurrencyEntry = __dep3.isCurrencyEntry;
  const isLineupCurrencyConfig = __dep3.isLineupCurrencyConfig;
  const normalizeCurrencyBalances = __dep3.normalizeCurrencyBalances;
  const __dep4 = __require('./utils/format.ts');
  const HAS_INTL_NUMBER_FORMAT = __dep4.HAS_INTL_NUMBER_FORMAT;
  const isRosterEntryLite = (value) => (typeof value === 'object'
      && value !== null
      && !Array.isArray(value));
  const ABILITY_TYPE_LABELS = Object.freeze({
      basic: 'Đánh thường',
      active: 'Kĩ năng',
      ultimate: 'Tuyệt kỹ',
      talent: 'Thiên phú',
      technique: 'Tuyệt học',
      passive: 'Nội tại',
  });
  const TARGET_LABELS = Object.freeze({
      single: 'Đơn mục tiêu',
      singleTarget: 'Đơn mục tiêu',
      randomEnemies: 'Địch ngẫu nhiên',
      randomRow: 'Một hàng ngẫu nhiên',
      randomColumn: 'Một cột ngẫu nhiên',
      allEnemies: 'Toàn bộ địch',
      allAllies: 'Toàn bộ đồng minh',
      allies: 'Đồng minh',
      self: 'Bản thân',
      'self+2allies': 'Bản thân + 2 đồng minh',
  });
  function cloneRoster(input) {
      if (Array.isArray(input)) {
          const clones = input
              .filter(isRosterEntryLite)
              .map((entry) => ({ ...entry }));
          if (clones.length > 0) {
              return clones;
          }
      }
      return ROSTER.map((unit) => ({ ...unit }));
  }
  function buildRosterWithCost(rosterSource) {
      const costs = new Map(UNITS.map((unit) => [normalizeUnitId(unit.id), unit.cost]));
      return rosterSource.map((entry) => {
          var _a;
          const entryId = normalizeUnitId(entry.id);
          return {
              ...entry,
              id: entryId,
              cost: typeof entry.cost === 'number' && Number.isFinite(entry.cost)
                  ? entry.cost
                  : entry.cost === null
                      ? null
                      : (_a = costs.get(entryId)) !== null && _a !== void 0 ? _a : null,
          };
      });
  }
  const resolveCurrencyBalance = (currencyId, providedCurrencies, playerState) => {
      const toFiniteNumber = (value) => {
          if (value == null)
              return null;
          if (typeof value === 'number') {
              return Number.isFinite(value) ? value : null;
          }
          const trimmed = value.trim();
          if (!trimmed)
              return null;
          const parsed = Number(trimmed);
          return Number.isFinite(parsed) ? parsed : null;
      };
      const extractFromEntry = (entry) => {
          var _a, _b, _c, _d, _e, _f, _g;
          if (!isCurrencyEntry(entry)) {
              return null;
          }
          return ((_f = (_d = (_b = toFiniteNumber((_a = entry.balance) !== null && _a !== void 0 ? _a : null)) !== null && _b !== void 0 ? _b : toFiniteNumber((_c = entry.amount) !== null && _c !== void 0 ? _c : null)) !== null && _d !== void 0 ? _d : toFiniteNumber((_e = entry.value) !== null && _e !== void 0 ? _e : null)) !== null && _f !== void 0 ? _f : toFiniteNumber((_g = entry.total) !== null && _g !== void 0 ? _g : null));
      };
      const tryExtract = (candidate) => {
          if (typeof candidate === 'number' || typeof candidate === 'string') {
              return toFiniteNumber(candidate);
          }
          if (isCurrencyEntry(candidate)) {
              return extractFromEntry(candidate);
          }
          return null;
      };
      const isCurrencyValueRecord = (value) => (value != null
          && typeof value === 'object'
          && !Array.isArray(value));
      const inspectContainer = (container) => {
          var _a;
          if (!container)
              return null;
          if (Array.isArray(container)) {
              for (const entry of container) {
                  if (entry == null)
                      continue;
                  if (typeof entry === 'number') {
                      if (currencyId !== 'VNT')
                          continue;
                      const extracted = tryExtract(entry);
                      if (extracted != null)
                          return extracted;
                      continue;
                  }
                  if (typeof entry === 'string') {
                      const [rawId, rawValue] = entry.split(':');
                      if (!rawId || !rawValue)
                          continue;
                      if (rawId.trim() !== currencyId)
                          continue;
                      const extracted = tryExtract(rawValue);
                      if (extracted != null)
                          return extracted;
                      continue;
                  }
                  if (!isCurrencyEntry(entry))
                      continue;
                  const id = entry.currencyId || entry.id || entry.key || entry.type || null;
                  if (id === currencyId) {
                      const extracted = tryExtract(entry);
                      if (extracted != null)
                          return extracted;
                  }
              }
              return null;
          }
          if (isLineupCurrencyConfig(container)) {
              const directValue = container[currencyId];
              const directExtracted = tryExtract(directValue !== null && directValue !== void 0 ? directValue : null);
              if (directExtracted != null)
                  return directExtracted;
              if (isCurrencyValueRecord(container.balances)) {
                  const balanceExtracted = tryExtract((_a = container.balances[currencyId]) !== null && _a !== void 0 ? _a : null);
                  if (balanceExtracted != null)
                      return balanceExtracted;
              }
          }
          return null;
      };
      const fromProvided = inspectContainer(providedCurrencies);
      if (fromProvided != null)
          return fromProvided;
      const fromState = inspectContainer(normalizeCurrencyBalances(playerState !== null && playerState !== void 0 ? playerState : null));
      if (fromState != null)
          return fromState;
      return 0;
  };
  function describeUlt(unit) {
      return (unit === null || unit === void 0 ? void 0 : unit.name) ? `Bộ kỹ năng của ${unit.name}.` : 'Chọn nhân vật để xem mô tả chi tiết.';
  }
  function formatResourceCost(cost) {
      if (!cost || typeof cost !== 'object')
          return 'Không tốn tài nguyên';
      const parts = [];
      for (const [key, value] of Object.entries(cost)) {
          if (!Number.isFinite(value))
              continue;
          const label = key === 'aether' ? 'Aether' : key.replace(/_/g, ' ');
          parts.push(`${value} ${label}`);
      }
      return parts.length ? parts.join(' + ') : 'Không tốn tài nguyên';
  }
  function formatDuration(duration) {
      if (!duration)
          return null;
      if (typeof duration === 'number')
          return `Hiệu lực ${duration} lượt`;
      if (typeof duration === 'string') {
          return duration === 'battle' ? 'Hiệu lực tới hết trận' : null;
      }
      if (typeof duration !== 'object')
          return null;
      const record = duration;
      const parts = [];
      if (record.turns === 'battle') {
          parts.push('Hiệu lực tới hết trận');
      }
      else if (typeof record.turns === 'number' && Number.isFinite(record.turns)) {
          parts.push(`Hiệu lực ${record.turns} lượt`);
      }
      if (record.start === 'nextTurn') {
          parts.push('Bắt đầu từ lượt kế tiếp');
      }
      if (typeof record.bossModifier === 'number' && Number.isFinite(record.bossModifier) && typeof record.turns === 'number') {
          const bossTurns = Math.max(1, Math.floor(record.turns * record.bossModifier));
          parts.push(`Boss PvE: ${bossTurns} lượt`);
      }
      if (typeof record.affectedStat === 'string' && record.affectedStat) {
          parts.push(`Ảnh hưởng: ${record.affectedStat}`);
      }
      return parts.length ? parts.join(' · ') : null;
  }
  function formatTargetLabel(target) {
      if (target == null)
          return null;
      if (typeof target === 'number') {
          return `Nhắm tới ${target} mục tiêu`;
      }
      const key = target.toString();
      return TARGET_LABELS[key] || key;
  }
  function formatSummonSummary(summon) {
      var _a;
      if (!summon || typeof summon !== 'object')
          return null;
      const record = summon;
      const parts = [];
      if (Number.isFinite(record.count)) {
          parts.push(`Triệu hồi ${record.count} đơn vị`);
      }
      else {
          parts.push('Triệu hồi đơn vị');
      }
      if (record.placement || record.pattern) {
          parts.push(`ô ${record.placement || record.pattern}`);
      }
      if (record.limit != null) {
          parts.push(`giới hạn ${record.limit}`);
      }
      const ttl = ((_a = record.ttlTurns) !== null && _a !== void 0 ? _a : record.ttl);
      if (Number.isFinite(ttl) && (ttl !== null && ttl !== void 0 ? ttl : 0) > 0) {
          parts.push(`tồn tại ${ttl} lượt`);
      }
      if (record.replace) {
          parts.push(`thay ${record.replace}`);
      }
      if (record.inherit && typeof record.inherit === 'object') {
          const inheritParts = [];
          for (const [stat, value] of Object.entries(record.inherit)) {
              if (!Number.isFinite(value))
                  continue;
              inheritParts.push(`${Math.round(value * 100)}% ${stat.toUpperCase()}`);
          }
          if (inheritParts.length) {
              parts.push(`kế thừa ${inheritParts.join(', ')}`);
          }
      }
      return parts.join(' · ');
  }
  function formatReviveSummary(revive) {
      if (!revive || typeof revive !== 'object')
          return null;
      const record = revive;
      const parts = [];
      const targets = Number.isFinite(record.targets) ? Number(record.targets) : 1;
      parts.push(`Hồi sinh ${targets} đồng minh`);
      if (record.priority) {
          parts.push(`ưu tiên ${record.priority}`);
      }
      if (Number.isFinite(record.hpPercent)) {
          parts.push(`HP ${Math.round(Number(record.hpPercent) * 100)}%`);
      }
      if (Number.isFinite(record.ragePercent)) {
          parts.push(`Nộ ${Math.round(Number(record.ragePercent) * 100)}%`);
      }
      if (Number.isFinite(record.lockSkillsTurns)) {
          parts.push(`Khoá kỹ năng ${record.lockSkillsTurns} lượt`);
      }
      return parts.join(' · ');
  }
  function formatLinksSummary(links) {
      var _a;
      if (!links || typeof links !== 'object')
          return null;
      const record = links;
      const parts = [];
      const sharePercent = (_a = record.sharePercent) !== null && _a !== void 0 ? _a : record.maxLinks;
      if (Number.isFinite(sharePercent)) {
          parts.push(`Chia ${Math.round(Number(sharePercent) * 100)}% sát thương`);
      }
      if (record.maxConcurrent != null) {
          parts.push(`tối đa ${record.maxConcurrent} mục tiêu`);
      }
      return parts.join(' · ');
  }
  function formatTagLabel(tag) {
      if (typeof tag !== 'string')
          return '';
      return tag.replace(/-/g, ' ');
  }
  function labelForAbility(entry, fallback) {
      const record = entry;
      if ((record === null || record === void 0 ? void 0 : record.type) && typeof record.type === 'string' && record.type in ABILITY_TYPE_LABELS) {
          return ABILITY_TYPE_LABELS[record.type];
      }
      return fallback || 'Kĩ năng';
  }
  function collectAbilityFacts(entry) {
      const facts = [];
      const addFact = (icon, label, value, tooltip = null) => {
          if (!value)
              return;
          facts.push({
              icon: icon || null,
              label: label || null,
              value,
              tooltip: tooltip || null,
          });
      };
      if (entry && typeof entry === 'object') {
          const record = entry;
          if (record.cost && typeof record.cost === 'object') {
              const formattedCost = formatResourceCost(record.cost);
              if (formattedCost) {
                  addFact('💠', 'Chi phí', formattedCost);
              }
          }
          if (typeof record.hits === 'number' && record.hits > 0) {
              const displayHits = record.hits === 1 ? '1 hit' : `${record.hits} hit`;
              addFact('✦', 'Số hit', displayHits);
          }
          if (typeof record.targets !== 'undefined') {
              const label = formatTargetLabel(record.targets);
              if (label) {
                  addFact('🎯', 'Mục tiêu', label);
              }
          }
          if (record.duration) {
              const label = formatDuration(record.duration);
              if (label) {
                  addFact('⏳', 'Thời lượng', label);
              }
          }
          if (record.summon) {
              const label = formatSummonSummary(record.summon);
              if (label) {
                  addFact('🜂', 'Triệu hồi', label);
              }
          }
          if (record.revive) {
              const label = formatReviveSummary(record.revive);
              if (label) {
                  addFact('✙', 'Hồi sinh', label);
              }
          }
          if (record.link || record.links) {
              const label = formatLinksSummary(record.link || record.links);
              if (label) {
                  addFact('⛓', 'Liên kết', label);
              }
          }
          if (Array.isArray(record.tags)) {
              const resolvedTags = record.tags.map(formatTagLabel).filter(Boolean).join(', ');
              if (resolvedTags) {
                  addFact('🏷', 'Tags', resolvedTags);
              }
          }
          if (record.notes) {
              const notes = Array.isArray(record.notes)
                  ? record.notes
                  : typeof record.notes === 'string'
                      ? [record.notes]
                      : [];
              const uniqueNotes = notes
                  .map((note) => (typeof note === 'string' ? note.trim() : ''))
                  .filter((note, index, array) => note && array.indexOf(note) === index);
              if (uniqueNotes.length) {
                  addFact('🗒', 'Ghi chú', uniqueNotes.join(' · '));
              }
          }
      }
      return facts;
  }
  function getCurrencyCatalog(listCurrencies) {
      const catalog = listCurrencies();
      if (Array.isArray(catalog)) {
          return catalog;
      }
      return [];
  }
  function toIntlNumberFormatter(formatter, locale, options) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
      if (HAS_INTL_NUMBER_FORMAT && formatter instanceof Intl.NumberFormat) {
          return formatter;
      }
      const fallback = typeof formatter === 'object' && formatter && 'format' in formatter
          ? formatter.format.bind(formatter)
          : (value) => String(value !== null && value !== void 0 ? value : '');
      const formatValue = (value) => {
          const normalized = typeof value === 'bigint' ? Number(value) : value;
          try {
              return fallback(normalized);
          }
          catch (error) {
              return String(normalized !== null && normalized !== void 0 ? normalized : '');
          }
      };
      const resolvedOptions = {
          locale: locale && locale.trim() ? locale : 'en',
          numberingSystem: (_a = options === null || options === void 0 ? void 0 : options.numberingSystem) !== null && _a !== void 0 ? _a : 'latn',
          style: (_b = options === null || options === void 0 ? void 0 : options.style) !== null && _b !== void 0 ? _b : 'decimal',
          useGrouping: (_c = options === null || options === void 0 ? void 0 : options.useGrouping) !== null && _c !== void 0 ? _c : true,
          minimumIntegerDigits: (_d = options === null || options === void 0 ? void 0 : options.minimumIntegerDigits) !== null && _d !== void 0 ? _d : 1,
          minimumFractionDigits: (_e = options === null || options === void 0 ? void 0 : options.minimumFractionDigits) !== null && _e !== void 0 ? _e : 0,
          maximumFractionDigits: (_f = options === null || options === void 0 ? void 0 : options.maximumFractionDigits) !== null && _f !== void 0 ? _f : 3,
          minimumSignificantDigits: options === null || options === void 0 ? void 0 : options.minimumSignificantDigits,
          maximumSignificantDigits: options === null || options === void 0 ? void 0 : options.maximumSignificantDigits,
          notation: (_g = options === null || options === void 0 ? void 0 : options.notation) !== null && _g !== void 0 ? _g : 'standard',
          signDisplay: (_h = options === null || options === void 0 ? void 0 : options.signDisplay) !== null && _h !== void 0 ? _h : 'auto',
          compactDisplay: (_j = options === null || options === void 0 ? void 0 : options.compactDisplay) !== null && _j !== void 0 ? _j : 'short',
          currency: options === null || options === void 0 ? void 0 : options.currency,
          currencyDisplay: (_k = options === null || options === void 0 ? void 0 : options.currencyDisplay) !== null && _k !== void 0 ? _k : 'symbol',
          currencySign: (_l = options === null || options === void 0 ? void 0 : options.currencySign) !== null && _l !== void 0 ? _l : 'standard',
          unit: options === null || options === void 0 ? void 0 : options.unit,
          unitDisplay: (_m = options === null || options === void 0 ? void 0 : options.unitDisplay) !== null && _m !== void 0 ? _m : 'short',
      };
      const adapter = {
          format(value) {
              return formatValue(value);
          },
          formatToParts(value) {
              return [{ type: 'literal', value: formatValue(value) }];
          },
          resolvedOptions() {
              return resolvedOptions;
          },
          formatRange(start, end) {
              return `${formatValue(start)} – ${formatValue(end)}`;
          },
          formatRangeToParts(start, end) {
              const startValue = formatValue(start);
              const endValue = formatValue(end);
              const buildPolyfillParts = () => [
                  { type: 'literal', value: startValue, source: 'startRange' },
                  { type: 'literal', value: ' – ', source: 'shared' },
                  { type: 'literal', value: endValue, source: 'endRange' },
              ];
              const resolveSource = (value) => (value === 'startRange' || value === 'endRange' || value === 'shared'
                  ? value
                  : null);
              if (typeof Intl === 'object' && typeof Intl.NumberFormat === 'function') {
                  try {
                      const nativeFormatter = new Intl.NumberFormat(locale, options);
                      if (typeof nativeFormatter.formatRangeToParts === 'function') {
                          const nativeParts = nativeFormatter.formatRangeToParts(start, end);
                          if (nativeParts.every((part) => resolveSource(part.source) != null)) {
                              return nativeParts.map((part) => ({
                                  ...part,
                                  source: resolveSource(part.source),
                              }));
                          }
                      }
                  }
                  catch (error) {
                      // Bỏ qua và sử dụng polyfill.
                  }
              }
              return buildPolyfillParts();
          },
          [Symbol.toStringTag]: 'Intl.NumberFormat',
      };
      return adapter;
  }
  function ensureNumberFormatter(createNumberFormatter, locale, options) {
      const formatter = createNumberFormatter(locale, options);
      return toIntlNumberFormatter(formatter, locale, options);
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'ABILITY_TYPE_LABELS')) exports.ABILITY_TYPE_LABELS = ABILITY_TYPE_LABELS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveCurrencyBalance')) exports.resolveCurrencyBalance = resolveCurrencyBalance;
  if (!Object.prototype.hasOwnProperty.call(exports, 'cloneRoster')) exports.cloneRoster = cloneRoster;
  if (!Object.prototype.hasOwnProperty.call(exports, 'buildRosterWithCost')) exports.buildRosterWithCost = buildRosterWithCost;
  if (!Object.prototype.hasOwnProperty.call(exports, 'describeUlt')) exports.describeUlt = describeUlt;
  if (!Object.prototype.hasOwnProperty.call(exports, 'formatResourceCost')) exports.formatResourceCost = formatResourceCost;
  if (!Object.prototype.hasOwnProperty.call(exports, 'formatDuration')) exports.formatDuration = formatDuration;
  if (!Object.prototype.hasOwnProperty.call(exports, 'formatTargetLabel')) exports.formatTargetLabel = formatTargetLabel;
  if (!Object.prototype.hasOwnProperty.call(exports, 'formatSummonSummary')) exports.formatSummonSummary = formatSummonSummary;
  if (!Object.prototype.hasOwnProperty.call(exports, 'formatReviveSummary')) exports.formatReviveSummary = formatReviveSummary;
  if (!Object.prototype.hasOwnProperty.call(exports, 'formatLinksSummary')) exports.formatLinksSummary = formatLinksSummary;
  if (!Object.prototype.hasOwnProperty.call(exports, 'formatTagLabel')) exports.formatTagLabel = formatTagLabel;
  if (!Object.prototype.hasOwnProperty.call(exports, 'labelForAbility')) exports.labelForAbility = labelForAbility;
  if (!Object.prototype.hasOwnProperty.call(exports, 'collectAbilityFacts')) exports.collectAbilityFacts = collectAbilityFacts;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getCurrencyCatalog')) exports.getCurrencyCatalog = getCurrencyCatalog;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ensureNumberFormatter')) exports.ensureNumberFormatter = ensureNumberFormatter;
});
__define('./screens/collection/index.ts', (exports, module, __require) => {
  const __dep1 = __require('./screens/collection/view.ts');
  const renderCollectionView = __dep1.renderCollectionView;
  const __dep2 = __require('./types/currency.ts');
  const isLineupCurrencies = __dep2.isLineupCurrencies;
  const normalizeCurrencyBalances = __dep2.normalizeCurrencyBalances;
  const isUnknownRecord = (value) => (typeof value === 'object' && value !== null && !Array.isArray(value));
  const toClonedRecord = (value) => ({ ...value });
  function mergeParams(base, override) {
      if (!base && !override)
          return null;
      if (!base) {
          if (isUnknownRecord(override)) {
              return toClonedRecord(override);
          }
          return override !== null && override !== void 0 ? override : null;
      }
      if (!override) {
          if (isUnknownRecord(base)) {
              return toClonedRecord(base);
          }
          return base !== null && base !== void 0 ? base : null;
      }
      if (isUnknownRecord(base) && isUnknownRecord(override)) {
          return { ...base, ...override };
      }
      return override !== null && override !== void 0 ? override : null;
  }
  const toCollectionParams = (value) => (isUnknownRecord(value) ? value : null);
  function mergePlayerState(definitionParams, params) {
      var _a, _b;
      const merged = mergeParams((_a = definitionParams === null || definitionParams === void 0 ? void 0 : definitionParams.playerState) !== null && _a !== void 0 ? _a : null, (_b = params === null || params === void 0 ? void 0 : params.playerState) !== null && _b !== void 0 ? _b : null);
      return merged !== null && merged !== void 0 ? merged : {};
  }
  function resolveRoster(definitionParams, params) {
      var _a;
      const override = Array.isArray(params === null || params === void 0 ? void 0 : params.roster) ? params.roster : null;
      const base = Array.isArray(definitionParams === null || definitionParams === void 0 ? void 0 : definitionParams.roster) ? definitionParams.roster : null;
      return (_a = override !== null && override !== void 0 ? override : base) !== null && _a !== void 0 ? _a : [];
  }
  function resolveCurrencies(definitionParams, params, playerState) {
      const override = params === null || params === void 0 ? void 0 : params.currencies;
      if (isLineupCurrencies(override)) {
          return override !== null && override !== void 0 ? override : null;
      }
      const base = definitionParams === null || definitionParams === void 0 ? void 0 : definitionParams.currencies;
      if (isLineupCurrencies(base)) {
          return base !== null && base !== void 0 ? base : null;
      }
      return normalizeCurrencyBalances(playerState);
  }
  function renderCollectionScreen(options) {
      var _a;
      const { root, shell = null, definition = null, params = null, } = options;
      if (!root) {
          throw new Error('renderCollectionScreen cần một phần tử root hợp lệ.');
      }
      const definitionParams = toCollectionParams((_a = definition === null || definition === void 0 ? void 0 : definition.params) !== null && _a !== void 0 ? _a : null);
      const normalizedParams = toCollectionParams(params);
      const playerState = mergePlayerState(definitionParams, normalizedParams);
      const roster = resolveRoster(definitionParams, normalizedParams);
      const currencies = resolveCurrencies(definitionParams, normalizedParams, playerState);
      return renderCollectionView({
          root,
          shell,
          definition,
          playerState,
          roster,
          currencies,
      });
  }
  const __reexport0 = __require('./screens/collection/view.ts');

  if (!Object.prototype.hasOwnProperty.call(exports, 'renderCollectionView')) exports.renderCollectionView = __reexport0.renderCollectionView;
  if (!Object.prototype.hasOwnProperty.call(exports, 'renderCollectionScreen')) exports.renderCollectionScreen = renderCollectionScreen;
});
__define('./screens/collection/state.ts', (exports, module, __require) => {
  function createFilterState(initial) {
      var _a, _b;
      return {
          activeTab: (_a = initial === null || initial === void 0 ? void 0 : initial.activeTab) !== null && _a !== void 0 ? _a : 'awakening',
          selectedUnitId: (_b = initial === null || initial === void 0 ? void 0 : initial.selectedUnitId) !== null && _b !== void 0 ? _b : null,
      };
  }
  function updateActiveTab(state, tab) {
      state.activeTab = tab;
  }
  function updateSelectedUnit(state, unitId) {
      state.selectedUnitId = unitId;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'createFilterState')) exports.createFilterState = createFilterState;
  if (!Object.prototype.hasOwnProperty.call(exports, 'updateActiveTab')) exports.updateActiveTab = updateActiveTab;
  if (!Object.prototype.hasOwnProperty.call(exports, 'updateSelectedUnit')) exports.updateSelectedUnit = updateSelectedUnit;
});
__define('./screens/collection/types.ts', (exports, module, __require) => {


});
__define('./screens/collection/view.ts', (exports, module, __require) => {
  const __dep0 = __require('./art.ts');
  const getUnitArt = __dep0.getUnitArt;
  const __dep1 = __require('./utils/unit-id.ts');
  const normalizeUnitId = __dep1.normalizeUnitId;
  const __dep2 = __require('./data/economy.ts');
  const listCurrencies = __dep2.listCurrencies;
  const __dep3 = __require('./data/skills.ts');
  const getSkillSet = __dep3.getSkillSet;
  const __dep4 = __require('./utils/format.ts');
  const createNumberFormatter = __dep4.createNumberFormatter;
  const __dep5 = __require('./ui/dom.ts');
  const assertElement = __dep5.assertElement;
  const ensureStyleTag = __dep5.ensureStyleTag;
  const mountSection = __dep5.mountSection;
  const __dep6 = __require('./screens/collection/helpers.ts');
  const ABILITY_TYPE_LABELS = __dep6.ABILITY_TYPE_LABELS;
  const buildRosterWithCost = __dep6.buildRosterWithCost;
  const cloneRoster = __dep6.cloneRoster;
  const collectAbilityFacts = __dep6.collectAbilityFacts;
  const describeUlt = __dep6.describeUlt;
  const labelForAbility = __dep6.labelForAbility;
  const resolveCurrencyBalance = __dep6.resolveCurrencyBalance;
  const getCurrencyCatalog = __dep6.getCurrencyCatalog;
  const ensureNumberFormatter = __dep6.ensureNumberFormatter;
  const __dep7 = __require('./screens/collection/state.ts');
  const createFilterState = __dep7.createFilterState;
  const updateActiveTab = __dep7.updateActiveTab;
  const updateSelectedUnit = __dep7.updateSelectedUnit;
  const STYLE_ID = 'collection-view-style-v2';
  const TAB_DEFINITIONS = [
      { key: 'awakening', label: 'Thức Tỉnh', hint: 'Theo dõi mốc thức tỉnh, sao và điểm đột phá của nhân vật đã sở hữu.' },
      { key: 'skills', label: 'Kĩ Năng', hint: 'Mở lớp phủ mô tả kỹ năng, chuỗi nâng cấp và yêu cầu nguyên liệu.' },
      { key: 'arts', label: 'Công Pháp & Trang Bị', hint: 'Liệt kê công pháp, pháp khí và trang bị đang trang bị cho nhân vật.' },
      { key: 'skins', label: 'Skin', hint: 'Quản lý skin đã mở khóa và áp dụng bảng phối màu yêu thích.' },
      { key: 'voice', label: 'Giọng Nói', hint: 'Nghe thử voice line, thiết lập voice pack và gợi ý mở khóa.' }
  ];
  const currencyCatalog = getCurrencyCatalog(listCurrencies);
  const currencyFormatter = ensureNumberFormatter(createNumberFormatter, 'vi-VN');
  function toSafeText(value) {
      if (value == null) {
          return '';
      }
      if (typeof value === 'number') {
          return Number.isFinite(value) ? String(value) : '';
      }
      return value;
  }
  function ensureStyles() {
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
      ensureStyleTag(STYLE_ID, { css });
  }
  function renderAbilityCard(entry, options = {}) {
      var _a, _b, _c;
      const { typeLabel = null, unitId = null } = options;
      const card = document.createElement('article');
      card.className = 'collection-skill-card';
      const header = document.createElement('header');
      header.className = 'collection-skill-card__header';
      const title = document.createElement('h4');
      title.className = 'collection-skill-card__title';
      title.textContent = toSafeText((_a = entry === null || entry === void 0 ? void 0 : entry.name) !== null && _a !== void 0 ? _a : 'Kĩ năng');
      header.appendChild(title);
      const actions = document.createElement('div');
      actions.className = 'collection-skill-card__actions';
      const resolvedTypeLabel = typeLabel || labelForAbility(entry);
      const badge = document.createElement('span');
      badge.className = 'collection-skill-card__badge';
      badge.textContent = toSafeText(resolvedTypeLabel);
      actions.appendChild(badge);
      const abilityId = (_c = (_b = entry === null || entry === void 0 ? void 0 : entry.id) !== null && _b !== void 0 ? _b : entry === null || entry === void 0 ? void 0 : entry.abilityId) !== null && _c !== void 0 ? _c : null;
      const upgradeButton = document.createElement('button');
      upgradeButton.type = 'button';
      upgradeButton.className = 'collection-skill-card__upgrade';
      upgradeButton.textContent = 'Nâng cấp';
      if (abilityId != null) {
          upgradeButton.dataset.abilityId = String(abilityId);
      }
      upgradeButton.addEventListener('click', () => {
          const detail = { abilityId, ability: entry };
          card.dispatchEvent(new CustomEvent('collection:request-upgrade', { bubbles: true, detail }));
      });
      actions.appendChild(upgradeButton);
      header.appendChild(actions);
      card.appendChild(header);
      const descriptionText = (entry === null || entry === void 0 ? void 0 : entry.description) && String(entry.description).trim() !== ''
          ? String(entry.description)
          : 'Chưa có mô tả chi tiết.';
      card.dataset.description = descriptionText;
      if (resolvedTypeLabel) {
          card.dataset.typeLabel = resolvedTypeLabel;
      }
      if (unitId) {
          card.dataset.unitId = String(unitId);
      }
      if (abilityId != null) {
          card.dataset.abilityId = String(abilityId);
      }
      if (Array.isArray(entry === null || entry === void 0 ? void 0 : entry.notes)) {
          const filteredNotes = entry.notes
              .map(note => (typeof note === 'string' ? note.trim() : ''))
              .filter(note => note.length > 0);
          if (filteredNotes.length) {
              card.dataset.notes = JSON.stringify(filteredNotes);
          }
      }
      const facts = collectAbilityFacts(entry);
      if (facts.length) {
          card.dataset.meta = JSON.stringify(facts);
      }
      card.addEventListener('click', event => {
          const target = event.target;
          if (target === null || target === void 0 ? void 0 : target.closest('.collection-skill-card__upgrade')) {
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
  function renderCollectionView(options) {
      var _a;
      const { root, shell = null, playerState = {}, roster = null, currencies = null, } = options;
      const host = assertElement(root, {
          guard: (node) => node instanceof HTMLElement,
          message: 'renderCollectionView cần một phần tử root hợp lệ.',
      });
      ensureStyles();
      const cleanups = [];
      const addCleanup = (fn) => {
          if (typeof fn === 'function')
              cleanups.push(fn);
      };
      const filterState = createFilterState();
      const container = document.createElement('div');
      container.className = 'collection-view';
      const mount = mountSection({
          root: host,
          section: container,
          rootClasses: 'app--collection',
      });
      const header = document.createElement('header');
      header.className = 'collection-view__header';
      const titleGroup = document.createElement('div');
      titleGroup.className = 'collection-view__title-group';
      const backButton = document.createElement('button');
      backButton.type = 'button';
      backButton.className = 'collection-view__back';
      backButton.textContent = '← Trở về menu chính';
      const handleBack = () => {
          if (shell && typeof shell.enterScreen === 'function') {
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
      for (const currency of currencyCatalog) {
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
      for (const unit of rosterSource) {
          const unitId = normalizeUnitId(unit.id);
          const item = document.createElement('li');
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'collection-roster__entry';
          button.dataset.unitId = unitId;
          button.dataset.rank = unit.rank || 'unknown';
          const avatar = document.createElement('div');
          avatar.className = 'collection-roster__avatar';
          const aura = document.createElement('div');
          aura.className = 'collection-roster__aura';
          avatar.appendChild(aura);
          const art = getUnitArt(unitId);
          if ((_a = art === null || art === void 0 ? void 0 : art.sprite) === null || _a === void 0 ? void 0 : _a.src) {
              const img = document.createElement('img');
              img.src = art.sprite.src;
              img.alt = unit.name || unitId;
              avatar.appendChild(img);
          }
          else {
              const fallback = document.createElement('span');
              fallback.textContent = '—';
              avatar.appendChild(fallback);
          }
          const cost = document.createElement('span');
          cost.className = 'collection-roster__cost';
          const costValue = Number.isFinite(unit.cost) ? unit.cost : '—';
          cost.textContent = `Cost ${costValue}`;
          const tooltipParts = [unit.name || unitId];
          if (unit.rank) {
              tooltipParts.push(`Rank ${unit.rank}`);
          }
          if (unit.class) {
              tooltipParts.push(unit.class);
          }
          button.title = tooltipParts.join(' • ');
          button.setAttribute('aria-label', tooltipParts.join(' • '));
          button.appendChild(avatar);
          button.appendChild(cost);
          const handleSelect = () => {
              selectUnit(unitId);
          };
          button.addEventListener('click', handleSelect);
          addCleanup(() => button.removeEventListener('click', handleSelect));
          item.appendChild(button);
          rosterList.appendChild(item);
          rosterEntries.set(unitId, { button, costEl: cost, meta: unit });
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
          if (activeAbilityCard) {
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
          while (detailFacts.firstChild) {
              detailFacts.removeChild(detailFacts.firstChild);
          }
          while (detailNotes.firstChild) {
              detailNotes.removeChild(detailNotes.firstChild);
          }
          detailEmpty.style.display = 'none';
      };
      const populateSkillDetail = (card, payload) => {
          var _a;
          const ability = ((_a = payload === null || payload === void 0 ? void 0 : payload.ability) !== null && _a !== void 0 ? _a : null);
          if (!ability) {
              clearSkillDetail();
              return;
          }
          if (activeAbilityCard && activeAbilityCard !== card) {
              activeAbilityCard.classList.remove('is-expanded');
          }
          if (activeAbilityCard === card && overlayDetailPanel.classList.contains('is-active')) {
              clearSkillDetail();
              return;
          }
          activeAbilityCard = card;
          activeAbilityCard.classList.add('is-expanded');
          const abilityName = (ability === null || ability === void 0 ? void 0 : ability.name) || 'Kĩ năng';
          detailTitle.textContent = toSafeText(abilityName);
          const typeLabel = (payload === null || payload === void 0 ? void 0 : payload.typeLabel)
              || card.dataset.typeLabel
              || labelForAbility(ability);
          if (typeLabel) {
              detailBadge.textContent = toSafeText(typeLabel);
              detailBadge.style.display = '';
          }
          else {
              detailBadge.textContent = '';
              detailBadge.style.display = 'none';
          }
          const description = (ability === null || ability === void 0 ? void 0 : ability.description) && String(ability.description).trim() !== ''
              ? String(ability.description)
              : card.dataset.description || 'Chưa có mô tả chi tiết.';
          detailDescription.textContent = toSafeText(description);
          while (detailFacts.firstChild) {
              detailFacts.removeChild(detailFacts.firstChild);
          }
          const facts = collectAbilityFacts(ability);
          if (facts.length) {
              for (const fact of facts) {
                  const item = document.createElement('div');
                  item.className = 'collection-skill-detail__fact';
                  if (fact.icon) {
                      const iconEl = document.createElement('span');
                      iconEl.className = 'collection-skill-detail__fact-icon';
                      iconEl.textContent = toSafeText(fact.icon);
                      item.appendChild(iconEl);
                  }
                  const factBody = document.createElement('div');
                  if (fact.label) {
                      const labelEl = document.createElement('div');
                      labelEl.className = 'collection-skill-detail__fact-label';
                      labelEl.textContent = toSafeText(fact.label);
                      factBody.appendChild(labelEl);
                  }
                  const valueEl = document.createElement('div');
                  valueEl.className = 'collection-skill-detail__fact-value';
                  valueEl.textContent = toSafeText(fact.value);
                  factBody.appendChild(valueEl);
                  if (fact.tooltip) {
                      valueEl.title = fact.tooltip;
                  }
                  item.appendChild(factBody);
                  detailFacts.appendChild(item);
              }
          }
          while (detailNotes.firstChild) {
              detailNotes.removeChild(detailNotes.firstChild);
          }
          const rawNotes = Array.isArray(ability === null || ability === void 0 ? void 0 : ability.notes) ? ability.notes : [];
          let cardNotes = [];
          if (card.dataset.notes) {
              try {
                  const parsed = JSON.parse(card.dataset.notes);
                  if (Array.isArray(parsed)) {
                      cardNotes = parsed;
                  }
              }
              catch (error) {
                  // bỏ qua lỗi parse và tiếp tục với danh sách rỗng
              }
          }
          const mergedNotes = [...rawNotes, ...cardNotes]
              .map(note => (typeof note === 'string' ? note.trim() : ''))
              .filter((note, index, array) => note && array.indexOf(note) === index);
          if (mergedNotes.length) {
              for (const note of mergedNotes) {
                  const noteItem = document.createElement('li');
                  noteItem.textContent = toSafeText(note);
                  detailNotes.appendChild(noteItem);
              }
              detailEmpty.style.display = 'none';
          }
          else {
              detailEmpty.style.display = '';
          }
          overlayDetailPanel.hidden = false;
          overlayDetailPanel.classList.add('is-active');
          overlayDetailPanel.setAttribute('aria-hidden', 'false');
          overlayContent.classList.add('has-detail');
      };
      const handleSkillDetailToggle = (event) => {
          const target = event.target;
          const card = target === null || target === void 0 ? void 0 : target.closest('.collection-skill-card');
          if (!card) {
              return;
          }
          populateSkillDetail(card, event.detail);
      };
      overlay.addEventListener('collection:toggle-skill-detail', handleSkillDetailToggle);
      addCleanup(() => overlay.removeEventListener('collection:toggle-skill-detail', handleSkillDetailToggle));
      const handleGlobalClick = (event) => {
          if (overlayDetailPanel.hidden)
              return;
          const target = event.target;
          if (target && overlay.contains(target)) {
              if (target.closest('.collection-skill-detail'))
                  return;
              if (target.closest('.collection-skill-card'))
                  return;
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
      const setActiveTab = (key) => {
          updateActiveTab(filterState, key);
          for (const [tabKey, button] of tabButtons) {
              if (!button)
                  continue;
              if (tabKey === key) {
                  button.classList.add('is-active');
              }
              else {
                  button.classList.remove('is-active');
              }
          }
          const definition = TAB_DEFINITIONS.find(tab => tab.key === key);
          stageStatus.textContent = (definition === null || definition === void 0 ? void 0 : definition.hint) || 'Khung thông tin chức năng.';
          if (key === 'skills') {
              overlay.classList.add('is-open');
          }
          else {
              overlay.classList.remove('is-open');
              clearSkillDetail();
          }
      };
      const handleTabClick = (key) => {
          if (key === 'close') {
              if (shell && typeof shell.enterScreen === 'function') {
                  shell.enterScreen('main-menu');
              }
              return;
          }
          setActiveTab(key);
      };
      for (const tab of TAB_DEFINITIONS) {
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
          if (shell && typeof shell.enterScreen === 'function') {
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
      if (root.appendChild) {
          root.appendChild(container);
      }
      const selectUnit = (unitId) => {
          var _a, _b, _c, _d, _e, _f;
          if (!unitId || !rosterEntries.has(unitId))
              return;
          updateSelectedUnit(filterState, unitId);
          clearSkillDetail();
          for (const [id, entry] of rosterEntries) {
              if (!(entry === null || entry === void 0 ? void 0 : entry.button))
                  continue;
              if (id === unitId) {
                  entry.button.classList.add('is-selected');
                  if (entry.costEl) {
                      entry.costEl.classList.add('is-highlighted');
                  }
              }
              else {
                  entry.button.classList.remove('is-selected');
                  if (entry.costEl) {
                      entry.costEl.classList.remove('is-highlighted');
                  }
              }
          }
          const unit = ((_a = rosterEntries.get(unitId)) === null || _a === void 0 ? void 0 : _a.meta) || null;
          stageName.textContent = toSafeText((_b = unit === null || unit === void 0 ? void 0 : unit.name) !== null && _b !== void 0 ? _b : unitId);
          while (stageTags.firstChild) {
              stageTags.removeChild(stageTags.firstChild);
          }
          if (unit === null || unit === void 0 ? void 0 : unit.rank) {
              const rankTag = document.createElement('span');
              rankTag.className = 'collection-stage__tag';
              rankTag.textContent = toSafeText(`Rank ${unit.rank}`);
              stageTags.appendChild(rankTag);
          }
          if (unit === null || unit === void 0 ? void 0 : unit.class) {
              const classTag = document.createElement('span');
              classTag.className = 'collection-stage__tag';
              classTag.textContent = toSafeText(unit.class);
              stageTags.appendChild(classTag);
          }
          const costValue = unit && Number.isFinite(unit.cost) ? unit.cost : '—';
          stageCost.textContent = `Cost ${toSafeText(costValue)}`;
          const art = getUnitArt(unitId);
          if ((_c = art === null || art === void 0 ? void 0 : art.sprite) === null || _c === void 0 ? void 0 : _c.src) {
              stageSprite.src = art.sprite.src;
              stageSprite.alt = toSafeText((_d = unit === null || unit === void 0 ? void 0 : unit.name) !== null && _d !== void 0 ? _d : unitId);
              stageSprite.style.opacity = '1';
          }
          else {
              stageSprite.removeAttribute('src');
              stageSprite.alt = '';
              stageSprite.style.opacity = '0';
          }
          overlayTitle.textContent = toSafeText((unit === null || unit === void 0 ? void 0 : unit.name) ? `Kĩ năng · ${unit.name}` : 'Kĩ năng');
          const skillSet = getSkillSet(unitId);
          overlaySubtitle.textContent = toSafeText(describeUlt(unit));
          const summaryNote = (_f = (_e = skillSet === null || skillSet === void 0 ? void 0 : skillSet.notes) === null || _e === void 0 ? void 0 : _e[0]) !== null && _f !== void 0 ? _f : '';
          overlaySummary.textContent = toSafeText(summaryNote);
          overlaySummary.style.display = summaryNote ? '' : 'none';
          while (overlayNotesList.firstChild) {
              overlayNotesList.removeChild(overlayNotesList.firstChild);
          }
          const extraNotes = Array.isArray(skillSet === null || skillSet === void 0 ? void 0 : skillSet.notes) ? skillSet.notes.slice(1) : [];
          if (extraNotes.length) {
              overlayNotesList.style.display = '';
              for (const note of extraNotes) {
                  if (!note)
                      continue;
                  const item = document.createElement('li');
                  item.textContent = toSafeText(note);
                  overlayNotesList.appendChild(item);
              }
          }
          else {
              overlayNotesList.style.display = 'none';
          }
          while (overlayAbilities.firstChild) {
              overlayAbilities.removeChild(overlayAbilities.firstChild);
          }
          const abilityEntries = [];
          if (skillSet === null || skillSet === void 0 ? void 0 : skillSet.basic) {
              abilityEntries.push({ entry: skillSet.basic, label: ABILITY_TYPE_LABELS.basic });
          }
          if (Array.isArray(skillSet === null || skillSet === void 0 ? void 0 : skillSet.skills)) {
              skillSet.skills.forEach((skill, index) => {
                  if (!skill)
                      return;
                  abilityEntries.push({ entry: skill, label: `Kĩ năng ${index + 1}` });
              });
          }
          if (skillSet === null || skillSet === void 0 ? void 0 : skillSet.ult) {
              abilityEntries.push({ entry: skillSet.ult, label: ABILITY_TYPE_LABELS.ultimate });
          }
          if (skillSet === null || skillSet === void 0 ? void 0 : skillSet.talent) {
              abilityEntries.push({ entry: skillSet.talent, label: ABILITY_TYPE_LABELS.talent });
          }
          if (skillSet === null || skillSet === void 0 ? void 0 : skillSet.technique) {
              abilityEntries.push({ entry: skillSet.technique, label: ABILITY_TYPE_LABELS.technique });
          }
          if (abilityEntries.length) {
              for (const ability of abilityEntries) {
                  overlayAbilities.appendChild(renderAbilityCard(ability.entry, { typeLabel: ability.label, unitId }));
              }
          }
          else {
              const placeholder = document.createElement('p');
              placeholder.className = 'collection-skill-card__empty';
              placeholder.textContent = 'Chưa có dữ liệu kỹ năng chi tiết cho nhân vật này.';
              overlayAbilities.appendChild(placeholder);
          }
          if (filterState.activeTab === 'skills') {
              overlay.classList.add('is-open');
          }
      };
      const observer = new MutationObserver(() => {
          // placeholder to keep overlay in DOM order if needed
      });
      observer.observe(stage, { childList: true });
      addCleanup(() => observer.disconnect());
      if (rosterEntries.size > 0) {
          const [firstId] = rosterEntries.keys();
          if (firstId) {
              selectUnit(firstId);
          }
      }
      setActiveTab(filterState.activeTab);
      return {
          destroy() {
              for (const fn of cleanups.splice(0, cleanups.length)) {
                  try {
                      fn();
                  }
                  catch (error) {
                      console.error('[collection] cleanup error', error);
                  }
              }
              mount.destroy();
          }
      };
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'renderCollectionView')) exports.renderCollectionView = renderCollectionView;
});
__define('./screens/lineup/index.ts', (exports, module, __require) => {
  const __dep1 = __require('./screens/lineup/view/index.ts');
  const renderLineupView = __dep1.renderLineupView;
  const __dep2 = __require('./types/currency.ts');
  const isCurrencyEntry = __dep2.isCurrencyEntry;
  const isLineupCurrencies = __dep2.isLineupCurrencies;
  const normalizeCurrencyBalances = __dep2.normalizeCurrencyBalances;
  const isUnknownRecord = (value) => (typeof value === 'object'
      && value !== null
      && !Array.isArray(value));
  const toLineupParams = (value) => (isUnknownRecord(value) ? value : null);
  const cloneMergeable = (value) => {
      if (Array.isArray(value)) {
          return value.slice();
      }
      return { ...value };
  };
  const mergeParams = (base, override) => {
      if (!base && !override)
          return null;
      if (!base)
          return override ? cloneMergeable(override) : null;
      if (!override)
          return cloneMergeable(base);
      if (Array.isArray(base) && Array.isArray(override)) {
          return cloneMergeable(override);
      }
      if (!Array.isArray(base) && !Array.isArray(override)) {
          return { ...base, ...override };
      }
      return cloneMergeable(override);
  };
  const cloneCurrencyValue = (value) => {
      if (isCurrencyEntry(value)) {
          return { ...value };
      }
      return value;
  };
  const isCurrencyValueRecord = (value) => (value != null
      && typeof value === 'object'
      && !Array.isArray(value));
  const cloneCurrencyRecord = (source) => {
      if (!source) {
          return {};
      }
      return Object.fromEntries(Object.entries(source).map(([id, entry]) => [
          id,
          cloneCurrencyValue(entry),
      ]));
  };
  const cloneLineupCurrencies = (source) => {
      var _a;
      if (Array.isArray(source)) {
          return source.map(item => cloneCurrencyValue(item));
      }
      const mapSource = source;
      const clone = {};
      Object.entries(mapSource).forEach(([key, value]) => {
          if (key === 'balances') {
              if (isCurrencyValueRecord(value)) {
                  clone.balances = cloneCurrencyRecord(value);
              }
              else if (value == null) {
                  clone.balances = null;
              }
              return;
          }
          if (Array.isArray(value)) {
              clone[key] = value.map(item => cloneCurrencyValue(item));
              return;
          }
          if (isCurrencyEntry(value)) {
              clone[key] = { ...value };
              return;
          }
          clone[key] = value;
      });
      if (!('balances' in clone) && 'balances' in mapSource) {
          clone.balances = (_a = mapSource.balances) !== null && _a !== void 0 ? _a : null;
      }
      return clone;
  };
  const toMergeable = (value) => {
      if (Array.isArray(value))
          return value;
      if (isUnknownRecord(value))
          return value;
      return null;
  };
  const toRosterSource = (value) => {
      if (Array.isArray(value)) {
          return value;
      }
      if (value == null) {
          return value !== null && value !== void 0 ? value : undefined;
      }
      return null;
  };
  function resolveLineups(definitionParams, params) {
      const base = Array.isArray(definitionParams === null || definitionParams === void 0 ? void 0 : definitionParams.lineups) ? definitionParams === null || definitionParams === void 0 ? void 0 : definitionParams.lineups : null;
      const override = Array.isArray(params === null || params === void 0 ? void 0 : params.lineups) ? params === null || params === void 0 ? void 0 : params.lineups : null;
      if (override)
          return override;
      if (base)
          return base;
      return [];
  }
  function renderLineupScreen(options) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const { root, shell = null, definition = null, params = null } = options;
      if (!root) {
          throw new Error('renderLineupScreen cần một phần tử root hợp lệ.');
      }
      const defParams = toLineupParams((_a = definition === null || definition === void 0 ? void 0 : definition.params) !== null && _a !== void 0 ? _a : null);
      const normalizedParams = toLineupParams(params);
      const mergedPlayerState = mergeParams((_b = defParams === null || defParams === void 0 ? void 0 : defParams.playerState) !== null && _b !== void 0 ? _b : null, (_c = normalizedParams === null || normalizedParams === void 0 ? void 0 : normalizedParams.playerState) !== null && _c !== void 0 ? _c : null) || {};
      const lineups = resolveLineups(defParams, normalizedParams);
      const mergedRosterSource = mergeParams(toMergeable(defParams === null || defParams === void 0 ? void 0 : defParams.roster), toMergeable(normalizedParams === null || normalizedParams === void 0 ? void 0 : normalizedParams.roster));
      const roster = toRosterSource(mergedRosterSource);
      const baseCurrencies = isLineupCurrencies(defParams === null || defParams === void 0 ? void 0 : defParams.currencies) ? (_d = defParams === null || defParams === void 0 ? void 0 : defParams.currencies) !== null && _d !== void 0 ? _d : null : null;
      const overrideCurrencies = isLineupCurrencies(normalizedParams === null || normalizedParams === void 0 ? void 0 : normalizedParams.currencies) ? (_e = normalizedParams === null || normalizedParams === void 0 ? void 0 : normalizedParams.currencies) !== null && _e !== void 0 ? _e : null : null;
      const mergedCurrencySource = mergeParams(baseCurrencies, overrideCurrencies);
      const playerCurrencySource = normalizeCurrencyBalances(mergedPlayerState);
      const currencies = mergedCurrencySource
          ? cloneLineupCurrencies(mergedCurrencySource)
          : playerCurrencySource
              ? cloneLineupCurrencies(playerCurrencySource)
              : null;
      const description = (_h = (_g = (_f = params === null || params === void 0 ? void 0 : params.shortDescription) !== null && _f !== void 0 ? _f : defParams === null || defParams === void 0 ? void 0 : defParams.shortDescription) !== null && _g !== void 0 ? _g : definition === null || definition === void 0 ? void 0 : definition.description) !== null && _h !== void 0 ? _h : '';
      return renderLineupView({
          root,
          shell,
          definition,
          description,
          lineups,
          roster,
          playerState: mergedPlayerState,
          currencies,
      });
  }
  const __reexport0 = __require('./screens/lineup/view/index.ts');

  if (!Object.prototype.hasOwnProperty.call(exports, 'renderLineupView')) exports.renderLineupView = __reexport0.renderLineupView;
  if (!Object.prototype.hasOwnProperty.call(exports, 'renderLineupScreen')) exports.renderLineupScreen = renderLineupScreen;
});
__define('./screens/lineup/view/events.ts', (exports, module, __require) => {
  const __dep0 = __require('./screens/lineup/view/state.ts');
  const assignUnitToBench = __dep0.assignUnitToBench;
  const assignUnitToSlot = __dep0.assignUnitToSlot;
  const removeUnitFromBench = __dep0.removeUnitFromBench;
  const removeUnitFromSlot = __dep0.removeUnitFromSlot;
  const setLeader = __dep0.setLeader;
  const unlockSlot = __dep0.unlockSlot;
  const formatCurrencyBalance = __dep0.formatCurrencyBalance;
  function bindLineupEvents(context) {
      const { state, elements, helpers, overlays, rosterLookup, shell } = context;
      const { backButton, slotsGrid, benchGrid, benchDetails, passiveGrid, rosterFilters, rosterList, leaderAvatar, leaderSection, passiveOverlay, passiveClose, leaderOverlay, leaderOverlayBody, leaderClose, } = elements;
      const cleanup = [];
      let leaderObserver = null;
      if (typeof ResizeObserver === 'function') {
          leaderObserver = new ResizeObserver(() => {
              helpers.syncBenchDetailsHeight();
          });
          leaderObserver.observe(leaderSection);
          cleanup.push(() => {
              if (leaderObserver) {
                  leaderObserver.disconnect();
              }
          });
      }
      const handleWindowResize = () => helpers.syncBenchDetailsHeight();
      if (typeof window !== 'undefined') {
          window.addEventListener('resize', handleWindowResize);
          cleanup.push(() => {
              window.removeEventListener('resize', handleWindowResize);
          });
      }
      const handleBack = () => {
          if (shell && typeof shell.enterScreen === 'function') {
              shell.enterScreen('main-menu');
          }
          else if (typeof window !== 'undefined') {
              if (window.history && typeof window.history.back === 'function') {
                  window.history.back();
              }
              else {
                  window.dispatchEvent(new CustomEvent('lineup:back'));
              }
          }
      };
      backButton.addEventListener('click', handleBack);
      cleanup.push(() => backButton.removeEventListener('click', handleBack));
      const handleBenchInteraction = (event) => {
          var _a;
          const benchEl = (_a = event.target) === null || _a === void 0 ? void 0 : _a.closest('.lineup-bench__cell');
          if (!benchEl)
              return;
          const lineup = helpers.getSelectedLineup();
          if (!lineup)
              return;
          const benchIndex = Number(benchEl.dataset.benchIndex);
          if (!Number.isFinite(benchIndex))
              return;
          const cell = lineup.bench[benchIndex];
          if (!cell)
              return;
          if (state.selectedUnitId) {
              const result = assignUnitToBench(lineup, benchIndex, state.selectedUnitId);
              if (!result.ok) {
                  helpers.setMessage(result.message || 'Không thể gán nhân vật.', 'error');
              }
              else {
                  helpers.setMessage('Đã thêm nhân vật vào dự bị.', 'info');
              }
              helpers.renderSlots();
              helpers.renderBench();
              helpers.renderBenchDetails();
              helpers.renderLeader();
              helpers.renderPassives();
              helpers.renderRoster();
              return;
          }
          const mouseEvent = event;
          if (mouseEvent.altKey || mouseEvent.ctrlKey || mouseEvent.metaKey) {
              if (cell.unitId) {
                  removeUnitFromBench(lineup, benchIndex);
                  state.activeBenchIndex = benchIndex;
                  helpers.renderSlots();
                  helpers.renderBench();
                  helpers.renderBenchDetails();
                  helpers.renderPassives();
                  helpers.renderRoster();
                  helpers.renderLeader();
                  helpers.setMessage('Đã bỏ nhân vật khỏi dự bị.', 'info');
              }
              return;
          }
          state.activeBenchIndex = benchIndex;
          helpers.updateActiveBenchHighlight();
          helpers.renderBenchDetails();
      };
      benchGrid.addEventListener('click', handleBenchInteraction);
      cleanup.push(() => benchGrid.removeEventListener('click', handleBenchInteraction));
      const handleBenchFocus = (event) => {
          var _a;
          const benchEl = (_a = event.target) === null || _a === void 0 ? void 0 : _a.closest('.lineup-bench__cell');
          if (!benchEl)
              return;
          const lineup = helpers.getSelectedLineup();
          if (!lineup)
              return;
          const benchIndex = Number(benchEl.dataset.benchIndex);
          if (!Number.isFinite(benchIndex))
              return;
          if (state.activeBenchIndex === benchIndex)
              return;
          state.activeBenchIndex = benchIndex;
          helpers.updateActiveBenchHighlight();
          helpers.renderBenchDetails();
      };
      benchGrid.addEventListener('focusin', handleBenchFocus);
      cleanup.push(() => benchGrid.removeEventListener('focusin', handleBenchFocus));
      benchGrid.addEventListener('mouseenter', handleBenchFocus, true);
      cleanup.push(() => benchGrid.removeEventListener('mouseenter', handleBenchFocus, true));
      const handleSlotInteraction = (event) => {
          var _a, _b, _c;
          const slotEl = (_a = event.target) === null || _a === void 0 ? void 0 : _a.closest('.lineup-slot');
          if (!slotEl)
              return;
          const lineup = helpers.getSelectedLineup();
          if (!lineup)
              return;
          const slotIndex = Number(slotEl.dataset.slotIndex);
          if (!Number.isFinite(slotIndex))
              return;
          const slot = lineup.slots[slotIndex];
          if (!slot)
              return;
          const actionButton = (_b = event.target) === null || _b === void 0 ? void 0 : _b.closest('.lineup-button');
          const action = (_c = actionButton === null || actionButton === void 0 ? void 0 : actionButton.dataset.slotAction) !== null && _c !== void 0 ? _c : null;
          if (action === 'unlock') {
              const result = unlockSlot(lineup, slotIndex, state.currencyBalances);
              if (!result.ok) {
                  helpers.setMessage(result.message || 'Không thể mở khóa vị trí.', 'error');
                  return;
              }
              const spentText = result.spent
                  ? formatCurrencyBalance(result.spent.amount, result.spent.currencyId)
                  : null;
              helpers.setMessage(spentText
                  ? `Đã mở khóa vị trí ${slotIndex + 1} (tốn ${spentText}).`
                  : `Đã mở khóa vị trí ${slotIndex + 1}.`, 'info');
              helpers.renderSlots();
              helpers.renderBench();
              helpers.renderBenchDetails();
              helpers.renderLeader();
              helpers.renderPassives();
              helpers.renderRoster();
              helpers.refreshWallet();
              return;
          }
          if (!slot.unlocked) {
              helpers.setMessage('Vị trí đang bị khóa.', 'error');
              return;
          }
          const mouseEvent = event;
          const isModifierClear = action === 'clear'
              || (mouseEvent && (mouseEvent.altKey || mouseEvent.ctrlKey || mouseEvent.metaKey));
          if (isModifierClear) {
              if (!slot.unitId) {
                  helpers.setMessage('Ô này đang trống.', 'info');
                  return;
              }
              const removedUnitId = slot.unitId;
              removeUnitFromSlot(lineup, slotIndex);
              if (state.selectedUnitId === removedUnitId) {
                  state.selectedUnitId = null;
              }
              helpers.setMessage('Đã bỏ nhân vật khỏi vị trí.', 'info');
              helpers.renderSlots();
              helpers.renderBench();
              helpers.renderBenchDetails();
              helpers.renderLeader();
              helpers.renderPassives();
              helpers.renderRoster();
              return;
          }
          if (!state.selectedUnitId) {
              if (slot.unitId) {
                  state.selectedUnitId = slot.unitId;
                  const unit = rosterLookup.get(slot.unitId);
                  helpers.setMessage(`Đã chọn ${(unit === null || unit === void 0 ? void 0 : unit.name) || 'nhân vật'} đang ở vị trí ${slotIndex + 1}. Chọn ô khác để hoán đổi hoặc nhấn "Bỏ".`, 'info');
                  helpers.renderRoster();
                  helpers.renderSlots();
              }
              else {
                  helpers.setMessage('Chọn nhân vật từ roster để gán vào vị trí này.', 'info');
              }
              return;
          }
          const result = assignUnitToSlot(lineup, slotIndex, state.selectedUnitId);
          if (!result.ok) {
              helpers.setMessage(result.message || 'Không thể gán nhân vật.', 'error');
              return;
          }
          const unit = rosterLookup.get(state.selectedUnitId);
          helpers.setMessage(`Đã gán ${(unit === null || unit === void 0 ? void 0 : unit.name) || 'nhân vật'} vào vị trí ${slotIndex + 1}.`, 'info');
          state.selectedUnitId = null;
          helpers.renderSlots();
          helpers.renderBench();
          helpers.renderBenchDetails();
          helpers.renderLeader();
          helpers.renderPassives();
          helpers.renderRoster();
      };
      slotsGrid.addEventListener('click', handleSlotInteraction);
      cleanup.push(() => slotsGrid.removeEventListener('click', handleSlotInteraction));
      const handleSlotFocus = (event) => {
          var _a;
          const slotEl = (_a = event.target) === null || _a === void 0 ? void 0 : _a.closest('.lineup-slot');
          if (!slotEl)
              return;
          const lineup = helpers.getSelectedLineup();
          if (!lineup)
              return;
          const slotIndex = Number(slotEl.dataset.slotIndex);
          if (!Number.isFinite(slotIndex))
              return;
          const slot = lineup.slots[slotIndex];
          if (!slot)
              return;
          if (!slot.unlocked) {
              const costText = slot.unlockCost
                  ? formatCurrencyBalance(slot.unlockCost.amount, slot.unlockCost.currencyId)
                  : null;
              helpers.setMessage(costText
                  ? `Vị trí ${slotIndex + 1} đang khóa. Cần ${costText} để mở khóa.`
                  : `Vị trí ${slotIndex + 1} đang khóa.`, 'info');
              return;
          }
          if (slot.unitId) {
              const unit = rosterLookup.get(slot.unitId);
              helpers.setMessage(`Vị trí ${slotIndex + 1}: ${(unit === null || unit === void 0 ? void 0 : unit.name) || 'đã có nhân vật'}. Dùng "Bỏ" để trả vị trí.`, 'info');
              return;
          }
          if (state.selectedUnitId) {
              const unit = rosterLookup.get(state.selectedUnitId);
              helpers.setMessage(`Vị trí ${slotIndex + 1} trống. Đã chọn ${(unit === null || unit === void 0 ? void 0 : unit.name) || 'nhân vật'}. Nhấn "Gán" để thêm.`, 'info');
          }
          else {
              helpers.setMessage(`Vị trí ${slotIndex + 1} trống. Chọn nhân vật từ roster rồi nhấn "Gán".`, 'info');
          }
      };
      slotsGrid.addEventListener('focusin', handleSlotFocus);
      cleanup.push(() => slotsGrid.removeEventListener('focusin', handleSlotFocus));
      slotsGrid.addEventListener('mouseenter', handleSlotFocus, true);
      cleanup.push(() => slotsGrid.removeEventListener('mouseenter', handleSlotFocus, true));
      const handlePassiveClick = (event) => {
          var _a;
          const btn = (_a = event.target) === null || _a === void 0 ? void 0 : _a.closest('.lineup-passive');
          if (!btn)
              return;
          const lineup = helpers.getSelectedLineup();
          if (!lineup)
              return;
          const index = Number(btn.dataset.passiveIndex);
          if (!Number.isFinite(index))
              return;
          const passive = lineup.passives[index];
          if (!passive || passive.isEmpty)
              return;
          helpers.openPassiveDetails(passive);
      };
      passiveGrid.addEventListener('click', handlePassiveClick);
      cleanup.push(() => passiveGrid.removeEventListener('click', handlePassiveClick));
      const handleRosterFilter = (event) => {
          var _a, _b;
          const button = (_a = event.target) === null || _a === void 0 ? void 0 : _a.closest('.lineup-roster__filter');
          if (!button)
              return;
          const type = (button.dataset.filterType || 'all');
          const value = (_b = button.dataset.filterValue) !== null && _b !== void 0 ? _b : null;
          state.filter = { type, value };
          helpers.renderFilters();
          helpers.renderRoster();
      };
      rosterFilters.addEventListener('click', handleRosterFilter);
      cleanup.push(() => rosterFilters.removeEventListener('click', handleRosterFilter));
      const handleRosterSelect = (event) => {
          var _a;
          const entry = (_a = event.target) === null || _a === void 0 ? void 0 : _a.closest('.lineup-roster__entry');
          if (!entry)
              return;
          const unitId = entry.dataset.unitId || null;
          if (!unitId)
              return;
          if (state.selectedUnitId === unitId) {
              state.selectedUnitId = null;
              helpers.setMessage('Đã bỏ chọn nhân vật.', 'info');
          }
          else {
              state.selectedUnitId = unitId;
              const unit = rosterLookup.get(unitId);
              helpers.setMessage(`Đã chọn ${(unit === null || unit === void 0 ? void 0 : unit.name) || 'nhân vật'}. Nhấn vào ô chủ lực, ô dự bị hoặc leader để gán.`, 'info');
          }
          helpers.renderRoster();
          helpers.renderSlots();
      };
      rosterList.addEventListener('click', handleRosterSelect);
      cleanup.push(() => rosterList.removeEventListener('click', handleRosterSelect));
      const handleLeaderOpen = () => {
          helpers.openLeaderPicker();
      };
      leaderAvatar.addEventListener('click', handleLeaderOpen);
      cleanup.push(() => leaderAvatar.removeEventListener('click', handleLeaderOpen));
      const handlePassiveClose = () => {
          overlays.close(passiveOverlay);
      };
      passiveClose.addEventListener('click', handlePassiveClose);
      cleanup.push(() => passiveClose.removeEventListener('click', handlePassiveClose));
      const handleLeaderClose = () => {
          overlays.close(leaderOverlay);
      };
      leaderClose.addEventListener('click', handleLeaderClose);
      cleanup.push(() => leaderClose.removeEventListener('click', handleLeaderClose));
      const handlePassiveOverlayClick = (event) => {
          if (event.target === passiveOverlay) {
              overlays.close(passiveOverlay);
          }
      };
      passiveOverlay.addEventListener('click', handlePassiveOverlayClick);
      cleanup.push(() => passiveOverlay.removeEventListener('click', handlePassiveOverlayClick));
      const handleLeaderOverlayClick = (event) => {
          if (event.target === leaderOverlay) {
              overlays.close(leaderOverlay);
          }
      };
      leaderOverlay.addEventListener('click', handleLeaderOverlayClick);
      cleanup.push(() => leaderOverlay.removeEventListener('click', handleLeaderOverlayClick));
      const handleLeaderOption = (event) => {
          var _a, _b;
          const option = (_a = event.target) === null || _a === void 0 ? void 0 : _a.closest('.lineup-overlay__option');
          if (!option)
              return;
          const lineup = helpers.getSelectedLineup();
          if (!lineup)
              return;
          const unitId = (_b = option.dataset.unitId) !== null && _b !== void 0 ? _b : null;
          const result = setLeader(lineup, unitId || null, rosterLookup);
          if (!result.ok) {
              helpers.setMessage(result.message || 'Không thể đặt leader.', 'error');
          }
          else {
              if (unitId) {
                  const unit = rosterLookup.get(unitId);
                  helpers.setMessage(`Đã chọn ${(unit === null || unit === void 0 ? void 0 : unit.name) || 'leader'}.`, 'info');
              }
              else {
                  helpers.setMessage('Đã bỏ chọn leader.', 'info');
              }
          }
          helpers.renderLeader();
          helpers.renderSlots();
          helpers.renderBench();
          helpers.renderPassives();
          helpers.renderRoster();
          overlays.close(leaderOverlay);
      };
      leaderOverlayBody.addEventListener('click', handleLeaderOption);
      cleanup.push(() => leaderOverlayBody.removeEventListener('click', handleLeaderOption));
      const handleGlobalKey = (event) => {
          if (event.key === 'Escape') {
              const active = overlays.getActive();
              if (active) {
                  overlays.close(active);
              }
          }
      };
      document.addEventListener('keydown', handleGlobalKey);
      cleanup.push(() => document.removeEventListener('keydown', handleGlobalKey));
      return cleanup;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'bindLineupEvents')) exports.bindLineupEvents = bindLineupEvents;
});
__define('./screens/lineup/view/index.ts', (exports, module, __require) => {
  const __reexport0 = __require('./screens/lineup/view/render.ts');

  if (!Object.prototype.hasOwnProperty.call(exports, 'renderLineupView')) exports.renderLineupView = __reexport0.renderLineupView;
});
__define('./screens/lineup/view/render.ts', (exports, module, __require) => {
  const __dep0 = __require('./data/skills.ts');
  const getSkillSet = __dep0.getSkillSet;
  const __dep1 = __require('./utils/format.ts');
  const createNumberFormatter = __dep1.createNumberFormatter;
  const __dep2 = __require('./utils/unit-id.ts');
  const normalizeUnitId = __dep2.normalizeUnitId;
  const __dep3 = __require('./ui/dom.ts');
  const assertElement = __dep3.assertElement;
  const ensureStyleTag = __dep3.ensureStyleTag;
  const mountSection = __dep3.mountSection;
  const __dep4 = __require('./types/currency.ts');
  const normalizeCurrencyBalances = __dep4.normalizeCurrencyBalances;
  const __dep5 = __require('./screens/lineup/view/state.ts');
  const normalizeRoster = __dep5.normalizeRoster;
  const normalizeLineups = __dep5.normalizeLineups;
  const createCurrencyBalances = __dep5.createCurrencyBalances;
  const createFilterOptions = __dep5.createFilterOptions;
  const formatCurrencyBalance = __dep5.formatCurrencyBalance;
  const collectAssignedUnitIds = __dep5.collectAssignedUnitIds;
  const evaluatePassive = __dep5.evaluatePassive;
  const filterRoster = __dep5.filterRoster;
  const __dep6 = __require('./screens/lineup/view/events.ts');
  const bindLineupEvents = __dep6.bindLineupEvents;
  const STYLE_ID = 'lineup-view-style-v1';
  const powerFormatter = createNumberFormatter('vi-VN');
  function ensureStyles() {
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
      .lineup-slot.is-selected{border-color:rgba(174,228,255,.55);box-shadow:0 14px 32px rgba(6,12,20,.45);}
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
      .lineup-overlay__body{display:flex;flex-direction:column;gap:12px;}
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
      ensureStyleTag(STYLE_ID, { css });
  }
  function createOverlay() {
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
  function sanitizeCodeToken(token) {
      if (!token) {
          return '';
      }
      return token.replace(/[^A-Za-z0-9]/g, '');
  }
  function normalizeForCode(value) {
      const trimmed = value.trim();
      if (!trimmed) {
          return '';
      }
      return trimmed.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  }
  function extractCodeFromNormalized(normalized) {
      var _a, _b, _c;
      if (!normalized) {
          return '';
      }
      const tokens = normalized.split(/[\s\-_/]+/).filter(Boolean);
      if (tokens.length >= 2) {
          const firstToken = sanitizeCodeToken((_a = tokens[0]) !== null && _a !== void 0 ? _a : '');
          const lastToken = sanitizeCodeToken((_b = tokens[tokens.length - 1]) !== null && _b !== void 0 ? _b : '');
          let letters = '';
          if (firstToken) {
              letters += firstToken[0];
          }
          if (lastToken) {
              letters += lastToken[0];
          }
          if (tokens.length > 2 && letters.length < 3) {
              const extraToken = sanitizeCodeToken((_c = tokens[1]) !== null && _c !== void 0 ? _c : '');
              if (extraToken) {
                  letters += extraToken[0];
              }
          }
          letters = letters.slice(0, 3);
          if (letters) {
              return letters;
          }
      }
      const cleaned = sanitizeCodeToken(normalized);
      return cleaned.slice(0, 3);
  }
  function getUnitCode(unit, fallbackLabel) {
      const sourceName = (unit === null || unit === void 0 ? void 0 : unit.name) && unit.name.trim()
          ? unit.name
          : (typeof fallbackLabel === 'string' ? fallbackLabel : '');
      const normalizedName = normalizeForCode(sourceName);
      let code = extractCodeFromNormalized(normalizedName);
      if (!code) {
          const normalizedId = normalizeForCode((unit === null || unit === void 0 ? void 0 : unit.id) != null ? String(unit.id) : '');
          code = extractCodeFromNormalized(normalizedId);
      }
      return code ? code.toLocaleUpperCase('vi-VN') : '';
  }
  function getInitials(parts) {
      if (!parts[0]) {
          return '';
      }
      if (parts.length === 1) {
          return parts[0].slice(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  function getNameInitials(name) {
      if (!name) {
          return '';
      }
      const parts = name.trim().split(/\s+/);
      return getInitials(parts);
  }
  function renderAvatar(container, avatarUrl, name) {
      container.innerHTML = '';
      if (avatarUrl) {
          const img = document.createElement('img');
          img.src = avatarUrl;
          img.alt = name || '';
          container.appendChild(img);
      }
      else {
          container.textContent = getNameInitials(name || '');
      }
  }
  function formatUnitPower(power) {
      return powerFormatter.format(Number.isFinite(power) ? Number(power) : 0);
  }
  function renderLineupView(options) {
      var _a, _b;
      const { root, shell = null, definition = null, description = null, lineups = null, roster = null, playerState = null, currencies = null, } = options;
      const host = assertElement(root, {
          guard: (node) => node instanceof HTMLElement,
          message: 'renderLineupView cần một phần tử root hợp lệ.',
      });
      ensureStyles();
      const normalizedRoster = normalizeRoster(roster !== null && roster !== void 0 ? roster : null);
      const normalizedLineups = normalizeLineups(lineups !== null && lineups !== void 0 ? lineups : null, normalizedRoster);
      const rosterLookup = new Map(normalizedRoster.map(unit => [normalizeUnitId(unit.id), unit]));
      const lineupState = new Map();
      normalizedLineups.forEach(lineup => {
          lineupState.set(lineup.id, {
              ...lineup,
              slots: lineup.slots.map(slot => ({
                  ...slot,
                  unlockCost: slot.unlockCost ? { ...slot.unlockCost } : null,
                  meta: slot.meta ? { ...slot.meta } : null,
              })),
              bench: lineup.bench.map(cell => ({
                  ...cell,
                  meta: cell.meta ? { ...cell.meta } : null,
              })),
              passives: lineup.passives.map(passive => ({ ...passive })),
              leaderId: lineup.leaderId || null,
          });
      });
      const playerCurrencySource = normalizeCurrencyBalances(playerState !== null && playerState !== void 0 ? playerState : null);
      const currencyBalances = createCurrencyBalances(playerCurrencySource, currencies);
      const state = {
          selectedLineupId: (_b = (_a = normalizedLineups[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
          selectedUnitId: null,
          activeBenchIndex: null,
          filter: { type: 'all', value: null },
          message: '',
          messageType: 'info',
          currencyBalances,
          lineupState,
          roster: normalizedRoster,
          rosterLookup,
          filterOptions: createFilterOptions(normalizedRoster),
      };
      const container = document.createElement('div');
      container.className = 'lineup-view';
      const mount = mountSection({
          root: host,
          section: container,
      });
      const header = document.createElement('div');
      header.className = 'lineup-view__header';
      const titleGroup = document.createElement('div');
      titleGroup.className = 'lineup-view__title-group';
      const titleEl = document.createElement('h1');
      titleEl.className = 'lineup-view__title';
      titleEl.textContent = (definition === null || definition === void 0 ? void 0 : definition.label) || (definition === null || definition === void 0 ? void 0 : definition.title) || 'Đội hình';
      titleGroup.appendChild(titleEl);
      if (description) {
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
      const slotsSection = document.createElement('section');
      slotsSection.className = 'lineup-slots';
      const slotsTitle = document.createElement('p');
      slotsTitle.className = 'lineup-slots__title';
      slotsTitle.textContent = 'Vị trí chủ lực';
      slotsSection.appendChild(slotsTitle);
      const slotsGrid = document.createElement('div');
      slotsGrid.className = 'lineup-slots__grid';
      slotsSection.appendChild(slotsGrid);
      mainColumn.appendChild(slotsSection);
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
      function syncBenchDetailsHeight() {
          if (!benchDetails || !leaderSection || typeof leaderSection.getBoundingClientRect !== 'function') {
              benchDetails.style.maxHeight = '';
              return;
          }
          const rect = leaderSection.getBoundingClientRect();
          if (rect && Number.isFinite(rect.height)) {
              benchDetails.style.maxHeight = `${rect.height}px`;
          }
          else {
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
      const passiveOverlayBody = assertElement(passiveOverlay.querySelector('.lineup-overlay__body'), {
          guard: (node) => node instanceof HTMLDivElement,
          message: 'Không thể khởi tạo overlay passive.',
      });
      const passiveClose = assertElement(passiveOverlay.querySelector('.lineup-overlay__close'), {
          guard: (node) => node instanceof HTMLButtonElement,
          message: 'Không thể khởi tạo overlay passive.',
      });
      passiveOverlayBody.innerHTML = '';
      if (document.body) {
          document.body.appendChild(passiveOverlay);
      }
      else {
          host.appendChild(passiveOverlay);
      }
      const leaderOverlay = createOverlay();
      leaderOverlay.classList.add('lineup-overlay--leader');
      const leaderOverlayBody = assertElement(leaderOverlay.querySelector('.lineup-overlay__body'), {
          guard: (node) => node instanceof HTMLDivElement,
          message: 'Không thể khởi tạo overlay leader.',
      });
      const leaderClose = assertElement(leaderOverlay.querySelector('.lineup-overlay__close'), {
          guard: (node) => node instanceof HTMLButtonElement,
          message: 'Không thể khởi tạo overlay leader.',
      });
      leaderOverlayBody.innerHTML = '';
      if (document.body) {
          document.body.appendChild(leaderOverlay);
      }
      else {
          host.appendChild(leaderOverlay);
      }
      let activeOverlay = null;
      function closeOverlay(target) {
          if (!target)
              return;
          target.classList.remove('is-open');
          if (activeOverlay === target) {
              activeOverlay = null;
          }
      }
      function openOverlay(target) {
          if (!target)
              return;
          target.classList.add('is-open');
          activeOverlay = target;
      }
      function getSelectedLineup() {
          var _a;
          if (!state.selectedLineupId)
              return null;
          return (_a = state.lineupState.get(state.selectedLineupId)) !== null && _a !== void 0 ? _a : null;
      }
      function setMessage(text, type = 'info') {
          state.message = text || '';
          state.messageType = type;
          messageEl.textContent = text || '';
          if (type === 'error') {
              messageEl.classList.add('is-error');
          }
          else {
              messageEl.classList.remove('is-error');
          }
      }
      function refreshWallet() {
          walletEl.innerHTML = '';
          for (const [currencyId, balance] of state.currencyBalances.entries()) {
              const item = document.createElement('div');
              item.className = 'lineup-wallet__item';
              const nameEl = document.createElement('p');
              nameEl.className = 'lineup-wallet__name';
              nameEl.textContent = currencyId;
              const value = document.createElement('p');
              value.className = 'lineup-wallet__balance';
              value.textContent = formatCurrencyBalance(balance, currencyId);
              item.appendChild(nameEl);
              item.appendChild(value);
              walletEl.appendChild(item);
          }
      }
      function renderBenchDetails() {
          var _a, _b, _c, _d, _e;
          benchDetails.innerHTML = '';
          const lineup = getSelectedLineup();
          if (!lineup) {
              benchDetails.classList.add('is-empty');
              const empty = document.createElement('p');
              empty.className = 'lineup-bench__details-empty';
              empty.textContent = 'Chưa có đội hình để hiển thị thông tin.';
              benchDetails.appendChild(empty);
              syncBenchDetailsHeight();
              return;
          }
          const index = Number.isFinite(state.activeBenchIndex) ? state.activeBenchIndex : null;
          if (index == null) {
              benchDetails.classList.add('is-empty');
              const hint = document.createElement('p');
              hint.className = 'lineup-bench__details-empty';
              hint.textContent = 'Chọn một ô dự bị để xem mô tả kỹ năng.';
              benchDetails.appendChild(hint);
              syncBenchDetailsHeight();
              return;
          }
          const cell = lineup.bench[index];
          if (!cell) {
              benchDetails.classList.add('is-empty');
              const missing = document.createElement('p');
              missing.className = 'lineup-bench__details-empty';
              missing.textContent = 'Không tìm thấy ô dự bị tương ứng.';
              benchDetails.appendChild(missing);
              syncBenchDetailsHeight();
              return;
          }
          const unit = cell.unitId ? rosterLookup.get(cell.unitId) : null;
          if (!unit) {
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
          const kit = (_b = (_a = unit.raw) === null || _a === void 0 ? void 0 : _a.kit) !== null && _b !== void 0 ? _b : null;
          const skillSetId = normalizeUnitId(unit.id);
          const skillSet = skillSetId ? getSkillSet(skillSetId) : null;
          const skills = Array.isArray(kit === null || kit === void 0 ? void 0 : kit.skills)
              ? ((_c = kit.skills) !== null && _c !== void 0 ? _c : [])
                  .filter(skill => {
                  const skillRecord = skill;
                  const skillName = typeof (skillRecord === null || skillRecord === void 0 ? void 0 : skillRecord.name) === 'string' ? skillRecord.name.trim() : '';
                  const skillKey = typeof (skillRecord === null || skillRecord === void 0 ? void 0 : skillRecord.key) === 'string' ? skillRecord.key.trim() : '';
                  return skillName !== 'Đánh Thường' && skillKey !== 'Đánh Thường';
              })
                  .slice(0, 3)
              : [];
          const kitUlt = (_d = kit === null || kit === void 0 ? void 0 : kit.ult) !== null && _d !== void 0 ? _d : null;
          const skillSetUlt = (_e = skillSet === null || skillSet === void 0 ? void 0 : skillSet.ult) !== null && _e !== void 0 ? _e : null;
          const hasUlt = Boolean(kitUlt || skillSetUlt);
          const ultName = hasUlt
              ? ((kitUlt === null || kitUlt === void 0 ? void 0 : kitUlt.name) || (skillSetUlt === null || skillSetUlt === void 0 ? void 0 : skillSetUlt.name) || (kitUlt === null || kitUlt === void 0 ? void 0 : kitUlt.id) || 'Chưa đặt tên')
              : null;
          if (!skills.length && !hasUlt) {
              const fallback = document.createElement('p');
              fallback.className = 'lineup-bench__details-empty';
              fallback.textContent = 'Chưa có dữ liệu chi tiết cho nhân vật này.';
              benchDetails.appendChild(fallback);
          }
          else {
              if (skills.length) {
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
                      const skillRecord = skill;
                      const nameText = (skillRecord === null || skillRecord === void 0 ? void 0 : skillRecord.name) || (skillRecord === null || skillRecord === void 0 ? void 0 : skillRecord.key) || `Kỹ năng #${idx + 1}`;
                      item.textContent = nameText;
                      list.appendChild(item);
                  });
                  skillSection.appendChild(list);
                  benchDetails.appendChild(skillSection);
              }
              if (hasUlt && ultName) {
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
      function renderSlots() {
          slotsGrid.innerHTML = '';
          const lineup = getSelectedLineup();
          if (!lineup) {
              slotsSection.classList.add('is-empty');
              for (let index = 0; index < 5; index += 1) {
                  const slotEl = document.createElement('div');
                  slotEl.className = 'lineup-slot is-locked';
                  slotEl.dataset.slotIndex = String(index);
                  slotEl.tabIndex = 0;
                  slotEl.setAttribute('aria-label', `Vị trí ${index + 1} đang khóa.`);
                  const label = document.createElement('p');
                  label.className = 'lineup-slot__label';
                  label.textContent = `Vị trí ${index + 1}`;
                  slotEl.appendChild(label);
                  const avatar = document.createElement('div');
                  avatar.className = 'lineup-slot__avatar';
                  avatar.textContent = '🔒';
                  slotEl.appendChild(avatar);
                  const name = document.createElement('p');
                  name.className = 'lineup-slot__name';
                  name.textContent = 'Chưa có dữ liệu';
                  slotEl.appendChild(name);
                  const note = document.createElement('p');
                  note.className = 'lineup-slot__locked-note';
                  note.textContent = 'Vui lòng chọn đội hình để thao tác.';
                  slotEl.appendChild(note);
                  const actions = document.createElement('div');
                  actions.className = 'lineup-slot__actions';
                  slotEl.appendChild(actions);
                  slotsGrid.appendChild(slotEl);
              }
              return;
          }
          slotsSection.classList.remove('is-empty');
          lineup.slots.forEach(slot => {
              const slotEl = document.createElement('div');
              slotEl.className = 'lineup-slot';
              slotEl.dataset.slotIndex = String(slot.index);
              slotEl.tabIndex = 0;
              const unit = slot.unitId ? rosterLookup.get(slot.unitId) : null;
              const selectedMatches = state.selectedUnitId && slot.unitId === state.selectedUnitId;
              if (selectedMatches) {
                  slotEl.classList.add('is-selected');
              }
              if (!slot.unlocked) {
                  slotEl.classList.add('is-locked');
              }
              const label = document.createElement('p');
              label.className = 'lineup-slot__label';
              label.textContent = `Vị trí ${slot.index + 1}`;
              slotEl.appendChild(label);
              const avatar = document.createElement('div');
              avatar.className = 'lineup-slot__avatar';
              if (unit) {
                  renderAvatar(avatar, unit.avatar || null, unit.name);
              }
              else if (slot.label) {
                  avatar.textContent = getNameInitials(slot.label);
              }
              else if (!slot.unlocked) {
                  avatar.textContent = '🔒';
              }
              else {
                  avatar.textContent = '+';
              }
              slotEl.appendChild(avatar);
              const name = document.createElement('p');
              name.className = 'lineup-slot__name';
              if (unit) {
                  name.textContent = unit.name;
              }
              else if (slot.label) {
                  name.textContent = slot.label;
              }
              else if (!slot.unlocked) {
                  name.textContent = 'Vị trí bị khóa';
              }
              else {
                  name.textContent = 'Chưa gán nhân vật';
              }
              slotEl.appendChild(name);
              if (slot.unlocked) {
                  const hint = document.createElement('p');
                  hint.className = 'lineup-slot__hint';
                  if (unit) {
                      const powerText = unit.power != null
                          ? `Chiến lực ${formatUnitPower(unit.power)}`
                          : 'Đang tham gia đội hình';
                      hint.textContent = `${powerText}. Dùng "Bỏ" để trả vị trí.`;
                  }
                  else if (state.selectedUnitId) {
                      const selectedUnit = rosterLookup.get(state.selectedUnitId);
                      hint.textContent = selectedUnit
                          ? `Đã chọn ${selectedUnit.name}. Nhấn "Gán" để thêm.`
                          : 'Nhấn "Gán" để thêm nhân vật đã chọn.';
                  }
                  else {
                      hint.textContent = 'Chọn nhân vật từ roster rồi nhấn "Gán" để thêm.';
                  }
                  slotEl.appendChild(hint);
              }
              else {
                  if (slot.unlockCost) {
                      const cost = document.createElement('p');
                      cost.className = 'lineup-slot__cost';
                      cost.textContent = `Chi phí mở khóa: ${formatCurrencyBalance(slot.unlockCost.amount, slot.unlockCost.currencyId)}`;
                      slotEl.appendChild(cost);
                  }
                  const note = document.createElement('p');
                  note.className = 'lineup-slot__locked-note';
                  note.textContent = 'Mở khóa để gán nhân vật vào vị trí này.';
                  slotEl.appendChild(note);
              }
              const actions = document.createElement('div');
              actions.className = 'lineup-slot__actions';
              if (slot.unlocked) {
                  const assignButton = document.createElement('button');
                  assignButton.type = 'button';
                  assignButton.className = 'lineup-button';
                  assignButton.dataset.slotAction = 'assign';
                  assignButton.textContent = unit ? 'Đổi nhân vật' : 'Gán nhân vật';
                  actions.appendChild(assignButton);
                  const clearButton = document.createElement('button');
                  clearButton.type = 'button';
                  clearButton.className = 'lineup-button';
                  clearButton.dataset.slotAction = 'clear';
                  clearButton.textContent = 'Bỏ khỏi vị trí';
                  if (!unit) {
                      clearButton.disabled = true;
                  }
                  actions.appendChild(clearButton);
              }
              else {
                  const unlockButton = document.createElement('button');
                  unlockButton.type = 'button';
                  unlockButton.className = 'lineup-button';
                  unlockButton.dataset.slotAction = 'unlock';
                  unlockButton.textContent = 'Mở khóa vị trí';
                  actions.appendChild(unlockButton);
              }
              slotEl.appendChild(actions);
              let ariaLabel = `Vị trí ${slot.index + 1}`;
              if (unit) {
                  ariaLabel += `: ${unit.name}`;
              }
              else if (slot.label) {
                  ariaLabel += `: ${slot.label}`;
              }
              if (!slot.unlocked) {
                  ariaLabel += '. Đang khóa.';
              }
              slotEl.setAttribute('aria-label', ariaLabel);
              slotsGrid.appendChild(slotEl);
          });
      }
      function updateActiveBenchHighlight() {
          const cells = benchGrid.querySelectorAll('.lineup-bench__cell');
          cells.forEach(cell => {
              const idx = Number(cell.dataset.benchIndex);
              if (Number.isFinite(idx) && idx === state.activeBenchIndex) {
                  cell.classList.add('is-active');
              }
              else {
                  cell.classList.remove('is-active');
              }
          });
      }
      function renderBench() {
          var _a;
          const lineup = getSelectedLineup();
          benchGrid.innerHTML = '';
          if (!lineup) {
              state.activeBenchIndex = null;
              renderBenchDetails();
              return;
          }
          if (!Number.isInteger(state.activeBenchIndex) || !lineup.bench[(_a = state.activeBenchIndex) !== null && _a !== void 0 ? _a : -1]) {
              state.activeBenchIndex = null;
          }
          const columnCount = 5;
          const columnEls = Array.from({ length: columnCount }, () => {
              const columnEl = document.createElement('div');
              columnEl.className = 'lineup-bench__column';
              benchGrid.appendChild(columnEl);
              return columnEl;
          });
          lineup.bench.forEach(cell => {
              var _a;
              const cellEl = document.createElement('button');
              cellEl.type = 'button';
              cellEl.className = 'lineup-bench__cell';
              cellEl.dataset.benchIndex = String(cell.index);
              const unit = cell.unitId ? rosterLookup.get(cell.unitId) : null;
              const hasContent = Boolean(cell.unitId || cell.label);
              if (!hasContent) {
                  cellEl.classList.add('is-empty');
              }
              const displayName = (unit === null || unit === void 0 ? void 0 : unit.name) || cell.label || '';
              let ariaLabel = `Ô dự bị ${cell.index + 1}`;
              if (displayName) {
                  ariaLabel += `: ${displayName}`;
                  if (cell.unitId) {
                      ariaLabel += '. Giữ Alt và click để gỡ.';
                  }
              }
              cellEl.setAttribute('aria-label', ariaLabel);
              if (displayName) {
                  cellEl.title = cell.unitId
                      ? `${displayName} — giữ Alt và click để gỡ.`
                      : displayName;
              }
              else {
                  cellEl.removeAttribute('title');
              }
              const codeText = (!cell.unitId && hasContent)
                  ? getUnitCode(unit, cell.label || '')
                  : '';
              const avatarEl = document.createElement('div');
              avatarEl.className = 'lineup-bench__avatar';
              const avatarSource = (unit === null || unit === void 0 ? void 0 : unit.avatar) || ((_a = cell.meta) === null || _a === void 0 ? void 0 : _a.avatar) || null;
              const avatarLabel = (unit === null || unit === void 0 ? void 0 : unit.name) || cell.label || '';
              renderAvatar(avatarEl, avatarSource, avatarLabel);
              if (codeText) {
                  const codeEl = document.createElement('span');
                  codeEl.className = 'lineup-bench__cell-code';
                  codeEl.textContent = codeText;
                  cellEl.appendChild(codeEl);
              }
              cellEl.appendChild(avatarEl);
              if (state.activeBenchIndex === cell.index) {
                  cellEl.classList.add('is-active');
              }
              const columnIndex = cell.index % columnCount;
              const targetColumn = columnEls[columnIndex] || columnEls[0] || null;
              if (targetColumn) {
                  targetColumn.appendChild(cellEl);
              }
          });
          updateActiveBenchHighlight();
          renderBenchDetails();
      }
      function renderLeader() {
          const lineup = getSelectedLineup();
          if (!lineup) {
              renderAvatar(leaderAvatar, null, '');
              leaderName.textContent = 'Chưa chọn leader';
              syncBenchDetailsHeight();
              return;
          }
          if (lineup.leaderId) {
              const unit = rosterLookup.get(lineup.leaderId);
              renderAvatar(leaderAvatar, (unit === null || unit === void 0 ? void 0 : unit.avatar) || null, (unit === null || unit === void 0 ? void 0 : unit.name) || '');
              leaderName.textContent = (unit === null || unit === void 0 ? void 0 : unit.name) || 'Leader';
          }
          else {
              renderAvatar(leaderAvatar, null, '');
              leaderName.textContent = 'Chưa chọn leader';
          }
          syncBenchDetailsHeight();
      }
      function renderPassives() {
          const lineup = getSelectedLineup();
          passiveGrid.innerHTML = '';
          if (!lineup) {
              return;
          }
          const assignedIds = collectAssignedUnitIds(lineup);
          lineup.passives.forEach(passive => {
              const btn = document.createElement('button');
              btn.type = 'button';
              btn.className = 'lineup-passive';
              btn.dataset.passiveIndex = String(passive.index);
              btn.setAttribute('aria-label', passive.isEmpty ? 'Ô passive trống' : `Xem passive ${passive.name}`);
              if (passive.isEmpty) {
                  btn.classList.add('is-empty');
                  btn.disabled = true;
              }
              if (evaluatePassive(passive, assignedIds, rosterLookup)) {
                  btn.classList.add('is-active');
              }
              const title = document.createElement('p');
              title.className = 'lineup-passive__title';
              title.textContent = passive.name;
              btn.appendChild(title);
              if (!passive.isEmpty) {
                  const condition = document.createElement('p');
                  condition.className = 'lineup-passive__condition';
                  condition.textContent = passive.requirement || 'Chạm để xem chi tiết.';
                  btn.appendChild(condition);
              }
              passiveGrid.appendChild(btn);
          });
      }
      function renderFilters() {
          rosterFilters.innerHTML = '';
          const filters = [
              { type: 'all', value: null, label: 'Tất cả' },
              ...state.filterOptions.classes.map(value => ({ type: 'class', value, label: value })),
              ...state.filterOptions.ranks.map(value => ({ type: 'rank', value, label: value })),
          ];
          filters.forEach(filter => {
              const button = document.createElement('button');
              button.type = 'button';
              button.className = 'lineup-roster__filter';
              button.dataset.filterType = filter.type;
              if (filter.value != null) {
                  button.dataset.filterValue = filter.value;
              }
              button.textContent = filter.label;
              if (state.filter.type === filter.type && (state.filter.value || null) === (filter.value || null)) {
                  button.classList.add('is-active');
              }
              rosterFilters.appendChild(button);
          });
      }
      function renderRoster() {
          rosterList.innerHTML = '';
          const lineup = getSelectedLineup();
          const filtered = filterRoster(state.roster, state.filter);
          filtered.forEach(unit => {
              const unitId = normalizeUnitId(unit.id);
              const button = document.createElement('button');
              button.type = 'button';
              button.className = 'lineup-roster__entry';
              button.dataset.unitId = unitId;
              button.setAttribute('aria-label', `Chọn ${unit.name}`);
              if (state.selectedUnitId === unitId) {
                  button.classList.add('is-selected');
              }
              const isAssigned = Boolean(lineup
                  && (lineup.leaderId === unitId
                      || lineup.slots.some(slot => slot.unitId === unitId)
                      || lineup.bench.some(cell => cell.unitId === unitId)));
              if (isAssigned && state.selectedUnitId !== unitId) {
                  button.classList.add('is-unavailable');
              }
              const avatar = document.createElement('div');
              avatar.className = 'lineup-roster__avatar';
              renderAvatar(avatar, unit.avatar || null, unit.name);
              button.appendChild(avatar);
              const meta = document.createElement('div');
              meta.className = 'lineup-roster__meta';
              const nameEl = document.createElement('p');
              nameEl.className = 'lineup-roster__name';
              nameEl.textContent = unit.name;
              meta.appendChild(nameEl);
              if (unit.role || unit.rank) {
                  const tag = document.createElement('p');
                  tag.className = 'lineup-roster__tag';
                  tag.textContent = [unit.role, unit.rank].filter(Boolean).join(' · ');
                  meta.appendChild(tag);
              }
              if (unit.power != null) {
                  const extra = document.createElement('p');
                  extra.className = 'lineup-roster__extra';
                  extra.textContent = `Chiến lực ${formatUnitPower(unit.power)}`;
                  meta.appendChild(extra);
              }
              button.appendChild(meta);
              rosterList.appendChild(button);
          });
      }
      function openPassiveDetails(passive) {
          passiveOverlayBody.innerHTML = '';
          const title = document.createElement('h3');
          title.className = 'lineup-overlay__title';
          title.textContent = passive.name;
          passiveOverlayBody.appendChild(title);
          if (passive.requirement) {
              const subtitle = document.createElement('p');
              subtitle.className = 'lineup-overlay__subtitle';
              subtitle.textContent = passive.requirement;
              passiveOverlayBody.appendChild(subtitle);
          }
          if (passive.description) {
              const descriptionEl = document.createElement('p');
              descriptionEl.className = 'lineup-overlay__subtitle';
              descriptionEl.textContent = passive.description;
              passiveOverlayBody.appendChild(descriptionEl);
          }
          if (passive.requiredUnitIds.length) {
              const list = document.createElement('ul');
              list.className = 'lineup-overlay__list';
              passive.requiredUnitIds.forEach(unitId => {
                  const item = document.createElement('li');
                  const unit = rosterLookup.get(unitId);
                  item.textContent = (unit === null || unit === void 0 ? void 0 : unit.name) || unitId;
                  list.appendChild(item);
              });
              passiveOverlayBody.appendChild(list);
          }
          openOverlay(passiveOverlay);
          passiveClose.focus();
      }
      function openLeaderPicker() {
          const lineup = getSelectedLineup();
          if (!lineup)
              return;
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
              const unitId = normalizeUnitId(unit.id);
              const option = document.createElement('button');
              option.type = 'button';
              option.className = 'lineup-overlay__option';
              option.dataset.unitId = unitId;
              const avatar = document.createElement('div');
              avatar.className = 'lineup-overlay__option-avatar';
              renderAvatar(avatar, unit.avatar || null, unit.name);
              option.appendChild(avatar);
              const text = document.createElement('div');
              const nameEl = document.createElement('p');
              nameEl.className = 'lineup-overlay__option-name';
              nameEl.textContent = unit.name;
              text.appendChild(nameEl);
              const meta = document.createElement('p');
              meta.className = 'lineup-overlay__option-meta';
              meta.textContent = [unit.role, unit.rank].filter(Boolean).join(' · ');
              text.appendChild(meta);
              option.appendChild(text);
              if (lineup.leaderId === unitId) {
                  option.classList.add('is-active');
              }
              list.appendChild(option);
          });
          leaderOverlayBody.appendChild(list);
          openOverlay(leaderOverlay);
          leaderClose.focus();
      }
      const cleanup = [];
      const eventCleanup = bindLineupEvents({
          shell,
          state,
          elements: {
              backButton,
              slotsGrid,
              benchGrid,
              benchDetails,
              passiveGrid,
              rosterFilters,
              rosterList,
              leaderAvatar,
              leaderSection,
              passiveOverlay,
              passiveClose,
              leaderOverlay,
              leaderOverlayBody,
              leaderClose,
          },
          overlays: {
              getActive: () => activeOverlay,
              close: overlay => closeOverlay(overlay),
          },
          helpers: {
              getSelectedLineup,
              setMessage,
              renderSlots,
              renderBench,
              renderBenchDetails,
              renderLeader,
              renderPassives,
              renderFilters,
              renderRoster,
              updateActiveBenchHighlight,
              syncBenchDetailsHeight,
              openPassiveDetails,
              openLeaderPicker,
              refreshWallet,
          },
          rosterLookup,
      });
      cleanup.push(...eventCleanup);
      refreshWallet();
      renderSlots();
      renderBench();
      renderLeader();
      renderPassives();
      renderFilters();
      renderRoster();
      setMessage('Chọn nhân vật rồi gán vào các ô chủ lực hoặc dự bị để hoàn thiện đội hình.');
      cleanup.push(() => passiveOverlay.remove());
      cleanup.push(() => leaderOverlay.remove());
      return {
          destroy() {
              while (cleanup.length > 0) {
                  const fn = cleanup.pop();
                  if (!fn)
                      continue;
                  try {
                      fn();
                  }
                  catch (error) {
                      console.error('[lineup] destroy error', error);
                  }
              }
              mount.destroy();
          },
      };
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'renderLineupView')) exports.renderLineupView = renderLineupView;
});
__define('./screens/lineup/view/state.ts', (exports, module, __require) => {
  const __dep0 = __require('./catalog.ts');
  const ROSTER = __dep0.ROSTER;
  const __dep1 = __require('./data/economy.ts');
  const listCurrencies = __dep1.listCurrencies;
  const __dep2 = __require('./utils/format.ts');
  const createNumberFormatter = __dep2.createNumberFormatter;
  const currencyCatalog = listCurrencies();
  const currencyIndex = new Map(currencyCatalog.map(currency => [currency.id, currency]));
  const numberFormatter = createNumberFormatter('vi-VN');
  const isObjectLike = (value) => (typeof value === 'object' && value !== null && !Array.isArray(value));
  const isRosterEntryLite = (value) => isObjectLike(value);
  const isLineupDefinition = (value) => isObjectLike(value);
  const isLineupMemberConfig = (value) => isObjectLike(value);
  const isLineupPassiveConfig = (value) => isObjectLike(value);
  function cloneRoster(source) {
      if (Array.isArray(source) && source.length > 0) {
          const clones = source.filter(isRosterEntryLite).map(entry => ({ ...entry }));
          if (clones.length > 0) {
              return clones;
          }
      }
      return ROSTER.map(entry => ({ ...entry }));
  }
  function normalizeRosterEntry(entry, index) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j;
      const source = entry !== null && entry !== void 0 ? entry : {};
      const id = (_b = (_a = source.id) !== null && _a !== void 0 ? _a : source.key) !== null && _b !== void 0 ? _b : `unit-${index}`;
      const name = (_d = (_c = source.name) !== null && _c !== void 0 ? _c : source.title) !== null && _d !== void 0 ? _d : `Nhân vật #${index + 1}`;
      const role = (_g = (_f = (_e = source.class) !== null && _e !== void 0 ? _e : source.role) !== null && _f !== void 0 ? _f : source.archetype) !== null && _g !== void 0 ? _g : '';
      const rank = (_j = (_h = source.rank) !== null && _h !== void 0 ? _h : source.tier) !== null && _j !== void 0 ? _j : '';
      const tags = Array.isArray(source.tags)
          ? source.tags.slice()
          : Array.isArray(source.labels)
              ? source.labels.slice()
              : [];
      const numericPower = Number(source.power);
      const numericCp = Number(source.cp);
      const power = Number.isFinite(numericPower)
          ? numericPower
          : (Number.isFinite(numericCp) ? numericCp : null);
      const avatar = typeof source.avatar === 'string'
          ? source.avatar
          : typeof source.icon === 'string'
              ? source.icon
              : typeof source.portrait === 'string'
                  ? source.portrait
                  : null;
      const passives = Array.isArray(source.passives) ? source.passives.slice() : [];
      return {
          id: String(id),
          name: typeof name === 'string' ? name : `Nhân vật #${index + 1}`,
          role: typeof role === 'string' ? role : '',
          rank: typeof rank === 'string' ? rank : '',
          tags: tags.map(tag => String(tag)),
          power: power !== null && power !== void 0 ? power : null,
          avatar,
          passives,
          raw: isObjectLike(source) ? { ...source } : null,
      };
  }
  function normalizeRoster(source) {
      const cloned = cloneRoster(source);
      return cloned.map((entry, index) => normalizeRosterEntry(entry, index));
  }
  function normalizeAssignment(input, rosterIndex) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      if (!input) {
          return { unitId: null, label: null };
      }
      if (typeof input === 'string') {
          const trimmed = input.trim();
          if (trimmed && rosterIndex.has(trimmed)) {
              return { unitId: trimmed, label: null };
          }
          return { unitId: null, label: trimmed || null };
      }
      if (Array.isArray(input)) {
          if (input.length >= 2 && typeof input[0] === 'string' && rosterIndex.has(input[0])) {
              return { unitId: input[0], label: null };
          }
          if (input.length === 1) {
              return normalizeAssignment(input[0], rosterIndex);
          }
      }
      if (typeof input === 'object') {
          const record = input;
          const candidateId = (_c = (_b = (_a = record.unitId) !== null && _a !== void 0 ? _a : record.id) !== null && _b !== void 0 ? _b : record.key) !== null && _c !== void 0 ? _c : null;
          const label = (_h = (_g = (_f = (_e = (_d = record.name) !== null && _d !== void 0 ? _d : record.title) !== null && _e !== void 0 ? _e : record.label) !== null && _f !== void 0 ? _f : record.displayName) !== null && _g !== void 0 ? _g : record.note) !== null && _h !== void 0 ? _h : null;
          if (candidateId && rosterIndex.has(String(candidateId))) {
              return { unitId: String(candidateId), label: typeof label === 'string' ? label : null };
          }
          if (typeof label === 'string' && label.trim()) {
              return { unitId: null, label };
          }
      }
      return { unitId: null, label: null };
  }
  function normalizeCost(cost, fallbackCurrencyId) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
      if (cost == null) {
          return null;
      }
      if (Array.isArray(cost)) {
          if (cost.length >= 2 && typeof cost[0] === 'string' && !Number.isNaN(Number(cost[1]))) {
              const amount = Number(cost[1]);
              if (Number.isFinite(amount) && amount > 0) {
                  return { currencyId: cost[0], amount };
              }
          }
          if (cost.length === 1) {
              return normalizeCost(cost[0], fallbackCurrencyId);
          }
      }
      if (typeof cost === 'number') {
          if (!Number.isFinite(cost) || cost <= 0) {
              return null;
          }
          return { currencyId: fallbackCurrencyId || 'VNT', amount: cost };
      }
      if (typeof cost === 'string') {
          const parsed = Number(cost);
          if (!Number.isNaN(parsed) && parsed > 0) {
              return { currencyId: fallbackCurrencyId || 'VNT', amount: parsed };
          }
          return { currencyId: cost, amount: 1 };
      }
      if (typeof cost === 'object') {
          const record = cost;
          const currencyId = (_e = (_d = (_c = (_b = (_a = record.currencyId) !== null && _a !== void 0 ? _a : record.id) !== null && _b !== void 0 ? _b : record.type) !== null && _c !== void 0 ? _c : record.code) !== null && _d !== void 0 ? _d : fallbackCurrencyId) !== null && _e !== void 0 ? _e : 'VNT';
          const rawAmount = (_k = (_j = (_h = (_g = (_f = record.amount) !== null && _f !== void 0 ? _f : record.value) !== null && _g !== void 0 ? _g : record.cost) !== null && _h !== void 0 ? _h : record.price) !== null && _j !== void 0 ? _j : record.count) !== null && _k !== void 0 ? _k : null;
          const amount = Number(rawAmount);
          if (Number.isFinite(amount) && amount > 0) {
              return { currencyId: String(currencyId), amount };
          }
          if (Array.isArray(record.values) && record.values.length >= 2) {
              const [id, value] = record.values;
              const candidateAmount = Number(value);
              if (Number.isFinite(candidateAmount) && candidateAmount > 0) {
                  const resolvedId = typeof id === 'string' && id ? id : String(currencyId);
                  return { currencyId: resolvedId, amount: candidateAmount };
              }
          }
      }
      return null;
  }
  function normalizeLineupEntry(entry, index, rosterIndex) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
      const source = entry && isLineupDefinition(entry) ? entry : {};
      const id = (_b = (_a = source.id) !== null && _a !== void 0 ? _a : source.key) !== null && _b !== void 0 ? _b : `lineup-${index}`;
      const name = (_d = (_c = source.name) !== null && _c !== void 0 ? _c : source.title) !== null && _d !== void 0 ? _d : `Đội hình #${index + 1}`;
      const role = (_f = (_e = source.role) !== null && _e !== void 0 ? _e : source.type) !== null && _f !== void 0 ? _f : '';
      const description = (_h = (_g = source.description) !== null && _g !== void 0 ? _g : source.summary) !== null && _h !== void 0 ? _h : '';
      const rawSlots = Array.isArray(source.slots) ? source.slots : [];
      const memberList = Array.isArray(source.members) ? source.members : [];
      const defaultCurrencyId = (_l = (_k = (_j = source.unlockCurrency) !== null && _j !== void 0 ? _j : source.currencyId) !== null && _k !== void 0 ? _k : source.defaultCurrencyId) !== null && _l !== void 0 ? _l : null;
      const slotCosts = Array.isArray(source.slotCosts) ? source.slotCosts : null;
      const unlockCosts = Array.isArray(source.unlockCosts) ? source.unlockCosts : slotCosts;
      let unlockedCount = Math.min(3, 5);
      if (Number.isFinite(source.initialUnlockedSlots)) {
          unlockedCount = Math.max(0, Math.min(5, Number(source.initialUnlockedSlots)));
      }
      else if (rawSlots.some(slot => isLineupMemberConfig(slot) && slot.unlocked === false)) {
          unlockedCount = rawSlots.filter(slot => isLineupMemberConfig(slot) && slot.unlocked !== false).length;
      }
      const slots = new Array(5).fill(null).map((_, slotIndex) => {
          var _a, _b, _c, _d, _e, _f, _g, _h;
          const slotInput = (_b = (_a = rawSlots[slotIndex]) !== null && _a !== void 0 ? _a : memberList[slotIndex]) !== null && _b !== void 0 ? _b : null;
          const { unitId, label } = normalizeAssignment(slotInput, rosterIndex);
          const record = isLineupMemberConfig(slotInput) ? slotInput : null;
          const slotUnlock = (_c = record === null || record === void 0 ? void 0 : record.unlocked) !== null && _c !== void 0 ? _c : null;
          const unlocked = slotUnlock != null ? Boolean(slotUnlock) : slotIndex < unlockedCount;
          const costSource = (_h = (_g = (_f = (_e = (_d = record === null || record === void 0 ? void 0 : record.cost) !== null && _d !== void 0 ? _d : record === null || record === void 0 ? void 0 : record.unlockCost) !== null && _e !== void 0 ? _e : (Array.isArray(unlockCosts) ? unlockCosts[slotIndex] : null)) !== null && _f !== void 0 ? _f : source.slotCost) !== null && _g !== void 0 ? _g : source.unlockCost) !== null && _h !== void 0 ? _h : null;
          const unlockCost = normalizeCost(costSource, typeof defaultCurrencyId === 'string' ? defaultCurrencyId : null);
          const equipment = record === null || record === void 0 ? void 0 : record.equipment;
          return {
              index: slotIndex,
              unitId: unitId || null,
              label: label || null,
              unlocked,
              unlockCost,
              equipment: equipment !== null && equipment !== void 0 ? equipment : null,
              meta: record ? { ...record } : null,
          };
      });
      const benchSource = Array.isArray(source.bench)
          ? source.bench
          : Array.isArray(source.reserve)
              ? source.reserve
              : Array.isArray(source.members)
                  ? source.members.slice(5)
                  : [];
      const bench = new Array(10).fill(null).map((_, benchIndex) => {
          var _a;
          const benchInput = (_a = benchSource[benchIndex]) !== null && _a !== void 0 ? _a : null;
          const { unitId, label } = normalizeAssignment(benchInput, rosterIndex);
          return {
              index: benchIndex,
              unitId,
              label,
              meta: isLineupMemberConfig(benchInput) ? { ...benchInput } : null,
          };
      });
      const passiveSource = Array.isArray(source.passives)
          ? source.passives
          : Array.isArray(source.passiveSlots)
              ? source.passiveSlots
              : [];
      const passives = new Array(6).fill(null).map((_, passiveIndex) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
          const passiveInput = (_a = passiveSource[passiveIndex]) !== null && _a !== void 0 ? _a : null;
          if (!passiveInput) {
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
                  source: null,
              };
          }
          const passive = isLineupPassiveConfig(passiveInput) ? passiveInput : {};
          const idValue = (_c = (_b = passive.id) !== null && _b !== void 0 ? _b : passive.key) !== null && _c !== void 0 ? _c : `passive-${passiveIndex}`;
          const nameValue = (_e = (_d = passive.name) !== null && _d !== void 0 ? _d : passive.title) !== null && _e !== void 0 ? _e : `Passive #${passiveIndex + 1}`;
          const descriptionValue = (_h = (_g = (_f = passive.description) !== null && _f !== void 0 ? _f : passive.effect) !== null && _g !== void 0 ? _g : passive.text) !== null && _h !== void 0 ? _h : '';
          const requirementValue = (_l = (_k = (_j = passive.requirement) !== null && _j !== void 0 ? _j : passive.condition) !== null && _k !== void 0 ? _k : passive.prerequisite) !== null && _l !== void 0 ? _l : '';
          const requiredUnitIds = Array.isArray(passive.requiredUnitIds)
              ? passive.requiredUnitIds.map(String)
              : Array.isArray(passive.requires)
                  ? passive.requires.filter(item => typeof item === 'string').map(String)
                  : (typeof passive.requiredUnitId === 'string' ? [passive.requiredUnitId] : []);
          const requiredTags = Array.isArray(passive.requiredTags)
              ? passive.requiredTags.map(String)
              : Array.isArray(passive.tagsRequired)
                  ? passive.tagsRequired.map(String)
                  : [];
          const auto = passive.autoActive === true || passive.alwaysActive === true || passive.isActive === true;
          return {
              index: passiveIndex,
              id: String(idValue),
              name: typeof nameValue === 'string' ? nameValue : `Passive #${passiveIndex + 1}`,
              description: typeof descriptionValue === 'string' ? descriptionValue : '',
              requirement: typeof requirementValue === 'string' ? requirementValue : '',
              requiredUnitIds,
              requiredTags,
              isEmpty: false,
              autoActive: Boolean(auto),
              source: isLineupPassiveConfig(passiveInput) ? passiveInput : null,
          };
      });
      const leaderIdValue = (_p = (_o = (_m = source.leaderId) !== null && _m !== void 0 ? _m : source.leader) !== null && _o !== void 0 ? _o : source.captainId) !== null && _p !== void 0 ? _p : null;
      const fallbackLeader = (_r = (_q = slots.find(slot => slot.unitId)) === null || _q === void 0 ? void 0 : _q.unitId) !== null && _r !== void 0 ? _r : null;
      const defaultCurrencyIdValue = (_s = defaultCurrencyId !== null && defaultCurrencyId !== void 0 ? defaultCurrencyId : source.currency) !== null && _s !== void 0 ? _s : null;
      return {
          id: String(id),
          name: typeof name === 'string' ? name : `Đội hình #${index + 1}`,
          role: typeof role === 'string' ? role : '',
          description: typeof description === 'string' ? description : '',
          slots,
          bench,
          passives,
          leaderId: (typeof leaderIdValue === 'string' && rosterIndex.has(leaderIdValue)) ? leaderIdValue : fallbackLeader,
          defaultCurrencyId: typeof defaultCurrencyIdValue === 'string' ? defaultCurrencyIdValue : null,
      };
  }
  function normalizeLineups(rawLineups, roster) {
      const rosterIndex = new Set(roster.map(unit => unit.id));
      if (!Array.isArray(rawLineups) || rawLineups.length === 0) {
          const slots = new Array(5).fill(null).map((_, index) => ({
              index,
              unitId: null,
              label: null,
              unlocked: index < 3,
              unlockCost: null,
              equipment: null,
              meta: null,
          }));
          const bench = new Array(10).fill(null).map((_, index) => ({
              index,
              unitId: null,
              label: null,
              meta: null,
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
              source: null,
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
                  defaultCurrencyId: null,
              }];
      }
      return rawLineups.map((entry, index) => normalizeLineupEntry(entry !== null && entry !== void 0 ? entry : null, index, rosterIndex));
  }
  function extractCurrencyBalances(source) {
      const balances = new Map();
      if (!source) {
          return balances;
      }
      const apply = (id, value) => {
          if (!id)
              return;
          const amount = Number(value);
          if (!Number.isNaN(amount)) {
              balances.set(String(id), amount);
          }
      };
      if (Array.isArray(source)) {
          source.forEach(entry => {
              var _a, _b, _c, _d, _e, _f, _g;
              if (!entry)
                  return;
              if (typeof entry === 'number') {
                  apply('VNT', entry);
                  return;
              }
              if (typeof entry === 'string') {
                  const [id, value] = entry.split(':');
                  if (id && value) {
                      apply(id.trim(), Number(value));
                  }
                  return;
              }
              if (typeof entry === 'object') {
                  const record = entry;
                  const id = (_c = (_b = (_a = record.currencyId) !== null && _a !== void 0 ? _a : record.id) !== null && _b !== void 0 ? _b : record.key) !== null && _c !== void 0 ? _c : record.type;
                  const value = (_g = (_f = (_e = (_d = record.balance) !== null && _d !== void 0 ? _d : record.amount) !== null && _e !== void 0 ? _e : record.value) !== null && _f !== void 0 ? _f : record.total) !== null && _g !== void 0 ? _g : null;
                  apply(id, value);
              }
          });
          return balances;
      }
      if (typeof source === 'object') {
          Object.entries(source).forEach(([key, value]) => {
              var _a, _b, _c, _d, _e, _f;
              if (value && typeof value === 'object' && ('balance' in value || 'amount' in value || 'value' in value || 'total' in value)) {
                  const record = value;
                  const id = (_c = (_b = (_a = record.currencyId) !== null && _a !== void 0 ? _a : record.id) !== null && _b !== void 0 ? _b : record.key) !== null && _c !== void 0 ? _c : key;
                  apply(id, (_f = (_e = (_d = record.balance) !== null && _d !== void 0 ? _d : record.amount) !== null && _e !== void 0 ? _e : record.value) !== null && _f !== void 0 ? _f : record.total);
              }
              else {
                  apply(key, value);
              }
          });
          const record = source.balances;
          if (record && typeof record === 'object') {
              Object.entries(record).forEach(([key, value]) => apply(key, value));
          }
      }
      return balances;
  }
  function createCurrencyBalances(primary, secondary) {
      const base = extractCurrencyBalances(primary);
      const override = extractCurrencyBalances(secondary);
      for (const [key, value] of override.entries()) {
          base.set(key, value);
      }
      currencyCatalog.forEach(currency => {
          if (!base.has(currency.id)) {
              base.set(currency.id, 0);
          }
      });
      return base;
  }
  function formatCurrencyBalance(amount, currencyId) {
      const currency = currencyIndex.get(currencyId);
      const formatted = numberFormatter.format(Number.isFinite(amount) ? Number(amount) : 0);
      const suffix = (currency === null || currency === void 0 ? void 0 : currency.suffix) || currencyId || '';
      return suffix ? `${formatted} ${suffix}` : formatted;
  }
  function filterRoster(roster, filter) {
      if (!filter || filter.type === 'all' || !filter.value) {
          return roster;
      }
      const value = String(filter.value).toLowerCase();
      if (filter.type === 'class') {
          return roster.filter(unit => (unit.role || '').toLowerCase() === value);
      }
      if (filter.type === 'rank') {
          return roster.filter(unit => (unit.rank || '').toLowerCase() === value);
      }
      if (filter.type === 'tag') {
          return roster.filter(unit => unit.tags.some(tag => String(tag).toLowerCase() === value));
      }
      return roster;
  }
  function createFilterOptions(roster) {
      const classes = new Set();
      const ranks = new Set();
      const tags = new Set();
      roster.forEach(unit => {
          if (unit.role)
              classes.add(unit.role);
          if (unit.rank)
              ranks.add(unit.rank);
          (unit.tags || []).forEach(tag => tags.add(tag));
      });
      return {
          classes: Array.from(classes),
          ranks: Array.from(ranks),
          tags: Array.from(tags),
      };
  }
  function collectAssignedUnitIds(lineup) {
      const ids = new Set();
      lineup.slots.forEach(slot => {
          if (slot.unitId) {
              ids.add(slot.unitId);
          }
      });
      lineup.bench.forEach(cell => {
          if (cell.unitId) {
              ids.add(cell.unitId);
          }
      });
      if (lineup.leaderId) {
          ids.add(lineup.leaderId);
      }
      return ids;
  }
  function evaluatePassive(passive, assignedUnitIds, rosterLookup) {
      var _a, _b;
      if (!passive || passive.isEmpty) {
          return false;
      }
      if (passive.autoActive) {
          return true;
      }
      if (passive.requiredUnitIds && passive.requiredUnitIds.length > 0) {
          for (const required of passive.requiredUnitIds) {
              if (!assignedUnitIds.has(required)) {
                  return false;
              }
          }
      }
      if (passive.requiredTags && passive.requiredTags.length > 0) {
          const availableTags = new Set();
          assignedUnitIds.forEach(id => {
              const unit = rosterLookup.get(id);
              if (!unit)
                  return;
              if (unit.role)
                  availableTags.add(unit.role);
              if (unit.rank)
                  availableTags.add(unit.rank);
              (unit.tags || []).forEach(tag => availableTags.add(tag));
          });
          const hasAllTags = passive.requiredTags.every(tag => availableTags.has(tag));
          if (!hasAllTags) {
              return false;
          }
      }
      if (!((_a = passive.requiredUnitIds) === null || _a === void 0 ? void 0 : _a.length) && !((_b = passive.requiredTags) === null || _b === void 0 ? void 0 : _b.length)) {
          return assignedUnitIds.size > 0;
      }
      return true;
  }
  function removeUnitFromPlacements(lineup, unitId, options = {}) {
      if (!unitId)
          return;
      const { keepLeader = false } = options;
      lineup.slots.forEach(slot => {
          if (slot.unitId === unitId) {
              slot.unitId = null;
          }
      });
      lineup.bench.forEach(cell => {
          if (cell.unitId === unitId) {
              cell.unitId = null;
          }
      });
      if (!keepLeader && lineup.leaderId === unitId) {
          lineup.leaderId = null;
      }
  }
  function assignUnitToSlot(lineup, slotIndex, unitId) {
      const slot = lineup.slots[slotIndex];
      if (!slot) {
          return { ok: false, message: 'Không tìm thấy vị trí.' };
      }
      if (!slot.unlocked) {
          return { ok: false, message: 'Vị trí đang bị khóa.' };
      }
      if (slot.unitId === unitId) {
          return { ok: true };
      }
      removeUnitFromPlacements(lineup, unitId, { keepLeader: true });
      slot.unitId = unitId;
      slot.label = null;
      return { ok: true };
  }
  function removeUnitFromSlot(lineup, slotIndex) {
      const slot = lineup.slots[slotIndex];
      if (!slot)
          return;
      const removedUnitId = slot.unitId;
      slot.unitId = null;
      slot.label = null;
      if (removedUnitId && lineup.leaderId === removedUnitId) {
          lineup.leaderId = null;
      }
  }
  function unlockSlot(lineup, slotIndex, balances) {
      var _a;
      const slot = lineup.slots[slotIndex];
      if (!slot) {
          return { ok: false, message: 'Không tìm thấy vị trí.' };
      }
      if (slot.unlocked) {
          return { ok: true, spent: null };
      }
      const cost = slot.unlockCost;
      if (cost) {
          const current = (_a = balances.get(cost.currencyId)) !== null && _a !== void 0 ? _a : 0;
          if (current < cost.amount) {
              return {
                  ok: false,
                  message: `Không đủ ${formatCurrencyBalance(cost.amount, cost.currencyId)} để mở khóa vị trí này.`,
              };
          }
          balances.set(cost.currencyId, current - cost.amount);
      }
      slot.unlocked = true;
      slot.unlockCost = null;
      return { ok: true, spent: cost !== null && cost !== void 0 ? cost : null };
  }
  function assignUnitToBench(lineup, benchIndex, unitId) {
      const cell = lineup.bench[benchIndex];
      if (!cell) {
          return { ok: false, message: 'Không tìm thấy ô dự bị.' };
      }
      if (cell.unitId === unitId) {
          return { ok: true };
      }
      removeUnitFromPlacements(lineup, unitId, { keepLeader: true });
      cell.unitId = unitId;
      cell.label = null;
      return { ok: true };
  }
  function removeUnitFromBench(lineup, benchIndex) {
      const cell = lineup.bench[benchIndex];
      if (!cell)
          return;
      cell.unitId = null;
  }
  function isUnitPlaced(lineup, unitId) {
      if (!unitId)
          return false;
      if (lineup.leaderId === unitId)
          return true;
      if (lineup.slots.some(slot => slot.unitId === unitId))
          return true;
      if (lineup.bench.some(cell => cell.unitId === unitId))
          return true;
      return false;
  }
  function setLeader(lineup, unitId, rosterLookup) {
      if (!lineup) {
          return { ok: false, message: 'Không tìm thấy đội hình.' };
      }
      if (!unitId) {
          lineup.leaderId = null;
          return { ok: true };
      }
      const unit = rosterLookup.get(unitId);
      if (!unit) {
          return { ok: false, message: 'Không tìm thấy nhân vật.' };
      }
      if (!isUnitPlaced(lineup, unitId)) {
          const slot = lineup.slots.find(entry => entry.unlocked && !entry.unitId);
          if (slot) {
              assignUnitToSlot(lineup, slot.index, unitId);
          }
          else {
              const bench = lineup.bench.find(entry => !entry.unitId);
              if (bench) {
                  assignUnitToBench(lineup, bench.index, unitId);
              }
              else {
                  return { ok: false, message: 'Không còn vị trí trống để gán leader.' };
              }
          }
      }
      lineup.leaderId = unitId;
      return { ok: true };
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeRoster')) exports.normalizeRoster = normalizeRoster;
  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeLineups')) exports.normalizeLineups = normalizeLineups;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createCurrencyBalances')) exports.createCurrencyBalances = createCurrencyBalances;
  if (!Object.prototype.hasOwnProperty.call(exports, 'formatCurrencyBalance')) exports.formatCurrencyBalance = formatCurrencyBalance;
  if (!Object.prototype.hasOwnProperty.call(exports, 'filterRoster')) exports.filterRoster = filterRoster;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createFilterOptions')) exports.createFilterOptions = createFilterOptions;
  if (!Object.prototype.hasOwnProperty.call(exports, 'collectAssignedUnitIds')) exports.collectAssignedUnitIds = collectAssignedUnitIds;
  if (!Object.prototype.hasOwnProperty.call(exports, 'evaluatePassive')) exports.evaluatePassive = evaluatePassive;
  if (!Object.prototype.hasOwnProperty.call(exports, 'removeUnitFromPlacements')) exports.removeUnitFromPlacements = removeUnitFromPlacements;
  if (!Object.prototype.hasOwnProperty.call(exports, 'assignUnitToSlot')) exports.assignUnitToSlot = assignUnitToSlot;
  if (!Object.prototype.hasOwnProperty.call(exports, 'removeUnitFromSlot')) exports.removeUnitFromSlot = removeUnitFromSlot;
  if (!Object.prototype.hasOwnProperty.call(exports, 'unlockSlot')) exports.unlockSlot = unlockSlot;
  if (!Object.prototype.hasOwnProperty.call(exports, 'assignUnitToBench')) exports.assignUnitToBench = assignUnitToBench;
  if (!Object.prototype.hasOwnProperty.call(exports, 'removeUnitFromBench')) exports.removeUnitFromBench = removeUnitFromBench;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isUnitPlaced')) exports.isUnitPlaced = isUnitPlaced;
  if (!Object.prototype.hasOwnProperty.call(exports, 'setLeader')) exports.setLeader = setLeader;
});
__define('./screens/main-menu/dialogues.ts', (exports, module, __require) => {
  const __dep0 = __require('./art.ts');
  const getUnitArt = __dep0.getUnitArt;
  const HERO_DEFAULT_ID = 'leaderA';
  const FALLBACK_HERO_KEY = 'default';
  const HERO_PROFILES = {
      leaderA: {
          id: 'leaderA',
          name: 'Uyên',
          title: 'Hộ Độn Tuyến Đầu',
          faction: 'Đoàn Thủ Hộ Lam Quang',
          role: 'Kỵ sĩ phòng tuyến',
          portrait: 'leaderA',
          motto: 'Giữ vững ánh lam, bảo hộ tuyến đầu.'
      },
      default: {
          id: HERO_DEFAULT_ID,
          name: 'Chiến binh Arclune',
          title: 'Hộ vệ tiền tuyến',
          faction: 'Arclune',
          role: 'Đa năng',
          portrait: HERO_DEFAULT_ID,
          motto: 'Vì ánh sáng Arclune.'
      }
  };
  const HERO_HOTSPOTS = {
      leaderA: [
          {
              key: 'sigil',
              label: 'Ấn Tịnh Quang',
              description: 'Điều chỉnh giáp hộ thân – cực kỳ nhạy cảm.',
              cue: 'sensitive',
              type: 'sensitive'
          }
      ],
      default: [
          {
              key: 'sigil',
              label: 'Phù hiệu chiến',
              description: 'Điểm neo năng lượng cần tránh va chạm.',
              cue: 'sensitive',
              type: 'sensitive'
          }
      ]
  };
  const HERO_DIALOGUES = {
      leaderA: {
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
      },
      default: {
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
  };
  const HERO_PROFILE_FALLBACK = HERO_PROFILES[FALLBACK_HERO_KEY]
      || HERO_PROFILES[HERO_DEFAULT_ID]
      || {
          id: HERO_DEFAULT_ID,
          name: 'Chiến binh Arclune',
          title: 'Hộ vệ tiền tuyến',
          faction: 'Arclune',
          role: 'Đa năng',
          motto: 'Vì ánh sáng Arclune.',
          portrait: HERO_DEFAULT_ID,
      };
  const HERO_DIALOGUE_FALLBACK = HERO_DIALOGUES[FALLBACK_HERO_KEY] || {};
  const HERO_HOTSPOT_FALLBACK = HERO_HOTSPOTS[FALLBACK_HERO_KEY] || [];
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
  function resolveHeroKey(heroId, lookup) {
      if (heroId && heroId in lookup) {
          return heroId;
      }
      return FALLBACK_HERO_KEY;
  }
  function normalizeGender(value) {
      if (typeof value === 'string') {
          const key = value.trim().toLowerCase();
          const mapped = GENDER_MAP[key];
          if (mapped) {
              return mapped;
          }
      }
      return 'neutral';
  }
  function ensureArray(value) {
      if (Array.isArray(value)) {
          return value;
      }
      if (value === null || value === undefined) {
          return [];
      }
      return [value];
  }
  function pickLine(pool) {
      const list = ensureArray(pool)
          .filter((item) => Boolean(item));
      if (!list.length)
          return null;
      const index = Math.floor(Math.random() * list.length);
      const item = list[index];
      if (item && typeof item === 'object') {
          return {
              text: item.text || '',
              tone: item.tone || null,
              label: item.label || null
          };
      }
      return { text: String(item !== null && item !== void 0 ? item : ''), tone: null, label: null };
  }
  function inferTone(cue) {
      if (cue && cue in CUE_TONES) {
          const mapped = CUE_TONES[cue];
          if (mapped) {
              return mapped;
          }
      }
      if (cue && cue in TONE_TO_CUE) {
          const mapped = TONE_TO_CUE[cue];
          if (mapped) {
              return mapped;
          }
      }
      return 'calm';
  }
  function inferLabel(cue) {
      if (cue && CUE_LABELS[cue]) {
          return CUE_LABELS[cue];
      }
      return 'Tương tác';
  }
  function getHeroProfile(heroId = HERO_DEFAULT_ID) {
      var _a, _b;
      const resolvedKey = resolveHeroKey(heroId, HERO_PROFILES);
      const profile = (_a = HERO_PROFILES[resolvedKey]) !== null && _a !== void 0 ? _a : HERO_PROFILE_FALLBACK;
      const portraitId = profile.portrait || heroId || HERO_DEFAULT_ID;
      const art = portraitId ? getUnitArt(portraitId) || null : null;
      const hotspots = (_b = HERO_HOTSPOTS[resolvedKey]) !== null && _b !== void 0 ? _b : HERO_HOTSPOT_FALLBACK;
      return {
          id: profile.id,
          name: profile.name || null,
          title: profile.title || null,
          faction: profile.faction || null,
          role: profile.role || null,
          motto: profile.motto || null,
          portrait: portraitId,
          hotspots: hotspots.map(item => ({ ...item })),
          art
      };
  }
  function getHeroHotspots(heroId = HERO_DEFAULT_ID) {
      var _a;
      const resolvedKey = resolveHeroKey(heroId, HERO_HOTSPOTS);
      const hotspots = (_a = HERO_HOTSPOTS[resolvedKey]) !== null && _a !== void 0 ? _a : HERO_HOTSPOT_FALLBACK;
      return hotspots.map(item => ({ ...item }));
  }
  function getHeroDialogue(heroId, cue, options = {}) {
      var _a, _b, _c;
      const targetCue = (cue || 'intro');
      const gender = normalizeGender(options.gender);
      const zone = options.zone || null;
      const profileKey = resolveHeroKey(heroId, HERO_PROFILES);
      const heroKey = resolveHeroKey(heroId, HERO_DIALOGUES);
      const profile = (_a = HERO_PROFILES[profileKey]) !== null && _a !== void 0 ? _a : HERO_PROFILE_FALLBACK;
      const dialogues = (_b = HERO_DIALOGUES[heroKey]) !== null && _b !== void 0 ? _b : HERO_DIALOGUE_FALLBACK;
      const fallbackDialogues = HERO_DIALOGUE_FALLBACK;
      const table = dialogues[targetCue] || fallbackDialogues[targetCue] || null;
      const pool = table ? (table[gender] || table.neutral || table.default || null) : null;
      const picked = pickLine(pool);
      const text = ((_c = picked === null || picked === void 0 ? void 0 : picked.text) === null || _c === void 0 ? void 0 : _c.trim()) ? picked.text.trim() : '...';
      const tone = (picked === null || picked === void 0 ? void 0 : picked.tone) || inferTone(targetCue);
      const label = (picked === null || picked === void 0 ? void 0 : picked.label) || inferLabel(targetCue);
      return {
          heroId: profile.id,
          cue: targetCue,
          zone,
          text,
          tone,
          label
      };
  }
  function listAvailableHeroes() {
      return Object.keys(HERO_PROFILES).filter(key => key !== FALLBACK_HERO_KEY);
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'HERO_DEFAULT_ID')) exports.HERO_DEFAULT_ID = HERO_DEFAULT_ID;
  if (!Object.prototype.hasOwnProperty.call(exports, 'HERO_PROFILES')) exports.HERO_PROFILES = HERO_PROFILES;
  if (!Object.prototype.hasOwnProperty.call(exports, 'HERO_HOTSPOTS')) exports.HERO_HOTSPOTS = HERO_HOTSPOTS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'HERO_DIALOGUES')) exports.HERO_DIALOGUES = HERO_DIALOGUES;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getHeroProfile')) exports.getHeroProfile = getHeroProfile;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getHeroHotspots')) exports.getHeroHotspots = getHeroHotspots;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getHeroDialogue')) exports.getHeroDialogue = getHeroDialogue;
  if (!Object.prototype.hasOwnProperty.call(exports, 'listAvailableHeroes')) exports.listAvailableHeroes = listAvailableHeroes;
});
__define('./screens/main-menu/types.ts', (exports, module, __require) => {


});
__define('./screens/main-menu/view/events.ts', (exports, module, __require) => {
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
  function cueTone(tone) {
      if (tone && TONE_ICONS[tone]) {
          return { icon: TONE_ICONS[tone], tone };
      }
      return { icon: '✦', tone: tone || 'calm' };
  }
  function buildModeCardBase(element, mode, options = {}) {
      const { extraClasses = [], showStatus = true } = options;
      element.classList.add('mode-card');
      extraClasses.forEach(cls => element.classList.add(cls));
      if (mode.key) {
          element.dataset.mode = mode.key;
      }
      const icon = document.createElement('span');
      icon.className = 'mode-card__icon';
      icon.textContent = mode.icon || '◆';
      element.appendChild(icon);
      const title = document.createElement('h3');
      title.className = 'mode-card__title';
      title.textContent = mode.title || mode.label || mode.key || '';
      element.appendChild(title);
      if (mode.description) {
          const desc = document.createElement('p');
          desc.className = 'mode-card__desc';
          desc.textContent = mode.description;
          element.appendChild(desc);
      }
      const tags = document.createElement('div');
      tags.className = 'mode-card__tags';
      (mode.tags || []).forEach(tag => {
          if (!tag)
              return;
          const chip = document.createElement('span');
          chip.className = 'mode-tag';
          chip.textContent = tag;
          const mapped = TAG_CLASS_MAP.get(tag);
          if (mapped) {
              chip.classList.add(mapped);
          }
          tags.appendChild(chip);
      });
      if (tags.childElementCount > 0) {
          element.appendChild(tags);
      }
      let statusEl = null;
      if (showStatus && mode.status === 'coming-soon') {
          element.classList.add('mode-card--coming');
          if (mode.key) {
              element.setAttribute('aria-describedby', `${mode.key}-status`);
          }
          element.setAttribute('aria-disabled', 'true');
          statusEl = document.createElement('span');
          if (mode.key) {
              statusEl.id = `${mode.key}-status`;
          }
          statusEl.className = 'mode-card__status';
          statusEl.textContent = 'Coming soon';
          element.appendChild(statusEl);
      }
      return { statusEl };
  }
  function createModeCard(mode, shell, onShowComingSoon, addCleanup, options = {}) {
      const button = document.createElement('button');
      button.type = 'button';
      const extraClasses = Array.isArray(options.extraClasses)
          ? options.extraClasses
          : options.extraClass
              ? [options.extraClass]
              : [];
      buildModeCardBase(button, mode, {
          extraClasses,
          showStatus: options.showStatus !== false
      });
      const handleClick = (event) => {
          var _a, _b;
          event.preventDefault();
          event.stopPropagation();
          if (typeof options.onPrimaryAction === 'function') {
              options.onPrimaryAction({ mode, event, element: button });
              return;
          }
          if (!shell || typeof shell.enterScreen !== 'function')
              return;
          if (mode.status === 'coming-soon') {
              if (typeof onShowComingSoon === 'function') {
                  onShowComingSoon(mode);
              }
              shell.enterScreen(mode.id || 'main-menu', (_a = mode.params) !== null && _a !== void 0 ? _a : null);
              return;
          }
          shell.enterScreen(mode.id || 'main-menu', (_b = mode.params) !== null && _b !== void 0 ? _b : null);
      };
      button.addEventListener('click', handleClick);
      addCleanup(() => button.removeEventListener('click', handleClick));
      if (typeof options.afterCreate === 'function') {
          options.afterCreate(button);
      }
      return button;
  }
  function createModeGroupCard(group, childModes, shell, onShowComingSoon, addCleanup) {
      const wrapper = document.createElement('div');
      const groupClasses = Array.isArray(group.extraClasses)
          ? ['mode-card--group', ...group.extraClasses]
          : ['mode-card--group'];
      buildModeCardBase(wrapper, group, { extraClasses: groupClasses, showStatus: false });
      wrapper.setAttribute('role', 'button');
      wrapper.setAttribute('aria-haspopup', 'true');
      wrapper.setAttribute('aria-expanded', 'false');
      if (group.title) {
          wrapper.setAttribute('aria-label', `Chọn chế độ trong ${group.title}`);
      }
      wrapper.tabIndex = 0;
      const infoBlock = document.createElement('div');
      infoBlock.className = 'mode-card__group-info';
      infoBlock.setAttribute('aria-hidden', 'false');
      const existingIcon = wrapper.querySelector('.mode-card__icon');
      const existingTitle = wrapper.querySelector('.mode-card__title');
      const existingDesc = wrapper.querySelector('.mode-card__desc');
      if (existingIcon) {
          infoBlock.appendChild(existingIcon);
      }
      if (existingTitle) {
          infoBlock.appendChild(existingTitle);
      }
      if (existingDesc) {
          infoBlock.appendChild(existingDesc);
      }
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
      const close = () => {
          if (!isOpen)
              return;
          isOpen = false;
          wrapper.classList.remove('is-open');
          wrapper.setAttribute('aria-expanded', 'false');
          infoBlock.hidden = false;
          infoBlock.setAttribute('aria-hidden', 'false');
          childrenGrid.hidden = true;
          childrenGrid.setAttribute('aria-hidden', 'true');
          if (documentListenerActive) {
              document.removeEventListener('click', handleDocumentClick, true);
              documentListenerActive = false;
          }
      };
      const open = () => {
          if (isOpen)
              return;
          isOpen = true;
          wrapper.classList.add('is-open');
          wrapper.setAttribute('aria-expanded', 'true');
          infoBlock.hidden = true;
          infoBlock.setAttribute('aria-hidden', 'true');
          childrenGrid.hidden = false;
          childrenGrid.setAttribute('aria-hidden', 'false');
          if (!documentListenerActive) {
              document.addEventListener('click', handleDocumentClick, true);
              documentListenerActive = true;
          }
      };
      const toggle = () => {
          if (isOpen) {
              close();
          }
          else {
              open();
          }
      };
      function handleDocumentClick(event) {
          if (!wrapper.contains(event.target)) {
              close();
          }
      }
      const handleToggle = (event) => {
          event.preventDefault();
          event.stopPropagation();
          toggle();
      };
      const handleKeydown = (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              toggle();
              return;
          }
          if (event.key === 'Escape' && isOpen) {
              event.preventDefault();
              close();
              wrapper.focus({ preventScroll: true });
          }
      };
      const handleFocusOut = (event) => {
          if (!isOpen)
              return;
          if (!wrapper.contains(event.relatedTarget)) {
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
          if (documentListenerActive) {
              document.removeEventListener('click', handleDocumentClick, true);
              documentListenerActive = false;
          }
      });
      childModes.forEach(child => {
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'mode-card__child';
          if (child.key) {
              item.dataset.mode = child.key;
          }
          item.setAttribute('role', 'menuitem');
          if (child.status === 'coming-soon') {
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
          title.textContent = child.title || child.label || child.key || '';
          body.appendChild(title);
          const status = document.createElement('span');
          status.className = 'mode-card__child-status';
          status.textContent = child.status === 'coming-soon' ? 'Coming soon' : 'Sẵn sàng';
          body.appendChild(status);
          if (child.description) {
              const desc = document.createElement('span');
              desc.className = 'mode-card__child-desc';
              desc.textContent = child.description;
              body.appendChild(desc);
          }
          item.appendChild(body);
          const handleSelect = (event) => {
              var _a;
              event.preventDefault();
              event.stopPropagation();
              if (!shell || typeof shell.enterScreen !== 'function')
                  return;
              if (child.status === 'coming-soon' && typeof onShowComingSoon === 'function') {
                  onShowComingSoon(child);
              }
              shell.enterScreen(child.id || 'main-menu', (_a = child.params) !== null && _a !== void 0 ? _a : null);
              close();
              wrapper.focus({ preventScroll: true });
          };
          item.addEventListener('click', handleSelect);
          addCleanup(() => item.removeEventListener('click', handleSelect));
          childrenGrid.appendChild(item);
      });
      return wrapper;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'cueTone')) exports.cueTone = cueTone;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createModeCard')) exports.createModeCard = createModeCard;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createModeGroupCard')) exports.createModeGroupCard = createModeGroupCard;
});
__define('./screens/main-menu/view/index.ts', (exports, module, __require) => {
  const __dep1 = __require('./screens/main-menu/dialogues.ts');
  const HERO_DEFAULT_ID = __dep1.HERO_DEFAULT_ID;
  const __dep2 = __require('./ui/dom.ts');
  const mountSection = __dep2.mountSection;
  const __dep3 = __require('./screens/main-menu/view/layout.ts');
  const ensureStyles = __dep3.ensureStyles;
  const createHeader = __dep3.createHeader;
  const createHeroSection = __dep3.createHeroSection;
  const createModesSection = __dep3.createModesSection;
  const createSidebar = __dep3.createSidebar;
  function renderMainMenuView(state) {
      const { root, shell = null, sections = [], metadata = [], heroId = HERO_DEFAULT_ID, playerGender = 'neutral', onShowComingSoon } = state;
      if (!root)
          return null;
      ensureStyles();
      const cleanups = [];
      const addCleanup = fn => {
          if (typeof fn === 'function') {
              cleanups.push(fn);
          }
      };
      const container = document.createElement('div');
      container.className = 'main-menu-v2';
      const mount = mountSection({
          root,
          section: container,
          rootClasses: 'app--main-menu',
          removeRootClasses: 'app--pve',
      });
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
      return {
          destroy() {
              cleanups.forEach(fn => {
                  try {
                      fn();
                  }
                  catch (err) {
                      console.error('[main-menu] cleanup failed', err);
                  }
              });
              cleanups.length = 0;
              mount.destroy();
          }
      };
  }
  const __reexport0 = __require('./screens/main-menu/view/layout.ts');

  if (!Object.prototype.hasOwnProperty.call(exports, 'ensureStyles')) exports.ensureStyles = __reexport0.ensureStyles;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createHeader')) exports.createHeader = __reexport0.createHeader;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createHeroSection')) exports.createHeroSection = __reexport0.createHeroSection;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createModesSection')) exports.createModesSection = __reexport0.createModesSection;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createSidebar')) exports.createSidebar = __reexport0.createSidebar;
  if (!Object.prototype.hasOwnProperty.call(exports, 'renderMainMenuView')) exports.renderMainMenuView = renderMainMenuView;
});
__define('./screens/main-menu/view/layout.ts', (exports, module, __require) => {
  const __dep0 = __require('./data/announcements.ts');
  const getAllSidebarAnnouncements = __dep0.getAllSidebarAnnouncements;
  const __dep1 = __require('./ui/dom.ts');
  const ensureStyleTag = __dep1.ensureStyleTag;
  const __dep2 = __require('./screens/main-menu/dialogues.ts');
  const getHeroDialogue = __dep2.getHeroDialogue;
  const getHeroHotspots = __dep2.getHeroHotspots;
  const getHeroProfile = __dep2.getHeroProfile;
  const HERO_DEFAULT_ID = __dep2.HERO_DEFAULT_ID;
  const __dep3 = __require('./screens/main-menu/view/events.ts');
  const cueTone = __dep3.cueTone;
  const createModeCard = __dep3.createModeCard;
  const createModeGroupCard = __dep3.createModeGroupCard;
  const STYLE_ID = 'main-menu-view-style';
  function ensureStyles() {
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
      ensureStyleTag(STYLE_ID, { css });
  }
  function applyPalette(element, profile) {
      var _a;
      if (!element)
          return;
      const palette = (_a = profile.art) === null || _a === void 0 ? void 0 : _a.palette;
      if (!palette)
          return;
      const { primary, secondary, accent, outline } = palette;
      if (primary)
          element.style.setProperty('--hero-primary', primary);
      if (secondary)
          element.style.setProperty('--hero-secondary', secondary);
      if (accent)
          element.style.setProperty('--hero-accent', accent);
      if (outline)
          element.style.setProperty('--hero-outline', outline);
  }
  function createModesSection(options) {
      const { sections = [], metadata = [], shell, onShowComingSoon, addCleanup } = options;
      const sectionEl = document.createElement('section');
      sectionEl.className = 'main-menu-modes';
      const title = document.createElement('h2');
      title.className = 'main-menu-modes__title';
      title.textContent = 'Chế độ tác chiến';
      sectionEl.appendChild(title);
      const metaByKey = new Map();
      metadata.forEach(mode => {
          if (mode === null || mode === void 0 ? void 0 : mode.key) {
              metaByKey.set(mode.key, mode);
          }
      });
      sections.forEach(section => {
          if (!section)
              return;
          const sectionGroup = document.createElement('div');
          sectionGroup.className = 'mode-section';
          const heading = document.createElement('h3');
          heading.className = 'mode-section__name';
          heading.textContent = section.title || 'Danh mục';
          sectionGroup.appendChild(heading);
          const grid = document.createElement('div');
          grid.className = 'mode-grid';
          section.entries.forEach(entry => {
              if (!entry)
                  return;
              const cardKey = entry.cardId || entry.id;
              if (!cardKey)
                  return;
              const cardMeta = metaByKey.get(cardKey);
              if (!cardMeta)
                  return;
              if (entry.type === 'group') {
                  const childMetas = entry.childModeIds
                      .map(childId => (childId ? metaByKey.get(childId) : null))
                      .filter((item) => Boolean(item));
                  if (childMetas.length === 0)
                      return;
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
  function createHeroSection(options) {
      var _a, _b;
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
      if (profile.title) {
          const title = document.createElement('p');
          title.className = 'hero-panel__motto';
          title.textContent = profile.title;
          identity.appendChild(title);
      }
      if (profile.motto) {
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
      if ((_b = (_a = profile.art) === null || _a === void 0 ? void 0 : _a.sprite) === null || _b === void 0 ? void 0 : _b.src) {
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
          if (!spot)
              return;
          const hotspotBtn = document.createElement('button');
          hotspotBtn.type = 'button';
          hotspotBtn.className = 'hero-panel__hotspot';
          hotspotBtn.dataset.cue = spot.cue || 'sensitive';
          hotspotBtn.dataset.zone = spot.key;
          hotspotBtn.setAttribute('aria-label', spot.label || 'Điểm tương tác đặc biệt');
          const label = document.createElement('span');
          label.textContent = spot.label || 'Tương tác';
          hotspotBtn.appendChild(label);
          const handleClick = (event) => {
              event.preventDefault();
              event.stopPropagation();
              showDialogue(spot.cue || 'sensitive', { zone: spot.key });
              panel.classList.add('hero-panel--alert');
              window.setTimeout(() => panel.classList.remove('hero-panel--alert'), 620);
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
      const triggerTap = () => {
          panel.classList.add('is-pressed');
          showDialogue('tap');
          window.setTimeout(() => panel.classList.remove('is-pressed'), 220);
      };
      const handleClick = (event) => {
          event.preventDefault();
          triggerTap();
      };
      const handleKey = (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              triggerTap();
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
  function createSidebar(options) {
      const { shell, addCleanup } = options;
      const aside = document.createElement('aside');
      aside.className = 'main-menu-sidebar';
      const announcements = getAllSidebarAnnouncements();
      const attachTooltipHandlers = (element, info) => {
          if (!element || !info)
              return;
          const { slotKey, entry } = info;
          if (!slotKey)
              return;
          if (!shell || typeof shell.showTooltip !== 'function')
              return;
          const showTooltip = () => {
              var _a;
              (_a = shell.showTooltip) === null || _a === void 0 ? void 0 : _a.call(shell, {
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
              if (typeof shell.hideTooltip === 'function') {
                  shell.hideTooltip({ id: entry.id || null, slot: slotKey });
              }
          };
          element.addEventListener('mouseenter', showTooltip);
          element.addEventListener('mouseleave', hideTooltip);
          element.addEventListener('focus', showTooltip);
          element.addEventListener('blur', hideTooltip);
          addCleanup(() => {
              element.removeEventListener('mouseenter', showTooltip);
              element.removeEventListener('mouseleave', hideTooltip);
              element.removeEventListener('focus', showTooltip);
              element.removeEventListener('blur', hideTooltip);
          });
      };
      announcements.forEach(item => {
          const { key, label, entry } = item;
          const card = document.createElement('div');
          card.className = 'sidebar-slot';
          card.dataset.slot = key;
          if (entry.id)
              card.dataset.entryId = entry.id;
          if (entry.translationKey)
              card.dataset.translationKey = entry.translationKey;
          if (entry.startAt)
              card.dataset.startAt = entry.startAt;
          if (entry.endAt)
              card.dataset.endAt = entry.endAt;
          card.tabIndex = 0;
          const labelEl = document.createElement('span');
          labelEl.className = 'sidebar-slot__label';
          labelEl.textContent = label;
          const titleEl = document.createElement('h4');
          titleEl.className = 'sidebar-slot__title';
          titleEl.textContent = entry.title || '';
          const descEl = document.createElement('p');
          descEl.className = 'sidebar-slot__desc';
          descEl.textContent = entry.shortDescription || '';
          card.appendChild(labelEl);
          card.appendChild(titleEl);
          card.appendChild(descEl);
          if (entry.rewardCallout) {
              const rewardEl = document.createElement('span');
              rewardEl.className = 'sidebar-slot__reward';
              rewardEl.textContent = entry.rewardCallout;
              card.appendChild(rewardEl);
          }
          const tooltipText = [entry.tooltip, entry.rewardCallout].filter(Boolean).join('\n\n');
          const hasCustomTooltip = Boolean(shell && typeof shell.showTooltip === 'function');
          if (tooltipText && !hasCustomTooltip) {
              card.setAttribute('title', tooltipText);
          }
          else {
              card.removeAttribute('title');
          }
          attachTooltipHandlers(card, { slotKey: key, entry });
          aside.appendChild(card);
      });
      return aside;
  }
  function createHeader() {
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

  if (!Object.prototype.hasOwnProperty.call(exports, 'ensureStyles')) exports.ensureStyles = ensureStyles;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createModesSection')) exports.createModesSection = createModesSection;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createHeroSection')) exports.createHeroSection = createHeroSection;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createSidebar')) exports.createSidebar = createSidebar;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createHeader')) exports.createHeader = createHeader;
});
__define('./statuses.ts', (exports, module, __require) => {
  const __dep0 = __require('./combat.ts');
  const applyDamage = __dep0.applyDamage;
  const __dep1 = __require('./utils/fury.ts');
  const gainFury = __dep1.gainFury;
  const finishFuryHit = __dep1.finishFuryHit;
  const __dep2 = __require('./utils/time.ts');
  const safeNow = __dep2.safeNow;
  const clamp01 = (value) => Math.max(0, Math.min(1, value));
  const ensureStatusList = (unit) => {
      if (!unit)
          return [];
      if (!Array.isArray(unit.statuses)) {
          unit.statuses = [];
      }
      return unit.statuses;
  };
  const isTokenCandidate = (value) => {
      if (!value || typeof value !== 'object')
          return false;
      const candidate = value;
      return (typeof candidate.cx === 'number'
          && typeof candidate.cy === 'number'
          && typeof candidate.side === 'string');
  };
  function findStatus(unit, id) {
      var _a;
      const list = ensureStatusList(unit);
      const index = list.findIndex(status => status.id === id);
      const found = index >= 0 ? (_a = list[index]) !== null && _a !== void 0 ? _a : null : null;
      return [list, index, found];
  }
  function decrementDuration(unit, status) {
      if (typeof status.dur === 'number') {
          status.dur -= 1;
          if (status.dur <= 0)
              Statuses.remove(unit, status.id);
      }
  }
  const statusFactories = {
      stun: (spec) => {
          const { turns = 1 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'stun', kind: 'debuff', tag: 'control', dur: turns, tick: 'turn' };
      },
      sleep: (spec) => {
          const { turns = 1 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'sleep', kind: 'debuff', tag: 'control', dur: turns, tick: 'turn' };
      },
      taunt: (spec) => {
          const { turns = 1 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'taunt', kind: 'debuff', tag: 'control', dur: turns, tick: 'turn' };
      },
      reflect: (spec) => {
          const { pct = 0.2, turns = 1 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'reflect', kind: 'buff', tag: 'counter', power: pct, dur: turns, tick: 'turn' };
      },
      bleed: (spec) => {
          const { turns = 2 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'bleed', kind: 'debuff', tag: 'dot', dur: turns, tick: 'turn' };
      },
      damageCut: (spec) => {
          const { pct = 0.2, turns = 1 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'dmgCut', kind: 'buff', tag: 'mitigation', power: pct, dur: turns, tick: 'turn' };
      },
      fatigue: (spec) => {
          const { turns = 2 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'fatigue', kind: 'debuff', tag: 'output', dur: turns, tick: 'turn' };
      },
      silence: (spec) => {
          const { turns = 1 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'silence', kind: 'debuff', tag: 'silence', dur: turns, tick: 'turn' };
      },
      shield: (spec) => {
          const { pct = 0.2, amount = 0 } = (spec !== null && spec !== void 0 ? spec : {});
          return {
              id: 'shield',
              kind: 'buff',
              tag: 'shield',
              amount: amount !== null && amount !== void 0 ? amount : 0,
              power: pct,
              tick: null,
          };
      },
      exalt: (spec) => {
          const { turns = 2 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'exalt', kind: 'buff', tag: 'output', dur: turns, tick: 'turn' };
      },
      pierce: (spec) => {
          const { pct = 0.1, turns = 2 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'pierce', kind: 'buff', tag: 'penetration', power: pct, dur: turns, tick: 'turn' };
      },
      daze: (spec) => {
          const { turns = 1 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'daze', kind: 'debuff', tag: 'stat', dur: turns, tick: 'turn' };
      },
      frenzy: (spec) => {
          const { turns = 2 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'frenzy', kind: 'buff', tag: 'basic-boost', dur: turns, tick: 'turn' };
      },
      weaken: (spec) => {
          const { turns = 2, stacks = 1 } = (spec !== null && spec !== void 0 ? spec : {});
          return {
              id: 'weaken',
              kind: 'debuff',
              tag: 'output',
              dur: turns,
              tick: 'turn',
              stacks,
              maxStacks: 5,
          };
      },
      fear: (spec) => {
          const { turns = 1 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'fear', kind: 'debuff', tag: 'output', dur: turns, tick: 'turn' };
      },
      stealth: (spec) => {
          const { turns = 1 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'stealth', kind: 'buff', tag: 'invuln', dur: turns, tick: 'turn' };
      },
      venom: (spec) => {
          const { pct = 0.15, turns = 2 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'venom', kind: 'buff', tag: 'on-hit', power: pct, dur: turns, tick: 'turn' };
      },
      execute: (spec) => {
          const { turns = 2 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'execute', kind: 'buff', tag: 'execute', dur: turns, tick: 'turn' };
      },
      undying: () => ({ id: 'undying', kind: 'buff', tag: 'cheat-death', once: true }),
      allure: (spec) => {
          const { turns = 1 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'allure', kind: 'buff', tag: 'avoid-basic', dur: turns, tick: 'turn' };
      },
      haste: (spec) => {
          const { pct = 0.1, turns = 1 } = (spec !== null && spec !== void 0 ? spec : {});
          return { id: 'haste', kind: 'buff', tag: 'stat', power: pct, dur: turns, tick: 'turn' };
      },
  };
  const Statuses = {
      add(unit, status) {
          var _a, _b;
          const list = ensureStatusList(unit);
          const [, index, existing] = findStatus(unit, status.id);
          if (existing) {
              if (status.maxStacks && existing.stacks != null) {
                  existing.stacks = Math.min(status.maxStacks, (existing.stacks || 1) + (status.stacks || 1));
              }
              if (status.dur != null)
                  existing.dur = status.dur;
              if (status.power != null)
                  existing.power = status.power;
              if (status.amount != null)
                  existing.amount = ((_a = existing.amount) !== null && _a !== void 0 ? _a : 0) + ((_b = status.amount) !== null && _b !== void 0 ? _b : 0);
              return existing;
          }
          const copy = { ...status };
          if (copy.stacks == null)
              copy.stacks = 1;
          list.push(copy);
          return copy;
      },
      remove(unit, id) {
          const [list, index] = findStatus(unit, id);
          if (index >= 0)
              list.splice(index, 1);
      },
      has(unit, id) {
          const [, , found] = findStatus(unit, id);
          return found != null;
      },
      get(unit, id) {
          const [, , found] = findStatus(unit, id);
          return found;
      },
      purge(unit) {
          unit.statuses = [];
      },
      stacks(unit, id) {
          var _a;
          const found = this.get(unit, id);
          return found ? (_a = found.stacks) !== null && _a !== void 0 ? _a : 0 : 0;
      },
      onTurnStart(_unit, _ctx) {
          // reserved
      },
      onTurnEnd(unit, ctx) {
          var _a;
          const list = ensureStatusList(unit);
          const bleed = this.get(unit, 'bleed');
          if (bleed) {
              const lost = Math.round(((_a = unit.hpMax) !== null && _a !== void 0 ? _a : 0) * 0.05);
              applyDamage(unit, lost);
              hookOnLethalDamage(unit);
              if ((ctx === null || ctx === void 0 ? void 0 : ctx.log) && Array.isArray(ctx.log)) {
                  ctx.log.push({ t: 'bleed', who: unit.name, lost });
              }
              decrementDuration(unit, bleed);
          }
          for (const status of [...list]) {
              if (status.id !== 'bleed' && status.tick === 'turn') {
                  decrementDuration(unit, status);
              }
          }
      },
      onPhaseStart(_side, _ctx) {
          // reserved
      },
      onPhaseEnd(_side, _ctx) {
          // reserved
      },
      canAct(unit) {
          return !(this.has(unit, 'stun') || this.has(unit, 'sleep'));
      },
      blocks(unit, what) {
          if (what === 'ult')
              return this.has(unit, 'silence');
          return false;
      },
      resolveTarget(attacker, candidates, ctx = {}) {
          var _a;
          const attackType = (_a = ctx.attackType) !== null && _a !== void 0 ? _a : 'basic';
          const candidatePool = Array.isArray(candidates)
              ? candidates.filter(isTokenCandidate)
              : [];
          if (candidatePool.length === 0)
              return null;
          let pool = candidatePool;
          if (attackType === 'basic') {
              const filtered = candidatePool.filter(target => !this.has(target, 'allure'));
              if (filtered.length > 0) {
                  pool = filtered;
              }
          }
          const taunters = pool.filter(target => this.has(target, 'taunt'));
          if (taunters.length > 0) {
              let best = null;
              let bestDistance = Number.POSITIVE_INFINITY;
              for (const target of taunters) {
                  const distance = Math.abs(target.cx - attacker.cx) + Math.abs(target.cy - attacker.cy);
                  if (distance < bestDistance) {
                      best = target;
                      bestDistance = distance;
                  }
              }
              return best;
          }
          return null;
      },
      modifyStats(unit, base) {
          var _a, _b, _c, _d, _e;
          const next = { ...base };
          if (this.has(unit, 'daze')) {
              next.SPD = ((_a = next.SPD) !== null && _a !== void 0 ? _a : 0) * 0.9;
              next.AGI = ((_b = next.AGI) !== null && _b !== void 0 ? _b : 0) * 0.9;
          }
          if (this.has(unit, 'fear')) {
              next.SPD = ((_c = next.SPD) !== null && _c !== void 0 ? _c : 0) * 0.9;
          }
          const haste = this.get(unit, 'haste');
          if (haste) {
              const boost = 1 + clamp01((_d = haste.power) !== null && _d !== void 0 ? _d : 0.1);
              next.SPD = ((_e = next.SPD) !== null && _e !== void 0 ? _e : 0) * boost;
          }
          return next;
      },
      beforeDamage(attacker, target, ctx = {}) {
          var _a, _b, _c, _d, _e, _f;
          const attackType = (_a = ctx.attackType) !== null && _a !== void 0 ? _a : 'basic';
          const dtype = (_b = ctx.dtype) !== null && _b !== void 0 ? _b : 'phys';
          const base = (_c = ctx.base) !== null && _c !== void 0 ? _c : 0;
          let outMul = 1;
          let inMul = 1;
          let defPen = 0;
          let ignoreAll = false;
          if (this.has(attacker, 'fatigue'))
              outMul *= 0.9;
          if (this.has(attacker, 'exalt'))
              outMul *= 1.1;
          if (attackType === 'basic' && this.has(attacker, 'frenzy'))
              outMul *= 1.2;
          const weak = this.get(attacker, 'weaken');
          if (weak)
              outMul *= 1 - 0.1 * Math.min(5, (_d = weak.stacks) !== null && _d !== void 0 ? _d : 1);
          if (this.has(attacker, 'fear'))
              outMul *= 0.9;
          const cut = this.get(target, 'dmgCut');
          if (cut)
              inMul *= 1 - clamp01((_e = cut.power) !== null && _e !== void 0 ? _e : 0);
          if (this.has(target, 'stealth')) {
              inMul = 0;
              ignoreAll = true;
          }
          const pierce = this.get(attacker, 'pierce');
          if (pierce)
              defPen = Math.max(defPen, clamp01((_f = pierce.power) !== null && _f !== void 0 ? _f : 0.1));
          const context = {
              ...ctx,
              attackType,
              dtype,
              base,
              outMul,
              inMul,
              defPen,
              ignoreAll,
          };
          return context;
      },
      absorbShield(target, dmg, _ctx = {}) {
          var _a, _b;
          const shield = this.get(target, 'shield');
          if (!shield || ((_a = shield.amount) !== null && _a !== void 0 ? _a : 0) <= 0) {
              return { remain: dmg, absorbed: 0, broke: false };
          }
          const current = (_b = shield.amount) !== null && _b !== void 0 ? _b : 0;
          const absorbed = Math.min(current, dmg);
          const remain = dmg - absorbed;
          const left = current - absorbed;
          shield.amount = left;
          if (left <= 0) {
              this.remove(target, 'shield');
          }
          return { remain, absorbed, broke: left <= 0 };
      },
      afterDamage(attacker, target, result = {}) {
          var _a, _b, _c, _d, _e;
          const dealt = (_a = result.dealt) !== null && _a !== void 0 ? _a : 0;
          const reflect = this.get(target, 'reflect');
          if (reflect && dealt > 0) {
              const back = Math.round(dealt * clamp01((_b = reflect.power) !== null && _b !== void 0 ? _b : 0));
              applyDamage(attacker, back);
              hookOnLethalDamage(attacker);
              if (back > 0) {
                  gainFury(attacker, {
                      type: 'damageTaken',
                      dealt: back,
                      selfMaxHp: Number.isFinite(attacker === null || attacker === void 0 ? void 0 : attacker.hpMax) ? attacker.hpMax : undefined,
                      damageTaken: back,
                  });
                  finishFuryHit(attacker);
              }
          }
          const venom = this.get(attacker, 'venom');
          if (venom && dealt > 0) {
              const extra = Math.round(dealt * clamp01((_c = venom.power) !== null && _c !== void 0 ? _c : 0));
              applyDamage(target, extra);
              hookOnLethalDamage(target);
              if (extra > 0) {
                  gainFury(target, {
                      type: 'damageTaken',
                      dealt: extra,
                      selfMaxHp: Number.isFinite(target === null || target === void 0 ? void 0 : target.hpMax) ? target.hpMax : undefined,
                      damageTaken: extra,
                  });
                  finishFuryHit(target);
              }
          }
          if (this.has(attacker, 'execute')) {
              if (((_d = target.hp) !== null && _d !== void 0 ? _d : 0) <= Math.ceil(((_e = target.hpMax) !== null && _e !== void 0 ? _e : 0) * 0.1)) {
                  target.hp = 0;
                  const revived = hookOnLethalDamage(target);
                  if (!revived) {
                      target.alive = false;
                      if (!target.deadAt)
                          target.deadAt = safeNow();
                  }
              }
          }
          return result;
      },
      make: statusFactories,
  };
  function applyStatus(unit, status) {
      if (!unit)
          return null;
      return Statuses.add(unit, status);
  }
  function clearStatus(unit, id) {
      if (!unit)
          return;
      Statuses.remove(unit, id);
  }
  function hookOnLethalDamage(target) {
      var _a;
      const status = Statuses.get(target, 'undying');
      if (!status)
          return false;
      if (((_a = target.hp) !== null && _a !== void 0 ? _a : 0) <= 0) {
          target.hp = 1;
          Statuses.remove(target, 'undying');
          target.alive = true;
          target.deadAt = undefined;
          return true;
      }
      return false;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'Statuses')) exports.Statuses = Statuses;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyStatus')) exports.applyStatus = applyStatus;
  if (!Object.prototype.hasOwnProperty.call(exports, 'clearStatus')) exports.clearStatus = clearStatus;
  if (!Object.prototype.hasOwnProperty.call(exports, 'hookOnLethalDamage')) exports.hookOnLethalDamage = hookOnLethalDamage;
});
__define('./summon.ts', (exports, module, __require) => {
  // v0.7.3
  const __dep0 = __require('./engine.ts');
  const slotToCell = __dep0.slotToCell;
  const cellReserved = __dep0.cellReserved;
  const __dep1 = __require('./vfx.ts');
  const asSessionWithVfx = __dep1.asSessionWithVfx;
  const vfxAddSpawn = __dep1.vfxAddSpawn;
  const __dep2 = __require('./art.ts');
  const getUnitArt = __dep2.getUnitArt;
  const __dep3 = __require('./utils/kit.ts');
  const kitSupportsSummon = __dep3.kitSupportsSummon;
  const __dep4 = __require('./passives.ts');
  const prepareUnitForPassives = __dep4.prepareUnitForPassives;
  const applyOnSpawnEffects = __dep4.applyOnSpawnEffects;
  const DEFAULT_SUMMON_UNIT = {
      id: 'creep',
      name: 'Creep',
      color: '#ffd27d',
  };
  const tokensAlive = (Game) => Game.tokens.filter((t) => t.alive);
  const isRecord = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
  const isPassiveKit = (value) => {
      if (!isRecord(value))
          return false;
      const passives = value.passives;
      return passives == null || Array.isArray(passives);
  };
  const getKitDefinition = (metaEntry) => {
      if (!isRecord(metaEntry))
          return null;
      const kitCandidate = 'kit' in metaEntry ? metaEntry.kit : null;
      return isPassiveKit(kitCandidate) ? kitCandidate : null;
  };
  const isSequentialTurn = (turn) => !!turn && Array.isArray(turn.order);
  const getTurnSnapshotInfo = (turn) => {
      if (!turn)
          return { orderLength: null, cycle: 0 };
      const cycle = Number.isFinite(turn.cycle) ? turn.cycle : 0;
      if (isSequentialTurn(turn)) {
          return { orderLength: turn.order.length, cycle };
      }
      return { orderLength: null, cycle };
  };
  // en-queue các yêu cầu “Immediate” trong lúc 1 unit đang hành động
  // req: { by?:unitId, side:'ally'|'enemy', slot:1..9, unit:{...} }
  function enqueueImmediate(Game, req) {
      var _a, _b;
      if (req.by) {
          const metaEntry = typeof ((_a = Game.meta) === null || _a === void 0 ? void 0 : _a.get) === 'function' ? Game.meta.get(req.by) : null;
          const record = metaEntry && typeof metaEntry === 'object' ? metaEntry : null;
          const ok = Boolean(record
              && record['class'] === 'Summoner'
              && kitSupportsSummon(record));
          if (!ok)
              return false;
      }
      const { cx, cy } = slotToCell(req.side, req.slot);
      if (cellReserved(tokensAlive(Game), Game.queued, cx, cy))
          return false;
      const entry = {
          side: req.side,
          slot: req.slot,
          unit: (_b = req.unit) !== null && _b !== void 0 ? _b : DEFAULT_SUMMON_UNIT,
      };
      Game.actionChain.push(entry);
      return true;
  }
  // xử lý toàn bộ chain của 1 phe sau khi actor vừa hành động
  // trả về slot lớn nhất đã hành động trong chain để tiện logging
  function processActionChain(Game, side, baseSlot, hooks = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
      const list = Game.actionChain.filter((x) => x.side === side);
      if (!list.length)
          return baseSlot !== null && baseSlot !== void 0 ? baseSlot : null;
      list.sort((a, b) => a.slot - b.slot);
      let maxSlot = baseSlot !== null && baseSlot !== void 0 ? baseSlot : 0;
      for (const item of list) {
          const { cx, cy } = slotToCell(side, item.slot);
          if (cellReserved(tokensAlive(Game), Game.queued, cx, cy))
              continue;
          const extra = (_a = item.unit) !== null && _a !== void 0 ? _a : {};
          const art = getUnitArt((_b = extra.id) !== null && _b !== void 0 ? _b : 'minion');
          const newToken = {
              id: ((_c = extra.id) !== null && _c !== void 0 ? _c : 'creep'),
              name: (_d = extra.name) !== null && _d !== void 0 ? _d : 'Creep',
              color: (_f = (_e = extra.color) !== null && _e !== void 0 ? _e : art === null || art === void 0 ? void 0 : art.palette.primary) !== null && _f !== void 0 ? _f : '#ffd27d',
              cx,
              cy,
              side,
              alive: true,
              isMinion: Boolean(extra.isMinion),
              ownerIid: extra.ownerIid,
              bornSerial: extra.bornSerial,
              ttlTurns: extra.ttlTurns,
              hpMax: extra.hpMax,
              hp: extra.hp,
              atk: extra.atk,
              art,
              skinKey: (_g = art === null || art === void 0 ? void 0 : art.skinKey) !== null && _g !== void 0 ? _g : null,
              iid: extra.iid,
          };
          Game.tokens.push(newToken);
          try {
              const sessionVfx = asSessionWithVfx(Game);
              if (sessionVfx) {
                  vfxAddSpawn(sessionVfx, cx, cy, side);
              }
          }
          catch (_err) {
              // bỏ qua lỗi hiệu ứng
          }
          const spawned = (_h = Game.tokens[Game.tokens.length - 1]) !== null && _h !== void 0 ? _h : null;
          if (spawned) {
              const metaEntry = extra.id && typeof ((_j = Game.meta) === null || _j === void 0 ? void 0 : _j.get) === 'function'
                  ? Game.meta.get(extra.id)
                  : null;
              const kit = getKitDefinition(metaEntry);
              const onSpawnConfig = (kit === null || kit === void 0 ? void 0 : kit.onSpawn) && isRecord(kit.onSpawn) ? kit.onSpawn : null;
              prepareUnitForPassives(spawned);
              applyOnSpawnEffects(Game, spawned, onSpawnConfig !== null && onSpawnConfig !== void 0 ? onSpawnConfig : undefined);
              spawned.iid = (_m = (_l = (_k = hooks.allocIid) === null || _k === void 0 ? void 0 : _k.call(hooks)) !== null && _l !== void 0 ? _l : spawned.iid) !== null && _m !== void 0 ? _m : 0;
          }
          const creep = (_o = Game.tokens.find((t) => t.alive && t.side === side && t.cx === cx && t.cy === cy)) !== null && _o !== void 0 ? _o : null;
          if (creep) {
              const { orderLength, cycle } = getTurnSnapshotInfo(Game.turn);
              const turnContext = {
                  side,
                  slot: item.slot,
                  orderIndex: (_q = (_p = hooks.getTurnOrderIndex) === null || _p === void 0 ? void 0 : _p.call(hooks, Game, side, item.slot)) !== null && _q !== void 0 ? _q : -1,
                  orderLength,
                  cycle,
              };
              (_r = hooks.doActionOrSkip) === null || _r === void 0 ? void 0 : _r.call(hooks, Game, creep, { performUlt: hooks.performUlt, turnContext });
          }
          if (item.slot > maxSlot)
              maxSlot = item.slot;
      }
      Game.actionChain = Game.actionChain.filter((x) => x.side !== side);
      return maxSlot;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'enqueueImmediate')) exports.enqueueImmediate = enqueueImmediate;
  if (!Object.prototype.hasOwnProperty.call(exports, 'processActionChain')) exports.processActionChain = processActionChain;
});
__define('./turns.ts', (exports, module, __require) => {
  // v0.7.4
  const __dep0 = __require('./engine.ts');
  const slotToCell = __dep0.slotToCell;
  const slotIndex = __dep0.slotIndex;
  const __dep1 = __require('./statuses.ts');
  const Statuses = __dep1.Statuses;
  const __dep2 = __require('./combat.ts');
  const doBasicWithFollowups = __dep2.doBasicWithFollowups;
  const __dep3 = __require('./config.ts');
  const CFG = __dep3.CFG;
  const __dep4 = __require('./meta.ts');
  const makeInstanceStats = __dep4.makeInstanceStats;
  const initialRageFor = __dep4.initialRageFor;
  const __dep5 = __require('./vfx.ts');
  const vfxAddSpawn = __dep5.vfxAddSpawn;
  const vfxAddBloodPulse = __dep5.vfxAddBloodPulse;
  const asSessionWithVfx = __dep5.asSessionWithVfx;
  const __dep6 = __require('./art.ts');
  const getUnitArt = __dep6.getUnitArt;
  const __dep7 = __require('./passives.ts');
  const emitPassiveEvent = __dep7.emitPassiveEvent;
  const applyOnSpawnEffects = __dep7.applyOnSpawnEffects;
  const getPassiveLog = __dep7.getPassiveLog;
  const prepareUnitForPassives = __dep7.prepareUnitForPassives;
  const __dep8 = __require('./events.ts');
  const emitGameEvent = __dep8.emitGameEvent;
  const TURN_START = __dep8.TURN_START;
  const TURN_END = __dep8.TURN_END;
  const ACTION_START = __dep8.ACTION_START;
  const ACTION_END = __dep8.ACTION_END;
  const TURN_REGEN = __dep8.TURN_REGEN;
  const __dep9 = __require('./utils/time.ts');
  const safeNow = __dep9.safeNow;
  const __dep10 = __require('./utils/fury.ts');
  const initializeFury = __dep10.initializeFury;
  const startFuryTurn = __dep10.startFuryTurn;
  const spendFury = __dep10.spendFury;
  const resolveUltCost = __dep10.resolveUltCost;
  const setFury = __dep10.setFury;
  const clearFreshSummon = __dep10.clearFreshSummon;
  const __dep11 = __require('./turns/interleaved.ts');
  const nextTurnInterleaved = __dep11.nextTurnInterleaved;
  const toLowerSide = (side) => {
      if (side === 'ALLY')
          return 'ally';
      if (side === 'ENEMY')
          return 'enemy';
      return side;
  };
  const asSequentialTurn = (turn) => {
      if (!turn)
          return null;
      const candidate = turn;
      return Array.isArray(candidate.order) ? candidate : null;
  };
  const asInterleavedTurn = (turn) => {
      if (!turn)
          return null;
      const candidate = turn;
      return candidate.mode === 'interleaved_by_position' ? candidate : null;
  };
  const tokensAlive = (Game) => Game.tokens.filter((t) => t.alive);
  function applyTurnRegen(Game, unit) {
      if (!unit || !unit.alive)
          return { hpDelta: 0, aeDelta: 0 };
      const clampStat = (value, max) => {
          if (typeof max !== 'number' || !Number.isFinite(max)) {
              return Math.max(0, value);
          }
          const upper = Math.max(0, max);
          return Math.max(0, Math.min(upper, value));
      };
      let hpDelta = 0;
      if (Number.isFinite(unit.hp) || Number.isFinite(unit.hpMax) || Number.isFinite(unit.hpRegen)) {
          const currentHp = Number.isFinite(unit.hp) ? unit.hp : 0;
          const regenHp = Number.isFinite(unit.hpRegen) ? unit.hpRegen : 0;
          const afterHp = clampStat(currentHp + regenHp, unit.hpMax);
          hpDelta = afterHp - currentHp;
          unit.hp = afterHp;
      }
      let aeDelta = 0;
      if (Number.isFinite(unit.ae) || Number.isFinite(unit.aeMax) || Number.isFinite(unit.aeRegen)) {
          const currentAe = Number.isFinite(unit.ae) ? unit.ae : 0;
          const regenAe = Number.isFinite(unit.aeRegen) ? unit.aeRegen : 0;
          const afterAe = clampStat(currentAe + regenAe, unit.aeMax);
          aeDelta = afterAe - currentAe;
          unit.ae = afterAe;
      }
      if (hpDelta !== 0 || aeDelta !== 0) {
          emitGameEvent(TURN_REGEN, { game: Game, unit, hpDelta, aeDelta });
          if (hpDelta > 0) {
              const sessionVfx = asSessionWithVfx(Game, { requireGrid: true });
              if (sessionVfx) {
                  try {
                      vfxAddBloodPulse(sessionVfx, unit, { color: '#7ef7c1', alpha: 0.65, maxScale: 2.4 });
                  }
                  catch (_) { }
              }
          }
      }
      return { hpDelta, aeDelta };
  }
  // --- Active/Spawn helpers (từ main.js) ---
  const keyOf = (side, slot) => `${side}:${slot}`;
  function getActiveAt(Game, side, slot) {
      const { cx, cy } = slotToCell(side, slot);
      return Game.tokens.find(t => t.side === side && t.cx === cx && t.cy === cy && t.alive);
  }
  /**
   * @param {SessionState} Game
   * @param {string} side
   * @param {number} slot
   * @returns {number}
   */
  function getTurnOrderIndex(Game, side, slot) {
      const turn = Game.turn;
      if (!turn)
          return -1;
      if (!('order' in turn))
          return -1; // behavior-preserving
      const sequential = turn;
      const key = keyOf(side, slot);
      if (sequential.orderIndex instanceof Map && sequential.orderIndex.has(key)) {
          const v = sequential.orderIndex.get(key);
          return typeof v === 'number' ? v : -1;
      }
      const order = Array.isArray(sequential.order) ? sequential.order : [];
      const idx = order.findIndex(entry => entry && entry.side === side && entry.slot === slot);
      if (sequential.orderIndex instanceof Map && !sequential.orderIndex.has(key) && idx >= 0) {
          sequential.orderIndex.set(key, idx);
      }
      return idx;
  }
  function predictSpawnCycle(Game, side, slot) {
      const turn = Game.turn;
      if (!turn)
          return 0;
      const sequential = asSequentialTurn(turn);
      if (!sequential) {
          const cycle = Math.max(0, Number.isFinite(turn.cycle) ? turn.cycle : 0);
          return turn.mode === 'interleaved_by_position' ? cycle : cycle + 1;
      }
      const order = Array.isArray(sequential.order) ? sequential.order : [];
      const orderLen = order.length;
      const currentCycle = Math.max(0, Number.isFinite(sequential.cycle) ? sequential.cycle : 0);
      if (!orderLen) {
          return currentCycle + 1;
      }
      const idx = getTurnOrderIndex(Game, side, slot);
      if (idx < 0)
          return currentCycle + 1;
      const cursorRaw = Number.isFinite(sequential.cursor) ? sequential.cursor : 0;
      const cursor = Math.max(0, Math.min(orderLen - 1, cursorRaw));
      return idx >= cursor ? currentCycle : currentCycle + 1;
  }
  function spawnQueuedIfDue(Game, entry, { allocIid, performUlt } = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
      if (!entry)
          return { actor: null, spawned: false };
      const slot = entry.slot;
      const sideLower = toLowerSide(entry.side);
      const active = getActiveAt(Game, sideLower, slot);
      const queueMap = sideLower === 'ally' ? (_a = Game.queued) === null || _a === void 0 ? void 0 : _a.ally : (_b = Game.queued) === null || _b === void 0 ? void 0 : _b.enemy;
      const p = queueMap === null || queueMap === void 0 ? void 0 : queueMap.get(slot);
      if (!p) {
          return { actor: active || null, spawned: false };
      }
      if (((_c = p.spawnCycle) !== null && _c !== void 0 ? _c : 0) > ((_e = (_d = Game === null || Game === void 0 ? void 0 : Game.turn) === null || _d === void 0 ? void 0 : _d.cycle) !== null && _e !== void 0 ? _e : 0)) {
          return { actor: active || null, spawned: false };
      }
      queueMap === null || queueMap === void 0 ? void 0 : queueMap.delete(slot);
      const meta = Game.meta && typeof Game.meta.get === 'function' ? Game.meta.get(p.unitId) : null;
      const source = p.source || null;
      const fromDeck = source === 'deck';
      const kit = meta === null || meta === void 0 ? void 0 : meta.kit;
      const initialFury = initialRageFor(p.unitId, { isLeader: false, revive: !!p.revive, reviveSpec: p.revived });
      const stats = makeInstanceStats(p.unitId);
      const baseStats = {
          atk: (_f = stats.atk) !== null && _f !== void 0 ? _f : 0,
          res: (_g = stats.res) !== null && _g !== void 0 ? _g : 0,
          wil: (_h = stats.wil) !== null && _h !== void 0 ? _h : 0,
      };
      const obj = {
          id: p.unitId,
          name: (_j = p.name) !== null && _j !== void 0 ? _j : undefined,
          color: p.color || '#a9f58c',
          cx: p.cx,
          cy: p.cy,
          side: p.side,
          alive: true,
          ...stats,
          statuses: [],
          baseStats,
      };
      obj.iid = typeof allocIid === 'function' ? allocIid() : obj.iid;
      obj.art = getUnitArt(p.unitId);
      obj.skinKey = (_k = obj.art) === null || _k === void 0 ? void 0 : _k.skinKey;
      obj.color = obj.color || ((_m = (_l = obj.art) === null || _l === void 0 ? void 0 : _l.palette) === null || _m === void 0 ? void 0 : _m.primary) || '#a9f58c';
      initializeFury(obj, p.unitId, initialFury, CFG);
      if (fromDeck) {
          setFury(obj, obj.furyMax);
      }
      prepareUnitForPassives(obj);
      Game.tokens.push(obj);
      applyOnSpawnEffects(Game, obj, (_o = kit === null || kit === void 0 ? void 0 : kit.onSpawn) !== null && _o !== void 0 ? _o : undefined);
      {
          const sessionVfx = asSessionWithVfx(Game, { requireGrid: true });
          if (sessionVfx) {
              try {
                  vfxAddSpawn(sessionVfx, p.cx, p.cy, p.side);
              }
              catch (_) { }
          }
      }
      const actor = getActiveAt(Game, sideLower, slot);
      const isLeader = (actor === null || actor === void 0 ? void 0 : actor.id) === 'leaderA' || (actor === null || actor === void 0 ? void 0 : actor.id) === 'leaderB';
      const canAutoUlt = fromDeck && !isLeader && actor && actor.alive && typeof performUlt === 'function';
      if (canAutoUlt && !Statuses.blocks(actor, 'ult')) {
          let ultOk = false;
          try {
              performUlt(actor);
              ultOk = true;
          }
          catch (err) {
              console.error('[spawnQueuedIfDue.performUlt]', err);
          }
          if (ultOk) {
              clearFreshSummon(actor);
          }
      }
      return { actor: actor || null, spawned: true };
  }
  // giảm TTL minion sau khi phe đó hoàn tất lượt của mình
  /**
   * @param {SessionState} Game
   * @param {string} side
   * @returns {void}
   */
  function tickMinionTTL(Game, side) {
      const toRemove = [];
      for (const t of Game.tokens) {
          if (!t.alive)
              continue;
          if (t.side !== side)
              continue;
          if (!t.isMinion)
              continue;
          const ttl = t.ttlTurns;
          if (typeof ttl !== 'number' || !Number.isFinite(ttl))
              continue;
          const nextTtl = ttl - 1;
          t.ttlTurns = nextTtl;
          if (nextTtl <= 0)
              toRemove.push(t);
      }
      for (const t of toRemove) {
          t.alive = false;
          const idx = Game.tokens.indexOf(t);
          if (idx >= 0)
              Game.tokens.splice(idx, 1);
      }
  }
  // hành động 1 unit (ưu tiên ult nếu đủ nộ & không bị chặn)
  function doActionOrSkip(Game, unit, { performUlt, turnContext } = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const ensureBusyReset = () => {
          if (!Game.turn)
              return;
          const now = safeNow();
          if (!Number.isFinite(Game.turn.busyUntil) || Game.turn.busyUntil < now) {
              Game.turn.busyUntil = now;
          }
      };
      const slot = (_a = turnContext === null || turnContext === void 0 ? void 0 : turnContext.slot) !== null && _a !== void 0 ? _a : (unit ? slotIndex(unit.side, unit.cx, unit.cy) : null);
      const side = (_c = (_b = turnContext === null || turnContext === void 0 ? void 0 : turnContext.side) !== null && _b !== void 0 ? _b : unit === null || unit === void 0 ? void 0 : unit.side) !== null && _c !== void 0 ? _c : null;
      const orderIndex = typeof (turnContext === null || turnContext === void 0 ? void 0 : turnContext.orderIndex) === 'number' ? turnContext.orderIndex : null;
      const cycle = typeof (turnContext === null || turnContext === void 0 ? void 0 : turnContext.cycle) === 'number' ? turnContext.cycle : (_e = (_d = Game.turn) === null || _d === void 0 ? void 0 : _d.cycle) !== null && _e !== void 0 ? _e : null;
      const sequentialSnapshot = asSequentialTurn(Game.turn);
      const orderLength = typeof (turnContext === null || turnContext === void 0 ? void 0 : turnContext.orderLength) === 'number'
          ? turnContext.orderLength
          : (sequentialSnapshot ? sequentialSnapshot.order.length : null);
      const baseDetail = {
          game: Game,
          unit: unit !== null && unit !== void 0 ? unit : null,
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
      const finishAction = (extra) => {
          emitGameEvent(ACTION_END, { ...baseDetail, ...extra });
      };
      if (!unit || !unit.alive) {
          emitGameEvent(ACTION_START, baseDetail);
          ensureBusyReset();
          finishAction({ skipped: true, reason: 'missingUnit' });
          return;
      }
      const meta = Game.meta.get(unit.id);
      emitPassiveEvent(Game, unit, 'onTurnStart', { log: getPassiveLog(Game) });
      const turnStamp = `${side !== null && side !== void 0 ? side : ''}:${slot !== null && slot !== void 0 ? slot : ''}:${cycle !== null && cycle !== void 0 ? cycle : 0}`;
      startFuryTurn(unit, { turnStamp, startAmount: (_g = (_f = CFG === null || CFG === void 0 ? void 0 : CFG.fury) === null || _f === void 0 ? void 0 : _f.turn) === null || _g === void 0 ? void 0 : _g.startGain, grantStart: true });
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
      if (meta && ((_h = unit.fury) !== null && _h !== void 0 ? _h : 0) >= ultCost && !Statuses.blocks(unit, 'ult')) {
          let ultOk = false;
          try {
              performUlt(unit);
              ultOk = true;
          }
          catch (e) {
              console.error('[performUlt]', e);
              setFury(unit, 0);
          }
          if (ultOk) {
              spendFury(unit, ultCost, CFG);
              emitPassiveEvent(Game, unit, 'onUltCast', { log: getPassiveLog(Game) });
          }
          Statuses.onTurnEnd(unit, {});
          ensureBusyReset();
          finishAction({ action: 'ult', ultOk });
          return;
      }
      const cap = typeof (meta === null || meta === void 0 ? void 0 : meta.followupCap) === 'number' ? (meta.followupCap | 0) : (CFG.FOLLOWUP_CAP_DEFAULT | 0);
      doBasicWithFollowups(Game, unit, cap);
      emitPassiveEvent(Game, unit, 'onActionEnd', { log: getPassiveLog(Game) });
      Statuses.onTurnEnd(unit, {});
      ensureBusyReset();
      finishAction({ action: 'basic' });
  }
  // Bước con trỏ lượt (sparse-cursor) đúng đặc tả
  // hooks = { performUlt, processActionChain, allocIid, doActionOrSkip }
  function stepTurn(Game, hooks) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const turn = Game.turn;
      if (!turn)
          return;
      if ((_a = Game.battle) === null || _a === void 0 ? void 0 : _a.over)
          return;
      const interleavedTurn = asInterleavedTurn(turn);
      if (interleavedTurn) {
          let selection = nextTurnInterleaved(Game, interleavedTurn);
          if (!selection)
              return;
          let spawnLoopGuard = 0;
          while (selection && selection.spawnOnly) {
              spawnLoopGuard += 1;
              if (spawnLoopGuard > 12) {
                  return;
              }
              const spawnEntry = { side: selection.side, slot: selection.pos };
              const spawnResult = spawnQueuedIfDue(Game, spawnEntry, hooks);
              if (!spawnResult.spawned) {
                  return;
              }
              selection = nextTurnInterleaved(Game, interleavedTurn);
              if (!selection)
                  return;
          }
          if (!selection)
              return;
          const entry = { side: selection.side, slot: selection.pos };
          const { actor, spawned } = spawnQueuedIfDue(Game, entry, hooks);
          let active = null;
          if (actor && actor.alive) {
              active = actor;
          }
          else if (selection.unit && selection.unit.alive) {
              active = selection.unit;
          }
          else {
              active = (_b = getActiveAt(Game, entry.side, entry.slot)) !== null && _b !== void 0 ? _b : null; // behavior-preserving
          }
          if (spawned && actor && actor.alive) {
              return;
          }
          if (!active || !active.alive) {
              return;
          }
          const cycle = Number.isFinite(interleavedTurn.cycle) ? interleavedTurn.cycle : 0;
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
              (_c = hooks.doActionOrSkip) === null || _c === void 0 ? void 0 : _c.call(hooks, Game, active, { performUlt: hooks.performUlt, turnContext });
              const chainHooks = { ...hooks, getTurnOrderIndex };
              const processed = (_d = hooks.processActionChain) === null || _d === void 0 ? void 0 : _d.call(hooks, Game, entry.side, entry.slot, chainHooks);
              turnDetail.processedChain = processed !== null && processed !== void 0 ? processed : null;
          }
          finally {
              emitGameEvent(TURN_END, turnDetail);
          }
          tickMinionTTL(Game, entry.side);
          const ended = (_e = hooks.checkBattleEnd) === null || _e === void 0 ? void 0 : _e.call(hooks, Game, {
              trigger: 'interleaved',
              side: entry.side,
              slot: entry.slot,
              unit: active,
              cycle,
              timestamp: safeNow()
          });
          if (ended)
              return;
          return;
      }
      const sequentialTurn = asSequentialTurn(turn);
      if (!sequentialTurn)
          return;
      const order = Array.isArray(sequentialTurn === null || sequentialTurn === void 0 ? void 0 : sequentialTurn.order) ? sequentialTurn.order : [];
      if (!order.length)
          return;
      const orderLength = order.length;
      let cursor = Math.max(0, Math.min(orderLength - 1, Number.isFinite(sequentialTurn.cursor) ? sequentialTurn.cursor : 0));
      let cycle = Number.isFinite(sequentialTurn.cycle) ? sequentialTurn.cycle : 0;
      const advanceCursor = () => {
          const nextCursor = (cursor + 1) % orderLength;
          sequentialTurn.cursor = nextCursor;
          if (nextCursor === 0) {
              cycle += 1;
          }
          sequentialTurn.cycle = cycle;
          cursor = nextCursor;
      };
      for (let stepCount = 0; stepCount < orderLength; stepCount += 1) {
          const entry = order[cursor];
          if (!entry) {
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
          if (spawned && actor && actor.alive) {
              advanceCursor();
              return;
          }
          const active = actor && actor.alive ? actor : getActiveAt(Game, entry.side, entry.slot);
          const hasActive = !!(active && active.alive);
          if (!hasActive) {
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
              (_f = hooks.doActionOrSkip) === null || _f === void 0 ? void 0 : _f.call(hooks, Game, active, { performUlt: hooks.performUlt, turnContext });
              const chainHooks = { ...hooks, getTurnOrderIndex };
              const processed = (_g = hooks.processActionChain) === null || _g === void 0 ? void 0 : _g.call(hooks, Game, entry.side, entry.slot, chainHooks);
              turnDetail.processedChain = processed !== null && processed !== void 0 ? processed : null;
          }
          finally {
              emitGameEvent(TURN_END, turnDetail);
          }
          tickMinionTTL(Game, entry.side);
          const ended = (_h = hooks.checkBattleEnd) === null || _h === void 0 ? void 0 : _h.call(hooks, Game, {
              trigger: 'sequential',
              side: entry.side,
              slot: entry.slot,
              unit: active,
              cycle,
              timestamp: safeNow()
          });
          if (ended)
              return;
          advanceCursor();
          return;
      }
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'getActiveAt')) exports.getActiveAt = getActiveAt;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getTurnOrderIndex')) exports.getTurnOrderIndex = getTurnOrderIndex;
  if (!Object.prototype.hasOwnProperty.call(exports, 'predictSpawnCycle')) exports.predictSpawnCycle = predictSpawnCycle;
  if (!Object.prototype.hasOwnProperty.call(exports, 'spawnQueuedIfDue')) exports.spawnQueuedIfDue = spawnQueuedIfDue;
  if (!Object.prototype.hasOwnProperty.call(exports, 'tickMinionTTL')) exports.tickMinionTTL = tickMinionTTL;
  if (!Object.prototype.hasOwnProperty.call(exports, 'doActionOrSkip')) exports.doActionOrSkip = doActionOrSkip;
  if (!Object.prototype.hasOwnProperty.call(exports, 'stepTurn')) exports.stepTurn = stepTurn;
});
__define('./turns/interleaved.ts', (exports, module, __require) => {
  // v0.7.7 interleaved helpers
  const __dep0 = __require('./engine.ts');
  const slotIndex = __dep0.slotIndex;
  const __dep1 = __require('./statuses.ts');
  const Statuses = __dep1.Statuses;
  const SIDE_TO_LOWER = { ALLY: 'ally', ENEMY: 'enemy' };
  const LOWER_TO_UPPER = { ally: 'ALLY', enemy: 'ENEMY' };
  const DEFAULT_LAST_POS = { ALLY: 0, ENEMY: 0 };
  const DEFAULT_WRAP_COUNT = { ALLY: 0, ENEMY: 0 };
  const SLOT_CAP = 9;
  function normalizeSide(side) {
      if (side === 'ENEMY')
          return 'ENEMY';
      if (side === 'ALLY')
          return 'ALLY';
      return LOWER_TO_UPPER[side] || 'ALLY';
  }
  function resolveSlotCount(turn) {
      var _a;
      const raw = Number.isFinite(turn === null || turn === void 0 ? void 0 : turn.slotCount) ? (_a = turn === null || turn === void 0 ? void 0 : turn.slotCount) !== null && _a !== void 0 ? _a : null : null;
      if (Number.isFinite(raw) && (raw !== null && raw !== void 0 ? raw : 0) > 0) {
          return Math.max(1, Math.min(SLOT_CAP, Math.floor(raw !== null && raw !== void 0 ? raw : SLOT_CAP)));
      }
      return SLOT_CAP;
  }
  function ensureTurnState(turn) {
      if (!turn.lastPos || typeof turn.lastPos !== 'object') {
          turn.lastPos = { ...DEFAULT_LAST_POS };
      }
      else {
          turn.lastPos.ALLY = Number.isFinite(turn.lastPos.ALLY) ? turn.lastPos.ALLY : 0;
          turn.lastPos.ENEMY = Number.isFinite(turn.lastPos.ENEMY) ? turn.lastPos.ENEMY : 0;
      }
      if (!turn.wrapCount || typeof turn.wrapCount !== 'object') {
          turn.wrapCount = { ...DEFAULT_WRAP_COUNT };
      }
      else {
          turn.wrapCount.ALLY = Number.isFinite(turn.wrapCount.ALLY) ? turn.wrapCount.ALLY : 0;
          turn.wrapCount.ENEMY = Number.isFinite(turn.wrapCount.ENEMY) ? turn.wrapCount.ENEMY : 0;
      }
      if (!Number.isFinite(turn.turnCount)) {
          turn.turnCount = 0;
      }
  }
  function buildSlotMap(tokens, sideLower) {
      const map = new Map();
      if (!Array.isArray(tokens))
          return map;
      for (const unit of tokens) {
          if (!unit || !unit.alive)
              continue;
          if (unit.side !== sideLower)
              continue;
          const slot = slotIndex(sideLower, unit.cx, unit.cy);
          if (!Number.isFinite(slot))
              continue;
          if (!map.has(slot)) {
              map.set(slot, unit);
          }
      }
      return map;
  }
  function isQueueDue(state, sideLower, slot, cycle) {
      var _a, _b, _c;
      const queued = sideLower === 'ally' ? (_a = state.queued) === null || _a === void 0 ? void 0 : _a.ally : (_b = state.queued) === null || _b === void 0 ? void 0 : _b.enemy;
      if (!queued)
          return false;
      const entry = queued.get(slot);
      if (!entry)
          return false;
      return ((_c = entry.spawnCycle) !== null && _c !== void 0 ? _c : 0) <= cycle;
  }
  function makeWrappedFlag(start, pos) {
      if (!Number.isFinite(start) || start <= 0)
          return false;
      return pos <= start;
  }
  function findNextOccupiedPos(state, side, startPos = 0) {
      var _a, _b, _c;
      const turn = (_a = state.turn) !== null && _a !== void 0 ? _a : null;
      const sideKey = normalizeSide(side);
      const sideLower = SIDE_TO_LOWER[sideKey];
      if (!sideLower)
          return null;
      const slotCount = resolveSlotCount(turn);
      const start = Number.isFinite(startPos) ? Math.max(0, Math.min(slotCount, Math.floor(startPos))) : 0;
      const unitsBySlot = buildSlotMap(state.tokens, sideLower);
      const cycle = Number.isFinite(turn === null || turn === void 0 ? void 0 : turn.cycle) ? turn.cycle : 0;
      for (let offset = 1; offset <= slotCount; offset += 1) {
          const pos = ((start + offset - 1) % slotCount) + 1;
          const wrapped = makeWrappedFlag(start, pos);
          const unit = (_b = unitsBySlot.get(pos)) !== null && _b !== void 0 ? _b : null;
          const queued = isQueueDue(state, sideLower, pos, cycle);
          if (unit && unit.alive && Statuses.canAct(unit)) {
              return {
                  mode: 'interleaved_by_position',
                  side: sideLower,
                  pos,
                  unit,
                  unitId: (_c = unit.id) !== null && _c !== void 0 ? _c : null,
                  queued,
                  wrapped,
                  sideKey,
                  spawnOnly: false
              };
          }
          if (queued) {
              return {
                  mode: 'interleaved_by_position',
                  side: sideLower,
                  pos,
                  unit: null,
                  unitId: null,
                  queued: true,
                  wrapped,
                  sideKey,
                  spawnOnly: true
              };
          }
      }
      return null;
  }
  function nextTurnInterleaved(state, turn = state.turn) {
      var _a, _b;
      if (!state || !turn)
          return null;
      ensureTurnState(turn);
      const slotCount = resolveSlotCount(turn);
      if (slotCount <= 0)
          return null;
      const pickSide = (sideKey) => {
          var _a, _b;
          const last = Number.isFinite((_a = turn.lastPos) === null || _a === void 0 ? void 0 : _a[sideKey]) ? turn.lastPos[sideKey] : 0;
          const found = findNextOccupiedPos(state, sideKey, last);
          if (!found)
              return null;
          if (!found.spawnOnly) {
              turn.lastPos[sideKey] = found.pos;
              if (found.wrapped) {
                  turn.wrapCount[sideKey] = ((_b = turn.wrapCount[sideKey]) !== null && _b !== void 0 ? _b : 0) + 1;
              }
          }
          return found;
      };
      const primarySide = normalizeSide(turn.nextSide);
      const fallbackSide = primarySide === 'ALLY' ? 'ENEMY' : 'ALLY';
      let selection = pickSide(primarySide);
      if (!selection) {
          selection = pickSide(fallbackSide);
          if (!selection) {
              turn.nextSide = fallbackSide;
              return null;
          }
      }
      if (selection.spawnOnly) {
          return selection;
      }
      turn.nextSide = selection.sideKey === 'ALLY' ? 'ENEMY' : 'ALLY';
      turn.turnCount += 1;
      const allyWrap = (_a = turn.wrapCount.ALLY) !== null && _a !== void 0 ? _a : 0;
      const enemyWrap = (_b = turn.wrapCount.ENEMY) !== null && _b !== void 0 ? _b : 0;
      const maxWrap = Math.max(allyWrap, enemyWrap);
      if (!Number.isFinite(turn.cycle) || turn.cycle < maxWrap) {
          turn.cycle = maxWrap;
      }
      return selection;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'findNextOccupiedPos')) exports.findNextOccupiedPos = findNextOccupiedPos;
  if (!Object.prototype.hasOwnProperty.call(exports, 'nextTurnInterleaved')) exports.nextTurnInterleaved = nextTurnInterleaved;
});
__define('./types/art.ts', (exports, module, __require) => {


});
__define('./types/combat.ts', (exports, module, __require) => {


});
__define('./types/common.ts', (exports, module, __require) => {


});
__define('./types/config.ts', (exports, module, __require) => {


});
__define('./types/currency.ts', (exports, module, __require) => {
  const isCurrencyEntry = (value) => (value != null
      && typeof value === 'object'
      && !Array.isArray(value));
  const isLineupCurrencyValue = (value) => (value == null
      || typeof value === 'number'
      || typeof value === 'string'
      || isCurrencyEntry(value));
  const isLineupCurrencyConfig = (value) => (value != null
      && typeof value === 'object'
      && !Array.isArray(value));
  const isLineupCurrencies = (value) => {
      if (Array.isArray(value)) {
          return value.every(isLineupCurrencyValue);
      }
      return isLineupCurrencyConfig(value);
  };
  const normalizeCurrencyBalances = (playerState) => {
      if (!playerState || typeof playerState !== 'object') {
          return null;
      }
      if (!('currencies' in playerState)) {
          return null;
      }
      const { currencies } = playerState;
      return isLineupCurrencies(currencies) ? (currencies !== null && currencies !== void 0 ? currencies : null) : null;
  };

  if (!Object.prototype.hasOwnProperty.call(exports, 'isCurrencyEntry')) exports.isCurrencyEntry = isCurrencyEntry;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isLineupCurrencyConfig')) exports.isLineupCurrencyConfig = isLineupCurrencyConfig;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isLineupCurrencies')) exports.isLineupCurrencies = isLineupCurrencies;
  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeCurrencyBalances')) exports.normalizeCurrencyBalances = normalizeCurrencyBalances;
});
__define('./types/index.ts', (exports, module, __require) => {


});
__define('./types/lineup.ts', (exports, module, __require) => {


});
__define('./types/pve.ts', (exports, module, __require) => {


});
__define('./types/rng.ts', (exports, module, __require) => {


});
__define('./types/telemetry.ts', (exports, module, __require) => {


});
__define('./types/turn-order.ts', (exports, module, __require) => {


});
__define('./types/ui.ts', (exports, module, __require) => {


});
__define('./types/units.ts', (exports, module, __require) => {
  function createSummonQueue() {
      return new Map();
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'createSummonQueue')) exports.createSummonQueue = createSummonQueue;
});
__define('./types/utils.ts', (exports, module, __require) => {


});
__define('./types/vfx.ts', (exports, module, __require) => {


});
__define('./ui.ts', (exports, module, __require) => {
  // v0.7.1
  const __dep0 = __require('./config.ts');
  const CFG = __dep0.CFG;
  const __dep1 = __require('./events.ts');
  const ACTION_END = __dep1.ACTION_END;
  const TURN_END = __dep1.TURN_END;
  const TURN_START = __dep1.TURN_START;
  const addGameEventListener = __dep1.addGameEventListener;
  const gameEvents = __dep1.gameEvents;
  const __dep2 = __require('./ui/dom.ts');
  const assertElement = __dep2.assertElement;
  function canQuery(node) {
      return !!node && typeof node.querySelector === 'function';
  }
  function initHUD(doc, root) {
      const queryFromRoot = (id) => {
          if (canQuery(root)) {
              const el = root.querySelector(`#${id}`);
              if (el)
                  return el;
          }
          return null;
      };
      const costNow = queryFromRoot('costNow') || doc.getElementById('costNow');
      const costRing = queryFromRoot('costRing') || doc.getElementById('costRing');
      const costChip = queryFromRoot('costChip') || doc.getElementById('costChip');
      const update = (Game) => {
          var _a, _b, _c;
          if (!Game)
              return;
          const capRaw = (_b = (_a = Game.costCap) !== null && _a !== void 0 ? _a : CFG.COST_CAP) !== null && _b !== void 0 ? _b : 30;
          const cap = Number.isFinite(capRaw) && capRaw > 0 ? capRaw : 1;
          const now = Math.max(0, Math.floor((_c = Game.cost) !== null && _c !== void 0 ? _c : 0));
          const ratio = Math.max(0, Math.min(1, now / cap));
          if (costNow)
              costNow.textContent = String(now);
          if (costRing) {
              const deg = `${(ratio * 360).toFixed(1)}deg`;
              costRing.style.setProperty('--deg', deg);
          }
          if (costChip) {
              costChip.classList.toggle('full', now >= cap);
          }
      };
      const handleGameEvent = (event) => {
          var _a;
          const detail = event.detail;
          const state = (_a = detail === null || detail === void 0 ? void 0 : detail.game) !== null && _a !== void 0 ? _a : null;
          if (state)
              update(state);
      };
      let cleanedUp = false;
      const disposers = [];
      const cleanup = () => {
          if (cleanedUp)
              return;
          cleanedUp = true;
          while (disposers.length > 0) {
              const dispose = disposers.pop();
              if (dispose) {
                  dispose();
              }
          }
      };
      if (gameEvents) {
          const types = [TURN_START, TURN_END, ACTION_END];
          for (const type of types) {
              disposers.push(addGameEventListener(type, handleGameEvent));
          }
      }
      return { update, cleanup };
  }
  function debounce(fn, wait) {
      let timer = null;
      const debounced = (...args) => {
          if (timer) {
              clearTimeout(timer);
          }
          timer = setTimeout(() => {
              timer = null;
              fn(...args);
          }, wait);
      };
      debounced.cancel = () => {
          if (timer) {
              clearTimeout(timer);
              timer = null;
          }
      };
      debounced.flush = (...args) => {
          if (timer) {
              clearTimeout(timer);
              timer = null;
          }
          fn(...args);
      };
      return debounced;
  }
  function startSummonBar(doc, options, root) {
      var _a, _b, _c, _d;
      const { onPick = () => { }, canAfford = () => true, getDeck = () => [], getSelectedId = () => null, } = options !== null && options !== void 0 ? options : {};
      const queryFromRoot = (selector, id) => {
          if (canQuery(root)) {
              const el = root.querySelector(selector);
              if (el)
                  return el;
          }
          if (id && typeof doc.getElementById === 'function') {
              return doc.getElementById(id);
          }
          return null;
      };
      const hostElement = queryFromRoot('#cards', 'cards');
      if (!hostElement) {
          return { render: () => { }, cleanup: () => { } };
      }
      const host = assertElement(hostElement, {
          guard: (node) => node instanceof HTMLElement,
          message: 'Summon bar cần một phần tử host hợp lệ.',
      });
      const btns = [];
      const cleanupFns = [];
      let cleanedUp = false;
      const cleanup = () => {
          if (cleanedUp)
              return;
          cleanedUp = true;
          while (cleanupFns.length > 0) {
              const dispose = cleanupFns.pop();
              try {
                  dispose === null || dispose === void 0 ? void 0 : dispose();
              }
              catch { }
          }
      };
      host.innerHTML = '';
      cleanupFns.push(() => {
          btns.length = 0;
          host.innerHTML = '';
      });
      const handleHostClick = (event) => {
          const target = event.target instanceof Element
              ? event.target
              : event.currentTarget instanceof Element
                  ? event.currentTarget
                  : null;
          const btn = target ? target.closest('button.card') : null;
          if (!btn || btn.disabled || !host.contains(btn))
              return;
          const deck = getDeck();
          const targetId = btn.dataset.id;
          if (!targetId)
              return;
          const card = deck.find((c) => c.id === targetId);
          if (!card || !canAfford(card))
              return;
          onPick(card);
          Array.from(host.children).forEach((node) => {
              if (node instanceof HTMLElement) {
                  node.classList.toggle('active', node === btn);
              }
          });
      };
      host.addEventListener('click', handleHostClick);
      cleanupFns.push(() => host.removeEventListener('click', handleHostClick));
      const gap = (_b = (_a = CFG.UI) === null || _a === void 0 ? void 0 : _a.CARD_GAP) !== null && _b !== void 0 ? _b : 12;
      const minSize = (_d = (_c = CFG.UI) === null || _c === void 0 ? void 0 : _c.CARD_MIN) !== null && _d !== void 0 ? _d : 40;
      const boardEl = queryFromRoot('#board', 'board');
      const syncCardSize = debounce(() => {
          if (!boardEl)
              return;
          const rect = boardEl.getBoundingClientRect();
          const width = boardEl.clientWidth || rect.width || 0;
          const cell = Math.max(minSize, Math.floor((width - gap * 6) / 7));
          host.style.setProperty('--cell', `${cell}px`);
      }, 120);
      syncCardSize.flush();
      let cleanupResize = () => { };
      if (boardEl && typeof ResizeObserver === 'function') {
          const observer = new ResizeObserver(() => syncCardSize());
          observer.observe(boardEl);
          cleanupResize = () => {
              observer.disconnect();
              syncCardSize.cancel();
          };
      }
      else {
          const handleResize = () => syncCardSize();
          if (typeof window !== 'undefined') {
              window.addEventListener('resize', handleResize);
              cleanupResize = () => {
                  if (typeof window !== 'undefined') {
                      window.removeEventListener('resize', handleResize);
                  }
                  syncCardSize.cancel();
              };
          }
          else {
              cleanupResize = () => {
                  syncCardSize.cancel();
              };
          }
      }
      cleanupFns.push(() => cleanupResize());
      let removalObserver = null;
      if (host && typeof MutationObserver === 'function') {
          const targetRoot = doc.body || doc.documentElement;
          const observerTarget = targetRoot
              ? assertElement(targetRoot, 'Cần một phần tử gốc để quan sát trạng thái kết nối.')
              : null;
          if (observerTarget) {
              removalObserver = new MutationObserver(() => {
                  if (!host.isConnected) {
                      cleanup();
                  }
              });
              removalObserver.observe(observerTarget, { childList: true, subtree: true });
          }
      }
      if (removalObserver) {
          cleanupFns.push(() => {
              removalObserver === null || removalObserver === void 0 ? void 0 : removalObserver.disconnect();
              removalObserver = null;
          });
      }
      const resolveCardCost = (card) => {
          if (!card)
              return 0;
          const raw = card.cost;
          if (typeof raw === 'number' && Number.isFinite(raw))
              return raw;
          if (typeof raw === 'string') {
              const parsed = Number(raw);
              return Number.isFinite(parsed) ? parsed : 0;
          }
          return 0;
      };
      const makeBtn = (card) => {
          const btn = doc.createElement('button');
          btn.className = 'card';
          btn.dataset.id = card.id;
          btn.innerHTML = `<span class="cost">${resolveCardCost(card)}</span>`;
          const affordable = canAfford(card);
          btn.disabled = !affordable;
          btn.classList.toggle('disabled', !affordable);
          return btn;
      };
      const render = () => {
          const deck = getDeck();
          for (const [index, card] of deck.entries()) {
              if (!btns[index] && card) {
                  const btn = makeBtn(card);
                  host.appendChild(btn);
                  btns[index] = btn;
              }
              const button = btns[index];
              if (!button)
                  break;
              if (!card) {
                  button.hidden = true;
                  button.dataset.id = '';
                  button.disabled = true;
                  button.classList.remove('active');
                  continue;
              }
              button.hidden = false;
              button.dataset.id = card.id;
              const span = button.querySelector('.cost');
              if (span)
                  span.textContent = String(resolveCardCost(card));
              const affordable = canAfford(card);
              button.disabled = !affordable;
              button.classList.toggle('disabled', !affordable);
              button.style.opacity = '';
              button.classList.toggle('active', getSelectedId() === card.id);
          }
          const previousLength = btns.length;
          if (previousLength > deck.length) {
              for (let i = deck.length; i < previousLength; i += 1) {
                  const button = btns[i];
                  if (!button)
                      continue;
                  button.hidden = true;
                  button.dataset.id = '';
                  button.disabled = true;
                  button.classList.remove('active');
                  button.remove();
              }
              btns.length = deck.length;
          }
      };
      if (gameEvents) {
          const rerender = () => render();
          const types = [TURN_START, TURN_END, ACTION_END];
          for (const type of types) {
              const dispose = addGameEventListener(type, () => rerender());
              if (typeof dispose === 'function') {
                  cleanupFns.push(() => dispose());
              }
          }
      }
      return { render, cleanup };
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'initHUD')) exports.initHUD = initHUD;
  if (!Object.prototype.hasOwnProperty.call(exports, 'startSummonBar')) exports.startSummonBar = startSummonBar;
});
__define('./ui/dom.ts', (exports, module, __require) => {
  const DEFAULT_ASSERT_MESSAGE = 'Cần một phần tử DOM hợp lệ.';
  function assertElement(value, options) {
      var _a;
      const message = typeof options === 'string'
          ? options
          : (_a = options === null || options === void 0 ? void 0 : options.message) !== null && _a !== void 0 ? _a : DEFAULT_ASSERT_MESSAGE;
      const guard = typeof options === 'object' && options ? options.guard : undefined;
      const ElementConstructor = typeof Element === 'undefined' ? undefined : Element;
      if (!ElementConstructor || !(value instanceof ElementConstructor)) {
          throw new Error(message);
      }
      if (guard && !guard(value)) {
          throw new Error(message);
      }
      return value;
  }
  function ensureStyleTag(id, options = {}) {
      var _a, _b, _c, _d, _e;
      const doc = (_a = options.doc) !== null && _a !== void 0 ? _a : (typeof document !== 'undefined' ? document : null);
      if (!doc) {
          return null;
      }
      const appendTarget = (_e = (_d = (_c = (_b = options.target) !== null && _b !== void 0 ? _b : doc.head) !== null && _c !== void 0 ? _c : doc.documentElement) !== null && _d !== void 0 ? _d : doc.body) !== null && _e !== void 0 ? _e : null;
      let style = doc.getElementById(id);
      if (!(style instanceof HTMLStyleElement)) {
          style = doc.createElement('style');
          style.id = id;
          if (appendTarget) {
              appendTarget.appendChild(style);
          }
          else {
              doc.appendChild(style);
          }
      }
      const css = options.css;
      if (typeof css === 'string' && style.textContent !== css) {
          style.textContent = css;
      }
      return style;
  }
  function normalizeClasses(input) {
      if (!input) {
          return [];
      }
      return (Array.isArray(input) ? input : [input]).filter((item) => { var _a, _b; return Boolean((_b = (_a = item === null || item === void 0 ? void 0 : item.trim) === null || _a === void 0 ? void 0 : _a.call(item)) !== null && _b !== void 0 ? _b : item); });
  }
  function mountSection(options) {
      const { root, section, replaceChildren = true, rootClasses, removeRootClasses, onDestroy = null, assertMessage, } = options;
      const host = assertElement(root, assertMessage !== null && assertMessage !== void 0 ? assertMessage : 'Cần một phần tử root hợp lệ.');
      const classesToAdd = normalizeClasses(rootClasses);
      const classesToRemove = normalizeClasses(removeRootClasses);
      const removedRootClasses = [];
      if (replaceChildren) {
          if ('replaceChildren' in host && typeof host.replaceChildren === 'function') {
              host.replaceChildren();
          }
          else {
              while (host.firstChild) {
                  host.removeChild(host.firstChild);
              }
          }
      }
      if (classesToRemove.length > 0 && host.classList) {
          const seen = new Set();
          classesToRemove.forEach(cls => {
              if (seen.has(cls)) {
                  return;
              }
              seen.add(cls);
              if (host.classList.contains(cls)) {
                  removedRootClasses.push(cls);
              }
              host.classList.remove(cls);
          });
      }
      if (classesToAdd.length > 0 && host.classList) {
          classesToAdd.forEach(cls => host.classList.add(cls));
      }
      host.appendChild(section);
      return {
          root: host,
          section,
          destroy() {
              if (section.parentNode === host) {
                  host.removeChild(section);
              }
              if (classesToAdd.length > 0 && host.classList) {
                  classesToAdd.forEach(cls => host.classList.remove(cls));
              }
              if (removedRootClasses.length > 0 && host.classList) {
                  removedRootClasses.forEach(cls => host.classList.add(cls));
              }
              if (typeof onDestroy === 'function') {
                  onDestroy();
              }
          }
      };
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'assertElement')) exports.assertElement = assertElement;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ensureStyleTag')) exports.ensureStyleTag = ensureStyleTag;
  if (!Object.prototype.hasOwnProperty.call(exports, 'mountSection')) exports.mountSection = mountSection;
});
__define('./units.ts', (exports, module, __require) => {
  const UNIT_LIST = [
      { id: 'phe', name: 'Phệ', cost: 20 },
      { id: 'kiemtruongda', name: 'Kiếm Trường Dạ', cost: 16 },
      { id: 'loithienanh', name: 'Lôi Thiên Ảnh', cost: 18 },
      { id: 'laky', name: 'La Kỳ', cost: 14 },
      { id: 'kydieu', name: 'Kỳ Diêu', cost: 12 },
      { id: 'doanminh', name: 'Doãn Minh', cost: 12 },
      { id: 'tranquat', name: 'Trần Quát', cost: 10 },
      { id: 'linhgac', name: 'Lính Gác', cost: 8 },
  ];
  const UNITS = UNIT_LIST;
  const UNIT_INDEX_INTERNAL = new Map(UNIT_LIST.map((unit) => [unit.id, unit]));
  const UNIT_INDEX = UNIT_INDEX_INTERNAL;
  function lookupUnit(unitId) {
      const unit = UNIT_INDEX_INTERNAL.get(unitId);
      return unit ? { ...unit } : null;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'UNITS')) exports.UNITS = UNITS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'UNIT_INDEX')) exports.UNIT_INDEX = UNIT_INDEX;
  if (!Object.prototype.hasOwnProperty.call(exports, 'lookupUnit')) exports.lookupUnit = lookupUnit;
});
__define('./utils/assert.ts', (exports, module, __require) => {
  function assertDefined(value, message) {
      if (value === undefined || value === null) {
          throw new Error(message !== null && message !== void 0 ? message : 'Giá trị mong đợi phải được định nghĩa.');
      }
      return value;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'assertDefined')) exports.assertDefined = assertDefined;
});
__define('./utils/dummy.ts', (exports, module, __require) => {
  function ensureNestedModuleSupport() {
      return true;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'ensureNestedModuleSupport')) exports.ensureNestedModuleSupport = ensureNestedModuleSupport;
});
__define('./utils/format.ts', (exports, module, __require) => {
  const HAS_INTL_NUMBER_FORMAT = typeof Intl === 'object' && typeof Intl.NumberFormat === 'function';
  function createNumberFormatter(locale, options) {
      if (HAS_INTL_NUMBER_FORMAT) {
          return new Intl.NumberFormat(locale, options);
      }
      const hasLocaleString = typeof Number.prototype.toLocaleString === 'function';
      return {
          format(value) {
              if (typeof value === 'number') {
                  if (hasLocaleString) {
                      try {
                          return value.toLocaleString();
                      }
                      catch (error) {
                          return String(value);
                      }
                  }
                  return String(value);
              }
              if (value == null) {
                  return '';
              }
              if (hasLocaleString && typeof (value === null || value === void 0 ? void 0 : value.toLocaleString) === 'function') {
                  try {
                      return value.toLocaleString();
                  }
                  catch (error) {
                      return String(value);
                  }
              }
              return String(value);
          }
      };
  }
  exports.HAS_INTL_NUMBER_FORMAT = HAS_INTL_NUMBER_FORMAT;

  if (!Object.prototype.hasOwnProperty.call(exports, 'createNumberFormatter')) exports.createNumberFormatter = createNumberFormatter;
});
__define('./utils/fury.ts', (exports, module, __require) => {
  const __dep0 = __require('./config.ts');
  const CFG = __dep0.CFG;
  const __dep1 = __require('./utils/time.ts');
  const safeNow = __dep1.safeNow;
  const DEFAULT_TURN_CAP = 40;
  const DEFAULT_SKILL_CAP = 30;
  const DEFAULT_HIT_CAP = 20;
  const TURN_GRANT_KEY = Symbol('turn');
  const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
  function toNumber(value) {
      const num = Number(value);
      return Number.isFinite(num) ? num : 0;
  }
  function ensureAlias(unit) {
      if (!unit)
          return;
      const internal = unit;
      const rageValue = toNumber(internal.rage);
      if (!isFiniteNumber(internal.fury) && Number.isFinite(rageValue)) {
          internal.fury = rageValue;
      }
      if (!isFiniteNumber(internal.fury))
          internal.fury = 0;
      try {
          const desc = Object.getOwnPropertyDescriptor(internal, 'rage');
          if (!desc || (!desc.get && !desc.set)) {
              Object.defineProperty(internal, 'rage', {
                  configurable: true,
                  enumerable: true,
                  get() { return toNumber(internal.fury); },
                  set(v) { internal.fury = toNumber(v); }
              });
          }
          else {
              internal.rage = toNumber(internal.fury);
          }
      }
      catch (_) {
          internal.rage = toNumber(internal.fury);
      }
  }
  function ensureState(unit) {
      var _a;
      if (!unit)
          return null;
      ensureAlias(unit);
      const internal = unit;
      if (!internal._furyState) {
          internal._furyState = {
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
      return (_a = internal._furyState) !== null && _a !== void 0 ? _a : null;
  }
  function resolveMaxFury(unitId, cfg = CFG) {
      var _a, _b;
      const furyCfg = ((_a = cfg === null || cfg === void 0 ? void 0 : cfg.fury) !== null && _a !== void 0 ? _a : {});
      const special = (_b = furyCfg.specialMax) !== null && _b !== void 0 ? _b : {};
      const entry = unitId ? special[unitId] : null;
      if (isFiniteNumber(entry))
          return entry;
      if (entry && typeof entry === 'object') {
          const entryObj = entry;
          if (isFiniteNumber(entryObj.max))
              return Math.floor(entryObj.max);
          if (isFiniteNumber(entryObj.value))
              return Math.floor(entryObj.value);
      }
      if (isFiniteNumber(furyCfg.max))
          return Math.floor(furyCfg.max);
      const baseMaxValue = furyCfg.baseMax;
      if (isFiniteNumber(baseMaxValue)) {
          return Math.floor(Number(baseMaxValue));
      }
      return 100;
  }
  function resolveUltCost(unit, cfg = CFG) {
      var _a, _b;
      if (!unit)
          return resolveMaxFury(null, cfg);
      const furyCfg = ((_a = cfg === null || cfg === void 0 ? void 0 : cfg.fury) !== null && _a !== void 0 ? _a : {});
      const special = (_b = furyCfg.specialMax) !== null && _b !== void 0 ? _b : {};
      const entry = special[unit.id];
      if (entry && typeof entry === 'object') {
          const entryObj = entry;
          if (isFiniteNumber(entryObj.ultCost))
              return Math.floor(entryObj.ultCost);
      }
      if (isFiniteNumber(furyCfg.ultCost))
          return Math.floor(furyCfg.ultCost);
      return isFiniteNumber(unit.furyMax) ? Math.floor(unit.furyMax) : resolveMaxFury(unit.id, cfg);
  }
  function initializeFury(unit, unitId, initial = 0, cfg = CFG) {
      if (!unit)
          return;
      const max = resolveMaxFury(unitId, cfg);
      unit.furyMax = isFiniteNumber(max) && max > 0 ? Math.max(1, Math.floor(max)) : 100;
      ensureAlias(unit);
      setFury(unit, initial);
      const state = ensureState(unit);
      if (state) {
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
  function markFreshSummon(unit, flag = true) {
      const state = ensureState(unit);
      if (state) {
          state.freshSummon = !!flag;
          state.lastStart = safeNow();
      }
  }
  function clearFreshSummon(unit) {
      const state = ensureState(unit);
      if (state) {
          state.freshSummon = false;
      }
  }
  function setFury(unit, value) {
      if (!unit)
          return 0;
      ensureAlias(unit);
      const max = isFiniteNumber(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, CFG);
      const amount = Math.max(0, Math.min(max, Math.floor(toNumber(value))));
      unit.fury = amount;
      unit.rage = amount;
      return amount;
  }
  function resolveTurnCap(cfg) {
      var _a;
      const furyCfg = ((_a = cfg === null || cfg === void 0 ? void 0 : cfg.fury) !== null && _a !== void 0 ? _a : {});
      if (isFiniteNumber(furyCfg.turnCap))
          return Math.floor(furyCfg.turnCap);
      const caps = furyCfg.caps;
      if (caps && isFiniteNumber(caps.perTurn))
          return Math.floor(caps.perTurn);
      const turn = furyCfg.turn;
      if (turn && isFiniteNumber(turn.cap))
          return Math.floor(turn.cap);
      return DEFAULT_TURN_CAP;
  }
  function resolveSkillCap(cfg) {
      var _a;
      const furyCfg = ((_a = cfg === null || cfg === void 0 ? void 0 : cfg.fury) !== null && _a !== void 0 ? _a : {});
      if (isFiniteNumber(furyCfg.skillCap))
          return Math.floor(furyCfg.skillCap);
      const caps = furyCfg.caps;
      if (caps && isFiniteNumber(caps.perSkill))
          return Math.floor(caps.perSkill);
      const skill = furyCfg.skill;
      if (skill && isFiniteNumber(skill.cap))
          return Math.floor(skill.cap);
      return DEFAULT_SKILL_CAP;
  }
  function resolveHitCap(cfg) {
      var _a;
      const furyCfg = ((_a = cfg === null || cfg === void 0 ? void 0 : cfg.fury) !== null && _a !== void 0 ? _a : {});
      if (isFiniteNumber(furyCfg.hitCap))
          return Math.floor(furyCfg.hitCap);
      const caps = furyCfg.caps;
      if (caps && isFiniteNumber(caps.perHit))
          return Math.floor(caps.perHit);
      const hit = furyCfg.hit;
      if (hit && isFiniteNumber(hit.cap))
          return Math.floor(hit.cap);
      return DEFAULT_HIT_CAP;
  }
  function resolveGainAmount(spec = {}, cfg = CFG, state = null) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j;
      if (isFiniteNumber(spec.amount)) {
          return { amount: Math.floor(spec.amount), perTarget: 0 };
      }
      const furyCfg = ((_a = cfg === null || cfg === void 0 ? void 0 : cfg.fury) !== null && _a !== void 0 ? _a : {});
      const table = (_b = furyCfg.gain) !== null && _b !== void 0 ? _b : {};
      const type = (_c = spec.type) !== null && _c !== void 0 ? _c : 'generic';
      if (type === 'turnStart') {
          const turnStart = table.turnStart;
          const amount = isFiniteNumber(turnStart === null || turnStart === void 0 ? void 0 : turnStart.amount)
              ? turnStart.amount
              : (() => {
                  const turn = furyCfg.turn;
                  if (turn && isFiniteNumber(turn.startGain))
                      return turn.startGain;
                  const fallback = furyCfg.startGain;
                  if (isFiniteNumber(fallback))
                      return Number(fallback);
                  return 0;
              })();
          return { amount: Math.floor(Math.max(0, amount !== null && amount !== void 0 ? amount : 0)), perTarget: 0 };
      }
      if (type === 'damageTaken') {
          const mode = (_d = table.damageTaken) !== null && _d !== void 0 ? _d : {};
          let total = isFiniteNumber(spec.base)
              ? spec.base
              : isFiniteNumber(mode.base)
                  ? Number(mode.base)
                  : 0;
          const ratio = isFiniteNumber(mode.selfRatio) ? Number(mode.selfRatio) : 0;
          const taken = isFiniteNumber(spec.damageTaken)
              ? spec.damageTaken
              : isFiniteNumber(spec.dealt)
                  ? spec.dealt
                  : undefined;
          if (ratio && isFiniteNumber(taken) && isFiniteNumber(spec.selfMaxHp) && spec.selfMaxHp > 0) {
              total += Math.round((ratio * Math.max(0, taken !== null && taken !== void 0 ? taken : 0)) / spec.selfMaxHp);
          }
          if (isFiniteNumber(mode.min))
              total = Math.max(Number(mode.min), total);
          if (isFiniteNumber(mode.max))
              total = Math.min(Number(mode.max), total);
          if (isFiniteNumber(spec.bonus))
              total += spec.bonus;
          if (isFiniteNumber(spec.multiplier))
              total *= spec.multiplier;
          return { amount: Math.floor(Math.max(0, total)), perTarget: 0 };
      }
      const isAoE = !!spec.isAoE || (isFiniteNumber(spec.targetsHit) && ((_e = spec.targetsHit) !== null && _e !== void 0 ? _e : 0) > 1);
      const mode = (_f = (isAoE
          ? table.dealAoePerTarget
          : table.dealSingle)) !== null && _f !== void 0 ? _f : {};
      let total = isFiniteNumber(spec.base)
          ? spec.base
          : isFiniteNumber(mode.base)
              ? Number(mode.base)
              : 0;
      if (spec.isCrit && isFiniteNumber(mode.crit))
          total += Number(mode.crit);
      if (spec.isKill && isFiniteNumber(mode.kill))
          total += Number(mode.kill);
      let perTargetApplied = 0;
      if (isFiniteNumber(spec.targetsHit) && spec.targetsHit > 0 && isFiniteNumber(mode.perTarget)) {
          const desired = Number(mode.perTarget) * spec.targetsHit;
          const used = (_g = state === null || state === void 0 ? void 0 : state.skillPerTargetGain) !== null && _g !== void 0 ? _g : 0;
          const room = Math.max(0, 12 - used);
          const granted = Math.max(0, Math.min(desired, room));
          total += granted;
          perTargetApplied = granted;
      }
      const ratio = isFiniteNumber(mode.targetRatio) ? Number(mode.targetRatio) : 0;
      if (ratio &&
          isFiniteNumber(spec.dealt) &&
          isFiniteNumber(spec.targetMaxHp) &&
          ((_h = spec.targetMaxHp) !== null && _h !== void 0 ? _h : 0) > 0) {
          total += Math.round((ratio * Math.max(0, (_j = spec.dealt) !== null && _j !== void 0 ? _j : 0)) / spec.targetMaxHp);
      }
      if (isFiniteNumber(mode.min))
          total = Math.max(Number(mode.min), total);
      if (isFiniteNumber(mode.max))
          total = Math.min(Number(mode.max), total);
      if (isFiniteNumber(spec.bonus))
          total += spec.bonus;
      if (isFiniteNumber(spec.multiplier))
          total *= spec.multiplier;
      return { amount: Math.floor(Math.max(0, total)), perTarget: perTargetApplied };
  }
  function applyBonuses(unit, amount) {
      var _a;
      if (!unit)
          return amount;
      const internal = unit;
      const bonus = toNumber((_a = internal.furyGainBonus) !== null && _a !== void 0 ? _a : internal.rageGainBonus);
      if (bonus !== 0)
          return Math.floor(Math.max(0, amount * (1 + bonus)));
      return amount;
  }
  function startFuryTurn(unit, opts = {}) {
      var _a, _b, _c, _d;
      const state = ensureState(unit);
      if (!state)
          return;
      if (opts.clearFresh !== false)
          state.freshSummon = false;
      const stamp = (_b = (_a = opts.turnStamp) !== null && _a !== void 0 ? _a : opts.turnKey) !== null && _b !== void 0 ? _b : TURN_GRANT_KEY;
      if (state.turnStamp !== stamp) {
          state.turnStamp = stamp;
          state.turnGain = 0;
      }
      state.skillGain = 0;
      state.hitGain = 0;
      state.skillTag = null;
      state.skillPerTargetGain = 0;
      state.skillDrain = 0;
      if (opts.grantStart !== false) {
          const furyCfg = ((_c = CFG === null || CFG === void 0 ? void 0 : CFG.fury) !== null && _c !== void 0 ? _c : {});
          const gainCfg = (_d = furyCfg.gain) === null || _d === void 0 ? void 0 : _d.turnStart;
          const baseStart = isFiniteNumber(gainCfg === null || gainCfg === void 0 ? void 0 : gainCfg.amount)
              ? gainCfg.amount
              : (() => {
                  const turn = furyCfg.turn;
                  if (turn && isFiniteNumber(turn.startGain))
                      return turn.startGain;
                  return isFiniteNumber(furyCfg.startGain)
                      ? Number(furyCfg.startGain)
                      : 3;
              })();
          const startAmount = isFiniteNumber(opts.startAmount) ? opts.startAmount : baseStart;
          if ((startAmount !== null && startAmount !== void 0 ? startAmount : 0) > 0) {
              gainFury(unit, { amount: startAmount, type: 'turnStart' });
          }
      }
  }
  function startFurySkill(unit, { tag = null, forceReset = false } = {}) {
      const state = ensureState(unit);
      if (!state)
          return;
      const skillTag = tag || '__skill__';
      if (forceReset || state.skillTag !== skillTag) {
          state.skillTag = skillTag;
          state.skillGain = 0;
          state.hitGain = 0;
          state.skillPerTargetGain = 0;
          state.skillDrain = 0;
      }
  }
  function finishFuryHit(unit) {
      const state = ensureState(unit);
      if (state) {
          state.hitGain = 0;
      }
  }
  function gainFury(unit, spec = {}, cfg = CFG) {
      var _a, _b;
      if (!unit)
          return 0;
      ensureAlias(unit);
      const state = ensureState(unit);
      if (!state)
          return 0;
      const { amount: desiredRaw, perTarget = 0 } = resolveGainAmount(spec, cfg, state);
      if (desiredRaw <= 0)
          return 0;
      const turnCap = resolveTurnCap(cfg);
      const skillCap = resolveSkillCap(cfg);
      const hitCap = resolveHitCap(cfg);
      const perTurnLeft = turnCap - state.turnGain;
      const perSkillLeft = skillCap - state.skillGain;
      const perHitLeft = hitCap - state.hitGain;
      const room = Math.min(perTurnLeft, perSkillLeft, perHitLeft);
      if (room <= 0)
          return 0;
      const rawBeforeBonus = Math.min(desiredRaw, room);
      let amount = applyBonuses(unit, rawBeforeBonus);
      if (amount <= 0)
          return 0;
      const max = isFiniteNumber(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, cfg);
      const currentFury = Math.floor((_a = unit.fury) !== null && _a !== void 0 ? _a : 0);
      const next = Math.max(0, Math.min(max, currentFury + amount));
      const gained = next - currentFury;
      if (gained <= 0)
          return 0;
      unit.fury = next;
      unit.rage = next;
      state.turnGain += gained;
      state.skillGain += gained;
      state.hitGain += gained;
      if (perTarget > 0 && rawBeforeBonus > 0) {
          const ratio = amount > 0 ? Math.min(1, gained / amount) : 0;
          if (ratio > 0) {
              const applied = Math.min(perTarget, Math.round(perTarget * ratio));
              state.skillPerTargetGain = Math.min(12, ((_b = state.skillPerTargetGain) !== null && _b !== void 0 ? _b : 0) + applied);
          }
      }
      return gained;
  }
  function spendFury(unit, amount, cfg = CFG) {
      var _a;
      if (!unit)
          return 0;
      ensureAlias(unit);
      const amt = Math.max(0, Math.floor(toNumber(amount)));
      const before = Math.floor((_a = unit.fury) !== null && _a !== void 0 ? _a : 0);
      const next = Math.max(0, before - amt);
      unit.fury = next;
      unit.rage = next;
      return before - next;
  }
  function drainFury(source, target, opts = {}, cfg = CFG) {
      var _a, _b, _c, _d, _e;
      if (!target)
          return 0;
      ensureAlias(target);
      const targetState = ensureState(target);
      if (targetState === null || targetState === void 0 ? void 0 : targetState.freshSummon)
          return 0;
      const furyCfg = ((_a = cfg === null || cfg === void 0 ? void 0 : cfg.fury) !== null && _a !== void 0 ? _a : {});
      const drainCfg = (_b = furyCfg.drain) !== null && _b !== void 0 ? _b : {};
      const base = isFiniteNumber(opts.base)
          ? opts.base
          : isFiniteNumber(drainCfg.perTargetBase)
              ? Number(drainCfg.perTargetBase)
              : 0;
      const percent = isFiniteNumber(opts.percent)
          ? opts.percent
          : isFiniteNumber(drainCfg.perTargetPct)
              ? Number(drainCfg.perTargetPct)
              : 0;
      const skillCap = isFiniteNumber(opts.skillTotalCap)
          ? opts.skillTotalCap
          : isFiniteNumber(drainCfg.skillTotalCap)
              ? Number(drainCfg.skillTotalCap)
              : null;
      const current = Math.max(0, Math.floor((_c = target.fury) !== null && _c !== void 0 ? _c : 0));
      if (current <= 0)
          return 0;
      let desired = Math.max(0, Math.floor(base !== null && base !== void 0 ? base : 0));
      if (percent)
          desired += Math.round(current * percent);
      if (desired <= 0)
          return 0;
      let capRoom = desired;
      let sourceState = null;
      if (isFiniteNumber(skillCap)) {
          sourceState = ensureState(source);
          const used = sourceState ? (_d = sourceState.skillDrain) !== null && _d !== void 0 ? _d : 0 : 0;
          capRoom = Math.max(0, Math.min(desired, skillCap - used));
      }
      const drained = Math.max(0, Math.min(current, capRoom));
      if (drained <= 0)
          return 0;
      target.fury = current - drained;
      target.rage = target.fury;
      if (sourceState && isFiniteNumber(skillCap)) {
          sourceState.skillDrain = ((_e = sourceState.skillDrain) !== null && _e !== void 0 ? _e : 0) + drained;
      }
      return drained;
  }
  function furyValue(unit) {
      var _a;
      if (!unit)
          return 0;
      ensureAlias(unit);
      return Math.floor((_a = unit.fury) !== null && _a !== void 0 ? _a : 0);
  }
  function furyRoom(unit) {
      var _a;
      if (!unit)
          return 0;
      ensureAlias(unit);
      const max = isFiniteNumber(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, CFG);
      return Math.max(0, max - Math.floor((_a = unit.fury) !== null && _a !== void 0 ? _a : 0));
  }
  function furyState(unit) {
      return ensureState(unit);
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveMaxFury')) exports.resolveMaxFury = resolveMaxFury;
  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveUltCost')) exports.resolveUltCost = resolveUltCost;
  if (!Object.prototype.hasOwnProperty.call(exports, 'initializeFury')) exports.initializeFury = initializeFury;
  if (!Object.prototype.hasOwnProperty.call(exports, 'markFreshSummon')) exports.markFreshSummon = markFreshSummon;
  if (!Object.prototype.hasOwnProperty.call(exports, 'clearFreshSummon')) exports.clearFreshSummon = clearFreshSummon;
  if (!Object.prototype.hasOwnProperty.call(exports, 'setFury')) exports.setFury = setFury;
  if (!Object.prototype.hasOwnProperty.call(exports, 'startFuryTurn')) exports.startFuryTurn = startFuryTurn;
  if (!Object.prototype.hasOwnProperty.call(exports, 'startFurySkill')) exports.startFurySkill = startFurySkill;
  if (!Object.prototype.hasOwnProperty.call(exports, 'finishFuryHit')) exports.finishFuryHit = finishFuryHit;
  if (!Object.prototype.hasOwnProperty.call(exports, 'gainFury')) exports.gainFury = gainFury;
  if (!Object.prototype.hasOwnProperty.call(exports, 'spendFury')) exports.spendFury = spendFury;
  if (!Object.prototype.hasOwnProperty.call(exports, 'drainFury')) exports.drainFury = drainFury;
  if (!Object.prototype.hasOwnProperty.call(exports, 'furyValue')) exports.furyValue = furyValue;
  if (!Object.prototype.hasOwnProperty.call(exports, 'furyRoom')) exports.furyRoom = furyRoom;
  if (!Object.prototype.hasOwnProperty.call(exports, 'furyState')) exports.furyState = furyState;
});
__define('./utils/kit.ts', (exports, module, __require) => {
  const KNOWN_SUMMON_KEYS = ['summon', 'summoner', 'immediateSummon'];
  const KNOWN_REVIVE_KEYS = ['revive', 'reviver'];
  const DEFENSIVE_TAGS = ['defense', 'defensive', 'protection', 'shield', 'barrier', 'support'];
  const INSTANT_TAGS = ['instant', 'instant-cast', 'instantCast'];
  function isPlainRecord(value) {
      if (!value || typeof value !== 'object')
          return false;
      if (Array.isArray(value))
          return false;
      const proto = Object.getPrototypeOf(value);
      return proto === Object.prototype || proto === null;
  }
  function isCloneCandidate(value) {
      return Array.isArray(value) || isPlainRecord(value);
  }
  function coerceKit(metaOrKit) {
      if (!metaOrKit)
          return null;
      if ('kit' in metaOrKit && metaOrKit.kit)
          return metaOrKit.kit;
      return metaOrKit;
  }
  function normalizeKey(key) {
      return typeof key === 'string' ? key.trim().toLowerCase() : '';
  }
  function readTrait(traits, key) {
      if (!traits)
          return null;
      const target = normalizeKey(key);
      if (!target)
          return null;
      if (Array.isArray(traits)) {
          for (const entry of traits) {
              if (entry == null)
                  continue;
              if (typeof entry === 'string') {
                  if (normalizeKey(entry) === target)
                      return true;
                  continue;
              }
              if (typeof entry === 'object') {
                  const candidate = entry;
                  const id = normalizeKey(candidate.id || candidate.key || candidate.type || candidate.name);
                  if (id === target)
                      return candidate;
                  if (candidate[target] != null) {
                      return candidate[target];
                  }
              }
          }
          return null;
      }
      if (typeof traits === 'object') {
          for (const [k, value] of Object.entries(traits)) {
              if (normalizeKey(k) === target) {
                  return value;
              }
          }
      }
      return null;
  }
  function cloneShallow(value) {
      if (value === null || value === undefined)
          return null;
      if (typeof value !== 'object')
          return value;
      if (!isCloneCandidate(value))
          return value;
      if (Array.isArray(value)) {
          const result = value.map((entry) => (isCloneCandidate(entry) ? cloneShallow(entry) : entry));
          return result;
      }
      const out = { ...value };
      for (const [key, entry] of Object.entries(out)) {
          if (isCloneCandidate(entry)) {
              out[key] = cloneShallow(entry);
          }
      }
      return out;
  }
  function extractUltSummonFields(ult) {
      var _a, _b, _c, _d;
      if (!ult || typeof ult !== 'object')
          return null;
      const out = {};
      let hasValue = false;
      const assign = (key, value, clone = false) => {
          if (value === undefined || value === null)
              return;
          if (clone && isCloneCandidate(value)) {
              out[key] = cloneShallow(value);
          }
          else {
              out[key] = value;
          }
          hasValue = true;
      };
      const pattern = (_a = ult.pattern) !== null && _a !== void 0 ? _a : ult.placement;
      if (pattern !== undefined && pattern !== null)
          assign('pattern', pattern);
      const count = (_b = ult.count) !== null && _b !== void 0 ? _b : ult.summonCount;
      if (count !== undefined && count !== null)
          assign('count', count);
      const ttlTurns = (_c = ult.ttlTurns) !== null && _c !== void 0 ? _c : ult.ttl;
      if (ttlTurns !== undefined && ttlTurns !== null)
          assign('ttlTurns', ttlTurns);
      const ttl = (_d = ult.ttl) !== null && _d !== void 0 ? _d : ult.ttlTurns;
      if (ttl !== undefined && ttl !== null)
          assign('ttl', ttl);
      assign('inherit', ult.inherit, true);
      const limit = ult.limit;
      if (limit !== undefined && limit !== null)
          assign('limit', limit);
      assign('replace', ult.replace);
      assign('creep', ult.creep, true);
      return hasValue ? out : null;
  }
  function applyUltSummonDefaults(spec, ult) {
      const fields = extractUltSummonFields(ult);
      if (!fields)
          return spec !== null && spec !== void 0 ? spec : null;
      const out = spec !== null && spec !== void 0 ? spec : {};
      const target = out;
      for (const [key, value] of Object.entries(fields)) {
          const current = target[key];
          if (current === undefined || current === null) {
              target[key] = value;
          }
      }
      return out;
  }
  function collectUltTags(metaOrKit) {
      var _a;
      const kit = coerceKit(metaOrKit);
      const ult = kit === null || kit === void 0 ? void 0 : kit.ult;
      const tags = new Set();
      const add = (val) => {
          if (typeof val === 'string' && val.trim() !== '')
              tags.add(val.trim());
      };
      const addMany = (vals) => {
          if (!Array.isArray(vals))
              return;
          for (const val of vals) {
              add(val);
          }
      };
      if (!ult)
          return tags;
      add(ult.type);
      add(ult.kind);
      add(ult.category);
      addMany(ult.tags);
      const metadata = ult.metadata || ult.meta || null;
      if (metadata) {
          add(metadata.type);
          add(metadata.kind);
          add(metadata.category);
          addMany(metadata.categories);
          addMany(metadata.tags);
          if (metadata.label)
              add(metadata.label);
      }
      const traitUlt = readTrait((_a = kit === null || kit === void 0 ? void 0 : kit.traits) !== null && _a !== void 0 ? _a : null, 'ult');
      if (traitUlt) {
          if (typeof traitUlt === 'string')
              add(traitUlt);
          if (Array.isArray(traitUlt))
              addMany(traitUlt);
          if (traitUlt && typeof traitUlt === 'object') {
              const traitObj = traitUlt;
              add(traitObj.type);
              addMany(traitObj.tags);
              addMany(traitObj.categories);
              if (typeof traitObj.label === 'string')
                  add(traitObj.label);
          }
      }
      return tags;
  }
  function getSummonSpec(metaOrKit) {
      var _a, _b, _c, _d, _e;
      const kit = coerceKit(metaOrKit);
      if (!kit)
          return null;
      let spec = null;
      for (const key of KNOWN_SUMMON_KEYS) {
          const trait = readTrait((_a = kit.traits) !== null && _a !== void 0 ? _a : null, key);
          if (trait) {
              if (trait === true) {
                  spec = {};
              }
              else if (typeof trait === 'object') {
                  spec = cloneShallow(trait);
              }
              else if (typeof trait === 'number') {
                  spec = { count: trait };
              }
              else {
                  spec = {};
              }
              break;
          }
      }
      const ult = kit.ult || null;
      if (!spec && ult) {
          if (ult.summon) {
              spec = cloneShallow(ult.summon);
          }
          else if ((_b = ult.metadata) === null || _b === void 0 ? void 0 : _b.summon) {
              spec = cloneShallow(ult.metadata.summon);
          }
          else if ((_c = ult.meta) === null || _c === void 0 ? void 0 : _c.summon) {
              spec = cloneShallow(ult.meta.summon);
          }
      }
      const tags = collectUltTags(kit);
      if (!spec && kitUltHasTag(kit, 'summon', tags)) {
          if (ult === null || ult === void 0 ? void 0 : ult.summon) {
              spec = cloneShallow(ult.summon);
          }
          spec = applyUltSummonDefaults(spec, ult);
      }
      if (ult && typeof ult.type === 'string' && ult.type.toLowerCase() === 'summon') {
          spec = applyUltSummonDefaults(spec, ult);
      }
      if (!spec)
          return null;
      const normalized = { ...((_e = (_d = cloneShallow(spec)) !== null && _d !== void 0 ? _d : spec) !== null && _e !== void 0 ? _e : {}) };
      if (!normalized.pattern && typeof normalized.placement === 'string') {
          normalized.pattern = normalized.placement;
      }
      if (!normalized.pattern && typeof normalized.patternKey === 'string') {
          normalized.pattern = normalized.patternKey;
      }
      if (normalized.ttl == null && typeof normalized.ttlTurns === 'number') {
          normalized.ttl = normalized.ttlTurns;
      }
      if (normalized.ttlTurns == null && typeof normalized.ttl === 'number') {
          normalized.ttlTurns = normalized.ttl;
      }
      if (Array.isArray(normalized.slots)) {
          normalized.slots = normalized.slots.filter((s) => typeof s === 'number' && Number.isFinite(s)).map((s) => Number(s));
      }
      return normalized;
  }
  function getReviveSpec(metaOrKit) {
      var _a, _b, _c;
      const kit = coerceKit(metaOrKit);
      if (!kit)
          return null;
      for (const key of KNOWN_REVIVE_KEYS) {
          const trait = readTrait((_a = kit.traits) !== null && _a !== void 0 ? _a : null, key);
          if (trait) {
              if (trait === true)
                  return {};
              if (typeof trait === 'object')
                  return cloneShallow(trait);
              return {};
          }
      }
      const ult = kit.ult || null;
      if (ult === null || ult === void 0 ? void 0 : ult.revive)
          return cloneShallow(ult.revive);
      if ((_b = ult === null || ult === void 0 ? void 0 : ult.metadata) === null || _b === void 0 ? void 0 : _b.revive)
          return cloneShallow(ult.metadata.revive);
      if (kitUltHasTag(kit, 'revive')) {
          const revive = (_c = ult === null || ult === void 0 ? void 0 : ult.revive) !== null && _c !== void 0 ? _c : {};
          return cloneShallow(revive);
      }
      return null;
  }
  function kitSupportsSummon(metaOrKit) {
      return getSummonSpec(metaOrKit) != null;
  }
  function kitUltHasTag(metaOrKit, tag, precomputedTags = null) {
      if (!tag)
          return false;
      const tags = precomputedTags !== null && precomputedTags !== void 0 ? precomputedTags : collectUltTags(metaOrKit);
      const target = normalizeKey(tag);
      for (const t of tags) {
          if (normalizeKey(t) === target)
              return true;
      }
      return false;
  }
  function detectUltBehavior(metaOrKit) {
      var _a;
      const kit = coerceKit(metaOrKit);
      const ult = kit === null || kit === void 0 ? void 0 : kit.ult;
      const tags = collectUltTags(kit);
      const metadata = (ult === null || ult === void 0 ? void 0 : ult.metadata) || (ult === null || ult === void 0 ? void 0 : ult.meta) || {};
      const traits = (_a = kit === null || kit === void 0 ? void 0 : kit.traits) !== null && _a !== void 0 ? _a : null;
      const hasInstant = Boolean(metadata.instant === true ||
          metadata.instantCast === true ||
          metadata.cast === 'instant' ||
          (ult && (ult.instant || ult.cast === 'instant' || ult.immediate === true)) ||
          INSTANT_TAGS.some((instantTag) => kitUltHasTag(kit, instantTag)) ||
          readTrait(traits, 'instantUlt') === true ||
          readTrait(traits, 'instantUltimate') === true);
      const hasDefensive = Boolean(metadata.defensive === true ||
          metadata.role === 'defensive' ||
          DEFENSIVE_TAGS.some((defTag) => kitUltHasTag(kit, defTag)) ||
          (ult && (typeof ult.reduceDamage === 'number' ||
              typeof ult.shield === 'number' ||
              typeof ult.barrier === 'number' ||
              Array.isArray(ult.shields) ||
              (Array.isArray(ult.buffs) && ult.buffs.some((b) => normalizeKey(b.effect) === 'shield')))) ||
          readTrait(traits, 'defensiveUlt') === true ||
          readTrait(traits, 'guardianUlt') === true);
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
  function extractRageFromEffects(onSpawn, opts = {}) {
      const effects = Array.isArray(onSpawn === null || onSpawn === void 0 ? void 0 : onSpawn.effects) ? onSpawn.effects : [];
      for (const effect of effects) {
          if (!effect)
              continue;
          const effectObj = effect;
          const type = normalizeKey(effectObj.type || effectObj.kind || effectObj.effect);
          if (!type)
              continue;
          if (type === 'setrage' || type === 'addrage' || type === 'giverage') {
              if (opts.revive && normalizeKey(effectObj.phase || effectObj.stage || effectObj.when) === 'revive' && typeof effectObj.amount === 'number') {
                  return effectObj.amount;
              }
              if (opts.isLeader && normalizeKey(effectObj.target) === 'leader' && typeof effectObj.amount === 'number') {
                  return effectObj.amount;
              }
              if (!opts.isLeader && (effectObj.target == null || ['deck', 'nonleader', 'non-leader'].includes(normalizeKey(effectObj.target)))) {
                  if (typeof effectObj.amount === 'number')
                      return effectObj.amount;
              }
              if (typeof effectObj.value === 'number')
                  return effectObj.value;
              if (typeof effectObj.amount === 'number')
                  return effectObj.amount;
          }
      }
      return null;
  }
  function extractOnSpawnRage(onSpawn, opts = {}) {
      if (!onSpawn)
          return null;
      const { isLeader = false, revive = false, reviveSpec = null } = opts;
      if (revive && reviveSpec && typeof reviveSpec.rage === 'number') {
          return Math.max(0, reviveSpec.rage);
      }
      if (revive) {
          const reviveCfg = onSpawn.revive || onSpawn.onRevive || onSpawn.revived || null;
          if (reviveCfg && typeof reviveCfg.rage === 'number')
              return Math.max(0, reviveCfg.rage);
      }
      const fromEffects = extractRageFromEffects(onSpawn, { isLeader, revive, reviveSpec });
      if (fromEffects != null)
          return Math.max(0, fromEffects);
      const { rage } = onSpawn;
      if (typeof rage === 'number')
          return Math.max(0, rage);
      if (typeof rage === 'string' && rage.trim() !== '') {
          const parsed = Number(rage);
          if (!Number.isNaN(parsed))
              return Math.max(0, parsed);
      }
      if (rage && typeof rage === 'object') {
          const rageObj = rage;
          if (revive && typeof rageObj.revive === 'number')
              return Math.max(0, rageObj.revive);
          if (isLeader && typeof rageObj.leader === 'number')
              return Math.max(0, rageObj.leader);
          if (!isLeader) {
              if (typeof rageObj.deck === 'number')
                  return Math.max(0, rageObj.deck);
              if (typeof rageObj.nonLeader === 'number')
                  return Math.max(0, rageObj.nonLeader);
          }
          if (typeof rageObj.default === 'number')
              return Math.max(0, rageObj.default);
          if (typeof rageObj.value === 'number') {
              return Math.max(0, rageObj.value);
          }
      }
      if (onSpawn.deck && typeof onSpawn.deck.rage === 'number' && !isLeader) {
          return Math.max(0, onSpawn.deck.rage);
      }
      if (onSpawn.default && typeof onSpawn.default.rage === 'number') {
          return Math.max(0, onSpawn.default.rage);
      }
      if (revive && typeof onSpawn.reviveRage === 'number') {
          return Math.max(0, onSpawn.reviveRage);
      }
      if (typeof onSpawn.defaultRage === 'number') {
          return Math.max(0, onSpawn.defaultRage);
      }
      if (typeof onSpawn.rageOnSummon === 'number' && !isLeader) {
          return Math.max(0, onSpawn.rageOnSummon);
      }
      return null;
  }
  function verticalNeighbors(baseSlot) {
      const row = (baseSlot - 1) % 3;
      const list = [];
      if (row > 0)
          list.push(baseSlot - 1);
      if (row < 2)
          list.push(baseSlot + 1);
      return list;
  }
  function rowNeighbors(baseSlot) {
      const col = Math.floor((baseSlot - 1) / 3);
      const row = (baseSlot - 1) % 3;
      const left = col < 2 ? ((col + 1) * 3 + row + 1) : null;
      const right = col > 0 ? ((col - 1) * 3 + row + 1) : null;
      const neighbors = [right, left].filter((slot) => typeof slot === 'number' && Number.isFinite(slot));
      return neighbors;
  }
  function resolveSummonSlots(spec, baseSlot) {
      if (!spec || !Number.isFinite(baseSlot))
          return [];
      if (Array.isArray(spec.slots) && spec.slots.length) {
          return spec.slots
              .filter((slot) => typeof slot === 'number' && Number.isFinite(slot))
              .map((slot) => Number(slot));
      }
      const patternRaw = spec.pattern || spec.placement || spec.shape || spec.area;
      const pattern = normalizeKey(patternRaw);
      if (!pattern) {
          return verticalNeighbors(baseSlot);
      }
      switch (pattern) {
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

  if (!Object.prototype.hasOwnProperty.call(exports, 'collectUltTags')) exports.collectUltTags = collectUltTags;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getSummonSpec')) exports.getSummonSpec = getSummonSpec;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getReviveSpec')) exports.getReviveSpec = getReviveSpec;
  if (!Object.prototype.hasOwnProperty.call(exports, 'kitSupportsSummon')) exports.kitSupportsSummon = kitSupportsSummon;
  if (!Object.prototype.hasOwnProperty.call(exports, 'kitUltHasTag')) exports.kitUltHasTag = kitUltHasTag;
  if (!Object.prototype.hasOwnProperty.call(exports, 'detectUltBehavior')) exports.detectUltBehavior = detectUltBehavior;
  if (!Object.prototype.hasOwnProperty.call(exports, 'extractOnSpawnRage')) exports.extractOnSpawnRage = extractOnSpawnRage;
  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveSummonSlots')) exports.resolveSummonSlots = resolveSummonSlots;
});
__define('./utils/time.ts', (exports, module, __require) => {
  const perf = typeof globalThis !== 'undefined' ? globalThis.performance : undefined;
  const hasPerfNow = !!(perf && typeof perf.now === 'function');
  let lastFallbackNow = 0;
  function safeNow() {
      if (hasPerfNow && perf)
          return perf.now();
      const current = Date.now();
      if (current <= lastFallbackNow) {
          lastFallbackNow += 1;
          return lastFallbackNow;
      }
      lastFallbackNow = current;
      return current;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'safeNow')) exports.safeNow = safeNow;
});
__define('./utils/unit-id.ts', (exports, module, __require) => {
  function normalizeUnitId(id) {
      if (typeof id === 'string') {
          return id;
      }
      if (typeof id === 'number') {
          return Number.isFinite(id) ? String(id) : '';
      }
      if (id == null) {
          return '';
      }
      const value = String(id);
      return typeof value === 'string' ? value : '';
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeUnitId')) exports.normalizeUnitId = normalizeUnitId;
});
__define('./vfx.ts', (exports, module, __require) => {
  // 0.7 vfx.js
  // VFX layer: spawn pop, hit ring, ranged tracer, melee step-in/out
  // Không thay đổi logic combat/turn — chỉ vẽ đè.
  // Durations: spawn 500ms, hit 380ms, tracer 400ms, melee 1100ms.
  const __dep0 = __require('./engine.ts');
  const projectCellOblique = __dep0.projectCellOblique;
  const __dep1 = __require('./config.ts');
  const CFG = __dep1.CFG;
  const CHIBI = __dep1.CHIBI;
  const __dep2 = __require('./utils/time.ts');
  const safeNow = __dep2.safeNow;
  const __dep3 = __require('./data/vfx_anchors/loithienanh.json');
  const loithienanhAnchors = __dep3.default ?? __dep3;
  const __dep4 = __require('./data/vfx_anchors/schema.ts');
  const parseVfxAnchorDataset = __dep4.parseVfxAnchorDataset;
  function asSessionWithVfx(game, { requireGrid = false } = {}) {
      if (!game || !Array.isArray(game.tokens))
          return null;
      if (requireGrid && !game.grid)
          return null;
      return game;
  }
  const now = () => safeNow();
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) * 0.5;
  const isFiniteCoord = (value) => Number.isFinite(value);
  const hasFinitePoint = (obj) => !!obj && isFiniteCoord(obj.cx) && isFiniteCoord(obj.cy);
  const warnInvalidArc = (label, data) => {
      if (typeof console !== 'undefined' && (console === null || console === void 0 ? void 0 : console.warn)) {
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
      if (!dataset || typeof dataset !== 'object')
          return;
      const unitId = dataset.unitId || null;
      if (!unitId)
          return;
      const entry = {
          bodyAnchors: dataset.bodyAnchors || {},
          vfxBindings: dataset.vfxBindings || {},
          ambientEffects: dataset.ambientEffects || {}
      };
      VFX_ANCHOR_CACHE.set(unitId, entry);
  }
  try {
      const dataset = parseVfxAnchorDataset(loithienanhAnchors);
      registerAnchorDataset(dataset);
  }
  catch (error) {
      // behavior-preserving: fall back to raw dataset when validation fails.
      if (typeof console !== 'undefined' && (console === null || console === void 0 ? void 0 : console.warn)) {
          console.warn('[vfxDraw] Failed to parse anchor dataset', error);
      }
      registerAnchorDataset(loithienanhAnchors);
  }
  function getUnitAnchorDataset(unit) {
      if (!unit)
          return null;
      const id = unit.unitId
          || (typeof unit.id === 'string' ? unit.id : null)
          || (typeof unit.name === 'string' ? unit.name : null);
      if (!id)
          return null;
      return VFX_ANCHOR_CACHE.get(id) || null;
  }
  function getBindingAnchors(dataset, bindingKey, source = 'vfxBindings') {
      if (!dataset || !bindingKey)
          return [];
      const bindings = dataset[source];
      const entry = bindings === null || bindings === void 0 ? void 0 : bindings[bindingKey];
      if (!entry || !Array.isArray(entry.anchors))
          return [];
      return entry.anchors;
  }
  function pickAnchorFromList(anchors, anchorId, timing, hasTiming) {
      if (anchors.length === 0)
          return null;
      if (hasTiming || anchorId) {
          for (const anchor of anchors) {
              const timingMatch = hasTiming && anchor.timing === timing;
              const idMatch = !!anchorId && anchor.id === anchorId;
              if (timingMatch || idMatch) {
                  return anchor;
              }
          }
      }
      if (hasTiming) {
          for (const anchor of anchors) {
              if (anchor.timing === timing) {
                  return anchor;
              }
          }
      }
      if (anchorId) {
          for (const anchor of anchors) {
              if (anchor.id === anchorId) {
                  return anchor;
              }
          }
      }
      return null;
  }
  function resolveBindingAnchor(unit, { anchorId, bindingKey, timing, ambientKey, radius }) {
      const dataset = getUnitAnchorDataset(unit);
      const hasTiming = !!timing;
      const timingValue = hasTiming ? timing : undefined;
      let picked = null;
      const primaryAnchors = getBindingAnchors(dataset, bindingKey);
      picked = pickAnchorFromList(primaryAnchors, anchorId, timingValue, hasTiming);
      if (!picked) {
          const ambientAnchors = getBindingAnchors(dataset, ambientKey !== null && ambientKey !== void 0 ? ambientKey : null, 'ambientEffects');
          picked = pickAnchorFromList(ambientAnchors, anchorId, timingValue, hasTiming);
      }
      const resolvedId = (picked === null || picked === void 0 ? void 0 : picked.id) || anchorId || DEFAULT_ANCHOR_ID;
      const resolvedRadius = Number.isFinite(radius) ? radius : (Number.isFinite(picked === null || picked === void 0 ? void 0 : picked.radius) ? picked.radius : null);
      return { id: resolvedId, radius: resolvedRadius !== null && resolvedRadius !== void 0 ? resolvedRadius : null };
  }
  function lookupBodyAnchor(unit, anchorId) {
      var _a;
      const dataset = getUnitAnchorDataset(unit);
      if (!dataset)
          return null;
      const anchor = (_a = dataset.bodyAnchors) === null || _a === void 0 ? void 0 : _a[anchorId];
      if (!anchor)
          return null;
      const x = Number(anchor.x);
      const y = Number(anchor.y);
      if (!Number.isFinite(x) || !Number.isFinite(y))
          return null;
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
      var _a, _b;
      if (!(Game === null || Game === void 0 ? void 0 : Game.grid) || !token || !hasFinitePoint(token))
          return null;
      const projection = projectCellOblique(Game.grid, (_a = token.cx) !== null && _a !== void 0 ? _a : 0, (_b = token.cy) !== null && _b !== void 0 ? _b : 0, cam);
      if (!projection || !isFiniteCoord(projection.x) || !isFiniteCoord(projection.y) || !isFiniteCoord(projection.scale))
          return null;
      const anchor = lookupBodyAnchor(token, anchorId !== null && anchorId !== void 0 ? anchorId : DEFAULT_ANCHOR_ID)
          || lookupBodyAnchor(token, DEFAULT_ANCHOR_ID)
          || DEFAULT_ANCHOR_POINT;
      const ax = Number(anchor === null || anchor === void 0 ? void 0 : anchor.x);
      const ay = Number(anchor === null || anchor === void 0 ? void 0 : anchor.y);
      const validAnchor = Number.isFinite(ax) && Number.isFinite(ay);
      const xRatio = validAnchor ? (ax - 0.5) : 0;
      const yRatio = validAnchor ? (ay - 0.5) : 0;
      const width = Game.grid.tile * UNIT_WIDTH_RATIO * projection.scale;
      const height = Game.grid.tile * UNIT_HEIGHT_RATIO * projection.scale;
      const px = projection.x + xRatio * width;
      const py = projection.y - yRatio * height;
      if (!isFiniteCoord(px) || !isFiniteCoord(py))
          return null;
      const rr = Number.isFinite(radiusRatio) ? Number(radiusRatio) : DEFAULT_ANCHOR_RADIUS;
      const rPx = Math.max(2, Math.floor(rr * Game.grid.tile * projection.scale));
      return { x: px, y: py, r: rPx, scale: projection.scale };
  }
  function drawLightningArc(ctx, start, end, event, progress) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      if (!start)
          return;
      const segments = Math.max(2, event.segments || DEFAULT_SEGMENTS);
      const color = event.color || '#7de5ff';
      const alpha = ((_a = event.alpha) !== null && _a !== void 0 ? _a : 0.9) * (1 - progress);
      const thickness = Math.max(1, Math.floor(((_b = event.thickness) !== null && _b !== void 0 ? _b : 2.4) * ((_c = start.scale) !== null && _c !== void 0 ? _c : 1)));
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
          const jitterFactor = ((_d = event.jitter) !== null && _d !== void 0 ? _d : 0.22) * dist * (1 - progress * 0.6);
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
      }
      else {
          const rayCount = segments + 1;
          const baseRadius = start.r * ((_e = event.rayScale) !== null && _e !== void 0 ? _e : 2.4) * (1 + 0.2 * (1 - progress));
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
          ctx.arc(start.x, start.y, Math.max(1, start.r * ((_f = event.glowScale) !== null && _f !== void 0 ? _f : 1.1)), 0, Math.PI * 2);
          ctx.stroke();
          if (end) {
              ctx.beginPath();
              ctx.arc(end.x, end.y, Math.max(1, ((_g = end.r) !== null && _g !== void 0 ? _g : start.r) * ((_h = event.glowScale) !== null && _h !== void 0 ? _h : 1.1)), 0, Math.PI * 2);
              ctx.stroke();
          }
      }
      ctx.restore();
  }
  function drawBloodPulse(ctx, anchor, event, progress) {
      var _a, _b;
      if (!anchor)
          return;
      const color = event.color || '#ff6b81';
      const rings = Math.max(1, event.rings || 2);
      const alpha = ((_a = event.alpha) !== null && _a !== void 0 ? _a : 0.75) * (1 - progress);
      const maxScale = (_b = event.maxScale) !== null && _b !== void 0 ? _b : 3.4;
      const growth = easeInOut(progress);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, Math.floor(anchor.r * 0.3));
      for (let i = 0; i < rings; i += 1) {
          const t = (i + 1) / rings;
          const radius = anchor.r * lerp(1, maxScale, Math.pow(growth, 0.8) * t);
          if (!isFiniteCoord(radius) || radius <= 0)
              continue;
          ctx.beginPath();
          ctx.arc(anchor.x, anchor.y, radius, 0, Math.PI * 2);
          ctx.stroke();
      }
      ctx.restore();
  }
  function drawShieldWrap(ctx, frontAnchor, backAnchor, event, progress) {
      var _a, _b, _c, _d, _e, _f;
      if (!frontAnchor)
          return;
      const color = event.color || '#9bd8ff';
      const alpha = ((_a = event.alpha) !== null && _a !== void 0 ? _a : 0.6) * (1 - progress * 0.7);
      const thickness = Math.max(2, Math.floor(((_b = event.thickness) !== null && _b !== void 0 ? _b : 2.6) * ((_c = frontAnchor.scale) !== null && _c !== void 0 ? _c : 1)));
      const spanY = Math.max(frontAnchor.r * ((_d = event.heightScale) !== null && _d !== void 0 ? _d : 3.4), 4);
      const spanX = Math.max(frontAnchor.r * ((_e = event.widthScale) !== null && _e !== void 0 ? _e : 2.6), 4);
      const wobble = ((_f = event.wobble) !== null && _f !== void 0 ? _f : 0.18) * Math.sin(progress * Math.PI * 2);
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
      var _a, _b;
      if (!anchor)
          return;
      const color = event.color || '#ffa36e';
      const alpha = ((_a = event.alpha) !== null && _a !== void 0 ? _a : 0.7) * (1 - progress);
      const shards = Math.max(3, event.shards || 5);
      const spread = anchor.r * ((_b = event.spread) !== null && _b !== void 0 ? _b : 3.2);
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
          if (!isFiniteCoord(px) || !isFiniteCoord(py))
              continue;
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
      if (!Array.isArray(Game.vfx))
          Game.vfx = [];
      return Game.vfx;
  }
  /* ------------------- Adders ------------------- */
  function vfxAddSpawn(Game, cx, cy, side) {
      const spawn = { type: 'spawn', t0: now(), dur: 500, cx, cy, side };
      pool(Game).push(spawn);
  }
  function vfxAddHit(Game, target, opts = {}) {
      const event = { type: 'hit', t0: now(), dur: 380, ref: target, ...opts };
      pool(Game).push(event);
  }
  function vfxAddTracer(Game, attacker, target, opts = {}) {
      const dur = Number.isFinite(opts === null || opts === void 0 ? void 0 : opts.dur) ? Number(opts.dur) : 400;
      const event = { type: 'tracer', t0: now(), dur, refA: attacker, refB: target };
      pool(Game).push(event);
  }
  function vfxAddMelee(Game, attacker, target, _a) {
      var _b, _c;
      var { dur = (_c = (_b = CFG === null || CFG === void 0 ? void 0 : CFG.ANIMATION) === null || _b === void 0 ? void 0 : _b.meleeDurationMs) !== null && _c !== void 0 ? _c : 1100 } = _a === void 0 ? {} : _a;
      // Overlay step-in/out (không di chuyển token thật)
      const event = { type: 'melee', t0: now(), dur, refA: attacker, refB: target };
      pool(Game).push(event);
  }
  function makeLightningEvent(Game, source, target, opts = {}) {
      const busyMs = Number.isFinite(opts.busyMs) ? Number(opts.busyMs) : 420;
      const anchorA = resolveBindingAnchor(source, {
          anchorId: opts.anchorId,
          bindingKey: opts.bindingKey,
          timing: opts.timing,
          ambientKey: opts.ambientKey,
          radius: opts.anchorRadius
      });
      const anchorB = target
          ? resolveBindingAnchor(target, {
              anchorId: opts.targetAnchorId,
              bindingKey: opts.targetBindingKey,
              timing: opts.targetTiming,
              ambientKey: undefined,
              radius: opts.targetRadius,
          })
          : null;
      const event = {
          type: 'lightning_arc',
          t0: now(),
          dur: busyMs,
          refA: source,
          refB: target || null,
          anchorA: anchorA.id,
          anchorB: (anchorB === null || anchorB === void 0 ? void 0 : anchorB.id) || null,
          radiusA: anchorA.radius,
          radiusB: anchorB === null || anchorB === void 0 ? void 0 : anchorB.radius,
          color: opts.color,
          thickness: opts.thickness,
          jitter: opts.jitter,
          pattern: createRandomPattern(DEFAULT_SEGMENTS),
          segments: opts.segments,
          glow: opts.glow,
          glowScale: opts.glowScale,
          rayScale: opts.rayScale,
      };
      pool(Game).push(event);
      return busyMs;
  }
  function vfxAddLightningArc(Game, source, target, opts = {}) {
      return makeLightningEvent(Game, source, target, opts);
  }
  function vfxAddBloodPulse(Game, source, opts = {}) {
      const busyMs = Number.isFinite(opts.busyMs) ? Number(opts.busyMs) : 560;
      const anchor = resolveBindingAnchor(source, {
          anchorId: opts.anchorId,
          bindingKey: opts.bindingKey,
          timing: opts.timing,
          ambientKey: opts.ambientKey,
          radius: opts.anchorRadius
      });
      const event = {
          type: 'blood_pulse',
          t0: now(),
          dur: busyMs,
          refA: source,
          anchorA: anchor.id,
          radiusA: anchor.radius,
          color: opts.color,
          rings: opts.rings,
          maxScale: opts.maxScale,
          alpha: opts.alpha,
      };
      pool(Game).push(event);
      return busyMs;
  }
  function vfxAddShieldWrap(Game, source, opts = {}) {
      const busyMs = Number.isFinite(opts.busyMs) ? Number(opts.busyMs) : 900;
      const front = resolveBindingAnchor(source, {
          anchorId: opts.anchorId,
          bindingKey: opts.bindingKey,
          timing: opts.timing,
          ambientKey: undefined,
          radius: opts.anchorRadius
      });
      const wantsBack = opts.backAnchorId != null || opts.backTiming != null || Number.isFinite(opts.backRadius);
      const back = wantsBack
          ? resolveBindingAnchor(source, {
              anchorId: opts.backAnchorId,
              bindingKey: opts.bindingKey,
              timing: opts.backTiming,
              ambientKey: undefined,
              radius: opts.backRadius,
          })
          : null;
      const event = {
          type: 'shield_wrap',
          t0: now(),
          dur: busyMs,
          refA: source,
          anchorA: front.id,
          anchorB: (back === null || back === void 0 ? void 0 : back.id) || null,
          radiusA: front.radius,
          radiusB: back === null || back === void 0 ? void 0 : back.radius,
          color: opts.color,
          alpha: opts.alpha,
          thickness: opts.thickness,
          heightScale: opts.heightScale,
          widthScale: opts.widthScale,
          wobble: opts.wobble,
      };
      pool(Game).push(event);
      return busyMs;
  }
  function vfxAddGroundBurst(Game, source, opts = {}) {
      const busyMs = Number.isFinite(opts.busyMs) ? Number(opts.busyMs) : 640;
      const anchor = resolveBindingAnchor(source, {
          anchorId: opts.anchorId,
          bindingKey: opts.bindingKey,
          timing: opts.timing,
          ambientKey: undefined,
          radius: opts.anchorRadius
      });
      const event = {
          type: 'ground_burst',
          t0: now(),
          dur: busyMs,
          refA: source,
          anchorA: anchor.id,
          radiusA: anchor.radius,
          color: opts.color,
          shards: opts.shards,
          spread: opts.spread,
          alpha: opts.alpha,
      };
      pool(Game).push(event);
      return busyMs;
  }
  function drawChibiOverlay(ctx, x, y, r, facing, color) {
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
      // tay (tay trước cầm kiếm theo hướng facing)
      ctx.beginPath();
      ctx.moveTo(0, -torso * 0.6);
      ctx.lineTo(-arm * 0.8, -torso * 0.2);
      ctx.moveTo(0, -torso * 0.6);
      ctx.lineTo(arm * 0.8 * facing, -torso * 0.2);
      ctx.stroke();
      // chân
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-leg * 0.6, leg * 0.9);
      ctx.moveTo(0, 0);
      ctx.lineTo(leg * 0.6, leg * 0.9);
      ctx.stroke();
      // kiếm
      const hx = arm * 0.8 * facing;
      const hy = -torso * 0.2;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + wep * facing, hy);
      ctx.stroke();
      ctx.restore();
  }
  /* ------------------- Drawer ------------------- */
  function vfxDraw(ctx, Game, cam) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
      const list = pool(Game);
      if (!list.length || !Game.grid)
          return;
      const keep = [];
      for (const e of list) {
          const t = (now() - e.t0) / e.dur;
          const done = t >= 1;
          const tt = Math.max(0, Math.min(1, t));
          switch (e.type) {
              case 'spawn': {
                  const { cx, cy } = e;
                  if (isFiniteCoord(cx) && isFiniteCoord(cy)) {
                      const p = projectCellOblique(Game.grid, cx, cy, cam);
                      const r0 = Math.max(8, Math.floor(Game.grid.tile * 0.22 * p.scale));
                      const r = r0 + Math.floor(r0 * 1.8 * tt);
                      if (isFiniteCoord(p.x) && isFiniteCoord(p.y) && isFiniteCoord(r) && r > 0) {
                          ctx.save();
                          ctx.globalAlpha = 1 - tt;
                          ctx.strokeStyle = e.side === 'ally' ? '#9ef0a4' : '#ffb4c0';
                          ctx.lineWidth = 3;
                          ctx.beginPath();
                          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                          ctx.stroke();
                          ctx.restore();
                      }
                      else {
                          warnInvalidArc('spawn', { x: p === null || p === void 0 ? void 0 : p.x, y: p === null || p === void 0 ? void 0 : p.y, r });
                      }
                  }
                  break;
              }
              case 'hit': {
                  const tokens = Array.isArray(Game === null || Game === void 0 ? void 0 : Game.tokens) ? Game.tokens : null;
                  const updateFromToken = (token) => {
                      if (!token)
                          return;
                      if (token.iid != null && e.iid == null)
                          e.iid = token.iid;
                      if (isFiniteCoord(token.cx))
                          e.cx = token.cx;
                      if (isFiniteCoord(token.cy))
                          e.cy = token.cy;
                  };
                  const initialRef = hasFinitePoint(e.ref) ? e.ref : null;
                  updateFromToken(initialRef);
                  const lookupLiveToken = () => {
                      var _a, _b, _c;
                      if (!tokens)
                          return null;
                      if (e.iid != null) {
                          return (_a = tokens.find(t => t && t.iid === e.iid)) !== null && _a !== void 0 ? _a : null;
                      }
                      const ref = e.ref;
                      if ((ref === null || ref === void 0 ? void 0 : ref.iid) != null) {
                          return (_b = tokens.find(t => t && t.iid === ref.iid)) !== null && _b !== void 0 ? _b : null;
                      }
                      if (typeof (ref === null || ref === void 0 ? void 0 : ref.id) === 'string') {
                          return (_c = tokens.find(t => t && t.id === ref.id)) !== null && _c !== void 0 ? _c : null;
                      }
                      return null;
                  };
                  const hasCoords = isFiniteCoord(e.cx) && isFiniteCoord(e.cy);
                  if ((!hasCoords || !initialRef) && tokens) {
                      const live = lookupLiveToken();
                      if (live) {
                          e.ref = live;
                          updateFromToken(live);
                      }
                  }
                  if (isFiniteCoord(e.cx) && isFiniteCoord(e.cy)) {
                      const p = projectCellOblique(Game.grid, e.cx, e.cy, cam);
                      const r = Math.floor(Game.grid.tile * 0.25 * (0.6 + 1.1 * tt) * p.scale);
                      if (isFiniteCoord(p.x) && isFiniteCoord(p.y) && isFiniteCoord(r) && r > 0) {
                          ctx.save();
                          ctx.globalAlpha = 0.9 * (1 - tt);
                          ctx.strokeStyle = '#e6f2ff';
                          ctx.lineWidth = 2;
                          ctx.beginPath();
                          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                          ctx.stroke();
                          ctx.restore();
                      }
                      else {
                          warnInvalidArc('hit', { x: p === null || p === void 0 ? void 0 : p.x, y: p === null || p === void 0 ? void 0 : p.y, r });
                      }
                  }
                  break;
              }
              case 'tracer': {
                  // disabled: không vẽ “đường trắng” nữa
                  break;
              }
              case 'melee': {
                  const A = e.refA;
                  const B = e.refB;
                  if (A && B && A.alive && B.alive && hasFinitePoint(A) && hasFinitePoint(B)) {
                      const pa = projectCellOblique(Game.grid, (_a = A.cx) !== null && _a !== void 0 ? _a : 0, (_b = A.cy) !== null && _b !== void 0 ? _b : 0, cam);
                      const pb = projectCellOblique(Game.grid, (_c = B.cx) !== null && _c !== void 0 ? _c : 0, (_d = B.cy) !== null && _d !== void 0 ? _d : 0, cam);
                      const tN = Math.max(0, Math.min(1, (now() - e.t0) / e.dur));
                      const k = easeInOut(tN) * 0.88;
                      const mx = lerp(pa.x, pb.x, k);
                      const my = lerp(pa.y, pb.y, k);
                      const depth = Game.grid.rows - 1 - ((_e = A.cy) !== null && _e !== void 0 ? _e : 0);
                      const kDepth = (_f = cam === null || cam === void 0 ? void 0 : cam.depthScale) !== null && _f !== void 0 ? _f : 0.94;
                      const r = Math.max(6, Math.floor(Game.grid.tile * 0.36 * Math.pow(kDepth, depth)));
                      const facing = A.side === 'ally' ? 1 : -1;
                      const color = A.color || (A.side === 'ally' ? '#9adcf0' : '#ffb4c0');
                      ctx.save();
                      ctx.globalAlpha = 0.95;
                      drawChibiOverlay(ctx, mx, my, r, facing, color);
                      ctx.restore();
                  }
                  break;
              }
              case 'lightning_arc': {
                  const start = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, (_g = e.radiusA) !== null && _g !== void 0 ? _g : null, cam);
                  const end = e.refB ? computeAnchorCanvasPoint(Game, e.refB, e.anchorB, (_h = e.radiusB) !== null && _h !== void 0 ? _h : null, cam) : null;
                  if (start && (!e.refB || end)) {
                      drawLightningArc(ctx, start, end, e, tt);
                  }
                  else {
                      warnInvalidArc('lightning', { start, end });
                  }
                  break;
              }
              case 'blood_pulse': {
                  const anchor = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, (_j = e.radiusA) !== null && _j !== void 0 ? _j : null, cam);
                  if (anchor) {
                      drawBloodPulse(ctx, anchor, e, tt);
                  }
                  else {
                      warnInvalidArc('blood_pulse', { anchor });
                  }
                  break;
              }
              case 'shield_wrap': {
                  const front = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, (_k = e.radiusA) !== null && _k !== void 0 ? _k : null, cam);
                  const back = e.anchorB ? computeAnchorCanvasPoint(Game, e.refA, e.anchorB, (_l = e.radiusB) !== null && _l !== void 0 ? _l : null, cam) : null;
                  if (front) {
                      drawShieldWrap(ctx, front, back, e, tt);
                  }
                  else {
                      warnInvalidArc('shield_wrap', { front, back });
                  }
                  break;
              }
              case 'ground_burst': {
                  const anchor = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, (_m = e.radiusA) !== null && _m !== void 0 ? _m : null, cam);
                  if (anchor) {
                      drawGroundBurst(ctx, anchor, e, tt);
                  }
                  else {
                      warnInvalidArc('ground_burst', { anchor });
                  }
                  break;
              }
              default:
                  break;
          }
          if (!done)
              keep.push(e);
      }
      Game.vfx = keep;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'asSessionWithVfx')) exports.asSessionWithVfx = asSessionWithVfx;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddSpawn')) exports.vfxAddSpawn = vfxAddSpawn;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddHit')) exports.vfxAddHit = vfxAddHit;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddTracer')) exports.vfxAddTracer = vfxAddTracer;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddMelee')) exports.vfxAddMelee = vfxAddMelee;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddLightningArc')) exports.vfxAddLightningArc = vfxAddLightningArc;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddBloodPulse')) exports.vfxAddBloodPulse = vfxAddBloodPulse;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddShieldWrap')) exports.vfxAddShieldWrap = vfxAddShieldWrap;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddGroundBurst')) exports.vfxAddGroundBurst = vfxAddGroundBurst;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxDraw')) exports.vfxDraw = vfxDraw;
});
__define('./../tools/zod-stub/index.js', (exports, module, __require) => {
  const objectProto = Object.prototype;

  const ZodIssueCode = Object.freeze({
    custom: 'custom'
  });

  class ZodError extends TypeError {
    constructor(issues) {
      const firstIssue = issues[0];
      const message = formatIssueMessage(firstIssue);
      super(message);
      this.name = 'ZodError';
      this.issues = issues.map((issue) => ({
        ...issue,
        path: Array.isArray(issue.path) ? [...issue.path] : []
      }));
    }
  }

  function formatIssueMessage(issue) {
    if (!issue) {
      return 'Invalid input';
    }
    const pathSegment = Array.isArray(issue.path) && issue.path.length > 0 ? ` at ${issue.path.join('.')}` : '';
    return typeof issue.message === 'string' && issue.message.length > 0
      ? `${issue.message}${pathSegment}`
      : `Invalid input${pathSegment}`;
  }

  function normalizeIssue(issue) {
    if (!issue || typeof issue !== 'object') {
      throw new TypeError('Issue must be an object');
    }
    const normalized = { ...issue };
    normalized.path = Array.isArray(normalized.path) ? [...normalized.path] : [];
    normalized.code = normalized.code ?? ZodIssueCode.custom;
    normalized.message = typeof normalized.message === 'string' && normalized.message.length > 0
      ? normalized.message
      : 'Invalid input';
    return normalized;
  }

  function createZodError(issues) {
    const normalizedIssues = issues.map((issue) => normalizeIssue(issue));
    return new ZodError(normalizedIssues);
  }

  class ZodType {
    optional() {
      return new ZodOptional(this);
    }

    parse(value) {
      return this._parse(value);
    }

    // eslint-disable-next-line class-methods-use-this
    _parse() {
      throw new TypeError('ZodType subclasses must implement _parse');
    }
  }

  class ZodOptional extends ZodType {
    constructor(inner) {
      super();
      this.inner = inner;
    }

    _parse(value) {
      if (value === undefined) {
        return undefined;
      }
      return this.inner.parse(value);
    }
  }

  class ZodString extends ZodType {
    _parse(value) {
      if (typeof value !== 'string') {
        throw new TypeError('Expected string');
      }
      return value;
    }
  }

  class ZodNumber extends ZodType {
    _parse(value) {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new TypeError('Expected number');
      }
      return value;
    }
  }

  class ZodBoolean extends ZodType {
    _parse(value) {
      if (typeof value !== 'boolean') {
        throw new TypeError('Expected boolean');
      }
      return value;
    }
  }

  class ZodLiteral extends ZodType {
    constructor(expected) {
      super();
      this.expected = expected;
    }

    _parse(value) {
      if (value !== this.expected) {
        throw new TypeError(`Expected literal ${String(this.expected)}`);
      }
      return value;
    }
  }

  class ZodEnum extends ZodType {
    constructor(values) {
      super();
      if (!Array.isArray(values) || values.length === 0) {
        throw new TypeError('ZodEnum requires a non-empty array of values');
      }
      this.values = [...values];
      this.valueSet = new Set(this.values);
    }

    _parse(value) {
      if (typeof value !== 'string' || !this.valueSet.has(value)) {
        throw new TypeError(`Expected one of: ${this.values.join(', ')}`);
      }
      return value;
    }
  }

  class ZodArray extends ZodType {
    constructor(itemSchema) {
      super();
      this.itemSchema = itemSchema;
    }

    _parse(value) {
      if (!Array.isArray(value)) {
        throw new TypeError('Expected array');
      }
      return value.map((item) => this.itemSchema.parse(item));
    }
  }

  class ZodUnion extends ZodType {
    constructor(options) {
      super();
      if (!Array.isArray(options) || options.length === 0) {
        throw new TypeError('ZodUnion requires a non-empty array of options');
      }
      this.options = [...options];
    }

    _parse(value) {
      let lastError;
      for (const option of this.options) {
        try {
          return option.parse(value);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
        }
      }
      if (lastError) {
        throw lastError;
      }
      throw new TypeError('Invalid union: no options matched');
    }
  }

  class ZodTuple extends ZodType {
    constructor(items) {
      super();
      if (!Array.isArray(items)) {
        throw new TypeError('ZodTuple requires an array of items');
      }
      this.items = [...items];
    }

    _parse(value) {
      if (!Array.isArray(value)) {
        throw new TypeError('Expected array for tuple');
      }
      if (value.length !== this.items.length) {
        throw new TypeError(`Expected tuple of length ${this.items.length}`);
      }
      const result = new Array(this.items.length);
      for (let index = 0; index < this.items.length; index += 1) {
        result[index] = this.items[index].parse(value[index]);
      }
      return result;
    }
  }

  class ZodRecord extends ZodType {
    constructor(valueSchema) {
      super();
      this.valueSchema = valueSchema;
    }

    _parse(value) {
      if (!isPlainObject(value)) {
        throw new TypeError('Expected object for record');
      }
      const result = {};
      for (const key of Object.keys(value)) {
        result[key] = this.valueSchema.parse(value[key]);
      }
      return result;
    }
  }

  class ZodObject extends ZodType {
    constructor(shape, refiners = []) {
      super();
      this.shape = { ...shape };
      this.refiners = [...refiners];
    }

    _parse(value) {
      if (!isPlainObject(value)) {
        throw new TypeError('Expected object');
      }
      const result = { ...value };
      for (const key of Object.keys(this.shape)) {
        const schema = this.shape[key];
        const hasKey = objectProto.hasOwnProperty.call(value, key);
        const fieldValue = hasKey ? value[key] : undefined;
        if (!hasKey && !(schema instanceof ZodOptional)) {
          throw new TypeError(`Missing required key "${key}"`);
        }
        result[key] = schema.parse(fieldValue);
      }
      if (this.refiners.length > 0) {
        const issues = [];
        const ctx = {
          addIssue: (issue) => {
            issues.push(issue);
          },
          path: [],
          data: result
        };
        for (const refiner of this.refiners) {
          refiner(result, ctx);
        }
        if (issues.length > 0) {
          throw createZodError(issues);
        }
      }
      return result;
    }

    merge(other) {
      if (!(other instanceof ZodObject)) {
        throw new TypeError('ZodObject.merge expects another ZodObject');
      }
      return new ZodObject({ ...this.shape, ...other.shape }, [...this.refiners, ...other.refiners]);
    }

    superRefine(refiner) {
      if (typeof refiner !== 'function') {
        throw new TypeError('ZodObject.superRefine expects a function');
      }
      return new ZodObject(this.shape, [...this.refiners, refiner]);
    }
  }

  function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  const z = {
    string: () => new ZodString(),
    number: () => new ZodNumber(),
    boolean: () => new ZodBoolean(),
    literal: (value) => new ZodLiteral(value),
    enum: (values) => new ZodEnum(values),
    object: (shape) => new ZodObject(shape),
    array: (schema) => new ZodArray(schema),
    record: (schema) => new ZodRecord(schema),
    union: (schemas) => new ZodUnion(schemas),
    tuple: (schemas) => new ZodTuple(schemas),
    ZodIssueCode,
    ZodError,
  };

  exports.ZodType = ZodType;
  exports.ZodOptional = ZodOptional;
  exports.ZodString = ZodString;
  exports.ZodNumber = ZodNumber;
  exports.ZodBoolean = ZodBoolean;
  exports.ZodLiteral = ZodLiteral;
  exports.ZodEnum = ZodEnum;
  exports.ZodArray = ZodArray;
  exports.ZodUnion = ZodUnion;
  exports.ZodTuple = ZodTuple;
  exports.ZodRecord = ZodRecord;
  exports.ZodObject = ZodObject;
  exports.ZodIssueCode = ZodIssueCode;
  exports.ZodError = ZodError;


  if (!Object.prototype.hasOwnProperty.call(exports, 'z')) exports.z = z;
  if (!Object.prototype.hasOwnProperty.call(exports, 'default')) exports.default = z;
  module.exports.default = exports.default;
});
try {
  __require('./entry.ts');
} catch (err) {
  console.error('Failed to bootstrap Arclune bundle:', err);
  throw err;
}
