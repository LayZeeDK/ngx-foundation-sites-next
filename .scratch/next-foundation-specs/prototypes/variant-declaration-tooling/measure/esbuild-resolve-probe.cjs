// Can a Node tool call esbuild's resolver (build.resolve) outside a build, with the
// application builder's stylesheet options? Run from a workspace root.
const path = require('node:path');
const esbuild = require(
  require.resolve('esbuild', {
    paths: [
      path.dirname(
        require.resolve('@angular/build/package.json', {
          paths: [process.cwd()],
        }),
      ),
    ],
  }),
);

(async () => {
  let resolver;
  const ctx = await esbuild.context({
    absWorkingDir: process.cwd(),
    write: false,
    platform: 'browser',
    conditions: ['style', 'sass', 'less', 'development'],
    mainFields: ['style', 'sass'],
    resolveExtensions: [],
    logLevel: 'silent',
    plugins: [
      {
        name: 'expose',
        setup(build) {
          resolver = build.resolve;
        },
      },
    ],
  });
  for (const spec of process.argv.slice(2)) {
    const r = await resolver(spec, {
      kind: 'import-rule',
      resolveDir: process.cwd(),
    });
    console.log(
      spec,
      '->',
      r.path || '(none)',
      r.errors.length ? r.errors[0].text : '',
    );
  }
  await ctx.dispose();
})();
