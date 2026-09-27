// Summarises a Playwright JSON report of the stale-recipe and re-judge specs, one line per test.
import { readFileSync } from 'node:fs';

const report = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const lines = [];

function walk(suite) {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests ?? []) {
      for (const r of t.results ?? []) {
        const notes = Object.fromEntries((r.annotations ?? []).map((a) => [a.type, JSON.parse(a.description)]));
        const click = Object.entries(notes).find(([k]) => k.startsWith('click-'));
        const after = notes['after-nav'] ?? {};
        const summary = { reused: notes.componentReused, hrefsAfterNav: after };

        if (click) {
          const [k, v] = click;
          summary[k] = {
            leftDocument: v.leftDocument,
            url: v.url,
            historyLength: v.historyLength,
            scrollY: v.scrollY,
            target: v.targetS3 ?? v.targetS2,
            active: v.active,
            homeMarker: v.homeMarker,
            outcomes: (v.clicks ?? []).map((c) => `${c.rule}/${c.host}: ${c.outcome}`),
          };
        }

        summary.errors = notes.errors;
        lines.push(`${r.status.toUpperCase()} [${t.projectName}] ${spec.title} :: ${JSON.stringify(summary)}`);
      }
    }
  }

  for (const child of suite.suites ?? []) {
    walk(child);
  }
}

for (const s of report.suites) {
  walk(s);
}

console.log(lines.join('\n').replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '?'));
