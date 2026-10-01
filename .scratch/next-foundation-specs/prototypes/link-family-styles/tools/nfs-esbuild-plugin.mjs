// PROTOTYPE of a library-shipped esbuild plugin (Nx `@nx/angular:application` `plugins` option).
// Resolves `nfs-family-css:<family>` to a module whose default export is the family's CSS,
// compiled from the library's own `<family>.scss` with the consumer's settings directories.
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const libScss = fileURLToPath(new URL('../apps/fixture/src/lib/scss/', import.meta.url));

// Nx calls a function export with the `options` object from project.json.
export default ({ includePaths: paths = [] } = {}) => ({
  name: 'nfs-family-css',
  setup(build) {
    const includePaths = paths.map((p) => resolve(p));

    build.onResolve({ filter: /^nfs-family-css:/ }, (args) => ({
      path: args.path.slice('nfs-family-css:'.length),
      namespace: 'nfs-family-css',
    }));
    build.onLoad({ filter: /.*/, namespace: 'nfs-family-css' }, (args) => {
      const file = resolve(libScss, `${args.path}.scss`);
      const result = sass.compile(file, {
        loadPaths: [...includePaths, resolve('node_modules')],
        style: 'compressed',
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'if-function'],
      });

      return {
        contents: `export default ${JSON.stringify(result.css)};`,
        loader: 'js',
        watchFiles: result.loadedUrls.filter((u) => u.protocol === 'file:').map((u) => fileURLToPath(u)),
      };
    });
  },
});
