// Compares the verdicts of the two scan modes (results/matrix.jsonl: MutationObserver-driven,
// results/matrix-every.jsonl: whole document after every render) row by row.
import { readFileSync } from 'node:fs';

const load = (file) =>
  new Map(
    readFileSync(file, 'utf8')
      .trim()
      .split('\n')
      .map((l) => JSON.parse(l))
      .filter((r) => r.summary !== undefined)
      .map((r) => [`${r.case}|${r.phase}|${r.approach}`, r.summary.replace(/owner=_/g, 'owner=')]),
  );

const [, , fileA = 'results/matrix.jsonl', fileB = 'results/matrix-every.jsonl'] = process.argv;
const mutations = load(fileA);
const every = load(fileB);
let same = 0;

for (const [key, summary] of every) {
  if (mutations.get(key) === summary) {
    same++;
  } else {
    console.log(`DIFF ${key}\n  every:     ${summary}\n  mutations: ${mutations.get(key)}`);
  }
}

console.log(`${same} of ${every.size} rows identical`);
