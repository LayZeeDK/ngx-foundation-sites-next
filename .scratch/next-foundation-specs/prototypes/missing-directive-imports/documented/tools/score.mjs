// Scores the documented check and the compiler check side by side against the ground truth of the static
// prototype's cases (ws/src/app/cases/expected.json), this prototype's scope cases (ws/src/app/scope/expected.json),
// and the generated workspace (ws/src/app/generated/expected.json); the static prototype's score.mjs, with the
// skipped components marked and an element-by-element comparison of the two checks' findings.
// Usage: node tools/score.mjs <documented.json> <ngtsc.json>
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => JSON.parse(readFileSync(p, 'utf8'));
const [docFile, ngFile] = process.argv.slice(2);
const doc = load(docFile);
const ng = load(ngFile);
const manifest = load(join(root, 'node_modules/ngx-foundation-sites/nfs-selectors.json'));
// The compiler check leaves `attr` undefined when only an event binding carries the name; name it by the selector.
const firstAttr = (name) => /\[([-.\w]+)/.exec(manifest.directives.find((d) => d.name === name).selector)[1];
const attrOf = (f) => f.attr ?? firstAttr(f.directive);
const byComponent = (res) => {
  const m = new Map();

  for (const f of res.findings) {
    m.set(f.component, [...(m.get(f.component) ?? []), attrOf(f)]);
  }

  return m;
};
const docBy = byComponent(doc);
const ngBy = byComponent(ng);
const skipped = new Map(doc.skipped.map((s) => [s.component, s.reason]));

const score = (want, got) => {
  const rest = [...want];
  let tp = 0;

  for (const a of got) {
    const i = rest.indexOf(a);

    if (i >= 0) {
      rest.splice(i, 1);
      tp++;
    }
  }

  return { reported: got.length, missed: rest.length, extra: got.length - tp };
};
const cell = (s) => `${s.reported} (${s.missed} missed, ${s.extra} extra)`;

for (const [label, file] of [
  ['static cases', 'ws/src/app/cases/expected.json'],
  ['scope cases', 'ws/src/app/scope/expected.json'],
]) {
  console.log(`\n== ${label}\ncase | expected | compiler | documented`);

  for (const [key, e] of Object.entries(load(join(root, file)))) {
    const n = score(e.expected, ngBy.get(e.component) ?? []);
    const d = skipped.has(e.component) ? `skipped: ${skipped.get(e.component)}` : cell(score(e.expected, docBy.get(e.component) ?? []));
    console.log(`${key} | ${e.expected.length} | ${cell(n)} | ${d}`);
  }
}

const generated = Object.values(load(join(root, 'ws/src/app/generated/expected.json')));
const total = (rows, pick) => {
  const sum = { expected: 0, reported: 0, missed: 0, extra: 0, components: rows.length };

  for (const e of rows) {
    const s = score(e.expected, pick.get(e.component) ?? []);
    sum.expected += e.expected.length;
    sum.reported += s.reported;
    sum.missed += s.missed;
    sum.extra += s.extra;
  }

  return sum;
};
const checked = generated.filter((e) => !skipped.has(e.component));
console.log(`\n== generated workspace (${generated.length} components, ${generated.filter((e) => e.expected.length).length} faulty)`);
console.log(`compiler, all components: ${JSON.stringify(total(generated, ngBy))}`);
console.log(`documented, checked components: ${JSON.stringify(total(checked, docBy))}`);
console.log(`compiler, the same checked components: ${JSON.stringify(total(checked, ngBy))}`);
console.log(`documented skipped ${generated.length - checked.length} generated component(s), ${generated.filter((e) => skipped.has(e.component) && e.expected.length).length} of them faulty`);

// Element by element, on the components the documented check checked: the same file, line, column, and directive.
const key = (f) => `${f.file}:${f.line}:${f.col} ${f.directive}`;
const ngKeys = new Set(ng.findings.filter((f) => !skipped.has(f.component)).map(key));
const docKeys = new Set(doc.findings.map(key));
const onlyDoc = [...docKeys].filter((k) => !ngKeys.has(k));
const onlyNg = [...ngKeys].filter((k) => !docKeys.has(k));
console.log(`\n== element by element on checked components: ${docKeys.size} documented, ${ngKeys.size} compiler, ${onlyDoc.length} only documented, ${onlyNg.length} only compiler`);
onlyDoc.forEach((k) => console.log(`  only documented: ${k}`));
onlyNg.forEach((k) => console.log(`  only compiler: ${k}`));
const noAttr = ng.findings.filter((f) => !f.attr);
console.log(`compiler findings with no attribute name: ${noAttr.length}${noAttr.length ? ` (${noAttr.map(key).join(', ')})` : ''}`);
console.log(`\ncomponents: documented checked ${doc.components}, skipped ${doc.skipped.length}; compiler checked ${ng.components}`);
