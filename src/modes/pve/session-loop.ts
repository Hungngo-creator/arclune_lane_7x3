import { aiMaybeAct } from '../../ai';
import { stepTurn } from '../../turns';
import { normalizeAnimationFrameTimestamp, safeNow, sessionNow } from '../../utils/time';

import type { SessionState } from '@shared-types/pve';

type ClockState = {
  startMs: number;
  startSafeMs: number;
  lastTimerRemain: number;
  lastCostCreditedSec: number;
  turnEveryMs: number;
  lastTurnStepMs: number;
  lastFrameMs: number;
  lastLogicMs: number;
  costAccumulator: number;
  lastTimerText: string | null;
};

type SessionLoopDeps = {
  getGame: () => SessionState | null;
  isRunning: () => boolean;
  isBattleOver: (game: SessionState) => boolean;
  resolveTurnIntervalMs: () => number;
  normalizeTurnBusyUntil: (turnState: SessionState['turn'] | null | undefined) => number;
  runBattleEndCheck: (
    trigger: 'leader-immediate' | 'post-turn' | 'timeout',
    timestamp: number,
    remain?: number,
  ) => unknown;
  getTimerElement: () => HTMLElement | null;
  resolveTimerElement: () => void;
  applyCostGain: (target: SessionState | SessionState['ai'] | null | undefined, amount: number) => boolean;
  onHudUpdate: (game: SessionState) => void;
  onDeckReevaluate: () => void;
  onRenderSummonBar: () => void;
  onSyncLeaderUltControls: () => void;
  onBoardMutation: () => void;
  processCreepDeathHealing: (now: number) => void;
  cleanupDead: (now: number) => void;
  stepTurnContext: Parameters<typeof stepTurn>[1];
  getRequestAnimationFrame: (() => ((cb: FrameRequestCallback) => number) | null);
  getCancelAnimationFrame: (() => ((id: number) => void) | null);
  logError: (message: string, error: unknown) => void;
  supportsPerfNow: boolean;
};

type TickHandle = number | ReturnType<typeof setTimeout>;

type LoopController = {
  startLoop: () => void;
  stopLoop: () => void;
  tick: (timestamp?: number) => void;
};

const RAF_TIMESTAMP_MAX = 2_147_483_647;
const CLOCK_DRIFT_TOLERANCE_MS = 120_000;
const LOGIC_MIN_INTERVAL_MS = 40;
const MAX_TURNS_PER_TICK = 6;

const resolveClockTurnIntervalMs = (clock: ClockState, resolveTurnIntervalMs: () => number): number => {
  const current = clock.turnEveryMs;
  if (Number.isFinite(current) && current > 0) return current;
  const fallback = resolveTurnIntervalMs();
  clock.turnEveryMs = fallback;
  return fallback;
};

const createClock = (resolveTurnIntervalMs: () => number): ClockState => {
  const safe = safeNow();
  const now = sessionNow();
  const turnEveryMs = resolveTurnIntervalMs();
  return {
    startMs: now,
    startSafeMs: safe,
    lastTimerRemain: 240,
    lastCostCreditedSec: 0,
    turnEveryMs,
    lastTurnStepMs: now - turnEveryMs,
    lastFrameMs: now,
    lastLogicMs: now - LOGIC_MIN_INTERVAL_MS,
    costAccumulator: 0,
    lastTimerText: null,
  };
};

export function createSessionLoopController(deps: SessionLoopDeps): LoopController {
  let clock: ClockState | null = null;
  let tickLoopHandle: TickHandle | null = null;
  let tickLoopUsesTimeout = false;

  const stopLoop = (): void => {
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

  const updateTimerAndCost = (timestamp?: number): void => {
    if (!clock) return;
    const game = deps.getGame();
    if (!game) return;
    if (deps.isBattleOver(game)) return;

    const turnEveryMs = resolveClockTurnIntervalMs(clock, deps.resolveTurnIntervalMs);
    const safeNowMs = safeNow();
    const sessionNowMsRaw = sessionNow();
    let forcedElapsedSec: number | null = null;
    const safeDelta = safeNowMs - clock.startSafeMs;
    const previousStartMs = Number.isFinite(clock.startMs) ? clock.startMs : null;
    const sessionWentBack = previousStartMs !== null
      && Number.isFinite(sessionNowMsRaw)
      && sessionNowMsRaw < previousStartMs;
    if (safeDelta < -CLOCK_DRIFT_TOLERANCE_MS || sessionWentBack) {
      const previousElapsedSec = Number.isFinite(clock.lastCostCreditedSec)
        ? Math.max(0, clock.lastCostCreditedSec)
        : Math.max(0, 240 - (Number.isFinite(clock.lastTimerRemain) ? clock.lastTimerRemain : 240));
      const previousRemain = Number.isFinite(clock.lastTimerRemain)
        ? Math.max(0, clock.lastTimerRemain)
        : Math.max(0, 240 - previousElapsedSec);
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
      const nextTimerText = `${mm}:${ss}`;
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

  const scheduleTickLoop = (): void => {
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

  const runTickLoop = (timestamp?: number): void => {
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
      if ((game?.runtime as { actionFault?: Error } | undefined)?.actionFault) return;
    }
    if (!deps.isRunning() || !clock) return;
    scheduleTickLoop();
  };

  const startLoop = (): void => {
    stopLoop();
    clock = createClock(deps.resolveTurnIntervalMs);
    updateTimerAndCost();
    scheduleTickLoop();
  };

  return {
    startLoop,
    stopLoop,
    tick: updateTimerAndCost,
  };
}
