import * as ai from '../src/ai.ts';
import { globalAetherPool } from '../src/aether.ts';
import * as combat from '../src/combat.ts';
import { doActionOrSkip } from '../src/turns.ts';

describe('doActionOrSkip no ult without fury', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('không cast ult khi Fury thiếu dù Aether cao', () => {
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockReturnValue(true);
    const basicSpy = jest.spyOn(combat, 'doBasicWithFollowups').mockImplementation(() => ({ ok: true, rootActionId: 'mock-action', attemptedHits: 1, committedHits: 1, totalHpDamage: 1, targetIids: ['mock-target'] }));

    let decisions = 0;
    jest.spyOn(ai, 'evaluateGambitLogic').mockImplementation(() => {
      decisions += 1;
      if (decisions === 1) return { slotIndex: 0, action: 'ult' } as any;
      return { slotIndex: 1, action: 'basic' } as any;
    });

    const performUlt = jest.fn();
    const unit = {
      id: 'heroB',
      side: 'ally',
      alive: true,
      cx: 0,
      cy: 0,
      hp: 100,
      hpMax: 100,
      fury: 20,
      furyMax: 100,
      statuses: []
    };
    const Game = {
      tokens: [unit],
      meta: new Map([[unit.id, {}]]),
      turn: { busyUntil: 0, cycle: 0 }
    };

    const result = doActionOrSkip(Game as any, unit as any, { performUlt });

    expect(performUlt).not.toHaveBeenCalled();
    expect(result.acted).toBe(true);
    expect(result.skipped).toBe(false);
    expect(basicSpy).toHaveBeenCalledTimes(1);
    expect(consumeSpy).not.toHaveBeenCalled();
  });
});
