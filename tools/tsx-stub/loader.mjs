import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const projectRoot = path.resolve(process.cwd());

export async function load(url, context, defaultLoad) {
  if (url.startsWith('file://')) {
    const filename = fileURLToPath(url);
    if (filename.startsWith(projectRoot)) {
      if (filename.endsWith('.json')) {
        const source = await readFile(filename, 'utf8');
        const moduleSource = `export default ${source.trim()} ;`;
        return {
          format: 'module',
          source: moduleSource,
          shortCircuit: true,
        };
      }

      if (filename.endsWith('.js') || filename.endsWith('.ts') || filename.endsWith('.mjs')) {
        const source = await readFile(filename, 'utf8');
        return {
          format: 'module',
          source,
          shortCircuit: true,
        };
      }
    }
  }
  return defaultLoad(url, context, defaultLoad);
}

export function resolve(specifier, context, defaultResolve) {
  return defaultResolve(specifier, context, defaultResolve);
}
