import { cpSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const toolsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(toolsDir, '..');
const nodeModulesDir = join(projectRoot, 'node_modules');

const stubs = [
  { name: 'zod', source: join(projectRoot, 'tools', 'zod-stub') },
  { name: 'esbuild', source: join(projectRoot, 'tools', 'esbuild-stub') },
  { name: 'tsx', source: join(projectRoot, 'tools', 'tsx-stub') },
];

function ensureDirectory(targetPath) {
  if (!existsSync(targetPath)) {
    mkdirSync(targetPath, { recursive: true });
  }
}

function copyStub({ name, source }) {
  if (!existsSync(source) || !statSync(source).isDirectory()) {
    console.warn(`Bỏ qua stub ${name} vì không tìm thấy thư mục nguồn: ${source}`);
    return;
  }

  const destination = join(nodeModulesDir, name);
  ensureDirectory(dirname(destination));
  rmSync(destination, { recursive: true, force: true });
  cpSync(source, destination, { recursive: true });
  console.log(`Đã sao chép stub ${name} vào ${destination}`);
}

function main() {
  ensureDirectory(nodeModulesDir);
  stubs.forEach(copyStub);
}

main();
