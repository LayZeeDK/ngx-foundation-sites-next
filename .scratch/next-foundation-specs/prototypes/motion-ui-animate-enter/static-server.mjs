// Minimal static file server for the production build, no dependency needed.
// Usage: node static-server.mjs <port>
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = join(import.meta.dirname, 'dist', 'app', 'browser');
const port = Number(process.argv[2] ?? 4470);

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let filePath = join(root, decodeURIComponent(url.pathname));

  try {
    const stats = await stat(filePath);

    if (stats.isDirectory()) {
      filePath = join(filePath, 'index.html');
    }
  } catch {
    filePath = join(root, 'index.html');
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[extname(filePath)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Static server listening on http://localhost:${port}`);
});
