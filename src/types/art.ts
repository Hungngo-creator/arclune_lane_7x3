export interface UnitArtPalette {
  primary: string;
  secondary: string;
  accent: string;
  outline: string;
  [extra: string]: unknown;
}

export interface UnitArtShadowConfig {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export type UnitArtShadow = UnitArtShadowConfig | string | null;

export interface UnitArtLayout {
  anchor: number;
  labelOffset: number;
  labelFont: number;
  hpOffset: number;
  hpWidth: number;
  hpHeight: number;
  spriteAspect: number;
  spriteHeight: number;
  [extra: string]: unknown;
}

export interface UnitArtLabel {
  bg: string;
  text: string;
  stroke: string;
  [extra: string]: unknown;
}

export interface UnitArtHpBar {
  bg: string;
  fill: string;
  border: string;
  [extra: string]: unknown;
}

export interface UnitArtSprite {
  key: string;
  src: string;
  anchor: number;
  scale: number;
  aspect: number | null;
  shadow: UnitArtShadowConfig | null;
  skinId: string | null;
  cacheKey: string | null;
  [extra: string]: unknown;
}

export interface UnitArtDefinition {
  sprite: UnitArtSprite | null;
  skins: Record<string, UnitArtSprite>;
  defaultSkin: string;
  palette: UnitArtPalette;
  shape: string;
  size: number;
  shadow: UnitArtShadow;
  glow: string;
  mirror: boolean;
  layout: UnitArtLayout;
  label: UnitArtLabel | false;
  hpBar: UnitArtHpBar;
  skinKey?: string | null;
  [extra: string]: unknown;
}

export interface UnitArt extends UnitArtDefinition {
  skinKey: string | null;
}

export interface GetUnitArtOptions {
  skinKey?: string | null;
}