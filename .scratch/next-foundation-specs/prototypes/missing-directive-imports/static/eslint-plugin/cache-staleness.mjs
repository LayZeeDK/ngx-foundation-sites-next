// ESLint's cache keys a result on the linted file and the config, not on the component file a template rule
// reads. This lints an external template with the cache on, removes NfsButton from its component's imports,
// and lints again. Usage: node eslint-plugin/cache-staleness.mjs <workspace dir>
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ESLint } from 'eslint';

const dir = resolve(process.argv[2]);
const ts = join(dir, 'src/app/cases/correct-classes-external.ts');
const html = 'src/app/cases/correct-classes-external.html';
const cacheLocation = join(dir, '.eslintcache-proto');
const original = readFileSync(ts, 'utf8');
const lint = async (cache) => (await new ESLint({ cwd: dir, cache, cacheLocation }).lintFiles([html]))[0].messages.length;

try {
  rmSync(cacheLocation, { force: true });
  console.log(`before the edit, cached run: ${await lint(true)} report(s)`);
  writeFileSync(ts, original.replace(', NfsButton]', ']'));
  console.log(`after removing NfsButton, cached run: ${await lint(true)} report(s)`);
  console.log(`after removing NfsButton, uncached run: ${await lint(false)} report(s)`);
} finally {
  writeFileSync(ts, original);
  rmSync(cacheLocation, { force: true });
}
