//home (termux)/arclune_lane_7x3/src/screens/ui-gacha/gacha.ts

import { CURRENCY_LABELS, createWallet, GACHA_CONFIG } from './logic/config.ts';
import {
  createNormalizedWallet,
  getSharedCurrencyWallet,
  subscribeSharedCurrencyWallet,
  syncSharedCurrencyWallet,
} from '../../utils/currency.ts';
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
}

interface SummonResultEntry {
  rarity: string;
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
  chip.setAttribute('aria-label', `${CURRENCY_LABELS[code]}: ${Math.max(0, Math.trunc(amount))}`);
  chip.innerHTML = `<span class="currency-mini-item__value">${formatCompactNumber(amount)}</span>`;y
  return chip;
}

function renderCurrencyHeader(container: HTMLElement, wallet: Wallet, onOpenTooltip: (code: CurrencyCode, target: HTMLElement) => void): void {
  const cachedNodes = currencyValueNodeCache.get(container) ?? new Map<CurrencyCode, HTMLElement>();

  if (cachedNodes.size === CURRENCY_ORDER.length) {
    CURRENCY_ORDER.forEach((code) => {
      const valueEl = cachedNodes.get(code);
      if (!valueEl) return;
      const nextText = formatCompactNumber(wallet[code]);
      valueEl.closest<HTMLElement>('.currency-mini-item')?.setAttribute('aria-label', `${CURRENCY_LABELS[code]}: ${Math.max(0, Math.trunc(wallet[code]))}`);
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
  container.appendChild(list);
}

function getPitySections(banner: BannerDefinition, states: BannerStateMap): PitySection[] {
  const state = getBannerState(states, banner);
  const sections: PitySection[] = [
    { label: 'SR sàn', value: state.pity.sr, max: banner.pity.srFloor },
  ];
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

  function ensurePityMeterNodes(container: HTMLElement, sections: ReadonlyArray<PitySection>): Map<string, PityMeterNodes> {
  const existing = new Map<string, PityMeterNodes>();
  for (const child of container.querySelectorAll<HTMLDivElement>(':scope > .pity-meter')) {
    const label = child.dataset.pityLabel;
    const progress = child.querySelector<HTMLDivElement>('.pity-meter__progress');
    const value = child.querySelector<HTMLSpanElement>('.pity-meter__value');
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
    item.className = 'pity-meter';
    item.dataset.pityLabel = section.label;
    const label = document.createElement('span');
    label.className = 'pity-meter__label';
    label.textContent = section.label;
    const bar = document.createElement('div');
    bar.className = 'pity-meter__bar';
    const progress = document.createElement('div');
    progress.className = 'pity-meter__progress';
    bar.appendChild(progress);
    const value = document.createElement('span');
    value.className = 'pity-meter__value';
    item.append(label, bar, value);
    const nodes = { root: item, progress, value };
    nextMap.set(section.label, nodes);
    fragment.appendChild(item);
  }
  container.replaceChildren(fragment);
  return nextMap;
}

function renderPity(container: HTMLElement, banner: BannerDefinition, states: BannerStateMap): void {
  const sections = getPitySections(banner, states);
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
  heading.textContent = 'Rate-up';
  container.appendChild(heading);
  const note = document.createElement('p');
  note.className = 'featured__note';
  note.textContent = '70% tỷ lệ nếu trúng hạng tương ứng.';
  container.appendChild(note);
  for (const unit of getSummonableFeaturedUnits(banner)) {
    const card = document.createElement('article');
    card.className = 'featured-card';
    card.innerHTML = `
      <span class="featured-card__rarity">${unit.rarity}</span>
      <strong class="featured-card__name">${unit.name}</strong>
    `;
    container.appendChild(card);
  }
}

function createModal(content: HTMLElement): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.appendChild(content);
  return overlay;
}

function openModal(root: HTMLElement, content: HTMLElement): () => void {
  const modal = createModal(content);
  root.appendChild(modal);
  const close = () => {
    modal.remove();
  };
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      close();
    }
  });
  return close;
}

function createRulesContent(): HTMLElement {
  const dialog = document.createElement('div');
  dialog.className = 'modal-content';
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

function renderCosts(container: HTMLElement, banner: BannerDefinition): void {
  container.replaceChildren();
  const single = getBannerCost(banner, 'x1');
  const multi = getBannerCost(banner, 'x10');
  const singleEl = document.createElement('div');
  singleEl.className = 'cost-entry';
  singleEl.innerHTML = `
    <span>Triệu hồi x1</span>
    <span class="cost-entry__value"><img src="${CURRENCY_ICONS[single.currency]}" alt="${single.currency}" />${formatNumber(single.amount)}</span>
  `;
  const multiEl = document.createElement('div');
  multiEl.className = 'cost-entry';
  multiEl.innerHTML = `
    <span>Triệu hồi x10</span>
    <span class="cost-entry__value"><img src="${CURRENCY_ICONS[multi.currency]}" alt="${multi.currency}" />${formatNumber(multi.amount)}</span>
  `;
  container.appendChild(singleEl);
  container.appendChild(multiEl);
}

function renderResults(container: HTMLElement, results: SummonResultEntry[]): void {
  const fragment = document.createDocumentFragment();
  for (const result of results) {
    const item = document.createElement('div');
    item.className = 'result-entry';

   const rarity = document.createElement('span');
    rarity.className = 'result-entry__rarity';
    rarity.textContent = result.rarity;

    const name = document.createElement('span');
    name.className = 'result-entry__name';
    name.textContent = result.featured ? 'Rate-up' : 'Thường';

    item.append(rarity, name);

    if (result.pity) {
      const pity = document.createElement('span');
      pity.className = 'result-entry__pity';
      pity.textContent = result.pity;
      item.appendChild(pity);
    }

    fragment.appendChild(item);
  }
  container.replaceChildren(fragment);
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

export async function mountGachaUI(scope: HTMLElement | Document | null = null) {
  const hostElement: HTMLElement | null =
    scope instanceof Document ? scope.body : scope ?? document.body;

  if (!hostElement) {
    throw new Error('Không tìm thấy vùng mount cho gacha UI.');
  }

  const isBodyHost = hostElement === document.body;
  const preservedChildren: ChildNode[] = Array.from(hostElement.childNodes);

  if (isBodyHost) {
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
          <button class="rules-button" type="button">Quy Tắc</button>
          </header>
        <section class="banner-panel" aria-label="Thông tin banner">
          <section class="banner-panel__art" data-slot="hero-art"></section>
          <section class="banner-panel__rates" data-slot="rates"></section>
        </section>
        <section class="banner-panel__featured" aria-label="Nhân vật rate-up" data-slot="featured"></section>
        <section class="banner-panel__pity" aria-label="Pity" data-slot="pity"></section>
        <section class="banner-panel__cost" aria-label="Chi phí triệu hồi" data-slot="cost"></section>
        <footer class="banner-panel__actions">
          <button type="button" data-action="summon-x1">Triệu hồi x1</button>
          <button type="button" data-action="summon-x10">Triệu hồi x10</button>
        </footer>
        <section class="banner-panel__results" aria-label="Kết quả triệu hồi" data-slot="results"></section>
      </main>
      <aside class="currency-mini-hub" aria-label="Ví tiền tệ gacha">
        <div class="currency-bar" data-slot="currencies"></div>
      </aside>
    </div>
  `;

  hostElement.appendChild(container);

  const state: GachaUIState = {
    wallet: createWallet(createNormalizedWallet(getSharedCurrencyWallet())),
    bannerId: GACHA_CONFIG.banners[0]?.id ?? 'permanent',
    states: new Map(),
  };
  syncSharedCurrencyWallet(state.wallet, { merge: true });

  const currencySlot = container.querySelector<HTMLElement>('[data-slot="currencies"]');
  const bannerList = container.querySelector<HTMLElement>('[data-slot="banner-list"]');
  const titleSlot = container.querySelector<HTMLElement>('[data-slot="hero-title"]');
  const subtitleSlot = container.querySelector<HTMLElement>('[data-slot="hero-subtitle"]');
  const timerSlot = container.querySelector<HTMLElement>('[data-slot="hero-timer"]');
  const artSlot = container.querySelector<HTMLElement>('[data-slot="hero-art"]');
  const ratesSlot = container.querySelector<HTMLElement>('[data-slot="rates"]');
  const pitySlot = container.querySelector<HTMLElement>('[data-slot="pity"]');
  const featuredSlot = container.querySelector<HTMLElement>('[data-slot="featured"]');
  const costSlot = container.querySelector<HTMLElement>('[data-slot="cost"]');
  const resultsSlot = container.querySelector<HTMLElement>('[data-slot="results"]');
  const rulesButton = container.querySelector<HTMLButtonElement>('.rules-button');
  const summonOne = container.querySelector<HTMLButtonElement>('[data-action="summon-x1"]');
  const summonTen = container.querySelector<HTMLButtonElement>('[data-action="summon-x10"]');

  if (!currencySlot || !bannerList || !titleSlot || !subtitleSlot || !timerSlot || !artSlot || !ratesSlot || !pitySlot || !featuredSlot || !costSlot || !resultsSlot || !rulesButton || !summonOne || !summonTen) {
    throw new Error('Thiếu phần tử UI cần thiết.');
  }

  let lastBannerRenderId = '';
  let closeCurrencyTooltip: () => void = () => {};

  const openCurrencyTooltip = (code: CurrencyCode, target: HTMLElement) => {
    closeCurrencyTooltip();
    const tooltip = document.createElement('div');
    tooltip.className = 'currency-mini-tooltip';
    tooltip.setAttribute('role', 'tooltip');
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
      artSlot.innerHTML = banner.background ? `<img src="${banner.background}" alt="${banner.label}" />` : '';
      renderRates(ratesSlot, banner);
      renderFeatured(featuredSlot, banner);
      renderCosts(costSlot, banner);
      lastBannerRenderId = banner.id;
    }

    renderPity(pitySlot, banner, state.states);
  };

  const openRules = () => {
    closeCurrencyTooltip();
    const rulesContent = createRulesContent();
    openModal(container, rulesContent);
  };

  const renderWallet = () => {
    renderCurrencyHeader(currencySlot, state.wallet, openCurrencyTooltip);
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
    const results: SummonResultEntry[] = [];
    const rolls = count === 10 ? multiRoll(banner, state.states, 10) : [rollBanner(banner, state.states)];
    for (const roll of rolls) {
      results.push({
        rarity: roll.outcome.rarity,
        featured: roll.outcome.featured,
        pity: roll.outcome.pityTriggered === 'hard' ? 'Hard pity' : roll.outcome.pityTriggered === 'soft' ? 'Soft pity' : roll.outcome.pityTriggered === 'srFloor' ? 'SR floor' : null,
      });
    }
    renderResults(resultsSlot, results);
    renderPity(pitySlot, banner, state.states);
    const paymentNotice = formatPaymentConversionNotice(payment);
    if (paymentNotice) {
      container.appendChild(createToast(paymentNotice));
    }
    const toast = createToast(`Đã triệu hồi ${count} lần.`);
    container.appendChild(toast);
  };

  rulesButton.addEventListener('click', openRules);
  summonOne.addEventListener('click', () => performSummon(1));
  summonTen.addEventListener('click', () => performSummon(10));

  renderAll();

  let destroyed = false;

  return {
    destroy() {
      if (destroyed) {
        return;
      }
      destroyed = true;
      closeCurrencyTooltip();
      unsubscribeSharedWallet();
      if (isBodyHost) {
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