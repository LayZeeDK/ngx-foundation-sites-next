// PROTOTYPE of a library-shipped esbuild plugin (Nx `@nx/angular:application` `plugins` option).
// Resolves `nfs-family-css:<family>` to the family's CSS, compiled from the library's own
// `<family>.scss` with the consumer's settings directories.
// - mode 'string' (192's proposal A): the module's default export is the CSS text.
// - mode 'file' (197, proposal E): esbuild's `file` loader writes the CSS as a hashed asset and the
//   module's default export is that asset's URL. The resolved path ends in `.css` so the asset
//   gets a `.css` extension (and a text/css MIME type from the static server).
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const libScss = fileURLToPath(new URL('../apps/fixture/src/lib/scss/', import.meta.url));

// Nx calls a function export with the `options` object from project.json.
export default ({ includePaths: paths = [], mode = 'string' } = {}) => ({
  name: 'nfs-family-css',
  setup(build) {
    const includePaths = paths.map((p) => resolve(p));

    build.onResolve({ filter: /^nfs-family-css:/ }, (args) => ({
      path: `nfs-${args.path.slice('nfs-family-css:'.length)}.css`,
      namespace: 'nfs-family-css',
    }));
    build.onLoad({ filter: /.*/, namespace: 'nfs-family-css' }, (args) => {
      const family = args.path.slice('nfs-'.length, -'.css'.length);
      const file = resolve(libScss, `${family}.scss`);
      const result = sass.compile(file, {
        loadPaths: [...includePaths, resolve('node_modules')],
        style: 'compressed',
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'if-function'],
      });
      const watchFiles = result.loadedUrls.filter((u) => u.protocol === 'file:').map((u) => fileURLToPath(u));

      return mode === 'file'
        ? { contents: result.css, loader: 'file', watchFiles }
        : { contents: `export default ${JSON.stringify(result.css)};`, loader: 'js', watchFiles };
    });
  },
});
