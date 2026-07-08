//home (termux)/arclune_lane_7x3/src/screens/ui-gacha/index.ts

import gachaStyles from './gacha.css';
import { ensureStyleTag } from '../../ui/dom.ts';

type MaybeRequire = ((id: string) => unknown) | undefined;

declare const __require: MaybeRequire;

interface RenderContext {
  readonly root: HTMLElement;
  readonly shell?: {
    enterScreen?: (screenId: string, params?: unknown) => void;
    clearActiveSession?: () => void;
  } | null;
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

const STYLE_ID = 'ui-gacha-screen-style';

const GACHA_TEMPLATE = /* html */ `
  <div class="gacha-app gacha-app--embedded" data-app-root>
    <div class="gacha-screen-shell" data-section="shell">
      <button
        class="gacha-topbar__back gacha-screen-shell__back"
        type="button"
        aria-label="Trở về menu chính"
        title="Trở về menu chính"
        data-action="go-back"
      >
        ← <span class="gacha-topbar__back-label">Menu chính</span>
      </button>
      <div class="gacha-screen-shell__mount" data-gacha-content></div>
    </div>
  </div>
`;

const GACHA_MODULE_ID = './screens/ui-gacha/gacha.ts' as const;

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
  const baseUrl =
    (typeof document !== 'undefined' ? document.baseURI : undefined) ??
    (typeof window !== 'undefined' ? window.location.href : undefined);

  if (!baseUrl) {
    return normalizedId;
  }

  if (normalizedId.startsWith('./screens/')) {
    const relative = `screens/${normalizedId.slice('./screens/'.length)}`;
    try {
      return new URL(relative, baseUrl).href;
    } catch {
      return normalizedId;
    }
  }

  if (normalizedId.startsWith('./')) {
    const relative = normalizedId.slice(2);
    try {
      return new URL(relative, baseUrl).href;
    } catch {
      return normalizedId;
    }
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

  const attempted = new Set<string>();
  const candidates: string[] = [];

  function pushCandidate(id: string): void {
    const sanitized = sanitizeModuleId(id);
    if (!attempted.has(sanitized)) {
      attempted.add(sanitized);
      candidates.push(sanitized);
    }
  }

  function withExtension(id: string, extension: '.ts' | '.js'): string {
    const knownExtensions = ['.ts', '.js', '.mjs', '.cjs'];
    for (const known of knownExtensions) {
      if (id.endsWith(known)) {
        return `${id.slice(0, -known.length)}${extension}`;
      }
    }
    return `${id}${extension}`;
  }

  pushCandidate(withExtension(normalizedId, '.ts'));
  pushCandidate(normalizedId);
  pushCandidate(withExtension(normalizedId, '.js'));

  let lastError: unknown = null;

  for (const candidate of candidates) {
    try {
      const href = resolveNormalizedModuleHref(candidate);
      return (await import(/* @vite-ignore */ href)) as GachaModule;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Không thể tải module gacha.');
}

function createContainer(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'gacha-page';
  wrapper.dataset.gachaScreenRoot = 'true';
  wrapper.innerHTML = GACHA_TEMPLATE;
  return wrapper;
}

export function renderScreen(context: RenderContext): { destroy: () => void } {
  const { root, shell = null } = context;
  if (!root) {
    throw new Error('renderScreen cần root hợp lệ.');
  }

  ensureStyleTag(STYLE_ID, { css: gachaStyles });

  const container = createContainer();
  const mountTarget = container.querySelector('[data-gacha-content]');
  if (!(mountTarget instanceof HTMLElement)) {
    throw new Error('Không tìm thấy vùng mount cho gacha UI.');
  }
  let disposed = false;
  let handle: GachaHandle = null;
  const previousFlag = typeof window !== 'undefined' ? window.__ARC_GACHA_EMBED__ : undefined;

  const goBackButton = container.querySelector('[data-action="go-back"]');
  const hasShellNavigation = Boolean(shell && typeof shell.enterScreen === 'function');
  const handleGoBack = (event: Event) => {
    event.preventDefault();
    if (shell && typeof shell.enterScreen === 'function') {
      shell.clearActiveSession?.();
      shell.enterScreen('main-menu', null);
      return;
    }
    const exitEvent = new CustomEvent('arclune:exit-gacha', {
      bubbles: true,
      cancelable: true,
    });
    root.dispatchEvent(exitEvent);
    if (!exitEvent.defaultPrevented && typeof history !== 'undefined' && typeof history.back === 'function') {
      history.back();
    }
  };
  if (goBackButton instanceof HTMLButtonElement) {
    if (!hasShellNavigation) {
      goBackButton.setAttribute('aria-disabled', 'true');
      goBackButton.classList.add('is-fallback');
      goBackButton.title = 'Sử dụng điều hướng trình duyệt để quay lại';
    }
    goBackButton.addEventListener('click', handleGoBack);
  }

  if (typeof window !== 'undefined') {
    window.__ARC_GACHA_EMBED__ = true;
  }

  root.appendChild(container);

  loadGachaModule()
    .then(async (module) => {
      if (!module || typeof module.mountGachaUI !== 'function') {
        throw new Error('Module gacha không xuất mountGachaUI.');
      }
      return module.mountGachaUI(mountTarget);
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
    if (goBackButton instanceof HTMLButtonElement) {
      goBackButton.removeEventListener('click', handleGoBack);
    }
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
