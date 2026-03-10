//home (termux)/arclune_lane_7x3/src/screens/main-menu/view/index.ts

import type { CleanupFn, CleanupRegistrar, MainMenuState, RenderedMainMenu } from '../types.ts';
import { mountSection } from '../../../ui/dom.ts';
import { ensureStyles, createHeader, createModesSection } from './layout.ts';
import { resetPlayerProfileData } from '../../../utils/player-profile.ts';
import { resetSharedCurrencyWallet } from '../../../utils/currency.ts';

function createSettingsHub(container: HTMLElement, addCleanup: CleanupRegistrar): void {
  const toolbar = document.createElement('div');
  toolbar.className = 'main-menu-v2__toolbar';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'main-menu-settings-btn';
  trigger.textContent = '⚙';
  trigger.setAttribute('aria-label', 'Mở cài đặt');
  toolbar.appendChild(trigger);
  container.appendChild(toolbar);

  const overlay = document.createElement('div');
  overlay.className = 'main-menu-settings-overlay';

  const hub = document.createElement('section');
  hub.className = 'main-menu-settings-hub';
  overlay.appendChild(hub);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'main-menu-settings-close';
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Đóng cài đặt');
  hub.appendChild(closeBtn);

  const nav = document.createElement('nav');
  nav.className = 'main-menu-settings-nav';
  const tabs = ['chung', 'đồ hoạ', 'âm thanh', 'tài khoản'] as const;
  const navButtons = new Map<string, HTMLButtonElement>();
  tabs.forEach((tabId) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'main-menu-settings-nav-btn';
    btn.dataset.tab = tabId;
    btn.textContent = tabId.charAt(0).toUpperCase() + tabId.slice(1);
    navButtons.set(tabId, btn);
    nav.appendChild(btn);
  });
  hub.appendChild(nav);

  const content = document.createElement('div');
  content.className = 'main-menu-settings-content';
  hub.appendChild(content);

  const title = document.createElement('h3');
  title.className = 'main-menu-settings-title';
  const description = document.createElement('p');
  description.className = 'main-menu-settings-desc';
  content.appendChild(title);
  content.appendChild(description);

  const accountActions = document.createElement('div');
  accountActions.style.display = 'none';
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'main-menu-settings-danger-btn';
  resetBtn.textContent = 'Xoá dữ liệu';

  const confirmWrap = document.createElement('div');
  confirmWrap.className = 'main-menu-settings-confirm';
  const confirmText = document.createElement('p');
  confirmText.textContent = 'Bạn muốn xoá toàn bộ dữ liệu tài khoản?';
  const confirmActions = document.createElement('div');
  confirmActions.className = 'main-menu-settings-confirm-actions';
  const confirmYes = document.createElement('button');
  confirmYes.type = 'button';
  confirmYes.className = 'main-menu-settings-confirm-btn main-menu-settings-confirm-btn--danger';
  confirmYes.textContent = 'Xác nhận';
  const confirmNo = document.createElement('button');
  confirmNo.type = 'button';
  confirmNo.className = 'main-menu-settings-confirm-btn';
  confirmNo.textContent = 'Từ chối';
  confirmActions.appendChild(confirmYes);
  confirmActions.appendChild(confirmNo);
  confirmWrap.appendChild(confirmText);
  confirmWrap.appendChild(confirmActions);
  accountActions.appendChild(resetBtn);
  accountActions.appendChild(confirmWrap);
  content.appendChild(accountActions);

  container.appendChild(overlay);

  let activeTab = 'chung';
  const renderTab = () => {
    navButtons.forEach((btn, tabId) => btn.classList.toggle('is-active', tabId === activeTab));
    accountActions.style.display = activeTab === 'tài khoản' ? '' : 'none';
    confirmWrap.classList.remove('is-open');
    if (activeTab === 'chung'){
      title.textContent = 'Cài đặt chung';
      description.textContent = 'Các cấu hình chung sẽ được bổ sung sau.';
      return;
    }
    if (activeTab === 'đồ hoạ'){
      title.textContent = 'Cài đặt đồ hoạ';
      description.textContent = 'Các cấu hình đồ hoạ sẽ được bổ sung sau.';
      return;
    }
    if (activeTab === 'âm thanh'){
      title.textContent = 'Cài đặt âm thanh';
      description.textContent = 'Các cấu hình âm thanh sẽ được bổ sung sau.';
      return;
    }
    title.textContent = 'Cài đặt tài khoản';
    description.textContent = 'Khu vực test dữ liệu tài khoản.';
  };

  const openHub = () => {
    overlay.classList.add('is-open');
    renderTab();
  };

  const closeHub = () => {
    overlay.classList.remove('is-open');
    confirmWrap.classList.remove('is-open');
  };

  const onTabClick = (event: Event) => {
    const target = event.target as HTMLElement | null;
    const tabBtn = target?.closest('.main-menu-settings-nav-btn') as HTMLButtonElement | null;
    if (!tabBtn) return;
    const tabId = String(tabBtn.dataset.tab ?? '');
    if (!navButtons.has(tabId)) return;
    activeTab = tabId;
    renderTab();
  };

  const onResetClick = () => confirmWrap.classList.add('is-open');
  const onResetCancel = () => confirmWrap.classList.remove('is-open');
  const onResetConfirm = () => {
    resetPlayerProfileData();
    resetSharedCurrencyWallet();
    confirmWrap.classList.remove('is-open');
    description.textContent = 'Đã xoá dữ liệu tài khoản thành công. Bạn có thể tiếp tục test.';
  };

  trigger.addEventListener('click', openHub);
  closeBtn.addEventListener('click', closeHub);
  nav.addEventListener('click', onTabClick);
  resetBtn.addEventListener('click', onResetClick);
  confirmNo.addEventListener('click', onResetCancel);
  confirmYes.addEventListener('click', onResetConfirm);
  addCleanup(() => trigger.removeEventListener('click', openHub));
  addCleanup(() => closeBtn.removeEventListener('click', closeHub));
  addCleanup(() => nav.removeEventListener('click', onTabClick));
  addCleanup(() => resetBtn.removeEventListener('click', onResetClick));
  addCleanup(() => confirmNo.removeEventListener('click', onResetCancel));
  addCleanup(() => confirmYes.removeEventListener('click', onResetConfirm));
}

export function renderMainMenuView(state: MainMenuState): RenderedMainMenu | null {
  const {
    root,
    shell = null,
    sections = [],
    metadata = [],
    onShowComingSoon
  } = state;

  if (!root) return null;

  ensureStyles();

  const cleanups: CleanupFn[] = [];
  const addCleanup: CleanupRegistrar = fn => {
    if (typeof fn === 'function'){
      cleanups.push(fn);
    }
  };

  const container = document.createElement('div');
  container.className = 'main-menu-v2';
  const mount = mountSection({
    root,
    section: container,
    rootClasses: 'app--main-menu',
    removeRootClasses: 'app--pve',
  });

  const header = createHeader();
  container.appendChild(header);

  createSettingsHub(container, addCleanup);

  const layout = document.createElement('div');
  layout.className = 'main-menu-v2__layout';
  container.appendChild(layout);

  const primary = document.createElement('div');
  primary.className = 'main-menu-v2__primary';
  const modes = createModesSection({ sections, metadata, shell, onShowComingSoon, addCleanup });
  primary.appendChild(modes);

  layout.appendChild(primary);

  return {
    destroy(){
      cleanups.forEach(fn => {
        try {
          fn();
        } catch (err) {
          console.error('[main-menu] cleanup failed', err);
        }
      });
      cleanups.length = 0;
      mount.destroy();
    }
  };
}

export {
  ensureStyles,
  createHeader,
  createModesSection,
} from './layout.ts';