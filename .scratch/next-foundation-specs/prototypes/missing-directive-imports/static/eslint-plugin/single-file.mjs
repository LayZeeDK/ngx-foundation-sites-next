// Editor-like cost: one ESLint instance lints single files in turn (the first call pays config and parser
// loading; later calls are what an editor integration pays per save).
// Usage: node eslint-plugin/single-file.mjs <workspace dir> <file> [...files]
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { ESLint } from 'eslint';

const [dir, ...files] = process.argv.slice(2);
const eslint = new ESLint({ cwd: resolve(dir) });

for (const f of files) {
  const t0 = performance.now();
  const [r] = await eslint.lintFiles([f]);
  console.log(`${f}: ${(performance.now() - t0).toFixed(0)} ms, ${r.messages.length} message(s)`);
}
