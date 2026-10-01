// PROTOTYPE 198: adds the dev-server targets (point 1) to the three copies' project.json files.
import { readFileSync, writeFileSync } from 'node:fs';

const dev = { optimization: false, extractLicenses: false, sourceMap: true, outputHashing: 'none' };

function patch(workspace, fn) {
  const file = `D:/tmp/${workspace}/apps/fixture/project.json`;
  const project = JSON.parse(readFileSync(file, 'utf8'));
  fn(project.targets);
  writeFileSync(file, JSON.stringify(project, null, 2) + '\n');
  console.log('patched', file);
}

// 184 carriers + 188 own-style: the build target already has `development`.
patch('nfs-proto-198-188', (t) => {
  t.build.configurations.development = { ...t.build.configurations.development, ...dev };
  t.serve = {
    executor: '@angular/build:dev-server',
    options: { buildTarget: 'fixture:build:development', port: 4821 },
  };
});

// 189 <link> loader, plus the no-loader baseline (every family in the injected global stylesheet).
patch('nfs-proto-198-189', (t) => {
  const styles = t.build.options.styles;
  t.build.configurations.development = { ...dev };
  t.build.configurations['development-baseline'] = {
    ...dev,
    outputPath: 'dist/apps/fixture-baseline',
    styles: [styles[0], 'apps/fixture/src/lib/scss/all.scss', styles[1]],
    fileReplacements: [
      { replace: 'apps/fixture/src/lib/switches.ts', with: 'apps/fixture/src/lib/switches.none.ts' },
    ],
  };
  t.serve = {
    executor: '@angular/build:dev-server',
    options: { buildTarget: 'fixture:build:development', port: 4822 },
  };
  t['serve-baseline'] = {
    executor: '@angular/build:dev-server',
    options: { buildTarget: 'fixture:build:development-baseline', port: 4824 },
  };
});

// 192 proposal A: Nx's executors, so the esbuild plugin reaches the dev server too.
patch('nfs-proto-198-192', (t) => {
  t['build-plugin'].configurations = { development: { ...dev } };
  t.serve = {
    executor: '@nx/angular:dev-server',
    options: { buildTarget: 'fixture:build-plugin:development', port: 4823 },
  };
});
