import { evaluateGambitLogic } from '../src/ai.ts';

describe('gambit skill priority', () => {
  it('returns the first matched skill slot by order', () => {
    const unit = {
      id: 'unit_a',
      iid: 1,
      side: 'ally',
      alive: true,
      hp: 50,
      hpMax: 100,
      fury: 0,
      furyMax: 100,
      statuses: [],
    };

    const Game = {
      tokens: [unit],
      runtime: {
        unitProgressById: new Map([
          ['unit_a', {
            gambit: [
              { condition: 'always', action: 'skill2', enabled: true },
              { condition: 'always', action: 'skill1', enabled: true },
              { condition: 'always', action: 'basic', enabled: true },
            ],
          }],
        ]),
      },
      meta: new Map(),
    };

    const decision = evaluateGambitLogic(Game as never, unit as never);
    expect(decision.action).toBe('skill2');
    expect(decision.slotIndex).toBe(0);
  });
});
