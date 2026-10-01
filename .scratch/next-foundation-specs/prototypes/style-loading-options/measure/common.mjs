// PROTOTYPE (ticket 190): shared helpers for the loading-option measurements.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

export const engines = { chromium, firefox, webkit };

/** Option -> server port and dist folder (serve.sh). `OPTS=A,B` runs a subset. */
const ALL_OPTIONS = {
  A: { port: 4711, dist: 'fixture', label: 'A lazy chunk on first use' },
  B: { port: 4712, dist: 'fixture-eager', label: 'B bundled in main.js' },
  C: { port: 4713, dist: 'fixture-mixed', label: 'C lazy, dropdown pane opted in to eager' },
  D: { port: 4714, dist: 'fixture-idle', label: 'D lazy, prefetched at idle after hydration' },
  E: { port: 4715, dist: 'fixture-own', label: "E lazy, 188's owned <style>" },
  L: { port: 4716, dist: 'fixture-link', label: "L 189's <link> loader" },
  LP: { port: 4717, dist: 'fixture-link-preload', label: 'LP <link> loader plus index.html preloads' },
  S: { port: 4718, dist: 'fixture-static', label: "S 192's proposal A, CSS in the directive's chunk" },
};
export const OPTIONS = process.env.OPTS
  ? Object.fromEntries(process.env.OPTS.split(',').map((k) => [k, ALL_OPTIONS[k]]))
  : ALL_OPTIONS;

/** Family style files of a build: lazy JS chunks with `@layer nfs.` (not loaded initially) and `nfs-*.css`. */
export function carrierChunks(dist) {
  const dir = join(import.meta.dirname, '..', 'dist', 'apps', dist, 'browser');

  const initial = readdirSync(dir)
    .filter((f) => f.endsWith('.csr.html'))
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('');

  return new Set(
    readdirSync(dir).filter(
      (f) =>
        /^nfs-.*\.css$/.test(f) ||
        (/^chunk-.*\.js$/.test(f) &&
          !initial.includes(f) &&
          readFileSync(join(dir, f), 'utf8').includes('@layer nfs.')),
    ),
  );
}

export const isCarrier = (chunks) => (url) => chunks.has(new URL(url).pathname.slice(1));

/** Lighthouse's mobile Slow 4G values as DevTools applies them, plus 4x CPU slowdown. Chromium only. */
export async function applySlow4g(context, page) {
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 562.5,
    downloadThroughput: (1474.56 * 1024) / 8,
    uploadThroughput: (675 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function median(xs) {
  const v = xs.filter((x) => typeof x === 'number' && Number.isFinite(x)).sort((a, b) => a - b);

  if (v.length === 0) {
    return null;
  }

  const m = Math.floor(v.length / 2);

  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

export function spread(xs) {
  const v = xs.filter((x) => typeof x === 'number' && Number.isFinite(x));

  return v.length ? [Math.min(...v), Math.max(...v)] : null;
}
