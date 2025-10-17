const STYLE_ID = 'collection-screen-style';

const FEATURE_SECTIONS = [
  {
    icon: '👥',
    title: 'Nhân vật & Sủng thú',
    description: 'Theo dõi tiến trình thu thập, cấp sao và class của toàn bộ roster.'
  },
  {
    icon: '📜',
    title: 'Công pháp & Vũ khí',
    description: 'Tổng hợp công pháp, vũ khí cùng cấp độ thức tỉnh và mốc đột phá.'
  },
  {
    icon: '🏅',
    title: 'Thành tựu & Phẩm cấp',
    description: 'Lưu trữ thành tựu, huy chương và chỉ số rank budget để so sánh.'
  }
];

function ensureStyles(){
  if (typeof document === 'undefined') return;
  let style = document.getElementById(STYLE_ID);
  if (!style || style.tagName.toLowerCase() !== 'style'){
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  const css = `
    .app--collection{padding:32px 16px 64px;}
    .collection-screen{max-width:1080px;margin:0 auto;display:flex;flex-direction:column;gap:32px;color:inherit;}
    .collection-screen__header{display:flex;flex-direction:column;gap:16px;}
    .collection-screen__back{align-self:flex-start;padding:10px 18px;border-radius:999px;border:1px solid rgba(125,211,252,.32);background:rgba(18,28,38,.72);color:#aee4ff;letter-spacing:.08em;text-transform:uppercase;font-size:12px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;}
    .collection-screen__back:hover{transform:translateY(-2px);border-color:rgba(174,228,255,.52);box-shadow:0 12px 26px rgba(6,12,20,.45);}
    .collection-screen__back:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
    .collection-screen__title{margin:0;font-size:36px;letter-spacing:.08em;text-transform:uppercase;}
    .collection-screen__subtitle{margin:0;color:#9cbcd9;font-size:16px;line-height:1.6;max-width:680px;}
    .collection-screen__content{display:flex;flex-direction:column;gap:28px;}
    .collection-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;}
    .collection-summary__card{padding:20px;border-radius:18px;border:1px solid rgba(125,211,252,.22);background:linear-gradient(150deg,rgba(16,26,36,.9),rgba(18,30,42,.62));display:flex;flex-direction:column;gap:8px;}
    .collection-summary__icon{font-size:28px;line-height:1;}
    .collection-summary__title{margin:0;font-size:16px;letter-spacing:.06em;text-transform:uppercase;}
    .collection-summary__desc{margin:0;color:#9cbcd9;font-size:13px;line-height:1.6;}
    .collection-empty{padding:24px;border-radius:18px;border:1px dashed rgba(125,211,252,.28);background:rgba(12,20,28,.72);display:flex;flex-direction:column;gap:12px;align-items:flex-start;}
    .collection-empty__title{margin:0;font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:#aee4ff;}
    .collection-empty__body{margin:0;color:#9cbcd9;font-size:13px;line-height:1.6;}
    @media(max-width:640px){
      .collection-screen__title{font-size:30px;}
      .collection-summary{grid-template-columns:repeat(auto-fit,minmax(180px,1fr));}
    }
  `;

  if (style.textContent !== css){
    style.textContent = css;
  }
}

function cloneValue(value){
  if (!value || typeof value !== 'object'){
    return value;
  }
  if (Array.isArray(value)){
    return value.slice();
  }
  return { ...value };
}

export function renderCollectionScreen(options = {}){
  const { root, shell, definition, params } = options;
  if (!root || typeof root !== 'object'){
    throw new Error('renderCollectionScreen cần một phần tử root hợp lệ.');
  }

  ensureStyles();

  if (root.classList){
    root.classList.add('app--collection');
  }
  if (typeof root.innerHTML === 'string'){
    root.innerHTML = '';
  }

  const cleanup = [];
  const container = typeof document !== 'undefined' ? document.createElement('div') : { appendChild() {} };
  if (container){
    container.className = 'collection-screen';
  }

  const header = typeof document !== 'undefined' ? document.createElement('header') : null;
  if (header){
    header.className = 'collection-screen__header';
  }

  const backButton = typeof document !== 'undefined' ? document.createElement('button') : null;
  if (backButton){
    backButton.type = 'button';
    backButton.className = 'collection-screen__back';
    backButton.textContent = '← Trở về menu chính';
    const handleBack = () => {
      if (shell && typeof shell.enterScreen === 'function'){
        shell.enterScreen('main-menu');
      }
    };
    backButton.addEventListener('click', handleBack);
    cleanup.push(() => backButton.removeEventListener('click', handleBack));
    header.appendChild(backButton);
  }

  const title = typeof document !== 'undefined' ? document.createElement('h1') : null;
  if (title){
    title.className = 'collection-screen__title';
    title.textContent = definition?.label || 'Bộ Sưu Tập';
    header.appendChild(title);
  }

  const subtitle = typeof document !== 'undefined' ? document.createElement('p') : null;
  if (subtitle){
    subtitle.className = 'collection-screen__subtitle';
    subtitle.textContent = definition?.description || 'Kho dữ liệu tập trung giúp bạn quản lý nhân vật, công pháp và tài nguyên đã mở khóa.';
    header.appendChild(subtitle);
  }

  if (header){
    container.appendChild(header);
  }

  const content = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (content){
    content.className = 'collection-screen__content';
  }

  const summary = typeof document !== 'undefined' ? document.createElement('section') : null;
  if (summary){
    summary.className = 'collection-summary';

    FEATURE_SECTIONS.forEach(feature => {
      const card = document.createElement('article');
      card.className = 'collection-summary__card';

      const icon = document.createElement('span');
      icon.className = 'collection-summary__icon';
      icon.textContent = feature.icon || '◆';
      card.appendChild(icon);

      const cardTitle = document.createElement('h2');
      cardTitle.className = 'collection-summary__title';
      cardTitle.textContent = feature.title;
      card.appendChild(cardTitle);

      const desc = document.createElement('p');
      desc.className = 'collection-summary__desc';
      desc.textContent = feature.description;
      card.appendChild(desc);

      summary.appendChild(card);
    });
  }

  if (summary && content){
    content.appendChild(summary);
  }

  const emptyState = typeof document !== 'undefined' ? document.createElement('section') : null;
  if (emptyState){
    emptyState.className = 'collection-empty';

    const emptyTitle = document.createElement('h3');
    emptyTitle.className = 'collection-empty__title';
    emptyTitle.textContent = 'Dữ liệu sẽ đồng bộ từ chiến dịch';
    emptyState.appendChild(emptyTitle);

    const mergedParams = mergeParams(definition?.params, params);
    const emptyBody = document.createElement('p');
    emptyBody.className = 'collection-empty__body';
    emptyBody.textContent = mergedParams?.hint
      ? mergedParams.hint
      : 'Tiến hành các hoạt động PvE và kinh tế để mở khóa mục lục bộ sưu tập.';
    emptyState.appendChild(emptyBody);

    content.appendChild(emptyState);
  }

  if (content){
    container.appendChild(content);
  }

  if (root.appendChild){
    root.appendChild(container);
  }

  return {
    destroy(){
      cleanup.forEach(fn => {
        try {
          fn();
        } catch (err) {
          console.error('[collection] cleanup error', err);
        }
      });
      if (root && root.classList){
        root.classList.remove('app--collection');
      }
      if (root && root.contains && container){
        try {
          root.removeChild(container);
        } catch (err) {
          console.error('[collection] remove container failed', err);
        }
      }
    }
  };
}

function mergeParams(defaultParams, incomingParams){
  const base = cloneValue(defaultParams);
  const incoming = cloneValue(incomingParams);

  if (base && typeof base === 'object' && !Array.isArray(base)){
    if (incoming && typeof incoming === 'object' && !Array.isArray(incoming)){
      return { ...base, ...incoming };
    }
    return base;
  }

  if (incoming && typeof incoming === 'object' && !Array.isArray(incoming)){
    return incoming;
  }

  if (typeof incoming !== 'undefined' && incoming !== null){
    return incoming;
  }

  if (typeof base !== 'undefined' && base !== null){
    return base;
  }

  return null;
}

export default { renderCollectionScreen };
