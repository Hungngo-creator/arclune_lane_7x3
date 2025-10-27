// v0.7.7 – Unit art catalog

import type {
  GetUnitArtOptions,
  UnitArt,
  UnitArtDefinition,
  UnitArtHpBar,
  UnitArtLabel,
  UnitArtLayout,
  UnitArtPalette,
  UnitArtShadow,
  UnitArtShadowConfig,
  UnitArtSprite,
} from '@types/art';

type UnitArtSpriteInput =
  | string
  | ({
      src?: string | null;
      url?: string | null;
      shadow?: UnitArtShadow;
      anchor?: number | null;
      scale?: number | null;
      aspect?: number | null;
      skinId?: string | null;
      key?: string | null;
      cacheKey?: string | null;
    } & Record<string, unknown>);

type MakeArtOptions = {
  layout?: Partial<UnitArtLayout> | null;
  label?: Partial<UnitArtLabel> | null;
  hpBar?: Partial<UnitArtHpBar> | null;
  shadow?: UnitArtShadow;
  defaultSkin?: string | null;
  skins?: Record<string, UnitArtSpriteInput> | null;
  sprite?: UnitArtSpriteInput | null;
  spriteFactory?: ((palette: UnitArtPalette) => string) | null;
  shape?: string | null;
  size?: number | null;
  glow?: string | null;
  mirror?: boolean | null;
};

interface UnitArtSpriteDraft extends Omit<UnitArtSprite, 'key'> {
  key?: string;
}

function svgData(width: number, height: number, body: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function sanitizeId(base: string, palette: UnitArtPalette): string {
  const seed = `${palette.primary || ''}${palette.secondary || ''}${palette.accent || ''}`.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  return `${base}${seed}` || `${base}0`;
}

function svgShield(palette: UnitArtPalette): string {
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

function svgWing(palette: UnitArtPalette): string {
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

function svgRune(palette: UnitArtPalette): string {
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

function svgBloom(palette: UnitArtPalette): string {
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

function svgPike(palette: UnitArtPalette): string {
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

function svgSentinel(palette: UnitArtPalette): string {
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

const SPRITES: Record<string, (palette: UnitArtPalette) => string> = {
  shield: svgShield,
  wing: svgWing,
  rune: svgRune,
  bloom: svgBloom,
  pike: svgPike,
  sentinel: svgSentinel
};

function merge<T extends Record<string, unknown>>(target: T, source: Partial<T> | null | undefined): T {
  return Object.assign({}, target, source ?? {});
}

const UNIT_SKIN_SELECTION: Map<string, string> = new Map();

function getBaseArt(id: string | null | undefined): UnitArtDefinition {
  if (!id) return UNIT_ART.default;
  if (UNIT_ART[id]) return UNIT_ART[id];
  if (id.endsWith('_minion')){
    const base = id.replace(/_minion$/, '');
    if (UNIT_ART[`${base}_minion`]) return UNIT_ART[`${base}_minion`];
    if (UNIT_ART.minion) return UNIT_ART.minion;
  }
  return UNIT_ART.default;
}

function resolveSkinKey(id: string | null | undefined, baseArt: UnitArtDefinition | null, explicit?: string | null): string | null {
  if (!baseArt) return null;
  if (explicit && baseArt.skins[explicit]) return explicit;
  const idKey = id ?? '';
  const override = UNIT_SKIN_SELECTION.get(idKey);
  if (override && baseArt.skins[override]) return override;
  if (baseArt.defaultSkin && baseArt.skins[baseArt.defaultSkin]) return baseArt.defaultSkin;
  const keys = Object.keys(baseArt.skins ?? {});
  return keys[0] || null;
}

function instantiateArt(id: string | null | undefined, baseArt: UnitArtDefinition | null, skinKey: string | null): UnitArt | null {
  if (!baseArt) return null;
  const art: UnitArt = {
    ...(baseArt as UnitArt),
    layout: baseArt.layout ? { ...baseArt.layout } : ({} as UnitArtLayout),
    label: baseArt.label ? { ...baseArt.label } : ({} as UnitArtLabel),
    hpBar: baseArt.hpBar ? { ...baseArt.hpBar } : ({} as UnitArtHpBar),
    sprite: null,
    skinKey: skinKey ?? null,
  };
  const spriteDef = skinKey ? baseArt.skins[skinKey] : undefined;
  if (spriteDef){
    art.sprite = {
      ...spriteDef,
      key: skinKey,
      skinId: spriteDef.skinId ?? skinKey,
    };
  } else {
    art.sprite = null;
  }
  return art;
}

export function setUnitSkin(unitId: string | null | undefined, skinKey: string | null | undefined): boolean {
  if (!unitId) return false;
  const baseArt = getBaseArt(unitId);
  if (!baseArt || !baseArt.skins) return false;
  if (!skinKey){
    UNIT_SKIN_SELECTION.delete(unitId);
    return true;
  }
  if (baseArt.skins[skinKey]){
    UNIT_SKIN_SELECTION.set(unitId, skinKey);
    return true;
  }
  return false;
}

export function getUnitSkin(unitId: string | null | undefined): string | null {
  if (!unitId) return null;
  const baseArt = getBaseArt(unitId);
  if (!baseArt) return null;
  const override = UNIT_SKIN_SELECTION.get(unitId);
  if (override && baseArt.skins[override]) return override;
  if (baseArt.defaultSkin && baseArt.skins[baseArt.defaultSkin]) return baseArt.defaultSkin;
  const keys = Object.keys(baseArt.skins ?? {});
  return keys[0] || null;
}

function normalizeShadow(
  shadow: UnitArtShadow | undefined,
  fallback: UnitArtShadow | undefined,
): UnitArtShadowConfig | null {
  if (shadow === null) return null;
  const base: UnitArtShadowConfig = {
    color: 'rgba(0,0,0,0.35)',
    blur: 18,
    offsetX: 0,
    offsetY: 10,
  };

  const fallbackColor =
    typeof fallback === 'string'
      ? fallback
      : fallback && typeof fallback === 'object'
        ? fallback.color ?? null
        : null;
  if (fallbackColor) {
    base.color = fallbackColor;
  }

  if (typeof shadow === 'string') {
    return { ...base, color: shadow };
  }
  if (shadow && typeof shadow === 'object') {
    return {
      color: shadow.color ?? base.color,
      blur: Number.isFinite(shadow.blur) ? (shadow.blur as number) : base.blur,
      offsetX: Number.isFinite(shadow.offsetX) ? (shadow.offsetX as number) : base.offsetX,
      offsetY: Number.isFinite(shadow.offsetY) ? (shadow.offsetY as number) : base.offsetY,
    };
  }
  if (fallback && typeof fallback === 'object') {
    return {
      color: fallback.color ?? base.color,
      blur: Number.isFinite(fallback.blur) ? (fallback.blur as number) : base.blur,
      offsetX: Number.isFinite(fallback.offsetX) ? (fallback.offsetX as number) : base.offsetX,
      offsetY: Number.isFinite(fallback.offsetY) ? (fallback.offsetY as number) : base.offsetY,
    };
  }
  return { ...base };
}

function normalizeSpriteEntry(
  conf: UnitArtSpriteInput | null | undefined,
  context: { anchor: number; shadow: UnitArtShadow | undefined },
): UnitArtSpriteDraft | null {
  if (!conf) return null;
  const input = typeof conf === 'string' ? { src: conf } : conf;
  const srcCandidate = input.src ?? input.url ?? null;
  if (!srcCandidate) return null;
  const normalizedShadow = normalizeShadow(
    (input as Record<string, unknown>).shadow as UnitArtShadow | undefined,
    context.shadow,
  );
  return {
    src: srcCandidate,
    anchor: Number.isFinite(input.anchor) ? (input.anchor as number) : context.anchor,
    scale: Number.isFinite(input.scale) ? (input.scale as number) : 1,
    aspect: Number.isFinite(input.aspect) ? (input.aspect as number) : null,
    shadow: normalizedShadow,
    skinId:
      typeof input.skinId === 'string'
        ? input.skinId
        : typeof input.key === 'string'
          ? input.key
          : typeof (input as Record<string, unknown>).id === 'string'
            ? ((input as Record<string, unknown>).id as string)
            : null,
    cacheKey: typeof input.cacheKey === 'string' ? input.cacheKey : null,
  };
}

function makeArt(pattern: string, palette: UnitArtPalette, opts: MakeArtOptions = {}): UnitArtDefinition {
  const spriteFactory = opts.spriteFactory ?? SPRITES[pattern];
  const layout = merge<UnitArtLayout>(
    {
      anchor: 0.78,
      labelOffset: 1.18,
      labelFont: 0.72,
      hpOffset: 1.46,
      hpWidth: 2.4,
      hpHeight: 0.42,
      spriteAspect: 0.78,
      spriteHeight: 2.4,
    },
    (opts.layout ?? undefined) as Partial<UnitArtLayout>,
  );
  const label = merge<UnitArtLabel>(
    {
      bg: 'rgba(12,20,30,0.82)',
      text: '#f4f8ff',
      stroke: 'rgba(255,255,255,0.08)',
    },
    (opts.label ?? undefined) as Partial<UnitArtLabel>,
  );
  const hpBar = merge<UnitArtHpBar>(
    {
      bg: 'rgba(9,14,21,0.74)',
      fill: palette.accent || '#6ff0c0',
      border: 'rgba(0,0,0,0.55)',
    },
    (opts.hpBar ?? undefined) as Partial<UnitArtHpBar>,
  );
  const shadow = opts.shadow ?? 'rgba(0,0,0,0.35)';

  const defaultSkinKey = opts.defaultSkin || 'default';
  const skinsInput = opts.skins ?? (opts.sprite ? { [defaultSkinKey]: opts.sprite } : null);
  const normalizedSkins: Record<string, UnitArtSprite> = {};
  const anchor = layout.anchor ?? 0.78;
  if (skinsInput){
    for (const [key, conf] of Object.entries(skinsInput)){
      const normalized = normalizeSpriteEntry(conf, { anchor, shadow });
      if (!normalized) continue;
      normalizedSkins[key] = {
        ...normalized,
        key,
        skinId: normalized.skinId ?? key,
      };
    }
  } else if (opts.sprite !== null && spriteFactory){
    const generated = normalizeSpriteEntry({ src: spriteFactory(palette) }, { anchor, shadow });
    if (generated){
      normalizedSkins[defaultSkinKey] = {
        ...generated,
        key: defaultSkinKey,
        skinId: generated.skinId ?? defaultSkinKey,
      };
    }
  }

  const preferredKey = normalizedSkins[defaultSkinKey]
    ? defaultSkinKey
    : Object.keys(normalizedSkins)[0] || defaultSkinKey;

  return {
    sprite: normalizedSkins[preferredKey] ?? null,
    skins: normalizedSkins,
    defaultSkin: preferredKey,
    palette,
    shape: opts.shape || pattern,
    size: opts.size ?? 1,
    shadow,
    glow: opts.glow ?? palette.accent ?? '#8cf6ff',
    mirror: opts.mirror ?? true,
    layout,
    label,
    hpBar,
  } satisfies UnitArtDefinition;
}

const basePalettes: Record<string, UnitArtPalette> = {
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

export const UNIT_ART: Record<string, UnitArtDefinition> = {
  default: makeArt('sentinel', basePalettes.default, {
    layout: { labelOffset: 1.1, hpOffset: 1.38, spriteAspect: 0.8 },
    skins: {
      default: {
        src: './dist/assets/units/default/default.svg',
        anchor: 0.86,
        scale: 1.02,
        aspect: 0.8,
        shadow: { color: 'rgba(18,28,38,0.55)', blur: 22, offsetY: 10 }
      }
    }
  }),
  leaderA: makeArt('shield', basePalettes.leaderA, {
    layout: { labelOffset: 1.24, hpOffset: 1.52, hpWidth: 2.6, spriteAspect: 0.8 },
    label: { text: '#e5f6ff', bg: 'rgba(12,30,44,0.88)' },
    hpBar: { fill: '#6ff0c0' },
    skins: {
      default: {
        src: './dist/assets/units/leaderA/default.svg',
        anchor: 0.86,
        scale: 1.08,
        aspect: 0.8,
        shadow: { color: 'rgba(20,62,84,0.6)', blur: 26, offsetY: 12 }
      },
      ascendant: {
        src: './dist/assets/units/leaderA/ascendant.svg',
        anchor: 0.86,
        scale: 1.08,
        aspect: 0.8,
        shadow: { color: 'rgba(26,112,138,0.58)', blur: 28, offsetY: 12 }
      }
    }
  }),
  leaderB: makeArt('wing', basePalettes.leaderB, {
    layout: { labelOffset: 1.3, hpOffset: 1.58, hpWidth: 2.6, spriteAspect: 0.8 },
    label: { text: '#ffe6ec', bg: 'rgba(46,16,24,0.88)' },
    hpBar: { fill: '#ff9aa0' },
    skins: {
      default: {
        src: './dist/assets/units/leaderB/default.svg',
        anchor: 0.88,
        scale: 1.12,
        aspect: 0.8,
        shadow: { color: 'rgba(58,16,28,0.6)', blur: 28, offsetY: 12 }
      },
      nightfall: {
        src: './dist/assets/units/leaderB/nightfall.svg',
        anchor: 0.88,
        scale: 1.12,
        aspect: 0.8,
        shadow: { color: 'rgba(48,12,44,0.6)', blur: 30, offsetY: 14 }
      }
    }
  }),
  phe: makeArt('rune', basePalettes.phe, {
    layout: { labelOffset: 1.2, hpOffset: 1.48, spriteAspect: 0.8 },
    hpBar: { fill: '#c19bff' },
    skins: {
      default: {
        src: './dist/assets/units/phe/default.svg',
        anchor: 0.86,
        scale: 1.04,
        aspect: 0.8,
        shadow: { color: 'rgba(34,20,68,0.55)', blur: 22, offsetY: 10 }
      }
    }
  }),
  kiemtruongda: makeArt('pike', basePalettes.kiem, {
    layout: { labelOffset: 1.22, hpOffset: 1.5, spriteAspect: 0.8 },
    hpBar: { fill: '#ffd37a' },
    skins: {
      default: {
        src: './dist/assets/units/kiemtruongda/default.svg',
        anchor: 0.86,
        scale: 1.06,
        aspect: 0.8,
        shadow: { color: 'rgba(64,32,14,0.58)', blur: 24, offsetY: 12 }
      }
    }
  }),
  loithienanh: makeArt('sentinel', basePalettes.loithien, {
    layout: { labelOffset: 1.18, hpOffset: 1.46, spriteAspect: 0.8 },
    hpBar: { fill: '#80f2ff' },
    skins: {
      default: {
        src: './dist/assets/units/loithienanh/default.svg',
        anchor: 0.88,
        scale: 1.08,
        aspect: 0.8,
        shadow: { color: 'rgba(22,52,70,0.55)', blur: 26, offsetY: 12 }
      }
    }
  }),
  laky: makeArt('bloom', basePalettes.laky, {
    layout: { labelOffset: 1.18, hpOffset: 1.44, spriteAspect: 0.8 },
    hpBar: { fill: '#ffb8e9' },
    skins: {
      default: {
        src: './dist/assets/units/laky/default.svg',
        anchor: 0.9,
        scale: 1.12,
        aspect: 0.8,
        shadow: { color: 'rgba(86,34,82,0.55)', blur: 28, offsetY: 12 }
      }
    }
  }),
  kydieu: makeArt('rune', basePalettes.kydieu, {
    layout: { labelOffset: 1.16, hpOffset: 1.42, spriteAspect: 0.8 },
    hpBar: { fill: '#9af5d2' },
    skins: {
      default: {
        src: './dist/assets/units/kydieu/default.svg',
        anchor: 0.86,
        scale: 1.04,
        aspect: 0.8,
        shadow: { color: 'rgba(28,78,70,0.55)', blur: 22, offsetY: 10 }
      }
    }
  }),
  doanminh: makeArt('pike', basePalettes.doanminh, {
    layout: { labelOffset: 1.26, hpOffset: 1.54, spriteAspect: 0.8 },
    hpBar: { fill: '#ffe6a5' },
    skins: {
      default: {
        src: './dist/assets/units/doanminh/default.svg',
        anchor: 0.86,
        scale: 1.08,
        aspect: 0.8,
        shadow: { color: 'rgba(52,36,14,0.58)', blur: 24, offsetY: 12 }
      }
    }
  }),
  tranquat: makeArt('rune', basePalettes.tranquat, {
    layout: { labelOffset: 1.18, hpOffset: 1.46, spriteAspect: 0.8 },
    hpBar: { fill: '#7fe9ff' },
    skins: {
      default: {
        src: './dist/assets/units/tranquat/default.svg',
        anchor: 0.86,
        scale: 1.04,
        aspect: 0.8,
        shadow: { color: 'rgba(26,60,88,0.55)', blur: 22, offsetY: 10 }
      }
    }
  }),
  linhgac: makeArt('sentinel', basePalettes.linhgac, {
    layout: { labelOffset: 1.16, hpOffset: 1.42, spriteAspect: 0.8 },
    hpBar: { fill: '#a9d6ff' },
    skins: {
      default: {
        src: './dist/assets/units/linhgac/default.svg',
        anchor: 0.88,
        scale: 1.06,
        aspect: 0.8,
        shadow: { color: 'rgba(32,54,76,0.55)', blur: 24, offsetY: 12 }
      }
    }
  }),
  minion: makeArt('pike', basePalettes.minion, {
    layout: { labelOffset: 1.08, hpOffset: 1.32, hpWidth: 2.1, hpHeight: 0.38, spriteAspect: 0.8 },
    label: { text: '#fff1d0' },
    hpBar: { fill: '#ffd27d' },
    skins: {
      default: {
        src: './dist/assets/units/minion/default.svg',
        anchor: 0.84,
        scale: 1,
        aspect: 0.8,
        shadow: { color: 'rgba(58,42,20,0.58)', blur: 20, offsetY: 10 }
      }
    }
  })
};

export function getUnitArt(id: string | null | undefined, opts: GetUnitArtOptions = {}): UnitArt | null {
  const baseArt = getBaseArt(id);
  const skinKey = resolveSkinKey(id, baseArt, opts.skinKey ?? null);
  return instantiateArt(id, baseArt, skinKey);
}