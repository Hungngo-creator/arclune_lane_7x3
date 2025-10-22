import type { SessionState as CoreSessionState } from './combat';
import type { UnitToken } from './units';

export interface RewardRoll {
  id: string;
  weight: number;
  tier: number;
  data?: Record<string, unknown>;
}

export interface WaveState {
  index: number;
  units: ReadonlyArray<UnitToken>;
  status: 'pending' | 'spawning' | 'active' | 'cleared';
  spawnCycle: number;
  rewards: RewardRoll[];
}

export interface EncounterState {
  id: string;
  waveIndex: number;
  waves: WaveState[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  pendingRewards: RewardRoll[];
  metadata?: Record<string, unknown>;
}

export interface SessionRuntimeState {
  encounter: EncounterState | null;
  wave: WaveState | null;
  rewardQueue: RewardRoll[];
}

export interface CreateSessionOptions {
  modeKey?: string;
  sceneTheme?: string;
  backgroundKey?: string;
  deck?: ReadonlyArray<UnitToken>;
  aiPreset?: {
    deck?: ReadonlyArray<string>;
    unitsAll?: ReadonlyArray<string>;
    costCap?: number;
    summonLimit?: number;
    startingDeck?: ReadonlyArray<UnitToken>;
  };
  costCap?: number;
  summonLimit?: number;
  turnMode?: string;
  turn?: { mode?: string };
  turnOrderMode?: string;
  turnOrder?: { mode?: string };
}

export type SessionState = CoreSessionState & {
  runtime: SessionRuntimeState;
  _inited?: boolean;
};
