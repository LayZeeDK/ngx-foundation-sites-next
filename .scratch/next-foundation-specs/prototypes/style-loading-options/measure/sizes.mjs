// PROTOTYPE (ticket 190): download cost per option, from the build output. Initial files are the
// scripts, modulepreloads, and stylesheets in the landing page's server HTML; gzip at level 6
// (the `compression` middleware's default). Also Foundation's full CSS, for scale.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { carrierChunks, OPTIONS } from './common.mjs';

const root = join(import.meta.dirname, '..');
const gz = (buf) => gzipSync(buf, { level: 6 }).length;
const out = {};

for (const [name, opt] of Object.entries(OPTIONS)) {
  const dir = join(root, 'dist', 'apps', opt.dist, 'browser');
  const html = await (await fetch(`http://localhost:${opt.port}/`)).text();
  const initial = [
    ...new Set(
      [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)]
        .map((m) => m[1])
        .filter((f) => !/^nfs-/.test(f)),
    ),
  ];
  const size = (f) => {
    const b = readFileSync(join(dir, f));

    return { file: f, raw: b.length, gzip: gz(b) };
  };
  const files = initial.map(size);
  const families = [...carrierChunks(opt.dist)].map(size);
  out[name] = {
    initialJs: files.filter((f) => f.file.endsWith('.js')).reduce((s, f) => ({ raw: s.raw + f.raw, gzip: s.gzip + f.gzip }), { raw: 0, gzip: 0 }),
    initialCss: files.filter((f) => f.file.endsWith('.css')).reduce((s, f) => ({ raw: s.raw + f.raw, gzip: s.gzip + f.gzip }), { raw: 0, gzip: 0 }),
    html: { raw: Buffer.byteLength(html), gzip: gz(Buffer.from(html)) },
    families: families.reduce((s, f) => ({ raw: s.raw + f.raw, gzip: s.gzip + f.gzip, n: s.n + 1 }), { raw: 0, gzip: 0, n: 0 }),
    familyFiles: families,
  };
}

const full = readFileSync(join(root, 'node_modules', 'foundation-sites', 'dist', 'css', 'foundation.min.css'));
out.foundationMinCss = { raw: full.length, gzip: gz(full) };
writeFileSync(join(root, 'out', 'sizes.json'), JSON.stringify(out, null, 1));

for (const [k, v] of Object.entries(out)) {
  console.log(k, JSON.stringify(v.familyFiles ? { initialJs: v.initialJs, initialCss: v.initialCss, html: v.html, families: v.families } : v));
}
