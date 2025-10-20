// Type declarations cho các entity game cốt lõi
// File này được import thông qua JSDoc (@typedef {import('types/game-entities').Foo})

export type UnitId = string;

export type Side = 'ally' | 'enemy';

export interface StatBlock {
  hpMax?: number;
  hp?: number;
  atk?: number;
  wil?: number;
  arm?: number;
  res?: number;
  agi?: number;
  per?: number;
  spd?: number;
  aeMax?: number;
  ae?: number;
  aeRegen?: number;
  hpRegen?: number;
  fury?: number;
  furyMax?: number;
  rage?: number;
  /** Các chỉ số cơ sở trước khi áp buff/debuff */
  baseStats?: Partial<Pick<StatBlock, 'atk' | 'wil' | 'res'>>;
}

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
  tick?: 'turn' | 'phase' | string;
  power?: number;
  amount?: number;
  /** Giá trị tuỳ ý khác (ví dụ metadata riêng của hiệu ứng) */
  [extra: string]: unknown;
}

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
  targets?: string | number;
  duration?: number | 'battle';
  delayTurns?: number;
  reduceDamage?: number;
  bonusVsLeader?: number;
  damageMultiplier?: number;
  damage?: Record<string, unknown>;
  buffStats?: Record<string, number>;
  debuff?: Record<string, unknown>;
  selfBuff?: Record<string, unknown>;
  link?: Record<string, unknown>;
  notes?: string;
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

export interface InterleavedTurnState {
  mode: 'interleaved_by_position';
  nextSide: 'ALLY' | 'ENEMY';
  lastPos: Record<'ALLY' | 'ENEMY', number>;
  wrapCount: Record<'ALLY' | 'ENEMY', number>;
  turnCount: number;
  slotCount: number;
  cycle: number;
  busyUntil: number;
  completed?: boolean;
}

export interface SequentialTurnStateEntry {
  side: Side;
  slot: number;
}

export interface SequentialTurnState {
  order: SequentialTurnStateEntry[];
  orderIndex: Map<string, number>;
  cursor: number;
  cycle: number;
  busyUntil: number;
  completed?: boolean;
}

export type TurnSnapshot = InterleavedTurnState | SequentialTurnState;

export interface FuryState {
  turnGain: number;
  skillGain: number;
  hitGain: number;
  skillPerTargetGain: number;
  skillDrain: number;
  turnStamp: number | null;
  skillTag: string | null;
  freshSummon: boolean;
  lastStart: number;
}

export interface UnitToken extends StatBlock {
  id: UnitId;
  name?: string;
  side: Side;
  cx: number;
  cy: number;
  iid?: number;
  bornSerial?: number;
  ownerIid?: number;
  alive: boolean;
  deadAt?: number;
  isMinion?: boolean;
  ttlTurns?: number;
  statuses?: StatusEffect[];
  color?: string;
  art?: Record<string, unknown> | null;
  skinKey?: string | null;
  furyMax?: number;
  fury?: number;
  rage?: number;
  _furyState?: FuryState;
  [extra: string]: unknown;
}

export interface QueuedSummonRequest {
  unitId: UnitId;
  side: Side;
  slot: number;
  cx: number;
  cy: number;
  spawnCycle: number;
  name?: string;
  color?: string;
  revive?: boolean;
  revived?: Partial<UnitToken> | null;
  source?: string;
}

export interface QueuedSummonState {
  ally: Map<number, QueuedSummonRequest>;
  enemy: Map<number, QueuedSummonRequest>;
}

export interface ActionChainEntry {
  side: Side;
  slot: number;
  unit: Partial<UnitToken>;
}

export interface TelemetryEvent {
  type: string;
  timestamp: number;
  payload?: Record<string, unknown>;
  sessionId?: string;
  [extra: string]: unknown;
}

export interface RngState {
  seed: number;
  calls: number;
  history?: number[];
  [extra: string]: unknown;
}

export interface SessionAIState {
  cost: number;
  costCap: number;
  summoned: number;
  summonLimit: number;
  unitsAll: UnitId[];
  usedUnitIds: Set<UnitId>;
  deck: UnitToken[] | { id: UnitId }[];
  selectedId: UnitId | null;
  lastThinkMs: number;
  lastDecision: Record<string, unknown> | null;
  [extra: string]: unknown;
}

export interface SessionState {
  modeKey: string | null;
  grid: unknown;
  tokens: UnitToken[];
  cost: number;
  costCap: number;
  summoned: number;
  summonLimit: number;
  unitsAll: UnitId[];
  usedUnitIds: Set<UnitId>;
  deck3: UnitToken[];
  selectedId: UnitId | null;
  ui: { bar: unknown };
  turn: TurnSnapshot | null;
  queued: QueuedSummonState;
  actionChain: ActionChainEntry[];
  events: EventTarget;
  sceneTheme?: string | null;
  backgroundKey?: string | null;
  battle: BattleState;
  result: BattleResult | null;
  ai: SessionAIState;
  meta: { get(id: UnitId): Record<string, unknown> | null; [extra: string]: unknown };
  rng?: RngState;
  telemetryLog?: TelemetryEvent[];
  [extra: string]: unknown;
}

export interface CurrencyDefinition {
  id: string;
  name: string;
  shortName: string;
  suffix: string;
  ratioToBase: number;
  description?: string;
}

export interface PityRule {
  tier: string;
  pull: number;
}

export interface PityConfiguration {
  tier: string;
  hardPity: number;
  softGuarantees: ReadonlyArray<PityRule>;
}

export interface ShopTaxBracket {
  rank: string;
  label: string;
  rate: number;
}

export interface LotterySplit {
  devVault: number;
  prizePool: number;
}

export interface AnnouncementEntry {
  id: string;
  title: string;
  shortDescription: string;
  tooltip?: string;
  rewardCallout?: string;
  startAt: string | null;
  endAt: string | null;
  translationKey?: string;
}

export interface AnnouncementSlot {
  key: string;
  label: string;
  entries: ReadonlyArray<AnnouncementEntry>;
}

export interface ModeShellConfig {
  screenId: string;
  moduleId?: string;
  fallbackModuleId?: string;
  defaultParams?: Record<string, unknown>;
}

export interface ModeConfig {
  id: string;
  title: string;
  type: string;
  status: string;
  icon?: string;
  shortDescription?: string;
  unlockNotes?: string;
  tags?: ReadonlyArray<string>;
  menuSections?: ReadonlyArray<string>;
  parentId?: string | null;
  shell?: ModeShellConfig;
}

export interface ModeGroup {
  id: string;
  title: string;
  shortDescription?: string;
  icon?: string;
  tags?: ReadonlyArray<string>;
  menuSections?: ReadonlyArray<string>;
  childModeIds: ReadonlyArray<string>;
  extraClasses?: ReadonlyArray<string>;
}

export interface MenuSectionDefinition {
  id: string;
  title: string;
}

export interface SkillSection extends SkillDefinition {
  description?: string;
  notes?: ReadonlyArray<string>;
}

export interface SkillEntry {
  unitId: UnitId;
  basic: SkillSection | null;
  skill: SkillSection | null;
  skills: ReadonlyArray<SkillSection>;
  ult: SkillSection | null;
  talent: SkillSection | null;
  technique: SkillSection | null;
  notes: ReadonlyArray<string>;
}

export interface SkillRegistry {
  [unitId: UnitId]: SkillEntry;
}

export interface RosterPreview {
  id: UnitId;
  name: string;
  class: string;
  rank: string;
  rankMultiplier: number;
  tp: Record<string, number>;
  totalTP: number;
  preRank: Record<string, number>;
  final: Record<string, number>;
}

export interface RosterPreviewRow {
  stat: string;
  values: ReadonlyArray<{
    id: UnitId;
    name: string;
    value: number | null;
    preRank: number | null;
    tp: number;
  }>;
}

export interface CatalogStatBlock {
  HP: number;
  ATK: number;
  WIL: number;
  ARM: number;
  RES: number;
  AGI: number;
  PER: number;
  SPD: number;
  AEmax: number;
  AEregen: number;
  HPregen: number;
  [extra: string]: number;
}

export interface RosterUnitDefinition {
  id: UnitId;
  name: string;
  class: string;
  rank: string;
  mods?: Partial<Record<keyof CatalogStatBlock, number>>;
  kit: Record<string, unknown>;
}