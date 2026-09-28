// Compares two checks' findings element by element (file, line, column, directive) on the components the
// documented check checked, with a count per directive. Usage: node tools/diff-findings.mjs <documented.json> <ngtsc.json>
import { readFileSync } from 'node:fs';

const [doc, ng] = process.argv.slice(2).map((p) => JSON.parse(readFileSync(p, 'utf8')));
const skipped = new Set(doc.skipped.map((s) => s.component));
const key = (f) => `${f.file}:${f.line}:${f.col} ${f.directive}`;
const docKeys = new Set(doc.findings.map(key));
const ngKeys = new Set(ng.findings.filter((f) => !skipped.has(f.component)).map(key));
const count = (keys) => {
  const m = {};

  for (const k of keys) {
    const d = k.split(' ')[1];
    m[d] = (m[d] ?? 0) + 1;
  }

  return m;
};
const docCount = count(docKeys);
const ngCount = count(ngKeys);
console.log('directive | documented | compiler');

for (const d of [...new Set([...Object.keys(docCount), ...Object.keys(ngCount)])].sort()) {
  console.log(`${d} | ${docCount[d] ?? 0} | ${ngCount[d] ?? 0}`);
}

const onlyDoc = [...docKeys].filter((k) => !ngKeys.has(k));
const onlyNg = [...ngKeys].filter((k) => !docKeys.has(k));
console.log(`total | ${docKeys.size} | ${ngKeys.size}; only documented ${onlyDoc.length}, only compiler ${onlyNg.length}`);
onlyDoc.forEach((k) => console.log(`  only documented: ${k}`));
onlyNg.forEach((k) => console.log(`  only compiler: ${k}`));
