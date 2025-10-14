import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');
const ENTRY_ID = './entry.js';

function toModuleId(filePath){
  const rel = path.relative(SRC_DIR, filePath);
  const normalized = rel.split(path.sep).join('/');
  return `./${normalized}`;
}

function resolveImport(fromId, specifier){
  const fromPath = path.join(SRC_DIR, fromId.slice(2));
  const resolved = path.resolve(path.dirname(fromPath), specifier);
  return toModuleId(resolved);
}

async function listSourceFiles(){
  const files = [];
  async function walk(dir){
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries){
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()){
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')){
        files.push(fullPath);
      }
    }
  }
  await walk(SRC_DIR);
  return files.sort();
}

function createImportReplacement(specifiers, moduleVar){
  const lines = [];
  const cleaned = specifiers.trim();
  if (!cleaned.startsWith('{') || !cleaned.endsWith('}')){
    throw new Error(`Unsupported import clause: ${specifiers}`);
  }
  const inside = cleaned.slice(1, -1);
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

  const footerLines = exportsAssignments
    .filter((item, index, arr) => index === arr.findIndex((it) => it.alias === item.alias))
    .map(({ alias, expr }) => `exports.${alias} = ${expr};`);

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
    const transformed = transformModule(raw, id);
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
    target: ['es2017']
  });
  await fs.writeFile(path.join(DIST_DIR, 'app.js'), transpiled, 'utf8');
}

build().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
