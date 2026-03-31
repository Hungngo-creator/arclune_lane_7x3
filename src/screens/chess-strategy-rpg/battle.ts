import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { getMetaById, getUnitKitById } from '../../catalog.ts';
import { makeInstanceStats } from '../../meta.ts';
import { loadPlayerProfile } from '../../utils/player-profile.ts';
import { createRngState, nextRngValue } from '../../utils/rng.ts';
import { listCultivationRealmOptions } from '../../cultivation.ts';

const STYLE_ID = 'chess-strategy-rpg-battle-style';
const BOARD_CELL_BASE_SIZE = 38;
const BOARD_CELL_SCALE = 4;
const BOARD_CELL_SIZE = BOARD_CELL_BASE_SIZE * BOARD_CELL_SCALE;

const CSS = /* css */ `
  .app--chess-strategy-rpg-battle{min-height:100dvh;padding:16px;box-sizing:border-box;}
  .chess-rpg-battle{max-width:1200px;margin:0 auto;min-height:calc(100dvh - 32px);border-radius:20px;border:1px solid rgba(126,208,255,.26);background:linear-gradient(170deg,rgba(10,18,30,.95),rgba(10,28,40,.92));padding:20px;color:#e7f3ff;display:grid;gap:16px;}
  .chess-rpg-battle__back{justify-self:start;border:1px solid rgba(143,198,255,.5);background:rgba(8,19,31,.85);color:#e6f2ff;width:34px;height:34px;display:grid;place-items:center;border-radius:10px;padding:0;cursor:pointer;font-size:18px;line-height:1;}
  .chess-rpg-battle__hubs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
  .chess-hub{border:1px solid rgba(145,208,255,.24);background:rgba(13,31,45,.8);border-radius:16px;min-height:138px;padding:14px;display:grid;gap:10px;align-content:flex-start;}
  .chess-hub__title{margin:0;text-transform:uppercase;letter-spacing:.04em;font-size:14px;color:#d8ecff;}
  .chess-hub__text{margin:0;color:#9dc8eb;font-size:13px;line-height:1.45;}
  .chess-hub--center{border-color:rgba(250,205,106,.56);background:linear-gradient(175deg,rgba(62,45,17,.78),rgba(22,32,45,.86));}
  .chess-hub__action{width:max-content;border:1px solid rgba(246,198,99,.66);background:linear-gradient(140deg,#f9cb84,#f0a85e);color:#2b2211;border-radius:11px;padding:8px 12px;cursor:pointer;font-weight:800;}
  .chess-hub__realm{display:grid;gap:8px;}
  .chess-hub__seed-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
  .chess-hub__seed{
    flex:1 1 200px;
    background:rgba(6,13,22,.8);
    border:1px solid rgba(189,221,255,.25);
    color:#eff7ff;
    border-radius:10px;
    padding:7px 10px;
    font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
    letter-spacing:.04em;
    text-transform:uppercase;
  }
  .chess-hub__seed-random{
    border:1px solid rgba(189,221,255,.35);
    background:rgba(13,46,73,.82);
    color:#dff0ff;
    border-radius:9px;
    padding:6px 10px;
    cursor:pointer;
    font-weight:700;
  }
  .chess-hub__seed-help{margin:0;color:#9dc8eb;font-size:12px;line-height:1.4;}
  .chess-hub__select{background:rgba(6,13,22,.8);border:1px solid rgba(189,221,255,.25);color:#eff7ff;border-radius:10px;padding:7px 10px;}
  .chess-hub__ok{width:max-content;border:1px solid rgba(189,221,255,.35);background:rgba(13,46,73,.82);color:#dff0ff;border-radius:9px;padding:6px 12px;cursor:pointer;font-weight:700;}
  .chess-rpg-battle__meta{font-size:13px;color:#8ec4df;}
  .chess-rpg-battle__board-viewport{
    align-self:start;
    justify-self:start;
    width:min(100%, 1040px);
    min-height:420px;
    max-height:72dvh;
    overflow:auto;
    border-radius:12px;
    border:1px solid rgba(131,213,255,.2);
    background:rgba(8,20,29,.82);
    padding:8px;
    touch-action:pan-x pan-y;
    -webkit-overflow-scrolling:touch;
  }
  .chess-rpg-battle__board{display:grid;gap:2px;align-self:start;justify-self:start;}
  .chess-rpg-battle__cell{width:${BOARD_CELL_SIZE}px;height:${BOARD_CELL_SIZE}px;border-radius:8px;border:1px solid rgba(145,198,228,.2);display:grid;place-items:center;font-size:${Math.round(11 * BOARD_CELL_SCALE)}px;}
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
  readonly shell?: { enterScreen?: (screenId: string, params?: Record<string, unknown>) => void } | null;
}

export interface BattleUnit {
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

export interface BattleBoard {
  width: number;
  height: number;
  playable: Set<string>;
}

export const MIN_SEED_LENGTH = 8;
export const MIN_CORE_SIZE = 13;
export const MIN_CORE_VOID = 20;
export const MIN_OUTER_RANDOM_TILES = 48;
const BOARD_SIZE = 23;

const sanitizeSeed = (raw: string): string => raw.replace(/[^a-z0-9]/gi, '').toUpperCase();

const hashSeedText = (seedText: string): number => {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < seedText.length; i += 1) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
};

export const randomSeedText = (length = MIN_SEED_LENGTH): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)] ?? 'A';
  }
  return result;
};

const pickFromPool = (rng: { seed: number; calls: number }, pool: string[], count: number): string[] => {
  const clone = [...pool];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(nextRngValue(rng) * (i + 1));
    const current = clone[i];
    const picked = clone[j];
    if (typeof current !== 'string' || typeof picked !== 'string') continue;
    clone[i] = picked;
    clone[j] = current;
  }
  return clone.slice(0, Math.max(0, Math.min(count, clone.length)));
};

export function createIrregularBoard(seedText: string): BattleBoard {
  const width = BOARD_SIZE;
  const height = BOARD_SIZE;
  const playable = new Set<string>();
  const rng = createRngState(hashSeedText(seedText));

  const coreStart = Math.floor((width - MIN_CORE_SIZE) / 2);
  const coreEnd = coreStart + MIN_CORE_SIZE - 1;

  for (let y = coreStart; y <= coreEnd; y += 1) {
    for (let x = coreStart; x <= coreEnd; x += 1) {
      playable.add(`${x},${y}`);
    }
  }

 const protectedCoreSlots = new Set<string>([
    `${coreStart},${coreStart}`,
    `${coreStart + 1},${coreStart}`,
    `${coreStart + 2},${coreStart}`,
    `${coreStart + 3},${coreStart}`,
    `${coreStart},${coreStart + 1}`,
    `${coreStart + 1},${coreStart + 1}`,
    `${coreEnd},${coreEnd}`,
    `${coreEnd - 1},${coreEnd}`,
    `${coreEnd - 2},${coreEnd}`,
    `${coreEnd - 3},${coreEnd}`,
  ]);

  const coreCandidates: string[] = [];
  for (let y = coreStart; y <= coreEnd; y += 1) {
    for (let x = coreStart; x <= coreEnd; x += 1) {
      const key = `${x},${y}`;
      if (!protectedCoreSlots.has(key)) coreCandidates.push(key);
    }
  }

  const coreVoids = pickFromPool(rng, coreCandidates, MIN_CORE_VOID);
  for (const key of coreVoids) playable.delete(key);

  const outerCandidates: string[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const key = `${x},${y}`;
      if (playable.has(key)) continue;
      const isOutsideCore = x < coreStart || x > coreEnd || y < coreStart || y > coreEnd;
      if (isOutsideCore) outerCandidates.push(key);
    }
  }

  const bonusOuterCount = MIN_OUTER_RANDOM_TILES + Math.floor(nextRngValue(rng) * 16);
  const outerTiles = pickFromPool(rng, outerCandidates, bonusOuterCount);
  for (const key of outerTiles) playable.add(key);

  return { width, height, playable };
}

function realmMultiplier(fromRealm: number, toRealm: number): number {
  const diff = toRealm - fromRealm;
  return Math.max(0.55, 1 + diff * 0.06);
}

export function resolveValidSeed(rawValue: string): string {
  const compact = sanitizeSeed(rawValue);
  if (compact.length >= MIN_SEED_LENGTH) return compact;
  const padLength = MIN_SEED_LENGTH - compact.length;
  return `${compact}${randomSeedText(Math.max(0, padLength))}`;
}

export function resolvePlayerUnits(targetRealm: number): BattleUnit[] {
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

function renderBattleBoard(host: HTMLElement, units: BattleUnit[], seedText: string): void {
  const board = createIrregularBoard(seedText);
  const coreStart = Math.floor((board.width - MIN_CORE_SIZE) / 2);
  const coreEnd = coreStart + MIN_CORE_SIZE - 1;
  const playerSlots = [
    `${coreStart},${coreStart}`,
    `${coreStart + 1},${coreStart}`,
    `${coreStart + 2},${coreStart}`,
    `${coreStart + 3},${coreStart}`,
    `${coreStart},${coreStart + 1}`,
    `${coreStart + 1},${coreStart + 1}`,
  ];
  const enemySlots = [
    `${coreEnd},${coreEnd}`,
    `${coreEnd - 1},${coreEnd}`,
    `${coreEnd - 2},${coreEnd}`,
    `${coreEnd - 3},${coreEnd}`,
  ];

  host.style.gridTemplateColumns = `repeat(${board.width}, ${BOARD_CELL_SIZE}px)`;
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

  const realmOptions = listCultivationRealmOptions().map((option) => ({
    value: option.realm,
    label: option.name,
  }));

  let selectedRealm = realmOptions[0]?.value ?? 1;
  let selectedSeed = randomSeedText();

  const section = document.createElement('section');
  section.className = 'chess-rpg-battle';
  const mount = mountSection({ root, section, rootClasses: 'app--chess-strategy-rpg-battle' });

  section.innerHTML = `
    <button type="button" class="chess-rpg-battle__back" aria-label="Về màn ready">←</button>
    <div class="chess-rpg-battle__hubs">
      <article class="chess-hub">
        <h2 class="chess-hub__title">Hub trái</h2>
        <p class="chess-hub__text">Slot hub độc lập cho rule/modifier theo map. V1 để placeholder.</p>
      </article>
      <article class="chess-hub chess-hub--center">
        <h2 class="chess-hub__title">Hub giữa · Chọn map tu vi</h2>
        <button class="chess-hub__action" type="button" data-role="open-realm">⚔️ Mở chọn map</button>
        <div class="chess-hub__realm" data-role="realm-wrap" hidden>
         <div class="chess-hub__seed-row">
            <input class="chess-hub__seed" data-role="seed-input" type="text" minlength="${MIN_SEED_LENGTH}" maxlength="32" value="${selectedSeed}" placeholder="Nhập seed chữ+số (>= ${MIN_SEED_LENGTH})" />
            <button class="chess-hub__seed-random" type="button" data-role="seed-random">Random seed</button>
          </div>
          <p class="chess-hub__seed-help">Seed dạng chữ+số, tối thiểu ${MIN_SEED_LENGTH} ký tự. Map lõi 9x9 có ít nhất ${MIN_CORE_VOID} ô lõm + tối thiểu ${MIN_OUTER_RANDOM_TILES} ô ngoài lõi.</p>
          <select class="chess-hub__select" data-role="realm-select">
            ${realmOptions.map((option) => `<option value="${option.value}">${option.label}</option>`).join('')}
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
    <div class="chess-rpg-battle__board-viewport" data-role="board-viewport">
      <div class="chess-rpg-battle__board" data-role="board"></div>
    </div>
    <div class="chess-rpg-battle__cards" data-role="cards"></div>
  `;

  const backButton = section.querySelector('.chess-rpg-battle__back');
  const openButton = section.querySelector('[data-role="open-realm"]');
  const realmWrap = section.querySelector('[data-role="realm-wrap"]');
  const realmSelect = section.querySelector('[data-role="realm-select"]');
  const seedInput = section.querySelector('[data-role="seed-input"]');
  const randomSeedButton = section.querySelector('[data-role="seed-random"]');
  const okButton = section.querySelector('[data-role="realm-ok"]');
  const boardHost = section.querySelector('[data-role="board"]');
  const boardViewport = section.querySelector('[data-role="board-viewport"]');
  const cardsHost = section.querySelector('[data-role="cards"]');
  const metaHost = section.querySelector('[data-role="meta"]');

  const syncSeedInput = (seed: string): void => {
    if (seedInput instanceof HTMLInputElement) seedInput.value = seed;
  };

  const refreshPreview = () => {
    const validSeed = resolveValidSeed(selectedSeed);
    syncSeedInput(validSeed);
    selectedSeed = validSeed;
    const boardPreview = createIrregularBoard(validSeed);

    const units = resolvePlayerUnits(selectedRealm);
    if (metaHost instanceof HTMLElement) {
      const realmLabel = realmOptions.find((option) => option.value === selectedRealm)?.label ?? `Cảnh giới ${selectedRealm}`;
      metaHost.textContent = `Đang mô phỏng trận tại ${realmLabel} · seed ${validSeed}. Bàn cờ vuông ${boardPreview.width}x${boardPreview.height}, lõi ${MIN_CORE_SIZE}x${MIN_CORE_SIZE} có ít nhất ${MIN_CORE_VOID} ô lõm ngẫu nhiên, ngoài lõi thêm tối thiểu ${MIN_OUTER_RANDOM_TILES} ô ngẫu nhiên.`;
    }

    if (boardHost instanceof HTMLElement) {
      renderBattleBoard(boardHost, units, validSeed);
      if (boardViewport instanceof HTMLElement) {
        requestAnimationFrame(() => {
          const maxScrollLeft = Math.max(0, boardViewport.scrollWidth - boardViewport.clientWidth);
          const maxScrollTop = Math.max(0, boardViewport.scrollHeight - boardViewport.clientHeight);
          boardViewport.scrollLeft = Math.floor(maxScrollLeft * 0.5);
          boardViewport.scrollTop = Math.floor(maxScrollTop * 0.18);
        });
      }
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

  const onBack = () => shell?.enterScreen?.('chess-strategy-rpg-ready');
  const onOpen = () => {
    if (realmWrap instanceof HTMLElement) realmWrap.hidden = !realmWrap.hidden;
  };

  const onRealmChange = () => {
    if (!(realmSelect instanceof HTMLSelectElement)) return;
    selectedRealm = Math.max(1, Math.floor(Number(realmSelect.value) || 1));
    refreshPreview();
  };

  const onSeedInputChange = () => {
    if (!(seedInput instanceof HTMLInputElement)) return;
    selectedSeed = seedInput.value;
    refreshPreview();
  };

  const onRandomSeed = () => {
    selectedSeed = randomSeedText(10);
    refreshPreview();
  };

  const onStart = () => {
    const seed = resolveValidSeed(selectedSeed);
    const realm = selectedRealm;
    shell?.enterScreen?.('chess-strategy-rpg-match', { seed, realm });
  };

  backButton?.addEventListener('click', onBack);
  openButton?.addEventListener('click', onOpen);
  realmSelect?.addEventListener('change', onRealmChange);
  seedInput?.addEventListener('input', onSeedInputChange);
  seedInput?.addEventListener('change', onSeedInputChange);
  randomSeedButton?.addEventListener('click', onRandomSeed);
  okButton?.addEventListener('click', onStart);

  refreshPreview();

  return {
    destroy() {
      backButton?.removeEventListener('click', onBack);
      openButton?.removeEventListener('click', onOpen);
      realmSelect?.removeEventListener('change', onRealmChange);
      seedInput?.removeEventListener('input', onSeedInputChange);
      seedInput?.removeEventListener('change', onSeedInputChange);
      randomSeedButton?.removeEventListener('click', onRandomSeed);
      okButton?.removeEventListener('click', onStart);
      mount.destroy();
    },
  };
}

export const render = renderScreen;
