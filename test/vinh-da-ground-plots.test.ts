import { CRYSTAL_X, LEADER_WIDTH } from '../src/screens/vinh-da/constants.ts';
import {
  BUILD_SITES,
  STRUCTURE_SURFACES,
  createGroundBuildSites,
  isStructureAllowedOnBuildSite,
} from '../src/screens/vinh-da/structures.ts';
import type { BuildSite } from '../src/screens/vinh-da/types.ts';
import { DEFAULT_ENEMY_TEMPLATE, ENEMY_TEMPLATES } from '../src/screens/vinh-da/enemies.ts';
import type { EnemyTemplate } from '../src/screens/vinh-da/enemies.ts';
import { getFrameRateCap, setFrameRateCap } from '../src/utils/frame-rate.ts';

const GROUND_PLOT_STEP = LEADER_WIDTH * 1.8;

describe('Vĩnh Dạ ground build plots', () => {
  test('createGroundBuildSites sinh plot đối xứng từ CRYSTAL_X với bước LEADER_WIDTH * 1.8', () => {
    const sites = createGroundBuildSites();
    const groundSitesFromBundle = BUILD_SITES.filter(site => site.kind === 'ground');

    expect(sites).toEqual(groundSitesFromBundle);
    expect(sites[0]).toMatchObject({ id: 'ground-center-0', x: CRYSTAL_X, kind: 'ground' });

    const leftSites = sites.filter(site => site.id.startsWith('ground-left-'));
    const rightSites = sites.filter(site => site.id.startsWith('ground-right-'));
    const hasPlotAt = (x: number): boolean => sites.some(site => Math.abs(site.x - x) < 1e-8);

    for (const site of leftSites){
      const offsetSteps = (CRYSTAL_X - site.x) / GROUND_PLOT_STEP;
      expect(offsetSteps).toBeGreaterThan(0);
      expect(offsetSteps).toBeCloseTo(Math.round(offsetSteps), 10);
      expect(hasPlotAt(CRYSTAL_X + offsetSteps * GROUND_PLOT_STEP)).toBe(true);
    }

    for (const site of rightSites){
      const offsetSteps = (site.x - CRYSTAL_X) / GROUND_PLOT_STEP;
      expect(offsetSteps).toBeGreaterThan(0);
      expect(offsetSteps).toBeCloseTo(Math.round(offsetSteps), 10);
      expect(hasPlotAt(CRYSTAL_X - offsetSteps * GROUND_PLOT_STEP)).toBe(true);
    }
  });
});

describe('Vĩnh Dạ structure surfaces', () => {
  const rockSite: Pick<BuildSite, 'kind'> = { kind: 'rock' };
  const groundSite: Pick<BuildSite, 'kind'> = { kind: 'ground' };

  test('STRUCTURE_SURFACES không cho landmine/swamp xây trên rock', () => {
    expect(STRUCTURE_SURFACES.landmine).toEqual(['ground']);
    expect(STRUCTURE_SURFACES.swamp).toEqual(['ground']);
    expect(isStructureAllowedOnBuildSite('landmine', rockSite)).toBe(false);
    expect(isStructureAllowedOnBuildSite('swamp', rockSite)).toBe(false);
    expect(isStructureAllowedOnBuildSite('landmine', groundSite)).toBe(true);
    expect(isStructureAllowedOnBuildSite('swamp', groundSite)).toBe(true);
  });
});

describe('frame-rate cap localStorage adapter', () => {
  const originalWindow = globalThis.window;
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        localStorage: {
          getItem: jest.fn((key: string) => store[key] ?? null),
          setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
        },
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });

  test('getFrameRateCap/setFrameRateCap đọc ghi localStorage mock và chuẩn hóa giá trị', () => {
    expect(getFrameRateCap()).toBe(60);

    setFrameRateCap(30);
    expect(store['arclune.frameRateCap']).toBe('30');
    expect(getFrameRateCap()).toBe(30);

    setFrameRateCap(60);
    expect(store['arclune.frameRateCap']).toBe('60');
    expect(getFrameRateCap()).toBe(60);
  });
});

describe('Vĩnh Dạ enemy templates', () => {
  test('mỗi enemy template có attackCooldown và weight', () => {
    const templates: EnemyTemplate[] = [DEFAULT_ENEMY_TEMPLATE, ...Object.values(ENEMY_TEMPLATES)];

    for (const template of templates){
      expect(template).toHaveProperty('attackCooldown');
      expect(template).toHaveProperty('weight');
      expect(Number.isFinite(template.attackCooldown)).toBe(true);
      expect(template.attackCooldown).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(template.weight)).toBe(true);
      expect(template.weight).toBeGreaterThan(0);
    }
  });
});
