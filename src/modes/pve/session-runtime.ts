import type {
  EncounterState,
  RewardRoll,
  SessionRuntimeState,
  SessionState,
  WaveState,
} from '@types/pve';
import type { TurnSnapshot } from '@types/turn-order';
import type { GameEventHandler, GameEventType } from '../../events.ts';

import {
  gameEvents,
  emitGameEvent,
  TURN_START,
  TURN_END,
  ACTION_START,
  ACTION_END,
  TURN_REGEN,
  BATTLE_END,
} from '../../events.ts';
import {
  createPveSession as createPveSessionImpl,
  __getStoredConfig,
  __getActiveGame,
} from './session-runtime-impl.ts';

type RewardList = ReadonlyArray<RewardRoll>;
type MutableRewardList = RewardRoll[];
type SessionWithTurn = SessionState & { turn?: TurnSnapshot | null | undefined };

function isReward(entry: RewardRoll | null | undefined): entry is RewardRoll {
  return Boolean(entry && typeof entry.id === 'string');
}

function normalizeRewardList(value: unknown): RewardList {
  if (!Array.isArray(value)) return [];
  return value.filter(isReward);
}

function ensureRewardQueue(runtime: SessionRuntimeState): MutableRewardList {
  if (Array.isArray(runtime.rewardQueue)) {
    runtime.rewardQueue = runtime.rewardQueue.filter(isReward);
  } else {
    runtime.rewardQueue = [];
  }
  return runtime.rewardQueue;
}

function ensurePendingRewards(encounter: EncounterState): MutableRewardList {
  if (Array.isArray(encounter.pendingRewards)) {
    encounter.pendingRewards = encounter.pendingRewards.filter(isReward);
  } else {
    encounter.pendingRewards = [];
  }
  return encounter.pendingRewards;
}

function mergeRewards(existing: RewardList, additions: RewardList): RewardRoll[] {
  if (!existing.length && !additions.length) return [];
  if (!additions.length) return existing.slice();
  const map = new Map<string, RewardRoll>();
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

function updateRuntimeRewards(runtime: SessionRuntimeState, additions: RewardList): RewardRoll[] {
  const queue = ensureRewardQueue(runtime);
  const merged = mergeRewards(queue, additions);
  runtime.rewardQueue = merged;
  return merged;
}

function updateEncounterRewards(encounter: EncounterState, additions: RewardList): RewardRoll[] {
  const pending = ensurePendingRewards(encounter);
  const merged = mergeRewards(pending, additions);
  encounter.pendingRewards = merged;
  return merged;
}

function toWaveList(value: unknown): ReadonlyArray<WaveState> {
  if (!Array.isArray(value)) return [];
  return value.filter((wave): wave is WaveState => Boolean(wave));
}

function getTurnSnapshot(session: SessionState | null | undefined): TurnSnapshot | null {
  const turn = (session as SessionWithTurn | null | undefined)?.turn;
  return turn ?? null;
}

export function advanceSession(session: SessionState | null | undefined): EncounterState | null {
  const runtime = session?.runtime;
  if (!runtime) return null;
  const encounter = runtime.encounter;
  if (!encounter) {
    runtime.wave = null;
    return null;
  }

  ensureRewardQueue(runtime);
  ensurePendingRewards(encounter);

  const waves = toWaveList(encounter.waves);
  const index = Math.max(0, encounter.waveIndex | 0);
  const wave = waves[index] ?? null;

  if (!wave) {
    encounter.status = 'completed';
    runtime.wave = null;
    return encounter;
  }

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

  const currentTurn: TurnSnapshot | null = getTurnSnapshot(session);
  void currentTurn;

  return encounter;
}

export function applyReward(
  session: SessionState | null | undefined,
  reward: RewardRoll | null | undefined,
): RewardRoll | null {
  if (!session?.runtime) return null;
  if (!isReward(reward)) return null;
  const runtime = session.runtime;
  updateRuntimeRewards(runtime, [reward]);
  const encounter = runtime.encounter;
  if (encounter) {
    updateEncounterRewards(encounter, [reward]);
  }
  return reward;
}

export function onSessionEvent<T extends GameEventType>(
  type: T,
  handler: GameEventHandler<T>,
): () => void {
  if (!type || typeof handler !== 'function') {
    return () => {};
  }
  if (!gameEvents || typeof gameEvents.addEventListener !== 'function') {
    return () => {};
  }
  gameEvents.addEventListener(type, handler);
  return () => {
    if (typeof gameEvents.removeEventListener === 'function') {
      gameEvents.removeEventListener(type, handler);
    }
  };
}

type SessionController = ReturnType<typeof createPveSessionImpl>;

type ControllerWithEvents = SessionController & {
  onEvent: <T extends GameEventType>(
    type: T,
    handler: GameEventHandler<T>,
  ) => () => void;
};

export function createPveSession(
  rootEl: Parameters<typeof createPveSessionImpl>[0],
  options: Parameters<typeof createPveSessionImpl>[1] = {},
): ControllerWithEvents {
  const controller = createPveSessionImpl(rootEl, options);
  return {
    ...controller,
    onEvent: onSessionEvent,
  };
}

export { __getStoredConfig, __getActiveGame };
export {
  gameEvents,
  emitGameEvent,
  TURN_START,
  TURN_END,
  ACTION_START,
  ACTION_END,
  TURN_REGEN,
  BATTLE_END,
};