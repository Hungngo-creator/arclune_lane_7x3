import { nextTurnInterleaved, predictNaturalActors } from '../src/turns/interleaved.ts';
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

  test('two summons with one definition id and distinct iid both act', () => {
    const state: any = makeState([
      { id: 'wolf', iid: 101, side: 'ally', alive: true, ...slotToCell('ally', 2) },
      { id: 'wolf', iid: 102, side: 'ally', alive: true, ...slotToCell('ally', 4) },
    ]);
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(101);
    state.turn.nextSide = 'ALLY';
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(102);
  });

  test('summon in the slot just vacated by actor waits for the next pass', () => {
    const actor = { id: 'actor', iid: 201, side: 'ally', alive: true, ...slotToCell('ally', 3) };
    const tail = { id: 'tail', iid: 202, side: 'ally', alive: true, ...slotToCell('ally', 7) };
    const state: any = makeState([actor, tail]);
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(201);
    state.tokens.splice(0, 1, { id: 'summon', iid: 203, side: 'ally', alive: true, ...slotToCell('ally', 3) });
    state.turn.nextSide = 'ALLY';
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(202);
    state.turn.nextSide = 'ALLY';
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(203);
  });

  test.each([[1, 8], [8, 1]])('acted actor movement %i -> %i cannot act twice', (from, to) => {
    const mover = { id: 'mover', iid: 301, side: 'ally', alive: true, ...slotToCell('ally', from) };
    const otherSlot = from === 1 ? 4 : 9;
    const other = { id: 'other', iid: 302, side: 'ally', alive: true, ...slotToCell('ally', otherSlot) };
    const state: any = makeState([mover, other]);
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(301);
    Object.assign(mover, slotToCell('ally', to));
    state.turn.nextSide = 'ALLY';
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(302);
  });

  test('an unacted instance moved ahead of the cursor still acts', () => {
    const first = { id: 'first', iid: 401, side: 'ally', alive: true, ...slotToCell('ally', 2) };
    const moved = { id: 'moved', iid: 402, side: 'ally', alive: true, ...slotToCell('ally', 1) };
    const state: any = makeState([first, moved]);
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(402);
    Object.assign(first, slotToCell('ally', 6));
    state.turn.nextSide = 'ALLY';
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(401);
  });

  test('revive identity controls double-turn protection', () => {
    const original = { id: 'hero', iid: 501, side: 'ally', alive: true, ...slotToCell('ally', 1) };
    const tail = { id: 'tail', iid: 502, side: 'ally', alive: true, ...slotToCell('ally', 5) };
    const state: any = makeState([original, tail]);
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(501);
    original.alive = false;
    state.tokens.push({ ...original, alive: true, ...slotToCell('ally', 4) });
    state.turn.nextSide = 'ALLY';
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(502);
    state.tokens.push({ id: 'hero', iid: 503, side: 'ally', alive: true, ...slotToCell('ally', 7) });
    state.turn.nextSide = 'ALLY';
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(503);
  });

  test('forecast is read-only and matches real scheduler', () => {
    const state: any = makeState([
      { id: 'a', iid: 601, side: 'ally', alive: true, ...slotToCell('ally', 1) },
      { id: 'b', iid: 602, side: 'enemy', alive: true, ...slotToCell('enemy', 3) },
    ]);
    const turnBefore = structuredClone(state.turn);
    const tokensBefore = state.tokens.map((token: any) => ({ ...token }));
    const forecast = predictNaturalActors(state, 4).map(p => [p.side, p.pos, p.unit?.iid]);
    expect(state.turn).toEqual(turnBefore);
    expect(state.tokens).toEqual(tokensBefore);
    const actual = Array.from({ length: 4 }, () => {
      const pick = nextTurnInterleaved(state)!;
      return [pick.side, pick.pos, pick.unit?.iid];
    });
    expect(actual).toEqual(forecast);
  });

  test('occupied queued slot selects occupant and leaves queue pending', () => {
    const occupant = { id: 'occupant', iid: 701, side: 'ally', alive: true, ...slotToCell('ally', 2) };
    const state: any = makeState([occupant]);
    state.queued.ally.set(2, { unitId: 'queued', spawnCycle: 0 });
    const pick = nextTurnInterleaved(state)!;
    expect(pick.unit?.iid).toBe(701);
    expect(pick.spawnOnly).toBe(false);
    expect(state.queued.ally.has(2)).toBe(true);
  });

  test('side without actors does not deadlock the surviving side', () => {
    const survivor = { id: 'survivor', iid: 801, side: 'enemy', alive: true, ...slotToCell('enemy', 4) };
    const state: any = makeState([survivor], 'ALLY');
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(801);
    expect(nextTurnInterleaved(state)?.unit?.iid).toBe(801);
    expect(state.turn.cycle).toBe(1);
  });

  test('global cycle waits for both highly asymmetric side passes', () => {
    const state: any = makeState([
      { id: 'a1', iid: 901, side: 'ally', alive: true, ...slotToCell('ally', 1) },
      { id: 'e1', iid: 902, side: 'enemy', alive: true, ...slotToCell('enemy', 1) },
      { id: 'e5', iid: 903, side: 'enemy', alive: true, ...slotToCell('enemy', 5) },
      { id: 'e9', iid: 904, side: 'enemy', alive: true, ...slotToCell('enemy', 9) },
    ]);
    expect(nextTurnInterleaved(state)?.unitId).toBe('a1');
    expect(nextTurnInterleaved(state)?.unitId).toBe('e1');
    expect(nextTurnInterleaved(state)?.unitId).toBe('a1');
    expect(state.turn.wrapCount.ALLY).toBe(1);
    expect(state.turn.cycle).toBe(0);
    expect(nextTurnInterleaved(state)?.unitId).toBe('e5');
    expect(nextTurnInterleaved(state)?.unitId).toBe('a1');
    expect(state.turn.cycle).toBe(0);
    expect(nextTurnInterleaved(state)?.unitId).toBe('e9');
    expect(nextTurnInterleaved(state)?.unitId).toBe('a1');
    expect(nextTurnInterleaved(state)?.unitId).toBe('e1');
    expect(state.turn.cycle).toBe(1);
  });

  test('queued summon is not due when only its side has wrapped', () => {
    const state: any = makeState([
      { id: 'a1', iid: 911, side: 'ally', alive: true, ...slotToCell('ally', 1) },
      { id: 'e1', iid: 912, side: 'enemy', alive: true, ...slotToCell('enemy', 1) },
      { id: 'e9', iid: 913, side: 'enemy', alive: true, ...slotToCell('enemy', 9) },
    ]);
    state.queued.ally.set(2, { unitId: 'future', spawnCycle: 1 });
    expect(nextTurnInterleaved(state)?.unitId).toBe('a1');
    expect(nextTurnInterleaved(state)?.unitId).toBe('e1');
    expect(nextTurnInterleaved(state)?.unitId).toBe('a1');
    expect(state.turn.cycle).toBe(0);
    expect(nextTurnInterleaved(state)?.unitId).toBe('e9');
    expect(nextTurnInterleaved(state)?.unitId).toBe('a1');
    expect(nextTurnInterleaved(state)?.unitId).toBe('e1');
    expect(state.turn.cycle).toBe(1);
    expect(nextTurnInterleaved(state)).toMatchObject({ side: 'ally', pos: 2, spawnOnly: true });
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
