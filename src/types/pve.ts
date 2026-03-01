//home (termux)/arclune_lane_7x3/src/types/pve.ts
import type { PassiveKitDefinition, PveDeckEntry, SessionState as CoreSessionState } from './combat';
import type { UnitId, UnitToken } from './units';
import type { RosterUnitDefinition } from './config';

export type MetaEntry = Omit<RosterUnitDefinition, 'kit'> & {
  kit: PassiveKitDefinition | null;
};

export interface SummonInheritSpec extends Record<string, unknown> {
  HP?: number | string | null;
  hp?: number | string | null;
  HPMax?: number | string | null;
  hpMax?: number | string | null;
  ATK?: number | string | null;
  atk?: number | string | null;
  WIL?: number | string | null;
  wil?: number | string | null;
  RES?: number | string | null;
  res?: number | string | null;
  ARM?: number | string | null;
  arm?: number | string | null;
}

export interface SummonCreepSpec extends Record<string, unknown> {
  id?: string | null;
  name?: string | null;
  label?: string | null;
  color?: string | null;
  isMinion?: boolean | null;
  ttl?: number | string | null;
  ttlTurns?: number | string | null;
  skinKey?: string | null;
}

export interface SummonSpec extends Record<string, unknown> {
  pattern?: string;
  placement?: string;
  patternKey?: string;
  shape?: string;
  area?: string;
  slots?: ReadonlyArray<number>;
  count?: number | string | null;
  summonCount?: number | string | null;
  ttl?: number | string | null;
  ttlTurns?: number | string | null;
  inherit?: SummonInheritSpec | null;
  limit?: number | string | null;
  replace?: string;
  creep?: SummonCreepSpec | null;
}

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
  unitProgressById?: Map<UnitId, RuntimeUnitProgress>;
}

export interface CollectionProgressUnitInput extends Record<string, unknown> {
  unitId?: string | null;
  id?: string | null;
  
  key?: string | null;
  realm?: number | string | null;
  subRealm?: number | string | null;
  level?: number | string | null;
  stars?: number | string | null;
  owned?: boolean | number | string | null;
  unlocked?: boolean | number | string | null;
  awakened?: boolean | number | string | null;
  inLineup?: boolean | number | string | null;
}

export interface CollectionStateInput extends Record<string, unknown> {
  units?: ReadonlyArray<CollectionProgressUnitInput> | null;
  ownedUnits?: ReadonlyArray<CollectionProgressUnitInput> | null;
  roster?: ReadonlyArray<CollectionProgressUnitInput> | null;
  collection?: ReadonlyArray<CollectionProgressUnitInput> | null;
}

export interface RuntimeUnitProgress {
  unitId: UnitId;
  realm?: number;
  subRealm?: number;
  level?: number;
  stars?: number;
  owned?: boolean;
  awakened?: boolean;
  inLineup?: boolean;
}

export interface CreateSessionOptions {
  modeKey?: string;
  sceneTheme?: string;
  backgroundKey?: string;
  lineupDeck?: ReadonlyArray<PveDeckEntry>;
  playerDeck?: ReadonlyArray<PveDeckEntry>;
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
  collectionState?: CollectionStateInput | null;
}

export type SessionState = CoreSessionState & {
  runtime: SessionRuntimeState;
  _inited?: boolean;
};