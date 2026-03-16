import { ensureStyleTag, mountSection } from '../../ui/dom.ts';

const STYLE_ID = 'monopoly-screen-style';
const BOARD_SIZE = 13;
const MAIN_TRACK_OFFSET = 1;
const MAIN_RING_SIZE = 11;
const MAIN_TRACK_CELLS = 40;
const SIDE_TRACK_LENGTH = 10;
const TOTAL_CELLS = MAIN_TRACK_CELLS + SIDE_TRACK_LENGTH * 4;
const INNER_COLUMN_HEIGHT = 9;

const CSS = /* css */ `
  .app--co-ty-phu{
    padding:24px 16px 48px;
  }
  .monopoly-screen{
    max-width:1080px;
    margin:0 auto;
    display:flex;
    flex-direction:column;
    gap:18px;
    color:#e8f2ff;
  }
  .monopoly-screen__topbar{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    flex-wrap:wrap;
  }
  .monopoly-screen__back{
    border:1px solid rgba(148, 199, 255, 0.5);
    background:rgba(10, 20, 33, 0.85);
    border-radius:999px;
    color:#e8f2ff;
    padding:10px 18px;
    cursor:pointer;
  }
  .monopoly-screen__meta{
    display:flex;
    gap:12px;
    font-size:14px;
    color:#9ec3e8;
  }
  .monopoly-board{
    width:min(92vw, 840px);
    aspect-ratio:1/1;
    margin:0 auto;
    display:grid;
    grid-template-columns:repeat(${BOARD_SIZE}, minmax(0,1fr));
    grid-template-rows:repeat(${BOARD_SIZE}, minmax(0,1fr));
    gap:6px;
  }
  .monopoly-cell{
    min-height:42px;
    border-radius:10px;
    border:1px solid rgba(130, 168, 210, 0.4);
    background:rgba(22, 34, 49, 0.88);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,0.03);
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:11px;
    letter-spacing:0.02em;
    user-select:none;
  }
  .monopoly-cell--main{ background:rgba(24,44,68,0.95); }
  .monopoly-cell--lane{ background:rgba(39,33,67,0.95); }
  .monopoly-cell--connector{ background:rgba(52,39,26,0.96); }
`;

export interface BoardCell {
  readonly index: number;
  readonly row: number;
  readonly col: number;
  readonly track: 'main' | 'lane' | 'connector';
}

const CELL_KEY_MULTIPLIER = 100;

function generateMainTrackCells(): BoardCell[] {
  const cells: BoardCell[] = [];
  const start = MAIN_TRACK_OFFSET;
  const end = MAIN_TRACK_OFFSET + MAIN_RING_SIZE - 1;
  let index = 0;

  for (let col = start; col <= end; col += 1) cells.push({ index: index++, row: start, col, track: 'main' });
  for (let row = start + 1; row <= end; row += 1) cells.push({ index: index++, row, col: end, track: 'main' });
  for (let col = end - 1; col >= start; col -= 1) cells.push({ index: index++, row: end, col, track: 'main' });
  for (let row = end - 1; row > start; row -= 1) cells.push({ index: index++, row, col: start, track: 'main' });

  if (cells.length !== MAIN_TRACK_CELLS) {
    throw new Error(`Main track sai số ô: ${cells.length}/${MAIN_TRACK_CELLS}`);
  }

  return cells;
}

function generateInnerLanes(startIndex: number): BoardCell[] {
  const lanes: BoardCell[] = [];
  let index = startIndex;

  const pushColumn = (col: number, track: 'lane' | 'connector') => {
    for (let row = MAIN_TRACK_OFFSET + 1; row <= MAIN_TRACK_OFFSET + INNER_COLUMN_HEIGHT; row += 1) {
      lanes.push({ index: index++, row, col, track });
    }
  };

  // Giảm 1 cột tím (còn 2), tăng chiều cao mỗi cột lane/connector lên 9 ô.
  pushColumn(3, 'connector');
  pushColumn(5, 'lane');
  pushColumn(7, 'lane');
  pushColumn(9, 'connector');

  // Các ô chỉa ra ngoài bàn cờ tương ứng 2-10, 12-20, 22-30 và 32-40.
  const protrusions: Array<{ row: number; col: number; track: 'lane' | 'connector' }> = [
    { row: 0, col: 6, track: 'lane' },
    { row: 6, col: 12, track: 'connector' },
    { row: 12, col: 6, track: 'lane' },
    { row: 6, col: 0, track: 'connector' }
  ];
  for (const protrusion of protrusions) {
    lanes.push({ index: index++, ...protrusion });
  }

  if (lanes.length !== SIDE_TRACK_LENGTH * 4) {
    throw new Error(`Lane phụ sai số ô: ${lanes.length}/${SIDE_TRACK_LENGTH * 4}`);
  }
  return lanes;
}

function buildMonopolyBoardCells(): ReadonlyArray<BoardCell> {
  const mainTrack = generateMainTrackCells();
  const innerLanes = generateInnerLanes(mainTrack.length);
  const cells = [...mainTrack, ...innerLanes];
  if (cells.length !== TOTAL_CELLS) {
    throw new Error(`Tổng số ô bàn cờ sai: ${cells.length}/${TOTAL_CELLS}`);
  }
  const occupied = new Set<number>();
  for (const cell of cells) {
    const key = cell.row * CELL_KEY_MULTIPLIER + cell.col;
    if (occupied.has(key)) {
      throw new Error(`Ô bàn cờ bị trùng tọa độ tại row=${cell.row}, col=${cell.col}`);
    }
    occupied.add(key);
  }
  cells.forEach(cell => Object.freeze(cell));
  return Object.freeze(cells);
}

const BOARD_TEMPLATE = buildMonopolyBoardCells();

export function createMonopolyBoardCells(): ReadonlyArray<BoardCell> {
  return BOARD_TEMPLATE;
}

function ensureStyles(): void {
  ensureStyleTag(STYLE_ID, { css: CSS });
}

interface RenderContext {
  readonly root: HTMLElement;
  readonly shell?: { enterScreen?: (screenId: string) => void } | null;
}

export function renderScreen(context: RenderContext): { destroy: () => void } {
  const { root, shell = null } = context;
  ensureStyles();

  const wrapper = document.createElement('section');
  wrapper.className = 'monopoly-screen';
  const mount = mountSection({ root, section: wrapper });

  const topbar = document.createElement('header');
  topbar.className = 'monopoly-screen__topbar';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'monopoly-screen__back';
  backButton.textContent = '← Thoát cờ tỷ phú';
  const onBack = () => shell?.enterScreen?.('arena-hub');
  backButton.addEventListener('click', onBack);
  topbar.appendChild(backButton);

  const meta = document.createElement('div');
  meta.className = 'monopoly-screen__meta';
  meta.innerHTML = `<span>Bàn chính: ${MAIN_TRACK_CELLS} ô</span><span>Lane phụ: ${SIDE_TRACK_LENGTH * 4} ô</span><span>Tổng: ${TOTAL_CELLS} ô</span>`;
  topbar.appendChild(meta);

  wrapper.appendChild(topbar);

  const board = document.createElement('div');
  board.className = 'monopoly-board';

  const fragment = document.createDocumentFragment();
  for (const cell of BOARD_TEMPLATE) {
    const node = document.createElement('div');
    node.className = `monopoly-cell monopoly-cell--${cell.track}`;
    node.style.gridColumn = String(cell.col + 1);
    node.style.gridRow = String(cell.row + 1);
    node.textContent = String(cell.index + 1);
    fragment.appendChild(node);
  }

  board.appendChild(fragment);
  wrapper.appendChild(board);

  return {
    destroy() {
      backButton.removeEventListener('click', onBack);
      mount.destroy();
    }
  };
}

export const render = renderScreen;
