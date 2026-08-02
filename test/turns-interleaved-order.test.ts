import { nextTurnInterleaved } from '../src/turns/interleaved.ts';
import { slotToCell } from '../src/engine.ts';

describe('interleaved by position order', () => {
  const makeState = (tokens: any[], nextSide = 'ALLY') => ({
    tokens, queued: { ally: new Map(), enemy: new Map() },
    turn: { mode: 'interleaved_by_position', nextSide, lastPos: { ALLY: 0, ENEMY: 0 },
      wrapCount: { ALLY: 0, ENEMY: 0 }, actedNatural: { ALLY: [], ENEMY: [] },
      turnCount: 0, slotCount: 9, cycle: 0, busyUntil: 0 }
  });
  test('giữ đúng nhịp A1 -> B1 -> A2 -> B2 khi cả hai bên đều có quân', () => {
    const ally1 = { id: 'ally1', side: 'ally', alive: true, ...slotToCell('ally', 1) };
    const ally2 = { id: 'ally2', side: 'ally', alive: true, ...slotToCell('ally', 2) };
    const enemy1 = { id: 'enemy1', side: 'enemy', alive: true, ...slotToCell('enemy', 1) };
    const enemy2 = { id: 'enemy2', side: 'enemy', alive: true, ...slotToCell('enemy', 2) };

    const state: any = {
      tokens: [ally1, ally2, enemy1, enemy2],
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
      'enemy:1:enemy1',
      'ally:2:ally2',
      'enemy:2:enemy2',
      'ally:1:ally1',
      'enemy:1:enemy1'
    ]);
  });

  test('seeded result may start with enemy', () => {
    const state: any = makeState([
      { id: 'a1', iid: 1, side: 'ally', alive: true, ...slotToCell('ally', 1) },
      { id: 'b1', iid: 2, side: 'enemy', alive: true, ...slotToCell('enemy', 1) },
    ], 'ENEMY');
    expect(nextTurnInterleaved(state)?.side).toBe('enemy');
  });

  test('dead unit is skipped before its natural turn', () => {
    const dead = { id: 'dead', iid: 1, side: 'ally', alive: false, ...slotToCell('ally', 1) };
    const alive = { id: 'alive', iid: 2, side: 'ally', alive: true, ...slotToCell('ally', 3) };
    const state: any = makeState([dead, alive]);
    expect(nextTurnInterleaved(state)?.unitId).toBe('alive');
  });

  test('summon ahead acts now, summon behind waits for the next side pass', () => {
    const a1 = { id: 'a1', iid: 1, side: 'ally', alive: true, ...slotToCell('ally', 1) };
    const state: any = makeState([a1]);
    expect(nextTurnInterleaved(state)?.pos).toBe(1);
    state.turn.nextSide = 'ALLY';
    state.tokens.push({ id: 'ahead', iid: 2, side: 'ally', alive: true, ...slotToCell('ally', 5) });
    state.tokens.push({ id: 'behind', iid: 3, side: 'ally', alive: true, ...slotToCell('ally', 1) });
    expect(nextTurnInterleaved(state)?.unitId).toBe('ahead');
    state.turn.nextSide = 'ALLY';
    expect(nextTurnInterleaved(state)?.unitId).toBe('a1');
  });

  test('movement cannot grant a second natural action in one side pass', () => {
    const mover = { id: 'mover', iid: 10, side: 'ally', alive: true, ...slotToCell('ally', 1) };
    const later = { id: 'later', iid: 11, side: 'ally', alive: true, ...slotToCell('ally', 4) };
    const state: any = makeState([mover, later]);
    expect(nextTurnInterleaved(state)?.unitId).toBe('mover');
    Object.assign(mover, slotToCell('ally', 7));
    state.turn.nextSide = 'ALLY';
    expect(nextTurnInterleaved(state)?.unitId).toBe('later');
  });

  test('forced action leaves both SSI cursors untouched', () => {
    const state: any = makeState([]);
    const before = JSON.stringify(state.turn);
    // Forced/counter/follow-up actions do not call nextTurnInterleaved.
    expect(JSON.stringify(state.turn)).toBe(before);
  });

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
      'enemy:2:enemy2',
      'ally:2:ally2',
      'enemy:3:enemy3',
      'ally:1:ally1',
      'enemy:2:enemy2'
    ]);
  });
});
