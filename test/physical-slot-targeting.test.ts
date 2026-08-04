import { pickTarget } from '../src/combat.ts';
import { slotIndex } from '../src/engine.ts';
import type { UnitToken } from '../src/types/units.ts';

const raw = (id: string, side: 'ally' | 'enemy', cx: number, cy: number, iid: number): UnitToken => ({
  id, iid, side, cx, cy, alive: true, lifeState: 'alive', hp: 100, hpMax: 100, statuses: [],
});

const expectPhysicalTarget = (attacker: UnitToken, targets: UnitToken[], expected: UnitToken, attackerSlot: number, targetSlot: number): void => {
  const selected = pickTarget({ tokens: [attacker, ...targets] }, attacker);
  expect(selected?.iid).toBe(expected.iid);
  expect([attacker.cx, attacker.cy, slotIndex(attacker.side, attacker.cx, attacker.cy)]).toEqual([attacker.cx, attacker.cy, attackerSlot]);
  expect([selected?.cx, selected?.cy, selected && slotIndex(selected.side, selected.cx, selected.cy)]).toEqual([expected.cx, expected.cy, targetSlot]);
};

describe('raw production-board geometry uses canonical combat slots', () => {
  it('maps both physical rows and targets the facing row in both directions', () => {
    const allyBottom = raw('ally-bottom', 'ally', 2, 2, 1);       // canonical 3
    const enemyBottom = raw('enemy-bottom', 'enemy', 4, 2, 2);   // canonical 1
    const enemyMiddle = raw('enemy-middle', 'enemy', 4, 1, 3);   // canonical 2
    const enemyLeader = raw('leaderB', 'enemy', 6, 1, 4);        // canonical 8
    expectPhysicalTarget(allyBottom, [enemyLeader, enemyMiddle, enemyBottom], enemyBottom, 3, 1);

    const allyMiddle = raw('ally-middle', 'ally', 2, 1, 5);      // canonical 2
    expectPhysicalTarget(enemyBottom, [allyMiddle, allyBottom], allyBottom, 1, 3);

    const allyTop = raw('ally-top', 'ally', 2, 0, 6);            // canonical 1
    const enemyTop = raw('enemy-top', 'enemy', 4, 0, 7);         // canonical 3
    expectPhysicalTarget(allyTop, [enemyMiddle, enemyTop], enemyTop, 1, 3);
    expectPhysicalTarget(enemyTop, [allyMiddle, allyTop], allyTop, 3, 1);
    expectPhysicalTarget(allyMiddle, [enemyTop, enemyMiddle], enemyMiddle, 2, 2);
  });

  it('preserves taunt, assassin, dead exclusion, and leader-last priority', () => {
    const attacker = raw('fighter', 'ally', 2, 2, 10);
    const first = raw('first', 'enemy', 4, 2, 11);
    const taunt = raw('taunt', 'enemy', 5, 2, 12); taunt.statuses = [{ id: 'taunt' } as any];
    expectPhysicalTarget(attacker, [first, taunt], taunt, 3, 4);

    const assassin = raw('mo_da', 'ally', 2, 2, 13);
    const back = raw('back', 'enemy', 6, 2, 14);
    expectPhysicalTarget(assassin, [first, back], back, 3, 7);

    first.hp = 0; first.alive = false; first.lifeState = 'dead-confirmed';
    const next = raw('next', 'enemy', 5, 2, 15);
    const leader = raw('leaderB', 'enemy', 6, 1, 16);
    expectPhysicalTarget(attacker, [leader, first, next], next, 3, 4);
    next.hp = 0; next.alive = false; next.lifeState = 'dead-confirmed';
    expectPhysicalTarget(attacker, [leader, first, next], leader, 3, 8);
  });
});
