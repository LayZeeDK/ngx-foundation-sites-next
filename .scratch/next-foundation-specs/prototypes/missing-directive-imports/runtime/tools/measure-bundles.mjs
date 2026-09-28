// Builds the demo once per approach in development and production configurations and reports
// the browser JavaScript each adds over the library without any import check (m-none), and
// whether any of the check's code reaches a production bundle.
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const variants = ['m-none', 'm-registry', 'm-debug', 'm-class', 'm-hybrid'];
const modes = ['development', 'production'];
// Strings only the check contains: its report text, its stats global, a manifest-only attribute
// (no stand-in directive has it), and the name of its scan service.
const needles = ['to the imports of the component whose template', '__nfsImportCheck', 'nfsTopBarTitle', 'nfsImportCheckToken', 'takeRecords'];
const rows = [];

for (const mode of modes) {
  for (const variant of variants) {
    const out = join('dist-measure', `${mode}-${variant}`);
    execSync(`npx ng build --configuration ${mode},${variant} --output-path ${out}`, { stdio: 'ignore' });
    const dir = join(out, 'browser');
    const files = readdirSync(dir).filter((f) => f.endsWith('.js'));
    const contents = files.map((f) => readFileSync(join(dir, f)));
    const raw = contents.reduce((sum, c) => sum + c.length, 0);
    const gzip = contents.reduce((sum, c) => sum + gzipSync(c, { level: 9 }).length, 0);
    const text = contents.map((c) => c.toString('utf8')).join('\n');
    const found = needles.filter((n) => text.includes(n));
    rows.push({ mode, variant, files: files.length, raw, gzip, found });
    console.log(`${mode.padEnd(12)} ${variant.padEnd(11)} raw=${raw} gzip=${gzip} needles=[${found.join(', ')}]`);
  }
}

for (const mode of modes) {
  const base = rows.find((r) => r.mode === mode && r.variant === 'm-none');

  for (const r of rows.filter((x) => x.mode === mode && x.variant !== 'm-none')) {
    console.log(`${mode.padEnd(12)} ${r.variant.padEnd(11)} +raw=${r.raw - base.raw} +gzip=${r.gzip - base.gzip}`);
  }
}

writeFileSync('results/bundles.json', JSON.stringify(rows, null, 2));
