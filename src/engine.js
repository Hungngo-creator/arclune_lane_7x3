import { TOKEN_STYLE, CHIBI, CFG } from './config.js';
import { getUnitArt, getUnitSkin } from './art.js';
//v0.7.3
/* ---------- Grid ---------- */
export function makeGrid(canvas, cols, rows){
  const pad = (CFG.UI?.PAD) ?? 12;
  const w = Math.min(window.innerWidth - pad*2, (CFG.UI?.BOARD_MAX_W) ?? 900);
  const h = Math.max(
    Math.floor(w * ((CFG.UI?.BOARD_H_RATIO) ?? (3/7))),
    (CFG.UI?.BOARD_MIN_H) ?? 220
  );

const maxDprCfg = CFG.UI?.MAX_DPR;
  const maxDpr = Number.isFinite(maxDprCfg) && maxDprCfg > 0 ? maxDprCfg : 3;
  const dprRaw = (typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio))
    ? window.devicePixelRatio
    : 1;
  const dprSafe = dprRaw > 0 ? dprRaw : 1;
  const dpr = Math.min(maxDpr, dprSafe);

  const displayW = w;
  const displayH = h;
  const pixelW = Math.round(displayW * dpr);
  const pixelH = Math.round(displayH * dpr);

  if (canvas){
    if (canvas.style){
      canvas.style.width = `${displayW}px`;
      canvas.style.height = `${displayH}px`;
    }
    if (canvas.width !== pixelW) canvas.width = pixelW;
    if (canvas.height !== pixelH) canvas.height = pixelH;
  }

  const usableW = displayW - pad * 2;
  const usableH = displayH - pad * 2;

  const tile = Math.floor(Math.min(usableW / cols, usableH / rows));

  const ox = Math.floor((displayW - tile*cols)/2);
  const oy = Math.floor((displayH - tile*rows)/2);
  return { cols, rows, tile, ox, oy, w: displayW, h: displayH, pad, dpr };
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
  const artAlly = getUnitArt('leaderA');
  const artEnemy = getUnitArt('leaderB');
  tokens.push({ id:'leaderA', name:'Uyên', color:'#6cc8ff', cx:0, cy:1, side:'ally', alive:true, art: artAlly, skinKey: artAlly?.skinKey });
  tokens.push({ id:'leaderB', name:'Địch', color:'#ff9aa0', cx:g.cols-1, cy:1, side:'enemy', alive:true, art: artEnemy, skinKey: artEnemy?.skinKey });
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
  const rowGap = ((cam?.rowGapRatio) ?? 0.62) * g.tile;
  const skew   = ((cam?.skewXPerRow) ?? 0.28) * g.tile;
  const k      =  ((cam?.depthScale)  ?? 0.94);
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

const SPRITE_CACHE = new Map();
export const ART_SPRITE_EVENT = 'unit-art:sprite-loaded';

function ensureTokenArt(token){
  if (!token) return null;
  const desiredSkin = getUnitSkin(token.id);
  if (!token.art || token.skinKey !== desiredSkin){
    const art = getUnitArt(token.id, { skinKey: desiredSkin });
    token.art = art;
    token.skinKey = art?.skinKey ?? desiredSkin ?? null;
  }
  return token.art;
}

export function ensureSpriteLoaded(art){
  if (!art || !art.sprite || typeof Image === 'undefined') return null;
  const descriptor = typeof art.sprite === 'string' ? { src: art.sprite } : art.sprite;
  if (!descriptor || !descriptor.src) return null;
  const skinId = descriptor.skinId ?? art.skinKey ?? null;
  const key = descriptor.cacheKey || `${descriptor.src}::${skinId ?? ''}`;
  let entry = SPRITE_CACHE.get(key);
  if (!entry){
    const img = new Image();
    entry = { status: 'loading', img, key, src: descriptor.src, skinId };
    if ('decoding' in img) img.decoding = 'async';
    img.onload = ()=>{
      entry.status = 'ready';
      if (typeof window !== 'undefined'){
        try {
          window.dispatchEvent(new Event(ART_SPRITE_EVENT));
        } catch(_){}
      }
    };
    img.onerror = ()=>{
      entry.status = 'error';
    };
    img.src = descriptor.src;
    SPRITE_CACHE.set(key, entry);
  }
  return entry;
}

function drawStylizedShape(ctx, width, height, anchor, art){
  const palette = art?.palette || {};
  const primary = palette.primary || '#86c4ff';
  const secondary = palette.secondary || '#1f3242';
  const accent = palette.accent || '#d2f4ff';
  const outline = palette.outline || 'rgba(0,0,0,0.55)';
  const top = -height * anchor;
  const bottom = height - height * anchor;
  const halfW = width / 2;
  const shape = art?.shape || 'sentinel';
  const gradient = ctx.createLinearGradient(0, top, 0, bottom);
  gradient.addColorStop(0, primary);
  gradient.addColorStop(1, secondary);

  ctx.save();
  ctx.beginPath();
  switch(shape){
    case 'wing': {
      ctx.moveTo(-halfW * 0.92, bottom * 0.35);
      ctx.quadraticCurveTo(-halfW * 1.05, top + height * 0.1, 0, top);
      ctx.quadraticCurveTo(halfW * 1.05, top + height * 0.2, halfW * 0.9, bottom * 0.4);
      ctx.quadraticCurveTo(halfW * 0.45, bottom * 0.92, 0, bottom);
      ctx.quadraticCurveTo(-halfW * 0.4, bottom * 0.86, -halfW * 0.92, bottom * 0.35);
      break;
    }
    case 'rune': {
      ctx.moveTo(0, top);
      ctx.lineTo(halfW, top + height * 0.42);
      ctx.lineTo(0, bottom);
      ctx.lineTo(-halfW, top + height * 0.42);
      break;
    }
    case 'bloom': {
      ctx.moveTo(0, top);
      ctx.bezierCurveTo(halfW * 0.8, top + height * 0.05, halfW * 1.05, top + height * 0.45, halfW * 0.78, bottom * 0.38);
      ctx.bezierCurveTo(halfW * 0.68, bottom * 0.92, halfW * 0.2, bottom, 0, bottom);
      ctx.bezierCurveTo(-halfW * 0.2, bottom, -halfW * 0.68, bottom * 0.92, -halfW * 0.78, bottom * 0.38);
      ctx.bezierCurveTo(-halfW * 1.05, top + height * 0.45, -halfW * 0.8, top + height * 0.05, 0, top);
      break;
    }
    case 'pike': {
      ctx.moveTo(0, top);
      ctx.lineTo(halfW * 0.92, top + height * 0.32);
      ctx.lineTo(halfW * 0.52, bottom);
      ctx.lineTo(-halfW * 0.52, bottom);
      ctx.lineTo(-halfW * 0.92, top + height * 0.32);
      break;
    }
    case 'shield':
    case 'sentinel':
    default: {
      ctx.moveTo(0, top);
      ctx.bezierCurveTo(halfW, top + height * 0.22, halfW * 0.85, bottom * 0.16, 0, bottom);
      ctx.bezierCurveTo(-halfW * 0.85, bottom * 0.16, -halfW, top + height * 0.22, 0, top);
      break;
    }
  }
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.lineWidth = Math.max(2, width * 0.06);
  ctx.strokeStyle = outline;
  ctx.stroke();

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(-halfW * 0.58, top + height * 0.22);
  ctx.quadraticCurveTo(0, top + height * 0.05, halfW * 0.58, top + height * 0.22);
  ctx.quadraticCurveTo(halfW * 0.2, top + height * 0.32, 0, top + height * 0.28);
  ctx.quadraticCurveTo(-halfW * 0.2, top + height * 0.32, -halfW * 0.58, top + height * 0.22);
  ctx.fill();
  ctx.restore();
}

function roundedRectPath(ctx, x, y, w, h, radius){
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function formatName(text){
  if (!text) return '';
  const str = String(text);
  if (str.length <= 16) return str;
  return `${str.slice(0, 15)}…`;
}

function drawNameplate(ctx, text, x, y, r, art){
  if (!text) return;
  const layout = art?.layout || {};
  const fontSize = Math.max(11, Math.floor(r * (layout.labelFont || 0.7)));
  const padX = Math.max(8, Math.floor(fontSize * 0.6));
  const padY = Math.max(4, Math.floor(fontSize * 0.35));
  ctx.save();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.font = `${fontSize}px 'Be Vietnam Pro', 'Inter', system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const metrics = ctx.measureText(text);
  const width = Math.ceil(metrics.width + padX * 2);
  const height = Math.ceil(fontSize + padY * 2);
  const radius = Math.max(4, Math.floor(height / 2));
  const boxX = Math.round(x - width / 2);
  const boxY = Math.round(y - height / 2);
  roundedRectPath(ctx, boxX, boxY, width, height, radius);
  ctx.fillStyle = art?.label?.bg || 'rgba(12,20,30,0.82)';
  ctx.fill();
  if (art?.label?.stroke){
    ctx.strokeStyle = art.label.stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.fillStyle = art?.label?.text || '#f4f8ff';
  ctx.fillText(text, x, boxY + height / 2);
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
      
    const art = ensureTokenArt(t);
    const layout = art?.layout || {};
    const spriteCfg = art?.sprite || {};
    const spriteHeightMult = layout.spriteHeight || 2.4;
    const spriteScale = Number.isFinite(spriteCfg.scale) ? spriteCfg.scale : 1;
    const spriteHeight = r * spriteHeightMult * ((art?.size) ?? 1) * spriteScale;
    const spriteAspect = (Number.isFinite(spriteCfg.aspect) ? spriteCfg.aspect : null) || layout.spriteAspect || 0.78;
    const spriteWidth = spriteHeight * spriteAspect;
    const anchor = Number.isFinite(spriteCfg.anchor) ? spriteCfg.anchor : (layout.anchor ?? 0.78);
    const hasRichArt = !!(art && ((spriteCfg && spriteCfg.src) || art.shape));

    if (hasRichArt){
      const spriteEntry = ensureSpriteLoaded(art);
      const spriteReady = spriteEntry && spriteEntry.status === 'ready' && spriteEntry.img;
      ctx.save();
      ctx.translate(p.x, p.y);
      if (facing === -1 && art?.mirror !== false) ctx.scale(-1, 1);
      const shadow = spriteCfg?.shadow;
      const shadowColor = shadow?.color || art?.glow || art?.shadow || 'rgba(0,0,0,0.35)';
      const shadowBlur = Number.isFinite(shadow?.blur) ? shadow.blur : Math.max(6, r * 0.7);
      const shadowOffsetX = Number.isFinite(shadow?.offsetX) ? shadow.offsetX : 0;
      const shadowOffsetY = Number.isFinite(shadow?.offsetY) ? shadow.offsetY : Math.max(2, r * 0.2);
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetX = shadowOffsetX;
      ctx.shadowOffsetY = shadowOffsetY;
      if (spriteReady){
        ctx.drawImage(spriteEntry.img, -spriteWidth/2, -spriteHeight*anchor, spriteWidth, spriteHeight);
      } else {
        drawStylizedShape(ctx, spriteWidth, spriteHeight, anchor, art);
      }
      ctx.restore();
      } else if (TOKEN_STYLE === 'chibi') {
      drawChibi(ctx, p.x, p.y, r, facing, t.color || '#9adcf0');
    } else {
      ctx.fillStyle = t.color || '#9adcf0';
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI*2);
      ctx.fill();
    }

    if (art?.label !== false){
      const name = formatName(t.name || t.id);
      const offset = layout.labelOffset ?? 1.2;
      drawNameplate(ctx, name, p.x, p.y + r * offset, r, art);
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
