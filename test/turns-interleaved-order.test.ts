import { nextTurnInterleaved } from '../src/turns/interleaved.ts';
import { slotToCell } from '../src/engine.ts';

describe('interleaved by position order', () => {
  test('alternates theo từng ô A1->B1->A2... và bỏ qua ô trống', () => {
    const ally1 = { id: 'ally1', side: 'ally', alive: true, ...slotToCell('ally', 1) };
    const ally2 = { id: 'ally2', side: 'ally', alive: true, ...slotToCell('ally', 2) };
    const enemy2 = { id: 'enemy2', side: 'enemy', alive: true, ...slotToCell('enemy', 2) };
    const enemy3 = { id: 'enemy3', side: 'enemy', alive: true, ...slotToCell('enemy', 3) };

    const state: any = {
      tokens: [ally1, ally2, enemy2, enemy3],
      queued: { ally: new Map(), enemy: new Map() },
      turn: {
        mode: 'interleaved_by_position',
        nextSide: 'ALLY',
        lastPos: { ALLY: 0, ENEMY: 0 },
        wrapCount: { ALLY: 0, ENEMY: 0 },
        turnCount: 0,
        slotCount: 9,
        cycle: 0,
        busyUntil: 0
      }
    };

    const order: string[] = [];
    for (let i = 0; i < 6; i += 1) {
      const pick = nextTurnInterleaved(state, state.turn);
      expect(pick).not.toBeNull();
      order.push(`${pick?.side}:${pick?.pos}:${pick?.unitId}`);
    }

    expect(order).toEqual([
      'ally:1:ally1',
      'ally:2:ally2',
      'enemy:2:enemy2',
      'enemy:3:enemy3',
      'ally:1:ally1',
      'ally:2:ally2'
    ]);
  });
});
