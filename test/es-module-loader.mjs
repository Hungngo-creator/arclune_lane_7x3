import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = pathToFileURL(process.cwd()).href;

export async function load(url, context, defaultLoad) {
  if (url.startsWith('node:')) {
    return defaultLoad(url, context, defaultLoad);
  }
  if (url.startsWith(ROOT) && url.endsWith('.js')) {
    const source = await fs.readFile(new URL(url), 'utf8');
    return { format: 'module', source, shortCircuit: true };
  }
  return defaultLoad(url, context, defaultLoad);
}
