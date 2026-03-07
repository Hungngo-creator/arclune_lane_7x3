import { createSession } from '../src/modes/pve/session-state.ts';

describe('pve session interleaved random start side', () => {
  test('chọn phe bắt đầu theo rng seed cho mọi trận', () => {
    const allyStart = createSession({ turnMode: 'interleaved_by_position', rngSeed: 1 });
    const enemyStart = createSession({ turnMode: 'interleaved_by_position', rngSeed: 682 });

    expect(allyStart.turn.mode).toBe('interleaved_by_position');
    expect(enemyStart.turn.mode).toBe('interleaved_by_position');
    expect((allyStart.turn as any).nextSide).toBe('ALLY');
    expect((enemyStart.turn as any).nextSide).toBe('ENEMY');
  });
});
