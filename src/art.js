// v0.7.7 – Unit art catalog

function svgData(width, height, body){
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function sanitizeId(base, palette){
  const seed = `${palette.primary || ''}${palette.secondary || ''}${palette.accent || ''}`.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  return `${base}${seed}` || `${base}0`;
}

function svgShield(palette){
  const gradId = sanitizeId('gradShield', palette);
  const light = palette.accent || '#f4f8ff';
  const outline = palette.outline || 'rgba(12,18,26,0.85)';
  const body = `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${palette.primary || '#7abfff'}"/>
        <stop offset="100%" stop-color="${palette.secondary || '#12344b'}"/>
      </linearGradient>
    </defs>
    <path d="M48 4 L92 22 L82 84 L48 112 L14 84 L4 22 Z" fill="url(#${gradId})" stroke="${outline}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M48 20 L74 30 L66 70 L48 86 L30 70 L22 30 Z" fill="${light}" opacity="0.32"/>
    <path d="M48 44 L60 52 L48 74 L36 52 Z" fill="${light}" opacity="0.55"/>
    <circle cx="48" cy="44" r="6" fill="${light}" opacity="0.8"/>
  `;
  return svgData(96, 120, body);
}

function svgWing(palette){
  const gradId = sanitizeId('gradWing', palette);
  const accent = palette.accent || '#ffe2e6';
  const outline = palette.outline || 'rgba(24,12,16,0.85)';
  const body = `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${palette.primary || '#ffb3bc'}"/>
        <stop offset="100%" stop-color="${palette.secondary || '#4c1a23'}"/>
      </linearGradient>
    </defs>
    <path d="M16 100 C10 66 18 30 42 12 C64 -2 94 8 110 28 C106 58 88 96 52 116 Z" fill="url(#${gradId})" stroke="${outline}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M36 34 C50 26 72 26 84 42 C76 60 64 74 48 84 C34 72 32 54 36 34 Z" fill="${accent}" opacity="0.38"/>
    <path d="M48 52 C60 48 74 50 82 58 C70 74 60 88 46 96 C40 84 42 66 48 52 Z" fill="${accent}" opacity="0.45"/>
  `;
  return svgData(120, 128, body);
}

function svgRune(palette){
  const gradId = sanitizeId('gradRune', palette);
  const accent = palette.accent || '#f1dbff';
  const outline = palette.outline || 'rgba(22,15,35,0.85)';
  const body = `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${palette.primary || '#b487ff'}"/>
        <stop offset="100%" stop-color="${palette.secondary || '#2e1c52'}"/>
      </linearGradient>
    </defs>
    <path d="M60 8 L104 48 L60 104 L16 48 Z" fill="url(#${gradId})" stroke="${outline}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M60 24 L88 48 L60 88 L32 48 Z" fill="${accent}" opacity="0.28"/>
    <path d="M60 26 L68 48 L60 70 L52 48 Z" fill="${accent}" opacity="0.65"/>
    <circle cx="60" cy="48" r="6" fill="${accent}" opacity="0.82"/>
  `;
  return svgData(120, 120, body);
}

function svgBloom(palette){
  const gradId = sanitizeId('gradBloom', palette);
  const accent = palette.accent || '#ffeef7';
  const outline = palette.outline || 'rgba(22,26,24,0.78)';
  const body = `
    <defs>
      <radialGradient id="${gradId}" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="${palette.primary || '#ffcff1'}"/>
        <stop offset="100%" stop-color="${palette.secondary || '#873772'}"/>
      </radialGradient>
    </defs>
    <path d="M60 8 C78 10 94 22 102 40 C118 56 122 80 110 98 C92 120 66 122 42 116 C24 106 12 90 10 70 C8 50 16 30 30 18 C38 10 50 8 60 8 Z" fill="url(#${gradId})" stroke="${outline}" stroke-width="4"/>
    <path d="M60 22 C72 24 84 32 90 44 C96 60 90 78 74 92 C62 102 46 106 34 100 C26 90 24 74 28 60 C34 40 46 24 60 22 Z" fill="${accent}" opacity="0.3"/>
    <circle cx="60" cy="58" r="12" fill="${accent}" opacity="0.6"/>
  `;
  return svgData(120, 128, body);
}

function svgPike(palette){
  const gradId = sanitizeId('gradPike', palette);
  const accent = palette.accent || '#f9f7e8';
  const outline = palette.outline || 'rgba(28,26,18,0.82)';
  const body = `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${palette.primary || '#ffd37a'}"/>
        <stop offset="100%" stop-color="${palette.secondary || '#5b2f12'}"/>
      </linearGradient>
    </defs>
    <path d="M60 0 L92 40 L76 112 L44 112 L28 40 Z" fill="url(#${gradId})" stroke="${outline}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M60 22 L76 46 L64 94 L56 94 L44 46 Z" fill="${accent}" opacity="0.3"/>
    <path d="M60 8 L70 40 L60 52 L50 40 Z" fill="${accent}" opacity="0.6"/>
  `;
  return svgData(120, 120, body);
}

function svgSentinel(palette){
  const gradId = sanitizeId('gradSentinel', palette);
  const accent = palette.accent || '#e1f7ff';
  const outline = palette.outline || 'rgba(18,25,32,0.85)';
  const body = `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${palette.primary || '#8fd6ff'}"/>
        <stop offset="100%" stop-color="${palette.secondary || '#1d3346'}"/>
      </linearGradient>
    </defs>
    <path d="M60 6 C86 12 108 38 112 68 C116 98 102 122 76 130 C56 134 36 128 22 114 C10 102 4 86 6 70 C10 40 32 14 60 6 Z" fill="url(#${gradId})" stroke="${outline}" stroke-width="4"/>
    <path d="M60 22 C78 28 92 46 92 66 C92 90 78 110 56 116 C38 114 24 100 22 82 C20 58 34 34 60 22 Z" fill="${accent}" opacity="0.3"/>
    <circle cx="60" cy="64" r="12" fill="${accent}" opacity="0.6"/>
  `;
  return svgData(120, 132, body);
}

const SPRITES = {
  shield: svgShield,
  wing: svgWing,
  rune: svgRune,
  bloom: svgBloom,
  pike: svgPike,
  sentinel: svgSentinel
};

function merge(target, source){
  return Object.assign({}, target, source || {});
}

function makeArt(pattern, palette, opts = {}){
  const spriteFactory = opts.spriteFactory || SPRITES[pattern];
  const sprite = opts.sprite === null ? null : (opts.sprite || (spriteFactory ? spriteFactory(palette) : null));
  const layout = merge({
    anchor: 0.78,
    labelOffset: 1.18,
    labelFont: 0.72,
    hpOffset: 1.46,
    hpWidth: 2.4,
    hpHeight: 0.42,
    spriteAspect: 0.78,
    spriteHeight: 2.4
  }, opts.layout);
  const label = merge({
    bg: 'rgba(12,20,30,0.82)',
    text: '#f4f8ff',
    stroke: 'rgba(255,255,255,0.08)'
  }, opts.label);
  const hpBar = merge({
    bg: 'rgba(9,14,21,0.74)',
    fill: palette.accent || '#6ff0c0',
    border: 'rgba(0,0,0,0.55)'
  }, opts.hpBar);
  return {
    sprite,
    palette,
    shape: opts.shape || pattern,
    size: opts.size ?? 1,
    shadow: opts.shadow ?? 'rgba(0,0,0,0.35)',
    glow: opts.glow ?? palette.accent ?? '#8cf6ff',
    mirror: opts.mirror ?? true,
    layout,
    label,
    hpBar
  };
}

const basePalettes = {
  default:   { primary:'#7fa6c0', secondary:'#1d2b38', accent:'#d6f2ff', outline:'#223548' },
  leaderA:   { primary:'#74cfff', secondary:'#123c55', accent:'#dff7ff', outline:'#1a4d68' },
  leaderB:   { primary:'#ff9aa0', secondary:'#4a1921', accent:'#ffd9dd', outline:'#571f28' },
  phe:       { primary:'#a884ff', secondary:'#2b1954', accent:'#f1ddff', outline:'#3a2366' },
  kiem:      { primary:'#ffd37a', secondary:'#5b2f12', accent:'#fff3c3', outline:'#4a260f' },
  loithien:  { primary:'#8bd1ff', secondary:'#163044', accent:'#c7f1ff', outline:'#1e3e53' },
  laky:      { primary:'#ffc9ec', secondary:'#7c336a', accent:'#ffeef9', outline:'#5a214b' },
  kydieu:    { primary:'#a0f2d4', secondary:'#1f4f47', accent:'#e7fff5', outline:'#1b3c36' },
  doanminh:  { primary:'#ffe6a5', secondary:'#3e2b12', accent:'#fff8da', outline:'#2f2110' },
  tranquat:  { primary:'#89f5ff', secondary:'#1a3651', accent:'#d0fbff', outline:'#223e58' },
  linhgac:   { primary:'#9ec4ff', secondary:'#2a3f5c', accent:'#e4f1ff', outline:'#24364c' },
  minion:    { primary:'#ffd27d', secondary:'#5a3a17', accent:'#fff4cc', outline:'#452b0f' }
};

export const UNIT_ART = {
  default: makeArt('sentinel', basePalettes.default, {
    layout: { labelOffset: 1.1, hpOffset: 1.38 }
  }),
  leaderA: makeArt('shield', basePalettes.leaderA, {
    layout: { labelOffset: 1.24, hpOffset: 1.52, hpWidth: 2.6 },
    label: { text: '#e5f6ff', bg: 'rgba(12,30,44,0.88)' },
    hpBar: { fill: '#6ff0c0' }
  }),
  leaderB: makeArt('wing', basePalettes.leaderB, {
    layout: { labelOffset: 1.3, hpOffset: 1.58, hpWidth: 2.6 },
    label: { text: '#ffe6ec', bg: 'rgba(46,16,24,0.88)' },
    hpBar: { fill: '#ff9aa0' }
  }),
  phe: makeArt('rune', basePalettes.phe, {
    layout: { labelOffset: 1.2, hpOffset: 1.48 },
    hpBar: { fill: '#c19bff' }
  }),
  kiemtruongda: makeArt('pike', basePalettes.kiem, {
    layout: { labelOffset: 1.22, hpOffset: 1.5 },
    hpBar: { fill: '#ffd37a' }
  }),
  loithienanh: makeArt('sentinel', basePalettes.loithien, {
    layout: { labelOffset: 1.18, hpOffset: 1.46 },
    hpBar: { fill: '#80f2ff' }
  }),
  laky: makeArt('bloom', basePalettes.laky, {
    layout: { labelOffset: 1.18, hpOffset: 1.44 },
    hpBar: { fill: '#ffb8e9' }
  }),
  kydieu: makeArt('rune', basePalettes.kydieu, {
    layout: { labelOffset: 1.16, hpOffset: 1.42 },
    hpBar: { fill: '#9af5d2' }
  }),
  doanminh: makeArt('pike', basePalettes.doanminh, {
    layout: { labelOffset: 1.26, hpOffset: 1.54 },
    hpBar: { fill: '#ffe6a5' }
  }),
  tranquat: makeArt('rune', basePalettes.tranquat, {
    layout: { labelOffset: 1.18, hpOffset: 1.46 },
    hpBar: { fill: '#7fe9ff' }
  }),
  linhgac: makeArt('sentinel', basePalettes.linhgac, {
    layout: { labelOffset: 1.16, hpOffset: 1.42 },
    hpBar: { fill: '#a9d6ff' }
  }),
  minion: makeArt('pike', basePalettes.minion, {
    layout: { labelOffset: 1.08, hpOffset: 1.32, hpWidth: 2.1, hpHeight: 0.38 },
    label: { text: '#fff1d0' },
    hpBar: { fill: '#ffd27d' }
  })
};

export function getUnitArt(id){
  if (!id) return UNIT_ART.default;
  if (UNIT_ART[id]) return UNIT_ART[id];
  if (id.endsWith('_minion')){
    const base = id.replace(/_minion$/, '');
    return UNIT_ART[`${base}_minion`] || UNIT_ART.minion || UNIT_ART.default;
  }
  return UNIT_ART.default;
}

export function getPalette(id){
  const art = getUnitArt(id);
  return art?.palette || basePalettes.default;
}
