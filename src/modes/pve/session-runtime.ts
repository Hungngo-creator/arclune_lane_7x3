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

function isReward(entry: RewardRoll | null | undefined): entry is RewardRoll {
  return Boolean(entry && typeof entry.id === 'string');
}

function isRewardArray(value: unknown): value is MutableRewardList {
  return Array.isArray(value) && value.every(isReward);
}

function normalizeRewardList(value: unknown): RewardList {
  if (isRewardArray(value)) return value;
  if (!Array.isArray(value)) return [];
  return value.filter(isReward);
}

function sanitizeRewardList<T extends SessionRuntimeState | EncounterState>(
  container: T,
  key: T extends SessionRuntimeState ? 'rewardQueue' : 'pendingRewards',
): MutableRewardList {
  const source = container[key as keyof T] as unknown;
  const next = isRewardArray(source)
    ? source
    : Array.isArray(source)
      ? source.filter(isReward)
      : [];
  (container as unknown as Record<string, unknown>)[key] = next;
  return next;
}

function ensureRewardQueue(runtime: SessionRuntimeState): MutableRewardList {
  return sanitizeRewardList(runtime, 'rewardQueue');
}

function ensurePendingRewards(encounter: EncounterState): MutableRewardList {
  return sanitizeRewardList(encounter, 'pendingRewards');
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

function updateRuntimeRewards(runtime: SessionRuntimeState, additions: RewardList): RewardRoll[] {
  const queue = ensureRewardQueue(runtime);
  return mergeRewardsInPlace(queue, additions);
}

function updateEncounterRewards(encounter: EncounterState, additions: RewardList): RewardRoll[] {
  const pending = ensurePendingRewards(encounter);
  return mergeRewardsInPlace(pending, additions);
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

function getWaveAt(value: unknown, index: number): WaveState | null {
  if (!Array.isArray(value)) return null;
  const wave = value[index];
  return wave ? (wave as WaveState) : null;
}

export function advanceSession(session: SessionState | null | undefined): EncounterState | null {
  const runtime = session?.runtime;
  if (!runtime) return null;
  const encounter = runtime.encounter;
  if (!encounter) {
    runtime.wave = null;
    return null;
  }

  const waves = encounter.waves;
  const waveCount = Array.isArray(waves) ? waves.length : 0;
  const index = Math.max(0, encounter.waveIndex | 0);
  const wave = getWaveAt(waves, index);

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
  removeRewardById(ensureRewardQueue(runtime), reward.id);
  const encounter = runtime.encounter;
  if (encounter) {
    removeRewardById(ensurePendingRewards(encounter), reward.id);
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