import assert from 'node:assert/strict';

import {
  CLASS_BASE,
  RANK_MULT,
  ROSTER,
  applyRankAndMods
} from '../src/catalog.js';
import {
  TP_DELTA,
  STAT_KEYS,
  ROSTER_TP_ALLOCATIONS,
  ROSTER_PREVIEWS,
  ROSTER_PREVIEW_ROWS,
  computeFinalStats,
  deriveTpFromMods
} from '../src/data/roster-preview.js';

function getUnitMeta(id) {
  const meta = ROSTER.find((unit) => unit.id === id);
  if (!meta) throw new Error(`Missing roster entry for ${id}`);
  return meta;
}

// Verify TP deltas are captured from the design document.
assert.deepEqual(TP_DELTA, {
  HP: 20,
  ATK: 1,
  WIL: 1,
  ARM: 0.01,
  RES: 0.01,
  AGI: 1,
  PER: 1,
  AEmax: 10,
  AEregen: 0.5,
  HPregen: 2
}, 'TP deltas should mirror the values in "ý tưởng nhân vật v3.txt"');

const sampleIds = ['phe', 'kiemtruongda', 'linhgac'];
for (const id of sampleIds) {
  const meta = getUnitMeta(id);
  const expected = applyRankAndMods(CLASS_BASE[meta.class], meta.rank, meta.mods);
  const finalFromTp = computeFinalStats(meta.class, meta.rank, ROSTER_TP_ALLOCATIONS[id]);
  for (const stat of STAT_KEYS) {
    assert.strictEqual(
      finalFromTp[stat],
      expected[stat],
      `Final stat mismatch for ${id} stat ${stat}`
    );
  }
  assert.strictEqual(
    finalFromTp.SPD,
    CLASS_BASE[meta.class].SPD,
    'SPD should be unaffected by rank scaling'
  );
}

for (const unit of ROSTER) {
  const base = CLASS_BASE[unit.class];
  const derived = deriveTpFromMods(base, unit.mods);
  const allocation = ROSTER_TP_ALLOCATIONS[unit.id];
  for (const stat of Object.keys(derived)) {
    assert.ok(stat in allocation, `Derived TP stat ${stat} missing for ${unit.id}`);
  }
}

for (const row of ROSTER_PREVIEW_ROWS) {
  for (const entry of row.values) {
    const preview = ROSTER_PREVIEWS[entry.id];
    assert.strictEqual(
      entry.value,
      preview.final[row.stat],
      `Preview row mismatch for ${entry.id} stat ${row.stat}`
    );
  }
}

for (const unit of ROSTER) {
  const preview = ROSTER_PREVIEWS[unit.id];
  assert.strictEqual(
    preview.rankMultiplier,
    RANK_MULT[unit.rank],
    `Rank multiplier mismatch for ${unit.id}`
  );
}

console.log('roster-preview tests: OK');