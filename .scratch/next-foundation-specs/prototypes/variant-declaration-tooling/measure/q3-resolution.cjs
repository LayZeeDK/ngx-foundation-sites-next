// Q3: does the core's compile read the same Variant properties as the application builder's
// built CSS? Run from the cli-ws root. Rewrites angular.json per case and restores it.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = process.cwd();
const core = require(
  path.join(root, 'node_modules/ngx-foundation-sites/tooling/core.cjs'),
);
const angularText = fs.readFileSync('angular.json', 'utf8');
const inc = { includePaths: ['node_modules/foundation-sites/scss'] };

const cases = [
  {
    name: '1 @import ngx-foundation-sites (sass export condition) + includePaths',
    styles: ['src/styles.scss'],
    spo: inc,
  },
  { name: '2 pkg: URLs', styles: ['src/q3/styles-pkg.scss'], spo: inc },
  { name: '3 ~ prefix', styles: ['src/q3/styles-tilde.scss'], spo: inc },
  {
    name: '4 no includePaths, package specifiers only',
    styles: ['src/q3/styles-noinclude.scss'],
    spo: undefined,
  },
  {
    name: '5 two global stylesheets, different registries',
    styles: ['src/q3/styles-no-grid.scss', 'src/q3/extra-grid.scss'],
    spo: inc,
  },
  {
    name: '6 two global stylesheets that disagree',
    styles: ['src/styles.scss', 'src/q3/extra-teal.scss'],
    spo: inc,
  },
  {
    name: '7 inject: false theme',
    styles: [
      'src/styles.scss',
      {
        input: 'src/q3/theme-teal.scss',
        bundleName: 'theme-teal',
        inject: false,
      },
    ],
    spo: inc,
  },
  {
    name: '8 production configuration overrides styles',
    styles: ['src/styles.scss'],
    spo: inc,
    prodStyles: ['src/q3/styles-alt.scss'],
    configs: ['production', 'development'],
  },
];

const norm = (v) =>
  v
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .join(' ');

function builtProperties() {
  const dir = 'dist/cli-ws/browser';
  const out = {};

  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.css'))) {
    const css = fs.readFileSync(path.join(dir, f), 'utf8');
    const props = {};

    for (const m of css.matchAll(/(--nfs-[a-z0-9-]+)\s*:([^;}]*)/g)) {
      props[m[1]] = props[m[1]] ? `${props[m[1]]} | ${norm(m[2])}` : norm(m[2]);
    }

    out[f.replace(/-[A-Z0-9]{8}\.css$/, '.css')] = props;
  }

  return out;
}

async function coreProperties(target, configuration) {
  const merged = core.mergeTargetOptions(target, configuration);
  const sources = core.sourcesFromBuildOptions(merged.options);
  const warnings = core.styleOverrideWarnings(
    target,
    merged.configuration,
    'cli-ws:build',
    'src/nfs-variants.d.ts',
  );

  try {
    const compiled = await core.compileSources(root, sources, 'cli-ws');
    const found = core.readProperties(compiled, 'cli-ws');

    return {
      sources: sources.stylesheets,
      properties: Object.fromEntries(
        [...found].map(([p, v]) => [p, norm(v.value.raw)]),
      ),
      warnings,
    };
  } catch (e) {
    return {
      sources: sources.stylesheets,
      error: e.message.split('\n')[0].slice(0, 400),
      warnings,
    };
  }
}

(async () => {
  const report = [];
  const only = process.env.CASES ? process.env.CASES.split(',') : null;

  try {
    for (const c of cases.filter((c) => !only || only.includes(c.name[0]))) {
      const angular = JSON.parse(angularText);
      const build = angular.projects['cli-ws'].architect.build;
      build.options.styles = c.styles;

      if (c.spo) {
        build.options.stylePreprocessorOptions = c.spo;
      } else {
        delete build.options.stylePreprocessorOptions;
      }

      if (c.prodStyles) {
        build.configurations.production.styles = c.prodStyles;
      }

      fs.writeFileSync('angular.json', JSON.stringify(angular, null, 2));
      const entry = {
        case: c.name,
        core: await coreProperties(build),
        builds: {},
      };

      for (const config of c.configs ?? ['production']) {
        fs.rmSync('dist', { recursive: true, force: true });
        const run = spawnSync(`npx ng build --configuration=${config}`, {
          shell: true,
          encoding: 'utf8',
          env: { ...process.env, NG_CLI_ANALYTICS: 'false' },
        });
        const text = (run.stdout + run.stderr).replace(/\x1b\[[0-9;]*m/g, '');
        const errorLine = text.split('\n').find((l) => /ERROR|Error:/.test(l));
        entry.builds[config] =
          run.status === 0
            ? builtProperties()
            : {
                failed: true,
                exit: run.status,
                error: (errorLine ?? '').trim().slice(0, 400),
              };
      }

      report.push(entry);
      console.log(JSON.stringify(entry, null, 2));
    }
  } finally {
    fs.writeFileSync('angular.json', angularText);
    fs.rmSync('dist', { recursive: true, force: true });
  }

  fs.writeFileSync(
    only
      ? '../logs/q3-resolution-' + only.join('-') + '.json'
      : '../logs/q3-resolution.json',
    JSON.stringify(report, null, 2) + '\n',
  );
})();
