import { getSkillSet } from '../../../data/skills.js';
import { createNumberFormatter } from '../../../utils/format.js';
import {
  normalizeRoster,
  normalizeLineups,
  createCurrencyBalances,
  createFilterOptions,
  formatCurrencyBalance,
  collectAssignedUnitIds,
  evaluatePassive,
  filterRoster,
  type LineupViewState,
  type LineupMessageType,
  type LineupPassive,
  type RosterUnit,
} from './state.ts';
import { bindLineupEvents } from './events.ts';
import type { LineupState } from '@types/ui';

const STYLE_ID = 'lineup-view-style-v1';
const powerFormatter = createNumberFormatter('vi-VN');

type UnknownRecord = Record<string, unknown>;

function ensureStyles(): void{
  if (typeof document === 'undefined') return;
  let style = document.getElementById(STYLE_ID);
  if (!style || style.tagName.toLowerCase() !== 'style'){
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  const css = `
    .app--lineup{padding:32px 16px 72px;}
    .lineup-view{max-width:1320px;margin:0 auto;display:flex;flex-direction:column;gap:28px;color:inherit;--lineup-bench-slot-size:64px;--lineup-bench-slot-gap:12px;}
    .lineup-view__header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px;}
    .lineup-view__actions{display:flex;flex-direction:column;align-items:flex-end;gap:12px;}
    .lineup-view__title-group{display:flex;flex-direction:column;gap:8px;}
    .lineup-view__title{margin:0;font-size:36px;letter-spacing:.08em;text-transform:uppercase;}
    .lineup-view__subtitle{margin:0;color:#9cbcd9;font-size:15px;line-height:1.6;max-width:720px;}
    .lineup-view__message{margin:0;color:#ffd9a1;font-size:13px;line-height:1.6;min-height:20px;}
    .lineup-view__message.is-error{color:#ff9b9b;}
    .lineup-view__back{padding:10px 18px;border-radius:999px;border:1px solid rgba(125,211,252,.32);background:rgba(12,22,32,.82);color:#aee4ff;letter-spacing:.08em;text-transform:uppercase;font-size:12px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;}
    .lineup-view__back:hover{transform:translateY(-2px);border-color:rgba(174,228,255,.52);box-shadow:0 12px 26px rgba(6,12,20,.4);}
    .lineup-view__back:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
    .lineup-view__wallet{display:flex;flex-wrap:wrap;gap:12px;align-items:center;}
    .lineup-wallet__item{padding:8px 12px;border-radius:14px;border:1px solid rgba(125,211,252,.22);background:rgba(12,20,28,.82);display:flex;flex-direction:column;gap:4px;min-width:120px;}
    .lineup-wallet__name{margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .lineup-wallet__balance{margin:0;font-size:15px;color:#e6f2ff;}
    .lineup-view__layout{display:grid;grid-template-columns:minmax(280px,1fr) minmax(0,3fr);gap:24px;align-items:start;}
    .lineup-main-area{display:grid;grid-template-columns:minmax(0,1fr);gap:24px;align-items:start;}
    .lineup-main{display:flex;flex-direction:column;gap:20px;}
    .lineup-slots{border-radius:24px;border:1px solid rgba(125,211,252,.24);background:linear-gradient(160deg,rgba(12,20,30,.92),rgba(8,16,24,.78));padding:20px;display:flex;flex-direction:column;gap:14px;}
    .lineup-slots__title{margin:0;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .lineup-slots__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;}
    .lineup-slot{position:relative;padding:14px;border-radius:16px;border:1px solid rgba(125,211,252,.22);background:rgba(8,16,26,.82);display:flex;flex-direction:column;gap:10px;align-items:flex-start;}
    .lineup-slot__label{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7da0c7;margin:0;}
    .lineup-slot__avatar{width:72px;height:72px;border-radius:18px;background:rgba(24,34,44,.85);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:600;color:#aee4ff;overflow:hidden;position:relative;}
    .lineup-slot__avatar img{width:100%;height:100%;object-fit:cover;}
    .lineup-slot__name{margin:0;font-size:14px;color:#e6f2ff;line-height:1.4;min-height:20px;}
    .lineup-slot__hint{margin:0;font-size:12px;color:#9cbcd9;}
    .lineup-slot__actions{display:flex;gap:8px;flex-wrap:wrap;}
    .lineup-button{padding:8px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.28);background:rgba(12,22,32,.9);color:#aee4ff;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease;}
    .lineup-button:hover{transform:translateY(-1px);border-color:rgba(174,228,255,.5);box-shadow:0 10px 20px rgba(6,12,20,.4);}
    .lineup-button:focus-visible{outline:2px solid rgba(174,228,255,.72);outline-offset:3px;}
    .lineup-slot.is-locked{border-style:dashed;border-color:rgba(125,211,252,.35);background:rgba(12,22,34,.6);}
    .lineup-slot__cost{margin:0;font-size:12px;color:#ffd9a1;letter-spacing:.08em;text-transform:uppercase;}
    .lineup-slot__locked-note{margin:0;font-size:12px;color:#9cbcd9;line-height:1.5;}
    .lineup-bench{display:flex;flex-direction:column;gap:12px;min-height:100%;padding:0;border:none;background:none;}
    .lineup-bench__title{margin:0;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .lineup-bench__content{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,320px);align-items:flex-start;gap:12px;flex:1;padding:0;border:none;background:none;}
    .lineup-bench__grid{display:flex;align-items:flex-start;justify-content:flex-start;gap:var(--lineup-bench-slot-gap);flex:1;min-height:0;align-self:stretch;}
    .lineup-bench__column{display:flex;flex-direction:column;gap:var(--lineup-bench-slot-gap);}
    .lineup-bench__column:first-child{margin-left:0;}
    .lineup-bench__cell{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;background:none;border:none;padding:0;width:var(--lineup-bench-slot-size);}
    .lineup-bench__cell:focus{outline:none;}
    .lineup-bench__cell:focus-visible{outline:none;}
    .lineup-bench__cell:hover .lineup-bench__avatar,
    .lineup-bench__cell:focus-visible .lineup-bench__avatar{transform:translateY(-2px);border-color:rgba(125,211,252,.45);background:rgba(16,28,40,.9);box-shadow:0 12px 28px rgba(6,12,20,.4);}
    .lineup-bench__cell:focus-visible .lineup-bench__avatar{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
    .lineup-bench__cell.is-active .lineup-bench__avatar{border-color:rgba(174,228,255,.6);box-shadow:0 12px 28px rgba(6,12,20,.4);transform:translateY(-2px);}
    .lineup-bench__cell.is-empty{opacity:0.6;}
    .lineup-bench__cell-code{margin:0;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7da0c7;text-align:center;line-height:1.2;font-weight:600;}
    .lineup-bench__avatar{width:48px;height:48px;border-radius:14px;background:rgba(24,34,44,.82);display:flex;align-items:center;justify-content:center;font-size:18px;color:#aee4ff;margin:0;overflow:hidden;border:1px solid rgba(125,211,252,.2);transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease;}
    .lineup-bench__avatar img{width:100%;height:100%;object-fit:cover;}
    .lineup-bench__details{border-radius:18px;border:1px solid rgba(125,211,252,.18);background:rgba(12,22,32,.78);padding:12px 14px;display:flex;flex-direction:column;gap:12px;align-self:flex-start;height:fit-content;overflow:auto;}
    .lineup-bench__details.is-empty{opacity:0.85;}
    .lineup-bench__details-section{display:flex;flex-direction:column;gap:4px;}
    .lineup-bench__details-heading{margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7da0c7;}
    .lineup-bench__details-text{margin:0;font-size:13px;color:#c8deff;line-height:1.5;}
    .lineup-bench__details-list{margin:0;padding-left:18px;font-size:13px;color:#c8deff;line-height:1.5;display:flex;flex-direction:column;gap:2px;}
    .lineup-bench__details-list li{margin:0;}
    .lineup-bench__details-empty{margin:0;font-size:13px;color:#9cbcd9;line-height:1.6;}
    .lineup-leader{border-radius:24px;border:1px solid rgba(255,209,132,.42);background:linear-gradient(150deg,rgba(36,26,12,.88),rgba(18,12,6,.92));padding:14px 16px;display:grid;grid-template-columns:minmax(0,120px) minmax(0,1fr);gap:12px;align-items:start;position:relative;overflow:hidden;}
    .lineup-leader__badge{position:absolute;top:12px;right:-18px;background:rgba(255,209,132,.16);color:#ffd184;padding:4px 26px;border-radius:999px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;transform:rotate(20deg);}
    .lineup-leader__main{display:flex;flex-direction:column;align-items:flex-start;gap:8px;}
    .lineup-leader__avatar{width:80px;height:80px;border-radius:20px;background:rgba(54,36,18,.9);display:flex;align-items:center;justify-content:center;font-size:26px;color:#ffd184;overflow:hidden;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease;border:1px solid rgba(255,209,132,.45);}
    .lineup-leader__avatar:hover{transform:translateY(-2px);box-shadow:0 18px 32px rgba(12,6,0,.5);}
    .lineup-leader__avatar:focus-visible{outline:2px solid rgba(255,209,132,.8);outline-offset:4px;}
    .lineup-leader__name{margin:0;font-size:16px;color:#ffe7b3;}
    .lineup-leader__note{margin:0;font-size:11px;color:#f0d9b2;line-height:1.5;}
    .lineup-passives{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:10px;}
    .lineup-passive{padding:10px;border-radius:14px;border:1px solid rgba(255,209,132,.28);background:rgba(38,26,12,.78);display:flex;flex-direction:column;gap:6px;cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease;color:#ffe7b3;height:100%;}
    .lineup-passive:hover{transform:translateY(-2px);border-color:rgba(255,209,132,.45);background:rgba(46,30,14,.86);}
    .lineup-passive:focus-visible{outline:2px solid rgba(255,209,132,.75);outline-offset:3px;}
    .lineup-passive__title{margin:0;font-size:13px;letter-spacing:.04em;}
    .lineup-passive__condition{margin:0;font-size:11px;color:#f3d2a2;}
    .lineup-passive.is-active{box-shadow:0 16px 34px rgba(255,184,108,.45);border-color:rgba(255,209,132,.72);background:rgba(56,36,18,.92);}
    .lineup-passive.is-empty{opacity:0.6;cursor:default;}
    .lineup-passive.is-empty:hover{transform:none;}
    .lineup-passive.is-empty:focus-visible{outline:none;}
    .lineup-roster{border-radius:28px;border:1px solid rgba(125,211,252,.22);background:rgba(8,16,24,.92);padding:20px;display:flex;flex-direction:column;gap:12px;}
    .lineup-roster__filters{display:flex;flex-wrap:wrap;gap:10px;}
    .lineup-roster__filter{padding:8px 14px;border-radius:999px;border:1px solid rgba(125,211,252,.24);background:rgba(12,22,32,.82);color:#aee4ff;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease;}
    .lineup-roster__filter:hover{transform:translateY(-1px);border-color:rgba(125,211,252,.42);}
    .lineup-roster__filter:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
    .lineup-roster__filter.is-active{border-color:rgba(174,228,255,.6);background:rgba(18,30,44,.94);box-shadow:0 12px 28px rgba(6,12,20,.4);}
    .lineup-roster__list{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;list-style:none;margin:0;padding:0;}
    .lineup-roster__entry{padding:12px;border-radius:16px;border:1px solid rgba(125,211,252,.18);background:rgba(12,22,32,.82);display:flex;align-items:center;gap:12px;cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease;}
    .lineup-roster__entry:hover{transform:translateY(-2px);border-color:rgba(125,211,252,.38);background:rgba(16,28,40,.9);}
    .lineup-roster__entry:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
    .lineup-roster__entry.is-selected{border-color:rgba(174,228,255,.6);background:rgba(18,30,44,.95);box-shadow:0 14px 30px rgba(6,12,20,.45);}
    .lineup-roster__entry.is-unavailable{opacity:0.55;}
    .lineup-roster__avatar{width:54px;height:54px;border-radius:16px;background:rgba(24,34,44,.82);display:flex;align-items:center;justify-content:center;color:#aee4ff;font-size:20px;overflow:hidden;}
    .lineup-roster__avatar img{width:100%;height:100%;object-fit:cover;}
    .lineup-roster__meta{display:flex;flex-direction:column;gap:4px;}
    .lineup-roster__name{margin:0;font-size:14px;color:#e6f2ff;}
    .lineup-roster__tag{margin:0;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .lineup-roster__extra{margin:0;font-size:12px;color:#9cbcd9;}
    .lineup-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(3,8,14,.66);backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:opacity .2s ease;z-index:80;}
    .lineup-overlay.is-open{opacity:1;pointer-events:auto;}
    .lineup-overlay__panel{max-width:540px;width:100%;background:rgba(8,16,24,.96);border:1px solid rgba(125,211,252,.35);border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:14px;color:#e6f2ff;box-shadow:0 32px 64px rgba(3,8,16,.75);}
    .lineup-overlay__close{align-self:flex-end;padding:8px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.3);background:rgba(12,22,32,.86);color:#aee4ff;font-size:12px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease;}
    .lineup-overlay__close:hover{transform:translateY(-1px);border-color:rgba(174,228,255,.5);}
    .lineup-overlay__close:focus-visible{outline:2px solid rgba(174,228,255,.7);outline-offset:3px;}
    .lineup-overlay__title{margin:0;font-size:20px;letter-spacing:.04em;}
    .lineup-overlay__subtitle{margin:0;font-size:13px;color:#9cbcd9;line-height:1.6;}
    .lineup-overlay__body{display:flex;flex-direction:column;gap:12px;}
    .lineup-overlay__list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;max-height:360px;overflow:auto;}
    .lineup-overlay__option{padding:10px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.2);background:rgba(12,22,32,.82);display:flex;align-items:center;gap:10px;cursor:pointer;transition:transform .16s ease,border-color .16s ease;}
    .lineup-overlay__option:hover{transform:translateY(-1px);border-color:rgba(125,211,252,.42);background:rgba(16,28,40,.9);}
    .lineup-overlay__option:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
    .lineup-overlay__option-avatar{width:48px;height:48px;border-radius:14px;background:rgba(24,34,44,.82);display:flex;align-items:center;justify-content:center;color:#aee4ff;font-size:18px;overflow:hidden;}
    .lineup-overlay__option-name{margin:0;font-size:14px;color:#e6f2ff;}
    .lineup-overlay__option-meta{margin:0;font-size:12px;color:#9cbcd9;}
    @media(max-width:1080px){.lineup-view__layout{grid-template-columns:1fr;}.lineup-main-area{grid-template-columns:1fr;}.lineup-bench__content{grid-template-columns:1fr;}.lineup-leader{grid-template-columns:1fr;}.lineup-leader__badge{display:none;}}
    @media(max-width:720px){.lineup-view__title{font-size:30px;}.lineup-view__header{flex-direction:column;align-items:flex-start;}.lineup-main-area{gap:18px;}.lineup-bench__content{grid-template-columns:1fr;}.lineup-bench__grid{flex-wrap:wrap;}.lineup-slot__avatar{width:64px;height:64px;}.lineup-roster__list{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));}}
  `;

  if (style.textContent !== css){
    style.textContent = css;
  }
}

function createOverlay(): HTMLDivElement{
  const overlay = document.createElement('div');
  overlay.className = 'lineup-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="lineup-overlay__panel" role="document">
      <button type="button" class="lineup-overlay__close" aria-label="Đóng">Đóng</button>
      <div class="lineup-overlay__body"></div>
    </div>
  `;
  return overlay;
}

function sanitizeCodeToken(token: string): string{
  if (!token){
    return '';
  }
  return token.replace(/[^A-Za-z0-9]/g, '');
}

function normalizeForCode(value: string): string{
  const trimmed = value.trim();
  if (!trimmed){
    return '';
  }
  return trimmed.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

function extractCodeFromNormalized(normalized: string): string{
  if (!normalized){
    return '';
  }
  const tokens = normalized.split(/[\s\-_/]+/).filter(Boolean);
  if (tokens.length >= 2){
    const firstToken = sanitizeCodeToken(tokens[0]);
    const lastToken = sanitizeCodeToken(tokens[tokens.length - 1]);
    let letters = '';
    if (firstToken){
      letters += firstToken[0];
    }
    if (lastToken){
      letters += lastToken[0];
    }
    if (tokens.length > 2 && letters.length < 3){
      const extraToken = sanitizeCodeToken(tokens[1]);
      if (extraToken){
        letters += extraToken[0];
      }
    }
    letters = letters.slice(0, 3);
    if (letters){
      return letters;
    }
  }
  const cleaned = sanitizeCodeToken(normalized);
  return cleaned.slice(0, 3);
}

function getUnitCode(unit: RosterUnit | null | undefined, fallbackLabel: string): string{
  const sourceName = unit?.name && unit.name.trim()
    ? unit.name
    : (typeof fallbackLabel === 'string' ? fallbackLabel : '');
  const normalizedName = normalizeForCode(sourceName);
  let code = extractCodeFromNormalized(normalizedName);
  if (!code){
    const normalizedId = normalizeForCode(unit?.id != null ? String(unit.id) : '');
    code = extractCodeFromNormalized(normalizedId);
  }
  return code ? code.toLocaleUpperCase('vi-VN') : '';
}

function getInitials(name: string): string{
  if (!name){
    return '';
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1){
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderAvatar(container: HTMLElement, avatarUrl: string | null, name: string): void{
  container.innerHTML = '';
  if (avatarUrl){
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = name || '';
    container.appendChild(img);
  } else {
    container.textContent = getInitials(name || '');
  }
}

function formatUnitPower(power: number | null): string{
  return powerFormatter.format(Number.isFinite(power) ? Number(power) : 0);
}

export interface LineupViewOptions {
  root: HTMLElement;
  shell?: { enterScreen?: (screenId: string, params?: unknown) => void } | null;
  definition?: { label?: string; title?: string; description?: string } | null;
  description?: string | null;
  lineups?: unknown;
  roster?: unknown;
  playerState?: UnknownRecord | null;
  currencies?: unknown;
}

export interface LineupViewHandle {
  destroy(): void;
}

export function renderLineupView(options: LineupViewOptions): LineupViewHandle{
  const {
    root,
    shell = null,
    definition = null,
    description = null,
    lineups = null,
    roster = null,
    playerState = null,
    currencies = null,
  } = options;

  if (!root){
    throw new Error('renderLineupView cần một phần tử root hợp lệ.');
  }

  ensureStyles();

  const normalizedRoster = normalizeRoster(roster);
  const normalizedLineups = normalizeLineups(lineups, normalizedRoster);
  const rosterLookup = new Map<string, RosterUnit>(normalizedRoster.map(unit => [unit.id, unit] as const));

  const lineupState = new Map<string, LineupState>();
  normalizedLineups.forEach(lineup => {
    lineupState.set(lineup.id, {
      ...lineup,
      slots: lineup.slots.map(slot => ({
        ...slot,
        unlockCost: slot.unlockCost ? { ...slot.unlockCost } : null,
        meta: slot.meta ? { ...slot.meta } : null,
      })),
      bench: lineup.bench.map(cell => ({
        ...cell,
        meta: cell.meta ? { ...cell.meta } : null,
      })),
      passives: lineup.passives.map(passive => ({ ...passive })),
      leaderId: lineup.leaderId || null,
    });
  });

  const playerCurrencySource = (playerState as { currencies?: unknown } | null)?.currencies ?? null;
  const currencyBalances = createCurrencyBalances(playerCurrencySource, currencies);

  const state: LineupViewState = {
    selectedLineupId: normalizedLineups[0]?.id ?? null,
    selectedUnitId: null,
    activeBenchIndex: null,
    filter: { type: 'all', value: null },
    message: '',
    messageType: 'info',
    currencyBalances,
    lineupState,
    roster: normalizedRoster,
    rosterLookup,
    filterOptions: createFilterOptions(normalizedRoster),
  };

  root.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'lineup-view';
  root.appendChild(container);

  const header = document.createElement('div');
  header.className = 'lineup-view__header';
  const titleGroup = document.createElement('div');
  titleGroup.className = 'lineup-view__title-group';
  const titleEl = document.createElement('h1');
  titleEl.className = 'lineup-view__title';
  titleEl.textContent = definition?.label || definition?.title || 'Đội hình';
  titleGroup.appendChild(titleEl);
  if (description){
    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'lineup-view__subtitle';
    subtitleEl.textContent = description;
    titleGroup.appendChild(subtitleEl);
  }
  const messageEl = document.createElement('p');
  messageEl.className = 'lineup-view__message';
  titleGroup.appendChild(messageEl);
  header.appendChild(titleGroup);

  const actions = document.createElement('div');
  actions.className = 'lineup-view__actions';
  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'lineup-view__back';
  backButton.textContent = 'Quay lại menu chính';
  backButton.setAttribute('aria-label', 'Quay lại Main Menu');
  actions.appendChild(backButton);
  const walletEl = document.createElement('div');
  walletEl.className = 'lineup-view__wallet';
  actions.appendChild(walletEl);
  header.appendChild(actions);
  container.appendChild(header);

  const layout = document.createElement('div');
  layout.className = 'lineup-view__layout';
  container.appendChild(layout);

  const leaderSection = document.createElement('section');
  leaderSection.className = 'lineup-leader';
  const leaderBadge = document.createElement('span');
  leaderBadge.className = 'lineup-leader__badge';
  leaderBadge.textContent = 'Leader';
  leaderSection.appendChild(leaderBadge);
  const leaderMain = document.createElement('div');
  leaderMain.className = 'lineup-leader__main';
  const leaderAvatar = document.createElement('button');
  leaderAvatar.type = 'button';
  leaderAvatar.className = 'lineup-leader__avatar';
  leaderAvatar.setAttribute('aria-label', 'Chọn leader');
  leaderMain.appendChild(leaderAvatar);
  const leaderName = document.createElement('p');
  leaderName.className = 'lineup-leader__name';
  leaderMain.appendChild(leaderName);
  const leaderNote = document.createElement('p');
  leaderNote.className = 'lineup-leader__note';
  leaderNote.textContent = 'Leader cung cấp buff đội hình và quyết định lượt hành động đầu tiên.';
  leaderMain.appendChild(leaderNote);
  leaderSection.appendChild(leaderMain);
  const passiveGrid = document.createElement('div');
  passiveGrid.className = 'lineup-passives';
  leaderSection.appendChild(passiveGrid);
  layout.appendChild(leaderSection);

  const mainArea = document.createElement('div');
  mainArea.className = 'lineup-main-area';
  layout.appendChild(mainArea);

  const mainColumn = document.createElement('div');
  mainColumn.className = 'lineup-main';
  mainArea.appendChild(mainColumn);

  const benchSection = document.createElement('section');
  benchSection.className = 'lineup-bench';
  const benchTitle = document.createElement('p');
  benchTitle.className = 'lineup-bench__title';
  benchTitle.textContent = 'Đội hình';
  benchSection.appendChild(benchTitle);
  const benchContent = document.createElement('div');
  benchContent.className = 'lineup-bench__content';
  benchSection.appendChild(benchContent);
  const benchGrid = document.createElement('div');
  benchGrid.className = 'lineup-bench__grid';
  benchContent.appendChild(benchGrid);
  const benchDetails = document.createElement('aside');
  benchDetails.className = 'lineup-bench__details is-empty';
  benchContent.appendChild(benchDetails);

  function syncBenchDetailsHeight(): void{
    if (!benchDetails || !leaderSection || typeof leaderSection.getBoundingClientRect !== 'function'){
      benchDetails.style.maxHeight = '';
      return;
    }
    const rect = leaderSection.getBoundingClientRect();
    if (rect && Number.isFinite(rect.height)){
      benchDetails.style.maxHeight = `${rect.height}px`;
    } else {
      benchDetails.style.maxHeight = '';
    }
  }
  mainArea.appendChild(benchSection);

  const rosterSection = document.createElement('section');
  rosterSection.className = 'lineup-roster';
  const rosterFilters = document.createElement('div');
  rosterFilters.className = 'lineup-roster__filters';
  rosterSection.appendChild(rosterFilters);
  const rosterList = document.createElement('div');
  rosterList.className = 'lineup-roster__list';
  rosterSection.appendChild(rosterList);
  container.appendChild(rosterSection);

  const passiveOverlay = createOverlay();
  passiveOverlay.classList.add('lineup-overlay--passive');
  const passiveOverlayBody = passiveOverlay.querySelector<HTMLDivElement>('.lineup-overlay__body');
  const passiveClose = passiveOverlay.querySelector<HTMLButtonElement>('.lineup-overlay__close');
  if (!passiveOverlayBody || !passiveClose){
    throw new Error('Không thể khởi tạo overlay passive.');
  }
  passiveOverlayBody.innerHTML = '';
  if (document.body){
    document.body.appendChild(passiveOverlay);
  } else {
    root.appendChild(passiveOverlay);
  }

  const leaderOverlay = createOverlay();
  leaderOverlay.classList.add('lineup-overlay--leader');
  const leaderOverlayBody = leaderOverlay.querySelector<HTMLDivElement>('.lineup-overlay__body');
  const leaderClose = leaderOverlay.querySelector<HTMLButtonElement>('.lineup-overlay__close');
  if (!leaderOverlayBody || !leaderClose){
    throw new Error('Không thể khởi tạo overlay leader.');
  }
  leaderOverlayBody.innerHTML = '';
  if (document.body){
    document.body.appendChild(leaderOverlay);
  } else {
    root.appendChild(leaderOverlay);
  }

  let activeOverlay: HTMLElement | null = null;

  function closeOverlay(target: HTMLElement | null): void{
    if (!target) return;
    target.classList.remove('is-open');
    if (activeOverlay === target){
      activeOverlay = null;
    }
  }

  function openOverlay(target: HTMLElement | null): void{{
    if (!target) return;
    target.classList.add('is-open');
    activeOverlay = target;
  }

  function getSelectedLineup(): LineupState | null{
    if (!state.selectedLineupId) return null;
    return state.lineupState.get(state.selectedLineupId) ?? null;
  }

  function setMessage(text: string, type: LineupMessageType = 'info'): void{
    state.message = text || '';
    state.messageType = type;
    messageEl.textContent = text || '';
    if (type === 'error'){
      messageEl.classList.add('is-error');
    } else {
      messageEl.classList.remove('is-error');
    }
  }

  function refreshWallet(): void{
    walletEl.innerHTML = '';
    for (const [currencyId, balance] of state.currencyBalances.entries()){
      const item = document.createElement('div');
      item.className = 'lineup-wallet__item';
      const nameEl = document.createElement('p');
      nameEl.className = 'lineup-wallet__name';
      nameEl.textContent = currencyId;
      const value = document.createElement('p');
      value.className = 'lineup-wallet__balance';
      value.textContent = formatCurrencyBalance(balance, currencyId);
      item.appendChild(nameEl);
      item.appendChild(value);
      walletEl.appendChild(item);
    }
  }

  function renderBenchDetails(): void{
    benchDetails.innerHTML = '';
    const lineup = getSelectedLineup();
    if (!lineup){
      benchDetails.classList.add('is-empty');
      const empty = document.createElement('p');
      empty.className = 'lineup-bench__details-empty';
      empty.textContent = 'Chưa có đội hình để hiển thị thông tin.';
      benchDetails.appendChild(empty);
      syncBenchDetailsHeight();
      return;
    }

    const index = Number.isFinite(state.activeBenchIndex) ? state.activeBenchIndex : null;
    if (index == null){
      benchDetails.classList.add('is-empty');
      const hint = document.createElement('p');
      hint.className = 'lineup-bench__details-empty';
      hint.textContent = 'Chọn một ô dự bị để xem mô tả kỹ năng.';
      benchDetails.appendChild(hint);
      syncBenchDetailsHeight();
      return;
    }

    const cell = lineup.bench[index];
    if (!cell){
      benchDetails.classList.add('is-empty');
      const missing = document.createElement('p');
      missing.className = 'lineup-bench__details-empty';
      missing.textContent = 'Không tìm thấy ô dự bị tương ứng.';
      benchDetails.appendChild(missing);
      syncBenchDetailsHeight();
      return;
    }

    const unit = cell.unitId ? rosterLookup.get(cell.unitId) : null;
    if (!unit){
      benchDetails.classList.add('is-empty');
      const empty = document.createElement('p');
      empty.className = 'lineup-bench__details-empty';
      empty.textContent = cell.label
        ? `Ô dự bị được ghi chú "${cell.label}".`
        : 'Ô dự bị hiện đang trống.';
      benchDetails.appendChild(empty);
      syncBenchDetailsHeight();
      return;
    }

    benchDetails.classList.remove('is-empty');

    const kit = (unit.raw as { kit?: unknown } | null)?.kit ?? null;
    const skillSet = unit.id ? getSkillSet(unit.id) : null;

    const skills = Array.isArray((kit as { skills?: unknown[] } | null)?.skills)
      ? ((kit as { skills?: unknown[] }).skills ?? [])
          .filter(skill => {
            const skillRecord = skill as { name?: string; key?: string } | null;
            const skillName = typeof skillRecord?.name === 'string' ? skillRecord.name.trim() : '';
            const skillKey = typeof skillRecord?.key === 'string' ? skillRecord.key.trim() : '';
            return skillName !== 'Đánh Thường' && skillKey !== 'Đánh Thường';
          })
          .slice(0, 3)
      : [];

    const kitUlt = (kit as { ult?: { name?: string; id?: string } } | null)?.ult ?? null;
    const skillSetUlt = (skillSet as { ult?: { name?: string; id?: string } } | null)?.ult ?? null;
    const hasUlt = Boolean(kitUlt || skillSetUlt);
    const ultName = hasUlt
      ? (kitUlt?.name || skillSetUlt?.name || kitUlt?.id || 'Chưa đặt tên')
      : null;

    if (!skills.length && !hasUlt){
      const fallback = document.createElement('p');
      fallback.className = 'lineup-bench__details-empty';
      fallback.textContent = 'Chưa có dữ liệu chi tiết cho nhân vật này.';
      benchDetails.appendChild(fallback);
    } else {
      if (skills.length){
        const skillSection = document.createElement('div');
        skillSection.className = 'lineup-bench__details-section';
        const heading = document.createElement('p');
        heading.className = 'lineup-bench__details-heading';
        heading.textContent = 'Kỹ năng';
        skillSection.appendChild(heading);
        const list = document.createElement('ul');
        list.className = 'lineup-bench__details-list';
        skills.forEach((skill, idx) => {
          const item = document.createElement('li');
          const skillRecord = skill as { name?: string; key?: string } | null;
          const nameText = skillRecord?.name || skillRecord?.key || `Kỹ năng #${idx + 1}`;
          item.textContent = nameText;
          list.appendChild(item);
        });
        skillSection.appendChild(list);
        benchDetails.appendChild(skillSection);
      }

      if (hasUlt && ultName){
        const ultSection = document.createElement('div');
        ultSection.className = 'lineup-bench__details-section';
        const heading = document.createElement('p');
        heading.className = 'lineup-bench__details-heading';
        heading.textContent = 'Tuyệt kỹ';
        ultSection.appendChild(heading);
        const text = document.createElement('p');
        text.className = 'lineup-bench__details-text';
        text.textContent = ultName;
        ultSection.appendChild(text);
        benchDetails.appendChild(ultSection);
      }
    }

    syncBenchDetailsHeight();
  }

  function updateActiveBenchHighlight(): void{
    const cells = benchGrid.querySelectorAll<HTMLElement>('.lineup-bench__cell');
    cells.forEach(cell => {
      const idx = Number(cell.dataset.benchIndex);
      if (Number.isFinite(idx) && idx === state.activeBenchIndex){
        cell.classList.add('is-active');
      } else {
        cell.classList.remove('is-active');
      }
    });
  }

  function renderBench(): void{
    const lineup = getSelectedLineup();
    benchGrid.innerHTML = '';
    if (!lineup){
      state.activeBenchIndex = null;
      renderBenchDetails();
      return;
    }

    if (!Number.isInteger(state.activeBenchIndex) || !lineup.bench[state.activeBenchIndex ?? -1]){
      state.activeBenchIndex = null;
    }

    const columnCount = 5;
    const columnEls = Array.from({ length: columnCount }, () => {
      const columnEl = document.createElement('div');
      columnEl.className = 'lineup-bench__column';
      benchGrid.appendChild(columnEl);
      return columnEl;
    });

    lineup.bench.forEach(cell => {
      const cellEl = document.createElement('button');
      cellEl.type = 'button';
      cellEl.className = 'lineup-bench__cell';
      cellEl.dataset.benchIndex = String(cell.index);
      const unit = cell.unitId ? rosterLookup.get(cell.unitId) : null;
      const hasContent = Boolean(cell.unitId || cell.label);
      if (!hasContent){
        cellEl.classList.add('is-empty');
      }
      const displayName = unit?.name || cell.label || '';
      let ariaLabel = `Ô dự bị ${cell.index + 1}`;
      if (displayName){
        ariaLabel += `: ${displayName}`;
        if (cell.unitId){
          ariaLabel += '. Giữ Alt và click để gỡ.';
        }
      }
      cellEl.setAttribute('aria-label', ariaLabel);
      if (displayName){
        cellEl.title = cell.unitId
          ? `${displayName} — giữ Alt và click để gỡ.`
          : displayName;
      } else {
        cellEl.removeAttribute('title');
      }
      const codeText = (!cell.unitId && hasContent)
        ? getUnitCode(unit, cell.label || '')
        : '';
      const avatarEl = document.createElement('div');
      avatarEl.className = 'lineup-bench__avatar';
      const avatarSource = unit?.avatar || (cell.meta as { avatar?: string } | null)?.avatar || null;
      const avatarLabel = unit?.name || cell.label || '';
      renderAvatar(avatarEl, avatarSource, avatarLabel);
      if (codeText){
        const codeEl = document.createElement('span');
        codeEl.className = 'lineup-bench__cell-code';
        codeEl.textContent = codeText;
        cellEl.appendChild(codeEl);
      }
      cellEl.appendChild(avatarEl);
      if (state.activeBenchIndex === cell.index){
        cellEl.classList.add('is-active');
      }
      const columnIndex = cell.index % columnCount;
      const targetColumn = columnEls[columnIndex] || columnEls[0];
      targetColumn.appendChild(cellEl);
    });

    updateActiveBenchHighlight();
    renderBenchDetails();
  }

  function renderLeader(): void{
    const lineup = getSelectedLineup();
    if (!lineup){
      renderAvatar(leaderAvatar, null, '');
      leaderName.textContent = 'Chưa chọn leader';
      syncBenchDetailsHeight();
      return;
    }
    if (lineup.leaderId){
      const unit = rosterLookup.get(lineup.leaderId);
      renderAvatar(leaderAvatar, unit?.avatar || null, unit?.name || '');
      leaderName.textContent = unit?.name || 'Leader';
    } else {
      renderAvatar(leaderAvatar, null, '');
      leaderName.textContent = 'Chưa chọn leader';
    }
    syncBenchDetailsHeight();
  }

  function renderPassives(){
    const lineup = getSelectedLineup();
    passiveGrid.innerHTML = '';
    if (!lineup){
      return;
    }
    const assignedIds = collectAssignedUnitIds(lineup);
    lineup.passives.forEach(passive => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lineup-passive';
      btn.dataset.passiveIndex = String(passive.index);
      btn.setAttribute('aria-label', passive.isEmpty ? 'Ô passive trống' : `Xem passive ${passive.name}`);
      if (passive.isEmpty){
        btn.classList.add('is-empty');
        btn.disabled = true;
      }
      if (evaluatePassive(passive, assignedIds, rosterLookup)){
        btn.classList.add('is-active');
      }
      const title = document.createElement('p');
      title.className = 'lineup-passive__title';
      title.textContent = passive.name;
      btn.appendChild(title);
      if (!passive.isEmpty){
        const condition = document.createElement('p');
        condition.className = 'lineup-passive__condition';
        condition.textContent = passive.requirement || 'Chạm để xem chi tiết.';
        btn.appendChild(condition);
      }
      passiveGrid.appendChild(btn);
    });
  }

  function renderFilters(): void{
    rosterFilters.innerHTML = '';
    const filters = [
      { type: 'all' as const, value: null, label: 'Tất cả' },
      ...state.filterOptions.classes.map(value => ({ type: 'class' as const, value, label: value })),
      ...state.filterOptions.ranks.map(value => ({ type: 'rank' as const, value, label: value })),
    ];
    filters.forEach(filter => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lineup-roster__filter';
      button.dataset.filterType = filter.type;
      if (filter.value != null){
        button.dataset.filterValue = filter.value;
      }
      button.textContent = filter.label;
      if (state.filter.type === filter.type && (state.filter.value || null) === (filter.value || null)){
        button.classList.add('is-active');
      }
      rosterFilters.appendChild(button);
    });
  }

  function renderRoster(): void{
    rosterList.innerHTML = '';
    const lineup = getSelectedLineup();
    const filtered = filterRoster(state.roster, state.filter);
    filtered.forEach(unit => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lineup-roster__entry';
      button.dataset.unitId = unit.id;
      button.setAttribute('aria-label', `Chọn ${unit.name}`);
      if (state.selectedUnitId === unit.id){
        button.classList.add('is-selected');
      }
      if (lineup && (lineup.leaderId === unit.id || lineup.slots.some(slot => slot.unitId === unit.id) || lineup.bench.some(cell => cell.unitId === unit.id)) && state.selectedUnitId !== unit.id){
        button.classList.add('is-unavailable');
      }
      const avatar = document.createElement('div');
      avatar.className = 'lineup-roster__avatar';
      renderAvatar(avatar, unit.avatar || null, unit.name);
      button.appendChild(avatar);
      const meta = document.createElement('div');
      meta.className = 'lineup-roster__meta';
      const nameEl = document.createElement('p');
      nameEl.className = 'lineup-roster__name';
      nameEl.textContent = unit.name;
      meta.appendChild(nameEl);
      if (unit.role || unit.rank){
        const tag = document.createElement('p');
        tag.className = 'lineup-roster__tag';
        tag.textContent = [unit.role, unit.rank].filter(Boolean).join(' · ');
        meta.appendChild(tag);
      }
      if (unit.power != null){
        const extra = document.createElement('p');
        extra.className = 'lineup-roster__extra';
        extra.textContent = `Chiến lực ${formatUnitPower(unit.power)}`;
        meta.appendChild(extra);
      }
      button.appendChild(meta);
      rosterList.appendChild(button);
    });
  }

  function openPassiveDetails(passive: LineupPassive): void{
    passiveOverlayBody.innerHTML = '';
    const title = document.createElement('h3');
    title.className = 'lineup-overlay__title';
    title.textContent = passive.name;
    passiveOverlayBody.appendChild(title);
    if (passive.requirement){
      const subtitle = document.createElement('p');
      subtitle.className = 'lineup-overlay__subtitle';
      subtitle.textContent = passive.requirement;
      passiveOverlayBody.appendChild(subtitle);
    }
    if (passive.description){
      const descriptionEl = document.createElement('p');
      descriptionEl.className = 'lineup-overlay__subtitle';
      descriptionEl.textContent = passive.description;
      passiveOverlayBody.appendChild(descriptionEl);
    }
    if (passive.requiredUnitIds.length){
      const list = document.createElement('ul');
      list.className = 'lineup-overlay__list';
      passive.requiredUnitIds.forEach(unitId => {
        const item = document.createElement('li');
        const unit = rosterLookup.get(unitId);
        item.textContent = unit?.name || unitId;
        list.appendChild(item);
      });
      passiveOverlayBody.appendChild(list);
    }
    openOverlay(passiveOverlay);
    passiveClose.focus();
  }

  function openLeaderPicker(): void{
    const lineup = getSelectedLineup();
    if (!lineup) return;
    leaderOverlayBody.innerHTML = '';
    const title = document.createElement('h3');
    title.className = 'lineup-overlay__title';
    title.textContent = 'Chọn leader';
    leaderOverlayBody.appendChild(title);
    const subtitle = document.createElement('p');
    subtitle.className = 'lineup-overlay__subtitle';
    subtitle.textContent = 'Chỉ định leader sẽ kích hoạt buff đội hình và ưu tiên lượt đánh đầu.';
    leaderOverlayBody.appendChild(subtitle);
    const list = document.createElement('div');
    list.className = 'lineup-overlay__list';

    const clearOption = document.createElement('button');
    clearOption.type = 'button';
    clearOption.className = 'lineup-overlay__option';
    clearOption.textContent = 'Bỏ chọn leader';
    clearOption.dataset.unitId = '';
    list.appendChild(clearOption);

    state.roster.forEach(unit => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'lineup-overlay__option';
      option.dataset.unitId = unit.id;
      const avatar = document.createElement('div');
      avatar.className = 'lineup-overlay__option-avatar';
      renderAvatar(avatar, unit.avatar || null, unit.name);
      option.appendChild(avatar);
      const text = document.createElement('div');
      const nameEl = document.createElement('p');
      nameEl.className = 'lineup-overlay__option-name';
      nameEl.textContent = unit.name;
      text.appendChild(nameEl);
      const meta = document.createElement('p');
      meta.className = 'lineup-overlay__option-meta';
      meta.textContent = [unit.role, unit.rank].filter(Boolean).join(' · ');
      text.appendChild(meta);
      option.appendChild(text);
      if (lineup.leaderId === unit.id){
        option.classList.add('is-active');
      }
      list.appendChild(option);
    });

    leaderOverlayBody.appendChild(list);
    openOverlay(leaderOverlay);
    leaderClose.focus();
  }

const cleanup: Array<() => void> = [];

const eventCleanup = bindLineupEvents({
    shell,
    state,
    elements: {
      backButton,
      benchGrid,
      benchDetails,
      passiveGrid,
      rosterFilters,
      rosterList,
      leaderAvatar,
      leaderSection,
      passiveOverlay,
      passiveClose,
      leaderOverlay,
      leaderOverlayBody,
      leaderClose,
    },
    overlays: {
      getActive: () => activeOverlay,
      close: overlay => closeOverlay(overlay),
    },
    helpers: {
      getSelectedLineup,
      setMessage,
      renderBench,
      renderBenchDetails,
      renderLeader,
      renderPassives,
      renderFilters,
      renderRoster,
      updateActiveBenchHighlight,
      syncBenchDetailsHeight,
      openPassiveDetails,
      openLeaderPicker,
    },
    rosterLookup,
  });
  cleanup.push(...eventCleanup);

  refreshWallet();
  renderBench();
  renderLeader();
  renderPassives();
  renderFilters();
  renderRoster();
  setMessage('Chọn nhân vật từ danh sách để xây dựng đội hình.');

  cleanup.push(() => passiveOverlay.remove());
  cleanup.push(() => leaderOverlay.remove());

  return {
    destroy(){
      while (cleanup.length > 0){
        const fn = cleanup.pop();
        if (!fn) continue;
        try {
        fn();
        } catch (error){
          console.error('[lineup] destroy error', error);
        }
      }
    },
  };
}