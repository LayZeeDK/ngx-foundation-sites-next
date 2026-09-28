// Scores a results JSON ({findings: [{component, attr, line}]}) against the cases' and the generated
// workspace's expected.json. Prints one row per case component and a total for the generated components.
// Usage: node tools/score.mjs <results.json> [...more results.json]
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => JSON.parse(readFileSync(p, 'utf8'));
const cases = load(join(root, 'ws/src/app/cases/expected.json'));
const generated = load(join(root, 'ws/src/app/generated/expected.json'));

const score = (expectedMap, byComponent) => {
  const rows = [];

  for (const [key, e] of Object.entries(expectedMap)) {
    const got = (byComponent.get(e.component) ?? []).map((f) => f.attr);
    const want = [...e.expected];
    let tp = 0;

    for (const a of got) {
      const i = want.indexOf(a);

      if (i >= 0) {
        want.splice(i, 1);
        tp++;
      }
    }

    rows.push({ key, component: e.component, expected: e.expected.length, reported: got.length, tp, fp: got.length - tp, fn: want.length });
  }

  return rows;
};

for (const file of process.argv.slice(2)) {
  const res = load(file);
  const byComponent = new Map();

  for (const f of res.findings) {
    byComponent.set(f.component, [...(byComponent.get(f.component) ?? []), f]);
  }

  console.log(`\n== ${res.tool} (${file})`);
  console.log('case | expected | reported | missed | extra');

  for (const r of score(cases, byComponent)) {
    console.log(`${r.key} | ${r.expected} | ${r.reported} | ${r.fn} | ${r.fp}`);
  }

  const g = score(generated, byComponent);
  const sum = (k) => g.reduce((n, r) => n + r[k], 0);
  console.log(
    `generated (${g.length} components) | ${sum('expected')} | ${sum('reported')} | ${sum('fn')} | ${sum('fp')} ; components with a miss: ${g.filter((r) => r.fn).length}, with an extra: ${g.filter((r) => r.fp).length}`,
  );

  if (res.ms) {
    console.log(`timing: ${JSON.stringify(Object.fromEntries(Object.entries(res.ms).map(([k, v]) => [k, Math.round(v)])))}`);
  }
}
