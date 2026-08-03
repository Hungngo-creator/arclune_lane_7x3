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

  const expectSequence = (attackerSlot: number, sequence: readonly number[]): void => {
    for (let omitted = 0; omitted < sequence.length; omitted += 1) {
      const attacker = makeToken('attacker', 'ally', attackerSlot);
      const targets = sequence.slice(omitted).map(slot => makeToken(`slot-${slot}`, 'enemy', slot));
      expect(pickTarget({ tokens: [attacker, ...targets] }, attacker)?.id).toBe(`slot-${sequence[omitted]}`);
    }
  };

  it.each([1, 4, 7])('outer-A attacker slot %i follows 3→6→9→2→5→8', slot => {
    expectSequence(slot, [3, 6, 9, 2, 5, 8]);
  });

  it.each([3, 6, 9])('outer-B attacker slot %i follows 1→4→7→2→5→8', slot => {
    expectSequence(slot, [1, 4, 7, 2, 5, 8]);
  });

  it.each([2, 5, 8])('middle attacker slot %i follows 2→5→8', slot => {
    expectSequence(slot, [2, 5, 8]);
    const attacker = makeToken('attacker', 'ally', slot); const outer = makeToken('outer', 'enemy', 1); const middle = makeToken('middle', 'enemy', 5);
    expect(pickTarget({ tokens: [attacker, outer, middle] }, attacker)?.id).toBe('middle');
  });

  it.each([
    { hp: 0, lifeState: 'hp-zero', alive: false },
    { hp: 0, lifeState: 'dead-confirmed', alive: false },
    { hp: 10, lifeState: 'removed', alive: false },
    { hp: 0, lifeState: 'erased', alive: false, entityKind: 'combat-object' },
  ])('skips non-live earlier occupancy %#', state => {
    const attacker = makeToken('attacker', 'ally', 4); const invalid = Object.assign(makeToken('invalid', 'enemy', 3), state); const valid = makeToken('valid', 'enemy', 6);
    expect(pickTarget({ tokens: [attacker, invalid, valid] }, attacker)?.id).toBe('valid');
  });

  it('full-field Taunt overrides default groups', () => {
    const attacker = makeToken('attacker', 'ally', 7); const preferred = makeToken('preferred', 'enemy', 3); const taunter = makeToken('taunter', 'enemy', 4); taunter.statuses = [{ id: 'taunt' } as any];
    expect(pickTarget({ tokens: [attacker, preferred, taunter] }, attacker)?.id).toBe('taunter');
  });

  it('slot-1 creep selects living slot 5 before outer fallback', () => {
    const attacker = makeToken('creep', 'enemy', 1); const phe = makeToken('phe', 'ally', 1); const collection = makeToken('collection', 'ally', 5); const leader = makeToken('leaderA', 'ally', 8);
    expect(pickTarget({ tokens: [attacker, phe, collection, leader] }, attacker)?.id).toBe('collection');
  });
});
