import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { getUnitArt } from '../../art.ts';
import { CLASS_BASE, ROSTER, type ClassName } from '../../catalog.ts';
import { computeFinalStats } from '../../data/roster-preview.ts';

const STYLE_ID = 'monopoly-screen-style';
const BOARD_SIZE = 15;
const MAIN_TRACK_OFFSET = 2;
const MAIN_RING_SIZE = 11;
const MAIN_TRACK_CELLS = 40;
const SIDE_TRACK_COLUMN_HEIGHT = 9;
const SIDE_TRACK_PROTRUSION_CELLS = 8;
const MINI_RING_CELLS = 24;
const MICRO_RING_CELLS = 8;
const TOTAL_CELLS = MAIN_TRACK_CELLS + SIDE_TRACK_COLUMN_HEIGHT * 4 + SIDE_TRACK_PROTRUSION_CELLS + MINI_RING_CELLS + MICRO_RING_CELLS;
const INNER_COLUMN_HEIGHT = 9;
const ISO_TILE_WIDTH = 48;
const ISO_TILE_HEIGHT = 24;
const ISO_HALF_WIDTH = ISO_TILE_WIDTH / 2;
const ISO_HALF_HEIGHT = ISO_TILE_HEIGHT / 2;
const ISO_PADDING = 28;
const BOARD_MAX_SCALE = 2.4;
const BOARD_MIN_SCALE = 1;

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
  .monopoly-screen__turn{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    flex-wrap:wrap;
    padding:10px 14px;
    border:1px solid rgba(148, 199, 255, 0.28);
    border-radius:12px;
    background:rgba(8, 21, 37, 0.78);
    color:#d6ebff;
    font-size:14px;
  }
  .monopoly-board{
    width:min(96vw, 1180px);
    max-width:100%;
    height:auto;
    margin:0 auto;
    position:relative;
    overflow:visible;
    --tile-w:${ISO_TILE_WIDTH}px;
    --tile-h:${ISO_TILE_HEIGHT}px;
    --tile-font:10px;
  }
  .monopoly-cell{
    position:absolute;
    width:var(--tile-w);
    height:var(--tile-h);
    border:1px solid rgba(130, 168, 210, 0.4);
    background:rgba(22, 34, 49, 0.88);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,0.03);
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:var(--tile-font);
    letter-spacing:0.02em;
    user-select:none;
    transform:translate(-50%, -50%);
    clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }
  .monopoly-cell--main{ background:rgba(24,44,68,0.95); }
  .monopoly-cell--lane{ background:rgba(39,33,67,0.95); }
  .monopoly-cell--connector{ background:rgba(52,39,26,0.96); }
  .monopoly-cell--mini{ background:rgba(28,78,72,0.96); }
  .monopoly-cell--micro{ background:rgba(98,38,111,0.96); }
  .monopoly-avatar{
    position:absolute;
    transform:translate(-50%, -108%);
    width:38px;
    height:38px;
    border-radius:12px;
    border:1px solid rgba(226, 242, 255, 0.68);
    background:rgba(6, 18, 31, 0.3);
    display:flex;
    align-items:center;
    justify-content:center;
    overflow:visible;
    z-index:4;
    animation:avatarFloat 1.1s ease-in-out infinite alternate;
    box-shadow:0 4px 10px rgba(0,0,0,0.42);
  }
  .monopoly-avatar__portrait{
    width:100%;
    height:100%;
    border-radius:12px;
    overflow:hidden;
  }
  .monopoly-avatar img{
    width:100%;
    height:100%;
    object-fit:cover;
  }
  .monopoly-avatar--dead{
    filter:grayscale(0.9);
    opacity:0.5;
  }
  .monopoly-avatar__tag{
    position:absolute;
    top:-27px;
    left:50%;
    transform:translateX(-50%);
    border-radius:999px;
    padding:1px 7px;
    font-size:9px;
    text-transform:uppercase;
    letter-spacing:0.06em;
    color:#f0f7ff;
    background:rgba(20, 68, 112, 0.92);
    border:1px solid rgba(170, 220, 255, 0.55);
  }
  .monopoly-avatar--player .monopoly-avatar__tag{
    background:rgba(18, 114, 66, 0.95);
    border-color:rgba(127, 255, 187, 0.56);
  }
  .monopoly-avatar__hp{
    position:absolute;
    left:50%;
    top:-14px;
    transform:translateX(-50%);
    width:40px;
    height:5px;
    border-radius:999px;
    background:rgba(5, 12, 21, 0.9);
    border:1px solid rgba(160, 205, 255, 0.48);
    overflow:hidden;
  }
  .monopoly-avatar__hp-fill{
  display:block;
    width:100%;
    height:100%;
    background:linear-gradient(90deg, #2ddf78 0%, #21c767 48%, #13a84f 100%);
    transform-origin:left center;
  }
  @keyframes avatarFloat {
    from { transform:translate(-50%, -108%) translateY(0); }
    to { transform:translate(-50%, -108%) translateY(-4px); }
  }
`;

export interface BoardCell {
  readonly index: number;
  readonly row: number;
  readonly col: number;
  readonly track: 'main' | 'lane' | 'connector' | 'mini' | 'micro';
}

interface IsometricCellLayout {
  readonly x: number;
  readonly y: number;
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

  const pushRow = (row: number, track: 'lane' | 'connector') => {
    for (let col = MAIN_TRACK_OFFSET + 1; col <= MAIN_TRACK_OFFSET + INNER_COLUMN_HEIGHT; col += 1) {
      lanes.push({ index: index++, row, col, track });
    }
  };

  pushColumn(0, 'connector');
  pushRow(0, 'lane');
  pushRow(14, 'lane');
  pushColumn(14, 'connector');

  const protrusions: Array<{ row: number; col: number; track: 'lane' | 'connector' }> = [
   { row: 3, col: 1, track: 'connector' },
    { row: 11, col: 1, track: 'connector' },
    { row: 1, col: 3, track: 'lane' },
    { row: 1, col: 11, track: 'lane' },
    { row: 3, col: 13, track: 'connector' },
    { row: 11, col: 13, track: 'connector' },
    { row: 13, col: 3, track: 'lane' },
    { row: 13, col: 11, track: 'lane' }
  ];
  for (const protrusion of protrusions) {
    lanes.push({ index: index++, ...protrusion });
  }

  const expectedLaneCells = SIDE_TRACK_COLUMN_HEIGHT * 4 + SIDE_TRACK_PROTRUSION_CELLS;
  if (lanes.length !== expectedLaneCells) {
    throw new Error(`Lane phụ sai số ô: ${lanes.length}/${expectedLaneCells}`);
  }
  return lanes;
}

function generateMiniRing(mainTrack: ReadonlyArray<BoardCell>, startIndex: number): BoardCell[] {
  const getMain = (indexOneBased: number): BoardCell => {
    const cell = mainTrack[indexOneBased - 1];
    if (!cell) {
      throw new Error(`Không tìm thấy ô bàn chính #${indexOneBased} để tạo bàn mini`);
    }
    return cell;
  };

  const topLeft = { row: getMain(39).row, col: getMain(3).col };
  const topRight = { row: getMain(13).row, col: getMain(9).col };
  const bottomRight = { row: getMain(19).row, col: getMain(23).col };
  const bottomLeft = { row: getMain(33).row, col: getMain(29).col };

  if (
    topLeft.row !== topRight.row ||
    bottomLeft.row !== bottomRight.row ||
    topLeft.col !== bottomLeft.col ||
    topRight.col !== bottomRight.col
  ) {
    throw new Error('Bốn góc bàn mini không tạo thành hình vuông hợp lệ');
  }

  const miniCells: BoardCell[] = [];
  let index = startIndex;

  for (let col = topLeft.col; col <= topRight.col; col += 1) {
    miniCells.push({ index: index++, row: topLeft.row, col, track: 'mini' });
  }
  for (let row = topLeft.row + 1; row <= bottomRight.row; row += 1) {
    miniCells.push({ index: index++, row, col: topRight.col, track: 'mini' });
  }
  for (let col = bottomRight.col - 1; col >= bottomLeft.col; col -= 1) {
    miniCells.push({ index: index++, row: bottomRight.row, col, track: 'mini' });
  }
  for (let row = bottomLeft.row - 1; row > topLeft.row; row -= 1) {
    miniCells.push({ index: index++, row, col: topLeft.col, track: 'mini' });
  }

  if (miniCells.length !== MINI_RING_CELLS) {
    throw new Error(`Bàn mini sai số ô: ${miniCells.length}/${MINI_RING_CELLS}`);
  }

  return miniCells;
}

function generateMicroRing(cells: ReadonlyArray<BoardCell>, startIndex: number): BoardCell[] {
  const getCell = (indexOneBased: number): BoardCell => {
    const cell = cells[indexOneBased - 1];
    if (!cell) {
      throw new Error(`Không tìm thấy ô #${indexOneBased} để tạo vòng cờ vi mô`);
    }
    return cell;
  };

  const miniCells = cells.filter(cell => cell.track === 'mini');
  const miniRows = miniCells.map(cell => cell.row);
  const miniCols = miniCells.map(cell => cell.col);
  const miniMinRow = Math.min(...miniRows);
  const miniMaxRow = Math.max(...miniRows);
  const miniMinCol = Math.min(...miniCols);
  const miniMaxCol = Math.max(...miniCols);

  const pickIntersection = (first: number, second: number): { row: number; col: number } => {
    const a = getCell(first);
    const b = getCell(second);
    const candidates = [
      { row: a.row, col: b.col },
      { row: b.row, col: a.col }
    ];
    const chosen = candidates.find(point => (
      point.row > miniMinRow &&
      point.row < miniMaxRow &&
      point.col > miniMinCol &&
      point.col < miniMaxCol
    ));
    if (!chosen) {
      throw new Error(`Không tìm được giao điểm nằm trong bàn mini cho cặp (${first}, ${second})`);
    }
    return chosen;
  };

  const anchors = [
    pickIntersection(99, 95),
    pickIntersection(101, 105),
    pickIntersection(107, 87),
    pickIntersection(89, 93)
  ];

  const rows = anchors.map(point => point.row);
  const cols = anchors.map(point => point.col);
  const top = Math.min(...rows);
  const bottom = Math.max(...rows);
  const left = Math.min(...cols);
  const right = Math.max(...cols);

  const expectedCorners = new Set([
    `${top},${left}`,
    `${top},${right}`,
    `${bottom},${right}`,
    `${bottom},${left}`
  ]);
  const actualCorners = new Set(anchors.map(point => `${point.row},${point.col}`));
  if (expectedCorners.size !== actualCorners.size || [...expectedCorners].some(key => !actualCorners.has(key))) {
    throw new Error('Bốn giao điểm yêu cầu không tạo được khung vuông cho vòng cờ vi mô');
  }

  const microCells: BoardCell[] = [];
  let index = startIndex;
  for (let col = left; col <= right; col += 1) {
    microCells.push({ index: index++, row: top, col, track: 'micro' });
  }
  for (let row = top + 1; row <= bottom; row += 1) {
    microCells.push({ index: index++, row, col: right, track: 'micro' });
  }
  for (let col = right - 1; col >= left; col -= 1) {
    microCells.push({ index: index++, row: bottom, col, track: 'micro' });
  }
  for (let row = bottom - 1; row > top; row -= 1) {
    microCells.push({ index: index++, row, col: left, track: 'micro' });
  }

  if (microCells.length !== MICRO_RING_CELLS) {
    throw new Error(`Vòng cờ vi mô sai số ô: ${microCells.length}/${MICRO_RING_CELLS}`);
  }

  return microCells;
}

function buildMonopolyBoardCells(): ReadonlyArray<BoardCell> {
  const mainTrack = generateMainTrackCells();
  const innerLanes = generateInnerLanes(mainTrack.length);
  const miniRing = generateMiniRing(mainTrack, mainTrack.length + innerLanes.length);
  const microRing = generateMicroRing([...mainTrack, ...innerLanes, ...miniRing], mainTrack.length + innerLanes.length + miniRing.length);
  const cells = [...mainTrack, ...innerLanes, ...miniRing, ...microRing];
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

function computeIsometricLayout(cells: ReadonlyArray<BoardCell>): {
  readonly width: number;
  readonly height: number;
  readonly byIndex: ReadonlyMap<number, IsometricCellLayout>;
} {
  const raw = new Map<number, IsometricCellLayout>();
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const cell of cells) {
    const x = (cell.col - cell.row) * ISO_HALF_WIDTH;
    const y = (cell.col + cell.row) * ISO_HALF_HEIGHT;
    raw.set(cell.index, { x, y });
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  const byIndex = new Map<number, IsometricCellLayout>();
  for (const cell of cells) {
    const point = raw.get(cell.index);
    if (!point) continue;
    byIndex.set(cell.index, {
      x: point.x - minX + ISO_PADDING + ISO_HALF_WIDTH,
      y: point.y - minY + ISO_PADDING + ISO_HALF_HEIGHT
    });
  }

  return {
    width: maxX - minX + ISO_TILE_WIDTH + ISO_PADDING * 2,
    height: maxY - minY + ISO_TILE_HEIGHT + ISO_PADDING * 2,
    byIndex: byIndex
  };
}

const BOARD_ISOMETRIC_LAYOUT = computeIsometricLayout(BOARD_TEMPLATE);

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

interface MonopolyAvatar {
  readonly id: number;
  readonly role: 'player' | 'npc';
  readonly unitId: string;
  readonly unitName: string;
  readonly stats: {
    hpMax: number;
    ATK: number;
    WIL: number;
    ARM: number;
    RES: number;
  };
  hp: number;
  currentPathIndex: number;
  currentCellOneBased: number;
  hasEnteredBoard: boolean;
  pendingDetourFrom: number | null;
  activeDetourFrom: number | null;
  detourProgress: number;
  readonly node: HTMLDivElement;
  readonly hpFillNode: HTMLSpanElement;
}

const TURN_INTERVAL_MS = 800;
const TURN_ADVANCE_DELAY_MS = 500;
const START_CELL_ONE_BASED = 21;
const AVATAR_COUNT = 8;
const MONOPOLY_RANK = 'SSR' as const;

interface MonopolyAttackEvent {
  attackerId: number;
  targetId: number;
  damage: number;
}

interface MonopolyCombatResolution {
  events: MonopolyAttackEvent[];
  affectedAvatars: number[];
}

function buildMonopolyImportPool(count: number): Array<{ unitId: string; unitName: string; rank: string; className: ClassName }> {
  const ssr = ROSTER.filter(unit => String(unit.rank).toUpperCase() === MONOPOLY_RANK);
  const prime = ROSTER.filter(unit => String(unit.rank).toUpperCase() === 'PRIME');
  const pool = [...ssr, ...prime];
  if (!pool.length) {
    return Array.from({ length: count }, (_, index) => ({
      unitId: `fallback-${index + 1}`,
      unitName: `Avatar ${index + 1}`,
      rank: MONOPOLY_RANK,
      className: 'Warrior' as ClassName
    }));
  }
  return Array.from({ length: count }, (_, index) => {
    const picked = pool[index % pool.length];
    return {
      unitId: picked?.id ?? `fallback-${index + 1}`,
      unitName: picked?.name ?? `Avatar ${index + 1}`,
      rank: picked?.rank ?? MONOPOLY_RANK,
      className: (picked?.class && picked.class in CLASS_BASE ? picked.class : 'Warrior') as ClassName
    };
  });
}

const clampRatio = (value: number): number => Math.min(1, Math.max(0, value));

function computeMonopolyBasicDamage(attacker: MonopolyAvatar, defender: MonopolyAvatar): number {
  const attackPower = attacker.stats.ATK + attacker.stats.WIL;
  const defenseRating = ((defender.stats.ARM + defender.stats.RES) / 2) * 0.6;
  return Math.max(1, Math.round(attackPower * (1 - defenseRating)));
}

export function resolveMonopolyCollisionCombat(colliders: ReadonlyArray<MonopolyAvatar>): MonopolyCombatResolution {
  if (colliders.length < 2) return { events: [], affectedAvatars: [] };
  const living = colliders.filter(avatar => avatar.hp > 0);
  if (living.length < 2) return { events: [], affectedAvatars: [] };
  const events: MonopolyAttackEvent[] = [];
  const incoming = new Map<number, number>();

  for (const attacker of living) {
    for (const defender of living) {
      if (attacker.id === defender.id) continue;
      const damage = computeMonopolyBasicDamage(attacker, defender);
      events.push({ attackerId: attacker.id, targetId: defender.id, damage });
      incoming.set(defender.id, (incoming.get(defender.id) ?? 0) + damage);
    }
  }

  const affectedAvatars: number[] = [];
  for (const avatar of living) {
    const totalIncoming = incoming.get(avatar.id) ?? 0;
    if (totalIncoming <= 0) continue;
    avatar.hp = Math.max(0, avatar.hp - totalIncoming);
    affectedAvatars.push(avatar.id);
  }

  return { events, affectedAvatars };
}

const MAIN_TRACK_PATH_ORDER = Array.from({ length: MAIN_TRACK_CELLS }, (_, offset) => ((START_CELL_ONE_BASED - 1 + offset) % MAIN_TRACK_CELLS) + 1);
const MAIN_TRACK_INDEX_BY_CELL = new Map(MAIN_TRACK_PATH_ORDER.map((cell, idx) => [cell, idx]));

const DETOUR_PATHS: Readonly<Record<number, Readonly<{ exitCellOneBased: number; path: ReadonlyArray<number> }>>> = Object.freeze({
  2: Object.freeze({ exitCellOneBased: 12, path: Object.freeze([79, 50, 51, 52, 53, 54, 55, 56, 57, 58, 80]) }),
  12: Object.freeze({ exitCellOneBased: 22, path: Object.freeze([81, 68, 69, 70, 71, 72, 73, 74, 75, 76, 82]) }),
  22: Object.freeze({ exitCellOneBased: 32, path: Object.freeze([84, 67, 66, 65, 64, 63, 62, 61, 60, 59, 83]) }),
  32: Object.freeze({ exitCellOneBased: 2, path: Object.freeze([78, 49, 48, 47, 46, 45, 44, 43, 42, 41, 77]) })
});

export interface MonopolyMovementState {
  currentPathIndex: number;
  currentCellOneBased: number;
  pendingDetourFrom: number | null;
  activeDetourFrom: number | null;
  detourProgress: number;
}

export function advanceMonopolyMovement(state: MonopolyMovementState, dice: number): MonopolyMovementState {
  const next: MonopolyMovementState = { ...state };

  if (next.pendingDetourFrom != null && next.activeDetourFrom == null) {
    next.activeDetourFrom = next.pendingDetourFrom;
    next.pendingDetourFrom = null;
    next.detourProgress = -1;
  }

  let stepsLeft = dice;
  while (stepsLeft > 0) {
    if (next.activeDetourFrom != null) {
      const detour = DETOUR_PATHS[next.activeDetourFrom];
      if (!detour) {
        next.activeDetourFrom = null;
        next.detourProgress = -1;
        continue;
      }

      if (next.detourProgress < detour.path.length - 1) {
        next.detourProgress += 1;
        next.currentCellOneBased = detour.path[next.detourProgress] ?? next.currentCellOneBased;
        stepsLeft -= 1;
        continue;
      }

      next.currentCellOneBased = detour.exitCellOneBased;
      next.activeDetourFrom = null;
      next.detourProgress = -1;
      const exitPathIndex = MAIN_TRACK_INDEX_BY_CELL.get(detour.exitCellOneBased);
      if (typeof exitPathIndex === 'number') {
        next.currentPathIndex = exitPathIndex;
      }
      stepsLeft -= 1;
      continue;
    }

    next.currentPathIndex = (next.currentPathIndex + 1) % MAIN_TRACK_PATH_ORDER.length;
    next.currentCellOneBased = MAIN_TRACK_PATH_ORDER[next.currentPathIndex] ?? START_CELL_ONE_BASED;
    stepsLeft -= 1;
  }

  if (next.activeDetourFrom == null && DETOUR_PATHS[next.currentCellOneBased]) {
    next.pendingDetourFrom = next.currentCellOneBased;
  }

  return next;
}

const randomInt = (minInclusive: number, maxInclusive: number): number => {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
};

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
  meta.innerHTML = `<span>Bàn chính: ${MAIN_TRACK_CELLS} ô</span><span>Lane phụ: ${SIDE_TRACK_COLUMN_HEIGHT * 4 + SIDE_TRACK_PROTRUSION_CELLS} ô</span><span>Bàn mini: ${MINI_RING_CELLS} ô</span><span>Bàn vi mô: ${MICRO_RING_CELLS} ô</span><span>Tổng: ${TOTAL_CELLS} ô</span>`;
  topbar.appendChild(meta);

  wrapper.appendChild(topbar);

  const turnBanner = document.createElement('div');
  turnBanner.className = 'monopoly-screen__turn';
  turnBanner.textContent = 'Đang chuẩn bị lượt chơi...';
  wrapper.appendChild(turnBanner);

  const board = document.createElement('div');
  board.className = 'monopoly-board';
  board.style.height = `${BOARD_ISOMETRIC_LAYOUT.height}px`;

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const isNarrowViewport = viewportWidth <= 900;
  const initialScale = isNarrowViewport ? 1.5 : 1;
  board.style.setProperty('--tile-w', `${ISO_TILE_WIDTH * initialScale}px`);
  board.style.setProperty('--tile-h', `${ISO_TILE_HEIGHT * initialScale}px`);
  board.style.setProperty('--tile-font', `${Math.max(10, 10 * initialScale)}px`);

  const cellNodes: Array<{ node: HTMLDivElement; cell: BoardCell }> = [];

  const fragment = document.createDocumentFragment();
  for (const cell of BOARD_TEMPLATE) {
    const point = BOARD_ISOMETRIC_LAYOUT.byIndex.get(cell.index);
    if (!point) {
      throw new Error(`Thiếu layout isometric cho ô #${cell.index + 1}`);
    }
    const node = document.createElement('div');
    node.className = `monopoly-cell monopoly-cell--${cell.track}`;
    node.textContent = String(cell.index + 1);
    cellNodes.push({ node, cell });
    fragment.appendChild(node);
  }

  const applyBoardScale = (): void => {
    const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const viewportH = typeof window !== 'undefined' ? window.innerHeight : 720;
    const boardRect = board.getBoundingClientRect();
    const topbarRect = topbar.getBoundingClientRect();

    const horizontalScale = Math.max((viewportW - 24) / BOARD_ISOMETRIC_LAYOUT.width, BOARD_MIN_SCALE);
    const verticalBudget = Math.max(viewportH - topbarRect.height - boardRect.top - 24, BOARD_ISOMETRIC_LAYOUT.height);
    const verticalScale = Math.max(verticalBudget / BOARD_ISOMETRIC_LAYOUT.height, BOARD_MIN_SCALE);
    const scale = Math.min(BOARD_MAX_SCALE, Math.max(BOARD_MIN_SCALE, Math.min(horizontalScale, verticalScale)));

    board.style.height = `${Math.round(BOARD_ISOMETRIC_LAYOUT.height * scale)}px`;
    board.style.setProperty('--tile-w', `${ISO_TILE_WIDTH * scale}px`);
    board.style.setProperty('--tile-h', `${ISO_TILE_HEIGHT * scale}px`);
    board.style.setProperty('--tile-font', `${Math.max(10, 10 * scale)}px`);

    for (const { node, cell } of cellNodes) {
      const cellPoint = BOARD_ISOMETRIC_LAYOUT.byIndex.get(cell.index);
      if (!cellPoint) continue;
      node.style.left = `${cellPoint.x * scale}px`;
      node.style.top = `${cellPoint.y * scale}px`;
    }
  };

  board.appendChild(fragment);

  const playerAvatarId = randomInt(1, AVATAR_COUNT);
  const importedUnits = buildMonopolyImportPool(AVATAR_COUNT);
  const avatars: MonopolyAvatar[] = [];
  for (let avatarId = 1; avatarId <= AVATAR_COUNT; avatarId += 1) {
    const node = document.createElement('div');
    const role = avatarId === playerAvatarId ? 'player' : 'npc';
    node.className = `monopoly-avatar monopoly-avatar--${role}`;
    const imported = importedUnits[avatarId - 1];
    const statBlock = computeFinalStats(imported?.className ?? 'Warrior', MONOPOLY_RANK);
    const hpBarNode = document.createElement('span');
    hpBarNode.className = 'monopoly-avatar__hp';
    const hpFillNode = document.createElement('span');
    hpFillNode.className = 'monopoly-avatar__hp-fill';
    hpBarNode.appendChild(hpFillNode);
    const tagNode = document.createElement('span');
    tagNode.className = 'monopoly-avatar__tag';
    tagNode.textContent = role;
    const portraitFrame = document.createElement('span');
    portraitFrame.className = 'monopoly-avatar__portrait';
    const portrait = document.createElement('img');
    const art = getUnitArt(imported?.unitId ?? null);
    portrait.src = art?.sprite?.src ?? './dist/assets/units/default/default.svg';
    portrait.alt = imported?.unitName ?? `Avatar ${avatarId}`;
    portraitFrame.appendChild(portrait);
    node.append(tagNode, hpBarNode, portraitFrame);
    node.hidden = true;
    board.appendChild(node);
    avatars.push({
      id: avatarId,
      role,
      unitId: imported?.unitId ?? `fallback-${avatarId}`,
      unitName: imported?.unitName ?? `Avatar ${avatarId}`,
      stats: {
        hpMax: Math.max(1, Math.round(statBlock.HP ?? 1)),
        ATK: Math.max(1, Math.round(statBlock.ATK ?? 1)),
        WIL: Math.max(1, Math.round(statBlock.WIL ?? 1)),
        ARM: Math.max(0, Number(statBlock.ARM ?? 0)),
        RES: Math.max(0, Number(statBlock.RES ?? 0))
      },
      hp: Math.max(1, Math.round(statBlock.HP ?? 1)),
      currentPathIndex: 0,
      currentCellOneBased: START_CELL_ONE_BASED,
      hasEnteredBoard: false,
      pendingDetourFrom: null,
      activeDetourFrom: null,
      detourProgress: -1,
      node,
      hpFillNode
    });
  }

  const syncAvatarHealthUi = (avatar: MonopolyAvatar): void => {
    const hpRatio = clampRatio(avatar.hp / avatar.stats.hpMax);
    avatar.hpFillNode.style.transform = `scaleX(${hpRatio})`;
    avatar.node.classList.toggle('monopoly-avatar--dead', avatar.hp <= 0);
  };

  avatars.forEach(syncAvatarHealthUi);

  const moveAvatarToCell = (avatar: MonopolyAvatar, indexOneBased: number): void => {
    const layout = BOARD_ISOMETRIC_LAYOUT.byIndex.get(indexOneBased - 1);
    if (!layout) return;
    const scale = Number.parseFloat(board.style.getPropertyValue('--tile-w')) / ISO_TILE_WIDTH || 1;
    avatar.node.style.left = `${layout.x * scale}px`;
    avatar.node.style.top = `${layout.y * scale}px`;
  };

  let activeTurnIndex = randomInt(0, AVATAR_COUNT - 1);
  let turnTimer: number | null = null;
  let destroyed = false;

  const runTurn = (): void => {
    if (destroyed) return;
    const avatar = avatars[activeTurnIndex];
    if (!avatar) return;
    const dice = randomInt(1, 6);

    if (!avatar.hasEnteredBoard) {
      avatar.currentPathIndex = 0;
      avatar.currentCellOneBased = MAIN_TRACK_PATH_ORDER[0] ?? START_CELL_ONE_BASED;
      avatar.hasEnteredBoard = true;
      avatar.node.hidden = false;
      moveAvatarToCell(avatar, avatar.currentCellOneBased);
    }

    const advanced = advanceMonopolyMovement({
      currentPathIndex: avatar.currentPathIndex,
      currentCellOneBased: avatar.currentCellOneBased,
      pendingDetourFrom: avatar.pendingDetourFrom,
      activeDetourFrom: avatar.activeDetourFrom,
      detourProgress: avatar.detourProgress
    }, dice);

    avatar.currentPathIndex = advanced.currentPathIndex;
    avatar.currentCellOneBased = advanced.currentCellOneBased;
    avatar.pendingDetourFrom = advanced.pendingDetourFrom;
    avatar.activeDetourFrom = advanced.activeDetourFrom;
    avatar.detourProgress = advanced.detourProgress;

    moveAvatarToCell(avatar, avatar.currentCellOneBased);

    const destination = avatar.currentCellOneBased;
    const colliders = avatars.filter(item => item.hasEnteredBoard && item.currentCellOneBased === destination && item.hp > 0);
    const combat = resolveMonopolyCollisionCombat(colliders);
    combat.affectedAvatars.forEach(affectedId => {
      const affected = avatars.find(item => item.id === affectedId);
      if (!affected) return;
      syncAvatarHealthUi(affected);
    });

    const clashCount = colliders.length;
    const combatSummary = combat.events.length > 0
      ? ` • Giao chiến ${clashCount} mục tiêu, ${combat.events.length} đòn thường cùng lúc`
      : '';
    turnBanner.textContent = `Lượt ${avatar.unitName} (${avatar.role.toUpperCase()}) • Xúc xắc: ${dice} • Đến ô ${destination}${combatSummary}`;

    activeTurnIndex = (activeTurnIndex + 1) % AVATAR_COUNT;
    turnTimer = window.setTimeout(runTurn, TURN_INTERVAL_MS + TURN_ADVANCE_DELAY_MS);
  };

  wrapper.appendChild(board);

  applyBoardScale();
  const syncAvatarLayout = (): void => {
    for (const avatar of avatars) {
      if (!avatar.hasEnteredBoard) continue;
      moveAvatarToCell(avatar, avatar.currentCellOneBased);
    }
  };
  const onResize = (): void => {
    applyBoardScale();
    syncAvatarLayout();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onResize);
    runTurn();
  }

  return {
    destroy() {
      destroyed = true;
      if (turnTimer) {
        window.clearTimeout(turnTimer);
      }
      backButton.removeEventListener('click', onBack);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onResize);
      }
      mount.destroy();
    }
  };
}

export const render = renderScreen;
