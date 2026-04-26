import { describe, expect, test } from '@jest/globals';

import { CFG } from '../src/config.ts';
import { buildTurnOrder, createSession } from '../src/modes/pve/session-state.ts';

describe('pve session turn-order cluster', () => {
  test('buildTurnOrder chuẩn hóa pairScan nhiều dạng và clamp slot', () => {
    const original = CFG.turnOrder.pairScan;
    const originalSides = CFG.turnOrder.sides;
    try {
      CFG.turnOrder.pairScan = [
        0,
        ['enemy', 11],
        { slot: 2 },
        { side: 'ally', index: 4 },
        [3, 7],
        { s: 5 },
      ] as any;
      CFG.turnOrder.sides = ['ally', 'enemy'];

      const { order, indexMap } = buildTurnOrder();

      expect(order).toEqual([
        { side: 'ally', slot: 1 },
        { side: 'enemy', slot: 1 },
        { side: 'enemy', slot: 9 },
        { side: 'ally', slot: 2 },
        { side: 'enemy', slot: 2 },
        { side: 'ally', slot: 4 },
        { side: 'ally', slot: 3 },
        { side: 'enemy', slot: 3 },
        { side: 'ally', slot: 7 },
        { side: 'enemy', slot: 7 },
        { side: 'ally', slot: 5 },
        { side: 'enemy', slot: 5 },
      ]);
      expect(indexMap.get('ally:1')).toBe(0);
      expect(indexMap.get('enemy:1')).toBe(1);
      expect(indexMap.get('enemy:9')).toBe(2);
    } finally {
      CFG.turnOrder.pairScan = original;
      CFG.turnOrder.sides = originalSides;
    }
  });

  test('createSession ở mode sequential dùng turn-order đã normalize', () => {
    const original = CFG.turnOrder.pairScan;
    const originalSides = CFG.turnOrder.sides;
    try {
      CFG.turnOrder.pairScan = [9, 1] as any;
      CFG.turnOrder.sides = ['ally', 'enemy'];

      const session = createSession({ turnMode: 'sequential' as any });

      expect(session.turn.mode).toBe('sequential');
      expect(session.turn.order?.slice(0, 4)).toEqual([
        { side: 'ally', slot: 9 },
        { side: 'enemy', slot: 9 },
        { side: 'ally', slot: 1 },
        { side: 'enemy', slot: 1 },
      ]);
      expect(session.turn.orderIndex?.get('ally:9')).toBe(0);
      expect(session.turn.orderIndex?.get('enemy:1')).toBe(3);
    } finally {
      CFG.turnOrder.pairScan = original;
      CFG.turnOrder.sides = originalSides;
    }
  });
});
