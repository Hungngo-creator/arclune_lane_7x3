//home (termux)/arclune_lane_7x3/src/screens/lineup/view/render.ts

import { getSkillSet } from '../../../data/skills.ts';
import { createNumberFormatter } from '../../../utils/format.ts';
import { normalizeUnitId } from '../../../utils/unit-id.ts';
import { normalizeElementKey } from '../../../utils/domain-normalization.ts';
import { patchPlayerProfile } from '../../../utils/player-profile.ts';
import {
  createNormalizedWallet,
  getCurrencyOrder,
  getSharedCurrencyWallet,
  subscribeSharedCurrencyWallet,
  syncSharedCurrencyWallet,
  type CurrencyWallet,
} from '../../../utils/currency.ts';
import { assertElement, ensureStyleTag, mountSection } from '../../../ui/dom.ts';
import { normalizeCurrencyBalances } from '@shared-types/currency';
import { mountRarityAura, updateRarity, unmountRarity } from '../../../ui/rarity/rarity.ts';
import {
  normalizeRoster,
  normalizeLineups,
  createCurrencyBalances,
  createFilterOptions,
  formatCurrencyBalance,
  collectAssignedUnitIds,
  collectAssignedUnitTags,
  evaluatePassive,
  filterRoster,
  getUnitRarity,
  LINEUP_ALLOWED_LEADER_IDS,
} from './state.ts';
import type {
  LineupViewState,
  LineupMessageType,
  LineupPassive,
  RosterUnit,
} from './state.ts';
import { bindLineupEvents } from './events.ts';
import type { LineupState } from '@shared-types/ui';
import type { LineupCurrencies } from '@shared-types/currency';
import type { UnknownRecord } from '@shared-types/common';
import type { LineupDefinition, RosterEntryLite } from '@shared-types/lineup';

const STYLE_ID = 'lineup-view-style-v1';
const powerFormatter = createNumberFormatter('vi-VN');

const ELEMENT_ICON: Readonly<Record<string, string>> = {
  fire: '🔥', metal: '⚙️', wood: '🌿', earth: '⛰️', lightning: '⚡', blood: '🩸', water: '💧',
  light: '✨', dark: '🌑', wind: '🌪️', neutral: '⚪',
};

function renderRoleElementIcons(unit: RosterUnit): string {
  const raw = unit.raw as Record<string, unknown> | null;
  const element = normalizeElementKey(raw?.base_element ?? raw?.element) ?? 'neutral';
  const classIcon = unit.role ? '🏷️' : '';
  const elementIcon = ELEMENT_ICON[element] ?? '⚪';
  return [classIcon, elementIcon].filter(Boolean).join(' ');
}

function ensureStyles(): void{
  const css = `
    .app--lineup{padding:32px 16px 72px;}
    .lineup-view{max-width:1320px;margin:0 auto;display:flex;flex-direction:column;gap:28px;color:inherit;}
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
    .lineup-grid{border-radius:24px;border:1px solid rgba(125,211,252,.24);background:linear-gradient(160deg,rgba(12,20,30,.92),rgba(8,16,24,.78));padding:20px;display:flex;flex-direction:column;gap:14px;}
    .lineup-grid__title{margin:0;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .lineup-grid__content{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,320px);align-items:flex-start;gap:14px;flex:1;}
    .lineup-grid__cells{--lineup-cell-size:clamp(96px,14vw,132px);display:grid;grid-template-columns:repeat(5,minmax(0,1fr));grid-auto-rows:var(--lineup-cell-size);gap:min(12px,calc(var(--lineup-cell-size)*.08));align-items:stretch;justify-items:center;}
    .lineup-cell{position:relative;padding:12px;border-radius:16px;border:1px solid rgba(125,211,252,.22);background:rgba(8,16,26,.82);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;transition:border-color .16s ease,box-shadow .16s ease,background .16s ease;height:100%;width:100%;max-width:var(--lineup-cell-size);aspect-ratio:1/1;text-align:center;}
    .lineup-cell__label{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7da0c7;margin:0;}
    .lineup-cell__avatar{width:calc(var(--lineup-cell-size)*.62);height:calc(var(--lineup-cell-size)*.62);border-radius:16px;background:rgba(24,34,44,.85);display:flex;align-items:center;justify-content:center;font-size:clamp(18px,2.2vw,26px);font-weight:600;color:#aee4ff;overflow:visible;position:relative;}
    .lineup-cell__avatar img{width:100%;height:100%;object-fit:cover;border-radius:inherit;}
    .lineup-cell__name{margin:0;font-size:14px;color:#e6f2ff;line-height:1.4;min-height:20px;}
    .lineup-cell__hint{margin:0;font-size:12px;color:#9cbcd9;}
    .lineup-cell__actions{display:flex;gap:8px;flex-wrap:wrap;}
    .lineup-button{padding:8px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.28);background:rgba(12,22,32,.9);color:#aee4ff;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease;}
    .lineup-button:hover{transform:translateY(-1px);border-color:rgba(174,228,255,.5);box-shadow:0 10px 20px rgba(6,12,20,.4);}
    .lineup-button:focus-visible{outline:2px solid rgba(174,228,255,.72);outline-offset:3px;}
    .lineup-cell.is-locked{border-style:dashed;border-color:rgba(125,211,252,.35);background:rgba(12,22,34,.6);}
    .lineup-cell.is-selected,.lineup-cell.is-active{border-color:rgba(174,228,255,.55);box-shadow:0 14px 32px rgba(6,12,20,.45);}
    .lineup-cell__cost{margin:0;font-size:12px;color:#ffd9a1;letter-spacing:.08em;text-transform:uppercase;}
    .lineup-cell__locked-note{margin:0;font-size:12px;color:#9cbcd9;line-height:1.5;}
    .lineup-grid__details{border-radius:18px;border:1px solid rgba(125,211,252,.18);background:rgba(12,22,32,.78);padding:12px 14px;display:flex;flex-direction:column;gap:12px;align-self:flex-start;height:fit-content;overflow:auto;}
    .lineup-grid__details.is-empty{opacity:0.85;}
    .lineup-grid__details-section{display:flex;flex-direction:column;gap:4px;}
    .lineup-grid__details-heading{margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7da0c7;}
    .lineup-grid__details-text{margin:0;font-size:13px;color:#c8deff;line-height:1.5;}
    .lineup-grid__details-list{margin:0;padding-left:18px;font-size:13px;color:#c8deff;line-height:1.5;display:flex;flex-direction:column;gap:2px;}
    .lineup-grid__details-list li{margin:0;}
    .lineup-grid__details-empty{margin:0;font-size:13px;color:#9cbcd9;line-height:1.6;}
    .lineup-leader{border-radius:24px;border:1px solid rgba(255,209,132,.42);background:linear-gradient(150deg,rgba(36,26,12,.88),rgba(18,12,6,.92));padding:14px 16px;display:grid;grid-template-columns:minmax(0,120px) minmax(0,1fr);gap:12px;align-items:start;position:relative;overflow:hidden;}
    .lineup-leader__badge{position:absolute;top:12px;right:-18px;background:rgba(255,209,132,.16);color:#ffd184;padding:4px 26px;border-radius:999px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;transform:rotate(20deg);}
    .lineup-leader__main{display:flex;flex-direction:column;align-items:flex-start;gap:8px;}
    .lineup-leader__avatar{width:80px;height:80px;border-radius:20px;background:rgba(54,36,18,.9);display:flex;align-items:center;justify-content:center;font-size:26px;color:#ffd184;overflow:visible;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease;border:1px solid rgba(255,209,132,.45);}
    .lineup-leader__avatar img{width:100%;height:100%;object-fit:cover;border-radius:inherit;}
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
    .lineup-roster__avatar{width:54px;height:54px;border-radius:16px;background:rgba(24,34,44,.82);display:flex;align-items:center;justify-content:center;color:#aee4ff;font-size:20px;overflow:visible;position:relative;}
    .lineup-roster__avatar img{width:100%;height:100%;object-fit:cover;border-radius:inherit;}
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
    .lineup-overlay__option-avatar{width:48px;height:48px;border-radius:14px;background:rgba(24,34,44,.82);display:flex;align-items:center;justify-content:center;color:#aee4ff;font-size:18px;overflow:visible;position:relative;}
    .lineup-overlay__option-avatar img{width:100%;height:100%;object-fit:cover;border-radius:inherit;}
    .lineup-overlay__option-name{margin:0;font-size:14px;color:#e6f2ff;}
    .lineup-overlay__option-meta{margin:0;font-size:12px;color:#9cbcd9;}
    @media(max-width:1080px){.lineup-view__layout{grid-template-columns:1fr;}.lineup-main-area{grid-template-columns:1fr;}.lineup-grid__content{grid-template-columns:1fr;}.lineup-grid__cells{grid-template-columns:repeat(4,minmax(0,1fr));}.lineup-leader{grid-template-columns:1fr;}.lineup-leader__badge{display:none;}}
    @media(max-width:720px){.lineup-view__title{font-size:30px;}.lineup-view__header{flex-direction:column;align-items:flex-start;}.lineup-main-area{gap:18px;}.lineup-grid__content{grid-template-columns:1fr;}.lineup-grid__cells{--lineup-cell-size:clamp(88px,28vw,112px);grid-template-columns:repeat(3,minmax(0,1fr));gap:min(10px,calc(var(--lineup-cell-size)*.08));}.lineup-cell__avatar{width:calc(var(--lineup-cell-size)*.68);height:calc(var(--lineup-cell-size)*.68);}.lineup-roster__list{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));}}
    @media(max-width:520px){.lineup-grid__cells{--lineup-cell-size:clamp(82px,38vw,108px);grid-template-columns:repeat(2,minmax(0,1fr));gap:min(8px,calc(var(--lineup-cell-size)*.08));}.lineup-cell__avatar{width:calc(var(--lineup-cell-size)*.7);height:calc(var(--lineup-cell-size)*.7);}}
  `;

  ensureStyleTag(STYLE_ID, { css });
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
    const firstToken = sanitizeCodeToken(tokens[0] ?? '');
    const lastToken = sanitizeCodeToken(tokens[tokens.length - 1] ?? '');
    let letters = '';
    if (firstToken){
      letters += firstToken[0];
    }
    if (lastToken){
      letters += lastToken[0];
    }
    if (tokens.length > 2 && letters.length < 3){
      const extraToken = sanitizeCodeToken(tokens[1] ?? '');
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

function getInitials(parts: string[]): string{
  if (!Array.isArray(parts) || parts.length === 0){
    return '';
  }
  const firstPart = parts[0] ?? '';
  const lastPart = parts[parts.length - 1] ?? '';
  if (parts.length === 1){
    return firstPart ? firstPart.slice(0, 2).toUpperCase() : '';
  }
  const firstInitial = firstPart?.[0];
  const lastInitial = lastPart?.[0];
  if (!firstInitial || !lastInitial){
    return '';
  }
  return (firstInitial + lastInitial).toUpperCase();
}

function getNameInitials(name: string): string{
  if (!name){
    return '';
  }
  const parts = name.trim().split(/\s+/);
  return getInitials(parts);
}

function renderAvatar(container: HTMLElement, avatarUrl: string | null, name: string): void{
  const auraOverlay = container.querySelector<HTMLElement>(':scope > .rarity-aura');
  container.replaceChildren();
  if (avatarUrl){
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = name || '';
    container.appendChild(img);
  } else {
    container.textContent = getNameInitials(name || '');
  }
 if (auraOverlay){
    container.appendChild(auraOverlay);
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
  lineups?: ReadonlyArray<LineupDefinition | null | undefined> | null;
  roster?: ReadonlyArray<RosterEntryLite> | null;
  playerState?: UnknownRecord | null;
  currencies?: LineupCurrencies | null;
}

export interface LineupViewHandle {
  destroy(): void;
}

export interface SerializedLineupSelection {
  unitIds: string[];
}

export function serializeSelectedLineup(lineup: LineupState | null): SerializedLineupSelection {
  if (!lineup) return { unitIds: [] };
  const formationIds = lineup.cells
    .filter(cell => cell.section === 'formation' && cell.unlocked && typeof cell.unitId === 'string' && cell.unitId.trim())
    .map(cell => normalizeUnitId(cell.unitId as string));
  const reserveIds = lineup.cells
    .filter(cell => cell.section === 'reserve' && cell.unlocked && typeof cell.unitId === 'string' && cell.unitId.trim())
    .map(cell => normalizeUnitId(cell.unitId as string));
  return {
    unitIds: Array.from(new Set([...formationIds, ...reserveIds])).slice(0, 10),
  };
}

function hasPositiveWalletValue(source: unknown): boolean {
  if (!source || typeof source !== 'object'){
    return false;
  }
  const entries = Object.values(source as Record<string, unknown>);
  for (const entry of entries){
    if (typeof entry === 'number' && Number.isFinite(entry) && entry > 0){
      return true;
    }
    if (entry && typeof entry === 'object'){
      const record = entry as Record<string, unknown>;
      const value = Number(record.balance ?? record.amount ?? record.value ?? record.total ?? 0);
      if (Number.isFinite(value) && value > 0){
        return true;
      }
    }
  }
  return false;
}

function getAssignedUnitIds(lineup: LineupState | null): Set<string> {
  if (!lineup){
    return new Set<string>();
  }
  return collectAssignedUnitIds(lineup);
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

  const host = assertElement<HTMLElement>(root, {
    guard: (node): node is HTMLElement => node instanceof HTMLElement,
    message: 'renderLineupView cần một phần tử root hợp lệ.',
  });

  ensureStyles();

  const normalizedRoster = normalizeRoster(roster ?? null);
  const normalizedLineups = normalizeLineups(lineups ?? null, normalizedRoster);
  const rosterLookup = new Map<string, RosterUnit>(
    normalizedRoster.map(unit => [normalizeUnitId(unit.id), unit] as const),
  );
  const skillSetCache = new Map<string, ReturnType<typeof getSkillSet> | null>();

  const lineupState = new Map<string, LineupState>();
  normalizedLineups.forEach(lineup => {
    lineupState.set(lineup.id, {
      ...lineup,
      cells: lineup.cells.map(cell => ({
        ...cell,
        unlockCost: cell.unlockCost ? { ...cell.unlockCost } : null,
        equipment: cell.equipment ? { ...cell.equipment } : null,
        meta: cell.meta ? { ...cell.meta } : null,
      })),
      passives: lineup.passives.map(passive => ({ ...passive })),
      leaderId: lineup.leaderId || null,
    });
  });

  const playerCurrencySourceRaw = normalizeCurrencyBalances(playerState ?? null);
  const playerCurrencySource = hasPositiveWalletValue(playerCurrencySourceRaw)
    ? playerCurrencySourceRaw
    : null;
  const currencyBalances = createCurrencyBalances(
    createCurrencyBalances(getSharedCurrencyWallet(), playerCurrencySource),
    currencies,
  );
  const currencyOrder = getCurrencyOrder();

  const mapToWallet = (): CurrencyWallet => {
    const wallet: CurrencyWallet = {};
    for (const id of currencyOrder){
      wallet[id] = Number(currencyBalances.get(id) ?? 0);
    }
    return createNormalizedWallet(wallet);
  };

  const applyWalletToBalances = (wallet: CurrencyWallet): void => {
    for (const id of currencyOrder){
      currencyBalances.set(id, Number(wallet[id] ?? 0));
    }
  };

  applyWalletToBalances(createNormalizedWallet(getSharedCurrencyWallet(), mapToWallet()));
  syncSharedCurrencyWallet(mapToWallet(), { merge: true });

  const state: LineupViewState = {
    selectedLineupId: normalizedLineups[0]?.id ?? null,
    selectedUnitId: null,
    activeCellIndex: null,
    filter: { type: 'all', value: null },
    message: '',
    messageType: 'info',
    currencyBalances,
    lineupState,
    roster: normalizedRoster,
    rosterLookup,
    filterOptions: createFilterOptions(normalizedRoster),
  };

  const container = document.createElement('div');
  container.className = 'lineup-view';
  const mount = mountSection({
    root: host,
    section: container,
  });

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
  const walletItems = new Map<string, { item: HTMLElement; value: HTMLElement }>();
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
  
  const gridSection = document.createElement('section');
  gridSection.className = 'lineup-grid';
  const gridTitle = document.createElement('p');
  gridTitle.className = 'lineup-grid__title';
  gridTitle.textContent = 'Bố cục đội hình 5x2';
  gridSection.appendChild(gridTitle);
  const gridContent = document.createElement('div');
  gridContent.className = 'lineup-grid__content';
  gridSection.appendChild(gridContent);
  const cellsGrid = document.createElement('div');
  cellsGrid.className = 'lineup-grid__cells';
  gridContent.appendChild(cellsGrid);
  const cellDetails = document.createElement('aside');
  cellDetails.className = 'lineup-grid__details is-empty';
  gridContent.appendChild(cellDetails);

  let syncGridDetailsHandle: number | null = null;
  let lastGridDetailsHeight = -1;

  const computeGridDetailsHeight = (): void => {
    syncGridDetailsHandle = null;
    if (!cellDetails || !leaderSection || typeof leaderSection.getBoundingClientRect !== 'function'){
      cellDetails.style.maxHeight = '';
      lastGridDetailsHeight = -1;
      return;
    }
    const rect = leaderSection.getBoundingClientRect();
    if (!rect || !Number.isFinite(rect.height)){
      cellDetails.style.maxHeight = '';
      lastGridDetailsHeight = -1;
      return;
    }
    const nextHeight = Math.max(0, Math.round(rect.height));
    if (nextHeight === lastGridDetailsHeight){
      return;
    }
    lastGridDetailsHeight = nextHeight;
    cellDetails.style.maxHeight = `${nextHeight}px`;
  };

  function syncGridDetailsHeight(): void{
    if (syncGridDetailsHandle !== null){
      return;
    }
    syncGridDetailsHandle = window.requestAnimationFrame(computeGridDetailsHeight);
  }
  mainColumn.appendChild(gridSection);

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
  const passiveOverlayBody = assertElement<HTMLDivElement>(
    passiveOverlay.querySelector('.lineup-overlay__body'),
    {
      guard: (node): node is HTMLDivElement => node instanceof HTMLDivElement,
      message: 'Không thể khởi tạo overlay passive.',
    },
  );
  const passiveClose = assertElement<HTMLButtonElement>(
    passiveOverlay.querySelector('.lineup-overlay__close'),
    {
      guard: (node): node is HTMLButtonElement => node instanceof HTMLButtonElement,
      message: 'Không thể khởi tạo overlay passive.',
    },
  );
  passiveOverlayBody.innerHTML = '';
  if (document.body){
    document.body.appendChild(passiveOverlay);
  } else {
    host.appendChild(passiveOverlay);
  }

  const leaderOverlay = createOverlay();
  leaderOverlay.classList.add('lineup-overlay--leader');
  const leaderOverlayBody = assertElement<HTMLDivElement>(
    leaderOverlay.querySelector('.lineup-overlay__body'),
    {
      guard: (node): node is HTMLDivElement => node instanceof HTMLDivElement,
      message: 'Không thể khởi tạo overlay leader.',
    },
  );
  const leaderClose = assertElement<HTMLButtonElement>(
    leaderOverlay.querySelector('.lineup-overlay__close'),
    {
      guard: (node): node is HTMLButtonElement => node instanceof HTMLButtonElement,
      message: 'Không thể khởi tạo overlay leader.',
    },
  );
  leaderOverlayBody.innerHTML = '';
  if (document.body){
    document.body.appendChild(leaderOverlay);
  } else {
    host.appendChild(leaderOverlay);
  }

  let activeOverlay: HTMLElement | null = null;

  function closeOverlay(target: HTMLElement | null): void{
    if (!target) return;
    target.classList.remove('is-open');
    if (activeOverlay === target){
      activeOverlay = null;
    }
  }

  function openOverlay(target: HTMLElement | null): void{
    if (!target) return;
    target.classList.add('is-open');
    activeOverlay = target;
  }

  function getSelectedLineup(): LineupState | null{
    if (!state.selectedLineupId) return null;
    return state.lineupState.get(state.selectedLineupId) ?? null;
  }

  function persistLineupSelection(): void {
    const selected = serializeSelectedLineup(getSelectedLineup());
    patchPlayerProfile({ lineupDeck: selected.unitIds });
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

  let cachedFilterKey = '';
  let cachedFilteredRosterSource: RosterUnit[] | null = null;
  let cachedFilteredRoster: RosterUnit[] = [];
  let lastRosterRenderSignature = '';
  let lastPassivesRenderSignature = '';
  let lastFiltersRenderSignature = '';
  let lastHighlightedCellIndex: number | null = null;

  function getFilteredRoster(): RosterUnit[] {
    const filterKey = `${state.filter.type}::${state.filter.value ?? ''}`;
    if (cachedFilteredRosterSource === state.roster && cachedFilterKey === filterKey){
      return cachedFilteredRoster;
    }
    cachedFilteredRosterSource = state.roster;
    cachedFilterKey = filterKey;
    cachedFilteredRoster = filterRoster(state.roster, state.filter);
    return cachedFilteredRoster;
  }

  function getFirstReserveIndex(lineup: LineupState): number {
    for (const cell of lineup.cells){
      if (cell.section === 'reserve'){
        return cell.index;
      }
    }
    return lineup.cells.length;
  }

  function refreshWallet(): void{
    for (const [currencyId, balance] of state.currencyBalances.entries()){
      const existing = walletItems.get(currencyId);
      if (existing){
        existing.value.textContent = formatCurrencyBalance(balance, currencyId);
        continue;
      }
      const item = document.createElement('div');
      item.className = 'lineup-wallet__item';
      const nameEl = document.createElement('p');
      nameEl.className = 'lineup-wallet__name';
      nameEl.textContent = currencyId;
      const value = document.createElement('p');
      value.className = 'lineup-wallet__balance';
      value.textContent = formatCurrencyBalance(balance, currencyId);
      item.append(nameEl, value);
      walletItems.set(currencyId, { item, value });
      walletEl.appendChild(item);
    }
    for (const [currencyId, entry] of walletItems){
      if (!state.currencyBalances.has(currencyId)){
        entry.item.remove();
        walletItems.delete(currencyId);
      }
    }
  }

  function renderCellDetails(): void{
    cellDetails.innerHTML = '';
    const lineup = getSelectedLineup();
    if (!lineup){
      cellDetails.classList.add('is-empty');
      const empty = document.createElement('p');
      empty.className = 'lineup-grid__details-empty';
      empty.textContent = 'Chưa có đội hình để hiển thị thông tin.';
      cellDetails.appendChild(empty);
      const hint = document.createElement('p');
      hint.className = 'lineup-grid__details-empty';
      hint.textContent = 'Tạo hoặc chọn một đội hình để xem bố cục 5x2.';
      cellDetails.appendChild(hint);
      syncGridDetailsHeight();
      return;
    }

    const index = Number.isFinite(state.activeCellIndex) ? state.activeCellIndex : null;
    if (index == null){
      cellDetails.classList.add('is-empty');
      const hint = document.createElement('p');
      hint.className = 'lineup-grid__details-empty';
      hint.textContent = 'Chọn một ô trong lưới 5x2 để xem mô tả chi tiết.';
      cellDetails.appendChild(hint);
      syncGridDetailsHeight();
      return;
    }

    const cell = lineup.cells[index];
    if (!cell){
      cellDetails.classList.add('is-empty');
      const missing = document.createElement('p');
      missing.className = 'lineup-grid__details-empty';
      missing.textContent = 'Không tìm thấy ô tương ứng.';
      cellDetails.appendChild(missing);
      const retry = document.createElement('p');
      retry.className = 'lineup-grid__details-empty';
      retry.textContent = 'Hãy chọn lại một vị trí hợp lệ trong bố cục 5x2.';
      cellDetails.appendChild(retry);
      syncGridDetailsHeight();
      return;
    }

    const firstReserveIndex = getFirstReserveIndex(lineup);
    const sectionName = cell.section === 'formation' ? 'Ô ra trận' : 'Ô dự phòng';
    const displayIndex = cell.section === 'formation'
      ? cell.index + 1
      : (cell.index - firstReserveIndex + 1);
    const labelText = `${sectionName} #${Math.max(displayIndex, 1)}`;

    const heading = document.createElement('p');
    heading.className = 'lineup-grid__details-heading';
    heading.textContent = labelText;
    cellDetails.appendChild(heading);

    if (cell.label){
      const note = document.createElement('p');
      note.className = 'lineup-grid__details-text';
      note.textContent = `Ghi chú: ${cell.label}`;
      cellDetails.appendChild(note);
    }

    if (!cell.unlocked){
      cellDetails.classList.add('is-empty');
      const locked = document.createElement('p');
      locked.className = 'lineup-grid__details-empty';
      locked.textContent = 'Ô này đang bị khóa. Mở khóa để sử dụng vị trí trong đội hình.';
      cellDetails.appendChild(locked);
      if (cell.unlockCost){
        const cost = document.createElement('p');
        cost.className = 'lineup-grid__details-empty';
        cost.textContent = `Chi phí mở khóa: ${formatCurrencyBalance(cell.unlockCost.amount, cell.unlockCost.currencyId)}.`;
        cellDetails.appendChild(cost);
      }
      const hint = document.createElement('p');
      hint.className = 'lineup-grid__details-empty';
      hint.textContent = 'Nhấp vào ô để xác nhận mở khóa, sau đó chọn nhân vật và nhấp lại để gán.';
      cellDetails.appendChild(hint);
      syncGridDetailsHeight();
      return;
    }

    const unit = cell.unitId ? rosterLookup.get(cell.unitId) : null;
    if (!unit){
      cellDetails.classList.add('is-empty');
      const empty = document.createElement('p');
      empty.className = 'lineup-grid__details-empty';
      empty.textContent = `${labelText} hiện đang trống.`;
      cellDetails.appendChild(empty);
      const hint = document.createElement('p');
      hint.className = 'lineup-grid__details-empty';
      hint.textContent = 'Chọn nhân vật từ roster rồi nhấp vào ô để gán. Giữ Alt và nhấp ô đã có nhân vật để bỏ.';
      cellDetails.appendChild(hint);
      syncGridDetailsHeight();
      return;
    }

    cellDetails.classList.remove('is-empty');

    const interactionHint = document.createElement('p');
    interactionHint.className = 'lineup-grid__details-text';
    interactionHint.textContent = 'Nhấp trực tiếp vào ô để xem nhân vật này. Giữ Alt rồi nhấp để bỏ khỏi ô.';
    cellDetails.appendChild(interactionHint);

    const kit = (unit.raw as { kit?: unknown } | null)?.kit ?? null;
    const skillSetId = normalizeUnitId(unit.id);
    let skillSet = null;
    if (skillSetId){
      if (skillSetCache.has(skillSetId)){
        skillSet = skillSetCache.get(skillSetId) ?? null;
      } else {
        skillSet = getSkillSet(skillSetId);
        skillSetCache.set(skillSetId, skillSet ?? null);
      }
    }

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
      fallback.className = 'lineup-grid__details-empty';
      fallback.textContent = 'Chưa có dữ liệu chi tiết cho nhân vật này.';
      cellDetails.appendChild(fallback);
    } else {
      if (skills.length){
        const skillSection = document.createElement('div');
        skillSection.className = 'lineup-grid__details-section';
        const heading = document.createElement('p');
        heading.className = 'lineup-grid__details-heading';
        heading.textContent = 'Kỹ năng';
        skillSection.appendChild(heading);
        const list = document.createElement('ul');
        list.className = 'lineup-grid__details-list';
        skills.forEach((skill, idx) => {
          const item = document.createElement('li');
          const skillRecord = skill as { name?: string; key?: string } | null;
          const nameText = skillRecord?.name || skillRecord?.key || `Kỹ năng #${idx + 1}`;
          item.textContent = nameText;
          list.appendChild(item);
        });
        skillSection.appendChild(list);
        cellDetails.appendChild(skillSection);
      }

      if (hasUlt && ultName){
        const ultSection = document.createElement('div');
        ultSection.className = 'lineup-grid__details-section';
        const heading = document.createElement('p');
        heading.className = 'lineup-grid__details-heading';
        heading.textContent = 'Tuyệt kỹ';
        ultSection.appendChild(heading);
        const text = document.createElement('p');
        text.className = 'lineup-grid__details-text';
        text.textContent = ultName;
        ultSection.appendChild(text);
        cellDetails.appendChild(ultSection);
      }
    }

    syncGridDetailsHeight();
  }

  function renderCells(): void{
    const previousAvatars = cellsGrid.querySelectorAll<HTMLElement>('.lineup-cell__avatar');
    previousAvatars.forEach(avatar => {
      unmountRarity(avatar);
    });
    cellsGrid.innerHTML = '';
    const lineup = getSelectedLineup();
    if (!lineup){
      gridSection.classList.add('is-empty');
      for (let index = 0; index < 6; index += 1){
        const cellEl = document.createElement('div');
        cellEl.className = 'lineup-cell is-locked';
        cellEl.dataset.cellIndex = String(index);
        cellEl.tabIndex = 0;
        cellEl.setAttribute('role', 'button');
        const avatar = document.createElement('div');
        avatar.className = 'lineup-cell__avatar';
        unmountRarity(avatar);
        avatar.textContent = '🔒';
        cellEl.appendChild(avatar);
        cellEl.setAttribute('aria-label', `Ô đội hình #${index + 1}. Chưa có dữ liệu.`);
        cellsGrid.appendChild(cellEl);
      }
      state.activeCellIndex = null;
      renderCellDetails();
      syncGridDetailsHeight();
      return;
    }

    gridSection.classList.remove('is-empty');

    const firstReserveIndex = getFirstReserveIndex(lineup);

    if (!Number.isInteger(state.activeCellIndex) || !lineup.cells[state.activeCellIndex ?? -1]){
      state.activeCellIndex = null;
    }

    const fragment = document.createDocumentFragment();
    lineup.cells.forEach(cell => {
      const cellEl = document.createElement('div');
      cellEl.className = 'lineup-cell';
      cellEl.dataset.cellIndex = String(cell.index);
      cellEl.tabIndex = 0;
      cellEl.setAttribute('role', 'button');
      const unit = cell.unitId ? rosterLookup.get(cell.unitId) : null;
      if (state.selectedUnitId && cell.unitId === state.selectedUnitId){
        cellEl.classList.add('is-selected');
      }
      if (state.activeCellIndex === cell.index){
        cellEl.classList.add('is-active');
      }
      if (!cell.unlocked){
        cellEl.classList.add('is-locked');
        cellEl.dataset.cellAction = 'unlock';
        cellEl.dataset.cellDefaultAction = 'unlock';
        delete cellEl.dataset.cellAltAction;
      } else {
        cellEl.removeAttribute('data-cell-action');
        cellEl.dataset.cellDefaultAction = state.selectedUnitId ? 'assign'
          : cell.unitId
            ? 'select'
            : 'focus';
        if (cell.unitId){
          cellEl.dataset.cellAltAction = 'clear';
        } else {
          delete cellEl.dataset.cellAltAction;
        }
      }

      const displayIndex = cell.section === 'formation'
        ? cell.index + 1
        : (cell.index - firstReserveIndex + 1);
      const sectionName = cell.section === 'formation' ? 'Ô ra trận' : 'Ô dự phòng';

      const avatar = document.createElement('div');
      avatar.className = 'lineup-cell__avatar';
      if (unit){
        renderAvatar(avatar, unit.avatar || null, unit.name);
        mountRarityAura(avatar, getUnitRarity(unit), 'deck', { label: false });
      } else if (cell.label){
        unmountRarity(avatar);
        avatar.textContent = getNameInitials(cell.label);
      } else if (!cell.unlocked){
        unmountRarity(avatar);
        avatar.textContent = '🔒';
      } else {
        unmountRarity(avatar);
        avatar.textContent = '+';
      }
      cellEl.appendChild(avatar);

      let ariaLabel = `${sectionName} #${Math.max(displayIndex, 1)}`;
      if (unit){
        ariaLabel += `: ${unit.name}`;
      } else if (cell.label){
        ariaLabel += `: ${cell.label}`;
      }
      if (!cell.unlocked){
        ariaLabel += '. Đang khóa. Nhấp để mở khóa.';
        if (cell.unlockCost){
          ariaLabel += ` Chi phí: ${formatCurrencyBalance(cell.unlockCost.amount, cell.unlockCost.currencyId)}.`;
        }
      } else if (unit){
        ariaLabel += '. Nhấp để chọn. Dùng Alt+nhấp để bỏ nhân vật.';
      } else if (state.selectedUnitId){
        const selectedUnit = rosterLookup.get(state.selectedUnitId);
        ariaLabel += selectedUnit
          ? `. Đã chọn ${selectedUnit.name}. Nhấp để gán.`
          : '. Nhấp để gán nhân vật đã chọn.';
      } else {
        ariaLabel += '. Ô trống. Chọn nhân vật trong roster rồi nhấp để gán.';
      }
      cellEl.setAttribute('aria-label', ariaLabel);

      fragment.appendChild(cellEl);
    });

  cellsGrid.appendChild(fragment);

lastHighlightedCellIndex = null;
    updateActiveCellHighlight();
    renderCellDetails();
  }

function updateActiveCellHighlight(): void{
    const nextIndex = Number.isInteger(state.activeCellIndex) ? state.activeCellIndex : null;
    if (lastHighlightedCellIndex != null){
      const previous = cellsGrid.querySelector<HTMLElement>(`.lineup-cell[data-cell-index="${lastHighlightedCellIndex}"]`);
      previous?.classList.remove('is-active');
    }
    if (nextIndex != null){
      const next = cellsGrid.querySelector<HTMLElement>(`.lineup-cell[data-cell-index="${nextIndex}"]`);
      next?.classList.add('is-active');
    }
    lastHighlightedCellIndex = nextIndex;
  }

  function renderLeader(): void{
    const lineup = getSelectedLineup();
    if (!lineup){
      unmountRarity(leaderAvatar);
      renderAvatar(leaderAvatar, null, '');
      leaderName.textContent = 'Chưa chọn leader';
      syncGridDetailsHeight();
      return;
    }
    if (lineup.leaderId){
      const unit = rosterLookup.get(lineup.leaderId);
      if (unit){
        renderAvatar(leaderAvatar, unit.avatar || null, unit.name);
        const rarity = getUnitRarity(unit);
        if (leaderAvatar.querySelector(':scope > .rarity-aura')){
          updateRarity(leaderAvatar, rarity);
        } else {
          mountRarityAura(leaderAvatar, rarity, 'deck', { label: false });
        }
        leaderName.textContent = unit.name;
      } else {
        const fallbackName = lineup.leaderId === 'leaderA'
          ? 'Uyên'
          : (lineup.leaderId === 'leaderB' ? 'Địch' : 'Leader');
        unmountRarity(leaderAvatar);
        renderAvatar(leaderAvatar, null, fallbackName);
        leaderName.textContent = fallbackName;
      }
    } else {
      unmountRarity(leaderAvatar);
      renderAvatar(leaderAvatar, null, '');
      leaderName.textContent = 'Chưa chọn leader';
    }
    syncGridDetailsHeight();
  }

  function renderPassives(){
    const lineup = getSelectedLineup();
    if (!lineup){
      lastPassivesRenderSignature = 'empty';
      passiveGrid.innerHTML = '';
      return;
    }
    const assignedIds = collectAssignedUnitIds(lineup);
    const assignedTags = collectAssignedUnitTags(assignedIds, rosterLookup);
    const assignedTagsSignature = Array.from(assignedTags).sort().join('|');
    const passivesSignature = lineup.passives.map((passive) => {
      const isActive = evaluatePassive(passive, assignedIds, rosterLookup, assignedTags);
      return [
        passive.index,
        passive.name,
        passive.requirement,
        passive.isEmpty ? '1' : '0',
        isActive ? '1' : '0',
      ].join(':');
    }).join('||');
    const nextSignature = `${lineup.id}::${assignedIds.size}::${assignedTagsSignature}::${passivesSignature}`;
    if (nextSignature === lastPassivesRenderSignature){
      return;
    }
    lastPassivesRenderSignature = nextSignature;

    passiveGrid.innerHTML = '';
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
      if (evaluatePassive(passive, assignedIds, rosterLookup, assignedTags)){
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
    const nextSignature = [
      state.filter.type,
      state.filter.value ?? '',
      state.filterOptions.classes.join('|'),
      state.filterOptions.ranks.join('|'),
    ].join('::');
    if (nextSignature === lastFiltersRenderSignature){
      return;
    }
    lastFiltersRenderSignature = nextSignature;

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
    const lineup = getSelectedLineup();
    const filtered = getFilteredRoster();
    const assignedUnitIds = getAssignedUnitIds(lineup);
    const assignmentSignature = Array.from(assignedUnitIds).sort().join('|');
    const filterSignature = `${state.filter.type}:${state.filter.value ?? ''}`;
    const filteredIdsSignature = filtered.map(unit => normalizeUnitId(unit.id)).join('|');
    const nextSignature = `${filterSignature}::${state.selectedUnitId ?? ''}::${assignmentSignature}::${filteredIdsSignature}`;
    if (nextSignature === lastRosterRenderSignature){
      return;
    }
    lastRosterRenderSignature = nextSignature;

    rosterList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    filtered.forEach(unit => {
      const unitId = normalizeUnitId(unit.id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lineup-roster__entry';
      button.dataset.unitId = unitId;
      button.setAttribute('aria-label', `Chọn ${unit.name}`);
      if (state.selectedUnitId === unitId){
        button.classList.add('is-selected');
      }
      const isAssigned = assignedUnitIds.has(unitId);
      if (isAssigned && state.selectedUnitId !== unitId){
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
        const marker = renderRoleElementIcons(unit);
        tag.textContent = [marker, unit.role, unit.rank].filter(Boolean).join(' · ');
        meta.appendChild(tag);
      }
      if (unit.power != null){
        const extra = document.createElement('p');
        extra.className = 'lineup-roster__extra';
        extra.textContent = `Chiến lực ${formatUnitPower(unit.power)}`;
        meta.appendChild(extra);
      }
      button.appendChild(meta);
      fragment.appendChild(button);
    });
    rosterList.appendChild(fragment);
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

    const fixedLeaders = [
      { id: 'leaderA', name: 'Uyên', role: 'Leader', rank: 'SSR', avatar: null },
      { id: 'leaderB', name: 'Địch', role: 'Leader', rank: 'SSR', avatar: null },
    ];

    fixedLeaders
      .filter((leader) => LINEUP_ALLOWED_LEADER_IDS.has(leader.id))
      .forEach((leader) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'lineup-overlay__option';
        option.dataset.unitId = leader.id;
        const avatar = document.createElement('div');
        avatar.className = 'lineup-overlay__option-avatar';
        renderAvatar(avatar, leader.avatar, leader.name);
        option.appendChild(avatar);
        const text = document.createElement('div');
        const nameEl = document.createElement('p');
        nameEl.className = 'lineup-overlay__option-name';
        nameEl.textContent = leader.name;
        text.appendChild(nameEl);
        const meta = document.createElement('p');
        meta.className = 'lineup-overlay__option-meta';
        meta.textContent = [leader.role, leader.rank].filter(Boolean).join(' · ');
        text.appendChild(meta);
        option.appendChild(text);
        if (lineup.leaderId === leader.id){
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
      cellsGrid,
      cellDetails,
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
      renderCells,
      renderCellDetails,
      renderLeader,
      renderPassives,
      renderFilters,
      renderRoster,
      updateActiveCellHighlight,
      syncGridDetailsHeight,
      openPassiveDetails,
      openLeaderPicker,
      refreshWallet,
      persistLineupSelection,
    },
    rosterLookup,
  });
  cleanup.push(...eventCleanup);

  const unsubscribeSharedWallet = subscribeSharedCurrencyWallet((walletSnapshot) => {
    applyWalletToBalances(walletSnapshot);
    refreshWallet();
    renderCellDetails();
  });
  cleanup.push(unsubscribeSharedWallet);

  refreshWallet();
  renderCells();
  renderLeader();
  renderPassives();
  renderFilters();
  renderRoster();
  setMessage('Chọn nhân vật rồi nhấp vào ô để gán. Giữ Alt và nhấp ô đã có nhân vật để bỏ.');

  cleanup.push(() => passiveOverlay.remove());
  cleanup.push(() => leaderOverlay.remove());

  return {
    destroy(){
      if (syncGridDetailsHandle !== null){
        window.cancelAnimationFrame(syncGridDetailsHandle);
        syncGridDetailsHandle = null;
      }
      while (cleanup.length > 0){
        const fn = cleanup.pop();
        if (!fn) continue;
        try {
          fn();
        } catch (error){
          console.error('[lineup] destroy error', error);
        }
      }
      syncSharedCurrencyWallet(mapToWallet());
      mount.destroy();
    },
  };
 }