/**
 * @jest-environment jsdom
 */

import {
  mountRarityAura,
  updateRarity,
  unmountRarity,
  setPowerMode,
  playGachaReveal,
} from '../../src/ui/rarity/rarity';
import type { PowerMode, Rarity } from '../../src/ui/rarity/rarity';

const flushMutations = async (): Promise<void> => new Promise(resolve => {
  if (typeof queueMicrotask === 'function'){
    queueMicrotask(resolve);
  } else {
    Promise.resolve().then(resolve);
  }
});

describe('rarity aura', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    setPowerMode('normal');
  });

  afterEach(() => {
    const overlays = Array.from(document.querySelectorAll('.rarity-aura'));
    overlays.forEach(node => {
      const parent = node.parentElement;
      if (parent instanceof HTMLElement){
        unmountRarity(parent);
      }
    });
    document.body.innerHTML = '';
    setPowerMode('normal');
    jest.useRealTimers();
  });

  test('mountRarityAura tạo overlay, badge và áp dụng token', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    mountRarityAura(host, 'sr' as unknown as Rarity, 'collection');

    const overlay = host.querySelector('.rarity-aura') as HTMLElement | null;
    expect(overlay).not.toBeNull();
    expect(overlay?.dataset.variant).toBe('collection');
    expect(overlay?.classList.contains('rarity-SR')).toBe(true);
    expect(overlay?.style.getPropertyValue('--rarity-color')).toBe('#00E5FF');

    const badge = overlay?.querySelector('.badge');
    expect(badge?.textContent).toBe('SR');
    expect(host.style.position).toBe('relative');
  });

  test('updateRarity cập nhật lớp, biến và badge hiện hữu', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    mountRarityAura(host, 'SR', 'collection');
    updateRarity(host, 'UR');

    const overlay = host.querySelector('.rarity-aura') as HTMLElement;
    expect(overlay.classList.contains('rarity-UR')).toBe(true);
    expect(overlay.classList.contains('rarity-SR')).toBe(false);
    expect(overlay.style.getPropertyValue('--rarity-spark-count')).toBe('0');

    const badge = overlay.querySelector('.badge');
    expect(badge?.textContent).toBe('UR');
  });

test('deck variant không bật spark và sweep', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    mountRarityAura(host, 'UR', 'deck');

    const overlay = host.querySelector('.rarity-aura') as HTMLElement;
    expect(overlay.style.getPropertyValue('--rarity-spark-count')).toBe('0');
    expect(overlay.style.getPropertyValue('--rarity-sweep-opacity')).toBe('0');

    setPowerMode('low');
    expect(overlay.style.getPropertyValue('--rarity-spark-count')).toBe('0');
    expect(overlay.style.getPropertyValue('--rarity-sweep-opacity')).toBe('0');
  });

  test('gacha variant giữ spark khi bình thường và tắt ở low-power', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    mountRarityAura(host, 'UR', 'gacha');

    const overlay = host.querySelector('.rarity-aura') as HTMLElement;
    expect(overlay.style.getPropertyValue('--rarity-spark-count')).toBe('12');
    expect(overlay.style.getPropertyValue('--rarity-sweep-opacity')).toBe('0.65');

    setPowerMode('low');
    expect(overlay.style.getPropertyValue('--rarity-spark-count')).toBe('0');
    expect(overlay.style.getPropertyValue('--rarity-sweep-opacity')).toBe('0');

    setPowerMode('normal');
  });

test('biến CSS shimmer cho deck và collection được cấu hình đúng', () => {
    const style = document.head.querySelector<HTMLStyleElement>('#ui-rarity-style');
    expect(style).not.toBeNull();
    const cssText = style?.textContent ?? '';
    expect(cssText).toContain('.rarity-aura[data-variant="deck"] .glow');
    expect(cssText).toContain('--rarity-shimmer-period: 6s');
    expect(cssText).toContain('.rarity-aura[data-variant="collection"] .glow');
    expect(cssText).toContain('--rarity-shimmer-period: 10s');
  });

  test('mount nhiều lần không nhân đôi overlay và tôn trọng rounded/label', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    mountRarityAura(host, 'N', 'deck', { label: false, rounded: true });
    mountRarityAura(host, 'N', 'deck', { label: false, rounded: true });

    const overlays = host.querySelectorAll('.rarity-aura');
    expect(overlays).toHaveLength(1);
    const overlay = overlays[0] as HTMLElement;
    expect(overlay.classList.contains('is-rounded')).toBe(true);
    expect(overlay.querySelector('.badge')).toBeNull();
  });

test('overlay phản ánh lớp tương tác của host', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    mountRarityAura(host, 'UR', 'deck');
    const overlay = host.querySelector('.rarity-aura') as HTMLElement;

    expect(overlay.classList.contains('is-hovered')).toBe(false);
    expect(overlay.classList.contains('is-selected')).toBe(false);

    host.classList.add('is-hovered');
    await flushMutations();
    expect(overlay.classList.contains('is-hovered')).toBe(true);

    host.classList.add('is-selected');
    await flushMutations();
    expect(overlay.classList.contains('is-selected')).toBe(true);

    host.classList.remove('is-hovered');
    await flushMutations();
    expect(overlay.classList.contains('is-hovered')).toBe(false);

    host.classList.remove('is-selected');
    await flushMutations();
    expect(overlay.classList.contains('is-selected')).toBe(false);
  });

  test('unmountRarity tháo overlay và trả lại position ban đầu', () => {
    const host = document.createElement('div');
    host.style.position = 'absolute';
    document.body.appendChild(host);

    mountRarityAura(host, 'SSR', 'collection');
    expect(host.querySelector('.rarity-aura')).not.toBeNull();

    unmountRarity(host);
    expect(host.querySelector('.rarity-aura')).toBeNull();
    expect(host.style.position).toBe('absolute');
  });

  test('setPowerMode áp dụng lớp low-power và vô hiệu spark/sweep', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    mountRarityAura(host, 'UR', 'gacha');
    const overlay = host.querySelector('.rarity-aura') as HTMLElement;
    expect(overlay.classList.contains('has-spark')).toBe(true);
    expect(overlay.classList.contains('has-sweep')).toBe(true);

    setPowerMode('low');

    expect(document.body.classList.contains('low-power')).toBe(true);
    expect(overlay.classList.contains('has-spark')).toBe(false);
    expect(overlay.classList.contains('has-sweep')).toBe(false);
    expect(overlay.style.getPropertyValue('--rarity-glow-active')).toBe('0.875');
  });

  test('setPowerMode bỏ qua mode trùng lặp và chuẩn hóa giá trị', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    mountRarityAura(host, 'UR', 'gacha');
    const overlay = host.querySelector('.rarity-aura') as HTMLElement;

    setPowerMode('low');
    expect(document.body.classList.contains('low-power')).toBe(true);
    expect(overlay.style.getPropertyValue('--rarity-spark-count')).toBe('0');

    setPowerMode('low');
    expect(document.body.classList.contains('low-power')).toBe(true);
    expect(overlay.style.getPropertyValue('--rarity-spark-count')).toBe('0');

    setPowerMode('invalid' as PowerMode);
    expect(document.body.classList.contains('low-power')).toBe(false);
    expect(overlay.style.getPropertyValue('--rarity-spark-count')).toBe('12');
  });

  test('collection badge giữ tương phản cao với nền', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    mountRarityAura(host, 'SSR', 'collection', { label: true });

    const badge = host.querySelector<HTMLElement>('.rarity-aura .badge');
    expect(badge).not.toBeNull();

    const computed = window.getComputedStyle(badge!);
    expect(computed.backgroundColor).toBe('rgba(0, 0, 0, 0.35)');
    expect(computed.color).toBe('rgb(255, 255, 255)');
  });

  test('setPowerMode khôi phục spark và sweep khi thoát chế độ tiết kiệm', () => {
    jest.useFakeTimers();

    const host = document.createElement('div');
    document.body.appendChild(host);

    mountRarityAura(host, 'UR', 'gacha');
    const overlay = host.querySelector('.rarity-aura') as HTMLElement;

    setPowerMode('low');
    expect(overlay.classList.contains('has-spark')).toBe(false);
    expect(overlay.classList.contains('has-sweep')).toBe(false);
    expect(document.body.classList.contains('low-power')).toBe(true);

    setPowerMode('normal');
    expect(document.body.classList.contains('low-power')).toBe(false);
    expect(overlay.classList.contains('has-spark')).toBe(true);
    expect(overlay.classList.contains('has-sweep')).toBe(true);

    const onDone = jest.fn();
    playGachaReveal([{ el: host, rarity: 'UR' }], { onDone });

    jest.advanceTimersByTime(16);
    expect(overlay.classList.contains('is-pre')).toBe(true);

    jest.advanceTimersByTime(300);
    expect(overlay.classList.contains('is-bloom')).toBe(true);

    jest.advanceTimersByTime(200);
    expect(document.querySelectorAll('.spark').length).toBeGreaterThan(0);

    jest.runOnlyPendingTimers();
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  test('playGachaReveal chạy timeline và gọi onDone theo thứ tự', () => {
    jest.useFakeTimers();

    const cardA = document.createElement('div');
    const cardB = document.createElement('div');
    document.body.append(cardA, cardB);

    mountRarityAura(cardA, 'SSR', 'gacha', { label: true });
    mountRarityAura(cardB, 'PRIME', 'gacha', { label: true });

    const overlayA = cardA.querySelector('.rarity-aura') as HTMLElement;
    const overlayB = cardB.querySelector('.rarity-aura') as HTMLElement;

    const onDone = jest.fn();
    playGachaReveal([
      { el: cardA, rarity: 'SSR' },
      { el: cardB, rarity: 'PRIME' },
    ], { staggerMs: 120, onDone });

    expect(overlayA.classList.contains('is-pre')).toBe(true);
    expect(overlayB.classList.contains('is-pre')).toBe(true);

    jest.advanceTimersByTime(300);
    expect(overlayA.classList.contains('is-bloom')).toBe(true);
    expect(overlayB.classList.contains('is-pre')).toBe(true);

    jest.advanceTimersByTime(120);
    expect(overlayB.classList.contains('is-bloom')).toBe(true);

    jest.advanceTimersByTime(480);
    expect(overlayA.classList.contains('is-reveal')).toBe(true);

    jest.advanceTimersByTime(120);
    expect(overlayB.classList.contains('is-reveal')).toBe(true);

    jest.advanceTimersByTime(400);
    expect(onDone).toHaveBeenCalledTimes(1);

    const sparkCount = document.querySelectorAll('.spark').length;
    expect(sparkCount).toBeLessThanOrEqual(16);
  });

  test('playGachaReveal bỏ spark khi low-power', () => {
    jest.useFakeTimers();

    const card = document.createElement('div');
    document.body.append(card);
    mountRarityAura(card, 'SSR', 'gacha');
    const overlay = card.querySelector('.rarity-aura') as HTMLElement;

    setPowerMode('low');
    playGachaReveal([{ el: card, rarity: 'SSR' }]);

    jest.advanceTimersByTime(600);
    expect(overlay.classList.contains('is-bloom')).toBe(true);
    expect(document.querySelectorAll('.spark').length).toBe(0);
  });
  
  test('playGachaReveal tôn trọng timeline bloom/reveal/hoàn tất', () => {
    jest.useFakeTimers();

    const card = document.createElement('div');
    document.body.appendChild(card);
    mountRarityAura(card, 'SSR', 'gacha');
    const overlay = card.querySelector('.rarity-aura') as HTMLElement;

    const onDone = jest.fn();
    playGachaReveal([{ el: card, rarity: 'SSR' }], { onDone });

    expect(overlay.classList.contains('is-pre')).toBe(false);

    jest.advanceTimersByTime(16);
    expect(overlay.classList.contains('is-pre')).toBe(true);

    jest.advanceTimersByTime(299);
    expect(overlay.classList.contains('is-bloom')).toBe(false);

    jest.advanceTimersByTime(1);
    expect(overlay.classList.contains('is-bloom')).toBe(true);

    jest.advanceTimersByTime(599);
    expect(overlay.classList.contains('is-reveal')).toBe(false);

    jest.advanceTimersByTime(1);
    expect(overlay.classList.contains('is-reveal')).toBe(true);

    jest.advanceTimersByTime(399);
    expect(onDone).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});