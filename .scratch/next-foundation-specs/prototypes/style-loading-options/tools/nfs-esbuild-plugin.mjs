// PROTOTYPE (ticket 190 option S, from ticket 192 proposal A and 189's plugin): a library-shipped
// esbuild plugin for Nx's `@nx/angular:application` `plugins` option. Resolves
// `nfs-family-css:<family>` to a module whose default export is the family's CSS, compiled from
// the family's `.scss` with the consumer's settings directories.
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const familyScss = fileURLToPath(new URL('../apps/fixture/src/nfs-families/', import.meta.url));

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
      const result = sass.compile(resolve(familyScss, `${args.path}.scss`), {
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
