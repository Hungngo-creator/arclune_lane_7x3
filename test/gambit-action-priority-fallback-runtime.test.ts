import * as ai from '../src/ai.ts';
import * as combat from '../src/combat.ts';
import { globalAetherPool } from '../src/aether.ts';
import { doActionOrSkip } from '../src/turns.ts';

describe('gambit action priority + fallback runtime', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('falls back to basic when first skill cannot consume aether', () => {
    jest.spyOn(ai, 'evaluateGambitLogic').mockImplementation((_game, _unit, options) => {
      if ((options?.startIndex ?? 0) === 0) {
        return { slotIndex: 0, action: 'skill1' } as never;
      }
      return { slotIndex: 1, action: 'basic' } as never;
    });
    jest.spyOn(globalAetherPool, 'consume').mockReturnValue(false);
    const basicSpy = jest.spyOn(combat, 'doBasicWithFollowups').mockImplementation(() => ({ ok: true, rootActionId: 'mock-action', attemptedHits: 1, committedHits: 1, totalHpDamage: 1, targetIids: ['mock-target'] }));

    const unit = {
      id: 'hero_fallback',
      side: 'ally',
      alive: true,
      cx: 0,
      cy: 0,
      hp: 100,
      hpMax: 100,
      fury: 0,
      furyMax: 100,
      statuses: [],
    };
    const Game = {
      tokens: [unit],
      meta: new Map([[unit.id, { skills: [{ key: 'skill1', cost: { aether: 30 } }] }]]),
      turn: { busyUntil: 0, cycle: 0 },
    };

    const result = doActionOrSkip(Game as never, unit as never, { performUlt: jest.fn() });

    expect(result.acted).toBe(true);
    expect(basicSpy).toHaveBeenCalledTimes(1);
  });
});
