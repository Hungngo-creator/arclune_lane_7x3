import { ROSTER } from '../../catalog.js';
import { UNITS } from '../../units.js';
import { getUnitArt } from '../../art.js';
import { listCurrencies } from '../../data/economy.js';
import { getSkillSet } from '../../data/skills.js';
import { createNumberFormatter } from '../../utils/format.js';

const STYLE_ID = 'collection-view-style-v2';

const TAB_DEFINITIONS = [
  { key: 'awakening', label: 'Thức Tỉnh', hint: 'Theo dõi mốc thức tỉnh, sao và điểm đột phá của nhân vật đã sở hữu.' },
  { key: 'skills', label: 'Kĩ Năng', hint: 'Mở lớp phủ mô tả kỹ năng, chuỗi nâng cấp và yêu cầu nguyên liệu.' },
  { key: 'arts', label: 'Công Pháp & Trang Bị', hint: 'Liệt kê công pháp, pháp khí và trang bị đang trang bị cho nhân vật.' },
  { key: 'skins', label: 'Skin', hint: 'Quản lý skin đã mở khóa và áp dụng bảng phối màu yêu thích.' },
  { key: 'voice', label: 'Giọng Nói', hint: 'Nghe thử voice line, thiết lập voice pack và gợi ý mở khóa.' }
];

const currencyCatalog = listCurrencies();
const currencyFormatter = createNumberFormatter('vi-VN');

function ensureStyles(){
  if (typeof document === 'undefined') return;
  let style = document.getElementById(STYLE_ID);
  if (!style || style.tagName.toLowerCase() !== 'style'){
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

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
    .collection-view__layout{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,2fr) minmax(0,1fr);gap:24px;align-items:stretch;}
    .collection-roster{border-radius:24px;border:1px solid rgba(125,211,252,.2);background:linear-gradient(160deg,rgba(12,22,32,.94),rgba(6,14,22,.78));padding:20px;display:flex;flex-direction:column;gap:12px;overflow:hidden;}
    .collection-roster__list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;max-height:560px;overflow:auto;padding-right:4px;}
    .collection-roster__entry{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:14px;border:1px solid transparent;background:rgba(12,20,28,.72);color:inherit;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease;}
    .collection-roster__entry:hover{transform:translateY(-2px);border-color:rgba(125,211,252,.35);background:rgba(16,26,36,.9);}
    .collection-roster__entry:focus-visible{outline:2px solid rgba(125,211,252,.65);outline-offset:3px;}
    .collection-roster__entry.is-selected{border-color:rgba(125,211,252,.55);background:rgba(18,30,42,.95);box-shadow:0 16px 36px rgba(6,12,20,.45);}
    .collection-roster__avatar{width:54px;height:54px;border-radius:16px;background:rgba(24,34,44,.85);overflow:hidden;position:relative;display:flex;align-items:center;justify-content:center;}
    .collection-roster__avatar img{width:64px;height:64px;object-fit:contain;filter:drop-shadow(0 8px 16px rgba(0,0,0,.55));}
    .collection-roster__meta{display:flex;flex-direction:column;gap:4px;flex:1;}
    .collection-roster__name{margin:0;font-size:15px;letter-spacing:.04em;}
    .collection-roster__tag{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .collection-roster__cost{padding:6px 10px;border-radius:12px;background:rgba(36,18,12,.72);color:#ffd9a1;font-size:12px;letter-spacing:.12em;text-transform:uppercase;display:flex;align-items:center;gap:6px;}
    .collection-roster__cost.is-highlighted{background:rgba(255,184,108,.9);color:#1e1206;box-shadow:0 10px 24px rgba(255,184,108,.45);}
    .collection-stage{position:relative;border-radius:28px;border:1px solid rgba(125,211,252,.24);background:linear-gradient(150deg,rgba(16,24,34,.92),rgba(10,16,26,.72));padding:28px;display:flex;flex-direction:column;gap:18px;overflow:hidden;min-height:420px;}
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
    .collection-skill-overlay{position:absolute;top:15%;left:15%;width:70%;min-height:70%;padding:24px;border-radius:22px;border:1px solid rgba(125,211,252,.45);background:rgba(8,16,26,.92);box-shadow:0 42px 96px rgba(3,6,12,.75);display:flex;flex-direction:column;gap:18px;opacity:0;pointer-events:none;transition:opacity .24s ease,transform .24s ease;transform:translateY(12px);backdrop-filter:blur(6px);}
    .collection-skill-overlay.is-open{opacity:1;pointer-events:auto;transform:translateY(0);}
    .collection-skill-overlay__header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;}
    .collection-skill-overlay__title{margin:0;font-size:22px;letter-spacing:.06em;}
    .collection-skill-overlay__close{padding:8px 12px;border-radius:12px;border:1px solid rgba(125,211,252,.28);background:rgba(16,24,34,.85);color:#aee4ff;font-size:12px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:transform .16s ease,border-color .16s ease;}
    .collection-skill-overlay__close:hover{transform:translateY(-2px);border-color:rgba(174,228,255,.48);}
    .collection-skill-overlay__close:focus-visible{outline:2px solid rgba(174,228,255,.75);outline-offset:3px;}
    .collection-skill-overlay__content{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:24px;flex:1;}
    .collection-skill-overlay__visual{border-radius:18px;background:rgba(12,22,32,.88);border:1px solid rgba(125,211,252,.24);display:flex;align-items:center;justify-content:center;padding:18px;}
    .collection-skill-overlay__visual img{width:100%;max-width:320px;height:auto;filter:drop-shadow(0 24px 48px rgba(0,0,0,.6));}
    .collection-skill-overlay__details{display:flex;flex-direction:column;gap:12px;}
    .collection-skill-overlay__subtitle{margin:0;color:#9cbcd9;font-size:14px;line-height:1.6;}
    .collection-skill-overlay__abilities{display:flex;flex-direction:column;gap:16px;overflow:auto;max-height:420px;padding-right:4px;}
    .collection-skill-card{border-radius:16px;border:1px solid rgba(125,211,252,.24);background:rgba(12,22,32,.88);padding:16px;display:flex;flex-direction:column;gap:10px;}
    .collection-skill-card__header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;}
    .collection-skill-card__title{margin:0;font-size:16px;letter-spacing:.04em;}
    .collection-skill-card__badge{padding:4px 10px;border-radius:12px;border:1px solid rgba(125,211,252,.28);background:rgba(8,18,28,.82);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7da0c7;}
    .collection-skill-card__meta{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:8px;font-size:12px;color:#9cbcd9;}
    .collection-skill-card__meta li{padding:4px 8px;border-radius:10px;background:rgba(16,26,36,.72);}
    .collection-skill-card__description{margin:0;color:#e6f2ff;font-size:13px;line-height:1.6;}
    .collection-skill-card__notes{margin:0;padding-left:18px;color:#9cbcd9;font-size:12px;line-height:1.5;display:flex;flex-direction:column;gap:4px;}
    .collection-skill-card__empty{margin:0;color:#9cbcd9;font-size:13px;line-height:1.6;background:rgba(12,22,32,.88);border:1px dashed rgba(125,211,252,.28);border-radius:14px;padding:16px;text-align:center;}
    .collection-skill-overlay__notes{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#9cbcd9;}
    .collection-skill-overlay__notes li{position:relative;padding-left:16px;}
    .collection-skill-overlay__notes li::before{content:'•';position:absolute;left:0;color:#7da0c7;}
    @media(max-width:1080px){
      .collection-view__layout{grid-template-columns:1fr;}
      .collection-skill-overlay{position:fixed;top:50%;left:50%;transform:translate(-50%,calc(-50% + 12px));width:88vw;min-height:0;}
      .collection-skill-overlay.is-open{transform:translate(-50%,-50%);}
    }
    @media(max-width:720px){
      .collection-view__title{font-size:30px;}
      .collection-skill-overlay__content{grid-template-columns:1fr;}
    }
  `;

  if (style.textContent !== css){
    style.textContent = css;
  }
}

function cloneRoster(input){
  if (!Array.isArray(input) || input.length === 0){
    return ROSTER.map(unit => ({ ...unit }));
  }
  return input.map(entry => ({ ...entry }));
}

function buildRosterWithCost(rosterSource){
  const costs = new Map(UNITS.map(unit => [unit.id, unit.cost]));
  return rosterSource.map(entry => ({
    ...entry,
    cost: Number.isFinite(entry.cost) ? entry.cost : (costs.get(entry.id) ?? null)
  }));
}

function resolveCurrencyBalance(currencyId, providedCurrencies, playerState){
  const tryExtract = candidate => {
    if (candidate == null) return null;
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate;
    if (typeof candidate === 'string' && candidate.trim() !== '' && !Number.isNaN(Number(candidate))){
      return Number(candidate);
    }
    if (typeof candidate === 'object'){
      if (Number.isFinite(candidate.balance)) return candidate.balance;
      if (Number.isFinite(candidate.amount)) return candidate.amount;
      if (Number.isFinite(candidate.value)) return candidate.value;
    }
    return null;
  };

  const inspectContainer = container => {
    if (!container) return null;
    if (Array.isArray(container)){
      for (const entry of container){
        if (!entry) continue;
        const id = entry.id || entry.currencyId || entry.key;
        if (id === currencyId){
          const extracted = tryExtract(entry.balance ?? entry.amount ?? entry.value ?? entry.total ?? entry);
          if (extracted != null) return extracted;
        }
      }
      return null;
    }
    if (typeof container === 'object'){
      if (currencyId in container){
        const extracted = tryExtract(container[currencyId]);
        if (extracted != null) return extracted;
      }
      if (container.balances && currencyId in container.balances){
        const extracted = tryExtract(container.balances[currencyId]);
        if (extracted != null) return extracted;
      }
    }
    return null;
  };

  const fromProvided = inspectContainer(providedCurrencies);
  if (fromProvided != null) return fromProvided;
  const fromState = inspectContainer(playerState?.currencies);
  if (fromState != null) return fromState;
  return 0;
}

function describeUlt(unit){
  return unit?.name ? `Bộ kỹ năng của ${unit.name}.` : 'Chọn nhân vật để xem mô tả chi tiết.';
}

const TARGET_LABELS = {
  single: 'Đơn mục tiêu',
  singleTarget: 'Đơn mục tiêu',
  randomEnemies: 'Địch ngẫu nhiên',
  randomRow: 'Một hàng ngẫu nhiên',
  randomColumn: 'Một cột ngẫu nhiên',
  allEnemies: 'Toàn bộ địch',
  allAllies: 'Toàn bộ đồng minh',
  allies: 'Đồng minh',
  self: 'Bản thân',
  'self+2allies': 'Bản thân + 2 đồng minh'
};

const ABILITY_TYPE_LABELS = {
  basic: 'Đánh thường',
  active: 'Kĩ năng',
  ultimate: 'Tuyệt kỹ',
  talent: 'Thiên phú',
  technique: 'Tuyệt học',
  passive: 'Nội tại'
};

function formatResourceCost(cost){
  if (!cost || typeof cost !== 'object') return 'Không tốn tài nguyên';
  const parts = [];
  for (const [key, value] of Object.entries(cost)){
    if (!Number.isFinite(value)) continue;
    const label = key === 'aether' ? 'Aether' : key.replace(/_/g, ' ');
    parts.push(`${value} ${label}`);
  }
  return parts.length ? parts.join(' + ') : 'Không tốn tài nguyên';
}

function formatDuration(duration){
  if (!duration) return null;
  if (typeof duration === 'number') return `Hiệu lực ${duration} lượt`;
  if (typeof duration === 'string'){
    return duration === 'battle' ? 'Hiệu lực tới hết trận' : null;
  }
  const parts = [];
  if (duration.turns === 'battle'){
    parts.push('Hiệu lực tới hết trận');
  } else if (Number.isFinite(duration.turns)){
    parts.push(`Hiệu lực ${duration.turns} lượt`);
  }
  if (duration.start === 'nextTurn'){
    parts.push('Bắt đầu từ lượt kế tiếp');
  }
  if (Number.isFinite(duration.bossModifier) && Number.isFinite(duration.turns)){
    const bossTurns = Math.max(1, Math.floor(duration.turns * duration.bossModifier));
    parts.push(`Boss PvE: ${bossTurns} lượt`);
  }
  if (duration.affectedStat){
    parts.push(`Ảnh hưởng: ${duration.affectedStat}`);
  }
  return parts.length ? parts.join(' · ') : null;
}

function formatTargetLabel(target){
  if (target == null) return null;
  if (typeof target === 'number'){
    return `Nhắm tới ${target} mục tiêu`;
  }
  const key = target.toString();
  return TARGET_LABELS[key] || key;
}

function formatSummonSummary(summon){
  if (!summon || typeof summon !== 'object') return null;
  const parts = [];
  if (Number.isFinite(summon.count)){
    parts.push(`Triệu hồi ${summon.count} đơn vị`);
  } else {
    parts.push('Triệu hồi đơn vị');
  }
  if (summon.placement || summon.pattern){
    parts.push(`ô ${summon.placement || summon.pattern}`);
  }
  if (summon.limit != null){
    parts.push(`giới hạn ${summon.limit}`);
  }
  const ttl = summon.ttlTurns ?? summon.ttl;
  if (Number.isFinite(ttl) && ttl > 0){
    parts.push(`tồn tại ${ttl} lượt`);
  }
  if (summon.replace){
    parts.push(`thay ${summon.replace}`);
  }
  if (summon.inherit && typeof summon.inherit === 'object'){
    const inheritParts = [];
    for (const [stat, value] of Object.entries(summon.inherit)){
      if (!Number.isFinite(value)) continue;
      inheritParts.push(`${Math.round(value * 100)}% ${stat.toUpperCase()}`);
    }
    if (inheritParts.length){
      parts.push(`kế thừa ${inheritParts.join(', ')}`);
    }
  }
  return parts.join(' · ');
}

function formatReviveSummary(revive){
  if (!revive || typeof revive !== 'object') return null;
  const parts = [];
  const targets = Number.isFinite(revive.targets) ? revive.targets : 1;
  parts.push(`Hồi sinh ${targets} đồng minh`);
  if (revive.priority){
    parts.push(`ưu tiên ${revive.priority}`);
  }
  if (Number.isFinite(revive.hpPercent)){
    parts.push(`HP ${Math.round(revive.hpPercent * 100)}%`);
  }
  if (Number.isFinite(revive.ragePercent)){
    parts.push(`Nộ ${Math.round(revive.ragePercent * 100)}%`);
  }
  if (Number.isFinite(revive.lockSkillsTurns)){
    parts.push(`Khoá kỹ năng ${revive.lockSkillsTurns} lượt`);
  }
  return parts.join(' · ');
}

function formatLinksSummary(links){
  if (!links || typeof links !== 'object') return null;
  const parts = [];
  if (Number.isFinite(links.sharePercent)){
    parts.push(`Chia ${Math.round(links.sharePercent * 100)}% sát thương`);
  }
  if (links.maxConcurrent != null){
    parts.push(`tối đa ${links.maxConcurrent} mục tiêu`);
  }
  return parts.join(' · ');
}

function formatTagLabel(tag){
  if (typeof tag !== 'string') return '';
  return tag.replace(/-/g, ' ');
}

function labelForAbility(entry, fallback){
  const type = entry?.type;
  if (type && ABILITY_TYPE_LABELS[type]) return ABILITY_TYPE_LABELS[type];
  return fallback || 'Kĩ năng';
}

function collectAbilityFacts(entry){
  const facts = [];
  if (entry?.cost && typeof entry.cost === 'object'){
    const formattedCost = formatResourceCost(entry.cost);
    if (formattedCost) facts.push(`Chi phí: ${formattedCost}`);
  }
  if (typeof entry?.hits === 'number' && entry.hits > 0){
    facts.push(`${entry.hits} hit`);
  }
  const targetLabel = formatTargetLabel(entry?.targets ?? entry?.target);
  if (targetLabel){
    facts.push(`Mục tiêu: ${targetLabel}`);
  }
  const duration = formatDuration(entry?.duration);
  if (duration){
    facts.push(duration);
  }
  if (Number.isFinite(entry?.limitUses)){
    facts.push(`Giới hạn: ${entry.limitUses} lần`);
  }
  if (entry?.lockout){
    facts.push(`Khoá: ${entry.lockout === 'battle' ? 'đến hết trận' : entry.lockout}`);
  }
  if (Number.isFinite(entry?.maxStacks)){
    facts.push(`Tối đa ${entry.maxStacks} tầng`);
  }
  if (Array.isArray(entry?.tags) && entry.tags.length){
    facts.push(`Tag: ${entry.tags.map(formatTagLabel).join(', ')}`);
  }
  const summon = formatSummonSummary(entry?.summon);
  if (summon){
    facts.push(summon);
  }
  const revive = formatReviveSummary(entry?.revive);
  if (revive){
    facts.push(revive);
  }
  const links = formatLinksSummary(entry?.links);
  if (links){
    facts.push(`Liên kết: ${links}`);
  }
  return facts;
}

function renderAbilityCard(entry, { typeLabel } = {}){
  const card = document.createElement('article');
  card.className = 'collection-skill-card';

  const header = document.createElement('header');
  header.className = 'collection-skill-card__header';

  const title = document.createElement('h4');
  title.className = 'collection-skill-card__title';
  title.textContent = entry?.name || 'Kĩ năng';
  header.appendChild(title);

  const badge = document.createElement('span');
  badge.className = 'collection-skill-card__badge';
  badge.textContent = typeLabel || labelForAbility(entry);
  header.appendChild(badge);

  card.appendChild(header);

  const facts = collectAbilityFacts(entry);
  if (facts.length){
    const metaList = document.createElement('ul');
    metaList.className = 'collection-skill-card__meta';
    for (const fact of facts){
      const item = document.createElement('li');
      item.textContent = fact;
      metaList.appendChild(item);
    }
    card.appendChild(metaList);
  }

  const desc = document.createElement('p');
  desc.className = 'collection-skill-card__description';
  desc.textContent = entry?.description || 'Chưa có mô tả chi tiết.';
  card.appendChild(desc);

  if (Array.isArray(entry?.notes) && entry.notes.length){
    const notesList = document.createElement('ul');
    notesList.className = 'collection-skill-card__notes';
    for (const note of entry.notes){
      if (!note) continue;
      const li = document.createElement('li');
      li.textContent = note;
      notesList.appendChild(li);
    }
    card.appendChild(notesList);
  }
  return card;
}

export function renderCollectionView(options = {}){
  const { root, shell, playerState = {}, roster, currencies } = options;
  if (!root){
    throw new Error('renderCollectionView cần một phần tử root hợp lệ.');
  }

  ensureStyles();
  if (typeof root.innerHTML === 'string'){
    root.innerHTML = '';
  }
  if (root.classList){
    root.classList.add('app--collection');
  }

  const cleanups = [];
  const addCleanup = fn => {
    if (typeof fn === 'function') cleanups.push(fn);
  };

  const container = document.createElement('div');
  container.className = 'collection-view';

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
  const rosterEntries = new Map();

  for (const unit of rosterSource){
    const item = document.createElement('li');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'collection-roster__entry';
    button.dataset.unitId = unit.id;

    const avatar = document.createElement('div');
    avatar.className = 'collection-roster__avatar';
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

    const meta = document.createElement('div');
    meta.className = 'collection-roster__meta';

    const name = document.createElement('p');
    name.className = 'collection-roster__name';
    name.textContent = unit.name || unit.id;

    const tag = document.createElement('span');
    tag.className = 'collection-roster__tag';
    tag.textContent = [unit.rank, unit.class].filter(Boolean).join(' • ');

    const cost = document.createElement('span');
    cost.className = 'collection-roster__cost';
    const costValue = Number.isFinite(unit.cost) ? unit.cost : '—';
    cost.textContent = `Cost ${costValue}`;

    meta.appendChild(name);
    meta.appendChild(tag);

    button.appendChild(avatar);
    button.appendChild(meta);
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

  const overlayVisual = document.createElement('div');
  overlayVisual.className = 'collection-skill-overlay__visual';

  const overlaySprite = document.createElement('img');
  overlaySprite.alt = '';
  overlayVisual.appendChild(overlaySprite);

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

  overlayDetails.appendChild(overlaySubtitle);
  overlayDetails.appendChild(overlaySummary);
  overlayDetails.appendChild(overlayNotesList);
  overlayDetails.appendChild(overlayAbilities);

  overlayContent.appendChild(overlayVisual);
  overlayContent.appendChild(overlayDetails);

  overlay.appendChild(overlayHeader);
  overlay.appendChild(overlayContent);

  stage.appendChild(stageInfo);
  stage.appendChild(stageArt);
  stage.appendChild(stageStatus);
  stage.appendChild(overlay);

  const tabs = document.createElement('aside');
  tabs.className = 'collection-tabs';

  const tabsTitle = document.createElement('h2');
  tabsTitle.className = 'collection-tabs__title';
  tabsTitle.textContent = 'Danh sách tab';
  tabs.appendChild(tabsTitle);

  const tabButtons = new Map();
  let activeTab = 'awakening';

  const setActiveTab = key => {
    activeTab = key;
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
    }
  };

  const handleTabClick = key => {
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

  const selectUnit = unitId => {
    if (!unitId || !rosterEntries.has(unitId)) return;
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
      overlaySprite.src = art.sprite.src;
      overlaySprite.alt = unit?.name || unitId;
    } else {
      stageSprite.removeAttribute('src');
      stageSprite.alt = '';
      stageSprite.style.opacity = '0';
      overlaySprite.removeAttribute('src');
      overlaySprite.alt = '';
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
    const abilityEntries = [];
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
        overlayAbilities.appendChild(renderAbilityCard(ability.entry, { typeLabel: ability.label }));
      }
    } else {
      const placeholder = document.createElement('p');
      placeholder.className = 'collection-skill-card__empty';
      placeholder.textContent = 'Chưa có dữ liệu kỹ năng chi tiết cho nhân vật này.';
      overlayAbilities.appendChild(placeholder);
    }

    if (activeTab === 'skills'){
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

  setActiveTab(activeTab);

  return {
    destroy(){
      for (const fn of cleanups.splice(0, cleanups.length)){
        try {
          fn();
        } catch (error) {
          console.error('[collection] cleanup error', error);
        }
      }
      if (container.parentNode === root){
        root.removeChild(container);
      }
      if (root.classList){
        root.classList.remove('app--collection');
      }
    }
  };
}

export default renderCollectionView;