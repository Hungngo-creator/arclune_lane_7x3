//home (termux)/arclune_lane_7x3/src/types/art.ts
import type { Maybe, Nullable } from './common';

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

export type UnitArtShadow = Nullable<UnitArtShadowConfig | string>;

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
  aspect: Nullable<number>;
  shadow: Nullable<UnitArtShadowConfig>;
  skinId: Nullable<string>;
  cacheKey: Nullable<string>;
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
  skinKey?: Nullable<string>;
  [extra: string]: unknown;
}

export interface UnitArt extends UnitArtDefinition {
  skinKey: Nullable<string>;
}

export interface GetUnitArtOptions {
  skinKey?: Maybe<string>;
}