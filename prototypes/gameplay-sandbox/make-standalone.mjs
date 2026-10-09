import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = resolve(process.argv[2] ?? resolve(root, 'artifacts/arclune-sandbox.html'));
const [html, css, ...modules] = await Promise.all(['index.html', 'style.css', 'profiles.mjs', 'engine.mjs', 'app.mjs'].map(name => readFile(resolve(root, name), 'utf8')));
// These three controlled modules have named exports and one-line local imports.
// This is packaging only: no runtime dependency or alternate gameplay engine.
const script = modules.map(source => source.replace(/^import .+ from '.+';\n/gm, '').replace(/^export /gm, '')).join('\n');
const standalone = html.replace('<link rel="stylesheet" href="./style.css">', `<style>${css}</style>`)
  .replace('<script type="module" src="./app.mjs"></script>', `<script type="module">${script.replace(/<\/script/gi, '<\\/script')}</script>`)
  .replace('href="./README.md"', 'href="https://github.com/Hungngo-creator/arclune_lane_7x3/blob/main/prototypes/gameplay-sandbox/README.md"');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, standalone);
console.log(`Standalone, open directly in a browser: ${output}`);
