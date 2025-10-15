import { createAppShell } from './app/shell.js';

const SUCCESS_EVENT = 'arclune:loaded';
const SCREEN_MAIN_MENU = 'main-menu';
const SCREEN_PVE = 'pve-session';

function loadBundledModule(id){
  if (typeof __require === 'function'){
    return Promise.resolve().then(() => __require(id));
  }
  return import(id);
}

const MODE_DEFINITIONS = {
  campaign: {
    key: 'campaign',
    label: 'Chiến Dịch',
    type: 'pve',
    description: 'Trải nghiệm tuyến cốt truyện PvE cổ điển.',
    loader: () => loadBundledModule('./modes/pve/session.js')
  },
  challenge: {
    key: 'challenge',
    label: 'Thử Thách',
    type: 'pve',
    description: 'Các kịch bản đặc biệt để thử nghiệm đội hình.',
    loader: () => loadBundledModule('./modes/pve/session.js')
  },
  arena: {
    key: 'arena',
    label: 'Đấu Trường',
    type: 'pve',
    description: 'PvE nhịp độ cao với quân đoàn bất tận.',
    loader: () => loadBundledModule('./modes/pve/session.js')
  },
  ares: {
    key: 'ares',
    label: 'Ares',
    type: 'coming-soon',
    description: 'PvP theo thời gian thực – đang phát triển.',
    loader: () => loadBundledModule('./modes/coming-soon.stub.js')
  },
  tongmon: {
    key: 'tongmon',
    label: 'Tông Môn',
    type: 'coming-soon',
    description: 'Xây dựng môn phái & quản lý tài nguyên – sắp ra mắt.',
    loader: () => loadBundledModule('./modes/coming-soon.stub.js')
  }
};

const MENU_SECTIONS = [
  { title: 'PvE', modeKeys: ['campaign', 'challenge', 'arena'] },
  { title: 'Khám phá', modeKeys: ['ares', 'tongmon'] }
];

let activeModal = null;
let shellInstance = null;
let rootElement = null;
let pveRenderToken = 0;
const bootstrapOptions = { isFileProtocol: false };
let renderMessageRef = null;

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
  return /Cannot find module/i.test(message) || /module(\s|-)not(\s|-)found/i.test(message);
}

function isComingSoonModule(module){
  if (!module) return true;
  if (module.comingSoon) return true;
  if (module.default && module.default.comingSoon) return true;
  return false;
}

function dismissModal(){
  if (activeModal && typeof activeModal.remove === 'function'){
    activeModal.remove();
  }
  activeModal = null;
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

function renderMainMenu(onSelectMode){
  if (!rootElement) return;
  dismissModal();
  rootElement.classList.remove('app--pve');
  const sections = MENU_SECTIONS.map(section => {
    const buttons = section.modeKeys
      .map(modeKey => MODE_DEFINITIONS[modeKey])
      .filter(Boolean)
      .map(def => {
        const comingSoon = def.type !== 'pve';
        const hint = def.description ? `<small>${def.description}</small>` : '';
        return `
          <button class="main-menu__button" data-mode="${def.key}"${comingSoon ? ' data-coming-soon="true"' : ''}>
            ${def.label}
            ${hint}
          </button>
        `;
      })
      .join('');
    return `
      <section>
        <h4 class="main-menu__section-title">${section.title}</h4>
        <div class="main-menu__grid">${buttons}</div>
      </section>
    `;
  }).join('');

  rootElement.innerHTML = `
    <div class="main-menu">
      <h1 class="main-menu__title">Arclune</h1>
      <p class="main-menu__subtitle">Chọn chế độ để bắt đầu.</p>
      <div class="main-menu__sections">${sections}</div>
    </div>
  `;

  const buttons = rootElement.querySelectorAll('[data-mode]');
  buttons.forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      const modeKey = btn.getAttribute('data-mode');
      if (typeof onSelectMode === 'function'){
        onSelectMode(modeKey);
      }
    });
  });
}

function renderPveLayout(options){
  if (!rootElement) return null;
  dismissModal();
  rootElement.classList.add('app--pve');
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

function getModeDefinition(modeKey){
  return MODE_DEFINITIONS[modeKey] || null;
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

function handleModeSelect(modeKey){
  const definition = getModeDefinition(modeKey);
  if (!definition){
    showComingSoonModal('Tính năng đang phát triển');
    return;
  }
  if (definition.type === 'pve'){
    shellInstance.enterScreen(SCREEN_PVE, { modeKey: definition.key });
    return;
  }
  definition.loader().then(module => {
    if (isComingSoonModule(module)){
      showComingSoonModal(definition.label);
      return;
    }
    showComingSoonModal(definition.label);
  }).catch(error => {
    if (isMissingModuleError(error)){
      showComingSoonModal(definition.label);
      return;
    }
    console.error('Failed to load mode', error);
    if (renderMessageRef){
      showFatalError(error, renderMessageRef, bootstrapOptions);
    } else if (typeof window.arcluneShowFatal === 'function'){
      window.arcluneShowFatal(error);
    }
  });
}

async function mountPveScreen(params){
  const token = ++pveRenderToken;
  teardownActiveSession();
  const modeKey = params?.modeKey && MODE_DEFINITIONS[params.modeKey] ? params.modeKey : 'campaign';
  const definition = MODE_DEFINITIONS[modeKey] || MODE_DEFINITIONS.campaign;
  if (rootElement){
    rootElement.classList.add('app--pve');
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
  const createPveSession = typeof module.createPveSession === 'function'
    ? module.createPveSession
    : (module.default && typeof module.default.createPveSession === 'function'
      ? module.default.createPveSession
      : null);
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
  const session = createPveSession(container);
  shellInstance.setActiveSession(session);
  if (typeof session.start === 'function'){
    try {
      session.start({ ...(params?.sessionConfig || {}), root: container });
    } catch (err) {
      shellInstance.setActiveSession(null);
      throw err;
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
    shellInstance = createAppShell();
    renderMessageRef = renderMessage;
    bootstrapOptions.isFileProtocol = isFileProtocol;
    let lastScreen = null;
    let lastParams = null;

    shellInstance.onChange(state => {
      if (state.screen === SCREEN_MAIN_MENU){
        if (lastScreen !== SCREEN_MAIN_MENU){
          lastScreen = SCREEN_MAIN_MENU;
          lastParams = null;
          pveRenderToken += 1;
          renderMainMenu(handleModeSelect);
        }
      } else if (state.screen === SCREEN_PVE){
        if (lastScreen !== SCREEN_PVE || state.screenParams !== lastParams){
          lastScreen = SCREEN_PVE;
          lastParams = state.screenParams;
          mountPveScreen(state.screenParams || {}).catch(error => {
            console.error('Arclune failed to start PvE session', error);
            if (renderMessageRef){
              showFatalError(error, renderMessageRef, bootstrapOptions);
            }
          });
        }
      }
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
