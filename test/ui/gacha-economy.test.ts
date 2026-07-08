import { convertCurrency, payForRoll } from '../../src/screens/ui-gacha/logic/currency.ts';
import { createWallet, GACHA_CONFIG } from '../../src/screens/ui-gacha/logic/config.ts';
import { getBannerById, rollBanner } from '../../src/screens/ui-gacha/logic/gacha.ts';
import type { BannerStateMap } from '../../src/screens/ui-gacha/logic/types.ts';

describe('Hệ tiền tệ', () => {
  test('100 VNT đổi lên HNT bị thuế tối thiểu nên không đủ 1 HNT', () => {
    const wallet = createWallet({ VNT: 100, HNT: 0, TNT: 0, ThNT: 0, TT: 0 });
    const result = convertCurrency(wallet, 'VNT', 'HNT', 100, { allowTax: true });
    expect(result.ok).toBe(false);
    expect(result.received).toBe(0);
    expect(result.tax).toBe(1);
    expect(result.wallet.HNT).toBe(0);
    expect(result.wallet.VNT).toBe(100);
  });

  test('101 VNT đổi lên HNT có thuế tối thiểu 1', () => {
    const wallet = createWallet({ VNT: 101 });
    const result = convertCurrency(wallet, 'VNT', 'HNT', 101, { allowTax: true });
    expect(result.ok).toBe(true);
    expect(result.received).toBeGreaterThanOrEqual(1);
    expect(result.tax).toBeGreaterThanOrEqual(1);
    expect(result.tax).toBeLessThanOrEqual(11);
  });

test('Quy đổi 1 TT xuống TNT theo cấp số nhân 100', () => {
    const wallet = createWallet({ VNT: 0, HNT: 0, TNT: 0, ThNT: 0, TT: 1 });
    const result = convertCurrency(wallet, 'TT', 'TNT', 1, { allowTax: true });
    expect(result.ok).toBe(true);
    expect(result.tax).toBe(0);
    expect(result.received).toBe(10_000);
    expect(result.wallet.TT).toBe(0);
    expect(result.wallet.TNT).toBe(10_000);
  });

  test('500 HNT đổi lên TNT có thuế không vượt 10%', () => {
    const wallet = createWallet({ HNT: 500 });
    const result = convertCurrency(wallet, 'HNT', 'TNT', 500, { allowTax: true });
    expect(result.ok).toBe(true);
    expect(result.tax).toBeGreaterThanOrEqual(1);
    expect(result.tax).toBeLessThanOrEqual(50);
  });

  test('TT không tự động đổi xuống khi trả phí banner Permanent', () => {
    const wallet = createWallet({ TT: 1, VNT: 0, HNT: 0, TNT: 0, ThNT: 0 });
    const permanent = GACHA_CONFIG.banners.find((banner) => banner.type === 'Permanent');
    expect(permanent).toBeTruthy();
    const payment = payForRoll(wallet, permanent!.cost.unit, permanent!.cost.x1);
    expect(payment.ok).toBe(false);
    expect(payment.wallet.TT).toBe(1);
    expect(payment.detail).toBeNull();
  });
  
 test('payForRoll 10x Limited UR chỉ dùng TT khi bật allowTT rõ ràng', () => {
    const wallet = createWallet({ VNT: 0, HNT: 0, TNT: 0, ThNT: 0, TT: 1 });
    const banner = GACHA_CONFIG.banners.find((item) => item.id === 'limited-ur');
    expect(banner).toBeTruthy();
    const costUnit = banner!.cost.unit;
    const costAmount = banner!.cost.x10;
    const payment = payForRoll(wallet, costUnit, costAmount, { allowTT: true });
    expect(payment.ok).toBe(true);
    expect(payment.wallet.TT).toBe(0);
    expect(payment.wallet.TNT).toBe(10_000 - costAmount);
    expect(payment.detail?.usedDirect).toBe(0);
    expect(payment.detail?.usedFromHigher).toBe(costAmount);
    expect(payment.detail?.remaining).toBe(10_000 - costAmount);
    const conversions = payment.detail?.conversions ?? [];
    expect(conversions.length).toBeGreaterThanOrEqual(2);
    expect(conversions[0]).toEqual(expect.objectContaining({ from: 'TT', to: 'ThNT', units: 1, amount: 100 }));
    expect(conversions[1]).toEqual(expect.objectContaining({ from: 'ThNT', to: 'TNT', units: 100, amount: 10_000 }));
  });

  test('payForRoll 10x Limited UR không tự dùng TT theo mặc định', () => {
    const wallet = createWallet({ VNT: 0, HNT: 0, TNT: 0, ThNT: 0, TT: 1 });
    const banner = GACHA_CONFIG.banners.find((item) => item.id === 'limited-ur');
    expect(banner).toBeTruthy();
    const payment = payForRoll(wallet, banner!.cost.unit, banner!.cost.x10);
    expect(payment.ok).toBe(false);
    expect(payment.wallet.TT).toBe(1);
    expect(payment.detail).toBeNull();
  });
});

describe('Pity & bảo hiểm', () => {
  function makeStateMap(): BannerStateMap {
    return new Map();
  }

  const stuckRng = () => 0.9999;

  test('Hard pity SSR ở roll 80 banner Permanent', () => {
    const banner = getBannerById('permanent');
    expect(banner).not.toBeNull();
    const states = makeStateMap();
    for (let i = 0; i < 79; i += 1) {
      rollBanner(banner!, states, { rng: stuckRng, featuredRng: stuckRng });
    }
    const result = rollBanner(banner!, states, { rng: stuckRng, featuredRng: stuckRng });
    expect(result.outcome.rarity).toBe('SSR');
    expect(result.outcome.pityTriggered).toBe('hard');
  });

  test('Hard pity UR featured ở roll 90 banner Limited UR', () => {
    const banner = getBannerById('limited-ur');
    expect(banner).not.toBeNull();
    const states = makeStateMap();
    for (let i = 0; i < 89; i += 1) {
      rollBanner(banner!, states, { rng: stuckRng, featuredRng: stuckRng });
    }
    const result = rollBanner(banner!, states, { rng: stuckRng, featuredRng: () => 0 });
    expect(result.outcome.rarity).toBe('UR');
    expect(result.outcome.pityTriggered).toBe('hard');
    expect(result.outcome.featured).toBe(true);
  });

  test('Hard pity Prime featured ở roll 120 banner Limited Prime', () => {
    const banner = getBannerById('limited-prime');
    expect(banner).not.toBeNull();
    const states = makeStateMap();
    for (let i = 0; i < 119; i += 1) {
      rollBanner(banner!, states, { rng: stuckRng, featuredRng: stuckRng });
    }
    const result = rollBanner(banner!, states, { rng: stuckRng, featuredRng: () => 0 });
    expect(result.outcome.rarity).toBe('Prime');
    expect(result.outcome.pityTriggered).toBe('hard');
    expect(result.outcome.featured).toBe(true);
  });
});