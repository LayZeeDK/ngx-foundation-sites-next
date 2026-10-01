import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * PROTOTYPE: a slow network for family CSS and JS chunks, set per browser context by cookie
 * (`nfs-delay-css=300`, `nfs-delay-js=300`), so the browser's own cache and preloads still work.
 */
app.use((req, _res, next) => {
  const cookie = req.headers.cookie ?? '';
  const kind = /nfs-[\w-]+\.css$/.test(req.path) ? 'css' : /chunk-[\w-]+\.js$/.test(req.path) ? 'js' : null;
  const ms = kind ? Number(cookie.match(new RegExp(`nfs-delay-${kind}=(\\d+)`))?.[1] ?? 0) : 0;
  setTimeout(next, ms);
});

/**
 * Serve static files from /browser
 */
// PROTOTYPE: also serve the browser files under /sub (baseHref build) and /cdn (deployUrl build).
app.use(
  ['/sub', '/cdn', '/'], // '/' last: one layer tries its paths in order
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    // PROTOTYPE: the deployUrl build loads module scripts from another origin.
    setHeaders: (res) => res.setHeader('Access-Control-Allow-Origin', '*'),
  }),
);

/**
 * PROTOTYPE 198, point 2: `?csp=self|nonce|tt` renders the page under a strict policy.
 * index.html carries `ngCspNonce="NFS_NONCE"`; Angular copies that value to every element it
 * gives a nonce, and this handler swaps it for a fresh random nonce per response.
 * - `self`:  style-src 'self' 'nonce-N' (same-origin stylesheet links allowed, inline needs the nonce)
 * - `nonce`: style-src 'nonce-N' only (every stylesheet, linked or inline, needs the nonce)
 * - `tt`:    `self` plus require-trusted-types-for 'script' with Angular's policy names
 */
const policies: Record<string, (nonce: string) => string> = {
  self: (n) =>
    `default-src 'self'; script-src 'nonce-${n}' 'strict-dynamic'; style-src 'self' 'nonce-${n}'; object-src 'none'; base-uri 'self'`,
  nonce: (n) =>
    `default-src 'self'; script-src 'nonce-${n}' 'strict-dynamic'; style-src 'nonce-${n}'; object-src 'none'; base-uri 'self'`,
  tt: (n) =>
    `default-src 'self'; script-src 'nonce-${n}' 'strict-dynamic'; style-src 'self' 'nonce-${n}'; object-src 'none'; base-uri 'self'; require-trusted-types-for 'script'; trusted-types angular angular#bundler`,
};

app.use((req, res, next) => {
  const policy = policies[new URL(req.url, 'http://x').searchParams.get('csp') ?? ''];

  if (!policy) {
    next();

    return;
  }

  const nonce = randomBytes(16).toString('base64');
  angularApp
    .handle(req)
    .then(async (response) => {
      if (!response) {
        next();

        return;
      }

      const html = (await response.text()).split('NFS_NONCE').join(nonce);
      res.setHeader('Content-Security-Policy', policy(nonce));
      res.status(response.status).type('html').send(html);
    })
    .catch(next);
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
