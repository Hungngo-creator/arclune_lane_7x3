// @ts-nocheck
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export async function loadTurnsHarness(overrides = {}){
  const here = path.dirname(fileURLToPath(import.meta.url));
  const filePath = path.resolve(here, '../../src/turns.ts');
  let code = await fs.readFile(filePath, 'utf8');

  const replacements = new Map([
    ["import { slotToCell, slotIndex } from './engine.ts';", "const { slotToCell, slotIndex } = __deps['./engine.js'];"],
    ["import { Statuses } from './statuses.ts';", "const { Statuses } = __deps['./statuses.ts'];"],
    ["import { Statuses } from './statuses.js';", "const { Statuses } = __deps['./statuses.ts'];"],
    ["import { doBasicWithFollowups } from './combat.ts';", "const { doBasicWithFollowups } = __deps['./combat.js'];"],
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
  code = transpiledMain.outputText;
  code += '\nmodule.exports = { stepTurn, spawnQueuedIfDue, tickMinionTTL, getActiveAt, predictSpawnCycle, doActionOrSkip };\n';

  const eventLog = [];
  const defaultDeps = {
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
      doBasicWithFollowups(){ }
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
      prepareUnitForPassives(){ }
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
      sessionNow(){ return 0; }
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

  const interleavedKey = './turns/interleaved.js';
  const interleavedAltKey = '../turns/interleaved.js';
  let interleavedModule = deps[interleavedKey] || deps[interleavedAltKey];
  if (!interleavedModule){
    const interleavedPath = path.resolve(here, '../../src/turns/interleaved.ts');
    let interleavedCode = await fs.readFile(interleavedPath, 'utf8');
    const interleavedReplacements = new Map([
      ["import { slotIndex } from '../engine.ts';", "const { slotIndex } = __deps['../engine.js'];"],
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
    interleavedCode = transpiledInterleaved.outputText;
    interleavedCode += '\nmodule.exports = { findNextOccupiedPos, nextTurnInterleaved };\n';
    const interleavedContext = {
      module: { exports: {} },
      exports: {},
      __deps: deps
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
  const context = {
    module: { exports: {} },
    exports: {},
    __deps: deps,
    nextTurnInterleaved: interleavedModule.nextTurnInterleaved
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