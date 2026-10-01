import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
// @ts-expect-error -- PROTOTYPE (ticket 190): compression ships no types. Gzip like a real host.
import compression from 'compression';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(compression());

// PROTOTYPE (ticket 190): the 300 ms profile. With the cookie `nfs-delay=<ms>`, delay every family
// style response: the lazy JS chunks holding `@layer nfs.` (carriers, or option S's directive and
// page chunks; never a file the page loads initially) and the link bundles (`nfs-*.css`).
// Server-side, so the browser's cache and preloads stay in play.
// Read on first use: the build also runs this file to extract routes, with no browser folder.
let delayedFiles: Set<string> | undefined;
const delayed = () => {
  if (!delayedFiles) {
    const initial = readdirSync(browserDistFolder)
      .filter((f) => f.endsWith('.csr.html'))
      .map((f) => readFileSync(join(browserDistFolder, f), 'utf8'))
      .join('');
    delayedFiles = new Set(
      readdirSync(browserDistFolder).filter(
        (f) =>
          /^nfs-.*\.css$/.test(f) ||
          (/^chunk-.*\.js$/.test(f) &&
            !initial.includes(f) &&
            readFileSync(join(browserDistFolder, f), 'utf8').includes('@layer nfs.')),
      ),
    );
  }

  return delayedFiles;
};
app.use((req, _res, next) => {
  const ms = Number(/(?:^|; )nfs-delay=(\d+)/.exec(req.headers.cookie ?? '')?.[1] ?? 0);

  if (ms > 0 && delayed().has(req.path.slice(1))) {
    setTimeout(next, ms);
  } else {
    next();
  }
});
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
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
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
