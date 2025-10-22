import { createAppShell } from './app/shell.js';
import { renderMainMenuView } from './screens/main-menu/view.js';
import { MODES, MODE_GROUPS, MODE_STATUS, getMenuSections } from './data/modes.js';

const SUCCESS_EVENT = 'arclune:loaded';
const SCREEN_MAIN_MENU = 'main-menu';
const SCREEN_PVE = 'pve-session';
const SCREEN_COLLECTION = 'collection';
const SCREEN_LINEUP = 'lineup';
const APP_SCREEN_CLASSES = [
  `app--${SCREEN_MAIN_MENU}`,
  `app--${SCREEN_PVE}`,
  `app--${SCREEN_COLLECTION}`,
  `app--${SCREEN_LINEUP}`
];

function loadBundledModule(id){
  const loader = typeof __require === 'function'
    ? Promise.resolve().then(() => __require(id))
    : import(id);

  return Promise.resolve(loader).then(module => {
    if (module && typeof module === 'object'){
      const comingSoonFlag = module.comingSoon ?? module.COMING_SOON_MODULE?.comingSoon;
      if (typeof comingSoonFlag !== 'undefined' && module.comingSoon !== comingSoonFlag){
        return { ...module, comingSoon: comingSoonFlag };
      }
    }
    return module;
  });
}

const MODE_DEFINITIONS = MODES.reduce((acc, mode) => {
  const shell = mode.shell || {};
  const screenId = shell.screenId || SCREEN_MAIN_MENU;
  const moduleId = mode.status === MODE_STATUS.AVAILABLE && shell.moduleId
    ? shell.moduleId
    : (shell.fallbackModuleId || './modes/coming-soon.stub.ts');
  const params = mode.status === MODE_STATUS.AVAILABLE && shell.defaultParams
    ? { ...shell.defaultParams }
    : null;

  acc[mode.id] = {
    key: mode.id,
    label: mode.title,
    type: mode.type,
    description: mode.shortDescription,
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

const SCREEN_DEFINITION_LOOKUP = Object.values(MODE_DEFINITIONS).reduce((map, definition) => {
  if (definition && definition.screenId && !map.has(definition.screenId)){
    map.set(definition.screenId, definition);
  }
  return map;
}, new Map());

const MODE_METADATA = MODES.map(mode => {
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
  };
});

const MODE_GROUP_METADATA = MODE_GROUPS.map(group => {
  const childModeIds = Array.isArray(group.childModeIds) ? [...group.childModeIds] : [];
  const childStatuses = childModeIds.reduce((acc, childId) => {
    const child = MODES.find(mode => mode.id === childId);
    if (child){
      acc.add(child.status);
    }
    return acc;
  }, new Set());
  let status = MODE_STATUS.PLANNED;
  if (childStatuses.has(MODE_STATUS.AVAILABLE)){
    status = MODE_STATUS.AVAILABLE;
  } else if (childStatuses.has(MODE_STATUS.COMING_SOON)){
    status = MODE_STATUS.COMING_SOON;
  } else if (childStatuses.size > 0){
    status = Array.from(childStatuses)[0];
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
  };
});

const CARD_METADATA = [...MODE_METADATA, ...MODE_GROUP_METADATA];

const MENU_SECTIONS = getMenuSections({
  includeStatuses: [MODE_STATUS.AVAILABLE, MODE_STATUS.COMING_SOON]
});

let activeModal = null;
let shellInstance = null;
let rootElement = null;
let pveRenderToken = 0;
const bootstrapOptions = { isFileProtocol: false };
let renderMessageRef = null;
let mainMenuView = null;
let customScreenController = null;
let customScreenId = null;
let customScreenToken = 0;
let collectionView = null;
let collectionRenderToken = 0;
let lineupView = null;
let lineupRenderToken = 0;

function dispatchLoaded(){
  try {
    window.dispatchEvent(new Event(SUCCESS_EVENT));
  } catch (err) {
    console.warn('Unable to dispatch load event', err);
  }
}

function ensureRenderer(){
  if (typeof window.arcluneRenderMessage === 'function'){
    return window.arcluneRenderMessage;
  }
  return (options = {}) => {
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

function resolveErrorMessage(error, fallback = 'Lỗi không xác định.'){
  if (error && typeof error === 'object' && 'message' in error){
    return String(error.message);
  }
  const value = typeof error === 'undefined' || error === null ? '' : String(error);
  return value.trim() ? value : fallback;
}

function showFatalError(error, renderMessage, options){
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

function isMissingModuleError(error){
  if (!error || typeof error !== 'object') return false;
  if ('code' in error && error.code === 'MODULE_NOT_FOUND') return true;
  const message = typeof error.message === 'string' ? error.message : '';
  const name = typeof error.name === 'string' ? error.name : '';
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
  if (error && error.cause && error.cause !== error && typeof error.cause === 'object'){
    if (isMissingModuleError(error.cause)){
      return true;
    }
  }
  return /Cannot find module/i.test(message) || /module(\s|-)not(\s|-)found/i.test(message);
}

function isComingSoonModule(module){
  if (!module) return true;
  if (module.comingSoon) return true;
  if (module.COMING_SOON_MODULE?.comingSoon) return true;
  return false;
}

function dismissModal(){
  if (activeModal && typeof activeModal.remove === 'function'){
    activeModal.remove();
  }
  activeModal = null;
}

function clearAppScreenClasses(){
  if (!rootElement || !rootElement.classList) return;
  APP_SCREEN_CLASSES.forEach(cls => rootElement.classList.remove(cls));
}

function destroyCustomScreen(force = false){
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
  if (!rootElement) return;
  if (rootElement.classList){
    APP_SCREEN_CLASSES.forEach(cls => rootElement.classList.remove(cls));
  }
  if (typeof rootElement.innerHTML === 'string'){
    rootElement.innerHTML = '';
  }
}

function destroyCollectionView(){
  if (collectionView && typeof collectionView.destroy === 'function'){
    try {
      collectionView.destroy();
    } catch (err) {
      console.error('[collection] cleanup error', err);
    }
  }
  collectionView = null;
}

function destroyLineupView(){
  if (lineupView && typeof lineupView.destroy === 'function'){
    try {
      lineupView.destroy();
    } catch (err) {
      console.error('[lineup] cleanup error', err);
    }
  }
  lineupView = null;
}

function cloneParamValue(value){
  if (!value || typeof value !== 'object'){
    return value;
  }
  if (Array.isArray(value)){
    return [...value];
  }
return { ...value };
}

function mergeDefinitionParams(definition, params){
  const baseValue = typeof definition?.params !== 'undefined'
    ? cloneParamValue(definition.params)
    : undefined;
  const incomingValue = typeof params !== 'undefined'
    ? cloneParamValue(params)
    : undefined;
  const baseIsObject = baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue);
  const incomingIsObject = incomingValue && typeof incomingValue === 'object' && !Array.isArray(incomingValue);

  if (baseIsObject || incomingIsObject){
    return {
      ...(baseIsObject ? baseValue : {}),
      ...(incomingIsObject ? incomingValue : {})
    };
  }

  if (typeof incomingValue !== 'undefined'){
    return incomingValue;
  }

  if (typeof baseValue !== 'undefined'){
    return baseValue;
  }

  return null;
}

function pickFunctionFromSource(source, preferredKeys = [], fallbackKeys = []){
  if (!source) return null;

  if (typeof source === 'function'){
    return source;
  }

  if (source && typeof source === 'object'){
    for (const key of preferredKeys){
      if (typeof source[key] === 'function'){
        return source[key];
      }
    }
    for (const key of fallbackKeys){
      if (typeof source[key] === 'function'){
        return source[key];
      }
    }
  }

  return null;
}

function resolveModuleFunction(module, preferredKeys = [], fallbackKeys = []){
  const candidate = pickFunctionFromSource(module, preferredKeys, fallbackKeys);
  return typeof candidate === 'function' ? candidate : null;
}

function resolveScreenRenderer(module){
  return resolveModuleFunction(
    module,
    ['renderCollectionScreen', 'renderScreen'],
    ['render']
  );
}

function getDefinitionByScreen(screenId){
  return SCREEN_DEFINITION_LOOKUP.get(screenId) || null;
}

async function mountModeScreen(screenId, params){
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

  let module;
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
  }) || null;

  customScreenController = controller;
  customScreenId = screenId;
}

function showComingSoonModal(label){
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
  if (closeButton){
    closeButton.addEventListener('click', ()=>{
      dismissModal();
    });
  }
  rootElement.appendChild(modal);
  activeModal = modal;
}

async function renderCollectionScreen(params){
  if (!rootElement || !shellInstance) return;
  const token = ++collectionRenderToken;
  dismissModal();
  clearAppScreenClasses();
  destroyCollectionView();
  lineupRenderToken += 1;
  destroyLineupView();
  if (rootElement.classList){
    rootElement.classList.add('app--collection');
  }
  if (typeof rootElement.innerHTML === 'string'){
    rootElement.innerHTML = '<div class="app-loading">Đang tải bộ sưu tập...</div>';
  }

  let module;
  try {
    module = await loadBundledModule('./screens/collection/index.js');
  } catch (error) {
    if (token !== collectionRenderToken) return;
    throw error;
  }

  if (token !== collectionRenderToken) return;

  const render = resolveModuleFunction(
    module,
    ['renderCollectionScreen', 'renderCollectionView'],
    ['render']
  );
  if (typeof render !== 'function'){
    throw new Error('Module bộ sưu tập không cung cấp hàm render hợp lệ.');
  }

  const definition = getDefinitionByScreen(SCREEN_COLLECTION);
  collectionView = render({
    root: rootElement,
    shell: shellInstance,
    definition,
    params: params || null
  }) || null;
}

async function renderLineupScreen(params){
  if (!rootElement || !shellInstance) return;
  const token = ++lineupRenderToken;
  dismissModal();
  clearAppScreenClasses();
  destroyLineupView();
  collectionRenderToken += 1;
  destroyCollectionView();
  if (rootElement.classList){
    rootElement.classList.add('app--lineup');
  }
  if (typeof rootElement.innerHTML === 'string'){
    rootElement.innerHTML = '<div class="app-loading">Đang tải đội hình...</div>';
  }

  let module;
  try {
    module = await loadBundledModule('./screens/lineup/index.js');
  } catch (error) {
    if (token !== lineupRenderToken) return;
    throw error;
  }

  if (token !== lineupRenderToken) return;

  const render = resolveModuleFunction(
    module,
    ['renderLineupScreen'],
    ['render']
  );
  if (typeof render !== 'function'){
    throw new Error('Module đội hình không cung cấp hàm render hợp lệ.');
  }

  const definition = getDefinitionByScreen(SCREEN_LINEUP);
  lineupView = render({
    root: rootElement,
    shell: shellInstance,
    definition,
    params: params || null
  }) || null;
}

function renderMainMenuScreen(){
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
  const sections = MENU_SECTIONS.map(section => ({
    id: section.id,
    title: section.title,
    entries: (section.entries || []).map(entry => ({
      id: entry.id,
      type: entry.type,
      cardId: entry.cardId,
      childModeIds: Array.isArray(entry.childModeIds) ? [...entry.childModeIds] : []
    }))
  }));
  mainMenuView = renderMainMenuView({
    root: rootElement,
    shell: shellInstance,
    sections,
    metadata: CARD_METADATA,
    playerGender: bootstrapOptions.playerGender || 'neutral',
    onShowComingSoon: mode => {
      const def = mode?.key ? MODE_DEFINITIONS[mode.key] : null;
      const label = def?.label || mode?.title || mode?.label || '';
      showComingSoonModal(label);
    }
  });
}

function renderPveLayout(options){
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
  `;
  rootElement.appendChild(container);
  const exitButton = container.querySelector('[data-action="exit"]');
  if (exitButton && typeof options?.onExit === 'function'){
    exitButton.addEventListener('click', options.onExit);
  }
  return container;
}

function teardownActiveSession(){
  if (!shellInstance) return;
  const current = shellInstance.getState()?.activeSession;
  if (current && typeof current.stop === 'function'){
    try {
      current.stop();
    } catch (err) {
      console.warn('[pve] stop session failed', err);
    }
  }
  shellInstance.setActiveSession(null);
}

async function mountPveScreen(params){
  const token = ++pveRenderToken;
  const extractStartConfig = (source) => {
    if (!source || typeof source !== 'object') return null;
    const payload = source.sessionConfig && typeof source.sessionConfig === 'object'
      ? source.sessionConfig
      : source;
    return { ...payload };
  };
  teardownActiveSession();
  const modeKey = params?.modeKey && MODE_DEFINITIONS[params.modeKey] ? params.modeKey : 'campaign';
  const definition = MODE_DEFINITIONS[modeKey] || MODE_DEFINITIONS.campaign;
  const rawParams = (params && typeof params === 'object') ? params : {};
  const defaultParams = (definition?.params && typeof definition.params === 'object') ? definition.params : {};
  const mergedParams = { ...defaultParams, ...rawParams };
  const definitionConfig = extractStartConfig(definition?.params);
  const incomingConfig = extractStartConfig(params);
  const mergedStartConfig = {
    ...(definitionConfig || {}),
    ...(incomingConfig || {})
  };
  const hasSessionConfig = Object.prototype.hasOwnProperty.call(mergedParams, 'sessionConfig');
  const sessionConfigValue = hasSessionConfig && mergedParams.sessionConfig && typeof mergedParams.sessionConfig === 'object'
    ? { ...mergedParams.sessionConfig }
    : mergedParams.sessionConfig;
    const hasSessionConfigObject = hasSessionConfig && sessionConfigValue && typeof sessionConfigValue === 'object';
  const { sessionConfig: _ignoredSessionConfig, ...restMergedParams } = mergedParams;
  const createSessionOptions = {
    ...restMergedParams,
    ...mergedStartConfig,
    ...(hasSessionConfig ? {
      sessionConfig: hasSessionConfigObject ? { ...sessionConfigValue } : sessionConfigValue
    } : {})
  };
  const startSessionOptions = {
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
  let module;
  try {
    module = await definition.loader();
  } catch (error) {
    if (token !== pveRenderToken) return;
    if (isMissingModuleError(error)){
      showComingSoonModal(definition.label);
      shellInstance.enterScreen(SCREEN_MAIN_MENU);
      return;
    }
    throw error;
  }
  if (token !== pveRenderToken) return;
  if (isComingSoonModule(module)){
    showComingSoonModal(definition.label);
    shellInstance.enterScreen(SCREEN_MAIN_MENU);
    return;
  }
  const createPveSession = resolveModuleFunction(
    module,
    ['createPveSession']
  );
  if (typeof createPveSession !== 'function'){
    throw new Error('PvE module missing createPveSession().');
  }
  const container = renderPveLayout({
    title: definition.label,
    modeKey: definition.key,
    onExit: ()=>{
      const state = shellInstance.getState();
      const session = state?.activeSession;
      if (session && typeof session.stop === 'function'){
        try {
          session.stop();
        } catch (err) {
          console.warn('[pve] stop session failed', err);
        }
      }
      shellInstance.setActiveSession(null);
      shellInstance.enterScreen(SCREEN_MAIN_MENU);
    }
  });
  if (!container){
    throw new Error('Không thể dựng giao diện PvE.');
  }
  const session = createPveSession(container, createSessionOptions);
  shellInstance.setActiveSession(session);
  if (typeof session.start === 'function'){
    const scheduleRetry = (callback) => {
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
        shellInstance.setActiveSession(null);
        throw err;
      }
    };
    const handleMissingBoard = () => {
      if (typeof window !== 'undefined' && typeof window.alert === 'function'){
        window.alert('Không thể tải bàn chơi PvE. Đang quay lại menu chính.');
      } else {
        console.warn('Không thể tải bàn chơi PvE. Đang quay lại menu chính.');
      }
      shellInstance.setActiveSession(null);
      shellInstance.enterScreen(SCREEN_MAIN_MENU);
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
    const handleShellError = (error) => {
      console.error('Arclune shell listener error', error);
      const renderer = renderMessageRef || renderMessage;
      if (renderer){
        showFatalError(error, renderer, bootstrapOptions);
      }
    };
    shellInstance = createAppShell({ onError: handleShellError });
    bootstrapOptions.isFileProtocol = isFileProtocol;
    let lastScreen = null;
    let lastParams = null;

    shellInstance.onChange(state => {
      const nextScreen = state.screen;
      const nextParams = state.screenParams;
      const screenChanged = nextScreen !== lastScreen;
      const paramsChanged = nextParams !== lastParams;

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
        renderCollectionScreen(nextParams || null).catch(error => {
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
        renderLineupScreen(nextParams || null).catch(error => {
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
        mountPveScreen(nextParams || {}).catch(error => {
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
      mountModeScreen(nextScreen, nextParams || null).catch(error => {
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
