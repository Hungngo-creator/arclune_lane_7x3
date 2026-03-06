import {
  COST_MAX,
  COST_MIN,
  evaluateSummonCost,
  simulateSummonCostComparison,
  deriveBudgetFromRankRole,
  evaluateCostBudget,
  estimateCostFromTags,
  mergeBudgetInputs,
} from '../src/data/cost-budget.ts';
import { UNITS, resolveUnitCost } from '../src/units.ts';

describe('cost budget evaluator', () => {
  test('giữ trần cost trong [7..22]', () => {
    const low = evaluateCostBudget({});
    const high = evaluateCostBudget({
      tagComplexity: 6,
      battlefieldInfluence: 6,
      economyPressure: 4,
      scalingCeiling: 4,
      tacticalFlexibility: 4,
      hasDivineNature: true,
      divineSelfSustainBonus: 2,
    });

    expect(low.cost).toBeGreaterThanOrEqual(COST_MIN);
    expect(low.cost).toBeLessThanOrEqual(COST_MAX);
    expect(high.cost).toBe(COST_MAX);
  });

  test('thần tính là dao 2 lưỡi: cộng ổn định và trừ hỗ trợ', () => {
    const withoutDivine = evaluateCostBudget({
      tagComplexity: 4,
      battlefieldInfluence: 4,
      tacticalFlexibility: 3,
    });
    const withDivine = evaluateCostBudget({
      tagComplexity: 4,
      battlefieldInfluence: 4,
      tacticalFlexibility: 3,
      hasDivineNature: true,
    });

    expect(withDivine.breakdown.divineBonus).toBe(3);
    expect(withDivine.breakdown.divinePenalty).toBe(3);
    expect(withDivine.netScore).toBeLessThan(withoutDivine.netScore);
    expect(withoutDivine.netScore - withDivine.netScore).toBeCloseTo(0.45, 2);
  });

  test('phân tích tag hỗ trợ suy ra cost cho kit phức tạp', () => {
    const result = estimateCostFromTags([
      'Pháp Tắc',
      'Quy Tắc',
      'AOE',
      'Buff/Debuff',
      'Vĩnh viễn',
      'Friendly Fire',
      'Triệu hồi',
    ]);

    expect(result.cost).toBeGreaterThanOrEqual(16);
    expect(result.netScore).toBeGreaterThanOrEqual(4);
  });
});

describe('budget derivation defaults', () => {
  test('rank/role cao cho cost cao hơn rank/role thấp', () => {
    const nWarrior = evaluateCostBudget(deriveBudgetFromRankRole('N', 'Warrior'));
    const urMage = evaluateCostBudget(deriveBudgetFromRankRole('UR', 'Mage'));

    expect(urMage.cost).toBeGreaterThan(nWarrior.cost);
  });

  test('mergeBudgetInputs cộng dồn metric hợp lệ', () => {
    const merged = mergeBudgetInputs(
      { tagComplexity: 2, battlefieldInfluence: 2 },
      { tagComplexity: 1, setupPenalty: 1 },
      { hasDivineNature: true },
    );

    expect(merged.tagComplexity).toBe(3);
    expect(merged.battlefieldInfluence).toBe(2);
    expect(merged.setupPenalty).toBe(1);
    expect(merged.hasDivineNature).toBe(true);
  });

  test('khung rank theo tiêu chí mới nằm trong dải lý tưởng', () => {
    const ranges = {
      N: [7, 9],
      R: [9, 10],
      SR: [11, 13],
      SSR: [14, 17],
      UR: [18, 20],
      PRIME: [21, 22],
    } as const;
    const roles = ['Warrior', 'Support', 'Summoner', 'Mage', 'Assassin', 'Tanker', 'Ranger'] as const;

    for (const [rank, [minCost, maxCost]] of Object.entries(ranges)) {
      for (const role of roles) {
        const cost = evaluateCostBudget(deriveBudgetFromRankRole(rank, role)).cost;
        expect(cost).toBeGreaterThanOrEqual(minCost);
        expect(cost).toBeLessThanOrEqual(maxCost);
      }
    }
  });
});

describe('resolveUnitCost and roster auto-cost', () => {
  test('tự chấm cost dù unit không khai báo cost trực tiếp', () => {
    const resolved = resolveUnitCost({
      id: 'linhgac',
      name: 'Lính Gác',
      rank: 'N',
      role: 'Warrior',
    });

    expect(resolved).toBeGreaterThanOrEqual(COST_MIN);
    expect(resolved).toBeLessThanOrEqual(COST_MAX);
  });

  test('21 unit hiện có đều được auto-cost hợp lệ', () => {
    expect(UNITS).toHaveLength(21);
    for (const unit of UNITS) {
      expect(unit.cost).toBeGreaterThanOrEqual(COST_MIN);
      expect(unit.cost).toBeLessThanOrEqual(COST_MAX);
    }
  });

  test('Doãn Minh (SR Support) không vượt xa khung SR mặc định', () => {
    const doanMinh = UNITS.find((unit) => unit.id === 'doanminh');
    expect(doanMinh).toBeTruthy();
    expect(doanMinh?.cost ?? COST_MAX).toBeLessThanOrEqual(16);
  });

});

describe('summon cost neo logic', () => {
  test('SR Doãn Minh và Prime Thần Tính tạo chênh lệch cost hợp lý', () => {
    const comparison = simulateSummonCostComparison();

    expect(comparison.doanMinh.finalCost).toBe(11);
    expect(comparison.primeDivine.finalCost).toBe(20);
    expect(comparison.costDelta).toBe(9);
    expect(comparison.multiplierDelta).toBeCloseTo(0.6, 2);
  });

  test('SR chỉ vượt 15 khi có đủ lõi Quy Tắc + Pháp Tắc', () => {
    const result = evaluateSummonCost({
      rank: 'SR',
      hasRuleTag: true,
      hasLawTag: true,
      hasAbsoluteTag: true,
      supportsAllyResource: true,
    });

    expect(result.preClampCost).toBe(15.875);
    expect(result.finalCost).toBe(16);
    expect(result.needsSrRecheck).toBe(false);
  });
});