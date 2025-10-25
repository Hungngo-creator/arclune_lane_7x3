/**
 * @jest-environment jsdom
 */

import { renderMainMenuView } from '../../src/screens/main-menu/view/index.ts';
import { renderLineupScreen } from '../../src/screens/lineup/index.ts';
import { renderCollectionScreen } from '../../src/screens/collection/index.ts';
import type { MainMenuState, MenuCardMetadata, MenuSection } from '../../src/screens/main-menu/types.ts';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('renderMainMenuView', () => {
  it('khởi tạo giao diện menu chính và gắn callback Coming Soon', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const sections: MenuSection[] = [
      {
        id: 'primary',
        title: 'Tác chiến',
        entries: [
          { id: 'pve-entry', type: 'mode', cardId: 'pve-mode' },
          { id: 'pvp-entry', type: 'mode', cardId: 'pvp-mode' },
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

    const buttons = root.querySelectorAll('.mode-card');
    expect(buttons).toHaveLength(2);

    const comingSoonButton = root.querySelector<HTMLButtonElement>('.mode-card[aria-disabled="true"]');
    expect(comingSoonButton).not.toBeNull();

    comingSoonButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(onShowComingSoon).toHaveBeenCalledTimes(1);
    expect(onShowComingSoon).toHaveBeenCalledWith(expect.objectContaining({ key: 'pvp-mode' }));

    view?.destroy();
  });
});

describe('renderLineupScreen', () => {
  it('hiển thị bố cục lineup với đủ số ô bench mặc định', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const handle = renderLineupScreen({
      root,
      definition: { label: 'Đội hình thử nghiệm' },
    });

    expect(root.querySelector('.lineup-view')).not.toBeNull();

    const benchCells = root.querySelectorAll('.lineup-bench__cell');
    expect(benchCells).toHaveLength(10);

    const backButton = root.querySelector<HTMLButtonElement>('.lineup-view__back');
    expect(backButton?.textContent).toContain('Quay lại menu chính');

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
});
