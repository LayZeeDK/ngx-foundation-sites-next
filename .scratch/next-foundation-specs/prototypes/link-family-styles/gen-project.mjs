// PROTOTYPE: writes project.json (many near-identical configurations).
import { writeFileSync } from 'node:fs';

const sassOpts = { silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'if-function'] };
const includePaths = (...dirs) => ({ includePaths: [...dirs, 'apps/fixture/src/foundation-settings'], sass: sassOpts });
const lib = 'apps/fixture/src/lib/scss';
// CONSUMER CONFIGURATION: these entries and includePaths are all the consumer adds.
const families = ['button', 'callout', 'menu', 'dropdown-menu'].map((f) => ({
  input: `${lib}/${f}.scss`, bundleName: `nfs-${f}`, inject: false,
}));
const globals = [`${lib}/global.scss`, 'apps/fixture/src/styles.scss'];
const replace = (name) => [{ replace: 'apps/fixture/src/lib/switches.ts', with: `apps/fixture/src/lib/switches.${name}.ts` }];
const prod = (name, extra = {}) => ({ budgets: [], outputHashing: 'all', outputPath: `dist/apps/fixture-${name}`, ...extra });

const options = {
  outputPath: 'dist/apps/fixture-production',
  browser: 'apps/fixture/src/main.ts',
  server: 'apps/fixture/src/main.server.ts',
  tsConfig: 'apps/fixture/tsconfig.app.json',
  inlineStyleLanguage: 'scss',
  assets: [{ glob: '**/*', input: 'apps/fixture/public' }],
  styles: [...globals, ...families],
  stylePreprocessorOptions: includePaths(),
  outputMode: 'server',
  ssr: { entry: 'apps/fixture/src/server.ts' },
  security: { allowedHosts: [] },
};
const configurations = {
  production: prod('production'),
  unlayered: prod('unlayered', { stylePreprocessorOptions: includePaths('apps/fixture/src/foundation-settings-unlayered') }),
  cachebust: prod('cachebust', { stylePreprocessorOptions: includePaths('apps/fixture/src/foundation-settings-cachebust') }),
  // Attempt 1: the switch (server-rendered preloads; only when a family directive renders on the server).
  // Attempt 2: index.preload.html lists every family bundle.
  preload: prod('preload', { fileReplacements: replace('preload'), index: 'apps/fixture/src/index.preload.html' }),
  single: prod('single', {
    fileReplacements: replace('single'),
    styles: [...globals, { input: `${lib}/all.scss`, bundleName: 'nfs-families', inject: false }],
  }),
  subpath: prod('subpath', { baseHref: '/sub/' }),
  cdn: prod('cdn', { deployUrl: 'http://127.0.0.1:4696/cdn/' }),
  i18n: prod('i18n', { localize: true }),
  noskip: prod('noskip', { fileReplacements: replace('noskip') }),
};

const project = {
  name: 'fixture',
  $schema: '../../node_modules/nx/schemas/project-schema.json',
  projectType: 'application',
  prefix: 'nfs',
  sourceRoot: 'apps/fixture/src',
  tags: [],
  i18n: { sourceLocale: 'en-US', locales: { da: { translation: 'apps/fixture/src/locale/messages.da.json' } } },
  targets: {
    build: { executor: '@angular/build:application', outputs: ['{options.outputPath}'], defaultConfiguration: 'production', options, configurations },
    // The esbuild-plugin variant: Nx's executor, no per-family styles entries.
    'build-plugin': {
      executor: '@nx/angular:application',
      outputs: ['{options.outputPath}'],
      options: {
        ...options,
        outputPath: 'dist/apps/fixture-plugin',
        styles: globals,
        fileReplacements: [
          ...replace('plugin'),
          { replace: 'apps/fixture/src/lib/plugin-loaders.ts', with: 'apps/fixture/src/lib/plugin-loaders.plugin.ts' },
        ],
        plugins: [{ path: 'tools/nfs-esbuild-plugin.mjs', options: { includePaths: ['apps/fixture/src/foundation-settings'] } }],
        budgets: [],
        outputHashing: 'all',
      },
    },
  },
};
writeFileSync(new URL('./project.json', import.meta.url), JSON.stringify(project, null, 2) + '\n');
