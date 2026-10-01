import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

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
