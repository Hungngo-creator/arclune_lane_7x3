
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyAetherBundle } from './tools/verify-aether-bundle.mjs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let esbuild;
try {
  const imported = await import('esbuild');
  esbuild = imported?.default ?? imported;
} catch (err) {
  const fallback = await import('./tools/esbuild-stub/index.js');
  esbuild = fallback?.default ?? fallback;
  console.warn('Sử dụng esbuild fallback từ tools/esbuild-stub do không thể tải gói esbuild chuẩn:', err?.message || err);
}
const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');
const ASSETS_SOURCE_DIR = path.join(__dirname, 'assets');
const ENTRY_ID = './entry.ts';
const SOURCE_EXTENSIONS = ['.js', '.ts', '.tsx', '.json', '.css'];
const SCRIPT_EXTENSIONS = new Set(['.js', '.ts', '.tsx']);
const STUB_MODULE_SPECIFIERS = new Map([
  ['zod', path.join(__dirname, 'tools/zod-stub/index.js')],
]);

async function copyStaticAssets(){
  try {
    const stats = await fs.stat(ASSETS_SOURCE_DIR);
    if (!stats.isDirectory()){
      return;
    }
  } catch (err) {
    if (err && err.code !== 'ENOENT'){
      console.warn('Không thể truy cập thư mục assets, bỏ qua bước sao chép:', err);
    }
    return;
  }

  async function copyRecursive(fromDir, toDir){
    const entries = await fs.readdir(fromDir, { withFileTypes: true });
    await fs.mkdir(toDir, { recursive: true });
    for (const entry of entries){
      const sourcePath = path.join(fromDir, entry.name);
      const targetPath = path.join(toDir, entry.name);
      if (entry.isDirectory()){
        await copyRecursive(sourcePath, targetPath);
      } else if (entry.isFile()){
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  const targetRoot = path.join(DIST_DIR, 'assets');
  await copyRecursive(ASSETS_SOURCE_DIR, targetRoot);
}
function normalizeModuleId(id){
  if (!id){
    return id;
  }
  const normalizedSlashes = id.replace(/\\/g, '/');
  if (path.isAbsolute(id)){
    const rel = path.relative(SRC_DIR, id);
    if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)){
      return `./${rel.split(path.sep).join('/')}`;
    }
    return normalizedSlashes;
  }
  if (!normalizedSlashes.startsWith('.')){
    return normalizedSlashes;
  }

  const trimmed = normalizedSlashes.startsWith('./') ? normalizedSlashes.slice(2) : normalizedSlashes;
  const candidateRel = trimmed.replace(/^(\.\.\/)+/, '');
  if (candidateRel){
    const candidatePath = path.join(SRC_DIR, candidateRel);
    const resolved = resolveWithExtensions(candidatePath) ?? (fsSync.existsSync(candidatePath) ? candidatePath : null);
    if (resolved){
      const rel = path.relative(SRC_DIR, resolved);
      if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)){
        return `./${rel.split(path.sep).join('/')}`;
      }
    }
  }

  return normalizedSlashes;
}

const LEGACY_MODULE_ID_ALIAS_ENTRIES = [
  ['./catalog.js', './catalog.ts'],
  ['./entry.js', './entry.ts'],
  ['./meta.js', './meta.ts'],
  ['./modes/coming-soon.stub.js', './modes/coming-soon.stub.ts'],
  ['./modes/pve/session.js', './modes/pve/session.ts'],
  ['./screens/collection/index.js', './screens/collection/index.ts'],
  ['./screens/arena-hub/index.js', './screens/arena-hub/index.ts'],
  ['./screens/campaign-world-map/index.js', './screens/campaign-world-map/index.ts'],
  ['./screens/monopoly/index.js', './screens/monopoly/index.ts'],
  ['./screens/gacha/view.js', './screens/gacha/view.ts'],
  ['./screens/lineup/index.js', './screens/lineup/index.ts'],
  ['./screens/ui-gacha/index.js', './screens/ui-gacha/index.ts'],
  ['./screens/ui-gacha/gacha.js', './screens/ui-gacha/gacha.ts'],
  ['@modes/coming-soon.stub.ts', './modes/coming-soon.stub.ts'],
  ['@modes/pve/session.ts', './modes/pve/session.ts'],
  ['@screens/gacha/view.js', './screens/gacha/view.ts'],
  ['@screens/gacha/view.ts', './screens/gacha/view.ts'],
  ['@screens/arena-hub/index.ts', './screens/arena-hub/index.ts'],
  ['@screens/campaign-world-map/index.ts', './screens/campaign-world-map/index.ts'],
  ['@screens/monopoly/index.ts', './screens/monopoly/index.ts'],
  ['@screens/monopoly/ready.ts', './screens/monopoly/ready.ts'],
  ['@screens/chess-strategy-rpg/ready.ts', './screens/chess-strategy-rpg/ready.ts'],
  ['@screens/chess-strategy-rpg/battle.ts', './screens/chess-strategy-rpg/battle.ts'],
  ['@screens/chess-strategy-rpg/match.ts', './screens/chess-strategy-rpg/match.ts'],
  ['@screens/chess-strategy-rpg/seed.ts', './screens/chess-strategy-rpg/seed.ts'],
  ['@screens/chess-strategy-rpg/turn-state.ts', './screens/chess-strategy-rpg/turn-state.ts'],
  ['./screens/chess-strategy-rpg/seed.js', './screens/chess-strategy-rpg/seed.ts'],
  ['./screens/chess-strategy-rpg/turn-state.js', './screens/chess-strategy-rpg/turn-state.ts'],
  ['./combat/chap-minh-runtime.js', './combat/chap-minh-runtime.ts'],
  ['./combat/number-utils.js', './combat/number-utils.ts'],
  ['./combat/tag-aliases.js', './combat/tag-aliases.ts'],
  ['./combat/status-utils.js', './combat/status-utils.ts'],
  ['./combat/skill-result.js', './combat/skill-result.ts'],
  ['./combat/skill-metadata-utils.js', './combat/skill-metadata-utils.ts'],
  ['./combat/token-side-utils.js', './combat/token-side-utils.ts'],
  ['./combat/board-position-utils.js', './combat/board-position-utils.ts'],
  ['./combat/unit-runtime-hooks.js', './combat/unit-runtime-hooks.ts'],
  ['./combat/runtime-hooks/nguyen-le.js', './combat/runtime-hooks/nguyen-le.ts'],
  ['./modes/pve/ly-thanh-thu-runtime.js', './modes/pve/ly-thanh-thu-runtime.ts'],
  ['./modes/pve/nguyen-le-runtime.js', './modes/pve/nguyen-le-runtime.ts'],
  ['@screens/collection/index.ts', './screens/collection/index.ts'],
  ['@screens/lineup/index.ts', './screens/lineup/index.ts'],
  ['@screens/ui-gacha/index.ts', './screens/ui-gacha/index.ts'],
];

const LEGACY_MODULE_ID_ALIASES = new Map(
  LEGACY_MODULE_ID_ALIAS_ENTRIES.map(([fromId, toId]) => [normalizeModuleId(fromId), normalizeModuleId(toId)])
);

const args = process.argv.slice(2);
const skipBundleVerify = args.includes('--skip-bundle-verify');
const pruneUnreachableModules = args.includes('--prune-unreachable');
const modeArg = args.find((arg) => arg.startsWith('--mode='));
const argMode = modeArg ? modeArg.split('=')[1] : undefined;
const normalizedMode = argMode && argMode.toLowerCase() === 'production' ? 'production' : argMode && argMode.toLowerCase() === 'development' ? 'development' : undefined;
if (normalizedMode) {
  process.env.NODE_ENV = normalizedMode;
}
const MODE = (normalizedMode ?? process.env.NODE_ENV) === 'production' ? 'production' : 'development';
const ESBUILD_BASE_OPTIONS = {
  platform: 'browser',
  format: 'esm',
  target: MODE === 'production' ? ['esnext'] : ['es2023'],
  sourcemap: MODE === 'production' ? false : true,
  splitting: true,
  metafile: true,
  treeShaking: true,
  bundle: true,
  mainFields: ['browser', 'module', 'main'],
  conditions: ['browser', MODE],
  legalComments: 'none',
};
const ESBUILD_DEFINE = {
  'process.env.NODE_ENV': JSON.stringify(MODE),
  'import.meta.env.MODE': JSON.stringify(MODE),
  __DEV__: MODE === 'production' ? 'false' : 'true',
};
const ENABLE_RUNTIME_OPTIMIZATIONS = MODE === 'production';
const ESBUILD_TRANSFORM_MINIFY_OPTIONS = ENABLE_RUNTIME_OPTIMIZATIONS
  ? {
      minifySyntax: true,
      minifyIdentifiers: false,
      minifyWhitespace: false,
      keepNames: true,
      drop: ['debugger'],
    }
  : {
      minifySyntax: false,
      minifyIdentifiers: false,
      minifyWhitespace: false,
    };

const TS_CONFIG_PATH = path.join(__dirname, 'tsconfig.base.json');
let TS_PATH_ALIASES = [];

try {
  const tsconfigRaw = await fs.readFile(TS_CONFIG_PATH, 'utf8');
  const tsconfigJson = JSON.parse(tsconfigRaw);
  const paths = tsconfigJson?.compilerOptions?.paths ?? {};
  TS_PATH_ALIASES = Object.entries(paths).map(([key, targets]) => {
    const hasWildcard = key.endsWith('/*');
    const find = hasWildcard ? key.slice(0, -1) : key;
    const replacements = (Array.isArray(targets) ? targets : [])
      .map((target) => (hasWildcard && target.endsWith('/*') ? target.slice(0, -1) : target))
      .map((target) => path.resolve(__dirname, target));
    return { hasWildcard, find, replacements };
  });
} catch (err) {
  console.warn('Không thể đọc tsconfig để thiết lập alias đường dẫn:', err);
}

function resolveAlias(specifier){
  for (const { hasWildcard, find, replacements } of TS_PATH_ALIASES){
    if (hasWildcard){
      if (!specifier.startsWith(find)) continue;
      const suffix = specifier.slice(find.length);
      for (const replacement of replacements){
        const candidate = path.join(replacement, suffix);
        const resolved = resolveWithExtensions(candidate);
        if (resolved){
          return toModuleId(resolved);
        }
      }
    } else if (specifier === find){
      for (const replacement of replacements){
        const resolved = resolveWithExtensions(replacement);
        if (resolved){
          return toModuleId(resolved);
        }
      }
    }
  }
  return null;
}

function applyLegacyModuleAlias(moduleId){
  const normalized = normalizeModuleId(moduleId);
  return LEGACY_MODULE_ID_ALIASES.get(normalized) ?? normalized;
}

function registerLegacyModuleAlias(fromId, toId, { override = true } = {}){
  const normalizedFrom = normalizeModuleId(fromId);
  const normalizedTo = normalizeModuleId(toId);
  if (!normalizedFrom || !normalizedTo || normalizedFrom === normalizedTo){
    return;
  }
  if (!override && LEGACY_MODULE_ID_ALIASES.has(normalizedFrom)){
    return;
  }
  LEGACY_MODULE_ID_ALIASES.set(normalizedFrom, normalizedTo);
}

function resolveWithExtensions(basePath){
  if (!basePath) return null;
  if (fsSync.existsSync(basePath)){
    const stat = fsSync.statSync(basePath);
    if (stat.isFile()){
      return basePath;
    }
    if (stat.isDirectory()){
      for (const ext of SOURCE_EXTENSIONS){
        const indexCandidate = path.join(basePath, `index${ext}`);
        if (fsSync.existsSync(indexCandidate) && fsSync.statSync(indexCandidate).isFile()){
          return indexCandidate;
        }
      }
    }
  }
  if (!path.extname(basePath)){
    for (const ext of SOURCE_EXTENSIONS){
      const candidate = `${basePath}${ext}`;
      if (fsSync.existsSync(candidate) && fsSync.statSync(candidate).isFile()){
        return candidate;
      }
    }
  }
  return fsSync.existsSync(basePath) ? basePath : null;
}

function toModuleId(filePath){
  const rel = path.relative(SRC_DIR, filePath);
  const normalized = rel.split(path.sep).join('/');
  return `./${normalized}`;
}

function resolveImport(fromId, specifier){
  const stubPath = STUB_MODULE_SPECIFIERS.get(specifier);
  if (stubPath){
    const stubModuleId = toModuleId(stubPath);
    return applyLegacyModuleAlias(stubModuleId);
  }
  const aliasResolved = resolveAlias(specifier);
  if (aliasResolved){
    return applyLegacyModuleAlias(aliasResolved);
  }

  const fromPath = path.join(SRC_DIR, fromId.slice(2));
  const baseResolved = specifier.startsWith('.')
    ? path.resolve(path.dirname(fromPath), specifier)
    : path.resolve(SRC_DIR, specifier);
  const withExt = resolveWithExtensions(baseResolved);
  const moduleId = toModuleId(withExt || baseResolved);
  return applyLegacyModuleAlias(moduleId);
}

async function listSourceFiles(){
  const files = [];
  async function walk(dir){
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries){
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()){
        await walk(fullPath);
      } else if (entry.isFile()){
        const ext = path.extname(entry.name);
        if (SOURCE_EXTENSIONS.includes(ext)){
          files.push(fullPath);
        }
      }
    }
  }
  await walk(SRC_DIR);
  return files.sort();
}

function extractRuntimeSpecifiers(sourceCode){
  const specifiers = [];
  const importFromRegex = /import\s+(?!type\b)[\s\S]*?\s+from\s*['\"](.+?)['\"]/g;
  const exportFromRegex = /export\s+(?:\*|{[\s\S]*?})\s+from\s*['\"](.+?)['\"]/g;
  const importSideEffectRegex = /import\s*['\"](.+?)['\"]/g;
  const dynamicImportRegex = /import\(\s*['\"](.+?)['\"]\s*\)/g;

  for (const regex of [importFromRegex, exportFromRegex, importSideEffectRegex, dynamicImportRegex]){
    let match;
    while ((match = regex.exec(sourceCode)) !== null){
      specifiers.push(match[1]);
    }
  }

  return specifiers;
}

function collectReachableModuleIds(entryModuleId, sourceFiles){
  const fileByModuleId = new Map(sourceFiles.map((file) => [toModuleId(file), file]));
  const visited = new Set();
  const queue = [entryModuleId];

  for (const [, stubPath] of STUB_MODULE_SPECIFIERS){
    const stubModuleId = toModuleId(stubPath);
    fileByModuleId.set(stubModuleId, stubPath);
  }

  while (queue.length > 0){
    const currentId = applyLegacyModuleAlias(queue.shift());
    if (!currentId || visited.has(currentId)){
      continue;
    }
    visited.add(currentId);
    const filePath = fileByModuleId.get(currentId);
    if (!filePath || !fsSync.existsSync(filePath)){
      continue;
    }

    const ext = path.extname(filePath);
    if (!SCRIPT_EXTENSIONS.has(ext)){
      continue;
    }

    const sourceCode = fsSync.readFileSync(filePath, 'utf8');
    const specifiers = extractRuntimeSpecifiers(sourceCode);
    for (const specifier of specifiers){
      const resolvedModuleId = resolveImport(currentId, specifier);
      if (resolvedModuleId && !visited.has(resolvedModuleId)){
        queue.push(resolvedModuleId);
      }
    }
  }

  return visited;
}

function syncLegacyModuleAliases(files){
  for (const file of files){
    const ext = path.extname(file);
    if (ext === '.ts' || ext === '.tsx'){
      const moduleId = toModuleId(file);
      const jsModuleId = moduleId.replace(/\.tsx?$/, '.js');
      registerLegacyModuleAlias(jsModuleId, moduleId, { override: false });
    }
  }
}

function splitImportClause(clause){
  let depth = 0;
  for (let i = 0; i < clause.length; i += 1){
    const ch = clause[i];
    if (ch === '{'){
      depth += 1;
    } else if (ch === '}'){
      depth = Math.max(0, depth - 1);
    } else if (ch === ',' && depth === 0){
      const head = clause.slice(0, i).trim();
      const tail = clause.slice(i + 1).trim();
      return { head, tail };
    }
  }
  return { head: clause.trim(), tail: '' };
}

const IMPORT_LOCAL_IDENTIFIER_REGEX = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const NAMESPACE_IMPORT_REGEX = /^\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)$/;

function parseNamedImports(block){
  const trimmed = block.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')){
    throw new Error(`Unsupported import clause: ${block}`);
  }
  const inside = trimmed.slice(1, -1);
  return inside
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.replace(/^type\s+/, '').trim())
    .filter(Boolean)
    .map((part) => {
      const [importedRaw, localRaw] = part.split(/\s+as\s+/);
      const imported = importedRaw.trim();
      const local = (localRaw || importedRaw).trim();
      return { imported, local };
    });
}

function parseNamespaceImport(clause, specifiers){
  const namespaceMatch = clause.match(NAMESPACE_IMPORT_REGEX);
  if (!namespaceMatch){
    throw new Error(`Unsupported import clause: ${specifiers}`);
  }
  return namespaceMatch[1];
}

function appendNamedImportLines(lines, namedBlock, moduleVar){
  const entries = parseNamedImports(namedBlock);
  for (const { imported, local } of entries){
    lines.push(`const ${local} = ${moduleVar}.${imported};`);
  }
}

function createImportReplacement(specifiers, moduleVar){
  const lines = [];
  const cleaned = specifiers.trim();
  if (!cleaned){
    return lines;
  }

  if (cleaned.startsWith('{')){
    appendNamedImportLines(lines, cleaned, moduleVar);
    return lines;
  }
  if (cleaned.startsWith('*')){
    const namespaceLocal = parseNamespaceImport(cleaned, specifiers);
    lines.push(`const ${namespaceLocal} = ${moduleVar};`);
    return lines;
  }

  const { head, tail } = splitImportClause(cleaned);
  if (!IMPORT_LOCAL_IDENTIFIER_REGEX.test(head)){
    throw new Error(`Unsupported import clause: ${specifiers}`);
  }
  lines.push(`const ${head} = ${moduleVar}.default ?? ${moduleVar};`);

  if (!tail){
    return lines;
  }
  if (tail.startsWith('{')){
    appendNamedImportLines(lines, tail, moduleVar);
    return lines;
  }
  if (tail.startsWith('*')){
    const namespaceLocal = parseNamespaceImport(tail, specifiers);
    lines.push(`const ${namespaceLocal} = ${moduleVar};`);
    return lines;
  }
  throw new Error(`Unsupported import clause: ${specifiers}`);
}

function transformModule(code, id){
  const exportsAssignments = [];
  const usedAliases = new Set();
  const registerExport = (alias, expr) => {
    const existingIndex = exportsAssignments.findIndex((item) => item.alias === alias);
    if (existingIndex >= 0){
      exportsAssignments[existingIndex] = { alias, expr };
    } else {
      usedAliases.add(alias);
      exportsAssignments.push({ alias, expr });
    }
  };
  const ensureDefaultExport = (expr) => {
    registerExport('default', expr);
  };
  const generateDefaultLocal = () => {
    const base = '__defaultExport';
    let candidate = base;
    let counter = 0;
    const hasName = (name) => new RegExp(`\\b${name}\\b`).test(code);
    while (hasName(candidate)){
      candidate = `${base}${++counter}`;
    }
    return candidate;
  };
  let defaultLocalName = null;
  let depIndex = 0;
  const reExportRegex = /export\s*{([\s\S]*?)}\s*from\s*['\"](.+?)['\"];?/g;
  code = code.replace(reExportRegex, (match, spec, source) => {
    const depId = resolveImport(id, source.trim());
    const moduleVar = `__reexport${depIndex++}`;
    const lines = [`const ${moduleVar} = __require('${depId}');`];
    const parts = spec.split(',').map((p) => p.trim()).filter(Boolean);
    for (const part of parts){
      if (!part) continue;
      const [importedRaw, localRaw] = part.split(/\s+as\s+/);
      const imported = importedRaw.trim();
      const local = (localRaw || importedRaw).trim();
      if (!usedAliases.has(local)){
        usedAliases.add(local);
        exportsAssignments.push({ alias: local, expr: `${moduleVar}.${imported}` });
      }
    }
    return lines.join('\n');
  });
  
  const reExportAllRegex = /export\s*\*\s*from\s*['\"](.+?)['\"];?/g;
  code = code.replace(reExportAllRegex, (match, source) => {
    const depId = resolveImport(id, source.trim());
    const moduleVar = `__reexport${depIndex++}`;
    const lines = [`const ${moduleVar} = __require('${depId}');`,
      `for (const key of Object.keys(${moduleVar})) {`,
      `  if (key === 'default') continue;`,
      `  if (Object.prototype.hasOwnProperty.call(exports, key)) continue;`,
      `  exports[key] = ${moduleVar}[key];`,
      `}`];
    return lines.join('\n');
  });

  const importRegex = /import\s*([\s\S]*?)\s*from\s*['\"](.+?)['\"];?/g;
  const importTypeRegex = /import\s+type\s+([\s\S]*?)\s*from\s*['\"](.+?)['\"];?/g;
  const importSideEffectRegex = /import\s*['\"](.+?)['\"];?/g;
  code = code.replace(importTypeRegex, () => '');
  code = code.replace(importSideEffectRegex, (match, source) => {
    const depId = resolveImport(id, source.trim());
    return `__require('${depId}');`;
  });
  code = code.replace(importRegex, (match, clause, source) => {
    const depId = resolveImport(id, source.trim());
    const moduleVar = `__dep${depIndex++}`;
    const lines = [`const ${moduleVar} = __require('${depId}');`];
    const importLines = createImportReplacement(clause, moduleVar);
    lines.push(...importLines);
    return lines.join('\n');
  });

  const exportNamedRegex = /export\s*{([\s\S]*?)}\s*;/g;
  code = code.replace(exportNamedRegex, (match, spec) => {
    const parts = spec.split(',').map((p) => p.trim()).filter(Boolean);
    const lines = [];
    for (const part of parts){
      if (!part) continue;
      const [localRaw, aliasRaw] = part.split(/\s+as\s+/);
      const local = localRaw.trim();
      const alias = (aliasRaw || localRaw).trim();
      if (!usedAliases.has(alias)){
        usedAliases.add(alias);
        lines.push(`exports.${alias} = ${local};`);
      }
    }
    return lines.join('\n');
  });

  const exportConstRegex = /export\s+(const|let|var)\s+([A-Za-z0-9_$]+)/g;
  code = code.replace(exportConstRegex, (match, kind, name) => {
    if (!usedAliases.has(name)){
      usedAliases.add(name);
      exportsAssignments.push({ alias: name, expr: name });
    }
    return `${kind} ${name}`;
  });

  const exportFunctionRegex = /export\s+(async\s+)?function\s+([A-Za-z0-9_$]+)/g;
  code = code.replace(exportFunctionRegex, (match, asyncKeyword = '', name) => {
    if (!usedAliases.has(name)){
      usedAliases.add(name);
      exportsAssignments.push({ alias: name, expr: name });
    }
    const prefix = asyncKeyword || '';
    return `${prefix}function ${name}`;
  });

  const exportClassRegex = /export\s+(abstract\s+)?class\s+([A-Za-z0-9_$]+)/g;
  code = code.replace(exportClassRegex, (match, abstractKeyword = '', name) => {
    if (!usedAliases.has(name)){
      usedAliases.add(name);
      exportsAssignments.push({ alias: name, expr: name });
    }
    const prefix = abstractKeyword || '';
    return `${prefix}class ${name}`;
  });

  const exportDefaultNamedFunctionRegex = /export\s+default\s+(async\s+)?function\s+([A-Za-z0-9_$]+)/g;
  code = code.replace(exportDefaultNamedFunctionRegex, (match, asyncKeyword = '', name) => {
    ensureDefaultExport(name);
    const prefix = asyncKeyword || '';
    return `${prefix}function ${name}`;
  });

  const exportDefaultAnonFunctionRegex = /export\s+default\s+(async\s+)?function(\s*\()/g;
  code = code.replace(exportDefaultAnonFunctionRegex, (match, asyncKeyword = '', afterParen) => {
    if (!defaultLocalName){
      defaultLocalName = generateDefaultLocal();
    }
    const local = defaultLocalName;
    ensureDefaultExport(local);
    const prefix = asyncKeyword || '';
    return `${prefix}function ${local}${afterParen}`;
  });

  const exportDefaultNamedClassRegex = /export\s+default\s+class\s+([A-Za-z0-9_$]+)/g;
  code = code.replace(exportDefaultNamedClassRegex, (match, name) => {
    ensureDefaultExport(name);
    return `class ${name}`;
  });

  const exportDefaultAnonClassRegex = /export\s+default\s+class\b/g;
  code = code.replace(exportDefaultAnonClassRegex, () => {
    if (!defaultLocalName){
      defaultLocalName = generateDefaultLocal();
    }
    const local = defaultLocalName;
    ensureDefaultExport(local);
    return `class ${local}`;
  });

  const exportDefaultRegex = /export\s+default\s+([\s\S]*?);/g;
  code = code.replace(exportDefaultRegex, (match, expr) => {
    const trimmed = expr.trim();
    if (!trimmed){
      return '';
    }
    if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(trimmed)){
      ensureDefaultExport(trimmed);
      return '';
    }
    if (!defaultLocalName){
      defaultLocalName = generateDefaultLocal();
    }
    const local = defaultLocalName;
    ensureDefaultExport(local);
    return `const ${local} = ${trimmed};`;
  });

  const footerLines = exportsAssignments
    .filter((item, index, arr) => index === arr.findIndex((it) => it.alias === item.alias))
    .map(({ alias, expr }) => `if (!Object.prototype.hasOwnProperty.call(exports, '${alias}')) exports.${alias} = ${expr};`);
    
  if (exportsAssignments.some((item) => item.alias === 'default')){
    footerLines.push('module.exports.default = exports.default;');
  }

  const transformed = footerLines.length
    ? `${code}\n${footerLines.join('\n')}`
    : code;

  return transformed;
}

function indent(code, spaces = 2){
  const pad = ' '.repeat(spaces);
  return code
    .split('\n')
    .map((line) => (line.length ? pad + line : ''))
    .join('\n');
}

function formatBytes(bytes){
  if (!Number.isFinite(bytes) || bytes < 0){
    return `${bytes}`;
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let index = 0;
  let value = bytes;
  while (value >= 1024 && index < units.length - 1){
    value /= 1024;
    index += 1;
  }
  const display = value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${display} ${units[index]}`;
}

function logTopBundleSizes(metafile, limit = 5){
  if (!metafile || !metafile.outputs){
    return;
  }
  const entries = Object.entries(metafile.outputs)
    .map(([file, info]) => ({
      file,
      bytes: typeof info.bytes === 'number' ? info.bytes : info.bytesWritten,
    }))
    .filter((item) => typeof item.bytes === 'number' && item.bytes >= 0);
  if (!entries.length){
    return;
  }
  entries.sort((a, b) => b.bytes - a.bytes);
  const topEntries = entries.slice(0, limit);
  const label = MODE === 'production' ? 'Production' : 'Development';
  console.log(`[${label}] Top bundle size${topEntries.length > 1 ? 's' : ''}:`);
  for (const { file, bytes } of topEntries){
    console.log(` - ${file}: ${formatBytes(bytes)} (${bytes} bytes)`);
  }
}

async function build(){
  const files = await listSourceFiles();
  syncLegacyModuleAliases(files);
  const reachableModuleIds = pruneUnreachableModules
    ? collectReachableModuleIds(ENTRY_ID, files)
    : null;
  if (reachableModuleIds){
    console.log(`[build.mjs] Chế độ prune-unreachable bật: đóng gói ${reachableModuleIds.size}/${files.length} module từ điểm vào ${ENTRY_ID}.`);
  }
  const modules = [];
  for (const file of files){
    const id = toModuleId(file);
    if (reachableModuleIds && !reachableModuleIds.has(id)){
      continue;
    }
    const raw = await fs.readFile(file, 'utf8');
    const ext = path.extname(file);
    if (ext === '.json'){
      const normalizedJson = JSON.stringify(JSON.parse(raw));
      const escaped = normalizedJson
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
      const moduleCode = [
        `const data = JSON.parse('${escaped}');`,
        'module.exports = data;',
        'module.exports.default = data;',
      ].join('\n');
      modules.push({ id, code: moduleCode });
      continue;
    }
    if (ext === '.css'){
      const moduleCode = [
        `const css = ${JSON.stringify(raw)};`,
        'module.exports = css;',
        'module.exports.default = css;',
      ].join('\n');
      modules.push({ id, code: moduleCode });
      continue;
    }
    let sourceCode = raw;
    if (SCRIPT_EXTENSIONS.has(ext)){
      const loader = ext === '.ts' ? 'ts' : ext === '.tsx' ? 'tsx' : 'js';
      const { code } = await esbuild.transform(raw, {
        loader,
        platform: ESBUILD_BASE_OPTIONS.platform,
        format: ESBUILD_BASE_OPTIONS.format,
        target: ESBUILD_BASE_OPTIONS.target,
        sourcemap: ESBUILD_BASE_OPTIONS.sourcemap,
        treeShaking: ESBUILD_BASE_OPTIONS.treeShaking,
        define: ESBUILD_DEFINE,
        legalComments: ESBUILD_BASE_OPTIONS.legalComments,
        ...ESBUILD_TRANSFORM_MINIFY_OPTIONS,
      });
      sourceCode = code;
    }
    const transformed = transformModule(sourceCode, id);
    modules.push({ id, code: transformed });
  }

  for (const [, stubPath] of STUB_MODULE_SPECIFIERS){
    const moduleId = toModuleId(stubPath);
    if (reachableModuleIds && !reachableModuleIds.has(moduleId)){
      continue;
    }
    if (modules.some((mod) => mod.id === moduleId)){
      continue;
    }
    const raw = await fs.readFile(stubPath, 'utf8');
    const ext = path.extname(stubPath);
    let sourceCode = raw;
    if (SCRIPT_EXTENSIONS.has(ext)){
      const loader = ext === '.ts' ? 'ts' : ext === '.tsx' ? 'tsx' : 'js';
      const { code } = await esbuild.transform(raw, {
        loader,
        platform: ESBUILD_BASE_OPTIONS.platform,
        format: ESBUILD_BASE_OPTIONS.format,
        target: ESBUILD_BASE_OPTIONS.target,
        sourcemap: ESBUILD_BASE_OPTIONS.sourcemap,
        treeShaking: ESBUILD_BASE_OPTIONS.treeShaking,
        define: ESBUILD_DEFINE,
        legalComments: ESBUILD_BASE_OPTIONS.legalComments,
        ...ESBUILD_TRANSFORM_MINIFY_OPTIONS,
      });
      sourceCode = code;
    }
    const transformed = transformModule(sourceCode, moduleId);
    modules.push({ id: moduleId, code: transformed });
  }

  await fs.mkdir(DIST_DIR, { recursive: true });
  await copyStaticAssets();
  const parts = [];
  parts.push('// Bundled by build.mjs');
  parts.push('const __modules = Object.create(null);');
  parts.push('const __cache = Object.create(null);');
  parts.push('if (typeof globalThis !== "undefined" && typeof globalThis.__modules === "undefined"){ globalThis.__modules = __modules; }');
  const legacyAliasObject = Object.fromEntries(LEGACY_MODULE_ID_ALIASES);
  parts.push(`const __legacyModuleAliases = ${JSON.stringify(legacyAliasObject)};`);
  parts.push('if (typeof globalThis !== "undefined" && typeof globalThis.__legacyModuleAliases === "undefined"){ globalThis.__legacyModuleAliases = __legacyModuleAliases; }');
  parts.push('const __emptyAliases = Object.keys(__legacyModuleAliases).length === 0;');
  parts.push('function __require(id){');
  parts.push('  let moduleId = id;');
  parts.push('  if (!__emptyAliases){');
  parts.push('    const aliased = __legacyModuleAliases[moduleId];');
  parts.push('    if (aliased) moduleId = aliased;');
  parts.push('  }');
  parts.push('  const cached = __cache[moduleId];');
  parts.push('  if (cached) return cached.exports;');
  parts.push('  const factory = __modules[moduleId];');
  parts.push("  if (!factory) throw new Error('Module not found: ' + moduleId);");
  parts.push('  const module = { exports: {} };');
  parts.push('  __cache[moduleId] = module;');
  parts.push('  factory(module.exports, module, __require);');
  parts.push('  return module.exports;');
  parts.push('}');
  parts.push('if (typeof globalThis !== "undefined" && typeof globalThis.__moduleCache === "undefined"){ globalThis.__moduleCache = __cache; }');
  parts.push('if (typeof globalThis !== "undefined" && typeof globalThis.__require === "undefined"){ globalThis.__require = __require; }');

  for (const { id, code } of modules){
    parts.push(`__modules['${id}'] = (exports, module, __require) => {`);
    parts.push(indent(code));
    parts.push('};');
  }

  parts.push('try {');
  parts.push(`  __require('${ENTRY_ID}');`);
  parts.push('} catch (err) {');
  parts.push("  console.error('Failed to bootstrap Arclune bundle:', err);");
  parts.push('  throw err;');
  parts.push('}');

  const output = parts.join('\n') + '\n';
  const result = await esbuild.build({
    stdin: {
      contents: output,
      resolveDir: SRC_DIR,
      sourcefile: 'virtual-entry.js',
      loader: 'js',
    },
    platform: ESBUILD_BASE_OPTIONS.platform,
    bundle: ESBUILD_BASE_OPTIONS.bundle,
    write: false,
    format: ESBUILD_BASE_OPTIONS.format,
    target: ESBUILD_BASE_OPTIONS.target,
    sourcemap: ESBUILD_BASE_OPTIONS.sourcemap,
    metafile: ESBUILD_BASE_OPTIONS.metafile,
    treeShaking: ESBUILD_BASE_OPTIONS.treeShaking,
    define: ESBUILD_DEFINE,
    mainFields: ESBUILD_BASE_OPTIONS.mainFields,
    conditions: ESBUILD_BASE_OPTIONS.conditions,
    legalComments: ESBUILD_BASE_OPTIONS.legalComments,
    ...ESBUILD_TRANSFORM_MINIFY_OPTIONS,
  });
  const outputFile = result.outputFiles?.[0];
  const transpiled = outputFile?.text ?? '';
  await fs.writeFile(path.join(DIST_DIR, 'app.js'), transpiled, 'utf8');
  if (result.metafile){
    const reportPath = path.join(DIST_DIR, 'build-report.json');
    await fs.writeFile(reportPath, JSON.stringify(result.metafile, null, 2), 'utf8');
    logTopBundleSizes(result.metafile);
  }

  if (!skipBundleVerify){
    const verifyResult = verifyAetherBundle(path.join(DIST_DIR, 'app.js'));
    if (!verifyResult.ok){
      const missing = verifyResult.missing.length
        ? ` | thiếu marker: ${verifyResult.missing.join(', ')}`
        : '';
      const stale = verifyResult.stale.length
        ? ` | còn marker cũ: ${verifyResult.stale.join(', ')}`
        : '';
      throw new Error(`[build.mjs] ${verifyResult.message}${missing}${stale}`);
    }
  }
}

build().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
