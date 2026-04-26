import type {
  EncounterState,
  RewardRoll,
  SessionRuntimeState,
  SessionState,
  WaveState,
} from '@shared-types/pve';
import type { GameEventHandler, GameEventType } from '../../events.ts';

import { addGameEventListener } from '../../events.ts';
import {
  createPveSession as createPveSessionImpl,
  __getStoredConfig,
  __getActiveGame,
  __resolveStatusIconPreview,
} from './session-runtime-impl.ts';

type RewardList = ReadonlyArray<RewardRoll>;
type MutableRewardList = RewardRoll[];
type RewardListContainer = SessionRuntimeState | EncounterState;
type RewardListKey = 'rewardQueue' | 'pendingRewards';
const NOOP_UNSUBSCRIBE = (): void => {};
const SMALL_REWARD_MERGE_SIZE = 6;
const SANITIZED_REWARD_LIST = Symbol('sanitized-reward-list');
const REWARD_INDEX_BY_ID = Symbol('reward-index-by-id');

type SanitizedRewardList = MutableRewardList & {
  [SANITIZED_REWARD_LIST]?: true;
  [REWARD_INDEX_BY_ID]?: Map<string, number>;
};

function isReward(entry: RewardRoll | null | undefined): entry is RewardRoll {
  if (!entry || typeof entry !== 'object') return false;
  if (typeof entry.id !== 'string' || !entry.id.length) return false;
  if (typeof entry.weight !== 'number' || !Number.isFinite(entry.weight)) return false;
  if (typeof entry.tier !== 'number' || !Number.isFinite(entry.tier)) return false;
  if (entry.data != null && typeof entry.data !== 'object') return false;
  return true;
}

function sanitizeRewardListInPlace(list: SanitizedRewardList): SanitizedRewardList {
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
    configurable: true,
  });
  list[REWARD_INDEX_BY_ID] = undefined;
  return list;
}

function getMutableRewardList(container: RewardListContainer, key: RewardListKey): SanitizedRewardList {
  const store = container as unknown as Record<string, unknown>;
  const source = store[key];
  const list = Array.isArray(source)
    ? sanitizeRewardListInPlace(source as SanitizedRewardList)
    : sanitizeRewardListInPlace([] as SanitizedRewardList);
  store[key] = list;
  return list;
}

function mergeRewardsInPlace(list: SanitizedRewardList, additions: RewardList): SanitizedRewardList {
  if (!additions.length) return list;
  const useIndexedMerge = list.length > SMALL_REWARD_MERGE_SIZE || additions.length > SMALL_REWARD_MERGE_SIZE;
  const indexById = useIndexedMerge
    ? (list[REWARD_INDEX_BY_ID] ?? new Map<string, number>())
    : null;
  if (indexById) {
    if (indexById.size === 0) {
      for (let index = 0; index < list.length; index += 1) {
        const entry = list[index];
        if (entry) indexById.set(entry.id, index);
      }
    }
    list[REWARD_INDEX_BY_ID] = indexById;
  }

  for (let addIndex = 0; addIndex < additions.length; addIndex += 1) {
    const reward = additions[addIndex];
    if (!reward) continue;
    let existingIndex: number | undefined;
    if (indexById) {
      existingIndex = indexById.get(reward.id);
    } else {
      for (let listIndex = 0; listIndex < list.length; listIndex += 1) {
        if (list[listIndex]?.id === reward.id) {
          existingIndex = listIndex;
          break;
        }
      }
    }

    if (existingIndex == null) {
      if (indexById) indexById.set(reward.id, list.length);
      list.push(reward);
    } else {
      list[existingIndex] = reward;
    }
  }
  return list;
}

function removeRewardById(list: SanitizedRewardList, rewardId: string): SanitizedRewardList {
  for (let index = 0; index < list.length; index += 1) {
    if (list[index]?.id === rewardId) {
      list.splice(index, 1);
      list[REWARD_INDEX_BY_ID] = undefined;
      break;
    }
  }
  return list;
}

function syncWaveRewards(runtime: SessionRuntimeState, encounter: EncounterState, rewards: RewardList): void {
  const rewardQueue = getMutableRewardList(runtime, 'rewardQueue');
  const pendingRewards = getMutableRewardList(encounter, 'pendingRewards');
  const mergedRewardQueue = mergeRewardsInPlace(rewardQueue, rewards);
  encounter.pendingRewards = rewardQueue === pendingRewards
    ? mergedRewardQueue
    : mergeRewardsInPlace(pendingRewards, rewards);
}

function removeRewardEverywhere(runtime: SessionRuntimeState, rewardId: string): void {
  removeRewardById(getMutableRewardList(runtime, 'rewardQueue'), rewardId);
  const encounter = runtime.encounter;
  if (encounter) removeRewardById(getMutableRewardList(encounter, 'pendingRewards'), rewardId);
}

function markEncounterCompleted(runtime: SessionRuntimeState, encounter: EncounterState): EncounterState {
  encounter.status = 'completed';
  runtime.wave = null;
  return encounter;
}

export function advanceSession(session: SessionState | null | undefined): EncounterState | null {
  const runtime = session?.runtime;
  if (!runtime) return null;
  const encounter = runtime.encounter;
  if (!encounter) {
    runtime.wave = null;
    return null;
  }

  const waves = Array.isArray(encounter.waves) ? encounter.waves : [];
  const index = Math.max(0, encounter.waveIndex | 0);
  const wave = (waves[index] as WaveState | null | undefined) ?? null;
  if (!wave) return markEncounterCompleted(runtime, encounter);

  if (wave.status === 'pending') {
    wave.status = 'spawning';
    runtime.wave = wave;
    if (encounter.status === 'idle') encounter.status = 'running';
  } else if (wave.status === 'spawning') {
    wave.status = 'active';
    runtime.wave = wave;
    encounter.status = 'running';
  } else if (wave.status === 'active') {
    wave.status = 'cleared';
    runtime.wave = null;
  encounter.waveIndex = index + 1;
    const rewards = Array.isArray(wave.rewards)
      ? sanitizeRewardListInPlace(wave.rewards as SanitizedRewardList)
      : ([] as SanitizedRewardList);
    if (rewards.length) syncWaveRewards(runtime, encounter, rewards);
  } else if (wave.status === 'cleared') {
    runtime.wave = null;
    encounter.waveIndex = index + 1;
  } else {
    runtime.wave = null;
  }

  if (encounter.waveIndex >= waves.length) {
    return markEncounterCompleted(runtime, encounter);
  }
  return encounter;
}

export function applyReward(
  session: SessionState | null | undefined,
  reward: RewardRoll | null | undefined,
): RewardRoll | null {
  if (!session?.runtime || !isReward(reward)) return null;
  removeRewardEverywhere(session.runtime, reward.id);
  return reward;
}

export function onSessionEvent<T extends GameEventType>(
  type: T,
  handler: GameEventHandler<T>,
): () => void {
  if (!type || typeof handler !== 'function') return NOOP_UNSUBSCRIBE;
  return addGameEventListener(type, handler);
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
  const controller = createPveSessionImpl(rootEl, options) as ControllerWithEvents;
  controller.onEvent = onSessionEvent;
  return controller;
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
} from '../../events.ts';
export { __resolveStatusIconPreview };