import { TOKEN_STYLE, CHIBI, CFG } from './config.js';
//v0.7.3
/* ---------- Grid ---------- */
export function makeGrid(canvas, cols, rows){
  const pad = CFG.UI?.PAD ?? 12;
  const w = Math.min(window.innerWidth - pad*2, CFG.UI?.BOARD_MAX_W ?? 900);
  const h = Math.max(
    Math.floor(w * (CFG.UI?.BOARD_H_RATIO ?? (3/7))),
    CFG.UI?.BOARD_MIN_H ?? 220
  );
  canvas.width = w; canvas.height = h;

  const usableW = w - pad * 2;
  const usableH = h - pad * 2;

  const tile = Math.floor(Math.min(usableW / cols, usableH / rows));

  const ox = Math.floor((w - tile*cols)/2);
  const oy = Math.floor((h - tile*rows)/2);
  return { cols, rows, tile, ox, oy, w, h, pad };
}

export function hitToCell(g, px, py){
  const cx = Math.floor((px - g.ox) / g.tile);
  const cy = Math.floor((py - g.oy) / g.tile);
  if (cx<0 || cy<0 || cx>=g.cols || cy>=g.rows) return null;
  return { cx, cy };
}

/* ---------- Tokens ---------- */
export function drawTokens(ctx, g, tokens){
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  const fs = Math.floor(g.tile*0.28);

  tokens.forEach(t=>{
    const {x,y} = cellCenter(g, t.cx, t.cy);
    const r = Math.floor(g.tile*0.36);
    ctx.fillStyle = t.color; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = CFG.COLORS.tokenText; ctx.font = `${fs}px system-ui`;
    ctx.fillText(t.name, x, y);
  });
}

export function cellOccupied(tokens, cx, cy){
  return tokens.some(t => t.cx === cx && t.cy === cy);
}

// queued: { ally:Map(slot→PendingUnit), enemy:Map(...) }
export function cellReserved(tokens, queued, cx, cy){
  // 1) Active đang đứng
  if (cellOccupied(tokens, cx, cy)) return true;
  // 2) Queued (đã trừ cost, đang mờ)
  if (queued){
    const checkQ = (m)=> {
      if (!m || typeof m.values !== 'function') return false;
      for (const p of m.values()){
      if (!p) continue;
        if (p.cx === cx && p.cy === cy) return true;
      }
      return false;
    };
    if (checkQ(queued.ally))  return true;
    if (checkQ(queued.enemy)) return true;
  }
  return false;
}

export function spawnLeaders(tokens, g){
  // Ally leader ở (0,1), Enemy leader ở (6,1)
  tokens.push({ id:'leaderA', name:'Uyên', color:'#6cc8ff', cx:0, cy:1, side:'ally', alive:true });
  tokens.push({ id:'leaderB', name:'Địch', color:'#ff9aa0', cx:g.cols-1, cy:1, side:'enemy', alive:true });
}

/* ---------- Helper ---------- */
export function pickRandom(pool, excludeSet, n = 4){
  const remain = pool.filter(u => !excludeSet.has(u.id));
  for (let i=remain.length-1;i>0;i--){
   const j = (Math.random()*(i+1))|0; const t = remain[i]; remain[i]=remain[j]; remain[j]=t;
 }
 return remain.slice(0, n);
}
// Giữ alias cũ (nếu có file nào khác còn import)
export const pick3Random = (pool, ex) => pickRandom(pool, ex, 3);
// === Grid nghiêng kiểu hình thang (không bị crop) ===

// Biên trái/phải của một "đường hàng" r (cho phép số thực)
// r = 0 là đỉnh trên, r = g.rows là đáy
function _rowLR(g, r, C){
  const colsW = g.tile * g.cols;
  const topScale = C.topScale ?? 0.80;           // 0.75..0.90
  const pinch = (1 - topScale) * colsW;          // lượng "bóp" ở đỉnh
  const t = r / g.rows;                           // 0..1 từ trên xuống dưới
  const width = colsW - pinch * (1 - t);         // càng lên trên càng hẹp
  const left  = g.ox + (colsW - width) / 2;      // cân giữa
  const right = left + width;
  return { left, right };
}

export function drawGridOblique(ctx, g, cam, opts = {}){
  const C = cam || { rowGapRatio:0.62, topScale:0.80, depthScale:0.94 };
  const colors = Object.assign({}, CFG.COLORS, opts.colors||{});
  const rowGap = (C.rowGapRatio ?? 0.62) * g.tile;

  ctx.clearRect(0, 0, g.w, g.h);

  for (let cy=0; cy<g.rows; cy++){
    const yTop = g.oy + cy*rowGap;
    const yBot = g.oy + (cy+1)*rowGap;
    const LRt = _rowLR(g, cy,   C);
    const LRb = _rowLR(g, cy+1, C);

    for (let cx=0; cx<g.cols; cx++){
      // chia đều theo tỉ lệ trên mỗi cạnh
      const xtL = LRt.left +  (cx    / g.cols) * (LRt.right - LRt.left);
      const xtR = LRt.left +  ((cx+1)/ g.cols) * (LRt.right - LRt.left);
      const xbL = LRb.left +  (cx    / g.cols) * (LRb.right - LRb.left);
      const xbR = LRb.left +  ((cx+1)/ g.cols) * (LRb.right - LRb.left);

      // màu theo phe
      let fill;
      if (cx < CFG.ALLY_COLS) fill = colors.ally;
      else if (cx >= g.cols - CFG.ENEMY_COLS) fill = colors.enemy;
      else fill = colors.mid;

      ctx.beginPath();
      ctx.moveTo(xtL, yTop);   // TL
      ctx.lineTo(xtR, yTop);   // TR
      ctx.lineTo(xbR, yBot);   // BR
      ctx.lineTo(xbL, yBot);   // BL
      ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
      ctx.strokeStyle = colors.line; ctx.lineWidth = 1; ctx.stroke();
    }
  }
}

// Hit-test ngược theo hình thang
export function hitToCellOblique(g, px, py, cam){
  const C = cam || { rowGapRatio:0.62, topScale:0.80 };
  const rowGap = (C.rowGapRatio ?? 0.62) * g.tile;

  const r = (py - g.oy) / rowGap;           // chỉ số hàng dạng thực
  if (r < 0 || r >= g.rows) return null;

  const LR = _rowLR(g, r, C);
  const u = (px - LR.left) / (LR.right - LR.left);  // 0..1 trên bề ngang tại hàng r
  if (u < 0 || u >= 1) return null;

  const cx = Math.floor(u * g.cols);
  const cy = Math.floor(r);
  return { cx, cy };
}
// Bốn đỉnh của ô (cx,cy) trong lưới hình thang + tâm ô
function _cellQuadOblique(g, cx, cy, C){
  const rowGap = (C.rowGapRatio ?? 0.62) * g.tile;
  const yTop = g.oy + cy * rowGap;
  const yBot = yTop + rowGap;
  const LRt = _rowLR(g, cy,   C);
  const LRb = _rowLR(g, cy+1, C);

  const xtL = LRt.left +  (cx    / g.cols) * (LRt.right - LRt.left);
  const xtR = LRt.left +  ((cx+1)/ g.cols) * (LRt.right - LRt.left);
  const xbL = LRb.left +  (cx    / g.cols) * (LRb.right - LRb.left);
  const xbR = LRb.left +  ((cx+1)/ g.cols) * (LRb.right - LRb.left);
  return { xtL, xtR, xbL, xbR, yTop, yBot };
}

function _cellCenterOblique(g, cx, cy, C){
  const q = _cellQuadOblique(g, cx, cy, C);
  const x = (q.xtL + q.xtR + q.xbL + q.xbR) / 4;
  const y = (q.yTop + q.yBot) / 2;
  return { x, y };
}

// --- Optional oblique rendering (non-breaking) ---
export function projectCellOblique(g, cx, cy, cam){
  const rowGap = (cam?.rowGapRatio ?? 0.62) * g.tile;
  const skew   = (cam?.skewXPerRow ?? 0.28) * g.tile;
  const k      =  (cam?.depthScale  ?? 0.94);
  // cy: 0=trên (xa), 2=dưới (gần)
  const depth  = (g.rows - 1 - cy);
  const scale  = Math.pow(k, depth);
  const x = g.ox + (cx + 0.5) * g.tile + cy * skew;
  const y = g.oy + (cy + 0.5) * rowGap;
  return { x, y, scale };
}
function drawChibi(ctx, x, y, r, facing = 1, color = '#a9f58c') {
  const lw = Math.max(CHIBI.line, Math.floor(r * 0.28));
  const hr = Math.max(3, Math.floor(r * CHIBI.headR));
  const torso = r * CHIBI.torso;
  const arm = r * CHIBI.arm;
  const leg = r * CHIBI.leg;
  const wep = r * CHIBI.weapon;

  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;

  // đầu
  ctx.beginPath();
  ctx.arc(0, -torso - hr, hr, 0, Math.PI * 2);
  ctx.stroke();

  // thân
  ctx.beginPath();
  ctx.moveTo(0, -torso);
  ctx.lineTo(0, 0);
  ctx.stroke();

  // tay
  ctx.beginPath();
  ctx.moveTo(0, -torso * 0.6);
  ctx.lineTo(-arm * 0.8, -torso * 0.2);             // tay sau
  ctx.moveTo(0, -torso * 0.6);
  ctx.lineTo(arm * 0.8 * facing, -torso * 0.2);     // tay cầm kiếm
  ctx.stroke();

  // chân
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-leg * 0.6, leg * 0.9);
  ctx.moveTo(0, 0);
  ctx.lineTo(leg * 0.6, leg * 0.9);
  ctx.stroke();

  // kiếm
  const hx = arm * 0.8 * facing, hy = -torso * 0.2;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx + wep * facing, hy);
  ctx.stroke();

  ctx.restore();
}
export function drawTokensOblique(ctx, g, tokens, cam){
  const C = cam || { rowGapRatio: 0.62, topScale: 0.80, depthScale: 0.94 };
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const baseR = Math.floor(g.tile * 0.36);
  const k = C.depthScale ?? 0.94; // scale theo chiều sâu

  // Vẽ xa trước – gần sau theo tung độ tâm-ô
  const sorted = tokens.slice().sort((a,b)=>{
    const ya = _cellCenterOblique(g, a.cx, a.cy, C).y;
    const yb = _cellCenterOblique(g, b.cx, b.cy, C).y;
    return ya === yb ? a.cx - b.cx : ya - yb;
  });
    for (const t of sorted){
  if (!t.alive) continue; // chết là thôi vẽ ngay
  const p = _cellCenterOblique(g, t.cx, t.cy, C);
    const depth = g.rows - 1 - t.cy;
    const scale = Math.pow(k, depth);
    const r = Math.max(6, Math.floor(baseR * scale));

    const facing = (t.side === 'ally') ? 1 : -1;

    if (TOKEN_STYLE === 'chibi') {
      // vẽ người que + kiếm
      drawChibi(ctx, p.x, p.y, r, facing, t.color || '#9adcf0');

      // tên (nhỏ, mờ – đặt trên đầu 1.4×r)
      ctx.save();
      ctx.globalAlpha = CHIBI.nameAlpha;
      ctx.fillStyle = CFG.COLORS.tokenText;
      ctx.font = `${Math.floor(r*0.9)}px system-ui`;
      ctx.fillText(t.name || t.id, p.x, p.y - r * 1.4);
      ctx.restore();
    } else {
      // fallback: đĩa tròn cũ (giữ lại nếu cần so sánh)
      ctx.fillStyle = t.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = CFG.COLORS.tokenText;
      ctx.font = `${Math.floor(r*0.9)}px system-ui`;
      ctx.fillText(t.name, p.x, p.y);
    }
  }
}
 
// (W2-J2) Vẽ “Chờ Lượt” – silhouette mờ/tối, chỉ hiển thị theo flag DEBUG
export function drawQueuedOblique(ctx, g, queued, cam){
 if (!queued) return;
 const C = cam || { rowGapRatio: 0.62, topScale: 0.80, depthScale: 0.94 };
 const baseR = Math.floor(g.tile * 0.36);
 const k = C.depthScale ?? 0.94;

 function drawSide(map, side){
  if (!map) return;
   // Ally thấy theo SHOW_QUEUED; enemy ẩn trừ khi bật SHOW_QUEUED_ENEMY
  if (side === 'ally'  && !(CFG.DEBUG?.SHOW_QUEUED)) return;
   if (side === 'enemy' && !(CFG.DEBUG?.SHOW_QUEUED_ENEMY)) return;
   for (const p of map.values()){
    const c = _cellCenterOblique(g, p.cx, p.cy, C);
    const depth = g.rows - 1 - p.cy;
    const r = Math.max(6, Math.floor(baseR * Math.pow(k, depth)));
     ctx.save();
     ctx.globalAlpha = 0.5;          // mờ/tối
    ctx.fillStyle = p.color || '#5b6a78';
     ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
 }
  drawSide(queued.ally,  'ally');
  drawSide(queued.enemy, 'enemy');
}

/* ---------- TURN/ZONE HELPERS (W1-J1) ---------- */
export const SIDE = { ALLY: 'ally', ENEMY: 'enemy' };

// Trả về chỉ số lượt 1..9 của ô (cx,cy) theo phe
export function slotIndex(side, cx, cy){
  if (side === SIDE.ALLY || side === 'ally'){
   // Ally: c=2 → 1..3 (trên→dưới), c=1 → 4..6, c=0 → 7..9
    return (CFG.ALLY_COLS - 1 - cx) * 3 + (cy + 1);
 } else {
   // Enemy: c=4 → 1..3 (dưới→trên), c=5 → 4..6, c=6 → 7..9
   const enemyStart = CFG.GRID_COLS - CFG.ENEMY_COLS; // 7-3=4
   const colIndex = cx - enemyStart;                   // 0..2
   return colIndex * 3 + (3 - cy);
  }
}

// Ngược lại: từ slot (1..9) suy ra (cx,cy) theo phe
export function slotToCell(side, slot){
 const s = Math.max(1, Math.min(9, slot|0));
 const colIndex = Math.floor((s - 1) / 3); // 0..2 (gần mid → xa)
  const rowIndex = (s - 1) % 3;             // 0..2
 if (side === SIDE.ALLY || side === 'ally'){
   const cx = (CFG.ALLY_COLS - 1) - colIndex; // 2,1,0
   const cy = rowIndex;                       // 0..2 (trên→dưới)
  return { cx, cy };
  } else {
    const enemyStart = CFG.GRID_COLS - CFG.ENEMY_COLS; // 4
   const cx = enemyStart + colIndex;                  // 4,5,6
    const cy = 2 - rowIndex;                           // 2,1,0 (dưới→trên)
   return { cx, cy };
 }
}

// Gán nhãn “mã vùng” cho AI/AoE (A1..A9 | E1..E9) hoặc mã số tileId
export function zoneCode(side, cx, cy, { numeric=false } = {}){
  const slot = slotIndex(side, cx, cy);
  if (numeric) return (side === SIDE.ALLY || side === 'ally' ? 0 : 1) * 16 + slot;
 const pfx = (side === SIDE.ALLY || side === 'ally') ? 'A' : 'E';
  return pfx + String(slot);
}

// Bảng tra cứu thuận tiện (chưa dùng nhưng hữu ích cho AI/visual debug)
export const ORDER_ALLY  = Array.from({length:9}, (_,i)=> slotToCell(SIDE.ALLY,  i+1));
export const ORDER_ENEMY = Array.from({length:9}, (_,i)=> slotToCell(SIDE.ENEMY, i+1));