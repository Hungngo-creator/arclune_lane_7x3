import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.SANDBOX_PORT ?? 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid SANDBOX_PORT');
const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.css': 'text/css', '.md': 'text/plain' };
const server = http.createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) || !types[extname(file)]) { res.writeHead(404); res.end('Not found'); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': `${types[extname(file)]}; charset=utf-8`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) { res.writeHead(error instanceof URIError ? 400 : 404); res.end('Not found'); }
});
server.listen(port, '0.0.0.0', () => console.log(`Arclune sandbox: http://localhost:${port}`));
