import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
const ENTRY_ID = './entry.js';
const SOURCE_EXTENSIONS = ['.js', '.ts', '.tsx', '.json'];
const SCRIPT_EXTENSIONS = new Set(['.js', '.ts', '.tsx']);

const args = process.argv.slice(2);
const modeArg = args.find((arg) => arg.startsWith('--mode='));
const argMode = modeArg ? modeArg.split('=')[1] : undefined;
const normalizedMode = argMode && argMode.toLowerCase() === 'production' ? 'production' : argMode && argMode.toLowerCase() === 'development' ? 'development' : undefined;
if (normalizedMode) {
  process.env.NODE_ENV = normalizedMode;
}
const MODE = (normalizedMode ?? process.env.NODE_ENV) === 'production' ? 'production' : 'development';
const ESBUILD_BASE_OPTIONS = {
  format: 'esm',
  target: ['es2023'],
  sourcemap: MODE === 'production' ? false : true,
  splitting: true,
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
          return resolved;
        }
      }
    } else if (specifier === find){
      for (const replacement of replacements){
        const resolved = resolveWithExtensions(replacement);
        if (resolved){
          return resolved;
        }
      }
    }
  }
  return null;
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
  const aliasResolved = resolveAlias(specifier);
  if (aliasResolved){
    return toModuleId(aliasResolved);
  }

  const fromPath = path.join(SRC_DIR, fromId.slice(2));
  const baseResolved = specifier.startsWith('.')
    ? path.resolve(path.dirname(fromPath), specifier)
    : path.resolve(SRC_DIR, specifier);
  const withExt = resolveWithExtensions(baseResolved);
  return toModuleId(withExt || baseResolved);
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
    .map((part) => {
      const [importedRaw, localRaw] = part.split(/\s+as\s+/);
      const imported = importedRaw.trim();
      const local = (localRaw || importedRaw).trim();
      return { imported, local };
    });
}

function createImportReplacement(specifiers, moduleVar){
  const lines = [];
  const cleaned = specifiers.trim();
  if (!cleaned){
    return lines;
  }

  let remaining = cleaned;

  if (!remaining.startsWith('{') && !remaining.startsWith('*')){
    const defaultMatch = remaining.match(/^([A-Za-z_$][A-Za-z0-9_$]*)/);
    if (!defaultMatch){
      throw new Error(`Unsupported import clause: ${specifiers}`);
    }
    const local = defaultMatch[1];
    lines.push(`const ${local} = ${moduleVar}.default ?? ${moduleVar};`);
    remaining = remaining.slice(defaultMatch[0].length).trim();
    if (remaining.startsWith(',')){
      remaining = remaining.slice(1).trim();
    } else if (remaining.length){
      throw new Error(`Unsupported import clause: ${specifiers}`);
    }
  }

  if (!remaining){
    return lines;
  }

  if (!remaining.startsWith('{') || !remaining.endsWith('}')){
    throw new Error(`Unsupported import clause: ${specifiers}`);
  }

  const inside = remaining.slice(1, -1);
  const parts = inside.split(',').map((p) => p.trim()).filter(Boolean);
  for (const part of parts){
    if (!part) continue;
    const [importedRaw, localRaw] = part.split(/\s+as\s+/);
    const imported = importedRaw.trim();
    const local = (localRaw || importedRaw).trim();
    lines.push(`const ${local} = ${moduleVar}.${imported};`);
  }
  return lines;
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

  const importRegex = /import\s*([\s\S]*?)\s*from\s*['\"](.+?)['\"];?/g;
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

  const exportFunctionRegex = /export\s+function\s+([A-Za-z0-9_$]+)/g;
  code = code.replace(exportFunctionRegex, (match, name) => {
    if (!usedAliases.has(name)){
      usedAliases.add(name);
      exportsAssignments.push({ alias: name, expr: name });
    }
    return `function ${name}`;
  });

const exportDefaultNamedFunctionRegex = /export\s+default\s+function\s+([A-Za-z0-9_$]+)/g;
  code = code.replace(exportDefaultNamedFunctionRegex, (match, name) => {
    ensureDefaultExport(name);
    return `function ${name}`;
  });

  const exportDefaultAnonFunctionRegex = /export\s+default\s+function(\s*\()/g;
  code = code.replace(exportDefaultAnonFunctionRegex, (match, afterParen) => {
    if (!defaultLocalName){
      defaultLocalName = generateDefaultLocal();
    }
    const local = defaultLocalName;
    ensureDefaultExport(local);
    return `function ${local}${afterParen}`;
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
    .map(({ alias, expr }) => `exports.${alias} = ${expr};`);
    
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

async function build(){
  const files = await listSourceFiles();
  const modules = [];
  for (const file of files){
    const id = toModuleId(file);
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
    let sourceCode = raw;
    if (SCRIPT_EXTENSIONS.has(ext)){
      const loader = ext === '.ts' ? 'ts' : ext === '.tsx' ? 'tsx' : 'js';
      const { code } = await esbuild.transform(raw, {
        loader,
        format: ESBUILD_BASE_OPTIONS.format,
        target: ESBUILD_BASE_OPTIONS.target,
        sourcemap: ESBUILD_BASE_OPTIONS.sourcemap,
      });
      sourceCode = code;
    }
    const transformed = transformModule(sourceCode, id);
    modules.push({ id, code: transformed });
  }

  await fs.mkdir(DIST_DIR, { recursive: true });
  const parts = [];
  parts.push('// Bundled by build.mjs');
  parts.push('const __modules = Object.create(null);');
  parts.push('function __define(id, factory){ __modules[id] = { factory, exports: null, initialized: false }; }');
  parts.push('function __require(id){');
  parts.push('  const mod = __modules[id];');
  parts.push("  if (!mod) throw new Error('Module not found: ' + id);");
  parts.push('  if (!mod.initialized){');
  parts.push('    mod.initialized = true;');
  parts.push('    const module = { exports: {} };');
  parts.push('    mod.exports = module.exports;');
  parts.push('    mod.factory(module.exports, module, __require);');
  parts.push('    mod.exports = module.exports;');
  parts.push('  }');
  parts.push('  return mod.exports;');
  parts.push('}');

  for (const { id, code } of modules){
    parts.push(`__define('${id}', (exports, module, __require) => {`);
    parts.push(indent(code));
    parts.push('});');
  }

  parts.push('try {');
  parts.push(`  __require('${ENTRY_ID}');`);
  parts.push('} catch (err) {');
  parts.push("  console.error('Failed to bootstrap Arclune bundle:', err);");
  parts.push('  throw err;');
  parts.push('}');

  const output = parts.join('\n') + '\n';
  const { code: transpiled } = await esbuild.transform(output, {
    loader: 'js',
format: ESBUILD_BASE_OPTIONS.format,
    target: ESBUILD_BASE_OPTIONS.target,
    sourcemap: ESBUILD_BASE_OPTIONS.sourcemap,
  });
  await fs.writeFile(path.join(DIST_DIR, 'app.js'), transpiled, 'utf8');
}

build().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
