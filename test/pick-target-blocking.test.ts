import { pickTarget } from '../src/combat.ts';
import { slotToCell } from '../src/engine.ts';

import type { UnitToken } from '../src/types/units.ts';

describe('pickTarget blocking rules', () => {
  const makeToken = (id: string, side: 'ally' | 'enemy', slot: number): UnitToken => {
    const { cx, cy } = slotToCell(side, slot);
    return {
      id,
      side,
      cx,
      cy,
      alive: true,
    } as UnitToken;
  };

  it('không chọn slot 8 khi slot 2 hoặc 5 còn sống', () => {
    const attacker = makeToken('ally-warrior', 'ally', 2);
    const frontline = makeToken('enemy-front', 'enemy', 2);
    const leader = makeToken('enemy-leader', 'enemy', 8);

    const target = pickTarget({ tokens: [attacker, frontline, leader] }, attacker);
    expect(target?.id).toBe('enemy-front');
  });

  it('assassin được phép ưu tiên đánh hàng sau', () => {
    const assassin = makeToken('mo_da', 'ally', 1);
    const frontline = makeToken('enemy-front', 'enemy', 1);
    const backline = makeToken('enemy-back', 'enemy', 7);

    const target = pickTarget({ tokens: [assassin, frontline, backline] }, assassin);
    expect(target?.id).toBe('enemy-back');
  });
});
