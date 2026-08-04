import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const candidates = ['src/combat/runtime-hooks', 'src/combat/unit-runtime-hooks.ts', 'src/combat/perform-active-skill.ts', 'src/modes/pve'];
const files = candidates.flatMap(candidate => {
  const absolute = path.resolve(candidate);
  if (!fs.existsSync(absolute)) return [];
  if (fs.statSync(absolute).isFile()) return [absolute];
  return fs.readdirSync(absolute).filter(name => /runtime.*\.ts$/.test(name)).map(name => path.join(absolute, name));
});
const authoritative = new Set(['hp', 'hpMax', 'atk', 'wil', 'arm', 'res', 'agi', 'spd', 'aether', 'Aether', 'fury', 'Fury', 'rage', 'Rage', 'alive', 'lifeState', 'turnCursor', 'actedNatural', 'occupancy']);
const arrayMutators = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']);
const violations = [];

const propertyName = node => {
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  if (ts.isElementAccessExpression(node) && node.argumentExpression && (ts.isStringLiteral(node.argumentExpression) || ts.isNoSubstitutionTemplateLiteral(node.argumentExpression))) return node.argumentExpression.text;
  return null;
};
const line = (source, node) => source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;

for (const file of files) {
  const relativeFile = path.relative('.', file);
  const responsibility = relativeFile.includes('combat/runtime-hooks/') || /(?:^|\/)unit-runtime-hooks\.ts$/.test(relativeFile) || relativeFile.endsWith('combat/perform-active-skill.ts')
    ? 'character-runtime'
    : 'session-orchestrator';
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const aliases = new Map();
  const visit = node => {
    if (ts.isVariableDeclaration(node) && ts.isObjectBindingPattern(node.name) && node.initializer) {
      for (const element of node.name.elements) {
        const key = element.propertyName?.getText(source) ?? element.name.getText(source);
        if (authoritative.has(key)) aliases.set(element.name.getText(source), key);
      }
    }
    if (ts.isBinaryExpression(node) && ts.isAssignmentOperator(node.operatorToken.kind)) {
      const key = propertyName(node.left);
      const alias = ts.isIdentifier(node.left) ? aliases.get(node.left.text) : null;
      if (responsibility === 'character-runtime' && ((key && authoritative.has(key)) || alias)) violations.push(`${relativeFile}:${line(source, node)} direct mutation of ${key ?? alias}`);
    }
    if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) && [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(node.operator)) {
      const key = propertyName(node.operand);
      if (responsibility === 'character-runtime' && key && authoritative.has(key)) violations.push(`${relativeFile}:${line(source, node)} direct mutation of ${key}`);
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const receiver = node.expression.expression.getText(source);
      if (node.expression.name.text === 'assign' && receiver === 'Object') {
        for (const arg of node.arguments.slice(1)) if (ts.isObjectLiteralExpression(arg)) for (const prop of arg.properties) {
          if (responsibility === 'character-runtime' && ts.isPropertyAssignment(prop) && authoritative.has(prop.name.getText(source).replace(/['"]/g, ''))) violations.push(`${relativeFile}:${line(source, prop)} Object.assign authoritative mutation`);
        }
      }
      if (responsibility === 'character-runtime' && arrayMutators.has(node.expression.name.text) && /(?:^|\.)tokens$/.test(receiver)) violations.push(`${relativeFile}:${line(source, node)} direct Game.tokens array mutation`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

export function auditCharacterRuntimeMutations() { return Object.freeze([...violations]); }
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  if (violations.length) { console.error(violations.join('\n')); process.exitCode = 1; }
  else console.log(`Character runtime mutation audit passed (${files.length} files, 0 violations).`);
}
