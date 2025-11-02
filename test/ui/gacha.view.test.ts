/**
 * @jest-environment jsdom
 */

import { renderGachaView } from '../../src/screens/gacha/view.ts';
import * as rarityModule from '../../src/ui/rarity/rarity.ts';

describe('renderGachaView', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  afterEach(() => {
    const overlays = Array.from(document.querySelectorAll<HTMLElement>('.rarity-aura'));
    overlays.forEach(node => {
      const parent = node.parentElement;
      if (parent instanceof HTMLElement){
        rarityModule.unmountRarity(parent);
      }
    });
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  test('kết xuất danh sách thẻ và bật hiệu ứng reveal', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const onRevealDone = jest.fn();
    const playSpy = jest.spyOn(rarityModule, 'playGachaReveal').mockImplementation((cards, options) => {
      options?.onDone?.();
    });

    const view = renderGachaView({
      root,
      cards: [
        { id: 'alpha', name: 'Alpha', rarity: 'SSR', description: 'Pháp sư tinh anh.' },
        { id: 'beta', name: 'Beta', rarity: 'UR' },
      ],
      onRevealDone,
    });

    const cards = root.querySelectorAll<HTMLElement>('.gacha-card');
    expect(cards).toHaveLength(2);
    cards.forEach(card => {
      expect(card.dataset.cardId).toBeTruthy();
      expect(card.querySelector('.rarity-aura')).not.toBeNull();
    });

    view.reveal();

    expect(playSpy).toHaveBeenCalledTimes(1);
    const [cardsArg, optionsArg] = playSpy.mock.calls[0];
    expect(cardsArg).toHaveLength(2);
    expect(cardsArg[0].el).toBe(cards[0]);
    expect(cardsArg[0].rarity).toBe('SSR');
    expect(cardsArg[1].rarity).toBe('UR');
    expect(optionsArg?.onDone).toEqual(expect.any(Function));
    expect(onRevealDone).toHaveBeenCalledTimes(1);

    view.destroy();
    expect(root.querySelector('.gacha-card')).toBeNull();
    expect(root.querySelector('.rarity-aura')).toBeNull();
  });

  test('updateCards thay thế danh sách và tái sử dụng callback reveal', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const view = renderGachaView({
      root,
      cards: [{ id: 'gamma', name: 'Gamma', rarity: 'SR' }],
    });

    let doneCount = 0;
    view.setRevealDoneCallback(() => {
      doneCount += 1;
    });

    view.updateCards([
      { id: 'prime', name: 'Prime Hero', rarity: 'PRIME', description: 'Thần thoại.' },
    ]);

    const cards = root.querySelectorAll<HTMLElement>('.gacha-card');
    expect(cards).toHaveLength(1);
    expect(cards[0].dataset.rarity).toBe('PRIME');

    const playSpy = jest.spyOn(rarityModule, 'playGachaReveal').mockImplementation((entries, options) => {
      expect(entries).toHaveLength(1);
      options?.onDone?.();
    });

    view.reveal();

    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(doneCount).toBe(1);

    view.destroy();
  });
});
