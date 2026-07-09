import { resolveCollectionCombatPower, resolveUnitStatPreview } from '../src/screens/collection/view.ts';
import { createSession } from '../src/modes/pve/session-state.ts';
import { resolveRuntimeUnitStats } from '../src/modes/pve/collection-mapper.ts';

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

it('keeps compact Tu Vi panel HP preview increasing across subRealm changes', () => {
    const previousPreview = resolveUnitStatPreview({
      unitId: 'thien_luu',
      cultivation: { realm: 1, subRealm: 1 },
      tpAllocation: {},
      equipment: {},
    });
    const nextPreview = resolveUnitStatPreview({
      unitId: 'thien_luu',
      cultivation: { realm: 1, subRealm: 2 },
      tpAllocation: {},
      equipment: {},
    });

    expect(statValue(nextPreview, 'HP')).toBeGreaterThan(statValue(previousPreview, 'HP'));
  });

  it('keeps thien_luu Collection HP/ATK equal to PvE runtime stats after createSession', () => {
    const collectionState = {
      units: [
        {
          unitId: 'thien_luu',
          owned: true,
          level: 1,
          stars: 0,
          realm: 1,
          subRealm: 1,
          tpAlloc: { HP: 2, ATK: 3 },
          equipment: { shirt: 'ao-luyen-khi-su-vo-danh', weapon: 'kiem-cu-luyen-khi-su-vo-danh' },
        },
      ],
    };
    const preview = resolveUnitStatPreview({
      unitId: 'thien_luu',
      cultivation: { realm: 1, subRealm: 1 },
      tpAllocation: { HP: 2, ATK: 3 },
      equipment: { shirt: 'ao-luyen-khi-su-vo-danh', weapon: 'kiem-cu-luyen-khi-su-vo-danh' },
    });
    const session = createSession({ lineupDeck: [{ id: 'thien_luu' }], collectionState, rngSeed: 9 });
    const runtimeStats = resolveRuntimeUnitStats('thien_luu', session.runtime.unitProgressById);

    expect(statValue(preview, 'HP')).toBe(runtimeStats.hpMax);
    expect(runtimeStats.hp).toBe(runtimeStats.hpMax);
    expect(statValue(preview, 'ATK')).toBe(runtimeStats.atk);
  });
});
