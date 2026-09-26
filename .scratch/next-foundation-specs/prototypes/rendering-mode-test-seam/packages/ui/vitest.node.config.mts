import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';

// PROTOTYPE: a separate Vitest project in the plain `node` environment (no jsdom, no TestBed init)
// for the SSR smoke specs, run by the `test-node` target through @nx/vitest:test.
export default defineConfig({
  root: import.meta.dirname,
  plugins: [angular({ tsconfig: `${import.meta.dirname}/tsconfig.spec.json` })],
  test: {
    name: 'ui-node',
    environment: 'node',
    globals: true,
    include: ['src/**/*.ssr.spec.ts', 'src/**/*.node.spec.ts'],
    setupFiles: ['src/test-setup-node.ts'],
  },
});
