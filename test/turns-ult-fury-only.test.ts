import * as ai from '../src/ai.ts';
import { globalAetherPool } from '../src/aether.ts';
import { doActionOrSkip } from '../src/turns.ts';

describe('doActionOrSkip ult fury-only', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('vẫn cast ult khi Aether = 0 nhưng Fury đủ', () => {
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockReturnValue(false);
    jest.spyOn(ai, 'evaluateGambitLogic').mockReturnValue({ slotIndex: 0, action: 'ult' } as any);

    const performUlt = jest.fn();
    const unit = {
      id: 'heroA',
      side: 'ally',
      alive: true,
      cx: 0,
      cy: 0,
      hp: 100,
      hpMax: 100,
      fury: 100,
      furyMax: 100,
      statuses: []
    };
    const Game = {
      tokens: [unit],
      meta: new Map([[unit.id, {}]]),
      turn: { busyUntil: 0, cycle: 0 }
    };

    const result = doActionOrSkip(Game as any, unit as any, { performUlt });

    expect(result.acted).toBe(true);
    expect(result.skipped).toBe(false);
    expect(performUlt).toHaveBeenCalledTimes(1);
    expect(unit.fury).toBe(0);
    expect(consumeSpy).not.toHaveBeenCalled();
  });
});
