import nx, { loadWorkspaceRules } from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

// Load custom workspace ESLint rules from tools/eslint-rules
// See: https://nx.dev/docs/technologies/eslint/guides/custom-workspace-rules
const nfsRules = await loadWorkspaceRules('tools/eslint-rules');

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
          // sass is used by tools/build-component-css.mjs (not distributed)
          // Consumers using precompiled CSS don't need sass
          // Consumers using Sass theming already have sass via Angular CLI
          ignoredDependencies: ['sass'],
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
