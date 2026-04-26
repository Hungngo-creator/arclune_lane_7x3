//home (termux)/arclune_lane_7x3/src/modes/pve/session-runtime.ts

import type {
  EncounterState,
  RewardRoll,
  SessionRuntimeState,
  SessionState,
  WaveState,
} from '@shared-types/pve';
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
  addGameEventListener,
} from '../../events.ts';
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

function isReward(entry: RewardRoll | null | undefined): entry is RewardRoll {
  if (!entry || typeof entry !== 'object') return false;
  if (typeof entry.id !== 'string' || !entry.id.length) return false;
  if (typeof entry.weight !== 'number' || !Number.isFinite(entry.weight)) return false;
  if (typeof entry.tier !== 'number' || !Number.isFinite(entry.tier)) return false;
  if (entry.data != null && typeof entry.data !== 'object') return false;
  return true;
}

function toSanitizedRewardList(value: unknown): MutableRewardList {
  if (!Array.isArray(value)) return [];
  let writeIndex = 0;
  for (let readIndex = 0; readIndex < value.length; readIndex += 1) {
    const reward = value[readIndex] as RewardRoll | null | undefined;
    if (!isReward(reward)) continue;
    value[writeIndex] = reward;
    writeIndex += 1;
 }
 if (writeIndex !== value.length) value.length = writeIndex;
  return value as MutableRewardList;
}

function getMutableRewardList(
  container: RewardListContainer,
  key: RewardListKey,
): MutableRewardList {
  const store = container as unknown as Record<string, unknown>;
  const list = toSanitizedRewardList(store[key]);
  store[key] = list;
  return list;
}

const SMALL_REWARD_MERGE_SIZE = 6;

function mergeRewardsInPlaceLinear(list: MutableRewardList, additions: RewardList): MutableRewardList {
  for (const reward of additions) {
    let replaced = false;
    for (let index = 0; index < list.length; index += 1) {
      const existing = list[index];
      if (!existing || existing.id !== reward.id) continue;
      list[index] = reward;
      replaced = true;
      break;
    }
    if (!replaced) list.push(reward);
  }
  return list;
}

function mergeRewardsInPlaceIndexed(list: MutableRewardList, additions: RewardList): MutableRewardList {
  if (!additions.length) return list;
  const indexById = new Map<string, number>();
  for (let index = 0; index < list.length; index += 1) {
    const entry = list[index];
    if (!entry) continue;
    indexById.set(entry.id, index);
  }
  for (const reward of additions) {
    const index = indexById.get(reward.id);
    if (index == null) {
      indexById.set(reward.id, list.length);
      list.push(reward);
      continue;
    }
    list[index] = reward;
  }
  return list;
}

function mergeRewardsInPlace(list: MutableRewardList, additions: RewardList): MutableRewardList {
  if (!additions.length) return list;
  const useLinearMerge = list.length <= SMALL_REWARD_MERGE_SIZE && additions.length <= SMALL_REWARD_MERGE_SIZE;
  if (useLinearMerge) return mergeRewardsInPlaceLinear(list, additions);
  return mergeRewardsInPlaceIndexed(list, additions);
}

function updateRewards(container: RewardListContainer, key: RewardListKey, additions: RewardList): RewardRoll[] {
  if (!additions.length) return getMutableRewardList(container, key);
  const target = getMutableRewardList(container, key);
  return mergeRewardsInPlace(target, additions);
}

function removeRewardById(list: MutableRewardList, rewardId: string): MutableRewardList {
  if (!list.length) return list;
  let writeIndex = 0;
  for (let readIndex = 0; readIndex < list.length; readIndex += 1) {
    const entry = list[readIndex];
    if (!entry || entry.id === rewardId) continue;
    if (writeIndex !== readIndex) list[writeIndex] = entry;
    writeIndex += 1;
  }
  if (writeIndex < list.length) list.length = writeIndex;
  return list;
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
  const waveCount = waves.length;
  const index = Math.max(0, encounter.waveIndex | 0);
  const wave = (waves[index] as WaveState | null | undefined) ?? null;

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
      const rewards = toSanitizedRewardList(wave.rewards);
      if (rewards.length) {
        updateRewards(encounter, 'pendingRewards', rewards);
        updateRewards(runtime, 'rewardQueue', rewards);
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

  if (encounter.waveIndex >= waveCount) {
    encounter.status = 'completed';
    runtime.wave = null;
  }

  return encounter;
}

export function applyReward(
  session: SessionState | null | undefined,
  reward: RewardRoll | null | undefined,
): RewardRoll | null {
  if (!session?.runtime) return null;
  if (!isReward(reward)) return null;
  const runtime = session.runtime;
  removeRewardById(getMutableRewardList(runtime, 'rewardQueue'), reward.id);
  const encounter = runtime.encounter;
  if (encounter) {
    removeRewardById(getMutableRewardList(encounter, 'pendingRewards'), reward.id);
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
export { __resolveStatusIconPreview };