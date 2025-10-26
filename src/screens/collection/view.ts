import { getUnitArt } from '../../art.ts';
import { listCurrencies } from '../../data/economy.ts';
import { getSkillSet } from '../../data/skills.ts';
import { createNumberFormatter } from '../../utils/format.ts';
import { assertElement, ensureStyleTag, mountSection } from '../../../ui/dom.ts';

import {
  ABILITY_TYPE_LABELS,
  buildRosterWithCost,
  cloneRoster,
  collectAbilityFacts,
  describeUlt,
  formatTagLabel,
  labelForAbility,
  resolveCurrencyBalance,
  getCurrencyCatalog,
  ensureNumberFormatter,
} from './helpers.ts';
import { createFilterState, updateActiveTab, updateSelectedUnit } from './state.ts';
import type { AbilityFact } from './helpers.ts';
import type {
  CollectionEntry,
  CollectionTabKey,
  CollectionViewHandle,
  CollectionViewOptions,
  CurrencyCatalog,
  FilterState,
  UnknownRecord,
} from './types.ts';
import type { CurrencyDefinition } from '../../types/config.ts';

const STYLE_ID = 'collection-view-style-v2';

const TAB_DEFINITIONS = [
  { key: 'awakening', label: 'Thức Tỉnh', hint: 'Theo dõi mốc thức tỉnh, sao và điểm đột phá của nhân vật đã sở hữu.' },
  { key: 'skills', label: 'Kĩ Năng', hint: 'Mở lớp phủ mô tả kỹ năng, chuỗi nâng cấp và yêu cầu nguyên liệu.' },
  { key: 'arts', label: 'Công Pháp & Trang Bị', hint: 'Liệt kê công pháp, pháp khí và trang bị đang trang bị cho nhân vật.' },
  { key: 'skins', label: 'Skin', hint: 'Quản lý skin đã mở khóa và áp dụng bảng phối màu yêu thích.' },
  { key: 'voice', label: 'Giọng Nói', hint: 'Nghe thử voice line, thiết lập voice pack và gợi ý mở khóa.' }
] satisfies ReadonlyArray<{ key: CollectionTabKey; label: string; hint: string }>;

const currencyCatalog: CurrencyCatalog = getCurrencyCatalog(listCurrencies as () => ReadonlyArray<CurrencyDefinition>);
const currencyFormatter = ensureNumberFormatter(createNumberFormatter, 'vi-VN');

function ensureStyles(){
  const css = `
    .app--collection{padding:32px 16px 64px;}
    .collection-view{max-width:1280px;margin:0 auto;display:flex;flex-direction:column;gap:28px;color:inherit;}
    .collection-view__header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;}
    .collection-view__title-group{display:flex;align-items:center;gap:12px;}
    .collection-view__back{padding:10px 18px;border-radius:999px;border:1px solid rgba(125,211,252,.32);background:rgba(16,26,36,.78);color:#aee4ff;letter-spacing:.08em;text-transform:uppercase;font-size:12px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;}
    .collection-view__back:hover{transform:translateY(-2px);border-color:rgba(174,228,255,.52);box-shadow:0 12px 26px rgba(6,12,20,.45);}
    .collection-view__back:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
    .collection-view__title{margin:0;font-size:36px;letter-spacing:.08em;text-transform:uppercase;}
    .collection-view__wallet{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:flex-end;}
    .collection-wallet__item{min-width:130px;padding:10px 14px;border-radius:14px;border:1px solid rgba(125,211,252,.22);background:rgba(12,20,28,.82);display:flex;flex-direction:column;gap:4px;}
    .collection-wallet__name{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;margin:0;}
    .collection-wallet__balance{font-size:16px;margin:0;color:#e6f2ff;}
    .collection-view__layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(0,3fr) minmax(0,1.2fr);gap:24px;align-items:stretch;}
    .collection-roster{border-radius:24px;border:1px solid rgba(125,211,252,.2);background:linear-gradient(160deg,rgba(12,22,32,.94),rgba(6,14,22,.78));padding:20px;display:flex;flex-direction:column;gap:12px;overflow:hidden;}
    .collection-roster__list{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;max-height:560px;overflow:auto;padding-right:4px;}
    .collection-roster__entry{--entry-bg:rgba(12,20,28,.72);--entry-bg-hover:rgba(16,26,36,.9);--entry-bg-selected:rgba(18,30,42,.95);--entry-border:transparent;--entry-border-hover:rgba(125,211,252,.35);--entry-border-selected:rgba(125,211,252,.55);--entry-shadow:none;--entry-shadow-selected:0 16px 36px rgba(6,12,20,.45);display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;border:1px solid var(--entry-border);background:var(--entry-bg);color:inherit;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease;width:100%;}
    .collection-roster__entry:hover{transform:translateY(-2px);border-color:var(--entry-border-hover);background:var(--entry-bg-hover);box-shadow:var(--entry-shadow-hover,var(--entry-shadow));}
    .collection-roster__entry:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
    .collection-roster__entry.is-selected{border-color:var(--entry-border-selected);background:var(--entry-bg-selected);box-shadow:var(--entry-shadow-selected);}
    .collection-roster__entry[data-rank="S"]{--entry-bg:rgba(38,20,52,.78);--entry-bg-hover:rgba(48,26,68,.92);--entry-bg-selected:rgba(54,30,74,.96);--entry-border:rgba(255,180,255,.4);--entry-border-hover:rgba(255,204,255,.58);--entry-border-selected:rgba(255,228,255,.72);--entry-shadow:0 0 0 1px rgba(255,192,255,.2);--entry-shadow-hover:0 10px 26px rgba(150,66,188,.45);--entry-shadow-selected:0 18px 44px rgba(150,66,188,.6);}
    .collection-roster__entry[data-rank="A"]{--entry-bg:rgba(30,40,58,.78);--entry-bg-hover:rgba(38,50,72,.92);--entry-bg-selected:rgba(44,58,84,.96);--entry-border:rgba(124,187,255,.35);--entry-border-hover:rgba(158,208,255,.52);--entry-border-selected:rgba(188,226,255,.7);--entry-shadow:0 0 0 1px rgba(140,200,255,.2);--entry-shadow-hover:0 10px 26px rgba(64,116,188,.42);--entry-shadow-selected:0 18px 44px rgba(64,116,188,.55);}
    .collection-roster__entry[data-rank="B"]{--entry-bg:rgba(28,46,40,.78);--entry-bg-hover:rgba(34,58,50,.9);--entry-bg-selected:rgba(40,68,58,.95);--entry-border:rgba(120,224,185,.35);--entry-border-hover:rgba(146,236,204,.52);--entry-border-selected:rgba(176,246,220,.68);--entry-shadow:0 0 0 1px rgba(126,236,199,.18);--entry-shadow-hover:0 10px 24px rgba(42,126,110,.4);--entry-shadow-selected:0 18px 38px rgba(42,126,110,.52);}
    .collection-roster__entry[data-rank="C"]{--entry-bg:rgba(46,46,28,.78);--entry-bg-hover:rgba(58,58,34,.9);--entry-bg-selected:rgba(68,68,40,.95);--entry-border:rgba(232,212,124,.32);--entry-border-hover:rgba(244,226,150,.48);--entry-border-selected:rgba(252,238,176,.64);--entry-shadow:0 0 0 1px rgba(240,224,150,.16);--entry-shadow-hover:0 10px 24px rgba(162,138,52,.38);--entry-shadow-selected:0 18px 36px rgba(162,138,52,.48);}
    .collection-roster__entry[data-rank="D"]{--entry-bg:rgba(48,34,24,.78);--entry-bg-hover:rgba(60,42,30,.9);--entry-bg-selected:rgba(70,48,36,.95);--entry-border:rgba(255,170,108,.3);--entry-border-hover:rgba(255,188,138,.46);--entry-border-selected:rgba(255,208,170,.6);--entry-shadow:0 0 0 1px rgba(255,182,132,.14);--entry-shadow-hover:0 10px 22px rgba(168,88,42,.36);--entry-shadow-selected:0 18px 32px rgba(168,88,42,.45);}
    .collection-roster__entry[data-rank="unknown"],
    .collection-roster__entry:not([data-rank]){--entry-bg:rgba(12,20,28,.72);--entry-bg-hover:rgba(16,26,36,.9);--entry-bg-selected:rgba(18,30,42,.95);--entry-border:rgba(125,211,252,.2);--entry-border-hover:rgba(125,211,252,.35);--entry-border-selected:rgba(125,211,252,.55);--entry-shadow:none;--entry-shadow-hover:0 10px 20px rgba(6,12,20,.35);--entry-shadow-selected:0 16px 36px rgba(6,12,20,.45);}
    .collection-roster__avatar{width:48px;height:48px;border-radius:14px;background:rgba(24,34,44,.85);overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;--aura-background:radial-gradient(circle at 50% 50%,rgba(174,228,255,.6),rgba(16,26,36,0));--aura-shadow:0 0 0 rgba(0,0,0,0);}
    .collection-roster__entry[data-rank="S"] .collection-roster__avatar{--aura-background:radial-gradient(circle at 50% 45%,rgba(255,210,255,.9),rgba(120,24,160,0));--aura-shadow:0 0 22px rgba(214,118,255,.65);}
    .collection-roster__entry[data-rank="A"] .collection-roster__avatar{--aura-background:radial-gradient(circle at 50% 45%,rgba(170,210,255,.85),rgba(32,68,160,0));--aura-shadow:0 0 20px rgba(104,162,255,.55);}
    .collection-roster__entry[data-rank="B"] .collection-roster__avatar{--aura-background:radial-gradient(circle at 50% 45%,rgba(160,240,210,.85),rgba(16,94,72,0));--aura-shadow:0 0 18px rgba(92,206,162,.5);}
    .collection-roster__entry[data-rank="C"] .collection-roster__avatar{--aura-background:radial-gradient(circle at 50% 45%,rgba(244,226,150,.82),rgba(120,94,20,0));--aura-shadow:0 0 16px rgba(204,172,68,.48);}
    .collection-roster__entry[data-rank="D"] .collection-roster__avatar{--aura-background:radial-gradient(circle at 50% 45%,rgba(255,196,150,.8),rgba(122,52,14,0));--aura-shadow:0 0 14px rgba(202,108,52,.45);}
    .collection-roster__entry[data-rank="unknown"] .collection-roster__avatar,
    .collection-roster__entry:not([data-rank]) .collection-roster__avatar{--aura-background:radial-gradient(circle at 50% 45%,rgba(174,228,255,.6),rgba(16,26,36,0));--aura-shadow:0 0 12px rgba(6,12,20,.35);}
    .collection-roster__aura{position:absolute;inset:-6px;border-radius:inherit;background:var(--aura-background);box-shadow:var(--aura-shadow);opacity:.92;pointer-events:none;filter:saturate(1.15);transition:opacity .2s ease,transform .2s ease;z-index:0;}
    .collection-roster__entry:hover .collection-roster__aura{opacity:1;}
    .collection-roster__entry.is-selected .collection-roster__aura{opacity:1;transform:scale(1.02);}
    .collection-roster__avatar img{width:58px;height:58px;object-fit:contain;filter:drop-shadow(0 8px 16px rgba(0,0,0,.55));position:relative;z-index:1;}
    .collection-roster__avatar span{position:relative;z-index:1;color:#aee4ff;font-weight:600;letter-spacing:.08em;}
    .collection-roster__cost{margin-left:auto;padding:5px 9px;border-radius:11px;background:rgba(36,18,12,.72);color:#ffd9a1;font-size:11px;letter-spacing:.12em;text-transform:uppercase;display:flex;align-items:center;gap:6px;}
    .collection-roster__cost.is-highlighted{background:rgba(255,184,108,.9);color:#1e1206;box-shadow:0 10px 24px rgba(255,184,108,.45);}
    .collection-stage{position:relative;border-radius:28px;border:1px solid rgba(125,211,252,.24);background:linear-gradient(150deg,rgba(16,24,34,.92),rgba(10,16,26,.72));padding:28px;display:flex;flex-direction:column;gap:18px;overflow:visible;min-height:420px;}
    .collection-stage__art{flex:1;display:flex;align-items:flex-end;justify-content:center;position:relative;}
    .collection-stage__sprite{width:82%;max-width:420px;height:auto;filter:drop-shadow(0 32px 60px rgba(0,0,0,.6));transition:transform .3s ease,filter .3s ease;}
    .collection-stage__info{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;}
    .collection-stage__identity{display:flex;flex-direction:column;gap:6px;}
    .collection-stage__name{margin:0;font-size:26px;letter-spacing:.06em;}
    .collection-stage__tags{display:flex;gap:10px;flex-wrap:wrap;}
    .collection-stage__tag{padding:6px 12px;border-radius:999px;border:1px solid rgba(125,211,252,.28);background:rgba(12,22,32,.78);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#aee4ff;}
    .collection-stage__cost{padding:8px 16px;border-radius:999px;background:rgba(36,18,12,.82);color:#ffd9a1;font-size:13px;letter-spacing:.14em;text-transform:uppercase;border:1px solid rgba(255,184,108,.32);}
    .collection-stage__status{margin:0;color:#9cbcd9;font-size:14px;line-height:1.6;}
    .collection-tabs{border-radius:24px;border:1px solid rgba(125,211,252,.2);background:rgba(12,20,28,.9);padding:20px;display:flex;flex-direction:column;gap:12px;}
    .collection-tabs__title{margin:0 0 8px;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .collection-tabs__button{width:100%;padding:12px 14px;border-radius:14px;border:1px solid rgba(125,211,252,.18);background:rgba(8,16,24,.82);color:inherit;cursor:pointer;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:14px;transition:transform .18s ease,border-color .18s ease,background .18s ease;}
    .collection-tabs__button:hover{transform:translateX(4px);border-color:rgba(125,211,252,.42);background:rgba(16,26,36,.92);}
    .collection-tabs__button:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
    .collection-tabs__button.is-active{border-color:rgba(125,211,252,.55);background:rgba(18,30,42,.96);box-shadow:0 16px 36px rgba(6,12,20,.42);}
    .collection-tabs__hint{font-size:11px;color:#7da0c7;letter-spacing:.08em;text-transform:uppercase;}
    .collection-skill-overlay{position:absolute;top:15%;left:10%;width:82%;min-height:70%;padding:24px;border-radius:22px;border:1px solid rgba(125,211,252,.45);background:rgba(8,16,26,.92);box-shadow:0 42px 96px rgba(3,6,12,.75);display:flex;flex-direction:column;gap:18px;opacity:0;pointer-events:none;transition:opacity .24s ease,transform .24s ease;transform:translateY(12px);backdrop-filter:blur(6px);max-height:80vh;overflow:hidden;}
    .collection-skill-overlay.is-open{opacity:1;pointer-events:auto;transform:translateY(0);}
    .collection-skill-overlay__header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;}
    .collection-skill-overlay__title{margin:0;font-size:22px;letter-spacing:.06em;}
    .collection-skill-overlay__close{padding:8px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.28);background:rgba(16,24,34,.85);color:#aee4ff;font-size:12px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease;}
    .collection-skill-overlay__close:hover{transform:translateY(-2px);border-color:rgba(174,228,255,.48);}
    .collection-skill-overlay__close:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
    .collection-skill-overlay__content{display:grid;grid-template-columns:1fr;gap:24px;flex:1;overflow:auto;padding-right:8px;}
    .collection-skill-overlay__content.has-detail{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);}
    .collection-skill-overlay__details{display:flex;flex-direction:column;gap:12px;}
    .collection-skill-overlay__subtitle{margin:0;color:#9cbcd9;font-size:14px;line-height:1.6;}
    .collection-skill-overlay__abilities{display:flex;flex-direction:column;gap:12px;overflow:visible;max-height:none;padding-right:2px;}
    .collection-skill-card{border-radius:16px;border:1px solid rgba(125,211,252,.24);background:rgba(12,22,32,.88);padding:12px;display:flex;flex-direction:row;align-items:center;gap:12px;}
    .collection-skill-card__header{display:flex;align-items:center;gap:10px;flex:1;min-width:0;}
    .collection-skill-card__title{margin:0;font-size:15px;letter-spacing:.04em;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .collection-skill-card__actions{display:flex;align-items:center;gap:6px;margin-left:auto;}
    .collection-skill-card__badge{padding:3px 8px;border-radius:12px;border:1px solid rgba(125,211,252,.28);background:rgba(8,18,28,.82);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .collection-skill-card__upgrade{padding:5px 10px;border-radius:12px;border:1px solid rgba(174,228,255,.32);background:rgba(16,26,36,.88);color:#aee4ff;font-size:11px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease;}
    .collection-skill-card__upgrade:hover{transform:translateY(-1px);border-color:rgba(174,228,255,.52);box-shadow:0 8px 18px rgba(6,12,20,.38);}
    .collection-skill-card__upgrade:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
    .collection-skill-card__meta{display:none !important;}
    .collection-skill-card__description{display:none !important;}
    .collection-skill-card__notes{display:none !important;}
    .collection-skill-card.is-expanded{border-color:rgba(174,228,255,.6);box-shadow:0 22px 48px rgba(10,20,32,.52);background:rgba(16,28,40,.92);}
    .collection-skill-detail{border-radius:18px;border:1px solid rgba(125,211,252,.28);background:rgba(10,20,30,.86);padding:20px;display:flex;flex-direction:column;gap:14px;color:#e6f2ff;opacity:0;transform:translateY(10px);transition:opacity .2s ease,transform .2s ease;pointer-events:none;min-height:0;}
    .collection-skill-detail.is-active{opacity:1;transform:translateY(0);pointer-events:auto;}
    .collection-skill-detail__header{display:flex;flex-direction:column;gap:6px;}
    .collection-skill-detail__title{margin:0;font-size:20px;letter-spacing:.05em;}
    .collection-skill-detail__badge{align-self:flex-start;padding:4px 10px;border-radius:12px;border:1px solid rgba(174,228,255,.32);background:rgba(16,28,40,.82);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#aee4ff;}
    .collection-skill-detail__description{margin:0;color:#d7e7fb;font-size:14px;line-height:1.7;white-space:pre-line;}
    .collection-skill-detail__facts{display:flex;flex-direction:column;gap:8px;}
    .collection-skill-detail__fact{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:#cde1f5;background:rgba(12,24,36,.72);padding:10px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.2);}
    .collection-skill-detail__fact-icon{font-size:15px;line-height:1;}
    .collection-skill-detail__fact-label{font-weight:600;letter-spacing:.04em;}
    .collection-skill-detail__fact-value{font-size:13px;color:#e6f2ff;line-height:1.5;}
    .collection-skill-detail__notes{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#a9c7e6;}
    .collection-skill-detail__notes li{position:relative;padding-left:16px;}
    .collection-skill-detail__notes li::before{content:'•';position:absolute;left:0;color:#7da0c7;}
    .collection-skill-detail__empty{margin:0;color:#7da0c7;font-size:13px;line-height:1.6;}
    .collection-skill-card__empty{margin:0;color:#9cbcd9;font-size:13px;line-height:1.6;background:rgba(12,22,32,.88);border:1px dashed rgba(125,211,252,.28);border-radius:14px;padding:16px;text-align:center;}
    .collection-skill-overlay__notes{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#9cbcd9;}
    .collection-skill-overlay__notes li{position:relative;padding-left:16px;}
    .collection-skill-overlay__notes li::before{content:'•';position:absolute;left:0;color:#7da0c7;
    @media(max-width:1200px){
      .collection-view__layout{grid-template-columns:minmax(0,1.6fr) minmax(0,3fr) minmax(0,1.2fr);}
    }
    @media(max-width:1080px){
      .collection-view__layout{grid-template-columns:1fr;}
      .collection-roster__list{grid-template-columns:repeat(2,minmax(0,1fr));}
      .collection-skill-overlay{position:fixed;top:50%;left:50%;transform:translate(-50%,calc(-50% + 12px));width:88vw;min-height:0;max-height:85vh;}
      .collection-skill-overlay.is-open{transform:translate(-50%,-50%);}
      .collection-skill-overlay__content{grid-template-columns:1fr;}
      .collection-skill-overlay__content.has-detail{grid-template-columns:1fr;}
    }
    @media(max-width:820px){
      .collection-roster__list{grid-template-columns:1fr;}
    }
    @media(max-width:720px){
      .collection-view__title{font-size:30px;}
      .collection-roster__entry{padding:9px 11px;gap:9px;}
      .collection-roster__avatar{width:44px;height:44px;border-radius:12px;}
      .collection-roster__avatar img{width:52px;height:52px;}
      .collection-roster__cost{font-size:10px;padding:4px 8px;}
      .collection-skill-overlay__abilities{gap:10px;}
      .collection-skill-card{padding:8px 12px;gap:8px;flex-wrap:wrap;align-items:flex-start;}
      .collection-skill-card__header{flex-wrap:wrap;gap:8px;}
      .collection-skill-card__title{font-size:14px;white-space:normal;}
      .collection-skill-card__actions{width:100%;justify-content:flex-start;gap:8px;}
      .collection-skill-card__badge{font-size:11px;}
      .collection-skill-card__upgrade{font-size:11px;padding:6px 12px;}
    }
  `;

  ensureStyleTag(STYLE_ID, { css });
}

type AbilityEntry = Record<string, unknown> & {
  name?: string;
  description?: string;
  notes?: unknown;
  id?: string | number;
  abilityId?: string | number;
  type?: string;
};

interface AbilityCardOptions {
  typeLabel?: string | null;
  unitId?: string | null;
}

function renderAbilityCard(entry: AbilityEntry | null | undefined, options: AbilityCardOptions = {}): HTMLElement{
  const { typeLabel = null, unitId = null } = options;
  const card = document.createElement('article');
  card.className = 'collection-skill-card';

  const header = document.createElement('header');
  header.className = 'collection-skill-card__header';

  const title = document.createElement('h4');
  title.className = 'collection-skill-card__title';
  title.textContent = entry?.name || 'Kĩ năng';
  header.appendChild(title);
  
  const actions = document.createElement('div');
  actions.className = 'collection-skill-card__actions';
  
  const resolvedTypeLabel = typeLabel || labelForAbility(entry);

  const badge = document.createElement('span');
  badge.className = 'collection-skill-card__badge';
  badge.textContent = resolvedTypeLabel;
  actions.appendChild(badge);

  const abilityId = entry?.id ?? entry?.abilityId ?? null;
  const upgradeButton = document.createElement('button');
  upgradeButton.type = 'button';
  upgradeButton.className = 'collection-skill-card__upgrade';
  upgradeButton.textContent = 'Nâng cấp';
  if (abilityId != null){
    upgradeButton.dataset.abilityId = String(abilityId);
  }
  upgradeButton.addEventListener('click', () => {
    const detail = { abilityId, ability: entry };
    card.dispatchEvent(new CustomEvent('collection:request-upgrade', { bubbles: true, detail }));
  });
  actions.appendChild(upgradeButton);

  header.appendChild(actions);

  card.appendChild(header);

  const descriptionText = entry?.description && String(entry.description).trim() !== ''
    ? String(entry.description)
    : 'Chưa có mô tả chi tiết.';
  card.dataset.description = descriptionText;

  if (resolvedTypeLabel){
    card.dataset.typeLabel = resolvedTypeLabel;
  }
  if (unitId){
    card.dataset.unitId = String(unitId);
  }
  if (abilityId != null){
    card.dataset.abilityId = String(abilityId);
  }

  if (Array.isArray(entry?.notes)){
    const filteredNotes = entry.notes
      .map(note => (typeof note === 'string' ? note.trim() : ''))
      .filter(note => note.length > 0);
    if (filteredNotes.length){
      card.dataset.notes = JSON.stringify(filteredNotes);
    }
  }
  
  const facts: AbilityFact[] = collectAbilityFacts(entry);
  if (facts.length){
    card.dataset.meta = JSON.stringify(facts);
  }

  card.addEventListener('click', event => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('.collection-skill-card__upgrade')){
      return;
    }
    const detail = {
      unitId: unitId || card.dataset.unitId || null,
      abilityId,
      ability: entry,
      typeLabel: resolvedTypeLabel
    };
    card.dispatchEvent(new CustomEvent('collection:toggle-skill-detail', { bubbles: true, detail }));
  });
  return card;
}

export function renderCollectionView(options: CollectionViewOptions): CollectionViewHandle{
  const {
    root,
    shell = null,
    playerState = {} as UnknownRecord,
    roster = null,
    currencies = null,
  } = options;
  const host = assertElement<HTMLElement>(root, {
    guard: (node): node is HTMLElement => node instanceof HTMLElement,
    message: 'renderCollectionView cần một phần tử root hợp lệ.',
  });

  ensureStyles();

  const cleanups: Array<() => void> = [];
  const addCleanup = (fn: (() => void) | null | undefined) => {
    if (typeof fn === 'function') cleanups.push(fn);
  };

  const filterState: FilterState = createFilterState();

  const container = document.createElement('div');
  container.className = 'collection-view';
  const mount = mountSection({
    root: host,
    section: container,
    rootClasses: 'app--collection',
  });

  const header = document.createElement('header');
  header.className = 'collection-view__header';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'collection-view__title-group';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'collection-view__back';
  backButton.textContent = '← Trở về menu chính';
  const handleBack = () => {
    if (shell && typeof shell.enterScreen === 'function'){
      shell.enterScreen('main-menu');
    }
  };
  backButton.addEventListener('click', handleBack);
  addCleanup(() => backButton.removeEventListener('click', handleBack));

  const title = document.createElement('h1');
  title.className = 'collection-view__title';
  title.textContent = 'Bộ Sưu Tập';

  titleGroup.appendChild(backButton);
  titleGroup.appendChild(title);

  const wallet = document.createElement('div');
  wallet.className = 'collection-view__wallet';

  for (const currency of currencyCatalog){
    const item = document.createElement('article');
    item.className = 'collection-wallet__item';

    const name = document.createElement('h2');
    name.className = 'collection-wallet__name';
    name.textContent = currency.shortName || currency.name || currency.id;
    item.appendChild(name);

    const balance = document.createElement('p');
    balance.className = 'collection-wallet__balance';
    const value = resolveCurrencyBalance(currency.id, currencies, playerState);
    balance.textContent = `${currencyFormatter.format(value)} ${currency.suffix || currency.id}`;
    item.appendChild(balance);

    wallet.appendChild(item);
  }

  header.appendChild(titleGroup);
  header.appendChild(wallet);

  container.appendChild(header);

  const layout = document.createElement('div');
  layout.className = 'collection-view__layout';

  const rosterPanel = document.createElement('section');
  rosterPanel.className = 'collection-roster';

  const rosterList = document.createElement('ul');
  rosterList.className = 'collection-roster__list';

  const rosterSource = buildRosterWithCost(cloneRoster(roster));
  const rosterEntries = new Map<string, { button: HTMLButtonElement; costEl: HTMLElement | null; meta: CollectionEntry }>();

  for (const unit of rosterSource){
    const item = document.createElement('li');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'collection-roster__entry';
    button.dataset.unitId = unit.id;
    button.dataset.rank = unit.rank || 'unknown';

    const avatar = document.createElement('div');
    avatar.className = 'collection-roster__avatar';
    const aura = document.createElement('div');
    aura.className = 'collection-roster__aura';
    avatar.appendChild(aura);
    const art = getUnitArt(unit.id);
    if (art?.sprite?.src){
      const img = document.createElement('img');
      img.src = art.sprite.src;
      img.alt = unit.name || unit.id;
      avatar.appendChild(img);
    } else {
      const fallback = document.createElement('span');
      fallback.textContent = '—';
      avatar.appendChild(fallback);
    }

    const cost = document.createElement('span');
    cost.className = 'collection-roster__cost';
    const costValue = Number.isFinite(unit.cost) ? unit.cost : '—';
    cost.textContent = `Cost ${costValue}`;

    const tooltipParts = [unit.name || unit.id];
    if (unit.rank){
      tooltipParts.push(`Rank ${unit.rank}`);
    }
    if (unit.class){
      tooltipParts.push(unit.class);
    }
    button.title = tooltipParts.join(' • ');
    button.setAttribute('aria-label', tooltipParts.join(' • '));

    button.appendChild(avatar);
    button.appendChild(cost);

    const handleSelect = () => {
      selectUnit(unit.id);
    };
    button.addEventListener('click', handleSelect);
    addCleanup(() => button.removeEventListener('click', handleSelect));

    item.appendChild(button);
    rosterList.appendChild(item);

    rosterEntries.set(unit.id, { button, costEl: cost, meta: unit });
  }

  rosterPanel.appendChild(rosterList);

  const stage = document.createElement('section');
  stage.className = 'collection-stage';

  const stageInfo = document.createElement('div');
  stageInfo.className = 'collection-stage__info';

  const identity = document.createElement('div');
  identity.className = 'collection-stage__identity';

  const stageName = document.createElement('h2');
  stageName.className = 'collection-stage__name';
  stageName.textContent = 'Chưa chọn nhân vật';

  const stageTags = document.createElement('div');
  stageTags.className = 'collection-stage__tags';

  const stageCost = document.createElement('div');
  stageCost.className = 'collection-stage__cost';
  stageCost.textContent = 'Cost —';

  identity.appendChild(stageName);
  identity.appendChild(stageTags);

  stageInfo.appendChild(identity);
  stageInfo.appendChild(stageCost);

  const stageArt = document.createElement('div');
  stageArt.className = 'collection-stage__art';

  const stageSprite = document.createElement('img');
  stageSprite.className = 'collection-stage__sprite';
  stageSprite.alt = '';
  stageSprite.style.opacity = '0';

  stageArt.appendChild(stageSprite);

  const stageStatus = document.createElement('p');
  stageStatus.className = 'collection-stage__status';
  stageStatus.textContent = 'Chọn một nhân vật để xem chi tiết và tab chức năng.';

  const overlay = document.createElement('div');
  overlay.className = 'collection-skill-overlay';

  const overlayHeader = document.createElement('div');
  overlayHeader.className = 'collection-skill-overlay__header';

  const overlayTitle = document.createElement('h3');
  overlayTitle.className = 'collection-skill-overlay__title';
  overlayTitle.textContent = 'Kĩ năng';

  const overlayClose = document.createElement('button');
  overlayClose.type = 'button';
  overlayClose.className = 'collection-skill-overlay__close';
  overlayClose.textContent = 'Đóng';

  const closeOverlay = () => {
    overlay.classList.remove('is-open');
    setActiveTab('awakening');
  };
  overlayClose.addEventListener('click', closeOverlay);
  addCleanup(() => overlayClose.removeEventListener('click', closeOverlay));

  overlayHeader.appendChild(overlayTitle);
  overlayHeader.appendChild(overlayClose);

  const overlayContent = document.createElement('div');
  overlayContent.className = 'collection-skill-overlay__content';

  const overlayDetails = document.createElement('div');
  overlayDetails.className = 'collection-skill-overlay__details';

  const overlaySubtitle = document.createElement('p');
  overlaySubtitle.className = 'collection-skill-overlay__subtitle';
  overlaySubtitle.textContent = 'Chọn nhân vật để xem mô tả kỹ năng.';

  const overlaySummary = document.createElement('p');
  overlaySummary.className = 'collection-skill-overlay__subtitle';
  overlaySummary.textContent = '';

  const overlayNotesList = document.createElement('ul');
  overlayNotesList.className = 'collection-skill-overlay__notes';
  const overlayAbilities = document.createElement('div');
  overlayAbilities.className = 'collection-skill-overlay__abilities';

const overlayDetailPanel = document.createElement('aside');
  overlayDetailPanel.className = 'collection-skill-detail';
  overlayDetailPanel.setAttribute('aria-hidden', 'true');
  overlayDetailPanel.hidden = true;

  const detailHeader = document.createElement('div');
  detailHeader.className = 'collection-skill-detail__header';

  const detailTitle = document.createElement('h4');
  detailTitle.className = 'collection-skill-detail__title';
  detailTitle.textContent = 'Chi tiết kỹ năng';

  const detailBadge = document.createElement('span');
  detailBadge.className = 'collection-skill-detail__badge';
  detailBadge.textContent = '';
  detailBadge.style.display = 'none';

  detailHeader.appendChild(detailTitle);
  detailHeader.appendChild(detailBadge);

  const detailDescription = document.createElement('p');
  detailDescription.className = 'collection-skill-detail__description';
  detailDescription.textContent = 'Chọn một kỹ năng ở danh sách bên trái để xem mô tả chi tiết.';

  const detailFacts = document.createElement('div');
  detailFacts.className = 'collection-skill-detail__facts';

  const detailNotes = document.createElement('ul');
  detailNotes.className = 'collection-skill-detail__notes';

  const detailEmpty = document.createElement('p');
  detailEmpty.className = 'collection-skill-detail__empty';
  detailEmpty.textContent = 'Chưa có lưu ý bổ sung.';
  detailEmpty.style.display = 'none';

  overlayDetailPanel.appendChild(detailHeader);
  overlayDetailPanel.appendChild(detailDescription);
  overlayDetailPanel.appendChild(detailFacts);
  overlayDetailPanel.appendChild(detailNotes);
  overlayDetailPanel.appendChild(detailEmpty);

  overlayDetails.appendChild(overlaySubtitle);
  overlayDetails.appendChild(overlaySummary);
  overlayDetails.appendChild(overlayNotesList);
  overlayDetails.appendChild(overlayAbilities);

  overlayContent.appendChild(overlayDetails);
  overlayContent.appendChild(overlayDetailPanel);

  overlay.appendChild(overlayHeader);
  overlay.appendChild(overlayContent);

  stage.appendChild(stageInfo);
  stage.appendChild(stageArt);
  stage.appendChild(stageStatus);
  stage.appendChild(overlay);

  let activeAbilityCard: HTMLElement | null = null;

  const clearSkillDetail = (): void => {
    if (activeAbilityCard){
      activeAbilityCard.classList.remove('is-expanded');
      activeAbilityCard = null;
    }
    overlayDetailPanel.classList.remove('is-active');
    overlayDetailPanel.setAttribute('aria-hidden', 'true');
    overlayDetailPanel.hidden = true;
    overlayContent.classList.remove('has-detail');
    detailTitle.textContent = 'Chi tiết kỹ năng';
    detailBadge.style.display = 'none';
    detailBadge.textContent = '';
    detailDescription.textContent = 'Chọn một kỹ năng ở danh sách bên trái để xem mô tả chi tiết.';
    while (detailFacts.firstChild){
      detailFacts.removeChild(detailFacts.firstChild);
    }
    while (detailNotes.firstChild){
      detailNotes.removeChild(detailNotes.firstChild);
    }
    detailEmpty.style.display = 'none';
  };

  const populateSkillDetail = (card: HTMLElement, payload: Record<string, unknown> | null | undefined): void => {
    const ability = (payload?.ability ?? null) as AbilityEntry | null;
    if (!ability){
      clearSkillDetail();
      return;
    }

    if (activeAbilityCard && activeAbilityCard !== card){
      activeAbilityCard.classList.remove('is-expanded');
    }
    if (activeAbilityCard === card && overlayDetailPanel.classList.contains('is-active')){
      clearSkillDetail();
      return;
    }

    activeAbilityCard = card;
    activeAbilityCard.classList.add('is-expanded');

    const abilityName = ability?.name || 'Kĩ năng';
    detailTitle.textContent = abilityName;

    const typeLabel = (payload?.typeLabel as string | null | undefined)
      || card.dataset.typeLabel
      || labelForAbility(ability);
    if (typeLabel){
      detailBadge.textContent = typeLabel;
      detailBadge.style.display = '';
    } else {
      detailBadge.textContent = '';
      detailBadge.style.display = 'none';
    }

    const description = ability?.description && String(ability.description).trim() !== ''
      ? String(ability.description)
      : card.dataset.description || 'Chưa có mô tả chi tiết.';
    detailDescription.textContent = description;

    while (detailFacts.firstChild){
      detailFacts.removeChild(detailFacts.firstChild);
    }
    const facts: AbilityFact[] = collectAbilityFacts(ability);
    if (facts.length){
      for (const fact of facts){
        const item = document.createElement('div');
        item.className = 'collection-skill-detail__fact';

        if (fact.icon){
          const iconEl = document.createElement('span');
          iconEl.className = 'collection-skill-detail__fact-icon';
          iconEl.textContent = fact.icon;
          item.appendChild(iconEl);
        }

        const factBody = document.createElement('div');

        if (fact.label){
          const labelEl = document.createElement('div');
          labelEl.className = 'collection-skill-detail__fact-label';
          labelEl.textContent = fact.label;
          factBody.appendChild(labelEl);
        }

        const valueEl = document.createElement('div');
        valueEl.className = 'collection-skill-detail__fact-value';
        valueEl.textContent = fact.value;
        factBody.appendChild(valueEl);

        if (fact.tooltip){
          valueEl.title = fact.tooltip;
        }

        item.appendChild(factBody);
        detailFacts.appendChild(item);
      }
    }

    while (detailNotes.firstChild){
      detailNotes.removeChild(detailNotes.firstChild);
    }

    const rawNotes = Array.isArray(ability?.notes) ? ability.notes : [];
    let cardNotes = [];
    if (card.dataset.notes){
      try {
        const parsed = JSON.parse(card.dataset.notes);
        if (Array.isArray(parsed)){
          cardNotes = parsed;
        }
      } catch (error) {
        // bỏ qua lỗi parse và tiếp tục với danh sách rỗng
      }
    }
    const mergedNotes = [...rawNotes, ...cardNotes]
      .map(note => (typeof note === 'string' ? note.trim() : ''))
      .filter((note, index, array) => note && array.indexOf(note) === index);

    if (mergedNotes.length){
      for (const note of mergedNotes){
        const noteItem = document.createElement('li');
        noteItem.textContent = note;
        detailNotes.appendChild(noteItem);
      }
      detailEmpty.style.display = 'none';
    } else {
      detailEmpty.style.display = '';
    }

    overlayDetailPanel.hidden = false;
    overlayDetailPanel.classList.add('is-active');
    overlayDetailPanel.setAttribute('aria-hidden', 'false');
    overlayContent.classList.add('has-detail');
  };

  const handleSkillDetailToggle = (event: CustomEvent): void => {
    const target = event.target as HTMLElement | null;
    const card = target?.closest('.collection-skill-card') as HTMLElement | null;
    if (!card){
      return;
    }
    populateSkillDetail(card, event.detail as Record<string, unknown>);
  };

  overlay.addEventListener('collection:toggle-skill-detail', handleSkillDetailToggle);
  addCleanup(() => overlay.removeEventListener('collection:toggle-skill-detail', handleSkillDetailToggle));

  const handleGlobalClick = (event: MouseEvent): void => {
    if (overlayDetailPanel.hidden) return;
    const target = event.target as HTMLElement | null;
    if (target && overlay.contains(target)){
      if (target.closest('.collection-skill-detail')) return;
      if (target.closest('.collection-skill-card')) return;
    }
    clearSkillDetail();
  };

  document.addEventListener('click', handleGlobalClick);
  addCleanup(() => document.removeEventListener('click', handleGlobalClick));

  const tabs = document.createElement('aside');
  tabs.className = 'collection-tabs';

  const tabsTitle = document.createElement('h2');
  tabsTitle.className = 'collection-tabs__title';
  tabsTitle.textContent = 'Danh sách tab';
  tabs.appendChild(tabsTitle);

  const tabButtons = new Map<CollectionTabKey, HTMLButtonElement>();;

  const setActiveTab = (key: CollectionTabKey) => {
    updateActiveTab(filterState, key);
    for (const [tabKey, button] of tabButtons){
      if (!button) continue;
      if (tabKey === key){
        button.classList.add('is-active');
      } else {
        button.classList.remove('is-active');
      }
    }
    const definition = TAB_DEFINITIONS.find(tab => tab.key === key);
    stageStatus.textContent = definition?.hint || 'Khung thông tin chức năng.';
    if (key === 'skills'){
      overlay.classList.add('is-open');
    } else {
      overlay.classList.remove('is-open');
      clearSkillDetail();
    }
  };

  const handleTabClick = (key: CollectionTabKey | 'close') => {
    if (key === 'close'){
      if (shell && typeof shell.enterScreen === 'function'){
        shell.enterScreen('main-menu');
      }
      return;
    }
    setActiveTab(key);
  };

  for (const tab of TAB_DEFINITIONS){
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'collection-tabs__button';
    button.dataset.tabKey = tab.key;

    const label = document.createElement('span');
    label.textContent = tab.label;
    button.appendChild(label);

    const hint = document.createElement('span');
    hint.className = 'collection-tabs__hint';
    hint.textContent = '→';
    button.appendChild(hint);

    const clickHandler = () => handleTabClick(tab.key);
    button.addEventListener('click', clickHandler);
    addCleanup(() => button.removeEventListener('click', clickHandler));

    tabButtons.set(tab.key, button);
    tabs.appendChild(button);
  }

  const exitButton = document.createElement('button');
  exitButton.type = 'button';
  exitButton.className = 'collection-tabs__button';
  exitButton.dataset.tabKey = 'close';
  exitButton.innerHTML = '<span>Thoát</span><span class="collection-tabs__hint">↩</span>';
  const handleExit = () => {
    if (shell && typeof shell.enterScreen === 'function'){
      shell.enterScreen('main-menu');
    }
  };
  exitButton.addEventListener('click', handleExit);
  addCleanup(() => exitButton.removeEventListener('click', handleExit));
  tabs.appendChild(exitButton);

  layout.appendChild(rosterPanel);
  layout.appendChild(stage);
  layout.appendChild(tabs);

  container.appendChild(layout);

  if (root.appendChild){
    root.appendChild(container);
  }

  const selectUnit = (unitId: string | null) => {
    if (!unitId || !rosterEntries.has(unitId)) return;
    updateSelectedUnit(filterState, unitId);
    clearSkillDetail();
    for (const [id, entry] of rosterEntries){
      if (!entry?.button) continue;
      if (id === unitId){
        entry.button.classList.add('is-selected');
        if (entry.costEl){
          entry.costEl.classList.add('is-highlighted');
        }
      } else {
        entry.button.classList.remove('is-selected');
        if (entry.costEl){
          entry.costEl.classList.remove('is-highlighted');
        }
      }
    }

    const unit = rosterEntries.get(unitId)?.meta || null;
    stageName.textContent = unit?.name || unitId;

    while (stageTags.firstChild){
      stageTags.removeChild(stageTags.firstChild);
    }
    if (unit?.rank){
      const rankTag = document.createElement('span');
      rankTag.className = 'collection-stage__tag';
      rankTag.textContent = `Rank ${unit.rank}`;
      stageTags.appendChild(rankTag);
    }
    if (unit?.class){
      const classTag = document.createElement('span');
      classTag.className = 'collection-stage__tag';
      classTag.textContent = unit.class;
      stageTags.appendChild(classTag);
    }

    const costValue = Number.isFinite(unit?.cost) ? unit.cost : '—';
    stageCost.textContent = `Cost ${costValue}`;

    const art = getUnitArt(unitId);
    if (art?.sprite?.src){
      stageSprite.src = art.sprite.src;
      stageSprite.alt = unit?.name || unitId;
      stageSprite.style.opacity = '1';
    } else {
      stageSprite.removeAttribute('src');
      stageSprite.alt = '';
      stageSprite.style.opacity = '0';
    }

    overlayTitle.textContent = unit?.name ? `Kĩ năng · ${unit.name}` : 'Kĩ năng';
    
    const skillSet = getSkillSet(unitId);
    overlaySubtitle.textContent = describeUlt(unit);
    const summaryNote = skillSet?.notes?.[0] ?? '';
    overlaySummary.textContent = summaryNote;
    overlaySummary.style.display = summaryNote ? '' : 'none';

    while (overlayNotesList.firstChild){
      overlayNotesList.removeChild(overlayNotesList.firstChild);
    }
    const extraNotes = Array.isArray(skillSet?.notes) ? skillSet.notes.slice(1) : [];
    if (extraNotes.length){
      overlayNotesList.style.display = '';
      for (const note of extraNotes){
        if (!note) continue;
        const item = document.createElement('li');
        item.textContent = note;
        overlayNotesList.appendChild(item);
      }
    } else {
      overlayNotesList.style.display = 'none';
    }

    while (overlayAbilities.firstChild){
      overlayAbilities.removeChild(overlayAbilities.firstChild);
    }
    const abilityEntries: Array<{ entry: AbilityEntry | null | undefined; label: string }> = [];
    if (skillSet?.basic){
      abilityEntries.push({ entry: skillSet.basic, label: ABILITY_TYPE_LABELS.basic });
    }
    if (Array.isArray(skillSet?.skills)){
      skillSet.skills.forEach((skill, index) => {
        if (!skill) return;
        abilityEntries.push({ entry: skill, label: `Kĩ năng ${index + 1}` });
      });
    }
    if (skillSet?.ult){
      abilityEntries.push({ entry: skillSet.ult, label: ABILITY_TYPE_LABELS.ultimate });
    }
    if (skillSet?.talent){
      abilityEntries.push({ entry: skillSet.talent, label: ABILITY_TYPE_LABELS.talent });
    }
    if (skillSet?.technique){
      abilityEntries.push({ entry: skillSet.technique, label: ABILITY_TYPE_LABELS.technique });
    }

    if (abilityEntries.length){
      for (const ability of abilityEntries){
        overlayAbilities.appendChild(renderAbilityCard(ability.entry, { typeLabel: ability.label, unitId }));
      }
    } else {
      const placeholder = document.createElement('p');
      placeholder.className = 'collection-skill-card__empty';
      placeholder.textContent = 'Chưa có dữ liệu kỹ năng chi tiết cho nhân vật này.';
      overlayAbilities.appendChild(placeholder);
    }

    if (filterState.activeTab === 'skills'){
      overlay.classList.add('is-open');
    }
  };

  const observer = new MutationObserver(() => {
    // placeholder to keep overlay in DOM order if needed
  });
  observer.observe(stage, { childList: true });
  addCleanup(() => observer.disconnect());

  if (rosterEntries.size > 0){
    const [firstId] = rosterEntries.keys();
    if (firstId){
      selectUnit(firstId);
    }
  }

  setActiveTab(filterState.activeTab);

  return {
    destroy(){
      for (const fn of cleanups.splice(0, cleanups.length)){
        try {
          fn();
        } catch (error) {
          console.error('[collection] cleanup error', error);
        }
      }
      mount.destroy();
    }
  } satisfies CollectionViewHandle;
}

export { renderCollectionView };