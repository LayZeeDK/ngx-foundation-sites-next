// Wall-clock timings, each command run `runs` times as a fresh process (cold, no ESLint cache), median in ms.
// Usage: node tools/bench.mjs [runs]
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const runs = Number(process.argv[2] ?? 3);
const node = process.execPath;
const ws = join(root, 'ws');
const commands = {
  'ngc type check (the build baseline)': [join(root, 'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js'), '-p', join(ws, 'tsconfig.json')],
  'ngtsc check (b)': [join(root, 'ngtsc-check/check.mjs'), join(ws, 'tsconfig.json')],
  'eslint, rule off (parsers and processor only)': [join(root, 'eslint-plugin/run.mjs'), ws, { NFS_RULE: 'off' }],
  'eslint, rule on (a)': [join(root, 'eslint-plugin/run.mjs'), ws],
};

for (const [label, argv] of Object.entries(commands)) {
  const env = typeof argv.at(-1) === 'object' ? { ...process.env, ...argv.pop() } : process.env;
  const times = [];

  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    spawnSync(node, argv, { env, stdio: 'ignore' });
    times.push(performance.now() - t0);
  }

  times.sort((a, b) => a - b);
  console.log(`${label}: median ${times[Math.floor(times.length / 2)].toFixed(0)} ms (${times.map((t) => t.toFixed(0)).join(', ')})`);
}

