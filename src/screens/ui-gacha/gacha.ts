//home (termux)/arclune_lane_7x3/src/screens/ui-gacha/gacha.ts

import { CURRENCY_LABELS, createWallet, GACHA_CONFIG } from './logic/config.ts';
import {
  createNormalizedWallet,
  getSharedCurrencyWallet,
  subscribeSharedCurrencyWallet,
  syncSharedCurrencyWallet,
} from '../../utils/currency.ts';
import { loadPlayerProfile, patchPlayerProfile } from '../../utils/player-profile.ts';
import { normalizeUnitId } from '../../utils/unit-id.ts';
import { payForRoll } from './logic/currency.ts';
import { getBannerById, getSummonableFeaturedUnits, multiRoll, rollBanner } from './logic/gacha.ts';
import { getBannerState } from './logic/pity.ts';
import {
  type BannerDefinition,
  type BannerStateMap,
  CURRENCY_ORDER,
  type CurrencyCode,
  type Wallet,
} from './logic/types.ts';

const NUMBER_FORMAT = new Intl.NumberFormat('vi-VN');
const COMPACT_NUMBER_FORMAT = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });
const TIME_FORMAT = new Intl.RelativeTimeFormat('vi', { style: 'short', numeric: 'auto' });
const HISTORY_TIME_FORMAT = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });

const CURRENCY_ICONS: Record<CurrencyCode, string> = {
  VNT: 'assets/dust.svg',
  HNT: 'assets/coin.svg',
  TNT: 'assets/ticket.svg',
  ThNT: 'assets/key.svg',
  TT: 'assets/gem.svg',
};

interface GachaUIState {
  wallet: Wallet;
  bannerId: string;
  states: BannerStateMap;
  summonHistory: SummonHistoryEntry[];
  uiSettings: GachaUISettings;
}

interface GachaUISettings {
  confirmSummonEnabled: boolean;
}

interface SummonHistoryEntry {
  time: number;
  bannerLabel: string;
  rarity: string;
  name: string | null;
  featured: boolean;
  pity: string | null;
}

interface PitySection {
  label: string;
  value: number;
  max: number | null;
}

interface PityMeterNodes {
  root: HTMLDivElement;
  progress: HTMLDivElement;
  value: HTMLSpanElement;
}

const currencyValueNodeCache = new WeakMap<HTMLElement, Map<CurrencyCode, HTMLElement>>();
const bannerButtonNodeCache = new WeakMap<HTMLElement, Map<string, HTMLButtonElement>>();

function markOwnedUnits(unitIds: Iterable<string>): void {
  const ownedByUnit: Record<string, boolean> = { ...(loadPlayerProfile().ownedByUnit ?? {}) };
  let changed = false;
  for (const unitId of unitIds) {
    const normalizedId = normalizeUnitId(unitId);
    if (!normalizedId || ownedByUnit[normalizedId] === true) continue;
    ownedByUnit[normalizedId] = true;
    changed = true;
  }
  if (changed) {
    patchPlayerProfile({ ownedByUnit });
  }
}

function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(Math.max(0, Math.trunc(value)));
}

function formatCompactNumber(value: number): string {
  return COMPACT_NUMBER_FORMAT.format(Math.max(0, Math.trunc(value)));
}

function formatRemainingTime(banner: BannerDefinition): string {
  if (!banner.expiresAt) {
    return 'Vĩnh viễn';
  }
  const diff = banner.expiresAt - Date.now();
  const days = Math.round(diff / (24 * 3600 * 1000));
  if (Math.abs(days) >= 1) {
    return TIME_FORMAT.format(days, 'day');
  }
  const hours = Math.round(diff / (3600 * 1000));
  if (Math.abs(hours) >= 1) {
    return TIME_FORMAT.format(hours, 'hour');
  }
  const minutes = Math.round(diff / (60 * 1000));
  return TIME_FORMAT.format(minutes, 'minute');
}

function getBannerCost(banner: BannerDefinition, type: 'x1' | 'x10') {
  const amount = type === 'x1' ? banner.cost.x1 : banner.cost.x10;
  return { currency: banner.cost.unit, amount };
}

function formatPaymentConversionNotice(payment: { detail: { conversions: readonly { from: CurrencyCode; to: CurrencyCode; units: number; amount: number }[]; usedFromHigher: number; currency: CurrencyCode } | null }): string | null {
  const detail = payment.detail;
  if (!detail || detail.usedFromHigher <= 0 || detail.conversions.length === 0) {
    return null;
  }
  const steps = detail.conversions
    .map((step) => `${formatNumber(step.units)} ${step.from} → ${formatNumber(step.amount)} ${step.to}`)
    .join(', ');
  return `Đã dùng ${formatNumber(detail.usedFromHigher)} ${detail.currency} từ tiền tệ cao hơn: ${steps}.`;
}

function renderWalletChip(code: CurrencyCode, amount: number): HTMLElement {
  const chip = document.createElement('button');
  chip.className = 'currency-mini-item';
  chip.type = 'button';
  chip.dataset.currency = code;
  chip.style.setProperty('--currency-icon', `url("${CURRENCY_ICONS[code]}")`);
  chip.setAttribute('aria-label', `${CURRENCY_LABELS[code]} (${code}): ${formatNumber(amount)}`);
  chip.innerHTML = `<span class="currency-mini-item__value">${formatCompactNumber(amount)}</span>`;
  return chip;
}

function renderCurrencyHeader(container: HTMLElement, wallet: Wallet, onOpenTooltip: (code: CurrencyCode, target: HTMLElement) => void): void {
  const cachedNodes = currencyValueNodeCache.get(container) ?? new Map<CurrencyCode, HTMLElement>();

  if (cachedNodes.size === CURRENCY_ORDER.length) {
    CURRENCY_ORDER.forEach((code) => {
      const valueEl = cachedNodes.get(code);
      if (!valueEl) return;
      const nextText = formatCompactNumber(wallet[code]);
      valueEl.closest<HTMLElement>('.currency-mini-item')?.setAttribute('aria-label', `${CURRENCY_LABELS[code]} (${code}): ${formatNumber(wallet[code])}`);
      if (valueEl.textContent !== nextText) {
        valueEl.textContent = nextText;
      }
    });
    return;
  }

  container.replaceChildren();
  cachedNodes.clear();
  const fragment = document.createDocumentFragment();
  for (const code of CURRENCY_ORDER) {
    const chip = renderWalletChip(code, wallet[code]);
    chip.addEventListener('click', () => onOpenTooltip(code, chip));
    const valueEl = chip.querySelector<HTMLElement>('.currency-mini-item__value');
    if (valueEl) {
      cachedNodes.set(code, valueEl);
    }
    fragment.appendChild(chip);
  }
  container.appendChild(fragment);
  currencyValueNodeCache.set(container, cachedNodes);
}

function createBannerButton(banner: BannerDefinition, isActive: boolean): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'banner-entry';
  if (isActive) {
    button.classList.add('is-active');
  }
  button.dataset.bannerId = banner.id;
  button.innerHTML = `
    <span class="banner-entry__title">${banner.label}</span>
    <span class="banner-entry__timer">${formatRemainingTime(banner)}</span>
  `;
  return button;
}

function renderBannerList(
  container: HTMLElement,
  banners: readonly BannerDefinition[],
  activeId: string,
  onSelect: (id: string) => void,
): void {
  const cachedButtons = bannerButtonNodeCache.get(container) ?? new Map<string, HTMLButtonElement>();

  if (cachedButtons.size === banners.length) {
    banners.forEach((banner) => {
      const button = cachedButtons.get(banner.id);
      if (!button) {
        return;
      }
      const shouldBeActive = banner.id === activeId;
      button.classList.toggle('is-active', shouldBeActive);
      const timerEl = button.querySelector<HTMLElement>('.banner-entry__timer');
      if (timerEl) {
        timerEl.textContent = formatRemainingTime(banner);
      }
    });
    return;
  }

  container.replaceChildren();
  cachedButtons.clear();
  const fragment = document.createDocumentFragment();
  for (const banner of banners) {
    const button = createBannerButton(banner, banner.id === activeId);
    button.addEventListener('click', () => onSelect(banner.id));
    cachedButtons.set(banner.id, button);
    fragment.appendChild(button);
  }
  container.appendChild(fragment);
  bannerButtonNodeCache.set(container, cachedButtons);
}

function renderRates(container: HTMLElement, banner: BannerDefinition): void {
  container.replaceChildren();
  const content = document.createElement('div');
  content.className = 'gacha-drawer__content';
  const note = document.createElement('p');
  note.textContent = 'Rate-up: 70% tỷ lệ nếu trúng hạng tương ứng.';
  content.appendChild(note);
  const list = document.createElement('dl');
  list.className = 'rate-list';
  const entries = Object.entries(banner.rates).sort(([, a], [, b]) => b - a);
  for (const [rarity, rate] of entries) {
    const term = document.createElement('dt');
    term.textContent = rarity;
    const detail = document.createElement('dd');
    detail.textContent = `${(rate * 100).toFixed(2)}%`;
    list.appendChild(term);
    list.appendChild(detail);
  }
  content.appendChild(list);
  container.appendChild(content);
}

function getPremiumPitySections(banner: BannerDefinition, state: ReturnType<typeof getBannerState>): PitySection[] {
  const sections: PitySection[] = [];
  if (banner.pity.ssr) {
    sections.push({ label: 'SSR', value: state.pity.ssr, max: banner.pity.ssr.hard });
  }
  if (banner.pity.ur) {
    sections.push({ label: 'UR', value: state.pity.ur, max: banner.pity.ur.hard });
  }
  if (banner.pity.prime) {
    sections.push({ label: 'Prime', value: state.pity.prime, max: banner.pity.prime.hard });
  }
  return sections;
}

function getPitySections(banner: BannerDefinition, states: BannerStateMap): PitySection[] {
  const state = getBannerState(states, banner);
  return [
    { label: 'SR sàn', value: state.pity.sr, max: banner.pity.srFloor },
    ...getPremiumPitySections(banner, state),
  ];
}

function getMainPitySections(banner: BannerDefinition, states: BannerStateMap): PitySection[] {
  return getPremiumPitySections(banner, getBannerState(states, banner));
}

function ensurePityMeterNodes(container: HTMLElement, sections: ReadonlyArray<PitySection>): Map<string, PityMeterNodes> {
  let row = container.querySelector<HTMLDivElement>(':scope > .pity-chip-row');
  if (!row) {
    row = document.createElement('div');
    row.className = 'pity-chip-row';
  }

  const existing = new Map<string, PityMeterNodes>();
  for (const child of row.querySelectorAll<HTMLDivElement>(':scope > .pity-chip')) {
    const label = child.dataset.pityLabel;
    const progress = child.querySelector<HTMLDivElement>('.pity-chip__progress');
    const value = child.querySelector<HTMLSpanElement>('.pity-chip__value');
    if (!label || !progress || !value) {
      continue;
    }
    existing.set(label, { root: child, progress, value });
  }

  const fragment = document.createDocumentFragment();
  const nextMap = new Map<string, PityMeterNodes>();
  for (const section of sections) {
    const current = existing.get(section.label);
    if (current) {
      nextMap.set(section.label, current);
      fragment.appendChild(current.root);
      continue;
    }
    const item = document.createElement('div');
    item.className = 'pity-chip';
    item.dataset.pityLabel = section.label;
    const label = document.createElement('span');
    label.className = 'pity-chip__label';
    label.textContent = section.label;
    const value = document.createElement('span');
    value.className = 'pity-chip__value';
    const bar = document.createElement('div');
    bar.className = 'pity-chip__bar';
    const progress = document.createElement('div');
    progress.className = 'pity-chip__progress';
    bar.appendChild(progress);
    item.append(label, value, bar);
    const nodes = { root: item, progress, value };
    nextMap.set(section.label, nodes);
    fragment.appendChild(item);
  }
  row.replaceChildren(fragment);
  container.replaceChildren(row);
  return nextMap;
}

function renderPity(container: HTMLElement, banner: BannerDefinition, states: BannerStateMap): void {
  const sections = getMainPitySections(banner, states);
  const pityNodes = ensurePityMeterNodes(container, sections);

  for (const entry of sections) {
    const nodes = pityNodes.get(entry.label);
    if (!nodes) {
      continue;
    }
    let percent = 0;
    if (entry.max && entry.max > 0) {
      percent = Math.min(99, Math.floor((entry.value / entry.max) * 100));
    }
    const nextWidth = `${percent}%`;
    if (nodes.progress.style.width !== nextWidth) {
      nodes.progress.style.width = nextWidth;
    }
    const nextValue = entry.max ? `${entry.value}/${entry.max}` : `${entry.value}`;
    if (nodes.value.textContent !== nextValue) {
      nodes.value.textContent = nextValue;
    }
  }
}

function renderFeatured(container: HTMLElement, banner: BannerDefinition): void {
  container.replaceChildren();
  const heading = document.createElement('h3');
  heading.className = 'featured__heading';
  heading.textContent = 'RATE-UP';
  container.appendChild(heading);

  const row = document.createElement('div');
  row.className = 'featured-chip-row';
  for (const unit of getSummonableFeaturedUnits(banner)) {
    const chip = document.createElement('article');
    chip.className = 'featured-card';

    const rarity = document.createElement('span');
    rarity.className = 'featured-card__rarity';
    rarity.textContent = unit.rarity;

    const name = document.createElement('strong');
    name.className = 'featured-card__name';
    name.textContent = unit.name;

    chip.append(rarity, name);
    row.appendChild(chip);
  }
  container.appendChild(row);
}

function renderHeroArt(container: HTMLElement, banner: BannerDefinition): void {
  container.replaceChildren();
  container.classList.toggle('banner-panel__art--image', Boolean(banner.background));
  container.classList.toggle('banner-panel__art--gradient', !banner.background);

  if (banner.background) {
    const image = document.createElement('img');
    image.className = 'banner-panel__image';
    image.src = banner.background;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    container.appendChild(image);
  }

  const copy = document.createElement('div');
  copy.className = 'banner-panel__copy';

  const eyebrow = document.createElement('span');
  eyebrow.className = 'banner-panel__eyebrow';
  eyebrow.textContent = banner.type;

  const title = document.createElement('h2');
  title.className = 'banner-panel__label';
  title.textContent = banner.label;

  const description = document.createElement('p');
  description.className = 'banner-panel__description';
  description.textContent = banner.description ?? 'Triệu hồi đội hình nổi bật và tích lũy bảo hiểm theo từng banner.';

  const featuredList = document.createElement('ul');
  featuredList.className = 'banner-panel__featured-list';
  const featuredUnits = getSummonableFeaturedUnits(banner).slice(0, 3);
  const featuredNames = featuredUnits.length > 0
    ? featuredUnits.map((unit) => `${unit.rarity} ${unit.name}`)
    : ['Đội hình thường trực', 'Nhân vật rate-up sẽ cập nhật'];
  for (const featuredName of featuredNames) {
    const item = document.createElement('li');
    item.textContent = featuredName;
    featuredList.appendChild(item);
  }

  copy.append(eyebrow, title, description, featuredList);
  container.appendChild(copy);
}

function createRulesContent(): HTMLElement {
  const dialog = document.createElement('div');
  dialog.className = 'gacha-drawer__content';
  dialog.innerHTML = `
    <h2>Quy Tắc</h2>
    <p>100 đơn vị bậc thấp = 1 đơn vị bậc cao. Thuế tối đa 10% khi đổi lên, không thuế khi đổi xuống.</p>
    <p>ThNT là tiền chính cho Prime banner; TT là tài nguyên tối thượng/chiến lược, chỉ đổi xuống ThNT khi có xác nhận và không tự động tiêu cho roll.</p>
    <p>Công dụng TT cho Nghịch Phản Tiên Thiên/Axiom là dự kiến hoặc sẽ khóa sau hệ thống upgrade.</p>
    <p>Thuế tăng theo bậc, miễn thuế nếu đổi &lt; 100 đơn vị.</p>
    <ul>
      <li>VNT → HNT: thuế gốc 0.5%</li>
      <li>HNT → TNT: thuế gốc 1.0%</li>
      <li>TNT → ThNT: thuế gốc 1.5%</li>
      <li>TT chỉ đổi xuống khi xác nhận, không thuế; auto-convert khi roll luôn bỏ qua TT.</li>
    </ul>
  `;
  return dialog;
}

function renderPityInfo(container: HTMLElement, banner: BannerDefinition, states: BannerStateMap): void {
  container.replaceChildren();
  const sections = getPitySections(banner, states);
  const active = document.createElement('div');
  active.className = 'gacha-drawer__content';
  active.innerHTML = '<h2>Bảo Hiểm</h2>';
  const list = document.createElement('dl');
  list.className = 'pity-info-list';
  for (const section of sections) {
    const term = document.createElement('dt');
    term.textContent = section.label;
    const detail = document.createElement('dd');
    detail.textContent = section.max ? `${section.value}/${section.max}` : `${section.value}`;
    list.append(term, detail);
  }
  active.appendChild(list);

  const notes = document.createElement('ul');
  notes.className = 'pity-info-notes';
  notes.innerHTML = `<li>SR sàn sau ${formatNumber(banner.pity.srFloor)} lượt nếu chưa ra SR trở lên.</li>`;
  if (banner.pity.ssr) {
    notes.insertAdjacentHTML('beforeend', `<li>SSR soft pity từ ${formatNumber(banner.pity.ssr.soft)} lượt, hard pity ở ${formatNumber(banner.pity.ssr.hard)} lượt.</li>`);
  }
  if (banner.pity.ur) {
    notes.insertAdjacentHTML('beforeend', `<li>UR soft pity từ ${formatNumber(banner.pity.ur.soft)} lượt, hard pity ở ${formatNumber(banner.pity.ur.hard)} lượt.</li>`);
  }
  if (banner.pity.prime) {
    notes.insertAdjacentHTML('beforeend', `<li>Prime soft pity từ ${formatNumber(banner.pity.prime.soft)} lượt, hard pity ở ${formatNumber(banner.pity.prime.hard)} lượt.</li>`);
  }
  active.appendChild(notes);
  container.appendChild(active);
}

function updateSummonButton(button: HTMLButtonElement, banner: BannerDefinition, type: 'x1' | 'x10', wallet: Wallet): void {
  const cost = getBannerCost(banner, type);
  const count = type === 'x1' ? 1 : 10;
  const label = `TRIỆU HỒI ×${count}`;
  const canPay = payForRoll(wallet, cost.currency, cost.amount, { allowDownFromHigher: true, allowTT: false }).ok;
  const disabledMessage = `Không đủ ${cost.currency}.`;

  button.classList.add('summon-button', `summon-button--${type}`);
  button.disabled = !canPay;
  button.setAttribute('aria-disabled', String(!canPay));
  button.setAttribute('aria-label', canPay ? `${label}, tốn ${formatNumber(cost.amount)} ${cost.currency}` : `${label}, ${disabledMessage}`);
  button.title = canPay ? '' : disabledMessage;
  button.innerHTML = `
    <span class="summon-button__title">${label}</span>
    <span class="summon-button__cost"><img src="${CURRENCY_ICONS[cost.currency]}" alt="" aria-hidden="true" />${formatNumber(cost.amount)} ${cost.currency}</span>
    `;
  }

function updateSummonButtons(summonOne: HTMLButtonElement, summonTen: HTMLButtonElement, banner: BannerDefinition, wallet: Wallet): void {
  updateSummonButton(summonOne, banner, 'x1', wallet);
  updateSummonButton(summonTen, banner, 'x10', wallet);
}

function renderHistory(container: HTMLElement, history: readonly SummonHistoryEntry[]): void {
  const content = document.createElement('div');
  content.className = 'gacha-drawer__content';
  content.innerHTML = '<h2>Lịch sử</h2>';

  if (history.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Chưa có lượt triệu hồi nào.';
    content.appendChild(empty);
    container.replaceChildren(content);
    return;
  }

  const list = document.createElement('div');
  list.className = 'history-list';
  for (const entry of history) {
    const item = document.createElement('article');
    item.className = 'history-entry';

    const time = document.createElement('time');
    time.className = 'history-entry__time';
    const entryDate = new Date(entry.time);
    time.dateTime = entryDate.toISOString();
    time.textContent = HISTORY_TIME_FORMAT.format(entryDate);

    const banner = document.createElement('span');
    banner.className = 'history-entry__banner';
    banner.textContent = entry.bannerLabel;

    const rarity = document.createElement('span');
    rarity.className = 'history-entry__rarity';
    rarity.textContent = entry.rarity;

    const name = document.createElement('strong');
    name.className = 'history-entry__name';
    name.textContent = entry.name ?? (entry.featured ? 'Rate-up' : 'Thường');

    item.append(time, banner, rarity, name);
    if (entry.pity) {
      const pity = document.createElement('span');
      pity.className = 'history-entry__pity';
      pity.textContent = entry.pity;
      item.appendChild(pity);
    }
    list.appendChild(item);
  }
  content.appendChild(list);
  container.replaceChildren(content);
}

function createToast(message: string): HTMLElement {
  const toast = document.createElement('div');
  toast.className = 'gacha-toast';
  toast.textContent = message;
  setTimeout(() => {
    toast.classList.add('is-visible');
  }, 16);
  setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.remove();
  }, 4000);
  return toast;
}

function createSummonConfirmModal(): HTMLDivElement {
  const modal = document.createElement('div');
  modal.className = 'gacha-confirm-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'gacha-confirm-title');
  modal.innerHTML = `
    <div class="gacha-confirm-modal__backdrop" data-action="cancel-confirm"></div>
    <section class="gacha-confirm-modal__dialog" role="document">
      <h2 class="gacha-confirm-modal__title" id="gacha-confirm-title">Xác nhận triệu hồi</h2>
      <dl class="gacha-confirm-modal__summary">
        <div>
          <dt>Banner</dt>
          <dd data-slot="confirm-banner"></dd>
        </div>
        <div>
          <dt>Số lần quay</dt>
          <dd data-slot="confirm-count"></dd>
        </div>
        <div>
          <dt>Cost</dt>
          <dd data-slot="confirm-cost"></dd>
        </div>
      </dl>
      <footer class="gacha-confirm-modal__actions">
        <button type="button" class="gacha-confirm-modal__button" data-action="cancel-confirm">Hủy</button>
        <button type="button" class="gacha-confirm-modal__button gacha-confirm-modal__button--primary" data-action="confirm-summon">Xác nhận</button>
      </footer>
    </section>
  `;
  return modal;
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
    return !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true' && element.offsetParent !== null;
  });
}

function trapFocus(root: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') {
    return;
  }
  const focusable = getFocusableElements(root);
  if (focusable.length === 0) {
    event.preventDefault();
    root.focus();
    return;
  }
  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;
  const active = document.activeElement;
  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
    return;
  }
  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

export async function mountGachaUI(scope: HTMLElement | Document | null = null) {
  const rootScope = scope instanceof Document ? scope : scope ?? document;
  const hostElement: HTMLElement | null =
    rootScope instanceof Document
      ? rootScope.querySelector<HTMLElement>('[data-gacha-content]')
      : rootScope.matches('[data-gacha-content]')
        ? rootScope
        : rootScope.querySelector<HTMLElement>('[data-gacha-content]');

  if (!hostElement) {
    throw new Error('Không tìm thấy vùng mount [data-gacha-content] cho gacha UI.');
  }

  const shouldOwnBodyClass = Boolean(hostElement.closest('body.gacha-page')) && !(window as { __ARC_GACHA_EMBED__?: boolean }).__ARC_GACHA_EMBED__;
  const preservedChildren: ChildNode[] = Array.from(hostElement.childNodes);

  if (shouldOwnBodyClass) {
    document.body.classList.add('gacha-ui');
  }

  for (const child of preservedChildren) {
    hostElement.removeChild(child);
  }

  const container = document.createElement('div');
  container.className = 'gacha-ui-root gacha-screen';
  container.innerHTML = `
    <div class="gacha-body">
      <aside class="banner-sidebar" aria-label="Danh sách banner" data-slot="banner-list"></aside>
      <main class="gacha-main" aria-label="Gacha">
        <header class="gacha-topbar banner-panel__header">
          <div class="gacha-topbar__copy">
            <h1 class="banner-title" data-slot="hero-title"></h1>
            <p class="banner-desc" data-slot="hero-subtitle"></p>
          </div>
          <span class="banner-timer" data-slot="hero-timer"></span>
          <div class="currency-mini-hub" aria-label="Ví tiền tệ gacha">
            <div class="currency-bar" data-slot="currencies"></div>
          </div>
          <button class="history-button" type="button" aria-label="Xem lịch sử triệu hồi" aria-expanded="false">↺</button>
          <button class="rules-button" type="button" aria-label="Xem tỉ lệ và quy tắc" aria-expanded="false">?</button>
          </header>
        <section class="banner-panel" aria-label="Thông tin banner">
          <section class="banner-panel__art" data-slot="hero-art"></section>
        </section>
        <section class="banner-panel__featured" aria-label="Nhân vật rate-up" data-slot="featured"></section>
        <section class="banner-panel__pity" aria-label="Pity" data-slot="pity"></section>
        <footer class="banner-panel__actions gacha-actions">
          <button type="button" class="summon-button summon-button--x1" data-action="summon-x1"></button>
          <button type="button" class="summon-button summon-button--x10" data-action="summon-x10"></button>
        </footer>
      </main>
      <div class="gacha-backdrop" data-slot="drawer-backdrop" hidden></div>
      <aside class="gacha-drawer" data-slot="drawer" role="dialog" aria-modal="true" aria-label="Tỉ lệ và quy tắc gacha" aria-hidden="true">
        <div class="gacha-drawer__tabs" role="tablist" aria-label="Thông tin gacha">
          <button type="button" id="gacha-drawer-tab-rates" role="tab" data-drawer-tab="rates" aria-controls="gacha-drawer-panel">Tỉ lệ</button>
          <button type="button" id="gacha-drawer-tab-pity" role="tab" data-drawer-tab="pity" aria-controls="gacha-drawer-panel">Bảo hiểm</button>
          <button type="button" id="gacha-drawer-tab-rules" role="tab" data-drawer-tab="rules" aria-controls="gacha-drawer-panel">Quy tắc</button>
        </div>
        <div class="gacha-drawer__panel" id="gacha-drawer-panel" data-slot="drawer-panel" role="tabpanel" tabindex="0"></div>
      </aside>
    </div>
  `;

  hostElement.appendChild(container);

  const state: GachaUIState = {
    wallet: createWallet(createNormalizedWallet(getSharedCurrencyWallet())),
    bannerId: GACHA_CONFIG.banners[0]?.id ?? 'permanent',
    states: new Map(),
    summonHistory: [],
    uiSettings: {
      confirmSummonEnabled: true,
    },
  };
  syncSharedCurrencyWallet(state.wallet, { merge: true });

  const currencySlot = container.querySelector<HTMLElement>('[data-slot="currencies"]');
  const bannerList = container.querySelector<HTMLElement>('[data-slot="banner-list"]');
  const titleSlot = container.querySelector<HTMLElement>('[data-slot="hero-title"]');
  const subtitleSlot = container.querySelector<HTMLElement>('[data-slot="hero-subtitle"]');
  const timerSlot = container.querySelector<HTMLElement>('[data-slot="hero-timer"]');
  const artSlot = container.querySelector<HTMLElement>('[data-slot="hero-art"]');
  const drawerBackdrop = container.querySelector<HTMLElement>('[data-slot="drawer-backdrop"]');
  const drawer = container.querySelector<HTMLElement>('[data-slot="drawer"]');
  const drawerPanel = container.querySelector<HTMLElement>('[data-slot="drawer-panel"]');
  const drawerTabs = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-drawer-tab]'));
  const pitySlot = container.querySelector<HTMLElement>('[data-slot="pity"]');
  const featuredSlot = container.querySelector<HTMLElement>('[data-slot="featured"]');
  const rulesButton = container.querySelector<HTMLButtonElement>('.rules-button');
  const historyButton = container.querySelector<HTMLButtonElement>('.history-button');
  const summonOne = container.querySelector<HTMLButtonElement>('[data-action="summon-x1"]');
  const summonTen = container.querySelector<HTMLButtonElement>('[data-action="summon-x10"]');

  if (!currencySlot || !bannerList || !titleSlot || !subtitleSlot || !timerSlot || !artSlot || !drawerBackdrop || !drawer || !drawerPanel || drawerTabs.length === 0 || !pitySlot || !featuredSlot || !rulesButton || !historyButton || !summonOne || !summonTen) {
    throw new Error('Thiếu phần tử UI cần thiết.');
  }

  let lastBannerRenderId = '';
  let closeCurrencyTooltip: () => void = () => {};
  let closeSummonConfirm: () => void = () => {};

  const openCurrencyTooltip = (code: CurrencyCode, target: HTMLElement) => {
    closeCurrencyTooltip();
    const tooltip = document.createElement('div');
    tooltip.className = 'currency-mini-tooltip';
    tooltip.id = `currency-tooltip-${code}`;
    tooltip.setAttribute('role', 'tooltip');
    target.setAttribute('aria-describedby', tooltip.id);
    tooltip.innerHTML = `<strong>${CURRENCY_LABELS[code]}</strong><span>${formatNumber(state.wallet[code])}</span>`;
    container.appendChild(tooltip);
    const targetRect = target.getBoundingClientRect();
    const rootRect = container.getBoundingClientRect();
    tooltip.style.left = `${Math.min(rootRect.width - tooltip.offsetWidth - 8, Math.max(8, targetRect.left - rootRect.left))}px`;
    tooltip.style.top = `${Math.max(8, targetRect.bottom - rootRect.top + 8)}px`;
    const timeoutId = window.setTimeout(() => closeCurrencyTooltip(), 2200);
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && (target.contains(event.target) || tooltip.contains(event.target))) {
        return;
      }
      closeCurrencyTooltip();
    };
    document.addEventListener('pointerdown', onPointerDown, { capture: true });
    closeCurrencyTooltip = () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener('pointerdown', onPointerDown, { capture: true });
      target.removeAttribute('aria-describedby');
      tooltip.remove();
      closeCurrencyTooltip = () => {};
    };
  };

  const renderBanner = () => {
    const banner = getBannerById(state.bannerId) ?? GACHA_CONFIG.banners[0];
    if (!banner) return;

    const nextTimer = formatRemainingTime(banner);
    if (titleSlot.textContent !== banner.label) {
      titleSlot.textContent = banner.label;
    }
    const nextSubtitle = banner.description ?? '';
    if (subtitleSlot.textContent !== nextSubtitle) {
      subtitleSlot.textContent = nextSubtitle;
    }
    if (timerSlot.textContent !== nextTimer) {
      timerSlot.textContent = nextTimer;
    }

    if (lastBannerRenderId !== banner.id) {
      renderHeroArt(artSlot, banner);
      renderFeatured(featuredSlot, banner);
      lastBannerRenderId = banner.id;
    }

    updateSummonButtons(summonOne, summonTen, banner, state.wallet);
    renderPity(pitySlot, banner, state.states);
    if (drawer.classList.contains('is-open')) {
      renderDrawerPanel();
    }
  };

  let activeDrawerTab: 'rates' | 'pity' | 'rules' = 'rates';
  let activeDrawerMode: 'info' | 'history' = 'info';
  let lastDrawerTrigger: HTMLElement | null = null;

  const renderDrawerPanel = () => {
    const banner = getBannerById(state.bannerId) ?? GACHA_CONFIG.banners[0];
    if (!banner) return;
    const isHistoryMode = activeDrawerMode === 'history';
    drawer.classList.toggle('is-history', isHistoryMode);
    if (isHistoryMode) {
      drawerTabs.forEach((tab) => {
        tab.classList.remove('is-active');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
      });
      drawerPanel.removeAttribute('aria-labelledby');
      drawerPanel.setAttribute('aria-label', 'Lịch sử triệu hồi');
      renderHistory(drawerPanel, state.summonHistory);
      return;
    }
    drawerPanel.removeAttribute('aria-label');
    drawerTabs.forEach((tab) => {
      const isActive = tab.dataset.drawerTab === activeDrawerTab;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive && tab.id) {
        drawerPanel.setAttribute('aria-labelledby', tab.id);
      }
    });
    if (activeDrawerTab === 'pity') {
      renderPityInfo(drawerPanel, banner, state.states);
      return;
    }
    if (activeDrawerTab === 'rules') {
      drawerPanel.replaceChildren(createRulesContent());
      return;
    }
    renderRates(drawerPanel, banner);
  };

  const closeDrawer = () => {
    const trigger = lastDrawerTrigger;
    drawer.classList.remove('is-open', 'is-history');
    drawer.setAttribute('aria-hidden', 'true');
    drawerBackdrop.classList.remove('is-open');
    drawerBackdrop.hidden = true;
    rulesButton.setAttribute('aria-expanded', 'false');
    historyButton.setAttribute('aria-expanded', 'false');
    trigger?.focus();
    lastDrawerTrigger = null;
  };

  const openDrawer = (tab: 'rates' | 'pity' | 'rules' = 'rates', trigger: HTMLElement | null = rulesButton) => {
    closeCurrencyTooltip();
    activeDrawerMode = 'info';
    activeDrawerTab = tab;
    lastDrawerTrigger = trigger;
    rulesButton.setAttribute('aria-expanded', String(trigger === rulesButton));
    historyButton.setAttribute('aria-expanded', 'false');
    drawerBackdrop.hidden = false;
    renderDrawerPanel();
    drawerBackdrop.classList.add('is-open');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.querySelector<HTMLButtonElement>('[data-drawer-tab].is-active')?.focus();
  };

  const openHistoryDrawer = (trigger: HTMLElement | null = historyButton) => {
    closeCurrencyTooltip();
    activeDrawerMode = 'history';
    lastDrawerTrigger = trigger;
    rulesButton.setAttribute('aria-expanded', 'false');
    historyButton.setAttribute('aria-expanded', String(trigger === historyButton));
    drawerBackdrop.hidden = false;
    renderDrawerPanel();
    drawerBackdrop.classList.add('is-open');
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawerPanel.focus();
  };

  const renderWallet = () => {
    renderCurrencyHeader(currencySlot, state.wallet, openCurrencyTooltip);
    const banner = getBannerById(state.bannerId) ?? GACHA_CONFIG.banners[0];
    if (banner) {
      updateSummonButtons(summonOne, summonTen, banner, state.wallet);
    }
  };

  const updateBannerList = () => {
    renderBannerList(bannerList, GACHA_CONFIG.banners, state.bannerId, (id) => {
      if (state.bannerId === id) {
        return;
      }
      closeCurrencyTooltip();
      state.bannerId = id;
      updateBannerList();
      renderBanner();
      if (drawer.classList.contains('is-open')) {
        renderDrawerPanel();
      }
    });
  };

  const renderAll = () => {
    renderWallet();
    updateBannerList();
    renderBanner();
  };
  const unsubscribeSharedWallet = subscribeSharedCurrencyWallet((walletSnapshot) => {
    state.wallet = createWallet(walletSnapshot);
    renderWallet();
  });

  const performSummon = (count: number) => {
    const banner = getBannerById(state.bannerId);
    if (!banner) {
      return;
    }
    const cost = count === 10 ? banner.cost.x10 : banner.cost.x1;
    const payment = payForRoll(state.wallet, banner.cost.unit, cost, { allowDownFromHigher: true, allowTT: false });
    if (!payment.ok) {
      const toast = createToast('Không đủ tiền tệ sau khi auto-convert.');
      container.appendChild(toast);
      return;
    }
    state.wallet = payment.wallet;
    syncSharedCurrencyWallet(state.wallet);
    renderWallet();
    const historyEntries: SummonHistoryEntry[] = [];
    const rolls = count === 10 ? multiRoll(banner, state.states, 10) : [rollBanner(banner, state.states)];
    const now = Date.now();
    const rolledUnitIds: string[] = [];
    for (const roll of rolls) {
      const rolledUnit = roll.unit ?? null;
      if (rolledUnit?.id) {
        rolledUnitIds.push(rolledUnit.id);
      }
      historyEntries.push({
        time: now,
        bannerLabel: banner.label,
        rarity: roll.outcome.rarity,
        name: rolledUnit?.name ?? null,
        featured: roll.outcome.featured,
        pity: roll.outcome.pityTriggered === 'hard' ? 'Hard pity' : roll.outcome.pityTriggered === 'soft' ? 'Soft pity' : roll.outcome.pityTriggered === 'srFloor' ? 'SR floor' : null,
      });
    }
    markOwnedUnits(rolledUnitIds);
    state.summonHistory = [...historyEntries, ...state.summonHistory].slice(0, 50);
    renderPity(pitySlot, banner, state.states);
    if (drawer.classList.contains('is-open')) {
      renderDrawerPanel();
    }
    const paymentNotice = formatPaymentConversionNotice(payment);
    if (paymentNotice) {
      container.appendChild(createToast(paymentNotice));
    }
    const toast = createToast(`Đã triệu hồi ${count} lần.`);
    container.appendChild(toast);
  };

  const requestSummon = (count: number) => {
    if (!state.uiSettings.confirmSummonEnabled) {
      performSummon(count);
      return;
    }
    const banner = getBannerById(state.bannerId);
    if (!banner) {
      return;
    }
    closeCurrencyTooltip();
    closeSummonConfirm();
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const cost = count === 10 ? banner.cost.x10 : banner.cost.x1;
    const modal = createSummonConfirmModal();
    modal.querySelector<HTMLElement>('[data-slot="confirm-banner"]')!.textContent = banner.label;
    modal.querySelector<HTMLElement>('[data-slot="confirm-count"]')!.textContent = `${formatNumber(count)} lần`;
    modal.querySelector<HTMLElement>('[data-slot="confirm-cost"]')!.textContent = `${formatNumber(cost)} ${banner.cost.unit}`;
    const confirmButton = modal.querySelector<HTMLButtonElement>('[data-action="confirm-summon"]');
    const cancelButtons = modal.querySelectorAll<HTMLButtonElement>('[data-action="cancel-confirm"]');
    closeSummonConfirm = () => {
      modal.remove();
      closeSummonConfirm = () => {};
      trigger?.focus();
    };
    confirmButton?.addEventListener('click', () => {
      closeSummonConfirm();
      performSummon(count);
    });
    cancelButtons.forEach((button) => button.addEventListener('click', closeSummonConfirm));
    container.appendChild(modal);
    confirmButton?.focus();
  };

  rulesButton.addEventListener('click', () => openDrawer('rates', rulesButton));
  historyButton.addEventListener('click', () => openHistoryDrawer(historyButton));
  drawerBackdrop.addEventListener('click', closeDrawer);
  drawer.addEventListener('click', (event) => event.stopPropagation());
  drawerTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const nextTab = tab.dataset.drawerTab;
      if (nextTab === 'rates' || nextTab === 'pity' || nextTab === 'rules') {
        activeDrawerMode = 'info';
        activeDrawerTab = nextTab;
        renderDrawerPanel();
      }
    });
  });
  const onDocumentKeydown = (event: KeyboardEvent) => {
    const confirmModal = container.querySelector<HTMLElement>('.gacha-confirm-modal');
    if (confirmModal) {
      trapFocus(confirmModal, event);
    } else if (drawer.classList.contains('is-open')) {
      trapFocus(drawer, event);
    }
    if (event.key === 'Escape') {
      closeSummonConfirm();
    }
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  };
  document.addEventListener('keydown', onDocumentKeydown);
  summonOne.addEventListener('click', () => requestSummon(1));
  summonTen.addEventListener('click', () => requestSummon(10));

  renderAll();

  let destroyed = false;

  return {
    destroy() {
      if (destroyed) {
        return;
      }
      destroyed = true;
      closeCurrencyTooltip();
      closeSummonConfirm();
      closeDrawer();
      document.removeEventListener('keydown', onDocumentKeydown);
      unsubscribeSharedWallet();
      if (shouldOwnBodyClass) {
        document.body.classList.remove('gacha-ui');
      }
      container.remove();
      if (preservedChildren.length > 0) {
        const fragment = document.createDocumentFragment();
        for (const child of preservedChildren) {
          fragment.appendChild(child);
        }
        hostElement.appendChild(fragment);
        preservedChildren.length = 0;
      }
    },
  };
}