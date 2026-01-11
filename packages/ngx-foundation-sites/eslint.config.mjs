import nx, { loadWorkspaceRules } from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

// Load custom workspace ESLint rules from tools/eslint-rules
// See: https://nx.dev/docs/technologies/eslint/guides/custom-workspace-rules
const nfsRules = await loadWorkspaceRules('tools/eslint-rules');

export default [
  // Ignore generated/bundled files (paths relative to project root)
  {
    ignores: [
      '**/.storybook/static/**', // Bundled Sass compiler
      '**/dist-css/**', // Compiled component CSS
    ],
  },
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
          // Build tools dependencies (not distributed to consumers)
          // - sass: used by tools/build-component-css.mjs
          // - esbuild*: used by tools/bundle-sass-compiler.mjs
          ignoredDependencies: [
            'sass',
            'esbuild',
            'esbuild-plugin-polyfill-node',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    // Apply custom rules to library component files only (exclude tests)
    files: ['**/src/lib/**/*.ts'],
    ignores: ['**/*.spec.ts', '**/*.test.ts'],
    plugins: {
      '@nfs': { rules: nfsRules },
    },
    rules: {
      // Enforce ViewEncapsulation.None for all library components
      '@nfs/require-view-encapsulation-none': 'error',
      // Enforce exportAs for template reference access
      '@nfs/require-export-as': 'error',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'nfs',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'nfs',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];
