/**
 * @jest-environment jsdom
 */

import {
  prepareGachaReveal,
  setPowerMode,
} from '../../src/ui/rarity/rarity';
import * as rarityModule from '../../src/ui/rarity/rarity';

describe('prepareGachaReveal', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    setPowerMode('normal');
    jest.restoreAllMocks();
  });

  afterEach(() => {
    const overlays = Array.from(document.querySelectorAll('.rarity-aura'));
    overlays.forEach(node => {
      const parent = node.parentElement;
      if (parent instanceof HTMLElement){
        rarityModule.unmountRarity(parent);
      }
    });
    document.body.innerHTML = '';
    setPowerMode('normal');
    jest.restoreAllMocks();
  });

  test('gắn overlay gacha với badge và rounded theo tùy chọn', () => {
    const hostA = document.createElement('div');
    const hostB = document.createElement('div');
    hostA.dataset.rarity = 'SR';
    hostB.dataset.rarity = 'UR';
    document.body.append(hostA, hostB);

    const controller = prepareGachaReveal([hostA, hostB], { rounded: true });

    const overlayA = hostA.querySelector('.rarity-aura');
    const overlayB = hostB.querySelector('.rarity-aura');
    expect(overlayA).not.toBeNull();
    expect(overlayB).not.toBeNull();
    expect(overlayA?.dataset.variant).toBe('gacha');
    expect(overlayB?.dataset.variant).toBe('gacha');
    expect(overlayA?.classList.contains('has-badge')).toBe(true);
    expect(overlayB?.classList.contains('has-badge')).toBe(true);
    expect(overlayA?.classList.contains('is-rounded')).toBe(true);
    expect(overlayB?.classList.contains('is-rounded')).toBe(true);
    expect(overlayA?.querySelector('.badge')?.textContent).toBe('SR');
    expect(overlayB?.querySelector('.badge')?.textContent).toBe('UR');

    controller.dispose();
    expect(hostA.querySelector('.rarity-aura')).toBeNull();
    expect(hostB.querySelector('.rarity-aura')).toBeNull();
  });

  test('reveal gọi playGachaReveal và dispose dọn dẹp', () => {
    const hostA = document.createElement('div');
    const hostB = document.createElement('div');
    hostA.dataset.rarity = 'SSR';
    hostB.dataset.rarity = 'UR';
    document.body.append(hostA, hostB);

    const playSpy = jest.spyOn(rarityModule, 'playGachaReveal');
    const updateSpy = jest.spyOn(rarityModule, 'updateRarity');
    const unmountSpy = jest.spyOn(rarityModule, 'unmountRarity');

    const controller = prepareGachaReveal([hostA, hostB], { label: true, rounded: true, staggerMs: 200 });

    controller.update(hostB, 'PRIME');
    expect(updateSpy).toHaveBeenCalledWith(hostB, 'PRIME');
    expect(hostB.dataset.rarity).toBe('PRIME');

    controller.reveal();
    expect(playSpy).toHaveBeenCalledTimes(1);
    const cardsArg = playSpy.mock.calls[0][0];
    expect(cardsArg).toHaveLength(2);
    expect(cardsArg[0].el).toBe(hostA);
    expect(cardsArg[1]).toEqual({ el: hostB, rarity: 'PRIME' });

    controller.dispose();
    expect(unmountSpy).toHaveBeenCalledTimes(2);
    expect(hostA.querySelector('.rarity-aura')).toBeNull();
    expect(hostB.querySelector('.rarity-aura')).toBeNull();

    controller.reveal();
    expect(playSpy).toHaveBeenCalledTimes(1);
  });
});
