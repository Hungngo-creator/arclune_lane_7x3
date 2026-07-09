import { createSession } from '../src/modes/pve/session-state.ts';
import { CFG } from '../src/config.ts';

describe('PvE AI preset limits', () => {
  it('falls back to defaults when aiPreset costCap/summonLimit are non-positive', () => {
    const game = createSession({
      aiPreset: {
        costCap: 0,
        summonLimit: 0,
      },
    });

    expect(game.ai.costCap).toBe(CFG.COST_CAP);
    expect(game.ai.summonLimit).toBe(CFG.SUMMON_LIMIT);
  });
});
