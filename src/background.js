import { CFG } from './config.js';
import { projectCellOblique, ensureSpriteLoaded } from './engine.js';

const BACKGROUND_PROP_CACHE = new WeakMap();

function stableStringify(value, seen = new WeakSet()){
  if (value === null) return 'null';
  const type = typeof value;
  if (type === 'undefined') return 'undefined';
  if (type === 'number' || type === 'boolean') return String(value);
  if (type === 'string') return JSON.stringify(value);
  if (type === 'symbol') return value.toString();
  if (type === 'function') return `[Function:${value.name || 'anonymous'}]`;
  if (Array.isArray(value)){
    return `[${value.map(v => stableStringify(v, seen)).join(',')}]`;
  }
  if (type === 'object'){
    if (seen.has(value)) return '"[Circular]"';
    seen.add(value);
    const keys = Object.keys(value).sort();
    const entries = keys.map(key => `${JSON.stringify(key)}:${stableStringify(value[key], seen)}`);
    seen.delete(value);
    return `{${entries.join(',')}}`;
  }
  return String(value);
}

function computePropsSignature(props){
  if (!Array.isArray(props) || !props.length) return 'len:0';
  try {
    return stableStringify(props);
  } catch(_){
    return `len:${props.length}`;
  }
}

function getBoardSignature(g, cam){
  if (!g) return 'no-grid';
  const baseParts = [
    g.cols,
    g.rows,
    g.tile,
    g.ox,
    g.oy,
    g.w,
    g.h,
    g.pad,
    g.dpr
  ];
  const camParts = [
    cam?.rowGapRatio ?? 'rg',
    cam?.skewXPerRow ?? 'sk',
    cam?.depthScale ?? 'ds'
  ];
  return [...baseParts, ...camParts].join('|');
}

export const ENVIRONMENT_PROP_TYPES = {
  'stone-obelisk': {
    asset: 'dist/assets/environment/stone-obelisk.svg',
    size: { w: 120, h: 220 },
    anchor: { x: 0.5, y: 1 },
    baseLift: 0.52,
    fallback: { shape: 'obelisk' },
    palette: {
      primary: '#d6e2fb',
      secondary: '#7d8ba9',
      accent: '#f7fbff',
      shadow: '#2c3346',
      outline: 'rgba(16,20,32,0.78)'
    }
  },
  'sun-banner': {
    asset: 'dist/assets/environment/sun-banner.svg',
    size: { w: 140, h: 200 },
    anchor: { x: 0.5, y: 1 },
    baseLift: 0.56,
    fallback: { shape: 'banner' },
    palette: {
      primary: '#ffe3a6',
      secondary: '#d47b3a',
      accent: '#fff4d1',
      shadow: '#6d3218',
      outline: 'rgba(46,23,11,0.78)'
    }
  }
};

function resolveBackground(backgroundKey){
  const backgrounds = CFG.BACKGROUNDS || {};
  if (!backgrounds || typeof backgrounds !== 'object') return null;
  if (backgroundKey && backgrounds[backgroundKey]){
    return { key: backgroundKey, config: backgrounds[backgroundKey] };
  }
  const preferred = CFG.CURRENT_BACKGROUND || CFG.SCENE?.CURRENT_BACKGROUND;
  if (preferred && backgrounds[preferred]){
    return { key: preferred, config: backgrounds[preferred] };
  }
  const themeKey = CFG.SCENE?.CURRENT_THEME || CFG.SCENE?.DEFAULT_THEME;
  if (themeKey && backgrounds[themeKey]){
    return { key: themeKey, config: backgrounds[themeKey] };
  }
  const fallbackKey = Object.keys(backgrounds)[0];
  if (fallbackKey){
    return { key: fallbackKey, config: backgrounds[fallbackKey] };
  }
  return null;
}

function normalizePropConfig(propCfg){
  if (!propCfg) return null;
  const typeId = propCfg.type || propCfg.kind;
  const typeDef = typeId ? ENVIRONMENT_PROP_TYPES[typeId] : null;
  const anchor = {
    x: propCfg.anchor?.x ?? typeDef?.anchor?.x ?? 0.5,
    y: propCfg.anchor?.y ?? typeDef?.anchor?.y ?? 1
  };
  const size = {
    w: propCfg.size?.w ?? typeDef?.size?.w ?? 120,
    h: propCfg.size?.h ?? typeDef?.size?.h ?? 180
  };
  const palette = {
    ...(typeDef?.palette || {}),
    ...(propCfg.palette || {})
  };
  return {
    type: typeId,
    asset: propCfg.asset ?? typeDef?.asset ?? null,
    fallback: propCfg.fallback ?? typeDef?.fallback ?? null,
    palette,
    anchor,
    size,
    cell: {
      cx: propCfg.cx ?? propCfg.cell?.cx ?? 0,
      cy: propCfg.cy ?? propCfg.cell?.cy ?? 0
    },
    depth: propCfg.depth ?? propCfg.cell?.depth ?? 0,
    baseLift: propCfg.baseLift ?? typeDef?.baseLift ?? 0.5,
    offset: {
      x: propCfg.offset?.x ?? 0,
      y: propCfg.offset?.y ?? 0
    },
    pixelOffset: {
      x: propCfg.pixelOffset?.x ?? 0,
      y: propCfg.pixelOffset?.y ?? 0
    },
    scale: propCfg.scale ?? 1,
    alpha: propCfg.alpha ?? 1,
    flip: propCfg.flip ?? 1,
    sortBias: propCfg.sortBias ?? 0
  };
}

function getBackgroundPropCache(config){
  if (!config) return null;
  const props = Array.isArray(config.props) ? config.props : [];
  const signature = computePropsSignature(props);
  let cache = BACKGROUND_PROP_CACHE.get(config);
  if (!cache || cache.signature !== signature){
    const normalizedProps = [];
    for (const rawProp of props){
      const prop = normalizePropConfig(rawProp);
      if (!prop) continue;
      const cyWithDepth = prop.cell.cy + (prop.depth ?? 0);
      const spriteEntry = prop.asset ? ensureSpriteLoaded({ sprite: prop.asset }) : null;
      normalizedProps.push({
        prop,
        base: {
          cx: prop.cell.cx,
          cyWithDepth
        },
        spriteEntry
      });
    }
    cache = {
      signature,
      normalizedProps,
      boardStates: new Map()
    };
    BACKGROUND_PROP_CACHE.set(config, cache);
  }
  return cache;
}

function buildBoardState(normalizedProps, g, cam){
  if (!g) return null;
  const rowGap = ((cam?.rowGapRatio) ?? 0.62) * g.tile;
  const drawables = [];
  for (const entry of normalizedProps){
    if (!entry?.prop) continue;
    const { prop, base } = entry;
    const projection = projectCellOblique(g, base.cx, base.cyWithDepth, cam);
    const scale = projection.scale * prop.scale;
    const spriteEntry = entry.spriteEntry || (prop.asset ? ensureSpriteLoaded({ sprite: prop.asset }) : null);
    entry.spriteEntry = spriteEntry;
    drawables.push({
      prop,
      x: projection.x + prop.offset.x * g.tile + prop.pixelOffset.x,
      y: projection.y + (prop.baseLift ?? 0.5) * rowGap + prop.offset.y * rowGap + prop.pixelOffset.y,
      scale,
      spriteEntry,
      sortY: projection.y + prop.sortBias
    });
  }
  drawables.sort((a, b) => a.sortY - b.sortY);
  return {
    signature: getBoardSignature(g, cam),
    drawables
  };
}

function drawFallback(ctx, width, height, anchor, palette, fallback){
  const primary = palette?.primary || '#ccd7ec';
  const secondary = palette?.secondary || '#7b86a1';
  const accent = palette?.accent || '#f4f7ff';
  const shadow = palette?.shadow || 'rgba(18,22,34,0.65)';
  const outline = palette?.outline || 'rgba(12,18,28,0.9)';
  const top = -height * (anchor?.y ?? 1);
  const bottom = top + height;
  const halfW = width / 2;
  ctx.save();
  ctx.beginPath();
  switch(fallback?.shape){
    case 'banner': {
      ctx.moveTo(-halfW * 0.65, top + height * 0.08);
      ctx.lineTo(halfW * 0.65, top + height * 0.08);
      ctx.lineTo(halfW * 0.65, bottom - height * 0.35);
      ctx.lineTo(0, bottom);
      ctx.lineTo(-halfW * 0.65, bottom - height * 0.35);
      ctx.closePath();
      ctx.fillStyle = primary;
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.lineWidth = Math.max(2, width * 0.05);
      ctx.stroke();
      ctx.fillStyle = secondary;
      ctx.fillRect(-halfW * 0.65, top + height * 0.02, halfW * 1.3, height * 0.12);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(0, top + height * 0.38, width * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = shadow;
      ctx.lineWidth = Math.max(2, width * 0.04);
      ctx.stroke();
      break;
    }
    case 'obelisk':
    default: {
      ctx.moveTo(0, top);
      ctx.lineTo(halfW * 0.7, top + height * 0.12);
      ctx.lineTo(halfW * 0.54, bottom);
      ctx.lineTo(-halfW * 0.54, bottom);
      ctx.lineTo(-halfW * 0.7, top + height * 0.12);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, top, 0, bottom);
      grad.addColorStop(0, primary);
      grad.addColorStop(1, secondary);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.lineWidth = Math.max(2, width * 0.05);
      ctx.stroke();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(-halfW * 0.25, top + height * 0.22);
      ctx.lineTo(-halfW * 0.12, top + height * 0.08);
      ctx.lineTo(halfW * 0.18, top + height * 0.18);
      ctx.lineTo(halfW * 0.12, top + height * 0.34);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = shadow;
      ctx.beginPath();
      ctx.moveTo(-halfW * 0.38, top + height * 0.16);
      ctx.lineTo(-halfW * 0.24, bottom - height * 0.08);
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

export function drawEnvironmentProps(ctx, g, cam, backgroundKey){
  if (!ctx || !g) return;
  const resolved = resolveBackground(backgroundKey);
  if (!resolved) return;
  const { config } = resolved;
  if (!config || config.enabled === false) return;
  const cache = getBackgroundPropCache(config);
  const normalizedProps = cache?.normalizedProps;
  if (!normalizedProps || !normalizedProps.length) return;

  const boardSignature = getBoardSignature(g, cam);
  let boardState = cache.boardStates.get(boardSignature);
  if (!boardState){
    boardState = buildBoardState(normalizedProps, g, cam);
    if (!boardState) return;
    cache.boardStates.set(boardSignature, boardState);
  }

  for (const item of boardState.drawables){
    const { prop } = item;
    let width = prop.size.w * item.scale;
    let height = prop.size.h * item.scale;
    const spriteEntry = item.spriteEntry;
    if (spriteEntry && spriteEntry.status === 'ready' && spriteEntry.img){
      const naturalW = spriteEntry.img.naturalWidth || prop.size.w;
      const naturalH = spriteEntry.img.naturalHeight || prop.size.h;
      width = naturalW * item.scale;
      height = naturalH * item.scale;
    }
    ctx.save();
    ctx.globalAlpha = prop.alpha;
    ctx.translate(item.x, item.y);
    if (prop.flip === -1){
      ctx.scale(-1, 1);
    }
    const drawX = -width * (prop.anchor.x ?? 0.5);
    const drawY = -height * (prop.anchor.y ?? 1);
    if (spriteEntry && spriteEntry.status === 'ready' && spriteEntry.img){
      ctx.drawImage(spriteEntry.img, drawX, drawY, width, height);
    } else {
      drawFallback(ctx, width, height, prop.anchor, prop.palette, prop.fallback);
    }
    ctx.restore();
  }
}

export function getEnvironmentBackground(backgroundKey){
  const resolved = resolveBackground(backgroundKey);
  return resolved ? resolved.config : null;
}