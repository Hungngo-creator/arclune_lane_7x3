import type {
  ActionChainEntry,
  QueuedSummonState,
  Side,
  UnitId,
  UnitToken,
} from './units';
import type { UnitArt } from './art';
import type { RosterUnitDefinition, UnitKitConfig, UnitKitOnSpawnConfig } from './config';
import type { TurnSnapshot } from './turn-order';
import type { RngState } from './rng';
import type { TelemetryEvent } from './telemetry';
import type { GameEventTargetLike } from '../events';
import type { SummonBarHandles } from './ui';
import type { VfxEventList } from './vfx';

export interface StatusEffect {
  id: string;
  kind?: 'buff' | 'debuff' | 'mark' | string;
  tag?: string;
  stacks?: number;
  maxStacks?: number;
  dur?: number;
  ttl?: number;
  ttlTurns?: number;
  turns?: number;
  tick?: 'turn' | 'phase' | string | null;
  power?: number;
  amount?: number;
  /** Giá trị tuỳ ý khác (ví dụ metadata riêng của hiệu ứng) */
  [extra: string]: unknown;
}

export interface StatusLifecyclePayload<TPayload = unknown> {
  Game: SessionState | null;
  target: UnitToken | null;
  source?: UnitToken | null;
  status: StatusEffect;
  payload: TPayload;
}

export type StatusDefinition<
  TApplyPayload = unknown,
  TTickPayload = unknown,
  TRemovePayload = unknown,
> = (
  spec?: Record<string, unknown>,
) => StatusEffect & {
  onApply?: (payload: StatusLifecyclePayload<TApplyPayload>) => void;
  onTick?: (payload: StatusLifecyclePayload<TTickPayload>) => void;
  onRemove?: (payload: StatusLifecyclePayload<TRemovePayload>) => void;
};

export type StatusRegistry = Record<string, StatusDefinition>;

export interface SkillCost {
  aether?: number;
  fury?: number;
  hpPercent?: number;
  [currency: string]: number | undefined;
}

export interface SkillDefinition {
  key?: string;
  name?: string;
  type?: string;
  tags?: string[];
  cost?: SkillCost | null;
  hits?: number;
  countsAsBasic?: boolean;
  targets?: string | number | Record<string, unknown>;
  duration?: number | 'battle' | {
    turns?: number | string;
    [extra: string]: unknown;
  };
  delayTurns?: number;
  reduceDamage?: number;
  bonusVsLeader?: number;
  damageMultiplier?: number;
  damage?: Record<string, unknown>;
  buffStats?: Record<string, number>;
  debuff?: Record<string, unknown>;
  selfBuff?: Record<string, unknown>;
  link?: Record<string, unknown>;
  notes?: ReadonlyArray<string> | string | null;
  metadata?: Record<string, unknown>;
  [extra: string]: unknown;
}

export interface DamageContext {
  dtype: string;
  base: number;
  attackType: string;
  outMul: number;
  inMul: number;
  defPen: number;
  ignoreAll: boolean;
  isAoE?: boolean;
  isCrit?: boolean;
  isKill?: boolean;
  targetsHit?: number;
  targetMaxHp?: number;
  [extra: string]: unknown;
}

export interface LeaderSnapshot {
  id: UnitId | null;
  side: Side | null;
  alive: boolean;
  hp: number | null;
  hpMax: number | null;
}

export interface BattleDetail {
  context?: Record<string, unknown>;
  leaders?: { ally: LeaderSnapshot | null; enemy: LeaderSnapshot | null };
  timeout?: Record<string, unknown>;
  [extra: string]: unknown;
}

export interface BattleResult {
  winner: Side | 'draw' | null;
  reason: string | null;
  detail: BattleDetail | null;
  finishedAt: number;
}

export interface BattleState extends BattleResult {
  over: boolean;
  result: BattleResult | null;
}

export interface AiDeckCard {
  id: UnitId;
  cost?: number | null;
  name?: string | null;
  [extra: string]: unknown;
}

export type AiDeckEntry = UnitId | AiDeckCard | UnitToken;

export interface AiCard extends AiDeckCard {
  cost: number;
}

export type AiCardDeck = AiCard[];

export type AiDeckPool = AiCardDeck | ReadonlyArray<AiDeckEntry>;

export interface PveDeckEntry {
  id: UnitId;
  cost?: number | null;
  name?: string | null;
  art?: UnitArt | null;
  skinKey?: string | null;
  [extra: string]: unknown;
}

export type SessionRosterEntry = PveDeckEntry;

export type SessionRoster = ReadonlyArray<SessionRosterEntry>;

export interface SessionAIState {
  cost: number;
  costCap: number;
  summoned: number;
  summonLimit: number;
  unitsAll: ReadonlyArray<PveDeckEntry>;
  usedUnitIds: Set<UnitId>;
  deck: AiDeckPool;
  selectedId: UnitId | null;
  lastThinkMs: number;
  lastDecision: Record<string, unknown> | null;
  [extra: string]: unknown;
}

export interface BattleGrid {
  cols: number;
  rows: number;
  tile: number;
  ox: number;
  oy: number;
  w: number;
  h: number;
  pad: number;
  dpr: number;
  pixelW: number;
  pixelH: number;
  pixelArea: number;
}

export interface RuntimeUi {
  bar: SummonBarHandles | null;
  [extra: string]: unknown;
}

export interface MetaService {
  get(id: UnitId | null | undefined): RosterUnitDefinition | null | undefined;
  classOf?(id: UnitId | null | undefined): string | null;
  rankOf?(id: UnitId | null | undefined): string | null;
  kit?(id: UnitId | null | undefined): Record<string, unknown> | null;
  isSummoner?(id: UnitId | null | undefined): boolean;
  [extra: string]: unknown;
}

export interface SessionState {
  modeKey: string | null;
  grid: BattleGrid | null;
  tokens: UnitToken[];
  cost: number;
  costCap: number;
  summoned: number;
  summonLimit: number;
  unitsAll: PveDeckEntry[];
  usedUnitIds: Set<UnitId>;
  deck3: PveDeckEntry[];
  selectedId: UnitId | null;
  ui: RuntimeUi;
  turn: TurnSnapshot | null;
  queued: QueuedSummonState;
  actionChain: ActionChainEntry[];
  events: GameEventTargetLike;
  sceneTheme?: string | null;
  backgroundKey?: string | null;
  battle: BattleState;
  result: BattleResult | null;
  ai: SessionAIState;
  meta: MetaService;
  rng?: RngState;
  telemetryLog?: TelemetryEvent[];
  vfx?: VfxEventList;
  passiveLog?: Array<Record<string, unknown>> | null;
  runtime?: Record<string, unknown>;
  [extra: string]: unknown;
}

export interface PassiveConditionObject {
  selfHPAbove?: number | null;
  selfHPBelow?: number | null;
  hpAbove?: number | null;
  hpBelow?: number | null;
  requiresStatus?: string | ReadonlyArray<string | null | undefined> | null;
  targetHasStatus?: string | ReadonlyArray<string | null | undefined> | null;
  minMinions?: number | null;
  maxStacks?: number | null;
  stackId?: string | null;
  [extra: string]: unknown;
}

export interface PassiveEffectConfig extends Record<string, unknown> {
  type?: string;
  kind?: string;
  id?: string;
  params?: Record<string, unknown> | null;
  stats?: Record<string, number> | null;
  flatStats?: Record<string, number> | null;
}

export interface PassiveKitDefinition extends UnitKitConfig {
  passives?: ReadonlyArray<PassiveSpec | null | undefined> | null;
  onSpawn?: UnitKitOnSpawnConfig | null;
}

export interface PassiveMetaContext {
  kit: PassiveKitDefinition | null;
  meta: RosterUnitDefinition | null;
}

export interface PassiveConditionContext {
  Game?: SessionState | null;
  unit?: UnitToken | null;
  ctx?: Record<string, unknown> | null;
  passive?: PassiveSpec | null;
}

export type PassiveConditionFn = (context: PassiveConditionContext) => boolean;

export type PassiveCondition = string | PassiveConditionObject | PassiveConditionFn;

export interface PassiveSpec extends Record<string, unknown> {
  id: string;
  when?: string;
  effect?:
    | string
    | PassiveEffectConfig
    | null;
  effects?: ReadonlyArray<string | PassiveEffectConfig | null | undefined> | null;
  params?: Record<string, unknown>;
  condition?: PassiveCondition | null;
  conditions?: PassiveCondition[] | PassiveCondition | null;
}

export interface PassiveEffectArgs<
  TPassive extends PassiveSpec = PassiveSpec,
  TContext extends Record<string, unknown> | undefined = Record<string, unknown> | undefined,
> {
  Game: SessionState | null;
  unit: UnitToken | null;
  passive: TPassive | null;
  ctx: TContext;
}

export type PassiveDefinition = (args: PassiveEffectArgs) => void;

export type PassiveRegistry = Record<string, PassiveDefinition>;