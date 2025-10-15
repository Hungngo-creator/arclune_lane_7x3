import { getHeroDialogue, getHeroHotspots, getHeroProfile, HERO_DEFAULT_ID } from './dialogues.js';

const STYLE_ID = 'main-menu-view-style';

const TONE_ICONS = {
  greeting: '✨',
  focus: '🎯',
  gentle: '🌬️',
  motivate: '🔥',
  warning: '⚠️',
  calm: '🌙'
};

const TAG_CLASS_MAP = new Map([
  ['PvE', 'mode-tag--pve'],
  ['PvP', 'mode-tag--pvp'],
  ['Coming soon', 'mode-tag--coming'],
  ['Kinh tế nguyên tinh', 'mode-tag--economy']
]);

const SIDE_SLOTS = [
  {
    key: 'event',
    label: 'Sự kiện',
    title: 'Thông báo chiến dịch',
    description: 'Kênh sự kiện sẽ cập nhật tại đây. Tham gia để nhận nguyên tinh và danh vọng.'
  },
  {
    key: 'lottery',
    label: 'Vé số',
    title: 'Vé số Nguyên Tinh',
    description: 'Vé số tuần vẫn đang hoàn thiện. Giữ nguyên tinh để tham gia khi mở bán.'
  },
  {
    key: 'gacha',
    label: 'Gacha',
    title: 'Banner trạm tiếp tế',
    description: 'Quầy triệu hồi tướng chủ lực sẽ hiển thị banner ở vị trí này.'
  },
  {
    key: 'chat',
    label: 'Chat',
    title: 'Kênh quân đoàn',
    description: 'Xem nhanh tin nhắn gần nhất từ đội. Chức năng chat đang được kết nối.'
  }
];

function ensureStyles(){
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .app--main-menu{padding:32px 16px 64px;}
    .main-menu-v2{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:32px;color:inherit;}
    .main-menu-v2__header{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-end;justify-content:space-between;}
    .main-menu-v2__brand{display:flex;flex-direction:column;gap:10px;max-width:520px;}
    .main-menu-v2__title{margin:0;font-size:44px;letter-spacing:.08em;text-transform:uppercase;}
    .main-menu-v2__subtitle{margin:0;color:#9cbcd9;line-height:1.6;font-size:17px;}
    .main-menu-v2__meta{display:flex;gap:12px;flex-wrap:wrap;}
    .main-menu-v2__meta-chip{padding:8px 16px;border-radius:999px;border:1px solid rgba(125,211,252,.32);background:rgba(18,28,38,.68);letter-spacing:.12em;font-size:12px;text-transform:uppercase;color:#aee4ff;}
    .main-menu-v2__layout{display:grid;grid-template-columns:minmax(0,3fr) minmax(240px,1fr);gap:32px;align-items:start;}
    .main-menu-v2__primary{display:flex;flex-direction:column;gap:32px;}
    .hero-section{display:flex;flex-direction:column;gap:16px;}
    .hero-panel{position:relative;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);border-radius:26px;overflow:hidden;border:1px solid rgba(125,211,252,.32);background:linear-gradient(135deg,var(--hero-secondary,rgba(20,32,44,.92)),rgba(12,20,28,.75));box-shadow:0 32px 68px rgba(3,8,16,.55);min-height:340px;transition:box-shadow .3s ease,border-color .3s ease;}
    .hero-panel::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 18% 24%,rgba(255,255,255,.18),transparent 58%);opacity:.6;pointer-events:none;}
    .hero-panel__info{position:relative;z-index:2;padding:32px;display:flex;flex-direction:column;gap:18px;background:linear-gradient(180deg,rgba(12,18,24,.85),rgba(12,18,24,.35));}
    .hero-panel__identity{display:flex;flex-direction:column;gap:6px;}
    .hero-panel__role{margin:0;font-size:13px;text-transform:uppercase;letter-spacing:.16em;color:rgba(174,228,255,.68);}
    .hero-panel__name{margin:0;font-size:26px;letter-spacing:.06em;}
    .hero-panel__motto{margin:0;font-size:14px;color:#9cbcd9;line-height:1.6;}
    .hero-dialogue{position:relative;background:rgba(12,24,34,.88);border:1px solid rgba(125,211,252,.28);border-radius:18px;padding:18px 22px;box-shadow:0 18px 42px rgba(6,10,16,.55);display:flex;flex-direction:column;gap:10px;min-height:96px;}
    .hero-dialogue__tone{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;display:flex;align-items:center;gap:6px;}
    .hero-dialogue__tone[data-tone="warning"]{color:#ffe066;}
    .hero-dialogue__tone[data-tone="motivate"]{color:#9fffe0;}
    .hero-dialogue__tone[data-tone="greeting"]{color:#aee4ff;}
    .hero-dialogue__tone[data-tone="gentle"]{color:#ffc9ec;}
    .hero-dialogue__tone[data-tone="focus"]{color:#7dd3fc;}
    .hero-dialogue__tone[data-tone="calm"]{color:#9cbcd9;}
    .hero-dialogue__text{margin:0;font-size:16px;line-height:1.6;color:#e6f2ff;}
    .hero-panel__canvas{position:relative;z-index:1;border:none;outline:none;background:linear-gradient(160deg,rgba(255,255,255,.05),rgba(9,15,21,.72));display:flex;align-items:flex-end;justify-content:center;cursor:pointer;overflow:hidden;padding:24px;min-height:340px;}
    .hero-panel__canvas img{width:92%;max-width:420px;height:auto;filter:drop-shadow(0 24px 48px rgba(0,0,0,.6));transition:transform .3s ease,filter .3s ease;}
    .hero-panel__glow{position:absolute;bottom:-38%;left:50%;transform:translateX(-50%);width:160%;height:160%;background:radial-gradient(circle,var(--hero-accent,rgba(125,211,252,.65)) 0%,transparent 65%);opacity:.45;transition:opacity .3s ease,transform .3s ease;pointer-events:none;}
    .hero-panel.is-hovered{border-color:rgba(125,211,252,.5);box-shadow:0 36px 72px rgba(6,12,20,.65);}
    .hero-panel.is-hovered .hero-panel__canvas img{transform:translateY(-8px) scale(1.04);filter:drop-shadow(0 28px 52px rgba(0,0,0,.7));}
    .hero-panel.is-hovered .hero-panel__glow{opacity:.72;}
    .hero-panel.is-pressed .hero-panel__canvas img{transform:translateY(2px) scale(.98);}
    .hero-panel--alert{animation:hero-alert .8s ease;}
    @keyframes hero-alert{0%{box-shadow:0 34px 76px rgba(40,10,10,.65);}40%{box-shadow:0 20px 56px rgba(120,40,20,.55);}100%{box-shadow:0 32px 68px rgba(3,8,16,.55);}}
    .hero-panel__hotspot{position:absolute;border:1px dashed rgba(255,255,255,.42);background:rgba(125,211,252,.16);backdrop-filter:blur(2px);border-radius:50%;width:30%;height:30%;top:24%;right:18%;opacity:0;transform:scale(.9);transition:opacity .2s ease,transform .2s ease,border-color .2s ease;background-clip:padding-box;}
    .hero-panel__hotspot span{position:absolute;bottom:-36px;left:50%;transform:translateX(-50%);background:rgba(8,16,24,.92);padding:6px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.4);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#c8e7ff;white-space:nowrap;opacity:0;transition:opacity .2s ease,transform .2s ease;pointer-events:none;}
    .hero-panel.is-hovered .hero-panel__hotspot,.hero-panel__hotspot:focus-visible,.hero-panel__hotspot:hover{opacity:1;transform:scale(1);}
    .hero-panel__hotspot:hover span,.hero-panel__hotspot:focus-visible span{opacity:1;transform:translate(-50%,-6px);}
    .hero-panel__hotspot:focus-visible{outline:2px solid var(--hero-accent,#7dd3fc);outline-offset:4px;}
    .main-menu-modes{display:flex;flex-direction:column;gap:24px;}
    .main-menu-modes__title{margin:0;font-size:24px;letter-spacing:.1em;text-transform:uppercase;color:#aee4ff;}
    .mode-section{display:flex;flex-direction:column;gap:18px;}
    .mode-section__name{margin:0;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .mode-grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));}
    .mode-card{position:relative;display:flex;flex-direction:column;gap:12px;align-items:flex-start;padding:24px;border-radius:20px;border:1px solid rgba(125,211,252,.24);background:linear-gradient(150deg,rgba(16,26,36,.92),rgba(18,30,42,.65));color:inherit;cursor:pointer;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;}
    .mode-card:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(6,12,18,.55);border-color:rgba(125,211,252,.46);}
    .mode-card:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:4px;}
    .mode-card__icon{font-size:28px;line-height:1;filter:drop-shadow(0 0 10px rgba(125,211,252,.26));}
    .mode-card__title{margin:0;font-size:18px;letter-spacing:.06em;text-transform:uppercase;}
    .mode-card__desc{margin:0;color:#9cbcd9;font-size:14px;line-height:1.6;}
    .mode-card__tags{display:flex;gap:8px;flex-wrap:wrap;}
    .mode-tag{padding:6px 12px;border-radius:999px;border:1px solid rgba(125,211,252,.25);background:rgba(12,22,32,.82);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#aee4ff;}
    .mode-tag--pve{color:#a8ffd9;border-color:rgba(117,255,208,.35);background:rgba(10,26,22,.82);}
    .mode-tag--pvp{color:#ff9aa0;border-color:rgba(255,154,160,.35);background:rgba(38,18,24,.82);}
    .mode-tag--coming{color:#ffe066;border-color:rgba(255,224,102,.35);background:rgba(36,26,12,.82);}
    .mode-tag--economy{color:#ffd9a1;border-color:rgba(255,195,128,.35);background:rgba(36,24,12,.82);}
    .mode-card__status{position:absolute;top:18px;right:18px;padding:6px 12px;border-radius:999px;border:1px solid rgba(255,224,102,.42);background:rgba(36,26,12,.78);color:#ffe066;font-size:11px;letter-spacing:.16em;text-transform:uppercase;}
    .mode-card--coming{border-style:dashed;opacity:.88;}
    .main-menu-sidebar{display:flex;flex-direction:column;gap:16px;}
    .sidebar-slot{position:relative;padding:20px 22px;border-radius:18px;border:1px solid rgba(125,211,252,.18);background:rgba(12,20,28,.82);overflow:hidden;display:flex;flex-direction:column;gap:8px;min-height:104px;}
    .sidebar-slot::after{content:'';position:absolute;inset:auto -40% -60% 50%;transform:translateX(-50%);width:140%;height:120%;background:radial-gradient(circle,rgba(125,211,252,.18),transparent 70%);opacity:.4;pointer-events:none;}
    .sidebar-slot__label{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7da0c7;}
    .sidebar-slot__title{margin:0;font-size:16px;letter-spacing:.04em;}
    .sidebar-slot__desc{margin:0;font-size:13px;color:#9cbcd9;line-height:1.5;}
    @media(max-width:1080px){.hero-panel{grid-template-columns:1fr;}.hero-panel__canvas{min-height:300px;}}
    @media(max-width:960px){.main-menu-v2__layout{grid-template-columns:1fr;}.main-menu-sidebar{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;}}
    @media(max-width:640px){.main-menu-v2{gap:24px;}.hero-panel__info{padding:24px;}.hero-panel__canvas{padding:20px;}.main-menu-v2__title{font-size:36px;}.mode-card{padding:20px;}}
  `;
  document.head.appendChild(style);
}

function applyPalette(element, profile){
  const palette = profile?.art?.palette || {};
  if (!element) return;
  if (palette.primary) element.style.setProperty('--hero-primary', palette.primary);
  if (palette.secondary) element.style.setProperty('--hero-secondary', palette.secondary);
  if (palette.accent) element.style.setProperty('--hero-accent', palette.accent);
  if (palette.outline) element.style.setProperty('--hero-outline', palette.outline);
}

function createModeCard(mode, shell, onShowComingSoon, addCleanup){
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mode-card';
  button.dataset.mode = mode.key;
  if (mode.status === 'coming-soon'){
    button.classList.add('mode-card--coming');
    button.setAttribute('aria-describedby', `${mode.key}-status`);
    button.setAttribute('aria-disabled', 'true');
  }

  const icon = document.createElement('span');
  icon.className = 'mode-card__icon';
  icon.textContent = mode.icon || '◆';
  button.appendChild(icon);

  const title = document.createElement('h3');
  title.className = 'mode-card__title';
  title.textContent = mode.title || mode.label || mode.key;
  button.appendChild(title);

  if (mode.description){
    const desc = document.createElement('p');
    desc.className = 'mode-card__desc';
    desc.textContent = mode.description;
    button.appendChild(desc);
  }

  const tags = document.createElement('div');
  tags.className = 'mode-card__tags';
  (mode.tags || []).forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'mode-tag';
    chip.textContent = tag;
    const mapped = TAG_CLASS_MAP.get(tag);
    if (mapped) chip.classList.add(mapped);
    tags.appendChild(chip);
  });
  if (tags.childElementCount > 0){
    button.appendChild(tags);
  }

  if (mode.status === 'coming-soon'){
    const status = document.createElement('span');
    status.id = `${mode.key}-status`;
    status.className = 'mode-card__status';
    status.textContent = 'Coming soon';
    button.appendChild(status);
  }

  const handleClick = event => {
    event.preventDefault();
    event.stopPropagation();
    if (!shell || typeof shell.enterScreen !== 'function') return;
    if (mode.status === 'coming-soon'){
      if (typeof onShowComingSoon === 'function'){
        onShowComingSoon(mode);
      }
      shell.enterScreen(mode.id || 'main-menu', mode.params || null);
      return;
    }
    shell.enterScreen(mode.id || 'main-menu', mode.params || null);
  };
  button.addEventListener('click', handleClick);
  addCleanup(() => button.removeEventListener('click', handleClick));
  return button;
}

function createModesSection(options){
  const { sections = [], metadata = [], shell, onShowComingSoon, addCleanup } = options;
  const sectionEl = document.createElement('section');
  sectionEl.className = 'main-menu-modes';

  const title = document.createElement('h2');
  title.className = 'main-menu-modes__title';
  title.textContent = 'Chế độ tác chiến';
  sectionEl.appendChild(title);

  const metaByKey = new Map();
  metadata.forEach(mode => {
    metaByKey.set(mode.key, mode);
  });

  sections.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.className = 'mode-section';

    const heading = document.createElement('h3');
    heading.className = 'mode-section__name';
    heading.textContent = group.title || 'Danh mục';
    groupEl.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'mode-grid';

    (group.modeKeys || []).forEach(key => {
      const mode = metaByKey.get(key);
      if (!mode) return;
      const card = createModeCard(mode, shell, onShowComingSoon, addCleanup);
      grid.appendChild(card);
    });

    groupEl.appendChild(grid);
    sectionEl.appendChild(groupEl);
  });

  return sectionEl;
}

function cueTone(tone){
  return TONE_ICONS[tone] ? { icon: TONE_ICONS[tone], tone } : { icon: '✦', tone: tone || 'calm' };
}

function createHeroSection(options){
  const { heroId = HERO_DEFAULT_ID, playerGender = 'neutral', addCleanup } = options;
  const profile = getHeroProfile(heroId);
  const heroSection = document.createElement('section');
  heroSection.className = 'hero-section';

  const panel = document.createElement('div');
  panel.className = 'hero-panel';
    applyPalette(panel, profile);
  heroSection.appendChild(panel);

  const info = document.createElement('div');
  info.className = 'hero-panel__info';

  const dialogue = document.createElement('div');
  dialogue.className = 'hero-dialogue';

  const toneEl = document.createElement('div');
  toneEl.className = 'hero-dialogue__tone';
  dialogue.appendChild(toneEl);

  const textEl = document.createElement('p');
  textEl.className = 'hero-dialogue__text';
  dialogue.appendChild(textEl);

  info.appendChild(dialogue);

  const identity = document.createElement('div');
  identity.className = 'hero-panel__identity';
  const role = document.createElement('p');
  role.className = 'hero-panel__role';
  role.textContent = `${profile.faction || 'Arclune'} — ${profile.role || 'Tiên phong'}`;
  const name = document.createElement('h2');
  name.className = 'hero-panel__name';
  name.textContent = profile.name || 'Anh hùng';
  identity.appendChild(role);
  identity.appendChild(name);
  if (profile.title){
    const title = document.createElement('p');
    title.className = 'hero-panel__motto';
    title.textContent = profile.title;
    identity.appendChild(title);
  }
  if (profile.motto){
    const motto = document.createElement('p');
    motto.className = 'hero-panel__motto';
    motto.textContent = profile.motto;
    identity.appendChild(motto);
  }
  info.appendChild(identity);

  panel.appendChild(info);

  const canvas = document.createElement('button');
  canvas.type = 'button';
  canvas.className = 'hero-panel__canvas';
  canvas.setAttribute('aria-label', `Tương tác với ${profile.name || 'nhân vật chính'}`);

  if (profile.art?.sprite?.src){
    const img = document.createElement('img');
    img.src = profile.art.sprite.src;
    img.alt = profile.name || 'Anh hùng Arclune';
    canvas.appendChild(img);
  }

  const glow = document.createElement('div');
  glow.className = 'hero-panel__glow';
  canvas.appendChild(glow);

  const hotspots = getHeroHotspots(profile.id);
  hotspots.forEach(spot => {
    const hotspotBtn = document.createElement('button');
    hotspotBtn.type = 'button';
    hotspotBtn.className = 'hero-panel__hotspot';
    hotspotBtn.dataset.cue = spot.cue || 'sensitive';
    hotspotBtn.dataset.zone = spot.key;
    hotspotBtn.setAttribute('aria-label', spot.label || 'Điểm tương tác đặc biệt');
    const label = document.createElement('span');
    label.textContent = spot.label || 'Tương tác';
    hotspotBtn.appendChild(label);
    const handleClick = event => {
      event.preventDefault();
      event.stopPropagation();
      showDialogue(spot.cue || 'sensitive', { zone: spot.key });
      panel.classList.add('hero-panel--alert');
      setTimeout(() => panel.classList.remove('hero-panel--alert'), 620);
    };
    const handleHover = () => {
      panel.classList.add('is-hovered');
    };
    const handleLeave = () => {
      panel.classList.remove('is-hovered');
    };
    hotspotBtn.addEventListener('click', handleClick);
    hotspotBtn.addEventListener('mouseenter', handleHover);
    hotspotBtn.addEventListener('focus', handleHover);
    hotspotBtn.addEventListener('mouseleave', handleLeave);
    hotspotBtn.addEventListener('blur', handleLeave);
    addCleanup(() => {
      hotspotBtn.removeEventListener('click', handleClick);
      hotspotBtn.removeEventListener('mouseenter', handleHover);
      hotspotBtn.removeEventListener('focus', handleHover);
      hotspotBtn.removeEventListener('mouseleave', handleLeave);
      hotspotBtn.removeEventListener('blur', handleLeave);
    });
    canvas.appendChild(hotspotBtn);
  });

  panel.appendChild(canvas);

  const updateTone = (tone, label) => {
    const { icon, tone: normalizedTone } = cueTone(tone);
    toneEl.dataset.tone = normalizedTone;
    toneEl.textContent = `${icon} ${label || ''}`.trim();
  };

  const showDialogue = (cue, extra = {}) => {
    const dialogueData = getHeroDialogue(profile.id, cue, { gender: playerGender, zone: extra.zone });
    textEl.textContent = dialogueData.text;
    updateTone(dialogueData.tone, dialogueData.label);
  };

  const handleEnter = () => {
    panel.classList.add('is-hovered');
    showDialogue('hover');
  };
  const handleLeave = () => {
    panel.classList.remove('is-hovered');
    showDialogue('idle');
  };
  const handleClick = event => {
    event.preventDefault();
    panel.classList.add('is-pressed');
    showDialogue('tap');
    setTimeout(() => panel.classList.remove('is-pressed'), 220);
  };
  const handleKey = event => {
    if (event.key === 'Enter' || event.key === ' '){
      event.preventDefault();
      handleClick(event);
    }
  };

  canvas.addEventListener('mouseenter', handleEnter);
  canvas.addEventListener('focus', handleEnter);
  canvas.addEventListener('mouseleave', handleLeave);
  canvas.addEventListener('blur', handleLeave);
  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('keydown', handleKey);
  addCleanup(() => {
    canvas.removeEventListener('mouseenter', handleEnter);
    canvas.removeEventListener('focus', handleEnter);
    canvas.removeEventListener('mouseleave', handleLeave);
    canvas.removeEventListener('blur', handleLeave);
    canvas.removeEventListener('click', handleClick);
    canvas.removeEventListener('keydown', handleKey);
  });

  showDialogue('intro');

  heroSection.appendChild(panel);
  return heroSection;
}

function createSidebar(){
  const aside = document.createElement('aside');
  aside.className = 'main-menu-sidebar';
  SIDE_SLOTS.forEach(slot => {
    const card = document.createElement('div');
    card.className = 'sidebar-slot';
    card.dataset.slot = slot.key;

    const label = document.createElement('span');
    label.className = 'sidebar-slot__label';
    label.textContent = slot.label;

    const title = document.createElement('h4');
    title.className = 'sidebar-slot__title';
    title.textContent = slot.title;

    const desc = document.createElement('p');
    desc.className = 'sidebar-slot__desc';
    desc.textContent = slot.description;

    card.appendChild(label);
    card.appendChild(title);
    card.appendChild(desc);
    aside.appendChild(card);
  });
  return aside;
}

function createHeader(){
  const header = document.createElement('header');
  header.className = 'main-menu-v2__header';

  const brand = document.createElement('div');
  brand.className = 'main-menu-v2__brand';

  const title = document.createElement('h1');
  title.className = 'main-menu-v2__title';
  title.textContent = 'Arclune';
  const subtitle = document.createElement('p');
  subtitle.className = 'main-menu-v2__subtitle';
  subtitle.textContent = 'Chiến thuật sân 7x3. Chọn chế độ để khởi động đội hình, tương tác với hộ vệ để nghe lời nhắc nhở.';

  brand.appendChild(title);
  brand.appendChild(subtitle);

  const meta = document.createElement('div');
  meta.className = 'main-menu-v2__meta';

  const chipAlpha = document.createElement('span');
  chipAlpha.className = 'main-menu-v2__meta-chip';
  chipAlpha.textContent = 'Alpha preview';
  const chipBuild = document.createElement('span');
  chipBuild.className = 'main-menu-v2__meta-chip';
  chipBuild.textContent = 'v0.7.4';

  meta.appendChild(chipAlpha);
  meta.appendChild(chipBuild);

  header.appendChild(brand);
  header.appendChild(meta);
  return header;
}

export function renderMainMenuView(options = {}){
  const { root, shell, sections = [], metadata = [], heroId = HERO_DEFAULT_ID, playerGender = 'neutral', onShowComingSoon } = options;
  if (!root) return null;
  ensureStyles();
  root.innerHTML = '';
  root.classList.remove('app--pve');
  root.classList.add('app--main-menu');

  const cleanups = [];
  const addCleanup = fn => {
    if (typeof fn === 'function') cleanups.push(fn);
  };

  const container = document.createElement('div');
  container.className = 'main-menu-v2';

  const header = createHeader();
  container.appendChild(header);

  const layout = document.createElement('div');
  layout.className = 'main-menu-v2__layout';
  container.appendChild(layout);

  const primary = document.createElement('div');
  primary.className = 'main-menu-v2__primary';
  const hero = createHeroSection({ heroId, playerGender, addCleanup });
  primary.appendChild(hero);
  const modes = createModesSection({ sections, metadata, shell, onShowComingSoon, addCleanup });
  primary.appendChild(modes);

  const sidebar = createSidebar();

  layout.appendChild(primary);
  layout.appendChild(sidebar);

  root.appendChild(container);

  return {
    destroy(){
      cleanups.forEach(fn => {
        try {
          fn();
        } catch (err) {
          console.error('[main-menu] cleanup failed', err);
        }
      });
      cleanups.length = 0;
      if (container.parentNode === root){
        root.removeChild(container);
      }
      root.classList.remove('app--main-menu');
    }
  };
}

export default renderMainMenuView;
