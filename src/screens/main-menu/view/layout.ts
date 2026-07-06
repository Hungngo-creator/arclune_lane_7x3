//home (termux)/arclune_lane_7x3/src/screens/main-menu/view/layout.ts

import { ensureStyleTag } from '../../../ui/dom.ts';
import type {
  CleanupRegistrar,
  ComingSoonHandler,
  MainMenuShell,
  MenuCardMetadata,
  MenuSection
} from '../types.ts';
import { createModeCard } from './events.ts';

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
    .main-menu-v2__layout{display:grid;grid-template-columns:minmax(0,1fr);gap:32px;align-items:start;}
    .main-menu-v2__primary{display:flex;flex-direction:column;gap:32px;}
    .main-menu-modes{display:flex;flex-direction:column;gap:24px;}
    .main-menu-modes--hub-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,1fr) minmax(0,1fr);gap:16px;align-items:start;}
    .main-menu-hub-column{display:flex;flex-direction:column;gap:12px;align-items:stretch;}
    .main-menu-hub-column--left{justify-self:start;}
    .main-menu-hub-column--right{justify-self:end;}
    .main-menu-hub-spacer{min-height:420px;}
    .main-menu-modes__title{margin:0;font-size:24px;letter-spacing:.1em;text-transform:uppercase;color:#aee4ff;}
    .mode-section{display:flex;flex-direction:column;gap:18px;}
    .mode-section__name{margin:0;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .mode-grid{display:flex;flex-direction:column;gap:16px;}
    .mode-card{position:relative;display:flex;flex-direction:column;gap:11px;align-items:flex-start;padding:22px;border-radius:18px;border:1px solid rgba(125,211,252,.24);background:linear-gradient(150deg,rgba(16,26,36,.92),rgba(18,30,42,.65));color:inherit;cursor:pointer;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease;}
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
    .mode-card--compact{padding:14px 13px;gap:9px;min-height:0;align-items:center;text-align:center;width:126px;min-height:86px;justify-content:center;}
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

    .main-menu-v2__toolbar{display:flex;justify-content:flex-end;}
    .main-menu-settings-btn{width:44px;height:44px;border-radius:12px;border:1px solid rgba(125,211,252,.35);background:rgba(16,26,36,.9);color:#d8eeff;font-size:20px;cursor:pointer;}
    .main-menu-settings-btn:hover{border-color:rgba(125,211,252,.6);}
    .main-menu-settings-overlay{position:fixed;inset:0;background:rgba(4,10,16,.46);display:none;align-items:center;justify-content:center;z-index:120;padding:16px;}
    .main-menu-settings-overlay.is-open{display:flex;}
    .main-menu-settings-hub{width:min(820px,95vw);height:min(520px,88vh);border:1px solid rgba(125,211,252,.32);border-radius:18px;background:rgba(7,16,26,.92);display:flex;overflow:hidden;position:relative;}
    .main-menu-settings-close{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:10px;border:1px solid rgba(125,211,252,.3);background:rgba(16,26,36,.9);color:#e6f2ff;cursor:pointer;}
    .main-menu-settings-nav{width:190px;display:flex;flex-direction:column;padding:54px 10px 12px 12px;gap:8px;border-right:1px solid rgba(125,211,252,.2);}
    .main-menu-settings-nav-btn{border:1px solid rgba(125,211,252,.2);background:rgba(11,22,34,.85);color:#cde7ff;border-radius:10px;padding:10px;text-align:left;cursor:pointer;}
    .main-menu-settings-nav-btn.is-active{border-color:rgba(125,211,252,.55);background:rgba(18,34,50,.95);}
    .main-menu-settings-content{flex:1;padding:54px 20px 20px;display:flex;flex-direction:column;gap:12px;}
    .main-menu-settings-title{margin:0;font-size:22px;letter-spacing:.08em;text-transform:uppercase;}
    .main-menu-settings-desc{margin:0;color:#9cbcd9;}
    .main-menu-settings-fps{margin-top:6px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;}
    .main-menu-settings-fps__label{margin:0;color:#d8eeff;font-size:13px;letter-spacing:.12em;text-transform:uppercase;}
    .main-menu-settings-fps__options{display:flex;gap:10px;flex-wrap:wrap;}
    .main-menu-settings-fps__btn{border:1px solid rgba(125,211,252,.28);background:rgba(16,26,36,.84);color:#cde7ff;border-radius:999px;padding:9px 14px;cursor:pointer;letter-spacing:.08em;transition:border-color .18s ease,background .18s ease,box-shadow .18s ease;}
    .main-menu-settings-fps__btn:hover{border-color:rgba(125,211,252,.5);}
    .main-menu-settings-fps__btn.is-active{border-color:rgba(125,211,252,.72);background:rgba(18,48,70,.92);box-shadow:0 0 18px rgba(125,211,252,.16);color:#e8f7ff;}
    .main-menu-settings-danger-btn{align-self:flex-start;border:1px solid rgba(255,128,128,.45);background:rgba(52,14,18,.82);color:#ffd4d4;border-radius:10px;padding:10px 14px;cursor:pointer;}
    .main-menu-settings-confirm{margin-top:8px;border:1px solid rgba(255,128,128,.45);background:rgba(52,14,18,.55);border-radius:12px;padding:12px;display:none;flex-direction:column;gap:10px;}
    .main-menu-settings-confirm.is-open{display:flex;}
    .main-menu-settings-confirm-actions{display:flex;gap:10px;}
    .main-menu-settings-confirm-btn{border:1px solid rgba(125,211,252,.35);background:rgba(16,26,36,.9);color:#d8eeff;border-radius:10px;padding:8px 12px;cursor:pointer;}
    .main-menu-settings-confirm-btn--danger{border-color:rgba(255,128,128,.45);background:rgba(80,18,24,.9);color:#ffe3e3;}

    @media(max-width:960px){.main-menu-v2__layout{grid-template-columns:1fr;}.main-menu-modes--hub-layout{grid-template-columns:1fr;}.main-menu-hub-column--right{justify-self:start;}.main-menu-hub-spacer{display:none;}}
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

  const metaByKey = new Map<string, MenuCardMetadata>();
  metadata.forEach(mode => {
    if (mode?.key){
      metaByKey.set(mode.key, mode);
    }
  });

  const availableKeys = new Set<string>();
  sections.forEach(section => {
    if (!section) return;
    section.entries.forEach(entry => {
      if (!entry) return;
      const cardKey = entry.cardId || entry.id;
      if (cardKey){
        availableKeys.add(cardKey);
      }
      if (entry.type === 'group'){
        entry.childModeIds.forEach(childId => {
          if (childId){
            availableKeys.add(childId);
          }
        });
      }
    });
  });

      const hubLayout = document.createElement('div');
  hubLayout.className = 'main-menu-modes--hub-layout';

  const leftColumn = document.createElement('div');
  leftColumn.className = 'main-menu-hub-column main-menu-hub-column--left';
  const rightColumn = document.createElement('div');
  rightColumn.className = 'main-menu-hub-column main-menu-hub-column--right';
  const spacer = document.createElement('div');
  spacer.className = 'main-menu-hub-spacer';

  const createHubCard = (key: string): HTMLButtonElement | null => {
    if (!availableKeys.has(key)) return null;
    const cardMeta = metaByKey.get(key);
    if (!cardMeta) return null;
    return createModeCard(cardMeta, shell, onShowComingSoon, addCleanup, {
      extraClasses: ['mode-card--hub']
    });
  };

    const leftOrder = ['arena-hub', 'collection', 'lineup', 'tongmon'];
  leftOrder.forEach(key => {
    const card = createHubCard(key);
    if (card){
      leftColumn.appendChild(card);
    }
  });

  const rightOrder = ['gacha', 'market', 'events', 'social'];
  rightOrder.forEach(key => {
    const card = createHubCard(key);
    if (card){
      rightColumn.appendChild(card);
    }
  });

  hubLayout.appendChild(leftColumn);
  hubLayout.appendChild(spacer);
  hubLayout.appendChild(rightColumn);
  sectionEl.appendChild(hubLayout);

  return sectionEl;
}

export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'main-menu-v2__header';
  return header;
}