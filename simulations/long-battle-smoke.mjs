import { loadTurnsHarness } from '../test/helpers/turns-harness.mjs';

const TOTAL_STEPS = 1200;
const P95_LIMIT_MS = 8;
const MAX_LIMIT_MS = 20;
const STALL_GUARD = 120;

const harness = await loadTurnsHarness({
  './vfx.ts': { vfxAddSpawn(){}, vfxAddBloodPulse(){}, asSessionWithVfx(){ return null; } },
  './passives.ts': { emitPassiveEvent(){}, applyOnSpawnEffects(){}, getPassiveLog(){ return []; }, prepareUnitForPassives(){} },
  './modes/pve/collection-mapper.ts': { resolveRuntimeUnitStats(){ return { hp: 100, hpMax: 100, atk: 10, res: 5, wil: 5 }; } },
  './cultivation.ts': { applyCultivationBonus(input){ return input; } },
});
const { stepTurn } = harness;

const Game = {
  tokens: [
    { id: 'ally_unit', iid: 1, side: 'ally', cx: 0, cy: 0, alive: true, hp: 100, hpMax: 100, statuses: [] },
    { id: 'enemy_unit', iid: 2, side: 'enemy', cx: 3, cy: 0, alive: true, hp: 100, hpMax: 100, statuses: [] },
  ],
  meta: new Map([
    ['ally_unit', { followupCap: 0, skills: [] }],
    ['enemy_unit', { followupCap: 0, skills: [] }],
  ]),
  queued: { ally: new Map(), enemy: new Map() },
  turn: { mode: 'interleaved_by_position', allyPos: 1, enemyPos: 1, cycle: 0, busyUntil: 0 },
  battle: { over: false },
};

const hooks = {
  doActionOrSkip: harness.doActionOrSkip,
  processActionChain: () => ({ consumed: false, triggered: false }),
  performUlt: () => {},
  allocIid: () => 999,
};

const stepCosts = [];
let loopGuardTriggered = false;
let stalledCycles = 0;
let stallRun = 0;
let lastCycle = Number(Game.turn.cycle ?? 0);

for (let i = 0; i < TOTAL_STEPS; i += 1) {
  const t0 = Date.now();
  stepTurn(Game, hooks);
  const dt = Date.now() - t0;
  stepCosts.push(dt);

  const cycle = Number(Game.turn.cycle ?? 0);
  if (cycle === lastCycle) {
    stallRun += 1;
  } else {
    lastCycle = cycle;
    stallRun = 0;
  }

  if (stallRun > STALL_GUARD) {
    loopGuardTriggered = true;
    stalledCycles += 1;
    break;
  }
}

const sorted = [...stepCosts].sort((a, b) => a - b);
const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ?? 0;
const max = sorted[sorted.length - 1] ?? 0;

const summary = { totalSteps: stepCosts.length, p95, max, stalledCycles, loopGuardTriggered };
console.log('[long-battle-smoke]', JSON.stringify(summary));

if (
  summary.totalSteps < TOTAL_STEPS
  || summary.p95 > P95_LIMIT_MS
  || summary.max > MAX_LIMIT_MS
  || summary.stalledCycles > 0
  || summary.loopGuardTriggered
) {
  process.exitCode = 1;
}
