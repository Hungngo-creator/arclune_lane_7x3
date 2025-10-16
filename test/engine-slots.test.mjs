import test from 'node:test';
import assert from 'node:assert/strict';

import * as engineModule from '../src/engine.js';
import * as combatModule from '../src/combat.js';

const { slotIndex, slotToCell } = engineModule;
const { pickTarget } = combatModule;

test('enemy slot mapping uses top-to-bottom rows', () => {
  for (let slot = 1; slot <= 9; slot++) {
    const cell = slotToCell('enemy', slot);
    const expectedRow = (slot - 1) % 3;
    assert.strictEqual(
      cell.cy,
      expectedRow,
      `slotToCell('enemy', ${slot}) should map to row ${expectedRow}`
    );

    const idx = slotIndex('enemy', cell.cx, cell.cy);
    assert.strictEqual(idx, slot, `slotIndex('enemy', ...) should invert slot ${slot}`);
  }

  const col1 = slotToCell('enemy', 1).cx;
  const col2 = slotToCell('enemy', 4).cx;
  const col3 = slotToCell('enemy', 7).cx;
  assert.strictEqual(col2, col1 + 1, 'enemy columns should increase moving away from midline');
  assert.strictEqual(col3, col2 + 1, 'enemy columns should continue increasing across slots');
});

test('pickTarget prioritises enemy slots in the attacker row (ally attacker)', () => {
  const attacker = { id: 'allyAtt', side: 'ally', alive: true, ...slotToCell('ally', 1) };
  const enemyBottom = { id: 'enemyBottom', side: 'enemy', alive: true, ...slotToCell('enemy', 3) };
  const enemyTop = { id: 'enemyTop', side: 'enemy', alive: true, ...slotToCell('enemy', 4) };
  const enemyMid = { id: 'enemyMid', side: 'enemy', alive: true, ...slotToCell('enemy', 2) };

  const Game = { tokens: [attacker, enemyBottom, enemyTop, enemyMid] };
  const target = pickTarget(Game, attacker);

  assert.strictEqual(target?.id, 'enemyTop', 'ally attacker should favour top-row enemy slot when in top row');
});

test('pickTarget prioritises ally slots in the attacker row (enemy attacker)', () => {
  const attacker = { id: 'enemyAtt', side: 'enemy', alive: true, ...slotToCell('enemy', 1) };
  const allyBottom = { id: 'allyBottom', side: 'ally', alive: true, ...slotToCell('ally', 3) };
  const allyTop = { id: 'allyTop', side: 'ally', alive: true, ...slotToCell('ally', 4) };
  const allyMid = { id: 'allyMid', side: 'ally', alive: true, ...slotToCell('ally', 2) };

  const Game = { tokens: [attacker, allyBottom, allyTop, allyMid] };
  const target = pickTarget(Game, attacker);

  assert.strictEqual(target?.id, 'allyTop', 'enemy attacker should favour top-row ally slot when in top row');
});
