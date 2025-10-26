import type { PveDeckEntry, SessionState as CoreSessionState } from './combat';
import type { UnitToken } from './units';
import type { RosterUnitDefinition } from './config';

export type MetaEntry = RosterUnitDefinition;

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
  deck?: ReadonlyArray<PveDeckEntry>;
  aiPreset?: {
    deck?: ReadonlyArray<PveDeckEntry>;
    unitsAll?: ReadonlyArray<PveDeckEntry>;
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