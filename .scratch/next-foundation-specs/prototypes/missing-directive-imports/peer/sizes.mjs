// Bytes each library source file contributes to the browser bundle, from the
// esbuild metafile that `ng build --stats-json` writes. Usage: node sizes.mjs
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

for (const build of ['aria-dev', 'aria-prod', 'ngp-dev', 'ngp-prod']) {
  const meta = JSON.parse(readFileSync(`dist/${build}/browser-stats.json`, 'utf8'));
  const rows = {};

  for (const [file, output] of Object.entries(meta.outputs)) {
    if (!file.endsWith('.js')) {
      continue;
    }

    for (const [input, { bytesInOutput }] of Object.entries(output.inputs)) {
      if (input.includes('src/lib/')) {
        rows[input.replace(/.*src\/lib\//, '')] = bytesInOutput;
      }
    }
  }

  const main = readFileSync(`dist/${build}/browser/main.js`);
  console.log(build, JSON.stringify(rows), `main.js ${main.length} B, gzip ${gzipSync(main).length} B`);
}
