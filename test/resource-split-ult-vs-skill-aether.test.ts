import * as ai from '../src/ai.ts';
import * as combat from '../src/combat.ts';
import { globalAetherPool } from '../src/aether.ts';
import { doActionOrSkip } from '../src/turns.ts';
import * as fury from '../src/utils/fury.ts';

describe('resource split: ult-fury vs skill-aether', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses fury only for ult and does not consume aether', () => {
    jest.spyOn(ai, 'evaluateGambitLogic').mockReturnValue({ slotIndex: 0, action: 'ult' } as never);
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockReturnValue(false);
    const spendFurySpy = jest.spyOn(fury, 'spendFury');

    const performUlt = jest.fn();
    const unit = {
      id: 'hero_ult',
      side: 'ally',
      alive: true,
      cx: 0,
      cy: 0,
      hp: 100,
      hpMax: 100,
      fury: 100,
      furyMax: 100,
      statuses: [],
    };
    const Game = {
      tokens: [unit],
      meta: new Map([[unit.id, {}]]),
      turn: { busyUntil: 0, cycle: 0 },
    };

    const result = doActionOrSkip(Game as never, unit as never, { performUlt });

    expect(result.acted).toBe(true);
    expect(performUlt).toHaveBeenCalledTimes(1);
    expect(spendFurySpy).toHaveBeenCalled();
    expect(consumeSpy).not.toHaveBeenCalled();
  });

  it('uses aether for skill actions and does not spend fury', () => {
    jest.spyOn(ai, 'evaluateGambitLogic').mockReturnValue({ slotIndex: 0, action: 'skill1' } as never);
    const consumeSpy = jest.spyOn(globalAetherPool, 'consume').mockReturnValue(true);
    const spendFurySpy = jest.spyOn(fury, 'spendFury');
    const basicSpy = jest.spyOn(combat, 'doBasicWithFollowups').mockImplementation(() => undefined as never);

    const unit = {
      id: 'hero_skill',
      side: 'ally',
      alive: true,
      cx: 0,
      cy: 0,
      hp: 100,
      hpMax: 100,
      fury: 30,
      furyMax: 100,
      statuses: [],
    };
    const Game = {
      tokens: [unit],
      meta: new Map([[unit.id, { skills: [{ key: 'skill1', cost: { aether: 25 } }] }]]),
      turn: { busyUntil: 0, cycle: 0 },
    };

    const result = doActionOrSkip(Game as never, unit as never, { performUlt: jest.fn() });

    expect(result.acted).toBe(true);
    expect(consumeSpy).toHaveBeenCalledWith('ally', 25);
    expect(spendFurySpy).not.toHaveBeenCalled();
    expect(basicSpy).toHaveBeenCalledTimes(1);
  });
});
