import { BUILD_SITE_RENDER_BUFFER, WORLD_WIDTH } from './constants.ts';
import type { ElementalRegion, ElementalRegionKind } from './types.ts';

export const NON_DARK_ELEMENTAL_REGION_KINDS = ['fire', 'wood', 'water', 'earth', 'metal', 'thunder', 'blood', 'light', 'wind'] as const satisfies readonly ElementalRegionKind[];
export const ELEMENTAL_REGION_ROLL_PERCENT = 11;
export const ELEMENTAL_REGION_BARREN_PERCENT = 1;
export const ELEMENTAL_REGION_TIER_MIN = 1.1;
export const ELEMENTAL_REGION_TIER_MAX = 1.9;
export const ELEMENTAL_REGION_TIER_STEP = 0.1;
export const ELEMENTAL_REGION_TIER_AREA_GROWTH = 0.05;
export const ELEMENTAL_REGION_MAX_NON_DARK_TIER_1 = 4;
export const ELEMENTAL_REGION_BASE_WIDTH_RATIO = 0.08;
export const ELEMENTAL_REGION_DARK_EDGE_RATIO = 0.07;
export const ELEMENTAL_REGION_RENDER_BUFFER = BUILD_SITE_RENDER_BUFFER;
export const ELEMENTAL_REGION_PARTICLES_PER_1000_MIN = 4;
export const ELEMENTAL_REGION_PARTICLES_PER_1000_MAX = 8;
export const ELEMENTAL_REGION_PARTICLE_WIDTH_UNIT = 1000;

export type ElementalRegionRandom = () => number;

export const createElementalRegionRandom = (): ElementalRegionRandom => {
  let seed = Math.floor(Math.random() * 0x7fffffff) || 1;
  return () => {
    seed = (seed * 48271) % 0x7fffffff;
    return seed / 0x7fffffff;
  };
};

export const getVinhDaMapTier = (params: Record<string, unknown> | null): number => {
  const explicitTier = typeof params?.tier === 'number' ? params.tier : Number.NaN;
  if (Number.isFinite(explicitTier)) return Math.max(ELEMENTAL_REGION_TIER_MIN, Math.min(ELEMENTAL_REGION_TIER_MAX, explicitTier));
  const stageId = typeof params?.stageId === 'string' ? params.stageId : '';
  const stageMatch = /^(\d+)-(\d+)$/.exec(stageId);
  const stageIndex = stageMatch ? Number.parseInt(stageMatch[2] ?? '1', 10) : 1;
  return Math.max(ELEMENTAL_REGION_TIER_MIN, Math.min(ELEMENTAL_REGION_TIER_MAX, 1 + stageIndex * ELEMENTAL_REGION_TIER_STEP));
};

export const rollElementalRegionKind = (random: ElementalRegionRandom): ElementalRegionKind | null => {
  const roll = random() * 100;
  if (roll >= NON_DARK_ELEMENTAL_REGION_KINDS.length * ELEMENTAL_REGION_ROLL_PERCENT) return null;
  if (roll >= 100 - ELEMENTAL_REGION_BARREN_PERCENT) return null;
  return NON_DARK_ELEMENTAL_REGION_KINDS[Math.floor(roll / ELEMENTAL_REGION_ROLL_PERCENT)] ?? null;
};

export const createElementalRegions = (mapTier: number, random: ElementalRegionRandom): ElementalRegion[] => {
  const tierStep = Math.max(0, Math.round((mapTier - ELEMENTAL_REGION_TIER_MIN) / ELEMENTAL_REGION_TIER_STEP));
  const regionWidth = WORLD_WIDTH * ELEMENTAL_REGION_BASE_WIDTH_RATIO * (1 + tierStep * ELEMENTAL_REGION_TIER_AREA_GROWTH);
  const darkEdgeWidth = WORLD_WIDTH * ELEMENTAL_REGION_DARK_EDGE_RATIO * (1 + tierStep * ELEMENTAL_REGION_TIER_AREA_GROWTH);
  const spawnDarkOnBothEdges = random() >= 0.5;
  const regions: ElementalRegion[] = [
    { id: 'element-region-dark-left', kind: 'dark', startX: 0, endX: darkEdgeWidth },
    ...(spawnDarkOnBothEdges ? [{ id: 'element-region-dark-right', kind: 'dark' as const, startX: WORLD_WIDTH - darkEdgeWidth, endX: WORLD_WIDTH }] : [])
  ];
  const safeStartX = darkEdgeWidth;
  const safeEndX = WORLD_WIDTH - (spawnDarkOnBothEdges ? darkEdgeWidth : 0);
  const slotWidth = Math.max(1, (safeEndX - safeStartX) / ELEMENTAL_REGION_MAX_NON_DARK_TIER_1);
  for (let index = 0; index < ELEMENTAL_REGION_MAX_NON_DARK_TIER_1; index += 1){
    const kind = rollElementalRegionKind(random);
    if (!kind) continue;
    const slotStart = safeStartX + slotWidth * index;
    const minStart = slotStart;
    const maxStart = Math.max(minStart, slotStart + slotWidth - regionWidth);
    const startX = minStart + random() * (maxStart - minStart);
    regions.push({ id: `element-region-${index + 1}-${kind}`, kind, startX, endX: Math.min(safeEndX, startX + regionWidth) });
  }
  return regions.sort((left, right) => left.startX - right.startX);
};

export const getElementalRegionAtX = (regions: readonly ElementalRegion[] | undefined, x: number): ElementalRegion | null => {
  if (!regions || !Number.isFinite(x)) return null;
  return regions.find(region => x >= region.startX && x <= region.endX) ?? null;
};

export const getElementalRegionParticleCount = (region: ElementalRegion): number => {
  const width = Math.max(0, region.endX - region.startX);
  const particleRate = ELEMENTAL_REGION_PARTICLES_PER_1000_MIN + (region.id.length % (ELEMENTAL_REGION_PARTICLES_PER_1000_MAX - ELEMENTAL_REGION_PARTICLES_PER_1000_MIN + 1));
  return Math.max(1, Math.round(width / ELEMENTAL_REGION_PARTICLE_WIDTH_UNIT * particleRate));
};

