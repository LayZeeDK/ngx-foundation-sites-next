// PROTOTYPE (ticket 197): writes project.json.
// - build (Angular CLI builder): 189's <link> loader, used for D (paint gate) and G (churn).
// - build-plugin (Nx executor): 192's proposal A, an owned <style> from the directive's chunk, used for G.
// - build-file (Nx executor): proposal E, the same plugin with esbuild's `file` loader, so the
//   directive module's import yields a hashed CSS asset URL that the library inserts as a <link>.
import { writeFileSync } from 'node:fs';

const sassOpts = { silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div', 'if-function'] };
const includePaths = (...dirs) => ({ includePaths: [...dirs, 'apps/fixture/src/foundation-settings'], sass: sassOpts });
const lib = 'apps/fixture/src/lib/scss';
// CONSUMER CONFIGURATION for the <link> loader: these entries and includePaths are all the consumer adds.
const families = ['button', 'callout', 'menu', 'dropdown-menu'].map((f) => ({
  input: `${lib}/${f}.scss`, bundleName: `nfs-${f}`, inject: false,
}));
const globals = [`${lib}/global.scss`, 'apps/fixture/src/styles.scss'];
const replace = (name) => [{ replace: 'apps/fixture/src/lib/switches.ts', with: `apps/fixture/src/lib/switches.${name}.ts` }];
// The directive modules import `../css/<family>`; the plugin builds swap in a re-export of
// `nfs-family-css:<family>` (a CSS string for A, a hashed asset URL for E).
const cssModules = ['button', 'callout', 'menu', 'dropdown-menu'].map((f) => ({
  replace: `apps/fixture/src/lib/css/${f}.ts`, with: `apps/fixture/src/lib/css/${f}.plugin.ts`,
}));
const prod = (name, extra = {}) => ({ budgets: [], outputHashing: 'all', outputPath: `dist/apps/fixture-${name}`, ...extra });
const plugin = (mode, ...dirs) => [
  { path: 'tools/nfs-esbuild-plugin.mjs', options: { mode, includePaths: [...dirs, 'apps/fixture/src/foundation-settings'] } },
];

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

const project = {
  name: 'fixture',
  $schema: '../../node_modules/nx/schemas/project-schema.json',
  projectType: 'application',
  prefix: 'nfs',
  sourceRoot: 'apps/fixture/src',
  tags: [],
  i18n: { sourceLocale: 'en-US', locales: { da: { translation: 'apps/fixture/src/locale/messages.da.json' } } },
  targets: {
    build: {
      executor: '@angular/build:application',
      outputs: ['{options.outputPath}'],
      defaultConfiguration: 'production',
      options,
      configurations: { production: prod('production') },
    },
    'build-plugin': {
      executor: '@nx/angular:application',
      outputs: ['{options.outputPath}'],
      options: {
        ...options,
        ...prod('plugin'),
        styles: globals,
        fileReplacements: [
          ...replace('plugin'),
          { replace: 'apps/fixture/src/lib/plugin-loaders.ts', with: 'apps/fixture/src/lib/plugin-loaders.plugin.ts' },
          ...cssModules,
        ],
        plugins: plugin('string'),
      },
    },
    'build-file': {
      executor: '@nx/angular:application',
      outputs: ['{options.outputPath}'],
      defaultConfiguration: 'production',
      options: {
        ...options,
        ...prod('file'),
        styles: globals,
        fileReplacements: [...replace('file'), ...cssModules],
        plugins: plugin('file'),
      },
      configurations: {
        production: prod('file'),
        subpath: prod('file-subpath', { baseHref: '/sub/' }),
        cdn: prod('file-cdn', { deployUrl: 'http://127.0.0.1:4795/cdn/' }),
        i18n: prod('file-i18n', { localize: true }),
        // Attempt 2 for deployUrl: the same builds with the URL resolved against the global stylesheet's directory.
        prefix: prod('file-prefix', { fileReplacements: [...replace('file-prefix'), ...cssModules] }),
        'subpath-prefix': prod('file-subpath-prefix', { baseHref: '/sub/', fileReplacements: [...replace('file-prefix'), ...cssModules] }),
        'cdn-prefix': prod('file-cdn-prefix', { deployUrl: 'http://127.0.0.1:4803/cdn/', fileReplacements: [...replace('file-prefix'), ...cssModules] }),
        'i18n-prefix': prod('file-i18n-prefix', { localize: true, fileReplacements: [...replace('file-prefix'), ...cssModules] }),
        cachebust: prod('file-cachebust', {
          stylePreprocessorOptions: includePaths('apps/fixture/src/foundation-settings-cachebust'),
          plugins: plugin('file', 'apps/fixture/src/foundation-settings-cachebust'),
        }),
      },
    },
  },
};
writeFileSync(new URL('./project.json', import.meta.url), JSON.stringify(project, null, 2) + '\n');
