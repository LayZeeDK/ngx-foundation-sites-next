// PROTOTYPE (ticket 195): bytes of the family <style> elements in the server HTML of /families, per build.
// Theme = the consumer's carriers, structure = the library's sheets. Gzip is level 9 per sheet, summed.
import zlib from 'node:zlib';

const gz = (s) => zlib.gzipSync(Buffer.from(s), { level: 9 }).length;
const builds = { split: 4631, nofilter: 4634, noadopt: 4635, samelayer: 4636 };
const out = {};

for (const [name, port] of Object.entries(builds)) {
  const html = await (await fetch(`http://localhost:${port}/families`)).text();
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  const kinds = { theme: [], structure: [], critical: [] };

  for (const s of styles) {
    const head = s.replace(/^@charset "UTF-8";/, '').slice(0, 60);
    const kind = /^@layer nfs\.global,/.test(head)
      ? 'critical'
      : name !== 'samelayer' && /^@layer nfs\.[\w-]+\.structure\{/.test(head)
        ? 'structure'
        : 'theme';
    kinds[kind].push(s);
  }

  out[name] = Object.fromEntries(
    Object.entries(kinds).map(([k, list]) => [k, { sheets: list.length, bytes: list.reduce((n, s) => n + Buffer.byteLength(s), 0), gzip: list.reduce((n, s) => n + gz(s), 0) }]),
  );
}

console.log(JSON.stringify(out, null, 1));
