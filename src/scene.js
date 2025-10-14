const DEFAULT_THEME = {
  sky: {
    top: '#1b2434',
    mid: '#2f455e',
    bottom: '#55759a',
    glow: 'rgba(255, 236, 205, 0.35)'
  },
  horizon: {
    color: '#f4d9ad',
    glow: 'rgba(255, 236, 205, 0.55)',
    height: 0.22,
    thickness: 0.9
  },
  ground: {
    top: '#312724',
    accent: '#3f302c',
    bottom: '#181210',
    highlight: '#6c5344',
    parallax: 0.12,
    topScale: 0.9,
    bottomScale: 1.45
  }
};

function mergeTheme(theme){
  if (!theme) return DEFAULT_THEME;
  return {
    sky: { ...DEFAULT_THEME.sky, ...(theme.sky || {}) },
    horizon: { ...DEFAULT_THEME.horizon, ...(theme.horizon || {}) },
    ground: { ...DEFAULT_THEME.ground, ...(theme.ground || {}) }
  };
}

function hexToRgb(hex){
  if (typeof hex !== 'string') return null;
  let value = hex.trim();
  if (!value.startsWith('#')) return null;
  value = value.slice(1);
  if (value.length === 3){
    value = value.split('').map(ch => ch + ch).join('');
  }
  if (value.length !== 6) return null;
  const num = Number.parseInt(value, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff
  };
}

function mixHex(a, b, t){
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (!ca || !cb) return t < 0.5 ? (a || b) : (b || a);
  const mix = (x, y)=> Math.round(x + (y - x) * t);
  const r = mix(ca.r, cb.r);
  const g = mix(ca.g, cb.g);
  const bVal = mix(ca.b, cb.b);
  return `rgb(${r}, ${g}, ${bVal})`;
}

export function drawBattlefieldScene(ctx, g, theme){
  if (!ctx || !g) return;
  const t = mergeTheme(theme);
  const w = g.w ?? ctx.canvas.width;
  const h = g.h ?? ctx.canvas.height;
  const boardTop = g.oy;
  const boardHeight = g.tile * g.rows;
  const boardBottom = boardTop + boardHeight;
  const centerX = g.ox + (g.tile * g.cols) / 2;

  ctx.save();

  // --- Sky gradient ---
  const skyGradient = ctx.createLinearGradient(0, 0, 0, boardBottom);
  skyGradient.addColorStop(0, t.sky.top);
  skyGradient.addColorStop(0.55, t.sky.mid);
  skyGradient.addColorStop(1, t.sky.bottom);
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, w, boardBottom);

  // extend sky color below the board in case the canvas is taller
  if (boardBottom < h){
    ctx.fillStyle = t.sky.bottom;
    ctx.fillRect(0, boardBottom, w, h - boardBottom);
  }

  // --- Horizon glow band ---
  const horizonY = boardTop + Math.min(Math.max(t.horizon.height, 0), 1) * boardHeight;
  const glowHeight = Math.max(4, g.tile * t.horizon.thickness);
  const glowGradient = ctx.createLinearGradient(0, horizonY - glowHeight, 0, horizonY + glowHeight);
  glowGradient.addColorStop(0, 'rgba(0,0,0,0)');
  glowGradient.addColorStop(0.45, t.horizon.glow);
  glowGradient.addColorStop(0.55, t.horizon.glow);
  glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowGradient;
  ctx.fillRect(0, Math.max(0, horizonY - glowHeight), w, glowHeight * 2);

  // Horizon line
  ctx.strokeStyle = t.horizon.color;
  ctx.lineWidth = Math.max(1, g.tile * 0.05);
  ctx.beginPath();
  ctx.moveTo(g.ox - g.tile, horizonY);
  ctx.lineTo(g.ox + g.tile * g.cols + g.tile, horizonY);
  ctx.stroke();

  // --- Ground base ---
  const groundTopWidth = g.tile * g.cols * t.ground.topScale;
  const groundBottomWidth = g.tile * g.cols * t.ground.bottomScale;
  const groundTop = boardTop + g.tile * 0.35;
  const groundBottom = h;
  const groundGradient = ctx.createLinearGradient(0, groundTop, 0, groundBottom);
  groundGradient.addColorStop(0, t.ground.top);
  groundGradient.addColorStop(0.45, t.ground.accent);
  groundGradient.addColorStop(1, t.ground.bottom);

  ctx.fillStyle = groundGradient;
  ctx.beginPath();
  ctx.moveTo(centerX - groundTopWidth / 2, groundTop);
  ctx.lineTo(centerX + groundTopWidth / 2, groundTop);
  ctx.lineTo(centerX + groundBottomWidth / 2, groundBottom);
  ctx.lineTo(centerX - groundBottomWidth / 2, groundBottom);
  ctx.closePath();
  ctx.fill();

  // --- Parallax stripes ---
  const layerCount = Math.max(4, g.rows * 2);
  const parallaxStrength = t.ground.parallax * g.tile;
  for (let i = 0; i < layerCount; i++){
    const t0 = i / layerCount;
    const t1 = (i + 1) / layerCount;
    const width0 = groundTopWidth + (groundBottomWidth - groundTopWidth) * t0;
    const width1 = groundTopWidth + (groundBottomWidth - groundTopWidth) * t1;
    const shift0 = (t0 - 0.5) * parallaxStrength;
    const shift1 = (t1 - 0.5) * parallaxStrength;
    const y0 = groundTop + (groundBottom - groundTop) * t0;
    const y1 = groundTop + (groundBottom - groundTop) * t1;
    const shade = mixHex(t.ground.highlight, t.ground.bottom, Math.pow(t0, 1.2));

    ctx.globalAlpha = 0.28;
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.moveTo(centerX - width0 / 2 + shift0, y0);
    ctx.lineTo(centerX + width0 / 2 + shift0, y0);
    ctx.lineTo(centerX + width1 / 2 + shift1, y1);
    ctx.lineTo(centerX - width1 / 2 + shift1, y1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // subtle rim light near the board edge
  const rimGradient = ctx.createLinearGradient(0, boardBottom - g.tile * 0.4, 0, boardBottom + g.tile);
  rimGradient.addColorStop(0, 'rgba(255,255,255,0.25)');
  rimGradient.addColorStop(0.4, 'rgba(255,255,255,0.08)');
  rimGradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rimGradient;
  ctx.beginPath();
  ctx.moveTo(centerX - groundTopWidth / 2, boardBottom - g.tile * 0.4);
  ctx.lineTo(centerX + groundTopWidth / 2, boardBottom - g.tile * 0.4);
  ctx.lineTo(centerX + groundTopWidth / 2, boardBottom + g.tile);
  ctx.lineTo(centerX - groundTopWidth / 2, boardBottom + g.tile);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}