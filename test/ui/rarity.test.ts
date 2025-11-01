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
import type { Rarity } from '../../src/ui/rarity/rarity';

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
    expect(overlay.style.getPropertyValue('--rarity-spark-count')).toBe('12');

    const badge = overlay.querySelector('.badge');
    expect(badge?.textContent).toBe('UR');
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
});
