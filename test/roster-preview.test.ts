import assert from 'node:assert/strict';

import {
  CLASS_BASE,
  RANK_MULT,
  ROSTER,
  applyRankAndMods,
} from '../src/catalog.ts';
import {
  TP_DELTA,
  STAT_KEYS,
  ROSTER_TP_ALLOCATIONS,
  ROSTER_PREVIEWS,
  ROSTER_PREVIEW_ROWS,
  computeFinalStats,
  deriveTpFromMods,
} from '../src/data/roster-preview.ts';

const EXPECTED_TP_DELTA: Readonly<Record<string, number>> = Object.freeze({
  HP: 20,
  ATK: 1,
  WIL: 1,
  ARM: 0.01,
  RES: 0.01,
  AGI: 1,
  PER: 1,
  AEmax: 10,
  AEregen: 0.5,
  HPregen: 2,
});

const SAMPLE_IDS = ['phe', 'kiemtruongda', 'linhgac'] as const;

describe('roster preview data integrity', () => {
  test('TP deltas mirror thiết kế', () => {
    assert.deepStrictEqual(TP_DELTA, EXPECTED_TP_DELTA);
  });

  test('final stat computation khớp catalog', () => {
    for (const id of SAMPLE_IDS) {
      const meta = ROSTER.find((unit) => unit.id === id);
      if (!meta) {
        throw new Error(`Thiếu roster entry cho ${id}`);
      }
      const expected = applyRankAndMods(
        CLASS_BASE[meta.class as keyof typeof CLASS_BASE],
        meta.rank as keyof typeof RANK_MULT,
        meta.mods,
      );
      const allocation = ROSTER_TP_ALLOCATIONS[id];
      if (!allocation) {
        throw new Error(`Thiếu TP allocation cho ${id}`);
      }
      const finalFromTp = computeFinalStats(
        meta.class as keyof typeof CLASS_BASE,
        meta.rank as keyof typeof RANK_MULT,
        allocation,
      );
      for (const stat of STAT_KEYS) {
        assert.strictEqual(
          finalFromTp[stat],
          expected[stat],
          `Sai lệch final stat ${stat} cho ${id}`,
        );
      }
      assert.strictEqual(
        finalFromTp.SPD,
        CLASS_BASE[meta.class as keyof typeof CLASS_BASE].SPD,
        'SPD không được thay đổi bởi rank',
      );
    }
  });

  test('TP allocation có thể tái dựng từ mods', () => {
    for (const unit of ROSTER) {
      const base = CLASS_BASE[unit.class as keyof typeof CLASS_BASE];
      const derived = deriveTpFromMods(base, unit.mods);
      const allocation = ROSTER_TP_ALLOCATIONS[unit.id];
      if (!allocation) {
        throw new Error(`Thiếu TP allocation cho ${unit.id}`);
      }
      for (const stat of Object.keys(derived)) {
        assert.ok(stat in allocation, `Thiếu TP stat ${stat} cho ${unit.id}`);
      }
    }
  });

  test('preview rows khớp final preview data', () => {
    for (const row of ROSTER_PREVIEW_ROWS) {
      for (const entry of row.values) {
        const preview = ROSTER_PREVIEWS[entry.id];
        if (!preview) {
          throw new Error(`Thiếu preview cho ${entry.id}`);
        }
        assert.strictEqual(
          entry.value,
          preview.final[row.stat],
          `Sai lệch preview stat ${row.stat} cho ${entry.id}`,
        );
      }
    }
  });

  test('rank multiplier trong preview khớp catalog', () => {
    for (const unit of ROSTER) {
      const preview = ROSTER_PREVIEWS[unit.id];
      if (!preview) {
        throw new Error(`Thiếu preview cho ${unit.id}`);
      }
      assert.strictEqual(
        preview.rankMultiplier,
        RANK_MULT[unit.rank as keyof typeof RANK_MULT],
        `Sai multiplier cho ${unit.id}`,
      );
    }
  });
});