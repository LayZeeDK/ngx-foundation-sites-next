// Prints a results file as a few lines per run. Usage: node summarize.mjs [build] [results.json]
import { readFileSync } from 'node:fs';

const file = process.argv[3] ?? 'results.json';
const only = process.argv[2];

for (const r of JSON.parse(readFileSync(file, 'utf8'))) {
  if (only && r.build !== only) {
    continue;
  }

  const msgs = r.messages
    .map((m) => `  [${m.phase}/${m.type}] ${m.text}`);
  const server = r.serverLog.length ? `\n  server: ${r.serverLog.join(' | ').slice(0, 300)}` : '';
  const probe = `items ${r.probe.knownItems}/${r.probe.items} known to Angular` + (r.after ? `, after click ${r.after.knownItems}/${r.after.items}` : '');
  console.log(`${r.build} ${r.mode} ${r.id}: HTTP ${r.status}, ${probe}${server}\n${msgs.join('\n') || '  (no messages)'}`);
}
