import * as assert from 'node:assert/strict';

import { applyCultivationBonus } from '../src/cultivation.ts';

describe('applyCultivationBonus', () => {
  test('Đúc Phách tăng tuyến tính và chặn tối đa ở tiểu cấp 7', () => {
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

    assert.strictEqual(boosted.hpMax, 1210);
    assert.strictEqual(boosted.atk, 228);
    assert.strictEqual(boosted.wil, 171);
    assert.strictEqual(boosted.arm, 99.45);
    assert.strictEqual(boosted.res, 88.4);
    assert.strictEqual(boosted.aeMax, 321);
    assert.strictEqual(boosted.aeRegen, 20.7);
  });

  test('Luyện Hồn tăng tuyến tính và chặn tối đa ở tiểu cấp 3', () => {
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
      subRealm: 5,
      hasCultivationData: true,
    });

    assert.strictEqual(boosted.hpMax, 1180);
    assert.strictEqual(boosted.atk, 224);
    assert.strictEqual(boosted.wil, 172.5);
    assert.strictEqual(boosted.arm, 98.1);
    assert.strictEqual(boosted.res, 87.2);
    assert.strictEqual(boosted.aeMax, 318);
    assert.strictEqual(boosted.aeRegen, 20.6);
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
