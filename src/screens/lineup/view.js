import { ROSTER } from '../../catalog.js';
import { listCurrencies } from '../../data/economy.js';
import { getSkillSet } from '../../data/skills.js';
import { createNumberFormatter } from '../../utils/format.js';

const STYLE_ID = 'lineup-view-style-v1';

const currencyCatalog = listCurrencies();
const currencyIndex = new Map(currencyCatalog.map(currency => [currency.id, currency]));
const numberFormatter = createNumberFormatter('vi-VN');

function ensureStyles(){
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

function cloneRoster(source){
  if (Array.isArray(source) && source.length > 0){
    return source.map(entry => ({ ...entry }));
  }
  return ROSTER.map(entry => ({ ...entry }));
}

function normalizeRosterEntry(entry, index){
  const id = entry.id || entry.key || `unit-${index}`;
  const name = entry.name || entry.title || `Nhân vật #${index + 1}`;
  const role = entry.class || entry.role || entry.archetype || '';
  const rank = entry.rank || entry.tier || '';
  const tags = Array.isArray(entry.tags)
    ? entry.tags.slice()
    : Array.isArray(entry.labels)
      ? entry.labels.slice()
      : [];
  const power = Number.isFinite(entry.power)
    ? entry.power
    : (Number.isFinite(entry.cp) ? entry.cp : null);
  const avatar = entry.avatar || entry.icon || entry.portrait || null;
  const passives = Array.isArray(entry.passives) ? entry.passives : [];
  return {
    id: String(id),
    name,
    role,
    rank,
    tags,
    power,
    avatar,
    passives,
    raw: entry
  };
}

function normalizeRoster(source){
  const cloned = cloneRoster(source);
  return cloned.map((entry, index) => normalizeRosterEntry(entry, index));
}

function normalizeAssignment(input, rosterIndex){
  if (!input){
    return { unitId: null, label: null };
  }
  if (typeof input === 'string'){
    const trimmed = input.trim();
    if (trimmed && rosterIndex.has(trimmed)){
      return { unitId: trimmed, label: null };
    }
    return { unitId: null, label: trimmed || null };
  }
  if (Array.isArray(input)){
    if (input.length >= 2 && typeof input[0] === 'string' && rosterIndex.has(input[0])){
      return { unitId: input[0], label: null };
    }
    if (input.length === 1){
      return normalizeAssignment(input[0], rosterIndex);
    }
  }
  if (typeof input === 'object'){
    const candidateId = input.unitId || input.id || input.key || null;
    const label = input.name || input.title || input.label || input.displayName || null;
    if (candidateId && rosterIndex.has(String(candidateId))){
      return { unitId: String(candidateId), label: label || null };
    }
    if (label){
      return { unitId: null, label };
    }
  }
  return { unitId: null, label: null };
}

function sanitizeCodeToken(token){
  if (!token){
    return '';
  }
  return token.replace(/[^A-Za-z0-9]/g, '');
}

function normalizeForCode(value){
  if (typeof value !== 'string'){
    return '';
  }
  const trimmed = value.trim();
  if (!trimmed){
    return '';
  }
  return trimmed.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

function extractCodeFromNormalized(normalized){
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

function getUnitCode(unit, fallbackLabel){
  const nameSource = normalizeForCode(
    (typeof unit?.name === 'string' && unit.name.trim())
      ? unit.name
      : (typeof fallbackLabel === 'string' ? fallbackLabel : '')
  );
  let code = extractCodeFromNormalized(nameSource);
  if (!code){
    const fallbackId = normalizeForCode(unit?.id != null ? String(unit.id) : '');
    code = extractCodeFromNormalized(fallbackId);
  }
  return code ? code.toLocaleUpperCase('vi-VN') : '';
}

function normalizeCost(cost, fallbackCurrencyId){
  if (cost == null){
    return null;
  }
  if (Array.isArray(cost)){
    if (cost.length >= 2 && typeof cost[0] === 'string' && !Number.isNaN(Number(cost[1]))){
      const amount = Number(cost[1]);
      if (Number.isFinite(amount) && amount > 0){
        return { currencyId: cost[0], amount };
      }
    }
    if (cost.length === 1){
      return normalizeCost(cost[0], fallbackCurrencyId);
    }
  }
  if (typeof cost === 'number'){
    if (!Number.isFinite(cost) || cost <= 0){
      return null;
    }
    return { currencyId: fallbackCurrencyId || 'VNT', amount: cost };
  }
  if (typeof cost === 'string'){
    const parsed = Number(cost);
    if (!Number.isNaN(parsed) && parsed > 0){
      return { currencyId: fallbackCurrencyId || 'VNT', amount: parsed };
    }
    return { currencyId: cost, amount: 1 };
  }
  if (typeof cost === 'object'){
    const currencyId = cost.currencyId || cost.id || cost.type || cost.code || fallbackCurrencyId || 'VNT';
    const rawAmount = cost.amount ?? cost.value ?? cost.cost ?? cost.price ?? cost.count ?? null;
    const amount = Number(rawAmount);
    if (Number.isFinite(amount) && amount > 0){
      return { currencyId: String(currencyId), amount };
    }
    if (Array.isArray(cost.values) && cost.values.length >= 2){
      const [id, value] = cost.values;
      const candidateAmount = Number(value);
      if (Number.isFinite(candidateAmount) && candidateAmount > 0){
        return { currencyId: id || currencyId, amount: candidateAmount };
      }
    }
  }
  return null;
}

function normalizeLineupEntry(entry, index, rosterIndex){
  const id = entry?.id || entry?.key || `lineup-${index}`;
  const name = entry?.title || entry?.name || `Đội hình #${index + 1}`;
  const role = entry?.role || entry?.archetype || '';
  const description = entry?.description || entry?.summary || '';
  const rawSlots = Array.isArray(entry?.slots) ? entry.slots : [];
  const memberList = Array.isArray(entry?.members) ? entry.members : [];
  const defaultCurrencyId = entry?.unlockCurrency || entry?.currencyId || entry?.defaultCurrencyId || null;
  const slotCosts = Array.isArray(entry?.slotCosts) ? entry.slotCosts : null;
  const unlockCosts = Array.isArray(entry?.unlockCosts) ? entry.unlockCosts : slotCosts;
  let unlockedCount = Math.min(3, 5);
  if (Number.isFinite(entry?.initialUnlockedSlots)){
    unlockedCount = Math.max(0, Math.min(5, Number(entry.initialUnlockedSlots)));
  } else if (rawSlots.some(slot => slot && slot.unlocked === false)){
    unlockedCount = rawSlots.filter(slot => slot && slot.unlocked !== false).length;
  }
  const slots = new Array(5).fill(null).map((_, slotIndex) => {
    const source = rawSlots[slotIndex] ?? memberList[slotIndex] ?? null;
    const { unitId, label } = normalizeAssignment(source, rosterIndex);
    const slotUnlock = source && typeof source === 'object' && 'unlocked' in source ? source.unlocked : null;
    const unlocked = slotUnlock != null ? Boolean(slotUnlock) : slotIndex < unlockedCount;
    const costSource = source?.cost
      ?? source?.unlockCost
      ?? (Array.isArray(unlockCosts) ? unlockCosts[slotIndex] : null)
      ?? entry?.slotCost
      ?? entry?.unlockCost
      ?? null;
    const unlockCost = normalizeCost(costSource, defaultCurrencyId);
    return {
      index: slotIndex,
      unitId: unitId || null,
      label: label || null,
      unlocked,
      unlockCost,
      meta: source && typeof source === 'object' ? { ...source } : null
    };
  });

  const benchSource = Array.isArray(entry?.bench)
    ? entry.bench
    : Array.isArray(entry?.reserve)
      ? entry.reserve
      : Array.isArray(entry?.members)
        ? entry.members.slice(5)
        : [];
  const bench = new Array(10).fill(null).map((_, benchIndex) => {
    const source = benchSource[benchIndex] ?? null;
    const { unitId, label } = normalizeAssignment(source, rosterIndex);
    return {
      index: benchIndex,
      unitId: unitId || null,
      label: label || null,
      meta: source && typeof source === 'object' ? { ...source } : null
    };
  });

  const passiveSource = Array.isArray(entry?.passives)
    ? entry.passives
    : Array.isArray(entry?.passiveSlots)
      ? entry.passiveSlots
      : [];
  const passives = new Array(6).fill(null).map((_, passiveIndex) => {
    const source = passiveSource[passiveIndex] ?? null;
    if (!source){
      return {
        index: passiveIndex,
        id: `passive-${passiveIndex}`,
        name: 'Chưa thiết lập',
        description: '',
        requirement: '',
        requiredUnitIds: [],
        requiredTags: [],
        isEmpty: true,
        autoActive: false,
        source: null
      };
    }
    const id = source.id || source.key || `passive-${passiveIndex}`;
    const name = source.name || source.title || `Passive #${passiveIndex + 1}`;
    const description = source.description || source.effect || source.text || '';
    const requirement = source.requirement || source.condition || source.prerequisite || '';
    const requiredUnitIds = Array.isArray(source.requiredUnitIds)
      ? source.requiredUnitIds.map(String)
      : Array.isArray(source.requires)
        ? source.requires.filter(item => typeof item === 'string').map(String)
        : (typeof source.requiredUnitId === 'string' ? [source.requiredUnitId] : []);
    const requiredTags = Array.isArray(source.requiredTags)
      ? source.requiredTags.map(String)
      : Array.isArray(source.tagsRequired)
        ? source.tagsRequired.map(String)
        : [];
    const auto = source.autoActive === true || source.alwaysActive === true || source.isActive === true;
    return {
      index: passiveIndex,
      id,
      name,
      description,
      requirement: typeof requirement === 'string' ? requirement : '',
      requiredUnitIds,
      requiredTags,
      isEmpty: false,
      autoActive: Boolean(auto),
      source
    };
  });

  const leaderId = entry?.leaderId || entry?.leader || entry?.captainId || null;

  const fallbackLeader = slots.find(slot => slot.unitId)?.unitId || null;

  return {
    id: String(id),
    name,
    role,
    description,
    slots,
    bench,
    passives,
    leaderId: leaderId && rosterIndex.has(String(leaderId)) ? String(leaderId) : fallbackLeader,
    defaultCurrencyId: defaultCurrencyId || null
  };
}

function normalizeLineups(rawLineups, roster){
  const rosterIndex = new Set(roster.map(unit => unit.id));
  if (!Array.isArray(rawLineups) || rawLineups.length === 0){
    const slots = new Array(5).fill(null).map((_, index) => ({
      index,
      unitId: null,
      label: null,
      unlocked: index < 3,
      unlockCost: null,
      meta: null
    }));
    const bench = new Array(10).fill(null).map((_, index) => ({
      index,
      unitId: null,
      label: null,
      meta: null
    }));
    const passives = new Array(6).fill(null).map((_, index) => ({
      index,
      id: `passive-${index}`,
      name: 'Chưa thiết lập',
      description: '',
      requirement: '',
      requiredUnitIds: [],
      requiredTags: [],
      isEmpty: true,
      autoActive: false,
      source: null
    }));
    return [{
      id: 'lineup-default',
      name: 'Đội hình mẫu',
      role: '',
      description: 'Thiết lập đội hình gồm tối đa 5 vị trí chủ lực và 10 vị trí dự bị.',
      slots,
      bench,
      passives,
      leaderId: null,
      defaultCurrencyId: null
    }];
  }
  return rawLineups.map((entry, index) => normalizeLineupEntry(entry || {}, index, rosterIndex));
}

function extractCurrencyBalances(source){
  const balances = new Map();
  if (!source){
    return balances;
  }
  const apply = (id, value) => {
    if (!id) return;
    const amount = Number(value);
    if (!Number.isNaN(amount)){
      balances.set(String(id), amount);
    }
  };

  if (Array.isArray(source)){
    source.forEach(entry => {
      if (!entry) return;
      if (typeof entry === 'number'){ apply('VNT', entry); return; }
      if (typeof entry === 'string'){
        const [id, value] = entry.split(':');
        if (id && value){
          apply(id.trim(), Number(value));
        }
        return;
      }
      if (typeof entry === 'object'){
        const id = entry.currencyId || entry.id || entry.key || entry.type;
        const value = entry.balance ?? entry.amount ?? entry.value ?? entry.total ?? entry;
        apply(id, value);
      }
    });
    return balances;
  }

  if (typeof source === 'object'){
    Object.entries(source).forEach(([key, value]) => {
      if (value && typeof value === 'object' && ('balance' in value || 'amount' in value || 'value' in value || 'total' in value)){
        const id = value.currencyId || value.id || value.key || key;
        apply(id, value.balance ?? value.amount ?? value.value ?? value.total);
      } else {
        apply(key, value);
      }
    });
    if (source.balances && typeof source.balances === 'object'){
      Object.entries(source.balances).forEach(([key, value]) => apply(key, value));
    }
  }

  return balances;
}

function createCurrencyBalances(primary, secondary){
  const base = extractCurrencyBalances(primary);
  const override = extractCurrencyBalances(secondary);
  for (const [key, value] of override.entries()){
    base.set(key, value);
  }
  currencyCatalog.forEach(currency => {
    if (!base.has(currency.id)){
      base.set(currency.id, 0);
    }
  });
  return base;
}
function formatCurrencyBalance(amount, currencyId){
  const currency = currencyIndex.get(currencyId);
  const formatted = numberFormatter.format(Number.isFinite(amount) ? amount : 0);
  const suffix = currency?.suffix || currencyId || '';
  return suffix ? `${formatted} ${suffix}` : formatted;
}

function getInitials(name){
  if (!name) return '';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1){
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function collectAssignedUnitIds(lineup){
  const ids = new Set();
  lineup.slots.forEach(slot => {
    if (slot.unitId){
      ids.add(slot.unitId);
    }
  });
  lineup.bench.forEach(cell => {
    if (cell.unitId){
      ids.add(cell.unitId);
    }
  });
  if (lineup.leaderId){
    ids.add(lineup.leaderId);
  }
  return ids;
}

function evaluatePassive(passive, assignedUnitIds, rosterLookup){
  if (!passive || passive.isEmpty){
    return false;
  }
  if (passive.autoActive){
    return true;
  }
  if (passive.requiredUnitIds && passive.requiredUnitIds.length > 0){
    for (const required of passive.requiredUnitIds){
      if (!assignedUnitIds.has(required)){
        return false;
      }
    }
  }
  if (passive.requiredTags && passive.requiredTags.length > 0){
    const availableTags = new Set();
    assignedUnitIds.forEach(id => {
      const unit = rosterLookup.get(id);
      if (!unit) return;
      if (unit.role) availableTags.add(unit.role);
      if (unit.rank) availableTags.add(unit.rank);
      (unit.tags || []).forEach(tag => availableTags.add(tag));
    });
    const hasAllTags = passive.requiredTags.every(tag => availableTags.has(tag));
    if (!hasAllTags){
      return false;
    }
  }
  if (!passive.requiredUnitIds?.length && !passive.requiredTags?.length){
    return assignedUnitIds.size > 0;
  }
  return true;
}

function createOverlay(){
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

function renderAvatar(container, avatarUrl, name){
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

function filterRoster(roster, filter){
  if (!filter || filter.type === 'all' || !filter.value){
    return roster;
  }
  const value = String(filter.value).toLowerCase();
  if (filter.type === 'class'){
    return roster.filter(unit => (unit.role || '').toLowerCase() === value);
  }
  if (filter.type === 'rank'){
    return roster.filter(unit => (unit.rank || '').toLowerCase() === value);
  }
  if (filter.type === 'tag'){
    return roster.filter(unit => unit.tags.some(tag => String(tag).toLowerCase() === value));
  }
  return roster;
}

function createFilterOptions(roster){
  const classes = new Set();
  const ranks = new Set();
  const tags = new Set();
  roster.forEach(unit => {
    if (unit.role) classes.add(unit.role);
    if (unit.rank) ranks.add(unit.rank);
    (unit.tags || []).forEach(tag => tags.add(tag));
  });
  return {
    classes: Array.from(classes),
    ranks: Array.from(ranks),
    tags: Array.from(tags)
  };
}
function removeUnitFromPlacements(lineup, unitId, options = {}){
  if (!unitId) return;
  const { keepLeader = false } = options;
  lineup.slots.forEach(slot => {
    if (slot.unitId === unitId){
      slot.unitId = null;
    }
  });
  lineup.bench.forEach(cell => {
    if (cell.unitId === unitId){
      cell.unitId = null;
    }
  });
  if (!keepLeader && lineup.leaderId === unitId){
    lineup.leaderId = null;
  }
}

function assignUnitToSlot(lineup, slotIndex, unitId){
  const slot = lineup.slots[slotIndex];
  if (!slot){
    return { ok: false, message: 'Không tìm thấy vị trí.' };
  }
  if (!slot.unlocked){
    return { ok: false, message: 'Vị trí đang bị khóa.' };
  }
  if (slot.unitId === unitId){
    return { ok: true };
  }
  removeUnitFromPlacements(lineup, unitId, { keepLeader: true });
  slot.unitId = unitId;
  slot.label = null;
  return { ok: true };
}

function assignUnitToBench(lineup, benchIndex, unitId){
  const cell = lineup.bench[benchIndex];
  if (!cell){
    return { ok: false, message: 'Không tìm thấy ô dự bị.' };
  }
  if (cell.unitId === unitId){
    return { ok: true };
  }
  removeUnitFromPlacements(lineup, unitId, { keepLeader: true });
  cell.unitId = unitId;
  cell.label = null;
  return { ok: true };
}

function removeUnitFromBench(lineup, benchIndex){
  const cell = lineup.bench[benchIndex];
  if (!cell) return;
  cell.unitId = null;
}

function isUnitPlaced(lineup, unitId){
  if (!unitId) return false;
  if (lineup.leaderId === unitId) return true;
  if (lineup.slots.some(slot => slot.unitId === unitId)) return true;
  if (lineup.bench.some(cell => cell.unitId === unitId)) return true;
  return false;
}
export function renderLineupView(options = {}){
  const {
    root,
    shell,
    definition,
    description,
    lineups,
    roster,
    playerState,
    currencies
  } = options;

  if (!root){
    throw new Error('renderLineupView cần một phần tử root hợp lệ.');
  }

  ensureStyles();

  const normalizedRoster = normalizeRoster(roster);
  const normalizedLineups = normalizeLineups(lineups, normalizedRoster);
  const rosterLookup = new Map(normalizedRoster.map(unit => [unit.id, unit]));
  const lineupState = new Map();
  normalizedLineups.forEach(lineup => {
    lineupState.set(lineup.id, {
      ...lineup,
      slots: lineup.slots.map(slot => ({ ...slot })),
      bench: lineup.bench.map(cell => ({ ...cell })),
      passives: lineup.passives.map(passive => ({ ...passive })),
      leaderId: lineup.leaderId || null
    });
  });

  const playerCurrencies = playerState?.currencies || null;
  const currencyBalances = createCurrencyBalances(playerCurrencies, currencies);

  const state = {
    selectedLineupId: normalizedLineups[0]?.id || null,
    selectedUnitId: null,
    activeBenchIndex: null,
    filter: { type: 'all', value: null },
    message: '',
    messageType: 'info',
    currencyBalances,
    lineupState,
    roster: normalizedRoster,
    rosterLookup,
    filterOptions: createFilterOptions(normalizedRoster)
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

  function syncBenchDetailsHeight(){
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
  const passiveOverlayBody = passiveOverlay.querySelector('.lineup-overlay__body');
  const passiveClose = passiveOverlay.querySelector('.lineup-overlay__close');
  passiveOverlayBody.innerHTML = '';
  document.body.appendChild(passiveOverlay);

  const leaderOverlay = createOverlay();
  leaderOverlay.classList.add('lineup-overlay--leader');
  const leaderOverlayBody = leaderOverlay.querySelector('.lineup-overlay__body');
  const leaderClose = leaderOverlay.querySelector('.lineup-overlay__close');
  leaderOverlayBody.innerHTML = '';
  document.body.appendChild(leaderOverlay);

  let activeOverlay = null;

  function closeOverlay(target){
    if (!target) return;
    target.classList.remove('is-open');
    if (activeOverlay === target){
      activeOverlay = null;
    }
  }

  function openOverlay(target){
    if (!target) return;
    target.classList.add('is-open');
    activeOverlay = target;
  }
  function getSelectedLineup(){
    if (!state.selectedLineupId) return null;
    return state.lineupState.get(state.selectedLineupId) || null;
  }

  function setMessage(text, type = 'info'){
    state.message = text || '';
    state.messageType = type;
    messageEl.textContent = text || '';
    if (type === 'error'){
      messageEl.classList.add('is-error');
    } else {
      messageEl.classList.remove('is-error');
    }
  }

  function refreshWallet(){
    walletEl.innerHTML = '';
    for (const [currencyId, balance] of state.currencyBalances.entries()){
      const item = document.createElement('div');
      item.className = 'lineup-wallet__item';
      const name = document.createElement('p');
      name.className = 'lineup-wallet__name';
      const currency = currencyIndex.get(currencyId);
      name.textContent = currency?.name || currencyId;
      const value = document.createElement('p');
      value.className = 'lineup-wallet__balance';
      value.textContent = formatCurrencyBalance(balance, currencyId);
      item.appendChild(name);
      item.appendChild(value);
      walletEl.appendChild(item);
    }
  }

function renderBenchDetails(){
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

    const kit = unit.raw?.kit || null;
    const skillSet = unit.id ? getSkillSet(unit.id) : null;

    const skills = Array.isArray(kit?.skills)
      ? kit.skills
          .filter(skill => {
            const skillName = typeof skill?.name === 'string' ? skill.name.trim() : '';
            const skillKey = typeof skill?.key === 'string' ? skill.key.trim() : '';
            return skillName !== 'Đánh Thường' && skillKey !== 'Đánh Thường';
          })
          .slice(0, 3)
      : [];

    const kitUlt = kit?.ult || null;
    const skillSetUlt = skillSet?.ult || null;
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
          const name = skill?.name || skill?.key || `Kỹ năng #${idx + 1}`;
          item.textContent = name;
          list.appendChild(item);
        });
        skillSection.appendChild(list);
        benchDetails.appendChild(skillSection);
      }

      if (hasUlt){
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

  function updateActiveBenchHighlight(){
    const cells = benchGrid.querySelectorAll('.lineup-bench__cell');
    cells.forEach(cell => {
      const idx = Number(cell.dataset.benchIndex);
      if (Number.isFinite(idx) && idx === state.activeBenchIndex){
        cell.classList.add('is-active');
      } else {
        cell.classList.remove('is-active');
      }
    });
  }

  function renderBench(){
    const lineup = getSelectedLineup();
    benchGrid.innerHTML = '';
    if (!lineup){
      state.activeBenchIndex = null;
      renderBenchDetails();
      return;
    }

    if (!Number.isInteger(state.activeBenchIndex) || !lineup.bench[state.activeBenchIndex]){
      state.activeBenchIndex = null;
    }
    
    const columnCount = 5;
    const columnEls = Array.from({ length: columnCount }, (_, idx) => {
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
      const avatarSource = unit?.avatar || cell.meta?.avatar || null;
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

  function renderLeader(){
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

  function renderFilters(){
    rosterFilters.innerHTML = '';
    const filters = [
      { type: 'all', value: null, label: 'Tất cả' },
      ...state.filterOptions.classes.map(value => ({ type: 'class', value, label: value })),
      ...state.filterOptions.ranks.map(value => ({ type: 'rank', value, label: value }))
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

  function renderRoster(){
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
      if (lineup && isUnitPlaced(lineup, unit.id) && state.selectedUnitId !== unit.id){
        button.classList.add('is-unavailable');
      }
      const avatar = document.createElement('div');
      avatar.className = 'lineup-roster__avatar';
      renderAvatar(avatar, unit.avatar || null, unit.name);
      button.appendChild(avatar);
      const meta = document.createElement('div');
      meta.className = 'lineup-roster__meta';
      const name = document.createElement('p');
      name.className = 'lineup-roster__name';
      name.textContent = unit.name;
      meta.appendChild(name);
      if (unit.role || unit.rank){
        const tag = document.createElement('p');
        tag.className = 'lineup-roster__tag';
        tag.textContent = [unit.role, unit.rank].filter(Boolean).join(' · ');
        meta.appendChild(tag);
      }
      if (unit.power != null){
        const extra = document.createElement('p');
        extra.className = 'lineup-roster__extra';
        extra.textContent = `Chiến lực ${numberFormatter.format(unit.power)}`;
        meta.appendChild(extra);
      }
      button.appendChild(meta);
      rosterList.appendChild(button);
    });
  }

  function openPassiveDetails(passive){
    if (!passive || passive.isEmpty) return;
    passiveOverlayBody.innerHTML = '';
    const title = document.createElement('h3');
    title.className = 'lineup-overlay__title';
    title.textContent = passive.name;
    passiveOverlayBody.appendChild(title);
    const subtitle = document.createElement('p');
    subtitle.className = 'lineup-overlay__subtitle';
    subtitle.textContent = passive.description || 'Chưa có mô tả chi tiết.';
    passiveOverlayBody.appendChild(subtitle);
    if (passive.requirement){
      const requirement = document.createElement('p');
      requirement.className = 'lineup-overlay__subtitle';
      requirement.textContent = `Điều kiện: ${passive.requirement}`;
      passiveOverlayBody.appendChild(requirement);
    }
    if (passive.requiredUnitIds?.length){
      const units = passive.requiredUnitIds
        .map(id => rosterLookup.get(id)?.name || id)
        .join(', ');
      const reqUnits = document.createElement('p');
      reqUnits.className = 'lineup-overlay__subtitle';
      reqUnits.textContent = `Yêu cầu nhân vật: ${units}`;
      passiveOverlayBody.appendChild(reqUnits);
    }
    if (passive.requiredTags?.length){
      const tags = passive.requiredTags.join(', ');
      const reqTags = document.createElement('p');
      reqTags.className = 'lineup-overlay__subtitle';
      reqTags.textContent = `Yêu cầu tag: ${tags}`;
      passiveOverlayBody.appendChild(reqTags);
    }
    openOverlay(passiveOverlay);
    passiveClose.focus();
  }

  function openLeaderPicker(){
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
      const name = document.createElement('p');
      name.className = 'lineup-overlay__option-name';
      name.textContent = unit.name;
      text.appendChild(name);
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

  function setLeader(lineup, unitId){
    if (!lineup){
      return { ok: false, message: 'Không tìm thấy đội hình.' };
    }
    if (!unitId){
      lineup.leaderId = null;
      return { ok: true };
    }
    const unit = rosterLookup.get(unitId);
    if (!unit){
      return { ok: false, message: 'Không tìm thấy nhân vật.' };
    }
    if (!isUnitPlaced(lineup, unitId)){
      const slot = lineup.slots.find(entry => entry.unlocked && !entry.unitId);
      if (slot){
        assignUnitToSlot(lineup, slot.index, unitId);
      } else {
        const bench = lineup.bench.find(entry => !entry.unitId);
        if (bench){
          assignUnitToBench(lineup, bench.index, unitId);
        } else {
          return { ok: false, message: 'Không còn vị trí trống để gán leader.' };
        }
      }
    }
    lineup.leaderId = unitId;
    return { ok: true };
  }

  function handleBenchInteraction(event){
    const benchEl = event.target.closest('.lineup-bench__cell');
    if (!benchEl) return;
    const lineup = getSelectedLineup();
    if (!lineup) return;
    const benchIndex = Number(benchEl.dataset.benchIndex);
    if (!Number.isFinite(benchIndex)) return;
    const cell = lineup.bench[benchIndex];
    if (!cell) return;

    if (state.selectedUnitId){
      const result = assignUnitToBench(lineup, benchIndex, state.selectedUnitId);
      if (!result.ok){
        setMessage(result.message || 'Không thể gán nhân vật.', 'error');
      } else {
        setMessage('Đã thêm nhân vật vào dự bị.', 'info');
      }
      renderBench();
      renderLeader();
      renderPassives();
      renderRoster();
      return;
    }

    if (event.altKey || event.ctrlKey || event.metaKey){
      if (cell.unitId){
        removeUnitFromBench(lineup, benchIndex);
        state.activeBenchIndex = benchIndex;
        renderBench();
        renderPassives();
        renderRoster();
        renderLeader();
        setMessage('Đã bỏ nhân vật khỏi dự bị.', 'info');
      }
      return;
    }
   
    state.activeBenchIndex = benchIndex;
    updateActiveBenchHighlight();
    renderBenchDetails();
  }

  function handleBenchFocus(event){
    const benchEl = event.target.closest('.lineup-bench__cell');
    if (!benchEl) return;
    const lineup = getSelectedLineup();
    if (!lineup) return;
    const benchIndex = Number(benchEl.dataset.benchIndex);
    if (!Number.isFinite(benchIndex)) return;
    if (state.activeBenchIndex === benchIndex) return;
    state.activeBenchIndex = benchIndex;
    updateActiveBenchHighlight();
    renderBenchDetails();
  }

  function handlePassiveClick(event){
    const btn = event.target.closest('.lineup-passive');
    if (!btn) return;
    const lineup = getSelectedLineup();
    if (!lineup) return;
    const index = Number(btn.dataset.passiveIndex);
    if (!Number.isFinite(index)) return;
    const passive = lineup.passives[index];
    if (!passive || passive.isEmpty) return;
    openPassiveDetails(passive);
  }

  function handleRosterFilter(event){
    const button = event.target.closest('.lineup-roster__filter');
    if (!button) return;
    const type = button.dataset.filterType || 'all';
    const value = button.dataset.filterValue ?? null;
    state.filter = { type, value };
    renderFilters();
    renderRoster();
  }

  function handleRosterSelect(event){
    const entry = event.target.closest('.lineup-roster__entry');
    if (!entry) return;
    const unitId = entry.dataset.unitId;
    if (!unitId) return;
    if (state.selectedUnitId === unitId){
      state.selectedUnitId = null;
      setMessage('Đã bỏ chọn nhân vật.', 'info');
    } else {
      state.selectedUnitId = unitId;
      const unit = rosterLookup.get(unitId);
      setMessage(`Đã chọn ${unit?.name || 'nhân vật'}. Chạm ô dự bị hoặc leader để gán.`, 'info');
    }
    renderRoster();
  }

  function handleLeaderOption(event){
    const option = event.target.closest('.lineup-overlay__option');
    if (!option) return;
    const lineup = getSelectedLineup();
    if (!lineup) return;
    const unitId = option.dataset.unitId || null;
    const result = setLeader(lineup, unitId || null);
    if (!result.ok){
      setMessage(result.message || 'Không thể đặt leader.', 'error');
    } else {
      if (unitId){
        const unit = rosterLookup.get(unitId);
        setMessage(`Đã chọn ${unit?.name || 'leader'}.`, 'info');
      } else {
        setMessage('Đã bỏ chọn leader.', 'info');
      }
    }
    renderLeader();
    renderBench();
    renderPassives();
    renderRoster();
    closeOverlay(leaderOverlay);
  }

  function handleGlobalKey(event){
    if (event.key === 'Escape' && activeOverlay){
      closeOverlay(activeOverlay);
    }
  }
  const cleanup = [];

let leaderObserver = null;
  if (typeof ResizeObserver === 'function'){
    leaderObserver = new ResizeObserver(() => {
      syncBenchDetailsHeight();
    });
    leaderObserver.observe(leaderSection);
    cleanup.push(() => {
      if (leaderObserver){
        leaderObserver.disconnect();
      }
    });
  }

  const handleWindowResize = () => syncBenchDetailsHeight();
  if (typeof window !== 'undefined'){
    window.addEventListener('resize', handleWindowResize);
    cleanup.push(() => window.removeEventListener('resize', handleWindowResize));
  }

  const handleBack = () => {
    if (shell && typeof shell.enterScreen === 'function'){
      shell.enterScreen('main-menu');
    }
  };
  backButton.addEventListener('click', handleBack);
  cleanup.push(() => backButton.removeEventListener('click', handleBack));

  benchGrid.addEventListener('click', handleBenchInteraction);
  cleanup.push(() => benchGrid.removeEventListener('click', handleBenchInteraction));
  benchGrid.addEventListener('focusin', handleBenchFocus);
  cleanup.push(() => benchGrid.removeEventListener('focusin', handleBenchFocus));
  benchGrid.addEventListener('mouseenter', handleBenchFocus, true);
  cleanup.push(() => benchGrid.removeEventListener('mouseenter', handleBenchFocus, true));

  passiveGrid.addEventListener('click', handlePassiveClick);
  cleanup.push(() => passiveGrid.removeEventListener('click', handlePassiveClick));

  rosterFilters.addEventListener('click', handleRosterFilter);
  cleanup.push(() => rosterFilters.removeEventListener('click', handleRosterFilter));

  rosterList.addEventListener('click', handleRosterSelect);
  cleanup.push(() => rosterList.removeEventListener('click', handleRosterSelect));

  const handleLeaderOpen = () => openLeaderPicker();
  leaderAvatar.addEventListener('click', handleLeaderOpen);
  cleanup.push(() => leaderAvatar.removeEventListener('click', handleLeaderOpen));

  const handlePassiveClose = () => closeOverlay(passiveOverlay);
  passiveClose.addEventListener('click', handlePassiveClose);
  cleanup.push(() => passiveClose.removeEventListener('click', handlePassiveClose));

  const handleLeaderClose = () => closeOverlay(leaderOverlay);
  leaderClose.addEventListener('click', handleLeaderClose);
  cleanup.push(() => leaderClose.removeEventListener('click', handleLeaderClose));

  const handlePassiveOverlayClick = event => {
    if (event.target === passiveOverlay){
      closeOverlay(passiveOverlay);
    }
  };
  passiveOverlay.addEventListener('click', handlePassiveOverlayClick);
  cleanup.push(() => passiveOverlay.removeEventListener('click', handlePassiveOverlayClick));

  const handleLeaderOverlayClick = event => {
    if (event.target === leaderOverlay){
      closeOverlay(leaderOverlay);
    }
  };
  leaderOverlay.addEventListener('click', handleLeaderOverlayClick);
  cleanup.push(() => leaderOverlay.removeEventListener('click', handleLeaderOverlayClick));

  leaderOverlayBody.addEventListener('click', handleLeaderOption);
  cleanup.push(() => leaderOverlayBody.removeEventListener('click', handleLeaderOption));

  document.addEventListener('keydown', handleGlobalKey);
  cleanup.push(() => document.removeEventListener('keydown', handleGlobalKey));

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
        try {
          if (typeof fn === 'function'){
            fn();
          }
        } catch (error) {
          console.error('[lineup] destroy error', error);
        }
      }
    }
  };
}

export default { renderLineupView };