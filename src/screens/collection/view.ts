//home (termux)/arclune_lane_7x3/src/screens/collection/view.ts

import { getUnitArt } from '../../art.ts';
import { normalizeUnitId } from '../../utils/unit-id.ts';
import { getSkillSet } from '../../data/skills.ts';
import { createNumberFormatter } from '../../utils/format.ts';
import { upgradeCultivation, getCultivationCost, type CultivationPlayerState } from '../../cultivation.ts';
import { getCultivationRealmEconomy } from '../../data/economy.ts';
import {
  createNormalizedWallet,
  getSharedCurrencyWallet,
  subscribeSharedCurrencyWallet,
  syncSharedCurrencyWallet,
} from '../../utils/currency.ts';
import { assertElement, ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { normalizeRarity } from '../../utils/rarity.ts';

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
import { loadPlayerProfile, patchPlayerProfile } from '../../utils/player-profile.ts';
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
import type { CurrencyDefinition } from '@shared-types/config';
import type { Rarity } from '../../utils/rarity.ts';

const STYLE_ID = 'collection-view-style-v2';
const SSR_AURA_SRC = 'assets/rank_aura/SSR_aura.webp';
let ssrAuraPreloadImage: HTMLImageElement | null = null;

const TAB_DEFINITIONS = [
  { key: 'skills', label: 'Kĩ Năng & Thức Tỉnh', hint: 'Mở lớp phủ mô tả kỹ năng, chuỗi nâng cấp và yêu cầu nguyên liệu.', icon: 'assets/collection/skill&essence.webp' },
  { key: 'arts', label: 'Công Pháp & Trang Bị', hint: 'Liệt kê công pháp, pháp khí và trang bị đang trang bị cho nhân vật.', icon: 'assets/collection/gear&art.webp' },
  { key: 'skins', label: 'Skin', hint: 'Quản lý skin đã mở khóa và áp dụng bảng phối màu yêu thích.', icon: 'assets/collection/skin.webp' },
  { key: 'voice', label: 'Giọng Nói', hint: 'Nghe thử voice line, thiết lập voice pack và gợi ý mở khóa.', icon: 'assets/collection/voice.webp' }
] satisfies ReadonlyArray<{ key: CollectionTabKey; label: string; hint: string; icon: string }>;

const TAB_HINT_BY_KEY: Readonly<Record<CollectionTabKey, string>> = TAB_DEFINITIONS.reduce((acc, tab) => {
  acc[tab.key] = tab.hint;
  return acc;
}, {} as Record<CollectionTabKey, string>);

function resolveRosterCellGap(baseGapPx: number, reductionRatio: number): string {
  const normalizedBase = Number.isFinite(baseGapPx) ? Math.max(0, baseGapPx) : 0;
  const normalizedRatio = Number.isFinite(reductionRatio) ? Math.min(Math.max(reductionRatio, 0), 1) : 0;
  const reducedGap = normalizedBase * (1 - normalizedRatio);
  return `${Math.max(0, reducedGap).toFixed(2)}px`;
}

function clearChildren(node: HTMLElement): void {
  node.replaceChildren();
}

function preloadSharedSsrAura(): void {
  if (typeof Image === 'undefined'){
    return;
  }
  if (ssrAuraPreloadImage){
    return;
  }
  const img = new Image();
  img.src = SSR_AURA_SRC;
  ssrAuraPreloadImage = img;
}

const currencyCatalog: CurrencyCatalog = getCurrencyCatalog();
const currencyFormatter = ensureNumberFormatter(createNumberFormatter, 'vi-VN');

function toSafeText(value: string | number | null | undefined): string{
  if (value == null){
    return '';
  }
  if (typeof value === 'number'){
    return Number.isFinite(value) ? String(value) : '';
  }
  return value;
}

function parseJsonArrayFromDataset(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0);
  } catch {
    return [];
  }
}

function parseFactListFromDataset(value: string | undefined): AbilityFact[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    const normalizedFacts: AbilityFact[] = [];
    for (const entry of parsed){
      if (!entry || typeof entry !== 'object') continue;
      const fact = entry as Partial<AbilityFact>;
      const normalizedValue = toSafeText(fact.value ?? '');
      if (!normalizedValue) continue;
      normalizedFacts.push({
        icon: toSafeText(fact.icon ?? '') || null,
        label: toSafeText(fact.label ?? '') || null,
        value: normalizedValue,
        tooltip: toSafeText(fact.tooltip ?? '') || null,
      });
    }
    return normalizedFacts;
  } catch {
    return [];
  }
}

function ensureStyles(){
  const rosterCellGap = resolveRosterCellGap(78, 0);
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
    .collection-view__layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(0,3.3fr) max-content;gap:24px;align-items:stretch;position:relative;}
    .collection-roster{border-radius:0;border:none;background:none;padding:0;display:flex;flex-direction:column;gap:12px;overflow:visible;z-index:3;margin-right:calc(-10vw);}
    .collection-roster__list{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(3,max-content);column-gap:${rosterCellGap};row-gap:${rosterCellGap};justify-content:start;max-height:560px;overflow:auto;padding-right:4px;}
    .collection-roster__list > li{width:max-content;height:max-content;}
    .collection-roster__entry{display:inline-flex;align-items:center;justify-content:center;gap:0;padding:0;border-radius:0;border:none;background:none;color:inherit;cursor:pointer;transition:transform .18s ease,filter .18s ease;width:auto;}
    .collection-roster__entry:hover{transform:translateY(-2px);filter:brightness(1.08);}
    .collection-roster__entry:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
    .collection-roster__entry.is-selected{filter:brightness(1.15) saturate(1.05);}
    .collection-roster__entry[data-rank="S"]{--entry-bg:rgba(38,20,52,.78);--entry-bg-hover:rgba(48,26,68,.92);--entry-bg-selected:rgba(54,30,74,.96);--entry-border:rgba(255,180,255,.4);--entry-border-hover:rgba(255,204,255,.58);--entry-border-selected:rgba(255,228,255,.72);--entry-shadow:0 0 0 1px rgba(255,192,255,.2);--entry-shadow-hover:0 10px 26px rgba(150,66,188,.45);--entry-shadow-selected:0 18px 44px rgba(150,66,188,.6);}
    .collection-roster__entry[data-rank="A"]{--entry-bg:rgba(30,40,58,.78);--entry-bg-hover:rgba(38,50,72,.92);--entry-bg-selected:rgba(44,58,84,.96);--entry-border:rgba(124,187,255,.35);--entry-border-hover:rgba(158,208,255,.52);--entry-border-selected:rgba(188,226,255,.7);--entry-shadow:0 0 0 1px rgba(140,200,255,.2);--entry-shadow-hover:0 10px 26px rgba(64,116,188,.42);--entry-shadow-selected:0 18px 44px rgba(64,116,188,.55);}
    .collection-roster__entry[data-rank="B"]{--entry-bg:rgba(28,46,40,.78);--entry-bg-hover:rgba(34,58,50,.9);--entry-bg-selected:rgba(40,68,58,.95);--entry-border:rgba(120,224,185,.35);--entry-border-hover:rgba(146,236,204,.52);--entry-border-selected:rgba(176,246,220,.68);--entry-shadow:0 0 0 1px rgba(126,236,199,.18);--entry-shadow-hover:0 10px 24px rgba(42,126,110,.4);--entry-shadow-selected:0 18px 38px rgba(42,126,110,.52);}
    .collection-roster__entry[data-rank="C"]{--entry-bg:rgba(46,46,28,.78);--entry-bg-hover:rgba(58,58,34,.9);--entry-bg-selected:rgba(68,68,40,.95);--entry-border:rgba(232,212,124,.32);--entry-border-hover:rgba(244,226,150,.48);--entry-border-selected:rgba(252,238,176,.64);--entry-shadow:0 0 0 1px rgba(240,224,150,.16);--entry-shadow-hover:0 10px 24px rgba(162,138,52,.38);--entry-shadow-selected:0 18px 36px rgba(162,138,52,.48);}
    .collection-roster__entry[data-rank="D"]{--entry-bg:rgba(48,34,24,.78);--entry-bg-hover:rgba(60,42,30,.9);--entry-bg-selected:rgba(70,48,36,.95);--entry-border:rgba(255,170,108,.3);--entry-border-hover:rgba(255,188,138,.46);--entry-border-selected:rgba(255,208,170,.6);--entry-shadow:0 0 0 1px rgba(255,182,132,.14);--entry-shadow-hover:0 10px 22px rgba(168,88,42,.36);--entry-shadow-selected:0 18px 32px rgba(168,88,42,.45);}
    .collection-roster__entry[data-rank="unknown"],
    .collection-roster__entry:not([data-rank]){--entry-shadow:none;}
    .collection-roster__avatar{--ssr-aura:url('${SSR_AURA_SRC}');width:108px;height:108px;background:none;overflow:visible;position:relative;display:flex;align-items:center;justify-content:center;}
    .collection-roster__portrait{width:108px;height:108px;position:relative;z-index:2;display:flex;align-items:center;justify-content:center;overflow:hidden;}
    .collection-roster__portrait img{width:108px;height:108px;object-fit:contain;filter:drop-shadow(0 10px 18px rgba(0,0,0,.55));position:relative;z-index:1;}
    .collection-roster__portrait span{position:relative;z-index:1;color:#aee4ff;font-weight:600;letter-spacing:.08em;}
    .collection-roster__aura{position:absolute;inset:50% auto auto 50%;width:183.6%;height:183.6%;transform:translate(-50%,-50%);z-index:1;background-image:var(--ssr-aura);background-position:center;background-repeat:no-repeat;background-size:contain;pointer-events:none;}
    .collection-stage{position:relative;border-radius:0;border:none;background:none;padding:28px;display:flex;flex-direction:column;gap:18px;overflow:hidden;min-height:462px;width:110%;transform:translateX(10%);transform-origin:center;z-index:1;}
    .collection-stage>*{position:relative;z-index:2;}
    .collection-stage__art{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;z-index:1;pointer-events:none;}
    .collection-stage__sprite{width:100%;max-width:none;height:100%;object-fit:contain;opacity:.42;filter:drop-shadow(0 28px 56px rgba(0,0,0,.55));transition:transform .3s ease,filter .3s ease,opacity .3s ease;}
    .collection-stage__tuvi{position:absolute;left:50%;bottom:84px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:3;pointer-events:none;gap:8px;padding:8px 12px;border-radius:14px;background:rgba(6,14,24,.56);backdrop-filter:blur(2px);}
    .collection-stage__tuvi-realm{margin:0;color:#d6f1ff;font-size:20px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;text-align:center;}
    .collection-stage__tuvi-subrealm{display:none;}
    .collection-stage__tuvi-cost{margin:0;color:#9fc8ea;font-size:12px;letter-spacing:.05em;text-transform:uppercase;text-align:center;}
    .collection-stage__tuvi-actions{display:flex;position:absolute;left:50%;bottom:28px;transform:translateX(-50%);z-index:3;gap:10px;}
    .collection-stage__tuvi-btn{width:44px;height:44px;border-radius:50%;border:1px solid rgba(110,231,183,.6);background:linear-gradient(160deg,rgba(16,185,129,.35),rgba(5,46,22,.88));color:#dcfce7;font-size:24px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .18s ease,filter .18s ease;}
    .collection-stage__tuvi-btn:hover{transform:translateY(-2px);filter:brightness(1.08);}
    .collection-stage__tuvi-btn:focus-visible{outline:2px solid rgba(110,231,183,.82);outline-offset:2px;}
    .collection-stage__tuvi-btn:disabled{cursor:not-allowed;background:linear-gradient(160deg,rgba(40,40,40,.6),rgba(12,12,12,.95));border-color:rgba(115,115,115,.65);color:#737373;filter:none;}
    .collection-stage__info{display:none;}
    .collection-stage__identity{display:flex;flex-direction:column;gap:6px;}
    .collection-stage__name{margin:0;font-size:26px;letter-spacing:.06em;}
    .collection-stage__tags{display:flex;gap:10px;flex-wrap:wrap;}
    .collection-stage__tag{padding:6px 12px;border-radius:999px;border:1px solid rgba(125,211,252,.28);background:rgba(12,22,32,.78);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#aee4ff;}
    .collection-stage__status{display:none;}
    .collection-tabs{border-radius:0;border:none;background:none;padding:0;display:flex;flex-direction:column;align-items:flex-end;justify-self:end;gap:10px;z-index:4;min-width:36px;}
    .collection-tabs__button{width:36px;height:36px;padding:0;border-radius:50%;border:1px solid rgba(125,211,252,.2);background:rgba(8,16,24,.82);color:inherit;cursor:pointer;display:flex;justify-content:center;align-items:center;transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease;}
    .collection-tabs__button:hover{transform:translateY(-2px);border-color:rgba(125,211,252,.42);background:rgba(16,26,36,.92);}
    .collection-tabs__button:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
    .collection-tabs__button.is-active{border-color:rgba(125,211,252,.55);background:rgba(18,30,42,.96);box-shadow:0 10px 24px rgba(6,12,20,.42);}
    .collection-tabs__icon{width:78%;height:78%;display:block;object-fit:contain;filter:drop-shadow(0 1px 3px rgba(0,0,0,.45));pointer-events:none;}
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
    .collection-skill-overlay__notes li::before{content:'•';position:absolute;left:0;color:#7da0c7;}
    @media(max-width:1200px){
      .collection-view__layout{grid-template-columns:minmax(0,1.6fr) minmax(0,3.3fr) max-content;}
    }
    @media(max-width:1080px){
      .collection-view__layout{grid-template-columns:1fr;}
      .collection-roster{margin-right:0;}
      .collection-roster__list{grid-template-columns:repeat(3,max-content);}
      .collection-skill-overlay{position:fixed;top:50%;left:50%;transform:translate(-50%,calc(-50% + 12px));width:88vw;min-height:0;max-height:85vh;}
      .collection-skill-overlay.is-open{transform:translate(-50%,-50%);}
      .collection-skill-overlay__content{grid-template-columns:1fr;}
      .collection-skill-overlay__content.has-detail{grid-template-columns:1fr;}
    }
    @media(max-width:820px){
      .collection-roster__list{grid-template-columns:repeat(3,max-content);}
    }
    @media(max-width:720px){
      .collection-view__title{font-size:30px;}
      .collection-roster__entry{padding:0;gap:0;}
      .collection-roster__avatar{width:96px;height:96px;}
      .collection-roster__portrait{width:96px;height:96px;}
      .collection-roster__portrait img{width:96px;height:96px;}
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

type SkillDetailEventDetail = UnknownRecord;

interface AbilityDetailRecord extends SkillDetailEventDetail {
  ability?: AbilityEntry | null;
  abilityId?: string | number | null;
  typeLabel?: string | null;
  facts?: AbilityFact[];
  notes?: string[];
}

declare global {
  interface HTMLElementEventMap {
    'collection:toggle-skill-detail': CustomEvent<SkillDetailEventDetail>;
  }
}

interface AbilityCardOptions {
  typeLabel?: string | null;
  unitId?: string | null;
  abilityKey?: string | null;
  facts?: ReadonlyArray<AbilityFact>;
  notes?: ReadonlyArray<string>;
}

function renderAbilityCard(entry: AbilityEntry | null | undefined, options: AbilityCardOptions = {}): HTMLElement{
  const {
    typeLabel = null,
    unitId = null,
    abilityKey = null,
    facts: precomputedFacts = [],
    notes: precomputedNotes = [],
  } = options;
  const card = document.createElement('article');
  card.className = 'collection-skill-card';

  const header = document.createElement('header');
  header.className = 'collection-skill-card__header';

  const title = document.createElement('h4');
  title.className = 'collection-skill-card__title';
  title.textContent = toSafeText(entry?.name ?? 'Kĩ năng');
  header.appendChild(title);
  
  const actions = document.createElement('div');
  actions.className = 'collection-skill-card__actions';
  
  const resolvedTypeLabel = typeLabel || labelForAbility(entry);

  const badge = document.createElement('span');
  badge.className = 'collection-skill-card__badge';
  badge.textContent = toSafeText(resolvedTypeLabel);
  actions.appendChild(badge);

  const abilityId = entry?.id ?? entry?.abilityId ?? null;
  const upgradeButton = document.createElement('button');
  upgradeButton.type = 'button';
  upgradeButton.className = 'collection-skill-card__upgrade';
  upgradeButton.textContent = 'Nâng cấp';
  if (abilityId != null){
    upgradeButton.dataset.abilityId = String(abilityId);
  }
  if (abilityKey){
    upgradeButton.dataset.abilityKey = abilityKey;
  }
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
  if (abilityKey){
    card.dataset.abilityKey = abilityKey;
  }

  const filteredNotes = precomputedNotes.length
    ? [...precomputedNotes]
    : (Array.isArray(entry?.notes)
    ? entry.notes
      .map(note => (typeof note === 'string' ? note.trim() : ''))
      .filter(note => note.length > 0)
    : []);
  if (filteredNotes.length){
    card.dataset.notes = JSON.stringify(filteredNotes);
  }

  const facts: AbilityFact[] = precomputedFacts.length ? [...precomputedFacts] : collectAbilityFacts(entry);
  if (facts.length){
    card.dataset.meta = JSON.stringify(facts);
  }

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
  const savedProfile = loadPlayerProfile();
  const savedCultivationByUnit: Record<string, { realm: number; subRealm: number }> = {
    ...(savedProfile.cultivationByUnit ?? {}),
  };
  let activeUnitId: string | null = null;
  const mutablePlayerState: CultivationPlayerState = {
    ...(playerState as CultivationPlayerState),
    currencies: { ...((playerState as CultivationPlayerState)?.currencies ?? {}) },
  };
  let hasPositiveCurrencyOverride = false;
  for (const currency of currencyCatalog){
    const resolved = resolveCurrencyBalance(currency.id, currencies, playerState);
    if (Number.isFinite(resolved) && resolved > 0){
      hasPositiveCurrencyOverride = true;
      mutablePlayerState.currencies![currency.id] = resolved;
    }
  }
  mutablePlayerState.currencies = createNormalizedWallet(
    hasPositiveCurrencyOverride ? mutablePlayerState.currencies : null,
    getSharedCurrencyWallet(),
  );
  syncSharedCurrencyWallet(mutablePlayerState.currencies, { merge: true });

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
  const walletBalances = new Map<string, HTMLElement>();

  for (const currency of currencyCatalog){
    const item = document.createElement('article');
    item.className = 'collection-wallet__item';

    const name = document.createElement('h2');
    name.className = 'collection-wallet__name';
    name.textContent = currency.shortName || currency.name || currency.id;
    item.appendChild(name);

    const balance = document.createElement('p');
    balance.className = 'collection-wallet__balance';
    const value = resolveCurrencyBalance(currency.id, currencies, mutablePlayerState);
    const displayValue = Number.isFinite(value)
      ? value
      : Number(mutablePlayerState.currencies?.[currency.id] ?? 0);
    balance.textContent = `${currencyFormatter.format(displayValue)} ${currency.suffix || currency.id}`;
    item.appendChild(balance);
    walletBalances.set(currency.id, balance);

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
  preloadSharedSsrAura();
  const skillSetCache = new Map<string, ReturnType<typeof getSkillSet>>();
  const abilityDetailCache = new Map<string, AbilityDetailRecord>();
  const abilityRenderCache = new Map<string, HTMLElement[]>();
  const abilityDetailByUnitCache = new Map<string, Map<string, AbilityDetailRecord>>();
  const rosterEntries = new Map<string, {
    button: HTMLButtonElement;
    avatar: HTMLElement;
    meta: CollectionEntry;
    rarity: Rarity | null;
  }>();

  for (const unit of rosterSource){
    const unitId = normalizeUnitId(unit.id);
    const item = document.createElement('li');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'collection-roster__entry';
    button.dataset.unitId = unitId;
    const rawRank = typeof unit.rank === 'string' ? unit.rank : null;
    let rawMetaRank: string | null = null;
    if (unit.raw && typeof unit.raw === 'object'){
      const rankValue = (unit.raw as Record<string, unknown>).rank;
      rawMetaRank = typeof rankValue === 'string' ? rankValue : null;
    }

    let normalizedRank: Rarity | null = null;
    const rankCandidates: Array<string | null> = [rawRank, rawMetaRank];
    for (const candidate of rankCandidates){
      if (typeof candidate !== 'string' || !candidate.trim()){
        continue;
      }
      try {
        normalizedRank = normalizeRarity(candidate);
        break;
      } catch (error) {
        continue;
      }
    }

    const displayRank = normalizedRank ?? rawRank ?? rawMetaRank ?? null;
    button.dataset.rank = displayRank ?? 'unknown';

    const avatar = document.createElement('div');
    avatar.className = 'collection-roster__avatar';

    if (normalizedRank === 'SSR'){
      const aura = document.createElement('div');
      aura.className = 'collection-roster__aura';
      aura.setAttribute('aria-hidden', 'true');
      avatar.appendChild(aura);
    }

    const portrait = document.createElement('div');
    portrait.className = 'collection-roster__portrait';
    const art = getUnitArt(unitId);
    if (art?.sprite?.src){
      const img = document.createElement('img');
      img.src = art.sprite.src;
      img.alt = unit.name || unitId;
      portrait.appendChild(img);
    } else {
      const fallback = document.createElement('span');
      fallback.textContent = '—';
      portrait.appendChild(fallback);
    }

   avatar.appendChild(portrait);

    const tooltipParts = [unit.name || unitId];
    if (displayRank){
      tooltipParts.push(`Rank ${displayRank}`);
    }
    if (unit.class){
      tooltipParts.push(unit.class);
    }
    button.title = tooltipParts.join(' • ');
    button.setAttribute('aria-label', tooltipParts.join(' • '));

    button.appendChild(avatar);

    item.appendChild(button);
    rosterList.appendChild(item);

    rosterEntries.set(unitId, { button, avatar, meta: unit, rarity: normalizedRank });
  }

   const handleRosterClick = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>('.collection-roster__entry');
    if (!button) return;
    const unitId = button.dataset.unitId ?? null;
    if (!unitId) return;
    selectUnit(unitId);
  };
  rosterList.addEventListener('click', handleRosterClick);
  addCleanup(() => rosterList.removeEventListener('click', handleRosterClick));

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

  identity.appendChild(stageName);
  identity.appendChild(stageTags);

  stageInfo.appendChild(identity);

  const stageArt = document.createElement('div');
  stageArt.className = 'collection-stage__art';

  const stageSprite = document.createElement('img');
  stageSprite.className = 'collection-stage__sprite';
  stageSprite.alt = '';
  stageSprite.style.opacity = '0';

  stageArt.appendChild(stageSprite);
  const tuViPanel = document.createElement('section');
  tuViPanel.className = 'collection-stage__tuvi';

  const tuViRealm = document.createElement('h3');
  tuViRealm.className = 'collection-stage__tuvi-realm';
  tuViRealm.textContent = 'Cảnh giới 1';

  const tuViSubRealm = document.createElement('p');
  tuViSubRealm.className = 'collection-stage__tuvi-subrealm';
  tuViSubRealm.textContent = 'Tiểu cảnh giới 0';

  const tuViCost = document.createElement('p');
  tuViCost.className = 'collection-stage__tuvi-cost';
  tuViCost.textContent = 'Chi phí kế tiếp: —';

  tuViPanel.appendChild(tuViRealm);
  tuViPanel.appendChild(tuViSubRealm);
  tuViPanel.appendChild(tuViCost);

  const tuViActions = document.createElement('div');
  tuViActions.className = 'collection-stage__tuvi-actions';

  const tuViUpgrade = document.createElement('button');
  tuViUpgrade.type = 'button';
  tuViUpgrade.className = 'collection-stage__tuvi-btn';
  tuViUpgrade.textContent = '+';
  tuViUpgrade.setAttribute('aria-label', 'Nâng một tiểu cảnh giới');

  const tuViDisabled1 = document.createElement('button');
  tuViDisabled1.type = 'button';
  tuViDisabled1.className = 'collection-stage__tuvi-btn';
  tuViDisabled1.textContent = '+';
  tuViDisabled1.disabled = true;

  const tuViDisabled2 = document.createElement('button');
  tuViDisabled2.type = 'button';
  tuViDisabled2.className = 'collection-stage__tuvi-btn';
  tuViDisabled2.textContent = '+';
  tuViDisabled2.disabled = true;

  tuViActions.appendChild(tuViUpgrade);
  tuViActions.appendChild(tuViDisabled1);
  tuViActions.appendChild(tuViDisabled2);

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
    setActiveTab('arts');
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
  stage.appendChild(tuViPanel);
  stage.appendChild(tuViActions);
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
    clearChildren(detailFacts);
    clearChildren(detailNotes);
    detailEmpty.style.display = 'none';
  };

  const populateSkillDetail = (card: HTMLElement, payload: AbilityDetailRecord | null | undefined): void => {
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
    detailTitle.textContent = toSafeText(abilityName);

    const typeLabel = (payload?.typeLabel as string | null | undefined)
      || card.dataset.typeLabel
      || labelForAbility(ability);
    if (typeLabel){
      detailBadge.textContent = toSafeText(typeLabel);
      detailBadge.style.display = '';
    } else {
      detailBadge.textContent = '';
      detailBadge.style.display = 'none';
    }

    const description = ability?.description && String(ability.description).trim() !== ''
      ? String(ability.description)
      : card.dataset.description || 'Chưa có mô tả chi tiết.';
    detailDescription.textContent = toSafeText(description);

    clearChildren(detailFacts);
    const factsFromCard = Array.isArray(payload?.facts) ? payload.facts : parseFactListFromDataset(card.dataset.meta);
    const facts: AbilityFact[] = factsFromCard.length ? factsFromCard : collectAbilityFacts(ability);
    if (facts.length){
      for (const fact of facts){
        const item = document.createElement('div');
        item.className = 'collection-skill-detail__fact';

        if (fact.icon){
          const iconEl = document.createElement('span');
          iconEl.className = 'collection-skill-detail__fact-icon';
          iconEl.textContent = toSafeText(fact.icon);
          item.appendChild(iconEl);
        }

        const factBody = document.createElement('div');

        if (fact.label){
          const labelEl = document.createElement('div');
          labelEl.className = 'collection-skill-detail__fact-label';
          labelEl.textContent = toSafeText(fact.label);
          factBody.appendChild(labelEl);
        }

        const valueEl = document.createElement('div');
        valueEl.className = 'collection-skill-detail__fact-value';
        valueEl.textContent = toSafeText(fact.value);
        factBody.appendChild(valueEl);

        if (fact.tooltip){
          valueEl.title = fact.tooltip;
        }

        item.appendChild(factBody);
        detailFacts.appendChild(item);
      }
    }

    clearChildren(detailNotes);

    const rawNotes = Array.isArray(payload?.notes) ? payload.notes : (Array.isArray(ability?.notes) ? ability.notes : []);
    const cardNotes = Array.isArray(payload?.notes) ? [] : parseJsonArrayFromDataset(card.dataset.notes);
    const mergedNotes: string[] = [];
    const noteSet = new Set<string>();
    for (const rawNote of [...rawNotes, ...cardNotes]){
      const normalized = typeof rawNote === 'string' ? rawNote.trim() : '';
      if (!normalized || noteSet.has(normalized)){
        continue;
      }
      noteSet.add(normalized);
      mergedNotes.push(normalized);
    }

    if (mergedNotes.length){
      for (const note of mergedNotes){
        const noteItem = document.createElement('li');
        noteItem.textContent = toSafeText(note);
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

  const handleAbilityInteractions = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const card = target.closest<HTMLElement>('.collection-skill-card');
    if (!card) return;
    const abilityKey = card.dataset.abilityKey ?? null;
    if (!abilityKey) return;
    const detail = abilityDetailCache.get(abilityKey);
    if (!detail) return;

    if (target.closest('.collection-skill-card__upgrade')){
      const upgradeDetail = {
        abilityId: detail.abilityId ?? null,
        ability: detail.ability ?? null,
      };
      card.dispatchEvent(new CustomEvent('collection:request-upgrade', {
        bubbles: true,
        detail: upgradeDetail,
      }));
      return;
    }

    populateSkillDetail(card, detail);
  };

  overlayAbilities.addEventListener('click', handleAbilityInteractions);
  addCleanup(() => overlayAbilities.removeEventListener('click', handleAbilityInteractions));

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

  const tabButtons = new Map<CollectionTabKey, HTMLButtonElement>();

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
    stageStatus.textContent = TAB_HINT_BY_KEY[key] || '';
    if (key === 'skills'){
      overlay.classList.add('is-open');
      if (activeUnitId){
        renderSkillAbilityList(activeUnitId);
      }
    } else {
      overlay.classList.remove('is-open');
      clearSkillDetail();
    }
  };

  const handleTabClick = (key: CollectionTabKey) => {
    setActiveTab(key);
  };

  for (const tab of TAB_DEFINITIONS){
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'collection-tabs__button';
    button.dataset.tabKey = tab.key;

    button.title = tab.label;
    button.setAttribute('aria-label', tab.label);

    const icon = document.createElement('img');
    icon.className = 'collection-tabs__icon';
    icon.src = tab.icon;
    icon.alt = '';
    icon.loading = 'lazy';
    button.appendChild(icon);

    const clickHandler = () => handleTabClick(tab.key);
    button.addEventListener('click', clickHandler);
    addCleanup(() => button.removeEventListener('click', clickHandler));

    tabButtons.set(tab.key, button);
    tabs.appendChild(button);
  }

  layout.appendChild(rosterPanel);
  layout.appendChild(stage);
  layout.appendChild(tabs);

  container.appendChild(layout);

const resolveCurrentCultivation = () => {
    const unitCultivation = activeUnitId ? savedCultivationByUnit[activeUnitId] : null;
    const cultivation = unitCultivation ?? { realm: 1, subRealm: 0 };
    const realm = Number.isFinite(cultivation.realm) ? Number(cultivation.realm) : 1;
    const subRealm = Number.isFinite(cultivation.subRealm) ? Number(cultivation.subRealm) : 0;
    return {
      realm: Math.max(1, Math.floor(realm)),
      subRealm: Math.max(0, Math.floor(subRealm)),
    };
  };

  const refreshWallet = () => {
    for (const currency of currencyCatalog){
      const balance = walletBalances.get(currency.id);
      if (!balance) continue;
      const value = Number(mutablePlayerState.currencies?.[currency.id] ?? 0);
      balance.textContent = `${currencyFormatter.format(Number.isFinite(value) ? value : 0)} ${currency.suffix || currency.id}`;
    }
  };

  const unsubscribeSharedWallet = subscribeSharedCurrencyWallet((walletSnapshot) => {
    mutablePlayerState.currencies = createNormalizedWallet(walletSnapshot);
    refreshWallet();
  });
  addCleanup(unsubscribeSharedWallet);

  let selectedUnitRenderKey = '';
  
  const refreshTuViPanel = () => {
    const { realm, subRealm } = resolveCurrentCultivation();
    const realmEconomy = getCultivationRealmEconomy(realm);
    const realmName = realmEconomy?.name ?? `Cảnh giới ${realm}`;
    const maxSubRealm = realmEconomy?.subRealmCosts.length ?? 0;

    tuViRealm.textContent = `${realmName} (${realm})`;
    tuViSubRealm.textContent = `Tiểu cảnh giới ${subRealm}/${maxSubRealm}`;

    const costInfo = getCultivationCost(realm, subRealm);
    if (!costInfo){
      tuViCost.textContent = 'Chi phí kế tiếp: Đã đạt giới hạn';
      return;
    }

    tuViCost.textContent = costInfo.isBreakthrough
      ? `Đột phá lên ${getCultivationRealmEconomy(costInfo.nextRealm)?.name ?? `Cảnh giới ${costInfo.nextRealm}`}: ${currencyFormatter.format(costInfo.aetherCost)} VNT`
      : `Chi phí kế tiếp: ${currencyFormatter.format(costInfo.aetherCost)} VNT`;
  };

  const renderSkillAbilityList = (unitId: string): void => {
    const selectedEntry = rosterEntries.get(unitId) || null;
    const unit = selectedEntry?.meta || null;
    const skillSet = skillSetCache.has(unitId)
      ? skillSetCache.get(unitId)
      : getSkillSet(unitId);
    if (!skillSetCache.has(unitId)){
      skillSetCache.set(unitId, skillSet);
    }

    overlayTitle.textContent = toSafeText(unit?.name ? `Kĩ năng · ${unit.name}` : 'Kĩ năng');
    overlaySubtitle.textContent = toSafeText(describeUlt(unit));
    const summaryNote = skillSet?.notes?.[0] ?? '';
    overlaySummary.textContent = toSafeText(summaryNote);
    overlaySummary.style.display = summaryNote ? '' : 'none';

    overlayNotesList.replaceChildren();
    const extraNotes = Array.isArray(skillSet?.notes) ? skillSet.notes.slice(1) : [];
    if (extraNotes.length){
      overlayNotesList.style.display = '';
      for (const note of extraNotes){
        if (!note) continue;
        const item = document.createElement('li');
        item.textContent = toSafeText(note);
        overlayNotesList.appendChild(item);
      }
    } else {
      overlayNotesList.style.display = 'none';
    }

    overlayAbilities.replaceChildren();
    abilityDetailCache.clear();
    const cachedCards = abilityRenderCache.get(unitId);
    const cachedDetails = abilityDetailByUnitCache.get(unitId);
    if (cachedDetails){
      for (const [abilityKey, detail] of cachedDetails){
        abilityDetailCache.set(abilityKey, detail);
      }
    }
    if (cachedCards && cachedCards.length){
      for (const cached of cachedCards){
        overlayAbilities.appendChild(cached.cloneNode(true));
      }
      return;
    }

    const abilityEntries: Array<{ entry: AbilityEntry | null | undefined; label: string }> = [];
    if (skillSet?.basic){
      abilityEntries.push({ entry: skillSet.basic, label: ABILITY_TYPE_LABELS.basic });
    }
    if (Array.isArray(skillSet?.skills)){
      skillSet.skills.forEach((skill: AbilityEntry | null | undefined, index: number) => {
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
      const renderedCards: HTMLElement[] = [];
      const detailMap = new Map<string, AbilityDetailRecord>();
      for (let index = 0; index < abilityEntries.length; index += 1){
        const ability = abilityEntries[index];
        if (!ability) continue;
        const abilityEntry = ability.entry;
        const abilityId = abilityEntry?.id ?? abilityEntry?.abilityId ?? null;
        const abilityKey = `${unitId}:${String(abilityId ?? index)}`;
        const normalizedNotes = Array.isArray(abilityEntry?.notes)
          ? abilityEntry.notes
            .map(note => (typeof note === 'string' ? note.trim() : ''))
            .filter(note => note.length > 0)
          : [];
        const facts = collectAbilityFacts(abilityEntry);
        const detailRecord: AbilityDetailRecord = {
          unitId,
          abilityId,
          ability: abilityEntry,
          typeLabel: ability.label,
          facts,
          notes: normalizedNotes,
        };
        abilityDetailCache.set(abilityKey, detailRecord);
        detailMap.set(abilityKey, detailRecord);

        const card = renderAbilityCard(abilityEntry, {
          typeLabel: ability.label,
          unitId,
          abilityKey,
          facts,
          notes: normalizedNotes,
        });
        renderedCards.push(card.cloneNode(true) as HTMLElement);
        overlayAbilities.appendChild(card);
      }
      abilityRenderCache.set(unitId, renderedCards);
      abilityDetailByUnitCache.set(unitId, detailMap);
    } else {
      const placeholder = document.createElement('p');
      placeholder.className = 'collection-skill-card__empty';
      placeholder.textContent = 'Chưa có dữ liệu kỹ năng chi tiết cho nhân vật này.';
      overlayAbilities.appendChild(placeholder);
      abilityRenderCache.set(unitId, [placeholder.cloneNode(true) as HTMLElement]);
      abilityDetailByUnitCache.set(unitId, new Map());
    }
  };

  const handleCultivationUpgrade = () => {
    if (!activeUnitId){
      stageStatus.textContent = 'Hãy chọn một nhân vật trước khi tăng tu vi.';
      return;
    }
    const { realm, subRealm } = resolveCurrentCultivation();
    const upgraded = upgradeCultivation(mutablePlayerState, realm, subRealm);
    if (!upgraded.ok){
      stageStatus.textContent = upgraded.reason === 'insufficient_currency'
        ? 'Không đủ VNT để nâng tiểu cảnh giới.'
        : 'Không thể nâng cấp tu vi ở trạng thái hiện tại.';
      return;
    }
    mutablePlayerState.currencies = { ...(upgraded.playerState.currencies ?? {}) };
    syncSharedCurrencyWallet(mutablePlayerState.currencies);
    const nextCultivation = { ...(upgraded.playerState.cultivation ?? {}) };
    savedCultivationByUnit[activeUnitId] = {
      realm: Number(nextCultivation.realm ?? upgraded.newRealm),
      subRealm: Number(nextCultivation.subRealm ?? upgraded.newSubRealm),
    };
    patchPlayerProfile({ cultivationByUnit: savedCultivationByUnit });
    refreshWallet();
    refreshTuViPanel();
    const upgradedRealmName = getCultivationRealmEconomy(upgraded.newRealm)?.name ?? `Cảnh giới ${upgraded.newRealm}`;
    stageStatus.textContent = `Đã nâng lên ${upgradedRealmName} · Tiểu cảnh giới ${upgraded.newSubRealm}.`;
  };
  tuViUpgrade.addEventListener('click', handleCultivationUpgrade);
  addCleanup(() => tuViUpgrade.removeEventListener('click', handleCultivationUpgrade));

  refreshWallet();
  refreshTuViPanel();

  const selectUnit = (unitId: string | null) => {
    if (!unitId || !rosterEntries.has(unitId)) return;
    const nextRenderKey = `${unitId}::${filterState.activeTab}`;
    if (selectedUnitRenderKey === nextRenderKey){
      refreshTuViPanel();
      return;
    }
    selectedUnitRenderKey = nextRenderKey;
    activeUnitId = unitId;
    updateSelectedUnit(filterState, unitId);
    clearSkillDetail();
    for (const [id, entry] of rosterEntries){
      if (!entry?.button) continue;
      if (id === unitId){
        entry.button.classList.add('is-selected');
      } else {
        entry.button.classList.remove('is-selected');
      }
    }

    const selectedEntry = rosterEntries.get(unitId) || null;
    const unit = selectedEntry?.meta || null;
    stageName.textContent = '';
    stageTags.replaceChildren();

    const art = getUnitArt(unitId);
    if (art?.sprite?.src){
      stageSprite.src = art.sprite.src;
      stageSprite.alt = toSafeText(unit?.name ?? unitId);
      stageSprite.style.opacity = '1';
    } else {
      stageSprite.removeAttribute('src');
      stageSprite.alt = '';
      stageSprite.style.opacity = '0';
    }

    if (filterState.activeTab === 'skills'){
      renderSkillAbilityList(unitId);
    }

    if (filterState.activeTab === 'skills'){
      overlay.classList.add('is-open');
    }
    refreshTuViPanel();
  };

  if (rosterEntries.size > 0){
    const preferredId = Array.from(rosterEntries.keys())[0];
    if (preferredId){
      selectUnit(preferredId);
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

export type { CollectionViewHandle } from './types.ts';