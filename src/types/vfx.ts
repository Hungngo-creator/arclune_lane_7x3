export type VfxAnchor = {
  id: string;
  timing?: string;
  radius?: number;
};

export type VfxBinding = {
  description?: string;
  anchors: VfxAnchor[];
};

export type VfxAnchorDataset = {
  unitId: string;
  bodyAnchors: Record<string, { x: number; y: number }>;
  vfxBindings: Record<string, VfxBinding>;
  ambientEffects: Record<string, VfxBinding>;
};
