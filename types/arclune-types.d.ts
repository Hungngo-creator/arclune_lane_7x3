declare module '@shared-types/vfx' {
  export type {
    VfxAnchor,
    VfxBinding,
    VfxAnchorDataset,
  } from '../src/types/vfx.ts';
}

declare module '@shared-types/config' {
  export type {
    TurnOrderSide,
    TurnOrderPairScanSlotFields,
    TurnOrderPairScanSideObject,
    TurnOrderPairScanSlotObject,
    TurnOrderPairScanEntry,
    TurnOrderConfigDetails,
    GameTurnOrderConfig,
    CurrencyDefinition,
    PityRule,
    PityConfiguration,
    ShopTaxBracket,
    LotterySplit,
    AnnouncementEntry,
    AnnouncementSlot,
    ModeShellConfig,
    ModeConfig,
    ModeGroup,
    MenuSectionDefinition,
    SkillSection,
    SkillEntry,
    SkillRegistry,
    RosterPreview,
    RosterPreviewRow,
    CatalogStatBlock,
    RosterUnitDefinition,
    CameraPreset,
    ChibiProportions,
    BackgroundPalette,
    BackgroundFallback,
    BackgroundPropConfig,
    BackgroundDefinitionConfig,
    BackgroundConfig,
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
  } from '../src/types/config.ts';
}

declare module '@shared-types/units' {
  export type {
    UnitId,
    Side,
    StatBlock,
    FuryState,
    UnitToken,
    SummonRequest,
    QueuedSummonRequest,
    SummonQueue,
    QueuedSummonState,
    ActionChainEntry,
    ActionChainProcessedResult,
  } from '../src/shared-types/units.ts';
  export { createSummonQueue } from '../src/shared-types/units.ts';
}

declare module 'zod' {
  export * from '../tools/zod-stub/index';
  const z: typeof import('../tools/zod-stub/index').z;
  export default z;
}