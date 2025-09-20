import { startGame } from './main.js';

const SUCCESS_EVENT = 'arclune:loaded';

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

function showFileProtocolWarning(renderMessage, error){
  const detail = typeof error === 'undefined' ? '' : resolveErrorMessage(error);
  const detailMarkup = detail
    ? `<p style="margin-top:16px;"><small>Lỗi gốc: ${detail}</small></p>`
    : '';
  const body = `
    <p>Vui lòng khởi chạy Arclune thông qua một HTTP server thay vì mở trực tiếp từ ổ đĩa.</p>
    <p>Ví dụ: chạy <code>npx serve</code> hoặc bất kỳ server tĩnh nào khác rồi truy cập qua <code>http://localhost:*</code>.</p>
    ${detailMarkup}
  `;
  renderMessage({
    title: 'Không thể chạy từ file://',
    body
  });
}

function showFatalError(error, renderMessage){
  const detail = resolveErrorMessage(error);
  renderMessage({
    title: 'Không thể khởi động Arclune',
    body: `<p>${detail}</p>`
  });
}

(function bootstrap(){
  const renderMessage = ensureRenderer();
  const protocol = window?.location?.protocol;
  const isFileProtocol = protocol === 'file:';
  try {
    startGame();
    dispatchLoaded();
  } catch (error) {
    console.error('Arclune failed to start', error);
    if (typeof window.arcluneShowFatal === 'function'){
      window.arcluneShowFatal(error);
      } else if (isFileProtocol) {
      showFileProtocolWarning(renderMessage, error);
    } else {
      showFatalError(error, renderMessage);
    }
  }
})();
