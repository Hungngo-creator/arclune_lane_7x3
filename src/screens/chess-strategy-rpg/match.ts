import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import {
  createIrregularBoard,
  MIN_CORE_SIZE,
  randomSeedText,
  resolvePlayerUnits,
  resolveValidSeed,
} from './battle.ts';
import { createRngState, nextRngValue } from '../../utils/rng.ts';

const STYLE_ID = 'chess-strategy-rpg-match-style';
const MAX_LINEAR_STEPS = 6;

const CSS = /* css */ `
  .app--chess-strategy-rpg-match{min-height:100dvh;padding:16px;box-sizing:border-box;}
  .chess-rpg-match{max-width:1320px;margin:0 auto;min-height:calc(100dvh - 32px);border-radius:20px;border:1px solid rgba(126,208,255,.3);background:linear-gradient(170deg,rgba(8,18,31,.98),rgba(14,35,57,.92));padding:18px;color:#e7f3ff;display:grid;gap:14px;}
  .chess-rpg-match__top{display:flex;align-items:center;justify-content:space-between;gap:10px;}
  .chess-rpg-match__back{border:1px solid rgba(143,198,255,.5);background:rgba(8,19,31,.85);color:#e6f2ff;width:34px;height:34px;display:grid;place-items:center;border-radius:10px;padding:0;cursor:pointer;font-size:18px;line-height:1;}
  .chess-rpg-match__meta{font-size:13px;color:#8ec4df;}
  .chess-rpg-match__field{position:relative;overflow:auto;border:1px solid rgba(121,187,228,.32);border-radius:14px;background:radial-gradient(circle at 35% 20%, rgba(43,106,146,.26), rgba(5,13,23,.95));padding:12px;min-height:78dvh;display:grid;align-content:start;justify-content:start;}
  .chess-rpg-match__board{display:grid;gap:2px;align-self:start;justify-self:start;background:rgba(8,20,29,.82);padding:8px;border-radius:12px;border:1px solid rgba(131,213,255,.2);}
  .chess-rpg-match__cell{width:var(--chess-cell-size, 42px);height:var(--chess-cell-size, 42px);border-radius:8px;border:1px solid rgba(145,198,228,.2);display:grid;place-items:center;font-size:11px;}
  .chess-rpg-match__cell--void{opacity:.2;border-style:dashed;}
  .chess-rpg-match__cell--play{background:rgba(22,66,92,.56);}
  .chess-rpg-match__cell--player{background:rgba(26,117,90,.74);border-color:rgba(130,255,219,.6);font-weight:700;color:#95ffd9;}
  .chess-rpg-match__cell--enemy{background:rgba(126,42,72,.68);border-color:rgba(255,149,196,.56);font-weight:700;color:#ffc3dd;}
  .chess-rpg-match__cell--selected{outline:2px solid rgba(255,229,142,.96);outline-offset:-2px;}
  .chess-rpg-match__cell--move{background:rgba(50,170,83,.72);border-color:rgba(150,255,176,.94);color:#e8fff0;cursor:pointer;}
  .chess-rpg-match__turn{margin:0;font-size:13px;color:#bce2ff;}
  .chess-rpg-match__pieces{display:flex;flex-wrap:wrap;gap:6px;}
  .chess-rpg-match__piece{font-size:12px;border:1px solid rgba(161,216,255,.4);border-radius:999px;padding:2px 8px;background:rgba(31,74,107,.5);color:#e6f3ff;}
  .chess-rpg-match__piece--active{border-color:rgba(163,255,183,.78);background:rgba(43,121,72,.52);color:#ebffef;}
`;

interface RenderContext {
  readonly root: HTMLElement;
  readonly shell?: { enterScreen?: (screenId: string) => void } | null;
  readonly params?: Record<string, unknown> | null;
}

type PieceType = 'rook' | 'knight' | 'bishop';

interface UnitState {
  id: string;
  label: string;
  x: number;
  y: number;
  pieces: PieceType[];
}

const PIECE_LABEL: Record<PieceType, string> = {
  rook: 'Xe',
  knight: 'Ngựa',
  bishop: 'Tượng',
};

function hashSeedText(seedText: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < seedText.length; i += 1) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

function numberParam(input: unknown, fallback = 1): number {
  const value = Number(input);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.floor(value));
}

function keyOf(x: number, y: number): string {
  return `${x},${y}`;
}

function parseKey(key: string): { x: number; y: number } | null {
  const [rawX, rawY] = key.split(',');
  const x = Number(rawX);
  const y = Number(rawY);
  if (!Number.isInteger(x) || !Number.isInteger(y)) return null;
  return { x, y };
}

function randomPieces(seed: string, unitId: string): PieceType[] {
  const pool: PieceType[] = ['rook', 'knight', 'bishop'];
  const rng = createRngState(hashSeedText(`${seed}:${unitId}`));
  const picks: PieceType[] = [];
  for (let i = 0; i < 3; i += 1) {
    const index = Math.floor(nextRngValue(rng) * pool.length);
    picks.push(pool[index] ?? 'rook');
  }
  return picks;
}

function collectLinearMoves(
  origin: { x: number; y: number },
  vectors: Array<{ dx: number; dy: number }>,
  playable: Set<string>,
  occupied: Set<string>,
): string[] {
  const moves: string[] = [];
  for (const vector of vectors) {
    for (let step = 1; step <= MAX_LINEAR_STEPS; step += 1) {
      const x = origin.x + vector.dx * step;
      const y = origin.y + vector.dy * step;
      const key = keyOf(x, y);
      if (!playable.has(key)) break;
      if (occupied.has(key)) break;
      moves.push(key);
    }
  }
  return moves;
}

function resolveReachableCells(unit: UnitState, playable: Set<string>, occupied: Set<string>): Set<string> {
  const unique = new Set<string>();
  const origin = { x: unit.x, y: unit.y };
  for (const piece of unit.pieces) {
    if (piece === 'rook') {
      const options = collectLinearMoves(origin, [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
      ], playable, occupied);
      options.forEach((move) => unique.add(move));
      continue;
    }
    if (piece === 'bishop') {
      const options = collectLinearMoves(origin, [
        { dx: 1, dy: 1 },
        { dx: 1, dy: -1 },
        { dx: -1, dy: 1 },
        { dx: -1, dy: -1 },
      ], playable, occupied);
      options.forEach((move) => unique.add(move));
      continue;
    }
    const knightOffsets = [
      { dx: 1, dy: 2 },
      { dx: 1, dy: -2 },
      { dx: -1, dy: 2 },
      { dx: -1, dy: -2 },
      { dx: 2, dy: 1 },
      { dx: 2, dy: -1 },
      { dx: -2, dy: 1 },
      { dx: -2, dy: -1 },
    ];
    for (const offset of knightOffsets) {
      const targetKey = keyOf(origin.x + offset.dx, origin.y + offset.dy);
      if (!playable.has(targetKey) || occupied.has(targetKey)) continue;
      unique.add(targetKey);
    }
  }
  return unique;
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
      <div class="chess-rpg-match__meta">Trận chính · Seed ${seed} · Tu vi ${realm} · Xe/Tượng đi tối đa ${MAX_LINEAR_STEPS} ô mỗi lượt.</div>
    </div>
    <p class="chess-rpg-match__turn" data-role="turn"></p>
    <div class="chess-rpg-match__pieces" data-role="pieces"></div>
    <div class="chess-rpg-match__field">
      <div class="chess-rpg-match__board" data-role="board"></div>
    </div>
  `;

  const boardHost = section.querySelector('[data-role="board"]');
  const backButton = section.querySelector('.chess-rpg-match__back');
  const turnHost = section.querySelector('[data-role="turn"]');
  const piecesHost = section.querySelector('[data-role="pieces"]');

  if (boardHost instanceof HTMLElement) {
    const board = createIrregularBoard(seed);
    const viewportWidth = Math.max(320, root.clientWidth || window.innerWidth || 360);
    const availableWidth = Math.max(240, viewportWidth - 72);
    const cellSize = Math.max(30, Math.floor(availableWidth / board.width));
    boardHost.style.setProperty('--chess-cell-size', `${cellSize}px`);
    boardHost.style.gridTemplateColumns = `repeat(${board.width}, var(--chess-cell-size))`;
    const coreStart = Math.floor((board.width - MIN_CORE_SIZE) / 2);
    const lineupSlots = [
      `${coreStart},${coreStart}`,
      `${coreStart + 1},${coreStart}`,
      `${coreStart + 2},${coreStart}`,
      `${coreStart + 3},${coreStart}`,
      `${coreStart},${coreStart + 1}`,
      `${coreStart + 1},${coreStart + 1}`,
      `${coreStart + 2},${coreStart + 1}`,
      `${coreStart + 3},${coreStart + 1}`,
    ];
    const unitsState: UnitState[] = units
      .slice(0, lineupSlots.length)
      .map((unit, index) => {
        const parsed = parseKey(lineupSlots[index] ?? '');
        return parsed
          ? {
              id: unit.id,
              label: `P${index + 1}`,
              x: parsed.x,
              y: parsed.y,
              pieces: randomPieces(seed, unit.id),
            }
          : null;
      })
      .filter((item): item is UnitState => item !== null);

    let turnIndex = 0;
    let selectedUnitId = unitsState[0]?.id ?? null;
    const reachableById = new Map<string, Set<string>>();

    const renderBoard = (): void => {
      boardHost.innerHTML = '';
      const occupied = new Set(unitsState.map((unit) => keyOf(unit.x, unit.y)));

      for (let y = 0; y < board.height; y += 1) {
        for (let x = 0; x < board.width; x += 1) {
          const key = keyOf(x, y);
          const cell = document.createElement('div');
          cell.dataset.coord = key;
          cell.className = board.playable.has(key)
            ? 'chess-rpg-match__cell chess-rpg-match__cell--play'
            : 'chess-rpg-match__cell chess-rpg-match__cell--void';

  const unit = unitsState.find((entry) => entry.x === x && entry.y === y);
          if (unit) {
            cell.className = 'chess-rpg-match__cell chess-rpg-match__cell--player';
            cell.textContent = unit.label;
            if (unit.id === selectedUnitId) {
              cell.classList.add('chess-rpg-match__cell--selected');
            }
          }

          const currentUnit = unitsState[turnIndex] ?? null;
          const canMoveTo = currentUnit ? reachableById.get(currentUnit.id)?.has(key) : false;
          if (canMoveTo) {
            cell.classList.add('chess-rpg-match__cell--move');
          }

          if (board.playable.has(key)) {
            cell.addEventListener('click', () => {
              const actingUnit = unitsState[turnIndex] ?? null;
              if (!actingUnit) return;
              const target = unitsState.find((entry) => entry.x === x && entry.y === y);
              if (target) {
                if (target.id === actingUnit.id) {
                  selectedUnitId = actingUnit.id;
                  renderHUD();
                  renderBoard();
                }
                return;
              }
              if (!reachableById.get(actingUnit.id)?.has(key)) return;
              actingUnit.x = x;
              actingUnit.y = y;
              selectedUnitId = actingUnit.id;
              turnIndex = unitsState.length > 0 ? (turnIndex + 1) % unitsState.length : 0;
              prepareReachable();
              renderHUD();
              renderBoard();
            });
          }
          boardHost.appendChild(cell);
        }
      }
    };

  const renderHUD = (): void => {
      const active = unitsState[turnIndex] ?? null;
      if (turnHost instanceof HTMLElement) {
        turnHost.textContent = active
          ? `Đến lượt ${active.label}. Chọn ô xanh lá để di chuyển, xong sẽ tự qua lượt tiếp theo.`
          : 'Không có nhân vật khả dụng.';
      }
  if (piecesHost instanceof HTMLElement) {
        piecesHost.innerHTML = '';
        if (active) {
          active.pieces.forEach((piece) => {
            const pill = document.createElement('span');
            pill.className = 'chess-rpg-match__piece chess-rpg-match__piece--active';
            pill.textContent = PIECE_LABEL[piece];
            piecesHost.appendChild(pill);
          });
        }
      }
    };

    const prepareReachable = (): void => {
      reachableById.clear();
      const active = unitsState[turnIndex] ?? null;
      if (!active) return;
      const occupied = new Set(unitsState.map((unit) => keyOf(unit.x, unit.y)));
      occupied.delete(keyOf(active.x, active.y));
      reachableById.set(active.id, resolveReachableCells(active, board.playable, occupied));
    };

    prepareReachable();
    renderHUD();
    renderBoard();
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
