// Q3: where exactly cases 3 and 4 fail, in the core's compile.
const path = require('node:path');
const core = require(
  path.join(
    process.cwd(),
    'node_modules/ngx-foundation-sites/tooling/core.cjs',
  ),
);
(async () => {
  for (const [file, inc] of [
    ['src/q3/styles-tilde.scss', ['node_modules/foundation-sites/scss']],
    ['src/q3/styles-noinclude.scss', []],
  ]) {
    try {
      await core.compileSources(
        process.cwd(),
        { stylesheets: [file], includePaths: inc, optimized: true },
        'cli-ws',
      );
    } catch (e) {
      console.log(
        file,
        '->',
        e.message
          .split('\n')
          .filter((l) => /import|root stylesheet|\.scss/.test(l))
          .map((l) => l.trim())
          .join(' / '),
      );
    }
  }
})();
