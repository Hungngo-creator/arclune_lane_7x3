import { z } from 'zod';

import type { VfxAnchorDataset } from '@shared-types/vfx';

const AnchorPointSchema = z.object({
  x: z.number(),
  y: z.number()
});

const AnchorSchema = z.object({
  id: z.string(),
  timing: z.string().optional(),
  radius: z.number().optional()
});

const BindingSchema = z.object({
  description: z.string().optional(),
  anchors: z.array(AnchorSchema)
});

const BindingMapSchema = z.record(BindingSchema);

const VfxAnchorDatasetSchema = z.object({
  unitId: z.string(),
  bodyAnchors: z.record(AnchorPointSchema).optional(),
  vfxBindings: BindingMapSchema.optional(),
  ambientEffects: BindingMapSchema.optional()
});

type ParsedDataset = z.infer<typeof VfxAnchorDatasetSchema>;

export const parseVfxAnchorDataset = (input: unknown): VfxAnchorDataset => {
  const dataset: ParsedDataset = VfxAnchorDatasetSchema.parse(input);

  return {
    unitId: dataset.unitId,
    bodyAnchors: dataset.bodyAnchors ?? {},
    vfxBindings: dataset.vfxBindings ?? {},
    ambientEffects: dataset.ambientEffects ?? {}
  };
};
