import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadConfig(){
  const filePath = path.resolve(__dirname, '../src/config.js');
  let code = await fs.readFile(filePath, 'utf8');
  code = code.replace(/export const /g, 'const ');
  code += '\nmodule.exports = { CFG };\n';
  const context = { module: { exports: {} }, exports: {} };
  vm.createContext(context);
  const script = new vm.Script(code, { filename: 'config.js' });
  script.runInContext(context);
  return context.module.exports.CFG;
}

async function loadFuryHarness(overrides = {}){
  const filePath = path.resolve(__dirname, '../src/utils/fury.js');
  let code = await fs.readFile(filePath, 'utf8');

  const replacements = new Map([
    ["import { CFG } from '../config.js';", "const { CFG } = __deps['../config.js'];"],
    ["import { safeNow } from './time.js';", "const { safeNow } = __deps['./time.js'];"]
  ]);

  for (const [needle, replacement] of replacements.entries()){
    code = code.replace(needle, replacement);
  }

  code = code.replace(/export function /g, 'function ');
  code = code.replace(/export const /g, 'const ');
  code += '\nmodule.exports = { initializeFury, startFuryTurn, startFurySkill, finishFuryHit, gainFury, drainFury, furyState, setFury, markFreshSummon };\n';

  const cfg = await loadConfig();
  const defaultDeps = {
    '../config.js': { CFG: cfg },
    './time.js': { safeNow: () => 0 }
  };

  const deps = {
    ...defaultDeps,
    ...(overrides.deps || {})
  };

  const context = {
    module: { exports: {} },
    exports: {},
    __deps: deps
  };

  vm.createContext(context);
  const script = new vm.Script(code, { filename: 'fury.js' });
  script.runInContext(context);

  return { ...context.module.exports, deps, CFG: cfg };
}

const furyHarnessPromise = loadFuryHarness();

test('cộng nộ đơn mục tiêu theo % HP và khóa 30 mỗi kỹ năng', async () => {
  const { initializeFury, startFuryTurn, startFurySkill, finishFuryHit, gainFury, furyState } = await furyHarnessPromise;
  const attacker = { id: 'hero', hpMax: 500 };
  initializeFury(attacker, attacker.id, 0);
  startFuryTurn(attacker, { grantStart: false });
  startFurySkill(attacker, { tag: 'skill' });

  const first = gainFury(attacker, {
    type: 'ability',
    dealt: 200,
    targetsHit: 1,
    targetMaxHp: 800
  });
  assert.equal(first, 9);
  finishFuryHit(attacker);

  const second = gainFury(attacker, {
    type: 'ability',
    dealt: 400,
    targetsHit: 1,
    targetMaxHp: 400
  });
  assert.equal(second, 16);
  finishFuryHit(attacker);

  const third = gainFury(attacker, {
    type: 'ability',
    dealt: 600,
    targetsHit: 1,
    targetMaxHp: 300
  });
  assert.equal(third, 5);
  assert.equal(attacker.fury, 30);

  const state = furyState(attacker);
  assert.equal(state.skillGain, 30);
});

test('cộng nộ diện rộng bị khóa +12 phần mỗi mục tiêu', async () => {
  const { initializeFury, startFuryTurn, startFurySkill, finishFuryHit, gainFury } = await furyHarnessPromise;
  const caster = { id: 'caster', hpMax: 450 };
  initializeFury(caster, caster.id, 0);
  startFuryTurn(caster, { grantStart: false });
  startFurySkill(caster, { tag: 'aoe' });

  const first = gainFury(caster, {
    type: 'ability',
    dealt: 90,
    isAoE: true,
    targetsHit: 6,
    targetMaxHp: 300
  });
  assert.equal(first, 17);
  finishFuryHit(caster);

  const second = gainFury(caster, {
    type: 'ability',
    dealt: 120,
    isAoE: true,
    targetsHit: 3,
    targetMaxHp: 600
  });
  assert.equal(second, 4);

  startFurySkill(caster, { tag: 'aoe', forceReset: true });
  const reset = gainFury(caster, {
    type: 'ability',
    dealt: 90,
    isAoE: true,
    targetsHit: 6,
    targetMaxHp: 300
  });
  assert.equal(reset, 17);
});

test('cộng nộ khi nhận sát thương dùng HP tối đa của bản thân', async () => {
  const { initializeFury, startFuryTurn, gainFury } = await furyHarnessPromise;
  const defender = { id: 'tank', hpMax: 600 };
  initializeFury(defender, defender.id, 0);
  startFuryTurn(defender, { grantStart: false });

  const gained = gainFury(defender, {
    type: 'damageTaken',
    dealt: 90,
    selfMaxHp: defender.hpMax,
    damageTaken: 90
  });
  assert.equal(gained, 5);
});

test('trừ nộ dựa base + % và khóa tổng 40 mỗi kỹ năng, bỏ qua fresh summon', async () => {
  const { initializeFury, startFuryTurn, startFurySkill, drainFury, setFury, markFreshSummon } = await furyHarnessPromise;
  const source = { id: 'drain' };
  const target = { id: 'victim', hpMax: 500 };
  initializeFury(source, source.id, 0);
  initializeFury(target, target.id, 0);
  setFury(target, 80);

  startFuryTurn(source, { grantStart: false });
  startFuryTurn(target, { grantStart: false });
  startFurySkill(source, { tag: 'drain' });

  const first = drainFury(source, target, {});
  assert.equal(first, 30);
  assert.equal(target.fury, 50);

  const second = drainFury(source, target, {});
  assert.equal(second, 10);
  assert.equal(target.fury, 40);

  const third = drainFury(source, target, {});
  assert.equal(third, 0);
  assert.equal(target.fury, 40);

  startFurySkill(source, { tag: 'drain', forceReset: true });
  const fourth = drainFury(source, target, {});
  assert.equal(fourth, 20);
  assert.equal(target.fury, 20);

  const fresh = { id: 'fresh', hpMax: 400 };
  initializeFury(fresh, fresh.id, 0);
  setFury(fresh, 50);
  markFreshSummon(fresh, true);
  const skip = drainFury(source, fresh, {});
  assert.equal(skip, 0);
  assert.equal(fresh.fury, 50);
});
