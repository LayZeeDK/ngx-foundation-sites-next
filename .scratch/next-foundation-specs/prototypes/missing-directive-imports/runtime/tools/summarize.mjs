// Prints results/matrix.jsonl as one line per case, phase, and approach.
import { readFileSync } from 'node:fs';

const rows = readFileSync('results/matrix.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));

for (const r of rows) {
  if (r.summary !== undefined) {
    console.log(`${r.case.padEnd(10)} | ${r.phase.padEnd(18)} | ${r.approach.padEnd(10)} | scans=${r.scans} warn=${r.warnings} | ${r.summary}`);
  } else {
    console.log(JSON.stringify(r));
  }
}
