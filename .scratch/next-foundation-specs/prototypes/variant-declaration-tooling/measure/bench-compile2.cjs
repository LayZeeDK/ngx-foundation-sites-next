// Why is compileAsync slow here? Run from the nx-ws root.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = process.cwd();
const buildDir = path.dirname(
  require.resolve('@angular/build/package.json', { paths: [root] }),
);
const sass = require(
  require.resolve(process.env.SASS_PKG || 'sass', { paths: [buildDir] }),
);
const file = path.resolve(root, process.argv[2]);
const loadPaths = [path.resolve(root, 'node_modules/foundation-sites/scss')];
const pkgImporter = {
  findFileUrl(url) {
    return url === 'ngx-foundation-sites'
      ? pathToFileURL(
          path.join(root, 'node_modules/ngx-foundation-sites/_index.scss'),
        )
      : null;
  },
};

async function time(label, fn) {
  const t = performance.now();
  await fn();
  console.log(`${label}: ${Math.round(performance.now() - t)} ms`);
}

(async () => {
  const opts = {
    loadPaths,
    logger: sass.Logger.silent,
    quietDeps: true,
    importers: [pkgImporter],
  };
  await time('compile (sync)', () => sass.compile(file, opts));
  await time('compileAsync', () => sass.compileAsync(file, opts));
  const compiler = await sass.initAsyncCompiler();
  await time('initAsyncCompiler().compileAsync', () =>
    compiler.compileAsync(file, opts),
  );
  await time('initAsyncCompiler().compileStringAsync', () =>
    compiler.compileStringAsync(fs.readFileSync(file, 'utf8'), {
      ...opts,
      url: pathToFileURL(file),
    }),
  );
  await time('compileAsync, silenceDeprecations only (default logger)', () =>
    sass.compileAsync(file, {
      loadPaths,
      quietDeps: true,
      importers: [pkgImporter],
      silenceDeprecations: [
        'import',
        'global-builtin',
        'mixed-decls',
        'color-functions',
      ],
    }),
  );
  await compiler.dispose();
})();
