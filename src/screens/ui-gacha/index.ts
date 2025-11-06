import './gacha.css';

type MaybeRequire = ((id: string) => unknown) | undefined;

declare const __require: MaybeRequire;

interface RenderContext {
  readonly root: HTMLElement;
  readonly shell?: { enterScreen?: (screenId: string, params?: unknown) => void } | null;
  readonly definition?: { label?: string | null } | null;
  readonly params?: unknown;
  readonly screenId?: string;
}

type GachaHandle = { destroy?: () => void } | null | undefined;

declare global {
  interface Window {
    __ARC_GACHA_EMBED__?: boolean;
  }
}

const GACHA_TEMPLATE = /* html */ `
  <div class="gacha-app" data-app-root>
    <header class="gacha-topbar" data-section="topbar">
      <button
        class="banner-drawer-toggle"
        type="button"
        aria-label="Mở danh sách banner"
        title="Mở danh sách banner"
        data-action="toggle-drawer"
      >
        <span aria-hidden="true">☰</span>
        <span class="banner-drawer-toggle__label">Banner</span>
      </button>
      <div class="currency-header" data-slot="currencies" aria-label="Tiền tệ đang có"></div>
      <button
        class="help-button"
        type="button"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-label="Xem tỉ lệ và bảo hiểm gacha"
        title="Xem tỉ lệ và bảo hiểm gacha"
        data-action="open-rates"
      >
        ?
      </button>
    </header>

    <div class="gacha-layout">
      <aside class="banner-list" data-slot="banner-list" aria-label="Danh sách banner"></aside>
      <main class="hero" data-slot="hero" aria-live="polite">
        <div class="hero__background" aria-hidden="true"></div>
        <div class="hero__content">
          <div class="hero__header">
            <div class="hero__title-group">
              <div class="hero__type-chip" data-slot="hero-type"></div>
              <h1 class="hero__title" data-slot="hero-title"></h1>
              <p class="hero__subtitle" data-slot="hero-subtitle"></p>
            </div>
            <div class="hero__meta">
              <span class="hero__rateup" data-slot="hero-rateup">Rate UP</span>
              <span class="hero__timer" data-slot="hero-timer"></span>
            </div>
          </div>

          <section class="pity" aria-label="Thông tin bảo hiểm">
            <div class="pity__pills" data-slot="pity-pills"></div>
            <div class="pity__progress">
              <div class="pity__bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
              <span class="pity__note">Chưa có dữ liệu bảo hiểm.</span>
            </div>
          </section>

          <section class="featured" aria-label="Đối tác nổi bật">
            <div class="featured__list" data-slot="featured-list"></div>
          </section>

          <button class="hero__details" type="button" data-action="open-rates">Xem chi tiết tỉ lệ &amp; bảo hiểm</button>
        </div>
      </main>
    </div>

    <footer class="cta" data-section="cta">
      <div class="cta__note">UI-only: Nhấn sẽ mở modal xác nhận (không quay).</div>
      <div class="cta__buttons">
        <button class="cta__button" type="button" data-test="summon-x1" data-action="summon-single"></button>
        <button class="cta__button" type="button" data-test="summon-x10" data-action="summon-multi"></button>
      </div>
    </footer>
  </div>

  <div class="modal" data-modal="rates" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Tỉ lệ &amp; bảo hiểm">
    <div class="modal__overlay" data-action="close-modal"></div>
    <div class="modal__dialog" role="document">
      <header class="modal__header">
        <h2 class="modal__title">Tỉ lệ &amp; bảo hiểm</h2>
        <button class="modal__close" type="button" data-action="close-modal" aria-label="Đóng"></button>
      </header>
      <div class="modal__tabs" role="tablist">
        <button role="tab" aria-selected="true" data-tab="rates">Tỉ lệ</button>
        <button role="tab" aria-selected="false" data-tab="pity">Bảo hiểm</button>
        <button role="tab" aria-selected="false" data-tab="featured">Rate-up</button>
      </div>
      <div class="modal__body">
        <section class="modal__panel" data-panel="rates" role="tabpanel"></section>
        <section class="modal__panel" data-panel="pity" role="tabpanel" hidden></section>
        <section class="modal__panel" data-panel="featured" role="tabpanel" hidden></section>
      </div>
    </div>
  </div>

  <div class="modal" data-modal="confirm" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Xác nhận triệu hồi">
    <div class="modal__overlay" data-action="close-modal"></div>
    <div class="modal__dialog modal__dialog--wide" role="document">
      <header class="modal__header">
        <h2 class="modal__title" data-slot="confirm-title">Xác nhận triệu hồi</h2>
        <button class="modal__close" type="button" data-action="close-modal" aria-label="Đóng"></button>
      </header>
      <p class="modal__description">Demo UI — chưa có quay thật.</p>
      <div class="confirm__grid" data-slot="confirm-grid">
        <div class="confirm__gacha" data-gacha-root></div>
      </div>
      <footer class="modal__footer">
        <button class="modal__close-btn" type="button" data-action="close-modal">Đóng</button>
      </footer>
    </div>
  </div>
`;

const GACHA_MODULE_ID = './screens/ui-gacha/gacha.js' as const;

type MaybePromise<T> = Promise<T> | T;

interface LegacyModuleAliases {
  readonly [key: string]: string | undefined;
}

interface LegacyModuleGlobal {
  readonly __require?: ((id: string) => unknown) | null;
  readonly __legacyModuleAliases?: LegacyModuleAliases | null;
  readonly __normalizeModuleId?: ((id: string) => unknown) | null;
}

interface GachaModule {
  readonly mountGachaUI?: (scope?: HTMLElement | Document | null) => MaybePromise<GachaHandle>;
}

function sanitizeModuleId(moduleId: string): string {
  return moduleId.replace(/\\/g, '/');
}

function getLegacyModuleGlobal(): (LegacyModuleGlobal & typeof globalThis) | null {
  if (typeof globalThis !== 'undefined') {
    return globalThis as LegacyModuleGlobal & typeof globalThis;
  }
  if (typeof window !== 'undefined') {
    return window as unknown as LegacyModuleGlobal & typeof globalThis;
  }
  return null;
}

function getLegacyModuleAliases(): LegacyModuleAliases | null {
  const legacyGlobal = getLegacyModuleGlobal();
  const aliases = legacyGlobal?.__legacyModuleAliases;
  if (aliases && typeof aliases === 'object') {
    return aliases as LegacyModuleAliases;
  }
  return null;
}

function normalizeRuntimeModuleId(moduleId: string): string {
  const sanitized = sanitizeModuleId(moduleId);
  const legacyGlobal = getLegacyModuleGlobal();
  const normalizer = legacyGlobal?.__normalizeModuleId;
  if (typeof normalizer === 'function') {
    try {
      const normalized = normalizer(sanitized);
      if (typeof normalized === 'string' && normalized.length > 0) {
        return sanitizeModuleId(normalized);
      }
    } catch {
      // Bỏ qua lỗi từ hàm normalize tuỳ biến.
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

function resolveNormalizedModuleHref(normalizedId: string): string {
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

function getRuntimeRequire(): ((id: string) => unknown) | null {
  if (typeof __require === 'function') {
    return __require;
  }
  const legacyGlobal = getLegacyModuleGlobal();
  const candidate = legacyGlobal?.__require;
  if (typeof candidate === 'function') {
    return candidate;
  }
  if (typeof window !== 'undefined') {
    const fromWindow = (window as { __require?: unknown }).__require;
    if (typeof fromWindow === 'function') {
      return fromWindow as (id: string) => unknown;
    }
  }
  return null;
}

async function loadGachaModule(): Promise<GachaModule> {
  const normalizedId = normalizeRuntimeModuleId(GACHA_MODULE_ID);
  const runtimeRequire = getRuntimeRequire();
  if (runtimeRequire) {
    return runtimeRequire(normalizedId) as GachaModule;
  }
  const href = resolveNormalizedModuleHref(normalizedId);
  return import(/* @vite-ignore */ href) as Promise<GachaModule>;
}

function createContainer(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'gacha-page';
  wrapper.dataset.gachaScreenRoot = 'true';
  wrapper.innerHTML = GACHA_TEMPLATE;
  return wrapper;
}

export function renderScreen(context: RenderContext): { destroy: () => void } {
  const { root } = context;
  if (!root) {
    throw new Error('renderScreen cần root hợp lệ.');
  }

  const container = createContainer();
  let disposed = false;
  let handle: GachaHandle = null;
  const previousFlag = typeof window !== 'undefined' ? window.__ARC_GACHA_EMBED__ : undefined;

  if (typeof window !== 'undefined') {
    window.__ARC_GACHA_EMBED__ = true;
  }

  root.appendChild(container);

  loadGachaModule()
    .then(async (module) => {
      if (!module || typeof module.mountGachaUI !== 'function') {
        throw new Error('Module gacha không xuất mountGachaUI.');
      }
      return module.mountGachaUI(container);
    })
    .then((result) => {
      if (disposed) {
        result?.destroy?.();
        return;
      }
      handle = result;
    })
    .catch((error) => {
      console.error('[Gacha UI] Không thể khởi tạo module gacha:', error);
    });

  function cleanup(): void {
    disposed = true;
    try {
      handle?.destroy?.();
    } catch (error) {
      console.warn('[Gacha UI] Lỗi khi huỷ module gacha:', error);
    }
    handle = null;
    if (container.parentElement === root) {
      root.removeChild(container);
    } else {
      container.remove();
    }
    if (typeof window !== 'undefined') {
      if (previousFlag === undefined) {
        delete window.__ARC_GACHA_EMBED__;
      } else {
        window.__ARC_GACHA_EMBED__ = previousFlag;
      }
    }
  }

  return {
    destroy: cleanup,
  };
}

export const render = renderScreen;
