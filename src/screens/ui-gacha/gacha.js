const { renderGachaView } = window.__require('./screens/gacha/view.ts');

const DEFAULT_CURRENCIES = [
  { id: 'gem', name: 'Tinh Thạch', icon: 'assets/gem.svg', amount: 12345 },
  { id: 'ticket', name: 'Vé Triệu Hồi', icon: 'assets/ticket.svg', amount: 7 },
  { id: 'coin', name: 'Đồng Vận', icon: 'assets/coin.svg', amount: 99800 },
  { id: 'dust', name: 'Bụi Hư Ảnh', icon: 'assets/dust.svg', amount: 420 },
  { id: 'key', name: 'Chìa Khoá Sự Kiện', icon: 'assets/key.svg', amount: 1 },
];

const RANKS = ['N', 'R', 'SR', 'SSR', 'UR', 'Prime'];

const DEFAULT_BANNERS = [
  {
    id: 'SSR',
    type: 'standard',
    name: 'Triệu Hồi Chuẩn',
    subtitle: 'Chỉ xuất hiện N / R / SR / SSR',
    closesIn: '--',
    heroArt: 'assets/banner_standard.svg',
    thumbnail: 'assets/banner_standard.svg',
    featured: [],
    rates: { N: 60, R: 25, SR: 12, SSR: 3, UR: 0, Prime: 0 },
    pity: {
      soft: null,
      hard: { SSR: 80 },
      carryOverPerBanner: true,
    },
    cost: {
      single: { currency: 'ticket', amount: 1, fallback: { currency: 'gem', amount: 250 } },
      multi: { currency: 'ticket', amount: 10, fallback: { currency: 'gem', amount: 2500 } },
    },
  },
  {
    id: 'UR',
    type: 'limited',
    name: 'Giới Hạn: Huyễn Long',
    subtitle: "Selected Partners' Summon Rate UP",
    closesIn: '6d 23h',
    heroArt: 'assets/banner_dragon.svg',
    thumbnail: 'assets/banner_dragon.svg',
    featured: [
      { id: 'unit-aurora', name: 'Aurora', rank: 'UR', portrait: 'assets/u_aurora.svg' },
      { id: 'unit-veil', name: 'Veil', rank: 'SSR', portrait: 'assets/u_veil.svg' },
    ],
    rates: { N: 55, R: 23, SR: 12, SSR: 7.5, UR: 2.2, Prime: 0.3 },
    pity: {
      soft: { UR: 65 },
      hard: { UR: 90, Prime: 200 },
      carryOverPerBanner: false,
    },
    cost: {
      single: { currency: 'gem', amount: 250 },
      multi: { currency: 'gem', amount: 2500 },
    },
  },
  {
    id: 'Prime',
    type: 'limited',
    name: 'Giới Hạn: Hư Chủ',
    subtitle: 'Prime focus',
    closesIn: '3d 12h',
    heroArt: 'assets/banner_void.svg',
    thumbnail: 'assets/banner_void.svg',
    featured: [{ id: 'unit-void-lord', name: 'Hư Chủ', rank: 'Prime', portrait: 'assets/u_void.svg' }],
    rates: { N: 54, R: 24, SR: 12, SSR: 8.5, UR: 1.0, Prime: 0.5 },
    pity: {
      soft: { UR: 60 },
      hard: { UR: 90, Prime: 180 },
      carryOverPerBanner: false,
    },
    cost: {
      single: { currency: 'key', amount: 1, fallback: { currency: 'gem', amount: 300 } },
      multi: { currency: 'key', amount: 10, fallback: { currency: 'gem', amount: 3000 } },
    },
  },
];

const CURRENCY_ICON_MAP = {
  TT: 'assets/gem.svg',
  THUONG: 'assets/ticket.svg',
  TRUNG: 'assets/coin.svg',
  HA: 'assets/key.svg',
  VUN: 'assets/dust.svg',
};

const CURRENCY_FALLBACK_ID = {
  TT: 'gem',
  THUONG: 'ticket',
  TRUNG: 'coin',
  HA: 'dust',
  VUN: 'key',
  THANH_TINH: 'gem',
};

let CURRENCIES = cloneDefaultCurrencies();
let BANNERS = cloneDefaultBanners();

const DEFAULT_ICON = 'assets/gem.svg';

const AURA_CLASS_BY_RANK = {
  N: 'N',
  R: 'R',
  SR: 'SR',
  SSR: 'SSR',
  UR: 'UR',
  PRIME: 'Prime',
};

function cloneDefaultCurrencies() {
  return DEFAULT_CURRENCIES.map((entry) => ({ ...entry }));
}

function cloneDefaultBanners() {
  return DEFAULT_BANNERS.map((entry) => ({
    ...entry,
    featured: Array.isArray(entry.featured) ? entry.featured.map((unit) => ({ ...unit })) : [],
    cost: entry.cost
      ? {
          single: entry.cost.single ? { ...entry.cost.single, fallback: entry.cost.single.fallback ? { ...entry.cost.single.fallback } : undefined } : null,
          multi: entry.cost.multi ? { ...entry.cost.multi, fallback: entry.cost.multi.fallback ? { ...entry.cost.multi.fallback } : undefined } : null,
        }
      : null,
    pity: entry.pity
      ? {
          soft: entry.pity.soft ? { ...entry.pity.soft } : entry.pity.soft,
          hard: entry.pity.hard ? { ...entry.pity.hard } : entry.pity.hard,
          carryOverPerBanner: entry.pity.carryOverPerBanner,
        }
      : null,
  }));
}

function warnConfig(path, message) {
  const detail = message ? ` (${message})` : '';
  console.warn(`[Gacha Config] Thiếu hoặc lỗi dữ liệu tại "${path}"${detail}. Dùng giá trị mặc định.`);
}

function toPercent(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return Math.round(value * 10000) / 100;
}

function mapCurrencyIcon(code, fallbackIcon) {
  if (!code) {
    return fallbackIcon ?? DEFAULT_ICON;
  }
  return CURRENCY_ICON_MAP[code] ?? fallbackIcon ?? DEFAULT_ICON;
}

function buildCurrenciesFromConfig(config) {
  const currenciesConfig = config?.economy?.currencies;
  if (!currenciesConfig || typeof currenciesConfig !== 'object') {
    warnConfig('economy.currencies');
    return cloneDefaultCurrencies();
  }

  const defaultsById = new Map(DEFAULT_CURRENCIES.map((currency) => [currency.id, currency]));
  const result = Object.entries(currenciesConfig).map(([key, currencyConfig]) => {
    const code = currencyConfig?.code ?? key;
    if (!currencyConfig?.code) {
      warnConfig(`economy.currencies.${key}.code`);
    }
    const fallbackId = CURRENCY_FALLBACK_ID[code] ?? CURRENCY_FALLBACK_ID[key] ?? code;
    const fallback = defaultsById.get(code) ?? defaultsById.get(fallbackId) ?? defaultsById.get(key) ?? null;
    const name = currencyConfig?.name ?? fallback?.name ?? key;
    if (!currencyConfig?.name) {
      warnConfig(`economy.currencies.${key}.name`);
    }
    const icon = mapCurrencyIcon(code, fallback?.icon);
    const amount = fallback?.amount ?? 0;
    return {
      id: code,
      name,
      icon,
      amount,
      tier: currencyConfig?.tier ?? fallback?.tier ?? null,
    };
  });

  result.sort((a, b) => (b.tier ?? 0) - (a.tier ?? 0));
  return result.slice(0, 5);
}

function isValidCostEntry(entry) {
  return entry && typeof entry.currency === 'string' && typeof entry.amount === 'number';
}

function mapCost(entries, fallbackCost, path) {
  if (!Array.isArray(entries) || entries.length === 0) {
    if (path) {
      warnConfig(path, 'thiếu danh sách giá');
    }
    return fallbackCost ? { ...fallbackCost, fallback: fallbackCost.fallback ? { ...fallbackCost.fallback } : undefined } : null;
  }

  const [primary, secondary] = entries;
  if (!isValidCostEntry(primary)) {
    warnConfig(path ? `${path}[0]` : 'cost', 'thiếu currency hoặc amount');
    return fallbackCost ? { ...fallbackCost, fallback: fallbackCost.fallback ? { ...fallbackCost.fallback } : undefined } : null;
  }

  const cost = {
    currency: primary.currency,
    amount: primary.amount,
  };

  if (isValidCostEntry(secondary)) {
    cost.fallback = {
      currency: secondary.currency,
      amount: secondary.amount,
    };
  } else if (fallbackCost?.fallback) {
    cost.fallback = { ...fallbackCost.fallback };
  }

  return cost;
}

function mapPity(configPity, configRateUpRule, fallbackPity, bannerId) {
  const fallbackSoft = fallbackPity?.soft ? { ...fallbackPity.soft } : null;
  const fallbackHard = fallbackPity?.hard ? { ...fallbackPity.hard } : null;
  const fallbackSoftKeys = fallbackSoft ? Object.keys(fallbackSoft) : [];
  const fallbackHardKeys = fallbackHard ? Object.keys(fallbackHard) : [];
  const targetRarity = configRateUpRule?.onHitRarity ?? fallbackHardKeys[0] ?? fallbackSoftKeys[0] ?? bannerId;

  let soft = fallbackSoft;
  if (configPity?.softPity?.startAtPull) {
    const key = configRateUpRule?.onHitRarity ?? fallbackSoftKeys[0] ?? targetRarity;
    soft = { ...(soft ?? {}), [key]: configPity.softPity.startAtPull };
  }

  let hard = fallbackHard;
  if (typeof configPity?.hardPity === 'number') {
    hard = { ...(hard ?? {}), [targetRarity]: configPity.hardPity };
  }

  return {
    soft: soft ?? null,
    hard: hard ?? null,
    carryOverPerBanner: fallbackPity?.carryOverPerBanner ?? false,
  };
}

function buildRates(baseRates, fallbackRates) {
  const result = { ...fallbackRates };
  if (!baseRates || typeof baseRates !== 'object') {
    return result;
  }

  RANKS.forEach((rank) => {
    const value = toPercent(baseRates[rank]);
    if (value === null) {
      return;
    }
    result[rank] = value;
  });
  return result;
}

function mergeBannerWithConfig(bannerId, bannerConfig, fallback, baseRates) {
  const rates = buildRates(baseRates, fallback.rates);
  const pity = mapPity(
    { softPity: bannerConfig?.softPity, hardPity: bannerConfig?.hardPity },
    bannerConfig?.rateUpRule,
    fallback.pity,
    bannerId,
  );

  const singleCost = mapCost(bannerConfig?.costPerPull, fallback.cost?.single, `gacha.banners.${bannerId}.costPerPull`);
  const multiCost = mapCost(bannerConfig?.bundle10, fallback.cost?.multi, `gacha.banners.${bannerId}.bundle10`);

  return {
    id: bannerId,
    type: fallback.type,
    name: fallback.name,
    subtitle: fallback.subtitle,
    closesIn: fallback.closesIn,
    heroArt: fallback.heroArt,
    thumbnail: fallback.thumbnail,
    featured: Array.isArray(fallback.featured) ? fallback.featured.map((unit) => ({ ...unit })) : [],
    rates,
    pity,
    cost: {
      single: singleCost,
      multi: multiCost,
    },
  };
}

function buildBannersFromConfig(config) {
  const bannersConfig = config?.gacha?.banners;
  if (!bannersConfig || typeof bannersConfig !== 'object') {
    warnConfig('gacha.banners');
    return cloneDefaultBanners();
  }

  const baseRates = config?.gacha?.rarityRatesBase;
  const defaults = cloneDefaultBanners();
  const defaultsById = new Map(DEFAULT_BANNERS.map((banner) => [banner.id, banner]));

  const merged = defaults.map((fallback) => {
    const bannerConfig = bannersConfig[fallback.id];
    if (!bannerConfig) {
      warnConfig(`gacha.banners.${fallback.id}`, 'không tìm thấy cấu hình, giữ mặc định');
      return fallback;
    }
    return mergeBannerWithConfig(fallback.id, bannerConfig, fallback, baseRates);
  });

  Object.entries(bannersConfig).forEach(([bannerId, bannerConfig]) => {
    if (merged.some((banner) => banner.id === bannerId)) {
      return;
    }
    warnConfig(`gacha.banners.${bannerId}`, 'không có fallback UI, sử dụng cấu hình chuẩn');
    const fallback = defaultsById.get('SSR') ?? DEFAULT_BANNERS[0];
    merged.push(mergeBannerWithConfig(bannerId, bannerConfig, fallback, baseRates));
  });

  return merged;
}

async function loadEconomyFromConfig() {
  try {
    const response = await fetch('./gacha_config_v1.3.0.json', { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return {
      currencies: buildCurrenciesFromConfig(data),
      banners: buildBannersFromConfig(data),
    };
  } catch (error) {
    console.warn('[Gacha Config] Không thể tải gacha_config_v1.3.0.json:', error);
    return {
      currencies: cloneDefaultCurrencies(),
      banners: cloneDefaultBanners(),
    };
  }
}

const elements = {
  app: document.querySelector('[data-app-root]'),
  currencyHeader: document.querySelector('[data-slot="currencies"]'),
  bannerList: document.querySelector('[data-slot="banner-list"]'),
  hero: document.querySelector('[data-slot="hero"]'),
  heroBackground: document.querySelector('.hero__background'),
  heroType: document.querySelector('[data-slot="hero-type"]'),
  heroTitle: document.querySelector('[data-slot="hero-title"]'),
  heroSubtitle: document.querySelector('[data-slot="hero-subtitle"]'),
  heroRateUp: document.querySelector('[data-slot="hero-rateup"]'),
  heroTimer: document.querySelector('[data-slot="hero-timer"]'),
  pityPills: document.querySelector('[data-slot="pity-pills"]'),
  featuredList: document.querySelector('[data-slot="featured-list"]'),
  detailsButtons: document.querySelectorAll('[data-action="open-rates"]'),
  ctaSingle: document.querySelector('[data-action="summon-single"]'),
  ctaMulti: document.querySelector('[data-action="summon-multi"]'),
  confirmTitle: document.querySelector('[data-slot="confirm-title"]'),
  confirmRoot: document.querySelector('[data-gacha-root]'),
  helpButton: document.querySelector('.help-button'),
  drawerToggle: document.querySelector('[data-action="toggle-drawer"]'),
};

const modals = {
  rates: document.querySelector('[data-modal="rates"]'),
  confirm: document.querySelector('[data-modal="confirm"]'),
};

const panels = {
  rates: modals.rates.querySelector('[data-panel="rates"]'),
  pity: modals.rates.querySelector('[data-panel="pity"]'),
  featured: modals.rates.querySelector('[data-panel="featured"]'),
};

const tabs = Array.from(modals.rates.querySelectorAll('.modal__tabs [role="tab"]'));

let state = {
  selectedBannerId: BANNERS[0]?.id ?? null,
  drawerOpen: false,
};

let confirmViewHandle = null;
let currentOpenModal = null;

function getCurrencyEntry(id) {
  return CURRENCIES.find((currency) => currency.id === id) ?? null;
}

function formatNumber(value) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  return value.toLocaleString('en-US');
}

function renderCurrencies(currencies) {
  elements.currencyHeader.replaceChildren();
  currencies.forEach((currency) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'currency-item';
    item.title = currency.name;
    item.setAttribute('aria-label', `${currency.name}: ${formatNumber(currency.amount)}`);
    item.dataset.currencyId = currency.id;

    const icon = document.createElement('span');
    icon.className = 'currency-item__icon';
    const img = document.createElement('img');
    img.src = currency.icon;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    icon.appendChild(img);

    const text = document.createElement('div');
    text.className = 'currency-item__text';
    const label = document.createElement('span');
    label.className = 'currency-item__label';
    label.textContent = getCurrencyShortName(currency);
    const amount = document.createElement('span');
    amount.className = 'currency-item__amount';
    amount.textContent = formatNumber(currency.amount);

    text.appendChild(label);
    text.appendChild(amount);

    item.appendChild(icon);
    item.appendChild(text);
    elements.currencyHeader.appendChild(item);
  });
}

function bannerTypeLabel(banner) {
  if (banner.type === 'limited') {
    return 'Limited Banner';
  }
  return 'Standard Banner';
}

function getCurrencyShortName(currency) {
  if (!currency?.name) {
    return currency?.id ?? '';
  }
  const parts = currency.name.split(' ');
  if (parts.length === 1) {
    return currency.name;
  }
  const short = parts[0];
  return short.length <= 8 ? short : currency.name;
}

function hasRateUpUnits(banner) {
  return Array.isArray(banner?.featured) && banner.featured.length > 0;
}

function getRateUpSummary(banner) {
  if (!hasRateUpUnits(banner)) {
    return null;
  }
  const names = banner.featured.map((unit) => unit?.name).filter(Boolean);
  if (names.length === 0) {
    return null;
  }
  if (names.length === 1) {
    return names[0];
  }
  return names.slice(0, 2).join(' • ') + (names.length > 2 ? '…' : '');
}

function formatBannerTimer(banner, options = {}) {
  const { short = false } = options;
  if (!banner) {
    return '';
  }
  if (banner.type !== 'limited') {
    return short ? '' : 'Gacha sẽ đóng: Không giới hạn';
  }
  const closesIn = typeof banner.closesIn === 'string' ? banner.closesIn.trim() : '';
  if (!closesIn || closesIn === '--') {
    return short ? 'Đang cập nhật' : 'Gacha sẽ đóng: Đang cập nhật';
  }
  return short ? closesIn : `Gacha sẽ đóng ${closesIn}`;
}

function getBannerAuraClass(banner) {
  const baseRank = banner?.featured?.[0]?.rank ?? (banner?.type === 'limited' ? 'UR' : 'SR');
  if (typeof baseRank !== 'string') {
    return 'SR';
  }
  const normalized = baseRank.trim().toUpperCase();
  return AURA_CLASS_BY_RANK[normalized] ?? 'SR';
}

function renderBannerList(banners) {
  elements.bannerList.replaceChildren();
  banners.forEach((banner) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'banner-card';
    card.dataset.bannerId = banner.id;
    card.title = banner.name;
    card.setAttribute('aria-pressed', 'false');

    const thumb = document.createElement('div');
    thumb.className = `banner-card__thumb aura aura--${getBannerAuraClass(banner)}`;
    const img = document.createElement('img');
    img.src = banner.thumbnail ?? banner.heroArt ?? 'assets/banner_standard.svg';
    img.alt = `Hình minh hoạ ${banner.name}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    thumb.appendChild(img);

    const texts = document.createElement('div');
    texts.className = 'banner-card__texts';

    const tag = document.createElement('span');
    tag.className = 'banner-card__tag';
    tag.textContent = banner.type === 'limited' ? 'Limited' : 'Standard';

    const name = document.createElement('h3');
    name.className = 'banner-card__name';
    name.textContent = banner.name;

    const subtitle = document.createElement('p');
    subtitle.className = 'banner-card__subtitle';
    const rateUpSummary = getRateUpSummary(banner);
    if (banner.subtitle) {
      subtitle.textContent = banner.subtitle;
    } else if (rateUpSummary) {
      subtitle.textContent = `Rate UP: ${rateUpSummary}`;
    } else {
      subtitle.textContent = banner.type === 'limited' ? 'Không có rate-up cụ thể' : '';
    }
    if (!subtitle.textContent.trim()) {
      subtitle.classList.add('is-empty');
      subtitle.setAttribute('aria-hidden', 'true');
    }

    texts.appendChild(tag);
    texts.appendChild(name);
    texts.appendChild(subtitle);

    card.appendChild(thumb);
    card.appendChild(texts);

    if (hasRateUpUnits(banner)) {
      const badge = document.createElement('span');
      badge.className = 'banner-card__badge';
      badge.textContent = `Rate UP ×${banner.featured.length}`;
      badge.setAttribute('aria-hidden', 'true');
      card.appendChild(badge);
    }

    const timerText = formatBannerTimer(banner, { short: true });
    if (timerText) {
      const timer = document.createElement('span');
      timer.className = 'banner-card__timer';
      timer.textContent = timerText;
      timer.setAttribute('aria-label', formatBannerTimer(banner));
      card.appendChild(timer);
    }

    card.addEventListener('click', () => {
      selectBanner(banner.id, { focus: false });
      if (state.drawerOpen) {
        toggleDrawer(false);
      }
    });

    elements.bannerList.appendChild(card);
  });
}

function selectBanner(id, options = { focus: true }) {
  const banner = BANNERS.find((entry) => entry.id === id) ?? BANNERS[0];
  state = { ...state, selectedBannerId: banner.id };
  updateBannerSelection();
  updateHeroSection(banner);
  updateCTASection(banner);
  populateRatesModal(banner);
  if (options.focus) {
    const selectedCard = elements.bannerList.querySelector(`[data-banner-id="${banner.id}"]`);
    selectedCard?.focus();
  }
}

function updateBannerSelection() {
  const cards = elements.bannerList.querySelectorAll('.banner-card');
  cards.forEach((card) => {
    if (card.dataset.bannerId === state.selectedBannerId) {
      card.classList.add('banner-card--selected');
      card.setAttribute('aria-pressed', 'true');
    } else {
      card.classList.remove('banner-card--selected');
      card.setAttribute('aria-pressed', 'false');
    }
  });
}

function updateHeroSection(banner) {
  elements.heroType.textContent = bannerTypeLabel(banner);
  elements.heroTitle.textContent = banner.name;
  elements.heroSubtitle.textContent = banner.subtitle ?? '';
  elements.heroBackground.style.backgroundImage = `url("${banner.heroArt}")`;

  const heroTimerText = formatBannerTimer(banner);
  if (heroTimerText) {
    elements.heroTimer.textContent = heroTimerText;
    elements.heroTimer.style.display = 'inline-flex';
  } else {
    elements.heroTimer.textContent = '';
    elements.heroTimer.style.display = 'none';
  }

  if (hasRateUpUnits(banner)) {
    elements.heroRateUp.classList.add('is-visible');
    const summary = getRateUpSummary(banner);
    const label = summary ? `Rate UP: ${summary}` : 'Banner có nhân vật được tăng tỉ lệ';
    elements.heroRateUp.textContent = label;
    elements.heroRateUp.setAttribute('title', label);
    elements.heroRateUp.setAttribute('aria-label', label);
  } else {
    elements.heroRateUp.classList.remove('is-visible');
    elements.heroRateUp.textContent = 'Rate UP';
    elements.heroRateUp.removeAttribute('title');
    elements.heroRateUp.removeAttribute('aria-label');
  }

  renderPityPills(banner);
  renderFeatured(banner);
}

function renderPityPills(banner) {
  elements.pityPills.replaceChildren();
  const { soft, hard } = banner.pity;
  if (soft) {
    Object.entries(soft).forEach(([rank, value]) => {
      elements.pityPills.appendChild(createPityPill(rank, value, 'Soft pity'));
    });
  }
  if (hard) {
    Object.entries(hard).forEach(([rank, value]) => {
      elements.pityPills.appendChild(createPityPill(rank, value, 'Hard pity'));
    });
  }
  if (!elements.pityPills.childElementCount) {
    const pill = document.createElement('span');
    pill.className = 'pity-pill';
    pill.textContent = 'Không có bảo hiểm đặc biệt';
    elements.pityPills.appendChild(pill);
  }
}

function createPityPill(rank, value, kind) {
  const pill = document.createElement('span');
  pill.className = 'pity-pill';
  pill.dataset.rank = rank;

  const label = document.createElement('span');
  label.className = 'pity-pill__label';
  label.textContent = `${kind}`;

  const text = document.createElement('span');
  text.textContent = `${rank}: ${value}`;

  pill.appendChild(label);
  pill.appendChild(text);
  return pill;
}

function renderFeatured(banner) {
  elements.featuredList.replaceChildren();
  if (!banner.featured || banner.featured.length === 0) {
    const placeholder = document.createElement('p');
    placeholder.className = 'featured__empty';
    placeholder.textContent = 'Không có đối tác rate-up cụ thể.';
    elements.featuredList.appendChild(placeholder);
    return;
  }

  banner.featured.slice(0, 3).forEach((unit) => {
    const card = document.createElement('article');
    card.className = `featured-card aura aura--${unit.rank ?? 'SSR'}`;
    card.tabIndex = 0;
    card.title = `${unit.name} — ${unit.rank}`;

    const chip = document.createElement('span');
    chip.className = 'rank-chip';
    chip.textContent = unit.rank;
    card.appendChild(chip);

    const art = document.createElement('div');
    art.className = 'featured-card__art';
    const img = document.createElement('img');
    img.src = unit.portrait;
    img.alt = unit.name;
    art.appendChild(img);

    const footer = document.createElement('div');
    footer.className = 'featured-card__footer';
    footer.textContent = unit.name;

    card.appendChild(art);
    card.appendChild(footer);
    elements.featuredList.appendChild(card);
  });
}

function hasEnoughCurrency(cost) {
  const primary = getCurrencyEntry(cost.currency);
  const primaryEnough = primary ? primary.amount >= cost.amount : false;
  if (primaryEnough) {
    return { enough: true, via: primary, useFallback: false };
  }
  if (cost.fallback) {
    const fallback = getCurrencyEntry(cost.fallback.currency);
    const fallbackEnough = fallback ? fallback.amount >= cost.fallback.amount : false;
    if (fallbackEnough) {
      return { enough: true, via: fallback, useFallback: true };
    }
    return { enough: false, via: fallback ?? primary, useFallback: true };
  }
  return { enough: false, via: primary, useFallback: false };
}

function createCostLines(cost, button) {
  if (!cost) {
    const placeholder = document.createElement('span');
    placeholder.className = 'cta__cost-line';
    placeholder.textContent = 'Không khả dụng';
    button.appendChild(placeholder);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'cta__cost';

  const primaryLine = document.createElement('span');
  primaryLine.className = 'cta__cost-line';
  const primaryCurrency = getCurrencyEntry(cost.currency);
  if (primaryCurrency) {
    const icon = document.createElement('img');
    icon.src = primaryCurrency.icon;
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    primaryLine.appendChild(icon);
    const text = document.createElement('span');
    text.textContent = `${cost.amount.toLocaleString('en-US')} ${primaryCurrency.name}`;
    primaryLine.appendChild(text);
  } else {
    primaryLine.textContent = `${cost.amount} ${cost.currency}`;
  }
  wrapper.appendChild(primaryLine);

  if (cost.fallback) {
    const fallbackLine = document.createElement('span');
    fallbackLine.className = 'cta__cost-line cta__cost-line--fallback';
    const fallbackCurrency = getCurrencyEntry(cost.fallback.currency);
    if (fallbackCurrency) {
      fallbackLine.textContent = `hoặc ${cost.fallback.amount.toLocaleString('en-US')} ${fallbackCurrency.name}`;
    } else {
      fallbackLine.textContent = `hoặc ${cost.fallback.amount} ${cost.fallback.currency}`;
    }
    wrapper.appendChild(fallbackLine);
  }

  button.appendChild(wrapper);
}

function updateCTAButton(button, label, cost, summonType) {
  button.replaceChildren();
  const title = document.createElement('span');
  title.className = 'cta__label';
  title.textContent = label;
  button.appendChild(title);
  createCostLines(cost, button);

if (!cost) {
    button.disabled = true;
    button.classList.remove('cta__button--affordable');
    button.title = 'Tạm khoá';
    button.setAttribute('aria-disabled', 'true');
    button.dataset.summonType = summonType;
    return;
  }

  const status = hasEnoughCurrency(cost);
  button.disabled = !status.enough;
  button.classList.toggle('cta__button--affordable', status.enough);
  if (!status.enough) {
    const targetName = status.via?.name ?? (cost.fallback ? getCurrencyEntry(cost.fallback.currency)?.name : getCurrencyEntry(cost.currency)?.name);
    button.title = targetName ? `Không đủ ${targetName}` : 'Không đủ tài nguyên';
    button.setAttribute('aria-disabled', 'true');
  } else {
    button.title = '';
    button.removeAttribute('aria-disabled');
  }
  button.dataset.summonType = summonType;
}

function updateCTASection(banner) {
  updateCTAButton(elements.ctaSingle, 'Summon x1', banner.cost.single, 'single');
  updateCTAButton(elements.ctaMulti, 'Summon x10', banner.cost.multi, 'multi');
  updateCurrencyHighlight(banner);
}

function updateCurrencyHighlight(banner) {
  const summary = new Map();
  ['single', 'multi'].forEach((key) => {
    const cost = banner.cost?.[key];
    if (!cost) return;
    const info = summary.get(cost.currency) ?? { canAfford: false };
    const wallet = getCurrencyEntry(cost.currency);
    if (wallet && wallet.amount >= cost.amount) {
      info.canAfford = true;
    }
    summary.set(cost.currency, info);
  });

  elements.currencyHeader.querySelectorAll('.currency-item').forEach((item) => {
    const id = item.dataset.currencyId;
    if (!id) {
      item.classList.remove('currency-item--insufficient');
      return;
    }
    const info = summary.get(id);
    if (info && !info.canAfford) {
      item.classList.add('currency-item--insufficient');
    } else {
      item.classList.remove('currency-item--insufficient');
    }
  });
}

function populateRatesModal(banner) {
  panels.rates.replaceChildren();
  const table = document.createElement('table');
  table.className = 'rates-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  const rankHeader = document.createElement('th');
  rankHeader.textContent = 'Rank';
  const rateHeader = document.createElement('th');
  rateHeader.textContent = 'Tỉ lệ %';
  headRow.appendChild(rankHeader);
  headRow.appendChild(rateHeader);
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  RANKS.forEach((rank) => {
    const value = banner.rates?.[rank];
    if (value === undefined) return;
    if (banner.type === 'standard' && (rank === 'UR' || rank === 'Prime') && value === 0) {
      return;
    }
    const row = document.createElement('tr');
    const rankCell = document.createElement('td');
    rankCell.textContent = rank;
    const valueCell = document.createElement('td');
    valueCell.textContent = `${value}%`;
    row.appendChild(rankCell);
    row.appendChild(valueCell);
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  panels.rates.appendChild(table);

  panels.pity.replaceChildren();
  const pityList = document.createElement('div');
  pityList.className = 'pity-list';
  const { soft, hard, carryOverPerBanner } = banner.pity;
  if (soft) {
    Object.entries(soft).forEach(([rank, value]) => {
      const row = document.createElement('div');
      row.className = 'pity-list__row';
      row.textContent = `Soft pity ${rank}: ${value} lượt`;
      pityList.appendChild(row);
    });
  }
  if (hard) {
    Object.entries(hard).forEach(([rank, value]) => {
      const row = document.createElement('div');
      row.className = 'pity-list__row';
      row.textContent = `Hard pity ${rank}: ${value} lượt`;
      pityList.appendChild(row);
    });
  }
  if (!pityList.childElementCount) {
    const row = document.createElement('div');
    row.className = 'pity-list__row';
    row.textContent = 'Banner này không có hệ thống bảo hiểm đặc biệt.';
    pityList.appendChild(row);
  }
  const carry = document.createElement('div');
  carry.className = 'pity-list__carry';
  carry.textContent = carryOverPerBanner
    ? 'Tiến trình bảo hiểm được cộng dồn giữa các banner.'
    : 'Tiến trình bảo hiểm reset khi banner kết thúc.';
  pityList.appendChild(carry);
  panels.pity.appendChild(pityList);

  panels.featured.replaceChildren();
  if (banner.featured && banner.featured.length > 0) {
    const list = document.createElement('ul');
    list.className = 'featured-list';
    banner.featured.forEach((unit) => {
      const item = document.createElement('li');
      item.className = 'featured-list__item';
      const chip = document.createElement('span');
      chip.className = 'rank-chip';
      chip.textContent = unit.rank;
      const name = document.createElement('span');
      name.textContent = `${unit.name} — rate tăng`; // số cụ thể được điều chỉnh trong config nếu cần
      item.appendChild(chip);
      item.appendChild(name);
      list.appendChild(item);
    });
    panels.featured.appendChild(list);
  } else {
    const empty = document.createElement('p');
    empty.textContent = 'Không có nhân vật rate-up riêng.';
    panels.featured.appendChild(empty);
  }
  activateTab('rates');
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  currentOpenModal = modal;
  document.addEventListener('keydown', handleGlobalKeyDown);
  if (modal === modals.rates) {
    elements.helpButton?.setAttribute('aria-expanded', 'true');
  }
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  if (modal === currentOpenModal) {
    currentOpenModal = null;
    document.removeEventListener('keydown', handleGlobalKeyDown);
  }
  if (modal === modals.rates) {
    elements.helpButton?.setAttribute('aria-expanded', 'false');
  }
}

function handleGlobalKeyDown(event) {
  if (event.key === 'Escape' && currentOpenModal) {
    event.preventDefault();
    closeModal(currentOpenModal);
  }
  if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && !currentOpenModal) {
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    rotateBanner(direction);
  }
}

function rotateBanner(step) {
  if (!state.selectedBannerId) return;
  const index = BANNERS.findIndex((banner) => banner.id === state.selectedBannerId);
  const nextIndex = (index + step + BANNERS.length) % BANNERS.length;
  selectBanner(BANNERS[nextIndex].id, { focus: true });
}

function handleTabClick(event) {
  const button = event.currentTarget;
  const tab = button.dataset.tab;
  if (!tab) return;
  activateTab(tab);
}

function onClickSummon(type) {
  const banner = BANNERS.find((entry) => entry.id === state.selectedBannerId) ?? BANNERS[0];
  const amount = type === 'multi' ? 10 : 1;
  elements.confirmTitle.textContent = `${banner.name} — Summon x${amount}`;
  openModal(modals.confirm);
  renderConfirmGacha(banner, amount);
}

function renderConfirmGacha(banner, amount) {
  const cards = createMockResults(banner, amount);
  if (!confirmViewHandle) {
    confirmViewHandle = renderGachaView({
      root: elements.confirmRoot,
      title: `Kết quả mô phỏng x${amount}`,
      subtitle: banner.name,
      cards,
      onRevealDone: null,
    });
  } else {
    confirmViewHandle.updateCards(cards);
  }
}

function createMockResults(banner, amount) {
  const rarities = RANKS.filter((rank) => (banner.rates?.[rank] ?? 0) > 0);
  if (!rarities.length) {
    rarities.push('N');
  }
  const cards = [];
  const featured = Array.isArray(banner.featured) ? banner.featured : [];
  for (let index = 0; index < Math.max(10, amount); index += 1) {
    const base = featured.length > 0 ? featured[index % featured.length] : null;
    const rarity = base?.rank ?? rarities[index % rarities.length];
    cards.push({
      id: `demo-${index}`,
      name: base?.name ?? `Đơn vị ${index + 1}`,
      description: base ? `${base.name} đang được rate-up.` : 'Kết quả minh hoạ.',
      rarity,
      artwork: base?.portrait ?? null,
    });
  }
  return cards;
}

function activateTab(tabId) {
  tabs.forEach((item) => {
    const isActive = item.dataset.tab === tabId;
    item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    const panel = panels[item.dataset.tab];
    if (panel) {
      panel.toggleAttribute('hidden', !isActive);
    }
  });
}

function toggleDrawer(forceState) {
  const nextState = typeof forceState === 'boolean' ? forceState : !state.drawerOpen;
  state = { ...state, drawerOpen: nextState };
  elements.app?.setAttribute('data-drawer-open', nextState ? 'true' : 'false');
  if (nextState) {
    setTimeout(() => {
      const selected = elements.bannerList.querySelector('.banner-card--selected');
      selected?.focus();
    }, 120);
  }
}

function setupEventListeners() {
  elements.detailsButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const banner = BANNERS.find((entry) => entry.id === state.selectedBannerId) ?? BANNERS[0];
      populateRatesModal(banner);
      openModal(modals.rates);
    });
  });

  modals.rates.querySelectorAll('[data-action="close-modal"]').forEach((button) => {
    button.addEventListener('click', () => closeModal(modals.rates));
  });
  modals.confirm.querySelectorAll('[data-action="close-modal"]').forEach((button) => {
    button.addEventListener('click', () => closeModal(modals.confirm));
  });

  modals.rates.querySelector('.modal__overlay')?.addEventListener('click', () => closeModal(modals.rates));
  modals.confirm.querySelector('.modal__overlay')?.addEventListener('click', () => closeModal(modals.confirm));

  tabs.forEach((tab) => tab.addEventListener('click', handleTabClick));

  elements.ctaSingle?.addEventListener('click', () => onClickSummon('single'));
  elements.ctaMulti?.addEventListener('click', () => onClickSummon('multi'));

  elements.drawerToggle?.addEventListener('click', () => toggleDrawer());
}

async function init() {
  const { currencies, banners } = await loadEconomyFromConfig();
  CURRENCIES = currencies;
  BANNERS = banners;

  if (!state.selectedBannerId || !BANNERS.some((banner) => banner.id === state.selectedBannerId)) {
    state = { ...state, selectedBannerId: BANNERS[0]?.id ?? null };
  }

  renderCurrencies(CURRENCIES);
  renderBannerList(BANNERS);
  if (state.selectedBannerId) {
    selectBanner(state.selectedBannerId, { focus: false });
  }
  setupEventListeners();
  if (elements.helpButton) {
    const helpLabel = 'Xem tỉ lệ và bảo hiểm gacha';
    elements.helpButton.setAttribute('title', helpLabel);
    elements.helpButton.setAttribute('aria-label', helpLabel);
  }
  if (elements.drawerToggle) {
    elements.drawerToggle.setAttribute('title', 'Mở danh sách banner');
    elements.drawerToggle.setAttribute('aria-label', 'Mở danh sách banner');
  }
}

init().catch((error) => {
  console.error('[Gacha UI] Lỗi khi khởi tạo giao diện gacha:', error);
});
