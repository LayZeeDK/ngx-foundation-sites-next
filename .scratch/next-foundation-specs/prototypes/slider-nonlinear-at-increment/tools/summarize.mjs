// Prints every test's status, annotations, and first error line from a Playwright JSON report.
import { readFileSync } from 'node:fs';

const report = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const filter = process.argv[3] ? new RegExp(process.argv[3]) : null;
const out = [];

function walk(suite, path) {
  for (const s of suite.suites ?? []) {
    walk(s, [...path, s.title]);
  }

  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      const title = `${[...path, spec.title].filter(Boolean).join(' > ')} [${t.projectName}]`;

      if (filter && !filter.test(title)) {
        continue;
      }

      const r = t.results[t.results.length - 1];
      out.push(`== ${r.status.toUpperCase()} ${title}`);

      for (const a of (r.annotations?.length ? r.annotations : t.annotations)) {
        out.push(`-- ${a.type}\n${a.description}`);
      }

      for (const e of r.errors ?? []) {
        out.push(`!! ${(e.message ?? '').replace(/\u001b\[[0-9;]*m/g, '').split('\n').slice(0, 8).join('\n   ')}`);
      }
    }
  }
}

for (const s of report.suites) {
  walk(s, []);
}

console.log(out.join('\n'));
