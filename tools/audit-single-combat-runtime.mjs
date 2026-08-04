import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const roots = ['src/combat', 'src/modes/pve'];
const files = [];
const walk = entry => {
  if (!fs.existsSync(entry)) return;
  const stat = fs.statSync(entry);
  if (stat.isDirectory()) for (const name of fs.readdirSync(entry)) walk(path.join(entry, name));
  else if (/\.tsx?$/.test(entry)) files.push(entry);
};
roots.forEach(walk);
['src/turns.ts', 'src/summon.ts', 'src/combat.ts', 'src/statuses.ts', 'src/aether.ts'].forEach(walk);

const legacyNames = ['dispatchGameplayTags', 'canonicalizeCombatTagsWithRule', 'compareRuleTagPriority', 'compareRuleConflictUnitPriority', 'doctrine-rule', 'global-rule', 'axiom-rule'];
const legacyModules = ['tag-dispatch', 'tag-aliases'];
const legacy = [];
const failures = [];
const characterRuntime = file => file.includes(`${path.sep}combat${path.sep}runtime-hooks${path.sep}`) || file.endsWith(`${path.sep}unit-runtime-hooks.ts`);

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  for (const name of legacyNames) if (text.includes(name)) legacy.push(`${file}: ${name}`);
  for (const name of legacyModules) if (text.includes(name)) legacy.push(`${file}: ${name}`);
  if (characterRuntime(file)) {
    for (const statement of source.statements) if (ts.isImportDeclaration(statement)) {
      const specifier = statement.moduleSpecifier.text;
      if (/kernel\/index(?:\.ts)?$/.test(specifier)) failures.push(`${file}: imports unrestricted kernel/index.ts`);
      if (/kernel\/(?!public(?:\.ts)?$)/.test(specifier)) failures.push(`${file}: imports internal Kernel module ${specifier}`);
    }
  }
}

const canonical = fs.readFileSync('src/combat/canonical-model.ts', 'utf8');
if (!canonical.includes('authoritativeReceipts.has(receipt)')) failures.push('canonical dispatcher does not authenticate runtime-owned receipts');
if (process.env.REQUIRE_NO_LEGACY_COMBAT === '1') failures.push(...legacy);
if (failures.length) { console.error(failures.map(value => `- ${value}`).join('\n')); process.exitCode = 1; }
else console.log(`Single combat runtime audit passed (${files.length} production files); legacy references reported: ${legacy.length}.`);
if (legacy.length) console.log(legacy.join('\n'));
