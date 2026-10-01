// PROTOTYPE of a library-shipped esbuild plugin (proposal A, ticket 192), loaded by
// `@angular-builders/custom-esbuild` from `angular.json` `plugins: [{ path, options }]`.
// Resolves `nfs-family-css:<family>` to a module whose default export is the family's CSS,
// compiled from this package's own `scss/<family>.scss` with the consumer's settings directories.
import * as sass from 'sass';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const libScss = fileURLToPath(new URL('../scss/', import.meta.url));

// custom-esbuild calls `factory(pluginConfig.options, builderOptions, target)` (load-plugins.js:52).
export default ({ includePaths: paths = [] } = {}) => ({
  name: 'nfs-family-css',
  setup(build) {
    const includePaths = paths.map((p) => resolve(p));
    let compiles = 0;

    build.onResolve({ filter: /^nfs-family-css:/ }, (args) => ({
      path: args.path.slice('nfs-family-css:'.length),
      namespace: 'nfs-family-css',
    }));
    build.onLoad({ filter: /.*/, namespace: 'nfs-family-css' }, (args) => {
      const result = sass.compile(resolve(libScss, `${args.path}.scss`), {
        loadPaths: [...includePaths, resolve('node_modules')],
        style: 'compressed',
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'if-function'],
      });
      compiles++;

      if (process.env.NFS_PLUGIN_LOG) {
        console.log(`[nfs-family-css] ${build.initialOptions.platform} ${args.path} (${compiles})`);
      }

      return {
        contents: `export default ${JSON.stringify(result.css)};`,
        loader: 'js',
        watchFiles: result.loadedUrls.filter((u) => u.protocol === 'file:').map((u) => fileURLToPath(u)),
      };
    });
  },
});
