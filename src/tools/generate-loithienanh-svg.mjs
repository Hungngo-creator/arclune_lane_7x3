import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const WIDTH = 160;
const HEIGHT = 200;
const palette = {
  primary: '#8bd1ff',
  secondary: '#163044',
  accent: '#c7f1ff',
  outline: '#1e3e53'
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function indent(block, spaces = 2){
  const pad = ' '.repeat(spaces);
  return block
    .split('\n')
    .map(line => (line ? pad + line : line))
    .join('\n');
}

function renderAttributes(attrs){
  return Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
}

function renderShape(shape){
  const { type = 'path', opacity, fillOpacity, strokeOpacity, attrs = {}, ...rest } = shape;
  const baseAttrs = { ...rest };
  if (opacity !== undefined) baseAttrs.opacity = opacity;
  if (fillOpacity !== undefined) baseAttrs['fill-opacity'] = fillOpacity;
  if (strokeOpacity !== undefined) baseAttrs['stroke-opacity'] = strokeOpacity;
  const merged = { ...baseAttrs, ...attrs };
  return `<${type} ${renderAttributes(merged)} />`;
}

function group(id, shapes, options = {}){
  const { pivot, className, attrs = {} } = options;
  const groupAttrs = { id, 'data-pivot': pivot, class: className, ...attrs };
  const attrString = renderAttributes(groupAttrs);
  const body = shapes.map(shape => `  ${renderShape(shape)}`).join('\n');
  return `<g ${attrString}>\n${body}\n</g>`;
}

function createDefs(){
  const skinLight = '#f4fbff';
  const skinShadow = '#cbe7ff';
  const metalHighlight = '#d9f2ff';
  const metalShadow = palette.secondary;
  const glowOuter = palette.primary;
  const glowInner = palette.accent;
  const overlayStart = '#ff8055';
  const overlayEnd = '#ffd4a8';

  const defs = [
    '<defs>',
    '  <linearGradient id="LA_grad_skin" x1="0" y1="0" x2="0" y2="1">',
    `    <stop offset="0%" stop-color="${skinLight}"/>`,
    `    <stop offset="100%" stop-color="${skinShadow}"/>`,
    '  </linearGradient>',
    '  <linearGradient id="LA_grad_metal" x1="0" y1="0" x2="1" y2="1">',
    `    <stop offset="0%" stop-color="${metalHighlight}"/>`,
    `    <stop offset="100%" stop-color="${metalShadow}"/>`,
    '  </linearGradient>',
    '  <radialGradient id="LA_grad_glow" cx="50%" cy="40%" r="60%">',
    `    <stop offset="0%" stop-color="${glowInner}" stop-opacity="0.85"/>`,
    `    <stop offset="100%" stop-color="${glowOuter}" stop-opacity="0"/>`,
    '  </radialGradient>',
    '  <linearGradient id="LA_grad_overlay" x1="0" y1="0" x2="0" y2="1">',
    `    <stop offset="0%" stop-color="${overlayStart}" stop-opacity="0.45"/>`,
    `    <stop offset="100%" stop-color="${overlayEnd}" stop-opacity="0"/>`,
    '  </linearGradient>',
    '</defs>'
  ];

  return defs.join('\n');
}

function buildSvg(){
  const { primary, secondary, accent, outline } = palette;
  const strokeWidth = 1.6;

  const legBack = group('LA_LEG_BACK', [
    {
      d: 'M98 112 C106 140 108 170 108 198 L90 198 C88 170 84 142 78 122 Z',
      fill: secondary,
      stroke: outline,
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round'
    },
    {
      d: 'M94 132 C98 152 100 176 100 194 L92 194 C90 170 86 148 82 134 Z',
      fill: accent,
      opacity: 0.18
    }
  ], { pivot: '92,130' });

  const capeBack = group('LA_CAPE_BACK', [
    {
      d: 'M48 82 C32 112 28 144 34 184 C52 196 76 204 100 198 C116 178 118 152 108 118 C96 94 80 82 62 78 Z',
      fill: secondary,
      stroke: outline,
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round'
    },
    {
      d: 'M58 94 C46 122 46 152 52 176 C72 184 92 182 104 164 C96 130 82 104 58 94 Z',
      fill: primary,
      opacity: 0.25
    }
  ], { pivot: '86,128' });

  const armBack = group('LA_ARM_BACK', [
    {
      d: 'M102 74 C116 90 122 112 120 134 C114 150 106 162 100 174 L90 170 C96 150 98 128 92 108 Z',
      fill: primary,
      stroke: outline,
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round'
    },
    {
      d: 'M102 90 C110 106 112 122 110 138 C106 146 102 154 98 162 L96 160 C100 142 100 122 96 106 Z',
      fill: accent,
      opacity: 0.2
    }
  ], { pivot: '98,76' });

  const weaponBack = group('LA_WEAPON_BACK', [
    {
      d: 'M116 24 L124 36 L86 168 L76 164 Z',
      fill: 'url(#LA_grad_metal)',
      stroke: outline,
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round'
    },
    {
      d: 'M116 24 C122 20 132 16 140 12 L142 22 C134 28 126 34 120 40 Z',
      fill: accent,
      stroke: outline,
      'stroke-width': 1.2,
      'stroke-linejoin': 'round'
    }
  ], { pivot: '124,138' });

  const torso = group('LA_TORSO', [
    {
      d: 'M54 70 C60 56 76 48 92 52 C104 58 112 70 114 88 C112 110 106 130 94 142 C82 150 66 150 56 142 C48 124 46 96 54 70 Z',
      fill: primary,
      stroke: outline,
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round'
    },
    {
      d: 'M68 78 C78 70 92 70 100 82 C104 100 100 118 90 132 C80 140 68 138 60 126 C58 106 60 90 68 78 Z',
      fill: 'url(#LA_grad_metal)',
      opacity: 0.9
    },
    {
      d: 'M62 110 L94 108 L88 132 L66 132 Z',
      fill: secondary,
      opacity: 0.35
    }
  ], { pivot: '86,128' });

  const head = group('LA_HEAD', [
    {
      d: 'M72 36 C82 28 98 28 108 40 C114 54 112 70 104 80 C94 90 78 88 70 76 C66 62 66 46 72 36 Z',
      fill: 'url(#LA_grad_skin)',
      stroke: outline,
      'stroke-width': 1.4,
      'stroke-linejoin': 'round'
    },
    {
      d: 'M78 42 C84 38 94 38 100 46 C102 56 100 64 94 70 C86 72 78 64 78 52 Z',
      fill: accent,
      opacity: 0.18
    }
  ], { pivot: '84,54' });

  const hairFront = group('LA_HAIR_FRONT', [
    {
      d: 'M66 32 C78 18 102 18 114 40 C112 58 104 70 96 76 L86 70 L78 86 C70 84 64 70 64 58 Z',
      fill: secondary,
      stroke: outline,
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round'
    },
    {
      d: 'M88 34 C98 32 108 40 110 54 C104 64 96 70 88 68 C82 60 82 46 88 34 Z',
      fill: accent,
      opacity: 0.22
    }
  ], { pivot: '84,54' });

  const legFront = group('LA_LEG_FRONT', [
    {
      d: 'M74 118 C84 142 86 170 84 198 L66 198 C64 174 60 146 54 122 Z',
      fill: secondary,
      stroke: outline,
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round'
    },
    {
      d: 'M72 136 C78 156 78 180 78 194 L70 194 C68 170 64 146 60 134 Z',
      fill: accent,
      opacity: 0.2
    }
  ], { pivot: '70,126' });

  const armFront = group('LA_ARM_FRONT', [
    {
      d: 'M56 70 C44 86 40 110 44 132 C50 146 60 156 70 166 L80 162 C72 144 68 124 72 104 Z',
      fill: primary,
      stroke: outline,
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round'
    },
    {
      d: 'M58 88 C52 104 52 120 54 134 C60 142 66 150 72 156 L72 150 C66 134 64 116 68 100 Z',
      fill: accent,
      opacity: 0.24
    }
  ], { pivot: '54,74' });

  const weaponFront = group('LA_WEAPON_FRONT', [
    {
      d: 'M40 40 L48 28 L92 162 L82 166 Z',
      fill: 'url(#LA_grad_metal)',
      stroke: outline,
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round'
    },
    {
      d: 'M40 40 C32 34 22 30 14 26 L16 16 C26 20 36 26 44 32 Z',
      fill: accent,
      stroke: outline,
      'stroke-width': 1.2,
      'stroke-linejoin': 'round'
    },
    {
      d: 'M86 156 L96 152 L98 160 L88 166 Z',
      fill: accent,
      opacity: 0.6
    }
  ], { pivot: '78,128' });

  const accessory = group('LA_ACC_FRONT', [
    {
      d: 'M60 112 C72 106 88 106 100 112 C94 122 86 130 74 134 C64 132 60 124 60 112 Z',
      fill: 'url(#LA_grad_metal)',
      stroke: outline,
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round'
    },
    {
      d: 'M70 116 C78 114 88 116 94 120 C88 126 80 128 72 126 Z',
      fill: accent,
      opacity: 0.28
    }
  ], { pivot: '78,120' });

  const fxHeat = group('LA_FX_HEAT', [
    {
      d: 'M30 60 C20 100 26 140 44 170 C68 190 102 194 132 180 C136 150 124 120 106 96 C84 74 54 62 30 60 Z',
      fill: primary,
      opacity: 0.12
    }
  ], { pivot: '86,120', className: 'fx-heat' });

  const fxGlow = group('LA_FX_GLOW', [
    {
      d: 'M32 40 C26 84 38 128 68 150 C96 166 128 152 140 122 C138 92 122 62 98 44 C76 34 50 34 32 40 Z',
      fill: 'url(#LA_grad_glow)'
    }
  ], { pivot: '86,120', className: 'fx-glow' });

  const fxUlt = group('LA_FX_ULT', [
    {
      d: 'M12 24 H148 V192 H12 Z',
      fill: 'url(#LA_grad_overlay)',
      opacity: 0.0
    },
    {
      d: 'M24 60 C20 120 28 170 60 190 C96 202 132 188 146 150 C144 116 128 86 102 70 C76 60 46 58 24 60 Z',
      fill: 'url(#LA_grad_overlay)',
      opacity: 0.45
    }
  ], { pivot: '86,120', className: 'fx-ult', attrs: { style: 'mix-blend-mode:soft-light' } });

  const layers = [
    legBack,
    capeBack,
    armBack,
    weaponBack,
    torso,
    head,
    hairFront,
    legFront,
    armFront,
    weaponFront,
    accessory,
    fxHeat,
    fxGlow,
    fxUlt
  ].map(block => indent(block));

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" id="loithienanh-default">`,
    indent(createDefs()),
    ...layers,
    '</svg>'
  ].join('\n');

  return svg;
}

async function main(){
  const svgContent = buildSvg();
  const outputDir = path.resolve(__dirname, '../dist/assets/units/loithienanh');
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'default.svg');
  await writeFile(outputPath, `${svgContent}\n`, 'utf8');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
