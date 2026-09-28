// Runs ESLint over the workspace through its Node API and writes the rule's reports in the scorer's format.
// Usage: node eslint-plugin/run.mjs <workspace dir> [--json <out>]
import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { ESLint } from 'eslint';

const args = process.argv.slice(2);
const cwd = resolve(args[0]);
const out = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const t0 = performance.now();
const eslint = new ESLint({ cwd, cache: false });
const results = await eslint.lintFiles(['src/**/*.ts', 'src/**/*.html']);
const ms = performance.now() - t0;
const findings = [];
const other = [];

for (const r of results) {
  for (const m of r.messages) {
    const hit = /^`([^`]+)` matches (\w+) \(([^)]+)\), which (\w+) does not import/.exec(m.message);

    if (m.ruleId === 'nfs/missing-directive-import' && hit) {
      findings.push({ file: relative(cwd, r.filePath).replaceAll('\\', '/'), line: m.line, col: m.column, attr: hit[1], directive: hit[2], entryPoint: hit[3], component: hit[4] });
    } else {
      other.push(`${relative(cwd, r.filePath)}:${m.line}: ${m.ruleId ?? 'parse'}: ${m.message}`);
    }
  }
}

for (const f of findings) {
  console.log(`${f.file}:${f.line}:${f.col} - ${f.attr} matches ${f.directive}, missing from ${f.component}'s imports`);
}

other.forEach((o) => console.log(o));
console.log(`${findings.length} finding(s), ${other.length} other message(s), ${results.length} file(s), ${ms.toFixed(0)} ms`);

if (out) {
  writeFileSync(out, JSON.stringify({ tool: 'eslint', files: results.length, findings, other, ms: { total: ms } }, null, 2));
}
