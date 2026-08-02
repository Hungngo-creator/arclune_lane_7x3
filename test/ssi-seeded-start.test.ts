import { createSession } from '../src/modes/pve/session-state.ts';
import { nextTurnInterleaved } from '../src/turns/interleaved.ts';
import { slotToCell } from '../src/engine.ts';
import { createRngState, nextRngValue } from '../src/utils/rng.ts';

describe('SSI seeded starting side integration', () => {
  test.each([1, 42, 8675309])('seed %i selects once in session creation and scheduler does not reroll', (seed) => {
    const expected = nextRngValue(createRngState(seed)) < 0.5 ? 'ALLY' : 'ENEMY';
    const first = createSession({ rngSeed: seed, turnMode: 'interleaved_by_position' } as any);
    const second = createSession({ rngSeed: seed, turnMode: 'interleaved_by_position' } as any);

    expect(first.turn?.mode).toBe('interleaved_by_position');
    expect((first.turn as any).nextSide).toBe(expected);
    expect((second.turn as any).nextSide).toBe(expected);

    first.tokens = [
      { id: 'seed-ally', iid: 1, side: 'ally', alive: true, ...slotToCell('ally', 1) },
      { id: 'seed-enemy', iid: 2, side: 'enemy', alive: true, ...slotToCell('enemy', 1) },
    ] as any;
    const selected = nextTurnInterleaved(first, first.turn as any);
    expect(selected?.sideKey).toBe(expected);
    expect((first.turn as any).nextSide).toBe(expected === 'ALLY' ? 'ENEMY' : 'ALLY');
  });
});

