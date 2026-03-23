import { ensureStyleTag, mountSection } from '../../ui/dom.ts';
import { getUnitArt } from '../../art.ts';
import { CLASS_BASE, ROSTER, type ClassName } from '../../catalog.ts';
import { computeFinalStats } from '../../data/roster-preview.ts';
import {
  applySpiritGainWithHouseOverflow,
  getHouseOwnerEffectSpec,
  collectHouseIncome,
  createRandomHouseSlots,
  getHouseDefinitionById,
  getHouseVisitorPenalty,
  revealHousePurchase,
  settleHouseTraverse,
  shouldTriggerAssassinTaxPunishment,
  upgradeHouse,
  resetHouseSlotsByOwner,
  type HiddenHouseSlot
} from './house-module.ts';

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
  .monopoly-screen__wallet{
    margin-left:auto;
    display:flex;
    flex-direction:column;
    align-items:flex-end;
    gap:8px;
  }
  .monopoly-screen__wallet-currency{
    display:flex;
    align-items:center;
    gap:8px;
  }
  .monopoly-screen__wallet-year{
    min-width:84px;
    text-align:right;
    color:#b8d8ff;
    font-size:12px;
    letter-spacing:0.04em;
    text-transform:uppercase;
  }
  .monopoly-screen__wallet-slot{
    min-width:36px;
    height:28px;
    border-radius:8px;
    border:1px solid rgba(210, 226, 246, 0.4);
    background:rgba(8, 21, 37, 0.78);
    color:#f3f7ff;
    font-size:13px;
    font-weight:700;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:0 8px;
  }
  .monopoly-screen__wallet-slot--silver{
    border-color:rgba(213, 224, 236, 0.66);
    box-shadow:inset 0 0 0 1px rgba(228, 236, 247, 0.18);
  }
  .monopoly-screen__wallet-slot--gold{
    border-color:rgba(246, 214, 123, 0.72);
    box-shadow:inset 0 0 0 1px rgba(255, 226, 145, 0.22);
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
  .monopoly-screen__automation{
    display:flex;
    align-items:center;
    gap:14px;
    flex-wrap:wrap;
    padding:10px 14px;
    border:1px solid rgba(148, 199, 255, 0.2);
    border-radius:12px;
    background:rgba(8, 21, 37, 0.52);
  }
  .monopoly-screen__automation-item{
    display:inline-flex;
    align-items:center;
    gap:8px;
    color:#d6ebff;
    font-size:13px;
    cursor:pointer;
    user-select:none;
  }
  .monopoly-screen__automation-item input{
    accent-color:#73d7b2;
    cursor:pointer;
  }
  .monopoly-inventory{
    position:fixed;
    top:78px;
    right:12px;
    display:flex;
    align-items:center;
    gap:6px;
    z-index:18;
    pointer-events:none;
  }
  .monopoly-inventory__slot{
    width:48px;
    height:48px;
    border-radius:10px;
    border:1px solid rgba(150, 200, 255, 0.58);
    background:rgba(8, 21, 37, 0.88);
    box-shadow:inset 0 0 0 1px rgba(255,255,255,0.08);
    display:flex;
    align-items:center;
    justify-content:center;
    color:#eef6ff;
    font-size:19px;
    line-height:1;
  }
  .monopoly-forge{
    position:fixed;
    top:138px;
    right:12px;
    width:min(320px, calc(100vw - 24px));
    border-radius:14px;
    border:1px solid rgba(180, 134, 76, 0.55);
    background:rgba(28, 17, 9, 0.94);
    box-shadow:0 18px 40px rgba(0,0,0,0.42);
    padding:14px;
    display:flex;
    flex-direction:column;
    gap:10px;
    z-index:20;
  }
  .monopoly-forge__top{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:12px;
  }
  .monopoly-forge__title{
    margin:0;
    font-size:14px;
    color:#ffd8ae;
  }
  .monopoly-forge__copy{
    margin:4px 0 0;
    font-size:12px;
    color:#dcb88e;
    line-height:1.5;
  }
  .monopoly-forge__close{
    border:1px solid rgba(255, 214, 170, 0.4);
    background:rgba(57, 30, 11, 0.95);
    color:#fff0dc;
    border-radius:10px;
    width:30px;
    height:30px;
    cursor:pointer;
    font-size:16px;
    line-height:1;
  }
  .monopoly-forge__list{
    display:flex;
    flex-direction:column;
    gap:8px;
    max-height:260px;
    overflow:auto;
  }
  .monopoly-forge__item{
    border:1px solid rgba(255, 214, 170, 0.24);
    background:rgba(57, 30, 11, 0.72);
    border-radius:10px;
    padding:10px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
  }
  .monopoly-forge__meta{
    display:flex;
    flex-direction:column;
    gap:4px;
    min-width:0;
  }
  .monopoly-forge__name{
    font-size:13px;
    color:#fff4e8;
  }
  .monopoly-forge__desc{
    font-size:11px;
    color:#dcb88e;
  }
  .monopoly-forge__buy{
    border:1px solid rgba(247, 198, 135, 0.45);
    background:rgba(131, 72, 26, 0.92);
    color:#fff5eb;
    border-radius:10px;
    padding:8px 10px;
    cursor:pointer;
    white-space:nowrap;
  }
  .monopoly-forge__foot{
    font-size:11px;
    color:#dcb88e;
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
  .monopoly-cell--event-chaos{
    background:rgba(117, 71, 201, 0.98);
    box-shadow:0 0 0 2px rgba(183, 145, 255, 0.28), inset 0 0 0 1px rgba(255,255,255,0.08);
  }
  .monopoly-cell--event-orchard{
    background:rgba(46, 118, 62, 0.98);
    box-shadow:0 0 0 2px rgba(154, 235, 150, 0.24), inset 0 0 0 1px rgba(255,255,255,0.08);
  }
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
  .monopoly-avatar--spirit{
    opacity:0.45;
    filter:grayscale(0.65) saturate(0.72) brightness(1.15);
    box-shadow:0 0 14px rgba(186, 221, 255, 0.55);
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
  hpMaxCurrent: number;
  hp: number;
  currentPathIndex: number;
  currentCellOneBased: number;
  hasEnteredBoard: boolean;
  pendingDetourFrom: number | null;
  activeDetourFrom: number | null;
  detourProgress: number;
  readonly node: HTMLDivElement;
  readonly hpFillNode: HTMLSpanElement;
  wallet: MonopolyWallet;
  status: MonopolyStatusMetrics;
  spiritCap: number;
  skippedTurnCount: number;
  soulState: 'alive' | 'spirit' | 'dispersed';
  soulExpiresAtYear: number | null;
  autoBuyHouseEnabled: boolean;
  autoUpgradeHouseEnabled: boolean;
  thanhMaoRestrictionActive: boolean;
  forgeInventory: MonopolyForgeItem[];
  sleepingAtThanhMao: boolean;
  exileTrack: 'mini' | 'micro' | null;
  exileLapCount: number;
  mainTrackProxyIndex: number;
}

interface HouseStepSummary {
  paidTax: number;
  ownerCollected: number;
  purchaseLabel: string;
  upgradeLabel: string;
  hazardLabel: string;
  bankruptLabel: string;
  killerAvatarId: number | null;
}

interface MonopolyWallet {
  gold: number;
  silver: number;
}

interface MonopolyStatusMetrics {
  thirst: number;
  hunger: number;
  spirit: number;
}

interface MonopolyAutomationSettings {
  autoBuyHouseEnabled: boolean;
  autoUpgradeHouseEnabled: boolean;
}

interface MonopolyInventoryItem {
  id: string;
  label: string;
  icon: string;
}

interface MonopolyForgeItem {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly priceSilver: number;
  readonly description: string;
  readonly hpBonus: number;
  readonly atkBonus: number;
  readonly wilBonus: number;
}

interface MonopolyForgeShopState {
  ownerAvatarId: number | null;
  closesAtTurnAvatarId: number | null;
  closedManually: boolean;
  offers: MonopolyForgeItem[];
}

interface MonopolyFortuneTarget {
  cellOneBased: number;
  tier: 'major' | 'medium' | 'minor';
}

interface MonopolyYearEventDefinition {
  readonly id: 'drought' | 'famine' | 'inflation' | 'spacetime_chaos' | 'fruit_bounty' | 'vitality';
  readonly name: string;
  readonly description: string;
  readonly durationYears: number;
  readonly cooldownYears: number;
}

export interface MonopolyYearEventDisplayCopy {
  readonly name: string;
  readonly description: string;
}

interface MonopolyYearEventState {
  activeEventId: MonopolyYearEventDefinition['id'] | null;
  activeUntilYear: number;
  cooldownUntilYearByEvent: Partial<Record<MonopolyYearEventDefinition['id'], number>>;
  chaosCells: number[];
  fruitCells: number[];
}

interface MonopolyYearRuleModifiers {
  readonly thirstStepMultiplier: number;
  readonly hungerStepMultiplier: number;
  readonly inflationMultiplier: number;
  readonly healingMultiplier: number;
}

const MONOPOLY_STATUS_CAP = 100;
const MONOPOLY_STATUS_START = 80;
const MONOPOLY_THIRST_DRAIN_PER_STEP = 1.6;
const MONOPOLY_HUNGER_DRAIN_PER_STEP = 1.2;
const MONOPOLY_SPIRIT_DRAIN_PER_STEP = 0.5;
const MONOPOLY_LOW_SPIRIT_DICE_THRESHOLD = 30;
const MONOPOLY_FAINT_SPIRIT_THRESHOLD = 20;
const MONOPOLY_THIRST_HP_THRESHOLD = 10;
const MONOPOLY_HUNGER_HP_THRESHOLD = 10;
const MONOPOLY_THIRST_HP_DRAIN_PER_STEP_RATIO = 0.01;
const MONOPOLY_HUNGER_HP_DRAIN_PER_STEP_RATIO = 0.005;

const MONOPOLY_CURRENCY_RATIO = 100;
const MONOPOLY_WALLET_CAP = 99_999;
const MONOPOLY_STARTING_GOLD = 4;
const MONOPOLY_STARTING_SILVER = 1;
const MONOPOLY_INVENTORY_CAP = 5;
const MONOPOLY_INVENTORY_SLOT_SIZE = 48;
const LAC_DUONG_MANTOU_COST_SILVER = 20;
const LAC_DUONG_MANTOU_HUNGER_GAIN = 10;
const TRUC_LAM_CLUSTER_COUNT = 5;
const TRUC_LAM_CELLS_PER_CLUSTER = 1;
const TRUC_LAM_THIRST_RESTORE_RATIO = 0.1;
const WORLD_RIFT_CLUSTER_COUNT = 1;
const WORLD_RIFT_CLUSTER_SIZE = 7;
const WORLD_RIFT_TELEPORT_CHANCES = Object.freeze([0.1, 0.2, 0.3, 0.4, 0.3, 0.2, 0.1] as const);
const WORLD_RIFT_CENTER_INDEX = Math.floor(WORLD_RIFT_CLUSTER_SIZE / 2);
const TRUC_LAM_MODULE_TOOLTIP = [
  'Trúc Lâm (rừng trúc, nguồn nước dồi dào).',
  `Mỗi ô: chỉ hồi ${Math.round(TRUC_LAM_THIRST_RESTORE_RATIO * 100)}% khát tối đa cho người đạp trúng. Đi ngang không tính.`,
  `Mỗi map random ${TRUC_LAM_CLUSTER_COUNT} cụm, mỗi cụm ${TRUC_LAM_CELLS_PER_CLUSTER} ô liền kề.`
].join(' ');
const WORLD_RIFT_MODULE_TOOLTIP = [
  'Vành Nứt Thế Giới (chỉ xuất hiện 1 cụm mỗi trận, dài 7 ô liền nhau).',
  'Tỉ lệ bị truyền tống khi đi vào từng ô lần lượt là 10/20/30/40/30/20/10.',
  '6 ô ngoài: kích hoạt sẽ truyền tống tới Bí Cảnh ngẫu nhiên (vòng vi mô 8 ô).',
  'Ô giữa: 40% tới Bí Cảnh, 40% tới Quỷ Vực (bàn mini 24 ô), 20% không có gì.',
  'Linh hồn bị truyền tống vào Quỷ Vực sẽ hồi sinh ngay tại đó.'
].join(' ');
const LAC_DUONG_MODULE_TOOLTIP = [
  'Lạc Dương Trấn (chỉ kích hoạt khi đạp trúng ô, đi ngang không tính).',
  'Vào trấn: bắt buộc mua 2 màn thầu (-20 bạc, +10 đói).',
  '20% cơ duyên nhỏ (+1 vàng), 10% gặp thiếu nữ tặng nhẫn đá cũ.',
  'Nhẫn đá cũ: 15% cơ duyên lớn (+5 vàng), 20% cơ duyên vừa (+3 vàng), 25% cơ duyên nhỏ (+1 vàng), 40% không có gì.'
].join(' ');
const LAC_DUONG_RING_ITEM: MonopolyInventoryItem = Object.freeze({
  id: 'old-stone-ring',
  label: 'Nhẫn đá cũ',
  icon: '💍'
});
const MAJOR_FORTUNE_GOLD_REWARD = 5;
const MEDIUM_FORTUNE_GOLD_REWARD = 3;
const MINOR_FORTUNE_GOLD_REWARD = 1;
const THANH_MAO_SON_CLUSTER_SIZE = 3;
const THANH_MAO_TIEU_DIEM_SLEEP_SPIRIT_RATIO = 0.3;
const THANH_MAO_TIEU_DIEM_FOOD_SPIRIT_RATIO = 0.6;
const THANH_MAO_TIEU_DIEM_FOOD_HUNGER_GAIN = 25;
const THANH_MAO_TIEU_DIEM_FOOD_COST_SILVER = 100;
const THANH_MAO_TIEU_DIEM_SLEEP_COST_SILVER = 100;

const MONOPOLY_FORGE_ITEM_POOL: ReadonlyArray<MonopolyForgeItem> = Object.freeze([
  Object.freeze({ id: 'forge-weapon-rustblade', name: 'Thiết Kiếm Cũ', icon: '⚔️', priceSilver: 120, description: '+22 ATK', hpBonus: 0, atkBonus: 22, wilBonus: 0 }),
  Object.freeze({ id: 'forge-amulet-cloud', name: 'Vân Phù', icon: '🜂', priceSilver: 120, description: '+18 WIL', hpBonus: 0, atkBonus: 0, wilBonus: 18 }),
  Object.freeze({ id: 'forge-armor-bark', name: 'Giáp Mộc Sơn', icon: '🛡️', priceSilver: 140, description: '+120 HP', hpBonus: 120, atkBonus: 0, wilBonus: 0 }),
  Object.freeze({ id: 'forge-ring-flame', name: 'Hỏa Văn Giới', icon: '💍', priceSilver: 160, description: '+12 ATK, +12 WIL', hpBonus: 0, atkBonus: 12, wilBonus: 12 }),
  Object.freeze({ id: 'forge-boots-stone', name: 'Thạch Hành Ngoa', icon: '🥾', priceSilver: 100, description: '+60 HP, +8 ATK', hpBonus: 60, atkBonus: 8, wilBonus: 0 }),
  Object.freeze({ id: 'forge-fan-ice', name: 'Hàn Thiết Phiến', icon: '🪭', priceSilver: 130, description: '+10 ATK, +14 WIL', hpBonus: 0, atkBonus: 10, wilBonus: 14 })
]);

export const MONOPOLY_YEAR_EVENT_RULE_SUMMARY = 'Mỗi năm mới luôn kích hoạt đúng 1 sự kiện ngẫu nhiên; không có sự kiện kép và mỗi sự kiện có hồi chiêu 2 năm tính từ lúc kết thúc.';

const MONOPOLY_YEAR_EVENT_DEFINITIONS: ReadonlyArray<MonopolyYearEventDefinition> = Object.freeze([
  Object.freeze({ id: 'drought', name: 'Hạn hán', description: 'Tiêu hao khát mỗi bước di chuyển tăng gấp đôi trong 1 năm.', durationYears: 1, cooldownYears: 2 }),
  Object.freeze({ id: 'famine', name: 'Nạn đói', description: 'Tiêu hao đói mỗi bước di chuyển tăng gấp đôi trong 1 năm.', durationYears: 1, cooldownYears: 2 }),
  Object.freeze({ id: 'inflation', name: 'Lạm phát', description: 'Mua nhà, nâng cấp nhà và thuế tăng 50% trong 1 năm.', durationYears: 1, cooldownYears: 2 }),
  Object.freeze({ id: 'spacetime_chaos', name: 'Thời Không Loạn Lưu', description: 'Xuất hiện 3 ô loạn lưu; đạp trúng sẽ bị dịch chuyển ngẫu nhiên khỏi Quỷ Vực trong 1 năm.', durationYears: 1, cooldownYears: 2 }),
  Object.freeze({ id: 'fruit_bounty', name: 'Cây Trái Được Mùa', description: 'Xuất hiện 5 ô trái cây; đạp trúng nhận +30 đói, +10 khát, +5 tinh thần rồi ô biến mất trong 1 năm.', durationYears: 1, cooldownYears: 2 }),
  Object.freeze({ id: 'vitality', name: 'Sinh lực dồi dào', description: 'Mọi nguồn hồi HP tăng 50% trong 1 năm.', durationYears: 1, cooldownYears: 2 })
]);
const MONOPOLY_YEAR_EVENT_BY_ID = new Map(MONOPOLY_YEAR_EVENT_DEFINITIONS.map(event => [event.id, event]));
const MONOPOLY_FRUIT_BOUNTY_HUNGER_GAIN = 30;
const MONOPOLY_FRUIT_BOUNTY_THIRST_GAIN = 10;
const MONOPOLY_FRUIT_BOUNTY_SPIRIT_GAIN = 5;

const normalizeWalletAmount = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
};

const clampMonopolyStatus = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MONOPOLY_STATUS_CAP, Math.max(0, value));
};

export function createInitialMonopolyStatus(): MonopolyStatusMetrics {
  return {
    thirst: MONOPOLY_STATUS_START,
    hunger: MONOPOLY_STATUS_START,
    spirit: MONOPOLY_STATUS_START
  };
}

export function applyMonopolyStepDrain(
  status: MonopolyStatusMetrics,
  steps: number,
  modifiers: Partial<Pick<MonopolyYearRuleModifiers, 'thirstStepMultiplier' | 'hungerStepMultiplier'>> = {}
): MonopolyStatusMetrics {
  const safeSteps = Math.max(0, Math.floor(steps));
  const thirstStepMultiplier = Number.isFinite(modifiers.thirstStepMultiplier) ? Math.max(0, modifiers.thirstStepMultiplier ?? 1) : 1;
  const hungerStepMultiplier = Number.isFinite(modifiers.hungerStepMultiplier) ? Math.max(0, modifiers.hungerStepMultiplier ?? 1) : 1;
  if (safeSteps <= 0) {
    return {
      thirst: clampMonopolyStatus(status.thirst),
      hunger: clampMonopolyStatus(status.hunger),
      spirit: clampMonopolyStatus(status.spirit)
    };
  }

  return {
    thirst: clampMonopolyStatus(status.thirst - safeSteps * MONOPOLY_THIRST_DRAIN_PER_STEP * thirstStepMultiplier),
    hunger: clampMonopolyStatus(status.hunger - safeSteps * MONOPOLY_HUNGER_DRAIN_PER_STEP * hungerStepMultiplier),
    spirit: clampMonopolyStatus(status.spirit - safeSteps * MONOPOLY_SPIRIT_DRAIN_PER_STEP)
  };
}

export function getMonopolyDiceMaxBySpirit(spirit: number): number {
  return spirit <= MONOPOLY_LOW_SPIRIT_DICE_THRESHOLD ? 3 : 6;
}

export function shouldSkipMonopolyTurnBySpirit(spirit: number): boolean {
  return spirit <= MONOPOLY_FAINT_SPIRIT_THRESHOLD;
}

export function applyMonopolySurvivalHpDrain(
  hp: number,
  hpMax: number,
  status: MonopolyStatusMetrics,
  steps: number
): number {
  const safeSteps = Math.max(0, Math.floor(steps));
  if (!Number.isFinite(hpMax) || hpMax <= 0 || safeSteps <= 0) {
    return Math.max(0, hp);
  }

  let perStepRatio = 0;
  if (status.thirst < MONOPOLY_THIRST_HP_THRESHOLD) {
    perStepRatio += MONOPOLY_THIRST_HP_DRAIN_PER_STEP_RATIO;
  }
  if (status.hunger < MONOPOLY_HUNGER_HP_THRESHOLD) {
    perStepRatio += MONOPOLY_HUNGER_HP_DRAIN_PER_STEP_RATIO;
  }
  if (perStepRatio <= 0) return Math.max(0, hp);

  const hpDrain = hpMax * perStepRatio * safeSteps;
  return Math.max(0, hp - hpDrain);
}

export function normalizeMonopolyWallet(wallet: MonopolyWallet): MonopolyWallet {
  return {
    gold: Math.min(MONOPOLY_WALLET_CAP, normalizeWalletAmount(wallet.gold)),
    silver: Math.min(MONOPOLY_WALLET_CAP, normalizeWalletAmount(wallet.silver))
  };
}

export function refillMonopolySilverIfEmpty(wallet: MonopolyWallet): MonopolyWallet {
  const normalized = normalizeMonopolyWallet(wallet);
  if (normalized.silver > 0 || normalized.gold <= 0) return normalized;
  return {
    gold: normalized.gold - 1,
    silver: MONOPOLY_CURRENCY_RATIO
  };
}

export function createInitialMonopolyWallet(): MonopolyWallet {
  return { gold: MONOPOLY_STARTING_GOLD, silver: MONOPOLY_STARTING_SILVER };
}

export function rollLacDuongEncounter(randomValue: number): 'minor' | 'maiden' | 'none' {
  if (!Number.isFinite(randomValue)) return 'none';
  if (randomValue < 0.2) return 'minor';
  if (randomValue < 0.3) return 'maiden';
  return 'none';
}

export function rollLacDuongRingDestiny(randomValue: number): 'major' | 'medium' | 'minor' | 'none' {
  if (!Number.isFinite(randomValue)) return 'none';
  if (randomValue < 0.15) return 'major';
  if (randomValue < 0.35) return 'medium';
  if (randomValue < 0.6) return 'minor';
  return 'none';
}

export function createThanhMaoSonCluster(
  occupiedCellOneBased: ReadonlySet<number>,
  rng: () => number = Math.random
): number[] {
  const candidates = MAIN_TRACK_PATH_ORDER
    .map((_, startIndex) => [
      MAIN_TRACK_PATH_ORDER[startIndex % MAIN_TRACK_PATH_ORDER.length],
      MAIN_TRACK_PATH_ORDER[(startIndex + 1) % MAIN_TRACK_PATH_ORDER.length],
      MAIN_TRACK_PATH_ORDER[(startIndex + 2) % MAIN_TRACK_PATH_ORDER.length],
    ])
    .filter((cluster): cluster is [number, number, number] => cluster.every((cell): cell is number => typeof cell === 'number' && !occupiedCellOneBased.has(cell)));
  if (candidates.length <= 0) return [];
  const picked = Math.floor(Math.max(0, Math.min(0.999999, rng())) * candidates.length);
  return [...(candidates[picked] ?? candidates[0]!)];
}

export function createThanhMaoSonModuleOrder(rng: () => number = Math.random): Array<'tieu_diem' | 'lo_ren' | 'nui'> {
  return shuffled(['tieu_diem', 'lo_ren', 'nui'] as Array<'tieu_diem' | 'lo_ren' | 'nui'>, rng);
}

export function getThanhMaoSonDiceRange(cluster: ReadonlyArray<number>, currentCellOneBased: number, restrictionActive: boolean): { min: number; max: number } {
  if (!restrictionActive) return { min: 1, max: 6 };
  return cluster.includes(currentCellOneBased) ? { min: 1, max: 1 } : { min: 1, max: 6 };
}

export function advanceThanhMaoSonMovement(
  cluster: ReadonlyArray<number>,
  currentCellOneBased: number,
  rng: () => number = Math.random
): { nextCellOneBased: number; restrictionContinues: boolean } {
  const index = cluster.indexOf(currentCellOneBased);
  if (index < 0) return { nextCellOneBased: currentCellOneBased, restrictionContinues: false };
  const neighbors = [cluster[index - 1], cluster[index + 1]].filter((cell): cell is number => typeof cell === 'number');
  if (neighbors.length <= 0) return { nextCellOneBased: currentCellOneBased, restrictionContinues: false };
  const nextCellOneBased = neighbors.length === 1
    ? neighbors[0]!
    : neighbors[Math.floor(Math.max(0, Math.min(0.999999, rng())) * neighbors.length)] ?? neighbors[0]!;
  return { nextCellOneBased, restrictionContinues: cluster.indexOf(nextCellOneBased) === 1 };
}

export function applyThanhMaoTieuDiemEntry(
  wallet: MonopolyWallet,
  status: MonopolyStatusMetrics,
  spiritCap: number
): {
  wallet: MonopolyWallet;
  status: MonopolyStatusMetrics;
  sleeping: boolean;
  label: string;
} {
  const spiritRatio = spiritCap > 0 ? status.spirit / spiritCap : 0;
  if (spiritRatio >= THANH_MAO_TIEU_DIEM_FOOD_SPIRIT_RATIO) {
    const spent = spendMonopolySilver(wallet, THANH_MAO_TIEU_DIEM_FOOD_COST_SILVER);
    const nextStatus = {
      thirst: clampMonopolyStatus(status.thirst),
      hunger: clampMonopolyStatus(status.hunger + THANH_MAO_TIEU_DIEM_FOOD_HUNGER_GAIN),
      spirit: clampMonopolyStatus(status.spirit),
    };
    return {
      wallet: spent.paid ? spent.wallet : wallet,
      status: nextStatus,
      sleeping: false,
      label: spent.paid
        ? `Thanh Mao Tiểu Điếm ép mua đồ ăn (-${THANH_MAO_TIEU_DIEM_FOOD_COST_SILVER} bạc, +${THANH_MAO_TIEU_DIEM_FOOD_HUNGER_GAIN} đói).`
        : 'Thanh Mao Tiểu Điếm ép mua đồ ăn nhưng không đủ bạc.',
    };
  }
  const spent = spendMonopolySilver(wallet, THANH_MAO_TIEU_DIEM_SLEEP_COST_SILVER);
  return {
    wallet: spent.paid ? spent.wallet : wallet,
    status: { ...status },
    sleeping: true,
    label: spent.paid
      ? `Thanh Mao Tiểu Điếm thu ${THANH_MAO_TIEU_DIEM_SLEEP_COST_SILVER} bạc và ép ngủ hồi tinh thần.`
      : 'Thanh Mao Tiểu Điếm ép ngủ hồi tinh thần.',
  };
}

export function tickThanhMaoSleep(spirit: number, spiritCap: number): { nextSpirit: number; sleeping: boolean } {
  const healed = Math.min(spiritCap, spirit + spiritCap * THANH_MAO_TIEU_DIEM_SLEEP_SPIRIT_RATIO);
  return { nextSpirit: healed, sleeping: healed < spiritCap };
}

export function rollMonopolyForgeOffers(rng: () => number = Math.random, count = 5): MonopolyForgeItem[] {
  const pool = [...MONOPOLY_FORGE_ITEM_POOL];
  const picks: MonopolyForgeItem[] = [];
  while (pool.length > 0 && picks.length < Math.max(0, Math.floor(count))) {
    const index = Math.floor(Math.max(0, Math.min(0.999999, rng())) * pool.length);
    const [picked] = pool.splice(index, 1);
    if (picked) picks.push(picked);
  }
  return picks;
}

export function pickMonopolyModuleCell(
  cells: ReadonlyArray<BoardCell>,
  occupiedCellOneBased: ReadonlySet<number>
): number | null {
  const candidates = cells
    .filter(cell => cell.track !== 'mini' && cell.track !== 'micro')
    .map(cell => cell.index + 1)
    .filter(cellOneBased => !occupiedCellOneBased.has(cellOneBased));
  if (!candidates.length) return null;
  const picked = candidates[randomInt(0, candidates.length - 1)];
  return picked ?? null;
}

export function createTrucLamClusters(
  cells: ReadonlyArray<BoardCell>,
  occupiedCellOneBased: ReadonlySet<number>,
  clusterCount = TRUC_LAM_CLUSTER_COUNT,
  rng: () => number = Math.random
): number[][] {
  const maxClusters = Math.max(0, Math.floor(clusterCount));
  const blocked = new Set<number>(occupiedCellOneBased);
  const byCell = new Map(cells.map(cell => [cell.index + 1, cell]));
  const primaryCells = cells
    .filter(cell => cell.track !== 'mini' && cell.track !== 'micro')
    .map(cell => cell.index + 1);
  const clusters: number[][] = [];

  const randomPick = <T,>(items: readonly T[]): T | null => {
    if (items.length <= 0) return null;
    const pick = Math.floor(Math.max(0, Math.min(0.999999, rng())) * items.length);
    return items[pick] ?? null;
  };

  for (let idx = 0; idx < maxClusters; idx += 1) {
    const firstCandidates = primaryCells.filter(cellOneBased => !blocked.has(cellOneBased));
    const first = randomPick(firstCandidates);
    if (first == null) break;
    blocked.add(first);
    clusters.push([first]);
  }

  return clusters;
}

export function applyTrucLamThirstRestore(status: MonopolyStatusMetrics): MonopolyStatusMetrics {
  const thirstGain = MONOPOLY_STATUS_CAP * TRUC_LAM_THIRST_RESTORE_RATIO;
  return {
    thirst: clampMonopolyStatus(status.thirst + thirstGain),
    hunger: clampMonopolyStatus(status.hunger),
    spirit: clampMonopolyStatus(status.spirit)
  };
}

function getOrthogonalNeighbors(cells: ReadonlyArray<BoardCell>, sourceCellOneBased: number, blocked: ReadonlySet<number>): number[] {
  const source = cells[sourceCellOneBased - 1];
  if (!source) return [];
  return cells
    .filter(cell => cell.track !== 'mini' && cell.track !== 'micro')
    .filter(cell => !blocked.has(cell.index + 1))
    .filter(cell => Math.abs(cell.row - source.row) + Math.abs(cell.col - source.col) === 1)
    .map(cell => cell.index + 1);
}

export function createWorldRiftClusters(
  cells: ReadonlyArray<BoardCell>,
  occupiedCellOneBased: ReadonlySet<number>,
  clusterCount = WORLD_RIFT_CLUSTER_COUNT,
  clusterSize = WORLD_RIFT_CLUSTER_SIZE,
  rng: () => number = Math.random
): number[][] {
  const maxClusters = Math.max(0, Math.floor(clusterCount));
  const targetSize = Math.max(0, Math.floor(clusterSize));
  if (maxClusters <= 0 || targetSize <= 0) return [];

  const blocked = new Set<number>(occupiedCellOneBased);
  const primaryCells = cells
    .filter(cell => cell.track !== 'mini' && cell.track !== 'micro')
    .map(cell => cell.index + 1);

  const randomPick = <T,>(items: readonly T[]): T | null => {
    if (items.length <= 0) return null;
    const pick = Math.floor(Math.max(0, Math.min(0.999999, rng())) * items.length);
    return items[pick] ?? null;
  };

  const growCluster = (startCell: number): number[] | null => {
    const walk = [startCell];
    const visited = new Set<number>([startCell]);
    let current = startCell;
    while (walk.length < targetSize) {
      const candidates = getOrthogonalNeighbors(cells, current, blocked).filter(cell => !visited.has(cell));
      if (candidates.length <= 0) return null;
      const nextCell = randomPick(candidates);
      if (nextCell == null) return null;
      walk.push(nextCell);
      visited.add(nextCell);
      current = nextCell;
    }
    return walk;
  };

  const clusters: number[][] = [];
  for (let idx = 0; idx < maxClusters; idx += 1) {
    const starters = primaryCells.filter(cell => !blocked.has(cell));
    const shuffledStarters = starters
      .map(cell => ({ cell, sort: Math.max(0, Math.min(0.999999, rng())) }))
      .sort((left, right) => left.sort - right.sort)
      .map(entry => entry.cell);
    let cluster: number[] | null = null;
    for (const starter of shuffledStarters) {
      cluster = growCluster(starter);
      if (cluster) break;
    }
    if (!cluster) break;
    cluster.forEach(cell => blocked.add(cell));
    clusters.push(cluster);
  }

  return clusters;
}

export function getWorldRiftTeleportChance(stepIndex: number): number {
  return WORLD_RIFT_TELEPORT_CHANCES[stepIndex] ?? 0;
}

export function grantMonopolySilver(wallet: MonopolyWallet, amountSilver: number): MonopolyWallet {
  const normalized = normalizeMonopolyWallet(wallet);
  const bonus = normalizeWalletAmount(amountSilver);
  return normalizeMonopolyWallet({
    gold: normalized.gold,
    silver: normalized.silver + bonus
  });
}

export function spendMonopolySilver(wallet: MonopolyWallet, amountSilver: number): {
  wallet: MonopolyWallet;
  paid: boolean;
} {
  const normalized = refillMonopolySilverIfEmpty(wallet);
  const cost = normalizeWalletAmount(amountSilver);
  if (cost <= 0) {
    return { wallet: normalized, paid: true };
  }

  if (normalized.silver < cost) {
    return { wallet: normalized, paid: false };
  }

  return {
    wallet: normalizeMonopolyWallet({
      gold: normalized.gold,
      silver: normalized.silver - cost
    }),
    paid: true
  };
}

function autoExchangeGoldForForgeSilver(wallet: MonopolyWallet, requiredSilver: number): MonopolyWallet {
  const normalized = normalizeMonopolyWallet(wallet);
  const shortfall = Math.max(0, normalizeWalletAmount(requiredSilver) - normalized.silver);
  if (shortfall <= 0 || normalized.gold <= 0) return normalized;
  if (shortfall >= MONOPOLY_CURRENCY_RATIO * 3) return normalized;
  const goldToExchange = Math.min(3, Math.ceil(shortfall / MONOPOLY_CURRENCY_RATIO));
  const exchanged = spendMonopolyGold(normalized, goldToExchange);
  return exchanged.paid ? exchanged.wallet : normalized;
}

export function spendMonopolyGold(wallet: MonopolyWallet, amountGold: number): {
  wallet: MonopolyWallet;
  paid: boolean;
} {
  const normalized = normalizeMonopolyWallet(wallet);
  const cost = normalizeWalletAmount(amountGold);
  if (cost <= 0) {
    return { wallet: normalized, paid: true };
  }
  if (normalized.gold < cost) {
    return { wallet: normalized, paid: false };
  }
  return {
    wallet: normalizeMonopolyWallet({
      gold: normalized.gold - cost,
      silver: normalized.silver + cost * MONOPOLY_CURRENCY_RATIO
    }),
    paid: true
  };
}

export function computeMonopolyVictoryRewardByGold(wallet: MonopolyWallet): number {
  return Math.min(MONOPOLY_WALLET_CAP, normalizeWalletAmount(wallet.gold)) * MONOPOLY_CURRENCY_RATIO;
}

export function inheritGoldOnKill(killerWallet: MonopolyWallet, victimWallet: MonopolyWallet): {
  killerWallet: MonopolyWallet;
  victimWallet: MonopolyWallet;
  inheritedGold: number;
} {
  const killer = normalizeMonopolyWallet(killerWallet);
  const victim = normalizeMonopolyWallet(victimWallet);
  const inheritedGold = victim.gold;
  return {
    killerWallet: normalizeMonopolyWallet({
      gold: killer.gold + inheritedGold,
      silver: killer.silver
    }),
    victimWallet: normalizeMonopolyWallet({
      gold: 0,
      silver: victim.silver
    }),
    inheritedGold
  };
}

export function createInitialMonopolyYearEventState(): MonopolyYearEventState {
  return {
    activeEventId: null,
    activeUntilYear: 0,
    cooldownUntilYearByEvent: {},
    chaosCells: [],
    fruitCells: []
  };
}

export function getMonopolyYearRuleModifiers(activeEventId: MonopolyYearEventDefinition['id'] | null): MonopolyYearRuleModifiers {
  return {
    thirstStepMultiplier: activeEventId === 'drought' ? 2 : 1,
    hungerStepMultiplier: activeEventId === 'famine' ? 2 : 1,
    inflationMultiplier: activeEventId === 'inflation' ? 1.5 : 1,
    healingMultiplier: activeEventId === 'vitality' ? 1.5 : 1
  };
}

const pickRandomUniqueCells = (candidates: ReadonlyArray<number>, count: number, rng: () => number = Math.random): number[] => {
  const pool = [...candidates];
  const picked: number[] = [];
  const limit = Math.max(0, Math.min(Math.floor(count), pool.length));
  for (let i = 0; i < limit; i += 1) {
    const index = Math.floor(Math.max(0, Math.min(0.999999, rng())) * pool.length);
    const [cell] = pool.splice(index, 1);
    if (typeof cell === 'number') picked.push(cell);
  }
  return picked;
};

export function rollMonopolyYearEvent(year: number, state: MonopolyYearEventState, rng: () => number = Math.random): MonopolyYearEventDefinition {
  const available = MONOPOLY_YEAR_EVENT_DEFINITIONS.filter(event => (state.cooldownUntilYearByEvent[event.id] ?? 0) <= year);
  const pool = available.length > 0 ? available : MONOPOLY_YEAR_EVENT_DEFINITIONS;
  const index = Math.floor(Math.max(0, Math.min(0.999999, rng())) * pool.length);
  return pool[index] ?? pool[0]!;
}

export function resolveMonopolyNewYearEvent(
  year: number,
  state: MonopolyYearEventState,
  candidateCells: ReadonlyArray<number>,
  rng: () => number = Math.random
): {
  readonly nextState: MonopolyYearEventState;
  readonly event: MonopolyYearEventDefinition;
} {
  const event = rollMonopolyYearEvent(year, state, rng);
  const nextState: MonopolyYearEventState = {
    activeEventId: event.id,
    activeUntilYear: year + event.durationYears,
    cooldownUntilYearByEvent: {
      ...state.cooldownUntilYearByEvent,
      [event.id]: year + event.durationYears + event.cooldownYears
    },
    chaosCells: event.id === 'spacetime_chaos' ? pickRandomUniqueCells(candidateCells, 3, rng) : [],
    fruitCells: event.id === 'fruit_bounty' ? pickRandomUniqueCells(candidateCells, 5, rng) : []
  };
  return { nextState, event };
}

export function getMonopolyYearEventDefinition(eventId: MonopolyYearEventDefinition['id'] | null): MonopolyYearEventDefinition | null {
  if (!eventId) return null;
  return MONOPOLY_YEAR_EVENT_BY_ID.get(eventId) ?? null;
}

export function getMonopolyYearEventDisplayCopy(): ReadonlyArray<MonopolyYearEventDisplayCopy> {
  return MONOPOLY_YEAR_EVENT_DEFINITIONS.map(event => ({
    name: event.name,
    description: event.description
  }));
}

const TURN_INTERVAL_MS = 800;
const TURN_ADVANCE_DELAY_MS = 500;
const HOUSE_PURCHASE_PROMPT_TIMEOUT_MS = 3000;
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
  const pool = [...ssr];
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

function shuffled<T>(items: ReadonlyArray<T>, rng: () => number = Math.random): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.max(0, Math.min(0.999999, rng())) * (index + 1));
    const current = next[index];
    next[index] = next[swapIndex] as T;
    next[swapIndex] = current as T;
  }
  return next;
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
const MINI_TRACK_PATH_ORDER = BOARD_TEMPLATE.filter(cell => cell.track === 'mini').map(cell => cell.index + 1);
const MICRO_TRACK_PATH_ORDER = BOARD_TEMPLATE.filter(cell => cell.track === 'micro').map(cell => cell.index + 1);

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
  traversedCells?: number[];
}

function advanceRingMovement(path: ReadonlyArray<number>, currentCellOneBased: number, dice: number): { nextCellOneBased: number; traversedCells: number[]; lapCount: number } {
  if (!path.length) return { nextCellOneBased: currentCellOneBased, traversedCells: [], lapCount: 0 };
  const startIndex = path.indexOf(currentCellOneBased);
  let cursor = startIndex >= 0 ? startIndex : 0;
  const traversedCells: number[] = [];
  let lapCount = 0;
  let stepsLeft = Math.max(0, Math.floor(dice));
  while (stepsLeft > 0) {
    cursor = (cursor + 1) % path.length;
    if (cursor === 0) lapCount += 1;
    traversedCells.push(path[cursor] ?? currentCellOneBased);
    stepsLeft -= 1;
  }
  return {
    nextCellOneBased: traversedCells[traversedCells.length - 1] ?? path[cursor] ?? currentCellOneBased,
    traversedCells,
    lapCount
  };
}

export function advanceMonopolyMovement(state: MonopolyMovementState, dice: number): MonopolyMovementState {
  const traversedCells: number[] = [];
  const next: MonopolyMovementState = { ...state, traversedCells };

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
        traversedCells.push(next.currentCellOneBased);
        stepsLeft -= 1;
        continue;
      }

      next.currentCellOneBased = detour.exitCellOneBased;
      traversedCells.push(next.currentCellOneBased);
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
    traversedCells.push(next.currentCellOneBased);
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

const promptHousePurchaseDecision = (
  root: HTMLElement,
  avatar: MonopolyAvatar,
  timeoutMs = HOUSE_PURCHASE_PROMPT_TIMEOUT_MS
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;background:rgba(5,10,18,.72);padding:16px;';

    const panel = document.createElement('div');
    panel.style.cssText = 'max-width:420px;width:100%;border-radius:14px;border:1px solid rgba(148,199,255,.35);background:rgba(8,21,37,.96);padding:16px;color:#e8f2ff;display:flex;flex-direction:column;gap:10px;';

    const title = document.createElement('strong');
    title.textContent = `${avatar.unitName} muốn mua ô nhà ?`;

    const countdown = document.createElement('span');
    countdown.style.cssText = 'font-size:13px;color:#9ec3e8;';

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;';
    const denyButton = document.createElement('button');
    denyButton.type = 'button';
    denyButton.textContent = 'Bỏ qua';
    denyButton.style.cssText = 'border:1px solid rgba(148,199,255,.35);background:rgba(18,34,52,.92);color:#d4e8ff;border-radius:10px;padding:8px 12px;cursor:pointer;';
    const acceptButton = document.createElement('button');
    acceptButton.type = 'button';
    acceptButton.textContent = 'Mua';
    acceptButton.style.cssText = 'border:1px solid rgba(127,255,187,.42);background:rgba(15,70,44,.92);color:#e9fff3;border-radius:10px;padding:8px 12px;cursor:pointer;';
    actions.append(denyButton, acceptButton);

    panel.append(title, countdown, actions);
    overlay.appendChild(panel);
    root.appendChild(overlay);

    const startedAt = Date.now();
    const tick = (): void => {
      const remainMs = Math.max(0, timeoutMs - (Date.now() - startedAt));
      countdown.textContent = `Tự động bỏ qua sau ${Math.ceil(remainMs / 1000)}s`;
    };
    tick();

    let settled = false;
    const interval = window.setInterval(tick, 200);
    const timeout = window.setTimeout(() => finish(false), timeoutMs);

    const finish = (accepted: boolean): void => {
      if (settled) return;
      settled = true;
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      overlay.remove();
      resolve(accepted);
    };

    denyButton.addEventListener('click', () => finish(false), { once: true });
    acceptButton.addEventListener('click', () => finish(true), { once: true });
  });
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

  const walletBar = document.createElement('div');
  walletBar.className = 'monopoly-screen__wallet';
  const walletCurrency = document.createElement('div');
  walletCurrency.className = 'monopoly-screen__wallet-currency';
  const silverSlot = document.createElement('span');
  silverSlot.className = 'monopoly-screen__wallet-slot monopoly-screen__wallet-slot--silver';
  const goldSlot = document.createElement('span');
  goldSlot.className = 'monopoly-screen__wallet-slot monopoly-screen__wallet-slot--gold';
  const yearSlot = document.createElement('span');
  yearSlot.className = 'monopoly-screen__wallet-year';
  yearSlot.textContent = 'Năm: 0';
  walletCurrency.append(silverSlot, goldSlot);
  walletBar.append(walletCurrency, yearSlot);
  topbar.appendChild(walletBar);

  wrapper.appendChild(topbar);

  const turnBanner = document.createElement('div');
  turnBanner.className = 'monopoly-screen__turn';
  turnBanner.textContent = 'Đang chuẩn bị lượt chơi...';
  wrapper.appendChild(turnBanner);

  const playerStatusNode = document.createElement('div');
  playerStatusNode.className = 'monopoly-screen__meta';
  wrapper.appendChild(playerStatusNode);
  const inventoryBar = document.createElement('div');
  inventoryBar.className = 'monopoly-inventory';
  wrapper.appendChild(inventoryBar);

  let forgePanel: HTMLElement | null = null;
  const forgeTop = document.createElement('div');
  forgeTop.className = 'monopoly-forge__top';
  const forgeHeading = document.createElement('div');
  const forgeTitle = document.createElement('h3');
  forgeTitle.className = 'monopoly-forge__title';
  forgeTitle.textContent = 'Lò Rèn';
  const forgeCopy = document.createElement('p');
  forgeCopy.className = 'monopoly-forge__copy';
  const forgeClose = document.createElement('button');
  forgeClose.type = 'button';
  forgeClose.className = 'monopoly-forge__close';
  forgeClose.textContent = '✕';
  forgeHeading.append(forgeTitle, forgeCopy);
  forgeTop.append(forgeHeading, forgeClose);
  const forgeList = document.createElement('div');
  forgeList.className = 'monopoly-forge__list';
  const forgeFoot = document.createElement('div');
  forgeFoot.className = 'monopoly-forge__foot';
  const ensureForgePanelMounted = (): void => {
    if (forgePanel != null) return;
    forgePanel = document.createElement('aside');
    forgePanel.className = 'monopoly-forge';
    forgePanel.append(forgeTop, forgeList, forgeFoot);
    wrapper.appendChild(forgePanel);
  };

  const unmountForgePanel = (): void => {
    forgePanel?.remove();
    forgePanel = null;
  };

  const automationSettings: MonopolyAutomationSettings = {
    autoBuyHouseEnabled: false,
    autoUpgradeHouseEnabled: false
  };

  const automationBar = document.createElement('div');
  automationBar.className = 'monopoly-screen__automation';

  const autoBuyLabel = document.createElement('label');
  autoBuyLabel.className = 'monopoly-screen__automation-item';
  const autoBuyInput = document.createElement('input');
  autoBuyInput.type = 'checkbox';
  autoBuyInput.checked = automationSettings.autoBuyHouseEnabled;
  const autoBuyText = document.createElement('span');
  autoBuyText.textContent = 'Tự động mua nhà';
  autoBuyLabel.append(autoBuyInput, autoBuyText);

  const autoUpgradeLabel = document.createElement('label');
  autoUpgradeLabel.className = 'monopoly-screen__automation-item';
  const autoUpgradeInput = document.createElement('input');
  autoUpgradeInput.type = 'checkbox';
  autoUpgradeInput.checked = automationSettings.autoUpgradeHouseEnabled;
  const autoUpgradeText = document.createElement('span');
  autoUpgradeText.textContent = 'Tự động nâng cấp nhà';
  autoUpgradeLabel.append(autoUpgradeInput, autoUpgradeText);

  automationBar.append(autoBuyLabel, autoUpgradeLabel);
  wrapper.appendChild(automationBar);

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

  const importedUnits = shuffled(buildMonopolyImportPool(AVATAR_COUNT));
  const randomHouseEligibleCells = BOARD_TEMPLATE.filter(cell => cell.track !== 'mini' && cell.track !== 'micro');
  const houseSlots = createRandomHouseSlots(randomHouseEligibleCells);
  const houseByCell = new Map<number, HiddenHouseSlot>(houseSlots.map(slot => [slot.cellIndex, slot]));
  const occupiedModuleCells = new Set<number>(houseSlots.map(slot => slot.cellIndex));
  const worldRiftClusters = createWorldRiftClusters(BOARD_TEMPLATE, occupiedModuleCells);
  const worldRiftCells = worldRiftClusters[0] ?? [];
  const worldRiftCellIndex = new Map<number, number>(worldRiftCells.map((cellOneBased, idx) => [cellOneBased, idx]));
  for (const cellOneBased of worldRiftCells) occupiedModuleCells.add(cellOneBased);
  const trucLamClusters = createTrucLamClusters(BOARD_TEMPLATE, occupiedModuleCells);
  const trucLamCells = new Set<number>(trucLamClusters.flat());
  for (const cellOneBased of trucLamCells) occupiedModuleCells.add(cellOneBased);
  const lacDuongCell = pickMonopolyModuleCell(BOARD_TEMPLATE, occupiedModuleCells);
  if (lacDuongCell != null) occupiedModuleCells.add(lacDuongCell);
  const thanhMaoSonCluster = createThanhMaoSonCluster(occupiedModuleCells);
  const thanhMaoModuleOrder = createThanhMaoSonModuleOrder();
  const thanhMaoModuleByCell = new Map<number, 'tieu_diem' | 'lo_ren' | 'nui'>(thanhMaoSonCluster.map((cell, index) => [cell, thanhMaoModuleOrder[index] ?? 'nui']));
  for (const cellOneBased of thanhMaoSonCluster) occupiedModuleCells.add(cellOneBased);
  const forgeShopState: MonopolyForgeShopState = { ownerAvatarId: null, closesAtTurnAvatarId: null, closedManually: false, offers: [] };
  const fortuneTargets: MonopolyFortuneTarget[] = [];
  const playerInventory: MonopolyInventoryItem[] = [];
  const playerAvatarId = randomInt(1, AVATAR_COUNT);
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
      hpMaxCurrent: Math.max(1, Math.round(statBlock.HP ?? 1)),
      hp: Math.max(1, Math.round(statBlock.HP ?? 1)),
      currentPathIndex: 0,
      currentCellOneBased: START_CELL_ONE_BASED,
      hasEnteredBoard: false,
      pendingDetourFrom: null,
      activeDetourFrom: null,
      detourProgress: -1,
      node,
      hpFillNode,
      wallet: createInitialMonopolyWallet(),
      status: createInitialMonopolyStatus(),
      spiritCap: MONOPOLY_STATUS_CAP,
      skippedTurnCount: 0,
      soulState: 'alive',
      soulExpiresAtYear: null,
      autoBuyHouseEnabled: automationSettings.autoBuyHouseEnabled,
      autoUpgradeHouseEnabled: automationSettings.autoUpgradeHouseEnabled,
      thanhMaoRestrictionActive: false,
      forgeInventory: [],
      sleepingAtThanhMao: false,
      exileTrack: null,
      exileLapCount: 0,
      mainTrackProxyIndex: 0,
    });
  }

  const applyAutomationForAllAvatars = (): void => {
    for (const avatar of avatars) {
      avatar.autoBuyHouseEnabled = automationSettings.autoBuyHouseEnabled;
      avatar.autoUpgradeHouseEnabled = automationSettings.autoUpgradeHouseEnabled;
    }
  };
  applyAutomationForAllAvatars();

  autoBuyInput.addEventListener('change', () => {
    automationSettings.autoBuyHouseEnabled = autoBuyInput.checked;
    applyAutomationForAllAvatars();
  });
  autoUpgradeInput.addEventListener('change', () => {
    automationSettings.autoUpgradeHouseEnabled = autoUpgradeInput.checked;
    applyAutomationForAllAvatars();
  });

  const playerAvatar = avatars.find(avatar => avatar.role === 'player') ?? null;
  const turnOrder = shuffled(avatars.map(avatar => avatar.id));
  const lapProgressByAvatar = new Map<number, number>();
  let yearsElapsed = 0;
  let yearEventState = createInitialMonopolyYearEventState();
  let currentYearEventLabel = '';

  avatars.forEach(avatar => {
    lapProgressByAvatar.set(avatar.id, 0);
  });

  const syncPlayerWalletUi = (): void => {
    if (!playerAvatar) {
      walletBar.hidden = true;
      return;
    }
    const wallet = refillMonopolySilverIfEmpty(playerAvatar.wallet);
    playerAvatar.wallet = wallet;

    silverSlot.hidden = wallet.silver <= 0;
    goldSlot.hidden = wallet.gold <= 0;
    silverSlot.textContent = String(wallet.silver);
    goldSlot.textContent = String(wallet.gold);
    walletBar.hidden = silverSlot.hidden && goldSlot.hidden;
  };

    const formatMetric = (value: number): string => Math.round(clampMonopolyStatus(value)).toString();

  const syncForgeUi = (): void => {
    const owner = forgeShopState.ownerAvatarId == null ? null : avatars.find(avatar => avatar.id === forgeShopState.ownerAvatarId) ?? null;
    const shouldRender = playerAvatar != null && owner?.id === playerAvatar.id && forgeShopState.offers.length > 0 && !forgeShopState.closedManually;
    if (!shouldRender || !playerAvatar) {
      unmountForgePanel();
      return;
    }
    ensureForgePanelMounted();
    forgeCopy.textContent = `Mua sắm từ lúc đạp ô Lò Rèn tới trước lượt kế tiếp của ${owner?.unitName ?? 'bạn'}.`;
    forgeFoot.textContent = `Trang bị đang mang: ${playerAvatar.forgeInventory.length}/5.`;
    forgeList.replaceChildren();
    for (const item of forgeShopState.offers) {
      const row = document.createElement('div');
      row.className = 'monopoly-forge__item';
      const meta = document.createElement('div');
      meta.className = 'monopoly-forge__meta';
      const name = document.createElement('strong');
      name.className = 'monopoly-forge__name';
      name.textContent = `${item.icon} ${item.name}`;
      const desc = document.createElement('span');
      desc.className = 'monopoly-forge__desc';
      desc.textContent = `${item.description} • ${item.priceSilver} bạc`;
      meta.append(name, desc);
      const buy = document.createElement('button');
      buy.type = 'button';
      buy.className = 'monopoly-forge__buy';
      buy.textContent = 'Mua';
      buy.disabled = playerAvatar.forgeInventory.length >= MONOPOLY_INVENTORY_CAP;
      buy.addEventListener('click', () => {
        const walletWithSilver = autoExchangeGoldForForgeSilver(playerAvatar.wallet, item.priceSilver);
        const paid = spendMonopolySilver(walletWithSilver, item.priceSilver);
        if (!paid.paid || playerAvatar.forgeInventory.length >= MONOPOLY_INVENTORY_CAP) return;
        playerAvatar.wallet = paid.wallet;
        playerAvatar.forgeInventory.push(item);
        playerAvatar.stats.ATK += item.atkBonus;
        playerAvatar.stats.WIL += item.wilBonus;
        playerAvatar.hpMaxCurrent += item.hpBonus;
        playerAvatar.hp = Math.min(playerAvatar.hpMaxCurrent, playerAvatar.hp + item.hpBonus);
        forgeShopState.offers = forgeShopState.offers.filter(entry => entry.id !== item.id);
        syncAvatarHealthUi(playerAvatar);
        syncPlayerWalletUi();
        syncPlayerStatusUi();
        syncInventoryUi();
        syncForgeUi();
      });
      row.append(meta, buy);
      forgeList.appendChild(row);
    }
  };

  const syncPlayerStatusUi = (): void => {
    if (!playerAvatar) {
      playerStatusNode.hidden = true;
      return;
    }
    const { thirst, hunger, spirit } = playerAvatar.status;
    playerStatusNode.hidden = false;
    playerStatusNode.textContent = `Chỉ số cá nhân • Khát ${formatMetric(thirst)}/100 • Đói ${formatMetric(hunger)}/100 • Tinh thần ${formatMetric(spirit)}/${formatMetric(playerAvatar.spiritCap)}`;
  };

  const syncYearUi = (): void => {
    const activeEvent = getMonopolyYearEventDefinition(yearEventState.activeEventId);
    yearSlot.textContent = activeEvent ? `Năm: ${yearsElapsed} • ${activeEvent.name}` : `Năm: ${yearsElapsed}`;
    yearSlot.title = activeEvent ? `${activeEvent.name}: ${activeEvent.description}` : 'Chưa có sự kiện năm đang hoạt động';
  };

    forgeClose.addEventListener('click', () => {
    forgeShopState.closedManually = true;
    syncForgeUi();
  });

  const syncInventoryUi = (): void => {
    inventoryBar.replaceChildren();
    const visibleItems = playerInventory.slice(0, MONOPOLY_INVENTORY_CAP);
    inventoryBar.hidden = visibleItems.length <= 0;
    for (const item of visibleItems) {
      const slot = document.createElement('span');
      slot.className = 'monopoly-inventory__slot';
      slot.style.width = `${MONOPOLY_INVENTORY_SLOT_SIZE}px`;
      slot.style.height = `${MONOPOLY_INVENTORY_SLOT_SIZE}px`;
      slot.textContent = item.icon;
      slot.title = item.label;
      inventoryBar.appendChild(slot);
    }
  };

  const candidateEventCells = BOARD_TEMPLATE
    .filter(cell => cell.track !== 'mini' && cell.track !== 'micro')
    .map(cell => cell.index + 1);
  const teleportDestinationCells = BOARD_TEMPLATE
    .filter(cell => cell.track !== 'mini')
    .map(cell => cell.index + 1);
    const biCanhDestinationCells = BOARD_TEMPLATE
    .filter(cell => cell.track === 'micro')
    .map(cell => cell.index + 1);
  const quyVucDestinationCells = BOARD_TEMPLATE
    .filter(cell => cell.track === 'mini')
    .map(cell => cell.index + 1);

  const refreshEventCellsUi = (): void => {
    for (const { node, cell } of cellNodes) {
      const cellOneBased = cell.index + 1;
      const isChaos = yearEventState.chaosCells.includes(cellOneBased);
      const isFruit = yearEventState.fruitCells.includes(cellOneBased);
      node.classList.toggle('monopoly-cell--event-chaos', isChaos);
      node.classList.toggle('monopoly-cell--event-orchard', isFruit);
      if (isChaos) {
        node.title = `Thời Không Loạn Lưu (Ô #${cellOneBased})`;
        if (!houseByCell.has(cellOneBased)) node.textContent = 'TK';
        continue;
      }
      if (isFruit) {
        node.title = `Cây Trái Được Mùa (Ô #${cellOneBased})`;
        if (!houseByCell.has(cellOneBased)) node.textContent = 'CT';
        continue;
      }
      if (houseByCell.has(cellOneBased)) {
        const slot = houseByCell.get(cellOneBased);
        node.textContent = slot?.revealedTier != null ? `H${slot.revealedTier}` : '?';
        node.title = `Ô nhà bí ẩn #${cellOneBased}`;
        continue;
      }
      if (worldRiftCellIndex.has(cellOneBased)) {
        const chance = Math.round(getWorldRiftTeleportChance(worldRiftCellIndex.get(cellOneBased) ?? 0) * 100);
        const suffix = (worldRiftCellIndex.get(cellOneBased) ?? -1) === WORLD_RIFT_CENTER_INDEX
          ? ' Ô giữa: 40% Bí Cảnh, 40% Quỷ Vực, 20% an toàn.'
          : ` Ô này có ${chance}% truyền tống tới Bí Cảnh.`;
        node.textContent = 'VNTG';
        node.title = `${WORLD_RIFT_MODULE_TOOLTIP}${suffix} (Ô #${cellOneBased})`;
        continue;
      }
      if (trucLamCells.has(cellOneBased)) {
        node.textContent = 'TL';
        node.title = `${TRUC_LAM_MODULE_TOOLTIP} (Ô #${cellOneBased})`;
        continue;
      }
      if (lacDuongCell != null && cellOneBased === lacDuongCell) {
        node.textContent = 'LĐT';
        node.title = `${LAC_DUONG_MODULE_TOOLTIP} (Ô #${cellOneBased})`;
        continue;
      }
      const thanhMaoModule = thanhMaoModuleByCell.get(cellOneBased);
      if (thanhMaoModule) {
        if (thanhMaoModule === 'tieu_diem') {
          node.textContent = 'TMĐ';
          node.title = `Thanh Mao Tiểu Điếm (ô #${cellOneBased}) • -100 bạc, ngủ hồi ${Math.round(THANH_MAO_TIEU_DIEM_SLEEP_SPIRIT_RATIO * 100)}% tinh thần/turn đến khi đầy; nếu tinh thần ≥ ${Math.round(THANH_MAO_TIEU_DIEM_FOOD_SPIRIT_RATIO * 100)}% thì đổi sang ép ăn +${THANH_MAO_TIEU_DIEM_FOOD_HUNGER_GAIN} đói / ${THANH_MAO_TIEU_DIEM_FOOD_COST_SILVER} bạc.`;
        } else if (thanhMaoModule === 'lo_ren') {
          node.textContent = 'LR';
          node.title = `Lò Rèn (ô #${cellOneBased}) • mở hub bán 5 trang bị tới lượt kế tiếp của người đạp.`;
        } else {
          node.textContent = 'N';
          node.title = `Núi (ô #${cellOneBased}) • chỉ là núi, không có cơ duyên.`;
        }
        continue;
      }
      node.textContent = String(cellOneBased);
      node.title = `Ô #${cellOneBased}`;
    }
  };

  const reviveAvatarFromQuyVuc = (avatar: MonopolyAvatar): string => {
    if (avatar.soulState !== 'spirit') return '';
    avatar.soulState = 'alive';
    avatar.soulExpiresAtYear = null;
    avatar.hp = Math.max(1, Math.round(avatar.hpMaxCurrent * 0.5));
    avatar.status = {
      thirst: Math.max(avatar.status.thirst, MONOPOLY_STATUS_START),
      hunger: Math.max(avatar.status.hunger, MONOPOLY_STATUS_START),
      spirit: Math.max(avatar.status.spirit, MONOPOLY_STATUS_START)
    };
    syncAvatarHealthUi(avatar);
    return `${avatar.unitName} được Quỷ Vực kéo hồn về thân xác và hồi sinh với 50% HP`;
  };

  const resolveWorldRiftStep = (actor: MonopolyAvatar, cellOneBased: number): { finalCell: number; label: string } => {
    const stepIndex = worldRiftCellIndex.get(cellOneBased);
    if (typeof stepIndex !== 'number') return { finalCell: cellOneBased, label: '' };
    const teleportChance = getWorldRiftTeleportChance(stepIndex);
    const sourceMainIndex = actor.mainTrackProxyIndex;
    const roll = Math.random();
    if (stepIndex === WORLD_RIFT_CENTER_INDEX) {
      if (roll < 0.4) {
        const target = biCanhDestinationCells[randomInt(0, biCanhDestinationCells.length - 1)] ?? cellOneBased;
        actor.currentCellOneBased = target;
        actor.exileTrack = 'micro';
        actor.exileLapCount = 0;
        actor.mainTrackProxyIndex = sourceMainIndex;
        moveAvatarToCell(actor, actor.currentCellOneBased);
        return { finalCell: target, label: `${actor.unitName} bước vào tâm Vành Nứt Thế Giới tại ô ${cellOneBased} và bị quăng vào Bí Cảnh ô ${target}` };
      }
      if (roll < 0.8) {
        const target = quyVucDestinationCells[randomInt(0, quyVucDestinationCells.length - 1)] ?? cellOneBased;
        actor.currentCellOneBased = target;
        actor.exileTrack = 'mini';
        actor.exileLapCount = 0;
        actor.mainTrackProxyIndex = sourceMainIndex;
        moveAvatarToCell(actor, actor.currentCellOneBased);
        const revival = reviveAvatarFromQuyVuc(actor);
        return { finalCell: target, label: revival || `${actor.unitName} bị Vành Nứt Thế Giới kéo vào Quỷ Vực ô ${target}` };
      }
      return { finalCell: cellOneBased, label: `${actor.unitName} đứng vững tại tâm Vành Nứt Thế Giới ô ${cellOneBased}` };
    }
    if (roll >= teleportChance) return { finalCell: cellOneBased, label: '' };
    const target = biCanhDestinationCells[randomInt(0, biCanhDestinationCells.length - 1)] ?? cellOneBased;
    actor.currentCellOneBased = target;
    actor.exileTrack = 'micro';
    actor.exileLapCount = 0;
    actor.mainTrackProxyIndex = sourceMainIndex;
    moveAvatarToCell(actor, actor.currentCellOneBased);
    return { finalCell: target, label: `${actor.unitName} chạm Vành Nứt Thế Giới ô ${cellOneBased} và bị truyền tống tới Bí Cảnh ô ${target}` };
  };

  const applyEventHealing = (baseAmount: number): number => {
    const normalized = Math.max(0, baseAmount);
    const modifiers = getMonopolyYearRuleModifiers(yearEventState.activeEventId);
    return normalized * modifiers.healingMultiplier;
  };

  const syncAvatarHealthUi = (avatar: MonopolyAvatar): void => {
    const hpRatio = clampRatio(avatar.hp / avatar.hpMaxCurrent);
    avatar.hpFillNode.style.transform = `scaleX(${hpRatio})`;
    avatar.node.classList.toggle('monopoly-avatar--dead', avatar.hp <= 0);
    avatar.node.classList.toggle('monopoly-avatar--spirit', avatar.soulState === 'spirit');
    avatar.node.hidden = avatar.soulState === 'dispersed';
  };

  avatars.forEach(syncAvatarHealthUi);
  syncPlayerWalletUi();
  syncPlayerStatusUi();
  syncInventoryUi();

  const moveAvatarToCell = (avatar: MonopolyAvatar, indexOneBased: number): void => {
    const layout = BOARD_ISOMETRIC_LAYOUT.byIndex.get(indexOneBased - 1);
    if (!layout) return;
    const scale = Number.parseFloat(board.style.getPropertyValue('--tile-w')) / ISO_TILE_WIDTH || 1;
    avatar.node.style.left = `${layout.x * scale}px`;
    avatar.node.style.top = `${layout.y * scale}px`;
  };

  syncYearUi();
  refreshEventCellsUi();

  let activeTurnIndex = 0;
  let turnTimer: number | null = null;
  let destroyed = false;

  const applyYearIncomeIfReady = (): { silverIncome: number; eventLabel: string } => {
    const living = avatars.filter(item => item.soulState === 'alive' && item.hp > 0);
    if (!living.length) return { silverIncome: 0, eventLabel: '' };
    const minimumLap = Math.min(...living.map(item => lapProgressByAvatar.get(item.id) ?? 0));
    if (minimumLap <= yearsElapsed) return { silverIncome: 0, eventLabel: '' };
    const gainedYears = minimumLap - yearsElapsed;
    let eventLabel = '';
    for (let tick = 0; tick < gainedYears; tick += 1) {
      yearsElapsed += 1;
      for (const slot of houseSlots) collectHouseIncome(slot, true);
      const yearEvent = resolveMonopolyNewYearEvent(yearsElapsed, yearEventState, candidateEventCells, Math.random);
      yearEventState = yearEvent.nextState;
      currentYearEventLabel = `${yearEvent.event.name}: ${yearEvent.event.description}`;
      eventLabel = `Sự kiện năm ${yearsElapsed}: ${yearEvent.event.name}`;
      refreshEventCellsUi();
    }
    const yearlyIncome = gainedYears * MONOPOLY_CURRENCY_RATIO;
    for (const avatar of avatars) {
      if (avatar.soulState === 'dispersed') continue;
      avatar.wallet = grantMonopolySilver(avatar.wallet, yearlyIncome);
    }
    syncYearUi();
    return { silverIncome: yearlyIncome, eventLabel };
  };

  const applyHouseOwnerBuff = (avatar: MonopolyAvatar, houseId: string, isLanding: boolean): void => {
    const spec = getHouseOwnerEffectSpec(houseId);
    const gainHpRatio = (ratio: number): void => {
      avatar.hp = Math.min(avatar.hpMaxCurrent, avatar.hp + applyEventHealing(avatar.hpMaxCurrent * ratio));
    };
    const applyStatus = (delta: { thirst?: number; hunger?: number; spirit?: number } | undefined): void => {
      if (!delta) return;
      const spiritGain = delta.spirit ?? 0;
      if (spec.overflowSpiritToCap && spiritGain > 0) {
        const spiritState = applySpiritGainWithHouseOverflow(houseId, avatar.status.spirit, avatar.spiritCap, spiritGain);
        avatar.status = {
          thirst: clampMonopolyStatus(avatar.status.thirst + (delta.thirst ?? 0)),
          hunger: clampMonopolyStatus(avatar.status.hunger + (delta.hunger ?? 0)),
          spirit: spiritState.nextSpirit
        };
        avatar.spiritCap = spiritState.nextSpiritCap;
        return;
      }
      avatar.status = {
        thirst: clampMonopolyStatus(avatar.status.thirst + (delta.thirst ?? 0)),
        hunger: clampMonopolyStatus(avatar.status.hunger + (delta.hunger ?? 0)),
        spirit: clampMonopolyStatus(avatar.status.spirit + spiritGain)
      };
    };

    const hpRatio = isLanding ? (spec.landHpRatio ?? 0) : (spec.passHpRatio ?? 0);
    if (hpRatio > 0) gainHpRatio(hpRatio);
    applyStatus(isLanding ? spec.landStatus : spec.passStatus);

    if (isLanding && spec.ownerLandSelfDestructHpRatio != null && avatar.hp <= avatar.hpMaxCurrent * spec.ownerLandSelfDestructHpRatio) {
      avatar.hp = 0;
    }
  };

  const applyHouseCombatDamage = (owner: MonopolyAvatar, target: MonopolyAvatar, basicHits: number): number => {
    const perHit = computeMonopolyBasicDamage(owner, target);
    const damage = Math.max(1, Math.round(perHit * basicHits));
    target.hp = Math.max(0, target.hp - damage);
    return damage;
  };

  const resolveRangedHouseThreat = (actor: MonopolyAvatar, actorCell: number): string => {
    let label = '';
    const actorLayout = BOARD_TEMPLATE[actorCell - 1];
    if (!actorLayout) return label;
    for (const slot of houseSlots) {
      if (!slot.definitionId || slot.ownerAvatarId == null || slot.ownerAvatarId === actor.id) continue;
      if (slot.definitionId !== 'thi_than_cung') continue;
      const owner = avatars.find(item => item.id === slot.ownerAvatarId);
      if (!owner || owner.soulState !== 'alive' || owner.hp <= 0) continue;
      const houseLayout = BOARD_TEMPLATE[slot.cellIndex - 1];
      if (!houseLayout) continue;
      const distance = Math.max(Math.abs(actorLayout.row - houseLayout.row), Math.abs(actorLayout.col - houseLayout.col));
      if (distance > 3) continue;
      const hits = distance <= 2 ? 5 : 2;
      const damage = applyHouseCombatDamage(owner, actor, hits);
      label = `${actor.unitName} bị ${owner.unitName} bắn từ Thí Thần Cung -${damage} HP`;
    }
    return label;
  };

  const resolveHouseCombatThreat = (slot: HiddenHouseSlot, actor: MonopolyAvatar, isLanding: boolean): string => {
    if (!slot.definitionId || slot.ownerAvatarId == null || slot.ownerAvatarId === actor.id) return '';
    const owner = avatars.find(item => item.id === slot.ownerAvatarId);
    if (!owner || owner.soulState !== 'alive' || owner.hp <= 0) return '';

    if (slot.definitionId === 'thi_than_thuong' || slot.definitionId === 'anh_cung') {
      const hits = isLanding
        ? (slot.definitionId === 'thi_than_thuong' ? 4 : 3)
        : (slot.definitionId === 'thi_than_thuong' ? 2 : 1);
      const damage = applyHouseCombatDamage(owner, actor, hits);
      if (slot.definitionId === 'anh_cung' && isLanding) {
        const ownerCell = BOARD_TEMPLATE[owner.currentCellOneBased - 1];
        if (ownerCell && ownerCell.track !== 'mini' && ownerCell.track !== 'micro') {
          owner.currentCellOneBased = slot.cellIndex;
          moveAvatarToCell(owner, owner.currentCellOneBased);
        }
      }
      return `${actor.unitName} bị ${owner.unitName} công kích từ ${slot.definitionId === 'anh_cung' ? 'Ảnh Cung' : 'Thí Thần Thương'} -${damage} HP`;
    }

    if (slot.definitionId === 'ba_nen_nhang') {
      const penalty = getHouseVisitorPenalty(slot.definitionId, isLanding);
      if (penalty.hpRatioLoss > 0) {
        actor.hp = Math.max(0, actor.hp - actor.stats.hpMax * penalty.hpRatioLoss);
      }
      actor.status = {
        thirst: clampMonopolyStatus(actor.status.thirst + (penalty.statusDelta.thirst ?? 0)),
        hunger: clampMonopolyStatus(actor.status.hunger + (penalty.statusDelta.hunger ?? 0)),
        spirit: clampMonopolyStatus(actor.status.spirit + (penalty.statusDelta.spirit ?? 0))
      };
      return `${actor.unitName} bị Ba Nén Nhang ám hại`;
    }
    return '';
  };

    const applyAssassinTaxPunishment = (avatar: MonopolyAvatar): string => {
    if (avatar.hp <= avatar.hpMaxCurrent * 0.2) {
      avatar.hp = 0;
      return `${avatar.unitName} trốn thuế Ảnh sát môn và bị ám sát`;
    }
    avatar.hpMaxCurrent = Math.max(1, avatar.hpMaxCurrent * 0.97);
    avatar.hp = Math.min(avatar.hp, avatar.hpMaxCurrent);
    return `${avatar.unitName} trốn thuế Ảnh sát môn: giảm vĩnh viễn 3% HP tối đa`;
  };

  const resolveHouseStep = async (avatar: MonopolyAvatar, cellOneBased: number, isLanding: boolean): Promise<HouseStepSummary> => {
    if (avatar.soulState !== 'alive') {
      return { paidTax: 0, ownerCollected: 0, purchaseLabel: '', upgradeLabel: '', hazardLabel: '', bankruptLabel: '', killerAvatarId: null };
    }
    const slot = houseByCell.get(cellOneBased);
    if (!slot) return { paidTax: 0, ownerCollected: 0, purchaseLabel: '', upgradeLabel: '', hazardLabel: resolveRangedHouseThreat(avatar, cellOneBased), bankruptLabel: '', killerAvatarId: null };
    if (slot.revealedTier == null || slot.ownerAvatarId == null) {
      if (!isLanding) return { paidTax: 0, ownerCollected: 0, purchaseLabel: '', upgradeLabel: '', hazardLabel: resolveRangedHouseThreat(avatar, cellOneBased), bankruptLabel: '', killerAvatarId: null };
      const willBuy = avatar.autoBuyHouseEnabled
        ? true
        : avatar.role === 'npc'
          ? true
          : await promptHousePurchaseDecision(root, avatar);
      if (!willBuy) return { paidTax: 0, ownerCollected: 0, purchaseLabel: `${avatar.unitName} bỏ qua mua ô ?`, upgradeLabel: '', hazardLabel: resolveRangedHouseThreat(avatar, cellOneBased), bankruptLabel: '', killerAvatarId: null };
      // Giá nhà tính bằng bạc, nhưng ví trong trận là bạc + vàng.
      // Luôn quy đổi tổng tài sản về "đơn vị bạc" để mua đúng theo luật.
      const totalSilverBudget = avatar.wallet.gold * MONOPOLY_CURRENCY_RATIO + avatar.wallet.silver;
      const purchase = revealHousePurchase(slot, avatar.id, totalSilverBudget, Math.random, getMonopolyYearRuleModifiers(yearEventState.activeEventId).inflationMultiplier);
      if (!purchase.ok || !purchase.definition) {
        return { paidTax: 0, ownerCollected: 0, purchaseLabel: `${avatar.unitName} không đủ bạc để mở ô ?`, upgradeLabel: '', hazardLabel: resolveRangedHouseThreat(avatar, cellOneBased), bankruptLabel: '', killerAvatarId: null };
      }
      avatar.wallet = normalizeMonopolyWallet({ ...avatar.wallet, silver: purchase.nextWalletSilver });
      const node = cellNodes.find(item => item.cell.index + 1 === cellOneBased)?.node;
      if (node) node.textContent = `H${purchase.tier}`;
      return { paidTax: 0, ownerCollected: 0, purchaseLabel: `${avatar.unitName} mua ${purchase.definition.name} cấp ${purchase.tier}`, upgradeLabel: '', hazardLabel: resolveRangedHouseThreat(avatar, cellOneBased), bankruptLabel: '', killerAvatarId: null };
    }

    const totalSilver = avatar.wallet.gold * MONOPOLY_CURRENCY_RATIO + avatar.wallet.silver;
    const settled = settleHouseTraverse(slot, avatar.id, isLanding, totalSilver, !isLanding, getMonopolyYearRuleModifiers(yearEventState.activeEventId).inflationMultiplier);
    if (settled.ownerTriggeredHouse) {
      if (settled.ownerCollectedSilver > 0) {
        avatar.wallet = grantMonopolySilver(avatar.wallet, settled.ownerCollectedSilver);
      }
      // Buff của chủ nhà vẫn được kích hoạt khi đi ngang/đạp trúng,
      // kể cả lúc treasury đang trống.
      applyHouseOwnerBuff(avatar, slot.definitionId ?? '', isLanding);
      let upgradeLabel = '';
      if (isLanding) {
        const def = getHouseDefinitionById(slot.definitionId);
        const tryUpgrade = Boolean(def?.upgradeCostSilver != null) && (avatar.autoUpgradeHouseEnabled || avatar.role === 'player' || Math.random() < 0.65);
        if (tryUpgrade) {
          const totalSilverBudget = avatar.wallet.gold * MONOPOLY_CURRENCY_RATIO + avatar.wallet.silver;
          const upgraded = upgradeHouse(slot, totalSilverBudget, Math.random, getMonopolyYearRuleModifiers(yearEventState.activeEventId).inflationMultiplier);
          if (upgraded.ok && upgraded.nextDefinition) {
            avatar.wallet = normalizeMonopolyWallet({ ...avatar.wallet, silver: upgraded.nextWalletSilver });
            upgradeLabel = `${avatar.unitName} nâng cấp lên ${upgraded.nextDefinition.name}`;
            const node = cellNodes.find(item => item.cell.index + 1 === cellOneBased)?.node;
            if (node) node.textContent = `H${slot.revealedTier ?? ''}`;
          }
        }
      }
      return { paidTax: 0, ownerCollected: settled.ownerCollectedSilver, purchaseLabel: '', upgradeLabel, hazardLabel: resolveRangedHouseThreat(avatar, cellOneBased), bankruptLabel: '', killerAvatarId: null };
    }
    if (settled.paidTaxSilver > 0) {
      const remainSilver = Math.max(0, totalSilver - settled.paidTaxSilver);
      avatar.wallet = normalizeMonopolyWallet({
        gold: Math.floor(remainSilver / MONOPOLY_CURRENCY_RATIO),
        silver: remainSilver % MONOPOLY_CURRENCY_RATIO
      });
    }
    let bankruptLabel = settled.expectedTaxSilver > settled.paidTaxSilver
      ? `${avatar.unitName} không đủ bạc để trả đủ thuế nhà (${settled.paidTaxSilver}/${settled.expectedTaxSilver})`
      : '';
      if (shouldTriggerAssassinTaxPunishment(slot.definitionId, settled.expectedTaxSilver, settled.paidTaxSilver)) {
      bankruptLabel = bankruptLabel
        ? `${bankruptLabel} • ${applyAssassinTaxPunishment(avatar)}`
        : applyAssassinTaxPunishment(avatar);
    }
    const hazardLabel = resolveHouseCombatThreat(slot, avatar, isLanding) || resolveRangedHouseThreat(avatar, cellOneBased);
    const killerAvatarId = slot.ownerAvatarId ?? null;
    return { paidTax: settled.paidTaxSilver, ownerCollected: 0, purchaseLabel: '', upgradeLabel: '', hazardLabel, bankruptLabel, killerAvatarId };
  };

  const maybeOpenForgeShop = (avatar: MonopolyAvatar): string => {
    forgeShopState.ownerAvatarId = avatar.id;
    forgeShopState.closesAtTurnAvatarId = avatar.id;
    forgeShopState.closedManually = false;
    forgeShopState.offers = rollMonopolyForgeOffers();
    if (avatar.role === 'npc') {
      while (forgeShopState.offers.length > 0) {
        const offer = forgeShopState.offers[0];
        if (!offer || avatar.forgeInventory.length >= MONOPOLY_INVENTORY_CAP) break;
        const walletWithSilver = autoExchangeGoldForForgeSilver(avatar.wallet, offer.priceSilver);
        const paid = spendMonopolySilver(walletWithSilver, offer.priceSilver);
        if (!paid.paid) break;
        avatar.wallet = paid.wallet;
        avatar.forgeInventory.push(offer);
        avatar.stats.ATK += offer.atkBonus;
        avatar.stats.WIL += offer.wilBonus;
        avatar.hpMaxCurrent += offer.hpBonus;
        avatar.hp = Math.min(avatar.hpMaxCurrent, avatar.hp + offer.hpBonus);
        forgeShopState.offers.shift();
        if (Math.random() < 0.55) break;
      }
      forgeShopState.closedManually = true;
    }
    syncForgeUi();
    return `${avatar.unitName} ghé Lò Rèn${avatar.role === 'player' ? ', hub mua trang bị đã mở' : ' và NPC có thể mua trang bị nếu đủ bạc'}`;
  };

  const resolveThanhMaoLanding = (actor: MonopolyAvatar, cellOneBased: number, cameFromCluster: boolean): string => {
    const module = thanhMaoModuleByCell.get(cellOneBased);
    if (!module) return '';
    if (!cameFromCluster) actor.thanhMaoRestrictionActive = true;
    if (module === 'nui') return `${actor.unitName} tiến vào núi của Thanh Mao Sơn, không có cơ duyên gì.`;
    if (module === 'tieu_diem') {
      const result = applyThanhMaoTieuDiemEntry(actor.wallet, actor.status, actor.spiritCap);
      actor.wallet = result.wallet;
      actor.status = result.status;
      actor.sleepingAtThanhMao = result.sleeping;
      return `${actor.unitName} vào Thanh Mao Tiểu Điếm. ${result.label}`;
    }
    return maybeOpenForgeShop(actor);
  };

  const transitionToSpirit = (avatar: MonopolyAvatar): void => {
    if (avatar.soulState !== 'alive' || avatar.hp > 0) return;
    avatar.soulState = 'spirit';
    avatar.soulExpiresAtYear = yearsElapsed + 2;
    avatar.skippedTurnCount = 0;
    syncAvatarHealthUi(avatar);
  };

  const processAvatarDeaths = (killerByVictimId: ReadonlyMap<number, number | null>): string[] => {
    const labels: string[] = [];
    const justDied = avatars.filter(item => item.soulState === 'alive' && item.hp <= 0);
    for (const victim of justDied) {
      const killerId = killerByVictimId.get(victim.id) ?? null;
      const killer = killerId == null ? null : avatars.find(item => item.id === killerId) ?? null;
      if (killer && killer.id !== victim.id && killer.soulState !== 'dispersed') {
        const inherited = inheritGoldOnKill(killer.wallet, victim.wallet);
        killer.wallet = inherited.killerWallet;
        victim.wallet = inherited.victimWallet;
        if (inherited.inheritedGold > 0) {
          labels.push(`${killer.unitName} kế thừa ${inherited.inheritedGold} vàng từ ${victim.unitName}`);
        }
      }
      const resetCells = resetHouseSlotsByOwner(houseSlots, victim.id);
      for (const cellOneBased of resetCells) {
        const node = cellNodes.find(item => item.cell.index + 1 === cellOneBased)?.node;
        if (node) node.textContent = '?';
      }
      if (resetCells.length > 0) {
        labels.push(`${victim.unitName} tử trận: ${resetCells.length} ô nhà bị xóa về '?'`);
      }
      transitionToSpirit(victim);
    }
    return labels;
  };

  const processSpiritExpiration = (): string[] => {
    const labels: string[] = [];
    for (const avatar of avatars) {
      if (avatar.soulState !== 'spirit') continue;
      const expiresAt = avatar.soulExpiresAtYear ?? Number.POSITIVE_INFINITY;
      if (yearsElapsed < expiresAt) continue;
      avatar.soulState = 'dispersed';
      avatar.hasEnteredBoard = false;
      avatar.node.hidden = true;
      labels.push(`${avatar.unitName} đã hồn phi phách tán sau 2 năm ở trạng thái linh hồn`);
    }
    return labels;
  };

  const runTurn = async (): Promise<void> => {
    if (destroyed) return;
    const activeAvatarId = turnOrder[activeTurnIndex];
    const avatar = avatars.find(item => item.id === activeAvatarId);
    if (!avatar) return;
    if (avatar.soulState === 'dispersed') {
      activeTurnIndex = (activeTurnIndex + 1) % AVATAR_COUNT;
      turnTimer = window.setTimeout(runTurn, TURN_INTERVAL_MS + TURN_ADVANCE_DELAY_MS);
      return;
    }

    if (forgeShopState.closesAtTurnAvatarId === avatar.id) {
      forgeShopState.ownerAvatarId = null;
      forgeShopState.closesAtTurnAvatarId = null;
      forgeShopState.offers = [];
      forgeShopState.closedManually = false;
      syncForgeUi();
    }

    if (avatar.soulState === 'alive' && avatar.sleepingAtThanhMao) {
      const slept = tickThanhMaoSleep(avatar.status.spirit, avatar.spiritCap);
      avatar.status = { ...avatar.status, spirit: slept.nextSpirit };
      avatar.sleepingAtThanhMao = slept.sleeping;
      turnBanner.textContent = `Lượt ${avatar.unitName} (${avatar.role.toUpperCase()}) • đang ngủ ở Thanh Mao Tiểu Điếm, hồi ${Math.round(THANH_MAO_TIEU_DIEM_SLEEP_SPIRIT_RATIO * 100)}% tinh thần và mất lượt`;
      syncPlayerWalletUi();
      syncPlayerStatusUi();
      syncForgeUi();
      activeTurnIndex = (activeTurnIndex + 1) % AVATAR_COUNT;
      turnTimer = window.setTimeout(runTurn, TURN_INTERVAL_MS + TURN_ADVANCE_DELAY_MS);
      return;
    }

    if (avatar.soulState === 'alive' && avatar.skippedTurnCount > 0) {
      avatar.skippedTurnCount -= 1;
      turnBanner.textContent = `Lượt ${avatar.unitName} (${avatar.role.toUpperCase()}) • Tinh thần ≤ ${MONOPOLY_FAINT_SPIRIT_THRESHOLD} nên ngất tại chỗ, mất lượt`;
      syncPlayerStatusUi();
      activeTurnIndex = (activeTurnIndex + 1) % AVATAR_COUNT;
      turnTimer = window.setTimeout(runTurn, TURN_INTERVAL_MS + TURN_ADVANCE_DELAY_MS);
      return;
    }

    const thanhMaoDiceRange = getThanhMaoSonDiceRange(thanhMaoSonCluster, avatar.currentCellOneBased, avatar.thanhMaoRestrictionActive);
    const spiritDiceMax = getMonopolyDiceMaxBySpirit(avatar.status.spirit);
    const diceMax = Math.min(spiritDiceMax, thanhMaoDiceRange.max);
    const dice = randomInt(thanhMaoDiceRange.min, diceMax);

    if (!avatar.hasEnteredBoard) {
      avatar.currentPathIndex = 0;
      avatar.currentCellOneBased = MAIN_TRACK_PATH_ORDER[0] ?? START_CELL_ONE_BASED;
      avatar.mainTrackProxyIndex = 0;
      avatar.hasEnteredBoard = true;
      avatar.node.hidden = false;
      moveAvatarToCell(avatar, avatar.currentCellOneBased);
    }

    const advanced = avatar.exileTrack === 'mini' || avatar.exileTrack === 'micro'
      ? (() => {
          const path = avatar.exileTrack === 'mini' ? MINI_TRACK_PATH_ORDER : MICRO_TRACK_PATH_ORDER;
          const movement = advanceRingMovement(path, avatar.currentCellOneBased, dice);
          return {
            currentPathIndex: avatar.currentPathIndex,
            currentCellOneBased: movement.nextCellOneBased,
            pendingDetourFrom: null,
            activeDetourFrom: null,
            detourProgress: -1,
            traversedCells: movement.traversedCells,
            exileLapCount: avatar.exileLapCount + movement.lapCount,
            thanhMaoRestrictionContinues: false,
          };
        })()
      : avatar.thanhMaoRestrictionActive && thanhMaoSonCluster.includes(avatar.currentCellOneBased)
      ? (() => {
          const nextMove = advanceThanhMaoSonMovement(thanhMaoSonCluster, avatar.currentCellOneBased);
          const nextPathIndex = MAIN_TRACK_INDEX_BY_CELL.get(nextMove.nextCellOneBased) ?? avatar.currentPathIndex;
          return {
            currentPathIndex: nextPathIndex,
            currentCellOneBased: nextMove.nextCellOneBased,
            pendingDetourFrom: null,
            activeDetourFrom: null,
            detourProgress: -1,
            traversedCells: [nextMove.nextCellOneBased],
            thanhMaoRestrictionContinues: nextMove.restrictionContinues,
          };
        })()
      : {
          ...advanceMonopolyMovement({
            currentPathIndex: avatar.currentPathIndex,
            currentCellOneBased: avatar.currentCellOneBased,
            pendingDetourFrom: avatar.pendingDetourFrom,
            activeDetourFrom: avatar.activeDetourFrom,
            detourProgress: avatar.detourProgress,
            traversedCells: []
          }, dice),
          thanhMaoRestrictionContinues: avatar.thanhMaoRestrictionActive,
        };

    const previousPathIndex = avatar.currentPathIndex;

    avatar.currentPathIndex = advanced.currentPathIndex;
    avatar.currentCellOneBased = advanced.currentCellOneBased;
    avatar.pendingDetourFrom = advanced.pendingDetourFrom;
    avatar.activeDetourFrom = advanced.activeDetourFrom;
    avatar.detourProgress = advanced.detourProgress;
    avatar.thanhMaoRestrictionActive = Boolean((advanced as { thanhMaoRestrictionContinues?: boolean }).thanhMaoRestrictionContinues);
    avatar.exileLapCount = (advanced as { exileLapCount?: number }).exileLapCount ?? avatar.exileLapCount;
    if (avatar.exileTrack == null) avatar.mainTrackProxyIndex = avatar.currentPathIndex;
    if (avatar.soulState === 'alive') {
      const yearModifiers = getMonopolyYearRuleModifiers(yearEventState.activeEventId);
      avatar.status = applyMonopolyStepDrain(avatar.status, dice, yearModifiers);
      avatar.hp = applyMonopolySurvivalHpDrain(avatar.hp, avatar.hpMaxCurrent, avatar.status, dice);
      syncAvatarHealthUi(avatar);
    }

    if (avatar.soulState === 'alive' && shouldSkipMonopolyTurnBySpirit(avatar.status.spirit)) {
      avatar.skippedTurnCount = Math.max(avatar.skippedTurnCount, 1);
    }

    if (avatar.exileTrack == null && advanced.activeDetourFrom == null && advanced.currentPathIndex < previousPathIndex) {
      lapProgressByAvatar.set(avatar.id, (lapProgressByAvatar.get(avatar.id) ?? 0) + 1);
    }

    moveAvatarToCell(avatar, avatar.currentCellOneBased);

    let paidTax = 0;
    let ownerCollected = 0;
    let purchaseLabel = '';
    let upgradeLabel = '';
    let hazardLabel = '';
    let bankruptLabel = '';
    let lastHouseKillerId: number | null = null;
    const traversed = advanced.traversedCells ?? [];

    if (avatar.exileTrack === 'mini' || avatar.exileTrack === 'micro') {
      const exileTrackLabel = avatar.exileTrack === 'mini' ? 'Quỷ Vực' : 'Bí Cảnh';
      const mainEquivalentSteps = traversed.length;
      if (mainEquivalentSteps > 0) {
        const previousProxyIndex = avatar.mainTrackProxyIndex;
        avatar.mainTrackProxyIndex = (avatar.mainTrackProxyIndex + mainEquivalentSteps) % MAIN_TRACK_PATH_ORDER.length;
        const proxyLaps = Math.floor((previousProxyIndex + mainEquivalentSteps) / MAIN_TRACK_PATH_ORDER.length);
        if (proxyLaps > 0) {
          lapProgressByAvatar.set(avatar.id, (lapProgressByAvatar.get(avatar.id) ?? 0) + proxyLaps);
        }
      }
      if (avatar.exileLapCount >= 3) {
        const mainTeleportCandidates = BOARD_TEMPLATE
          .filter(cell => cell.track === 'main')
          .map(cell => cell.index + 1)
          .filter(cellOneBased => cellOneBased !== avatar.currentCellOneBased);
        const target = mainTeleportCandidates[randomInt(0, mainTeleportCandidates.length - 1)] ?? (MAIN_TRACK_PATH_ORDER[avatar.mainTrackProxyIndex] ?? START_CELL_ONE_BASED);
        avatar.currentCellOneBased = target;
        avatar.currentPathIndex = MAIN_TRACK_INDEX_BY_CELL.get(target) ?? avatar.mainTrackProxyIndex;
        avatar.pendingDetourFrom = null;
        avatar.activeDetourFrom = null;
        avatar.detourProgress = -1;
        avatar.exileTrack = null;
        avatar.exileLapCount = 0;
        moveAvatarToCell(avatar, avatar.currentCellOneBased);
        purchaseLabel = `${avatar.unitName} đã đi đủ 3 vòng trong ${exileTrackLabel} và bị đẩy ngẫu nhiên về bản đồ chính ô ${target}`;
      }
    }
    const rollFortuneTargetCell = (): number | null => {
      const blocked = new Set<number>(occupiedModuleCells);
      for (const target of fortuneTargets) blocked.add(target.cellOneBased);
      return pickMonopolyModuleCell(BOARD_TEMPLATE, blocked);
    };
    const resolveFortuneTarget = (actor: MonopolyAvatar, cellOneBased: number): string => {
      const idx = fortuneTargets.findIndex(target => target.cellOneBased === cellOneBased);
      if (idx < 0) return '';
      const [target] = fortuneTargets.splice(idx, 1);
      if (!target) return '';
      if (target.tier === 'major') {
        actor.wallet = normalizeMonopolyWallet({ gold: actor.wallet.gold + MAJOR_FORTUNE_GOLD_REWARD, silver: actor.wallet.silver });
        return `${actor.unitName} nhặt cơ duyên lớn tại ô ${cellOneBased} (+${MAJOR_FORTUNE_GOLD_REWARD} vàng)`;
      }
      if (target.tier === 'medium') {
        actor.wallet = normalizeMonopolyWallet({ gold: actor.wallet.gold + MEDIUM_FORTUNE_GOLD_REWARD, silver: actor.wallet.silver });
        return `${actor.unitName} nhặt cơ duyên vừa tại ô ${cellOneBased} (+${MEDIUM_FORTUNE_GOLD_REWARD} vàng)`;
      }
      actor.wallet = normalizeMonopolyWallet({ gold: actor.wallet.gold + MINOR_FORTUNE_GOLD_REWARD, silver: actor.wallet.silver });
      return `${actor.unitName} nhặt cơ duyên nhỏ tại ô ${cellOneBased} (+${MINOR_FORTUNE_GOLD_REWARD} vàng)`;
    };
    const resolveLacDuongStep = (actor: MonopolyAvatar, cellOneBased: number): string => {
      if (lacDuongCell == null || cellOneBased !== lacDuongCell) return '';
      let label = `${actor.unitName} đạp lên ô Lạc Dương Trấn và buộc phải mua 2 màn thầu.`;
      const eat = spendMonopolySilver(actor.wallet, LAC_DUONG_MANTOU_COST_SILVER);
      if (eat.paid) {
        actor.wallet = eat.wallet;
        actor.status = {
          thirst: actor.status.thirst,
          hunger: clampMonopolyStatus(actor.status.hunger + LAC_DUONG_MANTOU_HUNGER_GAIN),
          spirit: actor.status.spirit
        };
        label += ` Mua 2 màn thầu (-${LAC_DUONG_MANTOU_COST_SILVER} bạc, +${LAC_DUONG_MANTOU_HUNGER_GAIN} đói).`;
      } else {
        label += ` Không đủ ${LAC_DUONG_MANTOU_COST_SILVER} bạc để mua màn thầu.`;
      }
      const entry = rollLacDuongEncounter(Math.random());
      if (entry === 'minor') {
        actor.wallet = normalizeMonopolyWallet({ gold: actor.wallet.gold + 1, silver: actor.wallet.silver });
        return `${label} Cơ duyên nhỏ, nhận 1 vàng.`;
      }
      if (entry !== 'maiden') {
        return `${label} Không gặp thêm cơ duyên.`;
      }
      if (playerAvatar && actor.id === playerAvatar.id && playerInventory.length < MONOPOLY_INVENTORY_CAP) {
        playerInventory.push(LAC_DUONG_RING_ITEM);
      }
      const fate = rollLacDuongRingDestiny(Math.random());
      if (fate === 'none') return `${label} Gặp thiếu nữ bí ẩn tặng nhẫn đá cũ, nhưng chưa có cơ duyên tiếp theo.`;
      const targetCell = rollFortuneTargetCell();
      if (targetCell == null) return `${label} Gặp thiếu nữ tặng nhẫn đá cũ, nhưng trận này không còn ô trống để đặt cơ duyên.`;
      fortuneTargets.push({
        cellOneBased: targetCell,
        tier: fate
      });
      const tierLabel = fate === 'major' ? 'lớn' : fate === 'medium' ? 'vừa' : 'nhỏ';
      return `${label} Gặp thiếu nữ tặng nhẫn đá cũ, mở cơ duyên ${tierLabel} tại ô ${targetCell}.`;
    };
    const resolveTrucLamStep = (actor: MonopolyAvatar, cellOneBased: number, isLanding: boolean): string => {
      if (!isLanding || !trucLamCells.has(cellOneBased)) return '';
      actor.status = applyTrucLamThirstRestore(actor.status);
      const thirstGain = Math.round(MONOPOLY_STATUS_CAP * TRUC_LAM_THIRST_RESTORE_RATIO);
      return `${actor.unitName} đạp trúng Trúc Lâm ở ô ${cellOneBased}, hồi ${thirstGain} khát`;
    };

    const resolveYearEventLanding = (actor: MonopolyAvatar, cellOneBased: number): { finalCell: number; label: string } => {
      if (yearEventState.activeEventId === 'spacetime_chaos' && yearEventState.chaosCells.includes(cellOneBased)) {
        const destinations = teleportDestinationCells.filter(candidate => candidate !== cellOneBased);
        const target = pickRandomUniqueCells(destinations, 1, Math.random)[0] ?? cellOneBased;
        actor.currentCellOneBased = target;
        const targetPathIndex = MAIN_TRACK_INDEX_BY_CELL.get(target);
        if (typeof targetPathIndex === 'number') actor.currentPathIndex = targetPathIndex;
        moveAvatarToCell(actor, actor.currentCellOneBased);
        return { finalCell: target, label: `${actor.unitName} chạm Thời Không Loạn Lưu tại ô ${cellOneBased} và bị dịch chuyển tới ô ${target}` };
      }
      if (yearEventState.activeEventId === 'fruit_bounty') {
        const fruitIndex = yearEventState.fruitCells.indexOf(cellOneBased);
        if (fruitIndex >= 0) {
          yearEventState.fruitCells.splice(fruitIndex, 1);
          actor.status = {
            thirst: clampMonopolyStatus(actor.status.thirst + MONOPOLY_FRUIT_BOUNTY_THIRST_GAIN),
            hunger: clampMonopolyStatus(actor.status.hunger + MONOPOLY_FRUIT_BOUNTY_HUNGER_GAIN),
            spirit: clampMonopolyStatus(actor.status.spirit + MONOPOLY_FRUIT_BOUNTY_SPIRIT_GAIN)
          };
          refreshEventCellsUi();
          return {
            finalCell: cellOneBased,
            label: `${actor.unitName} hái trái được mùa ở ô ${cellOneBased} (+${MONOPOLY_FRUIT_BOUNTY_HUNGER_GAIN} đói, +${MONOPOLY_FRUIT_BOUNTY_THIRST_GAIN} khát, +${MONOPOLY_FRUIT_BOUNTY_SPIRIT_GAIN} tinh thần)`
          };
        }
      }
      return { finalCell: cellOneBased, label: '' };
    };
    for (let idx = 0; idx < traversed.length; idx += 1) {
      const steppedCell = traversed[idx] ?? avatar.currentCellOneBased;
      const isLandingStep = idx === traversed.length - 1;
      const eventLanding = isLandingStep ? resolveYearEventLanding(avatar, steppedCell) : { finalCell: steppedCell, label: '' };
      const worldRiftLanding = resolveWorldRiftStep(avatar, eventLanding.finalCell);
      const resolvedCell = worldRiftLanding.finalCell;
      if (isLandingStep) {
        avatar.currentCellOneBased = resolvedCell;
      }
      const previousCell = idx > 0 ? (traversed[idx - 1] ?? avatar.currentCellOneBased) : null;
      const cameFromCluster = previousCell != null && thanhMaoModuleByCell.has(previousCell) && thanhMaoModuleByCell.has(resolvedCell);
      const thanhMaoLabel = isLandingStep ? resolveThanhMaoLanding(avatar, resolvedCell, cameFromCluster) : '';
      const trucLamLabel = resolveTrucLamStep(avatar, resolvedCell, isLandingStep);
      const lacDuongLabel = isLandingStep ? resolveLacDuongStep(avatar, resolvedCell) : '';
      const fortuneLabel = resolveFortuneTarget(avatar, resolvedCell);
      const summary = await resolveHouseStep(avatar, resolvedCell, isLandingStep);
      paidTax += summary.paidTax;
      ownerCollected += summary.ownerCollected;
      if (eventLanding.label) purchaseLabel = eventLanding.label;
      if (worldRiftLanding.label) purchaseLabel = worldRiftLanding.label;
      if (thanhMaoLabel) purchaseLabel = thanhMaoLabel;
      if (trucLamLabel) purchaseLabel = trucLamLabel;
      if (lacDuongLabel) purchaseLabel = lacDuongLabel;
      if (fortuneLabel) purchaseLabel = fortuneLabel;
      if (summary.purchaseLabel) purchaseLabel = summary.purchaseLabel;
      if (summary.upgradeLabel) upgradeLabel = summary.upgradeLabel;
      if (summary.hazardLabel) hazardLabel = summary.hazardLabel;
      if (summary.bankruptLabel) bankruptLabel = summary.bankruptLabel;
      if (summary.killerAvatarId != null) lastHouseKillerId = summary.killerAvatarId;
    }

    const destination = avatar.currentCellOneBased;
    const colliders = avatars.filter(item => item.hasEnteredBoard && item.soulState === 'alive' && item.currentCellOneBased === destination && item.hp > 0);
    const combat = resolveMonopolyCollisionCombat(colliders);
    const killerByVictimId = new Map<number, number | null>();
    for (const target of colliders) {
      const attacks = combat.events.filter(event => event.targetId === target.id);
      if (!attacks.length) continue;
      const top = attacks
        .slice()
        .sort((left, right) => right.damage - left.damage || left.attackerId - right.attackerId)[0];
      if (top) killerByVictimId.set(target.id, top.attackerId);
    }
    combat.affectedAvatars.forEach(affectedId => {
      const affected = avatars.find(item => item.id === affectedId);
      if (!affected) return;
      syncAvatarHealthUi(affected);
    });
    if (avatar.soulState === 'alive' && avatar.hp <= 0) {
      killerByVictimId.set(avatar.id, lastHouseKillerId);
    }
    const deathLabels = processAvatarDeaths(killerByVictimId);

    const yearlyUpdate = applyYearIncomeIfReady();
    const spiritExpirationLabels = processSpiritExpiration();

    const livingAfterCombat = avatars.filter(item => item.soulState === 'alive' && item.hp > 0);
    const activeUndispersed = avatars.filter(item => item.soulState !== 'dispersed');
    if (activeUndispersed.length <= 0) {
      turnBanner.textContent = '🕯️ Toàn bộ avatar đã hồn phi phách tán. Trận đấu kết thúc.';
      syncPlayerWalletUi();
      syncPlayerStatusUi();
      syncInventoryUi();
      syncForgeUi();
      return;
    }
    if (livingAfterCombat.length === 1) {
      const champion = livingAfterCombat[0];
      if (champion && activeUndispersed.length === 1) {
        const reward = computeMonopolyVictoryRewardByGold(champion.wallet);
        turnBanner.textContent = `🏆 ${champion.unitName} (${champion.role.toUpperCase()}) thắng vì đã hạ gục toàn bộ kẻ thù • Quyết toán: ${champion.wallet.gold} vàng → thưởng ${reward}`;
      } else if (champion) {
        turnBanner.textContent = `👻 ${champion.unitName} đang là người sống sót duy nhất, chờ linh hồn tan biến để kết thúc trận`;
      }
      syncPlayerWalletUi();
      syncPlayerStatusUi();
      syncInventoryUi();
      syncForgeUi();
      activeTurnIndex = (activeTurnIndex + 1) % AVATAR_COUNT;
      turnTimer = window.setTimeout(runTurn, TURN_INTERVAL_MS + TURN_ADVANCE_DELAY_MS);
      return;
    }
    const clashCount = colliders.length;
    const combatSummary = combat.events.length > 0
      ? ` • Giao chiến ${clashCount} mục tiêu, ${combat.events.length} đòn thường cùng lúc`
      : '';
    const yearSummary = yearlyUpdate.silverIncome > 0 ? ` • +${yearlyUpdate.silverIncome} bạc/năm cho avatar còn sống` : '';
    const eventSummary = yearlyUpdate.eventLabel ? ` • ${yearlyUpdate.eventLabel}` : (currentYearEventLabel ? ` • ${currentYearEventLabel}` : '');
    const spiritNote = thanhMaoDiceRange.max === 1
      ? ' • Trong cụm Thanh Mao Sơn nên xúc xắc bị khóa 1 ô/turn'
      : (diceMax === 3 ? ` • Tinh thần thấp nên xúc xắc chỉ 1-${diceMax}` : '');
    const faintNote = avatar.skippedTurnCount > 0 ? ' • Tinh thần ≤ 20: lượt kế tiếp sẽ bị mất do ngất' : '';
    const soulNote = avatar.soulState === 'spirit' ? ` • Linh hồn (${Math.max(0, (avatar.soulExpiresAtYear ?? yearsElapsed) - yearsElapsed)} năm còn lại)` : '';
    const deathSummary = deathLabels.length > 0 ? ` • ${deathLabels.join(' • ')}` : '';
    const expirationSummary = spiritExpirationLabels.length > 0 ? ` • ${spiritExpirationLabels.join(' • ')}` : '';
    const houseSummary = purchaseLabel
      ? ` • ${purchaseLabel}`
      : upgradeLabel
        ? ` • ${upgradeLabel}`
      : bankruptLabel
        ? ` • ${bankruptLabel}`
        : hazardLabel
          ? ` • ${hazardLabel}`
        : (paidTax > 0 || ownerCollected > 0)
          ? ` • Nhà: thuế ${paidTax}, chủ thu ${ownerCollected}`
          : '';
    turnBanner.textContent = `Lượt ${avatar.unitName} (${avatar.role.toUpperCase()}) • Xúc xắc: ${dice} • Đến ô ${destination}${combatSummary}${houseSummary}${yearSummary}${eventSummary}${spiritNote}${faintNote}${soulNote}${deathSummary}${expirationSummary}`;
    syncPlayerWalletUi();
    syncPlayerStatusUi();
    syncInventoryUi();
    syncForgeUi();

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

export * from "./house-module.ts";