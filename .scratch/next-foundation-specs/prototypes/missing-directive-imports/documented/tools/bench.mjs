// Wall-clock timings of a fresh process per run, median in ms, on the workspace as it stands in ws/.
// Usage: node tools/bench.mjs [runs] [static experiment root]
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const runs = Number(process.argv[2] ?? 3);
const staticRoot = process.argv[3] ?? 'D:/tmp/nfs-145-static';
const tsconfig = join(root, 'ws/tsconfig.json');
const commands = {
  'tsc type check (TypeScript alone, for scale)': [join(root, 'node_modules/typescript/bin/tsc'), '-p', tsconfig],
  'ngc type check (the build baseline)': [join(staticRoot, 'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js'), '-p', tsconfig],
  'compiler check (static prototype (b))': [join(staticRoot, 'ngtsc-check/check.mjs'), tsconfig],
  'documented check': [join(root, 'check/check.mjs'), tsconfig],
};

for (const [label, argv] of Object.entries(commands)) {
  const times = [];

  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    spawnSync(process.execPath, argv, { stdio: 'ignore' });
    times.push(performance.now() - t0);
  }

  times.sort((a, b) => a - b);
  console.log(`${label}: median ${times[Math.floor(times.length / 2)].toFixed(0)} ms (${times.map((t) => t.toFixed(0)).join(', ')})`);
}
