// Q3 side check: a package with both a style and a sass field and no exports. Which file does
// each resolver pick? Run from the cli-ws root.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = process.cwd();
const buildDir = path.dirname(
  require.resolve('@angular/build/package.json', { paths: [root] }),
);
const sass = require(require.resolve('sass-embedded', { paths: [buildDir] }));
const core = require(
  path.join(root, 'node_modules/ngx-foundation-sites/tooling/core.cjs'),
);
const angularText = fs.readFileSync('angular.json', 'utf8');
const pick = (css) =>
  (css.match(/--nfs-probe-from:\s*([a-z-]+)/) ?? [])[1] ?? '(none)';

(async () => {
  for (const file of ['src/q3/probe-pkg.scss', 'src/q3/probe-bare.scss']) {
    let nodePkg;
    try {
      nodePkg = pick(
        sass.compile(file, { importers: [new sass.NodePackageImporter(root)] })
          .css,
      );
    } catch (e) {
      nodePkg = 'error: ' + e.message.split('\n')[0];
    }
    const compiled = await core
      .compileSources(
        root,
        { stylesheets: [file], includePaths: [], optimized: true },
        'probe',
      )
      .catch((e) => [{ css: 'error ' + e.message.split('\n')[0] }]);
    const a = JSON.parse(angularText);
    a.projects['cli-ws'].architect.build.options.styles = [file];
    fs.writeFileSync('angular.json', JSON.stringify(a, null, 2));
    fs.rmSync('dist', { recursive: true, force: true });
    const run = spawnSync('npx ng build', { shell: true, encoding: 'utf8' });
    const built =
      run.status === 0
        ? pick(
            fs.readFileSync(
              path.join(
                'dist/cli-ws/browser',
                fs
                  .readdirSync('dist/cli-ws/browser')
                  .find((f) => f.startsWith('styles')),
              ),
              'utf8',
            ),
          )
        : 'build failed';
    fs.writeFileSync('angular.json', angularText);
    console.log(
      `${file}: Sass NodePackageImporter -> ${nodePkg}; core -> ${pick(compiled[0].css)}; application builder -> ${built}`,
    );
  }
  fs.rmSync('dist', { recursive: true, force: true });
})();
