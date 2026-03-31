import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { getMetaById, getUnitKitById } from '../../catalog.ts';
import { makeInstanceStats } from '../../meta.ts';
import { loadPlayerProfile } from '../../utils/player-profile.ts';

const STYLE_ID = 'chess-strategy-rpg-battle-style';

type RealmOption = {
  value: number;
  label: string;
};

const REALM_OPTIONS: ReadonlyArray<RealmOption> = [
  { value: 1, label: 'Khai Nguyên' },
  { value: 2, label: 'Linh Động' },
  { value: 3, label: 'Địa Nguyên' },
  { value: 4, label: 'Thiên Nguyên' },
  { value: 5, label: 'Thánh Nhân' },
  { value: 6, label: 'Thánh Hoàng' },
  { value: 7, label: 'Thánh Tôn' },
];

const CSS = /* css */ `
  .app--chess-strategy-rpg-battle{min-height:100dvh;padding:16px;box-sizing:border-box;}
  .chess-rpg-battle{max-width:1200px;margin:0 auto;min-height:calc(100dvh - 32px);border-radius:20px;border:1px solid rgba(126,208,255,.26);background:linear-gradient(170deg,rgba(10,18,30,.95),rgba(10,28,40,.92));padding:20px;color:#e7f3ff;display:grid;gap:16px;}
  .chess-rpg-battle__back{justify-self:start;border:1px solid rgba(143,198,255,.5);background:rgba(8,19,31,.85);color:#e6f2ff;border-radius:999px;padding:8px 14px;cursor:pointer;}
  .chess-rpg-battle__hubs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
  .chess-hub{border:1px solid rgba(145,208,255,.24);background:rgba(13,31,45,.8);border-radius:16px;min-height:138px;padding:14px;display:grid;gap:10px;align-content:flex-start;}
  .chess-hub__title{margin:0;text-transform:uppercase;letter-spacing:.04em;font-size:14px;color:#d8ecff;}
  .chess-hub__text{margin:0;color:#9dc8eb;font-size:13px;line-height:1.45;}
  .chess-hub--center{border-color:rgba(250,205,106,.56);background:linear-gradient(175deg,rgba(62,45,17,.78),rgba(22,32,45,.86));}
  .chess-hub__action{width:max-content;border:1px solid rgba(246,198,99,.66);background:linear-gradient(140deg,#f9cb84,#f0a85e);color:#2b2211;border-radius:11px;padding:8px 12px;cursor:pointer;font-weight:800;}
  .chess-hub__realm{display:grid;gap:8px;}
  .chess-hub__select{background:rgba(6,13,22,.8);border:1px solid rgba(189,221,255,.25);color:#eff7ff;border-radius:10px;padding:7px 10px;}
  .chess-hub__ok{width:max-content;border:1px solid rgba(189,221,255,.35);background:rgba(13,46,73,.82);color:#dff0ff;border-radius:9px;padding:6px 12px;cursor:pointer;font-weight:700;}
  .chess-rpg-battle__meta{font-size:13px;color:#8ec4df;}
  .chess-rpg-battle__board{display:grid;gap:2px;align-self:start;justify-self:start;background:rgba(8,20,29,.82);padding:8px;border-radius:12px;border:1px solid rgba(131,213,255,.2);}
  .chess-rpg-battle__cell{width:38px;height:38px;border-radius:8px;border:1px solid rgba(145,198,228,.2);display:grid;place-items:center;font-size:11px;}
  .chess-rpg-battle__cell--void{opacity:.2;border-style:dashed;}
  .chess-rpg-battle__cell--play{background:rgba(22,66,92,.56);}
  .chess-rpg-battle__cell--player{background:rgba(26,117,90,.74);border-color:rgba(130,255,219,.6);font-weight:700;}
  .chess-rpg-battle__cell--enemy{background:rgba(126,42,72,.68);border-color:rgba(255,149,196,.56);font-weight:700;}
  .chess-rpg-battle__cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
  .chess-card{border:1px solid rgba(148,206,255,.2);background:rgba(8,21,32,.78);border-radius:12px;padding:10px;display:grid;gap:4px;}
  .chess-card__name{font-weight:700;}
  .chess-card__stat{font-size:12px;color:#b7dbf2;}
`;

interface RenderContext {
  readonly root: HTMLElement;
  readonly shell?: { enterScreen?: (screenId: string) => void } | null;
}

interface BattleUnit {
  id: string;
  name: string;
  hp: number;
  atk: number;
  wil: number;
  res: number;
  arm: number;
  ae: number;
  kitLabel: string;
}

function createIrregularBoard(): { width: number; height: number; playable: Set<string> } {
  const width = 11;
  const height = 11;
  const playable = new Set<string>();

  for (let y = 2; y <= 8; y += 1) {
    for (let x = 2; x <= 8; x += 1) {
      playable.add(`${x},${y}`);
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const key = `${x},${y}`;
      if (playable.has(key)) continue;
      if (Math.random() > 0.72) playable.add(key);
    }
  }

  return { width, height, playable };
}

function realmMultiplier(fromRealm: number, toRealm: number): number {
  const diff = toRealm - fromRealm;
  return Math.max(0.55, 1 + diff * 0.06);
}

function resolvePlayerUnits(targetRealm: number): BattleUnit[] {
  const profile = loadPlayerProfile();
  const order = Array.isArray(profile.lineupDeck) ? profile.lineupDeck : [];
  const selected = order
    .filter((unitId): unitId is string => typeof unitId === 'string' && unitId.trim().length > 0)
    .slice(0, 4);

  return selected.map((unitId) => {
    const meta = getMetaById(unitId);
    const base = makeInstanceStats(unitId);
    const ownRealm = Math.max(1, Math.floor(profile.cultivationByUnit?.[unitId]?.realm ?? 1));
    const ratio = realmMultiplier(ownRealm, targetRealm);
    const kit = getUnitKitById(unitId) as Record<string, unknown> | null;
    const skills = Array.isArray(kit?.skills) ? kit.skills.length : 0;
    const hasUlt = kit?.ult ? 'có ult' : 'không ult';

    const resolvedName = typeof meta?.name === 'string'
      ? meta.name
      : typeof meta?.id === 'string'
        ? meta.id
        : unitId;

    return {
      id: unitId,
      name: resolvedName,
      hp: Math.max(1, Math.floor(base.hpMax * ratio)),
      atk: Math.max(1, Math.floor(base.atk * ratio)),
      wil: Math.max(1, Math.floor(base.wil * ratio)),
      res: Number((base.res * ratio).toFixed(2)),
      arm: Number((base.arm * ratio).toFixed(2)),
      ae: Math.max(1, Math.floor(base.aeMax * ratio)),
      kitLabel: `${skills} skill, ${hasUlt}`,
    };
  });
}

function renderBattleBoard(host: HTMLElement, units: BattleUnit[]): void {
  const board = createIrregularBoard();
  const playerSlots = ['0,0', '1,0', '2,0', '3,0', '4,0', '0,1', '1,1', '2,1', '3,1', '4,1'];
  const enemySlots = ['10,10', '9,10', '8,10', '7,10'];

  host.style.gridTemplateColumns = `repeat(${board.width}, 38px)`;
  host.innerHTML = '';
  for (let y = 0; y < board.height; y += 1) {
    for (let x = 0; x < board.width; x += 1) {
      const key = `${x},${y}`;
      const cell = document.createElement('div');
      const baseClass = board.playable.has(key)
        ? 'chess-rpg-battle__cell chess-rpg-battle__cell--play'
        : 'chess-rpg-battle__cell chess-rpg-battle__cell--void';
      cell.className = baseClass;

      const playerIndex = playerSlots.indexOf(key);
      if (playerIndex >= 0 && playerIndex < units.length) {
        cell.className = 'chess-rpg-battle__cell chess-rpg-battle__cell--player';
        cell.textContent = `P${playerIndex + 1}`;
      }

      const enemyIndex = enemySlots.indexOf(key);
      if (enemyIndex >= 0) {
        cell.className = 'chess-rpg-battle__cell chess-rpg-battle__cell--enemy';
        cell.textContent = `E${enemyIndex + 1}`;
      }

      host.appendChild(cell);
    }
  }
}

export function renderScreen(context: RenderContext): { destroy: () => void } {
  const { root, shell = null } = context;
  ensureStyleTag(STYLE_ID, { css: CSS });

  let selectedRealm = REALM_OPTIONS[0]?.value ?? 1;
  let lockedRealm = selectedRealm;

  const section = document.createElement('section');
  section.className = 'chess-rpg-battle';
  const mount = mountSection({ root, section, rootClasses: 'app--chess-strategy-rpg-battle' });

  section.innerHTML = `
    <button type="button" class="chess-rpg-battle__back">← Về màn ready</button>
    <div class="chess-rpg-battle__hubs">
      <article class="chess-hub">
        <h2 class="chess-hub__title">Hub trái</h2>
        <p class="chess-hub__text">Slot hub độc lập cho rule/modifier theo map. V1 để placeholder.</p>
      </article>
      <article class="chess-hub chess-hub--center">
        <h2 class="chess-hub__title">Hub giữa · Chọn map tu vi</h2>
        <button class="chess-hub__action" type="button" data-role="open-realm">⚔️ Mở chọn map</button>
        <div class="chess-hub__realm" data-role="realm-wrap" hidden>
          <select class="chess-hub__select" data-role="realm-select">
            ${REALM_OPTIONS.map((option) => `<option value="${option.value}">${option.label}</option>`).join('')}
          </select>
          <button class="chess-hub__ok" type="button" data-role="realm-ok">Bắt đầu</button>
        </div>
      </article>
      <article class="chess-hub">
        <h2 class="chess-hub__title">Hub phải</h2>
        <p class="chess-hub__text">Slot hub độc lập cho thưởng/sự kiện trận. V1 để placeholder.</p>
      </article>
    </div>
    <div class="chess-rpg-battle__meta" data-role="meta">Chưa khóa tu vi trận.</div>
    <div class="chess-rpg-battle__board" data-role="board"></div>
    <div class="chess-rpg-battle__cards" data-role="cards"></div>
  `;

  const backButton = section.querySelector('.chess-rpg-battle__back');
  const openButton = section.querySelector('[data-role="open-realm"]');
  const realmWrap = section.querySelector('[data-role="realm-wrap"]');
  const realmSelect = section.querySelector('[data-role="realm-select"]');
  const okButton = section.querySelector('[data-role="realm-ok"]');
  const boardHost = section.querySelector('[data-role="board"]');
  const cardsHost = section.querySelector('[data-role="cards"]');
  const metaHost = section.querySelector('[data-role="meta"]');

  const onBack = () => shell?.enterScreen?.('chess-strategy-rpg-ready');
  const onOpen = () => {
    if (realmWrap instanceof HTMLElement) realmWrap.hidden = !realmWrap.hidden;
  };

  const onRealmChange = () => {
    if (!(realmSelect instanceof HTMLSelectElement)) return;
    selectedRealm = Math.max(1, Math.floor(Number(realmSelect.value) || 1));
  };

  const onStart = () => {
    lockedRealm = selectedRealm;
    const units = resolvePlayerUnits(lockedRealm);
    if (metaHost instanceof HTMLElement) {
      const realmLabel = REALM_OPTIONS.find((option) => option.value === lockedRealm)?.label ?? `Cảnh giới ${lockedRealm}`;
      metaHost.textContent = `Đang mô phỏng trận tại ${realmLabel}. 4 unit player đã đồng bộ tu vi theo map (đơn vị thấp được nâng, đơn vị cao bị hạ tạm thời), dữ liệu collection gốc không bị thay đổi; unit AI sẽ bổ sung hành vi ở bước sau.`;
    }

    if (boardHost instanceof HTMLElement) {
      renderBattleBoard(boardHost, units);
    }

    if (cardsHost instanceof HTMLElement) {
      cardsHost.innerHTML = units.map((unit, index) => `
        <article class="chess-card">
          <div class="chess-card__name">P${index + 1} · ${unit.name}</div>
          <div class="chess-card__stat">HP ${unit.hp} · ATK ${unit.atk} · WIL ${unit.wil}</div>
          <div class="chess-card__stat">RES ${unit.res} · ARM ${unit.arm} · AE ${unit.ae}</div>
          <div class="chess-card__stat">Kit: ${unit.kitLabel}</div>
        </article>
      `).join('');
    }
  };

  backButton?.addEventListener('click', onBack);
  openButton?.addEventListener('click', onOpen);
  realmSelect?.addEventListener('change', onRealmChange);
  okButton?.addEventListener('click', onStart);

  onStart();

  return {
    destroy() {
      backButton?.removeEventListener('click', onBack);
      openButton?.removeEventListener('click', onOpen);
      realmSelect?.removeEventListener('change', onRealmChange);
      okButton?.removeEventListener('click', onStart);
      mount.destroy();
    },
  };
}

export const render = renderScreen;
