import { resolveCollectionCombatPower, resolveUnitStatPreview } from '../src/screens/collection/view.ts';

function statValue(preview: ReturnType<typeof resolveUnitStatPreview>, key: string): number {
  const stat = preview.stats.find((row) => row.key === key);
  if (!stat) throw new Error(`Missing stat ${key}`);
  return stat.value;
}

describe('collection stat preview pipeline', () => {
  it('raises thien_luu HP in mini stats and combat power from the same cultivation preview', () => {
    const basePreview = resolveUnitStatPreview({
      unitId: 'thien_luu',
      cultivation: { realm: 1, subRealm: 0 },
      tpAllocation: {},
      equipment: {},
    });
    const cultivatedPreview = resolveUnitStatPreview({
      unitId: 'thien_luu',
      cultivation: { realm: 1, subRealm: 1 },
      tpAllocation: {},
      equipment: {},
    });

    expect(statValue(cultivatedPreview, 'HP')).toBeGreaterThan(statValue(basePreview, 'HP'));
    expect(resolveCollectionCombatPower(cultivatedPreview, 0)).toBeGreaterThan(resolveCollectionCombatPower(basePreview, 0));
  });
});

