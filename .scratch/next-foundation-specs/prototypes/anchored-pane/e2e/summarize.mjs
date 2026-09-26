// PROTOTYPE -- prints results/<project>.jsonl as one compact line per case.
// Usage: node e2e/summarize.mjs chromium
import { readFileSync } from 'node:fs';

const project = process.argv[2] ?? 'chromium';
const rows = readFileSync(`results/${project}.jsonl`, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const fmt = (r) => {
  if (!r) {
    return '-';
  }

  let s = `${r.placement} (${r.dx},${r.dy}) e=${r.formulaErr}`;

  if ('matchesFoundation' in r) {
    s += r.matchesFoundation ? ' =F' : ' !=F';
  }

  if (r.afterScroll) {
    s += ` scroll:${r.afterScroll.followsAnchor ? "follows" : "detached"}(${r.afterScroll.dy})`;
  }

  if (r.bottomPainted === false) {
    s += " BOTTOM-CLIPPED";
  }

  if (r.afterReopen) {
    s += ` reopen:${r.afterReopen.placement} (${r.afterReopen.dx},${r.afterReopen.dy}) e=${r.afterReopen.formulaErr}`;
  }

  if (r.afterResize) {
    s += ` resize:${r.afterResize.placement} (${r.afterResize.dx},${r.afterResize.dy}) e=${r.afterResize.formulaErr}`;
  }

  return s;
};

for (const r of rows.sort((a, b) => a.case.localeCompare(b.case))) {
  if (!r.foundation) {
    console.log(`${r.case}: ${JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k]) => !['dropdown', 'tooltip', 'case'].includes(k))))}`);
    continue;
  }

  console.log(`${r.case}${r.expectPlacement ? ` [expect ${r.expectPlacement}]` : ''}`);
  console.log(`   F: ${fmt(r.foundation)}\n   P: ${fmt(r.port)}\n   C: ${fmt(r.cdk)}${r.errors.length ? `\n   errors: ${r.errors.join(' | ')}` : ''}`);
}
