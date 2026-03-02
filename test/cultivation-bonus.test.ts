import * as assert from 'node:assert/strict';

import {
  applyCultivationBonus,
  canBreakthrough,
  getCultivationCost,
  upgradeCultivation,
} from '../src/cultivation.ts';
import { spendAetherWithPriority } from '../src/utils/currency.ts';

describe('applyCultivationBonus', () => {
  test('Khai Nguyên tăng tuyến tính và chặn tối đa ở tiểu cấp 9', () => {
    const boosted = applyCultivationBonus({
      id: 'linhgac',
      hpMax: 1000,
      hp: 1000,
      atk: 200,
      wil: 150,
      arm: 90,
      res: 80,
      aeMax: 300,
      aeRegen: 20,
      realm: 1,
      subRealm: 9,
      hasCultivationData: true,
    });
    
    assert.strictEqual(boosted.hpMax, 1180);
    assert.strictEqual(boosted.atk, 227);
    assert.strictEqual(boosted.wil, 170.25);
    assert.strictEqual(boosted.arm, 98.1);
    assert.strictEqual(boosted.res, 87.2);
    assert.strictEqual(boosted.aeMax, 321.6);
    assert.strictEqual(boosted.aeRegen, 20.54);
  });

  test('Trúc Cơ tăng tuyến tính và chặn tối đa ở tiểu cấp 9', () => {
    const boosted = applyCultivationBonus({
      id: 'linhgac',
      hpMax: 1000,
      hp: 1000,
      atk: 200,
      wil: 150,
      arm: 90,
      res: 80,
      aeMax: 300,
      aeRegen: 20,
      realm: 2,
      subRealm: 12,
      hasCultivationData: true,
    });

    assert.strictEqual(boosted.hpMax, 1225);
    assert.strictEqual(boosted.atk, 232.4);
    assert.strictEqual(boosted.wil, 174.3);
    assert.strictEqual(boosted.arm, 99.72);
    assert.strictEqual(boosted.res, 88.64);
    assert.strictEqual(boosted.aeMax, 324.3);
    assert.strictEqual(boosted.aeRegen, 20.63);
  });

  test('leader hệ thống không nhận bonus nếu thiếu dữ liệu tu vi', () => {
    const unchanged = applyCultivationBonus({
      id: 'leaderA',
      hpMax: 1200,
      hp: 1200,
      atk: 160,
      wil: 180,
      arm: 120,
      res: 120,
      aeMax: 200,
      aeRegen: 16,
      realm: 2,
      subRealm: 3,
      hasCultivationData: false,
    });

    assert.strictEqual(unchanged.hpMax, 1200);
    assert.strictEqual(unchanged.atk, 160);
    assert.strictEqual(unchanged.wil, 180);
    assert.strictEqual(unchanged.aeMax, 200);
    assert.strictEqual(unchanged.aeRegen, 16);
  });
});

describe('cultivation economy helpers', () => {
  test('trả về chi phí tiểu cấp và chi phí đột phá', () => {
    const subRealmCost = getCultivationCost(1, 0);
    const breakthroughCost = getCultivationCost(1, 9);

    assert.deepStrictEqual(subRealmCost, {
      realm: 1,
      currentSubRealm: 0,
      nextRealm: 1,
      nextSubRealm: 1,
      isBreakthrough: false,
      aetherCost: 200,
      specialSubRealmCount: 9,
    });

    assert.deepStrictEqual(breakthroughCost, {
      realm: 1,
      currentSubRealm: 9,
      nextRealm: 2,
      nextSubRealm: 1,
      isBreakthrough: true,
      aetherCost: 2200,
      specialSubRealmCount: 9,
    });
  });

  test('canBreakthrough phản ánh đúng trạng thái', () => {
    assert.deepStrictEqual(canBreakthrough(1, 8), {
      canBreakthrough: false,
      nextRealm: null,
      reason: 'need_more_subrealm',
    });

    assert.deepStrictEqual(canBreakthrough(1, 9), {
      canBreakthrough: true,
      nextRealm: 2,
      reason: 'ready',
    });
  });

  test('trừ tiền theo thứ tự nhỏ -> lớn và có trả lẻ', () => {
    const spent = spendAetherWithPriority({ VNT: 50, HNT: 1, TNT: 1, ThNT: 0 }, 180);
    assert.strictEqual(spent.ok, true);
    assert.strictEqual(spent.spentAether, 180);
    assert.strictEqual(spent.wallet.VNT, 70);
    assert.strictEqual(spent.wallet.HNT, 99);
    assert.strictEqual(spent.wallet.TNT, 0);
    assert.strictEqual(spent.deducted.VNT, 50);
    assert.strictEqual(spent.deducted.HNT, 1);
    assert.strictEqual(spent.deducted.TNT, 1);
  });

  test('nâng tu vi thành công sẽ lưu realm/subRealm mới vào player state', () => {
    const result = upgradeCultivation(
      {
        currencies: { VNT: 120, HNT: 2, TNT: 0, ThNT: 0 },
        cultivation: { realm: 1, subRealm: 0 },
      },
      1,
      0,
    );

    assert.strictEqual(result.ok, true);
    assert.strictEqual(result.newRealm, 1);
    assert.strictEqual(result.newSubRealm, 1);
    assert.strictEqual(result.isBreakthrough, false);
    assert.strictEqual(result.playerState.cultivation?.realm, 1);
    assert.strictEqual(result.playerState.cultivation?.subRealm, 1);
    assert.strictEqual(result.spent.spentAether, 200);
  });
});