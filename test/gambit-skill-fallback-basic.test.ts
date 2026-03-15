import { evaluateGambitLogic } from '../src/ai.ts';

describe('gambit skill fallback basic', () => {
  it('skips failed skill conditions and falls back to basic slot', () => {
    const unit = {
      id: 'unit_b',
      iid: 2,
      side: 'ally',
      alive: true,
      hp: 90,
      hpMax: 100,
      fury: 0,
      furyMax: 100,
      statuses: [],
    };

    const Game = {
      tokens: [unit],
      runtime: {
        unitProgressById: new Map([
          ['unit_b', {
            gambit: [
              { condition: 'self_hp_below', threshold: 10, action: 'skill1', enabled: true },
              { condition: 'pool_aether_above', threshold: 999, action: 'skill2', enabled: true },
              { condition: 'always', action: 'basic', enabled: true },
            ],
          }],
        ]),
      },
      meta: new Map(),
    };

    const decision = evaluateGambitLogic(Game as never, unit as never);
    expect(decision.action).toBe('basic');
    expect(decision.slotIndex).toBe(2);
  });
});
