// @ts-nocheck
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export function assertVmModuleIntegrity(code, filename){
  const staticImport = /(^|\n)\s*import\s+(?!\()|(^|\n)\s*export\s+(?:\{|\*|default)/m;
  const commonJsRequire = /\brequire\s*\(/;
  if (staticImport.test(code)) throw new Error(`${filename}: untransformed static module syntax`);
  if (commonJsRequire.test(code)) {
    const dependencies = [...code.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map(match => match[1]);
    throw new Error(`${filename}: unexpected CommonJS require remains in VM code (${dependencies.join(', ')})`);
  }
}

function bindVmDependencies(code){
  return code.replace(/\brequire\s*\(\s*(["'][^"']+["'])\s*\)/g, '__loadDependency($1)');
}

async function loadCombatPresence(here){
  const presencePath = path.resolve(here, '../../src/combat/presence.ts');
  const source = await fs.readFile(presencePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: 'presence.ts'
  }).outputText.replace(/\brequire\s*\([^)]*\);?/g, '');
  const context = { module: { exports: {} }, exports: {} };
  context.exports = context.module.exports;
  vm.createContext(context);
  new vm.Script(output, { filename: 'combat/presence.js' }).runInContext(context);
  return context.module.exports;
}

export async function loadTurnsHarness(overrides = {}){
  const here = path.dirname(fileURLToPath(import.meta.url));
  const filePath = path.resolve(here, '../../src/turns.ts');
  let code = await fs.readFile(filePath, 'utf8');
  const combatPresence = await loadCombatPresence(here);

  const replacements = new Map([
    ["import { initialRageFor } from './meta.ts';", "const { initialRageFor } = __deps['./meta.ts'];"],
    ["import { vfxAddSpawn, vfxAddBloodPulse, asSessionWithVfx } from './vfx.ts';", "const { vfxAddSpawn, vfxAddBloodPulse, asSessionWithVfx } = __deps['./vfx.ts'];"],
    ["import { emitPassiveEvent, applyOnSpawnEffects, getPassiveLog, prepareUnitForPassives } from './passives.ts';", "const { emitPassiveEvent, applyOnSpawnEffects, getPassiveLog, prepareUnitForPassives } = __deps['./passives.ts'];"],
    ["import { emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END, TURN_REGEN } from './events.ts';", "const { emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END, TURN_REGEN } = __deps['./events.ts'];"],
    ["import { initializeFury, startFuryTurn, spendFury, resolveUltCost, setFury, clearFreshSummon } from './utils/fury.ts';", "const { initializeFury, startFuryTurn, spendFury, resolveUltCost, setFury, clearFreshSummon } = __deps['./utils/fury.js'];"],
    ["import { resolveRuntimeUnitStats } from './modes/pve/collection-mapper.ts';", "const { resolveRuntimeUnitStats } = __deps['./modes/pve/collection-mapper.ts'];"],
    ["import { applyCultivationBonus } from './cultivation.ts';", "const { applyCultivationBonus } = __deps['./cultivation.ts'];"],
    ["import { evaluateGambitLogic } from './ai.ts';", "const { evaluateGambitLogic } = __deps['./ai.ts'];"],
    ["import { isLeaderUltReady, isUyenLeader, grantUyenSummonRage } from './leader-uyen.ts';", "const { isAnyLeaderUltReady, isUyenLeader, grantUyenSummonRage, hasQueuedUyenUlt, clearQueuedUyenUlt } = __deps['./leader-uyen.ts'];"],
    ["import {\n  clearQueuedUyenUlt,\n  hasQueuedUyenUlt,\n  isLeaderUltReady,\n  isUyenLeader,\n  grantUyenSummonRage,\n} from './leader-uyen.ts';", "const { isAnyLeaderUltReady, isUyenLeader, grantUyenSummonRage, hasQueuedUyenUlt, clearQueuedUyenUlt } = __deps['./leader-uyen.ts'];"],
    [`import {
  clearQueuedUyenUlt,
  hasQueuedUyenUlt,
  isAnyLeaderUltReady,
  isUyenLeader,
  grantUyenSummonRage,
} from './leader-uyen.ts';`, "const { isAnyLeaderUltReady, isUyenLeader, grantUyenSummonRage, hasQueuedUyenUlt, clearQueuedUyenUlt } = __deps['./leader-uyen.ts'];"],
    ["import { slotToCell, slotIndex } from './engine.ts';", "const { slotToCell, slotIndex } = __deps['./engine.js'];"],
    ["import { globalAetherPool, resolveActionAetherRegen } from './aether.ts';", "const { globalAetherPool, resolveActionAetherRegen } = __deps['./aether.ts'];"],
    ["import { globalAetherPool } from './aether.ts';", "const { globalAetherPool } = __deps['./aether.ts'];"],
    ["import { Statuses } from './statuses.ts';", "const { Statuses } = __deps['./statuses.ts'];"],
    ["import { isCombatAlive, markRemoved } from './combat/kernel/life-cycle.ts';", "const { isCombatAlive, markRemoved } = __deps['./combat/kernel/life-cycle.ts'];"],
    ["import { Statuses } from './statuses.js';", "const { Statuses } = __deps['./statuses.ts'];"],
    ["import { doBasicWithFollowups } from './combat.ts';", "const { doBasicWithFollowups } = __deps['./combat.js'];"],
    ["import { performActiveSkill } from './combat/perform-active-skill.ts';", "const { performActiveSkill } = __deps['./combat/perform-active-skill.ts'];"],
    ["import { CFG } from './config.ts';", "const { CFG } = __deps['./config.ts'];"],
    ["import { makeInstanceStats, initialRageFor } from './meta.ts';", "const { makeInstanceStats, initialRageFor } = __deps['./meta.ts'];"],
    ["import { vfxAddSpawn, vfxAddBloodPulse } from './vfx.ts';", "const { vfxAddSpawn, vfxAddBloodPulse } = __deps['./vfx.ts'];"],
    ["import { getUnitArt } from './art.ts';", "const { getUnitArt } = __deps['./art.ts'];"],
    ["import { emitPassiveEvent, applyOnSpawnEffects, prepareUnitForPassives } from './passives.ts';", "const { emitPassiveEvent, applyOnSpawnEffects, prepareUnitForPassives } = __deps['./passives.ts'];"],
    ["import { emitPassiveEvent, applyOnSpawnEffects, prepareUnitForPassives } from './passives.js';", "const { emitPassiveEvent, applyOnSpawnEffects, prepareUnitForPassives } = __deps['./passives.ts'];"],
    ["import { emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END, TURN_REGEN } from './events.js';", "const { emitGameEvent, TURN_START, TURN_END, ACTION_START, ACTION_END, TURN_REGEN } = __deps['./events.ts'];"],
    ["import { safeNow } from './utils/time.js';", "const { safeNow } = __deps['./utils/time.js'];"],
    ["import { safeNow } from './utils/time.ts';", "const { safeNow } = __deps['./utils/time.js'];"],
    ["import { safeNow, sessionNow } from './utils/time.js';", "const { safeNow, sessionNow } = __deps['./utils/time.js'];"],
    ["import { mergeBusyUntil, safeNow, sessionNow } from './utils/time.ts';", "const { mergeBusyUntil, safeNow, sessionNow } = __deps['./utils/time.js'];"],
    ["import { mergeBusyUntil, safeNow, sessionNow } from './utils/time.js';", "const { mergeBusyUntil, safeNow, sessionNow } = __deps['./utils/time.js'];"],
    ["import { safeNow, sessionNow } from './utils/time.ts';", "const { safeNow, sessionNow } = __deps['./utils/time.js'];"],
    ["import { sessionNow } from './utils/time.ts';", "const { sessionNow } = __deps['./utils/time.js'];"],
    ["import { initializeFury, startFuryTurn, spendFury, resolveUltCost, setFury, clearFreshSummon } from './utils/fury.js';", "const { initializeFury, startFuryTurn, spendFury, resolveUltCost, setFury, clearFreshSummon } = __deps['./utils/fury.js'];"],
    ["import { nextTurnInterleaved } from './turns/interleaved.ts';", "const { nextTurnInterleaved } = __deps['./turns/interleaved.js'];"],
    ['import { nextTurnInterleaved } from "./turns/interleaved.ts";', "const { nextTurnInterleaved } = __deps['./turns/interleaved.js'];"],
    ["import { slotToCell, slotIndex } from './engine.js';", "const { slotToCell, slotIndex } = __deps['./engine.js'];"],
    ["import { doBasicWithFollowups } from './combat.js';", "const { doBasicWithFollowups } = __deps['./combat.js'];"],
    ["import { nextTurnInterleaved } from './turns/interleaved.js';", "const { nextTurnInterleaved } = __deps['./turns/interleaved.js'];"],
    ['import { nextTurnInterleaved } from "./turns/interleaved.js";', "const { nextTurnInterleaved } = __deps['./turns/interleaved.js'];"]
  ]);

  for (const [needle, replacement] of replacements.entries()){
    code = code.replace(needle, replacement);
  }

  code = code.replace(/export function /g, 'function ');
  code = code.replace(/export const /g, 'const ');
  const transpiledMain = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
      esModuleInterop: true
    },
    fileName: 'turns.ts'
  });
  code = bindVmDependencies(transpiledMain.outputText);
  code += '\nmodule.exports = { stepTurn, spawnQueuedIfDue, tickMinionTTL, getActiveAt, predictSpawnCycle, doActionOrSkip };\n';
  assertVmModuleIntegrity(code, 'turns.ts');

  const eventLog = [];
  const defaultDeps = {
    './combat/kernel/life-cycle.ts': {
      isCombatAlive: combatPresence.isCombatAlive,
      markRemoved(unit){ unit.lifeState = 'removed'; unit.alive = false; }
    },
    './combat/kernel/index.ts': {
      createNaturalAction(game, actor){ return { actionId: `harness-${actor.iid ?? actor.id}`, chainId: `harness-${actor.iid ?? actor.id}`, parentActionId: null }; },
      ensureCombatIdentity(unit){ return unit; },
      withActionExecution(_game, _context, action){ return action(); }
    },
    './combat/kernel/delayed-revive.ts': { emitSsiTemporalEvent(){ } },
    './combat/number-utils.ts': { normalizeCombatHpState(unit){ return { hp: Number(unit.hp ?? 0), hpMax: Number(unit.hpMax ?? unit.hp ?? 1) }; } },
    './combat/roster-runtime-definitions.ts': { requireCharacterRuntimeDefinition(){ return {}; } },
    './combat/unit-runtime-hooks.ts': { runRuntimeActionEnd(){}, runRuntimeUnitRevive(){}, runRuntimeTurnEnd(){}, runRuntimeTurnStart(){} },
    './combat/chap-minh-runtime.ts': { applyChapMinhActionEnd(){}, recoverChapMinhMaxHpPerTurn(){}, refreshChapMinhOwnership(){} },
    './utils/rng.ts': { nextRngValue(){ return 0.5; } },
    './utils/domain-normalization.ts': { normalizeClassName(value){ return value; }, normalizeElementKey(value){ return value; } },
    './utils/unique-global.ts': { isUniqueGlobalSummonBlocked(){ return false; } },
    './utils/player-profile.ts': { loadPlayerProfile(){ return {}; } },
    './engine.js': {
      slotToCell(side, slot){
        const index = Math.max(0, (slot|0) - 1);
        const baseCol = Math.floor(index / 3);
        const cy = index % 3;
        const cx = side === 'enemy' ? baseCol + 3 : baseCol;
        return { cx, cy };
      },
      slotIndex(side, cx, cy){
        const baseCol = side === 'enemy' ? cx - 3 : cx;
        return baseCol * 3 + cy + 1;
      }
    },
    './statuses.ts': {
      Statuses: {
        onTurnStart(){},
        canAct(){ return true; },
        onTurnEnd(){},
        blocks(){ return false; }
      }
    },
    './combat.js': {
      doBasicWithFollowups(){ },
      healUnit(){ return 0; }
    },
    './combat/perform-active-skill.ts': {
      performActiveSkill(){ return { ok: false, appliedTags: [], targetCount: 0 }; }
    },
    './aether.ts': {
      globalAetherPool: {
        gain(){},
        consume(){ return true; },
        current(){ return 0; },
      },
      resolveActionAetherRegen(){ return 5; },
    },
    './ai.ts': {
      evaluateGambitLogic(){ return { action: null, slotIndex: -1, reason: 'noMatch' }; }
    },
    './leader-uyen.ts': {
      isAnyLeaderUltReady(){ return false; },
      isUyenLeader(){ return false; },
      grantUyenSummonRage(){},
      hasQueuedUyenUlt(){ return false; },
      clearQueuedUyenUlt(){},
    },
    './modes/pve/collection-mapper.ts': {
      resolveRuntimeUnitStats(){ return {}; }
    },
    './cultivation.ts': {
      applyCultivationBonus(stats){ return stats; }
    },
    './config.ts': {
      CFG: {
        fury: { turn: { startGain: 0 } },
        FOLLOWUP_CAP_DEFAULT: 0
      }
    },
    './meta.ts': {
      makeInstanceStats(){ return {}; },
      initialRageFor(){ return 0; }
    },
    './vfx.ts': {
      vfxAddSpawn(){ },
      vfxAddBloodPulse(){ },
      asSessionWithVfx(){ return null; }
    },
    './vfx.js': {
      vfxAddSpawn(){ },
      vfxAddBloodPulse(){ }
    },
    './art.ts': {
      getUnitArt(){ return {}; }
    },
    './passives.ts': {
      emitPassiveEvent(){ },
      applyOnSpawnEffects(){ },
      prepareUnitForPassives(){ },
      getPassiveLog(){ return []; }
    },
    './events.ts': {
      emitGameEvent(type, detail){
        eventLog.push({ type, detail });
      },
      TURN_START: 'TURN_START',
      TURN_END: 'TURN_END',
      ACTION_START: 'ACTION_START',
      ACTION_END: 'ACTION_END',
      TURN_REGEN: 'turn:regen'
    },
    './utils/time.js': {
      safeNow(){ return 0; },
      sessionNow(){ return 0; },
      mergeBusyUntil(previous, startedAt, duration){
        const prev = Number.isFinite(previous) ? Number(previous) : 0;
        const start = Number.isFinite(startedAt) ? Number(startedAt) : 0;
        const dur = Number.isFinite(duration) ? Math.max(0, Number(duration)) : 0;
        return Math.max(prev, start + dur);
      }
    },
    './utils/fury.js': {
      initializeFury(){ },
      startFuryTurn(){ },
      spendFury(){ },
      resolveUltCost(){ return 0; },
      setFury(){ },
      clearFreshSummon(){ }
    },
    './turns/interleaved.js': null
  };

  const deps = { ...defaultDeps, ...overrides };
  deps['../engine.js'] = deps['../engine.js'] || deps['./engine.js'];
  deps['../statuses.ts'] = deps['../statuses.ts'] || deps['./statuses.ts'];
  deps['../vfx.ts'] = deps['../vfx.ts'] || deps['./vfx.ts'] || deps['./vfx.js'];
  deps['../passives.ts'] = deps['../passives.ts'] || deps['./passives.ts'];
  deps['../events.ts'] = deps['../events.ts'] || deps['./events.ts'];
  deps['../meta.ts'] = deps['../meta.ts'] || deps['./meta.ts'];
  deps['../modes/pve/collection-mapper.ts'] = deps['../modes/pve/collection-mapper.ts'] || deps['./modes/pve/collection-mapper.ts'];
  deps['../cultivation.ts'] = deps['../cultivation.ts'] || deps['./cultivation.ts'];
  deps['../ai.ts'] = deps['../ai.ts'] || deps['./ai.ts'];
  deps['../leader-uyen.ts'] = deps['../leader-uyen.ts'] || deps['./leader-uyen.ts'];
  deps['../combat/perform-active-skill.ts'] = deps['../combat/perform-active-skill.ts'] || deps['./combat/perform-active-skill.ts'];
  deps['../combat/kernel/life-cycle.ts'] = deps['../combat/kernel/life-cycle.ts'] || deps['./combat/kernel/life-cycle.ts'];
  deps['./combat.ts'] = deps['./combat.ts'] || deps['./combat.js'];

  const interleavedKey = './turns/interleaved.js';
  const interleavedAltKey = '../turns/interleaved.js';
  let interleavedModule = deps[interleavedKey] || deps[interleavedAltKey];
  if (!interleavedModule){
    const interleavedPath = path.resolve(here, '../../src/turns/interleaved.ts');
    let interleavedCode = await fs.readFile(interleavedPath, 'utf8');
    const interleavedReplacements = new Map([
      ["import { slotIndex } from '../engine.ts';", "const { slotIndex } = __deps['../engine.js'];"],
      ["import { isCombatAlive } from '../combat/kernel/life-cycle.ts';", "const { isCombatAlive } = __deps['../combat/kernel/life-cycle.ts'];"],
      ["import { Statuses } from '../statuses.ts';", "const { Statuses } = __deps['../statuses.ts'];"],
      ["import { Statuses } from '../statuses.js';", "const { Statuses } = __deps['../statuses.ts'];"],
      ["import { slotIndex } from '../engine.js';", "const { slotIndex } = __deps['../engine.js'];"]
    ]);
    for (const [needle, replacement] of interleavedReplacements.entries()){
      interleavedCode = interleavedCode.replace(needle, replacement);
    }
    interleavedCode = interleavedCode.replace(/export function /g, 'function ');
    const transpiledInterleaved = ts.transpileModule(interleavedCode, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
        esModuleInterop: true
      },
      fileName: 'turns/interleaved.ts'
    });
    interleavedCode = bindVmDependencies(transpiledInterleaved.outputText);
    interleavedCode += '\nmodule.exports = { findNextOccupiedPos, nextTurnInterleaved };\n';
    assertVmModuleIntegrity(interleavedCode, 'turns/interleaved.ts');
    const interleavedContext = {
      module: { exports: {} },
      exports: {},
      __deps: deps,
      __loadDependency(specifier){
        if (!Object.hasOwn(deps, specifier)) throw new Error(`turns/interleaved.ts: undeclared VM dependency ${specifier}`);
        return deps[specifier];
      }
    };
    vm.createContext(interleavedContext);
    const interleavedScript = new vm.Script(interleavedCode, { filename: 'turns/interleaved.js' });
    interleavedScript.runInContext(interleavedContext);
    interleavedModule = interleavedContext.module.exports;
  }
  if (!interleavedModule){
    throw new Error('loadTurnsHarness: missing ./turns/interleaved.js dependency');
  }
  if (typeof interleavedModule.nextTurnInterleaved !== 'function'){
    throw new Error('loadTurnsHarness: nextTurnInterleaved helper is unavailable');
  }
  deps[interleavedKey] = interleavedModule;
  deps[interleavedAltKey] = interleavedModule;
  deps['./turns/interleaved.ts'] = interleavedModule;
  const context = {
    module: { exports: {} },
    exports: {},
    __deps: deps,
    nextTurnInterleaved: interleavedModule.nextTurnInterleaved,
    __loadDependency(specifier){
      if (!Object.hasOwn(deps, specifier)) throw new Error(`turns.ts: undeclared VM dependency ${specifier}`);
      return deps[specifier];
    }
  };
  vm.createContext(context);
  const script = new vm.Script(code, { filename: 'turns.ts' });
  script.runInContext(context);
  return { ...context.module.exports, deps, eventLog };
}

export async function loadSummonHarness(overrides = {}){
  const here = path.dirname(fileURLToPath(import.meta.url));
  const filePath = path.resolve(here, '../../src/summon.ts');
  let code = await fs.readFile(filePath, 'utf8');

  const replacements = new Map([
    ["import { slotToCell, cellReserved } from './engine.ts';", "const { slotToCell, cellReserved } = __deps['./engine.js'];"],
    ["import { asSessionWithVfx, vfxAddSpawn } from './vfx.ts';", "const { asSessionWithVfx, vfxAddSpawn } = __deps['./vfx.ts'];"],
    ["import { getUnitArt } from './art.ts';", "const { getUnitArt } = __deps['./art.ts'];"],
    ["import { kitSupportsSummon } from './utils/kit.ts';", "const { kitSupportsSummon } = __deps['./utils/kit.ts'];"],
    ["import { prepareUnitForPassives, applyOnSpawnEffects } from './passives.ts';", "const { prepareUnitForPassives, applyOnSpawnEffects } = __deps['./passives.ts'];"],
    ["import { prepareUnitForPassives, applyOnSpawnEffects } from './passives.js';", "const { prepareUnitForPassives, applyOnSpawnEffects } = __deps['./passives.ts'];"]
  ]);

  for (const [needle, replacement] of replacements.entries()){
    code = code.replace(needle, replacement);
  }

  code = code.replace(/export function /g, 'function ');
  code = code.replace(/export const /g, 'const ');
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
      esModuleInterop: true
    },
    fileName: 'summon.ts'
  });
  code = transpiled.outputText;
  code += '\nmodule.exports = { enqueueImmediate, processActionChain };\n';

  const defaultDeps = {
    './engine.js': {
      slotToCell(side, slot){
        const index = Math.max(0, (slot|0) - 1);
        const baseCol = Math.floor(index / 3);
        const cy = index % 3;
        const cx = side === 'enemy' ? baseCol + 3 : baseCol;
        return { cx, cy };
      },
      cellReserved(tokens = [], queued = { ally: new Map(), enemy: new Map() }, cx, cy){
        const occupied = Array.isArray(tokens)
          && tokens.some((t) => t && t.alive && t.cx === cx && t.cy === cy);
        if (occupied) return true;
        const checkQueued = (sideMap) => {
          if (!sideMap || typeof sideMap.forEach !== 'function') return false;
          let found = false;
          sideMap.forEach((entries) => {
            if (found) return;
            if (!Array.isArray(entries)) return;
            for (const item of entries){
              if (item && item.cx === cx && item.cy === cy){
                found = true;
                break;
              }
            }
          });
          return found;
        };
        return checkQueued(queued?.ally) || checkQueued(queued?.enemy);
      }
    },
    './vfx.ts': {
      asSessionWithVfx(){ return null; },
      vfxAddSpawn(){ }
    },
    './art.ts': {
      getUnitArt(){ return {}; }
    },
    './utils/kit.ts': {
      kitSupportsSummon(){ return true; }
    },
    './passives.ts': {
      prepareUnitForPassives(){ },
      applyOnSpawnEffects(){ }
    }
  };

  const deps = { ...defaultDeps, ...overrides };
  deps['../engine.js'] = deps['../engine.js'] || deps['./engine.js'];
  deps['../passives.ts'] = deps['../passives.ts'] || deps['./passives.ts'];

  const context = {
    module: { exports: {} },
    exports: {},
    __deps: deps
  };
  vm.createContext(context);
  const script = new vm.Script(code, { filename: 'summon.ts' });
  script.runInContext(context);
  return { ...context.module.exports, deps };
}