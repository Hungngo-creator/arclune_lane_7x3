import { ZodIssueCode, ZodObject, z } from 'zod';

const SideSchema = z.enum(['ally', 'enemy']);

const FuryCapsSchema = z.object({
  perTurn: z.number(),
  perSkill: z.number(),
  perHit: z.number()
});
export type FuryCaps = z.infer<typeof FuryCapsSchema>;

const FuryGainEntrySchema = z.object({
  base: z.number(),
  perTarget: z.number().optional(),
  crit: z.number().optional(),
  kill: z.number().optional(),
  targetRatio: z.number().optional()
});
export type FuryGainEntry = z.infer<typeof FuryGainEntrySchema>;

const FuryConfigSchema = z.object({
  max: z.number(),
  ultCost: z.number(),
  specialMax: z.record(z.object({
    max: z.number(),
    ultCost: z.number()
  })),
  caps: FuryCapsSchema,
  gain: z.object({
    turnStart: z.object({ amount: z.number() }),
    dealSingle: FuryGainEntrySchema,
    dealAoePerTarget: FuryGainEntrySchema,
    damageTaken: z.object({ base: z.number(), selfRatio: z.number() })
  }),
  drain: z.object({
    perTargetBase: z.number(),
    perTargetPct: z.number(),
    skillTotalCap: z.number()
  })
});
export type FuryConfig = z.infer<typeof FuryConfigSchema>;

const TurnOrderSlotValueSchema = z.union([z.number(), z.string()]);

const TurnOrderPairScanObjectSchema = z.object({
  side: SideSchema.optional(),
  slot: TurnOrderSlotValueSchema.optional(),
  s: TurnOrderSlotValueSchema.optional(),
  index: TurnOrderSlotValueSchema.optional()
});

const TurnOrderPairScanEntrySchema = z.union([
  z.number(),
  z.array(z.number()),
  z.tuple([SideSchema, z.number()]),
  TurnOrderPairScanObjectSchema
]);

const TurnOrderConfigSchema = z.object({
  mode: z.string().optional(),
  pairScan: z.array(TurnOrderPairScanEntrySchema).optional(),
  sides: z.array(SideSchema).optional()
});
export type TurnOrderConfig = z.infer<typeof TurnOrderConfigSchema>;

const AiWeightsSchema = z.object({
  pressure: z.number(),
  safety: z.number(),
  eta: z.number(),
  summon: z.number(),
  kitInstant: z.number(),
  kitDefense: z.number(),
  kitRevive: z.number()
});
export type AiWeights = z.infer<typeof AiWeightsSchema>;

const AiRoleWeightSchema = z.object({
  front: z.number(),
  back: z.number(),
  summonBoost: z.number().optional()
});
export type AiRoleWeight = z.infer<typeof AiRoleWeightSchema>;

const AiConfigSchema = z.object({
  WEIGHTS: AiWeightsSchema,
  ROW_CROWDING_PENALTY: z.number(),
  ROLE: z.record(AiRoleWeightSchema),
  DEBUG: z.object({ KEEP_TOP: z.number() })
});
export type AiConfig = z.infer<typeof AiConfigSchema>;

const AnimationConfigSchema = z.object({
  turnIntervalMs: z.number(),
  meleeDurationMs: z.number()
});
export type AnimationConfig = z.infer<typeof AnimationConfigSchema>;

const UiConfigSchema = z.object({
  PAD: z.number(),
  BOARD_MAX_W: z.number(),
  BOARD_MIN_H: z.number(),
  BOARD_H_RATIO: z.number(),
  MAX_DPR: z.number(),
  MAX_PIXEL_AREA: z.number(),
  CARD_GAP: z.number(),
  CARD_MIN: z.number()
});
export type UiConfig = z.infer<typeof UiConfigSchema>;

const DebugFlagsSchema = z.object({
  SHOW_QUEUED: z.boolean(),
  SHOW_QUEUED_ENEMY: z.boolean()
});
export type DebugFlags = z.infer<typeof DebugFlagsSchema>;

const ShadowPresetSchema = z.enum(['off', 'medium', 'soft']);

const PerformanceConfigSchema = z.object({
  LOW_POWER_MODE: z.boolean(),
  LOW_POWER_DPR: z.number(),
  LOW_POWER_SHADOWS: z.boolean(),
  LOW_SHADOW_PRESET: ShadowPresetSchema,
  SHADOW_MEDIUM_THRESHOLD: z.number(),
  SHADOW_DISABLE_THRESHOLD: z.number(),
  MEDIUM_SHADOW_PRESET: ShadowPresetSchema,
  HIGH_LOAD_SHADOW_PRESET: ShadowPresetSchema,
  SHADOW_HIGH_DPR_CUTOFF: z.number(),
  HIGH_DPR_SHADOW_PRESET: ShadowPresetSchema
});
export type PerformanceConfig = z.infer<typeof PerformanceConfigSchema>;

const ColorPaletteSchema = z.object({
  ally: z.string(),
  enemy: z.string(),
  mid: z.string(),
  line: z.string(),
  tokenText: z.string()
});
export type ColorPalette = z.infer<typeof ColorPaletteSchema>;

const SceneLayerSchema = z.object({
  top: z.string().optional(),
  mid: z.string().optional(),
  bottom: z.string().optional(),
  glow: z.string().optional(),
  height: z.number().optional(),
  thickness: z.number().optional(),
  color: z.string().optional(),
  accent: z.string().optional(),
  parallax: z.number().optional(),
  topScale: z.number().optional(),
  bottomScale: z.number().optional(),
  highlight: z.string().optional()
});
export type SceneLayer = z.infer<typeof SceneLayerSchema>;

const SceneThemeObjectSchema: ZodObject<{
  sky: typeof SceneLayerSchema;
  horizon: typeof SceneLayerSchema;
  ground: typeof SceneLayerSchema;
}> = z.object({
  sky: SceneLayerSchema,
  horizon: SceneLayerSchema,
  ground: SceneLayerSchema
});

const SceneThemeSchema = SceneThemeObjectSchema.superRefine<
  z.infer<typeof SceneThemeObjectSchema>,
  z.input<typeof SceneThemeObjectSchema>
>((theme, ctx) => {
  if (!theme.sky.top) {
    ctx.addIssue({
      code: ZodIssueCode.custom,
      path: ['sky', 'top'],
      message: 'sky.top is required'
    });
  }
}) as z.ZodEffects<typeof SceneThemeObjectSchema>;
export type SceneTheme = z.infer<typeof SceneThemeSchema>;

const SceneConfigSchema = z.object({
  DEFAULT_THEME: z.string(),
  CURRENT_THEME: z.string(),
  THEMES: z.record(SceneThemeSchema)
});
export type SceneConfig = z.infer<typeof SceneConfigSchema>;

const BackgroundPropSchema = z.object({
  type: z.string(),
  cell: z.object({ cx: z.number(), cy: z.number() }),
  offset: z.object({ x: z.number().optional(), y: z.number().optional() }).optional(),
  scale: z.number().optional(),
  alpha: z.number().optional(),
  depth: z.number().optional(),
  sortBias: z.number().optional(),
  flip: z.number().optional()
});
export type BackgroundProp = z.infer<typeof BackgroundPropSchema>;

const BackgroundDefinitionSchema = z.object({
  props: z.array(BackgroundPropSchema)
});
export type BackgroundDefinition = z.infer<typeof BackgroundDefinitionSchema>;

const WorldMapConfigSchema = z.object({
  SCENE: SceneConfigSchema,
  CURRENT_BACKGROUND: z.string(),
  BACKGROUNDS: z.record(BackgroundDefinitionSchema),
  CAMERA: z.string()
});
export type WorldMapConfig = z.infer<typeof WorldMapConfigSchema>;

const CombatTuningSchema = z.object({
  GRID_COLS: z.number(),
  GRID_ROWS: z.number(),
  ALLY_COLS: z.number(),
  ENEMY_COLS: z.number(),
  COST_CAP: z.number(),
  SUMMON_LIMIT: z.number(),
  HAND_SIZE: z.number(),
  FOLLOWUP_CAP_DEFAULT: z.number(),
  fury: FuryConfigSchema,
  turnOrder: TurnOrderConfigSchema,
  AI: AiConfigSchema,
  ANIMATION: AnimationConfigSchema
});
export type CombatTuning = z.infer<typeof CombatTuningSchema>;

export const GameConfigSchema = CombatTuningSchema
  .merge(
    z.object({
      UI: UiConfigSchema,
      DEBUG: DebugFlagsSchema,
      PERFORMANCE: PerformanceConfigSchema,
      COLORS: ColorPaletteSchema
    })
  )
  .merge(WorldMapConfigSchema);

export type GameConfig = z.infer<typeof GameConfigSchema>;