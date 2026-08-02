// Bundled by build.mjs
const __modules = Object.create(null);
const __cache = Object.create(null);
if (typeof globalThis !== "undefined" && typeof globalThis.__modules === "undefined"){ globalThis.__modules = __modules; }
const __legacyModuleAliases = {"./catalog.js":"./catalog.ts","./entry.js":"./entry.ts","./meta.js":"./meta.ts","./modes/coming-soon.stub.js":"./modes/coming-soon.stub.ts","./modes/pve/session.js":"./modes/pve/session.ts","./modes/pve/session-loop.js":"./modes/pve/session-loop.ts","./modes/pve/session-render.ts":"./modes/pve/session-render.ts","./modes/pve/session-render.js":"./modes/pve/session-render.ts","./modes/pve/session-render/index.js":"./modes/pve/session-render.ts","./modes/pve/session-events.ts":"./modes/pve/session-events.ts","./modes/pve/session-events.js":"./modes/pve/session-events.ts","./modes/pve/session-events/index.js":"./modes/pve/session-events.ts","./modes/pve/session-events/index.ts":"./modes/pve/session-events.ts","./modes/pve/session-deck.ts":"./modes/pve/session-deck.ts","./modes/pve/session-deck.js":"./modes/pve/session-deck.ts","./modes/pve/session-deck/index.js":"./modes/pve/session-deck.ts","./screens/collection/index.js":"./screens/collection/index.ts","./screens/arena-hub/index.js":"./screens/arena-hub/index.ts","./screens/campaign-world-map/index.js":"./screens/campaign-world-map/index.ts","./screens/monopoly/index.js":"./screens/monopoly/index.ts","./screens/gacha/view.js":"./screens/gacha/view.ts","./screens/lineup/index.js":"./screens/lineup/index.ts","./screens/ui-gacha/index.js":"./screens/ui-gacha/index.ts","./screens/vinh-da/gameplay.js":"./screens/vinh-da/gameplay.ts","./screens/ui-gacha/gacha.js":"./screens/ui-gacha/gacha.ts","@modes/coming-soon.stub.ts":"./modes/coming-soon.stub.ts","@modes/pve/session.ts":"./modes/pve/session.ts","@modes/pve/session-loop":"./modes/pve/session-loop.ts","@modes/pve/session-loop.js":"./modes/pve/session-loop.ts","@modes/pve/session-loop.ts":"./modes/pve/session-loop.ts","@modes/pve/session-render":"./modes/pve/session-render.ts","@modes/pve/session-render.js":"./modes/pve/session-render.ts","@modes/pve/session-render.ts":"./modes/pve/session-render.ts","@modes/pve/session-render/index.js":"./modes/pve/session-render.ts","@modes/pve/session-render/index.ts":"./modes/pve/session-render.ts","@modes/pve/session-events":"./modes/pve/session-events.ts","@modes/pve/session-events.js":"./modes/pve/session-events.ts","@modes/pve/session-events.ts":"./modes/pve/session-events.ts","@modes/pve/session-events/index.js":"./modes/pve/session-events.ts","@modes/pve/session-events/index.ts":"./modes/pve/session-events.ts","@modes/pve/session-deck":"./modes/pve/session-deck.ts","@modes/pve/session-deck.js":"./modes/pve/session-deck.ts","@modes/pve/session-deck.ts":"./modes/pve/session-deck.ts","@modes/pve/session-deck/index.js":"./modes/pve/session-deck.ts","@modes/pve/session-deck/index.ts":"./modes/pve/session-deck.ts","@screens/gacha/view.js":"./screens/gacha/view.ts","@screens/gacha/view.ts":"./screens/gacha/view.ts","@screens/arena-hub/index.ts":"./screens/arena-hub/index.ts","@screens/campaign-world-map/index.ts":"./screens/campaign-world-map/index.ts","@screens/monopoly/index.ts":"./screens/monopoly/index.ts","@screens/vinh-da/gameplay.ts":"./screens/vinh-da/gameplay.ts","@screens/monopoly/ready.ts":"./screens/monopoly/ready.ts","@screens/chess-strategy-rpg/ready.ts":"./screens/chess-strategy-rpg/ready.ts","@screens/chess-strategy-rpg/battle.ts":"./screens/chess-strategy-rpg/battle.ts","@screens/chess-strategy-rpg/match.ts":"./screens/chess-strategy-rpg/match.ts","@screens/chess-strategy-rpg/seed.ts":"./screens/chess-strategy-rpg/seed.ts","@screens/chess-strategy-rpg/turn-state.ts":"./screens/chess-strategy-rpg/turn-state.ts","./screens/chess-strategy-rpg/seed.js":"./screens/chess-strategy-rpg/seed.ts","./screens/chess-strategy-rpg/turn-state.js":"./screens/chess-strategy-rpg/turn-state.ts","./combat/chap-minh-runtime.js":"./combat/chap-minh-runtime.ts","./combat/number-utils.js":"./combat/number-utils.ts","./combat/tag-aliases.js":"./combat/tag-aliases.ts","./combat/status-utils.js":"./combat/status-utils.ts","./combat/skill-result.js":"./combat/skill-result.ts","./combat/skill-metadata-utils.js":"./combat/skill-metadata-utils.ts","./combat/token-side-utils.js":"./combat/token-side-utils.ts","./combat/board-position-utils.js":"./combat/board-position-utils.ts","./combat/unit-runtime-hooks.js":"./combat/unit-runtime-hooks.ts","./combat/runtime-hooks/nguyen-le.js":"./combat/runtime-hooks/nguyen-le.ts","./combat/runtime-hooks/duong-ha.js":"./combat/runtime-hooks/duong-ha.ts","./combat/runtime-hooks/duong-ha.ts":"./combat/runtime-hooks/duong-ha.ts","@combat/runtime-hooks/duong-ha":"./combat/runtime-hooks/duong-ha.ts","@combat/runtime-hooks/duong-ha.ts":"./combat/runtime-hooks/duong-ha.ts","@combat/runtime-hooks/duong-ha.js":"./combat/runtime-hooks/duong-ha.ts","./combat/runtime-hooks/co-truong-phong.js":"./combat/runtime-hooks/co-truong-phong.ts","./combat/runtime-hooks/co-truong-phong.ts":"./combat/runtime-hooks/co-truong-phong.ts","@combat/runtime-hooks/co-truong-phong":"./combat/runtime-hooks/co-truong-phong.ts","@combat/runtime-hooks/co-truong-phong.ts":"./combat/runtime-hooks/co-truong-phong.ts","@combat/runtime-hooks/co-truong-phong.js":"./combat/runtime-hooks/co-truong-phong.ts","./combat/runtime-hooks/registry.js":"./combat/runtime-hooks/registry.ts","./modes/pve/ly-thanh-thu-runtime.js":"./modes/pve/ly-thanh-thu-runtime.ts","./modes/pve/nguyen-le-runtime.js":"./modes/pve/nguyen-le-runtime.ts","@screens/collection/index.ts":"./screens/collection/index.ts","@screens/lineup/index.ts":"./screens/lineup/index.ts","@screens/ui-gacha/index.ts":"./screens/ui-gacha/index.ts","./aether.js":"./aether.ts","./ai.js":"./ai.ts","./app/shell.js":"./app/shell.ts","./art.js":"./art.ts","./background.js":"./background.ts","./combat.js":"./combat.ts","./combat/apply-damage.js":"./combat/apply-damage.ts","./combat/calculate-final-damage.js":"./combat/calculate-final-damage.ts","./combat/counter-matrix.js":"./combat/counter-matrix.ts","./combat/perform-active-skill.js":"./combat/perform-active-skill.ts","./combat/runtime-hooks/ly-thanh-thu.js":"./combat/runtime-hooks/ly-thanh-thu.ts","./combat/runtime-hooks/mong-yem.js":"./combat/runtime-hooks/mong-yem.ts","./combat/runtime-hooks/types.js":"./combat/runtime-hooks/types.ts","./combat/tag-dispatch.js":"./combat/tag-dispatch.ts","./config.js":"./config.ts","./config/schema.js":"./config/schema.ts","./cultivation.js":"./cultivation.ts","./data/campaign-stages.js":"./data/campaign-stages.ts","./data/cost-budget.js":"./data/cost-budget.ts","./data/economy.config.js":"./data/economy.config.ts","./data/economy.js":"./data/economy.ts","./data/load-config.js":"./data/load-config.ts","./data/modes.js":"./data/modes.ts","./data/roster-preview.config.js":"./data/roster-preview.config.ts","./data/roster-preview.js":"./data/roster-preview.ts","./data/skills.config.js":"./data/skills.config.ts","./data/skills.js":"./data/skills.ts","./data/tags.js":"./data/tags.ts","./data/vfx_anchors/schema.js":"./data/vfx_anchors/schema.ts","./engine.js":"./engine.ts","./events.js":"./events.ts","./leader-uyen.js":"./leader-uyen.ts","./main.js":"./main.ts","./modes/pve/chap-minh-runtime.js":"./modes/pve/chap-minh-runtime.ts","./modes/pve/collection-mapper.js":"./modes/pve/collection-mapper.ts","./modes/pve/creep-builder.js":"./modes/pve/creep-builder.ts","./modes/pve/session-runtime-impl.js":"./modes/pve/session-runtime-impl.ts","./modes/pve/session-runtime.js":"./modes/pve/session-runtime.ts","./modes/pve/session-state.js":"./modes/pve/session-state.ts","./modes/pve/unit-runtime-hooks.js":"./modes/pve/unit-runtime-hooks.ts","./passives.js":"./passives.ts","./scene.js":"./scene.ts","./screens/chess-strategy-rpg/battle.js":"./screens/chess-strategy-rpg/battle.ts","./screens/chess-strategy-rpg/match.js":"./screens/chess-strategy-rpg/match.ts","./screens/chess-strategy-rpg/ready.js":"./screens/chess-strategy-rpg/ready.ts","./screens/collection/helpers.js":"./screens/collection/helpers.ts","./screens/collection/state.js":"./screens/collection/state.ts","./screens/collection/types.js":"./screens/collection/types.ts","./screens/collection/view.js":"./screens/collection/view.ts","./screens/lineup/view/events.js":"./screens/lineup/view/events.ts","./screens/lineup/view/index.js":"./screens/lineup/view/index.ts","./screens/lineup/view/render.js":"./screens/lineup/view/render.ts","./screens/lineup/view/state.js":"./screens/lineup/view/state.ts","./screens/main-menu/dialogues.js":"./screens/main-menu/dialogues.ts","./screens/main-menu/types.js":"./screens/main-menu/types.ts","./screens/main-menu/view/events.js":"./screens/main-menu/view/events.ts","./screens/main-menu/view/index.js":"./screens/main-menu/view/index.ts","./screens/main-menu/view/layout.js":"./screens/main-menu/view/layout.ts","./screens/monopoly/house-module.js":"./screens/monopoly/house-module.ts","./screens/monopoly/ready.js":"./screens/monopoly/ready.ts","./screens/sect/index.js":"./screens/sect/index.ts","./screens/sect/tactical-ai.js":"./screens/sect/tactical-ai.ts","./screens/ui-gacha/logic/config.js":"./screens/ui-gacha/logic/config.ts","./screens/ui-gacha/logic/currency.js":"./screens/ui-gacha/logic/currency.ts","./screens/ui-gacha/logic/gacha.js":"./screens/ui-gacha/logic/gacha.ts","./screens/ui-gacha/logic/pity.js":"./screens/ui-gacha/logic/pity.ts","./screens/ui-gacha/logic/pool.js":"./screens/ui-gacha/logic/pool.ts","./screens/ui-gacha/logic/types.js":"./screens/ui-gacha/logic/types.ts","./screens/vinh-da/combat/prefixes.js":"./screens/vinh-da/combat/prefixes.ts","./screens/vinh-da/constants.js":"./screens/vinh-da/constants.ts","./screens/vinh-da/economy/balanceChecks.js":"./screens/vinh-da/economy/balanceChecks.ts","./screens/vinh-da/economy/conversion.js":"./screens/vinh-da/economy/conversion.ts","./screens/vinh-da/economy/dropTables.js":"./screens/vinh-da/economy/dropTables.ts","./screens/vinh-da/economy/merchant.js":"./screens/vinh-da/economy/merchant.ts","./screens/vinh-da/economy/resources.js":"./screens/vinh-da/economy/resources.ts","./screens/vinh-da/economy/settlement.js":"./screens/vinh-da/economy/settlement.ts","./screens/vinh-da/elemental-regions.js":"./screens/vinh-da/elemental-regions.ts","./screens/vinh-da/enemies.js":"./screens/vinh-da/enemies.ts","./screens/vinh-da/map-modules.js":"./screens/vinh-da/map-modules.ts","./screens/vinh-da/simulation.js":"./screens/vinh-da/simulation.ts","./screens/vinh-da/structures.js":"./screens/vinh-da/structures.ts","./screens/vinh-da/types.js":"./screens/vinh-da/types.ts","./shared-types/units.js":"./shared-types/units.ts","./statuses.js":"./statuses.ts","./summon.js":"./summon.ts","./turns.js":"./turns.ts","./turns/interleaved.js":"./turns/interleaved.ts","./types/art.js":"./types/art.ts","./types/combat.js":"./types/combat.ts","./types/common.js":"./types/common.ts","./types/config.js":"./types/config.ts","./types/currency.js":"./types/currency.ts","./types/index.js":"./types/index.ts","./types/lineup.js":"./types/lineup.ts","./types/pve.js":"./types/pve.ts","./types/rng.js":"./types/rng.ts","./types/telemetry.js":"./types/telemetry.ts","./types/turn-order.js":"./types/turn-order.ts","./types/ui.js":"./types/ui.ts","./types/units.js":"./types/units.ts","./types/utils.js":"./types/utils.ts","./types/vfx.js":"./types/vfx.ts","./ui.js":"./ui.ts","./ui/dom.js":"./ui/dom.ts","./unit-stat-resolver.js":"./unit-stat-resolver.ts","./units.js":"./units.ts","./utils/assert.js":"./utils/assert.ts","./utils/audio-settings.js":"./utils/audio-settings.ts","./utils/currency.js":"./utils/currency.ts","./utils/domain-normalization.js":"./utils/domain-normalization.ts","./utils/dummy.js":"./utils/dummy.ts","./utils/equipment.js":"./utils/equipment.ts","./utils/format.js":"./utils/format.ts","./utils/frame-rate.js":"./utils/frame-rate.ts","./utils/fury.js":"./utils/fury.ts","./utils/kit.js":"./utils/kit.ts","./utils/module-resolution.js":"./utils/module-resolution.ts","./utils/player-profile.js":"./utils/player-profile.ts","./utils/profile-progress-merge.js":"./utils/profile-progress-merge.ts","./utils/rarity.js":"./utils/rarity.ts","./utils/rng.js":"./utils/rng.ts","./utils/time.js":"./utils/time.ts","./utils/unique-global.js":"./utils/unique-global.ts","./utils/unit-id.js":"./utils/unit-id.ts","./vfx.js":"./vfx.ts"};
if (typeof globalThis !== "undefined" && typeof globalThis.__legacyModuleAliases === "undefined"){ globalThis.__legacyModuleAliases = __legacyModuleAliases; }
const __emptyAliases = Object.keys(__legacyModuleAliases).length === 0;
function __require(id){
  let moduleId = id;
  if (!__emptyAliases){
    const aliased = __legacyModuleAliases[moduleId];
    if (aliased) moduleId = aliased;
  }
  const cached = __cache[moduleId];
  if (cached) return cached.exports;
  const factory = __modules[moduleId];
  if (!factory) throw new Error('Module not found: ' + moduleId);
  const module = { exports: {} };
  __cache[moduleId] = module;
  factory(module.exports, module, __require);
  return module.exports;
}
if (typeof globalThis !== "undefined" && typeof globalThis.__moduleCache === "undefined"){ globalThis.__moduleCache = __cache; }
if (typeof globalThis !== "undefined" && typeof globalThis.__require === "undefined"){ globalThis.__require = __require; }
__modules['./aether.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/aether.ts

   // Import type chuẩn
};
__modules['./ai.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/ai.ts
  const __dep0 = __require('./engine.ts');
  const pickRandom = __dep0.pickRandom;
  const slotToCell = __dep0.slotToCell;
  const cellReserved = __dep0.cellReserved;
  const __dep1 = __require('./config.ts');
  const CFG = __dep1.CFG;
  const __dep2 = __require('./utils/time.ts');
  const safeNow = __dep2.safeNow;
  const __dep3 = __require('./utils/kit.ts');
  const detectUltBehavior = __dep3.detectUltBehavior;
  const getSummonSpec = __dep3.getSummonSpec;
  const resolveSummonSlots = __dep3.resolveSummonSlots;
  const __dep4 = __require('./units.ts');
  const lookupUnit = __dep4.lookupUnit;
  const __dep5 = __require('./aether.ts');
  const globalAetherPool = __dep5.globalAetherPool;
  const __dep6 = __require('./leader-uyen.ts');
  const isUyenLeader = __dep6.isUyenLeader;
  const isAnyLeaderUltReady = __dep6.isAnyLeaderUltReady;
  const __dep7 = __require('./turns/interleaved.ts');
  const predictSpawnCycleByTurnOrder = __dep7.predictSpawnCycleByTurnOrder;
  const __dep8 = __require('./shared-types/units.ts');
  const createSummonQueue = __dep8.createSummonQueue;
  function ensureEnemyQueue(Game){
    const candidate= Game.queued.enemy;
    if (isSummonQueue(candidate)) {
      return candidate;
    }
    const created = createSummonQueue();
    Game.queued.enemy = created;
    return created;
  }

  function refillDeckEnemy(Game){
    const deck = getDeck(Game);
    const handSize = CFG.HAND_SIZE ?? 4;
    const need = handSize - deck.length;
    if (need <= 0) return;

    const exclude = new Set();
    const usedIds = ensureUsedUnitIds(Game);
    for (const id of usedIds) exclude.add(String(id));
    for (const card of deck) exclude.add(String(card.id));

    const pool= Game.ai.unitsAll;
    const more = pickRandom(pool, exclude, handSize).slice(0, need);
    const normalized= [];
    for (const entry of more) {
      const card = normalizeDeckEntry(entry);
      if (card) normalized.push(card);
    }
    if (!normalized.length) return;
    deck.push(...normalized);
  }

  function queueEnemyAt(
    Game,
    card,
    slot,
    cx,
    cy,
    aliveTokens?,
  ){
    const cost = Number.isFinite(card.cost) ? card.cost : NaN;
    if (!Number.isFinite(cost) || Game.ai.cost < cost) return false;
    if (Game.ai.summoned >= Game.ai.summonLimit) return false;
    const alive = Array.isArray(aliveTokens) ? aliveTokens : tokensAlive(Game);
    if (cellReserved(alive, Game.queued, cx, cy)) return false;
    const queue = ensureEnemyQueue(Game);
    if (queue.has(slot)) return false;

    const spawnCycle = predictSpawnCycleByTurnOrder(Game, 'enemy', slot);

    queue.set(slot, {
      unitId: card.id,
      name=== 'string' ? card.name : undefined,
      side,
      cx,
      cy,
      slot,
      spawnCycle,
      color,
      class=== 'string' && card.class.trim() ? card.class : undefined,
      source,
      mutationBonusPct) ? Number(card.mutationBonusPct) 
      mutationDebuffPool: Array.isArray(card.mutationDebuffPool)
        ? card.mutationDebuffPool.filter((id)=> id === 'bleed' || id === 'stun' || id === 'poison')
        
      statOverrides: card.statOverrides && typeof card.statOverrides === 'object' && !Array.isArray(card.statOverrides)
        ? { ...(card.statOverrides /* as Record<string */, unknown>) }
        
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

  function aiMaybeAct(Game, reason){
    const now = safeNow();
    const cfgInterval = Number(CFG.AI?.THINK_INTERVAL_MS);
    const minThinkInterval = Number.isFinite(cfgInterval)
      ? Math.max(60, Math.floor(cfgInterval))
      === 'board' ? 220 : 140);
    if (now - (Game.ai.lastThinkMs || 0) < minThinkInterval) return;
    const weights = mergedWeights();
    const dbgCfg = debugConfig();

    const deck = getDeck(Game);
    const hand = deck.filter((c) => Number.isFinite(c.cost) && Game.ai.cost >= c.cost);
    if (!hand.length) {
      const decision= {
        reason,
        at,
        weights,
        chosen,
        considered,
        skipped,
      };
      Game.ai.lastDecision = decision;
      Game.ai.lastThinkMs = now;
      return;
    }

    const { alive, allies, enemies= partitionAliveTokensBySide(Game);
    const allyPressure = buildAllyRowPressure(aliveAllies);
    const rowFactorByCy = buildEnemyRowCrowding(Game, aliveEnemies);

    const cells = listEmptyEnemySlots(Game, alive);
    if (!cells.length) {
      const decision= {
        reason,
        at,
        weights,
        chosen,
        considered,
        skipped,
      };
      Game.ai.lastDecision = decision;
      Game.ai.lastThinkMs = now;
      return;
    }

    const keepTop = dbgCfg.keepTop;
    const trackTopCandidates = keepTop > 0;
    const topCandidates= [];
    let bestCandidate= null;
    const etaBySlot = new Map();
    const cellBaseScoreBySlot = new Map();
    const summonerFeasibilityByCardSlot = new Map();
    const summonPatternSlotsByCardSlot = new Map();
    const summonSpecByCard = new Map();
    const roleFactorByClassAndX = new Map();

    const insertTopCandidate = trackTopCandidates
      ? (entry)=> {
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
      ;
    for (const card of hand) {
      const meta = toMetaEntry(Game.meta.get(card.id));
      const summonSpec = meta?.class === 'Summoner'
        ? (summonSpecByCard.get(card.id) ?? (() => {
            const next = getSummonSpec(meta);
            summonSpecByCard.set(card.id, next);
            return next;
          })())
        ;
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
        const summonKey = `${card.id}{cell.s}`;
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
          ;

        const kitInstantScore = kitTraits.hasInstant ? base.eta : 0;
        const kitDefenseScore = kitTraits.hasDefBuff ? 1 - base.safety : 0;
        const kitReviveScore = kitTraits.hasRevive ? base.safety : 0;

        const contributions= {
          pressure: (weights.pressure ?? 0) * base.pressure,
          safety) * base.safety,
          eta) * base.eta,
          summon) * sf,
          kitInstant) * kitInstantScore,
          kitDefense) * kitDefenseScore,
          kitRevive) * kitReviveScore,
        };

        const baseScore =
          contributions.pressure +
          contributions.safety +
          contributions.eta +
          contributions.summon +
          contributions.kitInstant +
          contributions.kitDefense +
          contributions.kitRevive;
        const roleFactorKey = `${meta?.class ?? ''}{cell.cx}`;
        const roleFactor = roleFactorByClassAndX.get(roleFactorKey) ?? (() => {
          const next = roleBias(meta?.class, cell.cx);
          roleFactorByClassAndX.set(roleFactorKey, next);
          return next;
        })();
        const finalScore = baseScore * base.rowFactor * roleFactor;

        const evaluation= {
          card,
          meta,
          summonSpec,
          cell,
          score,
          baseScore,
          contributions,
          raw,
            safety,
            eta,
            summon,
            kitInstant,
            kitDefense,
            kitRevive,
          },
          multipliers, role,
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
      const decision= {
        reason,
        at,
        weights,
        chosen,
        considered,
        skipped,
      };
      Game.ai.lastDecision = decision;
      Game.ai.lastThinkMs = now;
      return;
    }

    const selectedCandidate = bestCandidate;
    let chosen= selectedCandidate;
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

    const considered = trackTopCandidates ? topCandidates.map(exportCandidateDebug).filter(Boolean) ;

    const decision= {
      reason,
      at,
      weights,
      chosen),
      considered,
      skipped,
    };
    Game.ai.lastDecision = decision;
    Game.ai.lastThinkMs = now;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'refillDeckEnemy')) exports.refillDeckEnemy = refillDeckEnemy;
  if (!Object.prototype.hasOwnProperty.call(exports, 'queueEnemyAt')) exports.queueEnemyAt = queueEnemyAt;
  if (!Object.prototype.hasOwnProperty.call(exports, 'aiMaybeAct')) exports.aiMaybeAct = aiMaybeAct;
};
__modules['./app/shell.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/app/shell.ts
};
__modules['./art.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/art.tsextends Omit<UnitArtSprite, 'key'> {
    key: string;
  }

  function svgData(width, height, body){
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  function sanitizeId(base, palette){
    const seed = `${palette.primary || ''}${palette.secondary || ''}${palette.accent || ''}`.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    return `${base}${seed}` || `${base}0`;
  }

  const DEFAULT_PALETTE= {
    primary: '#7fa6c0',
    secondary,
    accent,
    outline,
  };

  function normalizePalette(palette){
    if (!palette) {
      return { ...DEFAULT_PALETTE };
    }
    return {
      primary: palette.primary ?? DEFAULT_PALETTE.primary,
      secondary,
      accent,
      outline,
    } /* satisfies UnitArtPalette */;
  }

  function svgShield(paletteInput){
    const palette = normalizePalette(paletteInput);
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

  function svgWing(paletteInput){
    const palette = normalizePalette(paletteInput);
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

  function svgRune(paletteInput){
    const palette = normalizePalette(paletteInput);
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

  function svgBloom(paletteInput){
    const palette = normalizePalette(paletteInput);
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

  function svgPike(paletteInput){
    const palette = normalizePalette(paletteInput);
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

  function svgSentinel(paletteInput){
    const palette = normalizePalette(paletteInput);
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

  const SPRITES=> string> = {
    shield: svgShield,
    wing,
    rune,
    bloom,
    pike,
    sentinel, unknown>>(target, source){
    return Object.assign({}, target, source ?? {});
  }

  const UNIT_SKIN_SELECTION= new Map();

  function hasArtEntry(key){
    return Object.prototype.hasOwnProperty.call(UNIT_ART, key);
  }

  function getArtEntry(key){
    const fallback = UNIT_ART.default /* as UnitArtDefinition */;
    if (hasArtEntry(key)){
      const entry = UNIT_ART[key];
      return entry ?? fallback;
    }
    return fallback;
  }

  function getBaseArt(id){
    const fallback = UNIT_ART.default /* as UnitArtDefinition */;
    if (!id) return fallback;
    if (hasArtEntry(id)){
      const baseArt = UNIT_ART[id];
      return baseArt ?? fallback;
    }
    if (id.endsWith('_minion')){
      if (hasArtEntry('minion')){
        return getArtEntry('minion');
      }
    }
    return fallback;
  }

  function resolveSkinKey(id, baseArt, explicit?){
    if (!baseArt) return null;
    if (explicit && baseArt.skins[explicit]) return explicit;
    const idKey = id ?? '';
    const override = UNIT_SKIN_SELECTION.get(idKey);
    if (override && baseArt.skins[override]) return override;
    if (baseArt.defaultSkin && baseArt.skins[baseArt.defaultSkin]) return baseArt.defaultSkin;
    const keys = Object.keys(baseArt.skins ?? {});
    return keys[0] || null;
  }

  function cloneShadowConfig(shadow){
    if (!shadow) return null;
    return {
      color: shadow.color,
      blur,
      offsetX,
      offsetY,
    } /* satisfies UnitArtShadowConfig */;
  }

  function cloneShadow(shadow){
    if (shadow === null || shadow === undefined) return null;
    if (typeof shadow === 'string') return shadow;
    return cloneShadowConfig(shadow);
  }

  function cloneSpriteEntry(sprite, fallbackKey){
    if (!sprite) return null;
    const preferredKey =
      typeof sprite.key === 'string' && sprite.key.length > 0
        ? sprite.key
        : typeof fallbackKey === 'string' && fallbackKey.length > 0
          ? fallbackKey
          : 'default';
    const cloned= {
      ...sprite,
      key,
      aspect,
      shadow),
      skinId,
      cacheKey,
    };
    return cloned;
  }

  function instantiateArt(
    _id,
    baseArt,
    skinKey,
  ){
    if (!baseArt) return null;
    
    const normalizedSkinKey = skinKey ?? baseArt.defaultSkin ?? null;
    const clonedSkins= {};
    for (const [key, sprite] of Object.entries(baseArt.skins ?? {})) {
      const clone = cloneSpriteEntry(sprite, key);
      if (clone) clonedSkins[key] = clone;
    }

    const sourceSprite = normalizedSkinKey && baseArt.skins
      ? baseArt.skins[normalizedSkinKey] ?? baseArt.sprite
      : baseArt.sprite;
    const selectedSprite = cloneSpriteEntry(sourceSprite, normalizedSkinKey);
    
    const art= {
      ...baseArt,
      sprite,
      skins,
      defaultSkin,
      palette),
      shape,
      size,
      shadow),
      glow,
      mirror,
      layout,
      label=== false ? false : { ...baseArt.label },
      hpBar,
      skinKey,
    };
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
    if (!unitId) return null;
    const baseArt = getBaseArt(unitId);
    if (!baseArt) return null;
    const override = UNIT_SKIN_SELECTION.get(unitId);
    if (override && baseArt.skins[override]) return override;
    if (baseArt.defaultSkin && baseArt.skins[baseArt.defaultSkin]) return baseArt.defaultSkin;
    const keys = Object.keys(baseArt.skins ?? {});
    return keys[0] || null;
  }

  function normalizeShadow(
    shadow,
    fallback,
  ){
    if (shadow === null) return null;
    const base= {
      color: 'rgba(0,0,0,0.35)',
      blur,
      offsetX,
      offsetY,
    };

    const fallbackColor =
      typeof fallback === 'string'
        ? fallback
        : fallback && typeof fallback === 'object'
          ? fallback.color ?? null
          : null;
    if (fallbackColor) {
      base.color = fallbackColor;
    }

    if (typeof shadow === 'string') {
      return { ...base, color=== 'object') {
      return {
        color: shadow.color ?? base.color,
        blur) ? (shadow.blur /* as number */) 
        offsetX: Number.isFinite(shadow.offsetX) ? (shadow.offsetX /* as number */) 
        offsetY: Number.isFinite(shadow.offsetY) ? (shadow.offsetY /* as number */) 
      };
    }
    if (fallback && typeof fallback === 'object') {
      return {
        color: fallback.color ?? base.color,
        blur) ? (fallback.blur /* as number */) 
        offsetX: Number.isFinite(fallback.offsetX) ? (fallback.offsetX /* as number */) 
        offsetY: Number.isFinite(fallback.offsetY) ? (fallback.offsetY /* as number */) 
      };
    }
    return { ...base };
  }

  function normalizeSpriteEntry(
    conf,
    context,
  ){
    if (!conf) return null;
    const input = typeof conf === 'string' ? { src: conf } ;
    const srcCandidate = input.src ?? input.url ?? null;
    if (!srcCandidate) return null;
    const normalizedShadow = normalizeShadow(
      (input /* as Record<string */, unknown>).shadow /* as UnitArtShadow | undefined */,
      context.shadow,
    );
    return {
      src: srcCandidate,
      anchor) ? (input.anchor /* as number */) 
      scale: Number.isFinite(input.scale) ? (input.scale /* as number */) 
      aspect: Number.isFinite(input.aspect) ? (input.aspect /* as number */) 
      shadow: normalizedShadow,
      skinId=== 'string'
          ? input.skinId
          : typeof input.key === 'string'
            ? input.key
            : typeof (input /* as Record<string */, unknown>).id === 'string'
              ? ((input /* as Record<string */, unknown>).id /* as string */)
              
      cacheKey: typeof input.cacheKey === 'string' ? input.cacheKey : null,
    };
  }

  function makeArt(pattern, paletteInput, opts= {}){
    const normalizedPalette = normalizePalette(paletteInput);
    const spriteFactory = opts.spriteFactory ?? (pattern in SPRITES ? SPRITES[pattern] ;
    const layout = merge(
      {
        anchor: 0.78,
        labelOffset,
        labelFont,
        hpOffset,
        hpWidth,
        hpHeight,
        spriteAspect,
        spriteHeight,
      },
      (opts.layout ?? undefined) /* as Partial<UnitArtLayout> */,
    );
    const label =
      opts.label === false
        ? false
        : merge(
            {
              bg: 'rgba(12,20,30,0.82)',
              text,
              stroke,255,255,0.08)',
            },
            opts.label ?? undefined,
          );
    const hpBar = merge(
      {
        bg: 'rgba(9,14,21,0.74)',
        fill,
        border,0,0,0.55)',
      },
      (opts.hpBar ?? undefined) /* as Partial<UnitArtHpBar> */,
    );
    const shadow = opts.shadow ?? 'rgba(0,0,0,0.35)';

    const defaultSkinKey = opts.defaultSkin || 'default';
    const skinsInput = opts.skins ?? (opts.sprite ? { [defaultSkinKey];
    const normalizedSkins= {};
    const anchor = layout.anchor ?? 0.78;
    if (skinsInput) {
      for (const [key, conf] of Object.entries(skinsInput)) {
        const normalized = normalizeSpriteEntry(conf, { anchor, shadow });
        if (!normalized) continue;
        const sprite = {
          ...normalized,
          key,
          skinId=== 'string' ? normalized.skinId : key,
        }as UnitArtSprite;
        normalizedSkins[key] = sprite;
      }
    } else if (opts.sprite !== null && spriteFactory) {
      const generated = normalizeSpriteEntry({ src: spriteFactory(normalizedPalette) }, { anchor, shadow });
      if (generated) {
        const sprite = {
          ...generated,
          key,
          skinId=== 'string' ? generated.skinId : defaultSkinKey,
        }as UnitArtSprite;
        normalizedSkins[defaultSkinKey] = sprite;
      }
    }

    const preferredKey = normalizedSkins[defaultSkinKey]
      ? defaultSkinKey
      : Object.keys(normalizedSkins)[0] || defaultSkinKey;

    return {
      sprite: normalizedSkins[preferredKey] ?? null,
      skins,
      defaultSkin,
      palette,
      shape,
      size,
      shadow,
      glow,
      mirror,
      layout,
      label,
      hpBar,
    } /* satisfies UnitArtDefinition */;
  }

  const basePalettes= {
    default:   { primary:'#7fa6c0', secondary, accent, outline,
    leaderA, secondary, accent, outline,
    leaderB, secondary, accent, outline,
    phe, secondary, accent, outline,
    mong_yem, secondary, accent, outline,
    chan_nga, secondary, accent, outline,
    ma_ton, secondary, accent, outline,
    mo_da, secondary, accent, outline,
    ngao_binh, secondary, accent, outline,
    laukhac, secondary, accent, outline,
    kiem, secondary, accent, outline,
    loithien, secondary, accent, outline,
    laky, secondary, accent, outline,
    kydieu, secondary, accent, outline,
    doanminh, secondary, accent, outline,
    chapminh, secondary, accent, outline,
    tranquat, secondary, accent, outline,
    linhgac, secondary, accent, outline,
    minion, secondary, accent, outline){
    const palette = basePalettes[name];
    const fallback = basePalettes.default /* as UnitArtPalette */;
    return palette ?? fallback;
  }

  const UNIT_ART= {
    default: makeArt('sentinel', getBasePalette('default'), {
      layout: { labelOffset: 1.1, hpOffset, spriteAspect,
      skins,
          anchor,
          scale,
          aspect,
          shadow,28,38,0.55)', blur, offsetX, offsetY),
    leaderA, getBasePalette('leaderA'), {
      layout: { labelOffset: 1.24, hpOffset, hpWidth, spriteAspect,
      label, bg,30,44,0.88)' },
      hpBar,
      skins,
          anchor,
          scale,
          aspect,
          shadow,62,84,0.6)', blur, offsetX, offsetY,
        ascendant,
          anchor,
          scale,
          aspect,
          shadow,112,138,0.58)', blur, offsetX, offsetY),
    leaderB, getBasePalette('leaderB'), {
      layout: { labelOffset: 1.3, hpOffset, hpWidth, spriteAspect,
      label, bg,16,24,0.88)' },
      hpBar,
      skins,
          anchor,
          scale,
          aspect,
          shadow,16,28,0.6)', blur, offsetX, offsetY,
        nightfall,
          anchor,
          scale,
          aspect,
          shadow,12,44,0.6)', blur, offsetX, offsetY),
    mong_yem, getBasePalette('mong_yem'), {
      layout: { labelOffset: 1.18, hpOffset,
      skins,
          anchor,
          scale,
          aspect,
          shadow,16,42,0.58)', blur, offsetX, offsetY),
    chan_nga, getBasePalette('chan_nga'), {
      layout: { labelOffset: 1.16, hpOffset,
      skins,
          anchor,
          scale,
          aspect,
          shadow,40,46,0.58)', blur, offsetX, offsetY),
    ma_ton_diep_lam, getBasePalette('ma_ton'), {
      layout: { labelOffset: 1.2, hpOffset,
      skins,
          anchor,
          scale,
          aspect,
          shadow,18,22,0.6)', blur, offsetX, offsetY),
    mo_da, getBasePalette('mo_da'), {
      layout: { labelOffset: 1.14, hpOffset,
      skins,
          anchor,
          scale,
          aspect,
          shadow,12,22,0.6)', blur, offsetX, offsetY),
    ngao_binh, getBasePalette('ngao_binh'), {
      layout: { labelOffset: 1.2, hpOffset,
      skins,
          anchor,
          scale,
          aspect,
          shadow,32,44,0.6)', blur, offsetX, offsetY),
    lau_khac_ma_chu, getBasePalette('laukhac'), {
      layout: { labelOffset: 1.22, hpOffset,
      skins,
          anchor,
          scale,
          aspect,
          shadow,28,44,0.6)', blur, offsetX, offsetY),
    phe, getBasePalette('phe'), {
      layout: { labelOffset: 1.2, hpOffset, spriteAspect,
      hpBar,
      skins,
          anchor,
          scale,
          aspect,
          shadow,20,68,0.55)', blur, offsetX, offsetY),
    kiemtruongda, getBasePalette('kiem'), {
      layout: { labelOffset: 1.22, hpOffset, spriteAspect,
      hpBar,
      skins,
          anchor,
          scale,
          aspect,
          shadow,32,14,0.58)', blur, offsetX, offsetY),
    loithienanh, getBasePalette('loithien'), {
      layout: { labelOffset: 1.18, hpOffset, spriteAspect,
      hpBar,
      skins,
          anchor,
          scale,
          aspect,
          shadow,52,70,0.55)', blur, offsetX, offsetY),
    huyen_vu_chap_minh, getBasePalette('chapminh'), {
      layout: { labelOffset: 1.2, hpOffset, spriteAspect,
      hpBar,
      skins,
          anchor,
          scale,
          aspect,
          shadow,44,20,0.58)', blur, offsetX, offsetY),
    laky, getBasePalette('laky'), {
      layout: { labelOffset: 1.18, hpOffset, spriteAspect,
      hpBar,
      skins,
          anchor,
          scale,
          aspect,
          shadow,34,82,0.55)', blur, offsetX, offsetY),
    kydieu, getBasePalette('kydieu'), {
      layout: { labelOffset: 1.16, hpOffset, spriteAspect,
      hpBar,
      skins,
          anchor,
          scale,
          aspect,
          shadow,78,70,0.55)', blur, offsetX, offsetY),
    doanminh, getBasePalette('doanminh'), {
      layout: { labelOffset: 1.26, hpOffset, spriteAspect,
      hpBar,
      skins,
          anchor,
          scale,
          aspect,
          shadow,36,14,0.58)', blur, offsetX, offsetY),
    tranquat, getBasePalette('tranquat'), {
      layout: { labelOffset: 1.18, hpOffset, spriteAspect,
      hpBar,
      skins,
          anchor,
          scale,
          aspect,
          shadow,60,88,0.55)', blur, offsetX, offsetY),
    linhgac, getBasePalette('linhgac'), {
      layout: { labelOffset: 1.16, hpOffset, spriteAspect,
      hpBar,
      skins,
          anchor,
          scale,
          aspect,
          shadow,54,76,0.55)', blur, offsetX, offsetY),
    minion, getBasePalette('minion'), {
      layout: { labelOffset: 1.08, hpOffset, hpWidth, hpHeight, spriteAspect,
      label,
      hpBar,
      skins,
          anchor,
          scale,
          aspect,
          shadow,42,20,0.58)', blur, offsetX, offsetY)
  };

  function getUnitArt(id, opts= {}){
    const baseArt = getBaseArt(id);
    const skinKey = resolveSkinKey(id, baseArt, opts.skinKey ?? null);
    return instantiateArt(id, baseArt, skinKey);
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'UNIT_ART')) exports.UNIT_ART = UNIT_ART;
  if (!Object.prototype.hasOwnProperty.call(exports, 'setUnitSkin')) exports.setUnitSkin = setUnitSkin;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getUnitSkin')) exports.getUnitSkin = getUnitSkin;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getUnitArt')) exports.getUnitArt = getUnitArt;
};
__modules['./background.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/background.ts
  const __dep0 = __require('./config.ts');
  const CFG = __dep0.CFG;
  const __dep1 = __require('./engine.ts');
  const ensureSpriteLoaded = __dep1.ensureSpriteLoaded;
  const projectCellOblique = __dep1.projectCellOblique;
  const __dep2 = __require('./utils/format.ts');
  const stableStringify = __dep2.stableStringify;

  const ENVIRONMENT_SPRITE_CACHE = new Map();

  function ensureEnvironmentSprite(asset){
    if (!asset) return null;
    const cached = ENVIRONMENT_SPRITE_CACHE.get(asset);
    if (cached !== undefined) return cached;
    const descriptor = {
      sprite: {
        src: asset,
        key,
        anchor,
        scale,
        aspect,
        shadow,
        skinId,
        cacheKey,
      },
    } /* as EnsureSpriteArg */;
    const entry = ensureSpriteLoaded(descriptor) ?? null;
    ENVIRONMENT_SPRITE_CACHE.set(asset, entry);
    return entry;
  }
};
__modules['./catalog.ts'] = (exports, module, __require) => {
  // @ts-check
  //home (termux)/arclune_lane_7x3/src/catalog.ts
  // 1) Rank multiplier (đơn giản) — chỉ áp lên nhóm stat được scale theo rank
  const __dep0 = __require('./utils/kit.ts');
  const kitSupportsSummon = __dep0.kitSupportsSummon;
  const __dep1 = __require('./utils/domain-normalization.ts');
  const normalizeClassName = __dep1.normalizeClassName;extends Omit<UnitKitConfig, 'ult' | 'onSpawn' | 'passives' | 'traits'>,
      UnknownRecord {
    onSpawn: UnknownRecord | null;
    basic: UnknownRecord | null;
    skills: ReadonlyArray<UnknownRecord> | null;
    ult: UnknownRecord | null;
    talent: UnknownRecord | null;
    technique: UnknownRecord | null;
    passives: ReadonlyArray<UnknownRecord> | null;
    traits: ReadonlyArray<UnknownRecord> | null;
  }


  };

  const asUnknownRecord = (value)=> value;

  const asUnknownRecordArray = (
    value,
  )=> value;

  const DEFAULT_ON_SPAWN = Object.freeze({
    rage: 100,
    exceptLeader,
  } /* satisfies Readonly<UnknownRecord>) */;

  const createOnSpawn = (overrides= {})=> (
    asUnknownRecord({ ...DEFAULT_ON_SPAWN, ...overrides })
  );

  const isObjectLike = (value)=> (
    !!value && typeof value === 'object' && !Array.isArray(value)
  );

  const asUnitKitConfig = (value)=> (
    isObjectLike(value) ? (value /* as UnitKitConfig */) 
  );

  const RANK_MULT = {
    N: 0.80,
    R,
    SR,
    SSR,
    UR,
    Prime,
  } /* satisfies Readonly<Record<'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'Prime' */, number>>;



  const RANK_SCALED_STATS = [
    'HP',
    'ATK',
    'WIL',
    'ARM',
    'RES',
    'HPregen',
  ] /* /* as const */ /* satisfies ReadonlyArray<keyof CatalogStatBlock> */ */;

  const RANK_SCALED_STAT_SET= new Set(RANK_SCALED_STATS);

  const isRankScaledStat = (stat)=> (
    RANK_SCALED_STAT_SET.has(stat /* as keyof CatalogStatBlock */)
  );

  function getRankMultiplier(rank, bonus= 0){
    return (RANK_MULT[rank] ?? 1) + bonus;
  }

  function getRankStatMultiplier(
    stat,
    rank,
    bonus= 0,
  ){
    return isRankScaledStat(stat) ? getRankMultiplier(rank, bonus) ;
  }

  function scaleStatByRank(
    stat,
    value,
    rank,
    bonus= 0,
  ){
    return value * getRankStatMultiplier(stat, rank, bonus);
  }

  // AGI/PER tạm thời không chịu rank multiplier để chờ cân bằng riêng.
  // SPD/AEmax/AEregen cũng không scale theo rank.

  // 2) Class base (mốc lv1 để test). Chỉ RANK_SCALED_STATS chịu rank multiplier.
  const CLASS_BASE = {
    Mage:     { HP:740, ATK, WIL, ARM, RES, AGI, PER, SPD, AEmax, AEregen, HPregen,
    Tanker, ATK, WIL, ARM, RES, AGI, PER, SPD, AEmax, AEregen, HPregen,
    Ranger, ATK, WIL, ARM, RES, AGI, PER, SPD, AEmax, AEregen, HPregen,
    Warrior, ATK, WIL, ARM, RES, AGI, PER, SPD, AEmax, AEregen, HPregen,
    Summoner, ATK, WIL, ARM, RES, AGI, PER, SPD, AEmax, AEregen, HPregen,
    Support, ATK, WIL, ARM, RES, AGI, PER, SPD, AEmax, AEregen, HPregen,
    Assassin, ATK, WIL, ARM, RES, AGI, PER, SPD, AEmax, AEregen, HPregen, CatalogStatBlock>>;



  const isRankName = (value)=> value in RANK_MULT;
  const isClassName = (value)=> normalizeClassName(value) !== null;

  // 3) Helper: áp rank & mod
  function applyRankAndMods(
    base,
    rank,
    mods, number>> = {},
  ){
    const out= { ...base };
    const keys = Object.keys(base) /* as Array<keyof CatalogStatBlock> */;
    for (const key of keys){
      const baseValue = base[key] ?? 0;
      const mod = 1 + (mods?.[key] ?? 0);
      const precision = (key === 'ARM' || key === 'RES' || key === 'SPD') ? 100 : (key === 'AEregen' ? 10 : 1);
      out[key] = Math.round(scaleStatByRank(key, baseValue * mod, rank) * precision) / precision;
    }
    return out;
  }

  // 4) Roster (dex/meta) — 8 nhân vật, ngân sách mod bằng nhau (~+20% tổng, không đụng SPD)
  //  - onSpawn.rage: 100 cho mọi unit từ deck (trừ leader). Revive không áp quy tắc này.
  //  - kit.traits.summon / kit.ult.summon đánh dấu Summoner -> kích hoạt Immediate Summon (action-chain).
  const ROSTER = [
    {
      id: 'thien_luu', name, class, rank,  base_element,
      mods, PER, SPD,
      kit),
        basic,
          tags, 'flying'],
          damageMultiplier,
          bonus,
          notes, +15% chính xác khi mục tiêu đang chịu debuff thời tiết.'
        }),
        skills,
            name,
            cost,
            duration,
            weatherShift,
            buffStats,
            notes,
          {
            key: 'skill2',
            name,
            cost,
            hits,
            targets,
            damageMultiplier,
            bonusDamageIfWeather, amount,
            notes, mỗi luồng 75% sát thương; nếu đang Bão, mỗi hit thêm 20% sát thương.'
          },
          {
            key: 'skill3',
            name,
            cost,
            duration,
            flying,
            dodgeRanged,
            grantAlly, targets,
            notes, tăng 35% né đòn tầm xa và cấp 18% lá chắn Max HP cho 1 đồng minh bất kỳ.'
          }
        ]),
        ult,
          weatherShift,
          damageMultiplier,
          aoe,
          debuffs, amount, turns,
          alliesBuff, turns,
          notes, giảm 20% chính xác của chúng trong 2 lượt và ban +20% tỉ lệ chí mạng cho đồng minh.'
        }),
        talent,
          weatherCycle, 'storm', 'aurora'],
          bonusPerWeather,
            storm,
            aurora),
        technique,
        passives,
            name,
            when,
            effect,
            params, expiresAfter),
        traits, text,
          { id: 'svg_weather', text, bổ sung tia sét quanh áo choàng trong suốt.' }
        ])
      }
    },
    {
      id: 'duong_ha', name, class, rank, base_element,
      mods, WIL, AGI,
      followupCap,
      elementTag,
      kit),
        basic,
          tags,
          damageMultiplier,
          notes),
        skills,
            name,
            cost,
            tags, 'single-target', 'rule'],
            notes,
          {
            key: 'skill2',
            name,
            cost,
            tags, 'single-target', 'pierce', 'rule'],
            cooldown,
            notes)
          },
          {
            key: 'skill3',
            name,
            cost,
            tags, 'self-buff'],
            cooldown,
            duration,
            buffStats, WIL, AGI,
            notes),
        ult,
          tags, 'single-target'],
          notes),
        talent,
          notes),
        technique,
        passives),
        traits, text,
          { id: 'wild_unit', text)
      }
    },
    {
      id: 'mong_yem', name, class, rank,
      mods, AEregen,
      kit),
        basic,
          tags, 'sleep-setup'],
          debuff, stacks, maxStacks, purgeable),
        skills,
            name,
            cost,
            duration,
            selfBuff,
            notes).'
          },
          {
            key: 'skill2',
            name,
            cost,
            duration,
            delayTurns,
            selfSleep,
            reduceDamage,
            perTurnBuffStats, WIL,
            notes,
          {
            key: 'skill3',
            name,
            cost,
            damageMultiplier,
            bonusPerMark, amount, max,
            pierceIfSleeping, RES,
            spreadMark, stacks, targets,
            notes, bỏ qua 30% ARM/RES và lan 1 tầng Mê Hoặc sang tối đa 2 kẻ địch khác.'
          }
        ]),
        ult,
          duration,
          randomBuffs, enemies,
          notes),
        talent,
          mark,
            kind,
            maxStacks,
            purgeable,
            onCap,
            decayIfNoRefreshTurns),
        technique,
        passives,
            name,
            when,
            effect,
            params,
              stacks,
              maxStacks,
              purgeable,
              sleepTurnsOnCap),
        traits, text, mục tiêu ngủ 1 lượt rồi đặt lại về 0 tầng.' },
          { id: 'uncleansable_marks', text,
          { id: 'self_sleep_control', text)
      }
    },
    {
      id: 'chan_nga', name, class, rank,
      mods, WIL,
      kit),
        basic,
          tags),
        skills,
            name,
            cost,
            healSelfPercentMaxHP,
            healClonePercentMaxHP,
            notes, 4% cho clone nếu tồn tại.'
          },
          {
            key: 'skill2',
            name,
            cost,
            duration,
            buffStats, WIL,
            appliesToClone,
            notes,
          {
            key: 'skill3',
            name,
            cost,
            cooldown,
            requiresCloneAdjacent,
            shieldPercentMaxHP,
            duration,
            burstBuff, WIL, turns,
            notes, hợp nhất để nhận khiên = 50% Max HP trong 3 lượt và +15% ATK/WIL trong 2 lượt.'
          }
        ]),
        ult,
          conditions, minHpPercent,
          summon,
            inheritPercent,
            forbiddenSkills,
            ttl,
            locksUlt,
            rageLocked,
          hpTradePercentCurrent,
          notes, không thể dùng Quy Nhất Bản Ảnh, không tích nộ.'
        }),
        talent,
          cloneSnapshotPercent,
          cloneTtlTurns,
          postDeathTransfer, debuff, turns, aetherRegen, lockUlt),
        technique,
        passives,
            name,
            when,
            effect,
            params,
              ttl,
              forbiddenSkills,
              rageLocked),
        traits, text,
          { id: 'doat_xa', text, đoạt xá vào clone và chịu Linh Mệt 3 lượt (khóa Ultimate, -50% hồi Aether).' }
        ])
      }
    },
    {
      id: 'ma_ton_diep_lam', name, class, rank,  base_element,
      mods, AEmax,
      kit),
        basic,
          tags, 'mark-builder'],
          debuff, stacks, purgeable),
        skills,
            name,
            cost,
            consumeMarks, scope,
            bonusPerMark, amount,
            notes, mỗi tầng chuyển thành +5% Max HP vĩnh viễn (tối đa +100% Max HP), đồng thời hồi lượng HP tương ứng.'
          },
          {
            key: 'skill2',
            name,
            cost,
            requiresTotalMarks, amount,
            stance,
            notes, thu hồi Ma Chủng trên một mục tiêu để hoá Ma Chủ. Từ đây mở khóa Ultimate dạng Ma Chủ (Thiên Ma Độc Tôn) và mọi Ma Chủng cấy tiếp gây thêm +2% sát thương cuối dạng Thuật.'
          },
          {
            key: 'skill3',
            name,
            cost,
            countsAsBasic,
            hits,
            damageMultiplier,
            priorityTarget,
            splash, maxTargets,
            notes, mỗi lần lan 70% sát thương sang tối đa 2 kẻ địch lân cận.'
          }
        ]),
        ult,
          forms,
              type,
              consumesMarks,
            maChu,
              type,
              damageMultiplier,
              consumesMarks,
              benefitsFromMarkConversion,
          aoe,
          markId,
          damagePerMark, scaleWIL,
          debuffPerThreshold, effects, turns, { id: 'bleed', turns,
          notes, mỗi tầng gây 5% Max HP của mục tiêu dưới dạng sát thương WIL. Mỗi 2 tầng áp Sợ Hãi và Chảy Máu 1 lượt; Ma Chủng bị tiêu hao.'
        }),
        talent,
          mark,
            kind,
            maxStacks,
            purgeable,
            decayIfNoRefreshTurns),
        technique,
        passives,
            name,
            when,
            effect,
            params, stacks, purgeable, decayIfNoRefreshTurns,
          {
            id: 'ma_chu_bonus',
            name,
            when,
            effect,
            params, amount, type, stance),
        traits, text,
          { id: 'ma_chu_ult_swap', text, Tuyệt kỹ được đổi sang Thiên Ma Độc Tôn và không tiêu hao Ma Chủng.' }
        ])
      }
    },
    {
      id: 'vu_thien', name, class, rank,
      mods, ATK, WIL,
      kit),
        basic,
          tags,
          damageMultiplier,
          notes, đòn đánh thường hồi 10% sát thương gây ra.'
        }),
        skills,
            name,
            cost,
            duration,
            buffStats, WIL,
            notes, thích hợp mở chuỗi burst.'
          },
          {
            key: 'skill2',
            name,
            cost,
            damageMultiplier,
            tags,
            notes,
          {
            key: 'skill3',
            name,
            cost,
            immediate,
            persistsUntilDeath,
            counterChance,
            dodgeBasicChance,
            counterType,
            notes, không tiêu tốn lượt hành động.'
          }
        ]),
        ult,
          tags,
          damageMultiplier,
          debuffs, turns,
          selfBuff, turns,
          notes, đặt Trầm Mặc 1 lượt và cấp 1 tầng Thích Ứng (+10% RES vĩnh viễn) cho bản thân.'
        }),
        talent,
        technique,
        passives,
            name,
            when,
            effect,
            params, WIL, stackable),
        traits, text,
          { id: 'counter_free_action', text), không tiêu tốn lượt đánh.' },
          { id: 'adaptive_buff', text)
      }
    },
    {
      id: 'anna', name, class, rank,  base_element,
      mods, WIL, AEmax,
      kit),
        basic,
          tags, 'basic-attack', 'heal', 'random-target'],
          damageMultiplier,
          healRandomAllyPercentMaxHP,
          notes).'
        }),
        skills,
            name,
            cost,
            tags, 'defense', 'aether-cost'],
            duration,
            buffStats, RES,
            notes,
          {
            key: 'skill2',
            name,
            cost,
            tags, 'aether-cost', 'non-heal-hp-change'],
            hpSacrificePercentMax,
            transferToLeader,
            minHpPercentToCast,
            notes) cho Leader, chỉ dùng khi HP ≥ 70%.'
          },
          {
            key: 'skill3',
            name,
            cost,
            targets,
            damageMultiplier,
            tags, 'random-target', 'aether-cost'],
            notes, mỗi mục tiêu nhận 140% đòn đánh thường.'
          }
        ]),
        ult,
          tags, 'global-rule'],
          healPercentMaxHP,
          healScale, WIL,
          affects,
          notes, sau đó kích hoạt nội tại Ấn Chú Thăng Hoa.'
        }),
        talent,
          tags, 'self', 'support'],
          stacks,
          perStack, atk, wil,
          trigger),
        technique,
        passives,
            name,
            when,
            effect,
            params, atk, wil, maxStacks),
        traits, text,
          { id: 'auto_cast_ult', text)
      }
    },
    {
      id: 'lao_khat_cai', name, class, rank,
      mods, AGI,
      kit),
        basic,
          tags,
          damageMultiplier,
          notes),
        skills,
            name,
            cost,
            countsAsBasic,
            damageMultiplier,
            pierce, RES,
            notes, bỏ qua 15% ARM/RES.'
          },
          {
            key: 'skill2',
            name,
            cost,
            duration,
            oneTime,
            evadeAoEChance,
            reposition,
            notes,
          {
            key: 'skill3',
            name,
            cost,
            hits,
            randomTargets,
            countsAsBasic,
            damageMultiplier,
            pierce, RES,
            notes, mỗi hit bỏ qua 20% ARM/RES.'
          }
        ]),
        ult,
          tags,
          damageMultiplier,
          pierce, RES,
          notes),
        talent,
        technique,
        passives,
            name,
            when,
            effect,
            params, perAllyStats, WIL, AGI),
        traits, text,
          { id: 'aoe_escape', text)
      }
    },
    {
      id: 'ai_lan', name, class, rank,
      mods, AEregen, HP,
      kit),
        basic,
          tags,
          damageMultiplier,
          debuffs, amount, turns, whenStance,
          pierce, RES, whenStance,
          bonus,
          notes),
        skills,
            name,
            cost,
            usableIn, 'dark'],
            transferHp, toRandomAllyPercentMax,
            shields, percentCasterMaxHP, turns,
              { target: 'randomAlly', percentCasterMaxHP, turns,
            notes, đồng thời cấp khiên =10% Max HP bản thân trong 2 lượt.'
          },
          {
            key: 'skill2',
            name,
            cost,
            usableIn,
            pattern,
            damageMultiplier,
            tags,
            notes, không tính là đòn đánh thường.'
          },
          {
            key: 'skill3',
            name,
            cost,
            usableIn,
            healSelfScale, WIL,
            healRandomAllyScale, WIL,
            notes),
        ult,
          light,
            healTargets,
            healPercentMaxHP,
            healScale, WIL,
          dark,
            targets,
            damageMultiplier,
            countsAsBasic,
          notes, Bóng Tối gây sát thương lên 4 kẻ địch ngẫu nhiên.'
        }),
        talent,
          stanceCycle, 'dark'],
          turnOrder,
          lightEffects, agiDownPercent,
          darkEffects),
        technique,
        passives,
            name,
            when,
            effect,
            params, 'dark'], start),
        traits, text,
          { id: 'dual_ult', text)
      }
    },
    {
      id: 'faun', name, class, rank,
      mods, AEregen, HP,
      kit),
        basic,
          tags,
          damageMultiplier,
          notes),
        skills,
            name,
            cost,
            chainAttack,
            summonFollowUp,
            notes, không tiêu lượt hiện tại.'
          },
          {
            key: 'skill2',
            name,
            cost,
            empoweredSummons, inheritPercent,
            notes,
          {
            key: 'skill3',
            name,
            cost,
            healSelfPercentMaxHP,
            gainTenacity,
            deathTrigger, preferMarked,
            notes).' 
          }
        ]),
        ult,
          summon, inheritPercent, ttl, traits, tag,
              { id: 'faun_tieu_bach', inheritPercent, ttl, traits, tag,
              { id: 'faun_tieu_hoang', inheritPercent, ttl, traits, tag,
              { id: 'faun_tieu_bat_diem', inheritPercent, ttl, traits, basicDealsDamage, tag,
              { id: 'faun_nhi_cau', inheritPercent, ttl, traits, 'periodic_taunt'], basicDealsDamage, tag,
            limit,
            uniquePerType,
          summonPool, inheritPercent, ttl, traits, tag,
            { id: 'faun_tieu_bach', inheritPercent, ttl, traits, tag,
            { id: 'faun_tieu_hoang', inheritPercent, ttl, traits, tag,
            { id: 'faun_tieu_bat_diem', inheritPercent, ttl, traits, basicDealsDamage, tag,
            { id: 'faun_nhi_cau', inheritPercent, ttl, traits, 'periodic_taunt'], basicDealsDamage, tag,
          limit,
          uniquePerType,
          notes, mỗi loại tồn tại tối đa 5 lượt và không trùng lặp.'
        }),
        talent,
          perSummonStats, ATK, WIL, ARM, RES, AEregen, AEmax,
          maxStacks),
        technique,
        passives,
            name,
            when,
            effect,
            params, ATK, WIL, ARM, RES, AEregen, AEmax, maxStacks,
          {
            id: 'faun_beast_resist',
            name,
            when,
            effect,
            params, amount),
        traits, text,
          { id: 'rage_cap', text)
      }
    },
    {
      id: 'basil_thorne', name, class, rank,
      mods, ARM, RES,
      kit),
        basic,
          tags,
          damageMultiplier,
          notes),
        skills,
            name,
            cost,
            convertDebuff, stat, amountPerStack,
            removeDebuff, scope,
            notes,5% Max HP cho Basil rồi xóa toàn bộ Độc.'
          },
          {
            key: 'skill2',
            name,
            cost,
            duration,
            sacrificeMaxHPPercent,
            reflectDamage,
            notes,
          {
            key: 'skill3',
            name,
            cost,
            countsAsBasic,
            hits,
            damageMultiplier,
            tags,
            notes),
        ult,
          tags,
          duration,
          taunt,
          buffStats, RES,
          notes),
        talent,
          mark, maxStacks, purgeable),
        technique,
        passives,
            name,
            when,
            effect,
            params, stacks, maxStacksPerTarget, perTurnLimit),
        traits, text,
          { id: 'reflect_cost', text, khiên không chặn được chi phí.' }
        ])
      }
    },
    {
      id: 'mo_da', name, class, rank,
      mods, WIL,
      kit),
        basic,
          tags),
        skills,
            name,
            cost,
            duration,
            buffStats, WIL,
            maxStacks,
          {
            key: 'skill2',
            name,
            cost,
            hpTradePercentCurrent,
            duration,
            buffStats, WIL,
            maxStacks,
            notes), cộng dồn tối đa 2 lần nếu tái kích hoạt khi hiệu ứng còn.'
          },
          {
            key: 'skill3',
            name,
            cost,
            countsAsBasic,
            damageMultiplier),
        ult,
          countsAsBasic,
          untargetable, turns,
          pierce, RES,
          damageMultiplier,
          target,
          executeBelowPercentHP,
          buffs, turns, { id: 'tan_sat', turns,
          notes, bỏ qua 30% ARM/RES, kết liễu mục tiêu dưới 10% HP và nhận hiệu ứng Bất Khuất + Tàn Sát trong 2 lượt; miễn bị chỉ định bởi đòn đơn trong 2 lượt.'
        }),
        talent,
          conditional,
            stats,
            elseStats, RES),
        technique,
        passives,
            name,
            when,
            effect,
            params, WIL, elseARM, elseRES, purgeable),
        traits, text,
          { id: 'sleep_proof', text, Mộ Dạ vẫn có thể thực thi đòn đánh thường dù đang không thể bị chọn bởi đòn đơn.' }
        ])
      }
    },
    {
      id: 'ngao_binh', name, class, rank,
      mods, ATK,
      kit),
        basic,
          tags, 'form-scaling'],
          hits,
          piercePercent,
          damageModifiersByForm,
            thanh_nien,
            truong_thanh,
            long_than, splash),
        skills,
            name,
            cost,
            countsAsBasic,
            hits,
            damageMultiplier,
          {
            key: 'skill2',
            name,
            cost,
            hpTradePercentMaxHP,
            duration,
            selfDebuff, ARM,
            basicDamageBonus,
            notes,
          {
            key: 'skill3',
            name,
            cost,
            countsAsBasic,
            damageMultiplier,
            splash, thanh_nien, truong_thanh, long_than, maxTargets),
        ult,
          sequence,
              cocoonTurns,
              reduceDamage,
              postBuffs, reduceDamageTaken, agi, hpRegenPercentMaxHP,
            {
              form: 'truong_thanh',
              cocoonTurns,
              reduceDamage,
              postBuffs, reduceDamageTaken, agi, hpRegenPercentMaxHP,
            {
              form: 'long_than',
              cocoonTurns,
              reduceDamage,
              postBuffs, reduceDamageTaken, agi, hpRegenPercentMaxHP, basicTransforms,
          rageBonusPerBreak,
          primeAwakenAtCast,
          longUyAura, activeFromForm,
          notes, Ngao Bính hóa trứng 1 lượt (không thể tấn công, giảm sát thương nhận theo cấp) rồi phá xác nâng trạng thái. Sau 3 lần tiến hóa thành Long Thần sẽ nhận aura Long Uy giảm 10% ATK kẻ địch đánh vào mình; từ lần cast thứ 4 bỏ qua trạng thái trứng, phun lửa toàn sân và thức tỉnh Prime.'
        }),
        talent,
          forms, damageTakenReduce, agi, hpRegenPercentMaxHP,
            thanh_nien, damageTakenReduce, agi, hpRegenPercentMaxHP,
            truong_thanh, damageTakenReduce, agi, hpRegenPercentMaxHP,
            long_than, damageTakenReduce, agi, hpRegenPercentMaxHP),
        technique,
        passives,
            name,
            when,
            effect,
            params,
                thanh_nien,
                truong_thanh,
                long_than),
        traits, text,
          { id: 'egg_turn', text, Ngao Bính không thể tấn công nhưng giảm sát thương nhận tùy cấp.' }
        ])
      }
    },
    {
      id: 'lau_khac_ma_chu', name, class, rank,
      tags,
      mods, AEregen,
      kit),
        basic,
          tags, 'mark-builder'],
          debuff, stacks, maxStacks, purgeable),
        skills,
            name,
            cost,
            hits,
            countsAsBasic,
            damageMultiplier,
            targets,
            notes, mỗi hit 100% sát thương đòn đánh thường và đặt Sa Ấn.'
          },
          {
            key: 'skill2',
            name,
            cost,
            duration,
            delayTurns,
            markBonus, extraStacks,
            notes, mỗi đòn đánh thường/kỹ năng áp 2 tầng Sa Ấn thay vì 1.'
          },
          {
            key: 'skill3',
            name,
            cost,
            hits,
            countsAsBasic,
            damageMultiplier,
            targets,
            notes, mỗi hit 100% sát thương đòn đánh thường và đặt Sa Ấn.'
          }
        ]),
        ult,
          randomOutcome,
          outcomes,
              notes, HP, buff/debuff; đơn vị mới triệu hồi trong lượt hiện tại quay về deck và hoàn cost).'
            },
            thuan,
              notes, mọi đồng minh lập tức thực thi 1 lượt đánh thường.'
            }
          },
          notes).'
        }),
        talent,
          mark,
            kind,
            maxStacks,
            purgeable,
            onCap),
        technique,
        passives,
            name,
            when,
            effect,
            params, stacks, maxStacks, purgeable, skipTurnOnCap),
        traits, text,
          { id: 'time_rift', text)
      }
    },
    {
      id: 'blood_avatar', name, class, rank,
      tags,
      mods, WIL,
      kit),
        basic,
          tags, 'mark', 'basic-attack'],
          damageMultiplier,
          damageScale, 'ATK'],
          debuff, stacks, maxStacks, purgeable,
          bonusIfTargetHasDebuff, amount),
        skills,
            name,
            cost,
            tags, 'aoe', 'aether-cost', 'mark'],
            aoe,
            maxTargets,
            damageMultiplier,
            applies, turns, kind,
              { id: 'huyet_an', stacks, maxStacks, kind, purgeable,
            notes), mỗi mục tiêu nhận 140% sát thương đòn đánh thường, bị Chảy Máu 2 lượt và nhận 1 tầng Huyết Ấn.'
          },
          {
            key: 'skill2',
            name,
            cost,
            tags, 'field', 'silence', 'global-rule'],
            limit,
            duration,
            field,
              anchor,
              effects,
                allies, mode,
            punishment,
              checkMark, stacksGte,
              apply, turns, oncePerTargetDuringField,
            overlapRule, enemyField,
          {
            key: 'skill3',
            name,
            cost,
            tags, 'self', 'aether-cost', 'instant', 'support'],
            trueCost,
            instant,
            grantAether, amount,
            notes),
        ult,
          tags, 'aoe', 'execute', 'mark'],
          trigger,
          aoe,
          damageMultiplier,
          execute, hpPercentLte,
            bypass,
          postEffect, stacks, maxStacks, to,
          notes).'
        }),
        talent,
          tags, 'revive'],
          axiom,
            immuneExternalDebuff,
            allowDirectHealing,
            allowResourceChange,
            forbidExternalRevive,
            divineConflict,
          bloodFeast,
            amountPercentMaxHP,
            capPercentMaxHP,
            resetOnBattleEnd,
          bloodCoreFailsafe,
            excludesDotKills,
            trigger,
            oncePerBattle,
            setHPTo,
            consumeBonusMaxHPFrom,
          mark,
            kind,
            maxStacks,
            purgeable,
            threshold,
              amplifyDamageTakenFrom, 'execute'],
              amount,
              enablesSkill2Silence),
        technique,
        passives,
            name,
            when,
            effect,
            params, amount, cap, resetOnBattleEnd,
          {
            id: 'blood_core_failsafe',
            name,
            when,
            effect,
            params, excludesDotKills, consumeGrowthStack, oncePerBattle),
        traits, text,
          { id: 'mark_execute_synergy', text)
      }
    },
    {
      id: 'phe', name, class, rank,
      mods, AEregen, // 20% tổng
      kit: {
        onSpawn: createOnSpawn(),
        basic,
          tags, 'lifesteal', 'mark'],
          lifesteal,
          mark,
            maxStacks,
            ttlTurns,
            perTurnLimit,
            explosion, scaleWIL),
        skills,
            name,
            cost,
            hits,
            countsAsBasic,
            targets,
            damageMultiplier,
            notes, làm mới thời hạn Phệ Ấn và tôn trọng trần 2 Ấn / mục tiêu / lượt.'
          },
          {
            key: 'skill2',
            name,
            cost,
            duration,
            reduceDamage,
            healPercentMaxHPPerTurn,
            untargetable,
            damageDealtModifier,
            notes,
          {
            key: 'skill3',
            name,
            cost,
            duration,
            link, maxLinks,
            notes),
        ult,
          countsAsBasic,
          aoe,
          hpDrainPercentCurrent,
          damageScaleWIL,
          healSelfFromTotal,
          healAlliesFromTotal, targets,
          overhealShieldCap,
          selfBuff, amount, turns,
          marksPerTarget,
          notes).' 
        }),
        talent,
          id,
          maxStacks,
          ttlTurns,
          perTurnLimit,
          explosion, trigger,
          decayIfNoRefreshTurns,
          blessing, hpRegen),
        technique,
        passives,
            name,
            when,
            effect,
            params,
              ttlTurns,
              dmgFromWIL,
              perTargetPerTurn,
              purgeable,
              decayIfNoRefreshTurns),
        traits, text,
          { id: 'overheal_cap', text,
          { id: 'link_limit', text)
      }
    },
    {
      id: 'kiemtruongda', name, class, rank,
      mods, PER,
      kit),
        basic,
          tags, 'armor-pierce'],
          piercePercent),
        skills,
            name,
            cost,
            countsAsBasic,
            targets,
            damageMultiplier,
          {
            key: 'skill2',
            name,
            cost,
            duration,
            randomStance, 'Kiếm Ma', 'Kiếm Thổ', 'Kiếm Hỏa', 'Kiếm Hư']
          },
          {
            key: 'skill3',
            name,
            cost,
            delayTurns,
            duration,
            buffStats, WIL,
            notes),
        ult,
          countsAsBasic,
          hits,
          penRES,
          bonusVsLeader,
          targets),
        talent,
          scaling, WIL, basedOn),
        technique,
        passives,
            name,
            when,
            effect,
            params, duration, stack, purgeable,
          {
            id: 'wil_on_ult',
            name,
            when,
            effect,
            params, duration, stack, purgeable),
        traits, text,
          { id: 'refine_delay', text,
          { id: 'ult_scaling', text)
      }
    },
    {
      id: 'loithienanh', name, class, rank,  base_element,
      mods, WIL,
      kit),
        basic,
          hits,
          tags, 'spd-debuff'],
          debuff, amount, maxStacks),
        skills,
            name,
            cost,
            hits,
            countsAsBasic,
            targets,
            damageMultiplier,
            bonusIfAdjacent,
            notes,
          {
            key: 'skill2',
            name,
            cost,
            hpTradePercent,
            hits,
            targets,
            damageMultiplier,
            notes,
          {
            key: 'skill3',
            name,
            cost,
            bonusMaxHPBase,
            limitUses),
        ult,
          countsAsBasic,
          hpTradePercent,
          hits,
          damage, bossPercent, scaleWIL,
          reduceDmg,
          duration,
          appliesDebuff, amount, maxStacks,
          notes, tối thiểu còn 1 HP; mỗi hit tính là đòn đánh thường và cộng tầng giảm SPD.'
        }),
        talent,
          conditional,
            stats, RES,
            elseStats, WIL),
        technique,
        passives,
            name,
            when,
            effect,
            params, RES, ARM, elseATK, elseWIL, purgeable),
        traits, text).' },
          { id: 'spd_burn', text,
          { id: 'body_fortify_lock', text)
      }
    },
    {
      id: 'huyen_vu_chap_minh', name, class, rank,  base_element,
      mods, ARM, RES,
      kit),
        basic,
          tags,
          range,
          damageMultiplier,
          damageMix, wil,
          notes, gây 100% (ATK + WIL).'
        }),
        skills,
            name,
            tags, 'instant', 'aoe', 'aether-cost', 'shield', 'support'],
            cost,
            targeting,
            linkedSlots,
            reduceDamageLinked,
            reduceAoeDamageColumnAura,
            backlash,
              selfDamageRatioFromAccumulated,
              selfDamageExtraReduction,
              resetAfterTrigger,
            ignorePenetrationUnlessRuleTag,
            notes, trừ kỹ năng có tag [Quy Tắc]). Sát thương giảm trừ được tích lũy và phản phệ khi vượt ngưỡng.'
          },
          {
            key: 'skill2',
            name,
            tags, 'single-target', 'aether-cost', 'chain'],
            cost,
            hits,
            eachHitTriggersPseudoBasic,
            pseudoBasicDoesNotCountAsBasic,
            shieldCostRatioCurrent,
            notes,
          {
            key: 'skill3',
            name,
            tags, 'heal', 'self', 'non-heal-hp-change'],
            trigger, maxUses,
            hpMaxReductionRatio,
            healToRemainingMaxHp,
            recoverLostMaxHpPerTurn,
            notes= 10%: giảm 50% Max HP hiện thời, hồi đầy phần còn lại; mỗi lượt hồi dần Max HP đã mất (20%) cho đến khi hoàn nguyên, không tự hồi HP theo phần Max HP tăng lại.'
          }
        ]),
        ult,
          tags, 'global-rule', 'heal', 'support', 'aoe'],
          autoCast,
          healPercentMaxHP,
          buffStats, RES,
          duration,
          damageMultiplier,
          bonusDamageFromShieldRatio,
          notes, tăng 50% ARM/RES trong 2 lượt, đồng thời gây chấn động toàn sân theo 100% (ATK+WIL) + 50% khiên hiện có.'
        }),
        talent,
          tags, 'aoe', 'shield', 'support', 'line'],
          trigger,
          shieldPercentCasterMaxHP,
          shieldTargets,
          shieldDurationTurns,
          aura,
            reduceAoeDamageTaken,
            targets,
          notes),
        technique,
        passives,
            name,
            when,
            effect,
            params, aoeReduction, duration, stackWithLink,
          {
            id: 'chap_minh_hp_phase_shift',
            name,
            when,
            effect,
            params, maxHpCut, restoreLostMaxHpPerTurn, maxUses),
        traits, text,
          { id: 'linked_backlash', text,
          { id: 'single_use_phase_shift', text)
      }
    },
    {
      id: 'co_truong_phong', name, class, rank, base_element,
      mods, WIL, ARM, RES,
      elementTag,
      kit),
        basic,
          tags,
        }),
        skills,
            name,
            tags, 'rule', 'random-target', 'non-heal-hp-change'],
            cost,
            consumeSword,
            damageMultiplier,
            notes, mỗi mục tiêu chịu 150% sát thương đánh thường (không tính là đánh thường). Runtime riêng xử lý kho phi kiếm và trừ nộ theo Quy Tắc khi Skill 3 hoạt động.'
          },
          {
            key: 'skill2',
            name,
            tags, 'rule', 'single-target', 'non-heal-hp-change', 'heal'],
            cost,
            consumeSword,
            hits,
            damageMultiplier,
            healFromDamageRatio,
            target,
            notes,
          {
            key: 'skill3',
            name,
            tags, 'rule'],
            cost,
            notes, trừ 8 Aether mỗi lượt để duy trì. Khi đang hoạt động, mỗi lần Cổ Trường Phong gây sát thương thành công sẽ trừ 8 nộ mục tiêu.'
          }
        ]),
        ult,
          tags, 'rule'],
          notes=2 phi kiếm thì cast thêm Skill 1. Các lần cast từ Ultimate không tốn Aether.'
        }),
        talent,
          tags, 'rule'],
          notes, số phi kiếm nhận mỗi lượt tăng +1 (tối đa 5 cộng dồn).'
        }),
        technique,
        passives,
            name,
            when,
            effect,
            params,
              swordPerKillStack,
              maxKillStacks,
              lawAetherUpkeep,
              rageDrainPerSuccessfulHit,
            },
          },
        ]),
        traits, text,
          { id: 'ultimate-chain-cast', text, không tiêu hao Aether cho các lượt cast trong chuỗi.' },
        ]),
      }
    },
    {
      id: 'ly_thanh_thu', name, class, rank, base_element,
      mods, WIL, ARM, RES,
      kit),
        basic,
          tags,
        }),
        skills,
            name,
            tags, 'single-target', 'aether-cost', 'counts-as-basic', 'rule'],
            cost,
            damageMultiplier,
            notes= 250% đánh thường, vẫn tính là đánh thường.'
          },
          {
            key: 'skill2',
            name,
            tags, 'aoe', 'aether-cost', 'non-heal-hp-change', 'rule'],
            cost,
            cooldown,
            path, 4, 7, 8, 9, 6, 3, 2, 5, 8],
            lingerSlots, 9, 3, 2],
            lingerTurns,
            bleedOnLinger,
            notes, để lại chảy máu khi đỗ tại các ô mốc.'
          },
          {
            key: 'skill3',
            name,
            tags, 'rule'],
            trigger,
              gainResArmPercent,
              maxStacks,
              durationTurns,
              aeCostPerTrigger,
            },
            notes=2 địch trong lượt: cộng dồn ARM/RES theo tỷ lệ tại thời điểm kích hoạt.'
          }
        ]),
        ult,
          tags, 'single-target', 'rule'],
          target,
          damageMultiplier,
          countsAsBasic,
          healSelfIfDamageOverTargetMaxHp,
          healSelfPercentMaxHp,
        }),
        talent,
          stackPerNonSummonDeath,
          statGainPerStackFromCurrent, WIL,
          maxTriggersPerTurn,
          maxStacksPerBattle,
          resetOnRevive,
          transferToLeaderOnDeath, stats, 'WIL'] },
          healEveryStacks, healPercentMaxHp,
        }),
        technique,
        passives,
            name,
            when,
            effect,
            params, maxPerTurn, maxStacks, resetOnRevive),
        traits, text, kỹ năng và tuyệt kỹ đều thuộc miền Pháp tắc.' },
          { id: 'stack-transfer', text, chuyển 50% ATK/WIL tích lũy từ nội tại cho Leader đồng minh.' },
        ]),
      }
    },
    {
      id: 'nguyen_le', name, class, rank,
      mods, WIL, PER,
      kit),
        basic,
          tags,
        }),
        skills,
            name,
            tags, 'self', 'heal', 'rule'],
            trigger,
              aetherCost,
              healPowerRatioAtkWil,
            },
            notes, tiêu hao 10 Aether để hồi HP bằng 50% (ATK + WIL). Nếu Aether không đủ thì không kích hoạt.'
          },
          {
            key: 'skill2',
            name,
            tags, 'aoe', 'rule'],
            targeting, 2, 3], [4, 5, 6], [7, 8, 9]], pickMostOccupied,
            cost,
            variableCost, maxAether,
            damageMultiplier,
            notes, mỗi mục tiêu trúng chịu 150% sát thương đánh thường. Cost biến thiên 7 Aether/mục tiêu trúng (tối đa 21).'
          },
          {
            key: 'skill3',
            name,
            tags, 'self', 'buff', 'rule'],
            cost,
            buffStats, WIL,
            duration,
            notes),
        ult,
          tags, 'aoe', 'rule'],
          targetPattern, 2, 3, 5, 8],
          damageMultiplier,
          notes),
        talent,
          onKill, 'stun', 'sleep', 'bleed', 'fatigue'],
            gainStatsFromCurrent, WIL,
            resetOnDeath,
          },
        }),
        technique,
        passives,
            name,
            when,
            effect,
            params, WIL,
              immunityPool, 'stun', 'sleep', 'bleed', 'fatigue'],
              resetOnDeath,
            },
          },
        ]),
        traits, text,
        ]),
      }
    },
    {
      id: 'laky', name, class, rank,
      mods, PER,
      kit),
        basic,
          tags, 'sleep-setup'],
          debuff, stacks, maxStacks),
        skills,
            name,
            cost,
            hits,
            countsAsBasic,
            targets,
            notes,
          {
            key: 'skill2',
            name,
            cost,
            hits,
            countsAsBasic,
            targets,
            notes,
          {
            key: 'skill3',
            name,
            cost,
            duration,
            reduceDamage),
        ult, targets, turns, bossModifier),
        talent,
          resPerSleeping),
        technique,
        passives,
            name,
            when,
            effect,
            params, unlimited),
        traits, text, kích hoạt ngủ trong 1 lượt rồi đặt lại (không thể bị xoá trước khi kích hoạt).' },
          { id: 'boss_sleep_half', text).' }
        ])
      }
    },
    {
      id: 'kydieu', name, class, rank,
      mods, RES,
      kit),
        basic,
          tags),
        skills, name, cost, duration, selfRegenPercent,
          {
            key: 'skill2',
            name,
            cost,
            sacrifice,
            reviveDelayTurns,
            reviveReturn, ragePercent, aether,
            grantLeader, stacks,
          { key: 'skill3', name, cost, duration, rageGainBonus),
        ult,
          targets,
          revived, lockSkillsTurns, hpPercent, damageTakenReduction, damageTakenReductionTurns),
        talent,
          perActionStacks, RES),
        technique,
        passives,
            name,
            when,
            effect,
            params, stack, purgeable),
        traits, text, Kỳ Diêu hồi sinh với 50% HP, 50% nộ và 0 Aether; sân kín thì biến mất.' },
          { id: 'revive_lock', text)
      }
    },
    {
      id: 'doanminh', name, class, rank,
      mods, AEmax,
      kit),
        basic,
          tags),
        skills, name, cost, countsAsBasic, damageMultiplier,
          { key: 'skill2', name, cost, healPercentCasterMaxHP, targets,
          { key: 'skill3', name, cost, bonusMaxHPBase, limitUses),
        ult, allies, healLeader, leaderHealPercentCasterMaxHP),
        talent,
          onSpawnHealPercent),
        technique,
        passives),
        traits, text,
         { id: 'hp_gain_cap', text)
      }
    },
    {
      id: 'tranquat', name, class, rank,
      mods, PER,
      kit),
        basic,
          tags),
        skills, name, cost, ordersMinions,
          { key: 'skill2', name, cost, duration, applyTauntToMinions,
          {
            key: 'skill3',
            name,
            cost,
            inheritBonus, ATK, WIL,
            limitUses),
        ult,
          pattern,
          count,
          ttl,
          inherit, ATK, WIL,
          limit,
          replace,
          creep, canChain, basicOnly),
        talent,
          perMinionBasicBonus,
          onMinionDeath, WIL, maxStacks),
        technique,
        passives,
            name,
            when,
            effect,
            params),
        traits, text,
          { id: 'summon_limit', text,
          { id: 'boost_lock', text)
      }
    },
    {
      id: 'linhgac', name, class, rank,
      mods, ATK,
      kit),
        basic,
          tags),
        skills, name, cost, countsAsBasic, damageMultiplier,
          { key: 'skill2', name, cost, duration, buffStats, ARM,
          {
            key: 'skill3',
            name,
            cost,
            permanent,
            buffStats, ARM,
            lowHPBonus, stats, ARM),
        ult, targets, attackSpeed, turns, selfBasicBonus),
        talent,
          onSpawnStats, ATK),
        technique,
        passives),
        traits, text, mạnh hơn khi HP < 30%.' },
          { id: 'ult_damage_bonus', text, đòn đánh thường gây thêm 5% sát thương.' }
        ])
      }
    },
    {
      id: 'creep_1', name, class, rank,
      isNpc,
      tags, 'pve', 'creep'],
      mods,
      kit, WIL, ARM, RES, AGI, PER, HPmax, AEmax, AEregen, HPregen, SPD,
          purgeable,
        }),
        basic,
          tags, 'basic-attack'],
          damageMultiplier,
          useAtkWilBase,
          notes= 100% ATK + 100% WIL.'
        }),
        skills),
        ult,
        talent,
        technique,
        passives,
            name,
            when,
            effect,
            params, mode),
        traits, text, không tham gia pipeline gacha.' }
        ])
      }
    },
    {
      id: 'creep_2', name, class, rank,
      isNpc,
      tags, 'pve', 'creep'],
      mods,
      kit, WIL, ARM, RES, AGI, PER, HPmax, AEmax, AEregen, HPregen, SPD,
          purgeable,
        }),
        basic,
          tags, 'basic-attack'],
          damageMultiplier,
          useAtkWilBase,
          notes= 100% ATK + 100% WIL.'
        }),
        skills),
        ult,
        talent,
        technique,
        passives,
            name,
            when,
            effect,
            params, mode),
        traits, text, không tham gia pipeline gacha.' }
        ])
      }
    },
    {
      id: 'creep_3', name, class, rank,
      isNpc,
      tags, 'pve', 'creep'],
      mods,
      kit, WIL, ARM, RES, AGI, PER, HPmax, AEmax, AEregen, HPregen, SPD,
          purgeable,
        }),
        basic,
          tags, 'basic-attack'],
          damageMultiplier,
          useAtkWilBase,
          notes= 100% ATK + 100% WIL.'
        }),
        skills),
        ult,
        talent,
        technique,
        passives,
            name,
            when,
            effect,
            params, mode),
        traits, text, không tham gia pipeline gacha.' }
        ])
      }
    }
  ] /* satisfies ReadonlyArray<RosterEntry> */;

  const unitBaseEntries = ROSTER
    .map((entry) => {
      const rank = entry.rank;
      const className = normalizeClassName(entry.class);
      if (!isRankName(rank) || !className || !isClassName(className)) {
        return null;
      }
      const base = CLASS_BASE[className];
      const final = applyRankAndMods(base, rank, entry.mods);
      return [entry.id, final] /* /* as const */ */;
    })
    .filter((pair)=> pair !== null);

  const UNIT_BASE = Object.freeze(
    Object.fromEntries(unitBaseEntries),
  ) /* satisfies Readonly<Record<UnitId */, CatalogStatBlock>>;

  // 5) Map & helper tra cứu
  const ROSTER_MAP = new Map(
    ROSTER.map((entry) => [entry.id, entry] /* /* as const */ */),
  );

  const getMetaById = (id)=> {
    if (typeof id !== 'string') return undefined;
    return ROSTER_MAP.get(id);
  };

  const unitKitEntries = ROSTER.map((entry) => [entry.id, asUnitKitConfig(entry.kit)] /* /* as const */ */);

  const UNIT_KITS = Object.freeze(
    Object.fromEntries(unitKitEntries),
  ) /* as UnitKitMap */;

  const getUnitKitById = (id)=> {
    if (typeof id !== 'string') return null;
    const kit = UNIT_KITS[id /* as UnitId */] ?? null;
    return asUnitKitConfig(kit);
  };

  const isSummoner = (id)=> {
    const m = getMetaById(id);
    return !!(m && normalizeClassName(m.class) === 'Summoner' && kitSupportsSummon(m));
  };

  const CLASS_GROWTH = {
    Tanker:   { HP: 22, ATK, WIL, ARM,  RES,
    Warrior, ATK, WIL, ARM, RES,
    Mage, ATK, WIL, ARM, RES,
    Support, ATK, WIL, ARM, RES,
    Ranger, ATK, WIL, ARM, RES,
    Assassin, ATK, WIL, ARM, RES,
    Summoner, ATK, WIL, ARM, RES
  if (!Object.prototype.hasOwnProperty.call(exports, 'RANK_MULT')) exports.RANK_MULT = RANK_MULT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'RANK_SCALED_STATS')) exports.RANK_SCALED_STATS = RANK_SCALED_STATS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isRankScaledStat')) exports.isRankScaledStat = isRankScaledStat;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CLASS_BASE')) exports.CLASS_BASE = CLASS_BASE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ROSTER')) exports.ROSTER = ROSTER;
  if (!Object.prototype.hasOwnProperty.call(exports, 'UNIT_BASE')) exports.UNIT_BASE = UNIT_BASE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ROSTER_MAP')) exports.ROSTER_MAP = ROSTER_MAP;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getMetaById')) exports.getMetaById = getMetaById;
  if (!Object.prototype.hasOwnProperty.call(exports, 'UNIT_KITS')) exports.UNIT_KITS = UNIT_KITS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getUnitKitById')) exports.getUnitKitById = getUnitKitById;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isSummoner')) exports.isSummoner = isSummoner;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CLASS_GROWTH')) exports.CLASS_GROWTH = CLASS_GROWTH;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getRankMultiplier')) exports.getRankMultiplier = getRankMultiplier;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getRankStatMultiplier')) exports.getRankStatMultiplier = getRankStatMultiplier;
  if (!Object.prototype.hasOwnProperty.call(exports, 'scaleStatByRank')) exports.scaleStatByRank = scaleStatByRank;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyRankAndMods')) exports.applyRankAndMods = applyRankAndMods;
};
__modules['./combat.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/combat.ts
  const __dep0 = __require('./catalog.ts');
  const getMetaById = __dep0.getMetaById;
  const __dep1 = __require('./statuses.ts');
  const Statuses = __dep1.Statuses;
  const hookOnLethalDamage = __dep1.hookOnLethalDamage;
  const __dep2 = __require('./combat/apply-damage.ts');
  const applyDamage = __dep2.applyDamage;
  const grantShield = __dep2.grantShield;
  const __dep3 = __require('./combat/calculate-final-damage.ts');
  const calculateFinalDamage = __dep3.calculateFinalDamage;
  const DamageBreakdownMetadata = __dep3.DamageBreakdownMetadata;
  const __dep4 = __require('./vfx.ts');
  const asSessionWithVfx = __dep4.asSessionWithVfx;
  const vfxAddHit = __dep4.vfxAddHit;
  const vfxAddMelee = __dep4.vfxAddMelee;
  const vfxAddLightningArc = __dep4.vfxAddLightningArc;
  const __dep5 = __require('./engine.ts');
  const slotIndex = __dep5.slotIndex;
  const __dep6 = __require('./passives.ts');
  const emitPassiveEvent = __dep6.emitPassiveEvent;
  const getPassiveLog = __dep6.getPassiveLog;
  const AfterHitHandler = __dep6.AfterHitHandler;
  const __dep7 = __require('./config.ts');
  const CFG = __dep7.CFG;
  const __dep8 = __require('./utils/fury.ts');
  const gainFury = __dep8.gainFury;
  const startFurySkill = __dep8.startFurySkill;
  const finishFuryHit = __dep8.finishFuryHit;
  const __dep9 = __require('./utils/time.ts');
  const mergeBusyUntil = __dep9.mergeBusyUntil;
  const sessionNow = __dep9.sessionNow;
  const __dep10 = __require('./data/tags.ts');
  const ABSOLUTE_ATTACK_TAG_IDS = __dep10.ABSOLUTE_ATTACK_TAG_IDS;
  const ABSOLUTE_SHIELD_TAG_IDS = __dep10.ABSOLUTE_SHIELD_TAG_IDS;
  const __dep11 = __require('./leader-uyen.ts');
  const applyUyenBasicExtras = __dep11.applyUyenBasicExtras;
  const __dep12 = __require('./utils/rng.ts');
  const nextRngValue = __dep12.nextRngValue;
  const __dep13 = __require('./utils/domain-normalization.ts');
  const normalizeClassName = __dep13.normalizeClassName;
  const __dep14 = __require('./combat/counter-matrix.ts');
  const getCounterBonusMetadata = __dep14.getCounterBonusMetadata;
  const __dep15 = __require('./combat/number-utils.ts');
  const readAtkWilPower = __dep15.readAtkWilPower;
  const __dep16 = __require('./combat/chap-minh-runtime.ts');
  const applyChapMinhMitigation = __dep16.applyChapMinhMitigation;
  const applyChapMinhPhaseShift = __dep16.applyChapMinhPhaseShift;
  const recordChapMinhPreventedDamage = __dep16.recordChapMinhPreventedDamage;
  const __dep17 = __require('./combat/unit-runtime-hooks.ts');
  const runRuntimeBasicAttackResolved = __dep17.runRuntimeBasicAttackResolved;
  const runRuntimeDamageResolved = __dep17.runRuntimeDamageResolved;
  const runRuntimeUnitDeath = __dep17.runRuntimeUnitDeath;

  exports.applyDamage = applyDamage;
  exports.grantShield = grantShield;

  const getSharedHpGroup = (target)=> {
    const targetGroup = toNonEmptyString(target.sharedHpGroup)
      ?? toNonEmptyString(target.sharedDamageGroup)
      ?? toNonEmptyString(target.linkGroup);
    if (targetGroup) return targetGroup;
    const statuses = Array.isArray(target.statuses) ? target.statuses : [];
    for (let i = 0; i < statuses.length; i += 1) {
      const status = statuses[i] /* as Record<string */, unknown>;
      const idTag = `${status.id ?? ''}|${status.tag ?? ''}`.toLowerCase();
      if (!idTag.includes('share')) continue;
      const statusGroup = toNonEmptyString(status.group)
        ?? toNonEmptyString(status.link)
        ?? toNonEmptyString(status.key);
      if (statusGroup) return statusGroup;
    }
    return null;
  };

  const getSharedHpRules = (target){ group: string | null; weight: number; capRatio: number | null } => {
    const group = getSharedHpGroup(target);
    if (!group) return { group: null, weight, capRatio= Array.isArray(target.statuses) ? target.statuses : [];
    const weighted = toFinite(target.sharedHpWeight ?? target.shareWeight, Number.NaN);
    const capped = toFinite(target.sharedHpCapRatio ?? target.shareCapRatio, Number.NaN);
    let weight = Number.isFinite(weighted) ? Math.max(0.05, weighted) ;
    let capRatio = Number.isFinite(capped) ? Math.max(0, capped) ;
    for (let i = 0; i < statuses.length; i += 1) {
      const status = statuses[i] /* as Record<string */, unknown>;
      const idTag = `${status.id ?? ''}|${status.tag ?? ''}`.toLowerCase();
      if (!idTag.includes('share')) continue;
      const statusWeight = toFinite(status.weight, Number.NaN);
      if (Number.isFinite(statusWeight)) weight = Math.max(0.05, statusWeight);
      const statusCap = toFinite(status.capRatio, Number.NaN);
      if (Number.isFinite(statusCap)) capRatio = Math.max(0, statusCap);
    }
    return { group, weight, capRatio };
  };

  const GAME_CONFIG = CFG /* as Readonly<GameConfig> */;

  function pickTarget(Game, attacker){
    const foeSide = attacker.side === 'ally' ? 'enemy' : 'ally';
    const pool= [];
    const bySlot = new Map();
    const occupiedSlots = new Set();
    let nearestOverall= null;
    let nearestOverallDistance = Number.POSITIVE_INFINITY;

    const distanceToAttacker = (token)=> (
      Math.abs(token.cx - attacker.cx) + Math.abs(token.cy - attacker.cy)
    );

    for (const token of Game.tokens) {
      if (token.side !== foeSide || !token.alive) continue;
      pool.push(token);
      const slot = slotIndex(token.side, token.cx, token.cy);
      bySlot.set(slot, token);
      occupiedSlots.add(slot);
      const distance = distanceToAttacker(token);
      if (
        !nearestOverall
        || distance < nearestOverallDistance
        || (distance === nearestOverallDistance && slot < slotIndex(nearestOverall.side, nearestOverall.cx, nearestOverall.cy))
      ) {
        nearestOverall = token;
        nearestOverallDistance = distance;
      }
    }

    if (pool.length === 0) return null;

    const meta = getMetaById(attacker.id);
    const className = normalizeClassName(meta?.class);
    const isAssassin = className === 'Assassin';

    const slotOf = (token)=> slotIndex(token.side, token.cx, token.cy);

    const isBlockedLeader = (slot)=> (
      slot === 8 && (occupiedSlots.has(2) || occupiedSlots.has(5))
    );

    if (isAssassin) {
      let nearestBackline= null;
      let nearestBacklineDistance = Number.POSITIVE_INFINITY;
      for (const target of pool) {
        const slot = slotOf(target);
        if (slot < 7) continue;
        const distance = distanceToAttacker(target);
        if (
          !nearestBackline
          || distance < nearestBacklineDistance
          || (distance === nearestBacklineDistance && slot < slotOf(nearestBackline))
        ) {
          nearestBackline = target;
          nearestBacklineDistance = distance;
        }
      }
      if (nearestBackline) return nearestBackline;
    }

    const attackerRow = attacker.cy;
    const targetSide = foeSide;
    const primarySlot = Math.max(1, Math.min(3, (attackerRow | 0) + 1));
    const slotPriority= [primarySlot, primarySlot + 3, primarySlot + 6];

    for (const slot of slotPriority) {
      if (isBlockedLeader(slot)) continue;
      const found = bySlot.get(slot);
      if (found) return found;
    }

    if (nearestOverall && !isBlockedLeader(slotOf(nearestOverall))) {
      return nearestOverall;
    }

    for (const target of pool) {
      if (isBlockedLeader(slotOf(target))) continue;
      return target;
    }

    return null;
  }

  function dealAbilityDamage(
    Game,
    attacker,
    target,
    opts= {}
  ){
    if (!attacker || !target || !target.alive) {
      return {
        dealt: 0,
        absorbed,
        total,
        breakdown, elementBonus, synergyBonus,
      };
    }

    startFurySkill(attacker, { tag: String(opts.furyTag || opts.attackType || 'ability') });

    const dtype = typeof opts.dtype === 'string' ? opts.dtype : 'physical';
    const attackType = typeof opts.attackType === 'string' ? opts.attackType : 'skill';
    const baseDefault = Math.max(0, Math.floor((attacker.atk ?? 0) + (attacker.wil ?? 0)));
    const base = Math.max(0, opts.base != null ? Math.floor(Number(opts.base)) ;
    const skillMulti = Math.max(0, toFinite(opts.skillMul ?? opts.skillMultiplier ?? 1, 1));
    const realmBonus = Number.isFinite(toFinite(opts.realmBonus, Number.NaN))
      ? Math.floor(toFinite(opts.realmBonus, 0))
      ;

    const pre = Statuses.beforeDamage(attacker, target, { dtype, base, attackType });

    const combinedPen = Math.max(0, Math.min(1, Math.max(pre.defPen ?? 0, opts.defPen ?? 0)));
    const physWeightRaw = normalizeWeight(opts.physicalRatio ?? opts.physRatio ?? (dtype === 'mixed' ? 0.5 : 0));
    const arcWeightRaw = normalizeWeight(opts.arcaneRatio ?? opts.magicRatio ?? (dtype === 'mixed' ? 0.5 : 0));
    const splitTotal = physWeightRaw + arcWeightRaw;
    const physWeight = dtype === 'mixed' ? (splitTotal > 0 ? physWeightRaw / splitTotal : 0.5) === 'arcane' ? 0 : 1);
    const arcWeight = dtype === 'mixed' ? (splitTotal > 0 ? arcWeightRaw / splitTotal : 0.5) === 'arcane' ? 1 : 0);
    const effectiveArm = Math.max(0, (target.arm ?? 0) * (1 - combinedPen));
    const effectiveRes = Math.max(0, (target.res ?? 0) * (1 - combinedPen));
    const defMultiplier = (physWeight * (100 / (100 + effectiveArm))) + (arcWeight * (100 / (100 + effectiveRes)));
    const sideUnits = Game?.tokens?.filter((token) => token.side === attacker.side && token.alive) ?? [];
    const counterMetadata = getCounterBonusMetadata(attacker, target, sideUnits, { skill: opts.skill });

    const atkAbsolute = hasAbsoluteLawTag(attacker, 'attack');
    const shieldAbsolute = hasAbsoluteLawTag(target, 'shield');
    const attackerRank = getRankPriority(attacker);
    const targetRank = getRankPriority(target);
    const shieldWinsLaw = atkAbsolute && shieldAbsolute && targetRank > attackerRank;
    const bypassShieldByLaw = atkAbsolute && shieldAbsolute && attackerRank >= targetRank;

    const rawDamage = Math.max(0, Math.floor((pre.base * skillMulti + realmBonus) * pre.outMul));
    const bonusBreakdown = {
      classBonus: toFinite(opts.classBonus ?? opts.damageBreakdown?.classBonus, counterMetadata.classBonus),
      elementBonus, counterMetadata.elementBonus),
      synergyBonus, counterMetadata.synergyBonus),
    };
    const finalDamage = calculateFinalDamage(attacker, target, opts.skill, rawDamage, {
      ignoreAll: pre.ignoreAll || shieldWinsLaw,
      defenseMultiplier,
      reductionMultiplier,
      breakdown,
    });
    const chapMinhMitigation = applyChapMinhMitigation(target, finalDamage.total, {
      isAoE: !!opts.isAoE,
      skill,
    });
    const dmg = chapMinhMitigation.finalDamage;
    if (chapMinhMitigation.prevented > 0) {
      recordChapMinhPreventedDamage(chapMinhMitigation.owner, chapMinhMitigation.prevented);
    }

    const abs = bypassShieldByLaw
      ? { remain: dmg, absorbed, broke) /* as ShieldAbsorptionResult */);
    const remain = Math.max(0, Math.floor(abs.remain));
    let dealtTotal = 0;
    const attackerState = attacker /* as UnitToken & { _directKills: number } */;

    const emitOnDeathPassive = (unit)=> {
      if (!Game || unit.alive) return;
      const deadAt = Number(unit.deadAt ?? 0);
      const marker = Number((unit /* as UnitToken & { _passiveDeathAt: number } */)._passiveDeathAt ?? Number.NaN);
      if (Number.isFinite(marker) && marker === deadAt) return;
      (unit /* as UnitToken & { _passiveDeathAt: number } */)._passiveDeathAt = deadAt;
      emitPassiveEvent(Game, unit, 'onDeath', { log: getPassiveLog(Game) });
      runRuntimeUnitDeath({ game: Game, deadUnit, killer);
    };
    const sharedRules = getSharedHpRules(target);
    const sharedTargets = [] /* as UnitToken[ */];
    if (sharedRules.group && Game) {
      for (let i = 0; i < Game.tokens.length; i += 1) {
        const token = Game.tokens[i];
        if (!token?.alive || token.side !== target.side) continue;
        const tokenGroup = getSharedHpGroup(token);
        if (tokenGroup === sharedRules.group) sharedTargets.push(token);
      }
    }

    if (remain > 0 && sharedTargets.length > 1) {
      const weightedTargets = [] /* as Array<{ token: UnitToken */; weight: number; capRatio: number | null }>;
      for (const token of sharedTargets) {
        const rules = token === target ? sharedRules : getSharedHpRules(token);
        weightedTargets.push({ token, weight, rules.weight), capRatio);
      }
      const totalWeight = weightedTargets.reduce((acc, entry) => acc + entry.weight, 0) || 1;
      let assigned = 0;
      for (let i = 0; i < weightedTargets.length; i += 1) {
        const entry = weightedTargets[i];
        if (!entry) continue;
        const isLast = i === weightedTargets.length - 1;
        let payload = isLast
          ? Math.max(0, remain - assigned)
          ;
        if (entry.capRatio != null && Number.isFinite(entry.token.hpMax)) {
          const capValue = Math.max(0, Math.floor((entry.token.hpMax ?? 0) * entry.capRatio));
          payload = Math.min(payload, capValue);
        }
        assigned += payload;
        if (payload <= 0) continue;
        const beforeHp = Math.max(0, Math.floor(entry.token.hp ?? 0));
        applyDamage(entry.token, payload);
        const afterHp = Math.max(0, Math.floor(entry.token.hp ?? 0));
        dealtTotal += Math.max(0, beforeHp - afterHp);
        if (entry.token.hp <= 0) {
          hookOnLethalDamage(entry.token);
          emitOnDeathPassive(entry.token);
        }
      }
    } else if (remain > 0) {
      const beforeHp = Math.max(0, Math.floor(target.hp ?? 0));
      applyDamage(target, remain);
      const afterHp = Math.max(0, Math.floor(target.hp ?? 0));
      dealtTotal += Math.max(0, beforeHp - afterHp);
    }
    if (target.hp <= 0) {
      emitPassiveEvent(Game, target, 'onLethalDamage', { log: getPassiveLog(Game), attacker, attackType });
    }
    if (target.hp <= 0) {
      hookOnLethalDamage(target);
      emitOnDeathPassive(target);
    }
    {
      const targetCarrier = target /* as UnitToken & { */
        _lastDamageTaken: number;
        _lastDamageTakenTurn: number;
        _lastDamageTakenSerial: number;
      };
      const runtimeRoot = Game ? (Game.runtime ??= {}) {};
      const damageSerial = Math.max(0, Math.floor(Number((runtimeRoot /* as { _damageEventSerial: unknown } */)._damageEventSerial ?? 0))) + 1;
      (runtimeRoot /* as { _damageEventSerial: number } */)._damageEventSerial = damageSerial;
      targetCarrier._lastDamageTaken = dealtTotal;
      targetCarrier._lastDamageTakenSerial = damageSerial;
      targetCarrier._lastDamageTakenTurn = Number((Game?.turn /* as { turnCount: unknown } | null | undefined */)?.turnCount ?? 0);
    }
    runRuntimeDamageResolved(target);
    applyChapMinhPhaseShift(target);

    const damageResult= {
      dealt: dealtTotal,
      absorbed,
      dtype,
      breakdown,
    };
    Statuses.afterDamage(attacker, target, damageResult);
    const dealt = Math.max(0, dealtTotal);
    resolveReflectDamage(attacker, target, dealt, dtype);

    const sessionVfx = asSessionWithVfx(Game);

    if (sessionVfx != null) {
      try {
        const hasAdvantage = (finalDamage.breakdown.classBonus + finalDamage.breakdown.elementBonus + finalDamage.breakdown.synergyBonus) > 0;
        vfxAddHit(sessionVfx, target, { isCrit: !!opts.isCrit, advantage);
      } catch {
        // bỏ qua lỗi VFX runtime
      }
    }

    const isKill = target.hp <= 0;
    if (isKill) {
      attackerState._directKills = Math.max(0, Math.floor(Number(attackerState._directKills ?? 0))) + 1;
      emitPassiveEvent(Game, attacker, 'onEnemyDeath', { log: getPassiveLog(Game), target, attackType, isDirectKill);
      const bloodAvatarObservers = Game?.tokens?.filter((token) =>
        token.alive
        && token.id === 'blood_avatar'
        && token.side !== target.side
        && token.iid !== attacker.iid
      ) ?? [];
      if (bloodAvatarObservers.length > 0) {
        const observerLog = getPassiveLog(Game);
        for (const observer of bloodAvatarObservers) {
          emitPassiveEvent(Game, observer, 'onEnemyDeath', {
            log: observerLog,
            target,
            attackType,
            isDirectKill,
          });
        }
      }
    }

    gainFury(attacker, {
      type: attackType === 'basic' ? 'basic' : 'ability',
      dealt,
      isAoE,
      isKill,
      isCrit,
      targetsHit) ? Number(opts.targetsHit) 
      targetMaxHp: Number.isFinite(target.hpMax) ? target.hpMax : undefined,
    });

    gainFury(target, {
      type: 'damageTaken',
      dealt,
      isAoE,
      selfMaxHp) ? target.hpMax : undefined,
      damageTaken,
    });

    finishFuryHit(target);
    finishFuryHit(attacker);

    const attackerCarrier = attacker /* as DamageMetadataCarrier */;
    const metadataBase = {
      attackerKey: unitEventKey(attacker),
      defenderKey),
      actionType,
      damageType,
      rawDamage,
      finalDamage,
      dealtDamage,
      absorbedDamage,
      classBonus,
      elementBonus,
      synergyBonus,
    };
    const snapshot= {
      ...metadataBase,
      summary),
    };
    const previous = attackerCarrier._lastDamageContext;
    const previousFinalDamage = previous?.finalDamage ?? Number.NEGATIVE_INFINITY;
    if (snapshot.finalDamage >= previousFinalDamage) {
      attackerCarrier._lastDamageContext = snapshot;
      attackerCarrier._lastCounterBreakdown = { ...finalDamage.breakdown };
      attackerCarrier._lastDamageSummary = snapshot.summary;
    }

    return { dealt, absorbed, total, breakdown
  if (!Object.prototype.hasOwnProperty.call(exports, 'pickTarget')) exports.pickTarget = pickTarget;
  if (!Object.prototype.hasOwnProperty.call(exports, 'dealAbilityDamage')) exports.dealAbilityDamage = dealAbilityDamage;
};
__modules['./combat/apply-damage.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./utils/time.ts');
  const sessionNow = __dep0.sessionNow;
  const __dep1 = __require('./combat/number-utils.ts');
  const toFiniteNumber = __dep1.toFiniteNumber;
  const toFloorInt = __dep1.toFloorInt;
  const toNonNegativeFloorInt = __dep1.toNonNegativeFloorInt;
  const toPositiveTurns = __dep1.toPositiveTurns;
  const __dep2 = __require('./combat/status-utils.ts');
  const ensureStatusList = __dep2.ensureStatusList;
  const getStatusEntryById = __dep2.getStatusEntryById;



  const SHIELD_STATUS_ID = 'shield';

  function getShieldEntry(target) {
    return getStatusEntryById(target, SHIELD_STATUS_ID);
  }

  function consumeShieldEntryAmount(entry, amount){
    if (!entry) return 0;

    const current = toNonNegativeFloorInt(entry.status.amount, 0);
    if (current <= 0) return 0;

    const requested = toNonNegativeFloorInt(amount, 0);
    if (requested <= 0) return 0;

    const consumed = Math.min(current, requested);
    const remain = current - consumed;
    if (remain > 0) {
      entry.status.amount = remain;
      return consumed;
    }

    entry.statuses.splice(entry.index, 1);
    return consumed;
  }

  function applyDamage(target, amount){
    const maxHp = toNonNegativeFloorInt(target.hpMax, 0);
    if (maxHp <= 0) return;
    const damage = toNonNegativeFloorInt(amount, 0);
    if (damage <= 0) return;

    const currentHp = Math.max(0, Math.min(maxHp, toFloorInt(target.hp, 0)));
    const newHp = Math.max(0, currentHp - damage);
    target.hp = newHp;

    if (target.hp <= 0) {
      if (target.alive !== false && !target.deadAt) {
        target.deadAt = sessionNow();
      }
      target.alive = false;
    }
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyDamage')) exports.applyDamage = applyDamage;
};
__modules['./combat/board-position-utils.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./engine.ts');
  const slotIndex = __dep0.slotIndex;





    row: number;
    col: number;
  };

  function readBoardPosition(token){
    if (!token || !Number.isFinite(token.cx) || !Number.isFinite(token.cy) || !token.side) return null;
    const slot = slotIndex(token.side, token.cx, token.cy);
    if (!Number.isFinite(slot) || slot < 1) return null;
    const normalizedSlot = Math.floor(slot);
    return {
      slot: normalizedSlot,
      row) / 3),
      col) % 3,
    };
  }

  function isLeaderToken(token){
    const position = readBoardPosition(token);
    return !!position && position.slot === 8;
  }

  function readTokenSlotAndColumn(token, 'side' | 'cx' | 'cy'>){ slot: number; column: number } {
    const slot = slotIndex(token.side, token.cx, token.cy);
    return {
      slot,
      column) % 3) + 1,
    };
  }

  function selectTargetsByBoardPredicate(
    pool,
    predicate) => boolean,
  ){
    const selected= [];
    for (const token of pool) {
      const pos = readBoardPosition(token);
      if (!pos || !predicate(pos)) continue;
      selected.push(token);
    }
    return selected;
  }

  function createCrossSlotLookup(centerSlot){
    const row = Math.floor((centerSlot - 1) / 3);
    const col = (centerSlot - 1) % 3;
    const slots = new Set([centerSlot]);
    const candidates = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ] /* /* as const */ */;
    for (const [r, c] of candidates) {
      if (r < 0 || r > 2 || c < 0 || c > 2) continue;
      slots.add(r * 3 + c + 1);
    }
    return slots;
  }

  function findAliveUnitAtSlot(
    game, 'tokens'>,
    side,
    slot,
  ){
    if (!game || !Number.isFinite(slot) || slot < 1) return null;
    const normalizedSlot = Math.floor(slot);
    for (const token of game.tokens) {
      if (!token?.alive || token.side !== side) continue;
      const position = readBoardPosition(token);
      if (!position || position.slot !== normalizedSlot) continue;
      return token;
    }
    return null;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'readBoardPosition')) exports.readBoardPosition = readBoardPosition;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isLeaderToken')) exports.isLeaderToken = isLeaderToken;
  if (!Object.prototype.hasOwnProperty.call(exports, 'readTokenSlotAndColumn')) exports.readTokenSlotAndColumn = readTokenSlotAndColumn;
  if (!Object.prototype.hasOwnProperty.call(exports, 'selectTargetsByBoardPredicate')) exports.selectTargetsByBoardPredicate = selectTargetsByBoardPredicate;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createCrossSlotLookup')) exports.createCrossSlotLookup = createCrossSlotLookup;
  if (!Object.prototype.hasOwnProperty.call(exports, 'findAliveUnitAtSlot')) exports.findAliveUnitAtSlot = findAliveUnitAtSlot;
};
__modules['./combat/calculate-final-damage.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat/number-utils.ts');
  const clampMin = __dep0.clampMin;
  const toFiniteNumber = __dep0.toFiniteNumber;
  const toFloorInt = __dep0.toFloorInt;
};
__modules['./combat/chap-minh-runtime.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./utils/fury.ts');
  const gainFury = __dep0.gainFury;
  const __dep1 = __require('./data/tags.ts');
  const AOE_TARGET_TAG_IDS = __dep1.AOE_TARGET_TAG_IDS;
  const RULE_BYPASS_TAG_IDS = __dep1.RULE_BYPASS_TAG_IDS;
  const hasAnyTag = __dep1.hasAnyTag;
  const normalizeTagList = __dep1.normalizeTagList;
  const __dep2 = __require('./combat/apply-damage.ts');
  const applyDamage = __dep2.applyDamage;
  const grantShield = __dep2.grantShield;
  const __dep3 = __require('./combat/number-utils.ts');
  const toFiniteNumber = __dep3.toFiniteNumber;
  const toFloorInt = __dep3.toFloorInt;
  const __dep4 = __require('./combat/token-side-utils.ts');
  const bucketTokensByActualSide = __dep4.bucketTokensByActualSide;
  const forEachPartitionToken = __dep4.forEachPartitionToken;
  const __dep5 = __require('./combat/board-position-utils.ts');
  const createCrossSlotLookup = __dep5.createCrossSlotLookup;
  const readTokenSlotAndColumn = __dep5.readTokenSlotAndColumn;




  const CHAP_MINH_ID = 'huyen_vu_chap_minh';
  const CHAP_MINH_LINK_REDUCTION = 0.30;
  const CHAP_MINH_AOE_COLUMN_REDUCTION = 0.35;
  const CHAP_MINH_ACTION_END_FURY_GAIN = 2;
  const CHAP_MINH_BACKLASH_SELF_REDUCTION = 0.3;

  const isAliveChapMinh = (token)=> (
    !!token && token.alive && token.id === CHAP_MINH_ID
  );

  const isChapMinh = (token)=> (
    !!token && token.id === CHAP_MINH_ID
  );

  function hasLookupEntries(lookup, true> | null | undefined){
    if (!lookup) return false;
    for (const _slot in lookup) {
      return true;
    }
    return false;
  }

  function buildLinkedLookup(slots){
    const lookup= {};
    if (!Array.isArray(slots)) return lookup;
    for (const linkedSlot of slots) {
      lookup[linkedSlot] = true;
    }
    return lookup;
  }

  function activateChapMinhLink(caster){
    if (!isAliveChapMinh(caster)) return;
    const { slot } = readTokenSlotAndColumn(caster);
    const linkedSlots = [...createCrossSlotLookup(slot)];
    caster._chapMinhLinkedSlots = linkedSlots;
    caster._chapMinhLinkedSlotLookup = buildLinkedLookup(linkedSlots);
    caster._chapMinhAccumulated = Math.max(0, toFiniteNumber(caster._chapMinhAccumulated, 0));
  }

  function applyChapMinhActionEnd(game, caster){
    if (!game || !isAliveChapMinh(caster)) return;
    gainFury(caster, { amount: CHAP_MINH_ACTION_END_FURY_GAIN, type);
    const { column } = readTokenSlotAndColumn(caster);
    const shieldAmount = Math.max(0, Math.floor((caster.hpMax ?? 0) * 0.15));
    if (shieldAmount <= 0) return;

    forEachPartitionToken(game.tokens, caster.side, 'ally', (token) => {
      const { column: tokenColumn } = readTokenSlotAndColumn(token);
      if (tokenColumn !== column) return;
      grantShield(token, shieldAmount, { durationTurns: 1 });
    });
  }

  function extractNormalizedSkillTags(skill){
    if (!skill || typeof skill !== 'object') return [];
    const rawTags = (skill /* as { tags: unknown } */).tags;
    return normalizeTagList(Array.isArray(rawTags) ? rawTags : []);
  }

  function classifyMitigationSkill(skill){ hasRuleBypassTag: boolean; isAoE: boolean } {
    const tags = extractNormalizedSkillTags(skill);
    return {
      hasRuleBypassTag: hasAnyTag(tags, RULE_BYPASS_TAG_IDS),
      isAoE, AOE_TARGET_TAG_IDS),
    };
  }

  function resolveMitigationRatio(
    target,
    hasRuleBypassTag,
    isAoE,
  ){ ratio: number; owner: ChapMinhStateCarrier | null } {
    let bestRatio = 0;
    let owner= null;

    const candidate = (target._chapMinhLinkOwner /* as ChapMinhStateCarrier | undefined */) ?? null;
    if (isAliveChapMinh(candidate) && candidate.side === target.side) {
      const { slot, column= readTokenSlotAndColumn(target);
      const { column: ownerColumn } = readTokenSlotAndColumn(candidate);
      const linkedLookup = candidate._chapMinhLinkedSlotLookup /* as Record<number */, true> | undefined;
      const inLink = linkedLookup
        ? linkedLookup[slot] === true
        : (Array.isArray(candidate._chapMinhLinkedSlots) && candidate._chapMinhLinkedSlots.includes(slot));
      const inColumn = tokenColumn === ownerColumn;
      if (inLink && !hasRuleBypassTag) {
        bestRatio += CHAP_MINH_LINK_REDUCTION;
        owner = candidate;
      }
      if (inColumn && isAoE) {
        bestRatio += CHAP_MINH_AOE_COLUMN_REDUCTION;
        owner = owner ?? candidate;
      }
    }

    return { ratio: Math.max(0, Math.min(0.95, bestRatio)), owner };
  }

  function refreshChapMinhOwnership(game){
    if (!game) return;
    let hasAliveOwner = false;
    for (const token of game.tokens) {
      if (!isAliveChapMinh(token)) continue;
      if (!Array.isArray(token._chapMinhLinkedSlots) || token._chapMinhLinkedSlots.length === 0) continue;
      const linkedLookup = token._chapMinhLinkedSlotLookup /* as Record<number */, true> | undefined;
      if (!hasLookupEntries(linkedLookup)) {
        token._chapMinhLinkedSlotLookup = buildLinkedLookup(token._chapMinhLinkedSlots);
      }
      hasAliveOwner = true;
    }

    for (const token of game.tokens) {
      if ((token /* as UnitToken & { _chapMinhLinkOwner: UnitToken } */)._chapMinhLinkOwner) {
        delete (token /* as UnitToken & { _chapMinhLinkOwner: UnitToken } */)._chapMinhLinkOwner;
      }
    }
    if (!hasAliveOwner) return;

    const groupedAliveBySide = bucketTokensByActualSide(game.tokens);

    for (const owner of game.tokens) {
      const linkedLookup = (owner /* as ChapMinhStateCarrier */)._chapMinhLinkedSlotLookup /* as Record<number */, true> | undefined;
      if (!isAliveChapMinh(owner) || !hasLookupEntries(linkedLookup)) continue;
      const safeLookup = linkedLookup /* as Record<number */, true>;
      const { column: ownerColumn } = readTokenSlotAndColumn(owner);
      const sideTokens = owner.side === 'ally' ? groupedAliveBySide.ally : groupedAliveBySide.enemy;
      for (const token of sideTokens) {
        const { slot: tokenSlot, column= readTokenSlotAndColumn(token);
        const inLink = safeLookup[tokenSlot] === true;
        const inColumn = tokenColumn === ownerColumn;
        if (!inLink && !inColumn) continue;
        (token /* as UnitToken & { _chapMinhLinkOwner: UnitToken } */)._chapMinhLinkOwner = owner;
      }
    }
  }

  function applyChapMinhMitigation(
    target,
    incomingDamage,
    options,
  ){ finalDamage: number; prevented: number; owner: ChapMinhStateCarrier | null } {
    const inputDamage = Math.max(0, Math.floor(incomingDamage));
    if (inputDamage <= 0) return { finalDamage: 0, prevented, owner= classifyMitigationSkill(options.skill);
    const isAoE = !!options.isAoE || skillFlags.isAoE;
    const { ratio, owner } = resolveMitigationRatio(target, skillFlags.hasRuleBypassTag, isAoE);
    if (ratio <= 0 || !owner) return { finalDamage: inputDamage, prevented, owner= Math.max(0, Math.floor(inputDamage * (1 - ratio)));
    return {
      finalDamage: reduced,
      prevented, inputDamage - reduced),
      owner,
    };
  }

  function applyChapMinhBacklash(owner){
    if (!isAliveChapMinh(owner)) return;
    const accumulated = Math.max(0, toFiniteNumber(owner._chapMinhAccumulated, 0));
    const threshold = Math.max(1, Math.floor((owner.hpMax ?? 0) * 0.7));
    if (accumulated <= threshold) return;

    const backlashBase = Math.max(1, Math.floor(accumulated * (1 - CHAP_MINH_BACKLASH_SELF_REDUCTION)));
    const arm = Math.max(0, toFiniteNumber(owner.arm, 0));
    const res = Math.max(0, toFiniteNumber(owner.res, 0));
    const defenseMultiplier = 0.5 * (100 / (100 + arm)) + 0.5 * (100 / (100 + res));
    const finalDamage = Math.max(1, Math.floor(backlashBase * defenseMultiplier));
    applyDamage(owner, finalDamage);
    owner._chapMinhAccumulated = 0;
  }

  function recordChapMinhPreventedDamage(owner, prevented){
    if (!isAliveChapMinh(owner) || prevented <= 0) return;
    owner._chapMinhAccumulated = Math.max(0, toFiniteNumber(owner._chapMinhAccumulated, 0) + prevented);
    applyChapMinhBacklash(owner);
  }

  function applyChapMinhPhaseShift(unit){
    if (!isChapMinh(unit)) return;
    if (unit._chapMinhPhaseShiftUsed) return;
    const hpMax = Math.max(1, toFloorInt(unit.hpMax, 1));
    const hp = Math.max(0, toFloorInt(unit.hp, hpMax));
    if (hp > Math.floor(hpMax * 0.1)) return;

    const lost = Math.max(1, Math.floor(hpMax * 0.5));
    const nextHpMax = Math.max(1, hpMax - lost);
    unit.hpMax = nextHpMax;
    unit.hp = nextHpMax;
    unit.alive = true;
    delete unit.deadAt;
    unit._chapMinhLostMaxHp = lost;
    unit._chapMinhRecoverPerTurn = Math.max(1, Math.floor(lost * 0.2));
    unit._chapMinhPhaseShiftUsed = true;
  }

  function recoverChapMinhMaxHpPerTurn(unit){
    if (!isAliveChapMinh(unit) || !unit._chapMinhPhaseShiftUsed) return;
    const lostRemain = Math.max(0, toFloorInt(unit._chapMinhLostMaxHp, 0));
    if (lostRemain <= 0) return;
    const step = Math.max(1, toFloorInt(unit._chapMinhRecoverPerTurn, 0));
    const gain = Math.min(lostRemain, step);
    unit.hpMax = Math.max(1, toFloorInt(unit.hpMax, 1) + gain);
    unit._chapMinhLostMaxHp = Math.max(0, lostRemain - gain);
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'activateChapMinhLink')) exports.activateChapMinhLink = activateChapMinhLink;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyChapMinhActionEnd')) exports.applyChapMinhActionEnd = applyChapMinhActionEnd;
  if (!Object.prototype.hasOwnProperty.call(exports, 'refreshChapMinhOwnership')) exports.refreshChapMinhOwnership = refreshChapMinhOwnership;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyChapMinhMitigation')) exports.applyChapMinhMitigation = applyChapMinhMitigation;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyChapMinhBacklash')) exports.applyChapMinhBacklash = applyChapMinhBacklash;
  if (!Object.prototype.hasOwnProperty.call(exports, 'recordChapMinhPreventedDamage')) exports.recordChapMinhPreventedDamage = recordChapMinhPreventedDamage;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyChapMinhPhaseShift')) exports.applyChapMinhPhaseShift = applyChapMinhPhaseShift;
  if (!Object.prototype.hasOwnProperty.call(exports, 'recoverChapMinhMaxHpPerTurn')) exports.recoverChapMinhMaxHpPerTurn = recoverChapMinhMaxHpPerTurn;
};
__modules['./combat/counter-matrix.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./utils/domain-normalization.ts');
  const normalizeClassName = __dep0.normalizeClassName;
  const normalizeElementKey = __dep0.normalizeElementKey;
  const ElementKey = __dep0.ElementKey;
  const __dep1 = __require('./combat/number-utils.ts');
  const asRecord = __dep1.asRecord;

  const ELEMENT_CYCLE = ['fire', 'metal', 'wood', 'earth', 'lightning', 'blood', 'water'] /* /* as const */ */;
  const ELEMENT_BONUS = 0.1;
  const SYNERGY_BONUS = 0.05;

  const CLASS_BONUS_MAP= {
    Assassin: { Mage: 0.1, Support,
    Mage, Tanker,
    Tanker, Summoner,
    Warrior, Ranger,
    Ranger, Support,
    Summoner, Warrior,
    Support, Mage,
  };

  const readRecordElement = (record, unknown> | null)=> {
    if (!record) return null;
    const metadata = asRecord(record.metadata);
    const meta = asRecord(record.meta);
    return (
      normalizeElementKey(record.base_element)
      ?? normalizeElementKey(record.baseElement)
      ?? normalizeElementKey(record.element)
      ?? normalizeElementKey(record.nguyen_to)
      ?? normalizeElementKey(record.nguyenTo)
      ?? normalizeElementKey(record.he)
      ?? normalizeElementKey(metadata?.base_element)
      ?? normalizeElementKey(metadata?.baseElement)
      ?? normalizeElementKey(metadata?.element)
      ?? normalizeElementKey(meta?.base_element)
      ?? normalizeElementKey(meta?.baseElement)
      ?? normalizeElementKey(meta?.element)
      ?? null
    );
  };

  const readBaseElement = (value)=> {
    const direct = normalizeElementKey(value);
    if (direct) return direct;
    return readRecordElement(asRecord(value)) ?? 'neutral';
  };

  const readSkillElement = (skill)=> {
    const record = asRecord(skill);
    if (!record) return normalizeElementKey(skill);
    const metadata = asRecord(record.metadata);
    const meta = asRecord(record.meta);
    const payload = asRecord(record.payload);

    const fromField = (
      normalizeElementKey(record.element)
      ?? normalizeElementKey(record.skill_element)
      ?? normalizeElementKey(record.skillElement)
      ?? normalizeElementKey(metadata?.element)
      ?? normalizeElementKey(meta?.element)
      ?? normalizeElementKey(payload?.element)
    );
    if (fromField) return fromField;

    const tags = [record.tags, metadata?.tags, meta?.tags]
      .find((entry) => Array.isArray(entry));
    if (!Array.isArray(tags)) return null;

    for (const tag of tags) {
      if (typeof tag !== 'string') continue;
      const trimmed = tag.trim().toLowerCase();
      const direct = normalizeElementKey(trimmed);
      if (direct) return direct;
      const prefixed = normalizeElementKey(trimmed.replace(/^element[:_-]/, ''));
      if (prefixed) return prefixed;
    }

    return null;
  };

  const readClass = (value)=> {
    const direct = normalizeClassName(value);
    if (direct) return direct;
    const record = asRecord(value);
    if (!record) return null;
    const metadata = asRecord(record.metadata);
    return (
      normalizeClassName(record.class)
      ?? normalizeClassName(record.className)
      ?? normalizeClassName(metadata?.class)
      ?? normalizeClassName(metadata?.className)
      ?? null
    );
  };

  function resolveAttackerElement(attacker, skill?){
    return readSkillElement(skill) ?? readBaseElement(attacker);
  }

  function resolveDefenderElement(defender){
    return readBaseElement(defender);
  }

  function getElementBonus(attackerElement, defenderElement){
    const attacker = readBaseElement(attackerElement);
    const defender = readBaseElement(defenderElement);
    if (attacker === 'neutral' || defender === 'neutral') return 0;

    if ((attacker === 'light' && defender === 'dark') || (attacker === 'dark' && defender === 'light')) {
      return ELEMENT_BONUS;
    }

    if (attacker === 'wind' || defender === 'wind') return 0;

    const attackerIndex = ELEMENT_CYCLE.indexOf(attacker /* as (typeof ELEMENT_CYCLE */)[number]);
    const defenderIndex = ELEMENT_CYCLE.indexOf(defender /* as (typeof ELEMENT_CYCLE */)[number]);
    if (attackerIndex < 0 || defenderIndex < 0) return 0;

    const expectedDefenderIndex = (attackerIndex + 1) % ELEMENT_CYCLE.length;
    return defenderIndex === expectedDefenderIndex ? ELEMENT_BONUS : 0;
  }

  function getClassBonus(attackerClass, defenderClass){
    const attacker = readClass(attackerClass);
    const defender = readClass(defenderClass);
    if (!attacker || !defender) return 0;
    return CLASS_BONUS_MAP[attacker]?.[defender] ?? 0;
  }


    canApplyBurn: boolean | null;
    synergyMode: 'damage' | 'burn' | 'auto' | null;
  };

  function getSynergyBonus(attacker, sideUnits, context?){
    const mode = context?.synergyMode ?? 'auto';
    if (mode === 'damage') return 0;
    if (mode === 'burn' && context?.canApplyBurn === false) return 0;

    const attackerElement = resolveAttackerElement(attacker, context?.skill);
    if (attackerElement !== 'fire') return 0;

    const lineup = Array.isArray(sideUnits) ? sideUnits : [];
    if (lineup.length === 0) return 0;

    let hasWind = false;
    let hasFire = false;
    for (const unit of lineup) {
      const unitRecord = asRecord(unit);
      const alive = unitRecord?.alive;
      if (alive === false) continue;
      const element = readBaseElement(unit);
      if (element === 'wind') hasWind = true;
      if (element === 'fire') hasFire = true;
      if (hasWind && hasFire) return SYNERGY_BONUS;
    }

    return 0;
  }


    elementBonus: number;
    synergyBonus: number;
    totalBonus: number;
  };

  function getCounterBonusMetadata(
    attacker,
    defender,
    sideUnits?,
    context?,
  ){
    const classBonus = getClassBonus(attacker, defender);
    const attackerElement = resolveAttackerElement(attacker, context?.skill);
    const defenderElement = resolveDefenderElement(defender);
    const elementBonus = getElementBonus(attackerElement, defenderElement);
    const synergyBonus = getSynergyBonus(attacker, sideUnits, context);

    return {
      classBonus,
      elementBonus,
      synergyBonus,
      totalBonus,
    };
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveAttackerElement')) exports.resolveAttackerElement = resolveAttackerElement;
  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveDefenderElement')) exports.resolveDefenderElement = resolveDefenderElement;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getElementBonus')) exports.getElementBonus = getElementBonus;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getClassBonus')) exports.getClassBonus = getClassBonus;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getSynergyBonus')) exports.getSynergyBonus = getSynergyBonus;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getCounterBonusMetadata')) exports.getCounterBonusMetadata = getCounterBonusMetadata;
};
__modules['./combat/number-utils.ts'] = (exports, module, __require) => {
  function toFiniteNumber(value, fallback = 0){
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clampMin(value, min, fallback = 0){
    return Math.max(min, toFiniteNumber(value, fallback));
  }

  function toFloorInt(value, fallback = 0){
    return Math.floor(toFiniteNumber(value, fallback));
  }

  function toRoundedInt(value, fallback = 0){
    return Math.round(toFiniteNumber(value, fallback));
  }

  function toNonNegativeFloorInt(value, fallback = 0){
    return Math.max(0, toFloorInt(value, fallback));
  }

  function toPositiveTurns(value, fallback = 1){
    const direct = toFiniteNumber(value, NaN);
    if (!Number.isFinite(direct) || direct <= 0) return Math.max(1, Math.round(fallback));
    return Math.max(1, Math.round(direct));
  }
  function readAtkWilPower(unit){
    if (!unit) return 0;
    return Math.max(0, toFiniteNumber(unit.atk, 0) + toFiniteNumber(unit.wil, 0));
  }

  function readUnitHpState(unit){ hp: number; hpMax: number } {
    const hpMax = Math.max(1, toFloorInt(unit?.hpMax, 1));
    const hp = Math.max(0, Math.min(hpMax, toFloorInt(unit?.hp, hpMax)));
    return { hp, hpMax };
  }

  function asRecord(value){
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    return value /* as Record<string */, unknown>;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'toFiniteNumber')) exports.toFiniteNumber = toFiniteNumber;
  if (!Object.prototype.hasOwnProperty.call(exports, 'clampMin')) exports.clampMin = clampMin;
  if (!Object.prototype.hasOwnProperty.call(exports, 'toFloorInt')) exports.toFloorInt = toFloorInt;
  if (!Object.prototype.hasOwnProperty.call(exports, 'toRoundedInt')) exports.toRoundedInt = toRoundedInt;
  if (!Object.prototype.hasOwnProperty.call(exports, 'toNonNegativeFloorInt')) exports.toNonNegativeFloorInt = toNonNegativeFloorInt;
  if (!Object.prototype.hasOwnProperty.call(exports, 'toPositiveTurns')) exports.toPositiveTurns = toPositiveTurns;
  if (!Object.prototype.hasOwnProperty.call(exports, 'readAtkWilPower')) exports.readAtkWilPower = readAtkWilPower;
  if (!Object.prototype.hasOwnProperty.call(exports, 'readUnitHpState')) exports.readUnitHpState = readUnitHpState;
  if (!Object.prototype.hasOwnProperty.call(exports, 'asRecord')) exports.asRecord = asRecord;
};
__modules['./combat/perform-active-skill.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat.ts');
  const dealAbilityDamage = __dep0.dealAbilityDamage;
  const pickTarget = __dep0.pickTarget;
  const __dep1 = __require('./combat/tag-dispatch.ts');
  const applyMarkSleepSetupTag = __dep1.applyMarkSleepSetupTag;
  const dispatchGameplayTags = __dep1.dispatchGameplayTags;
  const __dep2 = __require('./data/skills.ts');
  const skillSets = __dep2.skillSets;
  const __dep3 = __require('./data/tags.ts');
  const normalizeTagList = __dep3.normalizeTagList;
  const __dep4 = __require('./summon.ts');
  const enqueueImmediate = __dep4.enqueueImmediate;
  const __dep5 = __require('./engine.ts');
  const cellReserved = __dep5.cellReserved;
  const slotToCell = __dep5.slotToCell;
  const __dep6 = __require('./aether.ts');
  const globalAetherPool = __dep6.globalAetherPool;
  const __dep7 = __require('./statuses.ts');
  const Statuses = __dep7.Statuses;
  const __dep8 = __require('./combat/unit-runtime-hooks.ts');
  const runRuntimeActiveSkill = __dep8.runRuntimeActiveSkill;
  const __dep9 = __require('./combat/chap-minh-runtime.ts');
  const activateChapMinhLink = __dep9.activateChapMinhLink;
  const refreshChapMinhOwnership = __dep9.refreshChapMinhOwnership;
  const __dep10 = __require('./combat/skill-metadata-utils.ts');
  const createSkillMetadataContext = __dep10.createSkillMetadataContext;
  const resolveSkillPayload = __dep10.resolveSkillPayload;
  const __dep11 = __require('./combat/number-utils.ts');
  const readAtkWilPower = __dep11.readAtkWilPower;
  const readUnitHpState = __dep11.readUnitHpState;
  const toFiniteNumber = __dep11.toFiniteNumber;
  const toFloorInt = __dep11.toFloorInt;
  const toPositiveTurns = __dep11.toPositiveTurns;
  const toRoundedInt = __dep11.toRoundedInt;
  const __dep12 = __require('./combat/token-side-utils.ts');
  const partitionTokensBySide = __dep12.partitionTokensBySide;
  const __dep13 = __require('./combat/skill-result.ts');
  const buildSkillResult = __dep13.buildSkillResult;
  const __dep14 = __require('./combat/tag-aliases.ts');
  const canonicalizeCombatTagsWithRule = __dep14.canonicalizeCombatTagsWithRule;
  const __dep15 = __require('./combat/apply-damage.ts');
  const consumeShieldByCurrentRatio = __dep15.consumeShieldByCurrentRatio;
  const readShieldAmount = __dep15.readShieldAmount;
  const EMPTY_TAGS= [];
  const EFFECT_APPLICATION_TAGS = new Set([
    'heal',
    'team-heal',
    'shield',
    'silence',
    'sleep',
    'mark',
    'control',
    'taunt',
    'non-heal-hp-change',
  ]);
  const DAMAGE_TARGET_TAG = 'non-heal-hp-change';
  const MONG_YEM_ID = 'mong_yem';
  const MONG_YEM_DREAM_MARK_PAYLOAD = Object.freeze({
    markId: 'me_hoac',
    markStacks,
    markMaxStacks,
    markPurgeable,
    sleepTurnsOnCap,
  });
  const BLOOD_AVATAR_ID = 'blood_avatar';
  const CHAP_MINH_ID = 'huyen_vu_chap_minh';
  const BLOOD_AVATAR_SKILL_COST = 25;
  const BLOOD_AVATAR_BLEED_STATUS = Object.freeze({
    id: 'bleed',
    kind,
    tag,
    dur,
    tick,
  } /* /* as const */ */);
  const BLOOD_AVATAR_MARK_STATUS = Object.freeze({
    id: 'huyet_an',
    kind,
    tag,
    stacks,
    maxStacks,
    purgeable,
  } /* /* as const */ */);
};
__modules['./combat/runtime-hooks/co-truong-phong.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat.ts');
  const dealAbilityDamage = __dep0.dealAbilityDamage;
  const healUnit = __dep0.healUnit;
  const pickTarget = __dep0.pickTarget;
  const __dep1 = __require('./aether.ts');
  const globalAetherPool = __dep1.globalAetherPool;
  const __dep2 = __require('./utils/fury.ts');
  const setFury = __dep2.setFury;
  const __dep3 = __require('./combat/skill-result.ts');
  const buildSkillResult = __dep3.buildSkillResult;
  const __dep4 = __require('./combat/number-utils.ts');
  const readAtkWilPower = __dep4.readAtkWilPower;
  const toFiniteNumber = __dep4.toFiniteNumber;
  const toRoundedInt = __dep4.toRoundedInt;
  const __dep5 = __require('./utils/rng.ts');
  const nextRngValue = __dep5.nextRngValue;






  const CO_TRUONG_PHONG_ID = 'co_truong_phong';
  const BASE_SWORD_GAIN_PER_TURN = 3;
  const MAX_RULE_STACKS = 5;
  const SKILL1_AE_COST = 20;
  const SKILL1_SWORD_COST = 2;
  const SKILL1_DAMAGE_RATIO = 1.5;
  const SKILL2_AE_COST = 35;
  const SKILL2_SWORD_COST = 3;
  const SKILL2_HITS = 3;
  const SKILL2_HEAL_RATIO = 0.55;
  const SKILL3_RAGE_DRAIN_PER_HIT = 8;
  const SKILL3_AE_COST_PER_TURN = 8;

  function toInt(value, fallback = 0){
    return Math.max(0, toRoundedInt(toFiniteNumber(value, fallback), fallback));
  }

  function getSwordCount(unit){
    return toInt(unit._coTruongPhongFlyingSwords, 0);
  }

  function setSwordCount(unit, value){
    unit._coTruongPhongFlyingSwords = Math.max(0, toInt(value, 0));
  }

  function getRuleStacks(unit){
    return Math.min(MAX_RULE_STACKS, toInt(unit._coTruongPhongRuleStacks, 0));
  }

  function spendSkillAether(unit, amount){
    const normalized = Math.max(0, Math.floor(toFiniteNumber(amount, 0)));
    if (normalized <= 0) return true;
    return globalAetherPool.consume(unit.side, normalized);
  }

  function reduceTargetRage(target, amount){
    if (!target?.alive || amount <= 0) return;
    setFury(target, Math.max(0, toFiniteNumber(target.fury, 0) - amount));
  }

  function drainRageOnSuccessfulHit(unit, target, dealt){
    if (!unit._coTruongPhongLawActive) return;
    if (dealt <= 0) return;
    reduceTargetRage(target, SKILL3_RAGE_DRAIN_PER_HIT);
  }

  function pickDistinctRandomEnemies(rng, enemyPool, count){
    if (enemyPool.length <= 0 || count <= 0) return [];
    if (enemyPool.length === 1) return [enemyPool[0]];
    const available = enemyPool.slice();
    const picked= [];
    const maxPick = Math.min(count, available.length);
    for (let i = 0; i < maxPick; i += 1) {
      const roll = nextRngValue(rng);
      const idx = Math.floor(Math.max(0, roll) * available.length) % available.length;
      const target = available.splice(idx, 1)[0];
      if (target) picked.push(target);
    }
    return picked;
  }

  function pickSkill1Targets(rng, enemyPool){
    if (enemyPool.length <= 0) return [];
    if (enemyPool.length >= SKILL1_SWORD_COST) {
      return pickDistinctRandomEnemies(rng, enemyPool, SKILL1_SWORD_COST);
    }
    const fallback = enemyPool[0];
    return Array.from({ length: SKILL1_SWORD_COST }, () => fallback);
  }

  function enemyLeader(unit, allTokens){
    const foe = unit.side === 'ally' ? 'enemy' : 'ally';
    const leader = allTokens.find((token) => token?.alive && token.side === foe && token.cy === 3);
    return leader ?? null;
  }

  function castSkill1Runtime(game, caster){
    const enemies = game.tokens.filter((token) => token?.alive && token.side !== caster.side);
    if (enemies.length <= 0) return 0;
    const targets = pickSkill1Targets(game.rng, enemies);
    if (targets.length <= 0) return 0;
    const base = Math.max(1, Math.floor(readAtkWilPower(caster) * SKILL1_DAMAGE_RATIO));
    let successHits = 0;
    for (const target of targets) {
      const result = dealAbilityDamage(game, caster, target, { base, attackType, skill);
      drainRageOnSuccessfulHit(caster, target, result.dealt);
      if (result.dealt > 0) successHits += 1;
    }
    return successHits;
  }

  function castSkill2Runtime(game, caster){
    const leader = enemyLeader(caster, game.tokens) ?? pickTarget(game, caster);
    if (!leader?.alive) return 0;
    const base = Math.max(1, Math.floor(readAtkWilPower(caster)));
    let successHits = 0;
    for (let i = 0; i < SKILL2_HITS; i += 1) {
      const result = dealAbilityDamage(game, caster, leader, { base, attackType, skill);
      if (result.dealt > 0) {
        successHits += 1;
        healUnit(caster, Math.max(1, Math.floor(result.dealt * SKILL2_HEAL_RATIO)));
      }
    }
    if (caster._coTruongPhongLawActive && successHits >= SKILL2_HITS) {
      reduceTargetRage(leader, SKILL3_RAGE_DRAIN_PER_HIT * SKILL2_HITS);
    }
    return successHits;
  }

  function tryCastSwordSkill(
    game,
    caster,
    skillKey,
    skill,
    tags,
    appliedTags,
    swordCost,
    aeCost,
    cast, unit) => number,
  ) {
    const swordCount = getSwordCount(caster);
    if (swordCount < swordCost) return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
    if (!spendSkillAether(caster, aeCost)) return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'insufficient-aether');
    setSwordCount(caster, swordCount - swordCost);
    const hitCount = cast(game, caster);
    return buildSkillResult(hitCount > 0, skillKey, skill, tags, appliedTags, hitCount, hitCount > 0 ? undefined : 'blocked');
  }

  const coTruongPhongRuntimeHook= {
    onActiveSkill({ game, caster, skillKey, skill, tags, appliedTags }) {
      if (caster.id !== CO_TRUONG_PHONG_ID) return null;
      const coTruongPhong = caster /* as CoTruongPhongCarrier */;
      if (skillKey === 'skill3') {
        return buildSkillResult(true, skillKey, skill, tags, appliedTags, 0);
      }
      if (skillKey === 'skill1') {
        return tryCastSwordSkill(
          game,
          coTruongPhong,
          skillKey,
          skill,
          tags,
          appliedTags,
          SKILL1_SWORD_COST,
          SKILL1_AE_COST,
          castSkill1Runtime,
        );
      }
      if (skillKey === 'skill2') {
        return tryCastSwordSkill(
          game,
          coTruongPhong,
          skillKey,
          skill,
          tags,
          appliedTags,
          SKILL2_SWORD_COST,
          SKILL2_AE_COST,
          castSkill2Runtime,
        );
      }
      return null;
    },
    onTurnStart({ unit }) {
      const coTruongPhong = unit /* as CoTruongPhongCarrier | null | undefined */;
      if (!coTruongPhong || coTruongPhong.id !== CO_TRUONG_PHONG_ID || !coTruongPhong.alive) return;
      const ruleStacks = getRuleStacks(coTruongPhong);
      const generated = BASE_SWORD_GAIN_PER_TURN + ruleStacks;
      setSwordCount(coTruongPhong, getSwordCount(coTruongPhong) + generated);
      coTruongPhong._coTruongPhongLawActive = spendSkillAether(coTruongPhong, SKILL3_AE_COST_PER_TURN);
    },
    onBasicAttackResolved({ attacker, target, dealt }) {
      const coTruongPhong = attacker /* as CoTruongPhongCarrier */;
      if (!coTruongPhong || coTruongPhong.id !== CO_TRUONG_PHONG_ID || !coTruongPhong.alive) return;
      drainRageOnSuccessfulHit(coTruongPhong, target, dealt);
    },
    onUnitDeath({ deadUnit, killer }) {
      const coTruongPhong = killer /* as CoTruongPhongCarrier | null */;
      if (!coTruongPhong || coTruongPhong.id !== CO_TRUONG_PHONG_ID || !coTruongPhong.alive) return;
      if (deadUnit.side === coTruongPhong.side) return;
      coTruongPhong._coTruongPhongRuleStacks = Math.min(MAX_RULE_STACKS, getRuleStacks(coTruongPhong) + 1);
    },
    onUnitRevive({ unit }) {
      const coTruongPhong = unit /* as CoTruongPhongCarrier */;
      if (coTruongPhong.id !== CO_TRUONG_PHONG_ID) return;
      coTruongPhong._coTruongPhongFlyingSwords = 0;
      coTruongPhong._coTruongPhongRuleStacks = 0;
      coTruongPhong._coTruongPhongLawActive = false;
    },
    onUlt({ game, caster }) {
      if (caster.id !== CO_TRUONG_PHONG_ID || !caster.alive) return false;
      const coTruongPhong = caster /* as CoTruongPhongCarrier */;
      let swords = getSwordCount(coTruongPhong);
      if (swords <= 0) return false;
      let casts = 0;
      while (swords >= SKILL2_SWORD_COST) {
        setSwordCount(coTruongPhong, swords - SKILL2_SWORD_COST);
        castSkill2Runtime(game, coTruongPhong);
        swords = getSwordCount(coTruongPhong);
        casts += 1;
        if (!coTruongPhong.alive) break;
      }
      swords = getSwordCount(coTruongPhong);
      if (coTruongPhong.alive && swords >= SKILL1_SWORD_COST) {
        setSwordCount(coTruongPhong, swords - SKILL1_SWORD_COST);
        castSkill1Runtime(game, coTruongPhong);
        casts += 1;
      }
      return casts > 0;
    },
  };

  if (!Object.prototype.hasOwnProperty.call(exports, 'coTruongPhongRuntimeHook')) exports.coTruongPhongRuntimeHook = coTruongPhongRuntimeHook;
};
__modules['./combat/runtime-hooks/duong-ha.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat.ts');
  const dealAbilityDamage = __dep0.dealAbilityDamage;
  const __dep1 = __require('./combat.ts');
  const basicAttack = __dep1.basicAttack;
  const __dep2 = __require('./aether.ts');
  const globalAetherPool = __dep2.globalAetherPool;
  const __dep3 = __require('./statuses.ts');
  const Statuses = __dep3.Statuses;
  const __dep4 = __require('./utils/fury.ts');
  const setFury = __dep4.setFury;
  const __dep5 = __require('./combat/skill-result.ts');
  const buildSkillResult = __dep5.buildSkillResult;
  const __dep6 = __require('./combat/number-utils.ts');
  const readAtkWilPower = __dep6.readAtkWilPower;
  const toFiniteNumber = __dep6.toFiniteNumber;




  const DUONG_HA_ID = 'duong_ha';
  const PASSIVE_SCALE_RATIO = 0.03;
  const SKILL1_TURN_DRAIN = 5;
  const SKILL1_RAGE_DRAIN = 10;
  const SKILL1_FOLLOWUP_RATIO = 0.5;
  const SKILL2_AE_COST = 3;
  const SKILL2_PIERCE_RATIO = 0.2;
  const SKILL3_RATIO = 0.3;
  const SKILL3_DURATION = 3;

  function resetDuongHaPassive(unit){
    const atkBonus = Math.max(0, toFiniteNumber(unit._duongHaPassiveAtkBonus, 0));
    const wilBonus = Math.max(0, toFiniteNumber(unit._duongHaPassiveWilBonus, 0));
    const hpBonus = Math.max(0, toFiniteNumber(unit._duongHaPassiveHpBonus, 0));
    if (atkBonus > 0) unit.atk = Math.max(0, Math.floor(toFiniteNumber(unit.atk, 0) - atkBonus));
    if (wilBonus > 0) unit.wil = Math.max(0, Math.floor(toFiniteNumber(unit.wil, 0) - wilBonus));
    if (hpBonus > 0) {
      unit.hpMax = Math.max(1, Math.floor(toFiniteNumber(unit.hpMax, 1) - hpBonus));
      unit.hp = Math.min(Math.max(0, toFiniteNumber(unit.hp, 0)), Math.max(1, toFiniteNumber(unit.hpMax, 1)));
    }
    unit._duongHaPassiveStacks = 0;
    unit._duongHaPassiveAtkBonus = 0;
    unit._duongHaPassiveWilBonus = 0;
    unit._duongHaPassiveHpBonus = 0;
  }

  function addPassiveStack(unit){
    const atkNow = Math.max(0, toFiniteNumber(unit.atk, 0));
    const wilNow = Math.max(0, toFiniteNumber(unit.wil, 0));
    const hpMaxNow = Math.max(1, toFiniteNumber(unit.hpMax, 1));
    const atkGain = Math.max(1, Math.floor(atkNow * PASSIVE_SCALE_RATIO));
    const wilGain = Math.max(1, Math.floor(wilNow * PASSIVE_SCALE_RATIO));
    const hpGain = Math.max(1, Math.floor(hpMaxNow * PASSIVE_SCALE_RATIO));
    unit.atk = atkNow + atkGain;
    unit.wil = wilNow + wilGain;
    unit.hpMax = hpMaxNow + hpGain;
    unit.hp = Math.min(unit.hpMax, Math.max(0, toFiniteNumber(unit.hp, 0)) + hpGain);
    unit._duongHaPassiveStacks = Math.max(0, Math.floor(toFiniteNumber(unit._duongHaPassiveStacks, 0))) + 1;
    unit._duongHaPassiveAtkBonus = Math.max(0, toFiniteNumber(unit._duongHaPassiveAtkBonus, 0) + atkGain);
    unit._duongHaPassiveWilBonus = Math.max(0, toFiniteNumber(unit._duongHaPassiveWilBonus, 0) + wilGain);
    unit._duongHaPassiveHpBonus = Math.max(0, toFiniteNumber(unit._duongHaPassiveHpBonus, 0) + hpGain);
  }

  function refreshSkill2Toggle(unit){
    const shouldActivate = unit._duongHaSkill2NextActive !== false;
    unit._duongHaSkill2NextActive = !shouldActivate;
    if (!shouldActivate) {
      unit._duongHaSkill2ActiveThisTurn = false;
      return;
    }
    unit._duongHaSkill2ActiveThisTurn = globalAetherPool.consume(unit.side, SKILL2_AE_COST);
  }

  const duongHaRuntimeHook= {
    onUlt({ game, caster }) {
      if (caster.id !== DUONG_HA_ID) return false;
      for (let i = 0; i < 3; i += 1) {
        if (!caster.alive) break;
        basicAttack(game, caster);
      }
      return true;
    },
    onActiveSkill({ caster, skillKey, skill, tags, appliedTags }) {
      if (caster.id !== DUONG_HA_ID) return null;
      if (skillKey === 'skill1' || skillKey === 'skill2') {
        return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
      }
      if (skillKey !== 'skill3') return null;
      Statuses.add(caster, { id: 'duong_ha_skill3_atk', kind, tag, attr, mode, amount, dur, tick, sourceUnitId);
      Statuses.add(caster, { id: 'duong_ha_skill3_wil', kind, tag, attr, mode, amount, dur, tick, sourceUnitId);
      Statuses.add(caster, { id: 'duong_ha_skill3_agi', kind, tag, attr, mode, amount, dur, tick, sourceUnitId);
      if (typeof caster._recalcStats === 'function') caster._recalcStats();
      return buildSkillResult(true, skillKey, skill, tags, appliedTags, 0);
    },
    onTurnStart({ unit }) {
      const duongHa = unit /* as DuongHaCarrier | null | undefined */;
      if (!duongHa || duongHa.id !== DUONG_HA_ID) return;
      if (!duongHa.alive) {
        resetDuongHaPassive(duongHa);
        Statuses.remove(duongHa, 'duong_ha_skill2_pierce');
        duongHa._duongHaSkill1ActiveThisTurn = false;
        duongHa._duongHaSkill2ActiveThisTurn = false;
        return;
      }
      duongHa._duongHaSkill1ActiveThisTurn = globalAetherPool.consume(duongHa.side, SKILL1_TURN_DRAIN);
      if (!duongHa._duongHaSkill1ActiveThisTurn) {
        duongHa._duongHaSkill2ActiveThisTurn = false;
        Statuses.remove(duongHa, 'duong_ha_skill2_pierce');
        return;
      }
      refreshSkill2Toggle(duongHa);
      Statuses.remove(duongHa, 'duong_ha_skill2_pierce');
      if (duongHa._duongHaSkill2ActiveThisTurn) {
        Statuses.add(duongHa, {
          id: 'duong_ha_skill2_pierce',
          kind,
          tag,
          power,
          dur,
          tick,
          sourceUnitId,
        });
      }
    },
    onBasicAttackResolved({ game, attacker, target, dealt }) {
      const duongHa = attacker /* as DuongHaCarrier */;
      if (duongHa.id !== DUONG_HA_ID || !duongHa.alive) return;
      if (!duongHa._duongHaSkill1ActiveThisTurn) return;
      if (dealt > 0) {
        setFury(target, Math.max(0, toFiniteNumber(target.fury, 0) - SKILL1_RAGE_DRAIN));
      }

      const followupBase = Math.max(1, Math.floor(readAtkWilPower(duongHa) * SKILL1_FOLLOWUP_RATIO));
      dealAbilityDamage(game, duongHa, target, {
        base: followupBase,
        dtype,
        attackType,
        defPen,
        skill,
      });
    },
    onUnitDeath({ game, deadUnit }) {
      if (deadUnit.id === DUONG_HA_ID) {
        resetDuongHaPassive(deadUnit /* as DuongHaCarrier */);
        return;
      }
      for (const token of game.tokens) {
        if (!token?.alive || token.id !== DUONG_HA_ID) continue;
        if (token.side === deadUnit.side) continue;
        addPassiveStack(token /* as DuongHaCarrier */);
      }
    },
    onUnitRevive({ unit }) {
      if (unit.id !== DUONG_HA_ID) return;
      const duongHa = unit /* as DuongHaCarrier */;
      resetDuongHaPassive(duongHa);
      duongHa._duongHaSkill2NextActive = true;
      duongHa._duongHaSkill1ActiveThisTurn = false;
      duongHa._duongHaSkill2ActiveThisTurn = false;
      Statuses.remove(duongHa, 'duong_ha_skill2_pierce');
    },
  };

  if (!Object.prototype.hasOwnProperty.call(exports, 'duongHaRuntimeHook')) exports.duongHaRuntimeHook = duongHaRuntimeHook;
};
__modules['./combat/runtime-hooks/ly-thanh-thu.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat.ts');
  const dealAbilityDamage = __dep0.dealAbilityDamage;
  const pickTarget = __dep0.pickTarget;
  const __dep1 = __require('./statuses.ts');
  const Statuses = __dep1.Statuses;
  const __dep2 = __require('./aether.ts');
  const globalAetherPool = __dep2.globalAetherPool;
  const __dep3 = __require('./combat/skill-result.ts');
  const buildSkillResult = __dep3.buildSkillResult;
  const __dep4 = __require('./combat/number-utils.ts');
  const readAtkWilPower = __dep4.readAtkWilPower;
  const toFiniteNumber = __dep4.toFiniteNumber;
  const toRoundedInt = __dep4.toRoundedInt;
  const __dep5 = __require('./combat/board-position-utils.ts');
  const findAliveUnitAtSlot = __dep5.findAliveUnitAtSlot;
  const isLeaderToken = __dep5.isLeaderToken;





  const LY_THANH_THU_ID = 'ly_thanh_thu';
  const PASSIVE_GAIN_RATIO = 0.1;
  const PASSIVE_MAX_PER_TURN = 3;
  const PASSIVE_MAX_STACKS = 25;
  const PASSIVE_HEAL_EVERY_STACKS = 5;
  const PASSIVE_HEAL_RATIO = 0.2;
  const PASSIVE_TRANSFER_RATIO = 0.5;
  const SKILL3_RES_ARM_RATIO = 0.2;
  const SKILL3_MAX_STACKS = 3;
  const SKILL3_STACK_DURATION_TURNS = 2;
  const BLEED_DURATION = 1;

  const FLYING_SWORD_STAGES= [
    { slots: [7, 8, 9], countsAsBasic, parkSlot,
    { slots: [9, 6, 3], countsAsBasic, parkSlot,
    { slots: [2, 3], countsAsBasic, parkSlot,
    { slots: [2, 5, 8], countsAsBasic,
  ];

  function readTurnStamp(game){
    const count = Number((game.turn /* as { turnCount: unknown } | null | undefined */)?.turnCount ?? Number.NaN);
    if (Number.isFinite(count) && count > 0) return Math.floor(count);
    return Math.max(1, Math.floor(Number((game.turn /* as { cycle: unknown } | null | undefined */)?.cycle ?? 1)));
  }

  function isSummonedUnit(unit){
    return !!unit.isMinion || unit.ownerIid != null;
  }

  function findLeader(game, side){
    for (const token of game.tokens) {
      if (!token.alive || token.side !== side) continue;
      if (isLeaderToken(token)) return token;
    }
    return null;
  }

  function getRuntimeState(game){
    const runtimeRoot = (game.runtime ??= {});
    const current = runtimeRoot._lyThanhThuRuntime /* as RuntimeState | undefined */;
    if (current) return current;
    const created= { swords: [] };
    runtimeRoot._lyThanhThuRuntime = created;
    return created;
  }

  function addPassiveStack(game, unit){
    const turnStamp = readTurnStamp(game);
    if ((unit._lyThanhThuPassiveTurnStamp ?? -1) !== turnStamp) {
      unit._lyThanhThuPassiveTurnStamp = turnStamp;
      unit._lyThanhThuPassiveTurnGain = 0;
    }

    const turnGain = Math.max(0, toRoundedInt(unit._lyThanhThuPassiveTurnGain ?? 0, 0));
    if (turnGain >= PASSIVE_MAX_PER_TURN) return;
    const stacks = Math.max(0, toRoundedInt(unit._lyThanhThuPassiveStacks ?? 0, 0));
    if (stacks >= PASSIVE_MAX_STACKS) return;

    const atkNow = Math.max(0, toFiniteNumber(unit.atk, 0));
    const wilNow = Math.max(0, toFiniteNumber(unit.wil, 0));
    const atkGain = Math.max(0, Math.floor(atkNow * PASSIVE_GAIN_RATIO));
    const wilGain = Math.max(0, Math.floor(wilNow * PASSIVE_GAIN_RATIO));
    if (atkGain <= 0 && wilGain <= 0) return;

    unit.atk = Math.max(0, Math.floor(atkNow + atkGain));
    unit.wil = Math.max(0, Math.floor(wilNow + wilGain));
    unit._lyThanhThuPassiveAtkBonus = Math.max(0, toFiniteNumber(unit._lyThanhThuPassiveAtkBonus, 0) + atkGain);
    unit._lyThanhThuPassiveWilBonus = Math.max(0, toFiniteNumber(unit._lyThanhThuPassiveWilBonus, 0) + wilGain);
    unit._lyThanhThuPassiveStacks = stacks + 1;
    unit._lyThanhThuPassiveTurnGain = turnGain + 1;

    if ((unit._lyThanhThuPassiveStacks % PASSIVE_HEAL_EVERY_STACKS) === 0) {
      const heal = Math.max(1, Math.floor(Math.max(0, toFiniteNumber(unit.hpMax, 0)) * PASSIVE_HEAL_RATIO));
      unit.hp = Math.min(
        Math.max(0, toFiniteNumber(unit.hpMax, 0)),
        Math.max(0, toFiniteNumber(unit.hp, 0)) + heal,
      );
    }
  }

  function transferPassiveStatsToLeader(game, unit){
    const leader = findLeader(game, unit.side);
    if (!leader || leader.iid === unit.iid) return;
    const atkBonus = Math.max(0, Math.floor(toFiniteNumber(unit._lyThanhThuPassiveAtkBonus, 0) * PASSIVE_TRANSFER_RATIO));
    const wilBonus = Math.max(0, Math.floor(toFiniteNumber(unit._lyThanhThuPassiveWilBonus, 0) * PASSIVE_TRANSFER_RATIO));
    if (atkBonus > 0) leader.atk = Math.max(0, Math.floor(toFiniteNumber(leader.atk, 0) + atkBonus));
    if (wilBonus > 0) leader.wil = Math.max(0, Math.floor(toFiniteNumber(leader.wil, 0) + wilBonus));
  }

  function resetPassive(unit){
    const atkBonus = Math.max(0, toFiniteNumber(unit._lyThanhThuPassiveAtkBonus, 0));
    const wilBonus = Math.max(0, toFiniteNumber(unit._lyThanhThuPassiveWilBonus, 0));
    if (atkBonus > 0) {
      unit.atk = Math.max(0, Math.floor(toFiniteNumber(unit.atk, 0) - atkBonus));
    }
    if (wilBonus > 0) {
      unit.wil = Math.max(0, Math.floor(toFiniteNumber(unit.wil, 0) - wilBonus));
    }
    unit._lyThanhThuPassiveStacks = 0;
    unit._lyThanhThuPassiveTurnStamp = undefined;
    unit._lyThanhThuPassiveTurnGain = 0;
    unit._lyThanhThuPassiveAtkBonus = 0;
    unit._lyThanhThuPassiveWilBonus = 0;
  }

  function applyBleedAtSlot(game, side, slot, sourceUnitId){
    const target = findAliveUnitAtSlot(game, side, slot);
    if (!target) return;
    Statuses.add(target, {
      id: 'bleed',
      kind,
      tag,
      dur,
      tick,
      sourceUnitId,
    });
  }

  function triggerSkill3Defense(game, caster){
    if (!globalAetherPool.consume(caster.side, 8)) return;
    const turnStamp = readTurnStamp(game);
    const expiresAtTurn = turnStamp + Math.max(0, SKILL3_STACK_DURATION_TURNS - 2);
    const stacks = caster._lyThanhThuDefenseStacks ?? [];
    if (stacks.length >= SKILL3_MAX_STACKS) {
      const oldest = stacks.shift();
      if (oldest) {
        oldest.expiresAtTurn = expiresAtTurn;
        stacks.push(oldest);
      }
      caster._lyThanhThuDefenseStacks = stacks;
      return;
    }

    const armNow = Math.max(0, toFiniteNumber(caster.arm, 0));
    const resNow = Math.max(0, toFiniteNumber(caster.res, 0));
    const armBonus = armNow * SKILL3_RES_ARM_RATIO;
    const resBonus = resNow * SKILL3_RES_ARM_RATIO;

    caster.arm = Math.max(0, armNow + armBonus);
    caster.res = Math.max(0, resNow + resBonus);
    stacks.push({ armBonus, resBonus, expiresAtTurn });
    caster._lyThanhThuDefenseStacks = stacks;
  }

  function expireDefenseStacks(game, unit){
    const stacks = unit._lyThanhThuDefenseStacks;
    if (!Array.isArray(stacks) || stacks.length === 0) return;
    const turnStamp = readTurnStamp(game);
    const remain= [];
    for (const stack of stacks) {
      if (stack.expiresAtTurn >= turnStamp) {
        remain.push(stack);
        continue;
      }
      unit.arm = Math.max(0, toFiniteNumber(unit.arm, 0) - Math.max(0, stack.armBonus));
      unit.res = Math.max(0, toFiniteNumber(unit.res, 0) - Math.max(0, stack.resBonus));
    }
    unit._lyThanhThuDefenseStacks = remain;
  }

  function runFlyingSwordStage(game, caster, stage, skill){
    let hits = 0;
    const base = Math.max(1, Math.floor(readAtkWilPower(caster)));
    const enemySide= caster.side === 'ally' ? 'enemy' : 'ally';
    for (const slot of stage.slots) {
      const target = findAliveUnitAtSlot(game, enemySide, slot);
      if (!target) continue;
      const dealt = dealAbilityDamage(game, caster, target, {
        base,
        dtype,
        attackType,
        skill,
      isAoE,
      });
      if (Math.max(0, toRoundedInt(dealt.dealt, 0)) > 0) {
        hits += 1;
      }
    }
    if (stage.parkSlot != null) {
      applyBleedAtSlot(game, enemySide, stage.parkSlot, caster.id);
    }
    return hits;
  }

  function clearDefenseStacks(unit){
    const stacks = unit._lyThanhThuDefenseStacks;
    if (!Array.isArray(stacks) || stacks.length === 0) {
      unit._lyThanhThuDefenseStacks = [];
      return;
    }
    for (const stack of stacks) {
      unit.arm = Math.max(0, toFiniteNumber(unit.arm, 0) - Math.max(0, toFiniteNumber(stack.armBonus, 0)));
      unit.res = Math.max(0, toFiniteNumber(unit.res, 0) - Math.max(0, toFiniteNumber(stack.resBonus, 0)));
    }
    unit._lyThanhThuDefenseStacks = [];
  }

  function clearFlyingSwords(game, unit){
    const runtime = getRuntimeState(game);
    const ownerKey = String(unit.iid ?? unit.id);
    runtime.swords = runtime.swords.filter((sword) => sword.ownerIid !== ownerKey);
  }

  function resetFlyingSwordForOwner(game, owner){
    clearFlyingSwords(game, owner);
  }

  const lyThanhThuRuntimeHook= {
    onActiveSkill({ game, caster, skillKey, skill, tags, appliedTags }) {
      const ltt = caster /* as LyThanhThuCarrier */;
      if (skillKey === 'skill1') {
        const target = pickTarget(game, caster);
        if (!target) return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
        const base = Math.max(1, Math.floor(readAtkWilPower(caster) * 2.5));
        dealAbilityDamage(game, caster, target, { base, dtype, attackType, skill });
        return buildSkillResult(true, skillKey, skill, tags, appliedTags, 1);
      }

      if (skillKey === 'skill2') {
        resetFlyingSwordForOwner(game, caster);
        const firstStageHits = runFlyingSwordStage(game, ltt, { slots: [1, 4, 7], countsAsBasic, parkSlot, skill);
        if (firstStageHits >= 2) {
          triggerSkill3Defense(game, ltt);
        }
        const runtime = getRuntimeState(game);
        runtime.swords.push({
          ownerIid: String(caster.iid ?? caster.id),
          stageIndex,
          waitTurns,
          parkedSlot,
        });
        return buildSkillResult(true, skillKey, skill, tags, appliedTags, firstStageHits);
      }

      if (skillKey === 'skill3') {
      return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
      }

      return null;
    },
    onTurnStart({ game, unit }) {
      const ltt = unit /* as LyThanhThuCarrier | null | undefined */;
      if (!ltt || ltt.id !== LY_THANH_THU_ID || !ltt.alive) return;
      const runtime = getRuntimeState(game);
      const ownerKey = String(ltt.iid ?? ltt.id);
      for (let index = runtime.swords.length - 1; index >= 0; index -= 1) {
        const sword = runtime.swords[index];
        if (!sword) continue;
        if (sword.ownerIid !== ownerKey) continue;
        if (sword.waitTurns > 0 && sword.parkedSlot != null) {
          const bleedSide= ltt.side === 'ally' ? 'enemy' : 'ally';
          applyBleedAtSlot(game, bleedSide, sword.parkedSlot, ltt.id);
        }
        sword.waitTurns -= 1;
        if (sword.waitTurns > 0) continue;
        const stage = FLYING_SWORD_STAGES[sword.stageIndex];
        if (!stage) {
          runtime.swords.splice(index, 1);
          continue;
        }
        const hits = runFlyingSwordStage(game, ltt, stage, null);
        if (hits >= 2) {
          triggerSkill3Defense(game, ltt);
        }
        sword.stageIndex += 1;
        if (sword.stageIndex >= FLYING_SWORD_STAGES.length) {
          runtime.swords.splice(index, 1);
        } else {
          sword.waitTurns = 1;
          sword.parkedSlot = FLYING_SWORD_STAGES[sword.stageIndex - 1]?.parkSlot;
        }
      }
    },
    onTurnEnd({ game, unit }) {
      const ltt = unit /* as LyThanhThuCarrier | null | undefined */;
      if (!ltt || ltt.id !== LY_THANH_THU_ID) return;
      expireDefenseStacks(game, ltt);
    },
    onUnitDeath({ game, deadUnit }) {
      if (deadUnit.id === LY_THANH_THU_ID) {
        const ltt = deadUnit /* as LyThanhThuCarrier */;
        transferPassiveStatsToLeader(game, ltt);
        clearDefenseStacks(ltt);
        clearFlyingSwords(game, ltt);
      }
      if (isSummonedUnit(deadUnit)) return;
      for (const token of game.tokens) {
        if (!token.alive || token.id !== LY_THANH_THU_ID) continue;
        addPassiveStack(game, token /* as LyThanhThuCarrier */);
      }
    },
    onUnitRevive({ unit }) {
      if (unit.id !== LY_THANH_THU_ID) return;
      const ltt = unit /* as LyThanhThuCarrier */;
      resetPassive(ltt);
      clearDefenseStacks(ltt);
    },
  };

  if (!Object.prototype.hasOwnProperty.call(exports, 'lyThanhThuRuntimeHook')) exports.lyThanhThuRuntimeHook = lyThanhThuRuntimeHook;
};
__modules['./combat/runtime-hooks/mong-yem.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat.ts');
  const dealAbilityDamage = __dep0.dealAbilityDamage;
  const pickTarget = __dep0.pickTarget;
  const __dep1 = __require('./statuses.ts');
  const Statuses = __dep1.Statuses;
  const __dep2 = __require('./combat/skill-result.ts');
  const buildSkillResult = __dep2.buildSkillResult;
  const __dep3 = __require('./combat/tag-dispatch.ts');
  const applyMarkSleepSetupTag = __dep3.applyMarkSleepSetupTag;
  const __dep4 = __require('./combat/number-utils.ts');
  const readAtkWilPower = __dep4.readAtkWilPower;
  const toFiniteNumber = __dep4.toFiniteNumber;
  const toPositiveTurns = __dep4.toPositiveTurns;
  const toRoundedInt = __dep4.toRoundedInt;
  const __dep5 = __require('./combat/skill-metadata-utils.ts');
  const createSkillMetadataReader = __dep5.createSkillMetadataReader;
  const __dep6 = __require('./combat/status-utils.ts');
  const getStatusEntryById = __dep6.getStatusEntryById;
  const __dep7 = __require('./utils/rng.ts');
  const nextRngValue = __dep7.nextRngValue;
  const __dep8 = __require('./combat/token-side-utils.ts');
  const partitionTokensBySide = __dep8.partitionTokensBySide;
  const sampleTokens = __dep8.sampleTokens;




  const MONG_YEM_SELF_SLEEP_FLAG = 'mong_yem_self_sleep';
  const MONG_YEM_SELF_SLEEP_GROWTH_RATIO = 0.07;
  const MONG_YEM_SELF_SLEEP_WAKE_HP_RATIO = 0.35;
  const MONG_YEM_MARK_ID = 'me_hoac';

  function clearMongYemSelfSleep(unit){
    unit._mongYemSelfSleepActive = false;
    if (!Array.isArray(unit.statuses) || unit.statuses.length === 0) return;
    for (let index = unit.statuses.length - 1; index >= 0; index -= 1) {
      const status = unit.statuses[index];
      if (!status) continue;
      if (status.id === 'sleep' || status.id === MONG_YEM_SELF_SLEEP_FLAG) {
        unit.statuses.splice(index, 1);
      }
    }
  }

  function applyMongYemSelfSleepGrowth(unit){
    const atk = Math.max(0, toFiniteNumber(unit.atk, 0));
    const wil = Math.max(0, toFiniteNumber(unit.wil, 0));
    unit.atk = Math.max(0, Math.floor(atk * (1 + MONG_YEM_SELF_SLEEP_GROWTH_RATIO)));
    unit.wil = Math.max(0, Math.floor(wil * (1 + MONG_YEM_SELF_SLEEP_GROWTH_RATIO)));
  }

  function maybeWakeMongYem(unit){
    const hpMax = Math.max(1, toFiniteNumber(unit.hpMax, 1));
    const hp = Math.max(0, toFiniteNumber(unit.hp, hpMax));
    if (hp > hpMax * MONG_YEM_SELF_SLEEP_WAKE_HP_RATIO) return;
    clearMongYemSelfSleep(unit);
  }

  function readStatusStacks(unit, statusId){
    const statusEntry = getStatusEntryById(unit, statusId);
    return Math.max(0, toRoundedInt(statusEntry?.status.stacks ?? 0, 0));
  }

  const mongYemRuntimeHook= {
    onActiveSkill({ game, caster, skillKey, skill, tags, appliedTags }) {
      const skillMeta = createSkillMetadataReader(skill);
      if (skillKey === 'skill1') {
        const duration = toPositiveTurns(skillMeta.readNumber(3, 'duration', 'turns'));
        Statuses.add(caster, {
          id: 'mong_yem_evade_basic',
          kind,
          tag,
          amount,
          dur,
          tick,
          sourceUnitId,
        });
        return buildSkillResult(true, skillKey, skill, tags, appliedTags, 0);
      }

      if (skillKey === 'skill2') {
        const duration = toPositiveTurns(skillMeta.readNumber(99, 'duration', 'turns'));
        const selfSleepDamageReduction = Math.max(
          0,
          skillMeta.readNumber(0.5, 'selfSleepDamageReduction', 'selfDamageReduction', 'damageReduction'),
        );
        Statuses.add(caster, {
          id: 'sleep',
          kind,
          tag,
          dur,
          tick,
          sourceUnitId,
        });
        Statuses.add(caster, {
          id: MONG_YEM_SELF_SLEEP_FLAG,
          kind,
          tag,
          amount,
          dur,
          tick,
          sourceUnitId,
        });
        (caster /* as MongYemStateCarrier */)._mongYemSelfSleepActive = true;
        return buildSkillResult(true, skillKey, skill, tags, appliedTags, 0);
      }

      if (skillKey !== 'skill3') return null;

      const target = pickTarget(game, caster);
      if (!target?.alive) {
        return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
      }

      const baseMultiplier = Math.max(0, toFiniteNumber(skill.damageMultiplier, 1.8));
      const bonusConfig = skillMeta.readRecord('bonusPerMark');
      const markId = typeof bonusConfig?.id === 'string' ? bonusConfig.id : MONG_YEM_MARK_ID;
      const markBonusAmount = Math.max(0, toFiniteNumber(bonusConfig?.amount, 0));
      const markBonusMax = Math.max(0, toFiniteNumber(bonusConfig?.max, 0));
      const markMaxStacks = Math.max(1, toRoundedInt(
        skillMeta.readNumber(3, 'markMaxStacks', 'maxMarkStacks'),
        3
      ));
      const sleepTurnsOnCap = toPositiveTurns(skillMeta.readNumber(1, 'sleepTurnsOnCap', 'sleepTurns'));
      const markStacks = readStatusStacks(target, markId);
      const markBonus = Math.min(markBonusMax, markStacks * markBonusAmount);
      const finalMultiplier = baseMultiplier * (1 + markBonus);
      const base = Math.max(1, Math.floor(readAtkWilPower(caster) * finalMultiplier));

      const pierceConfig = skillMeta.readRecord('pierceIfSleeping');
      const sleeping = getStatusEntryById(target, 'sleep') != null;
      const defPen = sleeping
        ? Math.max(0, toFiniteNumber(pierceConfig?.ARM ?? 0, 0), toFiniteNumber(pierceConfig?.RES ?? 0, 0))
        ;

      dealAbilityDamage(game, caster, target, { base, dtype, attackType, skill, defPen });

      applyMarkSleepSetupTag(game, caster, target, {
        markId,
        markStacks,
        markMaxStacks,
        markPurgeable,
        sleepTurnsOnCap,
      });

      let spreadHits = 0;
      const spreadConfig = skillMeta.readRecord('spreadMark');
      const spreadTargets = Math.max(0, toRoundedInt(spreadConfig?.targets, 0));
      if (sleeping && spreadTargets > 0) {
        const spreadMarkId = typeof spreadConfig?.id === 'string' ? spreadConfig.id : markId;
        const spreadStacks = Math.max(1, toRoundedInt(spreadConfig?.stacks, 1));
        const spreadMaxStacks = Math.max(1, toRoundedInt(spreadConfig?.maxStacks, markMaxStacks));
        const spreadSleepTurnsOnCap = toPositiveTurns(toFiniteNumber(spreadConfig?.sleepTurnsOnCap, sleepTurnsOnCap));
        const enemies = partitionTokensBySide(game.tokens, caster.side, { sortByBoardPosition: true }).enemyTokens;
        const spreadCandidates = sampleTokens(enemies, spreadTargets, {
          exclude: (enemy) => enemy.iid === target.iid,
          randomValue) => nextRngValue(game.rng),
        });
        for (const enemy of spreadCandidates) {
          spreadHits += 1;
          applyMarkSleepSetupTag(game, caster, enemy, {
            markId: spreadMarkId,
            markStacks,
            markMaxStacks,
            markPurgeable,
            sleepTurnsOnCap,
          });
        }
      }

      return buildSkillResult(true, skillKey, skill, tags, appliedTags, 1 + spreadHits);
    },
    onTurnStart({ unit }) {
      const mongYem = unit /* as MongYemStateCarrier | null | undefined */;
      if (!mongYem?.alive || !mongYem._mongYemSelfSleepActive) return;
      applyMongYemSelfSleepGrowth(mongYem);
      maybeWakeMongYem(mongYem);
    },
    onDamageResolved({ target }) {
      const mongYem = target /* as MongYemStateCarrier | null | undefined */;
      if (!mongYem?.alive || !mongYem._mongYemSelfSleepActive) return;
      maybeWakeMongYem(mongYem);
    },
  };

  if (!Object.prototype.hasOwnProperty.call(exports, 'mongYemRuntimeHook')) exports.mongYemRuntimeHook = mongYemRuntimeHook;
};
__modules['./combat/runtime-hooks/nguyen-le.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat.ts');
  const dealAbilityDamage = __dep0.dealAbilityDamage;
  const __dep1 = __require('./aether.ts');
  const globalAetherPool = __dep1.globalAetherPool;
  const __dep2 = __require('./statuses.ts');
  const Statuses = __dep2.Statuses;
  const __dep3 = __require('./utils/rng.ts');
  const nextRngValue = __dep3.nextRngValue;
  const __dep4 = __require('./combat/skill-result.ts');
  const buildSkillResult = __dep4.buildSkillResult;
  const __dep5 = __require('./combat/number-utils.ts');
  const readAtkWilPower = __dep5.readAtkWilPower;
  const toFiniteNumber = __dep5.toFiniteNumber;
  const __dep6 = __require('./combat/board-position-utils.ts');
  const findAliveUnitAtSlot = __dep6.findAliveUnitAtSlot;





  const NGUYEN_LE_ID = 'nguyen_le';
  const IMMUNITY_POOL = ['poison', 'stun', 'sleep', 'bleed', 'fatigue'] /* /* as const */ */;

  function countAliveInRow(game, side, slots){
    let count = 0;
    for (const slot of slots) {
      if (findAliveUnitAtSlot(game, side, slot)) count += 1;
    }
    return count;
  }

  function ensureImmunityStore(unit){
    const list = Array.isArray(unit._nguyenLeDebuffImmunities) ? unit._nguyenLeDebuffImmunities : [];
    const store = new Set();
    for (const id of list) {
      if (typeof id === 'string' && id.trim()) store.add(id.trim().toLowerCase());
    }
    unit._nguyenLeDebuffImmunities = [...store];
    return store;
  }

  function grantRandomDebuffImmunity(game, unit){
    const store = ensureImmunityStore(unit);
    const options = IMMUNITY_POOL.filter((id) => !store.has(id));
    const pickPool = options.length > 0 ? options : [...IMMUNITY_POOL];
    if (pickPool.length <= 0) return;
    const roll = nextRngValue(game.rng);
    const idx = Math.max(0, Math.floor(roll * pickPool.length)) % pickPool.length;
    const picked = pickPool[idx] ?? pickPool[0];
    if (!picked) return;
    store.add(picked);
    unit._nguyenLeDebuffImmunities = [...store];
  }

  function resetKillPassive(unit){
    const atkBonus = Math.max(0, toFiniteNumber(unit._nguyenLeAtkBonus, 0));
    const wilBonus = Math.max(0, toFiniteNumber(unit._nguyenLeWilBonus, 0));
    if (atkBonus > 0) {
      unit.atk = Math.max(0, Math.floor(toFiniteNumber(unit.atk, 0) - atkBonus));
    }
    if (wilBonus > 0) {
      unit.wil = Math.max(0, Math.floor(toFiniteNumber(unit.wil, 0) - wilBonus));
    }
    unit._nguyenLeKillStacks = 0;
    unit._nguyenLeAtkBonus = 0;
    unit._nguyenLeWilBonus = 0;
    unit._nguyenLeDebuffImmunities = [];
  }

  const nguyenLeRuntimeHook= {
    onActiveSkill({ game, caster, skillKey, skill, tags, appliedTags }) {
      if (caster.id !== NGUYEN_LE_ID) return null;

      const enemySide= caster.side === 'ally' ? 'enemy' : 'ally';
      if (skillKey === 'skill2') {
        const rows = [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ] /* /* as const */ */;
        let chosen= rows[0];
        let chosenCount = -1;
        for (const row of rows) {
          const count = countAliveInRow(game, enemySide, row);
          if (count > chosenCount) {
            chosen = row;
            chosenCount = count;
          }
        }
        if (chosenCount <= 0) {
          return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'blocked');
        }

        const cost = Math.max(0, Math.min(21, chosenCount * 7));
        if (!globalAetherPool.consume(caster.side, cost)) {
          return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'insufficient-aether');
        }

        const base = Math.max(1, Math.floor(readAtkWilPower(caster) * 1.5));
        let hits = 0;
        for (const slot of chosen) {
          const target = findAliveUnitAtSlot(game, enemySide, slot);
          if (!target) continue;
          dealAbilityDamage(game, caster, target, {
            base,
            dtype,
            attackType,
            skill,
            isAoE,
          });
          hits += 1;
        }
        return buildSkillResult(true, skillKey, skill, tags, appliedTags, hits);
      }

      if (skillKey === 'skill3') {
        if (!globalAetherPool.consume(caster.side, 20)) {
          return buildSkillResult(false, skillKey, skill, tags, appliedTags, 0, 'insufficient-aether');
        }
        Statuses.add(caster, {
          id: 'nguyen_le_skill3_atk_up',
          kind,
          tag,
          attr,
          mode,
          amount,
          dur,
          tick,
          sourceUnitId,
        });
        Statuses.add(caster, {
          id: 'nguyen_le_skill3_wil_up',
          kind,
          tag,
          attr,
          mode,
          amount,
          dur,
          tick,
          sourceUnitId,
        });
        if (typeof caster._recalcStats === 'function') {
          caster._recalcStats();
        }
        return buildSkillResult(true, skillKey, skill, tags, appliedTags, 0);
      }

      return null;
    },
    onDamageResolved({ target }) {
      const unit = target /* as NguyenLeCarrier | null | undefined */;
      if (!unit || !unit.alive || unit.id !== NGUYEN_LE_ID) return;
      const damageTaken = Math.max(0, toFiniteNumber(unit._lastDamageTaken, 0));
      const hpMax = Math.max(0, toFiniteNumber(unit.hpMax, 0));
      if (hpMax <= 0 || damageTaken <= hpMax * 0.2) return;

      const serial = Math.max(0, Math.floor(toFiniteNumber(unit._lastDamageTakenSerial, 0)));
      const turnStamp = Math.max(1, Math.floor(toFiniteNumber(unit._lastDamageTakenTurn, 1)));
      if (unit._nguyenLeSkill1LastDamageSerial === serial && unit._nguyenLeSkill1LastDamageTurn === turnStamp) return;

      if (!globalAetherPool.consume(unit.side, 10)) return;

      const heal = Math.max(1, Math.floor(readAtkWilPower(unit) * 0.5));
      unit.hp = Math.min(hpMax, Math.max(0, toFiniteNumber(unit.hp, 0)) + heal);
      unit._nguyenLeSkill1LastDamageSerial = serial;
      unit._nguyenLeSkill1LastDamageTurn = turnStamp;
    },
    onUnitDeath({ deadUnit, killer, game }) {
      if (killer && killer.id === NGUYEN_LE_ID) {
        const unit = killer /* as NguyenLeCarrier */;
        const stacks = Math.max(0, Math.floor(toFiniteNumber(unit._nguyenLeKillStacks, 0)));
        const atkNow = Math.max(0, toFiniteNumber(unit.atk, 0));
        const wilNow = Math.max(0, toFiniteNumber(unit.wil, 0));
        const atkGain = Math.max(0, Math.floor(atkNow * 0.05));
        const wilGain = Math.max(0, Math.floor(wilNow * 0.05));
        unit.atk = Math.max(0, Math.floor(atkNow + atkGain));
        unit.wil = Math.max(0, Math.floor(wilNow + wilGain));
        unit._nguyenLeKillStacks = stacks + 1;
        unit._nguyenLeAtkBonus = Math.max(0, toFiniteNumber(unit._nguyenLeAtkBonus, 0) + atkGain);
        unit._nguyenLeWilBonus = Math.max(0, toFiniteNumber(unit._nguyenLeWilBonus, 0) + wilGain);
        grantRandomDebuffImmunity(game, unit);
      }

      if (deadUnit.id === NGUYEN_LE_ID) {
        resetKillPassive(deadUnit /* as NguyenLeCarrier */);
      }
    },
    onUnitRevive({ unit }) {
      if (unit.id !== NGUYEN_LE_ID) return;
      resetKillPassive(unit /* as NguyenLeCarrier */);
    },
  };

  if (!Object.prototype.hasOwnProperty.call(exports, 'nguyenLeRuntimeHook')) exports.nguyenLeRuntimeHook = nguyenLeRuntimeHook;
};
__modules['./combat/runtime-hooks/registry.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat/runtime-hooks/mong-yem.ts');
  const mongYemRuntimeHook = __dep0.mongYemRuntimeHook;
  const __dep1 = __require('./combat/runtime-hooks/ly-thanh-thu.ts');
  const lyThanhThuRuntimeHook = __dep1.lyThanhThuRuntimeHook;
  const __dep2 = __require('./combat/runtime-hooks/nguyen-le.ts');
  const nguyenLeRuntimeHook = __dep2.nguyenLeRuntimeHook;
  const __dep3 = __require('./combat/runtime-hooks/duong-ha.ts');
  const duongHaRuntimeHook = __dep3.duongHaRuntimeHook;
  const __dep4 = __require('./combat/runtime-hooks/co-truong-phong.ts');
  const coTruongPhongRuntimeHook = __dep4.coTruongPhongRuntimeHook;



  const UNIT_RUNTIME_HOOKS= Object.freeze({
    mong_yem: mongYemRuntimeHook,
    ly_thanh_thu,
    nguyen_le,
    duong_ha,
    co_truong_phong,
  });

  function getUnitRuntimeHook(unitId){
    if (!unitId) return null;
    return UNIT_RUNTIME_HOOKS[unitId] ?? null;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'UNIT_RUNTIME_HOOKS')) exports.UNIT_RUNTIME_HOOKS = UNIT_RUNTIME_HOOKS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getUnitRuntimeHook')) exports.getUnitRuntimeHook = getUnitRuntimeHook;
};
__modules['./combat/runtime-hooks/types.ts'] = (exports, module, __require) => {

};
__modules['./combat/skill-metadata-utils.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat/number-utils.ts');
  const asRecord = __dep0.asRecord;
  const toFiniteNumber = __dep0.toFiniteNumber;

  function resolveSkillRootRecords(skill){
    root: SkillRecord;
    metadata: SkillRecord | null;
    meta: SkillRecord | null;
    payload: SkillRecord | null;
    metadataPayload: SkillRecord | null;
    metaPayload: SkillRecord | null;
  } {
    const root = skill /* as SkillRecord */;
    const metadata = asRecord(root.metadata);
    const meta = asRecord(root.meta);
    const payload = asRecord(root.payload);
    const metadataPayload = asRecord(metadata?.payload);
    const metaPayload = asRecord(meta?.payload);
    return { root, metadata, meta, payload, metadataPayload, metaPayload };
  }

  function collectSkillRecords(
    rootRecords,
  ){
    const { root, metadata, meta, payload, metadataPayload, metaPayload } = rootRecords;
    const collected= [];
    const seen = new Set();
    const pushUnique = (record)=> {
      if (!record || seen.has(record)) return;
      seen.add(record);
      collected.push(record);
    };
    pushUnique(root);
    pushUnique(payload);
    pushUnique(metadata);
    pushUnique(metadataPayload);
    pushUnique(meta);
    pushUnique(metaPayload);
    return collected;
  }

  function buildSkillPayload(records){
    const { root, payload, metadataPayload, metaPayload } = records;
    const payloadCandidates = [payload, metadataPayload, metaPayload];
    const payloadRecord = payloadCandidates.find((entry) => !!entry) ?? null;
    return {
      ...(payloadRecord ?? {}),
      ...root,
    };
  }

  function createSkillNumberReader(records){
    return (fallback, ...keys)=> {
      for (const key of keys) {
        for (const record of records) {
          const value = toFiniteNumber(record[key], NaN);
          if (Number.isFinite(value)) return value;
        }
      }
      return fallback;
    };
  }
};
__modules['./combat/skill-result.ts'] = (exports, module, __require) => {



  function buildSkillResult(
    ok,
    skillKey,
    skill,
    tags,
    appliedTags,
    targetCount,
    reason?,
  ){
    return {
      ok,
      skillKey,
      skill,
      tags,
      appliedTags,
      targetCount,
      ...(reason ? { reason } {}),
    };
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'buildSkillResult')) exports.buildSkillResult = buildSkillResult;
};
__modules['./combat/status-utils.ts'] = (exports, module, __require) => {

};
__modules['./combat/tag-aliases.ts'] = (exports, module, __require) => {
  const RULE_TAG_ALIASES = Object.freeze<Record<string, RuleTag>>({
    axiom: 'axiom-rule',
    'axiom-rule': 'axiom-rule',
    'tiên đề': 'axiom-rule',
    'tien-de': 'axiom-rule',
    'than-tinh': 'axiom-rule',
    'thần tính': 'axiom-rule',
    'thần_tính': 'axiom-rule',
    'than_tinh': 'axiom-rule',
    'divine-nature': 'axiom-rule',
    'thần tính thuộc axiom': 'axiom-rule',
    'than-tinh-thuoc-axiom': 'axiom-rule',

    'global-rule': 'global-rule',
    'quy tắc': 'global-rule',
    'quy-tac': 'global-rule',
    'tag cấp độ cao': 'global-rule',
    'tag-cap-do-cao': 'global-rule',
    'tag cấp độ cao hơn pháp tắc': 'global-rule',
    'tag-cap-do-cao-hon-phap-tac': 'global-rule',
    'cấp độ cao hơn pháp tắc': 'global-rule',
    'cap-do-cao-hon-phap-tac': 'global-rule',
    'quy tắc cấp cao': 'global-rule',
    'quy-tac-cap-cao': 'global-rule',

    'doctrine-rule': 'doctrine-rule',
    'pháp tắc': 'doctrine-rule',
    'phap-tac': 'doctrine-rule',
  });

  const COMBAT_TAG_ALIASES = Object.freeze<Record<string, string>>({
    'self-and-ally': 'ally',
    'ally-and-self': 'ally',
    'ban_than_lan_dong_minh': 'ally',
    'ban-than-lan-dong-minh': 'ally',
    'ban than lan dong minh': 'ally',
    'bản thân lẫn đồng minh': 'ally',
    'random-single': 'random-target',
    'single-target-random': 'random-target',
    'đơn mục tiêu ngẫu nhiên': 'random-target',
    'all-enemy': 'aoe',
    'kẻ địch': 'enemy',
    'lap-tuc': 'instant',
    'lập tức': 'instant',
    'pháp tắc: luyện ngục kiếm trận': 'doctrine-rule',
    'phap-tac-luyen-nguc-kiem-tran': 'doctrine-rule',
    'muc-tieu-leader': 'leader-target',
    'mục tiêu leader': 'leader-target',
    'mục tiêu: leader': 'leader-target',
    'target-leader': 'leader-target',

    'đơn mục tiêu': 'single-target',
    'don-muc-tieu': 'single-target',
    'đa mục tiêu': 'multi-target',
    'da-muc-tieu': 'multi-target',
    'ngẫu nhiên: kẻ địch': 'random-aoe',
    'ngau-nhien-ke-dich': 'random-aoe',
    'ngẫu nhiên: đồng minh': 'ally',
    'ngau-nhien-dong-minh': 'ally',
    'aoe: toàn sân': 'aoe',
    'aoe-toan-san': 'aoe',
    'toàn sân': 'aoe',
    'toan-san': 'aoe',
    'bản thân': 'self',
    'ban-than': 'self',
    'tiêu hao: aether': 'aether-cost',
    'tieu-hao-aether': 'aether-cost',
    'tiêu hao: hp': 'hp-cost',
    'tieu-hao-hp': 'hp-cost',
    'hồi phục': 'heal',
    'hoi-phuc': 'heal',
    'không phải hồi phục': 'non-heal-hp-change',
    'khong-phai-hoi-phuc': 'non-heal-hp-change',
    'khống chế: câm lặng': 'silence',
    'khong-che-cam-lang': 'silence',
    'độc nhất': 'unique-global',
    'doc-nhat': 'unique-global',
    'điều kiện': 'condition',
    'dieu-kien': 'condition',
    'aoe cố định': 'aoe',
    'aoe co dinh': 'aoe',
    'aoe ngẫu nhiên': 'random-aoe',
    'aoe ngau nhien': 'random-aoe',
    'đa mục tiêu: đồng minh': 'ally',
    'da muc tieu: dong minh': 'ally',
    'aoe: toàn bộ kẻ địch': 'aoe',
    'aoe: toan bo ke dich': 'aoe',
    'khống chế: ngủ': 'sleep',
    'khong-che-ngu': 'sleep',
    'khống chế: khiêu khích': 'taunt',
    'khong-che-khieu-khich': 'taunt',
    'câm lặng': 'silence',
    'cam-lang': 'silence',
    'tạo khiên': 'shield',
    'tao-khien': 'shield',
    'hồi phục đội': 'team-heal',
    'hoi-phuc-doi': 'team-heal',
    'đa mục tiêu ngẫu nhiên': 'random-aoe',
    'da-muc-tieu-ngau-nhien': 'random-aoe',
    'quy tắc: tái sinh': 'global-rule',
    'quy-tac-tai-sinh': 'global-rule',
    'quy tắc: cấm hồi sinh': 'global-rule',
    'quy-tac-cam-hoi-sinh': 'global-rule',
    'quy tắc: bất tử': 'global-rule',
    'quy-tac-bat-tu': 'global-rule',
    'pháp tắc: kiên định': 'doctrine-rule',
    'phap-tac-kien-dinh': 'doctrine-rule',
    'pháp tắc: cấm chữa trị': 'doctrine-rule',
    'phap-tac-cam-chua-tri': 'doctrine-rule',
    'pháp tắc: cấm hồi phục': 'doctrine-rule',
    'phap-tac-cam-hoi-phuc': 'doctrine-rule',
    'tuyệt đối': 'axiom-rule',
    'tuyet-doi': 'axiom-rule',
    'quy tắc: bất động như sơn': 'global-rule',
    'quy-tac-bat-dong-nhu-son': 'global-rule',
    'quy tắc: sự trở về của hư không': 'global-rule',
    'quy-tac-su-tro-ve-cua-hu-khong': 'global-rule',
    'sát thương tự thân': 'non-heal-hp-change',
    'sat-thuong-tu-than': 'non-heal-hp-change',
    'aoe: hàng dọc': 'column-aoe',
    'aoe-hang-doc': 'column-aoe',
    'aoe hàng dọc': 'column-aoe',
    'hang-doc': 'column-aoe',
    'aoe: vùng chữ thập': 'cross-aoe',
    'aoe-vung-chu-thap': 'cross-aoe',
    'vùng chữ thập': 'cross-aoe',
    'vung-chu-thap': 'cross-aoe',
    'vùng chữ +': 'cross-aoe',
    'vung-chu-+': 'cross-aoe',
    'tự động': 'instant',
    'tu-dong': 'instant',

    'debuff: mê hoặc': 'mark',
    'debuff-me-hoac': 'mark',
    'mê hoặc': 'mark',
    'me-hoac': 'mark',
    'gắn stack': 'mark',
    'gan-stack': 'mark',
    'cộng dồn': 'mark',
    'cong-don': 'mark',
    'không thể tẩy xóa': 'non-purgeable-mark',
    'khong-the-tay-xoa': 'non-purgeable-mark',
    'không thể bị xóa': 'non-purgeable-mark',
    'khong-the-bi-xoa': 'non-purgeable-mark',
    'vfx: biến đổi': 'vfx-transform',
    'vfx-bien-doi': 'vfx-transform',
    'nội tại': 'passive',
    'noi-tai': 'passive',
    'sát thương hỗn hợp': 'mixed-damage',
    'sat-thuong-hon-hop': 'mixed-damage',

    'huyết giáp': 'shield',
    'huyet-giap': 'shield',
    'huyết nô': 'summon',
    'huyet-no': 'summon',
    'huyết tế': 'hp-cost',
    'huyet-te': 'hp-cost',
    'huyết hải lĩnh vực': 'global-rule',
    'huyet-hai-linh-vuc': 'global-rule',
    'huyết thần lĩnh vực': 'global-rule',
    'huyet-than-linh-vuc': 'global-rule',
    'huyết thần': 'axiom-rule',
    'huyet-than': 'axiom-rule',
    
    'hào quang': 'aura',
    'hao-quang': 'aura',
    'buff: hào quang': 'aura',
    'buff-hao-quang': 'aura',
    'debuff vĩnh viễn': 'permanent-debuff',
    'debuff-vinh-vien': 'permanent-debuff',
    'buff vĩnh viễn': 'permanent-buff',
    'buff-vinh-vien': 'permanent-buff',
    'miễn khống chế': 'control-immunity',
    'mien-khong-che': 'control-immunity',
    'sát thương chuẩn': 'true-damage',
    'sat-thuong-chuan': 'true-damage',
    'combo': 'combo',
    'vfx: combo': 'combo',
    'vfx-combo': 'combo',
    'hoảng sợ': 'control',
    'hoang-so': 'control',
    'fear': 'control',
    'cấm hồi sinh': 'anti-revive',
    'cam-hoi-sinh': 'anti-revive',
    'pháp tắc: tái sinh': 'doctrine-rule',
  });

  const COMBAT_TAG_PRIORITY = Object.freeze<Record<string, number>>({
    'axiom-rule': 500,
    'global-rule': 400,
    'doctrine-rule': 300,
    'single-target': 220,
    'leader-target': 220,
    self,
    ally,
    enemy,
    'random-target': 210,
    'multi-target': 210,
    'random-aoe': 210,
    'column-aoe': 210,
    'cross-aoe': 210,
    aoe,
    mark,
    'permanent-buff': 160,
    'permanent-debuff': 160,
    aura,
    passive,
    'mixed-damage': 130,
    'true-damage': 130,
    combo,
    'control-immunity': 122,
    'vfx-transform': 120,
    'sleep-setup': 120,
    'non-purgeable-mark': 120,
  });


  const RULE_TAG_SET = new Set(['doctrine-rule', 'global-rule', 'axiom-rule']);

  const RULE_TAG_PRIORITY = Object.freeze<Record<RuleTag, number>>({
    'doctrine-rule': COMBAT_TAG_PRIORITY['doctrine-rule'] ?? 0,
    'global-rule': COMBAT_TAG_PRIORITY['global-rule'] ?? 0,
    'axiom-rule': COMBAT_TAG_PRIORITY['axiom-rule'] ?? 0,
  });

  const CONFLICT_RULE_RANK_PRIORITY = Object.freeze<Record<string, number>>({
    SSR: 1,
    UR,
    PRIME,
  });

  function toConflictScore(value){
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, numeric);
  }

  function readUnitRankScore(unit){
    const key = String(unit?.rank ?? '').trim().toUpperCase();
    return CONFLICT_RULE_RANK_PRIORITY[key] ?? 0;
  }

  function readUnitCultivationScore(unit){
    if (!unit) return 0;
    const direct = toConflictScore(unit.tuVi ?? unit.tuvi ?? unit.level ?? unit.lv);
    if (direct > 0) return direct;
    const cultivation = unit.cultivation /* as Record<string */, unknown> | undefined;
    if (!cultivation || typeof cultivation !== 'object') return 0;
    const realm = toConflictScore(cultivation.realm);
    const subRealm = toConflictScore(cultivation.subRealm);
    return realm * 100 + subRealm;
  }

  function readUnitStarsScore(unit){
    if (!unit) return 0;
    return toConflictScore(unit.stars ?? unit.star);
  }

  function readUnitAwakenScore(unit){
    if (!unit) return 0;
    if (typeof unit.awakened === 'boolean') return unit.awakened ? 1 : 0;
    return toConflictScore(unit.awaken ?? unit.awakened);
  }

  function shouldCompareAwakenScore(
    left,
    right,
  ){
    return readUnitAwakenScore(left) > 0 && readUnitAwakenScore(right) > 0;
  }

  function readUnitCpScore(unit){
    if (!unit) return 0;
    return toConflictScore(unit.cp ?? unit.power);
  }

  function compareConflictScore(left, right){
    if (left > right) return 1;
    if (left < right) return -1;
    return 0;
  }

  function compareRuleTagPriority(
    left,
    right,
  ){
    const leftPriority = left ? (RULE_TAG_PRIORITY[left] ?? 0) ;
    const rightPriority = right ? (RULE_TAG_PRIORITY[right] ?? 0) ;
    return compareConflictScore(leftPriority, rightPriority);
  }

  function compareRuleConflictUnitPriority(
    left,
    right,
  ){
    const checks = [
      compareConflictScore(readUnitRankScore(left), readUnitRankScore(right)),
      compareConflictScore(readUnitCultivationScore(left), readUnitCultivationScore(right)),
      compareConflictScore(readUnitStarsScore(left), readUnitStarsScore(right)),
    ];
    for (const result of checks) {
      if (result !== 0) return result;
    }

    if (shouldCompareAwakenScore(left, right)) {
      const awakenComparison = compareConflictScore(readUnitAwakenScore(left), readUnitAwakenScore(right));
      if (awakenComparison !== 0) return awakenComparison;
    }

    return compareConflictScore(readUnitCpScore(left), readUnitCpScore(right));
  }

  function hasRuleTagAtLeast(tags, minimum){
    const minimumPriority = RULE_TAG_PRIORITY[minimum] ?? 0;
    for (const tag of tags) {
      const priority = RULE_TAG_PRIORITY[tag /* as RuleTag */];
      if ((priority ?? -1) >= minimumPriority) return true;
    }
    return false;
  }

  function hasRuleTagPriorityAtLeast(
    tag,
    minimum,
  ){
    if (!tag) return false;
    const minimumPriority = RULE_TAG_PRIORITY[minimum] ?? 0;
    const priority = RULE_TAG_PRIORITY[tag /* as RuleTag */];
    return (priority ?? -1) >= minimumPriority;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'compareRuleTagPriority')) exports.compareRuleTagPriority = compareRuleTagPriority;
  if (!Object.prototype.hasOwnProperty.call(exports, 'compareRuleConflictUnitPriority')) exports.compareRuleConflictUnitPriority = compareRuleConflictUnitPriority;
  if (!Object.prototype.hasOwnProperty.call(exports, 'hasRuleTagAtLeast')) exports.hasRuleTagAtLeast = hasRuleTagAtLeast;
  if (!Object.prototype.hasOwnProperty.call(exports, 'hasRuleTagPriorityAtLeast')) exports.hasRuleTagPriorityAtLeast = hasRuleTagPriorityAtLeast;
};
__modules['./combat/tag-dispatch.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat/apply-damage.ts');
  const applyDamage = __dep0.applyDamage;
  const grantShield = __dep0.grantShield;
  const __dep1 = __require('./combat/number-utils.ts');
  const toFiniteNumber = __dep1.toFiniteNumber;
  const toPositiveTurns = __dep1.toPositiveTurns;
  const toRoundedInt = __dep1.toRoundedInt;
  const __dep2 = __require('./statuses.ts');
  const Statuses = __dep2.Statuses;
  const __dep3 = __require('./data/tags.ts');
  const normalizeTagList = __dep3.normalizeTagList;
  const __dep4 = __require('./combat.ts');
  const dealAbilityDamage = __dep4.dealAbilityDamage;
  const healUnit = __dep4.healUnit;
  const __dep5 = __require('./utils/rng.ts');
  const nextRngValue = __dep5.nextRngValue;
  const __dep6 = __require('./combat/status-utils.ts');
  const ensureStatusList = __dep6.ensureStatusList;
  const getStatusEntryById = __dep6.getStatusEntryById;
  const __dep7 = __require('./combat/token-side-utils.ts');
  const partitionTokensBySide = __dep7.partitionTokensBySide;
  const sampleTokens = __dep7.sampleTokens;
  const __dep8 = __require('./combat/tag-aliases.ts');
  const canonicalizeCombatTagsWithRule = __dep8.canonicalizeCombatTagsWithRule;
  const compareRuleConflictUnitPriority = __dep8.compareRuleConflictUnitPriority;
  const compareRuleTagPriority = __dep8.compareRuleTagPriority;
  const __dep9 = __require('./combat/board-position-utils.ts');
  const createCrossSlotLookup = __dep9.createCrossSlotLookup;
  const isLeaderToken = __dep9.isLeaderToken;
  const readBoardPosition = __dep9.readBoardPosition;
  const selectTargetsByBoardPredicate = __dep9.selectTargetsByBoardPredicate;
};
__modules['./combat/token-side-utils.ts'] = (exports, module, __require) => {

};
__modules['./combat/unit-runtime-hooks.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat/runtime-hooks/registry.ts');
  const getUnitRuntimeHook = __dep0.getUnitRuntimeHook;
  const UNIT_RUNTIME_HOOKS = __dep0.UNIT_RUNTIME_HOOKS;








  function forEachRuntimeHook(game, callback, hook) => void){
    for (const token of game.tokens) {
      if (!token) continue;
      const hook = getUnitRuntimeHook(token.id);
      if (!hook) continue;
      callback(token, hook);
    }
  }

  exports.getUnitRuntimeHook = getUnitRuntimeHook;

  function runRuntimeTurnStart(game, unit){
    if (!unit) return;
    getUnitRuntimeHook(unit.id)?.onTurnStart?.({ game, unit });
  }

  function runRuntimeActionEnd(game, unit){
    if (!unit) return;
    getUnitRuntimeHook(unit.id)?.onActionEnd?.({ game, unit });
  }

  function runRuntimeTurnEnd(game, unit){
    if (!unit) return;
    getUnitRuntimeHook(unit.id)?.onTurnEnd?.({ game, unit });
  }

  function runRuntimeDamageResolved(target){
    if (!target) return;
    getUnitRuntimeHook(target.id)?.onDamageResolved?.({ target });
  }

  function runRuntimeActiveSkill(ctx){
    return getUnitRuntimeHook(ctx.caster.id)?.onActiveSkill?.(ctx) ?? null;
  }

  function runRuntimeUlt(ctx){
    return getUnitRuntimeHook(ctx.caster.id)?.onUlt?.(ctx) === true;
  }

  function runRuntimeUnitDeath(ctx){
    const handledUnitIds = new Set();
    forEachRuntimeHook(ctx.game, (unit, hook) => {
      if (!hook.onUnitDeath) return;
      if (handledUnitIds.has(unit.id)) return;
      handledUnitIds.add(unit.id);
      hook.onUnitDeath(ctx);
    });
  }

  function runRuntimeUnitRevive(ctx){
    const hook = getUnitRuntimeHook(ctx.unit.id);
    hook?.onUnitRevive?.(ctx);
  }

  function listRuntimeHookUnitIds(){
    return Object.keys(UNIT_RUNTIME_HOOKS);
  }

  function runRuntimeBasicAttackResolved(ctx){
    if (!ctx.attacker?.alive || !ctx.target) return;
    getUnitRuntimeHook(ctx.attacker.id)?.onBasicAttackResolved?.(ctx);
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'runRuntimeTurnStart')) exports.runRuntimeTurnStart = runRuntimeTurnStart;
  if (!Object.prototype.hasOwnProperty.call(exports, 'runRuntimeActionEnd')) exports.runRuntimeActionEnd = runRuntimeActionEnd;
  if (!Object.prototype.hasOwnProperty.call(exports, 'runRuntimeTurnEnd')) exports.runRuntimeTurnEnd = runRuntimeTurnEnd;
  if (!Object.prototype.hasOwnProperty.call(exports, 'runRuntimeDamageResolved')) exports.runRuntimeDamageResolved = runRuntimeDamageResolved;
  if (!Object.prototype.hasOwnProperty.call(exports, 'runRuntimeActiveSkill')) exports.runRuntimeActiveSkill = runRuntimeActiveSkill;
  if (!Object.prototype.hasOwnProperty.call(exports, 'runRuntimeUlt')) exports.runRuntimeUlt = runRuntimeUlt;
  if (!Object.prototype.hasOwnProperty.call(exports, 'runRuntimeUnitDeath')) exports.runRuntimeUnitDeath = runRuntimeUnitDeath;
  if (!Object.prototype.hasOwnProperty.call(exports, 'runRuntimeUnitRevive')) exports.runRuntimeUnitRevive = runRuntimeUnitRevive;
  if (!Object.prototype.hasOwnProperty.call(exports, 'listRuntimeHookUnitIds')) exports.listRuntimeHookUnitIds = listRuntimeHookUnitIds;
  if (!Object.prototype.hasOwnProperty.call(exports, 'runRuntimeBasicAttackResolved')) exports.runRuntimeBasicAttackResolved = runRuntimeBasicAttackResolved;
};
__modules['./config.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/config.ts
  const __dep0 = __require('./config/schema.ts');
  const parseGameConfig = __dep0.parseGameConfig;


  const daylightTheme = {
    sky: {
      top: '#1b2434',
      mid,
      bottom,
      glow, 236, 205, 0.35)',
    },
    horizon,
      glow, 236, 205, 0.55)',
      height,
      thickness,
    },
    ground,
      accent,
      bottom,
      highlight,
      parallax,
      topScale,
      bottomScale,
    },
  } /* satisfies SceneTheme */;

  const backgroundDefinitions = {
    daylight: {
      props: [
        {
          type: 'stone-obelisk',
          cell, cy,
          offset, y,
          scale,
          alpha,
        },
        {
          type: 'stone-obelisk',
          cell, cy,
          offset, y,
          scale,
          alpha,
          flip,
        },
        {
          type: 'sun-banner',
          cell, cy,
          depth,
          offset, y,
          sortBias,
          scale,
          alpha,
        },
        {
          type: 'sun-banner',
          cell, cy,
          depth,
          offset, y,
          sortBias,
          scale,
          alpha,
          flip,
        },
      ],
    },
  } /* satisfies Record<string */, BackgroundDefinitionConfig>;

  const rawConfig = {
    GRID_COLS: 7,
    GRID_ROWS,
    ALLY_COLS,
    ENEMY_COLS,
    COST_CAP,
    SUMMON_LIMIT,
    HAND_SIZE,
    FOLLOWUP_CAP_DEFAULT,

    fury,
      ultCost,
      specialMax, ultCost,
      caps,
        perSkill,
        perHit,
      gain,
        dealSingle, crit, kill, targetRatio,
        dealAoePerTarget, perTarget, crit, kill, targetRatio,
        damageTaken, selfRatio,
      drain,
        perTargetPct,
        skillTotalCap,

    turnOrder, 4, 7, 2, 5, 8, 3, 6, 9],
      sides, 'enemy']
    },

    // === AI tuning ===
    AI: {
      WEIGHTS: {
        pressure: 0.42,
        safety,
        eta,
        summon,
        kitInstant,
        kitDefense,
        kitRevive,
      ROW_CROWDING_PENALTY,
      ROLE, back,
        Warrior, back,
        Ranger, back,
        Mage, back,
        Assassin, back,
        Support, back,
        Summoner, back, summonBoost, DEBUG,

    // === UI constants (C2) ===
    UI: {                           // <-- bỏ dấu phẩy ở đầu
      PAD: 12,
      BOARD_MAX_W,
      BOARD_MIN_H,
      BOARD_H_RATIO,
      BOARD_VERTICAL_ALIGN,
      MAX_DPR,
      MAX_PIXEL_AREA,
      CARD_GAP,
      CARD_MIN,
    ANIMATION,
      meleeDurationMs,
  // === Debug flags (W0-J1) ===
    DEBUG: {
     SHOW_QUEUED: true,        // vẽ unit "Chờ Lượt" cho phe mình (ally) khi có
     SHOW_QUEUED_ENEMY: false  // kẻ địch không thấy (đúng design)
   },
   PERFORMANCE,
      LOW_POWER_DPR,
      LOW_POWER_SHADOWS,        // true: luôn ưu tiên preset bóng rẻ tiền
      LOW_SHADOW_PRESET: 'off',        // 'off' | 'medium' | 'soft' khi LOW_POWER_SHADOWS bật
      SHADOW_MEDIUM_THRESHOLD: 8,      // ≥ số token này thì giảm blur thay vì tắt hẳn
      SHADOW_DISABLE_THRESHOLD: 10,    // ≥ số token này thì chuyển sang preset rẻ nhất
      MEDIUM_SHADOW_PRESET: 'medium',  // 'medium' | 'soft' | 'off' khi đạt ngưỡng medium
      HIGH_LOAD_SHADOW_PRESET: 'off',  // preset áp dụng khi đạt ngưỡng disable
      SHADOW_HIGH_DPR_CUTOFF: 1.8,     // DPI (dpr) cao hơn ngưỡng sẽ giảm bóng
      HIGH_DPR_SHADOW_PRESET: 'medium' // preset cho màn hình dpr cao
    },
    COLORS,
      enemy,
      mid,
      line,
      tokenText,
    SCENE,
      CURRENT_THEME,
      THEMES,
      },
    },
    CURRENT_BACKGROUND,
    BACKGROUNDS,
    CAMERA,
  } /* satisfies GameConfig */;

  const parsedConfig = parseGameConfig(rawConfig); // behavior-preserving validation
  Object.freeze(parsedConfig);

  const CFG= parsedConfig;

  // Camera presets (giữ nguyên)

  const CAM= Object.freeze({
    landscape_oblique: { rowGapRatio: 0.62, topScale, depthScale,
    portrait_leader45, topScale, depthScale,
  });
  // === Token render style ===
  const TOKEN_STYLE= 'chibi';

  // Proportions cho chibi (tính theo bán kính cơ sở r)
  const CHIBI= {
    // đường đậm hơn + tỉ lệ chibi mập mạp (đầu to, tay chân ngắn)
    line: 3,
    headR,   // đầu to hơn
    torso: 0.70,   // thân ngắn hơn
    arm: 0.58,     // tay ngắn hơn
    leg: 0.68,     // chân ngắn hơn
    weapon: 0.78,  // vũ khí ngắn hơn để cân đối
    nameAlpha: 0.7
  };

  if (!Object.prototype.hasOwnProperty.call(exports, 'CFG')) exports.CFG = CFG;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CAM')) exports.CAM = CAM;
  if (!Object.prototype.hasOwnProperty.call(exports, 'TOKEN_STYLE')) exports.TOKEN_STYLE = TOKEN_STYLE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CHIBI')) exports.CHIBI = CHIBI;
};
__modules['./config/package-lock.json'] = (exports, module, __require) => {
  const data = {"name":"arclune_lane_7x3","version":"1.0.0","lockfileVersion":3,"requires":true,"packages":{"":{"name":"arclune_lane_7x3","version":"1.0.0","license":"ISC","dependencies":{"zod":"file:tools/zod-stub"},"devDependencies":{"esbuild":"file:tools/esbuild-stub","tsx":"file:tools/tsx-stub"}},"node_modules/esbuild":{"resolved":"tools/esbuild-stub","link":true},"node_modules/zod":{"resolved":"tools/zod-stub","link":true},"node_modules/tsx":{"resolved":"tools/tsx-stub","link":true},"tools/esbuild-stub":{"name":"esbuild","version":"0.0.0-stub","dev":true},"tools/zod-stub":{"name":"zod","version":"0.0.0-stub"},"tools/tsx-stub":{"name":"tsx","version":"4.7.1","dev":true,"bin":{"tsx":"bin.js"}}}};
  module.exports = data;
  module.exports.default = data;
};
__modules['./config/package.json'] = (exports, module, __require) => {
  const data = {"name":"arclune_lane_7x3","version":"1.0.0","description":"","scripts":{"build":"npm run build:prod","build:dev":"node ../../tools/generate-loithienanh-svg.mjs && node ../../build.mjs --mode=development","build:prod":"node ../../tools/generate-loithienanh-svg.mjs && node ../../build.mjs --mode=production","dev":"APP_ENTRY=${APP_ENTRY:-src/main.ts} tsx watch $APP_ENTRY","start":"NODE_ENV=${NODE_ENV:-production} APP_ENTRY=${APP_ENTRY:-src/main.ts} tsx $APP_ENTRY","test":"jest --runInBand","typecheck":"tsc --noEmit"},"keywords":[],"author":"","license":"ISC","type":"commonjs","dependencies":{"zod":"file:tools/zod-stub"},"devDependencies":{"@types/jest":"^29.5.12","esbuild":"file:tools/esbuild-stub","jest":"^29.7.0","ts-jest":"^29.2.5","ts-node":"^10.9.2","tsx":"file:tools/tsx-stub","typescript":"^5.4.0"}};
  module.exports = data;
  module.exports.default = data;
};
__modules['./config/schema.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/config/schema.ts
  const __dep0 = __require('./../tools/zod-stub/index.js');
  const z = __dep0.z;

  const SideSchema = z.enum(['ally', 'enemy']);

  const FuryCapsSchema = z.object({
    perTurn: z.number(),
    perSkill),
    perHit)
  });


  const FuryGainEntrySchema = z.object({
    base: z.number(),
    perTarget).optional(),
    crit).optional(),
    kill).optional(),
    targetRatio).optional()
  });


  const FuryConfigSchema = z.object({
    max: z.number(),
    ultCost),
    specialMax),
      ultCost)
    })),
    caps,
    gain) }),
      dealSingle,
      dealAoePerTarget,
      damageTaken), selfRatio) })
    }),
    drain),
      perTargetPct),
      skillTotalCap)
    })
  });


  const TurnOrderSlotValueSchema = z.union([z.number(), z.string()]);

  const TurnOrderPairScanObjectSchema = z.object({
    side: SideSchema.optional(),
    slot),
    s),
    index)
  });

  const TurnOrderPairScanEntrySchema = z.union([
    z.number(),
    z.array(z.number()),
    z.tuple([SideSchema, z.number()]),
    TurnOrderPairScanObjectSchema
  ]);

  const TurnOrderConfigSchema = z.object({
    mode: z.string().optional(),
    pairScan).optional(),
    sides).optional()
  });


  const AiWeightsSchema = z.object({
    pressure: z.number(),
    safety),
    eta),
    summon),
    kitInstant),
    kitDefense),
    kitRevive)
  });


  const AiRoleWeightSchema = z.object({
    front: z.number(),
    back),
    summonBoost).optional()
  });


  const AiConfigSchema = z.object({
    WEIGHTS: AiWeightsSchema,
    ROW_CROWDING_PENALTY),
    ROLE),
    DEBUG) })
  });


  const AnimationConfigSchema = z.object({
    turnIntervalMs: z.number(),
    meleeDurationMs)
  });


  const UiConfigSchema = z.object({
    PAD: z.number(),
    BOARD_MAX_W),
    BOARD_MIN_H),
    BOARD_H_RATIO),
    BOARD_VERTICAL_ALIGN),
    MAX_DPR),
    MAX_PIXEL_AREA),
    CARD_GAP),
    CARD_MIN)
  });


  const DebugFlagsSchema = z.object({
    SHOW_QUEUED: z.boolean(),
    SHOW_QUEUED_ENEMY)
  });


  const ShadowPresetSchema = z.enum(['off', 'medium', 'soft']);

  const PerformanceConfigSchema = z.object({
    LOW_POWER_MODE: z.boolean(),
    LOW_POWER_DPR),
    LOW_POWER_SHADOWS),
    LOW_SHADOW_PRESET,
    SHADOW_MEDIUM_THRESHOLD),
    SHADOW_DISABLE_THRESHOLD),
    MEDIUM_SHADOW_PRESET,
    HIGH_LOAD_SHADOW_PRESET,
    SHADOW_HIGH_DPR_CUTOFF),
    HIGH_DPR_SHADOW_PRESET);


  const ColorPaletteSchema = z.object({
    ally: z.string(),
    enemy),
    mid),
    line),
    tokenText)
  });


  const SceneLayerSchema = z.object({
    top: z.string().optional(),
    mid).optional(),
    bottom).optional(),
    glow).optional(),
    height).optional(),
    thickness).optional(),
    color).optional(),
    accent).optional(),
    parallax).optional(),
    topScale).optional(),
    bottomScale).optional(),
    highlight).optional()
  });


  const SceneThemeObjectSchema = z.object({
    sky: SceneLayerSchema,
    horizon,
    ground);


  };

  function assertSceneTheme(
    theme,
    themeName?){
    if (typeof theme.sky.top !== 'string' || theme.sky.top.length === 0) {
      const themeLabel = themeName ? `SCENE.THEMES["${themeName}"]` : 'Scene theme';
      throw new TypeError(`${themeLabel} is missing sky.top`);
    }
  }

  function assertSceneThemeRecord(
    themes, SceneThemeObject>
  ){
    for (const [name, theme] of Object.entries(themes)) {
      assertSceneTheme(theme, name);
    }
  }

  function parseSceneTheme(
    value,
    themeName?){
    const parsed = SceneThemeObjectSchema.parse(value);
    assertSceneTheme(parsed, themeName);
    return parsed;
  }

  const SceneConfigSchema = z.object({
    DEFAULT_THEME: z.string(),
    CURRENT_THEME),
    THEMES)
  });

  };

  function parseSceneConfig(value){
    const parsed = SceneConfigSchema.parse(value);
    assertSceneThemeRecord(parsed.THEMES);
    return parsed /* as SceneConfig */;
  }

  const BackgroundPropSchema = z.object({
    type: z.string(),
    cell), cy) }),
    offset).optional(), y).optional() }).optional(),
    scale).optional(),
    alpha).optional(),
    depth).optional(),
    sortBias).optional(),
    flip).optional()
  });


  const BackgroundDefinitionSchema = z.object({
    props: z.array(BackgroundPropSchema)
  });


  const WorldMapConfigSchema = z.object({
    SCENE: SceneConfigSchema,
    CURRENT_BACKGROUND),
    BACKGROUNDS),
    CAMERA)
  });

  };

  function parseWorldMapConfig(value){
    const parsed = WorldMapConfigSchema.parse(value);
    assertSceneThemeRecord(parsed.SCENE.THEMES);
    return parsed /* as WorldMapConfig */;
  }

  const CombatTuningSchema = z.object({
    GRID_COLS: z.number(),
    GRID_ROWS),
    ALLY_COLS),
    ENEMY_COLS),
    COST_CAP),
    SUMMON_LIMIT),
    HAND_SIZE),
    FOLLOWUP_CAP_DEFAULT),
    fury,
    turnOrder,
    AI,
    ANIMATION);


  const GameConfigSchema = CombatTuningSchema
    .merge(
      z.object({
        UI: UiConfigSchema,
        DEBUG,
        PERFORMANCE,
        COLORS)
    )
    .merge(WorldMapConfigSchema);

  };

  function parseGameConfig(value){
    const parsed = GameConfigSchema.parse(value);
    assertSceneThemeRecord(parsed.SCENE.THEMES);
    return parsed /* as GameConfig */;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'GameConfigSchema')) exports.GameConfigSchema = GameConfigSchema;
  if (!Object.prototype.hasOwnProperty.call(exports, 'parseSceneTheme')) exports.parseSceneTheme = parseSceneTheme;
  if (!Object.prototype.hasOwnProperty.call(exports, 'parseSceneConfig')) exports.parseSceneConfig = parseSceneConfig;
  if (!Object.prototype.hasOwnProperty.call(exports, 'parseWorldMapConfig')) exports.parseWorldMapConfig = parseWorldMapConfig;
  if (!Object.prototype.hasOwnProperty.call(exports, 'parseGameConfig')) exports.parseGameConfig = parseGameConfig;
};
__modules['./cultivation.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./data/economy.ts');
  const getCultivationRealmEconomy = __dep0.getCultivationRealmEconomy;
  const listCultivationRealmsEconomy = __dep0.listCultivationRealmsEconomy;
  const __dep1 = __require('./utils/currency.ts');
  const spendAetherWithPriority = __dep1.spendAetherWithPriority;
};
__modules['./data/campaign-stages.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./catalog.ts');
  const ROSTER = __dep0.ROSTER;
  const __dep1 = __require('./data/skills.ts');
  const getSkillSet = __dep1.getSkillSet;
};
__modules['./data/cost-budget.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./data/tags.ts');
  const normalizeTagId = __dep0.normalizeTagId;
  const normalizeTagList = __dep0.normalizeTagList;

  const COST_MIN = 7;
  const COST_MAX = 22;

  const RANK_MULTIPLIER= Object.freeze({
    N: 0.8,
    R,
    SR,
    SSR,
    UR,
    PRIME,
  });

  const RANK_COST_ANCHOR= Object.freeze({
    N: 7,
    R,
    SR,
    SSR,
    UR,
    PRIME,
  });
  if (!Object.prototype.hasOwnProperty.call(exports, 'COST_MIN')) exports.COST_MIN = COST_MIN;
  if (!Object.prototype.hasOwnProperty.call(exports, 'COST_MAX')) exports.COST_MAX = COST_MAX;
  if (!Object.prototype.hasOwnProperty.call(exports, 'RANK_MULTIPLIER')) exports.RANK_MULTIPLIER = RANK_MULTIPLIER;
  if (!Object.prototype.hasOwnProperty.call(exports, 'RANK_COST_ANCHOR')) exports.RANK_COST_ANCHOR = RANK_COST_ANCHOR;
};
__modules['./data/economy.config.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/data/economy.config.ts

  const economyConfig = {
    currencies: [
      {
        id: 'VNT',
        name,
        shortName,
        suffix,
        ratioToBase,
        description, rơi ra từ tinh thể vỡ và hoạt động hằng ngày.'
      },
      {
        id: 'HNT',
        name,
        shortName,
        suffix,
        ratioToBase,
        description, dùng cho giao dịch phổ thông và vé gacha thường.'
      },
      {
        id: 'TNT',
        name,
        shortName,
        suffix,
        ratioToBase,
        description, chế tác pháp khí và banner cao cấp.'
      },
      {
        id: 'ThNT',
        name,
        shortName,
        suffix,
        ratioToBase,
        description, dùng trực tiếp cho lượt quay Prime và đổi thưởng cao cấp.'
      },
      {
        id: 'TT',
        name,
        shortName,
        suffix,
        ratioToBase,
        description, nhưng không tự động tiêu cho roll; công dụng Nghịch Phản Tiên Thiên/Axiom là dự kiến hoặc khóa sau hệ thống upgrade.'
      }
    ],
    cultivation,
          specialSubRealmCount,
          subRealmCosts,
            280,
            380,
            500,
            650,
            830,
            1040,
            1280,
            1550
          ],
          breakthroughCost,
        2: {
          name: 'Trúc Cơ',
          specialSubRealmCount,
          subRealmCosts,
            450,
            700,
            1050,
            1450,
            1900,
            2400,
            2950,
            3550
          ],
          breakthroughCost,
        3: {
          name: 'Kết Đan',
          specialSubRealmCount,
          subRealmCosts,
            5000,
            5900,
            6900,
            8000,
            9200,
            10500,
            11900,
            13400
          ],
          breakthroughCost,
        4: {
          name: 'Ngưng Đan',
          specialSubRealmCount,
          subRealmCosts,
            16800,
            18700,
            20700,
            22800,
            25000,
            27300,
            29700,
            32200
          ],
          breakthroughCost,
        5: {
          name: 'Đúc Phách',
          specialSubRealmCount,
          subRealmCosts,
            40500,
            45500,
            51000,
            57000,
            63500,
            70500
          ],
          breakthroughCost,
        6: {
          name: 'Luyện Hồn',
          specialSubRealmCount,
          subRealmCosts,
            122000,
            151000
          ],
          breakthroughCost,
        7: {
          name: 'Thánh Nhân',
          specialSubRealmCount,
          subRealmCosts,
            182000,
            200000,
            219000,
            239000,
            260000,
            282000,
            305000,
            329000
          ],
          breakthroughCost,
        8: {
          name: 'Thánh Hoàng',
          specialSubRealmCount,
          subRealmCosts,
            388000,
            417000,
            447000,
            478000,
            510000,
            543000,
            577000,
            612000
          ],
          breakthroughCost,
        9: {
          name: 'Thánh Tôn',
          specialSubRealmCount,
          subRealmCosts,
            690000,
            731000,
            773000,
            816000,
            860000,
            905000,
            951000,
            998000
          ],
          breakthroughCost,
    pityConfig,
        hardPity,
        softGuarantees,
      UR,
        hardPity,
        softGuarantees, pull,
      PRIME,
        hardPity,
        softGuarantees, pull,
          { tier: 'PRIME', pull,
    shopTaxBrackets, label)', rate,
      { rank: 'R', label)', rate,
      { rank: 'SR', label)', rate,
      { rank: 'SSR', label)', rate,
      { rank: 'UR', label)', rate,
      { rank: 'PRIME', label)', rate,
    lotterySplit,
      prizePool,
    initialWallet,
      HNT,
      TNT,
      ThNT,
      TT
};
__modules['./data/economy.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./../tools/zod-stub/index.js');
  const z = __dep0.z;
  const __dep1 = __require('./utils/format.ts');
  const HAS_INTL_NUMBER_FORMAT = __dep1.HAS_INTL_NUMBER_FORMAT;
  const createNumberFormatter = __dep1.createNumberFormatter;
  const __dep2 = __require('./utils/assert.ts');
  const assertDefined = __dep2.assertDefined;
  const __dep3 = __require('./data/economy.config.ts');
  const rawEconomyConfig = __dep3.default ?? __dep3;



  const currencyIdValues = ['VNT', 'HNT', 'TNT', 'ThNT', 'TT'] /* /* as const */ */;

  const CurrencyIdSchema = z.enum([...currencyIdValues] /* as [CurrencyId */, ...CurrencyId[]]);

  const CurrencySchema = z.object({
    id: CurrencyIdSchema,
    name),
    shortName),
    suffix),
    ratioToBase),
    description).optional()
  });

  const PityRuleSchema = z.object({ tier: z.string(), pull) });

  const CultivationRealmSchema = z.object({
    name: z.string(),
    specialSubRealmCount),
    subRealmCosts)),
    breakthroughCost)
  });

  const CultivationSchema = z.object({
    realms: z.record(CultivationRealmSchema)
  });

  const PityEntrySchema = z.object({
    tier: z.string(),
    hardPity),
    softGuarantees)
  });

  const PITY_TIERS = ['SSR', 'UR', 'PRIME'] /* /* as const */ */;

  const PityConfigSchema = z.object({
    SSR: PityEntrySchema,
    UR,
    PRIME);

  const ShopRankSchema = z.enum(['N', 'R', 'SR', 'SSR', 'UR', 'PRIME']);

  const ShopTaxBracketSchema = z.object({
    rank: ShopRankSchema,
    label),
    rate)
  });

  const LotterySplitSchema = z.object({
    devVault: z.number(),
    prizePool)
  });

  const EconomyConfigSchema = z.object({
    currencies: z.array(CurrencySchema),
    cultivation,
    pityConfig,
    shopTaxBrackets),
    lotterySplit,
    initialWallet)).optional()
  });

  const economyConfig = EconomyConfigSchema.parse(rawEconomyConfig);

  const pityEntries = Object.entries(economyConfig.pityConfig) /* as Array<[ */
    PityConfigKey,
    PityConfigEntry
  ]>;

  for (const [tier, entry] of pityEntries){
    if (entry.tier !== tier){
      throw new Error(`Cấu hình pity cho tier "${tier}" không khớp giá trị nội tại (${entry.tier}).`);
    }
  }

  const currencyIdMap = Object.fromEntries(
    currencyIdValues.map((id) => [id, id])
  ) /* as Record<CurrencyId */, CurrencyId>;

  const CURRENCY_ORDER= Object.freeze([...currencyIdValues]);

  const CURRENCY_IDS = Object.freeze({
    ...currencyIdMap,
    THNT);

  const CURRENCIES= freezeCloneList(economyConfig.currencies);
  const SORTED_CURRENCIES_BY_RATIO = Object.freeze(
    [...CURRENCIES].sort((a, b) => a.ratioToBase - b.ratioToBase)
  );

  function indexBy(items, getKey) => string){
    return items.reduce<Record<string, T>>((acc, item) => {
      acc[getKey(item)] = item;
      return acc;
    }, {});
  }
  function freezeCloneList(items){
    return Object.freeze(items.map((item) => Object.freeze({ ...item } /* as T */)));
  }
  function normalizeNonNegativeInt(value){
    return Math.max(0, Math.floor(Number(value ?? 0)));
  }

  const CURRENCY_INDEX= indexBy(CURRENCIES, (currency) => currency.id);
  const normalizeCurrencyId = (currencyId)=> String(currencyId ?? '').trim();
  const normalizeKeyUpper = (value)=> String(value ?? '').trim().toUpperCase();

  function getCurrency(currencyId){
    const normalizedCurrencyId = normalizeCurrencyId(currencyId);
    if (!normalizedCurrencyId) return null;
    const canonicalCurrencyId = CURRENCY_IDS[normalizedCurrencyId /* as keyof typeof CURRENCY_IDS */]
      ?? CURRENCY_IDS[normalizeKeyUpper(normalizedCurrencyId) /* as keyof typeof CURRENCY_IDS */]
      ?? normalizedCurrencyId;
    return CURRENCY_INDEX[canonicalCurrencyId] ?? null;
  }

  function listCurrencies(){
    return CURRENCIES.slice();
  }

  function convertCurrency(value, fromId, toId){
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
  if (HAS_INTL_NUMBER_FORMAT){
    try {
      FORMATTER_COMPACT = createNumberFormatter('vi-VN', {
        notation: 'compact',
        maximumFractionDigits);
      HAS_COMPACT_FORMAT = true;
    } catch {
      FORMATTER_COMPACT = FORMATTER_STANDARD;
    }
  }
  const FORMATTER_BY_PRECISION = new Map<string, ReturnType<typeof createNumberFormatter>>();

  function getFormatterByPrecision(precision, compact){
    const formatterCacheKey = `${precision}{compact ? 'compact' : 'standard'}`;
    const cachedFormatter = FORMATTER_BY_PRECISION.get(formatterCacheKey);
    if (cachedFormatter){
      return cachedFormatter;
    }
    const formatterOptions= {
      maximumFractionDigits: precision,
      minimumFractionDigits){
      formatterOptions.notation = 'compact';
    }
    const formatter = createNumberFormatter('vi-VN', formatterOptions);
    FORMATTER_BY_PRECISION.set(formatterCacheKey, formatter);
    return formatter;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'CURRENCY_ORDER')) exports.CURRENCY_ORDER = CURRENCY_ORDER;
};
__modules['./data/load-config.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/data/load-config.ts

  function loadConfig(rawConfig, schema){
    try {
      return schema.parse(rawConfig);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Không thể tải cấu hình: ${message}`, {
        cause: error instanceof Error ? error : undefined
      });
    }
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'loadConfig')) exports.loadConfig = loadConfig;
};
__modules['./data/modes.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./data/economy.ts');
  const getLotterySplit = __dep0.getLotterySplit;
  const getPityConfig = __dep0.getPityConfig;
  const getShopTaxRate = __dep0.getShopTaxRate;
  const __dep1 = __require('./screens/ui-gacha/logic/config.ts');
  const GACHA_CONFIG = __dep1.GACHA_CONFIG;



  const SSR_PITY= getPityConfig('SSR');
  const UR_PITY= getPityConfig('UR');
  const PRIME_PITY= getPityConfig('PRIME');
  const CURRENT_PRIME_BANNER = GACHA_CONFIG.banners.find(({ id }) => id === 'limited-prime') ?? null;
  const CURRENT_PRIME_PITY = CURRENT_PRIME_BANNER?.pity.prime ?? null;
  const CURRENT_PRIME_SUPPORT_UR_PITY = CURRENT_PRIME_BANNER?.pity.ur ?? null;
  const PRIME_BANNER_PITY_SUMMARY = CURRENT_PRIME_PITY
    ? `soft pity Prime từ lượt ${CURRENT_PRIME_PITY.soft}, hard pity Prime ở lượt ${CURRENT_PRIME_PITY.hard}`
    : `hard pity Prime mặc định ${PRIME_PITY?.hardPity || 120} lượt`;
  const PRIME_BANNER_SUPPORT_PITY_SUMMARY = CURRENT_PRIME_SUPPORT_UR_PITY
    ? `UR phụ trợ soft từ lượt ${CURRENT_PRIME_SUPPORT_UR_PITY.soft}, hard ở lượt ${CURRENT_PRIME_SUPPORT_UR_PITY.hard}`
    : null;
  const LOTTERY_SPLIT= getLotterySplit();
  const BASE_TAX_RATE = getShopTaxRate('N');
  const TOP_TAX_RATE = getShopTaxRate('PRIME');
  const PVE_SESSION_MODULE_ID = '@modes/pve/session.ts' /* /* as const */ */;
  const COMING_SOON_MODULE_ID = '@modes/coming-soon.stub.ts' /* /* as const */ */;
  const LINEUP_SCREEN_MODULE_ID = '@screens/lineup/index.ts' /* /* as const */ */;
  const COLLECTION_SCREEN_MODULE_ID = '@screens/collection/index.ts' /* /* as const */ */;
  const GACHA_SCREEN_MODULE_ID = '@screens/ui-gacha/index.ts' /* /* as const */ */;
  const ARENA_HUB_SCREEN_MODULE_ID = '@screens/arena-hub/index.ts' /* /* as const */ */;
  const CAMPAIGN_WORLD_MAP_SCREEN_MODULE_ID = '@screens/campaign-world-map/index.ts' /* /* as const */ */;
  const MONOPOLY_SCREEN_MODULE_ID = '@screens/monopoly/index.ts' /* /* as const */ */;
  const MONOPOLY_READY_SCREEN_MODULE_ID = '@screens/monopoly/ready.ts' /* /* as const */ */;
  const CHESS_STRATEGY_RPG_READY_SCREEN_MODULE_ID = '@screens/chess-strategy-rpg/ready.ts' /* /* as const */ */;
  const CHESS_STRATEGY_RPG_BATTLE_SCREEN_MODULE_ID = '@screens/chess-strategy-rpg/battle.ts' /* /* as const */ */;
  const CHESS_STRATEGY_RPG_MATCH_SCREEN_MODULE_ID = '@screens/chess-strategy-rpg/match.ts' /* /* as const */ */;
  const VINH_DA_GAMEPLAY_SCREEN_MODULE_ID = '@screens/vinh-da/gameplay.ts' /* /* as const */ */;
  const SECT_SCREEN_MODULE_ID = './screens/sect/index.ts' /* /* as const */ */;

  const MODE_TYPES = {
    PVE: '',
    PVP,
    ECONOMY, string>>;

  const MODE_STATUS = {
    AVAILABLE: 'available',
    COMING_SOON,
    PLANNED, string>>;

  const MENU_SECTION_DEFINITIONS = [
    { id: 'core-pve', title,
    { id: 'economy', title= [];
  const SSI_ENGINE_LABEL = 'SSI (Sequential Simultaneous Instant)';
  const SSI_ENGINE_SUMMARY = `${SSI_ENGINE_LABEL};
  const withSsiDescription = (base)=> `${base} ${SSI_ENGINE_SUMMARY}`;

  const MODES = [
    {
      id: 'arena-hub',
      title,
      type,
      status,
      icon,
      shortDescription, thử thách và mùa giải.',
      unlockNotes, thử thách, đấu trường PvE/PvP và các mùa giải đặc biệt.',
      tags, 'PvP'],
      menuSections,
      shell,
        moduleId,
    {
      id: 'campaign',
      type,
      status,
      icon,
      shortDescription, nhặt vật phẩm đột phá và mở khóa kiến trúc tông môn.'),
      unlockNotes,
      tags,
      menuSections,
      parentId,
      shell,
        moduleId,
        defaultParams,
    {
      id: 'vinh-da',
      title,
      type,
      status,
      icon,
      shortDescription, chọn Leader trước khi vào trận side-scrolling.',
      unlockNotes,
      tags,
      menuSections,
      parentId,
      shell,
        moduleId,
        defaultParams,
    {
      id: 'vinh-da-gameplay',
      title,
      type,
      status,
      icon,
      shortDescription,
      unlockNotes,
      tags,
      menuSections,
      parentId,
      shell,
        moduleId,
    {
      id: 'challenge',
      type,
      status,
      icon,
      shortDescription),
      unlockNotes,
      tags,
      menuSections,
      parentId,
      shell,
        moduleId,
        defaultParams,
    {
      id: 'arena',
      type,
      status,
      icon,
      shortDescription, xoay vòng mùa giải 7 ngày với bảng xếp hạng phần thưởng.'),
      unlockNotes,
      tags,
      menuSections,
      parentId,
      shell,
        moduleId,
        defaultParams,
    {
      id: 'ares',
      type,
      status,
      icon,
      shortDescription, hiển thị "Coming soon" cho tới khi hạ tầng networking hoàn tất.',
      unlockNotes,
      tags, 'Coming soon'],
      menuSections,
      parentId,
      shell,
        fallbackModuleId,
    {
      id: 'tongmon',
      title,
      type,
      status,
      icon,
      shortDescription, Tàng Kinh Các, Đan Phong và Tu Luyện Phòng gắn với kinh tế nguyên tinh.',
      unlockNotes, liên kết tiến trình PvE và dòng nguyên tinh.',
      tags,
      menuSections,
      shell,
        moduleId,
    {
      id: 'gacha',
      title,
      type,
      status,
      icon,
      shortDescription, Công Pháp, Vũ Khí, Sủng Thú với bảo hiểm ${SSR_PITY?.hardPity || 60}/${UR_PITY?.hardPity || 70} lượt cho meta SSR/UR; banner Prime hiện hành dùng ${PRIME_BANNER_PITY_SUMMARY}.`,
      unlockNotes) dùng runtime config limited-prime: ${PRIME_BANNER_PITY_SUMMARY}${PRIME_BANNER_SUPPORT_PITY_SUMMARY ? `; ${PRIME_BANNER_SUPPORT_PITY_SUMMARY}` : ''}.`,
      tags,
      menuSections,
      shell,
        moduleId,
    {
      id: 'lineup',
      title,
      type,
      status,
      icon,
      shortDescription, PvP thử nghiệm và hạ tầng kinh tế.',
      unlockNotes,
      tags,
      menuSections,
      shell,
        moduleId,
        defaultParams,
          lineups,
              title,
              role,
              description,
              members,
    {
      id: 'collection',
      title,
      type,
      status,
      icon,
      shortDescription, sủng thú, công pháp, rank budget, sao và class từ dữ liệu tổng hợp.',
      unlockNotes,
      tags,
      menuSections,
      shell,
        moduleId,
    {
      id: 'market',
      title,
      type,
      status,
      icon,
      shortDescription) * 100)}% tới ${Math.round((TOP_TAX_RATE || 0) * 100)}% cùng shop dev bán vật phẩm bằng tiền thật.`,
      unlockNotes, đồng thời kích hoạt kênh shop của dev.',
      tags, 'Coming soon'],
      menuSections,
      shell,
        fallbackModuleId,
    {
      id: 'events',
      title,
      type,
      status,
      icon,
      shortDescription,
      unlockNotes) * 100)}% cho quỹ vận hành và ${Math.round((LOTTERY_SPLIT.prizePool || 0) * 100)}% vào quỹ giải thưởng, kích hoạt theo lịch sự kiện.`,
      tags, 'Coming soon'],
      menuSections,
      shell,
        fallbackModuleId,
    {
      id: 'social',
      title,
      type,
      status,
      icon,
      shortDescription,
      unlockNotes,
      tags,
      menuSections,
      shell,
        fallbackModuleId,
    {
      id: 'beast-arena',
      title,
      type,
      status,
      icon,
      shortDescription,
      unlockNotes, nhận thưởng ở mọi bậc và phần thưởng đặc biệt cho top.',
      tags, 'Coming soon'],
      menuSections,
      parentId,
      shell,
        fallbackModuleId,
    {
      id: 'chess-strategy-rpg',
      title,
      type,
      status,
      icon,
      shortDescription,
      unlockNotes,
      tags,
      menuSections,
      parentId,
      shell,
        moduleId,
    {
      id: 'chess-strategy-rpg-battle',
      title,
      type,
      status,
      icon,
      shortDescription, chọn tu vi và khởi tạo bàn cờ bất quy tắc.',
      unlockNotes,
      tags,
      menuSections,
      parentId,
      shell,
        moduleId,
    {
      id: 'chess-strategy-rpg-match',
      title,
      type,
      status,
      icon,
      shortDescription, hiển thị bàn cờ lớn với góc nhìn nghiêng.',
      unlockNotes, bấm Bắt đầu để mở trận chính theo seed và cảnh giới đã chọn.',
      tags,
      menuSections,
      parentId,
      shell,
        moduleId,

    {
      id: 'co-ty-phu',
      title,
      type,
      status,
      icon,
      shortDescription,
      unlockNotes,
      tags,
      menuSections,
      parentId,
      shell,
        moduleId,
    {
      id: 'co-ty-phu-battle',
      title,
      type,
      status,
      icon,
      shortDescription,
      unlockNotes,
      tags,
      menuSections,
      parentId,
      shell,
        moduleId= MODES.reduce<Record<string, ModeConfig>>((acc, mode) => {
    acc[mode.id] = mode;
    return acc;
  }, {});
};
__modules['./data/roster-preview.config.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/data/roster-preview.config.ts

  const rosterPreviewConfig = {
    tpDelta: {
      HP: 20,
      ATK,
      WIL,
      ARM,
      RES,
      AGI,
      PER,
      AEmax,
      AEregen,
      HPregen,
    statOrder,
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
    precision,
      RES,
      SPD,
      AEregen
};
__modules['./data/roster-preview.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./../tools/zod-stub/index.js');
  const z = __dep0.z;
  const __dep1 = __require('./catalog.ts');
  const CLASS_BASE = __dep1.CLASS_BASE;
  const RANK_MULT = __dep1.RANK_MULT;
  const ROSTER = __dep1.ROSTER;
  const getRankMultiplier = __dep1.getRankMultiplier;
  const scaleStatByRank = __dep1.scaleStatByRank;
  const __dep2 = __require('./utils/assert.ts');
  const assertDefined = __dep2.assertDefined;
  const __dep3 = __require('./data/roster-preview.config.ts');
  const rawRosterPreviewConfig = __dep3.default ?? __dep3;



  const RosterPreviewConfigSchema = z.object({
    tpDelta: z.record(z.number()),
    statOrder)),
    precision))
  });

  const rosterPreviewConfig = RosterPreviewConfigSchema.parse(rawRosterPreviewConfig);

  // Talent Point (TP) deltas documented trong "ý tưởng nhân vật v3.txt".
  const TP_DELTA= Object.freeze({
    ...rosterPreviewConfig.tpDelta
  });

  const STAT_ORDER= Object.freeze([
    ...rosterPreviewConfig.statOrder
  ]);

  const PRECISION= Object.freeze({
    ...rosterPreviewConfig.precision
  });
  const ROSTER_PREVIEW_META = Object.freeze(
    ROSTER.map((unit) => ({ id: unit.id, name))
  );
  const hasTpDelta = (stat)=> typeof TP_DELTA[stat] === 'number';
  const getTpDelta = (stat)=> TP_DELTA[stat] ?? 0;
  const isNonZero = (value)=> value !== 0;

  function roundStat(stat, value) {
    const precision = PRECISION[stat] ?? 1;
    return Math.round(value * precision) / precision;
  }

  const TP_ROUND_FACTOR = 1e6;

  function roundTpValue(value) {
    return Math.round(value * TP_ROUND_FACTOR) / TP_ROUND_FACTOR;
  }

  function getClassBase(className){
    const normalized = String(className ?? '') /* as keyof typeof CLASS_BASE */;
    return assertDefined(CLASS_BASE[normalized], `Unknown class "${className ?? ''}"`);
  }

  function sanitizeTpAllocation(tpAlloc, number | null | undefined> = {}) {
    const clean= {};
    for (const [stat, value] of Object.entries(tpAlloc)) {
      if (!hasTpDelta(stat)) continue;
      const rounded = roundTpValue(value ?? 0);
      if (isNonZero(rounded)) {
        clean[stat] = rounded;
      }
    }
    return clean;
  }

  function mapStatBlock(
    stats,
    transform, value) => number,
  ){
    const out= {};
    for (const [stat, value] of Object.entries(stats) /* as Array<[string */, number]>) {
      out[stat] = transform(stat, value ?? 0);
    }
    return out;
  }

  function applyTpDelta(base, cleanTp, number>){
    return mapStatBlock(base, (stat, baseValue) => {
      const delta = getTpDelta(stat);
      if (delta) {
        return baseValue + delta * (cleanTp[stat] ?? 0);
      }
     return baseValue;
    });
  }

  function applyTpToBase(
    base,
    tpAlloc, number | null | undefined> = {}
  ){
    return applyTpDelta(base, sanitizeTpAllocation(tpAlloc));
  }

  function applyRankMultiplier(preRank, rank){
    return mapStatBlock(preRank, (stat, value) => (
      roundStat(stat, scaleStatByRank(stat, value, rank))
    ));
  }

  function applyFlatStats(
    rankedStats,
    flatStats, number | null | undefined> = {},
  ){
    return mapStatBlock(rankedStats, (stat, rankedValue) => {
      const flatValue = flatStats[stat];
      if (typeof flatValue !== 'number' || !Number.isFinite(flatValue)) return rankedValue;
      return roundStat(stat, rankedValue + flatValue);
    });
  }

  function computePreviewStats(
    base,
    rank,
    tpAlloc, number | null | undefined>,
    equipmentFlat, number | null | undefined> = {},
  ){ preRank: CatalogStatBlock; final: CatalogStatBlock } {
    const preRank = applyTpToBase(base, tpAlloc);
    const ranked = applyRankMultiplier(preRank, rank);
    return {
      preRank,
      final, equipmentFlat),
    };
  }

  function computeFinalStats(
    className,
    rank,
    tpAlloc, number | null | undefined> = {},
    equipmentFlat, number | null | undefined> = {},
  ){
    const base = getClassBase(className);
    return computePreviewStats(base, rank, tpAlloc, equipmentFlat).final;
  }

  function deriveTpFromMods(
    base,
    mods= {}
  ){
    if (!mods) return {};
    const rawTp= {};
    for (const [stat, modValue] of Object.entries(mods) /* as Array<[string */, number | null | undefined]>) {
      if (!hasTpDelta(stat)) continue;
      const baseValue = base[stat];
      if (typeof baseValue !== 'number') continue;
      const delta = getTpDelta(stat) || 1;
      const raw = (baseValue * (modValue ?? 0)) / delta;
      if (isNonZero(raw)) {
        rawTp[stat] = raw;
      }
    }
    return sanitizeTpAllocation(rawTp);
  }

  function totalTp(tpAlloc, number> = {}) {
    return roundTpValue(
      Object.values(tpAlloc).reduce((sum, value) => sum + value, 0)
    );
  }

  function resolveUnitTpAllocation(
    unit,
    base,
    providedAllocations?, Record<string, number>>,
  ){
    const derivedTp = providedAllocations?.[unit.id];
    if (derivedTp){
      return sanitizeTpAllocation(derivedTp);
    }
    return deriveTpFromMods(base, unit.mods);
  }
  function resolvePreviewForUnit(
    unit,
    tpAllocations?, Record<string, number>>,
  ){
    const base = getClassBase(unit.class);
    const cleanTp = resolveUnitTpAllocation(unit, base, tpAllocations);
    const rankKey = unit.rank /* as keyof typeof RANK_MULT */;
    const { preRank, final } = computePreviewStats(base, rankKey, cleanTp);
    return {
      id: unit.id,
      name,
      class,
      rank,
      rankMultiplier),
      tp,
      totalTP),
      preRank,
      final,
    };
  }

  function buildRosterPreviews(
    tpAllocations?, Record<string, number>>
  ){
    const result= {};
    for (const unit of ROSTER /* as ReadonlyArray<RosterUnitDefinition> */) {
      result[unit.id] = resolvePreviewForUnit(unit, tpAllocations);
    }
    return result;
  }

  /**
   * @param {Record<string, RosterPreview>} previews
   * @param {ReadonlyArray<string>} [statsOrder]
   * @returns {RosterPreviewRow[]}
   */
  function buildPreviewRows(
    previews, RosterPreview>,
    statsOrder= STAT_ORDER
  ){
    return statsOrder.map((stat)=> ({
      stat,
      values) => {
        const preview = previews[unit.id];
        return {
          id: unit.id,
          name,
          value,
          preRank,
          tp)
    }));
  }

  const ROSTER_TP_ALLOCATIONS= Object.freeze(
    ROSTER.reduce<Record<string, Record<string, number>>>((acc, unit) => {
      acc[unit.id] = resolveUnitTpAllocation(unit, getClassBase(unit.class));
      return acc;
    }, {})
  );

  const ROSTER_PREVIEWS = buildRosterPreviews(ROSTER_TP_ALLOCATIONS);
  const ROSTER_PREVIEW_ROWS = buildPreviewRows(ROSTER_PREVIEWS);
  const STAT_KEYS = Object.freeze([...STAT_ORDER]);
  if (!Object.prototype.hasOwnProperty.call(exports, 'TP_DELTA')) exports.TP_DELTA = TP_DELTA;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ROSTER_TP_ALLOCATIONS')) exports.ROSTER_TP_ALLOCATIONS = ROSTER_TP_ALLOCATIONS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ROSTER_PREVIEWS')) exports.ROSTER_PREVIEWS = ROSTER_PREVIEWS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ROSTER_PREVIEW_ROWS')) exports.ROSTER_PREVIEW_ROWS = ROSTER_PREVIEW_ROWS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'STAT_KEYS')) exports.STAT_KEYS = STAT_KEYS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyTpToBase')) exports.applyTpToBase = applyTpToBase;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyRankMultiplier')) exports.applyRankMultiplier = applyRankMultiplier;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyFlatStats')) exports.applyFlatStats = applyFlatStats;
  if (!Object.prototype.hasOwnProperty.call(exports, 'computeFinalStats')) exports.computeFinalStats = computeFinalStats;
  if (!Object.prototype.hasOwnProperty.call(exports, 'deriveTpFromMods')) exports.deriveTpFromMods = deriveTpFromMods;
  if (!Object.prototype.hasOwnProperty.call(exports, 'buildRosterPreviews')) exports.buildRosterPreviews = buildRosterPreviews;
  if (!Object.prototype.hasOwnProperty.call(exports, 'buildPreviewRows')) exports.buildPreviewRows = buildPreviewRows;
};
__modules['./data/skills.config.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/data/skills.config.ts

  /**
   * skills.config chỉ giữ phần override/metadata đặc thù.
   * Dữ liệu kit chuẩn mặc định được lấy từ `ROSTER` trong `src/catalog.ts`
   * qua `buildBaseSkillSetsFromRoster()` (src/data/skills.ts).
   *
   * => Khi thêm unit mới (kể cả Prime), chỉ cần khai báo kit ở catalog.
   * Chỉ thêm record ở đây nếu muốn ghi đè skill text hoặc bổ sung notes/metadata riêng.
   */

  const IDEA_SOURCE_REFS = [
    'ý tưởng nhân vật v1.txt',
    'ý tưởng nhân vật v2.3.txt',
    'ý tưởng nhân vật 3.2.txt'
  ] /* /* as const */ */;

  const skillsConfig = [
    {
      unitId: 'thien_luu',
      designStatus,
      placeholderControl,
        requiredSourceFiles,
      notes,
        'Giữ record tạm để tránh trống dữ liệu im lặng; cần bổ sung basic/skills/ult/talent khi có nguồn thiết kế chính thức.'
      ]
    }
  ] /* /* as const */ */;


  if (!Object.prototype.hasOwnProperty.call(exports, 'default')) exports.default = skillsConfig;
  module.exports.default = exports.default;
};
__modules['./data/skills.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./../tools/zod-stub/index.js');
  const z = __dep0.z;
  const __dep1 = __require('./catalog.ts');
  const ROSTER = __dep1.ROSTER;
  const __dep2 = __require('./data/skills.config.ts');
  const rawSkillSetsConfig = __dep2.default ?? __dep2;
  const __dep3 = __require('./data/tags.ts');
  const getTagDefinition = __dep3.getTagDefinition;
  const listUnknownTags = __dep3.listUnknownTags;
  const normalizeTagList = __dep3.normalizeTagList;





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

  function ensureDomainTags(tags, fallbackKit){
    const normalized = normalizeTagList(tags);
    const definitions = normalized
      .map((tag) => getTagDefinition(tag))
      .filter((definition)=> Boolean(definition));

    const next = [...normalized];
    const hasKit = definitions.some((definition) => definition.domain === 'kit');
    const hasEffectOrTargeting = definitions.some((definition) => definition.domain === 'effect' || definition.domain === 'targeting');

    if (!hasKit){
      next.push(fallbackKit);
    }
    if (!hasEffectOrTargeting){
      next.push('single-target');
    }

    return normalizeTagList(next);
  }

  function fallbackKitTag(sectionType){
    if (sectionType === 'talent') return 'passive';
    return 'active';
  }

  function normalizeNotes(notes){
    if (Array.isArray(notes)) return [...notes];
    if (typeof notes === 'string') return [notes];
    return undefined;
  }

  function toStringArray(value){
    if (!Array.isArray(value)) return [];
    return value.filter((item)=> typeof item === 'string');
  }

  function cloneCost(cost){
    if (!isUnknownRecord(cost)) return undefined;
    return { ...cost };
  }

  function normalizeSection(
    section,
    fallbackType= 'active',
  ){
    if (!section) return null;
    if (typeof section === 'string'){
      return normalizeSkillEntry({ name: '', description, type, fallbackType);
    }
    return normalizeSkillEntry(section, fallbackType);
  }

  function normalizeSkillEntry(entry, fallbackType= 'active'){
    if (!entry) return null;
    const type = entry.type ?? fallbackType;
    const normalized= { ...entry };
    normalized.type = type;
    normalized.tags = ensureDomainTags(entry.tags ?? [], fallbackKitTag(type));
    normalized.cost = cloneCost(entry.cost);
    normalized.notes = normalizeNotes(entry.notes);
    return normalized;
  }

  function isUnknownRecord(value){
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function toSkillSection(value, fallbackType= 'active'){
    if (!isUnknownRecord(value)) return null;
    const name = typeof value.name === 'string' ? value.name : '';
    const type = typeof value.type === 'string' ? value.type : fallbackType;
    const description = typeof value.description === 'string'
      ? value.description
      : (typeof value.notes === 'string' ? value.notes : '');
    const tags = toStringArray(value.tags);
    const section= {
      ...value,
      name,
      type,
      description,
      tags
    } /* as SkillSection */;
    section.cost = cloneCost(value.cost);
    section.notes = Array.isArray(value.notes)
      ? toStringArray(value.notes)
      ;
    return normalizeSkillEntry(section, fallbackType);
  }

  function buildBaseSkillSetsFromRoster(){
    return ROSTER.reduce<Record<UnitId, SkillEntry>>((acc, unit) => {
      const unitId = unit.id /* as UnitId */;
      const kitRecord= isUnknownRecord(unit.kit) ? unit.kit : {};
      const skills = Array.isArray(kitRecord.skills)
        ? kitRecord.skills.map((skill) => toSkillSection(skill)).filter(isSkillSection)
        ;
      const normalized= {
        unitId,
        basic, 'basic'),
        skill,
        skills,
        ult, 'ultimate'),
        talent, 'talent'),
        technique, 'technique'),
        notes= normalized;
      return acc;
    }, {});
  }

  const RawSkillSetSchema = z.object({
    unitId: z.string()
  });
  const RawSkillSetListSchema = z.array(RawSkillSetSchema);
  const rawSkillSets = RawSkillSetListSchema.parse(rawSkillSetsConfig) /* as ReadonlyArray<RawSkillSet> */;

  function collectUnknownSkillTags(skill){
    if (!skill || !Array.isArray(skill.tags)) return [];
    return listUnknownTags(skill.tags);
  }

  const SKILL_SECTION_KEYS = ['basic', 'skill', 'ult', 'talent', 'technique'] /* /* as const */ /* satisfies ReadonlyArray<keyof SkillEntry> */ */;
  const SKILL_KEYS = ['basic', 'skill', 'skills', 'ult', 'talent', 'technique', 'notes'] /* /* as const */ /* satisfies ReadonlyArray<keyof SkillEntry | 'skill'> */ */;

  const skillSets= rawSkillSets.reduce<Record<UnitId, SkillEntry>>((acc, entry) => {
    const current = acc[entry.unitId] ?? {
      unitId: entry.unitId,
      basic,
      skill,
      skills,
      ult,
      talent,
      technique,
      notes,
    };
    const skills = Array.isArray(entry.skills)
      ? entry.skills.map(normalizeSkillEntry).filter(isSkillSection)
    ;
    const skill = entry.skill
      ? normalizeSkillEntry(entry.skill)
      ;
    const normalized= {
      unitId: entry.unitId,
      basic) ? normalizeSection(entry.basic, 'basic') 
      skill,
      skills,
      ult) ? normalizeSection(entry.ult, 'ultimate') 
      talent: ('talent' in entry) ? normalizeSection(entry.talent, 'talent') 
      technique: ('technique' in entry) ? normalizeSection(entry.technique, 'technique') 
      notes: ('notes' in entry)
        ? (normalizeNotes(entry.notes) ?? [])
        
    };
    const unknownTags = SKILL_SECTION_KEYS.flatMap((key) => collectUnknownSkillTags(normalized[key]))
      .concat(normalized.skills.flatMap(collectUnknownSkillTags));
    if (unknownTags.length){
      const uniqueUnknown = Array.from(new Set(unknownTags));
      console.warn(`[skills] Unknown tag(s) for ${entry.unitId}{uniqueUnknown.join(', ')}`);
    }
    acc[entry.unitId] = normalized;
    return acc;
  }, buildBaseSkillSetsFromRoster());

  deepFreeze(skillSets);

  exports.skillSets = skillSets;

  function isSkillEntry(entry){
    return Boolean(entry);
  }

  function isSkillSection(entry){
    return Boolean(entry);
  }

  function getSkillSet(unitId){
    if (!unitId) return null;
    return skillSets[unitId] ?? null;
  }

  function listSkillSets(){
    return ROSTER
      .map(unit => skillSets[unit.id])
      .filter(isSkillEntry);
  }

  function hasSkillSet(unitId){
    return unitId != null && Object.prototype.hasOwnProperty.call(skillSets, unitId);
  }

  function validateSkillSetStructure(entry){
    if (!entry || typeof entry !== 'object') return false;
    const record = entry /* as Record<string */, unknown>;
    for (const key of SKILL_KEYS){
      if (!(key in entry)){
        return false;
      }
    }
    if (!('unitId' in record) || !record.unitId) return false;
    if ('skills' in record){
      const skillsValue = record.skills;
      if (skillsValue && !Array.isArray(skillsValue)) return false;
    }
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'getSkillSet')) exports.getSkillSet = getSkillSet;
  if (!Object.prototype.hasOwnProperty.call(exports, 'listSkillSets')) exports.listSkillSets = listSkillSets;
  if (!Object.prototype.hasOwnProperty.call(exports, 'hasSkillSet')) exports.hasSkillSet = hasSkillSet;
  if (!Object.prototype.hasOwnProperty.call(exports, 'validateSkillSetStructure')) exports.validateSkillSetStructure = validateSkillSetStructure;
};
__modules['./data/tags.ts'] = (exports, module, __require) => {

};
__modules['./data/vfx_anchors/loithienanh.json'] = (exports, module, __require) => {
  const data = {"unitId":"loithienanh","bodyAnchors":{"root":{"x":0.5,"y":0.5},"head":{"x":0.5,"y":0.86},"chest":{"x":0.5,"y":0.68},"pelvis":{"x":0.5,"y":0.44},"right_fist":{"x":0.66,"y":0.58},"left_fist":{"x":0.34,"y":0.58},"right_elbow":{"x":0.63,"y":0.66},"left_elbow":{"x":0.37,"y":0.66},"right_foot":{"x":0.6,"y":0.1},"left_foot":{"x":0.4,"y":0.1},"back_core":{"x":0.5,"y":0.64}},"vfxBindings":{"basic_combo":{"description":"Đòn đấm thường hai hit, ưu tiên tay phải sau đó tay trái.","anchors":[{"id":"right_fist","timing":"hit1","radius":0.12},{"id":"left_fist","timing":"hit2","radius":0.11}]},"loi_anh_tam_kich":{"description":"Skill1 tung ba cú đấm lôi, tái sử dụng anchor tay phải cho tia hồ quang và tay trái khi chuyển mục tiêu.","anchors":[{"id":"right_fist","timing":"arc_spawn","radius":0.14},{"id":"left_fist","timing":"follow_through","radius":0.12}]},"ngu_loi_phe_than":{"description":"Skill2 đốt máu phát lôi cầu quanh thân, xuất phát từ ngực lan ra 5 hướng.","anchors":[{"id":"chest","timing":"charge","radius":0.18},{"id":"right_fist","timing":"launch_major","radius":0.14},{"id":"left_fist","timing":"launch_minor","radius":0.13}]},"loi_the_bach_chien":{"description":"Skill3 dựng lớp bảo hộ bằng trường điện quấn quanh thân.","anchors":[{"id":"chest","timing":"shield_core","radius":0.22},{"id":"back_core","timing":"shield_back","radius":0.24}]},"huyet_hon_loi_quyet":{"description":"Tuyệt kỹ bùng nổ lôi huyết: hút năng lượng ở ngực, nổ ra trước bụng và chân.","anchors":[{"id":"chest","timing":"charge_up","radius":0.2},{"id":"root","timing":"burst_core","radius":0.26},{"id":"right_foot","timing":"ground_crack","radius":0.15},{"id":"left_foot","timing":"ground_crack","radius":0.15}]}},"ambientEffects":{"lightning_scars":{"description":"Hoa văn lôi văn chạy trên tay và ngực, phát sáng nhịp tim.","anchors":[{"id":"right_elbow","timing":"pulse","radius":0.1},{"id":"left_elbow","timing":"pulse","radius":0.1},{"id":"chest","timing":"pulse","radius":0.12}]},"thermal_noise":{"description":"Nhiễu nhiệt nhẹ trên toàn thân khi đứng yên.","anchors":[{"id":"chest","timing":"idle","radius":0.3}]},"storm_backdrop":{"description":"Hiệu ứng hậu cảnh vòng ấn lôi huyết và mây dông trong các cảnh ult.","anchors":[{"id":"back_core","timing":"ult_only","radius":0.35}]}}};
  module.exports = data;
  module.exports.default = data;
};
__modules['./data/vfx_anchors/schema.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/data/vfx_anchors/schema.ts
  const __dep0 = __require('./../tools/zod-stub/index.js');
  const z = __dep0.z;



  const AnchorPointSchema = z.object({
    x: z.number(),
    y)
  });

  const AnchorSchema = z.object({
    id: z.string(),
    timing).optional(),
    radius).optional()
  });

  const BindingSchema = z.object({
    description: z.string().optional(),
    anchors)
  });

  const BindingMapSchema = z.record(BindingSchema);

  const VfxAnchorDatasetSchema = z.object({
    unitId: z.string(),
    bodyAnchors).optional(),
    vfxBindings),
    ambientEffects)
  });

  const parseVfxAnchorDataset = (input)=> {
    const dataset= VfxAnchorDatasetSchema.parse(input);

    return {
      unitId: dataset.unitId,
      bodyAnchors,
      vfxBindings,
      ambientEffects
  if (!Object.prototype.hasOwnProperty.call(exports, 'parseVfxAnchorDataset')) exports.parseVfxAnchorDataset = parseVfxAnchorDataset;
};
__modules['./engine.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/engine.ts
  const __dep0 = __require('./config.ts');
  const TOKEN_STYLE = __dep0.TOKEN_STYLE;
  const CHIBI = __dep0.CHIBI;
  const CFG = __dep0.CFG;
  const CAM = __dep0.CAM;
  const __dep1 = __require('./art.ts');
  const getUnitArt = __dep1.getUnitArt;
  const getUnitSkin = __dep1.getUnitSkin;

  const SIDE_ROW_COUNT = 3;
  const SIDE_SLOT_COUNT = SIDE_ROW_COUNT * SIDE_ROW_COUNT;

  const DEFAULT_OBLIQUE_CAMERA = {
    rowGapRatio: 0.62,
    topScale,
    depthScale,
  } /* /* as const */ /* satisfies Required<CameraOptions> */ */;

  function resolveCameraOptions(cam){
    if (!cam) return DEFAULT_OBLIQUE_CAMERA;
    return {
      rowGapRatio: coerceFinite(cam.rowGapRatio, DEFAULT_OBLIQUE_CAMERA.rowGapRatio),
      topScale, DEFAULT_OBLIQUE_CAMERA.topScale),
      depthScale, DEFAULT_OBLIQUE_CAMERA.depthScale),
    };
  }

  const CHIBI_PROPS= CHIBI /* as ChibiProportions */;
  const TOKEN_STYLE_VALUE = TOKEN_STYLE /* as 'chibi' | 'disk' */;
  const TOKEN_DRAW_BUFFER= [];
  const sortByProjectionDepth = (
    a,
    b,
  )=> {
    const ya = a.y;
    const yb = b.y;
    if (ya === yb) return a.token.cx - b.token.cx;
    return ya - yb;
  };

  const normalizeShadowPreset = (
    value,
    fallback= null,
  )=> {
    if (value === 'off' || value === 'soft' || value === 'medium') return value;
    return fallback;
  };

  const tokenVisualKey = (token, 'iid' | 'id'> | null | undefined)=> {
    if (!token) return null;
    if (Number.isFinite(token.iid)) {
      return `iid:${token.iid}`;
    }
    if (typeof token.id === 'string' && token.id.length > 0) {
      return `id:${token.id}`;
    }
    return null;
  };

  function coerceFinite(value, fallback){
    const candidate =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number.parseFloat(value)
          ;
    return Number.isFinite(candidate) ? candidate : fallback;
  }

  /* ---------- Grid ---------- */
  function makeGrid(canvas, cols, rows){
    const uiCfg = CFG.UI ?? {};
    const perfCfg = CFG.PERFORMANCE ?? {};
    const pad = coerceFinite(uiCfg.PAD, 12);
    const boardMaxW = coerceFinite(uiCfg.BOARD_MAX_W, 1144);
    let viewportW = boardMaxW + pad * 2;
    const parentElement = (canvas?.parentElement ?? null) /* as HTMLElement | null */;
    let parentClientW= null;
    if (parentElement && typeof parentElement.clientWidth === 'number') {
      const cw = parentElement.clientWidth;
      if (Number.isFinite(cw) && cw > 0) {
        parentClientW = cw;
        viewportW = Math.min(viewportW, cw);
      }
    }

    if (typeof window !== 'undefined') {
      const { innerWidth } = window;
      viewportW = Math.min(viewportW, coerceFinite(innerWidth, viewportW));
    }
    if (typeof document !== 'undefined') {
      const docWidth = coerceFinite(document.documentElement?.clientWidth, viewportW);
      viewportW = Math.min(viewportW, docWidth);
    }

    const viewportSafeW = parentClientW ? Math.min(viewportW, parentClientW) ;
    const availableW = Math.max(1, viewportSafeW - pad * 2);
    const w = Math.min(availableW, boardMaxW);
    const h = Math.max(Math.floor(w * (uiCfg.BOARD_H_RATIO ?? 3 / 7)), uiCfg.BOARD_MIN_H ?? 220);

    const maxDprCfg = uiCfg.MAX_DPR;
    const dprClamp = Number.isFinite(maxDprCfg) && maxDprCfg > 0 ? maxDprCfg : 2;
    const dprRaw = typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio)
      ? window.devicePixelRatio
      : 1;
    const dprSafe = dprRaw > 0 ? dprRaw : 1;
    const lowPowerMode = !!perfCfg.LOW_POWER_MODE;
    const lowPowerDprCfg = perfCfg.LOW_POWER_DPR;
    const lowPowerDpr = Number.isFinite(lowPowerDprCfg) && lowPowerDprCfg > 0
      ? Math.min(dprClamp, lowPowerDprCfg)
      ;

    let dpr = Math.min(dprClamp, dprSafe);
    if (lowPowerMode) {
      dpr = Math.min(dpr, lowPowerDpr);
    }

    const displayW = w;
    const displayH = h;
    const maxPixelAreaCfg = uiCfg.MAX_PIXEL_AREA;
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

    const pixelW = Math.max(1, Math.round(displayW * dpr));
    const pixelH = Math.max(1, Math.round(displayH * dpr));
    const pixelArea = pixelW * pixelH;

    if (canvas) {
      if (canvas.style) {
        canvas.style.width = `${displayW}px`;
        canvas.style.height = `${displayH}px`;
      }
      if (canvas.width !== pixelW) canvas.width = pixelW;
      if (canvas.height !== pixelH) canvas.height = pixelH;
    }

    const usableW = displayW - pad * 2;
    const usableH = displayH - pad * 2;
    const tile = Math.floor(Math.min(usableW / cols, usableH / rows));
    const ox = Math.floor((displayW - tile * cols) / 2);

    const cameraKey = (CFG.CAMERA ?? 'landscape_oblique') /* as keyof typeof CAM */;
    const cameraPreset = CAM?.[cameraKey] ?? CAM?.landscape_oblique ?? null;
    const rawRowGapRatio = cameraPreset && typeof cameraPreset.rowGapRatio === 'number'
      ? cameraPreset.rowGapRatio
      : DEFAULT_OBLIQUE_CAMERA.rowGapRatio;
    const rowGapRatio = Number.isFinite(rawRowGapRatio) && rawRowGapRatio > 0
      ? rawRowGapRatio
      : 1;
    const alignRaw = uiCfg.BOARD_VERTICAL_ALIGN;
    const align = Number.isFinite(alignRaw)
      ? Math.min(Math.max((alignRaw /* as number */), 0), 1)
      ;
    const boardVisualHeight = Math.max(0, tile * rows * rowGapRatio);
    const verticalFree = Math.max(0, displayH - boardVisualHeight);
    const oy = Math.floor(verticalFree * align);

    return {
      cols,
      rows,
      tile,
      ox,
      oy,
      w,
      h,
      pad,
      dpr,
      pixelW,
      pixelH,
      pixelArea,
    };
  }

  function hitToCell(g, px, py){
    const cx = Math.floor((px - g.ox) / g.tile);
    const cy = Math.floor((py - g.oy) / g.tile);
    if (cx < 0 || cy < 0 || cx >= g.cols || cy >= g.rows) return null;
    return { cx, cy };
  }

  function cellCenter(g, cx, cy){ x: number; y: number } {
    const x = g.ox + g.tile * (cx + 0.5);
    const y = g.oy + g.tile * (cy + 0.5);
    return { x, y };
  }
  /* ---------- Tokens ---------- */
  function drawTokens(ctx, g, tokens){
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fs = Math.floor(g.tile * 0.28);

    tokens.forEach((t) => {
      const { x, y } = cellCenter(g, t.cx, t.cy);
      const r = Math.floor(g.tile * 0.36);
      ctx.fillStyle = t.color ?? '#9adcf0';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = CFG.COLORS.tokenText;
      ctx.font = `${fs}px system-ui`;
      ctx.fillText(String(t.name ?? ''), x, y);
    });
  }

  function cellOccupied(tokens, cx, cy){
    return tokens.some((t) => t.cx === cx && t.cy === cy);
  }

  function isSummonMap(value){
    if (!value) return false;
    if (value instanceof Map) return true;
    return typeof (value /* as { values: unknown } */).values === 'function';
  }

  function shouldShowQueuedSide(side){
    if (side === 'ally') return !!CFG.DEBUG?.SHOW_QUEUED;
    if (side === 'enemy') return !!CFG.DEBUG?.SHOW_QUEUED_ENEMY;
    return false;
  }

  function queueContainsCell(map, cx, cy){
    if (!isSummonMap(map)) return false;
    for (const request of map.values()) {
      if (!request) continue;
      if (request.cx === cx && request.cy === cy) return true;
    }
    return false;
  }

  function cellReserved(tokens, queued, cx, cy){
    if (cellOccupied(tokens, cx, cy)) return true;
    if (!queued) return false;
    return queueContainsCell(queued.ally, cx, cy) || queueContainsCell(queued.enemy, cx, cy);
  }

  function spawnLeaders(tokens, g){
    const artAlly = getUnitArt('leaderA') /* as UnitArtDescriptor | null */;
    const artEnemy = getUnitArt('leaderB') /* as UnitArtDescriptor | null */;
    const allyCell = slotToCell('ally', 8);
    const enemyCell = slotToCell('enemy', 8);
    tokens.push({
      id: 'leaderA',
      name,
      color,
      cx,
      cy,
      side,
      alive,
      art,
      skinKey,
    });
    tokens.push({
      id: 'leaderB',
      name,
      color,
      cx,
      cy,
      side,
      alive,
      art,
      skinKey,
    });
  }

  /* ---------- Helper ---------- */
  function pickRandom(pool, excludeSet, n = 4){
    if (n <= 0) return [];
    const remain= [];
    for (const u of pool) {
      if (typeof u === 'undefined') continue;
      if (u && typeof u === 'object') {
        const candidate = u /* as { id: unknown } */;
        const id = candidate.id;
        if (id !== undefined && id !== null && excludeSet.has(String(id))) continue;
        remain.push(u);
        continue;
      }
      if (typeof u === 'string' && excludeSet.has(u)) continue;
      remain.push(u);
    }

    for (let i = remain.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = remain[i]!;
      remain[i] = remain[j]!;
      remain[j] = temp;
    }
    if (remain.length === 0) return remain;
    return n >= remain.length ? remain : remain.slice(0, n);
  }

  const pick3Random = (pool, excludeSet)=> pickRandom(pool, excludeSet, 3);
  /* ---------- Oblique grid helpers ---------- */
  function rowLR(g, r, C){ left: number; right: number } {
    const colsW = g.tile * g.cols;
    const topScale = C.topScale;
    const pinch = (1 - topScale) * colsW;
    const t = r / g.rows;
    const width = colsW - pinch * (1 - t);
    const left = g.ox + (colsW - width) / 2;
    const right = left + width;
    return { left, right };
  }

  function interpolateRowX(left, right, cols, cx){
    return left + (cx / cols) * (right - left);
  }

  function drawGridOblique(
    ctx,
    g,
    cam,
    opts, string>> } = {},
  ){
    const C = resolveCameraOptions(cam);
    const colors = {
      ally: CFG.COLORS.ally,
      enemy,
      mid,
      line,
      ...(opts.colors ?? {}),
    } /* satisfies Record<'ally' | 'enemy' | 'mid' | 'line' */, string>;
    const rowGap = C.rowGapRatio * g.tile;
    let previousBottom = rowLR(g, 0, C);

    for (let cy = 0; cy < g.rows; cy++) {
      const yTop = g.oy + cy * rowGap;
      const yBot = g.oy + (cy + 1) * rowGap;
      const LRt = previousBottom;
      const LRb = rowLR(g, cy + 1, C);
      previousBottom = LRb;

      for (let cx = 0; cx < g.cols; cx++) {
        const xtL = interpolateRowX(LRt.left, LRt.right, g.cols, cx);
        const xtR = interpolateRowX(LRt.left, LRt.right, g.cols, cx + 1);
        const xbL = interpolateRowX(LRb.left, LRb.right, g.cols, cx);
        const xbR = interpolateRowX(LRb.left, LRb.right, g.cols, cx + 1);

        let fill;
        if (cx < CFG.ALLY_COLS) fill = colors.ally;
        else if (cx >= g.cols - CFG.ENEMY_COLS) fill = colors.enemy;
        else fill = colors.mid;

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

  function hitToCellOblique(g, px, py, cam){
    const C = resolveCameraOptions(cam);
    const rowGap = C.rowGapRatio * g.tile;

    const r = (py - g.oy) / rowGap;
    if (r < 0 || r >= g.rows) return null;

    const LR = rowLR(g, r, C);
    const u = (px - LR.left) / (LR.right - LR.left);
    if (u < 0 || u >= 1) return null;

    const cx = Math.floor(u * g.cols);
    const cy = Math.floor(r);
    return { cx, cy };
  }

  function cellQuadOblique(g, cx, cy, C){
    xtL: number;
    xtR: number;
    xbL: number;
    xbR: number;
    yTop: number;
    yBot: number;
  } {
    const rowGap = C.rowGapRatio * g.tile;
    const yTop = g.oy + cy * rowGap;
    const yBot = yTop + rowGap;
    const LRt = rowLR(g, cy, C);
    const LRb = rowLR(g, cy + 1, C);

    const xtL = interpolateRowX(LRt.left, LRt.right, g.cols, cx);
    const xtR = interpolateRowX(LRt.left, LRt.right, g.cols, cx + 1);
    const xbL = interpolateRowX(LRb.left, LRb.right, g.cols, cx);
    const xbR = interpolateRowX(LRb.left, LRb.right, g.cols, cx + 1);
    return { xtL, xtR, xbL, xbR, yTop, yBot };
  }

  function cellCenterOblique(g, cx, cy, C){ x: number; y: number } {
    const q = cellQuadOblique(g, cx, cy, C);
    const x = (q.xtL + q.xtR + q.xbL + q.xbR) / 4;
    const y = (q.yTop + q.yBot) / 2;
    return { x, y };
  }

  function depthScaleAtRow(g, row, depthScale){
    const depth = g.rows - 1 - row;
    return Math.pow(depthScale, depth);
  }

  function projectCellObliqueWithCamera(
    g,
    cx,
    cy,
    C,
  ){
    const { x, y } = cellCenterOblique(g, cx, cy, C);
    const scale = depthScaleAtRow(g, cy, C.depthScale);
    return { x, y, scale };
  }

  function projectCellOblique(g, cx, cy, cam){
    return projectCellObliqueWithCamera(g, cx, cy, resolveCameraOptions(cam));
  }6
  function drawChibi(
    ctx,
    x,
    y,
    r,
    facing= 1,
    color= '#a9f58c',
  ){
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

  function joinSignatureParts(parts){
    if (!Array.isArray(parts) || parts.length === 0) {
      return '';
    }
    const normalized= [];
    for (const part of parts) {
      if (part == null) {
        normalized.push('');
        continue;
      }
      if (typeof part === 'number') {
        normalized.push(Number.isFinite(part) ? String(part) ;
        continue;
      }
      normalized.push(String(part));
    }
    return normalized.join('|');
  }

  function contextSignature(g, C){
    return joinSignatureParts([
      g.cols,
      g.rows,
      g.tile,
      g.ox,
      g.oy,
      C.rowGapRatio,
      C.topScale,
      C.depthScale,
    ]);
  }

  function warnInvalidToken(context, token){
    if (!CFG.DEBUG) return;
    try {
      console.warn(`[engine] ${context};
    } catch (_err) {
      // ignore logging errors
    }
  }

  function getTokenProjection(
    token,
    g,
    C,
    sig,
  ){
    if (!token) {
      return null;
    }
    if (typeof token !== 'object') {
      warnInvalidToken('getTokenProjection', token);
      return null;
    }
    let entry = TOKEN_PROJECTION_CACHE.get(token);
    if (!entry || entry.cx !== token.cx || entry.cy !== token.cy || entry.sig !== sig) {
      const projection = projectCellObliqueWithCamera(g, token.cx, token.cy, C);
      entry = {
        cx: token.cx,
        cy,
        sig,
        projection,
      };
      TOKEN_PROJECTION_CACHE.set(token, entry);
    }
    return entry.projection;
  }

  function clearTokenCaches(token){
    if (!token) {
      return;
    }
    if (typeof token !== 'object') {
      warnInvalidToken('clearTokenCaches', token);
      return;
    }
    TOKEN_PROJECTION_CACHE.delete(token);
    const skinKey = (token /* as TokenWithArt */).skinKey ?? null;
    const cacheKey = `${token.id ?? '__anon__'}{skinKey ?? ''}`;
    TOKEN_VISUAL_CACHE.delete(cacheKey);
  }

  function normalizeSpriteDescriptor(sprite){
    if (!sprite) return null;
    if (typeof sprite === 'string') {
      return { src: sprite };
    }

    const descriptor= {};
    if (typeof sprite.src === 'string') {
      descriptor.src = sprite.src;
    }
    if (typeof sprite.cacheKey === 'string') {
      descriptor.cacheKey = sprite.cacheKey;
    }
    if (sprite.skinId !== undefined) {
      descriptor.skinId = sprite.skinId ?? null;
    }
    if (sprite.shadow !== undefined) {
      descriptor.shadow = sprite.shadow ?? null;
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

  function getTokenVisual(token, art){
    if (!token) {
      return { spriteKey: null, spriteEntry, shadowCfg= art?.skinKey ?? token.skinKey ?? null;
    const cacheKey = `${token.id ?? '__anon__'}{skinKey ?? ''}`;
    const descriptor = normalizeSpriteDescriptor(art?.sprite ?? null);
    const spriteSrc = descriptor?.src ?? null;
    const spriteKey = descriptor?.cacheKey || (spriteSrc ? `${spriteSrc}{descriptor?.skinId ?? skinKey ?? ''}` : null);

    let entry = TOKEN_VISUAL_CACHE.get(cacheKey);
    if (!entry || entry.spriteKey !== spriteKey) {
      const spriteEntry = spriteSrc ? ensureSpriteLoaded(art) ;
      const shadowCfg = descriptor?.shadow ?? art?.shadow ?? null;
      entry = {
        spriteKey,
        spriteEntry,
        shadowCfg,
      };
      TOKEN_VISUAL_CACHE.set(cacheKey, entry);
    }
    return entry;
  }

  function ensureTokenArt(token){
    if (!token) return null;
    const desiredSkin = getUnitSkin(token.id);
    if (!token.art || token.skinKey !== desiredSkin) {
      const art = getUnitArt(token.id, { skinKey: desiredSkin }) /* as UnitArtDescriptor | null */;
      token.art = art;
      token.skinKey = art?.skinKey ?? desiredSkin ?? null;
    }
    return token.art ?? null;
  }
  function ensureSpriteLoaded(art){
    if (!art || !art.sprite || typeof Image === 'undefined') return null;
    const descriptor = normalizeSpriteDescriptor(art.sprite);
    if (!descriptor || !descriptor.src) return null;
    const skinId = descriptor.skinId ?? art.skinKey ?? null;
    const key = descriptor.cacheKey || `${descriptor.src}{skinId ?? ''}`;
    let entry = SPRITE_CACHE.get(key);
    if (!entry) {
      const img = new Image();
      entry = { status: 'loading', img, key, src, skinId };
      if ('decoding' in img) (img /* as HTMLImageElement & { decoding: string } */).decoding = 'async';
      img.onload = () => {
        entry!.status = 'ready';
        if (typeof window !== 'undefined') {
          try {
            window.dispatchEvent(new Event(ART_SPRITE_EVENT));
          } catch (_err) {
            // ignore
          }
        }
      };
      img.onerror = () => {
        entry!.status = 'error';
      };
      img.src = descriptor.src;
      SPRITE_CACHE.set(key, entry);
    }
    return entry;
  }

  function drawStylizedShape(
    ctx,
    width,
    height,
    anchor,
    art,
  ){
    const paletteSource = art?.palette ?? null;
    const palette= paletteSource ? { ...paletteSource } {};
    const primary = typeof palette.primary === 'string' ? palette.primary : '#86c4ff';
    const secondary = typeof palette.secondary === 'string' ? palette.secondary : '#1f3242';
    const accent = typeof palette.accent === 'string' ? palette.accent : '#d2f4ff';
    const outline = typeof palette.outline === 'string' ? palette.outline : 'rgba(0,0,0,0.55)';
    const top = -height * anchor;
    const bottom = height - height * anchor;
    const halfW = width / 2;
    const shape = art?.shape ?? 'sentinel';
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

  function drawNameplate(
    ctx,
    text,
    x,
    y,
    r,
    art,
  ){
    if (!text) return;
    const layout= art?.layout ?? {};
    const fontSize = Math.max(11, Math.floor(r * (layout.labelFont ?? 0.7)));
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
        height),
      };
      nameplateMetricsCache.set(key, cached);
    }
    const { width, height } = cached;
    const radius = Math.max(4, Math.floor(height / 2));
    const boxX = Math.round(x - width / 2);
    const boxY = Math.round(y - height / 2);
    roundedRectPath(ctx, boxX, boxY, width, height, radius);
    const label = art?.label;
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
  function drawTokensOblique(
    ctx,
    g,
    tokens,
    cam,
    options= {},
  ){
    const C = resolveCameraOptions(cam);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const baseR = Math.floor(g.tile * 0.36);
    const sig = contextSignature(g, C);
    const meleeOffsets = options?.meleeOffsets ?? null;
    const meleeOffsetMap = meleeOffsets instanceof Map ? meleeOffsets : null;

    const alive = TOKEN_DRAW_BUFFER;
    alive.length = 0;
    for (const token of tokens) {
      if (!token || !token.alive) {
        if (token && !token.alive) {
          if (typeof token === 'object') {
            clearTokenCaches(token);
          } else {
            warnInvalidToken('drawTokensOblique', token);
          }
        }
        continue;
      }
      const projection = getTokenProjection(token, g, C, sig);
      if (!projection) continue;
      const key = tokenVisualKey(token);
      const offset = key && meleeOffsetMap ? meleeOffsetMap.get(key) ?? null : null;
      const x = offset ? projection.x + offset.x : projection.x;
      const y = offset ? projection.y + offset.y : projection.y;
      alive.push({ token, x, y, scale);
    }

    alive.sort(sortByProjectionDepth);

    const perfCfg = CFG?.PERFORMANCE || {};
    const mediumThreshold = Number.isFinite(perfCfg.SHADOW_MEDIUM_THRESHOLD)
      ? (perfCfg.SHADOW_MEDIUM_THRESHOLD /* as number */)
      ;
    const shadowThreshold = Number.isFinite(perfCfg.SHADOW_DISABLE_THRESHOLD)
      ? (perfCfg.SHADOW_DISABLE_THRESHOLD /* as number */)
      ;
    const highDprCutoff = Number.isFinite(perfCfg.SHADOW_HIGH_DPR_CUTOFF)
      ? (perfCfg.SHADOW_HIGH_DPR_CUTOFF /* as number */)
      ;
    const gridDpr = Number.isFinite(g?.dpr) ? g.dpr : null;

    let shadowPreset= null;
    if (perfCfg.LOW_POWER_SHADOWS) {
      shadowPreset = normalizeShadowPreset(perfCfg.LOW_SHADOW_PRESET, 'off');
    } else {
      if (!shadowPreset && highDprCutoff !== null && gridDpr !== null && gridDpr >= highDprCutoff) {
        shadowPreset = normalizeShadowPreset(perfCfg.HIGH_DPR_SHADOW_PRESET, 'off');
      }
      if (!shadowPreset && shadowThreshold !== null && alive.length >= shadowThreshold) {
        shadowPreset = normalizeShadowPreset(
          perfCfg.HIGH_LOAD_SHADOW_PRESET,
          normalizeShadowPreset(perfCfg.LOW_SHADOW_PRESET, 'off'),
        );
      }
      if (!shadowPreset && mediumThreshold !== null && alive.length >= mediumThreshold) {
        shadowPreset = normalizeShadowPreset(perfCfg.MEDIUM_SHADOW_PRESET, 'medium');
      }
    }
    const reduceShadows = shadowPreset !== null;

    for (const { token: t, x, y, scale) {
      const scale = projectionScale ?? 1;
      const r = Math.max(6, Math.floor(baseR * scale));
      const facing = t.side === 'ally' ? 1 : -1;

      const art = ensureTokenArt(t);
      const layout= art?.layout ?? {};
      const spriteCfg = normalizeSpriteDescriptor(art?.sprite ?? null) ?? {};
      const spriteHeightMult = layout.spriteHeight ?? 2.4;
      const spriteScale = Number.isFinite(spriteCfg.scale) ? spriteCfg.scale! : 1;
      const spriteHeight = r * spriteHeightMult * (art?.size ?? 1) * spriteScale;
      const spriteAspect = (Number.isFinite(spriteCfg.aspect) ? spriteCfg.aspect! : null) ?? layout.spriteAspect ?? 0.78;
      const spriteWidth = spriteHeight * spriteAspect;
      const anchor = Number.isFinite(spriteCfg.anchor) ? spriteCfg.anchor! : layout.anchor ?? 0.78;
      const hasRichArt = !!(art && ((spriteCfg && spriteCfg.src) || art.shape));

      if (hasRichArt) {
        const { spriteEntry, shadowCfg } = getTokenVisual(t, art);
        const spriteReady = !!(spriteEntry && spriteEntry.status === 'ready' && spriteEntry.img);
        ctx.save();
        ctx.translate(px, py);
        if (facing === -1 && art?.mirror !== false) ctx.scale(-1, 1);

        const rawShadow = shadowCfg ?? art?.shadow ?? null;
        const shadowObject= rawShadow && typeof rawShadow === 'object' ? rawShadow : {};
        const shadowColorFallback = typeof rawShadow === 'string'
          ? rawShadow
          : typeof art?.shadow === 'string'
            ? art.shadow
            : undefined;
        let shadowColor = shadowObject.color ?? art?.glow ?? shadowColorFallback ?? 'rgba(0,0,0,0.35)';
        let shadowBlur = Number.isFinite(shadowObject.blur) ? shadowObject.blur! : Math.max(6, r * 0.7);
        let shadowOffsetX = Number.isFinite(shadowObject.offsetX) ? shadowObject.offsetX! : 0;
        let shadowOffsetY = Number.isFinite(shadowObject.offsetY) ? shadowObject.offsetY! : Math.max(2, r * 0.2);

        if (reduceShadows) {
          const cheap = shadowPreset;
          if (cheap === 'soft') {
            shadowColor = 'rgba(0, 0, 0, 0.18)';
            shadowBlur = Math.min(6, shadowBlur * 0.4);
            shadowOffsetX = 0;
            shadowOffsetY = Math.min(4, Math.max(1, shadowOffsetY * 0.4));
          } else if (cheap === 'medium') {
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
        if (spriteReady && spriteEntry) {
          ctx.drawImage(spriteEntry.img, -spriteWidth / 2, -spriteHeight * anchor, spriteWidth, spriteHeight);
        } else {
          drawStylizedShape(ctx, spriteWidth, spriteHeight, anchor, art);
        }
        ctx.restore();
      } else if (TOKEN_STYLE_VALUE === 'chibi') {
        drawChibi(ctx, px, py, r, facing, t.color || '#9adcf0');
      } else {
        ctx.fillStyle = t.color || '#9adcf0';
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (art?.label !== false) {
        const name = formatName(t.name || t.id);
        const offset = layout.labelOffset ?? 1.2;
        drawNameplate(ctx, name, px, py + r * offset, r, art);
      }
    }
  }

  function drawQueuedOblique(
    ctx,
    g,
    queued,
    cam,
  ){
    if (!queued) return;
    const C = resolveCameraOptions(cam);
    const baseR = Math.floor(g.tile * 0.36);

    const drawSide = (map, side)=> {
      if (!isSummonMap(map)) return;
      if (!shouldShowQueuedSide(side)) return;
      for (const p of map.values()) {
        if (!p) continue;
        const projection = projectCellObliqueWithCamera(g, p.cx, p.cy, C);
        const r = Math.max(6, Math.floor(baseR * projection.scale));
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = p.color || '#5b6a78';
        ctx.beginPath();
        ctx.arc(projection.x, projection.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    drawSide(queued.ally, 'ally');
    drawSide(queued.enemy, 'enemy');
  }

  const SIDE = {
    ALLY: 'ally',
    ENEMY,
  } /* /* as const */ /* satisfies Record<'ALLY' | 'ENEMY' */ */, Side>;

  function isAllySide(side){
    return side === SIDE.ALLY || side === 'ally';
  }

  function enemyStartColumn(){
    return CFG.GRID_COLS - CFG.ENEMY_COLS;
  }

  function slotIndex(side, cx, cy){
    if (isAllySide(side)) {
      return (CFG.ALLY_COLS - 1 - cx) * SIDE_ROW_COUNT + (cy + 1);
    }
    const enemyStart = enemyStartColumn();
    const colIndex = cx - enemyStart;
    return colIndex * SIDE_ROW_COUNT + (cy + 1);
  }

  function slotToCell(side, slot){
    const s = Math.max(1, Math.min(SIDE_SLOT_COUNT, slot | 0));
    const colIndex = Math.floor((s - 1) / SIDE_ROW_COUNT);
    const rowIndex = (s - 1) % SIDE_ROW_COUNT;
    if (isAllySide(side)) {
      const cx = CFG.ALLY_COLS - 1 - colIndex;
      const cy = rowIndex;
      return { cx, cy };
    }
    const enemyStart = enemyStartColumn();
    const cx = enemyStart + colIndex;
    const cy = rowIndex;
    return { cx, cy };
  }

  function zoneCode(side, cx, cy, { numeric = false }= {}){
    const slot = slotIndex(side, cx, cy);
    const allySide = isAllySide(side);
    if (numeric) return (allySide ? 0 : 1) * 16 + slot;
    const prefix = allySide ? 'A' : 'E';
    return prefix + String(slot);
  }

  const ORDER_ALLY= Array.from(
    { length: SIDE_SLOT_COUNT },
    (_, i) => slotToCell(SIDE.ALLY, i + 1),
  );
  const ORDER_ENEMY= Array.from(
    { length: SIDE_SLOT_COUNT },
    (_, i) => slotToCell(SIDE.ENEMY, i + 1),
  );
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
};
__modules['./entry.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/entry.ts
  __require('./aether.ts');const __dep0 = __require('./app/shell.ts');
  const createAppShell = __dep0.createAppShell;
  const __dep1 = __require('./config.ts');
  const CFG = __dep1.CFG;
  const __dep2 = __require('./screens/main-menu/view/index.ts');
  const renderMainMenuView = __dep2.renderMainMenuView;
  const __dep3 = __require('./data/modes.ts');
  const MODES = __dep3.MODES;
  const MODE_GROUPS = __dep3.MODE_GROUPS;
  const MODE_STATUS = __dep3.MODE_STATUS;
  const getMenuSections = __dep3.getMenuSections;
  const __dep4 = __require('./utils/module-resolution.ts');
  const resolveModuleFunction = __dep4.resolveModuleFunction;
  const __dep5 = __require('./utils/player-profile.ts');
  const loadPlayerProfile = __dep5.loadPlayerProfile;
  const isUnitOwnedByProfile = __dep5.isUnitOwnedByProfile;
  const SavedPlayerProfile = __dep5.SavedPlayerProfile;
  const __dep6 = __require('./utils/profile-progress-merge.ts');
  const mergeProfileProgressIntoCollectionState = __dep6.mergeProfileProgressIntoCollectionState;
  function isComingSoonModule(module){
    if (!module) return true;
    const record = module /* as { comingSoon: unknown */; COMING_SOON_MODULE: { comingSoon: unknown } };
    if (record.comingSoon) return true;
    if (record.COMING_SOON_MODULE?.comingSoon) return true;
    return false;
  }

  function dismissModal(){
    if (activeModal && typeof activeModal.remove === 'function'){
      activeModal.remove();
    }
    activeModal = null;
  }

  function clearAppScreenClasses(){
    const root = rootElement;
    if (!root || !root.classList) return;
    APP_SCREEN_CLASSES.forEach(cls => root.classList.remove(cls));
  }

  const destroyHandle = (
    handle) => void } | null | undefined,
    label,
  )=> {
    if (!handle || typeof handle.destroy !== 'function') return;
    try {
      handle.destroy();
    } catch (err) {
      console.error(`[${label}] cleanup error`, err);
    }
  };

  function destroyCustomScreen(force = false){
    const hasActiveScreen = !!(customScreenController || customScreenId);
    if (!force && !hasActiveScreen){
      return;
    }
    destroyHandle(customScreenController, 'screen');
    customScreenController = null;
    customScreenId = null;
    const root = rootElement;
    if (!root) return;
    if (root.classList){
      APP_SCREEN_CLASSES.forEach(cls => root.classList.remove(cls));
    }
    if (typeof root.innerHTML === 'string'){
      root.innerHTML = '';
    }
  }

  function destroyCollectionView(){
    destroyHandle(collectionView, 'collection');
    collectionView = null;
  }

  function destroyLineupView(){
    destroyHandle(lineupView, 'lineup');
    lineupView = null;
  }

  function destroySectView(){
    destroyHandle(sectView, 'sect');
    sectView = null;
  }

  function mergeDefinitionParams(definition, params){
    const baseValue = cloneScreenParams(definition?.params ?? null);
    const incomingValue = cloneScreenParams(params);

    if (!baseValue && !incomingValue){
      return null;
    }

    if (!baseValue){
      return incomingValue;
    }

    if (!incomingValue){
      return baseValue;
    }

    return { ...baseValue, ...incomingValue };
  }

  function resolveScreenRenderer(module){
    const candidate = resolveModuleFunction(
      module,
      ['renderCollectionScreen', 'renderScreen'],
      ['render']
    );
    return typeof candidate === 'function' ? candidate : null;
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
      shell,
      definition,
      params,
      screenId
    }) ?? null;

    customScreenController = controller /* as MaybeViewController */;
    customScreenId = screenId;
  }

  function showComingSoonModal(label?){
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
    if (closeButton instanceof HTMLElement){
      closeButton.addEventListener('click', ()=>{
        dismissModal();
      });
    }
    rootElement.appendChild(modal);
    activeModal = modal;
  }

  function showPveBoardMissingNotice(message){
    const title = 'Không thể tải chế độ PvE';
    if (renderMessageRef && renderMessageIsExternal){
      try {
        renderMessageRef({
          title,
          body);
        return true;
      } catch (error) {
        console.warn('Không thể sử dụng renderMessageRef để hiển thị thông báo PvE.', error);
      }
    }
    if (typeof document === 'undefined' || !document.body){
      return false;
    }
    const modalId = 'pve-board-error-modal';
    const existing = document.getElementById(modalId);
    if (existing && typeof existing.remove === 'function'){
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
    if (closeButton instanceof HTMLElement){
      closeButton.addEventListener('click', () => {
        modal.remove();
      });
    }
    document.body.appendChild(modal);
    return true;
  }

  async function renderCollectionScreen(params){
    const root = rootElement;
    const shell = shellInstance;
    if (!root || !shell) return;
    const token = ++collectionRenderToken;
    dismissModal();
    clearAppScreenClasses();
    destroyCollectionView();
    lineupRenderToken += 1;
    destroyLineupView();
    if (root.classList){
      root.classList.add('app--collection');
    }
    if (typeof root.innerHTML === 'string'){
      root.innerHTML = '<div class="app-loading">Đang tải bộ sưu tập...</div>';
    }

    let module;
    try {
      module = await loadBundledModule(COLLECTION_SCREEN_MODULE_ID);
    } catch (error) {
      if (token !== collectionRenderToken) return;
      throw error;
    }

    if (token !== collectionRenderToken) return;

    const render = resolveModuleFunction(
      module,
      ['renderCollectionScreen', 'renderCollectionView'],
      ['render']
    ) /* as ScreenRenderer | null */;
    if (typeof render !== 'function'){
      throw new Error('Module bộ sưu tập không cung cấp hàm render hợp lệ.');
    }

    const definition = getDefinitionByScreen(SCREEN_COLLECTION);
    if (!definition){
      throw new Error('Không tìm thấy định nghĩa màn hình bộ sưu tập.');
    }
    collectionView = (render({
      root,
      shell,
      definition,
      params,
      screenId) ?? null);
  }

  async function renderLineupScreen(params){
    const root = rootElement;
    const shell = shellInstance;
    if (!root || !shell) return;
    const token = ++lineupRenderToken;
    dismissModal();
    clearAppScreenClasses();
    destroyLineupView();
    collectionRenderToken += 1;
    destroyCollectionView();
    if (root.classList){
      root.classList.add('app--lineup');
    }
    if (typeof root.innerHTML === 'string'){
      root.innerHTML = '<div class="app-loading">Đang tải đội hình...</div>';
    }

    let module;
    try {
      module = await loadBundledModule(LINEUP_SCREEN_MODULE_ID);
    } catch (error) {
      if (token !== lineupRenderToken) return;
      throw error;
    }

    if (token !== lineupRenderToken) return;

    const render = resolveModuleFunction(
      module,
      ['renderLineupScreen'],
      ['render']
    ) /* as ScreenRenderer | null */;
    if (typeof render !== 'function'){
      throw new Error('Module đội hình không cung cấp hàm render hợp lệ.');
    }

    const definition = getDefinitionByScreen(SCREEN_LINEUP);
    if (!definition){
      throw new Error('Không tìm thấy định nghĩa màn hình đội hình.');
    }
    const lineupResult = render({
      root,
      shell,
      definition,
      params,
      screenId);
    lineupView = (lineupResult /* as LineupViewHandle | void */) ?? null;
  }

  async function renderSectScreen(params){
    const root = rootElement;
    const shell = shellInstance;
    if (!root || !shell) return;
    const token = ++sectRenderToken;
    dismissModal();
    clearAppScreenClasses();
    destroySectView();
    collectionRenderToken += 1;
    destroyCollectionView();
    lineupRenderToken += 1;
    destroyLineupView();
    if (root.classList){
      root.classList.add('app--sect');
    }
    if (typeof root.innerHTML === 'string'){
      root.innerHTML = '<div class="app-loading">Đang tải tông môn...</div>';
    }

    let module;
    try {
      module = await loadBundledModule(SECT_SCREEN_MODULE_ID);
    } catch (error) {
      if (token !== sectRenderToken) return;
      throw error;
    }

    if (token !== sectRenderToken) return;

    const render = resolveModuleFunction(
      module,
      ['renderScreen'],
      ['render']
    ) /* as ScreenRenderer | null */;
    if (typeof render !== 'function'){
      throw new Error('Module tông môn không cung cấp hàm render hợp lệ.');
    }

    const definition = getDefinitionByScreen(SCREEN_SECT);
    if (!definition){
      throw new Error('Không tìm thấy định nghĩa màn hình tông môn.');
    }

    sectView = (render({
      root,
      shell,
      definition,
      params,
      screenId) ?? null);
  }

  async function renderSectTacticalAiScreen(params){
    const root = rootElement;
    const shell = shellInstance;
    if (!root || !shell) return;
    const token = ++sectRenderToken;
    dismissModal();
    clearAppScreenClasses();
    destroySectView();
    collectionRenderToken += 1;
    destroyCollectionView();
    lineupRenderToken += 1;
    destroyLineupView();
    if (root.classList){
      root.classList.add('app--sect-tactical-ai');
    }
    if (typeof root.innerHTML === 'string'){
      root.innerHTML = '<div class="app-loading">Đang tải Thiên Cơ Các...</div>';
    }

    let module;
    try {
      module = await loadBundledModule(SECT_TACTICAL_AI_SCREEN_MODULE_ID);
    } catch (error) {
      if (token !== sectRenderToken) return;
      throw error;
    }

    if (token !== sectRenderToken) return;

    const render = resolveModuleFunction(
      module,
      ['renderScreen'],
      ['render']
    ) /* as ScreenRenderer | null */;
    if (typeof render !== 'function'){
      throw new Error('Module Thiên Cơ Các không cung cấp hàm render hợp lệ.');
    }

    const definition = getDefinitionByScreen(SCREEN_SECT) ?? getDefinitionByScreen(SCREEN_MAIN_MENU);
    if (!definition){
      throw new Error('Không tìm thấy định nghĩa màn hình Thiên Cơ Các.');
    }

    sectView = (render({
      root,
      shell,
      definition,
      params,
      screenId) ?? null);
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
    const sections= MENU_SECTIONS;
    mainMenuView = renderMainMenuView({
      root: rootElement,
      shell,
      sections,
      metadata,
      playerGender,
      onShowComingSoon) => {
        const def = mode?.key ? MODE_DEFINITIONS[mode.key] ;
        const label = def?.label || mode?.title || mode?.label || '';
        showComingSoonModal(label);
      }
    }) /* as MaybeViewController */;
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
      <div class="pve-stage">
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
        <div class="leader-ult-controls" data-role="leader-ult-controls" hidden>
          <button type="button" class="leader-ult-controls__btn" data-ult-choice="A">Ult A</button>
          <button type="button" class="leader-ult-controls__btn" data-ult-choice="B">Ult B</button>
          <button type="button" class="leader-ult-controls__btn" data-ult-choice="C">Ult C</button>
        </div>
        <div id="cards"></div>
      </div>
    `;
    rootElement.appendChild(container);
    const exitButton = container.querySelector('[data-action="exit"]');
    if (exitButton instanceof HTMLElement && typeof options?.onExit === 'function'){
      exitButton.addEventListener('click', options.onExit);
    }
    return container;
  }

  function isPvpLikeMode(modeKey){
    const key = (modeKey || '').toLowerCase();
    return key === 'ares' || key.includes('pvp');
  }

  function resolveBattleOverlayLabels(
    winner,
    modeKey,
  ){ primary: string; secondary: string | null } {
    if (winner === 'draw') {
      return { primary: 'Hòa', secondary)) {
      if (winner === 'ally') {
        return { primary: 'Chiến thắng', secondary=== 'enemy') {
        return { primary: 'Thua cuộc', secondary=== 'ally') return { primary: 'Chiến thắng', secondary=== 'enemy') return { primary: 'Thua cuộc', secondary, secondary){
    if (!container) return;
    const existing = container.querySelector('[data-role="battle-result-overlay"]');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  }

  function showBattleResultOverlay(
    container,
    params) => void;
    },
  ){
    removeBattleResultOverlay(container);
    const labels = resolveBattleOverlayLabels(params.winner, params.modeKey);
    const overlay = document.createElement('div');
    overlay.setAttribute('data-role', 'battle-result-overlay');
    overlay.style.cssText = [
      'position:absolute',
      'inset:0',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'background:rgba(2,6,12,.72)',
      'backdrop-filter:blur(2px)',
      'z-index:30',
    ].join(';');

    const panel = document.createElement('div');
    panel.style.cssText = [
      'min-width:220px',
      'max-width:min(92vw,420px)',
      'border-radius:16px',
      'border:1px solid rgba(125,211,252,.4)',
      'background:rgba(10,18,28,.95)',
      'box-shadow:0 20px 44px rgba(0,0,0,.45)',
      'padding:20px 18px',
      'text-align:center',
      'display:flex',
      'flex-direction:column',
      'gap:12px',
      'color:#d8f4ff',
    ].join(';');

    const title = document.createElement('h3');
    title.textContent = labels.primary;
    title.style.cssText = 'margin:0;font-size:28px;line-height:1.2;text-transform:uppercase;letter-spacing:.04em;';
    panel.appendChild(title);

    if (labels.secondary) {
      const secondary = document.createElement('div');
      secondary.textContent = `Đối thủ: ${labels.secondary}`;
      secondary.style.cssText = 'font-size:14px;opacity:.86;';
      panel.appendChild(secondary);
    }

    const countdown = document.createElement('div');
    countdown.textContent = 'Tự động cho phép thoát sau 3s';
    countdown.style.cssText = 'font-size:13px;opacity:.72;';
    panel.appendChild(countdown);

    const exitButton = document.createElement('button');
    exitButton.type = 'button';
    exitButton.textContent = 'Thoát';
    exitButton.disabled = true;
    exitButton.style.cssText = [
      'padding:10px 16px',
      'border-radius:12px',
      'border:1px solid rgba(125,211,252,.35)',
      'background:rgba(14,26,38,.9)',
      'color:#d8f4ff',
      'font-weight:700',
      'cursor:pointer',
      'opacity:.65',
    ].join(';');
    panel.appendChild(exitButton);

    overlay.appendChild(panel);
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    container.appendChild(overlay);

    const allowExit = window.setTimeout(() => {
      exitButton.disabled = false;
      exitButton.style.opacity = '1';
      countdown.textContent = 'Bạn có thể thoát trận đấu';
    }, 3000);

    exitButton.addEventListener('click', () => {
      window.clearTimeout(allowExit);
      params.onExit();
    }, { once: true });
  }

  async function requestLandscapeForGameplay(){
    if (typeof window === 'undefined') return;
    const screenApi = window.screen;
    const orientationApi = screenApi && 'orientation' in screenApi
      ? (screenApi.orientation /* as (ScreenOrientation & { lock: (orientation) => Promise<void> }) | null)
      ;
    if (!orientationApi || typeof orientationApi.lock !== 'function') return;

    try {
      await orientationApi.lock('landscape');
      return;
    } catch (_error) {
      // Một số trình duyệt yêu cầu fullscreen trước khi lock orientation.
    }

    const doc = typeof document !== 'undefined' ? document : null;
    const root = doc?.documentElement /* as (HTMLElement & { requestFullscreen: ( */) => Promise<void> }) | null;
    if (!root || typeof root.requestFullscreen !== 'function') return;

    try {
      if (!doc?.fullscreenElement) {
        await root.requestFullscreen();
      }
      await orientationApi.lock('landscape');
    } catch (_error) {
      // Best effort: không chặn người chơi nếu thiết bị không hỗ trợ.
    }
  }

  function installAutoLandscapeRequest(){
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let hasLockedOrientation = false;
    const tryLockLandscape = () => {
      if (hasLockedOrientation) return;
      requestLandscapeForGameplay()
        .then(() => {
          hasLockedOrientation = true;
        })
        .catch(() => {
          // Best effort: bỏ qua lỗi vì có thể thiếu quyền hoặc chưa có tương tác người dùng.
        });
    };

    tryLockLandscape();

    const oneShotUserGesture = () => {
      tryLockLandscape();
      document.removeEventListener('pointerdown', oneShotUserGesture);
      document.removeEventListener('touchstart', oneShotUserGesture);
      document.removeEventListener('keydown', oneShotUserGesture);
    };

    document.addEventListener('pointerdown', oneShotUserGesture, { passive: true });
    document.addEventListener('touchstart', oneShotUserGesture, { passive: true });
    document.addEventListener('keydown', oneShotUserGesture);

    window.addEventListener('focus', tryLockLandscape);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        tryLockLandscape();
      }
    });
  }

  function teardownActiveSession(){
    if (!shellInstance) return;
    const current = shellInstance.getState()?.activeSession /* as { stop: ( */) => void } | null;
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
    const extractStartConfig = (source)=> {
      if (!source || typeof source !== 'object') return null;
      const record = source /* as UnknownRecord & { sessionConfig: unknown } */;
      const payload = record.sessionConfig && typeof record.sessionConfig === 'object'
        ? record.sessionConfig /* as UnknownRecord */
        : record;
      return { ...payload };
    };
    teardownActiveSession();
    if (!shellInstance) return;
    const shell = shellInstance;
    const candidateModeKey = params && typeof params === 'object' && !Array.isArray(params)
      ? (params /* as { modeKey: unknown } */).modeKey
      : undefined;
    const modeKey = typeof candidateModeKey === 'string' && MODE_DEFINITIONS[candidateModeKey]
      ? candidateModeKey
      : 'campaign';
    const fallbackDefinition = MODE_DEFINITIONS.campaign;
    if (!fallbackDefinition){
      throw new Error('Thiếu định nghĩa chế độ campaign.');
    }
    const definition= MODE_DEFINITIONS[modeKey] ?? fallbackDefinition;
    const rawParams = params && typeof params === 'object' && !Array.isArray(params)
      ? { ...(params /* as UnknownRecord */) }
      {};
    const defaultParams = definition?.params && typeof definition.params === 'object' && !Array.isArray(definition.params)
      ? { ...(definition.params /* as UnknownRecord */) }
      {};
    const mergedParams= { ...defaultParams, ...rawParams };
    const definitionConfig = extractStartConfig(definition?.params ?? null);
    const incomingConfig = extractStartConfig(params);
    const mergedStartConfig= {
      ...(definitionConfig || {}),
      ...(incomingConfig || {})
    };
    const mergedParamsWithConfig = mergedParams /* as UnknownRecord & { sessionConfig: unknown } */;
    const hasSessionConfig = Object.prototype.hasOwnProperty.call(mergedParamsWithConfig, 'sessionConfig');
    const sessionConfigValue = hasSessionConfig && mergedParamsWithConfig.sessionConfig && typeof mergedParamsWithConfig.sessionConfig === 'object'
      ? { ...(mergedParamsWithConfig.sessionConfig /* as UnknownRecord */) }
      ;
    const hasSessionConfigObject = hasSessionConfig && sessionConfigValue && typeof sessionConfigValue === 'object';
    const { sessionConfig: _ignoredSessionConfig, ...restMergedParams } = mergedParamsWithConfig;
    const createSessionOptions= {
      ...restMergedParams,
      ...mergedStartConfig,
      ...(hasSessionConfig ? {
        sessionConfig: hasSessionConfigObject ? { ...sessionConfigValue /* as UnknownRecord } 
      } {})
    };
    const startSessionOptions= {
      ...restMergedParams,
      ...mergedStartConfig
    };
    const profile = loadPlayerProfile();
    const storedLineupDeck = Array.isArray(profile.lineupDeck)
      ? profile.lineupDeck
        .filter((id)=> typeof id === 'string' && id.trim() !== '')
        .filter((id) => isUnitOwnedByProfile(profile, id))
        .slice(0, 10)
      ;
    if (storedLineupDeck.length > 0){
      const lineupDeckEntries = storedLineupDeck.map(id => ({ id }));
      createSessionOptions.lineupDeck = lineupDeckEntries;
      startSessionOptions.lineupDeck = lineupDeckEntries;
    }
    const mergedCollectionState = mergeProfileProgressIntoCollectionState(
      createSessionOptions.collectionState,
      profile,
    );
    if (mergedCollectionState) {
      createSessionOptions.collectionState = mergedCollectionState;
      startSessionOptions.collectionState = mergedCollectionState;
    }
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
        shell.enterScreen(SCREEN_MAIN_MENU);
        return;
      }
      throw error;
    }
    if (token !== pveRenderToken) return;
    if (isComingSoonModule(module)){
      showComingSoonModal(definition.label);
      shell.enterScreen(SCREEN_MAIN_MENU);
      return;
    }
    let createPveSession = resolveModuleFunction(
      module,
      ['createPveSession']
    ) /* as ((container, options) => PveSession) | null;
    if (typeof createPveSession !== 'function'){
      const fallbackPveModule = await loadBundledModule(PVE_SESSION_MODULE_ID);
      if (token !== pveRenderToken) return;
      createPveSession = resolveModuleFunction(
        fallbackPveModule,
        ['createPveSession']
      ) /* as ((container, options) => PveSession) | null;
    }
    if (typeof createPveSession !== 'function'){
      throw new Error('PvE module missing createPveSession().');
    }
    let container= null;
    let unsubscribeBattleEnd=> void) | null = null;

    const exitToMainMenu = ()=> {
      if (typeof unsubscribeBattleEnd === 'function') unsubscribeBattleEnd();
      if (container) removeBattleResultOverlay(container);
      const state = shell.getState();
      const session = state?.activeSession;
      if (isStoppableSession(session)){
        try {
          session.stop();
        } catch (err) {
          console.warn('[pve] stop session failed', err);
        }
      }
      shell.setActiveSession(null);
      shell.enterScreen(SCREEN_MAIN_MENU);
    };

    container = renderPveLayout({
      title: definition.label,
      modeKey,
      onExit,
    });
    if (!container){
      throw new Error('Không thể dựng giao diện PvE.');
    }
    const session = createPveSession(container, createSessionOptions) /* as PveSession */;
    shell.setActiveSession(session);
    if (typeof session.onEvent === 'function') {
      const unsubscribe = session.onEvent('battle:end', (event) => {
        const detailSource = event && typeof event === 'object' && 'detail' in event
          ? (event /* as { detail: Record<string */, unknown> }).detail
          : event /* as Record<string */, unknown> | undefined;
        const result = detailSource && typeof detailSource === 'object'
          ? detailSource.result /* as Record<string */, unknown> | null | undefined
          : null;
        const winner = result && typeof result === 'object'
          ? result.winner /* as string | null | undefined */
          : null;
        showBattleResultOverlay(container, {
          winner,
          modeKey,
          onExit,
        });
      });
      unsubscribeBattleEnd = typeof unsubscribe === 'function' ? unsubscribe : null;
    } else {
      unsubscribeBattleEnd = null;
    }

    if (isStartableSession(session)){
      const scheduleRetry = (callback) => void) => {
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'){
          window.requestAnimationFrame(callback);
        } else {
          setTimeout(callback, 0);
        }
      };
      const MAX_BOARD_RETRIES = 30;
      const startSessionSafely = () => {
        if (token !== pveRenderToken) {
          if (typeof unsubscribeBattleEnd === 'function') unsubscribeBattleEnd();
          return;
        }
        const startConfig = { ...startSessionOptions, root= session.start(startConfig);
          if (!result){
            handleMissingBoard();
          }
        } catch (err) {
          shell.setActiveSession(null);
          throw err;
        }
      };
      const handleMissingBoard = () => {
        const message = 'Không thể tải bàn chơi PvE. Đang quay lại menu chính.';
        if (typeof unsubscribeBattleEnd === 'function') unsubscribeBattleEnd();
        const displayed = showPveBoardMissingNotice(message);
        if (!displayed){
          console.warn(message);
        }
        shell.setActiveSession(null);
        shell.enterScreen(SCREEN_MAIN_MENU);
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
      installAutoLandscapeRequest();
      if (isFileProtocol){
        console.warn('Đang chạy Arclune trực tiếp từ file://. Một số trình duyệt có thể chặn tài nguyên liên quan.');
      }
      rootElement = document.getElementById('appRoot');
      if (!rootElement){
        throw new Error('Không tìm thấy phần tử #appRoot.');
      }
      renderMessageRef = renderMessage;
      renderMessageIsExternal = typeof window !== 'undefined' && typeof window.arcluneRenderMessage === 'function';
      const handleShellError = (error) => {
        console.error('Arclune shell listener error', error);
        const renderer = renderMessageRef || renderMessage;
        if (renderer){
          showFatalError(error, renderer, bootstrapOptions);
        }
      };
      shellInstance = createAppShell({ onError: handleShellError });
      bootstrapOptions.isFileProtocol = isFileProtocol;
      let lastScreen= null;
      let lastParams= null;

      shellInstance.onChange((state) => {
        const nextScreen = state.screen;
        const nextParams = state.screenParams;
        const screenChanged = nextScreen !== lastScreen;
        const paramsChanged = !areScreenParamsEqual(nextParams, lastParams);

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
          sectRenderToken += 1;
          destroySectView();
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
          sectRenderToken += 1;
          destroySectView();
          if (mainMenuView && typeof mainMenuView.destroy === 'function'){
            mainMenuView.destroy();
            mainMenuView = null;
          }
          lastScreen = SCREEN_COLLECTION;
          lastParams = nextParams;
          pveRenderToken += 1;
          renderCollectionScreen(nextParams || null).catch((error) => {
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
            sectRenderToken += 1;
          destroySectView();
            mainMenuView = null;
          }
          lastScreen = SCREEN_LINEUP;
          lastParams = nextParams;
          pveRenderToken += 1;
          renderLineupScreen(nextParams || null).catch((error) => {
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
            sectRenderToken += 1;
          destroySectView();
            mainMenuView = null;
          }
          lastScreen = SCREEN_PVE;
          lastParams = nextParams;
          mountPveScreen(nextParams || {}).catch((error) => {
            console.error('Arclune failed to start PvE session', error);
            if (renderMessageRef){
              showFatalError(error, renderMessageRef, bootstrapOptions);
            }
          });
          return;
        }

        if (nextScreen === SCREEN_SECT_TACTICAL_AI){
          customScreenToken += 1;
          destroyCustomScreen();
          collectionRenderToken += 1;
          destroyCollectionView();
          lineupRenderToken += 1;
          destroyLineupView();
          sectRenderToken += 1;
          destroySectView();
          if (mainMenuView && typeof mainMenuView.destroy === 'function'){
            mainMenuView.destroy();
            mainMenuView = null;
          }
          lastScreen = SCREEN_SECT_TACTICAL_AI;
          lastParams = nextParams;
          pveRenderToken += 1;
          renderSectTacticalAiScreen(nextParams || null).catch((error) => {
            console.error('Arclune failed to load tactical ai screen', error);
            if (renderMessageRef){
              showFatalError(error, renderMessageRef, bootstrapOptions);
            }
          });
          return;
        }

        if (nextScreen === SCREEN_SECT){
          customScreenToken += 1;
          destroyCustomScreen();
          collectionRenderToken += 1;
          destroyCollectionView();
          lineupRenderToken += 1;
          destroyLineupView();
          sectRenderToken += 1;
          destroySectView();
          if (mainMenuView && typeof mainMenuView.destroy === 'function'){
            mainMenuView.destroy();
            mainMenuView = null;
          }
          lastScreen = SCREEN_SECT;
          lastParams = nextParams;
          pveRenderToken += 1;
          renderSectScreen(nextParams || null).catch((error) => {
            console.error('Arclune failed to load sect screen', error);
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
        sectRenderToken += 1;
        destroySectView();

        lastScreen = nextScreen;
        lastParams = nextParams;
        mountModeScreen(nextScreen, nextParams || null).catch((error) => {
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

};
__modules['./events.ts'] = (exports, module, __require) => {

};
__modules['./leader-uyen.ts'] = (exports, module, __require) => {





  function isSystemLeader(unit){
    return !!unit && typeof unit.id === 'string' && unit.id.startsWith('leader');
  }
};
__modules['./main.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/main.ts
  __require('./aether.ts');const __dep1 = __require('./events.ts');
  const addGameEventListener = __dep1.addGameEventListener;
  const __dep2 = __require('./modes/pve/session.ts');
  const createPveSession = __dep2.createPveSession;
  const __dep3 = __require('./utils/dummy.ts');
  const ensureNestedModuleSupport = __dep3.ensureNestedModuleSupport;

  const __reexport0 = __require('./events.ts');extends SessionConfigOverrides {
    root: RootSource;
    rootEl: RootSource;
    element: RootSource;
  }extends BaseSessionHandle {
    start(startConfig?);
    stop();
    updateConfig(next?);
    setUnitSkin(unitId, skinKey);
    onEvent(type, handler)=> void;
  }

  let currentSession= null;
  const pendingSkins = new Map();

  const isPlainRecord = (value)=> (
    !!value && typeof value === 'object' && !Array.isArray(value)
  );

  const toRootSource = (value)=> {
    if (value == null) return value /* as null | undefined */;
    if (typeof Element !== 'undefined' && value instanceof Element) return value;
    if (typeof Document !== 'undefined' && value instanceof Document) return value;
    if (typeof (value /* as { nodeType: unknown } */).nodeType === 'number'){
      return value /* as Element | Document */;
    }
    return undefined;
  };

  const toSessionConfigOverrides = (value)=> {
    if (!isPlainRecord(value)){
      return {};
    }
    return { ...(value /* as Record<string */, unknown>) } /* as SessionConfigOverrides */;
  };

  const defaultRootTarget = ()=> (typeof document !== 'undefined' ? document : null);

  const pickRootTarget = (...candidates)=> {
    for (const candidate of candidates) {
      const normalized = toRootSource(candidate);
      if (normalized) return normalized;
    }
    return defaultRootTarget();
  };

  function resolveRoot(
    config, 'root' | 'rootEl' | 'element'> | Record<string, unknown> | null | undefined,
  ){
    if (!config) return defaultRootTarget();
    return pickRootTarget(config.root, config.rootEl, config.element);
  }

  const normalizeStartOptions = (
    options,
  ){ rootTarget: RootTarget; config: SessionConfigOverrides } => {
    const rawOptions= isPlainRecord(options) ? options : {};
    const { root, rootEl, element, ...rest } = rawOptions;
    return {
      rootTarget: resolveRoot({ root, rootEl, element }),
      config),
    };
  };

  const flushPendingSkins = (session)=> {
    if (!session || pendingSkins.size === 0) return;
    for (const [unitId, skinKey] of pendingSkins) {
      if (session.setUnitSkin(unitId, skinKey)) {
        pendingSkins.delete(unitId);
      }
    }
  };

  function startGame(options?){
    ensureNestedModuleSupport();
    const { rootTarget, config= normalizeStartOptions(options);
    if (!currentSession) {
      currentSession = createPveSession(rootTarget, initialConfig);
    }
    const session = currentSession.start({ ...initialConfig, root);
    if (!session) {
      throw new Error('PvE board markup not found; render the layout before calling startGame');
    }
    flushPendingSkins(currentSession);
    return session;
  }

  function stopGame(){
    if (!currentSession) return;
    currentSession.stop();
    currentSession = null;
  }

  function updateGameConfig(config?){
    if (!currentSession) return;
    currentSession.updateConfig(toSessionConfigOverrides(config));
  }

  function getCurrentSession(){
    return currentSession;
  }

  function setUnitSkin(unitId, skinKey){
    const normalizedSkinKey = skinKey ?? null;
    pendingSkins.set(unitId, normalizedSkinKey);
    if (!currentSession) {
      return true;
    }
    const applied = currentSession.setUnitSkin(unitId, normalizedSkinKey);
    if (applied) pendingSkins.delete(unitId);
    return applied;
  }

  function onGameEvent(
    type,
    handler,
  )=> void {
    const subscribe = currentSession?.onEvent ?? addGameEventListener;
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
};
__modules['./meta.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/meta.ts — gom lookup + stat khởi tạo + nộ khởi điểm
  const __dep0 = __require('./catalog.ts');
  const CLASS_BASE = __dep0.CLASS_BASE;
  const RANK_MULT = __dep0.RANK_MULT;
  const CLASS_GROWTH = __dep0.CLASS_GROWTH;
  const getMetaById = __dep0.getMetaById;
  const getUnitKitById = __dep0.getUnitKitById;
  const scaleStatByRank = __dep0.scaleStatByRank;
  const __dep1 = __require('./utils/kit.ts');
  const extractOnSpawnRage = __dep1.extractOnSpawnRage;
  const kitSupportsSummon = __dep1.kitSupportsSummon;
  const __dep2 = __require('./utils/domain-normalization.ts');
  const normalizeClassName = __dep2.normalizeClassName;
};
__modules['./modes/coming-soon.stub.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/modes/coming-soon.stub.ts


  };

  const comingSoon = true;

  const COMING_SOON_MODULE= {
    comingSoon,
  };
  if (!Object.prototype.hasOwnProperty.call(exports, 'comingSoon')) exports.comingSoon = comingSoon;
  if (!Object.prototype.hasOwnProperty.call(exports, 'COMING_SOON_MODULE')) exports.COMING_SOON_MODULE = COMING_SOON_MODULE;
};
__modules['./modes/pve/chap-minh-runtime.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat.ts');
  const dealAbilityDamage = __dep0.dealAbilityDamage;
  const healUnit = __dep0.healUnit;
  const __dep1 = __require('./combat/number-utils.ts');
  const toFiniteNumber = __dep1.toFiniteNumber;
  const __dep2 = __require('./statuses.ts');
  const Statuses = __dep2.Statuses;


  const CHAP_MINH_ARM_RES_BUFF = 0.5;
  const CHAP_MINH_ARM_RES_BUFF_TURNS = 2;
  const CHAP_MINH_ULT_HEAL_PERCENT = 0.35;
  const CHAP_MINH_ULT_SHIELD_DAMAGE_RATIO = 0.5;

  function performChapMinhUltRuntime(ctx){
    const { game, unit, ultSkill, extendBusy } = ctx;
    if (!game || !unit || unit.id !== 'huyen_vu_chap_minh') return false;

    const healAmount = Math.max(0, Math.round(Math.max(0, toFiniteNumber(unit.hpMax, 0)) * CHAP_MINH_ULT_HEAL_PERCENT));
    if (healAmount > 0) {
      healUnit(unit, healAmount);
    }

    Statuses.add(unit, {
      id: 'chap_minh_ult_arm_up',
      kind,
      tag,
      attr,
      mode,
      amount,
      dur,
      tick,
      sourceUnitId,
    });
    Statuses.add(unit, {
      id: 'chap_minh_ult_res_up',
      kind,
      tag,
      attr,
      mode,
      amount,
      dur,
      tick,
      sourceUnitId,
    });

    if (typeof unit._recalcStats === 'function') {
      unit._recalcStats();
    }

    const shieldStatus = Statuses.get(unit, 'shield') /* as { amount: unknown } | null */;
    const currentShield = Math.max(0, toFiniteNumber(shieldStatus?.amount, 0));
    const base = Math.max(
      1,
      Math.round(
        Math.max(0, toFiniteNumber(unit.atk, 0))
        + Math.max(0, toFiniteNumber(unit.wil, 0))
        + currentShield * CHAP_MINH_ULT_SHIELD_DAMAGE_RATIO,
      ),
    );

    const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
    const tokens = Array.isArray(game.tokens) ? game.tokens : [];
    for (let index = 0; index < tokens.length; index += 1) {
      const target = tokens[index];
      if (!target?.alive || target.side !== foeSide) continue;
      dealAbilityDamage(game, unit, target, {
        base,
        dtype,
        attackType,
        isAoE,
        skill,
      });
    }

    extendBusy(1100);
    return true;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'performChapMinhUltRuntime')) exports.performChapMinhUltRuntime = performChapMinhUltRuntime;
};
__modules['./modes/pve/collection-mapper.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./data/roster-preview.ts');
  const TP_DELTA = __dep0.TP_DELTA;
  const __dep1 = __require('./unit-stat-resolver.ts');
  const resolveFinalCollectionUnitStats = __dep1.resolveFinalCollectionUnitStats;
  const __dep2 = __require('./utils/equipment.ts');
  const normalizeUnitEquipmentState = __dep2.normalizeUnitEquipmentState;

  const SKIN_FIELD_KEYS = ['skinKey', 'skin', 'avatarSkin', 'selectedSkin'] /* /* as const */ */;
  const PROGRESS_MAP_CACHE = new WeakMap<object, Map<string, RuntimeUnitProgress>>();
  const PROGRESS_LIST_CACHE = new WeakMap<object, Map<string, RuntimeUnitProgress>>();

  const GAMBITS_MAX_SLOTS = 5;
  const GAMBITS_CONDITIONS = new Set([
    'self_hp_below',
    'self_has_debuff',
    'ally_lowest_hp',
    'ally_controlled',
    'pool_aether_above',
    'enemy_lowest_hp',
    'enemy_is_boss',
    'enemy_role_is',
    'enemy_has_shield',
    'always',
  ]);
  const GAMBITS_ACTIONS = new Set(['basic', 'skill1', 'skill2', 'skill3']);

  const extractGambitSlots = (value)=> {
    if (Array.isArray(value)) return value /* as ReadonlyArray<GambitSlotInput> */;
    if (!value || typeof value !== 'object') return null;
    const container = value /* as GambitSlotsContainerInput */;
    const candidates = [container.slots, container.rows, container.gambit, container.tacticalAi];
    return candidates.find((entry)=> Array.isArray(entry)) ?? null;
  };

  const normalizeGambitSlots = (value)=> {
    const slots = extractGambitSlots(value);
    if (!slots) return undefined;
    const normalized= [];
    for (const raw of slots.slice(0, GAMBITS_MAX_SLOTS)) {
      if (!raw || typeof raw !== 'object') continue;
      const slot = raw /* as GambitSlotInput */;
      const condition = typeof slot.condition === 'string' && GAMBITS_CONDITIONS.has(slot.condition /* as GambitConditionType */)
        ? (slot.condition /* as GambitConditionType */)
        ;
      const action = typeof slot.action === 'string' && GAMBITS_ACTIONS.has(slot.action /* as GambitActionType */)
        ? (slot.action /* as GambitActionType */)
        ;
      if (!condition || !action) continue;

      const threshold = asFinite(slot.threshold);
      const targetRole = typeof slot.targetRole === 'string' && slot.targetRole.trim() ? slot.targetRole.trim() ;
      const enabled = asBoolean(slot.enabled);

      normalized.push({
        condition,
        action,
        ...(threshold != null ? { threshold } {}),
        ...(targetRole ? { targetRole } {}),
        enabled,
      });
    }

    return normalized.length > 0 ? normalized : undefined;
  };

  const asFinite = (value)=> {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const asBoolean = (value)=> {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
      if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
    }
    return null;
  };

  const readUnitId = (entry)=> {
    const raw = entry.unitId ?? entry.id ?? entry.key;
    return typeof raw === 'string' && raw.trim() ? raw.trim() ;
  };

  const getCollectionEntries = (collectionState)=> {
    if (!collectionState || typeof collectionState !== 'object') return [];
    const source = collectionState /* as Record<string */, unknown>;
    const list = source.units ?? source.ownedUnits ?? source.roster ?? source.collection;
    if (!Array.isArray(list)) return [];
    return list;
  };

  const normalizeInteger = (value, min)=> {
    const numeric = asFinite(value);
    if (numeric == null) return null;
    return Math.max(min, Math.floor(numeric));
  };

  const normalizeTpAlloc = (value)=> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const normalized= {};
    for (const [stat, rawAmount] of Object.entries(value /* as Record<string */, unknown>)) {
      const amount = asFinite(rawAmount);
      if (amount == null || amount === 0 || typeof TP_DELTA[stat] !== 'number') continue;
      normalized[stat] = amount;
    }
    return Object.keys(normalized).length > 0 ? normalized : null;
  };

  const readSkinKey = (entry)=> {
    for (const key of SKIN_FIELD_KEYS) {
      const value = entry[key];
      if (typeof value === 'string' && value.trim() !== '') {
        return value.trim();
      }
    }
    return null;
  };

  const normalizeProgress = (entry, equipmentByUnit?, unknown> | null)=> {
    const unitId = readUnitId(entry);
    if (!unitId) return null;

    const level = asFinite(entry.level ?? entry.lv);
    const realm = asFinite(entry.realm);
    const subRealm = asFinite(entry.subRealm ?? entry.sub_realm);
    const stars = asFinite(entry.stars ?? entry.star);
    const tp = asFinite(entry.tp ?? entry.talentPoint ?? entry.talentPoints);
    const tpAlloc = normalizeTpAlloc(entry.tpAlloc ?? entry.tpAllocation ?? entry.talentAllocation ?? entry.talentAlloc);
    const owned = asBoolean(entry.owned ?? entry.unlocked ?? entry.isOwned);
    const awakened = asBoolean(entry.awakened ?? entry.isAwakened);
    const inLineup = asBoolean(entry.inLineup ?? entry.isInLineup);
    const skinKey = readSkinKey(entry);

    const gambit = normalizeGambitSlots(entry.gambit ?? entry.tacticalAi);
    const entryEquipmentByUnit = entry.equipmentByUnit && typeof entry.equipmentByUnit === 'object' && !Array.isArray(entry.equipmentByUnit)
      ? entry.equipmentByUnit /* as Record<string */, unknown>
      : null;
    const equipmentSource = entry.equipment ?? entryEquipmentByUnit?.[unitId] ?? (equipmentByUnit ? equipmentByUnit[unitId] ;
    const equipment = normalizeUnitEquipmentState(equipmentSource);
    const hasEquipment = Object.values(equipment).some((itemId) => typeof itemId === 'string' && itemId.trim() !== '');

    const normalizedLevel = normalizeInteger(level, 1);
    const normalizedRealm = normalizeInteger(realm, 0);
    const normalizedSubRealm = normalizeInteger(subRealm, 0);
    const normalizedStars = normalizeInteger(stars, 0);
    const normalizedTp = normalizeInteger(tp, 0);

    const progress= {
      unitId,
      ...(normalizedLevel != null ? { level: normalizedLevel } {}),
      ...(normalizedRealm != null ? { realm: normalizedRealm } {}),
      ...(normalizedSubRealm != null ? { subRealm: normalizedSubRealm } {}),
      ...(normalizedStars != null ? { stars: normalizedStars } {}),
      ...(normalizedTp != null ? { tp: normalizedTp } {}),
      ...(tpAlloc ? { tpAlloc } {}),
      ...(owned != null ? { owned } {}),
      ...(awakened != null ? { awakened } {}),
      ...(inLineup != null ? { inLineup } {}),
      ...(skinKey ? { skinKey } {}),
      ...(gambit ? { gambit } {}),
      ...(hasEquipment ? { equipment } {}),
    };

    return progress;
  };

  function mapUnitProgressById(collectionState){
    if (collectionState && typeof collectionState === 'object') {
      const cached = PROGRESS_MAP_CACHE.get(collectionState /* as object */);
      if (cached) return cached;
    }

    const entries = getCollectionEntries(collectionState);
    const equipmentByUnit = collectionState && typeof collectionState === 'object' && !Array.isArray(collectionState.equipmentByUnit) && collectionState.equipmentByUnit && typeof collectionState.equipmentByUnit === 'object'
      ? collectionState.equipmentByUnit /* as Record<string */, unknown>
      : null;
    const listCacheKey = Array.isArray(entries) && !equipmentByUnit ? (entries /* as object */) ;
    if (listCacheKey){
      const cached = PROGRESS_LIST_CACHE.get(listCacheKey);
      if (cached){
        if (collectionState && typeof collectionState === 'object') {
          PROGRESS_MAP_CACHE.set(collectionState /* as object */, cached);
        }
        return cached;
      }
    }

    const out = new Map();
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)){
        continue;
      }
      const normalized = normalizeProgress(entry /* as CollectionItemCandidate */, equipmentByUnit);
      if (!normalized) continue;
      out.set(normalized.unitId, normalized);
    }

      if (listCacheKey){
      PROGRESS_LIST_CACHE.set(listCacheKey, out);
    }

    if (collectionState && typeof collectionState === 'object') {
      PROGRESS_MAP_CACHE.set(collectionState /* as object */, out);
    }

    return out;
  }

  function resolveRuntimeUnitStats(
    unitId,
    progressMap, RuntimeUnitProgress> | null | undefined,
  ){
    const progress = progressMap?.get(unitId) ?? null;
    return resolveFinalCollectionUnitStats({
      unitId,
      progress,
      hasCultivationData) ?? false,
    });
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'mapUnitProgressById')) exports.mapUnitProgressById = mapUnitProgressById;
  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveRuntimeUnitStats')) exports.resolveRuntimeUnitStats = resolveRuntimeUnitStats;
};
__modules['./modes/pve/creep-builder.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./units.ts');
  const lookupUnit = __dep0.lookupUnit;
  const __dep1 = __require('./modes/pve/collection-mapper.ts');
  const mapUnitProgressById = __dep1.mapUnitProgressById;
  const resolveRuntimeUnitStats = __dep1.resolveRuntimeUnitStats;
  const __dep2 = __require('./utils/domain-normalization.ts');
  const normalizeClassName = __dep2.normalizeClassName;

  const CREEP_SLOT_ORDER = [
    { id: 'creep_1', powerSlot,
    { id: 'creep_2', powerSlot,
    { id: 'creep_3', powerSlot,
  ] /* /* as const */ */;
  const CREEP_POWER_SLOT_BY_ID = new Map(
    CREEP_SLOT_ORDER.map((entry) => [entry.id, entry.powerSlot]),
  );
  const RANK_PRIORITY = ['N', 'R', 'SR', 'SSR', 'UR', 'PRIME'] /* /* as const */ */;
  const RANK_PRIORITY_SCORE = new Map(
    RANK_PRIORITY.map((rank, index) => [rank, index + 1]),
  );
  const EMPTY_PROGRESS_BY_ID = new Map();
  const DEFAULT_EMPTY_PROFILE= Object.freeze({});
  const DEFAULT_EMPTY_CREEP_DECK= Object.freeze(
    CREEP_SLOT_ORDER.map((creep) => ({
      id: creep.id,
      name)?.name ?? creep.id,
      cost,
      dynamicRankSource,
      dynamicLevelSource,
    } /* satisfies PveDeckEntry)) */,
  );

  function normalizeRank(value){
    if (typeof value !== 'string' || !value.trim()) return null;
    const normalized = value.trim().toUpperCase();
    return normalized;
  }

  function resolveRuntimeStatProfile(
    unitId,
    progressById, RuntimeUnitProgress>,
  ){
    const stats = resolveRuntimeUnitStats(unitId, progressById);
    return {
      hp: stats.hp,
      hpMax,
      atk,
      wil,
      arm,
      res,
      agi,
      per,
      aeMax,
      aeRegen,
      hpRegen,
    };
  }

  function sampleLineup(
    lineup,
    progressById, RuntimeUnitProgress>,
    unitMetaById,
  ){
    const rankCounts = new Map();
    const rankByUnitId= new Map();
    const progressProfiles= [];
    const costs= [];
    let totalRanked = 0;

    const getUnitMeta = (unitId){ rank: string | null; cost: number | null; name: string | null } => {
      const cached = unitMetaById.get(unitId);
      if (cached) return cached;
      const unit = lookupUnit(unitId);
      const next = {
        rank: normalizeRank(unit?.rank),
        cost) ? Number(unit?.cost) 
        name: typeof unit?.name === 'string' && unit.name ? unit.name : null,
      };
      unitMetaById.set(unitId, next);
      return next;
    };

    for (const entry of lineup) {
      const directRank = normalizeRank(entry.rank);
      let fallbackRank = rankByUnitId.get(entry.id) ?? null;
      if (!rankByUnitId.has(entry.id)) {
        fallbackRank = getUnitMeta(entry.id).rank;
        rankByUnitId.set(entry.id, fallbackRank);
      }
      const rank = directRank ?? fallbackRank;
      if (!rank) continue;
      rankCounts.set(rank, (rankCounts.get(rank) ?? 0) + 1);
      totalRanked += 1;

      const cost = Number.isFinite(entry.cost) ? Number(entry.cost) ;
      if (typeof cost === 'number' && Number.isFinite(cost) && cost > 0) costs.push(Math.floor(cost));

      const progress = progressById.get(entry.id);
      const progressRecord = progress /* as Record<string */, unknown> | undefined;
      const rawTp = progressRecord?.tp ?? (entry /* as Record<string */, unknown>).tp;
      const parsedTp = Number.isFinite(rawTp) ? Number(rawTp) ;
      progressProfiles.push({
        level: typeof progress?.level === 'number' ? progress.level : undefined,
        realm=== 'number' ? progress.realm : undefined,
        subRealm=== 'number' ? progress.subRealm : undefined,
        stars=== 'number' ? progress.stars : undefined,
        className) ?? undefined,
        tp,
        stats, progressById),
      });
    }
    return { rankCounts, totalRanked, progressProfiles, costs };
  }

  function compareRankDesc(left, right){
    const leftScore = RANK_PRIORITY_SCORE.get(left) ?? 0;
    const rightScore = RANK_PRIORITY_SCORE.get(right) ?? 0;
    if (leftScore !== rightScore) return rightScore - leftScore;
    return left.localeCompare(right);
  }

  function pickHighestRank(ranks){
    let highest= null;
    for (const rank of ranks) {
      if (!highest || compareRankDesc(rank, highest) < 0) highest = rank;
    }
    return highest;
  }

  function pickDonorBucket(buckets, highestRank){
    let donor= null;
    for (const bucket of buckets) {
      if (bucket.rank === highestRank || bucket.base <= 0) continue;
      if (!donor) {
        donor = bucket;
        continue;
      }
      if (bucket.base > donor.base || (bucket.base === donor.base && compareRankDesc(donor.rank, bucket.rank) < 0)) {
        donor = bucket;
      }
    }
    return donor;
  }

  function allocateRanksForCreeps(rankStats, 'rankCounts' | 'totalRanked'>, creepCount){
    const entries = Array.from(rankStats.rankCounts.entries());
    if (!entries.length || rankStats.totalRanked <= 0) return [];

    const provisional = entries.map(([rank, count]) => {
      const exact = (count * creepCount) / rankStats.totalRanked;
      const base = Math.floor(exact);
      return { rank, base, remainder);

    let assigned = provisional.reduce((sum, entry) => sum + entry.base, 0);
    provisional.sort((a, b) => {
      if (b.remainder !== a.remainder) return b.remainder - a.remainder;
      return compareRankDesc(a.rank, b.rank);
    });
    for (const entry of provisional) {
      if (assigned >= creepCount) break;
      entry.base += 1;
      assigned += 1;
    }

    const highestRank = pickHighestRank(entries.map(([rank]) => rank));
    const highestBucket = highestRank
      ? provisional.find((entry) => entry.rank === highestRank) ?? null
      : null;
    const donor = highestRank ? pickDonorBucket(provisional, highestRank) ;

    if (highestBucket && highestBucket.base <= 0 && donor) {
      donor.base -= 1;
      highestBucket.base += 1;
    }

    const ranked= [];
    for (const entry of provisional) {
      for (let i = 0; i < entry.base && ranked.length < creepCount; i += 1) {
        ranked.push(entry.rank);
      }
    }
    ranked.sort(compareRankDesc);
    return ranked.slice(0, creepCount);
  }

  function progressScore(profile){
    const level = typeof profile.level === 'number' ? profile.level : 0;
    const realm = typeof profile.realm === 'number' ? profile.realm : 0;
    const subRealm = typeof profile.subRealm === 'number' ? profile.subRealm : 0;
    const stars = typeof profile.stars === 'number' ? profile.stars : 0;
    const hpMax = typeof profile.stats?.hpMax === 'number' ? profile.stats.hpMax : 0;
    const atk = typeof profile.stats?.atk === 'number' ? profile.stats.atk : 0;
    const wil = typeof profile.stats?.wil === 'number' ? profile.stats.wil : 0;
    const defenses = ((typeof profile.stats?.arm === 'number' ? profile.stats.arm : 0)
      + (typeof profile.stats?.res === 'number' ? profile.stats.res : 0));
    return (hpMax * 0.18) + (atk * 4) + (wil * 3) + (defenses * 500) + (realm * 10000) + (subRealm * 100) + (stars * 220) + level;
  }

  function allocateProgressForCreeps(profiles, creepCount){
    if (!profiles.length) return Array.from({ length: creepCount }, () => DEFAULT_EMPTY_PROFILE);
    const sorted = [...profiles].sort((a, b) => progressScore(b) - progressScore(a));
    const output= [];
    for (let i = 0; i < creepCount; i += 1) {
      output.push(sorted[Math.min(i, sorted.length - 1)] ?? {});
    }
    return output;
  }

  function allocateCostsForCreeps(costs, creepCount){
    if (!costs.length) return Array.from({ length: creepCount }, () => 1);
    const sorted = [...costs]
      .map(value => Math.max(1, Math.floor(value)))
      .sort((a, b) => b - a);
    const output= [];
    for (let i = 0; i < creepCount; i += 1) {
      output.push(sorted[Math.min(i, sorted.length - 1)] ?? 1);
    }
    return output;
  }

  function clampInteger(value, min){
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    return Math.max(min, Math.floor(value));
  }

  function toCreepDeckEntry(params){
    const { creepId, profile, rank, cost, unitMetaById } = params;
    const cachedMeta = unitMetaById.get(creepId);
    const unitName = cachedMeta?.name ?? lookupUnit(creepId)?.name ?? creepId;
    const level = clampInteger(profile.level, 1);
    const realm = clampInteger(profile.realm, 0);
    const subRealm = clampInteger(profile.subRealm, 0);
    const stars = clampInteger(profile.stars, 0);
    const className = normalizeClassName(profile.className);
    const statOverrides = profile.stats ? { ...profile.stats } ;

    return {
      id: creepId,
      name,
      cost,
      dynamicRankSource,
      dynamicLevelSource,
      ...(rank ? { rank } {}),
      ...(level != null ? { level } {}),
      ...(realm != null ? { realm } {}),
      ...(subRealm != null ? { subRealm } {}),
      ...(stars != null ? { stars } {}),
      ...(statOverrides ? { statOverrides, ...statOverrides } {}),
      ...(className ? { class: className } {}),
      ...(typeof profile.tp === 'number' ? { tp: profile.tp } {}),
    } /* satisfies PveDeckEntry */;
  }

  function buildAICreepDeckFromLineup(params, RuntimeUnitProgress> | null;
    creepIds: ReadonlyArray<string> | null;
  }){
    const configuredCreepIds = Array.isArray(params.creepIds) && params.creepIds.length > 0
      ? params.creepIds.filter((value)=> typeof value === 'string' && value.trim() !== '')
      ;
    const creepIds = configuredCreepIds && configuredCreepIds.length > 0
      ? configuredCreepIds
      : CREEP_SLOT_ORDER.map((entry) => entry.id);
    const lineup = Array.isArray(params.lineup) ? params.lineup : [];
    if (lineup.length === 0) {
      if (!configuredCreepIds || configuredCreepIds.length <= 0) {
        return DEFAULT_EMPTY_CREEP_DECK.map(entry => ({ ...entry }));
      }
      return creepIds.map((creepId) => ({
        id: creepId,
        name)?.name ?? creepId,
        cost,
        dynamicRankSource,
        dynamicLevelSource,
      } /* satisfies PveDeckEntry)) */;
    }
    const creepCount = creepIds.length;
    const progressById = params.progressById
      ?? (lineup.length > 0
        ? mapUnitProgressById(params.collectionState ?? null)
        ;
    const unitMetaById= new Map();
    const lineupSampling = sampleLineup(lineup, progressById, unitMetaById);
    const allocatedRanks = allocateRanksForCreeps(lineupSampling, creepCount);
    const allocatedProgress = allocateProgressForCreeps(lineupSampling.progressProfiles, creepCount);
    const allocatedCosts = allocateCostsForCreeps(lineupSampling.costs, creepCount);

    return creepIds.map((creepId) => {
      const powerSlot = CREEP_POWER_SLOT_BY_ID.get(creepId) ?? 0;
      const profile = allocatedProgress[powerSlot] ?? {};
      const rank = allocatedRanks[powerSlot] ?? null;
      const cost = allocatedCosts[powerSlot] ?? 1;
      return toCreepDeckEntry({
        creepId,
        profile,
        rank,
        cost,
        unitMetaById,
      });
    });
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'buildAICreepDeckFromLineup')) exports.buildAICreepDeckFromLineup = buildAICreepDeckFromLineup;
};
__modules['./modes/pve/ly-thanh-thu-runtime.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat.ts');
  const dealAbilityDamage = __dep0.dealAbilityDamage;
  const healUnit = __dep0.healUnit;
  const __dep1 = __require('./combat/board-position-utils.ts');
  const isLeaderToken = __dep1.isLeaderToken;
  const __dep2 = __require('./combat/number-utils.ts');
  const readAtkWilPower = __dep2.readAtkWilPower;
  const toFiniteNumber = __dep2.toFiniteNumber;


  function performLyThanhThuUltRuntime(ctx){
    const { game, unit, extendBusy } = ctx;
    if (!game || !unit || unit.id !== 'ly_thanh_thu') return false;

    const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
    const enemyLeader = (game.tokens || []).find((token) => (
      token.alive
      && token.side === foeSide
      && isLeaderToken(token)
    )) ?? null;
    if (!enemyLeader) {
      return false;
    }

    const base = Math.max(1, Math.floor(readAtkWilPower(unit) * 2));
    const dealtResult = dealAbilityDamage(game, unit, enemyLeader, {
      base,
      dtype,
      attackType,
    });

    const overThreshold = dealtResult.dealt > Math.max(0, Math.floor(toFiniteNumber(enemyLeader.hpMax, 0) * 0.2));
    if (overThreshold) {
      const heal = Math.max(1, Math.floor(toFiniteNumber(unit.hpMax, 0) * 0.1));
      healUnit(unit, heal);
    }

    extendBusy(900);
    return true;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'performLyThanhThuUltRuntime')) exports.performLyThanhThuUltRuntime = performLyThanhThuUltRuntime;
};
__modules['./modes/pve/nguyen-le-runtime.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./combat.ts');
  const dealAbilityDamage = __dep0.dealAbilityDamage;
  const __dep1 = __require('./combat/board-position-utils.ts');
  const findAliveUnitAtSlot = __dep1.findAliveUnitAtSlot;
  const __dep2 = __require('./combat/number-utils.ts');
  const readAtkWilPower = __dep2.readAtkWilPower;


  const TARGET_PATTERN = [1, 2, 3, 5, 8] /* /* as const */ */;

  function performNguyenLeUltRuntime(ctx){
    const { game, unit, ultSkill, extendBusy } = ctx;
    if (!game || !unit || unit.id !== 'nguyen_le') return false;

    const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
    const base = Math.max(1, Math.floor(readAtkWilPower(unit) * 2));
    let hits = 0;
    for (const slot of TARGET_PATTERN) {
      const target = findAliveUnitAtSlot(game, foeSide, slot);
      if (!target) continue;
      dealAbilityDamage(game, unit, target, {
        base,
        dtype,
        attackType,
        skill,
        isAoE,
      });
      hits += 1;
    }
    if (hits <= 0) return false;

    extendBusy(1100);
    return true;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'performNguyenLeUltRuntime')) exports.performNguyenLeUltRuntime = performNguyenLeUltRuntime;
};
__modules['./modes/pve/session-deck.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./engine.ts');
  const pickRandom = __dep0.pickRandom;
  const __dep1 = __require('./engine.ts');
  const cellReserved = __dep1.cellReserved;
  const slotIndex = __dep1.slotIndex;
  const __dep2 = __require('./turns.ts');
  const predictSpawnCycle = __dep2.predictSpawnCycle;
  const __dep3 = __require('./art.ts');
  const getUnitArt = __dep3.getUnitArt;

  const EMPTY_DECK_ENTRIES= [];
  const RESOLVED_PROMISE = Promise.resolve();

  const isInitializedGame = (value){ _inited: true } => (
    !!value && typeof value === 'object' && (value /* as { _inited: unknown } */)._inited === true
  );

  const isDeckEntry = (value)=> {
    if (!value || typeof value !== 'object') return false;
    const candidate = value /* as { id: unknown } */;
    return typeof candidate.id === 'string' && candidate.id.trim() !== '';
  };

  const sanitizeDeckEntries = (
    value,
    cache, ReadonlyArray<DeckEntry>>,
  )=> {
    if (!Array.isArray(value)) return EMPTY_DECK_ENTRIES;
    const cached = cache.get(value);
    if (cached) return cached /* as DeckEntry[ */];
    let normalized= null;
    for (let index = 0; index < value.length; index += 1) {
      const entry = value[index];
      if (isDeckEntry(entry)) {
        if (normalized) normalized.push(entry);
        continue;
      }
      if (!normalized) {
        normalized = (value.slice(0, index) /* as DeckEntry[ */]);
      }
    }
    const result = normalized ?? (value /* as DeckEntry[ */]);
    cache.set(value, result);
    return result;
  };

  const createSessionDeckController = (deps)=> {
    let lockedDeckCache= null;
    let lockedDeckNormalizeCache
      gameRef: SessionState;
      sourceRef: ReadonlyArray<unknown>;
      normalized: ReadonlyArray<DeckEntry>;
    } | null = null;
    let deckFilterCache= null;
    const sanitizedDeckEntriesCache = new WeakMap<ReadonlyArray<unknown>, ReadonlyArray<DeckEntry>>();
    const refillDeckExcludeIds = new Set();
    let summonBarRenderPending = false;

    const invalidateLockedDeckCache = ()=> {
      lockedDeckCache = null;
      lockedDeckNormalizeCache = null;
      deckFilterCache = null;
    };

    const getLockedDeckIdSet = (lockedDeck)=> {
      if (lockedDeckCache?.deckRef === lockedDeck) {
        return lockedDeckCache.ids;
      }
      const ids = new Set();
      for (let i = 0; i < lockedDeck.length; i += 1) {
        const entry = lockedDeck[i];
        if (!entry?.id) continue;
        ids.add(entry.id);
      }
      lockedDeckCache = {
        deckRef: lockedDeck,
        ids,
      };
      return ids;
    };

    const ensureLockedPlayerDeck = (game= deps.getGame())=> {
      const session = isInitializedGame(game) ? game : null;
      if (!session) return EMPTY_DECK_ENTRIES;
      const lockedSource = Array.isArray(session.playerDeckLocked) && session.playerDeckLocked.length
        ? session.playerDeckLocked
        : session.unitsAll;
      if (
        lockedDeckNormalizeCache
        && lockedDeckNormalizeCache.gameRef === session
        && lockedDeckNormalizeCache.sourceRef === lockedSource
      ) {
        return lockedDeckNormalizeCache.normalized;
      }
      const lockedDeck = sanitizeDeckEntries(lockedSource, sanitizedDeckEntriesCache);
      if (lockedDeck !== session.playerDeckLocked) {
        session.playerDeckLocked = lockedDeck;
        invalidateLockedDeckCache();
      }
      lockedDeckNormalizeCache = {
        gameRef: session,
        sourceRef,
        normalized,
      };
      return lockedDeck;
    };

    const ensureDeck = (game= deps.getGame())=> {
      const session = isInitializedGame(game) ? game : null;
      if (!session) return [];
      const deck = sanitizeDeckEntries(session.deck3, sanitizedDeckEntriesCache);
      const lockedDeck = ensureLockedPlayerDeck(session);
      if (
        deckFilterCache
        && deckFilterCache.gameRef === session
        && deckFilterCache.deckRef === deck
        && deckFilterCache.lockedDeckRef === lockedDeck
      ) {
        return deckFilterCache.result /* as DeckEntry[ */];
      }
      const lockedIds = getLockedDeckIdSet(lockedDeck);
      let filteredDeck= null;
      for (let i = 0; i < deck.length; i += 1) {
        const entry = deck[i];
        if (!entry || !lockedIds.has(entry.id)) {
          if (!filteredDeck) filteredDeck = deck.slice(0, i) /* as DeckEntry[ */];
          continue;
        }
        if (filteredDeck) filteredDeck.push(entry);
      }
      const result = filteredDeck ?? deck;
      if (filteredDeck || deck !== session.deck3) {
        session.deck3 = result;
      }
      deckFilterCache = {
        gameRef: session,
        deckRef,
        lockedDeckRef,
        result,
      };
      return result;
    };

    const isCardInLockedDeck = (cardId, game= deps.getGame())=> {
      if (!isInitializedGame(game)) return false;
      const lockedDeck = ensureLockedPlayerDeck(game);
      return getLockedDeckIdSet(lockedDeck).has(cardId);
    };

    const findDeckEntryIndexById = (
      deck,
      id,
    )=> {
      if (!id) return -1;
      for (let i = 0; i < deck.length; i += 1) {
        if (deck[i]?.id === id) return i;
      }
      return -1;
    };

    const removeDeckEntryAtIndex = (
      deck,
      removeIndex,
    )=> {
      if (removeIndex < 0 || removeIndex >= deck.length) return deck /* as DeckEntry[ */];
      const mutableDeck = deck /* as DeckEntry[ */];
      mutableDeck.splice(removeIndex, 1);
      return mutableDeck;
    };

    const getCardCost = (card)=> {
      if (!card) return 0;
      const parsed = Number(card.cost);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const queueSummonFromDeckSelection = ({
      game,
      card,
      cell,
    }{
      game: SessionState;
      card: DeckEntry;
      cell: { cx: number; cy: number };
    })=> {
      if (cellReserved(deps.getAliveTokens(), game.queued, cell.cx, cell.cy)) return false;
      const cardCost = getCardCost(card);
      if (game.cost < cardCost) return false;
      if (game.summoned >= game.summonLimit) return false;

      const slot = slotIndex('ally', cell.cx, cell.cy);
      if (game.queued.ally.has(slot)) return false;

      const spawnCycle = predictSpawnCycle(game, 'ally', slot);
      const pendingArt = getUnitArt(card.id);
      const pending
        art: ReturnType<typeof getUnitArt> | null;
        skinKey: string | null;
      } = {
        unitId: card.id,
        name=== 'string' ? card.name : null,
        side,
        cx,
        cy,
        slot,
        spawnCycle,
        source,
        color,
        art,
        skinKey,
      };
      game.queued.ally.set(slot, pending);

      game.cost = Math.max(0, game.cost - cardCost);
      game.summoned += 1;
      game.usedUnitIds.add(card.id);
      deps.onQueuedSummon(game);
      return true;
    };

    const selectFirstAffordable = ()=> {
      const game = deps.getGame();
      if (!game) return;

      const deck = ensureDeck(game);
      if (!deck.length){
        game.selectedId = null;
        return;
      }

      let cheapestAffordable= null;
      let cheapestAffordableCost = Infinity;
      let cheapestOverall= null;
      let cheapestOverallCost = Infinity;

      for (let index = 0; index < deck.length; index += 1){
        const card = deck[index];
        if (!card) continue;

        const cardCost = getCardCost(card);

        if (cardCost < cheapestOverallCost){
          cheapestOverall = card;
          cheapestOverallCost = cardCost;
        }

        const affordable = cardCost <= game.cost;
        if (affordable && cardCost < cheapestAffordableCost){
          cheapestAffordable = card;
          cheapestAffordableCost = cardCost;
        }
      }

      const chosen = (cheapestAffordable || cheapestOverall) ?? null;
      game.selectedId = chosen ? chosen.id : null;
    };

    const refillDeck = ()=> {
      const game = deps.getGame();
      if (!game) return;

      const deck = ensureDeck(game);
      const need = deps.handSize - deck.length;
      if (need <= 0) return;

      const exclude = refillDeckExcludeIds;
      exclude.clear();
      for (const id of game.usedUnitIds) {
        exclude.add(id);
      }
      for (let i = 0; i < deck.length; i += 1) {
        const entry = deck[i];
        if (!entry?.id) continue;
        exclude.add(entry.id);
      }
      const lockedDeck = ensureLockedPlayerDeck(game);
      const more = pickRandom(lockedDeck, exclude, need);
      deck.push(...more);
      game.deck3 = deck;
    };

    const flushSummonBarRender = ()=> {
      summonBarRenderPending = false;
      const game = deps.getGame();
      const bar= game?.ui?.bar;
      if (bar?.render) bar.render();
    };

    const renderSummonBar = ()=> {
      if (summonBarRenderPending) return;
      summonBarRenderPending = true;
      if (typeof queueMicrotask === 'function'){
        queueMicrotask(flushSummonBarRender);
        return;
      }
      RESOLVED_PROMISE.then(flushSummonBarRender);
    };

    const handleSummonBarPick = (card)=> {
      const game = deps.getGame();
      if (!game || !isDeckEntry(card)) return;
      const entry = card;
      if (!isCardInLockedDeck(entry.id, game)) return;
      game.selectedId = entry.id;
      renderSummonBar();
    };

    const canAffordCard = (card)=> {
      const game = deps.getGame();
      if (!game || !isDeckEntry(card)) return false;
      const entry = card;
      if (deps.isUniqueGlobalSummonBlocked(game, entry)) return false;
      return game.cost >= getCardCost(entry);
    };

    const getDeckForSummonBar = ()=> {
      const game = deps.getGame();
      if (!game) return [];
      return ensureDeck(game);
    };

    const handleCanvasSummonCellClick = (cell)=> {
      const game = deps.getGame();
      if (!game) return false;
      const deck = ensureDeck(game);
      const selectedIndex = findDeckEntryIndexById(deck, game.selectedId);
      if (selectedIndex < 0) return false;
      const card = deck[selectedIndex];
      if (!card || !isCardInLockedDeck(card.id, game)) return false;
      if (deps.isUniqueGlobalSummonBlocked(game, card)) return false;
      if (!queueSummonFromDeckSelection({ game, card, cell })) return false;

      game.deck3 = removeDeckEntryAtIndex(deck, selectedIndex);
      game.selectedId = null;
      refillDeck();
      selectFirstAffordable();
      renderSummonBar();
      return true;
    };

    return {
      ensureDeck,
      ensureLockedPlayerDeck,
      isCardInLockedDeck,
      findDeckEntryIndexById,
      removeDeckEntryAtIndex,
      getCardCost,
      refillDeck,
      selectFirstAffordable,
      flushSummonBarRender,
      renderSummonBar,
      handleSummonBarPick,
      canAffordCard,
      getDeckForSummonBar,
      handleCanvasSummonCellClick,
    };
  };

  exports.isDeckEntry = isDeckEntry;

  if (!Object.prototype.hasOwnProperty.call(exports, 'createSessionDeckController')) exports.createSessionDeckController = createSessionDeckController;
};
__modules['./modes/pve/session-events.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./engine.ts');
  const ART_SPRITE_EVENT = __dep0.ART_SPRITE_EVENT;

  const createSessionEventBindings = (
    deps,
  )=> {
    let artSpriteHandler=> void) | null = null;
    let visibilityHandlerBound = false;

    const handleVisibilityChange = ()=> {
      const doc = deps.getDocRef();
      if (!doc) return;
      deps.setDrawPaused(!!doc.hidden);
    };

    const bindVisibility = ()=> {
      if (visibilityHandlerBound) return;
      const doc = deps.getDocRef();
      if (!doc || typeof doc.addEventListener !== 'function') return;
      doc.addEventListener('visibilitychange', handleVisibilityChange);
      visibilityHandlerBound = true;
    };

    const unbindVisibility = ()=> {
      if (!visibilityHandlerBound) return;
      const doc = deps.getDocRef();
      if (doc && typeof doc.removeEventListener === 'function') {
        doc.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      visibilityHandlerBound = false;
    };

    const bindArtSpriteListener = ()=> {
      const winRef = deps.getWinRef();
      if (!winRef || typeof winRef.addEventListener !== 'function') return;
      if (artSpriteHandler) return;
      artSpriteHandler = () => {
        deps.invalidateSceneCache();
        deps.scheduleDraw();
      };
      winRef.addEventListener(ART_SPRITE_EVENT, artSpriteHandler);
    };

    const unbindArtSpriteListener = ()=> {
      const winRef = deps.getWinRef();
      if (!winRef || !artSpriteHandler || typeof winRef.removeEventListener !== 'function') return;
      winRef.removeEventListener(ART_SPRITE_EVENT, artSpriteHandler);
      artSpriteHandler = null;
    };

    const clearSessionListeners = ()=> {
      const canvas = deps.getCanvas();
      const canvasClickHandler = deps.getCanvasClickHandler();
      if (canvas && canvasClickHandler && typeof canvas.removeEventListener === 'function') {
        canvas.removeEventListener('click', canvasClickHandler);
      }
      const canvasMouseMoveHandler = deps.getCanvasMouseMoveHandler();
      if (canvas && canvasMouseMoveHandler && typeof canvas.removeEventListener === 'function') {
        canvas.removeEventListener('mousemove', canvasMouseMoveHandler);
      }
      deps.setCanvasClickHandler(null);
      deps.setCanvasMouseMoveHandler(null);
      const hudCleanup = deps.getHudCleanup();
      if (typeof hudCleanup === 'function') {
        hudCleanup();
      }
      deps.setHudCleanup(null);
      const winRef = deps.getWinRef();
      const resizeHandler = deps.getResizeHandler();
      if (resizeHandler && winRef && typeof winRef.removeEventListener === 'function') {
        winRef.removeEventListener('resize', resizeHandler);
      }
      deps.setResizeHandler(null);
      const viewport = winRef?.visualViewport;
      if (viewport && typeof viewport.removeEventListener === 'function') {
        const visualViewportResizeHandler = deps.getVisualViewportResizeHandler();
        const visualViewportScrollHandler = deps.getVisualViewportScrollHandler();
        if (visualViewportResizeHandler) {
          viewport.removeEventListener('resize', visualViewportResizeHandler);
        }
        if (visualViewportScrollHandler) {
          viewport.removeEventListener('scroll', visualViewportScrollHandler);
        }
      }
      deps.setVisualViewportResizeHandler(null);
      deps.setVisualViewportScrollHandler(null);
      deps.setViewportResizeDebugState(null);
      deps.cancelScheduledResize();
      unbindArtSpriteListener();
      unbindVisibility();
    };

    const clearSessionTimers = ()=> {
      deps.stopSessionLoop();
      deps.cancelScheduledDraw();
      deps.cancelScheduledResize();
    };

    const bindRuntimeListeners = ()=> {
      const canvas = deps.getCanvas();
      const existingCanvasClickHandler = deps.getCanvasClickHandler();
      if (existingCanvasClickHandler && canvas && typeof canvas.removeEventListener === 'function') {
        canvas.removeEventListener('click', existingCanvasClickHandler);
      }
      const existingCanvasMouseMoveHandler = deps.getCanvasMouseMoveHandler();
      if (existingCanvasMouseMoveHandler && canvas && typeof canvas.removeEventListener === 'function') {
        canvas.removeEventListener('mousemove', existingCanvasMouseMoveHandler);
      }
      const canvasClickHandler= (event)=> {
        deps.onCanvasClick(event);
      };
      const canvasMouseMoveHandler = (event)=> {
        deps.onCanvasMouseMove(event);
      };
      deps.setCanvasClickHandler(canvasClickHandler);
      deps.setCanvasMouseMoveHandler(canvasMouseMoveHandler);
      if (canvas && typeof canvas.addEventListener === 'function') {
        canvas.addEventListener('click', canvasClickHandler);
        canvas.addEventListener('mousemove', canvasMouseMoveHandler);
      }

      const winRef = deps.getWinRef();
      const existingResizeHandler = deps.getResizeHandler();
      if (existingResizeHandler && winRef && typeof winRef.removeEventListener === 'function') {
        winRef.removeEventListener('resize', existingResizeHandler);
      }
      const resizeHandler = ()=> {
        deps.onWindowResize();
      };
      deps.setResizeHandler(resizeHandler);
      if (winRef && typeof winRef.addEventListener === 'function') {
        winRef.addEventListener('resize', resizeHandler);
      }

      const viewport = winRef?.visualViewport ?? null;
      const existingViewportResizeHandler = deps.getVisualViewportResizeHandler();
      const existingViewportScrollHandler = deps.getVisualViewportScrollHandler();
      if (viewport && typeof viewport.addEventListener === 'function') {
        if (existingViewportResizeHandler && typeof viewport.removeEventListener === 'function') {
          viewport.removeEventListener('resize', existingViewportResizeHandler);
        }
        if (existingViewportScrollHandler && typeof viewport.removeEventListener === 'function') {
          viewport.removeEventListener('scroll', existingViewportScrollHandler);
        }
        const visualViewportResizeHandler = ()=> {
          deps.onViewportResize();
        };
        const visualViewportScrollHandler = ()=> {
          deps.onViewportScroll();
        };
        deps.setVisualViewportResizeHandler(visualViewportResizeHandler);
        deps.setVisualViewportScrollHandler(visualViewportScrollHandler);
        viewport.addEventListener('resize', visualViewportResizeHandler);
        viewport.addEventListener('scroll', visualViewportScrollHandler);
      }
    };

    const bindSession = ()=> {
      bindArtSpriteListener();
      bindVisibility();
      const doc = deps.getDocRef();
      deps.setDrawPaused(doc ? !!doc.hidden : false);
    };

    const resetDomRefs = ()=> {
      deps.setCanvas(null);
      deps.setContext(null);
      deps.setHud(null);
      deps.setHudCleanup(null);
      deps.setLeaderUltControlsHidden(true);
      deps.clearLeaderUltButtons();
      deps.setLeaderUltControlsEl(null);
      deps.setLeaderUltControlsFingerprint(null);
      deps.setTimerElement(null);
      deps.setStatusIconHoverTooltip('');
      deps.clearStatusIconHitboxes();
      deps.clearHpBarGradientCache();
      deps.invalidateSceneCache();
    };

    const queryElementFromRoot = (selector)=> {
      const root = deps.getRootElement() ?? null;
      if (root && typeof (root /* as ParentNode */).querySelector === 'function') {
        const el = (root /* as ParentNode */).querySelector(selector);
        if (el) return el;
      }
      return null;
    };

    const resolveTimerElement = ()=> {
      const doc = deps.getDocRef() ?? (typeof document !== 'undefined' ? document : null);
      if (!doc){
        deps.setTimerElement(null);
        return;
      }
      deps.setTimerElement((queryElementFromRoot('#timer') || doc.getElementById('timer')) /* as HTMLElement | null */);
    };

    const isDocumentNode = (value)=> {
      const documentNodeType = typeof Node !== 'undefined' ? Node.DOCUMENT_NODE : 9;
      return value.nodeType === documentNodeType;
    };

    const configureRoot = (root)=> {
      const nextRoot = root || null;
      let nextDocRef= null;
      if (nextRoot && nextRoot.ownerDocument){
        nextDocRef = nextRoot.ownerDocument;
      } else if (nextRoot && isDocumentNode(nextRoot)) {
        nextDocRef = nextRoot;
      } else {
        nextDocRef = typeof document !== 'undefined' ? document : null;
      }
      deps.setDocRef(nextDocRef);
      deps.setWinRef(nextDocRef?.defaultView ?? (typeof window !== 'undefined' ? window : null));
      deps.refreshAnimationFrameFns();
      resolveTimerElement();
    };

    const stopSession = ()=> {
      clearSessionTimers();
      clearSessionListeners();
      deps.cleanupSummonBar();
      deps.destroyAetherPool();
      deps.cleanupGameState();
      resetDomRefs();
      deps.clearAfterStop();
    };

    const startSession = (config?)=> {
      const nextConfig = (typeof config === 'undefined' ? {} ;
      configureRoot(deps.getRootElement());
      resolveTimerElement();
      const normalizedConfig = deps.normalizeStartConfig(nextConfig);
      if (deps.isRunning()) stopSession();
      deps.resetSessionState(normalizedConfig);
      deps.setRunning(true);
      try {
        const initialized = deps.initSession();
        if (!initialized) {
          stopSession();
          return null;
        }
        if (!deps.isSessionInitialized()) {
          throw new Error('Unable to initialise PvE session');
        }
        bindSession();
        bindRuntimeListeners();
        return deps.getSession();
      } catch (err) {
        deps.setRunning(false);
        stopSession();
        throw err;
      }
    };

    return {
      bindArtSpriteListener,
      unbindArtSpriteListener,
      bindVisibility,
      unbindVisibility,
      clearSessionListeners,
      clearSessionTimers,
      bindSession,
      bindRuntimeListeners,
      resetDomRefs,
      configureRoot,
      resolveTimerElement,
      stopSession,
      startSession,
    };
  };

  if (!Object.prototype.hasOwnProperty.call(exports, 'createSessionEventBindings')) exports.createSessionEventBindings = createSessionEventBindings;
};
__modules['./modes/pve/session-loop.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./ai.ts');
  const aiMaybeAct = __dep0.aiMaybeAct;
  const __dep1 = __require('./turns.ts');
  const stepTurn = __dep1.stepTurn;
  const __dep2 = __require('./utils/time.ts');
  const normalizeAnimationFrameTimestamp = __dep2.normalizeAnimationFrameTimestamp;
  const safeNow = __dep2.safeNow;
  const sessionNow = __dep2.sessionNow;

  const RAF_TIMESTAMP_MAX = 2_147_483_647;
  const CLOCK_DRIFT_TOLERANCE_MS = 120_000;
  const LOGIC_MIN_INTERVAL_MS = 40;
  const MAX_TURNS_PER_TICK = 6;

  const resolveClockTurnIntervalMs = (clock, resolveTurnIntervalMs) => number)=> {
    const current = clock.turnEveryMs;
    if (Number.isFinite(current) && current > 0) return current;
    const fallback = resolveTurnIntervalMs();
    clock.turnEveryMs = fallback;
    return fallback;
  };

  const createClock = (resolveTurnIntervalMs) => number)=> {
    const safe = safeNow();
    const now = sessionNow();
    const turnEveryMs = resolveTurnIntervalMs();
    return {
      startMs: now,
      startSafeMs,
      lastTimerRemain,
      lastCostCreditedSec,
      turnEveryMs,
      lastTurnStepMs,
      lastFrameMs,
      lastLogicMs,
      costAccumulator,
      lastTimerText,
    };
  };

  function createSessionLoopController(deps){
    let clock= null;
    let tickLoopHandle= null;
    let tickLoopUsesTimeout = false;

    const stopLoop = ()=> {
      if (tickLoopHandle === null) return;
      if (tickLoopUsesTimeout) {
        clearTimeout(tickLoopHandle);
      } else {
        const cancel = deps.getCancelAnimationFrame();
        if (cancel && Number.isFinite(Number(tickLoopHandle))) cancel(Number(tickLoopHandle));
      }
      tickLoopHandle = null;
      tickLoopUsesTimeout = false;
    };

    const updateTimerAndCost = (timestamp?)=> {
      if (!clock) return;
      const game = deps.getGame();
      if (!game) return;
      if (deps.isBattleOver(game)) return;

      const turnEveryMs = resolveClockTurnIntervalMs(clock, deps.resolveTurnIntervalMs);
      const safeNowMs = safeNow();
      const sessionNowMsRaw = sessionNow();
      let forcedElapsedSec= null;
      const safeDelta = safeNowMs - clock.startSafeMs;
      const previousStartMs = Number.isFinite(clock.startMs) ? clock.startMs : null;
      const sessionWentBack = previousStartMs !== null
        && Number.isFinite(sessionNowMsRaw)
        && sessionNowMsRaw < previousStartMs;
      if (safeDelta < -CLOCK_DRIFT_TOLERANCE_MS || sessionWentBack) {
        const previousElapsedSec = Number.isFinite(clock.lastCostCreditedSec)
          ? Math.max(0, clock.lastCostCreditedSec)
          ;
        const previousRemain = Number.isFinite(clock.lastTimerRemain)
          ? Math.max(0, clock.lastTimerRemain)
          ;
        const previousTurnStep = Number.isFinite(clock.lastTurnStepMs)
          ? clock.lastTurnStepMs
          : null;

        const previousElapsedMs = Math.max(0, previousElapsedSec) * 1000;
        let sessionForRebase = sessionNowMsRaw;
        if (!Number.isFinite(sessionForRebase)) {
          sessionForRebase = previousStartMs !== null
            ? previousStartMs + previousElapsedMs
            : safeNowMs;
        }

        let normalizedStart = Number.isFinite(sessionForRebase)
          ? sessionForRebase - previousElapsedMs
          : sessionForRebase;
        if (!Number.isFinite(normalizedStart)) normalizedStart = sessionForRebase;
        clock.startMs = Number.isFinite(normalizedStart) ? normalizedStart : sessionForRebase;
        if (!Number.isFinite(clock.startMs)) clock.startMs = sessionForRebase;
        clock.startSafeMs = safeNowMs;

        forcedElapsedSec = previousElapsedSec;
        clock.lastCostCreditedSec = previousElapsedSec;
        clock.lastTimerRemain = previousRemain;

        const minTurnStep = Number.isFinite(sessionForRebase)
          ? sessionForRebase - turnEveryMs
          : previousTurnStep ?? clock.startMs - turnEveryMs;
        const maxTurnStep = Number.isFinite(sessionForRebase)
          ? sessionForRebase
          : clock.startMs;
        let normalizedTurnStep = previousTurnStep ?? minTurnStep;
        if (!Number.isFinite(normalizedTurnStep)) normalizedTurnStep = minTurnStep;
        if (Number.isFinite(minTurnStep) && normalizedTurnStep < minTurnStep) normalizedTurnStep = minTurnStep;
        if (Number.isFinite(maxTurnStep) && normalizedTurnStep > maxTurnStep) normalizedTurnStep = maxTurnStep;
        clock.lastTurnStepMs = normalizedTurnStep;

        const rebaseFrame = Number.isFinite(sessionForRebase) ? sessionForRebase : clock.startMs;
        clock.lastFrameMs = Number.isFinite(rebaseFrame) ? rebaseFrame : clock.startMs;
        clock.lastLogicMs = Number.isFinite(rebaseFrame)
          ? rebaseFrame - LOGIC_MIN_INTERVAL_MS
          : clock.startMs - LOGIC_MIN_INTERVAL_MS;
        clock.costAccumulator = 0;
        clock.lastTimerText = null;
      }

      const expectedSessionMs = safeNowMs - clock.startSafeMs + clock.startMs;
      let sessionNowMs = sessionNowMsRaw;
      const needRebase = !Number.isFinite(sessionNowMs)
        || Math.abs(sessionNowMs - expectedSessionMs) > CLOCK_DRIFT_TOLERANCE_MS;
      if (needRebase) sessionNowMs = expectedSessionMs;
      if (typeof timestamp === 'number' && Number.isFinite(timestamp)) {
        const rafTs = timestamp;
        if (deps.supportsPerfNow || (rafTs >= 0 && rafTs <= RAF_TIMESTAMP_MAX)) {
          sessionNowMs = normalizeAnimationFrameTimestamp(rafTs);
        }
        if (needRebase) {
          const adjusted = expectedSessionMs;
          if (!Number.isFinite(sessionNowMs) || Math.abs(sessionNowMs - adjusted) > CLOCK_DRIFT_TOLERANCE_MS) {
            sessionNowMs = adjusted;
          }
        }
      }

      if (!Number.isFinite(clock.lastFrameMs)) {
        clock.lastFrameMs = Number.isFinite(clock.startMs) ? clock.startMs : expectedSessionMs;
      }

      const lastFrameMs = Number.isFinite(clock.lastFrameMs) ? clock.lastFrameMs : expectedSessionMs;
      if (!Number.isFinite(sessionNowMs)) sessionNowMs = expectedSessionMs;
      if (sessionNowMs <= lastFrameMs) sessionNowMs = Math.max(expectedSessionMs, lastFrameMs + 1);
      clock.lastFrameMs = Number.isFinite(sessionNowMs) ? sessionNowMs : expectedSessionMs;

      if (!Number.isFinite(clock.lastLogicMs)) clock.lastLogicMs = sessionNowMs - LOGIC_MIN_INTERVAL_MS;
      const logicSinceMs = sessionNowMs - clock.lastLogicMs;
      if (Number.isFinite(logicSinceMs) && logicSinceMs < LOGIC_MIN_INTERVAL_MS) return;

      const startMs = Number.isFinite(clock.startMs) ? clock.startMs : clock.lastFrameMs;
      let elapsedMsPrecise = Number.isFinite(startMs) ? sessionNowMs - startMs : 0;
      if (!Number.isFinite(elapsedMsPrecise)) elapsedMsPrecise = (forcedElapsedSec ?? 0) * 1000;
      if (elapsedMsPrecise < 0) elapsedMsPrecise = 0;
      let elapsedSecPrecise = elapsedMsPrecise / 1000;
      if (forcedElapsedSec !== null && elapsedSecPrecise < forcedElapsedSec) {
        elapsedSecPrecise = forcedElapsedSec;
        elapsedMsPrecise = elapsedSecPrecise * 1000;
      }

      const prevRemainDisplay = Number.isFinite(clock.lastTimerRemain)
        ? clock.lastTimerRemain
        : Math.max(0, 240 - Math.floor(elapsedSecPrecise));
      const remainSecPrecise = Math.max(0, 240 - elapsedSecPrecise);
      const remainDisplay = Math.max(0, Math.floor(remainSecPrecise));
      if (remainDisplay !== prevRemainDisplay || clock.lastTimerText === null) {
        const mm = String(Math.floor(remainDisplay / 60)).padStart(2, '0');
        const ss = String(remainDisplay % 60).padStart(2, '0');
        const nextTimerText = `${mm}{ss}`;
        let tEl = deps.getTimerElement();
        if (!tEl || !tEl.isConnected) {
          deps.resolveTimerElement();
          tEl = deps.getTimerElement();
        }
        if (tEl) tEl.textContent = nextTimerText;
        clock.lastTimerText = nextTimerText;
      }
      clock.lastTimerRemain = remainDisplay;

      if (remainSecPrecise <= 0 && prevRemainDisplay > 0) {
        const timeoutResult = deps.runBattleEndCheck('timeout', sessionNowMs, remainDisplay);
        if (timeoutResult) return;
      }

      const lastCredited = Number.isFinite(clock.lastCostCreditedSec) ? clock.lastCostCreditedSec : 0;
      let deltaSec = elapsedSecPrecise - lastCredited;
      if (!Number.isFinite(deltaSec) || deltaSec < 0) deltaSec = 0;
      const accumulatorBase = Number.isFinite(clock.costAccumulator) ? clock.costAccumulator : 0;
      let nextAccumulator = accumulatorBase + deltaSec;
      let costGranted = 0;
      if (nextAccumulator >= 1) {
        costGranted = Math.floor(nextAccumulator);
        nextAccumulator -= costGranted;
      }
      if (!Number.isFinite(nextAccumulator) || nextAccumulator < 0) nextAccumulator = 0;
      clock.costAccumulator = nextAccumulator;
      clock.lastCostCreditedSec = Math.max(lastCredited, elapsedSecPrecise);

      let costChanged = false;
      if (costGranted > 0) {
        costChanged = deps.applyCostGain(game, costGranted) || costChanged;
        costChanged = deps.applyCostGain(game.ai, costGranted) || costChanged;
      }

      if (costChanged) {
        deps.onHudUpdate(game);
        if (!game.selectedId) deps.onDeckReevaluate();
        deps.onRenderSummonBar();
        aiMaybeAct(game, 'cost');
      }
      deps.onSyncLeaderUltControls();

      clock.lastLogicMs = sessionNowMs;

      if (deps.isBattleOver(game)) return;
      if (deps.runBattleEndCheck('leader-immediate', sessionNowMs)) return;

      let turnState = game.turn ?? null;
      let busyUntil = deps.normalizeTurnBusyUntil(turnState);

      const stallDeltaEpsilon = 1;
      const initialTurnBaseline = Number.isFinite(clock.startMs)
        ? clock.startMs - turnEveryMs
        : sessionNowMs - turnEveryMs;
      if (!Number.isFinite(clock.lastTurnStepMs)) {
        clock.lastTurnStepMs = initialTurnBaseline;
      } else if (clock.lastTurnStepMs > sessionNowMs) {
        clock.lastTurnStepMs = sessionNowMs - turnEveryMs;
      }

      let readyByBusy = sessionNowMs >= busyUntil;
      let elapsedForTurn = sessionNowMs - clock.lastTurnStepMs;

      if (readyByBusy && (!Number.isFinite(elapsedForTurn) || elapsedForTurn < -stallDeltaEpsilon)) {
        clock.lastTurnStepMs = sessionNowMs - turnEveryMs;
        elapsedForTurn = turnEveryMs;
      }

      if (readyByBusy && elapsedForTurn >= turnEveryMs) {
        let turnsProcessed = 0;
        let hasBoardMutation = false;
        while (readyByBusy && elapsedForTurn >= turnEveryMs && turnsProcessed < MAX_TURNS_PER_TICK) {
          clock.lastTurnStepMs += turnEveryMs;
          elapsedForTurn -= turnEveryMs;
          turnsProcessed += 1;
          stepTurn(game, deps.stepTurnContext);
          if (deps.runBattleEndCheck('leader-immediate', sessionNowMs)) return;
          deps.processCreepDeathHealing(sessionNowMs);
          deps.cleanupDead(sessionNowMs);
          hasBoardMutation = true;
          if (deps.runBattleEndCheck('post-turn', sessionNowMs)) return;
          aiMaybeAct(game, 'board');
          if (deps.isBattleOver(game)) return;
          turnState = game.turn ?? null;
          busyUntil = deps.normalizeTurnBusyUntil(turnState);
          readyByBusy = sessionNowMs >= busyUntil;
        }
        if (hasBoardMutation) deps.onBoardMutation();
      }
    };

    const scheduleTickLoop = ()=> {
      if (!deps.isRunning() || !clock) return;
      if (tickLoopHandle !== null) return;
      const raf = deps.getRequestAnimationFrame();
      if (raf) {
        tickLoopUsesTimeout = false;
        tickLoopHandle = raf(runTickLoop);
        return;
      }
      tickLoopUsesTimeout = true;
      const turnMs = Number.isFinite(clock.turnEveryMs) && clock.turnEveryMs > 0
        ? clock.turnEveryMs
        : LOGIC_MIN_INTERVAL_MS;
      const turnSlice = Math.max(1, Math.floor(turnMs / 4));
      const timeoutDelay = Math.max(8, Math.min(LOGIC_MIN_INTERVAL_MS, turnSlice || LOGIC_MIN_INTERVAL_MS));
      tickLoopHandle = setTimeout(runTickLoop, timeoutDelay);
    };

    const runTickLoop = (timestamp?)=> {
      tickLoopHandle = null;
      try {
        updateTimerAndCost(timestamp);
      } catch (err) {
        deps.logError('[pve] tick loop error', err);
        const game = deps.getGame();
        if (game) {
          try {
            deps.onHudUpdate(game);
          } catch (hudErr) {
            deps.logError('[pve] HUD update fallback sau lỗi tick thất bại', hudErr);
          }
        }
      }
      if (!deps.isRunning() || !clock) return;
      scheduleTickLoop();
    };

    const startLoop = ()=> {
      stopLoop();
      clock = createClock(deps.resolveTurnIntervalMs);
      updateTimerAndCost();
      scheduleTickLoop();
    };

    return {
      startLoop,
      stopLoop,
      tick,
    };
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'createSessionLoopController')) exports.createSessionLoopController = createSessionLoopController;
};
__modules['./modes/pve/session-render.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./modes/pve/session-state.ts');
  const parseFiniteNumber = __dep0.parseFiniteNumber;


    height: number;
    scale: number;
    offsetTop: number;
    offsetLeft: number;
  };

  const toAnimationFrameHandle = (handle)=> (
    typeof handle === 'number' ? handle : null
  );

  const createBrowserFrameFns = (
    deps,
  )=> {
    let cachedRafWindowRef= null;
    let cachedRafFn= null;
    let cachedCancelRafFn= null;

    const refreshAnimationFrameFns = ()=> {
      const win = deps.getWindowRef();
      if (win === cachedRafWindowRef) return;
      cachedRafWindowRef = win;
      if (win && typeof win.requestAnimationFrame === 'function'){
        cachedRafFn = win.requestAnimationFrame.bind(win);
      } else {
        cachedRafFn = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : null;
      }
      if (win && typeof win.cancelAnimationFrame === 'function'){
        cachedCancelRafFn = win.cancelAnimationFrame.bind(win);
      } else {
        cachedCancelRafFn = typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : null;
      }
    };

    return {
      refreshAnimationFrameFns,
      getRequestAnimationFrame)=> {
        refreshAnimationFrameFns();
        return cachedRafFn;
      },
      getCancelAnimationFrame)=> {
        refreshAnimationFrameFns();
        return cachedCancelRafFn;
      },
    };
  };

  const ATTACK_EVENT_TYPES = new Set(['melee', 'tracer', 'lightning_arc', 'blood_pulse', 'ground_burst']);

  const createMeleeActivityTracker = (
    getNow) => number,
  )=> {
    const meleeOffsetTokenKeys = new Set();
    const makeMeleeTokenKey = (token)=> {
      const iid = parseFiniteNumber(token?.iid);
      if (iid !== null){
        return `iid:${iid}`;
      }
      return typeof token?.id === 'string' && token.id.length > 0
        ? `id:${token.id}`
        : null;
    };

    return {
      makeMeleeTokenKey,
      syncMeleeOffsetTokens)=> {
        meleeOffsetTokenKeys.clear();
        if (!offsets || typeof offsets.keys !== 'function') return;
        for (const key of offsets.keys()){
          meleeOffsetTokenKeys.add(key);
        }
      },
      clearMeleeOffsetTokens)=> {
        meleeOffsetTokenKeys.clear();
      },
      collectActiveAttackTokenKeys)=> {
        const active = new Set();
        for (const key of meleeOffsetTokenKeys){
          active.add(key);
        }
        if (!Array.isArray(events) || !events.length) return active;
        const nowMs = getNow();
        for (const event of events){
          if (!event || typeof event !== 'object') continue;
          const type = typeof event.type === 'string' ? event.type : '';
          if (!ATTACK_EVENT_TYPES.has(type)) continue;
          const dur = parseFiniteNumber(event.dur) ?? 0;
          if (dur <= 0) continue;
          const t0 = parseFiniteNumber(event.t0) ?? 0;
          const tt = (nowMs - t0) / dur;
          if (!(tt > 0 && tt < 1)) continue;
          const refA = (event.refA /* as AttackTokenLike */) ?? null;
          const key = makeMeleeTokenKey({
            iid: refA?.iid ?? parseFiniteNumber(event.iidA) ?? undefined,
            id=== 'string' ? event.idA : undefined),
          });
          if (key) active.add(key);
        }
        return active;
      },
    };
  };

  const createSessionRenderController = (
    deps,
  )=> {
    let drawFrameHandle= null;
    let drawFrameUsesTimeout = false;
    let drawPending = false;
    let drawPaused = false;

    let resizeSchedulerHandle= null;
    let resizeSchedulerUsesTimeout = false;
    let pendingResize = false;

    const cancelScheduledDraw = ()=> {
      if (drawFrameHandle !== null){
        if (drawFrameUsesTimeout){
          clearTimeout(drawFrameHandle);
        } else {
          const cancel = deps.getCancelAnimationFrame();
          const frameHandle = toAnimationFrameHandle(drawFrameHandle);
          if (typeof cancel === 'function' && frameHandle !== null){
            cancel(frameHandle);
          }
        }
        drawFrameHandle = null;
        drawFrameUsesTimeout = false;
      }
      drawPending = false;
    };

    const scheduleDraw = ()=> {
      if (drawPaused) return;
      if (drawPending) return;
      if (!deps.getCanvas() || !deps.getContext()) return;
      drawPending = true;
      const raf = deps.getRequestAnimationFrame();
      const runDrawFrame = ()=> {
        drawFrameHandle = null;
        drawFrameUsesTimeout = false;
        drawPending = false;
        if (drawPaused) return;
        try {
          deps.drawNow();
        } catch (err) {
          deps.onDrawError(err);
        }
        if (deps.shouldKeepDrawing()) scheduleDraw();
      };
      if (raf){
        drawFrameUsesTimeout = false;
        drawFrameHandle = raf(runDrawFrame);
      } else {
        drawFrameUsesTimeout = true;
        drawFrameHandle = setTimeout(runDrawFrame, 16);
      }
    };

    const cancelScheduledResize = ()=> {
      if (resizeSchedulerHandle !== null){
        if (resizeSchedulerUsesTimeout){
          clearTimeout(resizeSchedulerHandle);
        } else {
          const cancel = deps.getCancelAnimationFrame();
          const frameHandle = toAnimationFrameHandle(resizeSchedulerHandle);
          if (typeof cancel === 'function' && frameHandle !== null){
            cancel(frameHandle);
          }
        }
        resizeSchedulerHandle = null;
        resizeSchedulerUsesTimeout = false;
      }
      pendingResize = false;
    };

    const flushScheduledResize = ()=> {
      resizeSchedulerHandle = null;
      resizeSchedulerUsesTimeout = false;
      pendingResize = false;
      try {
        deps.onResize();
        scheduleDraw();
      } catch (err) {
        deps.onResizeError(err);
      }
    };

    const scheduleResize = ()=> {
      if (pendingResize) return;
      pendingResize = true;
      const raf = deps.getRequestAnimationFrame();
      if (raf){
        resizeSchedulerUsesTimeout = false;
        resizeSchedulerHandle = raf(flushScheduledResize);
      } else {
        resizeSchedulerUsesTimeout = true;
        resizeSchedulerHandle = setTimeout(flushScheduledResize, 32);
      }
    };

    const scheduleViewportResizeIfChanged = (reason)=> {
      const viewport = deps.getWindowRef()?.visualViewport;
      if (!viewport) {
        scheduleResize();
        return;
      }
      const nextState = {
        width: Number.isFinite(viewport.width) ? viewport.width : 0,
        height) ? viewport.height : 0,
        scale) ? viewport.scale : 1,
        offsetTop) ? viewport.offsetTop : 0,
        offsetLeft) ? viewport.offsetLeft : 0,
      };

      const prev = deps.getViewportResizeDebugState();
      deps.setViewportResizeDebugState(nextState);
      if (!prev) {
        scheduleResize();
        return;
      }

      const widthChanged = Math.abs(nextState.width - prev.width) >= 1;
      const heightChanged = Math.abs(nextState.height - prev.height) >= 1;
      const scaleChanged = Math.abs(nextState.scale - prev.scale) >= 0.01;
      const offsetChanged = Math.abs(nextState.offsetTop - prev.offsetTop) >= 1
        || Math.abs(nextState.offsetLeft - prev.offsetLeft) >= 1;

      if (deps.isAetherDebugEnabled() && reason === 'scroll' && (heightChanged || scaleChanged || offsetChanged)) {
        console.debug('[aether-debug][viewport-scroll]', {
          widthChanged,
          heightChanged,
          scaleChanged,
          offsetChanged,
          prev,
          next,
        });
      }

      if (widthChanged || heightChanged || scaleChanged || reason === 'resize') {
        scheduleResize();
        return;
      }

      const winRef = deps.getWindowRef();
      const debugEnabled = !!(winRef && (winRef /* as unknown as { __ARC_DEBUG_VIEWPORT__: boolean } */).__ARC_DEBUG_VIEWPORT__);
      if (debugEnabled && reason === 'scroll' && typeof console !== 'undefined' && typeof console.debug === 'function'){
        console.debug('[pve][viewport-scroll] skip resize: size unchanged', {
          width: nextState.width,
          height,
          scale,
          offsetTop,
          offsetLeft,
        });
      }
    };

    const setDrawPaused = (paused)=> {
      drawPaused = !!paused;
      if (drawPaused){
        cancelScheduledDraw();
      } else {
        scheduleDraw();
      }
    };

    return {
      cancelScheduledDraw,
      scheduleDraw,
      cancelScheduledResize,
      scheduleResize,
      scheduleViewportResizeIfChanged,
      setDrawPaused,
    };
  };

  const normalizeHpBarGradientCacheKey = (
    fillColor,
    innerHeight,
    innerRadius,
    startY,
  )=> {
    const color = typeof fillColor === 'string' ? fillColor.trim().toLowerCase() ;
    const height = Number.isFinite(innerHeight) ? Math.max(0, Math.round(innerHeight)) ;
    const radius = Number.isFinite(innerRadius) ? Math.max(0, Math.round(innerRadius)) ;
    const start = Number.isFinite(startY) ? Math.round(startY * 100) / 100 : 0;
    return `${color}|h:${height}|r:${radius}|y:${start}`;
  };

  const resolveHpBarGradient = (deps)=> {
    const key = normalizeHpBarGradientCacheKey(
      deps.fillColor,
      deps.innerHeight,
      deps.innerRadius,
      deps.startY,
    );
    const cached = deps.cache.get(key);
    if (cached) return cached;
    const baseFill = typeof deps.fillColor === 'string' ? deps.fillColor : '#6ff0c0';
    if (!deps.context || !Number.isFinite(deps.innerHeight) || deps.innerHeight <= 0) {
      deps.cache.set(key, baseFill);
      return baseFill;
    }
    const startYSafe = Number.isFinite(deps.startY) ? deps.startY : 0;
    const gradient = deps.context.createLinearGradient(deps.x, startYSafe, deps.x, startYSafe + deps.innerHeight);
    const topFill = deps.lightenColor(baseFill, 0.25) ?? baseFill;
    gradient.addColorStop(0, topFill);
    gradient.addColorStop(1, baseFill);
    deps.cache.set(key, gradient);
    return gradient;
  };

  const roundedRectPath = (
    context,
    x,
    y,
    width,
    height,
    radius,
  )=> {
    const clampedRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
    context.beginPath();
    context.moveTo(x + clampedRadius, y);
    context.lineTo(x + width - clampedRadius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
    context.lineTo(x + width, y + height - clampedRadius);
    context.quadraticCurveTo(x + width, y + height, x + width - clampedRadius, y + height);
    context.lineTo(x + clampedRadius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
    context.lineTo(x, y + clampedRadius);
    context.quadraticCurveTo(x, y, x + clampedRadius, y);
    context.closePath();
  };

  const lightenHexColor = (
    color,
    amount,
  )=> {
    if (typeof color !== 'string') return color;
    if (!color.startsWith('#')) return color;
    let hex = color.slice(1);
    if (hex.length === 3){
      hex = hex.split('').map((char) => char + char).join('');
    }
    if (hex.length !== 6) return color;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const mix = (channel)=> Math.min(255, Math.round(channel + (255 - channel) * amount));
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  };

    label: string;
    icon: string;
  };


    meta: StatusMeta;
    priority: number;
    stacks: number;
    turnsLeft: number | null;
  };


    statusName: string;
    tooltip: string;
    priority: number;
    stacks: number;
    turnsLeft: number | null;
  };

  const DEFAULT_STATUS_ICON_PATH = 'assets/weaken.svg';
  const MAX_STATUS_ICONS_PER_TOKEN = 5;

  const CONTROL_TAGS = new Set(['control', 'silence', 'taunt', 'stun', 'sleep', 'fear']);
  const STATUS_ICON_PATHS= {
    blind: 'assets/blind.svg',
    damageCut,
    exalt,
    weaken,
    reflect,
    haste,
    silence,
    pierce,
    stun,
    sleep,
    taunt,
    bleed,
    fatigue,
    daze,
    fear,
    shield,
    stealth,
    frenzy,
    allure,
    execute,
    venom,
    undying,
    me_hoac,
    loithienanh_spd_burn,
    accuracy_down,
  };
  const STATUS_META_BY_ID= {
    blind: { id: 'blind', label, icon,
    damageCut, label, icon,
    exalt, label, icon,
    weaken, label, icon,
    reflect, label, icon,
    haste, label, icon,
    silence, label, icon,
    pierce, label, icon,
    stun, label, icon,
    sleep, label, icon,
    taunt, label, icon,
    bleed, label, icon,
    fatigue, label, icon,
    daze, label, icon,
    fear, label, icon,
    shield, label, icon,
    stealth, label, icon,
    frenzy, label, icon,
    allure, label, icon,
    execute, label, icon,
    venom, label, icon,
    undying, label, icon,
    me_hoac, label, icon,
    loithienanh_spd_burn, label, icon,
    accuracy_down, label, icon,
  };
  const STATUS_ID_ALIAS_TO_CANONICAL= Object.freeze({
    dmgCut: 'damageCut',
  });
  const STATUS_META_BY_TAG= {
    control: { id: 'control', label, icon,
    silence, label, icon,
    shield, label, icon,
    mitigation, label, icon,
    output, label, icon,
    stat, label, icon,
    penetration, label, icon,
    dot, label, icon,
    counter, label, icon,
  };
  const statusAggregateCache = new WeakMap<ReadonlyArray<Record<string, unknown> | null | undefined>, StatusAggregateCacheEntry>();

  const getStatusMeta = (status, unknown> | null | undefined)=> {
    const rawId = typeof status?.id === 'string' ? status.id : '';
    const id = STATUS_ID_ALIAS_TO_CANONICAL[rawId] ?? rawId;
    const tag = typeof status?.tag === 'string' ? status.tag : '';
    const byId = id ? STATUS_META_BY_ID[id] ;
    const byTag = tag ? STATUS_META_BY_TAG[tag] ;
    if (byId) return byId;
    if (byTag) return byTag;
    const fallbackId = id || tag || 'default';
    const fallbackLabel = id || tag || 'Effect';
    const fallbackIcon = fallbackId in STATUS_ICON_PATHS
      ? STATUS_ICON_PATHS[fallbackId /* as StatusIconId */]
      ;
    return { id: fallbackId, label, icon= (status, unknown> | null | undefined)=> {
    const candidates = [status?.dur, status?.ttlTurns, status?.turns, status?.ttl];
    for (const value of candidates){
      const parsed = parseFiniteNumber(value);
      if (parsed !== null){
        return Math.max(0, Math.round(parsed));
      }
    }
    return null;
  };

  const buildStatusTooltip = (label, stacks, turnsLeft)=> {
    const stacksText = `x${Math.max(1, stacks)}`;
    const turnsText = turnsLeft === null ? '∞T' : `${turnsLeft}T`;
    return `${label} ${stacksText} · ${turnsText}`;
  };

  const buildStatusAggregateSignature = (statuses, unknown> | null | undefined>)=> {
    let signature = `len:${statuses.length}`;
    for (const status of statuses){
      if (!status || typeof status !== 'object') {
        signature += '|_';
        continue;
      }
      const id = typeof status.id === 'string' ? status.id : '';
      const tag = typeof status.tag === 'string' ? status.tag : '';
      const kind = typeof status.kind === 'string' ? status.kind : '';
      const stacks = parseFiniteNumber(status.stacks) ?? 1;
      const turnsLeft = computeStatusTurnsLeft(status);
      signature += `|${id}{tag}{kind}{stacks}{turnsLeft ?? 'inf'}`;
    }
    return signature;
  };

  const aggregateStatuses = (statusesInput, unknown> | null | undefined>)=> {
    const statuses = Array.isArray(statusesInput) ? statusesInput : [];
    if (!statuses.length) return [];
    const signature = buildStatusAggregateSignature(statuses);
    const cached = statusAggregateCache.get(statuses);
    if (cached && cached.signature === signature) {
      return cached.aggregates;
    }

    const byStatusId = new Map();
    for (const rawStatus of statuses) {
      if (!rawStatus || typeof rawStatus !== 'object') continue;
      const statusRecord = rawStatus /* as Record<string */, unknown>;
      const statusId = typeof statusRecord.id === 'string' ? statusRecord.id : null;
      if (!statusId) continue;

      const tag = typeof statusRecord.tag === 'string' ? statusRecord.tag : '';
      const kind = typeof statusRecord.kind === 'string' ? statusRecord.kind : '';
      const isControl = CONTROL_TAGS.has(tag) || CONTROL_TAGS.has(statusId);
      const isDebuff = kind === 'debuff';
      const priority = isControl ? 0 : (isDebuff ? 1 : 2);
      const turnsLeft = computeStatusTurnsLeft(statusRecord);
      const stacks = Math.max(1, Math.round(parseFiniteNumber(statusRecord.stacks) ?? 1));

      const existing = byStatusId.get(statusId);
      if (!existing) {
        byStatusId.set(statusId, {
          statusId,
          meta),
          priority,
          stacks,
          turnsLeft,
        });
        continue;
      }

      existing.stacks += stacks;
      if (turnsLeft !== null) {
        existing.turnsLeft = existing.turnsLeft === null
          ? turnsLeft
          : Math.max(existing.turnsLeft, turnsLeft);
      }
      existing.priority = Math.min(existing.priority, priority);
    }

    const aggregates = Array.from(byStatusId.values());
    aggregates.sort((a, b) => (
      a.priority - b.priority
      || ((b.turnsLeft ?? Number.MAX_SAFE_INTEGER) - (a.turnsLeft ?? Number.MAX_SAFE_INTEGER))
      || a.meta.label.localeCompare(b.meta.label)
    ));
    statusAggregateCache.set(statuses, { signature, aggregates });
    return aggregates;
  };

  const resolveStatusIconPreview = (
    statusesInput, unknown> | null | undefined>,
  ){ id: string; tooltip: string; priority: number }> => {
    const preview; tooltip: string; priority: number }> = [];
    const aggregates = aggregateStatuses(statusesInput);
    for (const aggregate of aggregates){
      if (preview.length >= MAX_STATUS_ICONS_PER_TOKEN) break;
      preview.push({
        id: aggregate.statusId,
        tooltip, aggregate.stacks, aggregate.turnsLeft),
        priority,
      });
    }
    return preview;
  };




    image: HTMLImageElement | null;
    status: StatusIconLoadState;
  };


    iconPath: string;
    fallbackIconPath: string;
    getCacheEntry: (iconId) => TEntry | undefined;
    setCacheEntry: (iconId, entry) => void;
    createCacheEntry: (iconId, iconPath) => TEntry;
  };


    getCacheEntry: (iconId) => TEntry | undefined;
    setCacheEntry: (iconId, entry) => void;
    createCacheEntry: (iconId, iconPath) => TEntry;
  };


    maxIcons: number;
    ensureStatusIcon: (iconId, iconPath) => TIcon | null;
    isIconReady: (icon) => boolean;
  };


    ensureStatusIcon: (iconId, iconPath) => TIcon | null;
    isIconReady: (icon) => boolean;
  };


    maxIcons: number;
    getCacheEntry: (iconId) => TEntry | undefined;
    setCacheEntry: (iconId, entry) => void;
    createCacheEntry: (iconId, iconPath) => TEntry;
    isIconReady: (icon) => boolean;
  };

  const ensureStatusIconLoaded = (
    deps,
  )=> {
    if (typeof Image === 'undefined') return null;
    const fallbackIconPath = deps.fallbackIconPath ?? DEFAULT_STATUS_ICON_PATH;
    let cache = deps.getCacheEntry(deps.iconId);
    if (!cache) {
      cache = deps.createCacheEntry(deps.iconId, deps.iconPath);
      deps.setCacheEntry(deps.iconId, cache);
    }
    if (cache.path !== deps.iconPath){
      cache.path = deps.iconPath;
      cache.status = 'idle';
      cache.image = null;
    }
    if (cache.status !== 'idle') return cache;

    const image = new Image();
    cache.image = image;
    cache.status = 'loading';
    if ('decoding' in image) {
      (image /* as HTMLImageElement & { decoding: string } */).decoding = 'async';
    }
    image.onload = () => {
      cache!.status = 'ready';
    };
    image.onerror = () => {
      if (cache!.path !== fallbackIconPath) {
        cache!.status = 'idle';
        cache!.image = null;
        cache!.path = fallbackIconPath;
        ensureStatusIconLoaded({
          ...deps,
          iconPath,
          fallbackIconPath,
        });
        return;
      }
      cache!.status = 'error';
    };
    image.src = deps.iconPath;
    return cache;
  };

  const createStatusIconLoader = (
    deps,
  )=> TEntry | null) => (
      (iconId, iconPath)=> ensureStatusIconLoaded({
        iconId,
        iconPath,
        fallbackIconPath,
        getCacheEntry,
        setCacheEntry,
        createCacheEntry,
      })
    );

  const createDefaultStatusIconEntry = (
    iconId,
    iconPath,
  )=> ({
    statusId: iconId,
    statusName,
    tooltip,
    priority,
    stacks,
    turnsLeft,
    path,
    image,
    status,
  });


    y: number;
    size: number;
    tooltip: string;
  };

  const resolveStatusIconHoverTooltip = (
    canvas,
    hitboxes,
    clientX,
    clientY,
  )=> {
    if (!canvas) return '';
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    for (const hitbox of hitboxes){
      const withinX = x >= hitbox.x && x <= hitbox.x + hitbox.size;
      const withinY = y >= hitbox.y && y <= hitbox.y + hitbox.size;
      if (withinX && withinY){
        return hitbox.tooltip;
      }
    }
    return '';
  };

  const applyStatusIconHoverTooltip = (
    deps,
  )=> {
    const nextTooltip = resolveStatusIconHoverTooltip(
      deps.canvas,
      deps.hitboxes,
      deps.clientX,
      deps.clientY,
    );
    if (nextTooltip === deps.currentTooltip) return;
    deps.setTooltip(nextTooltip);
    if (deps.canvas){
      deps.canvas.title = nextTooltip;
    }
  };
  const collectRenderableStatusIcons = (
    deps,
  ){ icon: TIcon }> => {
    const statuses = Array.isArray(deps.statusesInput) ? deps.statusesInput : [];
    if (!statuses.length) return [];
    const maxIcons = Number.isFinite(deps.maxIcons)
      ? Math.max(1, Math.round(deps.maxIcons /* as number */))
      ;
    const aggregates = aggregateStatuses(statuses);
    const icons= [];
    for (const aggregate of aggregates) {
      if (icons.length >= maxIcons) break;
      const icon = deps.ensureStatusIcon(aggregate.meta.id, aggregate.meta.icon);
      if (!deps.isIconReady(icon)) continue;
      icons.push({
        icon: icon /* as TIcon */,
        statusId,
        statusName,
        tooltip, aggregate.stacks, aggregate.turnsLeft),
        priority,
        stacks,
        turnsLeft,
      });
    }
    return icons;
  };

  const isStatusIconReady = (icon)=> (
    Boolean(icon && icon.status === 'ready' && icon.image)
  );

  const materializeRenderableStatusIcons = (
    entries,
  )=> entries.map((entry) => ({
    ...entry.icon,
    statusId,
    statusName,
    tooltip,
    priority,
    stacks,
    turnsLeft,
  }));

  const resolveRenderableStatusIcons = (
    deps,
  )=> {
    const collected = collectRenderableStatusIcons({
      statusesInput: deps.statusesInput,
      maxIcons,
      ensureStatusIcon,
      isIconReady,
    });
    if (!collected.length) return [];
    return materializeRenderableStatusIcons(collected);
  };

  const createRenderableStatusIconResolver = (
    deps,
  )=> Array<TIcon & RenderableStatusIcon>) => (
      (statusesInput)=> resolveRenderableStatusIcons({
        statusesInput,
        maxIcons,
        ensureStatusIcon,
        isIconReady,
      })
    );

  const createStatusIconResolver = (
    deps,
  ){
    ensureStatusIcon: (iconId, iconPath) => TEntry | null;
    resolveStatusIcons: (statusesInput, unknown> | null | undefined>) => Array<TEntry & RenderableStatusIcon>;
  } => {
    const ensureStatusIcon = createStatusIconLoader({
      fallbackIconPath: deps.fallbackIconPath,
      getCacheEntry,
      setCacheEntry,
      createCacheEntry,
    });
    const resolveStatusIcons = createRenderableStatusIconResolver({
      maxIcons: deps.maxIcons,
      ensureStatusIcon,
      isIconReady,
    });
    return {
      ensureStatusIcon,
      resolveStatusIcons,
    };
  };
  if (!Object.prototype.hasOwnProperty.call(exports, 'createBrowserFrameFns')) exports.createBrowserFrameFns = createBrowserFrameFns;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createMeleeActivityTracker')) exports.createMeleeActivityTracker = createMeleeActivityTracker;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createSessionRenderController')) exports.createSessionRenderController = createSessionRenderController;
  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveHpBarGradient')) exports.resolveHpBarGradient = resolveHpBarGradient;
  if (!Object.prototype.hasOwnProperty.call(exports, 'roundedRectPath')) exports.roundedRectPath = roundedRectPath;
  if (!Object.prototype.hasOwnProperty.call(exports, 'lightenHexColor')) exports.lightenHexColor = lightenHexColor;
  if (!Object.prototype.hasOwnProperty.call(exports, 'DEFAULT_STATUS_ICON_PATH')) exports.DEFAULT_STATUS_ICON_PATH = DEFAULT_STATUS_ICON_PATH;
  if (!Object.prototype.hasOwnProperty.call(exports, 'MAX_STATUS_ICONS_PER_TOKEN')) exports.MAX_STATUS_ICONS_PER_TOKEN = MAX_STATUS_ICONS_PER_TOKEN;
  if (!Object.prototype.hasOwnProperty.call(exports, 'buildStatusTooltip')) exports.buildStatusTooltip = buildStatusTooltip;
  if (!Object.prototype.hasOwnProperty.call(exports, 'aggregateStatuses')) exports.aggregateStatuses = aggregateStatuses;
  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveStatusIconPreview')) exports.resolveStatusIconPreview = resolveStatusIconPreview;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ensureStatusIconLoaded')) exports.ensureStatusIconLoaded = ensureStatusIconLoaded;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createStatusIconLoader')) exports.createStatusIconLoader = createStatusIconLoader;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createDefaultStatusIconEntry')) exports.createDefaultStatusIconEntry = createDefaultStatusIconEntry;
  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveStatusIconHoverTooltip')) exports.resolveStatusIconHoverTooltip = resolveStatusIconHoverTooltip;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyStatusIconHoverTooltip')) exports.applyStatusIconHoverTooltip = applyStatusIconHoverTooltip;
  if (!Object.prototype.hasOwnProperty.call(exports, 'collectRenderableStatusIcons')) exports.collectRenderableStatusIcons = collectRenderableStatusIcons;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isStatusIconReady')) exports.isStatusIconReady = isStatusIconReady;
  if (!Object.prototype.hasOwnProperty.call(exports, 'materializeRenderableStatusIcons')) exports.materializeRenderableStatusIcons = materializeRenderableStatusIcons;
  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveRenderableStatusIcons')) exports.resolveRenderableStatusIcons = resolveRenderableStatusIcons;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createRenderableStatusIconResolver')) exports.createRenderableStatusIconResolver = createRenderableStatusIconResolver;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createStatusIconResolver')) exports.createStatusIconResolver = createStatusIconResolver;
};
__modules['./modes/pve/session-runtime-impl.ts'] = (exports, module, __require) => {
  const __dep2 = __require('./aether.ts');
  const globalAetherPool = __dep2.globalAetherPool;
  const __dep3 = __require('./turns.ts');
  const stepTurn = __dep3.stepTurn;
  const doActionOrSkip = __dep3.doActionOrSkip;
  const __dep4 = __require('./summon.ts');
  const enqueueImmediate = __dep4.enqueueImmediate;
  const processActionChain = __dep4.processActionChain;
  const __dep5 = __require('./ai.ts');
  const refillDeckEnemy = __dep5.refillDeckEnemy;
  const aiMaybeAct = __dep5.aiMaybeAct;
  const __dep6 = __require('./statuses.ts');
  const Statuses = __dep6.Statuses;
  const makeStatusEffect = __dep6.makeStatusEffect;
  const __dep7 = __require('./config.ts');
  const CFG = __dep7.CFG;
  const CAM = __dep7.CAM;
  const __dep8 = __require('./combat.ts');
  const pickTarget = __dep8.pickTarget;
  const dealAbilityDamage = __dep8.dealAbilityDamage;
  const healUnit = __dep8.healUnit;
  const grantShield = __dep8.grantShield;
  const applyDamage = __dep8.applyDamage;
  const basicAttack = __dep8.basicAttack;
  const __dep9 = __require('./utils/fury.ts');
  const initializeFury = __dep9.initializeFury;
  const setFury = __dep9.setFury;
  const spendFury = __dep9.spendFury;
  const resolveUltCost = __dep9.resolveUltCost;
  const gainFury = __dep9.gainFury;
  const finishFuryHit = __dep9.finishFuryHit;
  const __dep10 = __require('./catalog.ts');
  const getMetaById = __dep10.getMetaById;
  const __dep11 = __require('./engine.ts');
  const makeGrid = __dep11.makeGrid;
  const drawGridOblique = __dep11.drawGridOblique;
  const drawTokensOblique = __dep11.drawTokensOblique;
  const drawQueuedOblique = __dep11.drawQueuedOblique;
  const hitToCellOblique = __dep11.hitToCellOblique;
  const spawnLeaders = __dep11.spawnLeaders;
  const slotIndex = __dep11.slotIndex;
  const slotToCell = __dep11.slotToCell;
  const cellReserved = __dep11.cellReserved;
  const __dep12 = __require('./background.ts');
  const drawEnvironmentProps = __dep12.drawEnvironmentProps;
  const __dep13 = __require('./art.ts');
  const getUnitArt = __dep13.getUnitArt;
  const setUnitSkin = __dep13.setUnitSkin;
  const __dep14 = __require('./ui.ts');
  const initHUD = __dep14.initHUD;
  const startSummonBar = __dep14.startSummonBar;
  const __dep15 = __require('./vfx.ts');
  const vfxDraw = __dep15.vfxDraw;
  const vfxAddSpawn = __dep15.vfxAddSpawn;
  const vfxAddHit = __dep15.vfxAddHit;
  const vfxAddMelee = __dep15.vfxAddMelee;
  const vfxAddLightningArc = __dep15.vfxAddLightningArc;
  const vfxAddBloodPulse = __dep15.vfxAddBloodPulse;
  const vfxAddGroundBurst = __dep15.vfxAddGroundBurst;
  const vfxAddShieldWrap = __dep15.vfxAddShieldWrap;
  const computeMeleeOffsets = __dep15.computeMeleeOffsets;
  const baseAsSessionWithVfx */ = __dep15.asSessionWithVfx /*;
  const __dep16 = __require('./scene.ts');
  const drawBattlefieldScene = __dep16.drawBattlefieldScene;
  const __dep17 = __require('./events.ts');
  const TURN_START = __dep17.TURN_START;
  const TURN_END = __dep17.TURN_END;
  const ACTION_START = __dep17.ACTION_START;
  const ACTION_END = __dep17.ACTION_END;
  const BATTLE_END = __dep17.BATTLE_END;
  const emitGameEvent = __dep17.emitGameEvent;
  const addGameEventListener = __dep17.addGameEventListener;
  const __dep18 = __require('./utils/dummy.ts');
  const ensureNestedModuleSupport = __dep18.ensureNestedModuleSupport;
  const __dep19 = __require('./utils/time.ts');
  const mergeBusyUntil = __dep19.mergeBusyUntil;
  const normalizeAnimationFrameTimestamp = __dep19.normalizeAnimationFrameTimestamp;
  const resetSessionTimeBase = __dep19.resetSessionTimeBase;
  const safeNow = __dep19.safeNow;
  const sessionNow = __dep19.sessionNow;
  const __dep20 = __require('./utils/kit.ts');
  const getSummonSpec = __dep20.getSummonSpec;
  const resolveSummonSlots = __dep20.resolveSummonSlots;
  const __dep21 = __require('./utils/unique-global.ts');
  const isUniqueGlobalSummonBlocked = __dep21.isUniqueGlobalSummonBlocked;
  const __dep22 = __require('./utils/rng.ts');
  const nextRngValue = __dep22.nextRngValue;
  const __dep23 = __require('./data/tags.ts');
  const normalizeTagList = __dep23.normalizeTagList;
  const __dep24 = __require('./combat/tag-dispatch.ts');
  const dispatchGameplayTags = __dep24.dispatchGameplayTags;
  const __dep25 = __require('./modes/pve/session-state.ts');
  const normalizeConfig = __dep25.normalizeConfig;
  const createSession = __dep25.createSession;
  const invalidateSceneCache = __dep25.invalidateSceneCache;
  const ensureSceneCache = __dep25.ensureSceneCache;
  const getCamPresetSignature = __dep25.getCamPresetSignature;
  const clearBackgroundSignatureCache = __dep25.clearBackgroundSignatureCache;
  const getPreferredDeckEntries = __dep25.getPreferredDeckEntries;
  const resolveEnemyUnits = __dep25.resolveEnemyUnits;
  const parseFiniteNumber = __dep25.parseFiniteNumber;
  const __dep26 = __require('./modes/pve/collection-mapper.ts');
  const mapUnitProgressById = __dep26.mapUnitProgressById;
  const __dep27 = __require('./modes/pve/session-loop.ts');
  const createSessionLoopController = __dep27.createSessionLoopController;
  const __dep28 = __require('./modes/pve/session-deck.ts');
  const createSessionDeckController = __dep28.createSessionDeckController;
  const __dep29 = __require('./modes/pve/unit-runtime-hooks.ts');
  const runPveRuntimeUltHook = __dep29.runPveRuntimeUltHook;
  const __dep30 = __require('./combat/unit-runtime-hooks.ts');
  const runRuntimeUlt = __dep30.runRuntimeUlt;
  const __dep31 = __require('./modes/pve/session-events.ts');
  const createSessionEventBindings = __dep31.createSessionEventBindings;
  const __dep32 = __require('./modes/pve/session-render.ts');
  const applyStatusIconHoverTooltip = __dep32.applyStatusIconHoverTooltip;
  const createDefaultStatusIconEntry = __dep32.createDefaultStatusIconEntry;
  const createStatusIconResolver = __dep32.createStatusIconResolver;
  const createBrowserFrameFns = __dep32.createBrowserFrameFns;
  const createMeleeActivityTracker = __dep32.createMeleeActivityTracker;
  const createSessionRenderController = __dep32.createSessionRenderController;
  const DEFAULT_STATUS_ICON_PATH = __dep32.DEFAULT_STATUS_ICON_PATH;
  const MAX_STATUS_ICONS_PER_TOKEN = __dep32.MAX_STATUS_ICONS_PER_TOKEN;
  const lightenHexColor = __dep32.lightenHexColor;
  const roundedRectPath = __dep32.roundedRectPath;
  const isStatusIconReady = __dep32.isStatusIconReady;
  const resolveStatusIconPreview = __dep32.resolveStatusIconPreview;
  const resolveHpBarGradient = __dep32.resolveHpBarGradient;
  const __dep33 = __require('./leader-uyen.ts');
  const ensureUyenState = __dep33.ensureUyenState;
  const getUyenUltChoice = __dep33.getUyenUltChoice;
  const grantUyenSummonRage = __dep33.grantUyenSummonRage;
  const canCastLeaderUltChoice = __dep33.canCastLeaderUltChoice;
  const isAnyLeaderUltReady = __dep33.isAnyLeaderUltReady;
  const isUyenLeader = __dep33.isUyenLeader;
  const queueUyenUltCast = __dep33.queueUyenUltCast;extends Record<string, unknown> {
    hits: number | string | null;
    hitCount: number | string | null;
    count: number | string | null;
    targets: number | string | null;
    targetCount: number | string | null;
    duration: number | string | null;
    durationTurns: number | string | null;
    turns: number | string | null;
    busyMs: number | string | null;
    durationMs: number | string | null;
  }extends Record<string, unknown> {
    type: string | null;
    scaleWIL: number | string | null;
    scaleWil: number | string | null;
    flat: number | string | null;
    flatAdd: number | string | null;
    percentTargetMaxHP: number | string | null;
    basePercentMaxHPTarget: number | string | null;
    bossPercent: number | string | null;
    defPen: number | string | null;
    pen: number | string | null;
  }extends Record<string, unknown> {
    id: string | null;
    amount: number | string | null;
    amountPercent: number | string | null;
    maxStacks: number | string | null;
    turns: number | string | null;
  }extends Record<string, unknown> {
    hpPercent: number | string | null;
    hpPct: number | string | null;
    rage: number | string | null;
    lockSkillsTurns: number | string | null;
  }extends Record<string, unknown> {
    type: string | null;
    power: number | string | null;
    hpTradePercent: number | string | null;
    hpTrade: { percentMaxHP: number | string | null } | null;
    hits: number | string | null;
    scale: number | string | null;
    countsAsBasic: boolean | null;
    tagAsBasic: boolean | null;
    damage: UltDamageSpec | null;
    appliesDebuff: UltDebuffSpec | null;
    duration: number | string | null;
    turns: number | string | null;
    reduceDmg: number | string | null;
    bonusVsLeader: number | string | null;
    penRES: number | string | null;
    selfHPTrade: number | string | null;
    targets: number | string | null;
    revived: UltReviveSpec | null;
    allies: number | string | null;
    healLeader: boolean | null;
    attackSpeed: number | string | null;
    runtime: SkillRuntime | null;
    tags: ReadonlyArray<string> | null;
    metadata: { summon: SummonSpec | null; tags: ReadonlyArray<string> | null } | null;
    meta: { summon: SummonSpec | null; tags: ReadonlyArray<string> | null } | null;
    summon: SummonSpec | null;
  }

  const ULT_TAG_CACHE = new WeakMap<UltSpec, ReadonlyArray<string>>();
  const appendUltTags = (output, list)=> {
    if (!Array.isArray(list)) return;
    for (let index = 0; index < list.length; index += 1) {
      const tag = list[index];
      if (typeof tag !== 'string' || tag.trim().length === 0) continue;
      output.push(tag);
    }
  };

  const getNormalizedUltTags = (ult)=> {
    const cached = ULT_TAG_CACHE.get(ult);
    if (cached) {
      return cached;
    }
    const directTags = ult.tags;
    const metaTags = ult.meta?.tags;
    const metadataTags = ult.metadata?.tags;
    if (
      (!Array.isArray(directTags) || directTags.length === 0)
      && (!Array.isArray(metaTags) || metaTags.length === 0)
      && (!Array.isArray(metadataTags) || metadataTags.length === 0)
    ) {
      ULT_TAG_CACHE.set(ult, []);
      return [];
    }
    const rawUltTags= [];
    appendUltTags(rawUltTags, directTags);
    appendUltTags(rawUltTags, metaTags);
    appendUltTags(rawUltTags, metadataTags);
    const normalized = rawUltTags.length ? normalizeTagList(rawUltTags) ;
    ULT_TAG_CACHE.set(ult, normalized);
    return normalized;
  };

  const isPlainRecord = (value)=> (
    !!value && typeof value === 'object'
  );

  const isFiniteNumber = (value)=> (
    typeof value === 'number' && Number.isFinite(value)
  );

  const toFiniteOrZero = (value)=> parseFiniteNumber(value) ?? 0;
  const toPositiveOrNull = (value)=> {
    const parsed = parseFiniteNumber(value);
    if (parsed === null) return null;
    return parsed > 0 ? parsed : null;
  };

  const toStartConfigOverrides = (value)=> {
    if (!isPlainRecord(value)) return {};
    return { ...(value /* as Record<string */, unknown>) } /* as StartConfigOverrides */;
  };

  const toNormalizedSessionConfig = (value)=> (
    normalizeConfig(toStartConfigOverrides(value))
  );

  const toRootLike = (value)=> {
    if (value == null) return value /* as null | undefined */;
    if (typeof Element !== 'undefined' && value instanceof Element) return value;
    if (typeof Document !== 'undefined' && value instanceof Document) return value;
    if (typeof (value /* as { nodeType: unknown } */).nodeType === 'number'){
      return value /* as Element | Document */;
    }
    return null;
  };

  const isInitializedGame = (
    game= Game,
  )=> Boolean(game && game._inited);

  const getInitializedGame = ()=> (
    isInitializedGame() ? (Game /* as InitializedSessionState */) 
  );

  const nextSessionRandom = (game= Game)=> (
    nextRngValue(game?.rng)
  );

  const SKILL_RUNTIME_NUMERIC_KEYS= [
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

  const ULT_DAMAGE_NUMERIC_KEYS= [
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

  const ULT_NUMERIC_KEYS= [
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

  const sanitizeOptionalString = (input)=> {
    if (typeof input !== 'string') return undefined;
    const trimmed = input.trim();
    return trimmed ? trimmed : undefined;
  };

  const applyParsedNumericKeys = <T extends Record<string, unknown>>(
    source,
    target,
    keys,
  )=> {
    for (let index = 0; index < keys.length; index += 1) {
      const key = keys[index] /* as keyof T */;
      const parsed = parseFiniteNumber(source[key]);
      if (parsed != null) {
        target[key] = parsed /* as T[keyof T */];
      }
    }
  };

  const coerceSkillRuntime = (value)=> {
    if (!isPlainRecord(value)) return null;
    const record = value /* as SkillRuntime */;
    const normalized= { ...record };
    applyParsedNumericKeys(record, normalized, SKILL_RUNTIME_NUMERIC_KEYS);
    return normalized;
  };

  const coerceSummonCreep = (value)=> {
    if (!isPlainRecord(value)) return null;
    const record = value /* as SummonCreepSpec */;
    const creep= { ...record };
    const ttlTurns = parseFiniteNumber(record.ttlTurns ?? record.ttl);
    if (ttlTurns != null) creep.ttlTurns = ttlTurns;
    return creep;
  };

  const coerceSummonSpec = (value)=> {
    if (!value || typeof value !== 'object') return null;
    const spec = { ...(value /* as SummonSpec */) };
    spec.pattern = sanitizeOptionalString(spec.pattern);
    spec.placement = sanitizeOptionalString(spec.placement);
    spec.patternKey = sanitizeOptionalString(spec.patternKey);
    spec.shape = sanitizeOptionalString(spec.shape);
    spec.area = sanitizeOptionalString(spec.area);
    spec.replace = sanitizeOptionalString(spec.replace);
    if (Array.isArray(spec.slots)){
      const normalizedSlots= [];
      for (let index = 0; index < spec.slots.length; index += 1) {
        const parsed = parseFiniteNumber(spec.slots[index]);
        if (parsed == null) continue;
        normalizedSlots.push(parsed);
      }
      spec.slots = normalizedSlots;
    }
    const count = parseFiniteNumber(spec.count);
    const summonCount = parseFiniteNumber(spec.summonCount);
    const resolvedCount = count ?? summonCount;
    if (resolvedCount != null){
      spec.count = resolvedCount;
      spec.summonCount = resolvedCount;
    }
    const ttl = parseFiniteNumber(spec.ttl);
    const ttlTurns = parseFiniteNumber(spec.ttlTurns ?? ttl);
    if (ttlTurns != null){
      spec.ttlTurns = ttlTurns;
      if (ttl == null) spec.ttl = ttlTurns;
    } else if (ttl != null){
      spec.ttl = ttl;
    }
    const limit = parseFiniteNumber(spec.limit);
    if (limit != null) spec.limit = limit;
    spec.inherit = isPlainRecord(spec.inherit) ? (spec.inherit /* as SummonInheritSpec */) ;
    spec.creep = coerceSummonCreep(spec.creep);
    return spec;
  };

  const coerceDamageSpec = (value)=> {
    if (!isPlainRecord(value)) return null;
    const record = value /* as UltDamageSpec */;
    const damage= { ...record };
    applyParsedNumericKeys(record, damage, ULT_DAMAGE_NUMERIC_KEYS);
    if (typeof record.type === 'string') damage.type = record.type;
    return damage;
  };

  const coerceUlt = (value)=> {
    if (!value || typeof value !== 'object') return null;
    const record = value /* as UltSpec */;
    const ult= { ...record };
    applyParsedNumericKeys(record, ult, ULT_NUMERIC_KEYS);
    const targetsParsed = parseFiniteNumber(record.targets);
    if (targetsParsed != null) ult.targets = targetsParsed;
    const alliesParsed = parseFiniteNumber(record.allies);
    if (alliesParsed != null) ult.allies = alliesParsed;
    ult.runtime = coerceSkillRuntime(record.runtime);
    const resolvedSummon =
      coerceSummonSpec(record.summon)
      ?? coerceSummonSpec(record.metadata?.summon)
      ?? coerceSummonSpec(record.meta?.summon);
    if (resolvedSummon) ult.summon = resolvedSummon;
    if (ult.metadata?.summon){
      ult.metadata = { ...ult.metadata, summon) };
    }
    if (ult.meta?.summon){
      ult.meta = { ...ult.meta, summon) };
    }
    ult.damage = coerceDamageSpec(record.damage);
    return ult;
  };

  const readCountCandidate = (value)=> {
    const numeric = parseFiniteNumber(value);
    if (numeric != null) return numeric;
    if (typeof value === 'string'){
      const match = value.match(/(\d+)/);
      if (match && match[1]){
        const parsed = Number(match[1]);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
    return null;
  };

  const clampResolvedCount = (
    value,
    { min, max }{ min: number; max: number } = {},
  )=> {
    let resolved = Math.round(value);
    if (typeof min === 'number') resolved = Math.max(min, resolved);
    if (typeof max === 'number') resolved = Math.min(max, resolved);
    return resolved;
  };

  const resolveCountCandidates = (
    values,
    fallback,
    clamp= {},
  )=> {
  for (let index = 0; index < values.length; index += 1) {
      const candidate = readCountCandidate(values[index]);
      if (candidate == null) continue;
      return clampResolvedCount(candidate, clamp);
    }
    return fallback;
  };

  const getUltHitCount = (ult)=> {
    const runtime = ult?.runtime;
    const resolved = resolveCountCandidates(
      [ult?.hits, runtime?.hits, runtime?.hitCount, runtime?.count],
      1,
      { min: 1 },
    );
    return Math.max(1, resolved);
  };
  const getUltScopedCount = (
    ult,
    fallback,
    scope= 'targets',
  )=> {
    const runtime = ult?.runtime;
    const primary = scope === 'allies' ? ult?.allies : ult?.targets;
    return resolveUltScopedCount(primary, runtime, fallback);
  };

  const resolveUltScopedCount = (
    primary,
    runtime,
    fallback,
  )=> resolveCountCandidates(
    [primary, runtime?.targets, runtime?.targetCount, runtime?.count],
    fallback,
    { min: 0 },
  );

  const getUltDurationTurns = (
    ult,
    fallback,
  )=> {
    const runtime = ult?.runtime;
    const resolved = resolveCountCandidates(
      [ult?.duration, ult?.turns, runtime?.duration, runtime?.turns, runtime?.durationTurns],
      fallback,
      { min: 1 },
    );
    return Math.max(1, resolved);
  };

  const ensureSessionWithVfx = (
    game,
    options?,
  )=> {
    const session = baseAsSessionWithVfx(game, options);
    if (!session) return null;
    if (!Array.isArray(session.vfx)){
      session.vfx = [];
    }
    return session;
  };

  const applyCostGain = (
    holder,
    gain,
  )=> {
    if (!holder || gain <= 0) return false;
    if (holder.cost >= holder.costCap) return false;
    const nextCost = Math.min(holder.costCap, holder.cost + gain);
    if (nextCost === holder.cost) return false;
    holder.cost = nextCost;
    return true;
  };

  const normalizeTurnBusyUntil = (
    turnState,
  )=> {
    if (!turnState) return 0;
    const rawBusy = turnState.busyUntil;
    const hasPositiveBusy = isFiniteNumber(rawBusy) && rawBusy > 0;
    const busyUntil = hasPositiveBusy ? rawBusy : 0;
    if (!hasPositiveBusy){
      turnState.busyUntil = busyUntil;
    }
    return busyUntil;
  };


    stop: () => void;
    updateConfig: (next?) => void;
    setUnitSkin: (unitId, skinKey) => boolean;
  };

  function sanitizeStartConfig(
    config,
  ){ rest: StartConfigOverrides; root: RootLike } {
    if (!isPlainRecord(config)){
      return { rest: {}, root, rootEl, ...rest } = config /* as Record<string */, unknown>;
    const resolvedRoot = toRootLike(root) ?? toRootLike(rootEl) ?? null;
    return {
      rest: toStartConfigOverrides(rest),
      root,
    };
  }

  let canvas= null;
  let ctx= null;
  let hud= null;
  let summonBarHandle= null;
  let hudCleanup=> void) | null = null;
  const DEFAULT_CAMERA_KEY= 'landscape_oblique';
  const resolveCameraPreset = ()=> {
    const key = (CFG.CAMERA ?? DEFAULT_CAMERA_KEY) /* as keyof typeof CAM */;
    const preset = CAM[key];
    return preset ?? CAM[DEFAULT_CAMERA_KEY];
  };
  const CAM_PRESET = resolveCameraPreset();
  const AETHER_DEBUG_FLAG = typeof window !== 'undefined'
    && (((window /* as unknown as { __ARCLUNE_DEBUG_AETHER: boolean } */).__ARCLUNE_DEBUG_AETHER) === true
      || new URLSearchParams(window.location.search).get('debugAether') === '1');

  const aetherDebugState = {
    frames: 0,
    totalMs,
    maxMs,
    lastRectTop,
    lastRectLeft,
  };

  function emitAetherDebug(rect, elapsedMs){
    if (!AETHER_DEBUG_FLAG) return;
    aetherDebugState.frames += 1;
    aetherDebugState.totalMs += elapsedMs;
    aetherDebugState.maxMs = Math.max(aetherDebugState.maxMs, elapsedMs);

    if (aetherDebugState.frames < 60) return;
    const snapshot = globalAetherPool.debugSnapshot();
    const avgMs = aetherDebugState.totalMs / aetherDebugState.frames;
    const rectMoved = rect.top !== aetherDebugState.lastRectTop || rect.left !== aetherDebugState.lastRectLeft;

    console.debug('[aether-debug] frame-window', {
      frames: aetherDebugState.frames,
      avgMs)),
      maxMs)),
      rectMoved,
      rectTop)),
      rectLeft)),
      styleWrites,
        enemy,
      },
      syncCalls,
        enemy,
      },
    });

    aetherDebugState.frames = 0;
    aetherDebugState.totalMs = 0;
    aetherDebugState.maxMs = 0;
    aetherDebugState.lastRectTop = rect.top;
    aetherDebugState.lastRectLeft = rect.left;
    globalAetherPool.resetDebugSnapshot();
  }
  let lastCamPresetSignature = getCamPresetSignature(CAM_PRESET);
  const HAND_SIZE  = CFG.HAND_SIZE ?? 4;

  ensureNestedModuleSupport();

  const SUPPORTS_PERF_NOW = typeof globalThis !== 'undefined'
    && !!globalThis.performance
    && typeof globalThis.performance.now === 'function';

  const resolveConfiguredTurnIntervalMs = ()=> {
    const intervalCandidate = CFG?.ANIMATION?.turnIntervalMs;
    const parsedInterval = Number(intervalCandidate);
    return Number.isFinite(parsedInterval) && parsedInterval > 0
      ? parsedInterval
      : 600;
  };

  // --- Instance counters (để gắn id cho token/minion) ---
  let _IID = 1;
  let _BORN = 1;
  const nextIid = ()=> _IID++;

  let Game= null;
  let sessionLoopController= null;
  const sessionDeckController = createSessionDeckController({
    getGame: () => Game,
    getAliveTokens) => getAliveTokensScratch(),
    handSize,
    isUniqueGlobalSummonBlocked, card) => (
      isUniqueGlobalSummonBlocked(game, { unitId: card.id, tags)
    ),
    onQueuedSummon) => {
      if (hud) hud.update(game);
      scheduleDraw();
    },
  });
  const {
    ensureDeck,
    isCardInLockedDeck,
    getCardCost,
    refillDeck,
    selectFirstAffordable,
    renderSummonBar,
    handleSummonBarPick,
    canAffordCard,
    getDeckForSummonBar,
    handleCanvasSummonCellClick,
  } = sessionDeckController;
  let resizeHandler=> void) | null = null;
  let visualViewportResizeHandler=> void) | null = null;
  let visualViewportScrollHandler=> void) | null = null;
  let viewportResizeDebugState= null;
  let canvasClickHandler= null;
  let winRef= null;
  let docRef= null;
  let rootElement= null;
  let timerElement= null;
  let leaderUltControlsEl= null;
  let leaderUltButtons= [];
  let leaderUltControlsFingerprint= null;
  let storedConfig= normalizeConfig();
  let running = false;
  let leaderEndCheckFlags; enemy: boolean } = { ally: false, enemy= new Map();
  const statusIconCache = new Map();
  const statusIconHitboxes= [];
  let statusIconHoverTooltip = '';
  let canvasMouseMoveHandler=> void) | null = null;

  const {
    refreshAnimationFrameFns,
    getRequestAnimationFrame,
    getCancelAnimationFrame,
  } = createBrowserFrameFns({
    getWindowRef: () => winRef,
  });
  const meleeActivityTracker = createMeleeActivityTracker(() => safeNow());
  const {
    makeMeleeTokenKey,
    syncMeleeOffsetTokens,
    clearMeleeOffsetTokens,
    collectActiveAttackTokenKeys,
  } = meleeActivityTracker;

  function cleanupSummonBar(){
    if (summonBarHandle && typeof summonBarHandle.cleanup === 'function'){
      try {
        summonBarHandle.cleanup();
      } catch {}
    }
    summonBarHandle = null;
    const game = getInitializedGame();
    if (game?.ui){
      game.ui.bar = null;
    }
  }

  function resetSessionState(overrides){
    storedConfig = { ...storedConfig, ...overrides };
    resetSessionTimeBase();
    Game = createSession(storedConfig);
    applyCollectionSkinsToSession(Game);
    _IID = 1;
    _BORN = 1;
    invalidateSceneCache();
    clearMeleeOffsetTokens();
    creepDeathHealProcessed.clear();
  }

  if (CFG?.DEBUG?.LOG_EVENTS) {
    const logEvent = (type)=> (event) => {
      const detail = (event?.detail ?? {}) /* as GameEventDetailMap[T */] & Record<string, unknown>;
      const unitRaw = (detail['unit'] ?? null) /* as { id: string */; name: string } | null | undefined;
      const readString = (value)=> (typeof value === 'string' ? value : null);
      const readNumber = (value)=> {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (typeof value === 'string'){
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
      };
      const info = {
        side: readString(detail['side'] /* as unknown */),
        slot),
        cycle),
        orderIndex),
        orderLength),
        phase),
        unit) ?? readString(unitRaw?.name),
        action),
        skipped),
        reason),
        processedChain,
      };
      console.debug(`[events] ${type}`, info);
    };
    const types= [TURN_START, TURN_END, ACTION_START, ACTION_END];
    for (const type of types){
      try {
        addGameEventListener(type, logEvent(type));
      } catch (err) {
        console.error('[events]', err);
      }
    }
  }

  [TURN_START, TURN_END].forEach((eventType) => {
    try {
      addGameEventListener(eventType, () => {
        statusIconHitboxes.length = 0;
        statusIconHoverTooltip = '';
        if (canvas) canvas.title = '';
        scheduleDraw();
      });
    } catch (err) {
      console.error('[events] status icon refresh listener', err);
    }
  });

  const sessionRenderController = createSessionRenderController({
    getCanvas: () => canvas,
    getContext) => ctx,
    drawNow) => { draw(); },
    onDrawError) => { console.error('[draw]', err); },
    shouldKeepDrawing) => Boolean(Game?.vfx && Game.vfx.length),
    onResize) => {
      resize();
      if (hud && typeof hud.update === 'function' && Game){
        hud.update(Game);
      }
  },
    onResizeError) => { console.error('[resize]', err); },
    getRequestAnimationFrame,
    getCancelAnimationFrame,
    getWindowRef) => winRef,
    getViewportResizeDebugState) => viewportResizeDebugState,
    setViewportResizeDebugState) => { viewportResizeDebugState = state; },
    isAetherDebugEnabled) => AETHER_DEBUG_FLAG,
  });

  const {
    cancelScheduledDraw,
    scheduleDraw,
    cancelScheduledResize,
    scheduleResize,
    scheduleViewportResizeIfChanged,
    setDrawPaused,
  } = sessionRenderController;

  const DEFAULT_TOKEN_COLOR = '#a9f58c';

  function refreshQueuedArtFor(unitId){
    const updated = getUnitArt(unitId);
    const nextColor = updated?.palette?.primary ?? DEFAULT_TOKEN_COLOR;
    const apply = (map, QueuedSummonRequest> | null | undefined)=> {
      if (!map || typeof map.values !== 'function') return;
      for (const pending of map.values()){
        if (!pending || pending.unitId !== unitId) continue;
        const pendingExt = pending /* as ExtendedQueuedSummon */;
        if (pendingExt){
          pendingExt.art = updated ?? null;
          pendingExt.skinKey = updated?.skinKey ?? null;
          pendingExt.color = nextColor;
        }
      }
    };
    if (!Game?.queued) return;
    apply(Game.queued.ally);
    apply(Game.queued.enemy);
  }

  function applyCollectionSkinsToSession(game= Game){
    if (!game) return;
    const progressById = game.runtime?.unitProgressById;
    if (!progressById || typeof progressById.forEach !== 'function') return;
    for (const [unitId, progress] of progressById.entries()){
      const skinKey = typeof progress?.skinKey === 'string' && progress.skinKey.trim()
        ? progress.skinKey.trim()
        ;
      if (!skinKey) continue;
      setUnitSkinForSession(unitId, skinKey);
    }
  }

  function setUnitSkinForSession(unitId, skinKey){
    if (!Game) return false;
    const ok = setUnitSkin(unitId, skinKey);
    if (!ok) return false;
    const art = getUnitArt(unitId);
    const resolvedSkin = art?.skinKey ?? null;
    const palettePrimary = art?.palette?.primary;
    const primaryColor = typeof palettePrimary === 'string' ? palettePrimary : null;
    const resolveColor = (current)=> {
      if (typeof primaryColor === 'string' && primaryColor.length > 0){
        return primaryColor;
      }
      if (typeof current === 'string' && current.length > 0){
        return current;
      }
      return DEFAULT_TOKEN_COLOR;
    };
    const applyArtMetadata = (entry)=> {
      if (!entry || entry.id !== unitId) return;
      const color = typeof entry.color === 'string' ? entry.color : null;
      const nextColor = resolveColor(color);
      entry.art = art ?? null;
      entry.skinKey = resolvedSkin;
      entry.color = nextColor;
    };
    const tokens = Game.tokens || [];
    for (const token of tokens){
      if (!token || token.id !== unitId) continue;
      const color = typeof token.color === 'string' ? token.color : null;
      const nextColor = resolveColor(color);
      token.art = art;
      token.skinKey = resolvedSkin;
      token.color = nextColor;
    }
    if (Array.isArray(Game.deck3)){
      for (const entry of Game.deck3){
        applyArtMetadata(entry);
      }
    }
    if (Array.isArray(Game.unitsAll)){
      for (const entry of Game.unitsAll){
        applyArtMetadata(entry);
      }
    }
    refreshQueuedArtFor(unitId);
    renderSummonBar();
    scheduleDraw();
    return true;
  }

  const creepDeathHealProcessed = new Set();
  const CREEP_DEATH_HEAL_DEBUG_KEY = 'pve.creepDeathHeal';
  const normalizedTagsByUnitId = new Map();
  const creepDeathHealPctByUnitId = new Map();
  const EMPTY_TAG_LIST= [];
  const FALLBACK_CREEP_DEATH_HEAL_BY_ID= {
    creep_1: 0.03,
    creep_2,
    creep_3,
  };

  const readTokenTags = (token)=> {
    if (!token) return EMPTY_TAG_LIST;
    if (typeof token.id === 'string' && token.id) {
      const cached = normalizedTagsByUnitId.get(token.id);
      if (cached) return cached;
    }

    const directTagsRaw = Array.isArray(token.tags) ? token.tags : EMPTY_TAG_LIST;
    const directTags= [];
    for (const tag of directTagsRaw) {
      if (typeof tag === 'string') {
        directTags.push(tag);
      }
    }

    const metaTagsRaw = getMetaById(token.id)?.tags;
    const metaTags= [];
    if (Array.isArray(metaTagsRaw)) {
      for (const tag of metaTagsRaw) {
        if (typeof tag === 'string') {
          metaTags.push(tag);
        }
      }
    }

    if (directTags.length === 0 && metaTags.length === 0) {
      return EMPTY_TAG_LIST;
    }

    const merged = directTags.length === 0
      ? metaTags
      : metaTags.length === 0
        ? directTags
        : [...directTags, ...metaTags];
    const normalized = normalizeTagList(merged);
    if (typeof token.id === 'string' && token.id) {
      normalizedTagsByUnitId.set(token.id, normalized);
    }
    return normalized;
  };

  const isCreepGroupToken = (token)=> {
    const tags = readTokenTags(token);
    if (tags.includes('creep')) return true;
    return tags.includes('npc') && tags.includes('pve');
  };

  const resolveCreepDeathHealPct = (token)=> {
    if (!token) return 0;
    if (typeof token.id === 'string' && token.id) {
      const cached = creepDeathHealPctByUnitId.get(token.id);
      if (cached != null) return cached;
    }
    const passives = getMetaById(token.id)?.kit?.passives;
    if (Array.isArray(passives)){
      for (const passive of passives){
        if (!passive || typeof passive !== 'object') continue;
        const whenRaw = (passive /* as { when: unknown } */).when;
        const when = typeof whenRaw === 'string' ? whenRaw.trim().toLowerCase() ;
        if (when !== 'ondeath') continue;
        const params = (passive /* as { params: Record<string */, unknown> }).params;
        const mode = typeof params?.mode === 'string' ? params.mode.trim().toLowerCase() ;
        if (mode && mode !== 'castermax') continue;
        const amount = parseFiniteNumber(params?.amount);
        if (amount && amount > 0) {
          const resolved = Math.max(0, Math.min(1, amount));
          if (typeof token.id === 'string' && token.id) {
            creepDeathHealPctByUnitId.set(token.id, resolved);
          }
          return resolved;
        }
      }
    }
    const fallback = FALLBACK_CREEP_DEATH_HEAL_BY_ID[token.id] ?? 0;
    if (typeof token.id === 'string' && token.id) {
      creepDeathHealPctByUnitId.set(token.id, fallback);
    }
    return fallback;
  };

  function maybePruneCreepDeathHealProcessed(tokens){
    if (creepDeathHealProcessed.size < 2048) return;
    const aliveDeadKeys = new Set();
    for (const token of tokens) {
      if (!token || token.alive) continue;
      const deadAt = parseFiniteNumber(token.deadAt);
      if (!deadAt || deadAt <= 0) continue;
      aliveDeadKeys.add(`${token.iid ?? token.id}{deadAt}`);
    }
    if (!aliveDeadKeys.size) {
      creepDeathHealProcessed.clear();
      return;
    }
    for (const key of creepDeathHealProcessed) {
      if (!aliveDeadKeys.has(key)) {
        creepDeathHealProcessed.delete(key);
      }
    }
  }

  function processCreepDeathHealing(now){
    if (!Game?.tokens?.length) return;
    const tokens = Game.tokens;
    maybePruneCreepDeathHealProcessed(tokens);
    const passiveLog = Array.isArray(Game.passiveLog) ? Game.passiveLog : [];
    if (!Array.isArray(Game.passiveLog)) Game.passiveLog = passiveLog;
    const creepAlliesBySide = new Map();
    const getCreepAlliesBySide = (side)=> {
      const cached = creepAlliesBySide.get(side);
      if (cached) return cached;
      const allies= [];
      for (const token of tokens) {
        if (!token || !token.alive) continue;
        if (token.side !== side) continue;
        if (!isCreepGroupToken(token)) continue;
        allies.push(token);
      }
      creepAlliesBySide.set(side, allies);
      return allies;
    };

    for (const deadToken of tokens){
      if (!deadToken || deadToken.alive) continue;
      if (!isCreepGroupToken(deadToken)) continue;
      const deadAt = parseFiniteNumber(deadToken.deadAt);
      if (!deadAt || deadAt <= 0) continue;
      const deathKey = `${deadToken.iid ?? deadToken.id}{deadAt}`;
      if (creepDeathHealProcessed.has(deathKey)) continue;
      creepDeathHealProcessed.add(deathKey);

      const healPct = resolveCreepDeathHealPct(deadToken);
      const deadHpMax = Math.max(0, Math.round(parseFiniteNumber(deadToken.hpMax) ?? 0));
      const healAmount = Math.max(0, Math.round(deadHpMax * healPct));
      if (healAmount <= 0) continue;

      let healedTargets = 0;
      for (const ally of getCreepAlliesBySide(deadToken.side)){
        const hpMax = Math.max(0, Math.round(parseFiniteNumber(ally.hpMax) ?? 0));
        if (hpMax <= 0) continue;
        const before = Math.max(0, Math.round(parseFiniteNumber(ally.hp) ?? 0));
        if (before >= hpMax) continue;
        healUnit(ally, healAmount);
        const after = Math.max(0, Math.round(parseFiniteNumber(ally.hp) ?? 0));
        if (after > before) healedTargets += 1;
      }

      passiveLog.push({
        key: CREEP_DEATH_HEAL_DEBUG_KEY,
        type,
        timestamp,
        sourceIid,
        sourceId,
        side,
        healPct,
        healAmount,
        healedTargets,
        deadAt,
      });

      if (CFG?.DEBUG?.LOG_EVENTS && typeof console !== 'undefined' && typeof console.debug === 'function'){
        console.debug(`[${CREEP_DEATH_HEAL_DEBUG_KEY}]`, {
          sourceId: deadToken.id,
          sourceIid,
          side,
          healPct,
          healAmount,
          healedTargets,
        });
      }
    }
  }

  // Xác chết chờ vanish (để sau này thay bằng dead-animation)
  const DEATH_VANISH_MS = 900;
  function cleanupDead(now){
    if (!Game?.tokens) return;
    const tokens = Game.tokens;
    let write = 0;
    for (let read = 0; read < tokens.length; read += 1) {
      const token = tokens[read];
      if (!token) continue;
      if (token.alive) {
        if (write !== read) tokens[write] = token;
        write += 1;
        continue;
      }
      const deadAt = parseFiniteNumber(token.deadAt) ?? 0;
      if (!deadAt || now - deadAt < DEATH_VANISH_MS) {
        if (write !== read) tokens[write] = token;
        write += 1;
      }
      // else: bỏ hẳn khỏi mảng -> không vẽ, không chặn ô
    }
    if (write < tokens.length) tokens.length = write;
  }

  // LẤY TỪ INSTANCE đang đứng trên sân (đúng spec: thừa hưởng % chỉ số hiện tại của chủ)
  function creepStatsFromInherit(
    masterUnit,
    inherit,
  ){
    if (!inherit || typeof inherit !== 'object') return {};
    const hpRatio = parseFiniteNumber(inherit.HP ?? inherit.hp ?? inherit.HPMax ?? inherit.hpMax) ?? 0;
    const atkRatio = parseFiniteNumber(inherit.ATK ?? inherit.atk) ?? 0;
    const wilRatio = parseFiniteNumber(inherit.WIL ?? inherit.wil) ?? 0;
    const resRatio = parseFiniteNumber(inherit.RES ?? inherit.res) ?? 0;
    const armRatio = parseFiniteNumber(inherit.ARM ?? inherit.arm) ?? 0;
    const hpMaxBase = toFiniteOrZero(masterUnit?.hpMax);
    const atkBase = toFiniteOrZero(masterUnit?.atk);
    const wilBase = toFiniteOrZero(masterUnit?.wil);
    const resBase = toFiniteOrZero(masterUnit?.res);
    const armBase = toFiniteOrZero(masterUnit?.arm);
    const hpMax = Math.round(hpMaxBase * hpRatio);
    const atk   = Math.round(atkBase * atkRatio);
    const wil   = Math.round(wilBase * wilRatio);
    const res   = Math.round(resBase * resRatio);
    const arm   = Math.round(armBase * armRatio * 100) / 100;
    const stats= {};
    if (hpMax > 0){ stats.hpMax = hpMax; stats.hp = hpMax; }
    if (atk > 0) stats.atk = atk;
    if (wil > 0) stats.wil = wil;
    if (res > 0) stats.res = res;
    if (arm > 0) stats.arm = Math.max(0, Math.min(1, arm));
    return stats;
  }

  function countAliveMinionsOf(masterIid){
    const tokens = Game?.tokens;
    if (!tokens?.length) return 0;
    let count = 0;
    for (const token of tokens){
      if (!token?.alive || !token.isMinion || token.ownerIid !== masterIid) continue;
      count += 1;
    }
    return count;
  }
  function removeOldestMinions(masterIid, count){
    if (count <= 0) return;
    const tokens = Game?.tokens;
    if (!tokens) return;

    const limit = Math.max(1, Math.floor(count));
    const selected= [];
    const bornOf = (token)=> token.bornSerial || 0;

    for (const token of tokens) {
      if (!token?.alive || !token.isMinion || token.ownerIid !== masterIid) continue;
      if (selected.length < limit) {
        selected.push(token);
        continue;
      }

      let newestIndex = 0;
      for (let index = 1; index < selected.length; index += 1) {
        if (bornOf(selected[index]) > bornOf(selected[newestIndex])) newestIndex = index;
      }
      if (bornOf(token) < bornOf(selected[newestIndex])) {
        selected[newestIndex] = token;
      }
    }

    if (!selected.length) return;
    const removal = new Set(selected);

    let write = 0;
    for (let read = 0; read < tokens.length; read += 1) {
      const token = tokens[read];
      if (!token || !removal.has(token)) {
        if (token) {
          if (write !== read) tokens[write] = token;
          write += 1;
        }
        continue;
      }
      token.alive = false;
    }
    if (write < tokens.length) tokens.length = write;
   }
  function extendBusy(duration){
    const game = getInitializedGame();
    if (!game || !game.turn) return;
    const now = sessionNow();
    const dur = Math.max(0, duration|0);
    game.turn.busyUntil = mergeBusyUntil(game.turn.busyUntil, now, dur);
  }

  function performUyenLeaderUlt(game, unit){
    const state = ensureUyenState(unit);
    if (!state) return false;
    const aliveIndex = buildAliveTokenIndex(game.tokens || []);
    const getAliveBySide = (side)=> aliveIndex.bySide.get(side) ?? [];
    const furyNow = Math.max(0, Math.floor(parseFiniteNumber(unit.fury) ?? 0));
    const choice = getUyenUltChoice(unit);

    if (choice === 'A') {
      if (furyNow < 100) return false;
      spendFury(unit, 100);
      const candidates= [];
      if (state.a1Stacks < 10) candidates.push('A1');
      candidates.push('A2');
      if (state.a3Stacks < 3) candidates.push('A3');
      const roll = candidates[Math.floor(nextSessionRandom(game) * Math.max(1, candidates.length))] ?? 'A2';
      if (roll === 'A1') {
        state.a1Stacks += 1;
      } else if (roll === 'A2') {
        const allies = getAliveBySide(unit.side);
        for (const ally of allies) {
          const haste = makeStatusEffect('haste', { pct: 0.25, turns);
          if (haste) Statuses.add(ally, { ...haste, sourceUnitId);
        }
      } else {
        state.a3Stacks += 1;
        unit.hpMax = Math.max(1, Math.round((parseFiniteNumber(unit.hpMax) ?? 1) * 1.1));
        unit.hp = Math.min(unit.hpMax, Math.round((parseFiniteNumber(unit.hp) ?? 0) * 1.1));
      }
      return true;
    }

    if (choice === 'B') {
      if (state.bUses >= 10 || furyNow <= 0) return false;
      const cost = Math.max(1, Math.floor(furyNow * 0.4));
      spendFury(unit, cost);
      unit.furyMax = Math.max(1, Math.round((parseFiniteNumber(unit.furyMax) ?? 100) * 1.3));
      unit.rage = unit.fury;
      healUnit(unit, Math.round((parseFiniteNumber(unit.hpMax) ?? 0) * 0.05));
      state.bUses += 1;
      if (state.bUses === 3 || state.bUses === 6 || state.bUses === 10) {
        unit.hpMax = Math.max(1, Math.round((parseFiniteNumber(unit.hpMax) ?? 1) * 1.05));
        unit.hp = Math.min(unit.hpMax, parseFiniteNumber(unit.hp) ?? unit.hpMax);
      }
      return true;
    }

    if (furyNow < 100) return false;
    spendFury(unit, 100);
    const enemySide = unit.side === 'ally' ? 'enemy' : 'ally';
    const enemies = getAliveBySide(enemySide);
    const bonus = Math.min(state.bUses * 0.05, 0.35);
    const unitHpMax = parseFiniteNumber(unit.hpMax) ?? 0;
    const unitAtk = parseFiniteNumber(unit.atk) ?? 0;
    const unitWil = parseFiniteNumber(unit.wil) ?? 0;
    const hpBase = 0.5 * unitHpMax;
    const leaderHpBase = Math.min(hpBase, 0.1 * unitHpMax);
    const statBase = 0.6 * unitAtk + 0.6 * unitWil;
    for (const enemy of enemies) {
      const hpComp = isUyenLeader(enemy) ? leaderHpBase : hpBase;
      const base = hpComp + statBase;
      const scaled = Math.max(1, Math.round(base * (1 + bonus)));
      dealAbilityDamage(game, unit, enemy, {
        base: Math.round(scaled * 0.5),
        dtype,
        attackType,
        defPen,
      });
      dealAbilityDamage(game, unit, enemy, {
        base: Math.round(scaled * 0.5),
        dtype,
        attackType,
        defPen,
      });
    }
    return true;
  }

  function taxiDistance(from, 'cx' | 'cy'>, to, 'cx' | 'cy'>){
    return Math.abs(from.cx - to.cx) + Math.abs(from.cy - to.cy);
  }

  function pickNearestAliveUnits(
    candidates,
    origin, 'cx' | 'cy'>,
    take,
    exclude?,
  ){
    if (!Array.isArray(candidates) || candidates.length <= 0 || take <= 0) return [];
    const limit = Math.max(0, Math.floor(take));
    if (limit <= 0) return [];

    const selected= [];
    const selectedDistance= [];

    for (const candidate of candidates) {
      if (!candidate?.alive) continue;
      if (exclude?.has(candidate)) continue;
      const distance = taxiDistance(origin, candidate);
      const worstDistance = selectedDistance.length > 0
        ? selectedDistance[selectedDistance.length - 1] ?? Number.POSITIVE_INFINITY
        : Number.POSITIVE_INFINITY;
      if (selected.length >= limit && distance >= worstDistance) continue;

      let insertAt = selectedDistance.length;
      while (insertAt > 0 && distance < (selectedDistance[insertAt - 1] ?? Number.POSITIVE_INFINITY)) {
        insertAt -= 1;
      }
      selected.splice(insertAt, 0, candidate);
      selectedDistance.splice(insertAt, 0, distance);

      if (selected.length > limit) {
        selected.pop();
        selectedDistance.pop();
      }
    }

    return selected;
  }

  const buildAliveTokenIndex = (tokens)=> {
    const alive= [];
    const bySide = new Map();
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      if (!token?.alive) continue;
      alive.push(token);
      const side = token.side;
      const bucket = bySide.get(side);
      if (bucket) {
        bucket.push(token);
      } else {
        bySide.set(side, [token]);
      }
    }
    return { alive, bySide };
  };

  // Thực thi Ult: Summoner -> Immediate Summon theo meta; class khác: trừ nộ
  function performUlt(unit){
    const game = getInitializedGame();
    if (!game){
      setFury(unit, 0);
      return;
    }

    if (isUyenLeader(unit)) {
      const casted = performUyenLeaderUlt(game, unit);
      if (casted) {
        extendBusy(900);
      }
      return;
    }

    const metaGetter = game.meta?.get;
    const meta = typeof metaGetter === 'function' ? metaGetter.call(game.meta, unit.id) ;
    if (!meta) { setFury(unit, 0); return; }

    const slot = slotIndex(unit.side, unit.cx, unit.cy);

    const summonSpecRaw = meta.class === 'Summoner' ? getSummonSpec(meta) ;
    const summonSpec = meta.class === 'Summoner' ? coerceSummonSpec(summonSpecRaw) ;
    if (summonSpec){
      summonSpec.pattern = typeof summonSpec.pattern === 'string'
        ? (summonSpec.pattern.trim() || undefined)
        ;
    }
    if (runRuntimeUlt({ game, caster)) {
      return;
    }

    if (meta.class === 'Summoner' && summonSpec){
      const allTokens = game.tokens || [];
      const queued = game.queued || { ally: new Map(), enemy) };
      const slotsSource = summonSpec /* as Parameters<typeof resolveSummonSlots>[0 */];
      const resolvedSlots = resolveSummonSlots(slotsSource, slot);
      const patternSlots= [];
      for (const rawSlot of resolvedSlots){
        if (typeof rawSlot !== 'number' || !Number.isFinite(rawSlot)) continue;
        const { cx, cy } = slotToCell(unit.side, rawSlot);
        if (cellReserved(allTokens, queued, cx, cy)) continue;
        patternSlots.push(rawSlot);
      }
      patternSlots.sort((a, b) => a - b);

      const desired = parseFiniteNumber(summonSpec.count) ?? (patternSlots.length || 1);
      const need = Math.min(patternSlots.length, Math.max(0, desired));

      if (need > 0){
        const limit = parseFiniteNumber(summonSpec.limit) ?? Infinity;
        const have = countAliveMinionsOf(unit.iid);
        const over  = Math.max(0, have + need - limit);
        const replacePolicy = typeof summonSpec.replace === 'string' ? summonSpec.replace.trim().toLowerCase() ;
        if (over > 0 && replacePolicy === 'oldest') removeOldestMinions(unit.iid, over);

        const inheritStats = creepStatsFromInherit(unit, summonSpec.inherit);
        const ttlBase = parseFiniteNumber(summonSpec.ttlTurns ?? summonSpec.ttl);

        for (let i = 0; i < need; i++){
          const s = patternSlots[i];
          const base = (summonSpec.creep ?? {}) /* as SummonCreepSpec */;
          const spawnTtl = parseFiniteNumber(base.ttlTurns ?? base.ttl) ?? ttlBase;
          const creepId = typeof base.id === 'string' && base.id.trim() ? base.id : `${unit.id}_minion`;
          const creepName = typeof base.name === 'string' && base.name.trim()
            ? base.name
            : (typeof base.label === 'string' && base.label.trim() ? base.label : 'Creep');
          const creepColor = typeof base.color === 'string' && base.color.trim() ? base.color : '#ffd27d';
          const ttlTurns = Math.max(1, Math.round(parseFiniteNumber(spawnTtl) ?? 3));
          enqueueImmediate(game, {
            by: unit.id,
            side,
            slot,
            unit,
              name,
              color,
              isMinion== false,
              ownerIid,
              bornSerial,
              ttlTurns,
              ...inheritStats
            }
          });
        }
      }
      setFury(unit, 0);
      return;
    }

    const u = coerceUlt(meta.kit?.ult);
    if (!u){ spendFury(unit, resolveUltCost(unit)); return; }
    const ultTurnsFallback = parseFiniteNumber(u.turns) ?? 1;

    const foeSide = unit.side === 'ally' ? 'enemy' : 'ally';
    if (runPveRuntimeUltHook({
      game,
      unit,
      ultSkill,
      extendBusy,
    })) {
      return;
    }
    const normalizedUltTags = getNormalizedUltTags(u);
    dispatchGameplayTags(normalizedUltTags, {
      game,
      attacker,
      target, unit),
      cost, CFG),
      side,
      payload,
    });
    
    const allTokens = game.tokens || [];
    let aliveIndex= null;
    const getAliveBySide = (side)=> {
      if (!aliveIndex) {
        aliveIndex = buildAliveTokenIndex(allTokens);
      }
      return aliveIndex.bySide.get(side) ?? [];
    };
    const applySelfDamageAsUltCost = (amount)=> {
      if (!Number.isFinite(amount) || amount <= 0) return;
      applyDamage(unit, amount);
      gainFury(unit, {
        type: 'damageTaken',
        dealt,
        selfMaxHp) ? unit.hpMax : undefined,
        damageTaken,
      });
      finishFuryHit(unit);
    };

    let busyMs = 900;
    let sessionVfxCache;
    const getSessionVfx = ()=> {
      if (sessionVfxCache !== undefined) return sessionVfxCache;
      sessionVfxCache = ensureSessionWithVfx(game, { requireGrid: true });
      return sessionVfxCache;
    };
    const runSafeVfx = (effect) => unknown)=> {
      const sessionVfx = getSessionVfx();
      if (!sessionVfx) return;
      try { effect(sessionVfx); } catch (_){}
    };
    const addHitVfx = (target)=> {
      runSafeVfx((sessionVfx) => vfxAddHit(sessionVfx, target));
    };

    switch(u.type){
      case 'drain': {
        const foes = getAliveBySide(foeSide);
        if (!foes.length) break;
        const scale = parseFiniteNumber(u.power) ?? 1.2;
        let totalDrain = 0;
        for (const tgt of foes){
          if (!tgt.alive) continue;
          const base = Math.max(1, Math.round((unit.wil || 0) * scale));
          const { dealt } = dealAbilityDamage(game, unit, tgt, {
            base,
            dtype,
            attackType);
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
        const hpTradePctRaw = parseFiniteNumber(u.hpTradePercent ?? u.hpTrade?.percentMaxHP) ?? 0;
        const hpTradePct = Math.max(0, Math.min(0.95, hpTradePctRaw));
        const hpMax = Number.isFinite(unit.hpMax) ? unit.hpMax : 0;
        const currentHp = Number.isFinite(unit.hp) ? unit.hp : 0;
        const desiredTrade = Math.round(hpMax * hpTradePct);
        const maxLoss = Math.max(0, currentHp - 1);
        const hpPayment = Math.max(0, Math.min(desiredTrade, maxLoss));
        applySelfDamageAsUltCost(hpPayment);

        const foes = getAliveBySide(foeSide);

        const hits = getUltHitCount(u);
        const selected= [];
        const selectedSet = new Set();
        if (foes.length){
          const primary = pickTarget(game, unit);
          if (primary){
            selected.push(primary);
            selectedSet.add(primary);
          }
          const nearestPool = pickNearestAliveUnits(foes, unit, Math.max(0, hits - selected.length), selectedSet);
          for (const enemy of nearestPool){
            if (selected.length >= hits) break;
            selected.push(enemy);
            selectedSet.add(enemy);
          }
          if (selected.length > hits) selected.length = hits;
          if (!selected.length && foes.length){
            selected.push(foes[0]);
          }
        }
        const applyBusyFromVfx = (startedAt, duration)=> {
          if (!Number.isFinite(startedAt) || !Number.isFinite(duration)) return;
          const resolved = duration /* as number */;
          busyMs = Math.max(busyMs, resolved);
          if (game.turn){
            game.turn.busyUntil = mergeBusyUntil(game.turn.busyUntil, startedAt, resolved);
          }
        };

        const bindingKey = 'huyet_hon_loi_quyet';

        const runBurstVfx = (
          effect) => number | null | undefined,
        )=> {
          const sessionVfx = getSessionVfx();
          if (!sessionVfx) return;
          const startedAt = sessionNow();
          try {
            const dur = effect(sessionVfx);
            applyBusyFromVfx(startedAt, dur);
          } catch (_) {}
        };

        runBurstVfx((session) => vfxAddBloodPulse(session, unit, {
          bindingKey,
          timing));

        const damageSpec = (u.damage ?? {}) /* as UltDamageSpec */;
        const dtype = typeof damageSpec.type === 'string' && damageSpec.type ? damageSpec.type : 'arcane';
        const attackType = u.countsAsBasic ? 'basic' : 'skill';
        const wilScale = parseFiniteNumber(damageSpec.scaleWIL ?? damageSpec.scaleWil) ?? 0;
        const flatAdd = parseFiniteNumber(damageSpec.flat ?? damageSpec.flatAdd) ?? 0;
        const pctDefault = parseFiniteNumber(damageSpec.percentTargetMaxHP ?? damageSpec.basePercentMaxHPTarget) ?? 0;
        const bossPct = parseFiniteNumber(damageSpec.bossPercent);
        const defPen = parseFiniteNumber(damageSpec.defPen ?? damageSpec.pen) ?? 0;
        const debuffSpec = u.appliesDebuff ?? null;
        const debuffId = typeof debuffSpec?.id === 'string' && debuffSpec.id ? debuffSpec.id : 'loithienanh_spd_burn';
        const debuffAmount = parseFiniteNumber(debuffSpec?.amount ?? debuffSpec?.amountPercent) ?? 0;
        const debuffMaxStacks = Math.max(1, Math.round(parseFiniteNumber(debuffSpec?.maxStacks) ?? 1));
        const debuffDuration = Math.max(1, Math.round(parseFiniteNumber(debuffSpec?.turns) ?? getUltDurationTurns(u, ultTurnsFallback)));

        for (const tgt of selected){
          if (!tgt || !tgt.alive) continue;
          const tgtRank = game.meta?.rankOf?.(tgt.id) || tgt?.rank || '';
          const isBoss = typeof tgtRank === 'string' && tgtRank.toLowerCase() === 'boss';
          const pct = isBoss ? (bossPct ?? pctDefault) ;
          const baseFromPct = Math.round(Math.max(0, pct) * Math.max(0, tgt.hpMax || 0));
          const baseFromWil = Math.round(Math.max(0, wilScale) * Math.max(0, unit.wil || 0));
          const baseFlat = Math.round(Math.max(0, flatAdd));
          const base = Math.max(1, baseFromPct + baseFromWil + baseFlat);
          dealAbilityDamage(game, unit, tgt, {
            base,
            dtype,
            attackType,
            defPen
          });

          runBurstVfx((session) => vfxAddLightningArc(session, unit, tgt, {
            bindingKey,
            timing,
            targetBindingKey,
            targetTiming));

          if (debuffAmount && tgt.alive){
            const existing = Statuses.get(tgt, debuffId);
            if (existing){
              existing.stacks = Math.min(debuffMaxStacks, (existing.stacks || 1) + 1);
              if (Number.isFinite(debuffDuration)) existing.dur = debuffDuration;
            } else {
              Statuses.add(tgt, {
                id: debuffId,
                kind,
                tag,
                attr,
                mode,
                amount,
                stacks,
                maxStacks,
                dur) ? debuffDuration : undefined,
                tick,
                sourceUnitId,
              });
            }
            if (typeof tgt._recalcStats === 'function') tgt._recalcStats();
          }
        }

         runBurstVfx((session) => vfxAddGroundBurst(session, unit, {
          bindingKey,
          anchorId,
          timing));

        runBurstVfx((session) => vfxAddGroundBurst(session, unit, {
          bindingKey,
          anchorId,
          timing));

        runBurstVfx((session) => vfxAddShieldWrap(session, unit, {
          bindingKey,
          anchorId,
          timing));

        const reduceDmg = parseFiniteNumber(u.reduceDmg);
        if (reduceDmg && reduceDmg > 0){
          const turns = getUltDurationTurns(u, ultTurnsFallback);
          const damageCut = makeStatusEffect('damageCut', { pct: reduceDmg, turns });
          if (damageCut) {
            Statuses.add(unit, { ...damageCut, sourceUnitId);
          }
        }

        busyMs = Math.max(busyMs, 1600);
        break;
      }

      case 'strikeLaneMid': {
        const primary = pickTarget(game, unit);
        if (!primary) break;
        const laneX = primary.cx;
        const foes = getAliveBySide(foeSide);
        const laneTargets= [];
        for (let index = 0; index < foes.length; index += 1) {
          const enemy = foes[index];
          if (enemy.cx === laneX) laneTargets.push(enemy);
        }
        const hits = getUltHitCount(u);
        const scale = parseFiniteNumber(u.scale) ?? 0.9;
        const meleeDur = parseFiniteNumber(CFG?.ANIMATION?.meleeDurationMs) ?? 2000;
        runSafeVfx((sessionVfx) => vfxAddMelee(sessionVfx, unit, primary, { dur: meleeDur }));
        busyMs = Math.max(busyMs, meleeDur);
        for (const enemy of laneTargets){
          if (!enemy.alive) continue;
          for (let h=0; h<hits; h++){
            if (!enemy.alive) break;
            let base = Math.max(1, Math.round((unit.atk || 0) * scale));
            const bonusVsLeader = parseFiniteNumber(u.bonusVsLeader) ?? 0;
            if (bonusVsLeader && (enemy.id === 'leaderA' || enemy.id === 'leaderB')){
              base = Math.round(base * (1 + bonusVsLeader));
            }
            dealAbilityDamage(game, unit, enemy, {
              base,
              dtype,
              attackType,
              defPen) ?? 0
            });
          }
        }
        break;
      }

      case 'selfBuff': {
        const tradePct = Math.max(0, Math.min(0.9, parseFiniteNumber(u.selfHPTrade) ?? 0));
        const pay = Math.round((unit.hpMax || 0) * tradePct);
        const maxPay = Math.max(0, Math.min(pay, Math.max(0, (unit.hp || 0) - 1)));
        applySelfDamageAsUltCost(maxPay);
        const reduce = Math.max(0, parseFiniteNumber(u.reduceDmg) ?? 0);
        if (reduce > 0){
          const turns = getUltDurationTurns(u, ultTurnsFallback);
          const damageCut = makeStatusEffect('damageCut', { pct: reduce, turns });
          if (damageCut) {
            Statuses.add(unit, { ...damageCut, sourceUnitId);
          }
        }
        addHitVfx(unit);
        busyMs = 800;
        break;
      }

      case 'sleep': {
        const foes = getAliveBySide(foeSide);
        if (!foes.length) break;
        const take = Math.max(1, Math.min(foes.length, getUltScopedCount(u, foes.length, 'targets')));
        const nearestTargets = pickNearestAliveUnits(foes, unit, take);
        const turns = getUltDurationTurns(u, ultTurnsFallback);
        for (let i=0; i<nearestTargets.length; i++){
          const tgt = nearestTargets[i];
          if (!tgt) continue;
          const sleep = makeStatusEffect('sleep', { turns });
          if (sleep) {
            Statuses.add(tgt, { ...sleep, sourceUnitId);
          }
          addHitVfx(tgt);
        }
        busyMs = 1000;
        break;
      }

      case 'revive': {
        const fallen = collectRecentlyFallenAllies(allTokens, unit.side);
        if (!fallen.length) break;
        const take = Math.max(1, Math.min(fallen.length, getUltScopedCount(u, 1, 'targets')));
        const allies = getAliveBySide(unit.side);
        const sideLeader = allies.find((token) => isUyenLeader(token));
        for (let i=0; i<take; i++){
          const ally = fallen[i];
          if (!ally) continue;
          if (ally.id !== unit.id && readTokenTags(ally).includes('divine-nature')) continue;
          ally.alive = true;
          ally.deadAt = 0;
          ally.hp = 0;
          Statuses.purge(ally);
          const revivedHp = parseFiniteNumber(u.revived?.hpPercent ?? u.revived?.hpPct) ?? 0.5;
          const hpPct = Math.max(0, Math.min(1, revivedHp));
          const healAmt = Math.max(1, Math.round((ally.hpMax || 0) * hpPct));
          healUnit(ally, healAmt);
          setFury(ally, Math.max(0, parseFiniteNumber(u.revived?.rage) ?? 0));
          if (u.revived?.lockSkillsTurns){
            const silenceTurns = Math.max(1, Math.round(parseFiniteNumber(u.revived.lockSkillsTurns) ?? 1));
            const silence = makeStatusEffect('silence', { turns: silenceTurns });
            if (silence) {
              Statuses.add(ally, { ...silence, sourceUnitId);
            }
          }
          runSafeVfx((sessionVfx) => vfxAddSpawn(sessionVfx, ally.cx, ally.cy, ally.side));
          grantUyenSummonRage(sideLeader, { revived: true, isMinion);
        }
        busyMs = 1500;
        break;
      }

      case 'equalizeHP': {
        let allies = getAliveBySide(unit.side);
        if (!allies.length) break;
        allies.sort((a,b)=>{
          const ra = (a.hpMax || 1) ? (a.hp || 0) / a.hpMax : 0;
          const rb = (b.hpMax || 1) ? (b.hp || 0) / b.hpMax : 0;
          return ra - rb;
        });
        const count = Math.max(1, Math.min(allies.length, getUltScopedCount(u, allies.length, 'allies')));
        const selected = allies.slice(0, count);
        if (u.healLeader){
          const leaderId = unit.side === 'ally' ? 'leaderA' : 'leaderB';
          const leader = allies.find(t => t.id === leaderId);
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
            addHitVfx(tgt);
          }
        }
        busyMs = 1000;
        break;
      }

      case 'haste': {
        const targets = new Set();
        targets.add(unit);
        const extraAllies = Math.max(0, getUltScopedCount(u, 1, 'targets') - 1);
        const allies = getAliveBySide(unit.side);
        const others = allies.filter(t => t !== unit);
        const turns = getUltDurationTurns(u, ultTurnsFallback);
        others.sort((a,b)=> (a.spd||0) - (b.spd||0));
        for (const ally of others){
          if (targets.size >= extraAllies + 1) break;
          targets.add(ally);
        }
        const pct = parseFiniteNumber(u.attackSpeed) ?? 0.1;
        for (const tgt of targets){
          const haste = makeStatusEffect('haste', { pct, turns });
          if (haste) {
            Statuses.add(tgt, { ...haste, sourceUnitId);
          }
          addHitVfx(tgt);
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
  const aliveTokenScratch= [];
  const fallenTokenScratch= [];

  const collectRecentlyFallenAllies = (
    tokens,
    side,
  )=> {
    fallenTokenScratch.length = 0;
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      if (!token || token.side !== side || token.alive) continue;
      fallenTokenScratch.push(token);
    }
    fallenTokenScratch.sort((a, b) => (b.deadAt || 0) - (a.deadAt || 0));
    return fallenTokenScratch;
  };

  const getAliveTokensScratch = ()=> {
    aliveTokenScratch.length = 0;
    const tokens = Game?.tokens;
    if (!Array.isArray(tokens) || !tokens.length) return aliveTokenScratch;
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      if (token?.alive) aliveTokenScratch.push(token);
    }
    return aliveTokenScratch;
  };

  function ensureBattleState(game) | null){
    if (!game || typeof game !== 'object') return null;
    if (!game.battle || typeof game.battle !== 'object'){
      game.battle = {
        over: false,
        winner,
        reason,
        detail,
        finishedAt,
        result,
      } /* as BattleState */;
    }
    if (typeof game.result === 'undefined'){
      game.result = null;
    }
    if (!Object.prototype.hasOwnProperty.call(game.battle, 'result')){
      (game.battle /* as BattleState */).result = null;
    }
    return game.battle /* as BattleState */;
  }

  function isUnitAlive(unit){
    if (!unit) return false;
    if (!unit.alive) return false;
    if (Number.isFinite(unit.hp)){
      return unit.hp > 0;
    }
    return true;
  }

  function getHpRatio(unit){
    if (!unit) return 0;
    const hp = Number.isFinite(unit.hp) ? unit.hp : 0;
    const hpMax = Number.isFinite(unit.hpMax) ? unit.hpMax : 0;
    if (hpMax > 0){
      return Math.max(0, Math.min(1, hp / hpMax));
    }
    return hp > 0 ? 1 : 0;
  }

  function resolveBattlefieldSnapshot(
    game,
  ){
    leaderA: UnitToken | null;
    leaderB: UnitToken | null;
    bossAlive: boolean;
  } {
    const tokens = Array.isArray(game.tokens) ? game.tokens : [];
    let leaderA= null;
    let leaderB= null;
    let bossAlive = false;

    for (const token of tokens) {
      if (!token) continue;

      if (!leaderA && (token.id === 'leaderA' || slotIndex('ally', token.cx, token.cy) === 8)) {
        leaderA = token;
      }
      if (!leaderB && (token.id === 'leaderB' || slotIndex('enemy', token.cx, token.cy) === 8)) {
        leaderB = token;
      }
      if (!bossAlive && token.alive && token.side === 'enemy' && isBossToken(game, token)) {
        bossAlive = true;
      }

      if (leaderA && leaderB && bossAlive) break;
    }

    return { leaderA, leaderB, bossAlive };
  }

  function snapshotLeader(unit){
    if (!unit) return null;
    return {
      id: unit.id || null,
      side,
      alive,
      hp) ? Math.max(0, unit.hp) 
      hpMax: Number.isFinite(unit.hpMax) ? Math.max(0, unit.hpMax) 
    };
  }

  function isBossToken(
    game) | null,
    token,
  ){
    if (!token) return false;
    if (token.isBoss) return true;
    const rankRaw = typeof token.rank === 'string' && token.rank ? token.rank : (game?.meta?.rankOf?.(token.id) || '');
    const rank = typeof rankRaw === 'string' ? rankRaw.toLowerCase() ;
    return rank === 'boss';
  }

  function isPvpMode(game) | null){
    const key = (game?.modeKey || '').toString().toLowerCase();
    if (!key) return false;
    if (key === 'ares') return true;
    return key.includes('pvp');
  }

  function finalizeBattle(
    game) | null,
    payload,
    context, unknown>,
  ){
    const battle = ensureBattleState(game);
    if (!battle || battle.over) return battle?.result || null;
    const finishedAtRaw = payload?.finishedAt;
    const finishedAt = typeof finishedAtRaw === 'number' && Number.isFinite(finishedAtRaw)
      ? finishedAtRaw
      : sessionNow();
    const result= {
      winner: payload?.winner ?? null,
      reason,
      detail,
      finishedAt
    };
    battle.over = true;
    battle.winner = result.winner;
    battle.reason = result.reason;
    battle.detail = result.detail;
    battle.finishedAt = finishedAt;
    battle.result = result;
    if (game) game.result = result;
    if (game?.turn){
      game.turn.completed = true;
      game.turn.busyUntil = mergeBusyUntil(game.turn.busyUntil, finishedAt, 0);
    }
    if (game === Game){
      running = false;
      clearSessionTimers();
      try {
        if (hud && typeof hud.update === 'function' && Game) hud.update(Game);
      } catch (_) {}
      scheduleDraw();
    }
    if (game){
      emitGameEvent(BATTLE_END, { game, result, context });
    }
    return result;
  }

  function checkBattleEndResult(
    game) | null,
    context, unknown> = {},
  ){
    if (!game) return null;
    const battle = ensureBattleState(game);
    if (!battle) return null;
    if (battle.over) return battle.result || null;

    const { leaderA, leaderB, bossAlive } = resolveBattlefieldSnapshot(game);
    const leaderAAlive = isUnitAlive(leaderA);
    const leaderBAlive = isUnitAlive(leaderB);

    const normalizedContext=
      context && typeof context === 'object' ? context : {};
    const triggerValue = normalizedContext['trigger'];
    const trigger = typeof triggerValue === 'string' ? triggerValue : null;
    const leaderAHpRatio = getHpRatio(leaderA);
    const leaderBHpRatio = getHpRatio(leaderB);
    const threshold = 0.3;
    const shouldCheckAlly = !leaderAAlive || leaderAHpRatio <= threshold;
    const shouldCheckEnemy = !leaderBAlive || leaderBHpRatio <= threshold;
    leaderEndCheckFlags = {
      ally: shouldCheckAlly,
      enemy,
    };

    let winner= null;
    let reason= null;

    if (!leaderAAlive || !leaderBAlive){
      reason = 'leader_down';
      if (leaderAAlive && !leaderBAlive) winner = 'ally';
      else if (!leaderAAlive && leaderBAlive) winner = 'enemy';
      else winner = 'draw';
  } else if (trigger === 'timeout'){
      reason = 'timeout';
      const remainRaw = normalizedContext['remain'];
      const remainCandidate = typeof remainRaw === 'number' ? remainRaw : Number(remainRaw);
      const remain = Number.isFinite(remainCandidate) ? remainCandidate : 0;
      if (isPvpMode(game)){
        if (leaderAHpRatio > leaderBHpRatio) winner = 'ally';
        else if (leaderBHpRatio > leaderAHpRatio) winner = 'enemy';
        else winner = 'draw';
      } else {
        winner = bossAlive ? 'enemy' : 'ally';
      }
    }

    if (!winner) return null;

    const contextDetail= { ...normalizedContext };
    contextDetail['leaderCheckFlags'] = { ...leaderEndCheckFlags };
    const detail= {
      context: contextDetail,
      leaders),
        enemy)
      }
    };
    if (trigger === 'timeout'){
      const remainRaw = normalizedContext['remain'];
      const remainCandidate = typeof remainRaw === 'number' ? remainRaw : Number(remainRaw);
      const remain = Number.isFinite(remainCandidate) ? remainCandidate : 0;
      if (isPvpMode(game)) {
        detail.timeout = {
          mode: 'pvp',
          remain,
          hpRatio, enemy= {
          mode: 'pve',
          remain,
          bossAlive
        };
      }
    }

    const timestampRaw = normalizedContext['timestamp'];
    const timestampCandidate = typeof timestampRaw === 'number' ? timestampRaw : Number(timestampRaw);
    const finishedAt = Number.isFinite(timestampCandidate)
      ? normalizeAnimationFrameTimestamp(timestampCandidate)
      ;
    return finalizeBattle(game, { winner, reason, detail, finishedAt }, contextDetail);
  }
  function resolveAllyLeaderForControl(){
    const tokens = Game?.tokens;
    if (!Array.isArray(tokens)) return null;
    let fallback= null;
    for (let i = 0; i < tokens.length; i += 1){
      const token = tokens[i];
      if (!token || token.side !== 'ally' || !isUyenLeader(token)) continue;
      if (token.alive) return token;
      if (!fallback) fallback = token;
    }
    return fallback;
  }

  function syncLeaderUltControls(){
    if (!leaderUltControlsEl) return;
    const leader = resolveAllyLeaderForControl();
    const show = Boolean(leader && leader.alive && isAnyLeaderUltReady(leader));

    if (!show || !leader) {
      const hiddenFingerprint = 'hidden';
      if (leaderUltControlsFingerprint === hiddenFingerprint) return;
      leaderUltControlsEl.hidden = true;
      for (const button of leaderUltButtons){
        if (!button) continue;
        button.disabled = true;
        button.setAttribute('aria-disabled', 'true');
        button.classList.remove('is-selected');
      }
      leaderUltControlsFingerprint = hiddenFingerprint;
      return;
    }

    const selected = getUyenUltChoice(leader);
    const readyA = canCastLeaderUltChoice(leader, 'A');
    const readyB = canCastLeaderUltChoice(leader, 'B');
    const readyC = canCastLeaderUltChoice(leader, 'C');
    const state = ensureUyenState(leader);
    const fury = Math.max(0, Math.floor(parseFiniteNumber(leader.fury) ?? 0));
    const furyMax = Math.max(1, Math.floor(parseFiniteNumber(leader.furyMax) ?? 100));
    const bUses = state?.bUses ?? 0;
    const fingerprint = [
      leader.iid ?? 0,
      fury,
      furyMax,
      bUses,
      selected,
      readyA ? 1 : 0,
      readyB ? 1 : 0,
      readyC ? 1 : 0,
      leaderUltButtons.length,
    ].join('|');
    if (leaderUltControlsFingerprint === fingerprint) return;

    leaderUltControlsEl.hidden = false;
    for (const button of leaderUltButtons){
      if (!button) continue;
      const choice = button.dataset.ultChoice;
      const ready = choice === 'A'
        ? readyA
        : (choice === 'B'
          ? readyB
          : (choice === 'C' ? readyC : false));
      button.classList.toggle('is-selected', choice === selected);
      button.disabled = !ready;
      button.setAttribute('aria-disabled', ready ? 'false' : 'true');
    }
    leaderUltControlsFingerprint = fingerprint;
  }

  function init(){
    if (!Game) return false;
    if (Game._inited) return true;
    const doc = docRef ?? (typeof document !== 'undefined' ? document : null);
    if (!doc) return false;
    const root = rootElement ?? null;
    const boardFromRoot = (root && typeof (root /* as ParentNode */).querySelector === 'function')
      ? (root /* as ParentNode */).querySelector('#board')
      ;
    const boardFromDocument = typeof doc.querySelector === 'function'
      ? doc.querySelector('#board')
    === 'function'
        ? doc.getElementById('board')
        ;
    const boardEl = (boardFromRoot ?? boardFromDocument) /* as HTMLCanvasElement | null */;
    if (!boardEl){
      return false;
    }
    canvas = boardEl;
    ctx = boardEl.getContext('2d') /* as CanvasRenderingContext2D | null */;
    if (!ctx){
      console.warn('[pve] Không thể lấy ngữ cảnh 2D cho canvas PvE.');
      return false;
    }

    if (typeof hudCleanup === 'function'){
      hudCleanup();
      hudCleanup = null;
    }
    hud = initHUD(doc, root ?? undefined);
    const currentHud = hud;
    hudCleanup = currentHud ? () => currentHud.cleanup() ;

    const controlsFromRoot = (root && typeof (root /* as ParentNode */).querySelector === 'function')
      ? (root /* as ParentNode */).querySelector('[data-role="leader-ult-controls"]')
      ;
    const controlsFromDocument = typeof doc.querySelector === 'function'
      ? doc.querySelector('[data-role="leader-ult-controls"]')
      ;
    leaderUltControlsEl = (controlsFromRoot ?? controlsFromDocument) /* as HTMLElement | null */;
    leaderUltControlsFingerprint = null;
    leaderUltButtons = leaderUltControlsEl
      ? Array.from(leaderUltControlsEl.querySelectorAll('button[data-ult-choice]'))
      ;
    for (const button of leaderUltButtons){
      button.onclick = () => {
        const choice = button.dataset.ultChoice;
        if (choice !== 'A' && choice !== 'B' && choice !== 'C') return;
        const leader = resolveAllyLeaderForControl();
        if (!leader || !leader.alive || !canCastLeaderUltChoice(leader, choice)) return;
        queueUyenUltCast(leader, choice);
        syncLeaderUltControls();
      };
    }
    syncLeaderUltControls();
    const tokens = Array.isArray(Game.tokens) ? Game.tokens : [];
    if (!Array.isArray(Game.tokens)){
      Game.tokens = tokens;
    }

    resize();

    let spawnGrid= (Game.grid ?? null) /* as GridSpec | null */;
    if (!spawnGrid){
      const parsedCols = parseFiniteNumber(CFG?.GRID_COLS);
      const parsedRows = parseFiniteNumber(CFG?.GRID_ROWS);
      const fallbackCols = parsedCols !== null && parsedCols > 0
        ? Math.max(1, Math.floor(parsedCols))
        ;
      const fallbackRows = parsedRows !== null && parsedRows > 0
        ? Math.max(1, Math.floor(parsedRows))
        ;
      spawnGrid = makeGrid(canvas ?? null, fallbackCols, fallbackRows);
    }

    if (spawnGrid){
      spawnLeaders(tokens, spawnGrid);
      if (!Game.grid){
        Game.grid = spawnGrid;
      }
    }

    const sessionVfx = ensureSessionWithVfx(Game, { requireGrid: true });
    if (sessionVfx){
      for (const t of tokens){
        if (t.id === 'leaderA' || t.id === 'leaderB'){
          try { vfxAddSpawn(sessionVfx, t.cx, t.cy, t.side); } catch(_){}
        }
      }
    }
    for (const t of tokens){
      if (!t.iid) t.iid = nextIid();
      if (t.id === 'leaderA' || t.id === 'leaderB'){
        Object.assign(t, {
          hpMax: 2600,
          hp,
          arm,
          res,
          atk,
          wil,
          aeMax,
          ae,
        });
        initializeFury(t, t.id, 0);
      }
    }
    if (Game.tokens) { globalAetherPool.init(Game.tokens);
    }

    if (hud) hud.update(Game);
    scheduleDraw();
    leaderEndCheckFlags = { ally: false, enemy= true;

    refillDeck();
    refillDeckEnemy(Game);

    cleanupSummonBar();
    const barHandle = startSummonBar(doc, {
      onPick: handleSummonBarPick,
      canAfford,
      getDeck,
      getSelectedId)=> {
        const game = getInitializedGame();
        return game ? game.selectedId : null;
      },
    }, root ?? undefined);
    summonBarHandle = barHandle;
    Game.ui.bar = barHandle;

    selectFirstAffordable();
    renderSummonBar();
    resolveTimerElement();

    const stepTurnContext = {
      performUlt,
      processActionChain,
      allocIid,
      doActionOrSkip,
      checkBattleEnd(gameState, info, unknown>) {
        return Boolean(checkBattleEndResult(gameState, info));
      },
    };
    const battleCheckInfo; timestamp: number; remain: number } = {
      trigger: 'leader-immediate',
      timestamp,
    };
    const runBattleEndCheck = (
      trigger,
      timestamp,
      remain?,
    )=> {
      battleCheckInfo.trigger = trigger;
      battleCheckInfo.timestamp = timestamp;
      if (typeof remain === 'number') {
        battleCheckInfo.remain = remain;
      } else {
        delete battleCheckInfo.remain;
      }
      return checkBattleEndResult(Game, battleCheckInfo);
    };

    sessionLoopController = createSessionLoopController({
      getGame: () => Game,
      isRunning) => running,
      isBattleOver) => Boolean(game.battle?.over),
      resolveTurnIntervalMs,
      normalizeTurnBusyUntil,
      runBattleEndCheck,
      getTimerElement) => timerElement,
      resolveTimerElement,
      applyCostGain,
      onHudUpdate) => {
        if (hud) hud.update(game);
      },
      onDeckReevaluate,
      onRenderSummonBar,
      onSyncLeaderUltControls,
      onBoardMutation,
      processCreepDeathHealing,
      cleanupDead,
      stepTurnContext,
      getRequestAnimationFrame,
      getCancelAnimationFrame,
      logError, error) => {
        console.error(message, error);
      },
      supportsPerfNow,
    });

    sessionLoopController.startLoop();
    return true;
  }

  /* ---------- Vẽ ---------- */
  function resize(){
    if (!canvas || !Game) return;                         // guard
    const prevGrid = Game?.grid ? {
      w: Game.grid.w,
      h,
      dpr,
      cols,
      rows,
      tile,
      ox,
      oy,
      pad,
      pixelW,
      pixelH,
      pixelArea,
    } ;
    Game.grid = makeGrid(canvas, CFG.GRID_COLS, CFG.GRID_ROWS);
    if (ctx && Game.grid){
      const maxDprCfg = CFG.UI?.MAX_DPR;
      const maxDpr = Number.isFinite(maxDprCfg) && maxDprCfg > 0 ? maxDprCfg : 3;
      const view = winRef ?? (typeof window !== 'undefined' ? window : null);
      let viewDprRaw = 1;
      if (view && Number.isFinite(view.devicePixelRatio) && view.devicePixelRatio > 0){
        viewDprRaw = view.devicePixelRatio;
      }
      const fallbackDpr = Math.min(maxDpr, viewDprRaw);
      const gridDpr = Number.isFinite(Game.grid.dpr) && Game.grid.dpr > 0
        ? Math.min(maxDpr, Game.grid.dpr)
        ;
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
      || prevGrid.tile !== g.tile
      || prevGrid.ox !== g.ox
      || prevGrid.oy !== g.oy
      || prevGrid.pad !== g.pad
      || prevGrid.pixelW !== g.pixelW
      || prevGrid.pixelH !== g.pixelH
      || prevGrid.pixelArea !== g.pixelArea;
    if (gridChanged){
      hpBarGradientCache.clear();
      invalidateSceneCache();
    }
  }
  function draw(){
    if (!ctx || !canvas || !Game?.grid) return;           // guard
    const clearW = Game.grid?.w ?? canvas.width;
    const clearH = Game.grid?.h ?? canvas.height;
    ctx.clearRect(0, 0, clearW, clearH);
    const camSignature = getCamPresetSignature(CAM_PRESET);
    if (camSignature !== lastCamPresetSignature) {
      lastCamPresetSignature = camSignature;
      invalidateSceneCache();
    }
    const cache = ensureSceneCache({
      game: Game,
      canvas,
      documentRef,
      camPreset);
    let gridDrawnViaScene = false;
    if (cache && cache.canvas){
      ctx.drawImage(cache.canvas, 0, 0, cache.pixelWidth, cache.pixelHeight, 0, 0, cache.cssWidth, cache.cssHeight);
      gridDrawnViaScene = !!cache.includesGrid;
    } else {
      const sceneCfg = CFG.SCENE || {};
      const themeKey = Game.sceneTheme || sceneCfg.CURRENT_THEME || sceneCfg.DEFAULT_THEME;
      const theme = (sceneCfg.THEMES && themeKey) ? sceneCfg.THEMES[themeKey] ;
      if (Game.grid) {
        drawBattlefieldScene(ctx, Game.grid, theme);
        drawEnvironmentProps(ctx, Game.grid, CAM_PRESET, Game.backgroundKey);
        drawGridOblique(ctx, Game.grid, CAM_PRESET);
        gridDrawnViaScene = true;
      }
    }
    let sessionVfx= null;
    let meleeOffsets= null;
    if (Game.grid){
      sessionVfx = ensureSessionWithVfx(Game, { requireGrid: true });
      if (sessionVfx){
        const computedOffsets = computeMeleeOffsets(sessionVfx, CAM_PRESET);
        syncMeleeOffsetTokens(computedOffsets);
        meleeOffsets = computedOffsets;
      } else {
        clearMeleeOffsetTokens();
      }
    } else {
      clearMeleeOffsetTokens();
   }
    if (Game.grid){
      if (!gridDrawnViaScene) {
        drawGridOblique(ctx, Game.grid, CAM_PRESET);
      }
      drawQueuedOblique(ctx, Game.grid, Game.queued, CAM_PRESET);
      const tokens = Game.tokens || [];
      if (meleeOffsets){
        drawTokensOblique(ctx, Game.grid, tokens, CAM_PRESET, { meleeOffsets });
      } else {
        drawTokensOblique(ctx, Game.grid, tokens, CAM_PRESET);
      }

      const aetherSyncStart = SUPPORTS_PERF_NOW ? performance.now() ;
      const canvasEl = canvas /* as HTMLCanvasElement */;
      const rect = canvasEl.getBoundingClientRect();
      const ratioX = rect.width / canvasEl.width;
      const ratioY = rect.height / canvasEl.height;
      const grid = Game?.grid;
      if (!grid) return;

      let allyLeaderAlive= null;
      let allyLeaderAny= null;
      let enemyLeaderAlive= null;
      let enemyLeaderAny= null;
      for (let i = 0; i < tokens.length; i += 1) {
        const token = tokens[i];
        if (!token) continue;
        if (token.id === 'leaderA') {
          if (token.alive && !allyLeaderAlive) allyLeaderAlive = token;
          if (!allyLeaderAny) allyLeaderAny = token;
        } else if (token.id === 'leaderB') {
          if (token.alive && !enemyLeaderAlive) enemyLeaderAlive = token;
          if (!enemyLeaderAny) enemyLeaderAny = token;
        }
        if ((allyLeaderAlive || allyLeaderAny) && (enemyLeaderAlive || enemyLeaderAny)) {
          if (allyLeaderAlive && enemyLeaderAlive) break;
        }
      }

      const allyLeader = allyLeaderAlive ?? allyLeaderAny;
      const enemyLeader = enemyLeaderAlive ?? enemyLeaderAny;

      const allyPos = projectLeaderGroundPos(allyLeader, 0, 1, { grid, rect, ratioX, ratioY });
      const enemyPos = projectLeaderGroundPos(enemyLeader, 6, 1, { grid, rect, ratioX, ratioY });
      const clampMargin = Math.max(12, Math.round(rect.width * 0.02));
      const halfTileAnchor = 0.5;
      const tilePxX = grid.tile * ratioX;
      const tilePxY = grid.tile * ratioY;
      const allyBackOffsetX = tilePxX * halfTileAnchor;
      const enemyBackOffsetX = tilePxX * halfTileAnchor;
      const allyBackOffsetY = tilePxY * 0.24;
      const enemyBackOffsetY = tilePxY * 0.24;

      // 5. Đồng bộ vị trí + đồng bộ bể AE chung theo đội hình sống
      globalAetherPool.syncAllVisuals(
         { x: allyPos.x, y, s,
         { x: enemyPos.x, y, s,
         tokens,
         {
           ally: {
             facing: 1,
              backOffsetX,
              backOffsetY,
              anchorLiftY) ? Math.max(0, (1 - allyPos.anchor!) * 10 * allyPos.s) 
             clamp: {
               minX: rect.left + clampMargin,
               maxX,
               minY,
               maxY,
             },
           },
           enemy,
             backOffsetX,
             backOffsetY,
              anchorLiftY) ? Math.max(0, (1 - enemyPos.anchor!) * 10 * enemyPos.s) 
             clamp: {
               minX: rect.left + clampMargin,
               maxX,
               minY,
               maxY,
             },
          },
        }
     );

     const aetherSyncEnd = SUPPORTS_PERF_NOW ? performance.now() ;
      emitAetherDebug(rect, aetherSyncEnd - aetherSyncStart);
    }
    if (sessionVfx){
      vfxDraw(ctx, sessionVfx, CAM_PRESET);
    }
    drawHPBars();
  }

  function getScreenPos(
    cx,
    cy,
    context){ x: number; y: number; s: number } {
    const { grid, rect, ratioX, ratioY } = context;
    const local = cellCenterObliqueLocal(grid, cx, cy, CAM_PRESET);
    return {
      x: rect.left + (local.x * ratioX),
      y),
      s,
    };
  }

  function resolveLeaderPivotAnchor(token){
    if (!token) return null;
    const spriteAnchor = Number((token.art?.sprite /* as { anchor: unknown } | null | undefined */)?.anchor);
    if (Number.isFinite(spriteAnchor)) return Math.max(0, Math.min(1, spriteAnchor));
    const layoutAnchor = Number((token.art?.layout /* as { anchor: unknown } | null | undefined */)?.anchor);
    if (Number.isFinite(layoutAnchor)) return Math.max(0, Math.min(1, layoutAnchor));
    return null;
  }

  function projectLeaderGroundPos(
    token,
    fallbackCx,
    fallbackCy,
    context,
  ){ x: number; y: number; s: number; anchor: number | null } {
    const projected = token
      ? getScreenPos(token.cx, token.cy, context)
      ;
    if (!token) return { ...projected, anchor= resolveLeaderPivotAnchor(token);
    if (!Number.isFinite(pivotAnchor)) {
      return { ...projected, anchor= (token.art?.layout /* as { spriteHeight: unknown } | null | undefined */) ?? null;
    const sprite = (token.art?.sprite /* as { scale: unknown } | null | undefined */) ?? null;
    const spriteHeightMult = Number.isFinite(Number(layout?.spriteHeight)) ? Number(layout?.spriteHeight) ;
    const spriteScale = Number.isFinite(Number(sprite?.scale)) ? Number(sprite?.scale) ;
    const artSize = Number.isFinite(Number(token.art?.size)) ? Number(token.art?.size) ;
    const radiusPx = Math.max(6, Math.floor(context.grid.tile * 0.36 * projected.s));
    const spriteHeightPx = radiusPx * spriteHeightMult * spriteScale * artSize;
    const anchorValue = pivotAnchor /* as number */;
    const footShiftY = spriteHeightPx * (1 - anchorValue);

    return {
      x: projected.x,
      y,
      s,
      anchor,
    };
  }

  function cellCenterObliqueLocal(g, cx, cy, C){ x: number; y: number; scale: number } {
    const colsW = g.tile * g.cols;
    const topScale = ((C?.topScale) ?? 0.80);
    const rowGap = ((C?.rowGapRatio) ?? 0.62) * g.tile;

    function rowLR(r){ left: number; right: number } {
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

  function getShieldRatio(unit){
    const shield = Statuses.get(unit, 'shield');
    const shieldAmount = Math.max(0, toFiniteOrZero((shield /* as { amount: unknown } | null */)?.amount));
    const hpMax = Math.max(1, toFiniteOrZero(unit.hpMax));
    return Math.max(0, Math.min(1, shieldAmount / hpMax));
  }

  const CO_TRUONG_PHONG_ID = 'co_truong_phong';

  function readCoTruongPhongFlyingSwordCount(token){
    if (token.id !== CO_TRUONG_PHONG_ID) return 0;
    const swords = Math.floor(toFiniteOrZero((token /* as UnitToken & { _coTruongPhongFlyingSwords: unknown } */)._coTruongPhongFlyingSwords));
    if (!Number.isFinite(swords) || swords <= 0) return 0;
    return swords;
  }

  const {
    resolveStatusIcons: resolveStatusIconsForToken,
  } = createStatusIconResolver({
    fallbackIconPath: DEFAULT_STATUS_ICON_PATH,
    getCacheEntry) => statusIconCache.get(nextIconId),
    setCacheEntry, entry) => {
      statusIconCache.set(nextIconId, entry);
    },
    createCacheEntry, nextIconPath) => createDefaultStatusIconEntry(nextIconId, nextIconPath),
    maxIcons,
    isIconReady,
  });

  function __resolveStatusIconPreview(statusesInput, unknown> | null | undefined>){ id: string; tooltip: string; priority: number }> {
    return resolveStatusIconPreview(statusesInput);
  }

  function drawHPBars(){
    if (!ctx || !Game?.grid) return;
    statusIconHitboxes.length = 0;
    const drawCtx = ctx;
    const baseR = Math.floor(Game.grid.tile * 0.36);
    const tokens = Game.tokens || [];
    const activeAttackKeys = collectActiveAttackTokenKeys(Array.isArray(Game?.vfx) ? Game.vfx : []);

    for (const t of tokens){
      if (!t.alive || !Number.isFinite(t.hpMax)) continue;
      const meleeKey = makeMeleeTokenKey(t);
      if (meleeKey && activeAttackKeys.has(meleeKey)) continue;

      const p = cellCenterObliqueLocal(Game.grid, t.cx, t.cy, CAM_PRESET);
      const art = t.art || getUnitArt(t.id, { skinKey: t.skinKey });
      const layout = (art?.layout /* as UnitArtLayout | Record<string */, unknown>) ?? {};
      const layoutRecord = layout /* as Record<string */, unknown>;
      const spriteRecord = (art?.sprite /* as Record<string */, unknown> | null | undefined) ?? null;

      const r = Math.max(6, Math.floor(baseR * (p.scale || 1)));
      const spriteHeightMult = parseFiniteNumber(layoutRecord.spriteHeight) ?? 2.4;
      const spriteScale = parseFiniteNumber(spriteRecord?.scale) ?? 1;
      const artSize = parseFiniteNumber(art?.size) ?? 1;
      const anchor = parseFiniteNumber(spriteRecord?.anchor) ?? parseFiniteNumber(layoutRecord.anchor) ?? 0.78;
      const spriteHeight = r * spriteHeightMult * artSize * spriteScale;

      const widthRatio = parseFiniteNumber(layoutRecord.hpWidth) ?? 1.55;
      const heightRatio = parseFiniteNumber(layoutRecord.hpHeight) ?? 0.22;
      const barWidth = Math.max(24, Math.floor(r * widthRatio));
      const barHeight = Math.max(4, Math.floor(r * heightRatio));
      const headY = p.y - spriteHeight * anchor;
      const hpY = Math.round(headY - Math.max(6, Math.floor(r * 0.34)) - barHeight);
      const hpX = Math.round(p.x - barWidth / 2);
      const statusIcons = resolveStatusIconsForToken(Array.isArray(t.statuses) ? t.statuses : []);
      const statusIconSize = Math.max(2, Math.floor(barHeight * 0.9));
      const statusIconGap = Math.max(1, Math.floor(statusIconSize * 0.2));
      const statusRowWidth = statusIcons.length > 0
        ? (statusIcons.length * statusIconSize) + ((statusIcons.length - 1) * statusIconGap)
        ;
      const statusY = hpY - statusIconSize - 2;
      const statusStartX = Math.round(hpX + (barWidth - statusRowWidth) / 2);

      const hpRatio = Math.max(0, Math.min(1, (t.hp || 0) / (t.hpMax || 1)));
      const shieldRatio = getShieldRatio(t);
      const swordCount = readCoTruongPhongFlyingSwordCount(t);

      const bgColor = art?.hpBar?.bg || 'rgba(9,14,21,0.86)';
      const fillColor = art?.hpBar?.fill || '#48d267';
      const borderColor = art?.hpBar?.border || 'rgba(0,0,0,0.62)';
      const radius = Math.max(2, Math.floor(barHeight / 2));

      drawCtx.save();
      drawCtx.shadowColor = 'transparent';
      drawCtx.shadowBlur = 0;

      roundedRectPath(drawCtx, hpX, hpY, barWidth, barHeight, radius);
      drawCtx.fillStyle = bgColor;
      drawCtx.fill();
      if (borderColor && borderColor !== 'none'){
        drawCtx.strokeStyle = borderColor;
        drawCtx.lineWidth = 1;
        drawCtx.stroke();
      }

      const inset = 1;
      const innerHeight = Math.max(1, barHeight - inset * 2);
      const innerRadius = Math.max(1, radius - inset);
      const innerWidth = Math.max(1, barWidth - inset * 2);
      const filledWidth = Math.round(innerWidth * hpRatio);
      if (filledWidth > 0){
        const fillStyle = resolveHpBarGradient({
          cache: hpBarGradientCache,
          context,
          fillColor,
          innerHeight,
          innerRadius,
          startY,
          x,
          lightenColor,
        });
        drawCtx.save();
        drawCtx.translate(hpX + inset, hpY + inset);
        roundedRectPath(drawCtx, 0, 0, filledWidth, innerHeight, innerRadius);
        drawCtx.fillStyle = fillStyle;
        drawCtx.fill();
        drawCtx.restore();
      }

      if (shieldRatio > 0){
        const dimWidth = Math.max(1, Math.round(innerWidth * shieldRatio));
        drawCtx.save();
        drawCtx.beginPath();
        roundedRectPath(drawCtx, hpX + inset, hpY + inset, dimWidth, innerHeight, innerRadius);
        drawCtx.fillStyle = 'rgba(190, 210, 205, 0.32)';
        drawCtx.fill();
        drawCtx.restore();
      }

      if (swordCount > 0) {
        const swordText = `${swordCount}`;
        const swordFontPx = Math.max(5, Math.floor(barHeight * 0.7));
        const swordGap = Math.max(3, Math.floor(barHeight * 0.35));
        const swordCenterY = hpY + (barHeight / 2);
        drawCtx.save();
        drawCtx.font = `700 ${swordFontPx}px system-ui, sans-serif`;
        drawCtx.textAlign = 'right';
        drawCtx.textBaseline = 'middle';
        drawCtx.fillStyle = '#ffd24a';
        drawCtx.strokeStyle = 'rgba(28, 14, 0, 0.92)';
        drawCtx.lineWidth = Math.max(1, Math.floor(swordFontPx * 0.14));
        drawCtx.strokeText(swordText, hpX - swordGap, swordCenterY);
        drawCtx.fillText(swordText, hpX - swordGap, swordCenterY);
        drawCtx.restore();
      }

      if (statusIcons.length > 0){
        statusIcons.forEach((icon, index) => {
          const iconX = statusStartX + index * (statusIconSize + statusIconGap);
          drawCtx.drawImage(icon.image /* as CanvasImageSource */, iconX, statusY, statusIconSize, statusIconSize);
          if (icon.stacks > 1) {
            const stackText = icon.stacks > 99 ? '99+' : `${icon.stacks}`;
            const badgeSize = Math.max(7, Math.round(statusIconSize * 0.62));
            const badgeX = iconX + statusIconSize - badgeSize;
            const badgeY = statusY + statusIconSize - badgeSize;
            drawCtx.save();
            drawCtx.fillStyle = 'rgba(8, 12, 22, 0.92)';
            drawCtx.strokeStyle = 'rgba(255,255,255,0.82)';
            drawCtx.lineWidth = 1;
            roundedRectPath(drawCtx, badgeX, badgeY, badgeSize, badgeSize, Math.max(2, Math.floor(badgeSize / 3)));
            drawCtx.fill();
            drawCtx.stroke();
            drawCtx.fillStyle = '#f3f8ff';
            drawCtx.font = `${Math.max(6, Math.floor(badgeSize * 0.58))}px system-ui, sans-serif`;
            drawCtx.textAlign = 'center';
            drawCtx.textBaseline = 'middle';
            drawCtx.fillText(stackText, badgeX + (badgeSize / 2), badgeY + (badgeSize / 2) + 0.5);
            drawCtx.restore();
          }
          statusIconHitboxes.push({ x: iconX, y, size, tooltip);
        });
      }

      const ticks = 10;
      drawCtx.save();
      drawCtx.strokeStyle = 'rgba(0,0,0,0.45)';
      drawCtx.lineWidth = 1;
      for (let i = 1; i < ticks; i += 1){
        const tx = hpX + inset + Math.round((innerWidth * i) / ticks) + 0.5;
        drawCtx.beginPath();
        drawCtx.moveTo(tx, hpY + inset + 0.5);
        drawCtx.lineTo(tx, hpY + inset + innerHeight - 0.5);
        drawCtx.stroke();
      }
      drawCtx.restore();

      const furyMax = Math.max(1, parseFiniteNumber(t.furyMax) ?? 100);
      const furyNow = Math.max(0, parseFiniteNumber(t.fury) ?? parseFiniteNumber(t.rage) ?? 0);
      const furyRatio = Math.max(0, Math.min(1, furyNow / furyMax));
      const rageHeight = Math.max(2, Math.floor(barHeight * 0.55));
      const rageY = hpY + barHeight + 2;
      const rageRadius = Math.max(1, Math.floor(rageHeight / 2));

      roundedRectPath(drawCtx, hpX, rageY, barWidth, rageHeight, rageRadius);
      drawCtx.fillStyle = 'rgba(9,14,21,0.72)';
      drawCtx.fill();
      const rageFilledWidth = Math.round((barWidth - 2) * furyRatio);
      if (rageFilledWidth > 0){
        roundedRectPath(drawCtx, hpX + 1, rageY + 1, rageFilledWidth, Math.max(1, rageHeight - 2), Math.max(1, rageRadius - 1));
        drawCtx.fillStyle = '#7b5cff';
        drawCtx.fill();
      }

      drawCtx.restore();
    }
  }
  /* ---------- Chạy ---------- */

  const sessionEventBindings = createSessionEventBindings({
    getDocRef: () => docRef,
    getWinRef) => winRef,
    getCanvas) => canvas,
    getCanvasClickHandler) => canvasClickHandler,
    setCanvasClickHandler) => { canvasClickHandler = handler; },
    getCanvasMouseMoveHandler) => canvasMouseMoveHandler,
    setCanvasMouseMoveHandler) => { canvasMouseMoveHandler = handler; },
    getHudCleanup) => hudCleanup,
    setHudCleanup) => { hudCleanup = cleanup; },
    getResizeHandler) => resizeHandler,
    setResizeHandler) => { resizeHandler = handler; },
    getVisualViewportResizeHandler) => visualViewportResizeHandler,
    setVisualViewportResizeHandler) => { visualViewportResizeHandler = handler; },
    getVisualViewportScrollHandler) => visualViewportScrollHandler,
    setVisualViewportScrollHandler) => { visualViewportScrollHandler = handler; },
    setViewportResizeDebugState) => { viewportResizeDebugState = state; },
    stopSessionLoop) => { sessionLoopController?.stopLoop(); },
    cancelScheduledDraw,
    cancelScheduledResize,
    setDrawPaused,
    scheduleDraw,
    invalidateSceneCache,
    onCanvasClick) => {
      const game = getInitializedGame();
      if (!canvas || !game) return;
      const { grid } = game;
      if (!grid) return;
      const rect = canvas.getBoundingClientRect();
      const p = { x: ev.clientX - rect.left, y= hitToCellOblique(grid, p.x, p.y, CAM_PRESET);
      if (!cell) return;
      if (cell.cx >= CFG.ALLY_COLS) return;
      handleCanvasSummonCellClick(cell);
    },
    onCanvasMouseMove) => {
      applyStatusIconHoverTooltip({
        canvas,
        hitboxes,
        clientX,
        clientY,
        currentTooltip,
        setTooltip) => { statusIconHoverTooltip = nextTooltip; },
      });
    },
    onWindowResize) => { scheduleResize(); },
    onViewportResize) => { scheduleViewportResizeIfChanged('resize'); },
    onViewportScroll) => { scheduleViewportResizeIfChanged('scroll'); },
    setCanvas) => { canvas = next; },
    setContext) => { ctx = next; },
    setHud) => { hud = next /* as HudHandles | null */; },
    setLeaderUltControlsHidden) => {
      if (leaderUltControlsEl) leaderUltControlsEl.hidden = hidden;
    },
    clearLeaderUltButtons) => {
      for (const button of leaderUltButtons){
        button.onclick = null;
      }
      leaderUltButtons = [];
    },
    setLeaderUltControlsEl) => { leaderUltControlsEl = next; },
    setLeaderUltControlsFingerprint) => { leaderUltControlsFingerprint = next; },
    setTimerElement) => { timerElement = next; },
    setStatusIconHoverTooltip) => { statusIconHoverTooltip = next; },
    clearStatusIconHitboxes) => { statusIconHitboxes.length = 0; },
    clearHpBarGradientCache) => { hpBarGradientCache.clear(); },
    cleanupSummonBar) => { cleanupSummonBar(); },
    destroyAetherPool) => { globalAetherPool.destroy(); },
    cleanupGameState) => {
      if (!Game) return;
      if (Game.queued?.ally?.clear) Game.queued.ally.clear();
      if (Game.queued?.enemy?.clear) Game.queued.enemy.clear();
      if (Array.isArray(Game.tokens)) Game.tokens.length = 0;
      if (Array.isArray(Game.deck3)) Game.deck3.length = 0;
      if (Game.usedUnitIds?.clear) Game.usedUnitIds.clear();
      if (Game.ai){
        Game.ai.deck = Array.isArray(Game.ai.deck) ? [] ;
        if (Game.ai.usedUnitIds?.clear) Game.ai.usedUnitIds.clear();
        Game.ai.selectedId = null;
        Game.ai.cost = 0;
        Game.ai.summoned = 0;
      }
      Game.cost = 0;
      Game.summoned = 0;
      Game.selectedId = null;
      Game._inited = false;
    },
    clearAfterStop) => {
      timerElement = null;
      sessionLoopController = null;
      Game = null;
      running = false;
      invalidateSceneCache();
    },
    getRootElement) => rootElement,
    setDocRef) => { docRef = next; },
    setWinRef) => { winRef = next; },
    refreshAnimationFrameFns,
    normalizeStartConfig, unknown>) => toNormalizedSessionConfig(config),
    isRunning) => running,
    resetSessionState) => {
      resetSessionState(config /* as NormalizedSessionConfig */);
    },
    setRunning) => {
      running = nextRunning;
    },
    initSession) => init(),
    isSessionInitialized) => Boolean(Game && Game._inited),
    getSession) => Game,
  });

  const {
    clearSessionTimers,
    configureRoot,
    resolveTimerElement,
    stopSession,
    startSession,
  } = sessionEventBindings;

  function applyConfigToRunningGame(cfg){
    if (!Game) return;
    const game = Game;
    let sceneChanged = false;
    if (typeof cfg.sceneTheme !== 'undefined'){
      if (game.sceneTheme !== cfg.sceneTheme) sceneChanged = true;
      game.sceneTheme = cfg.sceneTheme;
    }
    if (typeof cfg.backgroundKey !== 'undefined'){
      if (game.backgroundKey !== cfg.backgroundKey){
        sceneChanged = true;
        clearBackgroundSignatureCache();
      }
      game.backgroundKey = cfg.backgroundKey;
    }
    if (typeof cfg.modeKey !== 'undefined'){
      game.modeKey = typeof cfg.modeKey === 'string' ? cfg.modeKey : (cfg.modeKey || null);
    }
    const preferredDeck = getPreferredDeckEntries(cfg);
    if (preferredDeck.length) {
      game.unitsAll = preferredDeck;
      game.playerDeckLocked = preferredDeck;
      game.deck3 = ensureDeck(game);
      if (game.selectedId && !isCardInLockedDeck(game.selectedId, game)) {
        game.selectedId = null;
      }
      refillDeck();
    }
    let collectionProgressById= null;
    if (typeof cfg.collectionState !== 'undefined'){
      collectionProgressById = mapUnitProgressById(cfg.collectionState ?? null);
      game.runtime.unitProgressById = collectionProgressById;
      applyCollectionSkinsToSession(game);
    }
    if (cfg.aiPreset){
      const preset= cfg.aiPreset;
      const enemyUnits = resolveEnemyUnits({
        aiPreset: preset,
        preferredDeck,
        fallbackDeck,
        ...(collectionProgressById
          ? { unitProgressById: collectionProgressById }
          { collectionState: cfg.collectionState ?? null }),
      });
      if (enemyUnits.length) game.ai.unitsAll = enemyUnits;
      const parsedCostCap = toPositiveOrNull(preset.costCap);
      if (parsedCostCap !== null) game.ai.costCap = parsedCostCap;
      const parsedSummonLimit = toPositiveOrNull(preset.summonLimit);
      if (parsedSummonLimit !== null) game.ai.summonLimit = parsedSummonLimit;
    }
    if (sceneChanged){
      invalidateSceneCache();
      scheduleDraw();
    }
  }

  function updateSessionConfig(next= {}){
    const normalized = toNormalizedSessionConfig(next);
    storedConfig = { ...storedConfig, ...normalized };
    applyConfigToRunningGame(normalized);
  }

  function createPveSession(
    rootEl,
    options= null,
  ){
    const initial = sanitizeStartConfig(options);
    const normalized = toNormalizedSessionConfig(initial.rest);
    storedConfig = { ...normalized };
    configureRoot((rootEl ?? initial.root) ?? null);

    const handle= {
      start(startConfig= null){
        const { rest, root } = sanitizeStartConfig(startConfig);
        if (root) configureRoot(root);
        return startSession(rest);
      },
      stop(){
        stopSession();
      },
      updateConfig(next= null){
        updateSessionConfig(next);
      },
      setUnitSkin(unitId, skinKey){
        return setUnitSkinForSession(unitId, skinKey);
      },
    };
    
    return handle;
  }

  function __getStoredConfig(){
    return { ...storedConfig };
  }

  function __getActiveGame(){
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
  if (!Object.prototype.hasOwnProperty.call(exports, '__resolveStatusIconPreview')) exports.__resolveStatusIconPreview = __resolveStatusIconPreview;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createPveSession')) exports.createPveSession = createPveSession;
  if (!Object.prototype.hasOwnProperty.call(exports, '__getStoredConfig')) exports.__getStoredConfig = __getStoredConfig;
  if (!Object.prototype.hasOwnProperty.call(exports, '__getActiveGame')) exports.__getActiveGame = __getActiveGame;
};
__modules['./modes/pve/session-runtime.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./events.ts');
  const addGameEventListener = __dep0.addGameEventListener;
  const gameEvents = __dep0.gameEvents;
  const emitGameEvent = __dep0.emitGameEvent;
  const TURN_START = __dep0.TURN_START;
  const TURN_END = __dep0.TURN_END;
  const ACTION_START = __dep0.ACTION_START;
  const ACTION_END = __dep0.ACTION_END;
  const TURN_REGEN = __dep0.TURN_REGEN;
  const BATTLE_END = __dep0.BATTLE_END;
  const __dep1 = __require('./modes/pve/session-runtime-impl.ts');
  const createPveSessionImpl */ = __dep1.createPveSession /*;
  const __getStoredConfig = __dep1.__getStoredConfig;
  const __getActiveGame = __dep1.__getActiveGame;
  const __resolveStatusIconPreview = __dep1.__resolveStatusIconPreview;
  const NOOP_UNSUBSCRIBE = ()=> {};
  const SMALL_REWARD_MERGE_SIZE = 6;
  const SANITIZED_REWARD_LIST = Symbol('sanitized-reward-list');
  const REWARD_INDEX_BY_ID = Symbol('reward-index-by-id');
  const WAVE_REWARD_CACHE = new WeakMap();

  function isReward(entry){
    if (!entry || typeof entry !== 'object') return false;
    if (typeof entry.id !== 'string' || !entry.id.length) return false;
    if (typeof entry.weight !== 'number' || !Number.isFinite(entry.weight)) return false;
    if (typeof entry.tier !== 'number' || !Number.isFinite(entry.tier)) return false;
    if (entry.data != null && typeof entry.data !== 'object') return false;
    return true;
  }

  function sanitizeRewardListInPlace(list){
    if (list[SANITIZED_REWARD_LIST]) return list;
    let writeIndex = 0;
    for (let readIndex = 0; readIndex < list.length; readIndex += 1) {
      const reward = list[readIndex];
      if (!isReward(reward)) continue;
      list[writeIndex] = reward;
      writeIndex += 1;
    }
    if (writeIndex !== list.length) list.length = writeIndex;
    Object.defineProperty(list, SANITIZED_REWARD_LIST, {
      value: true,
      configurable,
    });
    list[REWARD_INDEX_BY_ID] = undefined;
    return list;
  }

  function toSanitizedRewardList(source){
    if (Array.isArray(source)) return sanitizeRewardListInPlace(source /* as SanitizedRewardList */);
    return sanitizeRewardListInPlace([] /* as SanitizedRewardList */);
  }

  function ensureSanitizedRewardList(
    owner,
    key,
  ){
    const ownerRecord = owner /* as RewardListOwnerByKey[K */] & Record<K, unknown>;
    const list = toSanitizedRewardList(ownerRecord[key]);
    ownerRecord[key] = list /* as unknown as (RewardListOwnerByKey[K */] & Record<K, unknown>)[K];
    return list;
  }

  function applyRuntimeRewardListMutation(
    runtime,
    payload,
    mutation,
  ){
    const rewardQueue = ensureSanitizedRewardList(runtime, 'rewardQueue');
    if (mutation === 'merge') mergeRewardsInPlace(rewardQueue, payload /* as RewardList */);
    else removeRewardById(rewardQueue, payload /* as string */);
    const encounter = runtime.encounter;
    if (!encounter) return;
    const pendingRewards = ensureSanitizedRewardList(encounter, 'pendingRewards');
    if (pendingRewards === rewardQueue) return;
    if (mutation === 'merge') mergeRewardsInPlace(pendingRewards, payload /* as RewardList */);
    else removeRewardById(pendingRewards, payload /* as string */);
  }

  function findRewardIndex(list, rewardId){
    for (let index = 0; index < list.length; index += 1) {
      if (list[index]?.id === rewardId) return index;
    }
    return -1;
  }

  function mergeRewardsInPlace(list, additions){
    if (!additions.length) return list;
    const useIndexedMerge = list.length > SMALL_REWARD_MERGE_SIZE || additions.length > SMALL_REWARD_MERGE_SIZE;
    const indexById = useIndexedMerge ? getRewardIndexById(list) ;

    for (let addIndex = 0; addIndex < additions.length; addIndex += 1) {
      const reward = additions[addIndex]!;
      const existingIndex = indexById ? (indexById.get(reward.id) ?? -1) ;
      if (existingIndex < 0) {
        if (indexById) indexById.set(reward.id, list.length);
        list.push(reward);
      } else {
        list[existingIndex] = reward;
      }
    }
    if (!indexById) list[REWARD_INDEX_BY_ID] = undefined;
    return list;
  }

  function getRewardIndexById(list){
    const existingIndex = list[REWARD_INDEX_BY_ID];
    if (existingIndex) return existingIndex;
    const indexById= new Map();
    for (let index = 0; index < list.length; index += 1) {
      const reward = list[index]!;
      indexById.set(reward.id, index);
    }
    list[REWARD_INDEX_BY_ID] = indexById;
    return indexById;
  }

  function removeRewardById(list, rewardId){
    const useIndexedRemoval = list.length > SMALL_REWARD_MERGE_SIZE;
    const indexById = useIndexedRemoval ? getRewardIndexById(list) ;
    const index = indexById ? (indexById.get(rewardId) ?? -1) ;
    if (index < 0) return list;
    list.splice(index, 1);
    if (!indexById) {
      list[REWARD_INDEX_BY_ID] = undefined;
      return list;
    }
    indexById.delete(rewardId);
    for (let listIndex = index; listIndex < list.length; listIndex += 1) {
      const reward = list[listIndex]!;
      indexById.set(reward.id, listIndex);
    }
    list[REWARD_INDEX_BY_ID] = indexById;
    return list;
  }

  function syncWaveRewards(runtime, rewards){
    applyRuntimeRewardListMutation(runtime, rewards, 'merge');
  }

  function removeRewardEverywhere(runtime, rewardId){
    applyRuntimeRewardListMutation(runtime, rewardId, 'remove');
  }

  function markEncounterCompleted(runtime, encounter){
    encounter.status = 'completed';
    runtime.wave = null;
    return encounter;
  }

  function getWaveRewards(wave){
    const cached = WAVE_REWARD_CACHE.get(wave);
    if (cached) return cached;
    const rewards = Array.isArray(wave.rewards)
      ? sanitizeRewardListInPlace(wave.rewards /* as SanitizedRewardList */)
      ;
    WAVE_REWARD_CACHE.set(wave, rewards);
    return rewards;
  }

  function advanceSession(session){
    const runtime = session?.runtime;
    if (!runtime) return null;
    const encounter = runtime.encounter;
    if (!encounter) {
      runtime.wave = null;
      return null;
    }
    if (encounter.status === 'completed') {
      runtime.wave = null;
      return encounter;
    }

    const waves = Array.isArray(encounter.waves) ? encounter.waves : [];
    const index = Math.max(0, encounter.waveIndex | 0);
    const wave = (waves[index] /* as WaveState | null | undefined */) ?? null;
    if (!wave) return markEncounterCompleted(runtime, encounter);

    switch (wave.status) {
      case 'pending':
        wave.status = 'spawning';
        runtime.wave = wave;
        if (encounter.status === 'idle') encounter.status = 'running';
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
        const rewards = getWaveRewards(wave);
        if (rewards.length) syncWaveRewards(runtime, rewards);
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
      return markEncounterCompleted(runtime, encounter);
    }
    return encounter;
  }

  function applyReward(
    session,
    reward,
  ){
    if (!session?.runtime || !isReward(reward)) return null;
    removeRewardEverywhere(session.runtime, reward.id);
    return reward;
  }

  function onSessionEvent(
    type,
    handler,
  )=> void {
    if (!type || typeof handler !== 'function') return NOOP_UNSUBSCRIBE;
    return addGameEventListener(type, handler);
  }

  function createPveSession(
    rootEl,
    options= {},
  ){
    const controller = createPveSessionImpl(rootEl, options) /* as ControllerWithEvents */;
    controller.onEvent = onSessionEvent;
    return controller;
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
  exports.__resolveStatusIconPreview = __resolveStatusIconPreview;
  if (!Object.prototype.hasOwnProperty.call(exports, 'advanceSession')) exports.advanceSession = advanceSession;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyReward')) exports.applyReward = applyReward;
  if (!Object.prototype.hasOwnProperty.call(exports, 'onSessionEvent')) exports.onSessionEvent = onSessionEvent;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createPveSession')) exports.createPveSession = createPveSession;
};
__modules['./modes/pve/session-state.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./shared-types/units.ts');
  const createSummonQueue = __dep0.createSummonQueue;
  const __dep1 = __require('./config.ts');
  const CFG = __dep1.CFG;
  const __dep2 = __require('./units.ts');
  const UNITS = __dep2.UNITS;
  const lookupUnit = __dep2.lookupUnit;
  const __dep3 = __require('./catalog.ts');
  const getMetaById = __dep3.getMetaById;
  const __dep4 = __require('./data/cost-budget.ts');
  const deriveBudgetFromRankRole = __dep4.deriveBudgetFromRankRole;
  const evaluateCostBudget = __dep4.evaluateCostBudget;
  const __dep5 = __require('./meta.ts');
  const makeInstanceStats = __dep5.makeInstanceStats;
  const metaServiceAdapter = __dep5.metaServiceAdapter;
  const __dep6 = __require('./events.ts');
  const gameEvents = __dep6.gameEvents;
  const __dep7 = __require('./background.ts');
  const getEnvironmentBackground = __dep7.getEnvironmentBackground;
  const drawEnvironmentProps = __dep7.drawEnvironmentProps;
  const __dep8 = __require('./scene.ts');
  const getCachedBattlefieldScene = __dep8.getCachedBattlefieldScene;
  const __dep9 = __require('./engine.ts');
  const drawGridOblique = __dep9.drawGridOblique;
  const __dep10 = __require('./art.ts');
  const getUnitArt = __dep10.getUnitArt;
  const __dep11 = __require('./utils/unit-id.ts');
  const normalizeUnitId = __dep11.normalizeUnitId;
  const __dep12 = __require('./utils/rng.ts');
  const createRngState = __dep12.createRngState;
  const nextRngValue = __dep12.nextRngValue;
  const __dep13 = __require('./utils/format.ts');
  const stableStringify = __dep13.stableStringify;
  const __dep14 = __require('./utils/domain-normalization.ts');
  const normalizeClassName = __dep14.normalizeClassName;
  const normalizeElementKey = __dep14.normalizeElementKey;
  const normalizeElementList = __dep14.normalizeElementList;
  const __dep15 = __require('./modes/pve/collection-mapper.ts');
  const mapUnitProgressById = __dep15.mapUnitProgressById;
  const __dep16 = __require('./modes/pve/creep-builder.ts');
  const buildAICreepDeckFromLineup = __dep16.buildAICreepDeckFromLineup;

  const DEFAULT_UNIT_ROSTER = UNITS.map((unit) => {
    const unitId = normalizeUnitId(unit.id);
    const art = getUnitArt(unitId);
    return {
      id: unitId,
      name,
      cost) ? unit.cost : null,
      art,
      skinKey,
    } /* satisfies SessionState['unitsAll'][number] */;
  }) /* as ReadonlyArray<SessionState['unitsAll' */][number]>;


    backgroundKey: string;
  }) & Record<string, unknown>;

  const NORMALIZABLE_DECK_FIELDS = ['lineupDeck', 'playerDeck', 'deck'] /* /* as const */ */;
  const GLOBAL_DECK_NORMALIZATION_CACHE= new WeakMap();

  function normalizeDeckEntriesCached(
    value,
    cache,
  ){
    const cached = cache.get(value);
    if (cached) return cached;
    const normalized = normalizeDeckEntries(value);
    cache.set(value, normalized);
    return normalized;
  }

  function hasDeckEntries(value){
    return Array.isArray(value) && value.length > 0;
  }

  function isNormalizedDeckEntries(value){
    if (!Array.isArray(value)) return false;
    for (let index = 0; index < value.length; index += 1) {
      const entry = value[index];
      if (!entry || typeof entry !== 'object') return false;
      if (typeof (entry /* as { id: unknown } */).id !== 'string') return false;
    }
    return true;
  }

  function toDeckEntries(value){
    if (!hasDeckEntries(value)) return EMPTY_UNIT_DECK;
    const cached = GLOBAL_DECK_NORMALIZATION_CACHE.get(value);
    if (cached) return cached;
    if (isNormalizedDeckEntries(value)) {
      GLOBAL_DECK_NORMALIZATION_CACHE.set(value, value);
      return value;
    }
    const normalized = normalizeDeckEntriesCached(value, GLOBAL_DECK_NORMALIZATION_CACHE);
    return normalized;
  }

  function pickFirstDeckInput(source){
    const lineupDeck = source.lineupDeck;
    if (hasDeckEntries(lineupDeck)) return lineupDeck;
    const playerDeck = source.playerDeck;
    if (hasDeckEntries(playerDeck)) return playerDeck;
    const deck = source.deck;
    if (hasDeckEntries(deck)) return deck;
    return null;
  }

  function getPreferredDeckInput(config){
    return pickFirstDeckInput(config);
  }

  function getPreferredDeckEntries(config){
    return toDeckEntries(pickFirstDeckInput(config));
  }
  const TURN_ORDER_FALLBACK_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9] /* /* as const */ */;
  const DEFAULT_TURN_ORDER_SIDES = ['ally', 'enemy'] /* /* as const */ /* satisfies ReadonlyArray<TurnOrderSide> */ */;

  function getSceneConfig(cfg){
    if (!cfg || typeof cfg !== 'object') return null;
    const sceneCandidate = (cfg /* as { SCENE: unknown } */).SCENE;
    if (!sceneCandidate || typeof sceneCandidate !== 'object') return null;
    const scene = sceneCandidate /* as SceneConfig & { CURRENT_BACKGROUND: string | null | undefined } */;
    if (typeof scene.DEFAULT_THEME !== 'string' || typeof scene.CURRENT_THEME !== 'string') return null;
    if (!scene.THEMES || typeof scene.THEMES !== 'object') return null;
    return scene;
  }

  function getTurnOrderMode(cfg){
    const rawMode = cfg.turnOrder.mode ?? null;
    return typeof rawMode === 'string' ? rawMode : null;
  }

  function buildQueuedSummonState(){
    return {
      ally: createSummonQueue(),
      enemy),
    };
  }
  function normalizeConfig(input= {}){
    const deckNormalizationCache= new WeakMap();
    const { scene, ...rest } = input;
    const out = { ...rest } /* as NormalizedSessionConfig */;
    const sceneConfig= scene ?? {};
    if (typeof out.sceneTheme === 'undefined' && typeof sceneConfig.theme === 'string') {
      out.sceneTheme = sceneConfig.theme;
    }
    if (typeof out.backgroundKey === 'undefined') {
      if (typeof sceneConfig.backgroundKey === 'string') out.backgroundKey = sceneConfig.backgroundKey;
      else if (typeof sceneConfig.background === 'string') out.backgroundKey = sceneConfig.background;
    }
    for (const field of NORMALIZABLE_DECK_FIELDS) {
      const value = out[field];
      if (Array.isArray(value)) {
        out[field] = normalizeDeckEntriesCached(value, deckNormalizationCache);
      }
    }
    if (typeof out.collectionState === 'undefined') {
      out.collectionState = null;
    }
    if (out.aiPreset) {
      out.aiPreset = normalizeAiPresetDeckLists({ ...out.aiPreset }, deckNormalizationCache);
    }
    return out;
  }

  function isTurnOrderSide(value){
    return value === 'ally' || value === 'enemy';
  }

  function resolveTurnOrderSides(rawSides){
    if (!Array.isArray(rawSides) || rawSides.length === 0) {
      return DEFAULT_TURN_ORDER_SIDES;
    }
    const sides= [];
    for (let index = 0; index < rawSides.length; index += 1) {
      const side = rawSides[index];
      if (isTurnOrderSide(side)) sides.push(side);
    }
    return sides.length > 0 ? sides : DEFAULT_TURN_ORDER_SIDES;
  }

  function isPairScanTuple(entry){
    return entry.length === 2 && typeof entry[0] === 'string' && Number.isFinite(entry[1]);
  }

  function hasSlotKey(value){
    return 'slot' in value || 's' in value || 'index' in value;
  }

  function isPairScanObject(
    entry,
  ){
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    const candidate = entry /* as { slot: unknown */; s: unknown; index: unknown };
    return hasSlotKey(candidate);
  }

  function isPairScanObjectWithSide(entry){
    if (!isPairScanObject(entry)) return false;
    const candidate = entry /* as { side: unknown } */;
    return typeof candidate.side === 'string';
  }

  function isPairScanObjectWithoutSide(entry){
    if (!isPairScanObject(entry)) return false;
    const candidate = entry /* as { side: unknown } */;
    return typeof candidate.side !== 'string';
  }

  function parseSlotValue(entry){
    return parseFiniteNumber(entry.slot ?? entry.s ?? entry.index);
  }

  function clampTurnOrderSlot(slot){
    const rounded = Math.round(slot);
    return Math.max(1, Math.min(9, rounded));
  }

  function pushTurnOrderForSides(output, sides, slot){
    const normalizedSlot = clampTurnOrderSlot(slot);
    for (let sideIndex = 0; sideIndex < sides.length; sideIndex += 1) {
      output.push({ side: sides[sideIndex], slot);
    }
  }

  function appendNormalizedPairScanEntry(
    output,
    entry,
    sides,
  ){
    if (typeof entry === 'number') {
      if (Number.isFinite(entry)) {
        pushTurnOrderForSides(output, sides, entry);
      }
      return;
    }

    if (Array.isArray(entry)) {
      if (isPairScanTuple(entry)) {
        const [, slot] = entry;
        const side= entry[0] === 'enemy' ? 'enemy' : 'ally';
        output.push({ side, slot) });
        return;
      }
      for (let index = 0; index < entry.length; index += 1) {
        const value = entry[index];
        if (typeof value === 'number' && Number.isFinite(value)) {
          pushTurnOrderForSides(output, sides, value);
        }
      }
      return;
    }

    if (isPairScanObjectWithSide(entry)) {
      const slot = parseSlotValue(entry);
      if (slot !== null) {
        const side= entry.side === 'enemy' ? 'enemy' : 'ally';
        output.push({ side, slot) });
      }
      return;
    }

    if (isPairScanObjectWithoutSide(entry)) {
      const slot = parseSlotValue(entry);
      if (slot !== null) pushTurnOrderForSides(output, sides, slot);
    }
  }

  function createSequentialTurnSnapshot(){
    const { order, indexMap } = buildTurnOrder();
    return {
      mode: 'sequential',
      order,
      orderIndex,
      cursor,
      cycle,
      busyUntil,
    } /* satisfies TurnSnapshot */;
  }

  function buildTurnOrder(){ order: TurnOrderEntry[]; indexMap: Map<string, number> } {
    const cfg = CFG.turnOrder;
    const sides = resolveTurnOrderSides(cfg.sides);
    const order= [];
    const scan = Array.isArray(cfg.pairScan) ? cfg.pairScan : [];
    for (let index = 0; index < scan.length; index += 1) {
      appendNormalizedPairScanEntry(order, scan[index], sides);
    }
    if (!order.length) {
      for (const slot of TURN_ORDER_FALLBACK_SLOTS) {
        pushTurnOrderForSides(order, sides, slot);
      }
    }

    const indexMap = new Map();
    for (let idx = 0; idx < order.length; idx += 1) {
      const entry = order[idx];
      if (!entry) continue;
      const key = `${entry.side}{entry.slot}`;
      if (!indexMap.has(key)) indexMap.set(key, idx);
    }

    return { order, indexMap };
  }

  function createSession(options= {}){
    const normalized = normalizeConfig(options);
    const unitProgressById = mapUnitProgressById(normalized.collectionState ?? null);
    const modeKey = typeof normalized.modeKey === 'string' ? normalized.modeKey : null;
    const stageId = typeof (normalized /* as { stageId: unknown } */).stageId === 'string'
      ? String((normalized /* as { stageId: unknown } */).stageId)
      ;
    const sceneCfg = getSceneConfig(CFG);
    const sceneTheme = normalized.sceneTheme
      ?? sceneCfg?.CURRENT_THEME
      ?? sceneCfg?.DEFAULT_THEME
      ?? null;
    const backgroundKey = normalized.backgroundKey
      ?? CFG.CURRENT_BACKGROUND
      ?? sceneCfg?.CURRENT_BACKGROUND
      ?? sceneCfg?.CURRENT_THEME
      ?? sceneCfg?.DEFAULT_THEME
      ?? null;

    const preferredPlayerDeck = getPreferredDeckEntries(normalized);
    const {
      hasPreferredDeck,
      autoPlayerDeck,
      lockedPlayerDeck,
      allyUnits,
    } = resolvePlayerDeck({
      preferredDeck: preferredPlayerDeck,
      fallbackSingleDeck,
      defaultRoster,
      unitProgressById,
    });

    const enemyPreset = normalized.aiPreset ?? null;
    const enemyUnits = resolveEnemyUnits({
      aiPreset: enemyPreset,
      preferredDeck,
      fallbackDeck,
      unitProgressById,
      collectionState,
      modeKey,
      stageId,
    });

    const requestedTurnMode = normalized.turnMode
      ?? normalized.turn?.mode
      ?? normalized.turnOrderMode
      ?? normalized.turnOrder?.mode
      ?? getTurnOrderMode(CFG);
    const useInterleaved = requestedTurnMode === 'interleaved_by_position';
    const allyColsRaw = CFG.ALLY_COLS;
    const gridRowsRaw = CFG.GRID_ROWS;
    const allyCols = Number.isFinite(allyColsRaw) ? Math.max(1, Math.floor(allyColsRaw)) ;
    const gridRows = Number.isFinite(gridRowsRaw) ? Math.max(1, Math.floor(gridRowsRaw)) ;
    const slotsPerSide = Math.max(1, allyCols * gridRows);
    const initialTurnRng = createRngState(normalized.rngSeed);
    const randomStartSide = nextRngValue(initialTurnRng) < 0.5 ? 'ALLY' : 'ENEMY';

    const turnState= useInterleaved
      ? {
        mode: 'interleaved_by_position',
        nextSide,
        lastPos, ENEMY,
        wrapCount, ENEMY,
        turnCount,
        slotCount,
        cycle,
        busyUntil,
      } /* satisfies TurnSnapshot */
      : createSequentialTurnSnapshot();

    const aiState = buildAiState({
      preset: enemyPreset,
      unitsAll,
      defaultCostCap,
      defaultSummonLimit,
    });

    const costCap = parseFiniteNumber(normalized.costCap) ?? CFG.COST_CAP;
    const summonLimit = parseFiniteNumber(normalized.summonLimit) ?? CFG.SUMMON_LIMIT;
    const rngSeed = parseFiniteNumber(normalized.rngSeed) ?? undefined;

    return buildBaseState({
      modeKey,
      allyUnits,
      lockedPlayerDeck,
      costCap,
      summonLimit,
      sceneTheme,
      backgroundKey,
      turn,
      ai,
      unitProgressById,
      rngSeed,
    });
  }

  function invalidateSceneCache(){
    sceneCache = null;
    clearBackgroundSignatureCache();
  }

  function createSceneCacheCanvas(
    pixelWidth,
    pixelHeight,
    documentRef,
  ){
    if (!Number.isFinite(pixelWidth) || !Number.isFinite(pixelHeight)) return null;
    const safeW = Math.max(1, Math.floor(pixelWidth));
    const safeH = Math.max(1, Math.floor(pixelHeight));
    if (typeof OffscreenCanvas === 'function') {
      try {
        return new OffscreenCanvas(safeW, safeH);
      } catch (_) {
        // ignore and fall back
      }
    }
    const doc = documentRef || (typeof document !== 'undefined' ? document : null);
    if (!doc || typeof doc.createElement !== 'function') return null;
    const offscreen = doc.createElement('canvas');
    offscreen.width = safeW;
    offscreen.height = safeH;
    return offscreen;
  }

  function ensureSceneCache(args){
    const { game, canvas, documentRef, camPreset } = args;
    if (!game?.grid) return null;
    if (typeof game.grid !== 'object') return null;
    const grid = game.grid /* as Parameters<typeof drawEnvironmentProps>[1 */];
    const gridDims = game.grid /* as { dpr: number | null | undefined */; w: number | null | undefined; h: number | null | undefined };
    const dprCandidate = Number(gridDims.dpr);
    const dprRaw = Number.isFinite(dprCandidate) && dprCandidate > 0 ? dprCandidate : 1;
    const cssWidth = typeof gridDims.w === 'number' ? gridDims.w : canvas ? canvas.width / dprRaw : 0;
    const cssHeight = typeof gridDims.h === 'number' ? gridDims.h : canvas ? canvas.height / dprRaw : 0;
    if (!cssWidth || !cssHeight) return null;
    const pixelWidth = Math.max(1, Math.round(cssWidth * dprRaw));
    const pixelHeight = Math.max(1, Math.round(cssHeight * dprRaw));

    const sceneCfg = getSceneConfig(CFG);
    const themeKey = game.sceneTheme ?? sceneCfg?.CURRENT_THEME ?? sceneCfg?.DEFAULT_THEME ?? null;
    const theme = themeKey ? sceneCfg?.THEMES?.[themeKey] ?? null : null;
    const backgroundKey = game.backgroundKey ?? null;
    const camPresetSignature = getCamPresetSignature(camPreset);

    const baseScene = getCachedBattlefieldScene(
      grid /* as Parameters<typeof getCachedBattlefieldScene>[0 */],
      theme,
      { width: cssWidth, height, dpr,
    );
    const baseKey = baseScene?.cacheKey ?? null;
    if (!baseScene) {
      sceneCache = null;
      return null;
    }
    const backgroundSignature = computeBackgroundSignature(backgroundKey);

    const cachedScene = sceneCache;
    const needsRebuild = !cachedScene
      || cachedScene.pixelWidth !== pixelWidth
      || cachedScene.pixelHeight !== pixelHeight
      || cachedScene.themeKey !== themeKey
      || cachedScene.backgroundKey !== backgroundKey
      || cachedScene.backgroundSignature !== backgroundSignature
      || cachedScene.dpr !== dprRaw
      || cachedScene.baseKey !== baseKey
      || cachedScene.camPresetSignature !== camPresetSignature
      || !cachedScene.includesGrid;

    if (!needsRebuild) return sceneCache;

    const offscreen = createSceneCacheCanvas(pixelWidth, pixelHeight, documentRef);
    if (!offscreen) return null;
    const cacheCtx = offscreen.getContext('2d');
    if (!cacheCtx) return null;

    if (typeof cacheCtx.resetTransform === 'function') {
      cacheCtx.resetTransform();
    } else if (typeof cacheCtx.setTransform === 'function') {
      cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
    }
    cacheCtx.clearRect(0, 0, pixelWidth, pixelHeight);

    try {
      cacheCtx.drawImage(baseScene.canvas /* as CanvasImageSource */, 0, 0);
    } catch (err) {
      console.error('[scene-cache:base]', err);
      return null;
    }

    if (typeof cacheCtx.setTransform === 'function') {
      cacheCtx.setTransform(dprRaw, 0, 0, dprRaw, 0, 0);
    } else if (dprRaw !== 1 && typeof cacheCtx.scale === 'function') {
      cacheCtx.scale(dprRaw, dprRaw);
    }

    const drawCtx = cacheCtx /* as CanvasRenderingContext2D */;
    try {
      drawEnvironmentProps(drawCtx, grid, camPreset, backgroundKey ?? undefined);
      drawGridOblique(drawCtx, grid, camPreset);
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
      dpr,
      baseKey,
      includesGrid,
      camPresetSignature,
    };
    return sceneCache;
  }

  exports.__backgroundSignatureCache } */;
  const deckEntrySkeletonCache = new Map();
  const MAX_PLAYER_DECK_SIZE = 10;

  function resolveElementFromRecord(record = backgroundSignatureCache /*;
  exports.unknown>){
    return normalizeElementKey(
      record.element
      ?? record.base_element
      ?? record.baseElement
      ?? record.nguyenTo
      ?? record.nguyen_to
      ?? record.he = unknown>){
    return normalizeElementKey(
      record.element
      ?? record.base_element
      ?? record.baseElement
      ?? record.nguyenTo
      ?? record.nguyen_to
      ?? record.he;
  exports.) ?? 'neutral';
  }

  function cloneDeckEntrySkeleton(entry){
    return {
      ...entry = ) ?? 'neutral';
  }

  function cloneDeckEntrySkeleton(entry){
    return {
      ...entry;
  exports.art = art;
  exports.skinKey = skinKey;
  exports.Record<string */ = } /* satisfies SessionState['unitsAll'][number] */;
  }

  function resolveUnitDeployCost(unitId){
    const normalizedId = normalizeUnitId(unitId);
    const unitDef = lookupUnit(normalizedId);
    const directCost = parseFiniteNumber(unitDef?.cost);
    if (directCost != null && directCost > 0) {
      return directCost;
    }

    const meta = getMetaById(normalizedId);
    if (!meta) {
      return null;
    }

    const metadataCost = parseFiniteNumber((meta /*;
  exports.unknown>).cost);
    if (metadataCost != null && metadataCost > 0) {
      return metadataCost;
    }

    const rank = typeof meta.rank === 'string' ? meta.rank : null;
    const className = typeof meta.class === 'string' ? meta.class : null;
    const budget = deriveBudgetFromRankRole(rank = unknown>).cost);
    if (metadataCost != null && metadataCost > 0) {
      return metadataCost;
    }

    const rank = typeof meta.rank === 'string' ? meta.rank : null;
    const className = typeof meta.class === 'string' ? meta.class : null;
    const budget = deriveBudgetFromRankRole(rank;
  exports.className);
    const evaluated = evaluateCostBudget(budget);
    return Number.isFinite(evaluated.cost) && evaluated.cost > 0
      ? evaluated.cost
      : null;
  }

  function makeDeckEntrySkeleton(unitId){
    const normalizedId = normalizeUnitId(unitId);
    const cached = deckEntrySkeletonCache.get(normalizedId);
    if (cached) return cloneDeckEntrySkeleton(cached);

    const unitDef = lookupUnit(normalizedId);
    const art = getUnitArt(normalizedId);
    const skeleton = {
      id: normalizedId = className);
    const evaluated = evaluateCostBudget(budget);
    return Number.isFinite(evaluated.cost) && evaluated.cost > 0
      ? evaluated.cost
      : null;
  }

  function makeDeckEntrySkeleton(unitId){
    const normalizedId = normalizeUnitId(unitId);
    const cached = deckEntrySkeletonCache.get(normalizedId);
    if (cached) return cloneDeckEntrySkeleton(cached);

    const unitDef = lookupUnit(normalizedId);
    const art = getUnitArt(normalizedId);
    const skeleton = {
      id: normalizedId;
  exports.cost) = cost);
  exports.name=== 'string' ? unitDef.name : null = name=== 'string' ? unitDef.name : null;
  exports.} /* satisfies SessionState['unitsAll'][number] */;
    deckEntrySkeletonCache.set(normalizedId = } /* satisfies SessionState['unitsAll'][number] */;
    deckEntrySkeletonCache.set(normalizedId;
  exports.unknown>;
    const idRaw = candidate.id;
    if (typeof idRaw !== 'string' || idRaw.trim() === '') return null;
    const skeleton = makeDeckEntrySkeleton(idRaw);
    const merged= {
      ...skeleton = unknown>;
    const idRaw = candidate.id;
    if (typeof idRaw !== 'string' || idRaw.trim() === '') return null;
    const skeleton = makeDeckEntrySkeleton(idRaw);
    const merged= {
      ...skeleton;
  exports.SessionState['unitsAll' */][number]) = ...(candidate /*;
  exports.id = id;
    const costOverride = parseFiniteNumber(candidate.cost);
    merged.cost = costOverride ?? skeleton.cost ?? null;
    const nameCandidate = candidate.name;
    if (typeof nameCandidate === 'string' && nameCandidate.trim() !== '') {
      merged.name = nameCandidate;
    } else if (merged.name == null) {
      merged.name = skeleton.name ?? null;
    }
    if (merged.art == null) {
      merged.art = skeleton.art ?? null;
    }
    const normalizedClass = normalizeClassName(candidate.class);
    if (normalizedClass) {
      merged.class = normalizedClass;
    }

    const normalizedElement = resolveElementFromRecord(candidate);
    merged.element = normalizedElement;
    merged.base_element = normalizedElement;

    const metadataRaw = candidate.metadata;
    if (metadataRaw && typeof metadataRaw === 'object' && !Array.isArray(metadataRaw)) {
      const metadata = { ...(metadataRaw /* as Record<string */, unknown>) };
      metadata.element = resolveElementFromRecord(metadata);

      if (metadata.elements != null) {
        metadata.elements = normalizeElementList(metadata.elements);
      }
      merged.metadata = metadata;
    }
    if (typeof merged.skinKey === 'string') {
      merged.skinKey = merged.skinKey.trim() !== '' ? merged.skinKey : merged.art?.skinKey ?? skeleton.skinKey ?? null;
    } else {
      merged.skinKey = merged.art?.skinKey ?? skeleton.skinKey ?? null;
    }
    return merged;
  }

  function normalizeDeckEntries(value){
    if (!Array.isArray(value)) return [];
    const normalized= [];
    const seenIds = new Set();
    for (let index = 0; index < value.length; index += 1) {
      const item = value[index];
      if (normalized.length >= MAX_PLAYER_DECK_SIZE) break;
      const entry = normalizeDeckEntry(item);
      if (!entry) continue;
      const unitId = entry.id;
      if (seenIds.has(unitId)) continue;
      seenIds.add(unitId);
      normalized.push(entry);
    }
    return normalized /* as SessionState['unitsAll' */];
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'getPreferredDeckInput')) exports.getPreferredDeckInput = getPreferredDeckInput;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getPreferredDeckEntries')) exports.getPreferredDeckEntries = getPreferredDeckEntries;
  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeConfig')) exports.normalizeConfig = normalizeConfig;
  if (!Object.prototype.hasOwnProperty.call(exports, 'buildTurnOrder')) exports.buildTurnOrder = buildTurnOrder;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createSession')) exports.createSession = createSession;
  if (!Object.prototype.hasOwnProperty.call(exports, 'invalidateSceneCache')) exports.invalidateSceneCache = invalidateSceneCache;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createSceneCacheCanvas')) exports.createSceneCacheCanvas = createSceneCacheCanvas;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ensureSceneCache')) exports.ensureSceneCache = ensureSceneCache;
  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeDeckEntries')) exports.normalizeDeckEntries = normalizeDeckEntries;
};
__modules['./modes/pve/session.ts'] = (exports, module, __require) => {
  const __dep2 = __require('./modes/pve/session-state.ts');
  const sessionState = __dep2;*/;const __dep3 = __require('./modes/pve/session-runtime.ts');
  const sessionRuntime = __dep3;*/;

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

  // Namespace re-exports giúp chuyển dần sang module nhỏ mà không vỡ import cũ.
  export * /* as sessionState from './session-state.ts' */;
  export * /* as sessionRuntime from './session-runtime.ts' */;
  const sessionModules = Object.freeze({ sessionState, sessionRuntime } /* /* as const */ */);
  if (!Object.prototype.hasOwnProperty.call(exports, 'sessionModules')) exports.sessionModules = sessionModules;
};
__modules['./modes/pve/unit-runtime-hooks.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./modes/pve/chap-minh-runtime.ts');
  const performChapMinhUltRuntime = __dep0.performChapMinhUltRuntime;
  const __dep1 = __require('./modes/pve/ly-thanh-thu-runtime.ts');
  const performLyThanhThuUltRuntime = __dep1.performLyThanhThuUltRuntime;
  const __dep2 = __require('./modes/pve/nguyen-le-runtime.ts');
  const performNguyenLeUltRuntime = __dep2.performNguyenLeUltRuntime;
};
__modules['./passives.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/passives.ts — passive event dispatch & helpers
  const __dep0 = __require('./statuses.ts');
  const Statuses = __dep0.Statuses;
  const hookOnLethalDamage = __dep0.hookOnLethalDamage;
  const __dep1 = __require('./utils/time.ts');
  const safeNow = __dep1.safeNow;





  const clamp01 = (value)=> Math.max(0, Math.min(1, value));

  const isRecord = (value)=>
    !!value && typeof value === 'object' && !Array.isArray(value);

  const isPassiveKitDefinition = (value)=> {
    if (!isRecord(value)) return false;
    const passives = (value /* as { passives: unknown } */).passives;
    if (passives != null && !Array.isArray(passives)) return false;
    const onSpawn = (value /* as { onSpawn: unknown } */).onSpawn;
    if (onSpawn != null && (typeof onSpawn !== 'object' || Array.isArray(onSpawn))) return false;
    return true;
  };

  const coercePassiveMeta = (value)=> {
    if (!isRecord(value)) return null;
    const kitCandidate = 'kit' in value ? (value.kit /* as unknown */) ;
    const kit = isPassiveKitDefinition(kitCandidate) ? kitCandidate : null;
    const meta = value /* as PassiveMetaContext['meta' */];
    return {
      meta,
      kit,
    } /* satisfies PassiveMetaContext */;
  };

  const isEffectCandidate = (value)=> {
    if (typeof value === 'string') return true;
    return !!value && typeof value === 'object';
  };

  const hasOwn = (object, key)=>
    Object.prototype.hasOwnProperty.call(object, key);

  const collectPassiveEffects = (passive)=> {
    if (!passive) return [];
    const out= [];
    const effects = Array.isArray(passive.effects) ? passive.effects : null;
    if (effects){
      for (const entry of effects){
        if (!isEffectCandidate(entry)) continue;
        out.push(entry);
      }
    }
    if (!out.length && isEffectCandidate(passive.effect)){
      out.push(passive.effect);
    }
    return out;
  };

  const getPassiveLog = (
    Game,
  )=> {
    const logCandidate = Game?.passiveLog;
    if (!Array.isArray(logCandidate)) return [];
    const allRecords = logCandidate.every((entry) => isRecord(entry));
    if (allRecords) return logCandidate /* as Array<Record<string */, unknown>>;
    const result= [];
    for (const entry of logCandidate){
      if (isRecord(entry)){
        result.push(entry);
      }
    }
    return result;
  };

  const defaultPassive= ({ passive }) => {
    const id = passive?.id ?? 'unknown';
    throw new Error(`Passive handler not implemented: ${id}`);
  };

  const resolvePassiveEffect = (
    basePassive,
    effect,
  ){
    handler: PassiveDefinition;
    passive: PassiveSpec | null;
    params: Record<string, unknown> | undefined;
    key: string | null;
  } => {
    const key = typeof effect === 'string'
      ? effect
      : effect && typeof effect === 'object'
        ? ((effect /* as PassiveEffectConfig */).type || (effect /* as PassiveEffectConfig */).kind || null)
        ;

    const gainStatsHandler=
      typeof EFFECTS.gainStats === 'function' ? EFFECTS.gainStats : null;

    let handler= getRegisteredPassive(key);
    let params = basePassive.params /* as Record<string */, unknown> | undefined;
    let resolved= basePassive;

    if (effect && typeof effect === 'object'){
      const spec = effect /* as PassiveEffectConfig */;
      const type = spec.type || spec.kind;
      if (type){
        const candidate = getRegisteredPassive(type);
        if (candidate) handler = candidate;
      }
      const mergedParams= {
        ...(basePassive.params || {}),
        ...(spec.params || {}),
      };
      if (spec.stats && typeof spec.stats === 'object'){
        mergedParams.stats = spec.stats;
      }
      if (spec.flatStats && typeof spec.flatStats === 'object'){
        mergedParams.flatStats = spec.flatStats;
      }
      resolved = { ...basePassive, params=== 'string' && spec.id.trim()){
        resolved.id = spec.id;
      }
      params = mergedParams;
      if (!handler && (mergedParams.stats || mergedParams.flatStats)){
        handler = gainStatsHandler;
      }
    } else if (!handler && basePassive.params && (basePassive.params.stats || basePassive.params.flatStats)){
      handler = gainStatsHandler;
    }

    return { handler: handler ?? defaultPassive, passive, params, key };
  };

  const STAT_ALIAS= new Map([
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

  const BASE_STAT_KEYS= [
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

  const normalizeStatKey = (stat)=> {
    if (typeof stat === 'string'){
      const trimmed = stat.trim();
      if (!trimmed) return null;
      const canonical = trimmed.replace(/[%_\s]/g, '').toLowerCase();
      return STAT_ALIAS.get(canonical) || trimmed;
    }
    return null;
  };

  const normalizeKey = (value)=> (typeof value === 'string' ? value.trim().toLowerCase() ;

  const toNumber = (value, fallback = 0)=>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;

  const ensureStatusContainer = (unit)=> {
    if (!unit) return;
    if (!Array.isArray(unit.statuses)) unit.statuses = [];
  };

  const stacksOf = (unit, id)=> {
    const status = Statuses.get(unit, id);
    return status ? status.stacks ?? 0 : 0;
  };

  /** @type {Record<string, PassiveEffectHandler>} */
  const PASSIVE_ENTRIES= {
    placeMark: EFFECTS.placeMark,
    'gainATK%': EFFECTS.gainATKPercent,
    'gainWIL%': EFFECTS.gainWILPercent,
    conditionalBuff,
    'gainRES%': EFFECTS.gainRESPct,
    gainBonus,
    gainStats,
    'gainStats%': EFFECTS.gainStats,
    statBuff,
    statGain,
    gainMaxHPPercent,
    surviveAtOneHP,
  };

  const PASSIVES= Object.freeze(
    Object.fromEntries(
      Object.entries(PASSIVE_ENTRIES).map(([key, handler]) => [
        key,
        typeof handler === 'function' ? handler : defaultPassive,
      ]),
    ) /* as PassiveRegistry */,
  );

  function getRegisteredPassive(key){
    if (!key) return null;
    const candidate = hasOwn(PASSIVES, key) ? PASSIVES[key] ;
    return typeof candidate === 'function' ? candidate : null;
  }

  /**
   * @param {SessionState | null | undefined} Game
   * @param {UnitToken | null | undefined} unit
   * @param {string} when
   * @param {Record<string, unknown>} [ctx]
   * @returns {void}
   */
  function emitPassiveEvent(
    Game,
    unit,
    when,
    ctx= {},
  ){
    if (!Game || !unit) return;
    const metaValue = Game.meta && typeof Game.meta.get === 'function' ? Game.meta.get(unit.id) ;
    const metaContext = coercePassiveMeta(metaValue);
    const kit = metaContext?.kit ?? null;
    ctx.meta = metaContext?.meta ?? null;
    ctx.kit = kit;
    if (!kit || !Array.isArray(kit.passives)) return;
    for (const passive of kit.passives /* as Array<PassiveSpec | null | undefined> */){
      if (!passive || passive.when !== when) continue;
      const effects = collectPassiveEffects(passive);
      if (!effects.length) continue;
      for (const effect of effects){
        const { handler, passive, params, key } = resolvePassiveEffect(passive, effect);
        if (typeof handler !== 'function') continue;
        if (!effectivePassive) continue;
        const handlerToUse = key === 'gainRES%' && params && params.perTarget != null
          ? EFFECTS.resPerSleeping
          : handler;
        if (typeof handlerToUse !== 'function') continue;
        if (!passiveConditionsOk({ Game, unit, passive, ctx })) continue;
        handlerToUse({ Game: Game ?? null, unit, passive, ctx });
      }
    }
  }

  /**
   * @param {SessionState | null | undefined} Game
   * @param {UnitToken | null | undefined} unit
   * @param {UnitKitConfig['onSpawn']} [onSpawn]
   * @returns {void}
   */
  function applyOnSpawnEffects(
    Game,
    unit,
    onSpawn?,
  ){
    if (!Game || !unit || !onSpawn) return;
    const config = isRecord(onSpawn) ? onSpawn : null;
    if (!config) return;
    ensureStatusContainer(unit);

    const effects= [];
    if (Array.isArray(config.effects)){
      for (const effect of config.effects){
        if (isRecord(effect)) effects.push(effect);
      }
    }

    if (Number.isFinite(config.teamHealOnEntry) && Number(config.teamHealOnEntry) > 0){
      effects.push({ type: 'teamHeal', amount, mode);
    }
    const casterHeal = (config.teamHealPercentMaxHPOfCaster ?? config.teamHealPercentCasterMaxHP) /* as number | undefined */;
    if (Number.isFinite(casterHeal) && Number(casterHeal) > 0){
      effects.push({ type: 'teamHeal', amount, mode);
    }

    if (Array.isArray(config.statuses)){
      for (const st of config.statuses){
        if (!st || typeof st !== 'object') continue;
        effects.push({ type: 'status', status);
      }
    }
    if (Array.isArray(config.addStatuses)){
      for (const st of config.addStatuses){
        if (!st || typeof st !== 'object') continue;
        effects.push({ type: 'status', status);
      }
    }
    if (config.status && typeof config.status === 'object'){
      effects.push({ type: 'status', status);
    }

    if (config.stats && typeof config.stats === 'object'){
      effects.push({ type: 'stats', stats, mode, purgeable);
    }
    if (config.flatStats && typeof config.flatStats === 'object'){
      effects.push({ type: 'stats', stats, mode, purgeable, id);
    }

    let statsChanged = false;
    for (const effect of effects){
      if (!effect) continue;
      const type = normalizeKey(effect.type ?? effect.kind ?? effect.effect);
      if (type === 'teamheal'){
        const amount = toNumber(effect.amount ?? effect.value ?? effect.percent, 0);
        if (amount <= 0) continue;
        const mode = effect.mode === 'casterMax' ? 'casterMax' : 'targetMax';
        healTeam(Game, unit, amount, { mode });
        continue;
      }
      if (type === 'status' || type === 'addstatus'){
        const statusEffect = effect.status;
        if (statusEffect && typeof statusEffect === 'object'){
          Statuses.add(unit, { ...(statusEffect /* as StatusEffect */), sourceUnitId);
        }
        continue;
      }
      if (type === 'stats' || type === 'stat' || type === 'buff'){
        const stats = effect.stats || effect.values;
        if (!stats || typeof stats !== 'object') continue;
        const effectId = typeof effect.id === 'string' && effect.id.trim() ? effect.id : 'onSpawn';
        const applied = applyStatMap(unit, ({ id: effectId } /* as PassiveSpec */), stats /* as Record<string */, number>, {
          mode: effect.mode === 'flat' ? 'flat' : (effect.statMode === 'flat' ? 'flat' : 'percent'),
          stack== false,
          stacks=== 'number' ? effect.stacks : undefined,
          purgeable== false,
          maxStacks=== 'number' ? effect.maxStacks : undefined,
          idPrefix,
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

  /**
   * @param {UnitToken | null | undefined} unit
   * @returns {void}
   */
  function prepareUnitForPassives(unit){
    if (!unit) return;
    ensureStatusContainer(unit);
    const captured = captureBaseStats(unit);
    if (!unit.baseStats || typeof unit.baseStats !== 'object'){
      unit.baseStats = { ...captured } /* as Record<string */, number>;
    } else {
      for (const [key, value] of Object.entries(captured)){
        if (!Number.isFinite((unit.baseStats /* as Record<string */, number>)[key])){
          (unit.baseStats /* as Record<string */, number>)[key] = value;
        }
      }
    }
    unit._recalcStats = () => recomputeFromStatuses(unit);
  }

  exports.recomputeUnitStats */ = recomputeFromStatuses /*;
  exports.stacksOf = stacksOf;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getPassiveLog')) exports.getPassiveLog = getPassiveLog;
  if (!Object.prototype.hasOwnProperty.call(exports, 'emitPassiveEvent')) exports.emitPassiveEvent = emitPassiveEvent;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyOnSpawnEffects')) exports.applyOnSpawnEffects = applyOnSpawnEffects;
  if (!Object.prototype.hasOwnProperty.call(exports, 'prepareUnitForPassives')) exports.prepareUnitForPassives = prepareUnitForPassives;
};
__modules['./scene.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/scene.ts
  const __dep0 = __require('./utils/format.ts');
  const stableStringify = __dep0.stableStringify;
};
__modules['./screens/arena-hub/index.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/arena-hub/index.ts
  const __dep0 = __require('./ui/dom.ts');
  const ensureStyleTag = __dep0.ensureStyleTag;
  const mountSection = __dep0.mountSection;
  const __dep1 = __require('./screens/main-menu/view/events.ts');
  const createModeCard = __dep1.createModeCard;
  const __dep2 = __require('./data/modes.ts');
  const MODE_INDEX = __dep2.MODE_INDEX;
  const MODES = __dep2.MODES;


  const STYLE_ID = 'arena-hub-screen-style';
  const ARENA_HUB_ID = 'arena-hub';
  const CHILD_ORDER= ['arena', 'beast-arena', 'co-ty-phu', 'chess-strategy-rpg', 'ares', 'challenge', 'campaign', 'vinh-da'];

  const CSS = /* css */ `
    .app--arena-hub{
      padding:32px 16px 64px;
    }
    .arena-hub{
      max-width:1040px;
      margin:0 auto;
      display:flex;
      flex-direction:column;
      gap:24px;
      color:inherit;
    }
    .arena-hub__header{
      display:flex;
      flex-direction:column;
      gap:16px;
    }
    .arena-hub__back{
      align-self:flex-start;
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:10px 18px;
      border-radius:999px;
      border:1px solid rgba(125,211,252,0.45);
      background:rgba(15,26,40,0.85);
      color:#d7ecff;
      cursor:pointer;
      font-size:13px;
      letter-spacing:.12em;
      text-transform:uppercase;
      transition:background 0.2s ease,border-color 0.2s ease,color 0.2s ease;
    }
    .arena-hub__back:hover,
    .arena-hub__back:focus-visible{
      background:rgba(18,32,48,0.95);
      border-color:rgba(125,211,252,0.75);
      color:#f1fbff;
      outline:none;
    }
    .arena-hub__titles{
      display:flex;
      flex-direction:column;
      gap:10px;
      max-width:640px;
    }
    .arena-hub__title{
      margin:0;
      font-size:40px;
      text-transform:uppercase;
      letter-spacing:.1em;
    }
    .arena-hub__subtitle{
      margin:0;
      color:#9cbcd9;
      line-height:1.6;
      font-size:16px;
    }
    .arena-hub__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;align-items:stretch;}
    .arena-hub__card{width:100%;min-height:132px;padding:14px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;overflow:hidden;}
    .arena-hub__card .mode-card__desc{display:none;}
    .arena-hub__card .mode-card__title{font-size:15px;line-height:1.2;white-space:normal;overflow-wrap:anywhere;}
    .arena-hub__card .mode-card__icon{font-size:24px;}
    .arena-hub__card .mode-card__tags{margin-top:auto;}
    .arena-hub__card[data-mode="vinh-da"]{background:#000000;border-color:rgba(220,220,255,.32);box-shadow:inset 0 0 28px rgba(84,66,150,.28),0 12px 32px rgba(0,0,0,.45);}
    }
  `;
};
__modules['./screens/campaign-world-map/index.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./ui/dom.ts');
  const ensureStyleTag = __dep0.ensureStyleTag;
  const mountSection = __dep0.mountSection;
  const __dep1 = __require('./data/campaign-stages.ts');
  const CAMPAIGN_STAGE_DATA = __dep1.CAMPAIGN_STAGE_DATA;
  const resolveBossName = __dep1.resolveBossName;
  const __dep2 = __require('./catalog.ts');
  const ROSTER = __dep2.ROSTER;
  const getMetaById = __dep2.getMetaById;
  const __dep3 = __require('./utils/domain-normalization.ts');
  const normalizeElementKey = __dep3.normalizeElementKey;
};
__modules['./screens/chess-strategy-rpg/battle.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./ui/dom.ts');
  const ensureStyleTag = __dep0.ensureStyleTag;
  const mountSection = __dep0.mountSection;
  const __dep1 = __require('./catalog.ts');
  const getMetaById = __dep1.getMetaById;
  const getUnitKitById = __dep1.getUnitKitById;
  const ROSTER = __dep1.ROSTER;
  const __dep2 = __require('./meta.ts');
  const makeInstanceStats = __dep2.makeInstanceStats;
  const __dep3 = __require('./utils/player-profile.ts');
  const loadPlayerProfile = __dep3.loadPlayerProfile;
  const __dep4 = __require('./utils/rng.ts');
  const createRngState = __dep4.createRngState;
  const nextRngValue = __dep4.nextRngValue;
  const __dep5 = __require('./cultivation.ts');
  const listCultivationRealmOptions = __dep5.listCultivationRealmOptions;
  const __dep6 = __require('./screens/chess-strategy-rpg/seed.ts');
  const hashSeedText = __dep6.hashSeedText;
  const resolveTacticalAiProfile = __dep6.resolveTacticalAiProfile;

  const STYLE_ID = 'chess-strategy-rpg-battle-style';
  const PREVIEW_CELL_SIZE = 30;

  const CSS = /* css */ `
    .app--chess-strategy-rpg-battle{min-height:100dvh;padding:16px;box-sizing:border-box;}
    .chess-rpg-battle{max-width:1200px;margin:0 auto;min-height:calc(100dvh - 32px);border-radius:20px;border:1px solid rgba(126,208,255,.26);background:linear-gradient(170deg,rgba(10,18,30,.95),rgba(10,28,40,.92));padding:20px;color:#e7f3ff;display:grid;gap:16px;}
    .chess-rpg-battle__back{justify-self:start;border:1px solid rgba(143,198,255,.5);background:rgba(8,19,31,.85);color:#e6f2ff;width:34px;height:34px;display:grid;place-items:center;border-radius:10px;padding:0;cursor:pointer;font-size:18px;line-height:1;}
    .chess-rpg-battle__hubs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
    .chess-hub{border:1px solid rgba(145,208,255,.24);background:rgba(13,31,45,.8);border-radius:16px;min-height:138px;padding:14px;display:grid;gap:10px;align-content:flex-start;}
    .chess-hub__title{margin:0;text-transform:uppercase;letter-spacing:.04em;font-size:14px;color:#d8ecff;}
    .chess-hub__text{margin:0;color:#9dc8eb;font-size:13px;line-height:1.45;}
    .chess-hub--center{border-color:rgba(250,205,106,.56);background:linear-gradient(175deg,rgba(62,45,17,.78),rgba(22,32,45,.86));}
    .chess-hub__action{width:max-content;border:1px solid rgba(246,198,99,.66);background:linear-gradient(140deg,#f9cb84,#f0a85e);color:#2b2211;border-radius:11px;padding:8px 12px;cursor:pointer;font-weight:800;}
    .chess-hub__realm{display:grid;gap:8px;}
    .chess-hub__seed-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
    .chess-hub__seed{
      flex:1 1 200px;
      background:rgba(6,13,22,.8);
      border:1px solid rgba(189,221,255,.25);
      color:#eff7ff;
      border-radius:10px;
      padding:7px 10px;
      font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
      letter-spacing:.04em;
      text-transform:uppercase;
    }
    .chess-hub__seed-random{
      border:1px solid rgba(189,221,255,.35);
      background:rgba(13,46,73,.82);
      color:#dff0ff;
      border-radius:9px;
      padding:6px 10px;
      cursor:pointer;
      font-weight:700;
    }
    .chess-hub__seed-help{margin:0;color:#9dc8eb;font-size:12px;line-height:1.4;}
    .chess-hub__select{background:rgba(6,13,22,.8);border:1px solid rgba(189,221,255,.25);color:#eff7ff;border-radius:10px;padding:7px 10px;}
    .chess-hub__ok{width:max-content;border:1px solid rgba(189,221,255,.35);background:rgba(13,46,73,.82);color:#dff0ff;border-radius:9px;padding:6px 12px;cursor:pointer;font-weight:700;}
    .chess-rpg-battle__meta{font-size:13px;color:#8ec4df;}
    .chess-rpg-battle__board{display:grid;gap:2px;align-self:start;justify-self:start;background:rgba(8,20,29,.82);padding:8px;border-radius:12px;border:1px solid rgba(131,213,255,.2);}
    .chess-rpg-battle__cell{width:${PREVIEW_CELL_SIZE}px;height:${PREVIEW_CELL_SIZE}px;border-radius:8px;border:1px solid rgba(145,198,228,.2);display:grid;place-items:center;font-size:10px;}
    .chess-rpg-battle__cell--void{opacity:.2;border-style:dashed;}
    .chess-rpg-battle__cell--play{background:rgba(22,66,92,.56);}
    .chess-rpg-battle__cell--player{background:rgba(26,117,90,.74);border-color:rgba(130,255,219,.6);font-weight:700;}
    .chess-rpg-battle__cell--enemy{background:rgba(126,42,72,.68);border-color:rgba(255,149,196,.56);font-weight:700;}
    .chess-rpg-battle__cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
    .chess-card{border:1px solid rgba(148,206,255,.2);background:rgba(8,21,32,.78);border-radius:12px;padding:10px;display:grid;gap:4px;}
    .chess-card__name{font-weight:700;}
    .chess-card__stat{font-size:12px;color:#b7dbf2;}
  `;
};
__modules['./screens/chess-strategy-rpg/match.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./ui/dom.ts');
  const ensureStyleTag = __dep0.ensureStyleTag;
  const mountSection = __dep0.mountSection;
  const __dep1 = __require('./screens/chess-strategy-rpg/battle.ts');
  const createIrregularBoard = __dep1.createIrregularBoard;
  const MIN_CORE_SIZE = __dep1.MIN_CORE_SIZE;
  const randomSeedText = __dep1.randomSeedText;
  const resolveEnemyUnitsForChess = __dep1.resolveEnemyUnitsForChess;
  const resolvePlayerUnits = __dep1.resolvePlayerUnits;
  const resolveValidSeed = __dep1.resolveValidSeed;
  const __dep2 = __require('./screens/chess-strategy-rpg/turn-state.ts');
  const advanceTurn = __dep2.advanceTurn;
  const canUseCommand = __dep2.canUseCommand;
  const createInitialMatchState = __dep2.createInitialMatchState;
  const applyActionCommand = __dep2.applyActionCommand;
  const applySkipAction = __dep2.applySkipAction;
  const evaluateObjectiveResult = __dep2.evaluateObjectiveResult;
  const chooseFallbackAction = __dep2.chooseFallbackAction;
  const consumeDecisionTime = __dep2.consumeDecisionTime;
  const PLAYER_TURN_CAP = __dep2.PLAYER_TURN_CAP;
  const recordMove = __dep2.recordMove;
  const resolveAction = __dep2.resolveAction;
  const resolveActionUiEffects = __dep2.resolveActionUiEffects;
  const resolveRescueBarrier = __dep2.resolveRescueBarrier;
  const resolveSummonCapAfterSpawn = __dep2.resolveSummonCapAfterSpawn;
  const scoreAliveUnitPoints = __dep2.scoreAliveUnitPoints;
  const SUMMON_CAP_PER_TEAM = __dep2.SUMMON_CAP_PER_TEAM;
  const __dep3 = __require('./screens/chess-strategy-rpg/seed.ts');
  const resolveTacticalAiProfile = __dep3.resolveTacticalAiProfile;
  const TacticalAiProfile = __dep3.TacticalAiProfile;

  const STYLE_ID = 'chess-strategy-rpg-match-style';
  const CARDINAL_DIRS = Object.freeze([{ dx: 1, dy, { dx: -1, dy, { dx: 0, dy, { dx: 0, dy);
  const DIAGONAL_DIRS = Object.freeze([{ dx: 1, dy, { dx: 1, dy, { dx: -1, dy, { dx: -1, dy);
  const KNIGHT_JUMPS = Object.freeze([
    { dx: 1, dy, { dx: 2, dy, { dx: -1, dy, { dx: -2, dy,
    { dx: 1, dy, { dx: 2, dy, { dx: -1, dy, { dx: -2, dy,
  ]);
  const CHESS_MOVE_CAP = 7;
  const PLAYER_HP_LOSS_COLOR = 'rgba(255, 196, 118, 0.9)';
  const ENEMY_HP_LOSS_COLOR = 'rgba(136, 211, 255, 0.9)';

  const CSS = /* css */ `
    .app--chess-strategy-rpg-match{min-height:100dvh;padding:16px;box-sizing:border-box;}
    .chess-rpg-match{max-width:1320px;margin:0 auto;min-height:calc(100dvh - 32px);border-radius:20px;border:1px solid rgba(126,208,255,.3);background:linear-gradient(170deg,rgba(8,18,31,.98),rgba(14,35,57,.92));padding:18px;color:#e7f3ff;display:grid;gap:14px;}
    .chess-rpg-match__cell--player{background:linear-gradient(to top,var(--unit-hp-base, rgba(26,117,90,.74)) var(--unit-hp-pct, 100%), var(--unit-hp-loss, rgba(255,196,118,.9)) var(--unit-hp-pct, 100%));border-color:rgba(130,255,219,.6);font-weight:700;color:#95ffd9;}
    .chess-rpg-match__cell--enemy{background:linear-gradient(to top,var(--unit-hp-base, rgba(126,42,72,.68)) var(--unit-hp-pct, 100%), var(--unit-hp-loss, rgba(136,211,255,.9)) var(--unit-hp-pct, 100%));border-color:rgba(255,149,196,.56);font-weight:700;color:#ffc3dd;}
    .chess-rpg-match__meta{font-size:13px;color:#8ec4df;}
    .chess-rpg-match__field{position:relative;overflow:auto;border:1px solid rgba(121,187,228,.32);border-radius:14px;background:radial-gradient(circle at 35% 20%, rgba(43,106,146,.26), rgba(5,13,23,.95));padding:12px;min-height:78dvh;display:grid;align-content:start;justify-content:start;}
    .chess-rpg-match__board{display:grid;gap:2px;align-self:start;justify-self:start;background:rgba(8,20,29,.82);padding:8px;border-radius:12px;border:1px solid rgba(131,213,255,.2);}
    .chess-rpg-match__cell{width:var(--chess-cell-size, 42px);height:var(--chess-cell-size, 42px);border-radius:8px;border:1px solid rgba(145,198,228,.2);display:grid;place-items:center;font-size:11px;}
    .chess-rpg-match__cell--void{opacity:.2;border-style:dashed;}
    .chess-rpg-match__cell--play{background:rgba(22,66,92,.56);}
    .chess-rpg-match__cell--player{background:rgba(26,117,90,.74);border-color:rgba(130,255,219,.6);font-weight:700;color:#95ffd9;}
    .chess-rpg-match__cell--enemy{background:rgba(126,42,72,.68);border-color:rgba(255,149,196,.56);font-weight:700;color:#ffc3dd;}
    .chess-rpg-match__cell--selected{outline:2px solid rgba(255,229,142,.96);outline-offset:-2px;}
    .chess-rpg-match__cell--move{background:rgba(50,170,83,.72);border-color:rgba(150,255,176,.94);color:#e8fff0;cursor:pointer;}
    .chess-rpg-match__cell--attack-zone{background:rgba(197,117,37,.44);border-color:rgba(255,192,113,.72);}
    .chess-rpg-match__cell--attack-target{background:radial-gradient(circle at center, rgba(255,241,168,.85), rgba(190,74,58,.72));border-color:rgba(255,234,157,.98);box-shadow:0 0 12px rgba(255,220,120,.75);cursor:pointer;}
    .chess-rpg-match__turn{margin:0;font-size:13px;color:#bce2ff;}
    .chess-rpg-match__pieces{display:flex;flex-wrap:wrap;gap:6px;}
    .chess-rpg-match__piece{font-size:12px;border:1px solid rgba(161,216,255,.4);border-radius:999px;padding:2px 8px;background:rgba(31,74,107,.5);color:#e6f3ff;}
    .chess-rpg-match__piece--active{border-color:rgba(163,255,183,.78);background:rgba(43,121,72,.52);color:#ebffef;}
    .chess-rpg-match__actions{display:flex;flex-wrap:wrap;gap:8px;}
    .chess-rpg-match__action-btn{border:1px solid rgba(149,210,248,.5);background:rgba(19,47,73,.82);color:#ecf7ff;border-radius:10px;padding:6px 12px;font-size:12px;cursor:pointer;}
    .chess-rpg-match__action-btn:disabled{opacity:.45;cursor:not-allowed;}
    .chess-rpg-match__result{padding:10px 12px;border-radius:10px;border:1px solid rgba(247,192,124,.6);background:rgba(76,38,19,.4);font-size:13px;color:#ffe4ca;}
  `;
};
__modules['./screens/chess-strategy-rpg/ready.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./ui/dom.ts');
  const ensureStyleTag = __dep0.ensureStyleTag;
  const mountSection = __dep0.mountSection;

  const STYLE_ID = 'chess-strategy-rpg-ready-style';

  const CSS = /* css */ `
    .app--chess-strategy-rpg-ready{
      min-height:100dvh;
      padding:20px 16px;
      box-sizing:border-box;
    }
    .chess-strategy-rpg-ready{
      max-width:1100px;
      margin:0 auto;
      min-height:calc(100dvh - 40px);
      border-radius:20px;
      border:1px solid rgba(125,211,252,.24);
      background:linear-gradient(160deg, rgba(11,20,34,.96), rgba(17,33,52,.88));
      color:#e6f2ff;
      display:flex;
      flex-direction:column;
      gap:18px;
      padding:24px;
    }
    .chess-strategy-rpg-ready__back{
      align-self:flex-start;
      border:1px solid rgba(148,199,255,.5);
      background:rgba(10,20,33,.85);
      width:34px;
      height:34px;
      display:grid;
      place-items:center;
      border-radius:10px;
      color:#e8f2ff;
      padding:0;
      cursor:pointer;
      font-size:18px;
      line-height:1;
    }
    .chess-strategy-rpg-ready__title{margin:0;font-size:30px;letter-spacing:.04em;text-transform:uppercase;}
    .chess-strategy-rpg-ready__desc{max-width:700px;margin:0;color:#9ec3e8;line-height:1.6;}
    .chess-strategy-rpg-ready__spec{display:grid;gap:10px;padding:16px 18px;border-radius:18px;border:1px solid rgba(148,199,255,.2);background:rgba(9,20,32,.72);}
    .chess-strategy-rpg-ready__spec-title{margin:0;font-size:16px;letter-spacing:.05em;text-transform:uppercase;color:#dff0ff;}
    .chess-strategy-rpg-ready__spec-list{margin:0;padding-left:20px;display:grid;gap:8px;color:#e6f2ff;line-height:1.55;}
    .chess-strategy-rpg-ready__footer{margin-top:auto;display:flex;justify-content:flex-end;}
    .chess-strategy-rpg-ready__attack{
      border:1px solid rgba(246,198,99,.66);
      background:linear-gradient(140deg,#f9cb84,#f0a85e);
      color:#2b2211;
      border-radius:14px;
      padding:12px 24px;
      text-transform:uppercase;
      letter-spacing:.08em;
      font-weight:800;
      cursor:pointer;
      display:inline-flex;
      align-items:center;
      gap:10px;
    }
   .chess-strategy-rpg-ready__attack-icon{font-size:18px;line-height:1;}
  `;
};
__modules['./screens/chess-strategy-rpg/seed.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./utils/rng.ts');
  const createRngState = __dep0.createRngState;
  const nextRngValue = __dep0.nextRngValue;



  function hashSeedText(seedText){
    let hash = 2166136261 >>> 0;
    for (let i = 0; i < seedText.length; i += 1) {
      hash ^= seedText.charCodeAt(i);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash >>> 0;
  }

  function resolveTacticalAiProfile(seedText){
    const profileRoll = nextRngValue(createRngState(hashSeedText(`${seedText};
    if (profileRoll < 0.2) return 'Aggressive';
    if (profileRoll < 0.4) return 'Defensive';
    return 'Neutral';
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'hashSeedText')) exports.hashSeedText = hashSeedText;
  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveTacticalAiProfile')) exports.resolveTacticalAiProfile = resolveTacticalAiProfile;
};
__modules['./screens/chess-strategy-rpg/turn-state.ts'] = (exports, module, __require) => {

};
__modules['./screens/collection/helpers.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/collection/helpers.ts
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
  const __dep5 = __require('./utils/currency.ts');
  const getCurrencyDefinitions = __dep5.getCurrencyDefinitions;

  const isRosterEntryLite = (value)=> (
    typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
  );

  const EXCLUDED_COLLECTION_TAGS = new Set(['npc', 'pve']);
  const UNIT_COST_BY_ID = new Map(
    UNITS.map((unit) => [normalizeUnitId(unit.id), unit.cost] /* /* as const */ */),
  );

  function hasExcludedCollectionTags(tags){
    if (!Array.isArray(tags)) return false;
    for (const value of tags) {
      if (typeof value !== 'string') continue;
      if (EXCLUDED_COLLECTION_TAGS.has(value.trim().toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  function isCollectionPlayableUnit(entry){
    if (!isRosterEntryLite(entry)) return false;
    return !hasExcludedCollectionTags((entry /* as { tags: unknown } */).tags);
  }

  const ABILITY_TYPE_LABELS = Object.freeze({
    basic: 'Đánh thường',
    active,
    ultimate,
    talent,
    technique,
    passive,
  });

  const TARGET_LABELS= Object.freeze({
    single: 'Đơn mục tiêu',
    singleTarget,
    randomEnemies,
    randomRow,
    randomColumn,
    allEnemies,
    allAllies,
    allies,
    self,
    'self+2allies': 'Bản thân + 2 đồng minh',
  });
  if (!Object.prototype.hasOwnProperty.call(exports, 'ABILITY_TYPE_LABELS')) exports.ABILITY_TYPE_LABELS = ABILITY_TYPE_LABELS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isCollectionPlayableUnit')) exports.isCollectionPlayableUnit = isCollectionPlayableUnit;
};
__modules['./screens/collection/index.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/collection/index.ts
  const __dep1 = __require('./screens/collection/view.ts');
  const renderCollectionView = __dep1.renderCollectionView;
  const __dep2 = __require('./types/currency.ts');
  const isLineupCurrencies = __dep2.isLineupCurrencies;
  const normalizeCurrencyBalances = __dep2.normalizeCurrencyBalances;

  const isUnknownRecord = (value)=> (
    typeof value === 'object' && value !== null && !Array.isArray(value)
  );

  const toClonedRecord = (value)=> ({ ...value });

  function mergeParams(base, override){
    if (!base && !override) return null;
    if (!base){
      if (isUnknownRecord(override)){
        return toClonedRecord(override) /* as TValue */;
      }
      return override ?? null;
    }
    if (!override){
      if (isUnknownRecord(base)){
        return toClonedRecord(base /* as unknown as UnknownRecord */) /* as TValue */;
      }
      return base ?? null;
    }
    if (isUnknownRecord(base) && isUnknownRecord(override)){
      return { ...base, ...override } /* as TValue */;
    }
    return override ?? null;
  }

  const toCollectionParams = (value)=> (
    isUnknownRecord(value) ? value /* as CollectionDefinitionParams : null */
  );

  function mergePlayerState(
    definitionParams,
    params,
  ){
    const merged = mergeParams(definitionParams?.playerState ?? null, params?.playerState ?? null);
    return merged ?? {};
  }

  function resolveRoster(
    definitionParams,
    params,
  ){
    const override = Array.isArray(params?.roster) ? params.roster : null;
    const base = Array.isArray(definitionParams?.roster) ? definitionParams.roster : null;
    return override ?? base ?? [];
  }

  function resolveCurrencies(
    definitionParams,
    params,
    playerState,
  ){
    const override = params?.currencies;
    if (isLineupCurrencies(override)){
      return override ?? null;
    }
    const base = definitionParams?.currencies;
    if (isLineupCurrencies(base)){
      return base ?? null;
    }
    return normalizeCurrencyBalances(playerState);
  }

  function renderCollectionScreen(options){
    const {
      root,
      shell = null,
      definition = null,
      params = null,
    } = options;
    if (!root){
      throw new Error('renderCollectionScreen cần một phần tử root hợp lệ.');
    }

    const definitionParams = toCollectionParams(definition?.params ?? null);
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
};
__modules['./screens/collection/state.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/collection/state.ts



  function createFilterState(initial?){
    return {
      activeTab: initial?.activeTab ?? null,
      selectedUnitId,
    };
  }

  function updateActiveTab(state, tab){
    state.activeTab = tab;
  }

  function updateSelectedUnit(state, unitId){
    state.selectedUnitId = unitId;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'createFilterState')) exports.createFilterState = createFilterState;
  if (!Object.prototype.hasOwnProperty.call(exports, 'updateActiveTab')) exports.updateActiveTab = updateActiveTab;
  if (!Object.prototype.hasOwnProperty.call(exports, 'updateSelectedUnit')) exports.updateSelectedUnit = updateSelectedUnit;
};
__modules['./screens/collection/types.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/collection/types.ts
};
__modules['./screens/collection/view.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/collection/view.ts
  const __dep0 = __require('./art.ts');
  const getUnitArt = __dep0.getUnitArt;
  const __dep1 = __require('./utils/unit-id.ts');
  const normalizeUnitId = __dep1.normalizeUnitId;
  const __dep2 = __require('./data/skills.ts');
  const getSkillSet = __dep2.getSkillSet;
  const __dep3 = __require('./utils/format.ts');
  const createNumberFormatter = __dep3.createNumberFormatter;
  const __dep4 = __require('./cultivation.ts');
  const upgradeCultivation = __dep4.upgradeCultivation;
  const getCultivationCost = __dep4.getCultivationCost;
  const CultivationPlayerState = __dep4.CultivationPlayerState;
  const __dep5 = __require('./data/economy.ts');
  const getCultivationRealmEconomy = __dep5.getCultivationRealmEconomy;
  const __dep6 = __require('./utils/currency.ts');
  const createNormalizedWallet = __dep6.createNormalizedWallet;
  const getSharedCurrencyWallet = __dep6.getSharedCurrencyWallet;
  const subscribeSharedCurrencyWallet = __dep6.subscribeSharedCurrencyWallet;
  const syncSharedCurrencyWallet = __dep6.syncSharedCurrencyWallet;
  const __dep7 = __require('./ui/dom.ts');
  const assertElement = __dep7.assertElement;
  const ensureStyleTag = __dep7.ensureStyleTag;
  const mountSection = __dep7.mountSection;
  const __dep8 = __require('./utils/rarity.ts');
  const normalizeRarity = __dep8.normalizeRarity;
  const __dep9 = __require('./data/roster-preview.ts');
  const ROSTER_PREVIEWS = __dep9.ROSTER_PREVIEWS;
  const __dep10 = __require('./data/roster-preview.ts');
  const TP_DELTA = __dep10.TP_DELTA;
  const __dep11 = __require('./catalog.ts');
  const CLASS_GROWTH = __dep11.CLASS_GROWTH;
  const __dep12 = __require('./unit-stat-resolver.ts');
  const resolveFinalCollectionUnitStats = __dep12.resolveFinalCollectionUnitStats;
  const __dep13 = __require('./utils/equipment.ts');
  const EQUIPMENT_INVENTORY = __dep13.EQUIPMENT_INVENTORY;
  const EQUIPMENT_ITEM_BY_ID = __dep13.EQUIPMENT_ITEM_BY_ID;
  const EQUIPMENT_SLOT_FILTER = __dep13.EQUIPMENT_SLOT_FILTER;
  const EQUIPMENT_SLOT_LABEL = __dep13.EQUIPMENT_SLOT_LABEL;
  const EQUIPMENT_SLOT_SEQUENCE = __dep13.EQUIPMENT_SLOT_SEQUENCE;
  const TP_ALLOCATABLE_KEYS = __dep13.TP_ALLOCATABLE_KEYS;
  const TP_STAT_GAIN_PER_POINT = __dep13.TP_STAT_GAIN_PER_POINT;
  const normalizeUnitEquipmentState = __dep13.normalizeUnitEquipmentState;
  const resolveEquipmentTpAllocation = __dep13.resolveEquipmentTpAllocation;
  const __dep14 = __require('./screens/collection/helpers.ts');
  const ABILITY_TYPE_LABELS = __dep14.ABILITY_TYPE_LABELS;
  const buildRosterWithCost = __dep14.buildRosterWithCost;
  const cloneRoster = __dep14.cloneRoster;
  const collectAbilityFacts = __dep14.collectAbilityFacts;
  const describeUlt = __dep14.describeUlt;
  const formatTagLabel = __dep14.formatTagLabel;
  const labelForAbility = __dep14.labelForAbility;
  const resolveCurrencyBalance = __dep14.resolveCurrencyBalance;
  const getCurrencyCatalog = __dep14.getCurrencyCatalog;
  const ensureNumberFormatter = __dep14.ensureNumberFormatter;
  const __dep15 = __require('./screens/collection/state.ts');
  const createFilterState = __dep15.createFilterState;
  const updateActiveTab = __dep15.updateActiveTab;
  const updateSelectedUnit = __dep15.updateSelectedUnit;
  const __dep16 = __require('./utils/player-profile.ts');
  const isUnitOwnedByProfile = __dep16.isUnitOwnedByProfile;
  const loadPlayerProfile = __dep16.loadPlayerProfile;
  const patchPlayerProfile = __dep16.patchPlayerProfile;





  const STYLE_ID = 'collection-view-style-v2';

  const TAB_DEFINITIONS = [
    { key: 'skills', label, hint, chuỗi nâng cấp và yêu cầu nguyên liệu.', icon,
    { key: 'arts', label, hint, pháp khí và trang bị đang trang bị cho nhân vật.', icon,
    { key: 'skins', label, hint, icon,
    { key: 'voice', label, hint, thiết lập voice pack và gợi ý mở khóa.', icon= TAB_DEFINITIONS.reduce((acc, tab) => {
    acc[tab.key] = tab.hint;
    return acc;
  }, {} /* as Record<CollectionTabKey */, string>);

  function resolveRosterCellGap(baseGapPx, reductionRatio){
    const normalizedBase = Number.isFinite(baseGapPx) ? Math.max(0, baseGapPx) ;
    const normalizedRatio = Number.isFinite(reductionRatio) ? Math.min(Math.max(reductionRatio, 0), 1) ;
    const reducedGap = normalizedBase * (1 - normalizedRatio);
    return `${Math.max(0, reducedGap).toFixed(2)}px`;
  }

  function clearChildren(node){
    node.replaceChildren();
  }

  const currencyCatalog= getCurrencyCatalog();
  const currencyFormatter = ensureNumberFormatter(createNumberFormatter, 'vi-VN');
  const CORE_STAT_KEYS = ['HP', 'WIL', 'ATK', 'RES', 'ARM'] /* /* as const */ */;

  function resolveClassGrowthByUnit(unit){
    const className = typeof unit?.class === 'string' ? unit.class : '';
    const growth = (CLASS_GROWTH /* as Record<string */, Record<string, number> | undefined>)[className];
    return growth ?? Object.fromEntries(Object.keys(TP_DELTA).map((key) => [key, 1]));
  }


  function isItemCompatibleWithSlot(item, slotKey){
    return item.slot === EQUIPMENT_SLOT_FILTER[slotKey];
  }

    function sumTpAllocation(allocation, number>> | null | undefined){
    if (!allocation) return 0;
    let total = 0;
    for (const rawValue of Object.values(allocation)){
      const numeric = Number(rawValue);
      if (!Number.isFinite(numeric) || numeric <= 0) continue;
      total += numeric;
    }
    return total;
  }

  function resolveEquippedItemUsage(equipment){
    const usage = new Map();
    for (const slot of EQUIPMENT_SLOT_SEQUENCE){
      const id = equipment[slot];
      if (!id) continue;
      usage.set(id, (usage.get(id) ?? 0) + 1);
    }
    return usage;
  }

  function resolveAvailableQuantityForItem(params){
    const item = EQUIPMENT_ITEM_BY_ID.get(params.itemId);
    if (!item) return 0;
    const baseQuantity = Math.max(1, Math.floor(Number(item.quantity ?? 1)));
    const usage = resolveEquippedItemUsage(params.equipment);
    let used = usage.get(params.itemId) ?? 0;
    if (params.slotKey && params.equipment[params.slotKey] === params.itemId){
      used = Math.max(0, used - 1);
    }
    return Math.max(0, baseQuantity - used);
  }

  const K_TP_COMBAT_POWER = 10;

  const TP_EQUIVALENT_GAIN_BY_STAT= Object.freeze({
    HP: TP_STAT_GAIN_PER_POINT.HP,
    HPmax,
    ATK,
    WIL,
    ARM,
    RES,
    AGI,
    PER,
    AEmax,
    AEregen,
    HPregen,
    SPD,
  });

  const TP_EQUIVALENT_STAT_KEYS = new Set(Object.keys(TP_EQUIVALENT_GAIN_BY_STAT));

  function toTpEquivalentFromStat(statKey, value){
    const gain = TP_EQUIVALENT_GAIN_BY_STAT[statKey];
    if (gain == null || !Number.isFinite(gain) || gain <= 0) return 0;
    if (!Number.isFinite(value) || value <= 0) return 0;
    return value / gain;
  }

  function readCombatPowerTpBonus(raw){
    if (!raw || typeof raw !== 'object') return 0;
    const queue= [raw];
    let total = 0;
    let hops = 0;
    while (queue.length > 0 && hops < 256) {
      hops += 1;
      const current = queue.shift();
      if (!current || typeof current !== 'object') continue;

      if (Array.isArray(current)) {
        for (const item of current) queue.push(item);
        continue;
      }

      const record = current /* as Record<string */, unknown>;
      for (const [rawKey, rawValue] of Object.entries(record)) {
        const key = rawKey.trim();
        const keyLower = key.toLowerCase();

        if (keyLower === 'combatpowertpbonus' || keyLower === 'powertpbonus' || keyLower === 'tpequivalent') {
          const numeric = typeof rawValue === 'number' ? rawValue : Number(rawValue);
          if (Number.isFinite(numeric) && numeric > 0) total += numeric;
          continue;
        }

        if (typeof rawValue === 'number' && Number.isFinite(rawValue) && rawValue > 0 && TP_EQUIVALENT_STAT_KEYS.has(key)) {
          total += toTpEquivalentFromStat(key, rawValue);
          continue;
        }

        if (rawValue && typeof rawValue === 'object') {
          queue.push(rawValue);
        }
      }
    }
    return Math.max(0, total);
  }

  const TP_GAIN_RULES
    fromRealm: number;
    fromSubRealm: number;
    toRealm: number;
    toSubRealm: number;
    gain: number;
  }> = Object.freeze([
    { fromRealm: 1, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 1, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 1, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 1, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 1, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 1, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 1, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 1, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 1, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 1, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 2, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 2, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 2, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 2, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 2, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 2, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 2, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 2, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 2, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 3, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 3, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 3, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 3, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 3, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 3, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 3, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 3, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 3, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 4, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 4, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 4, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 4, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 4, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 4, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 4, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 4, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 4, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 5, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 5, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 5, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 5, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 5, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 5, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 5, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 6, fromSubRealm, toRealm, toSubRealm, gain,
    { fromRealm: 6, fromSubRealm, toRealm, toSubRealm, gain,
   ]); 

  const TP_GAIN_RULE_LOOKUP= Object.freeze(
    Object.fromEntries(
      TP_GAIN_RULES.map((rule) => [
        `${rule.fromRealm}{rule.fromSubRealm}->${rule.toRealm}{rule.toSubRealm}`,
        rule.gain,
      ])
    )
  );

  const TP_FALLBACK_PER_SUBREALM_BY_REALM= Object.freeze({
    1: 5,
    2: 10,
    3: 50,
    4: 170,
    5: 450,
    6: 925,
    7: 1200,
    8: 1500,
    9: 1800,
  });

  const TP_FALLBACK_BREAKTHROUGH_BY_REALM= Object.freeze({
    1: 30,
    2: 70,
    3: 150,
    4: 300,
    5: 825,
    6: 1200,
    7: 1500,
    8: 1800,
  });

  function resolveRealmMaxSubRealm(realm){
    const realmEconomy = getCultivationRealmEconomy(realm);
    return realmEconomy?.subRealmCosts.length ?? 0;
  }

  function resolveNextCultivationStep(realm, subRealm){ realm: number; subRealm: number } | null {
    const currentMaxSubRealm = resolveRealmMaxSubRealm(realm);
    if (currentMaxSubRealm <= 0) return null;

    if (subRealm < currentMaxSubRealm){
      return { realm, subRealm) <= 0){
      return null;
    }
    return { realm: realm + 1, subRealm){
    if (params.toRealm === params.fromRealm){
      return TP_FALLBACK_PER_SUBREALM_BY_REALM[params.toRealm] ?? 0;
    }
    return TP_FALLBACK_BREAKTHROUGH_BY_REALM[params.fromRealm] ?? 0;
  }

  function resolveTpGainForUpgrade(params){
    const key = `${params.fromRealm}{params.fromSubRealm}->${params.toRealm}{params.toSubRealm}`;
    const explicit = TP_GAIN_RULE_LOOKUP[key];
    if (typeof explicit === 'number') return explicit;
    return resolveFallbackTpGain(params);
  }

  function resolveTotalEarnedTp(realm, subRealm){
    const normalizedRealm = Number.isFinite(realm) ? Math.max(1, Math.floor(realm)) ;
    const normalizedSubRealm = Number.isFinite(subRealm) ? Math.max(0, Math.floor(subRealm)) ;

    let cursorRealm = 1;
    let cursorSubRealm = 0;
    let total = 0;

    while (cursorRealm < normalizedRealm || (cursorRealm === normalizedRealm && cursorSubRealm < normalizedSubRealm)){
      const next = resolveNextCultivationStep(cursorRealm, cursorSubRealm);
      if (!next) break;
      total += resolveTpGainForUpgrade({
        fromRealm: cursorRealm,
        fromSubRealm,
        toRealm,
        toSubRealm,
      });
      cursorRealm = next.realm;
      cursorSubRealm = next.subRealm;
    }

    return Math.max(0, Math.floor(total));
  }

  function normalizeTpAllocMap(value){
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const input = value /* as Record<string */, unknown>;
    const result= {};
    for (const key of TP_ALLOCATABLE_KEYS){
      const raw = input[key];
      const no = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(no) || no <= 0) continue;
      result[key] = Math.floor(no);
    }
    return result;
  }

  function resolveTpBonusForStat(statKey, allocation){
    const key = statKey /* as TpStatKey */;
    if (!TP_ALLOCATABLE_KEYS.includes(key)) return 0;
    const points = Number(allocation[key] ?? 0);
    if (!Number.isFinite(points) || points <= 0) return 0;
    return points * TP_STAT_GAIN_PER_POINT[key];
  }

  function toFiniteStatValue(value){
    if (typeof value !== 'number') return null;
    return Number.isFinite(value) ? value : null;
  }

  function resolveStatGainFromTpPoints(statKey, tpPoints){
    const gain = TP_EQUIVALENT_GAIN_BY_STAT[statKey];
    if (gain == null || !Number.isFinite(gain) || gain <= 0) return tpPoints;
    return tpPoints * gain;
  }

   value: number }>;
    tpAlloc: TpAllocMap;
    equipmentTpAlloc: Record<string, number>;
  };

  function resolveUnitStatPreview(params){
    const { unitId } = params;
    const tpAlloc = normalizeTpAllocMap(params.tpAllocation ?? {});
    const equipment = normalizeUnitEquipmentState(params.equipment ?? {});
    const equipmentTpAlloc = resolveEquipmentTpAllocation(equipment);
    if (!unitId) return { stats: [], tpAlloc, equipmentTpAlloc };

    const preview = ROSTER_PREVIEWS[unitId];
    const finalStats = preview?.final /* as Record<string */, unknown> | undefined;
    if (!finalStats) return { stats: [], tpAlloc, equipmentTpAlloc };

    const resolvedStats = resolveFinalCollectionUnitStats({
      unitId,
      progress,
        subRealm,
        tpAlloc,
        equipment,
      },
      hasCultivationData,
    });
    const statByCatalogKey= {
      HP: resolvedStats.hpMax,
      HPmax,
      ATK,
      WIL,
      ARM,
      RES,
      AGI,
      PER,
      SPD,
      AEmax,
      AEregen,
      HPregen,
    };

    const rows; value: number }> = [];
    const hp = toFiniteStatValue(statByCatalogKey.HP ?? finalStats.HPmax ?? finalStats.HP ?? null);
    if (hp != null){
      rows.push({ key: 'HP', value);
    }

    for (const [key, rawValue] of Object.entries(finalStats)){
      if (key === 'HP' || key === 'HPmax') continue;
      const resolvedValue = toFiniteStatValue(statByCatalogKey[key]);
      const fallbackValue = toFiniteStatValue(rawValue);
      const value = resolvedValue ?? fallbackValue;
      if (value == null) continue;
      rows.push({ key, value });
    }

    return { stats: rows, tpAlloc, equipmentTpAlloc };
  }

  function resolveCollectionCombatPower(preview, totalTp, catalogTpEquivalent = 0){
    const normalizedTotalTp = Number.isFinite(totalTp) && totalTp > 0 ? Math.floor(totalTp) ;
    const tpScore = normalizedTotalTp * K_TP_COMBAT_POWER;
    const statTpEquivalent = preview.stats.reduce((sum, stat) => sum + toTpEquivalentFromStat(stat.key, stat.value), 0);
    const normalizedCatalogBonus = Number.isFinite(catalogTpEquivalent) && catalogTpEquivalent > 0 ? catalogTpEquivalent : 0;
    return Math.max(0, Math.round(tpScore + statTpEquivalent + normalizedCatalogBonus));
  }

  function toSafeText(value){
    if (value == null){
      return '';
    }
    if (typeof value === 'number'){
      return Number.isFinite(value) ? String(value) ;
    }
    return value;
  }

  function parseJsonArrayFromDataset(value){
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((entry) => (typeof entry === 'string' ? entry.trim() 
        .filter((entry) => entry.length > 0);
    } catch {
      return [];
    }
  }

  function parseFactListFromDataset(value){
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return [];
      const normalizedFacts= [];
      for (const entry of parsed){
        if (!entry || typeof entry !== 'object') continue;
        const fact = entry /* as Partial<AbilityFact> */;
        const normalizedValue = toSafeText(fact.value ?? '');
        if (!normalizedValue) continue;
        normalizedFacts.push({
          icon: toSafeText(fact.icon ?? '') || null,
          label) || null,
          value,
          tooltip) || null,
        });
      }
      return normalizedFacts;
    } catch {
      return [];
    }
  }

  function ensureStyles(){
    const rosterCellGap = resolveRosterCellGap(78, 0.25);
    const css = `
      .app--collection{padding:32px 16px 64px;}
      .collection-view{--collection-tab-icon-size:36px;--collection-hub-left-shift:calc(var(--collection-tab-icon-size) * 3);max-width:1280px;margin:0 auto;display:flex;flex-direction:column;gap:28px;color:inherit;}
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
      .collection-view__layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(0,3.3fr) max-content;gap:24px;align-items:stretch;position:relative;}
      .collection-roster{border-radius:0;border:none;background:none;padding:0;display:flex;flex-direction:column;gap:12px;overflow:visible;z-index:3;margin-right:calc(-10vw);}
      .collection-roster__list{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(3,max-content);column-gap:${rosterCellGap};row-gap:${rosterCellGap};justify-content:start;max-height:560px;overflow:auto;padding-right:4px;}
      .collection-roster__list > li{width:max-content;height:max-content;}
      .collection-roster__entry{display:inline-flex;align-items:center;justify-content:center;gap:0;padding:0;border-radius:0;border:none;background:none;color:inherit;cursor:pointer;transition:transform .18s ease,filter .18s ease;width:auto;}
      .collection-roster__entry:hover{transform:translateY(-2px);filter:brightness(1.08);}
      .collection-roster__entry:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
      .collection-roster__entry.is-selected{filter:brightness(1.15) saturate(1.05);}
      .collection-roster__entry[data-rank="S"]{--entry-bg:rgba(38,20,52,.78);--entry-bg-hover:rgba(48,26,68,.92);--entry-bg-selected:rgba(54,30,74,.96);--entry-border:rgba(255,180,255,.4);--entry-border-hover:rgba(255,204,255,.58);--entry-border-selected:rgba(255,228,255,.72);--entry-shadow:0 0 0 1px rgba(255,192,255,.2);--entry-shadow-hover:0 10px 26px rgba(150,66,188,.45);--entry-shadow-selected:0 18px 44px rgba(150,66,188,.6);}
      .collection-roster__entry[data-rank="A"]{--entry-bg:rgba(30,40,58,.78);--entry-bg-hover:rgba(38,50,72,.92);--entry-bg-selected:rgba(44,58,84,.96);--entry-border:rgba(124,187,255,.35);--entry-border-hover:rgba(158,208,255,.52);--entry-border-selected:rgba(188,226,255,.7);--entry-shadow:0 0 0 1px rgba(140,200,255,.2);--entry-shadow-hover:0 10px 26px rgba(64,116,188,.42);--entry-shadow-selected:0 18px 44px rgba(64,116,188,.55);}
      .collection-roster__entry[data-rank="B"]{--entry-bg:rgba(28,46,40,.78);--entry-bg-hover:rgba(34,58,50,.9);--entry-bg-selected:rgba(40,68,58,.95);--entry-border:rgba(120,224,185,.35);--entry-border-hover:rgba(146,236,204,.52);--entry-border-selected:rgba(176,246,220,.68);--entry-shadow:0 0 0 1px rgba(126,236,199,.18);--entry-shadow-hover:0 10px 24px rgba(42,126,110,.4);--entry-shadow-selected:0 18px 38px rgba(42,126,110,.52);}
      .collection-roster__entry[data-rank="C"]{--entry-bg:rgba(46,46,28,.78);--entry-bg-hover:rgba(58,58,34,.9);--entry-bg-selected:rgba(68,68,40,.95);--entry-border:rgba(232,212,124,.32);--entry-border-hover:rgba(244,226,150,.48);--entry-border-selected:rgba(252,238,176,.64);--entry-shadow:0 0 0 1px rgba(240,224,150,.16);--entry-shadow-hover:0 10px 24px rgba(162,138,52,.38);--entry-shadow-selected:0 18px 36px rgba(162,138,52,.48);}
      .collection-roster__entry[data-rank="D"]{--entry-bg:rgba(48,34,24,.78);--entry-bg-hover:rgba(60,42,30,.9);--entry-bg-selected:rgba(70,48,36,.95);--entry-border:rgba(255,170,108,.3);--entry-border-hover:rgba(255,188,138,.46);--entry-border-selected:rgba(255,208,170,.6);--entry-shadow:0 0 0 1px rgba(255,182,132,.14);--entry-shadow-hover:0 10px 22px rgba(168,88,42,.36);--entry-shadow-selected:0 18px 32px rgba(168,88,42,.45);}
      .collection-roster__entry[data-rank="unknown"],
      .collection-roster__entry:not([data-rank]){--entry-shadow:none;}
      .collection-roster__avatar{--collection-avatar-size:108px;--collection-gear-slot-size:calc(var(--collection-avatar-size) * .8);width:var(--collection-avatar-size);height:var(--collection-avatar-size);background:none;overflow:visible;position:relative;display:flex;align-items:center;justify-content:center;}
      .collection-roster__portrait{width:var(--collection-avatar-size);height:var(--collection-avatar-size);position:relative;z-index:2;display:flex;align-items:center;justify-content:center;overflow:hidden;}
      .collection-roster__portrait img{width:var(--collection-avatar-size);height:var(--collection-avatar-size);object-fit:contain;filter:drop-shadow(0 10px 18px rgba(0,0,0,.55));position:relative;z-index:1;}
      .collection-roster__portrait span{position:relative;z-index:1;color:#aee4ff;font-weight:600;letter-spacing:.08em;}
      .collection-stage{position:relative;border-radius:0;border:none;background:none;padding:28px;display:flex;flex-direction:column;gap:18px;overflow:visible;min-height:462px;width:110%;transform:translateX(10%);transform-origin:center;z-index:5;}
      .collection-stage>*{position:relative;z-index:2;}
      .collection-stage__art{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;z-index:1;pointer-events:none;}
      .collection-stage__sprite{width:100%;max-width:none;height:100%;object-fit:contain;opacity:.42;filter:drop-shadow(0 28px 56px rgba(0,0,0,.55));transition:transform .3s ease,filter .3s ease,opacity .3s ease;}
      .collection-stage__tuvi{position:absolute;left:50%;bottom:84px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:3;pointer-events:none;gap:8px;padding:8px 12px;border-radius:14px;background:rgba(6,14,24,.56);backdrop-filter:blur(2px);}
      .collection-stage__tuvi-realm{margin:0;color:#d6f1ff;font-size:20px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;text-align:center;}
      .collection-stage__tuvi-subrealm{display:none;}
      .collection-stage__tuvi-cost{margin:0;color:#9fc8ea;font-size:12px;letter-spacing:.05em;text-transform:uppercase;text-align:center;}
      .collection-stage__tuvi-stats{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;justify-content:center;gap:4px 8px;max-width:240px;}
      .collection-stage__tuvi-stat{display:inline-flex;align-items:center;gap:4px;color:#9fc8ea;font-size:11px;letter-spacing:.06em;text-transform:uppercase;}
      .collection-stage__tuvi-stat b{color:#e6f2ff;font-size:11px;letter-spacing:.03em;text-transform:none;}
      .collection-stage__tuvi-actions{display:flex;position:absolute;left:50%;bottom:28px;transform:translateX(-50%);z-index:3;gap:10px;}
      .collection-stage__tuvi-btn{width:44px;height:44px;border-radius:50%;border:1px solid rgba(110,231,183,.6);background:linear-gradient(160deg,rgba(16,185,129,.35),rgba(5,46,22,.88));color:#dcfce7;font-size:24px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .18s ease,filter .18s ease;}
      .collection-stage__tuvi-btn:hover{transform:translateY(-2px);filter:brightness(1.08);}
      .collection-stage__tuvi-btn:focus-visible{outline:2px solid rgba(110,231,183,.82);outline-offset:2px;}
      .collection-stage__tuvi-btn:disabled{cursor:not-allowed;background:linear-gradient(160deg,rgba(40,40,40,.6),rgba(12,12,12,.95));border-color:rgba(115,115,115,.65);color:#737373;filter:none;}
      .collection-stage__info{display:none;}
      .collection-stage__identity{display:flex;flex-direction:column;gap:6px;}
      .collection-stage__name{margin:0;font-size:26px;letter-spacing:.06em;}
      .collection-stage__tags{display:flex;gap:10px;flex-wrap:wrap;}
      .collection-stage__tag{padding:6px 12px;border-radius:999px;border:1px solid rgba(125,211,252,.28);background:rgba(12,22,32,.78);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#aee4ff;}
      .collection-stage__status{display:none;}
      .collection-stage__mini-stats{position:absolute;left:12px;bottom:18px;z-index:4;min-width:170px;max-width:220px;border:1px solid rgba(125,211,252,.34);border-radius:14px;background:rgba(6,16,26,.32);backdrop-filter:blur(3px);padding:28px 10px 10px;display:flex;flex-direction:column;gap:6px;}
      .collection-stage__mini-stats-toggle{position:absolute;top:6px;left:6px;width:20px;height:20px;border-radius:50%;border:1px solid rgba(174,228,255,.45);background:rgba(11,24,34,.7);color:#d4edff;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;}
      .collection-stage__mini-stats-toggle:focus-visible{outline:2px solid rgba(174,228,255,.8);outline-offset:2px;}
      .collection-stage__mini-stats-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px;}
      .collection-stage__mini-stats-item{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9fc8ea;}
      .collection-stage__mini-stats-item b{font-size:12px;color:#e6f2ff;letter-spacing:.04em;text-transform:none;}
      .collection-stage__mini-stats-stat{display:flex;align-items:center;gap:6px;}
      .collection-stage__mini-stats-plus{width:16px;height:16px;border-radius:999px;border:1px solid rgba(110,231,183,.52);background:rgba(10,42,28,.78);color:#c6ffe6;font-size:12px;line-height:1;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;}
      .collection-stage__mini-stats-plus:disabled{cursor:not-allowed;opacity:.45;}
      .collection-stage__tp-modal{position:fixed;inset:0;background:rgba(0,0,0,.58);display:none;align-items:center;justify-content:center;z-index:80;padding:16px;}
      .collection-stage__tp-modal.is-open{display:flex;}
      .collection-stage__tp-panel{width:min(320px,92vw);border:1px solid rgba(125,211,252,.4);border-radius:14px;background:rgba(7,17,28,.95);padding:14px;display:flex;flex-direction:column;gap:10px;}
      .collection-stage__tp-range{width:100%;}
      .collection-stage__tp-actions{display:flex;justify-content:flex-end;gap:8px;}
      .collection-stage__tp-btn{border:1px solid rgba(174,228,255,.35);background:rgba(16,26,36,.88);color:#d8eeff;border-radius:10px;padding:6px 10px;cursor:pointer;}
      .collection-stage__mini-stats-item.is-detail{display:none;}
      .collection-stage__mini-stats.is-detail-open .collection-stage__mini-stats-item.is-detail{display:flex;}
      .collection-stage__mini-stats-hint{margin:2px 0 0;font-size:10px;color:#7da0c7;line-height:1.4;}
      .collection-stage__mini-stats.is-detail-open .collection-stage__mini-stats-hint{display:none;}
      .collection-tabs{position:relative;border-radius:0;border:none;background:none;padding:0;display:flex;flex-direction:column;align-items:flex-end;justify-self:end;gap:10px;z-index:8;min-width:36px;}
      .collection-tabs__button{width:var(--collection-tab-icon-size);height:var(--collection-tab-icon-size);padding:0;border-radius:50%;border:1px solid rgba(125,211,252,.2);background:rgba(8,16,24,.82);color:inherit;cursor:pointer;display:flex;justify-content:center;align-items:center;transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease;}
      .collection-tabs__button:hover{transform:translateY(-2px);border-color:rgba(125,211,252,.42);background:rgba(16,26,36,.92);}
      .collection-tabs__button:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
      .collection-tabs__button.is-active{border-color:rgba(125,211,252,.55);background:rgba(18,30,42,.96);box-shadow:0 10px 24px rgba(6,12,20,.42);}
      .collection-tabs__icon{width:78%;height:78%;display:block;object-fit:contain;filter:drop-shadow(0 1px 3px rgba(0,0,0,.45));pointer-events:none;}
      .collection-skill-overlay{position:absolute;top:15%;left:4%;width:61.5%;min-height:0;padding:18px 20px 14px;border-radius:22px;border:1px solid rgba(125,211,252,.45);background:rgba(8,16,26,.92);box-shadow:0 42px 96px rgba(3,6,12,.75);display:flex;flex-direction:column;gap:14px;opacity:0;pointer-events:none;transition:opacity .24s ease,transform .24s ease;transform:translateY(12px);backdrop-filter:blur(6px);max-height:72vh;overflow:hidden;z-index:12;}
      .collection-skill-overlay.is-open{opacity:1;pointer-events:auto;transform:translateY(0);}
      .collection-skill-overlay__header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;}
      .collection-skill-overlay__title{margin:0;font-size:22px;letter-spacing:.06em;}
      .collection-skill-overlay__close{padding:8px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.28);background:rgba(16,24,34,.85);color:#aee4ff;font-size:12px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease;}
      .collection-skill-overlay__close:hover{transform:translateY(-2px);border-color:rgba(174,228,255,.48);}
      .collection-skill-overlay__close:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
      .collection-skill-overlay__content{display:grid;grid-template-columns:1fr;gap:14px;flex:1;overflow:auto;padding-right:4px;}
      .collection-skill-overlay__content.has-detail{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);}
      .collection-skill-overlay__details{display:flex;flex-direction:column;gap:12px;}
      .collection-skill-overlay__subtitle{margin:0;color:#9cbcd9;font-size:14px;line-height:1.6;}
      .collection-skill-overlay__abilities{display:flex;flex-direction:column;gap:10px;overflow:visible;max-height:none;padding-right:2px;width:75%;min-width:0;}
      .collection-skill-card{border-radius:16px;border:1px solid rgba(125,211,252,.24);background:rgba(12,22,32,.88);padding:10px 12px;display:flex;flex-direction:row;align-items:center;gap:10px;min-height:42px;}
      .collection-skill-card__header{display:flex;align-items:center;gap:8px;flex:1;min-width:0;}
      .collection-skill-card__title{margin:0;font-size:15px;letter-spacing:.04em;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .collection-skill-card__actions{display:flex;align-items:center;gap:6px;margin-left:auto;flex-shrink:0;}
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
      .collection-skill-overlay__notes li::before{content:'•';position:absolute;left:0;color:#7da0c7;}
      .collection-arts-hubs{position:absolute;top:15%;left:50%;width:min(1120px,calc(100% - 20px));min-height:70%;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(240px,.9fr) minmax(0,1fr);gap:12px;opacity:0;pointer-events:none;transition:opacity .24s ease,transform .24s ease;transform:translate(calc(-50% - var(--collection-hub-left-shift)),12px);z-index:6;max-height:80vh;}
      .collection-arts-hubs.is-open{opacity:1;pointer-events:auto;transform:translate(calc(-50% - var(--collection-hub-left-shift)),0);}
      .collection-arts-hub{position:relative;border:1px solid rgba(125,211,252,.42);background:rgba(8,16,26,.92);box-shadow:0 30px 70px rgba(3,6,12,.62);backdrop-filter:blur(6px);padding:14px;display:flex;flex-direction:column;gap:12px;overflow:hidden;min-height:0;}
      .collection-arts-hub__icon{position:absolute;top:10px;left:10px;width:28px;height:28px;object-fit:contain;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));pointer-events:none;}
      .collection-arts-hub--gear{border:none;background:rgba(7,15,24,.78);box-shadow:0 20px 48px rgba(3,6,12,.55);display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:10px;padding:48px 12px 12px 12px;}
      .collection-arts-hub--gear .collection-arts-hub__icon{left:8px;top:8px;}
      .collection-arts-hub__filters{display:flex;flex-direction:column;gap:8px;align-items:flex-start;}
      .collection-arts-hub__filter{border:1px solid rgba(125,211,252,.32);background:rgba(11,24,35,.84);color:#d6eeff;font-size:10px;letter-spacing:.08em;text-transform:uppercase;writing-mode:vertical-rl;text-orientation:mixed;padding:8px 6px;border-radius:10px;cursor:pointer;min-height:52px;line-height:1.1;}
      .collection-arts-hub__filter.is-active{background:rgba(22,42,61,.96);border-color:rgba(174,228,255,.7);color:#f2fbff;}
      .collection-arts-hub__grid-wrap{min-height:0;overflow-y:auto;padding-right:4px;}
      .collection-arts-hub__grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;align-content:start;}
      .collection-arts-hub__slot{width:100%;aspect-ratio:1 / 1;box-sizing:border-box;border:1px solid rgba(174,228,255,.58);background:rgba(10,20,30,.4);display:flex;align-items:center;justify-content:center;color:#86a8c4;font-size:14px;box-shadow:inset 0 0 0 1px rgba(12,28,40,.55);cursor:pointer;position:relative;}
      .collection-arts-hub__slot.is-selected{border-color:rgba(233,247,255,.95);box-shadow:0 0 0 1px rgba(174,228,255,.48),inset 0 0 0 1px rgba(12,28,40,.55);}
      .collection-arts-hub__slot-qty{position:absolute;top:2px;left:3px;font-size:10px;font-weight:700;line-height:1;color:#f2fbff;text-shadow:0 1px 2px rgba(0,0,0,.7);}
      .collection-arts-hub__slot-label{position:absolute;left:3px;right:3px;bottom:2px;font-size:8px;line-height:1.2;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#9fc8ea;}
      .collection-arts-hub--paperdoll{border:none;background:rgba(7,15,24,.38);box-shadow:none;padding:48px 8px 12px;}
      .collection-equip-panel{display:flex;justify-content:center;align-items:flex-start;min-height:0;height:100%;}
      .collection-equip-layout{width:min(260px,100%);height:100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(5,minmax(48px,1fr));gap:8px;}
      .collection-equip-slot{position:relative;border:1px solid rgba(174,228,255,.48);background:rgba(8,18,28,.55);color:#d8efff;display:flex;align-items:center;justify-content:center;font-size:19px;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease;}
      .collection-equip-slot::before{content:'';position:absolute;inset:2px;border:2px solid rgba(174,228,255,.32);pointer-events:none;}
      .collection-equip-slot:hover{transform:translateY(-1px);border-color:rgba(204,239,255,.88);box-shadow:0 10px 26px rgba(3,9,16,.45);}
      .collection-equip-slot:focus-visible{outline:2px solid rgba(174,228,255,.92);outline-offset:2px;}
      .collection-equip-slot.is-pending{border-color:rgba(255,232,166,.92);box-shadow:0 0 0 1px rgba(255,232,166,.5);}
      .collection-equip-slot[data-slot='head']{grid-column:2;grid-row:1;}
      .collection-equip-slot[data-slot='shirt']{grid-column:2;grid-row:2;}
      .collection-equip-slot[data-slot='weapon']{grid-column:1;grid-row:3;}
      .collection-equip-slot[data-slot='accessory']{grid-column:3;grid-row:3;}
      .collection-equip-slot[data-slot='pants']{grid-column:2;grid-row:4;}
      .collection-equip-slot[data-slot='ring1']{grid-column:1;grid-row:5;}
      .collection-equip-slot[data-slot='ring2']{grid-column:2;grid-row:5;}
      .collection-equip-slot[data-slot='ring3']{grid-column:3;grid-row:5;}
      .collection-equip-slot__plus{font-size:20px;font-weight:700;line-height:1;color:#8db5d8;}
      .collection-equip-slot__symbol{font-size:20px;line-height:1;}
      .collection-equip-slot__name{position:absolute;bottom:4px;left:4px;right:4px;font-size:9px;letter-spacing:.04em;line-height:1.2;text-align:center;color:#aacde9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .collection-equip-slot__aura{position:absolute;width:46px;height:46px;border-radius:50%;border:1px solid rgba(170,215,255,.5);box-shadow:0 0 16px rgba(126,208,255,.35);}
      .collection-equip-popup{position:absolute;top:54px;left:50%;transform:translateX(-50%);width:min(320px,90%);border:1px solid rgba(174,228,255,.44);background:rgba(8,16,24,.96);padding:12px;z-index:9;display:none;flex-direction:column;gap:10px;box-shadow:0 16px 44px rgba(2,8,14,.62);}
      .collection-equip-popup.is-open{display:flex;}
      .collection-equip-popup__title{margin:0;font-size:13px;color:#d6eeff;letter-spacing:.06em;text-transform:uppercase;}
      .collection-equip-popup__desc{margin:0;font-size:12px;color:#99bedc;}
      .collection-equip-popup__list{display:flex;flex-direction:column;gap:6px;max-height:190px;overflow:auto;}
      .collection-equip-popup__item{border:1px solid rgba(125,211,252,.38);background:rgba(11,24,35,.84);color:#d6eeff;font-size:12px;padding:7px 9px;text-align:left;cursor:pointer;}
      .collection-equip-popup__actions{display:flex;gap:8px;justify-content:flex-end;}
      .collection-equip-popup__btn{border:1px solid rgba(125,211,252,.42);background:rgba(14,28,40,.9);color:#d6eeff;font-size:11px;padding:6px 10px;cursor:pointer;}
      .collection-arts-hub--art{padding:48px 12px 12px;justify-content:flex-start;}
      .collection-arts-hub__art-placeholder{margin:0;color:#9fc8ea;font-size:12px;letter-spacing:.04em;line-height:1.5;}
      @media(max-width:1200px){
        .collection-view__layout{grid-template-columns:minmax(0,1.6fr) minmax(0,3.3fr) max-content;}
      }
      @media(max-width:1080px){
      .collection-view{--collection-hub-left-shift:0px;}
        .collection-view__layout{grid-template-columns:1fr;}
        .collection-roster{margin-right:0;}
        .collection-roster__list{grid-template-columns:repeat(3,max-content);}
        .collection-skill-overlay{position:fixed;top:50%;left:50%;transform:translate(-50%,calc(-50% + 12px));width:88vw;min-height:0;max-height:85vh;}
        .collection-skill-overlay.is-open{transform:translate(-50%,-50%);}
        .collection-skill-overlay__content{grid-template-columns:1fr;}
        .collection-skill-overlay__content.has-detail{grid-template-columns:1fr;}
      }
      @media(max-width:820px){
        .collection-roster__list{grid-template-columns:repeat(3,max-content);}
      }
      @media(max-width:720px){
      .collection-view{--collection-hub-left-shift:0px;}
        .collection-view__title{font-size:30px;}
        .collection-roster__entry{padding:0;gap:0;}
        ..collection-roster__avatar{--collection-avatar-size:96px;}
        .collection-skill-overlay__abilities{gap:10px;width:100%;}
        .collection-skill-card{padding:8px 12px;gap:8px;flex-wrap:wrap;align-items:flex-start;}
        .collection-skill-card__header{flex-wrap:wrap;gap:8px;}
        .collection-skill-card__title{font-size:14px;white-space:normal;}
        .collection-skill-card__actions{width:100%;justify-content:flex-start;gap:8px;}
        .collection-skill-card__badge{font-size:11px;}
        .collection-skill-card__upgrade{font-size:11px;padding:6px 12px;}
        .collection-arts-hubs{top:8%;left:50%;width:min(96vw,680px);grid-template-columns:1fr;gap:10px;}
        .collection-arts-hub__grid{grid-template-columns:repeat(5,minmax(48px,var(--collection-gear-slot-size)));}
        .collection-arts-hub__filter{writing-mode:horizontal-tb;text-orientation:mixed;min-height:auto;padding:6px 8px;}
        .collection-arts-hub--gear{grid-template-columns:1fr;row-gap:10px;padding:46px 10px 10px;}
        .collection-arts-hub__filters{flex-direction:row;flex-wrap:wrap;}
      }
    `;

    ensureStyleTag(STYLE_ID, { css });
  }extends SkillDetailEventDetail {
    ability: AbilityEntry | null;
    abilityId: string | number | null;
    typeLabel: string | null;
    facts: AbilityFact[];
    notes: string[];
  }

  global {
  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveUnitStatPreview')) exports.resolveUnitStatPreview = resolveUnitStatPreview;
  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveCollectionCombatPower')) exports.resolveCollectionCombatPower = resolveCollectionCombatPower;
};
__modules['./screens/gacha/view.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/gacha/view.ts
  const __dep0 = __require('./ui/dom.ts');
  const assertElement = __dep0.assertElement;
  const ensureStyleTag = __dep0.ensureStyleTag;
  const mountSection = __dep0.mountSection;
  const __dep1 = __require('./utils/rarity.ts');
  const normalizeRarity = __dep1.normalizeRarity;



  const STYLE_ID = 'gacha-view-style';
};
__modules['./screens/lineup/index.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/lineup/index.ts
  const __dep0 = __require('./screens/lineup/view/index.ts');
  const renderLineupView = __dep0.renderLineupView;
  const __dep1 = __require('./catalog.ts');
  const ROSTER = __dep1.ROSTER;
  const __dep2 = __require('./utils/player-profile.ts');
  const loadPlayerProfile = __dep2.loadPlayerProfile;
  const isUnitOwnedByProfile = __dep2.isUnitOwnedByProfile;
  const __dep3 = __require('./utils/unit-id.ts');
  const normalizeUnitId = __dep3.normalizeUnitId;
  const __dep4 = __require('./types/currency.ts');
  const isCurrencyEntry = __dep4.isCurrencyEntry;
  const isLineupCurrencies = __dep4.isLineupCurrencies;
  const normalizeCurrencyBalances = __dep4.normalizeCurrencyBalances;

  const isUnknownRecord = (value)=> (
    typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
  );

  const toLineupParams = (value)=> (
    isUnknownRecord(value) ? value /* as LineupScreenDefinitionParams : null */
  );

  const cloneMergeable = (value)=> {
    if (Array.isArray(value)){
      return value.slice() /* as unknown as T */;
    }
    return { ...value } /* as T */;
  };

  const mergeParams = (
    base,
    override,
  )=> {
    if (!base && !override) return null;
    if (!base) return override ? cloneMergeable(override) ;
    if (!override) return cloneMergeable(base);
    if (Array.isArray(base) && Array.isArray(override)){
      return cloneMergeable(override);
    }
    if (!Array.isArray(base) && !Array.isArray(override)){
      return { ...base, ...override } /* as T */;
    }
    return cloneMergeable(override);
  };

  const cloneCurrencyValue = (value)=> {
    if (isCurrencyEntry(value)){
      return { ...value };
    }
    return value;
  };

  const isCurrencyValueRecord = (
    value,
  )=> (
    value != null
    && typeof value === 'object'
    && !Array.isArray(value)
  );

  const cloneCurrencyRecord = (
    source, LineupCurrencyValue>> | null | undefined,
  )=> {
    if (!source){
      return {};
    }
    return Object.fromEntries(
      Object.entries(source).map(([id, entry]) => [
        id,
        cloneCurrencyValue(entry),
      ]),
    );
  };

  const cloneLineupCurrencies = (source)=> {
    if (Array.isArray(source)){
      return source.map(item => cloneCurrencyValue(item)) /* as ReadonlyArray<LineupCurrencyValue> */;
    }
    const mapSource = source /* as LineupCurrencyConfig */;
    const clone= {};
    Object.entries(mapSource).forEach(([key, value]) => {
      if (key === 'balances'){
        if (isCurrencyValueRecord(value)){
          clone.balances = cloneCurrencyRecord(value);
        } else if (value == null){
          clone.balances = null;
        }
        return;
      }
      if (Array.isArray(value)){
        clone[key] = value.map(item => cloneCurrencyValue(item));
        return;
      }
      if (isCurrencyEntry(value)){
        clone[key] = { ...value };
        return;
      }
      clone[key] = value /* as LineupCurrencyValue */;
    });
    if (!('balances' in clone) && 'balances' in mapSource){
      clone.balances = mapSource.balances ?? null;
    }
    return clone;
  };

  const toMergeable = (value)=> {
    if (Array.isArray(value)) return value /* as ReadonlyArray<unknown> */;
    if (isUnknownRecord(value)) return value;
    return null;
  };

  const toRosterSource = (
    value,
  )=> {
    if (Array.isArray(value)){
      return value /* as ReadonlyArray<RosterEntryLite> */;
    }
    if (value == null){
      return value ?? undefined;
    }
    return null;
  };extends UnknownRecord {
    lineups: unknown;
    roster: unknown;
    currencies: LineupCurrencies | null;
    shortDescription: string;
    playerState: UnknownRecord | null;
  }
};
__modules['./screens/lineup/view/events.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/lineup/view/event.ts
  const __dep0 = __require('./screens/lineup/view/state.ts');
  const assignUnitToCell = __dep0.assignUnitToCell;
  const removeUnitFromCell = __dep0.removeUnitFromCell;
  const setLeader = __dep0.setLeader;
  const unlockCell = __dep0.unlockCell;
  const formatCurrencyBalance = __dep0.formatCurrencyBalance;
  const __dep1 = __require('./utils/currency.ts');
  const createNormalizedWallet = __dep1.createNormalizedWallet;
  const getCurrencyOrder = __dep1.getCurrencyOrder;
  const syncSharedCurrencyWallet = __dep1.syncSharedCurrencyWallet;
};
__modules['./screens/lineup/view/index.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/lineup/view/index.ts

  const __reexport0 = __require('./screens/lineup/view/render.ts');



  if (!Object.prototype.hasOwnProperty.call(exports, 'renderLineupView')) exports.renderLineupView = __reexport0.renderLineupView;
};
__modules['./screens/lineup/view/render.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/lineup/view/render.ts
  const __dep0 = __require('./data/skills.ts');
  const getSkillSet = __dep0.getSkillSet;
  const __dep1 = __require('./utils/format.ts');
  const createNumberFormatter = __dep1.createNumberFormatter;
  const __dep2 = __require('./utils/unit-id.ts');
  const normalizeUnitId = __dep2.normalizeUnitId;
  const __dep3 = __require('./utils/domain-normalization.ts');
  const normalizeElementKey = __dep3.normalizeElementKey;
  const __dep4 = __require('./utils/player-profile.ts');
  const isUnitOwnedByProfile = __dep4.isUnitOwnedByProfile;
  const loadPlayerProfile = __dep4.loadPlayerProfile;
  const patchPlayerProfile = __dep4.patchPlayerProfile;
  const __dep5 = __require('./utils/currency.ts');
  const createNormalizedWallet = __dep5.createNormalizedWallet;
  const getCurrencyOrder = __dep5.getCurrencyOrder;
  const getSharedCurrencyWallet = __dep5.getSharedCurrencyWallet;
  const subscribeSharedCurrencyWallet = __dep5.subscribeSharedCurrencyWallet;
  const syncSharedCurrencyWallet = __dep5.syncSharedCurrencyWallet;
  const __dep6 = __require('./ui/dom.ts');
  const assertElement = __dep6.assertElement;
  const ensureStyleTag = __dep6.ensureStyleTag;
  const mountSection = __dep6.mountSection;
  const __dep7 = __require('./types/currency.ts');
  const normalizeCurrencyBalances = __dep7.normalizeCurrencyBalances;
  const __dep8 = __require('./screens/lineup/view/state.ts');
  const normalizeRoster = __dep8.normalizeRoster;
  const normalizeLineups = __dep8.normalizeLineups;
  const createCurrencyBalances = __dep8.createCurrencyBalances;
  const createFilterOptions = __dep8.createFilterOptions;
  const formatCurrencyBalance = __dep8.formatCurrencyBalance;
  const getUnitRarity = __dep8.getUnitRarity;
  const collectAssignedUnitIds = __dep8.collectAssignedUnitIds;
  const collectAssignedUnitTags = __dep8.collectAssignedUnitTags;
  const evaluatePassive = __dep8.evaluatePassive;
  const filterRoster = __dep8.filterRoster;
  const LINEUP_ALLOWED_LEADER_IDS = __dep8.LINEUP_ALLOWED_LEADER_IDS;
  const __dep9 = __require('./data/cost-budget.ts');
  const deriveBudgetFromRankRole = __dep9.deriveBudgetFromRankRole;
  const evaluateCostBudget = __dep9.evaluateCostBudget;
  const mergeBudgetInputs = __dep9.mergeBudgetInputs;
  const __dep10 = __require('./screens/lineup/view/events.ts');
  const bindLineupEvents = __dep10.bindLineupEvents;





  const STYLE_ID = 'lineup-view-style-v1';
  const powerFormatter = createNumberFormatter('vi-VN');
  const NAME_INITIALS_CACHE = new Map();
  const UNIT_CODE_CACHE = new Map();
  const ROLE_ELEMENT_ICON_CACHE = new Map();

  const ELEMENT_ICON= {
    fire: '🔥', metal, wood, earth, lightning, blood, water,
    light, dark, wind, neutral,
  };
            .slice(0, 3)
        ;

      const kitUlt = (kit /* as { ult: { name: string */; id: string } } | null)?.ult ?? null;
      const skillSetUlt = (skillSet /* as { ult: { name: string */; id: string } } | null)?.ult ?? null;
      const hasUlt = Boolean(kitUlt || skillSetUlt);
      const ultName = hasUlt
        ? (kitUlt?.name || skillSetUlt?.name || kitUlt?.id || 'Chưa đặt tên')
        ;

      if (!skills.length && !hasUlt){
        const fallback = document.createElement('p');
        fallback.className = 'lineup-grid__details-empty';
        fallback.textContent = 'Chưa có dữ liệu chi tiết cho nhân vật này.';
        cellDetails.appendChild(fallback);
      } else {
        if (skills.length){
          const skillSection = document.createElement('div');
          skillSection.className = 'lineup-grid__details-section';
          const heading = document.createElement('p');
          heading.className = 'lineup-grid__details-heading';
          heading.textContent = 'Kỹ năng';
          skillSection.appendChild(heading);
          const list = document.createElement('ul');
          list.className = 'lineup-grid__details-list';
          skills.forEach((skill, idx) => {
            const item = document.createElement('li');
            const skillRecord = skill /* as { name: string */; key: string } | null;
            const nameText = skillRecord?.name || skillRecord?.key || `Kỹ năng #${idx + 1}`;
            item.textContent = nameText;
            list.appendChild(item);
          });
          skillSection.appendChild(list);
          cellDetails.appendChild(skillSection);
        }

        if (hasUlt && ultName){
          const ultSection = document.createElement('div');
          ultSection.className = 'lineup-grid__details-section';
          const heading = document.createElement('p');
          heading.className = 'lineup-grid__details-heading';
          heading.textContent = 'Tuyệt kỹ';
          ultSection.appendChild(heading);
          const text = document.createElement('p');
          text.className = 'lineup-grid__details-text';
          text.textContent = ultName;
          ultSection.appendChild(text);
          cellDetails.appendChild(ultSection);
        }
      }

      syncGridDetailsHeight();
    }

    function renderCells(){
      cellNodeByIndex.clear();
      cellsGrid.innerHTML = '';
      const lineup = getSelectedLineup();
      if (!lineup){
        gridSection.classList.add('is-empty');
        for (let index = 0; index < 6; index += 1){
          const cellEl = document.createElement('div');
          cellEl.className = 'lineup-cell is-locked';
          cellEl.dataset.cellIndex = String(index);
          cellEl.tabIndex = 0;
          cellEl.setAttribute('role', 'button');
          const avatar = document.createElement('div');
          avatar.className = 'lineup-cell__avatar';
          avatar.textContent = '🔒';
          cellEl.appendChild(avatar);
          cellEl.setAttribute('aria-label', `Ô đội hình #${index + 1}. Chưa có dữ liệu.`);
          cellsGrid.appendChild(cellEl);
        }
        state.activeCellIndex = null;
        renderCellDetails();
        refreshTotalCost();
        syncGridDetailsHeight();
        return;
      }

      gridSection.classList.remove('is-empty');

      if (!Number.isInteger(state.activeCellIndex) || !lineup.cells[state.activeCellIndex ?? -1]){
        state.activeCellIndex = null;
      }

      const fragment = document.createDocumentFragment();
      lineup.cells.forEach(cell => {
        const cellEl = document.createElement('div');
        cellEl.className = 'lineup-cell';
        cellEl.dataset.cellIndex = String(cell.index);
        cellNodeByIndex.set(cell.index, cellEl);
        cellEl.tabIndex = 0;
        cellEl.setAttribute('role', 'button');
        const unit = cell.unitId ? rosterLookup.get(cell.unitId) ;
        if (state.selectedUnitId && cell.unitId === state.selectedUnitId){
          cellEl.classList.add('is-selected');
        }
        if (state.activeCellIndex === cell.index){
          cellEl.classList.add('is-active');
        }
        if (!cell.unlocked){
          cellEl.classList.add('is-locked');
          cellEl.dataset.cellAction = 'unlock';
          cellEl.dataset.cellDefaultAction = 'unlock';
          delete cellEl.dataset.cellAltAction;
        } else {
          cellEl.removeAttribute('data-cell-action');
          cellEl.dataset.cellDefaultAction = state.selectedUnitId ? 'assign'
            : cell.unitId
              ? 'select'
              : 'focus';

        }

        const displayIndex = cell.index + 1;

        const avatar = document.createElement('div');
        avatar.className = 'lineup-cell__avatar';
        if (unit){
          renderAvatar(avatar, unit.avatar || null, unit.name);
        } else if (cell.label){
          avatar.textContent = getNameInitials(cell.label);
        } else if (!cell.unlocked){
          avatar.textContent = '🔒';
        } else {
          avatar.textContent = '+';
        }
        cellEl.appendChild(avatar);

        let ariaLabel = `Ô đội hình #${Math.max(displayIndex, 1)}`;
        if (unit){
          ariaLabel += `: ${unit.name}`;
        } else if (cell.label){
          ariaLabel += `: ${cell.label}`;
        }
        if (!cell.unlocked){
          ariaLabel += '. Đang khóa. Nhấp để mở khóa.';
          if (cell.unlockCost){
            ariaLabel += ` Chi phí: ${formatCurrencyBalance(cell.unlockCost.amount, cell.unlockCost.currencyId)}.`;
          }
        } else if (unit){
          ariaLabel += '. Nhấp để bỏ nhân vật khỏi ô.';
        } else if (state.selectedUnitId){
          const selectedUnit = rosterLookup.get(state.selectedUnitId);
          ariaLabel += selectedUnit
            ? `. Đã chọn ${selectedUnit.name}. Nhấp để gán.`
            : '. Nhấp để gán nhân vật đã chọn.';
        } else {
          ariaLabel += '. Ô trống. Chọn nhân vật trong roster rồi nhấp để gán.';
        }
        cellEl.setAttribute('aria-label', ariaLabel);

        fragment.appendChild(cellEl);
      });

    cellsGrid.appendChild(fragment);

  lastHighlightedCellIndex = null;
      updateActiveCellHighlight();
      renderCellDetails();
      refreshTotalCost();
    }

  function updateActiveCellHighlight(){
      const nextIndex = Number.isInteger(state.activeCellIndex) ? state.activeCellIndex : null;
      if (lastHighlightedCellIndex != null){
        const previous = cellNodeByIndex.get(lastHighlightedCellIndex) ?? null;
        previous?.classList.remove('is-active');
      }
      if (nextIndex != null){
        const next = cellNodeByIndex.get(nextIndex) ?? null;
        next?.classList.add('is-active');
      }
      lastHighlightedCellIndex = nextIndex;
    }

    function renderLeader(){
      const lineup = getSelectedLineup();
      if (!lineup){
        renderAvatar(leaderAvatar, null, '');
        leaderName.textContent = 'Chưa chọn leader';
        syncGridDetailsHeight();
        return;
      }
      if (lineup.leaderId){
        const unit = rosterLookup.get(lineup.leaderId);
        if (unit){
          renderAvatar(leaderAvatar, unit.avatar || null, unit.name);
          leaderName.textContent = unit.name;
        } else {
          const fallbackName = lineup.leaderId === 'leaderA'
            ? 'Uyên'
            : (lineup.leaderId === 'leaderB' ? 'Địch' : 'Leader');
          renderAvatar(leaderAvatar, null, fallbackName);
          leaderName.textContent = fallbackName;
        }
      } else {
        renderAvatar(leaderAvatar, null, '');
        leaderName.textContent = 'Chưa chọn leader';
      }
      syncGridDetailsHeight();
    }

    function renderPassives(){
      const lineup = getSelectedLineup();
      if (!lineup){
        lastPassivesRenderSignature = 'empty';
        passiveGrid.innerHTML = '';
        return;
      }
      const selectionSanitized = sanitizeLineupBuffSelection(lineup);
      if (selectionSanitized){
        persistLineupSelection();
      }
      const assignedIds = collectAssignedUnitIds(lineup);
      const assignedTags = collectAssignedUnitTags(assignedIds, rosterLookup);
      const assignedTagsSignature = Array.from(assignedTags).join('|');
      const totalCost = getLineupTotalCost(lineup);
      const passiveStates = lineup.passives.map((passive) => ({
        passive,
        isActive, assignedIds, rosterLookup, assignedTags),
      }));
      const lineupSelection = passiveSelectionByLineup.get(lineup.id) ?? new Map();
      const passivesSignature = passiveStates.map(({ passive, isActive }) => {
        const selectedIndex = lineupSelection.get(passive.index);
        return [
          passive.index,
          passive.name,
          passive.requirement,
          passive.isEmpty ? '1' : '0',
          isActive ? '1' : '0',
          selectedIndex ?? 'none',
        ].join(':');
      }).join('||');
      const nextSignature = `${lineup.id}{assignedIds.size}{assignedTagsSignature}{totalCost}{passivesSignature}`;
      if (nextSignature === lastPassivesRenderSignature){
        return;
      }
      lastPassivesRenderSignature = nextSignature;

      passiveGrid.innerHTML = '';
      passiveStates.forEach(({ passive, isActive }) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lineup-passive';
        btn.dataset.passiveIndex = String(passive.index);
        const selectedIndex = lineupSelection.get(passive.index);
        btn.setAttribute('aria-label', `Thiết lập buff ô #${passive.index + 1}`);
        if (isActive || selectedIndex != null){
          btn.classList.add('is-active');
        }
        const title = document.createElement('p');
        title.className = 'lineup-passive__title';
        title.textContent = selectedIndex != null
          ? String(selectedIndex + 1)
          ;
        btn.appendChild(title);
        passiveGrid.appendChild(btn);
      });
    }

    function renderFilters(){
      const nextSignature = [
        state.filter.type,
        state.filter.value ?? '',
        state.filterOptions.classes.join('|'),
        state.filterOptions.ranks.join('|'),
      ].join('::');
      if (nextSignature === lastFiltersRenderSignature){
        return;
      }
      lastFiltersRenderSignature = nextSignature;

      rosterFilters.innerHTML = '';
      const filters = [
        { type: 'all' /* /* as const */ */, value, label,
        ...state.filterOptions.classes.map(value => ({ type: 'class' /* /* as const */ */, value, label)),
        ...state.filterOptions.ranks.map(value => ({ type: 'rank' /* /* as const */ */, value, label)),
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
      rosterFilters.appendChild(totalCostEl);
    }

    function renderRoster(){
      const lineup = getSelectedLineup();
      const filtered = getFilteredRoster();
      const assignedUnitIds = getAssignedUnitIds(lineup);
      const assignmentSignature = Array.from(assignedUnitIds).sort().join('|');
      const filterSignature = `${state.filter.type}{state.filter.value ?? ''}`;
      const filteredIdsSignature = filtered.map(unit => normalizeUnitId(unit.id)).join('|');
      const nextSignature = `${filterSignature}{state.selectedUnitId ?? ''}{assignmentSignature}{filteredIdsSignature}`;
      if (nextSignature === lastRosterRenderSignature){
        return;
      }
      lastRosterRenderSignature = nextSignature;

      rosterList.innerHTML = '';
      const fragment = document.createDocumentFragment();
      filtered.forEach(unit => {
        const unitId = normalizeUnitId(unit.id);
        const isAssigned = assignedUnitIds.has(unitId);
        if (isAssigned && state.selectedUnitId !== unitId){
          return;
        }
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'lineup-roster__entry';
        button.dataset.unitId = unitId;
        button.setAttribute('aria-label', `Chọn ${unit.name}`);
        if (state.selectedUnitId === unitId){
          button.classList.add('is-selected');
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
        if (unit.role || unit.rank){
          const tag = document.createElement('p');
          tag.className = 'lineup-roster__tag';
          const marker = renderRoleElementIcons(unit);
          tag.textContent = [marker, unit.role, unit.rank].filter(Boolean).join(' · ');
          meta.appendChild(tag);
        }
        if (unit.power != null){
          const extra = document.createElement('p');
          extra.className = 'lineup-roster__extra';
          extra.textContent = `Chiến lực ${formatUnitPower(unit.power)}`;
          meta.appendChild(extra);
        }
        button.appendChild(meta);
        fragment.appendChild(button);
      });
      rosterList.appendChild(fragment);
    }

    function openPassivePicker(passiveIndex){
      const lineup = getSelectedLineup();
      if (!lineup){
        return;
      }
      const selectionSanitized = sanitizeLineupBuffSelection(lineup);
      if (selectionSanitized){
        persistLineupSelection();
      }
      const lineupSelection = passiveSelectionByLineup.get(lineup.id) ?? new Map();
      passiveSelectionByLineup.set(lineup.id, lineupSelection);
      const currentSelection = lineupSelection.get(passiveIndex);
      if (currentSelection != null){
        pendingPassiveSelection = { lineupId: lineup.id, passiveIndex, optionIndex= null;
      }

      const buffContext = getLineupBuffContext(lineup);
      const unavailableOptionIndices = getUnavailableBuffOptionIndices(lineup.id, passiveIndex);

      passiveOverlayBody.innerHTML = '';
      const list = document.createElement('div');
      list.className = 'lineup-passive-picker';

      LINEUP_BUFF_OPTIONS.forEach((option, optionIndex) => {
        if (unavailableOptionIndices.has(optionIndex)){
          return;
        }

        const eligible = option.isEligible(buffContext);
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'lineup-passive-picker__option';
        row.dataset.optionIndex = String(optionIndex);
        if (optionIndex === currentSelection){
          row.classList.add('is-active');
        }
        row.classList.toggle('is-eligible', eligible);
        row.classList.toggle('is-disabled', !eligible);
        row.disabled = !eligible;
        row.setAttribute('aria-disabled', eligible ? 'false' : 'true');

        const icon = document.createElement('span');
        icon.className = 'lineup-passive-picker__icon';
        icon.textContent = String(optionIndex + 1);
        row.appendChild(icon);

        const textWrap = document.createElement('div');
        textWrap.className = 'lineup-passive-picker__text-wrap';

        const description = document.createElement('p');
        description.className = 'lineup-passive-picker__text';
        description.textContent = option.description;
        textWrap.appendChild(description);

        const requirement = document.createElement('p');
        requirement.className = 'lineup-passive-picker__requirement';
        requirement.textContent = option.requirement;
        textWrap.appendChild(requirement);

        row.appendChild(textWrap);

        row.addEventListener('click', () => {
          if (!eligible){
            return;
          }
          pendingPassiveSelection = { lineupId: lineup.id, passiveIndex, optionIndex };
          commitPassivePickerSelection();
          closeOverlay(passiveOverlay);
        });

        list.appendChild(row);
      });

      passiveOverlayBody.appendChild(list);
      openOverlay(passiveOverlay);
      passiveClose.focus();
    }

    function commitPassivePickerSelection(){
      if (!pendingPassiveSelection){
        return;
      }
      const { lineupId, passiveIndex, optionIndex } = pendingPassiveSelection;
      const lineupSelection = passiveSelectionByLineup.get(lineupId) ?? new Map();
      for (const [selectedPassiveIndex, selectedOptionIndex] of lineupSelection.entries()){
        if (selectedPassiveIndex !== passiveIndex && selectedOptionIndex === optionIndex){
          lineupSelection.delete(selectedPassiveIndex);
        }
      }
      lineupSelection.set(passiveIndex, optionIndex);
      passiveSelectionByLineup.set(lineupId, lineupSelection);
      pendingPassiveSelection = null;
      renderPassives();
      persistLineupSelection();
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

      const fixedLeaders = [
        { id: 'leaderA', name, role, rank, avatar,
        { id: 'leaderB', name, role, rank, avatar,
      ];

      fixedLeaders
        .filter((leader) => LINEUP_ALLOWED_LEADER_IDS.has(leader.id))
        .forEach((leader) => {
          const option = document.createElement('button');
          option.type = 'button';
          option.className = 'lineup-overlay__option';
          option.dataset.unitId = leader.id;
          const avatar = document.createElement('div');
          avatar.className = 'lineup-overlay__option-avatar';
          renderAvatar(avatar, leader.avatar, leader.name);
          option.appendChild(avatar);
          const text = document.createElement('div');
          const nameEl = document.createElement('p');
          nameEl.className = 'lineup-overlay__option-name';
          nameEl.textContent = leader.name;
          text.appendChild(nameEl);
          const meta = document.createElement('p');
          meta.className = 'lineup-overlay__option-meta';
          meta.textContent = [leader.role, leader.rank].filter(Boolean).join(' · ');
          text.appendChild(meta);
          option.appendChild(text);
          if (lineup.leaderId === leader.id){
            option.classList.add('is-active');
          }
          list.appendChild(option);
        });

      leaderOverlayBody.appendChild(list);
      openOverlay(leaderOverlay);
      leaderClose.focus();
    }

  const cleanup=> void> = [];

  const eventCleanup = bindLineupEvents({
      shell,
      state,
      elements,
        cellsGrid,
        cellDetails,
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
      overlays) => activeOverlay,
        close=> closeOverlay(overlay),
      },
      helpers,
        setMessage,
        renderCells,
        renderCellDetails,
        renderLeader,
        renderPassives,
        renderFilters,
        renderRoster,
        updateActiveCellHighlight,
        syncGridDetailsHeight,
        openPassivePicker,
        commitPassivePickerSelection,
        openLeaderPicker,
        refreshWallet,
        persistLineupSelection,
      },
      rosterLookup,
    });
    cleanup.push(...eventCleanup);

    const unsubscribeSharedWallet = subscribeSharedCurrencyWallet((walletSnapshot) => {
      applyWalletToBalances(walletSnapshot);
      refreshWallet();
      renderCellDetails();
    });
    cleanup.push(unsubscribeSharedWallet);

    refreshWallet();
    renderCells();
    renderLeader();
    renderPassives();
    renderFilters();
    renderRoster();
    refreshTotalCost();
    setMessage('Nhấp vào nhân vật để gán vào lineup.');

    cleanup.push(() => passiveOverlay.remove());
    cleanup.push(() => leaderOverlay.remove());

    return {
      destroy(){
        if (syncGridDetailsHandle !== null){
          window.cancelAnimationFrame(syncGridDetailsHandle);
          syncGridDetailsHandle = null;
        }
        while (cleanup.length > 0){
          const fn = cleanup.pop();
          if (!fn) continue;
          try {
            fn();
          } catch (error){
            console.error('[lineup] destroy error', error);
          }
        }
        syncSharedCurrencyWallet(mapToWallet());
        mount.destroy();
      },
    };
   }
};
__modules['./screens/lineup/view/state.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/lineup/view/stage.ts
  const __dep0 = __require('./catalog.ts');
  const ROSTER = __dep0.ROSTER;
  const __dep1 = __require('./utils/format.ts');
  const createNumberFormatter = __dep1.createNumberFormatter;
  const __dep2 = __require('./utils/currency.ts');
  const formatCurrencyAmount = __dep2.formatCurrencyAmount;
  const getCurrencyDefinitions = __dep2.getCurrencyDefinitions;
  const __dep3 = __require('./utils/rarity.ts');
  const normalizeRarity = __dep3.normalizeRarity;
};
__modules['./screens/main-menu/dialogues.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/main-menu/dialogues.ts
  const __dep0 = __require('./art.ts');
  const getUnitArt = __dep0.getUnitArt;


  const HERO_DEFAULT_ID = 'leaderA';
  if (!Object.prototype.hasOwnProperty.call(exports, 'HERO_DEFAULT_ID')) exports.HERO_DEFAULT_ID = HERO_DEFAULT_ID;
};
__modules['./screens/main-menu/types.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/main-menu/types.ts
};
__modules['./screens/main-menu/view/events.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/main-menu/view/events.ts



  const TONE_ICONS= {
    greeting: '✨',
    focus,
    gentle,
    motivate,
    warning,
    calm= new Map([
    ['PvE', 'mode-tag--pve'],
    ['PvP', 'mode-tag--pvp'],
    ['Coming soon', 'mode-tag--coming'],
    ['Kinh tế nguyên tinh', 'mode-tag--economy']
  ]);

  const ECONOMY_COMPACT_KEYS = new Set([
    'arena-hub',
    'tongmon',
    'gacha',
    'lineup',
    'collection',
    'market',
    'events',
    'social'
  ]);
};
__modules['./screens/main-menu/view/index.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/main-menu/view/index.ts
  const __dep1 = __require('./ui/dom.ts');
  const mountSection = __dep1.mountSection;
  const __dep2 = __require('./screens/main-menu/view/layout.ts');
  const ensureStyles = __dep2.ensureStyles;
  const createHeader = __dep2.createHeader;
  const createModesSection = __dep2.createModesSection;
  const __dep3 = __require('./utils/player-profile.ts');
  const resetPlayerProfileData = __dep3.resetPlayerProfileData;
  const __dep4 = __require('./utils/currency.ts');
  const resetSharedCurrencyWallet = __dep4.resetSharedCurrencyWallet;
  const __dep5 = __require('./utils/frame-rate.ts');
  const getFrameRateCap = __dep5.getFrameRateCap;
  const setFrameRateCap = __dep5.setFrameRateCap;
  const FrameRateCap = __dep5.FrameRateCap;
  const __dep6 = __require('./utils/audio-settings.ts');
  const isAudioEnabled = __dep6.isAudioEnabled;
  const setAudioEnabled = __dep6.setAudioEnabled;

  function createSettingsHub(container, addCleanup){
    const toolbar = document.createElement('div');
    toolbar.className = 'main-menu-v2__toolbar';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'main-menu-settings-btn';
    trigger.textContent = '⚙';
    trigger.setAttribute('aria-label', 'Mở cài đặt');
    toolbar.appendChild(trigger);
    container.appendChild(toolbar);

    const overlay = document.createElement('div');
    overlay.className = 'main-menu-settings-overlay';

    const hub = document.createElement('section');
    hub.className = 'main-menu-settings-hub';
    overlay.appendChild(hub);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'main-menu-settings-close';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Đóng cài đặt');
    hub.appendChild(closeBtn);

    const nav = document.createElement('nav');
    nav.className = 'main-menu-settings-nav';
    const tabs = ['chung', 'đồ hoạ', 'âm thanh', 'tài khoản'] /* /* as const */ */;
    const navButtons = new Map();
    tabs.forEach((tabId) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'main-menu-settings-nav-btn';
      btn.dataset.tab = tabId;
      btn.textContent = tabId.charAt(0).toUpperCase() + tabId.slice(1);
      navButtons.set(tabId, btn);
      nav.appendChild(btn);
    });
    hub.appendChild(nav);

    const content = document.createElement('div');
    content.className = 'main-menu-settings-content';
    hub.appendChild(content);

    const title = document.createElement('h3');
    title.className = 'main-menu-settings-title';
    const description = document.createElement('p');
    description.className = 'main-menu-settings-desc';
    content.appendChild(title);
    content.appendChild(description);

    const graphicsActions = document.createElement('div');
    graphicsActions.className = 'main-menu-settings-fps';
    graphicsActions.style.display = 'none';

    const fpsLabel = document.createElement('p');
    fpsLabel.className = 'main-menu-settings-fps__label';
    fpsLabel.textContent = 'Giới hạn FPS';
    graphicsActions.appendChild(fpsLabel);

    const fpsOptions = document.createElement('div');
    fpsOptions.className = 'main-menu-settings-fps__options';
    const fpsButtons = new Map();
    ([30, 60] /* /* as const */ */).forEach((fps) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'main-menu-settings-fps__btn';
      btn.dataset.fps = String(fps);
      btn.textContent = `${fps} FPS`;
      btn.setAttribute('aria-pressed', 'false');
      fpsButtons.set(fps, btn);
      fpsOptions.appendChild(btn);
    });
    graphicsActions.appendChild(fpsOptions);
    content.appendChild(graphicsActions);

    const audioActions = document.createElement('div');
    audioActions.className = 'main-menu-settings-fps';
    audioActions.style.display = 'none';

    const audioLabel = document.createElement('p');
    audioLabel.className = 'main-menu-settings-fps__label';
    audioLabel.textContent = 'Âm thanh';
    audioActions.appendChild(audioLabel);

    const audioToggle = document.createElement('button');
    audioToggle.type = 'button';
    audioToggle.className = 'main-menu-settings-fps__btn';
    audioToggle.dataset.audioToggle = 'true';
    audioActions.appendChild(audioToggle);
    content.appendChild(audioActions);

    const accountActions = document.createElement('div');
    accountActions.style.display = 'none';
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'main-menu-settings-danger-btn';
    resetBtn.textContent = 'Xoá dữ liệu';

    const confirmWrap = document.createElement('div');
    confirmWrap.className = 'main-menu-settings-confirm';
    const confirmText = document.createElement('p');
    confirmText.textContent = 'Bạn muốn xoá toàn bộ dữ liệu tài khoản?';
    const confirmActions = document.createElement('div');
    confirmActions.className = 'main-menu-settings-confirm-actions';
    const confirmYes = document.createElement('button');
    confirmYes.type = 'button';
    confirmYes.className = 'main-menu-settings-confirm-btn main-menu-settings-confirm-btn--danger';
    confirmYes.textContent = 'Xác nhận';
    const confirmNo = document.createElement('button');
    confirmNo.type = 'button';
    confirmNo.className = 'main-menu-settings-confirm-btn';
    confirmNo.textContent = 'Từ chối';
    confirmActions.appendChild(confirmYes);
    confirmActions.appendChild(confirmNo);
    confirmWrap.appendChild(confirmText);
    confirmWrap.appendChild(confirmActions);
    accountActions.appendChild(resetBtn);
    accountActions.appendChild(confirmWrap);
    content.appendChild(accountActions);

    container.appendChild(overlay);

    let activeTab = 'chung';
    let activeFrameRateCap = getFrameRateCap();
    let audioEnabled = isAudioEnabled();

    const renderFrameRateButtons = () => {
      fpsButtons.forEach((btn, fps) => {
        const isActive = fps === activeFrameRateCap;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });
    };
    const renderAudioToggle = () => {
      audioToggle.textContent = audioEnabled ? 'Bật âm' : 'Tắt âm';
      audioToggle.classList.toggle('is-active', audioEnabled);
      audioToggle.setAttribute('aria-pressed', String(audioEnabled));
    };
    const renderTab = () => {

      navButtons.forEach((btn, tabId) => btn.classList.toggle('is-active', tabId === activeTab));
      graphicsActions.style.display = activeTab === 'đồ hoạ' ? '' : 'none';
      audioActions.style.display = activeTab === 'âm thanh' ? '' : 'none';
      accountActions.style.display = activeTab === 'tài khoản' ? '' : 'none';
      renderFrameRateButtons();
      renderAudioToggle();
      confirmWrap.classList.remove('is-open');
      if (activeTab === 'chung'){
        title.textContent = 'Cài đặt chung';
        description.textContent = 'Các cấu hình chung sẽ được bổ sung sau.';
        return;
      }
      if (activeTab === 'đồ hoạ'){
        title.textContent = 'Cài đặt đồ hoạ';
        description.textContent = 'Chọn giới hạn tốc độ khung hình để ưu tiên độ mượt hoặc tiết kiệm tài nguyên.';
        return;
      }
      if (activeTab === 'âm thanh'){
        title.textContent = 'Cài đặt âm thanh';
        description.textContent = 'Bật/tắt âm thanh hiệu ứng và môi trường trong các chế độ chơi.';
        return;
      }
      title.textContent = 'Cài đặt tài khoản';
      description.textContent = 'Khu vực test dữ liệu tài khoản.';
    };

    const openHub = () => {
      overlay.classList.add('is-open');
      renderTab();
    };

    const closeHub = () => {
      overlay.classList.remove('is-open');
      confirmWrap.classList.remove('is-open');
    };

    const onTabClick = (event) => {
      const target = event.target /* as HTMLElement | null */;
      const tabBtn = target?.closest('.main-menu-settings-nav-btn') /* as HTMLButtonElement | null */;
      if (!tabBtn) return;
      const tabId = String(tabBtn.dataset.tab ?? '');
      if (!navButtons.has(tabId)) return;
      activeTab = tabId;
      renderTab();
    };

    const onFrameRateClick = (event) => {
      const target = event.target /* as HTMLElement | null */;
      const fpsBtn = target?.closest('.main-menu-settings-fps__btn') /* as HTMLButtonElement | null */;
      if (!fpsBtn) return;
      const nextCap = Number(fpsBtn.dataset.fps) /* as FrameRateCap */;
      if (!fpsButtons.has(nextCap)) return;
      activeFrameRateCap = nextCap;
      setFrameRateCap(nextCap);
      renderFrameRateButtons();
    };

    const onAudioToggleClick = () => {
      audioEnabled = !audioEnabled;
      setAudioEnabled(audioEnabled);
      renderAudioToggle();
    };

    const onResetClick = () => confirmWrap.classList.add('is-open');
    const onResetCancel = () => confirmWrap.classList.remove('is-open');
    const onResetConfirm = () => {
      resetPlayerProfileData();
      resetSharedCurrencyWallet();
      confirmWrap.classList.remove('is-open');
      description.textContent = 'Đã xoá dữ liệu tài khoản thành công. Bạn có thể tiếp tục test.';
    };

    trigger.addEventListener('click', openHub);
    closeBtn.addEventListener('click', closeHub);
    nav.addEventListener('click', onTabClick);
    fpsOptions.addEventListener('click', onFrameRateClick);
    audioToggle.addEventListener('click', onAudioToggleClick);
    resetBtn.addEventListener('click', onResetClick);
    confirmNo.addEventListener('click', onResetCancel);
    confirmYes.addEventListener('click', onResetConfirm);
    addCleanup(() => trigger.removeEventListener('click', openHub));
    addCleanup(() => closeBtn.removeEventListener('click', closeHub));
    addCleanup(() => nav.removeEventListener('click', onTabClick));
    addCleanup(() => fpsOptions.removeEventListener('click', onFrameRateClick));
    addCleanup(() => audioToggle.removeEventListener('click', onAudioToggleClick));
    addCleanup(() => resetBtn.removeEventListener('click', onResetClick));
    addCleanup(() => confirmNo.removeEventListener('click', onResetCancel));
    addCleanup(() => confirmYes.removeEventListener('click', onResetConfirm));
  }

  function renderMainMenuView(state){
    const {
      root,
      shell = null,
      sections = [],
      metadata = [],
      onShowComingSoon
    } = state;

    if (!root) return null;

    ensureStyles();

    const cleanups= [];
    const addCleanup= fn => {
      if (typeof fn === 'function'){
        cleanups.push(fn);
      }
    };

    const container = document.createElement('div');
    container.className = 'main-menu-v2';
    const mount = mountSection({
      root,
      section,
      rootClasses,
      removeRootClasses,
    });

    const header = createHeader();
    container.appendChild(header);

    createSettingsHub(container, addCleanup);

    const layout = document.createElement('div');
    layout.className = 'main-menu-v2__layout';
    container.appendChild(layout);

    const primary = document.createElement('div');
    primary.className = 'main-menu-v2__primary';
    const modes = createModesSection({ sections, metadata, shell, onShowComingSoon, addCleanup });
    primary.appendChild(modes);

    layout.appendChild(primary);

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
        mount.destroy();
      }
    };
  }

  const __reexport0 = __require('./screens/main-menu/view/layout.ts');
  if (!Object.prototype.hasOwnProperty.call(exports, 'ensureStyles')) exports.ensureStyles = __reexport0.ensureStyles;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createHeader')) exports.createHeader = __reexport0.createHeader;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createModesSection')) exports.createModesSection = __reexport0.createModesSection;
  if (!Object.prototype.hasOwnProperty.call(exports, 'renderMainMenuView')) exports.renderMainMenuView = renderMainMenuView;
};
__modules['./screens/main-menu/view/layout.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/main-menu/view/layout.ts
  const __dep0 = __require('./ui/dom.ts');
  const ensureStyleTag = __dep0.ensureStyleTag;
  const __dep1 = __require('./screens/main-menu/view/events.ts');
  const createModeCard = __dep1.createModeCard;

  const STYLE_ID = 'main-menu-view-style';

  function ensureStyles(){
    const css = `
      .app--main-menu{padding:32px 16px 64px;}
      .main-menu-v2{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:32px;color:inherit;}
      .main-menu-v2__header{display:none;}
      .main-menu-v2__brand{display:flex;flex-direction:column;gap:10px;max-width:520px;}
      .main-menu-v2__title{margin:0;font-size:44px;letter-spacing:.08em;text-transform:uppercase;}
      .main-menu-v2__subtitle{margin:0;color:#9cbcd9;line-height:1.6;font-size:17px;}
      .main-menu-v2__meta{display:flex;gap:12px;flex-wrap:wrap;}
      .main-menu-v2__meta-chip{padding:8px 16px;border-radius:999px;border:1px solid rgba(125,211,252,.32);background:rgba(18,28,38,.68);letter-spacing:.12em;font-size:12px;text-transform:uppercase;color:#aee4ff;}
      .main-menu-v2__layout{display:grid;grid-template-columns:minmax(0,1fr);gap:32px;align-items:start;}
      .main-menu-v2__primary{display:flex;flex-direction:column;gap:32px;}
      .main-menu-modes{display:flex;flex-direction:column;gap:24px;}
      .main-menu-modes--hub-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,1fr) minmax(0,1fr);gap:16px;align-items:start;}
      .main-menu-hub-column{display:flex;flex-direction:column;gap:12px;align-items:stretch;}
      .main-menu-hub-column--left{justify-self:start;}
      .main-menu-hub-column--right{justify-self:end;}
      .main-menu-hub-spacer{min-height:420px;}
      .main-menu-modes__title{margin:0;font-size:24px;letter-spacing:.1em;text-transform:uppercase;color:#aee4ff;}
      .mode-section{display:flex;flex-direction:column;gap:18px;}
      .mode-section__name{margin:0;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
      .mode-grid{display:flex;flex-direction:column;gap:16px;}
      .mode-card{position:relative;display:flex;flex-direction:column;gap:11px;align-items:flex-start;padding:22px;border-radius:18px;border:1px solid rgba(125,211,252,.24);background:linear-gradient(150deg,rgba(16,26,36,.92),rgba(18,30,42,.65));color:inherit;cursor:pointer;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;}
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
      .mode-card--compact{padding:14px 13px;gap:9px;min-height:0;align-items:center;text-align:center;width:126px;min-height:86px;justify-content:center;}
      .mode-card--compact .mode-card__icon{font-size:24px;}
      .mode-card--compact .mode-card__title{font-size:14px;letter-spacing:.1em;}
      .mode-card--compact .mode-card__tags{display:none;}
      .mode-card--compact .mode-card__status{left:14px;right:auto;top:14px;padding:4px 10px;}
      .mode-grid--economy{flex-direction:row;flex-wrap:nowrap;overflow-x:auto;gap:16px;padding-bottom:4px;}
      .mode-grid--economy > *{flex:0 0 140px;}
      .mode-grid--economy::-webkit-scrollbar{height:6px;}
      .mode-grid--economy::-webkit-scrollbar-thumb{background:rgba(125,211,252,.24);border-radius:999px;}
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

      .main-menu-v2__toolbar{display:flex;justify-content:flex-end;}
      .main-menu-settings-btn{width:44px;height:44px;border-radius:12px;border:1px solid rgba(125,211,252,.35);background:rgba(16,26,36,.9);color:#d8eeff;font-size:20px;cursor:pointer;}
      .main-menu-settings-btn:hover{border-color:rgba(125,211,252,.6);}
      .main-menu-settings-overlay{position:fixed;inset:0;background:rgba(4,10,16,.46);display:none;align-items:center;justify-content:center;z-index:120;padding:16px;}
      .main-menu-settings-overlay.is-open{display:flex;}
      .main-menu-settings-hub{width:min(820px,95vw);height:min(520px,88vh);border:1px solid rgba(125,211,252,.32);border-radius:18px;background:rgba(7,16,26,.92);display:flex;overflow:hidden;position:relative;}
      .main-menu-settings-close{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:10px;border:1px solid rgba(125,211,252,.3);background:rgba(16,26,36,.9);color:#e6f2ff;cursor:pointer;}
      .main-menu-settings-nav{width:190px;display:flex;flex-direction:column;padding:54px 10px 12px 12px;gap:8px;border-right:1px solid rgba(125,211,252,.2);}
      .main-menu-settings-nav-btn{border:1px solid rgba(125,211,252,.2);background:rgba(11,22,34,.85);color:#cde7ff;border-radius:10px;padding:10px;text-align:left;cursor:pointer;}
      .main-menu-settings-nav-btn.is-active{border-color:rgba(125,211,252,.55);background:rgba(18,34,50,.95);}
      .main-menu-settings-content{flex:1;padding:54px 20px 20px;display:flex;flex-direction:column;gap:12px;}
      .main-menu-settings-title{margin:0;font-size:22px;letter-spacing:.08em;text-transform:uppercase;}
      .main-menu-settings-desc{margin:0;color:#9cbcd9;}
      .main-menu-settings-fps{margin-top:6px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;}
      .main-menu-settings-fps__label{margin:0;color:#d8eeff;font-size:13px;letter-spacing:.12em;text-transform:uppercase;}
      .main-menu-settings-fps__options{display:flex;gap:10px;flex-wrap:wrap;}
      .main-menu-settings-fps__btn{border:1px solid rgba(125,211,252,.28);background:rgba(16,26,36,.84);color:#cde7ff;border-radius:999px;padding:9px 14px;cursor:pointer;letter-spacing:.08em;transition:border-color .18s ease,background .18s ease,box-shadow .18s ease;}
      .main-menu-settings-fps__btn:hover{border-color:rgba(125,211,252,.5);}
      .main-menu-settings-fps__btn.is-active{border-color:rgba(125,211,252,.72);background:rgba(18,48,70,.92);box-shadow:0 0 18px rgba(125,211,252,.16);color:#e8f7ff;}
      .main-menu-settings-danger-btn{align-self:flex-start;border:1px solid rgba(255,128,128,.45);background:rgba(52,14,18,.82);color:#ffd4d4;border-radius:10px;padding:10px 14px;cursor:pointer;}
      .main-menu-settings-confirm{margin-top:8px;border:1px solid rgba(255,128,128,.45);background:rgba(52,14,18,.55);border-radius:12px;padding:12px;display:none;flex-direction:column;gap:10px;}
      .main-menu-settings-confirm.is-open{display:flex;}
      .main-menu-settings-confirm-actions{display:flex;gap:10px;}
      .main-menu-settings-confirm-btn{border:1px solid rgba(125,211,252,.35);background:rgba(16,26,36,.9);color:#d8eeff;border-radius:10px;padding:8px 12px;cursor:pointer;}
      .main-menu-settings-confirm-btn--danger{border-color:rgba(255,128,128,.45);background:rgba(80,18,24,.9);color:#ffe3e3;}

      @media(max-width:960px){.main-menu-v2__layout{grid-template-columns:1fr;}.main-menu-modes--hub-layout{grid-template-columns:1fr;}.main-menu-hub-column--right{justify-self:start;}.main-menu-hub-spacer{display:none;}}
      @media(max-width:640px){.main-menu-v2{gap:24px;}.main-menu-v2__title{font-size:36px;}.mode-card{padding:20px;}}
    `;

    ensureStyleTag(STYLE_ID, { css });
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'ensureStyles')) exports.ensureStyles = ensureStyles;
};
__modules['./screens/monopoly/house-module.ts'] = (exports, module, __require) => {


  /**
   * House module = "ô nhà" trong Monopoly.
   *
   * Thiết kế tách riêng để nhiệm vụ sau chỉ cần đọc file này là hiểu:
   * - Cách spawn slot nhà ngẫu nhiên (marker '?', tối đa 16).
   * - Cách reveal tier + bất động sản khi người chơi chọn mua.
   * - Cách tích trữ bạc từ tự sinh + thuế + mỏ.
   * - Cách xử lý đi ngang / đạp trúng cho chủ nhà và người khác.
   * - Cách nâng cấp nhà theo rule từng bất động sản.
   */
};
__modules['./screens/monopoly/index.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./ui/dom.ts');
  const ensureStyleTag = __dep0.ensureStyleTag;
  const mountSection = __dep0.mountSection;
  const __dep1 = __require('./art.ts');
  const getUnitArt = __dep1.getUnitArt;
  const __dep2 = __require('./catalog.ts');
  const CLASS_BASE = __dep2.CLASS_BASE;
  const RANK_MULT = __dep2.RANK_MULT;
  const ROSTER = __dep2.ROSTER;
  const ClassName = __dep2.ClassName;
  const RankName = __dep2.RankName;
  const __dep3 = __require('./data/roster-preview.ts');
  const computeFinalStats = __dep3.computeFinalStats;
  const __dep4 = __require('./screens/monopoly/house-module.ts');
  const applySpiritGainWithHouseOverflow = __dep4.applySpiritGainWithHouseOverflow;
  const getHouseOwnerEffectSpec = __dep4.getHouseOwnerEffectSpec;
  const collectHouseIncome = __dep4.collectHouseIncome;
  const createRandomHouseSlots = __dep4.createRandomHouseSlots;
  const getHouseDefinitionById = __dep4.getHouseDefinitionById;
  const getHouseVisitorPenalty = __dep4.getHouseVisitorPenalty;
  const revealHousePurchase = __dep4.revealHousePurchase;
  const settleHouseTraverse = __dep4.settleHouseTraverse;
  const shouldTriggerAssassinTaxPunishment = __dep4.shouldTriggerAssassinTaxPunishment;
  const upgradeHouse = __dep4.upgradeHouse;
  const resetHouseSlotsByOwner = __dep4.resetHouseSlotsByOwner;

  const STYLE_ID = 'monopoly-screen-style';
  const BOARD_SIZE = 15;
  const MAIN_TRACK_OFFSET = 2;
  const MAIN_RING_SIZE = 11;
  const MAIN_TRACK_CELLS = 40;
  const SIDE_TRACK_COLUMN_HEIGHT = 9;
  const SIDE_TRACK_PROTRUSION_CELLS = 8;
  const MINI_RING_CELLS = 24;
  const MICRO_RING_CELLS = 8;
  const TOTAL_CELLS = MAIN_TRACK_CELLS + SIDE_TRACK_COLUMN_HEIGHT * 4 + SIDE_TRACK_PROTRUSION_CELLS + MINI_RING_CELLS + MICRO_RING_CELLS;
  const INNER_COLUMN_HEIGHT = 9;
  const ISO_TILE_WIDTH = 48;
  const ISO_TILE_HEIGHT = 24;
  const ISO_HALF_WIDTH = ISO_TILE_WIDTH / 2;
  const ISO_HALF_HEIGHT = ISO_TILE_HEIGHT / 2;
  const ISO_PADDING = 28;
  const BOARD_MAX_SCALE = 2.4;
  const BOARD_MIN_SCALE = 1;

  const CSS = /* css */ `
    .app--co-ty-phu{
      padding:24px 16px 48px;
    }
    .monopoly-screen{
      max-width:1080px;
      margin:0 auto;
      display:flex;
      flex-direction:column;
      gap:18px;
      color:#e8f2ff;
    }
    .monopoly-screen__topbar{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      flex-wrap:wrap;
    }
    .monopoly-screen__back{
      border:1px solid rgba(148, 199, 255, 0.5);
      background:rgba(10, 20, 33, 0.85);
      border-radius:999px;
      color:#e8f2ff;
      padding:10px 18px;
      cursor:pointer;
    }
    .monopoly-screen__meta{
      display:flex;
      gap:12px;
      font-size:14px;
      color:#9ec3e8;
    }
    .monopoly-screen__wallet{
      margin-left:auto;
      display:flex;
      flex-direction:column;
      align-items:flex-end;
      gap:8px;
    }
    .monopoly-screen__wallet-currency{
      display:flex;
      align-items:center;
      gap:8px;
    }
    .monopoly-screen__wallet-year{
      min-width:84px;
      text-align:right;
      color:#b8d8ff;
      font-size:12px;
      letter-spacing:0.04em;
      text-transform:uppercase;
    }
    .monopoly-screen__wallet-slot{
      min-width:36px;
      height:28px;
      border-radius:8px;
      border:1px solid rgba(210, 226, 246, 0.4);
      background:rgba(8, 21, 37, 0.78);
      color:#f3f7ff;
      font-size:13px;
      font-weight:700;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:0 8px;
    }
    .monopoly-screen__wallet-slot--silver{
      border-color:rgba(213, 224, 236, 0.66);
      box-shadow:inset 0 0 0 1px rgba(228, 236, 247, 0.18);
    }
    .monopoly-screen__wallet-slot--gold{
      border-color:rgba(246, 214, 123, 0.72);
      box-shadow:inset 0 0 0 1px rgba(255, 226, 145, 0.22);
    }
    .monopoly-screen__turn{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      flex-wrap:wrap;
      padding:10px 14px;
      border:1px solid rgba(148, 199, 255, 0.28);
      border-radius:12px;
      background:rgba(8, 21, 37, 0.78);
      color:#d6ebff;
      font-size:14px;
    }
    .monopoly-screen__automation{
      display:flex;
      align-items:center;
      gap:14px;
      flex-wrap:wrap;
      padding:10px 14px;
      border:1px solid rgba(148, 199, 255, 0.2);
      border-radius:12px;
      background:rgba(8, 21, 37, 0.52);
    }
    .monopoly-screen__automation-item{
      display:inline-flex;
      align-items:center;
      gap:8px;
      color:#d6ebff;
      font-size:13px;
      cursor:pointer;
      user-select:none;
    }
    .monopoly-screen__automation-item input{
      accent-color:#73d7b2;
      cursor:pointer;
    }
    .monopoly-inventory{
      position:fixed;
      top:78px;
      right:12px;
      display:flex;
      align-items:center;
      gap:6px;
      z-index:18;
      pointer-events:none;
    }
    .monopoly-inventory__slot{
      width:48px;
      height:48px;
      border-radius:10px;
      border:1px solid rgba(150, 200, 255, 0.58);
      background:rgba(8, 21, 37, 0.88);
      box-shadow:inset 0 0 0 1px rgba(255,255,255,0.08);
      display:flex;
      align-items:center;
      justify-content:center;
      color:#eef6ff;
      font-size:19px;
      line-height:1;
    }
    .monopoly-forge{
      position:fixed;
      top:138px;
      right:12px;
      width:min(320px, calc(100vw - 24px));
      border-radius:14px;
      border:1px solid rgba(180, 134, 76, 0.55);
      background:rgba(28, 17, 9, 0.94);
      box-shadow:0 18px 40px rgba(0,0,0,0.42);
      padding:14px;
      display:flex;
      flex-direction:column;
      gap:10px;
      z-index:20;
    }
    .monopoly-forge__top{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:12px;
    }
    .monopoly-forge__title{
      margin:0;
      font-size:14px;
      color:#ffd8ae;
    }
    .monopoly-forge__copy{
      margin:4px 0 0;
      font-size:12px;
      color:#dcb88e;
      line-height:1.5;
    }
    .monopoly-forge__close{
      border:1px solid rgba(255, 214, 170, 0.4);
      background:rgba(57, 30, 11, 0.95);
      color:#fff0dc;
      border-radius:10px;
      width:30px;
      height:30px;
      cursor:pointer;
      font-size:16px;
      line-height:1;
    }
    .monopoly-forge__list{
      display:flex;
      flex-direction:column;
      gap:8px;
      max-height:260px;
      overflow:auto;
    }
    .monopoly-forge__item{
      border:1px solid rgba(255, 214, 170, 0.24);
      background:rgba(57, 30, 11, 0.72);
      border-radius:10px;
      padding:10px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
    }
    .monopoly-forge__meta{
      display:flex;
      flex-direction:column;
      gap:4px;
      min-width:0;
    }
    .monopoly-forge__name{
      font-size:13px;
      color:#fff4e8;
    }
    .monopoly-forge__desc{
      font-size:11px;
      color:#dcb88e;
    }
    .monopoly-forge__buy{
      border:1px solid rgba(247, 198, 135, 0.45);
      background:rgba(131, 72, 26, 0.92);
      color:#fff5eb;
      border-radius:10px;
      padding:8px 10px;
      cursor:pointer;
      white-space:nowrap;
    }
    .monopoly-forge__foot{
      font-size:11px;
      color:#dcb88e;
    }
    .monopoly-board{
      width:min(96vw, 1180px);
      max-width:100%;
      height:auto;
      margin:0 auto;
      position:relative;
      overflow:visible;
      --tile-w:${ISO_TILE_WIDTH}px;
      --tile-h:${ISO_TILE_HEIGHT}px;
      --tile-font:10px;
    }
    .monopoly-cell{
      position:absolute;
      width:var(--tile-w);
      height:var(--tile-h);
      border:1px solid rgba(130, 168, 210, 0.4);
      background:rgba(22, 34, 49, 0.88);
      box-shadow:inset 0 0 0 1px rgba(255,255,255,0.03);
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:var(--tile-font);
      letter-spacing:0.02em;
      user-select:none;
      transform:translate(-50%, -50%);
      clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }
    .monopoly-cell--main{ background:rgba(24,44,68,0.95); }
    .monopoly-cell--lane{ background:rgba(39,33,67,0.95); }
    .monopoly-cell--connector{ background:rgba(52,39,26,0.96); }
    .monopoly-cell--mini{ background:rgba(28,78,72,0.96); }
    .monopoly-cell--micro{ background:rgba(98,38,111,0.96); }
    .monopoly-cell--event-chaos{
      background:rgba(117, 71, 201, 0.98);
      box-shadow:0 0 0 2px rgba(183, 145, 255, 0.28), inset 0 0 0 1px rgba(255,255,255,0.08);
    }
    .monopoly-cell--event-orchard{
      background:rgba(46, 118, 62, 0.98);
      box-shadow:0 0 0 2px rgba(154, 235, 150, 0.24), inset 0 0 0 1px rgba(255,255,255,0.08);
    }
    .monopoly-avatar{
      position:absolute;
      transform:translate(-50%, -108%);
      width:38px;
      height:38px;
      border-radius:12px;
      border:1px solid rgba(226, 242, 255, 0.68);
      background:rgba(6, 18, 31, 0.3);
      display:flex;
      align-items:center;
      justify-content:center;
      overflow:visible;
      z-index:4;
      animation:avatarFloat 1.1s ease-in-out infinite alternate;
      box-shadow:0 4px 10px rgba(0,0,0,0.42);
    }
    .monopoly-avatar__portrait{
      width:100%;
      height:100%;
      border-radius:12px;
      overflow:hidden;
    }
    .monopoly-avatar img{
      width:100%;
      height:100%;
      object-fit:cover;
    }
    .monopoly-avatar--dead{
      filter:grayscale(0.9);
      opacity:0.5;
    }
    .monopoly-avatar--spirit{
      opacity:0.45;
      filter:grayscale(0.65) saturate(0.72) brightness(1.15);
      box-shadow:0 0 14px rgba(186, 221, 255, 0.55);
    }
    .monopoly-avatar__tag{
      position:absolute;
      top:-27px;
      left:50%;
      transform:translateX(-50%);
      border-radius:999px;
      padding:1px 7px;
      font-size:9px;
      text-transform:uppercase;
      letter-spacing:0.06em;
      color:#f0f7ff;
      background:rgba(20, 68, 112, 0.92);
      border:1px solid rgba(170, 220, 255, 0.55);
    }
    .monopoly-avatar--player .monopoly-avatar__tag{
      background:rgba(18, 114, 66, 0.95);
      border-color:rgba(127, 255, 187, 0.56);
    }
    .monopoly-avatar__hp{
      position:absolute;
      left:50%;
      top:-14px;
      transform:translateX(-50%);
      width:40px;
      height:5px;
      border-radius:999px;
      background:rgba(5, 12, 21, 0.9);
      border:1px solid rgba(160, 205, 255, 0.48);
      overflow:hidden;
    }
    .monopoly-avatar__hp-fill{
    display:block;
      width:100%;
      height:100%;
      background:linear-gradient(90deg, #2ddf78 0%, #21c767 48%, #13a84f 100%);
      transform-origin:left center;
    }
    @keyframes avatarFloat {
      from { transform:translate(-50%, -108%) translateY(0); }
      to { transform:translate(-50%, -108%) translateY(-4px); }
    }
  `;
};
__modules['./screens/monopoly/ready.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./ui/dom.ts');
  const ensureStyleTag = __dep0.ensureStyleTag;
  const mountSection = __dep0.mountSection;
  const __dep1 = __require('./screens/monopoly/index.ts');
  const getMonopolyYearEventDisplayCopy = __dep1.getMonopolyYearEventDisplayCopy;
  const MONOPOLY_YEAR_EVENT_RULE_SUMMARY = __dep1.MONOPOLY_YEAR_EVENT_RULE_SUMMARY;

  const STYLE_ID = 'monopoly-ready-style';

  const CSS = /* css */ `
    .app--co-ty-phu-ready{
      min-height:100dvh;
      padding:20px 16px;
      box-sizing:border-box;
    }
    .monopoly-ready{
      max-width:1100px;
      margin:0 auto;
      min-height:calc(100dvh - 40px);
      border-radius:20px;
      border:1px solid rgba(125,211,252,.24);
      background:linear-gradient(160deg, rgba(11,20,34,.96), rgba(17,33,52,.88));
      color:#e6f2ff;
      display:flex;
      flex-direction:column;
      gap:16px;
      padding:24px;
    }
    .monopoly-ready__back{
      align-self:flex-start;
      border:1px solid rgba(148,199,255,.5);
      background:rgba(10,20,33,.85);
      border-radius:999px;
      color:#e8f2ff;
      padding:10px 18px;
      cursor:pointer;
    }
    .monopoly-ready__title{margin:0;font-size:30px;letter-spacing:.04em;text-transform:uppercase;}
    .monopoly-ready__desc{max-width:560px;margin:0;color:#9ec3e8;line-height:1.6;}
    .monopoly-ready__events{display:grid;gap:10px;padding:16px 18px;border-radius:18px;border:1px solid rgba(148,199,255,.2);background:rgba(9,20,32,.72);}
    .monopoly-ready__events-title{margin:0;font-size:16px;letter-spacing:.05em;text-transform:uppercase;color:#dff0ff;}
    .monopoly-ready__events-desc{margin:0;color:#9ec3e8;line-height:1.6;}
    .monopoly-ready__events-list{margin:0;padding-left:20px;display:grid;gap:8px;color:#e6f2ff;line-height:1.55;}
    .monopoly-ready__events-list strong{color:#ffffff;}
    .monopoly-ready__footer{margin-top:auto;display:flex;justify-content:flex-end;}
    .monopoly-ready__start{
      border:1px solid rgba(110,231,183,.52);
      background:linear-gradient(160deg, rgba(20,74,56,.95), rgba(13,110,88,.92));
      color:#e9fff7;
      border-radius:14px;
      padding:12px 24px;
      text-transform:uppercase;
      letter-spacing:.08em;
      font-weight:700;
      cursor:pointer;
    }
  `;
};
__modules['./screens/sect/index.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./ui/dom.ts');
  const ensureStyleTag = __dep0.ensureStyleTag;
  const mountSection = __dep0.mountSection;
  const __dep1 = __require('./cultivation.ts');
  const getCultivationCost = __dep1.getCultivationCost;
  const __dep2 = __require('./utils/player-profile.ts');
  const loadPlayerProfile = __dep2.loadPlayerProfile;
  const patchPlayerProfile = __dep2.patchPlayerProfile;


  const STYLE_ID = 'sect-screen-style-v1';
  const DEFAULT_SECT_NAME = 'Tông Môn Vô Danh';
  const SECT_OPTIONS = ['Thiên Cơ Lâu', 'Tu Luyện Phòng', 'Bách Khí Các', 'Luyện Đan Các', 'Dược Các', 'Bảo Khố'] /* /* as const */ */;
  const CULTIVATION_OPTION_INDEX = SECT_OPTIONS.indexOf('Tu Luyện Phòng');
  const OFFLINE_CULTIVATION_MAX_MINUTES = 12 * 60;
  const BASE_SUBREALM_MINUTES = 120;
  const EXTRA_SUBREALM_MINUTES_PER_REALM = 30;

  const CSS = /* css */ `
    .app--sect{padding:32px 16px 64px;}
    .sect-screen{max-width:1280px;margin:0 auto;display:flex;flex-direction:column;gap:24px;min-height:70vh;}
    .sect-screen__top{display:flex;justify-content:center;align-items:center;min-height:48px;}
    .sect-screen__title{margin:0;font-size:34px;letter-spacing:.08em;text-transform:uppercase;color:#e6f2ff;text-align:center;}
    .sect-screen__layout{display:grid;grid-template-columns:220px 1fr;gap:24px;align-items:flex-start;min-height:520px;}
    .sect-screen__left{display:flex;flex-direction:column;gap:10px;}
    .sect-screen__hub-button{height:64px;padding:10px 12px;border-radius:12px;border:1px solid transparent;background:rgba(12,20,28,.72);color:#e6f2ff;display:flex;align-items:center;justify-content:center;text-align:center;letter-spacing:.04em;cursor:default;font-size:14px;}
    .sect-screen__hub-button--compact{width:75%;justify-self:start;}
    .sect-screen__center{border:1px dashed rgba(125,211,252,.14);border-radius:18px;min-height:500px;background:rgba(8,14,22,.15);}
    .sect-screen__back{align-self:flex-start;width:38px;height:38px;border-radius:999px;border:1px solid rgba(125,211,252,.32);background:rgba(16,26,36,.78);color:#aee4ff;display:grid;place-items:center;font-size:16px;line-height:1;cursor:pointer;padding:0;}
    .sect-screen__naming-overlay{position:fixed;inset:0;background:rgba(5,10,18,.72);display:flex;align-items:center;justify-content:center;padding:20px;z-index:70;}
    .sect-screen__naming-hub{width:min(520px,100%);border:1px solid rgba(125,211,252,.35);border-radius:18px;background:linear-gradient(160deg,rgba(11,20,30,.96),rgba(6,12,20,.96));padding:22px;display:flex;flex-direction:column;gap:12px;box-shadow:0 24px 54px rgba(0,0,0,.45);}
    .sect-screen__naming-title{margin:0;font-size:22px;letter-spacing:.05em;text-align:center;}
    .sect-screen__naming-input{width:100%;padding:12px 14px;border-radius:12px;border:1px solid rgba(125,211,252,.38);background:rgba(10,18,28,.82);color:#e6f2ff;font-size:16px;}
    .sect-screen__naming-actions{display:flex;justify-content:flex-end;}
    .sect-screen__naming-save{padding:10px 18px;border-radius:12px;border:1px solid rgba(125,211,252,.45);background:rgba(19,34,50,.9);color:#e6f2ff;font-size:13px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;}
    .sect-screen__cultivation{padding:24px;display:flex;flex-direction:column;gap:12px;color:#d8ecff;}
    .sect-screen__cultivation-title{margin:0;font-size:24px;letter-spacing:.04em;}
    .sect-screen__cultivation-actions{display:flex;gap:10px;flex-wrap:wrap;}
    .sect-screen__cultivation-btn{padding:10px 14px;border-radius:10px;border:1px solid rgba(125,211,252,.35);background:rgba(18,30,44,.88);color:#e6f2ff;cursor:pointer;}
  `;
};
__modules['./screens/sect/tactical-ai.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./ui/dom.ts');
  const ensureStyleTag = __dep0.ensureStyleTag;
  const mountSection = __dep0.mountSection;
  const __dep1 = __require('./units.ts');
  const UNITS = __dep1.UNITS;
  const __dep2 = __require('./utils/player-profile.ts');
  const loadPlayerProfile = __dep2.loadPlayerProfile;
  const patchPlayerProfile = __dep2.patchPlayerProfile;
  const __dep3 = __require('./utils/unit-id.ts');
  const normalizeUnitId = __dep3.normalizeUnitId;
  const __dep4 = __require('./screens/collection/helpers.ts');
  const isCollectionPlayableUnit = __dep4.isCollectionPlayableUnit;



  const STYLE_ID = 'sect-tactical-ai-style-v1';
  const SLOT_COUNT = 5;
  const DEFAULT_THRESHOLD = 30;
  const PLAYABLE_UNITS = UNITS.filter(isCollectionPlayableUnit);

  const CONDITION_OPTIONS= [
    { value: 'always', label,
    { value: 'self_hp_below', label,
    { value: 'self_has_debuff', label,
    { value: 'ally_lowest_hp', label,
    { value: 'ally_controlled', label,
    { value: 'pool_aether_above', label,
    { value: 'enemy_lowest_hp', label,
    { value: 'enemy_is_boss', label,
    { value: 'enemy_role_is', label,
    { value: 'enemy_has_shield', label,
  ];

  const ACTION_OPTIONS= [
    { value: 'basic', label,
    { value: 'skill1', label,
    { value: 'skill2', label,
    { value: 'skill3', label,
  ];

  const CONDITION_LABEL_BY_VALUE = new Map(CONDITION_OPTIONS.map((option) => [option.value, option.label]));
  const ACTION_LABEL_BY_VALUE = new Map(ACTION_OPTIONS.map((option) => [option.value, option.label]));
  const THRESHOLD_ENABLED_CONDITIONS = new Set(['self_hp_below', 'pool_aether_above']);

  const CSS = `
  .app--sect-tactical-ai{padding:20px 16px 48px;}
  .tactical-ai{max-width:1280px;margin:0 auto;display:flex;flex-direction:column;gap:16px;color:#e9f2ff;}
  .tactical-ai__layout{display:grid;grid-template-columns:280px 1fr;gap:16px;min-height:560px;}
  .tactical-ai__left,.tactical-ai__right{border:1px solid rgba(125,211,252,.28);border-radius:14px;background:rgba(10,18,28,.75);padding:14px;}
  .tactical-ai__left-list{display:flex;flex-direction:column;gap:8px;max-height:520px;overflow:auto;}
  .tactical-ai__unit{display:flex;gap:10px;align-items:center;border:1px solid rgba(125,211,252,.2);background:rgba(15,25,38,.7);border-radius:10px;padding:8px;cursor:pointer}
  .tactical-ai__unit.is-active{border-color:#67e8f9;box-shadow:0 0 0 1px rgba(103,232,249,.3) inset;}
  .tactical-ai__avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:rgba(125,211,252,.22)}
  .tactical-ai__slot{display:grid;grid-template-columns:2fr 2fr 120px;gap:10px;align-items:center;margin-bottom:10px;}
  .tactical-ai__toolbar{display:flex;justify-content:space-between;align-items:center;}
  .tactical-ai input{width:100%;padding:9px;border-radius:8px;background:#0f1a28;color:#e9f2ff;border:1px solid rgba(125,211,252,.25)}
  .tactical-ai__picker-trigger{width:100%;text-align:left;padding:9px;border-radius:8px;background:#0f1a28;color:#e9f2ff;border:1px solid rgba(125,211,252,.25)}
  .tactical-ai__picker-overlay{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:1000;background:rgba(2,6,15,.72);padding:16px}
  .tactical-ai__picker-overlay.is-open{display:flex}
  .tactical-ai__picker-panel{width:min(680px,100%);max-height:min(80vh,680px);overflow:auto;border:1px solid rgba(125,211,252,.28);border-radius:14px;background:rgba(10,18,28,.97);padding:14px;display:flex;flex-direction:column;gap:10px}
  .tactical-ai__picker-title{margin:0;font-size:20px;font-weight:700}
  .tactical-ai__picker-option{width:100%;display:flex;gap:10px;align-items:flex-start;padding:10px;border-radius:10px;border:1px solid rgba(125,211,252,.25);background:rgba(15,25,38,.8);color:#e9f2ff;text-align:left}
  .tactical-ai__picker-option.is-active{border-color:#67e8f9;box-shadow:0 0 0 1px rgba(103,232,249,.3) inset}
  .tactical-ai__picker-option-index{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:rgba(125,211,252,.2);font-size:12px;font-weight:700;flex:0 0 auto}
  `;

  function ensureStyles(){ ensureStyleTag(STYLE_ID, { css: CSS }); }

  function loadConfig(){
    return { ...((loadPlayerProfile().tacticalAiByUnit /* as Record<string */, unknown>) ?? {}) };
  }

  function sanitizeUnitId(value){
    return normalizeUnitId(typeof value === 'string' ? value : '');
  }

  function getUnitRows(config, unknown>, unitId){
    const normalizedUnitId = sanitizeUnitId(unitId);
    if (!normalizedUnitId) return [];
    const existing = config[normalizedUnitId];
    if (Array.isArray(existing)) return existing /* as Record<string */, unknown>[];
    const nextRows= [];
    config[normalizedUnitId] = nextRows;
    return nextRows;
  }

  function renderScreen({ root, shell = null }{ root: HTMLElement; shell: MainMenuShell | null }){ destroy: () => void } {
    ensureStyles();
    const container = document.createElement('div');
    container.className = 'tactical-ai';
    const mount = mountSection({ root, section, rootClasses);

    const toolbar = document.createElement('div');
    toolbar.className = 'tactical-ai__toolbar';
    const back = document.createElement('button');
    back.textContent = '← Trở về Tông Môn';
    back.onclick = () => shell?.enterScreen?.('sect');
    const title = document.createElement('h2');
    title.textContent = 'Thiên Cơ Các (Tactical AI)';
    toolbar.append(back, title);

    const layout = document.createElement('div');
    layout.className = 'tactical-ai__layout';
    const left = document.createElement('section');
    left.className = 'tactical-ai__left';
    const right = document.createElement('section');
    right.className = 'tactical-ai__right';

    const list = document.createElement('div');
    list.className = 'tactical-ai__left-list';
    left.appendChild(list);

    layout.append(left, right);
    container.append(toolbar, layout);

    const allUnits = PLAYABLE_UNITS;
    let activeUnitId = allUnits[0]?.id ?? '';
    const tacticalConfig = loadConfig();
    let saveTimerId= null;
    let isDirty = false;
    let lastSerializedConfig = JSON.stringify(tacticalConfig);
    const unitButtons = new Map();
    const editorRows= [];
    const pickerOverlay = document.createElement('div');
    pickerOverlay.className = 'tactical-ai__picker-overlay';
    const pickerPanel = document.createElement('div');
    pickerPanel.className = 'tactical-ai__picker-panel';
    const pickerTitle = document.createElement('h3');
    pickerTitle.className = 'tactical-ai__picker-title';
    const pickerList = document.createElement('div');
    pickerPanel.append(pickerTitle, pickerList);
    pickerOverlay.appendChild(pickerPanel);
    container.appendChild(pickerOverlay);
    let pickerState; type: 'condition' | 'action' } | null = null;

    const readEditorSnapshot = (editor)=> (
      `${editor.conditionValue}|${editor.actionValue}|${editor.threshold.value}`
    );

    const isConditionValue = (value)=> CONDITION_LABEL_BY_VALUE.has(value);
    const isActionValue = (value)=> ACTION_LABEL_BY_VALUE.has(value /* as GambitActionType */);
    const shouldEnableThreshold = (condition)=> THRESHOLD_ENABLED_CONDITIONS.has(condition);

    const syncThresholdState = (editor)=> {
      const enabled = shouldEnableThreshold(editor.conditionValue);
      editor.threshold.disabled = !enabled;
      editor.threshold.title = enabled ? 'Nhập giá trị ngưỡng bằng bàn phím.' : 'Điều kiện này không dùng ngưỡng.';
    };

    const applyEditorButtonLabels = (editor)=> {
      editor.condition.textContent = CONDITION_LABEL_BY_VALUE.get(editor.conditionValue) ?? 'Luôn luôn';
      editor.action.textContent = ACTION_LABEL_BY_VALUE.get(editor.actionValue) ?? 'Đánh thường';
    };

    const closePicker = ()=> {
      pickerState = null;
      pickerOverlay.classList.remove('is-open');
      pickerList.replaceChildren();
    };

    const openPicker = (rowIndex, type)=> {
      const editor = editorRows[rowIndex];
      if (!editor) return;
      pickerState = { rowIndex, type };
      pickerTitle.textContent = type === 'condition' ? 'Chọn điều kiện kích hoạt' : 'Chọn hành động ưu tiên';
      pickerList.replaceChildren();

      const options = type === 'condition' ? CONDITION_OPTIONS : ACTION_OPTIONS;
      options.forEach((option, optionIndex) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tactical-ai__picker-option';
        button.dataset.optionValue = option.value;
        if ((type === 'condition' && editor.conditionValue === option.value) || (type === 'action' && editor.actionValue === option.value)){
          button.classList.add('is-active');
        }
        const index = document.createElement('span');
        index.className = 'tactical-ai__picker-option-index';
        index.textContent = String(optionIndex + 1);
        const label = document.createElement('span');
        label.textContent = option.label;
        button.append(index, label);
        pickerList.appendChild(button);
      });

      pickerOverlay.classList.add('is-open');
    };

    const flushSave = ()=> {
      if (saveTimerId != null) {
        window.clearTimeout(saveTimerId);
        saveTimerId = null;
      }
      if (!isDirty) return;
      const serialized = JSON.stringify(tacticalConfig);
      if (serialized === lastSerializedConfig) {
        isDirty = false;
        return;
      }
      patchPlayerProfile({ tacticalAiByUnit: tacticalConfig });
      lastSerializedConfig = serialized;
      isDirty = false;
    };

    const scheduleSave = ()=> {
      isDirty = true;
      if (saveTimerId != null) {
        window.clearTimeout(saveTimerId);
      }
      saveTimerId = window.setTimeout(() => {
        flushSave();
      }, 120);
    };

    const hydrateEditorValues = ()=> {
      const unitRows = getUnitRows(tacticalConfig, activeUnitId);
      for (let i = 0; i < SLOT_COUNT; i += 1) {
        const slot = unitRows[i] ?? {};
        const editor = editorRows[i];
        if (!editor) continue;
        const condition = String(slot.condition ?? 'always');
        const action = String(slot.action ?? 'basic');
        editor.conditionValue = isConditionValue(condition) ? condition : 'always';
        editor.actionValue = isActionValue(action) ? action : 'basic';
        editor.threshold.value = String(slot.threshold ?? DEFAULT_THRESHOLD);
        applyEditorButtonLabels(editor);
        syncThresholdState(editor);
        editor.snapshot = readEditorSnapshot(editor);
      }
    };

    const applyActiveUnitStyles = ()=> {
      unitButtons.forEach((button, unitId) => {
        button.classList.toggle('is-active', unitId === activeUnitId);
      });
    };

    const renderUnits = ()=> {
      const fragment = document.createDocumentFragment();
      unitButtons.clear();
      allUnits.forEach((unit) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `tactical-ai__unit${unit.id === activeUnitId ? ' is-active' : ''}`;

        const avatar = document.createElement('span');
        avatar.className = 'tactical-ai__avatar';
        avatar.textContent = unit.name.slice(0, 1);

        const label = document.createElement('span');
        label.textContent = unit.name;

        btn.append(avatar, label);
        btn.dataset.unitId = unit.id;
        unitButtons.set(unit.id, btn);
        fragment.appendChild(btn);
      });
      list.replaceChildren(fragment);
    };

    const buildEditor = ()=> {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < SLOT_COUNT; i += 1) {
        const row = document.createElement('div');
        row.className = 'tactical-ai__slot';
        row.dataset.slotIndex = String(i);
        row.innerHTML = `
          <button class="tactical-ai__picker-trigger tactical-ai__condition" type="button"></button>
          <button class="tactical-ai__picker-trigger tactical-ai__action" type="button"></button>
          <input class="tactical-ai__threshold" type="number" inputmode="numeric" step="1" min="0" max="100" />
        `;

        const condition = row.querySelector('.tactical-ai__condition');
        const action = row.querySelector('.tactical-ai__action');
        const threshold = row.querySelector('.tactical-ai__threshold');
        if (!condition || !action || !threshold) continue;

        const editor= {
          root: row,
          condition,
          action,
          threshold,
          conditionValue,
          actionValue,
          snapshot,
        };
        applyEditorButtonLabels(editor);
        syncThresholdState(editor);
        editorRows.push(editor);
        fragment.appendChild(row);
      }
      right.replaceChildren(fragment);
    };

    const onUnitSelect = (event)=> {
      const target = event.target /* as HTMLElement | null */;
      const button = target?.closest('.tactical-ai__unit');
      if (!button) return;
      const nextUnitId = sanitizeUnitId(button.dataset.unitId);
      if (!nextUnitId || nextUnitId === activeUnitId) return;
      activeUnitId = nextUnitId;
      applyActiveUnitStyles();
      hydrateEditorValues();
    };

    const onEditorChange = (event)=> {
      const target = event.target /* as HTMLElement | null */;
      const row = target?.closest('.tactical-ai__slot');
      if (!row) return;
      const slotIndex = Number(row.dataset.slotIndex);
      if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= SLOT_COUNT) return;
      const editor = editorRows[slotIndex];
      if (!editor || editor.root !== row) return;

      const nextSnapshot = readEditorSnapshot(editor);
      if (nextSnapshot === editor.snapshot) return;
      editor.snapshot = nextSnapshot;

      const rows = getUnitRows(tacticalConfig, activeUnitId);
      rows[slotIndex] = {
        condition: editor.conditionValue,
        action,
        threshold),
        enabled,
      };
      scheduleSave();
    };

    const onEditorClick = (event)=> {
      const target = event.target /* as HTMLElement | null */;
      const row = target?.closest('.tactical-ai__slot');
      if (!row) return;
      const slotIndex = Number(row.dataset.slotIndex);
      if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= SLOT_COUNT) return;

      const isConditionTrigger = !!target?.closest('.tactical-ai__condition');
      const isActionTrigger = !!target?.closest('.tactical-ai__action');
      if (isConditionTrigger){
        openPicker(slotIndex, 'condition');
        return;
      }
      if (isActionTrigger){
        openPicker(slotIndex, 'action');
      }
    };

    const onPickerClick = (event)=> {
      const target = event.target /* as HTMLElement | null */;
      if (!target) return;
      if (!pickerState) return;

      if (target === pickerOverlay){
        closePicker();
        return;
      }
      const option = target.closest('.tactical-ai__picker-option');
      if (!option) return;
      const value = option.dataset.optionValue ?? '';
      const editor = editorRows[pickerState.rowIndex];
      if (!editor){
        closePicker();
        return;
      }

      if (pickerState.type === 'condition' && isConditionValue(value)){
        editor.conditionValue = value;
        syncThresholdState(editor);
      }
      if (pickerState.type === 'action' && isActionValue(value)){
        editor.actionValue = value;
      }

      applyEditorButtonLabels(editor);
      editor.root.dispatchEvent(new Event('change', { bubbles: true }));
      closePicker();
    };

    renderUnits();
    buildEditor();
    hydrateEditorValues();
    list.addEventListener('click', onUnitSelect);
    right.addEventListener('click', onEditorClick);
    right.addEventListener('change', onEditorChange);
    pickerOverlay.addEventListener('click', onPickerClick);

    const onUnload = () => flushSave();
    window.addEventListener('beforeunload', onUnload);

    return {
      destroy(){
        window.removeEventListener('beforeunload', onUnload);
        list.removeEventListener('click', onUnitSelect);
        right.removeEventListener('click', onEditorClick);
        right.removeEventListener('change', onEditorChange);
        pickerOverlay.removeEventListener('click', onPickerClick);
        flushSave();
        mount.destroy();
      }
    };
  }

  const render = renderScreen;

  if (!Object.prototype.hasOwnProperty.call(exports, 'render')) exports.render = render;
  if (!Object.prototype.hasOwnProperty.call(exports, 'renderScreen')) exports.renderScreen = renderScreen;
};
__modules['./screens/ui-gacha/gacha.css'] = (exports, module, __require) => {
  const css = "/* home (termux)/arclune_lane_7x3/src/screens/ui-gacha/gacha.css */\n\n:root {\n  color-scheme: dark;\n  font-family: \"Inter\", \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif;\n  --gacha-background: #05090f;\n  --gacha-surface: rgba(12, 18, 28, 0.88);\n  --gacha-surface-strong: rgba(10, 16, 24, 0.96);\n  --gacha-surface-muted: rgba(16, 28, 42, 0.74);\n  --gacha-text: #e9f2ff;\n  --gacha-text-muted: rgba(192, 220, 244, 0.8);\n  --gacha-accent: #76d4ff;\n  --gacha-accent-strong: #ff9aff;\n  --gacha-accent-border: rgba(120, 196, 255, 0.28);\n  --gacha-accent-gradient: linear-gradient(\n    135deg,\n    rgba(118, 212, 255, 0.45),\n    rgba(255, 154, 255, 0.4)\n  );\n  --gacha-radius-sm: 14px;\n  --gacha-radius-md: 18px;\n  --gacha-radius-lg: 24px;\n  --gacha-gap-xs: 4px;\n  --gacha-gap-sm: 8px;\n  --gacha-gap-md: 12px;\n  --gacha-gap-lg: 18px;\n  --gacha-shadow-panel: 0 18px 48px rgba(5, 12, 20, 0.34);\n  --gacha-shadow-popover: 0 12px 32px rgba(5, 12, 20, 0.42);\n  --gacha-safe-top: max(16px, env(safe-area-inset-top));\n  --gacha-safe-right: max(16px, env(safe-area-inset-right));\n  --gacha-safe-bottom: max(16px, env(safe-area-inset-bottom));\n  --gacha-safe-left: max(16px, env(safe-area-inset-left));\n  --bg-page: var(--gacha-background);\n  --bg-panel: var(--gacha-surface);\n  --bg-accent: var(--gacha-surface-muted);\n  --border-accent: var(--gacha-accent-border);\n  --text-main: var(--gacha-text);\n  --text-muted: var(--gacha-text-muted);\n  --primary: var(--gacha-accent);\n  --highlight: var(--gacha-accent-gradient);\n  --rarity-n: #7b869a;\n  --rarity-r: #57a8ff;\n  --rarity-sr: #a47dff;\n  --rarity-ssr: #ffc866;\n  --rarity-ur: #ff6a9f;\n  --rarity-prime: #6cffeb;\n  --focus-ring:\n    0 0 0 3px rgba(5, 9, 15, 0.96), 0 0 0 6px rgba(118, 212, 255, 0.86);\n}\n\nbutton:focus-visible {\n  outline: none;\n  box-shadow: var(--focus-ring);\n}\n\nbutton,\n[role=\"tab\"] {\n  min-width: 40px;\n  min-height: 40px;\n}\n\n* {\n  box-sizing: border-box;\n}\n\nbody.gacha-ui {\n  margin: 0;\n  min-height: 100vh;\n  min-height: 100dvh;\n  background:\n    radial-gradient(\n      circle at top left,\n      rgba(118, 212, 255, 0.18),\n      transparent 45%\n    ),\n    radial-gradient(\n      circle at bottom right,\n      rgba(255, 154, 255, 0.2),\n      transparent 50%\n    ),\n    var(--bg-page);\n  color: var(--text-main);\n  overflow: hidden;\n}\n\nbutton {\n  font-family: inherit;\n  color: inherit;\n}\n\n.gacha-page,\n.gacha-app,\n.gacha-screen-shell,\n.gacha-screen-shell__mount {\n  width: 100%;\n  min-height: 100vh;\n  min-height: 100dvh;\n}\n\n.gacha-screen-shell {\n  position: relative;\n  background:\n    radial-gradient(\n      circle at top left,\n      rgba(118, 212, 255, 0.18),\n      transparent 45%\n    ),\n    radial-gradient(\n      circle at bottom right,\n      rgba(255, 154, 255, 0.2),\n      transparent 50%\n    ),\n    var(--bg-page);\n  color: var(--text-main);\n  overflow: hidden;\n}\n\n.gacha-screen-shell__back {\n  position: absolute;\n  top: max(16px, env(safe-area-inset-top));\n  left: max(16px, env(safe-area-inset-left));\n  z-index: 20;\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  min-height: 40px;\n  padding: 8px 14px;\n  border: 1px solid rgba(120, 196, 255, 0.34);\n  border-radius: 999px;\n  background: rgba(12, 18, 28, 0.72);\n  box-shadow: 0 14px 32px rgba(5, 12, 20, 0.32);\n  backdrop-filter: blur(12px);\n  cursor: pointer;\n}\n\n.gacha-screen-shell__back:hover {\n  border-color: rgba(118, 212, 255, 0.74);\n  box-shadow: 0 16px 36px rgba(31, 177, 255, 0.24);\n}\n\n.gacha-screen-shell__back:focus-visible {\n  border-color: rgba(118, 212, 255, 0.9);\n}\n\n.gacha-screen-shell__back.is-fallback {\n  opacity: 0.72;\n}\n\n.gacha-app--embedded .gacha-screen-shell__mount {\n  padding-top: clamp(48px, 9vh, 64px);\n}\n\n@media (orientation: landscape) and (max-height: 500px) {\n  .gacha-app--embedded .gacha-screen-shell__back {\n    top: max(8px, env(safe-area-inset-top));\n    left: max(8px, env(safe-area-inset-left));\n    min-height: 34px;\n    padding: 6px 10px;\n  }\n\n  .gacha-app--embedded .gacha-screen-shell__mount {\n    padding-top: 0;\n  }\n\n  .gacha-app--embedded .gacha-ui-root,\n  .gacha-app--embedded .gacha-screen {\n    padding-top: max(50px, env(safe-area-inset-top));\n  }\n}\n\n.gacha-ui-root,\n.gacha-screen {\n  width: 100%;\n  height: 100vh;\n  height: 100dvh;\n  padding: var(--gacha-safe-top) var(--gacha-safe-right)\n    var(--gacha-safe-bottom) var(--gacha-safe-left);\n  overflow: hidden;\n}\n\n.gacha-body {\n  --gacha-rail-width: clamp(128px, 16vw, 176px);\n  width: min(1440px, 100%);\n  height: 100%;\n  margin: 0 auto;\n  display: grid;\n  grid-template-columns: var(--gacha-rail-width) minmax(0, 1fr);\n  grid-template-areas: \"rail main\";\n  gap: 18px;\n  min-height: 0;\n}\n\n.banner-sidebar {\n  grid-area: rail;\n  min-width: 0;\n  min-height: 0;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n  background: var(--bg-panel);\n  border-radius: 24px;\n  border: 1px solid var(--border-accent);\n  padding: 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.gacha-main {\n  grid-area: main;\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);\n  grid-template-rows: auto minmax(0, 1fr) auto auto auto;\n  gap: 14px;\n  padding-right: 2px;\n}\n\n.gacha-topbar,\n.banner-panel,\n.banner-panel__featured,\n.banner-panel__pity,\n.banner-panel__actions,\n.currency-mini-hub {\n  border: 1px solid var(--border-accent);\n  background: var(--bg-panel);\n  box-shadow: var(--gacha-shadow-panel);\n}\n\n.gacha-topbar {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto minmax(140px, auto) auto auto;\n  align-items: center;\n  gap: 14px;\n  padding: 14px 18px;\n  border-radius: 24px;\n}\n\n.gacha-topbar__copy {\n  min-width: 0;\n}\n\n.banner-panel {\n  height: auto;\n  min-height: 0;\n  border-radius: 18px;\n  padding: 0;\n  display: grid;\n  grid-template-columns: minmax(0, 1fr);\n  position: relative;\n  overflow: hidden;\n  background: linear-gradient(\n    135deg,\n    rgba(7, 13, 22, 0.96),\n    rgba(16, 30, 48, 0.92)\n  );\n}\n\n.currency-mini-hub {\n  display: block;\n  border-radius: 24px;\n  padding: 10px;\n  min-height: 0;\n  overflow: auto;\n  position: relative;\n  background:\n    linear-gradient(135deg, rgba(118, 212, 255, 0.08), rgba(255, 154, 255, 0.06)),\n    var(--bg-panel);\n}\n\n.currency-bar {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(44px, max-content));\n  justify-content: end;\n  align-items: center;\n  gap: 6px;\n}\n\n.currency-mini-item {\n  --currency-icon: none;\n  min-width: 44px;\n  min-height: 34px;\n  position: relative;\n  isolation: isolate;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 6px 8px;\n  border-radius: 12px;\n  border: 0;\n  background: rgba(16, 28, 42, 0.42);\n  cursor: pointer;\n  overflow: hidden;\n  transition:\n    transform 0.16s ease,\n    background-color 0.16s ease;\n}\n\n.currency-mini-item::before {\n  content: \"\";\n  position: absolute;\n  inset: 5px;\n  z-index: -1;\n  background-image: var(--currency-icon);\n  background-position: center;\n  background-repeat: no-repeat;\n  background-size: contain;\n  opacity: 0.14;\n  filter: drop-shadow(0 0 12px rgba(118, 212, 255, 0.24));\n}\n\n.currency-mini-item:hover,\n.currency-mini-item:focus-visible {\n  transform: translateY(-3px);\n  background-color: rgba(118, 212, 255, 0.18);\n}\n\n.currency-mini-item:focus-visible {\n  box-shadow: var(--focus-ring);\n}\n\n.currency-mini-item__value {\n  font-weight: 700;\n  color: var(--text-main);\n  font-variant-numeric: tabular-nums;\n  letter-spacing: 0.03em;\n}\n\n.currency-mini-tooltip {\n  position: absolute;\n  z-index: 20;\n  min-width: 148px;\n  display: grid;\n  gap: 4px;\n  padding: 10px 12px;\n  border-radius: 14px;\n  border: 1px solid rgba(118, 212, 255, 0.45);\n  background: rgba(8, 14, 22, 0.96);\n  box-shadow: var(--gacha-shadow-popover);\n  pointer-events: auto;\n}\n\n.currency-mini-tooltip strong {\n  font-size: 12px;\n  color: var(--text-muted);\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n}\n\n.currency-mini-tooltip span {\n  font-weight: 700;\n  color: var(--text-main);\n  font-variant-numeric: tabular-nums;\n}\n\n.rules-button,\n.history-button {\n  width: 42px;\n  height: 42px;\n  min-width: 40px;\n  min-height: 40px;\n  padding: 0;\n  border-radius: 50%;\n  border: 1px solid rgba(118, 212, 255, 0.5);\n  background: rgba(10, 16, 24, 0.86);\n  cursor: pointer;\n  font-size: 20px;\n  font-weight: 700;\n  white-space: nowrap;\n}\n\n.banner-entry {\n  width: 100%;\n  text-align: left;\n  padding: 14px 12px;\n  border-radius: 18px;\n  border: 1px solid transparent;\n  background: rgba(16, 26, 40, 0.88);\n  cursor: pointer;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  transition:\n    transform 0.18s ease,\n    border-color 0.18s ease;\n}\n\n.banner-entry__title {\n  font-weight: 600;\n}\n\n.banner-entry__timer {\n  font-size: 12px;\n  color: var(--text-muted);\n}\n\n.banner-entry:hover,\n.banner-entry:focus-visible {\n  transform: translateX(6px);\n  border-color: rgba(118, 212, 255, 0.6);\n}\n\n.banner-entry:focus-visible {\n  box-shadow: var(--focus-ring);\n}\n\n.banner-entry.is-active {\n  border-color: rgba(255, 154, 255, 0.65);\n  background: linear-gradient(\n    135deg,\n    rgba(118, 212, 255, 0.22),\n    rgba(255, 154, 255, 0.16)\n  );\n}\n\n.banner-title {\n  margin: 0;\n  font-size: clamp(20px, 3vw, 30px);\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n}\n\n.banner-desc {\n  margin: 6px 0 0;\n  color: var(--text-muted);\n}\n\n.banner-timer {\n  font-size: 13px;\n  color: var(--primary);\n  white-space: nowrap;\n}\n\n.banner-panel__art {\n  position: relative;\n  isolation: isolate;\n  height: 100%;\n  min-height: 0;\n  border-radius: 18px;\n  overflow: hidden;\n  display: flex;\n  align-items: flex-end;\n  padding: clamp(18px, 3vw, 28px);\n  background: linear-gradient(135deg, #07101d 0%, #14243a 54%, #24172e 100%);\n}\n\n.banner-panel__art::before {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  z-index: -1;\n  background:\n    linear-gradient(\n      90deg,\n      rgba(4, 8, 14, 0.88),\n      rgba(4, 8, 14, 0.48) 54%,\n      rgba(4, 8, 14, 0.76)\n    ),\n    linear-gradient(0deg, rgba(4, 8, 14, 0.82), rgba(4, 8, 14, 0.08) 58%);\n}\n\n.banner-panel__art--gradient::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  z-index: -2;\n  background:\n    radial-gradient(\n      circle at 72% 24%,\n      rgba(118, 212, 255, 0.22),\n      transparent 34%\n    ),\n    radial-gradient(\n      circle at 82% 78%,\n      rgba(255, 154, 255, 0.14),\n      transparent 38%\n    );\n}\n\n.banner-panel__image {\n  position: absolute;\n  inset: 0;\n  z-index: -2;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  filter: saturate(108%) brightness(0.9);\n}\n\n.banner-panel__copy {\n  display: grid;\n  gap: 10px;\n  width: min(560px, 100%);\n  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.48);\n}\n\n.banner-panel__eyebrow {\n  width: fit-content;\n  padding: 5px 9px;\n  border-radius: 999px;\n  background: rgba(10, 16, 24, 0.64);\n  border: 1px solid rgba(233, 242, 255, 0.18);\n  color: var(--primary);\n  font-size: 11px;\n  font-weight: 800;\n  letter-spacing: 0.12em;\n  text-transform: uppercase;\n}\n\n.banner-panel__label {\n  margin: 0;\n  font-size: clamp(24px, 5vw, 46px);\n  line-height: 0.98;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n}\n\n.banner-panel__description {\n  max-width: 48rem;\n  margin: 0;\n  color: rgba(233, 242, 255, 0.86);\n  font-size: clamp(14px, 1.7vw, 17px);\n  line-height: 1.45;\n}\n\n.banner-panel__featured-list {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  margin: 2px 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.banner-panel__featured-list li {\n  padding: 6px 10px;\n  border-radius: 999px;\n  background: rgba(10, 16, 24, 0.58);\n  border: 1px solid rgba(233, 242, 255, 0.14);\n  color: rgba(233, 242, 255, 0.9);\n  font-size: 12px;\n  font-weight: 700;\n}\n\n.rate-list {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 8px 16px;\n  margin: 0;\n}\n\n.rate-list dt {\n  font-weight: 600;\n}\n\n.rate-list dd {\n  margin: 0;\n  color: var(--text-muted);\n}\n\n.banner-panel__featured,\n.banner-panel__pity,\n.banner-panel__actions {\n  border-radius: 22px;\n  padding: 14px;\n}\n\n.banner-panel__featured {\n  min-width: 0;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 10px;\n  background: rgba(12, 18, 28, 0.64);\n  box-shadow: none;\n}\n\n.banner-panel__pity {\n  min-width: 0;\n  padding: 8px 10px;\n}\n\n.pity-chip-row {\n  display: flex;\n  gap: 8px;\n  overflow-x: auto;\n  overscroll-behavior-x: contain;\n  padding-bottom: 2px;\n}\n\n.pity-chip {\n  flex: 0 0 auto;\n  display: grid;\n  grid-template-columns: minmax(48px, max-content) auto;\n  align-items: center;\n  gap: 5px 8px;\n  max-width: min(140px, 48vw);\n  padding: 7px 9px;\n  border-radius: 14px;\n  background: rgba(20, 32, 48, 0.86);\n  border: 1px solid rgba(118, 212, 255, 0.18);\n}\n\n.pity-chip__label {\n  min-width: 0;\n  font-size: 12px;\n  text-transform: uppercase;\n  color: var(--text-muted);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.pity-chip__value {\n  font-size: 13px;\n  font-weight: 700;\n  font-variant-numeric: tabular-nums;\n}\n\n.pity-chip__bar {\n  grid-column: 1 / -1;\n  position: relative;\n  height: 3px;\n  border-radius: 999px;\n  background: rgba(118, 212, 255, 0.15);\n  overflow: hidden;\n}\n\n.pity-chip__progress {\n  position: absolute;\n  inset: 0;\n  border-radius: 999px;\n  background: var(--highlight);\n}\n\n.featured__heading {\n  flex: 0 0 auto;\n  margin: 0;\n  font-size: 14px;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  white-space: nowrap;\n}\n\n.featured-chip-row {\n  flex: 1 1 auto;\n  display: flex;\n  flex-wrap: nowrap;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n  overflow-x: auto;\n  overscroll-behavior-x: contain;\n  padding-bottom: 2px;\n}\n\n.featured-card {\n  flex: 0 0 auto;\n  display: inline-flex;\n  gap: 6px;\n  align-items: center;\n  max-width: min(220px, 72vw);\n  padding: 5px 9px;\n  border-radius: 999px;\n  background: rgba(20, 32, 48, 0.52);\n  border: 1px solid rgba(118, 212, 255, 0.1);\n  font-weight: 600;\n}\n\n.featured-card__rarity {\n  flex: 0 0 auto;\n  font-size: 11px;\n  line-height: 1;\n  padding: 3px 6px;\n  border-radius: 999px;\n  background: rgba(118, 212, 255, 0.16);\n}\n\n.featured-card__name {\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-size: 13px;\n}\n\n.banner-panel__actions,\n.gacha-actions {\n  display: flex;\n  flex-direction: row;\n  flex-wrap: nowrap;\n  gap: 10px;\n}\n\n.banner-panel__actions {\n  padding: 0;\n  border-color: transparent;\n  background: transparent;\n  box-shadow: none;\n}\n\n.summon-button {\n  min-height: 44px;\n  padding: 7px 12px;\n  border-radius: 18px;\n  border: 1px solid rgba(118, 212, 255, 0.34);\n  background: rgba(16, 28, 42, 0.78);\n  cursor: pointer;\n  display: inline-flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 3px;\n  transition:\n    transform 0.16s ease,\n    border-color 0.16s ease,\n    filter 0.16s ease,\n    opacity 0.16s ease;\n}\n\n.summon-button--x1 {\n  flex: 0 1 42%;\n  background: rgba(16, 28, 42, 0.72);\n}\n\n.summon-button--x10 {\n  flex: 0 1 58%;\n  border-color: rgba(255, 154, 255, 0.64);\n  background: linear-gradient(\n    135deg,\n    rgba(118, 212, 255, 0.3),\n    rgba(255, 154, 255, 0.28)\n  );\n  box-shadow: 0 10px 28px rgba(255, 154, 255, 0.12);\n}\n\n.summon-button__title {\n  font-weight: 800;\n  font-size: 13px;\n  line-height: 1.15;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n}\n\n.summon-button__cost {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  font-size: 11px;\n  line-height: 1.1;\n  color: var(--text-muted);\n  font-weight: 600;\n  letter-spacing: 0.04em;\n}\n\n.summon-button__cost img {\n  width: 14px;\n  height: 14px;\n}\n\n.summon-button:hover:not(:disabled),\n.summon-button:focus-visible:not(:disabled) {\n  transform: translateY(-2px);\n  border-color: rgba(255, 154, 255, 0.72);\n  filter: brightness(1.08);\n}\n\n.summon-button:focus-visible:not(:disabled) {\n  box-shadow: var(--focus-ring);\n}\n\n.summon-button:disabled,\n.summon-button[aria-disabled=\"true\"] {\n  cursor: not-allowed;\n  opacity: 0.52;\n  filter: grayscale(0.28);\n}\n\n.gacha-backdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 1900;\n  background: rgba(5, 10, 18, 0.42);\n  opacity: 0;\n  pointer-events: none;\n  transition: opacity 0.18s ease;\n}\n\n.gacha-backdrop.is-open {\n  opacity: 1;\n  pointer-events: auto;\n}\n\n.gacha-drawer {\n  position: fixed;\n  top: 0;\n  right: 0;\n  z-index: 2000;\n  width: clamp(360px, 35vw, 560px);\n  max-width: 92vw;\n  height: 100vh;\n  height: 100dvh;\n  padding: max(18px, env(safe-area-inset-top))\n    max(18px, env(safe-area-inset-right)) max(18px, env(safe-area-inset-bottom))\n    18px;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  background: var(--gacha-surface-strong);\n  border-left: 1px solid rgba(118, 212, 255, 0.32);\n  box-shadow: -24px 0 64px rgba(5, 12, 20, 0.55);\n  transform: translateX(100%);\n  transition: transform 0.18s ease;\n}\n\n.gacha-drawer.is-open {\n  transform: translateX(0);\n}\n\n.gacha-drawer__tabs {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n\n.gacha-drawer__tabs button {\n  min-height: 40px;\n  padding: 10px 8px;\n  border-radius: 14px;\n  border: 1px solid rgba(118, 212, 255, 0.26);\n  background: rgba(16, 28, 42, 0.82);\n  cursor: pointer;\n}\n\n.gacha-drawer__tabs button.is-active,\n.gacha-drawer__tabs button:focus-visible {\n  border-color: rgba(255, 154, 255, 0.68);\n  background: linear-gradient(\n    135deg,\n    rgba(118, 212, 255, 0.22),\n    rgba(255, 154, 255, 0.16)\n  );\n}\n\n.gacha-drawer__tabs button:focus-visible {\n  box-shadow: var(--focus-ring);\n}\n\n.gacha-drawer.is-history .gacha-drawer__tabs {\n  display: none;\n}\n\n.gacha-drawer__panel {\n  min-height: 0;\n  overflow-y: auto;\n}\n\n.gacha-drawer.is-history .gacha-drawer__panel {\n  display: grid;\n  min-height: 0;\n}\n\n.gacha-drawer__content {\n  display: grid;\n  gap: 12px;\n  color: var(--text-main);\n}\n\n.gacha-drawer__content h2 {\n  margin: 0;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n}\n\n.gacha-drawer__content p {\n  margin: 0;\n  color: var(--text-muted);\n}\n\n.gacha-drawer__content ul,\n.pity-info-notes {\n  margin: 0;\n  padding-left: 20px;\n  color: var(--text-muted);\n}\n\n.history-list {\n  min-height: 0;\n  max-height: min(62vh, 560px);\n  overflow-y: auto;\n  overscroll-behavior: contain;\n  display: grid;\n  gap: 8px;\n  padding-right: 4px;\n}\n\n.history-entry {\n  display: grid;\n  grid-template-columns: auto minmax(0, 1fr) auto;\n  grid-template-areas:\n    \"time banner rarity\"\n    \"name name pity\";\n  gap: 4px 10px;\n  align-items: center;\n  padding: 10px 12px;\n  border-radius: 14px;\n  background: rgba(16, 28, 42, 0.82);\n  border: 1px solid rgba(118, 212, 255, 0.18);\n}\n\n.history-entry__time {\n  grid-area: time;\n  color: var(--primary);\n  font-size: 12px;\n  font-variant-numeric: tabular-nums;\n}\n\n.history-entry__banner {\n  grid-area: banner;\n  min-width: 0;\n  color: var(--text-muted);\n  font-size: 12px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.history-entry__rarity {\n  grid-area: rarity;\n  justify-self: end;\n  font-weight: 800;\n  font-size: 12px;\n  text-transform: uppercase;\n  letter-spacing: 0.06em;\n}\n\n.history-entry__name {\n  grid-area: name;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.history-entry__pity {\n  grid-area: pity;\n  justify-self: end;\n  color: var(--primary);\n  font-size: 12px;\n}\n\n.pity-info-list {\n  display: grid;\n  grid-template-columns: minmax(90px, 0.45fr) 1fr;\n  gap: 10px 16px;\n  margin: 0;\n  padding: 14px;\n  border-radius: 16px;\n  background: rgba(16, 28, 42, 0.82);\n  border: 1px solid rgba(118, 212, 255, 0.18);\n}\n\n.pity-info-list dt {\n  color: var(--text-muted);\n}\n\n.pity-info-list dd {\n  margin: 0;\n  font-weight: 700;\n  font-variant-numeric: tabular-nums;\n}\n\n.gacha-toast {\n  position: fixed;\n  right: max(24px, env(safe-area-inset-right));\n  bottom: max(24px, env(safe-area-inset-bottom));\n  background: rgba(16, 28, 42, 0.92);\n  border-radius: 16px;\n  padding: 12px 18px;\n  border: 1px solid rgba(118, 212, 255, 0.35);\n  opacity: 0;\n  transform: translateY(12px);\n  transition:\n    opacity 0.2s ease,\n    transform 0.2s ease;\n  pointer-events: none;\n}\n\n.gacha-toast.is-visible {\n  opacity: 1;\n  transform: translateY(0);\n}\n\n.gacha-confirm-modal {\n  position: fixed;\n  inset: 0;\n  z-index: 2400;\n  display: grid;\n  place-items: center;\n  padding: 18px;\n}\n\n.gacha-confirm-modal__backdrop {\n  position: absolute;\n  inset: 0;\n  background: rgba(5, 10, 18, 0.58);\n}\n\n.gacha-confirm-modal__dialog {\n  position: relative;\n  width: min(360px, 100%);\n  display: grid;\n  gap: 16px;\n  padding: 20px;\n  border-radius: 20px;\n  border: 1px solid rgba(118, 212, 255, 0.34);\n  background: var(--gacha-surface-strong);\n  box-shadow: 0 24px 70px rgba(5, 12, 20, 0.62);\n}\n\n.gacha-confirm-modal__title {\n  margin: 0;\n  font-size: 18px;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n}\n\n.gacha-confirm-modal__summary {\n  display: grid;\n  gap: 10px;\n  margin: 0;\n}\n\n.gacha-confirm-modal__summary div {\n  display: flex;\n  justify-content: space-between;\n  gap: 14px;\n  padding: 10px 12px;\n  border-radius: 14px;\n  background: rgba(16, 28, 42, 0.82);\n  border: 1px solid rgba(118, 212, 255, 0.16);\n}\n\n.gacha-confirm-modal__summary dt {\n  color: var(--text-muted);\n}\n\n.gacha-confirm-modal__summary dd {\n  margin: 0;\n  font-weight: 800;\n  text-align: right;\n}\n\n.gacha-confirm-modal__actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 10px;\n}\n\n.gacha-confirm-modal__button {\n  border: 1px solid rgba(118, 212, 255, 0.28);\n  border-radius: 12px;\n  padding: 10px 14px;\n  background: rgba(16, 28, 42, 0.84);\n  color: var(--text-main);\n  cursor: pointer;\n}\n\n.gacha-confirm-modal__button--primary {\n  border-color: rgba(255, 154, 255, 0.64);\n  background: linear-gradient(\n    135deg,\n    rgba(118, 212, 255, 0.28),\n    rgba(255, 154, 255, 0.28)\n  );\n}\n\n.gacha-confirm-modal__button:hover,\n.gacha-confirm-modal__button:focus-visible {\n  border-color: rgba(255, 154, 255, 0.72);\n}\n\n.gacha-confirm-modal__button:focus-visible {\n  box-shadow: var(--focus-ring);\n}\n\n@media (min-width: 960px) {\n  .currency-mini-hub .currency-bar {\n    grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));\n    justify-content: stretch;\n  }\n}\n\n@media (min-width: 760px) and (max-width: 959px) {\n  .gacha-body {\n    grid-template-columns: var(--gacha-rail-width) minmax(0, 1fr);\n    grid-template-areas: \"rail main\";\n  }\n\n  .gacha-main {\n    grid-template-columns: minmax(0, 1fr) minmax(220px, 0.42fr);\n    grid-template-rows: auto minmax(0, 1fr) auto auto;\n    grid-template-areas:\n      \"topbar topbar\"\n      \"panel panel\"\n      \"featured pity\"\n      \"actions actions\";\n  }\n\n  .gacha-topbar {\n    grid-area: topbar;\n  }\n  .banner-panel {\n    grid-area: panel;\n  }\n  .banner-panel__featured {\n    grid-area: featured;\n  }\n  .banner-panel__pity {\n    grid-area: pity;\n  }\n  .banner-panel__actions {\n    grid-area: actions;\n  }\n\n}\n\n@media (orientation: portrait) and (max-width: 759px), (max-width: 560px) {\n  .gacha-ui-root,\n  .gacha-screen {\n    padding: max(12px, env(safe-area-inset-top))\n      max(12px, env(safe-area-inset-right))\n      max(12px, env(safe-area-inset-bottom))\n      max(12px, env(safe-area-inset-left));\n  }\n\n  .gacha-body {\n    grid-template-columns: 1fr;\n    grid-template-rows: auto minmax(0, 1fr);\n    grid-template-areas:\n      \"rail\"\n      \"main\";\n    gap: 12px;\n  }\n\n  .banner-sidebar {\n    flex-direction: row;\n    overflow-x: auto;\n    overflow-y: hidden;\n    padding: 10px;\n  }\n\n  .currency-mini-hub {\n    overflow-x: auto;\n    overflow-y: hidden;\n    padding: 10px;\n  }\n\n  .currency-mini-hub .currency-bar {\n    grid-auto-flow: column;\n    grid-auto-columns: max-content;\n    grid-template-columns: none;\n    justify-content: flex-start;\n  }\n\n  .banner-entry {\n    min-width: 176px;\n  }\n\n  .gacha-topbar {\n    grid-template-columns: minmax(0, 1fr) auto minmax(140px, auto) auto auto;\n  }\n\n  .banner-timer {\n    grid-column: 1 / -1;\n  }\n\n  .banner-panel {\n    grid-template-columns: 1fr;\n    height: auto;\n    min-height: 0;\n  }\n\n  .banner-panel__art {\n    padding: 16px;\n  }\n\n  .banner-panel__actions {\n    flex-direction: row;\n  }\n\n  .pity-chip {\n    max-width: min(128px, 72vw);\n  }\n}\n\n@media (orientation: landscape) and (max-height: 500px) {\n  .gacha-ui-root,\n  .gacha-screen {\n    padding-top: max(8px, env(safe-area-inset-top));\n    padding-bottom: max(8px, env(safe-area-inset-bottom));\n  }\n\n  .gacha-body,\n  .gacha-main {\n    gap: 10px;\n  }\n\n  .gacha-body {\n    grid-template-columns: var(--gacha-rail-width) minmax(0, 1fr);\n    grid-template-areas: \"rail main\";\n  }\n\n  .banner-sidebar {\n    flex-direction: column;\n    overflow-x: hidden;\n    overflow-y: auto;\n  }\n\n  .gacha-topbar {\n    grid-template-columns: minmax(0, 1fr) minmax(120px, auto) auto auto auto;\n  }\n\n  .currency-mini-hub {\n    max-width: min(34vw, 220px);\n    overflow-x: auto;\n    overflow-y: hidden;\n  }\n\n  .currency-mini-hub .currency-bar {\n    grid-auto-flow: column;\n    grid-auto-columns: max-content;\n    grid-template-columns: none;\n    justify-content: flex-start;\n  }\n\n  .gacha-topbar,\n  .banner-panel,\n  .banner-panel__featured,\n  .banner-panel__pity,\n  .banner-panel__actions,\n  .currency-mini-hub,\n  .banner-sidebar {\n    border-radius: 16px;\n    padding: 10px;\n  }\n\n  .gacha-topbar {\n    gap: 8px;\n    padding: 8px 10px;\n  }\n\n  .banner-panel {\n    min-height: 0;\n    padding: 0;\n  }\n\n  .banner-panel__art {\n    padding: 12px;\n  }\n\n  .banner-panel__copy {\n    gap: 6px;\n  }\n\n  .banner-title {\n    font-size: clamp(18px, 5vh, 24px);\n    line-height: 1.05;\n  }\n\n  .banner-timer {\n    font-size: 12px;\n  }\n\n  .banner-desc,\n  .banner-panel__description {\n    display: none;\n  }\n\n  .banner-panel__label {\n    font-size: clamp(22px, 8vh, 34px);\n  }\n\n  .banner-panel__featured-list {\n    gap: 6px;\n  }\n\n  .banner-panel__featured-list li {\n    padding: 4px 8px;\n  }\n\n  .banner-panel__actions {\n    padding: 0;\n  }\n\n  .summon-button {\n    min-height: 38px;\n    padding: 5px 10px;\n  }\n\n  .summon-button__title {\n    font-size: 12px;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  *,\n  *::before,\n  *::after {\n    animation-duration: 1ms !important;\n    animation-iteration-count: 1 !important;\n    scroll-behavior: auto !important;\n    transition-duration: 1ms !important;\n  }\n\n  .banner-entry:hover,\n  .banner-entry:focus-visible,\n  .currency-mini-item:hover,\n  .currency-mini-item:focus-visible,\n  .summon-button:hover:not(:disabled),\n  .summon-button:focus-visible:not(:disabled),\n  .gacha-toast.is-visible,\n  .gacha-drawer.is-open {\n    transform: none;\n  }\n}";
  module.exports = css;
  module.exports.default = css;
};
__modules['./screens/ui-gacha/gacha.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/ui-gacha/gacha.ts
  const __dep0 = __require('./screens/ui-gacha/logic/config.ts');
  const CURRENCY_LABELS = __dep0.CURRENCY_LABELS;
  const createWallet = __dep0.createWallet;
  const GACHA_CONFIG = __dep0.GACHA_CONFIG;
  const __dep1 = __require('./utils/currency.ts');
  const createNormalizedWallet = __dep1.createNormalizedWallet;
  const getSharedCurrencyWallet = __dep1.getSharedCurrencyWallet;
  const subscribeSharedCurrencyWallet = __dep1.subscribeSharedCurrencyWallet;
  const syncSharedCurrencyWallet = __dep1.syncSharedCurrencyWallet;
  const __dep2 = __require('./utils/player-profile.ts');
  const loadPlayerProfile = __dep2.loadPlayerProfile;
  const patchPlayerProfile = __dep2.patchPlayerProfile;
  const __dep3 = __require('./utils/unit-id.ts');
  const normalizeUnitId = __dep3.normalizeUnitId;
  const __dep4 = __require('./screens/ui-gacha/logic/currency.ts');
  const payForRoll = __dep4.payForRoll;
  const __dep5 = __require('./screens/ui-gacha/logic/gacha.ts');
  const getBannerById = __dep5.getBannerById;
  const getSummonableFeaturedUnits = __dep5.getSummonableFeaturedUnits;
  const multiRoll = __dep5.multiRoll;
  const rollBanner = __dep5.rollBanner;
  const __dep6 = __require('./screens/ui-gacha/logic/pity.ts');
  const getBannerState = __dep6.getBannerState;
  const __dep7 = __require('./screens/ui-gacha/logic/types.ts');
  const CURRENCY_ORDER = __dep7.CURRENCY_ORDER;

  const NUMBER_FORMAT = new Intl.NumberFormat('vi-VN');
  const COMPACT_NUMBER_FORMAT = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits);
  const TIME_FORMAT = new Intl.RelativeTimeFormat('vi', { style: 'short', numeric);
  const HISTORY_TIME_FORMAT = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute);

  const CURRENCY_ICONS= {
    VNT: 'assets/dust.svg',
    HNT,
    TNT,
    ThNT,
    TT,
  };
};
__modules['./screens/ui-gacha/index.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/ui-gacha/index.ts
  const __dep0 = __require('./screens/ui-gacha/gacha.css');
  const gachaStyles = __dep0.default ?? __dep0;
  const __dep1 = __require('./ui/dom.ts');
  const ensureStyleTag = __dep1.ensureStyleTag;

  const __require;
};
__modules['./screens/ui-gacha/logic/config.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/ui-gacha/logic/config.ts
  const __dep0 = __require('./screens/ui-gacha/logic/types.ts');
  const CURRENCY_ORDER = __dep0.CURRENCY_ORDER;

  const DEFAULT_WALLET= {
    VNT: 125_000,
    HNT,
    TNT,
    ThNT,
    TT,
  };

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const BANNER_COSTS = {
    Permanent: { unit: 'HNT', x1, x10,
    LimitedUR, x1, x10,
    LimitedPrime, x1, x10,
  } /* satisfies Record<BannerDefinition['type'] */, BannerCostConfig>;

  const BANNERS= [
    {
      id: 'permanent',
      label,
      type,
      description,
      cost,
      rates, R, SR, SSR,
      pity,
        ssr, softStep, hard, hardGuaranteeFeatured, carryOver,
      },
      featured, name, rarity, portrait,
        { id: 'mo_da', name, rarity, portrait,
      ],
      background,
    },
    {
      id: 'limited-ur',
      label,
      type,
      description, pity hard bảo đảm UR featured.',
      cost,
      rates, R, SR, SSR, UR, Prime,
      pity,
        ur, softStep, hard, hardGuaranteeFeatured,
        ssr, softStep, hard, hardGuaranteeFeatured,
      },
      featured, name, rarity, portrait,
      ],
      expiresAt,
      background,
    },
    {
      id: 'limited-prime',
      label,
      type,
      description, pity bảo đảm Prime featured.',
      cost,
      rates, R, SR, SSR, UR, Prime,
      pity,
        prime, softStep, hard, hardGuaranteeFeatured,
        ur, softStep, hard, hardGuaranteeFeatured,
      },
      featured, name, rarity, portrait,
        { id: 'chan_nga', name, rarity, portrait,
      ],
      expiresAt,
      background,
    },
  ];

  const GACHA_CONFIG= {
    currencies: ['VNT', 'HNT', 'TNT', 'ThNT', 'TT'],
    costs,
    rateUpShare,
    banners,
  };

  const CURRENCY_LABELS= {
    VNT: 'Vụn Nguyên Tinh',
    HNT,
    TNT,
    ThNT,
    TT,
  };

  function createWallet(initial?){
    const wallet= {};
    const useDefaults = typeof initial === 'undefined';
    for (const code of CURRENCY_ORDER){
      const fallback = useDefaults ? (DEFAULT_WALLET[code] ?? 0) ;
      wallet[code] = Math.max(0, Math.trunc((initial?.[code] ?? fallback) ?? 0));
    }
    return wallet /* as Wallet */;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'DEFAULT_WALLET')) exports.DEFAULT_WALLET = DEFAULT_WALLET;
  if (!Object.prototype.hasOwnProperty.call(exports, 'GACHA_CONFIG')) exports.GACHA_CONFIG = GACHA_CONFIG;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CURRENCY_LABELS')) exports.CURRENCY_LABELS = CURRENCY_LABELS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createWallet')) exports.createWallet = createWallet;
};
__modules['./screens/ui-gacha/logic/currency.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/ui-gacha/logic/currency.ts
  const __dep0 = __require('./screens/ui-gacha/logic/types.ts');
  const CURRENCY_ORDER = __dep0.CURRENCY_ORDER;
  const __dep1 = __require('./utils/currency.ts');
  const convertCurrencyAmount = __dep1.convertCurrencyAmount;

  const BASE_TAX= {
    'VNT->HNT': 0.005,
    'HNT->TNT': 0.01,
    'TNT->ThNT': 0.015,
  };

  const TAX_CAP = 0.1;
  const WEALTH_PIVOT_TT = 100;
  const ALPHA = 2;

  function cloneWallet(wallet){
    const normalized= {};
    for (const code of CURRENCY_ORDER){
      normalized[code] = Math.max(0, Math.trunc(wallet[code] ?? 0));
    }
    return normalized /* as Wallet */;
  }

  function getIndex(code){
    const idx = CURRENCY_ORDER.indexOf(code);
    return idx === -1 ? 0 : idx;
  }

  function isHigherTier(from, to){
    return getIndex(from) > getIndex(to);
  }

  function isLowerTier(from, to){
    return getIndex(from) < getIndex(to);
  }

  function totalTTEquivalent(wallet){
    const normalized = cloneWallet(wallet);
    const highestCurrency = (CURRENCY_ORDER[CURRENCY_ORDER.length - 1] ?? 'TT') /* as CurrencyId */;
    let total = 0;
    for (const code of CURRENCY_ORDER){
      const amount = normalized[code] ?? 0;
      total += convertCurrencyAmount(amount, code /* as CurrencyId */, highestCurrency);
    }
    return total;
  }

  function dynamicTaxRate(stepKey, wallet){
    const base = BASE_TAX[stepKey] ?? 0.01;
    const wealthIdx = Math.min(1, totalTTEquivalent(wallet) / WEALTH_PIVOT_TT);
    const candidate = base * (1 + ALPHA * wealthIdx);
    return Math.min(TAX_CAP, candidate);
  }

  function findStepKey(from, to){
    if (isLowerTier(from, to)) {
      const higher = `${from}->${to}` /* as CurrencyConversionStep */;
      return higher;
    }
    if (isHigherTier(from, to)) {
      const lower = `${to}->${from}` /* as CurrencyConversionStep */;
      return lower;
    }
    return null;
  }

  function convertUp(
    wallet,
    from,
    to,
    amount,
  ){ wallet: Wallet; units: number; tax: number; spent: number } {
    const step= findStepKey(from, to);
    if (!step) {
      return { wallet: cloneWallet(wallet), units, tax, spent=== 'TT') {
      return { wallet: cloneWallet(wallet), units, tax, spent= cloneWallet(wallet);
    const available = Math.max(0, Math.trunc(amount));
    const unitCost = convertCurrencyAmount(1, to /* as CurrencyId */, from /* as CurrencyId */);
    if (!Number.isFinite(unitCost) || unitCost <= 0) {
      return { wallet: normalized, units, tax, spent) {
      return { wallet: normalized, units, tax, spent= dynamicTaxRate(step, normalized);
    const tax = Math.ceil(available * rate);
    const usable = available - tax;
    if (usable < unitCost) {
      return { wallet: normalized, units, tax, spent, tax) };
    }
    const units = Math.floor(usable / unitCost);
    if (!units) {
      return { wallet: normalized, units, tax, spent, tax) };
    }
    const spentWithoutTax = convertCurrencyAmount(units, to /* as CurrencyId */, from /* as CurrencyId */);
    const spent = Math.min(available, Math.trunc(spentWithoutTax + tax));

    normalized[from] = Math.max(0, normalized[from] - spent);
    normalized[to] = Math.max(0, normalized[to] + units);
    return { wallet: normalized, units, tax, spent };
  }

  function convertDown(
    wallet,
    from,
    to,
    units,
  ){ wallet: Wallet; amount: number } {
    const normalized = cloneWallet(wallet);
    if (units <= 0) {
      return { wallet: normalized, amount= convertCurrencyAmount(units, from /* as CurrencyId */, to /* as CurrencyId */);
    normalized[from] = Math.max(0, normalized[from] - units);
    normalized[to] = Math.max(0, normalized[to] + amount);
    return { wallet: normalized, amount };
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'totalTTEquivalent')) exports.totalTTEquivalent = totalTTEquivalent;
};
__modules['./screens/ui-gacha/logic/gacha.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/ui-gacha/logic/gacha.ts
  const __dep0 = __require('./screens/ui-gacha/logic/config.ts');
  const GACHA_CONFIG = __dep0.GACHA_CONFIG;
  const __dep1 = __require('./screens/ui-gacha/logic/pity.ts');
  const applyRoll = __dep1.applyRoll;
  const getBannerState = __dep1.getBannerState;
  const __dep2 = __require('./screens/ui-gacha/logic/types.ts');
  const __dep3 = __require('./screens/ui-gacha/logic/pool.ts');
  const getBannerPoolByRarity = __dep3.getBannerPoolByRarity;
  const isGachaSummonableCatalogUnit = __dep3.isGachaSummonableCatalogUnit;

  const DEFAULT_RANDOM= () => Math.random();

  function pickUnitFromPool(pool, rng){
    if (pool.length === 0) {
      return null;
    }
    const normalized = Math.max(0, Math.min(0.999999, rng()));
    return pool[Math.floor(normalized * pool.length)] ?? null;
  }

  function resolveRollUnit(
    banner,
    result,
    rng,
  ){
    const rarity = result.outcome.rarity;
    const featuredPool = result.outcome.featured ? getSummonableFeaturedByRarity(banner, rarity) ;
    const pool = featuredPool.length > 0 ? featuredPool : getBannerPoolByRarity(banner, rarity);
    const unit = pickUnitFromPool(pool, rng);
    if (!unit && typeof console !== 'undefined' && typeof console.warn === 'function') {
      console.warn(`[gacha] Empty unit pool for ${banner.id}/${rarity}; roll will not unlock a unit.`);
    }
    return { ...result, unit };
  }

  const FEATURED_SUMMONABLE_CACHE = new WeakMap();
  const FEATURED_BY_RARITY_CACHE = new WeakMap<BannerDefinition, Map<Rarity, FeaturedUnit[]>>();
  let bannerLookupSource= null;
  let bannerLookupById = new Map();

  function getBannerLookup(){
    const currentSource = GACHA_CONFIG.banners;
    if (bannerLookupSource === currentSource) {
      return bannerLookupById;
    }
    bannerLookupSource = currentSource;
    bannerLookupById = new Map(currentSource.map((entry) => [entry.id, entry] /* /* as const */ */));
    return bannerLookupById;
  }

  function isGachaSummonableFeaturedUnit(entry){
    return isGachaSummonableCatalogUnit(entry);
  }

  function getSummonableFeaturedUnits(banner){
    const cached = FEATURED_SUMMONABLE_CACHE.get(banner);
    if (cached) {
      return cached;
    }
    const filtered = banner.featured.filter(isGachaSummonableFeaturedUnit);
    FEATURED_SUMMONABLE_CACHE.set(banner, filtered);
    return filtered;
  }

  function getSummonableFeaturedByRarity(banner, rarity){
    let rarityMap = FEATURED_BY_RARITY_CACHE.get(banner);
    if (!rarityMap) {
      rarityMap = new Map();
      FEATURED_BY_RARITY_CACHE.set(banner, rarityMap);
    }
    const cached = rarityMap.get(rarity);
    if (cached) {
      return cached;
    }
    const matched = getSummonableFeaturedUnits(banner).filter((entry) => entry.rarity === rarity);
    rarityMap.set(rarity, matched);
    return matched;
  }

  function shouldHitFeatured(
    banner,
    rarity,
    forced,
    rng,
  ){
    if (forced) {
      return true;
    }
    const featured = getSummonableFeaturedByRarity(banner, rarity);
    if (featured.length === 0) {
      return false;
    }
    const share = GACHA_CONFIG.rateUpShare;
    const roll = rng();
    return roll < share;
  }

  function rollBanner(
    banner,
    stateMap,
    options= {},
  ){
    const rng = options.rng ?? DEFAULT_RANDOM;
    const featuredRng = options.featuredRng ?? DEFAULT_RANDOM;
    const unitRng = options.unitRng ?? featuredRng;
    const state = getBannerState(stateMap, banner);
    const result = applyRoll(banner, state, rng, (rarity, forced) => shouldHitFeatured(banner, rarity, forced, featuredRng));
    return resolveRollUnit(banner, result, unitRng);
  }

  function multiRoll(
    banner,
    stateMap,
    count,
    options= {},
  ){
    const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) ;
    if (total === 0) {
      return [];
    }

    const rng = options.rng ?? DEFAULT_RANDOM;
    const featuredRng = options.featuredRng ?? DEFAULT_RANDOM;
    const unitRng = options.unitRng ?? featuredRng;
    const state = getBannerState(stateMap, banner);
    const chooseFeatured = (rarity, forced)=> (
      shouldHitFeatured(banner, rarity, forced, featuredRng)
    );

    const results = new Array(total);
    for (let i = 0; i < total; i += 1) {
      results[i] = resolveRollUnit(banner, applyRoll(banner, state, rng, chooseFeatured), unitRng);
    }
    return results;
  }

  function getBannerById(id){
    return getBannerLookup().get(id) ?? null;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'isGachaSummonableFeaturedUnit')) exports.isGachaSummonableFeaturedUnit = isGachaSummonableFeaturedUnit;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getSummonableFeaturedUnits')) exports.getSummonableFeaturedUnits = getSummonableFeaturedUnits;
  if (!Object.prototype.hasOwnProperty.call(exports, 'rollBanner')) exports.rollBanner = rollBanner;
  if (!Object.prototype.hasOwnProperty.call(exports, 'multiRoll')) exports.multiRoll = multiRoll;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getBannerById')) exports.getBannerById = getBannerById;
};
__modules['./screens/ui-gacha/logic/pity.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/ui-gacha/logic/pity.ts
  const __dep0 = __require('./screens/ui-gacha/logic/types.ts');
  const RARITY_ORDER = __dep0.RARITY_ORDER;


  const RARITY_INDEX = new Map(RARITY_ORDER.map((rarity, index) => [rarity, index]));

  function rarityAtLeast(rarity, threshold){
    const rarityIndex = RARITY_INDEX.get(rarity) ?? 0;
    const thresholdIndex = RARITY_INDEX.get(threshold) ?? 0;
    return rarityIndex >= thresholdIndex;
  }

  function createEmptyPity(){
    return { sr: 0, ssr, ur, prime){
    return { pulls: 0, pity) };
  }

  function getStateKey(banner){
    if (banner.type === 'Permanent' && banner.pity.ssr?.carryOver) {
      return 'Permanent';
    }
    return banner.id;
  }

  function getBannerState(map, banner){
    const key = getStateKey(banner);
    const existing = map.get(key);
    if (existing) {
      return existing;
    }
    const state = createBannerState();
    map.set(key, state);
    return state;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'createEmptyPity')) exports.createEmptyPity = createEmptyPity;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getBannerState')) exports.getBannerState = getBannerState;
};
__modules['./screens/ui-gacha/logic/pool.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./catalog.ts');
  const ROSTER = __dep0.ROSTER;
  const __dep1 = __require('./utils/unit-id.ts');
  const normalizeUnitId = __dep1.normalizeUnitId;
  const __dep2 = __require('./screens/ui-gacha/logic/types.ts');
  const RARITY_ORDER = __dep2.RARITY_ORDER;
  const BannerDefinition = __dep2.BannerDefinition;
  const FeaturedUnit = __dep2.FeaturedUnit;
  const Rarity = __dep2.Rarity;

  const EXCLUDED_GACHA_TAGS = new Set(['npc', 'pve', 'pve_only']);
  const EXCLUDED_GACHA_IDS = new Set(['creep_1', 'creep_2', 'creep_3']);
  const PERMANENT_POOL_RARITIES = new Set(['N', 'R', 'SR', 'SSR']);
  const VALID_RARITIES = new Set(RARITY_ORDER);extends FeaturedUnit {
    source: unknown;
  }

  const toStringValue = (value)=> {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  function normalizeGachaRarity(value){
    const text = toStringValue(value);
    if (!text) return null;
    const matched = RARITY_ORDER.find((rarity) => rarity.toLowerCase() === text.toLowerCase());
    return matched && VALID_RARITIES.has(matched) ? matched : null;
  }

  const readRank = (entry)=> (
    normalizeGachaRarity(entry.rank)
    ?? normalizeGachaRarity(entry.rarity)
    ?? normalizeGachaRarity(entry.tier)
  );

  const readTags = (entry)=> {
    if (!Array.isArray(entry.tags)) return [];
    return entry.tags
      .map((tag) => toStringValue(tag)?.toLowerCase() ?? null)
      .filter((tag)=> Boolean(tag));
  };

  const hasExcludedNotes = (entry)=> {
    const notes = toStringValue(entry.notes)?.toLowerCase();
    if (!notes) return false;
    return notes.includes('pve_only') || notes.includes('npc') || notes.includes('pve');
  };

  function isGachaSummonableCatalogUnit(entry){
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    const record = entry /* as RosterLikeEntry */;
    const id = toStringValue(record.id ?? record.key);
    if (!id || EXCLUDED_GACHA_IDS.has(normalizeUnitId(id))) return false;
    if (record.isNpc === true) return false;
    if (!readRank(record)) return false;
    if (readTags(record).some((tag) => EXCLUDED_GACHA_TAGS.has(tag))) return false;
    return !hasExcludedNotes(record);
  }

  function toGachaPoolUnit(entry){
    if (!isGachaSummonableCatalogUnit(entry)) return null;
    const id = toStringValue(entry.id ?? entry.key);
    const rarity = readRank(entry);
    if (!id || !rarity) return null;
    const normalizedId = normalizeUnitId(id);
    return {
      id: normalizedId,
      name) ?? normalizedId,
      rarity,
      portrait),
      isNpc,
      tags),
      source,
    };
  }

  function createGachaPool(source= ROSTER){
    const pool= [];
    const seen = new Set();
    for (const entry of source) {
      const unit = toGachaPoolUnit(entry);
      if (!unit || seen.has(unit.id)) continue;
      seen.add(unit.id);
      pool.push(unit);
    }
    return pool;
  }

  function getPermanentGachaPool(source?){
    return createGachaPool(source).filter((unit) => PERMANENT_POOL_RARITIES.has(unit.rarity));
  }

  function getBannerFallbackPool(banner, source?){
    if (banner.type === 'Permanent') {
      return getPermanentGachaPool(source);
    }
    return createGachaPool(source);
  }

  function getBannerPoolByRarity(
    banner,
    rarity,
    source?,
  ){
    return getBannerFallbackPool(banner, source).filter((unit) => unit.rarity === rarity);
  }


  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeGachaRarity')) exports.normalizeGachaRarity = normalizeGachaRarity;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isGachaSummonableCatalogUnit')) exports.isGachaSummonableCatalogUnit = isGachaSummonableCatalogUnit;
  if (!Object.prototype.hasOwnProperty.call(exports, 'toGachaPoolUnit')) exports.toGachaPoolUnit = toGachaPoolUnit;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createGachaPool')) exports.createGachaPool = createGachaPool;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getPermanentGachaPool')) exports.getPermanentGachaPool = getPermanentGachaPool;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getBannerFallbackPool')) exports.getBannerFallbackPool = getBannerFallbackPool;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getBannerPoolByRarity')) exports.getBannerPoolByRarity = getBannerPoolByRarity;
};
__modules['./screens/ui-gacha/logic/types.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/screens/ui-gacha/logic/types.ts
  const __dep0 = __require('./utils/currency.ts');
  const getCurrencyOrder = __dep0.getCurrencyOrder;
  const CurrencyId = __dep0.CurrencyId;



  const CURRENCY_ORDER= getCurrencyOrder();





  const RARITY_ORDER= ['N', 'R', 'SR', 'SSR', 'UR', 'Prime'];
  if (!Object.prototype.hasOwnProperty.call(exports, 'CURRENCY_ORDER')) exports.CURRENCY_ORDER = CURRENCY_ORDER;
  if (!Object.prototype.hasOwnProperty.call(exports, 'RARITY_ORDER')) exports.RARITY_ORDER = RARITY_ORDER;
};
__modules['./screens/vinh-da/combat/prefixes.ts'] = (exports, module, __require) => {

};
__modules['./screens/vinh-da/constants.ts'] = (exports, module, __require) => {
  const STYLE_ID = 'vinh-da-gameplay-style';
  const BASE_WORLD_WIDTH = 3600;
  const SIDE_EXPANSION_MULTIPLIER = 3;
  const WORLD_WIDTH = BASE_WORLD_WIDTH * (1 + SIDE_EXPANSION_MULTIPLIER * 2);
  const WORLD_CENTER_X = WORLD_WIDTH / 2;

  const LEADER_SPEED = 420;
  const LEADER_WIDTH = 46;
  const GROUND_PLOT_WIDTH = LEADER_WIDTH * 1.8;
  const LEADER_EDGE_PADDING_LEFT = 80;
  const LEADER_EDGE_PADDING_RIGHT = 120;

  const GROUND_RATIO = 0.42;
  const GROUND_PERCENT = `${GROUND_RATIO * 100}%`;

  const CASTLE_WIDTH = 190;
  const CASTLE_LEFT = WORLD_CENTER_X - CASTLE_WIDTH * 0.5;
  const CASTLE_TOWER_OFFSET = 60;
  const CASTLE_TOWER_WIDTH = 54;
  const CASTLE_OUTER_LEFT = CASTLE_LEFT - CASTLE_TOWER_OFFSET;
  const CASTLE_OUTER_RIGHT = CASTLE_LEFT + CASTLE_WIDTH + CASTLE_TOWER_OFFSET;
  const CRYSTAL_X = WORLD_CENTER_X;
  const GROUND_PLOT_CENTER_X = CRYSTAL_X;
  const LEADER_START_X = CRYSTAL_X + 110;

  const BUILD_RANGE = 150;
  const BUILD_SITE_SPACING = 720;
  const BUILD_SITE_CASTLE_PADDING = 360;
  const BUILD_SITE_EDGE_PADDING = 160;
  const BUILD_SITE_RENDER_BUFFER = 800;
  const BUILD_SITE_RENDER_THRESHOLD = 160;

  const DEFAULT_STRUCTURE_COOLDOWN = 0;
  const ENEMY_LIMIT = 30;
  const ENEMY_REWARD = 1;
  const ENEMY_SPAWN_INTERVAL = 1.4;
  const ENEMY_START_PADDING = 120;
  const ENEMY_ATTACK_RANGE = 28;

  const LEADER_ATTACK_RANGE = 58;
  const LEADER_BASIC_ATTACK_COOLDOWN_SECONDS = 2;
  const LEADER_BASIC_ATTACK_DAMAGE = 5;

  const LANDMINE_TRIGGER_RADIUS = GROUND_PLOT_WIDTH * 0.5;
  const LANDMINE_BLAST_RADIUS = 72;
  const LANDMINE_FUSE_SECONDS = 2;
  const LANDMINE_TRUE_DAMAGE = 2;
  const SWAMP_RADIUS = GROUND_PLOT_WIDTH * 0.5;
  const SPIKE_TRAP_RADIUS = GROUND_PLOT_WIDTH * 0.5;
  const SPIKE_TRAP_MIN_WEIGHT = 1;
  const SPIKE_TRAP_MAX_WEIGHT_EXCLUSIVE = 1.9;
  const SPIKE_TRAP_SLOW_SECONDS = 3;
  const SPIKE_TRAP_SLOW_MULTIPLIER = 0.5;
  const SPIKE_TRAP_BLEED_SECONDS = 3;
  const SPIKE_TRAP_BLEED_MAX_HP_PER_SECOND = 0.03;
  const ELEMENTAL_REGION_FIRE_BURN_SECONDS = 2;
  const ELEMENTAL_REGION_FIRE_BURN_MAX_HP_PER_SECOND = 0.0025;
  const ELEMENTAL_REGION_LIGHT_VULNERABLE_SECONDS = 2;
  const ELEMENTAL_REGION_LIGHT_CONTAMINATION_CLEANSE_PER_SECOND = 0.15;
  const ELEMENTAL_REGION_EARTH_DEFENSE_BONUS_PERCENT = 0.03;
  const ELEMENTAL_REGION_DARK_CONTAMINATION_SECONDS = 4;
  const ELEMENTAL_REGION_DARK_CONTAMINATION_COOLDOWN_SECONDS = 8;
  const ELEMENTAL_REGION_THUNDER_PARALYSIS_CHANCE_PER_SECOND = 0.015;
  const ELEMENTAL_REGION_THUNDER_PARALYSIS_SECONDS = 0.35;
  const ELEMENTAL_REGION_THUNDER_PARALYSIS_COOLDOWN_SECONDS = 6;
  if (!Object.prototype.hasOwnProperty.call(exports, 'STYLE_ID')) exports.STYLE_ID = STYLE_ID;
  if (!Object.prototype.hasOwnProperty.call(exports, 'BASE_WORLD_WIDTH')) exports.BASE_WORLD_WIDTH = BASE_WORLD_WIDTH;
  if (!Object.prototype.hasOwnProperty.call(exports, 'SIDE_EXPANSION_MULTIPLIER')) exports.SIDE_EXPANSION_MULTIPLIER = SIDE_EXPANSION_MULTIPLIER;
  if (!Object.prototype.hasOwnProperty.call(exports, 'WORLD_WIDTH')) exports.WORLD_WIDTH = WORLD_WIDTH;
  if (!Object.prototype.hasOwnProperty.call(exports, 'WORLD_CENTER_X')) exports.WORLD_CENTER_X = WORLD_CENTER_X;
  if (!Object.prototype.hasOwnProperty.call(exports, 'LEADER_SPEED')) exports.LEADER_SPEED = LEADER_SPEED;
  if (!Object.prototype.hasOwnProperty.call(exports, 'LEADER_WIDTH')) exports.LEADER_WIDTH = LEADER_WIDTH;
  if (!Object.prototype.hasOwnProperty.call(exports, 'GROUND_PLOT_WIDTH')) exports.GROUND_PLOT_WIDTH = GROUND_PLOT_WIDTH;
  if (!Object.prototype.hasOwnProperty.call(exports, 'LEADER_EDGE_PADDING_LEFT')) exports.LEADER_EDGE_PADDING_LEFT = LEADER_EDGE_PADDING_LEFT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'LEADER_EDGE_PADDING_RIGHT')) exports.LEADER_EDGE_PADDING_RIGHT = LEADER_EDGE_PADDING_RIGHT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'GROUND_RATIO')) exports.GROUND_RATIO = GROUND_RATIO;
  if (!Object.prototype.hasOwnProperty.call(exports, 'GROUND_PERCENT')) exports.GROUND_PERCENT = GROUND_PERCENT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CASTLE_WIDTH')) exports.CASTLE_WIDTH = CASTLE_WIDTH;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CASTLE_LEFT')) exports.CASTLE_LEFT = CASTLE_LEFT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CASTLE_TOWER_OFFSET')) exports.CASTLE_TOWER_OFFSET = CASTLE_TOWER_OFFSET;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CASTLE_TOWER_WIDTH')) exports.CASTLE_TOWER_WIDTH = CASTLE_TOWER_WIDTH;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CASTLE_OUTER_LEFT')) exports.CASTLE_OUTER_LEFT = CASTLE_OUTER_LEFT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CASTLE_OUTER_RIGHT')) exports.CASTLE_OUTER_RIGHT = CASTLE_OUTER_RIGHT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'CRYSTAL_X')) exports.CRYSTAL_X = CRYSTAL_X;
  if (!Object.prototype.hasOwnProperty.call(exports, 'GROUND_PLOT_CENTER_X')) exports.GROUND_PLOT_CENTER_X = GROUND_PLOT_CENTER_X;
  if (!Object.prototype.hasOwnProperty.call(exports, 'LEADER_START_X')) exports.LEADER_START_X = LEADER_START_X;
  if (!Object.prototype.hasOwnProperty.call(exports, 'BUILD_RANGE')) exports.BUILD_RANGE = BUILD_RANGE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'BUILD_SITE_SPACING')) exports.BUILD_SITE_SPACING = BUILD_SITE_SPACING;
  if (!Object.prototype.hasOwnProperty.call(exports, 'BUILD_SITE_CASTLE_PADDING')) exports.BUILD_SITE_CASTLE_PADDING = BUILD_SITE_CASTLE_PADDING;
  if (!Object.prototype.hasOwnProperty.call(exports, 'BUILD_SITE_EDGE_PADDING')) exports.BUILD_SITE_EDGE_PADDING = BUILD_SITE_EDGE_PADDING;
  if (!Object.prototype.hasOwnProperty.call(exports, 'BUILD_SITE_RENDER_BUFFER')) exports.BUILD_SITE_RENDER_BUFFER = BUILD_SITE_RENDER_BUFFER;
  if (!Object.prototype.hasOwnProperty.call(exports, 'BUILD_SITE_RENDER_THRESHOLD')) exports.BUILD_SITE_RENDER_THRESHOLD = BUILD_SITE_RENDER_THRESHOLD;
  if (!Object.prototype.hasOwnProperty.call(exports, 'DEFAULT_STRUCTURE_COOLDOWN')) exports.DEFAULT_STRUCTURE_COOLDOWN = DEFAULT_STRUCTURE_COOLDOWN;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ENEMY_LIMIT')) exports.ENEMY_LIMIT = ENEMY_LIMIT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ENEMY_REWARD')) exports.ENEMY_REWARD = ENEMY_REWARD;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ENEMY_SPAWN_INTERVAL')) exports.ENEMY_SPAWN_INTERVAL = ENEMY_SPAWN_INTERVAL;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ENEMY_START_PADDING')) exports.ENEMY_START_PADDING = ENEMY_START_PADDING;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ENEMY_ATTACK_RANGE')) exports.ENEMY_ATTACK_RANGE = ENEMY_ATTACK_RANGE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'LEADER_ATTACK_RANGE')) exports.LEADER_ATTACK_RANGE = LEADER_ATTACK_RANGE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'LEADER_BASIC_ATTACK_COOLDOWN_SECONDS')) exports.LEADER_BASIC_ATTACK_COOLDOWN_SECONDS = LEADER_BASIC_ATTACK_COOLDOWN_SECONDS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'LEADER_BASIC_ATTACK_DAMAGE')) exports.LEADER_BASIC_ATTACK_DAMAGE = LEADER_BASIC_ATTACK_DAMAGE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'LANDMINE_TRIGGER_RADIUS')) exports.LANDMINE_TRIGGER_RADIUS = LANDMINE_TRIGGER_RADIUS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'LANDMINE_BLAST_RADIUS')) exports.LANDMINE_BLAST_RADIUS = LANDMINE_BLAST_RADIUS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'LANDMINE_FUSE_SECONDS')) exports.LANDMINE_FUSE_SECONDS = LANDMINE_FUSE_SECONDS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'LANDMINE_TRUE_DAMAGE')) exports.LANDMINE_TRUE_DAMAGE = LANDMINE_TRUE_DAMAGE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'SWAMP_RADIUS')) exports.SWAMP_RADIUS = SWAMP_RADIUS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'SPIKE_TRAP_RADIUS')) exports.SPIKE_TRAP_RADIUS = SPIKE_TRAP_RADIUS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'SPIKE_TRAP_MIN_WEIGHT')) exports.SPIKE_TRAP_MIN_WEIGHT = SPIKE_TRAP_MIN_WEIGHT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'SPIKE_TRAP_MAX_WEIGHT_EXCLUSIVE')) exports.SPIKE_TRAP_MAX_WEIGHT_EXCLUSIVE = SPIKE_TRAP_MAX_WEIGHT_EXCLUSIVE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'SPIKE_TRAP_SLOW_SECONDS')) exports.SPIKE_TRAP_SLOW_SECONDS = SPIKE_TRAP_SLOW_SECONDS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'SPIKE_TRAP_SLOW_MULTIPLIER')) exports.SPIKE_TRAP_SLOW_MULTIPLIER = SPIKE_TRAP_SLOW_MULTIPLIER;
  if (!Object.prototype.hasOwnProperty.call(exports, 'SPIKE_TRAP_BLEED_SECONDS')) exports.SPIKE_TRAP_BLEED_SECONDS = SPIKE_TRAP_BLEED_SECONDS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'SPIKE_TRAP_BLEED_MAX_HP_PER_SECOND')) exports.SPIKE_TRAP_BLEED_MAX_HP_PER_SECOND = SPIKE_TRAP_BLEED_MAX_HP_PER_SECOND;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_FIRE_BURN_SECONDS')) exports.ELEMENTAL_REGION_FIRE_BURN_SECONDS = ELEMENTAL_REGION_FIRE_BURN_SECONDS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_FIRE_BURN_MAX_HP_PER_SECOND')) exports.ELEMENTAL_REGION_FIRE_BURN_MAX_HP_PER_SECOND = ELEMENTAL_REGION_FIRE_BURN_MAX_HP_PER_SECOND;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_LIGHT_VULNERABLE_SECONDS')) exports.ELEMENTAL_REGION_LIGHT_VULNERABLE_SECONDS = ELEMENTAL_REGION_LIGHT_VULNERABLE_SECONDS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_LIGHT_CONTAMINATION_CLEANSE_PER_SECOND')) exports.ELEMENTAL_REGION_LIGHT_CONTAMINATION_CLEANSE_PER_SECOND = ELEMENTAL_REGION_LIGHT_CONTAMINATION_CLEANSE_PER_SECOND;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_EARTH_DEFENSE_BONUS_PERCENT')) exports.ELEMENTAL_REGION_EARTH_DEFENSE_BONUS_PERCENT = ELEMENTAL_REGION_EARTH_DEFENSE_BONUS_PERCENT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_DARK_CONTAMINATION_SECONDS')) exports.ELEMENTAL_REGION_DARK_CONTAMINATION_SECONDS = ELEMENTAL_REGION_DARK_CONTAMINATION_SECONDS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_DARK_CONTAMINATION_COOLDOWN_SECONDS')) exports.ELEMENTAL_REGION_DARK_CONTAMINATION_COOLDOWN_SECONDS = ELEMENTAL_REGION_DARK_CONTAMINATION_COOLDOWN_SECONDS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_THUNDER_PARALYSIS_CHANCE_PER_SECOND')) exports.ELEMENTAL_REGION_THUNDER_PARALYSIS_CHANCE_PER_SECOND = ELEMENTAL_REGION_THUNDER_PARALYSIS_CHANCE_PER_SECOND;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_THUNDER_PARALYSIS_SECONDS')) exports.ELEMENTAL_REGION_THUNDER_PARALYSIS_SECONDS = ELEMENTAL_REGION_THUNDER_PARALYSIS_SECONDS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_THUNDER_PARALYSIS_COOLDOWN_SECONDS')) exports.ELEMENTAL_REGION_THUNDER_PARALYSIS_COOLDOWN_SECONDS = ELEMENTAL_REGION_THUNDER_PARALYSIS_COOLDOWN_SECONDS;
};
__modules['./screens/vinh-da/economy/balanceChecks.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./screens/vinh-da/simulation.ts');
  const getVinhDaWaveConfig = __dep0.getVinhDaWaveConfig;
};
__modules['./screens/vinh-da/economy/conversion.ts'] = (exports, module, __require) => {


  const TNT_TO_HNT = 100;

  const TIERED_LIQUID_HNT_BASE= Object.freeze({
    darkStone: 0.9,
    blackIron,
    resentmentStone,
    spiritWood,
    spiritHerb,
    elementStone,
    wishStone,
    heavyWater,
    voidStone,
    dragonScale,
    nightCore,
    bloodLordSigil,
    fleshCrystal);

  const UNTIERED_LIQUID_HNT_VALUE= Object.freeze({
    blackBone: 4,
    mindStone,
    machinePart,
    hazySoul,
    sealDust);

  const getTierIndex = (tierMajor, tierMinor)=> (tierMajor - 1) * 9 + tierMinor;

  const splitTier = (tier?){ major: number; minor: number } => {
    const safeTier = Number.isFinite(tier) ? tier! : 1.1;
    const major = Math.max(1, Math.floor(safeTier));
    const minor = Math.max(1, Math.round((safeTier - major) * 10));
    return { major, minor };
  };

  const getLiquidHntValue = (resource)=> {
    const amount = Math.max(0, resource.amount);
    const tieredBase = TIERED_LIQUID_HNT_BASE[resource.resourceId];
    if (tieredBase !== undefined){
      const { major, minor } = splitTier(resource.tier);
      return amount * tieredBase * getTierIndex(major, minor);
    }
    return amount * (UNTIERED_LIQUID_HNT_VALUE[resource.resourceId] ?? 0);
  };

  const getCondensedHntValue = (resource)=> getLiquidHntValue(resource) * 0.9;

  const settleBaseEssence = (liquidHnt, harvestRate)=> (
    Math.floor(Math.max(0, liquidHnt) * 0.9 * Math.max(0, harvestRate))
  );

  if (!Object.prototype.hasOwnProperty.call(exports, 'getTierIndex')) exports.getTierIndex = getTierIndex;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getLiquidHntValue')) exports.getLiquidHntValue = getLiquidHntValue;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getCondensedHntValue')) exports.getCondensedHntValue = getCondensedHntValue;
  if (!Object.prototype.hasOwnProperty.call(exports, 'settleBaseEssence')) exports.settleBaseEssence = settleBaseEssence;
};
__modules['./screens/vinh-da/economy/dropTables.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./screens/vinh-da/economy/resources.ts');
  const isTieredVinhDaResource = __dep0.isTieredVinhDaResource;



    drops: Omit<TieredAmount, 'tier'>[];
  };





  const nothing = (weight)=> ({ weight, drops);
  const amount = (resourceId, amount)=> ({ resourceId, amount });

  const ENEMY_DROP_TABLES = Object.freeze({
    twisted: [
      [
        { weight: 40, drops, 1)] },
        { weight: 20, drops, 2)] },
        nothing(40)
      ],
      [
        { weight: 10, drops, 1)] },
        { weight: 5, drops, 2)] },
        nothing(85)
      ]
    ],
    crawler, drops, 1)] },
        { weight: 15, drops, 2)] },
        { weight: 3, drops, 3)] },
        nothing(52)
      ]
    ],
    apostle, drops, 2)] }],
      [{ weight: 20, drops, 1)] }, nothing(80)],
      [{ weight: 15, drops, 1)] }, nothing(85)],
      [{ weight: 25, drops, 1)] }, nothing(75)]
    ],
    madDog, drops, 1)] },
        { weight: 5, drops, 2)] },
        nothing(75)
      ]
    ],
    suicideBomber, drops, 1)] }, nothing(90)],
      [{ weight: 20, drops, 1)] }, nothing(80)]
    ],
    mutantBird, drops, 1)] }, nothing(90)],
      [{ weight: 5, drops, 1)] }, nothing(95)]
    ],
    darkMage, drops, 2)] },
        { weight: 20, drops, 3)] },
        { weight: 10, drops, 4)] },
        { weight: 5, drops, 5)] },
        nothing(25)
      ],
      [
        { weight: 60, drops, 1)] },
        { weight: 10, drops, 1)] },
        nothing(30)
      ],
      [
        { weight: 35, drops, 1)] },
        { weight: 10, drops, 2)] },
        nothing(55)
      ]
    ],
    ironMan, drops, 2), amount('blackIron', 2), amount('blackBone', 2)] }],
      [{ weight: 10, drops, 2), amount('blackIron', 2), amount('blackBone', 2)] }, nothing(90)],
      [{ weight: 25, drops, 1)] }, nothing(75)]
    ],

    bloodLordCultist, drops, 1)] }, { weight: 10, drops, 1)] }, nothing(55)],
      [{ weight: 40, drops, 1)] }, { weight: 20, drops, 1)] }, nothing(40)]
    ],
    bloodLordPriest, drops, 1)] }],
      [{ weight: 25, drops, 1)] }, nothing(75)],
      [{ weight: 20, drops, 1)] }, nothing(80)]
    ],
    listener, drops, 1)] }, { weight: 15, drops, 1)] }, nothing(60)]
    ],
    resentmentStatue, drops, 2)] }],
      [{ weight: 35, drops, 1)] }, nothing(65)],
      [{ weight: 15, drops, 1)] }, nothing(85)]
    ],
    darkHighPriest, drops, 1)] }],
      [{ weight: 100, drops, 2)] }],
      [{ weight: 35, drops, 1)] }, nothing(65)],
      [{ weight: 20, drops, 1)] }, nothing(80)]
    ],
    fleshRemnant, drops, 1), amount('nightCore', 2), amount('darkStone', 5)] }],
      [{ weight: 50, drops, 1)] }, nothing(50)]
    ],
    resentfulDragon, drops, 10), amount('blackBone', 5), amount('fleshCrystal', 1), amount('dragonScale', 5)] }],
      [{ weight: 5, drops, 2), amount('fleshCrystal', 1)] }, nothing(95)],
      [{ weight: 100, drops, 1)] }],
      [{ weight: 25, drops, 1)] }, nothing(75)]
    ]
  } /* /* as const */ /* satisfies Record<EnemyKind */ */, EnemyDropTable>);

  const pickDropOutcome = (pool, randomValue) => number)=> {
    const totalWeight = pool.reduce((total, outcome) => total + Math.max(0, outcome.weight), 0);
    if (totalWeight <= 0) return null;
    let roll = Math.max(0, Math.min(0.999999, randomValue())) * totalWeight;
    for (const outcome of pool){
      roll -= Math.max(0, outcome.weight);
      if (roll < 0) return outcome;
    }
    return pool[pool.length - 1] ?? null;
  };

  const addTieredAmount = (drops, resource)=> {
    const existing = drops.find(item => item.resourceId === resource.resourceId && item.tier === resource.tier);
    if (existing) existing.amount += resource.amount;
    else drops.push(resource);
  };

  const rollEnemyResourceDrops = (input) => number;
  })=> {
    const table = ENEMY_DROP_TABLES[input.kind];
    const randomValue = input.randomValue ?? Math.random;
    const tier = input.mapTier ?? input.enemyTier;
    const drops= [];
    for (const pool of table){
      const outcome = pickDropOutcome(pool, randomValue);
      if (!outcome) continue;
      for (const resource of outcome.drops){
        if (resource.amount <= 0) continue;
        addTieredAmount(drops, {
          ...resource,
          tier) ? tier : undefined
        });
      }
    }
    return drops;
  };


  if (!Object.prototype.hasOwnProperty.call(exports, 'rollEnemyResourceDrops')) exports.rollEnemyResourceDrops = rollEnemyResourceDrops;
};
__modules['./screens/vinh-da/economy/merchant.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./screens/vinh-da/economy/conversion.ts');
  const getTierIndex = __dep0.getTierIndex;
};
__modules['./screens/vinh-da/economy/resources.ts'] = (exports, module, __require) => {







    amount: number;
    tier: VinhDaTier;
  };

  const TIERED_VINH_DA_RESOURCES = Object.freeze([
    'darkStone',
    'blackIron',
    'elementStone',
    'heavyWater',
    'voidStone',
    'wishStone',
    'resentmentStone',
    'dragonScale',
    'spiritWood',
    'spiritHerb',
    'fleshCrystal',
    'nightCore',
    'bloodLordSigil'
  ] /* /* as const */ /* satisfies VinhDaResourceId[ */]) */;

  const UNTIERED_VINH_DA_RESOURCES = Object.freeze([
    'blackBone',
    'mindStone',
    'machinePart',
    'hazySoul',
    'sealDust',
    'apostleCloak',
    'mageStaff',
  ] /* /* as const */ /* satisfies VinhDaResourceId[ */]) */;

  const VINH_DA_RESOURCE_LABELS = Object.freeze({
    darkStone: 'Dạ Thạch',
    blackIron,
    blackBone,
    resentmentStone,
    elementStone,
    wishStone,
    voidStone,
    heavyWater,
    mindStone,
    machinePart,
    sealDust,
    nightCore,
    fleshCrystal,
    dragonScale,
    spiritWood,
    spiritHerb,
    hazySoul,
    apostleCloak,
    mageStaff,
    bloodLordSigil, string>);

  const isTieredVinhDaResource = (resourceId)=> (
    (TIERED_VINH_DA_RESOURCES /* as VinhDaResourceId[ */]).includes(resourceId)
  );

  const getResourceLabel = (resourceId)=> VINH_DA_RESOURCE_LABELS[resourceId];


  if (!Object.prototype.hasOwnProperty.call(exports, 'TIERED_VINH_DA_RESOURCES')) exports.TIERED_VINH_DA_RESOURCES = TIERED_VINH_DA_RESOURCES;
  if (!Object.prototype.hasOwnProperty.call(exports, 'UNTIERED_VINH_DA_RESOURCES')) exports.UNTIERED_VINH_DA_RESOURCES = UNTIERED_VINH_DA_RESOURCES;
  if (!Object.prototype.hasOwnProperty.call(exports, 'VINH_DA_RESOURCE_LABELS')) exports.VINH_DA_RESOURCE_LABELS = VINH_DA_RESOURCE_LABELS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isTieredVinhDaResource')) exports.isTieredVinhDaResource = isTieredVinhDaResource;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getResourceLabel')) exports.getResourceLabel = getResourceLabel;
};
__modules['./screens/vinh-da/economy/settlement.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./screens/vinh-da/economy/conversion.ts');
  const getCondensedHntValue = __dep0.getCondensedHntValue;
  const settleBaseEssence = __dep0.settleBaseEssence;


  const VINH_DA_DEFAULT_HARVEST_RATE = 1;
  const VINH_DA_SETTLEMENT_CONDENSE_RATE = 0.9;
  if (!Object.prototype.hasOwnProperty.call(exports, 'VINH_DA_DEFAULT_HARVEST_RATE')) exports.VINH_DA_DEFAULT_HARVEST_RATE = VINH_DA_DEFAULT_HARVEST_RATE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'VINH_DA_SETTLEMENT_CONDENSE_RATE')) exports.VINH_DA_SETTLEMENT_CONDENSE_RATE = VINH_DA_SETTLEMENT_CONDENSE_RATE;
};
__modules['./screens/vinh-da/elemental-regions.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./screens/vinh-da/constants.ts');
  const BUILD_SITE_RENDER_BUFFER = __dep0.BUILD_SITE_RENDER_BUFFER;
  const WORLD_WIDTH = __dep0.WORLD_WIDTH;


  const NON_DARK_ELEMENTAL_REGION_KINDS = ['fire', 'wood', 'water', 'earth', 'metal', 'thunder', 'blood', 'light', 'wind'] /* /* as const */ /* satisfies ElementalRegionKind[ */] */;
  const ELEMENTAL_REGION_ROLL_PERCENT = 11;
  const ELEMENTAL_REGION_BARREN_PERCENT = 1;
  const ELEMENTAL_REGION_TIER_MIN = 1.1;
  const ELEMENTAL_REGION_TIER_MAX = 1.9;
  const ELEMENTAL_REGION_TIER_STEP = 0.1;
  const ELEMENTAL_REGION_TIER_AREA_GROWTH = 0.05;
  const ELEMENTAL_REGION_MAX_NON_DARK_TIER_1 = 4;
  const ELEMENTAL_REGION_BASE_WIDTH_RATIO = 0.08;
  const ELEMENTAL_REGION_DARK_EDGE_RATIO = 0.07;
  const ELEMENTAL_REGION_RENDER_BUFFER = BUILD_SITE_RENDER_BUFFER;
  const ELEMENTAL_REGION_PARTICLES_PER_1000_MIN = 4;
  const ELEMENTAL_REGION_PARTICLES_PER_1000_MAX = 8;
  const ELEMENTAL_REGION_PARTICLE_WIDTH_UNIT = 1000;



  const createElementalRegionRandom = ()=> {
    let seed = Math.floor(Math.random() * 0x7fffffff) || 1;
    return () => {
      seed = (seed * 48271) % 0x7fffffff;
      return seed / 0x7fffffff;
    };
  };

  const getVinhDaMapTier = (params, unknown> | null)=> {
    const explicitTier = typeof params?.tier === 'number' ? params.tier : Number.NaN;
    if (Number.isFinite(explicitTier)) return Math.max(ELEMENTAL_REGION_TIER_MIN, Math.min(ELEMENTAL_REGION_TIER_MAX, explicitTier));
    const stageId = typeof params?.stageId === 'string' ? params.stageId : '';
    const stageMatch = /^(\d+)-(\d+)$/.exec(stageId);
    const stageIndex = stageMatch ? Number.parseInt(stageMatch[2] ?? '1', 10) ;
    return Math.max(ELEMENTAL_REGION_TIER_MIN, Math.min(ELEMENTAL_REGION_TIER_MAX, 1 + stageIndex * ELEMENTAL_REGION_TIER_STEP));
  };

  const rollElementalRegionKind = (random)=> {
    const roll = random() * 100;
    if (roll >= NON_DARK_ELEMENTAL_REGION_KINDS.length * ELEMENTAL_REGION_ROLL_PERCENT) return null;
    if (roll >= 100 - ELEMENTAL_REGION_BARREN_PERCENT) return null;
    return NON_DARK_ELEMENTAL_REGION_KINDS[Math.floor(roll / ELEMENTAL_REGION_ROLL_PERCENT)] ?? null;
  };

  const createElementalRegions = (mapTier, random)=> {
    const tierStep = Math.max(0, Math.round((mapTier - ELEMENTAL_REGION_TIER_MIN) / ELEMENTAL_REGION_TIER_STEP));
    const regionWidth = WORLD_WIDTH * ELEMENTAL_REGION_BASE_WIDTH_RATIO * (1 + tierStep * ELEMENTAL_REGION_TIER_AREA_GROWTH);
    const darkEdgeWidth = WORLD_WIDTH * ELEMENTAL_REGION_DARK_EDGE_RATIO * (1 + tierStep * ELEMENTAL_REGION_TIER_AREA_GROWTH);
    const spawnDarkOnBothEdges = random() >= 0.5;
    const regions= [
      { id: 'element-region-dark-left', kind, startX, endX,
      ...(spawnDarkOnBothEdges ? [{ id: 'element-region-dark-right', kind, startX, endX= darkEdgeWidth;
    const safeEndX = WORLD_WIDTH - (spawnDarkOnBothEdges ? darkEdgeWidth : 0);
    const slotWidth = Math.max(1, (safeEndX - safeStartX) / ELEMENTAL_REGION_MAX_NON_DARK_TIER_1);
    for (let index = 0; index < ELEMENTAL_REGION_MAX_NON_DARK_TIER_1; index += 1){
      const kind = rollElementalRegionKind(random);
      if (!kind) continue;
      const slotStart = safeStartX + slotWidth * index;
      const minStart = slotStart;
      const maxStart = Math.max(minStart, slotStart + slotWidth - regionWidth);
      const startX = minStart + random() * (maxStart - minStart);
      regions.push({ id: `element-region-${index + 1}-${kind}`, kind, startX, endX, startX + regionWidth) });
    }
    return regions.sort((left, right) => left.startX - right.startX);
  };

  const getElementalRegionAtX = (regions, x)=> {
    if (!regions || !Number.isFinite(x)) return null;
    return regions.find(region => x >= region.startX && x <= region.endX) ?? null;
  };

  const getElementalRegionParticleCount = (region)=> {
    const width = Math.max(0, region.endX - region.startX);
    const particleRate = ELEMENTAL_REGION_PARTICLES_PER_1000_MIN + (region.id.length % (ELEMENTAL_REGION_PARTICLES_PER_1000_MAX - ELEMENTAL_REGION_PARTICLES_PER_1000_MIN + 1));
    return Math.max(1, Math.round(width / ELEMENTAL_REGION_PARTICLE_WIDTH_UNIT * particleRate));
  };


  if (!Object.prototype.hasOwnProperty.call(exports, 'NON_DARK_ELEMENTAL_REGION_KINDS')) exports.NON_DARK_ELEMENTAL_REGION_KINDS = NON_DARK_ELEMENTAL_REGION_KINDS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_ROLL_PERCENT')) exports.ELEMENTAL_REGION_ROLL_PERCENT = ELEMENTAL_REGION_ROLL_PERCENT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_BARREN_PERCENT')) exports.ELEMENTAL_REGION_BARREN_PERCENT = ELEMENTAL_REGION_BARREN_PERCENT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_TIER_MIN')) exports.ELEMENTAL_REGION_TIER_MIN = ELEMENTAL_REGION_TIER_MIN;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_TIER_MAX')) exports.ELEMENTAL_REGION_TIER_MAX = ELEMENTAL_REGION_TIER_MAX;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_TIER_STEP')) exports.ELEMENTAL_REGION_TIER_STEP = ELEMENTAL_REGION_TIER_STEP;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_TIER_AREA_GROWTH')) exports.ELEMENTAL_REGION_TIER_AREA_GROWTH = ELEMENTAL_REGION_TIER_AREA_GROWTH;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_MAX_NON_DARK_TIER_1')) exports.ELEMENTAL_REGION_MAX_NON_DARK_TIER_1 = ELEMENTAL_REGION_MAX_NON_DARK_TIER_1;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_BASE_WIDTH_RATIO')) exports.ELEMENTAL_REGION_BASE_WIDTH_RATIO = ELEMENTAL_REGION_BASE_WIDTH_RATIO;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_DARK_EDGE_RATIO')) exports.ELEMENTAL_REGION_DARK_EDGE_RATIO = ELEMENTAL_REGION_DARK_EDGE_RATIO;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_RENDER_BUFFER')) exports.ELEMENTAL_REGION_RENDER_BUFFER = ELEMENTAL_REGION_RENDER_BUFFER;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_PARTICLES_PER_1000_MIN')) exports.ELEMENTAL_REGION_PARTICLES_PER_1000_MIN = ELEMENTAL_REGION_PARTICLES_PER_1000_MIN;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_PARTICLES_PER_1000_MAX')) exports.ELEMENTAL_REGION_PARTICLES_PER_1000_MAX = ELEMENTAL_REGION_PARTICLES_PER_1000_MAX;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ELEMENTAL_REGION_PARTICLE_WIDTH_UNIT')) exports.ELEMENTAL_REGION_PARTICLE_WIDTH_UNIT = ELEMENTAL_REGION_PARTICLE_WIDTH_UNIT;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createElementalRegionRandom')) exports.createElementalRegionRandom = createElementalRegionRandom;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getVinhDaMapTier')) exports.getVinhDaMapTier = getVinhDaMapTier;
  if (!Object.prototype.hasOwnProperty.call(exports, 'rollElementalRegionKind')) exports.rollElementalRegionKind = rollElementalRegionKind;
  if (!Object.prototype.hasOwnProperty.call(exports, 'createElementalRegions')) exports.createElementalRegions = createElementalRegions;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getElementalRegionAtX')) exports.getElementalRegionAtX = getElementalRegionAtX;
  if (!Object.prototype.hasOwnProperty.call(exports, 'getElementalRegionParticleCount')) exports.getElementalRegionParticleCount = getElementalRegionParticleCount;
};
__modules['./screens/vinh-da/enemies.ts'] = (exports, module, __require) => {

};
__modules['./screens/vinh-da/gameplay.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./catalog.ts');
  const ROSTER = __dep0.ROSTER;
  const getMetaById = __dep0.getMetaById;
  const __dep1 = __require('./ui/dom.ts');
  const ensureStyleTag = __dep1.ensureStyleTag;
  const mountSection = __dep1.mountSection;
  const __dep2 = __require('./utils/frame-rate.ts');
  const getFrameRateCap = __dep2.getFrameRateCap;
  const __dep3 = __require('./utils/audio-settings.ts');
  const isAudioEnabled = __dep3.isAudioEnabled;
  const __dep4 = __require('./utils/rng.ts');
  const createRngState = __dep4.createRngState;
  const __dep5 = __require('./screens/vinh-da/constants.ts');
  const BUILD_RANGE = __dep5.BUILD_RANGE;
  const BUILD_SITE_RENDER_BUFFER = __dep5.BUILD_SITE_RENDER_BUFFER;
  const BUILD_SITE_RENDER_THRESHOLD = __dep5.BUILD_SITE_RENDER_THRESHOLD;
  const BUILD_SITE_EDGE_PADDING = __dep5.BUILD_SITE_EDGE_PADDING;
  const CASTLE_LEFT = __dep5.CASTLE_LEFT;
  const CASTLE_OUTER_LEFT = __dep5.CASTLE_OUTER_LEFT;
  const CASTLE_OUTER_RIGHT = __dep5.CASTLE_OUTER_RIGHT;
  const CASTLE_TOWER_OFFSET = __dep5.CASTLE_TOWER_OFFSET;
  const CASTLE_TOWER_WIDTH = __dep5.CASTLE_TOWER_WIDTH;
  const CASTLE_WIDTH = __dep5.CASTLE_WIDTH;
  const CRYSTAL_X = __dep5.CRYSTAL_X;
  const DEFAULT_STRUCTURE_COOLDOWN = __dep5.DEFAULT_STRUCTURE_COOLDOWN;
  const GROUND_PERCENT = __dep5.GROUND_PERCENT;
  const LEADER_EDGE_PADDING_LEFT = __dep5.LEADER_EDGE_PADDING_LEFT;
  const LEADER_EDGE_PADDING_RIGHT = __dep5.LEADER_EDGE_PADDING_RIGHT;
  const LEADER_SPEED = __dep5.LEADER_SPEED;
  const LEADER_START_X = __dep5.LEADER_START_X;
  const LEADER_WIDTH = __dep5.LEADER_WIDTH;
  const STYLE_ID = __dep5.STYLE_ID;
  const WORLD_WIDTH = __dep5.WORLD_WIDTH;
  const __dep6 = __require('./screens/vinh-da/structures.ts');
  const BUILD_NODE_OPTIONS = __dep6.BUILD_NODE_OPTIONS;
  const GROUND_BUILD_NODE_OPTIONS = __dep6.GROUND_BUILD_NODE_OPTIONS;
  const BUILD_SITES = __dep6.BUILD_SITES;
  const UPGRADE_NODE_LABEL = __dep6.UPGRADE_NODE_LABEL;
  const ELEMENTAL_TOWER_ELEMENTS = __dep6.ELEMENTAL_TOWER_ELEMENTS;
  const getBaseLevelStat = __dep6.getBaseLevelStat;
  const getStructureUpgradeCost = __dep6.getStructureUpgradeCost;
  const getStructureLevelStat = __dep6.getStructureLevelStat;
  const isStructureAllowedOnBuildSite = __dep6.isStructureAllowedOnBuildSite;
  const __dep7 = __require('./screens/vinh-da/simulation.ts');
  const DAY_DURATION_SECONDS = __dep7.DAY_DURATION_SECONDS;
  const getScaledThreatBudget = __dep7.getScaledThreatBudget;
  const getVinhDaWaveConfig = __dep7.getVinhDaWaveConfig;
  const runtimeDamageBase */ = __dep7.damageBase /*;
  const runtimeDamageStructure */ = __dep7.damageStructure /*;
  const runtimeClearEnemiesWithoutReward */ = __dep7.clearEnemiesWithoutReward /*;
  const runtimeRemoveEnemyAt */ = __dep7.removeEnemyAt /*;
  const runtimeSpawnWaveEnemy */ = __dep7.spawnWaveEnemy /*;
  const runtimeUpdateDayNightTimer */ = __dep7.updateDayNightTimer /*;
  const runtimeUpdateEnemies */ = __dep7.updateEnemies /*;
  const runtimeUpdateStructures */ = __dep7.updateStructures /*;
  const runtimeCollectDroppedResources */ = __dep7.collectDroppedResources /*;
  const resolveMapModuleInteraction = __dep7.resolveMapModuleInteraction;
  const activateTeleportRetreat = __dep7.activateTeleportRetreat;
  const addTieredAmount = __dep7.addTieredAmount;
  const canActivateTeleportRetreat = __dep7.canActivateTeleportRetreat;
  const TELEPORT_RETREAT_COST = __dep7.TELEPORT_RETREAT_COST;
  const TELEPORT_BANKED_RESOURCE_KEEP_RATIO = __dep7.TELEPORT_BANKED_RESOURCE_KEEP_RATIO;
  const getLivingTerritoryWallBounds = __dep7.getLivingTerritoryWallBounds;
  const isXInLivingTerritory = __dep7.isXInLivingTerritory;
  const getBaseX = __dep7.getBaseX;
  const canStartEscort = __dep7.canStartEscort;
  const startEscort = __dep7.startEscort;
  const __dep8 = __require('./screens/vinh-da/map-modules.ts');
  const createMapModules = __dep8.createMapModules;
  const __dep9 = __require('./screens/vinh-da/economy/resources.ts');
  const getResourceLabel = __dep9.getResourceLabel;
  const isTieredVinhDaResource = __dep9.isTieredVinhDaResource;
  const __dep10 = __require('./screens/vinh-da/economy/merchant.ts');
  const getMerchantPriceInHnt = __dep10.getMerchantPriceInHnt;
  const __dep11 = __require('./screens/vinh-da/elemental-regions.ts');
  const createElementalRegionRandom = __dep11.createElementalRegionRandom;
  const createElementalRegions = __dep11.createElementalRegions;
  const getElementalRegionParticleCount = __dep11.getElementalRegionParticleCount;
  const getVinhDaMapTier = __dep11.getVinhDaMapTier;
  const ELEMENTAL_REGION_RENDER_BUFFER = __dep11.ELEMENTAL_REGION_RENDER_BUFFER;
};
__modules['./screens/vinh-da/map-modules.ts'] = (exports, module, __require) => {

};
__modules['./screens/vinh-da/simulation.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./screens/vinh-da/constants.ts');
  const CASTLE_OUTER_LEFT = __dep0.CASTLE_OUTER_LEFT;
  const CASTLE_OUTER_RIGHT = __dep0.CASTLE_OUTER_RIGHT;
  const CRYSTAL_X = __dep0.CRYSTAL_X;
  const DEFAULT_STRUCTURE_COOLDOWN = __dep0.DEFAULT_STRUCTURE_COOLDOWN;
  const ENEMY_ATTACK_RANGE = __dep0.ENEMY_ATTACK_RANGE;
  const ENEMY_LIMIT = __dep0.ENEMY_LIMIT;
  const ENEMY_SPAWN_INTERVAL = __dep0.ENEMY_SPAWN_INTERVAL;
  const ENEMY_START_PADDING = __dep0.ENEMY_START_PADDING;
  const ELEMENTAL_REGION_DARK_CONTAMINATION_COOLDOWN_SECONDS = __dep0.ELEMENTAL_REGION_DARK_CONTAMINATION_COOLDOWN_SECONDS;
  const ELEMENTAL_REGION_DARK_CONTAMINATION_SECONDS = __dep0.ELEMENTAL_REGION_DARK_CONTAMINATION_SECONDS;
  const ELEMENTAL_REGION_EARTH_DEFENSE_BONUS_PERCENT = __dep0.ELEMENTAL_REGION_EARTH_DEFENSE_BONUS_PERCENT;
  const ELEMENTAL_REGION_FIRE_BURN_MAX_HP_PER_SECOND = __dep0.ELEMENTAL_REGION_FIRE_BURN_MAX_HP_PER_SECOND;
  const ELEMENTAL_REGION_FIRE_BURN_SECONDS = __dep0.ELEMENTAL_REGION_FIRE_BURN_SECONDS;
  const ELEMENTAL_REGION_LIGHT_CONTAMINATION_CLEANSE_PER_SECOND = __dep0.ELEMENTAL_REGION_LIGHT_CONTAMINATION_CLEANSE_PER_SECOND;
  const ELEMENTAL_REGION_LIGHT_VULNERABLE_SECONDS = __dep0.ELEMENTAL_REGION_LIGHT_VULNERABLE_SECONDS;
  const ELEMENTAL_REGION_THUNDER_PARALYSIS_CHANCE_PER_SECOND = __dep0.ELEMENTAL_REGION_THUNDER_PARALYSIS_CHANCE_PER_SECOND;
  const ELEMENTAL_REGION_THUNDER_PARALYSIS_COOLDOWN_SECONDS = __dep0.ELEMENTAL_REGION_THUNDER_PARALYSIS_COOLDOWN_SECONDS;
  const ELEMENTAL_REGION_THUNDER_PARALYSIS_SECONDS = __dep0.ELEMENTAL_REGION_THUNDER_PARALYSIS_SECONDS;
  const LANDMINE_BLAST_RADIUS = __dep0.LANDMINE_BLAST_RADIUS;
  const LANDMINE_FUSE_SECONDS = __dep0.LANDMINE_FUSE_SECONDS;
  const LANDMINE_TRIGGER_RADIUS = __dep0.LANDMINE_TRIGGER_RADIUS;
  const LANDMINE_TRUE_DAMAGE = __dep0.LANDMINE_TRUE_DAMAGE;
  const SPIKE_TRAP_BLEED_MAX_HP_PER_SECOND = __dep0.SPIKE_TRAP_BLEED_MAX_HP_PER_SECOND;
  const SPIKE_TRAP_BLEED_SECONDS = __dep0.SPIKE_TRAP_BLEED_SECONDS;
  const SPIKE_TRAP_MAX_WEIGHT_EXCLUSIVE = __dep0.SPIKE_TRAP_MAX_WEIGHT_EXCLUSIVE;
  const SPIKE_TRAP_MIN_WEIGHT = __dep0.SPIKE_TRAP_MIN_WEIGHT;
  const SPIKE_TRAP_RADIUS = __dep0.SPIKE_TRAP_RADIUS;
  const SPIKE_TRAP_SLOW_MULTIPLIER = __dep0.SPIKE_TRAP_SLOW_MULTIPLIER;
  const SPIKE_TRAP_SLOW_SECONDS = __dep0.SPIKE_TRAP_SLOW_SECONDS;
  const LEADER_ATTACK_RANGE = __dep0.LEADER_ATTACK_RANGE;
  const LEADER_BASIC_ATTACK_COOLDOWN_SECONDS = __dep0.LEADER_BASIC_ATTACK_COOLDOWN_SECONDS;
  const LEADER_BASIC_ATTACK_DAMAGE = __dep0.LEADER_BASIC_ATTACK_DAMAGE;
  const SWAMP_RADIUS = __dep0.SWAMP_RADIUS;
  const WORLD_WIDTH = __dep0.WORLD_WIDTH;
  const __dep1 = __require('./utils/rng.ts');
  const nextRngValue = __dep1.nextRngValue;
  const __dep2 = __require('./screens/vinh-da/elemental-regions.ts');
  const getElementalRegionAtX = __dep2.getElementalRegionAtX;
  const __dep3 = __require('./screens/vinh-da/enemies.ts');
  const DEFAULT_ENEMY_TEMPLATE = __dep3.DEFAULT_ENEMY_TEMPLATE;
  const ENEMY_TEMPLATES = __dep3.ENEMY_TEMPLATES;
  const reduceDamageByDefense = __dep3.reduceDamageByDefense;
  const scaleEnemyTierStat = __dep3.scaleEnemyTierStat;
  const __dep4 = __require('./screens/vinh-da/combat/prefixes.ts');
  const applyCreaturePrefixPostRank = __dep4.applyCreaturePrefixPostRank;
  const applyPrefixBonusDrops = __dep4.applyPrefixBonusDrops;
  const canApplyCreaturePrefix = __dep4.canApplyCreaturePrefix;
  const getPrefixNightCap = __dep4.getPrefixNightCap;
  const getPrefixThreatCostMultiplier = __dep4.getPrefixThreatCostMultiplier;
  const __dep5 = __require('./screens/vinh-da/structures.ts');
  const BASE_STRUCTURE_STATS = __dep5.BASE_STRUCTURE_STATS;
  const getBaseLevelStat = __dep5.getBaseLevelStat;
  const getStructureLevelStat = __dep5.getStructureLevelStat;
  const metersToWorldUnits = __dep5.metersToWorldUnits;
  const __dep6 = __require('./screens/vinh-da/map-modules.ts');
  const pickModuleOutcome = __dep6.pickModuleOutcome;
  const __dep7 = __require('./screens/vinh-da/economy/conversion.ts');
  const getLiquidHntValue = __dep7.getLiquidHntValue;
  const __dep8 = __require('./screens/vinh-da/economy/merchant.ts');
  const createVinhDaMerchantStock = __dep8.createVinhDaMerchantStock;
  const rollVinhDaMerchantPresence = __dep8.rollVinhDaMerchantPresence;
  const __dep9 = __require('./screens/vinh-da/economy/settlement.ts');
  const settleVinhDaMapEconomy = __dep9.settleVinhDaMapEconomy;
  const __dep10 = __require('./screens/vinh-da/economy/dropTables.ts');
  const rollEnemyResourceDrops = __dep10.rollEnemyResourceDrops;


  const DAY_DURATION_SECONDS = 300;
  const RESOURCE_PICKUP_RANGE = 54;
  const RESOURCE_DEPOSIT_RANGE = 90;
  const BASE_BUFF_DAILY_UPKEEP = 5;
  const STRUCTURE_HEALING_CAP_MAX_HP_PER_SECOND = 0.08;
  const TELEPORT_RETREAT_COST = 3;
  const TELEPORT_BANKED_RESOURCE_KEEP_RATIO = 0.75;
  const ESCORT_START_RESOURCE_COST = 10;
  const ESCORT_START_NIGHT_INDEX = 3;
  const ESCORT_SEAL_POINTS = Object.freeze([CRYSTAL_X + 520, CRYSTAL_X + 1040, CRYSTAL_X + 1560] /* /* as const */ */);
  const ESCORT_SPEED = 42;
  const ESCORT_SEAL_REACH_RANGE = 18;
  const BASE_HEALING_CAP_WINDOW_SECONDS = 1;
  if (!Object.prototype.hasOwnProperty.call(exports, 'DAY_DURATION_SECONDS')) exports.DAY_DURATION_SECONDS = DAY_DURATION_SECONDS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'RESOURCE_PICKUP_RANGE')) exports.RESOURCE_PICKUP_RANGE = RESOURCE_PICKUP_RANGE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'RESOURCE_DEPOSIT_RANGE')) exports.RESOURCE_DEPOSIT_RANGE = RESOURCE_DEPOSIT_RANGE;
  if (!Object.prototype.hasOwnProperty.call(exports, 'BASE_BUFF_DAILY_UPKEEP')) exports.BASE_BUFF_DAILY_UPKEEP = BASE_BUFF_DAILY_UPKEEP;
  if (!Object.prototype.hasOwnProperty.call(exports, 'STRUCTURE_HEALING_CAP_MAX_HP_PER_SECOND')) exports.STRUCTURE_HEALING_CAP_MAX_HP_PER_SECOND = STRUCTURE_HEALING_CAP_MAX_HP_PER_SECOND;
  if (!Object.prototype.hasOwnProperty.call(exports, 'TELEPORT_RETREAT_COST')) exports.TELEPORT_RETREAT_COST = TELEPORT_RETREAT_COST;
  if (!Object.prototype.hasOwnProperty.call(exports, 'TELEPORT_BANKED_RESOURCE_KEEP_RATIO')) exports.TELEPORT_BANKED_RESOURCE_KEEP_RATIO = TELEPORT_BANKED_RESOURCE_KEEP_RATIO;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ESCORT_START_RESOURCE_COST')) exports.ESCORT_START_RESOURCE_COST = ESCORT_START_RESOURCE_COST;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ESCORT_START_NIGHT_INDEX')) exports.ESCORT_START_NIGHT_INDEX = ESCORT_START_NIGHT_INDEX;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ESCORT_SEAL_POINTS')) exports.ESCORT_SEAL_POINTS = ESCORT_SEAL_POINTS;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ESCORT_SPEED')) exports.ESCORT_SPEED = ESCORT_SPEED;
  if (!Object.prototype.hasOwnProperty.call(exports, 'ESCORT_SEAL_REACH_RANGE')) exports.ESCORT_SEAL_REACH_RANGE = ESCORT_SEAL_REACH_RANGE;
};
__modules['./screens/vinh-da/structures.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./screens/vinh-da/constants.ts');
  const BUILD_SITE_CASTLE_PADDING = __dep0.BUILD_SITE_CASTLE_PADDING;
  const BUILD_SITE_EDGE_PADDING = __dep0.BUILD_SITE_EDGE_PADDING;
  const BUILD_SITE_SPACING = __dep0.BUILD_SITE_SPACING;
  const GROUND_PLOT_CENTER_X = __dep0.GROUND_PLOT_CENTER_X;
  const GROUND_PLOT_WIDTH = __dep0.GROUND_PLOT_WIDTH;
  const CASTLE_OUTER_LEFT = __dep0.CASTLE_OUTER_LEFT;
  const CASTLE_OUTER_RIGHT = __dep0.CASTLE_OUTER_RIGHT;
  const WORLD_WIDTH = __dep0.WORLD_WIDTH;
  const __dep1 = __require('./screens/vinh-da/economy/resources.ts');
  const isTieredVinhDaResource = __dep1.isTieredVinhDaResource;
};
__modules['./screens/vinh-da/types.ts'] = (exports, module, __require) => {

};
__modules['./shared-types/units.ts'] = (exports, module, __require) => {
  const __reexport0 = __require('./types/units.ts');
  for (const key of Object.keys(__reexport0)) {
    if (key === 'default') continue;
    if (Object.prototype.hasOwnProperty.call(exports, key)) continue;
    exports[key] = __reexport0[key];
  }
};
__modules['./statuses.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/statuses.ts
  const __dep0 = __require('./combat/apply-damage.ts');
  const applyDamage = __dep0.applyDamage;
  const __dep1 = __require('./combat/calculate-final-damage.ts');
  const calculateFinalDamage = __dep1.calculateFinalDamage;
  const __dep2 = __require('./data/tags.ts');
  const normalizeTagList = __dep2.normalizeTagList;
  const __dep3 = __require('./utils/fury.ts');
  const gainFury = __dep3.gainFury;
  const finishFuryHit = __dep3.finishFuryHit;
  const __dep4 = __require('./utils/time.ts');
  const safeNow = __dep4.safeNow;
    fatigue: (spec?, unknown>) => {
      const { turns = 2 } = (spec ?? {}) /* as { turns: number } */;
      return createTimedStatus('fatigue', 'debuff', 'output', turns);
    },
    silence, unknown>) => {
      const { turns = 1 } = (spec ?? {}) /* as { turns: number } */;
      return createTimedStatus('silence', 'debuff', 'silence', turns);
    },
    shield, unknown>) => {
      const { pct = 0.2, amount = 0 } = (spec ?? {}) /* as { pct: number */; amount: number };
      return {
        id: 'shield',
        kind,
        tag,
        amount,
        power,
        tick,
      };
    },
    exalt, unknown>) => {
      const { turns = 2 } = (spec ?? {}) /* as { turns: number } */;
      return createTimedStatus('exalt', 'buff', 'output', turns);
    },
    pierce, unknown>) => {
      const { pct = 0.1, turns = 2 } = (spec ?? {}) /* as { pct: number */; turns: number };
      return { id: 'pierce', kind, tag, power, dur, tick,
    daze, unknown>) => {
      const { turns = 1 } = (spec ?? {}) /* as { turns: number } */;
      return createTimedStatus('daze', 'debuff', 'stat', turns);
    },
    frenzy, unknown>) => {
      const { turns = 2 } = (spec ?? {}) /* as { turns: number } */;
      return createTimedStatus('frenzy', 'buff', 'basic-boost', turns);
    },
    weaken, unknown>) => {
      const { turns = 2, stacks = 1 } = (spec ?? {}) /* as { turns: number */; stacks: number };
      return {
        id: 'weaken',
        kind,
        tag,
        dur,
        tick,
        stacks,
        maxStacks,
      };
    },
    fear, unknown>) => {
      const { turns = 1 } = (spec ?? {}) /* as { turns: number } */;
      return createTimedStatus('fear', 'debuff', 'output', turns);
    },
    stealth, unknown>) => {
      const { turns = 1 } = (spec ?? {}) /* as { turns: number } */;
      return createTimedStatus('stealth', 'buff', 'invuln', turns);
    },
    venom, unknown>) => {
      const { pct = 0.15, turns = 2 } = (spec ?? {}) /* as { pct: number */; turns: number };
      return { id: 'venom', kind, tag, power, dur, tick,
    execute, unknown>) => {
      const { turns = 2 } = (spec ?? {}) /* as { turns: number } */;
      return createTimedStatus('execute', 'buff', 'execute', turns);
    },
    undying) => ({ id: 'undying', kind, tag, once),
    allure, unknown>) => {
      const { turns = 1 } = (spec ?? {}) /* as { turns: number } */;
      return createTimedStatus('allure', 'buff', 'avoid-basic', turns);
    },
    haste, unknown>) => {
      const { pct = 0.1, turns = 1 } = (spec ?? {}) /* as { pct: number */; turns: number };
      return { id: 'haste', kind, tag, power, dur, tick,
  } /* satisfies StatusRegistry */;

  const hasDebuffImmunity = (unit, statusId)=> {
    const carrier = unit /* as UnitToken & { _nguyenLeDebuffImmunities: unknown } */;
    const list = carrier._nguyenLeDebuffImmunities;
    if (!Array.isArray(list) || list.length <= 0) return false;
    const id = String(statusId || '').trim().toLowerCase();
    if (!id) return false;
    for (const entry of list) {
      if (typeof entry !== 'string') continue;
      if (entry.trim().toLowerCase() === id) return true;
    }
    return false;
  };

  const Statuses= {
    add(unit, status) {
      if (isAxiomBlockedKind(status.kind) && hasDivineNatureTag(unit)) {
        return status;
      }
      if (status.kind === 'debuff' && hasDebuffImmunity(unit, status.id)) {
        return status;
      }
      const list = ensureStatusList(unit);
      const index = list.findIndex(existingStatus => existingStatus.id === status.id);
      const existing = index >= 0 ? list[index] ?? null : null;
      if (existing) {
        if (status.maxStacks && existing.stacks != null) {
          existing.stacks = Math.min(status.maxStacks, (existing.stacks || 1) + (status.stacks || 1));
        }
        if (status.dur != null) existing.dur = status.dur;
        if (status.power != null) existing.power = status.power;
        if (status.amount != null) existing.amount = (existing.amount ?? 0) + (status.amount ?? 0);
        return existing;
      }
      const copy= { ...status };
      if (copy.stacks == null) copy.stacks = 1;
      list.push(copy);
      return copy;
    },
    remove(unit, id) {
      const [list, index] = findStatus(unit, id);
      if (index >= 0) list.splice(index, 1);
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
      const found = this.get(unit, id);
      return found ? found.stacks ?? 0 : 0;
    },
    onTurnStart(_unit, _ctx) {
      // reserved
    },
    onTurnEnd(unit, ctx) {
      const statuses = ensureStatusList(unit);
      let bleed= null;
      let poison= null;
      for (let i = statuses.length - 1; i >= 0; i -= 1) {
        const status = statuses[i];
        if (!status) continue;
        if (!bleed && status.id === 'bleed') bleed = status;
        else if (!poison && status.id === 'poison') poison = status;
        if (status.tick === TURN_TICK && !isDotStatusId(status.id)) decrementDuration(unit, status);
      }
      if (bleed) applyDotTick(unit, bleed, ctx);
      if (poison) applyDotTick(unit, poison, ctx);
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
      if (what === 'ult') return this.has(unit, 'silence');
      return false;
    },
    resolveTarget(attacker, candidates, ctx = {}) {
      const attackType = ctx.attackType ?? 'basic';
      if (!Array.isArray(candidates) || candidates.length <= 0) return null;

      let nearestTaunter= null;
      let nearestTaunterDistance = Number.POSITIVE_INFINITY;
      let nearestTaunterNonAllure= null;
      let nearestTaunterNonAllureDistance = Number.POSITIVE_INFINITY;
      let hasNonAllureCandidate = false;

      for (const candidate of candidates) {
        if (!isTokenCandidate(candidate)) continue;
        const distance = Math.abs(candidate.cx - attacker.cx) + Math.abs(candidate.cy - attacker.cy);
        const candidateStatuses = ensureStatusList(candidate);
        let isAllure = false;
        let hasTaunt = false;
        for (const status of candidateStatuses) {
          if (!status) continue;
          if (!isAllure && status.id === ALLURE_STATUS_ID) isAllure = true;
          else if (!hasTaunt && status.id === TAUNT_STATUS_ID) hasTaunt = true;
          if (isAllure && hasTaunt) break;
        }
        if (!isAllure) hasNonAllureCandidate = true;
        if (!hasTaunt) continue;

        if (distance < nearestTaunterDistance) {
          nearestTaunter = candidate;
          nearestTaunterDistance = distance;
        }
        if (!isAllure && distance < nearestTaunterNonAllureDistance) {
          nearestTaunterNonAllure = candidate;
          nearestTaunterNonAllureDistance = distance;
        }
      }

      if (attackType === 'basic' && hasNonAllureCandidate) {
        return nearestTaunterNonAllure;
      }
      return nearestTaunter;
    },
    modifyStats(unit, base) {
      const statuses = ensureStatusList(unit);
      let hasDaze = false;
      let hasFear = false;
      let haste= null;
      for (const status of statuses) {
        if (!status) continue;
        if (!hasDaze && status.id === 'daze') hasDaze = true;
        else if (!hasFear && status.id === 'fear') hasFear = true;
        else if (!haste && status.id === 'haste') haste = status;
        if (hasDaze && hasFear && haste) break;
      }
      const next = { ...base };
      if (hasDaze) {
        next.SPD = (next.SPD ?? 0) * 0.9;
        next.AGI = (next.AGI ?? 0) * 0.9;
      }
      if (hasFear) {
        next.SPD = (next.SPD ?? 0) * 0.9;
      }
      if (haste) {
        const boost = 1 + clamp01(haste.power ?? 0.1);
        next.SPD = (next.SPD ?? 0) * boost;
      }
      return next;
    },
    beforeDamage(attacker, target, ctx = {}) {
      const attackerStatuses = ensureStatusList(attacker);
      let fatigue= null;
      let exalt= null;
      let frenzy= null;
      let weak= null;
      let fear= null;
      let pierce= null;
      for (const status of attackerStatuses) {
        if (!status) continue;
        if (!fatigue && status.id === 'fatigue') fatigue = status;
        else if (!exalt && status.id === 'exalt') exalt = status;
        else if (!frenzy && status.id === 'frenzy') frenzy = status;
        else if (!weak && status.id === 'weaken') weak = status;
        else if (!fear && status.id === 'fear') fear = status;
        else if (
          !pierce
          && (
            status.id === 'pierce'
            || status.id === 'duong_ha_skill2_pierce'
            || status.tag === 'penetration'
          )
        ) {
          pierce = status;
        }
        if (fatigue && exalt && frenzy && weak && fear && pierce) break;
      }
      const targetStatuses = ensureStatusList(target);
      let cut= null;
      let stealth= null;
      for (const status of targetStatuses) {
        if (!status) continue;
        if (!cut && status.id === 'dmgCut') cut = status;
        else if (!stealth && status.id === 'stealth') stealth = status;
        if (cut && stealth) break;
      }
      const attackType = ctx.attackType ?? 'basic';
      const dtype = ctx.dtype ?? 'phys';
      const base = ctx.base ?? 0;
      let outMul = 1;
      let inMul = 1;
      let defPen = 0;
      let ignoreAll = false;

      if (fatigue) outMul *= 0.9;
      if (exalt) outMul *= 1.1;
      if (attackType === 'basic' && frenzy) outMul *= 1.2;
      if (weak) outMul *= 1 - 0.1 * Math.min(5, weak.stacks ?? 1);
      if (fear) outMul *= 0.9;

      if (cut) inMul *= 1 - clamp01(cut.power ?? 0);
      if (stealth) {
        inMul = 0;
        ignoreAll = true;
      }
      if (pierce) defPen = Math.max(defPen, clamp01(pierce.power ?? 0.1));

      const context= {
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
      const shield = this.get(target, 'shield');
      if (!shield || (shield.amount ?? 0) <= 0) {
        return { remain: dmg, absorbed, broke= shield.amount ?? 0;
      const absorbed = Math.min(current, dmg);
      const remain = dmg - absorbed;
      const left = current - absorbed;
      shield.amount = left;
      if (left <= 0) {
        this.remove(target, 'shield');
      }
      return { remain, absorbed, broke= 0 };
    },
    afterDamage(attacker, target, result = {}) {
      const dealt = result.dealt ?? 0;
      const venom = this.get(attacker, 'venom');
      if (venom && dealt > 0) {
        const extra = Math.round(dealt * clamp01(venom.power ?? 0));
        applyDamage(target, extra);
        hookOnLethalDamage(target);
        if (extra > 0) {
          gainFury(target, {
            type: 'damageTaken',
            dealt,
            selfMaxHp) ? target.hpMax : undefined,
            damageTaken,
          });
          finishFuryHit(target);
        }
      }

      const reflectPower = clamp01(this.get(target, 'reflect')?.power ?? 0);
      const shouldApplyLegacyReflect = result.dtype == null;
      if (shouldApplyLegacyReflect && reflectPower > 0 && dealt > 0) {
        applyMitigatedHit(target, attacker, Math.round(dealt * reflectPower), 'mixed');
      }

      if (this.has(attacker, 'execute')) {
        if ((target.hp ?? 0) <= Math.ceil((target.hpMax ?? 0) * 0.1)) {
          target.hp = 0;
          const revived = hookOnLethalDamage(target);
          if (!revived) {
            target.alive = false;
            if (!target.deadAt) target.deadAt = safeNow();
          }
        }
      }

      return result;
    },
    make,
  };

  function makeStatusEffect(
    key,
    spec?,
  ){
    const factory = Statuses.make[key];
    if (typeof factory === 'function') {
      return factory(spec);
    }
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
      console.warn(`[Statuses] Không tìm thấy factory cho hiệu ứng "${String(key)}".`);
    }
    return null;
  }

  function applyStatus(unit, status){
    if (!unit) return null;
    return Statuses.add(unit, status);
  }

  function clearStatus(unit, id){
    if (!unit) return;
    Statuses.remove(unit, id);
  }

  function hookOnLethalDamage(target){
    const status = Statuses.get(target, 'undying');
    if (!status) return false;
    if ((target.hp ?? 0) <= 0) {
      target.hp = 1;
      Statuses.remove(target, 'undying');
      target.alive = true;
      target.deadAt = undefined;
      return true;
    }
    return false;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'Statuses')) exports.Statuses = Statuses;
  if (!Object.prototype.hasOwnProperty.call(exports, 'makeStatusEffect')) exports.makeStatusEffect = makeStatusEffect;
  if (!Object.prototype.hasOwnProperty.call(exports, 'applyStatus')) exports.applyStatus = applyStatus;
  if (!Object.prototype.hasOwnProperty.call(exports, 'clearStatus')) exports.clearStatus = clearStatus;
  if (!Object.prototype.hasOwnProperty.call(exports, 'hookOnLethalDamage')) exports.hookOnLethalDamage = hookOnLethalDamage;
};
__modules['./summon.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/summon.ts
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
  const __dep5 = __require('./utils/unique-global.ts');
  const isUniqueGlobalSummonBlocked = __dep5.isUniqueGlobalSummonBlocked;

  const DEFAULT_SUMMON_UNIT= {
    id: 'creep',
    name,
    color,
  };

  const tokensAlive = (Game)=>
    Game.tokens.filter((t)=> t.alive);

  const isRecord = (value)=>
    !!value && typeof value === 'object' && !Array.isArray(value);

  const isPassiveKit = (value)=> {
    if (!isRecord(value)) return false;
    const passives = (value /* as { passives: unknown } */).passives;
    return passives == null || Array.isArray(passives);
  };

  const getKitDefinition = (metaEntry)=> {
    if (!isRecord(metaEntry)) return null;
    const kitCandidate = 'kit' in metaEntry ? (metaEntry.kit /* as unknown */) ;
    return isPassiveKit(kitCandidate) ? kitCandidate : null;
  };

  const isSequentialTurn = (turn)=>
    !!turn && Array.isArray((turn /* as SequentialTurnState */).order);

  const getTurnSnapshotInfo = (turn){ orderLength: number | null; cycle: number } => {
    if (!turn) return { orderLength: null, cycle= Number.isFinite(turn.cycle) ? turn.cycle : 0;
    if (isSequentialTurn(turn)) {
      return { orderLength: turn.order.length, cycle };
    }
    return { orderLength: null, cycle };
  };

  // en-queue các yêu cầu “Immediate” trong lúc 1 unit đang hành động
  // req: { by:unitId, side, slot, unit, req){
    if (isUniqueGlobalSummonBlocked(Game, {
      unitId: req.unit?.id,
      tags, unknown> | null)?.['tags'])
        ? ((req.unit /* as Record<string */, unknown>)['tags'] /* as ReadonlyArray<string> */)
        
    })) return false;

    if (req.by){
      const metaEntry =
        typeof Game.meta?.get === 'function' ? Game.meta.get(req.by) ;
      const record = metaEntry && typeof metaEntry === 'object' ? metaEntry /* as Record<string */, unknown> : null;
      const ok = Boolean(
        record
          && record['class'] === 'Summoner'
          && kitSupportsSummon(record),
      );
      if (!ok) return false;
    }
    const { cx, cy } = slotToCell(req.side, req.slot);
    if (cellReserved(tokensAlive(Game), Game.queued, cx, cy)) return false;

    const entry= {
      side: req.side,
      slot,
      unit,
    };
    Game.actionChain.push(entry);
    return true;
  }

  // xử lý toàn bộ chain của 1 phe sau khi actor vừa hành động
  // trả về slot lớn nhất đã hành động trong chain để tiện logging
  function processActionChain(
    Game,
    side,
    baseSlot,
    hooks= {},
  ){
    const list= [];
    const rest= [];
    for (const entry of Game.actionChain) {
      if (entry.side === side) list.push(entry);
      else rest.push(entry);
    }
    if (!list.length) return baseSlot ?? null;
    const aliveTokens = tokensAlive(Game);

    list.sort((a, b) => a.slot - b.slot);

    let maxSlot = baseSlot ?? 0;
    for (const item of list){
      const { cx, cy } = slotToCell(side, item.slot);
      if (cellReserved(aliveTokens, Game.queued, cx, cy)) continue;

      const extra = item.unit ?? {};
      const art = getUnitArt(extra.id ?? 'minion');
      const newToken= {
        id: (extra.id ?? 'creep') /* as string */,
        name,
        color,
        cx,
        cy,
        side,
        alive,
        isMinion),
        ownerIid,
        bornSerial,
        ttlTurns,
        hpMax,
        hp,
        atk,
        art,
        skinKey,
        iid,
      };
      Game.tokens.push(newToken);
      aliveTokens.push(newToken);
        try {
          const sessionVfx = asSessionWithVfx(Game);
          if (sessionVfx) {
            vfxAddSpawn(sessionVfx, cx, cy, side);
          }
        } catch (_err) {
          // bỏ qua lỗi hiệu ứng
        }

      const spawned = newToken;
      const metaEntry =
        extra.id && typeof Game.meta?.get === 'function'
          ? Game.meta.get(extra.id)
          ;
      const kit = getKitDefinition(metaEntry);
      const onSpawnConfig = kit?.onSpawn && isRecord(kit.onSpawn) ? kit.onSpawn : null;
      prepareUnitForPassives(spawned);
      applyOnSpawnEffects(Game, spawned, onSpawnConfig ?? undefined);
      spawned.iid = hooks.allocIid?.() ?? spawned.iid ?? 0;

      const creep = spawned.alive ? spawned : null;
      if (creep){
        const { orderLength, cycle } = getTurnSnapshotInfo(Game.turn);
        const turnContext= {
          side,
          slot,
          orderIndex, side, item.slot) ?? -1,
          orderLength,
          cycle,
        };
        hooks.doActionOrSkip?.(Game, creep, { performUlt: hooks.performUlt, turnContext });
      }

      if (item.slot > maxSlot) maxSlot = item.slot;
    }

    Game.actionChain = rest;
    return maxSlot;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'processActionChain')) exports.processActionChain = processActionChain;
};
__modules['./turns.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/turn.ts
  const __dep0 = __require('./aether.ts');
  const globalAetherPool = __dep0.globalAetherPool;
  const resolveActionAetherRegen = __dep0.resolveActionAetherRegen;
  const __dep1 = __require('./engine.ts');
  const slotToCell = __dep1.slotToCell;
  const slotIndex = __dep1.slotIndex;
  const __dep2 = __require('./statuses.ts');
  const Statuses = __dep2.Statuses;
  const __dep3 = __require('./combat.ts');
  const doBasicWithFollowups = __dep3.doBasicWithFollowups;
  const __dep4 = __require('./combat/perform-active-skill.ts');
  const performActiveSkill = __dep4.performActiveSkill;
  const __dep5 = __require('./combat/unit-runtime-hooks.ts');
  const runRuntimeActionEnd = __dep5.runRuntimeActionEnd;
  const runRuntimeUnitRevive = __dep5.runRuntimeUnitRevive;
  const runRuntimeTurnEnd = __dep5.runRuntimeTurnEnd;
  const runRuntimeTurnStart = __dep5.runRuntimeTurnStart;
  const __dep6 = __require('./combat/chap-minh-runtime.ts');
  const applyChapMinhActionEnd = __dep6.applyChapMinhActionEnd;
  const applyChapMinhPhaseShift = __dep6.applyChapMinhPhaseShift;
  const recoverChapMinhMaxHpPerTurn = __dep6.recoverChapMinhMaxHpPerTurn;
  const refreshChapMinhOwnership = __dep6.refreshChapMinhOwnership;
  const __dep7 = __require('./config.ts');
  const CFG = __dep7.CFG;
  const __dep8 = __require('./meta.ts');
  const initialRageFor = __dep8.initialRageFor;
  const __dep9 = __require('./vfx.ts');
  const vfxAddSpawn = __dep9.vfxAddSpawn;
  const vfxAddBloodPulse = __dep9.vfxAddBloodPulse;
  const asSessionWithVfx = __dep9.asSessionWithVfx;
  const __dep10 = __require('./art.ts');
  const getUnitArt = __dep10.getUnitArt;
  const __dep11 = __require('./passives.ts');
  const emitPassiveEvent = __dep11.emitPassiveEvent;
  const applyOnSpawnEffects = __dep11.applyOnSpawnEffects;
  const getPassiveLog = __dep11.getPassiveLog;
  const prepareUnitForPassives = __dep11.prepareUnitForPassives;
  const __dep12 = __require('./events.ts');
  const emitGameEvent = __dep12.emitGameEvent;
  const TURN_START = __dep12.TURN_START;
  const TURN_END = __dep12.TURN_END;
  const ACTION_START = __dep12.ACTION_START;
  const ACTION_END = __dep12.ACTION_END;
  const TURN_REGEN = __dep12.TURN_REGEN;
  const __dep13 = __require('./utils/time.ts');
  const mergeBusyUntil = __dep13.mergeBusyUntil;
  const safeNow = __dep13.safeNow;
  const sessionNow = __dep13.sessionNow;
  const __dep14 = __require('./utils/fury.ts');
  const initializeFury = __dep14.initializeFury;
  const startFuryTurn = __dep14.startFuryTurn;
  const spendFury = __dep14.spendFury;
  const resolveUltCost = __dep14.resolveUltCost;
  const setFury = __dep14.setFury;
  const clearFreshSummon = __dep14.clearFreshSummon;
  const __dep15 = __require('./turns/interleaved.ts');
  const nextTurnInterleaved = __dep15.nextTurnInterleaved;
  const getSequentialOrderIndex = __dep15.getSequentialOrderIndex;
  const predictSpawnCycleByTurnOrder = __dep15.predictSpawnCycleByTurnOrder;
  const __dep16 = __require('./modes/pve/collection-mapper.ts');
  const resolveRuntimeUnitStats = __dep16.resolveRuntimeUnitStats;
  const __dep17 = __require('./ai.ts');
  const evaluateGambitLogic = __dep17.evaluateGambitLogic;
  const __dep18 = __require('./utils/rng.ts');
  const nextRngValue = __dep18.nextRngValue;
  const __dep19 = __require('./utils/domain-normalization.ts');
  const normalizeClassName = __dep19.normalizeClassName;
  const normalizeElementKey = __dep19.normalizeElementKey;
  const __dep20 = __require('./utils/unique-global.ts');
  const isUniqueGlobalSummonBlocked = __dep20.isUniqueGlobalSummonBlocked;
  const __dep21 = __require('./utils/player-profile.ts');
  const loadPlayerProfile = __dep21.loadPlayerProfile;
  const __dep22 = __require('./leader-uyen.ts');
  const clearQueuedUyenUlt = __dep22.clearQueuedUyenUlt;
  const hasQueuedUyenUlt = __dep22.hasQueuedUyenUlt;
  const isAnyLeaderUltReady = __dep22.isAnyLeaderUltReady;
  const isUyenLeader = __dep22.isUyenLeader;
  const grantUyenSummonRage = __dep22.grantUyenSummonRage;
};
__modules['./turns/interleaved.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./engine.ts');
  const slotIndex = __dep0.slotIndex;




  const SIDE_TO_LOWER= { ALLY: 'ally', ENEMY= { ally: 'ALLY', enemy= ['ALLY', 'ENEMY'];
  const createZeroBySide = ()=> ({ ALLY: 0, ENEMY);
  const flipSide = (side)=> (side === 'ALLY' ? 'ENEMY' : 'ALLY');
  const DEFAULT_LAST_POS= createZeroBySide();
  const DEFAULT_WRAP_COUNT= createZeroBySide();
  const SLOT_CAP = 9;
  const clampInt = (value, min, max)=> Math.max(min, Math.min(max, Math.floor(value)));
  const createEmptySlotMaps = ()=> ({ ALLY: new Map(), ENEMY) });
  const makeOrderKey = (side, slot)=> `${side}{slot}`;

  function normalizeSide(side){
    if (side === 'ENEMY') return 'ENEMY';
    if (side === 'ALLY') return 'ALLY';
    return LOWER_TO_UPPER[side /* as Side */] || 'ALLY';
  }

  function resolveSlotCount(turn){
    const raw = Number.isFinite(turn?.slotCount) ? turn?.slotCount ?? null : null;
    if (Number.isFinite(raw) && (raw ?? 0) > 0){
      return clampInt(raw ?? SLOT_CAP, 1, SLOT_CAP);
    }
    return SLOT_CAP;
  }

  function sanitizeSideCounter(
    current, number> | null | undefined,
    fallback, number>>,
  ){
    const normalized = { ...fallback };
    if (!current || typeof current !== 'object'){
      return normalized;
    }
    for (const sideKey of TURN_SIDES){
      const value = current[sideKey];
      normalized[sideKey] = Number.isFinite(value) ? value : 0;
    }
    return normalized;
  }

  function ensureTurnState(turn){
    turn.lastPos = sanitizeSideCounter(turn.lastPos, DEFAULT_LAST_POS);
    turn.wrapCount = sanitizeSideCounter(turn.wrapCount, DEFAULT_WRAP_COUNT);
    if (!Number.isFinite(turn.turnCount)){
      turn.turnCount = 0;
    }
  }

  function buildSlotMaps(tokens){
    if (!Array.isArray(tokens)) {
      return createEmptySlotMaps();
    }
    const slotMaps = createEmptySlotMaps();
    const ally = slotMaps.ALLY;
    const enemy = slotMaps.ENEMY;
    for (const unit of tokens){
      if (!unit || !unit.alive) continue;
      if (unit.side !== 'ally' && unit.side !== 'enemy') continue;
      const sideKey = LOWER_TO_UPPER[unit.side];
      const map = sideKey === 'ALLY' ? ally : enemy;
      const slot = slotIndex(unit.side, unit.cx, unit.cy);
      if (!Number.isFinite(slot)) continue;
      if (!map.has(slot)) {
        map.set(slot, unit);
      }
    }
    return slotMaps;
  }

  function isQueueDue(state, sideLower, slot, cycle){
    const queued = sideLower === 'ally' ? state.queued?.ally : state.queued?.enemy;
    if (!queued) return false;
    const entry = queued.get(slot);
    if (!entry) return false;
    return (entry.spawnCycle ?? 0) <= cycle;
  }

  function makeWrappedFlag(start, pos){
    if (!Number.isFinite(start) || start <= 0) return false;
    return pos <= start;
  }



  const toLowerSpawnSide = (side)=> (
    side === 'ALLY' ? 'ally' : side === 'ENEMY' ? 'enemy' : side
  );

  function getSequentialOrderIndex(
    state,
    side,
    slot,
  ){
    const turn = state.turn /* as SequentialTurnWithCache | null | undefined */;
    if (!turn) return -1;
    const order = Array.isArray(turn?.order) ? turn.order : null;
    if (!order) return -1;

    const normalizedSide = toLowerSpawnSide(side);
    const normalizedSlot = clampInt(Number.isFinite(slot) ? slot : 0, 0, SLOT_CAP);
    const key = makeOrderKey(normalizedSide, normalizedSlot);

    const cache = turn.orderIndexCache;
    const needsRebuild = !cache
      || cache.orderRef !== order
      || cache.size !== order.length;

    if (needsRebuild) {
      const indexByEntry = new Map();
      for (let index = 0; index < order.length; index += 1) {
        const entry = order[index];
        const entrySide = entry?.side;
        const entrySlot = entry?.slot;
        if ((entrySide !== 'ally' && entrySide !== 'enemy') || !Number.isFinite(entrySlot)) continue;
        indexByEntry.set(makeOrderKey(entrySide, Number(entrySlot)), index);
      }
      turn.orderIndexCache = { orderRef: order, size, indexByEntry };
    }

    const indexByEntry = turn.orderIndexCache?.indexByEntry;
    if (indexByEntry?.has(key)) {
      const value = indexByEntry.get(key);
      return typeof value === 'number' ? value : -1;
    }
    return -1;
  }

  function predictSpawnCycleByTurnOrder(
    state,
    side,
    slot,
  ){
    const turn = state.turn;
    if (!turn) return 0;
    const cycle = Math.max(0, Number.isFinite(turn.cycle) ? turn.cycle : 0);
    const maybeSequential = turn /* as { order: Array<{ side: string */; slot: number }>; cursor: number };
    const order = Array.isArray(maybeSequential.order) ? maybeSequential.order : null;
    if (!order) {
      return turn.mode === 'interleaved_by_position' ? cycle : cycle + 1;
    }
    if (!order.length) return cycle + 1;

    const idx = getSequentialOrderIndex(state, side, slot);
    if (idx < 0) return cycle + 1;

    const cursorRaw = Number.isFinite(maybeSequential.cursor) ? Number(maybeSequential.cursor) ;
    const cursor = clampInt(cursorRaw, 0, order.length - 1);
    return idx >= cursor ? cycle : cycle + 1;
  }

  function findNextOccupiedPos(
    state,
    side,
    startPos = 0,
    slotMaps?,
  ){
    const turn = (state.turn /* as InterleavedTurnState | null */) ?? null;
    const sideKey = normalizeSide(side);
    const sideLower = SIDE_TO_LOWER[sideKey];

    const slotCount = resolveSlotCount(turn);
    const start = Number.isFinite(startPos) ? clampInt(startPos, 0, slotCount) ;
    const unitsBySlot = slotMaps?.[sideKey] ?? buildSlotMaps(state.tokens)[sideKey];
    const cycle = Number.isFinite(turn?.cycle) ? turn!.cycle : 0;

    for (let offset = 1; offset <= slotCount; offset += 1){
      const pos = ((start + offset - 1) % slotCount) + 1;
      const wrapped = makeWrappedFlag(start, pos);
      const unit = unitsBySlot.get(pos) ?? null;
      const queued = isQueueDue(state, sideLower, pos, cycle);
      if (unit && unit.alive){
        return {
          mode: 'interleaved_by_position',
          side,
          pos,
          unit,
          unitId,
          queued,
          wrapped,
          sideKey,
          spawnOnly){
        return {
          mode: 'interleaved_by_position',
          side,
          pos,
          unit,
          unitId,
          queued,
          wrapped,
          sideKey,
          spawnOnly,
    turn= (state.turn /* as InterleavedTurnState | null */)
  ){
    if (!state || !turn) return null;

    ensureTurnState(turn);
    const slotCount = resolveSlotCount(turn);
    if (slotCount <= 0) return null;
    const sideKey = normalizeSide(turn.nextSide);
    const sideLower = SIDE_TO_LOWER[sideKey];
    const startPosRaw = Number.isFinite(turn.lastPos?.[sideKey]) ? turn.lastPos[sideKey] ;
    const startPos = clampInt(startPosRaw, 0, slotCount);
    const picked = findNextOccupiedPos(state, sideKey, startPos, buildSlotMaps(state.tokens));
    if (!picked) return null;

    turn.lastPos[sideKey] = picked.pos;
    turn.nextSide = flipSide(sideKey);

    if (picked.wrapped){
      turn.wrapCount[sideKey] = (turn.wrapCount[sideKey] ?? 0) + 1;
    }

    turn.turnCount += 1;
    const allyWrap = turn.wrapCount.ALLY ?? 0;
    const enemyWrap = turn.wrapCount.ENEMY ?? 0;
    const maxWrap = Math.max(allyWrap, enemyWrap);
    if (!Number.isFinite(turn.cycle) || turn.cycle < maxWrap){
      turn.cycle = maxWrap;
    }
    return picked;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'getSequentialOrderIndex')) exports.getSequentialOrderIndex = getSequentialOrderIndex;
  if (!Object.prototype.hasOwnProperty.call(exports, 'predictSpawnCycleByTurnOrder')) exports.predictSpawnCycleByTurnOrder = predictSpawnCycleByTurnOrder;
  if (!Object.prototype.hasOwnProperty.call(exports, 'findNextOccupiedPos')) exports.findNextOccupiedPos = findNextOccupiedPos;
};
__modules['./types/art.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/art.ts
};
__modules['./types/combat.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/combat.ts
};
__modules['./types/common.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/common.ts




};
__modules['./types/config.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/config.ts


  };




};
__modules['./types/currency.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/currency.tsextends UnknownRecord {
    id: string;
    currencyId: string;
    key: string;
    type: string;
    balance: Maybe<NumericLike>;
    amount: Maybe<NumericLike>;
    value: Maybe<NumericLike>;
    total: Maybe<NumericLike>;
  }extends UnknownRecord {
    [key: string]
      | ReadonlyArray<LineupCurrencyValue>
      | Readonly<Record<string, LineupCurrencyValue>>
      | null
      | undefined;
  }



  const isPlainRecord = (value)=> (
    value != null
    && typeof value === 'object'
    && !Array.isArray(value)
  );

  const isCurrencyEntry = (value)=> (
    isPlainRecord(value)
  );

  const isLineupCurrencyValue = (value)=> (
    value == null
    || typeof value === 'number'
    || typeof value === 'string'
    || isCurrencyEntry(value)
  );

  const isLineupCurrencyConfig = (value)=> (
    isPlainRecord(value)
  );

  const isLineupCurrencies = (value)=> {
    if (Array.isArray(value)){
      return value.every(isLineupCurrencyValue);
    }
    return isLineupCurrencyConfig(value);
  };

  const normalizeCurrencyBalances = (
    playerState,
  )=> {
    if (!isPlainRecord(playerState)){
      return null;
    }
    if (!('currencies' in playerState)){
      return null;
    }
    const { currencies } = playerState /* as { currencies: unknown } */;
    return isLineupCurrencies(currencies) ? (currencies ?? null) ;
  };
  if (!Object.prototype.hasOwnProperty.call(exports, 'isCurrencyEntry')) exports.isCurrencyEntry = isCurrencyEntry;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isLineupCurrencyConfig')) exports.isLineupCurrencyConfig = isLineupCurrencyConfig;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isLineupCurrencies')) exports.isLineupCurrencies = isLineupCurrencies;
  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeCurrencyBalances')) exports.normalizeCurrencyBalances = normalizeCurrencyBalances;
};
__modules['./types/index.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/index.ts













};
__modules['./types/lineup.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/lineup.tsextends UnknownRecord {
    id: string | number | null;
    key: string | number | null;
    name: string | null;
    title: string | null;
    class: string | null;
    role: string | null;
    archetype: string | null;
    rank: string | null;
    tier: string | null;
    tags: ReadonlyArray<unknown> | null;
    labels: ReadonlyArray<unknown> | null;
    power: number | string | null;
    cp: number | string | null;
    avatar: string | null;
    icon: string | null;
    portrait: string | null;
    passives: ReadonlyArray<unknown> | null;
    kit: UnknownRecord | null;
  }extends UnknownRecord {
    unitId: string | null;
    id: string | number | null;
    key: string | number | null;
    name: string | null;
    title: string | null;
    label: string | null;
    unlocked: boolean | null;
    cost: LineupCurrencyValue | ReadonlyArray<LineupCurrencyValue> | null;
    unlockCost: LineupCurrencyValue | ReadonlyArray<LineupCurrencyValue> | null;
    equipment: UnknownRecord | null;
  }extends UnknownRecord {
    id: string | number | null;
    key: string | number | null;
    name: string | null;
    title: string | null;
    description: string | null;
    effect: string | null;
    text: string | null;
    requirement: string | null;
    condition: string | null;
    prerequisite: string | null;
    requiredUnitIds: ReadonlyArray<string | number | null | undefined> | null;
    requiredUnitId: string | number | null;
    requires: ReadonlyArray<unknown> | null;
    requiredTags: ReadonlyArray<unknown> | null;
    tagsRequired: ReadonlyArray<unknown> | null;
    autoActive: boolean | null;
    alwaysActive: boolean | null;
    isActive: boolean | null;
  }extends UnknownRecord {
    id: string | number | null;
    key: string | number | null;
    name: string | null;
    title: string | null;
    role: string | null;
    type: string | null;
    description: string | null;
    summary: string | null;
    slots: ReadonlyArray<LineupMemberConfig | string | null | undefined> | null;
    members: ReadonlyArray<LineupMemberConfig | string | null | undefined> | null;
    bench: ReadonlyArray<LineupMemberConfig | string | null | undefined> | null;
    reserve: ReadonlyArray<LineupMemberConfig | string | null | undefined> | null;
    passives: ReadonlyArray<LineupPassiveConfig | null | undefined> | null;
    passiveSlots: ReadonlyArray<LineupPassiveConfig | null | undefined> | null;
    slotCosts: ReadonlyArray<LineupCurrencyValue | null | undefined> | null;
    unlockCosts: ReadonlyArray<LineupCurrencyValue | null | undefined> | null;
    slotCost: LineupCurrencyValue | null;
    unlockCost: LineupCurrencyValue | null;
    unlockCurrency: string | null;
    currencyId: string | null;
    defaultCurrencyId: string | null;
    benchSize: number | string | null;
    initialUnlockedSlots: number | string | null;
    leaderId: string | null;
    lineupId: string | null;
    leader: string | null;
    captainId: string | null;
    currency: string | null;
  }
};
__modules['./types/pve.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/pve.ts



  6


  };extends UnknownRecord {
    HP: number | string | null;
    hp: number | string | null;
    HPMax: number | string | null;
    hpMax: number | string | null;
    ATK: number | string | null;
    atk: number | string | null;
    WIL: number | string | null;
    wil: number | string | null;
    RES: number | string | null;
    res: number | string | null;
    ARM: number | string | null;
    arm: number | string | null;
  }extends UnknownRecord {
    id: string | null;
    name: string | null;
    label: string | null;
    color: string | null;
    isMinion: boolean | null;
    ttl: number | string | null;
    ttlTurns: number | string | null;
    skinKey: string | null;
  }extends UnknownRecord {
    pattern: string;
    placement: string;
    patternKey: string;
    shape: string;
    area: string;
    slots: ReadonlyArray<number>;
    count: number | string | null;
    summonCount: number | string | null;
    ttl: number | string | null;
    ttlTurns: number | string | null;
    inherit: SummonInheritSpec | null;
    limit: number | string | null;
    replace: string;
    creep: SummonCreepSpec | null;
  }
};
__modules['./types/rng.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/rng.tsextends UnknownRecord {
    seed: number;
    calls: number;
    history: number[];
    [extra: string];
  }
};
__modules['./types/telemetry.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/telemetry.ts
};
__modules['./types/turn-order.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/turn-order.ts
};
__modules['./types/ui.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/ui.ts
};
__modules['./types/units.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/units.ts
};
__modules['./types/utils.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/utils.ts














};
__modules['./types/vfx.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/types/vfx.ts

    timing: string;
    radius: number;
  };


    anchors: VfxAnchor[];
  };


    bodyAnchors: Record<string, { x: number; y: number }>;
    vfxBindings: Record<string, VfxBinding>;
    ambientEffects: Record<string, VfxBinding>;
  };
};
__modules['./ui.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/ui.ts
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
  const HUD_EVENT_TYPES = [TURN_START, TURN_END, ACTION_END] /* /* as const */ */;
  const SUMMON_BAR_RERENDER_EVENTS = HUD_EVENT_TYPES;

  function canQuery(node){
    return !!node && typeof (node /* as QueryableRoot */).querySelector === 'function';
  }

  function initHUD(doc, root?){
    const queryFromRoot = (id)=> {
      if (canQuery(root)){
        const el = root.querySelector(`#${id}`);
        if (el) return el;
      }
      return null;
    };

    const costNow = queryFromRoot('costNow') || doc.getElementById('costNow');
    const costRing = queryFromRoot('costRing') || doc.getElementById('costRing');
    const costChip = queryFromRoot('costChip') || doc.getElementById('costChip');
    const bottomHud = queryFromRoot('bottomHUD') || doc.getElementById('bottomHUD');
    let combatReason = queryFromRoot('combatReason') || doc.getElementById('combatReason');

    if (!combatReason && bottomHud) {
      const node = doc.createElement('div');
      node.id = 'combatReason';
      node.className = 'chip chip-combat-reason';
      node.textContent = '';
      node.title = '';
      node.setAttribute('aria-live', 'polite');
      bottomHud.appendChild(node);
      combatReason = node;
    }

    const update = (Game)=> {
      if (!Game) return;

      const capRaw = Game.costCap ?? CFG.COST_CAP ?? 30;
      const cap = Number.isFinite(capRaw) && capRaw > 0 ? capRaw : 1;
      const now = Math.max(0, Math.floor(Game.cost ?? 0));
      const ratio = Math.max(0, Math.min(1, now / cap));

      if (costNow) costNow.textContent = String(now);
      if (costRing){
        const deg = `${(ratio * 360).toFixed(1)}deg`;
        costRing.style.setProperty('--deg', deg);
      }
      if (costChip){
        costChip.classList.toggle('full', now >= cap);
      }
    };

    const handleGameEvent = (event) => {
      const detail = event.detail /* as { */
        game: HudGameLike;
        damageSummary: string | null;
        damageContext: {
          finalDamage: number;
          classBonus: number;
          elementBonus: number;
          synergyBonus: number;
          defenderKey: string | null;
        } | null;
      } | undefined;
      const state = detail?.game ?? null;
      if (state) update(state);

      if (event.type === ACTION_END && combatReason) {
        const summary = typeof detail?.damageSummary === 'string' ? detail.damageSummary : '';
        if (summary) {
          combatReason.textContent = summary;
          combatReason.title = summary;
        } else {
          const ctx = detail?.damageContext;
          if (ctx && Number.isFinite(ctx.finalDamage)) {
            const fallback = `Hit ${ctx.defenderKey ?? 'target'} ${Math.floor(Number(ctx.finalDamage))} dmg`;
            combatReason.textContent = fallback;
            combatReason.title = fallback;
          }
        }
      }
    };

    let cleanedUp = false;
    const disposers=> void> = [];
    const cleanup = ()=> {
      if (cleanedUp) return;
      cleanedUp = true;
      while (disposers.length > 0){
        const dispose = disposers.pop();
        if (dispose){
          dispose();
        }
      }
    };

    if (gameEvents){
      for (const type of HUD_EVENT_TYPES){
        disposers.push(addGameEventListener(type, handleGameEvent));
      }
    }

    return { update, cleanup } /* satisfies HudHandles */;
  }

  function debounce(fn) => void, wait){
    let timer= null;

    const debounced = (...args)=> {
      if (timer){
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = null;
        fn(...args);
      }, wait);
    };

    debounced.cancel = ()=> {
      if (timer){
        clearTimeout(timer);
        timer = null;
      }
    };

    debounced.flush = (...args)=> {
      if (timer){
        clearTimeout(timer);
        timer = null;
      }
      fn(...args);
    };

    return debounced;
  }

  function startSummonBar(
    doc,
    options?,
    root?,
  ){
    const {
      onPick = () => {},
      canAfford = () => true,
      getDeck = () => [] /* as ReadonlyArray<TCard> */,
      getSelectedId = () => null,
    } = options ?? {};

    const queryFromRoot = (selector, id?)=> {
      if (canQuery(root)){
        const el = root.querySelector(selector);
        if (el) return el;
      }
      if (id && typeof doc.getElementById === 'function'){
        return doc.getElementById(id) /* as T | null */;
      }
      return null;
    };

    const hostElement = queryFromRoot('#cards', 'cards');
    if (!hostElement){
      return { render: () => {}, cleanup) => {} } /* satisfies SummonBarHandles */;
    }
    const host = assertElement(hostElement, {
      guard: (node)=> node instanceof HTMLElement,
      message,
    });

    const btns= [];
    const cleanupFns=> void> = [];
    let cleanedUp = false;
    const cleanup = ()=> {
      if (cleanedUp) return;
      cleanedUp = true;
      while (cleanupFns.length > 0){
        const dispose = cleanupFns.pop();
        try {
          dispose?.();
        } catch {}
      }
    };

    host.innerHTML = '';
    cleanupFns.push(() => {
      btns.length = 0;
      host.innerHTML = '';
    });

    const handleHostClick = (event)=> {
      const target = event.target instanceof Element
        ? event.target
        : event.currentTarget instanceof Element
          ? event.currentTarget
          : null;
      const btn = target ? target.closest('button.card') ;
      if (!btn || btn.disabled || !host.contains(btn)) return;

      const deck = getDeck();
      const targetId = btn.dataset.id;
      if (!targetId) return;
      const card = deck.find((c) => c.id === targetId);
      if (!card || !canAfford(card)) return;

      onPick(card);
      for (let i = 0; i < btns.length; i += 1) {
        const node = btns[i];
        if (!node) continue;
        node.classList.toggle('active', node === btn);
      }
    };
    host.addEventListener('click', handleHostClick);
    cleanupFns.push(() => host.removeEventListener('click', handleHostClick));

    const gap = CFG.UI?.CARD_GAP ?? 12;
    const minSize = CFG.UI?.CARD_MIN ?? 40;
    const boardEl = queryFromRoot('#board', 'board');

    const syncCardSize = debounce(() => {
      if (!boardEl) return;
      const rect = boardEl.getBoundingClientRect();
      const width = boardEl.clientWidth || rect.width || 0;
      const cell = Math.max(minSize, Math.floor((width - gap * 6) / 7));
      host.style.setProperty('--cell', `${cell}px`);
    }, 120);
    syncCardSize.flush();

    let cleanupResize=> void = () => {};
    if (boardEl && typeof ResizeObserver === 'function'){
      const observer = new ResizeObserver(() => syncCardSize());
      observer.observe(boardEl);
      cleanupResize = ()=> {
        observer.disconnect();
        syncCardSize.cancel();
      };
    } else {
      const handleResize = ()=> syncCardSize();
      if (typeof window !== 'undefined'){
        window.addEventListener('resize', handleResize);
        cleanupResize = ()=> {
          if (typeof window !== 'undefined'){
            window.removeEventListener('resize', handleResize);
          }
          syncCardSize.cancel();
        };
      } else {
        cleanupResize = ()=> {
          syncCardSize.cancel();
        };
      }
    }
    cleanupFns.push(() => cleanupResize());

    let removalObserver= null;
    if (host && typeof MutationObserver === 'function'){
      const parentNode = host.parentNode;
      const rootNode = typeof host.getRootNode === 'function' ? host.getRootNode() ;

      let observerTarget= null;
      if (parentNode && parentNode.nodeType !== Node.DOCUMENT_NODE){
        observerTarget = parentNode;
      } else if (rootNode instanceof ShadowRoot || rootNode instanceof DocumentFragment){
        observerTarget = rootNode;
      }

      if (observerTarget){
        removalObserver = new MutationObserver(() => {
          if (!host.isConnected){
            cleanup();
          }
        });
        removalObserver.observe(observerTarget, { childList: true });
        cleanupFns.push(() => {
          removalObserver?.disconnect();
          removalObserver = null;
        });
      }
    }

    const resolveCardCost = (card)=> {
      if (!card) return 0;
      const raw = card.cost;
      if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
      if (typeof raw === 'string') {
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    };

    const makeBtn = (card)=> {
      const btn = doc.createElement('button');
      btn.className = 'card';
      btn.dataset.id = card.id;
      btn.innerHTML = `<span class="cost">${resolveCardCost(card)}</span>`;
      const affordable = canAfford(card);
      btn.disabled = !affordable;
      btn.classList.toggle('disabled', !affordable);
      return btn;
    };

    const render = ()=> {
      const deck = getDeck();

      for (const [index, card] of deck.entries()){
        if (!btns[index] && card){
          const btn = makeBtn(card);
          host.appendChild(btn);
          btns[index] = btn;
        }

        const button = btns[index];
        if (!button) break;

        if (!card){
          button.hidden = true;
          button.dataset.id = '';
          button.disabled = true;
          button.classList.remove('active');
          continue;
        }

        button.hidden = false;
        button.dataset.id = card.id;
        const span = button.querySelector('.cost');
        if (span) span.textContent = String(resolveCardCost(card));
        const affordable = canAfford(card);
        button.disabled = !affordable;
        button.classList.toggle('disabled', !affordable);
        button.style.opacity = '';
        button.classList.toggle('active', getSelectedId() === card.id);
      }

      const previousLength = btns.length;
      if (previousLength > deck.length){
        for (let i = deck.length; i < previousLength; i += 1){
          const button = btns[i];
          if (!button) continue;
          button.hidden = true;
          button.dataset.id = '';
          button.disabled = true;
          button.classList.remove('active');
          button.remove();
        }
        btns.length = deck.length;
      }
    };

    if (gameEvents){
      const rerender = ()=> render();
      for (const type of SUMMON_BAR_RERENDER_EVENTS){
        const dispose = addGameEventListener(type, () => rerender());
        if (typeof dispose === 'function'){
          cleanupFns.push(() => dispose());
        }
      }
    }

    return { render, cleanup } /* satisfies SummonBarHandles */;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'initHUD')) exports.initHUD = initHUD;
  if (!Object.prototype.hasOwnProperty.call(exports, 'startSummonBar')) exports.startSummonBar = startSummonBar;
};
__modules['./ui/dom.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/ui/dom.ts
  const DEFAULT_ASSERT_MESSAGE = 'Cần một phần tử DOM hợp lệ.';
};
__modules['./unit-stat-resolver.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./meta.ts');
  const Meta = __dep0.Meta;
  const makeInstanceStats = __dep0.makeInstanceStats;
  const __dep1 = __require('./data/roster-preview.ts');
  const TP_DELTA = __dep1.TP_DELTA;
  const __dep2 = __require('./cultivation.ts');
  const applyCultivationBonus = __dep2.applyCultivationBonus;
  const __dep3 = __require('./utils/equipment.ts');
  const applyEquipmentTpAllocationToInstanceStats = __dep3.applyEquipmentTpAllocationToInstanceStats;

  const INSTANCE_STAT_BY_TP_STAT= Object.freeze({
    HP: 'hpMax',
    ATK,
    WIL,
    ARM,
    RES,
    AGI,
    PER,
    AEmax,
    AEregen,
    HPregen,
  });

  function normalizeInteger(value, min, fallback){
    const numeric = typeof value === 'number' && Number.isFinite(value) ? value : null;
    if (numeric == null) return fallback;
    return Math.max(min, Math.floor(numeric));
  }

  function applyTpAllocToInstanceStats(
    stats,
    tpAlloc,
  ){
    if (!tpAlloc) return stats;
    let out= null;
    for (const [stat, amount] of Object.entries(tpAlloc)) {
      const delta = TP_DELTA[stat];
      const instanceKey = INSTANCE_STAT_BY_TP_STAT[stat];
      if (typeof delta !== 'number' || !instanceKey || !Number.isFinite(amount) || amount === 0) continue;
      if (!out) out = { ...stats };
      const bonus = delta * amount;
      out[instanceKey] = (out[instanceKey] ?? 0) + bonus;
      if (instanceKey === 'hpMax') {
        out.hp = (out.hp ?? 0) + bonus;
      }
    }
    return out ?? stats;
  }



  function resolveFinalCollectionUnitStats(params){
    const { unitId, progress } = params;
    const level = normalizeInteger(progress?.level, 1, 1);
    const realm = normalizeInteger(progress?.realm, 0, 0);
    const subRealm = normalizeInteger(progress?.subRealm, 0, 0);
    const stars = normalizeInteger(progress?.stars, 0, 0);
    const baseStats = Meta.get(unitId) ? makeInstanceStats(unitId, level, stars) ;
    const allocatedStats = applyEquipmentTpAllocationToInstanceStats(
      applyTpAllocToInstanceStats(baseStats, progress?.tpAlloc),
      progress?.equipment,
    );
    const cultivatedStats = applyCultivationBonus({
      ...allocatedStats,
      id,
      hasCultivationData,
      realm,
      subRealm,
    });
    const { id: _id, hasCultivationData, ...stats } = cultivatedStats;
    return {
      ...stats,
      level,
      realm,
      subRealm,
      stars,
    };
  }


  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveFinalCollectionUnitStats')) exports.resolveFinalCollectionUnitStats = resolveFinalCollectionUnitStats;
};
__modules['./units.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/units.ts
  const __dep0 = __require('./data/cost-budget.ts');
  const deriveBudgetFromRankRole = __dep0.deriveBudgetFromRankRole;
  const evaluateCostBudget = __dep0.evaluateCostBudget;
  const mergeBudgetInputs = __dep0.mergeBudgetInputs;
};
__modules['./utils/assert.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/utils/assert.ts
  function assertDefined(value, message?){
    if (value === undefined || value === null) {
      throw new Error(message ?? 'Giá trị mong đợi phải được định nghĩa.');
    }
    return value;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'assertDefined')) exports.assertDefined = assertDefined;
};
__modules['./utils/audio-settings.ts'] = (exports, module, __require) => {
  const AUDIO_ENABLED_STORAGE_KEY = 'arclune.audio.enabled';

  function isAudioEnabled(){
    try {
      return localStorage.getItem(AUDIO_ENABLED_STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  }

  function setAudioEnabled(enabled){
    try {
      localStorage.setItem(AUDIO_ENABLED_STORAGE_KEY, String(enabled));
    } catch {
      // Ignore storage failures; callers still use the in-memory value they just set.
    }
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'AUDIO_ENABLED_STORAGE_KEY')) exports.AUDIO_ENABLED_STORAGE_KEY = AUDIO_ENABLED_STORAGE_KEY;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isAudioEnabled')) exports.isAudioEnabled = isAudioEnabled;
  if (!Object.prototype.hasOwnProperty.call(exports, 'setAudioEnabled')) exports.setAudioEnabled = setAudioEnabled;
};
__modules['./utils/currency.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/utils/currency.ts
  const __dep0 = __require('./data/economy.ts');
  const CURRENCY_ORDER = __dep0.CURRENCY_ORDER;
  const convertCurrencyInternal */ = __dep0.convertCurrency /*;
  const formatBalance = __dep0.formatBalance;
  const getCurrency = __dep0.getCurrency;
  const listCurrencies = __dep0.listCurrencies;
  const getInitialWallet = __dep0.getInitialWallet;
};
__modules['./utils/domain-normalization.ts'] = (exports, module, __require) => {
  const ELEMENT_KEYS = [
    'fire',
    'metal',
    'wood',
    'earth',
    'lightning',
    'blood',
    'water',
    'light',
    'dark',
    'wind',
    'neutral',
  ] /* /* as const */ */;



  const ELEMENT_KEY_SET = new Set(ELEMENT_KEYS);

  const ELEMENT_ALIAS_MAP= {
    fire: 'fire',
    hoa,
    hoả: 'fire',
    hỏa: 'fire',
    metal,
    kim,
    wood,
    moc,
    mộc: 'wood',
    earth,
    tho,
    thổ: 'earth',
    lightning,
    loi,
    lôi: 'lightning',
    blood,
    huyet,
    huyết: 'blood',
    water,
    thuy,
    thủy: 'water',
    light,
    quang,
    anhsang,
    'anh sang': 'light',
    'ánh sáng': 'light',
    dark,
    am,
    ám: 'dark',
    wind,
    phong,
    neutral,
    vohe,
    'vo-he': 'neutral',
    vo,
    none,
  };

  const CLASS_NAME_MAP = {
    mage: 'Mage',
    tanker,
    ranger,
    archer,
    warrior,
    summoner,
    support,
    assassin,
  } /* /* as const */ */;



  const normalizeText = (value)=> {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  function normalizeElementKey(value){
    const normalized = normalizeText(value);
    if (!normalized) return null;
    const alias = ELEMENT_ALIAS_MAP[normalized];
    if (alias) return alias;
    return ELEMENT_KEY_SET.has(normalized) ? (normalized /* as ElementKey */) ;
  }

  function normalizeElementList(values){
    if (!Array.isArray(values)) return [];
    const out= [];
    for (const item of values) {
      const key = normalizeElementKey(item);
      if (!key || out.includes(key)) continue;
      out.push(key);
    }
    return out;
  }

  function normalizeClassName(value){
    const normalized = normalizeText(value);
    if (!normalized) return null;
    return CLASS_NAME_MAP[normalized /* as keyof typeof CLASS_NAME_MAP */] ?? null;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeElementKey')) exports.normalizeElementKey = normalizeElementKey;
  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeElementList')) exports.normalizeElementList = normalizeElementList;
  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeClassName')) exports.normalizeClassName = normalizeClassName;
};
__modules['./utils/dummy.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/utils/dummy.ts
  function ensureNestedModuleSupport(){
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'ensureNestedModuleSupport')) exports.ensureNestedModuleSupport = ensureNestedModuleSupport;
};
__modules['./utils/equipment.ts'] = (exports, module, __require) => {


  const TP_ALLOCATABLE_KEYS = ['HP', 'ATK', 'WIL', 'ARM', 'RES'] /* /* as const */ */;
  if (!Object.prototype.hasOwnProperty.call(exports, 'TP_ALLOCATABLE_KEYS')) exports.TP_ALLOCATABLE_KEYS = TP_ALLOCATABLE_KEYS;
};
__modules['./utils/format.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/utils/format.ts
  const HAS_INTL_NUMBER_FORMAT = typeof Intl === 'object' && typeof Intl.NumberFormat === 'function';
};
__modules['./utils/frame-rate.ts'] = (exports, module, __require) => {


  const STORAGE_KEY = 'arclune.frameRateCap';
  const DEFAULT_FRAME_RATE_CAP= 60;

  const canUseLocalStorage = ()=> (
    typeof window !== 'undefined' && !!window.localStorage
  );

  const normalizeFrameRateCap = (value)=> (
    value === 30 || value === '30' ? 30 : DEFAULT_FRAME_RATE_CAP
  );

  function getFrameRateCap(){
    if (!canUseLocalStorage()) return DEFAULT_FRAME_RATE_CAP;
    return normalizeFrameRateCap(window.localStorage.getItem(STORAGE_KEY));
  }

  function setFrameRateCap(value){
    if (!canUseLocalStorage()) return;
    window.localStorage.setItem(STORAGE_KEY, String(normalizeFrameRateCap(value)));
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'getFrameRateCap')) exports.getFrameRateCap = getFrameRateCap;
  if (!Object.prototype.hasOwnProperty.call(exports, 'setFrameRateCap')) exports.setFrameRateCap = setFrameRateCap;
};
__modules['./utils/fury.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/utils/fury.ts
  const __dep0 = __require('./config.ts');
  const CFG = __dep0.CFG;
  const __dep1 = __require('./utils/time.ts');
  const safeNow = __dep1.safeNow;



  const DEFAULT_TURN_CAP = 40;
  const DEFAULT_SKILL_CAP = 30;
  const DEFAULT_HIT_CAP = 20;
  const TURN_GRANT_KEY = Symbol('turn');

  const isFiniteNumber = (value)=>
    typeof value === 'number' && Number.isFinite(value);

  function toNumber(value){
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  function ensureAlias(unit){
    if (!unit) return;
    const internal = unit /* as UnitTokenInternal */;
    const rageValue = toNumber(internal.rage);
    if (!isFiniteNumber(internal.fury) && Number.isFinite(rageValue)){
      internal.fury = rageValue;
    }
    if (!isFiniteNumber(internal.fury)) internal.fury = 0;
    try {
      const desc = Object.getOwnPropertyDescriptor(internal, 'rage');
      if (!desc || (!desc.get && !desc.set)){
        Object.defineProperty(internal, 'rage', {
          configurable: true,
          enumerable,
          get(){ return toNumber((internal /* as UnitTokenInternal */).fury); },
          set(v){ internal.fury = toNumber(v); }
        });
      } else {
        internal.rage = toNumber(internal.fury);
      }
    } catch (_) {
      internal.rage = toNumber(internal.fury);
    }
  }

  function ensureState(unit){
    if (!unit) return null;
    ensureAlias(unit);
    const internal = unit /* as UnitTokenInternal */;
    if (!internal._furyState){
      internal._furyState = {
        turnGain: 0,
        skillGain,
        hitGain,
        skillPerTargetGain,
        skillDrain,
        turnStamp,
        skillTag,
        freshSummon,
        lastStart)
      } /* satisfies FuryState */;
    }
    return internal._furyState ?? null;
  }

  function resolveMaxFury(unitId, cfg= CFG){
    const furyCfg = ((cfg?.fury ?? {}) /* as FuryConfigLike */);
    const special = (furyCfg.specialMax /* as Record<string */, unknown> | undefined) ?? {};
    const entry = unitId ? special[unitId] ;
    if (isFiniteNumber(entry)) return entry;
    if (entry && typeof entry === 'object'){
      const entryObj = entry /* as Record<string */, unknown>;
      if (isFiniteNumber(entryObj.max)) return Math.floor(entryObj.max);
      if (isFiniteNumber(entryObj.value)) return Math.floor(entryObj.value);
    }
    if (isFiniteNumber(furyCfg.max)) return Math.floor(furyCfg.max);
    const baseMaxValue = (furyCfg /* as Record<string */, unknown>).baseMax;
    if (isFiniteNumber(baseMaxValue)){
      return Math.floor(Number(baseMaxValue));
    }
    return 100;
  }

  function resolveUltCost(unit, cfg= CFG){
    if (!unit) return resolveMaxFury(null, cfg);
    const furyCfg = ((cfg?.fury ?? {}) /* as FuryConfigLike */);
    const special = (furyCfg.specialMax /* as Record<string */, unknown> | undefined) ?? {};
    const entry = special[unit.id];
    if (entry && typeof entry === 'object'){
      const entryObj = entry /* as Record<string */, unknown>;
      if (isFiniteNumber(entryObj.ultCost)) return Math.floor(entryObj.ultCost);
    }
    if (isFiniteNumber(furyCfg.ultCost)) return Math.floor(furyCfg.ultCost);
    return isFiniteNumber(unit.furyMax) ? Math.floor(unit.furyMax) ;
  }

  function initializeFury(
    unit,
    unitId,
    initial = 0,
    cfg= CFG
  ){
    if (!unit) return;
    const max = resolveMaxFury(unitId, cfg);
    unit.furyMax = isFiniteNumber(max) && max > 0 ? Math.max(1, Math.floor(max)) ;
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
    const max = isFiniteNumber(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, CFG);
    const amount = Math.max(0, Math.min(max, Math.floor(toNumber(value))));
    unit.fury = amount;
    unit.rage = amount;
    return amount;
  }

  function resolveTurnCap(cfg){
    const furyCfg = ((cfg?.fury ?? {}) /* as FuryConfigLike */);
    if (isFiniteNumber(furyCfg.turnCap)) return Math.floor(furyCfg.turnCap);
    const caps = furyCfg.caps /* as Record<string */, unknown> | undefined;
    if (caps && isFiniteNumber(caps.perTurn)) return Math.floor(caps.perTurn);
    const turn = furyCfg.turn /* as Record<string */, unknown> | undefined;
    if (turn && isFiniteNumber(turn.cap)) return Math.floor(turn.cap);
    return DEFAULT_TURN_CAP;
  }

  function resolveSkillCap(cfg){
    const furyCfg = ((cfg?.fury ?? {}) /* as FuryConfigLike */);
    if (isFiniteNumber(furyCfg.skillCap)) return Math.floor(furyCfg.skillCap);
    const caps = furyCfg.caps /* as Record<string */, unknown> | undefined;
    if (caps && isFiniteNumber(caps.perSkill)) return Math.floor(caps.perSkill);
    const skill = furyCfg.skill /* as Record<string */, unknown> | undefined;
    if (skill && isFiniteNumber(skill.cap)) return Math.floor(skill.cap);
    return DEFAULT_SKILL_CAP;
  }

  function resolveHitCap(cfg){
    const furyCfg = ((cfg?.fury ?? {}) /* as FuryConfigLike */);
    if (isFiniteNumber(furyCfg.hitCap)) return Math.floor(furyCfg.hitCap);
    const caps = furyCfg.caps /* as Record<string */, unknown> | undefined;
    if (caps && isFiniteNumber(caps.perHit)) return Math.floor(caps.perHit);
    const hit = furyCfg.hit /* as Record<string */, unknown> | undefined;
    if (hit && isFiniteNumber(hit.cap)) return Math.floor(hit.cap);
    return DEFAULT_HIT_CAP;
  }

  function resolveGainAmount(
    spec= {},
    cfg= CFG,
    state= null
  ){
    if (isFiniteNumber(spec.amount)){
      return { amount: Math.floor(spec.amount), perTarget= ((cfg?.fury ?? {}) /* as FuryConfigLike */);
    const table = (furyCfg.gain /* as Record<string */, unknown> | undefined) ?? {};
    const type = spec.type ?? 'generic';

    if (type === 'turnStart'){
      const turnStart = table.turnStart /* as { amount: unknown } | undefined */;
      const amount = isFiniteNumber(turnStart?.amount)
        ? turnStart!.amount
        : (()=> {
            const turn = furyCfg.turn /* as Record<string */, unknown> | undefined;
            if (turn && isFiniteNumber(turn.startGain)) return turn.startGain;
            const fallback = (furyCfg /* as Record<string */, unknown>).startGain;
            if (isFiniteNumber(fallback)) return Number(fallback);
            return 0;
          })();
      return { amount: Math.floor(Math.max(0, amount ?? 0)), perTarget=== 'damageTaken'){
      const mode = (table.damageTaken /* as Record<string */, unknown> | undefined) ?? {};
      let total = isFiniteNumber(spec.base)
        ? spec.base
        : isFiniteNumber(mode.base)
          ? Number(mode.base)
          ;
      const ratio = isFiniteNumber(mode.selfRatio) ? Number(mode.selfRatio) ;
      const taken = isFiniteNumber(spec.damageTaken)
        ? spec.damageTaken
        : isFiniteNumber(spec.dealt)
          ? spec.dealt
          : undefined;
      if (ratio && isFiniteNumber(taken) && isFiniteNumber(spec.selfMaxHp) && spec.selfMaxHp > 0){
        total += Math.round((ratio * Math.max(0, taken ?? 0)) / spec.selfMaxHp);
      }
      if (isFiniteNumber(mode.min)) total = Math.max(Number(mode.min), total);
      if (isFiniteNumber(mode.max)) total = Math.min(Number(mode.max), total);
      if (isFiniteNumber(spec.bonus)) total += spec.bonus;
      if (isFiniteNumber(spec.multiplier)) total *= spec.multiplier;
      return { amount: Math.floor(Math.max(0, total)), perTarget= !!spec.isAoE || (isFiniteNumber(spec.targetsHit) && (spec.targetsHit ?? 0) > 1);
    const mode = (isAoE
      ? (table.dealAoePerTarget /* as Record<string */, unknown> | undefined)
      {};
    let total = isFiniteNumber(spec.base)
      ? spec.base
      : isFiniteNumber(mode.base)
        ? Number(mode.base)
        ;
    if (spec.isCrit && isFiniteNumber(mode.crit)) total += Number(mode.crit);
    if (spec.isKill && isFiniteNumber(mode.kill)) total += Number(mode.kill);

    let perTargetApplied = 0;
    if (isFiniteNumber(spec.targetsHit) && spec.targetsHit > 0 && isFiniteNumber(mode.perTarget)){
      const desired = Number(mode.perTarget) * spec.targetsHit;
      const used = state?.skillPerTargetGain ?? 0;
      const room = Math.max(0, 12 - used);
      const granted = Math.max(0, Math.min(desired, room));
      total += granted;
      perTargetApplied = granted;
    }

    const ratio = isFiniteNumber(mode.targetRatio) ? Number(mode.targetRatio) ;
    if (
      ratio &&
      isFiniteNumber(spec.dealt) &&
      isFiniteNumber(spec.targetMaxHp) &&
      (spec.targetMaxHp ?? 0) > 0
    ){
      total += Math.round((ratio * Math.max(0, spec.dealt ?? 0)) / spec.targetMaxHp);
    }

    if (isFiniteNumber(mode.min)) total = Math.max(Number(mode.min), total);
    if (isFiniteNumber(mode.max)) total = Math.min(Number(mode.max), total);
    if (isFiniteNumber(spec.bonus)) total += spec.bonus;
    if (isFiniteNumber(spec.multiplier)) total *= spec.multiplier;

    return { amount: Math.floor(Math.max(0, total)), perTarget, amount){
    if (!unit) return amount;
    const internal = unit /* as UnitTokenInternal */;
    const bonus = toNumber(internal.furyGainBonus ?? internal.rageGainBonus);
    if (bonus !== 0) return Math.floor(Math.max(0, amount * (1 + bonus)));
    return amount;
  }

  function startFuryTurn(unit, opts= {}){
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
      const furyCfg = ((CFG?.fury ?? {}) /* as FuryConfigLike */);
      const gainCfg = (furyCfg.gain /* as Record<string */, unknown> | undefined)?.turnStart /* as | { amount: unknown } */
        | undefined;
      const baseStart = isFiniteNumber(gainCfg?.amount)
        ? gainCfg!.amount
        : (()=> {
            const turn = furyCfg.turn /* as Record<string */, unknown> | undefined;
            if (turn && isFiniteNumber(turn.startGain)) return turn.startGain;
            return isFiniteNumber((furyCfg /* as Record<string */, unknown>).startGain)
              ? Number((furyCfg /* as Record<string */, unknown>).startGain)
              ;
          })();
      const startAmount = isFiniteNumber(opts.startAmount) ? opts.startAmount : baseStart;
      if ((startAmount ?? 0) > 0){
        gainFury(unit, { amount: startAmount, type);
      }
    }
  }

  function startFurySkill(
    unit,
    { tag = null, forceReset = false }{ tag: string | null; forceReset: boolean } = {}
  ){
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

  function gainFury(
    unit,
    spec= {},
    cfg= CFG
  ){
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

    const max = isFiniteNumber(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, cfg);
    const currentFury = Math.floor(unit.fury ?? 0);
    const next = Math.max(0, Math.min(max, currentFury + amount));
    const gained = next - currentFury;
    if (gained <= 0) return 0;
    unit.fury = next;
    unit.rage = next;
    state.turnGain += gained;
    state.skillGain += gained;
    state.hitGain += gained;
    if (perTarget > 0 && rawBeforeBonus > 0){
      const ratio = amount > 0 ? Math.min(1, gained / amount) ;
      if (ratio > 0){
        const applied = Math.min(perTarget, Math.round(perTarget * ratio));
        state.skillPerTargetGain = Math.min(12, (state.skillPerTargetGain ?? 0) + applied);
      }
    }
    return gained;
  }

  function spendFury(unit, amount, cfg= CFG){
    if (!unit) return 0;
    ensureAlias(unit);
    const amt = Math.max(0, Math.floor(toNumber(amount)));
    const before = Math.floor(unit.fury ?? 0);
    const next = Math.max(0, before - amt);
    unit.fury = next;
    unit.rage = next;
    return before - next;
  }

  function drainFury(
    source,
    target,
    opts= {},
    cfg= CFG
  ){
    if (!target) return 0;
    ensureAlias(target);
    const targetState = ensureState(target);
    if (targetState?.freshSummon) return 0;
    const furyCfg = ((cfg?.fury ?? {}) /* as FuryConfigLike */);
    const drainCfg = (furyCfg.drain /* as Record<string */, unknown> | undefined) ?? {};
    const base = isFiniteNumber(opts.base)
      ? opts.base
      : isFiniteNumber(drainCfg.perTargetBase)
        ? Number(drainCfg.perTargetBase)
        ;
    const percent = isFiniteNumber(opts.percent)
      ? opts.percent
      : isFiniteNumber(drainCfg.perTargetPct)
        ? Number(drainCfg.perTargetPct)
        ;
    const skillCap = isFiniteNumber(opts.skillTotalCap)
      ? opts.skillTotalCap
      : isFiniteNumber(drainCfg.skillTotalCap)
        ? Number(drainCfg.skillTotalCap)
        ;

    const current = Math.max(0, Math.floor(target.fury ?? 0));
    if (current <= 0) return 0;

    let desired = Math.max(0, Math.floor(base ?? 0));
    if (percent) desired += Math.round(current * percent);
    if (desired <= 0) return 0;

    let capRoom = desired;
    let sourceState= null;
    if (isFiniteNumber(skillCap)){
      sourceState = ensureState(source);
      const used = sourceState ? sourceState.skillDrain ?? 0 : 0;
      capRoom = Math.max(0, Math.min(desired, skillCap - used));
    }

    const drained = Math.max(0, Math.min(current, capRoom));
    if (drained <= 0) return 0;

    target.fury = current - drained;
    target.rage = target.fury;

    if (sourceState && isFiniteNumber(skillCap)){
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
    const max = isFiniteNumber(unit.furyMax) ? unit.furyMax : resolveMaxFury(unit.id, CFG);
    return Math.max(0, max - Math.floor(unit.fury ?? 0));
  }

  function furyState(unit){
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
};
__modules['./utils/kit.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/utils/kit.ts
  const __dep0 = __require('./data/tags.ts');
  const DEFENSIVE_TAG_IDS = __dep0.DEFENSIVE_TAG_IDS;
  const INSTANT_TAG_IDS = __dep0.INSTANT_TAG_IDS;
  const hasAnyTag = __dep0.hasAnyTag;
  const normalizeTagList = __dep0.normalizeTagList;extends Record<string, unknown> {
    id: string;
    key: string;
    type: string;
    name: string;
    tags: ReadonlyArray<string>;
    categories: ReadonlyArray<string>;
    label: string;
  }extends SummonSpec {
    pattern: string;
    placement: string;
    patternKey: string;
    shape: string;
    area: string;
    slots: ReadonlyArray<number | null | undefined>;
    count: number;
    summonCount: number;
    ttl: number;
    ttlTurns: number;
    inherit: unknown;
    limit: number;
    replace: unknown;
    creep: unknown;
  }extends SummonSpecLike {
    slots: ReadonlyArray<number>;
    pattern: string;
    ttl: number;
    ttlTurns: number;
  }extends UltSkillConfig {
    metadata: (UltMetadata & { summon: SummonSpecLike | null }) | null;
    meta: (UltMetadata & { summon: SummonSpecLike | null }) | null;
    summon: SummonSpecLike | null;
  }extends UnitKitConfig {
    traits: KitTraits;
    ult: UltSpec | null;
  }extends UnitKitConfig {
    kit: KitData | null;
    traits: KitTraits;
    ult: UltSpec | null;
  }
};
__modules['./utils/module-resolution.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/utils/module-resolution.ts


  function pickFunctionFromSource(
    source,
    preferredKeys= [],
    fallbackKeys= []
  ){
    if (!source) return null;

    if (typeof source === 'function'){
      return source /* as TFn */;
    }

    if (source && typeof source === 'object'){
      const record = source /* as Record<string */, unknown>;
      for (const key of preferredKeys){
        const value = record[key];
        if (typeof value === 'function'){
          return value /* as TFn */;
        }
      }
      for (const key of fallbackKeys){
        const value = record[key];
        if (typeof value === 'function'){
          return value /* as TFn */;
        }
      }
    }

    return null;
  }

  function resolveModuleFunction(
    module,
    preferredKeys= [],
    fallbackKeys= []
  ){
    const candidate = pickFunctionFromSource(module, preferredKeys, fallbackKeys);
    return typeof candidate === 'function' ? candidate : null;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'pickFunctionFromSource')) exports.pickFunctionFromSource = pickFunctionFromSource;
  if (!Object.prototype.hasOwnProperty.call(exports, 'resolveModuleFunction')) exports.resolveModuleFunction = resolveModuleFunction;
};
__modules['./utils/player-profile.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./catalog.ts');
  const ROSTER = __dep0.ROSTER;
};
__modules['./utils/profile-progress-merge.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./utils/unit-id.ts');
  const normalizeUnitId = __dep0.normalizeUnitId;

  const isPlainRecord = (value)=> (
    Boolean(value) && typeof value === 'object' && !Array.isArray(value)
  );

  const normalizeProfileBoolean = (value)=> {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return Number.isFinite(value) ? value !== 0 : null;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
      if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
    }
    return null;
  };

  const collectNormalizedUnitPatches = (
    sourceByUnit,
    buildPatch, value) => CollectionUnitPatch | null,
  )=> {
    if (!sourceByUnit || typeof sourceByUnit !== 'object' || Array.isArray(sourceByUnit)) return [];

    return Object.entries(sourceByUnit /* as Record<string */, unknown>).reduce((acc, [unitId, value]) => {
      const normalizedUnitId = normalizeUnitId(unitId);
      if (!normalizedUnitId) return acc;
      const patch = buildPatch(normalizedUnitId, value);
      if (patch) acc.push(patch);
      return acc;
    }, []);
  };

  const mergeCollectionUnitPatches = (
    currentCollectionState,
    patches,
  )=> {
    if (patches.length === 0) return null;

    const sourceState = isPlainRecord(currentCollectionState) ? currentCollectionState : {};
    const sourceUnits = Array.isArray(sourceState.units) ? sourceState.units : [];
    const mergedUnits = [...sourceUnits];
    const unitIndexById = new Map();

    for (let index = 0; index < mergedUnits.length; index += 1) {
      const entry = mergedUnits[index];
      if (!isPlainRecord(entry)) continue;
      const rawUnitId = entry.unitId ?? entry.id ?? entry.key;
      const normalizedUnitId = normalizeUnitId(typeof rawUnitId === 'string' ? rawUnitId : '');
      if (!normalizedUnitId || unitIndexById.has(normalizedUnitId)) continue;
      unitIndexById.set(normalizedUnitId, index);
    }

    for (const patch of patches) {
      const index = unitIndexById.get(patch.unitId);
      if (typeof index === 'number') {
        const existing = mergedUnits[index];
        const nextEntry= isPlainRecord(existing) ? { ...existing } { unitId: patch.unitId };
        mergedUnits[index] = { ...nextEntry, ...patch };
        continue;
      }
      unitIndexById.set(patch.unitId, mergedUnits.length);
      mergedUnits.push({ ...patch });
    }

    return {
      ...sourceState,
      units,
    };
  };

  function mergeProfileProgressIntoCollectionState(
    currentCollectionState,
    profile,
  ){
    if (!profile) return null;

    const patches= [
      ...collectNormalizedUnitPatches(profile.tacticalAiByUnit, (unitId, gambit) => (
        Array.isArray(gambit) || isPlainRecord(gambit) ? { unitId, gambit } 
      )),
      ...collectNormalizedUnitPatches(profile.cultivationByUnit, (unitId, progress) => {
        if (!isPlainRecord(progress)) return null;
        const realm = typeof progress.realm === 'number' && Number.isFinite(progress.realm) ? Math.max(1, Math.floor(progress.realm)) ;
        const subRealm = typeof progress.subRealm === 'number' && Number.isFinite(progress.subRealm) ? Math.max(0, Math.floor(progress.subRealm)) ;
        return realm != null || subRealm != null
          ? { unitId, ...(realm != null ? { realm } {}), ...(subRealm != null ? { subRealm } {}) }
          ;
      }),
      ...collectNormalizedUnitPatches(profile.tpByUnit, (unitId, tp) => (
        typeof tp === 'number' && Number.isFinite(tp) ? { unitId, tp, Math.floor(tp)) } 
      )),
      ...collectNormalizedUnitPatches(profile.tpAllocByUnit, (unitId, tpAlloc) => (
        isPlainRecord(tpAlloc) ? { unitId, tpAlloc)),
      ...collectNormalizedUnitPatches(profile.ownedByUnit, (unitId, owned) => {
        const normalizedOwned = normalizeProfileBoolean(owned);
        return normalizedOwned != null ? { unitId, owned),
  ...collectNormalizedUnitPatches(profile.equipmentByUnit, (unitId, equipment) => (
        isPlainRecord(equipment) ? { unitId, equipment)),
    ];

    return mergeCollectionUnitPatches(currentCollectionState, patches);
  }


  if (!Object.prototype.hasOwnProperty.call(exports, 'mergeProfileProgressIntoCollectionState')) exports.mergeProfileProgressIntoCollectionState = mergeProfileProgressIntoCollectionState;
};
__modules['./utils/rarity.ts'] = (exports, module, __require) => {


  const RARITY_SEQUENCE= ['N', 'R', 'SR', 'SSR', 'UR', 'PRIME'];

  const RARITY_ALIASES= {
    Prime: 'PRIME',
  };

  function normalizeRarity(value){
    const key = String(value ?? '').trim().toUpperCase();
    if (RARITY_SEQUENCE.includes(key /* as Rarity */)){
      return key /* as Rarity */;
    }
    const alias = RARITY_ALIASES[String(value ?? '').trim()];
    if (alias){
      return alias;
    }
    throw new Error(`Rarity không hợp lệ: ${value}`);
  }

  function coerceRarity(value, fallback= 'N'){
    try {
      return normalizeRarity(value);
    } catch {
      return fallback;
    }
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeRarity')) exports.normalizeRarity = normalizeRarity;
  if (!Object.prototype.hasOwnProperty.call(exports, 'coerceRarity')) exports.coerceRarity = coerceRarity;
};
__modules['./utils/rng.ts'] = (exports, module, __require) => {


  const UINT32_MAX = 0x100000000;
  const DEFAULT_SEED = 0x9e3779b9;

  function toUint32(value, fallback = DEFAULT_SEED){
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric)) return fallback >>> 0;
    return (numeric >>> 0) || (fallback >>> 0);
  }

  function createRngState(seed?){
    return {
      seed: toUint32(seed),
      calls,
    };
  }

  function nextRngValue(rng){
    const state = rng ?? createRngState();
    let seed = toUint32(state.seed);
    seed = (seed * 1664525 + 1013904223) >>> 0;
    state.seed = seed;
    state.calls = Math.max(0, Math.floor(Number(state.calls) || 0)) + 1;
    return seed / UINT32_MAX;
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'createRngState')) exports.createRngState = createRngState;
  if (!Object.prototype.hasOwnProperty.call(exports, 'nextRngValue')) exports.nextRngValue = nextRngValue;
};
__modules['./utils/time.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/utils/time.ts
  const perf = typeof globalThis !== 'undefined' ? globalThis.performance : undefined;
  const hasPerfNow = !!(perf && typeof perf.now === 'function');
  let lastFallbackNow = 0;

  let sessionOffset = 0;
  let sessionReady = false;
  let rafOffset= null;

  const readPerfTimeOrigin = ()=> {
    if (!perf) return null;
    const originRaw = (perf /* as { timeOrigin: unknown } */).timeOrigin;
    if (typeof originRaw === 'number' && Number.isFinite(originRaw)) return originRaw;
    const timing = (perf /* as { timing: { navigationStart: number } } */).timing;
    const navigationStart = timing?.navigationStart;
    if (typeof navigationStart === 'number' && Number.isFinite(navigationStart)){
      return navigationStart;
    }
    return null;
  };

  function ensureSessionTimeBase(){
    if (sessionReady) return;
    resetSessionTimeBase();
  }

  function resetSessionTimeBase(){
    const now = safeNow();
    let offset = 0;
    if (hasPerfNow){
      const origin = readPerfTimeOrigin();
      if (origin !== null){
        offset = origin;
      } else if (typeof Date?.now === 'function'){
        offset = Date.now() - now;
      }
    }
    sessionOffset = offset;
    sessionReady = true;
    rafOffset = null;
  }

  function safeNow(){
    if (hasPerfNow && perf) return perf.now();
    const current = Date.now();
    if (current <= lastFallbackNow) {
      lastFallbackNow += 1;
      return lastFallbackNow;
    }
    lastFallbackNow = current;
    return current;
  }

  function sessionNow(){
    ensureSessionTimeBase();
    return safeNow() + sessionOffset;
  }

  function toSessionTime(value){
    ensureSessionTimeBase();
    if (!Number.isFinite(value)) return sessionNow();
    return value + sessionOffset;
  }

  function normalizeAnimationFrameTimestamp(timestamp?){
    ensureSessionTimeBase();
    const fallback = sessionNow();
    if (!Number.isFinite(timestamp)) return fallback;
    const numeric = Number(timestamp);
    if (rafOffset === null){
      rafOffset = fallback - numeric;
      return fallback;
    }
    return numeric + rafOffset;
  }

  function mergeBusyUntil(
    previous,
    startedAt,
    duration,
  ){
    ensureSessionTimeBase();
    const start = Number.isFinite(startedAt) ? startedAt : sessionNow();
    const dur = Number.isFinite(duration) ? Math.max(0, Number(duration)) ;
    const prev = Number.isFinite(previous /* as number */) ? Number(previous) ;
    return Math.max(prev, start + dur);
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'resetSessionTimeBase')) exports.resetSessionTimeBase = resetSessionTimeBase;
  if (!Object.prototype.hasOwnProperty.call(exports, 'safeNow')) exports.safeNow = safeNow;
  if (!Object.prototype.hasOwnProperty.call(exports, 'sessionNow')) exports.sessionNow = sessionNow;
  if (!Object.prototype.hasOwnProperty.call(exports, 'toSessionTime')) exports.toSessionTime = toSessionTime;
  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeAnimationFrameTimestamp')) exports.normalizeAnimationFrameTimestamp = normalizeAnimationFrameTimestamp;
  if (!Object.prototype.hasOwnProperty.call(exports, 'mergeBusyUntil')) exports.mergeBusyUntil = mergeBusyUntil;
};
__modules['./utils/unique-global.ts'] = (exports, module, __require) => {
  const __dep0 = __require('./data/skills.ts');
  const getSkillSet = __dep0.getSkillSet;
  const __dep1 = __require('./data/tags.ts');
  const normalizeTagList = __dep1.normalizeTagList;



  const UNIQUE_GLOBAL_TAG = 'unique-global';

  const normalizeModeKey = (value)=>
    typeof value === 'string' ? value.trim().toLowerCase() ;

  const collectSkillTags = (unitId)=> {
    const set = getSkillSet(unitId /* as never */);
    if (!set) return [];
    const tags = [
      ...(set.basic?.tags ?? []),
      ...(set.skill?.tags ?? []),
      ...(set.ult?.tags ?? []),
      ...(set.talent?.tags ?? []),
      ...(set.technique?.tags ?? []),
      ...((set.skills ?? []).flatMap((section) => section?.tags ?? [])),
    ];
    return normalizeTagList(tags);
  };

  const hasUniqueGlobalTag = (unitId, explicitTags?)=> {
    const directTags = normalizeTagList(explicitTags ?? []);
    if (directTags.includes(UNIQUE_GLOBAL_TAG)) return true;
    return collectSkillTags(unitId).includes(UNIQUE_GLOBAL_TAG);
  };

  function isCampaignMode(game){
    return normalizeModeKey(game?.modeKey) === 'campaign';
  }

  function isUniqueGlobalSummonBlocked(
    game,
    params){
    const unitId = typeof params.unitId === 'string' ? params.unitId.trim() ;
    if (!game || !isCampaignMode(game) || !unitId) return false;
    if (!hasUniqueGlobalTag(unitId, params.tags)) return false;
    return game.tokens.some((token) => token?.alive && token.id === unitId);
  }

  if (!Object.prototype.hasOwnProperty.call(exports, 'isCampaignMode')) exports.isCampaignMode = isCampaignMode;
  if (!Object.prototype.hasOwnProperty.call(exports, 'isUniqueGlobalSummonBlocked')) exports.isUniqueGlobalSummonBlocked = isUniqueGlobalSummonBlocked;
};
__modules['./utils/unit-id.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/utils/unit-id.ts

  function normalizeUnitId(id){
    if (typeof id === 'string'){
      return id;
    }
    if (typeof id === 'number'){
      return Number.isFinite(id) ? String(id) ;
    }
    if (id == null){
      return '';
    }
    const value = String(id);
    return typeof value === 'string' ? value : '';
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'normalizeUnitId')) exports.normalizeUnitId = normalizeUnitId;
};
__modules['./vfx.ts'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/src/vfx.ts
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


    anchorId: string;
    bindingKey: string;
    timing: string | number;
    ambientKey: string;
    anchorRadius: number;
    targetAnchorId: string;
    targetBindingKey: string;
    targetTiming: string | number;
    targetRadius: number;
    color: string;
    thickness: number;
    jitter: number;
    segments: number;
    glow: boolean;
    glowScale: number;
    rayScale: number;
  };


    anchorId: string;
    bindingKey: string;
    timing: string | number;
    ambientKey: string;
    anchorRadius: number;
    color: string;
    rings: number;
    maxScale: number;
    alpha: number;
  };


    anchorId: string;
    bindingKey: string;
    timing: string | number;
    anchorRadius: number;
    backAnchorId: string;
    backTiming: string | number;
    backRadius: number;
    color: string;
    alpha: number;
    thickness: number;
    heightScale: number;
    widthScale: number;
    wobble: number;
  };


    anchorId: string;
    bindingKey: string;
    timing: string | number;
    anchorRadius: number;
    color: string;
    shards: number;
    spread: number;
    alpha: number;
  };






    tokens: ReadonlyArray<UnitToken>;
    vfx: VfxEventList;
  };

   y: number };


  function asSessionWithVfx(
    game,
    { requireGrid = false }{ requireGrid: boolean } = {},
  ){
    if (!game || !Array.isArray(game.tokens)) return null;
    if (requireGrid && !game.grid) return null;
    return game /* as SessionWithVfx */;
  }

  const lerp = (a, b, t)=> a + (b - a) * t;
  const easeInOut = (t)=> (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) * 0.5;
  const isFiniteCoord = (value)=> Number.isFinite(value);
  const hasFinitePoint = (obj){ cx: number; cy: number } =>
    !!obj && isFiniteCoord(obj.cx) && isFiniteCoord(obj.cy);
  const warnInvalidArc = (label, data)=> {
    if (typeof console !== 'undefined' && console?.warn) {
      console.warn(`[vfxDraw] Skipping ${label} arc due to invalid geometry`, data);
    }
  };

  const clamp01 = (value)=> Math.max(0, Math.min(1, value));

  const readBooleanFlag = (event, keys)=> {
    for (const key of keys) {
      if (!(key in event)) continue;
      if (Boolean(event[key])) return true;
    }
    return false;
  };

  const resolveHitStatusTextStyle = (event)=> {
    const isCritical = readBooleanFlag(event, ['isCrit', 'crit', 'critical']);
    const hasAdvantage = readBooleanFlag(event, ['isAdvantage', 'advantage', 'hasAdvantage']);

    if (isCritical && hasAdvantage) {
      return {
        text: 'CRITICAL · ADVANTAGE',
        fill,
        stroke,
        shadow, 208, 84, 0.95)',
      };
    }

    if (isCritical) {
      return {
        text: 'CRITICAL',
        fill,
        stroke,
        shadow, 106, 106, 0.8)',
      };
    }

    if (hasAdvantage) {
      return {
        text: 'ADVANTAGE',
        fill,
        stroke,
        shadow, 224, 255, 0.75)',
      };
    }

    return null;
  };

  const drawHitStatusText = (
    ctx,
    x,
    y,
    radius,
    progress,
    style,
  )=> {
    if (!style.text) return;
    const alpha = 0.95 * (1 - progress);
    if (alpha <= 0) return;

    const fontSize = Math.max(12, Math.round(Math.max(18, radius) * 0.62));
    const textY = y - Math.max(20, radius * 1.35);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.lineWidth = Math.max(2.5, Math.round(fontSize * 0.2));
    ctx.strokeStyle = style.stroke;
    ctx.fillStyle = style.fill;
    ctx.shadowColor = style.shadow;
    ctx.shadowBlur = Math.max(8, Math.round(fontSize * 0.5));
    ctx.strokeText(style.text, x, textY);
    ctx.fillText(style.text, x, textY);
    ctx.restore();
  };

  const resolveHitImpactPalette = (event)=> {
    const isCritical = readBooleanFlag(event, ['isCrit', 'crit', 'critical']);
    const hasAdvantage = readBooleanFlag(event, ['isAdvantage', 'advantage', 'hasAdvantage']);
    if (isCritical && hasAdvantage) {
      return {
        core: '#ffd447',
        shock,
        spark,
        smear,
      };
    }
    if (isCritical) {
      return {
        core: '#ff8f8f',
        shock,
        spark,
        smear,
      };
    }
    if (hasAdvantage) {
      return {
        core: '#9befff',
        shock,
        spark,
        smear,
      };
    }
    return {
      core: '#e6f2ff',
      shock,
      spark,
      smear,
    };
  };

  const drawHitImpactLayerA = (
    ctx,
    x,
    y,
    radius,
    progress,
    palette,
  )=> {
    const alpha = 0.8 * (1 - progress);
    if (alpha <= 0) return;
    const tilt = progress * Math.PI * 0.7;
    const span = Math.max(8, radius * (1.4 - progress * 0.5));
    const thickness = Math.max(4, radius * 0.28);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = palette.core;
    for (let i = 0; i < 2; i += 1) {
      const angle = tilt + (i * Math.PI * 0.5);
      const ux = Math.cos(angle);
      const uy = Math.sin(angle);
      const vx = -uy;
      const vy = ux;
      const halfSpan = span * (1 + i * 0.15);
      const halfThickness = thickness * (1 - i * 0.2);
      ctx.beginPath();
      ctx.moveTo(x - ux * halfSpan - vx * halfThickness, y - uy * halfSpan - vy * halfThickness);
      ctx.lineTo(x + ux * halfSpan - vx * halfThickness, y + uy * halfSpan - vy * halfThickness);
      ctx.lineTo(x + ux * halfSpan + vx * halfThickness, y + uy * halfSpan + vy * halfThickness);
      ctx.lineTo(x - ux * halfSpan + vx * halfThickness, y - uy * halfSpan + vy * halfThickness);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  const drawHitImpactLayerB = (
    ctx,
    x,
    y,
    radius,
    progress,
    palette,
  )=> {
    const alpha = 0.75 * (1 - progress);
    if (alpha <= 0) return;
    const growth = 1 + progress * 1.6;
    const smearLength = Math.max(10, radius * (1.8 - progress * 0.4));
    const smearThickness = Math.max(2, radius * 0.2 * (1 - progress * 0.4));

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = palette.shock;
    ctx.lineWidth = Math.max(2, radius * 0.14);
    ctx.beginPath();
    ctx.arc(x, y, Math.max(2, radius * growth), 0, Math.PI * 2);
    ctx.stroke();

    const smearAngle = -Math.PI / 6;
    const dx = Math.cos(smearAngle);
    const dy = Math.sin(smearAngle);
    const nx = -dy;
    const ny = dx;
    ctx.strokeStyle = palette.smear;
    ctx.lineWidth = smearThickness;
    ctx.beginPath();
    ctx.moveTo(x - dx * smearLength * 0.4 - nx * radius * 0.12, y - dy * smearLength * 0.4 - ny * radius * 0.12);
    ctx.lineTo(x + dx * smearLength, y + dy * smearLength);
    ctx.stroke();
    ctx.restore();
  };

  const drawHitImpactLayerC = (
    ctx,
    x,
    y,
    radius,
    progress,
    palette,
  )=> {
    const alpha = 0.7 * (1 - progress);
    if (alpha <= 0) return;
    const sparkCount = 6;
    const spread = radius * (0.7 + progress * 1.5);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = palette.spark;
    for (let i = 0; i < sparkCount; i += 1) {
      const angle = (i / sparkCount) * Math.PI * 2 + progress * Math.PI * 0.7;
      const px = x + Math.cos(angle) * spread;
      const py = y + Math.sin(angle) * spread * 0.7;
      const dotR = Math.max(1, radius * (0.08 - progress * 0.03));
      ctx.beginPath();
      ctx.arc(px, py, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const makeTokenKey = (parts)=> {
    if (!parts) return null;
    if (Number.isFinite(parts.iid)) {
      return `iid:${parts.iid}`;
    }
    if (typeof parts.id === 'string' && parts.id.length > 0) {
      return `id:${parts.id}`;
    }
    return null;
  };

  const findTokenByKey = (tokens, key)=> {
    if (!key || !Array.isArray(tokens)) return null;
    if (key.startsWith('iid:')) {
      const iid = Number.parseInt(key.slice(4), 10);
      if (Number.isFinite(iid)) {
        return tokens.find(t => t && Number.isFinite(t.iid) && (t.iid /* as number */) === iid) ?? null;
      }
    }
    if (key.startsWith('id:')) {
      const id = key.slice(3);
      return tokens.find(t => t && typeof t.id === 'string' && t.id === id) ?? null;
    }
    return null;
  };

  const resolveTokenKey = (
    token,
    fallback= {},
  )=> makeTokenKey({ iid: token?.iid ?? fallback.iid, id);

  const resolveTokenFromEvent = (
    tokens,
    eventToken,
    fallback,
  )=> {
    const key = resolveTokenKey(eventToken, fallback);
    return findTokenByKey(tokens, key);
  };

  function computeMeleeOffsets(
    Game,
    cam,
  ){
    const offsets= new Map();
    if (!Game?.grid) return offsets;
    const tokens = Array.isArray(Game.tokens) ? Game.tokens : [];
    const events = Array.isArray(Game.vfx) ? Game.vfx : [];
    if (events.length === 0 || tokens.length === 0) return offsets;

    for (const e of events) {
      if (!e || e.type !== 'melee') continue;
      const duration = Number.isFinite(e.dur) ? e.dur : 0;
      if (!duration) continue;

      const elapsed = safeNow() - e.t0;
      const tt = clamp01(elapsed / duration);
      if (tt <= 0 || tt >= 1) continue;

      const attacker = resolveTokenFromEvent(tokens, e.refA, { iid: e.iidA, id);
      if (!attacker || !attacker.alive) continue;

      const target = resolveTokenFromEvent(tokens, e.refB, { iid: e.iidB, id);

      const originCx = Number.isFinite(e.originCx) ? (e.originCx /* as number */) ;
      const originCy = Number.isFinite(e.originCy) ? (e.originCy /* as number */) ;
      const targetCx = Number.isFinite(e.targetCx)
        ? (e.targetCx /* as number */)
        ;
      const targetCy = Number.isFinite(e.targetCy)
        ? (e.targetCy /* as number */)
        ;

      if (!Number.isFinite(originCx) || !Number.isFinite(originCy)) continue;

      const pa = projectCellOblique(Game.grid, originCx, originCy, cam);
      const pb = projectCellOblique(Game.grid, targetCx, targetCy, cam);
      if (!isFiniteCoord(pa.x) || !isFiniteCoord(pa.y) || !isFiniteCoord(pb.x) || !isFiniteCoord(pb.y)) {
        continue;
      }

      const travelForward = tt <= 0.5;
      const localT = travelForward ? tt / 0.5 : (tt - 0.5) / 0.5;
      const eased = easeInOut(clamp01(localT));
      const maxTravel = 0.88;
      const travel = travelForward ? eased * maxTravel : (1 - eased) * maxTravel;

      const mx = lerp(pa.x, pb.x, travel);
      const my = lerp(pa.y, pb.y, travel);

      const key = resolveTokenKey(attacker, { iid: e.iidA, id);
      if (!key) continue;

      offsets.set(key, { x: mx - pa.x, y);
    }

    return offsets;
  }

  const DEFAULT_ANCHOR_ID = 'root';
  const DEFAULT_ANCHOR_POINT= { x: 0.5, y= 0.2;
  const UNIT_WIDTH_RATIO = 0.9;
  const UNIT_HEIGHT_RATIO = 1.85;
  const DEFAULT_SEGMENTS = 6;

  const VFX_ANCHOR_CACHE= new Map();

  function registerAnchorDataset(dataset){
    if (!dataset || typeof dataset !== 'object') return;
    const unitId = dataset.unitId || null;
    if (!unitId) return;
    const entry= {
      bodyAnchors: dataset.bodyAnchors || {},
      vfxBindings,
      ambientEffects, entry);
  }

  try {
    const dataset = parseVfxAnchorDataset(loithienanhAnchors);
    registerAnchorDataset(dataset);
  } catch (error) {
    // behavior-preserving: fall back to raw dataset when validation fails.
    if (typeof console !== 'undefined' && console?.warn) {
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(`[vfxDraw] Failed to parse anchor dataset: ${reason}`);
    }
    registerAnchorDataset(loithienanhAnchors);
  }

  function getUnitAnchorDataset(unit){
    if (!unit) return null;
    const id = (unit.unitId /* as string | null | undefined */)
      || (typeof unit.id === 'string' ? unit.id : null)
      || (typeof unit.name === 'string' ? unit.name : null);
    if (!id) return null;
    return VFX_ANCHOR_CACHE.get(id) || null;
  }

  function getBindingAnchors(
    dataset,
    bindingKey,
    source= 'vfxBindings',
  ){
    if (!dataset || !bindingKey) return [];
    const bindings = dataset[source];
    const entry = bindings?.[bindingKey];
    if (!entry || !Array.isArray(entry.anchors)) return [];
    return entry.anchors;
  }

  function pickAnchorFromList(
    anchors,
    anchorId,
    timing,
    hasTiming,
  ){
    if (anchors.length === 0) return null;
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

  function resolveBindingAnchor(
    unit,
    { anchorId, bindingKey, timing, ambientKey, radius }{
      anchorId: string;
      bindingKey: string;
      timing: string | number;
      ambientKey: string;
      radius: number;
    },
  ){
    const dataset = getUnitAnchorDataset(unit);
    const hasTiming = !!timing;
    const timingValue = hasTiming ? timing : undefined;

    let picked= null;

    const primaryAnchors = getBindingAnchors(dataset, bindingKey);
    picked = pickAnchorFromList(primaryAnchors, anchorId, timingValue, hasTiming);

    if (!picked) {
      const ambientAnchors = getBindingAnchors(dataset, ambientKey ?? null, 'ambientEffects');
      picked = pickAnchorFromList(ambientAnchors, anchorId, timingValue, hasTiming);
    }

    const resolvedId = picked?.id || anchorId || DEFAULT_ANCHOR_ID;
    const resolvedRadius = Number.isFinite(radius) ? radius : (Number.isFinite(picked?.radius) ? picked.radius : null);

    return { id: resolvedId, radius, anchorId){
    const dataset = getUnitAnchorDataset(unit);
    if (!dataset) return null;
    const anchor = dataset.bodyAnchors?.[anchorId];
    if (!anchor) return null;
    const x = Number(anchor.x);
    const y = Number(anchor.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x, y };
  }

  function createRandomPattern(length = DEFAULT_SEGMENTS){
    const result= [];
    for (let i = 0; i < length; i += 1) {
      result.push(Math.random() * 2 - 1);
    }
    return result;
  }

  function computeAnchorCanvasPoint(
    Game,
    token,
    anchorId,
    radiusRatio,
    cam,
  ){
    if (!Game?.grid || !token || !hasFinitePoint(token)) return null;
    const projection = projectCellOblique(Game.grid, token.cx ?? 0, token.cy ?? 0, cam);
    if (!projection || !isFiniteCoord(projection.x) || !isFiniteCoord(projection.y) || !isFiniteCoord(projection.scale)) return null;

    const anchor = lookupBodyAnchor(token, anchorId ?? DEFAULT_ANCHOR_ID)
      || lookupBodyAnchor(token, DEFAULT_ANCHOR_ID)
      || DEFAULT_ANCHOR_POINT;
    const ax = Number(anchor?.x);
    const ay = Number(anchor?.y);
    const validAnchor = Number.isFinite(ax) && Number.isFinite(ay);
    const xRatio = validAnchor ? (ax - 0.5) ;
    const yRatio = validAnchor ? (ay - 0.5) ;

    const width = Game.grid.tile * UNIT_WIDTH_RATIO * projection.scale;
    const height = Game.grid.tile * UNIT_HEIGHT_RATIO * projection.scale;
    const px = projection.x + xRatio * width;
    const py = projection.y - yRatio * height;

    if (!isFiniteCoord(px) || !isFiniteCoord(py)) return null;

    const rr = Number.isFinite(radiusRatio) ? Number(radiusRatio) ;
    const rPx = Math.max(2, Math.floor(rr * Game.grid.tile * projection.scale));
    return { x: px, y, r, scale,
    start,
    end,
    event,
    progress,
  ){
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

  function drawBloodPulse(
    ctx,
    anchor,
    event,
    progress,
  ){
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

  function drawShieldWrap(
    ctx,
    frontAnchor,
    backAnchor,
    event,
    progress,
  ){
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

  function drawGroundBurst(
    ctx,
    anchor,
    event,
    progress,
  ){
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

  function pool(Game){
    if (!Array.isArray(Game.vfx)) Game.vfx = [] /* as VfxEventList */;
    return Game.vfx;
  }

  /* ------------------- Adders ------------------- */
  function vfxAddSpawn(Game, cx, cy, side){
    const spawn= { type: 'spawn', t0), dur, cx, cy, side };
    pool(Game).push(spawn);
  }

  function vfxAddHit(Game, target, opts= {}){
    const event= { type: 'hit', t0), dur, ref, ...opts };
    pool(Game).push(event);
  }

  function vfxAddTracer(
    Game,
    attacker,
    target,
    opts= {},
  ){
    const dur = Number.isFinite(opts?.dur) ? Number(opts.dur) ;
    const event= { type: 'tracer', t0), dur, refA, refB).push(event);
  }

  function vfxAddMelee(
    Game,
    attacker,
    target,
    { dur = CFG?.ANIMATION?.meleeDurationMs ?? 2000 }{ dur: number } = {},
  ){
  const iidA = typeof attacker?.iid === 'number' ? attacker.iid : null;
    const iidB = typeof target?.iid === 'number' ? target.iid : null;
    const idA = typeof attacker?.id === 'string' ? attacker.id : null;
    const idB = typeof target?.id === 'string' ? target.id : null;
    const originCx = typeof attacker?.cx === 'number' ? attacker.cx : null;
    const originCy = typeof attacker?.cy === 'number' ? attacker.cy : null;
    const targetCx = typeof target?.cx === 'number' ? target.cx : null;
    const targetCy = typeof target?.cy === 'number' ? target.cy : null;

    const event= {
      type: 'melee',
      t0),
      dur,
      refA,
      refB,
      iidA,
      iidB,
      idA,
      idB,
      originCx,
      originCy,
      targetCx,
      targetCy,
    };
    pool(Game).push(event);
  }

  function makeLightningEvent(
    Game,
    source,
    target,
    opts= {},
  ){
    const busyMs = Number.isFinite(opts.busyMs) ? Number(opts.busyMs) ;
    const anchorA = resolveBindingAnchor(source, {
      anchorId: opts.anchorId,
      bindingKey,
      timing,
      ambientKey,
      radius);
    const anchorB = target
      ? resolveBindingAnchor(target, {
          anchorId: opts.targetAnchorId,
          bindingKey,
          timing,
          ambientKey,
          radius,
        })
      ;

    const event= {
      type: 'lightning_arc',
      t0),
      dur,
      refA,
      refB,
      anchorA,
      anchorB,
      radiusA,
      radiusB,
      color,
      thickness,
      jitter,
      pattern),
      segments,
      glow,
      glowScale,
      rayScale,
    };
    pool(Game).push(event);
    return busyMs;
  }

  function vfxAddLightningArc(
    Game,
    source,
    target,
    opts= {},
  ){
    return makeLightningEvent(Game, source, target, opts);
  }

  function vfxAddBloodPulse(Game, source, opts= {}){
    const busyMs = Number.isFinite(opts.busyMs) ? Number(opts.busyMs) ;
    const anchor = resolveBindingAnchor(source, {
      anchorId: opts.anchorId,
      bindingKey,
      timing,
      ambientKey,
      radius);

    const event= {
      type: 'blood_pulse',
      t0),
      dur,
      refA,
      anchorA,
      radiusA,
      color,
      rings,
      maxScale,
      alpha,
    };
    pool(Game).push(event);
    return busyMs;
  }

  function vfxAddShieldWrap(Game, source, opts= {}){
    const busyMs = Number.isFinite(opts.busyMs) ? Number(opts.busyMs) ;
    const front = resolveBindingAnchor(source, {
      anchorId: opts.anchorId,
      bindingKey,
      timing,
      ambientKey,
      radius);
    const wantsBack = opts.backAnchorId != null || opts.backTiming != null || Number.isFinite(opts.backRadius);
    const back = wantsBack
      ? resolveBindingAnchor(source, {
          anchorId: opts.backAnchorId,
          bindingKey,
          timing,
          ambientKey,
          radius,
        })
      ;

    const event= {
      type: 'shield_wrap',
      t0),
      dur,
      refA,
      anchorA,
      anchorB,
      radiusA,
      radiusB,
      color,
      alpha,
      thickness,
      heightScale,
      widthScale,
      wobble,
    };
    pool(Game).push(event);
    return busyMs;
  }

  function vfxAddGroundBurst(Game, source, opts= {}){
    const busyMs = Number.isFinite(opts.busyMs) ? Number(opts.busyMs) ;
    const anchor = resolveBindingAnchor(source, {
      anchorId: opts.anchorId,
      bindingKey,
      timing,
      ambientKey,
      radius);

    const event= {
      type: 'ground_burst',
      t0),
      dur,
      refA,
      anchorA,
      radiusA,
      color,
      shards,
      spread,
      alpha,
    };
    pool(Game).push(event);
    return busyMs;
  }

  function drawChibiOverlay(
    ctx,
    x,
    y,
    r,
    facing,
    color,
  ){
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
    ctx.beginPath(); ctx.arc(0, -torso - hr, hr, 0, Math.PI * 2); ctx.stroke();
    // thân
    ctx.beginPath(); ctx.moveTo(0, -torso); ctx.lineTo(0, 0); ctx.stroke();
    // tay (tay trước cầm kiếm theo hướng facing)
    ctx.beginPath();
    ctx.moveTo(0, -torso * 0.6); ctx.lineTo(-arm * 0.8, -torso * 0.2);
    ctx.moveTo(0, -torso * 0.6); ctx.lineTo(arm * 0.8 * facing, -torso * 0.2);
    ctx.stroke();
    // chân
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-leg * 0.6, leg * 0.9);
    ctx.moveTo(0, 0); ctx.lineTo(leg * 0.6, leg * 0.9);
    ctx.stroke();
    // kiếm
    const hx = arm * 0.8 * facing;
    const hy = -torso * 0.2;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + wep * facing, hy); ctx.stroke();

    ctx.restore();
  }
  /* ------------------- Drawer ------------------- */
  function vfxDraw(
    ctx,
    Game,
    cam,
  ){
    const list = pool(Game);
    if (!list.length || !Game.grid) return;

    const keep= [];
    for (const e of list) {
      const t = (safeNow() - e.t0) / e.dur;
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
              ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
              ctx.restore();
            } else {
              warnInvalidArc('spawn', { x: p?.x, y, r });
            }
          }
          break;
        }

        case 'hit': {
          const tokens = Array.isArray(Game?.tokens) ? Game.tokens : null;
          const updateFromToken = (token)=> {
            if (!token) return;
            if (token.iid != null && e.iid == null) e.iid = token.iid;
            if (isFiniteCoord(token.cx)) e.cx = token.cx;
            if (isFiniteCoord(token.cy)) e.cy = token.cy;
          };

          const initialRef = hasFinitePoint(e.ref) ? e.ref : null;
          updateFromToken(initialRef);

          const lookupLiveToken = ()=> {
            if (!tokens) return null;
            if (e.iid != null) {
              return tokens.find(t => t && t.iid === e.iid) ?? null;
            }
            const ref = e.ref;
            if (ref?.iid != null) {
              return tokens.find(t => t && t.iid === ref.iid) ?? null;
            }
            if (typeof ref?.id === 'string') {
              return tokens.find(t => t && t.id === ref.id) ?? null;
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
              const palette = resolveHitImpactPalette(e);
              drawHitImpactLayerA(ctx, p.x, p.y, r, tt, palette);
              drawHitImpactLayerB(ctx, p.x, p.y, r, tt, palette);
              drawHitImpactLayerC(ctx, p.x, p.y, r, tt, palette);

              const hitStatusText = resolveHitStatusTextStyle(e);
              if (hitStatusText) {
                drawHitStatusText(ctx, p.x, p.y, r, tt, hitStatusText);
              }
            } else {
              warnInvalidArc('hit', { x: p?.x, y, r });
            }
          }
          break;
        }

        case 'tracer': {
          // disabled: không vẽ “đường trắng” nữa
          break;
        }

        case 'melee':
          // Đã thay bằng chuyển động trực tiếp của token (không vẽ overlay riêng).
          break;

        case 'lightning_arc': {
          const start = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, e.radiusA ?? null, cam);
          const end = e.refB ? computeAnchorCanvasPoint(Game, e.refB, e.anchorB, e.radiusB ?? null, cam) ;
          if (start && (!e.refB || end)) {
            drawLightningArc(ctx, start, end, e, tt);
          } else {
            warnInvalidArc('lightning', { start, end });
          }
          break;
        }

        case 'blood_pulse': {
          const anchor = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, e.radiusA ?? null, cam);
          if (anchor) {
            drawBloodPulse(ctx, anchor, e, tt);
          } else {
            warnInvalidArc('blood_pulse', { anchor });
          }
          break;
        }

        case 'shield_wrap': {
          const front = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, e.radiusA ?? null, cam);
          const back = e.anchorB ? computeAnchorCanvasPoint(Game, e.refA, e.anchorB, e.radiusB ?? null, cam) ;
          if (front) {
            drawShieldWrap(ctx, front, back, e, tt);
          } else {
            warnInvalidArc('shield_wrap', { front, back });
          }
          break;
        }

        case 'ground_burst': {
          const anchor = computeAnchorCanvasPoint(Game, e.refA, e.anchorA, e.radiusA ?? null, cam);
          if (anchor) {
            drawGroundBurst(ctx, anchor, e, tt);
          } else {
            warnInvalidArc('ground_burst', { anchor });
          }
          break;
        }

        default:
          break;
      }

      if (!done) keep.push(e);
    }
    Game.vfx = keep;
  }
  if (!Object.prototype.hasOwnProperty.call(exports, 'asSessionWithVfx')) exports.asSessionWithVfx = asSessionWithVfx;
  if (!Object.prototype.hasOwnProperty.call(exports, 'computeMeleeOffsets')) exports.computeMeleeOffsets = computeMeleeOffsets;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddSpawn')) exports.vfxAddSpawn = vfxAddSpawn;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddHit')) exports.vfxAddHit = vfxAddHit;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddTracer')) exports.vfxAddTracer = vfxAddTracer;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddMelee')) exports.vfxAddMelee = vfxAddMelee;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddLightningArc')) exports.vfxAddLightningArc = vfxAddLightningArc;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddBloodPulse')) exports.vfxAddBloodPulse = vfxAddBloodPulse;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddShieldWrap')) exports.vfxAddShieldWrap = vfxAddShieldWrap;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxAddGroundBurst')) exports.vfxAddGroundBurst = vfxAddGroundBurst;
  if (!Object.prototype.hasOwnProperty.call(exports, 'vfxDraw')) exports.vfxDraw = vfxDraw;
};
__modules['./../tools/zod-stub/index.js'] = (exports, module, __require) => {
  //home (termux)/arclune_lane_7x3/tools/zod-stub/index.js

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
};
try {
  __require('./entry.ts');
} catch (err) {
  console.error('Failed to bootstrap Arclune bundle:', err);
  throw err;
}
