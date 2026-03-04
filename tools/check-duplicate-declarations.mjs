import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');

function listTsFiles(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listTsFiles(fullPath));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!/\.(ts|tsx|mts|cts)$/.test(entry.name)) continue;
    if (/\.d\.ts$/.test(entry.name)) continue;
    out.push(fullPath);
  }
  return out;
}

const duplicates = [];

function checkScope(node, sourceFile) {
  const seen = new Map();
  for (const statement of node.statements ?? []) {
    if (ts.isVariableStatement(statement)) {
      const isLexical = (statement.declarationList.flags & ts.NodeFlags.BlockScoped) !== 0;
      if (!isLexical) continue;
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        const name = declaration.name.text;
        const loc = sourceFile.getLineAndCharacterOfPosition(declaration.name.getStart(sourceFile));
        const prev = seen.get(name);
        if (prev) {
          duplicates.push(`${sourceFile.fileName}:${loc.line + 1}:${loc.character + 1} duplicate lexical declaration \`${name}\` (first declared at line ${prev.line})`);
        } else {
          seen.set(name, { line: loc.line + 1 });
        }
      }
    }
  }

  ts.forEachChild(node, (child) => {
    if (ts.isSourceFile(child) || ts.isBlock(child) || ts.isModuleBlock(child) || ts.isCaseClause(child) || ts.isDefaultClause(child)) {
      checkScope(child, sourceFile);
      return;
    }
    ts.forEachChild(child, (nested) => {
      if (ts.isBlock(nested) || ts.isCaseClause(nested) || ts.isDefaultClause(nested)) {
        checkScope(nested, sourceFile);
      }
    });
  });
}

if (!fs.existsSync(srcDir)) {
  console.error('Source directory not found:', srcDir);
  process.exit(1);
}

for (const filePath of listTsFiles(srcDir)) {
  const code = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true);
  checkScope(sourceFile, sourceFile);
}

if (duplicates.length > 0) {
  console.error('Duplicate lexical declarations detected:');
  for (const item of duplicates) console.error(` - ${item}`);
  process.exit(1);
}

console.log('No duplicate lexical declarations found.');
