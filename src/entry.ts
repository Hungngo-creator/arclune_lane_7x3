import { createAppShell } from './app/shell.ts';
import { CFG } from './config.ts';
import { renderMainMenuView } from './screens/main-menu/view/index.ts';
import { MODES, MODE_GROUPS, MODE_STATUS, getMenuSections } from './data/modes.ts';
import { resolveModuleFunction } from './utils/module-resolution.ts';
import type { ModeConfig, ModeGroup, ModeShellConfig } from '@shared-types/config';
import type { UnknownRecord } from '@shared-types/common';
import type { MenuCardMetadata, MenuSection } from './screens/main-menu/types.ts';
import type { LineupViewHandle } from './screens/lineup/view/index.ts';
import { setPowerMode } from './ui/rarity/rarity.ts';

export interface ScreenParamMap {
  readonly [key: string]: unknown;
}

export type ScreenParams = ScreenParamMap | null;

export interface ShellState {
  screen: string;
  activeSession: unknown;
  screenParams: ScreenParams;
}

export type ShellErrorHandler = (error: unknown, context: UnknownRecord | null) => void;

export interface Shell {
  enterScreen: (key: string, params?: ScreenParams) => void;
  setActiveSession: (session: unknown) => void;
  clearActiveSession: () => void;
  getState: () => ShellState;
  onChange: (listener: ShellEventListener) => () => void;
  setErrorHandler: (handler: ShellErrorHandler | null) => void;
}

export type ShellEventPayload = ShellState;

export type ShellEventListener = (state: ShellEventPayload) => void;

export interface ViewController {
  destroy?: () => void;
}

export type MaybeViewController = ViewController | null;

export interface ModeDefinition {
  key: string;
  label: string;
  type: string;
  description: string;
  loader: ModuleLoader;
  screenId: string;
  icon?: string;
  tags: ReadonlyArray<string>;
  status: string;
  unlockNotes: string;
  params: ScreenParams;
}

export interface ScreenRendererContext {
  root: HTMLElement;
  shell: Shell;
  definition: ModeDefinition;
  params: ScreenParams;
  screenId: string;
}

export type ScreenRendererResult = MaybeViewController | void;

export type ScreenRenderer = (context: ScreenRendererContext) => ScreenRendererResult;

export type ModuleLoader<TModule = Record<string, unknown>> = () => Promise<TModule>;

export interface RenderMessageOptions {
  title?: string;
  body?: string;
}

export type RenderMessage = (options?: RenderMessageOptions) => void;

interface RenderPveLayoutOptions {
  title?: string;
  modeKey?: string;
  onExit?: () => void;
}

interface PveSession {
  start?: (config: UnknownRecord) => unknown;
  stop?: () => void;
}

const isStoppableSession = (value: unknown): value is { stop: () => void } => (
  Boolean(value) && typeof (value as { stop?: unknown }).stop === 'function'
);

const isStartableSession = (value: unknown): value is { start: (config: UnknownRecord) => unknown } => (
  Boolean(value) && typeof (value as { start?: unknown }).start === 'function'
);

declare global {
  // eslint-disable-next-line no-var
  var __require: ((id: string) => unknown) | undefined;

  interface Window {
    arcluneRenderMessage?: RenderMessage;
    arcluneShowFatal?: (error: unknown) => void;
  }
}

const SUCCESS_EVENT = 'arclune:loaded';
const SCREEN_MAIN_MENU = 'main-menu';
const SCREEN_PVE = 'pve-session';
const SCREEN_COLLECTION = 'collection';
const SCREEN_LINEUP = 'lineup';
const SCREEN_GACHA = 'gacha';
const COMING_SOON_MODULE_ID = '@modes/coming-soon.stub.ts' as const;
const COLLECTION_SCREEN_MODULE_ID = '@screens/collection/index.ts' as const;
const LINEUP_SCREEN_MODULE_ID = '@screens/lineup/index.ts' as const;
const APP_SCREEN_CLASSES = [
  `app--${SCREEN_MAIN_MENU}`,
  `app--${SCREEN_PVE}`,
  'app--pve',
  `app--${SCREEN_COLLECTION}`,
  `app--${SCREEN_LINEUP}`,
  `app--${SCREEN_GACHA}`,
];

async function loadBundledModule<TModule = unknown>(id: string): Promise<TModule>{
  const globalRequire = typeof globalThis !== 'undefined'
    ? (globalThis as { __require?: unknown }).__require
    : undefined;
  const runtimeRequire = typeof __require === 'function'
    ? __require
    : typeof globalRequire === 'function'
      ? globalRequire
      : null;
  const loader = runtimeRequire
    ? Promise.resolve().then(() => runtimeRequire(id))
    : import(id);

  const resolved = await loader;
  if (resolved && typeof resolved === 'object'){
    const moduleRecord = resolved as Record<string, unknown> & { comingSoon?: unknown; COMING_SOON_MODULE?: { comingSoon?: unknown } };
    const comingSoonFlag = moduleRecord.comingSoon ?? moduleRecord.COMING_SOON_MODULE?.comingSoon;
    if (typeof comingSoonFlag !== 'undefined' && moduleRecord.comingSoon !== comingSoonFlag){
      return { ...moduleRecord, comingSoon: comingSoonFlag } as TModule;
    }
  }
  return resolved as TModule;
}

function isScreenParamMap(value: unknown): value is ScreenParamMap {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cloneScreenParamMap(source: ScreenParamMap): ScreenParamMap {
  return { ...source };
}

function cloneScreenParams(params: ScreenParams): ScreenParams {
  if (!params) {
    return null;
  }
  return cloneScreenParamMap(params);
}

const MODE_DEFINITIONS: Record<string, ModeDefinition> = (MODES as ReadonlyArray<ModeConfig>).reduce<Record<string, ModeDefinition>>((acc, mode) => {
  const shell: ModeShellConfig | undefined = mode.shell;
  const screenId = shell?.screenId || SCREEN_MAIN_MENU;
  const moduleId = mode.status === MODE_STATUS.AVAILABLE && shell?.moduleId
    ? shell.moduleId
   : (shell?.fallbackModuleId || COMING_SOON_MODULE_ID);
  const defaultParams = shell?.defaultParams;
  const params: ScreenParams = mode.status === MODE_STATUS.AVAILABLE && isScreenParamMap(defaultParams)
    ? cloneScreenParamMap(defaultParams)
    : null;

  acc[mode.id] = {
    key: mode.id,
    label: mode.title,
    type: mode.type,
    description: mode.shortDescription || '',
    loader: () => loadBundledModule(moduleId),
    screenId,
    icon: mode.icon,
    tags: Array.isArray(mode.tags) ? [...mode.tags] : [],
    status: mode.status,
    unlockNotes: mode.unlockNotes || '',
    params
  };
  return acc;
}, {});

const SCREEN_DEFINITION_LOOKUP: Map<string, ModeDefinition> = Object.values(MODE_DEFINITIONS).reduce((map, definition) => {
  if (definition && definition.screenId && !map.has(definition.screenId)){
    map.set(definition.screenId, definition);
  }
  return map;
}, new Map<string, ModeDefinition>());

const MODE_METADATA = (MODES as ReadonlyArray<ModeConfig>).map(mode => {
  const definition = MODE_DEFINITIONS[mode.id];
  return {
    key: mode.id,
    id: definition?.screenId || SCREEN_MAIN_MENU,
    title: mode.title,
    description: mode.shortDescription,
    icon: mode.icon,
    tags: Array.isArray(mode.tags) ? [...mode.tags] : [],
    status: mode.status,
    params: definition?.params || null,
    parentId: mode.parentId || null
} satisfies MenuCardMetadata;
}) satisfies ReadonlyArray<MenuCardMetadata>;

const MODE_GROUP_METADATA = (MODE_GROUPS as ReadonlyArray<ModeGroup>).map(group => {
  const childModeIds = Array.isArray(group.childModeIds) ? [...group.childModeIds] : [];
  const childStatuses = childModeIds.reduce<Set<string>>((acc, childId) => {
    const child = (MODES as ReadonlyArray<ModeConfig>).find(mode => mode.id === childId);
    if (child){
      acc.add(child.status);
    }
    return acc;
  }, new Set<string>());
  let status: string = MODE_STATUS.PLANNED;
  if (childStatuses.has(MODE_STATUS.AVAILABLE)){
    status = MODE_STATUS.AVAILABLE;
  } else if (childStatuses.has(MODE_STATUS.COMING_SOON)){
    status = MODE_STATUS.COMING_SOON;
  } else if (childStatuses.size > 0){
    const derivedStatus = Array.from(childStatuses)[0];
    if (derivedStatus){
      status = derivedStatus;
    }
  }
  return {
    key: group.id,
    id: SCREEN_MAIN_MENU,
    title: group.title,
    description: group.shortDescription,
    icon: group.icon,
    tags: Array.isArray(group.tags) ? [...group.tags] : [],
    status,
    params: null,
    parentId: null,
    isGroup: true,
    childModeIds,
    extraClasses: Array.isArray(group.extraClasses) ? [...group.extraClasses] : []
  } satisfies MenuCardMetadata;
}) satisfies ReadonlyArray<MenuCardMetadata>;

const CARD_METADATA: ReadonlyArray<MenuCardMetadata> = Object.freeze([
  ...MODE_METADATA,
  ...MODE_GROUP_METADATA
]);

const MENU_SECTIONS: ReadonlyArray<MenuSection> = Object.freeze(
  getMenuSections({
    includeStatuses: [MODE_STATUS.AVAILABLE, MODE_STATUS.COMING_SOON]
  }).map(section => Object.freeze({
    id: section.id,
    title: section.title,
    entries: Object.freeze(section.entries.map(entry => Object.freeze({
      id: entry.id,
      type: entry.type,
      cardId: entry.cardId,
      childModeIds: Object.freeze([...entry.childModeIds])
    })))
  }))
);

let activeModal: HTMLElement | null = null;
let shellInstance: Shell | null = null;
let rootElement: HTMLElement | null = null;
let pveRenderToken = 0;
const bootstrapOptions: { isFileProtocol: boolean; playerGender?: string } = { isFileProtocol: false };
let renderMessageRef: RenderMessage | null = null;
let renderMessageIsExternal = false;
let mainMenuView: MaybeViewController = null;
let customScreenController: MaybeViewController = null;
let customScreenId: string | null = null;
let customScreenToken = 0;
let collectionView: MaybeViewController = null;
let collectionRenderToken = 0;
let lineupView: LineupViewHandle | null = null;
let lineupRenderToken = 0;

function areScreenParamsEqual(current: ScreenParams, next: ScreenParams): boolean{
  if (current === next){
    return true;
  }

  if (current === null || next === null){
    return false;
  }

  const currentKeys = Object.keys(current);
  const nextKeys = Object.keys(next);

  if (currentKeys.length !== nextKeys.length){
    return false;
  }

  for (const key of currentKeys){
    if (!Object.prototype.hasOwnProperty.call(next, key)){
      return false;
    }
    if (current[key] !== next[key]){
      return false;
    }
  }

  return true;
}

function dispatchLoaded(): void{
  try {
    window.dispatchEvent(new Event(SUCCESS_EVENT));
  } catch (err) {
    console.warn('Unable to dispatch load event', err);
  }
}

function ensureRenderer(): RenderMessage{
  if (typeof window.arcluneRenderMessage === 'function'){
    return window.arcluneRenderMessage;
  }
  return (options: RenderMessageOptions = {}) => {
    const { title = 'Arclune', body = '' } = options;
    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '640px';
    wrapper.style.margin = '48px auto';
    wrapper.style.padding = '32px';
    wrapper.style.background = 'rgba(12,18,24,0.85)';
    wrapper.style.border = '1px solid #2a3a4a';
    wrapper.style.borderRadius = '16px';
    wrapper.style.textAlign = 'center';
    wrapper.style.lineHeight = '1.6';
    wrapper.innerHTML = `
      <h2 style="margin-top:0;color:#ffe066;">${title}</h2>
      ${body}
    `;
    document.body.innerHTML = '';
    document.body.appendChild(wrapper);
  };
}

function resolveErrorMessage(error: unknown, fallback = 'Lỗi không xác định.'): string{
  if (error && typeof error === 'object' && 'message' in error){
    return String(error.message);
  }
  const value = typeof error === 'undefined' || error === null ? '' : String(error);
  return value.trim() ? value : fallback;
}

function showFatalError(error: unknown, renderMessage: RenderMessage, options?: { isFileProtocol?: boolean }): void{
  const { isFileProtocol = false } = options || {};
  const detail = resolveErrorMessage(error);
  const advice = isFileProtocol
    ? '<p><small>Arclune đang chạy trực tiếp từ ổ đĩa (<code>file://</code>). Nếu gặp lỗi tải tài nguyên, hãy thử mở thông qua một HTTP server tĩnh.</small></p>'
    : '';
  renderMessage({
    title: 'Không thể khởi động Arclune',
    body: `<p>${detail}</p>${advice}`
  });
}

function isMissingModuleError(error: unknown): boolean{
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: unknown; message?: unknown; name?: unknown; cause?: unknown };
  if (err.code === 'MODULE_NOT_FOUND') return true;
  const message = typeof err.message === 'string' ? err.message : '';
  const name = typeof err.name === 'string' ? err.name : '';
  if (name === 'TypeError'){
    const typeErrorImportPatterns = [
      /Failed to fetch dynamically imported module/i,
      /dynamically imported module/i,
      /Importing a module script failed/i,
      /Failed to resolve module specifier/i,
      /Module script load failed/i,
      /MIME type/i
    ];
    if (typeErrorImportPatterns.some(pattern => pattern.test(message))){
      return true;
    }
  }
if (err.cause && err.cause !== error && typeof err.cause === 'object'){
    if (isMissingModuleError(err.cause)){
      return true;
    }
  }
  return /Cannot find module/i.test(message) || /module(\s|-)not(\s|-)found/i.test(message);
}

function isComingSoonModule(module: unknown): boolean{
  if (!module) return true;
  const record = module as { comingSoon?: unknown; COMING_SOON_MODULE?: { comingSoon?: unknown } };
  if (record.comingSoon) return true;
  if (record.COMING_SOON_MODULE?.comingSoon) return true;
  return false;
}

function dismissModal(): void{
  if (activeModal && typeof activeModal.remove === 'function'){
    activeModal.remove();
  }
  activeModal = null;
}

function clearAppScreenClasses(): void{
  const root = rootElement;
  if (!root || !root.classList) return;
  APP_SCREEN_CLASSES.forEach(cls => root.classList.remove(cls));
}

function destroyCustomScreen(force = false): void{
  const hasActiveScreen = !!(customScreenController || customScreenId);
  if (!force && !hasActiveScreen){
    return;
  }
  if (customScreenController && typeof customScreenController.destroy === 'function'){
    try {
      customScreenController.destroy();
    } catch (err) {
      console.error('[screen] cleanup error', err);
    }
  }
  customScreenController = null;
  customScreenId = null;
  const root = rootElement;
  if (!root) return;
  if (root.classList){
    APP_SCREEN_CLASSES.forEach(cls => root.classList.remove(cls));
  }
  if (typeof root.innerHTML === 'string'){
    root.innerHTML = '';
  }
}

function destroyCollectionView(): void{
  if (collectionView && typeof collectionView.destroy === 'function'){
    try {
      collectionView.destroy();
    } catch (err) {
      console.error('[collection] cleanup error', err);
    }
  }
  collectionView = null;
}

function destroyLineupView(): void{
  if (lineupView && typeof lineupView.destroy === 'function'){
    try {
      lineupView.destroy();
    } catch (err) {
      console.error('[lineup] cleanup error', err);
    }
  }
  lineupView = null;
}

function mergeDefinitionParams(definition: ModeDefinition | null, params: ScreenParams): ScreenParams{
  const baseValue = cloneScreenParams(definition?.params ?? null);
  const incomingValue = cloneScreenParams(params);

  if (!baseValue && !incomingValue){
    return null;
  }

  if (!baseValue){
    return incomingValue;
  }

  if (!incomingValue){
    return baseValue;
  }

  return { ...baseValue, ...incomingValue };
}

function resolveScreenRenderer(module: unknown): ScreenRenderer | null{
  const candidate = resolveModuleFunction<ScreenRenderer>(
    module,
    ['renderCollectionScreen', 'renderScreen'],
    ['render']
  );
  return typeof candidate === 'function' ? candidate : null;
}

function getDefinitionByScreen(screenId: string): ModeDefinition | null{
  return SCREEN_DEFINITION_LOOKUP.get(screenId) || null;
}

async function mountModeScreen(screenId: string, params: ScreenParams): Promise<void>{
  const token = ++customScreenToken;
  destroyCustomScreen(true);
  dismissModal();
  if (!rootElement || !shellInstance) return;

  const definition = getDefinitionByScreen(screenId);
  if (!definition){
    console.warn(`[screen] Không tìm thấy định nghĩa cho màn hình ${screenId}.`);
    shellInstance.enterScreen(SCREEN_MAIN_MENU);
    return;
  }

  const mergedParams = mergeDefinitionParams(definition, params);

  clearAppScreenClasses();
  if (rootElement.classList){
    rootElement.classList.add(`app--${screenId}`);
  }
  if (typeof rootElement.innerHTML === 'string'){
    const label = definition.label || 'màn hình';
    rootElement.innerHTML = `<div class="app-loading">Đang tải ${label}...</div>`;
  }

  let module: unknown;
  try {
    module = await definition.loader();
  } catch (error) {
    if (token !== customScreenToken) return;
    if (isMissingModuleError(error)){
      showComingSoonModal(definition.label);
      shellInstance.enterScreen(SCREEN_MAIN_MENU);
      return;
    }
    throw error;
  }

  if (token !== customScreenToken) return;

  if (isComingSoonModule(module)){
    showComingSoonModal(definition.label);
    shellInstance.enterScreen(SCREEN_MAIN_MENU);
    return;
  }

  const renderer = resolveScreenRenderer(module);
  if (typeof renderer !== 'function'){
    throw new Error(`Module màn hình ${screenId} không cung cấp hàm render hợp lệ.`);
  }

  if (typeof rootElement.innerHTML === 'string'){
    rootElement.innerHTML = '';
  }

  const controller = renderer({
    root: rootElement,
    shell: shellInstance,
    definition,
    params: mergedParams,
    screenId
  }) ?? null;

  customScreenController = controller as MaybeViewController;
  customScreenId = screenId;
}

function showComingSoonModal(label?: string): void{
  dismissModal();
  if (!rootElement) return;
  const modal = document.createElement('div');
  modal.className = 'app-modal';
  modal.innerHTML = `
    <div class="app-modal__dialog">
      <h3 class="app-modal__title">Coming soon</h3>
      <p class="app-modal__body">${label ? `Chế độ <b>${label}</b> đang được hoàn thiện.` : 'Tính năng đang được phát triển.'}</p>
      <div class="app-modal__actions">
        <button type="button" class="app-modal__button" data-action="close">Đã hiểu</button>
      </div>
    </div>
  `;
  const closeButton = modal.querySelector('[data-action="close"]');
  if (closeButton instanceof HTMLElement){
    closeButton.addEventListener('click', ()=>{
      dismissModal();
    });
  }
  rootElement.appendChild(modal);
  activeModal = modal;
}

function showPveBoardMissingNotice(message: string): boolean{
  const title = 'Không thể tải chế độ PvE';
  if (renderMessageRef && renderMessageIsExternal){
    try {
      renderMessageRef({
        title,
        body: `<p>${message}</p>`
      });
      return true;
    } catch (error) {
      console.warn('Không thể sử dụng renderMessageRef để hiển thị thông báo PvE.', error);
    }
  }
  if (typeof document === 'undefined' || !document.body){
    return false;
  }
  const modalId = 'pve-board-error-modal';
  const existing = document.getElementById(modalId);
  if (existing && typeof existing.remove === 'function'){
    existing.remove();
  }
  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'app-modal';
  modal.setAttribute('role', 'alertdialog');
  modal.setAttribute('aria-modal', 'true');
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.padding = '16px';
  modal.style.background = 'rgba(8, 12, 18, 0.82)';
  modal.style.zIndex = '2147483647';
  modal.innerHTML = `
    <div class="app-modal__dialog" style="max-width:420px;width:100%;background:#0c1218;border:1px solid #2a3a4a;border-radius:16px;padding:24px;box-shadow:0 12px 32px rgba(0,0,0,0.45);text-align:center;">
      <h3 class="app-modal__title" style="margin-top:0;margin-bottom:12px;color:#ffe066;">${title}</h3>
      <p class="app-modal__body" style="margin:0 0 16px;color:#f1f3f5;line-height:1.6;">${message}</p>
      <div class="app-modal__actions">
        <button type="button" class="app-modal__button" data-action="close" style="min-width:120px;padding:8px 16px;border-radius:999px;background:#1f2c3a;color:#f1f3f5;border:1px solid #334559;cursor:pointer;">Đã hiểu</button>
      </div>
    </div>
  `;
  const closeButton = modal.querySelector('[data-action="close"]');
  if (closeButton instanceof HTMLElement){
    closeButton.addEventListener('click', () => {
      modal.remove();
    });
  }
  document.body.appendChild(modal);
  return true;
}

async function renderCollectionScreen(params: ScreenParams): Promise<void>{
  const root = rootElement;
  const shell = shellInstance;
  if (!root || !shell) return;
  const token = ++collectionRenderToken;
  dismissModal();
  clearAppScreenClasses();
  destroyCollectionView();
  lineupRenderToken += 1;
  destroyLineupView();
  if (root.classList){
    root.classList.add('app--collection');
  }
  if (typeof root.innerHTML === 'string'){
    root.innerHTML = '<div class="app-loading">Đang tải bộ sưu tập...</div>';
  }

  let module: unknown;
  try {
    module = await loadBundledModule(COLLECTION_SCREEN_MODULE_ID);
  } catch (error) {
    if (token !== collectionRenderToken) return;
    throw error;
  }

  if (token !== collectionRenderToken) return;

  const render = resolveModuleFunction(
    module,
    ['renderCollectionScreen', 'renderCollectionView'],
    ['render']
  ) as ScreenRenderer | null;
  if (typeof render !== 'function'){
    throw new Error('Module bộ sưu tập không cung cấp hàm render hợp lệ.');
  }

  const definition = getDefinitionByScreen(SCREEN_COLLECTION);
  if (!definition){
    throw new Error('Không tìm thấy định nghĩa màn hình bộ sưu tập.');
  }
  collectionView = (render({
    root,
    shell,
    definition,
    params: params || null,
    screenId: SCREEN_COLLECTION
  }) ?? null);
}

async function renderLineupScreen(params: ScreenParams): Promise<void>{
  const root = rootElement;
  const shell = shellInstance;
  if (!root || !shell) return;
  const token = ++lineupRenderToken;
  dismissModal();
  clearAppScreenClasses();
  destroyLineupView();
  collectionRenderToken += 1;
  destroyCollectionView();
  if (root.classList){
    root.classList.add('app--lineup');
  }
  if (typeof root.innerHTML === 'string'){
    root.innerHTML = '<div class="app-loading">Đang tải đội hình...</div>';
  }

  let module: unknown;
  try {
    module = await loadBundledModule(LINEUP_SCREEN_MODULE_ID);
  } catch (error) {
    if (token !== lineupRenderToken) return;
    throw error;
  }

  if (token !== lineupRenderToken) return;

  const render = resolveModuleFunction(
    module,
    ['renderLineupScreen'],
    ['render']
  ) as ScreenRenderer | null;
  if (typeof render !== 'function'){
    throw new Error('Module đội hình không cung cấp hàm render hợp lệ.');
  }

  const definition = getDefinitionByScreen(SCREEN_LINEUP);
  if (!definition){
    throw new Error('Không tìm thấy định nghĩa màn hình đội hình.');
  }
  const lineupResult = render({
    root,
    shell,
    definition,
    params: params || null,
    screenId: SCREEN_LINEUP
  });
  lineupView = (lineupResult as LineupViewHandle | void) ?? null;
}

function renderMainMenuScreen(): void{
  if (!rootElement || !shellInstance) return;
  dismissModal();
  clearAppScreenClasses();
  if (rootElement.classList){
    rootElement.classList.add('app--main-menu');
  }

  lineupRenderToken += 1;
  destroyLineupView();

  if (mainMenuView && typeof mainMenuView.destroy === 'function'){
    mainMenuView.destroy();
    mainMenuView = null;
  }
  const sections: ReadonlyArray<MenuSection> = MENU_SECTIONS;
  mainMenuView = renderMainMenuView({
    root: rootElement,
    shell: shellInstance,
    sections,
    metadata: CARD_METADATA,
    playerGender: bootstrapOptions.playerGender || 'neutral',
    onShowComingSoon: (mode: MenuCardMetadata) => {
      const def = mode?.key ? MODE_DEFINITIONS[mode.key] : null;
      const label = def?.label || mode?.title || mode?.label || '';
      showComingSoonModal(label);
    }
  }) as MaybeViewController;
}

function renderPveLayout(options: RenderPveLayoutOptions): HTMLElement | null{
  if (!rootElement) return null;
  dismissModal();
  clearAppScreenClasses();
  if (rootElement.classList){
    rootElement.classList.add('app--pve');
  }
  rootElement.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'pve-screen';
  container.setAttribute('data-mode', options?.modeKey || 'pve');
  container.innerHTML = `
    <div class="pve-toolbar">
      <h2 class="pve-toolbar__title">${options?.title || 'PvE'}</h2>
      <div class="pve-toolbar__actions">
        <button type="button" class="pve-toolbar__button" data-action="exit">Thoát</button>
      </div>
    </div>
    <div class="pve-stage">
      <div id="boardWrap">
        <canvas id="board"></canvas>
      </div>
      <div id="bottomHUD" class="hud-bottom">
        <div id="timer" class="chip chip-timer">04:00</div>
        <div id="costChip" class="chip chip-cost">
          <div id="costRing"></div>
          <div id="costNow">0</div>
        </div>
      </div>
      <div id="cards"></div>
    </div>
  `;
  rootElement.appendChild(container);
  const exitButton = container.querySelector('[data-action="exit"]');
  if (exitButton instanceof HTMLElement && typeof options?.onExit === 'function'){
    exitButton.addEventListener('click', options.onExit);
  }
  return container;
}

function teardownActiveSession(): void{
  if (!shellInstance) return;
  const current = shellInstance.getState()?.activeSession as { stop?: () => void } | null;
  if (current && typeof current.stop === 'function'){
    try {
      current.stop();
    } catch (err) {
      console.warn('[pve] stop session failed', err);
    }
  }
  shellInstance.setActiveSession(null);
}

async function mountPveScreen(params: ScreenParams): Promise<void>{
  const token = ++pveRenderToken;
  const extractStartConfig = (source: unknown): UnknownRecord | null => {
    if (!source || typeof source !== 'object') return null;
    const record = source as UnknownRecord & { sessionConfig?: unknown };
    const payload = record.sessionConfig && typeof record.sessionConfig === 'object'
      ? record.sessionConfig as UnknownRecord
      : record;
    return { ...payload };
  };
  teardownActiveSession();
  if (!shellInstance) return;
  const shell = shellInstance;
  const candidateModeKey = params && typeof params === 'object' && !Array.isArray(params)
    ? (params as { modeKey?: unknown }).modeKey
    : undefined;
  const modeKey = typeof candidateModeKey === 'string' && MODE_DEFINITIONS[candidateModeKey]
    ? candidateModeKey
    : 'campaign';
  const fallbackDefinition = MODE_DEFINITIONS.campaign;
  if (!fallbackDefinition){
    throw new Error('Thiếu định nghĩa chế độ campaign.');
  }
  const definition: ModeDefinition = MODE_DEFINITIONS[modeKey] ?? fallbackDefinition;
  const rawParams = params && typeof params === 'object' && !Array.isArray(params)
    ? { ...(params as UnknownRecord) }
    : {};
  const defaultParams = definition?.params && typeof definition.params === 'object' && !Array.isArray(definition.params)
    ? { ...(definition.params as UnknownRecord) }
    : {};
  const mergedParams: UnknownRecord = { ...defaultParams, ...rawParams };
  const definitionConfig = extractStartConfig(definition?.params ?? null);
  const incomingConfig = extractStartConfig(params);
  const mergedStartConfig: UnknownRecord = {
    ...(definitionConfig || {}),
    ...(incomingConfig || {})
  };
  const mergedParamsWithConfig = mergedParams as UnknownRecord & { sessionConfig?: unknown };
  const hasSessionConfig = Object.prototype.hasOwnProperty.call(mergedParamsWithConfig, 'sessionConfig');
  const sessionConfigValue = hasSessionConfig && mergedParamsWithConfig.sessionConfig && typeof mergedParamsWithConfig.sessionConfig === 'object'
    ? { ...(mergedParamsWithConfig.sessionConfig as UnknownRecord) }
    : mergedParamsWithConfig.sessionConfig;
  const hasSessionConfigObject = hasSessionConfig && sessionConfigValue && typeof sessionConfigValue === 'object';
  const { sessionConfig: _ignoredSessionConfig, ...restMergedParams } = mergedParamsWithConfig;
  const createSessionOptions: UnknownRecord = {
    ...restMergedParams,
    ...mergedStartConfig,
    ...(hasSessionConfig ? {
      sessionConfig: hasSessionConfigObject ? { ...sessionConfigValue as UnknownRecord } : sessionConfigValue
    } : {})
  };
  const startSessionOptions: UnknownRecord = {
    ...restMergedParams,
    ...mergedStartConfig
  };
  if (rootElement){
    clearAppScreenClasses();
    if (rootElement.classList){
      rootElement.classList.add('app--pve');
    }
    rootElement.innerHTML = `<div class="app-loading">Đang tải ${definition.label}...</div>`;
  }
  let module: unknown;
  try {
    module = await definition.loader();
  } catch (error) {
    if (token !== pveRenderToken) return;
    if (isMissingModuleError(error)){
      showComingSoonModal(definition.label);
      shell.enterScreen(SCREEN_MAIN_MENU);
      return;
    }
    throw error;
  }
  if (token !== pveRenderToken) return;
  if (isComingSoonModule(module)){
    showComingSoonModal(definition.label);
    shell.enterScreen(SCREEN_MAIN_MENU);
    return;
  }
  const createPveSession = resolveModuleFunction(
    module,
    ['createPveSession']
  ) as ((container: HTMLElement, options: UnknownRecord) => PveSession) | null;
  if (typeof createPveSession !== 'function'){
    throw new Error('PvE module missing createPveSession().');
  }
  const container = renderPveLayout({
    title: definition.label,
    modeKey: definition.key,
    onExit: ()=>{
      const state = shell.getState();
      const session = state?.activeSession;
      if (isStoppableSession(session)){
        try {
          session.stop();
        } catch (err) {
          console.warn('[pve] stop session failed', err);
        }
      }
      shell.setActiveSession(null);
      shell.enterScreen(SCREEN_MAIN_MENU);
    }
  });
  if (!container){
    throw new Error('Không thể dựng giao diện PvE.');
  }
  const session = createPveSession(container, createSessionOptions) as PveSession;
  shell.setActiveSession(session);
  if (isStartableSession(session)){
    const scheduleRetry = (callback: () => void) => {
      if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'){
        window.requestAnimationFrame(callback);
      } else {
        setTimeout(callback, 0);
      }
    };
    const MAX_BOARD_RETRIES = 30;
    const startSessionSafely = () => {
      if (token !== pveRenderToken) return;
      const startConfig = { ...startSessionOptions, root: container };
      try {
        const result = session.start(startConfig);
        if (!result){
          handleMissingBoard();
        }
      } catch (err) {
        shell.setActiveSession(null);
        throw err;
      }
    };
    const handleMissingBoard = () => {
      const message = 'Không thể tải bàn chơi PvE. Đang quay lại menu chính.';
      const displayed = showPveBoardMissingNotice(message);
      if (!displayed){
        console.warn(message);
      }
      shell.setActiveSession(null);
      shell.enterScreen(SCREEN_MAIN_MENU);
    };
    const attemptStart = (attempt = 0) => {
      if (token !== pveRenderToken) return;
      const boardElement = container.querySelector('#board');
      if (boardElement){
        startSessionSafely();
        return;
      }
      if (attempt >= MAX_BOARD_RETRIES){
        handleMissingBoard();
        return;
      }
      scheduleRetry(() => attemptStart(attempt + 1));
    };
    const initialBoard = container.querySelector('#board');
    if (initialBoard){
      startSessionSafely();
    } else {
      attemptStart();
    }
  }
}

(function bootstrap(){
  const renderMessage = ensureRenderer();
  const protocol = window?.location?.protocol;
  const isFileProtocol = protocol === 'file:';
  try {
    if (isFileProtocol){
      console.warn('Đang chạy Arclune trực tiếp từ file://. Một số trình duyệt có thể chặn tài nguyên liên quan.');
    }
    rootElement = document.getElementById('appRoot');
    if (!rootElement){
      throw new Error('Không tìm thấy phần tử #appRoot.');
    }
    renderMessageRef = renderMessage;
    renderMessageIsExternal = typeof window !== 'undefined' && typeof window.arcluneRenderMessage === 'function';
    const handleShellError = (error: unknown) => {
      console.error('Arclune shell listener error', error);
      const renderer = renderMessageRef || renderMessage;
      if (renderer){
        showFatalError(error, renderer, bootstrapOptions);
      }
    };
    shellInstance = createAppShell({ onError: handleShellError });
    if (typeof document !== 'undefined'){
      const lowPowerEnabled = Boolean(CFG?.PERFORMANCE?.LOW_POWER_MODE ?? false);
      setPowerMode(lowPowerEnabled ? 'low' : 'normal');
    }
    bootstrapOptions.isFileProtocol = isFileProtocol;
    let lastScreen: string | null = null;
    let lastParams: ScreenParams = null;

    shellInstance.onChange((state: ShellEventPayload) => {
      const nextScreen = state.screen;
      const nextParams = state.screenParams;
      const screenChanged = nextScreen !== lastScreen;
      const paramsChanged = !areScreenParamsEqual(nextParams, lastParams);

      if (!screenChanged && !paramsChanged){
        return;
      }

      if (nextScreen === SCREEN_MAIN_MENU){
        customScreenToken += 1;
        destroyCustomScreen();
        collectionRenderToken += 1;
        destroyCollectionView();
        lineupRenderToken += 1;
        destroyLineupView();
        lastScreen = SCREEN_MAIN_MENU;
        lastParams = nextParams;
        pveRenderToken += 1;
        renderMainMenuScreen();
        return;
      }

      if (nextScreen === SCREEN_COLLECTION){
        customScreenToken += 1;
        destroyCustomScreen();
        collectionRenderToken += 1;
        destroyCollectionView();
        lineupRenderToken += 1;
        destroyLineupView();
        if (mainMenuView && typeof mainMenuView.destroy === 'function'){
          mainMenuView.destroy();
          mainMenuView = null;
        }
        lastScreen = SCREEN_COLLECTION;
        lastParams = nextParams;
        pveRenderToken += 1;
        renderCollectionScreen(nextParams || null).catch((error: unknown) => {
          console.error('Arclune failed to load collection screen', error);
          if (renderMessageRef){
            showFatalError(error, renderMessageRef, bootstrapOptions);
          }
        });
        return;
      }

      if (nextScreen === SCREEN_LINEUP){
        customScreenToken += 1;
        destroyCustomScreen();
        collectionRenderToken += 1;
        destroyCollectionView();
        lineupRenderToken += 1;
        destroyLineupView();
        if (mainMenuView && typeof mainMenuView.destroy === 'function'){
          mainMenuView.destroy();
          mainMenuView = null;
        }
        lastScreen = SCREEN_LINEUP;
        lastParams = nextParams;
        pveRenderToken += 1;
        renderLineupScreen(nextParams || null).catch((error: unknown) => {
          console.error('Arclune failed to load lineup screen', error);
          if (renderMessageRef){
            showFatalError(error, renderMessageRef, bootstrapOptions);
          }
        });
        return;
      }

      if (nextScreen === SCREEN_PVE){
        customScreenToken += 1;
        destroyCustomScreen();
        collectionRenderToken += 1;
        destroyCollectionView();
        lineupRenderToken += 1;
        destroyLineupView();
        if (mainMenuView && typeof mainMenuView.destroy === 'function'){
          mainMenuView.destroy();
          mainMenuView = null;
        }
        lastScreen = SCREEN_PVE;
        lastParams = nextParams;
        mountPveScreen(nextParams || {}).catch((error: unknown) => {
          console.error('Arclune failed to start PvE session', error);
          if (renderMessageRef){
            showFatalError(error, renderMessageRef, bootstrapOptions);
          }
        });
        return;
      }

      if (mainMenuView && typeof mainMenuView.destroy === 'function'){
        mainMenuView.destroy();
        mainMenuView = null;
      }

      collectionRenderToken += 1;
      destroyCollectionView();
      lineupRenderToken += 1;
      destroyLineupView();

      lastScreen = nextScreen;
      lastParams = nextParams;
      mountModeScreen(nextScreen, nextParams || null).catch((error: unknown) => {
        console.error(`Arclune failed to load screen ${nextScreen}`, error);
        if (renderMessageRef){
          showFatalError(error, renderMessageRef, bootstrapOptions);
        }
      });
    });
    
    dispatchLoaded();
  } catch (error) {
    console.error('Arclune failed to start', error);
    if (typeof window.arcluneShowFatal === 'function'){
      window.arcluneShowFatal(error);
    } else {
      showFatalError(error, renderMessage, { isFileProtocol });
    }
  }
})();
