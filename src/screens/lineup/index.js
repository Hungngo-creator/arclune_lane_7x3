const STYLE_ID = 'lineup-screen-style';

function ensureStyles(){
  let style = document.getElementById(STYLE_ID);
  if (!style || style.tagName.toLowerCase() !== 'style'){
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  const css = `
    .app--lineup{padding:32px 16px 64px;}
    .lineup-screen{max-width:1080px;margin:0 auto;display:flex;flex-direction:column;gap:28px;color:inherit;}
    .lineup-screen__header{display:flex;flex-direction:column;gap:12px;}
    .lineup-screen__title{margin:0;font-size:36px;letter-spacing:.08em;text-transform:uppercase;}
    .lineup-screen__subtitle{margin:0;color:#9cbcd9;line-height:1.6;font-size:16px;}
    .lineup-screen__actions{display:flex;gap:12px;flex-wrap:wrap;}
    .lineup-screen__button{padding:10px 18px;border-radius:999px;border:1px solid rgba(125,211,252,.38);background:rgba(16,26,36,.85);color:#aee4ff;font-size:13px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;}
    .lineup-screen__button:hover{transform:translateY(-2px);box-shadow:0 14px 28px rgba(6,12,18,.5);border-color:rgba(125,211,252,.6);}
    .lineup-screen__button:focus-visible{outline:2px solid rgba(125,211,252,.7);outline-offset:3px;}
    .lineup-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;}
    .lineup-card{display:flex;flex-direction:column;gap:12px;padding:22px;border-radius:20px;border:1px solid rgba(125,211,252,.22);background:linear-gradient(160deg,rgba(16,26,36,.94),rgba(12,20,30,.78));box-shadow:0 18px 44px rgba(6,12,20,.4);}
    .lineup-card__title{margin:0;font-size:18px;letter-spacing:.06em;text-transform:uppercase;}
    .lineup-card__meta{margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7da0c7;}
    .lineup-card__desc{margin:0;font-size:14px;line-height:1.6;color:#9cbcd9;}
    .lineup-card__members{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:14px;border:1px solid rgba(125,211,252,.16);background:rgba(12,20,30,.82);}
    .lineup-card__members-title{margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .lineup-card__members-list{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px;font-size:13px;color:#c8e7ff;}
    .lineup-screen__empty{margin:0;font-size:15px;color:#9cbcd9;}
    @media(max-width:640px){.lineup-screen__title{font-size:30px;}.lineup-card{padding:18px;}}
  `;

  if (style.textContent !== css){
    style.textContent = css;
  }
}

function mergeParams(base, override){
  if (!base && !override) return null;
  if (!base) return typeof override === 'object' ? { ...override } : override;
  if (!override) return typeof base === 'object' ? { ...base } : base;
  if (typeof base === 'object' && typeof override === 'object' && !Array.isArray(base) && !Array.isArray(override)){
    return { ...base, ...override };
  }
  return override;
}

function normalizeMembers(value){
  if (!value) return [];
  if (Array.isArray(value)){
    return value.map(entry => {
      if (!entry || typeof entry === 'string'){
        return String(entry || '').trim();
      }
      const name = entry.name || entry.title || entry.id || '';
      const role = entry.role || entry.class || entry.archetype || '';
      return [name, role].filter(Boolean).join(' · ');
    }).filter(Boolean);
  }
  if (typeof value === 'object'){
    return Object.values(value).map(entry => {
      if (!entry) return '';
      if (typeof entry === 'string') return entry;
      const name = entry.name || entry.title || entry.id || '';
      const role = entry.role || entry.class || entry.archetype || '';
      return [name, role].filter(Boolean).join(' · ');
    }).filter(Boolean);
  }
  return [String(value)].filter(Boolean);
}

function toLineupEntries(definitionParams, params){
  const base = Array.isArray(definitionParams?.lineups) ? definitionParams.lineups : [];
  const override = Array.isArray(params?.lineups) ? params.lineups : null;
  const merged = override || base;
  if (!Array.isArray(merged)) return [];
  return merged.map((entry, index) => {
    const safe = entry && typeof entry === 'object' ? entry : {};
    const fallbackTitle = typeof entry === 'string' ? entry : `Đội hình #${index + 1}`;
    return {
      key: safe.id || safe.key || `lineup-${index}`,
      title: safe.title || safe.name || fallbackTitle,
      role: safe.role || safe.archetype || safe.focus || '',
      description: safe.description || safe.summary || (typeof entry === 'string' ? '' : ''),
      members: normalizeMembers(safe.members || safe.units || safe.roster)
    };
  });
}

export function renderLineupScreen(options = {}){
  const { root, shell, definition, params } = options;
  if (!root){
    throw new Error('renderLineupScreen cần một phần tử root hợp lệ.');
  }

  ensureStyles();

  const defParams = definition?.params || null;
  const mergedParams = mergeParams(defParams, params) || {};
  const lineups = toLineupEntries(defParams || {}, params || {});
  const subtitle = mergedParams.shortDescription || definition?.description || 'Theo dõi đội hình đề xuất cho các hoạt động PvE và kinh tế.';

  root.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'lineup-screen';

  const header = document.createElement('div');
  header.className = 'lineup-screen__header';
  const title = document.createElement('h1');
  title.className = 'lineup-screen__title';
  title.textContent = definition?.label || definition?.title || 'Đội hình';
  header.appendChild(title);

  if (subtitle){
    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'lineup-screen__subtitle';
    subtitleEl.textContent = subtitle;
    header.appendChild(subtitleEl);
  }

  const actions = document.createElement('div');
  actions.className = 'lineup-screen__actions';
  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'lineup-screen__button';
  backButton.textContent = 'Quay lại menu chính';
  actions.appendChild(backButton);
  header.appendChild(actions);

  container.appendChild(header);

  let destroyers = [];
  const handleBack = () => {
    if (shell && typeof shell.enterScreen === 'function'){
      shell.enterScreen('main-menu');
    }
  };
  backButton.addEventListener('click', handleBack);
  destroyers.push(() => backButton.removeEventListener('click', handleBack));

  if (lineups.length > 0){
    const grid = document.createElement('div');
    grid.className = 'lineup-grid';
    lineups.forEach(entry => {
      const card = document.createElement('article');
      card.className = 'lineup-card';
      card.dataset.lineup = entry.key || '';

      const cardTitle = document.createElement('h3');
      cardTitle.className = 'lineup-card__title';
      cardTitle.textContent = entry.title;
      card.appendChild(cardTitle);

      if (entry.role){
        const meta = document.createElement('p');
        meta.className = 'lineup-card__meta';
        meta.textContent = entry.role;
        card.appendChild(meta);
      }

      if (entry.description){
        const desc = document.createElement('p');
        desc.className = 'lineup-card__desc';
        desc.textContent = entry.description;
        card.appendChild(desc);
      }

      if (entry.members && entry.members.length > 0){
        const membersWrap = document.createElement('div');
        membersWrap.className = 'lineup-card__members';
        const membersTitle = document.createElement('p');
        membersTitle.className = 'lineup-card__members-title';
        membersTitle.textContent = 'Thành viên';
        membersWrap.appendChild(membersTitle);
        const list = document.createElement('ul');
        list.className = 'lineup-card__members-list';
        entry.members.forEach(member => {
          const item = document.createElement('li');
          item.textContent = member;
          list.appendChild(item);
        });
        membersWrap.appendChild(list);
        card.appendChild(membersWrap);
      }

      grid.appendChild(card);
    });
    container.appendChild(grid);
  } else {
    const empty = document.createElement('p');
    empty.className = 'lineup-screen__empty';
    empty.textContent = 'Chưa có đội hình nào được định nghĩa. Bạn có thể thêm dữ liệu qua shell params.';
    container.appendChild(empty);
  }

  root.appendChild(container);

  return {
    destroy(){
      destroyers.forEach(fn => {
        try {
          fn();
        } catch (err) {
          console.error('[lineup] cleanup listener failed', err);
        }
      });
      destroyers = [];
      if (container.parentNode === root){
        root.removeChild(container);
      }
    }
  };
}

export default { renderLineupScreen };
