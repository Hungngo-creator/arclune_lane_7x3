import { isBasicAttackAfterHitHandler } from '../src/combat.ts';

import type { BasicAttackAfterHitArgs } from '../src/combat.ts';
import type { AfterHitHandler } from '../src/passives.ts';
import type { UnitToken } from '../src/types/units.ts';

describe('basic attack afterHit type guard', () => {
  const makeUnit = (id: string): UnitToken => ({
    id,
    side: 'ally',
    cx: 0,
    cy: 0,
    alive: true,
  } as UnitToken);

  it('accepts callable handlers and rejects invalid values', () => {
    const valid: AfterHitHandler = () => {};
    const invalid = 42 as unknown as AfterHitHandler;

    expect(isBasicAttackAfterHitHandler(valid)).toBe(true);
    expect(isBasicAttackAfterHitHandler(invalid)).toBe(false);
  });

  it('narrows handler type for basic attack arguments', () => {
    const target = makeUnit('target');
    const owner = makeUnit('owner');
    const captured: BasicAttackAfterHitArgs[] = [];

    const handler: AfterHitHandler = ctx => {
      const record = (ctx ?? {}) as Record<string, unknown>;
      captured.push({
        target: (record.target as UnitToken) ?? target,
        owner: (record.owner as UnitToken) ?? owner,
        result: (record.result as BasicAttackAfterHitArgs['result']) ?? { dealt: 0, absorbed: 0 },
      });
    };

    const mixedHandlers: Array<AfterHitHandler | null | undefined> = [
      handler,
      null,
      undefined,
    ];

    const filtered = mixedHandlers.filter(isBasicAttackAfterHitHandler);
    expect(filtered).toHaveLength(1);

    const args: BasicAttackAfterHitArgs = {
      target,
      owner,
      result: { dealt: 10, absorbed: 2 },
    };

    filtered[0](args);

    expect(captured).toEqual([args]);
  });
});
