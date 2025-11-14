import { getAllSidebarAnnouncements } from '../../../data/announcements.ts';
import { ensureStyleTag } from '../../../ui/dom.ts';
import type { AnnouncementEntry } from '@shared-types/config';
import type {
  CleanupRegistrar,
  ComingSoonHandler,
  MainMenuShell,
  MenuCardMetadata,
  MenuSection
} from '../types.ts';
import { createModeCard, createModeGroupCard } from './events.ts';

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
    .main-menu-modes{display:flex;flex-direction:column;gap:24px;}
    .main-menu-modes__title{margin:0;font-size:24px;letter-spacing:.1em;text-transform:uppercase;color:#aee4ff;}
    .mode-section{display:flex;flex-direction:column;gap:18px;}
    .mode-section__name{margin:0;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .mode-grid{display:flex;flex-direction:column;gap:16px;}
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
    .mode-grid--economy{flex-direction:row;flex-wrap:nowrap;overflow-x:auto;gap:16px;padding-bottom:4px;}
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
    @media(max-width:960px){.main-menu-v2__layout{grid-template-columns:1fr;}.main-menu-sidebar{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;}}
    @media(max-width:640px){.main-menu-v2{gap:24px;}.main-menu-v2__title{font-size:36px;}.mode-card{padding:20px;}}
  `;

  ensureStyleTag(STYLE_ID, { css });
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