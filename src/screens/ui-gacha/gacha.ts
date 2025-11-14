import { CURRENCY_LABELS, createWallet, GACHA_CONFIG } from './logic/config.ts';
import { payForRoll } from './logic/currency.ts';
import { getBannerById, multiRoll, rollBanner } from './logic/gacha.ts';
import { getBannerState } from './logic/pity.ts';
import {
  type BannerDefinition,
  type BannerStateMap,
  CURRENCY_ORDER,
  type CurrencyCode,
  type Wallet,
} from './logic/types.ts';

const NUMBER_FORMAT = new Intl.NumberFormat('vi-VN');
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

function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(Math.max(0, Math.trunc(value)));
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

function renderWalletChip(code: CurrencyCode, amount: number): HTMLElement {
  const chip = document.createElement('button');
  chip.className = 'currency-chip';
  chip.type = 'button';
  chip.dataset.currency = code;
  chip.title = 'Nhấn để xem quy tắc & thuế đổi';
  chip.innerHTML = `
    <span class="currency-chip__icon"><img src="${CURRENCY_ICONS[code]}" alt="${code}" /></span>
    <span class="currency-chip__info">
      <span class="currency-chip__code">${code}</span>
      <span class="currency-chip__label">${CURRENCY_LABELS[code]}</span>
    </span>
    <span class="currency-chip__value">${formatNumber(amount)}</span>
  `;
  return chip;
}

function renderCurrencyHeader(container: HTMLElement, wallet: Wallet, onOpenRules: () => void): void {
  container.replaceChildren();
  for (const code of CURRENCY_ORDER) {
    const chip = renderWalletChip(code, wallet[code]);
    chip.addEventListener('click', onOpenRules);
    container.appendChild(chip);
  }
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
  container.replaceChildren();
  for (const banner of banners) {
    const button = createBannerButton(banner, banner.id === activeId);
    button.addEventListener('click', () => onSelect(banner.id));
    container.appendChild(button);
  }
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

function renderPity(container: HTMLElement, banner: BannerDefinition, states: BannerStateMap): void {
  container.replaceChildren();
  const state = getBannerState(states, banner);
  const sections: Array<{ label: string; value: number; max: number | null }> = [
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

  for (const entry of sections) {
    const item = document.createElement('div');
    item.className = 'pity-meter';
    const label = document.createElement('span');
    label.className = 'pity-meter__label';
    label.textContent = entry.label;
    const bar = document.createElement('div');
    bar.className = 'pity-meter__bar';
    const progress = document.createElement('div');
    progress.className = 'pity-meter__progress';
    let percent = 0;
    if (entry.max && entry.max > 0) {
      percent = Math.min(99, Math.floor((entry.value / entry.max) * 100));
    }
    progress.style.width = `${percent}%`;
    bar.appendChild(progress);
    const value = document.createElement('span');
    value.className = 'pity-meter__value';
    value.textContent = entry.max ? `${entry.value}/${entry.max}` : `${entry.value}`;
    item.appendChild(label);
    item.appendChild(bar);
    item.appendChild(value);
    container.appendChild(item);
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
  for (const unit of banner.featured) {
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
    <h2>Quy tắc & Thuế đổi</h2>
    <p>100 đơn vị bậc thấp = 1 đơn vị bậc cao. Thuế tối đa 10% khi đổi lên, không thuế khi đổi xuống.</p>
    <p>Thuế tăng dần theo bậc và độ giàu, nhưng miễn thuế nếu đổi &lt; 100 đơn vị.</p>
    <ul>
      <li>VNT → HNT: thuế gốc 0.5%</li>
      <li>HNT → TNT: thuế gốc 1.0%</li>
      <li>TNT → ThNT: thuế gốc 1.5%</li>
      <li>TT chỉ đổi xuống, không thuế.</li>
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
  container.replaceChildren();
  for (const result of results) {
    const item = document.createElement('div');
    item.className = 'result-entry';
    const pityLabel = result.pity ? `<span class="result-entry__pity">${result.pity}</span>` : '';
    item.innerHTML = `
      <span class="result-entry__rarity">${result.rarity}</span>
      <span class="result-entry__name">${result.featured ? 'Rate-up' : 'Thường'}</span>
      ${pityLabel}
    `;
    container.appendChild(item);
  }
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
  container.className = 'gacha-ui-root';
  container.innerHTML = `
    <div class="gacha-header">
      <div class="currency-bar" data-slot="currencies"></div>
      <button class="rules-button" type="button">Quy tắc &amp; Thuế</button>
    </div>
    <div class="gacha-body">
      <aside class="banner-sidebar" data-slot="banner-list"></aside>
      <main class="banner-panel">
        <header class="banner-panel__header">
          <div>
            <h1 class="banner-title" data-slot="hero-title"></h1>
            <p class="banner-desc" data-slot="hero-subtitle"></p>
          </div>
          <span class="banner-timer" data-slot="hero-timer"></span>
        </header>
        <section class="banner-panel__art" data-slot="hero-art"></section>
        <section class="banner-panel__rates" data-slot="rates"></section>
        <section class="banner-panel__pity" data-slot="pity"></section>
        <section class="banner-panel__featured" data-slot="featured"></section>
        <section class="banner-panel__cost" data-slot="cost"></section>
        <footer class="banner-panel__actions">
          <button type="button" data-action="summon-x1">Triệu hồi x1</button>
          <button type="button" data-action="summon-x10">Triệu hồi x10</button>
        </footer>
        <section class="banner-panel__results" data-slot="results"></section>
      </main>
    </div>
  `;

  hostElement.appendChild(container);

  const state: GachaUIState = {
    wallet: createWallet(),
    bannerId: GACHA_CONFIG.banners[0]?.id ?? 'permanent',
    states: new Map(),
  };

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

  const renderBanner = () => {
    const banner = getBannerById(state.bannerId) ?? GACHA_CONFIG.banners[0];
    if (!banner) return;
    titleSlot.textContent = banner.label;
    subtitleSlot.textContent = banner.description ?? '';
    timerSlot.textContent = formatRemainingTime(banner);
    artSlot.innerHTML = banner.background ? `<img src="${banner.background}" alt="${banner.label}" />` : '';
    renderRates(ratesSlot, banner);
    renderPity(pitySlot, banner, state.states);
    renderFeatured(featuredSlot, banner);
    renderCosts(costSlot, banner);
  };

  const openRules = () => {
    const rulesContent = createRulesContent();
    openModal(container, rulesContent);
  };

  const renderWallet = () => {
    renderCurrencyHeader(currencySlot, state.wallet, openRules);
  };

  const updateBannerList = () => {
    renderBannerList(bannerList, GACHA_CONFIG.banners, state.bannerId, (id) => {
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

  const performSummon = (count: number) => {
    const banner = getBannerById(state.bannerId);
    if (!banner) {
      return;
    }
    const cost = count === 10 ? banner.cost.x10 : banner.cost.x1;
    const payment = payForRoll(state.wallet, banner.cost.unit, cost);
    if (!payment.ok) {
      const toast = createToast('Không đủ tiền tệ sau khi auto-convert.');
      container.appendChild(toast);
      return;
    }
    state.wallet = payment.wallet;
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