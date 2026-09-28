// Runs both checks on the four workspaces (240 and 1000 generated components, each in the static prototype's
// mixed import styles and in classes only) and writes each score to results/.
// Usage: node tools/run-all.mjs [path to the static prototype's ngtsc-check/check.mjs]
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ngtsc = process.argv[2] ?? 'D:/tmp/nfs-145-static/ngtsc-check/check.mjs';
const out = join(root, 'results');
const tsconfig = join(root, 'ws/tsconfig.json');
const node = (args) => execFileSync(process.execPath, args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const run = (args) => {
  try {
    return node(args);
  } catch (e) {
    return e.stdout; // both checks exit 1 when they report a finding
  }
};
mkdirSync(out, { recursive: true });

for (const count of [240, 1000]) {
  for (const style of ['mixed', 'classes']) {
    node([join(root, 'tools/gen-workspace.mjs'), String(count)]);

    if (style === 'classes') {
      node([join(root, 'tools/classes-only.mjs')]);
    }

    const tag = `${style}-${count}`;
    const doc = join(out, `documented-${tag}.json`);
    const ng = join(out, `ngtsc-${tag}.json`);
    const tail = (s) => s.trim().split('\n').slice(-2).join(' / ');
    console.log(`${tag}: documented ${tail(run([join(root, 'check/check.mjs'), tsconfig, '--timing', '--json', doc]))}`);
    console.log(`${tag}: compiler ${tail(run([ngtsc, tsconfig, '--timing', '--json', ng]))}`);
    writeFileSync(join(out, `score-${tag}.txt`), node([join(root, 'tools/score.mjs'), doc, ng]));
  }
}
