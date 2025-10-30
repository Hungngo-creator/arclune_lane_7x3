import type { PassiveSpec, SkillDefinition } from './combat';
import type { UnitId } from './units';
import type { BackgroundDefinition, BackgroundProp, TurnOrderConfig as TurnOrderConfigSchema } from '../config/schema';

export type TurnOrderSide = 'ally' | 'enemy';

export interface TurnOrderPairScanSlotFields {
  slot?: number | string;
  s?: number | string;
  index?: number | string;
}

export interface TurnOrderPairScanSideObject extends TurnOrderPairScanSlotFields {
  side: TurnOrderSide | (string & Record<never, never>);
}

export interface TurnOrderPairScanSlotObject extends TurnOrderPairScanSlotFields {
  side?: unknown;
}

export type TurnOrderPairScanEntry =
  | number
  | ReadonlyArray<number>
  | readonly [TurnOrderSide | (string & Record<never, never>), number]
  | TurnOrderPairScanSideObject
  | TurnOrderPairScanSlotObject;

export interface TurnOrderConfigDetails {
  mode?: string | null;
  sides?: ReadonlyArray<TurnOrderSide>;
  pairScan?: ReadonlyArray<TurnOrderPairScanEntry>;
}

export type GameTurnOrderConfig = TurnOrderConfigSchema & TurnOrderConfigDetails;

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
  notes?: ReadonlyArray<string> | string | null;
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

export interface UltReviveConfig {
  hpPercent?: number;
  hpPct?: number;
  rage?: number;
  lockSkillsTurns?: number;
  [extra: string]: unknown;
}

export interface UltMetadata extends Record<string, unknown> {
  type?: string;
  kind?: string;
  category?: string;
  tags?: ReadonlyArray<string>;
  categories?: ReadonlyArray<string>;
  label?: string;
  role?: string;
  defensive?: boolean;
  summon?: Record<string, unknown> | null;
  revive?: UltReviveConfig | null;
  instant?: boolean;
  instantCast?: boolean;
  cast?: string;
  immediate?: boolean;
  reduceDamage?: number;
  shield?: number;
  barrier?: number;
  buffs?: ReadonlyArray<Record<string, unknown>> | null;
}

export interface UltSkillConfig extends Record<string, unknown> {
  type?: string;
  kind?: string;
  category?: string;
  tags?: ReadonlyArray<string>;
  metadata?: UltMetadata | null;
  meta?: UltMetadata | null;
  summon?: Record<string, unknown> | null;
  revive?: Record<string, unknown> | null;
  revived?: UltReviveConfig | null;
  summonCount?: number;
  placement?: string;
  pattern?: string;
  ttl?: number;
  ttlTurns?: number;
  count?: number;
  limit?: number;
  inherit?: unknown;
  replace?: unknown;
  creep?: unknown;
  targets?: number | string | Record<string, unknown>;
  turns?: number;
  duration?: number | { turns?: number | string; [extra: string]: unknown };
  hits?: number;
  power?: number;
  scale?: number;
  bonusVsLeader?: number;
  tagAsBasic?: boolean;
  penRES?: number;
  reduceDmg?: number;
  reduceDamage?: number;
  selfHPTrade?: number;
  attackSpeed?: number;
  allies?: number;
  healLeader?: boolean;
  hpTradePercent?: number;
  hpTrade?: { percentMaxHP?: number; lethal?: boolean; minHP?: number; [extra: string]: unknown } | null;
  debuffId?: string;
  debuffAmount?: number;
  debuffMaxStacks?: number;
  debuffDuration?: number;
  shield?: number;
  barrier?: number;
  buffs?: ReadonlyArray<Record<string, unknown>> | null;
  shields?: ReadonlyArray<Record<string, unknown>> | null;
}

export interface UnitKitOnSpawnEffect extends Record<string, unknown> {
  type?: string;
  kind?: string;
  effect?: string;
  id?: string;
  mode?: string;
  phase?: string;
  stage?: string;
  when?: string;
  target?: string;
  amount?: number;
  value?: number;
  percent?: number;
  stats?: Record<string, number>;
  flatStats?: Record<string, number>;
  status?: Record<string, unknown> | null;
  stack?: boolean;
  stacks?: number;
  maxStacks?: number;
  purgeable?: boolean;
}

export interface UnitKitOnSpawnConfig extends Record<string, unknown> {
  rage?: number | string | Record<string, unknown> | null;
  exceptLeader?: boolean;
  effects?: ReadonlyArray<UnitKitOnSpawnEffect | null | undefined> | null;
  teamHealOnEntry?: number | null;
  teamHealPercentMaxHPOfCaster?: number | null;
  teamHealPercentCasterMaxHP?: number | null;
  statuses?: ReadonlyArray<Record<string, unknown> | null | undefined> | null;
  addStatuses?: ReadonlyArray<Record<string, unknown> | null | undefined> | null;
  status?: Record<string, unknown> | null;
  stats?: Record<string, number> | null;
  flatStats?: Record<string, number> | null;
  statsMode?: string | null;
  mode?: string | null;
  purgeable?: boolean;
  id?: string | null;
  stack?: boolean;
  stacks?: number | null;
  maxStacks?: number | null;
}

export interface UnitKitConfig extends Record<string, unknown> {
  ult?: UltSkillConfig | null;
  traits?: unknown;
  passives?: ReadonlyArray<PassiveSpec | null | undefined> | null;
  onSpawn?: UnitKitOnSpawnConfig | null;
}

export interface RosterUnitDefinition {
  id: UnitId;
  name: string;
  class: string;
  rank: string;
  mods?: Partial<Record<keyof CatalogStatBlock, number>>;
  kit: UnitKitConfig;
  [extra: string]: unknown;
}

export interface CameraPreset {
  rowGapRatio: number;
  topScale: number;
  depthScale: number;
}

export interface ChibiProportions {
  line: number;
  headR: number;
  torso: number;
  arm: number;
  leg: number;
  weapon: number;
  nameAlpha: number;
}

export interface BackgroundPalette {
  primary?: string;
  secondary?: string;
  accent?: string;
  shadow?: string;
  outline?: string;
}

export interface BackgroundFallback {
  shape?: string;
  [extra: string]: unknown;
}

export type BackgroundPropConfig = BackgroundProp & {
  asset?: string | null;
  fallback?: BackgroundFallback | null;
  palette?: BackgroundPalette | null;
  anchor?: { x?: number; y?: number } | null;
  size?: { w?: number; h?: number } | null;
  baseLift?: number;
  pixelOffset?: { x?: number; y?: number } | null;
  cell: BackgroundProp['cell'] & { depth?: number };
  cx?: number;
  cy?: number;
  [extra: string]: unknown;
};

export type BackgroundDefinitionConfig = Omit<BackgroundDefinition, 'props'> & {
  props: BackgroundPropConfig[];
};

export type BackgroundConfig = BackgroundDefinitionConfig | null;

export type {
  GameConfig,
  CombatTuning,
  FuryConfig,
  FuryGainEntry,
  FuryCaps,
  TurnOrderConfig,
  AiConfig,
  AiWeights,
  AiRoleWeight,
  AnimationConfig,
  UiConfig,
  DebugFlags,
  PerformanceConfig,
  ColorPalette,
  SceneLayer,
  SceneTheme,
  SceneConfig,
  BackgroundProp,
  BackgroundDefinition,
  WorldMapConfig,
} from '../config/schema';