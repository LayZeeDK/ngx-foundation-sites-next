// PROTOTYPE (ticket 195): one table row per variant: non-geometry computed-property differences from the
// reference, per engine and viewport; then the hover/focus pass and the Tailwind probe.
import fs from 'node:fs';

const runs = {};
const versions = {};

for (const f of fs.readdirSync('out').filter((f) => /^compare-(chromium|firefox|webkit)-(large|small)\.json$/.test(f))) {
  const j = JSON.parse(fs.readFileSync(`out/${f}`, 'utf8'));

  for (const [engine, e] of Object.entries(j.engines)) {
    versions[engine] = e.version;

    for (const [key, r] of Object.entries(e.runs)) {
      const vp = key.split(' ').pop();
      const label = key.slice(0, -vp.length - 1);
      (runs[label] ??= {})[`${engine} ${vp}`] = r;
    }
  }
}

const cols = ['chromium large', 'chromium small', 'firefox large', 'firefox small', 'webkit large', 'webkit small'];
console.log('engines', JSON.stringify(versions));
console.log(`| Variant | ${cols.join(' | ')} | Families with differences (Chromium large) |`);

for (const [label, r] of Object.entries(runs)) {
  if (label.startsWith('reference')) {
    continue;
  }

  const fam = r['chromium large']?.byFamily ?? {};
  console.log(`| ${label} | ${cols.map((c) => r[c]?.error ?? r[c]?.diffs ?? '-').join(' | ')} | ${Object.entries(fam).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'} |`);
}

console.log('elements', runs.split['chromium large'].elements);

for (const c of cols.filter((c) => c.endsWith('large'))) {
  const s = runs.split[c].states;
  console.log(c, 'states', JSON.stringify({ interactive: s.interactive, checked: s.checked, diffs: s.diffs, samples: s.samples.slice(0, 3) }));
}

for (const c of cols) {
  console.log(c, 'tailwind probe split', JSON.stringify(runs.split[c].tailwindProbe), 'reference', JSON.stringify(runs[`reference`]?.[c]?.tailwindProbe ?? null));
}
