import { getAllSidebarAnnouncements } from '../../../data/announcements.ts';
import { ensureStyleTag } from '../../../ui/dom.ts';
import { getHeroDialogue, getHeroHotspots, getHeroProfile, HERO_DEFAULT_ID } from '../dialogues.ts';
import type { AnnouncementEntry } from '@shared-types/config';
import type {
  CleanupRegistrar,
  ComingSoonHandler,
  HeroProfile,
  MainMenuShell,
  MenuCardMetadata,
  MenuSection
} from '../types.ts';
import { cueTone, createModeCard, createModeGroupCard } from './events.ts';

const STYLE_ID = 'main-menu-view-style';

export function ensureStyles(): void {
  const css = `
    .app--main-menu{padding:32px 16px 64px;}
    .main-menu-v2{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:32px;color:inherit;}
    .main-menu-v2__header{display:none;}
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
    .mode-card--compact{padding:16px 14px;gap:10px;min-height:0;align-items:center;text-align:center;}
    .mode-card--compact .mode-card__icon{font-size:24px;}
    .mode-card--compact .mode-card__title{font-size:14px;letter-spacing:.1em;}
    .mode-card--compact .mode-card__tags{display:none;}
    .mode-card--compact .mode-card__status{left:14px;right:auto;top:14px;padding:4px 10px;}
    .mode-grid--economy{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:16px;padding-bottom:4px;}
    .mode-grid--economy > *{flex:0 0 140px;}
    .mode-grid--economy::-webkit-scrollbar{height:6px;}
    .mode-grid--economy::-webkit-scrollbar-thumb{background:rgba(125,211,252,.24);border-radius:999px;}
    .mode-card--coming{border-style:dashed;opacity:.88;}
    .mode-card--group{position:relative;cursor:pointer;z-index:1;}
    .mode-card--group:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:4px;}
    .mode-card--group.is-open{z-index:5;}
    .mode-card__group-caret{position:absolute;top:22px;right:20px;font-size:14px;opacity:.65;transition:transform .2s ease,opacity .2s ease;}
    .mode-card--group:hover .mode-card__group-caret{opacity:.9;}
    .mode-card--group.is-open .mode-card__group-caret{transform:rotate(180deg);}
    .mode-card__group-info{display:flex;flex-direction:column;gap:12px;width:100%;}
    .mode-card__group-children{display:none;width:100%;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;}
    .mode-card--group.is-open .mode-card__group-children{display:grid;}
    .mode-card--group.is-open .mode-card__group-info{display:none;}
    .mode-card__child{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:14px;border:1px solid rgba(125,211,252,.18);background:rgba(12,22,32,.9);color:inherit;cursor:pointer;text-align:left;transition:border-color .2s ease,background .2s ease,transform .2s ease;}
    .mode-card__child:hover{border-color:rgba(125,211,252,.42);background:rgba(16,30,44,.95);transform:translateY(-2px);}
    .mode-card__child:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
    .mode-card__child-icon{font-size:20px;line-height:1;}
    .mode-card__child-body{display:flex;flex-direction:column;gap:4px;align-items:flex-start;}
    .mode-card__child-title{font-size:13px;letter-spacing:.12em;text-transform:uppercase;}
    .mode-card__child-status{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7da0c7;}
    .mode-card__child-desc{font-size:12px;color:#9cbcd9;line-height:1.4;}
    .mode-card__child--coming{opacity:.9;}
    .mode-card__child--coming .mode-card__child-status{color:#ffe066;}
    .main-menu-sidebar{display:flex;flex-direction:column;gap:16px;}
    .sidebar-slot{position:relative;padding:20px 22px;border-radius:18px;border:1px solid rgba(125,211,252,.18);background:rgba(12,20,28,.82);overflow:hidden;display:flex;flex-direction:column;gap:8px;min-height:104px;}
    .sidebar-slot::after{content:'';position:absolute;inset:auto -40% -60% 50%;transform:translateX(-50%);width:140%;height:120%;background:radial-gradient(circle,rgba(125,211,252,.18),transparent 70%);opacity:.4;pointer-events:none;}
    .sidebar-slot__label{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7da0c7;}
    .sidebar-slot__title{margin:0;font-size:16px;letter-spacing:.04em;}
    .sidebar-slot__desc{margin:0;font-size:13px;color:#9cbcd9;line-height:1.5;}
    .sidebar-slot__reward{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#ffe066;}
    .sidebar-slot:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:4px;}
    @media(max-width:1080px){.hero-panel{grid-template-columns:1fr;}.hero-panel__canvas{min-height:300px;}}
    @media(max-width:960px){.main-menu-v2__layout{grid-template-columns:1fr;}.main-menu-sidebar{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;}}
    @media(max-width:640px){.main-menu-v2{gap:24px;}.hero-panel__info{padding:24px;}.hero-panel__canvas{padding:20px;}.main-menu-v2__title{font-size:36px;}.mode-card{padding:20px;}}
  `;

  ensureStyleTag(STYLE_ID, { css });
}

function applyPalette(element: HTMLElement | null, profile: HeroProfile): void {
  if (!element) return;
  const palette = profile.art?.palette;
  if (!palette) return;
  const { primary, secondary, accent, outline } = palette;
  if (primary) element.style.setProperty('--hero-primary', primary);
  if (secondary) element.style.setProperty('--hero-secondary', secondary);
  if (accent) element.style.setProperty('--hero-accent', accent);
  if (outline) element.style.setProperty('--hero-outline', outline);
}

interface ModesSectionOptions {
  sections: ReadonlyArray<MenuSection>;
  metadata: ReadonlyArray<MenuCardMetadata>;
  shell: MainMenuShell | null | undefined;
  onShowComingSoon?: ComingSoonHandler;
  addCleanup: CleanupRegistrar;
}

export function createModesSection(options: ModesSectionOptions): HTMLElement {
  const { sections = [], metadata = [], shell, onShowComingSoon, addCleanup } = options;
  const sectionEl = document.createElement('section');
  sectionEl.className = 'main-menu-modes';

  const title = document.createElement('h2');
  title.className = 'main-menu-modes__title';
  title.textContent = 'Chế độ tác chiến';
  sectionEl.appendChild(title);

  const metaByKey = new Map<string, MenuCardMetadata>();
  metadata.forEach(mode => {
    if (mode?.key){
      metaByKey.set(mode.key, mode);
    }
  });

  sections.forEach(section => {
    if (!section) return;
    const sectionGroup = document.createElement('div');
    sectionGroup.className = 'mode-section';

    const heading = document.createElement('h3');
    heading.className = 'mode-section__name';
    heading.textContent = section.title || 'Danh mục';
    sectionGroup.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'mode-grid';
    if (section.id === 'economy'){
      grid.classList.add('mode-grid--economy');
    }

    section.entries.forEach(entry => {
      if (!entry) return;
      const cardKey = entry.cardId || entry.id;
      if (!cardKey) return;
      const cardMeta = metaByKey.get(cardKey);
      if (!cardMeta) return;

      if (entry.type === 'group'){
        const childMetas = entry.childModeIds
          .map(childId => (childId ? metaByKey.get(childId) : null))
          .filter((item): item is MenuCardMetadata => Boolean(item));
        if (childMetas.length === 0) return;
        const groupCard = createModeGroupCard(cardMeta, childMetas, shell, onShowComingSoon, addCleanup);
        grid.appendChild(groupCard);
        return;
      }

      const card = createModeCard(cardMeta, shell, onShowComingSoon, addCleanup);
      grid.appendChild(card);
    });

    sectionGroup.appendChild(grid);
    sectionEl.appendChild(sectionGroup);
  });

  return sectionEl;
}

interface HeroSectionOptions {
  heroId?: string;
  playerGender?: string;
  addCleanup: CleanupRegistrar;
}

export function createHeroSection(options: HeroSectionOptions): HTMLElement {
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
    if (!spot) return;
    const hotspotBtn = document.createElement('button');
    hotspotBtn.type = 'button';
    hotspotBtn.className = 'hero-panel__hotspot';
    hotspotBtn.dataset.cue = spot.cue || 'sensitive';
    hotspotBtn.dataset.zone = spot.key;
    hotspotBtn.setAttribute('aria-label', spot.label || 'Điểm tương tác đặc biệt');
    const label = document.createElement('span');
    label.textContent = spot.label || 'Tương tác';
    hotspotBtn.appendChild(label);

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      showDialogue(spot.cue || 'sensitive', { zone: spot.key });
      panel.classList.add('hero-panel--alert');
      window.setTimeout(() => panel.classList.remove('hero-panel--alert'), 620);
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

  const updateTone = (tone: string | null | undefined, label: string | null | undefined) => {
    const { icon, tone: normalizedTone } = cueTone(tone);
    toneEl.dataset.tone = normalizedTone;
    toneEl.textContent = `${icon} ${label || ''}`.trim();
  };

  const showDialogue = (cue: string, extra: { zone?: string | null } = {}) => {
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
  const triggerTap = () => {
    panel.classList.add('is-pressed');
    showDialogue('tap');
    window.setTimeout(() => panel.classList.remove('is-pressed'), 220);
  };
  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    triggerTap();
  };
  const handleKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' '){
      event.preventDefault();
      triggerTap();
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

interface SidebarOptions {
  shell: MainMenuShell | null | undefined;
  addCleanup: CleanupRegistrar;
}

type SidebarAnnouncement = {
  key: string;
  label: string;
  entry: AnnouncementEntry;
};

export function createSidebar(options: SidebarOptions): HTMLElement {
  const { shell, addCleanup } = options;
  const aside = document.createElement('aside');
  aside.className = 'main-menu-sidebar';
  const announcements: ReadonlyArray<SidebarAnnouncement> = getAllSidebarAnnouncements();

  const attachTooltipHandlers = (element: HTMLElement | null, info: { slotKey: string; entry: AnnouncementEntry } | null) => {
    if (!element || !info) return;
    const { slotKey, entry } = info;
    if (!slotKey) return;
    if (!shell || typeof shell.showTooltip !== 'function') return;

    const showTooltip = () => {
      shell.showTooltip?.({
        id: entry.id,
        slot: slotKey,
        title: entry.title,
        description: entry.tooltip,
        reward: entry.rewardCallout,
        translationKey: entry.translationKey || null,
        startAt: entry.startAt || null,
        endAt: entry.endAt || null
      });
    };
    const hideTooltip = () => {
      if (typeof shell.hideTooltip === 'function'){
        shell.hideTooltip({ id: entry.id || null, slot: slotKey });
      }
    };

    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
    element.addEventListener('focus', showTooltip);
    element.addEventListener('blur', hideTooltip);

    addCleanup(() => {
      element.removeEventListener('mouseenter', showTooltip);
      element.removeEventListener('mouseleave', hideTooltip);
      element.removeEventListener('focus', showTooltip);
      element.removeEventListener('blur', hideTooltip);
    });
  };

  announcements.forEach(item => {
    const { key, label, entry } = item;
    const card = document.createElement('div');
    card.className = 'sidebar-slot';
    card.dataset.slot = key;
    if (entry.id) card.dataset.entryId = entry.id;
    if (entry.translationKey) card.dataset.translationKey = entry.translationKey;
    if (entry.startAt) card.dataset.startAt = entry.startAt;
    if (entry.endAt) card.dataset.endAt = entry.endAt;
    card.tabIndex = 0;

    const labelEl = document.createElement('span');
    labelEl.className = 'sidebar-slot__label';
    labelEl.textContent = label;

    const titleEl = document.createElement('h4');
    titleEl.className = 'sidebar-slot__title';
    titleEl.textContent = entry.title || '';

    const descEl = document.createElement('p');
    descEl.className = 'sidebar-slot__desc';
    descEl.textContent = entry.shortDescription || '';

    card.appendChild(labelEl);
    card.appendChild(titleEl);
    card.appendChild(descEl);

    if (entry.rewardCallout){
      const rewardEl = document.createElement('span');
      rewardEl.className = 'sidebar-slot__reward';
      rewardEl.textContent = entry.rewardCallout;
      card.appendChild(rewardEl);
    }

    const tooltipText = [entry.tooltip, entry.rewardCallout].filter(Boolean).join('\n\n');
    const hasCustomTooltip = Boolean(shell && typeof shell.showTooltip === 'function');
    if (tooltipText && !hasCustomTooltip){
      card.setAttribute('title', tooltipText);
    } else {
      card.removeAttribute('title');
    }

    attachTooltipHandlers(card, { slotKey: key, entry });
    aside.appendChild(card);
  });

  return aside;
}

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'main-menu-v2__header';
  return header;
}