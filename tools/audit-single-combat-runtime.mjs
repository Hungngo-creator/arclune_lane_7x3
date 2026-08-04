import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const failures = [];
const executable = read('src/combat/executable-character-definition.ts');
const canonical = read('src/combat/canonical-model.ts');

for (const forbidden of ['dispatchGameplayTags', 'normalizeTagList', 'canonicalizeCombatTagsWithRule']) {
  if (executable.includes(forbidden)) failures.push(`compiled catalog imports legacy execution primitive ${forbidden}`);
}
if (!canonical.includes('authoritativeReceipts.has(receipt)')) failures.push('canonical dispatcher does not authenticate runtime-owned receipts');
if (/JSON\.(stringify|parse)/.test(executable)) failures.push('compiled actions perform JSON serialization');

const runtimeFiles = fs.readdirSync(path.join(ROOT, 'src/combat/runtime-hooks')).filter(name => name.endsWith('.ts'));
for (const name of runtimeFiles) {
  const source = read(`src/combat/runtime-hooks/${name}`);
  if (/from ['"]\.\.\/kernel\/(?!index)/.test(source)) failures.push(`${name} imports an internal Kernel commit module`);
}

if (failures.length) {
  console.error(failures.map(value => `- ${value}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Single combat runtime audit passed (${runtimeFiles.length} character runtime modules).`);
}
