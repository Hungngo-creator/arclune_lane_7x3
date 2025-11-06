const GACHA_VIEW_MODULE_ID = './screens/gacha/view.ts';

function sanitizeModuleId(moduleId) {
  return typeof moduleId === 'string' ? moduleId.replace(/\\/g, '/') : moduleId;
}

function getLegacyModuleGlobal() {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  return null;
}

function getLegacyModuleAliases() {
  const legacyGlobal = getLegacyModuleGlobal();
  const aliases = legacyGlobal && typeof legacyGlobal.__legacyModuleAliases === 'object'
    ? legacyGlobal.__legacyModuleAliases
    : null;
  return aliases;
}

function normalizeRuntimeModuleId(moduleId) {
  const sanitized = sanitizeModuleId(moduleId);
  const legacyGlobal = getLegacyModuleGlobal();
  const normalizer = legacyGlobal && typeof legacyGlobal.__normalizeModuleId === 'function'
    ? legacyGlobal.__normalizeModuleId
    : null;
  if (normalizer) {
    try {
      const normalized = normalizer(sanitized);
      if (typeof normalized === 'string' && normalized.length > 0) {
        return sanitizeModuleId(normalized);
      }
    } catch (error) {
      console.warn('[Gacha UI] Không thể dùng __normalizeModuleId:', error);
    }
  }
  const aliases = getLegacyModuleAliases();
  if (aliases) {
    const candidate = aliases[sanitized];
    if (typeof candidate === 'string' && candidate.length > 0) {
      return sanitizeModuleId(candidate);
    }
  }
  return sanitized;
}

function resolveNormalizedModuleHref(normalizedId) {
  if (typeof normalizedId !== 'string' || normalizedId.length === 0) {
    return normalizedId;
  }
  if (normalizedId.startsWith('./screens/')) {
    const relative = `../${normalizedId.slice('./screens/'.length)}`;
    return new URL(relative, import.meta.url).href;
  }
  if (normalizedId.startsWith('./')) {
    const relative = normalizedId.slice(2);
    return new URL(relative, import.meta.url).href;
  }
  return normalizedId;
}

function getRuntimeRequire() {
  if (typeof __require === 'function') {
    return __require;
  }
  const legacyGlobal = getLegacyModuleGlobal();
  if (legacyGlobal && typeof legacyGlobal.__require === 'function') {
    return legacyGlobal.__require;
  }
  if (typeof window !== 'undefined' && typeof window.__require === 'function') {
    return window.__require;
  }
  return null;
}

let gachaViewModulePromise = null;

async function loadGachaViewModule() {
  if (!gachaViewModulePromise) {
    gachaViewModulePromise = (async () => {
      const normalizedId = normalizeRuntimeModuleId(GACHA_VIEW_MODULE_ID);
      const runtimeRequire = getRuntimeRequire();
      if (runtimeRequire) {
        return runtimeRequire(normalizedId);
      }
      const href = resolveNormalizedModuleHref(normalizedId);
      return import(/* @vite-ignore */ href);
    })();
  }
  try {
    return await gachaViewModulePromise;
  } catch (error) {
    gachaViewModulePromise = null;
    throw error;
  }
}

async function resolveRenderGachaView() {
  const module = await loadGachaViewModule();
  const render = module && module.renderGachaView;
  if (typeof render !== 'function') {
    throw new Error('[Gacha UI] Module gacha view không cung cấp renderGachaView.');
  }
  return render;
}

const DEFAULT_CURRENCIES = [
  { id: 'gem', name: 'Tinh Thạch', icon: 'assets/gem.svg', amount: 12345 },
  { id: 'ticket', name: 'Vé Triệu Hồi', icon: 'assets/ticket.svg', amount: 7 },
  { id: 'coin', name: 'Đồng Vận', icon: 'assets/coin.svg', amount: 99800 },
  { id: 'dust', name: 'Bụi Hư Ảnh', icon: 'assets/dust.svg', amount: 420 },
  { id: 'key', name: 'Chìa Khoá Sự Kiện', icon: 'assets/key.svg', amount: 1 },
];

const RANKS = ['N', 'R', 'SR', 'SSR', 'UR', 'Prime'];
const RARITY_PRIORITY = [...RANKS].reverse();

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

const pityStates = new Map();

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

const AUTO_BOOT_FLAG = '__ARC_GACHA_EMBED__';

function createEmptyElements() {
  return {
    app: null,
    currencyHeader: null,
    bannerList: null,
    hero: null,
    heroBackground: null,
    heroType: null,
    heroTitle: null,
    heroSubtitle: null,
    heroRateUp: null,
    heroTimer: null,
    pityPills: null,
    pityBar: null,
    pityNote: null,
    featuredList: null,
    detailsButtons: [],
    ctaSingle: null,
    ctaMulti: null,
    confirmTitle: null,
    confirmRoot: null,
    helpButton: null,
    drawerToggle: null,
  };
}

function createEmptyModals() {
  return {
    rates: null,
    confirm: null,
  };
}

function createEmptyPanels() {
  return {
    rates: null,
    pity: null,
    featured: null,
  };
}

let currentScope = null;
let elements = createEmptyElements();
let modals = createEmptyModals();
let panels = createEmptyPanels();
let tabs = [];

let state = {
  selectedBannerId: BANNERS[0]?.id ?? null,
  drawerOpen: false,
};

let confirmViewHandle = null;
let currentOpenModal = null;
let confirmFlowCompleteHandler = null;
let trackedListeners = [];
let mounted = false;

function toQueryRoot(scope) {
  if (scope && typeof scope.querySelector === 'function') {
    return scope;
  }
  if (scope && typeof scope.getRootNode === 'function') {
    const rootNode = scope.getRootNode();
    if (rootNode && typeof rootNode.querySelector === 'function') {
      return rootNode;
    }
  }
  if (typeof document !== 'undefined') {
    return document;
  }
  return scope;
}

function captureElements(scope) {
  const root = toQueryRoot(scope);
  return {
    app: root?.querySelector?.('[data-app-root]') ?? null,
    currencyHeader: root?.querySelector?.('[data-slot="currencies"]') ?? null,
    bannerList: root?.querySelector?.('[data-slot="banner-list"]') ?? null,
    hero: root?.querySelector?.('[data-slot="hero"]') ?? null,
    heroBackground: root?.querySelector?.('.hero__background') ?? null,
    heroType: root?.querySelector?.('[data-slot="hero-type"]') ?? null,
    heroTitle: root?.querySelector?.('[data-slot="hero-title"]') ?? null,
    heroSubtitle: root?.querySelector?.('[data-slot="hero-subtitle"]') ?? null,
    heroRateUp: root?.querySelector?.('[data-slot="hero-rateup"]') ?? null,
    heroTimer: root?.querySelector?.('[data-slot="hero-timer"]') ?? null,
    pityPills: root?.querySelector?.('[data-slot="pity-pills"]') ?? null,
    pityBar: root?.querySelector?.('.pity__bar') ?? null,
    pityNote: root?.querySelector?.('.pity__note') ?? null,
    featuredList: root?.querySelector?.('[data-slot="featured-list"]') ?? null,
    detailsButtons: Array.from(root?.querySelectorAll?.('[data-action="open-rates"]') ?? []),
    ctaSingle: root?.querySelector?.('[data-action="summon-single"]') ?? null,
    ctaMulti: root?.querySelector?.('[data-action="summon-multi"]') ?? null,
    confirmTitle: root?.querySelector?.('[data-slot="confirm-title"]') ?? null,
    confirmRoot: root?.querySelector?.('[data-gacha-root]') ?? null,
    helpButton: root?.querySelector?.('.help-button') ?? null,
    drawerToggle: root?.querySelector?.('[data-action="toggle-drawer"]') ?? null,
  };
}

function captureModals(scope) {
  const root = toQueryRoot(scope);
  return {
    rates: root?.querySelector?.('[data-modal="rates"]') ?? null,
    confirm: root?.querySelector?.('[data-modal="confirm"]') ?? null,
  };
}

function capturePanels(modalRefs) {
  const ratesModal = modalRefs.rates;
  return {
    rates: ratesModal?.querySelector?.('[data-panel="rates"]') ?? null,
    pity: ratesModal?.querySelector?.('[data-panel="pity"]') ?? null,
    featured: ratesModal?.querySelector?.('[data-panel="featured"]') ?? null,
  };
}

function captureTabs(modalRefs) {
  return Array.from(modalRefs.rates?.querySelectorAll?.('.modal__tabs [role="tab"]') ?? []);
}

function resetDomReferences(scope) {
  currentScope = scope;
  elements = captureElements(scope);
  modals = captureModals(scope);
  panels = capturePanels(modals);
  tabs = captureTabs(modals);
}

function trackListener(target, type, handler) {
  if (!target || typeof target.addEventListener !== 'function' || typeof handler !== 'function') {
    return;
  }
  target.addEventListener(type, handler);
  trackedListeners.push(() => {
    try {
      target.removeEventListener(type, handler);
    } catch (error) {
      console.warn('[Gacha UI] Không thể gỡ listener:', error);
    }
  });
}

function resetListeners() {
  trackedListeners.forEach((remove) => {
    try {
      remove();
    } catch (error) {
      console.warn('[Gacha UI] Lỗi khi gỡ listener:', error);
    }
  });
  trackedListeners = [];
}

function ensureSelectedBanner(preferredId = null) {
  if (!Array.isArray(BANNERS) || BANNERS.length === 0) {
    if (state.selectedBannerId !== null) {
      state = { ...state, selectedBannerId: null };
    }
    return null;
  }

  const preferred = preferredId ? BANNERS.find((banner) => banner.id === preferredId) : null;
  const current = preferred ?? BANNERS.find((banner) => banner.id === state.selectedBannerId) ?? BANNERS[0] ?? null;
  const nextId = current?.id ?? null;
  if (nextId !== state.selectedBannerId) {
    state = { ...state, selectedBannerId: nextId };
  }
  return current;
}

function pruneStalePityStates() {
  const validIds = new Set(BANNERS.map((banner) => banner.id));
  Array.from(pityStates.keys()).forEach((bannerId) => {
    if (!validIds.has(bannerId)) {
      pityStates.delete(bannerId);
    }
  });
}

function getCurrencyEntry(id) {
  return CURRENCIES.find((currency) => currency.id === id) ?? null;
}

function normalizeRankKey(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const upper = value.trim().toUpperCase();
  return RANKS.find((rank) => rank.toUpperCase() === upper) ?? null;
}

function getMappedValue(source, rank) {
  if (!source) {
    return null;
  }
  const normalized = normalizeRankKey(rank);
  if (!normalized) {
    return null;
  }
  if (typeof source[normalized] === 'number') {
    return source[normalized];
  }
  const entryKey = Object.keys(source).find(
    (key) => normalizeRankKey(key) === normalized && typeof source[key] === 'number',
  );
  return entryKey ? source[entryKey] : null;
}

function getPityState(bannerId) {
  if (!bannerId) {
    return {
      counters: Object.fromEntries(RANKS.map((rank) => [rank, 0])),
      total: 0,
    };
  }
  let state = pityStates.get(bannerId);
  if (!state) {
    state = {
      counters: Object.fromEntries(RANKS.map((rank) => [rank, 0])),
      total: 0,
    };
    pityStates.set(bannerId, state);
  }
  return state;
}

function updatePityCounters(pityState, rarity) {
  const normalized = normalizeRankKey(rarity);
  if (!normalized) {
    return;
  }
  pityState.total += 1;
  const resultIndex = RANKS.indexOf(normalized);
  RANKS.forEach((rank) => {
    const rankIndex = RANKS.indexOf(rank);
    if (resultIndex >= rankIndex) {
      pityState.counters[rank] = 0;
    } else {
      const current = pityState.counters[rank] ?? 0;
      pityState.counters[rank] = current + 1;
    }
  });
}

function selectHardPityRank(banner, pityState) {
  const hardMap = banner?.pity?.hard;
  if (!hardMap) {
    return null;
  }
  const counters = pityState.counters;
  for (const rarity of RARITY_PRIORITY) {
    const threshold = getMappedValue(hardMap, rarity);
    if (typeof threshold !== 'number' || threshold <= 0) {
      continue;
    }
    const normalized = normalizeRankKey(rarity);
    if (!normalized) {
      continue;
    }
    const current = counters[normalized] ?? 0;
    if (current + 1 >= threshold) {
      return normalized;
    }
  }
  return null;
}

function applySoftPityBonus(baseRate, rarity, pityState, banner) {
  const softMap = banner?.pity?.soft;
  if (!softMap) {
    return baseRate;
  }
  const normalized = normalizeRankKey(rarity);
  if (!normalized) {
    return baseRate;
  }
  const threshold = getMappedValue(softMap, normalized);
  if (typeof threshold !== 'number' || threshold <= 0) {
    return baseRate;
  }
  const pulls = (pityState.counters[normalized] ?? 0) + 1;
  if (pulls < threshold) {
    return baseRate;
  }
  const hardThreshold = getMappedValue(banner?.pity?.hard ?? null, normalized);
  if (typeof hardThreshold === 'number' && hardThreshold <= threshold) {
    return 1;
  }
  if (typeof hardThreshold === 'number' && hardThreshold > threshold) {
    const span = hardThreshold - threshold;
    if (span <= 0) {
      return 1;
    }
    const progress = Math.min(span, pulls - threshold + 1);
    const ratio = progress / span;
    const bonus = (1 - baseRate) * ratio;
    return Math.min(1, baseRate + bonus);
  }
  const extra = Math.max(0, pulls - threshold + 1);
  const bonus = baseRate * 0.1 * extra;
  return Math.min(1, baseRate + bonus);
}

function computeAdjustedRates(banner, pityState) {
  const adjusted = {};
  let total = 0;
  RANKS.forEach((rank) => {
    const basePercent = getMappedValue(banner?.rates ?? null, rank);
    const baseRate = Math.max(0, (typeof basePercent === 'number' ? basePercent : 0) / 100);
    const withSoftPity = applySoftPityBonus(baseRate, rank, pityState, banner);
    adjusted[rank] = withSoftPity;
    total += withSoftPity;
  });
  if (total <= 0) {
    adjusted[RANKS[0]] = 1;
    total = 1;
  }
  const normalized = {};
  RANKS.forEach((rank) => {
    const value = adjusted[rank] ?? 0;
    normalized[rank] = value / total;
  });
  return normalized;
}

function sampleRarityByRate(banner, pityState, rng) {
  const rates = computeAdjustedRates(banner, pityState);
  const randomSource = typeof rng === 'function' ? rng : Math.random;
  let roll = randomSource();
  if (!Number.isFinite(roll)) {
    roll = Math.random();
  }
  roll = Math.min(Math.max(roll, 0), 0.999999);
  let cumulative = 0;
  for (const rank of RANKS) {
    const portion = rates[rank] ?? 0;
    cumulative += portion;
    if (roll <= cumulative) {
      return rank;
    }
  }
  return RANKS[RANKS.length - 1];
}

function rollRarity(banner, pityState, rng) {
  const forced = selectHardPityRank(banner, pityState);
  const rarity = forced ?? sampleRarityByRate(banner, pityState, rng);
  updatePityCounters(pityState, rarity);
  return rarity;
}

function createSummonCard(banner, rarity, index, rng) {
  const normalized = normalizeRankKey(rarity) ?? RANKS[0];
  const pool = Array.isArray(banner?.featured)
    ? banner.featured.filter((unit) => normalizeRankKey(unit?.rank) === normalized)
    : [];
  let chosen = null;
  if (pool.length > 0) {
    const randomSource = typeof rng === 'function' ? rng : Math.random;
    let roll = randomSource();
    if (!Number.isFinite(roll)) {
      roll = Math.random();
    }
    roll = Math.min(Math.max(roll, 0), 0.999999);
    const pickIndex = Math.floor(roll * pool.length);
    chosen = pool[pickIndex] ?? pool[0];
  }
  const fallbackName = `Đối tác ${normalized} #${index + 1}`;
  const uniqueId = chosen?.id ? `${chosen.id}-${Date.now()}-${index}` : `summon-${banner.id}-${Date.now()}-${index}`;
  return {
    id: uniqueId,
    name: chosen?.name ?? fallbackName,
    description: chosen
      ? `${chosen.name} (${normalized}) xuất hiện từ ${banner.name}.`
      : `Triệu hồi hạng ${normalized} từ ${banner.name}.`,
    rarity: normalized,
    artwork: chosen?.portrait ?? null,
  };
}

async function createSummonResults(banner, amount, options = {}) {
  const pulls = Math.max(1, Number.isFinite(Number(amount)) ? Number(amount) : 1);
  const pityState = getPityState(banner?.id ?? null);
  const payload = options?.payload;
  const payloadEntries = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.cards)
        ? payload.cards
        : null;
  if (payloadEntries) {
    return payloadEntries.slice(0, pulls).map((entry, index) => {
      const rarity = normalizeRankKey(entry?.rarity ?? entry?.rank ?? entry?.tier) ?? RANKS[0];
      updatePityCounters(pityState, rarity);
      return {
        id: entry?.id ? String(entry.id) : `summon-${banner.id}-${Date.now()}-${index}`,
        name: entry?.name ?? entry?.title ?? `Đối tác ${rarity} #${index + 1}`,
        description:
          entry?.description ?? entry?.note ?? `Triệu hồi hạng ${rarity} từ ${banner?.name ?? 'Banner'}!`,
        rarity,
        artwork: entry?.artwork ?? entry?.icon ?? null,
      };
    });
  }

  const rng = typeof options?.rng === 'function' ? options.rng : Math.random;
  const cards = [];
  for (let index = 0; index < pulls; index += 1) {
    const rarity = rollRarity(banner, pityState, rng);
    cards.push(createSummonCard(banner, rarity, index, rng));
  }
  return cards;
}

function createPlaceholderResults(banner, amount) {
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
      id: `fallback-${banner.id}-${index}`,
      name: base?.name ?? `Đơn vị ${index + 1}`,
      description: base ? `${base.name} đang được rate-up.` : 'Kết quả minh hoạ.',
      rarity,
      artwork: base?.portrait ?? null,
    });
  }
  return cards;
}

function applySummonCost(cost, status) {
  if (!cost || !status?.enough) {
    return null;
  }
  const target = status.useFallback && cost.fallback ? cost.fallback : cost;
  const wallet = getCurrencyEntry(target.currency);
  if (!wallet) {
    console.warn('[Gacha] Không tìm thấy loại tiền tệ để trừ chi phí:', target.currency);
    return null;
  }
  wallet.amount = Math.max(0, wallet.amount - target.amount);
  return { wallet, deducted: target };
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
  ensureSelectedBanner();
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
  const banner = ensureSelectedBanner(id);
  if (!banner) {
    updateBannerSelection();
    return;
  }
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
  if (!banner) {
    elements.heroType.textContent = '';
    elements.heroTitle.textContent = 'Không có banner khả dụng';
    elements.heroSubtitle.textContent = '';
    elements.heroBackground.style.backgroundImage = '';
    elements.heroTimer.textContent = '';
    elements.heroTimer.style.display = 'none';
    elements.heroRateUp.classList.remove('is-visible');
    elements.heroRateUp.textContent = 'Rate UP';
    elements.heroRateUp.removeAttribute('title');
    elements.heroRateUp.removeAttribute('aria-label');
    renderPityPills(null);
    updatePityDisplay(null);
    renderFeatured(null);
    return;
  }
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
  updatePityDisplay(banner);
  renderFeatured(banner);
}

function renderPityPills(banner) {
  elements.pityPills.replaceChildren();
  if (!banner?.pity) {
    const pill = document.createElement('span');
    pill.className = 'pity-pill';
    pill.textContent = 'Không có bảo hiểm đặc biệt';
    elements.pityPills.appendChild(pill);
    return;
  }

  const state = banner?.id ? getPityState(banner.id) : { counters: {} };
  const appendEntries = (entries, kind) => {
    if (!entries) return;
    Object.entries(entries).forEach(([rank, value]) => {
      elements.pityPills.appendChild(createPityPill(rank, value, kind, state));
    });
  };

  appendEntries(banner.pity.soft, 'Soft pity');
  appendEntries(banner.pity.hard, 'Hard pity');

  if (!elements.pityPills.childElementCount) {
    const pill = document.createElement('span');
    pill.className = 'pity-pill';
    pill.textContent = 'Không có bảo hiểm đặc biệt';
    elements.pityPills.appendChild(pill);
  }
}

function updatePityDisplay(banner) {
  if (!elements.pityBar || !elements.pityNote) {
    return;
  }
  if (!banner) {
    elements.pityBar.style.setProperty('--pity-progress', '0');
    elements.pityBar.setAttribute('aria-valuenow', '0');
    elements.pityBar.setAttribute('aria-valuemax', '100');
    elements.pityBar.removeAttribute('aria-valuetext');
    elements.pityBar.dataset.rank = '';
    elements.pityBar.dataset.threshold = '';
    elements.pityBar.dataset.progress = '';
    elements.pityNote.textContent = 'Chưa có banner được chọn.';
    return;
  }
  if (!banner?.pity) {
    elements.pityBar.style.setProperty('--pity-progress', '0');
    elements.pityBar.setAttribute('aria-valuenow', '0');
    elements.pityBar.setAttribute('aria-valuemax', '100');
    elements.pityNote.textContent = 'Banner này không thiết lập bảo hiểm.';
    return;
  }

  const state = getPityState(banner.id);
  const { soft, hard } = banner.pity;
  let targetRank = null;
  let threshold = null;
  for (const rank of RARITY_PRIORITY) {
    const hardValue = getMappedValue(hard ?? null, rank);
    const softValue = getMappedValue(soft ?? null, rank);
    const candidate = typeof hardValue === 'number' && hardValue > 0 ? hardValue : softValue;
    if (typeof candidate === 'number' && candidate > 0) {
      targetRank = normalizeRankKey(rank);
      threshold = candidate;
      break;
    }
  }

  if (!targetRank || !threshold) {
    elements.pityBar.style.setProperty('--pity-progress', '0');
    elements.pityBar.setAttribute('aria-valuenow', '0');
    elements.pityBar.setAttribute('aria-valuemax', '100');
    elements.pityNote.textContent = 'Banner này không thiết lập bảo hiểm.';
    return;
  }

  const pullsSince = state.counters[targetRank] ?? 0;
  const thresholdValue = Number(threshold) > 0 ? Number(threshold) : 0;
  const cappedProgress = thresholdValue > 0 ? Math.min(pullsSince, thresholdValue) : pullsSince;
  const progressRatio = thresholdValue > 0 ? Math.min(1, cappedProgress / thresholdValue) : 0;
  elements.pityBar.style.setProperty('--pity-progress', `${progressRatio}`);
  elements.pityBar.dataset.rank = targetRank;
  elements.pityBar.dataset.threshold = String(thresholdValue);
  elements.pityBar.dataset.progress = String(pullsSince);
  elements.pityBar.setAttribute('aria-valuemin', '0');
  elements.pityBar.setAttribute('aria-valuemax', String(thresholdValue || 0));
  elements.pityBar.setAttribute('aria-valuenow', String(cappedProgress));
  if (thresholdValue > 0) {
    elements.pityBar.setAttribute(
      'aria-valuetext',
      `Đã quay ${cappedProgress}/${thresholdValue} lượt cho bảo hiểm ${targetRank}`,
    );
  } else {
    elements.pityBar.removeAttribute('aria-valuetext');
  }

  if (pullsSince <= 0) {
    elements.pityNote.textContent = `Chưa có lượt nào cộng dồn cho bảo hiểm ${targetRank}.`;
    return;
  }

  if (thresholdValue > 0 && pullsSince >= thresholdValue) {
    elements.pityNote.textContent = `Đã đạt bảo hiểm ${targetRank}!`;
    return;
  }

  if (thresholdValue > 0) {
    const remaining = Math.max(0, thresholdValue - pullsSince);
    elements.pityNote.textContent = `Đã quay ${pullsSince}/${thresholdValue} lượt — còn ${remaining} lượt tới bảo hiểm ${targetRank}.`;
  } else {
    elements.pityNote.textContent = `Đang cộng dồn bảo hiểm ${targetRank}: ${pullsSince} lượt.`;
  }
}

function createPityPill(rank, value, kind, state) {
  const pill = document.createElement('span');
  pill.className = 'pity-pill';
  const normalized = normalizeRankKey(rank) ?? rank;
  pill.dataset.rank = normalized;
  pill.dataset.kind = kind;

  const threshold = typeof value === 'number' ? value : Number.parseInt(value, 10);
  const current = normalized && state?.counters ? state.counters[normalized] ?? 0 : 0;
  pill.dataset.threshold = Number.isFinite(threshold) ? String(threshold) : '';
  pill.dataset.progress = String(current);

  const label = document.createElement('span');
  label.className = 'pity-pill__label';
  label.textContent = `${kind}`;

  const text = document.createElement('span');
  text.className = 'pity-pill__value';
  const target = normalized ?? rank;
  if (Number.isFinite(threshold) && threshold > 0) {
    text.textContent = `${target}: ${current}/${threshold}`;
    const remaining = Math.max(0, threshold - current);
    pill.title = remaining > 0
      ? `Còn ${remaining} lượt để đạt ${kind.toLowerCase()} ${target}.`
      : `Đã đạt ngưỡng ${kind.toLowerCase()} ${target}.`;
  } else {
    text.textContent = `${target}: ${value}`;
    pill.title = `Đang theo dõi ${kind.toLowerCase()} ${target}.`;
  }

  pill.appendChild(label);
  pill.appendChild(text);
  return pill;
}

function renderFeatured(banner) {
  elements.featuredList.replaceChildren();
  if (!banner?.featured || banner.featured.length === 0) {
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

function emitConfirmEvent(type, detail = null) {
  if (!elements.confirmRoot) {
    return;
  }
  const payload = detail === undefined ? null : detail;
  const event = new CustomEvent(type, { detail: payload, bubbles: false });
  elements.confirmRoot.dispatchEvent(event);
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
  const currentBanner = ensureSelectedBanner();
  if (!currentBanner || !Array.isArray(BANNERS) || BANNERS.length === 0) {
    return;
  }
  const index = BANNERS.findIndex((banner) => banner.id === currentBanner.id);
  if (index === -1) {
    const fallback = ensureSelectedBanner(BANNERS[0]?.id ?? null);
    if (fallback) {
      selectBanner(fallback.id, { focus: true });
    }
    return;
  }
  const nextIndex = (index + step + BANNERS.length) % BANNERS.length;
  const targetBanner = BANNERS[nextIndex];
  if (targetBanner) {
    selectBanner(targetBanner.id, { focus: true });
  }
}

function handleTabClick(event) {
  const button = event.currentTarget;
  const tab = button.dataset.tab;
  if (!tab) return;
  activateTab(tab);
}

async function onClickSummon(type) {
  const banner = ensureSelectedBanner(state.selectedBannerId) ?? BANNERS[0];
  if (!banner) {
    console.warn('[Gacha] Không có banner khả dụng để triệu hồi.');
    return;
  }
  const amount = type === 'multi' ? 10 : 1;
  const cost = banner.cost?.[type] ?? null;
  const status = cost ? hasEnoughCurrency(cost) : null;
  if (cost && !status?.enough) {
    updateCurrencyHighlight(banner);
    return;
  }

  elements.confirmTitle.textContent = `${banner.name} — Summon x${amount}`;
  openModal(modals.confirm);

  const flowComplete = confirmFlowCompleteHandler ?? (() => closeModal(modals.confirm));

  try {
    await renderConfirmGacha(banner, amount, { cost, status, onRevealDone: flowComplete });
  } catch (error) {
    console.error('[Gacha] Không thể hiển thị kết quả triệu hồi:', error);
  }
}

async function renderConfirmGacha(banner, amount, options = {}) {
  const { cost = null, status = null, payload = null, rng = null, onRevealDone = null } = options;

  let cards;
  try {
    cards = await createSummonResults(banner, amount, { payload, rng });
  } catch (error) {
    console.error('[Gacha] Lỗi khi tạo kết quả triệu hồi:', error);
    cards = createPlaceholderResults(banner, amount);
  }

  const renderGachaView = await resolveRenderGachaView();

  const titleText = `Kết quả triệu hồi x${amount}`;
  const handleRevealDone = () => {
    updatePityDisplay(banner);
    renderPityPills(banner);
    if (typeof onRevealDone === 'function') {
      onRevealDone();
    }
    const pityState = getPityState(banner.id);
    emitConfirmEvent('summon:flow-complete', {
      bannerId: banner.id,
      amount,
      pity: {
        counters: { ...pityState.counters },
        total: pityState.total,
      },
    });
  };

  if (!confirmViewHandle) {
    confirmViewHandle = renderGachaView({
      root: elements.confirmRoot,
      title: titleText,
      subtitle: banner.name,
      cards,
      onRevealDone: handleRevealDone,
    });
  } else {
    confirmViewHandle.updateCards(cards);
  }

  const titleEl = confirmViewHandle.section.querySelector('.gacha-view__title');
  if (titleEl) {
    titleEl.textContent = titleText;
  }
  const subtitleEl = confirmViewHandle.section.querySelector('.gacha-view__subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = banner.name;
  }

  confirmViewHandle.setRevealDoneCallback(handleRevealDone);

  if (cost && status?.enough) {
    applySummonCost(cost, status);
    renderCurrencies(CURRENCIES);
    updateCTASection(banner);
  }

  updatePityDisplay(banner);
  renderPityPills(banner);
  confirmViewHandle?.reveal();
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
  ensureSelectedBanner();
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
  const handleSummonFlowComplete = () => closeModal(modals.confirm);
  confirmFlowCompleteHandler = handleSummonFlowComplete;

  trackListener(elements.confirmRoot, 'summon:flow-complete', handleSummonFlowComplete);

  elements.detailsButtons.forEach((button) => {
    trackListener(button, 'click', () => {
      const banner = ensureSelectedBanner(state.selectedBannerId) ?? BANNERS[0];
      populateRatesModal(banner);
      openModal(modals.rates);
    });
  });

  Array.from(modals.rates?.querySelectorAll?.('[data-action="close-modal"]') ?? []).forEach((button) => {
    trackListener(button, 'click', () => closeModal(modals.rates));
  });
  Array.from(modals.confirm?.querySelectorAll?.('[data-action="close-modal"]') ?? []).forEach((button) => {
    trackListener(button, 'click', () => closeModal(modals.confirm));
  });

  const ratesOverlay = modals.rates?.querySelector?.('.modal__overlay');
  const confirmOverlay = modals.confirm?.querySelector?.('.modal__overlay');
  trackListener(ratesOverlay, 'click', () => closeModal(modals.rates));
  trackListener(confirmOverlay, 'click', () => closeModal(modals.confirm));

  tabs.forEach((tab) => {
    trackListener(tab, 'click', handleTabClick);
  });

  trackListener(elements.ctaSingle, 'click', () => onClickSummon('single'));
  trackListener(elements.ctaMulti, 'click', () => onClickSummon('multi'));

  trackListener(elements.drawerToggle, 'click', () => toggleDrawer());
}

async function init() {
  const { currencies, banners } = await loadEconomyFromConfig();
  CURRENCIES = currencies;
  BANNERS = banners;
  pruneStalePityStates();
  const initialBanner = ensureSelectedBanner();

  renderCurrencies(CURRENCIES);
  renderBannerList(BANNERS);
  if (initialBanner?.id) {
    selectBanner(initialBanner.id, { focus: false });
  } else if (BANNERS[0]?.id) {
    selectBanner(BANNERS[0].id, { focus: false });
  } else {
    updateHeroSection(null);
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

function destroyGachaUIInternal() {
  if (currentOpenModal) {
    closeModal(currentOpenModal);
  }
  resetListeners();
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleGlobalKeyDown);
  }
  if (confirmViewHandle && typeof confirmViewHandle.destroy === 'function') {
    confirmViewHandle.destroy();
  }
  confirmViewHandle = null;
  confirmFlowCompleteHandler = null;
  currentOpenModal = null;
  if (elements.app) {
    elements.app.removeAttribute('data-drawer-open');
  }
  elements = createEmptyElements();
  modals = createEmptyModals();
  panels = createEmptyPanels();
  tabs = [];
  state = {
    selectedBannerId: BANNERS[0]?.id ?? null,
    drawerOpen: false,
  };
  currentScope = null;
  mounted = false;
}

export async function mountGachaUI(scope = null) {
  destroyGachaUIInternal();
  resetDomReferences(scope);
  if (!elements.app) {
    throw new Error('[Gacha UI] Không tìm thấy phần tử gacha-app để khởi tạo.');
  }

  try {
    await init();
    mounted = true;
  } catch (error) {
    destroyGachaUIInternal();
    throw error;
  }

  return {
    destroy: destroyGachaUIInternal,
  };
}

export function destroyGachaUI() {
  destroyGachaUIInternal();
}

if (typeof window !== 'undefined' && !(window?.[AUTO_BOOT_FLAG])) {
  mountGachaUI(document).catch((error) => {
    console.error('[Gacha UI] Lỗi khi khởi tạo giao diện gacha:', error);
  });
}
