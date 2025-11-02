/**
 * @jest-environment jsdom
 */

import * as artModule from '../../src/art.ts';
import { renderMainMenuView } from '../../src/screens/main-menu/view/index.ts';
import { renderLineupScreen } from '../../src/screens/lineup/index.ts';
import { renderCollectionScreen } from '../../src/screens/collection/index.ts';
import { resolveCurrencyBalance } from '../../src/screens/collection/helpers.ts';
import type { MainMenuState, MenuCardMetadata, MenuSection } from '../../src/screens/main-menu/types.ts';
import type { RosterEntryLite, LineupDefinition } from '@shared-types/lineup';
import type { LineupCurrencyConfig, LineupCurrencies } from '@shared-types/currency';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('renderMainMenuView', () => {
  it('khởi tạo giao diện menu chính và gắn callback Coming Soon', () => {
    const root = document.createElement('div');
    root.classList.add('app--pve');
    document.body.appendChild(root);

    const sections: MenuSection[] = [
      {
        id: 'primary',
        title: 'Tác chiến',
        entries: [
         { id: 'pve-entry', type: 'mode', cardId: 'pve-mode', childModeIds: [] },
        { id: 'pvp-entry', type: 'mode', cardId: 'pvp-mode', childModeIds: [] },
        ],
      },
    ];

    const metadata: MenuCardMetadata[] = [
      {
        key: 'pve-mode',
        id: 'pve',
        title: 'PvE',
        description: 'Chinh phục nhiệm vụ chính tuyến.',
        icon: '⚔️',
        tags: ['PvE'],
      },
      {
        key: 'pvp-mode',
        id: 'pvp',
        title: 'PvP',
        description: 'Đấu trường cạnh tranh.',
        icon: '⚔️',
        tags: ['PvP', 'Coming soon'],
        status: 'coming-soon',
      },
    ];

    const onShowComingSoon = jest.fn();
    const enterScreen = jest.fn();

    const state: MainMenuState = {
      root,
      sections,
      metadata,
      shell: { enterScreen },
      onShowComingSoon,
    };

    const view = renderMainMenuView(state);

    expect(view).not.toBeNull();
    expect(root.querySelector('.main-menu-v2')).not.toBeNull();
    expect(root.classList.contains('app--main-menu')).toBe(true);
    expect(root.classList.contains('app--pve')).toBe(false);

    const buttons = root.querySelectorAll('.mode-card');
    expect(buttons).toHaveLength(2);

    const comingSoonButton = root.querySelector<HTMLButtonElement>('.mode-card[aria-disabled="true"]');
    expect(comingSoonButton).not.toBeNull();

    comingSoonButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(onShowComingSoon).toHaveBeenCalledTimes(1);
    expect(onShowComingSoon).toHaveBeenCalledWith(expect.objectContaining({ key: 'pvp-mode' }));

    view?.destroy();
    expect(root.classList.contains('app--main-menu')).toBe(false);
    expect(root.classList.contains('app--pve')).toBe(true);
  });
});

describe('renderLineupScreen', () => {
  it('hiển thị bố cục lineup với đủ số ô trên lưới 5x2', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const handle = renderLineupScreen({
      root,
      definition: { label: 'Đội hình thử nghiệm' },
    });

    expect(root.querySelector('.lineup-view')).not.toBeNull();

    const gridTitle = root.querySelector('.lineup-grid__title');
    expect(gridTitle?.textContent).toContain('5x2');

    const gridCells = root.querySelectorAll('.lineup-grid__cells .lineup-cell');
    expect(gridCells).toHaveLength(10);
    expect(benchCells).toHaveLength(5);

    const backButton = root.querySelector<HTMLButtonElement>('.lineup-view__back');
    expect(backButton?.textContent).toContain('Quay lại menu chính');

    handle.destroy();
  });
  
  it('snapshot bố cục mặc định của lưới 5x2', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const handle = renderLineupScreen({
      root,
      definition: { label: 'Đội hình snapshot' },
    });

    const grid = root.querySelector('.lineup-grid__cells');
    expect(grid).not.toBeNull();

    const cells = Array.from(grid?.querySelectorAll<HTMLElement>('.lineup-cell') ?? []).map(cell => ({
      index: cell.dataset.cellIndex ?? null,
      isLocked: cell.classList.contains('is-locked'),
      defaultAction: cell.dataset.cellDefaultAction ?? null,
      primaryAction: cell.dataset.cellAction ?? null,
      altAction: cell.dataset.cellAltAction ?? null,
      avatar: cell.querySelector('.lineup-cell__avatar')?.textContent ?? '',
      ariaLabel: cell.getAttribute('aria-label'),
    }));

    expect(cells).toMatchSnapshot();

    handle.destroy();
  });

  it('khởi tạo lineup với roster và currencies typed', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const roster: RosterEntryLite[] = [
      { id: 'alpha', name: 'Alpha', class: 'Mage', rank: 'SR', tags: ['mage'] },
      { id: 'beta', name: 'Beta', class: 'Warrior', rank: 'R', tags: ['warrior'] },
    ];
    const lineups: LineupDefinition[] = [
      {
        id: 'lineup-1',
        name: 'Đội hình mẫu',
        members: ['alpha', 'beta'],
        passives: [
          { id: 'passive-1', name: 'Chiến thuật', description: 'Tăng sát thương 10%.', autoActive: true },
        ],
      },
    ];
    const currencies: LineupCurrencyConfig = {
      balances: { VNT: 5000 },
      premium: { id: 'premium', balance: 15 },
    };

    const handle = renderLineupScreen({
      root,
      definition: {
        label: 'Đội hình typed',
        params: { roster, lineups, currencies },
      },
      params: {
        playerState: { currencies: { VNT: 4200, premium: { id: 'premium', balance: 20 } } },
      },
    });

    expect(root.querySelector('.lineup-view')).not.toBeNull();
    expect(root.querySelector('.lineup-wallet__balance')?.textContent).toContain('VNT');

    handle.destroy();
  });
});

describe('renderCollectionScreen', () => {
  it('kết xuất bố cục bộ sưu tập và nút thoát hoạt động', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const enterScreen = jest.fn();

    const handle = renderCollectionScreen({
      root,
      shell: { enterScreen },
    });

    expect(root.classList.contains('app--collection')).toBe(true);
    expect(root.querySelector('.collection-view')).not.toBeNull();

    const tabButtons = root.querySelectorAll<HTMLButtonElement>('.collection-tabs__button');
    expect(tabButtons.length).toBeGreaterThanOrEqual(5);

    const exitButton = root.querySelector<HTMLButtonElement>('.collection-tabs__button[data-tab-key="close"]');
    expect(exitButton).not.toBeNull();

    exitButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(enterScreen).toHaveBeenCalledWith('main-menu');

    handle.destroy();
  });

  it('hỗ trợ truyền roster và currencies đã gõ kiểu', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const roster: RosterEntryLite[] = [
      { id: 'gamma', name: 'Gamma', class: 'Support', rank: 'SSR', tags: ['support'], passives: [] },
    ];
    const currencies: LineupCurrencyConfig = {
      balances: { VNT: 12345 },
      essence: { id: 'essence', balance: 12 },
    };

    const handle = renderCollectionScreen({
      root,
      params: {
        roster,
        currencies,
        playerState: { currencies: { VNT: 67890 } },
      },
    });

    expect(root.querySelector('.collection-view')).not.toBeNull();
    const walletItems = root.querySelectorAll('.collection-wallet__item');
    expect(walletItems.length).toBeGreaterThan(0);

    handle.destroy();
  });
  
  it('gắn rarity aura cho avatar roster và giữ nguyên text fallback', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const roster: RosterEntryLite[] = [
      { id: 'omega', name: 'Omega', rank: 'SSR' },
    ];

    const artSpy = jest.spyOn(artModule, 'getUnitArt').mockReturnValue(null);

    const handle = renderCollectionScreen({
      root,
      params: { roster },
    });

    try {
      const avatar = root.querySelector<HTMLElement>('.collection-roster__avatar');
      expect(avatar).not.toBeNull();

      const aura = avatar?.querySelector<HTMLElement>('.rarity-aura');
      expect(aura).not.toBeNull();
      expect(aura?.dataset.variant).toBe('collection');

      const badge = aura?.querySelector<HTMLElement>('.badge');
      expect(badge?.textContent?.trim()).toBe('SSR');

      const fallbackText = avatar?.querySelector('span');
      expect(fallbackText?.textContent).toBe('—');
    } finally {
      handle.destroy();
      artSpy.mockRestore();
    }
  });
});

describe('resolveCurrencyBalance', () => {
  it('ưu tiên currencyId phù hợp trong mảng nhiều loại tiền', () => {
    const currencyArray: LineupCurrencies = [
      7500,
      { id: 'HNT', balance: 42 },
    ];

    expect(resolveCurrencyBalance('VNT', currencyArray, null)).toBe(7500);
    expect(resolveCurrencyBalance('HNT', currencyArray, null)).toBe(42);
  });
});