// Builds the stand-in library with ngc in partial compilation mode into node_modules/ngx-foundation-sites
// (the experiment's own node_modules), so consumers read it through .d.ts metadata as they would a real package.
// Then writes the selector manifest the static checks read.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'node_modules', 'ngx-foundation-sites');
mkdirSync(out, { recursive: true });

execFileSync(process.execPath, [join(root, 'node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js'), '-p', join(root, 'lib/tsconfig.json')], {
  stdio: 'inherit',
});

const entryPoints = ['button', 'accordion', 'callout'];
const exportsMap = { './package.json': './package.json' };

for (const ep of entryPoints) {
  exportsMap[`./${ep}`] = { types: `./${ep}/index.d.ts`, default: `./${ep}/index.js` };
}

writeFileSync(
  join(out, 'package.json'),
  JSON.stringify({ name: 'ngx-foundation-sites', version: '0.0.0-proto.145', type: 'module', sideEffects: false, exports: exportsMap }, null, 2),
);

execFileSync(process.execPath, [join(root, 'tools/gen-manifest.mjs')], { stdio: 'inherit' });
