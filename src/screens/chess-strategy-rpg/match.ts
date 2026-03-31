import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import {
  createIrregularBoard,
  MIN_CORE_SIZE,
  randomSeedText,
  resolvePlayerUnits,
  resolveValidSeed,
} from './battle.ts';

const STYLE_ID = 'chess-strategy-rpg-match-style';
const ISO_TILE_W = 56;
const ISO_TILE_H = 30;

const CSS = /* css */ `
  .app--chess-strategy-rpg-match{min-height:100dvh;padding:16px;box-sizing:border-box;}
  .chess-rpg-match{max-width:1320px;margin:0 auto;min-height:calc(100dvh - 32px);border-radius:20px;border:1px solid rgba(126,208,255,.3);background:linear-gradient(170deg,rgba(8,18,31,.98),rgba(14,35,57,.92));padding:18px;color:#e7f3ff;display:grid;gap:14px;}
  .chess-rpg-match__top{display:flex;align-items:center;justify-content:space-between;gap:10px;}
  .chess-rpg-match__back{border:1px solid rgba(143,198,255,.5);background:rgba(8,19,31,.85);color:#e6f2ff;width:34px;height:34px;display:grid;place-items:center;border-radius:10px;padding:0;cursor:pointer;font-size:18px;line-height:1;}
  .chess-rpg-match__meta{font-size:13px;color:#8ec4df;}
  .chess-rpg-match__field{position:relative;overflow:auto;border:1px solid rgba(121,187,228,.32);border-radius:14px;background:radial-gradient(circle at 35% 20%, rgba(43,106,146,.26), rgba(5,13,23,.95));padding:18px;min-height:640px;}
  .chess-rpg-match__iso{position:relative;left:50%;top:44px;transform:translateX(-50%);width:100%;height:560px;}
  .chess-rpg-match__tile{position:absolute;width:${ISO_TILE_W}px;height:${ISO_TILE_H}px;transform:translate(-50%, -50%) skewY(-26deg) scaleY(.86);border-radius:8px;border:1px solid rgba(140,201,236,.22);background:rgba(35,87,116,.4);}
  .chess-rpg-match__tile--void{opacity:.18;border-style:dashed;}
  .chess-rpg-match__tile--player{background:rgba(32,137,96,.88);border-color:rgba(151,255,225,.85);}
  .chess-rpg-match__tile--enemy{background:rgba(170,51,94,.84);border-color:rgba(255,184,217,.84);}
  .chess-rpg-match__unit{position:absolute;transform:translate(-50%, -88%);padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700;background:rgba(4,16,28,.9);border:1px solid rgba(188,225,255,.4);white-space:nowrap;}
  .chess-rpg-match__unit--player{color:#95ffd9;}
  .chess-rpg-match__unit--enemy{color:#ffc3dd;}
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
      <div class="chess-rpg-match__meta">Trận chính · Seed ${seed} · Tu vi mục tiêu ${realm} · Góc nhìn nghiêng kiểu Monopoly.</div>
    </div>
    <div class="chess-rpg-match__field">
      <div class="chess-rpg-match__iso" data-role="iso"></div>
    </div>
  `;

  const isoHost = section.querySelector('[data-role="iso"]');
  const backButton = section.querySelector('.chess-rpg-match__back');

  if (isoHost instanceof HTMLElement) {
    const board = createIrregularBoard(seed);
    const centerX = (board.width * ISO_TILE_W) / 2;
    const centerY = 96;
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
        const isoX = (x - y) * (ISO_TILE_W / 2) + centerX;
        const isoY = (x + y) * (ISO_TILE_H / 2) + centerY;
        const tile = document.createElement('div');
        tile.className = board.playable.has(key)
          ? 'chess-rpg-match__tile'
          : 'chess-rpg-match__tile chess-rpg-match__tile--void';
        tile.style.left = `${isoX}px`;
        tile.style.top = `${isoY}px`;

        const playerIndex = playerSlots.indexOf(key);
        if (playerIndex >= 0 && playerIndex < units.length) {
          tile.className = 'chess-rpg-match__tile chess-rpg-match__tile--player';
          const unit = document.createElement('div');
          unit.className = 'chess-rpg-match__unit chess-rpg-match__unit--player';
          unit.style.left = `${isoX}px`;
          unit.style.top = `${isoY}px`;
          unit.textContent = `P${playerIndex + 1} ${units[playerIndex]?.name ?? ''}`.trim();
          isoHost.appendChild(unit);
        }

        const enemyIndex = enemySlots.indexOf(key);
        if (enemyIndex >= 0) {
          tile.className = 'chess-rpg-match__tile chess-rpg-match__tile--enemy';
          const enemy = document.createElement('div');
          enemy.className = 'chess-rpg-match__unit chess-rpg-match__unit--enemy';
          enemy.style.left = `${isoX}px`;
          enemy.style.top = `${isoY}px`;
          enemy.textContent = `E${enemyIndex + 1}`;
          isoHost.appendChild(enemy);
        }

        isoHost.appendChild(tile);
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
