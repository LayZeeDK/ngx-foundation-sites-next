// Tiny static file server for the prerendered build (ponytail: node:http covers this,
// no http-server dependency needed). Usage: node serve-static.mjs <dir> <port>
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const [, , dir = 'dist/app/browser', portArg = '4611'] = process.argv;
const port = Number(portArg);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let path = decodeURIComponent(url.pathname);
  if (path === '/' || path === '') {
    path = '/index.html';
  }

  try {
    const data = await readFile(join(dir, path));
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    try {
      const data = await readFile(join(dir, 'index.html'));
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  }
}).listen(port, () => {
  console.log(`serve-static: http://localhost:${port} -> ${dir}`);
});
