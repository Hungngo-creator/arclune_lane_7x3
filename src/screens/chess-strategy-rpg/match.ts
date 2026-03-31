import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import {
  createIrregularBoard,
  MIN_CORE_SIZE,
  randomSeedText,
  resolvePlayerUnits,
  resolveValidSeed,
} from './battle.ts';

const STYLE_ID = 'chess-strategy-rpg-match-style';
const MATCH_CELL_SIZE = 38;

const CSS = /* css */ `
  .app--chess-strategy-rpg-match{min-height:100dvh;padding:16px;box-sizing:border-box;}
  .chess-rpg-match{max-width:1320px;margin:0 auto;min-height:calc(100dvh - 32px);border-radius:20px;border:1px solid rgba(126,208,255,.3);background:linear-gradient(170deg,rgba(8,18,31,.98),rgba(14,35,57,.92));padding:18px;color:#e7f3ff;display:grid;gap:14px;}
  .chess-rpg-match__top{display:flex;align-items:center;justify-content:space-between;gap:10px;}
  .chess-rpg-match__back{border:1px solid rgba(143,198,255,.5);background:rgba(8,19,31,.85);color:#e6f2ff;width:34px;height:34px;display:grid;place-items:center;border-radius:10px;padding:0;cursor:pointer;font-size:18px;line-height:1;}
  .chess-rpg-match__meta{font-size:13px;color:#8ec4df;}
  .chess-rpg-match__field{position:relative;overflow:hidden;border:1px solid rgba(121,187,228,.32);border-radius:14px;background:radial-gradient(circle at 35% 20%, rgba(43,106,146,.26), rgba(5,13,23,.95));padding:18px;min-height:640px;display:grid;align-content:start;justify-content:start;}
  .chess-rpg-match__board{display:grid;gap:2px;align-self:start;justify-self:start;background:rgba(8,20,29,.82);padding:8px;border-radius:12px;border:1px solid rgba(131,213,255,.2);}
  .chess-rpg-match__cell{width:${MATCH_CELL_SIZE}px;height:${MATCH_CELL_SIZE}px;border-radius:8px;border:1px solid rgba(145,198,228,.2);display:grid;place-items:center;font-size:11px;}
  .chess-rpg-match__cell--void{opacity:.2;border-style:dashed;}
  .chess-rpg-match__cell--play{background:rgba(22,66,92,.56);}
  .chess-rpg-match__cell--player{background:rgba(26,117,90,.74);border-color:rgba(130,255,219,.6);font-weight:700;color:#95ffd9;}
  .chess-rpg-match__cell--enemy{background:rgba(126,42,72,.68);border-color:rgba(255,149,196,.56);font-weight:700;color:#ffc3dd;}
`;

interface RenderContext {
  readonly root: HTMLElement;
  readonly shell?: { enterScreen?: (screenId: string) => void } | null;
  readonly params?: Record<string, unknown> | null;
}

function numberParam(input: unknown, fallback = 1): number {
  const value = Number(input);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value));
}

export function renderScreen(context: RenderContext): { destroy: () => void } {
  const { root, shell = null, params = null } = context;
  ensureStyleTag(STYLE_ID, { css: CSS });

  const seedInput = typeof params?.seed === 'string' ? params.seed : randomSeedText(10);
  const seed = resolveValidSeed(seedInput);
  const realm = numberParam(params?.realm, 1);
  const units = resolvePlayerUnits(realm);

  const section = document.createElement('section');
  section.className = 'chess-rpg-match';
  const mount = mountSection({ root, section, rootClasses: 'app--chess-strategy-rpg-match' });

  section.innerHTML = `
    <div class="chess-rpg-match__top">
      <button type="button" class="chess-rpg-match__back" aria-label="Về hub mô phỏng">←</button>
      <div class="chess-rpg-match__meta">Trận chính · Seed ${seed} · Tu vi mục tiêu ${realm} · Góc nhìn top-down như màn mô phỏng.</div>
    </div>
    <div class="chess-rpg-match__field">
      <div class="chess-rpg-match__board" data-role="board"></div>
    </div>
  `;

  const boardHost = section.querySelector('[data-role="board"]');
  const backButton = section.querySelector('.chess-rpg-match__back');

  if (boardHost instanceof HTMLElement) {
    const board = createIrregularBoard(seed);
    boardHost.style.gridTemplateColumns = `repeat(${board.width}, ${MATCH_CELL_SIZE}px)`;
    const coreStart = Math.floor((board.width - MIN_CORE_SIZE) / 2);
    const coreEnd = coreStart + MIN_CORE_SIZE - 1;
    const playerSlots = [
      `${coreStart},${coreStart}`,
      `${coreStart + 1},${coreStart}`,
      `${coreStart + 2},${coreStart}`,
      `${coreStart + 3},${coreStart}`,
    ];
    const enemySlots = [
      `${coreEnd},${coreEnd}`,
      `${coreEnd - 1},${coreEnd}`,
      `${coreEnd - 2},${coreEnd}`,
      `${coreEnd - 3},${coreEnd}`,
    ];

    for (let y = 0; y < board.height; y += 1) {
      for (let x = 0; x < board.width; x += 1) {
        const key = `${x},${y}`;
        const cell = document.createElement('div');
        cell.className = board.playable.has(key)
          ? 'chess-rpg-match__cell chess-rpg-match__cell--play'
          : 'chess-rpg-match__cell chess-rpg-match__cell--void';

        const playerIndex = playerSlots.indexOf(key);
        if (playerIndex >= 0 && playerIndex < units.length) {
          cell.className = 'chess-rpg-match__cell chess-rpg-match__cell--player';
          cell.textContent = `P${playerIndex + 1}`;
        }

        const enemyIndex = enemySlots.indexOf(key);
        if (enemyIndex >= 0) {
          cell.className = 'chess-rpg-match__cell chess-rpg-match__cell--enemy';
          cell.textContent = `E${enemyIndex + 1}`;
        }

        boardHost.appendChild(cell);
      }
    }
  }

  const onBack = () => shell?.enterScreen?.('chess-strategy-rpg-battle');
  backButton?.addEventListener('click', onBack);

  return {
    destroy() {
      backButton?.removeEventListener('click', onBack);
      mount.destroy();
    },
  };
}

export const render = renderScreen;
